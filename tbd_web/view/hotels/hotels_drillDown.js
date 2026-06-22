let hotelCoordinates = { lat: 19.094663, lng: 72.828269 }; // Default from API
let hotelName = "Hotel Sea Sands"; // Default from API

function updateMapLocation(lat, lng, name) {
	hotelCoordinates = { lat, lng };
	hotelName = name;
	// Reinitialize map if it's already loaded
	if (document.getElementById("map").innerHTML !== "Loading map...") {
		initMap();
	}
}
var GOOGLE_MAPS_API_KEY = "AIzaSyAMvFtpynq0eksNkck9NaQjQEXCh09n5RI"; // IMPORTANT: Replace with your actual API key
var MAP_ID = "DEMO_MAP_ID"; // Replace with your actual Map ID if you have one, or use a generic one for testing

async function initMap() {
	var mapElement = document.getElementById("map");
	if (!mapElement) {
		console.error("Map element not found.");
		return;
	}
	mapElement.classList.remove("loading");
	mapElement.innerHTML = "";

	// Check if Google Maps API and AdvancedMarkerElement are available
	if (
		typeof google !== "undefined" &&
		google.maps &&
		google.maps.marker &&
		google.maps.marker.AdvancedMarkerElement
	) {
		try {
			await createInteractiveMap(mapElement);
		} catch (error) {
			console.error(
				"Error creating interactive Advanced Marker map:",
				error
			);
			createStaticMap(mapElement);
		}
	} else {
		console.warn(
			"Google Maps API or AdvancedMarkerElement not fully loaded. Falling back to static map."
		);
		createStaticMap(mapElement);
	}
}

// Update your createInteractiveMap function to use dynamic coordinates
async function createInteractiveMap(mapElement) {
	var center = hotelCoordinates; // Use dynamic coordinates

	var { Map } = await google.maps.importLibrary("maps");
	var { AdvancedMarkerElement } = await google.maps.importLibrary(
		"marker"
	);

	var map = new Map(mapElement, {
		zoom: 14,
		center: center,
		mapId: MAP_ID,
		mapTypeControl: false,
		streetViewControl: false,
		fullscreenControl: true,
		zoomControl: true,
	});

	var markerEl = document.createElement("div");
	markerEl.className = "custom-map-marker";
	markerEl.innerHTML = '<i class="fas fa-map-marker-alt"></i>';

	var marker = new AdvancedMarkerElement({
		map: map,
		position: center,
		content: markerEl,
		title: hotelName, // Use dynamic hotel name
	});

	var infoWindow = new google.maps.InfoWindow({
		content: `
			<div style="padding: 10px; font-family: 'Poppins', sans-serif; max-width: 200px;">
				<h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${hotelName}</h3>
			</div>
		`,
		
		/*<p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Mumbai, India</p>
		<p style="margin: 0; color: #fcdc3c; font-weight: 600; font-size: 14px;">★ 5.0 · 39 reviews</p>*/
	});

	marker.addListener("gmp-click", () => {
		infoWindow.open({ map: map, anchor: marker });
	});

	infoWindow.open({ map: map, anchor: marker });
}

function createStaticMap(mapElement) {
	var centerCoordinates = "19.07668,72.85078";
	// Note: Static map API has limitations on custom marker appearance compared to JS API
	var staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerCoordinates}&zoom=14&size=600x400&maptype=roadmap&markers=color:0xfcdc3c%7Clabel:H%7C${centerCoordinates}&key=${GOOGLE_MAPS_API_KEY}`;

	mapElement.innerHTML = `
	<img src="${staticMapUrl}" alt="Map of Grand Hyatt Mumbai" class="static-map-image">
	<a href="https://maps.google.com/?q=Grand+Hyatt+Mumbai" target="_blank" class="static-map-overlay">
		<i class="fas fa-external-link-alt"></i> Open in Google Maps
	</a>
`;
}

window.gm_authFailure = function () {
	console.error(
		"Google Maps API authentication failed. Falling back to static map."
	);
	var mapElement = document.getElementById("map");
	if (mapElement) {
		mapElement.classList.remove("loading");
		mapElement.innerHTML = "";
		createStaticMap(mapElement);
	}
};

function loadGoogleMapsScript() {
	// Check if Google Maps API is already loaded or loading
	if (window.google && window.google.maps) {
		console.log('Google Maps API already loaded, initializing map directly');
		initMap();
		return;
	}
	
	// Check if script is already being loaded
	if (window.googleMapsLoading) {
		console.log('Google Maps API is already loading');
		return;
	}
	
	// Check if script tag already exists
	var existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
	if (existingScript) {
		console.log('Google Maps script tag already exists');
		return;
	}
	
	// Mark as loading
	window.googleMapsLoading = true;
	
	var script = document.createElement("script");
	// Ensure 'marker' library is requested for AdvancedMarkerElement
	script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=maps,marker&loading=async`;
	script.async = true;
	script.defer = true; // defer ensures HTML is parsed before script execution
	script.onload = function () {
		window.googleMapsLoading = false;
		console.log('Google Maps API loaded successfully');
	};
	script.onerror = function () {
		window.googleMapsLoading = false;
		console.error(
			"Failed to load Google Maps script. Falling back to static map."
		);
		var mapElement = document.getElementById("map");
		if (mapElement) {
			mapElement.classList.remove("loading");
			mapElement.innerHTML = "";
			createStaticMap(mapElement);
		}
	};
	document.head.appendChild(script);
}

