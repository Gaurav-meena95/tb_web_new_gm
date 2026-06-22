const axios = require('axios');
const appConstants = require("../../constants");
const utils = require("../../utils");
const seqConfig = require("../../config/sequelize_config");
const readSeqInstance = seqConfig.read_sequelize;
const { QueryTypes } = require('sequelize');
const addFlightSearchHistory = require("../commands/add_flight_search_history");
const flightSearchHistoryModel = require("../models/tbo_flight_search_history");
const updateBookingStage = require("../commands/update_booking_stage");
const addFlightBookings = require("../commands/add_flight_bookings");
const cancelFlightBookings = require("../commands/cancel_flight");
require('dotenv').config();
const razorPayHelper = require('../../razorpay-helper');
const mailClass = require("../../send-email");
const tbo_env = process.env.NODE_ENV == 'dev' ? 'DEV' : 'PROD';

const EndUserIp = process.env[`TBO_TBD_PUBLICID_${tbo_env}`]; // To be added at back-end
async function authenticate() {
    try {   
        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].AUTH, {
            "ClientId": process.env[`TBO_CLIENT_ID_${tbo_env}`], //"ApiIntegrationNew",
            "UserName": process.env[`TBO_USER_ID_${tbo_env}`], //"Terrains",
            "Password": process.env[`TBO_PASSWORD_${tbo_env}`], //"Terrains@12345",
            "EndUserIp": process.env[`TBO_TBD_PUBLICID_${tbo_env}`] //34.100.208.114
        });
        let authToken = response.data.TokenId;
        //STORE TOKEN IN THE DATABASE 
        await utils.updateThirdPartyToken('tbo-flights',authToken);
    } catch (error) {
        console.error('Authentication failed:', error);
    }
}

async function searchFlights(payload, doNotSave) {
    try {
        var plainUserId = payload.plainUserId; 
        //read the token from db and set to tokenId variable
        delete payload.plainUserId;
        var isInternational = payload.isInternational;
        delete payload.isInternational;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;
        
        var retryCount = payload.retryCount ? payload.retryCount: 0;
        delete payload.retryCount;
        const startTime = Date.now(); 
        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].FLIGHT_SEARCH, payload, {headers: {'Accept-Encoding': 'gzip, deflate'}});
        console.log('Response Recieved');
        const endTime = Date.now(); // Record the end time
        const duration = endTime - startTime; // Calculate the duration in milliseconds
        console.log(`Request took for search results ${duration} ms`);
        /*{
            "ErrorCode": 25,
            "ErrorMessage": "No Result Found"
        }*/
        
        if (response.data.Response.Error.ErrorCode == 6){
            payload.plainUserId = plainUserId;
            payload.isInternational = isInternational;
            retryCount++;
            await authenticate();
            //retry twice for the api.
            if (retryCount <= 2){
                payload.retryCount = retryCount;
                return await searchFlights(payload, doNotSave);
            }
            else {
                return { status: "warning", "responseCode": 400, message: 'Token got expired, please retry. RETRY COUNT-> ' + retryCount};
            }
        }
        if (!doNotSave){
            //Saving history
            const payloadForAddingSearchHistory = {
                plainUserId: plainUserId,
                source:payload.Segments[0].Origin,
                destination: payload.Segments[0].Destination,
                journeyType : payload.JourneyType,
                isInternational: isInternational,
                bookingStage: 'search',
                payload: {
                    "SearchPayload": payload
                }
            } 
            await addFlightSearchHistory(payloadForAddingSearchHistory);
        }
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

async function getCalendarFares(payload) {
    try {
        //read the token from db and set to tokenId variable
        payload.EndUserIp = EndUserIp;
        payload.JourneyType = 1;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;
        
        var retryCount = payload.retryCount ? payload.retryCount: 0;
        delete payload.retryCount;
        var plainUserId = payload.plainUserId;
        delete payload.plainUserId;

        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].CALENDAR_FARE, payload);
        
        if (response.data.Response.Error.ErrorCode == 6){
            payload.plainUserId = plainUserId;
            retryCount++;
            await authenticate();
            //retry twice for the api.
            if (retryCount <= 2){
                payload.retryCount = retryCount;
                return await getCalendarFares(payload);
            }
            else {
                return { status: "warning", "responseCode": 400, message: 'Token got expired, please retry. RETRY COUNT-> ' + retryCount};
            }
        }
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        console.log(error);
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

async function fareRule(payload) {
    try {
        //read the token from db and set to tokenId variable
        //const tokenId = ;
        var plainUserId = payload.plainUserId;
        delete payload.plainUserId;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;
        var retryCount = payload.retryCount ? payload.retryCount: 0;
        delete payload.retryCount;
        var resultIndexOb, resultIndexIb, payloadOb, payloadIb, isReturn, responseOb, responseIb, response;
        if (payload.isReturn && (payload.isReturn.toString().toLowerCase() == 'true')) {
            console.log('Inside return', payload);
            isReturn = true;
            resultIndexOb = payload.ResultIndexOb;
            resultIndexIb = payload.ResultIndexIb;
            payloadOb = {
                "ResultIndex": resultIndexOb,
                "EndUserIp": EndUserIp,
                "TokenId": payload.TokenId,
                "TraceId": payload.TraceId
            }
            payloadIb = {
                "ResultIndex": resultIndexIb,
                "EndUserIp": EndUserIp,
                "TokenId": payload.TokenId,
                "TraceId": payload.TraceId
            }
            console.log('PayloadOb', payloadOb);
            console.log('PayloadIb', payloadIb);
            responseOb = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].FARE_RULE, payloadOb);
            responseIb = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].FARE_RULE, payloadIb);
            console.log('Responses', responseOb.data, responseIb.data);
            if (responseOb.data.Response.Error.ErrorCode == 6 || responseIb.data.Response.Error.ErrorCode == 6) {
                payload.plainUserId = plainUserId;
                payload.retryCount = retryCount++;
                authenticate();
                //retry twice for the api.
                if (payload.retryCount <= 2){
                    searchFlights(payload);
                }
                else {
                    return { status: "warning", "responseCode": 400, message: 'Token got expired, please retry.'};
                }
            }
            //Updating history
            const payloadForUpdatingSearchHistoryOb = {
                plainUserId: plainUserId,
                payload: {
                    "Payload": payloadOb,
                    "Response": responseOb.data
                },
                bookingStage: 'fare_rule_ob'
            }
            const payloadForUpdatingSearchHistoryIb = {
                plainUserId: plainUserId,
                payload: {
                    "Payload": payloadIb,
                    "Response": responseIb.data
                },
                bookingStage: 'fare_rule_ib'
            }
            await updateBookingStage(payloadForUpdatingSearchHistoryOb);
            await updateBookingStage(payloadForUpdatingSearchHistoryIb);
            return { status: "success", "responseCode": 200, object: { ob: responseOb.data, ib: responseIb.data } };
        }
        else {
            console.log('Inside one way', payload);
            response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].FARE_RULE, payload);
            if (response.data.Response.Error.ErrorCode == 6){
                payload.plainUserId = plainUserId;
                payload.retryCount = retryCount++;
                authenticate();
                //retry twice for the api.
                if (payload.retryCount <= 2){
                    searchFlights(payload);
                }
                else {
                    return { status: "warning", "responseCode": 400, message: 'Token got expired, please retry.'};
                }
            }
            try{
                //Updating history
                const payloadForUpdatingSearchHistory = {
                    plainUserId: plainUserId,
                    payload: {
                        "Payload": payload,
                        "Response": response.data
                    },
                    bookingStage: 'fare_rule'
                }
                await updateBookingStage(payloadForUpdatingSearchHistory);
            } catch (error) {
                console.error('Updating Users History Failed', error);
            }
            return { status: "success", "responseCode": 200, object: response.data};
        }
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

