"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("constants");
const tboFlights = require("../tbo/tbo_flights");
const tboLowestFares = require("../models/tbo_lowest_fare");

const getCheapestFlights = async (payload) => {
    try {

        console.log(payload.plainUserId);
        if (payload.plainUserId == undefined || payload.plainUserId == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }

        //GETTING NEAREST AIRPORT FROM THE USERS LOCATION AND DESTINATION LOCATION
        
        //Get departure airport code

        async function getNearestAirport(latitude, longitude){
            let qry = "SELECT airport_name, airport_code, lat, lng, city_name, country_name,(6371 * acos(cos(radians(" +  latitude +")) * cos(radians(lat)) * cos(radians(lng) - radians("+ longitude +")) + sin(radians(" +  latitude +")) * sin(radians(lat)))) AS distance FROM air_port_info where not_in_use = 0 ORDER BY distance LIMIT 1";
            let depAirports = await readSeqInstance.query(
                qry,
                {type: QueryTypes.SELECT }
            );
            return depAirports[0]; 
        }


        async function getLatLongOfLocation(origin){
            //let qry = "SELECT location_name location, location_lat latitude, location_long longitude FROM all_locations where location_name ilike $1";
            let qry = "select location_lat, location_long from posts where location ilike $1 order by post_id desc limit 1";
            let allLocs = await readSeqInstance.query(
                qry,
                { bind: [origin], type: QueryTypes.SELECT }
            );
            return {
                latitude: (allLocs && allLocs[0]) ?  allLocs[0].location_lat : 0,
                longitude: (allLocs && allLocs[0]) ? allLocs[0].location_long : 0
            }
        }

        let depAirportInfo = '';
        if (payload.origin){
            let originLatLong = await getLatLongOfLocation(payload.origin);
            if (originLatLong.latitude == 0){
                return {
                    status: "error",
                    responseCode: 400,
                    errorMessage: "No flights from this region.",
                }
            }
            depAirportInfo = await getNearestAirport(originLatLong.latitude,originLatLong.longitude);
        }else if (payload.fromLat){
            depAirportInfo = await getNearestAirport(payload.fromLat,payload.fromLong);
        }else{
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "No sufficient inputs.",
            }    
        }
 
        let arrivalAirportInfo = '';
        if (payload.destination){
            let originLatLong = await getLatLongOfLocation(payload.destination);
            if (originLatLong.latitude == 0){
                return {
                    status: "error",
                    responseCode: 400,
                    errorMessage: "No flights to this region.",
                }
            }
            arrivalAirportInfo = await getNearestAirport(originLatLong.latitude,originLatLong.longitude);
        }

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        let existingRecord = await tboLowestFares.findOne({
            where: {
                departure_airport: depAirportInfo.airport_code,
                arrival_airport: arrivalAirportInfo.airport_code,
                updated_at: {
                    [Op.gte]: threeDaysAgo // updated_at <= 3 days ago
                }
            }
        });

        if (existingRecord){
            console.log('Fetching from our db');
            return { status: "success", "responseCode": 200, lowestFareDetails: {
                departureAirport: depAirportInfo.airport_code,
                departureCity: depAirportInfo.city_name,
                arrivalCity: arrivalAirportInfo.city_name,
                arrivalAirport: arrivalAirportInfo.airport_code,
                departureCountry: depAirportInfo.country_name,
                arrivalCountry: arrivalAirportInfo.country_name,
                lowestFare: parseInt(existingRecord.lowest_fare)
            }};
        }else{
            existingRecord = await tboLowestFares.findOne({
                where: {
                    departure_airport: depAirportInfo.airport_code,
                    arrival_airport: arrivalAirportInfo.airport_code
                }
            });
        }

        console.log('Fetching from tbo');

        const today = new Date();
        const duration = 30;
        const futureDate = new Date(today.setDate(today.getDate() + duration)).toISOString().split('T')[0] + 'T00:00:00';
        let payloadForSearch = {"Segments": [{"Origin": depAirportInfo.airport_code, "Destination": arrivalAirportInfo.airport_code, "FlightCabinClass": "1", "PreferredDepartureTime": futureDate}]};
        
        console.log(payloadForSearch);
        let searchResponse = await tboFlights.getCalendarFares(payloadForSearch);

        let lowestFareObject = undefined;
        if (searchResponse.responseCode == 200){
            if (searchResponse.object && searchResponse.object.Response && searchResponse.object.Response.SearchResults){
                console.log('results', searchResponse.object.Response.SearchResults);
                lowestFareObject = searchResponse.object.Response.SearchResults.find((obj) => {
                    return obj.IsLowestFareOfMonth == true;
                });
            }
            console.log('searchResponse', searchResponse);
        }else{
            console.log('searchResponse', searchResponse);
            return {
                status: "error",
                responseCode: 403,
                errorMessage: "Error occured while fetching lowest prices"
            };
        }

        if (!lowestFareObject){
            return {
                status: "success",
                responseCode: 200,
                lowestFareDetails: undefined
            }
        }

        
        if (existingRecord){
            console.log('Updating existing record');
            // Update the existing record with new values
            existingRecord.lowest_fare = lowestFareObject.Fare;
            await existingRecord.save();
        }else{
            console.log('Creating new record');
            await tboLowestFares.create({
                departure_airport: depAirportInfo.airport_code,
                arrival_airport: arrivalAirportInfo.airport_code,
                departureCountry: depAirportInfo.country_name,
                arrivalCountry: arrivalAirportInfo.country_name,
                lowest_fare: lowestFareObject.Fare,
                booking_type: 'flight',
            });
        }

        console.log(JSON.stringify({
            departureAirport: depAirportInfo.airport_code,
            arrivalAirport: arrivalAirportInfo.airport_code,
            lowestFare: parseInt(lowestFareObject.Fare)
        }));

        return { status: "success", "responseCode": 200, lowestFareDetails: {
            departureAirport: depAirportInfo.airport_code,
            departureCity: depAirportInfo.city_name,
            arrivalCity: arrivalAirportInfo.city_name,
            departureCountry: depAirportInfo.country_name,
            arrivalCountry: arrivalAirportInfo.country_name,
            arrivalAirport: arrivalAirportInfo.airport_code,
            lowestFare: parseInt(lowestFareObject.Fare)
        }};
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getCheapestFlights;
