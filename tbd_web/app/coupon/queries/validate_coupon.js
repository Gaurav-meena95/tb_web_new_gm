"use strict";
const utils = require("../../utils");

const validateCoupon = async (payload) => {
    try {

        if (!(payload.couponCode && payload.noOfTickets)){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request test"
            };
        }

        payload.couponCode = payload.couponCode.toUpperCase();
        
        let couponInfo = await utils.isValidCoupon(payload.couponCode, payload.noOfTickets, payload.plainUserId, payload.couponFor);
        if (!couponInfo.isValid) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Invalid coupon code",
                userId: payload.plainUserId
            };
        }
        let discountAmount = 0;
        if (payload.cartValue){
            discountAmount = await utils.calculateDiscountedAmount(payload.couponCode, payload.cartValue);
            couponInfo.couponInfo[0].couponValue = discountAmount;
        }

        return { status: "success", "responseCode": 200, "object": couponInfo.couponInfo};
    }
    catch (error) {
        console.log(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = validateCoupon;
