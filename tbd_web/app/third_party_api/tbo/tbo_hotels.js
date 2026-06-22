const axios = require('axios');
const appConstants = require("../../constants");
const utils = require("../../utils");
const seqConfig = require("../../config/sequelize_config");
const readSeqInstance = seqConfig.read_sequelize;
const { QueryTypes } = require('sequelize');
const addHotelSearchHistory = require("../commands/add_hotel_search_history");
const updateBookingStage = require("../commands/update_hotel_booking_stage");
const addHotelBookings = require("../commands/add_hotel_bookings");
const cancelFlightBookings = require("../commands/cancel_flight");
require('dotenv').config();
const razorPayHelper = require('../../razorpay-helper');
const mailClass = require("../../send-email");
const { Language, Status } = require('@googlemaps/google-maps-services-js');
const tbo_env = process.env.NODE_ENV == 'dev' ? 'DEV' : 'PROD';
//const tbo_env = 'PROD';
const basicAuthUserName = process.env['TBO_HOTEL_BASIC_AUTH_USER_' + tbo_env];
const basicAuthPwd = process.env['TBO_HOTEL_BASIC_AUTH_PWD_' + tbo_env];
const bookAuthUserName = process.env['TBO_HOTEL_BOOK_AUTH_USER_' + tbo_env];
const bookAuthPwd = process.env['TBO_HOTEL_BOOK_AUTH_PWD_' + tbo_env];

const EndUserIp = process.env[`TBO_TBD_PUBLICID_${tbo_env}`]; // To be added at back-end


// Static Data Functions - Using Database instead of API calls
const getTboCountries = require("../queries/get_tbo_countries");
const getTboCities = require("../queries/get_tbo_cities");
const getTboHotelDetails = require("../queries/get_tbo_hotel_details");
const getTboHotelCodes = require("../queries/get_tbo_hotel_codes");
const addTboCountries = require("../commands/add_tbo_countries");
const addTboCities = require("../commands/add_tbo_cities");
const addTboHotelDetails = require("../commands/add_tbo_hotel_details");
const addTboHotelCodes = require("../commands/add_tbo_hotel_codes");

async function authenticate() {
	try {
        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].AUTH, {
            "ClientId": process.env[`TBO_CLIENT_ID_${tbo_env}`], //"ApiIntegrationNew",
            "UserName": process.env[`TBO_USER_ID_${tbo_env}`], //"Terrains",
            "Password": process.env[`TBO_PASSWORD_${tbo_env}`], //"Terrains@12345",
            "EndUserIp": process.env[`TBO_TBD_PUBLICID_${tbo_env}`] //34.100.208.114
		});
		let authToken = response.data.TokenId;
        //STORE TOKEN IN THE DATABASE 
        await utils.updateThirdPartyToken('tbo-hotels',authToken);
    } catch (error) {
        console.error('Authentication failed:', error);
    }
}

/*Payload CityCode & IsDetailedResponse*/
async function getHotelCodes(payload) {
    try {
        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].HOTELCODES, {CityCode: payload.cityCode, IsDetailedResponse: false}, {auth:{username: basicAuthUserName, password: basicAuthPwd},headers: {'Accept-Encoding': 'gzip, deflate'}});
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

// getHotelCodes({cityCode: '100765'}).then(response => {
// 	// console.log('Response:', response);
// });

