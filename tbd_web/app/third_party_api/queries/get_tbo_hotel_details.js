"use strict";

const tboHotelDetails = require("../models/tbo_hotel_details");
const appConstants = require("../../constants");

const getTboHotelDetails = async (payload) => {
	console.log('Payload', payload);
    try {
        const whereClause = {
            is_active: true
        };

        // Search by hotel codes if provided
        if (payload.hotelCodes) {
            let hotelCodes = payload.hotelCodes;
           
            // Handle both string and array inputs
            if (typeof hotelCodes === 'string') {
                hotelCodes = hotelCodes.split(',').map(code => code.trim());
            } else if (!Array.isArray(hotelCodes)) {
                hotelCodes = [hotelCodes];
            }
            
            whereClause.hotel_code = {
                [require('sequelize').Op.in]: hotelCodes
            };
        }
        // Search by city code if provided
        else if (payload.city_id) {
			whereClause.city_id = payload.city_id;
			console.log('Hotel Codes grt', payload.city_id);
        }
        // If neither hotelCodes nor cityCode provided, return error
        else {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Either hotelCodes or cityCode is required",
            };
        }

        // Add search filter if provided
        if (payload.searchTerm) {
            whereClause.hotel_name = {
                [require('sequelize').Op.iLike]: `%${payload.searchTerm}%`
            };
        }

        // Add rating filter if provided
        if (payload.rating) {
            whereClause.hotel_rating = payload.rating;
        }

		console.log('Where Clause', whereClause);

        const hotels = await tboHotelDetails.findAll({
            where: whereClause,
            order: [['hotel_name', 'ASC']],
            attributes: [
                'hotel_code', 'hotel_name', 'description', 'hotel_facilities',
                'attractions', 'images', 'address', 'pin_code', 'city_id',
                'country_name', 'phone_number', 'fax_number', 'map_coordinates',
                'hotel_rating', 'city_name', 'country_code', 'check_in_time',
                'check_out_time', 'city_code'
            ]
        });

        return { 
            status: "success", 
            responseCode: 200, 
            object: {
                hotels: hotels,
                count: hotels.length,
                search_type: payload.hotelCodes ? 'hotel_codes' : 'city_code',
                search_value: payload.hotelCodes || payload.cityCode
            }
        };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getTboHotelDetails; 