window.appVerifier = undefined;
function firebaseOTP(state, data) {
	if (state == 'sendSMS') {
		console.log(data);
		submitPhoneNumberAuth(data);
		// This function runs when the 'sign-in-button' is clicked
		// Takes the value from the 'phoneNumber' input and sends SMS to that phone number
		function submitPhoneNumberAuth(data) {
			var container = document.getElementById("recaptcha-container");
			if ((container.childNodes.length === 0) || (window.appVerifier === undefined)) {
				window.appVerifier = new firebase.auth.RecaptchaVerifier(
					"recaptcha-container",
					{
						size: "invisible",
						callback: function (response) {
							console.log(response)
						}
					}
				);
			}
			country_code = manageCountryCode(data.dialCode);
			firebase
				.auth()
				.signInWithPhoneNumber(country_code + data.phoneNumber, window.appVerifier)
				.then(function (confirmationResult) {
					window.confirmationResult = confirmationResult;
					if (data.state !== 'resend') {
						redirect('otp', data);
					}
				})
				.catch(function (error) {
					console.log(error);
					toast('There was an error sending an OTP to this number. Please try a different number or again in sometime.', 6500);
				});
		}
	}
	else if (state == 'verifyOTP') {
		console.log(data);
		submitPhoneNumberAuthCode(data.otp);
		source = data.where;
		if (data.where == 'signUp') {
			dialCode = data.dialCode;
			phoneNumber = data.phoneNumber;
			userName = data.fullName;
			email = data.email;
			password = data.password;
			otpId = data.otpId;
			deviceType = data.deviceType;
		}



		// This function runs when the 'confirm-code' button is clicked
		// Takes the value from the 'code' input and submits the code to verify the phone number
		// Return a user object if the authentication was successful, and auth is complete
		function submitPhoneNumberAuthCode(data) {
			code = Number(data);
			console.log(code);
			confirmationResult
				.confirm(code)
				.then(function (result) {
					/*if (source == 'experience') {
						jQuery('.secondary__tab.otpBody .drawer__back').trigger('click');
					}*/
					if (source == 'signUp') {
						localStorage.setItem('updatedPhoneNumber', phoneNumber);
						localStorage.setItem('updatedCountryCode', dialCode);
						jsInit('signUpOTP', {
							name: userName,
							email: email,
							countryCode: dialCode,
							phone: phoneNumber,
							enteredOTP: code,
							otpId: otpId,
							password: password,
							gender: '0',
							referralCode: '',
							deviceId: '',
							deviceType: deviceType,
							vendorUUID: '',
							deviceUniqueId: '',
							appVersion: appVersion,
						});
					}
					
					
					
					else {
						jsInit('updatePhoneNumber', { phoneNumber: jQuery('#onboarding__phone').val(), dialCode: manageCountryCode(jQuery('#onboarding__countryCode').val()), otp: otp }, 'onboarding');
					}
				})
				.catch(function (error) {
					console.log(error);
					renderOnboarding('updatePhoneNumber', { responseCode: 400, errorMessage: 'OTP is incorrect.' });
				});
		}
	}
	else if (state == 'editProfile_sendSMS') {
		console.log(data);
		submitPhoneNumberAuth(data);
		// This function runs when the 'sign-in-button' is clicked
		// Takes the value from the 'phoneNumber' input and sends SMS to that phone number
		function submitPhoneNumberAuth(data) {
			var appVerifier = window.recaptchaVerifier;
			country_code = manageCountryCode(data.dialCode);
			firebase
				.auth()
				.signInWithPhoneNumber(country_code + data.phoneNumber, appVerifier)
				.then(function (confirmationResult) {
					window.confirmationResult = confirmationResult;
					if (data.state !== 'resend') {
						//redirect('otp', data);
						jQuery('#edit__otp').show();
						jQuery('.edit__row-phone').after('<input type="number" name="editProfile__otp" placeholder="123456" id="edit__otp">');
						jQuery('#editProfile .editVerifyPhone').addClass('verifyOtp').removeClass('verify');
						toast('OTP Sent');
					}
				})
				.catch(function (error) {
					console.log(error);
				});
		}
	}
	else if (state == 'editProfile_verifyOTP') {
		submitPhoneNumberAuthCode(data.otp);
		console.log(data);

		// This function runs when the 'confirm-code' button is clicked
		// Takes the value from the 'code' input and submits the code to verify the phone number
		// Return a user object if the authentication was successful, and auth is complete
		function submitPhoneNumberAuthCode(data) {
			code = Number(data);
			console.log(code);
			confirmationResult
				.confirm(code)
				.then(function (result) {
					jsInit('updatePhoneNumber', { phoneNumber: jQuery('#edit__phone').val(), dialCode: manageCountryCode(jQuery('#editProfile__countryCode').val()), otp: jQuery('#edit__otp').val() }, 'editProfile');
				})
				.catch(function (error) {
					renderOnboarding('updatePhoneNumber', { responseCode: 400, errorMessage: 'OTP is incorrect.' });
				});
		}
	}
}