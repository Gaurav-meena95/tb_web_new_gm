"use strict";

const tboCountries = require("../models/tbo_countries");
const appConstants = require("../../constants");

const addTboCountries = async (payload) => {
    try {
        if (!payload.countries || !Array.isArray(payload.countries)) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Invalid countries data",
            };
        }

        const countriesToAdd = payload.countries.map(country => ({
            country_code: country.Code,
            country_name: country.Name,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        }));

        // Filter out duplicates based on country_code
        const uniqueCountries = countriesToAdd.filter((country, index, self) => 
            index === self.findIndex(c => c.country_code === country.country_code)
        );

        // Use bulkCreate with updateOnDuplicate to handle duplicates
        const result = await tboCountries.bulkCreate(uniqueCountries, {
            updateOnDuplicate: ['country_name', 'updated_at']
        });

        return { 
            status: "success", 
            responseCode: 200, 
            object: { 
                message: `Successfully processed ${result.length} countries`,
                count: result.length
            } 
        };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addTboCountries; 