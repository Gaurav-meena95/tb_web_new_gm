"use strict";

const Coupons = require("../models/coupons");
const apiHelper = require('../../api-helper');
const appConstants = require("../../constants");

const addCoupons = async (payload) => {
    try {
        // payload.user_id = apiHelper.decrypt(payload.user_id);
        payload.userId = appConstants.LOGGED_IN_USER_ID;
        console.log('Inside');
        let newRec = {
            coupon_code: payload.couponCode,
            coupon_description: payload.couponDescription,
            coupon_type: payload.couponType,
            discount_value: payload.discountValue,
            is_discount_in_percentage: payload.isDiscountInPercentage,
            max_discount: payload.maxDiscount,
            max_no_of_redemptions: payload.maxNoOfRedemptions,
            valid_from: payload.validFrom,
            valid_to: payload.validTo
        };

        if (payload.showUpFront){
            newRec['show_up_front'] = payload.showUpFront; 
        }else{
            newRec['show_up_front'] = 1; 
        }

        if (payload.minTickets){
            newRec['min_no_tickets'] = payload.minTickets;
        }else{
            newRec['min_no_tickets'] = -1;
        }

        const newCoupon = await Coupons.create(newRec);
        return { status: "success", "responseCode": 200, object: { id: newCoupon.id } };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addCoupons;
