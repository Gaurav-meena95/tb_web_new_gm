-- Run on PostgreSQL (write instance). Records flight checkout rows so
-- Razorpay webhooks can mark payment captured even if the app misses SDK
-- callbacks (common on iOS 3DS / card flows).

CREATE TABLE IF NOT EXISTS flight_booking_payment_intents (
    id BIGSERIAL PRIMARY KEY,
    razorpay_order_id VARCHAR(64) NOT NULL UNIQUE,
    plain_user_id VARCHAR(128) NOT NULL,
    snapshot_json TEXT,
    razorpay_payment_id VARCHAR(64),
    payment_captured_at TIMESTAMPTZ,
    client_fulfilled_at TIMESTAMPTZ,
    webhook_event_id VARCHAR(128),
    webhook_payload_excerpt TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fbp_intents_plain_user
    ON flight_booking_payment_intents (plain_user_id);

CREATE INDEX IF NOT EXISTS idx_fbp_intents_payment_captured
    ON flight_booking_payment_intents (payment_captured_at)
    WHERE payment_captured_at IS NOT NULL;
