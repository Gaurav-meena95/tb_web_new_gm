"use strict";

const hotelSearchHistory = require("../models/tbo_hotel_search_history");
const appConstants = require("constants");

const addHotelSearchHistory = async (payload) => {
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
            city: payload.city,
            country: payload.country,
            is_international: payload.isInternational,
            check_in_date: payload.checkInDate,
            no_of_rooms: payload.noOfRooms,
            no_of_pax: payload.noOfPax,
            no_of_days: payload.noOfDays,
            payload: payload.payloadObject,
            hotel_category: payload.hotelCategory,
            booking_stage: payload.bookingStage
        };
        let newItem = await hotelSearchHistory.create(newRec);

        return { status: "success", "responseCode": 200, object: { "flightSearchId": newItem.id} };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addHotelSearchHistory;
