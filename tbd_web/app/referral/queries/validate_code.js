"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require("sequelize");
const readSeqInstance = seqConfig.read_sequelize;
const ReferralCodes = require("../models/referral_codes");
const appConstants = require("../../constants");

const validateCode = async (payload) => {
    try {
        const rawCode = (payload && payload.code ? String(payload.code) : "").trim().toUpperCase();
        if (!rawCode) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "code_required",
            };
        }

        if (!/^[A-HJ-NP-Z2-9]{4,10}$/.test(rawCode)) {
            return {
                status: "success",
                responseCode: 200,
                object: { valid: false, reason: "invalid_format" },
            };
        }

        const row = await ReferralCodes.findOne({ where: { code: rawCode } });
        if (!row) {
            return {
                status: "success",
                responseCode: 200,
                object: { valid: false, reason: "not_found" },
            };
        }

        const refereeUserId = Number(payload && payload.plainUserId);
        if (refereeUserId > 0 && Number(row.user_id) === refereeUserId) {
            return {
                status: "success",
                responseCode: 200,
                object: { valid: false, reason: "self_referral" },
            };
        }

        const nameRows = await readSeqInstance.query(
            "SELECT user_full_name FROM users WHERE primary_id = :uid LIMIT 1",
            {
                replacements: { uid: row.user_id },
                type: QueryTypes.SELECT,
            }
        );
        const referrerDisplayName = nameRows.length > 0 ? nameRows[0].user_full_name : null;

        return {
            status: "success",
            responseCode: 200,
            object: {
                valid: true,
                referrer_user_id: Number(row.user_id),
                referrer_display_name: referrerDisplayName,
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

module.exports = validateCode;
