/**
 * WhatsApp Template Messaging via Interakt API
 * This module provides functionality to send WhatsApp templates to users
 * using the Interakt API (https://api.interakt.ai/v1/public/message/)
 *
 * The Interakt API allows sending various types of templates:
 * - Text templates with variables
 * - Media templates (image, video, document)
 * - Templates with buttons (URL, phone number, quick replies)
 */

// Load environment variables from .env file
require("dotenv").config();

// Import axios for making HTTP requests
const axios = require("axios");

/**
 * Whatsapp class for sending template messages via Interakt API
 */
class Whatsapp {
	/**
	 * Main method to send WhatsApp templates via Interakt API
	 * This is the core method that handles all template types and configurations
	 *
	 * @param {string} phoneNo - Recipient's phone number without country code
	 * @param {string} template - Template name/code as defined in Interakt dashboard
	 * @param {string} type - Type of template (text, media, fileAttachment, becomeVerified, onboardingTP, etc.)
	 * @param {object} metaData - Template data and parameters
	 * @param {string} [metaData.countryCode] - Country code with + prefix (default: +91)
	 * @param {string} [metaData.callbackData] - Custom data to be returned in webhooks
	 * @param {string} [metaData.campaignId] - Campaign ID for tracking in Interakt dashboard
	 * @param {string} [metaData.languageCode] - Language code for the template (default: en)
	 * @param {Array<string>} [metaData.templateParams] - Values for template variables in body
	 * @param {string} [metaData.imageUrl] - URL of image for media templates
	 * @param {string} [metaData.fileUrl] - URL of document for document templates
	 * @param {string} [metaData.fileName] - Name of document for document templates
	 * @param {string} [metaData.name] - Name parameter for becomeVerified template
	 * @param {string} [metaData.expDate] - Expiry date parameter for becomeVerified template
	 * @param {object} [metaData.buttonValues] - Values for dynamic URL buttons
	 * @param {object} [metaData.buttonPayload] - Payloads for quick reply buttons
	 * @returns {Promise<object>} - API response with message ID and status
	 */
	static async send_message(phoneNo, template, type, metaData) {
		try {
			console.log('Meta Data:', metaData)
			// Extract country code from metaData or use default
			const countryCode = metaData.countryCode || "+91";

			// Prepare the base payload according to Interakt API specifications
			const payload = {
				countryCode: countryCode,
				phoneNumber: phoneNo,
				type: "Template", // Always "Template" for template messages
				callbackData: metaData.callbackData || "sent_from_travel_buddy",
				template: {
					name: template,
					languageCode: metaData.languageCode || "en",
				},
			};

			// Add campaign ID if provided for analytics tracking in Interakt dashboard
			if (metaData.campaignId) {
				payload.campaignId = metaData.campaignId;
			}

			// Handle different template types with specific configurations
			if (type === "becomeVerified") {
				// Image template with name and expiry date variables
				payload.template.headerValues = [
					"https://tbd-prod-media.s3.ap-south-1.amazonaws.com/uploads/static/whatsapp/becomeverified.png",
				];
				payload.template.bodyValues = [metaData.name, metaData.expDate];
			}
			else {
				// Default case - handle generic templates
				// Add header values if provided (for media templates)
				if (metaData.imageUrl) {
					payload.template.headerValues = [metaData.imageUrl];
				}
				if (metaData.fileUrl) {
					payload.template.headerValues = [metaData.fileUrl];
				}
				

				// Add body values if provided (replace empty/null values with "N/A")
				if (metaData.templateParams && Array.isArray(metaData.templateParams)) {
					payload.template.bodyValues = metaData.templateParams.map(
						v => (v === null || v === undefined || v === "") ? "N/A" : v
					);
				}
			}

			// Add button values if provided (for URL or phone number buttons)
			if (metaData.buttonValues) {
				payload.template.buttonValues = metaData.buttonValues;
			}

			// Add button payload if provided (for quick reply buttons)
			if (metaData.buttonPayload) {
				payload.template.buttonPayload = metaData.buttonPayload;
			}
			
			if (metaData.name) {
				payload.template.name = metaData.name;
			}
			
			if (metaData.languageCode) {
				payload.template.languageCode = metaData.languageCode;
			}
			
			if (metaData.fileName) {
				payload.template.fileName = metaData.fileName;
			}


			console.log(
				"Sending template via Interakt API:",
				JSON.stringify(payload)
			);

			// Get API key from environment or use hardcoded value (not recommended for production)
			const apiKey =
				process.env.INTERAKT_API_KEY ||
				"cDRoNms0ZXBIRjl1SENPQzlHMVVnallzdTBSeWdtYnlNZEgtUE5ETkdOVTo=";

			// Interakt API endpoint for sending templates
			const url = "https://api.interakt.ai/v1/public/message/";

			// Set headers with content type and authorization
			const headers = {
				"Content-Type": "application/json",
				Authorization: `Basic ${apiKey}`,
			};

			// Make the API request
			const response = await axios.post(url, payload, { headers });
			console.log("Interakt API response:", response.data);
			return response.data;
		} catch (error) {
			console.error("Error sending template via Interakt API:", error);
			throw error;
		}
	}

