const cancelOrders = require("../models/cancelled_orders");
apiHelper = require('../../api-helper');
const appConstants = require("../../constants");
const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const whatsapp = require("../../send-whatsapp");

const addCancelledOrders = async (payload) => {
    try {
        // payload.user_id = apiHelper.decrypt(payload.user_id);
        payload.userId = appConstants.LOGGED_IN_USER_ID;
        let newRec = {
            user_id: payload.userId,
            order_type: payload.orderType,
            selected_option: payload.selectedOption,
        };
        
        if (payload.metadata){
            newRec['metadata'] = payload.metadata; 
        }

        if (payload.orderType == 'premium'){
            let todaysCancelledRecs = await readSeqInstance.query(
                "select cancelled_orders.id, phone_dial_code, user_phone_number from cancelled_orders, users where users.primary_id = cancelled_orders.user_id and order_type = 'premium' and cancelled_orders.user_id = $1  and DATE(created_on) = CURRENT_DATE",
                { bind: [payload.userId], type: QueryTypes.SELECT }
            );
    
            console.log(JSON.stringify(todaysCancelledRecs));
            if (todaysCancelledRecs.length == 0) {
                try {
                    let userInfo = await readSeqInstance.query(
                        "select  phone_dial_code, user_phone_number from users where users.primary_id = $1",
                        { bind: [payload.userId], type: QueryTypes.SELECT }
                    );
                    console.log('sending whatsapp message');
                    let mediaPath = appConstants.S3_BUCKET + 'uploads/static/whatsapp/interested_but_not_scubscribed.jpg';
                    whatsapp.send_message(userInfo[0].phone_dial_code + userInfo[0].user_phone_number,'interested_but_not_scubscribed', '', {imageUrl: mediaPath});
                } catch (error) {
                    console.log(error.message);
                }
            }
        }

        //order type = 'premium'
        // select * from cancelled_orders where order_type = 'premium' and user_id = payload.userId  and DATE(created_on) = CURRENT_DATE

        const newlyCanceldOrder = await cancelOrders.create(newRec);
        return { status: "success", "responseCode": 200, object: { id: newlyCanceldOrder.id } };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addCancelledOrders;
