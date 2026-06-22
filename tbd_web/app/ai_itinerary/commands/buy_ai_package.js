"use strict";

const aiPackagesOwned = require("../models/ai_packages_owned");
const appConstants = require("../../constants");
const seqConfig = require("../../config/sequelize_config");
const razorPayHelper = require("../../razorpay-helper");
const writeSeqInstance = seqConfig.write_sequelize;

const buyAiPackage = async (payload) => {
    let seq_transaction;
    try {
        
        if (!(payload.package) || !(payload.orderId)){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }

        let isValidPayment = await razorPayHelper.validatePayment({orderId: payload.orderId, paymentId: payload.invoiceId});

        if (!isValidPayment){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Invalid Payment"
            };
        }
        
        if (payload.plainUserId == undefined || payload.plainUserId == -1){
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Unauthorized user",
            };
        }
                
        let startAndEndTime = getCurrentAndFutureTime(payload.package)

        let aiPackageInfo = {
            user_id: payload.plainUserId,
            package: payload.package,
            package_start_time: startAndEndTime.start,
            package_end_time: startAndEndTime.end,
            order_id: payload.orderId,
            invoice_id: payload.invoiceId,
            no_of_itineraries: startAndEndTime.noOfItineraries,
            source: payload.source
        }

        let newPackageOwned = await aiPackagesOwned.create(aiPackageInfo);
        
        return { status: "success", "responseCode": 200, object: { "packageOwnedId": newPackageOwned.id} };
    } catch (error) {
        console.log(error.message);
        console.log('error occured');
        if (seq_transaction) {
            await seq_transaction.rollback();
        }
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

function formatDate(date) {
    // Get year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Get hours, minutes, and seconds
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Combine into desired format
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getCurrentAndFutureTime(aiPackage) {
    let noOfHours = 12;
    let noOfItineraries = 2;
    if (aiPackage == 'tbd_ai_mini'){
        noOfHours = 12;
        noOfItineraries = 2;
    }else if (aiPackage == 'tbd_ai_super'){
        noOfHours = 24;
        noOfItineraries = 10;
    }
    // Get current date and time
    const now = new Date();
    const formattedNow = formatDate(now);
    
    // Add 8 hours
    const future = new Date(now.getTime() + noOfHours * 60 * 60 * 1000);
    const formattedFuture = formatDate(future);

    return {
        start: formattedNow,
        end: formattedFuture,
        noOfItineraries: noOfItineraries
    };
}
;

module.exports = buyAiPackage;
