"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const addExpView = require('../commands/add_experience_views');
const apiHlpr = require('../../api-helper');
const appConstants = require("../../constants");
const utils = require("../../utils");

const getExperiences = async (post) => {
    try {
        //TO STOP THE LOGGING OF QUERIES WE SHOULD BE ADDING THE BELOW CODE
        readSeqInstance.options.logging = false;

        post.userId = appConstants.LOGGED_IN_USER_ID;
        const loggedInUserId = post.userId;
        let isAdmin = false;

        const forCMS = post.forCMS;
        if (forCMS) {
            isAdmin = await utils.isUserAdmin(post.userId);
        }

        let whereCondn = "";
        const filters = [];
        let filterApplied = false;
        if (post.filter) {
            if (post.filter.experienceId) {
                filters.push(" experience.id = " + post.filter.experienceId);
            }
            if (post.filter.categoryId) {
                filters.push(" category_id = " + post.filter.categoryId);
            }
            if (post.filter.category) {
                filters.push(" experience_categories.category = '" + post.filter.category + "'");
            }
            if (post.filter.priceRange) {
                filters.push(" (pricing BETWEEN " + post.filter.priceRange.minValue + " and " + post.filter.priceRange.maxValue + ")");
            }
            if (post.filter.dateRange) {
                filters.push(" experience.id in ( SELECT experience_id FROM experience_calendar_slots where slot_date BETWEEN '" + post.filter.dateRange.start + "' and '" + post.filter.dateRange.end + "'  group by experience_id )");
            }
            if (post.filter.filterText) {
                filters.push(" (experience.title ILIKE '%" + post.filter.filterText + "%' OR experience.content ILIKE '%" + post.filter.filterText + "%' OR experience.location ILIKE '%" + post.filter.filterText + "%') ");
            }
            if (forCMS && isAdmin && !post.filter.allData) {
                filters.push(" experience.host_id = " + post.userId);
            }
            if (forCMS && !isAdmin) {
                filters.push(" experience.host_id = " + post.userId);
            }


            //ADD OTHER FILTERS LIKE STATUS OR OTHERS BASED ON REQUIREMENT.
            if (filters.length > 0) {
                whereCondn = " and " + filters.join(" and ");
                filterApplied = true;
            }
        } else if (forCMS && !isAdmin) {
            whereCondn = " and experience.host_id = " + post.userId;
        }
        
        let baseQry = "SELECT experience.id, experience.type, title, category_id, experience_categories.category, experience.location_id, location, host_id, rating, experience.content, expiry_date, status, host_instructions, batch_size, min_pax, last_booking_time, original_pricing originalPricing, pricing, currency, no_of_views, featured, meeting_instructions, contact_number, country_code";
        let qry = baseQry + " FROM users, experience, experience_categories WHERE users.primary_id = experience.host_id and experience.is_deleted = 0 and experience.category_id = experience_categories.id " + whereCondn + " order by id desc";
        
        if (post.filter && post.filter.trending && post.filter.trending.type){
            // Preserve existing filters and add trending filter
            let trendingWhereCondn = whereCondn + " and experience_trending.card_type = '" + post.filter.trending.type + "'";
            qry = baseQry + " FROM users, experience, experience_categories, experience_trending WHERE users.primary_id = experience.host_id and experience.is_deleted = 0 and experience.category_id = experience_categories.id and experience.id = experience_trending.experience_id " + trendingWhereCondn + " ORDER BY experience_trending.seq::integer ASC";
        }

        //IF A USER FILTERS BY LOCATION, PAYLOAD WILL HAVE LOCATIONID AND BASED ON THAT WE FILTER AND ORDER BY THE DISTANCE
        if (post.filter && (post.filter.locationId || post.filter.location)) {
            let selLocDetails;

            if (post.filter.locationId) {
                selLocDetails = await readSeqInstance.query(
                    "select all_locations.location_lat, all_locations.location_long from all_locations where all_locations.location_id = $1",
                    { bind: [post.filter.locationId], type: QueryTypes.SELECT }
                );
            }
            if (post.filter.location) {
                let locationName = post.filter.location.toLowerCase();
                selLocDetails = await readSeqInstance.query(
                    "select all_locations.location_lat, all_locations.location_long from all_locations where LOWER(all_locations.location_name) = $1",
                    { bind: [locationName], type: QueryTypes.SELECT }
                );
            }

            let selLocLat = 0;
            let selLocLng = 0;
            if (selLocDetails.length > 0) {
                selLocLat = selLocDetails[0].location_lat;
                selLocLng = selLocDetails[0].location_long;
            }
            else {
                return {
                    "status": "success",
                    "responseCode": 200,
                    "object": []
                };
            }

            //distance range of the experiences
            let distanceRange = 150;
            if (!filterApplied && post.filter.allData){
                qry = baseQry + ', (SQRT(POW(69.1 * (all_locations.location_lat - ' + selLocLat + '), 2) +POW(69.1 * (' + selLocLng + ' - all_locations.location_long) * COS(all_locations.location_lat / 57.3), 2)))*1.60934 AS distance FROM users, experience, experience_categories,  all_locations WHERE users.primary_id = experience.host_id and experience.is_deleted = 0 and experience.category_id = experience_categories.id and experience.location_id = all_locations.location_id order by distance limit 20';
            }
            /*else if (post.filter.filterText) {
                qry = baseQry + ', (SQRT(POW(69.1 * (all_locations.location_lat - ' + selLocLat + '), 2) +POW(69.1 * (' + selLocLng + ' - all_locations.location_long) * COS(all_locations.location_lat / 57.3), 2)))*1.60934 AS distance FROM users, experience, experience_categories,  all_locations WHERE users.primary_id = experience.host_id and experience.is_deleted = 0 and experience.category_id = experience_categories.id and experience.location_id = all_locations.location_id ' + whereCondn;
                
            }*/
            else {
                qry = baseQry + ', (SQRT(POW(69.1 * (all_locations.location_lat - ' + selLocLat + '), 2) +POW(69.1 * (' + selLocLng + ' - all_locations.location_long) * COS(all_locations.location_lat / 57.3), 2)))*1.60934 AS distance FROM users, experience, experience_categories,  all_locations WHERE users.primary_id = experience.host_id and experience.is_deleted = 0 and experience.category_id = experience_categories.id and experience.location_id = all_locations.location_id ' + whereCondn + ' AND (location_lat > ' + selLocLat + ' - ' + distanceRange + ' / (69.1/1.61)  AND location_lat < ' + selLocLat + ' + ' + distanceRange + ' / (69.1/1.61)  AND location_long > ' + selLocLng + ' - ' + distanceRange + ' / (53/1.61)  AND location_long < ' + selLocLng + ' + ' + distanceRange + ' / (53/1.61)) order by distance';
            }

            filterApplied = true;
        }

        let exps = await readSeqInstance.query(
            qry,
            { type: QueryTypes.SELECT }
        );
        console.log('exps', exps);
        
        if (exps.length == 0) {
            qry = `
                SELECT 
                    experience.id, 
                    experience.type, 
                    title, 
                    category_id, 
                    experience_categories.category, 
                    experience.location_id, 
                    location, 
                    host_id, 
                    rating, 
                    experience.content, 
                    expiry_date, 
                    status, 
                    host_instructions, 
                    batch_size, 
                    min_pax, 
                    last_booking_time, 
                    original_pricing AS originalPricing, 
                    pricing, 
                    currency, 
                    no_of_views, 
                    featured, 
                    meeting_instructions, 
                    contact_number, 
                    country_code, 
                    (SQRT(POW(69.1 * (all_locations.location_lat - 25.4319662), 2) + POW(69.1 * (81.8805379 - all_locations.location_long) * COS(all_locations.location_lat / 57.3), 2)))*1.60934 AS distance 
                FROM 
                    users, 
                    experience, 
                    experience_categories,  
                    all_locations 
                WHERE 
                    users.primary_id = experience.host_id 
                    AND experience.is_deleted = 0 
                    AND experience.category_id = experience_categories.id 
                    AND experience.location_id = all_locations.location_id  
                    ${whereCondn} 
                ORDER BY 
                    distance;
            `;
            exps = await readSeqInstance.query(
                qry,
                { type: QueryTypes.SELECT }
            );
            console.log('exps-2', exps);
        }
            

        let packages = [];
        let dailyExps = [];

        //ADDING ITINERARY AND CALENDAR SLOTS DATA FOR THE EXPERIENCE
        for (var i = 0; i < exps.length; i++) {
            let item = exps[i];
            var hostId = item.host_id;

            let itinData = await readSeqInstance.query(
                "select id, name, content from experience_itinerary where experience_id = $1",
                { bind: [item.id], type: QueryTypes.SELECT }
            );
            item.itinerary = itinData;

            item.isOwnPost = item.host_id == post.userId;

            let expMedia = await readSeqInstance.query(
                "select media_url,media_type,image_height,image_width,is_default,media_thumbnail from experience_media where experience_id = $1",
                { bind: [item.id], type: QueryTypes.SELECT }
            );

            for (var m = 0; m < expMedia.length; m++) {
                if (expMedia[m].media_url.substr(0, 4) != 'http') {
                    if (!expMedia[m].media_url.startsWith(appConstants.EXP_IMGCOVERPHOTO)){
                        expMedia[m].media_url = appConstants.EXP_IMGCOVERPHOTO + expMedia[m].media_url;
                    }
                } 

                if (expMedia[m].media_thumbnail.substr(0, 4) != 'http') {
                    if (!expMedia[m].media_thumbnail.startsWith(appConstants.EXP_THUMBNAIL)){
                        expMedia[m].media_thumbnail = appConstants.EXP_THUMBNAIL + expMedia[m].media_thumbnail;
                    }
                }
            }

            item.media = expMedia;

            let calSlots = await readSeqInstance.query(
                "select id, slot_date, start_time, end_time, batch_size, status from experience_calendar_slots where experience_id = $1 and slot_date >= CURRENT_TIMESTAMP",
                { bind: [item.id], type: QueryTypes.SELECT }
            );
            //IF A USER SELECTS A SPECIFIC EXPERIENCE THEN WE GET THE TICKET AVAILABILITY
            if (exps.length == 1){
                for (var j = 0; j < calSlots.length; j++) {
                    let availTkts = await readSeqInstance.query(
                        "SELECT * FROM sp_getTicketsAvailable($1)",
                        { bind: [calSlots[j].id], type: QueryTypes.SELECT }
                    );
                    calSlots[j].ticketsLeft = availTkts[0].ticketsavailable;
                }
            }
            item.calendarSlots = calSlots;

            let expRatings = await readSeqInstance.query(
                "select avg(rating) avgRating, count(id) numberOfRatings, SUM(CASE WHEN review <> '' THEN 1 ELSE 0 END) as  numberOfReviews  from experience_rating where experience_id = $1",
                { bind: [item.id], type: QueryTypes.SELECT }
            );
            item.rating = 0;
            item.numberOfRatings = 0;
            item.numberOfReviews = 0;
            if (expRatings.length > 0) {
                item.rating = expRatings[0].avgRating;
                item.numberOfRatings = expRatings[0].numberOfRatings;
                item.numberOfReviews = expRatings[0].numberOfReviews;
            }

            let hostInfo = await readSeqInstance.query(
                "select * from getUserProfile($1)",
                { bind: [hostId], type: QueryTypes.SELECT }
            );

            let hostDetail = {
                userName: hostInfo[0].user_full_name,
                phoneNumber: hostInfo[0].user_phone_number,
                email: hostInfo[0].user_email,
                about: hostInfo[0].user_about,
                homeLocation: hostInfo[0].user_home_location,
                city: hostInfo[0].user_city,
                state: hostInfo[0].user_state,
                country: hostInfo[0].user_country,
                userDisplayPicture: hostInfo[0].user_display_picture,
                userDisplayPictureOriginal: hostInfo[0].user_display_picture_original,
                userType: hostInfo[0].user_type,
                avgRatings: hostInfo[0].avg_rating,
                totalRatings: hostInfo[0].total_ratings,
                followers: hostInfo[0].followers_count,
                followings: hostInfo[0].following_count,
                totalReviews: hostInfo[0].total_reviews,
                roleType: hostInfo[0].user_status
            }

            item.hostDetails = hostDetail;

            item.host_id = await apiHlpr.encrypt(item.host_id.toString());

            //DELETING THE ITINERARY RELATED INFO AS WE ARE ADDING IT AS AN ARRAY
            delete item.itineraryId;
            delete item.itineraryName;
            delete item.exp_itinerary;

            if (item.type == 'package') {
                packages.push(Object.assign({}, item));
            } else {
                dailyExps.push(Object.assign({}, item));
            }
        }

        //INSERT OR UPDATE EXPERIENCE VIEW IF PAYLOAD IS FILTERED WITH A PARTICULAR EXPERIENCE ID AND EXPERIENCE IS NOT HOSTED BY LOGGED IN USER
        if ((exps.length > 0) && (post.filter && post.filter.experienceId) && (exps[0].host_id != loggedInUserId)) {
            addExpView({ userId: loggedInUserId, experienceId: exps[0].id });
        }

        let filteredData = {};
        //If filters are applied
        if (filterApplied) {
            filteredData = { "packages": packages, "dailyExperiences": dailyExps , qry: qry};
        }

        return { status: "success", "responseCode": 200, object: exps, "filteredData": filteredData, qry: qry };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getExperiences;

/*
payload sample
{
    "reason": "getExperiences",
    "data":{"filter":{"experienceId":1}},
    "token": ""
}
*/
