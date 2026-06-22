/**
 * Hotel URL Manager
 * Manages breadcrumb URLs, history.pushState, popstate, and
 * page-load restoration for SEO-friendly hotel routes.
 *
 * URL patterns:
 *   /hotels                              → search
 *   /hotels/{citySlug}                   → results
 *   /hotels/{citySlug}/{hotelSlug}-{HC}  → detail
 *   /hotels/{citySlug}/{hotelSlug}-{HC}/rooms → rooms
 */

var HotelUrlManager = (function () {
	'use strict';

	var BASE = '/hotels';
	var ORIGIN = 'https://beatravelbuddy.com';

	// --- Slug utilities ---

	function toSlug(str) {
		if (!str) return '';
		return str
			.toString()
			.toLowerCase()
			.trim()
			.replace(/&/g, '-and-')
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function fromSlug(slug) {
		if (!slug) return '';
		return slug
			.split('-')
			.map(function (w) {
				return w.charAt(0).toUpperCase() + w.slice(1);
			})
			.join(' ');
	}

	// --- URL builders ---

	function buildSearchUrl() {
		return BASE;
	}

	function buildResultsUrl(cityName, searchParams) {
		var url = BASE + '/' + toSlug(cityName);
		var qs = buildQueryString(searchParams);
		return qs ? url + '?' + qs : url;
	}

	function buildDetailUrl(cityName, hotelName, hotelCode) {
		return (
			BASE +
			'/' +
			toSlug(cityName) +
			'/' +
			toSlug(hotelName) +
			'-' +
			hotelCode
		);
	}

	function buildRoomsUrl(cityName, hotelName, hotelCode) {
		return buildDetailUrl(cityName, hotelName, hotelCode) + '/rooms';
	}

	function buildQueryString(params) {
		if (!params) return '';
		var parts = [];
		['checkin', 'checkout', 'adults', 'children', 'rooms'].forEach(
			function (key) {
				if (params[key] != null && params[key] !== '') {
					parts.push(
						encodeURIComponent(key) +
							'=' +
							encodeURIComponent(params[key]),
					);
				}
			},
		);
		return parts.join('&');
	}

	// --- Collect current search params from the DOM ---

	function getCurrentSearchParams() {
		return {
			checkin:
				jQuery('#checkin-container').data('checkin-date') || null,
			checkout:
				jQuery('#checkout-container').data('checkout-date') || null,
			adults: jQuery('#adults-value').text() || null,
			children: jQuery('#children-value').text() || null,
			rooms: jQuery('#rooms-value').text() || null,
		};
	}

	// --- State tracking ---

	var _lastCity = null;
	var _lastHotelName = null;
	var _lastHotelCode = null;

	// --- pushState wrappers (called from navigation functions) ---

	function updateUrlForSearch() {
		_lastCity = null;
		_lastHotelName = null;
		_lastHotelCode = null;
		var url = buildSearchUrl();
		window.history.pushState({ view: 'search' }, '', url);
		renderBreadcrumbs('search');
		updateBreadcrumbSchema('search');
	}

	function updateUrlForResults(cityName, searchParams) {
		_lastCity = cityName;
		_lastHotelName = null;
		_lastHotelCode = null;
		var url = buildResultsUrl(cityName, searchParams);
		window.history.pushState(
			{ view: 'results', city: cityName },
			'',
			url,
		);
		renderBreadcrumbs('results', { city: cityName });
		updateBreadcrumbSchema('results', { city: cityName });
	}

	function updateUrlForDrillDown(cityName, hotelName, hotelCode) {
		_lastCity = cityName;
		_lastHotelName = hotelName;
		_lastHotelCode = hotelCode;
		var url = buildDetailUrl(cityName, hotelName, hotelCode);
		window.history.pushState(
			{
				view: 'detail',
				city: cityName,
				hotel: hotelName,
				hotelCode: hotelCode,
			},
			'',
			url,
		);
		renderBreadcrumbs('detail', {
			city: cityName,
			hotel: hotelName,
			hotelCode: hotelCode,
		});
		updateBreadcrumbSchema('detail', {
			city: cityName,
			hotel: hotelName,
			hotelCode: hotelCode,
		});
	}

	function updateUrlForRoomSelection(
		cityName,
		hotelName,
		hotelCode,
	) {
		_lastCity = cityName;
		_lastHotelName = hotelName;
		_lastHotelCode = hotelCode;
		var url = buildRoomsUrl(cityName, hotelName, hotelCode);
		window.history.pushState(
			{
				view: 'rooms',
				city: cityName,
				hotel: hotelName,
				hotelCode: hotelCode,
			},
			'',
			url,
		);
		renderBreadcrumbs('rooms', {
			city: cityName,
			hotel: hotelName,
			hotelCode: hotelCode,
		});
		updateBreadcrumbSchema('rooms', {
			city: cityName,
			hotel: hotelName,
			hotelCode: hotelCode,
		});
	}

	// --- Breadcrumb UI rendering ---

	function renderBreadcrumbs(view, data) {
		data = data || {};
		var items = [{ label: 'Home', url: '/' }];
		items.push({ label: 'Hotels', url: BASE });

		if (data.city) {
			items.push({
				label: data.city,
				url: buildResultsUrl(data.city),
			});
		}
		if (data.hotel && data.hotelCode) {
			items.push({
				label: data.hotel,
				url: buildDetailUrl(
					data.city,
					data.hotel,
					data.hotelCode,
				),
			});
		}
		if (view === 'rooms') {
			items.push({ label: 'Rooms', url: null });
		}

		var html = '<ol itemscope itemtype="https://schema.org/BreadcrumbList">';
		items.forEach(function (item, i) {
			var isLast = i === items.length - 1;
			html +=
				'<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">';
			if (!isLast && item.url) {
				html +=
					'<a itemprop="item" href="' +
					item.url +
					'"><span itemprop="name">' +
					item.label +
					'</span></a>';
			} else {
				html +=
					'<span class="breadcrumb-current" itemprop="name">' +
					item.label +
					'</span>';
			}
			html +=
				'<meta itemprop="position" content="' + (i + 1) + '" />';
			html += '</li>';
		});
		html += '</ol>';

		var targetIds = {
			search: [],
			results: ['breadcrumbResults'],
			detail: ['breadcrumbDrill'],
			rooms: ['breadcrumbRooms'],
		};

		var ids = targetIds[view] || [];
		ids.forEach(function (id) {
			var el = document.getElementById(id);
			if (el) el.innerHTML = html;
		});
	}

	// --- Schema.org BreadcrumbList (JSON-LD) ---

	function updateBreadcrumbSchema(view, data) {
		data = data || {};
		var items = [
			{ name: 'Home', item: ORIGIN + '/' },
			{ name: 'Hotels', item: ORIGIN + BASE },
		];

		if (data.city) {
			items.push({
				name: data.city,
				item: ORIGIN + buildResultsUrl(data.city),
			});
		}
		if (data.hotel && data.hotelCode) {
			items.push({
				name: data.hotel,
				item:
					ORIGIN +
					buildDetailUrl(
						data.city,
						data.hotel,
						data.hotelCode,
					),
			});
		}
		if (view === 'rooms') {
			items.push({
				name: 'Rooms',
				item:
					ORIGIN +
					buildRoomsUrl(
						data.city,
						data.hotel,
						data.hotelCode,
					),
			});
		}

		var schema = {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: items.map(function (entry, i) {
				return {
					'@type': 'ListItem',
					position: i + 1,
					name: entry.name,
					item: entry.item,
				};
			}),
		};

		var existing = document.getElementById(
			'breadcrumb-schema-jsonld',
		);
		if (existing) existing.remove();

		var script = document.createElement('script');
		script.type = 'application/ld+json';
		script.id = 'breadcrumb-schema-jsonld';
		script.textContent = JSON.stringify(schema);
		document.head.appendChild(script);
	}

	// --- Popstate handler (browser Back / Forward) ---

	window.addEventListener('popstate', function (e) {
		var state = e.state || {};
		var view = state.view || 'search';

		switch (view) {
			case 'search':
				if (typeof backToSearch === 'function') {
					backToSearch();
				}
				renderBreadcrumbs('search');
				break;
			case 'results':
				if (typeof backToResults === 'function') {
					backToResults();
				}
				renderBreadcrumbs('results', {
					city: state.city,
				});
				break;
			case 'detail':
				if (
					state.hotelCode &&
					typeof ALL_HOTELS !== 'undefined' &&
					ALL_HOTELS.length > 0
				) {
					var match = ALL_HOTELS.find(function (h) {
						return (
							String(h.HotelCode) ===
							String(state.hotelCode)
						);
					});
					if (match && typeof startDrillDown === 'function') {
						jQuery('#hotelResultsPage')
							.removeClass('show')
							.addClass('hidden');
						startDrillDown(match);
					}
				}
				renderBreadcrumbs('detail', {
					city: state.city,
					hotel: state.hotel,
					hotelCode: state.hotelCode,
				});
				break;
			case 'rooms':
				renderBreadcrumbs('rooms', {
					city: state.city,
					hotel: state.hotel,
					hotelCode: state.hotelCode,
				});
				break;
		}
	});

	// --- Page-load restoration from server-injected state ---

	function restoreFromUrlState() {
		var state = window.__HOTEL_URL_STATE;
		if (!state || state.view === 'search') return;

		if (state.view === 'results' && state.citySlug) {
			_restoreResultsView(state);
		} else if (
			state.view === 'detail' &&
			state.citySlug &&
			state.hotelCode
		) {
			_restoreDetailView(state);
		} else if (
			state.view === 'rooms' &&
			state.citySlug &&
			state.hotelCode
		) {
			_restoreRoomsView(state);
		}
	}

	function _restoreResultsView(state) {
		var cityName = fromSlug(state.citySlug);

		_prefillSearchParams(state);

		window.history.replaceState(
			{ view: 'results', city: cityName },
			'',
			window.location.pathname + window.location.search,
		);
		renderBreadcrumbs('results', { city: cityName });
		updateBreadcrumbSchema('results', { city: cityName });

		_waitForCityCodesAndSearch(state.citySlug, cityName);
	}

	function _restoreDetailView(state) {
		var cityName = fromSlug(state.citySlug);
		var hotelName = state.hotelSlug
			? fromSlug(state.hotelSlug)
			: '';

		window.history.replaceState(
			{
				view: 'detail',
				city: cityName,
				hotel: hotelName,
				hotelCode: state.hotelCode,
			},
			'',
			window.location.pathname + window.location.search,
		);
		renderBreadcrumbs('detail', {
			city: cityName,
			hotel: hotelName,
			hotelCode: state.hotelCode,
		});
		updateBreadcrumbSchema('detail', {
			city: cityName,
			hotel: hotelName,
			hotelCode: state.hotelCode,
		});

		_prefillSearchParams(state);
		_waitForCityCodesAndSearch(
			state.citySlug,
			cityName,
			function () {
				_waitForHotelAndDrill(state.hotelCode, false);
			},
		);
	}

	function _restoreRoomsView(state) {
		var cityName = fromSlug(state.citySlug);
		var hotelName = state.hotelSlug
			? fromSlug(state.hotelSlug)
			: '';

		window.history.replaceState(
			{
				view: 'rooms',
				city: cityName,
				hotel: hotelName,
				hotelCode: state.hotelCode,
			},
			'',
			window.location.pathname + window.location.search,
		);
		renderBreadcrumbs('rooms', {
			city: cityName,
			hotel: hotelName,
			hotelCode: state.hotelCode,
		});
		updateBreadcrumbSchema('rooms', {
			city: cityName,
			hotel: hotelName,
			hotelCode: state.hotelCode,
		});

		_prefillSearchParams(state);
		_waitForCityCodesAndSearch(
			state.citySlug,
			cityName,
			function () {
				_waitForHotelAndDrill(state.hotelCode, true);
			},
		);
	}

	function _prefillSearchParams(state) {
		var q = state.query || {};
		if (q.checkin) {
			jQuery('#checkin-container').data('checkin-date', q.checkin);
			var d = new Date(q.checkin + 'T00:00:00');
			var opts = { day: 'numeric', month: 'short', year: 'numeric' };
			jQuery('#checkin-date').text(
				d.toLocaleDateString('en-US', opts),
			);
		}
		if (q.checkout) {
			jQuery('#checkout-container').data(
				'checkout-date',
				q.checkout,
			);
			var d2 = new Date(q.checkout + 'T00:00:00');
			var opts2 = { day: 'numeric', month: 'short', year: 'numeric' };
			jQuery('#checkout-date').text(
				d2.toLocaleDateString('en-US', opts2),
			);
		}
		if (q.adults) jQuery('#adults-value').text(q.adults);
		if (q.children) jQuery('#children-value').text(q.children);
		if (q.rooms) jQuery('#rooms-value').text(q.rooms);
	}

	function _waitForCityCodesAndSearch(
		citySlug,
		cityName,
		afterSearchCallback,
	) {
		var interval = 200;
		var timeout = 8000;
		var start = Date.now();

		function poll() {
			if (
				typeof allCityCodes !== 'undefined' &&
				allCityCodes.length > 0
			) {
				var match = allCityCodes.find(function (c) {
					return (
						c.Name &&
						toSlug(c.Name) === citySlug
					);
				});

				var cityCode = match ? match.Code : null;

				if (!cityCode) {
					var hardcoded = _findHardcodedCity(cityName);
					if (hardcoded) cityCode = hardcoded;
				}

				if (cityCode) {
					jQuery('#locationBox').data(
						'location-code',
						cityCode,
					);
					jQuery('#selectedLocation').text(cityName);

					if (typeof jsInit === 'function') {
						jsInit(
							'getHotelCodesFromDB',
							{ city_id: cityCode },
							'hotelCodes',
						);
					}
					_triggerAutoSearch(afterSearchCallback);
				}
			} else if (Date.now() - start < timeout) {
				setTimeout(poll, interval);
			}
		}

		poll();
	}

	function _findHardcodedCity(cityName) {
		var map = {
			dubai: '115936',
			mumbai: '144306',
			manali: '126388',
			'new delhi': '130443',
			bengaluru: '111124',
		};
		var key = (cityName || '').toLowerCase().trim();
		return map[key] || null;
	}

	function _triggerAutoSearch(afterCallback) {
		var tries = 0;
		var maxTries = 30;

		function attempt() {
			var hotelCodes = jQuery('#locationBox').data('hotelCodes');
			if (hotelCodes && hotelCodes.length > 0) {
				var searchBtn = document.getElementById('searchButton');
				if (searchBtn) {
					window.__hotelUrlAutoSearchCallback =
						afterCallback || null;
					searchBtn.click();
				}
			} else if (tries < maxTries) {
				tries++;
				setTimeout(attempt, 300);
			}
		}

		attempt();
	}

	function _waitForHotelAndDrill(hotelCode, openRooms) {
		var tries = 0;
		var maxTries = 40;

		function attempt() {
			if (
				typeof ALL_HOTELS !== 'undefined' &&
				ALL_HOTELS.length > 0
			) {
				var match = ALL_HOTELS.find(function (h) {
					return String(h.HotelCode) === String(hotelCode);
				});
				if (match) {
					jQuery('#hotelResultsPage')
						.removeClass('show')
						.addClass('hidden');
					if (typeof startDrillDown === 'function') {
						startDrillDown(match);
					}
					if (
						openRooms &&
						typeof showRoomSelectionPage === 'function'
					) {
						setTimeout(function () {
							showRoomSelectionPage(match);
						}, 500);
					}
					return;
				}
			}
			if (tries < maxTries) {
				tries++;
				setTimeout(attempt, 400);
			}
		}

		setTimeout(attempt, 800);
	}

	// --- Initialize on DOM ready ---

	document.addEventListener('DOMContentLoaded', function () {
		var state = window.__HOTEL_URL_STATE;
		if (state && state.view !== 'search') {
			setTimeout(restoreFromUrlState, 2500);
		}
	});

	// --- Public API ---
	return {
		toSlug: toSlug,
		fromSlug: fromSlug,
		updateUrlForSearch: updateUrlForSearch,
		updateUrlForResults: updateUrlForResults,
		updateUrlForDrillDown: updateUrlForDrillDown,
		updateUrlForRoomSelection: updateUrlForRoomSelection,
		renderBreadcrumbs: renderBreadcrumbs,
		getCurrentSearchParams: getCurrentSearchParams,
		getLastCity: function () {
			return _lastCity;
		},
		getLastHotelName: function () {
			return _lastHotelName;
		},
		getLastHotelCode: function () {
			return _lastHotelCode;
		},
	};
})();