	/**
	 * Send a simple text template without media
	 * Convenience method for sending text-only templates
	 *
	 * @param {string} phoneNo - Recipient's phone number without country code
	 * @param {string} countryCode - Country code with + prefix
	 * @param {string} templateName - Template name/code as defined in Interakt dashboard
	 * @param {Array<string>} bodyValues - Values for template variables in body
	 * @returns {Promise<object>} - API response with message ID and status
	 */
	static async send_simple_template(
		phoneNo,
		countryCode,
		templateName,
		bodyValues = []
	) {
		return this.send_message(phoneNo, templateName, "text", {
			countryCode: countryCode,
			templateParams: bodyValues,
		});
	}

	/**
	 * Send a media template (image, video)
	 * Convenience method for sending templates with media headers
	 *
	 * @param {string} phoneNo - Recipient's phone number without country code
	 * @param {string} countryCode - Country code with + prefix
	 * @param {string} templateName - Template name/code as defined in Interakt dashboard
	 * @param {string} mediaUrl - URL of the media file (image or video)
	 * @param {Array<string>} bodyValues - Values for template variables in body
	 * @returns {Promise<object>} - API response with message ID and status
	 */
	static async send_media_template(
		phoneNo,
		countryCode,
		templateName,
		mediaUrl,
		bodyValues = []
	) {
		return this.send_message(phoneNo, templateName, "media", {
			countryCode: countryCode,
			imageUrl: mediaUrl,
			templateParams: bodyValues,
		});
	}

	/**
	 * Send a document template
	 * Convenience method for sending templates with document attachments
	 *
	 * @param {string} phoneNo - Recipient's phone number without country code
	 * @param {string} countryCode - Country code with + prefix
	 * @param {string} templateName - Template name/code as defined in Interakt dashboard
	 * @param {string} documentUrl - URL of the document (PDF, etc.)
	 * @param {string} fileName - Name of the document as it will appear to the recipient
	 * @param {Array<string>} bodyValues - Values for template variables in body
	 * @returns {Promise<object>} - API response with message ID and status
	 */
	static async send_document_template(
		phoneNo,
		countryCode,
		templateName,
		documentUrl,
		fileName,
		bodyValues = []
	) {
		console.log('Body Values Line 239 send-whatsapp-new:', bodyValues)
		return this.send_message(phoneNo, templateName, "fileAttachment", {
			countryCode: countryCode,
			fileUrl: documentUrl,
			fileName: fileName,
			templateParams: bodyValues,
			mimeType: "application/pdf", // Default to PDF, can be overridden
		});
	}

	/**
	 * Send a template with buttons (URL or phone number)
	 * Convenience method for sending templates with dynamic URL or phone buttons
	 *
	 * @param {string} phoneNo - Recipient's phone number without country code
	 * @param {string} countryCode - Country code with + prefix
	 * @param {string} templateName - Template name/code as defined in Interakt dashboard
	 * @param {Array<string>} bodyValues - Values for template variables in body
	 * @param {object} buttonValues - Button values for dynamic URLs or phone numbers
	 *                               Format: { "0": ["https://example.com"], "1": ["+1234567890"] }
	 * @returns {Promise<object>} - API response with message ID and status
	 */
	static async send_template_with_buttons(
		phoneNo,
		countryCode,
		templateName,
		bodyValues = [],
		buttonValues = {}
	) {
		return this.send_message(phoneNo, templateName, "text", {
			countryCode: countryCode,
			templateParams: bodyValues,
			buttonValues: buttonValues,
		});
	}

