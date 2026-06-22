"use strict";

const { default: axios } = require("axios");
const seqConfig = require("./config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const writeSeqInstance = seqConfig.write_sequelize;
const appConstants = require("../app/constants");
const session = require('../app/auth/models/sessions');
const thirdPartyIntegration = require('../app/third_party_api/models/thirdparty_integration');
const searchLocationWithImage = require('./ai_itinerary/queries/search_location_with_image');
const addLocationWithImage = require('./ai_itinerary/commands/add_location_with_image');

// const { getLinkPreview } = require('link-preview-js');

const isUserAdmin = async (userId) => {
    try {

        let qry = "select primary_id from users where user_status = 3 and primary_id = $1"
        let users = await readSeqInstance.query(
            qry,
            { bind: [userId], type: QueryTypes.SELECT }
        );

        let isAdmin = false;
        if (users.length > 0) {
            isAdmin = true;
        }
        return isAdmin;
    }
    catch (error) {
        //console.log(error);
        appConstants.sentryObj.captureException(error);
    }
};

const getUsersSubscriptionDetails = async (userId) => {
    let qry = "select subscription, subscription_start_time from users_attributes where user_id = $1";

    let usersAttr = await readSeqInstance.query(
        qry,
        { bind: [userId], type: QueryTypes.SELECT }
    );
    if (usersAttr.length == 0){
        //hardcoding the users device as android, this will get resetted whenever user logout and login
        await writeSeqInstance.query(
            "call sp_generateProfileName($1,$2)",
            { bind: [userId, 'android'], type: QueryTypes.UPDATE}
        );
    }

    if (usersAttr.length == 0 || !usersAttr[0].subscription){
        const usersSubscrInfoQry = "SELECT subscription_type, subscription_start_time FROM verified_orders WHERE user_id=$1 and (txn_status is null or txn_status not in ('cancelled', 'expired')) order by id desc limit 1"
        //console.log(usersSubscrInfoQry);
        let usersSubscrInfo = await readSeqInstance.query(
            usersSubscrInfoQry,
            { bind: [userId], type: QueryTypes.SELECT }
        );
     
        let subscrType = '', subscrStartDate = ''; 
        if (usersSubscrInfo.length > 0){
            if (appConstants.SUBSCRIPTIONS['TBMINI'].indexOf(usersSubscrInfo[0].subscription_type)  >=0){
                subscrType = 'TBMINI';
            }
            if (appConstants.SUBSCRIPTIONS['TBPRO'].indexOf(usersSubscrInfo[0].subscription_type)  >=0){
                subscrType = 'TBPRO';
            }
            if (appConstants.SUBSCRIPTIONS['TBSUPER'].indexOf(usersSubscrInfo[0].subscription_type) >=0){
                subscrType = 'TBSUPER';
            }
            subscrStartDate = usersSubscrInfo[0].subscription_start_time > Date.now() ? new Date().toISOString().split('T')[0] : usersSubscrInfo[0].subscription_start_time;
            //console.log('data present', subscrType);
        }

        if (subscrType == ''){
            subscrType = 'TBMINI';
            subscrStartDate = new Date().toISOString().split('T')[0];
        }
        //console.log('b4');
        const updatedRec = await writeSeqInstance.query(
            "update users_attributes set subscription = $1, subscription_start_time = $2 where user_id = $3",
            { bind: [subscrType, subscrStartDate, userId], type: QueryTypes.UPDATE}
        );
        //console.log('after');
        return {
            subscription: subscrType,
            subscription_start_time: subscrStartDate
        }
    }else{
        return {
            subscription: usersAttr[0].subscription,
            subscription_start_time: usersAttr[0].subscription_start_time
        }
    }
    
}

// Check the subscription_type of the users from the verified_orders table and return the subscription type

const getUsersSubscriptionType = async (userId) => {
    let qry = "select subscription_type from verified_orders where user_id = $1 order by id desc limit 1";
    let subscriptionType = await readSeqInstance.query(
        qry,
        { bind: [userId], type: QueryTypes.SELECT }
    );
    return subscriptionType[0].subscription_type;
}

const isValidCoupon = async (couponCode, noOfTickets, userId, couponFor) => {
    try {
        let userInfo = await getUserInfo(userId);
        if (couponCode == 'SUBSCRIPTION10'){
            if (!userInfo.isVerified){
                return false;
            }
        }
        let isValid = false;
        let validCoupons;
        couponCode = couponCode.toUpperCase();
        if (['TBMINI', 'TBSUPER', 'TBPRO'].indexOf(couponCode) >= 0){
            if (!userInfo.isVerified){
                return {isValid: false, couponInfo: {}}
            }else{
                let usersSubDetails = await getUsersSubscriptionDetails(userId);
				//console.log('usersSubDetails', usersSubDetails);
                const premSubscrConsumptionQry = "SELECT id couponId, coupon_code couponCode, coupon_description description, coupon_type couponType, discount_value discountValue, is_discount_in_percentage isDiscountInPerc, max_discount maxDiscount, max_no_of_redemptions maxNoOfRedemptions, valid_from validFrom, valid_to validTo FROM coupon WHERE (CURRENT_TIMESTAMP between valid_from and valid_to) and is_deleted = 0 and coupon_code = $1 and max_no_of_redemptions > (select count(coupon_id) from coupon_redemption where user_id = $2 and coupon_id = coupon.id and redeemed_on >= $3)"
                let premSubscrConsumResults = await readSeqInstance.query(
                    premSubscrConsumptionQry,
                    { bind: [usersSubDetails.subscription, userId, usersSubDetails.subscription_start_time], type: QueryTypes.SELECT }
                );
				isValid = false;
                if (premSubscrConsumResults.length > 0) {
                    isValid = true;
                }
                return {isValid: isValid, couponInfo: premSubscrConsumResults};
            }
		}
		else if (['TBDSAVER', 'TBDPREMIUM', 'TBDLUXE'].indexOf(couponCode) >= 0){
            if (!userInfo.isVerified){
                return {isValid: false, couponInfo: {}}
            }else{
                let subscriptionType = await getUsersSubscriptionType(userId);
				console.log('subscriptionType', subscriptionType);
				let usersSubscrInfo = await getUsersSubscriptionDetails(userId);
				
				// Checks to assure the coupon is applicable for the subscription type
				if (subscriptionType == 'tbd_traveler_one_month' && couponCode == 'TBDSAVER') {
					
				}
				else if (subscriptionType == 'tbd_traveler_one_year' && couponCode == 'TBDPREMIUM') {
					
				}
				else if (subscriptionType == 'tbd_elite' && couponCode == 'TBDLUXE') {
				}
				else {
					return {isValid: false, couponInfo: {}}
				}
                
				const premSubscrConsumptionQry = "SELECT id couponId, coupon_code couponCode, coupon_description description, coupon_type couponType, discount_value discountValue, is_discount_in_percentage isDiscountInPerc, max_discount maxDiscount, max_no_of_redemptions maxNoOfRedemptions, valid_from validFrom, valid_to validTo FROM coupon WHERE (CURRENT_TIMESTAMP between valid_from and valid_to) and is_deleted = 0 and coupon_code = $1 and max_no_of_redemptions > (select count(coupon_id) from coupon_redemption where user_id = $2 and coupon_id = coupon.id and redeemed_on >= $3)"
                let premSubscrConsumResults = await readSeqInstance.query(
                    premSubscrConsumptionQry,
                    { bind: [couponCode, userId, usersSubscrInfo.subscription_start_time], type: QueryTypes.SELECT }
                );
				isValid = false;
                if (premSubscrConsumResults.length > 0) {
                    isValid = true;
                }
                return {isValid: isValid, couponInfo: premSubscrConsumResults};
            }
        }
        else{
            let couponForCondition = '';
            if (couponFor){
                if (couponFor.toLowerCase() == 'experience' || couponFor.toLowerCase() == 'flight' || couponFor.toLowerCase() == 'hotel'){
                    couponForCondition = couponForCondition +  " and coupon_for = '" + couponFor.toLowerCase() + "'";
				}
				// else if (couponFor.toLowerCase() == 'premium') {
                //     couponForCondition = couponForCondition +  " and coupon_for = 'premium'";
                // }
				else {
                    couponForCondition = couponForCondition +  " and coupon_for = 'experience'";
                }
            }else{
                couponForCondition = couponForCondition +  " and coupon_for = 'experience'";
            }
            console.log('userId', userId);
            let qry = "SELECT id couponId, coupon_code couponCode, coupon_description description, coupon_type couponType, discount_value discountValue, is_discount_in_percentage isDiscountInPerc, max_discount maxDiscount, max_no_of_redemptions maxNoOfRedemptions, valid_from validFrom, valid_to validTo FROM coupon WHERE (CURRENT_TIMESTAMP between valid_from and valid_to) and is_deleted = 0 and coupon_code = $1 and max_no_of_redemptions > (select count(coupon_id) from coupon_redemption where user_id = $2 and coupon_id = coupon.id) and min_no_tickets <= $3" + couponForCondition
            validCoupons = await readSeqInstance.query(
                qry,
                { bind: [couponCode, userId, noOfTickets], type: QueryTypes.SELECT }
            );
			console.log('validCoupons', validCoupons);
			isValid = false;
			if (validCoupons.length > 0) {
				if (validCoupons[0].couponcode == 'TBGRASSBERRY') {
					var checkGrassberry = 'select user_redirected_from from users where primary_id = $1';
					var checkValidity = await readSeqInstance.query(
						checkGrassberry, { bind: [userId], type: QueryTypes.SELECT }
					);
					//console.log('checkValidity', checkValidity);
					if (checkValidity.length > 0 && checkValidity[0].user_redirected_from == 'grassberry') {
						isValid = true;
					} else {
						isValid = false;
					}
										
				}
				else if (validCoupons[0].couponcode == 'TBAGENT'){
					var checkAgent = 'select user_redirected_from from users where primary_id = $1';
					var checkValidity = await readSeqInstance.query(
						checkAgent, { bind: [userId], type: QueryTypes.SELECT }
					);
					//console.log('checkValidity', checkValidity);
					if (checkValidity.length > 0 && checkValidity[0].user_redirected_from == 'tbagent') {
						isValid = true;
					} else { 
						isValid = false;
					}
				}
				else {
					isValid = true;
				}
            }
        }

        return {isValid: isValid, couponInfo: validCoupons};
    }
    catch (error) {
        //console.log(error);
        appConstants.sentryObj.captureException(error);
    }
};

const calculateDiscountedAmount = async (couponCode, amount) => {
    try {

        let couponDetails = await readSeqInstance.query(
            'SELECT coupon_type "couponType", discount_value "discountValue", is_discount_in_percentage "isDiscountInPerc", max_discount "maxDiscount", max_no_of_redemptions "maxNoOfRedemptions" FROM coupon WHERE coupon_code = $1',
            { bind: [couponCode], type: QueryTypes.SELECT }
		);

        let discVal = couponDetails[0].discountValue;
        if (couponDetails[0].isDiscountInPerc) {
            discVal = amount * (couponDetails[0].discountValue / 100);
            discVal = discVal > couponDetails[0].maxDiscount ? couponDetails[0].maxDiscount : discVal;
		}

        return Math.round(discVal);
    }
    catch (error) {
        //console.log(error);
        appConstants.sentryObj.captureException(error);
    }
};

const getBlockedUsers = async (userId) => {
    //2 - BLOCKED BY ADMIN, 8 - GUEST USERS
    let blockedUsers = await readSeqInstance.query(
        "call sp_blockedByUserIds($1)",
        { bind: [userId], type: QueryTypes.SELECT }
    );
    let blockedUserList = [];
    Object.keys(blockedUsers[0]).forEach(element => {
        blockedUserList.push(blockedUsers[0][element]['blockedid']);
    });
    return blockedUserList;
}

const checkBlockStatus = async (myUserId, userId) => { 
    let blockQuery = "SELECT * FROM users_blockedusers where (user_id=$1 and blocked_user_id=$2) or (blocked_user_id=$1 and user_id=$2)"
    let resultBlockQuery = await readSeqInstance.query(
        blockQuery,
        { bind: [myUserId, userId], type: QueryTypes.SELECT }
    );
    let userBlocked = false;
    if (resultBlockQuery.length > 0) {
        userBlocked = true;
    }
    return userBlocked;
}

const getPlaceId = async (locationNames) => {
	return '';
    try {
        // Map over each location name and create a promise for each
        const promises = locationNames.locationArray.map(async locationName => {
            // Prepare the payload for the database search
            //let searchPayload = { location: locationName }; // userId: locationNames.userId,

            // Search for the location in the database
            //const dbResponse = await searchLocationWithImage(searchPayload);

            // If the location is found in the database
            if (false) {
                // Return the location details from the database
                return { 
                    placeId: dbResponse.locationDetails.place_id, 
                    location: locationName, 
                    'lat': dbResponse.locationDetails.location_lat, 
                    'lng': dbResponse.locationDetails.location_long, 
                    'fromLocalDb': true,
                    'photoReference': dbResponse.locationDetails.photo_reference,
                    'imageUrl': dbResponse.locationDetails.image_url,
                    'locationId': dbResponse.locationDetails.location_id
                };
            }
            // If the location is not found in the database
            else {
                
                const randomTextsforDiffImage = ['beautiful place in', 'nice place', 'quiet place', 'famous place', 'hidden gem', 'best place to visit', 'must visit place', 'top place to visit', 'best place to see', 'best place to go', 'best place to visit', 'best place to travel', 'best place to explore', 'best place to discover', 'best place to experience', 'best place to enjoy', 'best place to relax', 'best place to chill',
                ];
                
                let loc = locationName; /*randomTextsforDiffImage[Math.floor(Math.random() * randomTextsforDiffImage.length)] + ' ' + */
                
                //console.log('location name', loc);
                
                // Fetch the location from the Google Maps API
                const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
                    params: {
                        key: process.env.GOOGLE_MAPS_KEY,
                        input: loc,
                        inputtype: 'textquery',
                        fields: 'place_id,geometry'
                    }
                });
                
                //console.log('response', response.data);
                
                

                // If the location is found in the Google Maps API response
                if (response.data.candidates && response.data.candidates.length > 0) {
                    // Return the location details from the Google Maps API
                    const { place_id, geometry: { location: { lat, lng } } } = response.data.candidates[0];
                    return { placeId: place_id, location: locationName, 'lat': lat, 'lng': lng, 'fromLocalDb': false };
                }
                // If the location is not found in the Google Maps API response
                else {
                    // Return an error
                    return { error: response, location: locationName };
                }
            }
        });

        // Wait for all promises to resolve
        const placeIds = await Promise.all(promises);

        // Filter out null values
        const placeIdsWithoutNull = placeIds.filter(id => id !== null);

        // Separate place IDs from the database and the API
        const placeIdsFromDb = placeIdsWithoutNull.filter(id => id.fromLocalDb);
        const placeIdsFromApi = placeIdsWithoutNull.filter(id => !id.fromLocalDb);

        // If there are place IDs from the API
        if (placeIdsFromApi.length > 0) {
            // Get the place details for the place IDs from the API
            let placeDetails = await getPlaceDetails(placeIdsFromApi);
            
            // Order of Images of MAPS API and DB API is not same, so we need to match them
            let promises = placeDetails.map(async placeDetail => {
                // Prepare the payload for the API call
                const payload = {
                    'location': placeDetail.location,
                    "lat_long":{
                        "lat": placeDetail.lat,
                        "lng": placeDetail.lng
                    },
                    "photoReference": placeDetail.photoReference,
                    "placeId": placeDetail.placeId,
                    "imageUrl": placeDetail.imageUrl,
                    "city":{
                        "long_name": placeDetail.location // Assuming placeDetail has a city property
                    },
                    "state":{
                        "long_name": locationNames.state // Assuming placeDetail has a state property
                    },
                    "country":{
                        "long_name": locationNames.country // Assuming placeDetail has a country property
                    }
				};
				
                // Call the function with payload instead of data
                let locationIdFromApi = await addLocationWithImage(payload); 
				//console.log('location info', locationIdFromApi);
                // Update the locationId in placeDetail
                placeDetail.locationId = locationIdFromApi.object.locationId;
                return placeDetail;
            });

            // Wait for all promises to resolve
            placeDetails = await Promise.all(promises);

            // Return the place IDs from the database and the place details from the API
            return [...placeIdsFromDb, ...placeDetails];
        } else {
            // If there are no place IDs from the API, return the place IDs from the database
            return placeIdsFromDb;
        }
    } catch (error) {
        //console.log('Error getting place ID:', error);
        return error;
    }
}

