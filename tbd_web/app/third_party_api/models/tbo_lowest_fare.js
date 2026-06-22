const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const airPortInfo = writeSeqInstance.define(
    "tbo_lowest_fare",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        departure_airport: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        arrival_airport: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lowest_fare: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        booking_type: {
            type: DataTypes.ENUM('flight','hotel'),
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = airPortInfo;
