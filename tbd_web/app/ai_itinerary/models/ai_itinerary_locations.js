const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const aiItineraryLocations = writeSeqInstance.define(
    "ai_itinerary_locations",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        itinerary_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        location_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = aiItineraryLocations;
