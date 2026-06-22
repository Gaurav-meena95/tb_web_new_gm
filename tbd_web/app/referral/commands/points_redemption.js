"use strict";

// Wallet-points redemption for bookings (Premium / Flights / Hotels).
//
// Lifecycle:
//   reservePoints()   -> debits balance + writes a 'pending' hold when an order is created
//   attachOrderId()   -> links the hold to the razorpay order id once it exists
//   settleHold()      -> on payment.captured, marks the hold permanent (no balance change)
//   releaseHold()     -> on order-create failure / payment failure, refunds the balance
//   releaseStalePendingHolds() -> reaper for abandoned checkouts (refunds after TTL)
//
// All balance math is server-authoritative; the client never decides the discount.

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require("sequelize");
const writeSeqInstance = seqConfig.write_sequelize;
const appConstants = require("../../constants");

// 1 pt = ₹POINTS_TO_INR. Redeemable points are the MINIMUM of two caps (and the
// user's balance): POINTS_MAX_PERCENT of the order price, and
// POINTS_MAX_BALANCE_PERCENT of the user's total points balance.
const POINTS_TO_INR = Number(process.env.POINTS_TO_INR || 1);
const POINTS_MAX_PERCENT = Number(process.env.POINTS_MAX_PERCENT || 20); // % of order price
const POINTS_MAX_BALANCE_PERCENT =
    Number(process.env.POINTS_MAX_BALANCE_PERCENT || 20); // % of points balance
const POINTS_HOLD_TTL_MIN = Number(process.env.POINTS_HOLD_TTL_MIN || 30);
const REDEMPTION_ENABLED =
    String(process.env.POINTS_REDEMPTION_ENABLED || "true").toLowerCase() !== "false";

// Booking sources where points may be redeemed (must match razorpay-helper sources).
// NOTE: flights/hotels intentionally disabled for now — they keep their original
// flow; re-add "tboFlights"/"tboHotels" here when enabling points there.
const ELIGIBLE_SOURCES = new Set(["premium"]);

function isEligibleSource(source) {
    return ELIGIBLE_SOURCES.has(String(source || ""));
}

/*
    name: computeEligible
    description: Pure function — given a balance and the payable amount (in rupees),
                 returns how many points can be applied and the resulting rupee discount.
*/
function computeEligible(balance, payableRupees) {
    const bal = Math.max(0, Math.floor(Number(balance) || 0));
    const payable = Math.max(0, Math.floor(Number(payableRupees) || 0));
    if (!REDEMPTION_ENABLED || bal <= 0 || payable <= 0 || POINTS_TO_INR <= 0) {
        return { points: 0, discountRupees: 0 };
    }
    // Cap 1 — discount may not exceed POINTS_MAX_PERCENT of the order price.
    const maxPointsByOrder = Math.floor(
        Math.floor((payable * POINTS_MAX_PERCENT) / 100) / POINTS_TO_INR
    );
    // Cap 2 — user may spend at most POINTS_MAX_BALANCE_PERCENT of their balance.
    const maxPointsByBalance = Math.floor((bal * POINTS_MAX_BALANCE_PERCENT) / 100);
    // Apply the tightest of: order cap, balance cap, and the actual balance.
    const points = Math.min(bal, maxPointsByOrder, maxPointsByBalance);
    if (points <= 0) return { points: 0, discountRupees: 0 };
    return { points, discountRupees: points * POINTS_TO_INR };
}

