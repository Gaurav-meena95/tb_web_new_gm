"use strict";

const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const Experience = require("../models/experience");
const Experience_Itinerary = require("../models/experience_itinerary");
const Experience_Calendar_Slots = require("../models/experience_calendar_slots");
const Experience_Media = require("../models/experience_media");
const apiHelper = require('../../api-helper');
const appConstants = require("../../constants");

const addExperience = async (payload) => {
    let seq_transaction = await writeSeqInstance.transaction();
    try {
        //uncomment below code once we get CMS ready to add experience, until then we will upload experiences through POSTMAN
        if (!payload.userId){
            payload.userId = appConstants.LOGGED_IN_USER_ID;
        }

        //INSERTING DATA TO EXPERIENCE MASTER TABLE
        let newExp = {
            title: payload.title,
            category_id: payload.categoryId,
            location_id: payload.locationId,
            location: payload.location,
            host_id: payload.userId,
            content: payload.content,
            expiry_date: payload.expiryDate,
            type: payload.experienceType ? payload.experienceType : 'experience',
            min_pax: payload.minPax ? payload.minPax : 1,
            host_instructions: payload.hostInstructions,
            batch_size: payload.batchSize,
            last_booking_time: payload.lastBookingTime,
            original_pricing: payload.originalPricing?payload.originalPricing:0,
            pricing: payload.pricing,
            currency: payload.currency,
            meeting_instructions: payload.meetingInstructions,
            contact_number: payload.contactNumber,
            country_code: payload.countryCode,
        }
        const experience = await Experience.create(
            newExp,
            {
                transaction: seq_transaction,
            }
        );

        //INSERTING TO ITINERARY TABLE
        let itineraryData = {
            experience_id: experience.id,
            name: payload.itineraryName,
            content: payload.itinerary,
        };
        const experienceItinerary = await Experience_Itinerary.create(
            itineraryData,
            {
                transaction: seq_transaction,
            }
        );

        //INSERTING TO MEDIA TABLE
        for (var i = 0; i < payload.media.length; i++) {
            let expMedia = {
                experience_id: experience.id,
                media_url: payload.media[i].mediaUrl,
                media_type: payload.media[i].mediaType,
                image_height: payload.media[i].imageHeight,
                image_width: payload.media[i].imageWidth,
                is_default: payload.media[i].isDefault,
                media_thumbnail: payload.media[i].mediaThumbnail
            };
            await Experience_Media.create(
                expMedia,
                {
                    transaction: seq_transaction,
                }
            );
        }

        //INSERTING TO CALENDAR SLOTS TABLE
        for (var i = 0; i < payload.calendarSlots.length; i++) {
            let calendarSlot = {
                experience_id: experience.id,
                slot_date: payload.calendarSlots[i].slotDate,
                start_time: payload.calendarSlots[i].startTime,
                end_time: payload.calendarSlots[i].endTime,
                batch_size: payload.calendarSlots[i].batchSize,
            };
            const experienceCalSlots = await Experience_Calendar_Slots.create(
                calendarSlot,
                {
                    transaction: seq_transaction,
                }
            );
        }

        await seq_transaction.commit();
        return { status: "success", "responseCode": 200, object: { experienceId: experience.id } };
    } catch (error) {
        console.log("Error Occured: " + error.message);
        if (seq_transaction) {
            await seq_transaction.rollback();
        }
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addExperience;
