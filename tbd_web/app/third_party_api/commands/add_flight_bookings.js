"use strict";

const flightBookings = require("../models/tbo_flight_bookings");
const appConstants = require("constants");
const seqConfig = require("../../config/sequelize_config");
const CouponRedem = require("../../coupon/models/coupon_redemptions");
const readSeqInstance = seqConfig.read_sequelize;
const { QueryTypes } = require('sequelize');
const whatsapp = require("../../send-whatsapp");
const genInvoice = require("../../gen_invoice");
const writeToGoogleSheet = require("../../utility/write_to_google_sheet");

const addFlightBookings = async (payload) => {
    try {

        if (payload.plainUserId == undefined || payload.plainUserId == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }

        let newRec = {
            user_id: payload.plainUserId,
            booking_id: payload.bookingId,
            pnr: payload.pnr,
            first_name: payload.firstName,
            last_name: payload.lastName,
            source: payload.source,
            destination: payload.destination,
            airline_code: payload.airlineCode,
            is_lcc: payload.isLcc ? 1: 0,
            fare: payload.fare,
            currency: payload.currency,
            payment_id: payload.paymentId,
            order_id: payload.orderId,
            is_domestic: payload.isDomestic,
            tbo_response: payload.tboResponse,
            booking_info: payload.bookingInfo,
            basefare: payload.basefare,
            tax: payload.tax,
            discount: payload.discount,
            coupon_code: payload.coupon_code,
            traveling_on: payload.bookingInfo.outboundFlight.flights[0].departureTime,
            status: 'success',
        };
        let newItem = await flightBookings.create(newRec);

        
        let bookingDetails = payload.bookingInfo;
        let userInfo = await readSeqInstance.query(
            "select user_full_name, phone_dial_code, user_phone_number, user_email, is_verified, profile_creation_time from users where users.primary_id = $1",
            { bind: [payload.plainUserId], type: QueryTypes.SELECT }
        );
        await updateExcelSheet(payload, userInfo[0]);
        try {
            //Generate invoice and send invoice to users mail
            await genInvoice.sendInvoice(userInfo[0].user_email, bookingDetails);
        } catch (error) {
            console.log(error.message);
        }

        let whatsAppTemplateParams = undefined;
        function getTemplateParams(bookingDetails){
            let templateParams = undefined;
            let listOfPNRs = bookingDetails.outboundFlight.pnrNumber;
            if (bookingDetails.inboundFlight){
                listOfPNRs = listOfPNRs + ', ' + bookingDetails.inboundFlight.pnrNumber;
            }
        
            templateParams = [
                {  text: bookingDetails.outboundFlight.flights[0].passengers[0].firstname },
                {  text: bookingDetails.outboundFlight.flights[0].airlineName }, 
                {  text: bookingDetails.outboundFlight.bookingReference.toString()},  
                {  text: bookingDetails.outboundFlight.flights[0].departureAirportCode } , 
                {  text: bookingDetails.outboundFlight.flights[0].departure},  
                {  text: bookingDetails.outboundFlight.flights[bookingDetails.outboundFlight.flights.length - 1].arrivalAirportCode?bookingDetails.outboundFlight.flights[bookingDetails.outboundFlight.flights.length - 1].arrivalAirportCode: '  ' } , 
                {  text: bookingDetails.outboundFlight.flights[bookingDetails.outboundFlight.flights.length - 1].destination }  ,
                {  text: bookingDetails.outboundFlight.flights[0].departureTime},  
                {  text: listOfPNRs},  
                {  text: bookingDetails.outboundFlight.flights[0].passengers[0].firstname }
            ];
            return templateParams;
        }
        try {
            if (userInfo[0].user_phone_number && userInfo[0].user_phone_number.toString().length > 5){
                whatsAppTemplateParams = getTemplateParams(bookingDetails);
                //whatsapp.send_message(userInfo[0].phone_dial_code + userInfo[0].user_phone_number,'flight_confirmation', '', {templateParams: whatsAppTemplateParams});
            }else{
                console.log('No phone number registered.');
            }
        } catch (error) {
            console.log(error.message);
        }            

        try {
            if (bookingDetails.outboundFlight.flights[0].passengers[0].contactNo){
                var contactNo = bookingDetails.outboundFlight.flights[0].passengers[0].contactNo;
                if (contactNo){
                    var parts = contactNo.split(' ');
                    var dialCode = parts[0];
                    var remainingString = parts.slice(1).join(' ');
                    contactNo = String(remainingString).replace(/\s/g, '');
                    if (!whatsAppTemplateParams){
                        whatsAppTemplateParams = getTemplateParams(bookingDetails);
                    }
                    if (userInfo[0].user_phone_number != contactNo){
                        //whatsapp.send_message(dialCode + contactNo,'flight_confirmation', '', {templateParams: whatsAppTemplateParams});
                    }
                }else{
                    console.log('No phone number shared while booking.');
                }
            }
        } catch (error) {
            console.log(error.message);
        }


        if (payload.coupon_code) {
            let couponInfo = await readSeqInstance.query(
                "select id from coupon where coupon_code = $1",
                { bind: [payload.coupon_code], type: QueryTypes.SELECT }
            );
            const now = new Date();
            let newCouponRedem = {
                user_id: payload.plainUserId,
                coupon_id: couponInfo[0].id,
                redeemed_on: now
            }
            let newCouponRedeemed = await CouponRedem.create(newCouponRedem);
        }

        return { status: "success", "responseCode": 200, object: { "bookingId": newItem.id} };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

async function updateExcelSheet(payload, userInfo){
    const getCurrentDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0'); // Get day and pad with 0 if necessary
        const month = today.toLocaleString('default', { month: 'short' }); // Get abbreviated month name
        const year = today.getFullYear(); // Get full year
        return `${day}-${month}-${year}`;
    };
    try {
        let excelRec = [];
        excelRec.push(getCurrentDate());
        excelRec.push(userInfo.user_full_name);
        excelRec.push(userInfo.user_email);
        excelRec.push(userInfo.user_phone_number);
        excelRec.push(userInfo.is_verified? 'Yes' : 'No');
        excelRec.push(userInfo.profile_creation_time);
        excelRec.push(payload.bookingId);
        excelRec.push(payload.coupon_code);
        let bookingDetails = payload.bookingInfo;
        let listOfPNRs = bookingDetails.outboundFlight.pnrNumber;
        if (bookingDetails.inboundFlight){
            listOfPNRs = listOfPNRs + ', ' + bookingDetails.inboundFlight.pnrNumber;
        };
        excelRec.push(listOfPNRs);
        excelRec.push(payload.source);
        excelRec.push(payload.destination);
        excelRec.push(payload.bookingInfo.outboundFlight.flights[0].departureTime);
        excelRec.push(payload.fare);
        excelRec.push(payload.discount);
        excelRec.push(payload.totalCommissionEarned);
        excelRec.push(payload.fare - payload.totalCommissionEarned);
        writeToGoogleSheet('1kK56UWY7dIigG5YJK2fu6fx9ZvGPshfqdLL7dp0FSF4',[excelRec], 'FlightBookings!A2');    
    } catch (error) {
        
    }
}

module.exports = addFlightBookings;
