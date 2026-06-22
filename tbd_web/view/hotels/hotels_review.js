var hotelResult = {};
var passengerPageData = null; // Shared data between passenger details and review pages

function decodeHtmlEntities(str) {
	var textarea = document.createElement('textarea');
	textarea.innerHTML = str;
	return textarea.value;
}

function toggleReviewSection(listId, btnId) {
	var list = document.getElementById(listId);
	var btn = document.getElementById(btnId);
	if (!list || !btn) return;

	var isExpanded = list.classList.contains('review-expanded');
	if (isExpanded) {
		list.classList.remove('review-expanded');
		var hiddenCount = list.querySelectorAll(
			'.review-hidden-item'
		).length;
		var label = listId.includes('amenities')
			? 'amenities'
			: 'conditions';
		btn.innerHTML =
			'<i class="fas fa-chevron-down"></i> View ' +
			hiddenCount +
			' more ' +
			label;
	} else {
		list.classList.add('review-expanded');
		btn.innerHTML =
			'<i class="fas fa-chevron-up"></i> Show less';
	}
}

// =====================================================================
// STEP 1: Passenger Details Page (shown after room selection / prebook)
// =====================================================================
function showPassengerDetailsPage(data) {
	passengerPageData = data;

	var validationInfo = data.object.ValidationInfo || {};
	hotelResult = data.object.HotelResult[0];
	var room = hotelResult.Rooms[0];

	if (!hotelResult || !room) {
		console.error('Invalid hotel data received');
		return;
	}

	var adults = parseInt(jQuery("#adults-value").text()) || 1;
	var children = parseInt(jQuery("#children-value").text()) || 0;
	var numberOfTravelers = adults + children;
	var rooms = parseInt(jQuery("#rooms-value").text()) || 1;

	var childAges = [];
	var foundFromDOM = false;
	for (var i = 1; i <= children; i++) {
		var sel = document.getElementById('child-age-' + i);
		if (sel && sel.value !== '') {
			childAges.push(parseInt(sel.value));
			foundFromDOM = true;
		}
	}
	if (
		!foundFromDOM &&
		data.object &&
		data.object.PaxRooms &&
		data.object.PaxRooms[0] &&
		Array.isArray(data.object.PaxRooms[0].ChildrenAges)
	) {
		childAges = data.object.PaxRooms[0].ChildrenAges;
	}

	var checkinStr =
		jQuery("#checkin-container").data("checkin-date");
	var checkoutStr =
		jQuery("#checkout-container").data("checkout-date");
	var checkInDate = checkinStr
		? new Date(checkinStr)
		: new Date();
	var checkOutDate = checkoutStr
		? new Date(checkoutStr)
		: new Date(checkInDate.getTime() + 86400000);
	var nights = Math.ceil(
		(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
	);

	var hotelImages =
		(window.currentHotelData &&
			window.currentHotelData.Images) ||
		[];
	var primaryImage =
		hotelImages[0] ||
		'https://plus.unsplash.com/premium_photo-1697730390320-8412ee5eae82?q=80&w=2045&auto=format&fit=crop';
	var hotelAddress =
		(window.currentHotelData &&
			window.currentHotelData.Address) ||
		'';

	var formatDate = (date) => {
		return date.toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	var generateGuestForms = () => {
		let formsHtml = '';

		for (let i = 1; i <= numberOfTravelers; i++) {
			var isFirstGuest = i === 1;
			var guestNumber = i;
			var isChild = i > adults;
			var travelerType = isChild ? 'Child' : 'Adult';
			var childAgeText = '';
			if (
				isChild &&
				childAges.length >= i - adults
			) {
				childAgeText = ` <span class='guest-age'>(Age: ${childAges[i - adults - 1]} yrs)</span>`;
			}
			formsHtml += `
				<div class="guest-form-section" data-guest="${guestNumber}" data-type="${travelerType.toLowerCase()}">
					<h3 class="guest-section-title">${travelerType} ${isChild ? i - adults : i}${isFirstGuest ? ' (Primary Guest)' : ''}${childAgeText}</h3>
					
					<div class="guest-row">
						<div class="guest-field w-15">
							<label class="guest-label" for="title-${guestNumber}">Title</label>
							<select id="title-${guestNumber}" required>
								<option value="">Select</option>
								<option value="Mr.">Mr.</option>
								<option value="Mrs.">Mrs.</option>
								<option value="Ms.">Ms.</option>
								<option value="Dr.">Dr.</option>
								${isChild ? '<option value="Master">Master</option><option value="Miss">Miss</option>' : ''}
							</select>
						</div>
						<div class="guest-field">
							<label class="guest-label" for="first-name-${guestNumber}">
								Full name
								${validationInfo.CharLimit ? `<span class="guest-note">(Min: 2, Max: 25 chars)</span>` : ''}
							</label>
							<input 
								type="text" 
								id="first-name-${guestNumber}" 
								placeholder="First name" 
								data-validation="firstname"
								data-guest="${guestNumber}"
								data-type="${travelerType.toLowerCase()}"
								minlength="2"
								maxlength="25"
								required
							/>
						</div>
						<div class="guest-field">
							<label class="guest-label" for="last-name-${guestNumber}">&nbsp;</label>
							<input 
								type="text" 
								id="last-name-${guestNumber}" 
								placeholder="Second name" 
								data-validation="lastname"
								data-guest="${guestNumber}"
								data-type="${travelerType.toLowerCase()}"
								minlength="2"
								maxlength="25"
								required
							/>
						</div>
					</div>

					${validationInfo.PanMandatory && !isChild ? `
					<div class="guest-row">
						<div class="guest-field">
							<label class="guest-label" for="pan-${guestNumber}">
								PAN Number
								<span class="guest-note">(Required for booking)</span>
							</label>
							<input 
								type="text" 
								id="pan-${guestNumber}" 
								placeholder="Enter PAN number" 
								maxlength="10"
								pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
								title="Please enter a valid PAN number (e.g., ABCDE1234F)"
								required
							/>
						</div>
					</div>
					` : ''}

					${validationInfo.PassportMandatory ? `
					<div class="guest-row">
						<div class="guest-field">
							<label class="guest-label" for="passport-number-${guestNumber}">Passport Number</label>
							<input type="text" id="passport-number-${guestNumber}" placeholder="Passport number" required />
						</div>
						<div class="guest-field">
							<label class="guest-label" for="passport-expiry-${guestNumber}">Passport Expiry Date</label>
							<input type="date" id="passport-expiry-${guestNumber}" required />
						</div>
						<div class="guest-field">
							<label class="guest-label" for="passport-issue-${guestNumber}">Passport Issue Date</label>
							<input type="date" id="passport-issue-${guestNumber}" required />
						</div>
					</div>
					` : ''}
					
					${i < numberOfTravelers ? '<hr class="guest-separator" />' : ''}
				</div>
			`;
		}

		return formsHtml;
	};

	var html = `<div class="passenger_details_page" id="passengerDetailsPage">
		<header class="header">
			<button class="review-back-btn" onclick="backToRoomSelectionFromPassenger()">
				<i class="fas fa-arrow-left"></i> Back
			</button>
			<h1 class="header__title">Guest Details</h1>
		</header>

		<!-- Compact trip summary strip -->
		<section class="pax-trip-summary">
			<div class="pax-trip-summary__image">
				<img src="${primaryImage}" alt="Hotel" />
			</div>
			<div class="pax-trip-summary__info">
				<h3>${room.Name[0] || 'Hotel Room'}</h3>
				${hotelAddress ? `<p class="pax-trip-summary__address"><i class="fas fa-map-marker-alt"></i> ${hotelAddress}</p>` : ''}
				<p class="pax-trip-summary__dates">
					${formatDate(checkInDate)} – ${formatDate(checkOutDate)}
					&nbsp;|&nbsp; ${nights} Night${nights > 1 ? 's' : ''}
					&nbsp;|&nbsp; ${rooms} Room${rooms > 1 ? 's' : ''}
					&nbsp;|&nbsp; ${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
				</p>
			</div>
		</section>

		<!-- Store validation info -->
		<div id="validationInfo" data-validation='${JSON.stringify(validationInfo)}' style="display: none;"></div>

		<!-- Contact Information -->
		<div class="checkout-card Guest__Details-box">
			<h2>Guest Details (${numberOfTravelers} Traveler${numberOfTravelers > 1 ? 's' : ''} – ${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}, ${rooms} Room${rooms > 1 ? 's' : ''})</h2>

			<div class="contact-info-section">
				<h3 class="contact-section-title">Contact Information</h3>
				<div class="guest-row">
					<div class="guest-field">
						<label class="guest-label" for="email">
							Email Address
							<span class="guest-note">(Booking voucher will be sent to this email ID)</span>
						</label>
						<input type="email" id="email" placeholder="Email Id" required />
					</div>
					<div class="guest-field">
						<label class="guest-label" for="mobile">Mobile Number</label>
						<div style="display: flex; gap: 8px">
							<div class="guest-field w-15">
								<input type="tel" id="country-code" value="+91" readonly />
							</div>
							<div class="guest-field">
								<input type="tel" id="mobile" placeholder="Contact number" required />
							</div>
						</div>
					</div>
				</div>
			</div>

			<hr class="section-separator" />

			<div id="guestFormContainer">
				${generateGuestForms()}
			</div>

			${validationInfo.CorporateBookingAllowed ? `
			<hr class="section-separator" />
			<div class="corporate-booking-section">
				<div class="guest-row">
					<div class="guest-field">
						<label class="guest-label">
							<input type="checkbox" id="corporate-booking" />
							Corporate Booking
						</label>
					</div>
				</div>
				<div id="corporate-details" style="display: none;">
					<div class="guest-row">
						<div class="guest-field">
							<label class="guest-label" for="corporate-pan">Corporate PAN</label>
							<input type="text" id="corporate-pan" placeholder="Corporate PAN number" maxlength="10" />
						</div>
					</div>
				</div>
			</div>
			` : ''}

			${validationInfo.GSTAllowed ? `
			<hr class="section-separator" />
			<div class="gst-section">
				<div class="guest-row">
					<div class="guest-field">
						<label class="guest-label">
							<input type="checkbox" id="gst-required" />
							GST Details Required
						</label>
					</div>
				</div>
				<div id="gst-details" style="display: none;">
					<div class="guest-row">
						<div class="guest-field">
							<label class="guest-label" for="gst-number">GST Number</label>
							<input type="text" id="gst-number" placeholder="GST Number" maxlength="15" />
						</div>
						<div class="guest-field">
							<label class="guest-label" for="gst-company-name">Company Name</label>
							<input type="text" id="gst-company-name" placeholder="Company Name" />
						</div>
					</div>
					<div class="guest-row">
						<div class="guest-field">
							<label class="guest-label" for="gst-company-address">Company Address</label>
							<input type="text" id="gst-company-address" placeholder="Company Address" />
						</div>
						<div class="guest-field">
							<label class="guest-label" for="gst-company-email">Company Email</label>
							<input type="email" id="gst-company-email" placeholder="Company Email" />
						</div>
					</div>
					<div class="guest-row">
						<div class="guest-field">
							<label class="guest-label" for="gst-company-contact">Company Contact</label>
							<input type="tel" id="gst-company-contact" placeholder="Company Contact Number" />
						</div>
					</div>
				</div>
			</div>
			` : ''}

			${validationInfo.PackageFare ? `
			<hr class="section-separator" />
			<div class="package-fare-section">
				<h3>Package Fare Details</h3>
				${validationInfo.PackageDetailsMandatory ? `
				<div class="guest-row">
					<div class="guest-field">
						<label class="guest-label" for="arrival-transport-type">Arrival Transport Type</label>
						<select id="arrival-transport-type" required>
							<option value="">Select</option>
							<option value="0">Flight</option>
							<option value="1">Surface</option>
						</select>
					</div>
					<div class="guest-field">
						<label class="guest-label" for="arrival-transport-id">Transport Info (Flight No./Vehicle)</label>
						<input type="text" id="arrival-transport-id" placeholder="e.g., AB 777" required />
					</div>
					<div class="guest-field">
						<label class="guest-label" for="arrival-time">Arrival Time</label>
						<input type="datetime-local" id="arrival-time" required />
					</div>
				</div>
				` : ''}
				${validationInfo.DepartureDetailsMandatory ? `
				<div class="guest-row">
					<div class="guest-field">
						<label class="guest-label" for="departure-transport-type">Departure Transport Type</label>
						<select id="departure-transport-type" required>
							<option value="">Select</option>
							<option value="0">Flight</option>
							<option value="1">Surface</option>
						</select>
					</div>
					<div class="guest-field">
						<label class="guest-label" for="departure-transport-id">Transport Info (Flight No./Vehicle)</label>
						<input type="text" id="departure-transport-id" placeholder="e.g., AB 777" required />
					</div>
					<div class="guest-field">
						<label class="guest-label" for="departure-time">Departure Time</label>
						<input type="datetime-local" id="departure-time" required />
					</div>
				</div>
				` : ''}
			</div>
			` : ''}
		</div>

		<div id="validation-messages" class="validation-messages" style="display: none;">
			<div class="validation-error"></div>
		</div>

		<div class="login-promo hidden">
			<div class="promo-text">
				Login to prefill traveller details and get access to secret deals
			</div>
			<div class="div_for-login">
				<button class="login-btn">Login</button>
			</div>
		</div>

		<div class="sticky-pay">
			<button class="sticky-pay__btn" onclick="proceedToReviewPage()">Continue to Review <i class="fas fa-arrow-right"></i></button>
		</div>
	</div>`;

	jQuery('body').append(html);
	jQuery('.container').addClass('hidden');
	jQuery('#reserveWidgetMobile').css('display', 'none');
	jQuery('footer').hide();

	window.scrollTo(0, 0);

	initializeFormValidation();

	if (localStorage.getItem('isGuestUser') === 'true') {
		jQuery('.login-promo').removeClass('hidden');
		jQuery('.login-btn').on('click', function () {
			showHotelLoginModal();
		});
	}
}

// =====================================================================
// Validate passenger details and transition to the Review Page
// =====================================================================
function proceedToReviewPage() {
	var validationInfo = JSON.parse(
		jQuery('#validationInfo').attr('data-validation')
	);

	var adults = parseInt(jQuery("#adults-value").text()) || 1;
	var children =
		parseInt(jQuery("#children-value").text()) || 0;
	var numberOfTravelers = adults + children;
	var rooms = parseInt(jQuery("#rooms-value").text()) || 1;

	var isValid = true;

	// Contact validation
	['email', 'mobile'].forEach(fieldId => {
		var field = jQuery(`#${fieldId}`);
		if (!field.val()) {
			field.addClass('error-highlight');
			isValid = false;
		} else {
			field.removeClass('error-highlight');
		}
	});

	// Traveler fields
	for (let i = 1; i <= numberOfTravelers; i++) {
		var isChild = i > adults;

		[`title-${i}`, `first-name-${i}`, `last-name-${i}`]
			.forEach(fieldId => {
				var field = jQuery(`#${fieldId}`);
				if (!field.val()) {
					field.addClass('error-highlight');
					isValid = false;
				} else {
					field.removeClass('error-highlight');
				}
			});

		if (validationInfo.PanMandatory && !isChild) {
			var panField = jQuery(`#pan-${i}`);
			if (
				!panField.val() ||
				!validatePAN(panField[0])
			) {
				isValid = false;
			}
		}

		if (validationInfo.PassportMandatory) {
			[
				`passport-number-${i}`,
				`passport-expiry-${i}`,
				`passport-issue-${i}`,
			].forEach(fieldId => {
				var field = jQuery(`#${fieldId}`);
				if (!field.val()) {
					field.addClass('error-highlight');
					isValid = false;
				} else {
					field.removeClass('error-highlight');
				}
			});
		}

		var firstNameField =
			jQuery(`#first-name-${i}`)[0];
		var lastNameField =
			jQuery(`#last-name-${i}`)[0];
		if (
			!validateNameField(
				firstNameField,
				validationInfo,
			) ||
			!validateNameField(
				lastNameField,
				validationInfo,
			)
		) {
			isValid = false;
		}
	}

	if (
		!validationInfo.SamePaxNameAllowed &&
		numberOfTravelers > 1
	) {
		var names = [];
		for (let i = 1; i <= numberOfTravelers; i++) {
			var firstName =
				jQuery(`#first-name-${i}`).val();
			var lastName =
				jQuery(`#last-name-${i}`).val();
			var fullName =
				`${firstName} ${lastName}`.trim();

			if (names.includes(fullName)) {
				showValidationError(
					'Duplicate names are not allowed for different travelers',
				);
				isValid = false;
				break;
			}
			names.push(fullName);
		}
	}

	if (
		validationInfo.PanMandatory &&
		adults > 1
	) {
		var panNumbers = [];
		var duplicatePAN = false;
		for (let i = 1; i <= adults; i++) {
			var panField = jQuery(`#pan-${i}`);
			var panValue = panField.val();
			if (panValue) {
				if (
					panNumbers.includes(
						panValue.toUpperCase(),
					)
				) {
					panField.addClass(
						'error-highlight',
					);
					duplicatePAN = true;
				} else {
					panNumbers.push(
						panValue.toUpperCase(),
					);
					panField.removeClass(
						'error-highlight',
					);
				}
			}
		}
		if (duplicatePAN) {
			showValidationError(
				'Same PAN card number cannot be used for multiple travelers.',
			);
			isValid = false;
		}
	}

	if (!isValid) {
		showValidationError(
			'Please correct the errors above before proceeding',
		);
		return;
	}

	// Collect passenger data from form so it survives the DOM swap
	var collectedPassengers = [];
	for (let i = 1; i <= numberOfTravelers; i++) {
		var isChild = i > adults;
		collectedPassengers.push({
			index: i,
			title: jQuery(`#title-${i}`).val(),
			firstName: jQuery(`#first-name-${i}`).val(),
			lastName: jQuery(`#last-name-${i}`).val(),
			pan: jQuery(`#pan-${i}`).val() || null,
			passportNumber:
				jQuery(`#passport-number-${i}`).val() ||
				null,
			passportExpiry:
				jQuery(`#passport-expiry-${i}`).val() ||
				null,
			passportIssue:
				jQuery(`#passport-issue-${i}`).val() ||
				null,
			isChild: isChild,
			type: isChild ? 'Child' : 'Adult',
		});
	}

	var contactInfo = {
		email: jQuery('#email').val(),
		mobile: jQuery('#mobile').val(),
		dialCode:
			jQuery('#country-code').val() || '+91',
	};

	var gstInfo = null;
	if (
		validationInfo.GSTAllowed &&
		jQuery('#gst-required').is(':checked')
	) {
		gstInfo = {
			GSTNumber:
				jQuery('#gst-number').val() || null,
			GSTCompanyName:
				jQuery('#gst-company-name').val() ||
				null,
			GSTCompanyAddress:
				jQuery('#gst-company-address').val() ||
				null,
			GSTCompanyEmail:
				jQuery('#gst-company-email').val() ||
				null,
			GSTCompanyContactNumber:
				jQuery('#gst-company-contact').val() ||
				null,
		};
	}

	var corporatePan = null;
	if (
		validationInfo.CorporateBookingAllowed &&
		jQuery('#corporate-booking').is(':checked')
	) {
		corporatePan =
			jQuery('#corporate-pan').val() || null;
	}

	// Stash everything for the review page
	window._passengerFormData = {
		passengers: collectedPassengers,
		contact: contactInfo,
		gst: gstInfo,
		corporatePan: corporatePan,
		validationInfo: validationInfo,
		adults: adults,
		children: children,
		rooms: rooms,
	};

	showReviewPage();
}

// =====================================================================
// STEP 2: Review Page (hotel summary + passenger summary + fare + pay)
// =====================================================================
function showReviewPage() {
	var data = passengerPageData;
	var pax = window._passengerFormData;
	if (!data || !pax) return;

	var validationInfo = pax.validationInfo;
	var room = hotelResult.Rooms[0];
	var adults = pax.adults;
	var children = pax.children;
	var rooms = pax.rooms;
	var numberOfTravelers = adults + children;

	var childAges = [];
	if (
		data.object &&
		data.object.PaxRooms &&
		data.object.PaxRooms[0] &&
		Array.isArray(data.object.PaxRooms[0].ChildrenAges)
	) {
		childAges = data.object.PaxRooms[0].ChildrenAges;
	}

	var checkinStr =
		jQuery("#checkin-container").data("checkin-date");
	var checkoutStr =
		jQuery("#checkout-container").data("checkout-date");
	var checkInDate = checkinStr
		? new Date(checkinStr)
		: new Date();
	var checkOutDate = checkoutStr
		? new Date(checkoutStr)
		: new Date(checkInDate.getTime() + 86400000);
	var nights = Math.ceil(
		(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
	);

	var hotelImages =
		(window.currentHotelData &&
			window.currentHotelData.Images) ||
		[];
	var primaryImage =
		hotelImages[0] ||
		'https://plus.unsplash.com/premium_photo-1697730390320-8412ee5eae82?q=80&w=2045&auto=format&fit=crop';
	var hotelAddress =
		(window.currentHotelData &&
			window.currentHotelData.Address) ||
		'';
	var hotelRating =
		(window.currentHotelData &&
			window.currentHotelData.HotelRating) ||
		0;
	var hotelCity =
		(window.currentHotelData &&
			window.currentHotelData.CityName) ||
		'';
	var hotelCountry =
		(window.currentHotelData &&
			window.currentHotelData.CountryName) ||
		'';

	var formatDate = (date) => {
		return date.toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	var convenienceCharges =
		calculateConvenienceCharges(room);

	// Build passenger summary rows
	var passengerSummaryHtml = pax.passengers
		.map(
			(p, idx) => `
		<div class="pax-summary-row">
			<span class="pax-summary-index">${idx + 1}.</span>
			<span class="pax-summary-name">${p.title} ${p.firstName} ${p.lastName}</span>
			<span class="pax-summary-type">${p.type}</span>
		</div>`,
		)
		.join('');

	// Remove passenger details page and build review page
	jQuery('#passengerDetailsPage').remove();

	var designHtml = `<div class="review_booking_page" id="reviewBookingPage">
			<header class="header">
				<button class="review-back-btn" onclick="backToPassengerDetails()">
					<i class="fas fa-arrow-left"></i> Back
				</button>
				<h1 class="header__title">Review Your Booking</h1>
			</header>

			<!-- ===== BOOKING DETAILS ===== -->
			<section class="checkout-card booking-details">
				<div class="booking-details__left">
					<h2 class="booking-details__hotel-name">
						${room.Name[0] || 'Hotel Name'}
					</h2>
					${hotelRating ? `<div class="booking-details__star-rating">${'★'.repeat(hotelRating)}${'☆'.repeat(5 - hotelRating)} ${hotelRating}-Star Hotel</div>` : ''}
					${hotelAddress ? `<p class="booking-details__address"><i class="fas fa-map-marker-alt"></i> ${hotelAddress}</p>` : ''}
					${hotelCity ? `<p class="booking-details__city">${hotelCity}${hotelCountry ? ', ' + hotelCountry : ''}</p>` : ''}

					<div class="booking-details__trip">
						<div class="booking-details__trip-section">
							<p class="booking-details__trip-item">Check-in</p>
							<p class="booking-details__trip-item">${formatDate(checkInDate)}</p>
						</div>
						<div class="room_nights">${rooms} Room${rooms > 1 ? 's' : ''} x ${nights} Night${nights > 1 ? 's' : ''}</div>
						<div class="booking-details__trip-section">
							<p class="booking-details__trip-item">Check-out</p>
							<p class="booking-details__trip-item">${formatDate(checkOutDate)}</p>
						</div>
						<p class="booking-details__trip-item">
							| ${nights} Night${nights > 1 ? 's' : ''} | ${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}${childAges.length > 0 ? ' (Ages: ' + childAges.join(', ') + ' yrs)' : ''}` : ''} | ${rooms} Room${rooms > 1 ? 's' : ''}
						</p>
					</div>

					${validationInfo.PackageFare ? '<div class="booking-details__package-label">Package Fare</div>' : ''}
				</div>

				<div class="booking-details__right">
					<img
						class="booking-details__image"
						src="${primaryImage}"
						alt="${hotelResult.HotelName || 'Hotel'}"
					/>
					${hotelImages.length > 1 ? `
					<div class="booking-details__thumbnails">
						${hotelImages.slice(1, 4).map((img, i) => `<img class="booking-details__thumb" src="${img}" alt="Hotel image ${i + 2}" />`).join('')}
					</div>` : ''}
				</div>
			</section>

			<!-- ===== ROOM DETAILS ===== -->
			<section class="checkout-card room-details">
				<div class="room-details__main">
					<div class="room-details__package">
						<h2 class="room-details__package-title">${room.Name[0]}</h2>
					</div>

					<div class="room-details__services">
						<ul class="room-details__services-list" id="amenitiesListReview">
							${(room.Amenities || []).map((amenity, i) => `<li class="room-details__services-item${i >= 3 ? ' review-hidden-item' : ''}">${amenity}</li>`).join('')}
							<li class="room-details__services-item">${room.IsRefundable ? 'Refundable' : 'Non-Refundable'}</li>
						</ul>
						${(room.Amenities || []).length > 3 ? `
						<button class="review-view-more-btn" id="amenitiesViewMoreBtn" onclick="toggleReviewSection('amenitiesListReview', 'amenitiesViewMoreBtn')">
							<i class="fas fa-chevron-down"></i> View ${(room.Amenities || []).length - 3} more amenities
						</button>` : ''}
					</div>

					${room.RoomPromotion && room.RoomPromotion.length > 0 ? `
					<div class="room-details__promotions">
						<h3 class="room-details__promotions-title">Special Offers & Promotions</h3>
						<ul class="room-details__promotions-list">
							${room.RoomPromotion.map(promotion => `<li class="room-details__promotions-item">${promotion}</li>`).join('')}
						</ul>
					</div>
					` : ''}

					${room.Inclusion ? `
					<div class="room-details__inclusions">
						<h3 class="room-details__inclusions-title">Inclusions</h3>
						<div class="room-details__inclusions-content">
							<p class="room-details__inclusions-text">${room.Inclusion}</p>
						</div>
					</div>
					` : ''}

					${room.CancelPolicies && room.CancelPolicies.length > 0 ? `
					<div class="room-details__cancellation">
						<h3 class="room-details__cancellation-title">Cancellation Policy</h3>
						<div class="room-details__cancellation-content">
							${room.CancelPolicies.map(policy => `
								<div class="cancellation-policy-item">
									<p><strong>From ${policy.FromDate}:</strong> ${policy.ChargeType === 'Percentage' ? policy.CancellationCharge + '%' : '₹' + policy.CancellationCharge} cancellation charge</p>
								</div>
							`).join('')}
						</div>
					</div>
					` : ''}
				</div>
			</section>

			<!-- ===== PASSENGER SUMMARY (read-only) ===== -->
			<section class="checkout-card pax-summary-card">
				<div class="pax-summary-header">
					<h2 class="pax-summary-title">Passenger Details</h2>
					<button class="pax-summary-edit-btn" onclick="backToPassengerDetails()">
						<i class="fas fa-pen"></i> Edit
					</button>
				</div>

				<div class="pax-summary-contact">
					<span><i class="fas fa-envelope"></i> ${pax.contact.email}</span>
					<span><i class="fas fa-phone"></i> ${pax.contact.dialCode} ${pax.contact.mobile}</span>
				</div>

				<div class="pax-summary-list">
					${passengerSummaryHtml}
				</div>
			</section>

			<!-- ===== PRICE BREAKUP ===== -->
			<section class="checkout-card price-card">
				<h2 class="price-card__title">Price Breakup</h2>

				<div class="price-card__row">
					<span>${rooms} Room${rooms > 1 ? 's' : ''} x ${nights} Night${nights > 1 ? 's' : ''}</span>
					<span class="price-card__value">₹ ${Math.ceil(room.TotalFare) - Math.ceil(room.TotalTax)}</span>
				</div>
				<div class="price-card__subtext">Base price</div>

				<div class="price-card__row">
					<span>Hotel taxes</span>
					<span class="price-card__value">₹ ${Math.ceil(room.TotalTax)}</span>
				</div>

				<div class="price-card__row">
					<span>Service Charges</span>
					<span class="price-card__value">₹ ${Math.ceil(convenienceCharges)}</span>
				</div>

				<div class="price-card__divider"></div>

				<div class="price-card__row price-card__total">
					<span>Total Amount to be paid</span>
					<span class="price-card__value" data-original="${Math.ceil(room.TotalFare) + Math.ceil(convenienceCharges)}">₹ ${Math.ceil(room.TotalFare) + Math.ceil(convenienceCharges)}</span>
				</div>
			</section>

			<!-- ===== COUPON CARD ===== -->
			<section class="checkout-card coupon-card">
				<h3 class="coupon-card__title">Coupon Codes</h3>

				<div class="coupon-box">
					<input type="text" id="manualCouponInput" placeholder="Have a coupon code" class="coupon-box__input" />
					<button class="coupon-box__btn" onclick="applyCouponFromInput()">Apply</button>
				</div>

				<button class="view-coupons-btn" onclick="toggleCouponsList()">View Coupons</button>

				<div id="selectedCouponContainer" style="margin-top:10px; display:none;" class="selected-coupon-box"></div>

				<div id="couponList" style="display:none;margin-top:10px;">
					<div class="coupon-item">
						<strong>HOTEL200</strong> – Flat ₹200 off
						<button id="couponBtn_HOTEL200" onclick="handleCouponClick('HOTEL200',200)">Apply</button>
					</div>
					<div class="coupon-item">
						<strong>HOTEL500</strong> – Flat ₹500 off
						<button id="couponBtn_HOTEL500" onclick="handleCouponClick('HOTEL500',500)">Apply</button>
					</div>
				</div>

				<p class="coupon-hint"><i class="fas fa-gift"></i> TB Gift Cards can be applied at payment step</p>
			</section>

			<!-- Hidden validation info for booking payload -->
			<div id="validationInfo" data-validation='${JSON.stringify(validationInfo)}' style="display: none;"></div>

			<!-- ===== IMPORTANT INFORMATION ===== -->
			<section class="checkout-card important-info">
				<header class="important-info__header">
					<h2 class="important-info__title">Important Information</h2>
				</header>

				<div class="important-info__content">
					${(hotelResult.RateConditions || []).length > 0 ? `
					<div class="important-info__section">
						<h3 class="important-info__section-title">Rate Conditions & Policies</h3>
						<ul class="important-info__list" id="rateConditionsListReview">
							${hotelResult.RateConditions.map((condition, i) => `<li class="important-info__item${i >= 3 ? ' review-hidden-item' : ''}">${decodeHtmlEntities(condition)}</li>`).join('')}
						</ul>
						${hotelResult.RateConditions.length > 3 ? `
						<button class="review-view-more-btn" id="rateConditionsViewMoreBtn" onclick="toggleReviewSection('rateConditionsListReview', 'rateConditionsViewMoreBtn')">
							<i class="fas fa-chevron-down"></i> View ${hotelResult.RateConditions.length - 3} more conditions
						</button>` : ''}
					</div>
					` : ''}

					${room.MealType ? `
					<div class="important-info__section">
						<h3 class="important-info__section-title">Meal Plan</h3>
						<p class="important-info__meal-type">${room.MealType.replace('_', ' ')}</p>
					</div>
					` : ''}

					${(room.Supplements || []).length > 0 ? `
					<div class="important-info__section">
						<h3 class="important-info__section-title">Additional Charges</h3>
						<ul class="important-info__list">
							${room.Supplements.map(supplementGroup =>
								(Array.isArray(supplementGroup) ? supplementGroup : [supplementGroup]).map(supplement =>
									`<li class="important-info__item">${supplement.Description}: ${supplement.Currency} ${supplement.Price}</li>`
								).join('')
							).join('')}
						</ul>
					</div>
					` : ''}
				</div>

				<div class="important-info__actions hidden">
					<div class="important-info__button">View More</div>
				</div>
			</section>
			<hr />

			<!-- ===== LOGIN PROMO (guest only) ===== -->
			<div class="login-promo hidden" id="reviewLoginPromo" onclick="showHotelLoginModal()" style="cursor:pointer;">
				<div class="promo-text">
					Login to avail coupon discounts and get access to secret deals
				</div>
				<div class="div_for-login">
					<button class="login-btn" onclick="showHotelLoginModal()">Login</button>
				</div>
			</div>

			<!-- ===== STICKY PAY BUTTON ===== -->
			<div class="sticky-pay">
				<button class="sticky-pay__btn" onclick="proceedToBooking()">Pay & Book Now</button>
			</div>
		</div>`;

	jQuery('body').append(designHtml);

	setTimeout(() => {
		const isGuestUser =
			localStorage.getItem('isGuestUser');
		if (isGuestUser !== "true" && !appliedCoupon) {
			applyCoupon('HOTEL200', 200);
		} else {
			const couponHint =
				document.querySelector('.coupon-hint');
			if (couponHint) {
				couponHint.innerHTML =
					'<i class="fas fa-lock"></i> Login to avail coupon discounts';
			}
			jQuery('#reviewLoginPromo').removeClass('hidden');
		}
	}, 300);

	jQuery('.container').addClass('hidden');
	jQuery('#reserveWidgetMobile').css('display', 'none');
	jQuery('footer').hide();

	window.scrollTo(0, 0);
}

// =====================================================================
// Calculate Convenience Charges
// =====================================================================
function calculateConvenienceCharges(room) {
	let roomTotalFare = Math.ceil(room.TotalFare);
	let convenienceCharges = roomTotalFare * 0.02;
	let gstOnConvenienceCharges =
		convenienceCharges * 0.18;
	return convenienceCharges + gstOnConvenienceCharges;
}

// =====================================================================
// COUPON LOGIC
// =====================================================================
/** Valid hotel coupon codes → flat discount (₹). */
var HOTEL_COUPON_DISCOUNTS = {
	HOTEL200: 200,
	HOTEL500: 500,
};

let appliedCoupon = null;
let couponDiscount = 0;

function toggleCouponsList() {
	const el = document.getElementById('couponList');
	if (!el) return;
	el.style.display =
		el.style.display === 'none' ? 'block' : 'none';
}

function handleCouponClick(code, discount) {
	const isGuestUser =
		localStorage.getItem('isGuestUser');
	if (isGuestUser === "true") {
		alert('Please login to avail coupon discounts');
		return;
	}
	if (appliedCoupon === code) {
		removeCoupon();
	} else {
		applyCoupon(code, discount);
	}
}

function applyCoupon(code, discount) {
	var expected =
		HOTEL_COUPON_DISCOUNTS[code];
	if (
		expected == null ||
		discount !== expected
	) {
		alert('Invalid coupon');
		return;
	}

	appliedCoupon = code;
	couponDiscount = discount;
	const input =
		document.getElementById('manualCouponInput');
	if (input) input.value = code;

	updateCouponPriceUI();
	updateSelectedCouponUI();
	Object.keys(HOTEL_COUPON_DISCOUNTS).forEach(
		function (c) {
			updateCouponButtonUI(c, c === code);
		},
	);

	const couponBox =
		document.querySelector('.coupon-box');
	if (couponBox) couponBox.style.display = 'none';

	document.getElementById('couponList').style.display =
		'none';
}

function removeCoupon() {
	appliedCoupon = null;
	couponDiscount = 0;

	const existing = document.getElementById(
		'couponDiscountRow'
	);
	if (existing) existing.remove();

	const totalEl = document.querySelector(
		'.price-card__total .price-card__value'
	);
	if (totalEl) {
		const original = parseInt(
			totalEl.getAttribute('data-original')
		);
		totalEl.innerHTML = `₹ ${original}`;
	}

	updateSelectedCouponUI();

	const couponBox =
		document.querySelector('.coupon-box');
	if (couponBox) couponBox.style.display = 'block';

	Object.keys(HOTEL_COUPON_DISCOUNTS).forEach(
		function (c) {
			updateCouponButtonUI(c, false);
		},
	);
	const input =
		document.getElementById('manualCouponInput');
	if (input) input.value = '';
}

function applyCouponFromInput() {
	const isGuestUser =
		localStorage.getItem('isGuestUser');
	if (isGuestUser === "true") {
		alert('Please login to avail coupon discounts');
		return;
	}

	const input =
		document.getElementById('manualCouponInput');
	if (!input) return;

	const code = input.value.trim().toUpperCase();
	var amt = HOTEL_COUPON_DISCOUNTS[code];
	if (amt != null) {
		applyCoupon(code, amt);
	} else {
		alert('Invalid coupon');
	}
}

function updateCouponButtonUI(code, isApplied) {
	const btn = document.getElementById(
		`couponBtn_${code}`
	);
	if (!btn) return;
	btn.textContent = isApplied ? 'Remove' : 'Apply';
}

function updateSelectedCouponUI() {
	const container = document.getElementById(
		'selectedCouponContainer'
	);
	if (!container) return;

	if (appliedCoupon) {
		container.style.display = 'block';
		container.innerHTML = `
			<div class="selected-coupon-content">
				<span><strong>${appliedCoupon}</strong> applied – ₹${couponDiscount} discount</span>
				<button onclick="removeCoupon()">Remove</button>
			</div>
		`;
	} else {
		container.style.display = 'none';
		container.innerHTML = '';
	}
}

function updateCouponPriceUI() {
	const priceCard =
		document.querySelector('.price-card');
	if (!priceCard) return;

	let existing = document.getElementById(
		'couponDiscountRow'
	);
	if (existing) existing.remove();

	const row = document.createElement('div');
	row.className = 'price-card__row';
	row.id = 'couponDiscountRow';
	row.innerHTML = `
		<span>Coupon Discount (${appliedCoupon})</span>
		<span class="price-card__value">-₹ ${couponDiscount}</span>
	`;

	const divider = priceCard.querySelector(
		'.price-card__divider'
	);
	priceCard.insertBefore(row, divider);

	const totalEl = priceCard.querySelector(
		'.price-card__total .price-card__value'
	);
	if (!totalEl) return;

	const originalTotal =
		parseInt(
			totalEl.getAttribute('data-original')
		) ||
		parseInt(
			totalEl.innerText.replace(/[^\d]/g, '')
		);
	totalEl.setAttribute('data-original', originalTotal);
	totalEl.innerHTML = `₹ ${originalTotal - couponDiscount}`;
}

// =====================================================================
// NAVIGATION
// =====================================================================

function backToRoomSelectionFromPassenger() {
	jQuery('#passengerDetailsPage').remove();

	hotelResult = {};
	window.hotelResult = null;
	passengerPageData = null;
	window._passengerFormData = null;

	jQuery('footer').show();
	jQuery('#roomSelectionPage').removeClass('hidden');
	window.scrollTo(0, 0);
}

function backToPassengerDetails() {
	jQuery('#reviewBookingPage').remove();

	appliedCoupon = null;
	couponDiscount = 0;

	// Re-render passenger page with original data
	showPassengerDetailsPage(passengerPageData);

	// Re-populate form fields from stashed data
	var pax = window._passengerFormData;
	if (!pax) return;

	setTimeout(() => {
		jQuery('#email').val(pax.contact.email);
		jQuery('#mobile').val(pax.contact.mobile);
		jQuery('#country-code').val(
			pax.contact.dialCode
		);

		pax.passengers.forEach(p => {
			jQuery(`#title-${p.index}`).val(p.title);
			jQuery(`#first-name-${p.index}`).val(
				p.firstName
			);
			jQuery(`#last-name-${p.index}`).val(
				p.lastName
			);
			if (p.pan)
				jQuery(`#pan-${p.index}`).val(p.pan);
			if (p.passportNumber) {
				jQuery(
					`#passport-number-${p.index}`
				).val(p.passportNumber);
				jQuery(
					`#passport-expiry-${p.index}`
				).val(p.passportExpiry);
				jQuery(
					`#passport-issue-${p.index}`
				).val(p.passportIssue);
			}
		});

		if (pax.gst) {
			jQuery('#gst-required')
				.prop('checked', true)
				.trigger('change');
			jQuery('#gst-number').val(
				pax.gst.GSTNumber
			);
			jQuery('#gst-company-name').val(
				pax.gst.GSTCompanyName
			);
			jQuery('#gst-company-address').val(
				pax.gst.GSTCompanyAddress
			);
			jQuery('#gst-company-email').val(
				pax.gst.GSTCompanyEmail
			);
			jQuery('#gst-company-contact').val(
				pax.gst.GSTCompanyContactNumber
			);
		}

		if (pax.corporatePan) {
			jQuery('#corporate-booking')
				.prop('checked', true)
				.trigger('change');
			jQuery('#corporate-pan').val(
				pax.corporatePan
			);
		}
	}, 50);
}

