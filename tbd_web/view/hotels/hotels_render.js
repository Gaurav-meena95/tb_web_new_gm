// Global state for sort / filter
let ALL_HOTELS = [];
let CURRENT_HOTELS = [];


// Bottom sheet helpers
function openSheet(sheet, overlay) {
	if (!sheet || !overlay) {
		console.error('Bottom sheet elements missing');
		return;
	}

	// CSS class (if present)
	sheet.classList.add('show');
	overlay.classList.add('show');

	// Fallback inline styles (in case CSS is missing)
	sheet.style.transform = 'translateY(0)';
	sheet.style.visibility = 'visible';
	overlay.style.display = 'block';

	document.body.style.overflow = 'hidden';
}

function closeSheet(sheet, overlay) {
	if (!sheet || !overlay) return;

	sheet.classList.remove('show');
	overlay.classList.remove('show');

	// Fallback inline styles
	sheet.style.transform = 'translateY(100%)';
	sheet.style.visibility = 'hidden';
	overlay.style.display = 'none';

	document.body.style.overflow = '';
}

// --- REUSABLE hotel card builder ---
function createHotelCard(hotel) {

	var fallbackImg = 'https://s3.ap-south-1.amazonaws.com/tbd-prod-media/travel_buddy_cms/Manali-Solang-kasol CM Image 1.png';
	var images = [];

	if (hotel.Images && hotel.Images.length > 0) {
		images = hotel.Images;
	} else if (hotel.HotelPicture) {
		images = [hotel.HotelPicture];
	} else {
		images = [fallbackImg];
	}

	var card = document.createElement('div');
	card.className = 'hotel-card';
	card.setAttribute(
		'data-hotel',
		encodeURIComponent(JSON.stringify(hotel))
	);

	let supplementsHtml = '';
	if (
		hotel.rooms && hotel.rooms[0] &&
		hotel.rooms[0].Supplements &&
		hotel.rooms[0].Supplements.length > 0
	) {
		const supplementsArr = hotel.rooms[0].Supplements.flat();
		supplementsHtml =
			`<div class="hotel-supplements"><b>Supplements:</b><ul>` +
			supplementsArr.map(sup =>
				`<li>
					<span class="supp-desc">${sup.Description || ''}</span>
					<span class="supp-type">(${sup.Type || ''})</span>
					<span class="supp-price">${sup.Price || ''} ${sup.Currency || ''}</span>
				</li>`
			).join('') +
			`</ul></div>`;
	}

	var imagesHtml = images.map(function(src, i) {
		return `<img class="hotel-card-img" src="${src}" alt="${hotel.HotelName || ''} - ${i + 1}" loading="lazy">`;
	}).join('');

	var dotsHtml = images.length > 1
		? `<div class="carousel-dots-wrapper"><div class="carousel-dots">${images.map(function(_, i) {
				return `<span class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`;
			}).join('')}</div></div>`
		: '';

	var arrowsHtml = images.length > 1
		? `<button class="carousel-arrow carousel-arrow-left" aria-label="Previous image">‹</button>
		   <button class="carousel-arrow carousel-arrow-right" aria-label="Next image">›</button>`
		: '';

	card.innerHTML = `
		<div class="hotel-card-carousel">
			<div class="carousel-track">${imagesHtml}</div>
			${arrowsHtml}
			${dotsHtml}
		</div>
		<div class="hotel-card-content">
			<div class="hotel-card-title">${hotel.HotelName || ''}</div>
			<div class="hotel-card-location">${hotel.Address || ''}</div>
			<div class="hotel-card-rating">★ ${hotel.HotelRating ? hotel.HotelRating : 'N/A'} Star Hotel</div>
			<div class="hotel-card-price">
				₹${hotel.rooms[0]?.DayRates[0][0].BasePrice ? Math.round(hotel.rooms[0]?.DayRates[0][0].BasePrice) : 'N/A'} for 1 night
				${hotel.rooms[0]?.NetAmount && hotel.rooms[0].NetAmount !== hotel.rooms[0].TotalFare
					? `<br><small style="color: #666;">Net: ₹${Math.round(hotel.rooms[0].NetAmount)}</small>`
					: ''}
			</div>
			<div class="hotel-card-nights">
				${hotel.rooms.length} room${hotel.rooms.length !== 1 ? 's' : ''} available
			</div>
			${hotel.rooms[0]?.MealType && hotel.rooms[0].MealType.toLowerCase() !== 'room_only'
				? `<div class="hotel-card-room-meal">
						<b>Meal Type:</b> ${hotel.rooms[0].MealType.replace(/_/g, ' ')}
				   </div>`
				: ''}
			${hotel.rooms[0]?.IsRefundable === true
				? `<div class="hotel-card-room-refundable-badge">
						<span class="refundable-tick">✔️</span>
						<span class="refundable-text">Refundable</span>
				   </div>`
				: ''}
			${supplementsHtml}
		</div>
	`;

	return card;
}

