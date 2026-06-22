const axios = require('axios');

// 2Factor.in API Configuration
const TWO_FACTOR_API_KEY = 'c2fce2ab-d4e4-11f0-a6b2-0200cd936042';
const TEMPLATE_NAME = 'otp-auth';
const SENDER_ID = 'TraBud';
const COMPANY_NAME = 'Travel Buddy';
const WEBSITE = 'https://beatravelbuddy.com/';
const BASE_API_URL = 'https://2factor.in/API/V1';



// Account Information (for reference)
const PHONE_NUMBER = '9625251633';
const EMAIL = 'beatravelbuddy@gmail.com';
const SMS_BALANCE = '200.00';
const VOICE_BALANCE = '50.00';
const TRANSACTIONAL_SMS_BALANCE = '200.00';
const PROMOTIONAL_SMS_BALANCE = '0.00';

/**
 * Format phone number for 2Factor.in API
 * Ensures phone number has country code and proper format for SMS endpoint
 * @param {string} phoneNumber - Phone number with or without + prefix
 * @returns {string} - Formatted phone number with country code
 */
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }

  // Remove all spaces
  let formatted = phoneNumber.replace(/\s+/g, '');

  // Remove + prefix if present
  if (formatted.startsWith('+')) {
    formatted = formatted.substring(1);
  }

  // If phone number doesn't start with country code and looks like Indian number (10 digits starting with 6-9)
  // Add India country code (91)
  if (formatted.length === 10 && /^[6-9]/.test(formatted)) {
    formatted = '+91' + formatted;
  }

  // Validate that we have a valid phone number (at least 10 digits)
  if (formatted.length < 10) {
    throw new Error('Invalid phone number format');
  }

  console.log('Formatted phone number: ', formatted);

  return formatted;
}

/**
 * Send OTP to a phone number using 2Factor.in API
 * @param {string} phoneNumber - Phone number in international format (with or without +)
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
async function sendOTP(phoneNumber) {
	console.log('Sending OTP to ', phoneNumber);
  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Construct API URL - 2Factor.in SMS endpoint with template
    // Using /SMS/ endpoint (not /VOICE/) to ensure SMS is sent, not voice call
    // Phone number should include country code and + prefix in URL path
    // Manually encode + as %2B to prevent axios from encoding it incorrectly
	const apiUrl = `${BASE_API_URL}/${TWO_FACTOR_API_KEY}/SMS/${formattedPhone}/AUTOGEN/otp-dlt-sms`;
	  
	// const apiUrl = 'https://2factor.in/API/V1/c2fce2ab-d4e4-11f0-a6b2-0200cd936042/SMS/+919625251633/AUTOGEN/otp-dlt-sms';
    
    console.log('API URL: ', apiUrl);
    console.log('Formatted phone: ', formattedPhone);

    // Make API request
    const response = await axios.get(apiUrl, {
      timeout: 10000, // 10 second timeout
    });

    console.log('API Response: ', response.data);

    // Check if response is successful
    if (response.data && response.data.Status === 'Success') {
      return {
        success: true,
        data: {
          Status: response.data.Status,
          Details: response.data.Details, // This is the session ID
          ...response.data,
        },
      };
    } else {
      // API returned an error response
      return {
        success: false,
        error: response.data?.Details || 'Failed to send OTP',
        message: response.data?.Status || 'Unknown error',
      };
    }
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // API responded with error status
      return {
        success: false,
        error: error.response.data?.Details || 'API request failed',
        message: error.response.data?.Status || `HTTP ${error.response.status}`,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'Network error - no response from server',
        message: 'Please check your internet connection',
      };
    } else if (error.message && error.message.includes('Invalid phone number')) {
      // Phone number validation error
      return {
        success: false,
        error: error.message,
        message: 'Invalid phone number format',
      };
    } else {
      // Other errors
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        message: 'Failed to send OTP',
      };
    }
  }
}

/**
 * Verify OTP using 2Factor.in API
 * @param {string} otpSessionId - Session ID received from sendOTP response
 * @param {string} otpEnteredByUser - OTP value entered by the user
 * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
 */
async function verifyOTP(mobileNumber, otpEnteredByUser) {
  try {
    // Validate inputs
    // if (!otpSessionId) {
    //   return {
    //     success: false,
    //     error: 'Session ID is required',
    //     message: 'Invalid session ID',
    //   };
	  // }
	
	  console.log('Mobile Number: ', mobileNumber);
	  console.log('OTP Entered By User: ', otpEnteredByUser);
	if (!mobileNumber) {
      return {
        success: false,
        error: 'Mobile Number is required',
        message: 'Invalid mobile number',
      };
    }

    if (!otpEnteredByUser) {
      return {
        success: false,
        error: 'OTP is required',
        message: 'Please enter the OTP',
      };
	}
	  console.log('OTP Entered By User: ', otpEnteredByUser);
    // Remove any spaces from OTP
	  const cleanOTP = otpEnteredByUser.replace(/\s+/g, '');
	  console.log('Clean OTP: ', cleanOTP);

    // Construct API URL
	  // const apiUrl = `${BASE_API_URL}/${TWO_FACTOR_API_KEY}/SMS/VERIFY/${otpSessionId}/${cleanOTP}`;
	  
	  //console.log('API URL: ', apiUrl);
	  console.log('Mobile Number: ', mobileNumber);
	  console.log('Clean OTP: ', cleanOTP);
	  const apiUrl = `${BASE_API_URL}/${TWO_FACTOR_API_KEY}/SMS/VERIFY3/${mobileNumber}/${cleanOTP}`;

    // Make API request
    const response = await axios.get(apiUrl, {
      timeout: 10000, // 10 second timeout
    });

    // Check if OTP is matched
	  if (response.data && response.data.Status === 'Success' && response.data.Details === 'OTP Matched') {
		  console.log('OTP verified successfully', {
			Status: response.data.Status,
			Details: response.data.Details,
			...response.data,
		});
      return {
        success: true,
        data: {
          Status: response.data.Status,
          Details: response.data.Details,
          ...response.data,
        },
      };
    } else {
		  // OTP verification failed
		  console.log('OTP verification failed');
      return {
        success: false,
        error: response.data?.Details || 'OTP verification failed',
        message: response.data?.Status || 'OTP did not match',
      };
    }
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // API responded with error status
      return {
        success: false,
        error: error.response.data?.Details || 'API request failed',
        message: error.response.data?.Status || `HTTP ${error.response.status}`,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'Network error - no response from server',
        message: 'Please check your internet connection',
      };
    } else {
      // Other errors
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        message: 'Failed to verify OTP',
      };
    }
  }
}

//sendOTP('+919625251633');

//verifyOTP('+919625251633', '758838');



// Export functions
module.exports = {
  sendOTP,
  verifyOTP,
};
