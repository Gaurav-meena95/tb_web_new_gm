"use strict";

const ReferralPointsWallet = require("../models/referral_points_wallet");
const appConstants = require("../../constants");

const getMyWallet = async (payload) => {
    try {
        const userId = Number(payload && payload.plainUserId);
        if (!userId || userId <= 0) {
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "unauthorized",
            };
        }

        // NOTE: stale-hold refunds happen inside reservePoints (and a cron), NOT
        // here — this read is depended on by many screens and must stay a pure,
        // dependency-free SELECT so wallet balance always loads.
        const row = await ReferralPointsWallet.findOne({ where: { user_id: userId } });
        const balance = row ? Number(row.balance) : 0;
        const lifetimeEarned = row ? Number(row.lifetime_earned) : 0;

        return {
            status: "success",
            responseCode: 200,
            object: { balance, lifetime_earned: lifetimeEarned },
        };
    } catch (error) {
        console.log(error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        return {
            status: "error",
            responseCode: 500,
            errorMessage: error.message,
        };
    }
};

module.exports = getMyWallet;