// Search Animation Class (remains largely the same)
class SearchAnimation {
	constructor() {
		this.searchContainer = document.getElementById("searchContainer");
		this.searchBar = document.getElementById("searchBar");
		this.searchForm = document.getElementById("searchForm");
		this.searchOverlay = document.getElementById("searchOverlay");
		this.closeSearch = document.getElementById("closeSearch");
		this.searchFields = document.querySelectorAll(".search-field");
		this.searchFormButton = document.getElementById("searchFormButton");
		this.isExpanded = false;
		this.init();
	}

	// Add cleanup method to remove event listeners
	cleanup() {
		// Remove existing event listeners by cloning and replacing elements
		if (this.searchBar && this.searchBar.parentNode) {
			const newSearchBar = this.searchBar.cloneNode(true);
			this.searchBar.parentNode.replaceChild(newSearchBar, this.searchBar);
			this.searchBar = newSearchBar;
		}
		if (this.closeSearch && this.closeSearch.parentNode) {
			const newCloseSearch = this.closeSearch.cloneNode(true);
			this.closeSearch.parentNode.replaceChild(newCloseSearch, this.closeSearch);
			this.closeSearch = newCloseSearch;
		}
		if (this.searchOverlay && this.searchOverlay.parentNode) {
			const newSearchOverlay = this.searchOverlay.cloneNode(true);
			this.searchOverlay.parentNode.replaceChild(newSearchOverlay, this.searchOverlay);
			this.searchOverlay = newSearchOverlay;
		}
		if (this.searchFormButton && this.searchFormButton.parentNode) {
			const newSearchFormButton = this.searchFormButton.cloneNode(true);
			this.searchFormButton.parentNode.replaceChild(newSearchFormButton, this.searchFormButton);
			this.searchFormButton = newSearchFormButton;
		}
		// Re-select search fields after cloning
		this.searchFields = document.querySelectorAll(".search-field");
	}

	init() {
		// Clean up existing event listeners first
		this.cleanup();
		
		if (
			!this.searchBar ||
			!this.closeSearch ||
			!this.searchOverlay ||
			!this.searchFormButton
		) {
			// console.warn("Search animation elements not found, skipping initialization.");
			return;
		}
		this.searchBar.addEventListener("click", (e) => {
			if (!this.isExpanded) {
				e.preventDefault();
				this.expandSearch();
			}
		});
		this.closeSearch.addEventListener("click", () =>
			this.collapseSearch()
		);
		this.searchOverlay.addEventListener("click", () =>
			this.collapseSearch()
		);
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && this.isExpanded) {
				this.collapseSearch();
			}
		});
		this.searchFormButton.addEventListener("click", () =>
			this.handleSearch()
		);
		this.searchFields.forEach((field) => {
			field.addEventListener("click", () => this.handleFieldClick(field));
		});
	}

	expandSearch() {
		this.isExpanded = true;
		this.searchContainer.classList.add("expanded");
		this.searchBar.classList.add("expanded");
		this.searchOverlay.classList.add("active");
		setTimeout(() => {
			this.searchForm.classList.add("active");
			this.searchFields.forEach((field, index) => {
				setTimeout(() => field.classList.add("animate"), index * 100);
			});
			setTimeout(() => {
				this.searchFormButton.classList.add("animate");
				this.closeSearch.classList.add("animate");
			}, this.searchFields.length * 100);
		}, 200);
		document.body.style.overflow = "hidden";
	}

	collapseSearch() {
		this.isExpanded = false;
		this.searchFields.forEach((field) =>
			field.classList.remove("animate")
		);
		this.searchFormButton.classList.remove("animate");
		this.closeSearch.classList.remove("animate");
		setTimeout(() => {
			this.searchForm.classList.remove("active");
			this.searchOverlay.classList.remove("active");
		}, 100);
		setTimeout(() => {
			this.searchContainer.classList.remove("expanded");
			this.searchBar.classList.remove("expanded");
		}, 300);
		document.body.style.overflow = "";
	}

	handleFieldClick(field) {
		var fieldType = field.dataset.field;
		field.style.transform = "scale(0.98)";
		setTimeout(() => (field.style.transform = ""), 150);
		this.showNotification(
			`${
				fieldType.charAt(0).toUpperCase() + fieldType.slice(1)
			} picker would open here`
		);
	}

	handleSearch() {
		this.searchFormButton.innerHTML =
			'<i class="fas fa-spinner fa-spin"></i> Searching...';
		this.searchFormButton.style.pointerEvents = "none";
		setTimeout(() => {
			this.searchFormButton.innerHTML =
				'<i class="fas fa-check"></i> Search Complete!';
			setTimeout(() => {
				this.collapseSearch();
				this.searchFormButton.innerHTML =
					'<i class="fas fa-search"></i> Search';
				this.searchFormButton.style.pointerEvents = "";
			}, 1000);
		}, 2000);
	}

	showNotification(message) {
		var notification = document.createElement("div");
		notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #fcdc3c 0%, #fff59c 100%); color: #333; padding: 15px 20px; border-radius: 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 10000; font-weight: 500; transform: translateX(120%); transition: transform 0.3s ease;`;
		notification.textContent = message;
		document.body.appendChild(notification);
		setTimeout(
			() => (notification.style.transform = "translateX(0)"),
			100
		);
		setTimeout(() => {
			notification.style.transform = "translateX(120%)";
			if (document.body.contains(notification)) {
				setTimeout(() => document.body.removeChild(notification), 300);
			}
		}, 3000);
	}
}

// Airbnb-Style Layout Manager (remains largely the same)
class AirbnbLayoutManager {
	constructor() {
		this.reserveWidget = document.getElementById("reserveWidget");
		this.roomSelection = document.getElementById("roomSelection");
		this.init();
	}
	
