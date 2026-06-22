"use strict";

const tboCities = require("../models/tbo_cities");
const appConstants = require("../../constants");

const addTboCities = async (payload) => {
    try {
        if (!payload.cities || !Array.isArray(payload.cities) || !payload.countryCode) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Invalid cities data or missing country code",
            };
		}
		console.log('Payload:', payload.cities);

		const citiesToAdd = payload.cities.map(city => ({
			
            city_code: city.Code,
            city_name: city.Name,
            country_code: payload.countryCode,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        }));

        // Use bulkCreate with updateOnDuplicate to handle duplicates
        const result = await tboCities.bulkCreate(citiesToAdd, {
            updateOnDuplicate: ['city_name', 'country_code', 'updated_at']
        });

        return { 
            status: "success", 
            responseCode: 200, 
            object: { 
                message: `Successfully processed ${result.length} cities for country ${payload.countryCode}`,
                count: result.length,
                country_code: payload.countryCode
            } 
        };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addTboCities; 