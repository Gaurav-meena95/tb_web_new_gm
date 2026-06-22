"use strict";

const flightSearchHistory = require("../models/tbo_flight_search_history");
const appConstants = require("constants");

const addFlightSearchHistory = async (payload) => {
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
            source: payload.source,
            destination: payload.destination,
            payload: payload.payload,
            journey_type: payload.journeyType,
            booking_done: 0,
            pnr: '',
            booking_no: '',
            first_name: '',
            last_name: '',
            booking_stage: 'search',
            is_domestic: payload.isInternational == 'true' ? 0 : 1
        };
        let newItem = await flightSearchHistory.create(newRec);

        return { status: "success", "responseCode": 200, object: { "flightSearchId": newItem.id} };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addFlightSearchHistory;
