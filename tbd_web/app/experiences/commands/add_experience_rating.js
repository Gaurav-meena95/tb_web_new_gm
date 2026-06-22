"use strict";

const ExperienceRating = require("../models/experience_rating");
const apiHelper = require('../../api-helper');
const appConstants = require("../../constants");

const addExperienceRating = async (payload) => {
    try {
        // payload.user_id = apiHelper.decrypt(payload.user_id);
        payload.user_id = appConstants.LOGGED_IN_USER_ID;

        let foundItem = await ExperienceRating.findOne({ where: { user_id: payload.user_id, experience_id: payload.experience_id } });
        let ratingId = -1;
        if (!foundItem) {
            const { user_id, experience_id, rating, review } = payload;
            let experienceRating = await ExperienceRating.create({
                user_id,
                experience_id,
                rating,
                review,
            });
            ratingId = experienceRating.id;
        } else {
            ratingId = foundItem.id;
            let experienceRating = await ExperienceRating.update({ rating: payload.rating, review: payload.review}, { where: { user_id: payload.user_id, experience_id: payload.experience_id } });
        }
        
        return { status: "success", "responseCode": 200, object: { id: ratingId } };
    } catch (error) {
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addExperienceRating;
