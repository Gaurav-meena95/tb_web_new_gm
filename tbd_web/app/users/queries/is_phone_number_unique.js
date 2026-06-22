"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("../../constants");

const isPhoneNumberUnique = async (payload) => {
    try {
        if (!payload.phoneNumber || !payload.dialCode){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }
        //payload.userId = appConstants.LOGGED_IN_USER_ID;

        let qry = "select * from users where user_phone_number = $1 and phone_dial_code = $2";
        let usersWithSamePhoneNumber = await readSeqInstance.query(
            qry,
            { bind: [payload.phoneNumber, payload.dialCode], type: QueryTypes.SELECT }
        );

        let phoneNumberInUse = usersWithSamePhoneNumber.length > 0? true : false;  
        
        return { status: "success", "responseCode": 200, "phoneNumberInUse": phoneNumberInUse };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, errorMessage: error.message };
    }
};

module.exports = isPhoneNumberUnique;
