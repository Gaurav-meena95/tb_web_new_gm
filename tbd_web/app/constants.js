constants = {
	FROM_EMAIL: "info@beatravelbuddy.com",
	FROM_NAME: "Team TravelBuddy",
	ADMIN_EMAIL: "info@beatravelbuddy.com",
	EMAILIDS_FOR_ENQUIRY: [ "paromita@beatravelbuddy.com", "saurav@beatravelbuddy.com"],

	//EXPERIENCE TEMPLATES
	CONFIRMATION_EMAIL_TO_USER: "d-b72b72d9b40244e692d48d3071b34f96",
	CONFIRMATION_EMAIL_TO_HOST: "d-45c35d131f3c4b2db31953aea3189fd5",
	CANCELLED_BY_USER_EMAIL_TO_USER: "d-f63ee27ca0cb4961a3a7d05bae34fc86",
	CANCELLED_BY_USER_EMAIL_TO_HOST: "d-11fd98d9a0b44d5398054b593fd71577",
	FLIGHT_BOOKING_CONFIRMATION: "d-51a9f7c5d0d349a98d4e968247dc3d2e",
	FLIGHT_BOOKING_FAILED: "d-df4b00e718184a17a3e4f0901156c2bc",
	FLIGHT_BOOKING_FULL_REFUND: "d-39c3a7ab80d048f2b3daed5ccb3b1a9c",
    FLIGHT_BOOKING_PARTIAL_REFUND: "d-3bf55cb5f66f4ecab05eda80eb393bb5",
	FLIGHT_BOOKING_CANCELLATION: "d-147d812f8a7f44b493291837e3b1a7ea",
	// Hotel Booking Confirmation
	HOTEL_BOOKING_CONFIRMATION: "d-61ee68855a12498195ad2146c59a639f",
    // OTP Template
    SIGNUP_OTP_EMAIL_TEMPLATE_ID: "d-6f1aa811998640bfa4f68330615d8e50",
	EXP_THUMBNAIL: '/filters:format(webp)/fit-in/160x100/',
	EXP_IMGCOVERPHOTO: '/filters:format(webp)/fit-in/1680x800/',
	EXP_IMGGALLERYSIZE: '/filters:format(webp)/fit-in/100x50/',
	EXP_IMGSQUARE: '/filters:format(webp)/fit-in/500x500/',
	EXP_CATEGORY: '/filters:format(webp)/fit-in/200x200/',
	//PROFILE_IMAGE_SIZE: '/filters:format(webp)/fit-in/200x200/',
	PROFILE_IMAGE_SIZE: '',
	LOGGED_IN_USER_ID: -1,
	NOTIFICATION_TYPE_FOLLOW_USER: 'follow',
	NOTIFICATION_ACTION_PROFILE: 'profile',
	FOLLOW_NOTIFICATION_ICON: 'uploads/notification_icons/following_icon.png',
	NOTIFICATION_TYPE_MATCH_REQUEST: 'matchRequest',
	NOTIFICATION_TYPE_MATCHED: 'matched',
	NOTIFICATION_ACTION_MATCH: 'match',
	MATCH_NOTIFICATION_ICON: 'uploads/notification_icons/match_icon.png',
	APPVERSION: '3.15.548',
	PROFILE_IMAGE_SIZE: '/filters:format(webp)/fit-in/200x200/',
	BASE_URL: "https://beatravelbuddy.com/",
	//imageBaseUrl: 'https://d1hphxyq85xv5h.cloudfront.net',
	imageBaseUrl: 'https://prodmedia.beatravelbuddy.com',
	videoBaseUrl: 'https://d2w2hi6m5h0cd0.cloudfront.net',
	//videoBaseUrl: 'https://prodmedia.beatravelbuddy.com',
	S3_BUCKET: 'https://tbd-prod-media.s3.ap-south-1.amazonaws.com/',
	SUBSCRIPTIONS:{
		'TBMINI': ['product_vtp_promotional','tbd_sp_mini','tbd_mini','tbd_traveler_one_week_plus1','tbd__mini','resub_sub','product_vtp_one_month'],
		'TBPRO': ['tbd_pro','tbd__pro','one_month_vt_subscription','tbd_sub_traveler_one_month_plus1','product_vtp_three_month','tbd_service_provider_one_month_plus1','tbd_traveler_one_month_plus1','tbd_traveler_one_month'],
		'TBSUPER': ['tbd__super','tbd_super','tbd_traveler_one_year','tbd_service_provider_one_year_plus1','tbd_traveler_three_month_plus1','product_vtp_one_year','tbd_sub_traveler_one_year','tbd_sub_traveler_six_months','product_vtp_one_year_plus1','tbd_traveler_one_year_plus1']
	},
    THIRD_PARTY_INFO : {
        TBO_DEV :   {
            AUTH: 'http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate',
            FLIGHT_SEARCH: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search',
            CALENDAR_FARE: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetCalendarFare',
            FARE_RULE: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareRule',
            FARE_QUOTE: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareQuote',
            SSR: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SSR',
            BOOK: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Book',
            TICKET: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket',
            BOOKING_DETAILS: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetBookingDetails',
            RELEASE_PNR: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/ReleasePNRRequest',
            SEND_CHANGE_REQ: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SendChangeRequest',
            GET_CHANGE_REQ_STATUS: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetChangeRequestStatus',
            GET_CANCELLATION_CHARGES: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetCancellationCharges',
            GET_AGENCY_BALANCE: 'http://Sharedapi.tektravels.com/SharedData.svc/rest/GetAgencyBalance',
        },
        TBO_PROD :   {
            AUTH: 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate',
            FLIGHT_SEARCH: 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Search',
            CALENDAR_FARE: 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetCalendarFare',
            FARE_RULE: 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareRule',
            FARE_QUOTE: 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/FareQuote',
            SSR: 'https://tboapi.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/SSR',
            BOOK: 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Book',
            TICKET: 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/Ticket',
            BOOKING_DETAILS: 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetBookingDetails',
            RELEASE_PNR: 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/ReleasePNRRequest',
            SEND_CHANGE_REQ: 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/SendChangeRequest',
            GET_CHANGE_REQ_STATUS: 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetChangeRequestStatus',
            GET_CANCELLATION_CHARGES: 'https://booking.travelboutiqueonline.com/AirAPI_V10/AirService.svc/rest/GetCancellationCharges',
            GET_AGENCY_BALANCE: 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/GetAgencyBalance',
        },
        TBO_DEV_HOTELS : {
            AUTH: 'http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate',
            SEARCH: 'https://affiliate.tektravels.com/HotelAPI/Search',
            PREBOOK: 'https://affiliate.tektravels.com/HotelAPI/PreBook',
            BOOK: 'https://HotelBE.tektravels.com/hotelservice.svc/rest/book',
			BOOKING_DETAILS: 'https://hotelbe.tektravels.com/hotelservice.svc/rest/Getbookingdetail',
            COUNTRY_CODES: 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CountryList',
			CITY_CODES: 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CityList',
			HOTELCODES: 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList',
			HOTEL_DETAILS: 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/Hoteldetails',
            SendChangeRequest: 'http://HotelBE.tektravels.com/internalhotelservice.svc/rest/SendChangeRequest',
			GetChangeRequestStatus: 'http://HotelBE.tektravels.com/internalhotelservice.svc/rest/GetChangeRequestStatus',
			GET_AGENCY_BALANCE: 'http://Sharedapi.tektravels.com/SharedData.svc/rest/GetAgencyBalance',
            
        },
        TBO_PROD_HOTELS : {
            AUTH: 'https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest/Authenticate',
            HOTELCODES: 'https://apiwr.tboholidays.com/HotelAPI/TBOHotelCodeList',
            SEARCH: 'https://affiliate.travelboutiqueonline.com/HotelAPI/Search',
            PREBOOK: 'https://affiliate.travelboutiqueonline.com/HotelAPI/PreBook',
            BOOK: 'https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/book',
            BOOKING_DETAILS: 'https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/GetBookingDetail',
            COUNTRY_CODES: 'https://apiwr.tboholidays.com/HotelAPI/CountryList',
            CITY_CODES: 'https://apiwr.tboholidays.com/HotelAPI/CityList',
            SendChangeRequest: 'https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/SendChangeRequest',
            GetChangeRequestStatus: 'https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/GetChangeRequestStatus',
            HOTEL_DETAILS: 'https://apiwr.tboholidays.com/HotelAPI/Hoteldetails',
        }
    },
	// Maintenance Mode Configuration
	// Enable/disable maintenance mode via process.env.MAINTENANCE_MODE='true'
	MAINTENANCE: {
		// Custom message to display on maintenance page
		MESSAGE: "We're performing scheduled maintenance to improve your experience. We'll be back shortly!",
		// ISO timestamp for countdown timer (null if no end time)
		// Example: "2024-12-31T23:59:59Z"
		END_TIME: null,
		// IP addresses that can bypass maintenance mode
		// Remove localhost IPs to test maintenance mode locally
		ADMIN_IPS: [], // ['127.0.0.1', '::1'], // Uncomment to allow localhost bypass
		// Secret token for query parameter bypass (e.g., ?admin=your-secret-token-here)
		ADMIN_TOKEN: process.env.MAINTENANCE_ADMIN_TOKEN || 'change-this-to-secure-token'
	}
};
//Below tbo methods are not added
//Calendar Fare Search(Get Calendar Fare, Update Calendar fare), Price RBD , SEND Change Request, get change request, release pnr
module.exports = constants