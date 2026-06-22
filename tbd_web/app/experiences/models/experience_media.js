const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const experienceMedia = writeSeqInstance.define(
    "experience_media",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        experience_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        media_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        media_type: {
            type: DataTypes.ENUM('image','video','url'),
            allowNull: false,
        },
        image_height: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        image_width: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        is_default: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        media_thumbnail: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_views to experience_viewss)
    }
);

module.exports = experienceMedia;
