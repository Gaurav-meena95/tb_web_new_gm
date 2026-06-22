/* ============================================
   FARE ESTIMATOR – Helper / Data Processing
   ============================================ */

/**
 * Format a number as INR currency string.
 * @param {number} amount
 * @returns {string} e.g. "₹4,523"
 */
function formatCurrency(amount) {
	if (amount == null || isNaN(amount)) return '₹--';
	return '₹' + Math.floor(amount).toLocaleString('en-IN');
}

/**
 * Format a number as compact INR for small cells.
 * e.g. 582 -> "₹582", 5823 -> "₹5.8K",
 *      15230 -> "₹15.2K", 132000 -> "₹1.3L"
 * @param {number} amount
 * @returns {string}
 */
function formatCurrencyCompact(amount) {
	if (amount == null || isNaN(amount)) return '₹--';
	var n = Math.floor(amount);
	if (n >= 100000) {
		return '₹' + (n / 100000).toFixed(1) + 'L';
	}
	if (n >= 1000) {
		return '₹' + (n / 1000).toFixed(1) + 'K';
	}
	return '₹' + n;
}

/**
 * Format a date string to a human-readable form.
 * @param {string} dateStr - ISO date string
 * @param {object} opts - Intl.DateTimeFormat options
 * @returns {string}
 */
function formatDate(dateStr, opts) {
	var defaults = {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	};
	var options = opts || defaults;
	return new Date(dateStr).toLocaleDateString(
		'en-IN',
		options,
	);
}

/**
 * Get the day-of-week name for a date.
 * @param {string} dateStr
 * @returns {string} e.g. "Wednesday"
 */
function getDayOfWeek(dateStr) {
	return new Date(dateStr).toLocaleDateString('en-IN', {
		weekday: 'long',
	});
}

/**
 * Compute the Nth percentile from a sorted array.
 * @param {number[]} sorted - ascending sorted numbers
 * @param {number} p - percentile (0-100)
 * @returns {number}
 */
function percentile(sorted, p) {
	if (!sorted.length) return 0;
	var idx = (p / 100) * (sorted.length - 1);
	var lower = Math.floor(idx);
	var upper = Math.ceil(idx);
	if (lower === upper) return sorted[lower];
	return (
		sorted[lower] * (upper - idx) +
		sorted[upper] * (idx - lower)
	);
}

/**
 * Classify a fare into a color category based on
 * percentile thresholds.
 * @param {number} fare
 * @param {number[]} sortedFares - all fares sorted asc
 * @param {boolean} isLowestOfMonth
 * @returns {'cheapest'|'good'|'moderate'|'expensive'}
 */
function getPercentileCategory(
	fare,
	sortedFares,
	isLowestOfMonth,
) {
	if (isLowestOfMonth) return 'cheapest';
	var p20 = percentile(sortedFares, 20);
	var p50 = percentile(sortedFares, 50);
	var p80 = percentile(sortedFares, 80);
	if (fare <= p20) return 'cheapest';
	if (fare <= p50) return 'good';
	if (fare <= p80) return 'moderate';
	return 'expensive';
}

/**
 * Get a human-readable label for a fare category.
 * @param {number} fare
 * @param {number[]} sortedFares
 * @param {boolean} isLowestOfMonth
 * @returns {string}
 */
function getSmartLabel(fare, sortedFares, isLowestOfMonth) {
	if (isLowestOfMonth) return 'Cheapest this month';
	var p25 = percentile(sortedFares, 25);
	var p80 = percentile(sortedFares, 80);
	if (fare <= p25) return 'Good value';
	if (fare >= p80) return 'High demand day';
	return '';
}

/**
 * Process raw SearchResults from multiple months into
 * structured data for rendering.
 *
 * Input: array of { Fare, DepartureDate,
 *   IsLowestFareOfMonth, ... }
 *
 * Output: {
 *   allFares: [...],            // sorted numbers
 *   lowest: { fare, date },
 *   average: number,
 *   bestDay: { fare, date, dayOfWeek },
 *   monthly: { 'Feb 2026': [...], ... },
 *   chartData: { labels, values },
 *   topDeals: [ top 3 ],
 *   dateRange: { from, to },
 * }
 */
