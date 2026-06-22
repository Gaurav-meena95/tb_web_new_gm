const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const experience_calendar_slots = writeSeqInstance.define(
    "experience_calendar_slots",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        experience_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        slot_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        start_time: {
            type: 'TIMESTAMP',
            allowNull: false
        },
        end_time: {
            type: 'TIMESTAMP',
            allowNull: false
        },
        batch_size: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('open', 'freeze', 'cancelled', 'expired', 'completely_booked'),
            allowNull: true
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = experience_calendar_slots;
