"use strict";

const seqConfig = require("../../config/sequelize_config");
const ExpBooking = require("../models/experience_booking");
const ExpBookingStaging = require("../models/experience_booking_staging");
const ExpCancelBooking = require("../models/experience_booking_cancel");
const { QueryTypes } = require("sequelize");
const readSeqInstance = seqConfig.read_sequelize;
const sendEmail = require('../../send-email');
const apiHelper = require('../../api-helper');
const appConstants = require("../../constants");

const cancelExperienceBooking = async (payload) => {
    try {
        //payload.userId = apiHelper.decrypt(payload.userId);
        payload.userId = appConstants.LOGGED_IN_USER_ID;

        //BELOW LINE SHOULD BE REPLACED WITH AUTHENTICATE USERID FROM JWT
        let loggedInUserId = payload.userId;

        let userDetails = await readSeqInstance.query(
            "select user_status from users where primary_id = $1",
            { bind: [loggedInUserId], type: QueryTypes.SELECT }
        );

        let expCancel = "user_cancelled";
        let expBookCancelStat = "user";
        let bookingUserDetails = await readSeqInstance.query(
            "select booking_user_id, experience_booking.booking_id booking_id, experience.location, experience_booking.created_on as booking_date, experience.host_id, experience.title booking_name, experience_booking.transaction_amount booking_amount, experience_booking.created_on booked_on, experience_calendar_slots.slot_date slot_date from experience, experience_calendar_slots, experience_booking where experience.id = experience_calendar_slots.experience_id and experience_booking.calendar_slot_id = experience_calendar_slots.id and experience_booking.status = 'complete' and experience_booking.id = $1",
            { bind: [payload.bookingId], type: QueryTypes.SELECT }
        );

        if (bookingUserDetails.length == 0) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage:
                    "This booking is not completed",
            };
        }

        let bookedBy = bookingUserDetails[0].booking_user_id;
        let hostBy = bookingUserDetails[0].booking_user_id;

        let isUserCancelled = false;

        if (userDetails[0].user_status != 3) {
            if (bookingUserDetails[0].booking_user_id == loggedInUserId) {
                expCancel = "user_cancelled";
                expBookCancelStat = "user";
                isUserCancelled = true;
            } else if (bookingUserDetails[0].host_id == loggedInUserId) {
                expCancel = "host_cancelled";
                expBookCancelStat = "host";
            } else {
                return {
                    status: "error",
                    responseCode: 400,
                    errorMessage:
                        "Booking can be canceled by either user or host",
                };
            }
        } else {
            if (bookingUserDetails[0].booking_user_id != loggedInUserId) {
                expCancel = "admin_cancelled";
                expBookCancelStat = "admin";
            } else {
                isUserCancelled = true;
            }
        }

        let bookedOn = bookingUserDetails[0].booked_on;
        let slotDate = bookingUserDetails[0].slot_date;
        let bookingName = bookingUserDetails[0].booking_name;
        let bookingDate = bookingUserDetails[0].booking_date;
        let location = bookingUserDetails[0].location;
        let bookingId = bookingUserDetails[0].booking_id;

        //USER CAN NOT CANCEL A SLOT WHICH IS ALREADY OUTDATED.
        if (Date.now() >= Date.parse(slotDate)) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage:
                    "User can not cancel a slot which is already outdated.",
            };
        }

        let dateDiffInHrs = (Date.parse(slotDate) - Date.now()) / 36e5;
        let amountToBeRefunded = 0;

        //IF CANCELLATION HAPPENS WITH MORE THAN 48 HRS FROM THE CALENDAR SLOT DATE WE ARE GOING TO REFUND ENTIRE AMOUNT ELSE ZERO AMOUNT.
        if (dateDiffInHrs > 48) {
            amountToBeRefunded = bookingUserDetails[0].booking_amount;
        }

        //Updating status DATA TO EXPERIENCE BOOKING TABLE
        let updateBooking = {
            status: expCancel,
        };

        let expView = await ExpBooking.update(updateBooking, {
            where: { id: payload.bookingId },
        });


        //SEND EMAIL TO USER AND HOST IF THE BOOKED USER IS CANCELLING TICKET
        if (isUserCancelled) {
            let users = await readSeqInstance.query(
                "select primary_id, user_email, user_full_name from users where primary_id in ($1, $2)",
                { bind: [bookedBy, hostBy], type: QueryTypes.SELECT }
            );

            let userName = '';
            let userEmail = '';
            let hostName = '';
            let hostEmail = '';
            for (var i = 0; i < users.length; i++) {
                if (bookedBy == users[i].primary_id) {
                    userName = users[i].user_full_name;
                    userEmail = users[i].user_email;
                } else {
                    hostName = users[i].user_full_name;
                    hostEmail = users[i].user_email;
                }
            }

            let tplData = {
                full_name: userName,
                user_name: userName,
                host_name: hostName,
                booking_name: bookingName,
                booking_date: bookingDate,
                cancellation_date: new Date().toString(),
                booking_destination: location,
                booking_id: bookingId,
                refund_amount: amountToBeRefunded
            }
            sendEmail(userEmail, tplData, "bookingCanceledByUser",undefined);
            sendEmail(hostEmail, tplData, "bookingCanceledByUserToHost", appConstants.ADMIN_EMAIL);
            console.log('email sent');
            /*sendEmail('ranjith@beatravelbuddy.com', tplData, "bookingCanceledByUser", undefined);
            sendEmail('ranjith@beatravelbuddy.com', tplData, "bookingCanceledByUserToHost", undefined);*/
        }



        //INSERTING DATA TO EXPERIENCE BOOKING CANCEL TABLE
        let newCancel = {
            booking_id: payload.bookingId,
            cancelled_by: expBookCancelStat,
            comment: payload.comment,
            refund_amount: amountToBeRefunded,
            booking_date: bookingDate
        };
        let bookingCancl = await ExpCancelBooking.create(newCancel);

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
