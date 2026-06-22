"use strict";

const hotelBookings = require("../models/tbo_hotel_bookings");
const appConstants = require("constants");
const seqConfig = require("../../config/sequelize_config");
const CouponRedem = require("../../coupon/models/coupon_redemptions");
const readSeqInstance = seqConfig.read_sequelize;
const { QueryTypes } = require('sequelize');
const whatsapp = require("../../send-whatsapp");
const genInvoice = require("../../gen_invoice");
const writeToGoogleSheet = require("../../utility/write_to_google_sheet");
const path = require("path");

const addhotelBookings = async (payload) => {
    try {

        /*if (payload.plainUserId == undefined || payload.plainUserId == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }*/
		
		// Get the First & Last Name from bookingInfo.Rooms[0].HotelPassenger[0].
		let firstName = payload.bookingInfo.GetBookingDetailResult.Rooms[0].HotelPassenger[0].FirstName;
		let lastName = payload.bookingInfo.GetBookingDetailResult.Rooms[0].HotelPassenger[0].LastName;
		let email = payload.bookingInfo.GetBookingDetailResult.Rooms[0].HotelPassenger[0].Email;

        let newRec = {
			user_id: payload.plainUserId,
			
			booking_id: payload.bookingInfo.GetBookingDetailResult.BookingId,
			
			search_id: payload.bookingInfo.GetBookingDetailResult.SearchId ? payload.bookingInfo.GetBookingDetailResult.SearchId : 0,
			
			check_in_date: payload.bookingInfo.GetBookingDetailResult.CheckInDate ? payload.bookingInfo.GetBookingDetailResult.CheckInDate : null,
			
			check_out_date: payload.bookingInfo.GetBookingDetailResult.CheckOutDate ? payload.bookingInfo.GetBookingDetailResult.CheckOutDate : null,
			
			booking_ref_no: payload.bookingInfo.GetBookingDetailResult.BookingRefNo ? payload.bookingInfo.GetBookingDetailResult.BookingRefNo : '',
			
			confirmation_no: payload.bookingInfo.GetBookingDetailResult.ConfirmationNo ? payload.bookingInfo.GetBookingDetailResult.ConfirmationNo : '',
			
			trace_id: payload.bookingInfo.GetBookingDetailResult.TraceId ? payload.bookingInfo.GetBookingDetailResult.TraceId : '',
			
			invoice_no: payload.bookingInfo.GetBookingDetailResult.InvoiceNo ? payload.bookingInfo.GetBookingDetailResult.InvoiceNo : '',
			
			first_name: firstName,
			
			middle_name: '',
			
			last_name: lastName,
			
			hotel_name: payload.bookingInfo.GetBookingDetailResult.HotelName ? payload.bookingInfo.GetBookingDetailResult.HotelName : '',
			
			city: payload.bookingInfo.GetBookingDetailResult.City ? payload.bookingInfo.GetBookingDetailResult.City : '',
			
			country: payload.bookingInfo.GetBookingDetailResult.Country ? payload.bookingInfo.GetBookingDetailResult.Country : '',
			
			currency: payload.bookingInfo.GetBookingDetailResult.CurrencyCode ? payload.bookingInfo.GetBookingDetailResult.CurrencyCode : '',
			
			fare: payload.bookingInfo.GetBookingDetailResult.Fare ? payload.bookingInfo.GetBookingDetailResult.Fare : 0,
			
			payment_id: payload.bookingInfo.GetBookingDetailResult.PaymentId ? payload.bookingInfo.GetBookingDetailResult.PaymentId : '',
			
			order_id: payload.bookingInfo.GetBookingDetailResult.OrderId ? payload.bookingInfo.GetBookingDetailResult.OrderId : '',
			
			last_cancellation_date: payload.bookingInfo.GetBookingDetailResult.LastCancellationDate ? payload.bookingInfo.GetBookingDetailResult.LastCancellationDate : null,
			
			tbo_response: payload.bookingInfo.GetBookingDetailResult.TboResponse ? payload.bookingInfo.GetBookingDetailResult.TboResponse : null,
			
			booking_info: payload.bookingInfo.GetBookingDetailResult,
			
			coupon_code: payload.coupon_code ? payload.coupon_code : '',
			
			status: 'success',
        };
        let newItem = await hotelBookings.create(newRec);

        /*Uncomment below when email and whatsapp implementation is done*/
        
        let bookingDetails = payload.bookingInfo;
        // let userInfo = await readSeqInstance.query(
        //     "select user_full_name, phone_dial_code, user_phone_number, user_email, is_verified, profile_creation_time from users where users.primary_id = $1",
        //     { bind: [payload.plainUserId], type: QueryTypes.SELECT }
        // );
		// await updateExcelSheet(payload, userInfo[0]);
		
		// Generate Invoice and send to Email & WhatsApp
		try {
			const output = path.join(__dirname, "hotel_voucher_" + payload.bookingInfo.GetBookingDetailResult.BookingRefNo + ".pdf");
			await genInvoice.createHotelVoucher(bookingDetails, output);
			await genInvoice.sendInvoiceHotels(email, bookingDetails);
			console.log("✅ Hotel voucher created at:", output);
		} catch (error) {
			console.log(error.message);
		}
		
        /*try {
            //Generate invoice and send invoice to users mail
            await genInvoice(userInfo[0].user_email, bookingDetails);
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
                whatsapp.send_message(userInfo[0].phone_dial_code + userInfo[0].user_phone_number,'flight_confirmation', '', {templateParams: whatsAppTemplateParams});
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
                    contactNo = remainingString.replace(/\s/g, '');
                    if (!whatsAppTemplateParams){
                        whatsAppTemplateParams = getTemplateParams(bookingDetails);
                    }
                    if (userInfo[0].user_phone_number != contactNo){
                        whatsapp.send_message(dialCode + contactNo,'flight_confirmation', '', {templateParams: whatsAppTemplateParams});
                    }
                }else{
                    console.log('No phone number shared while booking.');
                }
            }
        } catch (error) {
            console.log(error.message);
        }*/

        


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
        writeToGoogleSheet('1kK56UWY7dIigG5YJK2fu6fx9ZvGPshfqdLL7dp0FSF4',[excelRec], 'HotelBookings!A2');    
    } catch (error) {
        
    }
}

module.exports = addhotelBookings;
