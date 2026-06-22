"use strict";

const seqConfig = require("../../config/sequelize_config");
const {QueryTypes} = require('sequelize');
const { count } = require("console");
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("constants");
const apiHlpr = require('../../api-helper');
const utils = require("../../utils");

const getExperienceViews = async (payload) => {
    try {
        if (!payload.userId){
            payload.userId = appConstants.LOGGED_IN_USER_ID;
        }
        let whereClause = '';
        if (payload.experienceId){
            whereClause = " and experience_views.experience_id = " + payload.experienceId;
        }

        let limitClause = '';
        if (payload.pageNumber !== undefined){
            let pageSize = 10;
            let pageNumber = payload.pageNumber * pageSize;
            limitClause = " limit " + pageNumber + ", " + pageSize;
        }



        let blockedUsers = await utils.getBlockedUsers(payload.userId);
        blockedUsers = blockedUsers.join(',');
        const expViewedUsers = await readSeqInstance.query(
            'select user_full_name "userFullName", user_type "userType", primary_id "viewedByUserId", user_display_picture "displayPicture", count "noOfViews", COALESCE((select 1 from followers where followers.user_id=users.primary_id and followers.follower_user_id=$1),0) "isFollowed" from users, experience, experience_views where experience_views.experience_id = experience.id " + whereClause + " and experience_views.user_id = users.primary_id and users.primary_id not in ($2) and experience.host_id = $1 order by experience_views.updated_on desc ' + limitClause,
            { bind: [payload.userId, blockedUsers], type: QueryTypes.SELECT }
        );
        expViewedUsers.forEach(element => {
            element['viewedByUserId'] = apiHlpr.encrypt(element['viewedByUserId'].toString());
        });
        return { status: "success", "responseCode": 200, object: expViewedUsers};
    } catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getExperienceViews;
