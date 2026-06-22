"use strict";

// Read-only preview: given a payable amount (rupees), tells the app how many wallet
// points would be applied and the resulting discount — same rule the order path uses,
// so the toggle UI shows an exact figure without duplicating the economics client-side.

const ReferralPointsWallet = require("../models/referral_points_wallet");
const pointsRedemption = require("../commands/points_redemption");
const appConstants = require("../../constants");

const getRedeemPreview = async (payload) => {
    try {
        const userId = Number(payload && payload.plainUserId);
        if (!userId || userId <= 0) {
            return { status: "error", responseCode: 401, errorMessage: "unauthorized" };
        }

        const amountRupees = Number(payload && payload.amount);
        const source = payload && payload.source;

        const row = await ReferralPointsWallet.findOne({ where: { user_id: userId } });
        const balance = row ? Number(row.balance) : 0;

        const eligibleSource = pointsRedemption.isEligibleSource(source);
        const { points, discountRupees } = eligibleSource
            ? pointsRedemption.computeEligible(balance, amountRupees)
            : { points: 0, discountRupees: 0 };

        return {
            status: "success",
            responseCode: 200,
            object: {
                balance,
                eligible: pointsRedemption.REDEMPTION_ENABLED && eligibleSource,
                points,
                discount: discountRupees,
                points_to_inr: pointsRedemption.POINTS_TO_INR,
                max_percent: pointsRedemption.POINTS_MAX_PERCENT,
            },
        };
    } catch (error) {
        console.log(error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        return { status: "error", responseCode: 500, errorMessage: error.message };
    }
};

module.exports = getRedeemPreview;
