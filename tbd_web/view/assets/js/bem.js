locationArray = [];
function tokenMaster(state, data) {
	
	let token = false;

	//Check if the token is already set in the local storage, else check in cookies if token is stored and set it in local storage and if not then set it cookie redirect user to login page
	if (state == 'session_start') {
		if (!localStorage.getItem('token')) {
			if (getCookie('token') && getCookie('token') != null) {
				token = getCookie('token');
				localStorage.setItem('token', token);
			}
			else {
				localStorage.setItem('isGuestUser', true);
				jsInit('login', '', 'guest');
			}
		}
		else if (localStorage.getItem('token').length < 800) {
			tokenMaster('set', '');
			tokenMaster('session_start');
		}
		else {
			token = localStorage.getItem('token');
		}
	}
	else if (state == 'set') {
		localStorage.setItem('token', data);
		setCookie('token', data, 15);
	}
	else if (state == 'get') {
		token = localStorage.getItem('token');
	}
	else if (state == 'logout') {
		if (data && data.responseCode != 200) {
			toast(data.errorMessage);
		}
		else {
			cleanLocalStorage();
			//Moengage.destroy_session();
			// Set the path to the root
			window.history.pushState({ "html": '', "pageTitle": '' }, '', '/');
            reloadWindowWithIosCheck();
			
		}
	}
	else if (state == 'manageRefreshToken') {
		if (data && data.responseCode == 401 && data.errorMessage == 'Authorization has been denied for this request.') {
			console.log('Refresh Token');
			jsInit('refreshToken');
		}
	}

	return token;

	function cleanLocalStorage() {
		cheapestFlights.toLocation = {};
		localStorage.removeItem('token');
		setCookie('token', '', 0);
		localStorage.removeItem('userProfile');
		localStorage.removeItem('notificationToken');
		localStorage.removeItem('notifications');
		localStorage.removeItem('tempToken');
		localStorage.removeItem('updatedPhoneState');
		localStorage.removeItem('updatedCountryCode');
		localStorage.removeItem('updatedPhoneNumber');
		localStorage.removeItem('lastActiveStatus');
		localStorage.removeItem('plainUserId');
		localStorage.removeItem('previousPage');
		localStorage.removeItem('subscriptionEndsOn');
		localStorage.removeItem('packageOwnedId');
		localStorage.removeItem('chat__open');
		manageUserChat('clean');
        clearIndexedDb();
	}
}


function scrollManager(state, type) {
	if (state == 'Start') {
		if (type == 'Marketplace') {
			jQuery(document).ready(function () {
				jQuery('#main__flightHotels-box').on('scroll', function (e) {
					checkScrollBottom(e, jQuery(this), type);
				});
			});
		}
		else if (type == 'Followers') {
			tab = jQuery('.followers__tab_head ul li.active').attr('data-tab');
			jQuery('.followers__tab-' + tab + ' .followers__items').on('scroll', function (e) {
				checkScrollBottom(e, jQuery(this), type);
			});
		}
		else if (type == 'LOCATION' || type == 'HASHTAG' || type == 'FILTERFEED') {
			jQuery('#secondary .secondary__tab:last-child').on('scroll', function (e) {
				checkScrollBottom(e, jQuery(this), type);
			});
		}
		else if (type == 'Followers New Chat') {
			jQuery('.create__chat-group__users').on('scroll', function (e) {
				checkScrollBottom(e, jQuery(this), type);
			});
		}
		else if (type == 'Followers Send Chat') {
			jQuery('#main__drawer .feed__send-profiles').on('scroll', function (e) {
				checkScrollBottom(e, jQuery(this), type);
			});
		}
		else if (type == 'Notifications') {
			jQuery('#notifications').on('scroll', function (e) {
				checkScrollBottom(e, jQuery(this), type);
			});
		}
		else if (type == 'Chat') {
			jQuery('.singleChat__box').on('scroll', function (e) {
				checkScrollBottom(e, jQuery(this), type, 'top');
			});
		}
		else if (type == 'Experiences') {
			jQuery('#main__experiences-box.active .experiences__page').on('scroll', function (e) {
				checkScrollBottom(e, jQuery(this), type);
			});
		}
	}
}

function videoVisibleChecker() {
	//If a video is visible in the viewport then play it
	jQuery('.video-slide').each(function () {
		if (isElementInViewport(jQuery(this))) {
			//jQuery(this).find('.feed__body-video-overlay').trigger('click');
		}
		else {
			videoManager('pauseAll');
		}
	});

	//Check if atleast 75% of the video is visible in the viewport
	function isElementInViewport(el) {
		var rect = el.get(0).getBoundingClientRect();

		var windowHeight = $(window).height();
		var scrollTop = $(window).scrollTop();
		var feedItem = el.parents('.feed_item');
		var itemTop = feedItem.offset().top;
		var itemHeight = feedItem.height();
		var itemBottom = itemTop + itemHeight;

		// Calculate the threshold position
		var threshold = scrollTop + windowHeight * 0.7;
		returnVal = true;
		if (itemBottom < threshold || itemTop > threshold) {
			// Pause the video if it's outside the viewport
			var video = feedItem.find("video")[0];
			if (video && !video.paused) {
				//video.pause();
				returnVal = false;
			}
		}
		return returnVal;
	}
}

function isServiceProvider() {
	return manageUserProfile('read', 'userType');
}

function checkScrollBottom(e, tab, type, scrollDirection) {
	var elem = jQuery(e.currentTarget);

	if (scrollDirection == 'top') {
		if (elem.scrollTop() == 0) {
			pagination(tab, type);
		}
	}
	else if (elem[0].scrollHeight - (elem.scrollTop() + 600) <= elem.outerHeight()) {
		if (jQuery(tab).attr('data-triggered') == 'true') {
			setTimeout(function () {
				jQuery(tab).attr('data-triggered', 'false');
			}, 1500);
		}
		else {
			jQuery(tab).attr('data-triggered', 'true');
			guestMaster();
			pagination(tab, type);
		}
	}
	if (type == 'Experiences') {
		if (elem[0].scrollHeight - (elem.scrollTop() + 1500) <= elem.outerHeight()){
			renderAllExperiences('renderNextPage')
			if (guestMaster()) {
				// Show Login Popup
				renderBottomSheet('', 'loginNew');
			}
		}
		// Commenting the below code as the premium form is not required in the experiences page
		/*if (elem.scrollTop() > 3000){
			isPremiumFormShown = localStorage.getItem('premiumFormShown');
			if (isPremiumFormShown == 'false'){
				renderPermissionBox('init','premiumForm', 'experiences');
				localStorage.setItem('premiumFormShown',true);
			}
		}*/
		/*if (elem.scrollTop() > 1000){
			isEnquiryFormShown = localStorage.getItem('enquiryFormShown');
			if (isEnquiryFormShown == 'false'){
				renderPermissionBox('init','leadForm');
				localStorage.setItem('enquiryFormShown',true);
			}
		}*/
	}
	if (type == 'Main Feed') {
        if (elem.scrollTop() > 1500){
            isPremiumFormShown = localStorage.getItem('premiumFormShown');
            if (isPremiumFormShown == 'false'){
                renderPermissionBox('init','premiumForm', 'community');
                localStorage.setItem('premiumFormShown',true);
            }
        }
    }
	
	
	function pagination(tab, type) {
		if (type == 'Main Feed') {
			pageNumber = 1 + Number(jQuery(tab).attr('data-page'));
			feedType = jQuery(tab).attr('data-id');
			if (feedType !== '-2') {
				console.log(feedType);
				fetchPosts({ feedsType: feedType, locationLat: userLatLong['latitude'], locationLong: userLatLong['longitude'], pageNumber: pageNumber }, jQuery(tab).attr('data-tab'));
				loaderMain('feed', true);
			}
			console.log('pageNumber', pageNumber);

			jQuery(tab).attr('data-page', pageNumber);

		}
		else if (type == 'Marketplace') {
			pageNumber = 1 + Number(jQuery(tab).attr('data-page'));
			inputValue = jQuery('.experiences__search-box').find('input[type="text"]').val().trim();
			if (inputValue.length == 0) {
				userLatLong = getLatLongfromStorage();
				if (userLatLong['longitude'] == '0') {
					jsInit('fetchServices', { "latitude": 0, "longitude": 0, "pageNumber": pageNumber }, 'pagination');
				}
				else {
					jsInit('fetchServices', { "latitude": userLatLong['latitude'], "longitude": userLatLong['longitude'], "pageNumber": pageNumber }, 'pagination');
				}
			}
			else {
				jsInit('searchServices', { "latitude": 0.0, "location": inputValue, "longitude": 0.0, "pageNumber": pageNumber }, 'search');
			}

			jQuery(tab).attr('data-page', pageNumber);
		}
		else if (type == 'Followers') {
			jQuery(tab).children('.followers__load-more').trigger('click');
		}
		else if (type == 'LOCATION' || type == 'HASHTAG' || type == 'FILTERFEED') {
			pageNumber = 1 + Number(jQuery(tab).find('.feed__box').attr('data-page'));
			whichlocation = jQuery(tab).find('.feed__box').attr('data-location');
			payloadData = { feedsType: type, pageNumber: pageNumber, location: whichlocation, userId: manageUserProfile('read', 'userId') };
			if (type == 'FILTERFEED') {
				if (localStorage.getItem('filter')) {
					payloadData.feedsType = 7;
					payloadData.filter = JSON.parse(localStorage.getItem('filter'));
				}
			}
			
			if (type == 'LOCATION' && !locationArray.includes(whichlocation) && pageNumber == 1) {
				renderPermissionBox('init', 'leadForm', whichlocation);
				jQuery('#'+ getDestinationSelector()).val(whichlocation);
				locationArray.push(whichlocation);
			}

			fetchPosts(payloadData, '#secondary .secondary__tab:last-child .drawerBody .feed__box');

			jQuery(tab).find('.feed__box').attr('data-page', pageNumber);
		}
		else if (type == 'Followers New Chat' || type == 'Followers Send Chat') {
			pageNumber = Number(jQuery(tab).attr('data-page-number'));
			totalPages = jQuery(tab).attr('data-total-pages');
			if (pageNumber < totalPages) {
				element = (type == 'Followers New Chat') ? 'groupChat' : 'chatSend';
				jsInit('fetchFollowers', { userId: manageUserProfile('read', 'userId'), pageNumber: pageNumber, type: 0 }, element);
			}
		}
		else if (type == 'Notifications') {
			pageNumber = Number(jQuery(tab).attr('data-pagenumber'));
			totalPages = jQuery(tab).attr('data-totalpages');

			if (pageNumber < totalPages) {
				jsInit('fetchNotifications', {
					notificationId: 0,
					totalItems: 0,
					pageNumber: 1 + pageNumber,
				});
			}
		}
		else if (type == 'Chat') {
			pageNumber = Number(jQuery(tab).parents('.singleChat__container').attr('data-pagenumber'));
			totalPages = jQuery(tab).parents('.singleChat__container').attr('data-totalpages');

			if (pageNumber < totalPages) {
				// jsInit('fetchChatMessages', { chatId: jQuery(tab).parents('.singleChat__container').attr('data-chat-id'), userId: jQuery(tab).parents('.singleChat__container').attr('data-chat-user'), chatType: jQuery(tab).parents('.singleChat__container').attr('data-chat-type'), page: 1 + pageNumber }, 'pagination');
			}
		}
	}
}

function tabManager() {
	
	jQuery("#main__tabs").draggable({
		cursor: "move",
		containment: "parent",
		stop: function () {
			if (jQuery("#main__tabs").position().left < 1)
				jQuery("#main__tabs").css("left", "740px");
		}
	});
}

//Format the date time to hours ago & days ago format
function formatDate(date) {
	var date = new Date(date);
	var now = new Date();

	//The date is UTC, so is shows time in the past, so convert it to local time
	//date = new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));

	var diff = (now.getTime() - date.getTime()) / 1000;
	diff /= 60;
	var minutes = Math.abs(Math.round(diff));
	var hours = Math.round(minutes / 60);
	var days = Math.round(hours / 24);
	var months = Math.round(days / 30);
	var years = Math.round(months / 12);

	if (minutes == 0) {
		date = 'Just now';
	}
	else if (minutes < 60) {
		date = minutes + ' minutes ago';
	}
	else if (hours < 24) {
		date = hours + ' hours ago';
	}
	else if (days < 30) {
		date = days + ' days ago';
	}
	else if (months < 12) {
		date = date.toLocaleString('default', { month: 'long' }) + ', ' + date.getFullYear();
	}

	return date;
}

function getOrdinalNum(n, applyStyle) {
	if (applyStyle){
		return n + (n > 0 ? ['<sup>th</sup>', '<sup>st</sup>', '<sup>nd</sup>', '<sup>rd</sup>'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
	}else{
		return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
	}
}

//Format Date in 21st Jan, 2020 format
function formatDate2(date) {
	var date = new Date(date);

	return getOrdinalNum(date.getDate()) + ' ' + date.toLocaleString('default', { month: 'short' }) + ', ' + date.getFullYear();
}

function formatDateForFlights(dateString) {
    // Parse the date string to a Date object
    let date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    // Extract the last two digits of the year
    let year = date.getFullYear().toString().slice(-2);
    // Format the date with weekday, day, and month
    let options = { weekday: 'short', day: '2-digit', month: 'short' };
    let formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    // Split the formatted date to rearrange the day and month
    let parts = formattedDate.split(' ');
    formattedDate = `${parts[0]} ${parts[2]} ${parts[1]}`;
    // Combine the formatted date with the last two digits of the year
    return `${formattedDate} '${year}`;
}

//This Date format is for the chat
function formatDateForChat(date, type) {
	//Convert timestamp to date in the format of 12:00 AM if the day is today or else the format should be 12/05/23
	date = new Date(Number(date) * 1000);

	//Check if the date is today
	if (date.toDateString() == new Date().toDateString()) {
		date = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	}
	//Check if the date is yesterday
	else if (date.toDateString() == new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()) {
		date = 'Yesterday';
	}
	//Check if the date is within the last 7 days
	else if (date > new Date(new Date().setDate(new Date().getDate() - 7))) {
		date = date.toLocaleString('en-US', { weekday: 'short' });
	}
	else {
        // adding a leading zero to the day and month and then slicing the last two digits 
        day = ('0' + date.getDate()).slice(-2);
        month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based in JavaScript
        yearLastTwoDigits = ('' + date.getFullYear()).slice(-2);

        date = `${day}/${month}/${yearLastTwoDigits}`;
    }


	return date;
}


//Getter & Setter for the local storage
function setLocalStorage(key, value) {

	if (typeof (Storage) !== "undefined") {

		localStorage.setItem(key, value);
	}
	else {
		console.log("Sorry! No Web Storage support..");
	}
}

function getLocalStorage(key) {

	if (typeof (Storage) !== "undefined") {

		return localStorage.getItem(key);
	}
	else {
		console.log("Sorry! No Web Storage support..");
	}
}


function manageUserProfile(state, data) {
	response = null;

	if (state == 'init') {
		//Check if the user data is already in the local storage
		if (!getLocalStorage('userProfile')) {
			fetchUserProfile('init');
		}
		else {
			renderProfile('init', getLocalStorage('userProfile'), 'encrpyted');
		}
	}
	else if (state == 'update') {
		console.log(JSON.parse(getLocalStorage('userProfile')));
		// Encrypt the data in such a way that it can be decrypted while reading
		data = CryptoJS.AES.encrypt(JSON.stringify(data), 'TravelBuddy').toString();
		//setLocalStorage('userProfile', JSON.stringify(data));
		setLocalStorage('userProfile', data);

		renderProfile('init', data, 'encrpyted');
	}
	else if (state == 'clean') {
		localStorage.removeItem('userProfile');
		manageUserProfile('init');
	}
	else if (state == 'read') {
		if (!getLocalStorage('userProfile')) {
			fetchUserProfile('init');
		}
		else {
			var userProfile = getLocalStorage('userProfile');
			try 
			{
				JSON.parse(userProfile);
				profile = JSON.parse(getLocalStorage('userProfile'));
			} 
			catch (error) {
				var bytes  = CryptoJS.AES.decrypt(getLocalStorage('userProfile'), 'TravelBuddy');
				var decryptedData = bytes.toString(CryptoJS.enc.Utf8);	
				try {
					profile = JSON.parse(decryptedData);
				} 
				catch (error) {
					console.error('Error parsing JSON:', error);
				}
			}

			if (data == 'all') {
				response = profile;
			}
			else if (data == 'userId') {
				response = profile.userId;
			}
			else if (data == 'name') {
				response = profile.name;
			}
			else if (data == 'email') {
				response = profile.email;
			}
			else if (data == 'profilePic') {
				response = profile.imageUrl;
			}
			else if (data == 'countryCode' || data == 'dialCode') {
				response = profile.dialCode
			}
			else if (data == 'phoneNumber') {
				response = profile.phoneNumber;
			}
			else if (data == 'userType') {
				response = profile.userType;
			}
			else if (data == 'gender') {
				response = profile.gender;
			}
			else if (data == 'interests') {
				response = profile.userInterests;
			}
			else if (data == 'city') {
				response = profile.city;
			}
			else if (data == 'location') {
				response = profile.location;
			}
			else if (data == 'completeness') {
				response = profile.completeness;
			}
			else if (data == 'isVerified') {
				response = profile.isVerified;
			}
			else if (data == 'followers' || data == 'followersCount') {
				response = profile.followerCount;
			}
			else if (data == 'following' || data == 'followingCount') {
				response = profile.followingCount;
			}
			else if (data == 'rating') {
				response = profile.rating;
			}
			else if (data == 'postsCount') {
				response = profile.postsCount;
			}
			else if (data == 'plainUserId') {
				return localStorage.getItem('plainUserId');
			}
			else if (data == 'profileName') {
				response = profile.profileName;
			}
			else if (data == 'dateOfBirth') {
				response = profile.dateOfBirth;
			}
			else if (data == 'role') {
				response = profile.role;
			}else{
				response = profile[data]
			}

		}

		if (response == null || response == undefined || response == '') {
			response = '';
		}

		return response;
	}

}


function playSound(type) {
	if (type == 'message') {
		var audio = new Audio('view/assets/audio/message.mp3');

		//Check if the audio is already playing
		if (audio.paused) {
			audio.play();
		}
	}
}


//Process the post description, make the hashtags links and make the links html link items and render it
function processPostDescription(description) {
	if (description == null || description == undefined || description == '') {
		description = '';
	}
	else {
		var description = description;
		var descriptionArray = description.split(' ');

		descriptionArray.forEach((item, index) => {
			//Check if the item is a hashtag & item starts with #
			if (item.includes('#')) {
				//Break item into before # and after # and replace # with empty string. If is not only # then only replace the first #
				if (item != '#') {
					var itemArray = item.split('#');
					itemArray[1] = itemArray[1].replace('#', '');

					//Replace the item with the link
					descriptionArray[index] = '<a class="hashtag-item" data-hashtag="' + itemArray[1] + '">#' + itemArray[1] + '</a>';
				}
			}
			//Check if the item is a @ mention & item starts with @
			else if (item.includes('@')) {
				//Break item into before @ and after @ and replace @ with empty string
				var itemArray = item.split('@');
				itemArray[1] = itemArray[1].replace('@', '');

				//Replace the item with the link
				descriptionArray[index] = '<a href="#profile" class="mention-item" data-mention="' + itemArray[1] + '">@' + itemArray[1] + '</a>';
			}
			//Check if the item is a link and item starts with http or https or www
			else if (item.toLowerCase().includes('http')) {
				//Break item into before http and after http and replace HTTP with http
				var itemArray = item.split('http');
				// itemArray[1] = itemArray[1].toLowerCase();
				itemArray[1] = itemArray[1];

				//Check if the item doesn't contain more than the link
				if (itemArray[1].includes('\n')) {
					//Split the item again with the new line
					var furtherSplit = item.split('\n');

					descriptionArray[index] = '<a href="' + furtherSplit[0] + '" target="_blank">' + furtherSplit[0] + '</a>' + '\n' + furtherSplit[1] + furtherSplit[2];

				}
				else {
					//Replace the item with the link
					descriptionArray[index] = '<a href="http' + itemArray[1] + '" target="_blank">http' + itemArray[1] + '</a>';
				}
			}
			//Also check for www and item starts with www
			else if (item.includes('www') || item.includes('WWW') || item.includes('Www') || item.includes('wWW')) {
				descriptionArray[index] = '<a href="http://' + item + '" target="_blank">' + item + '</a>';
			}

		});

		description = descriptionArray.join(' ');
	}

	return description;
}

//Process the user profile image, check if there is an http in the url and render it
function renderUserProfileImage(image) {
	//Check if the item starts with / then remove it. Only the first one

	try {
		if (image !== null && image !== undefined && image !== '') {
			if (image) {
				if (image.startsWith('/filters:format(webp)/fit-in/1000x1000/https://res.cloudinary.com/')) {
					image = image.replace('/filters:format(webp)/fit-in/1000x1000/https://res.cloudinary.com/', 'https://res.cloudinary.com/');
				}
			}

			// if (image.startsWith('/')) {
			// 	image = image.replace('/', '');
			// }
			if (image.includes('filters:format(webp)/fit-in/')) {
				// Use regex to match and remove ALL filter patterns globally
				// This handles cases like:
				// - /filters:format(webp)/fit-in/200x200/
				// - filters:format(webp)/fit-in/200x200/
				// - /filters:format(webp)/fit-in/1000x1000//uploads/posts/...
				// - Multiple consecutive filters: /filters:format(webp)/fit-in/160x100//filters:format(webp)/fit-in/1680x800//...
				image = image.replace(/\/?filters:format\(webp\)\/fit-in\/\d+x\d+\/\/?/g, '/');
			}

			if (image) {
				if (image.includes('http') == false) {
					if (image.startsWith('/')) {
						image = imageBaseUrl + image;
					}
					else {
						image = imageBaseUrl + '/' + image;
					}
				}
			}

		}
	}
	catch (error) {
		console.log(error);
	}

	return image;
}

function renderPostMedia(item, type) {
	response = null;

	//Check if the item starts with /
	if (item.startsWith('/')) {
		item = item.replace('/', '');
	}

	if (item.includes('http') == false) {
		if (type == 'image' || type == '') {
			item = imageBaseUrl + '/' + item;
		}
		else if (type == 'video') {

			item = videoBaseUrl + '/' + item;
		}
	}
    else if (item.includes('http') && item.startsWith('filters')) {
        url = item;
        item = url.replace(/filters:format\(webp\)\/fit-in\/[^\/]*\//, "");
	}
	
	if (item.includes('filters:format(webp)/fit-in/')) {
		// Use regex to match and remove ALL filter patterns globally
		// This handles cases like:
		// - /filters:format(webp)/fit-in/200x200/
		// - filters:format(webp)/fit-in/200x200/
		// - /filters:format(webp)/fit-in/1000x1000//uploads/posts/...
		// - Multiple consecutive filters: /filters:format(webp)/fit-in/160x100//filters:format(webp)/fit-in/1680x800//...
		item = item.replace(/\/?filters:format\(webp\)\/fit-in\/\d+x\d+\/\/?/g, '/');
	}

	return item;
}

function renderReplies(replies) {
	response = '';
	if (replies > 0) {
		//Check if the replies are more than 1
		if (replies > 1) {
			replies = replies + ' replies';
		}
		else {
			replies = replies + ' reply';
		}

		response = '<span class="comment__item-replies-toggle">View ' + replies + '</span>';
	}

	return response;
}

//Generate the rating stars item. Merge svg's to create the rating stars
function generateRatingStars(rating) {
	response = '';
	fullStar = icons.starFill;
	halfStar = icons.starHalf;
	emptyStar = icons.starLine;

	if (rating !== undefined && rating !== null && rating !== '') {
		if (rating > -1) {
			rating = Number(rating).toFixed(2);

			//Check if the rating is 5
			if (rating == 5) {
				response = fullStar + fullStar + fullStar + fullStar + fullStar;
			}
			else if (rating > 4) {
				response = fullStar + fullStar + fullStar + fullStar + halfStar;
			}
			else if (rating == 4) {
				response = fullStar + fullStar + fullStar + fullStar + emptyStar;
			}
			else if (rating > 3) {
				response = fullStar + fullStar + fullStar + halfStar + emptyStar;
			}
			else if (rating == 3) {
				response = fullStar + fullStar + fullStar + emptyStar + emptyStar;
			}
			else if (rating > 2) {
				response = fullStar + fullStar + halfStar + emptyStar + emptyStar;
			}
			else if (rating == 2) {
				response = fullStar + fullStar + emptyStar + emptyStar + emptyStar;
			}
			else if (rating > 1) {
				response = fullStar + halfStar + emptyStar + emptyStar + emptyStar;
			}
			else if (rating == 1) {
				response = fullStar + emptyStar + emptyStar + emptyStar + emptyStar;
			}
			else if (rating < 1) {
				response = emptyStar + emptyStar + emptyStar + emptyStar + emptyStar;
			}

			response = '<span class="rating__item-stars">' + response + '</span>';
		}
	}

	return response;
}

//Slashed Price. Show a higher price.
function slashedPrice(price, currency, percentage) {
	renderItem = '';

	if (price) {
		price = price * (1 + (percentage / 100));
		renderItem = '<span class="item__price-slashed">' + currency + numberWithCommas(Number(price).toFixed(0)) + '</span>';
	}

	return renderItem;
}

//Auto resize the textarea
function autosize() {
	var text = jQuery('.autosize');

	text.each(function () {
		if (jQuery(this).hasClass('addPost__textarea')) {
			jQuery(this).attr('rows', 5);
		}
		else {
			jQuery(this).attr('rows', 2);
		}
		resize(jQuery(this));
	});

	text.on('input', function () {
		resize(jQuery(this));
	});

	function resize(text) {
		text.css('height', 'auto');
		text.css('height', text[0].scrollHeight + 'px');
	}
}


//Restrict Input type date to today
function restrictDateInput() {
	var now = new Date(),
		// minimum date the user can choose, in this case now and in the future
		minDate = now.toISOString().substring(0, 10);

	jQuery('input[type="date"]').prop('min', minDate);
}


//Getter & Setter for the cookie
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();

	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}


//Function to format a number with commas
function numberWithCommas(x) {
	if (x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	else {
		return '';
	}
}

function numberWithK(x) {
	if (x >= 1000) {
		x = (x / 1000).toFixed(1) + 'K';
	}

	return x;
}

function otpView() {
	jQuery(document).on('change', '.otp-field input', function () {
		inputs = document.querySelectorAll(".otp-field input");

		inputs.forEach((input, index) => {
			input.dataset.index = index;
			input.addEventListener("keyup", handleOtp);
			input.addEventListener("paste", handleOnPasteOtp);
		});
		handleOtp(jQuery(this));
	});


	function handleOtp(e) {
		val = jQuery('.otp-field__large input').val('');

		if (val.length == 6) {
			submit();
		}
	}

	function handleOnPasteOtp(inputs) {
		const data = e.clipboardData.getData("text");
		const value = data.split("");
		if (value.length === inputs.length) {
			inputs.forEach((input, index) => (input.value = value[index]));
			submit();
		}
	}

	function submit() {
		let otp = "";
		inputs.forEach((input) => {
			otp += input.value;
			input.disabled = true;
			input.classList.add("disabled");
		});

		//Call the API to verify the OTP
		manageOTP('Submit');
	}
}

function resendOTPInterval(source) {
	time = 60;
	refreshIntervalId = setInterval(() => {
		if (source == 'bookingSummary') {
			resendItem = jQuery('.bookingSummary__userDetails-otp__resend_in');
		}
		else {
			resendItem = jQuery('.otp__resend_in');
		}

		jQuery(resendItem).attr('data-time', time);

		if (time > 0) {
			time = time - 1;
			jQuery(resendItem).attr('data-time', time);
			jQuery(resendItem).html('in ' + time + 's');
		}
		else {
			jQuery(resendItem).html('');
			jQuery('.bookingSummary__userDetails-otp__resend').removeClass('disabled');
			jQuery('.otp__resend').removeClass('disabled');

			clearInterval(refreshIntervalId);
		}
	}, 1000);
}

function setCountryCode(where) {
	liveLocationInfo = localStorage.getItem('liveLocationInfo');

	if (liveLocationInfo && liveLocationInfo.location && liveLocationInfo.location.calling_code !== undefined && liveLocationInfo.location.calling_code !== null && liveLocationInfo.location.calling_code !== '') {
		callingCode = liveLocationInfo.location.calling_code.startsWith("+") ? liveLocationInfo.location.calling_code : '+' + liveLocationInfo.location.calling_code;
		setCountry(callingCode, liveLocationInfo.country_name, where);
	}
	else {
		setCountry("+91", "India", where);
	}

	function setCountry(code, name, where) {
		jQuery(where).find('option[value="' + code + '"]').remove();
		if (where == '#bookingSummary__country') {
			jQuery(where).prepend('<option value="' + code + '" selected>' + code + '</option>');
		}
		else {
			jQuery(where).prepend('<option value="' + code + '" selected>' + code + ' - ' + name + '</option>');
		}
	}
}

function profileImageShow(input) {
	imgTag = '<img src="' + (window.URL ? URL : webkitURL).createObjectURL(input.files[0]) + '" />';
	jQuery('.form__profile-pic-box__img svg.personIcon').replaceWith(imgTag);
	jQuery('.form__profile-pic-box__img img').replaceWith(imgTag);
	jQuery('.editProfile__photo img').replaceWith(imgTag);

	formData = jQuery('#editProfile').serializeArray();

	files = jQuery('#edit__dp').get(0).files;

	if (files.length > 0) {
		var uploadData = new FormData();

		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			uploadData.append('uploaded_files', file, file.name);
		}

		//Also append the user id to the form data
		uploadData.append('data', manageUserProfile('read', 'userId'));

		//This is the Console Log Function to log images
		for (var key of uploadData.entries()) {
			console.log(key[0] + ', ' + key[1]);
		}

		jsUpload('editDP', uploadData);
	}


}

function profileImageChange(input) {
	imgTag = '<img src="' + (window.URL ? URL : webkitURL).createObjectURL(input.files[0]) + '" />';
	jQuery('.profile__photo img').replaceWith(imgTag);
	var files = jQuery('#edit__pic').get(0).files;
	console.log(files);
	if (files.length > 0) {
		var uploadData = new FormData();
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			uploadData.append('uploaded_files', file, file.name);
		}
		//Also append the user id to the form data
		uploadData.append('data', manageUserProfile('read', 'userId'));
		//This is the Console Log Function to log images
		for (var key of uploadData.entries()) {
			console.log(key[0] + ', ' + key[1]);
		}
		jsUpload('editDP', uploadData, 'profile');
	}
}

function profileCoverShow(input) {
	imgTag = '<img src="' + (window.URL ? URL : webkitURL).createObjectURL(input.files[0]) + '" />';
	//jQuery('#secondary .swiper-slide-active img').replaceWith(imgTag);
	var cover_files = jQuery('#edit__cover').get(0).files;
	var cover = manageUserProfile('read', 'all');

	if (cover_files.length > 0 && cover_files.length <= (10 - cover.coverPhotos.length)) {
		var cover_uploadData = new FormData();

		for (var i = 0; i < cover_files.length; i++) {
			var cover_file = cover_files[i];
			cover_uploadData.append('uploaded_files', cover_file, cover_file.name);
			//Also append the user id to the form data
			cover_uploadData.append('data', manageUserProfile('read', 'userId'));

			//This is the Console Log Function to log images
			for (var key of cover_uploadData.entries()) {
				console.log(key[0] + ', ' + key[1]);
			}

			jsUpload('coverUpload', cover_uploadData);
		}

	}
	else {
		toast('Max Limit Reached');
	}
}

function changeBackground(input) {
	var div = input.parentNode;

	//Limit to 3
	if (jQuery('.editProfile-service__type .checkbox-item.service_type-selected').length >= 3 && !jQuery(div.parentNode).hasClass('service_type-selected')) {
		toast('You can select up to 3 services');
		return;
	}
	else {
		div.parentNode.classList.toggle("service_type-selected");
	}
}

function changeExpertise(input) {
	var div = input.parentNode;
	div.parentNode.classList.toggle("service_type-selected");
}


//Get User Lat & Long
function getLocation(state, where) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	}
	else {
		console.log("Geolocation is not supported by this browser.");
	}

	function showPosition(position) {
		lat = position.coords.latitude;
		long = position.coords.longitude;

		if (state == 'show') {
			if (where == 'onboarding') {
				jQuery('#onboarding__latitude').val(lat);
				jQuery('#onboarding__longitude').val(long);
			}
			else if (where == 'console') {
				jQuery('#console__latitude').val(lat);
				jQuery('#console__longitude').val(long);
			}
		}

		return response;
	}
}

async function getLocationFromIPAPI() {
	isReqSuccessFul = false;
	function formatResp(resp) {
		newResp = {};
		newResp.ip = resp.ip;
		newResp.latitude = resp.latitude;
		newResp.longitude = resp.longitude;
		newResp.city = resp.city;
		newResp.currency = {};
		newResp.currency.code = resp.currency;
		newResp.location = {};
		newResp.location.calling_code = resp.country_calling_code;
		newResp.country_name = resp.country_name;
		return newResp;
	}
	jQuery.ajax({
		url: 'https://ipapi.co/json/',
		type: 'GET',
		async: false,
		success: function (response) {
			isReqSuccessFul = true;
			updatedResp = formatResp(response);
			localStorage.setItem('clientsIP', updatedResp.ip);
			localStorage.setItem('userLat', updatedResp.latitude);
			localStorage.setItem('userLong', updatedResp.longitude);
			localStorage.setItem('liveLocationInfo', JSON.stringify(updatedResp));
		},
		error: function (error) {
			console.log(error);
		}
	});
	if (!isReqSuccessFul) {
		getLocationFromIPAPI()
	} else {
		return;
	}
}

async function getLiveLocationDetails() {

	/*if (false) {
		getLocationFromIPAPI();
	}
	else {
		clientsIP = localStorage.getItem('clientsIP');
		isLocalHost = false;
		if (!clientsIP || clientsIP == 'undefined') {
			clientsIP = '1';
			if (window.location.href.includes('localhost')) {
				jQuery.ajax({
					url: 'https://ipapi.co/json/',
					type: 'GET',
					async: false,
					success: function (response) {
						clientsIP = response.ip;
						isLocalHost = true;
					},
					error: function (error) {
						console.log(error);
					}
				});
			}
		}

		await jQuery.ajax({
			url: API_URL + '/live-location-details',
			type: 'POST',
			async: false,
			data: {
				ipAddress: clientsIP,
				//ipAddress: '1.1.1.1',
				isLocalHost: isLocalHost
			},
			success: function (response) {

				if (response.responseCode == 200 && !response.isSameIP) {
					if (response.liveLocationDetails && response.liveLocationDetails.ip) {
						localStorage.setItem('clientsIP', response.liveLocationDetails.ip);
						localStorage.setItem('userLat', response.liveLocationDetails.latitude);
						localStorage.setItem('userLong', response.liveLocationDetails.longitude);
						localStorage.setItem('liveLocationInfo', JSON.stringify(response.liveLocationDetails));
					}else{
						//getLocationFromIPAPI();
					}
				}
			},
			error: function (error) {
				console.log(error);
			}
		});
	}*/
	var response = await fetch('https://beatravelbuddy.com/live-location-details-new', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				//ipAddress: 'optional-ip-to-check'
			})
		});
	  
	var data = await response.json();
	console.log(data);
	if (data.responseCode == 200) {
		if (data.liveLocationDetails && data.liveLocationDetails.ip) {
			localStorage.setItem('clientsIP', data.liveLocationDetails.ip);
			localStorage.setItem('userLat', data.liveLocationDetails.latitude);
			localStorage.setItem('userLong', data.liveLocationDetails.longitude);
			localStorage.setItem('liveLocationInfo', JSON.stringify(data.liveLocationDetails));
		}
	}

	
}

//Get City from user IP Address
async function getCity() {
	response = '';
	liveLocationInfo = localStorage.getItem('liveLocationInfo');
	if (liveLocationInfo) {
		liveLocationInfo = JSON.parse(liveLocationInfo);
		response = liveLocationInfo.city;
	}

	/*
	try {

		await jQuery.getJSON('https://ipapi.co/json/', async function (data) {
			if (data.city !== null) {
				response = await data.city;
			}
		});
	}
	catch (error) { }*/

	return response;
}

//This function is used to manage login from apps, it will use the same jSinit function for google and facebook login but this will be used to process all the info coming from either of the apps.
function manageLoginfromApps(data) {
	console.log(data);
	payload = '';

	if (isAndroid()) {
		data = JSON.parse(data);
		console.log(data);
	}

	data.profileImage = (data.profileImage == 'profileImage') ? 'https://beatravelbuddy.com/view/assets/img/chat__person.png' : data.profileImage;

	if (data.loginType == 'Google') {
		payload = { name: data.fullName, email: data.email, deviceId: data.deviceId, deviceType: data.source.toLowerCase(), googleId: data.userId, redirectedFromGuest: false, googleToken: data.token, vendorUUID: data.vendorUUID, deviceUniqueId: data.vendorUUID, appVersion: appVersion, imageUrl: data.profileImage }
	}
	else if (data.loginType == 'Facebook') {
		payload = { name: data.name, email: data.email, deviceId: data.deviceId, deviceType: data.source.toLowerCase(), deviceUniqueId: data.vendorUUID, imageUrl: data.picture.url, facebookId: data.id, facebookToken: data.token, vendorUUID: data.vendorUUID, appVersion: appVersion }
	}
	else if (data.loginType == 'Apple') {
		payload = {
			name: data.fullName, email: data.email, deviceId: data.deviceId, deviceType: data.source.toLowerCase(), deviceUniqueId: data.vendorUUID, imageUrl: "", appleId: data.userId, appleToken: data.token, vendorUUID: data.vendorUUID, appVersion: appVersion
		}
	}

	console.log(payload);

	if (payload != '') {
		if (data.loginType == 'Google') {
			jsInit('loginGoogle', payload);
		}
		else if (data.loginType == 'Facebook') {
			jsInit('loginFacebook', payload);
		}
		else if (data.loginType == 'Apple') {
			jsInit('loginApple', payload);
		}
	}
}

