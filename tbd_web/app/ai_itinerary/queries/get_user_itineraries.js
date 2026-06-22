"use strict";

const aiItinerary = require("../models/ai_itinerary");
const aiItineraryCategories = require("../models/ai_itinerary_categories");
const aiItineraryLocations = require("../models/ai_itinerary_locations");
const appConstants = require("../../constants");
const { placeAutocomplete } = require("@googlemaps/google-maps-services-js/dist/places/autocomplete");


const getUsersItineraries = async (payload) => {
    try {

        if (appConstants.LOGGED_IN_USER_ID == undefined || appConstants.LOGGED_IN_USER_ID == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }

        let offSet = 0;
        if (payload.pageNumber){
            offSet = payload.pageNumber * 10;
        }

        let resData = await aiItinerary.findAll({
            where: { user_id: appConstants.LOGGED_IN_USER_ID },
            order: [['id', 'DESC']], // Ordering by id in ascending order
            limit: 10, // Limiting the number of results to 10
            offset: offSet // Starting from the first result
        });
        let itineraries = JSON.parse(JSON.stringify(resData));
        for(var i = 0; i < itineraries.length; i++){
            itineraries[i].categories = await aiItineraryCategories.findAll({ where: { itinerary_id: itineraries[i].id}});
            itineraries[i].locations = await aiItineraryLocations.findAll({ where: { itinerary_id: itineraries[i].id}});
        }

        return { status: "success", "responseCode": 200, "userItineraries": itineraries };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getUsersItineraries;
