"use strict";

const seqConfig = require("../../config/sequelize_config");
const ExpBooking = require("../models/experience_booking");
const ExpBookingStaging = require("../models/experience_booking_staging");
const CouponRedem = require("../../coupon/models/coupon_redemptions");
const seq = require('sequelize');
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const writeSeqInstance = seqConfig.write_sequelize;
const mailClass = require('../../send-email');
const apiHelper = require('../../api-helper');
const appConstants = require("../../constants");
const whatsapp = require("../../send-whatsapp.js");
const firebaseChat = require('../../firebase-chat-connection.js');

const addExperienceBooking = async (payload, token) => {
    try {
        let exps = await readSeqInstance.query(
            "select experience.id as experienceId, experience_booking.booking_user_id, CONCAT(substring(experience.title, 1, 10),'_',DATE_FORMAT(experience_calendar_slots.slot_date,'%d%b%Y'), TIME_FORMAT(experience_calendar_slots.start_time,'_%H_%i')) as tripDateTime, date(experience_calendar_slots.slot_date) slotDate, time(experience_calendar_slots.start_time) startTime, experience.host_id, experience.title, date(experience_booking.created_on) as bookedOn, experience.location, experience_booking.no_of_tickets, experience_booking.id bookingId, experience_calendar_slots.id as calSlotId, experience_calendar_slots.group_id, experience_calendar_slots.group_name FROM experience, experience_calendar_slots, experience_booking where experience.id = experience_calendar_slots.experience_id and experience_calendar_slots.id = experience_booking.calendar_slot_id and experience_booking.id = $1",
            { bind: [payload.bookingId], type: QueryTypes.SELECT }
        );

        //payload.userId = apiHelper.decrypt(payload.userId);
        payload.userId = exps[0].booking_user_id;
        let bookingId = exps[0].booking_user_id;
        let bookedBy = exps[0].booking_user_id;
        let hostBy = exps[0].host_id;
        let bookingName = exps[0].title;
        let bookingDate = exps[0].bookedOn;
        let location = exps[0].location;
        let noOfTickets = exps[0].no_of_tickets;
        let slotDate = exps[0].slotDate;
        let startTime = exps[0].startTime;

        let users = await readSeqInstance.query(
            "select primary_id, user_email, user_full_name, phone_dial_code, user_phone_number from users where primary_id in ($1, $2)",
            { bind: [bookedBy, hostBy], type: QueryTypes.SELECT }
        );

        function getExpUrl(title, expId) {
            let expTitle = (title.replace(/ /g, '-') + '-' + expId + '/').toLocaleLowerCase();
            expTitle = expTitle.replace('//', '/');
            expTitle = expTitle.replace(/[^a-zA-Z0-9-]/g, '');
            if (expTitle.slice(-1) != '/') {
                expTitle += '/';
            }
            return appConstants.BASE_URL + "experiences/" + expTitle;
        }

        let expMedia = await readSeqInstance.query(
            "select media_url,media_type,image_height,image_width,is_default,media_thumbnail from experience_media where media_type = 'image' and experience_id = $1 limit 1",
            { bind: [exps[0].experienceId], type: QueryTypes.SELECT }
        );
        let expMediaUrl = expMedia[0].media_thumbnail;
        let grpIcon = expMedia[0].media_thumbnail;
        if (expMedia[0].media_thumbnail.substr(0, 4) != 'http') {
            expMediaUrl = appConstants.S3_BUCKET + expMedia[0].media_thumbnail;
            grpIcon = appConstants.EXP_IMGSQUARE + expMedia[0].media_thumbnail;
        };
        //REPLACING SPACES IN URL WITH %20 TO RESOLVE THE PATH.
        expMediaUrl = expMediaUrl.replaceAll(' ','%20');

        let travelerName;
        let travelerPhonenumber;
        let travelerEmail;
        let tplData;
        for (var i = 0; i < users.length; i++) {
            if (bookedBy == users[i].primary_id) {
                travelerName = users[i].user_full_name;
                travelerPhonenumber = users[i].user_phone_number;
                travelerEmail = users[i].user_email;
            }
        }

        for (var i = 0; i < users.length; i++) {
            //In Email template traveling on is having a micro value for "when are we going" as "booking_date", so i am passing the slot date in booking_date property to show the correct date.
            tplData = {
                full_name: users[i].user_full_name,
                booking_name: bookingName,
                booking_date: slotDate,
                traveler_name: travelerName,
                traveler_phonenumber: travelerPhonenumber,
                traveler_email: travelerEmail,
                booking_destination: location,
                booking_id: bookingId,
                date: slotDate,
                time: startTime,
                number_travelers: noOfTickets,
                experience_url: getExpUrl(exps[0].title, exps[0].experienceId),
                meeting_instructions_url: "https://beatravelbuddy.com/experiences/orders/:" + payload.bookingId
            }
            if (bookedBy == users[i].primary_id) {
                //Send booking confirmation to user
                if (users[i].user_email) {
                    mailClass.sendEmailWithTemplate(users[i].user_email, tplData, "bookingConfirmationToUser", appConstants.ADMIN_EMAIL);
                }
                if(users[i].user_phone_number){
                    //sending confirmation via whatsapp
                    whatsapp.send_message(users[i].phone_dial_code + users[i].user_phone_number,'experience_purchased_confirmation_buyer', '', {imageUrl: expMediaUrl});
                }
            } else {
                //Send booking confirmation to host
                if (users[i].user_email) {
                    mailClass.sendEmailWithTemplate(users[i].user_email, tplData, "bookingConfirmationToHost", appConstants.ADMIN_EMAIL);
                }
                //sending confirmation via whatsapp
                whatsapp.send_message(users[i].phone_dial_code + users[i].user_phone_number,'experience_purchased_confirmation_host', '', {imageUrl: expMediaUrl});
            }
        }

        if (payload.couponCode) {
            let couponInfo = await readSeqInstance.query(
                "select id from coupon where coupon_code = $1",
                { bind: [payload.couponCode], type: QueryTypes.SELECT }
            );

            let newCouponRedem = {
                user_id: bookedBy,
                coupon_id: couponInfo[0].id,
                redeemed_on: seq.literal('CURDATE()')
            }
            let newCouponRedeemed = await CouponRedem.create(newCouponRedem);
        }

        let groupMembers = [];
        let groupId = '';
        let adminId = exps[0].host_id;
        let tbSupportId = 458192;
        if (exps[0].group_id == null || exps[0].group_id == ''){
            groupMembers.push(adminId);
            groupMembers.push(tbSupportId);
            groupMembers.push(payload.userId);
            //IF THE GROUP IS NOT PRESENT CREATE GROUP
            let groupData = {
                isGroupCreatedProgrammatically: true, 
                createdById: adminId,
                createdBy: 'Travel Buddy Support', 
                groupName: exps[0].tripDateTime, 
                groupProfileUrl: grpIcon, 
                groupLastMessage: "", 
                senderId: "", 
                lastMessageSenderName: "", 
                isDeleted: false, 
                chatType: "group" 
            }
            console.log(groupData);
            let newGrp = await firebaseChat.createUserChat(groupData,token);
            groupId = newGrp.chatArr.chatId;
            const updatedRec = await writeSeqInstance.query(
                "update experience_calendar_slots set group_id = $1, group_name = $2 where id = $3",
                { bind: [groupId, exps[0].tripDateTime, exps[0].calSlotId], type: QueryTypes.UPDATE}
            );
        }else{
            //If group presents add the user to the group.
            groupMembers.push(payload.userId);
            groupId = exps[0].group_id;
        }
        let groupMembersData = { 
            groupId: groupId, 
            newMemberIds: groupMembers, 
            data: { 
                createdById: adminId,
                createdBy: 'Travel Buddy Support', 
                groupName: exps[0].tripDateTime, 
                groupProfileUrl: grpIcon, 
                groupLastMessage: "", 
                senderId: adminId, 
                lastMessageSenderName: "", 
                isDeleted: false, 
                chatType: "group" 
            } 
        };
        console.log('groupMembersData', groupMembersData);
        firebaseChat.addUsersToGroup(groupMembersData, token);

        return { status: "success", "responseCode": 200, object: { experienceId: payload.bookingId } };
    } catch (error) {
        console.log("Error Occured: " + error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addExperienceBooking;
