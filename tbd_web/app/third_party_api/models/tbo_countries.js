const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboCountries = writeSeqInstance.define(
    "tbo_countries",
    {
        country_code: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
        },
        country_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = tboCountries; 