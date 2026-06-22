const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const referralRedemptions = writeSeqInstance.define(
    "referral_v2_redemptions",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        referrer_user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        referee_user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
        },
        code: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        referrer_points: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        referee_points: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        source: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        redeemed_at: {
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

module.exports = referralRedemptions;
