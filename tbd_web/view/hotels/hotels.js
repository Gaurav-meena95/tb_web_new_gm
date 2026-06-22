// Global variable to store the app instance
let travelApp;

// ---------- Global Loader Function ----------
function showLoader(loaderUrl = '/view/assets/img/hotels_loader.json') {
	// Show the loading container
	const loadingContainer = document.querySelector('.global__loading');
	if (loadingContainer) {
		loadingContainer.style.display = 'block';
	}
	
	// Load the Lottie animation with the provided URL
	if (typeof lottie !== 'undefined') {
		const lottieContainer = document.getElementById('lottie__loading');
		if (lottieContainer) {
			// Store the animation instance for later cleanup
			lottieContainer._lottie = lottie.loadAnimation({
				container: lottieContainer,
				renderer: 'svg',
				loop: true,
				autoplay: true,
				path: loaderUrl
			});
		}
	}
}

function hideLoader() {
	// Hide the loading container
	const loadingContainer = document.querySelector('.global__loading');
	if (loadingContainer) {
		loadingContainer.style.display = 'none';
	}
	
	// Stop and destroy the Lottie animation to reduce load
	const lottieContainer = document.getElementById('lottie__loading');
	if (lottieContainer && lottieContainer._lottie) {
		lottieContainer._lottie.stop();
		lottieContainer._lottie.destroy();
		lottieContainer._lottie = null;
	}
}

// ---------- TravelBookingApp (Main App) ----------
class TravelBookingApp {
	constructor() {
		this.init();
	}

	init() {
		this.setupNavigationToggles();
		this.locationDropdown = new LocationDropdown();
		this.guestPopup = new GuestDetailsPopup();
		this.travelCalendar = new TravelCalendar();
		// Use cached cities from localStorage if available; otherwise fetch all countries
		var cachedCities = null;
		try {
			var stored = localStorage.getItem("tbd_hotel_city_codes");
			if (stored) {
				cachedCities = JSON.parse(stored);
			}
		} catch (e) {}
		if (cachedCities && Array.isArray(cachedCities) && cachedCities.length > 0) {
			allCityCodes = cachedCities;
		} else {
			showLoader();
			jsInit("getCityCodesForHotels", {}, "#");
		}
		// Default city 144306: use cache if available to avoid API call on every load
		var cachedHotelCodes = null;
		try {
			var stored = localStorage.getItem("tbd_hotel_codes_default_city");
			if (stored) {
				cachedHotelCodes = JSON.parse(stored);
			}
		} catch (e) {}
		if (cachedHotelCodes && Array.isArray(cachedHotelCodes) && cachedHotelCodes.length > 0) {
			jQuery("#locationBox").data("hotelCodes", cachedHotelCodes);
		} else {
			jsInit("getHotelCodesFromDB", { city_id: '144306' }, "hotelCodesDefault");
		}
	}

	setupNavigationToggles() {
		var bookings = document.querySelector(".Bookings");
		var buddies = document.querySelector(".Buddies");

		if (bookings && buddies) {
			bookings.addEventListener("click", () => {
				bookings.classList.add("active");
				buddies.classList.remove("active");
			});
			buddies.addEventListener("click", () => {
				buddies.classList.add("active");
				bookings.classList.remove("active");
			});
		}

		var navItems = document.querySelectorAll(".travel-nav-container .nav-item");
		navItems.forEach((item) => {
			item.addEventListener("click", () => {
				navItems.forEach((el) => el.classList.remove("active"));
				item.classList.add("active");
			});
		});
	}

	handleSearch() {
		var selectedLocation = document.getElementById("selectedLocation");
		var selectedDistrict = document.getElementById("selectedDistrict");

		var searchData = {
			location: {
				name: selectedLocation
					? selectedLocation.textContent
					: "Select Destination",
				district: selectedDistrict ? selectedDistrict.textContent : "",
			},
			guests: {
				rooms: this.guestPopup.values.rooms,
				adults: this.guestPopup.values.adults,
				children: this.guestPopup.values.children,
				pets: this.guestPopup.values.pets,
				total: this.guestPopup.values.adults + this.guestPopup.values.children,
			},
			dates: {
				checkin: this.travelCalendar.checkinDate,
				checkout: this.travelCalendar.checkoutDate,
			},
		};

		if (!this.validateSearchData(searchData)) return;

		alert(
			`Searching for ${searchData.location.name} from ${
				searchData.dates.checkin
					? searchData.dates.checkin.toDateString()
					: "No date"
			} to ${
				searchData.dates.checkout
					? searchData.dates.checkout.toDateString()
					: "No date"
			} for ${searchData.guests.total} guest${
				searchData.guests.total !== 1 ? "s" : ""
			}`
		);
	}

	validateSearchData(data) {
		if (data.location.name === "Select Destination") {
			alert("Please select a destination");
			return false;
		}
		if (!data.dates.checkin) {
			alert("Please select a check-in date");
			return false;
		}
		if (!data.dates.checkout) {
			alert("Please select a check-out date");
			return false;
		}
		if (data.guests.total === 0) {
			alert("Please select at least one guest");
			return false;
		}
		return true;
	}
}

