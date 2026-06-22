# Luxe Eligibility Check with OTP Verification

## Overview
This feature allows users to check their eligibility for Travel Buddy Luxe membership by entering their phone number. The system verifies the phone number against a Google Sheet, sends an OTP via Firebase, and upon successful verification, adds credits to the user's account.

## Features Implemented

### 1. Google Sheets Integration
- **Read Utility** (`app/utility/read_from_google_sheet.js`)
  - Reads data from Google Sheets
  - Searches for phone numbers in column C
  - Returns row index if phone number is found

- **Update Utility** (`app/utility/update_google_sheet.js`)
  - Updates specific cells in Google Sheets
  - Sets column D flag to "true" when credits are added

### 2. Backend API Endpoints

#### `POST /api/luxe/check-eligibility`
- **Purpose**: Checks if a phone number exists in the Google Sheet
- **Request Body**:
  ```json
  {
    "phoneNumber": "1234567890",
    "dialCode": "+91"
  }
  ```
- **Response**:
  - `success: true` - Phone number found, OTP will be sent
  - `success: false` - Phone number not found

#### `POST /api/luxe/verify-otp`
- **Purpose**: Updates Google Sheet with credits flag after OTP verification
- **Request Body**:
  ```json
  {
    "phoneNumber": "1234567890",
    "dialCode": "+91"
  }
  ```
- **Response**:
  - `success: true` - Credits added successfully (5000)
  - `success: false` - Error updating credits

### 3. Frontend Implementation

#### Modal System
- **Eligibility Check Modal**: User enters phone number and receives OTP
- **Success Modal**: Displays confirmation message with credits information

#### Components Added
- Phone number input with country code selector
- OTP verification input (shown after OTP is sent)
- Error handling and display
- Firebase OTP integration (client-side)

## Google Sheet Configuration

- **Sheet ID**: `455362831`
- **Sheet Name**: `Sheet1`
- **Phone Numbers Column**: Column C
- **Credits Flag Column**: Column D (set to "true" when credits are added)

## Flow Diagram

```
User clicks "Check Eligibility"
    ↓
Modal opens with phone input
    ↓
User enters phone + dial code → Clicks "Request OTP"
    ↓
Backend checks Google Sheet (Column C)
    ↓
If found → Firebase sends OTP to phone
    ↓
User enters OTP → Clicks "Verify OTP"
    ↓
Firebase verifies OTP
    ↓
Backend updates Google Sheet (Column D = "true")
    ↓
Success modal shows: "Rs 5000 credits has been added"
```

## Files Modified/Created

### New Files
1. `app/utility/read_from_google_sheet.js` - Google Sheets read utility
2. `app/utility/update_google_sheet.js` - Google Sheets update utility

### Modified Files
1. `app/routes.js` - Added two new API endpoints
2. `view/luxe-burgundy.html` - Added modal HTML, CSS, and JavaScript

## Dependencies

- **Firebase Auth** (client-side) - For OTP sending and verification
- **Google Sheets API** - For reading and updating sheet data
- **Service Account Key** - Required for Google Sheets API authentication (must be present in `app/serviceAccountKey.json`)

## Firebase Configuration

The Firebase configuration is embedded in the HTML file:
- Project ID: `travelbuddy-174317`
- Uses Firebase Auth for phone number authentication
- Invisible reCAPTCHA verifier for OTP requests

## User Experience

1. User clicks "Check Eligibility" button on the membership section
2. Modal opens asking for phone number and country code
3. User enters details and clicks "Request OTP"
4. System checks Google Sheet - if phone number found, OTP is sent via Firebase
5. User receives OTP on their phone and enters it in the modal
6. Upon successful verification, Google Sheet is updated with flag
7. Success modal displays confirmation message about Rs 5000 credits

## Error Handling

- Phone number not found in Google Sheet
- Firebase OTP sending/verification errors
- Network errors during API calls
- Invalid OTP codes
- All errors are displayed to the user in the modal

## Notes

- Phone numbers are stored with dial code concatenated (e.g., "+911234567890")
- The system normalizes phone numbers for matching (removes spaces, dashes, etc.)
- Credits flag is stored as "true" in column D (not the amount)
- OTP verification is handled entirely client-side using Firebase Auth
- Backend only updates the Google Sheet after successful OTP verification

## Testing

To test the feature:
1. Ensure phone number exists in Google Sheet column C
2. Click "Check Eligibility" button
3. Enter phone number (without dial code if it's already in the sheet with dial code)
4. Select appropriate country code
5. Request OTP
6. Enter OTP received via SMS
7. Verify that column D is updated to "true" in Google Sheet

