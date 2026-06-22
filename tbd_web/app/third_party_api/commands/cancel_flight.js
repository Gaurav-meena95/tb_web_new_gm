"use strict";

const flightCancellation = require("../models/tbo_flight_cancellations");
const appConstants = require("constants");
const seqConfig = require("../../config/sequelize_config");
const readSeqInstance = seqConfig.read_sequelize;
const writeSeqInstance = seqConfig.write_sequelize;
const razorPayHelper = require('../../razorpay-helper');
const { QueryTypes } = require('sequelize');
const whatsapp = require("../../send-whatsapp");
const genInvoice = require("../../gen_invoice");
const sendEmail = require("../../send-email");

const cancelFlight = async (payload) => {
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
            tbo_flight_booking_id: payload.tboFlightBookingId,
            reason: payload.reason,
            change_request_id: payload.changeRequestId,
            refunded_amount: payload.refundedAmount,
            cancellation_fee: payload.cancellationFee,
            cancellation_date: Date.now(),
            service_tax_on_raf: payload.serviceTaxOnRaf ? 0 : 0
        };
        let newItem = await flightCancellation.create(newRec);
        let refundAmt = payload.refundedAmount;
        await razorPayHelper.initiateRefund(payload.paymentId,refundAmt,'User cancelled flight ticket');   

        let userInfo = await readSeqInstance.query(
            "select  phone_dial_code, user_phone_number, user_email, booking_info from users, tbo_flight_bookings where users.primary_id = tbo_flight_bookings.user_id and tbo_flight_bookings.id = $1 and tbo_flight_bookings.user_id = $2",
            { bind: [payload.tboFlightBookingId, payload.plainUserId], type: QueryTypes.SELECT }
        );

        if (userInfo.length == 0){
            return { status: "errpr", "responseCode": 401, errorMessage: "No Booking Information Found" };
        }
        
        const updatedRec = await writeSeqInstance.query(
			"update tbo_flight_bookings set status = 'cancel' where id = $1",
			{ bind: [payload.tboFlightBookingId], type: QueryTypes.UPDATE}
		);

        /*Generate cancellation details in pdf with cancellationFee and refundedAmount
        try {
            //Generate invoice and send invoice to users mail
            await genInvoice(userInfo[0].user_email, bookingDetails);
        } catch (error) {
            console.log(error.message);
        }
        */

        /*Send cancellation details in whatsapp too*/

        let whatsAppTemplateParams = undefined;
        let bookingDetails = userInfo[0].booking_info;
        let userEmail = userInfo[0].user_email;
        function getTemplateParams(bookingDetails){
            let templateParams = undefined;
            let isRoundTrip = false;
            let listOfBookingIds = bookingDetails.outboundFlight.bookingReference;
            if (bookingDetails.inboundFlight){
                listOfBookingIds = listOfBookingIds + ', ' + bookingDetails.inboundFlight.bookingReference;
                isRoundTrip = true;
            }
        
            templateParams = [
                {  text: bookingDetails.outboundFlight.flights[0].passengers[0].firstname },
                {  text: listOfBookingIds.toString()}, 
                {  text: bookingDetails.outboundFlight.flights[0].departure},  
                {  text: bookingDetails.outboundFlight.flights[bookingDetails.outboundFlight.flights.length - 1].arrivalAirportCode?bookingDetails.outboundFlight.flights[bookingDetails.outboundFlight.flights.length - 1].arrivalAirportCode: '  ' } , 
                {  text: bookingDetails.outboundFlight.flights[0].departureTime},  
                {  text: isRoundTrip ? 'Round Trip': 'One Way'}, 
                {  text: payload.cancellationFee.toString()},
                {  text: payload.refundedAmount.toString()}
            ];
            return templateParams;
        }
        try {
            if (userInfo[0].user_phone_number && userInfo[0].user_phone_number.toString().length > 5){
                whatsAppTemplateParams = getTemplateParams(bookingDetails);
                //whatsapp.send_message(userInfo[0].phone_dial_code + userInfo[0].user_phone_number,'flight_cancellation_confirmation', '', {templateParams: whatsAppTemplateParams});
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
                        //whatsapp.send_message(dialCode + contactNo,'flight_cancellation_confirmation', '', {templateParams: whatsAppTemplateParams});
                    }
                }else{
                    console.log('No phone number shared while booking.');
                }
            }
        } catch (error) {
            console.log(error.message);
        }
        
        try {
            
            //sendEmail.sendEmailWithTemplate("pranav@beatravelbuddy.com", { full_name: "Pranav", flight_sector: 'DEL-BOM', refund_amount: '2000' }, "flightBookingCancellation");
            
            sendEmail.sendEmailWithTemplate(userEmail, { full_name: bookingDetails.outboundFlight.flights[0].passengers[0].firstname, refund_amount: payload.refundedAmount.toString() }, "flightBookingCancellation");
            console.log('Email sent successfully');
        }
        catch (error) {
            console.log('Email Error', error.message);
        }

        return { status: "success", "responseCode": 200, object: { "cancellationId": newItem.id} };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = cancelFlight;