var markUpPercentForLessThan20K = 0.012;
var markUpPercentForGreaterThan20K = 0.007;
            
async function getConvenienceCharges (totalFare, noOfPassengers){
    var markUpPerc = (totalFare < 20000 ? markUpPercentForLessThan20K: markUpPercentForGreaterThan20K) 
    var markUpValue =  (noOfPassengers > 4 ? (markUpPerc / 2) : markUpPerc)  * noOfPassengers * totalFare;
    return Math.ceil(markUpValue +  300);
}

async function fareQuote(payload) {
    try {
        var plainUserId = payload.plainUserId;
        var couponCode = payload.couponCode;
        //var plainUserId = payload.flightDir;
		let isBeforeBooking = 'false';
        let isReturn = 'false';
        let response, responseOb, responseIb, ssrOb, ssrIb, ssrOw;
        let payloadOb, payloadIb, payloadOw, baseFare, taxValue, convenienceCharges, ibFare;
        let selSeatsOb, selSeatsIb, selSeatsOw, mealSelectedOw, mealSelectedOb, mealSelectedIb;
        let passengersInfo = payload.passengers;
        ibFare = 0;
            
        
        if (payload.isBeforeBooking && (payload.isBeforeBooking.toString().toLowerCase() == 'true')) {
            
            isBeforeBooking = payload.isBeforeBooking;
            delete payload.isBeforeBooking;
            
            if (payload.isReturn && (payload.isReturn.toString().toLowerCase() == 'true')) {
                isReturn = payload.isReturn;
                delete payload.isReturn;
                
                if (payload.selectedFlightForBookingOb.seatSelected) {
                    selSeatsOb = payload.selectedFlightForBookingOb.seatSelected;
                    
                    delete payload.selectedFlightForBookingOb.seatSelected;
                }
                if (payload.selectedFlightForBookingIb.seatSelected) {
                    selSeatsIb = payload.selectedFlightForBookingIb.seatSelected;
                    delete payload.selectedFlightForBookingIb.seatSelected;
                }
                if (payload.selectedFlightForBookingOb.mealSelected) {
                    mealSelectedOb = payload.selectedFlightForBookingOb.mealSelected;
                    delete payload.selectedFlightForBookingOb.mealSelected;
                }
                if (payload.selectedFlightForBookingIb.mealSelected) {
                    mealSelectedIb = payload.selectedFlightForBookingIb.mealSelected;
                    delete payload.selectedFlightForBookingIb.mealSelected;
                }
                
            }
            
            if (payload.selectedFlightForBookingOw && payload.selectedFlightForBookingOw.seatSelected) {
                selSeatsOw = payload.selectedFlightForBookingOw.seatSelected;
                delete payload.selectedFlightForBookingOw.seatSelected;
            }
            if (payload.selectedFlightForBookingOw && payload.selectedFlightForBookingOw.mealSelected) {
                mealSelectedOw = payload.selectedFlightForBookingOw.mealSelected;
                console.log('Meal Selected', mealSelectedOw);
                delete payload.selectedFlightForBookingOw.mealSelected;
            }
            
        }
        delete payload.plainUserId;
        delete payload.couponCode;
        delete payload.passengers;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;

        //Updating history 
        async function updateFareQuoteInfo(userId, payloadInfo, responseInfo, bookingStage){
            try {
                const payloadForUpdatingSearchHistory = {
                    plainUserId: userId,
                    payload: {
                        "Payload": payloadInfo,
                        "Response": responseInfo
                    },
                    bookingStage: bookingStage
                } 
                await updateBookingStage(payloadForUpdatingSearchHistory);
            } catch (error) {
                console.error('Updating Users History Failed', error);
            }
        }
        
        if (isBeforeBooking == 'true' && isReturn == 'true') {
            // Calling first with Ob payload 
            payloadOb = payload.selectedFlightForBookingOb;
            payloadOb.EndUserIp = EndUserIp;
            payloadOb.TokenId = payload.TokenId;
            
            responseOb = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].FARE_QUOTE, payloadOb);
            
            payloadIb = payload.selectedFlightForBookingIb;
            payloadIb.EndUserIp = EndUserIp;
            payloadIb.TokenId = payload.TokenId;
            
            responseIb = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].FARE_QUOTE, payloadIb);
            updateFareQuoteInfo(plainUserId, payloadOb, responseOb.data, 'fare_quote_ob');
            updateFareQuoteInfo(plainUserId, payloadIb, responseIb.data, 'fare_quote_ib');

            ssrIb = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].SSR, payloadIb);
            ssrOb = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].SSR, payloadOb);
            updateFareQuoteInfo(plainUserId, payloadOb, ssrOb.data, 'ssr_ob');
            updateFareQuoteInfo(plainUserId, payloadIb, ssrIb.data, 'ssr_ib');

            //If payload.seatSelectionsApplied, then we will hit ssr and get the updated one.

        }
        else if (isBeforeBooking == 'true' && isReturn == 'false') {
            payloadOw = payload.selectedFlightForBookingOw;
            payloadOw.EndUserIp = EndUserIp;
            payloadOw.TokenId = payload.TokenId;
            
            response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].FARE_QUOTE, payloadOw);
            updateFareQuoteInfo(plainUserId, payloadOw, response.data, 'fare_quote_ow');
            ssrOw = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].SSR, payloadOw);
            updateFareQuoteInfo(plainUserId, payloadOw, ssrOw.data, 'ssr_ob');
        }
        else {
            response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].FARE_QUOTE, payload);
        }
        if (response && response.data.Response.Error.ErrorCode == 6){
            //fetch fresh token and fire the request once again.
        }
        //error code will be 2 if result index in the payload is wrong or traceid is wrong or traceid is expired
        if (response && response.data.Response.Error.ErrorCode == 2){
            //Check the documentation how long the traceid is active.
            // Active time of traceid is 10 minutes
            return { status: "error", "responseCode": 400, message: response.data.Response.Error.ErrorMessage}
        }
        if (response && response.data.Response.Error.ErrorCode == 5){
            // Your session ( TokenId ) has expired. Please re-authenticate.
            return { status: "error", "responseCode": 400, "error": response.data.Response.Error, message: "Refresh the trace id or do search once again"}
        }
        /*else {
            return { status: "success", "responseCode": 200, object: response.data};
        }*/
       
        function getSSRPriceCalculation(ssrObjct, selectedCodeObj, type) {
           /* var mealPrice = 0;
            for (var i = 0; i < ssrObjct.Response.MealDynamic.length; i++){
                var mealSec = ssrObjct.Response.MealDynamic[i];
                var mealCodeFound = false;
                for (var j = 0; j < mealSec.length; j++){
                    if (mealSec[j].Code == 'VGSW'){
                        mealPrice = mealPrice + mealSec[j].Price;
                        mealCodeFound = true;
                        break;
                    }
                }
                if (mealCodeFound){
                    break;
                }
            }

            var baggagePrice = 0;
            for (var i = 0; i < ssrObjct.Response.Baggage.length; i++){
                var baggageSec = ssrObjct.Response.Baggage[i];
                var baggageCodeFound = false;
                for (var j = 0; j < baggageSec.length; j++){
                    if (baggageSec[j].Code == 'VGSW'){
                        baggagePrice = baggagePrice + baggageSec[j].Price;
                        baggageCodeFound = true;
                        break;
                    }
                }
                if (baggageCodeFound){
                    break;
                }
            }*/
            
            if (type == 'meal') {
                var mealData = ssrObjct.Response.MealDynamic.flat(); // Flatten the nested arrays
                var mealPrice = 0;
                
                function getMealPrice(mealCode) {
                    for (const meal of mealData) {
                        if (meal.Code === mealCode) {
                            return meal.Price;
                        }
                    }
                    return 0; // Meal code not found
                }
                
                let mealCodes = selectedCodeObj.map(meal => meal.Code);
                
                mealCodes.forEach(function (mealCode) {
                    mealPrice += getMealPrice(mealCode);
                });
                
                console.log(`Total Meal Price: ₹ ${mealPrice}`);
                return {
                    totalPrice: mealPrice
                };
                
            }
            else {

                var seatData = ssrObjct.Response.SeatDynamic ? ssrObjct.Response.SeatDynamic : ssrObjct.Response.SeatPreference;
                var seatPrice = 0;
                function getSeatPrice(seatCode) {
                    for (const seatDynamic of seatData) {
                        for (const segment of seatDynamic.SegmentSeat) {
                            for (const row of segment.RowSeats) {
                                for (const seat of row.Seats) {
                                    if (seat.Code === seatCode) {
                                        return seat.Price;
                                    }
                                }
                            }
                        }
                    }
                    return 0; // Seat code not found
                }
                let seatCodes = selectedCodeObj.map(seat => seat.Code);
            
                seatCodes.forEach(function (seatCode) {
                    seatPrice = seatPrice + getSeatPrice(seatCode);
                });
            
                return {
                    totalPrice: seatPrice
                };
            }
            //var seatPrice = getSeatPrice(selectedSeatCodeObj);

        }
       
        
        if (isBeforeBooking == 'true') {
            var fareData, publishedFare, offeredFare, miscFare, netPayable, fareDataOb, fareDataIb;
            var updatedFareQuoteResponses = {};
            var markUpValue = 0;
            var baggageFare = 0, mealsFare = 0, seatFare = 0; 
            
            if (isReturn == 'true') {
                fareDataOb = responseOb.data.Response.Results.Fare;
                fareDataIb = responseIb.data.Response.Results.Fare;

                //Fetch Selected seat price, baggage price and meals to ssrPrice
                publishedFare = fareDataOb.BaseFare + fareDataOb.Tax + fareDataOb.AdditionalTxnFeePub + fareDataOb.OtherCharges + fareDataOb.ServiceFee + fareDataIb.BaseFare + fareDataIb.Tax + fareDataIb.AdditionalTxnFeePub + fareDataIb.OtherCharges + fareDataIb.ServiceFee;
                ibFare = fareDataIb.BaseFare + fareDataIb.Tax + fareDataIb.AdditionalTxnFeePub + fareDataIb.OtherCharges + fareDataIb.ServiceFee;
                offeredFare = publishedFare - (fareDataOb.CommissionEarned + fareDataOb.IncentiveEarned + fareDataOb.PLBEarned + fareDataOb.AdditionalTxnFeePub + fareDataIb.CommissionEarned + fareDataIb.IncentiveEarned + fareDataIb.PLBEarned + fareDataIb.AdditionalTxnFeePub);
                miscFare = fareDataOb.TdsOnCommission + fareDataOb.TdsOnIncentive + fareDataOb.TdsOnPLB + fareDataIb.TdsOnCommission + fareDataIb.TdsOnIncentive + fareDataIb.TdsOnPLB;
                baseFare = fareDataOb.BaseFare + fareDataIb.BaseFare;
                taxValue = publishedFare - baseFare;

                /*var baggageCode, mealsCode, seatCode;
                passengersInfo.forEach(function(passengerDet){
                    if (passengerDet.Baggage && passengerDet.Baggage.length > 0){
                        passengerDet.Baggage.forEach(function(baggageInfo){
                            baggageCode = baggageInfo.code;
                            ssrIb.data.Response.Baggage;
                            baggageFare = baggageFare + passengerDet.Baggage
                        })
                    }
                })*/

                if (selSeatsOb) {
                    let priceCalOb = getSSRPriceCalculation(ssrOb.data, selSeatsOb);
                    
                    publishedFare += priceCalOb.totalPrice;
                }
                
                if (selSeatsIb){
                    let priceCalIb = getSSRPriceCalculation(ssrIb.data, selSeatsIb);
                    publishedFare += priceCalIb.totalPrice;
                }
                
                if (mealSelectedOb) {
                    let mealPriceOb = getSSRPriceCalculation(ssrOb.data, mealSelectedOb, 'meal');
                    publishedFare += mealPriceOb.totalPrice;
                }
                
                if (mealSelectedIb) {
                    let mealPriceIb = getSSRPriceCalculation(ssrIb.data, mealSelectedIb, 'meal');
                    publishedFare += mealPriceIb.totalPrice;
                }
                
                
                var noOfPassengers = (passengersInfo && passengersInfo.ob) ? passengersInfo.ob.length : 1; 
                convenienceCharges = await getConvenienceCharges(publishedFare, noOfPassengers);

                updatedFareQuoteResponses = {
                    fareDataOb: responseOb.data,
                    fareDataIb: responseIb.data,   
                    ssrIb: ssrIb.data,   
                    ssrOb: ssrOb.data   
                }
            }
            else {
                fareData = response.data.Response.Results.Fare;
                
                // Published Fare : BaseFare + Tax + OtherCharges + ServiceFee + AdditionalTxnFeepub + AirlineTransFee
                // not able to find AirlineTransFee in the response
                publishedFare = fareData.BaseFare + fareData.Tax  + fareData.AdditionalTxnFeePub + fareData.OtherCharges + fareData.ServiceFee;
                offeredFare = publishedFare - (fareData.CommissionEarned + fareData.IncentiveEarned + fareData.PLBEarned + fareData.AdditionalTxnFeePub);
                miscFare = fareData.TdsOnCommission + fareData.TdsOnIncentive + fareData.TdsOnPLB; // + GST(IGSTAmount+CGSTAmount+SGSTAmount+CessAmount) --> This also needs to be added.
                baseFare = fareData.BaseFare;
                taxValue = publishedFare - baseFare;

                let priceCalOw;
                if (selSeatsOw) {
                    priceCalOw = getSSRPriceCalculation(ssrOw.data, selSeatsOw);
                    console.log('Seat Price', priceCalOw.totalPrice);
                    publishedFare += priceCalOw.totalPrice;
                }
                
                if (mealSelectedOw) {
                    let mealPriceOw = getSSRPriceCalculation(ssrOw.data, mealSelectedOw, 'meal');
                    publishedFare += mealPriceOw.totalPrice;
                    console.log('Meal Price', mealPriceOw.totalPrice);
                }

                var noOfPassengers = (passengersInfo) ? passengersInfo.length : 1; 
                convenienceCharges = await getConvenienceCharges(publishedFare, noOfPassengers);
                
                
                updatedFareQuoteResponses = {
                    fareDataOw: response.data,
                    ssrOw: ssrOw.data,
                }
            }

            netPayable = offeredFare + miscFare; // Invoice Amount + ssrPrice

            let discountAmount = 0;
            publishedFare = publishedFare + convenienceCharges;
            //Number of passengers has been hardcoded to 1 as we are not consiering min number of pax for coupon
			if (couponCode) {
                let couponInfo = await utils.isValidCoupon(couponCode,1,plainUserId, 'flight');
                if (!couponInfo.isValid) {
                    return {
                        status: "error",
                        responseCode: 400,
                        errorMessage: "Invalid coupon code"
                    };
                }
    
                discountAmount = await utils.calculateDiscountedAmount(couponCode, convenienceCharges); //coupon value should be applied only on convenienceCharges
                publishedFare = publishedFare - discountAmount;
			}
            var flightPaymentPayload = {
                userId: "0f4fe921ae152b39c71f7bb8fa1bc710459b849d9802f9761812d51ed5958a83",
                selPrice: parseFloat(Math.ceil(publishedFare).toFixed(2) * 100),
                packageId: "tbo_flights",
                currency: "INR",
                couponApplied: "",
                source: 'tboFlights',
                paymentFor: 'Flights Booking',
                extraInfo: {
                    totalFare: publishedFare,
                    basePrice: baseFare,    //publishedFare - convenienceCharges + discountAmount, //
                    tax: Math.ceil(taxValue),//Correct incase if we are using this field to show some place
                    convenienceCharges: convenienceCharges,//Correct incase if we are using this field to show some place
                    couponDiscount: discountAmount,
                    couponCode: couponCode,
                    ibFare: ibFare                   
                }
            };
            
            const flightPaymentResponse = await razorPayHelper.getOrderId(flightPaymentPayload);
            return { status: "success", "responseCode": 200, object: flightPaymentResponse, updatedFareQuoteResponses: updatedFareQuoteResponses};        
        }
        else {
            updateFareQuoteInfo(plainUserId, payload, response.data, 'fare_quote');
            return { status: "success", "responseCode": 200, object: response.data};
        }
        
        //return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        console.log('failed at catch block', error);
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

