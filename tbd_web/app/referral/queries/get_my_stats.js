"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require("sequelize");
const readSeqInstance = seqConfig.read_sequelize;
const ReferralPointsWallet = require("../models/referral_points_wallet");
const appConstants = require("../../constants");

const RECENT_LIMIT = 10;

const getMyStats = async (payload) => {
    try {
        const userId = Number(payload && payload.plainUserId);
        if (!userId || userId <= 0) {
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "unauthorized",
            };
        }

        const wallet = await ReferralPointsWallet.findOne({ where: { user_id: userId } });
        const pointsEarned = wallet ? Number(wallet.lifetime_earned) : 0;

        const countRows = await readSeqInstance.query(
            "SELECT COUNT(*)::int AS total FROM referral_v2_redemptions WHERE referrer_user_id = :uid",
            { replacements: { uid: userId }, type: QueryTypes.SELECT }
        );
        const totalReferrals = countRows.length > 0 ? Number(countRows[0].total) : 0;

        const recentRows = await readSeqInstance.query(
            `SELECT r.referee_user_id, r.redeemed_at, r.referrer_points, u.user_full_name
             FROM referral_v2_redemptions r
             LEFT JOIN users u ON u.primary_id = r.referee_user_id
             WHERE r.referrer_user_id = :uid
             ORDER BY r.redeemed_at DESC
             LIMIT :lim`,
            {
                replacements: { uid: userId, lim: RECENT_LIMIT },
                type: QueryTypes.SELECT,
            }
        );

        const recentReferees = recentRows.map((r) => ({
            user_id: Number(r.referee_user_id),
            display_name: r.user_full_name,
            points_earned: Number(r.referrer_points),
            redeemed_at: r.redeemed_at,
        }));

        return {
            status: "success",
            responseCode: 200,
            object: {
                total_referrals: totalReferrals,
                points_earned: pointsEarned,
                recent_referees: recentReferees,
            },
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

module.exports = getMyStats;
