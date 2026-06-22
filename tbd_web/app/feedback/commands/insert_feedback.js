"use strict";

// =============================================================================
// REFERENCE PORT — settings/insert_feedback.php  ->  Node
// =============================================================================
// This is the worked example for the PHP -> Node migration. Read the PHP source
// at Php-Apis-transffered/tbd_ws/settings/insert_feedback.php side-by-side with
// this file. Every endpoint you migrate should follow this exact shape:
//
//   app/<domain>/commands/<verb>.js   for writes  (INSERT / UPDATE / DELETE)
//   app/<domain>/queries/<verb>.js    for reads   (SELECT)
//
// A command:
//   1. receives a plain object `payload` (NOT req/res — the route handles HTTP)
//   2. validates input and auth (payload.plainUserId)
//   3. does the DB work
//   4. ALWAYS returns the standardised object: { status, responseCode, errorMessage?, object? }
//   5. never throws to the caller — it catches and returns a 500 response object
// =============================================================================

const Feedback = require("../models/feedback");
const appConstants = require("../../constants");

const insertFeedback = async (payload) => {
    try {
        // --- 1. AUTH ---------------------------------------------------------
        // PHP: validateToken($headers); if ($userId == -1) -> 401
        // The route extracts the user via resolveCallerUserId() and passes it
        // in as plainUserId. We re-check it here so the command is safe on its own.
        const userId = Number(payload && payload.plainUserId);
        if (!userId || userId <= 0) {
            return {
                status: "error",
                responseCode: 401,
                errorMessage: "Authorization has been denied for this request.",
            };
        }

        // --- 2. INPUT VALIDATION --------------------------------------------
        // PHP: if (!isset($decoded['feedback'])) -> 406 "Wrong arguments"
        const text = payload && payload.feedback ? String(payload.feedback).trim() : "";
        if (!text) {
            return {
                status: "error",
                responseCode: 406,
                errorMessage: "Wrong arguments",
            };
        }

        // --- 3. DB WRITE -----------------------------------------------------
        // PHP: insert into feedbacks (user_id, feedback) values (...) RETURNING feedback_id
        // We use the Sequelize model. NOTE: we do NOT hand-build SQL strings with
        // the user's text in them (the PHP code used pg_escape_string) — Sequelize
        // parameterises values for us, which removes the SQL-injection risk.
        const row = await Feedback.create({
            user_id: userId,
            feedback: text,
        });
        const feedbackId = Number(row.feedback_id);

        // --- 4. SIDE EFFECTS (port these as a follow-up, do NOT block on them) --
        // The PHP version also:
        //   (a) appends the feedback to a Google Sheet (writeDataToGoogleSheet)
        //   (b) emails support@beatravelbuddy.com (sendMailTemplate, REPORT_FEEDBACK_TO_SUPPORT)
        // Both are fire-and-forget notifications — they must NEVER fail the user's
        // request. When you port them, wrap each in its own try/catch and use the
        // existing helper app/send-email.js. Left as a TODO so the core path stays
        // clean and reviewable. Example shape:
        //
        //   notifySupportOfFeedback({ userId, feedbackId, text }).catch((e) =>
        //       appConstants.sentryObj && appConstants.sentryObj.captureException(e)
        //   );

        // --- 5. STANDARDISED SUCCESS RESPONSE -------------------------------
        // House style returns `status`. The PHP endpoint returned `response`, and
        // the Flutter app keys off `responseCode` for this endpoint. The ROUTE
        // (see routes.js) is responsible for shaping the final wire payload so it
        // stays byte-compatible with what the app already parses. This command
        // just returns the canonical object.
        return {
            status: "success",
            responseCode: 200,
            object: { feedback_id: feedbackId },
        };
    } catch (error) {
        // PHP had no real error path here; the house style sends everything to Sentry.
        console.log(error);
        appConstants.sentryObj && appConstants.sentryObj.captureException(error);
        return {
            status: "error",
            responseCode: 500,
            errorMessage: error.message,
        };
    }
};

module.exports = insertFeedback;
