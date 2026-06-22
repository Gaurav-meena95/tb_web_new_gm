"use strict";

const locs = require("../models/locations");
const appConstants = require("constants");

const addLocation = async (payload) => {
    try {


        if (!(payload.Location && payload.lat_long && payload.lat_long.lng)){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }

        let locationName = payload.Location.split(',')[0];
        let newRec = {
            full_address: payload.Location,
            location_name: locationName,
            location_lat: payload.lat_long.lat,
            location_long: payload.lat_long.lng
        };

        if (payload.City && payload.City.long_name){
            newRec['city'] = payload.City.long_name; 
        }
        if (payload.State && payload.State.long_name){
            newRec['state'] = payload.State.long_name; 
        }
        if (payload.Country && payload.Country.long_name){
            newRec['country'] = payload.Country.long_name; 
        }

        let locationId = -1;
        let foundItem = await locs.findOne({ where: { location_name: locationName} });
        if (!foundItem) {
            let newItem = await locs.create(newRec);
            locationId = newItem.location_id;
        } else {
            locationId = foundItem.location_id;
        }

        return { status: "success", "responseCode": 200, object: { "locationId": locationId} };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addLocation;
