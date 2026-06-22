const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const airPortInfo = writeSeqInstance.define(
    "air_port_info",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        airport_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        airport_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lat: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        lng: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        city_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country_name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = airPortInfo;