/*Payload CityCode & IsDetailedResponse*/
async function getCountryCodes() {
    try {
        const response = await axios.get(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].COUNTRY_CODES,  {auth:{username: basicAuthUserName, password: basicAuthPwd}, headers: {'Accept-Encoding': 'gzip, deflate'}});
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

/*Payload CityCode & IsDetailedResponse*/
async function getCityCodes(payload) {
	try {
		
		/*const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].CITY_CODES, { CountryCode: payload.countryCode }, { auth: { username: basicAuthUserName, password: basicAuthPwd }, headers: { 'Accept-Encoding': 'gzip, deflate' } });
		
		const responseUAE = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].CITY_CODES, { CountryCode: 'AE' }, { auth: { username: basicAuthUserName, password: basicAuthPwd }, headers: { 'Accept-Encoding': 'gzip, deflate' } });
		
		// Merge both responses
		const mergedResponse = [...response.data.CityList, ...responseUAE.data.CityList];
		
		// wrap in CityList object
		const finalResponse = {
			CityList: mergedResponse
		}
		
        return { status: "success", "responseCode": 200, object: finalResponse};*/
		const response = await getTboCities(payload);
		// Map the response to the format expected by the frontend
		const mappedCities = response.object.cities.map(city => ({
			Code: city.city_code,
			Name: city.city_name
		}));
		//// console.log('Cities Response:', mappedCities);
		return { status: "success", "responseCode": 200, object: mappedCities};
		
		
		
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}


/*Payload CheckIn, CheckOut, HotelCodes, GuestNationality, PaxRooms array of objects as {Adults:2, Children:1, ChildrenAges:{}}, ResponseTime, IsDetailedResponse, Filters an object with {Refundable, NoOfRooms, MealType, OrderBy, StarRating, HotelName}*/
async function searchHotelAvailability(payload) {
    try {
        var plainUserId = payload.plainUserId; 
        delete payload.plainUserId;
        var city = payload.city;
        var country = payload.country;
		var isInternational = payload.isInternational;
		
		if (isInternational == 'true') {
			isInternational = 1;
		}
		else if (isInternational == 'false') {
			isInternational = 0;
		}
		
        var noOfDays = payload.noOfDays;
        var saveHistory = payload.saveHistory;
        delete payload.noOfDays;
        delete payload.city;
        delete payload.country;
        delete payload.isInternational;
        delete payload.saveHistory;

        //// console.log('Search URL:', appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].SEARCH);
		// Convert PaxRooms counts to integers
		//// console.log(payload.payloadObj.PaxRooms);
        payload.payloadObj.PaxRooms = payload.payloadObj.PaxRooms.map(room => ({
            Adults: parseInt(room.Adults, 10),
            Children: parseInt(room.Children, 10),
            ChildrenAges: room.ChildrenAges ? room.ChildrenAges : []
        }));
        
        //// console.log('payloadObj:', payload.payloadObj);
        /*payload.payloadObj = {
            "CheckIn": "2024-12-20",
            "CheckOut": "2024-12-22",
            "HotelCodes": "1279415",
            "GuestNationality": "IN",
            "PaxRooms": [
                {
                    "Adults": 1,
                    "Children": 0,
                    "ChildrenAges": null
                }
         
            ],
            "ResponseTime": 23.0,
            "IsDetailedResponse": true,
            "Filters": {
                "Refundable": false,
                "NoOfRooms": 1,
                "MealType": 0,
                "OrderBy": 0,
                "StarRating": 0,
                "HotelName": null
            }
        };*/

        var checkInDate = payload.payloadObj.CheckIn;
        var noOfRooms = payload.payloadObj.Filters.NoOfRooms;
        var noOfPax = payload.payloadObj.PaxRooms[0].Adults + payload.payloadObj.PaxRooms[0].Children;
        var hotelCategory = payload.payloadObj.Filters.StarRating;
        
		const options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(bookAuthUserName + ':' + bookAuthPwd)
            }
		};	
		
		const hotelCodes = payload.payloadObj.HotelCodes.join(',');
		// Check the length of the hotel codes and make sure that we call the API with 100 hotel codes at a time and once response is received, we call the API again with the remaining hotel codes
		const hotelCodesArray = hotelCodes.split(',');
		const batchSize = 100;
		const totalBatches = Math.ceil(hotelCodesArray.length / batchSize);
		
		//// console.log(`Total hotel codes: ${hotelCodesArray.length}, Total batches: ${totalBatches}`);
		
		let allHotelResults = [];
		let allHotelDetails = [];
		
		// Process hotel codes in batches in parallel
		const batchPromises = [];
		
		for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
			const startIndex = batchIndex * batchSize;
			const endIndex = Math.min(startIndex + batchSize, hotelCodesArray.length);
			const batchHotelCodes = hotelCodesArray.slice(startIndex, endIndex).join(',');
			
			// // console.log(`Preparing batch ${batchIndex + 1}/${totalBatches} with ${batchHotelCodes.split(',').length} hotel codes`);
			
			// Create payload for this batch
			const batchPayload = {
				...payload.payloadObj,
				HotelCodes: batchHotelCodes
			};
			
			// Create promise for this batch
			const batchPromise = axios.post(
				appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].SEARCH, 
				batchPayload, 
				options
			).then(batchResponse => {
				// console.log(`Batch ${batchIndex + 1} completed with ${batchResponse.data?.HotelResult?.length || 0} results`);
				return {
					batchIndex: batchIndex + 1,
					success: true,
					data: batchResponse.data
				};
			}).catch(error => {
				console.error(`Error in batch ${batchIndex + 1}:`, error.message);
				console.error(`Batch payload:`, batchPayload);
				return {
					batchIndex: batchIndex + 1,
					success: false,
					error: error.message
				};
			});
			
			batchPromises.push(batchPromise);
		}
		
		// Execute all batches in parallel
		//// console.log(`Executing ${batchPromises.length} batches in parallel...`);
		const batchResults = await Promise.all(batchPromises);
		
		// Collect results from all successful batches
		batchResults.forEach(result => {
			if (result.success && result.data && result.data.HotelResult) {
				allHotelResults = allHotelResults.concat(result.data.HotelResult);
			}
		});
		
		// Combine all results
		const combinedResponse = {
			HotelResult: allHotelResults,
			// Add other response properties if they exist
			...allHotelResults.length > 0 ? { 
				Error: { ErrorCode: 0, ErrorMessage: "Success" }
			} : {
				Error: { ErrorCode: 1, ErrorMessage: "No hotels found" }
			}
		};
		
		// // console.log(`Batching complete. Total results: ${allHotelResults.length} hotels from ${totalBatches} batches`);

        if (saveHistory){
            try {
                /*Save searching information*/
                //Saving history
                const payloadForAddingSearchHistory = {
                    plainUserId: plainUserId,
                    city:city,
                    country:country,
                    isInternational:isInternational,
                    checkInDate:checkInDate,
                    noOfRooms: noOfRooms,
                    noOfPax: noOfPax,
                    noOfDays: noOfDays,
                    payloadObject : {
                        "SearchPayload": payload
                    },
                    hotelCategory: hotelCategory,
                    bookingStage: 'search'
                } 
                await addHotelSearchHistory(payloadForAddingSearchHistory);
            } catch (error) {
                
            }
        }
        
        //// console.log('Combined Response:', combinedResponse);
        
        // Get hotel details from DB for all available hotel codes
        if (allHotelResults.length > 0) {
            let availHotelCodes = allHotelResults.map(hotel => hotel.HotelCode).join(',');
            let getHotelFromDb = await getHotelDetailsFromDB({ hotelCodes: availHotelCodes });
           // // console.log('Get Hotel From DB:', getHotelFromDb.object.hotels);
            combinedResponse.HotelDetails = getHotelFromDb.object.hotels;
        }

        return { status: "success", "responseCode": 200, object: combinedResponse};
    } catch (error) {
        // console.log(error);
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

/*Payload BookingCode*/
async function preBook(payload) {
    try {
        var plainUserId = payload.plainUserId;
		delete payload.plainUserId;

		var isForBooking = payload.isForBooking;
		delete payload.isForBooking;
		
		var finalPayload = {};
		
        //read the token from db and set to tokenId variable
		// Axios first parameter is the URL and second parameter is the payload, third parameter is the auth object or headers object or both.
		
		const options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(bookAuthUserName + ':' + bookAuthPwd)
            }
		};
		
		
		if (isForBooking) {
			finalPayload = {
				BookingCode: payload.BookingCode,
				"PaymentMode": "Limit",
			};
		}
		else {
			finalPayload = {
				BookingCode: payload.bookingCode,
				"PaymentMode": "Limit",
			};
		}
		
		// Add TDS information if available in the payload
		if (payload.TDSInfo) {
			finalPayload.TDSInfo = payload.TDSInfo;
		}
		
        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].PREBOOK, finalPayload, { auth: { username: bookAuthUserName, password: bookAuthPwd } });

        try {
			/*Updating the stage*/
			if (isForBooking) {
				const payloadForUpdatingSearchHistory = {
					plainUserId: plainUserId,
					payload: {
						"Payload": payload,
						"Response": response.data
					},
					bookingStage: 'pre_book_booking'
				}
				await updateBookingStage(payloadForUpdatingSearchHistory);
			}
			else {
				const payloadForUpdatingSearchHistory = {
					plainUserId: plainUserId,
					payload: {
						"Payload": payload,
						"Response": response.data
					},
					bookingStage: 'pre_book'
				}
				await updateBookingStage(payloadForUpdatingSearchHistory);
			}
        } catch (error) {
            
		}
		
		if (isForBooking) {
			// Call the getOrderId API to get the OrderId as per the correct price
			var netAmount = response.data.HotelResult[0].Rooms[0].NetAmount;
			
			var taxValue = response.data.HotelResult[0].Rooms[0].NetTax;
			
			var convenienceCharges = calculateConvenienceCharges(response.data.HotelResult[0].Rooms[0]);
			
			// console.log('Convenience Charges:', convenienceCharges);
			
			netAmount = netAmount + convenienceCharges;
			
			var couponCode = payload.couponCode;
			delete payload.couponCode;
			var discountAmount = 0;
			
			if (couponCode) {
                let couponInfo = await utils.isValidCoupon(couponCode,1,plainUserId, 'hotel');
                if (!couponInfo.isValid) {
                    return {
                        status: "error",
                        responseCode: 400,
                        errorMessage: "Invalid coupon code"
                    };
                }
    
                discountAmount = await utils.calculateDiscountedAmount(couponCode, convenienceCharges); //coupon value should be applied only on convenienceCharges
                netAmount = netAmount - discountAmount;
			}
			
			
			var hotelPaymentPayload = {
                userId: "0f4fe921ae152b39c71f7bb8fa1bc710459b849d9802f9761812d51ed5958a83",
				selPrice: parseFloat(Math.ceil(netAmount).toFixed(2) * 100),
				//selPrice: 1 * 100,
                packageId: "tbo_hotels",
                currencyCode: "INR",
                couponApplied: "",
                source: 'tboHotels',
                paymentFor: 'Hotels Booking',
                extraInfo: {
                    totalFare: netAmount,
                    //basePrice: baseFare,    //publishedFare - convenienceCharges + discountAmount, //
                    tax: Math.ceil(taxValue),//Correct incase if we are using this field to show some place
                    // convenienceCharges: convenienceCharges,//Correct incase if we are using this field to show some place
                    // couponDiscount: discountAmount,
                    // couponCode: couponCode,       
                }
            };
            
			const hotelPaymentResponse = await razorPayHelper.getOrderId(hotelPaymentPayload);
			
			return { status: "success", "responseCode": 200, object: { hotelPaymentResponse: hotelPaymentResponse, Status: { Code: 200, Message: "Success" } }, response: 'getOrderId'};
		}
		else {
			return { status: "success", "responseCode": 200, object: response.data};
		}
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

