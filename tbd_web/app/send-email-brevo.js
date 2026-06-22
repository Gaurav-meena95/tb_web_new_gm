require("dotenv").config();
var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY || "";
var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

console.log("Sending email to Pranav");
// Send an email using template ID 2 with dynamic 'name' param
const sendSmtpEmail = {
	sender: { email: "info@beatravelbuddy.com", name: "Your Sender Name" },
	to: [{ email: "pranav@beatravelbuddy.com", name: "Recipient Name" }],
	templateId: 2, // Use template ID 2
	params: {
		name: "Pranav", // Dynamic parameter for the template
	},
};

// apiInstance
// 	.sendTransacEmail(sendSmtpEmail)
// 	.then(function (data) {
// 		console.log("Email sent successfully:", data);
// 	})
// 	.catch(function (error) {
// 		console.error("Error sending email:", error);
// 		if (error.response && error.response.body) {
// 			console.error("Brevo API Error Details:", error.response.body);
// 		}
// 	});