	/**
	 * Send a template with quick reply buttons
	 * Convenience method for sending templates with quick reply buttons
	 *
	 * @param {string} phoneNo - Recipient's phone number without country code
	 * @param {string} countryCode - Country code with + prefix
	 * @param {string} templateName - Template name/code as defined in Interakt dashboard
	 * @param {Array<string>} bodyValues - Values for template variables in body
	 * @param {object} buttonPayload - Payload for quick reply buttons
	 *                                Format: { "0": ["payload1"], "1": ["payload2"] }
	 * @returns {Promise<object>} - API response with message ID and status
	 */
	static async send_template_with_quick_replies(
		phoneNo,
		countryCode,
		templateId,
		imageUrl,
		userName,
		languageCode = "en",
		fileName = "Find Buddy.jpg",
		bodyValues = [userName],
		
	) {
		if (templateId == 'welcome_message_for_premium' || templateId == 'flight_search') {
			return this.send_message(phoneNo, templateId, "text", {
				countryCode: countryCode,
				name: templateId,
				languageCode: languageCode,
				fileName: fileName,
				templateParams: bodyValues,
				buttonValues: { "0": ['IND500'] },
				imageUrl: imageUrl,
			});
			
		}
		else {
			return this.send_message(phoneNo, templateId, "text", {
				countryCode: countryCode,
				name: templateId,
				languageCode: languageCode,
				fileName: fileName,
				templateParams: bodyValues,
				imageUrl: imageUrl,
			});
		}
	}

	/**
	 * Send a coupon template with copy_code button
	 * Specialized method for sending templates with coupon codes
	 *
	 * @param {string} phoneNo - Recipient's phone number without country code
	 * @param {string} countryCode - Country code with + prefix
	 * @param {string} templateName - Template name/code as defined in Interakt dashboard
	 * @param {string} couponCode - The coupon code that will be copied when button is clicked
	 * @param {Array<string>} bodyValues - Values for template variables in body
	 * @returns {Promise<object>} - API response with message ID and status
	 */
	static async send_coupon_template(
		phoneNo,
		countryCode,
		templateName,
		couponCode,
		bodyValues = []
	) {
		return this.send_message(phoneNo, templateName, "coupon", {
			countryCode: countryCode,
			templateParams: bodyValues,
			couponCode: couponCode,
			buttonValues: {
				0: [couponCode], // Ensure the coupon code is set for the copy_code button
			},
		});
	}
}

// Test the implementation
// Uncomment the following lines to test the implementation

// Example of sending a coupon template
// Whatsapp.send_coupon_template("9625251633", "+91", "baku_itinerary_pdf", "TRAVEL25", ["Hello", "25% off"])
//   .then((response) => {
//     console.log("Coupon Response:", response)
//   })
//   .catch((error) => {
//     console.error("Coupon Error:", error)
// })

// Whatsapp.send_document_template("9625251633", "+91", "baku_itinerary_pdf", "https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Pdf%2FBali_Itinerary.pdf?alt=media&token=1536f9ac-c435-4226-9126-6bdc9a667069", "Bali Itinerary PDF", ['Pranav Jha', 'Bali'])
//   .then((response) => {
//     console.log("Document Response:", response)
//   })
//   .catch((error) => {
//     console.error("Document Error:", error)
//   })

// Example of sending a simple template
// Whatsapp.send_simple_template("9625251633", "+91", "baku_itinerary_pdf", ["Hello", "25% off"])
//   .then((response) => {
//     console.log("Simple Template Response:", response)
//  })
//   .catch((error) => {
//     console.error("Simple Template Error:", error)
//   })

// Example of sending a media template
// Whatsapp.send_media_template("9625251633", "+91", "baku_itinerary_pdf", "https://tbd-prod-media.s3.ap-south-1.amazonaws.com/uploads/posts/baku_itinerary.pdf", ["Hello", "25% off"])
//   .then((response) => {
//     console.log("Media Template Response:", response)
//   })
//   .catch((error) => {
//     console.error("Media Template Error:", error)
//   })

// Example of sending a template with buttons

// Whatsapp.send_template_with_buttons("9625251633", "+91", "baku_itinerary_pdf", ["Hello", "25% off"], { "0": ["https://example.com"], "1": ["+1234567890"] })
//   .then((response) => {
//     console.log("Template with Buttons Response:", response)
//   })
//   .catch((error) => {
//     console.error("Template with Buttons Error:", error)
//   })

// Example of sending a template with quick replies
// Whatsapp.send_template_with_quick_replies("9625251633", "+91", "baku_itinerary_pdf", ["Hello", "25% off"], { "0": ["payload1"], "1": ["payload2"] })
//   .then((response) => {
//     console.log("Template with Quick Replies Response:", response)
//  })
//   .catch((error) => {
//     console.error("Template with Quick Replies Error:", error)
//  })


module.exports = Whatsapp;