function backToRoomSelection() {
	jQuery('.review_booking_page').remove();
	jQuery('#passengerDetailsPage').remove();

	hotelResult = {};
	window.hotelResult = null;
	passengerPageData = null;
	window._passengerFormData = null;

	jQuery('footer').show();
	jQuery('#roomSelectionPage').removeClass('hidden');
	window.scrollTo(0, 0);
}

// =====================================================================
// FORM VALIDATION
// =====================================================================

function initializeFormValidation() {
	var validationInfo = JSON.parse(
		jQuery('#validationInfo').attr('data-validation')
	);

	var adults =
		parseInt(jQuery("#adults-value").text()) || 1;
	var children =
		parseInt(jQuery("#children-value").text()) || 0;
	var numberOfTravelers = adults + children;

	jQuery('#corporate-booking').on(
		'change',
		function () {
			if (this.checked) {
				jQuery('#corporate-details').show();
				jQuery('#corporate-pan').prop(
					'required',
					true,
				);
			} else {
				jQuery('#corporate-details').hide();
				jQuery('#corporate-pan').prop(
					'required',
					false,
				);
			}
		},
	);

	jQuery('#gst-required').on(
		'change',
		function () {
			if (this.checked) {
				jQuery('#gst-details').show();
				jQuery(
					'#gst-number, #gst-company-name, #gst-company-address, #gst-company-email, #gst-company-contact',
				).prop('required', true);
			} else {
				jQuery('#gst-details').hide();
				jQuery(
					'#gst-number, #gst-company-name, #gst-company-address, #gst-company-email, #gst-company-contact',
				).prop('required', false);
			}
		},
	);

	for (let i = 1; i <= numberOfTravelers; i++) {
		jQuery(
			`#first-name-${i}, #last-name-${i}`
		).on('input', function () {
			validateNameField(this, validationInfo);
		});

		if (
			validationInfo.PanMandatory &&
			i <= adults
		) {
			jQuery(`#pan-${i}`).on(
				'input',
				function () {
					validatePAN(this);
				},
			);
		}
	}
}

