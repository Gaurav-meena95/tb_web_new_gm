const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const experienceBookingCancel = writeSeqInstance.define(
    "experience_booking_cancel",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        booking_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        booking_date: {
            type: 'TIMESTAMP',
            allowNull: false,
        },
        cancelled_by: {
            type: DataTypes.ENUM('user', 'host', 'admin'),
            allowNull: false,
        },
        comment: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        refund_amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        is_amount_refunded: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = experienceBookingCancel;
