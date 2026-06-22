require('dotenv').config();
const readInstanceIp = process.env.NODE_ENV === 'dev' ? process.env.DEV_HOST : process.env.PROD_HOST_READ;
const writeInstanceIp = process.env.NODE_ENV === 'dev' ? process.env.DEV_HOST : process.env.PROD_HOST_WRITE;

console.log("readInstanceIp: ", readInstanceIp);
console.log("writeInstanceIp: ", writeInstanceIp);

module.exports = {
    development: {
        readInstance: {
            username: "postgres",
            password: "ECC&ni3$DF8C",
            database: "travelbuddy",
            host: readInstanceIp,
            dialect: "postgres"
        },
        writeInstance: {
            username: "postgres",
            password: "ECC&ni3$DF8C",
            database: "travelbuddy",
            host: writeInstanceIp,
            dialect: "postgres"
        },
        mongoDBInstance: {
            serverURL: "mongodb+srv://ranjith:ojdiwPpPLnACJrcm@cluster0.wdiwa5q.mongodb.net/",
            username: "ranjith",
            password: "ojdiwPpPLnACJrcm",
            database: "TBD"
        }
    },
    production: {
        readInstance: {
            username: "postgres",
            password: "ECC&ni3$DF8C",
            database: "travelbuddy",
            host: readInstanceIp,
			dialect: "postgres"

        },
        writeInstance: {
            username: "postgres",
            password: "ECC&ni3$DF8C",
            database: "travelbuddy",
            host: writeInstanceIp,
            dialect: "postgres"

        }
    }
};
