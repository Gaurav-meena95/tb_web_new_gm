"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("constants");

const getLocations = async (payload) => {
    try {

        if (payload.location){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }

        let qry = "SELECT location_id locationId, location_name location, location_lat latitude, location_long longitude, city, state, country FROM all_locations where location_name like '%$1%' order by case when location_name like '$1%' then 0 else 1 end";
        let allLocs = await readSeqInstance.query(
            qry,
            { bind: [payload.location], type: QueryTypes.SELECT }
        );
        return { status: "success", "responseCode": 200, list: allLocs };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getLocations;
