"use strict";

const { google } = require('googleapis');
const path = require('path');

async function readDataFromGoogleSheet(googleSheetId, sheetName = "Customers", range = null) {
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
    const fullRange = range || `${sheetName}!A:Z`;

    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: fullRange,
        });

        return result.data.values || [];
    } catch (err) {
        console.error('The API returned an error:', err);
        throw err;
    }
}

async function getSheetNames(googleSheetId) {
    try {
        const credentialsPath = path.join(__dirname, '../../app/serviceAccountKey.json');
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const result = await sheets.spreadsheets.get({
            spreadsheetId: googleSheetId,
        });

        return result.data.sheets.map(sheet => ({
            title: sheet.properties.title,
            sheetId: sheet.properties.sheetId
        }));
    } catch (err) {
        console.error('Error getting sheet names:', err);
        throw err;
    }
}

async function findPhoneNumberInSheet(googleSheetId, phoneNumber, sheetName = "Customers", phoneColumn = "C") {
    try {
        // Read all data from the sheet
        const data = await readDataFromGoogleSheet(googleSheetId, sheetName);
        
        if (!data || data.length === 0) {
            return null;
        }

        // Convert column letter to index (C = 2, D = 3, etc.)
        const columnIndex = phoneColumn.charCodeAt(0) - 65; // A=0, B=1, C=2, etc.
        // Username column is one before phone column (B = 1 if phone is C = 2)
        const usernameColumnIndex = columnIndex - 1; // B = 1 if C = 2
        
        // Normalize phone number for comparison (remove spaces, dashes, etc.)
        const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

        // Search through rows (skip header row if exists)
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row && row[columnIndex]) {
                // Normalize the phone number from sheet
                const sheetPhone = String(row[columnIndex]).replace(/[\s\-\(\)]/g, '');
                
                // Check if phone numbers match (with or without dial code)
                if (sheetPhone === normalizedPhone || 
                    sheetPhone.endsWith(normalizedPhone) || 
                    normalizedPhone.endsWith(sheetPhone)) {
                    // Get username from the column before phone number
                    const username = row[usernameColumnIndex] ? String(row[usernameColumnIndex]).trim() : null;
                    
                    // Return object with row index and username
                    return {
                        rowIndex: i + 1, // 1-based for Google Sheets API
                        username: username
                    };
                }
            }
        }

        return null;
    } catch (err) {
        console.error('Error finding phone number in sheet:', err);
        throw err;
    }
}

module.exports = {
    readDataFromGoogleSheet,
    findPhoneNumberInSheet,
    getSheetNames
};

