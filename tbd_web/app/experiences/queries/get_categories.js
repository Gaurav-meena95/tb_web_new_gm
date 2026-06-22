"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const { count } = require("console");
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("constants");

const getCategories = async (payload) => {
    try {

        let qry = 'SELECT id, category, image_url as "imageUrl" FROM experience_categories WHERE is_active = 1';
        let allCategories = await readSeqInstance.query(
            qry,
            { type: QueryTypes.SELECT }
        );
        return { status: "success", "responseCode": 200, list: allCategories };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = getCategories;
