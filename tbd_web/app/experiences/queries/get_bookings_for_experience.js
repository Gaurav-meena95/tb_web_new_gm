"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const apiHlpr = require('../../api-helper');
const appConstants = require("../../constants");

const getBookingsForExp = async (payload) => {
    try {

        if (typeof payload != 'object') {
            payload = {};
        }

        let loggedInUserId = appConstants.LOGGED_IN_USER_ID;

        let whereCondn = "";
        let filters = [];

        if (payload.userId) {
            //decryptedUserId = apiHlpr.decrypt(payload.userId.toString());
            let decryptedUserId = payload.userId;
            filters.push(" host_id = " + decryptedUserId);
        }
        else {
            //ADDING FILTER TO CURRENT USERID
            filters.push(" host_id = " + loggedInUserId);
        }
        if (payload.experienceId) {
            filters.push(" experience.id = " + payload.experienceId);
        }
        if (filters.length > 0) {
            whereCondn = " and " + filters.join(" and ");
        }

        let qry = "SELECT users.user_full_name as user_name, users.user_phone_number user_phone_number, experience_booking.id, experience_booking.no_of_tickets no_of_tickets, experience_booking.booking_id, experience_booking.status booking_status,experience_booking.host_confirmed, experience_booking.transaction_amount amount,date(experience_calendar_slots.slot_date) slot_date, TO_CHAR(experience_calendar_slots.start_time, 'HH24:MI:SS')  start_time, experience_calendar_slots.end_time FROM experience,users,experience_calendar_slots,experience_booking where experience_booking.booking_user_id = users.primary_id and experience.id = experience_calendar_slots.experience_id and experience_booking.calendar_slot_id = experience_calendar_slots.id and experience_booking.status = 'complete' " + whereCondn + " order by experience_booking.updated_on desc";
        console.log(qry);
        let bookings = await readSeqInstance.query(
            qry,
            { type: QueryTypes.SELECT }
        );

        return { status: "success", "responseCode": 200, list: bookings };
    }
    catch (error) {
        console.log(error.message);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getBookingsForExp;