// ---------- LocationDropdown (Google Maps Integration) ----------
// ---------- LocationDropdown (Google Maps Integration) ----------
class LocationDropdown {
	constructor() {
		this.destinations = [
			{ name: "Dubai", location: "Dubai, UAE", icon: "🏖️", code: '115936' },
			{ name: "Mumbai", location: "Maharashtra, India", icon: "🌆", code: '144306' },
			{ name: "Manali", location: "Himachal Pradesh, India", icon: "🏔️", code: '126388' },
			{ name: "New Delhi", location: "Delhi, India", icon: "🏛️", code: '130443' },
			{ name: "Bengaluru", location: "Karnataka, India", icon: "💻", code: '111124' },
			// … any other hard‐coded options …
		];
		this.filteredDestinations = [...this.destinations];
		this.isOpen = false;
		this.autocompleteService = null;
		this.placesService = null;
		this.searchTimeout = null;
		this.init();
	}

	init() {
		this.bindEvents();
		this.renderDestinations();
		// Initialize Google services after a short delay to ensure API is loaded
		// setTimeout(() => {
		// 	this.initGoogleServices();
		// }, 100);
	}

	bindEvents() {
		var locationBox = document.getElementById("locationBox");
		var popupOverlay = document.getElementById("locationPopupOverlay");
		var closeBtn = document.getElementById("closeLocationPopup");
		var placeAutocomplete = document.getElementById("placeAutocomplete");
		var clearSearch = document.getElementById("clearSearch");
		var searchButton = document.getElementById("searchButton");
		if (locationBox) {
			locationBox.addEventListener("click", (e) => {
				e.stopPropagation();
				this.openPopup();
			});
		}

		if (popupOverlay) {
			popupOverlay.addEventListener("click", (e) => {
				if (e.target === popupOverlay) {
					this.closePopup();
				}
			});
		}

		if (closeBtn) {
			closeBtn.addEventListener("click", () => {
				this.closePopup();
			});
		}

		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && this.isOpen) {
				this.closePopup();
			}
		});

		if (placeAutocomplete) {
			// Handle place selection from Google Places
			// placeAutocomplete.addEventListener("gmp-placeselect", (event) => {
			// 	var place = event.detail.place;
			// 	if (place) {
			// 		this.selectDestinationFromGoogle(place);
			// 	}
			// });

			// Attach an event listener to placeAutocomplete which logs the entered value once 3 or more characters are entered
			placeAutocomplete.addEventListener("input", (e) => {
				if (e.target.value.length >= 3) {
					// Add a delay of 500ms before logging the value
					var query = e.target.value?.trim() || "";
					if (clearSearch) {
						clearSearch.style.display = query ? "flex" : "none";
					}
					setTimeout(() => {
						console.log(e.target.value);
						var cityCode = e.target.value;
						// Filter the city codes based on the input value from allallCityCodes
						var filteredCityCodes = allCityCodes.filter((city) =>
							city.Name.toLowerCase().includes(cityCode.toLowerCase())
						);
						console.log(filteredCityCodes);

						jQuery("#destinationList").empty();
						filteredCityCodes.forEach((city, index) => {
							var cardDesign = `<div class="destination-item" 	data-code="${city.Code}">
								<div class="destination-name">
								<span class="destination-icon">🏖️</span> ${city.Name}
								</div>
								<div class="destination-location hidden">${city.Name}</div>
							</div>`;
							jQuery("#destinationList").append(cardDesign);
							jQuery(".section-title").text("Search Results");
						});
					}, 500);
				} else {
					// If query is less than 3 characters, show all destinations
					this.filteredDestinations = [...this.destinations];
					this.renderDestinations();
					jQuery(".section-title").text("Popular Destinations");
					return;
				}
			});

			// Add Enter key support for manual input
			placeAutocomplete.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					var inputValue = placeAutocomplete.value?.trim();
					if (inputValue) {
						// Try to select from filtered destinations first
						var matchedDestination = this.filteredDestinations.find(
							(dest) =>
								dest.name.toLowerCase().includes(inputValue.toLowerCase()) ||
								dest.location.toLowerCase().includes(inputValue.toLowerCase())
						);

						if (matchedDestination) {
							this.selectDestination(matchedDestination);
						} else {
							// Create a custom destination from the input
							this.selectCustomDestination(inputValue);
						}
					}
				}
			});

			// Add click handler for clear button
			if (clearSearch) {
				clearSearch.addEventListener("click", () => {
					if (placeAutocomplete) {
						placeAutocomplete.value = "";
						clearSearch.style.display = "none";
						this.filteredDestinations = [...this.destinations];
						this.renderDestinations();
						jQuery(".section-title").text("Popular Destinations");
					}
				});
			}
		}

		var destinationList = document.getElementById("destinationList");
		if (destinationList) {
			destinationList.addEventListener("click", (e) => {
				var destinationItem = e.target.closest(".destination-item");
				if (destinationItem) {
					console.log(destinationItem);
					// Get data-code attr from destinationItem
					var locationCode = destinationItem.dataset.code;
					console.log(locationCode);
					jQuery("#locationBox").data("location-code", locationCode);
					// Extract Name from destinationItem and set it to selectedLocation
					var destinationName = destinationItem
						.querySelector(".destination-location")
						.textContent.trim();

					jQuery("#selectedLocation").text(destinationName);
					this.closePopup();

					jsInit("getHotelCodesFromDB", { city_id: locationCode }, "hotelCodes");
				}
			});
		}

		if (searchButton) {
			searchButton.addEventListener("click", () => {
				//this.handleSearch();
				console.log("Search button clicked");
				showLoader();

				var locationCode = jQuery("#locationBox").data("location-code") || "144306";
				var checkinDate = jQuery("#checkin-container").data("checkin-date");
				var checkoutDate = jQuery("#checkout-container").data("checkout-date");
				var adults = jQuery("#adults-value").text();
				var children = jQuery("#children-value").text();
				var rooms = jQuery("#rooms-value").text();

				// Convert date strings to Date objects for calculation
				var checkinDateObj = new Date(checkinDate);
				var checkoutDateObj = new Date(checkoutDate);

				// Calculate no. of days between checkin and checkout
				var noOfDays = Math.ceil(
					(checkoutDateObj - checkinDateObj) / (1000 * 60 * 60 * 24)
				);
				console.log("No. of Days: " + noOfDays);

				console.log("Location Code: " + locationCode);
				console.log("Checkin Date: " + checkinDate);
				console.log("Checkout Date: " + checkoutDate);
				console.log("Adults: " + adults);
				console.log("Children: " + children);
				console.log("Rooms: " + rooms);

				// Check if Children is greater than 0, however is the number of childs, same number of Child ages array should be created with values b/w 1-17years
				var childAges = [];
				if (children > 0) {
					for (var i = 1; i <= children; i++) {
						var sel = document.getElementById('child-age-' + i);
						var val = sel && sel.value !== '' ? parseInt(sel.value) : 10;
						childAges.push(val);
					}
					console.log("Child Ages: ", childAges);
				}

				// Always force-refresh hotel codes for the current location
				// to avoid using stale codes from a previous search
				jQuery("#locationBox").removeData("hotelCodes");
				jsInit("getHotelCodesFromDB", { city_id: locationCode }, "hotelCodes");

				function waitForHotelCodes(callback, interval = 100, timeout = 10000) {
					let startTime = Date.now();

					function checkAvailability() {
						let hotelCodes = jQuery("#locationBox").data("hotelCodes");
						if (hotelCodes) {
							callback(hotelCodes);
						} else if (Date.now() - startTime < timeout) {
							setTimeout(checkAvailability, interval);
						} else {
							console.error("Timeout: hotelCodes data not available");
							hideLoader();
						}
					}

					checkAvailability();
				}

				// Usage
				waitForHotelCodes(function (hotelCodes) {
					console.log(hotelCodes);

					let payload = {
						city: jQuery("#selectedLocation").val(),
						country: "IN",
						isInternational: 0,
						noOfDays: noOfDays,
						saveHistory: true,
					};
					
					
					let numRooms = parseInt(jQuery("#rooms-value").text());
					let numAdults = parseInt(jQuery("#adults-value").text());
					let numChildren = parseInt(jQuery("#children-value").text());
					let childAgesCopy = Array.isArray(childAges) ? [...childAges] : [];

					// Distribute adults and children across rooms
					let adultsPerRoom = Array(numRooms).fill(0);
					let childrenPerRoom = Array(numRooms).fill(0);
					let childrenAgesPerRoom = Array(numRooms).fill(null).map(() => []);

					// Assign 1 adult to each room first
					for (let i = 0; i < numRooms && i < numAdults; i++) {
					    adultsPerRoom[i] = 1;
					}
					// Distribute remaining adults
					let remainingAdults = numAdults - numRooms;
					let roomIdx = 0;
					while (remainingAdults > 0) {
					    adultsPerRoom[roomIdx % numRooms]++;
					    remainingAdults--;
					    roomIdx++;
					}
					// Distribute children
					let remainingChildren = numChildren;
					roomIdx = 0;
					while (remainingChildren > 0) {
					    childrenPerRoom[roomIdx % numRooms]++;
					    remainingChildren--;
					    roomIdx++;
					}
					// Distribute children ages
					let childAgeIdx = 0;
					for (let i = 0; i < numRooms; i++) {
					    if (childrenPerRoom[i] > 0) {
					        childrenAgesPerRoom[i] = childAgesCopy.slice(childAgeIdx, childAgeIdx + childrenPerRoom[i]);
					        childAgeIdx += childrenPerRoom[i];
					    } else {
					        childrenAgesPerRoom[i] = null;
					    }
					}
					let paxRooms = [];
					for (let i = 0; i < numRooms; i++) {
					    paxRooms.push({
					        Adults: adultsPerRoom[i],
					        Children: childrenPerRoom[i],
					        ChildrenAges: childrenPerRoom[i] > 0 ? childrenAgesPerRoom[i] : null
					    });
					}
					let payloadObj = {
					    CheckIn: checkinDate, // "2024-12-20",
					    CheckOut: checkoutDate, //"2024-12-22",
					    HotelCodes: hotelCodes.slice(0,500),
					    GuestNationality: "IN",
					    PaxRooms: paxRooms,
					    "ResponseTime": 23.0,
					    IsDetailedResponse: true,
					    Filters: {
					        Refundable: false,
					        // NoOfRooms: parseInt(rooms),
					        NoOfRooms: 0,
					        MealType: 0,
					        OrderBy: 0,
					        StarRating: 0,
					        HotelName: null,
					    },
					};
					payload.payloadObj = payloadObj;
					payload.saveHistory = true;
					console.log('payloadObj:', payload.payloadObj);

					jsInit("searchHotelAvailability", payload, "renderHotelDetails");
				});
			});
		}
	}

	initGoogleServices() {
		if (
			typeof google !== "undefined" &&
			google.maps &&
			google.maps.places &&
			google.maps.places.Place
		) {
			console.log("Google Places v2 services are available");

			// Set up a method to fetch place details when needed
			this.fetchPlaceDetails = async (placeId) => {
				var { Place } = await google.maps.importLibrary("places");
				var place = new Place({
					id: placeId,
					requestedLanguage: "en",
				});

				try {
					await place.fetchFields({
						fields: [
							"id",
							"location",
							"displayName",
							"formattedAddress",
							"addressComponents",
						],
					});
					return place;
				} catch (error) {
					console.error("Failed to fetch place details:", error);
					return null;
				}
			};

			// AutocompleteService is no longer recommended for new implementations
			this.autocompleteService = null;
		} else {
			console.warn("Google Places API not available");
		}
	}

	searchPlaces(query) {
		// Since we're using gmp-place-autocomplete, we don't need manual search
		// Just filter local destinations as fallback
		this.filterDestinations(query);
	}

	renderGooglePredictions(predictions) {
		var destinationList = document.getElementById("destinationList");
		if (!destinationList) return;

		var html = predictions
			.map((prediction, index) => {
				var mainText = prediction.structured_formatting.main_text;
				var secondaryText =
					prediction.structured_formatting.secondary_text || "";

				return `
							<div class="destination-item" data-index="${index}" data-place-id="${prediction.place_id}">
								<div class="destination-name">
								<span class="destination-icon">📍</span> ${mainText}
								</div>
								<div class="destination-location">${secondaryText}</div>
							</div>
							`;
			})
			.join("");

		destinationList.innerHTML = html;
	}

	async selectGooglePlace(placeId) {
		if (typeof google === "undefined" || !google.maps || !google.maps.places) {
			console.warn("Google Places API not available");
			return;
		}

		try {
			var { Place } = await google.maps.importLibrary("places");
			var place = new Place({
				id: placeId,
				requestedLanguage: "en",
			});

			await place.fetchFields({
				fields: ["displayName", "formattedAddress", "addressComponents"],
			});

			if (place) {
				this.selectDestinationFromGoogle(place);
			} else {
				console.error("Place not found.");
			}
		} catch (error) {
			console.error("Failed to fetch place details:", error);
		}
	}

	selectDestinationFromGoogle(place) {
		var selectedLocation = document.getElementById("selectedLocation");
		var selectedDistrict = document.getElementById("selectedDistrict");

		if (!selectedLocation || !selectedDistrict) return;

		// Extract city name and region from the Google Place
		let cityName = place.displayName || place.name || "";
		let regionName = place.formattedAddress || "";

		// For gmp-place-autocomplete, the place object structure might be different
		if (place.addressComponents) {
			var comps = place.addressComponents;
			var locality = comps.find((c) => c.types.includes("locality"));
			var adminArea = comps.find((c) =>
				c.types.includes("administrative_area_level_1")
			);
			var country = comps.find((c) => c.types.includes("country"));

			if (locality) {
				cityName = locality.longText || locality.long_name;
			}
			if (adminArea) {
				regionName = adminArea.longText || adminArea.long_name;
				if (country && (country.longText || country.long_name)) {
					regionName += `, ${country.longText || country.long_name}`;
				}
			}
		} else if (place.address_components) {
			// Fallback for older API structure
			var comps = place.address_components;
			var locality = comps.find((c) => c.types.includes("locality"));
			var adminArea = comps.find((c) =>
				c.types.includes("administrative_area_level_1")
			);
			var country = comps.find((c) => c.types.includes("country"));

			if (locality) {
				cityName = locality.long_name;
			}
			if (adminArea) {
				regionName = adminArea.long_name;
				if (country && country.long_name) {
					regionName += `, ${country.long_name}`;
				}
			}
		}

		selectedLocation.textContent = cityName;
		selectedDistrict.textContent = regionName;
		this.closePopup();
	}

	openPopup() {
		var popup = document.getElementById("locationPopupOverlay");
		var locationBox = document.getElementById("locationBox");

		if (popup) popup.classList.add("show");
		if (locationBox) locationBox.classList.add("active");

		this.isOpen = true;

		setTimeout(() => {
			var placeAutocomplete = document.getElementById("placeAutocomplete");
			if (placeAutocomplete) placeAutocomplete.focus();
		}, 300);
	}

	closePopup() {
		var popup = document.getElementById("locationPopupOverlay");
		var locationBox = document.getElementById("locationBox");
		var placeAutocomplete = document.getElementById("placeAutocomplete");

		if (popup) popup.classList.remove("show");
		if (locationBox) locationBox.classList.remove("active");
		if (placeAutocomplete) placeAutocomplete.value = "";

		this.isOpen = false;
		this.filteredDestinations = [...this.destinations];
		this.renderDestinations();
	}

	filterDestinations(query) {
		var searchTerm = query.toLowerCase().trim();
		if (searchTerm === "") {
			this.filteredDestinations = [...this.destinations];
		} else {
			this.filteredDestinations = this.destinations.filter(
				(dest) =>
					dest.name.toLowerCase().includes(searchTerm) ||
					dest.location.toLowerCase().includes(searchTerm)
			);
		}
		this.renderDestinations();
	}

	renderDestinations() {
		var destinationList = document.getElementById("destinationList");
		if (!destinationList) return;

		if (this.filteredDestinations.length === 0) {
			destinationList.innerHTML = `
				<div class="destination-item">
				<div class="destination-name">No destinations found</div>
				<div class="destination-location">Try a different search term</div>
				</div>`;
			return;
		}

		destinationList.innerHTML = this.filteredDestinations
			.map(
				(d) => `
					<div class="destination-item" data-code="${d.code || ''}">
						<div class="destination-name">
						<span class="destination-icon">${d.icon}</span> ${d.name}
						</div>
					<div class="destination-location hidden">${d.name},${d.location}</div>
					</div>`
			)
			.join("");
	}

	handleSearch() {
		var placeAutocomplete = document.getElementById("placeAutocomplete");
		if (!placeAutocomplete) return;

		var inputValue = placeAutocomplete.value?.trim();
		if (!inputValue) {
			// If no input, just show all destinations
			this.filteredDestinations = [...this.destinations];
			this.renderDestinations();
			return;
		}

		// Try to select from filtered destinations first
		var matchedDestination = this.filteredDestinations.find(
			(dest) =>
				dest.name.toLowerCase().includes(inputValue.toLowerCase()) ||
				dest.location.toLowerCase().includes(inputValue.toLowerCase())
		);

		if (matchedDestination) {
			this.selectDestination(matchedDestination);
		} else {
			// Create a custom destination from the input
			this.selectCustomDestination(inputValue);
		}
	}

	selectCustomDestination(inputValue) {
		var selectedLocation = document.getElementById("selectedLocation");
		var selectedDistrict = document.getElementById("selectedDistrict");

		if (!selectedLocation || !selectedDistrict) return;

		// Split input to try to extract location parts
		var parts = inputValue.split(",").map((part) => part.trim());
		var locationName = parts[0] || inputValue;
		var district =
			parts.length > 1 ? parts.slice(1).join(", ") : "Custom Location";

		selectedLocation.textContent = locationName;
		selectedDistrict.textContent = district;
		this.closePopup();
	}

	selectDestination(destination) {
		var selectedLocation = document.getElementById("selectedLocation");
		var selectedDistrict = document.getElementById("selectedDistrict");

		if (!selectedLocation || !selectedDistrict) return;

		var locationParts = destination.location.split(", ");
		var region =
			locationParts[locationParts.length - 2] || destination.location;

		selectedLocation.textContent = destination.name;
		selectedDistrict.textContent = region;
		this.closePopup();
	}
}