function validateNameField(field, validationInfo) {
	var value = field.value;
	var fieldName =
		field.getAttribute('data-validation');

	jQuery(field).removeClass('error-highlight');

	if (value.length < 2) {
		jQuery(field).addClass('error-highlight');
		showValidationError(
			`${fieldName} must be at least 2 characters`,
		);
		return false;
	}

	if (value.length > 25) {
		jQuery(field).addClass('error-highlight');
		showValidationError(
			`${fieldName} cannot exceed 25 characters`,
		);
		return false;
	}

	if (
		!validationInfo.SpaceAllowed &&
		value.includes(' ')
	) {
		jQuery(field).addClass('error-highlight');
		showValidationError(
			'Names cannot contain spaces',
		);
		return false;
	}

	if (!validationInfo.SpecialCharAllowed) {
		if (/[^a-zA-Z\s]/.test(value)) {
			jQuery(field).addClass('error-highlight');
			showValidationError(
				'Names cannot contain special characters',
			);
			return false;
		}
	}

	hideValidationError();
	return true;
}

function validatePAN(field) {
	var value = field.value.toUpperCase();
	field.value = value;

	jQuery(field).removeClass('error-highlight');

	if (value.length > 0) {
		if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
			jQuery(field).addClass('error-highlight');
			showValidationError(
				'Please enter a valid PAN number (e.g., ABCDE1234F)',
			);
			return false;
		}
	}

	hideValidationError();
	return true;
}

