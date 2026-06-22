"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const apiHlpr = require('../../api-helper');
const appConstants = require("../../constants");

const getCoupons = async (payload) => {
    try {

        if (typeof payload != 'object') {
            payload = {};
        }

        let loggedInUserId = payload.plainUserId;

        /*if (payload.userId) {
            loggedInUserId = apiHlpr.decrypt(payload.userId.toString());
        }*/

        let noOfTickets = -1;

        if (payload.noOfTickets) {
            noOfTickets = payload.noOfTickets;
        }

        let couponCodeCondition = "";
        if (payload.couponCode){
            couponCodeCondition = " and coupon_code = '" + payload.couponCode.toUpperCase() + "'";
        }

        if (payload.couponFor){
            if (payload.couponFor.toLowerCase() == 'experience' || payload.couponFor.toLowerCase() == 'flight' || payload.couponFor.toLowerCase() == 'hotel'){
                couponCodeCondition = couponCodeCondition +  " and coupon_for = '" + payload.couponFor.toLowerCase() + "'";
            }else{
                couponCodeCondition = couponCodeCondition +  " and coupon_for = 'experience'";
            }
        }else{
            couponCodeCondition = couponCodeCondition +  " and coupon_for = 'experience'";
        }

        let qry = "SELECT id couponId, coupon_code couponCode, coupon_description description, coupon_type couponType, discount_value discountValue, is_discount_in_percentage isDiscountInPerc, max_discount maxDiscount, max_no_of_redemptions maxNoOfRedemptions, valid_from validFrom, valid_to validTo FROM coupon WHERE (CURRENT_TIMESTAMP between valid_from and valid_to) and is_deleted = 0 and show_up_front = 1 and (max_no_of_redemptions = -1 or max_no_of_redemptions > (select count(coupon_id) from coupon_redemption where user_id = $1 and coupon_id = coupon.id))" + couponCodeCondition;
        let coupons = await readSeqInstance.query(
            qry,
            { bind: [loggedInUserId], type: QueryTypes.SELECT }
        );

        return { status: "success", "responseCode": 200, list: coupons };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getCoupons;
