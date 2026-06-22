const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboHotelSearchHistory = writeSeqInstance.define(
    "tbo_hotels_search_history",
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
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_international: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        check_in_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        no_of_days: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        no_of_rooms: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        no_of_pax: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        hotel_category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        payload: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        booking_stage: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = tboHotelSearchHistory;
