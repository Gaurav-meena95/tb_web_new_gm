"use strict";

const tboHotelDetails = require("../models/tbo_hotel_details");
const appConstants = require("../../constants");

const addTboHotelDetails = async (payload) => {
    try {
        if (!payload.hotelDetails || !Array.isArray(payload.hotelDetails)) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Invalid hotel details data",
            };
        }

        const hotelsToAdd = payload.hotelDetails.map(hotel => ({
            hotel_code: hotel.HotelCode,
            hotel_name: hotel.HotelName,
            description: hotel.Description,
            hotel_facilities: hotel.HotelFacilities,
            attractions: hotel.Attractions,
            images: hotel.Images,
            address: hotel.Address,
            pin_code: hotel.PinCode,
            city_id: hotel.CityId,
            country_name: hotel.CountryName,
            phone_number: hotel.PhoneNumber,
            fax_number: hotel.FaxNumber,
            map_coordinates: hotel.Map,
            hotel_rating: hotel.HotelRating,
            city_name: hotel.CityName,
            country_code: hotel.CountryCode,
            check_in_time: hotel.CheckInTime,
            check_out_time: hotel.CheckOutTime,
            city_code: payload.cityCode, // This should be passed from the calling function
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        }));

        // Use bulkCreate with updateOnDuplicate to handle duplicates
        const result = await tboHotelDetails.bulkCreate(hotelsToAdd, {
            updateOnDuplicate: [
                'hotel_name', 'description', 'hotel_facilities', 'attractions', 
                'images', 'address', 'pin_code', 'city_id', 'country_name', 
                'phone_number', 'fax_number', 'map_coordinates', 'hotel_rating', 
                'city_name', 'country_code', 'check_in_time', 'check_out_time', 
                'city_code', 'updated_at'
            ]
		});
		
		console.log('Result:', result);

        return { 
            status: "success", 
            responseCode: 200, 
            object: { 
                message: `Successfully processed ${result.length} hotel details`,
                count: result.length,
                city_code: payload.cityCode
            } 
        };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addTboHotelDetails; 