function showValidationError(message) {
	jQuery(
		'#validation-messages .validation-error'
	).text(message);
	jQuery('#validation-messages').show();
}

function hideValidationError() {
	jQuery('#validation-messages').hide();
}

function addGuest() {
	console.log(
		'Add guest functionality to be implemented',
	);
}

// =====================================================================
// TDS HELPERS
// =====================================================================

function calculateTDSBreakdown(room) {
	const tdsBreakdown = {
		totalFare: room.TotalFare || 0,
		netAmount: room.NetAmount || room.TotalFare || 0,
		agentCommission: 0,
		tdsAmount: 0,
		tdsPercentage: 0,
		hasTDS: false,
		priceBreakup: room.PriceBreakUp || [],
	};

	if (
		room.PriceBreakUp &&
		room.PriceBreakUp.length > 0
	) {
		const priceBreakup = room.PriceBreakUp[0];
		if (priceBreakup.AgentCommission) {
			tdsBreakdown.agentCommission =
				parseFloat(
					priceBreakup.AgentCommission,
				) || 0;
		}
		if (priceBreakup.TDS) {
			tdsBreakdown.tdsAmount =
				parseFloat(priceBreakup.TDS) || 0;
			tdsBreakdown.hasTDS = true;
		}
		if (
			tdsBreakdown.agentCommission > 0 &&
			tdsBreakdown.tdsAmount > 0
		) {
			tdsBreakdown.tdsPercentage =
				(tdsBreakdown.tdsAmount /
					tdsBreakdown.agentCommission) *
				100;
		}
	}

	return tdsBreakdown;
}

