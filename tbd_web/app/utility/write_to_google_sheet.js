"use strict";

const { google } = require('googleapis');
const path = require('path');

async function writeDataToGoogleSheet(googleSheetId, dataArray, sheetAndRow = "Sheet1!A2") {
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

    // Set the spreadsheet ID and range of cells to write to
    const spreadsheetId = googleSheetId;
    const range = sheetAndRow;

    // Create a new value range object with the text to write
    const values = {
        values: dataArray,
    };

    // Write the text to the specified cell in your Google Sheet
    const resource = {
        valueInputOption: 'RAW',
        resource: values,
    };

    try {
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            ...resource,
        });

        console.log('Appended data:', result.data);
    } catch (err) {
        console.error('The API returned an error:', err);
    }
}

module.exports = writeDataToGoogleSheet;