// ---------- TravelCalendar ----------
class TravelCalendar {
	constructor() {
		this.checkinDate = null;
		this.checkoutDate = null;
		this.currentMonth = new Date();
		this.currentType = null;
		this.today = new Date();
		this.today.setHours(0, 0, 0, 0);

		this.monthNames = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		this.dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		this.init();
	}

	init() {
		this.setupEventListeners();
		this.prefillDefaultDates();
		window.travelCalendar = this; // for inline onclick in renderDays()
	}

	prefillDefaultDates() {
		var existingCheckin =
			jQuery("#checkin-container").data("checkin-date");
		var existingCheckout =
			jQuery("#checkout-container").data("checkout-date");
		if (existingCheckin || existingCheckout) return;

		var now = new Date();
		now.setHours(0, 0, 0, 0);

		var checkin = new Date(now);
		checkin.setDate(checkin.getDate() + 7);
		this.checkinDate = checkin;
		this.updateDateDisplay("checkin", checkin);

		var checkout = new Date(now);
		checkout.setDate(checkout.getDate() + 9);
		this.checkoutDate = checkout;
		this.updateDateDisplay("checkout", checkout);
	}

	setupEventListeners() {
		var checkinContainer = document.getElementById("checkin-container");
		var checkoutContainer = document.getElementById("checkout-container");
		var overlay = document.getElementById("calendar-overlay");
		var closeBtn = document.getElementById("close-calendar");
		var prevBtn = document.getElementById("prev-month");
		var nextBtn = document.getElementById("next-month");

		if (checkinContainer) {
			checkinContainer.addEventListener("click", () =>
				this.showCalendar("checkin")
			);
		}
		if (checkoutContainer) {
			checkoutContainer.addEventListener("click", () =>
				this.showCalendar("checkout")
			);
		}
		if (closeBtn) {
			closeBtn.addEventListener("click", () => this.hideCalendar());
		}
		if (prevBtn) {
			prevBtn.addEventListener("click", () => this.previousMonth());
		}
		if (nextBtn) {
			nextBtn.addEventListener("click", () => this.nextMonth());
		}

		if (overlay) {
			overlay.addEventListener("click", (e) => {
				if (e.target === overlay) this.hideCalendar();
			});
		}

		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") this.hideCalendar();
		});
	}

	showCalendar(type) {
		this.currentType = type;
		var calendarTitle = document.getElementById("calendar-title");
		var calendarOverlay = document.getElementById("calendar-overlay");

		if (calendarTitle) {
			calendarTitle.textContent =
				type === "checkin" ? "Select Check-in Date" : "Select Check-out Date";
		}
		if (calendarOverlay) {
			calendarOverlay.classList.add("show");
		}
		this.renderCalendar();
	}

	hideCalendar() {
		var calendarOverlay = document.getElementById("calendar-overlay");
		if (calendarOverlay) {
			calendarOverlay.classList.remove("show");
		}
	}

	renderCalendar() {
		var grid = document.getElementById("calendar-grid");
		var monthYear = document.getElementById("month-year");

		if (!grid || !monthYear) return;

		var year = this.currentMonth.getFullYear();
		var month = this.currentMonth.getMonth();
		monthYear.textContent = `${this.monthNames[month]} ${year}`;
		grid.innerHTML = this.renderDayHeaders() + this.renderDays();
	}

	renderDayHeaders() {
		return this.dayNames
			.map((d) => `<div class="day-header">${d}</div>`)
			.join("");
	}

	renderDays() {
		var year = this.currentMonth.getFullYear();
		var month = this.currentMonth.getMonth();
		var firstDay = new Date(year, month, 1);
		var lastDay = new Date(year, month + 1, 0);
		var startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		let html = "";
		let currentDate = new Date(startDate);

		for (let i = 0; i < 42; i++) {
			var isCurrentMonth = currentDate.getMonth() === month;
			var isPastDate = currentDate < this.today;
			var isToday = currentDate.getTime() === this.today.getTime();

			let classes = ["calendar-day"];
			let disabled = false;
			if (!isCurrentMonth) {
				classes.push("other-month");
				disabled = true;
			} else if (isPastDate) {
				classes.push("disabled");
				disabled = true;
			} else if (
				this.currentType === "checkout" &&
				this.checkinDate &&
				currentDate <= this.checkinDate
			) {
				classes.push("disabled");
				disabled = true;
			}
			if (isToday) classes.push("today");

			// Selected / in-range logic
			if (
				this.checkinDate &&
				currentDate.getTime() === this.checkinDate.getTime()
			) {
				classes.push("range-start");
			}
			if (
				this.checkoutDate &&
				currentDate.getTime() === this.checkoutDate.getTime()
			) {
				classes.push("range-end");
			}
			if (
				this.checkinDate &&
				this.checkoutDate &&
				currentDate > this.checkinDate &&
				currentDate < this.checkoutDate
			) {
				classes.push("in-range");
			}

			var clickHandler = disabled
				? ""
				: `onclick="travelCalendar.selectDate('${currentDate.toISOString()}')"`;

			html +=
				`<div class="${classes.join(" ")}" ${clickHandler}>` +
				`${currentDate.getDate()}` +
				`</div>`;
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return html;
	}

	selectDate(dateString) {
		var selectedDate = new Date(dateString);
		if (this.currentType === "checkin") {
			this.checkinDate = selectedDate;
			if (this.checkoutDate && this.checkoutDate <= selectedDate) {
				this.checkoutDate = null;
				this.updateDateDisplay("checkout", null);
			}
			this.updateDateDisplay("checkin", selectedDate);
		} else if (this.currentType === "checkout") {
			this.checkoutDate = selectedDate;
			this.updateDateDisplay("checkout", selectedDate);
		}
		this.hideCalendar();

		// Auto-open checkout if only checkin was set
		if (this.currentType === "checkin" && !this.checkoutDate) {
			setTimeout(() => this.showCalendar("checkout"), 300);
		}
	}

	updateDateDisplay(type, date) {
		var el = document.getElementById(`${type}-date`);
		if (el) {
			if (date) {
				var options = {
					day: "numeric",
					month: "short",
					year: "numeric",
				};
				el.textContent = date.toLocaleDateString("en-US", options);
				// Format the date as YYYY-MM-DD
				var year = date.getFullYear();
				var month = String(date.getMonth() + 1).padStart(2, "0");
				var day = String(date.getDate()).padStart(2, "0");
				console.log(year + "-" + month + "-" + day);
				if (type === "checkin") {
					jQuery("#checkin-container").data(
						"checkin-date",
						year + "-" + month + "-" + day
					);
				} else if (type === "checkout") {
					jQuery("#checkout-container").data(
						"checkout-date",
						year + "-" + month + "-" + day
					);
				}
			} else {
				el.textContent = "Select Date";
			}
		}
		hideLoader();
	}

	previousMonth() {
		this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
		this.renderCalendar();
	}

	nextMonth() {
		this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
		this.renderCalendar();
	}
}