async function getSSR(payload) {
    try {
        var plainUserId = payload.plainUserId;
        var isInbound = payload.isInBound;
        delete payload.plainUserId;
        delete payload.isInBound;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;
        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].SSR, payload);
        // if (response.Response.Error.ErrorCode == 6){
        //     //fetch fresh token and fire the request once again.
        // }
        // //Error code is 5 if the trace id is expired
        // if (response.Response.Error.ErrorCode == 5){
        //     //Check the documentation how long the traceid is active.
        //     return { status: "error", "responseCode": 400, message: "Refresh the trace id or do search once again"}
        // }else{
        //     return { status: "success", "responseCode": 200, object: response.Response};
        // }
        //Updating history
        try {
            const payloadForUpdatingSearchHistory = {
                plainUserId: plainUserId,
                payload: {
                    "Payload": payload,
                    "Response": response.data
                },
                bookingStage: ('ssr' + (isInbound ? '_ib' : '_ob'))
            } 
            await updateBookingStage(payloadForUpdatingSearchHistory);
        } catch (error) {
            console.error('Updating Users History Failed', error);
        }
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

async function validateFlightPayment(fareBreakUp){
    let isValidPayment = await razorPayHelper.validatePayment({orderId: fareBreakUp.orderId, paymentId: fareBreakUp.paymentId});

    return isValidPayment;
}

