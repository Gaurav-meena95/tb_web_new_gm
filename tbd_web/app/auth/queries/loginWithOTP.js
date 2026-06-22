"use strict";

const seqConfig = require("../../config/sequelize_config");
const apiHelper = require("../../api-helper");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
require('dotenv').config();
const appConstants = require("../../constants");
const utils = require("../../utils");

const EXPIRE_IN = process.env.EXPIRE_IN;

const loginWithOTP = async (post) => {
    try {
        let deviceUniqueID;
        if (post.hasOwnProperty('deviceUniqueId'))
            deviceUniqueID = post.deviceUniqueId;
        else
            deviceUniqueID = null;

        const deviceType = post.deviceType;

        let vendorID;
        if (post.hasOwnProperty('vendorUUID'))
            vendorID = post.vendorUUID;
        else
            vendorID = null;

        let appVersion;
        if (post.hasOwnProperty('appVersion'))
            appVersion = post.appVersion;
        else
            appVersion = null;

        if (post.hasOwnProperty('email') && post.hasOwnProperty('phoneNumber') && post.hasOwnProperty('otp')){
            console.log("Login Existing User..");
            const email = post.email;
            const phoneNumber = post.phoneNumber;
            const otp = post.otp;
            return loginExistingUser(email, phoneNumber, otp, deviceId, vendorID, deviceType);
        } else {
            const response = {
                response: 'error',
                responseCode: 406,
                errorMessage: 'Wrong arguments'
            };
            return response;
        }
 
    } catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

async function loginExistingUser(email, phoneNumber, otp, deviceId, vendorID, deviceType) {
    console.log("Login Existing User");
    const users = await readSeqInstance.query(
        "SELECT primary_id, user_status FROM users WHERE user_email = $1 and user_phone_number = $2 and otp = $3",
        { bind: [email, phoneNumber, otp], type: QueryTypes.SELECT }
    );
    let response = '';
    if (users.length > 0) {
        let role = null;
        const userId = users[0].primary_id;
        const userStatus = users[0].user_status;

        if (userStatus === 1)
            role = "traveller";
        else if (userStatus === 2)
            role = "blocked";
        else if (userStatus === 3)
            role = "admin";
        else if (userStatus === 4)
        role = "local influencer";
        else if (userStatus === 5)
            role = "blocked";
        else if (userStatus === 6)
            role = "moderator";
        else if (userStatus === 7)
            role = "local influencer";
        else
            role = "guest";

        if (userStatus === 2) { // user blocked
            console.log("HTTP/1.1 200 Ok");
            response = { response: 'blocked', responseCode: 410 };
        } else {
            const token = getToken(userId);
            utils.updateSession(userId, deviceId, vendorID, deviceType, token);
            const object = { token: apiHelper.encrypt(token), role: role };
            response = { response: 'success', responseCode: 200, object: object, expiry: EXPIRE_IN };
        }
    } else {
        response = { response: 'error', responseCode: 452, errorMessage: 'Invalid Credentials' };
    }
    return response;
}

module.exports = loginWithOTP;

