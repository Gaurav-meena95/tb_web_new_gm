"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const { count } = require("console");
const readSeqInstance = seqConfig.read_sequelize;
const apiHlpr = require('../../api-helper');
const appConstants = require("../../constants");

const getOrders = async (payload) => {
    try {

        if (typeof payload != 'object') {
            payload = {};
        }

        let loggedInUserId = appConstants.LOGGED_IN_USER_ID;

        let whereCondn = "";
        let filters = [];

        if (payload.userId) {
            let decryptedUserId = apiHlpr.decrypt(payload.userId.toString());
            filters.push(" booking_user_id = " + decryptedUserId);
        }
        else {
            //ADDING FILTER TO CURRENT USERID
            filters.push(" booking_user_id = " + loggedInUserId);
        }
        if (payload.bookingId) {
            filters.push(" experience_booking.id = " + payload.bookingId);
        }
        if (filters.length > 0) {
            whereCondn = " and " + filters.join(" and ");
        }

        let qry = 'SELECT users.user_full_name as "hostName", users.primary_id "hostId", users.user_phone_number "hostPhoneNumber", users.user_display_picture "userDisplayPicture", experience.id "experienceId", experience.meeting_instructions "meetingInstructions", experience.host_instructions "hostInstructions", experience.title "expTitle", experience.location, experience_booking.id, experience_booking.no_of_tickets "noOfTickets", experience_booking.booking_id "bookingId", experience_booking.status "bookingStatus",experience_booking.host_confirmed "hostConfirmed", experience_booking.transaction_amount amount,date(experience_calendar_slots.slot_date) "slotDate", ' + "TO_CHAR(experience_calendar_slots.start_time, 'HH24:MI')" +  ' AS "startTime", experience_calendar_slots.end_time "endTime" FROM experience,users,experience_calendar_slots,experience_booking where experience.host_id = users.primary_id and experience.id = experience_calendar_slots.experience_id and experience_booking.calendar_slot_id = experience_calendar_slots.id and experience_booking.status = ' + " 'complete' " + whereCondn + ' order by experience_booking.updated_on desc';
        let bookings = await readSeqInstance.query(
            qry,
            { type: QueryTypes.SELECT }
        );

        for (var i = 0; i < bookings.length; i++) {
            bookings[i].hostId = apiHlpr.encrypt(bookings[i].hostId);
        }

        return { status: "success", "responseCode": 200, list: bookings };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getOrders;
