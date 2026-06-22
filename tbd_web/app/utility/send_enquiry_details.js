"use strict";

const appConstants = require("../constants");
const mailObj = require('../send-email');

const getUsersFollowInfo = async (payload) => {
    try {
        /*if (appConstants.LOGGED_IN_USER_ID == -1) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request",
            };
        }*/

        payload.toEmailAddr = appConstants.EMAILIDS_FOR_ENQUIRY;
        payload.subject = 'Enquiry From Buddy';
        mailObj.sendCustomEmail(payload);

        return {
            status: "success",
            responseCode: 200,
            mailSent: true
        };
    } catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", responseCode: 400, message: error.message, mailSent: false};
    }
};

module.exports = getUsersFollowInfo;