async function bookHotel(payload){
	try {
		var token = (await utils.getThirdPartyInfo('tbo-hotels'))[0].token;
        /*let payload = {
            "BookingCode": "1279415!TB!1!TB!1abc8dfd-b2d0-11ef-b17d-cab7ee0b0e57!TB!AFF!",
            "IsVoucherBooking": true,
            "GuestNationality": "IN",
            "TokenId": "d9150818-aa48-4c87-89cd-a1b7b31c2f84",
            "EndUserIp": "192.168.9.119",
            "RequestedBookingMode": 1,
            "NetAmount": 100381.942790494,
                                                                                                                  
            "HotelRoomsDetails": [
                {
                    "HotelPassenger": [
                        {
                            "Title": "Mr.",
                            "FirstName": "Ranjith",
                            "MiddleName": "",
                            "LastName": "Gadam",
                            "Email": null,
                            "PaxType": 1,
                            "LeadPassenger": true,
                            "Age": 0,
                            "PassportNo": null,
                            "PassportIssueDate": null,
                            "PassportExpDate": null,
                            "Phoneno": null,
                            "PaxId": 0,
                            "GSTCompanyAddress": null,
                            "GSTCompanyContactNumber": null,
                            "GSTCompanyName": null,
                            "GSTNumber": null,
                            "GSTCompanyEmail": null,
                            "PAN": "AGGPR0851G"
                        }
                    ]
                }
            ]
        };*/
		payload.TokenId = token;
		payload.EndUserIp = EndUserIp;
        //payload.TokenId = (await utils.getThirdPartyInfo('tbo-hotels'))[0].token;
        //// console.log('Payload:', payload);
        //// console.log('Payload Length:', JSON.stringify(payload).length);
        var retryCount = payload.retryCount ? payload.retryCount: 0;
		delete payload.retryCount;
		
		
		var dialCode = payload.DialCode;
		delete payload.DialCode;

        var plainUserId = payload.plainUserId;
		delete payload.plainUserId;
		
		payload.IsVoucherBooking = true;
		payload.RequestedBookingMode = 1;
        
		// Convert NetAmount to double
		payload.NetAmount = parseFloat(payload.NetAmount);
		
		// Handle TDS information for booking
		if (payload.TDSInfo) {
			// Ensure TDS information is properly formatted for booking
			payload.TDSBreakdown = {
				"TotalFare": payload.TotalFare,
				"NetAmount": payload.NetAmount,
				"AgentCommission": payload.TDSInfo.AgentCommission,
				"TDS": payload.TDSInfo.TDS,
				"TDSAmount": payload.TDSInfo.TDSAmount
			};
		}
        const options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(bookAuthUserName + ':' + bookAuthPwd)
            }
		};
		// console.log('Book Hotel Payload:', payload);
		
		// Fix data types for all passengers
		if (payload.HotelRoomsDetails && payload.HotelRoomsDetails.length > 0) {
			payload.HotelRoomsDetails.forEach(room => {
				if (room.HotelPassenger && room.HotelPassenger.length > 0) {
					room.HotelPassenger = room.HotelPassenger.map(passenger => ({
						"Title": passenger.Title || "",
						"FirstName": passenger.FirstName || "",
						"MiddleName": passenger.MiddleName || "",
						"LastName": passenger.LastName || "",
						"Email": passenger.Email || null,
						"PaxType": parseInt(passenger.PaxType) || 1, // Convert to number
						"LeadPassenger": passenger.LeadPassenger === true || passenger.LeadPassenger === "true", // Convert to boolean
						"Age": parseInt(passenger.Age) || 0, // Convert to number
						"PassportNo": passenger.PassportNo || null,
						"PassportIssueDate": passenger.PassportIssueDate || null,
						"PassportExpDate": passenger.PassportExpDate || null,
						"Phoneno": passenger.Phoneno || null,
						"PaxId": parseInt(passenger.PaxId) || 0, // Convert to number
						"GSTCompanyAddress": passenger.GSTCompanyAddress || null,
						"GSTCompanyContactNumber": passenger.GSTCompanyContactNumber || null,
						"GSTCompanyName": passenger.GSTCompanyName || null,
						"GSTNumber": passenger.GSTNumber || null,
						"GSTCompanyEmail": passenger.GSTCompanyEmail || null,
						"PAN": passenger.PAN || null,
						"CorporatePAN": passenger.CorporatePAN || null
					}));
				}
			});
		}
		
		// console.log('Book Hotel Payload:', payload.HotelRoomsDetails[0].HotelPassenger[0]);
		
        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].BOOK, payload, options);
        if (response.data.BookResult.Error.ErrorCode == 6){
            // console.log('Error', response.data.BookResult.Error.ErrorMessage); 
            // console.log('Invalid credentials');
            retryCount++;
            await authenticate();
            //retry twice for the api.
            if (retryCount <= 2){
                payload.retryCount = retryCount;
                return await bookHotel(payload);
            }
            else {
                return { status: "warning", "responseCode": 400, message: 'Token got expired, please retry. RETRY COUNT-> ' + retryCount};
            }
        }
        // console.log(' Book Hotel Response:', response);

        try {
            /*Updating the stage*/
            const payloadForUpdatingSearchHistory = {
                plainUserId: plainUserId,
                payload: {
                    "Payload": payload,
                    "Response": response.data
                },
                bookingStage: 'book'
            }
            await updateBookingStage(payloadForUpdatingSearchHistory);
        } catch (error) {
            
		}
		
		// Call the GetBookingDetails API
		const getBookingDetailsPayload = {
			EndUserIp: EndUserIp,
			TokenId: token,
			TraceId: response.data.BookResult.TraceId
		}
		const getBookingDetailsResponse = await getHotelBookingDetails(getBookingDetailsPayload);
		//// console.log('Get Booking Details Response:', getBookingDetailsResponse);
		
		// console.log('Get Booking Details Response:', getBookingDetailsResponse.object.data);
		
		//Add the booking details to the database
		const addBookingDetailsPayload = {
			plainUserId: plainUserId,
			bookingInfo: getBookingDetailsResponse.object.data
		}
		
		// console.log('Add Booking Details Payload:', addBookingDetailsPayload);
		
		const addBookingDetailsResponse = await addHotelBookings(addBookingDetailsPayload);
		// console.log('Add Booking Details Response:', addBookingDetailsResponse);
		
		return { status: "success", "responseCode": 200, object: getBookingDetailsResponse.object.data };


        //return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

