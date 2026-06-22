"use strict";

require("dotenv").config();
const sendGridKey = process.env.SENDGRID_API_KEY;
const sgMail = require("@sendgrid/mail");
const appConstants = require("./constants");
const dbconnect = require("./db-connect");
sgMail.setApiKey(sendGridKey);
// const apiHelper = require('./api-helper');
// const fs = require("fs");
// const csv = require("csv-parser");

function getEmailSubjAndTpl(emailType) {
    var tplObj = {};
    if (emailType == "bookingConfirmationToUser") {
        tplObj.emailTpl = appConstants.CONFIRMATION_EMAIL_TO_USER;
    }
    if (emailType == "bookingConfirmationToHost") {
        tplObj.emailTpl = appConstants.CONFIRMATION_EMAIL_TO_HOST;
    }
    if (emailType == "bookingCanceledByUser") {
        tplObj.emailTpl = appConstants.CANCELLED_BY_USER_EMAIL_TO_USER;
    }
    if (emailType == "bookingCanceledByUserToHost") {
        tplObj.emailTpl = appConstants.CANCELLED_BY_USER_EMAIL_TO_HOST;
    }
    if (emailType == "flightBookingConfirmation") {
        tplObj.emailTpl = appConstants.FLIGHT_BOOKING_CONFIRMATION;
    }
    if (emailType == "flightBookingFailed") {
        tplObj.emailTpl = appConstants.FLIGHT_BOOKING_FAILED;
    }
    if (emailType == "flightBookingFullRefund") {
        tplObj.emailTpl = appConstants.FLIGHT_BOOKING_FULL_REFUND;
    }
    if (emailType == "flightBookingPartialRefund") {
        tplObj.emailTpl = appConstants.FLIGHT_BOOKING_PARTIAL_REFUND;
    }
    if (emailType == "flightBookingCancellation") {
        tplObj.emailTpl = appConstants.FLIGHT_BOOKING_CANCELLATION;
    }
    if (emailType == "signUpOTP") {
        tplObj.emailTpl = appConstants.SIGNUP_OTP_EMAIL_TEMPLATE_ID;
    }
    if (emailType == "valentine") {
        tplObj.emailTpl = 'd-1a1ce84ab5a04a17b91dbec6dbcb1788';
    }
    if (emailType == "valentine-two") {
        tplObj.emailTpl = 'd-199b3d824af3411a8207d603f5db402c';
    }
    if (emailType == 'dauSpecial') {
        // Users who have used app more than once and are active users
        tplObj.emailTpl = 'd-0272d2c06667490a9d06cf2b9ebd4663';
	}
	if (emailType == 'landPackageBooking') {
		tplObj.emailTpl = 'd-7a6b80e08ece4432827e42f3615c3a2e';
	}
	if (emailType === "discoverLocals") {
		tplObj.emailTpl = "d-b2c1b98354754385b21ce79787317a12";
	}
    
    return tplObj;
}

var sendEmailWithTemplate = function (toEmailAddr,tmpltData,emailType,bccEmail, attachment) {
	var emailTplInfo = getEmailSubjAndTpl(emailType);
    if (!emailTplInfo.emailTpl) {
        return;
    }
    var groupId = 13927;

    var emailObj = {
        from: { email: appConstants.FROM_EMAIL, name: appConstants.FROM_NAME },
        template_id: emailTplInfo.emailTpl,
        subject: emailTplInfo.subject,
        asm: {
            groupId: groupId,
        },
        personalizations: [
            {
                to: { email: toEmailAddr },
                dynamic_template_data: tmpltData,
            },
        ],
    };

    if (bccEmail){
        emailObj.personalizations[0].bcc = {email:bccEmail};
    }

    if (attachment) {
        emailObj.attachments = attachment;
    }

            sgMail.send(emailObj);
};

var sendCustomEmail = function (mailContents) {
    
    const msg = {
        to: mailContents.toEmailAddr, // Change to your recipient
        from: appConstants.FROM_EMAIL, // Change to your verified sender
        subject: mailContents.subject,
        text: mailContents.content,
        html: mailContents.htmlContent
    }
    
    if (mailContents.bccEmail){
        msg.bcc = mailContents.bccEmail;
    }

    sgMail.send(msg);
};

// Function to send bulk emails in batches
var sendBulkEmails = async function (recipients, emailType, batchSize = 100) {
    const emailTplInfo = getEmailSubjAndTpl(emailType);
    if (!emailTplInfo.emailTpl) {
        throw new Error('Invalid email type');
    }

    const totalRecipients = recipients.length;
    for (let i = 0; i < totalRecipients; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const messages = batch.map(email => ({
            to: email,
            from: { email: appConstants.FROM_EMAIL, name: appConstants.FROM_NAME },
            template_id: emailTplInfo.emailTpl,
        }));

        try {
            await sgMail.send(messages);
            console.log(`Batch ${i / batchSize + 1} sent successfully`);
        } catch (error) {
            console.error(`Error sending batch ${i / batchSize + 1}:`, error.response ? error.response.body : error);
        }
    }
};

