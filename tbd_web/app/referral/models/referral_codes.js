const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const referralCodes = writeSeqInstance.define(
    "referral_v2_codes",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
        },
        code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
        },
        share_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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

module.exports = referralCodes;
