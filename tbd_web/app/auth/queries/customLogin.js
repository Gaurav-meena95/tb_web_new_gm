"use strict";

const seqConfig = require("../../config/sequelize_config");
const apiHelper = require("../../api-helper");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const writeSeqInstance = seqConfig.write_sequelize;
const session = require('../models/sessions');
const userAttributes = require('../models/user-attributes');
const { getToken } = require('../commands/jwtValidation');
const crypto = require('crypto');
require('dotenv').config();
const Joi = require('joi');
const appConstants = require("constants");

const EXPIRE_IN = process.env.EXPIRE_IN;

const customLogin = async (post) => {
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

        if (post.hasOwnProperty('deviceType') && post.hasOwnProperty('isGuestUser') && post.isGuestUser == "true") {
            console.log("Login Guest User..");
            const isRedirectedFromGuest = true;
            try {
                const userId = 0; // 0 is the system account id
                const token = getToken(userId);
                const object = { token: token, isNewUser: isRedirectedFromGuest, role: "guest" };
                const response = {
                    response: 'success',
                    responseCode: 200,
                    object: object,
                    expiry: EXPIRE_IN
                };
                return response;
            } catch (ex) {
                console.log('Message: ' + ex.message);
            }
        } else {
            // not a guest login
            console.log("Login Existing User..");
            const isRedirectedFromGuest = false;
            if (post.hasOwnProperty('phoneNumber') && post.hasOwnProperty('password')) {
                return loginExistingUserByPhone(deviceType, post.phoneNumber, post.password, post.deviceId, vendorID, isRedirectedFromGuest);
            } else if (post.hasOwnProperty('email') && post.hasOwnProperty('password')) {
                return loginExistingUser(deviceType, post.email, post.password, post.deviceId, vendorID, isRedirectedFromGuest);
            } else {
                const response = {
                    response: 'error',
                    responseCode: 406,
                    errorMessage: 'Wrong arguments'
                };
                return response;
            }
        }

    } catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

function normalizeDeviceType(deviceType) {
    if (deviceType === "android" || deviceType === 0) return "0";
    if (deviceType === "ios" || deviceType === 1) return "1";
    if (deviceType === "web" || deviceType === 2) return "2";
    return String(deviceType ?? "2");
}

async function loginExistingUserByPhone(deviceType, phoneNumber, password, deviceId, vendorID, isNewUser) {
    console.log("Login Existing User by Phone");
    let response;
    if (phoneNumber && password) {
        deviceType = normalizeDeviceType(deviceType);
        const users = await readSeqInstance.query(
            "SELECT primary_id, user_status, user_full_name FROM users WHERE user_phone_number = $1 AND user_password = $2",
            { bind: [phoneNumber, convertToMD5(password)], type: QueryTypes.SELECT }
        );
        if (users.length > 0) {
            const userId = users[0].primary_id;
            const userStatus = users[0].user_status;
            const userName = users[0].user_full_name ?? null;
            let role = "guest";
            if (userStatus === 1) role = "traveller";
            else if (userStatus === 2) role = "blocked";
            else if (userStatus === 3) role = "admin";
            else if (userStatus === 4 || userStatus === 7) role = "local influencer";
            else if (userStatus === 5) role = "blocked";
            else if (userStatus === 6) role = "moderator";

            if (userStatus === 2) {
                response = { response: 'blocked', responseCode: 410 };
            } else {
                const { getToken } = require('../commands/jwtValidation');
                const token = getToken(userId);
                updateSession(userId, deviceId, vendorID, deviceType, token);
                const object = { token: apiHelper.encrypt(token), isNewUser: isNewUser, role: role, user_full_name: userName };
                response = { response: 'success', responseCode: 200, object: object, expiry: EXPIRE_IN };
            }
        } else {
            response = { response: 'error', responseCode: 452, errorMessage: 'Invalid Credentials' };
        }
    } else {
        response = { response: 'error', responseCode: 406, errorMessage: 'Wrong arguments' };
    }
    return response;
}

async function loginExistingUser(deviceType, email, password, deviceId, vendorID, isNewUser) {
    console.log("Login Existing User");
    let response;
    if (email && password) {
        if (email !== '' && password !== '') {
            const encryptedPassword = convertToMD5(password);
            deviceType = normalizeDeviceType(deviceType);

            const users = await readSeqInstance.query(
                "SELECT primary_id, user_status, user_full_name FROM users WHERE user_email = $1 AND user_password = $2",
                { bind: [email, convertToMD5(password)], type: QueryTypes.SELECT }
            );
            if (users.length > 0) {
                let role = null;
                const userId = users[0].primary_id;
                const userStatus = users[0].user_status;
                const userName = users[0].user_full_name ?? null;

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
                    updateSession(userId, deviceId, vendorID, deviceType, token);
                    const object = { token: apiHelper.encrypt(token), isNewUser: isNewUser, role: role, user_full_name: userName };
                    response = { response: 'success', responseCode: 200, object: object, expiry: EXPIRE_IN };
                }
            } else {
                response = { response: 'error', responseCode: 452, errorMessage: 'Invalid Credentials' };
            }
        } else {
            response = { response: 'error', responseCode: 406, errorMessage: 'Mandatory Parameters not Provided (Email, Password, Device ID, and Unique Device Identifier)' };
        }
    } else {
        response = { response: 'error', responseCode: 406, errorMessage: 'Wrong arguments' };
    }
    return response;
}

async function updateSession(userId, deviceId, vendorID, deviceType, token) {
    console.log("Update Session");
    let newRec = {
        user_id: userId,
        user_device_id: deviceId,
        device_unique_id: vendorID,
        device_type: deviceType,
        token: token
    };
    let foundItem = await session.findOne({ where: { user_id: userId, device_unique_id: vendorID } });
    console.log('after found item' + JSON.stringify(foundItem));
    let sess;
    if (!foundItem) {
        sess = await session.create(newRec);
    } else {
        sess = await session.update(newRec, { where: { session_id: foundItem.session_id } });
    }
    // Generate Profile Name
    console.log(userId + deviceType);
    const genProfileName = await writeSeqInstance.query(
        "call sp_generateProfileName($1,$2)",
        { bind: [userId, deviceType], type: QueryTypes.INSERT }
    );
    sess = await userAttributes.update({ device_type: deviceType + 1 }, { where: { user_id: userId } });
}

function convertToMD5(str) {
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(str);
    return md5Hash.digest('hex');
}

module.exports = customLogin;

