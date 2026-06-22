const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const coupons = writeSeqInstance.define(
    "coupon",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        coupon_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        coupon_description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        coupon_type: {
            type: DataTypes.ENUM('money','freemium'),
            allowNull: false,
        },
        discount_value: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        is_discount_in_percentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        max_discount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        max_no_of_redemptions: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        show_up_front: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        valid_from: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        valid_to: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        min_no_tickets: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = coupons;
