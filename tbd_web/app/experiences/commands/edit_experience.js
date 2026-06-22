"use strict";

const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const Experience = require("../models/experience");
const Experience_Itinerary = require("../models/experience_itinerary");
const Experience_Calendar_Slots = require("../models/experience_calendar_slots");
const Experience_Media = require("../models/experience_media");
const Experience_Calendar_Slots_Audit = require("../models/experience_calendar_slots_audit");
const appConstants = require("../../constants");
const utils = require("../../utils");

const editExperience = async (payload) => {
    let seq_transaction = await writeSeqInstance.transaction();
    try {

        //NOTE:
        //EDITING SHOULD BE DONE BY THE SAME PERSON OR BY THE ADMIN
        //uncomment below code once we get CMS ready to add experience, until then we will upload experiences through POSTMAN
        if (!payload.userId) {
            payload.userId = appConstants.LOGGED_IN_USER_ID;
        }

        if (!payload.experienceId) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad Request",
            };
        }

        let isAdmin = await utils.isUserAdmin(payload.userId);
        if (!isAdmin) {
            let foundItem = await Experience.findOne({ where: { host_id: payload.userId, id: payload.experienceId } });

            if (!foundItem) {
                return {
                    status: "error",
                    responseCode: 400,
                    errorMessage: "You can not edit others experience"
                };
            }
        }

        //INSERTING DATA TO EXPERIENCE MASTER TABLE
        let newExp = {}
        if (payload.title)
            newExp["title"] = payload.title;
        if (payload.categoryId)
            newExp["category_id"] = payload.categoryId;
        if (payload.locationId)
            newExp["location_id"] = payload.locationId;
        if (payload.location)
            newExp["location"] = payload.location;
        if (payload.content)
            newExp["content"] = payload.content;
        if (payload.expiryDate)
            newExp["expiry_date"] = payload.expiryDate;
        if (payload.hostInstructions)
            newExp["host_instructions"] = payload.hostInstructions;
        if (payload.batchSize)
            newExp["batch_size"] = payload.batchSize;
        if (payload.lastBookingTime)
            newExp["last_booking_time"] = payload.lastBookingTime;
        if (payload.pricing)
            newExp["pricing"] = payload.pricing;
        if (payload.currency)
            newExp["currency"] = payload.currency;
        if (payload.meetingInstructions)
            newExp["meeting_instructions"] = payload.meetingInstructions;
        if (payload.contactNumber)
            newExp["contact_number"] = payload.contactNumber;
        if (payload.countryCode)
            newExp["country_code"] = payload.countryCode;
        if (payload.experienceType)
            newExp["type"] = payload.experienceType;
        const experience = await Experience.update(
            newExp,
            { where: { id: payload.experienceId } },
            {
                transaction: seq_transaction,
            }
        );

        if (payload.media && payload.media.length > 0) {
            await Experience_Media.destroy({
                where: { experience_id: payload.experienceId },
            }, {
                transaction: seq_transaction,
            });

            //INSERTING TO MEDIA TABLE
            for (var i = 0; i < payload.media.length; i++) {
                let expMedia = {
                    experience_id: payload.experienceId,
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
        }


        //On experience status changed, is been taken care in trigger.
        if (payload.itinerary && (payload.itinerary.length > 0) && payload.itinerary[0].id) {

            //INSERTING TO ITINERARY TABLE
            let itineraryData = {};

            if (payload.itinerary[0].name) {
                itineraryData.name = payload.itinerary[0].name;
            }
            if (payload.itinerary[0].content) {
                itineraryData.content = payload.itinerary[0].content;
            }

            if (Object.keys(itineraryData).length > 0) {
                const experienceItinerary = await Experience_Itinerary.update(
                    itineraryData, {
                    where: { id: payload.itinerary[0].id },
                },
                    {
                        transaction: seq_transaction,
                    }
                );
            }
        }

        if (payload.calendarSlots) {
            //INSERTING TO CALENDAR SLOTS TABLE
            for (var i = 0; i < payload.calendarSlots.length; i++) {
                let calendarSlot = {
                    experience_id: payload.experienceId,
                    slot_date: payload.calendarSlots[i].slotDate,
                    start_time: payload.calendarSlots[i].startTime,
                    end_time: payload.calendarSlots[i].endTime,
                    batch_size: payload.calendarSlots[i].batchSize,
                };
                if (payload.calendarSlots[i].isNew) {
                    await Experience_Calendar_Slots.create(calendarSlot, {
                        transaction: seq_transaction,
                    });
                }
                if (payload.calendarSlots[i].isDeleted) {
                    await Experience_Calendar_Slots.destroy(
                        {
                            where: { id: payload.calendarSlots[i].id },
                        },
                        {
                            transaction: seq_transaction,
                        }
                    );
                }
                if (payload.calendarSlots[i].isUpdated) {
                    let foundItem = await Experience_Calendar_Slots.findOne({ where: { id: payload.calendarSlots[i].id, experience_id: payload.experienceId } });
                    if (foundItem) {
                        if (payload.calendarSlots[i].status && (foundItem.status != payload.calendarSlots[i].status)) {
                            let audit = {
                                experience_calendar_slots_id: payload.calendarSlots[i].id,
                                status: payload.calendarSlots[i].status,
                                comment: payload.calendarSlots[i].comment
                            }
                            await Experience_Calendar_Slots_Audit.create(audit, {
                                transaction: seq_transaction,
                            });
                        }

                        await Experience_Calendar_Slots.update(
                            calendarSlot,
                            {
                                where: { id: payload.calendarSlots[i].id },
                            },
                            {
                                transaction: seq_transaction,
                            }
                        );
                    }
                    //If the status is changed, add an entry to audit table.

                }
            }
        }

        await seq_transaction.commit();
        return {
            status: "success",
            responseCode: 200,
            object: { experienceId: payload.experienceId },
        };
    } catch (error) {
        console.log("Error Occured: " + error.message);
        if (seq_transaction) {
            await seq_transaction.rollback();
        }
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = editExperience;

/*payload example
var expData = {
    title: "first experience",
    category: "trekking",
    locationId: "1",
    location: "Goa",
    userId: 1183939,
    content: "You will have best experience",
    expiryDate: "2023-09-09",
    hostInstructions: "No Instructions",
    batchSize: 10,
    lastBookingTime: 30,
    pricing: 5000,
    currency: "INR",
    meetingInstructions: "Not applicable",
    contactNumber: 5486972148,
    countryCode: "+91",
    itineraryName: "First Itinerary",
    itinerary: "day1: beach, day2: water activities",
    calendarSlots: [
        {
            isNew: true,
            slotDate: "2023-07-09",
            startTime: "2023-07-09 01:01:01.000",
            endTime: "2023-07-11 01:01:01.000",
            batchSize: 10,
        },
        {
            isDeleted: true,
            slotDate: "2023-08-09",
            startTime: "2023-08-09 01:01:01.000",
            endTime: "2023-08-11 01:01:01.000",
            batchSize: 8,
        },
        {
            isUpdated: true,
            slotDate: "2023-08-09",
            startTime: "2023-08-09 01:01:01.000",
            endTime: "2023-08-11 01:01:01.000",
            batchSize: 8,
        }
    ],
};
*/