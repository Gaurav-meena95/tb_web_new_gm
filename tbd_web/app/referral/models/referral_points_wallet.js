const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const referralPointsWallet = writeSeqInstance.define(
    "referral_v2_points_wallet",
    {
        user_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
        },
        balance: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        lifetime_earned: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        updated_at: {
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

module.exports = referralPointsWallet;
