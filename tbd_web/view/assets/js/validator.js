function validateForm(what, data, type) {
	response = {
		validator: {
			response: false,
			message: '',
			where: ''
		},
		request: data
	}

	if (what == 'influencer-post') {
		console.log(data);

		if (data.findInfluencer__location == '') {
			response.validator.message = 'Please enter your location';
			response.validator.where = 'findInfluencer__location';
		}
		else if (data.findBuddy__preferred == '') {
			response.validator.message = 'Please select your preferred kind of influencers';
			response.validator.where = 'findBuddy__preferred';
		}
		else {
			response.validator.response = true;
		}
	}
	else if (what == 'meetups-post') {
		console.log(data);

		if (data.findMeetups__location == '') {
			response.validator.message = 'Please enter your location';
			response.validator.where = 'findMeetups__location';
		}
		else if (data.findMeetups__location_lat == '') {
			response.validator.message = 'Please select a location from the dropdown';
			response.validator.where = 'findMeetups__location';
		}
		else if (data.findMeetups__location_lng == '') {
			response.validator.message = 'Please select a location from the dropdown';
			response.validator.where = 'findMeetups__location';
		}
		else if (data.findMeetups__date == '') {
			response.validator.message = 'Please select a date';
			response.validator.where = 'findMeetups__date';
		}
		//Check if date is valid and not in the pas
		else if (data.findMeetups__date < new Date().toISOString().slice(0, 10)) {
			response.validator.message = 'Please select a valid date';
			response.validator.where = 'findMeetups__date';
		}
		else if (data.findMeetups__description == '') {
			response.validator.message = 'Please enter a description';
			response.validator.where = 'findMeetups__description';
		}
		else if (data.findMeetups__description.length > 1800 && data.findMeetups__description.length < 10) {
			response.validator.message = 'Please describe your meetup in 10 to 200 characters';
			response.validator.where = 'findMeetups__description';
		}
		else if (data.findBuddy__preferred == '') {
			response.validator.message = 'Description should be at least 10 characters';
			response.validator.where = 'findMeetups__description';
		}
		else {
			response.validator.response = true;
		}
	}
	else if (what == 'findBuddy-post') {
		console.log(data);

		if (data.share__location-find == '') {
			response.validator.message = 'Please enter your location';
			response.validator.where = 'share__location-find';
		}
		else if (data.share__location_lat == '') {
			response.validator.message = 'Please select a location from the dropdown';
			response.validator.where = 'share__location-find';
		}
		else if (data.share__location_lng == '') {
			response.validator.message = 'Please select a location from the dropdown';
			response.validator.where = 'share__location-find';
		}
		else if (data.startDate == '') {
			response.validator.message = 'Please select a date';
			response.validator.where = 'startDate';
		}
		//Check if date is valid and not in the past
		else if (data.startDate < new Date().toISOString().slice(0, 10)) {
			response.validator.message = 'Please select a valid date';
			response.validator.where = 'startDate';
		}
		else if (data.findBuddy__description.length > 1800 && data.findBuddy__description.length < 10) {
			response.validator.message = 'Please describe your meetup in 10 to 200 characters';
			response.validator.where = 'findBuddy__description';
		}
		else if (data.findBuddy__preferred == '') {
			response.validator.message = 'Please select your preferred kind of buddies';
			response.validator.where = 'findBuddy__description';
		}
		else {
			response.validator.response = true;
		}
	}
	else if (what == 'ask-post') {
		console.log(data);

		if (data.ask__location == '') {
			response.validator.message = 'Please enter your location';
			response.validator.where = 'ask__location';
		}
		else if (data.ask__location_lat == '') {
			response.validator.message = 'Please select a location from the dropdown';
			response.validator.where = 'ask__location';
		}
		else if (data.ask__location_lng == '') {
			response.validator.message = 'Please select a location from the dropdown';
			response.validator.where = 'ask__location';
		}
		else if (data.ask__description == '') {
			response.validator.message = 'Please enter a description';
			response.validator.where = 'ask__description';
		}
		else if (data.ask__description.length > 1800 && data.ask__description.length < 10) {
			response.validator.message = 'Please describe your meetup in 10 to 200 characters';
			response.validator.where = 'ask__description';
		}
		else {
			response.validator.response = true;
		}
	}
	else if (what == 'share-post') {
		// pond = FilePond.find(document.querySelector('#share__upload'));
		// mediaArray = pond.getFiles();
		if (data.share__location == '') {
			response.validator.message = 'Please enter your location';
			response.validator.where = 'share__location';
		}
		// else if (data.share__description.length > 0 && data.share__description.length > 1800 && data.share__description.length < 10) {
		//     response.validator.message = 'Please describe your trip/post in 10 to 1800 characters';
		//     response.validator.where = 'share__description';
		// }
		else if (data.share__location_lat == '') {
			response.validator.message = 'Please select a location from the dropdown';
			response.validator.where = 'share__location';
		}
		else if (data.share__location_lng == '') {
			response.validator.message = 'Please select a location from the dropdown';
			response.validator.where = 'share__location';
		}

		else if (mediaArray.length == 0 && type == 'addSharePost') {
			response.validator.message = 'Please upload a photo or a video to go along with your post';
			response.validator.where = 'share__media';
		}
			

		else {
			response.validator.response = true;
		}
	}
	else if (what == 'contact-us') {
		console.log(data);
		error = false;

		data.forEach(form_item => {
			if (form_item == '') {
				response.validator.message = 'Please fill in all the fields';
				response.validator.where = form_item.name;

				error = true;
			}
		});

		if (error == false) {
			response.validator.response = true;
		}
	}
	else if (what == 'bookingSummary__signUp') {
		console.log(data);
		error = false;

		//Reverse the array to check the last item first
		data.reverse();

		//Check if key exists
		data.forEach(form_item => {
			if (form_item.value == '') {
				if (form_item.name == 'bookingSummary__otp') {
					response.validator.message = 'Please enter the OTP sent to your phone number';
				}
				else {
					response.validator.message = 'Please fill in all the fields';
				}

				response.validator.where = form_item.name;

				error = true;
			}
		});

		if (error == false) {
			response.validator.response = true;
		}
	}
	else if (what == 'change_password') {
		console.log(data);
		error = false;

		data.forEach(form_item => {
			if (form_item.value == '') {
				if (form_item.name == 'old_pass') {
					response.validator.message = 'Please enter your old password';
				}
				else if (form_item.name == 'new_pass') {
					response.validator.message = 'Please enter your new password';
				}
				else if (form_item.name !== 'confirm_pass') {
					response.validator.message = 'Please enter your new password above and re-enter the same here.';
				}

				response.validator.where = form_item.name;
				error = true;
				return;
			}
		});

		//Check if both passwords match
		if (data[1]['value'] !== data[2]['value']) {
			response.validator.message = 'Please enter your new password above and re-enter the same here.';
			response.validator.where = data[1]['name'];
			error = true;
		}

		if (error == false) {
			response.validator.response = true;
		}
	}
	else if (what.includes('addListings__form')) {
		data = data.reverse();
		whatMinor = what.split('-')[1];
		error = false;

		if (whatMinor == 'page2') {
			data.forEach(form_item => {
				if (form_item.value == '' && (form_item.name == 'addListing-title' || form_item.name == 'addListing-about' || form_item.name == 'addListing-special')) {
					response.validator.message = 'Please fill in all the fields';
					response.validator.where = form_item.name;

					error = true;
					return;
				}
			});
		}
		else if (whatMinor == 'page3') {
			data.forEach(form_item => {
				if (form_item.value == '' && (form_item.name == 'addListing-address-line-1' || form_item.name == 'addListing-address-line-2' || form_item.name == 'addListing-address-area' || form_item.name == 'addListing-address-city' || form_item.name == 'addListing-address-pincode' || form_item.name == 'addListing-address-state' || form_item.name == 'addListing-address-country')) {
					response.validator.message = 'Please fill in all the fields';
					response.validator.where = form_item.name;

					error = true;
					return;
				}
			});
			if (jQuery('#addListing-address-lat').val() == '' && jQuery('#addListing-address-long').val() == '') {
                response.validator.message = 'Please type the address and select from the dropdown';
                response.validator.where = 'addListing-address1';
                error = true;
                return response;
            }
		}
		else if (whatMinor == 'page4') {
			//Check if atleast on item containing addListing-section exists in the array
			if (data.find(item => item.name.includes('addListing-section')) == undefined) {
				response.validator.message = 'Please add at least one section';

				error = true;
			}
			else {
				data.forEach(form_item => {
					if (form_item.name.includes('addListing-section') && form_item.value == '') {
						response.validator.message = 'Please select the Appropriate Types & Facillities Available';
						response.validator.where = form_item.name;

						error = true;
						return;
					}
				});
			}
		}
		else if (whatMinor == 'page7') {
			if (data.find(item => item.name.includes('addLisitngs-pricingAvailable')) == undefined) {
				data.forEach(form_item => {
					if ((form_item.name.includes('addListing-price') || form_item.name.includes('addListing-priceType')) && form_item.value == '') {
						response.validator.message = 'Please fill in the pricing details';
						response.validator.where = form_item.name;

						error = true;
						return;
					}
				});
			}
		}
		console.log(error);
		if (error == false) {
			response.validator.response = true;
		}
	}
	else if (what == 'filters-form') {
		console.log(data);
		error = false;

		ageFrom = '';
		ageTo = '';
		data.forEach(form_item => {
			if (form_item.name == 'ageFromNumber') {
				ageFrom = form_item.value;
			}
			if (form_item.name == 'ageTillNumber') {
				ageTo = form_item.value;
			}
		});

		if (ageFrom != '' && ageTo != '') {
			if (parseInt(ageFrom) > parseInt(ageTo)) {
				response.validator.message = 'Min Age can not be greater than Max Age.';
				response.validator.where = 'ageTillNumber';
				error = true;
			}
		}

		if (error == false) {
			response.validator.response = true;
		}
	}
    else if (what == 'tboFlightsSearch') {
        if (jQuery('#sourceInput').val() == '') {
            jQuery('#sourceInput').addClass('error-highlight');
            toast('Source cannot be empty');
            return;
        } 
        else {
            jQuery('#sourceInput').removeClass('error-highlight');
        }
        
        if (jQuery('#destinationInput').val() == '') {
            jQuery('#destinationInput').addClass('error-highlight');
            toast('Destination cannot be empty');
            return;
        } 
        else {
            jQuery('#destinationInput').removeClass('error-highlight');
        }
        
        if (jQuery('#depDate').val() == '') {
            jQuery('#depDate').addClass('error-highlight');
            toast('Departure date cannot be empty');
            return;
        } 
        else {
            jQuery('#depDate').removeClass('error-highlight');
        }
        
        if (jQuery('#sourceInput').val() == jQuery('#destinationInput').val()) {
            jQuery('#sourceInput').addClass('error-highlight');
            jQuery('#destinationInput').addClass('error-highlight');
            toast('Source and destination cannot be the same');
            return;
        } 
        else {
            jQuery('#sourceInput').removeClass('error-highlight');
            jQuery('#destinationInput').removeClass('error-highlight');
        }
    }
    else if (what == 'tboPaxDetails') {
        let isValidPaxName, passportDetails, contactDetails = false;
		
		if (jQuery('#ticketing__phone').val().length < 10) {
            contactDetails = false;
            jQuery('#ticketing__phone').addClass('error-highlight');
            toast('Please enter a valid phone number');
            return;
        }
		
		// Validating the Pax Details like Name , Date, Gender ( can't be empty so not checking for empty)
		jQuery('.input__container input').each(function() {
			inputElement = jQuery(this);
			inputValue = inputElement.val();
			inputName = inputElement.attr('data-type');
			
			if (!inputElement || !inputName) {
				return;
			}
		
			// Check for first name and last name inputs
			if ((inputName == 'firstname' || inputName == 'lastname') && inputValue.length <= 2) {
				inputElement.addClass('error-highlight');
				toast(`Name should have more than 2 characters`);
				isValidPaxName = false;
				return false;
			}
			else if (inputName == 'date' && inputValue == '') {
				// Allow date input to be empty
				inputElement.addClass('error-highlight');
				toast(`Please fill in the date of birth`);
				isValidPaxName = false;
				return false;
			}
			else {
				inputElement.removeClass('error-highlight');
				isValidPaxName = true;
				
			}
		});
		
		// Validating the Pax Details like Email, Mobile
		jQuery('.contact__details input').each(function () {
			inputElement = jQuery(this);
			inputValue = inputElement.val();
			if (!inputElement) {
				return;
			}
			
			if (inputValue == '') {
				inputElement.addClass('error-highlight');
				toast(`Please fill in all the contact details`);
				contactDetails = false;
				return false;
			}
			else {
				inputElement.removeClass('error-highlight');
				contactDetails = true;
			}
		});
		
		// Validating the GST Details
		if (jQuery('#gstCheckbox').is(':checked')) {
			jQuery('.gst__info input').each(function () {
				let inputElement = jQuery(this);
				let inputValue = inputElement.val();
			
				if (!inputElement) {
					return;
				}
				
				function isValidGSTNumber(gstNumber) {
                    // Regular expression for validating GST number
                    let  gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
                    return gstRegex.test(gstNumber);
                }
                if (jQuery('#gstNumber').val().length != 15 || !isValidGSTNumber(jQuery('#gstNumber').val())) {
                    jQuery('#gstNumber').addClass('error-highlight');
                    toast(`Please enter a valid 15 characters GST number`);
                    gstDetails = false;
                    return false;
                }

				// Check if the input element has the 'required' attribute
				if (inputValue == '') {
					inputElement.addClass('error-highlight');
					toast(`Please fill in all the required GST details`);
					gstDetails = false;
				}
				else {
					inputElement.removeClass('error-highlight');
					gstDetails = true;
				}
			});
		}else {
            gstDetails = true;
        }
		
		// Validating the Passport Details
		if (jQuery('.passport__info').length > 0) {
			
			jQuery('.passport__info input').each(function () {
				inputElement = jQuery(this);
				inputValue = inputElement.val();
				
				if (!inputElement) {
					return;
				}
				
				if (inputValue == '') {
					inputElement.addClass('error-highlight');
					toast(`Please fill in all the passport details`);
					passportDetails = true;
					return false;
				}
				else {
					inputElement.removeClass('error-highlight');
					passportDetails = true;
				}
			});
		}
		else {
			passportDetails = true;
		}
		
		if (isValidPaxName == true && contactDetails == true && passportDetails == true && gstDetails == true) {
			response.validator.response = true;
		}
		
		
    }
	else if (what == '') {
		console.log(data);
	}

	console.log(response);
	return response;
}