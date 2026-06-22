"use strict";

const locs = require("../../locations/models/locations");
const appConstants = require("../../constants");

const addLocation = async (payload) => {
    try {

        console.log(JSON.stringify(payload));
        if (!(payload.location && payload.lat_long && payload.lat_long.lng)){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request test"
            };
        }

        let locationName = payload.location.split(',')[0];
        let newRec = {
            full_address: payload.location,
            location_name: locationName,
            location_lat: payload.lat_long.lat,
            location_long: payload.lat_long.lng,
            photo_reference: payload.photoReference,
            place_id: payload.placeId,
            image_url: payload.imageUrl
        };

        if (payload.city && payload.city.long_name){
            newRec['city'] = payload.city.long_name; 
        }
        if (payload.state && payload.state.long_name){
            newRec['state'] = payload.state.long_name; 
        }
        if (payload.country && payload.country.long_name){
            newRec['country'] = payload.country.long_name; 
        }

        let locationId = -1;
        let foundItem = await locs.findOne({ where: { location_name: locationName} });
        if (!foundItem) {
            let newItem = await locs.create(newRec);
            locationId = newItem.location_id;
        } else {
            let updateRec = false;
            if (payload.location != foundItem.full_address){
                updateRec = true;
                foundItem.full_address = payload.location; 
            }
            if (payload.lat_long.lat != foundItem.location_lat){
                updateRec = true;
                foundItem.location_lat = payload.lat_long.lat; 
            }
            if (payload.lat_long.lng != foundItem.location_long){
                updateRec = true;
                foundItem.location_long = payload.lat_long.lng; 
            }
            if (payload.photoReference != foundItem.photo_reference){
                updateRec = true;
                foundItem.photo_reference = payload.photoReference; 
            }
            if (payload.placeId != foundItem.place_id){
                updateRec = true;
                foundItem.place_id = payload.placeId; 
            }
            if (payload.imageUrl != foundItem.image_url){
                updateRec = true;
                foundItem.image_url = payload.imageUrl; 
            }
            if (payload.city && payload.city.long_name && payload.city.long_name != foundItem.city){
                updateRec = true;
                foundItem.city = payload.city.long_name; 
            }
            if (payload.state && payload.state.long_name && payload.state.long_name != foundItem.state){
                updateRec = true;
                foundItem.state = payload.state.long_name; 
            }
            if (payload.country && payload.country.long_name && payload.country.long_name != foundItem.country){
                updateRec = true;
                foundItem.country = payload.country.long_name; 
            }
            if (updateRec){
                await foundItem.save();
            }
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