function displayTDSBreakdown(room, containerId) {
	const tdsBreakdown = calculateTDSBreakdown(room);
	const container =
		document.getElementById(containerId);
	if (!container) return;

	let html = `
		<div class="tds-breakdown">
			<h4>TDS Breakdown</h4>
			<div class="tds-item">
				<span>Total Fare:</span>
				<span>₹${Math.ceil(tdsBreakdown.totalFare)}</span>
			</div>
	`;

	if (tdsBreakdown.hasTDS) {
		html += `
			<div class="tds-item">
				<span>Agent Commission:</span>
				<span>₹${Math.ceil(tdsBreakdown.agentCommission)}</span>
			</div>
			<div class="tds-item tds-highlight">
				<span>TDS (${tdsBreakdown.tdsPercentage.toFixed(1)}%):</span>
				<span>₹${Math.ceil(tdsBreakdown.tdsAmount)}</span>
			</div>
			<div class="tds-item total">
				<span>Net Amount:</span>
				<span>₹${Math.ceil(tdsBreakdown.netAmount)}</span>
			</div>
		`;
	} else {
		html += `
			<div class="tds-item total">
				<span>Net Amount:</span>
				<span>₹${Math.ceil(tdsBreakdown.netAmount)}</span>
			</div>
		`;
	}

	html += `</div>`;
	container.innerHTML = html;
}

