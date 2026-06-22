const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const users = writeSeqInstance.define(
    "users",
    {
        primary_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_full_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone_dial_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        app_version: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_gender: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.NOW
        },
        user_status: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.NOW
        },
        user_type: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.NOW
        },
        profile_creation_time: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = users;
