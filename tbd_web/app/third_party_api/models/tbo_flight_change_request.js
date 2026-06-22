const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboFlightChangeRequests = writeSeqInstance.define(
    "tbo_flight_change_request",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        flight_booking_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        booking_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        change_request_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        request_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cancellation_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = tboFlightChangeRequests;