//Manage Push Notifications from Apps
function notificationMaster(data) {
	if (data == null || data == undefined) {
		return;
	}
	console.log('NF', data);
	console.log('Type Of Data', typeof data);
	// if ((guestMaster() && (isAndroid() || isIOS()))) {
	// 	toast('Please login or register to Check the Notification !');
	// 	return;
	// }
	
	if (jQuery('.traveller-details-review__overlay').length > 0) {
		jQuery('.traveller-details-review__overlay').click();
	}

	if (!isIOS()) {
	
		// ...existing code...

		function escapeNestedJSON(jsonString) {
			return jsonString.replace(/"id":"({[^}]*})"/, function (match, p1) {
				return '"id":"' + p1.replace(/"/g, '\\"') + '"';
			});
		}

		// Escape the nested JSON string
		let escapedData;
		if (typeof data != 'object') {
			escapedData = escapeNestedJSON(data);
			// Parse the escaped JSON string
			let parsedData = JSON.parse(escapedData);			// Extract the nested JSON from the "id" field
			data = JSON.parse(parsedData["id"].replace(/\\"/g, '"'));
		}
		else {
			data = data.nameValuePairs;
		}
	}
	else {
		let parsedData = JSON.parse(data.id);
		data = parsedData;
	}
	
	console.log('Data after parsing', data);

	//jQuery('#main__homepage-box').hide();

	// Like Post
	if (data.type == 'like') {
		redirect('post', data.id);
	}
	else if (data.type == 'comment') {
		redirect('post', data.id);
		//Click Comment Text
		setTimeout(function () {
			jQuery('.feed-comment').click();
			console.log('open comments');
		}, 2000);

	}
	else if (data.type == 'reply') {
		redirect('post', data.id);
		//Click Comment Text and probably the click the comment from comment id
		setTimeout(function () {
			jQuery('.feed-comment').click();
			console.log('open comments then reply');
		}, 800);
	}
	else if (data.type == 'follow') {
		redirect('profile', data.id);
	}
	else if (data.type == 'rate') {
		redirect('profile', data.id);
		// Click Rate now Div
		setTimeout(function () {
			jQuery('.profile__rating-open').click();
			console.log('open rate');
		}, 1000);

	}
	else if (data.type == 'message') {
		// Chats
	}
	else if (data.type == 'engagementFind') {
		jQuery('#footer ul li[data-item="addPost"]').click();
	}
	else if (data.type == 'engagementShare') {
		jQuery('#footer ul li[data-item="addPost"]').click();
		jQuery('.addPost__tab-item[data-id="share"]').click();
	}
	else if (data.type == 'engagementAsk') {
		jQuery('#footer ul li[data-item="addPost"]').click();
		jQuery('.addPost__tab-item[data-id="ask"]').click();
	}
	else if (data.type == 'expressInterest') {
		// When anyone expresses interest on a Listing open Leads
	}
	else if (data.type == 'managelisting') {
		// Open
	}
	else if (data.type == 'splfb') {
		// Service Provider looking for buddy
	}
	else if (data.type == 'chat' || data.type == 'group_chat') {
		// var currentUrl = window.location.href;
		// if (currentUrl.includes('localhost')) {
		// 	window.open('http://localhost:3000/newChat', '_self');
		// }
		// else if (currentUrl.includes('dev.beatravelbuddy.com')) {
		// 	window.open('https://dev.beatravelbuddy.com/newChat', '_self');
		// }
		// else {
		// 	window.open('https://beatravelbuddy.com/newChat', '_self');
		// }
		openNewChat('notification=true');
		// setTimeout(function () {
		// 	jQuery('#main__chat-box .css-1n2mv2k .css-btd4on .chats__container .chat__item').each(function () {
		// 		if (jQuery(this).attr('data-chat-user') == data.userId) {
		// 			jQuery(this).click();
		// 		}
		// 	});
		// }, 1000);
	}
	/*else if (data.type == 'group_chat') {
		jQuery('.head__chat').click();
		// setTimeout(function () {
		// 	jQuery('#main__chat-box .css-1n2mv2k .css-btd4on .chats__container .chat__item').each(function () {
		// 		if ((jQuery(this).attr('data-chat-id') == data.groupId) && jQuery(this).attr('data-chat-type') == 'group') {
		// 			jQuery(this).click();
		// 		}
		// 	});
		// }, 1000);
	}*/
	else if (data.type == 'premium') {
		redirect('premium');
	}
	else if (data.type == 'singleExperience') {
		let expData = {
			id: data.id
		}
		redirect('singleExperience', expData);
	}
	else if (data.type == 'aibuddy') {
		manageSecondary('show', 'ai_itinerary');
		jQuery('.desktopMenu-aiBuddy').addClass('active');
	}
	else if (data.type == 'aichat') {
		if (guestMaster()) {
			redirect('login');
			return;
		}
		queryString = 'AI=' + encodeURIComponent('true');
		console.log("Query String: ", queryString);
		openNewChat('AI=' + queryString);
		fbEvent('AI_LP');
	}
	else if (data.type == 'flights') {
		jQuery('#footer ul li[data-item="experiences"] svg').click();
	}
	else if (data.type == 'search') {
		jQuery('div#footer ul li[data-item="feed"] svg').click();
		jQuery('.head__search').click();
	}
	else if (data.type == 'packages' || data.type == 'groupTrips') {
		var groupTripId = data.id;
		jsInit('getExperiences', { filter: { experienceId: groupTripId } }, 'newSingleDataRender');
	}
	loaderMain('global', false);

}

//Manage Deep Linking from Apps
function deepLinkMaster(url) {
	if (url == null || url == undefined) {
		return;
	}
	console.log('Original' + url);
	//loaderMain('global', true);
	// We Need to wait for the Entire page to load before we can process the deep link, but we need to re-think this logic
	if (document.readyState !== 'complete') {
		window.onload = function () {
			deepLinkMaster(url);
			loaderMain('global', false);
		};
		return;
	}
	var mainOverlay = jQuery('.traveller-details-review__overlay');
	var overlayClass = mainOverlay.hasClass('overlay-login');
	if (mainOverlay.length > 0 && !overlayClass) {
		mainOverlay.click();
	}

	/*if ((guestMaster() && (isAndroid() || isIOS()))) {
		toast('Please login or register to continue !');
		return;
	}*/

	url = processUrl(url);
	//jQuery('#main__homepage-box').hide();
	if (url['t']) {

		if (url['t'].includes('postid')) {
			postId = (url['t']) ? url['t'].split('-')[1] : null;

			redirect('post', postId);
		}
		/*else if (url['t'].includes('homePage')) {
			if (window.location.href.includes('homePage')) {
				loaderMain('global', false);
				return;
			}
			else {
				initRender('homePage');
			}
		}*/
	
		else if (url['t'].includes('groupTrips')) {
			initRender('groupTrips');
		}

		else if (url['t'].includes('enquiryForm')) {
			renderPermissionBox('init', 'leadForm');
		}

		else if (url['t'].includes('profileid')) {
			profileId = (url['t']) ? url['t'].split('-')[1] : null;
			redirect('profile', profileId);
		}
		else if (url['t'].includes('serviceid')) {
			serviceId = (url['t']) ? url['t'].split('-')[1] : null;
			console.log(serviceId);
			setTimeout(function () {
				redirect('singleService', serviceId);
			}, 1000);
		}
		else if (url['t'].includes('experienceid')) {
			experienceId = (url['t']) ? url['t'].split('-')[1] : null;
			console.log(experienceId);

			setTimeout(function () {
				redirect('singleExperience', { id: experienceId, title: '', url: '' });
			}, 2000);
		}
		else if (url['t'].includes('feedid')) {
			feedId = (url['t']) ? url['t'].split('-')[1] : null;
			if (feedId == 'share') {
				console.log(feedId);
				//Open AddPost
				jQuery('div#footer ul li[data-item="feed"] svg').click();
				jQuery('#footer ul li[data-item="addPost"]').click();
				jQuery('.addPost__tab-item[data-id="share"]').click();
			}
			else if (feedId == 'find') {
				console.log(feedId);
				//Open Find
				jQuery('div#footer ul li[data-item="feed"] svg').click();
				jQuery('#footer ul li[data-item="addPost"]').click();
			
			}
			else {
				console.log(feedId);
				//Open Ask
				jQuery('#footer ul li[data-item="addPost"]').click();
				jQuery('.addPost__tab-item[data-id="ask"]').click();
			}

		}
		else if (url['t'].includes('locationid')) {
			locationId = (url['t']) ? url['t'].split('-')[1] : null;
			console.log(locationId);
			redirect('location', locationId);
		}
		else if (url['t'].includes('bookmark')) {
		
			redirect('bucketList', 'bucketList');
		}
		else if (url['t'].includes('rateus')) {
		

		}
		else if (url['t'].includes('travelshots')) {
		
			jQuery('div#footer ul li[data-item="feed"] svg').click();
			jQuery('#tb__reels').click();

		}
		else if (url['t'].includes('filter')) {
		

		}
		else if (url['t'].includes('search')) {
		
			jQuery('div#footer ul li[data-item="feed"] svg').click();
			jQuery('div#footer ul li[data-item="search"]').click();

		}
		else if (url['t'].includes('premium')) {
			jQuery('#main__homepage-box').hide();
			redirect('premium');
		}
		else if (url['t'].includes('trending')) {
			jQuery('div#footer ul li[data-item="feed"] svg').click();
			jQuery('#main__tabs li[data-tab="trending"] a').click();
		}
		else if (url['t'].includes('meetups')) {
			jQuery('div#footer ul li[data-item="feed"] svg').click();
			jQuery('#main__tabs li[data-tab="meetups"] a').click();

		}
		else if (url['t'].includes('services')) {
			jQuery('#main__tabs li[data-tab="services"] a').click();
			jQuery('#main__tabs').scrollLeft(100); // Scroll to the right by 300px

		}
		else if (url['t'].includes('influencers')) {
			jQuery('div#footer ul li[data-item="feed"] svg').click();
			jQuery('#main__tabs li[data-tab="influencers"] a').click();
			jQuery('#main__tabs').scrollLeft(300); // Scroll to the right by 300px

		}
		else if (url['t'].includes('followig')) { // Spelling error while creation of deep link. lol
			jQuery('div#footer ul li[data-item="feed"] svg').click();
			jQuery('#main__tabs li[data-tab="following"] a').click();
			jQuery('#main__tabs').scrollLeft(300); // Scroll to the right by 300px
		}
		else if (url['t'].includes('local')) {
		
			jQuery('div#footer ul li[data-item="feed"] svg').click();
			jQuery('#main__tabs li[data-tab="local"] a').click();
			jQuery('#main__tabs').scrollLeft(300); // Scroll to the right by 300px

		}
		else if (url['t'].includes('contests')) {
		
			jQuery('div#footer ul li[data-item="feed"] svg').click();
			jQuery('#main__tabs li[data-tab="contests"] a').click();
			jQuery('#main__tabs').scrollLeft(300); // Scroll to the right by 300px

		}
		else if (url['t'].includes('skyscanner')) {
		
			jQuery('.head__skyScanner').click();

		}
		else if (url['t'].includes('exp-page')) {
			console.log(url['t']);
			jQuery('div#footer ul li[data-item="experiences"] svg').click();
		}
		else if (url['t'].includes('home')) {
			console.log(url['t']);
			jQuery('div#footer ul li[data-item="feed"] svg').click();
		}
		else if (url['t'].includes('hashtag')) {
			hash = '#';
			hashtagId = (url['t']) ? url['t'].split('-')[1] : null;
		
			redirect('hashtag', hash + hashtagId);
		}
		else if (url['t'].includes('chat-page')) {
		
			jQuery('.head__chat').click();
		}
		else if (url['t'].includes('travel-flight')) {
			console.log(url['t']);
			jQuery('div#footer ul li[data-item="flightHotels"] svg').click();
			jQuery('div.single__marketplace-tab[data-tab="flights"]').click();
		}

		else if (url['t'].includes('experiencecategoryid')) {
			console.log(url['t']);
			experienceCategoryId = (url['t']) ? url['t'].split('-')[1] : null;
			openExperienceCategory(experienceCategoryId);
		}
		else if (url['t'].includes('home')) {
			console.log(url['t']);
			jQuery('div#footer ul li[data-item="feed"] svg').click();
		}
		else if (url['t'].includes('groupid')) {
			let callAddToGroup = '';

			groupId = (url['t']) ? url['t'].split('-')[1] : null;
			groupName = (url['t']) ? url['t'].split('-')[2] : null;
			groupName = groupName.replace(/\+/g, " ");
			chatList = JSON.parse(localStorage.getItem('chatList'));
			finalChat = '';
        
			if (groupId == '3a5d73518fbf4e949eee7f96d633d744') {
				jQuery('div#footer ul li[data-item="feed"] svg').click();
				return;
			}

			chatList.forEach(chat => {
				console.log(JSON.stringify(chat));
				if (chat.id == groupId) {
					finalChat = chat;
				}
			});
			// Code to Read the entire array in finalChat where array name is members and each index has an object
			if (finalChat != '') {
				finalChat.members.forEach(member => {
					if (member.uId == localStorage.getItem('plainUserId') && (member.isRemoved !== undefined && !member.isRemoved) || (member.isExited !== undefined && !member.isExited)) {
						callAddToGroup = false;
						toast('You are already part of the group - ' + groupName);
						return;
					}
					else if (member.uId == localStorage.getItem('plainUserId') && (member.isRemoved || member.isExited)) {
						callAddToGroup = true;
					}
				});
			}
			else {
				callAddToGroup = true;
			}
			if (callAddToGroup) {
				groupCreatedBy = (url['t']) ? url['t'].split('-')[3] : null;
				groupCreatedBy = groupCreatedBy.replace(/\+/g, " ");
				groupProfileUrl = (url['t']) ? url['t'].split('-')[4] : null;
				senderId = (url['t']) ? url['t'].split('-')[5] : null;

				data = { groupId: groupId, userId: localStorage.getItem('plainUserId'), createdBy: groupCreatedBy, groupLastMessage: "", senderId: senderId, groupName: groupName, groupProfileUrl: groupProfileUrl, lastMessageSenderName: "", isDeleted: false, chatType: "group" }

				renderPermissionBox('init', 'addUsersToGroup', data);
			}
			else {
				toast('You are already part of the group - ' + groupName);
			}
		}
		else if (url['t'].includes('tripid')) {
			tripId = (url['t']) ? url['t'].split('-')[1] : null;
			jsInit('getItinerary', { 'itineraryId': tripId });
		}
		else if (url['t'].includes('aiBuddy')) {
			manageSecondary('show', 'ai_itinerary');
		}
		else if (url['t'].includes('findbuddy')) {
			redirect('lfb');
		}
	}
	else if (url['AI'].includes('AI')) { 
		queryString = 'AI=' + encodeURIComponent('true');
		console.log("Query String: ", queryString);
		openNewChat('AI=' + queryString);
		fbEvent('AI_LP');
		
	}	

	console.log('Processed' + url);




	function processUrl(url) {
		//Parse the url to get the query parameters
		url = url.split('?');
		url = url[1];
		url = url.split('&');

		//Create an object to store the query parameters
		query = {};

		//Loop through the query parameters and store them in the object
		for (i = 0; i < url.length; i++) {
			query[url[i].split('=')[0]] = url[i].split('=')[1];
		}

		console.log(query);
		return query;
	}
	loaderMain('global', false);
}



//Create a deep link
function createDeepLink(what, id, imageUrl, copy, getLink, linkText) {
	// Initialize Branch with the app key from config
	if (window.BRANCH_CONFIG) {
		if (!window.BRANCH_INITIALIZED) {
			branch.init(window.BRANCH_CONFIG.appKey);
			window.BRANCH_INITIALIZED = true;
		}
	} else {
		console.warn('Branch.io app key not configured. Please update branch-config.js with your actual app key.');
	}
	console.log(what, id, imageUrl, getLink, linkText, copy);
	link = '';

	if (what == 'share' || what == 'story' || what == 'post') {
		linkText = 'Hey, I found a great travel post on Travel Buddy. Post -';
	}
	else if (what == 'find' || what == 'find_buddy') {
		linkText = 'Hey, I found someone looking for like minded travellers on travel buddy. Post- ';
	}
	else if (what == 'meetup') {
		linkText = 'Hey, I found a meetup on Travel Buddy. See if you can join! - ';
	}
	else if (what == 'ask') {
		linkText = 'Hey someone has a query about a destination on Travel Buddy. See if you can help!- ';
	}
	else if (what == 'profile' || what == 'shareProfile') {
		linkText = 'Hey there, Found an interesting profile here -';
		link = "link=https://beatravelbuddy.com/detect.php?t=profileid-" + id;
	}
	else if (what == 'service') {
		linkText = 'Hey there, I am a service provider, please checkout my listing here -';
		link = "link=https://beatravelbuddy.com/detect.php?t=serviceid-" + id;
	}
	else if (what == 'experiences' || what == 'experience') {
		linkText = 'Hey there, Found an interesting experience on Travel Buddy. Check it out, here- ';
		link = "link=https://beatravelbuddy.com/detect.php?t=experienceid-" + id;
	}
	else if (what == 'group') {
		link = id;
	}
	else if (what == 'aiIti') {
        link = "link=https://beatravelbuddy.com/detect.php?t=tripid-" + id;
    }

	if (what == 'meetup' || what == 'find' || what == 'ask' || what == 'share' || what == 'story' || what == 'find_buddy') {
		link = "link=https://beatravelbuddy.com/detect.php?t=postid-" + id;
	}

	shareLinkText = "https://link.beatravelbuddy.com/?" + link +
		"&apn=" + "com.beatravelbuddy.travelbuddy" +
		"&ibn=" + "com.beatravelbuddy.travelbuddy" +
		"&st=" + "TravelBuddy" +
		"&sd=" + linkText +
		"&si=" + imageUrl;

	console.log(shareLinkText);

	if (getLink) {
		response = {
			link: shareLinkText,
			text: linkText
		}

		return response;
	}
	else if (copy) {
		//copyToClipboard(shareLinkText);
		toast('Link Copied');
	}
	else {
		if (isAndroid()) {
			Android.createDeepLink(shareLinkText);
		}
		else if (isIOS()) {
			url = {
				deeplink: shareLinkText,
				message: linkText,
				imageUrl: imageUrl,
				mainUrl: link.replace('link=', '')
			}
			window.webkit.messageHandlers.createDeepLink.postMessage(url);
		}
	}
}


//Invoke the native share
function invokeNativeShare(image, text) {
	if (isIOS()) {
		toShare = {
			imageUrl: image,
			text: text
		}

		window.webkit.messageHandlers.invokeShare.postMessage(toShare);
	}
	else if (!isAndroid()) {
		console.log(text);
		Android.createDeepLink(text);
	}
}

//Create iOS product IDs
function createIOSProductIds() {
	if (isIOS()) {
		productIds = [
			"com.beatravelbuddy.travelbuddy.tbpro",
			"com.beatravelbuddy.travelbuddy.tbsuper",
			"com.beatravelbuddy.travelbuddy.tbmini",
			"com.beatravelbuddy.travelbuddy.monthly_plus1",
			"com.beatravelbuddy.travelbuddy.halfyearly",
			"com.beatravelbuddy.travelbuddy.yearly",
			"com.beatravelbuddy.travelbuddy.weekly"
		]

		window.webkit.messageHandlers.createProductIds.postMessage(productIds);
	}
}

//Android and iOS App has been woken up
function wakeApp(data) {
	if (isIOS()) {
		console.log('Waking iOS App');
		console.log(data);
	}
	else if (isAndroid()) {
		console.log('Waking Android App');
		console.log(data);
	}
}

//Android and iOS App has gone to sleep
function sleepApp(data) {
	if (isIOS()) {
		console.log('Sleeping iOS App');
		console.log(data);
	}
	else if (isAndroid()) {
		console.log('Sleeping Android App');
		console.log(data);
	}

	//Function to pause all videos
	pauseAllVideos();

	function pauseAllVideos() {
		jQuery('video').each(function () {
			jQuery(this).get(0).pause();
		});
	}
}

//Fetch OS preferences for light or dark mode
async function getOSPreferences() {
	if (isIOS()) {
		mode = await window.webkit.messageHandlers.getOSPreferences.postMessage('getOSPreferences');
	}
	else if (isAndroid()) {
		mode = await Android.getOSPreferences();
	}

	console.log(mode);
	return mode;
}

//Check if the device is a desktop or laptop
function isDesktop() {
	return (window.innerWidth > 768);
}

//Get lat & long from local storage
function getLatLongfromStorage() {
	response = [];

	if (localStorage.getItem('userLat') !== null && localStorage.getItem('userLong') !== null) {
		response['latitude'] = localStorage.getItem('userLat');
		response['longitude'] = localStorage.getItem('userLong');
	}
	else {
		response['latitude'] = 0;
		response['longitude'] = 0;
	}

	return response;
}

function getCountry(separateUrls) {
	reponse = '';
	liveLocationInfo = localStorage.getItem('liveLocationInfo');
	if (liveLocationInfo) {
		liveLocationInfo = JSON.parse(liveLocationInfo);
		if (liveLocationInfo.currency_code) {
			jsInit('getPremiumPricingList', { 'currencyCode': liveLocationInfo.currency_code }, separateUrls);
		} else {
			jsInit('getPremiumPricingList', { 'currencyCode': "INR" }, separateUrls);
		}
	}
	else {
		jsInit('getPremiumPricingList', { 'currencyCode': "INR" }, separateUrls);
	}

	/*jQuery.getJSON('https://ipapi.co/json/', false, function (data) {
		if (data.country_name !== null) {
			currency = data.currency;
			jsInit('getPremiumPricingList', { 'currencyCode': currency });
		} else {
			loaderMain('global', false);
			toast('No details found for your country. Please contact admin.');
		}
	}).done(function(data){
	}).fail(function(){
		loaderMain('global', false);
		//In the case of failure we are loading default values as mentioned below.
		defaultPrices = {priceLists: {"Country":"India ","Currency":"INR","One Month":"499.00","Three Month":"950.00","One Year":"2999.00"}};
		renderPremium('renderMain',defaultPrices, '');
		//toast('Error occurred while fetching user location. Please try again later.', 10000);
	});*/
}

//Get lat & long from user IP Address
function getLatLongfromIp() {
	response = [];

	liveLocationInfo = localStorage.getItem('liveLocationInfo');
	if (liveLocationInfo) {
		liveLocationInfo = JSON.parse(liveLocationInfo);
		localStorage.setItem('userLat', liveLocationInfo.latitude);
		localStorage.setItem('userLong', liveLocationInfo.longitude);
		response['latitude'] = liveLocationInfo.latitude;
		response['longitude'] = liveLocationInfo.longitude;
	}

	/*
	//Chcek if userLatLongTime is set and not older than 2 days
	if (localStorage.getItem('userLatLongTime') !== null && (new Date().getTime() - localStorage.getItem('userLatLongTime')) > 172800000) {
		//Remove lat & long from local storage & recall the function
		localStorage.removeItem('userLat');
		localStorage.removeItem('userLong');
		localStorage.removeItem('userLatLongTime');
	}
	else if (localStorage.getItem('userLat') == null && localStorage.getItem('userLong') == null) {
		jQuery.getJSON('https://ipapi.co/json/', function (data) {
			if (data.latitude !== null) {
				response['latitude'] = data.latitude;
				response['longitude'] = data.longitude;

				//Store lat & long in local storage
				localStorage.setItem('userLat', data.latitude);
				localStorage.setItem('userLong', data.longitude);
				localStorage.setItem('userLatLongTime', new Date().getTime());
			}
		});
	}*/

	return response;
}

function passwordStrengthControl() {
	function passwordCheck(password) {
		if (password.length >= 8)
			strength += 1;

		if (password.match(/(?=.*[0-9])/))
			strength += 1;

		if (password.match(/(?=.*[!,%,&,@,#,$,^,*,?,_,~,<,>,])/))
			strength += 1;

		if (password.match(/(?=.*[a-z])/))
			strength += 1;

		if (password.match(/(?=.*[A-Z])/))
			strength += 1;

		displayBar(strength);
	}

	function displayBar(strength) {
		switch (strength) {
			case 1:
				jQuery("#password-strength span").css({
					"width": "20%",
					"background": "#d91e18"
				});
				break;

			case 2:
				jQuery("#password-strength span").css({
					"width": "40%",
					"background": "#d91e18"
				});
				break;

			case 3:
				jQuery("#password-strength span").css({
					"width": "60%",
					"background": "#d91e18"
				});
				break;

			case 4:
				jQuery("#password-strength span").css({
					"width": "80%",
					"background": "#f15a22"
				});
				break;

			case 5:
				jQuery("#password-strength span").css({
					"width": "100%",
					"background": "#16a085"
				});
				break;

			default:
				jQuery("#password-strength span").css({
					"width": "0",
					"background": "#d91e18"
				});
		}

		jQuery("#passStrength").val(strength);
	}

	jQuery("[data-strength]").after('<div id="password-strength" class="strength"><span></span><input type="hidden" id="passStrength"></div>');

	jQuery("[data-strength]").focus(function () {
		jQuery("#password-strength").css({
			"height": "7px"
		});
	}).blur(function () {
		jQuery("#password-strength").css({
			"height": "0px"
		});
	});

	jQuery(document).on('keyup', '[data-strength]', function () {
		strength = 0;
		var password = jQuery(this).val();
		passwordCheck(password);
	});
}


//Function to manage User chat
function manageUserChat(state, data, what) {
	response = '';

	if (state == 'initializeNode') {
		if (!guestMaster('noLogin')) {
			//Setup the chat list in local storage
			if (localStorage.getItem('chatList') == null) {
				Arr = [];
				localStorage.setItem('chatList', JSON.stringify(Arr));
			}
			jsInit('setUserNode', { displayName: manageUserProfile('read', 'name'), email: manageUserProfile('read', 'email'), profilePic: manageUserProfile('read', 'profilePic'), role: 'user', uid: manageUserProfile('read', 'userId'), isOnline: true });
			console.log('initializeNode');
		}
	}
	else if (state == 'checkMemberInGroup') {
		chatId = data.chatId;
		members = data.members;
		finalChat = '';
		isGroupMember = false;

		chatList = JSON.parse(localStorage.getItem('chatList'));

		chatList.forEach(chat => {
			if (chat.id == chatId) {
				finalChat = chat;
			}
		});

		//Check if the user is a member of the group
		if (finalChat) {
			finalChat.members.forEach(finalChatMember => {
				members.forEach(member => {
					if (Number(member.uid) == Number(finalChatMember.uid)) {
						isGroupMember = true;
					}
				});
			});
		}

		//If the user is not a member of the group, then fetch the groupMembers from the server
		if (!isGroupMember) {
			jsInit('fetchGroupMembers', { groupId: chatId, fetchAll: true });
		}
	}
	else if (state == 'addToGroup') {
		if (what == 'addUsersToGroupLater') {
			//Back to the chats page
			jQuery('.css-k008qs span svg').click();

			setTimeout(function () {
				//Open the group chat
				jQuery('.chat__item-' + jQuery('.singleChat__container').attr('data-chat-id')).click();
			}, 100);
		}

		//At times when creating a new group, the group members returned was only 1, so we will retry upto 5 times to fetch all the group members.
		if (data.groupMembers.length < 2) {
			(localStorage.getItem('fetchChatRetry')) ? localStorage.setItem('fetchChatRetry', Number(localStorage.getItem('fetchChatRetry')) + 1) : localStorage.setItem('fetchChatRetry', 1);

			if (Number(localStorage.getItem('fetchChatRetry')) < 5) {
				jsInit('fetchGroupMembers', { groupId: data.chatId, fetchAll: true });
				return false;
			}
			else {
				localStorage.removeItem('fetchChatRetry');
			}
		}
		else {
			localStorage.removeItem('fetchChatRetry');
		}

		what = (what) ? what : 'Single';
		chatList = JSON.parse(localStorage.getItem('chatList'));
		chatId = data.chatId;
		finalChat = '';

		chatList.forEach(chat => {
			if (chat.id == chatId) {
				finalChat = chat;
			}
		});


		if (!finalChat) {
			//Add the chat to the chat list
			Arr = {
				id: chatId,
				members: data.groupMembers,
			}

			chatList.push(Arr);
		}
		else {
			finalChat.members = data.groupMembers;

			//Replace the final chat in the chat list
			chatList.forEach(chat => {
				if (chat.id == chatId) {
					chat = finalChat;
				}
			});
		}

		//Update the chat list in local storage
		localStorage.setItem('chatList', JSON.stringify(chatList));
	}
	else if (state == 'removeMemberFromGroup') {
		console.log(data);
		userId = data.userId;
		chatId = data.groupId;
		finalChat = '';
		chatList = JSON.parse(localStorage.getItem('chatList'));

		chatList.forEach(chat => {
			if (chat.id == chatId) {
				finalChat = chat;
			}
		});

		console.log(finalChat, data);
		if (finalChat) {
			finalChat.members.forEach(member => {
				if (Number(member.uid) == Number(userId)) {
					//finalChat.members.splice(finalChat.members.indexOf(member), 1);
					member.isRemoved = true;
					member.removedOn = new Date().getTime() / 1000;
				}
			});
		}

		//Replace the final chat in the chat list
		chatList.forEach(chat => {
			if (chat.id == chatId) {
				chat = finalChat;
			}
		});

		//Update the chat list in local storage
		localStorage.setItem('chatList', JSON.stringify(chatList));
	}
	else if (state == 'read') {
		what = (what) ? what : 'Single';
		chatList = JSON.parse(localStorage.getItem('chatList'));
		chatId = data.chatId;
		userId = data.userId;
		finalChat = '';

		chatList.forEach(chat => {
			if (chat.id == chatId) {
				finalChat = chat;
			}
		});

		if (what == 'Single') {
			if (finalChat.members && finalChat.members.length > 0) {
				finalChat.members.forEach(member => {
					if (!response) {
						if (Number(member.uid) == Number(userId)) {
							response = {
								name: member.userInfo.displayName,
								profilePic: member.userInfo.profilePic
							}
						}
					}
				});
			}
		}
		else if (what == 'All') {
			response = finalChat;
		}
	}
	else if (state == 'clean') {
		//Clean the chat list
		localStorage.removeItem('chatList');
	}

	return response;
}


//Make sure the country code has a + in front of it
function manageCountryCode(country_code) {
	if (country_code.charAt(0) != "+") {
		country_code = "+" + country_code;
	}

	return country_code;
}

function removeAllSpecialChar(string) {
	return string.replace(/[^a-zA-Z0-9]/g, '');
}

function refreshFeed(tab) {
	if (!tab) {
		tab = jQuery('#main__tabs .tab__item.active').attr('data-tab');
	}

	jQuery('#main__feed .feed__box.tab__' + tab).html('');
	jQuery('#main__tabs .tab__item[data-tab="' + tab + '"]').attr('data-loaded', false).attr('data-page', 0).removeClass('active').trigger('click');
}

function nodeUrlCheck(url) {
	//Check if the Current page url has /node/ in it
	currentUrl = window.location.href;
	if (currentUrl.indexOf('/node/') > -1) {
		//Add the /node/ to the url
		url = '/node/' + url;
	}

	//Remove // from the url
	url = url.replace(/\/\//g, '/');

	return url;
}

function isMobile() {
	if (jQuery(window).width() <= 768) {
		return true;
	}
	else {
		return false;
	}
}

//check android device or not

// function isAndroid() {
//     //var userAgent = process.env.USER_AGENT.toLowerCase();
//     var isAndroid = /android/i.test(navigator.userAgent);
//     if (isAndroid) {
//         return true;
//     }
//     else {
//         return false;
//     }
// }

//Function to check if device is iOS
function isIOS() {
	if (localStorage.getItem('isIOS') == 'true') {
		// alert('isIOS');
		return true;
	}
	else {
		return false;
	}
}

//Function to check if device is Android
function isAndroid() {
	if (localStorage.getItem('isAndroid') == 'true') {
		return true;
	}
	else {
		return false;
	}
}

function isPwa() {
	if (localStorage.getItem('isPWA') == 'true') {
		return true;
	}
	else {
		return false;
	}
}

function isLocalOrDev() {
    return window.location.href.includes('localhost') || window.location.href.includes('dev.');
}

//Function to check if iOS permissions are granted
function checkIOSPermissions(data) {
	//permissionType's are 'location', 'notification', 'camera', 'photoLibrary', 'microphone'
	if (data.FilePondPluginFilePosterwhat == 'askForPermission') {
		console.log('askForPermission');
		//This will ask for permission and recall the function with permissionStatus
		//window.webkit.messageHandlers.checkPermissionResponse.postMessage({ permissionType: data.type });
		window.webkit.messageHandlers.checkPermission.postMessage({ permissionType: data.type });
	}
	else if (data.what == 'permissionStatus') {
		console.log('permissionStatus');
		console.log(data.type);
		console.log(data.data);
		//
		if (response['status'] == 'denied') {
			response = false;
		}
		else if (response['status'] == 'notDetermined') {
			response = false;
			renderPermissionPopups('init', type);
		}
		else if (response['status'] == 'authorized') {
			response = true;
		}
	}
	else if (data.what == 'locationCoordinates') {
		response = response['locationCoordinates'];
	}

	return response;
}

//Stop the back button from going back
window.addEventListener('popstate', function (event) {
	if (jQuery('.popup__master.active .permissions__box').attr('data-type') == 'underMaintainance') {
		event.preventDefault();
		event.stopPropagation();
		toast('Sorry for the inconvenience, we are under maintainance. Please try again later');
	}
	else {
		console.log('popstate fired!');
		redirect('back');
	}
});

function copyToClipboard(text) {
	window.focus();
	navigator.clipboard.writeText(text);
	toast('Link Copied');
}

// // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
// let vh = window.innerHeight * 0.01;
// // Then we set the value in the --vh custom property to the root of the document
// document.documentElement.style.setProperty('--vh', `${vh}px`);

// // We listen to the resize event
// window.addEventListener('resize', () => {
//     // We execute the same script as before
//     let vh = window.innerHeight * 0.01;
//     document.documentElement.style.setProperty('--vh', `${vh}px`);
// });


function filePondUpload() {
	if (!guestMaster()) {
		useEditorWithJQuery(jQuery, pintura);

		FilePond.registerPlugin(
			FilePondPluginImageEditor,
			FilePondPluginFilePoster,
			FilePondPluginFileValidateType
		);

		const {
			openEditor,
			plugin_trim,
			imageStateToCanvas,
			createDefaultMediaWriter,
			createDefaultVideoWriter,
			createDefaultImageReader,
			createDefaultImageWriter,
			processImage,
			getEditorDefaults,
		} = jQuery.fn.pintura;

		// Turn input element into a pond with configuration option
		jQuery('#share__upload').filepond({
			allowReorder: true,
			dropOnPage: true,
			dropOnElement: false,
			dropValidation: true,
			maxFiles: 10,
			allowReorder: false,
			onprocessfiles: () => {
				console.log('All files processed');
				jQuery('#share__uploading').attr('value', 'ready');
				
				return true;
			},
			onremovefile: (error, file) => {
				removeImage(file);
			},
			onaddfile: (error, file) => {
				if (error) {
					console.error('An error occurred while adding the file:', error);
					return;
				}

				// Check if the file is an image
				if (file.fileType.startsWith('image/')) {
					// Open the image editor
					//file.edit();
					checkInterval = setInterval(() => {
						elements = document.querySelectorAll('.PinturaRectManipulator');
						if (elements.length !== 0) {
							clearInterval(checkInterval);
							jQuery('.PinturaRectManipulator').remove();
						}
					}, 500);
				}
			},
			/*onprocessfile: (error, file) => {
				console.log('File processed', file);
				if (error) {
					console.error('File could not be processed because:', error);
					return;
				}
				// The file has been processed succesfully
				file.upload();
			},*/
			fileValidateTypeDetectType: (source, type) =>
				new Promise((resolve, reject) => {
					if (fileValidation(source)) {
						jQuery('#share__uploading').attr('value', 'uploading');
						//jQuery('.upload__overlay-mobile').hide();
						resolve(type);
					}
					else {
						jQuery('#share__uploading').attr('value', 'ready');
						reject(type);
					}
				}),
			/* Image Editor plugin properties */
			imageEditor: {
				createEditor: openEditor,
				imageReader: [createDefaultImageReader],
				imageWriter: [
					createDefaultImageWriter,
					/*{
						targetSize: {
							width: 384,
						},
					},
					createDefaultVideoWriter({
						// Specific video writer options
						encoder: createMediaStreamEncoder({
							// Required
							imageStateToCanvas,
						}),
					})*/
				],
				imageProcessor: processImage,
				editorOptions: {
					...getEditorDefaults(),
					imageCropAspectRatio: 1,
				}
			},
			storeAsFile: true,
			instantUpload: false,
			allowFileTypeValidation: true,
			acceptedFileTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/mov', 'video/MOV', 'video/MP4', 'video/QUICKTIME', 'video/mkv', 'video/MKV', 'video/quicktime', 'video/MPEG-4', 'video/H.264','video/h264', 'video/HEVC', ''],
			labelFileTypeNotAllowed: 'Only images and videos are allowed',
			labelMaxFileSize: 'File is too big',
			maxFileSize: 50 * 1024 * 1024,
			labelMaxTotalFileSize: 'Maximum total size is 200MB',
			labelMaxTotalFileSizeExceeded: 'Maximum total size exceeded',
			fileValidateTypeLabelExpectedTypes: 'Invalid file format',
			fileValidateTypeLabelExpectedTypesMap: {
				'image/jpeg': '.jpeg',
				'image/jpg': '.jpg',
				'image/png': '.png',
				'image/gif': '.gif',
				'image/webp': '.webp',
				'video/mp4': '.mp4',
				'video/webm': '.webm',
				'video/mov': '.mov',
				'video/mkv': '.mkv',
				'video/avi': '.avi',
				'video/wmv': '.wmv',
				'video/flv': '.flv',
				'video/3gp': '.3gp',
				'video/MPEG-4': '.mpeg4',
				'video/quicktime': '.quicktime',
				'video/.MP4': '.mp4',
				'video/.MOV': '.mov',
				'video/.MKV': '.mkv',
				'video/.AVI': '.avi',
				'video/.WMV': '.wmv',
				'video/.FLV': '.flv',
				'video/.3GP': '.3gp',
				'video/H.264': '.h264',
				'video/h264': '.h264',
				'video/h264': '.h264',
				'video/H.265': '.h265',
				'video/HEVC': '.hevc',
				'video/.H.264': '.h264',
				'video/.H.265': '.h265',
				'video/.HEVC': '.hevc',
				'video/.MPEG-4': '.mpeg4',
				'video/.QUICKTIME': '.quicktime',

			},
			server: {
				process: {
					url: './upload/',
					method: 'POST',
					withCredentials: false,
					headers: {
						userId: manageUserProfile('read', 'userId'),
						token: tokenMaster('get')
					},
					timeout: 700000,
					onload: (response) => {
						response = JSON.parse(response);
						addImage(response);

						return response.key;
					},
					onerror: (response) => {
						console.log(response);
						return response;
					},
					ondata: null,
				},
			}
		});
        
        jQuery('#share__upload-find').filepond({
			allowReorder: true,
			dropOnPage: true,
			dropOnElement: false,
			dropValidation: true,
			maxFiles: 1,
			allowReorder: false,
			onprocessfiles: () => {
				console.log('All files processed');
				
				return true;
			},
			onremovefile: (error, file) => {
				//removeImage(file);
                //file.remove();
			},
			onaddfile: (error, file) => {
				if (error) {
					console.error('An error occurred while adding the file:', error);
					return;
				}

				// Check if the file is an image
				if (file.fileType.startsWith('image/')) {
					// Open the image editor
					//file.edit();
					checkInterval = setInterval(() => {
						elements = document.querySelectorAll('.PinturaRectManipulator');
						if (elements.length !== 0) {
							clearInterval(checkInterval);
							jQuery('.PinturaRectManipulator').remove();
						}
					}, 500);
				}
			},
			fileValidateTypeDetectType: (source, type) =>
				new Promise((resolve, reject) => {
					if (fileValidation(source)) {
						resolve(type);
					}
					else {
						reject(type);
					}
				}),
			/* Image Editor plugin properties */
			imageEditor: {
				createEditor: openEditor,
				imageReader: [createDefaultImageReader],
				imageWriter: [
					createDefaultImageWriter,
				],
				imageProcessor: processImage,
				editorOptions: {
					...getEditorDefaults(),
					imageCropAspectRatio: 1,
				}
			},
			storeAsFile: true,
			instantUpload: true,
			allowFileTypeValidation: true,
			acceptedFileTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
			labelFileTypeNotAllowed: 'Only images are allowed',
			labelMaxFileSize: 'File is too big',
			maxFileSize: 10 * 1024 * 1024,
			labelMaxTotalFileSize: 'Maximum total size is 10MB',
			labelMaxTotalFileSizeExceeded: 'Maximum total size exceeded',
			fileValidateTypeLabelExpectedTypes: 'Invalid file format',
			fileValidateTypeLabelExpectedTypesMap: {
				'image/jpeg': '.jpeg',
				'image/jpg': '.jpg',
				'image/png': '.png',
				'image/gif': '.gif',
				'image/webp': '.webp',
                'image/heic': '.heic',
                'image/heif': '.heif',

			},
			server: {
				process: {
					url: './upload/',
					method: 'POST',
					withCredentials: false,
					headers: {
						userId: manageUserProfile('read', 'userId'),
						token: tokenMaster('get')
					},
					timeout: 700000,
					onload: (response) => {
						response = JSON.parse(response);

						return response.key;
					},
					onerror: (response) => {
						console.log(response);
						return response;
					},
					ondata: null,
				},
			}
		});
	}

	function removeImage(image) {
		var fileServerId = image.serverId
		mediaField = jQuery('#share__media').val();
		mediaField = mediaField.split(',');

		//Remove the file from the media field
		mediaField = jQuery.grep(mediaField, function (value) {
			return value != fileServerId;
		});

		jQuery('#share__media').val(mediaField.join(','));
	}

	
}

function addImage(imageData) {
	console.log(imageData);
	if (imageData.responseCode && imageData.responseCode == 400) {
		toast(imageData.errorMessage);
	}
	else {
		mediaInput = jQuery('#share__media');

		if (mediaInput.val() != '') {
			mediaInput.val(mediaInput.val() + '|' + imageData.Key);
		}
		else {
			mediaInput.val(imageData.Key);
		}
	}
}

//Validation for both image and video, extensions and size
function fileValidation(file) {
	response = false;
	file.type = file.type.toLowerCase();

	//Image jpg, jpeg, png & max 10MB
	if (file.type.includes('image')) {
		if (file.type != 'image/jpg' && file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/webp' && file.type != 'image/heic' && file.type != 'image/heif' && file.type != 'image/gif') {
			toast('Invalid image format, please upload a jpg, jpeg, png or gif file.');
		}
		else if (file.size > 20000000) {
			toast('Image size is too big, max size is 20MB.');
		}
		else {
			response = true;
		}
	}
	//Video mp4, mov, webm & max 100MB
	else if (file.type.includes('video')) {
		if (file.type != 'video/mp4' && file.type != 'video/mov' && file.type != 'video/webm' && file.type != 'video/mkv' && file.type != 'video/avi' && file.type != 'video/wmv' && file.type != 'video/flv' && file.type != 'video/3gp' && file.type != 'video/H.264' && file.type != 'video/H.265' && file.type != 'video/HEVC' && file.type != 'video/MPEG-4' && file.type != 'video/quicktime') {
			//Toast the type of video that is current
			toast(file.type);
			// toast('Invalid video format, please upload a mp4, mov, avi, hevc, h.264, h.265, mpeg-4 or quicktime file.');
		}
		else if (file.size > 200000000) {
			toast('Video size is too big, max size is 200MB.');
		}
		else {
			response = true;
		}
	}

	return response;
}

function defineApp() {
	url = window.location.href;
	if (url.includes('?')) {
		url = url.split('#');
		url = url[0];

		queryParams = url.split('?');
		url = queryParams[0];
		queryParams = queryParams[1];

		queryParams = queryParams.split('&');
		//Convert the query parameters into an object
		queryArray = [];
		for (i = 0; i < queryParams.length; i++) {
			pushArr = {
				'name': queryParams[i].split('=')[0],
				'value': queryParams[i].split('=')[1]
			}
			queryArray.push(pushArr);
		}

		query = queryArray;

		query.forEach(element => {
			if (element['name'] == 'app') {
				if (element['value'].toLowerCase() == 'android') {
					localStorage.setItem('isAndroid', true);
					localStorage.setItem('isIOS', false);
					localStorage.setItem('isPWA', false);

					return false;
				}
				else if (element['value'].toLowerCase() == 'ios') {
					localStorage.setItem('isIOS', true);
					localStorage.setItem('isAndroid', false);
					localStorage.setItem('isPWA', false);

					return false;
				}
				else if (element['value'].toLowerCase() == 'pwa') {
					localStorage.setItem('isPWA', true);
					localStorage.setItem('isAndroid', false);
					localStorage.setItem('isIOS', false);

					return false;
				}
				else {
					localStorage.setItem('isAndroid', false);
					localStorage.setItem('isIOS', false);
					localStorage.setItem('isPWA', false);
				}
			}
		});
	}

	//For ios, we are hiding the initial image loads after the app starts loading
	if (isIOS() && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.HideInitialImage){
		window.webkit.messageHandlers.HideInitialImage.postMessage('');
	}

}

function formPlusMinus() {
	jQuery(document).ready(function () {
		jQuery('.minus').click(function () {
			var input = jQuery(this).parent().find('input');
			var minVal = parseInt(input.attr('min')); 
			var count = parseInt(input.val()) - 1;
			count = count < minVal ? minVal : count;
			input.val(count);
			input.change();
			return false;
		});
		jQuery('.plus').click(function () {
			var input = jQuery(this).parent().find('input');
			max = input.attr('max');
			
			if (max != undefined) {
				if (parseInt(input.val()) >= parseInt(max)) {
					return false;
				}
			}
			else {
				input.val(parseInt(input.val()) + 1);
				input.change(); // Commented this code as it was increasing the increment by 2
				return false;
			}
		});
	});
}

function getMediaType(media) {
	mediaType = '';

	if (media) {
		//Check if the media is an image, video, document based on the extension
		if (media.includes('.jpg') || media.includes('.jpeg') || media.includes('.png') || media.includes('.gif') || media.includes('.webp')) {
			mediaType = 'image';
		}
		else if (media.includes('.mp4') || media.includes('.mov') || media.includes('.MP4') || media.includes('.MOV') || media.includes('.webm') || media.includes('.mkv') || media.includes('.mov') || media.includes('.quicktime') || media.includes('.H.264') || media.includes('.MPEG-4')) {
			mediaType = 'video';
		}
		else if (media.includes('.pdf') || media.includes('.doc') || media.includes('.docx') || media.includes('.xls') || media.includes('.xlsx') || media.includes('.ppt') || media.includes('.pptx') || media.includes('.txt')) {
			mediaType = 'document';
		}
	}

	return mediaType;
}

function handleBranchDesktopRouting() {
	// Only handle Branch.io routing on desktop
	if (isAndroid() || isIOS()) {
		return; // Skip on mobile devices
	}
	
	const url = window.location.href;
	const urlParams = new URLSearchParams(window.location.search);
	
	// Check if this is a Branch.io deep link
	if (urlParams.has('t')) {
		const deepLinkType = urlParams.get('t');
		console.log('Branch.io deep link detected:', deepLinkType);
		
		// Store the deep link parameters for later use
		window.deepLinkParams = {
			t: deepLinkType,
			_branch_match_id: urlParams.get('_branch_match_id'),
			utm_source: urlParams.get('utm_source'),
			utm_medium: urlParams.get('utm_medium'),
			_branch_referrer: urlParams.get('_branch_referrer')
		};
		
		// Route based on deep link type
		if (deepLinkType.includes('postid')) {
			const postId = deepLinkType.split('-')[1];
			console.log('Routing to post:', postId);
			redirect('post', postId);
			return;
		}
		else if (deepLinkType.includes('profileid')) {
			const profileId = deepLinkType.split('-')[1];
			console.log('Routing to profile:', profileId);
			redirect('profile', profileId);
			return;
		}
		else if (deepLinkType.includes('serviceid')) {
			const serviceId = deepLinkType.split('-')[1];
			console.log('Routing to service:', serviceId);
			setTimeout(function () {
				redirect('singleService', serviceId);
			}, 1000);
			return;
		}
		else if (deepLinkType.includes('experienceid')) {
			const experienceId = deepLinkType.split('-')[1];
			console.log('Routing to experience:', experienceId);
			setTimeout(function () {
				redirect('singleExperience', { id: experienceId, title: '', url: '' });
			}, 2000);
			return;
		}
		else if (deepLinkType.includes('locationid')) {
			const locationId = deepLinkType.split('-')[1];
			console.log('Routing to location:', locationId);
			redirect('location', locationId);
			return;
		}
		else if (deepLinkType.includes('groupid')) {
			const groupId = deepLinkType.split('-')[1];
			console.log('Routing to group:', groupId);
			// Handle group routing (you may need to implement this)
			toast('Group links are not supported on desktop yet');
			return;
		}
		else if (deepLinkType.includes('tripid')) {
			const tripId = deepLinkType.split('-')[1];
			console.log('Routing to trip:', tripId);
			jsInit('getItinerary', { 'itineraryId': tripId });
			return;
		}
		else if (deepLinkType.includes('hashtag')) {
			const hashtagId = deepLinkType.split('-')[1];
			console.log('Routing to hashtag:', hashtagId);
			redirect('hashtag', '#' + hashtagId);
			return;
		}
		else if (deepLinkType.includes('experiencecategoryid')) {
			const experienceCategoryId = deepLinkType.split('-')[1];
			console.log('Routing to experience category:', experienceCategoryId);
			openExperienceCategory(experienceCategoryId);
			return;
		}
		else if (deepLinkType.includes('feedid')) {
			const feedId = deepLinkType.split('-')[1];
			console.log('Routing to feed:', feedId);
			if (feedId === 'share') {
				// Open share post form
				toast('Share post feature - redirecting to community');
				initRender('community');
			} else if (feedId === 'find') {
				// Open find post form
				toast('Find post feature - redirecting to community');
				initRender('community');
			} else {
				// Open ask post form
				toast('Ask post feature - redirecting to community');
				initRender('community');
			}
			return;
		}
		else if (deepLinkType.includes('trending')) {
			console.log('Routing to trending');
			initRender('community');
			// You might want to add specific trending tab logic here
			return;
		}
		else if (deepLinkType.includes('meetups')) {
			console.log('Routing to meetups');
			initRender('community');
			// You might want to add specific meetups tab logic here
			return;
		}
		else if (deepLinkType.includes('services')) {
			console.log('Routing to services');
			initRender('community');
			// You might want to add specific services tab logic here
			return;
		}
		else if (deepLinkType.includes('influencers')) {
			console.log('Routing to influencers');
			initRender('community');
			// You might want to add specific influencers tab logic here
			return;
		}
		else if (deepLinkType.includes('local')) {
			console.log('Routing to local');
			initRender('community');
			// You might want to add specific local tab logic here
			return;
		}
		else if (deepLinkType.includes('contests')) {
			console.log('Routing to contests');
			initRender('community');
			// You might want to add specific contests tab logic here
			return;
		}
		else if (deepLinkType.includes('premium')) {
			console.log('Routing to premium');
			initRender('premium');
			return;
		}
		else if (deepLinkType.includes('home')) {
			console.log('Routing to home');
			initRender('community');
			return;
		}
		else if (deepLinkType.includes('search')) {
			console.log('Routing to search');
			initRender('search');
			return;
		}
		else if (deepLinkType.includes('chat-page')) {
			console.log('Routing to chat');
			// Redirect to chat page
			if (url.includes('localhost')) {
				window.open('http://localhost:3000/newChat', '_self');
			} else if (url.includes('dev.beatravelbuddy.com')) {
				window.open('https://dev.beatravelbuddy.com/newChat', '_self');
			} else {
				window.open('https://beatravelbuddy.com/newChat', '_self');
			}
			return;
		}
		else if (deepLinkType.includes('travel-flight')) {
			console.log('Routing to flights');
			initRender('flights');
			return;
		}
		else if (deepLinkType.includes('aiBuddy')) {
			console.log('Routing to AI Buddy');
			manageSecondary('show', 'ai_itinerary');
			return;
		}
		else if (deepLinkType.includes('findbuddy')) {
			console.log('Routing to find buddy');
			redirect('lfb');
			return;
		}
		else {
			console.log('Unknown deep link type:', deepLinkType);
			// Default to community page
			initRender('community');
			return;
		}
	}
}

function openExperienceCategory(experienceCategoryId) {
	let categoryMap = {
		'1': 'backpacking', '2': 'adventure-travel', '3': 'cultural-tourism', '4': 'road-trips', '5': 'culinary-tourism', '6': 'family', '7': 'mountainerring', '8': 'beach', '9': 'kayaking', '10': 'religious-tourism', '11': 'city-tours', '12': 'trekking', '13': 'historical-tourism', '14': 'bike-tours', '15': 'heritage-walks', '16': 'waterfalls', '17': 'meetups', '18': 'homestay', '19': 'offroading', '20': 'jungle-safaris', '21': 'art-and-crafts', '22': 'pub-crawling', '23': 'water-sports', '24': 'shopping', '25': 'events-and-exhibitions', '26': 'diving', '27': 'susutainable-living', '28': 'health-and-fitness', '29': 'winter-sports', '30': 'caving'
	};

	let categoryName = categoryMap[experienceCategoryId] || 'backpacking';
	window.location.href = 'https://beatravelbuddy.com/experiences/category/' + categoryName;
}

function urlCheck() {
	url = window.location.href;

	//This fundtion will check for android or ios app
	//defineApp();
	
	
	
	function getUTMParameters(url) {
		let urlParams = new URLSearchParams(new URL(url).search);
		let utmParams = {};
	
		urlParams.forEach((value, key) => {
			if (key.startsWith('utm_') || key.startsWith('param')) {
				utmParams[key] = value;
			}
		});
	
		return utmParams;
	}
	
	function storeUTMParameters(url) {
		let utmParams = getUTMParameters(url);
		localStorage.setItem('utmParams', JSON.stringify(utmParams));
	}
	
	// Example usage
	if (url.includes('?utm_')) {
		let currentUrl = window.location.href;
		storeUTMParameters(currentUrl);
		// To retrieve the stored UTM parameters
		let storedUTMParams = JSON.parse(localStorage.getItem('utmParams'));
		console.log(storedUTMParams);
	}
	
	

	if (url.includes('/experiences/booking-summary')) {
		initRender('booking-summary');
	}
	else if (url.includes('?ref=grassberry')) {
		var urlObj = new URL(url);
		var grassBerryEmail = urlObj.searchParams.get('user');
		var grassBerryName = urlObj.searchParams.get('username') ? urlObj.searchParams.get('username') : 'Guest User- GrassBerry';
		jsInit('checkUserLogin', { 'email': grassBerryEmail, userName: grassBerryName, 'referral': 'grassberry' }, 'referralLogin');
		initRender('flights');
	}
	else if (url.includes('/experiences')) {
		//Clean the url of all hash navigation
		url = url.split('#');
		url = url[0];

		//Pickup all the query parameters and save it in an object
		if (url.includes('?')) {
			queryParams = url.split('?');
			url = queryParams[0];
			queryParams = queryParams[1];

			console.log(queryParams);
		}

		//Make sure the url has a trailing slash
		if (url[url.length - 1] != '/') {
			url += '/';
		}

		//Remove the domain from the url
		url = url.replace('https://www.beatravelbuddy.com/', '');
		url = url.replace('https://beatravelbuddy.com/', '');
		url = url.replace('http://localhost:3000/', '');

		

		//If the experience id is not a number, then it's not a valid experience
		if (url === '/experiences/' || url === 'experiences/' || url == '/experiences' || url == 'experiences') {
			console.log('All experiences');
			initRender('experience');
		}
		else if (url.includes('/category/')) {
			loaderMain('global', true);
			experienceId = url.replace('experiences/category/', '');
			experienceCat = experienceId.replaceAll('-', ' ').replaceAll('/', '');
			initRender('experienceCategory', { id: experienceId, category: experienceCat });
		}
		else {
			experienceId = parseInt(url.replace('experiences/', '').split('-').pop().replace('/', ''));
			experienceLink = url.replace('experiences/', '').split('com/').pop();

			if (isNaN(experienceId)) {
				initRender('experience');
			} 
			else {
				initRender('singleExperience', { id: experienceId, url: experienceLink });
			}
		}
	}
	else if (url.includes('/community')) {
		initRender('community');
	}
	else if (url.includes('/404/') || url.includes('/404')) {
		initRender('404');
	}
	else if (url.includes('/contact-us')) {
		initRender('contact-us');
	}
	// Tb Mini Page
	else if (url.includes('/premium-luxe')) {
		initRender('premium-luxe');
	}
	// Tb Pro Page
	else if (url.includes('/premium-pro')) {
		initRender('premium-pro');
	}
		// Tb Super Page
	else if (url.includes('/premium-super')) {
		initRender('premium-super');
	}
	// Default Premium page
	else if (url.includes('/premium')) {
		initRender('premium');
	}
	else if (url.includes('/listings')) {
		initRender('listings');
	}
	else if (url.includes('/add-find-post')) {
        initRender('add-find-post');
    }
    else if (url.includes('/add-share-post')) {
        initRender('add-share-post');
    }
    else if (url.includes('/add-ask-post')) {
        initRender('add-ask-post');
    }
	else if (url.includes('/chat') || url.includes('/newChat')) {
		var currentUrl = window.location.href;
		if (currentUrl.includes('localhost')) {
			window.open('http://localhost:3000/newChat', '_self');
		}
		else if (currentUrl.includes('dev.beatravelbuddy.com')) {
			window.open('https://dev.beatravelbuddy.com/newChat', '_self');
		}
		else {
			window.open('https://beatravelbuddy.com/newChat', '_self');
		}
		//initRender('chat');
	}
	else if (url.includes('/dashboard')) {
		initRender('dashboard');
	}
	else if (url.includes('/search')) {
		initRender('search');
	}
	else if (url.includes('/login')) {
		initRender('login');
		loaderMain('global', true);
	}
	else if (url.includes('/home')) {
		initRender('community');
	}
	else if (url.includes('/groupTrips') || url.includes('/group-trips')) {
		var cleanUrl = url.includes('?') ? url.split('?')[0] : url;
		var lastSegment = cleanUrl.split('/').pop();
		var idMatch = lastSegment ? lastSegment.match(/(\d+)$/) : null;
		var groupTripId = idMatch ? idMatch[1] : null;

		initRender('groupTrips');
		if (groupTripId && Number(groupTripId) > 0) {
			console.log('Group Trip ID:', groupTripId);
			jsInit('getExperiences', { filter: { experienceId: groupTripId } }, 'newSingleDataRender');
		}	
	}
		
	else if (url.includes('/packages')) {
		// var groupTripId = url.split('/').pop()
		url = url.includes('?') ? url.split('?')[0] : url;
		var urlPartLength = url.split('-').length;
		var groupTripId = url.split('-')[urlPartLength - 1];
		initRender('experience');
		if (Number(groupTripId) > 0) {
			console.log('Group Trip ID:', groupTripId);
			jsInit('getExperiences', { filter: { experienceId: groupTripId } }, 'newSingleDataRender');
		}
	}
	else if (url.includes('/check-deals-hotels-flights-packages')) {
        initRender('check-deals-hotels-flights-packages');
    }
    else if (url.includes('/ai-plan-trip')) {
        initRender('ai-plan-trip');
    }
    else if (url.includes('/ai-travel-plan')) {
        initRender('itineraryId');
    }
    else if (url.includes('/allAiTrips')) {
        initRender('allAiTrips');
    }
    else if (url.includes('/findbuddy')) {
        initRender('findbuddy');
	}
	else if (url.includes('/flights') || url.includes('/flights-search')) {
		jsInit('getAirportInfo', {});
		initRender('flights');
		createAndShowPopup('https://beatravelbuddy.com/view/assets/img/flight-coupon-ind.webp', 'copy-coupon');
		if (url.includes('/flights-search')) {
			prefillAndSearchFromUrl();
		}
	}
	else if (url.includes('/hotels')) {
        initRender('hotels');
	}
	else if (url.includes('/post')) {
		var postId = url.split('/').pop()
		postId = postId.includes('?') ? postId.split('?')[0] : postId;
		
		initRender('post', { postId: postId });
	}
	else if (url.includes('/profile')) {
		var urlParts = url.split('/');
		var lastPart = urlParts.pop();
		var profileId = lastPart.split('?')[0];
		initRender('profile', { profileId: profileId });
	}
	else if (url.includes('/detect.php')) {
		// Check for Branch.io deep link parameters on desktop
		console.log('Branch.io deep link detected:', url);	
		initRender('deepLinkDesktop');
		
	}

	else {
		//Loading default page
		
		function renderPage() {
			lastRenderedPage = localStorage.getItem('lastRenderedPage');
			page = (lastRenderedPage && lastRenderedPage !== 'flights') ? 'flights' : 'flights';
			localStorage.setItem('lastRenderedPage', page);
			userType = isServiceProvider() ? 'serviceProvider' : 'other';

			switch (deviceType + '-' + userType) {
				case 'mobile-serviceProvider':
				case 'desktop-serviceProvider':
                case 'mobileApps-serviceProvider':    
					initRender('flights');
					break;
				case 'mobile-other':
					if (localStorage.getItem('lastActiveStatus')) {
						var lastActiveTimestamp = parseInt(localStorage.getItem('lastActiveStatus'), 10);
						var currentTime = new Date().getTime();
						var timeDiff = (currentTime - lastActiveTimestamp) / (1000 * 60 * 60);
						initRender(timeDiff > 24 ? 'flights' : 'flights');
						//createAndShowPopup('/view/assets/img/in-app.webp');
					}
					else {
						initRender('flights');
					}
					break;
					
                case 'mobileApps-other':    
					//Commenting below code as homepage screen is not rendering properly on some devices
                    if (localStorage.getItem('lastActiveStatus')) {
						var lastActiveTimestamp = parseInt(localStorage.getItem('lastActiveStatus'), 10);
						var currentTime = new Date().getTime();
                        var timeDiff = (currentTime - lastActiveTimestamp) / (1000 * 60 * 60);
                        initRender(timeDiff > 24 ? 'homePage' : page);
					}
					else {
                        initRender(page);
                    }
					//initRender(page);
					//initRender('homePage');
					break;
				case 'desktop-other':
					initRender('flights');
					break;
			}
		}

		deviceType = (isAndroid() || isIOS()) ? 'mobileApps' : isMobile() ? 'mobile' : 'desktop';
		loggedInUser = guestMaster() ? 'guestMaster' : 'other';
		//onboardingVideo = localStorage.getItem('onboardingVideo') ? 'exists' : 'notExists';
		onboardingVideo = 'notExists';

		switch (`${loggedInUser}-${deviceType}-${onboardingVideo}`) {
			case 'guestMaster-mobileApps-notExists':
				initRender('flights');
				break;    
			default:
				renderPage();
				break;
		}
	}
	
	
}

function geocodeAddress() {
	try {
		webkit.messageHandlers.geocodeAddress.postMessage(
			{
				street: document.getElementById('street').value,
				city: document.getElementById('city').value
			});
	} catch (err) { }
}

function facebookLogin() {
	try {
		webkit.messageHandlers.login.postMessage(
			{
				loginType: 'facebook'
			});
	} catch (err) { }
}

function googleLogin() {
	try {
		webkit.messageHandlers.login.postMessage(
			{
				loginType: 'google'
			});
	} catch (err) { }
}

function triggerHaptic(power) {
	//The power can be light, medium, heavy or error
	if (isIOS()) {
		try {
			webkit.messageHandlers.TriggerHaptic.postMessage({ hapticType: power });
		} catch (err) { console.log(err); }
	}
}

function hideSplashScreen() {
	//Hide the splash screen
	if (isIOS()) {
		try {
			webkit.messageHandlers.HideInitialImage.postMessage();
		} catch (err) { console.log(err); }
	}
}

function placeName(place) {
	addressCountry = '';
	addressState = '';
	addressCity = '';
	addressSubLocality1 = '';
	addressSubLocality2 = '';

	place.address_components.forEach((component) => {
		if (component.types[0] == 'country') {
			addressCountry = ', ' + component.long_name;
		}

		if (component.types[0] == 'administrative_area_level_1') {
			addressState = ', ' + component.long_name;
		}

		if (component.types[0] == 'locality') {
			addressCity = ', ' + component.long_name;
		}

		if (component.types[0] == 'sublocality_level_1') {
			addressSubLocality1 = ', ' + component.long_name;
		}

		if (component.types[0] == 'sublocality_level_2') {
			addressSubLocality2 = ', ' + component.long_name;
		}
	});

	if (addressSubLocality1 == (', ' + place.name)) {
		addressSubLocality1 = '';
	}

	if (addressSubLocality2 == (', ' + place.name)) {
		addressSubLocality2 = '';
	}

	if (addressCity == (', ' + place.name)) {
		addressCity = '';
	}

	if (addressState == (', ' + place.name)) {
		addressState = '';
	}

	/*if (addressCountry == ', India') {
		addressCountry = '';
	}*/

	response = place.name + addressSubLocality2 + addressSubLocality1 + addressCity + addressState + addressCountry;

	return response;
}

//This is for the foreground and background app status
function appStatusChanged(data) {
	console.log(data);

	//The format is {status: "background", OS: "ios"}, the status is either background, inactive or active
	if (data['status'] == 'background' || data['status'] == 'inactive') {
		//Pause all videos
		jQuery('video').each(function () {
			this.pause();
		});
	}
	else if (data['status'] == 'active') { }
}

//App Version from the iOS app, only version for now but later we can receive other info from the iOS app.
function appInfoReceived(data) {
	console.log(data);

	//The format is {OS: "ios", version: "1.7.5"}
}

//Dark Mode Light Mode switch from iOS app
function appearanceChanged(data) {
	console.log(data);

	//The format is {os: "iOS", appearance: "dark"}
	if (data['appearance'] == 'dark') {
		//@juzer09 this is where you can change the theme to dark mode
	}
	else if (data['appearance'] == 'light') {
		//@juzer09 this is where you can change the theme to light mode
	}
}

// function deeplinkMaster(url) {
//     url = processUrl(url);

//     if (url['t'].includes('postid')) {
//         postId = (url['t']) ? url['t'].split('-')[1] : null;

//         redirect('post', postId);
//     }

//     function processUrl(url) {
//         //Parse the url to get the query parameters
//         url = url.split('?');
//         url = url[1];
//         url = url.split('&');

//         //Create an object to store the query parameters
//         query = {};

//         //Loop through the query parameters and store them in the object
//         for (i = 0; i < url.length; i++) {
//             query[url[i].split('=')[0]] = url[i].split('=')[1];
//         }

//         console.log(query);
//         return query;
//     }
// }

function setNotificationToken(data) {
	if (isAndroid()) {
		data = JSON.parse(data);
		localStorage.setItem('notificationToken', data.token);
		localStorage.setItem('vendorUUID', data.vendorUUID);
	}
	else if (isIOS()) {
		console.log(data);
		localStorage.setItem('vendorUUID', data.vendorUUID);
		localStorage.setItem('notificationToken', data.token);
	}
}


function lightDarkMode() {
	localStorage.setItem('lightMode', true);
	jQuery('body').addClass('lightMode');
	return;
	if (localStorage.getItem('lightMode') == null) {
		localStorage.setItem('lightMode', true);
		lightDarkMode();
	}
	else {
		if (localStorage.getItem('lightMode') == 'false') {
			jQuery('body').removeClass('lightMode');
		}
		else {
			jQuery('body').addClass('lightMode');
		}
	}
}



function locationData(data) {
	if (isAndroid()) {
        if (data !== undefined && data !== null && data !== '') {
    		data = JSON.parse(data);
            localStorage.setItem('userLat', data.latitude);
            localStorage.setItem('userLong', data.longitude);
        }
	}
	console.log(data);
}

function contactsData(data) {
	console.log(data);
}

function splashImage() {
	if (isAndroid()) {
		Android.splashImage('https://beatravelbuddy.com/view/assets/img/splash_new-android_.webp');
	}
}


function websiteLink() {
	if (isAndroid()) {
		if (window.location.href.includes('dev.beatravelbuddy.com')) {
			Android.websiteLink('https://beatravelbuddy.com/?app=android')
			// Android.websiteLink('https://dev.beatravelbuddy.com/?app=android')
		}
		else {
			Android.websiteLink('https://beatravelbuddy.com/?app=android')
			
		}
	}
}

function appUpdate() {
	if (isAndroid()) {
		Android.appUpdate('Flexible', true);
	}
}

function getTheme() {
	if (isAndroid()) {
		setTimeout(function () {
			Android.getTheme();
		}, 10000);
	}
}

function themeSet(theme) {
	console.log("Theme", theme);
}

function makeSureTabsAreLoaded() {
	isClicked = false;

	setInterval(() => {
		if (!isClicked) {
			if (jQuery('#main__tabs ul li.tab__item').length > 0) {
				jQuery('#main__tabs ul li.tab__item').each(function () {
					if (jQuery(this).hasClass('active')) {
						isClicked = true;
					}
					else {
						return false;
					}
				});
			}

			if (!isClicked) {
				//jQuery('#main__tabs ul li.tab__item').first().trigger('click');
			}
			else {
				clearInterval();
				return false;
			}
		}

	}, 1500);
}

function manageRazorPayWidget(amount) {
	console.log(amount);
	const widgetConfig = {
		"key": RAZORPAY_KEY,
		"amount": amount.toFixed(2) * 100,
	};
	const rzpAffordabilitySuite = new RazorpayAffordabilitySuite(widgetConfig);
	rzpAffordabilitySuite.render();
}

function destroyAllSecondaryTabs() {
	jQuery('.secondary__tab').each(function () {
		jQuery(this).remove();
	});
}

function setUserData() {
	localStorage.setItem('enquiryFormShown',false);
	localStorage.setItem('premiumFormShown',(manageUserProfile('read', 'isVerified') != true ? false : true));
}

function setAndroidVersion(appVersion, osVersion) {
	console.log('Setting Android Version:', appVersion, osVersion);
	if (isAndroid() && !guestMaster()) {
		localStorage.setItem('androidVersion', appVersion);
		localStorage.setItem('androidOSVersion', osVersion);
	}
}

function androidCodesForUpdated() {

	var androidVersion = localStorage.getItem('androidVersion');
	if (isAndroid() && localStorage.getItem('androidVersion') != undefined && (androidVersion == '9.0.6' || androidVersion == '9.0.2' || androidVersion == '9.0.5')) {
		try {
            // Set to True after we make the Design of the Push Notification on the Web
            Android.setNotification(false);
            // Hide the Splash Screen
            Android.hideSplashScreen();
            // Set Android Version
        }
        catch (err) {
            console.log(err);
        }
	}
}

function setUserDataWeb() {
}

function showLoginForApps() {
	if ((guestMaster() && disableGuestLoginForDevices && (isAndroid() || isIOS()))) {

		redirect('login');
		jQuery('#dark-back').remove();

		// set height 105% from class name drawer
		jQuery('.drawer').css('height', '108%');
		jQuery('.header__hamburger').hide();
		//jQuery('.header__menu.header__menu-experiences').hide();
		jQuery('#main__drawer .drawerHeader .drawer-kapat').hide();

		//Remove max-height from div#main__drawer.loginDrawer .drawerBody
		jQuery('#main__drawer.loginDrawer .drawerBody').css('max-height', 'none');

		// Stop transition from class name drawer
		jQuery('.drawer').css('transition', 'none');

		//Set padding to 30px 45px 65px of reset__view
		jQuery('.reset__view').css('padding', '30px 45px 65px');

	}
}

function changeLastActiveStatus() {

	function updateLastActive() {
		payload = {
			appVersion: appVersion,
			deviceId: manageNotificationToken('get'),
			token: localStorage.getItem('token'),
			deviceUniqueId: '',

		}
		if (!isAndroid() && !isIOS() && !isPwa()) {
			deviceType = 'web';
		}
		else if (isAndroid()) {
			deviceType = 'android';
			deviceUniqueId = localStorage.getItem('vendorUUID');
			payload['deviceUniqueId'] = deviceUniqueId;
		}
		else if (isIOS()) {
			deviceType = 'ios';
		}
		else if (isPwa()) {
			deviceType = 'pwa';
		}
		payload['deviceType'] = deviceType;
		// Check if token is not null or undefined
		if (payload['token'] != undefined && payload['token'] != null) {
			// Call the Api to change the last active status
			jsInit('changeLastActiveStatus', payload, 'changeLastActiveStatus');
			localStorage.setItem('lastActiveStatus', new Date().getTime());
		}
	}

	// Check if 2 minutes or more has passed from last active status. If yes, then again call the Api to change the last active status
	if (!guestMaster()) {
		if (localStorage.getItem('lastActiveStatus') != undefined && localStorage.getItem('lastActiveStatus') != null) {
			if (new Date().getTime() - localStorage.getItem('lastActiveStatus') >= 120000) {
				updateLastActive();
			}
		}
		else {
			updateLastActive();
		}
	}
}

function footerProfileImage(image) {
    setTimeout(() => {
        if (image == '' || image == null || image == undefined || image == '/filters:format(webp)/fit-in/200x200/') {
            image = renderUserProfileImage('uploads/display_pictures/91911683610768748.jpg');
        }
		isInfluencer = profile.roleType == 7;
        imagePath = getProfileImage(renderUserProfileImage(image), profile.name, '', '', isInfluencer)+ '<span class="footer-span">Profile</span>';
        jQuery('div#footer ul li:last-child a').html(imagePath);
        jQuery('.desktopMenu-profile').html(imagePath);
    }, 100);
}

function showWalkthrough(where) {
	return;
	// If not, start an interval that checks every second
	walkthrough = setInterval(() => {
		getIntroJsOptions = undefined;
		// Define a function that returns the options for introJs
		if (where == 'community' && localStorage.getItem('showWalkthrough') != 'true') {
			//localStorage.setItem('showWalkthrough', 'true');
			getIntroJsOptions = (isMobile) => ({
				// The steps of the walkthrough
				steps: [
					{
						// The element to highlight in this step, different for mobile and desktop
						element: document.querySelector(isMobile ? '#tb__reels' : '.desktopMenu-shots'),
						// The text to show in this step
						intro: 'Discover your perfect travel buddies and start planning your next adventure together.',
						title: 'Find Buddies',
					},
					{
						element: document.querySelector(isMobile ? '.ai__header-home' : '.desktopMenu-aiBuddy'),
						intro: 'Craft your personalized and exclusive itineraries with AI Buddy in seconds.',
						title: 'AI Buddy',
					},
					{
						element: document.querySelector(isMobile ? '.menu__feed.openExperiences' : '.desktopMenu-experiencesApp'),
						intro: 'Book Authentic Experiences from Authentic Locals.',
						title: 'Experiences',
					},
					{
						element: document.querySelector(isMobile ? '.menu__feed.addPost_lightmode' : '.desktopMenu-addPost'),
						intro: 'Share your travel tales and inspire travelers around the world.',
						title: 'Add Post',
					},
					{
						element: document.querySelector(isMobile ? '.menu__feed.community' : '.desktopMenu-socialApp'),
						intro: 'Join our community and engage in meet-ups with travelers worldwide.',
						title: 'Community',
					},
					{
						element: document.querySelector(isMobile ? '.head__search' : '.desktopMenu-profile.desktopMenu-item'),
						intro: (isMobile ? 'Explore trending locations, find buddies and much more.' : 'Access & Build your Profile to stand out from the world.' ),
						title: (isMobile ? 'Search' : 'Profile' ),
					}
				]
			});
		}
		else if (where == 'homePage' && (isAndroid() || isIOS() || isMobile()) && !localStorage.getItem('showWalkthroughHomePage')) {
			
			//localStorage.setItem('showWalkthroughHomePage', true);
			getIntroJsOptions = (isMobile) => ({
				// The steps of the walkthrough
				steps: [
					{
						// The element to highlight in this step, different for mobile and desktop
						element: document.querySelector('.header__logo'),
						// The text to show in this step
						intro: 'Discover your perfect travel buddies and start planning your next adventure together. Click here to come back to this page.',
						title: 'Home Page',
					}
				]
			});
			
		}

		// Check if introJs is loaded
		if (typeof introJs === 'function') {
			if (getIntroJsOptions){
				// Determine if the user is on a mobile device
				isMobileDevice = jQuery(window).width() <= 768 ? true : false;
				// Start the walkthrough with the options returned by getIntroJsOptions
				introJs().setOptions(getIntroJsOptions(isMobileDevice)).start();
			}
			// Stop checking if introJs is loaded
			clearInterval(walkthrough);
			where == 'community' ? localStorage.setItem('showWalkthrough', true) : where == 'homePage' ? localStorage.setItem('showWalkthroughHomePage', true) : null;
			function applyStyles(bgColor, color) {
				jQuery('.introjs-bullets').remove();
				jQuery('.introjs-tooltip').css('background-color', bgColor);
				jQuery('.introjs-tooltip-header, .introjs-skipbutton, .introjs-tooltiptext ').css('color', color);
				jQuery('.introjs-tooltipbuttons').css('padding', '5px');
				jQuery('.introjs-button').css('border', '1px solid ' + color);
			}

			if (localStorage.getItem('lightMode') == 'true') {
				applyStyles('#1d1d1d', '#f6ee33');
			} 
			else {
				applyStyles('#f6ee33', '#000');
			}
			
		}
	}, 1000);

}

function saveHostellersData(data, from) {
    console.log(data);
    return new Promise((resolve, reject) => {
        let indxDbName, objectStoreName;
        if (from == 'getAllHostellers') {
            indxDbName = 'allHostels';
            objectStoreName = 'allHostelerData';
        } else {
            indxDbName = 'newHostels';
            objectStoreName = 'newHostelerData';
        }

        // Attempt to open the database with a higher version to trigger onupgradeneeded if the object store does not exist
        var request = indexedDB.open(indxDbName); // Example version, adjust based on your application's needs

        request.onupgradeneeded = function(event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains(objectStoreName)) {
                db.createObjectStore(objectStoreName, { keyPath: '_id' });
            }
        };

        request.onsuccess = function(event) {
            var db = event.target.result;
            try {
                var transaction = db.transaction([objectStoreName], 'readwrite');
                var objectStore = transaction.objectStore(objectStoreName);

                if (Array.isArray(data)) {
                    var promises = data.map(function(item) {
                        return new Promise((resolve, reject) => {
                            if (!item.hasOwnProperty('_id')) {
                                console.error('Data item missing _id property:', item);
                                reject(new Error('Data item missing _id property'));
                                return;
                            }

                            var request = objectStore.put(item);
                            request.onsuccess = function() {
                                resolve();
                            };
                            request.onerror = function(event) {
                                console.error('Error adding data item:', event.target.error);
                                reject(event.target.error);
                            };
                        });
                    });

                    Promise.all(promises)
                        .then(() => resolve())
                        .catch((error) => reject(error));
                } else {
                    console.error('Data is not an array');
                    reject(new Error('Data is not an array'));
                }
            } catch (error) {
                console.error('Transaction failed:', error);
                reject(error);
            }
        };

        request.onerror = function(event) {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };
    });
}

function getHostellersFromIndexedDb(indxDbName, objectStoreName) {
    return new Promise((resolve, reject) => {
        // Step 1: Open a connection to the IndexedDB database
        var request = indexedDB.open(indxDbName);

        request.onerror = function(event) {
            // Handle errors when opening the database
            console.error("Database error: ", event.target.errorCode);
            reject(event.target.errorCode);
        };

        request.onsuccess = function(event) {
            var db = event.target.result;
            
            if (!db.objectStoreNames.contains(objectStoreName)) {
                // If the object store doesn't exist, resolve with no data
                console.log("Object store not found in the database.");
                resolve(false);
                return;
            }
            
            try {

                // Step 2: Create a transaction on the objectStoreName
                var transaction = db.transaction([objectStoreName], "readonly");

                // Step 3: Get the object store from the transaction
                var objectStore = transaction.objectStore(objectStoreName);

                // Step 4: Retrieve all data from the object store
                var getAllRequest = objectStore.getAll(); // Alternatively, use openCursor() for more complex queries

                getAllRequest.onsuccess = function() {
                    if (getAllRequest.result.length === 0) {
                        // Resolve with a flag indicating no data
                        resolve(false);
                    } else {
                        // Resolve with the retrieved data
                        resolve(getAllRequest.result);
                    }
                };

                getAllRequest.onerror = function() {
                    // Handle errors in the getAll request
                    console.log("Error fetching data from objectStore");
                    resolve(false);
                };
            } 
            catch (error) {
                console.log('Transaction failed:', error);
                resolve(false);
            }
        };
    });
}

function detectOperatingSystem() {
    userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome") && !userAgent.includes("Chromium")) {
		if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS X")) {
			if (userAgent.includes("Safari")) {
				return 5; // macOS Safari
			}
			else {
				return 1; // macOS Chrome
			}
        }
        else if (userAgent.includes("Windows")) {
            return 2; // Windows Chrome
        }
        else if (userAgent.includes("Linux")) {
            return 3; // Linux Chrome
        }
        else {
            return 4; // Chrome on another OS
        }
    } else {
        return 0; // Not Chrome
    }
}

function switchTab(tabIndex, tabName, element) {
    //tabNames = ['inreview', 'published', 'draft', 'deleted'];

    // Hide all content divs and their child pages
    jQuery('.content').hide().children('.page').hide();

    // Determine the ID suffix based on the tabIndex
    idSuffix = tabNames[tabIndex];

    // Show the selected tab's content and its child page
    var selectedContent = jQuery(`#content${idSuffix}`).show();
    selectedContent.children('.page').css({
        'display': 'flex',
        'flex-direction': 'column'
    });
    
    jQuery('.tab').css({'background': 'black','color': 'yellow' // Reset text color to black for all tabs
    });
    element.css({'background': 'yellow','color': 'black' });
    jsInit('adminGetAllListings', { pageNumber: '0', status: tabName }, tabName);
}


function communityPagination() {
    try {
        feedSentinel = document.querySelector('.feeds__sentinel__card');
        let feedPaginationObserver;

        options = {
            root: document.querySelector('#main__feed-box'), // use the search__body as the viewport
            rootMargin: '0px', // Increase margin to trigger earlier
            threshold: 0.1 // Trigger when half of the sentinel is visible
        };

        feedPaginationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Sentinel is visible, log the event
                    console.log('Sentinel is at the end of the scroll');
                    
                    //if (jQuery('.main_item .search__results-box .search__item').length > 9 ) {
                    
                    tabSelector = jQuery('#main__tabs .tab__item.active');
                    
                    pageNumber = 1 + Number(tabSelector.attr('data-page'));
                    tabType = tabSelector.attr('data-id');
                    
                    tabName = tabSelector.attr('data-tab');
                    
                    fetchPosts({ feedsType: tabType, locationLat: userLatLong['latitude'], locationLong: userLatLong['longitude'], pageNumber: pageNumber }, tabName);
                        
                
                    tabSelector.attr('data-page', pageNumber);
                    
                    observer.unobserve(entry.target); // Stop observing the current sentinel
                    
                    // remove the current sentinel
                    entry.target.remove();
                    //}
                }
            });
        }, options);

        feedPaginationObserver.observe(feedSentinel); // Start observing the sentinel

		// Assume activeTab is a variable that holds the ID of the currently active tab
        activeTab = jQuery('#main__tabs .tab__item.active').attr('data-tab');

        // Initialize Pull to Refresh
        PullToRefresh.init({
            mainElement: '#'+activeTab, // The element to apply pull-to-refresh on
            onRefresh() {
                // Function to refresh the feed
                refreshFeed();
            },
            shouldPullToRefresh() {
				// Only trigger pull-to-refresh if the user is at the top of the active tab element
				// 
                let activeElement = document.querySelector('#'+activeTab);
                let mainFeedBox = document.querySelector('#main__feed-box');
                // Check if #secondary has .secondary__tab and that has any child elements
				let secondaryTab = document.querySelector('#secondary .secondary__tab');
				let loginTab = document.querySelector('.traveller-details-review__container');
				let hasChildren = (secondaryTab && secondaryTab.children.length > 0) || loginTab;

				// Do not trigger pull-to-refresh if secondaryTab exists and has children
				if (hasChildren) {
					return false;
				}

				return mainFeedBox && mainFeedBox.classList.contains('active') && activeElement && activeElement.scrollTop === 0;
            }

		});
		
    } 
    catch (error) {
        console.log(error);
    }
}

