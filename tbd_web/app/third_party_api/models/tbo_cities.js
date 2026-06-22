const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboCities = writeSeqInstance.define(
    "tbo_cities",
    {
        city_code: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false,
        },
        city_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        country_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            references: {
                model: 'tbo_countries',
                key: 'country_code'
            }
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

module.exports = tboCities; 