"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("../../constants");

const getUsersFollowInfo = async (payload) => {
    try {

        if (!payload.otherUserId){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }
        payload.otherUserId = apiHelper.decrypt(payload.otherUserId)
        
        payload.userId = appConstants.LOGGED_IN_USER_ID;
        //payload.userId = 1744258;
        console.log(payload.userId);

        let qry = "CALL isFollowing($1, $2)";
        let isFollowing = await readSeqInstance.query(
            qry,
            { bind: [payload.otherUserId, payload.userId], type: QueryTypes.SELECT }
        );

        console.log(JSON.stringify(isFollowing));
        
        qry = "CALL isFollowing($1, $2)";
        let isFollowed = await readSeqInstance.query(
            qry,
            { bind: [payload.userId, payload.otherUserId], type: QueryTypes.SELECT }
        );
        console.log(JSON.stringify(isFollowed));
        
        return { status: "success", "responseCode": 200, isFollowing: isFollowing[0]['count'] > 0, isFollowed: isFollowed[0]['count'] > 0 };
        }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getUsersFollowInfo;
