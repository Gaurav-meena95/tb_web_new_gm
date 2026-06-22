"use strict";
const nodeFetch = require('node-fetch');
global.fetch = nodeFetch;

const { default: axios } = require("axios");
const apiHelper = require("./api-helper");
const razorPayHelper = require("./razorpay-helper");
const auth = require("./auth");
const cloudinaryHelper = require("./cloudinary-helper");
const fs = require("fs");
const directoryPath = require('path');
const firebaseChatConnection = require("./firebase-chat-connection");
const expRatingModel = require('./experiences/models/experience_rating');
const addExpRatings = require('./experiences/commands/add_experience_rating');
const fetchExpRatings = require('./experiences/queries/get_experience_rating');
const addExps = require('./experiences/commands/add_experience');
const editExps = require('./experiences/commands/edit_experience');
const addExpView = require('./experiences/commands/add_experience_views');
const getExps = require('./experiences/queries/get_experiences');
const deleteExp = require('./experiences/commands/delete_experience');
const getExpDashboard = require('./experiences/queries/get_experience_dashboard');
const getAvailTickts = require('./experiences/queries/get_available_tickets');
const getUsersFollowInfo = require('./users/queries/users_follow_info');
const isPhoneNumberUnique = require('./users/queries/is_phone_number_unique');
const getOrders = require('./experiences/queries/get_orders');
const getBookingsForExperience = require('./experiences/queries/get_bookings_for_experience');
const approveBooking = require('./experiences/commands/approve_booking');
const getCategories = require('./experiences/queries/get_categories');
const getExperienceViews = require('./experiences/queries/get_experience_views');
const blkTickts = require('./experiences/commands/block_calendar_slot');
const bookTickets = require('./experiences/commands/add_experience_booking');
const correctTickets = require('./experiences/commands/correct_booking');
const cancelExperienceBooking = require('./experiences/commands/cancel_booking');
const custLogin = require('./auth/queries/customLogin');
const addCoupons = require('./coupon/commands/add_coupons');
const addLocations = require('./locations/commands/add_location');
const searchLocations = require('./locations/queries/search_locations');
const addUserItinerary = require('./ai_itinerary/commands/add_user_itinerary');
const addLocationWithImage = require('./ai_itinerary/commands/add_location_with_image');
const getUserItineraries = require('./ai_itinerary/queries/get_user_itineraries');
const getItinerary = require('./ai_itinerary/queries/get_itinerary');
const searchLocationWithImage = require('./ai_itinerary/queries/search_location_with_image');
const buyAiPackage = require('./ai_itinerary/commands/buy_ai_package');
const updateItinerariesLeft = require('./ai_itinerary/commands/update_itineraries_left');
const getUsersAiPackage = require('./ai_itinerary/queries/get_ai_package_info');
const addOrUpdateSessions = require('./sessions/commands/update_sessions');
const getCoupons = require('./coupon/queries/get_coupons');
const validateCoupon = require('./coupon/queries/validate_coupon');
const sendEnquiry = require('./utility/send_enquiry_details');
const sendMessageToCohort = require('./messageDashboard/commands/send_bulk_message');
const getMessageHistory = require('./messageDashboard/queries/get_msg_history');
const updateMessageDashboardHistory = require('./messageDashboard/commands/update_msg_history');
const addCancelledOrder = require('./cancelledOrders/commands/add_cancelled_orders');
const registerUserByAdmin = require('./users/commands/register_user_by_admin');
const sendSMS = require('./send-sms');
const { randomInt } = require("crypto");
const { refreshToken } = require("firebase-admin/app");
const addUserToFindBuddyGroup = require("./posts/commands/add_user_to_find_buddy_group");
const { getAllHostellers } = require("./third_party_api/hosteller/hostellers_info");
const { getHostellersFromLocation } = require("./third_party_api/hosteller/hostellers_info");
const { getNewHostellers } = require("./third_party_api/hosteller/hostellers_info");
const populateAirportInfo = require("./utility/populate_airport_info");
const getUsersFlightBookings = require("./third_party_api/queries/get_users_bookings");
const sendFlightDetails = require("./third_party_api/commands/send_flight_details");
const confirmCancellation = require("./third_party_api/commands/cancel_flight");
const getAirportInfo = require("./third_party_api/queries/get_airports");
const getLowestFare = require("./third_party_api/queries/get_lowest_price");
const utils = require("./utils");
const tboFlights = require("./third_party_api/tbo/tbo_flights");
const tboHotels = require("./third_party_api/tbo/tbo_hotels");
const getXmlsForSitemap = require("./utility/get_xmls_for_sitemap");
const genInvoice = require("./gen_invoice");
const checkUniqueUser = require("./db-connect");
const emailSend = require("./send-email");
const whatsAppNew = require("./send-whatsapp-new");
const cronJobPremium = require("./crons/cron_job_subscription_expiry_unified");
const sendOTPDomestic = require("./send-otp-auth");
const sendOTPWhatsapp = require("./send-whatsapp-otp");
/*const { Storage } = require('@google-cloud/storage');
const multer = require('multer');

const storage = new Storage({
	projectId: 'travelbuddy-174317',
	keyFilename: './app/serviceAccountKey.json', // Replace with your service account key file
});
*/
require('dotenv').config();

//Write a test function and export it
exports.test = function () {
	// return 'Hello World';
}

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function urlToGenerativePart(url, mimeType) {
	const response = await axios.get(url, { responseType: 'arraybuffer' });
	const buffer = Buffer.from(response.data, 'binary');
	return {
		inlineData: {
			data: buffer.toString('base64'),
			mimeType
		},
	};
}

// Helper function to create a default input data
function createDefaultInputData() {
	return {
		imagePath: "https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/1000x1000/uploads/posts/4990e4fe44e1c77fe1cbaa2be0c01287b2532694a39e23ca2d02847522895d59_1708666583935.jpeg",
		promptText: "Generate captions for this Image with Hashtags for Instagram.",
		aiModel: "gemini-pro-vision",
		imageType: "image/jpeg"
	};
}

function getUserIdFromToken(token, headers, fallbackUserId) {
	if (fallbackUserId && fallbackUserId > 0) {
		return fallbackUserId;
	}
	let currentToken = token || (headers && (headers.authorization || headers.Authorization));
	if (currentToken) {
		if (currentToken.startsWith('Bearer ')) {
			currentToken = currentToken.substring(7);
		}
		try {
			const userI = apiHelper.decrypt(apiHelper.decrypt(currentToken));
			const userId = require('./auth/commands/jwtValidation').isTokenValid(userI);
			if (userId && userId > 0 && userId !== -1) {
				return userId;
			}
		} catch (e) {
			// ignore
		}
	}
	return null;
}

// Helper function to create a prompt
function createPrompt(inputData, structure) {

	return `You're a travel influencer expert bot. Your job is to return the response in a valid parseable JSON Array of objects structure. I'm planning a trip to ${inputData.location} for 4 days in the month of ${inputData.month}. Considering my interests in ${inputData.travelType}, create a detailed itinerary with recommended sights, activities, food experiences, and accommodation options. Suggest the best transportation between these spots. Provide a detailed itinerary in JSON Array of objects format like this:- ${structure} categorizing each ${inputData.travelType} placeType only as a single value from ${inputData.valueString}.`;

}

// Helper function to filter prompt
function filterPrompt(prompt, stopWordsList) {
	return prompt.split(' ').filter(word => !stopWordsList.includes(word.toLowerCase())).join(' ');
}

function showHidePremiumAi(data) {

	// Last Generated variable declaration should be of 1 type
	// User lastGeneratedTime for boolean

	let now = new Date();
	let itinerariesRemainingForPremium = 0;
	let count = 0;
	let diff = 0;
	let cooldown = 0;
	let lastGenerated = 0;
	let aiPackageId = '';
	let allotedItineraries = 0;

	let isInMins = data.aiPackages == null || data.aiPackages.length == 0;

	// Checking for Ai Premium

	let isAiPremium = data.aiPackages != null;

	if (isAiPremium) {
		if (new Date(data.aiPackages.package_end_time) > Date.now() && data.aiPackages.no_of_itineraries > 0) {
			itinerariesRemainingForPremium = data.aiPackages.no_of_itineraries;
			aiPackageId = data.aiPackages.id;
		}
		else {
			itinerariesRemainingForPremium = 0;
			lastGenerated = data.lastAiCreatedAt.timeFromLastAiCreated ? data.lastAiCreatedAt.timeFromLastAiCreated : 0;
			isInMins = true;
		}
		count = data.totalItineraries;
	}

	// Checking for Normal Premium

	let isPremium = data.verifiedDetails != null && data.verifiedDetails.length != 0 && data.verifiedDetails.length != undefined;

	if (isPremium == true) {
		// Check whether user can create the itinerary or not.

		// Get the package name 
		let packageName = data.verifiedDetails[0].subscription_type;
		let packageLimits = { '_mini': 2, '_pro': 6, '_super': 40, '_month': 6, '_year': 40 };

		// Check if packageName includes any of the keys in packageLimits
		if (Object.keys(packageLimits).some(key => packageName.includes(key))) {
			// Find the corresponding key in packageLimits for the packageName
			let limitKey = Object.keys(packageLimits).find(key => packageName.includes(key));
			allotedItineraries = packageLimits[limitKey];
			// console.log(packageLimits[limitKey]);
		}
		else {
			// Handle the case where packageName does not include any of the keys in packageLimits
			// This could be setting itinerariesRemainingForPremium to 0, throwing an error, etc.
			allotedItineraries = 2;
		}

		let subscriptionEndTime = new Date(data.verifiedDetails[0].subscription_end_time);
		let itinerariesCreated = Number(data.verifiedDetails[0].itineraries_created);

		itinerariesRemainingForPremium = subscriptionEndTime > Date.now()
			? allotedItineraries - itinerariesCreated
			: 0;

		if (itinerariesRemainingForPremium <= 0) {
			// If Itineraries are left then show the countdown then hide timer else calculatae the count a/c to the totalItineraries
			lastGenerated = data.lastAiCreatedAt.timeFromLastAiCreated;
			count = data.totalItineraries;
		}

	}

	// Check for Free User 
	if (!isAiPremium && !isPremium) {
		// User is a free User 
		// Get the count of Itineraries Craeated till now
		count = data.totalItineraries;
		lastGenerated = data.lastAiCreatedAt.timeFromLastAiCreated;
	}

	// Check if an itinerary has been generated before
	if (itinerariesRemainingForPremium <= 0) { // lastGenerated != false || 
		// Calculate the difference in minutes between the current time and the last generation time

		if (isInMins || lastGenerated == 0) { // || lastGenerated == 0 Can be Ignored
			diff = lastGenerated;
		}
		else {
			diff = Math.floor((now - lastGenerated) / 60000); // This also can be removed as we are using the minutes from the last generated time 
		}
		if (diff < 0) { // This also can be removed as the diff will never be less than 0
			return;
		}

		// Determine the required cooldown period based on the number of itineraries generated so far

		if (count == 1) cooldown = 5; // If only one itinerary has been generated, the cooldown is 5 minutes

		else if (count >= 2 && count <= 4) cooldown = 5 + (count - 1) * 2; // If between 2 and 4 itineraries have been generated, the cooldown increases by 2 minutes for each additional itinerary

		else if (count >= 5 && count <= 9) cooldown = 11 + (count - 4) * 5; // If between 5 and 9 itineraries have been generated, the cooldown increases by 5 minutes for each additional itinerary

		else if (count >= 10) cooldown = 1440; // If 10 or more itineraries have been generated, the cooldown is 24 hours

		else cooldown = 0; // If no itineraries have been generated, there is no cooldown

		// If the difference between the current time and the last generation time is less than the cooldown period, alert the user and return without generating a new itinerary
		//countdownElement = document.getElementById('countdown');
		//if (diff < cooldown) {
		if (false) {
			return { canCreate: false, packageOwnedId: aiPackageId };
		}
		else {
			// Return True
			return { canCreate: true, packageOwnedId: aiPackageId ? aiPackageId : '' };
		}
	}
	else {
		// Return True
		return { canCreate: true, packageOwnedId: aiPackageId ? aiPackageId : '' };
	}
}

