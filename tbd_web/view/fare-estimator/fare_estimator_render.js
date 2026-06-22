/* ============================================
   FARE ESTIMATOR – Render Functions
   ============================================ */

/* ---- Chart instance reference ---- */
var fareBoardChartInstance = null;

/**
 * Show the skeleton loading state and hide content.
 */
function renderFareBoardSkeleton() {
	$('#fareBoardLoading').show();
	$('#fareBoardContent').hide();
	$('#fareBoardError').hide();
}

/**
 * Hide skeleton and show the content area.
 */
function hideFareBoardSkeleton() {
	$('#fareBoardLoading').hide();
	$('#fareBoardContent').show();
}

/**
 * Show the error state with a message.
 * @param {string} msg
 */
function showFareBoardError(msg) {
	$('#fareBoardLoading').hide();
	$('#fareBoardContent').hide();
	$('#fareBoardError').show();
	$('#fareBoardErrorMsg').text(
		msg || 'Something went wrong. Please try again.',
	);
}

/* ------------------------------------------------
   HEADER: Route display + summary pills
   ------------------------------------------------ */

/**
 * Render the header with route info and stat pills.
 * @param {string} origin
 * @param {string} destination
 * @param {object} stats - from fareBoardProcessData
 */
function renderFareBoardHeader(origin, destination, stats) {
	var fromDate = formatDate(stats.dateRange.from, {
		month: 'long',
		year: 'numeric',
	});
	var toDate = formatDate(stats.dateRange.to, {
		month: 'long',
		year: 'numeric',
	});

	var html =
		'<div class="fare-board__route">' +
		'<span class="fare-board__city">' +
		origin +
		'</span>' +
		'<i class="fas fa-arrow-right fare-board__arrow">' +
		'</i>' +
		'<span class="fare-board__city">' +
		destination +
		'</span>' +
		'</div>' +
		'<div class="fare-board__date-range">' +
		fromDate +
		' &mdash; ' +
		toDate +
		'</div>' +
		'<div class="fare-board__pills">' +
		'<span class="fare-board__pill ' +
		'fare-board__pill--lowest">' +
		'<i class="fas fa-arrow-down"></i> Lowest ' +
		'<span class="fare-board__pill-value">' +
		formatCurrency(stats.lowest.fare) +
		'</span></span>' +
		'<span class="fare-board__pill ' +
		'fare-board__pill--avg">' +
		'<i class="fas fa-chart-bar"></i> Avg ' +
		'<span class="fare-board__pill-value">' +
		formatCurrency(stats.average) +
		'</span></span>' +
		'<span class="fare-board__pill ' +
		'fare-board__pill--best-day">' +
		'<i class="fas fa-calendar-check"></i> Best: ' +
		'<span class="fare-board__pill-value">' +
		stats.bestDay.dayOfWeek +
		's</span></span>' +
		'</div>';

	$('#fareBoardHeader').html(html);
}

/* ------------------------------------------------
   RANGE TABS: 3 / 6 / 9 months
   ------------------------------------------------ */

/**
 * Set the active range tab visually.
 * @param {number} months - 3, 6, or 9
 */
function setActiveRangeTab(months) {
	$('.range-tab').removeClass('active');
	$('.range-tab[data-months="' + months + '"]').addClass(
		'active',
	);

	var posMap = { 3: '0', 6: '1', 9: '2' };
	$('.range-tab__underline').attr(
		'data-pos',
		posMap[months] || '0',
	);
}

/* ------------------------------------------------
   CHART: Chart.js line chart with gradient
   ------------------------------------------------ */

/**
 * Render the price trend chart.
 * @param {object} chartData - { labels, values, dates }
 */
