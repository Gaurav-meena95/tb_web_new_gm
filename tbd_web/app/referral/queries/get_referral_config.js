"use strict";

// Public (no-auth) config for the referral feature: points + display copy.
// Served pre-login because onboarding shows it before the user has a token.

const { buildReferralConfig } = require("../referral_config");
const appConstants = require("../../constants");

const getReferralConfig = async () => {
    try {
        return {
            status: "success",
            responseCode: 200,
            object: buildReferralConfig(),
        };
    } catch (error) {
        console.log(error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        return { status: "error", responseCode: 500, errorMessage: error.message };
    }
};

module.exports = getReferralConfig;
