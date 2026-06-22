// const { DataTypes } = require("sequelize");
// const seqConfig = require("../../config/sequelize_config");
// const writeSeqInstance = seqConfig.write_sequelize;

// const cancelledOrders = writeSeqInstance.define(
//     "cancelled_orders",
//     {
//         id: {
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true,
//         },
//         user_id: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//         },
//         order_type: {
//             type: DataTypes.ENUM('premium','experience'),
//             allowNull: false,
//         },
//         selected_option: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         metadata: {
//             type: DataTypes.JSON,
//             allowNull: true
//         }
//     },
//     {
//         timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
//         freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
//     }
// );

//module.exports = cancelledOrders;
const { DataTypes } = require("sequelize");
const seqConfig = require("../../config/sequelize_config");
const writeSeqInstance = seqConfig.write_sequelize;

const cancelledOrders = writeSeqInstance.define(
    "cancelled_orders",
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
        order_type: {
            type: DataTypes.ENUM('premium','experience'),
            allowNull: false,
        },
        selected_option: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        }
    },
    {
        timestamps: false, // don't add the timestamp attributes (updatedAt, createdAt)
        freezeTableName: true //disable the modification of tablenames; By default, sequelize will automatically changes the tablename to plural (e.g experience_rating to experience_ratings)
    }
);

module.exports = cancelledOrders;