const getPlaceDetails = async (placeIds) => {
    try {
        const promises = placeIds.map(async placeIdObj => {
            const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
                params: {
                    key: process.env.GOOGLE_MAPS_KEY,
                    place_id: placeIdObj.placeId,
                    fields: 'photo'
                }
            });

            if (response.data.result && response.data.result.photos && response.data.result.photos.length > 0) {
                return { ...placeIdObj, photoReference: response.data.result.photos[0].photo_reference };
            } else {
                //console.log('No photos found for this place.');
                return { ...placeIdObj, error: response };
            }
        });

        const photoReferences = await Promise.all(promises);
        return getPhoto(photoReferences.filter(ref => ref !== null));
    } catch (error) {
        //console.log('Error getting place details:', error);
        return error;
    }
}

const getPhoto = async (photoReferences)  => {
	try {
        const maxWidth = 1920;
        const apiKey = process.env.GOOGLE_MAPS_KEY;

        const promises = photoReferences.map(async photoReferenceObj => {
            const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReferenceObj.photoReference}&key=${apiKey}`;

            try {
                const response = await axios.get(imageUrl, {
                    maxRedirects: 0,
                    validateStatus: function (status_1) {
                        return status_1 >= 200 && status_1 < 303;
                    }
                });
                return { ...photoReferenceObj, imageUrl: response.headers.location };
            } catch (error) {
                //console.log('Error getting photo:', error);
                return { ...photoReferenceObj, error: error, imageUrl: imageUrl };
            }
        });

        const imageUrls = await Promise.all(promises);

        return imageUrls;
    } catch (error) {
        //console.log('Error getting photo:', error);
        return error;
    }
}


const getUserInfo = async (userId) => {
    try {

        let qry = "select primary_id, user_display_picture, user_full_name, user_email, is_verified from users where primary_id = $1";

        let users = await readSeqInstance.query(
            qry,
            { bind: [userId], type: QueryTypes.SELECT }
        );
		let userObj = {};
		////console.log('getUserInfo --> Users', users);
        for (var j = 0; j < users.length; j++) {
            userObj.userId = users[j].primary_id;
			userObj.userName = users[j].user_full_name;
			if (users[j].user_display_picture == null || users[j].user_display_picture == undefined) {
				userObj.userDisplayPicture = '';
			}
			else {
				if (users[j].user_display_picture.includes('https')) {
					userObj.userDisplayPicture = users[j].user_display_picture;
				} else {
					userObj.userDisplayPicture = appConstants.PROFILE_IMAGE_SIZE + users[j].user_display_picture;
				}
			}
            userObj.userProfilePic = userObj.userDisplayPicture;
            userObj.userEmail = users[j].user_email ? users[j].user_email : '';
            userObj.isVerified = users[j].is_verified == 0? false: true;
        }
        return userObj;
    }
    catch (error) {
        //console.log(error);
        appConstants.sentryObj.captureException(error);
        return {};
    }
};

const getThirdPartyInfo = async (thirdPartyName) => {
    try {

        let qry = "select id,thirdparty_name,client_id,token from thirdparty_integration where thirdparty_name = $1";

        let thirdPartyDetails = await readSeqInstance.query(
            qry,
            { bind: [thirdPartyName], type: QueryTypes.SELECT }
        );
        return thirdPartyDetails;
    }
    catch (error) {
        //console.log(error);
        appConstants.sentryObj.captureException(error);
        return {};
    }
};

const updateThirdPartyToken = async (thirdPartyName, newToken) => {
    let newRec = {
        token: newToken
    };
    let foundItem = await thirdPartyIntegration.findOne({ where: { thirdparty_name: thirdPartyName } });
    //console.log('after found item' + JSON.stringify(foundItem));
    if (foundItem) {
        await thirdPartyIntegration.update(newRec, { where: {id: foundItem.id } }); // foundItem[0].id
    }
}

const updateUsersPassengersInfo = async (passengerInfo, userId) => {
    const updatedRec = await writeSeqInstance.query(
		"update users_attributes set passengers_info = '$1' where msg_job_id = $2",
		{ bind: [passengerInfo,userId], type: QueryTypes.UPDATE}
	);
}

const getUsersPassengerDetails = async (payload) => {
    let qry = "select passengers_info from users_attributes where user_id = $1";

    let passengersDetails = await readSeqInstance.query(
        qry,
        { bind: [payload.plainUserId], type: QueryTypes.SELECT }
    );
    return passengersDetails;
}


// remove special characters and make it lower case
function removeSpecialCharacters(str) {
    return str.replace(/[^\p{L}\p{N}\s]|_/gu, ' ');
}

async function updateSession(userId, deviceId, vendorID, deviceType, token) {
    //console.log("Update Session");
    let newRec = {
        user_id: userId,
        user_device_id: deviceId,
        device_unique_id: vendorID,
        device_type: deviceType,
        token: token
    };
    let foundItem = await session.findOne({ where: { user_id: userId, device_unique_id: vendorID } });
    //console.log('after found item' + JSON.stringify(foundItem));
    let sess;
    if (!foundItem) {
        sess = await session.create(newRec);
    } else {
        sess = await session.update(newRec, { where: { session_id: foundItem.session_id } });
    }
    // Generate Profile Name
    //console.log(userId + deviceType);
    const genProfileName = await writeSeqInstance.query(
        "call sp_generateProfileName($1,$2)",
        { bind: [userId, deviceType], type: QueryTypes.INSERT }
    );
    sess = await userAttributes.update({ device_type: deviceType + 1 }, { where: { user_id: userId } });
}

const {
	GoogleGenerativeAI,
	HarmCategory,
	HarmBlockThreshold,
} = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
};
  
async function startAiChat(prompt) {
	// Add system instruction to keep responses concise
	const systemInstruction = "You are a helpful travel assistant. Keep your responses concise and focused. Aim for 2-4 paragraphs maximum unless the user specifically asks for detailed information.";
	const chatSession = model.startChat({
		generationConfig,
		history: [
		],
		systemInstruction: systemInstruction,
	});
  
    const result = await chatSession.sendMessage(prompt);
	//console.log(result.response.text());
	
	// Extract location/destination keywords from the prompt for image search
	const imageKeywords = extractImageKeywords(prompt, result.response.text());
	const relevantImages = await getRelevantImages(imageKeywords);
	
	// Split the response into paragraphs for image distribution
	const responseText = result.response.text();
	const paragraphs = responseText.split('\n\n').filter(p => p.trim().length > 0);
	
	// Distribute images throughout the content
	const contentWithImages = distributeImagesInContent(paragraphs, relevantImages);
	
	return { 
		message: responseText, 
		type: 'ai', 
		timeStamp: Math.floor(Date.now() / 1000),
		images: relevantImages,
		contentWithImages: contentWithImages
	};
}

// Function to extract keywords for image search
function extractImageKeywords(prompt, response) {
	const keywords = [];
	
	// Prioritize the user's prompt over the AI response
	const promptText = prompt.toLowerCase();
	const responseText = response.toLowerCase();
	
	//console.log('User prompt:', prompt);
	//console.log('AI response:', response);
	
	// Common travel destinations and activities
	const travelKeywords = [
		'thailand', 'bangkok', 'phuket', 'chiang mai', 'koh samui', 'pattaya', 'krabi',
		'japan', 'tokyo', 'kyoto', 'osaka', 'mount fuji', 'hiroshima', 'nara',
		'europe', 'paris', 'london', 'rome', 'barcelona', 'amsterdam', 'berlin', 'prague',
		'india', 'mumbai', 'delhi', 'goa', 'kerala', 'rajasthan', 'bangalore', 'chennai', 'varanasi',
		'dubai', 'singapore', 'bali', 'maldives', 'sri lanka', 'hong kong', 'macau',
		'hotel', 'restaurant', 'beach', 'mountain', 'temple', 'palace', 'museum',
		'food', 'cuisine', 'shopping', 'adventure', 'romantic', 'nightlife', 'culture'
	];
	
	// First, extract keywords from the user's prompt (highest priority)
	travelKeywords.forEach(keyword => {
		if (promptText.includes(keyword)) {
			keywords.push(keyword);
		}
	});
	
	// Extract specific locations from prompt using patterns
	const locationPatterns = [
		/\b(?:in|to|from|visit|travel|go|see|explore|plan|trip|vacation|holiday)\s+([a-z\s]+?)(?:\s|,|\.|!|\?|$)/gi,
		/\b(?:destination|place|city|country|location)\s+([a-z\s]+?)(?:\s|,|\.|!|\?|$)/gi,
		/\b([a-z\s]+?)\s+(?:trip|vacation|holiday|visit|travel)/gi
	];
	
	locationPatterns.forEach(pattern => {
		let match;
		while ((match = pattern.exec(promptText)) !== null) {
			const extracted = match[1].trim();
			if (extracted.length > 2 && extracted.length < 20) {
				keywords.push(extracted);
			}
		}
	});
	
	// If no keywords found in prompt, then check response (but with lower priority)
	if (keywords.length === 0) {
		travelKeywords.forEach(keyword => {
			if (responseText.includes(keyword)) {
				keywords.push(keyword);
			}
		});
	}
	
	// Remove duplicates and filter out common words
	const filteredKeywords = [...new Set(keywords)]
		.filter(keyword => 
			keyword.length > 2 && 
			!['the', 'and', 'or', 'but', 'for', 'with', 'at', 'by', 'from', 'to', 'in', 'on', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'a', 'an', 'of', 'my', 'your', 'our', 'their', 'this', 'that', 'these', 'those'].includes(keyword.toLowerCase())
		);
	
	// If no specific keywords found, use generic travel terms
	if (filteredKeywords.length === 0) {
		filteredKeywords.push('travel', 'destination', 'vacation', 'tourism');
	}
	
	//console.log('Extracted keywords from prompt:', filteredKeywords);
	return filteredKeywords.slice(0, 3); // Return top 3 keywords to focus on most relevant
}

// Function to get relevant images based on keywords using Google Maps API
async function getRelevantImages(keywords) {
	try {
		const images = [];
		
		// Use the first keyword as the primary search term
		const searchTerm = keywords.length > 0 ? keywords[0] : 'travel destination';
		
		//console.log('Keywords received:', keywords);
		//console.log('Primary search term:', searchTerm);
		
		// Search for places using Google Maps Places API
		const placesResponse = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
			params: {
				key: process.env.GOOGLE_MAPS_KEY,
				input: searchTerm,
				inputtype: 'textquery',
				fields: 'place_id,name,photos'
			}
		});
		
		if (placesResponse.data.candidates && placesResponse.data.candidates.length > 0) {
			const placeId = placesResponse.data.candidates[0].place_id;
			//console.log('Found place:', placesResponse.data.candidates[0].name, 'for search term:', searchTerm);
			
			// Get place details with photos
			const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
				params: {
					key: process.env.GOOGLE_MAPS_KEY,
					place_id: placeId,
					fields: 'photos'
				}
			});
			
			if (detailsResponse.data.result && detailsResponse.data.result.photos) {
				const photos = detailsResponse.data.result.photos;
				//console.log('Found', photos.length, 'photos for', searchTerm);
				
				// Get up to 1 photos
				const maxPhotos = Math.min(1, photos.length);
				for (let i = 0; i < maxPhotos; i++) {
					const photo = photos[i];
					const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_KEY}`;
					images.push(imageUrl);
				}
			}
		}
		
		// If no images found from primary search, try alternative searches
		if (images.length === 0 && keywords.length > 1) {
			for (let i = 1; i < keywords.length && images.length < 6; i++) {
				const altSearchTerm = keywords[i];
				//console.log('Trying alternative search:', altSearchTerm);
				
				try {
					const altPlacesResponse = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
						params: {
							key: process.env.GOOGLE_MAPS_KEY,
							input: altSearchTerm,
							inputtype: 'textquery',
							fields: 'place_id,name,photos'
						}
					});
					
					if (altPlacesResponse.data.candidates && altPlacesResponse.data.candidates.length > 0) {
						const altPlaceId = altPlacesResponse.data.candidates[0].place_id;
						
						const altDetailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
							params: {
								key: process.env.GOOGLE_MAPS_KEY,
								place_id: altPlaceId,
								fields: 'photos'
							}
						});
						
						if (altDetailsResponse.data.result && altDetailsResponse.data.result.photos) {
							const altPhotos = altDetailsResponse.data.result.photos;
							const remainingSlots = 6 - images.length;
							const photosToAdd = Math.min(remainingSlots, altPhotos.length);
							
							for (let j = 0; j < photosToAdd; j++) {
								const photo = altPhotos[j];
								const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_KEY}`;
								images.push(imageUrl);
							}
						}
					}
				} catch (altError) {
					//console.log('Alternative search failed for:', altSearchTerm, altError.message);
				}
			}
		}
		
		// If still no images, try generic travel terms
		if (images.length === 0) {
			const genericTerms = ['travel', 'tourism', 'vacation', 'destination'];
			for (const term of genericTerms) {
				try {
					const genericResponse = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
						params: {
							key: process.env.GOOGLE_MAPS_KEY,
							input: term,
							inputtype: 'textquery',
							fields: 'place_id,name,photos'
						}
					});
					
					if (genericResponse.data.candidates && genericResponse.data.candidates.length > 0) {
						const genericPlaceId = genericResponse.data.candidates[0].place_id;
						
						const genericDetailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
							params: {
								key: process.env.GOOGLE_MAPS_KEY,
								place_id: genericPlaceId,
								fields: 'photos'
							}
						});
						
						if (genericDetailsResponse.data.result && genericDetailsResponse.data.result.photos) {
							const genericPhotos = genericDetailsResponse.data.result.photos;
							const remainingSlots = 6 - images.length;
							const photosToAdd = Math.min(remainingSlots, genericPhotos.length);
							
							for (let k = 0; k < photosToAdd; k++) {
								const photo = genericPhotos[k];
								const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_KEY}`;
								images.push(imageUrl);
							}
							break; // Stop after getting some generic images
						}
					}
				} catch (genericError) {
					//console.log('Generic search failed for:', term, genericError.message);
				}
			}
		}
		
		//console.log('Final images found:', images.length);
		return images;
		
		} catch (error) {
		//console.log('Error fetching images from Google Maps API:', error);
		//console.log('Error details:', error.response?.data || error.message);
		return [];
	}
}

