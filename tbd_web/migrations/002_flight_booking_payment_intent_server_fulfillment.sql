-- Server-side TBO fulfillment after Razorpay payment.captured (webhook worker).
ALTER TABLE flight_booking_payment_intents
  ADD COLUMN IF NOT EXISTS server_fulfillment_status VARCHAR(32),
  ADD COLUMN IF NOT EXISTS server_fulfillment_error TEXT,
  ADD COLUMN IF NOT EXISTS server_fulfillment_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS server_fulfillment_finished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS server_fulfillment_result_json TEXT;

COMMENT ON COLUMN flight_booking_payment_intents.server_fulfillment_status IS
  'pending | processing | succeeded | failed | skipped (no v2 snapshot)';
