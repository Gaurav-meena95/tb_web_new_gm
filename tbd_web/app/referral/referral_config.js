"use strict";

// Single source of truth for referral economics + the copy shown around it.
// Points come from the SAME env the redeem flow uses (redeem_code.js), so the
// number a user sees can never drift from what they actually receive.
//
// To change WITHOUT an app release: edit these env vars and restart the server.
//   REFERRAL_POINTS_REFERRER   – points the code owner gets        (default 100)
//   REFERRAL_POINTS_REFEREE    – points the new user (code applier) gets (50)
//   REFERRAL_TEXTS_JSON        – optional JSON overriding any text key below.
//                                Use {referrer_points} / {referee_points} as
//                                placeholders; they're filled in server-side.

const pointsRedemption = require("./commands/points_redemption");

const REFERRER_POINTS = Number(process.env.REFERRAL_POINTS_REFERRER || 100);
const REFEREE_POINTS = Number(process.env.REFERRAL_POINTS_REFEREE || 50);

// Default copy. Placeholders {referrer_points}/{referee_points} are substituted
// with the live numbers before being returned to the app.
const DEFAULT_TEXTS = {
    // Shown to the REFEREE (new user applying a code) — they get referee_points.
    onboarding_prompt:
        "Apply your friend's code and get {referee_points} points instantly!",
    onboarding_subtitle:
        "You get {referee_points} points instantly, and your friend earns {referrer_points} — everyone wins.",
    // "How it works" strip on the REFERRER's screen — they earn referrer_points.
    how_it_works_title: "Earn {referrer_points} points per friend",
    how_it_works_reward: "You earn\n{referrer_points} pts",
    reward_summary:
        "You get {referrer_points} points · Your friend gets {referee_points} points",
    how_it_works_body:
        "Share your code. When a friend joins with it, they get {referee_points} points and you earn {referrer_points}.",
    share_subtitle:
        "Invite friends — you earn {referrer_points} pts, they get {referee_points} pts",
    celebration_title: "You earned {referee_points} points!",
    celebration_subtitle: "Welcome to Travel Buddy 🎉",
    home_empty: "Share your code to start earning rewards",
};

function substitute(str) {
    return String(str)
        .replace(/\{referrer_points\}/g, String(REFERRER_POINTS))
        .replace(/\{referee_points\}/g, String(REFEREE_POINTS));
}

function loadTextOverrides() {
    const raw = process.env.REFERRAL_TEXTS_JSON;
    if (!raw || !raw.trim()) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        console.error("[referral] REFERRAL_TEXTS_JSON is not valid JSON; ignoring", e.message);
        return {};
    }
}

// Builds the config the app consumes: live numbers + fully-substituted texts.
function buildReferralConfig() {
    const texts = { ...DEFAULT_TEXTS, ...loadTextOverrides() };
    const resolved = {};
    for (const [key, value] of Object.entries(texts)) {
        resolved[key] = substitute(value);
    }
    return {
        referrer_points: REFERRER_POINTS,
        referee_points: REFEREE_POINTS,
        // Redemption economics so the app preview matches the server-side cap
        // without an app release (the real charge is still computed server-side).
        points_to_inr: pointsRedemption.POINTS_TO_INR,
        max_percent: pointsRedemption.POINTS_MAX_PERCENT,
        max_balance_percent: pointsRedemption.POINTS_MAX_BALANCE_PERCENT,
        texts: resolved,
    };
}

module.exports = { buildReferralConfig, REFERRER_POINTS, REFEREE_POINTS };
