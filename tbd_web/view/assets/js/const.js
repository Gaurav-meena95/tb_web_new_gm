//This is the file where all the project constants are and will need to be changed
const appVersion = getAppVersion();

//const imageBaseUrl = 'https://d1hphxyq85xv5h.cloudfront.net';
const imageBaseUrl = 'https://prodmedia.beatravelbuddy.com';
const videoBaseUrl = 'https://d2w2hi6m5h0cd0.cloudfront.net';
//const videoBaseUrl = 'https://prodmedia.beatravelbuddy.com';
const API_URL = pageUrl(window.location.href);
const RAZORPAY_KEY = 'rzp_live_BjxKA67DtRqxta';
const disableGuestLoginForDevices = false;
const useAppBilling = false;
const baseUrl = 'https://beatravelbuddy.com';


amenitiesIconsMapping = {
    "Café": "https://static.thehosteller.com/icons/Amenities/Coffee%20maker-1682510265796.svg",
    "CCTV": "https://static.thehosteller.com/icons/Amenities/Cctv-1682510196704.svg",
    "Common area": "https://static.thehosteller.com/icons/Amenities/Seating%20area-1682510294652.svg",
    "Front desk": "https://static.thehosteller.com/icons/Amenities/Front%20desk-1682510506230.svg",
    "Housekeeping": "https://static.thehosteller.com/icons/Amenities/Housekeeping-1682510596003.svg",
    "Indoor games": "https://static.thehosteller.com/icons/Amenities/Indoor%20Games-1682570826394.svg",
    "Parking": "https://static.thehosteller.com/icons/Amenities/Parking-1682510880863.svg",
    "Power backup": "https://static.thehosteller.com/icons/Amenities/Power%20Backup-1682510967533.svg",
    "Wi-Fi": "https://static.thehosteller.com/icons/Amenities/Wifi-1682511242681.svg",
    "Water dispenser": "https://static.thehosteller.com/icons/Amenities/Water%20dispenser-1682511230509.svg",
    "Air conditioner": "https://static.thehosteller.com/icons/Amenities/Air%20conditioner-1682509941937.svg",
    "Travel desk": "https://static.thehosteller.com/icons/Amenities/Travel%20desk-1682511129492.svg",
    "Elevator": "https://static.thehosteller.com/icons/Amenities/Elevator-1682510385130.svg",
    "Pet friendly": "https://static.thehosteller.com/icons/Amenities/Pet%20friendly-1682510898188.svg",
    "Bar": "https://static.thehosteller.com/icons/Amenities/Bar-1682510030150.svg",
    "Pool": "https://static.thehosteller.com/icons/Amenities/pool-1682510952753.svg",
    "Garden": "https://static.thehosteller.com/icons/Amenities/Garden-1682510528860.svg",
    "Bonfire": "https://static.thehosteller.com/icons/Amenities/bonfire-1682510165838.svg",
    "Board game": "https://static.thehosteller.com/icons/Amenities/Board%20games-1682510153826.svg",
    "Washroom": "https://static.thehosteller.com/icons/Amenities/Washroom-1682511196310.svg",
    "Workstation": "https://static.thehosteller.com/icons/Amenities/Workstation-1682511255318.svg",
    "Bike parking": "https://static.thehosteller.com/icons/Amenities/Bike%20parking-1682510102625.svg",
};

allHostellerDataArr = [];

let callLocationPopup = true;
let callNotificationPopup = true;
let userProfileData = '';
var currentIndex = 0;
var array = [];
var sortedChat = [];
var sortedUserInfo = [];
var renderChatArray = [];
let countdownInterval, intervalFadeText;
// This array contains the data for all checkboxes.
checkboxesData = [
    { type: 'adventure', value: 'Adventures', imgSrc: 'adventure_light.svg', label: 'Adventures' },
    { type: 'backpacking', value: 'Backpacking', imgSrc: 'backpacking_light.svg', label: 'Backpacking' },
    { type: 'trekking', value: 'Trekking', imgSrc: 'trekking_light.svg', label: 'Trekking' },
    
    { type: 'beaches', value: 'Beaches', imgSrc: 'beach_light.svg', label: 'Beaches' },
    { type: 'shopping', value: 'Shopping', imgSrc: 'shopping_light.svg', label: 'Shopping' },
    { type: 'bleisure', value: 'NightLife', imgSrc: 'pubs_light.svg', label: 'NightLife' },
    
    { type: 'luxurious', value: 'Luxurious', imgSrc: 'luxury_light.svg', label: 'Luxurious' },
    { type: 'religious', value: 'Religious', imgSrc: 'religious_light.svg', label: 'Religious' },
    { type: 'romantic', value: 'Romantic', imgSrc: 'romantic_light.svg', label: 'Romantic' },
    
    { type: 'volcanoes', value: 'Volcanoes', imgSrc: 'volcano_light.svg', label: 'Volcanoes' },
    { type: 'star-gazing', value: 'StarGazing', imgSrc: 'starGazing_light.svg', label: 'Star Gazing' },
    { type: 'themeParks', value: 'themeParks', imgSrc: 'themePark_light.svg', label: 'Theme Parks' },
    
    { type: 'wildLife', value: 'wildLife', imgSrc: 'wildLifes_light.svg', label: 'WildLife' },
    { type: 'roadTrip', value: 'roadTrip', imgSrc: 'roadTrip_light.svg', label: 'Road Trip' },
    { type: 'hiddenGems', value: 'hidden-gems', imgSrc: 'hiddenGems_light.svg', label: 'Hidden Gems' },
    
    { type: 'boatRide', value: 'Kayaking / Boating', imgSrc: 'boating_light.svg', label: 'Kayaking' },
    { type: 'family', value: 'family', imgSrc: 'family_light.svg', label: 'Family' },
    { type: 'cuisines', value: 'famousCusines', imgSrc: 'food_light.svg', label: 'Cuisines' },
    
    { type: 'weekend', value: 'weekend-gateways', imgSrc: 'weekendGateway_light.svg', label: 'Weekend Gateways' },
    { type: 'mustSee', value: 'must visit places', imgSrc: 'mustSee_light.svg', label: 'Must Visits' },
    { type: 'forts', value: 'forts & palaces', imgSrc: 'forts_light.svg', label: 'Forts / Palaces' },
    
];

