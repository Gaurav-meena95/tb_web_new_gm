const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const userSkills = writeSeqInstance.define(
    "user_skills",
    {
        user_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
        },
        skill_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        skill_2: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        skill_3: {
            type: DataTypes.INTEGER,
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

module.exports = userSkills;
