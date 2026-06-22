-- Run on PostgreSQL (write instance). Adds the referral v2 schema: each
-- user gets one unique code, redemptions are tracked per referee (one ever),
-- and a points wallet + append-only ledger record balances. Lives alongside
-- the legacy PHP referral_codes / referral_conversions tables without touching
-- them.

CREATE TABLE IF NOT EXISTS referral_v2_codes (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT      NOT NULL UNIQUE,
    code            VARCHAR(10) NOT NULL UNIQUE,
    share_url       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_v2_codes_code
    ON referral_v2_codes (code);

CREATE TABLE IF NOT EXISTS referral_v2_redemptions (
    id                  BIGSERIAL PRIMARY KEY,
    referrer_user_id    BIGINT      NOT NULL,
    referee_user_id     BIGINT      NOT NULL UNIQUE,
    code                VARCHAR(10) NOT NULL,
    referrer_points     INT         NOT NULL,
    referee_points      INT         NOT NULL,
    source              VARCHAR(32) NOT NULL,
    redeemed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_no_self_referral CHECK (referrer_user_id <> referee_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_v2_redemptions_referrer
    ON referral_v2_redemptions (referrer_user_id);

CREATE TABLE IF NOT EXISTS referral_v2_points_wallet (
    user_id          BIGINT      PRIMARY KEY,
    balance          INT         NOT NULL DEFAULT 0,
    lifetime_earned  INT         NOT NULL DEFAULT 0,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_v2_points_ledger (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL,
    delta       INT         NOT NULL,
    reason      VARCHAR(48) NOT NULL,
    ref_id      BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_v2_points_ledger_user
    ON referral_v2_points_ledger (user_id, created_at DESC);