function uploadFindPost(formData, mediaListFind) {
    if (manageUserProfile('read','isVerified') && formData.validator.response && formData.request.findBuddyGroup != undefined && formData.request.findBuddyGroup != null) {
        findAutomation = true;
    }
    else {
        findAutomation = false;
    } 
    
    bookFromTbd = formData.request.bookFromTbd ? 1 : 0;
    selectedOption = Number(document.querySelector('#dropdownDuration').value);
    
    // Common payload for both the requests, i.e for update and add post
    commonData={ dateOfTravel: formData.request.startDate, description: formData.request.findBuddy__description, location: formData.request.share__location_findBuddy,travelWithGender: formData.request.findBuddy__preferred ,lat: formData.request.share__location_lat,lng: formData.request.share__location_lng,type:1,userType:0,createGroup:findAutomation,tripDuration:selectedOption,dateType:formData.request.dateType,travelerType:formData.request.travelerType,budget:formData.request.budgetType,bookFromTbd: bookFromTbd,mediaList:mediaListFind };

    updatePostPayload = { ...commonData,isEditPost: true,isPosted: true,interests: "[]",services: "[]",postId: jQuery('#addPost__find-buddy .editFind').data('id'),id: 9 };

    addPostPayload = { ...commonData, findType: 'buddy'};
    
    if (jQuery('.addPost__post').text().includes('Update')) {
        console.log('Update');
        jsInit('updatePost', updatePostPayload, 'editFindBuddy');
        postLoader('show');
        clearAndGoBack();

    }

    else if (formData.validator.response) {
        
        payload = { 'userid': manageUserProfile('read', 'userId'), 'isSuccess': true, 'postDescription': formData.request.findBuddy__description, 'dateOfTravel': formData.request.findBuddy__date, 'location': formData.request.findBuddy__location, 'travelWithGender': formData.request.findBuddy__preferred, 'hasAttachment': false, };
        
        // if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
        //     Moengage.track_event('TBD_FIND_POST_STATUS_EVENT', payload);
        // }
        // if (isAndroid()) {
        //     Android.moEngageData('TBD_FIND_POST_STATUS_EVENT', JSON.stringify(payload));
        // }
        
        jsInit('addPost',addPostPayload,'findBuddy');
        postLoader('show');
        loaderMain('global', false);
		clearAndGoBack();
		webAnalytics('findBuddy');
    } 
    else {
        throwFormError(jQuery(this), formData.validator.message, formData.validator.where);
    }
}

