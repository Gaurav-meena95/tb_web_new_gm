"use strict";

const dbConfig = require("../../config/config");
const appConstants = require("../../constants");
const MongoClient = require("mongodb").MongoClient;

const addOrUpdateSession = async (payload) => {
    try {
        // Connection URL and database name
        const url = dbConfig.development.mongoDBInstance.serverURL; // Change this to your MongoDB server URL
        const dbName = dbConfig.development.mongoDBInstance.database;

        const client = new MongoClient(url, { useNewUrlParser: true });

        try {
            await client.connect();
        } catch (err) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Connection to mongodb failed",
            };
        }
        if (!payload.userId){
            payload.userId = appConstants.LOGGED_IN_USER_ID;
        }

        if (!(payload.userId && payload.deviceUniqueId && payload.token)) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request",
            };
        }

        const db = client.db(dbName);
        const sessionsCollection = db.collection("Sessions");

        let result;
        try {
            result = await sessionsCollection.insertOne({
                "user_id": payload.userId,
                "user_device_id": "",
                "device_unique_id": payload.deviceUniqueId,
                "device_type": 1,
                "token": payload.token,
                "creation_date": "",
                "updated_on": ""
            });
            console.log("Student added:", result.ops[0]);
        } catch (err) {
            console.error("Error adding student:", err);
        }

        return {
            status: "success",
            responseCode: 200,
            object: { sessionsId: result },
        };
    } catch (error) {
        console.log(error.message);
        appConstants.sentryObj.captureException(error);
        return { status: "error", responseCode: 400, message: error.message };
    }
};

module.exports = addOrUpdateSession;