// ---------- GuestDetailsPopup ----------
class GuestDetailsPopup {
	constructor() {
		this.values = {
			rooms: 1,
			adults: 2,
			children: 0,
			pets: false,
		};
		this.limits = {
			rooms: { min: 1, max: 6 },
			adults: { min: 1, max: 36 },
			children: { min: 0, max: 24 },
		};
		this.init();
	}

	init() {
		this.bindEvents();
		this.updateUI();
		this.updateGuestSummary();
	}

	bindEvents() {
		var guestDetails = document.getElementById("guestDetails");
		var modalClose = document.getElementById("modalClose");
		var modalOverlay = document.getElementById("modalOverlay");
		var applyBtn = document.getElementById("apply-btn");
		var petsToggle = document.getElementById("pets-toggle");

		if (guestDetails) {
			guestDetails.addEventListener("click", () => {
				this.openModal();
			});
		}
		if (modalClose) {
			modalClose.addEventListener("click", () => {
				this.closeModal();
			});
		}
		if (modalOverlay) {
			modalOverlay.addEventListener("click", (e) => {
				if (e.target === modalOverlay) {
					this.closeModal();
				}
			});
		}
		if (applyBtn) {
			applyBtn.addEventListener("click", () => {
				this.applySelection();
			});
		}
		if (petsToggle) {
			petsToggle.addEventListener("click", () => {
				this.togglePets();
			});
		}

		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") this.closeModal();
		});

		document.querySelectorAll(".counter__button").forEach((button) => {
			button.addEventListener("click", (e) => this.handleCounterClick(e));
		});
	}

	openModal() {
		var modalOverlay = document.getElementById("modalOverlay");
		if (modalOverlay) {
			modalOverlay.classList.add("active");
		}
		document.body.style.overflow = "hidden";
	}

	closeModal() {
		var modalOverlay = document.getElementById("modalOverlay");
		if (modalOverlay) {
			modalOverlay.classList.remove("active");
		}
		document.body.style.overflow = "";
	}

	handleCounterClick(e) {
		var target = e.target.dataset.target;
		var isIncrease = e.target.classList.contains("counter__button--increase");
		if (isIncrease) this.increaseValue(target);
		else this.decreaseValue(target);
	}

	increaseValue(target) {
		var currentValue = this.values[target];
		var maxValue = this.limits[target].max;
		// For adults, cap by rooms * 8
		if (target === 'adults') {
			maxValue = this.values.rooms * 8;
		}
		// For children, cap by rooms * 4
		if (target === 'children') {
			maxValue = this.values.rooms * 4;
		}
		if (currentValue < maxValue) {
			this.values[target] = currentValue + 1;
			this.updateUI();
		}
		// If rooms changed, adjust adults and children if needed
		if (target === 'rooms') {
			var maxAdults = this.values.rooms * 6;
			var maxChildren = this.values.rooms * 4;
			var changed = false;
			if (this.values.adults > maxAdults) {
				this.values.adults = maxAdults;
				changed = true;
			}
			if (this.values.children > maxChildren) {
				this.values.children = maxChildren;
				changed = true;
			}
			if (changed) {
				this.updateUI();
			}
		}
	}

	decreaseValue(target) {
		var currentValue = this.values[target];
		var minValue = this.limits[target].min;
		if (currentValue > minValue) {
			this.values[target] = currentValue - 1;
			this.updateUI();
		}
	}

	togglePets() {
		this.values.pets = !this.values.pets;
		this.updateUI();
	}

	updateUI() {
		Object.keys(this.values).forEach((key) => {
			if (key !== "pets") {
				var valueElement = document.getElementById(`${key}-value`);
				if (valueElement) {
					valueElement.textContent = this.values[key];
				}
			}
		});
		this.updateButtonStates();
		this.updatePetsToggle();
	}

	updateButtonStates() {
		Object.keys(this.limits).forEach((target) => {
			var decBtn = document.querySelector(
				`[data-target="${target}"].counter__button--decrease`
			);
			var incBtn = document.querySelector(
				`[data-target="${target}"].counter__button--increase`
			);
			if (!decBtn || !incBtn) return;
			if (this.values[target] <= this.limits[target].min) {
				decBtn.classList.add("counter__button--disabled");
				decBtn.disabled = true;
			} else {
				decBtn.classList.remove("counter__button--disabled");
				decBtn.disabled = false;
			}
			if (this.values[target] >= this.limits[target].max) {
				incBtn.classList.add("counter__button--disabled");
				incBtn.disabled = true;
			} else {
				incBtn.classList.remove("counter__button--disabled");
				incBtn.disabled = false;
			}
		});
	}

	updatePetsToggle() {
		var toggle = document.getElementById("pets-toggle");
		var slider = document.getElementById("pets-slider");
		if (toggle && slider) {
			if (this.values.pets) {
				toggle.classList.add("toggle__switch--active");
				slider.classList.add("toggle__slider--active");
			} else {
				toggle.classList.remove("toggle__switch--active");
				slider.classList.remove("toggle__slider--active");
			}
		}
	}

	updateGuestSummary() {
		var totalPersons = this.values.adults + this.values.children;
		var guestSummary = document.getElementById("guestSummary");
		if (guestSummary) {
			guestSummary.textContent = `${totalPersons} Person${
				totalPersons !== 1 ? "s" : ""
			}`;
		}

		var breakdownParts = [];
		if (this.values.adults > 0) {
			breakdownParts.push(
				`${this.values.adults} Adult${this.values.adults !== 1 ? "s" : ""}`
			);
		}
		if (this.values.children > 0) {
			breakdownParts.push(
				`${this.values.children} Child${
					this.values.children !== 1 ? "ren" : ""
				}`
			);
		}
		var guestBreakdown = document.getElementById("guestBreakdown");
		if (guestBreakdown) {
			guestBreakdown.textContent = breakdownParts.join(", ");
		}

		console.log("Total Adults: " + this.values.adults);
		console.log("Total Children: " + this.values.children);
		console.log("Total Rooms: " + this.values.rooms);
		console.log("Total Guests: " + totalPersons);
	}

	applySelection() {
		this.updateGuestSummary();
		this.closeModal();
	}
}

