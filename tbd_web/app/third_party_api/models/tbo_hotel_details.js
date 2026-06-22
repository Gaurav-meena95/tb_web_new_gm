const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const tboHotelDetails = writeSeqInstance.define(
    "tbo_hotel_details",
    {
        hotel_code: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false,
        },
        hotel_name: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        hotel_facilities: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        attractions: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        images: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        pin_code: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        city_id: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        country_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        phone_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        fax_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        map_coordinates: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        hotel_rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        city_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        country_code: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        check_in_time: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        check_out_time: {
            type: DataTypes.STRING(20),
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

module.exports = tboHotelDetails; 