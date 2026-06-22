const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;
const userSessions = writeSeqInstance.define(
    "sessions",
    {
        session_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_device_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        device_unique_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        device_type: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_views to experience_viewss)
    }
);

module.exports = userSessions;