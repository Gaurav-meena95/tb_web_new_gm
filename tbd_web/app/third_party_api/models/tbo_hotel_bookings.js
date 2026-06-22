const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboHotelBookings = writeSeqInstance.define(
    "tbo_hotels_bookings",
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
        search_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        check_in_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        check_out_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        booking_ref_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        confirmation_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        trace_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        invoice_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        middle_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        hotel_name: {
            type: DataTypes.STRING,
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
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fare: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        payment_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        order_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        last_cancellation_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tbo_response: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        booking_info: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        coupon_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        discount: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('success','cancel'),
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = tboHotelBookings;
