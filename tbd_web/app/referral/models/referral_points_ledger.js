const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const referralPointsLedger = writeSeqInstance.define(
    "referral_v2_points_ledger",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        delta: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING(48),
            allowNull: false,
        },
        ref_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = referralPointsLedger;