function renderHotelsSearchResults(response) {
	console.log(response);
	// HotelDetails & HotelResults are in response.object.HotelDetails & response.object.HotelResults and are arrays of objects and can be mapped using HotelCodes so that we can get the hotel details and rooms for each hotel in a single object
	var hotelDetails = response.object.HotelDetails;
	var hotelRooms = response.object.HotelResult;
	
	// Create a map of hotel details using hotel_code as key for quick lookup
	var hotelDetailsMap = {};
	hotelDetails.forEach(function(hotel) {
		hotelDetailsMap[hotel.hotel_code] = hotel;
	});
	
	// Create unified hotel objects by combining details and rooms
	var hotelUnifiedDetails = [];
	hotelRooms.forEach(function(hotelRoom) {
		var hotelCode = hotelRoom.HotelCode;
		var hotelDetail = hotelDetailsMap[hotelCode];
		
		if (hotelDetail) {
			// Map database fields to frontend expected format
			var unifiedHotel = {
				// Map hotel details to expected format
				HotelCode: hotelDetail.hotel_code,
				HotelName: hotelDetail.hotel_name,
				Description: hotelDetail.description,
				HotelFacilities: hotelDetail.hotel_facilities,
				Attractions: hotelDetail.attractions,
				Images: hotelDetail.images,
				Address: hotelDetail.address,
				PinCode: hotelDetail.pin_code,
				CityId: hotelDetail.city_id,
				CountryName: hotelDetail.country_name,
				PhoneNumber: hotelDetail.phone_number,
				FaxNumber: hotelDetail.fax_number,
				Map: hotelDetail.map_coordinates,
				HotelRating: hotelDetail.hotel_rating,
				CityName: hotelDetail.city_name,
				CountryCode: hotelDetail.country_code,
				CheckInTime: hotelDetail.check_in_time,
				CheckOutTime: hotelDetail.check_out_time,
				CityCode: hotelDetail.city_code,
				
				// Add room information
				rooms: hotelRoom.Rooms || [],
				hotelCode: hotelCode,
				minPrice: hotelRoom.MinHotelPrice || null,
				oldPrice: hotelRoom.OldHotelPrice || null,
				userRating: hotelRoom.UserRating || hotelDetail.hotel_rating || null
			};
			hotelUnifiedDetails.push(unifiedHotel);
		}
	});
	
	console.log('Unified Hotel Details: ', hotelUnifiedDetails);
	// Store master list
	ALL_HOTELS = [...hotelUnifiedDetails];
	CURRENT_HOTELS = [...hotelUnifiedDetails];
	
	// Hide main page, show results page with fade-in
	document.querySelector('.page').classList.add('hidden');
	var resultsPage = document.getElementById('hotelResultsPage');
	resultsPage.classList.remove('hidden');
	setTimeout(function() {
		resultsPage.classList.add('show');
	}, 10);

	// Scroll to top of page on entry
	window.scrollTo(0, 0);
	
	// Defensive check for DOM elements
	var resultsCountElem = document.getElementById('resultsCount');
	var resultsLocationElem = document.getElementById('resultsLocation');
	var resultsList = document.getElementById('resultsList');
	// if (!resultsCountElem || !resultsLocationElem || !resultsList) {
	// 	console.error('Results elements not found in DOM');
	// 	return;
	// }

	// Set results count and location
	resultsCountElem.textContent = hotelUnifiedDetails.length + ' Properties in ' + (hotelUnifiedDetails[0]?.CityName || '');
	// resultsLocationElem.textContent = hotelUnifiedDetails[0]?.CityName || '';
	
	// Render hotel cards
	resultsList.innerHTML = '';
	hotelUnifiedDetails.forEach(function(hotel) {
		resultsList.appendChild(createHotelCard(hotel));
	});

	initHotelCarousels();
	
	document.querySelectorAll('.hotel-card').forEach(card => {
		card.addEventListener('click', function(e) {
			if (e.target.closest('.carousel-arrow') || e.target.closest('.carousel-dot')) return;
			var hotelData = JSON.parse(decodeURIComponent(this.getAttribute('data-hotel')));
			console.log(hotelData);
			resultsPage.classList.remove('show');
			resultsPage.classList.add('hidden');
			startDrillDown(hotelData);
		});
	});
	
	setupBottomSheets();

	var cityForUrl = hotelUnifiedDetails[0]?.CityName || '';
	if (cityForUrl && typeof HotelUrlManager !== 'undefined') {
		if (!window.__hotelUrlAutoSearchCallback) {
			HotelUrlManager.updateUrlForResults(
				cityForUrl,
				HotelUrlManager.getCurrentSearchParams(),
			);
		} else {
			var cb = window.__hotelUrlAutoSearchCallback;
			window.__hotelUrlAutoSearchCallback = null;
			if (typeof cb === 'function') cb();
		}
	}

	return hotelUnifiedDetails;
}

