"use strict";

const ReferralCodes = require("../models/referral_codes");
const { generateUniqueCode } = require("../utils/code_generator");
const appConstants = require("../../constants");

function buildShareUrl(code) {
    // Explicit override wins. Otherwise derive from NODE_ENV so the dev
    // deployment serves dev links and the prod deployment serves prod links
    // — same code, no per-env tweaking needed.
    const explicit = (process.env.REFERRAL_LINK_DOMAIN || "").trim();
    let domain = explicit;
    if (!domain) {
        const env = (process.env.NODE_ENV || "").toLowerCase();
        domain = env === "dev"
            ? "https://dev.beatravelbuddy.com"
            : "https://beatravelbuddy.com";
    }
    const normalized = domain.replace(/\/+$/, "");
    return `${normalized}/r/${code}`;
}

const getOrCreateMyCode = async (payload) => {
    try {
        const userId = Number(payload && payload.plainUserId);
        if (!userId || userId <= 0) {
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "unauthorized",
            };
        }

        const existing = await ReferralCodes.findOne({ where: { user_id: userId } });
        if (existing) {
            return {
                status: "success",
                responseCode: 200,
                object: {
                    code: existing.code,
                    share_url: existing.share_url,
                },
            };
        }

        const code = await generateUniqueCode(async (candidate) => {
            const hit = await ReferralCodes.findOne({ where: { code: candidate } });
            return !!hit;
        });

        const shareUrl = buildShareUrl(code);

        try {
            const row = await ReferralCodes.create({
                user_id: userId,
                code,
                share_url: shareUrl,
            });
            return {
                status: "success",
                responseCode: 200,
                object: { code: row.code, share_url: row.share_url },
            };
        } catch (insertErr) {
            // Race: another request created the row first. Return whatever is now persisted.
            const reread = await ReferralCodes.findOne({ where: { user_id: userId } });
            if (reread) {
                return {
                    status: "success",
                    responseCode: 200,
                    object: { code: reread.code, share_url: reread.share_url },
                };
            }
            throw insertErr;
        }
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

module.exports = getOrCreateMyCode;