//For Non LCC bookFlight method is called
async function bookFlight(payload) {
    try {
        var plainUserId = payload.plainUserId;
        var paymentId = payload.paymentId;
        var orderId = payload.orderId;
        var savePassengerInfo = payload.savePassengerInfo;
        var isInbound = payload.isInBound;
        var fareBreakUp = payload.fareBreakUp;
        delete payload.fareBreakUp;
        delete payload.plainUserId;
        delete payload.paymentId;
        delete payload.orderId;
        delete payload.savePassengerInfo;
        delete payload.isInBound;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;

        var isValidPayment = await validateFlightPayment(fareBreakUp);

        if (!isValidPayment){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Invalid Payment"
            };
        }
        

        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].BOOK, payload);
        //Updating history
        payload.plainUserId = plainUserId;
        payload.paymentId = paymentId;
        payload.orderId = orderId;
        payload.fareBreakUp = fareBreakUp;
        await addFlightBookingsInfo(plainUserId, payload, response, 'book' + (isInbound ? '_ib': '_ob'), savePassengerInfo, isInbound);
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }

}
//add faresummary argument in the below function and pass it whereever it called
async function addFlightBookingsInfo(plainUserId, payload, response, bookingStage, savePassengerInfo, isInbound){
    const leadPax = payload.Passengers ? payload.Passengers.find(pax => pax.IsLeadPax.toString() == 'true') : undefined;
    const bookingResponse = response.data.Response.Response;
    let fareBreakUp = payload.fareBreakUp;
    let flightBookingId = {};        
    try {

        if (response.data.Response.Error.ErrorCode == 0 && leadPax){

            if (savePassengerInfo){
                await utils.updateUsersPassengersInfo(payload.Passengers, plainUserId);
            }

            let foundItem = await flightSearchHistoryModel.findOne({ 
                where: { user_id: payload.plainUserId }, order: [['id', 'DESC']]
            });
            let booking_info = {};
            let saveBookings = true;
            let payloadForAddingBookings = {};
            let totalCommissionEarned = 0; 
            function updateBookInfo(resp){
                booking_info['bookingDate'] = resp.FlightItinerary.InvoiceCreatedOn || resp.FlightItinerary.LastTicketDate;
                var bookingId = resp.FlightItinerary.BookingId;
                var pnrNumber = resp.FlightItinerary.PNR;
                var passengers = resp.FlightItinerary.Passenger;
                var tripType = resp.FlightItinerary.TripIndicator == 1? 'outboundFlight': 'inboundFlight';
                totalCommissionEarned = totalCommissionEarned + (resp.FlightItinerary.Fare ? resp.FlightItinerary.Fare.CommissionEarned : 0);
                resp.FlightItinerary.Segments.forEach(segment => {
                    if (!booking_info[tripType]){
                        booking_info[tripType]={
                            'pnrNumber': pnrNumber,
                            'bookingReference': bookingId,
                            'flights': []
                        }
                    }
                    var listOfPassengers = [];
                    passengers.forEach(passenger => {
                        var seatInfo = passenger.SeatDynamic ? passenger.SeatDynamic.find(function(itm) { return itm.AirlineCode == segment.Airline.AirlineCode}) : undefined;
                        var mealInfo = passenger.MealDynamic ? passenger.MealDynamic.find(function(itm) { return itm.AirlineCode == segment.Airline.AirlineCode}) : undefined;
                        var baggageInfo = passenger.Baggage ? passenger.Baggage.find(function(itm) { return itm.AirlineCode == segment.Airline.AirlineCode}) : undefined;
                        var seatCode = seatInfo ? seatInfo.Code: '';
                        var mealCode = mealInfo ? mealInfo.AirlineDescription ? mealInfo.AirlineDescription : mealInfo.Description: '';
                        var baggageCode = baggageInfo ? baggageInfo.Code: '';
                        listOfPassengers.push({
                            firstname: passenger.FirstName,
                            lastname: passenger.LastName,
                            title: passenger.Title,
                            email: passenger.Email,
                            seat: seatCode,
                            meal: mealCode,//passenger.Ssr[0].MealType,//Correct this code
                            paxtype: passenger.PaxType, //1 for adult, 2 for child, 3 for infant
                            baggage: baggageCode,//passenger.Ssr[0].BaggageType,//Correct this code
                            contactNo: passenger.ContactNo ? passenger.ContactNo : '',
                            gstNumber: passenger.GSTNumber ? passenger.GSTNumber : '',
                            gstMobNumber: passenger.GSTCompanyContactNumber ? passenger.GSTCompanyContactNumber : '',
                            ticketId: (passenger.Ticket && passenger.Ticket.TicketId) ? passenger.Ticket.TicketId : '',
                            barCodeInfo: passenger.BarcodeDetails ? passenger.BarcodeDetails.Barcode : undefined
                        })
                    });
                    
                    booking_info[tripType].flights.push({
                        flightNumber: segment.Airline.FlightNumber,
                        airlineCode: segment.Airline.AirlineCode,
                        airlineName: segment.Airline.AirlineName,
                        departure: segment.Origin.Airport.CityName,
                        destination: segment.Destination.Airport.CityName,
                        departureAirportName: segment.Origin.Airport.AirportName,
                        arrivalAirportName: segment.Destination.Airport.AirportName,
                        departureAirportCode: segment.Origin.Airport.AirportCode,
                        arrivalAirportCode: segment.Destination.Airport.AirportCode,
                        departureTerminal: segment.Origin.Airport.Terminal,
                        arrivalTerminal: segment.Destination.Airport.Terminal,
                        departureTime: segment.Origin.DepTime,
                        arrivalTime:  segment.Destination.ArrTime,
                        passengers: listOfPassengers
                    })
                });
            }

            booking_info['charges'] = {
                basePrice: fareBreakUp.basePrice,
                tax: fareBreakUp.tax,
                additionalCharges: fareBreakUp.convenienceCharges,
                couponDiscount: fareBreakUp.couponDiscount,
                totalFare: fareBreakUp.totalFare
            };

            updateBookInfo(bookingResponse);

            if (bookingResponse.FlightItinerary.JourneyType == 2 || bookingResponse.FlightItinerary.JourneyType == 5){
                saveBookings = false;
                let histry = foundItem.payload;

                //get inbound or outbound flight details in the case of domestic.
                if (foundItem.is_domestic == 1){
                    var inboundOutBoundType = histry['book_ib'] || histry['book_ob'] || histry['ticket_ib'] || histry['ticket_ob'];
                    if (inboundOutBoundType){
                        if (inboundOutBoundType == null){
                            //console.log('Current flight is', bookingResponse.FlightItinerary.TripIndicator);
                        }else{
                            if (inboundOutBoundType.Response.Response.Response != null){
                                updateBookInfo(inboundOutBoundType.Response.Response.Response);
                                saveBookings = true;
                            }
                        }
                    }
                }

                if (histry && ((foundItem.is_domestic == 0) || (histry['book_ib'] || histry['book_ob']) || (histry['ticket_ib'] || histry['ticket_ob']))){
                    saveBookings = true;
                }
            }

            payloadForAddingBookings = {
                plainUserId: plainUserId,
                bookingId: bookingResponse.BookingId,
                pnr: bookingResponse.PNR,
                firstName: leadPax.FirstName,
                lastName: leadPax.LastName,
                source: bookingResponse.FlightItinerary.Origin,
                destination: bookingResponse.FlightItinerary.Destination,
                airlineCode: bookingResponse.FlightItinerary.AirlineCode,
                isLcc: bookingResponse.FlightItinerary.IsLCC,
                fare: fareBreakUp.totalFare,
                currency: bookingResponse.FlightItinerary.Fare.Currency,
                paymentId: fareBreakUp.paymentId,
                orderId: fareBreakUp.orderId,
                tboResponse: response.data.Response,
                booking_info: booking_info,       
                isDomestic: foundItem.is_domestic,
                basefare: fareBreakUp.basePrice,
                tax: fareBreakUp.tax,
                discount: fareBreakUp.couponDiscount,
                coupon_code: fareBreakUp.couponCode,
                totalCommissionEarned: totalCommissionEarned,
                bookingInfo:booking_info
            }

            if (saveBookings){
                flightBookingId = await addFlightBookings(payloadForAddingBookings);
            } 
            
        }

    } catch (error) {
        console.error('Booking process failed', error);
    }        

    try {
        delete payload.plainUserId;
        delete payload.paymentId;
        delete payload.orderId;
        delete payload.fareBreakUp;
        payloadForUpdatingSearchHistory = {
            plainUserId: plainUserId,
            flightBookingId: flightBookingId.object ? flightBookingId.object.bookingId : '',
            payload: {
                "Payload": payload,
                "Response": response.data
            },
            bookingStage: bookingStage
        }
        await updateBookingStage(payloadForUpdatingSearchHistory);
    } catch (error) {
        console.error('Updating Users History Failed', error);
    }        


    var isTicketFailed = false;
    var isFullTicketRefund = false;
    var bookingFailedId = -1;
    var obTicketDetails = undefined;
    try {
        //Failure case 
        if (payload.Passengers && response.data.Response.Error.ErrorCode != 0){
            if (fareBreakUp && fareBreakUp.paymentId){
                isTicketFailed = true;
                var foundItem = await flightSearchHistoryModel.findOne({ 
                    where: { user_id: plainUserId }, order: [['id', 'DESC']]
                });
                bookingFailedId = foundItem.id; 
                var isRoundTrip = foundItem.journey_type == 2 || foundItem.journey_type == 5;
                if (!isRoundTrip){
                    isFullTicketRefund = true;
                    response.data.Response.Error.RefundMessage = 'We have initiated your amount ' + fareBreakUp.totalFare + ' and your paymentid is ' + fareBreakUp.paymentId +'. Amount will be credited to customer’s bank account within 5-7 working days after the refund has processed.'; 
                    await razorPayHelper.initiateRefund(fareBreakUp.paymentId,fareBreakUp.totalFare,'Failed at TBO Level');   
                }else{
                    var refundTotalAmount = false;
                    //For international flights there will be only one request for both IB and OB. So we refund the entire amount.
                    if (foundItem.is_domestic == 0){
                        refundTotalAmount = true;
                    }
                    if (!refundTotalAmount && !isInbound){
                        refundTotalAmount = true;
                    }
                    if (!refundTotalAmount){
                        var histry = foundItem.payload;
                        obTicketDetails = histry['book_ob'] || histry['ticket_ob'];
                        response.data.Response.Error.RefundMessage = 'We have initiated your return journey amount ' + fareBreakUp.ibFare + ' and your paymentid is ' + fareBreakUp.paymentId +'. Amount will be credited to customer’s bank account within 5-7 working days after the refund has processed.'; 
                        await razorPayHelper.initiateRefund(fareBreakUp.paymentId,fareBreakUp.ibFare,'Failed at TBO Level');   
                        //Calculate the refund amount for IB and initiate refund and in this case send the onward journey ticket to the user.
                    }else{
                        isFullTicketRefund = true;
                        //Refund the entire amount as the ob failed     
                        response.data.Response.Error.RefundMessage = 'We have initiated your amount ' + fareBreakUp.totalFare + ' and your paymentid is ' + fareBreakUp.paymentId +'. Amount will be credited to customer’s bank account within 5-7 working days after the refund has processed.'; 
                        await razorPayHelper.initiateRefund(fareBreakUp.paymentId,fareBreakUp.totalFare,'Failed at TBO Level');   
                    }
                }
            }
        }
    } catch (error) {
        console.error('Failed while initiating refund', error);
    }    

    try {
        
        if (isTicketFailed){
            let userInfo = await readSeqInstance.query(
                "select  phone_dial_code, user_phone_number, user_email from users where users.primary_id = $1",
                { bind: [plainUserId], type: QueryTypes.SELECT }
            );
            let tplData = {
                full_name: leadPax ?  leadPax.FirstName : '' ,
                payment_id: fareBreakUp.paymentId,
                failed_booking_id: 'TBDFL' + bookingFailedId
            }
            var tmplateName = 'flightBookingFullRefund';
            if (!isFullTicketRefund){
                tmplateName = 'flightBookingPartialRefund';
                tplData = {
                    full_name: leadPax ?  leadPax.FirstName : '' ,
                    pnr: obTicketDetails.Response.Response.Response.PNR,
                    payment_id: fareBreakUp.paymentId,
                    ib_amount: fareBreakUp.ibFare,
                    failed_booking_id: 'TBDFL' + bookingFailedId
                }   
            }
            mailClass.sendEmailWithTemplate(
                userInfo[0].user_email,
                tplData,
                tmplateName,
                undefined,
                undefined
            );

        }
    } catch (error) {
        console.error('Failed while sending refund email', error);
    }        

        /*In the case of payload.Passengers is available and response.data.Response.Error.ErrorCode != 0, 
        then send an email to techsupport@beatravelbuddy.com. send payload.fareBreakUp.orderId and payment_id
        Raise the request for refund of amount.
        On the payment page, if a user cancels then store the users info in excel */
    try {
        
        if (payload.Passengers && response.data.Response.Error.ErrorCode != 0){
            let tplData = {
                user_name: leadPax ?  leadPax.FirstName : '' ,
                user_id: plainUserId,
                order_id: fareBreakUp.orderId,
                payment_id: fareBreakUp.paymentId,
                user_email: leadPax? leadPax.Email: ''
            }
            mailClass.sendEmailWithTemplate(
                "techsupport@beatravelbuddy.com",
                tplData,
                "flightBookingFailed",
                "ranjith@beatravelbuddy.com",
                undefined
            );

        }
    } catch (error) {
        console.error('Failed while sending mail', error);
    }        

}

