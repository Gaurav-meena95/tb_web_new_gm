"use strict";

const ExperienceViews = require("../models/experience_views");
const Experience = require("../models/experience");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;
const apiHelper = require('../../api-helper');
const appConstants = require("../../constants");

const addExperienceViews = async (payload) => {
    try {
        // payload.userId = apiHelper.decrypt(payload.userId);

        //BELOW LINE SHOULD BE REPLACED WITH DECODED JWT USER ID 
        let loggedInUserId = appConstants.LOGGED_IN_USER_ID;
        payload.userId = appConstants.LOGGED_IN_USER_ID;

        let newRec = {
            user_id: loggedInUserId,
            experience_id: payload.experienceId,
            count: 1
        };

        let foundItem = await ExperienceViews.findOne({ where: { user_id: payload.userId, experience_id: payload.experienceId } });
        console.log('after found item' + JSON.stringify(foundItem));
        let expView;
        if (!foundItem) {
            expView = await ExperienceViews.create(newRec);
            await Experience.update({ no_of_views: writeSeqInstance.literal('no_of_views + 1') }, { where: { id: payload.experienceId } });
        } else {
            console.log('Rec found');
            expView = await ExperienceViews.update({ count: writeSeqInstance.literal('count + 1') }, { where: { user_id: payload.userId, experience_id: payload.experienceId } });
        }

        /* ExperienceViews.findOne({where:{user_id: payload.userId,experience_id: payload.experienceId }}).then(function (foundItem) {
            if (!foundItem) {
                // ITEM NOT FOUND, CREATE A NEW ONE
                ExperienceViews.create(newRec)
                    .then(onCreate)
                    .catch(onError);
            } else {
                // FOUND AN ITEM, UPDATE IT
                ExperienceViews.update({count: Sequelize.literal('count + 1')}, {where: {user_id: payload.userId,experience_id: payload.experienceId }})
                    .then(onUpdate)
                    .catch(onError);
                ;
            }
        }).catch(onError); */

        return { status: 200, object: { viewId: expView.id } };
    } catch (error) {
        console.log('while adding exp: ' + error.message);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addExperienceViews;