function setupBottomSheets() {
	const sortSheet = document.getElementById('sortSheet');
	const sortOverlay = document.getElementById('sortSheetOverlay');
	const filterSheet = document.getElementById('filterSheet');
	const filterOverlay = document.getElementById('filterSheetOverlay');

	document.getElementById('openSortSheet')?.addEventListener('click', () => openSheet(sortSheet, sortOverlay));
	document.getElementById('openFilterSheet')?.addEventListener('click', () => openSheet(filterSheet, filterOverlay));

	document.getElementById('closeSortSheet')?.addEventListener('click', () => closeSheet(sortSheet, sortOverlay));
	document.getElementById('closeFilterSheet')?.addEventListener('click', () => closeSheet(filterSheet, filterOverlay));

	sortOverlay?.addEventListener('click', () => closeSheet(sortSheet, sortOverlay));
	filterOverlay?.addEventListener('click', () => closeSheet(filterSheet, filterOverlay));

	// Sort logic
	document.querySelectorAll('input[name="sortOption"]').forEach(radio => {
		radio.addEventListener('change', function() {
			applySort(this.value);
			closeSheet(sortSheet, sortOverlay);
		});
	});

	// Filter buttons
	document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
	document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
}

function applySort(type) {
	let list = [...CURRENT_HOTELS];

	switch (type) {
		case 'price_low_high':
			list.sort((a, b) => (a.rooms[0]?.TotalFare || 0) - (b.rooms[0]?.TotalFare || 0));
			break;

		case 'price_high_low':
			list.sort((a, b) => (b.rooms[0]?.TotalFare || 0) - (a.rooms[0]?.TotalFare || 0));
			break;

		case 'rating':
			list.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
			break;

		case 'distance':
			// placeholder – no distance field yet
			break;

		default:
			list = [...ALL_HOTELS];
	}

	renderFilteredHotels(list);
}

function applyFilters() {
	let filtered = [...ALL_HOTELS];

	// Price filters
	const priceRanges = Array.from(document.querySelectorAll('#filterSheet input[type="checkbox"]:checked'))
		.map(cb => cb.value)
		.filter(v => v.includes('-'));

	if (priceRanges.length) {
		filtered = filtered.filter(hotel => {
			const price = hotel.rooms[0]?.TotalFare || 0;
			return priceRanges.some(r => {
				const [min, max] = r.split('-').map(Number);
				return price >= min && price <= max;
			});
		});
	}

	// Star rating
	const stars = Array.from(document.querySelectorAll('#filterSheet input[value="5"]:checked, #filterSheet input[value="4"]:checked, #filterSheet input[value="3"]:checked'))
		.map(cb => Number(cb.value));

	if (stars.length) {
		filtered = filtered.filter(h => stars.includes(Number(h.HotelRating)));
	}

	CURRENT_HOTELS = filtered;
	renderFilteredHotels(filtered);

	closeSheet(
		document.getElementById('filterSheet'),
		document.getElementById('filterSheetOverlay')
	);
}

