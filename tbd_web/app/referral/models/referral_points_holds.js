const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const referralPointsHolds = writeSeqInstance.define(
    "referral_v2_points_holds",
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
        order_id: {
            type: DataTypes.STRING(64),
            allowNull: true,
            unique: true,
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        discount_rupees: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(16),
            allowNull: false,
            defaultValue: "pending",
        },
        source: {
            type: DataTypes.STRING(32),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        settled_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = referralPointsHolds;
