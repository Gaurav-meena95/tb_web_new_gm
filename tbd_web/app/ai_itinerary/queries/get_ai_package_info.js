"use strict";

const aiPackagesOwned = require("../models/ai_packages_owned");
const appConstants = require("../../constants");
const { Op } = require('sequelize');
const { object } = require("joi");
const { QueryTypes } = require('sequelize');
const seqConfig = require("../../config/sequelize_config");
const readSeqInstance = seqConfig.read_sequelize;

const getUsersAiPackages = async (payload) => {
    try {

        if (appConstants.LOGGED_IN_USER_ID == undefined || appConstants.LOGGED_IN_USER_ID == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
		}
		
		if (payload && payload.checkVerified) {
			let isVerifedQuery = "SELECT is_verified FROM users WHERE primary_id = $1";
			console.log('Is Verifed Query', isVerifedQuery);
			let isVerifed = await readSeqInstance.query(isVerifedQuery, { bind: [appConstants.LOGGED_IN_USER_ID], type: QueryTypes.SELECT });
			console.log('Is Verifed', isVerifed);
			if (isVerifed.length > 0 && isVerifed[0].is_verified == 0) {
				return {
					status: "error",
					responseCode: 403,
					errorMessage: "User is not verified",
				};
			}
			else if (isVerifed.length > 0 && isVerifed[0].is_verified == 1) {
				return {
					status: "success",
					responseCode: 200,
					errorMessage: "User is verified",
				};
			}
		}
		//return;
        let resData;

        if (payload && payload.history){
            resData = await aiPackagesOwned.findAll({
                where: { 
                    user_id: appConstants.LOGGED_IN_USER_ID 
                },
                order: [
                    ['id', 'DESC']
                ]
            });
        }else{
            const now = new Date();
            resData = await aiPackagesOwned.findOne({
                where: { 
                    user_id: appConstants.LOGGED_IN_USER_ID,
                    package_start_time: {
                        [Op.lte]: now
                    },
                    package_end_time: {
                        [Op.gte]: now
                    } 
                },
                order: [
                    ['id', 'DESC']
                ]
            });
        }

        let lastAiCreatedAt = {};
        lastAiCreatedAt.timeFromLastAiCreated = await getLastAiCreated(appConstants.LOGGED_IN_USER_ID);
        let recsPresent = true;
        if (typeof(resData) == 'object'){
            if (resData == null){
                recsPresent = false;
            } else if (Object.keys(resData).length == 0){
                recsPresent = false;
            }
        }else if (resData.length == 0){
            recsPresent = false;
        }

        let totalItineraries = 0;
        let verifiedDetails = {};
        let usersItineraries = await readSeqInstance.query(
            'SELECT count(*) cnt FROM ai_itinerary WHERE user_id = $1',
            { bind: [appConstants.LOGGED_IN_USER_ID], type: QueryTypes.SELECT }
        );

        totalItineraries = usersItineraries[0].cnt;
        if (!recsPresent){
            let verifiedUserQuery = "SELECT s.user_id, s.subscription_type, s.subscription_start_time, s.subscription_end_time,( SELECT COUNT(*) FROM ai_itinerary m WHERE m.user_id = s.user_id AND m.created_at > s.subscription_start_time) AS itineraries_created FROM verified_orders s where s.id = ( SELECT MAX(id) FROM verified_orders WHERE user_id = $1 and order_status = 1 )";
            verifiedDetails = await readSeqInstance.query(
                verifiedUserQuery,
                { bind: [appConstants.LOGGED_IN_USER_ID], type: QueryTypes.SELECT }
            );
        }

        return { status: "success", "responseCode": 200, "object": {"aiPackages": resData, "totalItineraries": totalItineraries, "lastAiCreatedAt": lastAiCreatedAt, "verifiedDetails": verifiedDetails} };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

async function getLastAiCreated(userId){
    let lastAiCreated = await readSeqInstance.query(
        "select cast (EXTRACT(EPOCH FROM (current_timestamp AT TIME ZONE 'UTC' - created_at)) / 60 as int) AS difference_minutes from ai_itinerary where user_id = $1 order by id desc limit 1",
        { bind: [userId], type: QueryTypes.SELECT }
    );
    let timeFromLastAiCreated = 0;
    if (lastAiCreated.length > 0){
        timeFromLastAiCreated = lastAiCreated[0]['difference_minutes'];
    }
    return timeFromLastAiCreated;
}

module.exports = getUsersAiPackages;
