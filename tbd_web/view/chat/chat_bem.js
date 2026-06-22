//Manage Push Notifications from Apps
function notificationMaster(data) {
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
		let escapedData = escapeNestedJSON(data);

		// Parse the escaped JSON string
		let parsedData = JSON.parse(escapedData);			// Extract the nested JSON from the "id" field
		data = JSON.parse(parsedData["id"].replace(/\\"/g, '"'));
		
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
	else if (data.type == 'chat') {
		jQuery('.head__chat').click();
		setTimeout(function () {
			jQuery('#main__chat-box .css-1n2mv2k .css-btd4on .chats__container .chat__item').each(function () {
				if (jQuery(this).attr('data-chat-user') == data.userId) {
					jQuery(this).click();
				}
			});
		}, 1000);
	}
	else if (data.type == 'group_chat') {
		jQuery('.head__chat').click();
		setTimeout(function () {
			jQuery('#main__chat-box .css-1n2mv2k .css-btd4on .chats__container .chat__item').each(function () {
				if ((jQuery(this).attr('data-chat-id') == data.groupId) && jQuery(this).attr('data-chat-type') == 'group') {
					jQuery(this).click();
				}
			});
		}, 1000);
	}
	else if ( data.type == 'premium') {
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


//Manage Deep Linking from Apps
function deepLinkMaster(url) {
	console.log('Original' + url);

	// We Need to wait for the Entire page to load before we can process the deep link, but we need to re-think this logic
	if (document.readyState !== 'complete') {
		window.onload = function () {
			deepLinkMaster(url);

		};
		return;
	}
	if (jQuery('.traveller-details-review__overlay').length > 0) {
		jQuery('.traveller-details-review__overlay').click();
	}

	/*if ((guestMaster() && (isAndroid() || isIOS()))) {
		toast('Please login or register to continue !');
		return;
	}*/

	url = processUrl(url);
	//jQuery('#main__homepage-box').hide();

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
	else {
		jQuery('#main__homepage-box').show();
	}

	console.log('Processed' + url);

	function openExperienceCategory(experienceCategoryId) {

		let categoryMap = {
			'1': 'backpacking', '2': 'adventure-travel', '3': 'cultural-tourism', '4': 'road-trips', '5': 'culinary-tourism', '6': 'family', '7': 'mountainerring', '8': 'beach', '9': 'kayaking', '10': 'religious-tourism', '11': 'city-tours', '12': 'trekking', '13': 'historical-tourism', '14': 'bike-tours', '15': 'heritage-walks', '16': 'waterfalls', '17': 'meetups', '18': 'homestay', '19': 'offroading', '20': 'jungle-safaris', '21': 'art-and-crafts', '22': 'pub-crawling', '23': 'water-sports', '24': 'shopping', '25': 'events-and-exhibitions', '26': 'diving', '27': 'susutainable-living', '28': 'health-and-fitness', '29': 'winter-sports', '30': 'caving'
		};

		let categoryName = categoryMap[experienceCategoryId] || 'backpacking';
		window.location.href = 'https://beatravelbuddy.com/experiences/category/' + categoryName;
	}


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
	

}

//Create a deep link
function createDeepLink(what, id, imageUrl, copy, getLink, linkText) {
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

function setAndroidVersion(appVersion, osVersion) {
	if (isAndroid() && !guestMaster()) {
		localStorage.setItem('androidVersion', appVersion);
		localStorage.setItem('androidOSVersion', osVersion);
	}
}

function guestMaster(state) {
	guestUser = false;

	if (state == 'set') {
		localStorage.setItem('isGuestUser', true);
	}
	else if (state == 'clean') {
		localStorage.removeItem('isGuestUser');
	}
	else {
		if (localStorage.getItem('isGuestUser')) {
			guestUser = true;

			if (!jQuery('#app').hasClass('guestUser')) {
				jQuery('#app').addClass('guestUser');
			}
		}
	}

	return guestUser;
}

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
