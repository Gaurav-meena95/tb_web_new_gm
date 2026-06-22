"use strict";

require("dotenv").config();
const axios = require("axios");
const fs = require('fs');

class Whatsapp {
    static async send_message(phoneNo, template, type, metaData) {
        const token = await Whatsapp.get_auth_token();

        let jsonfields;
        let name = metaData.name;
        let expDate = metaData.expDate;

        //Image for become verified.
        if (type === "becomeVerified") {
            const image = {
                link: "https://tbd-prod-media.s3.ap-south-1.amazonaws.com/uploads/static/whatsapp/becomeverified.png",
            };
            const header = { image };
            const body = [{ text: name }, { text: expDate }];
            const media = {
                type: "media_template",
                lang_code: "en",
                template_name: template,
                header: [header],
                body: body,
            };
            const fields = { phone: phoneNo, media };
            jsonfields = JSON.stringify(fields);
        } else if (type === "onboardingTP") {
            let video;
            if (template === "onborading_service_provider") {
                video = {
                    link: "https://tbd-prod-media.s3.ap-south-1.amazonaws.com/uploads/posts/sp_promotions.mp4",
                };
            } else if (template === "onboarding_message_travelers") {
                video = {
                    link: "https://tbd-prod-media.s3.ap-south-1.amazonaws.com/uploads/posts/traveller_promotions.mp4",
                };
            }
            const header = { video };
            const media = {
                type: "media_template",
                lang_code: "en",
                template_name: template,
                header: [header],
            };
            const fields = { phone: phoneNo, media };
            jsonfields = JSON.stringify(fields);
        } else if (type === "fileAttachment") {
            const fileUrl = 'https://tbd-prod-media.s3.ap-south-1.amazonaws.com/travel_buddy_cms/invoice.pdf';//metaData.fileUrl; //'./invoice.pdf';// metaData.fileUrl;
            //const fileBuffer = fs.readFileSync(fileUrl);
            //const fileBase64 = fileBuffer.toString('base64');
            const pdfFileAtt = {
                link: fileUrl,
            };
            const header = { document: pdfFileAtt };
            const mimeType = metaData.mimeType; // application/pdf
            const media = {
                type: "document",
                url: fileUrl, // `data:${mimeType};base64,${fileBase64}`,
                mime_type: mimeType,
                template_name: template,
                caption: "Your file caption", // Optional
                header: [header]
            };
            const message = {
                phone: phoneNo,
                media,
            };

            jsonfields = JSON.stringify(message);
            
            console.log('JsonFields With Attachment', jsonfields );
        } else if (template == 'flight_confirmation'){
            const media = {
                type: "media_template",
                lang_code: "en",
                template_name: template
            };
            media.body = metaData.templateParams;
            const fields = { phone: phoneNo, media };
            jsonfields = JSON.stringify(fields);
        } else if (template == 'flight_cancellation_confirmation'){
            const media = {
                type: "media_template",
                lang_code: "en",
                template_name: template
            };
            media.body = metaData.templateParams;
            const fields = { phone: phoneNo, media };
            jsonfields = JSON.stringify(fields);
        } else {
            const image = { link: metaData.imageUrl };
            const header = { image };
            const media = {
                type: "media_template",
                lang_code: "en",
                template_name: template,
                header: [header],
            };

            if (metaData && metaData.templateParams){
                media.body = metaData.templateParams
            }
            console.log('Media data', media);
            const fields = { phone: phoneNo, media };
            jsonfields = JSON.stringify(fields);
        }
        console.log('jsonfields', jsonfields);
        
        const url = "https://apis.rmlconnect.net/wba/v1/messages?source=UI";
        const headers = {
            "content-type": "application/json",
            'accept-language': 'en-US,en;q=0.9',
            'origin': 'https://myaccount.rmlconnect.net',
            'priority': 'u=1, i',
            'referer': 'https://myaccount.rmlconnect.net/',
            "authorization": token,
        };

        try {
            const response = await axios.post(url, jsonfields, { headers });
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    static async get_auth_token() {
        const fields = {
            username: process.env.WHATSAPP_USERNAME,
            password: process.env.WHATSAPP_PASSWORD,
        };
        const url = "https://apis.rmlconnect.net/auth/v1/login/";

        try {
            const response = await axios.post(url, fields);
            const json = response.data;
            return json["JWTAUTH"];
        } catch (error) {
            console.error('Error Occured While Auth' ,  error);
        }
    }
}

module.exports = Whatsapp;