	// Add cleanup method to disconnect observer
	cleanup() {
		if (this.observer) {
			this.observer.disconnect();
		}
	}
	
	init() {
		// Clean up existing observer first
		this.cleanup();
		
		if (!this.reserveWidget || !this.roomSelection) {
			// console.warn("Reserve widget or room selection element not found, scroll behavior disabled.");
			return;
		}
		this.createIntersectionObserver();
	}
	createIntersectionObserver() {
		var options = {
			root: null,
			rootMargin: "-50px 0px 0px 0px",
			threshold: 0.1,
		};
		this.observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.target === this.roomSelection) {
					if (entry.isIntersecting) this.scrollUpReserveWidget();
					else this.showReserveWidget();
				}
			});
		}, options);
		this.observer.observe(this.roomSelection);
	}
	scrollUpReserveWidget() {
		this.reserveWidget.classList.add("scroll-up");
	}
	showReserveWidget() {
		this.reserveWidget.classList.remove("scroll-up");
	}
	destroy() {
		if (this.observer) this.observer.disconnect();
	}
}

// Reserve Widget Functionality (remains largely the same)
class ReserveWidget {
	constructor() {
		this.init();
	}
	
	// Add cleanup method to remove event listeners
	cleanup() {
		// Remove existing event listeners by cloning and replacing elements
		document.querySelectorAll(".reserve-button, .reserve-mobile-button").forEach((button) => {
			if (button && button.parentNode) {
				const newButton = button.cloneNode(true);
				button.parentNode.replaceChild(newButton, button);
			}
		});
	}
	
	init() {
		// Clean up existing event listeners first
		this.cleanup();
		
		document
			.querySelectorAll(".reserve-button, .reserve-mobile-button")
			.forEach((button) => {
				button.addEventListener("click", () =>
					this.handleReservation(button)
				);
			});
		document.querySelectorAll(".reserve-date").forEach((field) => {
			field.addEventListener("click", () =>
				this.showNotification("Date picker would open here")
			);
		});
		document
			.querySelector(".reserve-guests")
			?.addEventListener("click", () => {
				this.showNotification("Guest selector would open here");
			});
	}
	handleReservation(button) {
		// Get the hotel data from the data-hotel-data attribute
		var hotelData = JSON.parse(
			button.getAttribute('data-hotel-data')
		);
		console.log('Navigating to room selection:', hotelData);

		// Navigate to room selection page
		// instead of directly calling preBookHotel
		showRoomSelectionPage(hotelData);
	}
	showNotification(message) {
		/* Same as SearchAnimation's showNotification */
		var notification = document.createElement("div");
		notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #fcdc3c 0%, #fff59c 100%); color: #333; padding: 15px 20px; border-radius: 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 10000; font-weight: 500; transform: translateX(120%); transition: transform 0.3s ease;`;
		notification.textContent = message;
		document.body.appendChild(notification);
		setTimeout(
			() => (notification.style.transform = "translateX(0)"),
			100
		);
		setTimeout(() => {
			notification.style.transform = "translateX(120%)";
			if (document.body.contains(notification)) {
				setTimeout(() => document.body.removeChild(notification), 300);
			}
		}, 3000);
	}
}

//document.addEventListener("DOMContentLoaded", () => {
function startDrillDown(data) {
	console.log('Hotel Drill Down Data', data);
	jQuery('.reserve-widget-mobile').css('display', 'block');
	
	// Load hotel data first
	loadHotelData(data);

	// Clean up existing instances before creating new ones
	if (window.currentSearchAnimation) {
		window.currentSearchAnimation.cleanup();
	}
	if (window.currentAirbnbLayoutManager) {
		window.currentAirbnbLayoutManager.cleanup();
	}
	if (window.currentReserveWidget) {
		window.currentReserveWidget.cleanup();
	}

	// Initialize other components
	window.currentSearchAnimation = new SearchAnimation();
	window.currentAirbnbLayoutManager = new AirbnbLayoutManager();
	window.currentReserveWidget = new ReserveWidget();

	// Load Google Maps only once
	if (!window.googleMapsInitialized) {
		loadGoogleMapsScript();
		window.googleMapsInitialized = true;
	} else {
		// If already initialized, just update the map
		if (window.google && window.google.maps) {
			initMap();
		}
	}

	// Existing button functionality...
	document
		.querySelectorAll(
			"button:not(#searchFormButton):not(#closeSearch):not(.reserve-button):not(.reserve-mobile-button)"
		)
		.forEach((button) => {
			button.addEventListener("click", function () {
				if (!this.classList.contains("loading-active")) {
					var originalText = this.innerHTML;
					this.classList.add("loading-active");
					this.innerHTML =
						'<i class="fas fa-spinner fa-spin"></i> Loading...';
					this.disabled = true;
					setTimeout(() => {
						this.classList.remove("loading-active");
						this.innerHTML = originalText;
						this.disabled = false;
					}, 1500);
				}
			});
		});
	
	//Save hotel data to reserve buttons data-hotel-data attribute
	jQuery('.reserve-mobile-button, .reserve-button').attr('data-hotel-data', JSON.stringify(data));
	
	jQuery('.container, .reserve-widget-mobile').removeClass('hidden');

	// Scroll to top of page on entry
	window.scrollTo(0, 0);

	if (typeof HotelUrlManager !== 'undefined') {
		HotelUrlManager.updateUrlForDrillDown(
			data.CityName || '',
			data.HotelName || '',
			data.HotelCode || data.hotelCode || '',
		);
	}
}
//});

// Add this function to handle API integration
async function loadHotelData(data) {
	try {
		// Populate hotel data
		populateHotelData(data);
	} catch (error) {
		console.error("Error loading hotel data:", error);
	}
}