function chunkArray(items, chunkSize) {
    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
        chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEmail(rawEmail) {
    if (!rawEmail) {
        return null;
    }
    return String(rawEmail).trim().toLowerCase();
}

async function getEmailsFromCsvFiles(csvFilePaths) {
    const allEmails = [];
    const uniqueEmails = new Set();

    for (const csvFilePath of csvFilePaths) {
        const fileEmails = await getEmailsFromCSV(csvFilePath);
        for (const email of fileEmails) {
            const normalizedEmail = normalizeEmail(email);
            if (!normalizedEmail || uniqueEmails.has(normalizedEmail)) {
                continue;
            }
            uniqueEmails.add(normalizedEmail);
            allEmails.push(normalizedEmail);
        }
    }

    return allEmails;
}

async function sendMatchmakingEmailerFromCsv(options) {
	
    const {
        csvFilePaths,
        templateData,
        emailType = "discoverLocals",
        batchSize = 100,
        delayMsBetweenBatches = 300,
        dryRun = false,
    } = options || {};

    if (!Array.isArray(csvFilePaths) || csvFilePaths.length === 0) {
        throw new Error("csvFilePaths is required and must be a non-empty array");
    }

    if (!templateData || typeof templateData !== "object") {
        throw new Error("templateData is required");
    }

    const emailTplInfo = getEmailSubjAndTpl(emailType);
    if (!emailTplInfo.emailTpl) {
        throw new Error(`Invalid emailType: ${emailType}`);
    }

	const emails = await getEmailsFromCsvFiles(csvFilePaths);
	console.log(emails);
    if (emails.length === 0) {
        throw new Error("No valid recipients found in CSV file(s)");
    }

    const batches = chunkArray(emails, batchSize);
    const result = {
        totalRecipients: emails.length,
        totalBatches: batches.length,
        sentCount: 0,
        failedBatches: [],
    };

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const messages = batch.map((email) => ({
            to: email,
            from: { email: appConstants.FROM_EMAIL, name: appConstants.FROM_NAME },
            template_id: emailTplInfo.emailTpl,
            dynamic_template_data: templateData,
            asm: { groupId: 13927 },
        }));

        if (dryRun) {
            console.log(
                `[DRY RUN] Batch ${batchIndex + 1}/${batches.length} prepared with ${batch.length} recipients`
            );
            result.sentCount += batch.length;
        } else {
            try {
                await sgMail.send(messages);
                result.sentCount += batch.length;
                console.log(
                    `Batch ${batchIndex + 1}/${batches.length} sent (${batch.length} recipients)`
                );
            } catch (error) {
                const errBody = error.response ? error.response.body : error;
                result.failedBatches.push({
                    batchNumber: batchIndex + 1,
                    batchSize: batch.length,
                    error: errBody,
                });
                console.error(
                    `Failed batch ${batchIndex + 1}/${batches.length}:`,
                    errBody
                );
            }
        }

        // Small pacing delay to reduce burst traffic against provider limits.
        if (batchIndex < batches.length - 1 && delayMsBetweenBatches > 0) {
            await wait(delayMsBetweenBatches);
        }
    }

    return result;
}

async function sendEmails(payload) {
    //const { startDate, endDate } = payload;
    const emails = await getEmailsFromCSV('/Users/guunszz/Downloads/new-del-fem.csv');
    console.log(emails);
    
    //sendBulkEmails(emails, 'dauSpecial');
    // dbconnect.getUsersEmails(startDate, endDate).then((emails) => {
    //     console.log(emails);
    //     sendBulkEmails(emails, 'valentine-two');
    //     //sendBulkEmails(['pranav@beatravelbuddy.com'], 'valentine-two');
    // });
}
//sendEmails();

async function getEmailsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const emails = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.user_email) {
                    console.log('Email', row.user_email);
                    emails.push(row.user_email);
                }
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                resolve(emails);
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject(error);
            });
    });
}


/* Function to send emailer related to matchmaking.
We will pick the emails from the CSV file and send the email to the users in 
batches of 100. 
First we get the profileId by calling apiHelper.encrypt(userId)*/


/*var i = 0;
for (i = 0; i < 12; i++) {
	var userIdArray = [
		815743,
		1977342,
		1835462,
		247220,
		1205956,
		1112237,
		1772559,
		1926206,
		1902336,
		1977417,
		1387041,
		1844995];
	console.log('profileId', apiHelper.encrypt(userIdArray[i]));
}*/

