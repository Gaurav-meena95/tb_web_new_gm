"use strict";

const apiHelper = require("../../api-helper");
const ExperienceRating = require("../models/experience_rating");

const updateExperienceRating = async (payload) => {
    try {
        //payload.user_id = apiHelper.decrypt(payload.user_id);
        payload.user_id = appConstants.LOGGED_IN_USER_ID;;

        const { id, user_id, experience_id, rating, review } = payload;
        const expRating = await ExperienceRating.findByPk(id);
        if (!expRating) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Your rating doesn't exists.",
            };
        }

        expRating.user_id = user_id;
        expRating.experience_id = experience_id;
        expRating.rating = rating;
        expRating.review = review;

        await expRating.save();

        return {
            status: "success",
            responseCode: 200,
            object: { experienceId: expRating.id },
        };
    } catch (error) {
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = updateExperienceRating;
