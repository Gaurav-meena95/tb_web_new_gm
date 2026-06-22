//This is the file where all the project constants are and will need to be changed
const appVersion = getAppVersion();

const imageBaseUrl = 'https://d1hphxyq85xv5h.cloudfront.net';
const videoBaseUrl = 'https://d2w2hi6m5h0cd0.cloudfront.net';

const RAZORPAY_KEY = 'rzp_live_BjxKA67DtRqxta';

const API_URL = pageUrl(window.location.href)
const baseUrl = 'https://beatravelbuddy.com';

shouldAppendFromChildAdded = false;







// const icons = fetchIcons();

let travelShotsArr = [];

allChatsHtml = '';
groupChatsHtml = '';
personalChatsHtml = '';

/*------------------ TBO Hotels ------------------*/

allCityCodes = [];

/*------------------ TBO Constants ------------------*/

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
