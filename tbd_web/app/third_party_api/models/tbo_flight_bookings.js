const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboFlightBookings = writeSeqInstance.define(
    "tbo_flight_bookings",
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
        booking_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pnr: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
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
        airline_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_lcc: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fare: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        basefare: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        tax: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        discount: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        coupon_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        payment_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tbo_response: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        booking_info: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        traveling_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('success','cancel'),
            allowNull: false,
        },
        is_domestic: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = tboFlightBookings;
