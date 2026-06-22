"use strict";

const seqConfig = require("../../config/sequelize_config");
const apiHelper = require("../../api-helper");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const writeSeqInstance = seqConfig.write_sequelize;
require('dotenv').config();
const appConstants = require("../../constants");

const fetchOTP = async (post) => {
    try {
        if (post.hasOwnProperty('email') && post.hasOwnProperty('phoneNumber')){

            
            const users = await readSeqInstance.query(
                "SELECT primary_id, user_status FROM users WHERE user_email = $1 and user_phone_number = $2",
                { bind: [email, phoneNumber], type: QueryTypes.SELECT }
                );
            let response = '';
            if (users.length > 0) {
                const newOTP = generateOTP();
                const userId = users[0].primary_id;
                const updatedRec = await writeSeqInstance.query(
                    "update users set otp = $1 where primary_id = $2",
                    { bind: [newOTP, userId], type: QueryTypes.UPDATE}
                );
                const object = { token: apiHelper.encrypt(token), role: role };
                response = { response: 'success', responseCode: 200, otp: newOTP};
            } else {
                response = { response: 'error', responseCode: 452, errorMessage: 'Invalid Credentials' };
            }
        }
 
    } catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

function generateOTP() {
          
    // Declare a digits variable 
    // which stores all digits
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

module.exports = fetchOTP;

