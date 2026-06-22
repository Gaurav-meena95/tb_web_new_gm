const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;
const userAttributes = writeSeqInstance.define(
    "users_attributes",
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
        profile_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        device_type: {
            type: DataTypes.ENUM('android', 'ios', 'web'),
            allowNull: true,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_views to experience_viewss)
    }
);

module.exports = userAttributes;