"use strict";

const aiItinerary = require("../models/ai_itinerary");
const aiItineraryCategories = require("../models/ai_itinerary_categories");
const aiItineraryLocations = require("../models/ai_itinerary_locations");
const appConstants = require("../../constants");
const appUtils = require("../../utils");
const { placeAutocomplete } = require("@googlemaps/google-maps-services-js/dist/places/autocomplete");


const getItinerary = async (payload) => {
    try {

        if (!payload.itineraryId){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }

        if (appConstants.LOGGED_IN_USER_ID == undefined || appConstants.LOGGED_IN_USER_ID == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }
        
        // Decrypt the encryptedId to get the original id
        let decryptedId;
        try {
            // Check if payload.itineraryId is a numeric value
            if (!isNaN(parseInt(payload.itineraryId))) {
                decryptedId = payload.itineraryId;
            } 
            else {
                // Assume payload.itineraryId is a Base64-encoded string and decode it
                decryptedId = Buffer.from(payload.itineraryId, 'base64').toString('ascii');
                console.log(decryptedId);
            }
        }
        catch (error) {
            console.error("Error decoding itinerary ID:", error);
            decryptedId = payload.itineraryId; // Fallback to using the original ID
        }
        let resData = await aiItinerary.findOne({
            where: { id: decryptedId }
        });
        resData.dataValues.userInfo = await appUtils.getUserInfo(resData.user_id);
        
        if (resData){
            resData.dataValues.categories = await aiItineraryCategories.findAll({ where: { itinerary_id: decryptedId}});
            resData.dataValues.locations = await aiItineraryLocations.findAll({ where: { itinerary_id: decryptedId}});
        }
        
        if (parseInt(payload.itineraryId) != NaN){
            resData.dataValues.encryptedId = Buffer.from(payload.itineraryId.toString()).toString('base64');
        }
        else {
            resData.dataValues.encryptedId = payload.itineraryId;
        }
        
        return { status: "success", "responseCode": 200, "itinerary": resData };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getItinerary;