function fareBoardProcessData(searchResults) {
	if (!searchResults || !searchResults.length) {
		return null;
	}

	// Sort by departure date
	var sorted = searchResults.slice().sort(function (a, b) {
		return (
			new Date(a.DepartureDate) -
			new Date(b.DepartureDate)
		);
	});

	// All fares sorted ascending (for percentile calc)
	var allFares = sorted
		.map(function (r) {
			return r.Fare;
		})
		.slice()
		.sort(function (a, b) {
			return a - b;
		});

	// Stats
	var totalFare = allFares.reduce(function (s, f) {
		return s + f;
	}, 0);
	var average = totalFare / allFares.length;

	// Find lowest
	var lowestResult = sorted.reduce(function (min, r) {
		return r.Fare < min.Fare ? r : min;
	}, sorted[0]);

	// Best day: find day-of-week with the lowest average
	var dayTotals = {};
	var dayCounts = {};
	sorted.forEach(function (r) {
		var dow = new Date(r.DepartureDate).getDay();
		dayTotals[dow] = (dayTotals[dow] || 0) + r.Fare;
		dayCounts[dow] = (dayCounts[dow] || 0) + 1;
	});

	var bestDow = 0;
	var bestDowAvg = Infinity;
	for (var dow in dayTotals) {
		var avg = dayTotals[dow] / dayCounts[dow];
		if (avg < bestDowAvg) {
			bestDowAvg = avg;
			bestDow = parseInt(dow);
		}
	}

	var dayNames = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];

	// Group by month
	var monthly = {};
	sorted.forEach(function (r) {
		var d = new Date(r.DepartureDate);
		var key =
			d.toLocaleDateString('en-IN', {
				month: 'short',
			}) +
			' ' +
			d.getFullYear();
		if (!monthly[key]) monthly[key] = [];

		// Enrich with category
		var category = getPercentileCategory(
			r.Fare,
			allFares,
			r.IsLowestFareOfMonth,
		);
		var label = getSmartLabel(
			r.Fare,
			allFares,
			r.IsLowestFareOfMonth,
		);
		var isOverallLowest =
			r.DepartureDate === lowestResult.DepartureDate &&
			r.Fare === lowestResult.Fare;

		monthly[key].push(
			Object.assign({}, r, {
				category: category,
				smartLabel: label,
				isOverallLowest: isOverallLowest,
			}),
		);
	});

	// Chart data (dates + fares in order)
	var chartData = {
		labels: sorted.map(function (r) {
			return formatDate(r.DepartureDate, {
				month: 'short',
				day: 'numeric',
			});
		}),
		values: sorted.map(function (r) {
			return Math.floor(r.Fare);
		}),
		dates: sorted.map(function (r) {
			return r.DepartureDate;
		}),
	};

	// Top 3 deals (cheapest, unique dates)
	var topDeals = searchResults
		.slice()
		.sort(function (a, b) {
			return a.Fare - b.Fare;
		})
		.slice(0, 3)
		.map(function (r, i) {
			return Object.assign({}, r, { rank: i + 1 });
		});

	// Date range
	var dateRange = {
		from: sorted[0].DepartureDate,
		to: sorted[sorted.length - 1].DepartureDate,
	};

	return {
		allFares: allFares,
		lowest: {
			fare: lowestResult.Fare,
			date: lowestResult.DepartureDate,
		},
		average: average,
		bestDay: {
			dayOfWeek: dayNames[bestDow],
			avgFare: bestDowAvg,
		},
		monthly: monthly,
		chartData: chartData,
		topDeals: topDeals,
		dateRange: dateRange,
		raw: sorted,
	};
}

/**
 * Detect fare patterns for AI insight copy.
 * @param {object} processedData - output of
 *   fareBoardProcessData
 * @returns {string} insight text
 */
function detectPatterns(processedData) {
	if (!processedData) return '';

	var parts = [];

	// Day-of-week insight
	if (processedData.bestDay) {
		parts.push(
			'Prices tend to be lowest on ' +
				processedData.bestDay.dayOfWeek + 's.',
		);
	}

	// Best date insight
	if (processedData.lowest) {
		var bestDate = formatDate(
			processedData.lowest.date,
			{
				weekday: 'short',
				month: 'short',
				day: 'numeric',
			},
		);
		parts.push(
			bestDate +
				' looks best at ' +
				formatCurrency(processedData.lowest.fare) +
				'.',
		);
	}

	// Savings insight
	if (processedData.average && processedData.lowest) {
		var savings = Math.floor(
			processedData.average - processedData.lowest.fare,
		);
		if (savings > 0) {
			parts.push(
				'Save up to ' +
					formatCurrency(savings) +
					' vs the average.',
			);
		}
	}

	return parts.join(' ');
}

/**
 * Build the month's first-day offset (0=Sun, 6=Sat)
 * and total days for calendar grid rendering.
 * @param {number} year
 * @param {number} month - 0-based
 * @returns {{ firstDay: number, daysInMonth: number }}
 */
function getMonthGrid(year, month) {
	return {
		firstDay: new Date(year, month, 1).getDay(),
		daysInMonth: new Date(year, month + 1, 0).getDate(),
	};
}

/**
 * Enable/disable passenger +/- buttons based on
 * current counts and validation rules:
 *   - Total (adults + children + infants) <= 9
 *   - Infants <= Adults
 *   - Adults >= 1, Children >= 0, Infants >= 0
 *
 * @param {number} adults
 * @param {number} children
 * @param {number} infants
 */
function updatePaxButtonStates(
	adults, children, infants,
) {
	var total = adults + children + infants;

	// Minus buttons
	$('.drawer__pax-btn[data-pax="adult"]' +
		'[data-dir="minus"]')
		.prop('disabled', adults <= 1);

	$('.drawer__pax-btn[data-pax="child"]' +
		'[data-dir="minus"]')
		.prop('disabled', children <= 0);

	$('.drawer__pax-btn[data-pax="infant"]' +
		'[data-dir="minus"]')
		.prop('disabled', infants <= 0);

	// Plus buttons – disabled if total would exceed 9
	$('.drawer__pax-btn[data-pax="adult"]' +
		'[data-dir="plus"]')
		.prop('disabled', total >= 9);

	$('.drawer__pax-btn[data-pax="child"]' +
		'[data-dir="plus"]')
		.prop('disabled', total >= 9);

	// Infant plus: disabled if total >= 9
	// OR infants already equal to adults
	$('.drawer__pax-btn[data-pax="infant"]' +
		'[data-dir="plus"]')
		.prop(
			'disabled',
			total >= 9 || infants >= adults,
		);
}