//console.log('profileId', apiHelper.encrypt('1966085'));


// Matchmaking Emailer

/*async function startMatchmakingEmailer() {
	await sendMatchmakingEmailerFromCsv({
	csvFilePaths: [
	  "/Users/guunszz/Downloads/ttt-email.csv",
	],
	emailType: "discoverLocals",
	batchSize: 100,
	delayMsBetweenBatches: 300,
	templateData: {
	  preview_text: "You've got new matches.",
	  match_count: 12,
	  explore_url: "https://beatravelbuddy.app.link/matchmaking",
	  users: [
		{
			name: "Shraddha Srivastava",
			location: "Ghaziabad, Uttar Pradesh, India",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_pictures/815743-1672301907636.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/ccc941aeea243470195117df1b7ac22fb55e6c1dc2355b419ba97d516f91e882",
			match_score: 100
			},
			{
			name: "Tiffany Rozanna",
			location: "Sri Lanka",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/2954d6bb433dc9b58eaae57a64a659ae81312560814e07e3e51c67d1729c84c1_1779180234652.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/7e0033029918fe9c8467e6e2e166f8bb9a376bce9d49485390031acead78fb7f",
			match_score: 100
			},
			{
			name: "Dipa Singh",
			location: "Kolkata",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/5958885e18567d569699b0f6db6ec0bc7e3ff37da76327b66971121a2f0bdac5_1779136589753.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/de33ac894881e3503de036c0b853da0eb1e8f2ab07fd3e66efe05f209788a060",
			match_score: 100
			},
			{
			name: "Kabita solo",
			location: "Kolkata",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_pictures/247220-1663432691896.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/4ac219b716eb299c79406517db74eb396170662be7d1f7a852e74c60a37848fe",
			match_score: 100
			},
			{
			name: "Skynie",
			location: "Indonesia",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/828ec46e4337ab01eb9e454996d8487dad4c3162aa06029cb6098d6b8daabf7f_1763910750565.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/2532ad12f1558bc8795142e9abd64c80ed2f6d7f4e6c1f879461b7ebeac38380",
			match_score: 100
			},
			{
			name: "Reetu Sharma",
			location: "Gurugram, Haryana, India",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/0c62edc606a9f8950e6ad649b043a071c3a994d2d65c0ef2999d5f54b54dbf7b_1761558361369.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/1283e78ef75b69c27fbdf285a0613c02a41bb416d9db7bdc9f2997e5931700aa",
			match_score: 99
			},
			{
			name: "Sushmita Dhal🌈",
			location: "Jaipur",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_pictures/1112237-1634410062576.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/929155d1790942afb571048310e20221238ef89ee7a81bc2079a52aa2fb730a6",
			match_score: 98
			},
			{
			name: "Mohini",
			location: "Gurgaon",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/77c7be611a32a73e3ee26db7ef01507408d22acf96caf58dac41349dab2183aa_1718269554009.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/4f98ecb89b4a93468124685637a18e3ccb89495697b2a3fae9bfbb7f6fe7b11f",
			match_score: 97
			},
			{
			name: "anushka",
			location: "Delhi, India",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/51f0a2049497e4f2d1857d5c58be407a10920fe94733fe6610281f2e7ebeb4ab_1778084716983.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/ce97d87919cb3e1a1b23dcf859fb0b95eb2cdae1222c480fe24306bc0d340c98",
			match_score: 96
			},
			{
			name: "nidhi",
			location: "Noida",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/324c0624ed7c8729e31acc61127d02f8d8a64db23847f158b6e9b6c560a558d6_1769450567108.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/d21480f40852843169e6cabc85b3e9bafebffabfa647ca918fddcc7ea0d0ddce",
			match_score: 95
			},
			{
			name: "Soniya",
			location: "Chandigarh",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/375b22a38c4e34db71fa9ee5850993293c39d86f13e2a964d775453334f4513c_1779199687242.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/e531e9b71aae7c60b2159193e73fcaaf81d0e2573be5652e8cb89b4066356230",
			match_score: 94
			},
			{
			name: "swarda hiremath",
			location: "Pune",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_pictures/1387041-1657635624451.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/3b991bffc0a72654312b9125bc8e4862a4c4771fb93a166225d2f1652ed2a9bc",
			match_score: 93
			}
	  ],
	  unsubscribe: "https://travelbuddy.app/unsubscribe?email={{email}}",
	},
	dryRun: false,
  });
}*/

//startMatchmakingEmailer();

