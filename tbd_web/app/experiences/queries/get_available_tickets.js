"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("constants");

const getAvailableTickets = async (payload) => {
    try {
        if (payload && payload.calendarSlotId) {
            const availTkts = await readSeqInstance.query(
                "select * from sp_getTicketsAvailable($1)",
                { bind: [payload.calendarSlotId], type: QueryTypes.SELECT }
            );
            return { status: "success", "responseCode": 200, object: availTkts[0][0] };
        }
        else {
            return { status: "error", "responseCode": 400, "errorMessage": "Bad Request" };
        }

    } catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getAvailableTickets;
