"use strict";

const fs = require('fs');
const path = require('path');
const seqConfig = require("../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const appConstants = require("../constants");

const getXMLsForSitemaps = async (payload) => {
    try {
        let filterQry = '';
        if (payload && payload.startExpId){
            filterQry = ' id >= ' + payload.startExpId;
        }
        let qry = "select id, title from experience WHERE is_deleted = 0" + filterQry;
        let allExperiences = await readSeqInstance.query(
            qry,
            { type: QueryTypes.SELECT }
        );

        let returnObject = [];
        if (allExperiences.length > 0){
            const promises = allExperiences.map(async (experience) => {
                let expMedia = await readSeqInstance.query(
                  "select media_url,media_type,image_height,image_width,is_default,media_thumbnail from experience_media where experience_id = $1",
                  { bind: [experience.id], type: QueryTypes.SELECT }
                );
        
                for (var m = 0; m < expMedia.length; m++) {
                    if (expMedia[m].media_url.substr(0, 4) != 'http') {
                        if (!expMedia[m].media_url.startsWith(appConstants.EXP_IMGCOVERPHOTO)){
                            expMedia[m].media_url = appConstants.EXP_IMGCOVERPHOTO + expMedia[m].media_url;
                        }
                    } 
    
                    if (expMedia[m].media_thumbnail.substr(0, 4) != 'http') {
                        if (!expMedia[m].media_thumbnail.startsWith(appConstants.EXP_THUMBNAIL)){
                            expMedia[m].media_thumbnail = appConstants.EXP_THUMBNAIL + expMedia[m].media_thumbnail;
                        }
                    }
                }
        
                let url = appConstants.BASE_URL + "experiences/" + renderManufacturedUrl(experience);
                let xml = generateXML(url, encodeURI(getImageUrl(expMedia[0].media_url)), experience.title);
        
                return xml;
            });
    
            returnObject = await Promise.all(promises);
        }  
        
        // Read the existing sitemap.xml file
        const sitemapPath = path.join(__dirname, '../../sitemap.xml');
        let existingContent = fs.readFileSync(sitemapPath, 'utf8');

        // Extract existing URLs
        const urlsetStart = existingContent.indexOf('<urlset');
        const urlsetEnd = existingContent.indexOf('</urlset>') + 9;
        let existingUrls = existingContent.substring(urlsetStart, urlsetEnd);

        // Append new URLs
        const newUrls = returnObject.join('\n');
        const updatedContent = existingUrls.replace('</urlset>', `${newUrls}\n</urlset>`);

        // Write the updated content back to the sitemap.xml file
        fs.writeFileSync(sitemapPath, updatedContent, 'utf8');

        return { status: "success", "responseCode": 200, "allExperiences": returnObject };
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, errorMessage: error.message };
    }
};

function getImageUrl(image){
    if (image !== null && image !== undefined && image !== '') {
        if (image) {
            if (image.startsWith('/filters:format(webp)/fit-in/1000x1000/https://res.cloudinary.com/')) {
                image = image.replace('/filters:format(webp)/fit-in/1000x1000/https://res.cloudinary.com/', 'https://res.cloudinary.com/');
            }
        }

        if (image.startsWith('/')) {
            image = image.replace('/', '');
        }

        if (image) {
            if (image.includes('http') == false) {
                image = appConstants.imageBaseUrl + '/' + image;
            }
        }
    }
    return image;
}

function generateXML(url, imagePath, caption) {
    return `<url><loc>${url}</loc><image:image><image:loc>${imagePath}</image:loc><image:caption>${caption}</image:caption></image:image></url>`;
}

function renderManufacturedUrl(experience) {
    let renderItem = '';
    if (experience.title) {
        renderItem = (experience.title.replace(/ /g, '-') + '-' + experience.id + '/').toLocaleLowerCase();
        renderItem = renderItem.replace('//', '/');
        renderItem = renderItem.replace(/[^a-zA-Z0-9-]/g, '');
        if (renderItem.substr(-1) != '/') {
            renderItem += '/';
        }
    }
    return renderItem;
}

module.exports = {
    getXMLsForSitemaps
};