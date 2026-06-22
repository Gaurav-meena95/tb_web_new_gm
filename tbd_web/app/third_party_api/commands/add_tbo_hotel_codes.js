"use strict";

const tboHotelCodes = require("../models/tbo_hotel_codes");
const appConstants = require("../../constants");

const addTboHotelCodes = async (payload) => {
    try {
        if (!payload.hotelCodes || !Array.isArray(payload.hotelCodes) || !payload.cityCode || !payload.countryCode) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Invalid hotel codes data or missing city/country code",
            };
        }

        const hotelCodesToAdd = payload.hotelCodes.map(hotel => ({
            hotel_code: hotel.HotelCode || hotel.Code,
            hotel_name: hotel.HotelName || hotel.Name || null,
            city_code: payload.cityCode,
            country_code: payload.countryCode,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        }));

        // Use bulkCreate with updateOnDuplicate to handle duplicates
        const result = await tboHotelCodes.bulkCreate(hotelCodesToAdd, {
            updateOnDuplicate: ['hotel_name', 'city_code', 'country_code', 'updated_at']
        });

        return { 
            status: "success", 
            responseCode: 200, 
            object: { 
                message: `Successfully processed ${result.length} hotel codes for city ${payload.cityCode}`,
                count: result.length,
                city_code: payload.cityCode,
                country_code: payload.countryCode
            } 
        };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addTboHotelCodes; 