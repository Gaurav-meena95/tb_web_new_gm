"use strict";

const flightSearchHistory = require("../models/tbo_flight_search_history");
const appConstants = require("constants");

const updateFlightSearchHistory = async (payload) => {
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

        let foundItem = await flightSearchHistory.findOne({ 
            where: { 
                user_id: payload.plainUserId/*, 
                created_at: {
                    [Op.gte]: moment().startOf('day').toDate(),
                    [Op.lt]: moment().endOf('day').toDate(),
                    },
                source_airport_id: sourceAirportId,
                destination_airport_id: destinationAirportId,*/
                },
                order: [['id', 'DESC']]
        });
        if (foundItem) {
            let usersPayloadHistory = foundItem.payload;
            if (payload.payload){
                usersPayloadHistory[payload.bookingStage] = payload.payload;
            }
            let newRec = {
                booking_stage: payload.bookingStage,
                payload: usersPayloadHistory
            }
            if (payload.bookingStage == 'ticket'){
                if (payload.flightBookingId){
                    newRec['flight_booking_id'] = payload.flightBookingId;
                }
                newRec['booking_done'] = 1;
            }

            await flightSearchHistory.update(newRec, { where: {id: foundItem.id } }); // foundItem[0].id
        }

        return { status: "success", "responseCode": 200, object: { "searchHistoryId": foundItem.id} };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = updateFlightSearchHistory;
