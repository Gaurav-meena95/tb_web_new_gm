'use strict';

/**
 * Chat V2 — Node routes (prefix /api/chat-v2).
 *
 * POST /api/chat-v2/auth/supabase-token
 *   Headers: Authorization: Bearer <appJwt>, x-api-key (must match TBD_FLUTTER_API_KEY)
 *   Body: optional JSON {}
 *   Response: { supabase_token: "<jwt>" }
 *
 * POST /api/chat-v2/users/resolve-ids
 *   Headers: Authorization: Bearer <appJwt>, x-api-key
 *   Body: { userIds: ["enc1", "enc2", ...] }
 *   Response: { resolved: { "enc1": "1234", "enc2": "5678" } }
 *   Decrypts AES-256-CBC encrypted userIds (from search API) → plain numeric IDs.
 *
 * POST /api/chat-v2/webhooks/new-message
 *   Header: X-Webhook-Secret (must match CHAT_V2_WEBHOOK_SECRET)
 *   Body: Supabase webhook payload { record, ... }
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validateToken } = require('../auth/commands/jwtValidation');
const { supabaseAdmin, isSupabaseAdminConfigured } = require('./supabase_admin');
const sendNotification = require('../notification');
const seqConfig = require('../config/sequelize_config');
const { QueryTypes } = require('sequelize');
const readDb = seqConfig.read_sequelize;

const RATE_LIMIT_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateBuckets = new Map();

function rateLimitOk(userId) {
	const now = Date.now();
	let b = rateBuckets.get(userId);
	if (!b || now > b.resetAt) {
		b = { count: 0, resetAt: now + RATE_LIMIT_MS };
		rateBuckets.set(userId, b);
	}
	if (b.count >= RATE_LIMIT_MAX) {
		return false;
	}
	b.count += 1;
	return true;
}

function assertFlutterApiKey(req, res) {
	const want = process.env.TBD_FLUTTER_API_KEY;
	const got = req.headers['x-api-key'] || req.headers['X-API-Key'];
	if (!want) {
		res.status(503).json({
			error: 'server_misconfigured',
			message: 'Set TBD_FLUTTER_API_KEY to match Flutter ApiConstants.apiKey',
		});
		return false;
	}
	if (got !== want) {
		res.status(401).json({ error: 'invalid_api_key' });
		return false;
	}
	return true;
}

function postSupabaseToken(req, res) {
	if (!assertFlutterApiKey(req, res)) {
		return;
	}

	const userId = validateToken(req.headers);
	if (!userId || userId <= 0) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	if (!rateLimitOk(userId)) {
		return res.status(429).json({
			error: 'rate_limited',
			message: 'Too many token requests. Try again later.',
		});
	}

	const secret = process.env.SUPABASE_JWT_SECRET;
	if (!secret) {
		return res.status(503).json({
			error: 'server_misconfigured',
			message: 'Set SUPABASE_JWT_SECRET (Supabase Dashboard → API → JWT Secret)',
		});
	}

	// Must match Supabase TEXT user_id / RLS auth.uid()::text and Flutter
	// PlainUserIdService (same value as setUserNode plainUserId / primary_id).
	const sub = String(userId);

	const nowSec = Math.floor(Date.now() / 1000);
	const supabaseToken = jwt.sign(
		{
			sub,
			role: 'authenticated',
			aud: 'authenticated',
			iss: 'supabase',
			iat: nowSec,
			exp: nowSec + 86400,
		},
		secret,
		{ algorithm: 'HS256' },
	);

	return res.status(200).json({ supabase_token: supabaseToken });
}

/**
 * Supabase Database Webhook (messages INSERT) → FCM fan-out (extend here).
 */
