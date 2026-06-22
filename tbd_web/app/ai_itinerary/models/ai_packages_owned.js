const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const aiPackagesOwned = writeSeqInstance.define(
    "ai_packages_owned",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        package: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        package_start_time:{
            type: DataTypes.DATE,
            allowNull: false,
        },
        package_end_time:{
            type: DataTypes.DATE,
            allowNull: false,
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        invoice_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        no_of_itineraries: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = aiPackagesOwned;
