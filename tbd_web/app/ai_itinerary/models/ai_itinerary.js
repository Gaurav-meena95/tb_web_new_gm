const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const aiItinerary = writeSeqInstance.define(
    "ai_itinerary",
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
        destination: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        month: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        pax_type: {
            type: DataTypes.ENUM('solo','couple','friends','family','group'),
            allowNull: false,
        },
        budget_type: {
            type: DataTypes.ENUM('budget_friendly','medium_budget','high_budget','ai_decision'),
            allowNull: false,
        },
        itinerary: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = aiItinerary;
