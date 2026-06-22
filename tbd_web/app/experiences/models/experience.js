const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const experience = writeSeqInstance.define(
    "experience",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        location_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        host_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        expiry_date:{
            type: DataTypes.DATE,
            allowNull: true   
        },
        host_instructions: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        batch_size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        last_booking_time: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        original_pricing: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pricing: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('experience','package'),
            allowNull: false,
        },
        min_pax: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        meeting_instructions: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = experience;
