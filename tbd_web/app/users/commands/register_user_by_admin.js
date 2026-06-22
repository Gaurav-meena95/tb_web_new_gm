"use strict";

const seqConfig = require("../../config/sequelize_config");
const { Op } = require('sequelize');
const crypto = require('crypto');
const writeSeqInstance = seqConfig.write_sequelize;
const appConstants = require("../../constants");
const users = require('../models/users');
const utils = require("../../utils");

const registerUserByAdmin = async (payload) => {
    try {

        //NOTE:
        //EDITING SHOULD BE DONE BY THE SAME PERSON OR BY THE ADMIN
        
        let isAdmin = await utils.isUserAdmin(payload.plainUserId);
        if (!isAdmin) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }

        let foundItem = await users.findOne(
            { 
                where:{ 
                    [Op.or]: [
                    { user_email: payload.userEmail}, 
                    {user_phone_number: payload.userPhoneNumber}
                    ]
                }
            });

        if (foundItem) {
            return {
                status: "warning",
                responseCode: 200,
                errorMessage: 'Phone number/ email already registered!'
            };
        } else {

            function convertToMD5(str) {
                const md5Hash = crypto.createHash('md5');
                md5Hash.update(str);
                return md5Hash.digest('hex');
            }

            let newRec = {
                user_full_name: payload.userFullName,
                phone_dial_code: payload.phoneDialCode,
                user_phone_number: payload.userPhoneNumber,
                app_version: payload.appVersion,
                user_email: payload.userEmail,
                user_password: convertToMD5(payload.userPassword),
                user_gender: payload.userGender,
                user_status: payload.userStatus? payload.userStatus: 1,
                user_type: payload.userType? payload.userType: 0
            };
    
            const newUser = await users.create(newRec);
            return {
                status: "success",
                responseCode: 200,
                object: { userId: newUser.primary_id },
            };
            
        }
       
    } catch (error) {
        console.log("Error Occured: " + error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = registerUserByAdmin;
