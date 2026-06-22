const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const session = require('../models/sessions');
const api_helper = require('../../api-helper');

require('dotenv').config();
const secretKey = process.env.SECRET_KEY;
const encryptSecretKey = process.env.ENCRYPTION_SECRET_KEY;


function getToken(userId) {
    console.log("getToken:" + userId);
    const issueTime = Math.floor(Date.now() / 1000);
    const notBefore = issueTime + 0;
    const expireTime = issueTime + Number(process.env.EXPIRE_IN);

    const tokenPayload = {
        iss: process.env.ISSUER,
        aud: process.env.AUDIENCE,
        iat: issueTime,
        nbf: notBefore,
        exp: expireTime,
        data: {
            id: userId,
        }
    };
    // Encode the token using JWT
    const encodedToken = jwt.sign(tokenPayload, secretKey, { algorithm: 'HS256' });
    console.log("encodedToken:" + encodedToken);
    token = api_helper.encrypt(encodedToken);
    return token;
}

function isTokenValid(token) {
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded.data.id;
    } catch (error) {
        return -1;
    }
}

function validateToken(headers) {
	const token = getTokenFromHeader(headers);
	if (token == null) {
		return -1;
	}

	// Flutter and modern clients send a plain HS256 JWT. Legacy web/API
	// clients send AES-256-CBC hex (iv + ciphertext) wrapping the same JWT.
	// Decrypting a plain JWT throws "Invalid initialization vector" — catch
	// and verify the bearer as a raw JWT.
	let decryptedToken = null;
	try {
		const tokenLength = token.length;
		if (tokenLength > 480) {
			decryptedToken = api_helper.decrypt(api_helper.decrypt(token));
		} else {
			decryptedToken = api_helper.decrypt(token);
		}
	} catch (_e) {
		decryptedToken = null;
	}

	if (decryptedToken == null || decryptedToken === '') {
		return isTokenValid(token);
	}
	return isTokenValid(decryptedToken);
}

function getTokenFromHeader(headers) {
    if (!headers || !headers['authorization'])
        return null;
    const authHeader = headers['authorization'];
    if (!authHeader || authHeader === "") {
        return null;
    } else {
        const arr = authHeader.split(" ");
        if (arr && arr[1]) {
            return arr[1];
        } else {
            return null;
        }
    }
}

async function refreshToken(headers) {
    const oldToken = getTokenFromHeader(headers);
    if (oldToken == null) {
        return null;
    } else {
        newRec = {
            token: newToken
        };
        foundItem = await session.findOne({ where: { token: oldToken } });
        if (foundItem) {
            const newToken = getToken(foundItem[0].user_id);
            sess = await session.update(newRec, { where: { token: oldToken, user_id: foundItem[0].user_id } });
            return newToken;
        }
    }
}

const IV_LENGTH = 16;
/*function api_helper.encrypt(data) {
    const encryptionKey = crypto.createHash('sha256').update(encryptSecretKey).digest();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return iv.toString('hex') + encryptedData;
}

function api_helper.decrypt(encryptedData) {
    const encryptionKey = crypto.createHash('sha256').update(encryptSecretKey).digest();
    const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
    const encryptedText = encryptedData.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}*/

module.exports = { getToken, validateToken, isTokenValid };
