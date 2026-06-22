"use strict";

const { google } = require('googleapis');
const path = require('path');

async function updateGoogleSheetCell(googleSheetId, sheetName, rowIndex, columnLetter, value) {
    // Set the path to the credentials file
    const credentialsPath = path.join(__dirname, '../../app/serviceAccountKey.json');

    // Load the service account key JSON file
    const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Create a client instance for the auth
    const client = await auth.getClient();

    // Instance of the Sheets API
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Set the spreadsheet ID and range
    const spreadsheetId = googleSheetId;
    const range = `${sheetName}!${columnLetter}${rowIndex}`;

    // Create a new value range object with the text to write
    const values = {
        values: [[value]],
    };

    // Write the text to the specified cell in your Google Sheet
    const resource = {
        valueInputOption: 'RAW',
        resource: values,
    };

    try {
        const result = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            ...resource,
        });

        console.log('Updated cell:', result.data);
        return result.data;
    } catch (err) {
        console.error('The API returned an error:', err);
        throw err;
    }
}

module.exports = updateGoogleSheetCell;

