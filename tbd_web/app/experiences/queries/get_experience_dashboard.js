"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require("sequelize");
const readSeqInstance = seqConfig.read_sequelize;
const addExpView = require("../commands/add_experience_views");
const apiHlpr = require('../../api-helper');
const appConstants = require("../../constants");

const getExperienceDashboard = async (payload) => {
    try {
        //TO STOP THE LOGGING OF QUERIES WE SHOULD BE ADDING THE BELOW CODE
        readSeqInstance.options.logging = false;

        if (!(payload && payload.latitude && payload.longitude)) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad Request",
            };
        }

        let typeFilter = '';
        //value can be "package" or "experience"
        if (payload.type) {
            typeFilter = ' and experience.type = "' + payload.type + '"';
        }

        //near by experiences for users
        let selLocLat = payload.latitude;
        let selLocLng = payload.longitude;
        let qry =
            "SELECT experience.id, users.user_full_name 'hostName', users.user_status 'roleType', (select avg(rating) from user_rating where user_rating.user_id=users.primary_id) as avg_rating, experience.type, title, category_id, experience_categories.category,experience_categories.image_url 'categoryImageUrl', experience.location_id, location, host_id, rating,experience.content, expiry_date, STATUS, host_instructions, batch_size,last_booking_time,   original_pricing 'originalPricing', pricing, currency, no_of_views, featured, meeting_instructions,contact_number, country_code, (SQRT(POW(69.1 * (all_locations.location_lat - " +
            selLocLat +
            "), 2) +POW(69.1 * (" +
            selLocLng +
            " - all_locations.location_long) * COS(all_locations.location_lat / 57.3), 2)))*1.60934 AS distance FROM users, experience, experience_categories,  all_locations WHERE users.primary_id = experience.host_id and experience.category_id = experience_categories.id and experience.is_deleted = 0 and experience.location_id = all_locations.location_id " + typeFilter + " order by distance";

        // let expsByDistance = await readSeqInstance.query(qry, {
        //     type: QueryTypes.SELECT,
        // });
        let storedProcRes = await readSeqInstance.query(
            "select * from sp_getExperienceDashboard($1, $2)",
            { bind: [selLocLat, selLocLng], type: QueryTypes.SELECT }
        );
        
        let tmpArray = [];
        let distCategories = [];
        let allDailyExps = [];
        let allPackages = [];

        let expsIds = [];
        let expsByDistance = [];
        Object.keys(storedProcRes).forEach(element => {
            expsByDistance.push(storedProcRes[element]);
        });
        expsIds = expsByDistance.map(itm => itm.id);
        let allIds = expsIds.join();
        let allExpObjsByIds = {};
        let itinDataAll = await readSeqInstance.query(
            "select experience_id, id, name, content from experience_itinerary where experience_id in (" + allIds + ")",
            { type: QueryTypes.SELECT }
        );
        let expMediaAll = await readSeqInstance.query(
            "select experience_id, media_url,media_type,image_height, image_width, is_default, media_thumbnail from experience_media where experience_id in (" + allIds + ")",
            { type: QueryTypes.SELECT }
        );
        let calSlotsAll = await readSeqInstance.query(
            "select experience_id, id, slot_date, start_time, end_time, batch_size, status from experience_calendar_slots where experience_id in (" + allIds + ")  and slot_date >= CURRENT_TIMESTAMP",
            { type: QueryTypes.SELECT }
        );
        let expRatingsAll = await readSeqInstance.query(
            "select experience_id, avg(rating) avgRating, count(id) numberOfRatings, SUM(CASE WHEN review <> '' THEN 1 ELSE 0 END) as reviews  from experience_rating where experience_id in (" + allIds + ") group by experience_id",
            { type: QueryTypes.SELECT }
        );
        //ADDING ITINERARY AND CALENDAR SLOTS DATA FOR THE EXPERIENCE
        for (var i = 0; i < expsByDistance.length; i++) {
            let item = expsByDistance[i];
            let itinData = itinDataAll.filter(obj => { return obj.experience_id == item.id; });
            item.itinerary = itinData;

            let expMedia = expMediaAll.filter(obj => { return obj.experience_id == item.id; });

            for (var m = 0; m < expMedia.length; m++) {
                if (expMedia[m].media_url.substr(0, 4) != 'http') {
                    expMedia[m].media_url = appConstants.EXP_IMGSQUARE + expMedia[m].media_url;
                } else {
                    if (expMedia[m].media_url.substr(0, 51) == 'https://s3.ap-south-1.amazonaws.com/tbd-prod-media/') {
                        expMedia[m].media_url = expMedia[m].media_url.replace('https://s3.ap-south-1.amazonaws.com/tbd-prod-media/', '');
                        expMedia[m].media_url = appConstants.EXP_IMGSQUARE + expMedia[m].media_url;
                    }
                }

                if (expMedia[m].media_thumbnail.substr(0, 4) != 'http') {
                    expMedia[m].media_thumbnail = appConstants.EXP_IMGSQUARE + expMedia[m].media_thumbnail;
                } else {
                    if (expMedia[m].media_thumbnail.substr(0, 51) == 'https://s3.ap-south-1.amazonaws.com/tbd-prod-media/') {
                        expMedia[m].media_thumbnail = expMedia[m].media_thumbnail.replace('https://s3.ap-south-1.amazonaws.com/tbd-prod-media/', '');
                        expMedia[m].media_thumbnail = appConstants.EXP_IMGSQUARE + expMedia[m].media_thumbnail;
                    }
                }
            }

            item.media = expMedia;
            let calSlots = calSlotsAll.filter(obj => { return obj.experience_id == item.id; });

            for (var j = 0; j < calSlots.length; j++) {
                /*
                Commenting the code
                let availTkts = await readSeqInstance.query(
                    "call sp_getTicketsAvailable($1)",
                    { bind: [calSlots[j].id], type: QueryTypes.SELECT }
                );
                calSlots[j].ticketsLeft = availTkts[0][0].ticketsAvailable;*/
                calSlots[j].ticketsLeft = 500;
            }
            item.calendarSlots = calSlots;
            item.categoryImageUrl = item.categoryimageurl;
            item.hostName = item.hostname;
            item.roleType = item.roletype;
            item.originalPricing = item.originalpricing;

            if (tmpArray.indexOf(item.category_id) < 0) {
                tmpArray.push(item.category_id);
                distCategories.push({ categoryId: item.category_id, category: item.category, imageUrl: appConstants.EXP_CATEGORY + item.categoryImageUrl });
            }

            let expRatings = expRatingsAll.filter(obj => { return obj.experience_id == item.id; });
            item.rating = 0;
            item.numberOfRatings = 0;
            item.numberOfReviews = 0;
            if (expRatings.length > 0) {
                item.rating = expRatings[0].avgRating;
                item.numberOfRatings = expRatings[0].numberOfRatings;
                item.numberOfReviews = expRatings[0].numberOfReviews;
            }
            if (item.host_id.length > 10) {
                item.host_id = apiHlpr.decrypt(item.host_id);
            }

            /*
                Commenting below query as we dont require all the information to show in the dashboard
            let hostInfo = await readSeqInstance.query("call getUserProfile($1)", {
                bind: [item.host_id],
                type: QueryTypes.SELECT,
            });*/

            let hostDetail = { userName: item.hostName, avgRatings: item.avg_rating };
            try {
                if (hostInfo && hostInfo.length > 0) {
                    hostDetail = {
                        userName: hostInfo[0][0].user_full_name,
                        phoneNumber: hostInfo[0][0].user_phone_number,
                        email: hostInfo[0][0].user_email,
                        about: hostInfo[0][0].user_about,
                        homeLocation: hostInfo[0][0].user_home_location,
                        city: hostInfo[0][0].user_city,
                        state: hostInfo[0][0].user_state,
                        country: hostInfo[0][0].user_country,
                        userDisplayPicture: hostInfo[0][0].user_display_picture,
                        userDisplayPictureOriginal: hostInfo[0][0].user_display_picture_original,
                        userType: hostInfo[0][0].user_type,
                        avgRatings: hostInfo[0][0].avg_rating,
                        totalRatings: hostInfo[0][0].total_ratings,
                        followers: hostInfo[0][0].followers_count,
                        followings: hostInfo[0][0].following_count,
                        totalReviews: hostInfo[0][0].total_reviews,
                    };
                }
            }
            catch (err) { }

            item.hostDetails = hostDetail;
            item.host_id = apiHlpr.encrypt(item.host_id.toString());
            if (item.type == 'package') {
                allPackages.push(Object.assign({}, item));
            } else {
                allDailyExps.push(Object.assign({}, item));
            }
            allExpObjsByIds[item.id] = Object.assign({}, item);
        }
        
        let noOfItemsInCard = 5;
        noOfItemsInCard =
            allDailyExps.length > allDailyExps.length
                ? allDailyExps.length
                : allDailyExps.length;

        let nearByExpsList = [];
        for (var i = 0; i < noOfItemsInCard; i++) {
            nearByExpsList.push(Object.assign({}, allDailyExps[i]));
        }
        allDailyExps.sort((a, b) => (a.rating > b.rating ? 1 : -1));
        //Hard coding list of top rated list shared by Saurav
        let topRatedExpData = await readSeqInstance.query(
            "select card_seq, card_type, card_description, seq, experience_id from experience_trending order by card_seq, seq asc",
            { type: QueryTypes.SELECT }
        );
        let cardsData = {};
        topRatedExpData.forEach(function (itm){
            if (!cardsData[itm['card_seq']]){
                cardsData[itm['card_seq']] = [];
            }
            if (expsIds.indexOf(itm['experience_id']) >= 0) {
                cardsData[itm['card_seq']].push({'card_type':itm['card_type'], 'card_description': itm['card_description'], 'seq': itm['seq'], 'exp':  Object.assign({}, allExpObjsByIds[itm['experience_id']])})
            }
        })
        
        let cardsObjects = [];
        Object.keys(cardsData).forEach(function (crdSeq){
            if (cardsData[crdSeq].length > 0){
                cardsObjects.push({
                    viewType: 22,
                    cardType: cardsData[crdSeq][0]['card_type'],
                    cardDescription: cardsData[crdSeq][0]['card_description'],
                    list: cardsData[crdSeq].map(obj => obj.exp)
                })
            }
        })        
        let noOfCards = cardsObjects.length;

        /*check if the experiences are present in the main list;

        let listOfTopRatedList = topRatedExpData.map(obj => obj.experience_id);
        console.log(listOfTopRatedList);
        let topRatedExp = [];
        for (var i = 0; i < noOfItemsInCard; i++) {
            if (listOfTopRatedList.indexOf(allDailyExps[i].id) >= 0) {
                topRatedExp.push(Object.assign({}, allDailyExps[i]));
            }
        }

        for (var i = 0; i < allPackages.length; i++) {
            if (listOfTopRatedList.indexOf(allPackages[i].id) >= 0) {
                topRatedExp.push(Object.assign({}, allPackages[i]));
            }
        }

        topRatedExp = topRatedExp.sort((a, b) => {
            return (
                listOfTopRatedList.indexOf(a.id) - listOfTopRatedList.indexOf(b.id)
            );
        });*/

        allDailyExps.sort((a, b) => (a.id < b.id ? 1 : -1));
        let allExp = [];

        //ADDING NEARBY EXPERIENCES
        allExp.push({
            viewType: 21,
            cardType: "nearByExperiences",
            list: nearByExpsList,
        });
        //ADDING TOPRATED EXPERIENCES
        if (cardsObjects && cardsObjects[0]){
            allExp.push(cardsObjects[0]);
        }
        //ADDING DISTINCT CATEGORIES
        let categoriesCard = {
            viewType: 23,
            cardType: "categories",
            list: distCategories
        };
        let becomeExpProvCard = { viewType: 24, cardType: "becomeExperienceProvider" };

        let noOfExpsInBetweenCards = 6;
        let curItemNum = 0;
        let curCardSeq = 0;
        let cardNum = 0; //0 for categories and 1 for experience
        //ADDING ALL EXPERIENCES
        for (var i = 0; i < nearByExpsList.length; i++) {
            curItemNum = i + 1;
            allExp.push(Object.assign({}, nearByExpsList[i]));
            if (i > 0 && (curItemNum % noOfExpsInBetweenCards == 0)) {
                if (cardNum == 0) {
                    curCardSeq = curCardSeq + 1;
                    if (curCardSeq == noOfCards){
                        curCardSeq = 1; 
                    }
                    if (noOfCards > 1){
                        allExp.push(cardsObjects[curCardSeq]);
                    }
                    allExp.push(Object.assign({}, categoriesCard));
                    cardNum = 1;
                } else {
                    curCardSeq = curCardSeq + 1;
                    if (curCardSeq == noOfCards){
                        curCardSeq = 1; 
                    }
                    if (noOfCards > 1){
                        allExp.push(cardsObjects[curCardSeq]);
                    }
                    allExp.push(Object.assign({}, becomeExpProvCard));
                    cardNum = 0;
                }
            }
        }
        //ADDING BECOME EXPERIENCE PROVIDER
        return { status: "success", responseCode: 200, object: { "dailyExperiences": allExp, "packages": allPackages, "expsIds": expsIds } };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getExperienceDashboard;