// --- Room Selection Page Navigation ---

function showRoomSelectionPage(hotelData) {
	// Hide drill-down page and mobile reserve widget
	jQuery('#drillContainer').addClass('hidden');
	jQuery('.reserve-widget-mobile').css('display', 'none');

	// Update room selection page header
	var hotelNameEl = document.getElementById(
		'roomSelectionHotelName'
	);
	if (hotelNameEl) {
		hotelNameEl.textContent = hotelData.HotelName || '';
	}

	// Render room cards into the new page container
	renderRoomCards(
		hotelData.rooms,
		hotelData.Images || [],
	);

	// Show room selection page
	jQuery('#roomSelectionPage').removeClass('hidden');

	// Scroll to top of page
	window.scrollTo(0, 0);

	if (typeof HotelUrlManager !== 'undefined') {
		HotelUrlManager.updateUrlForRoomSelection(
			hotelData.CityName || '',
			hotelData.HotelName || '',
			hotelData.HotelCode || hotelData.hotelCode || '',
		);
	}
}

function backToDrillDown() {
	// Hide room selection page
	jQuery('#roomSelectionPage').addClass('hidden');

	// Clear room selection cards to avoid stale data on re-entry
	var roomContainer = document.getElementById(
		'roomSelectionCardsContainer'
	);
	if (roomContainer) roomContainer.innerHTML = '';

	// Show drill-down page and mobile reserve widget
	jQuery('#drillContainer').removeClass('hidden');
	jQuery('.reserve-widget-mobile').css('display', 'block');

	// Scroll to top of page
	window.scrollTo(0, 0);

	if (typeof HotelUrlManager !== 'undefined' && window.currentHotelData) {
		var hd = window.currentHotelData;
		HotelUrlManager.updateUrlForDrillDown(
			hd.CityName || '',
			hd.HotelName || '',
			hd.HotelCode || hd.hotelCode || '',
		);
	}
}

// --- Back to Results from Drill-Down ---
function backToResults() {
	// Hide drill-down page and mobile reserve widget
	jQuery('#drillContainer').addClass('hidden');
	jQuery('.reserve-widget-mobile').css('display', 'none');

	// Also hide room selection page if visible
	jQuery('#roomSelectionPage').addClass('hidden');

	// Clear room selection cards
	var roomContainer = document.getElementById(
		'roomSelectionCardsContainer'
	);
	if (roomContainer) roomContainer.innerHTML = '';

	// Clear hotel data from reserve buttons
	jQuery('.reserve-mobile-button, .reserve-button')
		.attr('data-hotel-data', null);

	// Clear global hotel data
	window.currentHotelData = null;

	// Clean up component instances
	if (window.currentSearchAnimation) {
		window.currentSearchAnimation.cleanup();
		window.currentSearchAnimation = null;
	}
	if (window.currentAirbnbLayoutManager) {
		window.currentAirbnbLayoutManager.cleanup();
		window.currentAirbnbLayoutManager = null;
	}
	if (window.currentReserveWidget) {
		window.currentReserveWidget.cleanup();
		window.currentReserveWidget = null;
	}

	// Show results page
	jQuery('#hotelResultsPage')
		.removeClass('hidden')
		.addClass('show');

	// Scroll to top of page
	window.scrollTo(0, 0);

	if (typeof HotelUrlManager !== 'undefined') {
		var city = HotelUrlManager.getLastCity() ||
			jQuery('#resultsLocation').text() || '';
		if (city) {
			HotelUrlManager.updateUrlForResults(
				city,
				HotelUrlManager.getCurrentSearchParams(),
			);
		}
	}
}

// --- Back to Search from Results ---
function backToSearch() {
	// Hide results page
	jQuery('#hotelResultsPage')
		.removeClass('show')
		.addClass('hidden');

	// Show main search page
	jQuery('.page').removeClass('hidden');
	
	// Clear out the children of the results-list div
	jQuery('#resultsList').empty();

	// Scroll to top of page
	window.scrollTo(0, 0);

	if (typeof HotelUrlManager !== 'undefined') {
		HotelUrlManager.updateUrlForSearch();
	}
}

