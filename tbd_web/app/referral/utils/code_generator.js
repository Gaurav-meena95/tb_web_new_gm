"use strict";

const crypto = require("crypto");

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const MAX_ATTEMPTS = 5;

function randomCode() {
    let out = "";
    const bytes = crypto.randomBytes(CODE_LENGTH);
    for (let i = 0; i < CODE_LENGTH; i++) {
        out += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return out;
}

async function generateUniqueCode(isTakenFn) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const candidate = randomCode();
        if (!(await isTakenFn(candidate))) {
            return candidate;
        }
    }
    throw new Error("referral_code_generation_exhausted");
}

module.exports = { generateUniqueCode, randomCode };