/*Payload RequestType, Remarks, BookingId*/
async function cancelBookings(payload) {
    try {
        var plainUserId = payload.plainUserId;
        delete payload.plainUserId;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-hotels'))[0].token;
        const options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(bookAuthUserName + ':' + bookAuthPwd)
            }
        };
        var response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].SEND_CHANGE_REQUEST, payload, options);
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }

}

/*Payload EndUserIp, TokenId, TraceId*/
async function getHotelBookingDetails(payload) {
    try {
        //read the token from db and set to tokenId variable
        //const tokenId = ;
        var plainUserId = payload.plainUserId;
        delete payload.plainUserId;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-hotels'))[0].token;
		var response;
		// console.log('Get Booking Details Payload:', payload);
		response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].BOOKING_DETAILS, payload);
		// console.log('Get Booking Details Response From Function:', response);
        return { status: "success", "responseCode": 200, object: response};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }

}

async function getHotelDetails(payload) {
    //// console.log('Payload:', payload);
    delete payload.plainUserId;
    try {
		const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].HOTEL_DETAILS, { Hotelcodes: payload.hotelCodes, Language: payload.language, IsRoomDetailRequired: "true" }, { auth: { username: basicAuthUserName, password: basicAuthPwd }, headers: { 'Accept-Encoding': 'gzip, deflate' } });
		//// console.log('Hotel Details Response:', response.data);
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}



