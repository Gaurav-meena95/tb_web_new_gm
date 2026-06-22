"use strict";

const seqConfig = require("../../config/sequelize_config");
const apiHelper = require("../../api-helper");
const {getToken} = require('../../auth/commands/jwtValidation');
const {QueryTypes} = require('sequelize');
const { count } = require("console");
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("../../constants");

const getExperienceRating = async (payload) => {
    try {
        if (payload && payload.experienceId){
            payload.userId = appConstants.LOGGED_IN_USER_ID;
            const ratings = await readSeqInstance.query(
                'SELECT experience_rating.rating,experience_rating.review, users.user_full_name name, users.user_display_picture, experience_rating.created_on "ratingTime", users.primary_id "userId", users.user_type "userType" FROM experience_rating, users where users.primary_id = experience_rating.user_id and experience_rating.experience_id = $1',
                { bind: [payload.experienceId], type: QueryTypes.SELECT }
            );
            if (ratings){
                ratings.forEach(element => {
                    const token = getToken(element.userId);
                    element.userId = apiHelper.encrypt(token);
                });
            }
            return { status: "success", "responseCode": 200, object: ratings};
        }else{
            return {status: "error","responseCode": 400, "errorMessage": "Bad Request"};
        }
    } catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getExperienceRating;
