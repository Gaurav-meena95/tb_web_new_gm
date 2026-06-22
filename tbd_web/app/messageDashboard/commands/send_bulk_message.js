"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("../../constants");
const utils = require("../../utils");
const msgDashboardModel = require("../models/msg_dashboard_history");
const firebaseChatConnection = require("../../firebase-chat-connection");

const sendMessageToCohort = async (payload) => {
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

        let msgDashboardQry = "SELECT msg_sql_query from msg_dashboard where msg_type = $1";
        let msgQry = await readSeqInstance.query(
            msgDashboardQry,
            { bind: [payload.cohortId], type: QueryTypes.SELECT }
        );
        let cohortQry = msgQry[0].msg_sql_query;
        
        let cohortInfo = await readSeqInstance.query(
            cohortQry,
            { type: QueryTypes.SELECT }
        );

        let cohortData = [];

        for (var i = 0; i < cohortInfo.length; i++){
            cohortData.push({'userId': cohortInfo[i].userid, 'userName': cohortInfo[i].username, 'userEmail': cohortInfo[i].useremail, 'userProfilePic': cohortInfo[i].userprofilepic}); 
        }
        
        payload.cohort = cohortData;

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; 
        var yyyy = today.getFullYear();
        var curDate = yyyy + '-' + mm + '-' + dd;

        let newRecPayload = {
            msg_id: payload.cohortId,
            message: payload.messagePayload.message,
            image_url: payload.messagePayload.media[0].mediaUrl,
            size_of_cohort: cohortInfo.length,
            no_of_users_received: 0,
            no_of_users_seen: 0,
            msg_sent_by: payload.messagePayload.senderId,
            job_status: 'initiated'
        };
        
        let newRec = await msgDashboardModel.create(newRecPayload);
        var resp = {
            messageHistoryId: newRec.msg_job_id
        };
        payload.messageJobId = newRec.msg_job_id;
        let msgDshInfo = await firebaseChatConnection.sendMessageToUsers(payload);

        return { status: "success", "responseCode": 200, object: resp };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = sendMessageToCohort;
