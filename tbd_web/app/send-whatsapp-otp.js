const crypto = require("crypto");
const { Pool } = require("pg");

const config = require("./config/config.js");
const Whatsapp = require("./send-whatsapp-new");

const MAX_ATTEMPTS = 5;
const OTP_EXPIRY_SECONDS = 300;

const env = process.env.NODE_ENV || "dev";
const readInstanceIp =
	env === "dev"
		? process.env.DEV_HOST
		: process.env.PROD_HOST_READ;
const writeInstanceIp =
	env === "dev"
		? process.env.DEV_HOST
		: process.env.PROD_HOST_WRITE;

const readPool = new Pool({
	user: config.production.readInstance.username,
	host: readInstanceIp,
	database: config.production.readInstance.database,
	password: config.production.readInstance.password,
	port: 5432,
});

const writePool = new Pool({
	user: config.production.writeInstance.username,
	host: writeInstanceIp,
	database: config.production.writeInstance.database,
	password: config.production.writeInstance.password,
	port: 5432,
});

function normalizeDialCode(dialCode) {
	return String(dialCode || "").trim();
}

function isIndianDialCode(dialCode) {
	const normalized = normalizeDialCode(dialCode).replace(/\+/g, "");
	return normalized === "91";
}

function generateOtp() {
	return String(crypto.randomInt(100000, 1000000));
}

async function sendOTP(payload = {}) {
	const dialCode = normalizeDialCode(payload.dialCode);
	const phoneNumber = String(payload.phoneNumber || "").trim();
	const sourceIp = payload.sourceIp || null;
	const allowIndianForTesting =
		payload.allowIndianForTesting === true ||
		payload.allowIndianForTesting === "true";

	if (!dialCode || !phoneNumber) {
		return {
			success: false,
			responseCode: 400,
			message: "dialCode and phoneNumber are required",
		};
	}

	if (isIndianDialCode(dialCode) && !allowIndianForTesting) {
		return {
			success: false,
			responseCode: 400,
			error: "Use SMS flow for +91",
		};
	}

	const otp = generateOtp();

	try {
		await writePool.query(
			`
			INSERT INTO whatsapp_otp_codes (
				dial_code, phone_number, otp_code, attempts, source_ip,
				expires_at, updated_at
			)
			VALUES (
				$1, $2, $3, 0, $4,
				NOW() + INTERVAL '5 minutes', NOW()
			)
			ON CONFLICT (dial_code, phone_number)
			DO UPDATE SET
				otp_code = EXCLUDED.otp_code,
				attempts = 0,
				expires_at = NOW() + INTERVAL '5 minutes',
				updated_at = NOW(),
				source_ip = EXCLUDED.source_ip
			`,
			[dialCode, phoneNumber, otp, sourceIp],
		);

		// Auth templates with Copy code / Autofill still need button slot values
		// (body {{1}} alone is not enough for Interakt — see button index 0 error).
		await Whatsapp.send_message(
			phoneNumber,
			"register_otp_intl",
			"text",
			{
				countryCode: dialCode,
				languageCode: "en",
				templateParams: [otp],
				buttonValues: { "0": [otp] },
			},
		);

		return {
			success: true,
			responseCode: 200,
			data: { expiresIn: OTP_EXPIRY_SECONDS },
		};
	} catch (error) {
		const errMsg =
			error?.response?.data != null
				? JSON.stringify(error.response.data)
				: error?.message || String(error);
		console.error("Error sending WhatsApp OTP:", errMsg, error);
		try {
			await writePool.query(
				"DELETE FROM whatsapp_otp_codes WHERE dial_code = $1 AND phone_number = $2",
				[dialCode, phoneNumber],
			);
		} catch (deleteError) {
			console.error("Failed to rollback OTP row:", deleteError);
		}

		const isDev = env === "dev";
		return {
			success: false,
			responseCode: 502,
			message: "Failed to send WhatsApp OTP",
			...(isDev && { debug: errMsg }),
		};
	}
}

async function verifyOTP(payload = {}) {
	const dialCode = normalizeDialCode(payload.dialCode);
	const phoneNumber = String(payload.phoneNumber || "").trim();
	const otp = String(payload.otp || "").trim();

	if (!dialCode || !phoneNumber || !otp) {
		return {
			success: false,
			responseCode: 400,
			message: "dialCode, phoneNumber, otp are required",
		};
	}

	try {
		const result = await readPool.query(
			`
			SELECT otp_code, attempts, expires_at
			FROM whatsapp_otp_codes
			WHERE dial_code = $1 AND phone_number = $2
			LIMIT 1
			`,
			[dialCode, phoneNumber],
		);

		if (!result.rows.length) {
			return {
				success: false,
				responseCode: 404,
				message: "OTP not requested",
			};
		}

		const row = result.rows[0];
		const attempts = Number(row.attempts || 0);
		const isExpired = new Date(row.expires_at).getTime() < Date.now();

		if (attempts >= MAX_ATTEMPTS) {
			await writePool.query(
				"DELETE FROM whatsapp_otp_codes WHERE dial_code = $1 AND phone_number = $2",
				[dialCode, phoneNumber],
			);
			return {
				success: false,
				responseCode: 429,
				message: "Too many attempts",
			};
		}

		if (isExpired) {
			await writePool.query(
				"DELETE FROM whatsapp_otp_codes WHERE dial_code = $1 AND phone_number = $2",
				[dialCode, phoneNumber],
			);
			return {
				success: false,
				responseCode: 410,
				message: "OTP expired",
			};
		}

		if (String(row.otp_code) !== otp) {
			await writePool.query(
				`
				UPDATE whatsapp_otp_codes
				SET attempts = attempts + 1, updated_at = NOW()
				WHERE dial_code = $1 AND phone_number = $2
				`,
				[dialCode, phoneNumber],
			);
			return {
				success: false,
				responseCode: 400,
				message: "Invalid OTP",
			};
		}

		await writePool.query(
			"DELETE FROM whatsapp_otp_codes WHERE dial_code = $1 AND phone_number = $2",
			[dialCode, phoneNumber],
		);

		return {
			success: true,
			responseCode: 200,
			data: {
				Status: "Success",
				Details: "OTP Matched",
			},
		};
	} catch (error) {
		console.error("Error verifying WhatsApp OTP:", error);
		return {
			success: false,
			responseCode: 500,
			message: "Failed to verify WhatsApp OTP",
		};
	}
}

module.exports = {
	sendOTP,
	verifyOTP,
};
