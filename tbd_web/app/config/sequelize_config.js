"use strict";

const dbConfig = require("./config");
require("dotenv").config();
const { Sequelize } = require("sequelize");

const dbSrc = process.env.ENVIRONMENT;

//preparing singleton object

var sequelize_Singleton = (function () {
    var instance;

    function getSequelizeObj() {
        let dbInstance = dbSrc == "dev" ? "development" : "production";

        // Create a Sequelize instance
        let read_inst = new Sequelize(
            dbConfig[dbInstance].readInstance.database,
            dbConfig[dbInstance].readInstance.username,
            dbConfig[dbInstance].readInstance.password,
            {
                host: dbConfig[dbInstance].readInstance.host,
                port: 5432,
                dialect: dbConfig[dbInstance].readInstance.dialect,
                // max: 50, // Maximum number of clients in the pool
                // min: 5, // Minimum number of clients in the pool (optional, but recommended)
                // idleTimeoutMillis: 30000, // Close idle clients after 30 seconds (optional)
                // connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established (optional)
            }
        );

        let write_inst = new Sequelize(
            dbConfig[dbInstance].writeInstance.database,
            dbConfig[dbInstance].writeInstance.username,
            dbConfig[dbInstance].writeInstance.password,
            {
                host: dbConfig[dbInstance].writeInstance.host,
                port: 5432,
                dialect: dbConfig[dbInstance].writeInstance.dialect,
                // max: 50, // Maximum number of clients in the pool
                // min: 5, // Minimum number of clients in the pool (optional, but recommended)
                // idleTimeoutMillis: 30000, // Close idle clients after 30 seconds (optional)
                // connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established (optional)
            }
        );
        return { readInstance: read_inst, writeInstance: write_inst };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = getSequelizeObj();
            }
            return instance;
        },
    };
})();

const seqConn = sequelize_Singleton.getInstance();
const read_sequelize = seqConn.readInstance;
const write_sequelize = seqConn.writeInstance;

// Test the database connection
async function testConnection() {
    try {
        await read_sequelize.authenticate();
        console.log("Database connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

testConnection();

// Export the Sequelize instance
module.exports = {
    read_sequelize,
    write_sequelize,
    testConnection,
};