function renderRoomCards(rooms, hotelImages = []) {
    const container = document.getElementById(
        'roomSelectionCardsContainer'
    );
    if (!container) return;
    container.innerHTML = '';
    // Track used hotel images to avoid repeats
    let usedHotelImages = new Set();
	let hotelImageIdx = 0;
	
	
    rooms.forEach((room, idx) => {
        let imgSrc = '';
        if (room.roomImage) {
            imgSrc = room.roomImage;
        } else if (hotelImages.length > 0) {
            // Find next unused hotel image
            while (hotelImageIdx < hotelImages.length && usedHotelImages.has(hotelImages[hotelImageIdx])) {
                hotelImageIdx++;
            }
            if (hotelImageIdx < hotelImages.length) {
                imgSrc = hotelImages[hotelImageIdx];
                usedHotelImages.add(imgSrc);
                hotelImageIdx++;
            } else {
                // If all images used, fallback to first
                imgSrc = hotelImages[0];
            }
        } else {
            // Fallback static image
            imgSrc = "https://images.unsplash.com/photo-1568495248636-6432b97bd949?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
        }
        const basePrice = room.DayRates?.[0]?.[0]?.BasePrice || 0;
        const totalTax = room.TotalTax || 0;
        const isRefundable = room.IsRefundable ? "Refundable" : "Non-Refundable";
        const mealType = room.MealType ? room.MealType.replace("_", " ") : "";
        const inclusions = room.Inclusion ? room.Inclusion.split(",") : [];
        const card = document.createElement('div');
        card.className = 'room-card';
        card.innerHTML = `
            <div class="room-image">
                <img src="${imgSrc}" alt="${room.Name?.[0] || 'Room'}" />
                <div class="room-image-info">
                    <h3>${room.Name?.[0] || ''}</h3>
                    <div class="room-meta">
                        <span><i class="fas fa-expand-arrows-alt"></i> -- sq.ft</span>
                        <span><i class="fas fa-water"></i> ${room.Name?.[0]?.includes('Ocean') ? 'Ocean view' : 'City view'}</span>
                        <span><i class="fas fa-bed"></i> ${room.Name?.[0]?.includes('King') ? 'King bed' : 'Twin beds'}</span>
                    </div>
                </div>
            </div>
            <div class="room-details">
                <h3>Room with Breakfast</h3>
                ${inclusions.length > 0 || mealType || isRefundable ? `
                <ul>
                    ${inclusions.map(inc => `<li>${inc}</li>`).join('')}
                    ${mealType ? `<li>Meal Type: ${mealType}</li>` : ''}
                    <li>${isRefundable}</li>
                </ul>` : ''}
            </div>
            <div class="room-price">
                <div class="room-price-info">
                    <h3>₹ ${Math.round(basePrice)}</h3>
                    <p>+₹ ${Math.round(totalTax)} Taxes & Fees per night</p>
                </div>
                <button class="select-room-btn" data-room-idx="${idx}">
                    <i class="fas fa-check"></i> Select Room
                </button>
                <p class="room-login-hint">
                    <strong>Login Now</strong>
                    and get this for ₹${Math.round(basePrice - 76)} or less
                </p>
            </div>
        `;
        container.appendChild(card);
	});
	
	var isGuestUser = localStorage.getItem('isGuestUser') || false;
	if (!isGuestUser) {
		jQuery('.room-login-hint').addClass('hidden');
	} else {
		jQuery('.room-login-hint').removeClass('hidden');
	}
	
    container.querySelectorAll('.select-room-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = this.getAttribute('data-room-idx');
            const selectedRoom = rooms[idx];
            console.log(
                'Selected room:',
                selectedRoom.Name[0],
                'BookingCode:',
                selectedRoom.BookingCode,
            );
            showLoader();
            jsInit('preBookHotel', {
                bookingCode: selectedRoom.BookingCode,
            });
        });
    });
}

function populateHotelData(hotel) {
	// Store hotel data globally for room selection page
	window.currentHotelData = hotel;

	// Update hotel name
	jQuery('.title-share-save h1').text(hotel.HotelName);
	// document.querySelector("h1").textContent = hotel.HotelName;
	// document.querySelector(".hotel-title").textContent = `${getStarRating(
	// 	hotel.HotelRating
	// )} Hotel in ${hotel.CityName}, ${hotel.CountryName}`;

	// Update description
	var description = extractDescription(hotel.Description);
	var descriptionElement = document.querySelector(".description p");
	if (descriptionElement) {
		descriptionElement.innerHTML = description;
	}

	// Update facilities/amenities
	updateAmenities(hotel.HotelFacilities);

	// Update map coordinates
	var [lat, lng] = hotel.Map.split("|");
	updateMapLocation(parseFloat(lat), parseFloat(lng), hotel.HotelName);

	// Update contact info
	updateContactInfo(hotel);

	// Update attractions/nearby places
	updateAttractions(hotel.Attractions["1) "]);

	// Update images
	updateHotelImages(hotel.Images);

	// Room cards are now rendered on the room selection page
	// when user clicks "Select Rooms"

	// Update pricing
	updatePricing(hotel.rooms);

	// Update address and location info
	updateLocationInfo(hotel);

	// Update check-in/check-out times
	updateCheckInOutTimes(hotel);
}

function getStarRating(rating) {
	var stars = "★".repeat(rating) + "☆".repeat(5 - rating);
	return `${rating}-Star (${stars})`;
}

function extractDescription(htmlDescription) {
	// Extract clean description from HTML-formatted API response
	var tempDiv = document.createElement("div");
	tempDiv.innerHTML = htmlDescription;

	// Find location paragraph
	var locationP = Array.from(tempDiv.querySelectorAll("p")).find((p) =>
		p.textContent.includes("Location :")
	);

	return locationP
		? locationP.textContent.replace("Location :", "").trim()
		: "Comfortable accommodation in a convenient location.";
}

function updateAmenities(facilities) {
	const amenitiesList = document.querySelector('.amenities-column');
	if (!amenitiesList || !facilities || facilities.length === 0) return;

	// Clear existing amenities
	amenitiesList.innerHTML = '';

	// Add all facilities as amenity items
	facilities.forEach((facility, index) => {
		const li = document.createElement('li');
		li.className = 'amenity-item';
		li.textContent = facility;
		
		// Hide amenities beyond first 5 by default
		if (index >= 5) {
			li.classList.add('hidden');
		}
		
		amenitiesList.appendChild(li);
	});

	// Reinitialize the amenities manager if it exists
	if (window.amenitiesManager) {
		window.amenitiesManager.amenityItems = document.querySelectorAll('.amenity-item');
		window.amenitiesManager.setInitialState();
	}
}

function updateContactInfo(hotel) {
	// You can add contact info display elements to your HTML if needed
	console.log("Hotel Contact:", {
		phone: hotel.PhoneNumber,
		address: hotel.Address,
		pincode: hotel.PinCode,
	});
}

