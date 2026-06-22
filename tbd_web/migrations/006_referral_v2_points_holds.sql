-- Run on PostgreSQL (write instance). Backs wallet-points redemption on bookings.
-- Points are RESERVED (balance debited) when a Razorpay order is created with a
-- discount, then SETTLED when payment.captured fires, or RELEASED (refunded) if
-- the order is abandoned/fails. The hold row is the audit trail; balance deltas
-- are also written to referral_v2_points_ledger.

CREATE TABLE IF NOT EXISTS referral_v2_points_holds (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_id VARCHAR(64) UNIQUE,            -- razorpay order id; NULL until order created
    points INTEGER NOT NULL,                 -- points reserved (1 pt = ₹1)
    discount_rupees INTEGER NOT NULL,        -- rupee discount applied to the order
    status VARCHAR(16) NOT NULL DEFAULT 'pending', -- pending | settled | released
    source VARCHAR(32),                      -- premium | tboFlights | tboHotels
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_points_holds_user
    ON referral_v2_points_holds (user_id);

-- Used by the stale-hold reaper to find abandoned reservations to refund.
CREATE INDEX IF NOT EXISTS idx_points_holds_pending
    ON referral_v2_points_holds (status, created_at)
    WHERE status = 'pending';