function changeCabinClass(selectedElement) {
    // Remove the 'selected' class from all options
    $('.flight_option').removeClass('selected');

    // Assuming selectedElement is the input, find its grandparent (the .flight_option div) and add 'selected'
    $(selectedElement).closest('.flight_option').addClass('selected');

}

function formatDateAndTime(dateTimeStr) {
    options = { hour: '2-digit', minute: '2-digit' };
    date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', options);
}

function aiImageErrorHandler(imgElement) {
    jQuery(imgElement).closest('.itinerary-image-container').css({ 'min-height': 'unset' });
    jQuery(imgElement).remove();
}

function reloadWindowWithIosCheck() {
    if (isIOS()) {
        window.location.href = "https://beatravelbuddy.com/?app=ios";
    }
    else {
        location.reload();
    }
}

function minMaxDate(where) {
    // Calculate tomorrow's date
    today = new Date();
    // tomorrow = new Date(today);
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // Format the date for display (e.g., "26 Jul' 24")
    displayOptions = { day: '2-digit', month: 'short', year: '2-digit' };
    displayDate = today.toLocaleDateString('en-GB', displayOptions).replace(/ /g, " ").replace(",", "'");
    // Format the date for value (YYYY-MM-DD)
    valueDate = today.toISOString().split('T')[0];
    // Set the display text and value of depDate input
    //$('#depDate').val(valueDate); // Set the value attribute to "2024-07-26"
	if (where == '.date__text-dep') {
		jQuery('#depDate').val(valueDate); // Set the value attribute to "2024-07-26"
        jQuery(where).text(formatDateWithSuffix(valueDate)); // Set the value attribute to "2024-07-26"
	}
	else if (where == '.check__in-text' || where == '.check__out-text') {
		if (where == '.check__out-text') {
			// Set one day after the current date
			tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			// Format the date for value (YYYY-MM-DD)
			valueDate = tomorrow.toISOString().split('T')[0];
			// Set the display text and value of depDate input
			jQuery('#check-out').val(valueDate); // Set the value attribute to "2024-07-26"
		}
		jQuery(where).text(formatDateWithSuffix(valueDate)); // Set the value attribute to "2024-07-26"
	}
    jQuery(where).attr('min', valueDate);
}

function getObFareBreakDown(tboFareQuoteOb) {
	ObFareBreakdown = tboFareQuoteOb.Response.Results.FareBreakdown;
}

function getIbFareBreakDown(tboFareQuoteIb) {
	IbFareBreakdown = tboFareQuoteIb.Response.Results.FareBreakdown;
}

function getOwFareBreakDown(tboFareQuoteOw) {
	OwFareBreakdown = tboFareQuoteOw.Response.Results.FareBreakdown;
}

getFareDetails = (type, breakdown) => breakdown.find(fareBreakdown => fareBreakdown.PassengerType == type);
            
formatFareDetails = (details) => ({
    Currency: details.Currency,
    BaseFare: details.BaseFare ? (details.BaseFare / details.PassengerCount) : 0,
    Tax: details.Tax ? (details.Tax / details.PassengerCount) : 0
});

mapPassengers = (passengers, fare) => passengers.map(passenger => ({ ...passenger, Fare: fare }));

function createFinalPassengersPayload() {
	if (jQuery('.flights__search').attr('data-return') == 'true') {
		adultPassengerObFareDetails = getFareDetails(1, ObFareBreakdown);
		adultPassengerIbFareDetails = getFareDetails(1, IbFareBreakdown);

		fareObAdult = formatFareDetails(adultPassengerObFareDetails);
		fareIbAdult = formatFareDetails(adultPassengerIbFareDetails);

		let fareObChildren, fareIbChildren, fareObInfant, fareIbInfant;

		if (childPassengers.length > 0) {
			childrenPassengerObFareDetails = getFareDetails(
				2,
				ObFareBreakdown
			);
			childrenPassengerIbFareDetails = getFareDetails(
				2,
				IbFareBreakdown
			);
			fareObChildren = formatFareDetails(
				childrenPassengerObFareDetails
			);
			fareIbChildren = formatFareDetails(
				childrenPassengerIbFareDetails
			);
		}
		if (infantPassengers.length > 0) {
			infantPassengerObFareDetails = getFareDetails(
				3,
				ObFareBreakdown
			);
			infantPassengerIbFareDetails = getFareDetails(
				3,
				IbFareBreakdown
			);
			fareObInfant = formatFareDetails(infantPassengerObFareDetails);
			fareIbInfant = formatFareDetails(infantPassengerIbFareDetails);
		}

		resultIndexOb = jQuery('.flights__search').attr(
			'data-ob-result-index'
		);
		resultIndexIb = jQuery('.flights__search').attr(
			'data-ib-result-index'
		);
		isLCCOb =
			jQuery('.flights__search').attr('data-ob-is-lcc') == 'true';
		isLCCIb =
			jQuery('.flights__search').attr('data-ib-is-lcc') == 'true';

		adultBookOb = mapPassengers(adultPassengers, fareObAdult);
		adultBookIb = mapPassengers(adultPassengers, fareIbAdult);

		childBookOb =
			childPassengers.length > 0
				? mapPassengers(childPassengers, fareObChildren)
				: [];
		childBookIb =
			childPassengers.length > 0
				? mapPassengers(childPassengers, fareIbChildren)
				: [];

		infantBookOb =
			infantPassengers.length > 0
				? mapPassengers(infantPassengers, fareObInfant)
				: [];
		infantBookIb =
			infantPassengers.length > 0
				? mapPassengers(infantPassengers, fareIbInfant)
				: [];

		bookFlightPayload = {
			TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
			ResultIndex: [
				{ resultIndexOb: resultIndexOb },
				{ resultIndexIb: resultIndexIb }
			], // This will change
			Passengers: {
				ob: [...adultBookOb, ...childBookOb, ...infantBookOb],
				ib: [...adultBookIb, ...childBookIb, ...infantBookIb]
			},
			return: 'true',
			isLCC: [{ isLCCOb: isLCCOb }, { isLCCIb: isLCCIb }]
		};
	}
	else {
		adultPassengerOwFareDetails = getFareDetails(1, OwFareBreakdown);
		fareOwAdult = formatFareDetails(adultPassengerOwFareDetails);

		let fareOwChildren, fareOwInfant;

		if (childPassengers.length > 0) {
			childrenPassengerOwFareDetails = getFareDetails(
				2,
				OwFareBreakdown
			);
			fareOwChildren = formatFareDetails(
				childrenPassengerOwFareDetails
			);
		}
		if (infantPassengers.length > 0) {
			infantPassengerOwFareDetails = getFareDetails(
				3,
				OwFareBreakdown
			);
			fareOwInfant = formatFareDetails(infantPassengerOwFareDetails);
		}

		resultIndexOw =
			jQuery('.flights__search').attr('data-result-index');
		isLCC = jQuery('.flights__search').attr('data-lcc') == 'true';

		adultBookOw = mapPassengers(adultPassengers, fareOwAdult);

		childBookOw =
			childPassengers.length > 0
				? mapPassengers(childPassengers, fareOwChildren)
				: [];

		infantBookOw =
			infantPassengers.length > 0
				? mapPassengers(infantPassengers, fareOwInfant)
				: [];

		bookFlightPayload = {
			TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
			ResultIndex: [{ resultIndexOw: resultIndexOw }], // This will change
			Passengers: {
				ow: [...adultBookOw, ...childBookOw, ...infantBookOw]
			},
			return: 'false',
			isLCC: isLCC
		};
	}
}

function enableDropDownFlights() {
    // Adding the hover and click on the Dropdown
    sortByElement = jQuery('.flights-select-sort-by');
    dropdownItems = jQuery('.flights__dropdown-menu .dropdown-item');
    selectedTextElement = jQuery('.flights-select-sort-by span');

    // Toggle dropdown on click
    sortByElement.on('click', function(event) {
        jQuery(this).toggleClass('active');
        event.stopPropagation();
    });

    // Show dropdown on hover
    sortByElement.on('mouseenter', function() {
        jQuery(this).addClass('active');
    });

    // Hide dropdown when mouse leaves
    sortByElement.on('mouseleave', function() {
        jQuery(this).removeClass('active');
    });

    // Prevent dropdown items from closing the menu and update the selected text
    dropdownItems.on('click', function(event) {
        event.stopPropagation();
        selectedTextElement.text(jQuery(this).text());
        sortByElement.removeClass('active');

        // Check the id of the class
        clickedItem = jQuery(this).attr('id');
        // Select all flight cards
        flightCards = Array.from(document.querySelectorAll('.flight__card'));
        // Get the container element that holds the flight cards
        container = document.querySelector('.flights__search__results-container');

        // Define a mapping of sorting criteria to their corresponding selectors
        sortingCriteria = {
            'asc': '.flight__card__body__right__price',
            'desc': '.flight__card__body__right__price',
            'mor-night-dep': '.flight__details__dep-time',
            'night-mor-dep': '.flight__details__dep-time',
            'mor-night-arr': '.flight__details__arr-time',
            'night-mor-arr': '.flight__details__arr-time',
            'short-long': '.flight__details__time',
			'long-short': '.flight__details__time',
			'direct-lowest-fare': '.flight__card__body__right__price'
        };

        // Helper function to convert time string to minutes since midnight
        function timeStringToMinutes(timeString) {
            if (!timeString || typeof timeString !== 'string') return NaN;
            timeString = timeString.toLowerCase().replace('.', '').replace('.', '');
            let [time, modifier] = timeString.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'pm' && hours !== 12) hours += 12;
            else if (modifier === 'am' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        }

        // Helper function to convert duration string to total minutes
        function durationStringToMinutes(durationString) {
            if (!durationString || typeof durationString !== 'string') return NaN;
            matches = durationString.match(/(\d+)\s*h\s*(\d+)\s*m/);
            if (!matches) return NaN;
            hours = parseInt(matches[1], 10);
            minutes = parseInt(matches[2], 10);
            return hours * 60 + minutes;
        }

        function sortFlightCards(what, order) {
			flightCards = Array.from(document.querySelectorAll('.flight__card'));
			let priceA, priceB, timeA, timeB;
            container = document.querySelector('.flights__search__results-container');
            if (!container) return;
            if (what == 'price') {
                flightCards.sort((a, b) => {
                    priceA = parseInt(a.querySelector('.flight__card__body__right__price').getAttribute('flight-price'), 10);
                    priceB = parseInt(b.querySelector('.flight__card__body__right__price').getAttribute('flight-price'), 10);
                    return order === 'asc' ? priceA - priceB : priceB - priceA;
                });
            } else if (what == 'dep') {
                flightCards.sort((a, b) => {
                    timeA = timeStringToMinutes(a.querySelector('.flight__details__dep-time').textContent);
                    timeB = timeStringToMinutes(b.querySelector('.flight__details__dep-time').textContent);
                    return order === 'mor-night-dep' ? timeA - timeB : timeB - timeA;
                });
            } else if (what == 'arr') {
                flightCards.sort((a, b) => {
                    timeA = timeStringToMinutes(a.querySelector('.flight__details__arr-time').textContent);
                    timeB = timeStringToMinutes(b.querySelector('.flight__details__arr-time').textContent);
                    return order === 'mor-night-arr' ? timeA - timeB : timeB - timeA;
                });
            } else if (what == 'duration') {
                flightCards.sort((a, b) => {
                    timeA = durationStringToMinutes(a.querySelector('.flight__details__time').textContent);
                    timeB = durationStringToMinutes(b.querySelector('.flight__details__time').textContent);
                    return order === 'short-long' ? timeA - timeB : timeB - timeA;
                });
			}
			else if (what === 'direct-lowest-fare') {
				flightCards.sort((a, b) => {
					let isDirectA = a.classList.contains('direct-flight');
					let isDirectB = b.classList.contains('direct-flight');
	
					if (isDirectA && !isDirectB) return -1;
					if (!isDirectA && isDirectB) return 1;
	
					let priceA = parseInt(a.querySelector('.flight__card__body__right__price').getAttribute('flight-price'), 10);
					let priceB = parseInt(b.querySelector('.flight__card__body__right__price').getAttribute('flight-price'), 10);
					return priceA - priceB;
				});
			} 
            container.innerHTML = '';
            flightCards.forEach(card => container.appendChild(card));
        }

        switch (clickedItem) {
            case 'low__high-price-flight':
                sortFlightCards('price', 'asc');
                break;
            case 'high__low-price-flight':
                sortFlightCards('price', 'desc');
                break;
            case 'mor__night-dep-flight':
                sortFlightCards('dep', 'mor-night-dep');
                break;
            case 'night__mor-dep-flight':
                sortFlightCards('dep', 'night-mor-dep');
                break;
            case 'mor__night-arr-flight':
                sortFlightCards('arr', 'mor-night-arr');
                break;
            case 'night__mor-arr-flight':
                sortFlightCards('arr', 'night-mor-arr');
                break;
            case 'short__long-flight':
                sortFlightCards('duration', 'short-long');
                break;
            case 'long__short-flight':
                sortFlightCards('duration', 'long-short');
				break;
			case 'direct__lowest-fare-flight':
				sortFlightCards('direct-lowest-fare', 'asc');
				break;
        }
    });

    // Close the dropdown if clicked outside
    jQuery(document).on('click', function(event) {
        if (!sortByElement.is(event.target) && sortByElement.has(event.target).length === 0) {
            sortByElement.removeClass('active');
        }
    });
}

function initializeAutocomplete(inputId, latInputId, lngInputId, callback, retryCount = 0, maxRetries = 10, retryDelay = 1000) {
    input = document.getElementById(inputId || "ai__search");
	liveLocationInfo = localStorage.getItem('liveLocationInfo');
    if (liveLocationInfo) {
        liveLocationInfo = JSON.parse(liveLocationInfo);
        latitude = liveLocationInfo.latitude;
        longitude = liveLocationInfo.longitude;
        center = { lat: latitude, lng: longitude };
    }
    else {
        center = { lat: 50.064192, lng: -130.605469 };
    }
    // Create a bounding box with sides ~10km away from the center point
    defaultBounds = {
        north: center.lat + 0.1,
        south: center.lat - 0.1,
        east: center.lng + 0.1,
        west: center.lng - 0.1,
    };
    options = {
        bounds: defaultBounds,
        fields: ["address_components", "geometry", "icon", "name"],
        strictBounds: false
    };
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        autocomplete = new google.maps.places.Autocomplete(input, options);
        autocomplete.addListener("place_changed", function() {
			place = this.getPlace();
			console.log(place);
            placeNCity = placeName(place); // Assuming you have a function placeName defined
            city = '';
            state = '';
            country = '';
            for (let i = 0; i < place.address_components.length; i++) {
                const component = place.address_components[i];
                if (component.types.includes('locality')) {
                    city = component.long_name;
                } else if (component.types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                } else if (component.types.includes('country')) {
                    country = component.long_name;
                }
            }
            // Default input updates
            jQuery('#' + (inputId || "ai__search")).val(placeNCity);
            jQuery('#' + (latInputId || "addListing-address-lat")).val(place.geometry.location.lat()).attr('value', place.geometry.location.lat());
            jQuery('#' + (lngInputId || "addListing-address-long")).val(place.geometry.location.lng()).attr('value', place.geometry.location.lng());
            // Handle specific cases
            switch (inputId) {
                case 'share__location-find':
                    fetchPosts(
                        {
                            feedsType: 'FIND BUDDY VIEW RELATED',
                            location: placeNCity.split(',')[0],
                            pageNumber: 0,
                            postId: 0,
                            totalItems: 0,
                            userId: manageUserProfile('read', 'userId'), // Make sure manageUserProfile is defined
                            locationLat: place.geometry.location.lat(),
                            locationLng: place.geometry.location.lng()
                        },
                        '.popup__master--findBuddySimilar .popup__body',
                        'findBuddyRelated'
                    );
                    break;
                case 'editPlaces':
                    jQuery('#editPlaces').val('');
                    jQuery('.editPlaces__search-results').append(
                        '<div class="profileInterests__interest profileInterests__trips">' +
                        '  <div class="remove__place">' + icons.cross + '</div>' + // Make sure 'icons' is defined
                        '  <input type="text" class="hidden" name="place"  value="' + place.name + '">' +
                        '  <input type="number" class="hidden" name="latitude" value="' + place.geometry.location.lat() + '">' +
                        '  <input type="number" class="hidden" name="longitude" value="' + place.geometry.location.lng() + '">' +
                        '  ' + icons.location + ' ' + place.name +
                        '</div>'
                    );
                    break;
                case 'addListing-address1':
                    place.address_components.forEach(function(component) {
                        switch (component.types[0]) {
                            case 'locality':
                                jQuery('#addListing-address-city').val(component.long_name);
                                break;
                            case 'administrative_area_level_1':
                                jQuery('#addListing-address-state').val(component.long_name);
                                break;
                            case 'country':
                                jQuery('#addListing-address-country').val(component.long_name);
                                break;
                            case 'postal_code':
                                jQuery('#addListing-address-pincode').val(component.long_name);
                                break;
                            case 'sublocality_level_1':
                                jQuery('#addListing-address-area').val(component.long_name);
                                break;
                            case 'sublocality_level_2':
                                jQuery('#addListing-address-line-2').val(component.long_name);
                                break;
                        }
                    });
                    jQuery('#addListing-address-lat').val(place.geometry.location.lat());
                    jQuery('#addListing-address-long').val(place.geometry.location.lng());
                    break;
                default:
                    if (callback) {
                        callback(placeNCity, place.geometry.location.lat(), place.geometry.location.lng(), city, state, country);
                    }
            }
        });
        console.log('Autocomplete initialized successfully.');
    } else {
        if (retryCount < maxRetries) {
            console.log('Google Maps Places not loaded. Retrying ' + (retryCount + 1) + '/' + maxRetries + '...');
            setTimeout(function() {
                initializeAutocomplete(inputId, latInputId, lngInputId, callback, retryCount + 1, maxRetries, retryDelay);
            }, retryDelay);
        } else {
            console.error('Failed to initialize Google Maps Places Autocomplete after maximum retries.');
        }
    }
}

