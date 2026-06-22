const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const couponRedemptions = writeSeqInstance.define(
    "coupon_redemption",
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
        coupon_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        redeemed_on: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = couponRedemptions;
