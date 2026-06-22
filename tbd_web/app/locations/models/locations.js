const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const allLocations = writeSeqInstance.define(
    "all_locations",
    {
        location_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        location_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location_lat: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        location_long: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        full_address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        photo_reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        place_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = allLocations;