function setGender(inputId, gender, button) {
    // Set the value of the hidden input
    document.getElementById(inputId).value = gender;

    // Remove the active class from all gender buttons
    buttons = button.parentElement.querySelectorAll('.gender-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));

    // Add the active class to the clicked button
    button.classList.add('selected');
}

function convertMinutesToHours(minutes) {
    hours = Math.floor(minutes / 60);
    remainingMinutes = minutes % 60;
    return `${hours} h ${remainingMinutes} m`;
}

function airportPicker(data, where) {
	
	let $sourceDropdown = $('#sourceDropdown');
	let $destinationDropdown = $('#destinationDropdown');
	let $sourceInput = $('#sourceInput'); // Define the source input element
	let $destinationInput = $('#destinationInput'); // Define the destination input element
	
	// Mock flight data
	let flights = data;
	console.log(flights);
	
	let liveLocationInfo = localStorage.getItem('liveLocationInfo');
		liveLocationInfo = liveLocationInfo
			? JSON.parse(liveLocationInfo)
		: null;
	
	let countryCode = 'IN';
	if (liveLocationInfo && liveLocationInfo != null) {
		countryCode = liveLocationInfo.country_code ? liveLocationInfo.country_code : 'IN';
	}
		
	// Sort the array to show Indian airports first
	flights.sort((a, b) => {
		if (a.country_code === countryCode && b.country_code !== countryCode) {
			return -1;
		}
		if (a.country_code !== countryCode && b.country_code === countryCode) {
			return 1;
		}
		return 0;
	});

	console.log(flights);
	
	function showDropdown(inputElement, $dropdown, flightIcon) {
		inputElement = jQuery('#' + inputElement);
		let value = inputElement.val().toLowerCase();
		$dropdown.empty();
		if (value) {
			flights.forEach(flight => {
				let $item = $('<div></div>')
					.addClass('dropdown-item-airport-list')
					.html(flightIcon + flight.city_name + '<br><br>' + flight.airport_name + '<span class="country-text">' + flight.airport_code + '</span>')
					.on('click', function () {
						airportSearchContainer = inputElement.parents('.airport__search-container');
						
						inputElement.val(flight.city_name + ', ' + flight.airport_name);
						airportSearchContainer.attr('airport-code', flight.airport_code);
						airportSearchContainer.attr('airport-name', flight.airport_name);
						airportSearchContainer.attr('city-name', flight.city_name);
						airportSearchContainer.attr('country-name', flight.country_name);
						airportSearchContainer.attr('latitude', flight.lat);
						airportSearchContainer.attr('longitude', flight.lng);
						airportSearchContainer.attr('timezone', flight.airport_timezone);
						airportSearchContainer.attr('city-code', flight.city_code);
						airportSearchContainer.attr('country-code', flight.country_code);

						$dropdown.hide();
					});
				$dropdown.append($item);
			});
			$dropdown.show();
		} else {
			$dropdown.hide();
		}
	}

	showDropdown(where, where == 'sourceInput' ? $sourceDropdown : $destinationDropdown, where == 'sourceInput' ? icons.takeOff : icons.landing);
	
	// Hide dropdown when clicking outside
	$(document).on('click', function (event) {
		if (!$sourceInput.is(event.target) && !$sourceDropdown.is(event.target) && $sourceDropdown.has(event.target).length === 0) {
			$sourceDropdown.hide();
		}
		if (!$destinationInput.is(event.target) && !$destinationDropdown.is(event.target) && $destinationDropdown.has(event.target).length === 0) {
			$destinationDropdown.hide();
		}
	});
}

function hotelCityPicker(data, where) {
    let $sourceDropdown = $('#cityDropdown');
    // Mock city data
	let cities = data;
	let $sourceInput = $('#hotelSourceInput'); // Define the source input element

    function showDropdown(inputElement, $dropdown) {
        inputElement = jQuery('#' + inputElement);
        let value = inputElement.val().toLowerCase();
        $dropdown.empty();
        if (value) {
            cities.forEach(city => {
                if (city.Name.toLowerCase().includes(value)) {
                    let $item = $('<div></div>')
                        .addClass('dropdown-item-airport-list')
                        .html(city.Name)
                        .attr('data-code', city.Code)
                        .on('click', function () {
							let citySearchContainer = inputElement.parents('.city__search-container');
							jQuery('#hotelSourceInput').data('city', city);
							
							// Call the API to fetch the Hotel codes from HotelCodeList
							jsInit('getHotelCodes', { cityCode: city.Code, isBeforeSearch: true }, 'hotelCodes');

                            inputElement.val(city.Name);
                            citySearchContainer.attr('city-code', city.Code);

                            $dropdown.hide();
                        });
                    $dropdown.append($item);
                }
            });
            $dropdown.show();
        } else {
            $dropdown.hide();
        }
    }

    showDropdown(where, $sourceDropdown);

    // Hide dropdown when clicking outside
    $(document).on('click', function (event) {
        if (!$sourceInput.is(event.target) && !$sourceDropdown.is(event.target) && $sourceDropdown.has(event.target).length === 0) {
            $sourceDropdown.hide();
        }
    });
}

function showFlightsLoaders(which) {
	if (which == 'search') {
		holdHorsesText = 'Hold on, we are fetching flights for you';
		animHeight = 250;
		animationPath = '/view/assets/img/flights_loader.json';
	}
	else if (which == 'couponApplied') {
		holdHorsesText = 'Coupon Applied 🥳🤩';
		animHeight = 420;
		animationPath = '/view/assets/img/balloon_anim.json';
	}
	else if (which == 'fareRule') {
		holdHorsesText = 'Confiriming Final Fare with the Airline.';
		animHeight = 250;
		animationPath = '/view/assets/img/flights_loader.json';
	}
	else if (which == 'ssr') {
		holdHorsesText = 'Fetching Ancillary Services';
		animHeight = 250;
		animationPath = '/view/assets/img/flights_loader.json';
	}
	else if (which == 'book') {
		holdHorsesText = 'Booking your flight';
		animHeight = 250;
		animationPath = '/view/assets/img/flights_loader.json';
	}
	else if (which == 'bookHistory') {
		holdHorsesText = 'Fetching Booking History';
		animHeight = 250;
		animationPath = '/view/assets/img/flights_loader.json';
	}
	else if (which == 'calculatePrice') {
		holdHorsesText = 'Calculating Total Ticket Price';
		animHeight = 250;
		animationPath = '/view/assets/img/flights_loader.json';
	}
	else if (which == 'loginSearch') {
		holdHorsesText = 'Refreshing Flight Information';
		animHeight = 250;
		animationPath = '/view/assets/img/flights_loader.json';
	}
	else if (which == 'getCancellationCharges') {
		holdHorsesText = 'Fetching Cancellation Charges';
		animHeight = 250;
		animationPath = '/view/assets/img/flights_loader.json';
	}
	else if (which == 'cancelTicket') {
		holdHorsesText = 'Cancelling Ticket';
		animHeight = 250;
		animationPath = '/view/assets/img/flights_loader.json';
	}
	
	if (jQuery('body').hasClass('fullDesktop') && which != 'couponApplied') {
		animHeight = 450;
	}
	
	jQuery('body').prepend(
		'<div class="global__loading flights"><div class="feed__loading" id="lottie__loading" style="width: 100%; height: ' + animHeight + 'px;"><div class="hold__horses">' + holdHorsesText +' </div></div></div>'
	);
	if (which != 'couponApplied') {
		jQuery('.global__loading').css(
			'background',
			'url(/view/assets/img/login-bg.jpg) no-repeat center center fixed'
		);
	}
	
	if (which == 'book') {
        jQuery('.global__loading').append(`
            <div class="support__message-flights">
                If you face any issues, feel free to contact us on WhatsApp at
                <a href="https://wa.me/8076922474" style="color: #1E1E2D;">+91-8076922474</a>
                or send us an email at
                <a href="mailto:support@beatravelbuddy.com" style="color: #1E1E2D;">support@beatravelbuddy.com</a>
            </div>
        `);
    } 

	loadLottieAnimation('lottie__loading', animationPath);
	
}

// Function to update the coupon code inside #flightCouponApply
function updateCouponCode() {
    let selectedRadio = jQuery('input[name="flightsCoupon"]:checked');
    if (selectedRadio.length > 0) {
        let couponCode = selectedRadio.parent('label.flight__coupon-item').find('.flight__coupon-details').attr('coupon-code');
        // Update the coupon code inside #flightCouponApply
		
        jsInit('validateCoupon', { 'couponCode': couponCode, 'couponFor': 'flight', 'noOfTickets': 1, 'cartValue': jQuery('.bill-details__handling-charges').attr('conv-charges')}, 'couponValidationFlights');
        console.log('Coupon applied:', couponCode);
    } else {
        console.log('No coupon selected');
    }
}

function showTotalFlightFare(from, val) {
	// We have the selected Flight Response in a variable called 'selFlightData'
	// Inside we have a node 'allFlightData', which contains the selected flight data as flightDataForIb and flightDataForOb in case of a return flight and directly in case of a one-way flight.
	
	let isReturn = jQuery('.flights__search').attr('data-return') === 'true';
	let fareData = selFlightData.allFlightData;

	let calculateFare = function(data) {
		return data.Fare.BaseFare + data.Fare.Tax + data.Fare.OtherCharges + data.Fare.ServiceFee + data.Fare.AdditionalTxnFeePub;
	};

	let totalFare = isReturn 
		? calculateFare(fareData.flightDataForOb) + calculateFare(fareData.flightDataForIb) 
		: calculateFare(fareData);

	let onlyBaseFare = isReturn
		? fareData.flightDataForOb.Fare.BaseFare + fareData.flightDataForIb.Fare.BaseFare
		: fareData.Fare.BaseFare;

	let totalTax = totalFare - onlyBaseFare;
	
	if (from == 'getConvenienceFee') {
        return totalFare;
    }
	else {
		// When the user Selects any flight this gets triggered and updates the total fare
		totalFare += val;
        jQuery('.bill-details__grand-total').attr('data-total', Math.ceil(totalFare));
        jQuery('.flights__bill-details').text('₹' + Math.ceil(onlyBaseFare));
		jQuery('.bill-details__taxes-surcharges').text('₹' + Math.ceil(totalTax));
		jQuery('.flights__final-amount').attr('data-final-amount', Math.ceil(totalFare));
		jQuery('.flights__footer-price').attr('total-price', Math.ceil(totalFare));
        jQuery('.flights__final-amount').text('₹' + Math.ceil(totalFare));
        jQuery('.flights__footer-price .price').text(jQuery('.flights__final-amount').text());
		let totalPaxCount = Number(jQuery('#travelDetails-adults').val()) + Number(jQuery('#travelDetails-children').val()) + Number(jQuery('#travelDetails-infants').val());
		jQuery('.flights__footer-price .pax').text(totalPaxCount + ' Travellers');
    }
}

// Function to set the min attribute of all date input fields inside passport__issue-date
function setMinDateForPassportInputs(minDate) {
	document.querySelectorAll('.passport__expiry input[type="date"]').forEach((input) => {
		input.setAttribute('min', minDate);
	});
}

// Function to set the Default values in Source and Destination
function setDefaultSourceDestination() {
	
	let sourceInput = jQuery('#sourceInput');
	let destinationInput = jQuery('#destinationInput');
	
	let sourceDiv = sourceInput.closest('.airport__search-container');
	let destinationDiv = destinationInput.closest('.airport__search-container');
	
	sourceInput.val('Delhi, Indira Gandhi International Airport');
	destinationInput.val('Mumbai, Chhatrapati Shivaji Maharaj International Airport');
	
	
	sourceDiv.attr({
        'airport-code': 'DEL',
        'airport-name': 'Indira Gandhi Airport',
        'city-name': 'Delhi',
        'country-name': 'India',
        'latitude': '28.5551678',
        'longitude': '77.08473848',
        'timezone': 'Asia/Kolkata',
        'city-code': 'DEL',
        'country-code': 'IN'
	});
	
	destinationDiv.attr({
		'airport-code': 'BOM',
		'airport-name': 'Chhatrapati Shivaji Maharaj International Airport',
		'city-name': 'Mumbai',
		'country-name': 'India',
		'latitude': '19.0901',
		'longitude': '72.8637',
		'timezone': 'Asia/Kolkata',
		'city-code': 'BOM',
		'country-code': 'IN'
	});
}

/**
 * Auto-fill the flight search form from URL query
 * params and trigger search programmatically.
 *
 * Expected URL format (from fare estimator):
 *   /flights-search?origin=DEL&destination=BOM
 *     &date=2026-02-14T07:00:00&cabinClass=1
 *     &adults=1&children=0&infants=0
 */
function prefillAndSearchFromUrl() {
	var params = new URLSearchParams(
		window.location.search,
	);
	var origin = (params.get('origin') || '')
		.trim().toUpperCase();
	var destination = (params.get('destination') || '')
		.trim().toUpperCase();
	var dateRaw = params.get('date') || '';
	var cabinClassParam = params.get('cabinClass') || '1';
	var adults = parseInt(
		params.get('adults') || '1', 10,
	);
	var children = parseInt(
		params.get('children') || '0', 10,
	);
	var infants = parseInt(
		params.get('infants') || '0', 10,
	);

	// Require at least origin, destination and date
	if (!origin || !destination || !dateRaw) return;

	// Cabin class mapping:
	// Fare estimator -> Flight search form
	var cabinMap = {
		'2': '2',  // Economy
		'3': '3',  // Premium Economy
		'4': '4',  // Business
		'5': '5',  // Premium Business
		'6': '6',  // First Class
	};
	var cabinLabelMap = {
		'2': 'Economy',
		'3': 'Premium Economy',
		'4': 'Business',
		'5': 'Premium Business', 
		'6': 'First Class',
	};
	var mappedCabin = cabinMap[cabinClassParam] || '2';

	// Parse date: "2026-02-14T07:00:00" -> "2026-02-14"
	var depDateValue = dateRaw.split('T')[0];

	// Poll until both the form DOM and allAirports
	// data are ready (form renders after ~150ms,
	// allAirports arrives from API).
	var attempts = 0;
	var maxAttempts = 20; // 20 × 200ms = 4s max wait

	var pollInterval = setInterval(function () {
		attempts++;

		var formReady =
			jQuery('#flightSearchForm').length > 0;
		var airportsReady =
			typeof allAirports !== 'undefined' &&
			allAirports &&
			allAirports.length > 0;

		if (!formReady || !airportsReady) {
			if (attempts >= maxAttempts) {
				clearInterval(pollInterval);
				console.warn(
					'[FlightSearch] Timed out waiting' +
					' for form/airport data.',
				);
			}
			return;
		}

		// Both ready — stop polling
		clearInterval(pollInterval);

		// Look up airports from the global list
		var srcAirport = allAirports.find(function (a) {
			return a.airport_code === origin;
		});
		var destAirport = allAirports.find(function (a) {
			return a.airport_code === destination;
		});

		if (!srcAirport || !destAirport) {
			console.warn(
				'[FlightSearch] Could not find ' +
				'airport data for ' +
				origin + ' or ' + destination,
			);
			return;
		}

		// --- Fill Source ---
		var $srcInput = jQuery('#sourceInput');
		var $srcContainer = $srcInput.closest(
			'.airport__search-container',
		);
		$srcInput.val(
			srcAirport.city_name + ', ' +
			srcAirport.airport_name,
		);
		$srcContainer.attr({
			'airport-code': srcAirport.airport_code,
			'airport-name': srcAirport.airport_name,
			'city-name': srcAirport.city_name,
			'country-name': srcAirport.country_name,
			'latitude': srcAirport.lat || '',
			'longitude': srcAirport.lng || '',
			'timezone':
				srcAirport.airport_timezone || '',
			'city-code': srcAirport.city_code || '',
			'country-code':
				srcAirport.country_code || '',
		});

		// --- Fill Destination ---
		var $destInput = jQuery('#destinationInput');
		var $destContainer = $destInput.closest(
			'.airport__search-container',
		);
		$destInput.val(
			destAirport.city_name + ', ' +
			destAirport.airport_name,
		);
		$destContainer.attr({
			'airport-code': destAirport.airport_code,
			'airport-name': destAirport.airport_name,
			'city-name': destAirport.city_name,
			'country-name': destAirport.country_name,
			'latitude': destAirport.lat || '',
			'longitude': destAirport.lng || '',
			'timezone':
				destAirport.airport_timezone || '',
			'city-code': destAirport.city_code || '',
			'country-code':
				destAirport.country_code || '',
		});

		// --- Fill Date ---
		jQuery('#depDate').val(depDateValue);
		jQuery('.date__text-dep').text(
			formatDateWithSuffix(depDateValue),
		);

		// --- Fill Passengers ---
		jQuery('#travelDetails-adults').val(
			adults || 1,
		);
		jQuery('#travelDetails-children').val(
			children || 0,
		);
		jQuery('#travelDetails-infants').val(
			infants || 0,
		);

		// --- Fill Cabin Class ---
		jQuery('#travelDetails-cabin').val(mappedCabin);

		// Update pax/class display label
		var totalPax = (adults || 1) +
			(children || 0) + (infants || 0);
		var cabinLabel =
			cabinLabelMap[mappedCabin] || 'Economy';
		jQuery('.pax__class-label').text(
			totalPax + ' Travellers | ' + cabinLabel,
		);

		// Ensure One Way is selected
		jQuery('#one__way-flight').prop(
			'checked', true,
		).trigger('change');

		// --- Trigger Search ---
		console.log(
			'[FlightSearch] Auto-searching: ' +
			origin + ' → ' + destination +
			' on ' + depDateValue,
		);
		// Small delay to let any UI settle
		setTimeout(function () {
			jQuery('.search__flight').click();
		}, 100);
	}, 200);
}

function addConvinienceFee() {
	return 300;
}

function getTotalPaxCount() {
	return ( parseInt(jQuery('#travelDetails-adults').val()) + parseInt(jQuery('#travelDetails-children').val()) + parseInt(jQuery('#travelDetails-infants').val()) );
}

function callMoengageEventsForFlights(eventName, payload) {
	try {
		// if (!window.location.href.includes('localhost') && !window.location.href.includes('dev.') && !isAndroid()) {
		// 	Moengage.track_event(eventName, payload);
		// }
		// else if (isAndroid()) {
		// 	Android.moEngageData(eventName, JSON.stringify(payload));
		// }
	} catch (error) {
		console.log(error);		
	}
}

function searchFlights(from) {

	
	let flightType = jQuery('input[name="flightType"]:checked').val();
	let sourceCode = $('#sourceInput').parents('.airport__search-container').attr('airport-code').trim();
	let destinationCode = $('#destinationInput').parents('.airport__search-container').attr('airport-code').trim();
	let cabinClass = jQuery('#travelDetails-cabin').val();
	let depDate = from == 'dateChange' ? jQuery('#flight__head-date').val()
	+ 'T00:00:00' : jQuery('#depDate').val() + 'T00:00:00';
	let returnDate = jQuery('#returnDate').val() + 'T00:00:00';
	let sourceCountry = jQuery('#sourceInput').parents('.airport__search-container').attr('country-name').trim();
	let destinationCountry = jQuery('#destinationInput').parents('.airport__search-container').attr('country-name').trim();
	let isInternational = (sourceCountry != 'India' || destinationCountry != 'India');
	
	if (flightType == '2' && !jQuery('#returnDate').val()) {
		toast('Please select a return date');
		return;
	}
	
	let segments = [
		{
			Origin: sourceCode,
			Destination: destinationCode,
			FlightCabinClass: cabinClass,
			PreferredDepartureTime: depDate,
			PreferredArrivalTime: depDate
		}
	];
	
	if (flightType == '2') {
		segments.push({
			Origin: destinationCode,
			Destination: sourceCode,
			FlightCabinClass: cabinClass,
			PreferredDepartureTime: returnDate,
			PreferredArrivalTime: returnDate
		});
	}
	
	searchFlightPayload = {
		AdultCount: Number(jQuery('#travelDetails-adults').val()),
		ChildCount: Number(jQuery('#travelDetails-children').val()),
		InfantCount: Number(jQuery('#travelDetails-infants').val()),
		DirectFlight: false,
		OneStopFlight: false,
		isInternational: isInternational,
		JourneyType: flightType,
		Segments: segments,
		ResultFareType: 2
	};

	
	// Not removing and adding a fresh screen as we just want to show updated Flights results for Date change 
	let searchFrom = '';
	if (from == 'dateChange') {
		searchFrom = 'head';
	}
	else if (from == 'searchFlightsAfterLogin') {
		searchFrom = 'login';
	}
	else if (from == 'searchFlightsOnboarding') {
		searchFrom = 'searchFlightsOnboarding';
	}	
	else {
		manageSecondary('show', 'flights');
	}
	
	if (from != 'searchFlightsAfterLogin' || from != 'searchFlightsOnboarding') {
		showHidePaxReviewSheet('hide');
		callMoengageEventsForFlights('searchFlight', searchFlightPayload);
		showFlightsLoaders('search');
		
	}
	
	jsInit('tboSearchFlights', searchFlightPayload, {
		source: sourceCode,
		destination: destinationCode,
		depDate: jQuery('#depDate').val(),
		returnDate: jQuery('#returnDate').val(),
		cabinClass: jQuery('.pax__class-label').text().split('|')[1].trim(),
		totalPax: jQuery('.pax__class-label').text().split('|')[0].trim(),
		sourceCountry: sourceCountry ,
		destinationCountry: destinationCountry,
		searchFrom: searchFrom
	});
	
	fbEvent('flightsSearch');

}

function isInternationalFlight() {
    return jQuery('.flights__search').attr('data-international') === 'true';
}

function callFlightsFareQuote(payload, element) {
    /*if (isInternationalFlight()) {
        payload.isInternational = true;
    }*/
    jsInit('tboFareQuote', payload, element);
}

function showHideFooterMenu(action) {
	jQuery('#footer').toggle(action === 'show');	
}

function getDestinationSelector() {
	let useCustomDestination = true;
	let destinationSelector = '';
	if (useCustomDestination) {
		destinationSelector = 'enquiry_custom_dest';
	}
	else {
		destinationSelector = 'enquiry_dest';
	}
	return destinationSelector;
}

function formatDateWithSuffix(dateString) {
    let date = new Date(dateString);
    let day = date.getDate();
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let month = monthNames[date.getMonth()];
    let year = date.getFullYear().toString().slice(-2);

    let getDayWithSuffix = (day) => {
        if (day > 3 && day < 21) return `${day}th`;
        switch (day % 10) {
            case 1: return `${day}st`;
            case 2: return `${day}nd`;
            case 3: return `${day}rd`;
            default: return `${day}th`;
        }
    };

    return `${getDayWithSuffix(day)} ${month}, ${year}`;
}

function clearFlightsFilter() {
	console.log('Reset Filter Clicked');
		
	// Empty the flightsFilterPayload
	flightsFilterPayload = {};
	console.log('Flights Filter Payload', flightsFilterPayload);
	jQuery('.flights-filter').attr('data-filter-applied', 'false');
	jQuery('.flights-count').text('Showing ' + jQuery('.flight__card').length + ' Flights');
}

function showGstInputsPreFilled() {
	// Show the GST input fields
	jQuery('#gstContainer').html(appendGSTInput()).slideDown();
		
	if (jQuery('#ticketing__phone').val() != '') {
		jQuery('#gstContactNumber').val(jQuery('#ticketing__phone').val());
	}
	if (jQuery('#ticketing__email').val() != '') {
		jQuery('#gstEmail').val(jQuery('#ticketing__email').val());
	}
}

function getConvenienceChargesFlights() {
	let getTotalPriceFlight = showTotalFlightFare('getConvenienceFee');
	var passengerCount = parseInt(jQuery('#travelDetails-adults').val()) + parseInt(jQuery('#travelDetails-children').val()) + parseInt(jQuery('#travelDetails-infants').val());
	jsInit('getConvenienceCharges', {'totalFare': getTotalPriceFlight, 'noOfPassengers': passengerCount});
	
}

function checkFlightsSessionStatus() {
	// Check session expiry
	if (
		checkSessionStatus.checkExpiry() ===
		'Your session (TraceId) is expired.'
	) {
		//toast("Your session (TraceId) is expired."); --> For Testing
		toast(
			'Please wait while we fetch the updated flights for you.'
		);
		destroyAllSecondaryTabs();
		
		searchFlights('sessionExpired');
		jQuery('#flights__footer').remove();
		return true;
	}
	return false;
}

function callFlightCalendarFare(payload, selectorType) {

	let preferredDepartureTime;
	if (payload == 'init') {
		function getTodayFormattedDate() {
			let today = new Date();
			let year = today.getFullYear();
			let month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
			let day = String(today.getDate()).padStart(2, '0');
		
			return `${year}-${month}-${day}T00:00:00`;
		}
		
		let origin = $('#sourceInput').parents('.airport__search-container').attr('airport-code').trim();
		
		let destination = $('#destinationInput').parents('.airport__search-container').attr('airport-code').trim();
		
		if (selectorType == 'returningDate') {
			origin = $('#destinationInput').parents('.airport__search-container').attr('airport-code').trim();
			destination = $('#sourceInput').parents('.airport__search-container').attr('airport-code').trim();
			
		}
		
		preferredDepartureTime = getTodayFormattedDate();
		payload = {
			"PreferredAirlines": null,
			"Segments": [
				{
					"Origin": origin,
					"Destination": destination,
					"FlightCabinClass": "1",
					"PreferredDepartureTime": preferredDepartureTime,
				}
			],
			"Sources": null
		};
		
	}
	jsInit('getCalendarFares', payload);
}

// This function is used to Un-hide the Pax Details Elements
function showPaxDetailsPage() {
	jQuery('.pax__details-title, .passenger__info, .contact__details, .gst__checkbox, #gstContainer').removeClass('hide');
	
	jQuery('.flightsBookingBack').parent('.drawerHeader').find('.highlight').text('Travel Details');
	
	//jQuery('.bill-details__item.conv__charges').addClass('hide');
}

// This function is used to reduce the final amount by subtracting convenience charges
function reduceFlightsFinalAmount() {
	let finalAmount = Number(jQuery('.flights__final-amount').attr('data-final-amount')) - Number(jQuery('.bill-details__handling-charges').attr('conv-charges'));
	
	jQuery('.flights__final-amount').text(`₹ ${finalAmount}`);
	jQuery('.flights__final-amount').attr('data-final-amount', finalAmount);
}

function getTravellerReviewDetails() {
    let passengers = [];

    let extractPassengerDetails = (paxType, i, isInternational) => {
        let firstName = jQuery(`#${paxType}FirstName${i}`).val();
        let lastName = jQuery(`#${paxType}LastName${i}`).val();
        let dob = jQuery(`#${paxType}dob${i}`).val() ? jQuery(`#${paxType}dob${i}`).val() : '';
        
        let genderElement = document.getElementById(`${paxType}${i}`);
        let selectedButton = genderElement.querySelector('.gender-btn.selected');
        let gender = selectedButton ? selectedButton.getAttribute('data-gender') : null;

        let passportNo = '';
        if (isInternational && jQuery(`#${paxType}passportNumber${i}`).val()) {
            passportNo = jQuery(`#${paxType}passportNumber${i}`).val();
        }
        paxType = paxType.toUpperCase();

        return {
            firstName,
            lastName,
            gender,
            dob,
            passportNo,
            paxType
        };
    };

    let processPassengers = (count, type, isInternational) => {
        for (let i = 0; i < count; i++) {
            passengers.push(extractPassengerDetails(type, i, isInternational));
        }
    };

    let adultCount = Number(jQuery('#travelDetails-adults').val());
    let childCount = Number(jQuery('#travelDetails-children').val());
    let infantCount = Number(jQuery('#travelDetails-infants').val());
    let isInternational = jQuery('.flights__search').attr('international-flight') == 'true';

    processPassengers(adultCount, 'adult', isInternational);
    processPassengers(childCount, 'child', isInternational);
    processPassengers(infantCount, 'infant', isInternational);

    // Extract additional details
    let ticketingEmail = jQuery('#ticketing__email').val();
    let ticketingPhone = jQuery('#ticketing__phone').val();
    let flightsPhoneCountryCode = jQuery('#flights__countryCode').val();
    let ticketingAddress = jQuery('#ticketing__address').val();

    // Add additional details to the passengers object
    let passengerDetails = {
        passengers: passengers,
        ticketingEmail: ticketingEmail,
        ticketingPhone: ticketingPhone,
        flightsPhoneCountryCode: flightsPhoneCountryCode,
        ticketingAddress: ticketingAddress
    };

    return renderBottomSheet(passengerDetails, 'pax-review');
}

function showHidePaxReviewSheet(state) {
	var bottomsheet = document.querySelector('.traveller-details-review__container');
	if (bottomsheet) {
		if (state == 'show') {
			setTimeout(() => {
				bottomsheet.style.transform = 'translateY(0)'; // Show the bottom sheet
			}, 100);
		}
		else {
			bottomsheet.style.transform = 'translateY(100%)'; // Hide the bottom sheet
			setTimeout(() => {
				bottomsheet.remove(); // Remove the bottom sheet from the DOM
				jQuery('.traveller-details-review__overlay').remove(); // Remove the overlay
			}, 1000);
		}
	}
}

let updateFooterContinue = (skipSSRStage, ssrStage, ssrText, skipSSRText) => {
	jQuery('.flights__footer-continue.skipSSR').attr('current-stage', skipSSRStage).text(skipSSRText);
	jQuery('.flights__footer-continue.ssr').attr('current-stage', ssrStage).text(ssrText).show();
};

function removeFlightsSSRPage() {
	jQuery('.flights__SSRPage').parent().remove();
}

function removeFlightsMealPage() {
	jQuery('.flights__MealPage').parent().remove();
}

function callFlightApis() {
	if (checkFlightsSessionStatus()) {
		return;
	}
	
	if (jQuery('.flights__search').attr('data-return') == 'true') {
		//callMoengageEventsForFlights('TBD_FLIGHTS_PROCEED_PAY_WITHOUT_SEAT', selectedFlightForBookingRound);
		callFlightsFareQuote(selectedFlightForBookingRound, 'getFinalAmountRound');
	}
	else {
		//callMoengageEventsForFlights('TBD_FLIGHTS_PROCEED_PAY_WITHOUT_SEAT', selectedFlightForBooking);
		callFlightsFareQuote(selectedFlightForBooking, 'getFinalAmountOw');
		
	}
}

function createPremiumCarousel(images, className) {
    // Create the carousel container
    let carouselContainer = document.createElement('div');
    carouselContainer.className = 'premium-carousel ' + className; ;

    // Create the carousel inner container
    let carouselInner = document.createElement('div');
    carouselInner.className = 'premium-carousel-inner';

    // Add images to the carousel
    images.forEach((imageSrc, index) => {
        let carouselItem = document.createElement('div');
        carouselItem.className = 'premium-carousel-item ' + className;
        if (index === 0) {
            carouselItem.classList.add('active');
        }

        let img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `Slide ${index + 1}`;

        carouselItem.appendChild(img);
        carouselInner.appendChild(carouselItem);
    });

    carouselContainer.appendChild(carouselInner);

    // Create indicators
    let indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'premium-carousel-indicators ' + className;

    images.forEach((_, index) => {
        let indicator = document.createElement('span');
        indicator.className = 'premium-carousel-indicator';
        if (index === 0) {
            indicator.classList.add('active');
        }
        indicatorsContainer.appendChild(indicator);
    });

    carouselContainer.appendChild(indicatorsContainer);

    return carouselContainer;
}

function startAutoSlide(length) {
	var carousel = document.querySelector('.premium-carousel');
	var items = document.querySelectorAll('.premium-carousel-item');
	var currentIndex = 0;

	function scrollToItem(index) {
		if (index >= 0 && index < items.length) {
			var itemWidth = items[index].offsetWidth;
			carousel.scrollTo({
				left: itemWidth * index,
				behavior: 'smooth'
			});
			currentIndex = index;
		}
	}

	// Scroll to the next item
	function scrollNext() {
		if (currentIndex < items.length - 1) {
			scrollToItem(currentIndex + 1);
		}
		else {
			scrollToItem(0); // Loop back to the first item
		}
	}

	// Scroll to the previous item
	function scrollPrev() {
		if (currentIndex > 0) {
			scrollToItem(currentIndex - 1);
		}
	}

	// Example: Automatically scroll to the next item every 3 seconds
	setInterval(scrollNext, 3000);
}

function getFlightsCarouselImages(from) {
	let images = [];
	if (from == 'experiences') {
		images = [
			'/view/assets/img/exp_adv.webp',
			'/view/assets/img/exp_intl.webp',
			'/view/assets/img/exp_reli.webp'
		];
	}
	else if (from == 'landingPage') {
		if (!isAndroid() && !isIOS() && jQuery(window).width() <= 1280) {
			images = [
				'/view/assets/img/app-install.webp',
				'/view/assets/img/lp-find-banner.webp',
				'/view/assets/img/lp-member-banner.webp',
				'/view/assets/img/lp-flights-banner.webp',
			];
		}
		else {
			images = [
				'/view/assets/img/lp-find-banner.webp',
				'/view/assets/img/lp-member-banner.webp',
				'/view/assets/img/lp-flights-banner.webp',
			];
			
		}
	}
	else {
		images = [
			'https://prodmedia.beatravelbuddy.com/Banners/flight_disc.webp'
		];
		
	}
	
	return images;
}

function appendFlightFaresOptions(where, flightData) {
	
	flightData.forEach((flight, index) => {
		let segment = flight.Segments[0][0];
		// Total Fare
		let flightPrice = calculateFinalPrice(flight.Fare, flight.FareBreakdown);
		let fareType = flight.FareClassification.Type;
		let fareInclusion = flight.FareInclusions;
		let flightCode = flight.AirlineCode;
		let resultIndex = flight.ResultIndex;
		let isLcc = flight.IsLCC;
		
		
		let flightOptions =
			`<div class = "flight__fares">
				<div class="flight__fares__title">
					<div class="flight__details__name fareType" fare-type='${fareType}'>${fareType}
					</div>
					<div class="flight__card__body__right">
							<div class="flight__card__body__right__price" flight-price="${flightPrice}">₹ ${flightPrice}</div>
							<div class="flight__card__body__right__pax">per adult</div>
						</div>
				</div>
				<div class="flight__details__container fare-types" data-lcc="${isLcc}" data-result-index = "${resultIndex}" flight-code = "${flightCode}">
					<div class="flight__fare-inclusions">
						<div class = "flight__fare_inclusions-list">
							${renderFareInclusions(fareInclusion)}
						</div>
					</div>
					<div class="flight__card__body">
						<div class="book__flight">Book Now</div>
					</div>
				</div>
			</div>`;
		
		jQuery(where).append(flightOptions);
	});
	
	function renderFareInclusions(fareInclusions) {
		
		// Mock data for fareInclusions
		// Check if the url is localhost or dev
		if (window.location.href.includes('localhost') || window.location.href.includes('dev.')) {
			fareInclusions = [
				'Cabin - Economy',
				'Check-In - 15 kg',
				'Cancellation - Free',
				'Reissue - Free',
				'Seat - Standard',
				'Meal - Veg'
				
			];
		}
		let fareInclusionIcons = {
			"Cabin": icons.handbag,
			"Check-In": icons.luggage,
			"Cancellation": icons.takeOff,
			"Reissue": icons.ticket,
			"Seat": icons.seat,
			"Meal": icons.meal
		};
	
		let fareInclusionsList = '';
		
		// Check if the body class has lightMode
		let lightMode = document.body.classList.contains('lightMode');
		let isLightMode = lightMode ? 'lightMode' : 'darkMode';
	
		fareInclusions.forEach((inclusion, index) => {
			let icon = '';
			for (let key in fareInclusionIcons) {
				if (inclusion.includes(key)) {
					icon = fareInclusionIcons[key];
					break;
				}
			}
			let [title, detail] = inclusion.split(' - ');
			if (!detail) {
				detail = ''; // Set detail to an empty string if undefined
			}
			
			
			let hideDiv = index > 2 ? 'hide show' : ''; // Hide the div if the index is greater than 2
			fareInclusionsList += `<div class="fare__incl-item ${hideDiv} ${isLightMode}">${icon}<div class="fare__incl-title">${title}</div><div class="fare__incl-detail">${detail}</div></div>`;
		});
		if (fareInclusions.length > 3) {
			fareInclusionsList += '<div class="show-more-fare-inclusions">Show More</div>';
		}
		return fareInclusionsList;
	}
	
}

function resetValuesAfterFlightBooking() {
	selectedFlightForBooking = ''; // This will store the selected flight for booking Oneway or all International
	selectedFlightForBookingRound = ''; // This will store the selected flight for booking Domestic Round Trip

	seatSelectedOw = []; // This will store the selected seats for booking Oneway or all International
	seatSelectedIb = []; // This will store the selected seats for Domestic Round Trip ( Inbound )
	seatSelectedOb = []; // This will store the selected seats for Domestic Round Trip ( Outbound )
	mealSelectedOw = []; // This will store the selected meals for booking Oneway or all International
	mealSelectedIb = []; // This will store the selected meals for Domestic Round Trip ( Inbound )
	mealSelectedOb = []; // This will store the selected meals for Domestic Round Trip ( Outbound )
}

function mapAirlineSource(airlineName) {
    let airlineSourceMap = {
        NotSet: 0,
        SpiceJet: 3,
        Amadeus: 4,
        Galileo: 5,
        IndiGo: 6,
        GoAir: 10,
        AirArabia: 13,
        AirIndiaExpress: 14,
        AirIndiaExpressDom: 15,
        FlyDubai: 17,
        AirAsia: 19,
        IndigoCoupon: 24,
        SpiceJetCoupon: 25,
        GoAirCoupon: 26,
        IndigoTBF: 27,
        SpiceJetTBF: 28,
        GoAirTBF: 29,
        IndigoSPLCoupon: 30,
        SpiceJetSPLCoupon: 31,
        GoAirSPLCoupon: 32,
        IndigoCrpFare: 36,
        SpiceJetCrpFare: 37,
        GoAirCrpFare: 38,
        IndigoDstInv: 42,
        SpiceJetDstInv: 43,
        GoAirDstInv: 44,
        AirCosta: 46,
        MalindoAir: 47,
        BhutanAirlines: 48,
        AirPegasus: 49,
        TruJet: 50
    };

    return airlineSourceMap[airlineName] || null; // Return the respective integer or null if not found
}

function getPremiumDescription(premiumType) {
	let premiumFeatures = [];
	switch (premiumType) {
		case 'mini':
			premiumFeatures = [
				{
					title: "AI Buddy",
					description: "Unlock the boundless potential of your travels with our AI Buddy, effortlessly generating limitless itineraries tailored to your preferences and desires.",
					imgSrc: "/view/assets/img/prem-ben-ai.webp"
				},
				{
					title: "INR 500 Discount on Group & Customized Trips",
					description: "Upgrade to our Premium membership today and enjoy exclusive benefits, including an INR 500 discount for you and a buddy on all purchases! 🛍️✨ Max 1 booking allowed.",
					imgSrc: "/view/assets/img/coupon.webp"
				},
				{
					title: "Check Your Profile Visitors",
					description: "Gain exclusive access to your profile visitors, enabling you to connect and network with like-minded travelers",
					imgSrc: "/view/assets/img/prem-ben-pv.webp"
				},
				
			];
			break;
		case 'pro':
			premiumFeatures = [
				{
					title: "Zero Convenience Fees On Flights & Hotels",
					description: "Save Money On Every Booking,Everytime…When You Are Member",
					imgSrc: "/view/assets/img/flight.webp"
				},
				{
					title: "Unlimited AI enabled Travel Plans & Chat",
					description: "Chat with Rhea, our own AI Buddy! Ask for itinearies, Get information about a destination or simply Know about the weather.",
					imgSrc: "/view/assets/img/ai.webp"
				},
				{
					title: "Unlimited Profile Views & Filters",
					description: "Effortlessly filter and discover your perfect travel companion among a diverse array of adventurers",
					imgSrc: "/view/assets/img/views-two.webp"
				}
			];
			break;
		case 'super':
			premiumFeatures = [
				{
					title: "Zero Convenience Fees On Flights & Hotels",
					description: "Save Money On Every Booking,Everytime…When You Are Member",
					imgSrc: "/view/assets/img/flight.webp"
				},
				{
					title: "Unlimited AI enabled Travel Plans & Chat",
					description: "Chat with Rhea, our own AI Buddy! Ask for itinearies, Get information about a destination or simply Know about the weather.",
					imgSrc: "/view/assets/img/ai.webp"
				},
				{
					title: "Unlimited Profile Views & Filters",
					description: "Effortlessly filter and discover your perfect travel companion among a diverse array of adventurers",
					imgSrc: "/view/assets/img/views-two.webp"
				},
				{
					title: "INR 500 Flat Discount on Group Trip (One Time)",
					description: "Join any eligible group trip and get an instant ₹500 off—no minimums, no fuss.",
					imgSrc: "/view/assets/img/coupon.webp"
				},
				{
					title: "Exclusive Invites to Meet-ups (Online & Offline) to meet fellow travelers",
					description: "Members-only events to connect with real travelers, swap tips, and make plans together.",
					imgSrc: "/view/assets/img/meetup.webp"
				},
			];
			break;
		case 'luxe':
			premiumFeatures = [
				{
					title: "Zero Convenience Fees On Flights & Hotel",
					description: "As LUXE Member you save money on every flight booking.",
					imgSrc: "/view/assets/img/flight.webp"
				},
				{
					title: "Unlimited AI enabled Travel Plans & Chat",
					description: "Chat with Rhea, our own AI Buddy! Ask for itinearies, Get information about a destination or simply Know about the weather.",
					imgSrc: "/view/assets/img/ai.webp"
				},
				{
					title: "Unlimited Profile Views & Filters",
					description: "Discover the right travel buddies faster with powerful search and advanced filters.",
					imgSrc: "/view/assets/img/views-two.webp"
				},
				{
					title: "INR 500 Flat Discount on Group Trip (One Time)",
					description: "Join any eligible group trip and get an instant ₹500 off—no minimums, no fuss.",
					imgSrc: "/view/assets/img/coupon.webp"
				},
				{
					title: "Concierge Priority Planning & Booking (Unlimited) - Plan a Europe vacation end-to-end.",
					description: "Hand us your wishlist—from visas to hotels to activities —we'll plan hassel free end-to-end planning for you",
					imgSrc: "/view/assets/img/planner.webp"
				},
				{
					title: "Exclusive Invites to Meet-ups (Online & Offline) to meet fellow travelers",
					description: "Members-only events to connect with real travelers, swap tips, and make plans together.",
					imgSrc: "/view/assets/img/meetup.webp"
				},
				{
					title: "Top-of-List Boost - your Find-Buddy posts pinned on the top (2 boost/month).",
					description: "Be seen first—your Find-Buddy posts pinned to the top for maximum visibility.",
					imgSrc: "/view/assets/img/pin-post.webp"
				},
				{
					title: "Free Itinerary Makeovers - optimize any plan you found elsewhere (2/yr)",
					description: "Bring any plan; we optimize routes, stays, timing, and costs—so you travel smarter.",
					imgSrc: "/view/assets/img/iti-makeover.webp"
				},
				{
					title: "Visa & Check-In Support",
					description: "Guidance for visa paperwork  plus smooth airport and hotel check-ins for the trips booked with Travel Buddy.",
					imgSrc: "/view/assets/img/support.webp"
				},
				{
					title: "Free Welcome Drink on arrival & Welcome in Local Tradition",
					description: "Start your trip with a smile—complimentary drink and warm local greeting at select stays with your booking done through us.",
					imgSrc: "/view/assets/img/drink.webp"
				},
				{
					title: "Priority WhatsApp Lane - first response SLA",
					description: "Dedicated WhatsApp group for your booking = single window support, priority replies, and zero runaround.",
					imgSrc: "/view/assets/img/whatsapp.webp"
				},
				{
					title: "Hold a Group-Trip Seat - 7 days soft hold, no questions asked.",
					description: "Reserve your spot while you decide—no questions asked.",
					imgSrc: "/view/assets/img/book-spot.webp"
				},
				{
					title: "City Welcome Pack (Digital) - maps, top 20 eats, essential phrases for your city.",
					description: "Once you book your trip, we will share a digital pack of Handy maps, top 20 eats, and essential phrases tailored to your destination.",
					imgSrc: "/view/assets/img/welcome.webp"
				},
				{
					title: "Collab on Social Media",
					description: "Get featured on our channels and share your journeys with the Travel Buddy community.",
					imgSrc: "/view/assets/img/collabb.webp"
				}
			];
			break;
		default:
			premiumFeatures = [];
	}
	return premiumFeatures;
}
			
			

function generateDescriptionWrapper(icon, title, description, additionalClass = '') {
	return `
		<div class="description-wrapper ${additionalClass}">
			<div class="premium-description">
				<h3>${title}</h3>
				<p>${description}</p>
			</div>
		</div>
	`;
	// <div class="description-image">${icon}</div>
}

function createPhotoPicker(from) {
	jQuery('.onboarding__page-background-image').append( `<div class="photo-picker-container">
			<div class="controls hidden">
				<button id="zoom-in">Zoom In</button>
				<button id="zoom-out">Zoom Out</button>
				<button id="crop">Crop</button>
			</div>
			
		</div>`);
	// 	<div class="cropped-result">
	// 	<h3>Cropped Image:</h3>
	// 	<img id="cropped-image" style="max-width: 100%;">
	// </div>
	if (from == 'cover') {
		jQuery('#file-input-cover').click();
	}
	else {
		jQuery('#file-input-dp').click();
		
	}
}


function returnTestersEmail() {
	var testerEmail = ['pranav@beatravelbuddy.com', 'pranav1274@gmail.com', 'archie.ch2627@gmail.com', 'jhapranav.official@gmail.com', 'sauravch@gmail.com', 'anubratapani62@gmail.com', 'paromita.bir@gmail.com', 'tisha@beatravelbuddy.com'];
	
	return testerEmail;
}

function changeTitleDescription(title, description) {
	// Change the title of the Chrome tab
	document.title = title;

	// Change the meta description dynamically
	var metaDescription = document.querySelector('meta[name="description"]');
	if (metaDescription) {
		metaDescription.setAttribute("content", description);
	} else {
		// If the meta description doesn't exist, create one
		var newMetaDescription = document.createElement('meta');
		newMetaDescription.name = "description";
		newMetaDescription.content = description;
		document.head.appendChild(newMetaDescription);
	}
}

function setUserNodeinFirebaseDB() {
	if (!guestMaster()) {
		jsInit('setUserNode', { displayName: manageUserProfile('read', 'name'), email: manageUserProfile('read', 'email'), profilePic: manageUserProfile('read', 'profilePic'), role: 'user', uid: manageUserProfile('read', 'userId'), isOnline: true });
		console.log('User node updated in Firebase Node');
	}
}

function sendWhatsAppEnquiryGlobal(tripTitle, tripId, tripCategory) {
	
	// Get host phone number with country code
	var phoneNumber = '8448154356';
	var countryCode = "+91"; // Default to India if not specified

	// Prepare message text
	var message = `Hello! I'm interested in "${tripTitle}". Could you please provide more information?`;
	
	// Encoded message for WhatsApp URL
	var encodedMessage = encodeURIComponent(message);

	// User information
	var userId,userName , userEmail, userPhone;

	
	if (guestMaster()) {
		userId = '123456';
		userName = 'Guest User';
		userEmail = 'guest@beatravelbuddy.com';
		userPhone = '123456';
		
	}
	else {
		var getProfileData = manageUserProfile('read', 'all');
		userId = getProfileData.userId;
		userName = getProfileData.name;
		userEmail = getProfileData.email;
		userPhone = getProfileData.phoneNumber;
	}
	
	// Create tags based on the trip - make sure these are strings without spaces
	// Important: Interakt requires tags to be an array of strings
	var tags = [`interested_in_trip${tripTitle}`,  "general", 'enquired_trip_via_tech', `trip_${tripId}`, tripCategory || "general"];
	
	// Your Interakt API Key
	var apiKey = "cDRoNms0ZXBIRjl1SENPQzlHMVVnallzdTBSeWdtYnlNZEgtUE5ETkdOVTo=";
	
	// 1. Track the user with User Track API - ENSURE TAGS ARE PROPERLY FORMATTED
	var userPayload = {
		userId: userId,
		phoneNumber: userPhone,
		countryCode: "+91",
		traits: {
			name: userName,
			email: userEmail,
			last_interested_trip: tripTitle,
			interest_timestamp: new Date().toISOString()
		},
		tags: tags  // Make sure this is an array of strings
	};
	
	console.log("Sending user payload with tags:", JSON.stringify(userPayload));
	// 3. Open WhatsApp after tracking
	openWhatsApp();
	
	// Make the User Track API call to Interakt
	$.ajax({
		url: "https://api.interakt.ai/v1/public/track/users/",
		type: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic " + apiKey
		},
		data: JSON.stringify(userPayload),
		success: function(response) {
			console.log("User tracked successfully in Interakt", response);
			
			// 2. After tracking user, track the enquiry event
			trackEnquiryEvent();
			
		},
		error: function(xhr, status, error) {
			console.error("Error tracking user in Interakt:", error);
			console.log("Status code:", xhr.status);
			console.log("Response:", xhr.responseText);
			
			// Still open WhatsApp even if tracking fails
			//openWhatsApp();
		}
	});
	
	// Function to track the enquiry event
	function trackEnquiryEvent() {
		// Prepare the event payload for Interakt Event Track API
		var eventPayload = {
			userId: userId,
			phoneNumber: userPhone,
			countryCode: "+91",
			event: "Trip Enquiry",
			traits: {
				"Trip ID": tripId, // Id of the Package / Group Trip
				"Trip Title": tripTitle,
				"Trip Category": tripCategory || "general",
				"Enquiry Message": message,
				"Enquiry Time": new Date().toISOString(),
				"Platform": "Website"
			}
		};
		
		// Make the Event Track API call to Interakt
		$.ajax({
			url: "https://api.interakt.ai/v1/public/track/events/",
			type: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Basic " + apiKey
			},
			data: JSON.stringify(eventPayload),
			success: function(response) {
				console.log("Enquiry event tracked successfully in Interakt", response);
			},
			error: function(xhr, status, error) {
				console.error("Error tracking enquiry event in Interakt:", error);
				console.log("Status code:", xhr.status);
				console.log("Response:", xhr.responseText);
			}
		});
	}
	
	// Function to open WhatsApp
	function openWhatsApp() {
		var whatsappUrl = `https://wa.me/${countryCode.replace(
			"+",
			""
		)}${phoneNumber}?text=${encodedMessage}`;
		window.open(whatsappUrl, "_blank");
	}
	
}



