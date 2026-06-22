//setTimeout(() => {
	
//}, 5000);

function webAnalytics(state, data) {
	try {
		console.log('webAnalytics', state, data);
		if (window.location.href.indexOf('localhost') > -1) {
			return;
		}
		
		
		
		if (!googleAnalytics) {
			
			return;
		}
		if (typeof googleAnalytics == 'undefined') {
			return;
		}
		console.log('googleAnalytics', googleAnalytics);
		if (state == 'search_footer') {
			googleAnalytics.logEvent('search_button_footer');
		}
		else if (state == 'viewCouponBtn') {
			googleAnalytics.logEvent('viewCouponBtn');
		}
		else if (state == 'inAppWebPopup') {
			googleAnalytics.logEvent('inAppWebPopup');
		}
		else if (state == 'app_install') {
			googleAnalytics.logEvent('app_install');
		}
		else if (state == 'community_open') {
			googleAnalytics.logEvent('community_open');
		}
		else if (state == 'addPost_footer') {
			console.log('addPost_footer');
			googleAnalytics.logEvent('addPost_footer');
		}
		else if (state == 'profile_open') {
			googleAnalytics.logEvent('profile_open');
		}
		else if (state == 'search_open') {
			googleAnalytics.logEvent('search_open');
		}
		else if (state == 'premium_open') {
			googleAnalytics.logEvent('premium_open');
		}
		else if (state == 'premium_purchase_init') {
			googleAnalytics.logEvent('premium_purchase_init');
		}
		else if (state == 'flights_open') {
			googleAnalytics.logEvent('flights_open');
		}
		else if (state == 'flightsSelected') {
			googleAnalytics.logEvent('flightsSelected');
		}
		else if (state == 'premium_purchase_cancelled') {
			googleAnalytics.logEvent('premium_purchase_cancelled');
		}
		else if (state == 'findBuddy') {
			googleAnalytics.logEvent('findBuddy');
		}
		else if (state == 'flightsBookingBack') {
			googleAnalytics.logEvent('flightsBookingBack');
		}
	
		else if (state == 'report_option_active') {
			googleAnalytics.logEvent('report_option_active');
		}
		else if (state == 'report_option_close_on_cancel_click') {
			googleAnalytics.logEvent('report_option_close_on_cancel_click');
		}
		else if (state == 'report_user') {
			googleAnalytics.logEvent('report_user');
		}
		else if (state == 'experience_selected') {
			googleAnalytics.logEvent('experience_selected');
		}
		else if (state == 'single_experience_back_icon') {
			googleAnalytics.logEvent('single_experience_back_icon');
		}
		else if (state == 'experiences_book_now_clicked') {
			googleAnalytics.logEvent('experiences_book_now_clicked');
		}
		else if (state == 'experience_slot_booking') {
			googleAnalytics.logEvent('experience_slot_booking');
		}
		else if (state == 'experience_month_change') {
			googleAnalytics.logEvent('experience_month_change');
		}
		else if (state == 'experience_date_change') {
			googleAnalytics.logEvent('experience_date_change');
		}
		else if (state == 'experience_booking_summary') {
			googleAnalytics.logEvent('experience_booking_summary');
		}
		else if (state == 'experience_to_premium_page') {
			googleAnalytics.logEvent('experience_to_premium_page');
		}
		else if (state == 'experience_search_results_close') {
			googleAnalytics.logEvent('experience_search_results_close');
		}
		else if (state == 'experience_increment_tickets') {
			googleAnalytics.logEvent('experience_increment_tickets');
		}
		else if (state == 'experience_share_options_open') {
			googleAnalytics.logEvent('experience_share_options_open');
		}
		else if (state == 'experience_share_option_close') {
			googleAnalytics.logEvent('experience_share_option_close');
		}
		else if (state == 'experience_share_link_copied_clipboard') {
			googleAnalytics.logEvent('experience_share_link_copied_clipboard');
		}
		else if (state == 'experience_booking_init') {
			googleAnalytics.logEvent('experience_booking_init');
		}
		else if (state == 'experience_booking_price_validation_passed') {
			googleAnalytics.logEvent('experience_booking_price_validation_passed');
		}
		else if (state == 'experience_booking_tickets_blocked') {
			googleAnalytics.logEvent('experience_booking_tickets_blocked');
		}
		else if (state == 'experience_booking_confirmed') {
			googleAnalytics.logEvent('experience_booking_confirmed');
		}
		else if (state == 'experience_booking_thank_you_page') {
			googleAnalytics.logEvent('experience_booking_thank_you_page');
		}
	}
	catch (err) {
		console.log('webAnalytics', err);
	}
}