// ---------- App bootstrap ----------
// Google Maps is loaded only when needed (e.g. drill-down map); main app works without it.
document.addEventListener("DOMContentLoaded", () => {
	if (!travelApp) {
		travelApp = new TravelBookingApp();
	}
});

/*document.addEventListener("DOMContentLoaded", () => {
	// 1️⃣ Grab your containers
	const controlsEl = document.querySelector(".page");
	const resultsEl = document.getElementById("hotelResultsPage");
	const drillEl = document.getElementById("drillContainer");

	// 2️⃣ Helper to show exactly one view
	function showView(view) {
		controlsEl.classList.toggle("hidden", view !== "controls");
		resultsEl.classList.toggle("hidden", view !== "results");
		drillEl.classList.toggle("hidden", view !== "drill");
	}

	// 3️⃣ Initial load: pick view by hash (or default to 'controls')
	const initialView = location.hash.slice(1) || "controls";
	showView(initialView);

	// 4️⃣ Trap the first Back so you stay on /hotels#controls
	history.replaceState({ view: initialView }, "", `#${initialView}`);
	history.pushState({ view: initialView }, "", `#${initialView}`);

	// 5️⃣ popstate handler for browser Back/Forward
	window.addEventListener("popstate", (e) => {
		const view = e.state?.view || "controls";
		showView(view);
	});

	// 6️⃣ Wire Search → Results
	document.getElementById("searchButton").addEventListener("click", () => {
		// your existing AJAX kickoff here…
		showView("results");
		history.pushState({ view: "results" }, "", "#results");
	});

	// 7️⃣ Expose Drill navigation for your render code
	window.__navigateToDrill = (hotelData) => {
		showView("drill");
		history.pushState({ view: "drill" }, "", "#drill");
		startDrillDown(hotelData);
	};
});*/

