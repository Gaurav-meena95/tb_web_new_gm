const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboHotelCodes = writeSeqInstance.define(
    "tbo_hotel_codes",
    {
        hotel_code: {
            type: DataTypes.STRING(50),
            primaryKey: true,
            allowNull: false,
        },
        hotel_name: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        city_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: {
                model: 'tbo_cities',
                key: 'city_code'
            }
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

module.exports = tboHotelCodes; 