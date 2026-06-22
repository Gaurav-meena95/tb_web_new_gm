const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const experienceBookingStaging = writeSeqInstance.define(
    "experience_booking_staging",
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
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_tickets: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        res_start_time: {
            type: 'TIMESTAMP',
            allowNull: false,
        },
        res_end_time: {
            type: 'TIMESTAMP',
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = experienceBookingStaging;