async function generateContentWithAI(inputData) {
	const stopWordsList = ['a', 'an', 'the', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'with', 'as', 'I', 'his', 'they', 'be', 'at', 'one', 'have', 'this', 'from', 'or', 'had', 'by', 'hot', 'word', 'but', 'what', 'some', 'we', 'can', 'out', 'other', 'were', 'all', 'there', 'when', 'up', 'use', 'your', 'how', 'said', 'an', 'each', 'she', 'which', 'do', 'their', 'time', 'if', 'will', 'way', 'about', 'many', 'then', 'them', 'write', 'would', 'like', 'so', 'these', 'her', 'long', 'make', 'thing', 'see', 'him', 'two', 'has', 'look', 'more', 'day', 'could', 'go', 'come', 'did', 'number', 'sound', 'no', 'most', 'people', 'my', 'over', 'know', 'water', 'than', 'call', 'first', 'who', 'may', 'down', 'side', 'been', 'now', 'find'];

	let usersAiPackage = await getUsersAiPackage({});
	let canCreate = showHidePremiumAi(usersAiPackage.object);

	if (!canCreate.canCreate) {
		return { responseCode: '404', errorMessage: 'You have reached the limit of generating itineraries. Please upgrade to premium to generate more itineraries.' };
	}

	// Check if inputData is empty and create default inputData
	if (!inputData) {
		inputData = createDefaultInputData();
	}

	const generativeModel = genAI.getGenerativeModel({
		model: 'gemini-2.5-flash-lite',
		systemInstruction: "1) You are an expert in crafting travel itineraries. Your job is to create Travel Plan for 4 Days.\n2) Always return the response / data in Array of Objects with length 4.\n3) Respond specifically to what the user is demanding.\n4) Prompt will be like this `Provide a 4-day itinerary for trip to ${inputData.location} in the month of ${inputData.month} in JSON Array of objects format like this:- ${structure} categorizing each ${inputData.travelType} placeType only as a single value from ${inputData.valueString}`\n5) Output / Response should be always in this format [ { \"day\":\"Day1\",\"morning\": { \"place\":\"\",\"description\":\"\", \"placeType\":\"string(15)\", \"weatherInfo\": \"var(10)\" },\"evening\": { \"place\":\"\",\"description\":\"\", \"placeType\":\"string(15)\", \"weatherInfo\": \"var(15)\"},\"night\": { \"place\":\"\",\"description\":\"\", \"placeType\":\"string(15)\", \"weatherInfo\": \"var(15)\"}, \"timeToExploreAllInHoursWithUnits\": \"var(15)\", \"iconicPlaceName\": \"string(15)\"}]\n6)Never Repeat the place names\n",
	});

	// Create prompt
	let promptData = [{ "day": "Day1", "morning": { "place": "", "description": "", "placeType": "string(15)", "weatherInfo": "var(10)" }, "evening": { "place": "", "description": "", "placeType": "string(15)", "weatherInfo": "var(15)" }, "night": { "place": "", "description": "", "placeType": "string(15)", "weatherInfo": "var(15)" }, "timeToExploreAllInHoursWithUnits": "var(15)", "iconicPlaceName": "string(15)" }];
	let structure = JSON.stringify(promptData);
	let prompt = createPrompt(inputData, structure);

	// Filter prompt
	const filteredPrompt = filterPrompt(prompt, stopWordsList);

	let generationResult;
	if (inputData.aiModel === 'gemini-pro-vision') {
		const imageAiPath = [
			await urlToGenerativePart(inputData.imagePath, inputData.imageType),
		];
		generationResult = await generativeModel.generateContent([filteredPrompt, ...imageAiPath], { temperature: 0.9 });
	}
	else {
		const generationConfig = {
			temperature: 0.7,
			topP: 0.95,
			topK: 40,
			maxOutputTokens: 2048,
		};
		generationResult = generativeModel.startChat({
			generationConfig, history: [
				{
					"role": "user",
					"parts": [
						"You're a travel influencer expert. Your job is to return the response in a valid parseable JSON Array of objects structure. I'm planning a trip to ${BelBatim} for 4 days in the month of ${August}. Considering my interests in ${Adventure, Must Visits}, create a detailed itinerary with recommended sights, activities, food experiences, and accommodation options. Suggest the best transportation between these spots. Provide a detailed itinerary in JSON Array of objects format like this:- $[ { \"day\":\"Day1\",\"morning\": { \"place\":\"\",\"description\":\"\", \"placeType\":\"string(15)\", \"weatherInfo\": \"var(10)\" },\"evening\": { \"place\":\"\",\"description\":\"\", \"placeType\":\"string(15)\", \"weatherInfo\": \"var(15)\"},\"night\": { \"place\":\"\",\"description\":\"\", \"placeType\":\"string(15)\", \"weatherInfo\": \"var(15)\"}, \"timeToExploreAllInHoursWithUnits\": \"var(15)\", \"iconicPlaceName\": \"string(15)\"}] categorizing each ${Adventure, Must Visits} placeType only as a single value from ${[\n    { type: 'adventure', value: 'Adventures', imgSrc: 'adventure_light.svg', label: 'Adventures' },\n    { type: 'backpacking', value: 'Backpacking', imgSrc: 'backpacking_light.svg', label: 'Backpacking' },\n    { type: 'trekking', value: 'Trekking', imgSrc: 'trekking_light.svg', label: 'Trekking' },\n    \n    { type: 'beaches', value: 'Beaches', imgSrc: 'beach_light.svg', label: 'Beaches' },\n    { type: 'shopping', value: 'Shopping', imgSrc: 'shopping_light.svg', label: 'Shopping' },\n    { type: 'bleisure', value: 'NightLife', imgSrc: 'pubs_light.svg', label: 'NightLife' },\n    \n    { type: 'luxurious', value: 'Luxurious', imgSrc: 'luxury_light.svg', label: 'Luxurious' },\n    { type: 'religious', value: 'Religious', imgSrc: 'religious_light.svg', label: 'Religious' },\n    { type: 'romantic', value: 'Romantic', imgSrc: 'romantic_light.svg', label: 'Romantic' },\n    \n    { type: 'volcanoes', value: 'Volcanoes', imgSrc: 'volcano_light.svg', label: 'Volcanoes' },\n    { type: 'star-gazing', value: 'StarGazing', imgSrc: 'starGazing_light.svg', label: 'Star Gazing' },\n    { type: 'themeParks', value: 'themeParks', imgSrc: 'themePark_light.svg', label: 'Theme Parks' },\n    \n    { type: 'wildLife', value: 'wildLife', imgSrc: 'wildLifes_light.svg', label: 'WildLife' },\n    { type: 'roadTrip', value: 'roadTrip', imgSrc: 'roadTrip_light.svg', label: 'Road Trip' },\n    { type: 'hiddenGems', value: 'hidden-gems', imgSrc: 'hiddenGems_light.svg', label: 'Hidden Gems' },\n    \n    { type: 'boatRide', value: 'Kayaking / Boating', imgSrc: 'boating_light.svg', label: 'Kayaking' },\n    { type: 'family', value: 'family', imgSrc: 'family_light.svg', label: 'Family' },\n    { type: 'cuisines', value: 'famousCusines', imgSrc: 'food_light.svg', label: 'Cuisines' },\n    \n    { type: 'weekend', value: 'weekend-gateways', imgSrc: 'weekendGateway_light.svg', label: 'Weekend Gateways' },\n    { type: 'mustSee', value: 'must visit places', imgSrc: 'mustSee_light.svg', label: 'Must Visits' },\n    { type: 'forts', value: 'forts & palaces', imgSrc: 'forts_light.svg', label: 'Forts / Palaces' }]}."
					]
				},
				{
					"role": "model",
					"parts": [
						`[ { "day": "Day 1", "morning": { "place": "Dudhsagar Falls", "description": "Embark on an adventurous trek through the lush rainforest to witness the magnificent Dudhsagar Falls. The cascading waters are a sight to behold, and the surrounding nature is a photographer's paradise.", "placeType": "Adventures", "weatherInfo": "Warm and humid" }, "evening": { "place": "Palolem Beach", "description": "Relax and unwind on the golden sands of Palolem Beach. Enjoy a swim in the crystal-clear waters, soak up the sun, and savor a delicious seafood dinner at one of the beachside restaurants.", "placeType": "Beaches", "weatherInfo": "Warm and humid" }, "night": { "place": "The Lazy Goose", "description": "Indulge in a vibrant nightlife experience at The Lazy Goose. Enjoy live music, cocktails, and delicious bar food.", "placeType": "NightLife", "weatherInfo": "Warm and humid" }, "timeToExploreAllInHoursWithUnits": "10 hours", "iconicPlaceName": "Dudhsagar Falls" }, { "day": "Day 2", "morning": { "place": "Old Goa", "description": "Explore the historic churches and monuments of Old Goa. Visit the Basilica of Bom Jesus, Se Cathedral, and the Church of St. Francis of Assisi. Immerse yourself in the rich cultural heritage of Goa.", "placeType": "Religious", "weatherInfo": "Warm and humid" }, "evening": { "place": "Panjim", "description": "Wander through the charming streets of Panjim, the capital city of Goa. Explore the colorful markets, visit the Panjim Municipal Market for fresh produce and local crafts, and savor a delightful evening stroll along the Mandovi River.", "placeType": "Must Visits", "weatherInfo": "Warm and humid" }, "night": { "place": "Martin's Corner", "description": "Enjoy a lively evening at Martin's Corner, a popular nightlife spot in Panjim. Savor delicious cocktails, mingle with locals, and enjoy the vibrant atmosphere.", "placeType": "NightLife", "weatherInfo": "Warm and humid" }, "timeToExploreAllInHoursWithUnits": "8 hours", "iconicPlaceName": "Basilica of Bom Jesus" }, { "day": "Day 3", "morning": { "place": "Baga Beach", "description": "Experience the vibrant energy of Baga Beach. Enjoy water sports like parasailing, jet skiing, and banana boat rides. Relax on the beach, indulge in delicious Goan cuisine, and soak up the sun.", "placeType": "Beaches", "weatherInfo": "Warm and humid" }, "evening": { "place": "Calangute Beach", "description": "Explore Calangute Beach, one of the most popular beaches in Goa. Go for a swim, enjoy the sunset, and dine at one of the many restaurants along the beach.", "placeType": "Beaches", "weatherInfo": "Warm and humid" }, "night": { "place": "Tito's Lane", "description": "Experience the vibrant nightlife of Tito's Lane, a bustling street filled with bars, clubs, and restaurants. Enjoy live music, dancing, and the electric atmosphere.", "placeType": "NightLife", "weatherInfo": "Warm and humid" }, "timeToExploreAllInHoursWithUnits": "10 hours", "iconicPlaceName": "Baga Beach" }, { "day": "Day 4", "morning": { "place": "Spice Plantation", "description": "Embark on a tour of a spice plantation. Learn about the various spices grown in Goa, their uses, and the traditional methods of cultivation. Enjoy a delicious lunch with Goan delicacies.", "placeType": "Must Visits", "weatherInfo": "Warm and humid" }, "evening": { "place": "Divar Island", "description": "Take a ferry to Divar Island, a tranquil island located near Panjim. Explore the scenic landscapes, visit the ancient temples, and enjoy a peaceful evening.", "placeType": "Hidden Gems", "weatherInfo": "Warm and humid" }, "night": { "place": "The Fisherman's Wharf", "description": "Indulge in a memorable dining experience at The Fisherman's Wharf, a popular waterfront restaurant. Enjoy delicious seafood, live music, and the scenic views of the Mandovi River.", "placeType": "Cuisines", "weatherInfo": "Warm and humid" }, "timeToExploreAllInHoursWithUnits": "9 hours", "iconicPlaceName": "Spice Plantation" } ]`
					],
				},
			]
		});
	}
	const generatedResponse = await generationResult.sendMessage(filteredPrompt);
	const generatedText = generatedResponse.response.text();

	try {
		// Use a regular expression to find the JSON array within the generatedText
		const jsonArrayMatch = generatedText.match(/\[\s*{[^]*?}\s*\]/);
		let parsedData;
		// Check if the JSON array was found
		if (jsonArrayMatch) {
			// Extract the JSON array string
			let jsonArrayString = jsonArrayMatch[0];
			parsedData = JSON.parse(jsonArrayString);
		}
		else {
			console.error("No JSON array found in the generated text.");
			return { responseCode: '202', errorMessage: 'Whoops! AI can have its off days too. Give it another shot!' };
		}

		// Rest of the code...
		//og(parsedData);
		parsedData = parsedData.map(dayData => ({ ...dayData, placeImage: '' }));
		let locationForImageArr = parsedData.filter(dayData => dayData.iconicPlaceName).map(dayData => dayData.iconicPlaceName);
		// console.log(locationForImageArr);

		let imagesUrlArray = await utils.getPlaceId({ 'locationArray': [locationForImageArr[0]], 'state': parsedData.state, 'country': parsedData.country });

		parsedData = parsedData.map((item, index) => ({
			...item,
			placeImage: imagesUrlArray[index] || ''
		}));
		let locationIds = imagesUrlArray.map((item) => item.locationId);

		locationIds = locationIds.filter((item) => item);

		let addUserItineraryPayload = {
			"plainUserId": inputData.plainUserId,
			"destination": inputData.location,
			"month": inputData.month,
			"budgetType": inputData.budget,
			"paxType": inputData.passengers,
			"itinerary": JSON.stringify(parsedData),
			"categories": inputData.categories,
			"itineraryLocations": locationIds
		};

		let addUserIti = await addUserItinerary(addUserItineraryPayload);
		// console.log('User Itinerary Added', addUserIti);
		// Take package Id from getUsersAiPackage and update the itineraries left
		if (canCreate.packageOwnedId != '' && canCreate.packageOwnedId != undefined && canCreate.packageOwnedId != null) {
			await updateItinerariesLeft({ 'aiPackageId': canCreate.packageOwnedId });
		}

		// Encrypt the itineraryId using simple encryption and decrypt it when needed
		let encryptedItineraryId = Buffer.from(addUserIti.object.itineraryId.toString()).toString('base64');
		// console.log('Encrypted Itinerary ID:', encryptedItineraryId);

		return { responseCode: '200', object: { data: parsedData, locationIds: locationIds, itineraryId: encryptedItineraryId, month: inputData.month, location: inputData.location, budget: inputData.budget, passengers: inputData.passengers, categories: inputData.categories } };
	} catch (e) {
		//  console.log('Invalid JSON object', e);
		return { responseCode: '202', errorMessage: 'Whoops! AI can have its off days too. Give it another shot!' };
	}
}

