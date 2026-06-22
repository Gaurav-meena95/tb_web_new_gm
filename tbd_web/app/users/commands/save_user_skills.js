"use strict";

const UserSkills = require("../models/user_skills");
const appConstants = require("../../constants");

// Persists a user's onboarding skill selection (1-3 numeric skill codes) as a
// single row in user_skills. skill_1 is mandatory; skill_2/skill_3 are filled
// only when present. Re-running upserts so the user can go back and change picks.
const saveUserSkills = async (payload) => {
    try {
        const userId = Number(payload && payload.userId);
        if (!userId || userId <= 0) {
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "unauthorized",
            };
        }

        // Normalise the incoming list: positive integers only, no duplicates,
        // capped at the three columns the table holds.
        const raw = Array.isArray(payload && payload.skills) ? payload.skills : [];
        const skills = [];
        for (const item of raw) {
            const n = Number(item);
            if (!Number.isInteger(n) || n <= 0) continue;
            if (!skills.includes(n)) skills.push(n);
            if (skills.length === 3) break;
        }

        if (skills.length < 1) {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "at least one skill is required",
            };
        }

        const values = {
            user_id: userId,
            skill_1: skills[0],
            skill_2: skills[1] || null,
            skill_3: skills[2] || null,
            updated_at: new Date(),
        };

        const existing = await UserSkills.findOne({ where: { user_id: userId } });
        if (existing) {
            await UserSkills.update(values, { where: { user_id: userId } });
        } else {
            await UserSkills.create(values);
        }

        return {
            status: "success",
            responseCode: 200,
            object: {
                user_id: userId,
                skills,
            },
        };
    } catch (error) {
        console.log(error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        return {
            status: "error",
            responseCode: 500,
            errorMessage: error.message,
        };
    }
};

module.exports = saveUserSkills;
