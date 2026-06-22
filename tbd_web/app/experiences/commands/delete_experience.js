"use strict";

const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const Experience = require("../models/experience");
const utils = require("../../utils");
const appConstants = require("../../constants");

const deleteExperience = async (payload) => {
    try {
        let isAdmin = false;
        //NOTE:
        //DELETING SHOULD BE DONE BY THE SAME PERSON OR BY THE ADMIN
        payload.userId = appConstants.LOGGED_IN_USER_ID;
        isAdmin = await utils.isUserAdmin(payload.userId);
        console.log('first');
        if (!payload.experienceId) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad Request",
            };
        }

        if (!isAdmin){
            let foundItem = await Experience.findOne({ where: { host_id: payload.userId, id: payload.experienceId } });
    
            if (!foundItem) {
                return {
                    status: "error",
                    responseCode: 400,
                    errorMessage: "You can not delete others experience"
                };
            }
        }

        console.log('B4');
        let newExp = {};
        newExp['is_deleted'] = 1;
        const experience = await Experience.update(
            newExp,
            { where: { id: payload.experienceId } }
        );
        console.log('After');
        return {
            status: "success",
            responseCode: 200
        };
    } catch (error) {
        console.log("Error Occured: " + error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = deleteExperience;
