'use strict';

/**
 * Singleton Supabase admin client (service role). Never import in browser code.
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * `require('@supabase/supabase-js')` runs on first use so the process can boot
 * before `npm install` adds the dependency.
 */

let _admin;

function supabaseAdmin() {
	const { createClient } = require('@supabase/supabase-js');
	const url = process.env.SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		throw new Error(
			'Supabase admin: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
		);
	}
	if (!_admin) {
		_admin = createClient(url, key, {
			auth: { autoRefreshToken: false, persistSession: false },
		});
	}
	return _admin;
}

function isSupabaseAdminConfigured() {
	return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

module.exports = { supabaseAdmin, isSupabaseAdminConfigured };
