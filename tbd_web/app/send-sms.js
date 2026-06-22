const axios = require('axios');

// Function to send OTP
async function sendSMS(dialCode, phone, smsType, metadata) {
  // Trim dialCode and phone
  dialCode = dialCode.replace(/\s/g, '');
  phone = phone.replace(/\s/g, '');

  // USE ROUTEMOBILE FOR INDIAN SMS
  if (dialCode === "+91" || dialCode === "91") {
    const username = "travelbtrans";
    const password = "CrTy4B5t";
    const type = "0";
    const dlr = "1";
    const source = "TraBud";
    const entityid = "1701159168441623775";
    const tempid = "1607100000000154845";
    let message = '';
    console.log()
    if (smsType == 'otp'){
      message = `Dear Buddy, thank you for registering to Travel Buddy App from Terrainspotter. Your one-time password is ${metadata.otp}. Please do not share your OTP with anyone.`;
    }else if (smsType == 'flightBooking'){
      message = `Dear Buddy, your flight booking is confirmed with ${metadata.airline}. Your PNR is ${metadata.pnr}, and Booking ID is ${metadata.bookingId}. The flight departs from ${metadata.departure} on ${metadata.departureTime} and arrives at ${metadata.arrival}.`;
    }
    console.log(message);
    const encodedMessage = encodeURIComponent(message);
    
    const apiUrl = `http://sms6.rmlconnect.net:8080/bulksms/bulksms?username=${username}&password=${password}&type=${type}&dlr=${dlr}&destination=${phone}&source=${source}&message=${encodedMessage}&entityid=${entityid}&tempid=${tempid}`;

    try {
      const response = await axios.get(apiUrl, { httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }) });
      console.log('SMS Sent:', response.data);
    } catch (error) {
      console.error('Error sending SMS:', error.message);
    }

  }/* else {
    // INTERNATIONAL MESSAGE USING ClickSend API via HTTP
    const clickSendUsername = 'vijay@beatravelbuddy.com';  // Your ClickSend username
    const clickSendApiKey = 'D9857D5C-B49C-8C60-E029-F19CDA9BD8F1';  // Your ClickSend API key

    const data = {
      messages: [
        {
          source: 'sdk',
          body: `Dear Buddy, ${otp} is the OneTime password (OTP) for your registration at TravelBuddy. Do not share/disclose it to anyone.`,
          to: `${dialCode}${phone}`
        }
      ]
    };

    try {
      const response = await axios.post('https://rest.clicksend.com/v3/sms/send', data, {
        auth: {
          username: clickSendUsername,
          password: clickSendApiKey
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('International SMS Sent:', response.data);
    } catch (error) {
      console.error('Error sending International SMS:', error.message);
    }
  }*/
}

// Example usage
//sendSMS('+91', '9342333917', '123456');  // Indian SMS
//console.log('sent');
//sendOTP('+1', '9876543210', '123456');   // International SMS

module.exports = sendSMS;