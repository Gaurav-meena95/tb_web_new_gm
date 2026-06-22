'use strict';

const { write_sequelize, read_sequelize } = require('../config/sequelize_config');

/**
 * Upsert a flight booking payment intent before opening Razorpay checkout.
 *
 * @param {object} params
 * @param {string} params.plainUserId
 * @param {string} params.orderId
 * @param {string} [params.snapshotJson] optional JSON string (audit / future use)
 */
async function registerIntent({ plainUserId, orderId, snapshotJson }) {
  const snapshot = snapshotJson || '{}';
  const uid = String(plainUserId || '0');
  await write_sequelize.query(
    `INSERT INTO flight_booking_payment_intents
      (razorpay_order_id, plain_user_id, snapshot_json, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (razorpay_order_id) DO UPDATE SET
       plain_user_id = EXCLUDED.plain_user_id,
       snapshot_json = EXCLUDED.snapshot_json,
       updated_at = NOW()`,
    { bind: [orderId, uid, snapshot] },
  );
  return { ok: true };
}

/**
 * Mark payment captured (idempotent). Called from Razorpay webhook.
 */
async function markPaymentCaptured({
  orderId,
  paymentId,
  webhookEventId,
  payloadExcerpt,
}) {
  const excerpt =
    payloadExcerpt && payloadExcerpt.length > 4000
      ? payloadExcerpt.slice(0, 4000)
      : payloadExcerpt || null;
  await write_sequelize.query(
    `UPDATE flight_booking_payment_intents
     SET razorpay_payment_id = COALESCE($1, razorpay_payment_id),
         payment_captured_at = COALESCE(
           payment_captured_at,
           NOW()
         ),
         webhook_event_id = COALESCE($2, webhook_event_id),
         webhook_payload_excerpt = COALESCE($3, webhook_payload_excerpt),
         updated_at = NOW()
     WHERE razorpay_order_id = $4`,
    { bind: [paymentId, webhookEventId || null, excerpt, orderId] },
  );
  return { ok: true };
}

/**
 * Mark client booking pipeline finished (after book/ticket APIs succeed).
 */
async function markClientFulfilled({ orderId, plainUserId }) {
  const uid = String(plainUserId || '0');
  await write_sequelize.query(
    `UPDATE flight_booking_payment_intents
     SET client_fulfilled_at = NOW(),
         updated_at = NOW()
     WHERE razorpay_order_id = $1
       AND plain_user_id = $2`,
    { bind: [orderId, uid] },
  );
  return { ok: true };
}

/**
 * Read intent for authenticated user (status polling after payment).
 */
/**
 * True when the app registered a v2 server-fulfillment snapshot for this order.
 * Used to forbid client-side book/ticketing while the webhook worker may still run.
 * @param {string|null|undefined} snapshotJson
 */
function parseExpectsServerFulfillment(snapshotJson) {
  try {
    const s = JSON.parse(snapshotJson || '{}');
    return (
      Number(s.version) === 2 &&
      s.fulfillmentMode === 'server'
    );
  } catch (_) {
    return false;
  }
}

async function getIntentForUser({ orderId, plainUserId }) {
  const uid = String(plainUserId || '0');
  const [rows] = await read_sequelize.query(
    `SELECT razorpay_order_id,
            plain_user_id,
            razorpay_payment_id,
            payment_captured_at,
            client_fulfilled_at,
            created_at,
            updated_at,
            snapshot_json,
            server_fulfillment_status,
            server_fulfillment_error,
            server_fulfillment_started_at,
            server_fulfillment_finished_at,
            server_fulfillment_result_json
     FROM flight_booking_payment_intents
     WHERE razorpay_order_id = $1
       AND plain_user_id = $2
     LIMIT 1`,
    { bind: [orderId, uid] },
  );
  const row = rows && rows[0];
  if (!row) {
    return null;
  }
  let serverBookingResponse = null;
  if (row.server_fulfillment_result_json) {
    try {
      const parsed = JSON.parse(row.server_fulfillment_result_json);
      serverBookingResponse = parsed.client_booking_response || null;
    } catch (_) {
      serverBookingResponse = null;
    }
  }
  return {
    orderId: row.razorpay_order_id,
    paymentId: row.razorpay_payment_id,
    paymentCaptured: !!row.payment_captured_at,
    clientFulfilled: !!row.client_fulfilled_at,
    paymentCapturedAt: row.payment_captured_at,
    clientFulfilledAt: row.client_fulfilled_at,
    serverFulfillmentStatus: row.server_fulfillment_status,
    serverFulfillmentError: row.server_fulfillment_error,
    serverFulfilled: row.server_fulfillment_status === 'succeeded',
    serverBookingResponse,
    expectsServerFulfillment: parseExpectsServerFulfillment(row.snapshot_json),
  };
}

/**
 * Worker read (no user scope). Includes snapshot_json.
 * @param {{ orderId: string }} params
 */
async function getIntentRowByOrderId({ orderId }) {
  const [rows] = await write_sequelize.query(
    `SELECT razorpay_order_id,
            plain_user_id,
            snapshot_json,
            server_fulfillment_status,
            server_fulfillment_started_at,
            server_fulfillment_finished_at
     FROM flight_booking_payment_intents
     WHERE razorpay_order_id = $1
     LIMIT 1`,
    { bind: [orderId] },
  );
  return rows && rows[0] ? rows[0] : null;
}

async function markServerFulfillmentStarted({ orderId }) {
  await write_sequelize.query(
    `UPDATE flight_booking_payment_intents
     SET server_fulfillment_status = 'processing',
         server_fulfillment_started_at = COALESCE(
           server_fulfillment_started_at,
           NOW()
         ),
         updated_at = NOW()
     WHERE razorpay_order_id = $1`,
    { bind: [orderId] },
  );
  return { ok: true };
}

/**
 * @param {{ orderId: string, status: string, error: string|null, resultJson: string|null }} params
 */
async function markServerFulfillmentFinished({
  orderId,
  status,
  error,
  resultJson,
}) {
  await write_sequelize.query(
    `UPDATE flight_booking_payment_intents
     SET server_fulfillment_status = $1,
         server_fulfillment_error = $2,
         server_fulfillment_finished_at = NOW(),
         server_fulfillment_result_json = $3,
         updated_at = NOW()
     WHERE razorpay_order_id = $4`,
    { bind: [status, error, resultJson, orderId] },
  );
  return { ok: true };
}

module.exports = {
  registerIntent,
  markPaymentCaptured,
  markClientFulfilled,
  getIntentForUser,
  getIntentRowByOrderId,
  markServerFulfillmentStarted,
  markServerFulfillmentFinished,
};
