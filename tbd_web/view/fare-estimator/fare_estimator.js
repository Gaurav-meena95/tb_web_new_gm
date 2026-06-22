/* ============================================
   FARE ESTIMATOR – Main Entry Point
   ============================================ */

(function () {
	'use strict';

	/* ---- State ---- */
	var currentOrigin = '';
	var currentDestination = '';
	var currentCabinClass = '2';
	var currentSources = null;
	var currentMonths = 3;
	/** First day of selected travel month (YYYY-MM-DD), or null = from today */
	var currentStartDate = null;
	var currentProcessedData = null;
	var isAppSource = false; // true when opened from mobile app

	/* ---- Per-month results cache ---- */
	// Keyed by month offset: { 0: [...], 1: [...] }
	var monthResultsCache = {};
	// Route key used to auto-invalidate when route changes
	var cacheRouteKey = '';

	function getRouteKey() {
		var key =
			currentOrigin +
			'-' +
			currentDestination +
			'-' +
			currentCabinClass;
		if (currentStartDate) {
			key += '-' + currentStartDate;
		}
		return key;
	}

	/**
	 * Label for route bar: origin → destination · Month YYYY
	 */
	function getRouteBarLabel() {
		var base =
			currentOrigin + ' → ' + currentDestination;
		if (currentStartDate) {
			base +=
				' · ' +
				formatDate(currentStartDate, {
					month: 'short',
					year: 'numeric',
				});
		}
		return base;
	}

	function clearMonthCache() {
		monthResultsCache = {};
		cacheRouteKey = '';
		console.log(
			'[FareEstimator] Month cache cleared',
		);
	}

	/* ---- Recent Searches ---- */
	var RECENT_KEY = 'tbd_fare_recent_searches';
	var RECENT_MAX = 5;

	var CABIN_LABELS = {
		'1': 'Economy',
		'2': 'Premium Eco',
		'3': 'Business',
		'4': 'First',
	};

	/**
	 * Load recent searches from localStorage.
	 * @returns {Array} array of search objects
	 */
	function loadRecentSearches() {
		try {
			var raw = localStorage.getItem(RECENT_KEY);
			if (raw) return JSON.parse(raw);
		} catch (e) {
			// ignore
		}
		return [];
	}

	/**
	 * Save a search to the recent list. Deduplicates
	 * by origin+destination+cabinClass, keeps latest
	 * at the front, trims to RECENT_MAX.
	 */
	function saveRecentSearch() {
		if (!currentOrigin || !currentDestination) return;

		var originCity = '';
		var destCity = '';
		if (airportCache) {
			var oa = airportCache.find(function (a) {
				return (
					a.airport_code === currentOrigin
				);
			});
			if (oa) originCity = oa.city_name;

			var da = airportCache.find(function (a) {
				return (
					a.airport_code ===
					currentDestination
				);
			});
			if (da) destCity = da.city_name;
		}

		var entry = {
			originCode: currentOrigin,
			originCity: originCity || currentOrigin,
			destCode: currentDestination,
			destCity: destCity || currentDestination,
			cabinClass: currentCabinClass || '2',
			travelMonth: currentStartDate
				? currentStartDate.slice(0, 7)
				: null,
		};

		var list = loadRecentSearches();

		// Remove duplicate (same route + cabin + month)
		list = list.filter(function (item) {
			return !(
				item.originCode === entry.originCode &&
				item.destCode === entry.destCode &&
				item.cabinClass === entry.cabinClass &&
				(item.travelMonth || null) ===
					(entry.travelMonth || null)
			);
		});

		// Add to front
		list.unshift(entry);

		// Trim
		if (list.length > RECENT_MAX) {
			list = list.slice(0, RECENT_MAX);
		}

		try {
			localStorage.setItem(
				RECENT_KEY,
				JSON.stringify(list),
			);
		} catch (e) {
			// ignore
		}
	}

	/**
	 * Render the recent searches section inside the
	 * search form. Hides the section if no history.
	 */
	function renderRecentSearches() {
		var $container = $('#recentSearches');
		if (!$container.length) return;

		var list = loadRecentSearches();
		if (!list.length) {
			$container.hide();
			return;
		}

		var html =
			'<div class="recent__title">' +
			'<i class="fas fa-history"></i>' +
			' Recent Searches</div>' +
			'<div class="recent__chips">';

		list.forEach(function (item, idx) {
			var cabin =
				CABIN_LABELS[item.cabinClass] ||
				'Economy';
			var monthLabel = '';
			if (item.travelMonth) {
				var d = new Date(item.travelMonth + '-01');
				monthLabel =
					' · ' +
					d.toLocaleDateString('en-IN', {
						month: 'short',
						year: 'numeric',
					});
			}
			html +=
				'<button class="recent__chip" ' +
				'data-idx="' +
				idx +
				'" type="button">' +
				'<span class="recent__chip-route">' +
				'<span class="recent__chip-code">' +
				item.originCode +
				'</span>' +
				' <i class="fas fa-arrow-right ' +
				'recent__chip-arrow"></i> ' +
				'<span class="recent__chip-code">' +
				item.destCode +
				'</span>' +
				monthLabel +
				'</span>' +
				'<span class="recent__chip-meta">' +
				cabin +
				'</span>' +
				'</button>';
		});

		html += '</div>';
		$container.html(html).show();
	}

	/* ---- Airport Cache ---- */
	var airportCache = null; // Array of airport objects
	var airportCacheLoading = false;
	var CACHE_KEY = 'tbd_airport_cache';
	var CACHE_TS_KEY = 'tbd_airport_cache_ts';
	var CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

	/**
	 * Load airports from localStorage cache or fetch
	 * from API, then store in both memory and
	 * localStorage.
	 * @param {function} cb - callback(airportList)
	 */
	function loadAirports(cb) {
		// Already in memory
		if (airportCache) {
			if (cb) cb(airportCache);
			return;
		}

		// Try localStorage
		try {
			var cached = localStorage.getItem(CACHE_KEY);
			var ts = localStorage.getItem(CACHE_TS_KEY);
			if (
				cached &&
				ts &&
				Date.now() - parseInt(ts, 10) < CACHE_TTL
			) {
				airportCache = JSON.parse(cached);
				if (cb) cb(airportCache);
				return;
			}
		} catch (e) {
			// localStorage unavailable, ignore
		}

		// Fetch from API
		if (airportCacheLoading) {
			// Already fetching, poll until done
			var poll = setInterval(function () {
				if (airportCache) {
					clearInterval(poll);
					if (cb) cb(airportCache);
				}
			}, 200);
			return;
		}

		airportCacheLoading = true;
		$.ajax({
			url: '/api/tbo/flights/airport-info',
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({}),
		})
			.done(function (resp) {
				var list =
					(resp && resp.list) || [];
				airportCache = list;

				// Persist to localStorage
				try {
					localStorage.setItem(
						CACHE_KEY,
						JSON.stringify(list),
					);
					localStorage.setItem(
						CACHE_TS_KEY,
						String(Date.now()),
					);
				} catch (e) {
					// quota exceeded, ignore
				}

				airportCacheLoading = false;
				if (cb) cb(airportCache);
			})
			.fail(function () {
				airportCacheLoading = false;
				if (cb) cb([]);
			});
	}

	/* ---- Airport Search / Filter ---- */

	/**
	 * Filter the cached airport list by a query string.
	 * Matches airport_code, city_name, airport_name.
	 * Prioritises code-starts-with, then city-starts-with.
	 * @param {string} query
	 * @returns {Array} top 8 matches
	 */
	function filterAirports(query) {
		if (!airportCache || !query) return [];
		var q = query.trim().toLowerCase();
		if (q.length < 1) return [];

		var codeStartsWith = [];
		var cityStartsWith = [];
		var otherMatches = [];

		airportCache.forEach(function (a) {
			var code = (a.airport_code || '').toLowerCase();
			var city = (a.city_name || '').toLowerCase();
			var name = (a.airport_name || '').toLowerCase();

			if (code.indexOf(q) === 0) {
				codeStartsWith.push(a);
			} else if (city.indexOf(q) === 0) {
				cityStartsWith.push(a);
			} else if (
				code.indexOf(q) !== -1 ||
				city.indexOf(q) !== -1 ||
				name.indexOf(q) !== -1
			) {
				otherMatches.push(a);
			}
		});

		return codeStartsWith
			.concat(cityStartsWith)
			.concat(otherMatches)
			.slice(0, 8);
	}

	/* ---- Dropdown Rendering ---- */

	/**
	 * Render the airport dropdown for a given input.
	 * @param {string} inputId - 'inputOrigin' or
	 *   'inputDestination'
	 * @param {Array} results - filtered airports
	 */
	function renderAirportDropdown(inputId, results) {
		var ddId =
			inputId === 'inputOrigin'
				? 'originDropdown'
				: 'destinationDropdown';
		var $dd = $('#' + ddId);
		$dd.empty();

		if (!results.length) {
			$dd.append(
				'<div class="airport-dropdown__empty">' +
					'No airports found</div>',
			);
			$dd.addClass('open');
			return;
		}

		results.forEach(function (airport) {
			var $item = $(
				'<div class="airport-dropdown__item">' +
					'<span class="airport-dropdown__code">' +
					airport.airport_code +
					'</span>' +
					'<div class="airport-dropdown__info">' +
					'<div class="airport-dropdown__city">' +
					airport.city_name +
					', ' +
					airport.country_name +
					'</div>' +
					'<div class="airport-dropdown__name">' +
					airport.airport_name +
					'</div></div></div>',
			);

			$item.on('click', function () {
				selectAirport(inputId, airport);
			});

			$dd.append($item);
		});

		$dd.addClass('open');
	}

	/**
	 * Select an airport from the dropdown.
	 * Sets the input display text and stores the code
	 * on a data attribute.
	 */
	function selectAirport(inputId, airport) {
		var $input = $('#' + inputId);
		var displayText =
			airport.city_name +
			' (' +
			airport.airport_code +
			')';
		$input.val(displayText);
		$input.attr(
			'data-airport-code',
			airport.airport_code,
		);
		$input.attr(
			'data-city-name',
			airport.city_name,
		);
		$input.removeClass('input--error');

		// Close dropdown
		var ddId =
			inputId === 'inputOrigin'
				? 'originDropdown'
				: 'destinationDropdown';
		$('#' + ddId)
			.removeClass('open')
			.empty();

		// Auto-focus next field
		if (inputId === 'inputOrigin') {
			$('#inputDestination').focus();
		}
	}

	/**
	 * Close all airport dropdowns.
	 */
	function closeAllDropdowns() {
		$('.airport-dropdown')
			.removeClass('open')
			.empty();
	}

	/* ---- URL Param Parsing ---- */

	function getQueryParams() {
		var params = {};
		var search = window.location.search.substring(1);
		if (!search) return params;
		search.split('&').forEach(function (pair) {
			var parts = pair.split('=');
			params[decodeURIComponent(parts[0])] =
				decodeURIComponent(parts[1] || '');
		});
		return params;
	}

	/* ---- View Management ---- */

	function showSearchForm() {
		$('#fareBoardSearch')
			.removeClass('collapsed')
			.show();
		$('#fareBoard').hide();
		$('#fareBoardError').hide();
		$('#fareBoardBack').hide();
		$('.fare-board__world-map')
			.removeClass('hidden');
		if (!isAppSource) {
			$('#geoContent').show();
		}
		renderRecentSearches();
	}

	function showResultsView() {
		$('#fareBoardSearch').addClass('collapsed');
		$('#fareBoard').show();
		$('#fareBoardBack').show();
		$('.fare-board__world-map')
			.addClass('hidden');
		$('#geoContent').hide();

		if (!$('#fareRouteBar').length) {
			var barHtml =
				'<div class="fare-board__route-bar"' +
				' id="fareRouteBar">' +
				'<div class="fare-board__route-bar-text">' +
				'<i class="fas fa-plane"></i>' +
				'<span id="routeBarLabel">' +
				getRouteBarLabel() +
				'</span></div>' +
				'<button class="fare-board__route-bar-edit"' +
				' id="routeBarEdit">' +
				'<i class="fas fa-pen"></i> Change' +
				'</button></div>';
			$('#fareBoard').prepend(barHtml);
		} else {
			$('#routeBarLabel').text(getRouteBarLabel());
		}
	}

	/* ---- Form Handling ---- */

	/**
	 * Get the airport code from a field. Prefers the
	 * data-airport-code attribute; falls back to
	 * parsing "City (CODE)" or raw 3-char input.
	 */
	function getAirportCode(inputId) {
		var $input = $('#' + inputId);
		var stored = $input.attr('data-airport-code');
		if (stored) return stored.toUpperCase();

		// Fallback: try to parse "City (DEL)" format
		var val = $input.val().trim();
		var match = val.match(/\(([A-Z]{3})\)\s*$/i);
		if (match) return match[1].toUpperCase();

		// Fallback: if exactly 3 alpha chars, treat as code
		if (/^[A-Za-z]{3}$/.test(val)) {
			return val.toUpperCase();
		}

		return '';
	}

	function readFormValues() {
		var origin = getAirportCode('inputOrigin');
		var destination = getAirportCode(
			'inputDestination',
		);
		var cabinClass = $('#inputCabinClass').val();
		var monthVal = $('#inputTravelMonth').val().trim();

		$('#inputOrigin, #inputDestination').removeClass(
			'input--error',
		);

		var isValid = true;

		if (!origin || origin.length !== 3) {
			$('#inputOrigin').addClass('input--error');
			isValid = false;
		}
		if (!destination || destination.length !== 3) {
			$('#inputDestination').addClass('input--error');
			isValid = false;
		}
		if (origin && destination && origin === destination) {
			$('#inputDestination').addClass('input--error');
			isValid = false;
		}

		if (isValid) {
			currentOrigin = origin;
			currentDestination = destination;
			currentCabinClass = cabinClass || '2';
			// First day of selected month (YYYY-MM-DD), or null
			if (monthVal && /^\d{4}-\d{2}$/.test(monthVal)) {
				currentStartDate = monthVal + '-01';
			} else {
				currentStartDate = null;
			}

			var newUrl =
				'/fare-estimator?origin=' +
				encodeURIComponent(currentOrigin) +
				'&destination=' +
				encodeURIComponent(currentDestination) +
				'&cabinClass=' +
				encodeURIComponent(currentCabinClass);
			if (currentStartDate) {
				newUrl +=
					'&date=' +
					encodeURIComponent(monthVal);
			}
			window.history.replaceState(null, '', newUrl);
		}

		return isValid;
	}

	function prefillForm() {
		if (currentOrigin) {
			var $orig = $('#inputOrigin');
			// Try to find airport in cache for display name
			if (airportCache) {
				var airport = airportCache.find(
					function (a) {
						return (
							a.airport_code ===
							currentOrigin
						);
					},
				);
				if (airport) {
					$orig.val(
						airport.city_name +
							' (' +
							airport.airport_code +
							')',
					);
					$orig.attr(
						'data-airport-code',
						airport.airport_code,
					);
					$orig.attr(
						'data-city-name',
						airport.city_name,
					);
				} else {
					$orig.val(currentOrigin);
					$orig.attr(
						'data-airport-code',
						currentOrigin,
					);
				}
			} else {
				$orig.val(currentOrigin);
				$orig.attr(
					'data-airport-code',
					currentOrigin,
				);
			}
		}
		if (currentDestination) {
			var $dest = $('#inputDestination');
			if (airportCache) {
				var destAirport = airportCache.find(
					function (a) {
						return (
							a.airport_code ===
							currentDestination
						);
					},
				);
				if (destAirport) {
					$dest.val(
						destAirport.city_name +
							' (' +
							destAirport.airport_code +
							')',
					);
					$dest.attr(
						'data-airport-code',
						destAirport.airport_code,
					);
					$dest.attr(
						'data-city-name',
						destAirport.city_name,
					);
				} else {
					$dest.val(currentDestination);
					$dest.attr(
						'data-airport-code',
						currentDestination,
					);
				}
			} else {
				$dest.val(currentDestination);
				$dest.attr(
					'data-airport-code',
					currentDestination,
				);
			}
		}
		if (currentCabinClass) {
			$('#inputCabinClass').val(currentCabinClass);
		}
		if (currentStartDate) {
			$('#inputTravelMonth').val(
				currentStartDate.slice(0, 7),
			);
		} else {
			var d = new Date();
			$('#inputTravelMonth').val(
				d.getFullYear() +
					'-' +
					String(d.getMonth() + 1).padStart(2, '0'),
			);
		}
	}

	/* ---- API Fetching ---- */

	function buildPayload(monthOffset) {
		var depTime;
		var baseDate;

		if (currentStartDate) {
			// User chose a travel month: add monthOffset to that month
			baseDate = new Date(currentStartDate + 'T00:00:00');
			baseDate.setMonth(baseDate.getMonth() + monthOffset);
			baseDate.setDate(1);
		} else {
			baseDate = new Date();
			if (monthOffset > 0) {
				baseDate.setMonth(baseDate.getMonth() + monthOffset);
				baseDate.setDate(1);
			}
		}

		var y = baseDate.getFullYear();
		var m = String(baseDate.getMonth() + 1)
			.padStart(2, '0');
		var d = String(baseDate.getDate()).padStart(2, '0');
		depTime = y + '-' + m + '-' + d + 'T00:00:00';

		return {
			PreferredAirlines: null,
			Segments: [
				{
					Origin: currentOrigin,
					Destination: currentDestination,
					FlightCabinClass: currentCabinClass,
					PreferredDepartureTime: depTime,
				},
			],
			Sources: null,
		};
	}

	/**
	 * Extract SearchResults from a single API response.
	 * @param {object} data - the parsed JSON response
	 * @returns {Array} SearchResults or empty array
	 */
	function extractSearchResults(data) {
		if (
			data &&
			data.object &&
			data.object.Response &&
			data.object.Response.Error &&
			data.object.Response.Error.ErrorCode === 0 &&
			data.object.Response.SearchResults
		) {
			return data.object.Response.SearchResults;
		}
		return [];
	}

	/**
	 * Fetch calendar fares for the requested number of
	 * months. Uses a per-month cache so that expanding
	 * from 3→6 or 6→9 only fetches the new months.
	 *
	 * The cache auto-invalidates when the route
	 * (origin/destination/cabinClass) changes.
	 *
	 * @param {number} monthCount - 3, 6, or 9
	 * @returns {jQuery.Deferred} resolves with allResults
	 */
	function fareBoardFetchMonths(monthCount) {
		// Invalidate cache if route changed
		var routeKey = getRouteKey();
		if (routeKey !== cacheRouteKey) {
			monthResultsCache = {};
			cacheRouteKey = routeKey;
			console.log(
				'[FareEstimator] Route changed to ' +
					routeKey +
					', cache reset',
			);
		}

		// Determine which months are missing from cache
		var missingOffsets = [];
		for (var i = 0; i < monthCount; i++) {
			if (
				!monthResultsCache.hasOwnProperty(i)
			) {
				missingOffsets.push(i);
			}
		}

		console.log(
			'[FareEstimator] Requesting ' +
				monthCount +
				' months. Cached: ' +
				Object.keys(monthResultsCache).length +
				', Need to fetch: ' +
				missingOffsets.length +
				' (' +
				missingOffsets.join(',') +
				')',
		);

		// If everything is cached, return immediately
		if (missingOffsets.length === 0) {
			var cached = [];
			for (var c = 0; c < monthCount; c++) {
				cached = cached.concat(
					monthResultsCache[c],
				);
			}
			console.log(
				'[FareEstimator] All months from ' +
					'cache, total results: ' +
					cached.length,
			);
			return $.Deferred()
				.resolve(cached)
				.promise();
		}

		// Build AJAX requests only for missing months
		var requests = [];
		missingOffsets.forEach(function (offset) {
			requests.push(
				$.ajax({
					url: '/api/tbo/flights/' +
						'calendar-fares',
					method: 'POST',
					contentType: 'application/json',
					data: JSON.stringify(
						buildPayload(offset),
					),
				}),
			);
		});

		var fetchCount = requests.length;

		return $.when
			.apply($, requests)
			.then(function () {
				// Normalise $.when callback arguments
				var responses;
				if (fetchCount === 1) {
					responses = [
						[
							arguments[0],
							arguments[1],
							arguments[2],
						],
					];
				} else {
					responses =
						Array.prototype.slice.call(
							arguments,
						);
				}

				// Store each response in the cache
				responses.forEach(function (resp, idx) {
					var data = resp[0];
					var offset = missingOffsets[idx];

					console.log(
						'[FareEstimator] Month ' +
							offset +
							' raw response:',
						data,
					);

					var results =
						extractSearchResults(data);

					console.log(
						'[FareEstimator] Month ' +
							offset +
							' → ' +
							results.length +
							' results',
					);

					// Cache even empty arrays so we
					// don't re-fetch failed months
					monthResultsCache[offset] = results;
				});

				// Combine all cached months up to
				// monthCount
				var allResults = [];
				for (var j = 0; j < monthCount; j++) {
					allResults = allResults.concat(
						monthResultsCache[j] || [],
					);
				}

				console.log(
					'[FareEstimator] Total results ' +
						'(cached + new): ' +
						allResults.length,
				);
				return allResults;
			});
	}

	/* ---- Main Load Flow ---- */

	function loadFareBoard(months) {
		currentMonths = months;
		closeAllDropdowns();
		saveRecentSearch();
		showResultsView();
		renderFareBoardSkeleton();
		setActiveRangeTab(months);

		fareBoardFetchMonths(months)
			.then(function (allResults) {
				if (!allResults || !allResults.length) {
					showFareBoardError(
						'No fare data available for this ' +
							'route. Try a different route ' +
							'or check back later.',
					);
					return;
				}

				currentProcessedData =
					fareBoardProcessData(allResults);

				console.log(
					'[FareEstimator] Processed data:',
					currentProcessedData,
				);

				if (!currentProcessedData) {
					showFareBoardError(
						'Could not process fare data.',
					);
					return;
				}

				console.log(
					'[FareEstimator] Monthly keys:',
					Object.keys(
						currentProcessedData.monthly,
					),
				);
				console.log(
					'[FareEstimator] Top deals:',
					currentProcessedData.topDeals,
				);

				renderAllFareBoardSections(
					currentProcessedData,
					currentOrigin,
					currentDestination,
				);
			})
			.fail(function () {
				showFareBoardError(
					'Network error. Please check your ' +
						'connection and try again.',
				);
			});
	}

	/* ---- Event Wiring ---- */

	function wireEvents() {
		// -- Airport autocomplete on input --
		$('#inputOrigin, #inputDestination').on(
			'input',
			function () {
				var $this = $(this);
				var val = $this.val().trim();
				var inputId = $this.attr('id');

				// Clear stored code when user edits
				$this.removeAttr('data-airport-code');
				$this.removeAttr('data-city-name');
				$this.removeClass('input--error');

				if (val.length < 2) {
					closeAllDropdowns();
					return;
				}

				// Filter from cache
				if (airportCache) {
					var results = filterAirports(val);
					renderAirportDropdown(
						inputId,
						results,
					);
				} else {
					// Cache not ready yet, show loading
					var ddId =
						inputId === 'inputOrigin'
							? 'originDropdown'
							: 'destinationDropdown';
					$('#' + ddId)
						.html(
							'<div class=' +
								'"airport-dropdown__loading">' +
								'Loading airports...' +
								'</div>',
						)
						.addClass('open');

					loadAirports(function () {
						var results = filterAirports(val);
						renderAirportDropdown(
							inputId,
							results,
						);
					});
				}
			},
		);

		// Keyboard navigation in dropdown
		$('#inputOrigin, #inputDestination').on(
			'keydown',
			function (e) {
				var inputId = $(this).attr('id');
				var ddId =
					inputId === 'inputOrigin'
						? 'originDropdown'
						: 'destinationDropdown';
				var $dd = $('#' + ddId);

				if (!$dd.hasClass('open')) {
					if (e.key === 'Enter') {
						$('#fareSearchBtn').click();
					}
					return;
				}

				var $items = $dd.find(
					'.airport-dropdown__item',
				);
				var $active = $items.filter('.active');
				var idx = $items.index($active);

				if (e.key === 'ArrowDown') {
					e.preventDefault();
					var next =
						idx < $items.length - 1
							? idx + 1
							: 0;
					$items.removeClass('active');
					$items.eq(next).addClass('active');
					// Scroll into view
					$items.eq(next)[0].scrollIntoView({
						block: 'nearest',
					});
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					var prev =
						idx > 0
							? idx - 1
							: $items.length - 1;
					$items.removeClass('active');
					$items.eq(prev).addClass('active');
					$items.eq(prev)[0].scrollIntoView({
						block: 'nearest',
					});
				} else if (e.key === 'Enter') {
					e.preventDefault();
					if ($active.length) {
						$active.click();
					} else if ($items.length) {
						$items.first().click();
					}
				} else if (e.key === 'Escape') {
					closeAllDropdowns();
				}
			},
		);

		// Close dropdown when clicking outside
		$(document).on('click', function (e) {
			var $target = $(e.target);
			if (
				!$target.closest('.airport-input-wrap')
					.length
			) {
				closeAllDropdowns();
			}
		});

		// Travel month: whole field (label + input) opens the month picker
		$(document).on('click', '#travelMonthField', function (e) {
			var input = document.getElementById('inputTravelMonth');
			if (!input) return;
			e.preventDefault();
			if (typeof input.showPicker === 'function') {
				input.showPicker();
			} else {
				input.focus();
				input.click();
			}
		});

		// Focus on input -> show dropdown if has query
		$('#inputOrigin, #inputDestination').on(
			'focus',
			function () {
				var $el = $(this);
				var val = $el.val().trim();
				var inputId = $el.attr('id');
				// Only show if user hasn't selected yet
				var code = $el.attr(
					'data-airport-code',
				);
				if (!code && val.length >= 2 && airportCache) {
					var results = filterAirports(val);
					if (results.length) {
						renderAirportDropdown(
							inputId,
							results,
						);
					}
				}

				// In app webview, scroll the input
				// into view after the keyboard opens
				if (isAppSource) {
					var el = $el[0];
					setTimeout(function () {
						el.scrollIntoView({
							behavior: 'smooth',
							block: 'start',
						});
					}, 350);
				}
			},
		);

		// Search form submit
		$('#fareSearchBtn').on('click', function () {
			closeAllDropdowns();
			if (readFormValues()) {
				loadFareBoard(3);
			}
		});

		// Recent search chip click
		$(document).on(
			'click',
			'.recent__chip',
			function () {
				var idx = parseInt(
					$(this).attr('data-idx'),
					10,
				);
				var list = loadRecentSearches();
				if (!list[idx]) return;

				var item = list[idx];
				currentOrigin = item.originCode;
				currentDestination = item.destCode;
				currentCabinClass =
					item.cabinClass || '2';
				currentStartDate = item.travelMonth
					? item.travelMonth + '-01'
					: null;

				// Update URL
				var newUrl =
					'/fare-estimator?origin=' +
					encodeURIComponent(currentOrigin) +
					'&destination=' +
					encodeURIComponent(
						currentDestination,
					) +
					'&cabinClass=' +
					encodeURIComponent(
						currentCabinClass,
					);
				if (currentStartDate) {
					newUrl +=
						'&date=' +
						encodeURIComponent(
							currentStartDate.slice(0, 7),
						);
				}
				window.history.replaceState(
					null,
					'',
					newUrl,
				);

				prefillForm();
				loadFareBoard(3);
			},
		);

		// Swap cities button
		$('#swapCities').on('click', function () {
			var $orig = $('#inputOrigin');
			var $dest = $('#inputDestination');

			var origVal = $orig.val();
			var destVal = $dest.val();
			var origCode = $orig.attr(
				'data-airport-code',
			);
			var destCode = $dest.attr(
				'data-airport-code',
			);
			var origCity = $orig.attr('data-city-name');
			var destCity = $dest.attr('data-city-name');

			$orig.val(destVal);
			$orig.attr(
				'data-airport-code',
				destCode || '',
			);
			$orig.attr(
				'data-city-name',
				destCity || '',
			);

			$dest.val(origVal);
			$dest.attr(
				'data-airport-code',
				origCode || '',
			);
			$dest.attr(
				'data-city-name',
				origCity || '',
			);

			closeAllDropdowns();
		});

		// Route bar "Change" button
		$(document).on(
			'click',
			'#routeBarEdit',
			function () {
				showSearchForm();
				prefillForm();
			},
		);

		// Range tab clicks
		$(document).on(
			'click',
			'.range-tab',
			function () {
				var months = parseInt(
					$(this).attr('data-months'),
					10,
				);
				if (months === currentMonths) return;
				loadFareBoard(months);
			},
		);

		// Heatmap day click -> open drawer
		$(document).on(
			'click',
			'.heatmap__day[data-departure]',
			function () {
				var depDate = $(this).attr(
					'data-departure',
				);
				if (
					!currentProcessedData ||
					!currentProcessedData.raw
				) {
					return;
				}
				var fareItem =
					currentProcessedData.raw.find(
						function (r) {
							return (
								r.DepartureDate === depDate
							);
						},
					);
				if (fareItem) {
					renderFareDrawer(
						fareItem,
						currentOrigin,
						currentDestination,
					);
				}
			},
		);

		// Deal card click -> open drawer
		$(document).on(
			'click',
			'.deal-card',
			function () {
				var depDate = $(this).attr(
					'data-departure',
				);
				if (
					!currentProcessedData ||
					!currentProcessedData.raw
				) {
					return;
				}
				var fareItem =
					currentProcessedData.raw.find(
						function (r) {
							return (
								r.DepartureDate === depDate
							);
						},
					);
				if (fareItem) {
					renderFareDrawer(
						fareItem,
						currentOrigin,
						currentDestination,
					);
				}
			},
		);

		// Close drawer on overlay click
		$(document).on(
			'click',
			'#fareDrawerOverlay',
			function (e) {
				if (
					$(e.target).is('#fareDrawerOverlay')
				) {
					closeFareDrawer();
				}
			},
		);

		// Close drawer on handle click
		$(document).on(
			'click',
			'.fare-board__drawer-handle',
			function () {
				closeFareDrawer();
			},
		);

		// ---- Passenger counter +/- buttons ----
		$(document).on(
			'click',
			'.drawer__pax-btn',
			function () {
				var pax = $(this).attr('data-pax');
				var dir = $(this).attr('data-dir');

				var $adult = $('#paxAdult');
				var $child = $('#paxChild');
				var $infant = $('#paxInfant');
				var $error = $('#paxError');

				var adults = parseInt(
					$adult.text(), 10,
				);
				var children = parseInt(
					$child.text(), 10,
				);
				var infants = parseInt(
					$infant.text(), 10,
				);

				// Apply increment/decrement
				if (pax === 'adult') {
					adults += dir === 'plus' ? 1 : -1;
				} else if (pax === 'child') {
					children += dir === 'plus' ? 1 : -1;
				} else if (pax === 'infant') {
					infants += dir === 'plus' ? 1 : -1;
				}

				// Enforce minimums
				if (adults < 1) adults = 1;
				if (children < 0) children = 0;
				if (infants < 0) infants = 0;

				// Auto-cap infants to adults when
				// adult count is reduced
				if (infants > adults) {
					infants = adults;
				}

				// Validate: max 9 total
				var total = adults + children + infants;
				if (total > 9) {
					$error.text(
						'Max 9 passengers allowed ' +
						'(Adults + Children + Infants).',
					);
					return;
				}

				// All valid – update counts
				$adult.text(adults);
				$child.text(children);
				$infant.text(infants);
				$error.text('');

				// Update disabled states for
				// minus buttons
				updatePaxButtonStates(
					adults, children, infants,
				);
			},
		);

		// Drawer "Search Flights" button
		$(document).on(
			'click',
			'.drawer__book-btn',
			function () {
				var depDate = $(this).attr(
					'data-departure',
				);

				// Read passenger counts
				var adults = parseInt(
					$('#paxAdult').text(), 10,
				) || 1;
				var children = parseInt(
					$('#paxChild').text(), 10,
				) || 0;
				var infants = parseInt(
					$('#paxInfant').text(), 10,
				) || 0;

				// Final validation
				var total = adults + children + infants;
				if (total > 9) {
					$('#paxError').text(
						'Max 9 passengers allowed.',
					);
					return;
				}
				if (infants > adults) {
					$('#paxError').text(
						'Infants cannot exceed adults.',
					);
					return;
				}

				if (isAppSource) {
					// Send data to Flutter app via
					// JavaScript channel
					var payload = JSON.stringify({
						action: 'searchFlights',
						origin: currentOrigin,
						destination: currentDestination,
						departureDate: depDate,
						cabinClass: currentCabinClass,
						adultCount: adults,
						childCount: children,
						infantCount: infants,
					});

					if (
						window.FareEstimator &&
						window.FareEstimator.postMessage
					) {
						window.FareEstimator
							.postMessage(payload);
					}
					return;
				}

				// Website: open in new tab
				var searchUrl =
					'/flights-search' +
					'?origin=' +
					encodeURIComponent(currentOrigin) +
					'&destination=' +
					encodeURIComponent(
						currentDestination,
					) +
					'&date=' +
					encodeURIComponent(depDate) +
					'&cabinClass=' +
					encodeURIComponent(
						currentCabinClass,
					) +
					'&adults=' + adults +
					'&children=' + children +
					'&infants=' + infants;
				console.log(searchUrl);
				window.open(searchUrl, '_blank');
			},
		);

		// Back button
		$('#fareBoardBack').on('click', function () {
			showSearchForm();
			prefillForm();
		});

		// Retry button
		$('#fareBoardRetry').on('click', function () {
			loadFareBoard(currentMonths);
		});

		// Premium banner (search page + drawer)
		$(document).on(
			'click',
			'.premium-banner, .drawer__premium-banner',
			function () {
				var url =
					'https://beatravelbuddy.com/premium';
				if (isAppSource) {
					var payload = JSON.stringify({
						action: 'openPremium',
					});
					if (
						window.FareEstimator &&
						window.FareEstimator.postMessage
					) {
						window.FareEstimator.postMessage(
							payload,
						);
					}
				} else {
					window.open(url, '_blank');
				}
			},
		);

		// Coupon copy-to-clipboard
		$(document).on(
			'click',
			'.coupon-card__copy',
			function (e) {
				e.stopPropagation();
				var $btn = $(this);
				var code = $btn
					.closest('.coupon-card__code')
					.attr('data-code');
				if (!code) return;

				navigator.clipboard
					.writeText(code)
					.then(function () {
						$btn.addClass('copied');
						setTimeout(function () {
							$btn.removeClass('copied');
						}, 1600);
					});
			},
		);
	}

	/* ---- Coupon Auto-Scroll ---- */

	function initCouponAutoScroll() {
		$('.coupon-slider__track').each(function () {
			var $track = $(this);
			var scrollInterval = null;
			var pauseTimeout = null;

			function startScroll() {
				if (scrollInterval) return;
				scrollInterval = setInterval(
					function () {
						var el = $track[0];
						var maxScroll =
							el.scrollWidth - el.clientWidth;
						if (maxScroll <= 0) return;

						if (el.scrollLeft >= maxScroll - 2) {
							el.scrollLeft = 0;
						} else {
							el.scrollLeft += 232;
						}
					},
					3000,
				);
			}

			function pauseScroll() {
				clearInterval(scrollInterval);
				scrollInterval = null;
				clearTimeout(pauseTimeout);
				pauseTimeout = setTimeout(
					startScroll,
					5000,
				);
			}

			// Pause on user interaction
			$track.on(
				'touchstart mousedown wheel',
				pauseScroll,
			);

			startScroll();
		});
	}

	/* ---- Init ---- */

	$(document).ready(function () {
		var params = getQueryParams();
		currentOrigin = (params.origin || '').toUpperCase();
		currentDestination = (
			params.destination || ''
		).toUpperCase();
		currentCabinClass = params.cabinClass || '2';
		currentSources = params.sources || null;
		// date=YYYY-MM or YYYY-MM-DD -> first day of that month
		var dateParam = params.date || '';
		if (dateParam) {
			var match = dateParam.match(/^(\d{4})-(\d{2})/);
			if (match) {
				currentStartDate =
					match[1] + '-' + match[2] + '-01';
			}
		}

		// Detect if opened from mobile app
		isAppSource = params.source === 'app';
		if (isAppSource) {
			// Hide web-only chrome (app has its own nav)
			$('#brandHeader').hide();
			$('body').addClass('app-source');
		}

		// Min travel month = current month (YYYY-MM); default to current month
		var today = new Date();
		var minMonth =
			today.getFullYear() +
			'-' +
			String(today.getMonth() + 1).padStart(2, '0');
		$('#inputTravelMonth').attr('min', minMonth);
		if (!currentStartDate) {
			$('#inputTravelMonth').val(minMonth);
		}

		// Start loading airports into cache immediately
		loadAirports(function () {
			// Once loaded, update prefilled display names
			prefillForm();
		});

		wireEvents();
		initCouponAutoScroll();

		if (currentOrigin && currentDestination) {
			prefillForm();
			loadFareBoard(3);
		} else {
			showSearchForm();
			prefillForm();
		}
	});
})();
