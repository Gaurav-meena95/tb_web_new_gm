"use strict";

const msgDashboardHistory = require("../models/msg_dashboard_history");
const appConstants = require("../../constants");
const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const writeSeqInstance = seqConfig.write_sequelize;

const updateMessageDashboardHistory = async (payload) => {
    try {
        payload.user_id = appConstants.LOGGED_IN_USER_ID;

        if (!payload.msgJobId) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad Request",
            };
        }

        let updateRec = {};
        let msgHistoryUpdatedRec = {msg_job_id: -1};

        if (payload.isMessageSeen){
            msgHistoryUpdatedRec = await writeSeqInstance.query(
                "update msg_dashboard_job_history set no_of_users_seen = no_of_users_seen + 1 where msg_job_id = $1",
                { bind: [payload.msgJobId], type: QueryTypes.UPDATE}
            );
        }else{            
            if (payload.noOfUsersSeen)
                updateRec["no_of_users_seen"] = payload.noOfUsersSeen;
            if (payload.jobStatus) 
                updateRec["job_status"] = payload.jobStatus;
    
            msgHistoryUpdatedRec = await msgDashboardHistory.update(
                updateRec,
                { where: { msg_job_id: payload.msgJobId } }
            );
        }


        return {
            status: "success",
            responseCode: 200
        };
    } catch (error) {
        appConstants.sentryObj.captureException(error);
        return { status: "error", responseCode: 400, message: error.message };
    }
};

module.exports = updateMessageDashboardHistory;