function updateAttractions(attractions) {
	// Parse attractions HTML and update nearby places
	var tempDiv = document.createElement("div");
	tempDiv.innerHTML = attractions;

	// Extract distances and create a formatted string
	var distanceText = tempDiv.textContent.replace(/\s+/g, " ").trim();

	// Update the existing description or create new attractions section
	var existingDesc = document.querySelector(".description");
	if (existingDesc) {
		// Remove existing attractions if any
		var existingAttractions =
			existingDesc.querySelector("p:last-child");
		if (
			existingAttractions &&
			existingAttractions.textContent.includes("Nearby Attractions")
		) {
			existingAttractions.remove();
		}

		var attractionsP = document.createElement("p");
		attractionsP.innerHTML = `<strong>Nearby Attractions:</strong> ${distanceText.substring(
			0,
			200
		)}...`;
		existingDesc.appendChild(attractionsP);
	}
}

function updateHotelImages(images) {
	if (!images || images.length === 0) return;

	// Update main image
	var mainImage = document.querySelector(".main-image img");
	if (mainImage && images[0]) {
		mainImage.src = images[0];
		mainImage.alt = "Main hotel view";
	}

	// Update side images
	var sideImages = document.querySelectorAll(".side-images img");
	for (let i = 0; i < Math.min(sideImages.length, 4); i++) {
		if (images[i + 1]) {
			sideImages[i].src = images[i + 1];
			sideImages[i].alt = `Hotel image ${i + 1}`;
		}
	}

	// Update room image
	var roomImage = document.querySelector(".room-image img");
	if (roomImage && images[0]) {
		roomImage.src = images[0];
		roomImage.alt = "Room view";
	}

	// Add click event to "Show more" button
	const showMoreBtn = document.querySelector('.show-more');
	if (showMoreBtn) {
		showMoreBtn.addEventListener('click', () => {
			openImageCarousel(images, 0);
		});
	}

	// Add click events to all hotel images to open carousel
	const allHotelImages = document.querySelectorAll('.main-image img, .side-images img');
	allHotelImages.forEach((img, index) => {
		img.addEventListener('click', () => {
			openImageCarousel(images, index);
		});
		img.style.cursor = 'pointer';
	});
}

function updateRoomInformation(rooms) {
	if (!rooms || rooms.length === 0) return;

	var room = rooms[0];
	var roomNameElement = document.querySelector(".room-details h3");
	if (roomNameElement && room.Name && room.Name[0]) {
		roomNameElement.textContent = room.Name[0];
	}

	// Update room details list
	var roomDetailsList = document.querySelector(".room-details ul");
	if (roomDetailsList) {
		var details = [];
		if (room.Inclusion) details.push(room.Inclusion);
		if (room.MealType)
			details.push(`Meal Type: ${room.MealType.replace("_", " ")}`);
		if (room.IsRefundable !== undefined)
			details.push(room.IsRefundable ? "Refundable" : "Non-Refundable");

		roomDetailsList.innerHTML = details
			.map((detail) => `<li>${detail}</li>`)
			.join("");
	}
}

function updatePricing(rooms) {
	if (!rooms || rooms.length === 0) return;

	var room = rooms[0];
	var basePrice =
		room.DayRates && room.DayRates[0] && room.DayRates[0][0]
			? room.DayRates[0][0].BasePrice
			: 0;
	var totalFare = room.TotalFare || basePrice;
	var totalTax = room.TotalTax || 0;
	var netAmount = room.NetAmount || totalFare;

	// Calculate TDS breakdown
	var tdsBreakdown = calculateTDSBreakdown(room);

	// Update reserve widget price - show TotalFare for display
	var reservePrice = document.querySelector(".reserve-price");
	if (reservePrice) {
		reservePrice.innerHTML = `<span class="currency">₹</span>${Math.round(
			totalFare
		)}<span class="period">per night</span>`;
	}

	// Update mobile reserve price
	var mobilePrice = document.querySelector(".reserve-mobile-price");
	if (mobilePrice) {
		mobilePrice.innerHTML = `₹${Math.round(
			totalFare
		)}<span style="font-size: 14px; font-weight: 400; color: #666">per night</span>`;
	}

	// Update room price
	var roomPrice = document.querySelector(".room-price h3");
	if (roomPrice) {
		roomPrice.textContent = `₹ ${Math.round(totalFare)}`;
	}

	// Update breakdown with TDS information
	var breakdownItems = document.querySelectorAll(
		".reserve-breakdown-item"
	);
	if (breakdownItems.length >= 4) {
		// Base price × nights
		breakdownItems[0].innerHTML = `<span>₹${Math.round(
			totalFare
		)} × 4 nights</span><span>₹${Math.round(totalFare * 4)}</span>`;

		// TDS if applicable
		if (tdsBreakdown.hasTDS) {
			breakdownItems[1].innerHTML = `<span>TDS (${tdsBreakdown.tdsPercentage.toFixed(1)}%)</span><span>₹${Math.round(tdsBreakdown.tdsAmount * 4)}</span>`;
			breakdownItems[2].innerHTML = `<span>Net Amount</span><span>₹${Math.round(netAmount * 4)}</span>`;
		} else {
			// Cleaning fee (mock)
			breakdownItems[1].innerHTML = `<span>Cleaning fee</span><span>₹${Math.round(
				totalFare * 0.1
			)}</span>`;

			// Service fee (mock)
			breakdownItems[2].innerHTML = `<span>Service fee</span><span>₹${Math.round(
				totalFare * 0.15
			)}</span>`;
		}

		// Total - use NetAmount for booking
		var total = tdsBreakdown.hasTDS ? 
			Math.round(netAmount * 4) : 
			Math.round(totalFare * 4) + Math.round(totalFare * 0.1) + Math.round(totalFare * 0.15);
		breakdownItems[3].innerHTML = `<span>Total</span><span>₹${total}</span>`;
	}

	// Store room data for booking
	window.hotelResult = {
		Rooms: [room]
	};
}

