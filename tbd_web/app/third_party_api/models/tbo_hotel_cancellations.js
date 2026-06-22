const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboHotelCancellations = writeSeqInstance.define(
    "tbo_hotels_cancellations",
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
        tbo_hotels_booking_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        booking_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cancellation_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        refunded_amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        cancellation_fee: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = tboHotelCancellations;
