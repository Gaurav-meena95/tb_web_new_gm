"use strict";

const tboCities = require("../models/tbo_cities");
const appConstants = require("../../constants");

const getTboCities = async (payload) => {
    try {
        const whereClause = { is_active: true };
        if (payload && payload.countryCode) {
            whereClause.country_code = payload.countryCode;
        }

        // Add search filter if provided
        // if (payload.searchTerm) {
        //     whereClause.city_name = {
        //         [require('sequelize').Op.iLike]: `%${payload.searchTerm}%`
        //     };
        // }

        const cities = await tboCities.findAll({
            where: whereClause,
            order: [['city_name', 'ASC']],
            attributes: ['city_code', 'city_name']
		});
		//console.log('Cities:', cities);

        return { 
            status: "success", 
            responseCode: 200, 
            object: {
                cities: cities,
                count: cities.length,
                //country_code: payload.countryCode ? payload.countryCode : null
            }
        };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getTboCities; 