//If the flight is non Lcc, first bookFlight will be called and then flightTicketing will be called
//If the flight is Lcc then flightTicketing will be called directly
async function flightTicketing(payload) {
    try {
        var plainUserId = payload.plainUserId;
        var paymentId = payload.paymentId;
        var orderId = payload.orderId;
        var savePassengerInfo = payload.savePassengerInfo;
        var isInbound = payload.isInBound;
        var fareBreakUp = payload.fareBreakUp;
        delete payload.fareBreakUp;
        delete payload.isInBound;
        delete payload.plainUserId;
        delete payload.paymentId;
        delete payload.orderId;
        delete payload.savePassengerInfo;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;

        if (payload.fareBreakUp){
            var isValidPayment = await validateFlightPayment(payload.fareBreakUp);
    
            if (!isValidPayment){
                return {
                    status: "error",
                    responseCode: 400,
                    errorMessage: "Invalid Payment"
                };
            }
        }

        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].TICKET, payload);

        //For LCC we get payload.Passengers
        payload.plainUserId = plainUserId;
        payload.paymentId = paymentId;
        payload.orderId = orderId;
        payload.fareBreakUp = fareBreakUp;
        await addFlightBookingsInfo(plainUserId, payload, response, 'ticket' + (isInbound ? '_ib': '_ob'), savePassengerInfo, isInbound);
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }

}

