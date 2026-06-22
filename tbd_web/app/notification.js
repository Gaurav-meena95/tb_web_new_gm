"use strict";

const seqConfig = require("./config/sequelize_config");
const { QueryTypes } = require('sequelize');
const { count } = require("console");
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("./constants");

// push notification required imports
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const events = require('events');

// Create a custom event emitter instance
const messageEmitter = new events.EventEmitter();

messageEmitter.on('pushNotification', async (deviceToken, payload) => { // event listener

    // Helper to check if imageUrl is a valid URL
    const isValidUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const hasValidImage = isValidUrl(payload.imageUrl);

    let message = {
        notification: {
            title: payload.title,
            body: payload.body,
        },
        apns: {
            payload: {
                aps: {
                    'mutable-content': 1
                }
            },
            ...(hasValidImage && {
                fcm_options: {
                    image: payload.imageUrl
                }
            })
        },
        /*android: {
            notification: {
              imageUrl: 'https://d1hphxyq85xv5h.cloudfront.net/fit-in/200x200/uploads/display_pictures/1183939-1670711476117.jpg'
            }
          },*/
        data: payload,
        token: deviceToken,
    };
    if (hasValidImage) {
        message.notification.imageUrl = payload.imageUrl;
    }
    console.log('message : ', message);
    admin.messaging().send(message)
        .then((response) => {
            console.log('Notification sent successfully:', response);
        })
        .catch((error) => {
            console.error('Error sending notification:', error);
        });
});

async function sendNotification(userId, payload) {
    const deviceTokens = await fetchDeviceToken(userId);

    if (deviceTokens) {
        for (const deviceToken of deviceTokens) {
            const userDeviceId = deviceToken.user_device_id;
            if (userDeviceId && userDeviceId.trim() !== '') {
                console.log('device : ', userDeviceId);
                await messageEmitter.emit('pushNotification', userDeviceId, payload);
            }
        }
    }

    return { status: "success", responseCode: 200, message: "Message Sent" };
}

async function fetchDeviceToken(userId) {
    try {
        const qry = "SELECT user_device_id FROM sessions WHERE user_id = $1 ORDER BY session_id DESC";
        const deviceTokens = await readSeqInstance.query(qry, { bind: [userId], type: QueryTypes.SELECT });
        return deviceTokens.length > 0 ? deviceTokens : null;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = sendNotification