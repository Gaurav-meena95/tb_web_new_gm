"use strict";

const tboCountries = require("../models/tbo_countries");
const appConstants = require("../../constants");

const getTboCountries = async (payload) => {
    try {
        const whereClause = {
            is_active: true
        };

        // Add search filter if provided
        if (payload.searchTerm) {
            whereClause.country_name = {
                [require('sequelize').Op.iLike]: `%${payload.searchTerm}%`
            };
        }

        const countries = await tboCountries.findAll({
            where: whereClause,
            order: [['country_name', 'ASC']],
            attributes: ['country_code', 'country_name']
        });

        return { 
            status: "success", 
            responseCode: 200, 
            object: {
                countries: countries,
                count: countries.length
            }
        };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getTboCountries; 