// Get countries from static database
async function getCountriesFromDB(payload) {
    try {
        return await getTboCountries(payload);
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}



// Get cities from static database
async function getCitiesFromDB(payload) {
    try {
        const response = await getTboCities(payload);
		// console.log('Cities Response:', response.object.cities);
		// // console.log('Type of Cities Response:', typeof response.object.cities);
		//
		return { status: "success", "responseCode": 200, object: response.object.cities};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

// getCitiesFromDB({ countryCode: 'IN' }).then(response => {
// 	// console.log('Response:', response);
// });

// Get hotel details from static database
async function getHotelDetailsFromDB(payload) {
    try {
        const response = await getTboHotelDetails(payload);
		// console.log('Hotel Details Response:', response.object.hotels);
		
        return response;
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}


// Example usage:
// getHotelDetailsFromDB({ cityCode: '130443' });
//getHotelDetailsFromDB({ hotelCodes: '1033473,1267547' });
// getHotelDetailsFromDB({ hotelCodes: ['1033473', '1267547'] });

// Get hotel codes from static database
async function getHotelCodesFromDB(payload) {
    try {
        const response = await getTboHotelDetails(payload);
		// console.log('Hotel Details Response:', response.object.hotels);
		
		// Extract hotel codes from the response
		const hotelCodes = response.object.hotels.map(hotel => hotel.hotel_code);
		// console.log('Hotel Codes:', hotelCodes);
		
        return { status: "success", "responseCode": 200, object: hotelCodes};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}
// getHotelCodesFromDB({ city_id: '110640' });




// Populate countries from TBO API to database
async function populateCountriesToDB() {
    try {
		const apiResponse = await getCountryCodes();
		// console.log('Response Country', apiResponse);
		//return;
        if (apiResponse.status === "success") {
            const payload = {
                countries: apiResponse.object.CountryList
            };
            return await addTboCountries(payload);
        } else {
            return apiResponse;
        }
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

// populateCountriesToDB().then(response => {
// 	// console.log('Response:', response);
// });


// Populate cities from TBO API to database
async function populateCitiesToDB(countryCode) {
    try {
		//const apiResponse = await getCityCodes({ countryCode: countryCode });
		const apiResponse = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].CITY_CODES, { CountryCode: countryCode }, { auth: { username: basicAuthUserName, password: basicAuthPwd }, headers: { 'Accept-Encoding': 'gzip, deflate' } });
		// console.log('API Response:', apiResponse.data);
		//return;
        if (apiResponse.data.Status.Code == 200) {
            const payload = {
                cities: apiResponse.data.CityList,
                countryCode: countryCode
			};
			// console.log('Add Payload', payload);
			//return;
			const addTboCitiesResponse = await addTboCities(payload);
			// console.log('Add TBO Cities Response:', addTboCitiesResponse);
			//return addTboCitiesResponse;
        } else {
            return apiResponse;
        }
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

// populateCitiesToDB('IN').then(response => {
// 	// console.log('Response:', response);
// });

// const countryCodes = [
// 	"AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ",
// 	"BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV",
// 	"BR","IO","VG","BN","BG","BF","BI","KH","CM","CA","CB","CV","KY","CF","TD",
// 	"CL","CN","CX","CC","CO","KM","CG","CD","CK","CR","HR","CW","CY","CZ","DK",
// 	"DJ","DO","DM","TP","EC","EG","SV","GQ","ER","EE","ET","EU","FK","FO","FJ",
// 	"FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP",
// 	"GU","GT","GN","GW","GY","HT","HM","HN","HK","HU","IS","IN","ID","IQ","IE",
// 	"IL","IT","CI","JM","JP","JO","KZ","KE","KI","XK","KW","KG","LA","LV","LB",
// 	"LS","LR","LY","LI","LT","QL","LU","MO","MK","MG","MW","MY","MV","ML","MT",
// 	"MH","MQ","MR","MU","YT","MX","MB","FM","MD","MC","MN","ME","MS","MA","MZ",
// 	"MM","NA","ZZ","NR","NP","NL","AN","NC","NZ","NI","NE","NG","NU","NF","MP",
// 	"NO","OT","OM","PK","PW","PS","PA","PG","PY","PE","PH","PL","PT","PR","QA",
// 	"RE","RO","RU","RW","LC","MF","WS","SM","ST","SA","SN","RS","SC","SL","SG",
// 	"SX","SK","SI","SB","SO"
// ];

// TH, VN, IN, "TR", "AE" done
const countryCodes = [ "IN" 
	/*"UZ", "VU"
	"HT", "HK", "ID", "KE", "JP", "JM", "KW", "KG", 
	"LB", "LT", "MO", "MG", "MY", "MV", "MU", "MM", "NA", "ZZ",
	"NP", "NZ", "OM", "PK", "PH", "QA", "SA", "SC", "SG", "ZA", 
	"KR", "ES", "LK", "SE", "CH", "TW",*/
];

// First Run: Populate all countries and cities then run the second function to populate all hotel details	
async function populateAllCities() {
	for (const code of countryCodes) {
		try {
			// console.log(`🌍 Populating cities for ${code}`);
			await populateCitiesToDB(code);

			// throttle: 1.5 sec between countries
			await new Promise(r => setTimeout(r, 1500));

		} catch (err) {
			console.error(`❌ Failed for ${code}`, err.message);
		}
	}
	
	// console.log("✅ All countries processed");
}


// populateAllCities().then(response => {
// 	// console.log('Response:', response);
// });
//populateCitiesToDB('IN');


// Populate hotel codes from TBO API to database
async function populateHotelCodesToDB(cityCode, countryCode) {
    try {
        const hotelCodesResponse = await getHotelCodes({ cityCode: cityCode });
        if (hotelCodesResponse.status === "success" && hotelCodesResponse.object.HotelCodes) {
            const hotelCodes = hotelCodesResponse.object.HotelCodes.split(',');
            const hotelCodesToAdd = hotelCodes.map(code => ({
                HotelCode: code.trim()
            }));
            
            const payload = {
                hotelCodes: hotelCodesToAdd,
                cityCode: cityCode,
                countryCode: countryCode
            };
            return await addTboHotelCodes(payload);
        } else {
            return { status: "error", "responseCode": 400, message: "No hotel codes found for the city"};
        }
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

// Populate hotel details from TBO API to database
async function populateHotelDetailsToDB(payload) {
	try {
		// Track global totals
		let globalTotalProcessed = 0;
		let globalSuccessCount = 0;
		let globalFailureCount = 0;
		// Get all the cityCode first
		const citiesResponse = await getCitiesFromDB(payload);
		// console.log('Cities Response:', citiesResponse.object);
		//return;
		
		// Iterate over the cities and process hotel details sequentially
		for (const city of citiesResponse.object) {
			// // console.log('City Code:', city.city_code);
			// // console.log('City Name:', city.city_name);
			var cityCode = city.city_code;
			// console.log('City Code:', cityCode);
			//return;
			
			//Call the getHotelCodes API with some delay
			await new Promise(resolve => setTimeout(resolve, 0));
			const hotelCodesResponse = await getHotelCodes({ cityCode: cityCode });
			// console.log('Hotel Codes Response:', hotelCodesResponse);
			//return;
			
			if (hotelCodesResponse.status === "success" && hotelCodesResponse.object.Hotels) {
				const hotelCodes = hotelCodesResponse.object.Hotels;
				const CHUNK_SIZE = 100; // Process 100 hotel codes at a time
				let successCount = 0;
				let failureCount = 0;
				let totalProcessed = 0;
				
				// console.log(`🏨 Processing ${hotelCodes.length} hotels in chunks of ${CHUNK_SIZE}`);
				
				// Process hotel codes in chunks
				for (let i = 0; i < hotelCodes.length; i += CHUNK_SIZE) {
					const chunk = hotelCodes.slice(i, i + CHUNK_SIZE);
					const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;
					const totalChunks = Math.ceil(hotelCodes.length / CHUNK_SIZE);
					
					// console.log(`\n📦 Processing chunk ${chunkNumber}/${totalChunks} (${chunk.length} hotels)`);
					
					try {
						// Extract hotel codes from the chunk
						const hotelCodesString = chunk.map(hotel => hotel.HotelCode.trim()).join(',');
						// console.log(`🔍 Fetching details for ${chunk.length} hotels: ${hotelCodesString.substring(0, 100)}...`);
						
						// console.log('Hotel Codes String:', hotelCodesString);
						//return;
						
						//Call the getHotelDetails API with some delay
						await new Promise(resolve => setTimeout(resolve, 0));
						const hotelDetailsResponse = await getHotelDetails({ 
							hotelCodes: hotelCodesString, 
							language: 'EN' 
						});
						// console.log('Hotel Details Response:', hotelDetailsResponse);
						//return;
						
						if (hotelDetailsResponse.status === "success" && hotelDetailsResponse.object.HotelDetails) {
							// console.log(`✅ Received details for ${hotelDetailsResponse.object.HotelDetails.length} hotels in chunk ${chunkNumber}`);
							
							// Process each hotel detail individually
							let chunkSuccessCount = 0;
							let chunkFailureCount = 0;
							
							for (const hotelDetail of hotelDetailsResponse.object.HotelDetails) {
								try {
									// console.log(`🏨 Processing hotel: ${hotelDetail.HotelName} (${hotelDetail.HotelCode})`);
									
									const payload = {
										hotelDetails: [hotelDetail], // Send single hotel detail
										cityCode: cityCode
									};
									
									// Add individual hotel detail to database with some delay 
									await new Promise(resolve => setTimeout(resolve, 0));
									const addResponse = await addTboHotelDetails(payload);
									
									
									//
									
									if (addResponse.status === "success") {
										chunkSuccessCount++;
										// console.log(`✅ Successfully added hotel: ${hotelDetail.HotelName}`);
									} else {
										chunkFailureCount++;
										// console.log(`❌ Failed to add hotel ${hotelDetail.HotelName}: ${addResponse.message}`);
									}
								} catch (error) {
									chunkFailureCount++;
									// console.log(`❌ Error processing hotel ${hotelDetail.HotelName}: ${error.message}`);
									// Continue with next hotel
									continue;
								}
							}
							
							successCount += chunkSuccessCount;
							failureCount += chunkFailureCount;
							
							// console.log(`📊 Chunk ${chunkNumber} Summary: ${chunkSuccessCount} successful, ${chunkFailureCount} failed`);
							
						} else {
							failureCount += chunk.length;
							// console.log(`❌ No hotel details found for chunk ${chunkNumber}`);
						}
						
						totalProcessed += chunk.length;
						
						// Add a small delay between chunks to avoid overwhelming the API
						if (i + CHUNK_SIZE < hotelCodes.length) {
							// console.log(`⏳ Waiting 1 second before next chunk...`);
							await new Promise(resolve => setTimeout(resolve, 0));
						}
						
					} catch (error) {
						failureCount += chunk.length;
						// console.log(`❌ Error processing chunk ${chunkNumber}: ${error.message}`);
						// Continue with next chunk
						continue;
					}
				}
				
				// console.log(`\n📊 Hotel Details Population Summary for city ${cityCode}:`);
				// console.log(`Total processed: ${totalProcessed}`);
				// console.log(`Successful: ${successCount}`);
				// console.log(`Failed: ${failureCount}`);
				// console.log(`Chunks processed: ${Math.ceil(hotelCodes.length / CHUNK_SIZE)}`);
				globalTotalProcessed += totalProcessed;
				globalSuccessCount += successCount;
				globalFailureCount += failureCount;
			} else {
				// console.log(`⚠️ No hotel codes found for city ${cityCode}, skipping...`);
			}
		}
		// Final summary after all cities
		// console.log(`\n🌍 Final Hotel Details Population Summary for country ${payload.countryCode}:`);
		// console.log(`Total processed: ${globalTotalProcessed}`);
		// console.log(`Successful: ${globalSuccessCount}`);
		// console.log(`Failed: ${globalFailureCount}`);
		return {
			status: "success",
			responseCode: 200,
			object: {
				message: `Processed ${globalTotalProcessed} hotels for country ${payload.countryCode}`,
				totalProcessed: globalTotalProcessed,
				successCount: globalSuccessCount,
				failureCount: globalFailureCount
			}
		};
    } catch (error) {
        // console.log(`❌ Error in populateHotelDetailsToDB for city ${typeof cityCode !== 'undefined' ? cityCode : 'unknown'}: ${error.message}`);
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

// Process all countries sequentially to populate hotel details
async function populateAllHotelDetails() {
	try {
		for (const countryCode of countryCodes) {
			try {
				// console.log(`🌍 Starting hotel details population for country: ${countryCode}`);
				
				await populateHotelDetailsToDB({ countryCode });

				// Throttle between countries to avoid DB/API overload
				// console.log(`⏳ Waiting 3 seconds before next country...`);
				await new Promise(resolve => setTimeout(resolve, 0));

			} catch (countryError) {
				console.error(`❌ Failed for country ${countryCode}:`, countryError.message);
				continue; // continue with next country
			}
		}

		// console.log("✅ All countries hotel details population completed.");
	} catch (error) {
		console.error("❌ Error in populateAllHotelDetails:", error.message);
	}
}


async function getAgencyBalance() {
	try {
		let payload = {};
		payload.EndUserIp = '192.168.11.120';
		payload.TokenId = '4c605cde-6224-4955-ae93-e1b542146883';
		// console.log('TokenId', payload.TokenId);
		payload.ClientId = 'ApiIntegrationNew';
		payload.TokenMemberId = '57858';
		payload.TokenAgencyId = '57696';
		// console.log('Payload', payload);
        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env + '_' + 'HOTELS'].GET_AGENCY_BALANCE, payload);
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

// getAgencyBalance().then(response => {
// 	// console.log('Response:', response);
// });

//populateHotelDetailsToDB({countryCode: 'IN'});
// getHotelCodes({ cityCode: '100765' }).then(response => {
// 	// console.log('Response:', response);
// });

// Convenience Charges
function calculateConvenienceCharges(room) {
	let roomTotalFare = Math.ceil(room.TotalFare);
	let convenienceCharges = roomTotalFare * 0.02;
	let gstOnConvenienceCharges = convenienceCharges * 0.18;
	let totalConvenienceCharges = convenienceCharges + gstOnConvenienceCharges;
	return totalConvenienceCharges;
	
}





//populateAllHotelDetails();

module.exports = {
    authenticate:authenticate,
    getHotelCodes: getHotelCodes,
    searchHotelAvailability: searchHotelAvailability,
    preBook: preBook,
    bookHotel: bookHotel,
    getHotelBookingDetails: getHotelBookingDetails,
    getCountryCodes: getCountryCodes,
    getCityCodes: getCityCodes,
    cancelBookings: cancelBookings,
    getHotelDetails: getHotelDetails,
    // Static Data Functions
    getCountriesFromDB: getCountriesFromDB,
    getCitiesFromDB: getCitiesFromDB,
    getHotelDetailsFromDB: getHotelDetailsFromDB,
    getHotelCodesFromDB: getHotelCodesFromDB,
    populateCountriesToDB: populateCountriesToDB,
    populateCitiesToDB: populateCitiesToDB,
    populateHotelCodesToDB: populateHotelCodesToDB,
    populateHotelDetailsToDB: populateHotelDetailsToDB,
    populateAllHotelDetails: populateAllHotelDetails
};
