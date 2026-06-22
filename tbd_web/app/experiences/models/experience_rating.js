const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const experienceRating = writeSeqInstance.define(
    "experience_rating",
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
        experience_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        review: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = experienceRating;
