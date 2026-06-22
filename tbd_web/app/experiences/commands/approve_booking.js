"use strict";

const seqConfig = require("../../config/sequelize_config");
const ExpBooking = require("../models/experience_booking");
const ExpCancelBooking = require("../models/experience_booking_cancel");
const { QueryTypes } = require("sequelize");
const readSeqInstance = seqConfig.read_sequelize;
const sendEmail = require('../../send-email');
const appConstants = require("../../constants");

const cancelExperienceBooking = async (payload) => {
    try {
        if (!payload.userId) {
            payload.userId = appConstants.LOGGED_IN_USER_ID;
        }
        let loggedInUserId = payload.userId;

        let bookingUserDetails = await readSeqInstance.query(
            "select booking_user_id, experience_booking.booking_id bookingId, experience.location, experience_booking.created_on as bookingDate, experience.host_id, experience.title bookingName, experience_booking.transaction_amount bookingAmount, experience_booking.created_on bookedOn, experience_calendar_slots.slot_date slotDate from experience, experience_calendar_slots, experience_booking where experience.id = experience_calendar_slots.experience_id and experience_booking.calendar_slot_id = experience_calendar_slots.id and experience_booking.status = 'complete' and experience_booking.id = $1 and experience.host_id = $2",
            { bind: [payload.bookingId, payload.userId], type: QueryTypes.SELECT }
        );

        if (bookingUserDetails.length == 0) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage:
                    "This booking is not belongs to you",
            };
        }
        let expCancel = "host_cancelled";
        if (payload.status == "confirm") {
            //Updating status DATA TO EXPERIENCE BOOKING TABLE
            let updateBooking = {
                host_confirmed: 1,
            };

            let expView = await ExpBooking.update(updateBooking, {
                where: { id: payload.bookingId },
            });

        } else if (payload.status == "cancel") {
            expCancel = "host_cancelled";
            let bookedOn = bookingUserDetails[0].bookedOn;
            let bookedBy = bookingUserDetails[0].booking_user_id;
            let slotDate = bookingUserDetails[0].slotDate;
            let bookingName = bookingUserDetails[0].bookingName;
            let bookingDate = bookingUserDetails[0].bookingDate;
            let location = bookingUserDetails[0].location;
            let bookingId = bookingUserDetails[0].bookingId;

            //USER CAN NOT CANCEL A SLOT WHICH IS ALREADY OUTDATED.
            if (Date.now() >= Date.parse(slotDate)) {
                return {
                    status: "error",
                    responseCode: 400,
                    errorMessage:
                        "Host can not cancel booking which is already outdated.",
                };
            }

            let amountToBeRefunded = bookingUserDetails[0].bookingAmount;

            //Updating status DATA TO EXPERIENCE BOOKING TABLE
            let updateBooking = {
                status: expCancel,
            };

            expView = await ExpBooking.update(updateBooking, {
                where: { id: payload.bookingId },
            });

            //INSERTING DATA TO EXPERIENCE BOOKING CANCEL TABLE
            let newCancel = {
                booking_id: payload.bookingId,
                cancelled_by: 'host',
                comment: payload.comment,
                refund_amount: amountToBeRefunded,
                booking_date: bookingDate
            };
            let bookingCancl = await ExpCancelBooking.create(newCancel);

            //UNCOMMENT BELOW CODE ONCE THE TEMPLATES ARE READY 
            /*
            //SEND EMAILS TO USER AND ADMIN
            users = await readSeqInstance.query(
                "select primary_id, user_email, user_full_name from users where primary_id = $1",
                { bind: [bookedBy], type: QueryTypes.SELECT }
            );
            userName = users[i].user_full_name;
            userEmail = users[i].user_email;
            let tplData = {
                full_name: userName,
                user_name: userName,
                booking_name: bookingName,
                booking_date: bookingDate,
                cancellation_date: new Date().toString(),
                booking_destination: location,
                booking_id: bookingId,
                refund_amount: amountToBeRefunded
            }
            sendEmail(hostEmail, tplData, "bookingCanceledByUserToHost", appConstants.ADMIN_EMAIL);
            console.log('email sent');
            */

        }


        return {
            status: "success",
            responseCode: 200,
            object: { experienceId: payload.bookingId },
        };
    } catch (error) {
        console.log("Error Occured: " + error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = cancelExperienceBooking;