// Unified Media Upload Handler with Quality Preservation
function renderMediaUploadNew(uploadType) {
	// State variables for tracking media type
	let isVideoMode = false;
	let videoHandler = null;
	var accFileTypes;
	if (uploadType == 'findPost') {
		accFileTypes = "image/*";
	} 

	var htmlPage = `<div class="media-upload__container">
						<!-- Header -->
						<div class="media-upload__header">
							<h1 class="media-upload__title">Upload your Media here</h1>
							<p class="media-upload__subtitle">Upload, edit, and share your photos with our powerful tools. Add text, emojis, filters to images.</p>
						</div>

						<!-- Upload Area -->
						<div id="uploadArea" class="uploader animate-fade">
							<div class="uploader__area">
							<div class="uploader__icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
								<circle cx="8.5" cy="8.5" r="1.5"></circle>
								<polyline points="21 15 16 10 5 21"></polyline>
								</svg>
							</div>
							<div class="uploader__text">
								<h3 class="uploader__heading">Share your media here</h3>
								<p class="uploader__description">To create your perfect post</p>
							</div>
							<button id="selectButton" class="btn btn--gradient">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
								<polyline points="17 8 12 3 7 8"></polyline>
								<line x1="12" y1="3" x2="12" y2="15"></line>
								</svg>
								Select Media
							</button>
							<input type="file" id="fileInput" accept="${accFileTypes}" class="media-upload__hidden">
							</div>
						</div>

						<!-- Image Editor Area -->
						<div id="imageEditorArea" class="media-upload__hidden">
							<div class="editor__header">
							<h2 class="editor__title">Edit Image</h2>
							<button id="cancelImageButton" class="btn btn--outline btn--icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
							</div>

							<div class="editor__container">
							<div class="editor__main">
								<div class="preview">
								<img id="previewImage" class="preview__image" src="/placeholder.svg" alt="Preview">
								<canvas id="drawingCanvas" class="preview__canvas"></canvas>
								<div id="textOverlaysContainer"></div>
								<div id="emojiOverlaysContainer"></div>
								<button id="cropButton" class="preview__crop-btn">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
									<path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
									<path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
									</svg>
									Crop
								</button>
								</div>

								<div class="thumbnails" id="thumbnailsContainer">
								<!-- Thumbnails will be added here -->
								</div>
							</div>

							<div class="editor__sidebar">
								<div class="editor__tools">
								<div class="editor__tools-header">
									<div class="editor__tab" data-tab="draw">Draw</div>
									<div class="editor__tab" data-tab="text">Text</div>
									<div class="editor__tab" data-tab="emoji">Emoji</div>
									<div class="editor__tab" data-tab="filter">Filters</div>
								</div>

								<!-- Drawing Tools -->
								<div class="editor__tool-content" id="drawTab">
									<h3 class="editor__tool-title">Drawing Tools</h3>
									<div class="color-picker">
									<div class="color-picker__option color-picker__option--active" style="background-color: #ff0000;" data-color="#ff0000"></div>
									<div class="color-picker__option" style="background-color: #ff9900;" data-color="#ff9900"></div>
									<div class="color-picker__option" style="background-color: #ffff00;" data-color="#ffff00"></div>
									<div class="color-picker__option" style="background-color: #00ff00;" data-color="#00ff00"></div>
									<div class="color-picker__option" style="background-color: #0000ff;" data-color="#0000ff"></div>
									<div class="color-picker__option" style="background-color: #9900ff;" data-color="#9900ff"></div>
									<div class="color-picker__option" style="background-color: #ff00ff;" data-color="#ff00ff"></div>
									<div class="color-picker__option" style="background-color: #000000;" data-color="#000000"></div>
									<div class="color-picker__option" style="background-color: #ffffff;" data-color="#ffffff"></div>
									</div>
									
									<div class="brush-size">
									<label class="brush-size__label">Brush Size</label>
									<input type="range" id="brushSize" min="1" max="20" value="5">
									</div>

									<button id="undoDrawingBtn" class="btn btn--outline">Undo Last Stroke</button>
									<button id="clearDrawingBtn" class="btn btn--outline">Clear Drawing</button>
								</div>

								<!-- Text Tools -->
								<div class="editor__tool-content" id="textTab">
									<h3 class="editor__tool-title">Add Text</h3>
									<input type="text" id="textInput" class="text-input" placeholder="Enter your text here...">
									
									<div class="color-picker">
									<div class="color-picker__option color-picker__option--active" style="background-color: #ff0000;" data-color="#ff0000"></div>
									<div class="color-picker__option" style="background-color: #ff9900;" data-color="#ff9900"></div>
									<div class="color-picker__option" style="background-color: #ffff00;" data-color="#ffff00"></div>
									<div class="color-picker__option" style="background-color: #00ff00;" data-color="#00ff00"></div>
									<div class="color-picker__option" style="background-color: #0000ff;" data-color="#0000ff"></div>
									<div class="color-picker__option" style="background-color: #9900ff;" data-color="#9900ff"></div>
									<div class="color-picker__option" style="background-color: #ff00ff;" data-color="#ff00ff"></div>
									<div class="color-picker__option" style="background-color: #000000;" data-color="#000000"></div>
									<div class="color-picker__option" style="background-color: #ffffff;" data-color="#ffffff"></div>
									</div>
									
									<div class="text-options">
									<div class="text-options__font text-options__font--active" data-font="Arial">Arial</div>
									<div class="text-options__font" data-font="Verdana">Verdana</div>
									<div class="text-options__font" data-font="Georgia">Georgia</div>
									<div class="text-options__font" data-font="Courier New">Courier</div>
									<div class="text-options__font" data-font="Impact">Impact</div>
									</div>

									<button id="addTextBtn" class="btn">Add Text</button>
									<button id="clearTextBtn" class="btn btn--outline">Clear All Text</button>
								</div>

								<!-- Emoji Tools -->
								<div class="editor__tool-content" id="emojiTab">
									<h3 class="editor__tool-title">Add Emoji</h3>
									<div class="emoji-picker">
									<div class="emoji-picker__option">😀</div>
									<div class="emoji-picker__option">😍</div>
									<div class="emoji-picker__option">🥰</div>
									<div class="emoji-picker__option">😂</div>
									<div class="emoji-picker__option">🤣</div>
									<div class="emoji-picker__option">😊</div>
									<div class="emoji-picker__option">🙂</div>
									<div class="emoji-picker__option">😎</div>
									<div class="emoji-picker__option">🥳</div>
									<div class="emoji-picker__option">🤩</div>
									<div class="emoji-picker__option">😋</div>
									<div class="emoji-picker__option">👍</div>
									<div class="emoji-picker__option">👎</div>
									<div class="emoji-picker__option">👏</div>
									<div class="emoji-picker__option">🙌</div>
									<div class="emoji-picker__option">❤️</div>
									<div class="emoji-picker__option">💯</div>
									<div class="emoji-picker__option">🔥</div>
									<div class="emoji-picker__option">✨</div>
									<div class="emoji-picker__option">🎉</div>
									<div class="emoji-picker__option">🎁</div>
									<div class="emoji-picker__option">🎈</div>
									<div class="emoji-picker__option">🎂</div>
									</div>
									<button id="clearEmojisBtn" class="btn btn--outline">Clear All Emojis</button>
								</div>

								<!-- Filter Tools -->
								<div class="editor__tool-content" id="filterTab">
									<h3 class="editor__tool-title">Apply Filter</h3>
									<div class="filters__scroll">
									<div class="filters__list" id="filtersList">
										<!-- Filters will be added here by JavaScript -->
									</div>
									</div>
								</div>
								</div>

								<div class="caption">
								<label for="imageCaption" class="caption__label">Caption</label>
								<textarea id="imageCaption" class="caption__textarea" placeholder="Write a caption..."></textarea>
								</div>

								<div id="imageProgressContainer" class="progress media-upload__hidden">
								<div class="progress__bar">
									<div id="imageProgressFill" class="progress__fill"></div>
								</div>
								<p id="imageProgressText" class="progress__text">0%</p>
								</div>

								<div class="actions">
								<button id="shareImageButton" class="btn btn--gradient">Next</button>
								</div>
							</div>
							</div>
						</div>

						<!-- Video Editor Area -->
						<div id="videoEditorArea" class="media-upload__hidden">
							<div class="editor__header">
							<h2 class="editor__title">Edit Video</h2>
							<button id="cancelVideoButton" class="btn btn--outline btn--icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
							</div>

							<div class="editor__container">
							<div class="editor__main">
								<div class="video-preview">
								<video id="videoPreview" width="100%" height="auto"></video>
								</div>
							</div>

							<div class="editor__sidebar">
								<div class="caption">
								<label for="videoCaption" class="caption__label">Caption</label>
								<textarea id="videoCaption" class="caption__textarea" placeholder="Write a caption..."></textarea>
								</div>

								<div id="videoProgressContainer" class="progress media-upload__hidden">
								<div class="progress__bar">
									<div id="videoProgressFill" class="progress__fill"></div>
								</div>
								<p id="videoProgressText" class="progress__text">0%</p>
								</div>

								<div class="actions">
								<button id="shareVideoButton" class="btn btn--gradient">Share</button>
								</div>
							</div>
							</div>
						</div>

						<!-- Cropper Area -->
						<div id="cropperArea" class="media-upload__hidden">
							<div class="editor__header">
							<h2 class="editor__title">Crop Image</h2>
							</div>

							<div class="cropper__tools">
							<div class="aspect-ratio-selector">
								<label>Aspect Ratio:</label>
								<select id="aspectRatioSelect">
								<option value="free">Free</option>
								<option value="1:1">Square (1:1)</option>
								<option value="4:3">Standard (4:3)</option>
								<option value="16:9">Widescreen (16:9)</option>
								<option value="3:2">Photo (3:2)</option>
								<option value="original">Original</option>
								</select>
							</div>
							<button id="rotateButton" class="btn btn--outline btn--icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="23 4 23 10 17 10"></polyline>
								<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
								</svg>
							</button>
							</div>
							<div class="cropper__ratio-indicator" id="cropperRatioIndicator">Free Crop</div>

							<div id="cropperContainer" class="cropper">
							<img id="cropperImage" class="cropper__image" src="/placeholder.svg" alt="Crop preview">
							<div class="cropper__overlay">
								<div id="cropWindow" class="cropper__window">
								<div class="cropper__handle cropper__handle--nw" data-handle="nw"></div>
								<div class="cropper__handle cropper__handle--ne" data-handle="ne"></div>
								<div class="cropper__handle cropper__handle--sw" data-handle="sw"></div>
								<div class="cropper__handle cropper__handle--se" data-handle="se"></div>
								</div>
							</div>
							</div>

							<div class="actions">
							<button id="cancelCropButton" class="btn btn--outline">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
								Cancel
							</button>
							
							<button id="resetToOriginalButton" class="btn btn--outline">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
								<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
								<path d="M3 3v5h5"></path>
								</svg>
								Reset to Original
							</button>
							
							<button id="applyCropButton" class="btn btn--gradient">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
								<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
								Apply Crop
							</button>
							</div>
						</div>
						
						<!-- Error Message Container -->
						<div id="errorMessageContainer" class="error-message-container media-upload__hidden">
							<div class="error-message">
							<div class="error-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
								</svg>
							</div>
							<p id="errorMessageText">An error occurred.</p>
							<button id="errorCloseButton" class="btn btn--outline btn--small">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
							</div>
						</div>
					</div>`;

	// Append to body
	jQuery("body").append(htmlPage);

	// DOM Elements - Upload
	var uploadArea = document.getElementById("uploadArea");
	var fileInput = document.getElementById("fileInput");
	var selectButton = document.getElementById("selectButton");

	// DOM Elements - Image Editor
	var imageEditorArea = document.getElementById("imageEditorArea");
	var previewImage = document.getElementById("previewImage");
	var cropButton = document.getElementById("cropButton");
	var cancelImageButton = document.getElementById("cancelImageButton");
	var shareImageButton = document.getElementById("shareImageButton");
	var imageCaption = document.getElementById("imageCaption");
	var imageProgressContainer = document.getElementById(
		"imageProgressContainer"
	);
	var imageProgressFill = document.getElementById("imageProgressFill");
	var imageProgressText = document.getElementById("imageProgressText");
	var filtersList = document.getElementById("filtersList");
	var thumbnailsContainer = document.getElementById("thumbnailsContainer");

	// DOM Elements - Video Editor
	var videoEditorArea = document.getElementById("videoEditorArea");
	var videoPreview = document.getElementById("videoPreview");
	var cancelVideoButton = document.getElementById("cancelVideoButton");
	var shareVideoButton = document.getElementById("shareVideoButton");
	var videoCaption = document.getElementById("videoCaption");
	var videoProgressContainer = document.getElementById(
		"videoProgressContainer"
	);
	var videoProgressFill = document.getElementById("videoProgressFill");
	var videoProgressText = document.getElementById("videoProgressText");

	// DOM Elements - Cropper
	var cropperArea = document.getElementById("cropperArea");
	var cropperImage = document.getElementById("cropperImage");
	var cropperContainer = document.getElementById("cropperContainer");
	var cropWindow = document.getElementById("cropWindow");
	var rotateButton = document.getElementById("rotateButton");
	var cancelCropButton = document.getElementById("cancelCropButton");
	var applyCropButton = document.getElementById("applyCropButton");
	var aspectRatioSelect = document.getElementById("aspectRatioSelect");
	var cropperRatioIndicator = document.getElementById("cropperRatioIndicator");

	// DOM Elements - Drawing
	var drawingCanvas = document.getElementById("drawingCanvas");
	var brushSize = document.getElementById("brushSize");
	var clearDrawingBtn = document.getElementById("clearDrawingBtn");
	var undoDrawingBtn = document.getElementById("undoDrawingBtn");

	// DOM Elements - Text
	var textInput = document.getElementById("textInput");
	var addTextBtn = document.getElementById("addTextBtn");
	var clearTextBtn = document.getElementById("clearTextBtn");
	var textOverlaysContainer = document.getElementById("textOverlaysContainer");

	// DOM Elements - Emoji
	var emojiOptions = document.querySelectorAll(".emoji-picker__option");
	var clearEmojisBtn = document.getElementById("clearEmojisBtn");
	var emojiOverlaysContainer = document.getElementById(
		"emojiOverlaysContainer"
	);

	// DOM Elements - Tool Tabs
	var toolTabs = document.querySelectorAll(".editor__tab");
	var toolContents = document.querySelectorAll(".editor__tool-content");

	// DOM Elements - Color Picker
	var colorOptions = document.querySelectorAll(
		".color-picker .color-picker__option"
	);

	// DOM Elements - Font Options
	var fontOptions = document.querySelectorAll(".text-options__font");

	// DOM Elements - Error Message
	var errorMessageContainer = document.getElementById("errorMessageContainer");
	var errorMessageText = document.getElementById("errorMessageText");
	var errorCloseButton = document.getElementById("errorCloseButton");

	// State
	let selectedFiles = [];
	let currentFileIndex = 0;
	let selectedFilter = "original";
	let rotation = 0;
	let cropArea = { x: 25, y: 25, width: 50, height: 50 }; // Default crop area (percentages)
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };
	let activeHandle = null;
	let currentAspectRatio = "free"; // Default to free aspect ratio

	// Drawing state
	let isDrawing = false;
	let drawingContext = null;
	let currentColor = "#ff0000";
	let currentBrushSize = 5;
	let drawingData = [];
	let lastX = 0;
	let lastY = 0;
	let drawingEnabled = false; // Flag to control if drawing is enabled

	// Text state
	let currentFont = "Arial";
	let textOverlays = [];
	let activeTextOverlay = null;

	// Emoji state
	let emojiOverlays = [];
	let activeEmojiOverlay = null;

	// Image state
	let originalImages = []; // Store original images for each file
	let cropHistory = []; // Store crop history for undo operations
	let originalImageDimensions = []; // Store original image dimensions

	// Filters
	var filters = [
		{ id: "original", name: "Normal" },
		{ id: "filter--clarendon", name: "Clarendon" },
		{ id: "filter--gingham", name: "Gingham" },
		{ id: "filter--moon", name: "Moon" },
		{ id: "filter--lark", name: "Lark" },
		{ id: "filter--reyes", name: "Reyes" },
		{ id: "filter--juno", name: "Juno" },
		{ id: "filter--slumber", name: "Slumber" },
		{ id: "filter--crema", name: "Crema" },
		{ id: "filter--ludwig", name: "Ludwig" },
	];

	// Initialize
	// Setup event listeners for upload
	uploadArea.addEventListener("click", () => fileInput.click());
	fileInput.addEventListener("change", handleFileChange);
	selectButton.addEventListener("click", (e) => {
		e.stopPropagation();
		fileInput.click();
	});

	// Drag and drop
	uploadArea.addEventListener("dragover", handleDragOver);
	uploadArea.addEventListener("dragleave", handleDragLeave);
	uploadArea.addEventListener("drop", handleDrop);

	// Editor buttons
	cancelImageButton.addEventListener("click", resetUploader);
	cancelVideoButton.addEventListener("click", resetUploader);
	cropButton.addEventListener("click", startCropping);
	shareImageButton.addEventListener("click", () => handleUpload("image"));
	shareVideoButton.addEventListener("click", () => handleUpload("video"));

	// Cropper buttons
	rotateButton.addEventListener("click", rotateImage);
	cancelCropButton.addEventListener("click", cancelCropping);
	applyCropButton.addEventListener("click", applyCrop);
	resetToOriginalButton.addEventListener("click", resetToOriginal);

	// Aspect ratio selector
	aspectRatioSelect.addEventListener("change", updateAspectRatio);

	// Error message
	errorCloseButton.addEventListener("click", hideErrorMessage);

	// Cropper events
	cropWindow.addEventListener("mousedown", startDraggingCrop);
	cropWindow.addEventListener("touchstart", handleTouchStartCrop, {
		passive: false,
	});
	document.addEventListener("mousemove", handleDraggingCrop);
	document.addEventListener("touchmove", handleTouchMoveCrop, {
		passive: false,
	});
	document.addEventListener("mouseup", stopDraggingCrop);
	document.addEventListener("touchend", stopDraggingCrop);
	document.addEventListener("touchcancel", stopDraggingCrop);

	// Handle crop resize
	var handles = document.querySelectorAll(".cropper__handle");
	handles.forEach((handle) => {
		handle.addEventListener("mousedown", (e) => {
			e.stopPropagation();
			activeHandle = handle.getAttribute("data-handle");
			startDraggingCrop(e);
		});
		handle.addEventListener("touchstart", (e) => {
			e.stopPropagation();
			activeHandle = handle.getAttribute("data-handle");
			handleTouchStartCrop(e);
		});
	});

	// Create filters
	createFilters();

	// Setup drawing canvas
	setupDrawingCanvas();
	clearDrawingBtn.addEventListener("click", clearDrawing);
	undoDrawingBtn.addEventListener("click", undoLastStroke);

	// Setup text tools
	addTextBtn.addEventListener("click", addTextOverlay);
	clearTextBtn.addEventListener("click", clearAllText);

	// Setup emoji tools
	emojiOptions.forEach((option) => {
		option.addEventListener("click", () => addEmojiOverlay(option.textContent));
	});
	clearEmojisBtn.addEventListener("click", clearAllEmojis);

	// Setup tool tabs
	toolTabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			var tabName = tab.getAttribute("data-tab");
			setActiveTab(tabName);

			// Enable drawing only when the draw tab is active
			drawingEnabled = tabName === "draw";
		});
	});

	// Setup color picker
	colorOptions.forEach((option) => {
		option.addEventListener("click", () => {
			var color = option.getAttribute("data-color");
			setCurrentColor(color, option);
		});
	});

	// Setup font options
	fontOptions.forEach((option) => {
		option.addEventListener("click", () => {
			var font = option.getAttribute("data-font");
			setCurrentFont(font, option);
		});
	});

	// Setup brush size
	brushSize.addEventListener("input", () => {
		currentBrushSize = brushSize.value;
	});

	// Handle window resize
	window.addEventListener("resize", handleResize);

	// Open the File Picker
	setTimeout(() => {
		jQuery("#selectButton").click();
	}, 300);

	// Show error message
	function showErrorMessage(message) {
		errorMessageText.textContent = message;
		errorMessageContainer.classList.remove("media-upload__hidden");

		// Auto-hide after 5 seconds
		setTimeout(() => {
			hideErrorMessage();
		}, 5000);
	}

	// Hide error message
	function hideErrorMessage() {
		errorMessageContainer.classList.add("media-upload__hidden");
	}

	// Update aspect ratio
	function updateAspectRatio() {
		currentAspectRatio = aspectRatioSelect.value;

		// Update the indicator text
		switch (currentAspectRatio) {
			case "free":
				cropperRatioIndicator.textContent = "Free Crop";
				break;
			case "1:1":
				cropperRatioIndicator.textContent = "Square (1:1)";
				break;
			case "4:3":
				cropperRatioIndicator.textContent = "Standard (4:3)";
				break;
			case "16:9":
				cropperRatioIndicator.textContent = "Widescreen (16:9)";
				break;
			case "3:2":
				cropperRatioIndicator.textContent = "Photo (3:2)";
				break;
			case "original":
				cropperRatioIndicator.textContent = "Original Ratio";
				break;
		}

		// Recalculate crop area based on new aspect ratio
		recalculateCropArea();
	}

	// Recalculate crop area based on aspect ratio
	function recalculateCropArea() {
		if (currentAspectRatio === "free") {
			// No need to adjust, free form
			return;
		}

		if (
			currentAspectRatio === "original" &&
			originalImageDimensions[currentFileIndex]
		) {
			// Use original image aspect ratio
			const origWidth = originalImageDimensions[currentFileIndex].width;
			const origHeight = originalImageDimensions[currentFileIndex].height;
			const ratio = origWidth / origHeight;

			// Adjust crop area to match original ratio
			adjustCropAreaToRatio(ratio);
			return;
		}

		// Parse the aspect ratio
		let ratio = 1; // Default to square

		switch (currentAspectRatio) {
			case "1:1":
				ratio = 1;
				break;
			case "4:3":
				ratio = 4 / 3;
				break;
			case "16:9":
				ratio = 16 / 9;
				break;
			case "3:2":
				ratio = 3 / 2;
				break;
		}

		// Adjust crop area to match the selected ratio
		adjustCropAreaToRatio(ratio);
	}

	// Adjust crop area to match a specific ratio
	function adjustCropAreaToRatio(ratio) {
		// Get container dimensions
		const containerRect = cropperContainer.getBoundingClientRect();
		const containerRatio = containerRect.width / containerRect.height;

		// Calculate new crop dimensions
		let newWidth, newHeight;

		if (ratio > containerRatio) {
			// Width constrained
			newWidth = Math.min(80, cropArea.width); // Max 80% of container width
			newHeight = newWidth / ratio;
		} else {
			// Height constrained
			newHeight = Math.min(80, cropArea.height); // Max 80% of container height
			newWidth = newHeight * ratio;
		}

		// Center the crop window
		const newX = (100 - newWidth) / 2;
		const newY = (100 - newHeight) / 2;

		// Update crop area
		cropArea = {
			x: newX,
			y: newY,
			width: newWidth,
			height: newHeight,
		};

		// Update crop window
		updateCropWindow();
	}

	// Handle window resize
	function handleResize() {
		// Update canvas size when window is resized
		updateCanvasSize();

		// Reposition text and emoji overlays
		repositionOverlays();
	}

	// Reposition overlays after resize
	function repositionOverlays() {
		var previewRect = previewImage.getBoundingClientRect();

		// Reposition text overlays
		textOverlays.forEach((overlay) => {
			if (overlay.element.style.transform !== "none") {
				// If the overlay is still using transform, don't reposition
				return;
			}

			// Get current position as percentage of container
			var rect = overlay.element.getBoundingClientRect();
			var x = ((rect.left - previewRect.left) / previewRect.width) * 100;
			var y = ((rect.top - previewRect.top) / previewRect.height) * 100;

			// Update position
			overlay.element.style.left = `${x}%`;
			overlay.element.style.top = `${y}%`;
		});

		// Reposition emoji overlays
		emojiOverlays.forEach((overlay) => {
			if (overlay.element.style.transform !== "none") {
				// If the overlay is still using transform, don't reposition
				return;
			}

			// Get current position as percentage of container
			var rect = overlay.element.getBoundingClientRect();
			var x = ((rect.left - previewRect.left) / previewRect.width) * 100;
			var y = ((rect.top - previewRect.top) / previewRect.height) * 100;

			// Update position
			overlay.element.style.left = `${x}%`;
			overlay.element.style.top = `${y}%`;
		});
	}

	// Set active tab
	function setActiveTab(tabName) {
		// Remove active class from all tabs
		toolTabs.forEach((tab) => tab.classList.remove("editor__tab--active"));
		toolContents.forEach((content) =>
			content.classList.remove("editor__tool-content--active")
		);

		// Add active class to selected tab
		document
			.querySelector(`.editor__tab[data-tab="${tabName}"]`)
			.classList.add("editor__tab--active");
		document
			.getElementById(`${tabName}Tab`)
			.classList.add("editor__tool-content--active");
	}

	// Set current color
	function setCurrentColor(color, element) {
		currentColor = color;

		// Update active color in the current tab
		var activeTab = document
			.querySelector(".editor__tab.editor__tab--active")
			.getAttribute("data-tab");
		var tabContent = document.getElementById(`${activeTab}Tab`);
		var colorOptions = tabContent.querySelectorAll(".color-picker__option");

		colorOptions.forEach((option) =>
			option.classList.remove("color-picker__option--active")
		);
		element.classList.add("color-picker__option--active");
	}

	// Set current font
	function setCurrentFont(font, element) {
		currentFont = font;

		// Update active font
		fontOptions.forEach((option) =>
			option.classList.remove("text-options__font--active")
		);
		element.classList.add("text-options__font--active");
	}

	// Setup drawing canvas
	function setupDrawingCanvas() {
		var ctx = drawingCanvas.getContext("2d");
		drawingContext = ctx;

		// Set initial canvas size
		updateCanvasSize();

		// Drawing event listeners
		drawingCanvas.addEventListener("mousedown", startDrawing);
		drawingCanvas.addEventListener("touchstart", handleTouchStart, {
			passive: false,
		});

		// These events are added to the document to capture movement outside the canvas
		document.addEventListener("mousemove", draw);
		document.addEventListener("touchmove", handleTouchMove, { passive: false });
		document.addEventListener("mouseup", stopDrawing);
		document.addEventListener("touchend", handleTouchEnd);
		document.addEventListener("touchcancel", handleTouchEnd);
	}

	// Update canvas size to match the image
	function updateCanvasSize() {
		if (!previewImage.complete) {
			previewImage.onload = updateCanvasSize;
			return;
		}

		// Get the display dimensions of the preview image
		var displayRect = previewImage.getBoundingClientRect();

		// Set canvas display size to match the preview image display size
		drawingCanvas.style.width = `${displayRect.width}px`;
		drawingCanvas.style.height = `${displayRect.height}px`;

		// Set canvas internal dimensions to match the natural image size for better quality
		if (originalImageDimensions[currentFileIndex]) {
			drawingCanvas.width = originalImageDimensions[currentFileIndex].width;
			drawingCanvas.height = originalImageDimensions[currentFileIndex].height;
		} else {
			// Fallback to natural dimensions of the preview image
			drawingCanvas.width = previewImage.naturalWidth || displayRect.width;
			drawingCanvas.height = previewImage.naturalHeight || displayRect.height;
		}

		// Calculate the scale factor between display size and internal canvas size
		const scaleX = drawingCanvas.width / displayRect.width;
		const scaleY = drawingCanvas.height / displayRect.height;

		// Store the scale factors for use in drawing operations
		drawingCanvas.dataset.scaleX = scaleX;
		drawingCanvas.dataset.scaleY = scaleY;

		// Redraw any existing lines with proper scaling
		redrawCanvas();
	}

	// Start drawing
	function startDrawing(e) {
		e.preventDefault();

		// Only allow drawing if the draw tab is active
		if (!drawingEnabled) return;

		isDrawing = true;
		var rect = drawingCanvas.getBoundingClientRect();
		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;

		// Scale the coordinates to match the internal canvas size
		const scaleX = parseFloat(drawingCanvas.dataset.scaleX) || 1;
		const scaleY = parseFloat(drawingCanvas.dataset.scaleY) || 1;

		const scaledX = x * scaleX;
		const scaledY = y * scaleY;

		lastX = scaledX;
		lastY = scaledY;

		drawingContext.beginPath();
		drawingContext.moveTo(scaledX, scaledY);

		// Store the start of this line
		drawingData.push({
			type: "line",
			color: currentColor,
			size: currentBrushSize * Math.max(scaleX, scaleY), // Scale brush size
			points: [{ x: scaledX, y: scaledY }],
		});
	}

	// Draw
	function draw(e) {
		if (!isDrawing) return;

		var rect = drawingCanvas.getBoundingClientRect();
		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;

		// Scale the coordinates to match the internal canvas size
		const scaleX = parseFloat(drawingCanvas.dataset.scaleX) || 1;
		const scaleY = parseFloat(drawingCanvas.dataset.scaleY) || 1;

		const scaledX = x * scaleX;
		const scaledY = y * scaleY;

		// Check if mouse is within canvas bounds or close to last point
		if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
			drawingContext.lineTo(scaledX, scaledY);
			drawingContext.strokeStyle = currentColor;
			drawingContext.lineWidth = currentBrushSize * Math.max(scaleX, scaleY); // Scale brush size
			drawingContext.lineCap = "round";
			drawingContext.stroke();

			// Add point to current line
			drawingData[drawingData.length - 1].points.push({
				x: scaledX,
				y: scaledY,
			});

			lastX = scaledX;
			lastY = scaledY;
		}
	}

	// Stop drawing
	function stopDrawing() {
		isDrawing = false;
	}

	// Touch event handlers
	function handleTouchStart(e) {
		// Only allow drawing if the draw tab is active
		if (!drawingEnabled) return;

		e.preventDefault();
		var touch = e.touches[0];
		var rect = drawingCanvas.getBoundingClientRect();
		var x = touch.clientX - rect.left;
		var y = touch.clientY - rect.top;

		// Scale the coordinates to match the internal canvas size
		const scaleX = parseFloat(drawingCanvas.dataset.scaleX) || 1;
		const scaleY = parseFloat(drawingCanvas.dataset.scaleY) || 1;

		const scaledX = x * scaleX;
		const scaledY = y * scaleY;

		isDrawing = true;
		lastX = scaledX;
		lastY = scaledY;

		drawingContext.beginPath();
		drawingContext.moveTo(scaledX, scaledY);

		// Store the start of this line
		drawingData.push({
			type: "line",
			color: currentColor,
			size: currentBrushSize * Math.max(scaleX, scaleY), // Scale brush size
			points: [{ x: scaledX, y: scaledY }],
		});
	}

	function handleTouchMove(e) {
		if (!isDrawing) return;

		// Prevent scrolling only when drawing is active
		if (isDrawing) {
			e.preventDefault();
		}

		var touch = e.touches[0];
		var rect = drawingCanvas.getBoundingClientRect();
		var x = touch.clientX - rect.left;
		var y = touch.clientY - rect.top;

		// Scale the coordinates to match the internal canvas size
		const scaleX = parseFloat(drawingCanvas.dataset.scaleX) || 1;
		const scaleY = parseFloat(drawingCanvas.dataset.scaleY) || 1;

		const scaledX = x * scaleX;
		const scaledY = y * scaleY;

		// Check if touch is within canvas bounds or close to last point
		if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
			drawingContext.lineTo(scaledX, scaledY);
			drawingContext.strokeStyle = currentColor;
			drawingContext.lineWidth = currentBrushSize * Math.max(scaleX, scaleY); // Scale brush size
			drawingContext.lineCap = "round";
			drawingContext.stroke();

			// Add point to current line
			drawingData[drawingData.length - 1].points.push({
				x: scaledX,
				y: scaledY,
			});

			lastX = scaledX;
			lastY = scaledY;
		}
	}

	function handleTouchEnd(e) {
		isDrawing = false;
	}

	// Redraw canvas from stored data
	function redrawCanvas() {
		drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

		drawingData.forEach((line) => {
			if (line.points.length < 2) return;

			drawingContext.beginPath();
			drawingContext.moveTo(line.points[0].x, line.points[0].y);

			for (let i = 1; i < line.points.length; i++) {
				drawingContext.lineTo(line.points[i].x, line.points[i].y);
			}

			drawingContext.strokeStyle = line.color;
			drawingContext.lineWidth = line.size;
			drawingContext.lineCap = "round";
			drawingContext.stroke();
		});
	}

	// Clear drawing
	function clearDrawing() {
		drawingData = [];
		drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
	}

	// Undo last stroke (LIFO - Last In First Out)
	function undoLastStroke() {
		if (drawingData.length > 0) {
			// Remove the last stroke from the array
			drawingData.pop();
			// Redraw the canvas with the remaining strokes
			redrawCanvas();
		}
	}

	// Add text overlay
	function addTextOverlay() {
		var text = textInput.value.trim();
		if (!text) return;

		var overlay = document.createElement("div");
		overlay.className = "text-overlay";
		overlay.style.left = "50%";
		overlay.style.top = "50%";
		overlay.style.transform = "translate(-50%, -50%)";

		var content = document.createElement("div");
		content.className = "text-overlay__content";
		content.textContent = text;
		content.style.color = currentColor;
		content.style.fontFamily = currentFont;

		overlay.appendChild(content);
		textOverlaysContainer.appendChild(overlay);

		// Store text overlay data
		var textData = {
			element: overlay,
			text: text,
			color: currentColor,
			font: currentFont,
			x: "50%",
			y: "50%",
		};

		textOverlays.push(textData);

		// Make draggable
		makeElementDraggable(overlay, textData);

		// Clear input
		textInput.value = "";
	}

	// Clear all text overlays
	function clearAllText() {
		textOverlays = [];
		textOverlaysContainer.innerHTML = "";
	}

	// Add emoji overlay
	function addEmojiOverlay(emoji) {
		var overlay = document.createElement("div");
		overlay.className = "emoji-overlay";
		overlay.style.left = "50%";
		overlay.style.top = "50%";
		overlay.style.transform = "translate(-50%, -50%)";

		var content = document.createElement("div");
		content.className = "emoji-overlay__content";
		content.textContent = emoji;

		overlay.appendChild(content);
		emojiOverlaysContainer.appendChild(overlay);

		// Store emoji overlay data
		var emojiData = {
			element: overlay,
			emoji: emoji,
			x: "50%",
			y: "50%",
		};

		emojiOverlays.push(emojiData);

		// Make draggable
		makeElementDraggable(overlay, emojiData);
	}

	// Clear all emoji overlays
	function clearAllEmojis() {
		emojiOverlays = [];
		emojiOverlaysContainer.innerHTML = "";
	}

	// Make element draggable
	function makeElementDraggable(element, data) {
		let offsetX, offsetY, startX, startY;

		element.addEventListener("mousedown", startDrag);
		element.addEventListener("touchstart", handleTouchStartDrag, {
			passive: false,
		});

		function startDrag(e) {
			e.preventDefault();

			// Deactivate any active overlay
			if (activeTextOverlay) {
				activeTextOverlay.classList.remove("text-overlay--active");
			}
			if (activeEmojiOverlay) {
				activeEmojiOverlay.classList.remove("emoji-overlay--active");
			}

			// Set this as active
			element.classList.add(
				element.classList.contains("text-overlay")
					? "text-overlay--active"
					: "emoji-overlay--active"
			);
			if (element.classList.contains("text-overlay")) {
				activeTextOverlay = element;
			} else {
				activeEmojiOverlay = element;
			}

			// Get initial position
			startX = e.clientX;
			startY = e.clientY;

			// Calculate offset
			var rect = element.getBoundingClientRect();
			offsetX = startX - rect.left;
			offsetY = startY - rect.top;

			// Add move and end event listeners
			document.addEventListener("mousemove", dragMove);
			document.addEventListener("mouseup", dragEnd);
		}

		function dragMove(e) {
			e.preventDefault();

			// Calculate new position
			var x = e.clientX - offsetX;
			var y = e.clientY - offsetY;

			// Update element position
			element.style.left = x + "px";
			element.style.top = y + "px";
			element.style.transform = "none";

			// Update data
			data.x = x + "px";
			data.y = y + "px";
		}

		function dragEnd() {
			document.removeEventListener("mousemove", dragMove);
			document.removeEventListener("mouseup", dragEnd);
		}

		// Touch support
		function handleTouchStartDrag(e) {
			e.preventDefault();
			var touch = e.touches[0];

			// Deactivate any active overlay
			if (activeTextOverlay) {
				activeTextOverlay.classList.remove("text-overlay--active");
			}
			if (activeEmojiOverlay) {
				activeEmojiOverlay.classList.remove("emoji-overlay--active");
			}

			// Set this as active
			element.classList.add(
				element.classList.contains("text-overlay")
					? "text-overlay--active"
					: "emoji-overlay--active"
			);
			if (element.classList.contains("text-overlay")) {
				activeTextOverlay = element;
			} else {
				activeEmojiOverlay = element;
			}

			// Get initial position
			startX = touch.clientX;
			startY = touch.clientY;

			// Calculate offset
			var rect = element.getBoundingClientRect();
			offsetX = startX - rect.left;
			offsetY = startY - rect.top;

			// Add move and end event listeners
			document.addEventListener("touchmove", handleTouchMoveDrag, {
				passive: false,
			});
			document.addEventListener("touchend", handleTouchEndDrag);
			document.addEventListener("touchcancel", handleTouchEndDrag);
		}

		function handleTouchMoveDrag(e) {
			e.preventDefault();
			var touch = e.touches[0];

			// Calculate new position
			var x = touch.clientX - offsetX;
			var y = touch.clientY - offsetY;

			// Update element position
			element.style.left = x + "px";
			element.style.top = y + "px";
			element.style.transform = "none";

			// Update data
			data.x = x + "px";
			data.y = y + "px";
		}

		function handleTouchEndDrag(e) {
			document.removeEventListener("touchmove", handleTouchMoveDrag);
			document.removeEventListener("touchend", handleTouchEndDrag);
			document.removeEventListener("touchcancel", handleTouchEndDrag);
		}
	}

	// Create filter options
	function createFilters() {
		filters.forEach((filter) => {
			var filterOption = document.createElement("div");
			filterOption.className = `filter ${
				filter.id === "original" ? "filter--active" : ""
			}`;
			filterOption.setAttribute("data-filter", filter.id);

			var filterPreview = document.createElement("div");
			filterPreview.className = "filter__preview";

			var filterPreviewInner = document.createElement("div");
			filterPreviewInner.className = `filter__preview-inner ${filter.id}`;

			var filterName = document.createElement("span");
			filterName.className = "filter__name";
			filterName.textContent = filter.name;

			filterPreview.appendChild(filterPreviewInner);
			filterOption.appendChild(filterPreview);
			filterOption.appendChild(filterName);

			filterOption.addEventListener("click", () => {
				document.querySelectorAll(".filter").forEach((el) => {
					el.classList.remove("filter--active");
				});
				filterOption.classList.add("filter--active");
				selectedFilter = filter.id;
				applyFilter();
			});

			filtersList.appendChild(filterOption);
		});
	}

	// Apply selected filter to preview image
	function applyFilter() {
		// Remove all filter classes
		filters.forEach((filter) => {
			previewImage.classList.remove(filter.id);
		});

		// Add selected filter class
		if (selectedFilter !== "original") {
			previewImage.classList.add(selectedFilter);
		}
	}

	// Handle file selection
	async function handleFileChange(e) {
		jQuery("#app, #singleChat").css("display", "none");
		jQuery(".media-upload__container").css("display", "block");

		var files = e.target.files || (e.dataTransfer && e.dataTransfer.files);

		if (!files || files.length === 0) return;

		// Clear previous files
		selectedFiles = [];
		originalImages = [];
		originalImageDimensions = [];

		// Process each file
		for (let i = 0; i < files.length; i++) {
			var file = files[i];

			// Validate file size
			if (file.size > 200 * 1024 * 1024) {
				// 20MB limit
				showErrorMessage(
					"File size exceeds 200MB limit. Please select a smaller file."
				);
				continue;
			}
			// Read the first 12 bytes of the file
			let buffer = new Uint8Array(await file.slice(0, 12).arrayBuffer());

			// Check if the file is a HEIC or HEIF image
			let type;
			if (file.type == '' || file.type === 'image/heic' || file.type === 'image/heif' || buffer.length > 11 &&
				buffer[4] === 0x66 &&
				buffer[5] === 0x74 &&
				buffer[6] === 0x79 &&
				buffer[7] === 0x70 &&
				((buffer[8] === 0x68 &&
				buffer[9] === 0x65 &&
				buffer[10] === 0x69 &&
				buffer[11] === 0x63) ||
				(buffer[8] === 0x68 &&
				buffer[9] === 0x65 &&
				buffer[10] === 0x69 &&
				buffer[11] === 0x66))) 
				{
					type = 'HEIC/HEIF';
				}
			else {
				type = 'image';
				console.log('File type is not supported');
			}
			// If the file is a HEIC or HEIF image
			if (type === 'HEIC/HEIF') {
				// Convert the file to a JPEG image
				loaderMain('global__loading', true);
				let jpegFile = await convertHeicToJpegNew(file);
				file = jpegFile;
				// Add the converted file to the FilePond instance
				// pond.addFile(jpegFile);
				loaderMain('global__loading', false);
			}
			
			

			selectedFiles.push(file);
		}
		
		if (selectedFiles.length === 0) {
			showErrorMessage("Please select at least one valid file");
			return;
		}

		// Determine file type and show appropriate editor
		var file = selectedFiles[0];
		if (file.type.startsWith("image/")) {
			// Image file
			isVideoMode = false;

			// Show image editor area
			uploadArea.classList.add("media-upload__hidden");
			imageEditorArea.classList.remove("media-upload__hidden");
			videoEditorArea.classList.add("media-upload__hidden");

			// Create thumbnails if multiple images
			if (selectedFiles.length > 1) {
				createThumbnails();
			}

			// Load first image
			loadImage(0);
		} else if (file.type.startsWith("video/")) {
			// Video file
			isVideoMode = true;

			// Show video editor area
			uploadArea.classList.add("media-upload__hidden");
			imageEditorArea.classList.add("media-upload__hidden");
			videoEditorArea.classList.remove("media-upload__hidden");

			// Initialize video handler
			videoHandler = handleVideoAttachment(videoPreview, {
				allowTrim: true,
				allowVolumeControl: true,
				maxDuration: 120,
				showControls: false,
				autoPlay: false,
			});

			// Load video
			var url = URL.createObjectURL(file);
			videoHandler.initVideoPlayer(videoPreview, url, file);
		} else {
			showErrorMessage(
				"Unsupported file type. Please select an image or video file."
			);
			resetUploader();
		}
	}

	// Drag and drop handlers
	function handleDragOver(e) {
		e.preventDefault();
		uploadArea
			.querySelector(".uploader__area")
			.classList.add("uploader__area--dragging");
	}

	function handleDragLeave(e) {
		e.preventDefault();
		uploadArea
			.querySelector(".uploader__area")
			.classList.remove("uploader__area--dragging");
	}

	function handleDrop(e) {
		e.preventDefault();
		uploadArea
			.querySelector(".uploader__area")
			.classList.remove("uploader__area--dragging");
		handleFileChange(e);
	}

	// Create thumbnails
	function createThumbnails() {
		thumbnailsContainer.innerHTML = "";

		selectedFiles.forEach((file, index) => {
			if (!file.type.startsWith("image/")) return;

			var reader = new FileReader();
			reader.onload = (e) => {
				var thumbnail = document.createElement("div");
				thumbnail.className = `thumbnail ${
					index === 0 ? "thumbnail--active" : ""
				}`;
				thumbnail.setAttribute("data-index", index);

				var img = document.createElement("img");
				img.src = e.target.result;
				img.alt = `Thumbnail ${index + 1}`;

				var removeBtn = document.createElement("div");
				removeBtn.className = "thumbnail__remove";
				removeBtn.innerHTML = "×";
				removeBtn.addEventListener("click", (e) => {
					e.stopPropagation();
					removeThumbnail(index);
				});

				thumbnail.appendChild(img);
				thumbnail.appendChild(removeBtn);
				thumbnailsContainer.appendChild(thumbnail);

				thumbnail.addEventListener("click", () => {
					loadImage(index);
				});
			};
			reader.readAsDataURL(file);
		});
	}

	// Remove thumbnail
	function removeThumbnail(index) {
		// Remove file from array
		selectedFiles.splice(index, 1);
		originalImages.splice(index, 1);
		originalImageDimensions.splice(index, 1);

		if (selectedFiles.length === 0) {
			// No more files, go back to upload area
			resetUploader();
			return;
		}

		// Recreate thumbnails
		createThumbnails();

		// Load current or previous image
		if (index <= currentFileIndex) {
			currentFileIndex = Math.max(0, currentFileIndex - 1);
		}

		loadImage(currentFileIndex);
	}

	// Load image with proper orientation and quality preservation
	function loadImage(index) {
		if (index < 0 || index >= selectedFiles.length) return;

		currentFileIndex = index;

		// Update active thumbnail
		document.querySelectorAll(".thumbnail").forEach((thumb) => {
			thumb.classList.remove("thumbnail--active");
		});

		var activeThumbnail = document.querySelector(
			`.thumbnail[data-index="${index}"]`
		);
		if (activeThumbnail) {
			activeThumbnail.classList.add("thumbnail--active");
		}

		// Show loading indicator
		previewImage.classList.add("loading");

		// Load image
		var reader = new FileReader();
		reader.onload = (e) => {
			// Store the original image if not already stored
			if (!originalImages[index]) {
				originalImages[index] = e.target.result;

				// Create an image to get the natural dimensions
				var img = new Image();
				img.onload = function () {
					originalImageDimensions[index] = {
						width: this.naturalWidth,
						height: this.naturalHeight,
					};

					// Now that we have the dimensions, update the canvas size
					updateCanvasSize();
				};
				img.src = e.target.result;
			}

			previewImage.src = e.target.result;

			// Reset canvas and overlays for the new image
			clearDrawing();
			clearAllText();
			clearAllEmojis();

			// Reset filter
			selectedFilter = "original";
			filters.forEach((filter) => {
				previewImage.classList.remove(filter.id);
			});

			// Update filter UI
			document.querySelectorAll(".filter").forEach((el) => {
				el.classList.remove("filter--active");
				if (el.getAttribute("data-filter") === "original") {
					el.classList.add("filter--active");
				}
			});

			// Update canvas size when image loads
			previewImage.onload = function () {
				updateCanvasSize();
				// Remove loading indicator
				previewImage.classList.remove("loading");
			};
		};
		reader.readAsDataURL(selectedFiles[index]);
	}

	// Reset uploader
	function resetUploader() {
		// Hide Media Upload Page and show #app element
		jQuery("#app").css("display", "flex");
		jQuery(".media-upload__container").remove();
		
		// Reset state
		selectedFiles = [];
		currentFileIndex = 0;
		selectedFilter = "original";
		rotation = 0;
		drawingData = [];
		textOverlays = [];
		emojiOverlays = [];
		isVideoMode = false;
		originalImages = []; // Clear original images
		originalImageDimensions = []; // Clear original dimensions
		cropHistory = []; // Clear crop history
		
		console.log(uploadType);

		if (videoHandler) {
			// Clean up video handler
			videoHandler = null;
		}

		// Reset UI
		fileInput.value = "";
		previewImage.src = "";
		imageCaption.value = "";
		videoCaption.value = "";
		imageProgressFill.style.width = "0%";
		imageProgressText.textContent = "0%";
		videoProgressFill.style.width = "0%";
		videoProgressText.textContent = "0%";

		// Clear canvas
		if (drawingContext) {
			drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
		}

		// Clear overlays
		textOverlaysContainer.innerHTML = "";
		emojiOverlaysContainer.innerHTML = "";
		thumbnailsContainer.innerHTML = "";

		// Show upload area, hide editors
		uploadArea.classList.remove("media-upload__hidden");
		imageEditorArea.classList.add("media-upload__hidden");
		videoEditorArea.classList.add("media-upload__hidden");
		cropperArea.classList.add("media-upload__hidden");
		imageProgressContainer.classList.add("media-upload__hidden");
		videoProgressContainer.classList.add("media-upload__hidden");
		errorMessageContainer.classList.add("media-upload__hidden");

		// Reset filters
		document.querySelectorAll(".filter").forEach((el) => {
			el.classList.remove("filter--active");
			if (el.getAttribute("data-filter") === "original") {
				el.classList.add("filter--active");
			}
		});

		// Remove filter classes
		filters.forEach((filter) => {
			previewImage.classList.remove(filter.id);
		});
	}

	// Upload handling
	function handleUpload(mediaType) {
		if (selectedFiles.length === 0) return;

		if (mediaType === "image") {
			uploadImage();
		} else if (mediaType === "video") {
			uploadVideo();
		}
	}

	// Upload image with quality preservation
	function uploadImage() {
		// Show progress
		imageProgressContainer.classList.remove("media-upload__hidden");
		shareImageButton.disabled = true;
		shareImageButton.textContent = "Uploading...";

		try {
			// Create a canvas to combine the image with overlays and drawings
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");

			// Use the original image dimensions for the canvas to maintain quality
			var imgWidth, imgHeight;

			if (originalImageDimensions[currentFileIndex]) {
				imgWidth = originalImageDimensions[currentFileIndex].width;
				imgHeight = originalImageDimensions[currentFileIndex].height;
			} else {
				// Fallback to preview image dimensions
				imgWidth = previewImage.naturalWidth;
				imgHeight = previewImage.naturalHeight;
			}

			// Set canvas dimensions to match the original image
			canvas.width = imgWidth;
			canvas.height = imgHeight;

			// Draw the base image with applied filter
			var img = new Image();
			img.crossOrigin = "anonymous"; // Prevent CORS issues

			img.onload = () => {
				// Draw the base image at full resolution
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

				// Apply the selected filter
				if (selectedFilter !== "original") {
					// Apply filter effects manually to the canvas
					applyFilterToCanvas(ctx, canvas.width, canvas.height, selectedFilter);
				}

				// Draw all lines from the drawing canvas
				// Scale the drawing canvas to match the output canvas
				ctx.drawImage(drawingCanvas, 0, 0, canvas.width, canvas.height);

				// Draw text overlays
				textOverlays.forEach((overlay) => {
					var previewRect = previewImage.getBoundingClientRect();
					var rect = overlay.element.getBoundingClientRect();

					// Calculate position as percentage of the preview
					var xPercent = (rect.left - previewRect.left) / previewRect.width;
					var yPercent = (rect.top - previewRect.top) / previewRect.height;

					// Convert percentage to actual pixels in the canvas
					var x = xPercent * canvas.width;
					var y = yPercent * canvas.height;

					// Scale font size based on canvas dimensions
					var fontSize = Math.max(14, Math.floor(canvas.width / 30)); // Adjust font size based on image width

					ctx.font = `${fontSize}px ${overlay.font}`;
					ctx.fillStyle = overlay.color;
					ctx.fillText(overlay.text, x, y + fontSize); // Add fontSize to y to position text correctly
				});

				// Draw emoji overlays
				emojiOverlays.forEach((overlay) => {
					var previewRect = previewImage.getBoundingClientRect();
					var rect = overlay.element.getBoundingClientRect();

					// Calculate position as percentage of the preview
					var xPercent = (rect.left - previewRect.left) / previewRect.width;
					var yPercent = (rect.top - previewRect.top) / previewRect.height;

					// Convert percentage to actual pixels in the canvas
					var x = xPercent * canvas.width;
					var y = yPercent * canvas.height;

					// Scale emoji size based on canvas dimensions
					var emojiSize = Math.max(30, Math.floor(canvas.width / 15)); // Adjust emoji size based on image width

					ctx.font = `${emojiSize}px Arial`;
					ctx.fillText(overlay.emoji, x, y + emojiSize); // Add emojiSize to y to position emoji correctly
				});

				// Convert the canvas to a blob with maximum quality
				canvas.toBlob(
					(blob) => {
						// Create a new File object from the blob
						var compositeFile = new File([blob], "edited-image.jpg", {
							type: "image/jpeg",
						});

						// Create FormData for upload
						var uploadData = new FormData();
						uploadData.append("uploaded_files", compositeFile);

						console.log(
							"Uploading composite file with all edits:",
							compositeFile
						);
						console.log("Caption With Image:", imageCaption.value);
						var userProfile = manageUserProfile('read', 'all');
						// Also append the user id to the form data
						uploadData.append(
							"data",
							JSON.stringify({
								userId: userProfile.userId,
							})
						);
						
						var imagePreviewCont = jQuery('.editor__main').html();
						
						jsUpload("uploadPost", uploadData, {
							caption: imageCaption.value,
							imagePreviewCont: imagePreviewCont,
								onError: function (error) {
									showErrorMessage("Upload failed: " + error.message);
									shareImageButton.disabled = false;
									shareImageButton.textContent = "Next";
									imageProgressContainer.classList.add("media-upload__hidden");
								},
							});
						

						// Upload the composite image
						/*if (uploadType == "chatMedia") {
							var timestamp = Number(new Date().getTime() / 1000).toFixed(0);
							var userProfile = getProfileData();

							// Also append the user id to the form data
							uploadData.append(
								"data",
								JSON.stringify({
									userId: userProfile.userId,
									chatId: jQuery(".chat__header").data("chatId"),
									timeStamp: timestamp,
								})
							);

							jsUpload("uploadChatMedia", uploadData, {
								caption: imageCaption.value,
								onError: function (error) {
									showErrorMessage("Upload failed: " + error.message);
									shareImageButton.disabled = false;
									shareImageButton.textContent = "Share";
									imageProgressContainer.classList.add("media-upload__hidden");
								},
							});
						} else {
							jsUpload("groupChatImage", uploadData, {
								onError: function (error) {
									showErrorMessage("Upload failed: " + error.message);
									shareImageButton.disabled = false;
									shareImageButton.textContent = "Share";
									imageProgressContainer.classList.add("media-upload__hidden");
								},
							});
						}*/

						// Simulate upload progress
						let progress = 0;
						var progressInterval = setInterval(() => {
							progress += 5;
							if (progress >= 100) {
								clearInterval(progressInterval);

								// Show success
								shareImageButton.textContent = "Uploaded!";

								// Reset after delay
								setTimeout(() => {
									imageProgressContainer.classList.add("media-upload__hidden");
									shareImageButton.disabled = false;
									shareImageButton.textContent = "Next";

									// Go back to upload area
									resetUploader();
								}, 2000);

								return;
							}

							imageProgressFill.style.width = `${progress}%`;
							imageProgressText.textContent = `${progress}%`;
						}, 100);
					},
					"image/jpeg",
					1.0 // Maximum quality
				);
			};

			// Set the source of the image to the original image for maximum quality
			img.src = originalImages[currentFileIndex] || previewImage.src;
		} catch (error) {
			console.error("Error during image upload:", error);
			showErrorMessage("Error processing image: " + error.message);
			shareImageButton.disabled = false;
			shareImageButton.textContent = "Next";
			imageProgressContainer.classList.add("media-upload__hidden");
		}
	}

	// Apply filter effects to canvas
	function applyFilterToCanvas(ctx, width, height, filterId) {
		// This is a simplified implementation - in a real app, you'd implement more sophisticated filters
		switch (filterId) {
			case "filter--clarendon":
				// Increase contrast and saturation
				ctx.filter = "contrast(1.2) saturate(1.35)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--gingham":
				// Sepia and reduced saturation
				ctx.filter = "sepia(0.15) saturate(0.8)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--moon":
				// Grayscale with increased brightness
				ctx.filter = "grayscale(1) brightness(1.1)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--lark":
				// Brighten and increase contrast
				ctx.filter = "brightness(1.1) contrast(1.15)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--reyes":
				// Sepia and reduced contrast
				ctx.filter = "sepia(0.3) contrast(0.9) brightness(1.1)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--juno":
				// Warm tint and increased saturation
				ctx.filter = "saturate(1.4)";
				ctx.drawImage(ctx.canvas, 0, 0);
				// Add a warm overlay
				ctx.globalCompositeOperation = "overlay";
				ctx.fillStyle = "rgba(255, 170, 0, 0.1)";
				ctx.fillRect(0, 0, width, height);
				ctx.globalCompositeOperation = "source-over";
				ctx.filter = "none";
				break;
			case "filter--slumber":
				// Warm tint and reduced saturation
				ctx.filter = "saturate(0.8) brightness(1.05)";
				ctx.drawImage(ctx.canvas, 0, 0);
				// Add a warm overlay
				ctx.globalCompositeOperation = "overlay";
				ctx.fillStyle = "rgba(255, 140, 0, 0.1)";
				ctx.fillRect(0, 0, width, height);
				ctx.globalCompositeOperation = "source-over";
				ctx.filter = "none";
				break;
			case "filter--crema":
				// Cream tint
				ctx.filter = "sepia(0.2) saturate(1.1)";
				ctx.drawImage(ctx.canvas, 0, 0);
				// Add a cream overlay
				ctx.globalCompositeOperation = "overlay";
				ctx.fillStyle = "rgba(255, 250, 220, 0.15)";
				ctx.fillRect(0, 0, width, height);
				ctx.globalCompositeOperation = "source-over";
				ctx.filter = "none";
				break;
			case "filter--ludwig":
				// Slight warm tint and reduced saturation
				ctx.filter = "saturate(0.9) brightness(1.05)";
				ctx.drawImage(ctx.canvas, 0, 0);
				// Add a warm overlay
				ctx.globalCompositeOperation = "overlay";
				ctx.fillStyle = "rgba(255, 235, 205, 0.1)";
				ctx.fillRect(0, 0, width, height);
				ctx.globalCompositeOperation = "source-over";
				ctx.filter = "none";
				break;
		}
	}

	// Upload video
	function uploadVideo() {
		if (!videoHandler) return;

		// Show progress
		videoProgressContainer.classList.remove("media-upload__hidden");
		shareVideoButton.disabled = true;
		shareVideoButton.textContent = "Uploading...";

		// Upload using the S3 integration
		videoHandler
			.uploadVideoToS3(uploadType, videoCaption.value)
			.then((response) => {
				console.log("Upload successful:", response);

				// Show success
				shareVideoButton.textContent = "Uploaded!";

				// Reset after delay
				setTimeout(() => {
					videoProgressContainer.classList.add("media-upload__hidden");
					shareVideoButton.disabled = false;
					shareVideoButton.textContent = "Share";

					// Go back to upload area
					resetUploader();
				}, 2000);
			})
			.catch((error) => {
				console.error("Upload failed:", error);
				showErrorMessage("Upload failed: " + error.message);

				// Reset button
				shareVideoButton.disabled = false;
				shareVideoButton.textContent = "Share";
				videoProgressContainer.classList.add("media-upload__hidden");
			});
	}

	// Start cropping with improved quality preservation
	function startCropping() {
		// Save current image state to history before cropping
		cropHistory.push(previewImage.src);

		// Use the original image for cropping to maintain quality
		cropperImage.src = originalImages[currentFileIndex] || previewImage.src;
		cropperImage.style.transform = `rotate(${rotation}deg)`;

		// Reset aspect ratio selector to free by default
		aspectRatioSelect.value = "free";
		currentAspectRatio = "free";
		cropperRatioIndicator.textContent = "Free Crop";

		// Wait for the image to load to calculate the proper crop area
		cropperImage.onload = () => {
			// Get the image dimensions
			var imgWidth = cropperImage.naturalWidth;
			var imgHeight = cropperImage.naturalHeight;

			// Calculate a default crop area (centered, 80% of the smaller dimension)
			var cropSize = Math.min(
				80,
				(Math.min(imgWidth, imgHeight) / Math.max(imgWidth, imgHeight)) * 80
			);

			if (imgWidth > imgHeight) {
				// Landscape image - center the crop horizontally
				var leftOffset = (100 - cropSize) / 2;
				cropArea = { x: leftOffset, y: 10, width: cropSize, height: cropSize };
			} else {
				// Portrait or square image - center the crop vertically
				var topOffset = (100 - cropSize) / 2;
				cropArea = { x: 10, y: topOffset, width: cropSize, height: cropSize };
			}

			// Update the crop window with the new dimensions
			updateCropWindow();
		};

		imageEditorArea.classList.add("media-upload__hidden");
		cropperArea.classList.remove("media-upload__hidden");
	}

	function cancelCropping() {
		cropperArea.classList.add("media-upload__hidden");
		imageEditorArea.classList.remove("media-upload__hidden");
	}

	function rotateImage() {
		rotation = (rotation + 90) % 360;
		cropperImage.style.transform = `rotate(${rotation}deg)`;
	}

	function startDraggingCrop(e) {
		e.preventDefault();
		isDragging = true;

		var rect = cropperContainer.getBoundingClientRect();
		dragStart = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

	function handleTouchStartCrop(e) {
		e.preventDefault();
		isDragging = true;

		var touch = e.touches[0];
		var rect = cropperContainer.getBoundingClientRect();
		dragStart = {
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top,
		};
	}

	function handleDraggingCrop(e) {
		if (!isDragging) return;

		var rect = cropperContainer.getBoundingClientRect();
		var containerWidth = rect.width;
		var containerHeight = rect.height;

		// Calculate deltas
		var deltaX = ((e.clientX - rect.left - dragStart.x) / containerWidth) * 100;
		var deltaY = ((e.clientY - rect.top - dragStart.y) / containerHeight) * 100;

		updateCropPosition(deltaX, deltaY);

		// Update drag start position
		dragStart = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

	function handleTouchMoveCrop(e) {
		if (!isDragging) return;
		e.preventDefault();

		var touch = e.touches[0];
		var rect = cropperContainer.getBoundingClientRect();
		var containerWidth = rect.width;
		var containerHeight = rect.height;

		// Calculate deltas
		var deltaX =
			((touch.clientX - rect.left - dragStart.x) / containerWidth) * 100;
		var deltaY =
			((touch.clientY - rect.top - dragStart.y) / containerHeight) * 100;

		updateCropPosition(deltaX, deltaY);

		// Update drag start position
		dragStart = {
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top,
		};
	}

	function updateCropPosition(deltaX, deltaY) {
		if (activeHandle) {
			// Get aspect ratio if needed
			let aspectRatio = 1; // Default to 1:1

			if (currentAspectRatio !== "free") {
				switch (currentAspectRatio) {
					case "1:1":
						aspectRatio = 1;
						break;
					case "4:3":
						aspectRatio = 4 / 3;
						break;
					case "16:9":
						aspectRatio = 16 / 9;
						break;
					case "3:2":
						aspectRatio = 3 / 2;
						break;
					case "original":
						if (originalImageDimensions[currentFileIndex]) {
							aspectRatio =
								originalImageDimensions[currentFileIndex].width /
								originalImageDimensions[currentFileIndex].height;
						}
						break;
				}
			}

			// Resize from handle
			if (activeHandle === "nw") {
				// Northwest handle (top-left)
				let widthChange = -deltaX;
				let heightChange = -deltaY;

				// Maintain aspect ratio if needed
				if (currentAspectRatio !== "free") {
					// Use the larger of the two changes to maintain aspect ratio
					if (Math.abs(widthChange) > Math.abs(heightChange * aspectRatio)) {
						heightChange = widthChange / aspectRatio;
					} else {
						widthChange = heightChange * aspectRatio;
					}
				}

				// Update x and width
				var newX = Math.max(
					0,
					Math.min(cropArea.x + cropArea.width - 10, cropArea.x - widthChange)
				);
				var newWidth = Math.max(
					10,
					Math.min(cropArea.width + widthChange, 100 - newX)
				);

				// Update y and height
				var newY = Math.max(
					0,
					Math.min(cropArea.y + cropArea.height - 10, cropArea.y - heightChange)
				);
				var newHeight = Math.max(
					10,
					Math.min(cropArea.height + heightChange, 100 - newY)
				);

				// If maintaining aspect ratio, adjust height based on width
				if (currentAspectRatio !== "free") {
					newHeight = newWidth / aspectRatio;

					// Check if height is within bounds
					if (newY + newHeight > 100) {
						newHeight = 100 - newY;
						newWidth = newHeight * aspectRatio;
						newX = cropArea.x + cropArea.width - newWidth;
					}
				}

				cropArea = { x: newX, y: newY, width: newWidth, height: newHeight };
			} else if (activeHandle === "ne") {
				// Northeast handle (top-right)
				let widthChange = deltaX;
				let heightChange = -deltaY;

				// Maintain aspect ratio if needed
				if (currentAspectRatio !== "free") {
					// Use the larger of the two changes to maintain aspect ratio
					if (Math.abs(widthChange) > Math.abs(heightChange * aspectRatio)) {
						heightChange = widthChange / aspectRatio;
					} else {
						widthChange = heightChange * aspectRatio;
					}
				}

				// Update width
				var newWidth = Math.max(
					10,
					Math.min(100 - cropArea.x, cropArea.width + widthChange)
				);

				// Update y and height
				var newY = Math.max(
					0,
					Math.min(cropArea.y + cropArea.height - 10, cropArea.y - heightChange)
				);
				var newHeight = Math.max(
					10,
					Math.min(cropArea.height + heightChange, 100 - newY)
				);

				// If maintaining aspect ratio, adjust height based on width
				if (currentAspectRatio !== "free") {
					newHeight = newWidth / aspectRatio;

					// Check if height is within bounds
					if (newY + newHeight > 100) {
						newHeight = 100 - newY;
						newWidth = newHeight * aspectRatio;
					}
				}

				cropArea = {
					x: cropArea.x,
					y: newY,
					width: newWidth,
					height: newHeight,
				};
			} else if (activeHandle === "sw") {
				// Southwest handle (bottom-left)
				let widthChange = -deltaX;
				let heightChange = deltaY;

				// Maintain aspect ratio if needed
				if (currentAspectRatio !== "free") {
					// Use the larger of the two changes to maintain aspect ratio
					if (Math.abs(widthChange) > Math.abs(heightChange * aspectRatio)) {
						heightChange = widthChange / aspectRatio;
					} else {
						widthChange = heightChange * aspectRatio;
					}
				}

				// Update x and width
				var newX = Math.max(
					0,
					Math.min(cropArea.x + cropArea.width - 10, cropArea.x - widthChange)
				);
				var newWidth = Math.max(
					10,
					Math.min(cropArea.width + widthChange, 100 - newX)
				);

				// Update height
				var newHeight = Math.max(
					10,
					Math.min(100 - cropArea.y, cropArea.height + heightChange)
				);

				// If maintaining aspect ratio, adjust height based on width
				if (currentAspectRatio !== "free") {
					newHeight = newWidth / aspectRatio;

					// Check if height is within bounds
					if (cropArea.y + newHeight > 100) {
						newHeight = 100 - cropArea.y;
						newWidth = newHeight * aspectRatio;
						newX = cropArea.x + cropArea.width - newWidth;
					}
				}

				cropArea = {
					x: newX,
					y: cropArea.y,
					width: newWidth,
					height: newHeight,
				};
			} else if (activeHandle === "se") {
				// Southeast handle (bottom-right)
				let widthChange = deltaX;
				let heightChange = deltaY;

				// Maintain aspect ratio if needed
				if (currentAspectRatio !== "free") {
					// Use the larger of the two changes to maintain aspect ratio
					if (Math.abs(widthChange) > Math.abs(heightChange * aspectRatio)) {
						heightChange = widthChange / aspectRatio;
					} else {
						widthChange = heightChange * aspectRatio;
					}
				}

				// Update width and height
				var newWidth = Math.max(
					10,
					Math.min(100 - cropArea.x, cropArea.width + widthChange)
				);
				var newHeight = Math.max(
					10,
					Math.min(100 - cropArea.y, cropArea.height + heightChange)
				);

				// If maintaining aspect ratio, adjust height based on width
				if (currentAspectRatio !== "free") {
					newHeight = newWidth / aspectRatio;

					// Check if height is within bounds
					if (cropArea.y + newHeight > 100) {
						newHeight = 100 - cropArea.y;
						newWidth = newHeight * aspectRatio;
					}
				}

				cropArea = {
					x: cropArea.x,
					y: cropArea.y,
					width: newWidth,
					height: newHeight,
				};
			}
		} else {
			// Move the entire crop window
			var newX = Math.max(
				0,
				Math.min(100 - cropArea.width, cropArea.x + deltaX)
			);
			var newY = Math.max(
				0,
				Math.min(100 - cropArea.height, cropArea.y + deltaY)
			);

			cropArea = { ...cropArea, x: newX, y: newY };
		}

		// Update crop window position
		updateCropWindow();
	}

	function stopDraggingCrop() {
		isDragging = false;
		activeHandle = null;
	}

	function updateCropWindow() {
		cropWindow.style.left = `${cropArea.x}%`;
		cropWindow.style.top = `${cropArea.y}%`;
		cropWindow.style.width = `${cropArea.width}%`;
		cropWindow.style.height = `${cropArea.height}%`;
	}

	// Apply crop with quality preservation
	function applyCrop() {
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");

		// Create a new image to get the original dimensions
		var img = new Image();
		img.crossOrigin = "anonymous"; // Prevent CORS issues

		img.onload = () => {
			// Get the natural dimensions of the image
			var imgWidth = img.naturalWidth;
			var imgHeight = img.naturalHeight;

			// Calculate the crop area in the original image coordinates
			var cropX = (cropArea.x / 100) * imgWidth;
			var cropY = (cropArea.y / 100) * imgHeight;
			var cropWidth = (cropArea.width / 100) * imgWidth;
			var cropHeight = (cropArea.height / 100) * imgHeight;

			// Set canvas dimensions to match the crop area at FULL RESOLUTION
			canvas.width = cropWidth;
			canvas.height = cropHeight;

			// Apply rotation if needed
			if (rotation !== 0) {
				ctx.save();
				ctx.translate(canvas.width / 2, canvas.height / 2);
				ctx.rotate((rotation * Math.PI) / 180);
				ctx.drawImage(
					img,
					cropX,
					cropY,
					cropWidth,
					cropHeight,
					-cropWidth / 2,
					-cropHeight / 2,
					cropWidth,
					cropHeight
				);
				ctx.restore();
			} else {
				ctx.drawImage(
					img,
					cropX,
					cropY,
					cropWidth,
					cropHeight,
					0,
					0,
					cropWidth,
					cropHeight
				);
			}

			// Get the cropped image as data URL with maximum quality
			var croppedImageUrl = canvas.toDataURL("image/jpeg", 1.0);

			// Update the preview image
			previewImage.src = croppedImageUrl;

			// Create a new File object from the data URL
			fetch(croppedImageUrl)
				.then((res) => res.blob())
				.then((blob) => {
					selectedFiles[currentFileIndex] = new File(
						[blob],
						"cropped-image.jpg",
						{ type: "image/jpeg" }
					);

					// Update thumbnail
					var thumbnail = document.querySelector(
						`.thumbnail[data-index="${currentFileIndex}"] img`
					);
					if (thumbnail) {
						thumbnail.src = croppedImageUrl;
					}

					// Update original image dimensions
					originalImageDimensions[currentFileIndex] = {
						width: canvas.width,
						height: canvas.height,
					};
				})
				.catch((err) => {
					console.error("Error creating file from cropped image:", err);
					showErrorMessage("Error creating cropped image: " + err.message);
				});

			// Return to editor
			cropperArea.classList.add("media-upload__hidden");
			imageEditorArea.classList.remove("media-upload__hidden");

			// Reset rotation for the preview
			rotation = 0;
			applyFilter();

			// Update canvas size for drawing
			updateCanvasSize();
		};

		// Use the original image for cropping to maintain quality
		img.src = cropperImage.src;
	}

	// Reset to original image
	function resetToOriginal() {
		// Get the original image for the current file
		var originalImage = originalImages[currentFileIndex];
		if (originalImage) {
			// Set the cropper image to the original
			cropperImage.src = originalImage;
			cropperImage.style.transform = `rotate(0deg)`;
			rotation = 0;

			// Reset crop area to default
			var imgWidth = cropperImage.naturalWidth;
			var imgHeight = cropperImage.naturalHeight;

			// Calculate a default crop area (centered, 80% of the smaller dimension)
			var cropSize = Math.min(
				80,
				(Math.min(imgWidth, imgHeight) / Math.max(imgWidth, imgHeight)) * 80
			);

			if (imgWidth > imgHeight) {
				// Landscape image - center the crop horizontally
				var leftOffset = (100 - cropSize) / 2;
				cropArea = { x: leftOffset, y: 10, width: cropSize, height: cropSize };
			} else {
				// Portrait or square image - center the crop vertically
				var topOffset = (100 - cropSize) / 2;
				cropArea = { x: 10, y: topOffset, width: cropSize, height: cropSize };
			}

			// Update the crop window
			updateCropWindow();
		}
	}

	// Video Attachment Handler
	function handleVideoAttachment(videoElement, options = {}) {
		// Default options
		var config = {
			allowTrim: true,
			allowVolumeControl: true,
			maxDuration: 60, // seconds
			showControls: true,
			autoPlay: false,
			...options,
		};

		// State variables
		var videoSrc = null;
		let videoFile = null;
		let startTime = 0;
		let endTime = 0;
		let volume = 1;
		let isMuted = false;
		let isPlaying = false;
		let videoDuration = 0;

		// Create UI elements for video controls
		var createVideoControls = (videoContainer) => {
			var controlsContainer = document.createElement("div");
			controlsContainer.className = "video-controls";

			// Play/Pause button
			var playButton = document.createElement("button");
			playButton.className = "video-control-btn play-btn";
			playButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      `;
			playButton.addEventListener("click", togglePlay);

			// Volume button
			var volumeButton = document.createElement("button");
			volumeButton.className = "video-control-btn volume-btn";
			volumeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
      `;
			volumeButton.addEventListener("click", toggleMute);

			// Volume slider
			var volumeSlider = document.createElement("input");
			volumeSlider.type = "range";
			volumeSlider.min = 0;
			volumeSlider.max = 1;
			volumeSlider.step = 0.1;
			volumeSlider.value = volume;
			volumeSlider.className = "volume-slider";
			volumeSlider.addEventListener("input", (e) => {
				setVolume(Number.parseFloat(e.target.value));
			});

			// Progress bar
			var progressContainer = document.createElement("div");
			progressContainer.className = "video-progress-container";

			var progressBar = document.createElement("div");
			progressBar.className = "video-progress-bar";

			var progressFill = document.createElement("div");
			progressFill.className = "video-progress-fill";

			// Trim controls (if enabled)
			if (config.allowTrim) {
				var startTrimHandle = document.createElement("div");
				startTrimHandle.className = "trim-handle trim-handle-start";
				startTrimHandle.addEventListener("mousedown", (e) =>
					startDraggingTrimHandle(e, "start")
				);

				var endTrimHandle = document.createElement("div");
				endTrimHandle.className = "trim-handle trim-handle-end";
				endTrimHandle.addEventListener("mousedown", (e) =>
					startDraggingTrimHandle(e, "end")
				);

				var trimRegion = document.createElement("div");
				trimRegion.className = "trim-region";

				progressBar.appendChild(startTrimHandle);
				progressBar.appendChild(trimRegion);
				progressBar.appendChild(endTrimHandle);
			}

			progressBar.appendChild(progressFill);
			progressContainer.appendChild(progressBar);

			// Time display
			var timeDisplay = document.createElement("div");
			timeDisplay.className = "time-display";
			timeDisplay.textContent = "0:00 / 0:00";

			// Add all elements to controls container
			controlsContainer.appendChild(playButton);
			if (config.allowVolumeControl) {
				controlsContainer.appendChild(volumeButton);
				controlsContainer.appendChild(volumeSlider);
			}
			controlsContainer.appendChild(progressContainer);
			controlsContainer.appendChild(timeDisplay);

			videoContainer.appendChild(controlsContainer);

			return {
				controlsContainer,
				playButton,
				volumeButton,
				volumeSlider,
				progressBar,
				progressFill,
				timeDisplay,
			};
		};

		// Initialize video player
		var initVideoPlayer = (videoElement, videoSrc, file) => {
			// Store video file
			videoFile = file;

			// Set video source
			videoElement.src = videoSrc;

			// Set video attributes
			videoElement.controls = false;
			videoElement.autoplay = config.autoPlay;
			videoElement.volume = volume;

			// Create container for video and controls
			var videoContainer = document.createElement("div");
			videoContainer.className = "video-attachment-container";

			// Check if videoElement has a parent before removing
			if (videoElement.parentElement) {
				// Insert video into container
				var parentElement = videoElement.parentElement;
				parentElement.removeChild(videoElement);
				videoContainer.appendChild(videoElement);
				parentElement.appendChild(videoContainer);
			} else {
				// If no parent, just append to container and add container to body
				videoContainer.appendChild(videoElement);
				document.body.appendChild(videoContainer);
			}

			// Create custom controls
			var controls = createVideoControls(videoContainer);

			// Event listeners for video
			videoElement.addEventListener("loadedmetadata", () => {
				videoDuration = videoElement.duration;
				endTime = videoElement.duration;
				updateTimeDisplay(controls.timeDisplay);

				// Position trim handles
				if (config.allowTrim) {
					var startHandle = videoContainer.querySelector(".trim-handle-start");
					var endHandle = videoContainer.querySelector(".trim-handle-end");
					var trimRegion = videoContainer.querySelector(".trim-region");

					if (startHandle && endHandle && trimRegion) {
						startHandle.style.left = "0%";
						endHandle.style.left = "100%";
						trimRegion.style.left = "0%";
						trimRegion.style.width = "100%";
					}
				}
			});

			videoElement.addEventListener("timeupdate", () => {
				var currentTime = videoElement.currentTime;
				var progress = (currentTime / videoDuration) * 100;
				controls.progressFill.style.width = `${progress}%`;
				updateTimeDisplay(controls.timeDisplay);

				// If current time exceeds trim end time, seek back to start time
				if (config.allowTrim && currentTime >= endTime) {
					videoElement.currentTime = startTime;
					if (!isPlaying) {
						videoElement.pause();
					}
				}
			});

			videoElement.addEventListener("play", () => {
				isPlaying = true;
				controls.playButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        `;
			});

			videoElement.addEventListener("pause", () => {
				isPlaying = false;
				controls.playButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        `;
			});

			// Click on progress bar to seek
			controls.progressBar.addEventListener("click", (e) => {
				var rect = controls.progressBar.getBoundingClientRect();
				var pos = (e.clientX - rect.left) / rect.width;
				videoElement.currentTime = pos * videoDuration;
			});

			// Play video for 1 second then pause (preview)
			if (typeof autplayVideoForOneSec === "function") {
				autplayVideoForOneSec("#videoPreview");
			} else {
				// Fallback if the function doesn't exist
				videoElement.play();
				setTimeout(() => {
					videoElement.pause();
				}, 1000);
			}

			return {
				videoContainer,
				controls,
			};
		};

		// Toggle play/pause
		var togglePlay = () => {
			if (videoElement.paused) {
				videoElement.play();
			} else {
				videoElement.pause();
			}
		};

		// Toggle mute
		var toggleMute = () => {
			isMuted = !isMuted;
			videoElement.muted = isMuted;

			var volumeButton = document.querySelector(".volume-btn");
			if (volumeButton) {
				if (isMuted) {
					volumeButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          `;
				} else {
					volumeButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          `;
				}
			}
		};

		// Set volume
		var setVolume = (value) => {
			volume = value;
			videoElement.volume = volume;

			// Update mute state based on volume
			if (volume === 0) {
				isMuted = true;
				videoElement.muted = true;
			} else if (isMuted) {
				isMuted = false;
				videoElement.muted = false;
			}
		};

		// Format time (seconds to MM:SS)
		var formatTime = (seconds) => {
			var minutes = Math.floor(seconds / 60);
			var secs = Math.floor(seconds % 60);
			return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
		};

		// Update time display
		var updateTimeDisplay = (timeDisplay) => {
			if (!timeDisplay) return;
			var currentTime = videoElement.currentTime;
			timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(
				videoDuration
			)}`;
		};

		// Trim video handlers
		let isDraggingTrim = false;
		let activeTrimHandle = null;

		var startDraggingTrimHandle = (e, handle) => {
			e.preventDefault();
			isDraggingTrim = true;
			activeTrimHandle = handle;

			document.addEventListener("mousemove", handleTrimDrag);
			document.addEventListener("mouseup", stopDraggingTrim);
		};

		var handleTrimDrag = (e) => {
			if (!isDraggingTrim) return;

			var progressBar = document.querySelector(".video-progress-bar");
			if (!progressBar) return;

			var rect = progressBar.getBoundingClientRect();
			var pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

			var startHandle = document.querySelector(".trim-handle-start");
			var endHandle = document.querySelector(".trim-handle-end");
			var trimRegion = document.querySelector(".trim-region");

			if (!startHandle || !endHandle || !trimRegion) return;

			if (activeTrimHandle === "start") {
				var endPos = Number.parseFloat(endHandle.style.left) / 100;
				if (pos < endPos) {
					startTime = pos * videoDuration;
					startHandle.style.left = `${pos * 100}%`;
					trimRegion.style.left = `${pos * 100}%`;
					trimRegion.style.width = `${(endPos - pos) * 100}%`;

					// Seek to start time
					videoElement.currentTime = startTime;
				}
			} else if (activeTrimHandle === "end") {
				var startPos = Number.parseFloat(startHandle.style.left) / 100;
				if (pos > startPos) {
					endTime = pos * videoDuration;
					endHandle.style.left = `${pos * 100}%`;
					trimRegion.style.width = `${(pos - startPos) * 100}%`;
				}
			}
		};

		var stopDraggingTrim = () => {
			isDraggingTrim = false;
			document.removeEventListener("mousemove", handleTrimDrag);
			document.removeEventListener("mouseup", stopDraggingTrim);
		};

		// Upload video to S3 using existing API
		var uploadVideoToS3 = async (
			uploadType = "chatMedia",
			captionText = ""
		) => {
			if (!videoFile) {
				throw new Error("No video selected");
			}

			// Create FormData for upload
			var uploadData = new FormData();

			// Create a new filename with timestamp to avoid conflicts
			var timestamp = Date.now();
			var fileExtension = videoFile.name.split(".").pop();
			var newFileName = `video-${timestamp}.${fileExtension}`;

			// Create a new File object with the new name
			var videoFileToUpload = new File([videoFile], newFileName, {
				type: videoFile.type,
			});

			// Append the file to FormData with the key "uploaded_files"
			uploadData.append("uploaded_files", videoFileToUpload);

			// If this is for chat media, add the required metadata
			if (uploadType === "chatMedia") {
				var timestamp = Number(new Date().getTime() / 1000).toFixed(0);
				var userProfile = getProfileData();

				// Append the user id to the form data
				uploadData.append(
					"data",
					JSON.stringify({
						userId: userProfile.userId,
						chatId: jQuery(".chat__header").data("chatId") || "demo-chat-id",
						timeStamp: timestamp,
						// Add trim information if needed
						videoTrim: config.allowTrim
							? {
									startTime: startTime,
									endTime: endTime,
							  }
							: null,
					})
				);

				// Call the existing jsUpload function
				return jsUpload("uploadChatMedia", uploadData, {
					caption: captionText,
					onError: function (error) {
						showErrorMessage("Video upload failed: " + error.message);
					},
				});
			} else {
				// For other upload types
				return jsUpload("uploadMedia", uploadData, {
					caption: captionText,
					mediaType: "video",
					onError: function (error) {
						showErrorMessage("Video upload failed: " + error.message);
					},
				});
			}
		};

		// Public API
		return {
			initVideoPlayer,
			togglePlay,
			toggleMute,
			setVolume,
			uploadVideoToS3,

			// Getters
			getStartTime: () => startTime,
			getEndTime: () => endTime,
			getVolume: () => volume,
			isMuted: () => isMuted,
			isPlaying: () => isPlaying,
		};
	}

	// Add CSS styles for the improved UI
	const styleElement = document.createElement("style");
	styleElement.textContent = `
    /* Loading indicator */
    .preview__image.loading {
      opacity: 0.7;
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 0.7; }
      50% { opacity: 0.5; }
      100% { opacity: 0.7; }
    }
    
    /* Error message container */
    .error-message-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 300px;
    }
    
    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .error-icon {
      color: #721c24;
      flex-shrink: 0;
    }
    
    .error-message p {
      margin: 0;
      flex-grow: 1;
    }
    
    /* Aspect ratio selector */
    .aspect-ratio-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-right: 20px;
    }
    
    .aspect-ratio-selector select {
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid #ccc;
      background-color: white;
    }
    
    .cropper__ratio-indicator {
      text-align: center;
      margin-bottom: 10px;
      font-size: 14px;
      color: #666;
    }
    
    /* Improved cropper */
    .cropper__window {
      border: 2px solid white;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    }
    
    .cropper__handle {
      width: 12px;
      height: 12px;
      background-color: white;
      border-radius: 50%;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    }
  `;
	document.head.appendChild(styleElement);
}

function convertHeicToJpegNew(file) {
    return new Promise((resolve, reject) => {
        // Check if heic2any is available
        if (typeof heic2any === 'undefined') {
            return reject(new Error('heic2any library is not loaded'));
        }

        let reader = new FileReader();

        // Handle FileReader errors
        reader.onerror = function() {
            reject(new Error('Failed to read file: ' + reader.error));
        };

        reader.onload = function(event) {
            // Create a Blob from the file data
            let blob = new Blob([event.target.result]);

            // Convert the Blob to a JPEG image
            heic2any({
                blob: blob,
                toType: "image/jpeg", // Use "image/jpeg" instead of "image/jpg" for better compatibility
                quality: 0.9 // Slightly reduce quality to improve compatibility
            })
            .then(function(jpegBlob) {
                // heic2any can return an array in some cases
                const resultBlob = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob;
                
                // Create a File from the JPEG Blob
                // Change extension from .heic/.heif to .jpg
                const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
                
                let jpegFile = new File([resultBlob], newFileName, {
                    type: 'image/jpeg',
                });

                // Resolve the Promise with the JPEG File
                resolve(jpegFile);
            })
            .catch(function(error) {
                console.error('Error converting HEIC to JPEG:', error);
                
                // If it's the specific ERR_LIBHEIF error, try the fallback method
                if (error.message && error.message.includes('ERR_LIBHEIF')) {
                    console.log('Attempting fallback conversion method...');
                    tryFallbackConversion(blob, file.name)
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(error);
                }
            });
        };

        // Read the file as an ArrayBuffer
        reader.readAsArrayBuffer(file);
    });
}

// Fallback conversion using canvas (works for some HEIC files)
function tryFallbackConversion(blob, fileName) {
    return new Promise((resolve, reject) => {
        // Create an object URL from the blob
        const objectUrl = URL.createObjectURL(blob);
        
        // Create an image element
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Prevent CORS issues
        
        // Set up load handler
        img.onload = function() {
            // Revoke the object URL to free memory
            URL.revokeObjectURL(objectUrl);
            
            // Create a canvas with the image dimensions
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Convert the canvas to a JPEG blob
            canvas.toBlob(function(jpegBlob) {
                if (!jpegBlob) {
                    return reject(new Error('Canvas to Blob conversion failed'));
                }
                
                // Create a new filename
                const newFileName = fileName.replace(/\.(heic|heif)$/i, '.jpg');
                
                // Create a File from the JPEG Blob
                const jpegFile = new File([jpegBlob], newFileName, {
                    type: 'image/jpeg'
                });
                
                resolve(jpegFile);
            }, 'image/jpeg', 0.9);
        };
        
        // Set up error handler
        img.onerror = function() {
            // Revoke the object URL to free memory
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image for fallback conversion'));
        };
        
        // Try to load the image
        // Note: This may not work for all HEIC files, but it's worth trying
        img.src = objectUrl;
    });
}

// Function to convert Android SDK response to Web format
function convertAndroidToWebFormat(androidResp) {
	console.log("Converting Android SDK response to Web format...", androidResp);
	androidResp = JSON.parse(androidResp);
	var paymentDetails = globalDataForAndroid;
	console.log("Payment details from globalDataForAndroid:", JSON.stringify(paymentDetails));
    var formattedPaymentDetails = {
        id: androidResp.paymentId,
        entity: "payment",
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: "captured",
        order_id: androidResp.orderId,
        invoice_id: paymentDetails.invoice_id || null,
        international: paymentDetails.international || false,
        method: paymentDetails.method,
        amount_refunded: paymentDetails.amount_refunded || 0,
        refund_status: paymentDetails.refund_status || null,
        captured: paymentDetails.captured !== undefined ? paymentDetails.captured : true,
        description: paymentDetails.description || `Auth txn for ${androidResp.orderId}`,
        card_id: paymentDetails.card_id || null,
        bank: paymentDetails.bank || null,
        wallet: paymentDetails.wallet || null,
        vpa: paymentDetails.vpa || null,
        email: androidResp.userEmail,
        contact: androidResp.userContact,
        notes: paymentDetails.notes || {},
        fee: paymentDetails.fee || 0,
        tax: paymentDetails.tax || 0,
        error_code: paymentDetails.error_code || null,
        error_description: paymentDetails.error_description || null,
        error_source: paymentDetails.error_source || null,
        error_step: paymentDetails.error_step || null,
        error_reason: paymentDetails.error_reason || null,
        acquirer_data: paymentDetails.acquirer_data || {},
        created_at: paymentDetails.created_at || Math.floor(Date.now() / 1000),
        upi: paymentDetails.upi || null
	};
	
	managePayments('onPaymentResponse', formattedPaymentDetails);
	
	
}

/*function onCancelPayment() {
	currData = JSON.parse(localStorage.getItem('razorPayTmpData'));
	localStorage.removeItem('razorPayTmpData');

	payload = {};
	if (currData.notes.source == 'premium') {
		payload.orderType = 'premium';
		payload.selectedOption = currData.notes.packageId;
		fbEvent('premium-pay-cancelled');
		webAnalytics('premium_purchase_cancelled');
		if (manageUserProfile('read', 'isVerified') != true) {
			var getUserDetails = manageUserProfile('read', 'all');
			if (getUserDetails && getUserDetails.phoneNumber && getUserDetails.dialCode && getUserDetails.phoneNumber.length > 0 && getUserDetails.dialCode.length > 0) {
				jsInit('whatsAppNewQuickReplies', { phoneNumber: getUserDetails.phoneNumber, dialCode: getUserDetails.dialCode, templateName: 'findbuddy_3x_faster', imgUrl: 'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Feed%20Card%20Images%2Fin-app-modify.webp?alt=media&token=db44a12d-bbf5-4a19-8990-2df50b4d7230', userFullName: getUserDetails.name });
				
			}
		}
	}
	else if (currData.notes.source == 'tboFlights'){
		payload.orderType = 'flights';
		payload.selectedOption = 'Booking canceled';
		
		// For Showing only the continue button in the footer so that user can restart with the booking
		//updateFooterContinue('reviewPaxDetails', '', '', 'Continue');
		jQuery('.flights__footer-continue').filter('.ssr').hide();
		fbEvent('flights-pay-cancelled');

	}
	else {
		payload.orderType = 'experience';
		payload.selectedOption = currData.notes.calendarSlotId;
		fbEvent('experience-pay-cancelled');
	}
	

	try {
		if (isAndroid()) {
			// Request to remove the app in wakelock / keep the app alive
			//Android.removeKeepAlive();
		}
		jsInit("addCancelledOrder", payload);
	}
	catch (error) {
		console.log(error.message);
	}

	console.log(currData.notes.source);
}*/

function captureFIAMEvents(eventName, eventData) {
	if (isAndroid()) {
		try {
			Android.captureFIAMEventsNative(eventName, JSON.stringify(eventData));
		} catch (error) {
			console.error("Error capturing FIAM event on Android:", error);
		}
	}
}

// Create a function which shows a popup to the user every day once
function showPopup() {
	if (!isAndroid() && !isIOS()) {
		// Get the current date
		var currentDate = new Date();
		var currentDateString = currentDate.toISOString().split('T')[0];
	
		// Get the last shown date from localStorage
		var lastShownDate = localStorage.getItem('popupShownDate');
	
		// If the last shown date is the same as the current date, return
		if (lastShownDate === currentDateString) {
			return;
		}
	
		// Otherwise, show the popup
		createAndShowPopup();
	}
}

function createAndShowPopup(imageUrl, forPremium) {
	if (/*!isAndroid() && !isIOS() &&*/ manageUserProfile('read', 'isVerified') != true || forPremium == 'copy-coupon') {
		// if ((isAndroid() || isIOS()) && forPremium != true	) {
		// 	return;
		// }
		// Create popup container
		var popupClass = forPremium == 'popup-premium' ? 'popup-premium' : forPremium == 'login' ? 'login' : forPremium == 'flight-search-back' || forPremium == 'copy-coupon' ? 'flight-search-back' : '';
		const popup = document.createElement('div');
		popup.className = 'popup';
    
		// Create popup content container
		const popupContent = document.createElement('div');
		popupContent.className = 'popup__content ' + popupClass;
    
		// Create image element
		const image = document.createElement('img');
		image.src = imageUrl;
		image.alt = 'Popup Image';
		image.className = 'popup__image'; // Add class for styling
    
		// Create close button
		const closeButton = document.createElement('div');
		closeButton.className = 'cross-button';
		closeButton.innerHTML = '×';
    
		// Assemble the structure
		popupContent.appendChild(image);
		popup.appendChild(popupContent);
		popupContent.appendChild(closeButton);
    
		// Add to document
		document.body.appendChild(popup);
    
		// Add click event to close button
		closeButton.addEventListener('click', (e) => {
			e.stopPropagation();
			popup.remove();
		});
    
		// Add click event to background to close
		popup.addEventListener('click', (e) => {
			if (e.target === popup) {
				popup.remove();
			}
		});
    
		// Add escape key to close
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				popup.remove();
			}
		});
	}
}

function transferLocalStorageToSharedPreferences() {
	if (!guestMaster()) {
		if (isAndroid() || isIOS()) {
			// Deleting the token from local storage for Android only as its causing issues with the token transfer
			try {
				if (isAndroid()) {
					Android.deleteToken();
				}			
			}
			catch (error) {
				console.error("Error deleting Token from Shared Preferences:", error);
			}
			
			
			// Get Token from Local Storage
			var token = localStorage.getItem('token');
			if (token) {
				try {
					if (isAndroid()) {
						//Android.transferToken(token);
					}
					else if (isIOS()) {
						window.webkit.messageHandlers.transferToken.postMessage({ token: token });
					}
				}
				catch (error) {
					console.error("Error transferring Local Storage to Shared Preferences:", error);
				}
				
			}
		}
	}
	else {
		try {
			if (isAndroid() || isIOS()) {
				if (isAndroid()) {
					//Android.deleteToken();
				}
				else {
					window.webkit.messageHandlers.deleteToken.postMessage();
				}
			}			
		}
		catch (error) {
			console.error("Error deleting Token from Shared Preferences:", error);
		}
		
	}
}

function shouldShowAd(postIndex) {
    // Don't show ads too frequently
    if ((postIndex + 1) % AD_INTERVAL !== 0) {
        return false;
    }
    
    // // Don't show ads to premium users
    // if (userProfile && userProfile.isPremium) {
    //     return false;
    // }
    
    // Don't show ads to new users immediately
    if (guestMaster() && postIndex < 2) {
        return false;
    }
    
    // // Don't show ads in certain sections
    // if (currentTab === 'messages' || currentTab === 'profile') {
    //     return false;
    // }
    
    return true;
}

function openNewChat(stringPayload) {
	var currentUrl = window.location.href;
	var baseUrl = '';
	if (currentUrl.includes('localhost')) {
		baseUrl = 'http://localhost:3000/newChat?';
	}
	else if (currentUrl.includes('dev.beatravelbuddy.com')) {
		baseUrl = 'https://dev.beatravelbuddy.com/newChat?';
	}
	else {
		baseUrl = 'https://beatravelbuddy.com/newChat?';
	}
	window.open(baseUrl + stringPayload, '_self');
}

function isValidEmail(email) {
	// Return false if email is empty, null, or undefined
	if (!email || typeof email !== 'string') {
		return false;
	}
	
	// Trim whitespace
	email = email.trim();
	
	// Basic structure check: must contain exactly one @
	if (email.indexOf('@') === -1 || email.split('@').length !== 2) {
		return false;
	}
	
	const [localPart, domain] = email.split('@');
	
	// Local part validation (before @)
	// - Cannot be empty
	// - Cannot start or end with a dot
	// - Cannot have consecutive dots
	// - Max length 64 characters
	if (!localPart || 
		localPart.length === 0 || 
		localPart.length > 64 ||
		localPart.startsWith('.') || 
		localPart.endsWith('.') ||
		localPart.includes('..')) {
		return false;
	}
	
	// Domain validation (after @)
	// - Cannot be empty
	// - Must contain at least one dot
	// - Cannot start or end with a dot or hyphen
	// - Max length 255 characters
	if (!domain || 
		domain.length === 0 || 
		domain.length > 255 ||
		domain.indexOf('.') === -1 ||
		domain.startsWith('.') || 
		domain.endsWith('.') ||
		domain.startsWith('-') || 
		domain.endsWith('-') ||
		domain.includes('..')) {
		return false;
	}
	
	// TLD validation (last part after final dot)
	// - Must be at least 2 characters
	// - Must contain only letters (no numbers or special chars in TLD)
	// - Max length 63 characters
	const domainParts = domain.split('.');
	const tld = domainParts[domainParts.length - 1];
	
	if (!tld || 
		tld.length < 2 || 
		tld.length > 63 ||
		!/^[a-zA-Z]+$/.test(tld)) {
		return false;
	}
	
	// Validate each domain part
	for (let i = 0; i < domainParts.length; i++) {
		const part = domainParts[i];
		// Each part must be 1-63 characters
		// Can contain letters, numbers, and hyphens
		// Cannot start or end with hyphen
		if (!part || 
			part.length === 0 || 
			part.length > 63 ||
			part.startsWith('-') || 
			part.endsWith('-') ||
			!/^[a-zA-Z0-9-]+$/.test(part)) {
			return false;
		}
	}
	
	// Comprehensive regex check for valid characters
	// Allows letters, numbers, and common special characters in local part
	// More permissive than strict RFC but practical for web forms
	const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	
	return emailRegex.test(email);
}

function checkAiEnable() {
	var lastTimeAiMade = localStorage.getItem('lastTimeAiMade');
	if (lastTimeAiMade) {
		var now = new Date();
		var lastTimeAiMadeDate = new Date(lastTimeAiMade);
		var diff = now - lastTimeAiMadeDate;
		// 24 hours in milliseconds
		if (diff < 1000 * 60 * 60 * 24) {
			return false; // Less than 24 hours - block generation
		}
		return true; // More than 24 hours - allow generation
	}
	else {
		return true;
	}
	
}

function showAppStorePopup() {
	var downloadUrl = '';
	var buttonText = '';
	if (isAndroid()) {
		downloadUrl = 'https://play.google.com/store/apps/details?id=com.beatravelbuddy.travelbuddy';
		buttonText = 'Google Play Store';
		
	}
	else {
		downloadUrl = 'https://apps.apple.com/in/app/travel-buddy-meet-book-trips/id1336926442';
		buttonText = 'App Store';
	}
	
	
	// If popup already exists, just make it visible again
	if (jQuery('#appDownloadBackdrop').length) {
		jQuery('#appDownloadBackdrop').addClass('is-visible');
		return;
	}

	// Use the same Luxe hero playlist videos inside the popup
	var popupVideoPlaylist = [
		'/view/assets/img/scenes.mp4',
		'/view/assets/img/northern-lights.mp4',
		'/view/assets/img/merged-bg-video-new.mp4',
		'/view/assets/img/northern-two.mp4'
	];

	// App Download Popup markup
	var htmlDesign = `
	<div class="app-download-backdrop is-visible" id="appDownloadBackdrop">
		<div class="app-download-modal">
			<button class="app-download-close" id="appDownloadClose" aria-label="Close download app popup">
				×
			</button>

			<div class="app-download-badge">New</div>

			<div class="app-download-content">
				<div class="app-download-left">
					<div class="app-download-media">
						<video class="app-download-video" muted playsinline webkit-playsinline></video>
					</div>

					<h2 class="app-download-title">Get our new app</h2>
					<p class="app-download-subtitle">
						Find friends, Connect & Travel together. Book trips faster, track your bookings, and unlock app-only deals.
					</p>

					<div class="app-download-buttons">
						<a href="${downloadUrl}" class="store-btn store-btn--apple">
							<span class="store-btn-label">Download on the</span>
							<span class="store-btn-name">${buttonText}</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>`;

	jQuery('#app').append(htmlDesign);

	var $backdrop = jQuery('#appDownloadBackdrop');
	var $closeBtn = jQuery('#appDownloadClose');
	var videoEl = $backdrop.find('.app-download-video').get(0);

	// Wire playlist to play one video after another inside the popup
	if (videoEl && popupVideoPlaylist && popupVideoPlaylist.length) {
		var currentVideoIndex = 0;

		function setPopupVideo(index) {
			if (!popupVideoPlaylist[index]) return;
			videoEl.src = popupVideoPlaylist[index];
			videoEl.currentTime = 0;
			var playPromise = videoEl.play();
			if (playPromise && playPromise.catch) {
				playPromise.catch(function () {
					// Autoplay might fail on some browsers; we'll retry on user interaction
				});
			}
		}

		function startPlaylist() {
			if (!videoEl.src) {
				setPopupVideo(currentVideoIndex);
			} else if (videoEl.paused) {
				var playPromise = videoEl.play();
				if (playPromise && playPromise.catch) {
					playPromise.catch(function () {});
				}
			}
		}

		// Start once metadata is ready, or immediately if already ready
		if (videoEl.readyState >= 2) {
			startPlaylist();
		} else {
			videoEl.addEventListener('loadeddata', function handleLoaded() {
				videoEl.removeEventListener('loadeddata', handleLoaded);
				startPlaylist();
			});
		}

		// Fallback: ensure playback starts after first user interaction
		function resumeOnInteraction() {
			if (jQuery('#appDownloadBackdrop').hasClass('is-visible') && videoEl.paused) {
				startPlaylist();
			}
			document.removeEventListener('click', resumeOnInteraction);
			document.removeEventListener('touchstart', resumeOnInteraction);
		}

		document.addEventListener('click', resumeOnInteraction, { once: true });
		document.addEventListener('touchstart', resumeOnInteraction, { once: true });

		// On end, move to next video in the playlist (looping)
		videoEl.onended = function () {
			currentVideoIndex = (currentVideoIndex + 1) % popupVideoPlaylist.length;
			setPopupVideo(currentVideoIndex);
		};
	}

	function hideAppStorePopup() {
		$backdrop.removeClass('is-visible');
		if (videoEl) {
			try {
				videoEl.pause();
			} catch (e) { }
		}
		try {
			sessionStorage.setItem('appDownloadDismissed', '1');
		} catch (e) { }
		jQuery(document).off('keydown.appDownload');
	}

	$closeBtn.on('click', function () {
		hideAppStorePopup();
	});

	$backdrop.on('click', function (e) {
		// Close when clicking outside the modal
		if (e.target === this) {
			hideAppStorePopup();
		}
	});

	jQuery(document).on('keydown.appDownload', function (e) {
		if (e.key === 'Escape' || e.keyCode === 27) {
			hideAppStorePopup();
		}
	});
}

function Init() {
	defineApp();
	getLiveLocationDetails();
	//scrollManager('Start', 'Main Feed');
	tabManager();
	videoManager('init');
	manageNotificationToken('init');
	lightDarkMode();
	urlCheck();
	hideSplashScreen();
	createIOSProductIds();
	splashImage();
	websiteLink();
	appUpdate();
	getTheme();
	makeSureTabsAreLoaded();
	setUserData();
	androidCodesForUpdated();
	changeLastActiveStatus();
	footerProfileImage(manageUserProfile('read', 'profilePic'));
	setUserNodeinFirebaseDB();
	// Function to check if the user is logged in and then transferring the Local Storage Data to the Mobile App Shared Preferences
	transferLocalStorageToSharedPreferences();
	// Show popup to iOS users to download the app from the App Store
	if (isIOS() || isAndroid()) {
		showAppStorePopup();
	}
}

jQuery(document).ready(function () {
	if (tokenMaster('session_start')) {
		Init();
	}
});