async function getBookingDetails(payload) {
    try {
        //read the token from db and set to tokenId variable
        //const tokenId = ;
        var plainUserId = payload.plainUserId;
        delete payload.plainUserId;
        payload.EndUserIp = EndUserIp;
        var isReturn = payload.isReturn;
        delete payload.isReturn;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;
        var response, responseOb, responseIb, ticketResponseRound;
        
        
        console.log('getBookingDetails payload', payload);
        if (isReturn && isReturn.toString().toLowerCase() == 'true') {
        
            payload.Ob.EndUserIp = EndUserIp;
            payload.Ib.EndUserIp = EndUserIp;
            
            payload.Ob.TokenId = payload.TokenId;
            payload.Ib.TokenId = payload.TokenId;
            
            console.log('getBookingDetails payload Ob', payload.Ob);
            responseOb = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].BOOKING_DETAILS, payload.Ob);
            
            
            
            console.log('getBookingDetails payload Ib', payload.Ib);
            
            responseIb = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].BOOKING_DETAILS, payload.Ib);
            
            ticketResponseRound = {
                ob: responseOb.data,
                ib: responseIb.data
            }
            console.log('ticketResponseRound', ticketResponseRound);
        }
        
        else {
            response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].BOOKING_DETAILS, payload);
        }
        /*if (response.Response.Error.ErrorCode == 6){
            //fetch fresh token and fire the request once again.
        }
        //Error code is 5 if the trace id is expired
        if (response.Response.Error.ErrorCode == 5){
            //Check the documentation how long the traceid is active.
            return { status: "error", "responseCode": 400, message: "Refresh the trace id or do search once again"}
        }else{
            return { status: "success", "responseCode": 200, object: response.Response};
        }*/
        //Updating history
        try {
            
            var ticketResponse = response ? response.data : ticketResponseRound;            
            const payloadForUpdatingSearchHistory = {
                plainUserId: plainUserId,
                payload: {
                    "Payload": payload,
                    "Response": ticketResponse
                },
                bookingStage: 'getBooking' + ((isReturn && isReturn.toString().toLowerCase() == 'true')? '_ob-ib' : '_ow')
            }
            console.log('bookStage', 'getBooking' + ((isReturn && isReturn.toString().toLowerCase() == 'true') ? '_ob-ib' : '_ow'));
            await updateBookingStage(payloadForUpdatingSearchHistory);
        } catch (error) {
            console.error('Updating Users History Failed', error);
		}
		try {
			let userInfoGB = await readSeqInstance.query(
				"select * from users where users.primary_id = $1",
				{ bind: [plainUserId], type: QueryTypes.SELECT }
			);
			console.log('checkValidGB', userInfoGB);
			if (userInfoGB.length > 0 && userInfoGB[0].user_redirected_from == 'grassberry') {
				var userEmail = userInfoGB[0].user_email;
				var payloadGb = {
					'user': userEmail,
					'transactionStatus': 'ok'
				};
				var gbBookingUpdateApi = await axios.post('https://grassberry.in/api/transaction', payloadGb);
				console.log('Grassberry Booking Update Response-Full', gbBookingUpdateApi.data);
				console.log('Grassberry Booking Update Response', gbBookingUpdateApi.data);
			}
		}
		catch (error) {
			console.error('Updating Users for Grassberry History Failed', error);
		}
		
		
        return { status: "success", "responseCode": 200, object: ticketResponse};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }

}