function clearFilters() {
	document.querySelectorAll('#filterSheet input[type="checkbox"]').forEach(cb => cb.checked = false);
	CURRENT_HOTELS = [...ALL_HOTELS];
	renderFilteredHotels(CURRENT_HOTELS);
}

function renderFilteredHotels(list) {
	const resultsList = document.getElementById('resultsList');
	if (!resultsList) return;

	resultsList.innerHTML = '';
	CURRENT_HOTELS = list;

	list.forEach(function(hotel) {
		resultsList.appendChild(createHotelCard(hotel));
	});

	initHotelCarousels();

	// Rebind card click
	var resultsPage = document.getElementById('hotelResultsPage');
	document.querySelectorAll('.hotel-card').forEach(card => {
		card.addEventListener('click', function(e) {
			if (e.target.closest('.carousel-arrow') || e.target.closest('.carousel-dot')) return;
			var hotelData = JSON.parse(decodeURIComponent(this.getAttribute('data-hotel')));
			resultsPage.classList.remove('show');
			resultsPage.classList.add('hidden');
			startDrillDown(hotelData);
		});
	});
}

function initHotelCarousels() {
	var MAX_VISIBLE = 5;
	var DOT_W = 6;
	var DOT_GAP = 5;
	var STEP = DOT_W + DOT_GAP;

	document.querySelectorAll('.hotel-card-carousel').forEach(function(carousel) {
		var track = carousel.querySelector('.carousel-track');
		var wrapper = carousel.querySelector('.carousel-dots-wrapper');
		var dotsContainer = carousel.querySelector('.carousel-dots');
		var dots = carousel.querySelectorAll('.carousel-dot');
		var leftBtn = carousel.querySelector('.carousel-arrow-left');
		var rightBtn = carousel.querySelector('.carousel-arrow-right');
		var imageCount = track.querySelectorAll('.hotel-card-img').length;
		if (imageCount <= 1) return;

		var shown = Math.min(imageCount, MAX_VISIBLE);
		var wrapperW = shown * DOT_W + (shown - 1) * DOT_GAP;
		if (wrapper) wrapper.style.width = wrapperW + 'px';

		var winStart = 0;

		function getCurrentIndex() {
			return Math.round(track.scrollLeft / track.offsetWidth);
		}

		function scrollToIndex(idx) {
			track.scrollTo({
				left: idx * track.offsetWidth,
				behavior: 'smooth',
			});
		}

		function updateDots(idx) {
			dots.forEach(function(d, i) {
				d.classList.toggle('active', i === idx);
			});

			if (!dotsContainer || imageCount <= MAX_VISIBLE) return;

			if (idx < winStart) {
				winStart = idx;
			} else if (idx > winStart + MAX_VISIBLE - 1) {
				winStart = idx - MAX_VISIBLE + 1;
			}

			dotsContainer.style.transform =
				'translateX(' + -(winStart * STEP) + 'px)';
		}

		function updateArrows(idx) {
			if (leftBtn) leftBtn.classList.toggle('hidden', idx === 0);
			if (rightBtn) rightBtn.classList.toggle('hidden', idx === imageCount - 1);
		}

		updateDots(0);
		updateArrows(0);

		if (leftBtn) {
			leftBtn.classList.add('hidden');
			leftBtn.addEventListener('click', function(e) {
				e.stopPropagation();
				scrollToIndex(Math.max(0, getCurrentIndex() - 1));
			});
		}

		if (rightBtn) {
			rightBtn.addEventListener('click', function(e) {
				e.stopPropagation();
				scrollToIndex(Math.min(imageCount - 1, getCurrentIndex() + 1));
			});
		}

		dots.forEach(function(dot) {
			dot.addEventListener('click', function(e) {
				e.stopPropagation();
				scrollToIndex(parseInt(this.getAttribute('data-index'), 10));
			});
		});

		var scrollTimer;
		track.addEventListener('scroll', function() {
			clearTimeout(scrollTimer);
			scrollTimer = setTimeout(function() {
				var idx = getCurrentIndex();
				updateDots(idx);
				updateArrows(idx);
			}, 50);
		});
	});
}
