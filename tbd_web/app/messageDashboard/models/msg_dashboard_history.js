const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const msgDashboardHistory = writeSeqInstance.define(
    "msg_dashboard_job_history",
    {
        msg_job_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        msg_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        size_of_cohort: {
            type: DataTypes.MEDIUMINT,
            defaultValue: 0,
        },
        no_of_users_received: {
            type: DataTypes.MEDIUMINT,
            allowNull: false,
        },
        no_of_users_seen: {
            type: DataTypes.MEDIUMINT,
            allowNull: false,
        },
        msg_sent_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        triggered_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        job_status: {
            type: DataTypes.ENUM('initiated', 'inprogress', 'completed', 'failed'),
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = msgDashboardHistory;