function validatePriceComparison(
	searchPrice,
	prebookPrice,
	tolerance = 0.05,
) {
	const searchTotalFare =
		searchPrice.TotalFare || searchPrice;
	const prebookTotalFare =
		prebookPrice.TotalFare || prebookPrice;

	const difference = Math.abs(
		searchTotalFare - prebookTotalFare
	);
	const percentageDifference =
		(difference / searchTotalFare) * 100;

	return {
		isValid:
			percentageDifference <= tolerance * 100,
		difference,
		percentageDifference,
		searchPrice: searchTotalFare,
		prebookPrice: prebookTotalFare,
	};
}

function updatePriceDisplayWithTDS(
	room,
	displayElement,
	useNetAmount = false,
) {
	const tdsBreakdown = calculateTDSBreakdown(room);
	if (!displayElement) return;

	const displayPrice = useNetAmount
		? tdsBreakdown.netAmount
		: tdsBreakdown.totalFare;

	displayElement.innerHTML = `
		<span class="currency">₹</span>${Math.ceil(displayPrice)}
		${useNetAmount ? '<span class="tds-note">(Net Amount)</span>' : ''}
	`;
}

// =====================================================================
// PROCEED TO BOOKING (Pay & Book Now on Review Page)
// =====================================================================
function proceedToBooking() {
	var pax = window._passengerFormData;
	if (!pax) {
		showValidationError(
			'Passenger data missing. Please go back and re-enter details.',
		);
		return;
	}

	var validationInfo = pax.validationInfo;
	var adults = pax.adults;
	var children = pax.children;
	var rooms = pax.rooms;

	if (
		checkSessionStatus.checkExpiry() ===
		'Your session (TraceId) is expired.'
	) {
		window.location.href = '/hotels';
		return;
	}

	showLoader();

	var bookingPayload = prepareBookingPayload(
		validationInfo,
		adults,
		children,
		rooms,
	);

	console.log('Booking payload:', bookingPayload);
	bookingPayload.isForBooking = true;

	if (appliedCoupon) {
		bookingPayload.couponCode = appliedCoupon;
	}

	jsInit(
		'preBookHotel',
		bookingPayload,
		bookingPayload,
	);
}

