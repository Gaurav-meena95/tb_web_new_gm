"use strict";

const flightChangeRequests = require("../models/tbo_flight_change_request");
const appConstants = require("constants");

const addFlightChangeRequests = async (payload) => {
    try {

        if (payload.plainUserId == undefined || payload.plainUserId == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }

        let newRec = {
            user_id: payload.plainUserId,
            flight_booking_id: payload.flightBookingId,
            booking_id: payload.bookingId,
            change_request_id: payload.changeRequestId,
            request_type: payload.requestType,
            cancellation_type: payload.cancellationType,
            status: payload.status,
            token: payload.token
        };
        let newItem = await flightChangeRequests.create(newRec);

        return { status: "success", "responseCode": 200, object: { "changeRequestId": newItem.id} };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addFlightChangeRequests;