/*sendEmailWithTemplate(
	"pranav@beatravelbuddy.com",
	{
		preview_text: "You've got 12+ new matches. See who's ready to explore with you →",
		match_count: 12,
		explore_url: "https://beatravelbuddy.app.link/matchmaking",
	  users: [
		{
			name: "POONAM JAIN",
			location: "Ahmedabad",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/81c197de1cdd8a81021e29f86e813443f79f7d5114cfa961683d69011834523b_1772311123260.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/95a7804b8038cb970c7fead6d0595ffaddb776acc545b21a60160b502ee898ef",
			match_score: 100
			},
			{
			name: "Diya",
			location: "Noida",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/55cc69fa10622eee852e2f45738cdeb88f4e11325bb2f17a550b72bdfdcdf086_1777916476517.png?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/6f55944ab860b3192e00722e0cd5fae31610cf30a146aa6ff41f43a68751e2b7",
			match_score: 100
			},
			{
			name: "simar",
			location: "Chandigarh",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/a503fa7df360d2a69d9717ac2d057e46c84908d5fa0c787f2cbfd2879084f944_1777209672700.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/b1fee1db3e2e12917c37bdce2d56099c5ed511badd8ab250c74c0893f9fb175d",
			match_score: 100
			},
			{
			name: "Sangita",
			location: "Pune",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/9c67e829e85909f80ca0813103515446a144b2a2e9af5f2aa2939d23c031b693_1777561828474.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/e6891adfee7723f93bdf4b35138aaf9f78aa7ec8ff6e8f8a0b18e7efb7458a06",
			match_score: 100
			},
			{
			name: "Sona",
			location: "Delhi, India",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/fda5b9f3c2dddbf2a53aebc6124b31bec7ea149106cd490f81d607b835e128cf_1776522077012.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/beac7cad987b9d90798995ed2268472e1685b64f195b0727afb8dd84e081ec41",
			match_score: 100
			},
			{
			name: "Reetu Sharma",
			location: "Gurugram, Haryana, India",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/0c62edc606a9f8950e6ad649b043a071c3a994d2d65c0ef2999d5f54b54dbf7b_1761558361369.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/1283e78ef75b69c27fbdf285a0613c02a41bb416d9db7bdc9f2997e5931700aa",
			match_score: 99
			},
			{
			name: "khushi",
			location: "Delhi, India",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/c7a55ebd3cb7acecd3a035eb5a048f3415c041017f314ec18113decf09c203ba_1775941019178.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/745f4846faa6e7ccb874e04ce4bdb84c82dbbabb2430e2d414372d20d341767b",
			match_score: 98
			},
			{
			name: "Serena Polini",
			location: "Ferrara",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/643d07d53fecec902664b696700730da332da2fcff819e7d3b642b7595c9b039_1777846792219.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/73b34a125d338caab61e148f9a39c51f676156edc4cebd57e2ca2ab11b41ca82",
			match_score: 97
			},
			{
			name: "Kamz L",
			location: "London",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/7fbdfb78d5cacc01b8cb30eb2a463596fc752f6b04a3728242b6ee6804728a7c_1777845623854.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/a9ff05aba8837934556f18811e1df4e0b00f3ba6a3cbc57db83f2d82d3573e48",
			match_score: 96
			},
			{
			name: "Samiksha Singhania",
			location: "Amritsar India",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/3122fdbab4e20f07ead3c552e3dd0e081f1cc79b88bbad8fdb469be6f8e00061_1727206029005.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/abcd85dc26abe716123a52d624ae3bac60f12dd37aa6ea8477aded7c0bb0ec3c",
			match_score: 95
			},
			{
			name: "SWATI URAON",
			location: "Chhattisgarh, India",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/ed3023d356a17e047c22d4a5842c2cb01683bacc9ca09d74ce14ddb878d6f5b5_1776069259182.jpg?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/66635805c5f1681f0d2cda83ccecaa3f42ef642574fff5d0547d1535f19848d5",
			match_score: 94
			},
			{
			name: "Heena",
			location: "Hyderabad",
			image: "https://api.beatravelbuddy.com/api/media/uploads/display_picture/6bcceeac3235ac1c563c0334f4cf2e566f5b5bf7975cf1bd32970481f5a0efd9_1777786432837.png?w=400&h=400&format=webp&quality=85&cb=1",
			deeplink: "https://beatravelbuddy.com/profile/cb78ccb17897668da4ba273006e247f8ddc0a019a440e3aab3037e00ba7439cd",
			match_score: 93
			}
	  ],
	  unsubscribe: "https://travelbuddy.app/unsubscribe?email=your-test-email@example.com",
	},
	"discoverLocals",
);*/

module.exports = {
    sendEmailWithTemplate,
    sendCustomEmail,
    sendEmails,
    sendMatchmakingEmailerFromCsv,
};
