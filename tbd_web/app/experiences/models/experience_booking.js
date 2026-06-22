const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const experienceBooking = writeSeqInstance.define(
    "experience_booking",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        calendar_slot_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        booking_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_tickets: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        invoice_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        transaction_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        booking_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        transaction_amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        sub_total: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        discount_amount: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        tax: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        discount_using: {
            type: DataTypes.ENUM('none','premium','coupon'),
            allowNull: true,
        },
        coupon_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        host_confirmed: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = experienceBooking;
