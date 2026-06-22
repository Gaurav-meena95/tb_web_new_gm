const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

// NOTE FOR THE INTERN:
// The `feedbacks` table ALREADY EXISTS in Postgres (the PHP API writes to it and
// both PHP + Node share the same database). So there is NO migration to write here —
// we are only mapping a Sequelize model onto an existing table.
//
// Existing columns (mirror the PHP INSERT in settings/insert_feedback.php):
//   feedback_id  -> PK, auto increment
//   user_id      -> who submitted it
//   feedback     -> the text
//   date         -> timestamp (DB default)
//
// `freezeTableName: true` stops Sequelize from pluralising the name, and
// `timestamps: false` stops it from inventing createdAt/updatedAt columns the
// real table does not have. This is the same pattern as app/referral/models/*.js
const feedback = writeSeqInstance.define(
    "feedbacks",
    {
        feedback_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = feedback;