/*
    name: releaseStalePendingHolds
    description: Refund pending holds older than the TTL (abandoned checkouts). Scope to a
                 single user when uid is given (cheap, lazy), else sweep everyone (cron).
*/
async function releaseStalePendingHolds(uid) {
    try {
        const cutoffSql = `NOW() - INTERVAL '${POINTS_HOLD_TTL_MIN} minutes'`;
        const userClause = uid ? "AND user_id = :uid" : "";
        await writeSeqInstance.transaction(async (t) => {
            const stale = await writeSeqInstance.query(
                `SELECT id, user_id, points FROM referral_v2_points_holds
                  WHERE status = 'pending' AND created_at < ${cutoffSql} ${userClause}
                  FOR UPDATE SKIP LOCKED`,
                {
                    replacements: uid ? { uid: Number(uid) } : {},
                    type: QueryTypes.SELECT,
                    transaction: t,
                }
            );
            for (const row of stale) {
                await _refundHoldRow(row, "booking_redeem_stale_release", t);
            }
        });
    } catch (error) {
        console.log("releaseStalePendingHolds error", error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
    }
}

// Refund a single (locked) hold row inside an open transaction: flip to released,
// credit the balance back, and write a positive ledger entry. Idempotent by caller.
async function _refundHoldRow(row, reason, t) {
    await writeSeqInstance.query(
        `UPDATE referral_v2_points_holds SET status = 'released' WHERE id = :id`,
        { replacements: { id: row.id }, type: QueryTypes.UPDATE, transaction: t }
    );
    await writeSeqInstance.query(
        `INSERT INTO referral_v2_points_wallet (user_id, balance, lifetime_earned, updated_at)
         VALUES (:uid, :pts, 0, NOW())
         ON CONFLICT (user_id) DO UPDATE
           SET balance = referral_v2_points_wallet.balance + EXCLUDED.balance,
               updated_at = NOW()`,
        {
            replacements: { uid: Number(row.user_id), pts: Number(row.points) },
            type: QueryTypes.INSERT,
            transaction: t,
        }
    );
    await writeSeqInstance.query(
        `INSERT INTO referral_v2_points_ledger (user_id, delta, reason, ref_id)
         VALUES (:uid, :delta, :reason, :ref)`,
        {
            replacements: {
                uid: Number(row.user_id),
                delta: Number(row.points),
                reason,
                ref: Number(row.id),
            },
            type: QueryTypes.INSERT,
            transaction: t,
        }
    );
}

/*
    name: reservePoints
    description: Atomically debit the wallet and create a 'pending' hold for the eligible
                 discount. Returns { holdId, points, discountRupees }; points=0 means nothing
                 was reserved (caller proceeds at full price).
*/
async function reservePoints({ userId, payableRupees, source }) {
    const uid = Number(userId);
    if (!uid || uid <= 0) return { holdId: null, points: 0, discountRupees: 0 };
    if (!isEligibleSource(source)) return { holdId: null, points: 0, discountRupees: 0 };

    // Refund any of this user's abandoned holds first so their balance is current.
    await releaseStalePendingHolds(uid);

    try {
        return await writeSeqInstance.transaction(async (t) => {
            const walletRows = await writeSeqInstance.query(
                `SELECT balance FROM referral_v2_points_wallet WHERE user_id = :uid FOR UPDATE`,
                { replacements: { uid }, type: QueryTypes.SELECT, transaction: t }
            );
            const balance = walletRows.length ? Number(walletRows[0].balance) : 0;

            const { points, discountRupees } = computeEligible(balance, payableRupees);
            if (points <= 0) return { holdId: null, points: 0, discountRupees: 0 };

            await writeSeqInstance.query(
                `UPDATE referral_v2_points_wallet
                    SET balance = balance - :pts, updated_at = NOW()
                  WHERE user_id = :uid`,
                { replacements: { uid, pts: points }, type: QueryTypes.UPDATE, transaction: t }
            );

            const insertedHold = await writeSeqInstance.query(
                `INSERT INTO referral_v2_points_holds
                     (user_id, points, discount_rupees, status, source)
                 VALUES (:uid, :pts, :disc, 'pending', :source)
                 RETURNING id`,
                {
                    replacements: { uid, pts: points, disc: discountRupees, source: String(source) },
                    type: QueryTypes.INSERT,
                    transaction: t,
                }
            );
            const holdId = insertedHold[0][0].id;

            await writeSeqInstance.query(
                `INSERT INTO referral_v2_points_ledger (user_id, delta, reason, ref_id)
                 VALUES (:uid, :delta, 'booking_redeem_hold', :ref)`,
                {
                    replacements: { uid, delta: -points, ref: Number(holdId) },
                    type: QueryTypes.INSERT,
                    transaction: t,
                }
            );

            return { holdId: Number(holdId), points, discountRupees };
        });
    } catch (error) {
        console.log("reservePoints error", error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        // Fail open: caller proceeds without a discount rather than blocking the booking.
        return { holdId: null, points: 0, discountRupees: 0 };
    }
}

/*
    name: attachOrderId
    description: Link a pending hold to the razorpay order id once the order exists.
*/
async function attachOrderId(holdId, orderId) {
    if (!holdId || !orderId) return false;
    const [, affected] = await writeSeqInstance.query(
        `UPDATE referral_v2_points_holds
            SET order_id = :oid
          WHERE id = :hid AND status = 'pending' AND order_id IS NULL`,
        { replacements: { oid: String(orderId), hid: Number(holdId) }, type: QueryTypes.UPDATE }
    );
    return true;
}

/*
    name: settleHold
    description: On payment.captured, finalize the hold for this order. No balance change
                 (already debited at reserve time). Idempotent + safe for non-points orders.
*/
async function settleHold(orderId) {
    if (!orderId) return null;
    try {
        const updated = await writeSeqInstance.query(
            `UPDATE referral_v2_points_holds
                SET status = 'settled', settled_at = NOW()
              WHERE order_id = :oid AND status = 'pending'
              RETURNING id, user_id, points`,
            { replacements: { oid: String(orderId) }, type: QueryTypes.SELECT }
        );
        const row = updated && updated[0] && updated[0][0];
        return row ? { holdId: Number(row.id), userId: Number(row.user_id), points: Number(row.points) } : null;
    } catch (error) {
        console.log("settleHold error", error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        return null;
    }
}

/*
    name: releaseHold
    description: Refund a pending hold by holdId (order-create failure) or orderId (payment
                 failure / manual). Idempotent: already settled/released holds are left alone.
*/
async function releaseHold({ holdId, orderId, userId, reason } = {}) {
    if (!holdId && !orderId) return false;
    try {
        return await writeSeqInstance.transaction(async (t) => {
            const conds = [holdId ? "id = :hid" : "order_id = :oid"];
            const replacements = holdId ? { hid: Number(holdId) } : { oid: String(orderId) };
            // When a userId is supplied (client-triggered cancel), only that user's
            // own hold may be released.
            if (userId) {
                conds.push("user_id = :uid");
                replacements.uid = Number(userId);
            }
            const rows = await writeSeqInstance.query(
                `SELECT id, user_id, points FROM referral_v2_points_holds
                  WHERE ${conds.join(" AND ")} AND status = 'pending'
                  FOR UPDATE`,
                {
                    replacements,
                    type: QueryTypes.SELECT,
                    transaction: t,
                }
            );
            if (!rows.length) return false;
            await _refundHoldRow(rows[0], reason || "booking_redeem_release", t);
            return true;
        });
    } catch (error) {
        console.log("releaseHold error", error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        return false;
    }
}

module.exports = {
    isEligibleSource,
    computeEligible,
    reservePoints,
    attachOrderId,
    settleHold,
    releaseHold,
    releaseStalePendingHolds,
    POINTS_TO_INR,
    POINTS_MAX_PERCENT,
    POINTS_MAX_BALANCE_PERCENT,
    REDEMPTION_ENABLED,
};