// Function to distribute images throughout content
function distributeImagesInContent(paragraphs, images) {
	if (!images || images.length === 0) {
		return paragraphs.map(p => ({ type: 'text', content: p }));
	}
	
	const contentWithImages = [];
	const imagesPerParagraph = Math.ceil(images.length / paragraphs.length);
	let imageIndex = 0;
	
	paragraphs.forEach((paragraph, index) => {
		// Add the text paragraph
		contentWithImages.push({ type: 'text', content: paragraph });
		
		// Add images after every 1-2 paragraphs
		if (index % 2 === 1 && imageIndex < images.length) {
			const imagesForThisSection = images.slice(imageIndex, imageIndex + Math.min(2, images.length - imageIndex));
			contentWithImages.push({ 
				type: 'images', 
				images: imagesForThisSection 
			});
			imageIndex += imagesForThisSection.length;
		}
	});
	
	// Add remaining images at the end if any
	if (imageIndex < images.length) {
		const remainingImages = images.slice(imageIndex);
		contentWithImages.push({ 
			type: 'images', 
			images: remainingImages 
		});
	}
	
	return contentWithImages;
}

// Sending Tags to Interakt API
async function trackTagsInterakt(userPayload) {
	const apiKey = 'cDRoNms0ZXBIRjl1SENPQzlHMVVnallzdTBSeWdtYnlNZEgtUE5ETkdOVTo=';
    try {
        // Track the user in Interakt
        const response = await axios.post(
            "https://api.interakt.ai/v1/public/track/users/",
            userPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${apiKey}`,
                },
            }
        );

		//console.log("User tracked successfully in Interakt", response.data);
		
		await trackEventsInterakt(eventPayload);

        // Return success response
        return { success: true, data: response.data };
    } catch (error) {
        //console.error("Error tracking user in Interakt:", error.message);
        if (error.response) {
            //console.log("Status code:", error.response.status);
            //console.log("Response:", error.response.data);
        }

        // Return error response
        return { success: false, error: error.message };
    }
}

// Track Event in Interakt API
async function trackEventsInterakt(eventPayload) {
	const apiKey = 'cDRoNms0ZXBIRjl1SENPQzlHMVVnallzdTBSeWdtYnlNZEgtUE5ETkdOVTo=';
    try {
        // Track the enquiry event in Interakt
        const response = await axios.post(
            "https://api.interakt.ai/v1/public/track/events/",
            eventPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${apiKey}`,
                },
            }
        );

        //console.log("Enquiry event tracked successfully in Interakt", response.data);

        // Return success response
        return { success: true, data: response.data };
    } catch (error) {
        //console.error("Error tracking enquiry event in Interakt:", error.message);
        if (error.response) {
            //console.log("Status code:", error.response.status);
            //console.log("Response:", error.response.data);
        }

        // Return error response
        return { success: false, error: error.message };
    }
}

// Fetch Meta Data from URL
// async function fetchMetaDataUrl(url) {
// 	var returnedData = {};
// 	returnedData = getLinkPreview(url);
	
// 	if (returnedData == null || returnedData == undefined) {
// 		returnedData = {
// 			title: 'No Title',
// 			description: 'No Description',
// 			image: 'No Image',
// 			url: url
// 		}
// 	}
	
// 	return returnedData;
// }




module.exports = {
    isUserAdmin,
    isValidCoupon,
    calculateDiscountedAmount,
    getBlockedUsers,
    getUserInfo,
    updateSession,
    checkBlockStatus,
    removeSpecialCharacters,
    getPlaceId,
    getThirdPartyInfo,
    updateThirdPartyToken,
    updateUsersPassengersInfo,
	getUsersPassengerDetails,
	startAiChat,
	trackTagsInterakt
};