function fetchTrendingSearches(data, token) {
	let response = {
		response: "success",
		totalPages: 40,
		responseCode: 200,
		object: {
			recentSearches: [],
			trendingSearches: [
				{
					"name": "Ladakh",
					"type": "location"
				},
				{
					"name": "Vishakapattinam",
					"type": "location"
				},
				{
					"name": "Vinay",
					"type": "user"
				},
				{
					"name": "Aisha Chawla",
					"type": "user",
					"userId": 1
				},
				{
					"name": "#HotelsinGoa",
					"type": "hashtag"
				},
				{
					"name": "#BikeTour",
					"type": "hashtag"
				}
			]
		}
	}

	return response;
}


async function manageOnboardingForm(data, token) {
	let imageFile = data['imageFile'];
	data = data['formData'];
	let response;
	let servicesInterestsData;

	//Check if the phone number is verified
	if (data['onboarding__phone'] == '' || !data['onboarding__phone']) {
		response = {
			"status": "error",
			"responseCode": 400,
			"errorMessage": "Please verify your phone number"
		}
	}
	else {
		if (data['onboarding__name'] == '' || !data['onboarding__name']) {
			response = {
				"status": "error",
				"responseCode": 400,
				"errorMessage": "Please enter your name"
			}
		}
		else {
			/*if (data['onboarding__email'] == '' || !data['onboarding__email']) {
				response = {
					"status": "error",
					"responseCode": 400,
					"errorMessage": "Please enter your email"
				}
			}*/
			//else {
			if (data['onboarding__location'] == '' || !data['onboarding__location']) {
				response = {
					"status": "error",
					"responseCode": 400,
					"errorMessage": "Please select your location"
				}
			}
			else {
				if (data['onboarding__type'] == '' || !data['onboarding__type']) {
					response = {
						"status": "error",
						"responseCode": 400,
						"errorMessage": "Please select your type"
					}
				}
				else {
					response = {
						status: "success",
						responseCode: 200,
						errorMessage: ""
					}
				}
			}
			//}
		}
	}

	if (response && response.status == 'success') {
		//First Prepare the data and update the gender/location/type/latitude/longitude
		let genderLocationData = {
			"gender": data['onboarding__gender'],
			"location": data['onboarding__location'],
			"latitude": Number(data['onboarding__latitude']),
			"longitude": Number(data['onboarding__longitude']),
			"service": "",
			"userType": data['onboarding__type'],
		}

		genderLocationData.plainUserId = data.plainUserId;
		try {
			response['updateGenderLocation'] = await checkUniqueUser.updateGenderAndLocation(data.plainUserId, genderLocationData);
		} catch (err) {
			response['updateGenderLocation'] = {
				status: 'error',
				responseCode: 500,
				errorMessage: err.message
			};
		}

		//Services & Interests Data
		let servicesInterestsData = {
			"services": data['onboarding__services'],
			"userInterests": data['onboarding__interests'],
			"userType": data['onboarding__type'],
		}

		//console.log(servicesInterestsData);
		response['updateServicesInterests'] = await apiHelper.masterApiCall(servicesInterestsData, token, 'profile/update_travel_info.php');
		//console.log(response);
	}

	return response;
}


exports.fetchLiveLocationDetails = async function (req) {
	function getClientIP(req) {
		let ipaddress = '';
		if (req.headers['x-forwarded-for']) {
			ipaddress = req.headers['x-forwarded-for'].split(',')[0];
		} else if (req.headers['x-real-ip']) {
			ipaddress = req.headers['x-real-ip'];
		} else if (req.connection.remoteAddress) {
			ipaddress = req.connection.remoteAddress;
		} else {
			ipaddress = 'UNKNOWN';
		}
		return ipaddress;
	}
	let ipAddress = getClientIP(req);
	if (ipAddress == 'UNKNOWN') {
		return {
			"status": "error",
			"responseCode": 400,
			"errorMessage": "Couldn't fetch ip address"
		}
	} else if (req.body.ipAddress == ipAddress) {
		return {
			"status": "success",
			"responseCode": 200,
			"isSameIP": true
		}
	} else {
		if (req.body.isLocalHost && req.body.isLocalHost == "true") {
			ipAddress = req.body.ipAddress;
		}
		const accessKey = process.env.IPSTACK_ACCESSKEY;
		const apiUrl = `http://api.ipstack.com/${ipAddress}?access_key=${accessKey}`;
		let liveLocationData = '';
		let isReqFailed = false;
		await axios.get(apiUrl)
			.then(response => {
				liveLocationData = response.data;
			})
			.catch(error => {
				// Handle errors
				isReqFailed = true;
				console.error('Error:', error);
			});
		if (isReqFailed) {
			return {
				"status": "error",
				"responseCode": 400,
				"errorMessage": "IPStack failed"
			}
		} else {
			return {
				"status": "success",
				"responseCode": 200,
				"liveLocationDetails": liveLocationData
			}
		}
	}
}

//This function checks if the google reCaptcha is valid
async function reCaptchaManage(state, data) {
	let response = false;

	if (state == 'check') {
		let token = data.gToken;
		let userIP = "";
		let userAPI;

		if (data.userIP) {
			userAPI = data.userIP;
		}

		//Axios POST request to the google reCaptcha API
		let reCaptcha = await axios.post('https://www.google.com/recaptcha/api/siteverify?secret=' + process.env.RECAPTCHA_SECRET + '&response=' + token);
		reCaptcha = reCaptcha.data;

		//If the reCaptcha is valid, return true
		if (reCaptcha.success) {
			if (Number(reCaptcha.score) > 0.5) {
				response = true;
			}
		}
	}
	else if (state == 'failedResponse') {
		response = {
			"status": "error",
			"responseCode": "400",
			"errorMessage": "reCaptcha failed"
		}
	}

	return response;
}

// Function to upload a file to GCS using filepath
//async function uploadFileToGCS(filepath) {
async function uploadtoS3New(filepath, folder) {
	try {
		/*var path = require('path');
		console.log('before readng file', filepath);

		//const fileName = Date.now() + '-' + path.basename(filepath);
		const fileName = path.basename(filepath);

		// Copy the file to a temporary location within the same filesystem
		const tempFilePath = path.join('/tmp', fileName);
		await fs.promises.copyFile(filepath, tempFilePath);
*/
		var path = require('path');
		const fileName = path.basename(filepath);
		// Read the file content
		const fileData = await fs.promises.readFile(filepath);
		// Upload the file to GCS
		const file = storage.bucket('share_posts').file(`${folder}/${fileName}`);
		await file.save(fileData);

		//console.log('saved to bucket');

		// Delete the temporary file
		//await fs.promises.unlink(tempFilePath);

		// Get the publicly accessible URL for the uploaded file
		const publicUrl = `https://storage.googleapis.com/share_posts/${fileName}`;

		return { key: publicUrl };
	} catch (error) {
		console.error('Error uploading file:', error);
		throw error;
	}
}

/**
 * Uploads a file to AWS S3 storage
 * @param {string} filePath - The local path to the file to upload
 * @param {string} folder - The folder path in S3 bucket (e.g., 'images/', 'documents/')
 * @returns {Promise<Object>} - The upload response containing the file URL and metadata
 * @throws {Error} - If upload fails
 * 
 * Required environment variables:
 * - AWS_KEY: Your AWS access key ID
 * - AWS_SECRET: Your AWS secret access key
 * - AWS_BUCKET: Your S3 bucket name
 * 
 * Example usage:
 * const result = await uploadtoS3('/path/to/file.jpg', 'images/');
 * console.log('File uploaded to:', result.Location);
 */
async function uploadtoS3(filePath, folder) {
	try {
		// setTimeout(() => {
		//     return true;
		// }, 2000);

		//Load the AWS SDK for Node.js
		var AWS = require('aws-sdk');
		require('aws-sdk/lib/maintenance_mode_message').suppress = true;

		//Create S3 service object
		const s3 = new AWS.S3({
			accessKeyId: process.env.AWS_KEY,
			secretAccessKey: process.env.AWS_SECRET
		});

		//Call S3 to retrieve upload file to specified bucket
		var uploadParams = { Bucket: process.env.AWS_BUCKET, Key: '', Body: '' };
		var file = filePath;

		//Configure the file stream and obtain the upload parameters
		var fileStream = fs.createReadStream(file);
		fileStream.on('error', function (err) {
			// console.log('File Error', err);
		});

		uploadParams.Body = fileStream;
		var path = require('path');
		uploadParams.Key = folder + path.basename(file);

		//Call S3 to retrieve upload file to specified bucket and make it syncronous
		// console.log(uploadParams);
		const response = await s3.upload(uploadParams).promise()
		console.log(response);

		return response;

	} catch (error) {
		console.log(error);
	}
}

