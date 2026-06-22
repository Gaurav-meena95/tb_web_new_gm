"use strict";

const dbConfig = require("../../config/config");
const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const locs = require("../../locations/models/locations");
const appConstants = require("../../constants");
const { Client } = require('@googlemaps/google-maps-services-js');
const apiKey = 'AIzaSyAMvFtpynq0eksNkck9NaQjQEXCh09n5RI';
const googleClient = new Client();
const MongoClient = require("mongodb").MongoClient;

//Run the below command to npm install google maps api module.
//npm install @googlemaps/google-maps-services-js
const searchLocation = async (payload) => {
    try {

        payload.userId = appConstants.LOGGED_IN_USER_ID;

        if (!(payload.userId && payload.location)) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request",
            };
        }
        // Connection URL and database name
        const url = dbConfig.development.mongoDBInstance.serverURL; // Change this to your MongoDB server URL
        const dbName = dbConfig.development.mongoDBInstance.database;

        const client = new MongoClient(url);

        try {
            await client.connect();
        } catch (err) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Connection to mongodb failed",
            };
        }
        
        const mongodbClent = client.db(dbName);
        const locationCollection = mongodbClent.collection("Locations");

        let filteredLocs = await locationCollection.find({
            "location": {
                $regex: ".*" + payload.location,
                $options: "i" // Optional: "i" for case-insensitive search
            }
        }).project({'location': 1, 'location_lat':1, 'location_long':1, '_id': 0}).toArray();

        // Custom sorting function
        if (filteredLocs.length){
            console.log('found in mongodb');
            filteredLocs.sort((a, b) => {
                const aStartsWithHyd = a.location.toLowerCase().startsWith(payload.location);
                const bStartsWithHyd = b.location.toLowerCase().startsWith(payload.location);
        
                if (aStartsWithHyd && !bStartsWithHyd) {
                return -1;
                } else if (!aStartsWithHyd && bStartsWithHyd) {
                return 1;
                } else {
                return a.location.localeCompare(b.location, undefined, { sensitivity: 'base' });
                }
            });
        }else{
            console.log('found in googleplaces');
            filteredLocs = await getPlacesFromGooglePlaces(payload);
            await saveLocationsToMongoDB(filteredLocs, locationCollection);
            await saveLocationsToMariaDB(filteredLocs);
        }
            
        return { status: "success", "responseCode": 200, list: filteredLocs};
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

async function saveLocationsToMongoDB(allLocns, locationCollection){
    var bulk = locationCollection.initializeUnorderedBulkOp();

    for (var i = 0; i < allLocns.length; i++) {
        bulk.insert({
            "location": allLocns[i].name,
            "location_lat": allLocns[i].latitude,
            "location_long": allLocns[i].longitude,
            "full_address": "",
            "city":"",
            "state":"",
            "country":""
        });
    }

    await bulk.execute();
}

async function saveLocationsToMariaDB(newLocs){
    let bulkRecs = [];
    for (var i = 0; i < newLocs.length; i++) {
        bulkRecs.push({
            "location_name": newLocs[i].name,
            "location_lat": newLocs[i].latitude,
            "location_long": newLocs[i].longitude,
            "full_address": "",
            "city":"",
            "state":"",
            "country":""
        });
    }
    locs.bulkCreate(
        bulkRecs
    ).then(() => { // Notice: There are no arguments here, as of right now you'll have to...
        return locs.findAll();
    }).then(users => {
        //console.log(users) // ... in order to get the array of user objects
    })
}

async function getPlacesFromGooglePlaces(payload){
    function placeName(place) {
        let finalName = '';
        let addressCountry = '';
        let addressState = '';
        let addressCity = '';
        let addressSubLocality1 = '';
        let addressSubLocality2 = '';
    
        place.address_components.forEach((component) => {
            if (component.types[0] == 'country') {
                addressCountry = ', ' + component.long_name;
            }
    
            if (component.types[0] == 'administrative_area_level_1') {
                addressState = ', ' + component.long_name;
            }
    
            if (component.types[0] == 'locality') {
                addressCity = ', ' + component.long_name;
            }
    
            if (component.types[0] == 'sublocality_level_1') {
                addressSubLocality1 = ', ' + component.long_name;
            }
    
            if (component.types[0] == 'sublocality_level_2') {
                addressSubLocality2 = component.long_name;
            }
        });
    
        if (addressSubLocality1 == (', ' + place.name)) {
            addressSubLocality1 = '';
        }
    
        if (addressSubLocality2 == place.name) {
            addressSubLocality2 = '';
        }
    
        if (addressCity == (', ' + place.name)) {
            addressCity = '';
        }
    
        if (addressState == (', ' + place.name)) {
            addressState = '';
        }
    
        finalName = place.name + addressSubLocality2 + addressSubLocality1 + addressCity + addressState + addressCountry;
    
        return finalName;
    }

    let allLocs = [];
    await googleClient.placeAutocomplete({
        params: {
          input: payload.location,
          key: apiKey,
          fields: ['address_components'],
        },
      })
      .then(async (response) => {
        allLocs = [];
        let predictions = response.data.predictions;
        for (let i = 0; i < predictions.length; i++) {
            const prediction = predictions[i];
            // Fetch additional details including latitude and longitude using place_id
            const placeDetailsResponse = await googleClient.placeDetails({
                params: {
                place_id: prediction.place_id,
                key: apiKey,
                fields: ['address_components', 'geometry', 'name'], // Specify 'geometry' to get coordinates
            },
            });
            let newLocation = {'name': placeName(placeDetailsResponse.data.result)};
            const location = placeDetailsResponse.data.result.geometry.location;
            newLocation.latitude = location.lat;
            newLocation.longitude = location.lng;
            allLocs.push(newLocation);
        }
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });

    return allLocs;
}

async function bulkInsertToMongoDB(){
    const locationCollection = mongodbClent.collection("Locations");
    var bulk = locationCollection.initializeUnorderedBulkOp();

    let allLocns = await readSeqInstance.query(
        'SELECT location_name, location_lat, location_long, full_address, city, state, country FROM all_locations',
        { type: QueryTypes.SELECT }
    );

    for (var i = 0; i < allLocns.length; i++) {
        bulk.insert({
            "location": allLocns[i].location_name,
            "location_lat": allLocns[i].location_lat,
            "location_long": allLocns[i].location_long,
            "full_address": allLocns[i].full_address,
            "city": allLocns[i].city,
            "state": allLocns[i].state,
            "country": allLocns[i].country
        });
    }

    await bulk.execute();

}


module.exports = searchLocation;
