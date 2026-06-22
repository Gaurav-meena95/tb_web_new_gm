"use strict";

const msgDashboardHistory = require("../models/msg_dashboard_history");
const appConstants = require("../../constants");

const addMsgHistory = async (payload) => {
    try {
        payload.userId = appConstants.LOGGED_IN_USER_ID;
        let newRec = {
            msg_id: payload.cohortId,
            message: payload.message,
            image_url: payload.imageUrl,
            size_of_cohort: payload.cohortSize,
            no_of_users_seen: 0,
            msg_sent_by: payload.userId,
            triggered_on: payload.triggeredOn,
            job_status: payload.jobStatus
        };

        const historyRec = await msgDashboardHistory.create(newRec);
        return { status: "success", "responseCode": 200, object: { id: historyRec.msg_job_id } };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addMsgHistory;
