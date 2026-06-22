"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("../../constants");
const utils = require("../../utils");

const getMessageHistory = async (payload) => {
    try {
        let loggedInUserId = appConstants.LOGGED_IN_USER_ID;

        let isAdmin = await utils.isUserAdmin(loggedInUserId);
        if (!isAdmin) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad Request",
            };
        }

        let jobIdQry = '';
        if (payload && payload.jobId){
            jobIdQry = ' and msg_job_id = ' + payload.jobId;
        }
        let qry = 'SELECT msg_job_id "msgJobId", msg_dashboard_job_history.msg_id "cohortId", msg_dashboard.msg_name "cohortTitle", msg_dashboard.msg_display_name "cohortDescription", message, image_url "imageUrl", size_of_cohort "sizeOfCohort", no_of_users_received "noOfUsersRecieved", no_of_users_seen "noOfUsersSeen", msg_sent_by "msgSentBy", triggered_on "triggeredOn", job_status "jobStatus" FROM msg_dashboard_job_history, msg_dashboard where msg_dashboard_job_history.msg_id = msg_dashboard.msg_type  ' + jobIdQry + " order by msg_job_id desc";
        let history = await readSeqInstance.query(
            qry,
            { type: QueryTypes.SELECT }
        );

        return { status: "success", "responseCode": 200, list: history };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getMessageHistory;
