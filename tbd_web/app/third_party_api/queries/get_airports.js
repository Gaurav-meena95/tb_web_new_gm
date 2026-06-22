"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("constants");

const getAllAirport = async (payload) => {
    try {
        //ORDERING AIRPORTS BASED FROM CENTER OF INDIA DISTANCE
        let indiaLat = 20.5937;
        let indiaLng = 78.9629;
        let qry = "SELECT id, airport_name, airport_code, airport_timezone, lat, lng, city_code, city_name, country_code, country_name, (SQRT(POW(69.1 * (lat - " + indiaLat +"), 2) +POW(69.1 * (" + indiaLng + " - lng) * COS(lat / 57.3), 2)))*1.60934 AS distance  FROM air_port_info";
        let whereClause = " where not_in_use = 0";
        if (payload.filterBy) {
            const filterBy = payload.filterBy.trim().toLowerCase();
            if (filterBy) {
                whereClause += ` and (airport_code ilike '%${filterBy}%' or airport_name iLIKE '%${filterBy}%' OR city_name iLIKE '%${filterBy}%') ORDER BY CASE WHEN airport_code ilike '${filterBy}%' THEN 1 ELSE 2 END, distance, airport_code `;
            }
        }

        qry += whereClause;
        let allLocs = await readSeqInstance.query(
            qry,
            {type: QueryTypes.SELECT }
        );
        return { status: "success", "responseCode": 200, list: allLocs };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getAllAirport;
