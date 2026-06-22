"use strict";

// Client-triggered refund of a wallet-points hold when the user cancels the
// Razorpay sheet (no payment attempted). Safe against abuse: we refuse to refund
// if the order already has a real payment, so a user can't cancel-to-refund and
// then still pay the discounted order. Settlement (payment.captured webhook)
// handles the genuinely-paid case.

const razorPayHelper = require("../../razorpay-helper");
const pointsRedemption = require("./points_redemption");
const appConstants = require("../../constants");

const PAID_STATUSES = new Set(["captured", "authorized"]);

module.exports = async function releaseBookingHold({ plainUserId, orderId } = {}) {
    const userId = Number(plainUserId);
    if (!userId || userId <= 0) {
        return { status: "error", responseCode: 401, errorMessage: "unauthorized" };
    }
    const oid = orderId ? String(orderId) : "";
    if (!oid) {
        return { status: "error", responseCode: 400, errorMessage: "order_id_required" };
    }

    try {
        // If any payment on this order is captured/authorized, the discount is
        // being paid for — do NOT refund the points (settlement will finalize).
        let paid = false;
        try {
            const payments = await razorPayHelper.getPaymentsByOrderId(oid);
            const items = (payments && payments.items) || [];
            paid = items.some((p) => PAID_STATUSES.has(p && p.status));
        } catch (e) {
            // Razorpay lookup failed — be conservative and skip the refund. The
            // TTL reaper will refund later if the order was truly abandoned.
            console.error("[points] release-hold: razorpay lookup failed", e && e.message);
            paid = true;
        }

        if (paid) {
            return {
                status: "success",
                responseCode: 200,
                object: { released: false, reason: "payment_in_progress" },
            };
        }

        const released = await pointsRedemption.releaseHold({
            orderId: oid,
            userId,
            reason: "booking_redeem_user_cancelled",
        });
        console.log("[points] release-hold (user cancel)", { orderId: oid, userId, released });
        return { status: "success", responseCode: 200, object: { released } };
    } catch (error) {
        console.log("releaseBookingHold error", error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        return { status: "error", responseCode: 500, errorMessage: error.message };
    }
};
