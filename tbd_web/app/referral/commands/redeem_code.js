"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require("sequelize");
const writeSeqInstance = seqConfig.write_sequelize;
const readSeqInstance = seqConfig.read_sequelize;
const ReferralCodes = require("../models/referral_codes");
const appConstants = require("../../constants");

const REFERRER_POINTS = Number(process.env.REFERRAL_POINTS_REFERRER || 100);
const REFEREE_POINTS = Number(process.env.REFERRAL_POINTS_REFEREE || 50);
const WINDOW_DAYS = Number(process.env.REFERRAL_REDEMPTION_WINDOW_DAYS || 7);

const ALLOWED_SOURCES = new Set([
    "onboarding_deeplink",
    "onboarding_manual",
    "onboarding_play_referrer",
]);

const redeemCode = async (payload) => {
    try {
        const refereeUserId = Number(payload && payload.plainUserId);
        if (!refereeUserId || refereeUserId <= 0) {
            return { status: "error", responseCode: 401, errorMessage: "unauthorized" };
        }

        const rawCode = (payload && payload.code ? String(payload.code) : "").trim().toUpperCase();
        if (!rawCode) {
            return { status: "error", responseCode: 400, errorMessage: "code_required" };
        }

        const source = payload && payload.source ? String(payload.source) : "onboarding_manual";
        if (!ALLOWED_SOURCES.has(source)) {
            return { status: "error", responseCode: 400, errorMessage: "invalid_source" };
        }

        const codeRow = await ReferralCodes.findOne({ where: { code: rawCode } });
        if (!codeRow) {
            return { status: "error", responseCode: 404, errorMessage: "code_not_found" };
        }

        const referrerUserId = Number(codeRow.user_id);
        if (referrerUserId === refereeUserId) {
            return { status: "error", responseCode: 400, errorMessage: "self_referral" };
        }

        const refereeRows = await readSeqInstance.query(
            "SELECT profile_creation_time FROM users WHERE primary_id = :uid LIMIT 1",
            { replacements: { uid: refereeUserId }, type: QueryTypes.SELECT }
        );
        if (refereeRows.length === 0 || !refereeRows[0].profile_creation_time) {
            return { status: "error", responseCode: 404, errorMessage: "referee_not_found" };
        }
        const profileCreationTime = new Date(refereeRows[0].profile_creation_time);
        const ageMs = Date.now() - profileCreationTime.getTime();
        const windowMs = WINDOW_DAYS * 24 * 60 * 60 * 1000;
        if (ageMs > windowMs) {
            return { status: "error", responseCode: 400, errorMessage: "redemption_window_expired" };
        }

        try {
            const redemptionId = await writeSeqInstance.transaction(async (t) => {
                const insertRedemption = `
                    INSERT INTO referral_v2_redemptions
                        (referrer_user_id, referee_user_id, code, referrer_points, referee_points, source)
                    VALUES (:referrer, :referee, :code, :refPts, :reePts, :source)
                    RETURNING id
                `;
                const insertedRows = await writeSeqInstance.query(insertRedemption, {
                    replacements: {
                        referrer: referrerUserId,
                        referee: refereeUserId,
                        code: rawCode,
                        refPts: REFERRER_POINTS,
                        reePts: REFEREE_POINTS,
                        source,
                    },
                    type: QueryTypes.INSERT,
                    transaction: t,
                });
                const newRedemptionId = insertedRows[0][0].id;

                const upsertWallet = `
                    INSERT INTO referral_v2_points_wallet (user_id, balance, lifetime_earned, updated_at)
                    VALUES (:uid, :pts, :pts, NOW())
                    ON CONFLICT (user_id) DO UPDATE
                      SET balance = referral_v2_points_wallet.balance + EXCLUDED.balance,
                          lifetime_earned = referral_v2_points_wallet.lifetime_earned + EXCLUDED.lifetime_earned,
                          updated_at = NOW()
                `;
                await writeSeqInstance.query(upsertWallet, {
                    replacements: { uid: referrerUserId, pts: REFERRER_POINTS },
                    type: QueryTypes.INSERT,
                    transaction: t,
                });
                await writeSeqInstance.query(upsertWallet, {
                    replacements: { uid: refereeUserId, pts: REFEREE_POINTS },
                    type: QueryTypes.INSERT,
                    transaction: t,
                });

                const insertLedger = `
                    INSERT INTO referral_v2_points_ledger (user_id, delta, reason, ref_id)
                    VALUES (:uid, :delta, :reason, :ref)
                `;
                await writeSeqInstance.query(insertLedger, {
                    replacements: {
                        uid: referrerUserId,
                        delta: REFERRER_POINTS,
                        reason: "referral_referrer",
                        ref: newRedemptionId,
                    },
                    type: QueryTypes.INSERT,
                    transaction: t,
                });
                await writeSeqInstance.query(insertLedger, {
                    replacements: {
                        uid: refereeUserId,
                        delta: REFEREE_POINTS,
                        reason: "referral_referee",
                        ref: newRedemptionId,
                    },
                    type: QueryTypes.INSERT,
                    transaction: t,
                });

                return newRedemptionId;
            });

            return {
                status: "success",
                responseCode: 200,
                object: {
                    redemption_id: Number(redemptionId),
                    referrer_user_id: referrerUserId,
                    referee_points: REFEREE_POINTS,
                    referrer_points: REFERRER_POINTS,
                },
            };
        } catch (txErr) {
            const pgCode =
                (txErr && txErr.original && txErr.original.code) ||
                (txErr && txErr.parent && txErr.parent.code) ||
                null;
            if (pgCode === "23505") {
                return { status: "error", responseCode: 409, errorMessage: "already_redeemed" };
            }
            if (pgCode === "23514") {
                return { status: "error", responseCode: 400, errorMessage: "self_referral" };
            }
            throw txErr;
        }
    } catch (error) {
        console.log(error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        return { status: "error", responseCode: 500, errorMessage: error.message };
    }
};

module.exports = redeemCode;