function updateLocationInfo(hotel) {
	// Update map section location
	var mapHeader = document.querySelector(".map-header h2");
	if (mapHeader) {
		mapHeader.textContent = `Where you'll be in ${hotel.CityName},`;
	}

	var mapLocation = document.querySelector(".map-header p");
	if (mapLocation) {
		mapLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${
			hotel.CityName
		}, ${hotel.CountryName} - ${hotel.Address.split(",")[0]}`;
	}
}

function updateCheckInOutTimes(hotel) {
	// You can add check-in/check-out time display if needed
	console.log("Check-in/Check-out times:", {
		checkIn: hotel.CheckInTime,
		checkOut: hotel.CheckOutTime,
	});
}

// Amenities Expand/Collapse Functionality
class AmenitiesManager {
	constructor() {
		this.amenitiesList = document.getElementById('amenitiesList');
		this.showAmenitiesBtn = document.getElementById('showAmenitiesBtn');
		this.amenityItems = document.querySelectorAll('.amenity-item');
		this.isExpanded = false;
		this.init();
	}

	init() {
		if (!this.amenitiesList || !this.showAmenitiesBtn) {
			return;
		}

		// Add CSS styles dynamically
		this.addStyles();
		
		// Set initial state
		this.setInitialState();
		
		// Add event listener
		this.showAmenitiesBtn.addEventListener('click', () => {
			this.toggleAmenities();
		});
	}

	addStyles() {
		const style = document.createElement('style');
		style.textContent = `
			.amenities-list {
				overflow: hidden;
			}
			
			.amenities-column {
				list-style: none;
				padding: 0;
				margin: 0;
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 4px 40px;
			}
			
			.amenity-item {
				padding: 10px 0;
				font-weight: 500;
				font-size: 15px;
				color: #444;
				position: relative;
				padding-left: 30px;
				opacity: 1;
				transform: translateY(0);
				transition: opacity 0.3s ease, transform 0.3s ease;
				border-bottom: 1px solid #f0f0f0;
			}
			
			.amenity-item::before {
				content: "✓";
				position: absolute;
				left: 0;
				color: #2ecc71;
				font-weight: bold;
				font-size: 16px;
			}
			
			.amenity-item.hidden {
				display: none;
			}
			
			.amenity-item.show {
				display: list-item;
				opacity: 1;
				transform: translateY(0);
			}
			
			.show-amenities {
				background: linear-gradient(135deg, #fcdc3c 0%, #fff59c 100%);
				color: #333;
				border: none;
				padding: 12px 30px;
				border-radius: 25px;
				font-weight: 600;
				cursor: pointer;
				transition: all 0.3s ease;
				box-shadow: 0 6px 20px rgba(252, 220, 60, 0.3);
				display: inline-flex;
				align-items: center;
				gap: 8px;
				margin-top: 20px;
			}
			
			.show-amenities:hover {
				transform: translateY(-2px);
				box-shadow: 0 8px 25px rgba(252, 220, 60, 0.4);
			}
			
			.show-amenities.expanded i {
				transform: rotate(180deg);
			}
			
			.show-amenities i {
				transition: transform 0.3s ease;
			}
			
			@media (max-width: 768px) {
				.amenities-column {
					grid-template-columns: 1fr;
					gap: 0;
				}
				
				.amenity-item {
					padding: 8px 0;
					padding-left: 28px;
					font-size: 14px;
				}
				
				.show-amenities {
					padding: 10px 20px;
					font-size: 14px;
					width: 100%;
					justify-content: center;
				}
			}
			
			@media (max-width: 480px) {
				.amenity-item {
					padding: 7px 0;
					font-size: 13px;
					padding-left: 24px;
				}
				
				.show-amenities {
					padding: 8px 16px;
					font-size: 13px;
				}
			}
		`;
		document.head.appendChild(style);
	}

	setInitialState() {
		// Show only first 5 amenities by default
		this.amenityItems.forEach((item, index) => {
			if (index >= 5) {
				item.classList.add('hidden');
			}
		});
	}

	toggleAmenities() {
		this.isExpanded = !this.isExpanded;
		
		if (this.isExpanded) {
			this.expandAmenities();
		} else {
			this.collapseAmenities();
		}
	}

	expandAmenities() {
		this.amenityItems.forEach((item, index) => {
			if (index >= 5) {
				setTimeout(() => {
					item.classList.remove('hidden');
					item.classList.add('show');
					requestAnimationFrame(() => {
						item.style.opacity = '1';
						item.style.transform = 'translateY(0)';
					});
				}, (index - 5) * 40);
			}
		});

		this.showAmenitiesBtn.innerHTML =
			'<i class="fas fa-chevron-up"></i> Show less';
		this.showAmenitiesBtn.classList.add('expanded');
	}

	collapseAmenities() {
		const hiddenItems = [];
		this.amenityItems.forEach((item, index) => {
			if (index >= 5) hiddenItems.push(item);
		});

		hiddenItems.reverse().forEach((item, i) => {
			setTimeout(() => {
				item.style.opacity = '0';
				item.style.transform = 'translateY(-4px)';
				setTimeout(() => {
					item.classList.remove('show');
					item.classList.add('hidden');
					item.style.opacity = '';
					item.style.transform = '';
				}, 200);
			}, i * 25);
		});

		this.showAmenitiesBtn.innerHTML =
			'<i class="fas fa-chevron-down"></i> Show all amenities';
		this.showAmenitiesBtn.classList.remove('expanded');
	}
}

// Initialize amenities manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	window.amenitiesManager = new AmenitiesManager();
});

// Image Carousel Class
class ImageCarousel {
	constructor() {
		this.modal = document.getElementById('carouselModal');
		this.overlay = document.getElementById('carouselOverlay');
		this.closeBtn = document.getElementById('carouselClose');
		this.prevBtn = document.getElementById('carouselPrev');
		this.nextBtn = document.getElementById('carouselNext');
		this.image = document.getElementById('carouselImage');
		this.imageContainer = document.querySelector('.carousel-image-container');
		this.currentIndexElement = document.getElementById('currentImageIndex');
		this.totalImagesElement = document.getElementById('totalImages');
		this.titleElement = document.getElementById('carouselTitle');
		this.thumbnailsContainer = document.getElementById('carouselThumbnails');
		
		this.images = [];
		this.currentIndex = 0;
		this.isOpen = false;
		this.touchStartX = 0;
		this.touchEndX = 0;
		
		this.init();
	}

	init() {
		// Event listeners
		this.closeBtn.addEventListener('click', () => this.close());
		this.overlay.addEventListener('click', () => this.close());
		this.prevBtn.addEventListener('click', () => this.previous());
		this.nextBtn.addEventListener('click', () => this.next());
		
		// Keyboard navigation
		document.addEventListener('keydown', (e) => this.handleKeydown(e));
		
		// Touch events for mobile swipe
		this.imageContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e));
		this.imageContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e));
		
		// Close on escape key
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isOpen) {
				this.close();
			}
		});
	}

	open(images, startIndex = 0) {
		this.images = images;
		this.currentIndex = startIndex;
		this.isOpen = true;
		
		// Update modal
		this.modal.classList.add('active');
		this.totalImagesElement.textContent = this.images.length;
		
		// Load first image
		this.loadImage(this.currentIndex);
		this.updateThumbnails();
		this.updateNavigation();
		
		// Prevent body scroll
		document.body.style.overflow = 'hidden';
		
		// Focus management for accessibility
		this.closeBtn.focus();
	}

	close() {
		this.isOpen = false;
		this.modal.classList.remove('active');
		document.body.style.overflow = '';
		
		// Clear images to free memory
		this.images = [];
		this.currentIndex = 0;
	}

	loadImage(index) {
		if (index < 0 || index >= this.images.length) return;
		
		this.currentIndex = index;
		const imageUrl = this.images[index];
		
		// Show loading state
		this.imageContainer.classList.add('loading');
		this.image.classList.add('loading');
		
		// Update counter and title
		this.currentIndexElement.textContent = index + 1;
		this.titleElement.textContent = `Hotel Image ${index + 1}`;
		
		// Load image
		const img = new Image();
		img.onload = () => {
			this.image.src = imageUrl;
			this.image.alt = `Hotel image ${index + 1}`;
			this.imageContainer.classList.remove('loading');
			this.image.classList.remove('loading');
		};
		img.onerror = () => {
			this.image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
			this.image.alt = 'Image not available';
			this.imageContainer.classList.remove('loading');
			this.image.classList.remove('loading');
		};
		img.src = imageUrl;
		
		// Update thumbnail selection
		this.updateThumbnailSelection();
	}

	previous() {
		if (this.currentIndex > 0) {
			this.loadImage(this.currentIndex - 1);
		}
		this.updateNavigation();
	}

	next() {
		if (this.currentIndex < this.images.length - 1) {
			this.loadImage(this.currentIndex + 1);
		}
		this.updateNavigation();
	}

	updateNavigation() {
		this.prevBtn.disabled = this.currentIndex === 0;
		this.nextBtn.disabled = this.currentIndex === this.images.length - 1;
	}

	updateThumbnails() {
		this.thumbnailsContainer.innerHTML = '';
		
		this.images.forEach((imageUrl, index) => {
			const thumbnail = document.createElement('img');
			thumbnail.src = imageUrl;
			thumbnail.alt = `Thumbnail ${index + 1}`;
			thumbnail.className = 'carousel-thumbnail';
			thumbnail.dataset.index = index;
			
			thumbnail.addEventListener('click', () => {
				this.loadImage(index);
				this.updateNavigation();
			});
			
			this.thumbnailsContainer.appendChild(thumbnail);
		});
	}

	updateThumbnailSelection() {
		const thumbnails = this.thumbnailsContainer.querySelectorAll('.carousel-thumbnail');
		thumbnails.forEach((thumb, index) => {
			thumb.classList.toggle('active', index === this.currentIndex);
		});
	}

	handleKeydown(e) {
		if (!this.isOpen) return;
		
		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				this.previous();
				break;
			case 'ArrowRight':
				e.preventDefault();
				this.next();
				break;
		}
	}

	handleTouchStart(e) {
		this.touchStartX = e.changedTouches[0].screenX;
	}

	handleTouchEnd(e) {
		this.touchEndX = e.changedTouches[0].screenX;
		this.handleSwipe();
	}

	handleSwipe() {
		const swipeThreshold = 50;
		const diff = this.touchStartX - this.touchEndX;
		
		if (Math.abs(diff) > swipeThreshold) {
			if (diff > 0) {
				// Swipe left - next image
				this.next();
			} else {
				// Swipe right - previous image
				this.previous();
			}
		}
	}
}

// Initialize carousel when DOM is loaded
let imageCarousel;
document.addEventListener("DOMContentLoaded", () => {
	imageCarousel = new ImageCarousel();
});

// Function to open carousel with hotel images
function openImageCarousel(images, startIndex = 0) {
	if (imageCarousel) {
		imageCarousel.open(images, startIndex);
	}
}