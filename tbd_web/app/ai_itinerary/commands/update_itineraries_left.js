"use strict";

const { Op } = require('sequelize');
const appConstants = require("../../constants");
const AiPackagesOwned = require("../models/ai_packages_owned");

const updateAiPackagesOwned = async (payload) => {
    try {
        payload.user_id = appConstants.LOGGED_IN_USER_ID;

        if (!(payload.aiPackageId)){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }

        const now = new Date();
        const aiPackageUsersInfo = await AiPackagesOwned.findOne({
            where: {
                id: payload.aiPackageId,
                package_start_time: {
                    [Op.lte]: now
                },
                package_end_time: {
                    [Op.gte]: now
                }
            }
        });

        if (!aiPackageUsersInfo) {
            return {
                status: "success",
                responseCode: 200,
                warning: 'No package found or package expired',
                object: {}
            };
        }

        aiPackageUsersInfo.no_of_itineraries = aiPackageUsersInfo.no_of_itineraries - 1;

        await aiPackageUsersInfo.save();

        return {
            status: "success",
            responseCode: 200,
            object: { 
                aiPackageId: aiPackageUsersInfo.id,
                itinerariesLeft: aiPackageUsersInfo.no_of_itineraries
            }
        };
    } catch (error) {
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = updateAiPackagesOwned;
