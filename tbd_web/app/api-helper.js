// Description: This file deals with all the API calls with the travel buddy app

//const urlSetting = 'dev';

//Import the axios module
// "use strict";

const axios = require('axios');
const { env } = require("process");
const crypto = require('crypto');
const auth = require("./auth");
const razorPayHelper = require("./razorpay-helper");
const seqConfig = require("./config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("./constants");
const utils = require("./utils");

require('dotenv').config();
let urlSetting = process.env.NODE_ENV;
const secretKey = process.env.SECRET_KEY;
const encryptSecretKey = process.env.ENCRYPTION_SECRET_KEY;



function baseUrl(env) {
	let response;
	if (urlSetting == 'dev') {
		response = 'https://dev.beatravelbuddy.com/v5/';
	}
	else if (urlSetting == 'prod') {
		response = 'http://localhost/v5/';
	}
	return response;
}

//Function to call the make a post API
async function fetchPosts(body, token, decrypted) {
	if (!decrypted) {
		token = decrypt(token);
	}

	let header = fetchHeader(token);
	let url = baseUrl() + 'post/get_all_posts.php';
	body['deviceType'] = 'web';
	let request = bodyData(body);
	let response = {};

	try {
		//Make the API call using axios
		response = await axios.post(url, request, {
			headers: header
		});
	} catch (error) {
		console.log(error);
	}

	if (response.status == 200) {
		response = response.data;
		//Check if the response is empty
		if (body.feedsType !== 'FIND BUDDY VIEW RELATED') {
			if (response.object && response.object.list.length < 2 && body.pageNumber < 10) {
				if (!body.smallData) {
					body.smallData = [];
				};
				if (response.object.list.length > 0) {
					body.smallData = body.smallData.concat(response.object.list);
				}
				body.pageNumber = Number(body.pageNumber) + 1;
				response = await fetchPosts(body, token, true);
			}
			else if (body.smallData && response.object && response.object.list) {
				response.object.list = body.smallData.concat(response.object.list);
				body.smallData = [];
			}
		}
	}

	response['body'] = body;
	return response;

	function bodyData(data) {
		let response;
		if (data.feedsType == 'LOCATION' || data.feedsType == 'HASHTAG') {
			response = {
				"feedsType": 3,
				"locationLat": 28.5764381,
				"locationLng": 77.3814243,
				"pageNumber": data.pageNumber,
				"postId": 0,
				"totalItems": 0,
				"userId": data.userId,
				"location": data.location
			}
		}
		else if (data.feedsType == 'BUCKETLIST') {
			response = {
				feedsType: 5,
				pageNumber: data.pageNumber,
				totalItems: data.totalItems,
				userId: data.userId
			}
		}
		else if (data.feedsType == 'FIND BUDDY VIEW RELATED') {
			response = {
				"feedsType": 6,
				"location": data.location,
				"pageNumber": data.pageNumber,
				"postId": data.postId,
				"locationLat": data.locationLat,
				"locationLng": data.locationLng,
				"totalItems": data.totalItems,
				"userId": data.userId
			}

			//console.log(response);
		}
		else if (data.feedsType == 'SEARCH ASK BUDDY') {
			response = {
				"feedsType": 7,
				"filter": {
					"gender": -1,
					"interests": [],
					"maxAge": 60,
					"minAge": 13,
					"postTypeAsk": true,
					"postTypeLookingForBuddy": false,
					"postTypeStory": false,
					"selectedLocation": {
						"latitude": data.latitude,
						"longitude": data.longitude,
						"name": data.location
					},
					"userType": 0
				},
				"locationLat": data.latitude,
				"locationLng": data.longitude,
				"pageNumber": data.pageNumber,
				"postId": 0,
				"tabModule": "World",
				"totalItems": 0,
				"userId": data.userId
			}
		}
		else if (data.feedsType == 'SEARCH FIND BUDDY') {
			response = {
				"feedsType": 7,
				"filter": {
					"gender": -1,
					"interests": [],
					"maxAge": 60,
					"minAge": 13,
					"postTypeAsk": false,
					"postTypeLookingForBuddy": true,
					"postTypeStory": false,
					"selectedLocation": {
						"latitude": 28.7040592,
						"longitude": 77.1024902,
						"name": data.location
					},
					"userType": 0
				},
				"locationLat": 15.6007997,
				"locationLng": 73.8042478,
				"pageNumber": data.pageNumber,
				"postId": 0,
				"tabModule": "World",
				"totalItems": 0,
				"userId": data.userId
			}
		}
		else if (data.feedsType == 'SHOTS') {
			response = {
				"feedsType": 10,
				"pageNumber": data.pageNumber,
				"postId": 0,
				"totalItems": 0,
			}
		}
		else if (data.feedsType == 'SINGLE SHOT') {
			response = {
				feedsType: 10,
				locationLat: 0,
				locationLng: 0,
				pageNumber: 0,
				postId: data.postId,
				totalItems: 0,
				userId: 0
			}
		}
		else if (data.feedsType == 'TRENDING INTERESTS') {
			response = {
				feedsType: 9,
				interest: data.interest,
				locationLat: data.latitude,
				locationLng: data.longitude,
				pageNumber: 0,
				postId: 0,
				totalItems: 0,
				userId: 0
			}
		}
		else if (data.feedsType == 'USERS WHO TO FOLLOW') {
			response = {
				feedsType: 7,
				isVerified: 1,
				locationLat: data.lat,
				locationLong: data.long,
				feedCardInfo: {
					card_type: "users_you_may_follow",
					card_position: 1
				},
				location: data.stLocation
			}
		}
		else {
			response = {
				feedsType: Number(data.feedsType),
				locationLat: parseFloat(data['locationLat']),
				locationLng: parseFloat(data['locationLong']),
				pageNumber: Number(data.pageNumber),
				postId: 0,
				totalItems: 0
			};

			if (body['filter']) {
				response['filter'] = body['filter'];
			}
		}

		response['deviceType'] = 'web';
		return response;
	}
}

//Function to call the make a post API
async function fetchUIConfig(token) {
	token = decrypt(token);
	let header = fetchHeader(token);
	let url = baseUrl() + 'utils/fetch_ui_config.php';
	let body = {
		"module": ""
	}
	let response = {};
	//Make the API call using axios
	try {
		response = await axios.post(url, body, {
			headers: header
		});
		//Response Body
		response = response.data;
	}
	catch (error) {
		console.log(error);
		data = {
			"responseCode": 401,
			"errorMessage": "There was an error fetching the UI Config. Please try again later."
		};
		response = { "data" : data };
	}
	return response;
}

//Function to call to bookmark a post
async function bookmarkPost(token, data) {
	token = decrypt(token);
	let header = fetchHeader(token);
	let url = baseUrl() + 'post/save_bookmark.php';

	if (data.isBookmarked) {
		data.isBookmarked = 0;
	}
	else {
		data.isBookmarked = 1;
	}

	let body = {
		"postId": data.postId,
		"isBookmarked": Boolean(data.isBookmarked)
	}

	//Make the API call using axios
	let response = await axios.post(url, body, {
		headers: header
	});

	//Response Body
	response = response.data;

	return response;
}


//Function to fetch profile data
async function fetchUserProfile(data, token) {
	token = decrypt(token);
	let header = fetchHeader(token);
	let url = baseUrl() + 'profile/get_user_profile.php';

	//This
	if (data && data.userId !== undefined) {
		url = url + '?userId=' + data.userId;
	}

	//Make the API call using axios
	let response = await axios.post(url, "", {
		headers: header
	});

	//Response Body
	response = response.data;
	// console.log(url);

	return response;
}

//Function to call to bookmark a post
async function masterApiCall(data, token, url_part, method, env) {
	token = decrypt(token);
	let header = fetchHeader(token, url_part);
	let url = baseUrl(env) + url_part;
	// https://dev.beatravelbuddy.com/v5/post/get_all_influencers.php
	data = dataMasterVals(data, url_part);
	let response;

	//Make the API call using axios
	if (method == 'GET') {
		try {
			response = await axios.get(url, {
				headers: header
			});
		}
		catch (error) {
			response = error.response;
		}
	}
	else {
		try {
			response = await axios.post(url, data, {
				headers: header
			});
		}
		catch (error) {
			response = error.response;
		}
	}

	//Check if the token is expired
	if (response.data && response.data.error && response.data.responseCode == 401) {
		//Refresh the token
		let refreshResponse = await refreshAccessToken(token);

		//If the refresh token is successful
		if (refreshResponse && refreshResponse.responseCode == 200) {
			//Call the API again with the new token
			response = await masterApiCall(data, refreshResponse.data.accessToken, url_part);
			response['refresh_token'] = refreshResponse.data.accessToken;
		}
	}
	else {
		//Response Body
		response = response.data;
		response.request = data; //Do not remove this line, this is being used by some APIs to retreive the original request data

		if (method !== 'GET') {
			// console.log(response);
		}
		else {
			// console.log(response)
			// console.log(url)
			// console.log(data);
		}
	}

	return response;

	function dataMasterVals(data, url_part) {
		//Add deviceType: web to the data
		if (data == undefined) {
			if (url_part !== '/dashboard/fetch_dashboard_info.php') {
				data = {
					"deviceType": "web"
				}
			}
		}
		else {
			if (!data['deviceType']) {
				data['deviceType'] = "web";
			}
			else if (data['deviceType'] != 'android' && data['deviceType'] != 'ios') {
				data['deviceType'] = "web";
			}
		}

		return data;
	}
}

async function manageLogin(data) {
	let response = [];

	//Validate the data
	if (data.email == undefined || data.email == "") {
		response = {
			"status": "error",
			"message": "Email is required"
		}
	}
	else if (data.password == undefined || data.password == "") {
		response = {
			"status": "error",
			"message": "Password is required"
		}
	}
	else {
		data = {
			"name": "",
			"email": data.email,
			"password": data.password,
			"deviceId": data.deviceId,
			"deviceType": "web",
			"deviceUniqueId": "asdjhfbassssjdf",
			"imageUrl": "",
			"facebookId": "",
			"isGuestUser": false,
			"facebookToken": "",
			"vendorUUID": data.deviceUniqueId,
			"appVersion": "1.0"
		}

		//Call the API
		response = await masterApiCall(data, '', 'auth/login_with_id.php');

		//Remove the Request key from the response
		delete response.request;

		// //If the responseCode is 200 encrypt the token and send it back
		// if (response.responseCode == 200) {
		//     console.log(response.object.token);
		//     response.object.token = encrypt(response.object.token);
		//     console.log(response.object.token);
		//     //Test the encryption
		//     console.log(decrypt(response.object.token));
		// }
	}

	return response;
}

async function manageSignUp(data) {
	let response = [];

	//Validate the data
	if (data.email == undefined || data.email == "") {
		response = {
			"status": "error",
			"message": "Email is required"
		}
	}
	else if (data.password == undefined || data.password == "") {
		response = {
			"status": "error",
			"message": "Password is required"
		}
	}
	else if (data.name == undefined || data.name == "") {
		response = {
			"status": "error",
			"message": "Name is required"
		}
	}
	else if (data.countryCode == undefined || data.countryCode == "") {
		response = {
			"status": "error",
			"message": "Country Code is required"
		}
	}
	else if (data.phone == undefined || data.phone == "") {
		response = {
			"status": "error",
			"message": "Phone is required"
		}
	}
	else if (data.OTP == undefined || data.OTP == "") {
		response = {
			"status": "error",
			"message": "OTP is required"
		}
	}
	else {
		data = {
			"name": data.name,
			"email": data.email,
			"countryCode": data.countryCode,
			"phone": data.phone,
			"enteredOTP": data.OTP,
			"otpId": data.OTP,
			"password": data.password,
			"gender": "0",
			"referralCode": "",
			"deviceId": "dvEKfJVFU0AqhSIghPmIEZ:APA91bHpLH5n71YX1bfUCFGGfShmHuD562_2CZei-jJi-We-KKT1TPClpfjUjp2WqnWiYNC_TNU51a7408Oo1X5zHBKZm6b_LQaSxx_ItIOn2g4-TidFUD15Or3ufRTJxvsEk-wmDXHz",
			"deviceType": "web",
			"vendorUUID": "5C612F93-DA4C-4602-93EF-0C0E4C44DB32",
			"deviceUniqueId": "ladhaljdhasdss",
			"appVersion": "1.0"
		}

		//Call the API
		response = await masterApiCall(data, '', 'auth/register_user.php', 'POST', 'dev');

		//Remove the Request key from the response
		delete response.request;
	}

	return response;
}

//Initialization vector
const IV_LENGTH = 16;

function encrypt(data) {
	data = data.toString();
	const encryptionKey = crypto.createHash('sha256').update(encryptSecretKey).digest();
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
	let encryptedData = cipher.update(data, 'utf8', 'hex');
	encryptedData += cipher.final('hex');
	return iv.toString('hex') + encryptedData;
}

function decrypt(encryptedData) {
	if (!encryptedData || encryptedData == "") {
		return '';
	}
	if (!encryptSecretKey) {
		return '';
	}

	const encryptionKey = crypto.createHash('sha256').update(encryptSecretKey).digest();
	const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
	// A valid AES-256-CBC payload has a 16-byte IV prepended as 32 hex chars.
	// Plain JWTs (eyJ...) don't decode to 16 hex bytes — return '' so callers
	// can fall back to raw JWT verification instead of throwing.
	if (iv.length !== 16) {
		return '';
	}
	const encryptedText = encryptedData.slice(32);
	const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
	let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
	decryptedData += decipher.final('utf8');
	return decryptedData;
}

/*function encrypt(data) {
	const encryptionKey = crypto.createHash('sha256').update(ENCRYPTION_SECRET_KEY).digest();
	const iv = crypto.randomBy``tes(IV_LENGTH);

	const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
	let encryptedData = cipher.update(data, 'utf8', 'hex');
	encryptedData += cipher.final('hex');

	//console.log(enryptedData);
	return iv.toString('hex') + encryptedData;
}

function decrypt(data) {
	if (data == undefined || data == "") {
		return "";
	}

	const encryptionKey = crypto.createHash('sha256').update(ENCRYPTION_SECRET_KEY).digest();
	const iv = Buffer.from(data.substr(0, IV_LENGTH * 2), 'hex');
	const encryptedData = data.substr(IV_LENGTH * 2);

	const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
	let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
	decryptedData += decipher.final('utf8');

	return decryptedData;
}
*/

//Function to encode & decode the token using OWASP encryption
function tokenMaster(action, token) {

}

//Function to validate the experience booking price
async function priceValidationForExperiences(data) {
	let response = {};

	if (data.userId == '' || data.noOfTickets == '' || data.amount == '' || data.calendarSlotId == '') {
		response['responseCode'] = 621;
		response['errorMessage'] = 'There was an error processing your payment request. Please try again later.';
	}
	else {
		let expPrice;
		try {
			expPrice = await readSeqInstance.query(
				"SELECT pricing FROM experience,experience_calendar_slots WHERE experience.id = experience_calendar_slots.experience_id and experience_calendar_slots.id = $1",
				{ bind: [data.calendarSlotId], type: QueryTypes.SELECT }
			);
			expPrice = expPrice[0].pricing;
		}
		catch (error) {
			response['responseCode'] = 623;
			response['errorMessage'] = 'There was an error with the date you are trying to book. Please try again later.';
		}

		let loggedInUserId = data.plainUserId;

		let discountAmount = 0;
		let totalTicketPrice = Number(expPrice) * Number(data.noOfTickets);

		//VALIDATE COUPON (CHECK IF THE COUPON IS VALID AND THEN IF VALID THEN CHECK IF THE USER IS ALREADY USED)
		//IF EITHER CASE FAILS WE HAVE TO RETURN WITH THE ERROR STATING THAT THE COUPON IS INVALID.
		if (data.couponCode) {
			let couponInfo = await utils.isValidCoupon(data.couponCode,data.noOfTickets,loggedInUserId);
			if (!couponInfo.isValid) {
				return {
					status: "error",
					responseCode: 400,
					errorMessage: "Invalid coupon code"
				};
			}

			discountAmount = await utils.calculateDiscountedAmount(data.couponCode, totalTicketPrice);
		}
		else if (data.premiumDiscount == 'yes') {
			discountAmount = (totalTicketPrice) * 0.1;
			if (discountAmount > 5000) {
				discountAmount = 5000;
			}
		}

		let tax = (totalTicketPrice - discountAmount) * 0.05;
		let finalCalculatedAmount = (totalTicketPrice - discountAmount) + tax;
		
		//expPrice == Number(data.amount)
		if (finalCalculatedAmount == Number(data.finalAmount)) {

			response['responseCode'] = 200;
			response['errorMessage'] = 'Payment request processed successfully';
			data = {
				userId: data.userId,
				calendarSlotId: data.calendarSlotId,
				noOfTickets: data.noOfTickets,
				selPrice: parseInt(((Number(data.amount) * Number(data.noOfTickets)) - discountAmount) * 105),
				// selPrice: 5,
				currency: 'INR',
				source: 'experience',
				paymentFor: 'Become a Premium User'
			};

			try {
				response['data'] = await razorPayHelper.getOrderId(data);
			}
			catch (error) {
				// console.log(error);
				// console.log(data);
				response['responseCode'] = 624;
				response['errorMessage'] = 'There was an error processing your payment request. Please try again later.';
			}
		}
		else {
			response['responseCode'] = 623;
			response['errorMessage'] = 'There was an error processing your payment request. Please try again later.';
		}

	}

	//console.log(response);
	return response;
}

function refreshAccessToken(token) {
	let header = fetchHeader(token);
	let url = baseUrl() + 'auth/refresh_token.php';

	//Make the API call using axios
	let response = axios.get(url, "", {
		headers: header
	});

	return response;
}


//Async log above function
async function logPosts(body, token) {
	let response = await fetchPosts(body, token);
	// console.log(response);
}

//Header Data for the API call with bearer token
function fetchHeader(token, url_part) {
	let header;
	if (url_part == 'auth/login_with_id.php' || url_part == 'auth/forgot_password.php' || url_part == 'auth/match_otp_forgot.php' || url_part == 'auth/unique_check_and_send_otp.php' || url_part == 'auth/register_user.php') {
		header = {
			'Content-Type': 'application/json',
			'x-api-key': 'AIzaSyBtvxcVJN_QospVClIbKHINIyTGySiBcdQ',
		}
	}
	else {
		header = {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + token,
			'x-api-key': 'AIzaSyBtvxcVJN_QospVClIbKHINIyTGySiBcdQ'
		}
	}

	return header;
}

//Function to call to bookmark a post
async function zohoAccessToken(token) {
	let code = process.env.ZOHO_CODE;
	let clientId = process.env.ZOHO_CLIENT_ID;
	let clientSecret = process.env.ZOHO_CLIENT_SECRET;
	let refreshToken = process.env.ZOHO_REFRESH_TOKEN;
	let redirectUri = process.env.ZOHO_REDIRECT_URI;

	let url = "https://accounts.zoho.in/oauth/v2/token?refresh_token=" + refreshToken + "&client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirectUri + "&grant_type=refresh_token";
	let errorOccured = false;
	//Make the API call using axios
	let response = await axios.post(url, "", {
		'Content-Type': 'application/json',
		'x-api-key': 'AIzaSyBtvxcVJN_QospVClIbKHINIyTGySiBcdQ',
	}).catch(function (error) {
		errorOccured = true;
		//console.log(error.toJSON());
	});
	if (errorOccured) {
		return {};
	}
	return response.data;
}

//Export the functions
module.exports = {
	fetchPosts: fetchPosts,
	fetchUIConfig: fetchUIConfig,
	fetchHeader: fetchHeader,
	fetchUserProfile: fetchUserProfile,
	bookmarkPost: bookmarkPost,
	masterApiCall: masterApiCall,
	baseUrl: baseUrl,
	manageLogin: manageLogin,
	encrypt: encrypt,
	decrypt: decrypt,
	priceValidationForExperiences: priceValidationForExperiences,
	zohoAccessToken: zohoAccessToken
}