function renderFareBoardChart(chartData) {
	var canvas = document.getElementById('fareBoardChart');
	if (!canvas) return;

	// Destroy existing chart
	if (fareBoardChartInstance) {
		fareBoardChartInstance.destroy();
		fareBoardChartInstance = null;
	}

	var ctx = canvas.getContext('2d');

	// Gradient fill – cinematic under-line glow
	var gradient = ctx.createLinearGradient(
		0,
		0,
		0,
		canvas.parentElement.clientHeight || 260,
	);
	gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
	gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
	gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

	// Find lowest index for glow point
	var minVal = Math.min.apply(null, chartData.values);
	var minIdx = chartData.values.indexOf(minVal);

	// Point colors: glow on lowest, transparent otherwise
	var pointBg = chartData.values.map(function (v, i) {
		return i === minIdx
			? '#34d399'
			: 'rgba(59, 130, 246, 0)';
	});
	var pointBorder = chartData.values.map(function (v, i) {
		return i === minIdx
			? '#34d399'
			: 'rgba(59, 130, 246, 0)';
	});
	var pointRadius = chartData.values.map(function (v, i) {
		return i === minIdx ? 7 : 0;
	});
	var pointHoverRadius = chartData.values.map(
		function (v, i) {
			return i === minIdx ? 9 : 5;
		},
	);

	// Thin labels for readability
	var displayLabels = chartData.labels.map(
		function (label, i) {
			// Show every nth label depending on count
			var step = Math.ceil(chartData.labels.length / 12);
			return i % step === 0 ? label : '';
		},
	);

	fareBoardChartInstance = new Chart(ctx, {
		type: 'line',
		data: {
			labels: displayLabels,
			datasets: [
				{
					label: 'Fare',
					data: chartData.values,
					borderColor: '#3b82f6',
					backgroundColor: gradient,
					borderWidth: 2.5,
					fill: true,
					tension: 0.4,
					pointBackgroundColor: pointBg,
					pointBorderColor: pointBorder,
					pointRadius: pointRadius,
					pointHoverRadius: pointHoverRadius,
					pointHoverBackgroundColor: '#3b82f6',
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			interaction: {
				mode: 'index',
				intersect: false,
			},
			plugins: {
				legend: { display: false },
			tooltip: {
				backgroundColor: 'rgba(15, 23, 42, 0.95)',
				titleColor: '#f1f5f9',
				bodyColor: '#94a3b8',
				borderColor: 'rgba(255,255,255,0.06)',
				borderWidth: 1,
				cornerRadius: 12,
				padding: 14,
				displayColors: false,
				titleFont: {
					family: 'Inter',
					size: 14,
					weight: 600,
				},
				bodyFont: {
					family: 'JetBrains Mono',
					size: 16,
					weight: 700,
				},
					callbacks: {
						title: function (items) {
							var idx = items[0].dataIndex;
							return chartData.labels[idx];
						},
						label: function (item) {
							return formatCurrency(item.raw);
						},
					},
				},
			},
			scales: {
			x: {
				grid: {
					color: 'rgba(255,255,255,0.025)',
					drawBorder: false,
				},
				ticks: {
					color: '#475569',
					font: {
						family: 'Inter',
						size: 10,
						weight: 500,
					},
					maxRotation: 0,
				},
			},
			y: {
				grid: {
					color: 'rgba(255,255,255,0.025)',
					drawBorder: false,
				},
				ticks: {
					color: '#fff',
					font: {
						family: 'JetBrains Mono',
						size: 16,
					},
					callback: function (value) {
						return formatCurrency(value);
					},
				},
			},
			},
		animation: {
			duration: 1600,
			easing: 'easeOutQuart',
		},
		},
	});
}

/* ------------------------------------------------
   HEATMAP: Calendar grids per month
   ------------------------------------------------ */

/**
 * Render calendar heatmap grids for all months.
 * @param {object} monthlyData - keyed by month string
 */
function renderFareBoardHeatmap(monthlyData) {
	var $container = $('#fareBoardHeatmap');
	$container.empty();

	var today = new Date();
	today.setHours(0, 0, 0, 0);

	var weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	var monthKeys = Object.keys(monthlyData);
	monthKeys.forEach(function (monthKey) {
		var fares = monthlyData[monthKey];
		if (!fares.length) return;

		// Determine year/month from first fare
		var sampleDate = new Date(fares[0].DepartureDate);
		var year = sampleDate.getFullYear();
		var month = sampleDate.getMonth();
		var grid = getMonthGrid(year, month);

		// Build fare lookup by day
		var fareLookup = {};
		fares.forEach(function (f) {
			var d = new Date(f.DepartureDate).getDate();
			fareLookup[d] = f;
		});

		// Month container
		var $month = $('<div class="heatmap__month"></div>');
		$month.append(
			'<div class="heatmap__month-title">' +
				monthKey +
				'</div>',
		);

		// Weekday headers
		var $weekdayRow = $(
			'<div class="heatmap__weekdays"></div>',
		);
		weekdays.forEach(function (wd) {
			$weekdayRow.append(
				'<div class="heatmap__weekday">' +
					wd +
					'</div>',
			);
		});
		$month.append($weekdayRow);

		// Day grid
		var $grid = $('<div class="heatmap__grid"></div>');

		// Empty cells before first day
		for (var e = 0; e < grid.firstDay; e++) {
			$grid.append(
				'<div class="heatmap__day ' +
					'heatmap__day--empty"></div>',
			);
		}

		// Day cells
		for (var day = 1; day <= grid.daysInMonth; day++) {
			var cellDate = new Date(year, month, day);
			var isPast = cellDate < today;
			var fare = fareLookup[day];

			var classes = 'heatmap__day';
			if (isPast) {
				classes += ' heatmap__day--past';
			}
			if (fare) {
				if (fare.isOverallLowest) {
					classes += ' heatmap__day--lowest';
				} else {
					classes +=
						' heatmap__day--' + fare.category;
				}
			}

		var priceHtml = fare
			? '<div class="heatmap__day-price">' +
				formatCurrencyCompact(fare.Fare) +
				'</div>'
			: '';

			var $day = $(
				'<div class="' +
					classes +
					'" ' +
					(fare
						? 'data-departure="' +
							fare.DepartureDate +
							'" ' +
							'data-fare="' +
							fare.Fare +
							'"'
						: '') +
					'>' +
					'<div class="heatmap__day-num">' +
					day +
					'</div>' +
					priceHtml +
					'</div>',
			);

			$grid.append($day);
		}

		$month.append($grid);
		$container.append($month);
	});

	// Add color legend below the heatmap
	if (monthKeys.length) {
		var $legend = $(
			'<div class="heatmap__legend">' +
				'<span class="heatmap__legend-item">' +
				'<span class="heatmap__legend-dot ' +
				'heatmap__legend-dot--cheapest"></span>' +
				' Cheapest</span>' +
				'<span class="heatmap__legend-item">' +
				'<span class="heatmap__legend-dot ' +
				'heatmap__legend-dot--good"></span>' +
				' Good</span>' +
				'<span class="heatmap__legend-item">' +
				'<span class="heatmap__legend-dot ' +
				'heatmap__legend-dot--moderate"></span>' +
				' Moderate</span>' +
				'<span class="heatmap__legend-item">' +
				'<span class="heatmap__legend-dot ' +
				'heatmap__legend-dot--expensive"></span>' +
				' Expensive</span>' +
				'</div>',
		);
		$container.append($legend);
	}
}

/* ------------------------------------------------
   BEST DEALS: Top 3 cheapest date cards
   ------------------------------------------------ */

/**
 * Render the top deal cards.
 * @param {Array} topDeals - from fareBoardProcessData
 */
function renderFareBoardDeals(topDeals) {
	var $container = $('#fareBoardDeals');
	$container.empty();

	var rankLabels = [
		'Best Deal',
		'2nd Best',
		'3rd Best',
	];

	// Badge-style rank labels with icons
	var rankIcons = [
		'<i class="fas fa-crown" style="margin-right:4px"></i>',
		'<i class="fas fa-medal" style="margin-right:4px"></i>',
		'<i class="fas fa-award" style="margin-right:4px"></i>',
	];

	topDeals.forEach(function (deal) {
		var dateFormatted = formatDate(
			deal.DepartureDate,
			{
				weekday: 'short',
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			},
		);
		var dayOfWeek = getDayOfWeek(deal.DepartureDate);

		var html =
			'<div class="deal-card" ' +
			'data-departure="' +
			deal.DepartureDate +
			'" ' +
			'data-fare="' +
			deal.Fare +
			'">' +
			'<div class="deal-card__rank ' +
			'deal-card__rank--' +
			deal.rank +
			'">' +
			(rankIcons[deal.rank - 1] || '') +
			rankLabels[deal.rank - 1] +
			'</div>' +
			'<div class="deal-card__date">' +
			dateFormatted +
			'</div>' +
			'<div class="deal-card__day">' +
			dayOfWeek +
			'</div>' +
			'<div class="deal-card__fare">' +
			formatCurrency(deal.Fare) +
			'</div>' +
			'<button class="deal-card__cta">' +
			'View Details</button>' +
			'</div>';

		$container.append(html);
	});
}

/* ------------------------------------------------
   DRAWER: Slide-up detail bottom sheet
   ------------------------------------------------ */

/**
 * Open the drawer with fare details for a date.
 * @param {object} fareItem - enriched fare object
 * @param {string} origin
 * @param {string} destination
 */
function renderFareDrawer(fareItem, origin, destination) {
	if (!fareItem) return;

	var dateStr = formatDate(fareItem.DepartureDate, {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});

	var smartLabel = fareItem.smartLabel
		? '<span style="color:#10b981;font-size:0.75rem;' +
			'font-weight:600;">' +
			fareItem.smartLabel +
			'</span>'
		: '';

	// Use actual BaseFare / Tax from the API when
	// available, otherwise fall back to estimates.
	var baseFare = fareItem.BaseFare != null
		? Math.floor(fareItem.BaseFare)
		: Math.floor(fareItem.Fare * 0.75);
	var taxes = fareItem.Tax != null
		? Math.floor(fareItem.Tax)
		: Math.floor(fareItem.Fare * 0.25);

	// Airline info
	var airlineName = fareItem.AirlineName || '';
	var airlineCode = fareItem.AirlineCode || '';
	// Treat "default" as unknown
	if (airlineName.toLowerCase() === 'default') {
		airlineName = airlineCode;
	}
	var airlineDisplay = airlineName
		? airlineName +
			(airlineCode
				? ' (' + airlineCode + ')'
				: '')
		: '';

	// Compact date for title line (e.g. "14 Feb")
	var shortDate = formatDate(fareItem.DepartureDate, {
		day: 'numeric',
		month: 'short',
	});

	var html =
		'<div class="drawer__title">' +
		origin +
		' &rarr; ' +
		destination +
		'</div>' +
		'<div class="drawer__subtitle">' +
		dateStr +
		' ' +
		smartLabel +
		'</div>' +
		(airlineDisplay
			? '<div class="drawer__airline">' +
				(airlineCode
					? '<img ' +
						'src="https://beatravelbuddy.com' +
						'/view/assets/img/AirlineLogo/' +
						airlineCode + '.gif" ' +
						'alt="' + airlineName + '" ' +
						'class="drawer__airline-logo" ' +
						'onerror="this.style.display=' +
						'\'none\';this.nextElementSibling' +
						'.style.display=\'inline\'" />' +
						'<i class="fas fa-plane-departure' +
						'" style="display:none;margin-' +
						'right:6px;color:#60a5fa;"></i>'
					: '<i class="fas fa-plane-departure"' +
						' style="margin-right:6px;' +
						'color:#60a5fa;"></i>') +
				airlineDisplay +
				'</div>'
			: '') +
		'<div class="drawer__fare-row">' +
		'<span class="drawer__fare-label">' +
		'Estimated Base Fare</span>' +
		'<span class="drawer__fare-value">' +
		formatCurrency(baseFare) +
		'</span></div>' +
		'<div class="drawer__fare-row">' +
		'<span class="drawer__fare-label">' +
		'Taxes & Fees (est.)</span>' +
		'<span class="drawer__fare-value">' +
		formatCurrency(taxes) +
		'</span></div>' +
		'<div class="drawer__fare-row drawer__total-row">' +
		'<span class="drawer__fare-label">Total</span>' +
		'<span class="drawer__fare-value">' +
		formatCurrency(fareItem.Fare) +
		'</span></div>' +

		/* ---- Passenger Selector ---- */
		'<div class="drawer__pax-section">' +
		'<div class="drawer__pax-title">' +
		'<i class="fas fa-users"></i> Passengers' +
		'</div>' +

		/* Adults (min 1) */
		'<div class="drawer__pax-row">' +
		'<div class="drawer__pax-info">' +
		'<span class="drawer__pax-label">Adults</span>' +
		'<span class="drawer__pax-hint">' +
		'12+ years</span>' +
		'</div>' +
		'<div class="drawer__pax-counter">' +
		'<button class="drawer__pax-btn" type="button" ' +
		'data-pax="adult" data-dir="minus">' +
		'<i class="fas fa-minus"></i></button>' +
		'<span class="drawer__pax-value" ' +
		'id="paxAdult">1</span>' +
		'<button class="drawer__pax-btn" type="button" ' +
		'data-pax="adult" data-dir="plus">' +
		'<i class="fas fa-plus"></i></button>' +
		'</div></div>' +

		/* Children (min 0) */
		'<div class="drawer__pax-row">' +
		'<div class="drawer__pax-info">' +
		'<span class="drawer__pax-label">Children</span>' +
		'<span class="drawer__pax-hint">' +
		'2 – 11 years</span>' +
		'</div>' +
		'<div class="drawer__pax-counter">' +
		'<button class="drawer__pax-btn" type="button" ' +
		'data-pax="child" data-dir="minus">' +
		'<i class="fas fa-minus"></i></button>' +
		'<span class="drawer__pax-value" ' +
		'id="paxChild">0</span>' +
		'<button class="drawer__pax-btn" type="button" ' +
		'data-pax="child" data-dir="plus">' +
		'<i class="fas fa-plus"></i></button>' +
		'</div></div>' +

		/* Infants (min 0) */
		'<div class="drawer__pax-row">' +
		'<div class="drawer__pax-info">' +
		'<span class="drawer__pax-label">Infants</span>' +
		'<span class="drawer__pax-hint">' +
		'Under 2 years</span>' +
		'</div>' +
		'<div class="drawer__pax-counter">' +
		'<button class="drawer__pax-btn" type="button" ' +
		'data-pax="infant" data-dir="minus">' +
		'<i class="fas fa-minus"></i></button>' +
		'<span class="drawer__pax-value" ' +
		'id="paxInfant">0</span>' +
		'<button class="drawer__pax-btn" type="button" ' +
		'data-pax="infant" data-dir="plus">' +
		'<i class="fas fa-plus"></i></button>' +
		'</div></div>' +

		/* Validation error (hidden by default) */
		'<div class="drawer__pax-error" ' +
		'id="paxError"></div>' +

		'</div>' +
		/* ---- End Passenger Selector ---- */

		/* ---- Premium Banner ---- */
		'<div class="drawer__premium-banner">' +
		'<div class="drawer__premium-icon">' +
		'<i class="fas fa-crown"></i>' +
		'</div>' +
		'<div class="drawer__premium-text">' +
		'<span class="drawer__premium-headline">' +
		'0 convenience fees on all flights' +
		'</span>' +
		'<span class="drawer__premium-sub">' +
		'Premium starts at ' +
		'<strong>&#8377;499/mo</strong>' +
		'</span>' +
		'</div>' +
		'<span class="drawer__premium-cta">' +
		'Go Premium ' +
		'<i class="fas fa-arrow-right"></i>' +
		'</span>' +
		'</div>' +
		/* ---- End Premium Banner ---- */

		'<button class="drawer__book-btn" ' +
		'data-departure="' +
		fareItem.DepartureDate +
		'">' +
		'<i class="fas fa-search"></i> ' +
		'Search Flights for This Date' +
		'</button>';

	$('#fareDrawerContent').html(html);
	$('#fareDrawerOverlay').addClass('open');

	// Set initial disabled states for pax buttons
	updatePaxButtonStates(1, 0, 0);
}

/**
 * Close the fare detail drawer.
 */
function closeFareDrawer() {
	$('#fareDrawerOverlay').removeClass('open');
}

/* ------------------------------------------------
   AI INSIGHT COPY
   ------------------------------------------------ */

/**
 * Render the AI insight bar above the header.
 * @param {object} processedData
 */
function renderAIInsight(processedData) {
	var text = detectPatterns(processedData);
	if (text) {
		$('#fareBoardAI').text(text).show();
	} else {
		$('#fareBoardAI').hide();
	}
}

/* ------------------------------------------------
   MASTER RENDER: Orchestrate all sections
   ------------------------------------------------ */

/**
 * Render all fare board sections with processed data.
 * @param {object} processedData
 * @param {string} origin
 * @param {string} destination
 */
function renderAllFareBoardSections(
	processedData,
	origin,
	destination,
) {
	renderAIInsight(processedData);
	renderFareBoardHeader(origin, destination, processedData);
	renderFareBoardChart(processedData.chartData);
	renderFareBoardHeatmap(processedData.monthly);
	renderFareBoardDeals(processedData.topDeals);
	hideFareBoardSkeleton();
}