// =====================================================================
// PREPARE BOOKING PAYLOAD (uses stashed passenger data)
// =====================================================================
function prepareBookingPayload(
	validationInfo,
	adults,
	children,
	rooms,
) {
	var pax = window._passengerFormData;
	if (!pax) return null;

	var roomData =
		validationInfo.roomData ||
		(window.hotelResult &&
			window.hotelResult.Rooms &&
			window.hotelResult.Rooms[0]) ||
		{};

	var payload = {
		BookingCode:
			roomData.BookingCode ||
			validationInfo.BookingCode,
		IsVoucherBooking: true,
		GuestNationality: "IN",
		TokenId: "",
		EndUserIp: "",
		RequestedBookingMode: 1,
		NetAmount:
			roomData.NetAmount || roomData.TotalFare,
		TotalFare: roomData.TotalFare,
		HotelRoomsDetails: [],
	};

	if (
		roomData.PriceBreakUp &&
		roomData.PriceBreakUp.length > 0
	) {
		payload.TDSInfo = {
			PriceBreakUp: roomData.PriceBreakUp,
			AgentCommission:
				roomData.PriceBreakUp[0]
					.AgentCommission,
			TDS: roomData.PriceBreakUp[0].TDS,
			TDSAmount:
				roomData.PriceBreakUp[0].TDSAmount,
		};
	}

	var email = pax.contact.email;
	var mobile = pax.contact.mobile;
	var dialCode = pax.contact.dialCode;
	if (dialCode == '+91' && mobile.startsWith('0')) {
		mobile = mobile.substring(1);
	}
	console.log('Mobile:', mobile);
	console.log('Dial Code:', dialCode);
	var gstDetails = pax.gst || {};
	var corporatePan = pax.corporatePan;

	var childAges = [];
	if (
		window.reviewBookingData &&
		window.reviewBookingData.object &&
		window.reviewBookingData.object.PaxRooms &&
		window.reviewBookingData.object.PaxRooms[0] &&
		Array.isArray(
			window.reviewBookingData.object.PaxRooms[0]
				.ChildrenAges,
		)
	) {
		childAges =
			window.reviewBookingData.object.PaxRooms[0]
				.ChildrenAges;
	} else {
		var childrenCount =
			parseInt(
				jQuery('#children-value').text()
			) || 0;
		for (var i = 1; i <= childrenCount; i++) {
			var sel = document.getElementById(
				'child-age-' + i,
			);
			var val = sel ? parseInt(sel.value) : 10;
			childAges.push(val);
		}
	}

	if (adults < rooms) {
		console.error(
			'Not enough adults for the number of rooms',
		);
		return null;
	}

	var maxAdultsPerRoom = 6;
	var maxChildrenPerRoom = 4;
	var maxPassengersPerRoom =
		maxAdultsPerRoom + maxChildrenPerRoom;
	var totalTravelers = adults + children;
	var minRequiredRooms = Math.ceil(
		totalTravelers / maxPassengersPerRoom
	);

	if (rooms < minRequiredRooms) {
		console.error(
			`Not enough rooms. Need at least ${minRequiredRooms} rooms for ${totalTravelers} passengers`,
		);
		return null;
	}

	var passengers = pax.passengers;

	for (
		let roomIndex = 0;
		roomIndex < rooms;
		roomIndex++
	) {
		var roomPassengers = [];

		var primaryIdx = roomIndex;
		var primaryPax = passengers[primaryIdx];
		var isLead = roomIndex === 0;

		roomPassengers.push({
			Title: primaryPax.title,
			FirstName: primaryPax.firstName,
			MiddleName: "",
			LastName: primaryPax.lastName,
			Email: isLead ? email : null,
			PaxType: 1,
			LeadPassenger: isLead,
			Age: 0,
			PassportNo:
				validationInfo.PassportMandatory
					? primaryPax.passportNumber
					: null,
			PassportIssueDate:
				validationInfo.PassportMandatory
					? primaryPax.passportIssue
					: null,
			PassportExpDate:
				validationInfo.PassportMandatory
					? primaryPax.passportExpiry
					: null,
			Phoneno: isLead ? mobile : null,
			PaxId: 0,
			GSTCompanyAddress: isLead
				? gstDetails.GSTCompanyAddress || null
				: null,
			GSTCompanyContactNumber: isLead
				? gstDetails.GSTCompanyContactNumber ||
					null
				: null,
			GSTCompanyName: isLead
				? gstDetails.GSTCompanyName || null
				: null,
			GSTNumber: isLead
				? gstDetails.GSTNumber || null
				: null,
			GSTCompanyEmail: isLead
				? gstDetails.GSTCompanyEmail || null
				: null,
			PAN: validationInfo.PanMandatory
				? primaryPax.pan
				: null,
		});

		if (corporatePan && isLead) {
			roomPassengers[0].CorporatePAN =
				corporatePan;
		}

		var remainingTravelers = [];
		for (let i = rooms; i < adults; i++) {
			remainingTravelers.push({
				paxIndex: i,
				isChild: false,
			});
		}
		for (
			let i = adults;
			i < totalTravelers;
			i++
		) {
			remainingTravelers.push({
				paxIndex: i,
				isChild: true,
			});
		}

		var travelersForThisRoom = Math.floor(
			remainingTravelers.length / rooms
		);
		var extraForRoom =
			roomIndex <
			remainingTravelers.length % rooms
				? 1
				: 0;
		var totalForRoom =
			travelersForThisRoom + extraForRoom;

		var startIdx =
			roomIndex * travelersForThisRoom +
			Math.min(
				roomIndex,
				remainingTravelers.length % rooms,
			);
		var endIdx = startIdx + totalForRoom;

		var currentAdults = 1;
		var currentChildren = 0;

		for (
			let i = startIdx;
			i < endIdx &&
			i < remainingTravelers.length;
			i++
		) {
			var traveler = remainingTravelers[i];
			if (traveler.isChild) {
				if (
					currentChildren >=
					maxChildrenPerRoom
				)
					continue;
				currentChildren++;
			} else {
				if (
					currentAdults >= maxAdultsPerRoom
				)
					continue;
				currentAdults++;
			}

			var p = passengers[traveler.paxIndex];
			roomPassengers.push({
				Title: p.title,
				FirstName: p.firstName,
				MiddleName: "",
				LastName: p.lastName,
				Email: null,
				PaxType: traveler.isChild ? 2 : 1,
				LeadPassenger: false,
				Age:
					traveler.isChild &&
					childAges.length >=
						traveler.paxIndex - adults + 1
						? childAges[
								traveler.paxIndex -
									adults
							]
						: 0,
				PassportNo:
					validationInfo.PassportMandatory
						? p.passportNumber
						: null,
				PassportIssueDate:
					validationInfo.PassportMandatory
						? p.passportIssue
						: null,
				PassportExpDate:
					validationInfo.PassportMandatory
						? p.passportExpiry
						: null,
				Phoneno: null,
				PaxId: 0,
				GSTCompanyAddress: null,
				GSTCompanyContactNumber: null,
				GSTCompanyName: null,
				GSTNumber: null,
				GSTCompanyEmail: null,
				PAN:
					validationInfo.PanMandatory &&
					!traveler.isChild
						? p.pan
						: null,
			});
		}

		payload.HotelRoomsDetails.push({
			HotelPassenger: roomPassengers,
		});

		payload.DialCode = dialCode;
	}

	return payload;
}

