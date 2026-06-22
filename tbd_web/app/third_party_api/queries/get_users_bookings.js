"use strict";

const flightBookings = require("../models/tbo_flight_bookings");
const flightCancellations = require("../models/tbo_flight_cancellations");
const appConstants = require("constants");
const tbo_flights = require("../tbo/tbo_flights");

const getUsersFlightBookings = async (payload) => {
    try {

        if (payload.plainUserId == undefined || payload.plainUserId == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }

        console.log('B4 List of bookings');
        let listOfBookings = await flightBookings.findAll({ where: { user_id: payload.plainUserId } });
        console.log('List of bookings', listOfBookings);
        // Use Promise.all to ensure all asynchronous operations are completed
        await Promise.all(listOfBookings.map(async (booking) => {
            
            console.log('Booking Id', booking.id.toString());
            // Add the Cancelled flight details to the booking object inside dataValues so that it is returned in the response
            booking.dataValues.cancellationInfo = await flightCancellations.findAll({ where: { tbo_flight_booking_id: booking.id.toString() } });
        }));
        /*listOfBookings.forEach(async element => {
            element.cancellationInfo = await flightCancellations.findAll({ where: { tbo_flight_booking_id: element.id.toString()}});
        });*/
        return { status: "success", "responseCode": 200, object: listOfBookings };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getUsersFlightBookings;