async function postWebhookNewMessage(req, res) {
	const want = process.env.CHAT_V2_WEBHOOK_SECRET;
	const got = req.headers['x-webhook-secret'] || req.headers['X-Webhook-Secret'];
	if (!want || got !== want) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	const record = req.body && req.body.record;
	if (!record || record.is_deleted) {
		return res.status(200).end();
	}

	if (!isSupabaseAdminConfigured()) {
		// eslint-disable-next-line no-console
		console.warn(
			'[chat-v2] webhook: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set; skipping fan-out',
		);
		return res.status(200).end();
	}

	try {
		const db = supabaseAdmin();

		// 1. Fetch recipients (non-muted members who didn't send this message).
		const { data: members, error: membersError } = await db
			.from('conversation_members')
			.select('user_id')
			.eq('conversation_id', record.conversation_id)
			.eq('is_muted', false)
			.neq('user_id', record.sender_id);

		if (membersError) {
			console.error('[chat-v2] webhook members query:', membersError.message);
			return res.status(200).end();
		}
		if (!members || members.length === 0) {
			return res.status(200).end();
		}

		// 2. Fetch conversation metadata from Supabase.
		const { data: conv } = await db
			.from('conversations')
			.select('group_name, type')
			.eq('id', record.conversation_id)
			.single();

		// 3. Fetch sender display name + avatar from the main PG DB.
		const senderRows = await readDb.query(
			'SELECT user_full_name, user_display_picture_original FROM users WHERE primary_id = $1 LIMIT 1',
			{ bind: [record.sender_id], type: QueryTypes.SELECT },
		);
		const sender = senderRows[0] || {};
		const senderName = sender.user_full_name || 'Someone';
		const senderAvatar = sender.user_display_picture_original || '';

		const isGroup = conv?.type === 'group';
		const convName = conv?.group_name || (isGroup ? 'Group' : senderName);

		// 4. Build the notification body based on message type.
		let body;
		switch (record.type) {
			case 'image': body = '📷 Photo'; break;
			case 'video': body = '🎥 Video'; break;
			case 'audio': body = '🎵 Voice message'; break;
			case 'document': body = `📄 ${record.file_name || 'Document'}`; break;
			case 'gif':    body = '🎞️ GIF'; break;
			default:       body = record.content || 'New message';
		}

		// 5. Build the FCM payload using the type strings Flutter already handles:
		//    'chat_v2'       → NotificationType.chatV2   → /chats-v2/:id
		//    'group_chat_v2' → NotificationType.groupChatV2 → /chats-v2/:id
		const notifType = isGroup ? 'group_chat_v2' : 'chat_v2';
		const payload = {
			type:    notifType,
			title:   isGroup ? `${senderName} in ${convName}` : senderName,
			body,
			id:      record.conversation_id,   // Flutter uses this as conversationId
			imageUrl: senderAvatar,
		};

		console.log(
			`[chat-v2] webhook: message ${record.id} → ${members.length} recipients`,
		);

		// 6. Fan out — sendNotification looks up FCM token from sessions.user_device_id.
		await Promise.all(
			members.map((m) => sendNotification(m.user_id, payload).catch((err) => {
				console.error(`[chat-v2] FCM send failed for user ${m.user_id}:`, err.message || err);
			})),
		);
	} catch (e) {
		console.error('[chat-v2] webhook:', e.message || e);
	}

	return res.status(200).end();
}

/**
 * Decrypts a single AES-256-CBC encrypted userId (as returned by the PHP
 * search API) back to the plain numeric primary_id string.
 * Returns null if decryption fails or input is not a valid encrypted value.
 */
function decryptUserId(encryptedUserId) {
	const encryptSecretKey = process.env.ENCRYPTION_SECRET_KEY;
	if (!encryptedUserId || !encryptSecretKey) return null;
	try {
		const encryptionKey = crypto.createHash('sha256').update(encryptSecretKey).digest();
		const iv = Buffer.from(encryptedUserId.slice(0, 32), 'hex');
		if (iv.length !== 16) return null;
		const encryptedText = encryptedUserId.slice(32);
		const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
		let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted || null;
	} catch (_) {
		return null;
	}
}

/**
 * POST /api/chat-v2/users/resolve-ids
 * Body: { userIds: string[] }  — encrypted userIds from the search API
 * Returns: { resolved: { encryptedId: plainNumericId } }
 */
function postResolveUserIds(req, res) {
	if (!assertFlutterApiKey(req, res)) return;

	const userId = validateToken(req.headers);
	if (!userId || userId <= 0) {
		return res.status(401).json({ error: 'unauthorized' });
	}

	const { userIds } = req.body || {};
	if (!Array.isArray(userIds)) {
		return res.status(400).json({ error: 'userIds must be an array' });
	}

	const resolved = {};
	for (const encId of userIds) {
		if (typeof encId === 'string' && encId.length > 0) {
			const plain = decryptUserId(encId);
			if (plain) resolved[encId] = plain;
		}
	}

	return res.status(200).json({ resolved });
}

module.exports = function registerChatV2Routes(app) {
	app.post('/api/chat-v2/auth/supabase-token', postSupabaseToken);
	app.post('/api/chat-v2/users/resolve-ids', postResolveUserIds);
	app.post('/api/chat-v2/webhooks/new-message', postWebhookNewMessage);
};