//Payload should have BookingId & Source
async function releasePNR(payload) {
    try {
        var plainUserId = payload.plainUserId;
        delete payload.plainUserId;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;

        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].RELEASE_PNR, payload);
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }
}

//Payload should have BookingId, RequestType (0:NotSet, 1: FullCancellation, 2: PartialCancellation, 3: ReIssuance),
//CancellationType (0:NotSet, 1: NoShow, 2: FlightCancelled, 3: Others), Sectors (as Object having Origin, Destination, TicketId) & Remarks
async function sendChangeRequest(payload) {
    try {
        var plainUserId = payload.plainUserId;
        var orderId = payload.orderId;
        var airlineSource = payload.airlineSource;
        var tboFlightBookingId = payload.tboFlightBookingId;
        var bookingMode = payload.bookingMode;
        var paymentId = payload.paymentId;
        delete payload.bookingMode;
        delete payload.paymentId;
        delete payload.tboFlightBookingId;
        delete payload.airlineSource;
        delete payload.plainUserId;
        delete payload.orderId;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;

        
        payload.BookingId = parseInt(payload.BookingId); 
        payload.TicketId = parseInt(payload.TicketId);
        console.log('Payload', payload);
        
        let payloadForCharges = {};
        payloadForCharges.BookingId = payload.BookingId; 
        payloadForCharges.RequestType = payload.RequestType; 
        //payloadForCharges.BookingMode = bookingMode; 
        payloadForCharges.EndUserIp = EndUserIp; 
        payloadForCharges.TokenId = payload.TokenId; 
        delete payloadForCharges.BookingMode;
        console.log('B4 getCancellationCharges');

        let cancellationChargesResp = await getCancellationCharges(payloadForCharges);
        
        console.log('After getCancellationCharges', cancellationChargesResp.object.Response);
        
        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].SEND_CHANGE_REQ, payload);
        
        console.log('Change Request Response', response);

        if (response.data.Response.ResponseStatus == 1) { 
            if (payload.RequestType == 1) {
                if (cancellationChargesResp.object.Response.ResponseStatus == '1') {
                    payloadForCancel = {};
                    payloadForCancel.plainUserId = plainUserId;
                    payloadForCancel.bookingId = payload.BookingId;
                    payloadForCancel.tboFlightBookingId = tboFlightBookingId;
                    payloadForCancel.paymentId = paymentId;
                    payloadForCancel.reason = payload.Remarks;
                    payloadForCancel.changeRequestId = 1;
                    payloadForCancel.refundedAmount = cancellationChargesResp.object.Response.RefundAmount;
                    payloadForCancel.cancellationFee = cancellationChargesResp.object.Response.CancellationCharge;
                    payloadForCancel.serviceTaxOnRaf = 0;
                    try {
                        console.log('B4 cancelFlightBookings');
                        flightCancelId = await cancelFlightBookings(payloadForCancel);
                        console.log('After cancelFlightBookings', flightCancelId);
                    } catch (error) {
                        
                    }
                }
                else {
                    return { status: "error", "responseCode": 400, message: cancellationChargesResp.object.Response.Error};
                }
            }
        }
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }

}