function updateChildAgesSelectors() {
  var children = parseInt(jQuery('#children-value').text());
  var section = document.getElementById('child-ages-section');
  var label = document.getElementById('child-ages-label');
  var note = document.getElementById('child-ages-note');
  var container = document.getElementById('child-ages-container');
  if (!container || !section) return;
  container.innerHTML = '';
  if (children > 0) {
    section.style.display = '';
    if (label) label.style.display = '';
    if (note) note.style.display = '';
    container.style.flexDirection = children > 4 ? 'column' : 'row';
    for (let i = 1; i <= children; i++) {
      var childDiv = document.createElement('div');
      childDiv.style = 'display: flex; align-items: center; gap: 4px;';
      var childLabel = document.createElement('span');
      childLabel.textContent = 'child ' + i;
      childLabel.style = 'font-size: 14px; color: #555; min-width: 48px;';
      var select = document.createElement('select');
      select.className = 'child-age-select';
      select.id = 'child-age-' + i;
      select.style = 'margin: 0 0 0 4px; padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc; min-width: 60px;';
      var defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.text = 'Select';
      select.appendChild(defaultOpt);
      for (let age = 0; age <= 17; age++) {
        var opt = document.createElement('option');
        opt.value = age;
        opt.text = age + ' yrs';
        select.appendChild(opt);
      }
      childDiv.appendChild(childLabel);
      childDiv.appendChild(select);
      container.appendChild(childDiv);
    }
  } else {
    section.style.display = 'none';
  }
}

// Attach to children counter buttons
jQuery(document).ready(function() {
  updateChildAgesSelectors();
  jQuery('.counter__button[data-target="children"]').on('click', function() {
    setTimeout(updateChildAgesSelectors, 50); // Wait for UI update
  });
});

// Enforce all child ages selected in search button click handler
var searchButton = document.getElementById("searchButton");
if (searchButton) {
  searchButton.addEventListener("click", function(e) {
    var children = parseInt(jQuery("#children-value").text());
    if (children > 0) {
      for (var i = 1; i <= children; i++) {
        var sel = document.getElementById('child-age-' + i);
        if (!sel || sel.value === '') {
          alert('Please select the age for child ' + i + '.');
          e.preventDefault();
          return false;
        }
      }
    }
    // ... rest of your search logic ...
  }, true); // Use capture to ensure this runs before other handlers
}
