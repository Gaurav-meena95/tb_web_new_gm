"use strict";

const dbConfig = require("../../config/config");
const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const locs = require("../../locations/models/locations");
const appConstants = require("../../constants");

//Run the below command to npm install google maps api module.
//npm install @googlemaps/google-maps-services-js
const searchLocationWithImage = async (payload) => {
    try {

        payload.userId = appConstants.LOGGED_IN_USER_ID;

        if (!(payload.userId && payload.location)) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request",
            };
        }
        let foundItem = await locs.findOne({ where: { full_address: payload.location} });
            
        return { status: "success", "responseCode": 200, locationDetails: foundItem};
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};


module.exports = searchLocationWithImage;