//Payload should have ChangeRequestId
async function getChangeRequestStatus(payload) {
    try {
        var plainUserId = payload.plainUserId;
        var orderId = payload.orderId;
        delete payload.plainUserId;
        delete payload.orderId;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;

        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].GET_CHANGE_REQ_STATUS, payload);

        //For LCC we get payload.Passengers
        payload.plainUserId = plainUserId;
        payload.paymentId = paymentId;
        payload.orderId = orderId;
        payload.fareBreakUp = fareBreakUp;
        await addFlightBookingsInfo(plainUserId, payload, response, 'ticket' + (isInbound ? '_ib': '_ob'), savePassengerInfo, isInbound);
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }

}

//Payload should have RequestType (FullCancellation = 1,PartialCancellation = 2,Reissuance = 3), BookingId & BookingMode
async function getCancellationCharges(payload) {
    try {
        var plainUserId = payload.plainUserId;
        var orderId = payload.orderId;
        delete payload.plainUserId;
        delete payload.orderId;
        payload.EndUserIp = EndUserIp;
        payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;

        const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].GET_CANCELLATION_CHARGES, payload);
        return { status: "success", "responseCode": 200, object: response.data};
    } catch (error) {
        return { status: "error", "responseCode": 400, message: error.message};
    }

}

async function getAgencyBalance(payload) {
    delete payload.plainUserId;
    payload.EndUserIp = EndUserIp;
    payload.TokenId = (await utils.getThirdPartyInfo('tbo-flights'))[0].token;
    payload.ClientId = 'ApiIntegrationNew';
    payload.TokenMemberId = '57858';
    payload.TokenAgencyId = '57696';
    console.log('Payload', payload);
    const response = await axios.post(appConstants.THIRD_PARTY_INFO['TBO' + '_' + tbo_env].GET_AGENCY_BALANCE, payload);
    return { status: "success", "responseCode": 200, object: response.data };
}

module.exports = {
    authenticate:authenticate,
    searchFlights: searchFlights,
    fareRule: fareRule,
    fareQuote: fareQuote,
    getSSR: getSSR,
    bookFlight: bookFlight,
    flightTicketing: flightTicketing,
    getBookingDetails: getBookingDetails,
    getCalendarFares: getCalendarFares,
    getConvenienceCharges: getConvenienceCharges,
    releasePNR: releasePNR,
    sendChangeRequest: sendChangeRequest,
    getChangeRequestStatus: getChangeRequestStatus,
    getCancellationCharges: getCancellationCharges,
    getAgencyBalance: getAgencyBalance

};