/**
 * Uploads a file to Cloudflare R2 storage
 * @param {string} filePath - The local path to the file to upload
 * @param {string} folder - The folder path in R2 bucket (e.g., 'images/', 'documents/')
 * @returns {Promise<Object>} - The upload response containing the file URL and metadata
 * @throws {Error} - If upload fails
 * 
 * Required environment variables:
 * - R2_ACCESS_KEY_ID: Your R2 access key ID
 * - R2_SECRET_ACCESS_KEY: Your R2 secret access key
 * - R2_ENDPOINT: Your R2 endpoint URL (e.g., https://your-account-id.r2.cloudflarestorage.com)
 * - R2_BUCKET: Your R2 bucket name
 * - R2_REGION: Your R2 region (optional, defaults to 'auto')
 * 
 * Example usage:
 * const result = await uploadtoR2('/path/to/file.jpg', 'images/');
 * console.log('File uploaded to:', result.Location);
 */
async function uploadtoR2(filePath, folder, mimeType) {
	try {
		const crypto = require('crypto');
		const https = require('https');
		const path = require('path');

		// Read file data
		const fileData = fs.readFileSync(filePath);
		const fileName = path.basename(filePath);
		const key = folder + fileName;

		// R2 configuration
		const accessKeyId = process.env.R2_ACCESS_KEY_ID;
		const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
		const bucket = process.env.R2_BUCKET;
		const endpoint = process.env.R2_ENDPOINT; // e.g., https://your-account-id.r2.cloudflarestorage.com
		const region = process.env.R2_REGION || 'auto';

		// Parse endpoint URL
		const url = new URL(endpoint);
		const host = url.hostname;
		const port = url.port || (url.protocol === 'https:' ? 443 : 80);
		const isHttps = url.protocol === 'https:';

		// Create the request URL
		const requestUrl = `${endpoint}/${bucket}/${key}`;

		// Create AWS Signature V4
		const now = new Date();
		const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
		const dateStamp = now.toISOString().substr(0, 10).replace(/[:\-]/g, '');

		// Create canonical request
		const canonicalUri = `/${bucket}/${key}`;
		const canonicalQueryString = '';
		const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${crypto.createHash('sha256').update(fileData).digest('hex')}\nx-amz-date:${amzDate}\n`;
		const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
		const payloadHash = crypto.createHash('sha256').update(fileData).digest('hex');

		const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

		// Create string to sign
		const algorithm = 'AWS4-HMAC-SHA256';
		const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
		const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

		// Calculate signature
		const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
			const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
			const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
			const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
			const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
			return kSigning;
		};

		const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, 's3');
		const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

		// Create authorization header
		const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

		// Prepare request options
		const requestOptions = {
			hostname: host,
			port: port,
			path: canonicalUri,
			method: 'PUT',
			headers: {
				'Authorization': authorizationHeader,
				'x-amz-content-sha256': payloadHash,
				'x-amz-date': amzDate,
				'Content-Type': mimeType || 'image/jpeg',
				'Content-Length': fileData.length
			}
		};

		// Make the request
		return new Promise((resolve, reject) => {
			const request = (isHttps ? https : require('http')).request(requestOptions, (response) => {
				let data = '';

				response.on('data', (chunk) => {
					data += chunk;
				});

				response.on('end', () => {
					if (response.statusCode >= 200 && response.statusCode < 300) {
						const result = {
							Location: requestUrl,
							Bucket: bucket,
							Key: key,
							ETag: `"${crypto.createHash('md5').update(fileData).digest('hex')}"`,
							statusCode: response.statusCode
						};
						console.log('R2 Upload Response:', result);
						resolve(result);
					} else {
						const error = new Error(`Upload failed with status ${response.statusCode}: ${data}`);
						console.log('R2 Upload Error:', error.message);
						reject(error);
					}
				});
			});

			request.on('error', (error) => {
				console.log('R2 Upload Error:', error);
				reject(error);
			});

			// Write file data to request
			request.write(fileData);
			request.end();
		});

	} catch (error) {
		console.log('R2 Upload Error:', error);
		throw error;
	}
}

//exports.uploadtoR2 = uploadtoR2;

exports.jsUpload = async function (data, files, headers) {
	let response = false;
	let reason = data.reason;
	let token = data.token;
	let basePath;
	data = data.data;
	let fileName;

	if (reason == 'selfieVerification') {
		console.log('=== SELFIE VERIFICATION LOGIC STARTED ===');
		console.log('Selfie verification started');
		console.log('Files object:', files);

		// Validate input parameters
		if (!files || !files.uploaded_files) {
			console.error('No files provided');
			return {
				responseCode: 400,
				errorMessage: 'No file uploaded. Please select an image file.'
			};
		}

		files = files.uploaded_files;
		console.log('Uploaded files:', files);
		console.log('File size:', files.size, 'bytes');
		console.log('File type:', files.mimetype);
		console.log('Data object:', data);

		// Additional security checks
		if (!files.originalFilename || files.originalFilename.length === 0) {
			console.error('Invalid filename');
			return {
				responseCode: 400,
				errorMessage: 'Invalid file name. Please select a different file.'
			};
		}

		// Validate file size
		if (!files.size || files.size <= 0) {
			console.error('Invalid file size');
			return {
				responseCode: 400,
				errorMessage: 'Invalid file size. Please select a valid image file.'
			};
		}

		// Check for suspicious file extensions
		const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
		const originalFileName = files.originalFilename.toLowerCase();
		if (suspiciousExtensions.some(ext => originalFileName.endsWith(ext))) {
			console.error('Suspicious file extension detected:', originalFileName);
			return {
				responseCode: 400,
				errorMessage: 'Invalid file type. Please select an image file.'
			};
		}

		let fileName = mediaFileName(data, files);
		console.log('Generated filename:', fileName);
		console.log('File validation result:', fileValidation(files));

		if (fileValidation(files)) {
			var oldpath = files.filepath;
			var appDir = directoryPath.dirname(require.main.filename);
			var tempDir = appDir + '/temp';
			var newpath = tempDir + '/' + fileName;

			// Ensure temp directory exists
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir, { recursive: true });
				console.log('Created temp directory:', tempDir);
			}

			// Move file to temp
			try {
				fs.renameSync(oldpath, newpath);
				console.log('File moved to:', newpath);
				console.log('File exists:', fs.existsSync(newpath));
			} catch (moveError) {
				console.error('Error moving file:', moveError);
				response = {
					responseCode: 500,
					errorMessage: 'Failed to process uploaded file. Please try again.'
				};
				return response;
			}

			// Prepare Face++ API call using native Node.js approach (no form-data dependency)
			const faceppApiKey = 'KZQyNye12ZMroXtRb-0n71bEiC22c1fa';
			const faceppApiSecret = 'GZ9budERNRSGWwd-uKFOHue_01u3K44Y';
			const faceppUrl = 'https://api-us.faceplusplus.com/facepp/v3/detect';

			// Read file as buffer and convert to base64
			let imageBuffer, base64Image;
			try {
				imageBuffer = fs.readFileSync(newpath);
				base64Image = imageBuffer.toString('base64');
			} catch (readError) {
				console.error('Error reading file:', readError);
				response = {
					responseCode: 500,
					errorMessage: 'Failed to read uploaded file. Please try again.'
				};
				return response;
			}

			console.log('Sending request to Face++ API...');
			console.log('Image size:', imageBuffer.length, 'bytes');

			try {
				// Try base64 approach first (more reliable without form-data package)
				const formData = new URLSearchParams();
				formData.append('api_key', faceppApiKey);
				formData.append('api_secret', faceppApiSecret);
				formData.append('image_base64', base64Image);
				formData.append('return_attributes', 'gender');

				console.log('Using base64 approach for Face++ API');
				const axiosResponse = await axios.post(faceppUrl, formData, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					timeout: 30000 // 30 second timeout
				});
				console.log('Face++ API Response:', JSON.stringify(axiosResponse.data, null, 2));

				// Validate API response
				if (!axiosResponse.data) {
					console.error('Empty response from Face++ API');
					response = {
						responseCode: 500,
						errorMessage: 'Invalid response from gender detection service. Please try again.'
					};
					return response;
				}

				const faces = axiosResponse.data.faces;
				let gender = null;

				if (faces && faces.length > 0) {
					console.log('Faces detected:', faces.length);
					console.log('First face attributes:', faces[0].attributes);
					if (faces[0].attributes && faces[0].attributes.gender) {
						gender = faces[0].attributes.gender.value;
						console.log('Gender detected:', gender);
						// Note: Face++ API doesn't provide confidence scores for gender detection
					} else {
						console.log('No gender attributes found in face data');
					}
				} else {
					console.log('No faces detected in the image');
				}

				if (gender) {
					response = {
						responseCode: 200,
						gender: gender,
						faceppRaw: axiosResponse.data
					};
				} else {
					// Check if faces were detected but no gender was found
					if (faces && faces.length > 0) {
						response = {
							responseCode: 400,
							errorMessage: 'Face detected but gender could not be determined. Please try with a clearer, front-facing photo.',
							faceppRaw: axiosResponse.data
						};
					} else {
						response = {
							responseCode: 400,
							errorMessage: 'No face detected in the image. Please ensure the image contains a clear face.',
							faceppRaw: axiosResponse.data
						};
					}
				}
			} catch (err) {
				console.error('Face++ API Error:', err.message);
				console.error('Error details:', err.response?.data || 'No response data');

				let errorMessage = 'Face++ API error: ' + err.message;

				// Provide more specific error messages
				if (err.code === 'ECONNABORTED') {
					errorMessage = 'Request timeout. Please try again.';
				} else if (err.response?.status === 401) {
					errorMessage = 'API authentication failed. Please contact support.';
				} else if (err.response?.status === 429) {
					errorMessage = 'API rate limit exceeded. Please try again later.';
				} else if (err.response?.status === 400) {
					errorMessage = 'Invalid image format or size. Please try with a different image.';
				}

				response = {
					responseCode: 500,
					errorMessage: errorMessage,
					error: err.message
				};
			}

			// Delete the file from the server immediately after processing
			fs.unlink(newpath, function (err) {
				if (err) console.error('Error deleting temp file:', err);
				else console.log('Temp file deleted successfully');
			});
		} else {
			response = {
				responseCode: 400,
				errorMessage: 'Invalid file format or size. Please select a valid image file (JPG, PNG, GIF) under 20MB.'
			};
		}

		console.log('=== SELFIE VERIFICATION LOGIC ENDED ===');
		console.log('Final response:', response);
		return response;
	}
	else if (reason == 'uploadDP' || reason == 'groupChatImage') {
		files = files.uploaded_files;
		fileName = mediaFileName(data, files);

		if (fileValidation(files)) {
			var oldpath = files.filepath;
			var appDir = directoryPath.dirname(require.main.filename);
			var newpath = appDir + '/temp/' + fileName;

			// Must complete rename before R2 reads newpath
			await fs.promises.rename(oldpath, newpath);

			if (reason == 'groupChatImage') {
				basePath = 'uploads/chat_media/display_picture/';
			}
			else {
				basePath = 'uploads/display_picture/';
			}

			//response = await uploadtoS3(newpath, basePath);
			response = await uploadtoR2(newpath, basePath, files.mimetype);
			// console.log('R2 Upload', r2Response);
			//console.log(response);

			if (reason !== 'groupChatImage') {
				const userId = getUserIdFromToken(token, headers);
				if (!userId) {
					response = {
						response: "error",
						responseCode: 401,
						errorMessage: "Authorization has been denied for this request."
					};
				} else {
					response = await checkUniqueUser.updateDisplayPicture(userId, response.Key, response.Key);
				}
			}
			else {
				response = {
					responseCode: 200,
					images: response
				}
			}

			await fs.promises.unlink(newpath).catch(function (unlinkErr) {
				console.log('Temp unlink failed (uploadDP/groupChatImage):', unlinkErr);
			});
		}
		else {
			response = {
				"responseCode": 400,
				"errorMessage": "Invalid files"
			}
		}
	}
	else if (reason == 'editDP') {
		files = files.uploaded_files;
		fileName = mediaFileName(data, files);

		if (fileValidation(files)) {
			var oldpath = files.filepath;
			var appDir = directoryPath.dirname(require.main.filename);
			var newpath = appDir + '/temp/' + fileName;

			// Must complete rename before R2 reads newpath
			await fs.promises.rename(oldpath, newpath);

			//response = await uploadtoS3(newpath, 'uploads/display_picture/');
			response = await uploadtoR2(newpath, 'uploads/display_picture/', files.mimetype);
			console.log('R2 Upload', response);
			// console.log('R2 Upload', response);

			const userId = getUserIdFromToken(token, headers);
			if (!userId) {
				response = {
					response: "error",
					responseCode: 401,
					errorMessage: "Authorization has been denied for this request."
				};
			} else {
				response = await checkUniqueUser.updateDisplayPicture(userId, response.Key, response.Key);
			}

			await fs.promises.unlink(newpath).catch(function (unlinkErr) {
				console.log('Temp unlink failed (editDP):', unlinkErr);
			});
		}
		else {
			response = {
				"responseCode": 400,
				"errorMessage": "Invalid files"
			}
		}
	}
	else if (reason == 'coverUpload') {
		console.log('files', files);
		console.log('data', data);
		files = files.uploaded_files;
		fileName = mediaFileName(data, files);

		if (fileValidation(files)) {
			var oldpath = files.filepath;
			var appDir = directoryPath.dirname(require.main.filename);
			var newpath = appDir + '/temp/' + fileName;

			// Must complete rename before R2 reads newpath
			await fs.promises.rename(oldpath, newpath);

			//response = await uploadtoS3(newpath, 'uploads/cover_photo/');
			console.log('AWS Upload', response);
			response = await uploadtoR2(newpath, 'uploads/cover_photo/', files.mimetype);
			const userId = getUserIdFromToken(token, headers);
			if (!userId) {
				response = {
					response: "error",
					responseCode: 401,
					errorMessage: "Authorization has been denied for this request."
				};
			} else {
				response = await checkUniqueUser.updateCoverPhoto(userId, { mediaList: [response.Key] });
			}


			await fs.promises.unlink(newpath).catch(function (unlinkErr) {
				console.log('Temp unlink failed (coverUpload):', unlinkErr);
			});
		}
		else {
			response = {
				"responseCode": 400,
				"errorMessage": "Invalid files"
			}
		}
	}
	// New functions for Flutter app --> These wont call masterApiCall
	else if (reason == 'uploadDPNew' || reason == 'groupChatImageNew') {
		files = files.uploaded_files;
		fileName = mediaFileName(data, files);

		if (fileValidation(files)) {
			var oldpath = files.filepath;
			var appDir = directoryPath.dirname(require.main.filename);
			var newpath = appDir + '/temp/' + fileName;

			// Must complete rename before R2 reads newpath
			await fs.promises.rename(oldpath, newpath);

			if (reason == 'groupChatImageNew') {
				basePath = 'uploads/chat_media/display_picture/';
			}
			else {
				basePath = 'uploads/display_picture/';
			}

			//response = await uploadtoS3(newpath, basePath);
			response = await uploadtoR2(newpath, basePath, files.mimetype);
			//console.log('R2 Upload', r2Response);
			console.log(response);


			await fs.promises.unlink(newpath).catch(function (unlinkErr) {
				console.log('Temp unlink failed (uploadDPNew/groupChatImageNew):', unlinkErr);
			});

			return response;
		}
		else {
			response = {
				"responseCode": 400,
				"errorMessage": "Invalid files"
			}
		}
	}
	else if (reason == 'editDPNew') {
		files = files.uploaded_files;
		fileName = mediaFileName(data, files);

		if (fileValidation(files)) {
			var oldpath = files.filepath;
			var appDir = directoryPath.dirname(require.main.filename);
			var newpath = appDir + '/temp/' + fileName;

			// Must complete rename before R2 reads newpath
			await fs.promises.rename(oldpath, newpath);

			//response = await uploadtoS3(newpath, 'uploads/display_picture/');
			response = await uploadtoR2(newpath, 'uploads/display_picture/', files.mimetype);
			//console.log('R2 Upload', r2Response);
			// console.log('R2 Upload', response);


			await fs.promises.unlink(newpath).catch(function (unlinkErr) {
				console.log('Temp unlink failed (editDPNew):', unlinkErr);
			});

			return response;
		}
		else {
			response = {
				"responseCode": 400,
				"errorMessage": "Invalid files"
			}
		}
	}
	else if (reason == 'coverUploadNew') {
		console.log('files', files);
		console.log('data', data);
		files = files.uploaded_files;
		fileName = mediaFileName(data, files);

		if (fileValidation(files)) {
			var oldpath = files.filepath;
			var appDir = directoryPath.dirname(require.main.filename);
			var newpath = appDir + '/temp/' + fileName;

			// Must complete rename before R2 reads newpath
			await fs.promises.rename(oldpath, newpath);

			//response = await uploadtoS3(newpath, 'uploads/cover_photo/');
			response = await uploadtoR2(newpath, 'uploads/cover_photo/', files.mimetype);
			//console.log('R2 Upload', r2Response);
			//console.log('AWS Upload', response);


			await fs.promises.unlink(newpath).catch(function (unlinkErr) {
				console.log('Temp unlink failed (coverUploadNew):', unlinkErr);
			});

			return response;
		}
		else {
			response = {
				"responseCode": 400,
				"errorMessage": "Invalid files"
			}
		}
	}
	else if (reason == 'uploadChatMedia' || reason == 'uploadMessageDashboardMedia') {
		files = files.uploaded_files;
		data = JSON.parse(data);
		let fileName = mediaFileName(data.userId, files);
		let userId;

		if (fileValidation(files)) {
			var oldpath = files.filepath;
			var appDir = directoryPath.dirname(require.main.filename);
			var newpath = appDir + '/temp/' + fileName;

			// Must complete rename before R2 reads newpath
			await fs.promises.rename(oldpath, newpath);

			if (data.userId && data.userId.length > 10) {
				userId = apiHelper.decrypt(data.userId);
			} else {
				userId = data.userId;
			}

			if (userId && userId.length > 10) {
				userId = apiHelper.decrypt(userId);
			}

			//response = await uploadtoS3(newpath, 'uploads/chat_media/' + userId + '/');
			response = await uploadtoR2(newpath, 'uploads/chat_media/' + userId + '/', files.mimetype);
			response = {
				responseCode: 200,
				imageData: response,
				userId: data.userId,
				chatId: data.chatId,
				mediaOriginal: {
					mediaName: files.originalFilename,
					mediaExtension: files.originalFilename.split('.').pop(),
					mediaSize: files.size
				},
				timestamp: data.timeStamp,
			}

			await fs.promises.unlink(newpath).catch(function (unlinkErr) {
				console.log('Temp unlink failed (uploadChatMedia):', unlinkErr);
			});
		}
		else {
			response = {
				"responseCode": 400,
				"errorMessage": "Invalid files"
			}
		}
	}
	else if (reason == 'uploadListingImages') {
		let imageFiles = [];
		for (var i = 0; i < 18; i++) {
			if (files['uploadListingImages' + i]) {
				imageFiles.push(files['uploadListingImages' + i]);
			} else {
				break;
			}
		}
		let allFilesUploaded = true;
		let uploadedFiles = [];
		let failedUploads = [];
		for (var i = 0; i < imageFiles.length; i++) {
			fileName = mediaFileName(data, imageFiles[i]);
			console.log(fileName);
			let file = imageFiles[i];
			if (fileValidation(file)) {
				var oldpath = file.filepath;
				var appDir = directoryPath.dirname(require.main.filename);
				var newpath = appDir + '/temp/' + fileName;

				await fs.promises.rename(oldpath, newpath);

				let uploadedFile = await uploadtoR2(newpath, 'uploads/posts/', file.mimetype);
				uploadedFiles.push(uploadedFile);
				await fs.promises.unlink(newpath).catch(function (unlinkErr) {
					console.log('Temp unlink failed (uploadListingImages):', unlinkErr);
				});
			}
			else {
				// /*response = {
				//     "responseCode": 400,
				//     "errorMessage": "Invalid files"
				// }*/
				failedUploads.push(fileName);
			}
		}
		response = { "responseCode": 200, "successfulUploads": uploadedFiles, "failedUploads": failedUploads };

	}
	else {
		try {
			console.log('files', files);
			files = files.uploaded_files;
			//files = files['share__upload'];
			//files = files;
			fileName = mediaFileName(headers.userid, files);

			if (headers.token) {
				token = headers.token;
				if (fileValidation(files)) {
					var oldpath = files.filepath;
					var appDir = directoryPath.dirname(require.main.filename);
					console.log(appDir);
					var newpath = appDir + '/temp/' + fileName;

					// Must complete rename before R2 reads newpath (callback fs.rename raced the upload)
					await fs.promises.rename(oldpath, newpath);

					response = await uploadtoR2(newpath, 'uploads/posts/', files.mimetype);

					await fs.promises.unlink(newpath).catch(function (unlinkErr) {
						console.log('Temp unlink failed (uploadPost):', unlinkErr);
					});
				}
				else {
					response = {
						"responseCode": 400,
						"errorMessage": "Invalid file format or file size is too large"
					}
				}
			} else {
				response = {
					responseCode: 401,
					errorMessage: 'Authentication required'
				};
			}
		} catch (error) {
			console.log(error);
			response = {
				responseCode: 500,
				errorMessage: (error && error.message) ? error.message : 'Upload failed'
			};
		}
	}

	return response;

	//Image and Video. Image in png, jpg, jpeg, gif format and max size 10MB and video in mp4 format and max size 100MB
	function fileValidation(file) {
		let response = false;
		file.mimetype = (file.mimetype || '').toLowerCase();
		const fileName = (file.originalFilename || '').toLowerCase();
		const fileExt = fileName.includes('.') ? fileName.split('.').pop() : '';
		console.log(file.mimetype);
		console.log(file.size);

		// WhatsApp-style shareable files: images, videos, audio, docs/archives.
		const imageExts = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif']);
		const videoExts = new Set(['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp']);
		const audioExts = new Set(['mp3', 'm4a', 'aac', 'wav', 'ogg', 'opus', 'amr']);
		const documentExts = new Set([
			'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
			'txt', 'rtf', 'csv', 'odt', 'ods', 'odp',
			'zip', 'rar', '7z', 'tar', 'gz',
			'json', 'xml', 'html', 'htm', 'md', 'log',
			'vcf', 'pages', 'numbers', 'key'
		]);

		const imageMimes = new Set([
			'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
			'image/webp', 'image/bmp', 'image/heic', 'image/heif'
		]);
		const videoMimes = new Set([
			'video/mp4', 'video/quicktime', 'video/x-msvideo',
			'video/x-matroska', 'video/webm', 'video/3gpp'
		]);
		const audioMimes = new Set([
			'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a',
			'audio/aac', 'audio/wav', 'audio/x-wav',
			'audio/ogg', 'audio/opus', 'audio/amr'
		]);
		const documentMimes = new Set([
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-powerpoint',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'application/rtf', 'application/json', 'application/xml',
			'application/zip', 'application/x-zip-compressed',
			'application/x-rar-compressed', 'application/x-7z-compressed',
			'application/x-tar', 'application/gzip',
			'text/plain', 'text/csv', 'text/html', 'text/markdown', 'text/xml',
			'text/vcard'
		]);

		const isImage = imageMimes.has(file.mimetype) || imageExts.has(fileExt);
		const isVideo = videoMimes.has(file.mimetype) || videoExts.has(fileExt);
		const isAudio = audioMimes.has(file.mimetype) || audioExts.has(fileExt);
		const isDocument = documentMimes.has(file.mimetype) || documentExts.has(fileExt);

		// Size limits (keep existing image/video behavior, extend for docs/audio).
		if (isImage && file.size <= 20000000) {
			response = true;
		}
		else if (isVideo && file.size <= 200000000) {
			response = true;
		}
		else if ((isAudio || isDocument) && file.size <= 200000000) {
			response = true;
		}

		return response;
	}

	function mediaFileName(userId, file) {
		//Make the file name with userId and timestamp
		if (userId == undefined || userId == null || userId == 'undefined' || userId == 'null' || userId == '') {
			userId = randomInt(100000, 999999);
		}

		let fileName = userId + '_' + Date.now();

		//Extract the file extension and add it to the file nam
		let fileExtension = file.originalFilename.split('.').pop();
		fileName = fileName + '.' + fileExtension;

		return fileName;
	}
}

exports.jsInit = async function (data) {
	let response = [];
	let reason = data.reason;
	let token = data.token;
	data = data.data;

	if (reason == 'getTabs') {
		response = await apiHelper.fetchUIConfig(token);
	}
	else if (reason == 'changeLastActiveStatus') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.changeLastActiveStatus(data, userId);
	}
	else if (refreshToken == 'refreshAccessToken') {
		response = await refreshAccessToken(token);
	}
	else if (reason == 'getAllPosts') {
		response = await apiHelper.fetchPosts(data, token);
	}
	else if (reason == 'likePost' || reason == 'lfbCheck' || reason == 'likeShot') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		data.authUserId = userId;
		response = await checkUniqueUser.likePost(data);
	}
	else if (reason == 'addUserToFindGroup') {
		let grpResponse = await addUserToFindBuddyGroup(data, token);
		response = grpResponse;
	}
	else if (reason == 'bookmarkPost') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.saveBookmark(userId, data);
	}
	else if (reason == 'fetchComments') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.getComments(data, userId);
	}
	else if (reason == 'fetchUserProfile') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.getUserProfile(data.userId || data.plainUserId, userId);
	}
	else if (reason == 'postComment') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.commentPost(data, userId);
	}
	else if (reason == 'likeCommentOrReply') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.likeCommentOrReply(userId, data);
	}
	else if (reason == 'getCommentReplies') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.getReplies(data, userId);
	}
	else if (reason == 'fetchPost') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.getPostById(data, userId);
	}
	else if (reason == 'fetchLikes') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		if (data && !data.travelFeedPost && data.postId !== undefined) {
			data = {
				travelFeedPost: {
					postId: data.postId,
					pageNumber: data.pageNumber || 0,
					totalItems: data.totalItems || 0
				}
			};
		}
		response = await checkUniqueUser.getLikes(data, userId);
	}
	else if (reason == 'followUser') {
		let targetUserId = data.userId;
		if (typeof targetUserId === 'string') {
			try {
				const decrypted = apiHelper.decrypt(targetUserId);
				targetUserId = parseInt(decrypted, 10);
			} catch (e) {
				targetUserId = parseInt(targetUserId, 10);
			}
		}
		data.targetUserId = targetUserId;
		response = await checkUniqueUser.followUnfollowUser(data);
	}
	else if (reason == 'fetchSearchLocations') {
		response = await apiHelper.masterApiCall(data, token, 'search/default_search_locations.php');
	}
	else if (reason == 'fetchSearchBuddies') {
		try {
			response = await apiHelper.masterApiCall(data, token, 'search/default_search_buddies.php');
		} catch (error) {
			response = {
				"responseCode": 400,
				"errorMessage": "Invalid data"
			}
		}
	}
	else if (reason == 'fetchTrendingSearches') {
		response = await apiHelper.masterApiCall(data, token, '/search/fetch_search_history.php', 'GET');
	}
	else if (reason == 'searchLocation' || reason == 'locationSearch' || reason == 'editProfile' || reason == 'searchFindBuddy') {
		response = await apiHelper.masterApiCall(data, token, 'search/search_location.php');
	}
	else if (reason == 'searchLocationNode') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.searchLocation(data, userId);
	}
	else if (reason == 'searchBuddy') {
		response = await apiHelper.masterApiCall(data, token, 'search/search_buddy_new.php');
	}
	else if (reason == 'searchBuddyNode') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.searchBuddy(data, userId);
	}
	else if (reason == 'searchHashtag') {
		response = await apiHelper.masterApiCall(data, token, 'post/filter_hashtags.php', '');
	}
	else if (reason == 'fetchNotifications') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.fetchNotifications(data, userId);
	}
	else if (reason == 'fetchCoupons') {
		response = await apiHelper.masterApiCall(data, token, 'verified/get_promo_code.php', 'GET');
	}
	else if (reason == 'cloudinaryTest') {
		response = await cloudinaryHelper.cloudinaryTest();
	}
	else if (reason == 'cloudinaryUpload') {
		response = await cloudinaryHelper.cloudinaryUpload(data);
	}
	else if (reason == 'fetchProfile') {
		response = await apiHelper.masterApiCall(data, token, 'profile/get_user_profile.php?userId=' + data['userId'], 'GET');
	}
	else if (reason == 'fetchFollowers') {
		response = await apiHelper.masterApiCall(data, token, 'profile/get_followers_or_following.php');
	}
	else if (reason == 'fetchRatings') {
		response = await apiHelper.masterApiCall(data, token, 'profile/get_reviews.php');
	}
	else if (reason == 'rateUser') {
		response = await apiHelper.masterApiCall(data, token, 'profile/rate_user.php');
	}
	else if (reason == 'fetchShots') {
		response = await apiHelper.masterApiCall(data, token, 'post/get_all_posts.php');
	}
	else if (reason == 'fetchCountries') {
		response = await apiHelper.masterApiCall(data, token, 'utils/get_countries.php', 'GET');
	}
	else if (reason == 'login') {
		if (!data) { //For Guest User
			response = await apiHelper.masterApiCall({ "deviceType": "web", "isGuestUser": true }, '', '/auth/login_with_id.php');
			//Replace the token with an encrypted token
			response.object.token = apiHelper.encrypt(response.object.token);
		}
		else {
			if (reCaptchaManage('check', data)) {
				response = await apiHelper.manageLogin(data, token);
				if (response.responseCode == 200) {
					response.object.token = apiHelper.encrypt(response.object.token);
				}
			}
			else {
				reCaptchaManage('failedResponse');
			}
		}
	}
	else if (reason == 'signUp') {
		response = await apiHelper.manageSignUp(data, token);
	}
	else if (reason == 'forgotPass') {
		response = await apiHelper.masterApiCall(data, token, 'auth/forgot_password.php');
	}
	else if (reason == 'resetPass') {
		response = await apiHelper.masterApiCall(data, token, 'auth/reset_password.php');
	}
	else if (reason == 'matchOtpForgot') {
		response = await apiHelper.masterApiCall(data, token, 'auth/match_otp_forgot.php');
	}
	else if (reason == 'uniqueCheck') {
		if (reCaptchaManage('check', data)) {
			response = await apiHelper.masterApiCall(data, '', 'auth/unique_check_and_send_otp.php');
		}
		else {
			console.log('Went Here as', data);
			reCaptchaManage('failedResponse');
		}
	}
	else if (reason == 'fetchInterests') {
		response = await apiHelper.masterApiCall(data, token, 'post/get_trending_interests.php', 'GET');
	}
	else if (reason == 'profileSendOTP') {
		response = await apiHelper.masterApiCall(data, token, 'profile/send_phone_otp.php');
	}
	else if (reason == 'updatePhoneNumber') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		if (!userId) {
			response = {
				response: "error",
				responseCode: 401,
				errorMessage: "Authorization has been denied for this request."
			};
		} else {
			response = await checkUniqueUser.updatePhoneNumber(userId, data);
		}
	}
	else if (reason == 'fetchServicesList') {
		response = await apiHelper.masterApiCall(data, token, 'marketplace/get_service_list.php?userType=1', 'GET');
	}
	else if (reason == 'saveListing') {
		console.log('called saved listings');
		response = await apiHelper.masterApiCall(data, token, 'marketplace/save_listing.php');
		console.log(response);
	}
	else if (reason == 'updateOnboarding') {
		response = await manageOnboardingForm(data, token);
	}
	else if (reason == 'fetchProfileViews') {
		try {
			const pageNumber = parseInt(data.pageNumber, 10) || 0;
			const userName = data.userName || "";
			response = await checkUniqueUser.getProfileCountUsers(data.plainUserId, pageNumber, userName);
		} catch (err) {
			response = {
				status: 'error',
				responseCode: 500,
				errorMessage: err.message
			};
		}
	}
	else if (reason == 'loginGoogle') {
		response = await checkUniqueUser.loginWithGoogle(data);
		try {
			if (response.responseCode == 200 && response.object && response.object.token) {
				response.object.token = apiHelper.encrypt(response.object.token);
			}
		}
		catch (e) {
			console.log(e);
		}
	}
	else if (reason == 'loginFacebook') {
		response = await checkUniqueUser.loginWithFacebook(data);
		if (response.responseCode == 200 && response.object && response.object.token) {
			response.object.token = apiHelper.encrypt(response.object.token);
		}
	}
	else if (reason == 'loginApple') {
		response = await checkUniqueUser.loginWithApple(data);
		if (response.responseCode == 200 && response.object && response.object.token) {
			response.object.token = apiHelper.encrypt(response.object.token);
		}
	}
	else if (reason == 'logout') {
		response = await checkUniqueUser.logout({ authorization: token }, data.plainUserId, data);
	}
	else if (reason == 'updateTravelInfo') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.updateTravelInfo(userId, data);
	}
	else if (reason == 'updateVerifyUser') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.updateVerifyUser(data, userId);
	}
	else if (reason == 'feedback') {
		response = await apiHelper.masterApiCall(data, token, '/settings/insert_feedback.php');
	}
	else if (reason == 'blockedUsers') {
		try {
			const blockedList = await checkUniqueUser.getBlockedUsers(data.plainUserId, data);
			response = {
				response: 'success',
				responseCode: 200,
				object: blockedList
			};
		} catch (err) {
			response = {
				status: 'error',
				responseCode: 500,
				errorMessage: err.message
			};
		}
	}
	else if (reason == 'blockUser' || reason == 'unblockUser') {
		let blockedUserId = data.userId;
		if (typeof blockedUserId === 'string') {
			try {
				const decrypted = apiHelper.decrypt(blockedUserId);
				blockedUserId = parseInt(decrypted, 10);
			} catch (e) {
				blockedUserId = parseInt(blockedUserId, 10);
			}
		}
		if (!blockedUserId || !data.plainUserId) {
			response = {
				status: "error",
				responseCode: 400,
				errorMessage: "Invalid block request parameters."
			};
		} else {
			const type = (reason === 'unblockUser' || data.type === 2 || data.type === '2') ? 2 : 1;
			try {
				await checkUniqueUser.blockUnblockUser(data.plainUserId, blockedUserId, type);
				response = {
					responseCode: 200,
					message: type === 1 ? 'User Blocked Successfully' : 'User UnBlocked Successfully'
				};
			} catch (err) {
				response = {
					status: "error",
					responseCode: 500,
					errorMessage: err.message
				};
			}
		}
	}
	else if (reason == 'reportPost') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.reportFeed(userId, data);
	}
	else if (reason == 'reportUser') {
		response = await apiHelper.masterApiCall(data, token, '/profile/report_user.php');
	}
	else if (reason == 'getPaymentDetails') {
		response = await razorPayHelper.getPaymentDetails(data);
	}
	else if (reason == 'getOrderId') {
		response = await razorPayHelper.getOrderId(data);
	}
	else if (reason == 'getPaymentsByOrderId') {
		response = await razorPayHelper.getPaymentsByOrderId(data);
	}
	else if (reason == 'validatePayments') {
		response = await razorPayHelper.validatePayment(data);
	}
	else if (reason == 'givePremium') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.updateVerifyUser(data, userId);
	}
	else if (reason == 'fetchInfluencers') {
		response = await apiHelper.masterApiCall(data, token, '/post/get_influencers.php');
	}
	else if (reason == 'fetchAllInfluencers') {
		response = await apiHelper.masterApiCall(data, token, '/post/get_all_influencers.php');
	}
	else if (reason == 'uploadPost') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.uploadPost(data, userId);
	}
	else if (reason == 'updatePost') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.editPost(data, userId);
	}
	else if (reason == 'deletePost') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.deletePost(userId, data.postId);
	}
	else if (reason == 'searchProfileViews') {
		try {
			const pageNumber = parseInt(data.pageNumber, 10) || 0;
			const userName = data.userName || "";
			response = await checkUniqueUser.getProfileCountUsers(data.plainUserId, pageNumber, userName);
		} catch (err) {
			response = {
				status: 'error',
				responseCode: 500,
				errorMessage: err.message
			};
		}
	}
	else if (reason == 'getPaymentDetails') {
		response = await razorPayHelper.getPaymentDetails(data);
	}
	else if (reason == 'signUpOTP') {
		response = await apiHelper.masterApiCall(data, '', '/auth/register_user.php', 'post');
		try {
			console.log(response);
			response.object.oldToken = response.object.token;
			response.object.token = apiHelper.encrypt(response.object.token);
		}
		catch (e) {
			console.log(e);
		}
	}
	else if (reason == 'getPremiumPricingList') {
		response = await apiHelper.masterApiCall(data, token, '/utils/get_countrywise_pricelist.php', 'post');
	}
	else if (reason == 'getSubscriptionInfo') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		if (!userId) {
			response = {
				response: "error",
				responseCode: 401,
				errorMessage: "Authorization has been denied for this request."
			};
		} else {
			response = await checkUniqueUser.getSubscriptionsInfo(userId, data);
		}
	}
	else if (reason == 'fetchServices' || reason == 'searchServices') {
		response = await apiHelper.masterApiCall(data, token, '/marketplace/fetch_experiences.php');
	}
	else if (reason == 'getServices') {
		console.log(data);
		response = await apiHelper.masterApiCall(data, token, 'marketplace/fetch_listing_detail.php');
	}
	else if (reason == 'update_gender_and_location') {
		try {
			response = await checkUniqueUser.updateGenderAndLocation(data.plainUserId, data);
		} catch (err) {
			response = {
				status: 'error',
				responseCode: 500,
				errorMessage: err.message
			};
		}
	}
	else if (reason == 'lfb') {
		response = await apiHelper.masterApiCall(data, token, '/verified/fetch_looking_for_buddies.php');
	}
	else if (reason == 'contactedLeads') {
		response = await apiHelper.masterApiCall(data, token, '/marketplace/fetch_leads.php');
	}
	else if (reason == 'connectLead') {
		response = await apiHelper.masterApiCall(data, token, '/marketplace/update_listing_interest.php');
	}
	else if (reason == 'spDashboard') {
		response = await apiHelper.masterApiCall(data, token, '/dashboard/fetch_dashboard_info.php');
	}
	else if (reason == 'serviceAttributes') {
		response = await apiHelper.masterApiCall(data, token, '/marketplace/get_service_attribute.php');
	}
	else if (reason == 'costDurations') {
		response = await apiHelper.masterApiCall(data, token, '/marketplace/get_cost_durations.php');
	}
	else if (reason == 'updateListingStatus') {
		response = await apiHelper.masterApiCall(data, token, '/marketplace/update_listing_status.php');
	}
	else if (reason == 'changePassword') {
		response = await apiHelper.masterApiCall(data, token, 'profile/update_password.php');
	}
	else if (reason == 'deactivateAccount') {
		response = await apiHelper.masterApiCall(data, token, '/profile/deactivate_account.php');
	}
	else if (reason == 'getFeedCards') {
		response = await apiHelper.masterApiCall(data, token, '/utils/get_card_data.php');
	}
	else if (reason == 'addExperienceRating') {
		response = await addExpRatings(data);
	}
	else if (reason == 'getExperienceRatings') {
		response = await fetchExpRatings(data);//{experienceId:1}
	}
	else if (reason == 'addExperience') {
		response = await addExps(data);
	}
	else if (reason == 'editExperience') {
		response = await editExps(data);
	}
	else if (reason == 'addExperienceViews') {
		response = await addExpView(data);
	}

	else if (reason == 'getExperiences') {
		response = await getExps(data);
	}
	else if (reason == 'getAvailableTickets') {
		response = await getAvailTickts(data);
	}
	else if (reason == 'blockTickets') {
		response = await blkTickts(data);
	}
	else if (reason == 'confirmBooking') {
		response = await bookTickets(data, token);
	}
	else if (reason == 'correctTickets') {
		response = await correctTickets(data, token);
	}
	else if (reason == 'getExperienceDashboard') {
		response = await getExpDashboard(data);
	}
	else if (reason == 'getOrderDetails') {
		response = await getOrders(data);
	}
	else if (reason == 'getBookingsForExperience') {
		response = await getBookingsForExperience(data);
	}
	else if (reason == 'approveBooking') {
		response = await approveBooking(data);
	}
	else if (reason == 'cancelBooking') {
		response = await cancelExperienceBooking(data);
	}
	else if (reason == 'customLogin') {
		response = await custLogin(data);
	}
	else if (reason == 'deleteExperience') {
		response = await deleteExp(data);
	}
	else if (reason == 'addCoupon') {
		response = await addCoupons(data);
	}
	else if (reason == 'getCoupons') {
		response = await getCoupons(data);
	}
	else if (reason == 'sendEnquiry') {
		response = await sendEnquiry(data);
	}
	else if (reason == 'getCohorts') {
		response = await apiHelper.masterApiCall(data, token, 'settings/get_msg_dashboard_items.php', 'GET');
		console.log(response);
	}
	else if (reason == 'getCategories') {
		response = await getCategories(data);
	}
	else if (reason == 'addCancelledOrder') {
		response = await addCancelledOrder(data);
	}
	else if (reason == 'verifyFirebaseOTP') {
		response = await firebaseChatConnection.verifyFirebaseOTP(data);
	}
	else if (reason == 'getGroupCount') {
		response = await firebaseChatConnection.getGroupCount();
	}
	else if (reason == 'getChatCount') {
		response = await firebaseChatConnection.getChatCount();
	}
	else if (reason == 'addLocations') {
		response = await addLocations(data);
	}
	else if (reason == 'searchLocations') {
		response = await searchLocations(data);
	}
	else if (reason == 'addOrUpdateSessions') {
		response = await addOrUpdateSessions(data);
	}
	else if (reason == 'priceValidation') {
		response = await apiHelper.priceValidationForExperiences(data);
	}
	else if (reason == 'getUsersFollowInfo') {
		response = await getUsersFollowInfo(data);
	}
	else if (reason == 'getConnections') {
		response = await checkUniqueUser.getConnections(data);
	}
	else if (reason == 'isPhoneNumberUnique') {
		response = await isPhoneNumberUnique(data);
	}
	else if (reason == 'zohoAccessKey') {
		response = await apiHelper.zohoAccessToken();
	}
	else if (reason == 'getExperienceViews') {
		response = await getExperienceViews(data);
	}
	else if (reason == 'fetchChatUsers') {
		console.log('From Bem - fetchChatUsers');
		response = await firebaseChatConnection.fetchChatUserChats(data, token);
	}
	else if (reason == 'fetchChatSingleUser') {
		response = await firebaseChatConnection.fetchChatUserChat(data);
	}
	else if (reason == 'fetchChatMessages') {
		response = await firebaseChatConnection.fetchChatMessages(data, token);
	}
	else if (reason == 'postChatMessage') {
		response = await firebaseChatConnection.postChatMessage(data, token);
	}
	else if (reason == 'modifyChatMessage') {
		response = await firebaseChatConnection.postChatMessage(data, token, true);
	}
	else if (reason == 'initiateChat') {
		response = await firebaseChatConnection.createUserChat(data, token);
	}
	else if (reason == 'acceptChatRequest') {
		response = await firebaseChatConnection.updateUserChats(data, token);
	}
	else if (reason == 'updateChatFlags') {
		response = await firebaseChatConnection.updateChatFlags(data, token);
	}
	else if (reason == 'setUserPresence') {
		response = await firebaseChatConnection.setUserPresence(token);
	}
	else if (reason == 'setUserNode') {
		response = await firebaseChatConnection.setUserNode(data, token);
	}
	else if (reason == 'addUsersToGroup') {
		response = await firebaseChatConnection.addUsersToGroup(data, token);
	}
	else if (reason == 'fetchGroupMembers') {
		response = await firebaseChatConnection.fetchGroupMembers(data, token);
	}
	else if (reason == 'exitUserFromGroup') {
		response = await firebaseChatConnection.exitUserFromGroup(data, token);
	}
	else if (reason == 'removeUserFromGroup') {
		response = await firebaseChatConnection.removeUserFromGroup(data, token);
	}
	else if (reason == 'updateGroupImage') {
		response = await firebaseChatConnection.updateGroupImage(data, token);
	}
	else if (reason == 'updateGroupLabel') {
		response = await firebaseChatConnection.updateGroupLabel(data, token);
	}
	else if (reason == 'fetchUsersGroups') {
		response = await firebaseChatConnection.fetchUsersGroups(token);
	}
	else if (reason == 'initiateMessage') {
		response = await sendMessageToCohort(data);
	}
	else if (reason == 'getMessageHistory') {
		response = await getMessageHistory(data);
	}
	else if (reason == 'updateMessageDashboardHistory') {
		response = await updateMessageDashboardHistory(data);
	}
	else if (reason == 'havala') {
		if (data.userId) {
			response = { userId: apiHelper.decrypt(data.userId) }
		}
		else {
			response = []
		}
	}
	else if (reason == 'updateProfile') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.updateTravelInfo(userId, data);
	}
	else if (reason == 'updateAbout') {
		response = await checkUniqueUser.updateAboutInfo(data);
	}
	else if (reason == 'deleteCover') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		if (!userId) {
			response = {
				response: "error",
				responseCode: 401,
				errorMessage: "Authorization has been denied for this request."
			};
		} else {
			response = await checkUniqueUser.deleteCoverPhoto(userId, data);
		}
	}
	else if (reason == 'follow') {
		let targetUserId = data.userId;
		if (typeof targetUserId === 'string') {
			try {
				const decrypted = apiHelper.decrypt(targetUserId);
				targetUserId = parseInt(decrypted, 10);
			} catch (e) {
				targetUserId = parseInt(targetUserId, 10);
			}
		}
		data.targetUserId = targetUserId;
		response = await checkUniqueUser.followUnfollowUser(data);
	}
	else if (reason == 'editComment') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		const commentTime = data.commentTime || new Date().toISOString().slice(0, 19).replace('T', ' ');
		response = await checkUniqueUser.editComment(userId, data.commentId, data.comment, commentTime, data.taggedUsers);
	}
	else if (reason == 'deleteComment') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.deleteComment(userId, data.commentId);
	}
	else if (reason == 'updateSocialLink') {
		response = await checkUniqueUser.updateSocialLinks(data);
	}
	else if (reason == 'expressInterest') {
		response = await apiHelper.masterApiCall(data, token, 'marketplace/show_listing_interest.php');
	}
	else if (reason == 'replyComment') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.addReply(userId, data);
	}
	else if (reason == 'nearByUsers') {
		//response = await apiHelper.masterApiCall(data, token, '/location/nearby_users.php', 'post');
		response = await apiHelper.masterApiCall(data, token, '/profile/get_users_media_by_location.php', 'post');
	}
	else if (reason == 'isProcessing') {
		response = await apiHelper.masterApiCall(data, token, 'post/get_upload_status.php');
	}
	else if (reason == 'checkRefer') {
		response = await apiHelper.masterApiCall(data, token, 'profile/is_deactivated_user.php');
	}
	else if (reason == 'sendEnquiryDetails') {
		response = await apiHelper.masterApiCall(data, token, 'utils/send_enquiry.php');
	}
	else if (reason == 'openProfileFromChat') {
		response = apiHelper.encrypt(data.userId);
	}
	else if (reason == 'googleAi') {
		return;
		console.log('Google AI Called');
		response = await generateContentWithAI(data);
	}
	else if (reason == 'getPlacePhotos') {
		console.log('Google Maps Photos Called');
		response = await utils.getPlaceId(data);
	}
	else if (reason == 'addUserItinerary') {
		response = await addUserItinerary(data);
	}
	else if (reason == 'addLocationWithImage') {
		response = await addLocationWithImage(data);
	}
	else if (reason == 'searchLocationWithImage') {
		response = await searchLocationWithImage(data);
	}
	else if (reason == 'getUserItineraries') {
		response = await getUserItineraries(data);
	}
	else if (reason == 'getItinerary') {
		response = await getItinerary(data);
	}
	else if (reason == 'buyAiPackage') {
		response = await buyAiPackage(data);
	}
	else if (reason == 'getUsersAiPackage') {
		console.log('Get Users AI Package', data);
		response = await getUsersAiPackage(data);
	}
	else if (reason == 'updateItinerariesLeft') {
		response = await updateItinerariesLeft(data);
	}

	else if (reason == 'blockUserByAdmin') {
		console.log('Block User', data);
		response = await apiHelper.masterApiCall(data, token, 'profile/block_user_by_admin.php');
	}
	else if (reason == 'pinUnpinPost') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		response = await checkUniqueUser.updatePinToTop(userId, data);
	}
	else if (reason == 'makeRemoveInfluencer') {
		console.log('Make Remove INF', data);
		response = await apiHelper.masterApiCall(data, token, 'profile/create_remove_ambassador.php');
	}
	else if (reason == 'givePremiumByAdmin') {
		response = await apiHelper.masterApiCall(data, token, 'verified/allow_user_vt_access.php');
	}
	else if (reason == 'getDeltaDataChats') {
		response = await firebaseChatConnection.checkDeltaDataUserChats(data, token);
	}
	else if (reason == 'validateCoupon') {
		response = await validateCoupon(data);
	}
	else if (reason == 'getAllHostellers') {
		response = await getAllHostellers(data);
	}
	else if (reason == 'getHostellersFromLocation') {
		response = await getHostellersFromLocation(data.locationName);
	}
	else if (reason == 'getNewHostellers') {
		response = await getNewHostellers();
	}
	else if (reason == 'adminGetAllListings') {
		let adminCheck = await utils.isUserAdmin(data.plainUserId);

		console.log('Admin Check', adminCheck);
		response = adminCheck ? await apiHelper.masterApiCall(data, token, 'marketplace/approve_decline_listing.php') : { "responseCode": 400, "errorMessage": "User is not an admin" };
	}
	else if (reason == 'adminUpdateListingStatus') {
		let adminCheck = await utils.isUserAdmin(data.plainUserId);
		response = adminCheck ? await apiHelper.masterApiCall(data, token, 'marketplace/update_listing_status.php') : { "responseCode": 400, "errorMessage": "User is not an admin" };
	}
	else if (reason == 'updateIsRequested') {
		response = await firebaseChatConnection.updateUserStatusFindGroup(data, token);
	}
	// else if (reason == 'sendInvoice') {
	// 	response = await genInvoice('ranjith@beatravelbuddy.com', undefined);
	// }
	else if (reason == 'tboAuth') {
		response = await tboFlights.authenticate();
	}
	else if (reason == 'tboSearchFlights') {
		console.log('Search Flights');
		response = await tboFlights.searchFlights(data);
	}
	else if (reason == 'tboFareRule') {
		response = await tboFlights.fareRule(data);
	}
	else if (reason == 'tboFareQuote') {
		response = await tboFlights.fareQuote(data);
	}
	else if (reason == 'getSSR') {
		response = await tboFlights.getSSR(data);
	}
	else if (reason == 'bookFlight') {
		response = await tboFlights.bookFlight(data);
	}
	else if (reason == 'flightTicketing') {
		response = await tboFlights.flightTicketing(data);
	}
	else if (reason == 'getBookingDetails') {
		response = await tboFlights.getBookingDetails(data);
	}
	else if (reason == 'getPostsByUser') {
		response = await apiHelper.masterApiCall(data, token, 'post/get_posts_by_user.php');
	}
	else if (reason == 'getConvenienceCharges') {
		var convCharges = await tboFlights.getConvenienceCharges(data.totalFare, data.noOfPassengers);
		return { status: "success", "responseCode": 200, convCharges: convCharges }
	}
	else if (reason == 'getSiteMapXMLsForExperiences') {
		response = await getXmlsForSitemap.getXMLsForSitemaps(0);
	}
	else if (reason == 'registerUserByAdmin') {
		response = await registerUserByAdmin(data);
	}
	else if (reason == 'populateAirportInfo') {
		response = await populateAirportInfo(data);
	}
	else if (reason == 'getUsersFlightBookings') {
		response = await getUsersFlightBookings(data);
	}
	else if (reason == 'getAirportInfo') {
		response = await getAirportInfo(data);
	}
	else if (reason == 'getLowestFare') {
		response = await getLowestFare(data);
	}
	else if (reason == 'sendFlightDetails') {
		response = await sendFlightDetails(data);
	}
	else if (reason == 'getUsersPassengerDetails') {
		let passengersInfo = await utils.getUsersPassengerDetails(data);
		response = { responseCode: '200', object: { passengersInfo: passengersInfo } };
	}
	else if (reason == 'getCalendarFares') {
		response = await tboFlights.getCalendarFares(data);
	}
	else if (reason == 'getCancellationCharges') {
		response = await tboFlights.getCancellationCharges(data);
	}
	else if (reason == 'confirmCancellation') {
		response = await confirmCancellation(data);
	}
	else if (reason == 'sendChangeRequest') {
		response = await tboFlights.sendChangeRequest(data);
	}
	else if (reason == 'getAgencyBalance') {
		response = await tboFlights.getAgencyBalance(data);
	}
	else if (reason == 'getCountryCodesForHotels') {
		response = await tboHotels.getCountryCodes();
	}
	else if (reason == 'getCityCodesForHotels') {
		response = await tboHotels.getCityCodes(data);
	}
	else if (reason == 'getHotelCodes') {
		response = await tboHotels.getHotelCodes(data);
	}
	else if (reason == 'getHotelDetails') {
		response = await tboHotels.getHotelDetails(data);
	}
	else if (reason == 'searchHotelAvailability') {
		response = await tboHotels.searchHotelAvailability(data);
	}
	else if (reason == 'preBookHotel') {
		response = await tboHotels.preBook(data);
	}
	else if (reason == 'bookHotel') {
		response = await tboHotels.bookHotel(data);
	}
	else if (reason == 'getHotelBookingDetails') {
		response = await tboHotels.getHotelBookingDetails(data);
	}
	else if (reason == 'getHotelDetails') {
		response = await tboHotels.getHotelDetails(data);
	}
	else if (reason == 'getHotelCodesFromDB') {
		response = await tboHotels.getHotelCodesFromDB(data);
	}
	else if (reason == 'checkUniqueUser') {
		response = await checkUniqueUser.checkUser(data);
	}
	else if (reason == 'checkUserLogin') {
		response = await checkUniqueUser.checkUserLogin(data);
	}
	else if (reason == 'loginWithId') {
		response = await checkUniqueUser.loginWithId(data);
	}
	else if (reason == 'registerUser') {
		response = await checkUniqueUser.registerUser(data);
		if (response.responseCode == 200 && response.object && response.object.token) {
			response.object.token = apiHelper.encrypt(response.object.token);
		}
	}
	else if (reason == 'insertUser') {
		response = await checkUniqueUser.insertUser(data);
	}
	else if (reason == 'flightSearchesForUsers') {
		response = await checkUniqueUser.flightSearchesForUsers(data);
	}
	else if (reason == 'insertSampleUsersProfileData') {
		response = await checkUniqueUser.insertSampleUsersProfileData(data);
	}
	else if (reason == 'emailSend') {
		response = await emailSend.sendEmails(data);
	}
	else if (reason == 'chatAi') {
		//return;
		const verifiedResponse = await getUsersAiPackage({ checkVerified: true });
		console.log('Verified Response', verifiedResponse);
		if (verifiedResponse.status == 'success') {
			response = await utils.startAiChat(data);
		} else {
			response = {
				status: "error",
				responseCode: 400,
				errorMessage: "User is not verified",
			};
		}
	}
	else if (reason == 'whatsAppNew') {
		response = await whatsAppNew.send_document_template(data);
	}
	else if (reason == 'whatsAppNewQuickReplies') {
		console.log('WhatsApp New Quick Replies', data);
		console.log(data.buttonValues);
		response = await whatsAppNew.
			send_template_with_quick_replies(data.phoneNumber, data.dialCode, data.templateName, data.imgUrl, data.userFullName, data.buttonValues ? data.buttonValues : '');
	}
	else if (reason == 'trackTagsInterakt') {
		response = await utils.trackTagsInterakt(data);
	}
	// else if (reason == 'fetchMetaDataUrl') {
	// 	response = await utils.fetchMetaDataUrl(data);
	// }
	else if (reason == 'processSubscriptionExpiry') {
		response = await cronJobPremium.processSubscriptionExpiry(data);
	}
	// Function to update user_travel_budget_type in the users table
	else if (reason == 'updateUserTravelBudgetType') {
		response = await checkUniqueUser.updateUserTravelBudgetType(data);
	}
	else if (reason == 'sendOTPDomestic') {
		response = await sendOTPDomestic.sendOTP(data.phoneNumber);
	}
	else if (reason == 'verifyOTPDomestic') {
		response = await sendOTPDomestic.verifyOTP(data.mobileNumber, data.otpEnteredByUser);
	}
	else if (reason == 'sendOTPWhatsapp') {
		response = await sendOTPWhatsapp.sendOTP(data);
	}
	else if (reason == 'verifyOTPWhatsapp') {
		response = await sendOTPWhatsapp.verifyOTP(data);
	}
	else if (reason == 'hotelVerifyAndLogin') {
		const otpResult = await sendOTPDomestic.verifyOTP(
			data.mobileNumber,
			data.otpEnteredByUser,
		);
		if (otpResult.success) {
			response = await checkUniqueUser.hotelLoginOrRegister(data);
		} else {
			response = {
				responseCode: 400,
				errorMessage: otpResult.error || 'Invalid OTP',
			};
		}
	}
	else if (reason == 'updatePhoneNumberNode') {
		const userId = getUserIdFromToken(token, null, data.plainUserId);
		if (!userId) {
			response = {
				response: "error",
				responseCode: 401,
				errorMessage: "Authorization has been denied for this request."
			};
		} else {
			response = await checkUniqueUser.updatePhoneNumber(userId, data);
		}
	}
	else if (reason == 'getUserIdsByPhoneNumbers') {
		response = await checkUniqueUser.getUserIdsByPhoneNumbers(data);
	}
	// DB Query fo matchmaking phase one
	else if (reason == 'matchmakingPhaseOne') {
		response = await checkUniqueUser.matchmakingPhaseOne(token);
	}
	// DB Updations for Swipe User
	else if (reason == 'swipeUser') {
		response = await checkUniqueUser.swipeUser(data, token);
	}
	// DB Query to get the list of users who liked the current user
	else if (reason == 'getLikedUsers') {
		response = await checkUniqueUser.getLikedUsers(data, token);
	}
	// DB Query to get the list of users of Matched Buddies
	else if (reason == 'getMatchedBuddies') {
		response = await checkUniqueUser.getMatchedBuddies(token);
	}
	// DB Query to decline a like request
	else if (reason == 'declineLikeRequest') {
		response = await checkUniqueUser.declineLikeRequest(data, token);
	}
	// Discover feed posts with cursor-based pagination
	else if (reason == 'getDiscoverPostsPaginated') {
		response = await checkUniqueUser.getDiscoverPostsPaginated(data);
	} else if (reason == 'updateProfileName') {
		response = await checkUniqueUser.updateProfileName(data.plainUserId, data.profileName);
	} else if (reason == 'getVerifiedUsersForTrip') {

	}



	return response;
}


// async function test() {
// 	const response = await getUsersAiPackage({ checkVerified: true });
// 	console.log('Response', response);
// 	//1900186
// }

// test();