// enquiryFormLocationsArray = ['andaman', 'bali', 'char-dham', 'himachal-pradesh', 'jibhi', 'kashmir', 'kerala', 'ladakh', 'malaysia', 'manali', 'north-east', 'puri', 'sikkim', 'singapore', 'south-india', 'spiti', 'thailand', 'uttrakhand', 'valley-flowers', 'vietnam', 'near bangalore', 'others'];

groupTripLocations = ['ladakh', 'spiti', 'manali', 'valley-flowers', 'tarsar-marsar-trek', 'kashmir-great-lakes-trek', 'hampta-pass', 'mcleodganj', 'jibhi', 'manali-solang-kasol', 'krabi-phuket', 'char-dham'];

familyTripLocations = ['thailand', 'vietnam', 'indonesia', 'singapore', 'malaysia', 'kashmir', 'south-india', 'kerala', 'sikkim', 'meghalaya', 'andaman', 'udaipur'];

enquiryLocationsShown = [];

hostellerCouponCode = 'TRAVELBUDDY';
tabNames = ['inreview', 'published', 'draft', 'deleted'];

// Define an object to hold the HTML content for each tab
let tabHtmlContents = {
    meetupsTabHtml: '',
    findTabHtml: '',
    localTabHtml: '',
    followingTabHtml: '',
    influencersTabHtml: '',
    trendingTabHtml: ''
};

shouldAppendFromChildAdded = false;



const icons = fetchIcons();


let travelShotsArr = [];

allChatsHtml = '';
groupChatsHtml = '';
personalChatsHtml = '';

/*------------------ TBO Constants ------------------*/

selectedFlightForBooking = ''; // This will store the selected flight for booking Oneway or all International
selectedFlightForBookingRound = ''; // This will store the selected flight for booking Domestic Round Trip

seatSelectedOw = []; // This will store the selected seats for booking Oneway or all International
seatSelectedIb = []; // This will store the selected seats for Domestic Round Trip ( Inbound )
seatSelectedOb = []; // This will store the selected seats for Domestic Round Trip ( Outbound )
mealSelectedOw = []; // This will store the selected meals for booking Oneway or all International
mealSelectedIb = []; // This will store the selected meals for Domestic Round Trip ( Inbound )
mealSelectedOb = []; // This will store the selected meals for Domestic Round Trip ( Outbound )

allAirports = [];

flightsSearchResults = ''; // This will store the search results for flights

cheapestFlights = {
    'toLocation': {}
}; // This will store the cheapest flights for the selected location

ssrArrayIndex = 0; // This will store the selected flight index for SSR

/*------------------ TBO Hotels ------------------*/

allCityCodes = [];

/*------------------ TBO Constants ------------------*/

/* ----------------- Suggested Container ----------------- */
suggestedContainer = '';






//Basic Constants
const profileCompletenessCheck = 100;

function pageUrl(page_url) {
    ajax_url = 'https://beatravelbuddy.com';

    if (page_url.includes('localhost')) {
        ajax_url = 'http://localhost:3000';
    }
    else if (page_url.includes('https://dev.beatravelbuddy.com')) {
        ajax_url = 'https://dev.beatravelbuddy.com';
    }
    else if (page_url.includes('https://beatravelbuddy.com') || page_url.includes('https://www.beatravelbuddy.com')) {
        ajax_url = 'https://beatravelbuddy.com';
    }
    else if (page_url.includes('https://beatravelbuddy.co.in')) {
        ajax_url = 'https://beatravelbuddy.co.in';
    }
    else if (page_url.includes('https://dev.beatravelbuddy.co.in')){
        ajax_url = 'https://dev.beatravelbuddy.co.in';
    }

    return ajax_url;
}

function getAppVersion() {
    return jQuery('#app').attr('data-version');
}

// Global ad tracking
let adDisplayCount = 0;
const AD_INTERVAL = 4; // Show ad every 4 posts
const MAX_ADS_PER_SESSION = 5;