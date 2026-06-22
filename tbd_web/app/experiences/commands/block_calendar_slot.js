"use strict";

const ExpBookingStaging = require("../models/experience_booking_staging");
const ExpBooking = require("../models/experience_booking");
const seq = require("sequelize");
const { QueryTypes } = require('sequelize');
const seqConfig = require("../../config/sequelize_config");
const readSeqInstance = seqConfig.read_sequelize;
const apiHelper = require('../../api-helper');
const appConstants = require("../../constants");

const blockCalendarSlot = async (payload) => {
    try {
        //payload.userId = apiHelper.decrypt(payload.userId);
        payload.userId = appConstants.LOGGED_IN_USER_ID;

        //GET EXPERIENCE ID FROM CALENDAR SLOT ID
        let experience = await readSeqInstance.query(
            "select experience.id from experience, experience_calendar_slots where experience_calendar_slots.experience_id = experience.id and experience_calendar_slots.id = $1",
            { bind: [payload.calendarSlotId], type: QueryTypes.SELECT }
        );

        if (experience.length < 0) {
            return { "status": "error", "responseCode": 400, 'errorMessage': 'Experience is no more active.' };
        }
        let expId = experience[0].id;

        //GETTING AVAILABLE TICKETS BEFORE BLOCKING
        let availTkts = await readSeqInstance.query(
            "select * from sp_getTicketsAvailable($1)",
            { bind: [payload.calendarSlotId], type: QueryTypes.SELECT }
        );

        if (availTkts[0].ticketsavailable < payload.noOfTickets) {
            return { "status": "error", "responseCode": 400, 'errorMessage': 'Not Enough Tickets For Booking' };
        }

        //INSERTING DATA TO EXPERIENCE BOOKING STAGING TABLE
        let newSlot = {
            calendar_slot_id: payload.calendarSlotId,
            user_id: payload.userId,
            no_of_tickets: payload.noOfTickets,
            res_start_time: seq.literal('CURRENT_TIMESTAMP'),
            res_end_time: seq.literal("CURRENT_TIMESTAMP + interval '10 minutes'")
        }
        const slotBooked = await ExpBookingStaging.create(newSlot);

        //INSERTING DATA TO EXPERIENCE BOOKING TABLE WITH status as payment_Pending
        let newBooking = {
            calendar_slot_id: payload.calendarSlotId,
            booking_user_id: payload.userId,
            no_of_tickets: payload.noOfTickets,
            invoice_id: "",
            status: 'payment_pending',
            transaction_id: "",
            transaction_amount: payload.amount
        }
        const experienceBooking = await ExpBooking.create(
            newBooking
        );
        return { status: "success", "responseCode": 200, object: experienceBooking };
    }
    catch (error) {
        console.log("Error in block calendar: " + error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = blockCalendarSlot;
