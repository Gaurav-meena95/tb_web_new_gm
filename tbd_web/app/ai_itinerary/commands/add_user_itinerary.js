"use strict";

const aiItinerary = require("../models/ai_itinerary");
const aiItineraryCategories = require("../models/ai_itinerary_categories");
const aiItineraryLocations = require("../models/ai_itinerary_locations");
const appConstants = require("../../constants");
const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const writeToGoogleSheet = require("../../utility/write_to_google_sheet");
const writeSeqInstance = seqConfig.write_sequelize;

const addUserItinerary = async (payload) => {
    let seq_transaction;
    try {
        
        if (!(payload.destination)){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }
        
        if (payload.plainUserId == undefined || payload.plainUserId == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }
        seq_transaction = await writeSeqInstance.transaction();
        
        let itineraryData = {
            user_id: payload.plainUserId,
            destination: payload.destination,
            month: payload.month,
            budget_type: payload.budgetType,
            pax_type: payload.paxType,
            itinerary: payload.itinerary
        }

        const usersItinerary = await aiItinerary.create(
            itineraryData,
            {
                transaction: seq_transaction,
            }
        );

        //INSERTING TO CATEGORY TABLE
        for (var i = 0; i < payload.categories.length; i++) {
            let itineraryCategory = {
                itinerary_id: usersItinerary.id,
                category_id: payload.categories[i]
            };
            await aiItineraryCategories.create(
                itineraryCategory,
                {
                    transaction: seq_transaction,
                }
            );
        }

        //INSERTING TO ALL LOCATIONS & AI ITINERARY LOCATION TABLE
        for (var i = 0; i < payload.itineraryLocations.length; i++) {
            let itineraryLocation = {
                itinerary_id: usersItinerary.id,
                location_id: payload.itineraryLocations[i]
            };
            await aiItineraryLocations.create(
                itineraryLocation,
                {
                    transaction: seq_transaction,
                }
            );
        }
        
        await seq_transaction.commit();

        /*ADDING USERS AI DETAILS IN GOOGLE SHEET*/
        try{
            //
            let qry = "select primary_id, user_full_name, user_type, user_phone_number, user_home_location, user_email, is_verified from users where primary_id = $1";

            let users = await readSeqInstance.query(
                qry,
                { bind: [payload.plainUserId], type: QueryTypes.SELECT }
            );
            function getMonthName(monthNumber) {
                let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                let month = monthNames[monthNumber - 1];
                return month;
            }
            let monthName = getMonthName(payload.month);
            let userData = [];
            let urlLink = '';
            for (var j = 0; j < users.length; j++) {
                userData.push(users[j].primary_id);
                userData.push(users[j].user_full_name);
                userData.push(users[j].user_phone_number);
                userData.push(users[j].user_email);
                userData.push(users[j].user_home_location);
                userData.push(payload.destination);
                userData.push(monthName);
                userData.push(payload.paxType);
                urlLink = ('ai-travel-plan/' + payload.destination.replace(/\s+/g, '-') + '-' + payload.paxType + '-' + payload.budgetType + '-' + monthName + '/' + usersItinerary.id).replace(/[\s,]+/g, '-');
                userData.push("https://beatravelbuddy.com/" + urlLink);//AI link "https://beatravelbuddy.com/ai-travel-plan/Bengaluru/solo/budget_friendly/February/60"
                //Updated AI link "https://beatravelbuddy.com/ai-travel-plan-Bengaluru-solo-budget_friendly-February/60"
                userData.push(users[j].is_verified == 0? 'non-verified': 'verified');
                userData.push(users[j].user_type == 0? 'Traveler': 'Service Provider');
            }

            writeToGoogleSheet('1kK56UWY7dIigG5YJK2fu6fx9ZvGPshfqdLL7dp0FSF4',[userData], 'AI');
        }catch(error){
            console.log(error.message);
        }


        return { status: "success", "responseCode": 200, object: { "itineraryId": usersItinerary.id} };
    } catch (error) {
        console.log(error.message);
        console.log('error occured');
        if (seq_transaction) {
            await seq_transaction.rollback();
        }
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

async function addGeoLocation(payload){
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
    return locationId;
}

module.exports = addUserItinerary;
