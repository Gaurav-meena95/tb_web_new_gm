"use strict";

const tboHotelCodes = require("../models/tbo_hotel_codes");
const appConstants = require("../../constants");

const getTboHotelCodes = async (payload) => {
    try {
        const whereClause = {
            is_active: true
        };

        // Add city filter if provided
        if (payload.cityCode) {
            whereClause.city_code = payload.cityCode;
        }

        // Add country filter if provided
        if (payload.countryCode) {
            whereClause.country_code = payload.countryCode;
        }

        // Add search filter if provided
        if (payload.searchTerm) {
            whereClause.hotel_name = {
                [require('sequelize').Op.iLike]: `%${payload.searchTerm}%`
            };
        }

        const hotelCodes = await tboHotelCodes.findAll({
            where: whereClause,
            order: [['hotel_name', 'ASC']],
            attributes: ['hotel_code', 'hotel_name', 'city_code', 'country_code']
        });

        return { 
            status: "success", 
            responseCode: 200, 
            object: {
                hotelCodes: hotelCodes,
                count: hotelCodes.length,
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

module.exports = getTboHotelCodes; 