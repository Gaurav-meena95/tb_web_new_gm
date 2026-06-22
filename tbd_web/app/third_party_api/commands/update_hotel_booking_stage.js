"use strict";

const hotelSearchHistory = require("../models/tbo_hotel_search_history");
const appConstants = require("constants");

const updatehotelSearchHistory = async (payload) => {
    try {

        if (payload.plainUserId == undefined || payload.plainUserId == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }

        if (!payload.bookingStage){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad Request",
            };
        }

        let foundItem = await hotelSearchHistory.findOne({ 
            where: { 
                user_id: payload.plainUserId
                },
                order: [['id', 'DESC']]
        });
        let searchHistoryId = -1;
        if (foundItem) {
            searchHistoryId = foundItem.id;
            let usersPayloadHistory = foundItem.payload;
            if (payload.payload){
                usersPayloadHistory[payload.bookingStage] = payload.payload;
            }
            let newRec = {
                booking_stage: payload.bookingStage,
                payload: usersPayloadHistory
            }
            if (payload.bookingStage == 'book'){
                if (payload.hotelBookingId){
                    newRec['hotel_booking_id'] = payload.hotelBookingId;
                }
                newRec['booking_done'] = 1;
            }

            await hotelSearchHistory.update(newRec, { where: {id: foundItem.id } }); // foundItem[0].id
        }

        return { status: "success", "responseCode": 200, object: {"searchHistoryId": searchHistoryId} };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = updatehotelSearchHistory;
