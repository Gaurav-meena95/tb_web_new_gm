const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboFlightSearchHistory = writeSeqInstance.define(
    "tbo_flight_search_history",
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
        source: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        destination: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        source_airport_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        destination_airport_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        journey_type: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        payload: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        booking_done: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        is_domestic: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        flight_booking_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },        
        booking_stage: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = tboFlightSearchHistory;
