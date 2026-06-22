"use strict";

const flightBookings = require("../models/tbo_flight_bookings");
const appConstants = require("constants");
const seqConfig = require("../../config/sequelize_config");
const readSeqInstance = seqConfig.read_sequelize;
const utils = require("../../utils");
const { QueryTypes } = require('sequelize');
const genInvoice = require("../../gen_invoice");

const sendFlightDetails = async (payload) => {
    try {

        if (payload.plainUserId == undefined || payload.plainUserId == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }

        let isAdmin = await utils.isUserAdmin(payload.plainUserId);
        let whereCondition = {};
        if (!isAdmin) {
            whereCondition = { user_id: payload.plainUserId, pnr: payload.pnr};
        }else{
            whereCondition = { pnr: payload.pnr};
        }
        let flightBookingInfo = await flightBookings.findOne({ where: whereCondition});

        let userEmail = '';
        if (isAdmin && payload.userEmail){
            userEmail = payload.userEmail;
        }

        if (userEmail == ''){
            let userInfo = await readSeqInstance.query(
                "select  phone_dial_code, user_phone_number, user_email from users where users.primary_id = $1",
                { bind: [payload.plainUserId], type: QueryTypes.SELECT }
            );
            userEmail = userInfo[0].user_email;
        }
        console.log('Sending Invoice to', userEmail);
        await genInvoice.sendInvoice(userEmail, flightBookingInfo.booking_info);
        return { status: "success", "responseCode": 200, message: 'Invoice Mail Sent Succesfully.' };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = sendFlightDetails;