// =====================================================================
// HOTEL LOGIN MODAL FOR GUEST USERS
// =====================================================================
function showHotelLoginModal() {
	if (jQuery('#hotelLoginModal').length) return;

	var modalHtml = `
	<div class="hotel-login-modal" id="hotelLoginModal">
		<div class="hotel-login-modal__overlay" onclick="closeHotelLoginModal()"></div>
		<div class="hotel-login-modal__content">
			<button class="hotel-login-modal__close" onclick="closeHotelLoginModal()">
				<i class="fas fa-times"></i>
			</button>
			<h2 class="hotel-login-modal__title">Login or Register</h2>
			<p class="hotel-login-modal__subtitle">Enter your details to continue booking</p>

			<div class="hotel-login-modal__form">
				<div class="hotel-login-modal__field">
					<label for="hotelLoginName">Full Name</label>
					<input type="text" id="hotelLoginName" placeholder="Enter your full name" autocomplete="name" />
				</div>

				<div class="hotel-login-modal__field">
					<label for="hotelLoginPhone">Phone Number</label>
					<div class="hotel-login-modal__phone-row">
						<select id="hotelLoginDialCode">
							<option value="+91" selected>+91</option>
						</select>
						<input type="tel" id="hotelLoginPhone" placeholder="Enter phone number" autocomplete="tel" />
					</div>
				</div>

				<button class="hotel-login-modal__btn hotel-login-modal__btn--send" id="hotelLoginSendOtp" onclick="hotelLoginSendOtp()">
					Send OTP
				</button>

				<div class="hotel-login-modal__otp-section" id="hotelLoginOtpSection" style="display:none;">
					<div class="hotel-login-modal__field">
						<label for="hotelLoginOtp">Enter OTP</label>
						<input type="number" id="hotelLoginOtp" placeholder="Enter 6-digit OTP" maxlength="6" />
					</div>
					<button class="hotel-login-modal__btn hotel-login-modal__btn--verify" id="hotelLoginVerifyBtn" onclick="hotelLoginVerifyOtp()">
						Verify & Login
					</button>
					<button class="hotel-login-modal__resend" onclick="hotelLoginSendOtp()">Resend OTP</button>
				</div>
			</div>
		</div>
	</div>`;

	jQuery('body').append(modalHtml);
}

function closeHotelLoginModal() {
	jQuery('#hotelLoginModal').remove();
}

function hotelLoginSendOtp() {
	var name = jQuery('#hotelLoginName').val().trim();
	var phone = jQuery('#hotelLoginPhone').val().trim();
	var dialCode = jQuery('#hotelLoginDialCode').val();

	if (!name || name.length < 2) {
		toast('Please enter your full name');
		return;
	}
	if (!phone || phone.length < 7) {
		toast('Please enter a valid phone number');
		return;
	}

	jQuery('#hotelLoginSendOtp').prop('disabled', true).text('Sending...');

	jsInit('sendOTPDomestic', { phoneNumber: phone });
}

function hotelLoginVerifyOtp() {
	var name = jQuery('#hotelLoginName').val().trim();
	var phone = jQuery('#hotelLoginPhone').val().trim();
	var dialCode = jQuery('#hotelLoginDialCode').val();
	var otp = jQuery('#hotelLoginOtp').val().trim();

	if (!otp || otp.length < 4) {
		toast('Please enter a valid OTP');
		return;
	}

	jQuery('#hotelLoginVerifyBtn').prop('disabled', true).text('Verifying...');

	jsInit('hotelVerifyAndLogin', {
		mobileNumber: phone,
		otpEnteredByUser: otp,
		phoneNumber: phone,
		dialCode: dialCode,
		userName: name,
	});
}
