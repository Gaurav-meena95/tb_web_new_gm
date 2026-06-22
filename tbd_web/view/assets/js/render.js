function initRender(state, data) {
	
	
	//Check if it is already rendered
	if (jQuery('#header').length == 0) {
		//Setup the app div with basic elements like the header, footer and the main contentP
		jQuery('#app').addClass('no__shots');
		jQuery('#app').append('<div id="header"></div>');
		jQuery('#app').append('<div id="main"></div>');
		jQuery('#app').append('<div id="secondary"></div>');
		jQuery('#app').append('<div id="footer"></div>');
		
		//Reels Icon
		//if (!guestMaster('noLogin')) {
		/*jQuery('#footer').append('<span id="tb__reels"></span>');
		jQuery('#tb__reels').on('click', () => {
			//manageSecondary('show', 'ai_itinerary');
			if (guestMaster()){
				redirect('login');
				return;
			}
			if (manageUserProfile('read', 'isVerified') == true) {
				queryString = 'AI=' + encodeURIComponent('true');
				console.log("Query String: ", queryString);
				openNewChat('AI=' + queryString);
				fbEvent('AI_LP');
			}
			else {
				toast('Go Premium to Chat with Rhea.');
				redirect('premium');
			}
		});*/
		//}
	}
	whatToRender(state, data);

	if (true) {
		if (isIOS()) {
			checkIOSPermissions({ what: 'askForPermission', type: 'location' });
			checkIOSPermissions({ what: 'askForPermission', type: 'notification' });
		}
		else if (isAndroid()) {
			Android.locationPermission();
			Android.notificationPermission();
		}
		else {
			renderPermissionPopups('init', 'location');
			renderPermissionPopups('init', 'notifications');
		}		
	}
	function whatToRender(state, data) {
		 
		renderBasicStructure(state);
	
		switch (state) {
			case 'profile':
				setTimeout(() => redirect('profile', data.profileId), 150);
				break;
			case 'flights':
				setTimeout(() => {
					jQuery('.desktopMenu-experiencesApp').click();
					jQuery('.experiencesToggle input[type="radio"][value="1"]').click();
					window.history.pushState({ page: "flights" }, "flights", "/flights");
					jQuery('.experiences__body-tab[data-tab="trips"]').click();
					jQuery('.experiences__background img').hide();
					//fbEvent('flights', 'Open Flights Tab');
				}, 150);
				break;
			case 'hotels':
				setTimeout(() => {
					jQuery('.desktopMenu-experiencesApp').click();
					jQuery('.experiencesToggle input[type="radio"][value="2"]').click();
					window.history.pushState({ page: "hotels" }, "hotels", "/hotels");
				}, 150);
				break;
			case 'experience':
			case 'singleExperience':
			case 'experienceCategory':
				handleExperienceState(state, data);
				fbEvent('experiences', 'Open Experiences Tab');
				break;
			case 'post':
				setTimeout(() => redirect('post', data.postId), 150);
				break;
			case 'booking-summary':
				setTimeout(() => redirect('bookingSummary'), 1500);
				break;
			case 'contact-us':
				setTimeout(() => redirect('contact-us', 'contact-us'), 1500);
				break;
			// For Tb-Mini
			case 'premium-luxe':
				setTimeout(() => redirect('premium', '4'), 500);
				fbEvent('premium-luxe', 'Open Premium Luxe');
				break;
			// For Tb-Pro
			case 'premium-pro':
				setTimeout(() => redirect('premium', '3'), 500);
				fbEvent('premium-pro', 'Open Premium Super');
				break;
			// For Tb-Super
			case 'premium-super':
			case 'premium':	
				setTimeout(() => redirect('premium', '2'), 500);
				fbEvent('premium-super', 'Open Premium Super');
				break;
			case 'listings':
				setTimeout(() => redirect('flights-hotels'), 1000);
				break;
			case '404':
				handle404State();
				break;
			case 'chat':
				//if (isAndroid() || isIOS() || isPwa() || isLocalOrDev()) {
				if (true) {
                    setTimeout(() => jQuery('.head__chat').click(), 150);
                }
                else {
                    toast('Please download the TravelBuddy App to Chat with Travelers around the Globe.');
                    setTimeout(() => jQuery('#footer ul li[data-item="feed"]').click(), 150);
                }
				break;
			case 'dashboard':
				setTimeout(() => {
					//jQuery('#footer ul li[data-item="flightHotels"]').click();
					jQuery('.head__spDashboard').click();
				}, 150);
				break;
			case 'community':
				//renderBottomSheet('', 'premium__init');
				
                    setTimeout(() => {
                        jQuery('#footer ul li[data-item="feed"]').click();
						jQuery('#footer ul li[data-item="feed"]').addClass('active');
                        if (!guestMaster('noLogin')) {
                            showWalkthrough('community');
                        }
                    }, 150);
                //}
				break;
			case 'search':
				setTimeout(() => {
					jQuery('#footer ul li[data-item="feed"]').click();
					jQuery('#header ul .head__search').click();
					loaderMain('global', false);
					fbEvent('search', 'Open Search');
				}, 150);
				break;
			case 'login':
				setTimeout(() => { 
					redirect('login');
					jQuery('#dark-back').remove();
					loaderMain('global', false);
				}, 1000);
				break;
			case 'onboardingVideo':
				redirect('onboardingVideo');
				break;	
			case 'homePage':
				setTimeout(() => {
					jQuery('#footer ul li[data-item="homePage"]').addClass('active');
					renderNewHomePage();
					// Add path as homePage
					window.history.pushState({ page: "homePage" }, "homePage", "/home");
				}, 150);
				/*if (profile.completeness < 40 && !guestMaster('noLogin')) {
                    if (!jQuery('.secondary__tab.onboardingBody').length > 0) {
                        jQuery('#app').addClass('onboarding');
                        redirect('onboarding');
                    }
                }
				else {
					setTimeout(() => {
						jQuery('.head__search, .head__addPost').hide();
						jQuery('.header__logo').click();
						localStorage.setItem('homePageClicked', true);
						// Add path as homePage
						window.history.pushState({ page: "homePage" }, "homePage", "/homePage");
						if (!localStorage.getItem('showWalkthroughHomePage')) {
							showWalkthrough('homePage');
						}
					}, 150);
				}*/
				break;
			case 'groupTrips':
				setTimeout(() => {
					var testerEmails = returnTestersEmail();
					if (true) {
						newExpContainer = jQuery('.experiences__container-new').html();
						jQuery('.experiences__container-new').remove();
						jQuery('.desktopMenu-experiencesApp').click();
						jQuery('.experiencesToggle input[type="radio"][value="4"]').click();
						window.history.pushState({ page: "hotels" }, "hotels", "/groupTrips");
					}
					else {
						//jQuery('#footer ul li[data-item="feed"]').click();
						jsInit('getExperiences', {
							"filter": {
								"trending": {
									"type": "group_trips"
								}
							}
						}, "trendingGroupTrips");
						jQuery('#main__homepage-box').hide();
						manageSecondary('show', 'trendingGroupTrips');
						window.history.pushState({ page: "groupTrips" }, "groupTrips", "/groupTrips");
						loaderMain('secondary', true);
					}
				}, 150);
				break;	
			case 'check-deals-hotels-flights-packages':
				setTimeout(() => {
                    jQuery('#footer ul li[data-item="feed"]').click();
					renderPermissionBox('init', 'leadForm');
					window.history.pushState({ html: jQuery('#secondary .secondary__tab:last-child').html(), pageTitle: 'Plan & Book Hotels, flights, Best Deals, Packages & Trips within your budget.' }, '', '/check-deals-hotels-flights-packages');
				}, 150);
				break;
            case 'ai-plan-trip':
                setTimeout(() => {
                    manageSecondary('show', 'ai_itinerary');
                }, 150);
				break;    
			case 'deepLinkDesktop':
				setTimeout(() => {
					handleBranchDesktopRouting();
				}, 150);
				break;
            case 'itineraryId':
                setTimeout(() => {
                    url = window.location.href;
                    parts = url.split('/');
                    itineraryId = parts[parts.length - 1];
                    console.log(itineraryId);
                    jsInit('getItinerary', { 'itineraryId': itineraryId });
                    jQuery('#footer ul li[data-item="feed"]').click();
                }, 150);
                break;
            case 'allAiTrips':
                setTimeout(() => {
                    if (guestMaster()) {
                        manageSecondary('show', 'ai_itinerary');
                        return;
                    }
                    jQuery('#footer ul li[data-item="feed"]').click();
                    jQuery('li[data-redirect="ai-plan-trip"]').click();
                }, 150);
                break;        	
            case 'findbuddy':
                setTimeout(() => {
                    jQuery('#footer ul li[data-item="feed"]').click();
                    redirect('lfb');
                }, 150);
                break;
			case 'add-find-post':
				setTimeout(() => {
					jQuery('#footer ul li[data-item="addPost"]').click();
				}, 150);
				break;
			case 'add-share-post':
				setTimeout(() => {
					jQuery('#footer ul li[data-item="addPost"]').click();
					jQuery('.addPost__tab-item[data-id="share"]').click();
				}, 150);
				break;
			case 'add-ask-post':
				setTimeout(() => {
					jQuery('#footer ul li[data-item="addPost"]').click();
					jQuery('.addPost__tab-item[data-id="ask"]').click();
				}, 150);
				break;
		}
		
		function renderBasicStructure(state) {
			//Render the Functions
			renderLogin('Outer Init'); // Shifted from below to load it first For the login page & Firebase
			renderHeader(icons, state);
			renderFooter(icons);
			renderMain(state);
			renderMenu(icons);
			renderDeskTopMenu();
			renderChatSend('init');
			managePopups('init');
			toast('init');
			//manageWelcomeScreens('init');
			renderSpDashboard('init');
			if (!isAndroid() && !isIOS() && !isMobile()) {
				renderDesktopSidebar('init');
			}
			
            // if (!guestMaster()) {
            //     renderChat('init');
            // }
		}
	
		function handleExperienceState(state, data) {
			// Add the logic for 'experience', 'singleExperience', and 'experienceCategory' states here
			setTimeout(() => {
				// if (profile.completeness < 35 && !guestMaster('noLogin')) {
				// 	// if (!jQuery('.secondary__tab.onboardingBody').length > 0) {
				// 	// 	jQuery('#app').addClass('onboarding');
				// 	// 	redirect('onboarding');
				// 	// }
				// }
				// else {
					jQuery('.desktopMenu-experiencesApp').click();
					jQuery('.experiencesToggle input[type="radio"][value="3"]').click();

					if (state == 'singleExperience') {
						setTimeout(() => {
							redirect('singleExperience', data);
						}, 1500);
					}
					else if (state == 'experienceCategory') {
						jQuery('.experiencesToggle input[type="radio"][value="3"]').click();
						return;
						jsInit('getExperiences', { "filter": { "category": data.category } }, 'searchExperiences');
						jQuery('.experiences__body').hide();
						jQuery('#experiences__search .experiences__header-search-btn').html(icons.close).addClass('hide-experience-results');
						jQuery('.experiences__search-categories').addClass('category-selected').append('<div class="experiences__head-categories__box"><div class="experiences__head-category__item">' + data.category + '<span class="close">' + icons.close + '</span></div></div>');
						jQuery('.experiences__search').addClass('active');
					}
				//}
			}, 150);
		}
	
		function handle404State() {
			// Add the logic for '404' state here
			setTimeout(() => {
				// Check if the Url has localhost or dev.beatravelbuddy.com
				if (window.location.href.indexOf('localhost') == -1 && window.location.href.indexOf('dev.beatravelbuddy.com') == -1) {
					fetch(baseUrl + '/app.json')
						.then(response => response.json())
						.then(data => {
							// `data` is the parsed JSON data from the file
							console.log(data);
							if (data.app_under_maintenance) {
								console.log('App is under maintainence');
								renderAppUnderMaintainance();
							}
							else {
								render404('force');
							}
						})
						.catch(error => {
							console.error('Error:', error);
							render404('force');
						});
				}
				else {
					render404('force');
				}
			}, 100);
		}
		
		
		
		// setTimeout(() => {
		// 	// Usage example:
		// 	createAndShowPopup('/view/assets/img/in-app.webp');
		// 	//renderBottomSheet('', 'appInstall');
		// }, 1);
		
		
	}
	// Function to render the header based on the state
	function renderHeader(icons, state) {
		// Define display styles for different states
		
		spDashboard = (isServiceProvider() && !guestMaster('noLogin')) ? '<li class="head__spDashboard head__long" style="display: none"><a class="head__dashboard">' + icons.spDashboard + ' Dashboard</a></li>' : '';

		displayStyle = {
			experience: { hamburger: '', addPost: 'none', search: '', filter: 'none', myBookings: 'none', chat: ''},
			community: { hamburger: '', addPost: 'none', search: '', filter: '', myBookings: 'none', chat: ''},
			homePage: { hamburger: '', addPost: 'none', search: 'none', filter: '', myBookings: 'none', chat: 'none'},
			default: { hamburger: '', addPost: 'none', search: 'none', filter: 'none', myBookings: 'none', chat: '' },
			
		}
		// Select the display style based on the state
		selectedStyle = displayStyle[state] || displayStyle.default;

		// If the state is 'experience', add a specific class to the header and add classes to the #app element
		//state === 'experience' ? (jQuery('#app').addClass('no__shots'), experienceHeader = 'header__menu header__menu-experiences') : 
		experienceHeader = '';

		// Construct the header HTML using the display styles and icons
		headerHTML = `<div class="header__hamburger" style="display: ${selectedStyle.hamburger};">${icons.hamburger2}</div><div class="header__logo">Travel Buddy</div><div class="header__menu ${experienceHeader}"><ul>${spDashboard}<li class="head__search" data-item="search" style="display: ${selectedStyle.search};"><a>${icons.searchBar}</a></li><li class="head__chat" data-item="chat" style="display: ${selectedStyle.chat};"><a>${icons.chat2}</a></li><li class="head__notifications" data-item="notifications"><a>${icons.notifications2}</a></li><li class="head__filter" data-item="filter" style="display: ${selectedStyle.filter};"><a>${icons.filter}</a></li></ul></div>`;

		// Append the constructed HTML to the #header element
		jQuery('#header').append(headerHTML);
        
        loadLottieAnimation('lottie__addPost', '/view/assets/img/aiBuddy.json');
	}

	function renderMain(state) {
		//feedLogin = renderFeedLogin();

		//Render the main div
		jQuery('#main').append('<div id="main__feed-box"><div class="main_item" id="main_item"></div><div class="secondary_item"></div></div>');
		jQuery('#main__feed-box  .main_item').append('<div id="main__tabs"></div>');
		// jQuery('#main__feed-box  .main_item').append('<div id="main__feed-first">' + feedLogin + '</div>');
		jQuery('#app').append('<div id="main__drawer"><div class="drawerBody"></div></div>');

		drawerActions();

		//Fetch Content
		jsInit('getTabs', '', state);
	}
	function renderFooter(icons) {
		//Render the footer
		// Check for Profile Photo
		if (manageUserProfile('read', 'profilePic') == null) {
			profilePhoto = '/view/assets/img/user-def.png';
		}
		else {
			// Render the profile photo
			profilePhoto = renderUserProfileImage(manageUserProfile('read', 'profilePic'));
		}
		jQuery('#footer').append(
			'<ul><li data-item="homePage" ><a class="menu__feed">' + icons.homePage + '<span>Home</span></a></li><li data-item="experiences" ><a class="menu__feed openExperiences">' + icons.flights + '<span>Bookings</span></a></li><li data-item="feed"><a class="menu__feed community">' +
			icons.feed2 + '<span>Buddies</span></a></li><li data-item="addPost"><a class="menu__feed">' + icons.addPost + '<span>Find</span></a></li><li data-item="premium"><a class="menu__feed premium_lightModeIcon">' + icons.premium2 + '<span>Elite Club</span></a></li><li data-item="profile"><a class="menu__feed"><img draggable="false" src="/view/assets/img/user-def.png"><span>Profile</span></a></li></ul>'

		);
	}
	
	// Implement the logic to show a popup once every 24 hours only
	setTimeout(() => {
		var imgLink = 'https://imagedelivery.net/yrdfkc9LfLnd6N_GsZsD0w/ae79eeb0-ddb9-4bba-32fd-be6572adc400/feedhd';
		
		var getInAppWebPopup = localStorage.getItem('inAppWebPopup');
		if (getInAppWebPopup) {
			createAndShowPopup(imgLink);
			localStorage.removeItem('inAppWebPopup');
		
		}
		
		/*var currentPageUrl = window.location.href;
		if (currentPageUrl.includes('premium')) {
			return;
		}
				
		else if (guestMaster()) {
			
			return;
		}
		else if (localStorage.getItem('inAppWebPopupShown')) {
			var lastActiveTimestamp = parseInt(localStorage.getItem('inAppWebPopupShown'), 10);
			var currentTime = new Date().getTime();
			var timeDiff = (currentTime - lastActiveTimestamp) / (1000 * 60 * 60);
			if (timeDiff > 24) {
				createAndShowPopup(imgLink);
				
				localStorage.setItem('inAppWebPopupShown', new Date().getTime().toString());
			}
		}
		else {
			localStorage.setItem('inAppWebPopupShown', new Date().getTime().toString());
			createAndShowPopup(imgLink);
		}*/
	}, 3000);
	
	// setTimeout(() => {
	// 	createAndShowPopup('https://prodmedia.beatravelbuddy.com/uploads/display_picture/premium-only-inapp.webp');
	// }, 25000);
	
	
}

function renderMenu() {
	dashboard = renderDashboard();
	logoutLink = renderLogoutLink();
	premiumLink = renderPremiumLink();
	settingsLink = renderSettingsLink();
	loginLink = renderLoginLink();
	bucketListLink = renderBucketListLink();
	ordersLink = renderOrdersLink();
	blockedUsersLink = renderBlockedUsersLink();
	contactLeadsLink = renderContactedLeadsLink();
	shareLink = renderShareLink();
	downloadAppsLink = renderDownloadAppsLink();
	messageDashboard = renderMessageDashboard();
	leadForm = '<li data-redirect="lead-form">Enquire Now</li>';
	aiBuddyItinerary = '<li data-redirect="ai-plan-trip">AI Travel Plans</li>';
	let versionName = '<li>Version ' + appVersion + '</li>';
	let bookedFlightTrips = '<li data-redirect="booked-flights">Booked Flights</li>';
	var aiBuddy = '<li data-redirect="open-ai">Plan Trips with AI</li>';
	

	//Render the menu
	// <a class="travel-store" target="_blank" href="https://mytravelstore.beatravelbuddy.com/">Travel Buddy Store</a>

	jQuery('#header').append('<div class="hamburger__menu"><div class="hamburger__menu-body"><div class="hamburger__menu-header">Travel Buddy</div><div class="hamburger__menu-box"><ul>' + loginLink + premiumLink + dashboard + '<li></li><a class="menu-category" id="mySpace"><h6>My Space<span><i class="fa-solid fa-caret-down"></i></span></h6><ul class="sub-menu">' + bookedFlightTrips + aiBuddyItinerary + bucketListLink + contactLeadsLink + ordersLink + '<li data-redirect="premium">Premium</li>' + blockedUsersLink + '<li data-redirect="feedback">Feedback</li>' + logoutLink + '</ul></a><a class="menu-category" id="settings-subMenu"><h6>Settings<span><i class="fa-solid fa-caret-down"></i></span></h6><ul class="sub-menu-settings"><li><div class="day-night_toggle_box settings_box"><div class="settings_options"><h4 class="settings_labels">Night/Day toggle</h4></div><div class="day-night_switch_box"><input type="checkbox" class="day_night_switch" id="light-dark-switch" checked=""><label for="light-dark-switch" class="day_night_switch-label"><i class="fas fa-moon" aria-hidden="true"></i><i class="fas fa-sun" aria-hidden="true"></i><span class="day_night_checkbox-ball"></span></label></div></div></li><li><div class="change_passwords_box settings_box"><h4 id="change_password_label" class="settings_labels">Change Passwords</h4></div></li><li data-redirect="terms">Terms & Conditons</li><li data-redirect="privacy">Privacy Policy</li><li data-redirect="contact-us">Contact Us</li><li data-redirect="about-us">About Us</li></ul></a>' + shareLink + aiBuddy + messageDashboard + leadForm + versionName + '</ul></div></div><div class="hamburger__menu-mask"></div></div>');
	
	
	jQuery('#light-dark-switch').prop('checked', localStorage.getItem('lightMode') == 'true' ? false : true);
	
	function renderMessageDashboard() {
		renderItem = '';

		if (!guestMaster('noLogin') && manageUserProfile('read', 'role') == 'admin') {
			renderItem = '<li data-redirect="message-dashboard">Message Dashboard</li><li data-redirect="manage-listings">Manage Listings</li>';
			//<li class="hidden" data-redirect="message-analytics">Message Dashboard Analytics</li>
		}

		return renderItem;
	}

	function renderLogoutLink() {
		renderItem = '';

		if (!guestMaster('noLogin')) {
			renderItem = '<li data-redirect="logout">Logout</li>';
		}

		return renderItem;
	}

	function renderDownloadAppsLink() {
		renderItem = '<li data-redirect="download-apps">Download Apps</li>';

		if (isIOS() || isAndroid() || manageUserProfile('read', 'role') == 'admin') {
			renderItem = '';
		}

		return renderItem;
	}

	function renderPremiumLink() {
		renderItem = '';

		if (!manageUserProfile('read', 'isVerified') && manageUserProfile('read', 'role') !== 'admin'){
			renderItem = '<li data-redirect="premium" class="highlight no-mb">Become a Premium Traveller</li>';
		}

		return renderItem;
	}

	function renderSettingsLink() {
		renderItem = '';

		if (!guestMaster('noLogin')) {
			renderItem = '<li data-redirect="settings">Settings</li>';
		}

		return renderItem;
	}

	function renderLoginLink() {
		renderItem = '';

		if (guestMaster('noLogin')) {
			renderItem = '<li data-redirect="login" class="highlight">Login/Sign Up</li>';
		}

		return renderItem;
	}

	function renderBucketListLink() {
		renderItem = '';

		if (!guestMaster('noLogin')) {
			renderItem = '<li data-redirect="bucket-list">My Bucket List</li>';
		}

		return renderItem;
	}

	function renderContactedLeadsLink() {
		renderItem = '';

		if (!guestMaster('noLogin') && isServiceProvider()) {
			renderItem = '<li data-redirect="contacted-leads">Contacted Leads</li>';
		}

		return renderItem;
	}

	function renderOrdersLink() {
		renderItem = '';

		if (!guestMaster('noLogin')) {
			renderItem = '<li data-redirect="experience-orders">My Orders</li>';
		}

		return renderItem;
	}

	function renderBlockedUsersLink() {
		renderItem = '';

		if (!guestMaster('noLogin')) {
			renderItem = '<li data-redirect="blocked-users">Blocked Users</li>';
		}

		return renderItem;
	}

	function renderShareLink() {
		renderItem = '';

		if (isIOS() || isAndroid()) {
			renderItem = '<li data-redirect="share">Share</li>';
		}

		renderItem = '';

		return renderItem;
	}

	function renderDashboard() {
		renderItem = '';

		if (!guestMaster('noLogin') && isServiceProvider()) {
			renderItem = '<li data-redirect="dashboard">Dashboard</li>';
		}
		return renderItem;
	}
}


async function renderDesktopSidebar(state, data) {
	if (state == 'init') {
		experienceCity = await getCity();

		desktopPremium = !guestMaster() ? '' : '<div class="desktopSideBar-section desktopSideBar-premium"><h3>Join the 4 Million Strong Travel Community. </h3><p>Find Like Minded Travellers.</p><div class="desktopSideBar-btn-wrapper"><button class="desktopSideBar-premium-btn">Login Now</button><button class="desktopSideBar-install">Install Our App</button></div></div>';

		experienceCity = (experienceCity !== 'false' && experienceCity !== null) ? experienceCity : 'you';
		jQuery('#desktopContainer').append('<div class="desktopSideBar">' + desktopPremium + '<div class="desktopSideBar-section desktopSideBar-experiences flights__price"><img src="/view/assets/img/price_challenge-three.webp"><div class="desktopSideBar-experiences-box"></div></div><div class="desktopSideBar-section desktopSideBar-followers"><h3>Who to follow</h3><div class="desktopSideBar-followers-box"></div></div>');

		loaderMain('sidebarExperiences', true);
		loaderMain('sidebarFollowers', true);
		setTimeout(() => {
			if (localStorage.getItem('userLong') > 0 && localStorage.getItem('userLat') > 0) {
				latitude = localStorage.getItem('userLat');
				longitude = localStorage.getItem('userLong');
			}
			else {
				latitude = 22.9734;
				longitude = 78.6569;
			}

			if (Object.keys(experienceDashboardData).length == 0 && window.location.href.indexOf('experience') == -1 && !isAndroid() && !isIOS()) {
                jsInit('getExperienceDashboard', { latitude: latitude, longitude: longitude }, 'desktopSidebar');
            }

			jsInit('getFeedCards', { feedsType: 7, isVerified: 1, locationLat: latitude, locationLong: longitude, feedCardInfo: { card_type: "users_you_may_follow", card_position: 1 }, location: manageUserProfile('read', 'location') }, 'desktopSidebar');
		}, 750);
	}
	else if (state == 'experiences') {
		console.log(data);
		data = data.object.dailyExperiences;

		x = 0;

		jQuery('.desktopSideBar-experiences-box').empty();
		/*data.forEach(experience => {
			if (experience.viewType !== undefined) {
				return;
			}
			else {
				if (x < 3) {
					manufacturedUrl = renderManufacturedUrl(experience);

					jQuery('.desktopSideBar-experiences-box').append('<div class="desktopSideBar-experiences-item" data-id="' + experience.id + '" data-url="' + manufacturedUrl + '"><div class="desktopSideBar-experiences-item__left"><img src="' + renderUserProfileImage(experience.media[0].media_url) + '"></div><div class="desktopSideBar-experiences-item__right"><h4>' + experience.title + '</h4><div class="desktopSideBar-experiences-item-category">' + icons.lightning + experience.category + '</div><div class="desktopSideBar-experiences-item-author"><div class="desktopSideBar-experiences-item-author__left">By <span>' + experience.hostDetails.userName + '</span></div><div class="desktopSideBar-experiences-item-author__right">₹' + numberWithCommas(experience.pricing) + '</div></div></div></div>')
					x++;
				}
				else {
					return;
				}
			}
		});*/

		loaderMain('sidebarExperiences', false);
	}
	else if (state == 'followers') {
		console.log(data);
		data = data.object.users_you_may_follow.users;
		x = 0;

		//Randomize the array
		data.sort(() => Math.random() - 0.5);

		data.forEach(user => {
			if (user.isFollowing == false) {
				if (x < 2) {
					isInfluencer = user.roleType == 7;
					imagePath = getProfileImage(renderUserProfileImage(user.imageUrl), '', '', '', isInfluencer);
					jQuery('.desktopSideBar-followers-box').append('<div class="desktopSideBar-followers-item" data-user="' + user.userId + '"><div class="desktopSideBar-followers-item__left"><div class="desktopSideBar-followers-item__left__left">'+ imagePath +'</div><div class="desktopSideBar-followers-item__left__right"><div class="desktopSideBar-followers-user">' + user.name + '</div><div class="desktopSideBar-followers-location">' + user.city + '</div></div></div><div class="desktopSideBar-followers-item__right"><a class="follow-user" data-following="false">Follow</a></div></div></div>');
					x++;
				}
				else {
					return;
				}
			}
		});

		jQuery('.desktopSideBar-followers').append('<div class="desktopSideBar-followers-footer"><a>Show More</a></div>');
		loaderMain('sidebarFollowers', false);
	}
}

function renderDeskTopMenu() {
	
	chatOption = '<div class="desktopMenu-chat desktopMenu-item" data-item="chat">' + icons.chat + ' Chat</div>';

	// <div class="desktopMenu-fligtsHotels desktopMenu-item">' + icons.experiencesIcons + ' Marketplace</div>
	jQuery('#desktopContainer').append('<div id="desktop__menu"><div class="desktopMenu-box"><div class="desktopMenu-section desktopMenu-apps"><div class="desktopMenu-socialApp desktopMenu-item active">' + icons.travelBuddyIcon + ' Community</div><div class="desktopMenu-experiencesApp desktopMenu-item">' + icons.flights + ' Flights & Services</div></div><div class="desktopMenu-section desktopMenu-footerMenu"></div><div class="desktopMenu-section"><div class="desktopMenu-premium desktopMenu-item" data-item="premium">' + icons.premium + ' Premium</div><div class="desktopMenu-notifications desktopMenu-item">' + icons.notifications + ' Notifications</div>' + chatOption + '</div><div class="desktopMenu-section noBorder"><div class="desktopMenu-profile desktopMenu-item" data-item="profile"><img draggable="false" src="/view/assets/img/user-def.png"> Profile</div><div class="desktopMenu-more desktopMenu-item" data-redirect="more">' + icons.desktopMore + ' More</div></div><div class="desktopMenu-section desktopMenu-last"><div class="desktopMenu-tertirary"><ul><li data-redirect="about-us">About</li><li data-redirect="terms">Terms</li><li data-redirect="privacy">Privacy</li></ul></div><div class="desktopMenu-appVersion">Version ' + appVersion + '</div></div></div>');

	renderNewMenu('social');
	loadLottieAnimation('desktopAI', '/view/assets/img/aiBuddy.json');
	
	//<div class="desktopMenu-aiBuddy desktopMenu-item" data-item="aiBuddy"><div id="desktopAI"></div> AI Buddy</div>
}

function renderNewMenu(type) {
	// if (localStorage.getItem('onboardingVideo')) {
	// 	showLoginForApps();
	// }
	if (type == 'social') {
		render = '<div class="desktopMenu-feed desktopMenu-item active" data-item="feed">' + icons.feed + ' Feed</div><div class="desktopMenu-search desktopMenu-item"  data-item="search">' + icons.search + ' Search</div><div class="desktopMenu-addPost desktopMenu-item" data-item="addPost">' + icons.plus + ' Find</div>';
	}
	else if (type == 'flights-hotels') {
		manageListings = (isServiceProvider()) ? '<div class="desktopMenu-dashboard desktopMenu-item">' + icons.manageListings + ' Dashboard</div>' : '';

		render = '<div class="desktopMenu-services desktopMenu-item" data-item="flightHotels">' + icons.localServices + ' Local Services</div><div class="desktopMenu-flights desktopMenu-item">' + icons.flights + ' Flights</div><div class="desktopMenu-hotels desktopMenu-item">' + icons.hotel + ' Hotels</div>' + manageListings;
	}
	else if (type == 'experiences') {
		render = '<div class="desktopMenu-myBookings desktopMenu-item">' + icons.ticket + ' My Bookings</div>';
	}

	jQuery('.desktopMenu-footerMenu').html(render);

	if (type == 'social') {
		if (!isAndroid() && !isIOS() && !isMobile()) {
			jQuery('.desktopMenu-feed').click();
		}
	}
	else if (type == 'flights-hotels') {
		jQuery('.desktopMenu-services').click();
	}
	else if (type == 'experiences') {
		//jQuery('.desktopMenu-dayExperience').click();
		//jQuery('.desktopMenu-dayExperience').addClass('active');
	}
}

function renderLikes(state, data, element) {
	if (state == 'init') {
		jsInit('fetchLikes', data, element);
	}
	else if (state == 'render') {
		render = false;

		console.log(data);
		postId = data.request.travelFeedPost.postId;
		pageNumber = data.object.pageNumber;
		itemsPerPage = data.object.itemsPerPage;
		count = data.object.count;
		data = data.object.list;

		if (data) {
			render = true;
		}

		if (render) {
			if (element !== 'Pagination') {
				//Clean up the drawer
				cleanDrawer();
			}

			if (element == 'Interested' || element == 'Likes') {
				jQuery('#main__drawer .drawerHeader span').text('Interested Users');
				if (element == 'Likes') {
					jQuery('#main__drawer .drawerHeader span').text('Post Likes');
				}

				jQuery('#main__drawer .drawerBody').append('<div class="likes__box"></div>');
			}

			//Reverse the array
			data = data.reverse();

			data.forEach((user) => {
				following = renderFollowing(user.isFollowing, user.userId, icons);
				verified = renderVerified(user.isVerified, icons);
				chat = renderChatIcon(user.userId, icons);
				isInfluencer = user.roleType == 7;
				imagePath = getProfileImage(renderUserProfileImage(user.imageUrl), user.name, '', '', isInfluencer);

				jQuery('#main__drawer .likes__box').append('<div class="likes__item" data-user="' + user.userId + '"data-uniqueId="' + user.uniqueUserId + '"><div class="likes__item-identity"><div class="likes__item-image">'+ imagePath +'</div><div class="likes__item-name">' + user.name + verified + '</div></div><div class="likes__item-actions"><ul>' + following + '</ul></div></div>');
			});

			if (element !== 'Pagination') {
				drawer('open');
			}
		}

		if (data.length >= itemsPerPage) {
			renderLikes('init', { postId: postId, pageNumber: pageNumber }, 'Pagination');
		}

		function renderChatIcon(userID, icons) {
			renderItem = '';

			if (userID == manageUserProfile('read', 'userId')) {
				//Disabled it for now, since we do not have chat feature
				// renderItem = '<li><a class="likes_item-message">' + icons.chat + '</a></li>';
			}

			return renderItem;
		}

		function renderFollowing(following, userId, icons) {
			renderItem = '';

			if (userId !== manageUserProfile('read', 'userId')) {
				if (following) {
					renderItem = icons.following;
				} else {
					renderItem = icons.follow;
				}
				renderItem = '<li><a class="likes_item-follow" data-following="' + following + '">' + renderItem + '</a></li>';
			} else {
			}

			return renderItem;
		}
	}
	else if (state == 'likedPost') {
		console.log(data);
		// if (jQuery('.feed__body-interested').hasClass('interested')) {
		// 	console.log('liked');
		// }

		var dataId = data.postId;

		if (jQuery(this).find('.feed_item-find_buddy').data('id') == dataId && jQuery(this).find('.feed__body-interested').hasClass('interested')) {
			// Your code here if the condition is true
			console.log('liked');
		} else {
			// Your code here if the condition is false
			console.log(jQuery(this).find('.feed_item-find_buddy').data('id'));
			console.log('notliked');
			// jQuery(this).html(icons.raise_hand + ' Interested');
			// jQuery(this).toggleClass('interested');
		}
	}
}

function renderVerified(verified, icons) {
	renderItem = '';

	if (verified) {
		// if (manageUserProfile('read', 'userType') == '1') {
		// 	renderItem = icons.verified_sp;
		// }
		// else {
		// 	renderItem = icons.verified;
		// }
		renderItem = `<span class="onboarding__page-verified-badge">
									<img src="/view/assets/img/verified.webp" alt="Verified">
								</span>`

	}

	return renderItem;
}

function renderComments(state, data, htmlItem) {
	if (state == 'init') {
		drawer('open');
		//Clean up the drawer
		if (!htmlItem) {
			cleanDrawer();
		}
		if (jQuery(htmlItem).attr('id') !== 'app') {
			jQuery('#main__drawer .drawerHeader span').text('Comments');
		}

		data = jsInit('fetchComments', data, htmlItem);
	}
	else if (state == 'render') {
		loaderMain('global', false);
		render = false;

		console.log(data);
		request = data.request;
		count = data.object.count;
		data = data.object.list;

		if (data.length > 0) {
			postId = data[0].postId;
		} else {
			postId = request.postId;
		}

		if (data) {
			render = true;
		}

		if (render) {
			//Reverse the array
			data = data.reverse();

			if (!jQuery(htmlItem).hasClass('comment__item-replies')) {
				if (jQuery(htmlItem).find('.comments__box').length <= 0) {
					//To prevent duplicate comment boxes. Happened because of pagination
					jQuery('#main__drawer .drawerBody').append('<div class="comments__box" data-postId="' + postId + '"></div>');
					jQuery('#main__drawer .drawerBody').append('<div class="feed__comment"><textarea class="autosize" type="text" placeholder="Add a comment.."></textarea><button>Post</button></div>');
				}

				htmlItem = jQuery('#main__drawer div.comments__box');
			}

			if (data.length > 0) {
				//If there are no comments we still need to render the drawer so the user can add a comment
				data.forEach((comment) => {
					console.log(comment);
					likes = formatLikes(comment.likes);
					comment_content = processPostDescription(comment.comment);
					likedIcon = checkLiked(comment.isLiked);
					replies = renderReplies(comment.replyCount);
					replyButton = renderReplyButton(icons, htmlItem);
					repliesBox = renderRepliesBox(comment.replyCount, replies, htmlItem);
					commentDate = formatDate(comment.commentTime);
					isOwnComment = comment.isOwnComment;
					isInfluencer = comment.roleType == 7;
					imagePath = getProfileImage(renderUserProfileImage(comment.imageUrl), comment.name, '', '', isInfluencer);

					if (jQuery(htmlItem).hasClass('comment__item-replies') || jQuery(htmlItem).hasClass('replies__box')) {
						replies = '';
						replyButton = '';
						comment_content = processPostDescription(comment.reply);
						commentDate = formatDate(comment.replyTime);

						if (!jQuery(htmlItem).hasClass('replies__box')) {
							jQuery(htmlItem).prepend('<div class="replies__box" data-user = "' + comment.commentByUserId + '"></div>');
							htmlItem = jQuery(htmlItem).find('.replies__box');

							//Change view replies to hide replies & mark the comment as expanded
							jQuery(htmlItem).parent().find('span').text('Hide replies');
							jQuery(htmlItem).parent().attr('data-expanded', 'true');
						}
					}

					if (!isOwnComment) {
                        jQuery(htmlItem).append('<div class="comment__item" data-comment-id="' + comment.commentId + '" data-user="' + (comment.commentByUserId ? comment.commentByUserId : comment.replyByUserId) + '"><div class="comment__item-image">'+ imagePath +'</div><div class="comment__item-body" self-comment=' + isOwnComment + '><div class="comment__item-bheader"><div class="comment__item-name">' + comment.name + '</div><div class="comment__item-content"><pre>' + comment_content + '</pre></div></div><div class="comment__item-bfooter"><div class="comment__item-date">' + commentDate + '</div><div class="comment__item-actions">' + replyButton + '<div class="comment__item-like" data-isLiked=' + comment.isLiked + '>' + likedIcon + '<span class="comment__item-like-count" data-likes=' + comment.likes + '>' + likes + '</span></div></div></div>' + repliesBox + '</div></div>');
					}
					else {
						jQuery(htmlItem).append('<div class="comment__item" data-comment-id="' + comment.commentId + '" data-user="' + comment.commentByUserId + '"><div class="comment__item-image">'+ imagePath +'</div><div class="comment__item-body" self-comment=' + isOwnComment + '><div class="comment__item-bheader"><div class="comment__item-name">' + comment.name + '</div><div class="comment__item-content"><pre>' + comment_content + '</pre></div></div><div class="comment__item-bfooter"><div class="comment__item-date">' + commentDate + '</div><div class="comment__item-actions">' + replyButton + '<div class="comment__item-like" data-isLiked=' + comment.isLiked + '>' + likedIcon + '<span class="comment__item-like-count" data-likes=' + comment.likes + '>' + likes + '</span></div></div></div>' + repliesBox + '</div><div class="feed__head-menu"><a><i class="fas fa-ellipsis-h" aria-hidden="true"></i></a><div class="options__menu hidden" data-id="' + comment.commentId + '" data-type="comment"><div class="options__menu-mask"></div><div class="options__menu-box"><ul><li data-type="editComment">Edit<span class="options__menu-icon">' + icons.edit + '</span></li><li data-type="deleteComment">Delete<span class="options__menu-icon">' + icons.delete + '</span></li></ul></div></div></div>');
					}
				});
			}

			autosize();

			if (jQuery(htmlItem).hasClass('replies__box')) {
				jQuery(htmlItem).slideToggle();
			}
		}

		//Fetch more comments if there are more
		if (data.length >= 10) {
			renderComments(
				'init',
				{
					postId: data[0]['postId'],
					commentFetchType: 3,
					commentId: data[data.length - 1]['commentId'],
				},
				jQuery('#app')
			);
		}

		function renderRepliesBox(replyCount, replies, htmlItem) {
			renderItem = '';

			if (!jQuery(htmlItem).hasClass('replies__box') && !jQuery(htmlItem).hasClass('comment__item-replies')) {
				renderItem = '<div class="comment__item-replies" data-replies=' + replyCount + '>' + replies + '</div>';
			}

			return renderItem;
		}

		function formatLikes(likes) {
			if (likes == 0) {
				return '';
			} else {
				return likes;
			}
		}

		function checkLiked(liked) {
			if (liked) {
				return icons.heart_active;
			} else {
				return icons.heart;
			}
		}

		function renderReplyButton() {
			return '<div class="comment__item-reply">Reply</div>';
		}
	}

	else if (state == 'replyComment') {
		toast('Reply added');
		jQuery('.drawer-kapat').click();
		//jQuery('.feed_item [data-id="890723"]').find('.feed__comment').click();
		jQuery('.feed__comment').removeClass('reply');
		jQuery('.feed__comment').removeAttr('comment-id');
		jQuery('.feed__comment').removeAttr('post-id');
		jQuery('.feed__comment').removeAttr('user-id');

	}
}

function renderTabs(data, state) {
	render = false;
	console.log(data);

	if (data.childItems > 0) {
		render = true;
	}

	if (!render) {
		jQuery('#main__tabs').append('<ul></ul>');
		data.childItems.forEach((tab) => {
			/*if (tab.module !== 'LiveFeed') {
				// tab.module !== 'experiences' &&
				if (tab.module == 'Following' && guestMaster('noLogin')) {
					return;
				}

				//Remove the Services tab
				if (tab.module == 'experiences') {
					return;
				}

				//Make the label capitalcase
				label = tab.label.toLowerCase();
				label = label.charAt(0).toUpperCase() + label.slice(1);
				jQuery('#main__tabs ul').append('<li class="tab__item" data-page="0" data-loaded="false" data-id="' + tab.value + '" data-tab="' + label.toLowerCase() + '"><a>' + label + '</a></li>');
				jQuery('#main__feed').append('<div class="feed__box tab__' + label.toLowerCase() + '"></div>');
			}*/
			label = tab.label;
			if (tab.module == "Influencers" || tab.module == "Following" || label == 'TRENDING' /*|| label == 'FIND'*/) {
				return;
			}
            if (tab.module !== 'LiveFeed') {
				// tab.module !== 'experiences' &&
                if (tab.module == 'Following' && guestMaster('noLogin')) {
                    return;
                }
                if (tab.module == 'experiences') {
                    return;
                }
                
                //Make the label capitalcase
				// label = tab.label.toLowerCase();
				// label = label.charAt(0).toUpperCase() + label.slice(1);
				var icon = '';
				
				
				if (label == 'MEETUPS' || label == 'FIND') {
					icon = icons.tabFind;
					
				}
				/*else
				if (label == 'TRENDING') {
					label = 'FIND';
					//icon = icons.tabTrending;
					icon = icons.tabFind;
				}*/	
				else if (label == 'LOCAL') {
					icon = icons.tabLocal;
				}
				
				jQuery('#main__tabs ul').append('<li class="tab__item" data-page="0" data-loaded="false" data-id="' + tab.value + '" data-tab="' + label.toLowerCase() + '"><a>' + icon + label + '</a></li>');
				jQuery('#main_item').append('<div id="' + label.toLowerCase() + '" class="community__tabs"></div>');
            
            }
		});
		
		if (state == 'community') {
			jQuery('#main__tabs ul li:first-child').click();
		}

		/*jQuery('#main__tabs ul li:first-child').click();
		jQuery('#main__tabs').addClass('horizontal-scroll');*/
	}
	else {
		jQuery('#main__tabs').append('<p>No Tabs Found</p>');
	}
}

function getDummyImageUrl(){
	return renderUserProfileImage('uploads/display_pictures/dummy.png');
}

function calculateEMI(principal, rate, tenure) {
    rate = rate / (12 * 100);  // monthly interest rate
    emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
    return Number(emi).toFixed(2);
}

function renderFeed(posts, tab) {
	console.log(posts);
	
	var postLength = jQuery('.feed_item.feed_item-find_buddy').length;
	if (postLength > 5) {
		// if (guestMaster() && posts.object.pageNumber >= 3 && posts.object.pageNumber % 2 == 0) {
		if (guestMaster() && posts.object.pageNumber > 1) {
			//Show the login popup
			if (jQuery('.traveller-details-review__content').length <= 0) {
				renderBottomSheet('', 'loginNew');
			}
			//redirect('login');
		}
		if (!guestMaster() && posts.object.pageNumber >= 3 && posts.object.pageNumber % 2 == 0) {
			// Show onboarding Popup 
			if (profile.completeness < 35) {
				if (jQuery('.traveller-details-review__content').length <= 0) {
					renderBottomSheet('', 'onboardingOne');
				}
			}
		}
	}
	
	// post.object.list has array of posts
	// Make the viewType 22 as the first post if it is not at the first position
	let firstViewType22Index = '', firstViewType22Post = '';
	
	if (posts.object && posts.object.list && firstViewType22Index !== -1) {
		// Find the first occurrence of a post with viewType 22
		firstViewType22Index = posts.object.list.findIndex(post => post.viewType === 22);
	
		if (firstViewType22Index != -1) { 
			// Get the first viewType 22 post
			firstViewType22Post = posts.object.list[firstViewType22Index];
		
			// Remove all occurrences of viewType 22
			posts.object.list = posts.object.list.filter(post => post.viewType !== 22);
		
			// Add the first viewType 22 post to the beginning of the list
			posts.object.list.unshift(firstViewType22Post);
		}
	}
	

	if (posts) {
		if (!tab.includes('#secondary') && !tab.includes('.popup__master--findBuddySimilar .popup__body')){
			listItem = document.querySelector(`#main__tabs li[data-tab="${tab}"]`);
			listItem.setAttribute('data-page', posts.body.pageNumber);
		}
		posts = !tab.includes('.popup__master--findBuddySimilar .popup__body') ? posts.object.list : posts;
		if (posts.length == 0) {
			manageEmptyFeed(tab);
		}
	
		renderFunctions = {
            0: renderPost,
            //1: renderAdvertisement,
            4: renderPremiumCards,
            6: renderTrendingInterests,
            9: renderLocals,
            11: renderInfluencerCards,
            15: renderListingCard,
            20: renderPartnerCards,
            21: renderNearByExperiencesCard,
            22: renderExperienceCard,
            25: renderAllHostellers,
            26: renderNewHostellers,
            27: renderNearbyHostellers,
			28: renderCheapestFlight,
			29: renderFlightsCarousel,
        };
        
        if (!tab.includes('.popup__master--findBuddySimilar .popup__body')) {
            where = tab.includes('#secondary') ? jQuery(tab) : jQuery('#' + tab);
        }
        else {
            where = tab;
        }
        // We have to filter out the post with viewType not present in the renderFunctions function as it prevents the Sentinel from being added
        
        filteredPosts = posts.filter(post => renderFunctions.hasOwnProperty(post.viewType));
        
        postsArrayLength = filteredPosts.length;
        
		filteredPosts.forEach((post, index) => {
			renderFunction = renderFunctions[post.viewType];
			if (renderFunction) {
				renderFunction(post, where, isLast = index === postsArrayLength - 1 ); // Sometimes page doesnt have 4 items. Make sure to communicate the index value to Ranjith so that either the pages are empty or should have atleast 4 items
                
				// Now its resolved by the above logic
				
				
				// Smart ad placement
				if (shouldShowAd(index)) {
					if ((guestMaster() || manageUserProfile('read', 'isVerified') != true) && (!isAndroid() && !isIOS())) {
						renderAdvertisement({}, where, false);
						adDisplayCount++;
					}
				}
			}
		});
	
		autosize();
		//loaderMain('feed', false);
		loaderMain('secondary', false);
        if (!tab.includes('#secondary') && !tab.includes('.popup__master--findBuddySimilar .popup__body')) {
            communityPagination();
            setTimeout(() => {
                loaderMain('global', false);
            }, 500);
            /*feedSentinel = document.querySelector('.feeds__sentinel__card');
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

            feedPaginationObserver.observe(feedSentinel); // Start observing the sentinel*/
        }
       /*else {
            feedSentinel = document.querySelector('.feeds__sentinel__card');
            let feedPaginationObserver;

            options = {
                root: document.querySelector('.secondary__tab'), // use the search__body as the viewport
                rootMargin: '0px', // Increase margin to trigger earlier
                threshold: 0.01 // Trigger when half of the sentinel is visible
            };

            feedPaginationObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Sentinel is visible, log the event
                        console.log('Sentinel is at the end of the scroll');
                        
                        //if (jQuery('.main_item .search__results-box .search__item').length > 9 ) {
                        
                        tabSelector = jQuery('#secondary .secondary__tab .drawerBody .feed__box.similar__plans');
                        
                        pageNumber = 1 + Number(tabSelector.attr('data-page'));
                        tabType = tabSelector.attr('data-id');
                        
                        locName = tabSelector.attr('data-location');
                        
                        payloadData = { feedsType: 'LOCATION', pageNumber: pageNumber, location: locName, userId: manageUserProfile('read', 'userId') };
                        
                        fetchPosts(payloadData, '#secondary .secondary__tab:last-child .drawerBody .feed__box');
                        
                        tabSelector.attr('data-page', pageNumber);
                        
                        observer.unobserve(entry.target); // Stop observing the current sentinel
                        
                        // remove the current sentinel
                        entry.target.remove();
                        //}
                    }
                });
            }, options);

            feedPaginationObserver.observe(feedSentinel); // Start observing the sentinel 
            
        }*/
	}

	function renderListingCard(post, where, isSentinelCard) {
		if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
		return;
        jQuery(where).append('<div class="listing-container"><div class="listing_title_box"><span><h4 id="card_title">Local Listings</h4></span><u><h4 id="see_all_listing">See All</h4></u></div><div class=" listing--card--wrapper swiper-wrapper"></div></div>');
        post = post.experiences.listing;
        console.log(post);
        post.forEach(listing => {
			imagePath = getProfileImage(renderUserProfileImage(listing.listingPostedByPic), '', '', '', (listing.listingPostedByRoleType == 7));
            if(listing.listingCostAmount > 0){
            cost = '<div class= "listing-desc-price"><p>'+listing.currency + ' ' + listing.listingCostAmount + ' / '+ listing.costDuration +'</p></div>';
            }
            else{
                cost = '<div class= "listing-desc-price"><p>Request Pricing</p></div>';
            }
			
			if (listing.listingMedia != '' && listing.listingMedia != null && listing.listingMedia != undefined && listing.listingMedia.length != undefined && listing.listingMedia.length > 0 && listing.listingMedia != '0') {
				mediaUrl = renderUserProfileImage(listing.listingMedia);
			}
			else {
				mediaUrl = '/view/assets/img/profile_blank_bg.png';
			}
			
			
            jQuery('.listing--card--wrapper').append('<div class= "listing--card" data-userId="'+ listing.listingPostedByUserID +'"><div class="listing--card-header"><div class="listing-card-name"><div class="profile-icon-left">'+ imagePath +'</div><div class="listing-card-owner-name"> <p class="expBy">Experiences by</p><h3 class="expOwner-name">@ '+listing.listingPostedBy +'</h3></div></div></div><div class="listing-card-image" data-listingId="'+listing.listingId+'"><img class="listed-image" src="'+ mediaUrl +'"/ alt="listed-image"></div><div class="listing-desc"><div class="listing-desc-name"><h3>'+ listing.listingName +'</h3><p>'+listing.listingCity +'</p></div>'+ cost +'<div class="listing-trusted-badge"><div class="experience-type"><img class="listing-service__icon" src="'+renderUserProfileImage(listing.serviceIconUrl) +'"/><h3>'+ listing.serviceType +'</h3></div><div class="trusted-badge">'+icons.trusted_badge +'</div></div></div></div>');
        });
        // swiper('trend_location_swiper', '.trendSwiper');
        
        if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
    }

	function renderNearByExperiencesCard(data, where, isSentinelCard) {
		jQuery(where).append('<div class="experience__card experience__topRated"><div class="experience__topRated-head nearby_all_experiences"><div class="experience__topRated-left">' + icons.lightning + ' '+ data.cardDescription +'</div><div class="see_all_experiences">See All</div></div><div class="experience__topRated-body"><div class="swiper-wrapper"></div></div></div>');
        data.cardImages.experiences.forEach((experience) => {
            if (experience.experienceImages[0] !== undefined) {
                featuredImage = renderFeaturedImage(experience.experienceImages[0].mediaUrl, experience.experienceTitle, experience.location);
            }
            userName = renderHostName(experience);
            manufacturedUrl = renderManufacturedUrl(experience);
            avgRatings = renderAvgRatings(experience.experienceRating);
            slotsLeftBadge = renderSlotLeftBadge(experience, 'topRatedExperiences');
			emiValue = calculateEMI(experience.pricing,16,12);
			emiValueTag = '<span> EMI ₹' + emiValue + '/month</span>';
            jQuery('.experience__card.experience__topRated:last-child .experience__topRated-body .swiper-wrapper').append('<div class="experience__topRated-item swiper-slide" data-id="' + experience.experienceId + '" data-url="' + manufacturedUrl + '"><div class="experience__topRated-badge">' + emiValueTag +  ' </div><div class="experience__topRated-imageBox">' + featuredImage + '<div class="experience__topRated-title">' + experience.experienceTitle + '</div>' + slotsLeftBadge + '<div class="experience__topRated-bookmark">' + icons.bookmark + '</div></div><div class="experience__topRated-contentBox"><div class="experience__topRated-category">' + experience.category + '</div><div class="experience__topRated-hostRating"><div class="experience__topRated-host">' + userName + '</span></div><div class="experience__topRated-rating">' + icons.star + avgRatings + '</div></div><div class="experience__topRated-pricing"><div class="experience__topRated-price"><span>₹</span>' + numberWithCommas(experience.pricing) + slashedPrice(experience.pricing, '₹', 50) + '</div></div></div></div>');
        });
        swiper('topRatedExperiences', '.experience__topRated-body', 'feeds');
        
        if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
        // Functions
        function renderFeaturedImage(image, name, location) {
            if (image !== undefined ) {
                return '<img draggable="false" loading="lazy" src="' + renderPostMedia(image, 'image') + '" alt="' + name + ' in ' + location + '">';
            }
            else {
                return '<img draggable="false" src="/view/assets/img/experiences__bg.webp" alt="' + name + ' in ' + location + '">';
            }
        }
        function renderManufacturedUrl(experience) {
            renderItem = '';
            if (experience.title) {
                renderItem = (experience.title.replace(/ /g, '-') + '-' + experience.id + '/').toLocaleLowerCase();
                renderItem = renderItem.replace('//', '/');
                renderItem = renderItem.replace(/[^a-zA-Z0-9-]/g, '');
                if (renderItem.substr(-1) != '/') {
                    renderItem += '/';
                }
            }
            return renderItem;
        }
        function renderSlotLeftBadge(data, from) {
            renderItem = '';
            show = false;
            try {
                data = data.calendarSlots[0];
                if (data) {
                    if (Number(data.batch_size) * 0.5 >= Number(data.ticketsLeft)) {
                        show = true;
                        color = 'yellow';
                    }
                    else if (Number(data.batch_size) * 0.3 >= Number(data.ticketsLeft)) {
                        show = true;
                        color = 'red';
                    }
                    if (show && (Number(data.ticketsLeft) < 5)) {
                        if (from == 'topRatedExperiences') {
                            renderItem = '<div class="experience__topRated-badge experience__topRated-badge__' + color + '">Only ' + Number(data.ticketsLeft) + ' slots left!</div>';
                        }
                        else if (from == 'singleExperience') {
                            renderItem = '<div class="experience__booking-badge experience__booking-badge__' + color + '">Only ' + Number(data.ticketsLeft) + ' Slots left!</div>'
                        }
                        else {
                            renderItem = '<div class="experience__item-badge experience__item-badge__' + color + '">Only ' + Number(data.ticketsLeft) + ' slots left!</div>';
                        }
                    }
                }
            } catch (error) { }
            return renderItem;
        }
        function renderHostName(experience) {
            renderItem = '';
            try {
                if (experience.hostName) {
                    renderItem = experience.hostName;
                }
            }
            catch (error) {
                console.log(experience);
                console.log(error);
            }
            return renderItem;
        }
        function renderAvgRatings(ratings) {
            renderItem = '5.00';
            if (ratings) {
                renderItem = Number(ratings).toFixed(2);
            }
            return renderItem;
        }
    }

	function renderShotCards(post, where) {
		jQuery(where).append('<div class="shots_container shotsSwiper"><div class="shot_row"><h4>Travel Shots</h4><div class="shots_redirect"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 58 58" fill="none"><path d="M54.375 29C54.3765 29.6154 54.2187 30.2207 53.917 30.7571C53.6152 31.2934 53.1798 31.7426 52.6531 32.0609L20.01 52.0301C19.4596 52.3671 18.8293 52.5511 18.1841 52.563C17.5389 52.575 16.9021 52.4144 16.3397 52.098C15.7826 51.7866 15.3185 51.3323 14.9952 50.782C14.6719 50.2317 14.5009 49.6052 14.5 48.967V9.03305C14.5009 8.39479 14.6719 7.76829 14.9952 7.21799C15.3185 6.66769 15.7826 6.21344 16.3397 5.90195C16.9021 5.58556 17.5389 5.42504 18.1841 5.43699C18.8293 5.44894 19.4596 5.63292 20.01 5.96992L52.6531 25.9391C53.1798 26.2574 53.6152 26.7066 53.917 27.2429C54.2187 27.7793 54.3765 28.3846 54.375 29Z" fill="black"/></svg>Watch All</div></div><div class="shots_wrapper swiper-wrapper"></div></div>');

		console.log(post);

		post = post.trendingVideos;

		post.forEach(shot => {
			jQuery('.shotsSwiper:last-child .shots_wrapper').append('<div class="shots-slide swiper-slide" data-id="' + shot.postId + '"><div class="shots_thumbnail"><video autoplay muted loop playsinline autobuffer id="myVideo"><source src="' + renderPostMedia(shot.mediaUrl, 'video') + '" type="video/mp4" height="20%"></video><svg width="40" height="40" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14587 13.9763V7.107C8.14602 7.02105 8.16927 6.93673 8.21321 6.86286C8.25714 6.78899 8.32014 6.7283 8.39559 6.68714C8.47104 6.64598 8.55618 6.62588 8.64207 6.62893C8.72796 6.63199 8.81145 6.65809 8.88379 6.7045L14.2275 10.1382C14.2951 10.1816 14.3508 10.2412 14.3894 10.3117C14.4279 10.3822 14.4481 10.4613 14.4481 10.5417C14.4481 10.622 14.4279 10.7011 14.3894 10.7716C14.3508 10.8421 14.2951 10.9018 14.2275 10.9451L8.88379 14.3798C8.81145 14.4262 8.72796 14.4523 8.64207 14.4554C8.55618 14.4584 8.47104 14.4383 8.39559 14.3972C8.32014 14.356 8.25714 14.2953 8.21321 14.2214C8.16927 14.1476 8.14602 14.0632 8.14587 13.9773V13.9763Z" fill="#999999"/><path d="M0 10.5417C0 4.71979 4.71979 0 10.5417 0C16.3635 0 21.0833 4.71979 21.0833 10.5417C21.0833 16.3635 16.3635 21.0833 10.5417 21.0833C4.71979 21.0833 0 16.3635 0 10.5417ZM10.5417 1.4375C8.12709 1.4375 5.81141 2.39669 4.10405 4.10405C2.39669 5.81141 1.4375 8.12709 1.4375 10.5417C1.4375 12.9562 2.39669 15.2719 4.10405 16.9793C5.81141 18.6866 8.12709 19.6458 10.5417 19.6458C12.9562 19.6458 15.2719 18.6866 16.9793 16.9793C18.6866 15.2719 19.6458 12.9562 19.6458 10.5417C19.6458 8.12709 18.6866 5.81141 16.9793 4.10405C15.2719 2.39669 12.9562 1.4375 10.5417 1.4375Z" fill="#999999"/></svg><span>' + shot.name + '</span></div></div>');
		});

		swiper('shots_container', '.shotsSwiper')
	}

	function renderExperienceCard(post, where, isSentinelCard) {
		jQuery(where).append('<div class="exp_card" style="cursor: pointer" data-redirect="' + post.cardImages[0].redirectUrl + '"><img id="top_card_image" src="' + renderUserProfileImage(post.cardImages[0].imageUrl) + '">');
        
        if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
	}

	function renderPartnerCards(post, where, isSentinelCard) {
		recentlyUpdatedDocument = jQuery(where).append('<div class="carousel"><div class="carousel-wrapper"></div><div class="carousel__indicators"></div></div>');
        carouselWrapper = recentlyUpdatedDocument.find('.carousel-wrapper').last()[0];
        indicatorsContainer = recentlyUpdatedDocument.find('.carousel__indicators').last()[0];
        let currentIndex = 0;
        let autoScrollInterval;
        let userInteracted = false;
        let startX = 0;
        let endX = 0;
        let scrollTimeout;
		// Clear existing slides and indicators
        carouselWrapper.innerHTML = '';
        indicatorsContainer.innerHTML = '';
		// Update indicators
        function updateIndicators() {
            indicators = indicatorsContainer.children;
            for (let i = 0; i < indicators.length; i++) {
                indicators[i].classList.toggle('active', i === currentIndex);
            }
        }
        // Go to specific slide
        function goToSlide(index) {
            currentIndex = index;
            carouselWrapper.scrollTo({ left: currentIndex * carouselWrapper.clientWidth, behavior: 'smooth' });
            updateIndicators();
        }
		
        function createCard(card, index) {
            slide = document.createElement('div');
            slide.className = 'carousel-slide';
            redirectTo ='';
            if (card.action != 'donothing') {
                redirectTo = card.redirectUrl;
            }
            slide.setAttribute('data-redirect', redirectTo);
            let mediaTag;
            ext = card.imageUrl.split('.').pop().toLowerCase();
            mediaType = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm', 'quicktime', 'h.264', 'h.265', '3gp', 'mpeg-4'].includes(ext) ? 'video' : 'image';
            if (mediaType === 'video') {
                mediaTag = document.createElement('video');
                mediaTag.src = videoBaseUrl + "/" + card.imageUrl;
                mediaTag.muted = true;
                mediaTag.autoplay = true;
                mediaTag.controls = true;
                mediaTag.loop = true;
                 mediaTag.style.width = '100%'; // Ensure the video takes the full width of the slide
                mediaTag.addEventListener('ended', nextSlide);
                // Create mute/unmute button
                muteButton = document.createElement('button');
                muteButton.innerHTML = icons.unmute;
                muteButton.className = 'mute-button';
                // The Object.assign method is used to copy the values of all enumerable own properties from one or more source objects to a target object
                // Properties that can be iterated over in a for...in loop are considered enumerable
                Object.assign(muteButton.style, {
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: '10',
                    display: 'none' // Initially hide the button
                });
                // Add event listener to toggle mute state
                muteButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent the click from triggering the link
                    event.preventDefault(); // Prevent the click from triggering the link
                    mediaTag.muted = !mediaTag.muted;
                    muteButton.innerHTML = mediaTag.muted ? icons.unmute : icons.mute;
                });
                slide.appendChild(muteButton);
                // Create an Intersection Observer to show/hide the mute button
                observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        muteButton.style.display = entry.isIntersecting ? 'block' : 'none';
                    });
                }, { threshold: 0.5 }); // Adjust threshold as needed
                observer.observe(slide);
            }
            else {
                mediaTag = document.createElement('img');
                mediaTag.src = renderUserProfileImage(card.imageUrl);
            }
            slide.appendChild(mediaTag);
            carouselWrapper.appendChild(slide);
			// Create indicator
            indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        }
        function nextSlide() {
            currentIndex = (currentIndex + 1) % carouselWrapper.children.length;
            carouselWrapper.scrollTo({
                left: currentIndex * carouselWrapper.clientWidth,
                behavior: 'smooth'
            });
        }
        function prevSlide() {
            currentIndex = (currentIndex - 1 + carouselWrapper.children.length) % carouselWrapper.children.length;
            carouselWrapper.scrollTo({
                left: currentIndex * carouselWrapper.clientWidth,
                behavior: 'smooth'
            });
        }
        function startAutoScroll() {
            stopAutoScroll();
            autoScrollInterval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
        }
        function stopAutoScroll() {
            clearInterval(autoScrollInterval);
        }
        function handleUserInteraction() {
            userInteracted = true;
            stopAutoScroll();
            setTimeout(() => {
                userInteracted = false;
                startAutoScroll();
            }, 5000); // Resume auto-scroll after 5 seconds of inactivity
        }
        function handleTouchStart(event) {
            startX = event.touches[0].clientX;
        }
        function handleTouchMove(event) {
            endX = event.touches[0].clientX;
        }
        function handleTouchEnd() {
            if (startX > endX + 50) {
                handleUserInteraction();
                nextSlide();
            }
            else if (startX < endX - 50) {
                handleUserInteraction();
                prevSlide();
            }
        }
        function handleScroll() {
            handleUserInteraction();
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                if (!userInteracted) startAutoScroll();
            }, 1000); // Debounce scroll event debounces the scroll event to prevent it from firing too frequently.
        }
		// Handle scroll event
        carouselWrapper.addEventListener('scroll', () => {
        	slideWidth = carouselWrapper.clientWidth;
            currentIndex = Math.round(carouselWrapper.scrollLeft / slideWidth);
            updateIndicators();
        });
        // Create cards
        post.cardImages.forEach((data, index) =>  createCard(data, index));
        // Start auto-scrolling
        startAutoScroll();
        // Add event listeners for user interaction
        carouselWrapper.addEventListener('mouseover', stopAutoScroll);
        carouselWrapper.addEventListener('scroll', handleScroll);
        carouselWrapper.addEventListener('mouseout', () => {
            if (!userInteracted) startAutoScroll();
        });
        // Add touch event listeners for mobile swipe
        carouselWrapper.addEventListener('touchstart', handleTouchStart);
        carouselWrapper.addEventListener('touchmove', handleTouchMove);
        carouselWrapper.addEventListener('touchend', handleTouchEnd);
        
        if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
	}

	function renderInfluencerCards(post, where, isSentinelCard) {
        jQuery(where).append('<div class="influencer_container"><div class="influencer_title_box"><span><h4 id="card_title">Local Influencers</h4></span><u><h4 id="see_all_redirect">See All</h4></u></div><div class="influencer_wrapper"></div></div>');
        console.log(post);
        post = post.ambassadors;
        y = 0;
        post.forEach(influencer => {
            if (y < 20) {
                services = renderServices(influencer.services);
                isInfluencer = influencer.roleType == 7;
                imagePath = getProfileImage(renderUserProfileImage(influencer.imageUrl), '', '', '', isInfluencer);
                jQuery('.influencer_wrapper').append('<div class="inf_profile_box clearfix" data-user-id="' + influencer.userId + '"><div class="inf_back_box clearfix"><div class="location_title">' + (influencer.location?influencer.location:'') + '</div><img src="' + renderUserProfileImage(influencer.serviceCoverPhotoUrl) + '" ></div><div class="profile_info clearfix">'+ imagePath +'<div class="name_expertise_box"><h4 class="prof_name">' + influencer.name + '</h4><p class="expertise">Local Expertise</p></div></div><div class="infl_category_box"><ul class="infl_category_type">' + services + '</ul></div></div>');
                y++;
            }
            else {
                return;
            }
        });
        if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
        function renderServices(services) {
            renderItem = '';
            x = 0;
            services.forEach(service => {
                if (x < 3) {
                    renderItem += '<li class="infl_categories"><img src="' + renderUserProfileImage(service.iconUrl) + '">' + service.serviceDisplayName + '</li>';
                    x++;
                }
            });
            return renderItem;
        }
    }

	function renderPremiumCards(post, where, isSentinelCard) {
		if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
		return;
		//jQuery(where).append('<div class="premium_cards_container premiumSwiper "><div class="premiumcards_wrapper swiper-wrapper"><div class="premium_cards_slider swiper-slide"><img src="/view/assets/img/prem-preview.webp" height="100px" width="100px"></div><div class="premium_cards_slider swiper-slide"><img src="/view/assets/img/prem-mini.webp"></div><div class="premium_cards_slider swiper-slide"><img src="/view/assets/img/buy_premium_three.jpg"></div><div class="premium_cards_slider swiper-slide"><img src="/view/assets/img/buy_premium_four.jpg"></div><div class="premium_cards_slider swiper-slide"><img src="/view/assets/img/buy_premium_five.jpg"></div><div class="premium_cards_slider swiper-slide"><img src="/view/assets/img/buy_premium_six.jpg"></div><div class="premium_cards_slider swiper-slide"><img src="/view/assets/img/buy_premium_seven.jpg"></div></div><div class="swiper-pagination" id="premium_card_pagination"></div><div class="support__travelBuddy"><p>Find Travel Buddies 3X Faster.</p><span>Go Premium</span></div></div>');

		//swiper('premium_cards_container', '.premiumSwiper')
        if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
	}

	function renderTrendingInterests(post, where, isSentinelCard) {
		if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
		return;
        jQuery(where).append('<div class="trending_locations_cardbox trendSwiper"><div class="trending_locations_titlebox"><h4 id="trend_locations">Trending Interests</h4></div><div class="trending_locations_wrapper"></div></div>');
        post = post.interests;
        post.forEach(interest => {
            jQuery('.trendSwiper .trending_locations_wrapper').append('<div class="trending_location_indvcard" data-interest="' + interest.interest + '" data-interest-id="' + interest.interestId + '"><img src="' + renderUserProfileImage(interest.imageUrl) + '"><div class="name_views_box"><h5 id="name_locations">' + interest.interest + '</h5></div><div class="no_of_views_box">' + icons.eye + '<span id="no_of_views">' + numberWithK(interest.count) + '+ posts</span></div>');
        });
        //swiper('trend_location_swiper', '.trendSwiper');
        if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
    }

	


	function manageEmptyFeed(tab) {
		jQuery(tab).append('<div class="no-posts"><div class="no-posts__icon">' + icons.sadSmiley + '</div><div class="no-posts__text">No Posts Found</div></div>');
	}
	
	function renderFlightsCarousel(post, where, isSentinelCard) {
		let images = getFlightsCarouselImages();
		jQuery(where).append(`${createPremiumCarousel(images).outerHTML}`);
		startAutoSlide(images.length);
		if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
	}
}

function renderAdvertisement(post, where, isSentinelCard) {
	// Don't show ads on localhost
	if (window.location.hostname === 'localhost') {
		if (isSentinelCard) {
			jQuery(where).append('<div class="feeds__sentinel__card"></div>');
		}
		return;
	}

	// Check if ads are blocked or disabled
	if (window.adBlockDetected || window.adsDisabled) {
		if (isSentinelCard) {
			jQuery(where).append('<div class="feeds__sentinel__card"></div>');
		}
		return;
	}

	// Check if we can show an ad based on frequency control (more lenient)
	if (window.AdManager && !window.AdManager.canShowAd()) {
		// Only skip if it's been less than 5 seconds (more aggressive ad showing)
		const timeSinceLastAd = Date.now() - (window.AdManager.lastAdTime || 0);
		if (timeSinceLastAd < 5000) { // 5 seconds minimum
			if (isSentinelCard) {
				jQuery(where).append('<div class="feeds__sentinel__card"></div>');
			}
			return;
		}
	}

	// Generate unique ad container ID
	const adId = 'ad_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
	
	const googleAds = `<div class="ad_container" id="${adId}">
		<div class="ad_wrapper">
			<div class="ad_loading" style="display: flex; align-items: center; justify-content: center; height: 90px; background: #f5f5f5; border-radius: 8px; margin: 10px 0;">
				<div style="text-align: center;">
					<div style="width: 20px; height: 20px; border: 2px solid #ddd; border-top: 2px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
					<div style="font-size: 12px; color: #666;">Loading advertisement...</div>
				</div>
			</div>
			<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2182701660122082" crossorigin="anonymous"></script>
			<ins class="adsbygoogle" 
				 style="display:block;" 
				 data-ad-client="ca-pub-2182701660122082" 
				 data-ad-slot="7328663740" 
				 data-ad-format="auto"
				 data-adtest="off">
			</ins>
		</div>
		<div class="go__ads-free" style="display: none;">
			<p>Tired of too many ads?</p>
			<div class="go__premium">Go Ad-Free NOW</div>
		</div>
	</div>`;
	
	jQuery(where).append(googleAds);
	
	const adContainer = jQuery('#' + adId);
	const adElement = adContainer.find('.adsbygoogle')[0];
	const adLoading = adContainer.find('.ad_loading');
	const adFreeElement = adContainer.find('.go__ads-free');
	
	// Ad detection configuration
	const adConfig = {
		maxWaitTime: 8000, // 8 seconds max wait (reduced for faster ad display)
		checkInterval: 300, // Check every 300ms (faster checking)
		minHeight: 30, // Lower minimum ad height for more ads to qualify
		timeoutId: null,
		observer: null,
		adLoaded: false,
		adFailed: false
	};

	// Enhanced ad detection function
	function isAdLoaded() {
		if (!adElement || adConfig.adLoaded || adConfig.adFailed) {
			return adConfig.adLoaded;
		}

		try {
			// Check for actual ad content
			const hasContent = adElement.innerHTML.trim() !== '';
			const hasHeight = adElement.offsetHeight >= adConfig.minHeight;
			const hasChildren = adElement.children.length > 0;
			const hasIframe = adElement.querySelector('iframe') !== null;
			const hasAdSense = adElement.querySelector('[id*="google_ads"]') !== null;
			const hasAdClass = adElement.classList.contains('adsbygoogle') && 
							 adElement.style.display !== 'none' && 
							 adElement.style.visibility !== 'hidden';

			// More comprehensive ad detection
			const isAdPresent = hasContent && hasHeight && 
							   (hasChildren || hasIframe || hasAdSense) && 
							   hasAdClass;

			return isAdPresent;
		} catch (error) {
			console.warn('Error checking ad status:', error);
			return false;
		}
	}

	// Handle successful ad load
	function onAdLoaded() {
		if (adConfig.adLoaded) return; // Prevent multiple calls
		
		adConfig.adLoaded = true;
		adLoading.hide();
		
		// Record successful ad load
		if (window.AdManager) {
			window.AdManager.recordAdEvent('loaded');
		}
		
		// Show ad-free text after a short delay
		setTimeout(() => {
			adFreeElement.fadeIn(300);
		}, 1000);
		
		// Clean up
		cleanupAdDetection();
		
		console.log('Ad loaded successfully');
	}

	// Handle ad failure
	function onAdFailed() {
		if (adConfig.adFailed) return; // Prevent multiple calls
		
		adConfig.adFailed = true;
		adLoading.hide();
		adContainer.hide(); // Hide the entire ad container
		
		// Record failed ad load
		if (window.AdManager) {
			window.AdManager.recordAdEvent('failed');
		}
		
		// Clean up
		cleanupAdDetection();
		
		console.log('Ad failed to load');
	}

	// Clean up detection resources
	function cleanupAdDetection() {
		if (adConfig.timeoutId) {
			clearTimeout(adConfig.timeoutId);
			adConfig.timeoutId = null;
		}
		
		if (adConfig.observer) {
			adConfig.observer.disconnect();
			adConfig.observer = null;
		}
	}

	// Start ad detection
	function startAdDetection() {
		let checkCount = 0;
		const maxChecks = adConfig.maxWaitTime / adConfig.checkInterval;
		
		const checkInterval = setInterval(() => {
			checkCount++;
			
			if (isAdLoaded()) {
				clearInterval(checkInterval);
				onAdLoaded();
			} else if (checkCount >= maxChecks) {
				clearInterval(checkInterval);
				onAdFailed();
			}
		}, adConfig.checkInterval);

		// Set maximum timeout
		adConfig.timeoutId = setTimeout(() => {
			clearInterval(checkInterval);
			if (!adConfig.adLoaded) {
				onAdFailed();
			}
		}, adConfig.maxWaitTime);

		// MutationObserver for real-time detection
		adConfig.observer = new MutationObserver((mutations) => {
			if (isAdLoaded()) {
				onAdLoaded();
			}
		});

		adConfig.observer.observe(adElement, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['style', 'class']
		});
	}

	// Initialize AdSense
	try {
		// Ensure AdSense is loaded
		if (typeof window.adsbygoogle === 'undefined') {
			window.adsbygoogle = [];
		}
		
		// Push the ad to AdSense
		window.adsbygoogle.push({});
		
		// Start detection after a short delay
		setTimeout(startAdDetection, 100);
		
	} catch (error) {
		console.error('Error initializing AdSense:', error);
		onAdFailed();
	}

	// Add sentinel card if needed
	if (isSentinelCard) {
		jQuery(where).append('<div class="feeds__sentinel__card"></div>');
	}
}


function renderLocals(post, where, isSentinelCard,  destination) {
    post = post.localUsers;
    randomAlphaNumrticString = Math.random().toString(36).substring(7);
    locationName = jQuery('.drawerTitle .highlight').html();
    if(where != '.daywise-itinerary.infAnchor') {
        locationName = jQuery('.drawerTitle .highlight').html();
        if (locationName == undefined || where.attr('class').includes('feed__box tab__local')) {
            locationName = '<div class="top-locals"><span>Locals</span></div>';
        }
        else {
            locationName = '<div class="top-locals">Locals in ' +'<span>' + locationName + '</span></div>';
        }
    }
    else {
        locationName = '<div class="top-locals">Buddies in ' +'<span>' + destination + '</span></div>';
    }
    jQuery(where).append('<div class="feed_item feed_type-locals feed-' + randomAlphaNumrticString + '" data-type="locals">'+ locationName +'<ul></ul></div>');
    post.forEach(locals => {
        imagePath = getProfileImage(renderUserProfileImage(locals.imageUrl), '', '', '', (locals.roleType == 7));
        jQuery('.feed-' + randomAlphaNumrticString + ' ul').append('<li data-user="' + locals.userId + '" data-name="' + locals.name + '">'+ imagePath +'<span class="feed_type-locals-name">' + locals.name + '</span></li>');
    });
    
    if (isSentinelCard) {
        jQuery(where).append('<div class="feeds__sentinel__card"></div>');
    }

    // horizontalScroll('.feed-' + randomAlphaNumrticString + ' ul');
}


function renderFeedLogin() {
	return renderItem = '';
}

	/*if (guestMaster('noLogin')) {
		(!isAndroid() && !isIOS()) ? installApp = '<div class="feed__login-cta feed__login-install">Install our App</div>' : installApp = '';
		renderItem = '<div class="feed__login-sticky"><div class="feed__login-left"><h3>Join the 4 Million Strong Travel Community.</h3><p>Find Like Minded Travellers.</p></div><div class="feed__login-right">' + installApp + '<div class="feed__login-cta feed__login-login">Login</div></div></div>';
	}

	return renderItem;
}*/

function renderPost(post, where, isSentinelCard) {
	try {
		//404 Error Handling
		if (where == '#secondary .secondary__tab:last-child .drawerBody .feed__box') {
			post = post.object;
			postSource = 'Single';
			console.log(post);
			jQuery('#secondary .secondary__tab:last-child .drawer__back').addClass('singlePostBack');
			// update the url
			window.history.pushState("", "", '/post/' + post.postId);
		}
		else {
			post = post.post;
			postSource = 'Feed';
		}

		//Some Data processing
		//Date formatting
		date = new Date(post.postDateTime);
		post.postDateTime = date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' }) + ', ' + date.getFullYear();

		//Media, Comments, Description & Titles Processing
		feedType = renderFeedType(post.feedType);
		userName = renderUserName(post.name);	
		userProfileImage = renderUserProfileImage(post.imageUrl);
		media = renderMedia(post.mediaList, post.postId);
		comments = renderComments(post.comments, feedType);
		postDescription = processPostDescription(post.postDescription);
		readMore = renderReadMore(post.postDescription, postSource, userName, feedType, post.bookFromTbd);
		bookmark = renderBookmark(post.isBookmarked);
		postLiked = renderPostLiked(post.isLiked, post.likes, post, feedType);
		truncate = renderTruncate(postSource);
		interested = renderInterestedCommentsLine(post.likes, post.comments, feedType, userName, post);
		postLocation = renderPostLocation(post.location, feedType);
		tripDetails = renderTripDetails(post.location, post.dateOfTravel, feedType, post.travelTime);
		descriptionBox = renderDescriptionBox(postDescription, readMore, truncate, tripDetails, feedType, post);
		optionsMenu = renderOptionsMenu(post.postId, icons, post);
		latLongAttr = (post.lat) ? ' data-lat="' + post.lat + '" data-lng="' + post.lng + '" ' : '';
		followButton = '<div class="feed__head-follow"><a><span class="feed__head-follow-icon">Follow</span></a>' + '</span></div>';
		isInfluencer = post.roleType == 7;

		imagePath = getProfileImage(userProfileImage, userName, '', '', isInfluencer);
		
		createGroupFind = '';
        
        bodyHtml = '<div class="feed__body">';
        
        actionsHtml = '<div class="feed__body-actions"><div class="feed__actions"><ul>' + postLiked + '<li><a class="feed__actions-share">' + icons.send + '</a></li></ul></div>'+ createGroupFind +'<div class="feed__actions"><ul>' + bookmark + '</ul></div></div>';
        
        commentsHtml = comments + '</div><div class="feed__comment"><textarea class="autosize" placeholder="Add a comment.." /></textarea><button>Post</button></div>';

        imagesHtml = '<div class="feed__body-images feed__body-images-' + post.postId + '"><div class="swiper-wrapper">' + media + '</div><div class="swiper-pagination"></div></div>';

		feedHead = '<div class="feed__head"><div class="feed__head-img"><a>' + imagePath + '</a></div><div class="feed__head-name"><a><span class="feed___head-name">' + userName + '</span>' + postLocation + '</a><span class="feed___head-date">' + post.postDateTime + '. </span><span class="feed___head-feedType">' + feedType + '</span><span class="findType">' + post.findType + '</span><span class="genderType">' + post.travelWithGender + '</span></div>' + followButton + '<div class="feed__head-menu"><a>'+ icons.dotMenu +'</a>' + optionsMenu + '</div></div>';
        
		if (feedType == 'Find Buddy') {

            imagesHtml = '<div class="feed__body-images feed__body-images-' + post.postId + '"><div class="feed__body-related new simliarTrips"><div class="similar__text">Similar Trips</div></div><div class="swiper-wrapper findBud">' + media + feedHead + descriptionBox + '</div><div class="swiper-pagination"></div></div>';

			if(media == ''){

				feedHead = '<div class="feed__head noMedia"><div class="findBud-head"><div class="findBud-image"><div class="feed__head-img"><a>' + imagePath + '</a></div><div class="feed__head-name"><a><span class="feed___head-name">' + userName + '</span>' + postLocation + '</a><span class="feed___head-date">' + post.postDateTime + '.</span><span class="feed___head-feedType">' + feedType + '</span><span class="findType">' + post.findType + '</span><span class="genderType">' + post.travelWithGender + '</span></div></div><div class="findBud-follow">' + followButton + '<div class="feed__head-menu"><a>'+ icons.dotMenu +'</a>' + optionsMenu + '</div></div></div></div>';

				bodyHtml = '<div class="feed__body noMedia">';

				imagesHtml = '<div class="feed__body-images feed__body-images-' + post.postId + '"><div class="feed__body-related new simliarTrips"><div class="similar__text">Similar Trips</div></div><div class="swiper-wrapper findBud">' + media +  '</div><div class="swiper-pagination"></div></div>';
				cardLayout = feedHead + bodyHtml + descriptionBox + imagesHtml + interested ;// + commentsHtml
			}
			else{

                feedHead = '<div class="feed__head findBud"><div class="findBud-head"><div class="findBud-image"><div class="feed__head-img"><a>' + imagePath + '</a></div><div class="feed__head-name"><a><span class="feed___head-name">' + userName + '</span>' + postLocation + '</a><span class="findType">' + post.findType + '</span><span class="feed___head-date">' + post.postDateTime + '.</span><span class="feed___head-feedType">' + feedType + '</span><div class="findBud-location">'+ tripDetails +'</div><span class="findType">' + post.findType + '</span><span class="genderType">' + post.travelWithGender + '</span></div></div><div class="findBud-follow">' + followButton + '<div class="feed__head-menu"><a>'+ icons.dotMenu +'</a>' + optionsMenu + '</div></div></div><div class="findBud-location hidden">'+ tripDetails +'</div></div>';
                
                
                imagesHtml = '<div class="feed__body-images feed__body-images-' + post.postId + '"><div class="feed__body-related new simliarTrips"><div class="similar__text">Similar Trips</div></div><div class="swiper-wrapper findBud">' + media + '</div><div class="swiper-pagination"></div></div>';
                
                descriptionBoxTitle = postSource == 'Single' ? 'descriptionBox singlePost' : 'descriptionBox';
                descriptionBoxCont = `<div class="${descriptionBoxTitle}">${descriptionBox}</div>`;
                
                cardLayout = postSource == 'Single' 
                    ? `<div class="feed__container">${feedHead}${imagesHtml}</div>${interested}${descriptionBoxCont}` 
                    : `<div class="feed__container">${feedHead}${imagesHtml}</div>${interested}${descriptionBoxCont}`;
                
			}

            

            mainDivStruct = '<div class="feed_item feed_item-' + feedType.toLowerCase().replace(' ', '_') + '" ' + latLongAttr + ' data-post-type="' + feedType.toLowerCase().replace(' ', '_') + '" data-id="' + post.postId + '" data-time="' + post.postDateTime + '" data-user="' + post.userId + '" data-location="' + post.location + '" data-uniqueId="' + post.uniqueUserId + '" data-userName="' + post.profileName + '" data-original-time = "'+ post.travelTime + '">' + cardLayout + '</div>';
		}
		//else if (postSource == 'Single') {
        else  {
            cardLayout = bodyHtml + imagesHtml + actionsHtml + interested + descriptionBox + commentsHtml;
            mainDivStruct = '<div class="feed_item feed_item-' + feedType.toLowerCase().replace(' ', '_') + '" ' + latLongAttr + ' data-post-type="' + feedType.toLowerCase().replace(' ', '_') + '" data-id="' + post.postId + '" data-time="' + post.postDateTime + '" data-user="' + post.userId + '" data-location="' + post.location + '" data-uniqueId="' + post.uniqueUserId + '" data-userName="' + post.profileName + '">' + feedHead + cardLayout + '</div>';
		}
		// else {
		// 	return;
		// }
		if (manageUserProfile('read', 'role') == 'admin') {
			mainDivStruct += `<div class="admin__details">Post Id:- ${post.postId}`;
		}

		//Render the feed
		jQuery(where).append(mainDivStruct);
        
        if (typeof where === 'string' && where.includes('.popup__master--findBuddySimilar .popup__body')) {
            jQuery('.popup__master--findBuddySimilar .popup__body').append('<div class="more__trips-find" id="findBuddySimilar">Checkout More Buddies in ' + post.location.split(',')[0] + '</div>');
        }

		if (post.isOwnPost || post.isFollowed) {
			jQuery(where).find('.feed_item:last .feed__head-follow').hide();
		}
		enableSwiper(post.mediaList, post.postId);

		if (postSource == 'Single') {
			loaderMain('secondary', false);
		}
        
        if (isSentinelCard) {
            jQuery(where).append('<div class="feeds__sentinel__card"></div>');
        }
	} catch (error) {
		console.log(error);
		redirect('404');
	}

	//Check if the post is liked or not and render the heart & user icons accordingly
	function renderPostLiked(liked, likes, post, feedType) {
		renderItem = '';
		likesItem = '';

		if (feedType == 'Find Buddy') {
			if (post.isLiked) {
				renderItem = '<div class="feed__body-interested interested" data-liked="' + liked + '">' + icons.heart_active + '</div>';
			} else {
				renderItem = '<div class="feed__body-interested" data-liked="' + liked + '">' + icons.heart + '</div>';
			}
		}
		else {
			if (liked) {
				icon = icons.heart_active;
				liked = 'liked';
			}
			else {
				icon = icons.heart;
				liked = '';
			}

			if (likes > 4) {
				likedByUsers = '';
				if (post.likedBy) {
					likes = likes - 3;
					likedByUsers = renderLikedByUser(post.likedBy);
				}
				likesItem = '<span class="feed__actions-liked_users">' + likedByUsers + '<span class="feed__actions-likes" data-likes="' + likes + '">+' + likes + '</span></span>';
			} else if (likes > 0) {
				if (post.likedBy) {
					likedByUsers = renderLikedByUser(post.likedBy);
					likesItem = '<span class="feed__actions-liked_users">' + likedByUsers + '</span>';
				} else {
					likesItem = '<span class="feed__actions-liked_users feed__actions-likes" data-likes="' + likes + '">+' + likes + '</span>';
				}
			}

			renderItem = '<li><a class="feed__actions-like" data-liked="' + liked + '">' + icon + '</a>' + likesItem + '</li>';
		}

		function renderLikedByUser(users) {
            renderItem = '';
            if (users !== undefined && users.length > 0) {
                users.forEach(user => {
                    imagePath = getProfileImage(renderUserProfileImage(user.imageUrl), user.name, '', '', (user.roleType == 7));
                    renderItem += '<span class="feed__actions-liked_user" data-name="' + user.name + '" data-id="' + user.userId + '">' + imagePath + '</span>';
                });
            }
            return renderItem;
        }

		return renderItem;
	}

	function renderDescriptionBox(postDescription, readMore, truncate, tripDetails, feedType, post) {
        renderItem = '';
        if (postDescription && feedType != 'Find Buddy') {
            renderItem = '<div class="feed__body-description">' + tripDetails + '<pre class="' + truncate + '">' + postDescription + '</pre>' + readMore + '</div>';
        }
        else if (feedType == 'Find Buddy') {
            descriptionFindBud = '';
            if (post.bookFromTbd != undefined && post.travelerType != undefined && post.budget != undefined && post.dateType != undefined) {
                travelWith = post.travelWithGender == undefined ? post.gender : post.travelWithGender;
                userName = "<strong>" + post.name + "</strong>";
                travelType = "<strong>" + post.travelerType.charAt(0).toUpperCase() + post.travelerType.slice(1) + "</strong>";
                travelTypeText = (post.travelerType.toLowerCase() == 'solo') ? `I am a ${travelType} traveler`
                    : `I am travelling with ${travelType}`;
               // Create a regular expression to match the string "<strong>profile.name</strong> says:" followed by any characters until the next newline
               userSays = '';
               if (post.postDescription.includes(`<strong>`)) {
                    userSaysRegex = new RegExp(`<strong>${profile.name}</strong> says: [^\\n]*`, 'g');
                    // Use the regular expression to find matches in post.postDescription
                    userSays = post.postDescription.match(userSaysRegex);
                    console.log(userSays);
                    userSays = (userSays != '' && userSays != null) ? `\n\n<strong>${post.name}</strong> says: ${post.postDescription}` : '';
                }
                else if (post.postDescription.length > 0) {
                    userSays = `\n\n<strong>${post.name}</strong> says: ${post.postDescription}`;
                }
                prefPartner = travelWith.charAt(0).toUpperCase() + travelWith.slice(1) == 'Neutral' ? 'Couple' : travelWith.charAt(0).toUpperCase() + travelWith.slice(1);
                postTemplate = "<strong>" + post.name + "</strong>" + " is looking for Buddies in " + "<strong>" + post.location.charAt(0).toUpperCase() + post.location.slice(1) + "</strong>" + ". " +  travelTypeText + "  and is looking for " + "<strong>" + prefPartner + "</strong>" + " partner to travel with. The Budget type will be " + "<strong>" + post.budget.charAt(0).toUpperCase() + post.budget.slice(1) + "</strong>" + ". My travel dates are " + "<strong>" + post.dateType.charAt(0).toUpperCase() + post.dateType.slice(1) + "</strong>" + "." + userSays + "\n\n '<strong>Join Group Chat</strong>' if you want to learn more about the trip and join in on the fun!\n \n";
                if (post.mediaList.length > 0) {
                    descriptionFindBud = 'findBud';
                }
                renderItem = '<div class="feed__body-description ' + descriptionFindBud + '"><pre class="' + truncate + '">' + postTemplate + '</pre>' + readMore + '</div>';
            }
            else {
                renderItem = '<div class="feed__body-description ' + descriptionFindBud + '">' + tripDetails + '<pre class="' + truncate + '">' + postDescription + '</pre>' + readMore + '</div>';
            }
        }
        return renderItem;
    }

	function renderPostLocation(location, feedType) {
		renderItem = '';

		if (feedType !== 'Find Buddy') {
			renderItem = 'is at<span class="feed___head-name-location">' + location + '</span>';
		}

		return renderItem;
	}

	function renderTripDetails(location, dateOfTravel, feedType, travelTime) {
		renderItem = '';
		renderDate = '';
		if (feedType == 'Find Buddy') {
			renderDestination = '<div class="feed__body-trip_location"><i class="fas fa-map-marker-alt"></i>Travelling to -<span>' + location + '</span></div>';

			if (dateOfTravel) {
				dateOfTravel = formatDate2(dateOfTravel);
				renderDate = '<div class="feed__body-trip_date old"><i class="fas fa-calendar-alt"></i>Travelling On -<span>' + dateOfTravel + '</span></div>';
			}
			else if (travelTime) {
				travelTime = formatDate2(travelTime);
				renderDate = '<div class="feed__body-trip_date old"><i class="fas fa-calendar-alt"></i>Travelling On -<span>' + travelTime + '</span></div>';

			}
			var dateNew = dateOfTravel ? dateOfTravel : travelTime;
			renderItem = '<div class="feed__body-trip_details hidden">' + renderDestination + renderDate + '</div> <div class="feed__body-trip_details-new">'+  location +' on  ' + dateNew + '</div>';
		}

		return renderItem;
	}

	//Check if the post is interested or not and render the interested icon accordingly
    function renderInterestedCommentsLine(likes, comments, feedType, userName, post) {
        renderItem = '';
        renderInterest = '';
        renderComment = '';
        if (feedType == 'Find Buddy') {
            if (likes > 0) {
                renderInterest = '<div class="feed__body-interests"><span class="feed__body-interested_count">' + likes + '</span></div>';
            }else if (likes == 0) {
                renderInterest = '<div class="feed__body-interests" style="display: none;"><span class="feed__body-interested_count">' + likes + '</span></div>';
            }
            if (comments > 0) {
                if (Number(comments) > 1) {
                    commentText = '';
                } else {
                    commentText = '';
                }
                renderComment = '<div class="feed-comment"><p><span>' + comments + '</span> '+ commentText + '</p></div>';
            }
            createGroupFind = '';
            if (!post.isOwnPost) {
                titleText = '';
                if (post.groupId == undefined || post.groupId == null || post.groupId == '') {
                    // We dont need to show the create group button
                    titleText = 'Join Group';
                    groupId = '';
                }
                else {
					groupId = post.groupId;
					titleText = 'Join Group';
                }
                createGroupFind = '<div class="feed__actions createGroup" data-group-id = "' + groupId + '"<a class="feed__body-interested createGroupFind">' + icons.createGroupFind + titleText +'</a></div>';
            }
            
            if (Number(comments) > 0) {
                comments = comments;
            }
            else {
                comments = '';
            }
            
            actionsHtml = '<div class="feed__body-actions">' + postLiked +'<div class="feed__body-interests">' + renderInterest + '</div><div class="feed-comment">' + icons.comment + '<div class="feed-comment-text"><p>' + comments + '</p></div></div><div class="feed__share">' + icons.send + '</div>'+ createGroupFind + '</div>';
            renderItem = '<div class="feed__body-interested_box">' + actionsHtml +'<div class="feed__actions"><ul>' + bookmark + '</ul></div><div class="feed__body-related chatNow" id="findBuddyChat">' + icons.chat +' <div class="chatUser"></div></div></div> ';
        }
        return renderItem;
    }

	function renderFeedType(feedType) {
		response = '';
		feedType = feedType.toString();

		if (feedType == '0') {
			response = 'Story';
		}
		else if (feedType == '1') {
			response = 'Find Buddy';
		}
		else if (feedType == 2) {
			response = 'Ask';
		}

		return response;
	}

	//Check if the post has a description and render the read more button accordingly
	function renderReadMore(description, postSource, userName, feedType, isNewFindPost) {
		renderItem = '';

		// if (description || feedType == 'Find Buddy') {
		// 	if (description.length > 150 && postSource == 'Feed' && feedType ==  'Story') {
		// 		renderItem = '<a class="feed__body-readmore">Read More..</a>';
		// 	}
        //     else if ((description.length > 150 &&  feedType == 'Find Buddy') || (isNewFindPost == '1' || isNewFindPost == '0' && postSource == 'Feed')) {
        //         renderItem = '<a class="feed__body-readmore">' + userName.split(' ')[0] +' Says...  </a>';
        //     }
		// }

		return renderItem;
	}

	//Truncate the post description if it is too long
	function renderTruncate(postSource) {
		response = '';
		if (postSource == 'Feed') {
			response = 'truncate';
		}

		return response;
	}

	//Check if the post is bookmarked or not and render the bookmark icon accordingly
	function renderBookmark(bookmarked) {
		renderItem = '';

		if (bookmarked) {
			icon = icons.bookmark_active;
			renderItem = '<li><a class="feed__actions-bookmark active" data-bookmarked="bookmarked">' + icon + '</a></li>';
		}
		else {
			icon = icons.bookmark;
			renderItem = '<li><a class="feed__actions-bookmark" data-bookmarked="">' + icon + '</a></li>';
		}

		return renderItem;
	}

	

	//Process the comments and render them
	function renderComments(comments, feedType) {
		renderItem = '';

		if (feedType !== 'Find Buddy') {
            if (Number(comments) > 1) {
                commentText = 'all comments';
            }
            else {
                commentText = 'comment';
            }
            if (comments > 0) {
                renderItem = '<div class="feed-comment"><p>View </span> ' + commentText + '</p></div>';
            }
        }

		return renderItem;
	}

	//Process the user name, make the first letter caps and render it
	function renderUserName(name) {
		var name = name;
		var nameArray = name.split(' ');

		nameArray.forEach((item, index) => {
			nameArray[index] = item.charAt(0).toUpperCase() + item.slice(1);
		});

		name = nameArray.join(' ');

		return name;
	}

	function renderFindBuddyInstructions() {
		renderItem =
			'<h5>Instructions for Find Influencers</h5><p>Find Local Travel Influencer with Travel Buddy 🍀</p><p>Our Local Influencers from all over India are connecting travelers to the culture of the place! Overall, connecting with the local community can enhance the travel experience for tourists while also benefiting the local economy and promoting sustainable tourism practices.</p><p>Connect with Local Travel Influencer with these simple steps:</p><ul><li>🌿 Click on Add Post</li><li>🌿 Choose Find Option</li><li>🌿 Select Influencers + Place</li><li>🌿 You will find all the influencers from your destination.</li><li>🌿 Ask relevant & specific questions about the destinations (example: What are the must-see attractions in [destination]? Or Any less explored location to see? What is the weather like in [destination]?</li></ul><p>Please be mindful of the questions which you are asking the influencers. They are avid travelers and volunteered to help the community so lets respect their time & energy!</p><p>#travelbuddy #beatravelbuddy #travelinfleuncers #localtravelinfleuncer #localsepoocho #vocalforlocal</p>';

		return renderItem;
	}

	function renderOptionsMenu(postId, icons, post) {
		selfPostOptions = renderSelfPostOptions(post, icons);
		followOptions = renderFollowOptions(post, icons);
        
        pinUnpinText = post.isPin == true ?  'Unpin Post' : 'Pin Post';
		
		chatOption = post.isOwnPost ? '' : '<li data-type="chat">Chat<span class="options__menu-icon">' + icons.chat + '</span></li>';
        adminOption = manageUserProfile('read', 'role') === 'admin' ? '<li data-type="delete">Delete Post<span class="options__menu-icon">' + icons.delete + '</span></li><li data-type="pinUnpinPost" data-tab= "'+ post.feedType.toString() + '"data-ispinned="'+ post.isPin + '">' + pinUnpinText + '<span class="options__menu-icon">' + icons.lightning + '</span></li><li data-type="blockUserByAdmin">Block by Admin<span class="options__menu-icon">' + icons.close + '</span></li>' : ''; 
        
        userOs = detectOperatingSystem();
        sharePost = '';
        if (userOs != '1' && userOs != '0') {
            sharePost = '<li data-type="share">Share<span class="options__menu-icon">' + icons.send + '</span></li>';
        }

		renderItem = '<div class="options__menu hidden" data-id="' + postId + '" data-type="post"><div class="options__menu-mask"></div><div class="options__menu-box"><ul>'+ chatOption + adminOption  + sharePost + '<li data-type="report">Report Post<span class="options__menu-icon">' + icons.report + '</span></li>' + selfPostOptions + '</ul></div></div>';

		return renderItem;

		function renderFollowOptions(post, icons) {
			renderItem = '';

			if (!post.isOwnPost) {
				if (!post.isFollowed) {
					renderItem = '<li data-type="follow">Follow<span class="options__menu-icon">' + icons.follow + '</span></li>';
				}
				else if (post.isFollowed) {
					renderItem = '<li data-type="follow">Un-Follow<span class="options__menu-icon">' + icons.following + '</span></li>';
				}
			}

			return renderItem;
		}

		function renderSelfPostOptions(post, icons) {
			renderItem = '';
			console.log(post.isOwnPost);

			if (post.isOwnPost) {
				renderItem = '<li class="edit hidden" data-type="edit">Edit Post<span class="options__menu-icon">' + icons.edit + '</span></li><li data-type="delete">Delete Post<span class="options__menu-icon">' + icons.delete + '</span></li>';
			}

			return renderItem;
		}
	}
}

//Process the media and render it in the form of a carousel with swiper
function renderMedia(media, postId) {
	renderItem = '';
	multiMediaItems = false;
	multiMediaItems = media.length > 1 ? true : false;

	media.forEach((item) => {
		if (item.mediaType == 'image') {
			item.imageWidth = jQuery('.feed__body-images').width();
			item.imageWidth = (item.imageWidth == undefined) ? 420 : item.imageWidth;
			aspectRatio = Number(item.imageWidth) / Number(item.imageHeight);
			item.imageHeight = (item.imageHeight != 0 && item.imageHeight > (item.imageWidth / aspectRatio)) ? item.imageWidth : item.imageHeight;

			renderItem += '<div class="swiper-slide" data-type="image" media-id=' + item.mediaId + '><div class="image-placeholder-feeds"></div><img height="' + item.imageHeight + '" width="' + item.imageWidth + '" data-height="' + item.imageHeight + '" data-width="' + item.imageWidth + '" data-type="image" data-original="' + item.mediaUrl + '" src="' + renderPostMedia(item.mediaUrl, 'image') + '" <img src="image.jpg" alt="Image" onerror="handleImageError(this, \'renderPost\', multiMediaItems)" data-error-count="1" onload="imageLoaded(this)"></div >';
		}
		else if (item.mediaType == 'video') {
			muted = videoMuted();
			playPauseButton = playPause();
			videoWidth = jQuery('#app').width();
			videoHeight = jQuery('#app').height();
			if (item.imageHeight > 0 && item.imageHeight > 0) {
				videoHeight = Number(videoWidth * (Number(item.imageHeight) / Number(item.imageWidth))).toFixed(0);
			}
			if (isDesktop()) {
				videoHeight = (videoHeight > 585) ? 585 : videoHeight;
			}

			//Video Element along with a overlay to play the video and a mute button and a play pause button
			renderItem += '<div class="swiper-slide video-slide" data-type="video" media-id=' + item.mediaId + '><video autobuffer height="' + videoHeight + '" width="' + videoWidth + '" class="feed__body-video" id="video-' + postId + '" playsinline loop ' + muted + ' poster="' + renderUserProfileImage(item.urlImageThumbnail) + '"><source src="' + renderPostMedia(item.mediaUrl, 'video') + '" type="video/mp4"></video><div class="feed__body-video-overlay"></div><div class="feed__body-video-overlay-play"><i class="fas fa-play"></i></div><div class="feed__body-video-overlay-mute"><i class="fas ' + playPauseButton + '"></i></div></div>';
		}
	});

	return renderItem;

	function playPause() {
		response = '';

		if (localStorage.getItem('videoMuted') == 'true') {
			response = 'fa-volume-mute';
		}
		else {
			response = 'fa-volume-up';
		}

		return response;
	}

	function videoMuted() {
		response = localStorage.getItem('videoMuted');

		if (response && response == 'true') {
			response = 'muted';
		}
		else {
			response = '';
		}

		return response;
	}
}

//Enable the swiper
function enableSwiper(media, postId) {
	if (media.length > 1) {
		swiper('feed', '.feed__body-images-' + postId);
	}
}

function renderEditPost(post, from) {
	// Get the active tab
	activeTab = jQuery('#main__tabs .tab__item.active').data('tab');
   
	post = post.object;
	
	updateCardContent = (post) => {
		card = jQuery(`#${activeTab} .feed_item[data-id="${post.postId}"]`);
		description = post.postDescription.slice(0, 150);
		readMoreText = post.feedType == '1' ? `${post.name.split(' ')[0]} Says...` : 'Read More..';
   
		card.find('.feed__body-description .truncate').html(description);
		card.find('.feed__body-description .feed__body-readmore').remove();
		card.find('.feed___head-name-location').text(post.location);
		if (post.postDescription.length > 150) {
			card.find('.feed__body-description').append(`<a class="feed__body-readmore">${readMoreText}</a>`);
		}
   
		// Handle the mediaList for images and videos
		card.find('.feed__body-images').html(`<div class="swiper-wrapper">${renderMedia(post.mediaList, post.postId)}</div><div class="swiper-pagination"></div>`);
	   
		enableSwiper(post.mediaList, post.postId);
	   
		if (post.feedType == '1') {
			card.find('.feed__body-trip_location span').text(post.location);
			card.find('.feed__body-trip_date span').text(formatDate2(post.travelTime));
		}
	};
	// Example usage
	updateCardContent(post);
} 

function handleImageError(img, from, multiMediaItems) {
	if (img.src == 'https://d1hphxyq85xv5h.cloudfront.net/' || img.src == 'https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/1000x1000/'){
		img.src = '/view/assets/img/experiences__bg.webp';
		return img.src;
	}
	errorCount = parseInt(img.getAttribute('data-error-count'));
	if (errorCount < 2) {
			if (img.src.startsWith('https://res') || img.src.startsWith('https://d2w')) {
				img.src = getD2ServerImageUrl(img);
			}
		img.setAttribute('data-error-count', errorCount + 1);
		return img.src;
	} 
	else {
		img.onerror = null;
		if (from == 'renderPost') {
			if (multiMediaItems == true) {
				jQuery(img).parents('.swiper-slide').remove();
			}
			else {
	            jQuery(img).parents('.feed_item.feed_item-story').remove();
			}
			
			console.log('Removing post from feed, due to broken image.', jQuery(img).parents('.feed_item.feed_item-story').attr('data-id'));
		}
		else {
            // We will be removing the image from the Profile section for now
            jQuery(img).parent().remove();
			// jQuery(img).parent().addClass('no__show').append('<div class="no__show-text">Switch to iOS or MacOS for the Best experience</div>');
			// img.src = '/view/assets/img/mini_experiences-bg.png';
			// return img.src;
		}
	}
}

function getD2ServerImageUrl(imgElement) {
	failedSrc = imgElement.src;
	d2ServerUrl = videoBaseUrl + '/' + failedSrc.substr(failedSrc.indexOf('uploads'));
	return d2ServerUrl;
}

function renderFollowButton(data, element) {

	renderFollowIconFeeds(data, element);
	element = element.button;
	if (element.parentNode.className == 'shots__user' && data.responseCode == 200) {
		toast('Followed');
		console.log(element);
		var spanText = jQuery(element).find('.shots__follow-text').text('Followed');
		var parentClass = jQuery(element).parent().attr('class');
		jQuery(`.${parentClass}`).addClass('followed');
		console.log(spanText);
	}
	else if (element.parentNode.className == 'shots__user followed' && data.responseCode == 200) {
		toast('Un-Followed');
		var spanText = jQuery(element).find('.shots__follow-text').text('Follow');
		var parentClass = jQuery(element).parent().attr('class').split(' ');
		console.log(parentClass[0]);
		jQuery(`.${parentClass[0]}`).removeClass('followed');

	}
	else {
		jQuery(element).removeClass('disabled-link');

		//This one is for the search page
		if (jQuery(element).hasClass('search__item-follow')) {
			if (jQuery(element).hasClass('not-following')) {
				jQuery(element).html(icons.tick + 'Following');
				jQuery(element).removeClass('not-following');
				jQuery(element).addClass('following');
			}
			else {
				jQuery(element).html(icons.plus + 'Follow');
				jQuery(element).addClass('not-following');
				jQuery(element).removeClass('following');
			}
		}
		else {
			//This one is for liked users
			if (jQuery(element).attr('data-following') == 'true') {
				jQuery(element).html(icons.follow);
				jQuery(element).attr('data-following', 'false');
			}
			else {
				jQuery(element).html(icons.following);
				jQuery(element).attr('data-following', 'true');
			}
		}
	}
}

function renderFollowIconFeeds(data, element) {

	if (data.responseCode == 200) {
		var dataTabs = jQuery('#main__tabs .tab__item').map(function () {
			return jQuery(this).data('tab');
		}).get();

		dataTabs.forEach(function (tab) {
			checkIfEmpty('#' + tab);
		});

		// For secondary tabs ( View Similar )
        jQuery('#secondary .drawerBody .feed__box .feed_item').each(function () {
            if (jQuery(this).attr('data-uniqueid') == element.uniqueUserId) {
                // Toggle visibility of the .feed__head-follow element in the current div
                jQuery(this).find('.feed__head-follow').toggle();
            }
        });

	}

	function checkIfEmpty(selector) {
		if (jQuery(selector).is(':empty')) {
		}
		else {
			// For each loop to get the child divs
			jQuery(selector + ' .feed_item').each(function () {
				if (jQuery(this).attr('data-uniqueid') == element.uniqueUserId) {
                    // Toggle visibility of the .feed__head-follow element in the current div
                    jQuery(this).find('.feed__head-follow').toggle();
                }
			});
		}
	}
}


function renderProfile(state, profile, where) {
	if (state == 'init') {
		if (where == 'encrpyted') {
			var userProfile = getLocalStorage('userProfile');
			try 
			{
				JSON.parse(userProfile);
				console.log('userProfile is not encrypted');
				profile = JSON.parse(getLocalStorage('userProfile'));
			} 
			catch (error) {
				console.log('userProfile is encrypted');
				var bytes  = CryptoJS.AES.decrypt(getLocalStorage('userProfile'), 'TravelBuddy');
				var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
				//console.log('Decrypted data:', decryptedData);
				
				try {
					profile = JSON.parse(decryptedData);
				} 
				catch (error) {
					console.error('Error parsing JSON:', error);
				}
			}
		}
		//checkOnboarding(profile);
		
		footerProfileImage(profile.imageUrl);
		
		if (!jQuery('#main__profile-box').length > 0) {
			jQuery('#main').append('<div id="main__profile-box"><div class="main_item"></div><div class="secondary_item"></div></div>');
		}
		renderProfile('render', profile, '#main__profile-box .main_item');
	}
	else if (state == 'render') {
		try {
			if (where == '#main__profile-box .main_item') {
				selfProfile = true;
			}
			else {
				profile = profile.object;
				selfProfile = false;
			}
			console.log(profile);
			var adminDetails = '';
			if (manageUserProfile('read', 'role') == 'admin') {
				adminDetails = `<div class="admin__details">
					<button class="admin__copy-userid-btn" data-userid="${profile.userId}">Copy User ID</button>
				</div>`;
			}

			follows = renderFollowers(profile.followerCount, profile.followingCount);
			ratings = renderRatings(profile.ratingCount, profile.rating, icons, profile);
			profileModal = renderProfileModal(profile.originalImageUrl, profile.imageUrl, profile);
			about = renderAbout(profile.about);
			coverPhotos = renderCoverPhotos(profile.coverPhotos);
			chatnViews = renderChatnViews(selfProfile, profile.viewCount);
			completeProfile = renderCompleteProfileBox(profile.completeness, selfProfile);
			optionsMenu = renderOptionsMenu(profile.userId, icons, profile.roleType == 7);
			profileHead = renderProfileHead(profile, selfProfile, optionsMenu);
			verified = renderVerified(profile.isVerified, icons);
			profile.city = profile.city ? profile.city : profile.location;
			profile.city = profile.city ? profile.city : '';
			profileCoverClass = "profile-cover-" + removeAllSpecialChar(profile.name).toLowerCase();
			findPostCount = profile.findPostCount;
			sharePostCount = profile.posts.length;
			editDp = renderEditDp(selfProfile);
			isInfluencer = profile.roleType == 7;

			imagePath = getProfileImage(renderUserProfileImage(profile.imageUrl), profile.name, editDp, profileModal, isInfluencer);

			noSocialLinks = 0;
			profile.socialLinks.forEach(item =>{
				if(item.socialLink != ''){
					noSocialLinks = noSocialLinks + 1;
				}
			});

			jQuery(where).addClass('profile__display');
			//Render the profile
			jQuery(where).html(`
				<div class="profile__page" 
					 data-userName="${profile.name}" 
					 data-uniqueid="${profile.uniqueUserId}" 
					 data-profileImage="${profile.imageUrl}" 
					 data-selfProfile="${selfProfile}" 
					 data-user="${profile.userId}" 
					 data-isinfluencer="${isInfluencer}">
					${profileHead}
					<div class="profile__cover ${profileCoverClass}">
						<div class="swiper-wrapper">${coverPhotos}</div>
						<div class="swiper-pagination swiper-pagination-bullets swiper-pagination-horizontal">
							<span class="swiper-pagination-bullet swiper-pagination-bullet-active" aria-current="true"></span>
							<span class="swiper-pagination-bullet"></span>
						</div>
					</div>
					<div class="profileCover__zoomIn">
						<div class="profileCover__zoomIn-overlay"></div>
						<div class="profileCover__zoomIn-img"></div>
					</div>
					<div class="profile__title">
						<div class="profile__title-first">
							<div class="profile__photo">${imagePath}</div>
						</div>
						<div class="profile__title-second">
							<div class="profile__name">${profile.name}${verified}</div>
							<div class="profile__location">Hometown - ${profile.city ? profile.city : ''}</div>
							${follows}
						</div>
						<div class="profile__title-third">${chatnViews}</div>
					</div>
					${adminDetails}
					${ratings}
					${completeProfile}
					${about}
					<div class="profile__activities">
						<div class="profile__activity profile__interests">
							<div class="profile__activity-icon">${icons.smiley}</div>
							<div class="profile__activity-text">
								<span>${getUniqueInterests(profile.userInterests).length}</span>
								<span>Interests</span>
							</div>
						</div>
						<div class="profile__activity profile__trips">
							<div class="profile__activity-icon">${icons.location}</div>
							<div class="profile__activity-text">
								<span>${getUniquePlaces(profile.places).length}</span>
								<span>Places Visited</span>
							</div>
						</div>
						<div class="profile__activity profile__social">
							<div class="profile__activity-icon">${icons.link}</div>
							<div class="profile__activity-text">
								<span>${noSocialLinks}</span>
								<span>Social Links</span>
							</div>
						</div>
					</div>
					<div class="profile__posts">
						<div class="profile__posts-tab__head">
							<ul>
								<li class="active" data-tab="find">Finds<span class="profile__posts-count">${findPostCount}</span></li>
								<li class="" data-tab="share">Shares<span class="profile__posts-count">${sharePostCount}</span></li>
								<li class="hidden" data-tab="ask">Asks<span class="profile__posts-count">${profile.askPostCount}</span></li>
								<li data-tab="service">Services<span class="profile__posts-count">${profile.listing.length}</span></li>
							</ul>
						</div>
						<div class="profile__posts-tabs">
							<div class="profile__posts-tab-item profile__tab-share " data-loaded="false"></div>
							<div class="profile__posts-tab-item profile__tab-find active" data-loaded="true"></div>
							<div class="profile__posts-tab-item profile__tab-ask" data-loaded="false"></div>
							<div class="profile__posts-tab-item profile__tab-service" data-loaded="false"></div>
						</div>
					</div>
				</div>
			`);
			
			// Add event handler for copy user ID button using event delegation
			jQuery(where).on('click', '.admin__copy-userid-btn', function() {
				var userId = jQuery(this).attr('data-userid');
				if (userId) {
					window.focus();
					navigator.clipboard.writeText(userId);
					toast('User ID Copied');
				}
			});
			
			jQuery('#secondary .secondary__tab:last-child .drawerHeader').hide();
			renderSharePosts(profile.posts, selfProfile);
			renderFindPosts(profile.findBuddyPosts, selfProfile);
			renderAskPosts(profile.askPosts, selfProfile);

			// jQuery('#secondary .secondary__tab:last-child .drawerHeader').hide();
			// renderSharePosts(profile.posts, selfProfile);
			// renderFindPosts(profile.findBuddyPosts, selfProfile);
			// renderAskPosts(profile.askPosts, selfProfile);
			renderServicePosts(profile, selfProfile);
			swiper('profile', '.' + profileCoverClass);
			loaderMain('secondary', false);
			profileScrollCheck();

			if (!selfProfile) {
				renderProfileInterests('preload', '', profile);
			}
		}
		catch (error) {
			console.log(error);
			redirect(404);
		}
	}
	else if (state == 'cc') {
		renderCountries(profile.object, '#editProfile__countryCode');
	}
	else if (state == 'isPhoneNumberUnique') {
		if (profile.responseCode == 200) {
			if (profile.phoneNumberInUse) {
				loaderMain('otp', false);
				toast('Phone number is already registered with different account. Please try with different number', 5000);
			}
			else {
				firebaseOTP('sendSMS', {
					phoneNumber: jQuery('#onboarding__phone').val(),
					dialCode: jQuery('#onboarding__countryCode').val(),
				});
			}
		}
		else {
			toast(profile.errorMessage);
		}
	}
	else if (state == 'editProfileOtp') {
		console.log(profile);
		//if (profile.responseCode == 200) {
			jQuery('.edit__row-phone').after('<input type="number" name="editProfile__otp" placeholder="123456" id="edit__otp">');
			jQuery('#editProfile .editVerifyPhone').addClass('verifyOtp').removeClass('verify');
			toast('OTP Sent');
		// }
		// else {
		// 	toast(profile.errorMessage);
		// }
	}
	else if (state == 'editProfileNumberVerified') {
		if (profile.responseCode == 200) {
			console.log('EditOtp');
			jQuery('#editProfile .editVerifyPhone').text('Verified');
			jQuery('#editProfile .editVerifyPhone').addClass('verified').removeClass('verifyOtp');
			jQuery('#edit__otp').hide();
			toast('Number Verified');
		}
		else {
			toast(profile.errorMessage);
		}
	}
	else if (state == 'editProfile') {
		selfProfile = true;
		if (where != 'editProfileCover') {
			profile = manageUserProfile('read', 'all');
		}
		else {
			profile = profile;
		}

		console.log(profile);
		profileModal = renderProfileModal(profile.originalImageUrl);
		coverPhotos = renderCoverPhotos(profile.coverPhotos, 'editProfile');
		profileCoverClass = 'profile-cover-' + removeAllSpecialChar(profile.name).toLowerCase();
		profileHead = rendereditProfileHead(profile, selfProfile, optionsMenu);
		about = (profile.about == 'null' || profile.about == null) ? '' : profile.about;
		//console.log(optionsMenu);

		var male = '', female = '', nonBinary = '';
		if (profile.gender == 0 || profile.gender == null) {
			male = 'checked';
		}
		else if (profile.gender == 1) {
			female = 'checked';
		}
		else if (profile.gender == 2) {
			nonBinary = 'checked';
		}

		trips = renderTrips(profile);
		interests = renderInterests(profile);
		socialLinks = renderSocialLinks(profile);

		//Get the date in format of YYYY-MM-DD for 13yrs ago
		var date13 = new Date();
		date13.setFullYear(date13.getFullYear() - 13);
		date13 = date13.toISOString().split('T')[0];

		noSocialLinks = 0;
		profile.socialLinks.forEach(item =>{
			if(item.socialLink != ''){
				noSocialLinks = noSocialLinks + 1;
			}
		});
		
		var phoneAuthState = manageUserProfile('read', 'phoneNumber') ? 'verified' : 'verify';

		//Render the  Edit profile
		jQuery('#secondary .drawerBody').append('<form id="editProfile"><div class="editProfile__page" data-selfProfile="' + selfProfile + '" data-user="' + profile.userId + '">' + profileHead + '<div class="profile__cover ' + profileCoverClass + '"><div class="edit__cover-buttons"><div class="profile__head-add-cover"><input type="file" name="onboarding__dp" id="edit__cover" accept="image/*" onchange="profileCoverShow(this);" multiple="multiple"><label for="edit__cover">' + icons.plus + ' Add Cover Photo</label></div><div class="profile__head-delete-cover">' + icons.delete + 'Delete Photo</div></div><div class="swiper-wrapper">' + coverPhotos + '</div><div class="swiper-pagination swiper-pagination-bullets swiper-pagination-horizontal"><span class="swiper-pagination-bullet swiper-pagination-bullet-active" aria-current="true"></span><span class="swiper-pagination-bullet"></span></div></div><div class="editProfile__title"><div class="editProfile__title-first"><div class="editProfile__photo"><img src="' + renderUserProfileImage(profile.imageUrl) + '" alt="' + profile.name + '"><div class="edit__profile-pic-box__upload"><input type="file" name="onboarding__dp" id="edit__dp" accept="image/*" onChange="profileImageShow(this);"><label for="edit__dp">' + icons.edit_profile + '</label></div>' + profileModal + '</div></div><div class="editProfile__title-second"><div class="editForm__row"><div class="editForm__column"><div class="editHanging__name"><input type="text" name="editProfile__name" placeholder="Name" id="edit__name" value ="' + profile.name + '"><span>Name</span></div></div></div><div class="editForm__row"><div class="editForm__column"><div class="editHanging__name"><input type="text" name="editProfile__location" id="edit__location" value = "' + profile.location + '"><span>Location</span></div></div></div></div></div><b class="tell__us">Tell us about yourself</b><div class="edit__row"><div class="edit__column"><div class="editHanging__about"><textarea class="autosize editProfile__textarea-about" name="edit__about" id="editProfile__about" placeholder="Tell us about yourself" cols="30" rows="5" maxlength="1800" resize="none" style="height:100px" spellcheck="false">' + about + '</textarea><span>About</span></div></div></div><div class="editProfile__title-second"><div class="edit__row edit__row-phoneNumber"><div class="edit__column"><div class="editHanging__name edit__row-phone"><select name="editProfile__countryCode" id="editProfile__countryCode"><option value="' + profile.dialCode + '">' + profile.dialCode + '</option></select><span>Phone</span><input type="number" name="editProfile__phone" placeholder="Phone Number" id="edit__phone" value="' + profile.phoneNumber + '"></div><span class="editVerifyPhone ' + phoneAuthState + '">' + phoneAuthState + '</span></div></div><div class="edit__row"><div class="edit__column"><div class="editHanging__name"><input type="text" readonly name="editProfile__email" id="edit__email" value="' + profile.email + '"><span>Email</span></div></div></div></div><div class="editProfile__title-second"><div class="edit__row"><div class="edit__column"><div class="editHanging__name"><input type="date" name="editProfile__dob" placeholder="Name" id="edit__dob" value="' + profile.dateOfBirth + '" max="' + date13 + '"><span>DOB</span></div></div></div></div><div class="form__row"><div class="form__column"><label id="edit__gender">Select Gender</label><div class="editGender__checkbox checkbox__gender"><div class="checkbox-item ' + male + '"><label for="onboarding__gender-male">' + icons.male + ' Male</label><input type="radio" id="onboarding__gender-male" name="onboarding__gender" value="0" ' + male + '></div><div class="checkbox-item ' + female + '"><label for="onboarding__gender-female">' + icons.female + ' Female</label><input type="radio" id="onboarding__gender-female" name="onboarding__gender" value="1" ' + female + '></div><div class="checkbox-item ' + nonBinary + '"><label for="onboarding__gender-nonBinary">' + icons.nonBinary + ' Non Binary</label><input type="radio" id="onboarding__gender-nonBinary" name="onboarding__gender" value="2" ' + nonBinary + '></div></div></div></div><div class="local_exp_mainContainer"><label>Add your Local Expertise</label><div class="local_expertise_box"><div class="local__expertise" id="local__attraction"><label for="attraction"><input type="checkbox" name="attraction-checkbox" id="attraction" onclick="changeExpertise(this)" value="2">Local Attraction</label></div><div class="local__expertise" id="historical"><label for="historical__"><input type="checkbox" name="historical-checkbox" id="historical__" onclick="changeExpertise(this)" value="3">Historical</label></div><div class="local__expertise" id="cultural__tour"><label for="cultural"><input type="checkbox" name="cultural-checkbox" id="cultural" onclick="changeExpertise(this)" value="1">Cultural Tour</label></div><div class="local__expertise" id="food__tour"><label for="tour"><input type="checkbox" name="food-checkbox" id="tour" onclick="changeExpertise(this)" value="6">Food Tour</label></div><div class="local__expertise" id="offbeat__destination"><label for="offbeat"><input type="checkbox" name="offbeat-checkbox" id="offbeat" onclick="changeExpertise(this)" value="5">Offbeat Destination</label></div><div class="local__expertise" id="art"><label for="art__"><input type="checkbox" name="art-checkbox" id="art__" onclick="changeExpertise(this)" value="8">Art</label></div><div class="local__expertise" id="shopping"><label for="shopping__"><input type="checkbox" name="shopping-checkbox" id="shopping__" onclick="changeExpertise(this)" value="9">Shopping</label></div><div class="local__expertise" id="night__life"><label for="night"><input type="checkbox" name="night_life-checkbox" id="night" onclick="changeExpertise(this)" value="7">Night Life</label></div><div class="local__expertise" id="local__lifestyle"><label for="lifestyle"><input type="checkbox" name="lifestyle-checkbox" id="lifestyle" onclick="changeExpertise(this)" value="4">Local Lifestyle</label></div></div><div class="edit_traveller-travelProvider_options_box"><div class="edit_traveller_travelProvider_description"><h4>What brings you to Travel Buddy ?</h4><p>If you are a travel service provider , you will have to select the services you provide</p></div><div class="edit_traveller_travelProvider_radioOptions"><div class="travel"><label for="isTraveller-option">' + icons.find_buddies + '<input type="radio" name="userType" id="isTraveller-option" class="hidden" value="' + parseInt('0') + '"></label></div><div class="service_provider"><label for="isTravelProvider-option">' + icons.travel_service + '<input type="radio" name="userType" id="isTravelProvider-option" class="hidden" value="' + parseInt('1') + '"></label></div></div></div><b class="please__select">Please select upto 3 services</b><div class="editProfile-service__type"><div class="hotel checkbox-item"><label for="hotel"><input type="checkbox" name="hotel" id="hotel" onclick="changeBackground(this)" value="hotel"><div class="hotel-icon">' + icons.hotel + '</div><div class="hotel-text">B&amp;B/ Hotel/ Homestay</div></label></div><div class="transport checkbox-item"><label for="transport"><input type="checkbox" name="transport" id="transport" onclick="changeBackground(this)" value="transport"><div class="transport-icon">' + icons.transport + '</div><div class="transport-text">Transport</div></label></div><div class="travel-agent checkbox-item"><label for="agent"><input type="checkbox" name="agent" id="agent" onclick="changeBackground(this)" value="agent"><div class="travel-agent-icon">' + icons.travel + '</div><div class="travel-agent-text">Travel Agent</div></label></div><div class="trek checkbox-item"><label for="guide"><input type="checkbox" name="trek" id="guide" onclick="changeBackground(this)" value="guide"><div class="trek-icon">' + icons.trek + '</div><div class="trek-text">Tour Guide/Trek</div></label></div><div class="translation checkbox-item"><label for="translator"><input type="checkbox" name="translation" id="translator" onclick="changeBackground(this)" value="translator"><div class="translation-icon">' + icons.translation + '</div><div class="translation-text">Translation</div></label></div><div class="hostel checkbox-item"><label for="hostel"><input type="checkbox" name="hostel" id="hostel" onclick="changeBackground(this)" value="hostel"><div class="hostel-icon">' + icons.hostel + '</div><div class="hostel-text">Hostel</div></label></div></div><b class ="more__about"> More about you... </b><div class="profileInterests__page"><div class="profileInterests__body"><div class="editProfileInterests__tabs"><div class="profileInterests__tab" data-tab="interests">' + icons.interests + '<span>' + getUniqueInterests(profile.userInterests).length + ' Interests</span></div><div class="profileInterests__tab" data-tab="trips">' + icons.location + '<span>' + getUniquePlaces(profile.places).length + ' Places Visited</span></div><div class="profileInterests__tab" data-tab="social">' + icons.links + '<span>' + noSocialLinks + ' Social Links</span></div></div><div class="profileInterests__tabBody"><div class="profileInterests__tab-item profileInterests__tab-item__interests"><div class="profileInterests__tab-item-head"></div > <div class="profileInterests__tab-item-body">' + interests + '</div><div class="form__checkbox-view__more">View More</div></div><div class="profileInterests__tab-item profileInterests__tab-item__trips"><div class="profileInterests__tab-item-head"></div><div class="profileInterests__tab-item-body"><div class="edit__places"><div class="editPlaces__search-box"><input type="text" placeholder="Add Visited Places" id="editPlaces"><button class="">' + icons.searchBar + '</button></div><div class="editPlaces__search-results">' + trips + '</div></div></div></div><div class="profileInterests__tab-item profileInterests__tab-item__social"><div class="profileInterests__tab-item-body">' + socialLinks + '</div></div></div></div></div></div></form><div class="deactivate_account settings_box"><div class="label_deactive_acc"><h4 id="deactivate_account_label" class="settings_labels">Deactivate Account</h4></div></div>');

		renderPlaces();

		function renderPlaces() {
			center = { lat: 50.064192, lng: -130.605469 };
			// Create a bounding box with sides ~10km away from the center point
			defaultBounds = {
				north: center.lat + 0.1,
				south: center.lat - 0.1,
				east: center.lng + 0.1,
				west: center.lng - 0.1,
			};
			input = document.getElementById("editPlaces");
			options = {
				bounds: defaultBounds,
				// componentRestrictions: { country: "in" },
				fields: ["address_components", "geometry", "icon", "name"],
				strictBounds: false
			};

			initializeAutocomplete("editPlaces");
		}

		//Check Type
		if (profile.userType === 0) {
			console.log('Traveller');
			jQuery('#secondary .travel').click();
			jQuery('#secondary #isTraveller-option').prop('checked', true);
		}
		else {
			console.log('Service Provider');
			console.log(profile.userType);
			jQuery('#secondary .service_provider').click();
			jQuery('#secondary #isTravelProvider-option').prop('checked', true);

			if (profile.services.length > 0) {
				profile.services.forEach((services) => {
					console.log(services.service);
					div = '#' + services.service;
					jQuery('#secondary ' + div + '').click();
				});
			}
		}

		//Check Gender
		if (profile.gender == 0) {
			jQuery('#secondary #onboarding__gender-male').click();
		}
		else {
			console.log('Fe-Male');
			jQuery('#secondary #onboarding__gender-female').click();
		}

		//Selecting User Expertise

		if (profile.userExpertise.length > 0) {

			profile.userExpertise.forEach((userExpertise) => {
				if (userExpertise.localEpertise) {
					console.log(userExpertise.expertiseId);
					if (userExpertise.expertiseId == 1) {
						jQuery('#secondary #cultural').click();
					}
					if (userExpertise.expertiseId == 2) {
						jQuery('#secondary #attraction').click();
					}
					if (userExpertise.expertiseId == 3) {
						jQuery('#secondary #historical__').click();
					}
					if (userExpertise.expertiseId == 4) {
						jQuery('#secondary #lifestyle').click();
					}
					if (userExpertise.expertiseId == 5) {
						jQuery('#secondary #offbeat').click();
					}
					if (userExpertise.expertiseId == 6) {
						jQuery('#secondary #tour ').click();
					}
					if (userExpertise.expertiseId == 7) {
						jQuery('#secondary #night').click();
					}
					if (userExpertise.expertiseId == 8) {
						jQuery('#secondary #art__').click();
					}
					if (userExpertise.expertiseId == 9) {
						jQuery('#secondary #shopping__').click();
					}
				}
			});

		}

		//Selecting Interests as default
		jQuery('.profileInterests__tab[data-tab="interests"]').click();
		jQuery('.profileInterests__tab[data-tab="interests"]').addClass('active');

		//Make the checkbox active which is already selected
		if (profile.userInterests.length > 0) {
            
            profileUserInterests = getUniqueInterests(profile.userInterests);
			profileUserInterests.forEach((interest) => {
				checkBoxItemInterest = jQuery('#secondary #onboarding__interest-' + interest.interest);
				if (!checkBoxItemInterest.parents('.checkbox-item').hasClass('checked')) {
					checkBoxItemInterest.click();
				}
			});
		}

		function renderInterests(profile) {
			console.log(profile);
			interestsArr = ['Adventure', 'Mountains', 'Natural Trails', 'Backpacking', 'Trekking', 'Beaches', 'Historical', 'Biking', 'Romantic', 'Cities', 'Culture', 'Food', 'Waterfalls', 'Religious', 'Meet ups', 'Home Stay', 'Offroading', 'Jungle safaris', 'Art & Crafts', 'Pub Crawling', 'Heritage Walks', 'Water Sports', 'Shopping', 'Pilgrimage', 'Events & Exhibitions', 'Diving', 'Sustainable Living', 'Cycle Tours', 'Health & Fitness', 'Winter Sports', 'Caving'];

			renderItem = '<div class="editInterest__checkbox checkbox__interests">';

			interestsArr.forEach(element => {
				checkedClass = '';
                profileUserInterests = getUniqueInterests(profile.userInterests);
				profileUserInterests.forEach((interest) => {
					if (interest.interest == element) {
						checkedClass = ' checked';
					}
				});

				renderItem += '<div class="checkbox-item' + checkedClass + '"><label for="onboarding__interest-' + element + '">' + element + '</label><input type="checkbox" id="onboarding__interest-' + element + '" name="onboarding__interest[]" value="' + element + '"></div>';
			});

			renderItem += '</div>';

			return renderItem;
		}

		function renderTrips(profile) {
			// data-lat="' + place.latitude + '"data-long="' + place.longitude + '"
			renderItem = '';
            places = getUniqueTrips(profile.places);

			places.forEach((place) => {
				renderItem += '<div class="profileInterests__interest profileInterests__trips"><div class="remove__place">' + icons.cross + '</div><input type="text" class="hidden" name="place" placeholder="India" value="' + place.place + '"> <input type="number" class="hidden" name="latitude" placeholder="15.76" value="' + place.latitude + '"> <input type="number" class="hidden" name="longitude" placeholder="20.234" value="' + place.longitude + '">' + icons.location + ' ' + place.place + '</div>';
			});

			return renderItem;
		}

		function renderSocialLinks(profile) {
			renderItem = '';

			socialLinks = profile.socialLinks;

			if (socialLinks.length == 4) {

				socialLinks.forEach((link) => {
					multiClass = '';

					if (link.socialType == 'Facebook') {
						linkIcon = icons.facebook;
					}
					else if (link.socialType == 'Instagram') {
						linkIcon = icons.instagram;
					}
					else if (link.socialType == 'twitter') {
						linkIcon = icons.twitter;
					}
					else if (link.socialType == 'Website') {
						link.socialType = 'Blog/Website';
						linkIcon = icons.website;
						multiClass = 'website';
					}

					renderItem += '<div class="profileInterests__social-link ' + multiClass + '"><label for="social"><div class="profileInterests__social-link-left">' + linkIcon + '</div><div class="profileInterests__social-link-right">' + link.socialType + '<input type="text" name="' + link.socialType + '" placeholder="www.google.com" id="' + link.socialType + '" value="' + link.socialLink + '"></div></label></div>'
				});
			}
			else if (socialLinks.length > 0) {
				for (let i = 0; i < 4; i++) {
					socialType = '';
					socialIcon = '';
					multiClass = '';
					link = '';
					placeholder = '';
					if (i == 0) {
						socialIcon = icons.website;
						socialType = 'Blog/Website';
						multiClass = 'website';
						placeholder = 'www.google.com';
						if (i < socialLinks.length) {
							link = socialLinks[0].socialLink;
						}
						else {
							link = '';
						}
						console.log(socialLinks[0].socialLink);
					}
					else if (i == 1) {
						socialIcon = icons.facebook;
						socialType = 'Facebook';
						placeholder = '@fb';
						if (i < socialLinks.length) {
							link = socialLinks[1].socialLink;
						}
						else {
							link = '';
						}
					}
					else if (i == 2) {
						socialIcon = icons.instagram;
						socialType = 'Instagram';
						placeholder = '@instagram';
						if (i < socialLinks.length) {
							link = socialLinks[2].socialLink;
						}
						else {
							link = '';
						}
					}
					else if (i == 3) {
						socialIcon = icons.twitter;
						socialType = 'twitter';
						placeholder = '@twitter';
						if (i < socialLinks.length) {
							link = socialLinks[3].socialLink;
						}
						else {
							link = '';
						}
					}

					renderItem += '<div class="profileInterests__social-link ' + multiClass + '"><label for="social"><div class="profileInterests__social-link-left">' + socialIcon + '</div><div class="profileInterests__social-link-right">' + socialType + '<input type="text" name="' + socialType + '" placeholder="' + placeholder + '"id="' + socialType + '" value="' + link + '"></div></label></div>'

				}

			}
			else {
				for (let i = 0; i < 4; i++) {
					socialType = '';
					socialIcon = '';
					multiClass = '';
					link = '';
					placeholder = '';
					if (i == 0) {
						socialIcon = icons.website;
						socialType = 'Blog/Website';
						multiClass = 'website';
						placeholder = 'www.google.com';
					}
					else if (i == 1) {
						socialIcon = icons.facebook;
						socialType = 'Facebook';
						placeholder = '@fb';
					}
					else if (i == 2) {
						socialIcon = icons.instagram;
						socialType = 'Instagram';
						placeholder = '@instagram';
					}
					else if (i == 3) {
						socialIcon = icons.twitter;
						socialType = 'twitter';
						placeholder = '@twitter';
					}

					renderItem += '<div class="profileInterests__social-link ' + multiClass + '"><label for="social"><div class="profileInterests__social-link-left">' + socialIcon + '</div><div class="profileInterests__social-link-right">' + socialType + '<input type="text" name="' + socialType + '" placeholder="' + placeholder + '"id="' + socialType + '" value="' + link + '"></div></label></div>'
				}
			}

			return renderItem;
		}

		swiper('profile', '.' + profileCoverClass);
		loaderMain('secondary', false);
		profileScrollCheck();
		loaderMain('secondary', false);
	}
	else if (state == 'follow') {
		renderFollowIconFeeds(profile, where);
		if (jQuery('#secondary').find('.profile__follow').text() == 'Follow') {
			jQuery('#secondary').find('.profile__follow').html(icons.tick + 'Following');
			toast('Followed');
		}
		else {
			jQuery('#secondary').find('.profile__follow').html(icons.plus + 'Follow');
			toast('Un-Followed');
		}
	}
	else if (state == 'renderProfileViews') {
		data = profile.object.list;
		if (!manageUserProfile('read', 'isVerified')) {
			data = isolate(data);
			// We are reversing the Data for Non verified users so that the latest data is shown at the last. This way users will be prompted to take subscription.
			data = data.reverse();
			isolateClass = 'profileViews__item--isolate';
		}
		else {
			isolateClass = '';
		}

		if (jQuery('.popup__body .profileViews__box').length == 0) {
			jQuery('.popup__body').html('<div class="profileViews__box ' + isolateClass + '"><div class="profileViews__search-box"><div class="profileViews__search" data-from="#profileViews__search"><input type="text" name="profileViews__search" id="profileViews__search" placeholder="Search Buddies"><span>' + icons.searchBar + '</span></div></div><div class="profileViews__items"></div><div class="profileViews__hide"></div><div class="profileViews__cta"><span>To see all the people who viewed your Profile</span>Go Premium ' + icons.right + '</div></div>');
		}
		else {
			jQuery('.profileViews__items').html('');
		}

		renderSearchResults(icons, data, 'searchBuddyFollowers', jQuery('.profileViews__items'));

		function isolate(data) {
			//Get the first 5 items and repeat the 5th item to then repeat 15 times
			data = data.slice(0, 5);
			data = data.concat(data[4]);
			data = data.concat(data[4]);
			data = data.concat(data[4]);
			data = data.concat(data[4]);
			data = data.concat(data[4]);
			data = data.concat(data[4]);

			return data;
		}
	}
	else if (state == 'renderFindPosts') {
	}
	else if (state == 'editProfileCover') {
		if (userProfileData == '') {
			userProfileData = manageUserProfile('read', 'all');
		}
		else {
			userProfileData.coverPhotos.reverse();
			userProfileData = userProfileData;
		}
		console.log(profile.object);

		userProfileData.coverPhotos.push('https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/800x500/' + profile.object);
		userProfileData.coverPhotos.reverse();
		jQuery('#secondary .drawerBody').html('');
		renderProfile('editProfile', userProfileData, 'editProfileCover');

		console.log(userProfileData);
	}

	function renderEditDp(isSelfProfile) {
		if (isSelfProfile) {
			renderItem = '<div class="profile-pic-box__upload"><input type="file" name="onboarding__dp" id="edit__pic" accept="image/*" onChange="profileImageChange(this);"><label for="edit__pic">' + icons.edit_profile + '</label></div>';
		}
		else {
			renderItem = '';
		}
		return renderItem;
	}

	function renderProfileHead(profile, selfProfile, optionsMenu) {
		renderItem = '';

		if (selfProfile) {
			renderItem =
				'<div class="profile__head"><div class="profile__head-left">' + icons.hamburger2 + '<div class="profile__head-name">Profile</div></div><div class="profile__head-right"><div class="profile__head-bucketList">Your Bucket List' + icons.bookmark +
				'</div><div class="profile__head-edit">' + icons.edit + '</div><div class="profile__head-chat">' + icons.share + '</div></div></div>';
		}
		else {
			guestMaster('noLogin') ? (loginButton = '<div class="profile__login">Login/Sign Up</div>') : (loginButton = '');
			console.log(profile);
			if (profile.isFollowing) {
				renderItem = '<div class="profile__head"><div class="profile__head-left"><div class="profile__head-left-back">' + icons.back + '</div><div class="profile__head-name">' + profile.name + '</div></div><div class="profile__head-right">' + loginButton + '<div class="profile__follow">' + icons.tick + 'Following</div><div class="profile__menu">' + icons.threeDots + optionsMenu + '</div></div></div>';
			}
			else {
				renderItem = '<div class="profile__head"><div class="profile__head-left"><div class="profile__head-left-back">' + icons.back + '</div><div class="profile__head-name">' + profile.name + '</div></div><div class="profile__head-right">' + loginButton + '<div class="profile__follow">' + icons.plus + 'Follow</div><div class="profile__menu">' + icons.threeDots + optionsMenu + '</div></div></div>';
			}
		}

		return renderItem;
	}
	function rendereditProfileHead(profile, selfProfile, optionsMenu) {
		renderItem = '';

		if (selfProfile) {
			//console.log(jQuery(this).parents(' #editProfile .swiper-pagination').find('.swiper-pagination-total').text());
			//console.log(jQuery('.swiper-pagination-total').text());
			renderItem = '<div class="profile__head"><div class="profile__head-left" id="editProfile__head-back">' + icons.back + '<div class="profile__head-name"> Edit Profile</div></div><div class="profile__head-right"><div class="profile__head-submit">' + icons.tick + '</div></div></div>';
		}

		return renderItem;
	}

	function renderProfileModal(image, backUpImage, profile) {
		if (!image) {
			image = backUpImage;
		}
		if(profile){
			isInfluencer = profile.roleType == 7 ;
			imagePath = getProfileImage(renderUserProfileImage(image, profile), '', '', '', isInfluencer);
		}
		else{
			imagePath = '<img src="' + renderUserProfileImage(image) + '">';
		}
		renderItem = '<div class="profile__modal"><div class="profile__modal-mask"></div><div class="profile__modal-body">'+ imagePath +'</div></div>';

		return renderItem;
	}

	function renderSharePosts(posts, selfProfile) {
		if (!selfProfile) {
			jQuery('#secondary .secondary__tab:last-child .drawerBody .profile__tab-share ul').remove();
			where = jQuery('#secondary .secondary__tab:last-child .drawerBody .profile__tab-share');
		}
		else {
			where = jQuery('#main__profile-box .profile__tab-share');
		}

		if (posts.length > 0) {
			jQuery(where).append('<ul></ul>');

			posts.forEach((post) => {
				jQuery(where).find('ul').append('<li data-item="' + post.postId + '"><img src="' + renderPostMedia(post.mediaUrl, '') + '" alt="" <img src="image.jpg" alt="Image" onerror="handleImageError(this, \'renderProfile\')" data-error-count="1"></li>');
			});
		}
		else {
			jQuery(where).append(noPostsRender(selfProfile));
		}
	}

	function renderFindPosts(posts, selfProfile) {
		if (!selfProfile) {
			where = jQuery('#secondary .secondary__tab:last-child .drawerBody .profile__tab-find');
		}
		else {
			where = jQuery('#main__profile-box .profile__tab-find');
		}

		if (posts.length > 0) {
			// Create grid container
			var gridContainer = '<div class="profile__find-grid"></div>';
			jQuery(where).append(gridContainer);
			posts.forEach((post) => {
				var  locationText = post.location || "Unknown Location";
				var  findTypeText =
					post.findType === "buddy" ? "Find Buddy" : "Meetups";

				// Get image from post media or use default placeholder
				var  postImage = post.mediaUrl ? renderPostMedia(post.mediaUrl, 'image') :
					"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop";

				var  findGridItem = `
					<div class="profile__find-grid-item" data-postId="${post.postId}">
						<div class="profile__find-image-container">
						<img class="profile__find-image" src="${postImage}" alt="${locationText}" onerror="this.onerror=null; this.src='/view/assets/img/experiences__bg.webp';" />
						<div class="profile__find-overlay">
							<div class="profile__find-location">${locationText}</div>
							<div class="profile__find-type">${findTypeText}</div>
						</div>
						</div>
					</div>`;

				jQuery(where).find(".profile__find-grid").append(findGridItem);
			});
		}
		else {
			jQuery(where).append(noPostsRender(selfProfile));
		}
        
		function renderHeaderLine(post) {
			renderItem = '';

			if (post.findType == 'buddy') {
				travelDate = (post.travelTime !== "0000-00-00") ? 'Travelling on <span>' + formatDate2(post.travelTime) + '</span>. ' : '';
				renderItem = '<div class="profile__find-card__header-location">Finding Buddies for <span>' + post.location + '</span></div><div class="profile__find-card__header-date">' + travelDate + '<span class="type">Find Buddy</span></div>';
			}
			else if (post.findType == 'meetups') {
				renderItem = '<div class="profile__find-card__header-location">Meetup in <span>' + post.location + '</span></div><div class="profile__find-card__header-date">On <span>' + formatDate2(post.travelTime) + '</span>. <span class="type">Meetups</span></div>';
			}

			return renderItem;
		}
	}

	function renderAskPosts(posts, selfProfile) {
		if (!selfProfile) {
			where = jQuery('#secondary .secondary__tab:last-child .drawerBody .profile__tab-ask');
		}
		else {
			where = jQuery('#main__profile-box .profile__tab-ask');
		}

		if (posts.length > 0) {
			posts.forEach((post) => {
				jQuery(where).append(
					'<div class="profile__ask-card" data-postId="' + post.postId + '"><div class="profile__ask-card__header"><div class="profile__ask-card__header-left">' + icons.profileAsk + '</div><div class="profile__ask-card__header-right"><div class="profile__ask-card__header-location">Travelling to <span>' + post.location +
					'</span></div><div class="profile__ask-card__header-date">Posted on <span>' + formatDate2(post.postDate) + '</span>. <span class="type">Ask</span></div></div></div><div class="profile__ask-card__body"><pre>' + processPostDescription(post.postDescription) + '</pre></div></div>'
				);
			});
		}
		else {
			jQuery(where).append(noPostsRender(selfProfile));
		}
	}

	function renderServicePosts(posts, selfProfile) {
		if (!selfProfile) {
			where = jQuery('#secondary .secondary__tab:last-child .drawerBody .profile__tab-service');
		}
		else {
			where = jQuery('#main__profile-box .profile__tab-service');
		}

		if (posts.userType == 1) {
			jQuery(".profile__posts-tab__head li[data-tab='service']").show();
			posts.listing.forEach((service) => {
				console.log(service);
				listingCostAmount = (service.listingCostAmount > 0) ? '₹' + numberWithCommas(service.listingCostAmount) : 'Request Pricing';
				jQuery(where).append(
					'<div class="main__container_services services__item" data-service-id="' + service.listingId + '"><div class="second__container_services"><div class="service_container_info_box"><div style="width:136px;height:12px;left:0;top:24px;position:absolute"><div style="width:12px;height:12px;left:0;top:0;position:absolute"><img class="service__icon" src= "' + renderPostMedia(service.serviceIconUrl, 'image') + '" ></div><div class="service__type" >' + service.serviceType + '</div></div><div class="service__name" >' + service.listingName + '</div><div class="service__provider-name" style="">' + service.listingPostedBy + '</div><div class="service__cost"><span style="color:#fde723;font-size:14px;font-family:Open Sauce Sans;font-weight:600;letter-spacing:.12px;word-wrap:break-word">₹' + listingCostAmount + '</span><span style="color:#ffffff;font-size:8px;font-family:Open Sauce Sans;font-weight:600;letter-spacing:.1px;word-wrap:break-word">/' + service.costDuration + '</span></div></div><div style="width:364px;height:148px;left:0;top:0;position:absolute"><div class="chat__with-icon" ><div class="chat__text" >Chat Now!</div><div class="chat_icon" style="width:30px;height:30px;left:80px;top:0;position:absolute;justify-content:center;align-items:center;display:inline-flex"><span id="chat">' + icons.chat_icon + '</span></div></div><div style="width:364px;height:148px;left:0;top:0;position:absolute"><img class="service__image" src= "' + renderPostMedia(service.listingMedia, 'image') + '" ><div style="width:364px;height:148px;left:0;top:0;position:absolute;background:linear-gradient(180deg,#111 0,rgba(17,17,17,0) 100%);border-radius:10px"></div></div><div class="service__location">' + service.listingCity + '</div><div style="width:34px;height:16px;left:8px;top:8px;position:absolute"><div class="service__provider-rating" >' + service.listingPostedByRating + '</div><div style="width:16px;height:16px;left:0;top:0;position:absolute;justify-content:center;align-items:center;display:inline-flex"><div class="hidden_id" style="width:16px;height:16px;position:relative;flex-direction:column;justify-content:flex-start;align-items:flex-start;display:flex"><span>' + service.listingId + '</span><div style="width:13.33px;height:13.33px;background:#ff000000">' + icons.service__rating + '</div></div></div></div></div></div></div>'
				);
			});
		}
		else {
			jQuery(".profile__posts-tab__head li[data-tab='service']").hide();
		}
	}

	function renderAbout(about) {
		renderItem = '';
		readMoreLimit = 120;
		readMore = '';

		if (about) {
			if (about.length > readMoreLimit) {
				readMore = '<span class="readMore" data-state="true">Read More</span>';
			}

			about = (about == 'null') ? 'Love to connect with like minded Travel Buddies' : about;
		}
		else {
			about = 'Love to connect with like minded Travel Buddies';
		}

		renderItem = '<div class="profile__about"><h4>About</h4><pre class="truncate">' + about + '</pre>' + readMore + '</div>';

		return renderItem;
	}

	function noPostsRender() {
		renderItem = '<div class="no-posts"><div class="no-posts__icon">' + icons.sadSmiley + '</div><div class="no-posts__text">No Posts Yet</div></div>';

		return renderItem;
	}

	//Render the Ratings
	function renderRatings(count, rating, icons, user) {
		renderItem = '';

		if (rating) {
			renderItem = '<div class="profile__ratings"><div class="profile__ratings-icon">' + generateRatingStars(rating) + '</div><div class="profile__rating" data-count="' + count + '" data-rating="' + rating + '">Rating: ' + Number(rating).toFixed(2) + ' |  Ratings: ' + count + '</div><div class="profile__rating-open">' + icons.openOut + '</div></div>';
		}
		else {
			if (user.userId != manageUserProfile('read', 'userId')) {
				renderItem = '<div class="profile__ratings no__ratings"><div class="profile__rating">Rate ' + user.name + '</div><div class="profile__rating-open">' + icons.openOut + '</div></div>';
			}
		}

		return renderItem;
	}

	//Render the followers
	function renderFollowers(followers, following) {
		renderItem = '';

		if (followers || following) {
			renderItem = '<div class="profile__follows"><div class="profile__followers" data-count="' + followers + '" data-tab="followers">' + numberWithK(followers) + '<span>Followers</span></div><div class="profile__followings" data-count="' + following + '" data-tab="following">' + numberWithK(following) + '<span>Following</span></div></div>';
		}

		return renderItem;
	}

	//Render the cover photos
	function renderCoverPhotos(photos) {
		renderItem = '';

		if (photos.length > 0) {
			photos.forEach((photo) => {
				renderItem += '<div class="swiper-slide"><img src="' + renderUserProfileImage(photo) + '" onerror="this.onerror=null; this.src=\'/view/assets/img/experiences__bg.webp\';"></div>';
			});
		}
		else {
			renderItem += '<div class="swiper-slide"><img src="/view/assets/img/experiences__bg.webp"></div>';
		}

		return renderItem;
	}

	function renderChatnViews(selfProfile, views) {
		renderItem = '';

		if (selfProfile) {
			renderItem = '<div class="profile__views">' + icons.passwordHide + '<div class="profile__views-number">' + views + '<span>Views</span></div></div>';
		}
		else {
			renderItem = '<div class="profile__chat" data-source="profile">' + icons.chat_3 + '</div>';
		}

		return renderItem;
	}

	function renderCompleteProfileBox(completeness, selfProfile) {
		renderItem = '';

		if (selfProfile && completeness < 100) {
			renderItem = '<div class="profile__completeness-box"><div class="profile__completeness-left"><h4>Complete your Profile!</h4><p>Having a complete profile helps you connect with like-minded Buddies. Share about your <b>interests, travel stories, photos, videos and more!</b></p></div><div class="profile__completeness-right"><div class="profile__completeness-progress"><div class="profile__completeness-progress__bar"><div class="profile__completeness-progress-item" style="width: ' + completeness + '%;"></div></div><div class="profile__completeness-value" data-value="' + completeness + '">' + completeness + '%</div></div><div class="profile__completeness-cta">Complete Now!</div></div></div>';
		}

		return renderItem;
	}

	function checkOnboarding(profile) {
		if (profile.completeness < 35 && !guestMaster('noLogin')) {
			if (!window.location.href.includes('experiences')) {
				if (!jQuery('.secondary__tab.onboardingBody').length > 0) {
					jQuery('#app').addClass('onboarding');
					redirect('onboarding');
				}
			}
		}
	}

	function renderOptionsMenu(id, icons, roleType) {
        
        adminOption = manageUserProfile('read', 'role') === 'admin' ? '<li data-type="givePremium">Give Premium<span class="options__menu-icon">' + icons.premium2 + '</span></li><li data-type="makeRemoveInfluencer" data-isinfluencer = "'+ roleType +'">Make Influencer<span class="options__menu-icon">' + icons.experiences2 + '</span></li><li data-type="blockUserByAdmin">Block by Admin<span class="options__menu-icon">' + icons.close + '</span></li>' : ''; 
        
        userOs = detectOperatingSystem();
        shareProfile = '';
        if (userOs != '1' && userOs != '0') {
            shareProfile = '<li data-type="share">Share Profile<span class="options__menu-icon">' + icons.send + '</span></li>';
        }
            
		renderItem = '<div class="options__menu hidden" data-id="' + id + '" data-type="profile"><div class="options__menu-mask"></div><div class="options__menu-box"><ul>' + shareProfile + '<li data-type="block">Block<span class="options__menu-icon">' + icons.close + '</span></li><li data-type="report">Report User<span class="options__menu-icon">' + icons.report + '</span></li> ' + adminOption + '</ul></div></div>';

		return renderItem;
	}
}

function renderProfileInterests(state, type, profile, where) {
	if (state == 'init') {
		if (profile == null || profile == undefined || profile == '') {
			profile = manageUserProfile('read', 'all');
		}

		if (where == null || where == undefined || where == '') {
			where = '#secondary .secondary__tab:last-child .drawerBody';
		}

		trips = renderTrips(profile);
		interests = renderInterests(profile);
		socialLinks = renderSocialLinks(profile);

		noSocialLinks = 0;
		profile.socialLinks.forEach(item =>{
			if(item.socialLink != ''){
				noSocialLinks = noSocialLinks + 1;
			}
		});

		jQuery('.profileInterests__tabBody').empty();

		jQuery(where).append('<div class="profileInterests__page" data-profile-name="' + profile.name + '"><div class="profileInterests__body"><div class="profileInterests__tabs"><div class="profileInterests__tab" data-tab="interests">' + icons.interests + '<span>' + getUniqueInterests(profile.userInterests).length + ' Interests</span></div><div class="profileInterests__tab" data-tab="trips">' + icons.location + '<span>' + getUniquePlaces(profile.places).length + ' Places Visited</span></div><div class="profileInterests__tab" data-tab="social">' + icons.links + '<span>' + noSocialLinks + ' Social Links</span></div></div><div class="profileInterests__tabBody"><div class="profileInterests__tab-item profileInterests__tab-item__interests"><div class="profileInterests__tab-item-head"><h4>' + icons.interests + ' ' + profile.name + 's Interests</h4 ></div > <div class="profileInterests__tab-item-body">' + interests + '</div></div><div class="profileInterests__tab-item profileInterests__tab-item__trips"><div class="profileInterests__tab-item-head"><h4>' + icons.location + ' Places ' + profile.name + ' has Visited</h4></div><div class="profileInterests__tab-item-body">' + trips + '</div></div><div class="profileInterests__tab-item profileInterests__tab-item__social"><div class="profileInterests__tab-item-body">' + socialLinks + '</div></div></div></div></div>');

		openType(type);
		setTimeout(() => {
			loaderMain('secondary', false);
		});
	}
	else if (state == 'preload') {
		jQuery('#secondary .secondary__tab:last-child .profile__page').append('<div class="profile__interests-segment hidden"></div>')
		renderProfileInterests('init', 'interest', profile, '.profile__interests-segment');
	}
	else if (state == 'load') {
		jQuery('.profileInterests__tabBody').empty();
		jQuery('#secondary .secondary__tab:last-child').removeClass('hidden');
		buddyName = jQuery('#secondary .secondary__tab:nth-last-child(2) .profile__interests-segment .profileInterests__page').attr('data-profile-name');
		interests__page = jQuery('#secondary .secondary__tab:nth-last-child(2) .profile__interests-segment').html();

		//Add the name to the header
		jQuery('#secondary .secondary__tab:last-child .drawerHeader .drawerTitle span').html(buddyName);

		//Add the interests to the body
		jQuery('#secondary .secondary__tab:last-child .drawerBody').append(interests__page);

		openType(type);
		setTimeout(() => {
			loaderMain('secondary', false);
		});
	}

	function renderInterests(profile) {
		renderItem = '';
		interests = getUniqueInterests(profile.userInterests);
		interests.forEach((interest) => {
			renderItem += '<div class="profileInterests__interest">' + interest.interest + '</div>';
		});

		return renderItem;
	}

	function renderTrips(profile) {
		renderItem = '';
        places = getUniquePlaces(profile.places);

		places.forEach((place) => {
			renderItem += '<div class="profileInterests__interest profileInterests__trip">' + icons.location + ' ' + place.place + '</div>';
		});

		return renderItem;
	}

	function renderSocialLinks(profile) {
		renderItem = '';
		socialLinks = profile.socialLinks;

		socialLinks.forEach((link) => {
			multiClass = '';

			if (link.socialLink == '') {
				return;
			}
			else {
				if (link.socialType == 'Facebook') {
					linkIcon = icons.facebook;
				}
				else if (link.socialType == 'Instagram') {
					linkIcon = icons.instagram;
				}
				else if (link.socialType == 'Twitter') {
					linkIcon = icons.twitter;
				}
				else if (link.socialType == 'Website' && link.socialLink !== '') {
					link.socialType = 'Blog/Website';
					linkIcon = icons.website;
					multiClass = 'website';
				}
				else {
					linkIcon = '<img src="' + renderUserProfileImage(link.socialIcon) + '">';
				}
			}


			renderItem += '<div class="profileInterests__social-link ' + multiClass + '"><a href="' + link.socialLink + '" target="_blank" nofollow><div class="profileInterests__social-link-left">' + linkIcon + '</div><div class="profileInterests__social-link-right">' + link.socialType + '<span>' + link.socialLink + '</span></div></a></div>'
		});

		return renderItem;
	}

	function openType(type) {
		if (type == 'trips') {
			jQuery('.profileInterests__tab-item__trips').addClass('active');
		}
		else if (type == 'social') {
			jQuery('.profileInterests__tab-item__social').addClass('active');
		}
		else if (type == 'interests') {
			jQuery('.profileInterests__tab-item__interests').addClass('active');
		}

		jQuery('.profileInterests__tab[data-tab="' + type + '"]').addClass('active');
	}
}

// Function to get unique interests
getUniqueInterests = (interests) => {
    uniqueInterests = [];
    interestSet = new Set();

    interests.forEach(item => {
        if (!interestSet.has(item.interest)) {
            interestSet.add(item.interest);
            uniqueInterests.push(item);
        }
    });

    return uniqueInterests;
};

// Function to get unique interests
getUniqueTrips = (trips) => {
    uniqueTrips = [];
    tripSet = new Set();

    trips.forEach(trip => {
        if (!tripSet.has(trip.place) && !tripSet.has(trip.latitude) && !tripSet.has(trip.longitude)) {
            tripSet.add(trip.place);
            tripSet.add(trip.latitude);
            tripSet.add(trip.longitude);
            uniqueTrips.push(trip);
        }
    });

    return uniqueTrips;
};

getUniquePlaces = (places) => {
    uniquePlaces = [];
    placeSet = new Set();

    places.forEach(item => {
        if (!placeSet.has(item.place)) {
            placeSet.add(item.place);
            uniquePlaces.push(item);
        }
    });

    return uniquePlaces;
};



function renderRatingsView(state, data) {

	if (state == 'init') {
		rateNowBtn = renderRateNowBtn(data.userId == manageUserProfile('read', 'userId') ? true : false);
		ratingNumber = data.overallRating ? Number(data.overallRating).toFixed(2) : 'No Ratings Yet';
		ratingsHidden = data.overallRating ? '' : 'hidden';

		jQuery('#secondary .secondary__tab:last-child .drawerHeader .drawerTitle span').html(data.userName);
		jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page').append('<div class="ratings__head"><div class="ratings__head-left"><div class="ratings__head-rating ' + ratingsHidden + '">' + generateRatingStars(data.overallRating) + '</div>Rating:<span class="ratings__head-rating-value">' + ratingNumber + '</span><div class="ratings__head-outof">Based on the opinion of<span>' + numberWithCommas(Number(data.count)) + '</span>Buddies</div></div><div class="ratings__head-right">' + rateNowBtn + '</div></div><div class="ratings__body"><div class="ratings__title"><div class="ratings__title-left">“ Buddies Say...<span class="ratings__title-outof" data-ratings="' + data.count + '">(' + numberWithCommas(Number(data.count)) + ' Reviews)</span></div><div class="ratings__sort"><div class="ratings__sort-title">Sort By: Recent ' + icons.carretDown + '</div><div class="ratings__sort-options"><div class="ratings__sort-option">Most Recent</div><div class="ratings__sort-option">Most Helpful</div></div></div></div><div class="ratings__box"></div></div>').attr('data-userId', data.userId).attr('data-userName', data.userName);
	}
	else if (state == 'render') {
		console.log(data);
		data = data.object;

		//Clean the Ratings Box in case of a refresh. Refresh happens after successful rating
		jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__box').html('');

		data.forEach((rating) => {
			jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__box').append('<div class="ratings__item" data-ratingId="' + "rating.ratingId" +
				'" data-user="' + rating.userId + '"><div class="ratings__item-title"><div class="rating__title-left"><div class="rating__title-img"><img src="' + renderUserProfileImage(rating.imageUrl) + '" alt=""></div><div class="rating__name"><div class="rating__title-name">' + rating.name + '</div><div class="rating__title-date">' + rating.ratingTime + '. Review</div></div></div><div class="ratings__item-title-right">' + icons.carretDown + '</div></div><div class="rating__stars">' + generateRatingStars(rating.rating) + Number(rating.rating).toFixed(2) + '</div><div class="rating__content"><pre>' + processPostDescription(rating.review) + '</pre></div></div>'
			);
		});

		jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__title-outof').text('(' + numberWithCommas(Number(jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__title-outof').attr('data-ratings'))) + ' Ratings & ' + numberWithCommas(data.length) + ' Reviews)');
		loaderMain('secondary', false);
	}
	else if (state == 'render rateNow') {
		//Check if the popup is already rendered
		if (!jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .rateNow__popup').length > 0) {
			userName = jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page').attr('data-userName');
			jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__body').append('<div class="rateNow__popup"><div class="popup__bg"></div><div class="rateNow__box"><div class="rateNow__title">Share your Rating & Review with Buddies</div><div class="rateNow__form"><form id="rateNow"><div class="form_row"><div class="form_column"><label>How would you rate ' + userName + '?</label>' + renderRatingStar('rateUser-rating') + '</div></div><div class="form_row"><div class="form_column"><label for="rateNow__review">Share what you liked about your Buddy!</label><textarea maxlength="500" name="rateUser-review" id="" cols="30" rows="8" placeholder="Start typing here.."></textarea><span class="character_count" data-count="0">0/500 Characters</span></div></div><div class="form_row form_submit"><div class="form_column"><button type="cancel">Discard</button></div><div class="form_column"><button type="submit">Submit Now</button></div></div></form></div></div></div>');
		}

		jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__body .rateNow__popup').fadeIn(200);

		function renderRatingStar(className) {
			renderItem = '<div class="rating-group"><input class="rating__input rating__input--none" checked="checked" name="' + className + '" id="' + className + '-0" value="0" type="radio"><label aria-label="0 stars" class="rating__label hidden" for="' + className + '-0">&nbsp;</label><label aria-label="0.5 stars" class="rating__label rating__label--half" for="' + className + '-05"><i class="rating__icon rating__icon--star fa fa-star-half"></i></label><input class="rating__input" name="' + className + '" id="' + className + '-05" value="0.5" type="radio"><label aria-label="1 star" class="rating__label" for="' + className + '-10"><i class="rating__icon rating__icon--star fa fa-star"></i></label><input class="rating__input" name="' + className + '" id="' + className + '-10" value="1" type="radio"><label aria-label="1.5 stars" class="rating__label rating__label--half" for="' + className + '-15"><i class="rating__icon rating__icon--star fa fa-star-half"></i></label><input class="rating__input" name="' + className + '" id="' + className + '-15" value="1.5" type="radio"><label aria-label="2 stars" class="rating__label" for="' + className + '-20"><i class="rating__icon rating__icon--star fa fa-star"></i></label><input class="rating__input" name="' + className + '" id="' + className + '-20" value="2" type="radio"><label aria-label="2.5 stars" class="rating__label rating__label--half" for="' + className + '-25"><i class="rating__icon rating__icon--star fa fa-star-half"></i></label><input class="rating__input" name="' + className + '" id="' + className + '-25" value="2.5" type="radio" checked="checked"><label aria-label="3 stars" class="rating__label" for="' + className + '-30"><i class="rating__icon rating__icon--star fa fa-star"></i></label><input class="rating__input" name="' + className + '" id="' + className + '-30" value="3" type="radio"><label aria-label="3.5 stars" class="rating__label rating__label--half" for="' + className + '-35"><i class="rating__icon rating__icon--star fa fa-star-half"></i></label><input class="rating__input" name="' + className + '" id="' + className + '-35" value="3.5" type="radio"><label aria-label="4 stars" class="rating__label" for="' + className + '-40"><i class="rating__icon rating__icon--star fa fa-star"></i></label><input class="rating__input" name="' + className + '" id="' + className + '-40" value="4" type="radio"><label aria-label="5 stars" class="rating__label" for="' + className + '-50"><i class="rating__icon rating__icon--star fa fa-star"></i></label><input class="rating__input" name="' + className + '" id="' + className + '-50" value="5" type="radio"></div>';

			return renderItem;
		}
	}
	else if (state == 'rateUser') {
		if (data.responseCode == 200) {
			if (data.response == 'warning') {
				toast(data.errorMessage);
			}
			else {
				//Clean the form & close the popup
				jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page form#rateNow').trigger('reset');
				toast(data.message, 'success');

				//Update the rating
				jsInit('fetchRatings', {
					userId: jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page').attr('data-userId'),
				});
			}

			jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .popup__bg').trigger('click');
		}
	}

	else if (state == 'rateExperience') {

		data = data.object;

		//Clean the Ratings Box in case of a refresh. Refresh happens after successful rating
		jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__box').html('');

		data.forEach((data) => {
			jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__box').append('<div class="ratings__item" data-user="' + data.userId + '"><div class="ratings__item-title"><div class="rating__title-left"><div class="rating__title-img"><img src="' + renderUserProfileImage(data.user_display_picture) + '" alt=""></div><div class="rating__name"><div class="rating__title-name">' + data.name + '</div><div class="rating__title-date">' + data.ratingTime + '. Review</div></div></div><div class="ratings__item-title-right">' + icons.carretDown + '</div></div><div class="rating__stars">' + generateRatingStars(data.rating) + Number(data.rating).toFixed(2) + '</div><div class="rating__content"><pre>' + processPostDescription(data.review) + '</pre></div></div>');
		});

		jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__title-outof').text('(' + numberWithCommas(Number(jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page .ratings__title-outof').attr('data-ratings'))) + ' Ratings & ' + numberWithCommas(data.length) + ' Reviews)');
		loaderMain('secondary', false);

	}

	function renderRateNowBtn(selfProfile) {
		renderItem = '';

		if (!selfProfile) {
			renderItem = '<div class="rate__now">' + icons.starLine + ' Rate Now</div>';
		}

		return renderItem;
	}
}

function renderFollowersView(state, data, tab) {

	if (state == 'init' || state == 'open') {
		console.log(tab);
		if (state == 'init') {
			cleanDrawer();
			jQuery('#main__drawer .drawerBody').addClass('followers__body');
			jQuery('#main__drawer .drawerBody').append('<div class="followers__box"><div class="followers__tab_head"><ul><li class="followers__tab_head-followers" data-tab="followers"><span class="followers__count">12.9k</span>Followers</li><li class="followers__tab_head-following" data-tab="following"><span class="followers__count">635</span>Following</li></ul></div><div class="followers__tabs"><div class="followers__tab-item followers__tab-followers" data-tab="followers"><div class="followers__search"><input type="text" placeholder="Search Buddies" name="followers__search-input" id="followers__search-input"><button>' + icons.searchBar + '</button></div><div class="followers__items" id="followers__items"></div></div><div class="followers__tab-item followers__tab-following" data-tab="following"><div class="followers__search"><input type="text" placeholder="Search Buddies" name="followers__search-input" id="followers__search-input"><button>' + icons.searchBar + '</button></div><div class="followers__items"></div></div></div></div>');
		}

		jQuery('.followers__tab_head ul li[data-tab="' + tab.tab + '"]').click();

		followersCount = jQuery(tab.element).parents('.profile__follows').find('.profile__followers').attr('data-count');
		followingCount = jQuery(tab.element).parents('.profile__follows').find('.profile__followings').attr('data-count');
		jQuery('li.followers__tab_head-followers .followers__count').text(numberWithK(followersCount));
		jQuery('li.followers__tab_head-following .followers__count').text(numberWithK(followingCount));

		drawer('open');
	}
	else if (state == 'render') {
		console.log(data);
		data = data.object;
		totalPages = data.totalPages;
		pageNumber = data.pageNumber;
		data = data.list;

		if (tab == 'search') {
			tab = jQuery('.followers__tab_head ul li.active').attr('data-tab');
			jQuery('.followers__tab-item[data-tab="' + tab + '"] .followers__items').html('');
		}

		renderSearchResults(icons, data, 'searchBuddyFollowers', jQuery('.followers__tab-item[data-tab="' + tab + '"] .followers__items'));
		scrollManager('Start', 'Followers');
		if (pageNumber < totalPages) {
			jQuery('.followers__tab-item[data-tab="' + tab + '"] .followers__items').append('<div class="followers__load-more" data-pageNumber="' + pageNumber + '" data-totalPages="' + totalPages + '">Load More</div>');
		}
	}
}

function renderNotifications(state, data) {
	if (state == 'init') {
		if (!guestMaster('noLogin')) {
			jsInit('fetchNotifications', {
				notificationId: 0,
				totalItems: 100,
				pageNumber: 0,
			});
			// if (!getLocalStorage('notifications')) {
			// }
			// else {
			// 	renderNotifications('render', JSON.parse(getLocalStorage('notifications')));
			// }
		}
	}
	else if (state == 'store') {
		jQuery('#notifications').attr('data-pageNumber', data.object.pageNumber).attr('data-totalPages', data.object.totalPages);
		renderNotifications('render', data.object.list);
		scrollManager('Start', 'Notifications');
	}
	else if (state == 'render') {
		console.log(data);

		ogData = data;

		//Process the data in chunks of 30
		//This has to be done because otherwise all items throughout time are being grouped at once
		total = data.length;
		chunk = 30;

		for (i = 0; i < total; i += chunk) {
			data = ogData.slice(i, i + chunk);
			// data = groupNotificationsByType(data);
			data = removeManageListing(data);
			data = formatNotifcationByDate(data);

			renderNotification(data.thisWeek, 'This Week');
			renderNotification(data.thisMonth, 'This Month');
			renderNotification(data.older, 'Older');
		}

		// fetchNextPage(ogData);
		loaderMain('secondary', false);
	}

	function renderNotification(data, dateType) {
		data.forEach((notif) => {
			type = notif.notificationType;
			follow = renderCTA(notif, type);
			where = whereToLoad(dateType);

			jQuery(where).append('<div class="notif__item" data-value="' + notif.notificationActionId + '" data-id="' + notif.notificationId + '" data-type="' + notif.notificationType + '"><div class="notif__left"><div class="notif__image"><img src="' + renderUserProfileImage(notif.imageUrl) + '" alt=""></div><div class="notif__content"><div class="notif__text">' + notif.notificationText + '</div><div class="notif__date"><img src="' + renderUserProfileImage(notif.notificationIconUrl) + '"><span>' + formatDate(notif.notificationTime) + '<span></div></div></div>' + follow + '</div>');
		});
	}

	function fetchNextPage(data) {
		if (Number(data.object.pageNumber) < Number(data.object.totalPages)) {
			jsInit('fetchNotifications', {
				notificationId: 0,
				totalItems: 0,
				pageNumber: data.object.pageNumber,
			});
		}
	}

	function removeManageListing(data) {
		response = [];

		data.forEach((notif) => {
			if (notif.notificationType != 'managelisting') {
				response.push(notif);
			}
		});

		return response;
	}

	function whereToLoad(type) {
		response = '';

		if (type == 'This Week') {
			response = jQuery('div#notifications .notifs__week');
		}
		else if (type == 'This Month') {
			response = jQuery('div#notifications .notifs__month');
		}
		else if (type == 'Older') {
			response = jQuery('div#notifications .notifs__older');
		}

		return response;
	}

	function renderCTA(notif, type) {
		response = '';
		if (type == 'follow') {
			response = '<div class="notif__right notif__follow not-following">' + icons.plus + 'Follow</div>';
			response = '';
		}
		else if (type == 'comment') {
			response = '<div class="notif__right notif__reply">' + icons.chat + 'Reply</div>';
		}

		return response;
	}

	//This function formats the notification by date and splits them into three arrays. This week, this month and older
	function formatNotifcationByDate(data) {
		response = [];
		response['thisWeek'] = [];
		response['thisMonth'] = [];
		response['older'] = [];

		data.forEach((notif) => {
			date = new Date(notif.notificationTime);

			if (date >= new Date().setDate(new Date().getDate() - 7)) {
				response['thisWeek'].push(notif);
			}
			else if (date >= new Date().setDate(new Date().getDate() - 30)) {
				response['thisMonth'].push(notif);
			}
			else {
				response['older'].push(notif);
			}
		});

		return response;
	}

	//This function groups notifications by type
	function groupNotificationsByType(data) {
		response = [];

		data.forEach((notif) => {
			//All LFB notifications to be grouped into one, only latest one to show
			if (notif.notificationType == 'lfb') {
				lfbPresent = false;
				response.forEach((lfbNotif) => {
					if (lfbNotif.notificationType == 'lfb') {
						//Check if the two notifications are not 15 days apart
						if (Math.abs(new Date(lfbNotif.notificationTime) - new Date(notif.notificationTime)) < 1296000000) {
							lfbPresent = true;
						}
					}
				});

				if (!lfbPresent) {
					response.push(notif);
				}
			}
			//Like notifications to be grouped if they are from the same userId
			else if (notif.notificationType == 'like') {
				likePresent = false;
				response.forEach((likeNotif) => {
					if (likeNotif.notificationType == 'like' && likeNotif.userId == notif.userId) {
						likePresent = true;
					}
				});

				if (!likePresent) {
					response.push(notif);
				}
			}
			else {
				response.push(notif);
			}
		});

		return response;
	}
}

function renderSearch(state, data, element) {
	if (state == 'init') {
		renderMain(icons);
		// fetchSearchLocations();

		jsInit('fetchSearchLocations', {
			pageNumber: 0,
			limit: 50,
		}); //Fetch the locations

		jsInit('fetchSearchBuddies', {
			searchPattern: manageUserProfile('read', 'email'),
			limit: 0,
		});

		jsInit('fetchTrendingSearches', '');
	}
	else if (state == 'render') {
		if (data.responseCode == 200) {
			emptySearchResults();

			if (element == 'fetchSearchLocations') {
				renderSearchLocations(icons, data);
			}
			else if (element == 'fetchSearchBuddies') {
				renderSearchBuddies(icons, data);
			}
			else if (element == 'fetchTrendingSearches') {
				renderTrendingSearches(icons, data);
				renderRecentSearches(icons, data);
			}
			else if (element == 'searchLocation' || element == 'searchBuddy' || element == 'searchHashtag' || element == 'searchFindBuddy') {
				renderSearchResults(icons, data, element, jQuery('.search__results-box'));
			}
			else {
				console.log(data);
			}
		}
		else {
			tokenMaster('manageRefreshToken', data);
			toast(data.errorMessage);
		}
	}

	function renderMain(icons) {
		jQuery('#main').append('<div id="main__search-box"> <div class= "main_item"> <div class="search__header"><div class="search__title"><h3>Fancy a new Adventure?</h3><span class="search__filter">' + icons.filter + '</span></div><div class="search__container"><div class="search__box"><input type="text" placeholder="Search Buddies, Experiences or Destinations" id="searchPageInput"><button>' + icons.searchBar + '</button></div><div class="search__suggestion">Try searching for "<span>Manali<span>"</div><div class="search__headers"><ul><li data-id="locations" class="active">Locations</li><li data-id="buddies">Buddies</li><li data-id="experiences">Experiences</li><li data-id="hashtags">Hashtags</li><li data-id="find">Find Buddies</li></ul></div></div></div><div class="search__body"><div class="search__results-box"></div><div class="search__suggestions-box"><div class="search__sug-item search__sug-item__recent"></div><div class="search__sug-item search__sug-item__trending"></div><div class="search__sug-item search__sug-item__buddies search__sug-itemSwiper"></div><div class="search__sug-item search__sug-item__locations locations_sug-itemSwiper"></div></div></div></div ><div class="secondary_item"></div></div >');
	}

	function renderSearchLocations(icons, data) {
		jQuery('.search__sug-item__locations').html('<div class="search__sug-title">' + icons.location + ' Local Destinations your Buddies Love!</div><div class="search__sug-body swiper-wrapper"></div>');

		data = data.object;
		//Randomize the data
		data.sort(() => Math.random() - 0.5);
		data.forEach((location) => {
			//Remove spaces from the location image url
			location.imageUrl = location.imageUrl.replace(/ /g, '');
			locationImage = renderUserProfileImage(imageBaseUrl + location.imageUrl);
			//locationImage = renderUserProfileImage(location.imageUrl);

			jQuery('.search__sug-item__locations .search__sug-body').append('<div class="search__sug-item swiper-slide" data-type="location" data-value=' + location.location + ' data-lat=' + location.lat + ' data-lng= ' + location.lng + ' ><div class="ssi__locations-title">' + location.location + '</div><div class="ssi__locations-posts">' + icons.posts + ' ' + numberWithCommas(location.postCount) + ' posts</div><div class="ssi__image"><img src="' + locationImage + '"></div></div>');
		}, 10);

		setTimeout(() => {
			swiper('searchLocations', '.search__sug-item__locations')
		}, 150);
	}

	function renderSearchBuddies(icons, data) {
		jQuery('.search__sug-item__buddies').html('<div class="search__sug-title">' + icons.buddies + ' Popular Buddies</div><div class="search__sug-body swiper-wrapper"></div>');

		data = data.object.users;
		data.sort(() => Math.random() - 0.5);
		data.forEach((user) => {
			profileImage = renderUserProfileImage(user.imageUrl);

			jQuery('.search__sug-item__buddies .search__sug-body').append("<div class='search__sug-item swiper-slide' data-type='user' data-value='" + user.userId + "'><div class='ssi__buddies-image'><img src='" + profileImage + "'></div><div class='ssi__buddies-title'>" + user.name + '</div></div>');
		});

		// horizontalScroll('.horizontal-scroll');
		setTimeout(() => {
			swiper('searchBuddies', '.search__sug-item__buddies')
		}, 150);
	}

	function renderTrendingSearches(icons, data) {
		jQuery('.search__sug-item__trending').html('<div class="search__sug-title">' + icons.trending + ' Recent Trending Searches</div><div class="search__sug-body"></div>');

		data = data.object.trendingSearches;
		x = 0;
		data.forEach((search) => {
			typeIcon = renderTypeIcon(search.type, icons);
			active = x == 1 ? 'active' : '';
			dataVal = search.name;

			if (search.type == 'user') {
				dataVal = search.type_id;
			}
			if (search.type == 'hashtag') {
				dataVal = '#' + search.name;
				search.name = '#' + search.name;
			}

			jQuery('.search__sug-item__trending .search__sug-body').append("<div class='search__sug-item " + active + "' data-type='" + search.type + "' data-value='" + dataVal + "' data-lat='" + search.lat + "' data-lng='" + search.long + "'><span>" + typeIcon + '</span>' + search.name + '</div>');
			x++;
		});
	}

	function renderRecentSearches(icons, data) {
		if (!guestMaster('noLogin')) {
			jQuery('.search__sug-item__recent').html('<div class="search__sug-title">' + icons.trendingBg + ' Your Recent Searches</div><div class="search__sug-body"></div>');

			//Rearrange the order of the four items inside the search__suggestions-box
			reOrder();

			data = data.object.recentSearches;
			data.forEach((search) => {
				typeIcon = renderTypeIcon(search.type, icons);
				jQuery('.search__sug-item__recent .search__sug-body').append("<div class='search__sug-item " + active + "' data-type='" + search.type + "' data-value='" + search.name + "'><span>" + typeIcon + '</span>' + search.name + "<span class='search__sug-item__recent-remove'>x</span></div>");
			});
		}

		function reOrder() {
			jQuery('.search__sug-item__buddies').prependTo('.search__suggestions-box');
			jQuery('.search__sug-item__trending').prependTo('.search__suggestions-box');
			jQuery('.search__sug-item__locations').prependTo('.search__suggestions-box');
			jQuery('.search__sug-item__recent').prependTo('.search__suggestions-box');
		}
	}

	function renderTypeIcon(type, icons) {
		renderItem = '';

		if (type == 'location') {
			renderItem = icons.location;
		} else if (type == 'user') {
			renderItem = icons.buddies;
		}

		return renderItem;
	}

	function emptySearchResults() {
		jQuery('.search__results-box').html('');
	}
}

function renderSearchResults(icons, data, type, where) {
	if (type !== 'searchBuddyFollowers' && type != 'searchPagination' && type != 'searchLocationPagination' && type != 'searchHashtagsPagination' && type != 'searchFindPagination') {
		jQuery(where).html('');
	}

	data = dataSet(type, data);
	console.log(data);
	if (data.length > 0) {
		data.forEach((item) => {
			if (item !== undefined) {
				leftImage = renderLeftImage(type, item);
				title = renderTitle(type, item);
				subtitle = renderSubtitle(type, item);
				followButton = renderFollowButton(type, item);
				value = renderValue(type, item);
				mainClass = renderMainClass(type);
				extras = renderExtras(type, item); //Used to add the latitude and longitude of the location

				jQuery(where).append('<div class="' + mainClass + ' search__item-location" data-type="' + type + '" data-uniqueid="' + item.uniqueUserId + '" data-value="' + value + '" ' + extras + '><div class="search__item-left"><div class="search__item-icon">' + leftImage + '</div><div class="search__item-text"><div class="search__item-title">' + title + '</div><div class="search__item-subtitle">' + subtitle + '</div></div></div><div class="search__item-right">' + followButton + '</div></div>');
			}
		});
        jQuery(where).append('<div class="sentinel"></div>');
        
        
        sentinel = document.querySelector('.sentinel');
        let observer;

        options = {
            root: document.querySelector('.search__body'), // use the search__body as the viewport
            rootMargin: '0px',
            threshold: 0.1 // trigger when sentinel is fully visible
        };

        observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Sentinel is visible, log the event
                    console.log('Sentinel is at the end of the scroll');
                    if (jQuery('.search__body .search__results-box .search__item').length > 9 ) {
                    
                        pageNumber = 1 + Number(jQuery('.search__body').attr('data-page'));
                        
                        tabType = jQuery('.search__headers li.active').attr('data-id');
                        
                        activeTab = jQuery('.search__headers ul li.active').attr('data-id');
                        value = jQuery('#searchPageInput').val();
                        searchParams = { searchPattern: value, limit: pageNumber };
                        
                        switch (activeTab) {
                            case 'locations':
                                // Dont do anything
                                break;
                            case 'buddies':
                                // Here limit is the pageNumber , i.e limit = pageNumber
                                jsInit('searchBuddy', searchParams, 'searchPagination');
                                break;
                            case 'hashtags':
                                jsInit('searchHashtag', { searchPattern: value, pageNumber: pageNumber }, 'searchHashtagsPagination');
                                break;
                            case 'find':
                                jsInit('searchFindBuddy', searchParams, 'searchFindPagination');
                                break;
                            case 'experiences':
                                // Dont do anything
                                break;
                            default:
                                // Handle the case where activeTab doesn't match any expected values
                                console.error(`Unexpected activeTab value: ${activeTab}`);
                        }
                    
                        jQuery('.search__body').attr('data-page', pageNumber);
                        
                        observer.unobserve(entry.target); // Stop observing the current sentinel
                        
                        // remove the current sentinel
                        entry.target.remove();
                    }
                }
            });
        }, options);

        observer.observe(sentinel); // Start observing the sentinel
        
	}
	else {
        if (jQuery('.search__body').attr('data-page') == 0) {
		    jQuery(where).html('<div class="search__results-item no-results">No results found</div>');
        }
	}

	function renderMainClass(type) {
		response = 'search__item';

		if (type == 'locations') {
			response = 'locations__item';
		}

		return response;
	}

	function renderValue(type, data) {
		response = '';
		if (type == 'searchLocation' || type == 'locations' || type == 'searchFindBuddy' || type == 'searchLocationPagination' || type == 'searchFindPagination') {
			response = data.location;
		}
		else if (type == 'searchBuddy' || type == 'searchBuddyFollowers' || type == 'searchPagination') {
			response = data.userId;
		}
		else if (type == 'searchHashtag' || type == 'searchHashtagsPagination') {
			response = '#' + data.hashtag;
		}

		return response;
	}

	function renderFollowButton(type, data) {
		response = '';
		if (type == 'searchBuddy' || type == 'searchBuddyFollowers' || type == 'searchPagination') {
			if (data.isFollowing) {
				response = '<div class="search__item-follow following">' + icons.tick + 'Following</div>';
			}
			else {
				response = '<div class="search__item-follow not-following ">' + icons.plus + 'Follow</div>';
			}
		}

		return response;
	}

	function renderSubtitle(type, data) {
		response = '';
		if (type == 'searchLocation' || type == 'locations' || type == 'searchFindBuddy' || type == 'searchLocationPagination' || type == 'searchFindPagination') {
			response = numberWithCommas(data.postCount) + ' posts';
		}
		else if (type == 'searchBuddy' || type == 'searchBuddyFollowers' || type == 'searchPagination') {
			
			followerText = data.followerCount == 1 ? 'Follower' : 'Followers';
			response = numberWithCommas(data.followerCount) + ' ' + followerText;

			if (data.rating > 0) {
				response += ' | ' + data.rating.toFixed(2) + ' ' + icons.star;
			}
		}
		else if (type == 'searchHashtag' || type == 'searchHashtagsPagination') {
			if (data.count) {
				response = numberWithCommas(data.count) + ' posts';
			}
			else {
				response = '';
			}
		}

		return response;
	}

	function renderTitle(type, data) {
		response = '';

		if (type == 'searchLocation' || type == 'locations' || type == 'searchFindBuddy' || type == 'searchLocationPagination' || type == 'searchFindPagination') {
			response = data.location;
		}
		else if (type == 'searchBuddy' || type == 'searchBuddyFollowers' || type == 'searchPagination') {
			response = data.name;
		}
		else if (type == 'searchHashtag' || type == 'searchHashtagsPagination') {
			response = '#' + data.hashtag;
		}

		return response;
	}

	function renderLeftImage(type, data) {
		response = '';
		if (type == 'searchLocation' || type == 'locations' || type == 'searchFindBuddy' || type == 'searchLocationPagination' || type == 'searchFindPagination') {
			response = icons.searchLocation;
		}
		else if (type == 'searchBuddy' || type == 'searchBuddyFollowers' || type == 'searchPagination') {
			response = getProfileImage(renderUserProfileImage(data.imageUrl), '', '', '', (data.roleType == 7));
		}
		else if (type == 'searchHashtag' || type == 'searchHashtagsPagination') {
			response = icons.hashtag;
		}

		return response;
	}

	function renderExtras(type, data) {
		response = '';
		if (type == 'searchLocation' || type == 'locations' || type == 'searchFindBuddy') {
			response = 'data-lat="' + data.lat + '" data-lng="' + data.lng + '"';
		}

		return response;
	}

	function dataSet(type, data) {
		if (type == 'searchLocation' || type == 'locations' || type == 'searchFindBuddy' || type == 'searchLocationPagination' || type == 'searchFindPagination') {
			return data.object.locations;
		}
		else if (type == 'searchBuddy' || type == 'searchPagination') {
			return data.object.users;
		}
		else if (type == 'searchHashtag' || type == 'searchHashtagsPagination') {
			return data.object;
		}
		else if (type == 'searchBuddyFollowers') {
			return data;
		}
	}
}


function renderFilter(state, data) {
	if (state == 'init') {
		jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="filters"><form id="search-filter_form"><div class="filter-by-gender_box filter-boxes"><div class="filter_sub_boxes_label"> ' + icons.genderFilter + ' <h4 class="filter_subCategory_title">Filter By Gender</h4></div><div class="filter_gender_options"><label for="filter_gender-any" class="gender_options_box active">' + icons.allGender + ' Any<input type="radio" name="options-Gender" checked id="filter_gender-any" value="-1"></label><label for="filter_gender-female" class="gender_options_box">' + icons.female + '  Female <input type="radio" name="options-Gender" id="filter_gender-female" value="1"></label><label for="filter_gender-male" class="gender_options_box"> ' + icons.male + ' Male <input type="radio" name="options-Gender" id="filter_gender-male" value="0"></label><label for="filter_gender-non-binary" class="gender_options_box"> ' + icons.nonBinary + ' Non-Binary <input type="radio" name="options-Gender" id="filter_gender-non-binary" value="2"></label></div></div><div class="filter-by-age_box filter-boxes"><div class="filter_age_boxDescription"><div class="filter_sub_boxes_label"> ' + icons.ageFilter + '<h4 class="filter_subCategory_title">Filter By Age</h4></div><div class="filter_age_description_box"><p>You can select between 13 and 60</p></div></div><div class="filter_age_inputBox_container"><div class="filter_age_from_box"><div class="filter_from_label">From</div><div class="filter_input_number"><input type="number" placeholder="13" min="13" max="59" name="ageFromNumber"></div></div><div class="filter_age_from_box"><div class="filter_till_label">To</div><div class="filter_input_number"><input type="number" min="14" max="60" placeholder="60" name="ageTillNumber"></div></div></div></div><div class="filter-by-userType_box filter-boxes"><div class="filter_sub_boxes_label"> ' + icons.userFilter + ' <h4 class="filter_subCategory_title">Filter By User</h4></div><div class="filter_userType_options"><label class="user_types_filter_options active"><img src="/view/assets/img/filters/any_user.svg"><p>Any</p><input type="radio" name="userType_options" checked id="any_user_type" value="2"></label><label class="user_types_filter_options"><img src="/view/assets/img/filters/service_provider.svg"><p>Service<br>Provider</p><input type="radio" name="userType_options" id="service_provider_type" value="1"></label><label class="user_types_filter_options"><img src="/view/assets/img/filters/traveller.svg"><p>Traveller</p><input type="radio" name="userType_options" id="traveller_type" value="0"></label></div></div><div class="filter-by-location_box filter-boxes"><div class="filter_sub_boxes_label"> ' + icons.location + ' <h4 class="filter_subCategory_title">Filter By Location</h4></div><div class="search__box"><input type="text" id="filter_search" name="filter_search" placeholder="Search Destination, Places or Buddies"><button>' + icons.searchBar + '</button></div></div><div class="filter-by-postType_box filter-boxes"><div class="filter_sub_boxes_label"> ' + icons.postType + ' <h4 class="filter_subCategory_title">Filter By Post Type</h4></div><div class="types-filter_options"><label class="filter_options_box active" for="images_interest_option"> ' + icons.addPostShare + ' <p>Stories</p><input checked class="hidden" type="checkbox" id="images_interest_option" name="filterStories" value="1"></label><label  class="filter_options_box" for="buddies_interest_option"> ' + icons.userFilter + ' <p>Find Buddies</p><input  class="hidden" type="checkbox" id="buddies_interest_option" name="filterBuddies" value="2"></label><label class="filter_options_box" for="location_interest_option">' + icons.profileAsk + '<p>Location Queries</p><input class="hidden" type="checkbox" id="location_interest_option" name="filterAsk" value="2"></label></div></div><div class="buttons_box-SubmitReset"><button type="reset" id="search-filter_reset-button">Reset</button><button type="submit" id="search_filter_submit-button">Apply Filter</button></div></form></div>');
		setTimeout(function () {
			loaderMain('secondary', false);
			jQuery('#buddies_interest_option').parent().click();
			jQuery('#images_interest_option').parent().click();
		}, 100);
	}
}

function renderShots(state, data, extra) {

	if (state == 'init') {
		jQuery('#main').append('<div id="main__shots-box"><div class="shots__head"><div class="shots__back">' + icons.back + '</div><div class="shots__title">Travel Shots</div><div class="shots__addPost">' + icons.camera + '</div></div><div class="swiper-wrapper"></div></div>');
		renderShots('fetchShots', { pageNumber: 0, totalItems: 9, postId: 0 });
	}
	else if (state == 'fetchShots') {
		if (extra !== 'pagination') {
			//manageShots('clean');
		}

		fetchPosts({
			"feedsType": 'SHOTS',
			"pageNumber": data.pageNumber,
			"postId": data.postId,
			"totalItems": data.totalItems
		}, '', 'shots');
	}
	else if (state == 'fetchResults') {
		console.log(data);
		pageNumber = data.object.pageNumber;
		totalPages = data.object.totalPages;
		data = data.object.list;

		if (extra == 'singleShot') {
			travelShotsArr = [];
		}

		data.forEach(shot => {
			travelShotsArr.push(shot);
		});

		if (extra == 'singleShot') {
			jQuery('#tb__reels').trigger('click');
		}

		managePageNumber('update', pageNumber, totalPages, travelShotsArr);

		if (extra == 'pagination') {
			renderShots('render');
		}
	}
	else if (state == 'renderFirst') {
		//Check if the shots are empty, then Render the first three shots
		if (jQuery('#main__shots-box .swiper-slide').length == 0) {
			x = 0;
			travelShotsArr.forEach(shot => {
				if (x < 5) {
					renderShots('render', shot, 'first');
					x++;
				}
			});

			swiper('shots', '#main__shots-box');
		}
	}
	else if (state == 'render') {
		console.log(data);
		//Check if the post is already rendered
		try {
			if (jQuery('#main__shots-box .swiper-slide[data-post="' + data.post.postId + '"]').length == 0) {
				if (extra == 'first') {
					jQuery('#main__shots-box .swiper-wrapper').append(renderShot(data, icons));
				}
				else {
					//Small Note - The extra is the swiper instance, so we can use it to append the new slide
					extra.appendSlide(renderShot(data, icons));
				}
			}
		} catch (error) {
			console.error(error);
		}

	}
	else if (state == 'pagination') {
		shotPosition = Number(data.activeIndex);
		shotsTotal = Number(data.slides.length);
		page = managePageNumber('fetch');

		if (shotPosition == shotsTotal - 2) {
			//First check if the travelShotsArr is has more items
			if (travelShotsArr.length > shotPosition) {
				if (Number(shotsTotal) > shotPosition + 1) {
					renderShots('render', travelShotsArr[shotPosition + 2], extra);
				}
			}

			if (travelShotsArr.length < shotPosition + 4) {
				//Fetch the next page
				page = managePageNumber('fetch');
				renderShots('fetchShots', { pageNumber: parseInt(page.pageNumber), totalItems: 4, postId: 0 }, 'pagination');
				renderShots('render', travelShotsArr[shotPosition + 2], extra);
			}
		}
		else {
			if (shotPosition == shotsTotal - 3) {
				//Fetch the next page
				page = managePageNumber('fetch');
				renderShots('fetchShots', { pageNumber: parseInt(page.pageNumber), totalItems: 4, postId: 0 }, 'pagination');
				renderShots('render', travelShotsArr[shotPosition + 1], extra);
			}
		}
	}

	function renderShot(shot, icons) {
		renderItem = '';

		if (shot) {
			try {
				shot = shot.post;
				likesItem = renderPostLiked(shot.isLiked, shot.likes);
				if (shot.isFollowed) {
					followText = 'Followed';
				}
				else {
					followText = 'Follow';

				}

				mutedState = (jQuery('.shots__item:first-child').find('.shots_volume').length == 0) ? 'mute' : jQuery('.shots__item:first-child').find('.shots_volume').attr('data-state');

				renderItem = '<div class="shots__item swiper-slide" data-user="' + shot.userId + '" data-uniqueId="' + shot.uniqueUserId + '" data-post="' + shot.postId + '"data-thumbnail="' + shot.mediaList[0].urlImageThumbnail + '"><div class="shots__video"><video autobuffer width="100%" height="auto" muted loop playsinline control><source src="' + renderPostMedia(shot.mediaList[0].mediaUrl, 'video') + '" type="video/mp4"></video><div class="shots__video-overlay"><div class="play-button" id="playBtn">' + icons.volume + '</div></div></div><div class="shots__bottom"><div class="shots__user"><div class="shots__user-left"><div class="shots__user-img"><img src="' + renderUserProfileImage(shot.imageUrl) + '" alt=""></div><div class="shots__user-name"><div class="shots__user-name-text">' + shot.name + '</div><div class="shots__user-name-location">' + shot.location + '</div></div></div><div class="shots__user-right"><div class="shots__follow"><span class="shots__follow-text">' + followText + '</span></div></div></div><div class="shots__user-description truncate"><pre>' + processPostDescription(shot.postDescription) + '</pre></div></div><div class="shots__sidebar"><ul><li class="shots_volume" data-state="' + mutedState + '"><span class="shots__mute"><i aria-hidden="true" class="fas fa-volume-up"></i></span><span class="shots__unmute"><i aria-hidden="true" class="fas fa-volume-mute"></i></span></li>' + likesItem + '<li class="shots__comment">' + icons.bubbleChat + '<span class="count">' + numberWithK(shot.comments) + '</span></li><li class="shots__share">' + icons.send + '</li><li class="shots__bookmark" data-bookmarked>' + icons.bookmark + '</li><li class="shots__more">' + icons.horizontalDots + '</li></ul></div></div>';

				if (shot.isFollowed) {
					jQuery('.shots__user').addClass('followed');
				}
			}
			catch (e) {
				console.log(e);
			}
		}

		return renderItem;
	}

	function managePageNumber(state, pageNumber, totalPages, travelShotsArr) {
		response = [];

		if (state == 'update') {
			jQuery('#main__shots-box').attr('data-pageNumber', pageNumber);
			jQuery('#main__shots-box').attr('data-totalPages', totalPages);
			jQuery('#main__shots-box').attr('data-totalShots', travelShotsArr.length);

			loaderMain('global', false);
			renderShots('renderFirst');
			jQuery('#main__shots-box').show('slide', { direction: 'right' }, 300);
			jQuery('#main__shots-box').addClass('active');

			//Play the first video
			jQuery('#main__shots-box .shots__item:first-child').find('video')[0].play();

			window.history.pushState({ html: jQuery('#main__shots-box').html(), pageTitle: 'Shots' }, '', '#shots');

			if (jQuery(this).hasClass('desktopMenu-shots')) {
				jQuery('body').addClass('shots__open');
			};
		}
		else if (state == 'fetch') {
			response = {
				pageNumber: jQuery('#main__shots-box').attr('data-pageNumber'),
				totalPages: jQuery('#main__shots-box').attr('data-totalPages'),
				totalShots: jQuery('#main__shots-box').attr('data-totalShots')
			}
		}

		return response;
	}

	function renderPostLiked(liked, likes) {

		renderItem = '';

		if (liked) {
			icon = icons.heart_active;
			liked = true;
		}
		else {
			icon = icons.heartThick;
			liked = false;
		}

		if (likes > 0) {
			renderItem = '<li class="shots__like" data-liked="' + liked + '">' + icon + '<span class="count">' + likes + '</span></li>';
		}
		else {
			renderItem = '<li class="shots__like" data-liked="' + liked + '">' + icon + '<span class="count"></span></li>';
		}

		return renderItem;
	}
}

function renderInterests(state, data, extra) {
	if (state == 'init') {
		jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="interests__box"></div>');
		fetchPosts(data, token, 'interests');
		loaderMain('secondary', true);
	}
	else if (state == 'render') {
		console.log(data);

		if (data.errorCode !== 200) {
			renderFeed(data, '#secondary .secondary__tab:last-child .interests__box');
			loaderMain('secondary', false);
		}
		else {
			render404();
		}
	}
}

function renderPremium(state, data, separateUrls) {
	if (state == 'init') {
		if (manageUserProfile('read', 'isVerified') == true) {
			jsInit('getSubscriptionInfo', {});
		}
		else {
			//getCountry(separateUrls);
			renderMain(icons, data, '', separateUrls);
		}
	}
	else if (state == 'renderMain') {
		if (jQuery('.premium__body').length > 0) {
			jQuery('#main__premium-box').remove();
		}
		//loaderMain('global', false);
		renderMain(icons, data, '', separateUrls);
		//jsInit('fetchCoupons'); Stopping this for now
	}
	else if (state == 'renderSubscription') {
		//loaderMain('global', false);
		console.log(data);
		renderMain(icons, data, 'subscription');
	}
	else if (state == 'coupons') {
		renderCoupons(data, icons);
	}
	else if (state == 'clean') {
		jsInit('getSubscriptionInfo', {});
	}

	/*function renderMain(icons, data, type, separateUrls) {
		title = '<div class="traveler-premium-title"><p>Unlock advanced features with</p><h3>Travel Buddy Premium!</h3></div><div class="traveler-title-down"><p>Tap to select the plan you want</p></div>';

		if (type == '') {
			packages = false;
			subscriptionButtonHtml = '<div class="premium__purchase" id="premium__purchase"><div class="premium__button"><div class="premium__button__price">Rs. 1999</div><div class="premium__button__text">Subscribe Now ' +
				icons.arrow_right +
				'</div></div><div class="premium__terms">By purchasing a premium subscription, you agree to all our<span>terms and conditions</span></div></div></div></div>';
		}
		else {
			packages = renderSubscriptionInfo(data);
			title = '<div class="traveler-premium-title"><p>Welcome ' + manageUserProfile('read', 'name') + '</p></div><div class="traveler-title-down"><p><div class="premiumAccess">Enjoy Full Access of the App!</div></p></div>'
			subscriptionButtonHtml = '<div class="premium__terms">By purchasing a premium subscription, you agree to all our<span>terms and conditions</span></div></div>';
		}

		headerUrl = renderHeaderUrl(type);
		packages = (!packages) ? '' : packages;

		if (jQuery('#main__premium-box').length > 0) {
			jQuery('#main__premium-box').remove();
		}
		features = renderFeatures();
		//

		jQuery('#main').append('<div id="main__premium-box"><div class="dpremium__header"><div class="premium__header-bg"><img src="/view/assets/img/member_banner-one.webp"></div></div><div class="premium__body"><div class="premium__features">' + features + '</div><div class="faq-info-box"><div class="faq-intro-left"><h3>FAQs</h3><p>Perks of becoming a Premium User...</p></div><h2>View All</h2></div>');
	    
		if (packages) {
			jQuery('.pricing-card-wrapper').append(packages);
			jQuery('.pricing-card').hide();
			jQuery('.pricing-card-wrapper').css('margin-top', '0px');
			jQuery('#footer').find('#premium__purchase').remove();
			jQuery('.traveler-premium-wrapper').find('#premium__purchase').remove();
			jQuery('#footer').css('height', '70px');
		}

		else {
			if ((jQuery('.premium__purchase').length <= 0 ) && isMobile()) {
				jQuery('#footer').prepend(subscriptionButtonHtml);
				jQuery('#footer').css('height', '170px');
			}
			else {
				jQuery('.traveler-premium-wrapper').children(':nth-child(1)').append(subscriptionButtonHtml);
			    
			}
		}

		setTimeout(function () {
			jQuery('#main__premium-box').addClass('active');
		}, 100);

		if (!packages) {
			renderPackages(icons, data);
			if (separateUrls) {
				jQuery('.pricing-card').removeClass('pricing-card-active');
				jQuery(`#${separateUrls}`).click();
				window.history.pushState({ html: jQuery('#main__premium-box').html(), pageTitle: 'Premium' }, 'Premium', `/${separateUrls}`);
			}
		}
		console.log('Premium',data);
	}*/
	
	// New Function to render the premium page
	
	function renderMain(icons, data, type, separateUrls) {
		console.log('Prem', data);
		//appHTML = jQuery('#app').prop('outerHTML');
		//jQuery('#app').remove();
		
		// Ads for Non-Premium Users
		let googleAds = '';
		
		if (window.location.hostname != 'localhost') {
			googleAds = `<div class="ad_container">
				<div class="ad_wrapper">
					<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2182701660122082" crossorigin="anonymous"></script>
					<ins class="adsbygoogle" 
						 style="display:block;" 
						 data-ad-client="ca-pub-2182701660122082" 
						 data-ad-slot="7328663740" 
						 data-ad-format="auto">
					</ins>
				</div>
				<div class="go__ads-free premiumPage" style="display: none;">
					<p>Tired of too many ads?</p>
					<div class="go__premium">Go Ad-Free NOW</div>
				</div>
			</div>`;
		}
		
		// Header Section
		let header = `<div class="premium__header-new">
				<div class="premium__title-one">Welcome to</div>
				<div class="premium__title-two">TRAVEL BUDDY </div>
				<div class="premium__title-three">ELITE CLUB</div>
			</div>`;
		
		// Tabs Section
		let tabs = `<div class="premium__tabs">
				<div class="premium__tab-container">

					<div class="premium__tab" data-tab="3">SAVER
					<span class="premium__tab-subtitle">BILLED MONTHLY</span></div>
					<div class="premium__tab premium__tab--active" data-tab="2">
						PREMIUM
						<span class="premium__tab-subtitle">BILLED ANNUALLY</span>
					</div>
					<div class="premium__tab" data-tab="4">LUXE<span class="premium__tab-subtitle">BILLED ANNUALLY</span></div>
					
				</div>
			</div>`;
		let liveLocationInfo = JSON.parse(localStorage.getItem('liveLocationInfo'));
		let currencyCode = liveLocationInfo  && liveLocationInfo.currency_code && liveLocationInfo.currency_code != '' ? liveLocationInfo.currency_code == 'INR' ? '₹' : '$' : '₹';
		let price = currencyCode == '₹' ? '83/' : '2.5/';
		
		// Render Premium Price Sliders
		let permiumPriceSlider = `
		<section class="price-slider">
		  <div class="price-slider__container">
			<div class="price-slider__card" data-pack-id="tbd_traveler_one_year" data-currency="INR">
			  <!-- Best Seller Tag -->
			  <div class="price-slider__tag">
				<div class="price-slider__tag-text">Best-Seller</div>
			  </div>
		
			  <!-- Main Content -->
			  <div class="price-slider__content">
				<!-- Title -->
				<div class="price-slider__title-group">
				  <div class="price-slider__title">Travel Buddy</div>
				  <div class="price-slider__subtitle">PREMIUM</div>
				</div>
		
				<!-- Savings Text -->
				<div class="price-slider__savings">Save up to 45%</div>
		
				<!-- Price -->
				<div class="price-slider__price">
				  <div class="price-slider__currency">${currencyCode}</div>
				  <div class="price-slider__amount">${price}</div>
				  <div class="price-slider__period">MONTH</div>
				</div>
				<div class="price-slider__strikethrough-price">Billed ₹1999/- per year</div>
				<div class="price-slider__savings total__price">Billed ₹999/- per year</div>
				
				<!-- Users Count -->
				<div class="price-slider__users">
				  <div class="price-slider__avatars">
					<img class="price-slider__avatar" src="https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_pictures/1585117-1676562955181.jpg" alt="Avatar 1">
					<img class="price-slider__avatar" src="https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_pictures/1710081-1682491708858.jpg" alt="Avatar 2">
					<img class="price-slider__avatar" src="https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_picture/7e3ea68e054df1b00b7ad864421a08526ed44e1ae1c7d3b15edc88b3db6f80fd_1701842072036.jpeg" alt="Avatar 3">
					<img class="price-slider__avatar" src="https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_picture/b9b14a668bb439b05cdc97698ff3ff9f4983de5f7679399cddd4d9f0ea9eddd7_1706152551346.jpg" alt="Avatar 4">
				  </div>
				  <div class="price-slider__users-text">
					<strong>60k+</strong> Satisfied Users
				  </div>
				</div>
		
				<!-- CTA Button -->
				<button class="price-slider__cta">
				<div class="price-slider__cta-now">BUY NOW</div>
				</button>
			  </div>
			</div>
		  </div>
		</section>
		`;
		
		// Benefits Section
		
		let benefits = [
			{
				title: "Zero Convenience Fees On Flights & Hotels",
				subtitle: "Save Money On Every Booking,Everytime…When You Are Member",
				imgSrc: "/view/assets/img/flight.webp"
			},
			{
				title: "Unlimited AI enabled chat",
				subtitle: "Connect with like-minded adventurers, share experiences, plan trips together, and build lasting memories!",
				imgSrc: "/view/assets/img/ai.webp"
			},
			{
				title: "Unlimited Profile Views & Filters",
				subtitle: "Effortlessly filter and discover your perfect travel companion among a diverse array of adventurers",
				imgSrc: "/view/assets/img/views-two.webp"
			},
			{
				title: "Exclusive Perks & Discounts",
				subtitle: "Get Free Access To Spas, Room Upgrades, Complimentary Breakfast,Photoshoots and Much More",
				imgSrc: "/view/assets/img/coupon.webp"
			},
			{
				title: "Effortless Travel with Visa & Check-In Support",
				subtitle: "From visa assistance to seamless web check-in, we’ve got you covered.",
				imgSrc: "/view/assets/img/support.webp"
			},
			{
				title: "Welcome on Arrival in Local Tradition",
				subtitle: "Experience the local culture with a traditional welcome.",
				imgSrc: "/view/assets/img/drink.webp"
			}
		];
		
		let premiumBenefitsHTML = `
		  <div class="premium__benefits-container">
			<div class="premium__benefits-title">For the Evolved Traveler In You</div>
			<div class="premium__benefits-sub-container">
			  ${benefits.map((benefit, index) => `
				<div class="premium__benefits benefit-${index + 1}">
				  <div class="premium__benefits-text">
					<div class="premium__title">${benefit.title}</div>
					<div class="premium__sub-title">${benefit.subtitle}</div>
				  </div>
				  <div class="premium__benefits-image">
					<img src="${benefit.imgSrc}">
				  </div>
				</div>
			  `).join('')}
			  <div class="view__all-premium">View All</div>
			</div>
		  </div>
		`;
		
		// Append the Coupons Section
		let premiumCoupon = `<div class="premium__coupons"><div class="section__title">SAVINGS CORNER</div><div class="coupon__apply-container"><div class="tag__container"><div class="tag__icon">${icons.premiumTag}</div><input id="premmium_coupon" type="text" placeholder="Enter coupon code" maxlength="20"></input></div><div class="tag__icon apply__coupon-btn"><div class="apply__text">Apply${icons.rightArrow}</div></div></div><div style="display: flex; justify-content:center;width: 100%;"><button id="viewCouponBtn" style="background: black;font-family: 'Nunito';color: white; border: none; border-radius: 25px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);background: linear-gradient(90deg, #6B3458, #1C0B19); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.3)'">View Coupon</button></div></div>`;
		
		//premiumCoupon = ``;
		
		let totalHtml = ``;
		
		//Find Trip Partner Section
		let tripPartners = [
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" },
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" },
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" },
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" },
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" },
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" },
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" },
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" },
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" },
			{ name: "Aisha Chawla", followers: "1M+", imgSrc: "/view/assets/img/flight.webp" }
		];
		//<div class="section__button">See All</div>
		let findTripPartner = `
		  <div class="find__trip-partner">
			<div class="find__section-wrapper">
			  <div class="find__section__title">Find Your Trip Partners</div>
			  
			</div>
			<div class="find__trip-partner-container">
			  ${tripPartners.map(partner => `
				<div class="find__trip-partner-card">
				  <div class="find__trip-partner-image">
					<img src="${partner.imgSrc}">
					<div class="find__trip-partner-name">${partner.name}</div>
				  </div>
				  <div class="find__trip-partner-followers">${partner.followers} Followers</div>
				</div>
			  `).join('')}
			</div>
		  </div>
		`;
		
		// User Testimonials
		let testimonials = [
			{
				quote: "Thank you, Travel Buddy, for being the go-to platform for trip planning! From finding travel companions to getting local advice, your features make it so easy. The app sparks inspiration with stunning destinations, genuine reviews, and unique ideas. The user rating system adds a personal touch, and showcasing travel influencers on Instagram is a fantastic boost for them. Truly a must-have for every traveler!",
				image: "https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_pictures/1693023423_14965771693023416414.jpg",
				name: "Vidhi Aggarwal",
				rating: 5
			},
			{
				quote: "The Travel Buddy app is a fantastic tool for finding like-minded travel companions. The user-friendly interface makes it easy to connect with others who share similar travel interests and it also offers safety features for peace of mind. The app's ability to match users based on their travel preferences and itineraries is impressive, making it a must-have for solo travelers looking",
				image: "https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_picture/944978ddc0bb286718e9a7506ae56cf6dc536d3d0049bb0f6b7f3520943b4ee6_1702120450708.jpg",
				name: "Vishal Kumar",
				rating: 5
			},
			{
				quote: "Kudos to Travel Buddy for organizing a flawless trip for our team! The entire process was smooth, and their personalized approach made us feel valued. Highly recommend their services!",
				image: "https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_pictures/1693023423_14965771693023416414.jpg",
				name: "Palak Rustagi",
				rating: 5
			},
			{
				quote: "Outstanding support from Travel Buddy! Their platform streamlined every aspect of our travel, making it incredibly smooth. Special thanks to the team for their prompt and efficient assistance.",
				image: "https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_pictures/15605751687853694786.jpg",
				name: "Khusboo Jain",
				rating: 5
			},
			{
				quote: "Amazing service! Travel Buddy made our group trip seamless and hassle-free. From planning to execution, everything was perfectly managed. A big thank you to the team for making our experience unforgettable!",
				image: "https://graph.facebook.com/2044172979107277/picture?width=500&height=500",
				name: "Hiren Sanghvi",
				rating: 5
			},
			{
				quote: "Superb experience, Travel buddy really helped us, in having a wonderful experience. We were a really big group, and they handled everything perfectly. Thank you Saurav and GeeGee from Local Thailand Team",
				image: "https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_pictures/15063231662223152577.jpg",
				name: "Siddharth Jalali",
				rating: 5
			}
		];
		
		let $slider = ``;
		let currentIndex = 0;
		
		function createTestimonial(testimonial) {
			return `
				<div class="testimonial__item">
					<div class="testimonial__content">
						<p class="testimonial__quote">${testimonial.quote}</p>
					</div>
					<div class="testimonial__image">
						<img src="${testimonial.image}" alt="${testimonial.name}">
					</div>
					<div class="testimonial__details">
						<div class="testimonial__rating">${'★'.repeat(testimonial.rating)}</div>
						<h3 class="testimonial__name">${testimonial.name}</h3>
					</div>
				</div>
			`;
		}
		
		function appendTestimonials() {
			testimonials.forEach(testimonial => {
				$slider += `${createTestimonial(testimonial)}`;
			});
		}
		
		function showNextTestimonial() {
			currentIndex = (currentIndex + 1) % testimonials.length;
			jQuery('.testimonial__slider').css('transform', `translateX(-${currentIndex * 100}%)`);
		}
		
		appendTestimonials();
		
		let userTestimonialsTitle = `<div class="testimonial__title">What Our Customers Say</div>`;
		let userTestimonialsHTML = `
			<div class="testimonial__container">
				<div class="testimonial__slider">
					${$slider}
				</div>
			</div>
		`;
		setInterval(showNextTestimonial, 4500);
		
		// Benefits Section
		
		let faqs = [
			{
				title: "What does 'No Convenience Fees on Flights' mean?",
				imgSrc: "/view/assets/img/flight.webp",
				subtitle: "It means you can book flights without paying any additional charges typically added as convenience fees."
			},
			{
				title: "What perks are included in the complimentary benefits?",
				imgSrc: "/view/assets/img/coupon.webp",
				subtitle: "You get access to spa treatments, room upgrades, snorkeling sessions, and complimentary breakfasts during your stay."
			},
			{
				title: "Are the room upgrades and spa discounts guaranteed?",
				imgSrc: "/view/assets/img/coupon.webp",
				subtitle: "Room upgrades and spa discounts (up to 15%) are subject to availability but offered to all eligible users."
			},
			{
				title: "How do I access the complimentary perks during my trip?",
				imgSrc: "/view/assets/img/coupon.webp",
				subtitle: "Once you book through our platform, you'll receive details on how to redeem these perks at participating locations."
			},
			{
				title: "What should I do if money is deducted but premium is not activated?",
				imgSrc: "/view/assets/img/prem-ben.webp",
				subtitle: "If money is deducted but premium is not activated, contact our support team immediately with your transaction details for assistance."
			},
			{
				title: "How can I cancel the premium subscription after purchase?",
				imgSrc: "/view/assets/img/prem-ben.webp",
				subtitle: "You can cancel your premium subscription from the account settings section or by reaching out to our support team."
			},
			{
				title: "How do I renew my premium subscription?",
				imgSrc: "/view/assets/img/prem-ben.webp",
				subtitle: "Renew your premium subscription from the account settings section before it expires to continue enjoying the benefits."
			},
			{
				title: "Whom should I contact in case of queries?",
				imgSrc: "/view/assets/img/prem-ben.webp",
				subtitle: "For any queries or concerns, contact our 24/7 support team via email, chat, or phone."
			}
		];
		  
		let faqHTML = `
			<div class="premium__benefits-container faq__container">
			${userTestimonialsHTML}
			  <div class="faq__benefits-title">FAQs</div>
			  <div class="faq__benefits-sub-container">
				${faqs.map((benefit, index) => `
				  <div class="premium__benefits faq-${index + 1}">
					<div class="premium__benefits-text">
					  <div class="premium__title">${benefit.title}</div>
					  <div class="premium__sub-title">${benefit.subtitle}</div>
					</div>
				  </div>
				`).join('')}
				<div class="view__all-premium-faqs">View All</div>
			  </div>
			</div>
		  `;
		
		// Appending Footer Text
		
		let footerTextHtml = `
		  <div class="hero__container">
			<div class="hero__content">
			  <div class="hero__title-primary">
				Never
			  </div>
			  <div class="hero__title-secondary">
				<div class="hero__title-secondary--left">
				  Feel
				</div>
				<div class="hero__title-secondary--right">
				  Alone
				</div>
			  </div>
			  <div class="hero__footer">
				Crafted with ${icons.like_icon_new} in India
			  </div>
			</div>
		  </div>
		`;
		
		// Checking if the User is Already a Premium User
		if (type == 'subscription') {
			googleAds = '';
			// Removing Welcome
			header = `<div class="premium__header-new">
				<div class="premium__title-two">TRAVEL BUDDY ELITE CLUB</div>
			</div>`;
			
			tabs = ``;
			
			// Render Subscription Section
			permiumPriceSlider = `
			<div class="title-premium-wrapper-new">
				<div class="traveler-premium-title-new">
					<p>Welcome ${manageUserProfile('read', 'name')}</p>
				</div>
				<div class="traveler-title-down-new">
					<p></p>
					<div class="premiumAccess-new">Enjoy Full Access of the App!</div>
					<p></p>
				</div>
				<div class="pricing-card-wrapper-new">
					<div class="premium-packages-box-new subscribed-info-box-new">
						<div class="premium-packages-item-new active">
							<div class="premium-package-item-subTitle-new">Current plan</div>
							<div class="premium-package-item-title-new">${data.object.subscriptionLabel}</div>
							<div class="premium-package-item-price-new">Ends On: <span class="premium-price-new">${data.object.subscriptionEndTime}</span></div>
							<div class="premium-package-item-orderId-new">Order ID: ${data.object.orderId}</div>
						</div>
					</div>
				</div>
			</div>
			`;
			
		}
		
		// Accreditations Section
		let accreditations = [
			{ imgSrc: "/view/assets/img/acc-logo.webp" }
		];
		
		let accreditationsHTML = `
			<div class="accreditations__container">
				<div class="accreditations__title">Our Accreditations</div>  
				<div class="accreditations__sub-title">Recognized for Excellence, Trust, and Quality</div> 
				<div class="accreditations__sub-container">
					${accreditations.map((accreditation, index) => `
						<div class="accreditations__benefits accreditation-${index + 1}">
							<img src="${accreditation.imgSrc}">
						</div>
					`).join('')}
				</div>
			</div>
		`;
		
		
		// Header Section
		let premiumEntireHTML = `
		<div id="premiumContainer" data-version="${appVersion}">
			${header}
			${tabs}
			${permiumPriceSlider}
			${premiumCoupon}
			${findTripPartner}
			${premiumBenefitsHTML}
			${userTestimonialsTitle}
			${faqHTML}
			${accreditationsHTML}
			${footerTextHtml}
			${googleAds}
		</div>`;
		
		if (jQuery('#premiumContainer').length > 0) {
			jQuery('#premiumContainer').remove();
		}
		jQuery('#main').append(premiumEntireHTML);
		
		//console.log(premiumBenefitsHTML);
		
		jQuery('#premiumContainer').addClass('active');
		
		if (type == 'subscription') {
			
			let premiumDescription = getPremiumDescription('super');
			
			if (data.object.subscriptionLabel.includes('weekly') || data.object.subscriptionLabel.includes('week')) {
				premiumDescription = getPremiumDescription('mini');
				jQuery('.premium__benefits-title').text('For the GenZ & GenA Traveller');
			}
			else if (data.object.subscriptionLabel.includes('monthly') || data.object.subscriptionLabel.includes('month')) {
				jQuery('.premium__benefits-title').text('For the Price Conscious Traveller');
			}
			else {
				jQuery('.premium__benefits-title').text('For the Evolved Traveler In You');
			}
			jQuery('.premium__benefits-sub-container').empty();
			premiumDescription.forEach((benefit, index) => {
				jQuery('.premium__benefits-sub-container').append(`
					<div class="premium__benefits benefit-${index + 1}">
						<div class="premium__benefits-text">
							<div class="premium__title">${benefit.title}</div>
							<div class="premium__sub-title">${benefit.description}</div>
						</div>
						<div class="premium__benefits-image">
							<img src="${benefit.imgSrc}">
						</div>
					</div>
				`);
			});
			
			jQuery('.premium__benefits-sub-container').append(`<div class="view__all-premium">View All</div>`);
			
			// Hide the Coupon Container
			jQuery('.premium__coupons').hide();	
		}
		else {
			if (separateUrls) {
				jQuery(`.premium__tab[data-tab="${separateUrls}"]`).click();
				let url;
				switch (separateUrls) {
					case '4':
						url = '/premium-luxe';
						break;
					case '2':
						url = '/premium-super';
						break;
					case '3':
						url = '/premium-monthly';
						break;
				}
				
				window.history.pushState(
					{ html: jQuery('#main__premium-box').html(), pageTitle: 'Premium' },
					'Premium',
					url // Ensure the URL is relative
				);
			}
			
			// Google Ads
			if (window.location.hostname != "localhost") {
				const adElement = jQuery('#premiumContainer').find('.adsbygoogle').last()[0];
				const adFreeElement = jQuery('#premiumContainer').find('.go__ads-free').last();
				
				function checkAdLoaded() {
					const hasContent = adElement.innerHTML.trim() !== '';
					const hasHeight = adElement.offsetHeight > 50;
					const hasChildren = adElement.children.length > 0;
					const hasIframe = adElement.querySelector('iframe') !== null;
					
					return hasContent && hasHeight && (hasChildren || hasIframe);
				}
				
				function showAdFreeText() {
					if (checkAdLoaded()) {
						console.log('Ad detected - showing ad-free text');
						adFreeElement.fadeIn(300);
						return true;
					}
					return false;
				}
				
				// Multiple checks at different intervals
				const checkIntervals = [2000, 5000, 10000, 15000];
				
				checkIntervals.forEach((delay) => {
					setTimeout(() => {
						if (showAdFreeText()) {
							// Ad found, stop checking
							return;
						}
					}, delay);
				});
				
				// MutationObserver for real-time detection
				const observer = new MutationObserver((mutations) => {
					if (showAdFreeText()) {
						observer.disconnect();
					}
				});
				
				observer.observe(adElement, {
					childList: true,
					subtree: true,
					attributes: true
				});
				
				// Push to AdSense
				(adsbygoogle = window.adsbygoogle || []).push({});
				// Scroll down to price-slider class into view
				//jQuery('.price-slider').get(0).scrollIntoView({ behavior: 'smooth' });
			}
		}
		
		
		
		loaderMain('global', false);
		let payload = (localStorage.getItem('userLat')) ? { "lat": localStorage.getItem('userLat'), "lng": localStorage.getItem('userLng'), nearby: true } : { "lat": "28.5355", "lng": "77.39", nearby: true };
		jsInit('fetchAllInfluencers', payload , "premium");
		
	}

	/*function renderFeatures(userType, plan, type) {

        commonPart = '<div class="title-premium-wrapper">' + title + '<div class="pricing-card-wrapper"></div></div>'; 
        reviewsTraveler = [
            {
                name: "Aisha Chawla",
                location: "Chennai",
                rating: 4.97,
                followers: "6.9K",
                review: "I upgraded to Travel Buddys premium subscription, and I couldn't be happier! Not only do I enjoy an ad-free experience, but knowing who's checking my profile adds an extra layer of excitement to my travel planning. Thanks, Travel Buddy, for making my journey even more enjoyable!",
                icon: icons.userReview1
            },
            {
                name: "Neena Sharma",
                location: "Delhi",
                rating: 4.77,
                followers: "1.9M",
                review: "Travel Buddys premium subscription has truly enhanced my travel planning process. With no ads to distract me, I can focus on finding the perfect travel companions. And having insights into who is interested in my profile adds an exciting element to my journey, making every trip even more memorable!",
                icon: icons.userReview2
            },
            {
                name: "Divyaang",
                location: "Mumbai",
                rating: 4.87,
                followers: "3.9K",
                review: "Travel Buddy is one of the best travel apps I've used. I always do thorough research before traveling to any destination, and Travel Buddy has been instrumental in this. The app's Find Buddy feature has helped me discover unexplored and offbeat activities and connect with locals. Through this feature, I've made many local friends in multiple destinations. Additionally, the Travel Buddy Trips offer a variety of itineraries that have made planning easier and more exciting. The community aspect of the app is fantastic, with a feed full of travel content that keeps me inspired. The premium subscription has been particularly beneficial, providing advanced filters and unlimited chat options, making it easier to find and connect with travel mates. Travel Buddy has become my new local guide across global destinations",
                icon: icons.userReview3
            },
            {
                name: "Aditya",
                location: "Bangalore",
                rating: 4.97,
                followers: "126.9K",
                review: "This app is just awesome. Using Travel Buddy for the first time, I found it to be the best travel app with its extensive features. The Find Buddy feature allowed me to meet and travel with like-minded individuals, making my trips more enjoyable and less lonely. The Travel Buddy Trips offered great recommendations and easy-to-follow plans. Being part of the Travel Buddy community has been enriching, as it is loaded with features that make connecting with other travelers seamless. The premium subscription has enhanced my experience by allowing unlimited trip expressions and viewing who visited my profile, which has been very useful. Overall, Travel Buddy is more than just a travel app; it’s a comprehensive tool for anyone passionate about travel",
                icon: icons.userReview4
                
            }
            // Add more reviews here...
        ];
        reviewsService = [
            {
                name: "Aisha Chawla",
                location: "Chennai",
                rating: 4.97,
                followers: "6.9K",
                review: "Upgrading to the premium version of Travel Buddy has significantly enhanced my experience. The premium dashboard provides advanced trip management tools and exclusive discounts on travel services. It’s easier to find and join interesting trips, and the ability to message other premium members directly has led to more meaningful connections. The app’s overall functionality is excellent, but the premium features take it to another level.",
                icon: icons.userReview1
            },
            {
                name: "Neena Sharma",
                location: "Delhi",
                rating: 4.77,
                followers: "1.9M",
                review: "The Travel Buddy dashboard is incredibly intuitive and user-friendly. It allows me to see all my connections and upcoming trips at a glance. I love how easy it is to directly connect with other travelers. I've met some amazing people just by browsing through profiles and initiating chats. The real-time notifications keep me updated about messages and trip invites, making planning seamless",
                icon: icons.userReview2
            },
            {
                name: "Divyaang",
                location: "Mumbai",
                rating: 4.87,
                followers: "3.9K",
                review: "Creating listings for trips or local experiences on Travel Buddy has been a breeze. The process is straightforward, and I’ve received a lot of interest from fellow travelers. Being part of this vibrant community has enhanced my travel experiences immensely. The community is supportive, and I’ve made lasting friendships through the app. It's like having a global network of travel enthusiasts at your fingertips.",
                icon: icons.userReview3
            },
            {
                name: "Aditya",
                location: "Bangalore",
                rating: 4.97,
                followers: "126.9K",
                review: "Travel Buddy’s community features are outstanding. The app fosters a sense of belonging among travelers, which is fantastic. The premium membership has been worth every penny for me. It provides additional safety features, such as verified profiles and priority support, which give me peace of mind when meeting new people and arranging trips. Plus, premium members get more visibility, which has helped me connect with more like-minded travelers.",
                icon: icons.userReview4
                
            }
            // Add more reviews here...
        ];

        reviews = (isServiceProvider()) ? reviewsService : reviewsTraveler;
        function getRandomIndexes(length) {
            index1 = Math.floor(Math.random() * length);
            index2 = Math.floor(Math.random() * length);

            while (index1 === index2) {
                index2 = Math.floor(Math.random() * length);
            }

            return [index1, index2];
        }

        randomIndexes = getRandomIndexes(reviews.length);

        randomReviews = randomIndexes.map(index => reviews[index]);

        reviewPart = randomReviews.map(review => `<div class="review-wrapper"><div class="review-user-profile-image">${review.icon}</div><div class="user-profile-desc-review"><div class="review-user-wrapper"><div class="user-name-location"><h3>${review.name}</h3><p>${review.location}</p></div><div class="user-rating"><div class="rating-icon-desc">${icons.ratingPremiumIcon}<h3>Rating : ${review.rating}</h3></div><div class="user-follower-following"><h3>${review.followers} Followers</h3></div></div></div><div class="user-says"><p>${review.review}</p></div></div></div>`).join('');

        chatUnlimited = `<div class="chat-unlimited hear-user"><div class="chat-unlimited-title"><span>${icons.hearOurUserIcon}</span><h3>Hear from our users</h3></div><div class="user-says-wrapper">${reviewPart}</div></div>`;
		
        if (isServiceProvider()) {
			renderItem =
				'<div class="traveler-premium-wrapper">' + commonPart + '<div class="premium-description-wrapper"><div class="description-wrapper"><div class="description-image aiHide">'+ icons.aiBuddyIcon +'</div><div class="premium-description aiHide"><h3>AI BUDDY</h3><p>Elevate your travel agency services with our AI Buddy. Effortlessly craft personalized itineraries for your clients, ensuring every journey exceeds expectations. Offer unparalleled support and curated adventures, making each trip a seamless and unforgettable experience.</p></div></div><div class="description-wrapper mini__hide"><div class="description-image">'+ icons.priyorityListing +'</div><div class="premium-description"><h3>Priority Listing</h3><p>Access unparalleled support with our Travel Buddy Concierge, providing exclusive phone assistance for your trips booked through Travel Buddy. Included at no extra cost with TB Super, ensuring your travel experiences are seamlessly supported every step of the way.</p></div></div><div class="description-wrapper"><div class="description-image">'+ icons.hearOurUserIcon +'</div><div class="premium-description"><h3>Do Unlimited Chats With Travelers</h3><p>With Unlimited Chats, you can connect seamlessly with travelers, providing personalized recommendations and support every step of their journey. Enhance their experience and build lasting relationships as their trusted travel provider with Travel Buddys premium subscription.</p></div></div><div class="description-wrapper"><div class="description-image">'+ icons.premiumFilterIcon +'</div><div class="premium-description"><h3>Filter & Find Travelers Coming To Your City</h3><p>Gain exclusive access to filter and find travelers coming to your city, allowing you to connect with like-minded individuals and offer personalized experiences that cater to their interests and preferences.</p></div></div><div class="description-wrapper"><div class="description-image">'+ icons.unlimitedListingIcons +'</div><div class="premium-description"><h3>Create Unlimited Listings</h3><p>Unlock the power to create unlimited listings, giving you the freedom to showcase all your travel offerings without any limitations. Expand your reach and maximize your visibility to potential travelers by showcasing every unique experience and destination you have to offer.</p></div></div><div class="description-wrapper"><div class="description-image">'+ icons.travelProviderDashboardIcon +'</div><div class="premium-description"><h3>Get Your Exclusive Travel Provider Dashboard</h3><p>Unlock exclusive access to your personalized Travel Provider Dashboard, tailored to streamline your booking process and enhance customer experiences. With advanced features and insights, it is your ultimate tool for maximizing efficiency and boosting client satisfaction.</p></div></div></div>' + chatUnlimited +' <div class="chat-unlimited group-trips"><div class="exclusive-listings-wrapper"><div class="exlusive-listing"><span>'+ icons.exclusiveListingIcon +'</span><h3>Exclusive Listings</h3></div><div class="create-listing-premium"><h3>+ Create Listings</h3></div></div><div class="premium-group-trips-wrapper"></div></div></div>';
		}
		else {
			renderItem = `
				<div class="traveler-premium-wrapper">
					${commonPart}
					<div class="premium-description-wrapper">
						${generateDescriptionWrapper(icons.priyorityListing, "🌍 Enjoy all the benefits of TB MINI & TB PRO — and beyond with Travel Buddy Membership Club! 🌍", '')}
						${generateDescriptionWrapper(icons.flights, '✈️ No Convenience Fees on Flights', 'Enjoy hassle-free flight bookings without any extra fees! Save more compared to other platforms. ', 'no__conv')}
						${generateDescriptionWrapper(icons.conciergeIcon, '🛂 Assistance with Visa & Web Check-In', 'Get professional support for your visa applications 📄 and smooth web check-in assistance 🖥️ for a stress-free travel experience.', 'mini__hide')}
						${generateDescriptionWrapper(icons.experiences2, '🗺️ Five Free Personalized Itineraries', 'Receive 5 tailor-made travel plans 🌟 based on your interests—whether it’s adventure in New Zealand ⛰️, luxury in Turkey, or cultural exploration in Finland and Japan 🏯', 'group__discounts')}
						${generateDescriptionWrapper(icons.aiBuddyIcon, '💬 Exclusive WhatsApp & Travel Buddy Group Access', 'Connect with fellow travelers 🤝 in dedicated groups to share experiences 🧳, get tips, and access exclusive deals 💸.', 'aiHide')}
						${generateDescriptionWrapper(icons.conciergeIcon, '🎉 Free Entry to Offline & Online Meetups', 'Join engaging meetups 🎤 both online and offline! Network, learn from travel experts 👩‍💼, and build connections within a vibrant community 🌐')}
						${generateDescriptionWrapper(icons.experiences2, '🎁 Complimentary Benefits', 'Enjoy perks like spa treatments 💆‍♂️, snorkeling sessions 🤿, complimentary breakfasts 🥐, and more—adding luxury and value to your adventures! 🌟')}
						${generateDescriptionWrapper(icons.unlimitedGroupsIcon, '🤖AI BUDDY', 'Unlock the boundless potential of your travels with our AI Buddy, effortlessly generating limitless itineraries tailored to your preferences and desires 🤝')}
					</div>
					<div class="chat-unlimited">
						<div class="chat-unlimited-title">
							<span>${icons.chatLocalIcon}</span>
							<h3>Unlimited Chat With Local Influencers</h3>
						</div>
						<div class="local-influencers-profile">
							<ul class="influencer-profile-image"></ul>
						</div>
					</div>
					${chatUnlimited}
					<div class="chat-unlimited group-trips">
						<div class="chat-unlimited-title group-trips-title">
							<span><i class="fa-solid fa-handshake"></i></span>
							<h3>Flat 10% off on trending trips for premium user</h3>
						</div>
						<div class="premium-group-trips-wrapper"></div>
					</div>
				</div>
			`;
                
		}
		return renderItem;
	}

	function renderPackages(icons, data) {
		currencyCode = "INR";
		oneMonthPrice = "99";
		threeMonthPrice = "299";
		oneYearPrice = "1999";
		faultVal = false;

		if (data.priceLists && data.priceLists.Currency) {
			currencyCode = data.priceLists.Currency;
			oneMonthPrice = data.priceLists['One Week'];
			oneMonthPrice = parseFloat(oneMonthPrice.replaceAll(',', '')).toFixed(0);
			faultVal = (oneMonthPrice == 'NaN') ? true : false;

			threeMonthPrice = data.priceLists['One Month'];
			threeMonthPrice = parseFloat(threeMonthPrice.replaceAll(',', '')).toFixed(0);
			faultVal = (threeMonthPrice == 'NaN') ? true : false;

			oneYearPrice = data.priceLists['One Year'];
			oneYearPrice = parseFloat(oneYearPrice.replaceAll(',', '')).toFixed(0);
			if (oneYearPrice == 'NaN') {
				faultVal = true;
			}
		}
		//IF THE VALUE ENTERED IN THE EXCEL IS NOT PROPER DECIMAL VALUE, THEN WE SET IT TO INR PRICES
		if (faultVal) {
			currencyCode = "INR";
			oneMonthPrice = "99";
			threeMonthPrice = "299";
			oneYearPrice = "1999";
		}
		
        productIdOne = "tbd_traveler_one_week_plus1";
        productIdTwo = "tbd_traveler_one_month";
        productIdThree = "tbd_traveler_one_year";
        
        if (useAppBilling) {
            oneMonthPrice = "499";
            threeMonthPrice = "950";
            oneYearPrice = "2999";
            if (isIOS()) {
                productIdOne = "com.beatravelbuddy.travelbuddy.monthly_plus1";
                productIdTwo = "com.beatravelbuddy.travelbuddy.halfyearly";
                productIdThree = "com.beatravelbuddy.travelbuddy.yearly";
            }
            else if (isAndroid()) {
                productIdOne = "tbd_traveler_one_month";
                productIdTwo = "tbd_traveler_three_month_plus1";
                productIdThree = "tbd_traveler_one_year"
            }
        }
        
		return `
        <div class="pricing-card-wrapper">
            <div class="pricing-card" data-packageid="${productIdOne}" data-currency="${currencyCode}" data-price="${oneMonthPrice}" id="premium-mini">
                <div class="pricing-card-inside">
                    <h3>TB MINI</h3>
                    <div class="striked-text">
                        <p>${currencyCode} 450</p>
                    </div>
                    <h3>${currencyCode} ${oneMonthPrice}</h3>
                    <p>Weekly</p>
                </div>
            </div>
            <div class="pricing-card pricing-card-active" data-packageid="${productIdThree}" data-currency="${currencyCode}" data-price="${oneYearPrice}" id="premium-super">
                <div class="pricing-card-inside">
                    <h3>TB SUPER</h3>
                    <div class="striked-text">
                        <p>${currencyCode} 6000</p>
                    </div>
                    <h3>${currencyCode} ${oneYearPrice}</h3>
                    <span>Yearly</span>
                </div>
            </div>
            <div class="pricing-card" data-packageid="${productIdTwo}" data-currency="${currencyCode}" data-price="${threeMonthPrice}" id="premium-pro">
                <div class="pricing-card-inside">
                    <h3>TB PRO</h3>
                    <div class="striked-text">
                        <p>${currencyCode} 999</p>
                    </div>
                    <h3>${currencyCode} ${threeMonthPrice}</h3>
                    <span>Monthly</span>
                </div>
            </div>
        </div>`;
        
	}

	function renderSubscriptionInfo(data) {
		if (data.object.totalMonths) {
			subscriptionPlan = data.object.totalMonths;
		}
		else {
			subscriptionPlan = data.object.subscriptionLabel;
		}

		subscriptionEndsOn = data.object.subscriptionEndTime;
		subscriptionOrderId = data.object.orderId;

		// Set subscriptionEndsOn in local storage
		localStorage.setItem('subscriptionEndsOn', subscriptionEndsOn);
		localStorage.setItem('subscriptionName', data.object.subscriptionLabel);

		renderItem =
			'<div class="premium__packages-box subscribed_info_box"> <div class="premium__packages-item active"> <div class="premium__package-item__subTitle" style="font-size: 14px;font-weight: bold;">Current plan</div><div class="premium__package-item__title">' + subscriptionPlan + '</div> <div class="premium__package-item__price-new" style="font-size: 20px;"> Renew On: <span class="premium__price"> </span> ' + subscriptionEndsOn + '</div> <div class="premium__package-item_orderId">' + subscriptionOrderId + '</div> </div></div>';

		return renderItem;
	}

	function renderHeaderUrl(type) {
		//Check if current url has localhost
        
        return type == '' ? isServiceProvider() ? icons.bogoIconSp : icons.bogoHeader : '<img src="/view/assets/img/premium-masthead.png" alt="premium header image"></img>';
	}
    
    if (isServiceProvider()) {
        jsInit('fetchServices', {
            latitude: userLatLong['latitude'],
            longitude: userLatLong['longitude'],
            pageNumber: '0',
        }, 'premiumPage');
    }
    else {
        // For Trending group trips
        
        jsInit('getExperiences', {"filter":{
            "trending":{
                "type": "group_trips"
            }
        }}, "trendingGroupTripsPremium");
        payload = (localStorage.getItem('userLat')) ? { "lat": localStorage.getItem('userLat'), "lng": localStorage.getItem('userLng'), nearby: true } : { "lat": "28.5355", "lng": "77.39", nearby: true };
        jsInit('fetchAllInfluencers', payload , "premium");
    }*/
	
}

function renderLogin(state, data, from) {
	loaderMain('formSubmit', false); //Need to call this here otherwise it will have to be called multiple times

	if (state == 'init') {
		cleanDrawer();

		//Base Setup & Login Form
		renderLoginForm();

		//Sign Up Form
		renderSignUpForm();
		passwordStrengthControl();
		jsInit('fetchCountries', '', 'signUp');

		//OTP Form
		renderOTPForm('#main__drawer .drawerBody', '');

		//Reset Password Form
		renderResetPassForm();

		//Forgot Password Form
		jQuery('#main__drawer .drawerBody .login__view').append('<div class="forgotPassword__form-box"></div>');
	}
	else if (state == 'Outer Init') {
		if (guestMaster('noLogin')) {
			jQuery('#app').append('<div class="login__outer-view"></div>');
		}
	}
	else if (state == 'renderCountries') {
		data = data.object;
		renderCountries(data, jQuery('#signUp__countryCode'));
	}
	else if (state == 'manageLogin') {
		console.log(data);
		//Manage Errors
		if (data.responseCode !== 200) {
			//SlideDown and fadeOut in 5 seconds
			//jQuery('.login__form-box .form-err').html(data.errorMessage).slideDown().delay(5000).fadeOut();
			toast(data.errorMessage);
		}
		else {
			if (from == 'login') {
				signInType = 'EMAIL';
			}
			else if (from == 'loginGoogle') {
				signInType = 'GOOGLE';
			}
			else if (from == 'loginFacebook') {
				signInType = 'FACEBOOK';
			}
			else if (from == 'loginApple') {
				signInType = 'APPLE';
			}
			if (manageUserProfile('read', 'userType') == 0) {
				userType = 'Service Provider';
			}
			else {
				userType = 'Traveler';
			}

			request = data.request;
			data = data.object;
			token = data.token;

			tokenMaster('set', token);
			welcomeMessage(data, request);
			manageUserProfile('clean');
			guestMaster('clean');
			fbEvent('login', { userType: userType, signInType: signInType });
			
			jQuery('.drawer-kapat').trigger('click');
			jQuery('.feed__login-sticky').remove();
			toast('Login successful');
			$('.hamburger__menu-box li[data-redirect="login"]').remove();
			if (!window.location.href.includes('flights') && !window.location.href.includes('ai-plan-trip')) {
				setTimeout(() => { reloadWindowWithIosCheck() }, 500);
			}
			else if (window.location.href.includes('ai-plan-trip')) {
				jQuery('.sub-menu').append('<li data-redirect="logout">Logout</li>');
				showHidePaxReviewSheet('hide');
			}
			else {
				jQuery('.sub-menu').append('<li data-redirect="logout">Logout</li>');
				showHidePaxReviewSheet('hide');
				if (window.location.href.includes('flights-search')) {
					searchFlights('searchFlightsAfterLogin');
					showFlightsLoaders('loginSearch');
				}
			}
		}
	}
	else if (state == 'manageForgotPass') {
		console.log(data);

		//Manage Errors
		if (data.responseCode !== 200) {
			//SlideDown and fadeOut in 5 seconds
			jQuery('.resetPass__form-box .form-err').html('No accounts found with this credential').slideDown().delay(5000).fadeOut();
		}
		else {
			email = jQuery('#resetPass__email').val().toLowerCase();
			jQuery('.otp__view').attr('data-email', email).attr('data-source', 'forgotPass');
			jQuery('.otp__view-box p span.otp__email-value').attr('data-value', email).html(email);

			jQuery('.reset__view').hide();
			jQuery('.otp__view').show('slide', { direction: 'left' }, 300);
		}
	}
	else if (state == 'manageMatchOtpForgot') {
		console.log(data);

		if (data.responseCode !== 200) {
			//SlideDown and fadeOut in 5 seconds
			jQuery('.otp__view .form-err').html(data.errorMessage).slideDown().delay(5000).fadeOut();

			//Reset OTP Box
			jQuery('.otp-field input').each(function () {
				jQuery(this).val('');
				jQuery(this).removeAttr('disabled');
				jQuery(this).removeClass('disabled');
			});
		}
		else {
			//Clean the OTP Box
			jQuery('.otp__view').attr('data-email', '').attr('data-source', '');
			jQuery('.otp__view-box p span.otp__email-value').attr('data-value', '').html('');
			jQuery('#resetPass__form').attr('data-state', 'reset');

			//Change Views
			localStorage.setItem('tempToken', data.object.token);
			jQuery('.otp__view').hide();
			jQuery('.form__resetPass').show().prev('.form__row').hide();
			jQuery('.reset__view').show('slide', { direction: 'left' }, 300);
		}
	}
	else if (state == 'manageResetPass') {
		console.log(data);

		//Manage Errors
		if (data.responseCode !== 200) {
			//SlideDown and fadeOut in 5 seconds
			jQuery('.resetPass__form-box .form-err').html(data.errorMessage).slideDown().delay(5000).fadeOut();
		}
		else {
			jQuery('.reset__view').hide();
			jQuery('.login__view').show('slide', { direction: 'left' }, 300);
			jQuery('#resetPass__form').attr('data-state', 'forgot');
			jQuery('.form__resetPass').hide().prev('.form__row').show();

			toast('Password reset successfully. Please login with your new password.');
		}
	}
	else if (state == 'manageUniqueCheck') {
		console.log(data);

		//Manage Errors
		if (data.responseCode !== 200) {
			//SlideDown and fadeOut in 5 seconds
			jQuery('#signUp__form .form-err').html(data.errorMessage).slideDown().delay(5000).fadeOut();
		}
		else {
			//Check if the country code is indian or international
			if (data.request.countryCode == '+91') {
				jQuery('.login__view').hide();
				jQuery('.otp__view').show('slide', { direction: 'left' }, 300);
				jQuery('.otp__view').attr('data-source', 'signup');
				jQuery('.otp__view').attr('data-otpId', data.object.otpId);

				renderOnboarding('sendOTP', data.request.phoneNumber, 'sendSignUpOtp');
			}
			else {
				firebaseOTP('sendSMS', {
					phoneNumber: data.request.phoneNumber,
					dialCode: data.request.countryCode,
					state: 'signUp',
					payload: data.request
				});
			}
		}
	}

	function welcomeMessage(data, request) {
		if (data.isNewUser) {
			jsInit('initiateChat', {
				chatType: 'personal',
				other: {
					userId: 'd1b1080fc18bcfcbebcaa429f77c087ae819c177e4478884ff6f01c68b0c9897',
					userName: 'Travel Buddy',
					profileImage: '/uploads/display_pictures/91911683610768748.jpg'
				},
				isNewUser: true,
				self: { userName: request.name, profileImage: request.imageUrl }
			});
		}
	}

	function renderLoginForm() {
		jQuery('#main__drawer').addClass('loginDrawer');
		jQuery('#main__drawer .drawerBody').html('<div class="login__view"><h3>Join Travel Buddy</h3><div class="login__form-box"><form id="login__form"><div class="form__row"><div class="form__column"><label for="login__email">Email or Phone Number</label><input type="text" name="login__email" id="login__email" placeholder="rahul.sharma@gmail.com"></div></div><div class="form__row"><div class="form__column"><label for="login__email">Password</label><input type="password" name="login__password" id="login__password" placeholder="*****************"><span class="login__forgotPassword">Forgot your password?</span><span class="show-hide-password">' + icons.passwordShow + '</span></div></div><div class="form__row form-err"></div><div class="form__row form__submit"><div class="form__column"><button type="submit" class="btn btn--primary">Login</button><span class="login__switch-SignUp">Don’t have an account? <b>Sign Up</b></span></div></div></form><div class="login__social-box"><span>Or continue with</span><div class="login__social"></div></div></div></div>'
		);

		manageSocialLogin('init');

		//Take .firebaseui-page-provider-sign-in element and duplicate it to .login__social
		// On if its not android & iOS
		if (!isAndroid() && !isIOS()) {
			checkExist = setInterval(function() {
				if (jQuery('.firebaseui-page-provider-sign-in').length) {
					jQuery('.login__social').append(jQuery('.firebaseui-page-provider-sign-in'));
					clearInterval(checkExist);
					loaderMain('global', false);
					loaderMain('firebase', false);
				}
				else {
					if (jQuery('.login__social .feed__loading').length == 0) {
						loaderMain('firebase', true);
					}
				}
			}, 200);
		}
	}

	function renderSignUpForm() {
		jQuery('#main__drawer .drawerBody .login__view').append('<div class="signUp__form-box"><form id="signUp__form"><div class="form__row"><div class="form__column"><label for="signUp__name">Your Name</label><input type="text" name="signUp__name" id="signUp__name" placeholder="Rahul Sharma"></div></div><div class="form__row"><div class="form__column"><label for="signUp__email">Email</label><input type="text" name="signUp__email" id="signUp__email" placeholder="rahul.sharma@gmail.com"></div></div><div class="form__row"><div class="form__column"><label for="signUp__phone">Phone Number</label><div class="form__phone"><select name="signUp__countryCode" id="signUp__countryCode"><option value="+91">+91</option></select><input type="number" name="signUp__phone" id="signUp__phone" placeholder="9800000000"></div></div></div><div class="form__row"><div class="form__column"><label for="signUp__password">Password</label><input type="password" data-strength name="signUp__password" id="signUp__password" placeholder="*****************"><span class="show-hide-password">' + icons.passwordShow + '</span><div class="password__guide"><h6>Please enter a stronger password. Password can contain the following:</h6><ul><li>&nbsp;Lowercase &amp; Uppercase</li><li>&nbsp;Number (0-9)</li><li>&nbsp;Special Character (!@#$%^&amp;*)</li><li>&nbsp;At least 8 Character</li></ul></div></div></div><div class="form__row form__terms"><div class="form__column"><p>By signing up, you agree to the travel buddy<br><a class="redirect" value="terms">Terms & Conditions</a>and<a class="redirect" value="privacy">Privacy Policy</a></p></div></div><div class="form__row form-err"></div><div class="form__row form__submit"><div class="form__column"><button type="submit" class="btn btn--primary g-recaptcha" data-sitekey="6LfoX5glAAAAAGTL-DkquTJVBWWMXoxU6qTHwUkM">Sign Up</button><span class="login__switch-Login signUp__login">Don’t have an account? <b>Login</b></span></div></div></form></div>');
	}

	function renderResetPassForm() {
		jQuery('#main__drawer .drawerBody').append('<div class="reset__view"><h3>Forgot Password</h3><p class="reset__subTitle">Enter your phone number or email address below to retrieve the password</p><div class="resetPass__form-box"><form id="resetPass__form"><div class="form__row"><div class="form__column"><label for="resetPass__email">Login</label><input type="text" name="resetPass__email" id="resetPass__email" placeholder="Email or Phone"></div></div><div class="form__resetPass"><div class="form__row form__rown"><div class="form__column"><label for="resetPass__password">New Password</label><input type="password" name="resetPass__password" id="resetPass__password" placeholder="**********"></div></div><div class="form__row form__rown"><div class="form__column"><label for="resetPass__confirmPassword">Confirm Password</label><input type="password" name="resetPass__confirmPassword" id="resetPass__confirmPassword" placeholder="**********"></div></div></div><div class="form__row form-err"></div><div class="form__row form__submit"><div class="form__column"><button type="submit" class="btn btn--primary">Submit</button><span class="login__switch-Login"><b>Back to Login</b></span></div></div></form></div></div>');
	}
}

function renderOTPForm(where, value) {
	jQuery(where).append('<div class="otp__view"><div class="otp__masthead">' + icons.otpHeader + '</div><div class="otp__view-box"><div class="otp__header">Enter your OTP</div><p>We have sent you an OTP on <span data-type="email" data-value="' + value + '" class="otp__email-value">' + value + '</span><span class="otp__email-edit">' + icons.edit + '</span></p></div><div class="otp__container"><div class="otp-field otp-field__large"><input type="number" maxlenght="6" max="999999" placeholder="******"></div></div><div class="otp__resend disabled">Didn’t recieve OTP?<span>Resend <span class="otp__resend_in" data-time="60">in 60s</span></span></div><div class="form__row form-err"></div><div class="form__row form__submit"><div class="form__column"><button type="submit" class="btn btn--primary">Verify</button></div></div></div>');

	resendOTPInterval();
}

function renderCountries(data, where) {
	// if (!jQuery(where) === ('#editProfile__countryCode')) {
	jQuery(where).html('');

	data.forEach((country) => {
		code = processCountryCode(country.code);
		jQuery(where).append('<option value="' + country.code + '">' + code + ' - ' + country.country + '</option>');
	});

	if (where == '#editProfile__countryCode') {
		setTimeout(() => {
			jQuery(where).val(manageUserProfile('read', 'countryCode'));
		}, 1000);
	}

	setCountryCode(where);
	// }

	function processCountryCode(code) {
		//If code doesn't have +, add it
		if (code.charAt(0) != '+') {
			code = '+' + code;
		}

		return code;
	}
}

function renderOnboarding(state, data, element) {
	if (state == 'edit-location') {
		renderLocations('init', '', '#edit__location');
	}
	return;
	/*if (state == 'init') {
		genderField = renderGenderField(manageUserProfile('read', 'gender'), icons);
		phoneField = renderPhoneField(manageUserProfile('read', 'phoneNumber').trim());
		emailField = renderEmailField(manageUserProfile('read', 'email'));
		nameField = renderNameField(manageUserProfile('read', 'name'));
		typeField = renderTypeField(manageUserProfile('read', 'userType'), icons);
		if (manageUserProfile('read', 'profilePic') == '/filters:format(webp)/fit-in/200x200/') {
			imageField = `<img src="https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_pictures/dummy.png" alt="Profile Picture">`
		}
		else {
			imageField = renderImageField(manageUserProfile('read', 'profilePic'));
		}
		servicesList = renderServicesList();

		jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="cancel__onboarding" style="position: relative;"><svg class="cancel_onboarding" style="position: absolute; right: 10px; top: 10px; cursor: pointer" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="red" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div><div class="onboarding__page"><div class="onboarding__page-title"><h4>Join the Travel Buddy Community</h4><h1>Help us tailor a better Experience for you</h1></div><div class="onboarding__form-box"></div></div>');

		jQuery('#secondary .secondary__tab:last-child .drawerBody .onboarding__form-box').html('<form id="onboarding__form"><div class="form__row form__profile-pic"><div class="form__column"><div class="form__profile-pic-box"><div class="form__profile-pic-box__img">' + imageField + '<div class="form__profile-pic-box__upload"><input type="file" name="onboarding__dp" id="onboarding__dp" accept="image/*" multiple="multiple" onChange="profileImageShow(this);"><label for="onboarding__dp">' + icons.edit + '</label></div></div></div></div></div>' + nameField + emailField + phoneField + typeField + '<div class="form__row form__row-services"><div class="form__column"><label for="onboarding__services">Services you provide (select up to 3)</label><div class="form__checkbox checkbox__services">' + servicesList + '</div></div></div><div class="form__row"><div class="form__column"><label for="">I am based out of</label><div class="form__location"><input type="text" name="onboarding__location" id="onboarding__location" placeholder="Home location" value="' + manageUserProfile('read', 'location') + '"><span>' + icons.locationArrow + '</span></div></div></div>' + genderField + '<div class="form__row"><div class="form__column"><label for="onboarding__type">I am interested in (select up to 5)</label><div class="form__checkbox checkbox__interests"></div><div class="form__checkbox-view__more">View More</div></div></div><div class="form__row form-err"></div><div class="form__row form__hidden"><input type="hidden" name="onboarding__latitude" id="onboarding__latitude" value="" /><input type="hidden" name="onboarding__longitude" id="onboarding__longitude" value="" /></div><div class="form__row form__submit"><div class="form__column"><button type="submit" class="btn btn--primary">Get Started</button></div></div></form>');

		if (jQuery('#onboarding__countryCode').attr('data-update') == 'true') {
			jsInit('fetchCountries', '', 'onboarding');
		}

		jsInit('fetchInterests', '', 'onboarding');
		// jsInit('fetchServicesList', '', 'onboarding');
		getLocation('show', 'onboarding');

		// Check if Phone Input or Email Field is disabled
		if (jQuery('#onboarding__phone').prop('disabled')) {
			jsInit('checkRefer', {phoneNumber: manageUserProfile('read', 'phoneNumber')});
		}
		else if (jQuery('#onboarding__email').prop('disabled')) {
			jsInit('checkRefer', {});
		}
	}
	else if (state == 'renderCountries') {
		data = data.object;
		renderCountries(data, '#onboarding__countryCode');
	}
	else if (state == 'renderInterests') {
		console.log(data);

		if (data.responseCode != 200) {
			toast(data.responseMessage);
		}
		else {
			data = data.object;

			data.forEach((interest) => {
				userInterests = manageUserProfile('read', 'interests');
				checked = '';

				if (userInterests.length > 0) {
					userInterests.forEach((userInterest) => {
						if (userInterest.interest == interest.interest) {
							checked = 'checked';
						}
					});
				}

				jQuery('.onboarding__form-box .checkbox__interests').append('<div class="checkbox-item ' + checked + '"><label for="onboarding__interest-' + interest.interest + '">' + interest.interest + '</label><input type="checkbox" id="onboarding__interest-' + interest.interest + '" name="onboarding__interest[]" value="' + interest.interest + '" ' + checked + '></div>');
			});
		}
	}
	else if (state == 'location-init') {
		renderLocations('init', '', '#onboarding__location');
	}
	else if (state == 'edit-location') {
		renderLocations('init', '', '#edit__location');
	}
	else if (state == 'sendOTP' || element == 'sendSignUpOtp') {
		console.log(data);
		if (data.responseCode != 200) {
			if (data.responseCode == 453) {
				renderOnboarding('renderBackPermissions');
			}

			jQuery('#onboarding__phone').addClass('error');
			toast(data.errorMessage);
		}
		else {
			if (element == 'sendSignUpOtp') {
				redirect('otp', data);
			}
			else {
				redirect('otp', jQuery('#onboarding__phone').val());
			}
		}

		console.log('OTP Sent');
		setTimeout(() => {
			jQuery('.feed__loading').each(function () {
				jQuery(this).remove();
			});
		}, 1500);
	}
	else if (state == 'renderBackPermissions') {
		renderPermissionBox('init', 'onboardingBack');
	}
	else if (state == 'renderServicesList') {
		console.log(data);
		services = data.object.services;

		services.forEach((service) => {
			//Remove spaces and slashes from service name
			serviceName = service.serviceName.replace(/\s+/g, '');

			jQuery('.checkbox__services').append('<div class="checkbox-item"><label for="onboarding__services-' + serviceName + '"><img src="' + imageBaseUrl + '/' + service.serviceIconUrl + '"> ' + service.serviceName + '</label><input type="checkbox" id="onboarding__services-' + serviceName + '" name="onboarding__services" value="' + serviceName + '"></div></div>');
		});

		//Check if service provider radio is checked
		if (jQuery('#onboarding__type-provider').is(':checked')) {
			jQuery('.form__row-services').slideDown();
		}
	}
	else if (state == 'updatePhoneNumber') {
		console.log(data);
		if (data.responseCode != 200) {
			//SlideDown and fadeOut in 5 seconds
			toast(data.errorMessage);
			jQuery('.otp__view .form-err').html(data.errorMessage).slideDown().delay(5000).fadeOut();

			//Reset OTP Box
			jQuery('.otp-field input').each(function () {
				jQuery(this).val('');
				jQuery(this).removeAttr('disabled');
				jQuery(this).removeClass('disabled');
			});
		}
		else {
			//Save the updated phone number in local storage
			localStorage.setItem('updatedPhoneState', true);
			localStorage.setItem('updatedPhoneNumber', jQuery('#onboarding__phone').val());
			localStorage.setItem('updatedCountryCode', jQuery('#onboarding__countryCode').val());

			jQuery('.secondary__tab.otpBody .drawer__back').trigger('click');

			//Disable the phone number & country code fields now that the OTP has been verified, also change the verify button to a done button
			jQuery('#onboarding__phone').attr('disabled', 'disabled');
			jQuery('#onboarding__phone').addClass('disabled');
			jQuery('#onboarding__phone').removeClass('error');
			jQuery('#onboarding__phone').addClass('verified');
			jQuery('#onboarding__phone').parents('.form__phone').next('.verifyPhone').removeClass('verify').addClass('verified').html('Verified');
			jQuery('#onboarding__countryCode').attr('disabled', 'disabled');
		}
	}
	else if (state == 'checkRefer') {
		console.log(data);
		// Check & Add the Tracking Pixel of Offer 18
		if (!data.dataPresentInDeactivatedAccount) {
			jQuery('#secondary .secondary__tab:last-child .drawerBody .cancel__onboarding').append('<img src="https://travelbuddy.o18.link/p?m=20762&t=i&gb=1" width="0px" height="0px">');
		}
	}
	else if (state == 'theEnd') {
		console.log(data);

		if (data.responseCode != 200) {
			//SlideDown and fadeOut in 5 seconds
			jQuery('.otp__view .form-err').html(data.errorMessage).slideDown().delay(5000).fadeOut();

			//Reset OTP Box
			jQuery('.otp-field input').each(function () {
				jQuery(this).val('');
				jQuery(this).removeAttr('disabled');
				jQuery(this).removeClass('disabled');
			});
			toast(data.errorMessage);
		}
		else {
			console.log(element);
			if (element !== 'onboarding' && element !== 'updateOnboarding') {
				localStorage.setItem('updatedPhoneNumber', jQuery('#signUp__phone').val());
				localStorage.setItem('updatedCountryCode', jQuery('#signUp__countryCode').val());

				console.log('Updating token');
				tokenMaster('set', data.object.token);
				guestMaster('clean');
			}
			else if (element == 'updateOnboarding' && !localStorage.getItem('onboarding__complete')) {
				return;
			}

			loaderMain('global', false);
			manageUserProfile('clean');
			if (manageUserProfile('read', 'userType') == 0) {
				userType = 'Service Provider';
			}
			else {
				userType = 'Traveler';
			}
			

			setTimeout(() => { redirect('home') }, 500);
		}
	}

	function renderServicesList() {
		renderItem = '<div class="checkbox-item"><label for="onboarding__services-Hotel/Homestay/B&amp;B">' + icons.travel_service + ' Hotel/ Homestay/ B&amp;B</label><input type="checkbox" id="onboarding__services-Hotel/Homestay/B&amp;B" name="onboarding__services" value="hotel"></div>';
		renderItem += '<div class="checkbox-item"><label for="onboarding__services-Transport">' + icons.transport + ' Transport</label><input type="checkbox" id="onboarding__services-Transport" name="onboarding__services" value="transport"></div>';
		renderItem += '<div class="checkbox-item"><label for="onboarding__services-Translation">' + icons.translation + ' Translation</label><input type="checkbox" id="onboarding__services-Translation" name="onboarding__services" value="translator"></div>';
		renderItem += '<div class="checkbox-item"><label for="onboarding__services-Trek/TourGuide/Sightseeing">' + icons.trek + ' Trek/TourGuide/Sightseeing</label><input type="checkbox" id="onboarding__services-Trek/TourGuide/Sightseeing" name="onboarding__services" value="guide"></div>';
		renderItem += '<div class="checkbox-item"><label for="onboarding__services-TravelAgent">' + icons.travel + ' TravelAgent</label><input type="checkbox" id="onboarding__services-TravelAgent" name="onboarding__services" value="agent"></div>';
		renderItem += '<div class="checkbox-item"><label for="onboarding__services-Hostel">' + icons.hostel + ' Hostel</label><input type="checkbox" id="onboarding__services-Hostel" name="onboarding__services" value="hostel"></div>';

		return renderItem;
	}

	function renderPhoneField(phone) {
		console.log(phone);
		disabled = '';
		verified = 'verify';
		countryCode = '';
		updateCountryCode = true; //This is needed to stop adjusting and popuplating the country code dropdown

		if (phone == null) {
			phone = '';
		}

		//Check if the user has already updated their phone number
		if (localStorage.getItem('updatedPhoneState') || phone !== '') {
			disabled = 'disabled';
			verified = 'verified';

			if (phone == '') {
				phone = localStorage.getItem('updatedPhoneNumber');
			}
			// countryCode = manageCountryCode(localStorage.getItem('updatedCountryCode'));
		}

		if (countryCode) {
			countryCode = '<option value="' + countryCode + '" selected>' + countryCode + '</option>';
			updateCountryCode = false;
		}
		else {
			countryCode = '<option value="+91">+91 - India</option>';
		}

		reponse = '<div class="form__row"><div class="form__column"><label for="onboarding__phone">Phone Number</label><div class="form__phone"><select name="onboarding__countryCode" id="onboarding__countryCode" data-update="' + updateCountryCode + '" ' + disabled + '>' + countryCode + '</select><input type="number" name="onboarding__phone" class="' + disabled + '" id="onboarding__phone" autocomplete="off" placeholder="9800000000" value="' + phone + '" ' + disabled + '></div><span class="verifyPhone ' + verified + '">' + verified + '</span></div></div>';

		return reponse;
	}

	function renderNameField(name) {
		disabled = 'disabled';

		if (name == null) {
			name == '';
			disabled = '';
		}

		response = '<div class="form__row"><div class="form__column"><label for="onboarding__name">Your Name</label><input type="text" name="onboarding__name" id="onboarding__name" placeholder="Elon Musk" value="' + name + '" ' + disabled + '></div></div>';

		return response;
	}

	function renderEmailField(email) {
		disabled = 'disabled';

		if (email == null) {
			email == '';
			disabled = '';
		}

		response = '<div class="form__row"><div class="form__column email"><label for="onboarding__email">Your Email</label><input type="text" name="onboarding__email" id="onboarding__email" placeholder="elon@musk.com" value="' + email + '" ' + disabled + '></div></div>';

		return response;
	}

	function renderTypeField(type, icons) {
		if (type == 0 || type == null) {
			traveller = 'checked';
			provider = '';
		}
		else if (type == 1) {
			traveller = '';
			provider = 'checked';
		}

		response = '<div class="form__row"><div class="form__column"><label>I am a</label><div class="form__checkbox checkbox__type"><div class="checkbox-item ' + traveller + '"><label for="onboarding__type-traveller">' + icons.traveller + ' Traveler</label><input type="radio" id="onboarding__type-traveller" name="onboarding__type" value="0" ' + traveller + '></div><div class="checkbox-item ' + provider + '"><label for="onboarding__type-travel__provider">' + icons.provide_service + ' Travel Provider</label><input type="radio" id="onboarding__type-travel__provider" name="onboarding__type" value="1" ' + provider + '></div></div></div></div>';

		return response;
	}

	function renderImageField(image, icons) {
		if (image) {
			renderItem = '<img src="' + renderUserProfileImage(image) + '" alt="Profile Picture">';
		}
		else {
			renderItem = icons.person;
		}

		return renderItem;
	}

	function renderGenderField(gender, icons) {
		male = '';
		female = '';
		nonBinary = '';

		if (gender == 0 || gender == null) {
			male = 'checked';
		}
		else if (gender == 1) {
			female = 'checked';
		}
		else if (gender == 2) {
			nonBinary = 'checked';
		}

		response = '<div class="form__row"><div class="form__column"><label>My Gender is</label><div class="form__checkbox checkbox__gender"><div class="checkbox-item ' + male + '"><label for="onboarding__gender-male">' + icons.male + ' Male</label><input type="radio" id="onboarding__gender-male" name="onboarding__gender" value="0" ' + male + '></div><div class="checkbox-item ' + female + '"><label for="onboarding__gender-female">' + icons.female + ' Female</label><input type="radio" id="onboarding__gender-female" name="onboarding__gender" value="1" ' + female + '></div><div class="checkbox-item ' + nonBinary + '"><label for="onboarding__gender-nonBinary">' + icons.nonBinary + ' Non Binary</label><input type="radio" id="onboarding__gender-nonBinary" name="onboarding__gender" value="2" ' + nonBinary + '></div></div></div></div>';

		return response;
	}*/
}


function renderChat(state, data, element) {
	//if (window.location.href.includes('dev.beatravelbuddy.com') || window.location.href.includes('localhost') || isIOS() || isAndroid() || isPwa()) {
	if (true) {
		if (state == 'init') {
			if (!guestMaster('noLogin')) {
				
				var getTestersEmail = returnTestersEmail();
				if (/*getTestersEmail.includes(manageUserProfile('read', 'email'))*/ true) {
					var currentUrl = window.location.href;
					var queryString = '';
					// Get user data to pass
					if (!guestMaster()) {
						var userData = {
							userId: manageUserProfile('read', 'userId'),
							userName: manageUserProfile('read', 'name'),
							userEmail: manageUserProfile('read', 'email'),
							userType: manageUserProfile('read', 'userType'),
							isVerified: manageUserProfile('read', 'isVerified'),
							location: manageUserProfile('read', 'location'),
							profilePic: manageUserProfile('read', 'profilePic')
						};
						// Encode the data as URL parameters
						queryString = Object.keys(userData)
							.map(key => encodeURIComponent(key) + '=' + encodeURIComponent(userData[key]))
							.join('&');
						console.log("Query String: ", queryString);
					}
					openNewChat(queryString);
					// if (currentUrl.includes('localhost')) {
					// 	window.open('http://localhost:3000/newChat?' + queryString, '_self');
					// }
					// else if (currentUrl.includes('dev.beatravelbuddy.com')) {
					// 	window.open('https://dev.beatravelbuddy.com/newChat?' + queryString, '_self');
					// }
					// else {
					// 	window.open('https://beatravelbuddy.com/newChat?' + queryString, '_self');
					// }
					return;
				}
				
				jQuery('#main').append('<div id="main__chat-box"><div class="css-1n2mv2k"><div class="css-btd4on"><div class="appBar css-i6s8oy"><div class="css-k008qs"><p class="chatTitle css-9l3uo3">TravelBuddy Chat</p></div><div class="refresh_chat">Refresh '+ icons.refresh + '</div><div class="chat__header-search" style="width:1.5rem">' + icons.search + '</div></div><div class="css-w017iw"><div class="css-f6loyt"><div class="css-1vq1j6r">' + icons.chat2 + ' </div><p class="start-new-chat css-1ymtwa0">Start a New Chat / Group</p></div></div><div class="chat__tabs"><div id="all">All</div><div id="personal">Personal</div><div id="groups">Groups</div></div><div class="chats__container"></div><div class="singleChat__container"></div><div class="startNewChat__container"></div><div class="createGroupChat__container"><form id="createGroupChat"><div class="createGroupChat-stepOne"></div><div class="createGroupChat-stepTwo"></div></form></div><div class="group__members-section"></div><div class="singleChat__zoomIn"><div class="singleChat__zoomIn-overlay"></div><div class="singleChat__zoomIn-img"></div></div></div></div></div>');

				renderChat('renderCreateGroupChat');
				renderChat('renderStartNewChat');
				renderChat('renderGroupMembersPage')
				renderChat('singleChat', data);

				setTimeout(function () {
					if (localStorage.getItem('chat__open')) {
						if (window.location.href.includes('/chat')) {
							loaderMain('chatNewAnim');
						}
						jsInit('getDeltaDataChats', '', '');
					}
					else {
						jsInit('fetchChatUsers', '');
						jsInit('havala', { userId: manageUserProfile('read', 'userId') }, 'chat');
					}
					
					manageUserChat('initializeNode');
				}, 1000);
			}
		}
		else if (state == 'renderChatUsers') {
			if (data) {
				chatContainer = jQuery('#main__chat-box .chats__container');
				if (localStorage.getItem('chat__open')) {
					chats = data;
					if (element != 'firebase') {
						chatContainer.html('');
					}
				}
				else {
					chats = data.chatArr;
				}
                
                allChatsHtml = '';
				groupChatsHtml = '';
				personalChatsHtml = '';
				if (localStorage.getItem('chat__open')) {
					chats.forEach(chat => {
                        chatHtml = '';
						try {
							if (chat.chatId && chat.chatId.isRemoved == 1) {
								return;
							}
	
							if (chat.chatType == 'group' && chat.isRejected == 1) {
								return;
							}
	
							if (jQuery(`.chat__item-${chat.chatId}`).length == 0) {
								chatType = chat.chatType;
								date = formatDateForChat(chat.last_message_time);
								messageAccepted = (chat.isMsgReqAccepted == 0 && chat.isRejected == 0) ? '<p class="acceptReqPrompt css-1ymtwa0">Message Request : Tap to view &amp; then you can accept / decline</p>' : '';
								chatRejected = (chat.isRejected == 1) ? ' rejected' : '';
								chatRejectedMsg = (chat.isRejected == 1) ? (chat.chatType == 'personal') ? '<p class="acceptReqPrompt css-1ymtwa0">Message Request Declined</p>' : '<p class="acceptReqPrompt css-1ymtwa0">You have left the group</p>' : '';
								chatIdClass = (chat.chatId) ? ` chat__item-${chat.chatId}` : '';
								encryptedIdElem = '';
	
								if (chatType == 'group') {
									userName = chat.groupName;
									imagePath = getProfileImage(renderUserProfileImage(chat.groupProfileURL), '', '', '', false);
									profilePic = (chat.groupProfileURL) ? imagePath : '<img src="' + API_URL + '/view/assets/img/chat__person.png">';
									chat.isMsgReqAccepted = true;
									createdBy = chat.createdById;
								}
								else {
									userName = (!chat.userInfo) ? 'Deactivated Account' : (chat.userInfo.displayName || chat.userInfo.DisplayName);
									userName = (userName == "System Account") ? 'Travel Buddy' : userName;	
									if (chat && chat.userInfo && (chat.userInfo.profilePic != undefined || chat.userInfo.PhotoURL != undefined)) {
										imagePath = getProfileImage(renderUserProfileImage(chat.userInfo.profilePic ? chat.userInfo.profilePic : chat.userInfo.PhotoURL), userName, '', '', false);
										profilePic = (chat.userInfo && chat.userInfo.profilePic && chat.userInfo.profilePic) ? imagePath : '<img src="' + API_URL + '/view/assets/img/chat__person.png">';
									}
									messageAccepted = '';
									chatRejectedMsg = '';
									createdBy = '';
									encryptedIdElem = ` encrypted-user-id="${chat.encryptedId}"`;
									
								}
								if (chat.last_message != undefined) {
									textContent = chat.last_message.replace(/<\/?[^>]+(>|$)/g, "\n");
								}
								else {
									textContent = '';
								}
								// Now you can use textContent as the text of the message
									
								// Commented this since it was creating Ui Issues. But it has to be brought back
								//
								
								chatHtml += `<div class="chat__item${chatIdClass}${chatRejected}" data-rejected="${chat.isRejected}" data-isReadOnly="${chat.isReadOnly}" data-cohortid="${chat.cohortId}" data-chat-userName="${userName}" data-created-by="${createdBy}" data-chat-type="${chatType}" data-chat-id="${chat.chatId}" data-chat-user="${chat.to_uid}" ${encryptedIdElem} data-isaccepted="${chat.isMsgReqAccepted}" data-timestamp= "${chat.last_message_time}"><div class="css-c8gsda"><div class="css-f6loyt"><div class="css-3i9vrz">${profilePic}</div><div class="chat__name"><p class="userName css-rq7oal">${userName}</p><p class="css-26blw5">${textContent}</p>${chatRejectedMsg}${messageAccepted}</div></div><div class="css-s2uf1z"><div class="timeStamp" style="margin-top:-19px;color:var(--grey-2,#707070)}">${date}</div><div class="css-1h2atly"></div></div></div></div>`;
								
								allChatsHtml += chatHtml;
								
								if (chat.chatType == 'group') {
									groupChatsHtml += chatHtml;
								} 
                                else {
									personalChatsHtml += chatHtml;
								}
							}
							else {
								if (chat.chatType == 'group') {
									profilePic = (chat.groupProfileURL) ? `<img alt="${chat.groupName}" src="${renderUserProfileImage('/filters:format(webp)/fit-in/200x200/' + chat.groupProfileURL)}" class="css-1hy9t21"></img>` : '<img src="' + API_URL + '/view/assets/img/chat__person.png">';
	
									jQuery(`.chat__item-${chat.chatId} .css-3i9vrz`).html(profilePic);
								}
							}
						}
						catch (error) {
							console.log(chat);
							console.log(error);
						}
					});
					
					chatContainer.html(allChatsHtml);
                    jQuery('#all, #personal, #groups').removeClass('clicked__tab');
                    jQuery('#all').addClass('clicked__tab');
					if (element == 'chat__open') {
						renderChatPreview();
					}
				}
                
				subscribeToChat(chats, 'sendChatToIndexed').then(() => {
					console.log('Subscribed to chats');			
					if (!localStorage.getItem('chat__open')) {
						sendChatDataToIndexedDb('init', chats);
						console.log('Chat Data Sent to IndexedDB');
					}
					else {
						subscribeToChat(chats, 'chats');	
                        shouldAppendFromChildAdded = true;	
					}
				}).catch(error => {
					console.error('An error occurred:', error);
				});
					
				subscribeToChat(chats, 'groupChats');
			}

			jsInit('setUserPresence', { state: true });
		}
		else if (state == 'renderChatSingleUser') {
			console.log(data);
			if (data.responseCode == 200) {
				singleChatContainer = jQuery('.singleChat__container');
				singleChatContainer.attr('data-chat-id', data.chatId);
				singleChatContainer.attr('data-chat-user', data.chatDetails.userInfo.from_uid);
				singleChatContainer.attr('data-isaccepted', data.chatDetails.isMsgReqAccepted);
				singleChatContainer.attr('data-isReadOnly', data.chatDetails.isReadOnly);
				singleChatContainer.attr('data-cohortid', data.cohortId);
				renderChat('renderSingleChat', data);
			}
		}
		else if (state == 'singleChat') {
			utilityBar = renderChatUtillityBar();
			singleChatMoreOptions = renderChatMoreOptions();
            emojis = renderEmojis();
            
			jQuery('.singleChat__container').html('<div class="css-1n2mv2k"><div class="css-btd4on" style="background-color:#1e1e2d"><div class="appBar css-i6s8oy"><div class="singleChat__top-left"><div class="css-70qvj9 singleChat__back">' + icons.back + '</div><div class="singleChat__name"><div class="css-1f7kf0v"><img alt="Remy Sharp" src="https://lh3.googleusercontent.com/a/AAcHTtdVYgRs1i7q9LRuV87zo3DRgHGliriNVj4risF9NsAm=s96-c" class="css-1hy9t21"></div><div class=""><p class="userName css-1q69km9">Ranjith G</p><div class="css-h1trg1"><svg class="css-c1v7xd" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="FiberManualRecordIcon"><circle cx="12" cy="12" r="8"></circle></svg><p class="active-inactive css-9l3uo3">Not active</p></div></div></div></div>' + singleChatMoreOptions + '</div><div class="singleChat__box"><div class="date-box-parent css-164r41r"><div class="date-box"><p class="ind-chat-date css-9l3uo3">Today</p></div></div></div>' + utilityBar + '<input id="selectImgInput" onchange="manageChatMedia(this)" hidden="" type="file" accept=".jpeg, .jpg, .png, .gif, .svg, video/*"><input id="selectDocumentsInput" onchange="manageChatMedia(this)" hidden="" type="file" accept=".csv, .doc, .docx, .pdf, .ppt, .txt"><div class="sticky-footer-parent"><div class="sticky-footer"><div class="input-box"><form id="chatMessage-form"><textarea placeholder="Type here..." class="type-msg" name="chat-postMessage" id="chat-postMessage" autocomplete="off"></textarea></form><div id="toggleEmojiPicker" class= "emoji__icon">' + icons.emojiPicker + '</div><div class="emojis__container" style="display:none;"><div class="plus-bar-overlay"></div>' + emojis + '</div><img class="camera-icon" height="17" src="/view/assets/img/camera.png" alt="send"><img class="plus-icon open__utillityBar" height="15" src="/view/assets/img/plus-more-icon.png" alt="send"></div><div class="send-msg-btn">' + icons.send + '</div></div></div></div></div>');
			function renderChatMoreOptions() {
				response = '<div class="singleChat__more-options"><span>' + icons.threeDots + '</span><div class="singleChat__options-box"><div class="singleChat__options-overlay"></div><div class="singleChat__options"><ul><li data-option="block">Block User</li><li data-option="unblock">Unblock User</li><li data-option="report">Report</li></ul></div></div></div>';
				return response;
			}
		}
		else if (state == 'renderStartNewChat') {
			if (!guestMaster('noLogin')) {
				jQuery('.startNewChat__container').html('<form id="startNewChat"><div class="css-btd4on"><div class="appBar css-i6s8oy"><div class="css-k008qs"><span>' + icons.back + '</span><p class="chatTitle css-9l3uo3">Start a New Chat / Group</p></div></div><div class="css-w017iw"><div class="css-f6loyt"><div class="css-1vq1j6r">' + icons.groupChat + '</div><p class="start-new-chat css-1ymtwa0">Create a New Group</p></div>' + icons.openOut + '</div><div class="row"><p class="select-buddies-text css-9l3uo3">Buddies following you: ' + manageUserProfile('read', 'followers') + '</p><div class="" style="position:relative;margin-top:.75rem"><input placeholder="Search Buddies" type="text" class="search-buddy-input"><div class="search-icon-parent">' + icons.searchBar + '</div></div></div><div class="create__chat-group__users create__chat-single__users" data-page-number="1" data-total-pages="2"></div><div class="create__chat-group__users-search create__chat-single__users-search"></div></div></form>');
			}
		}
		else if (state == 'renderCreateGroupChat') {
			if (!guestMaster('noLogin')) {
				//Step One - Select Buddies
				// below line has to be corrected
				imagePath = getProfileImage(renderUserProfileImage(manageUserProfile('read', 'profilePic')), manageUserProfile('read', 'name'), '', '', false);

				jQuery('.createGroupChat__container .createGroupChat-stepOne').append('<div class="css-btd4on"><div class="appBar css-i6s8oy"><div class="css-k008qs"><span>' + icons.back + '</span><div class="topBarChat"><p class="chatTitle css-9l3uo3" style="padding-left:1rem;font-size:16px">Create New Group :<span style="color:#707070"> Step 1/2</span></p><p class="select-buddies-text css-9l3uo3 createGroup__members topBars" style="margin-top:-1rem">1/100 Selected</p></div></div><div class="">' + icons.info + '</div></div><div class="css-8udqz6"><div class="css-1ljafgy"><div class="createGroupChat__selectedUser"><div class="css-mqhbsm">'+ imagePath +'</div><p class="selectects-avatar-name css-9l3uo3">' + manageUserProfile('read', 'name') + '</p></div></div>' + icons.openOut + '</div><div class="row"><p class="select-buddies-text css-9l3uo3">Select Buddies to add to your Group</p><div class="" style="position:relative; margin-top: 0.75rem"><input placeholder="Search Buddies" type="text" class="search-buddy-input"><div class="search-icon-parent">' + icons.searchBar + '</div></div></div><div class="create__chat-group__users create__chat-group__users-real"></div><div class="create__chat-group__users-search create__chat-group__users-search-real"></div><div class="sticky-next-btn"><button class="css-1ujsas3" tabindex="-1" type="button">Next ' + icons.arrow_right + '</button></div></div>');

				//Step Two - Group Details
				jQuery('.createGroupChat__container .createGroupChat-stepTwo').append('<div class="css-btd4on"><div class="appBar css-i6s8oy"><div class="css-k008qs">' + icons.back + '<div class="topBarChat"><p class="chatTitle css-9l3uo3" style="padding-left:1rem;font-size:16px">Create New Group :<span style="color:#707070"> Step 2/2</span></p><p class="select-buddies-text css-9l3uo3" style="margin-top:-1rem">Add Group Name &amp; Image</p></div></div><div class="">' + icons.info + '</div></div><div class="css-8udqz6"><div class="css-5ie3se"><div class="" style="position:relative;margin-right:1.5rem;overflow-x:hidden"><div class="css-1d3go38">' + icons.person + '</div><input hidden="" type="file" id="create-grp-profile"><input type="hidden" name="createGroupChat__dp" id="createGroupChat__dp"></div><input placeholder="Group Name..." type="text" class="add-grp-name-input" value="" maxlength="32"><p class="group-name-length css-9l3uo3">32</p></div><img class="create-grp-emoji" height="18" src="/view/assets/img/emoji-icon.png" class="picmo__emoji-button" alt="search"></div><div class=""><p class="select-buddies-text css-9l3uo3">Buddies Added : 6/100</p></div><div class="createGroup-SelectedUsers"></div><div class="sticky-next-btn"><button class="css-1ujsas3 creategroup-btn" data-stage="1">Create ' + icons.tick + '</button></div></div>')

				// jsInit('fetchFollowers', { userId: manageUserProfile('read', 'userId'), pageNumber: 0, type: 0 }, 'groupChat');
			}
		}
		else if (state == 'renderGroupMembersPage') {
            shareDiv = '';
            if (!isIOS()) {
                shareDiv = '<button class="group__members-actions-box-item share__group" data-option="shareGroupChat" data-group-id="' + jQuery('.chat__item.active').attr('data-chat-id') + '">Share ' + icons.share + '</button>';
            }
			jQuery('.group__members-section').append('<div class="css-btd4on"><div class="appBar css-i6s8oy group__members-header"><div class="css-k008qs">' + icons.back + '</div><div class="group__members-name"><span class="groupName__span">Awesome Group</span><form id="groupName"><input type="hidden" id="groupName__field" name="groupName__field"></form><span class="edit__groupName">' + icons.edit + '</span></div>' + shareDiv + '</div><div class="css-1rv0dd6"><img width="250px"><input type="file" class="hidden" id="groupMembers-Profile"></div><div class="group__members-details"><p class="select-buddies-text css-1dt1tvu">Total Group Members : 5</p><div class="groupMembers-add">' + icons.plus + ' Add Members</div></div><div class="group__members-box"></div><div class="group__members-actions-box"></div></div>');
            
            //' + icons.plus + ' Add Member
		}
		else if (state == 'renderGroupChatFollowers') {
			console.log(data);
			if (data.responseCode == 200) {
				pageNumber = data.object.pageNumber;
				totalPages = data.object.totalPages;
				data = data.object.list;

				where = element == 'searchGroupChat' ? '.create__chat-group__users-search-real' : '.create__chat-group__users-real';
				chatGroupUsers = jQuery('.create__chat-group__users');
				chatSingleUsers = jQuery('.create__chat-single__users');
				chatSingleUsersSearch = jQuery('.create__chat-single__users-search');
				html = '';

				if (pageNumber < 2 && data.length == 0) {
					html += '<div class="no-posts"><div class="no-posts__icon">' + icons.sadSmiley + '</div><div class="no-posts__text">You have no buddies following you.</div></div>';
				}

				data.forEach((follower) => {
					if (chatGroupUsers.find('.profile-row[data-user-id="' + follower.userId + '"]').length > 0 && element !== 'searchGroupChat') {
						return;
					}

					something = '';
					if (element == 'groupChat' || element == 'searchGroupChat') {
						something = '<span class="css-nylzi6"><input class="css-1m9pwf3" name="create__group-users" id="create__group-users" type="checkbox" value="' + follower.userId + '">' + icons.tickCircle + '<span class="css-w0pj6f"></span></span>';
						if (element == 'groupChat') {
							something += '<div class="profile__chat" data-source="start_a_new_chat">' + icons.chat + '</div>';
						}
					}

					imagePath = getProfileImage(renderUserProfileImage(follower.imageUrl), '', '', '', false);
					html += '<div class="profile-row css-114g8ka" data-userName="' + follower.name + '" data-profileImage="' + renderUserProfileImage(follower.imageUrl) + '" data-source="start_a_new_chat" data-user-id-string="' + follower.userIdString + '" data-user-id="' + follower.userId + '"><div class="css-f6loyt"><div class="css-154ogbs">'+ imagePath +'</div><p class="userName css-1aa5ap6">' + follower.name + '</p></div>' + something + '</div>';
				});

				if (element == 'groupChat') {
                    chatSingleUsers.empty();
					chatSingleUsers.append(html);
				} else if (element == 'searchGroupChat') {
                    chatSingleUsersSearch.empty();
					chatSingleUsersSearch.append(html);
				}
                jQuery(where).empty();

				jQuery(where).append(html);
				chatGroupUsers.attr('data-page-number', pageNumber).attr('data-total-pages', totalPages);
				scrollManager('Start', 'Followers New Chat');
			} 
			else {
				tokenMaster('manageRefreshToken', data);
				toast(data.errorMessage);
			}
		}
		else if (state == 'renderGroupChatMembers') {
			groupMembersBox = jQuery('.group__members-box');
			singleChatContainer = jQuery('.singleChat__container');
			chatItemActive = jQuery('.chat__item.active');
			groupMembersRemoveUser = jQuery('.group__members-remove__user');
			groupMembersAdd = jQuery('.groupMembers-add');
			groupMembersActionsBox = jQuery('.group__members-actions-box');
			editGroupName = jQuery('.edit__groupName');
			groupMembersDetails = jQuery('.group__members-details .css-1dt1tvu');
			html = '';

			groupMembersBox.html('');
			singleChatContainer.attr('data-chat-user', manageUserProfile('plainUserId'));
            
            dataArray = Object.entries(data).map(([uid, userDetails]) => {
                return { uid, ...userDetails };
            });

			dataArray.forEach(member => {
				if (member.isExited || member.isRemoved) {
					return false;
				}

				memberId = member.uid;
				encUid = (member.encryptedUid) ? member.encryptedUid : memberId;
				//member = member.userInfo;
				groupAdmin = chatItemActive.attr('data-created-by');
				isAdmin = (Number(groupAdmin) == Number(memberId)) ? true : false;
				somethingIs = (isAdmin) ? '<div class="group__members-box__isAdmin">Admin</div>' : (( localStorage.getItem('plainUserId') == Number(groupAdmin) ) ? '<div class="group__members-remove__user">' + icons.delete + ' Remove</div>' : '');
                
				adminClass = (isAdmin) ? ' group__member-isAdmin' : '';

				if (member !== undefined ) {
					html += '<div class="profile-row css-114g8ka' + adminClass + '" data-userName="' + member.userName + '" data-profileImage="' + renderUserProfileImage(member.profilePic) + '" data-source="start_a_new_chat" data-user-id-string="' + encUid + '" data-user-id="' + memberId + '"><div class="css-f6loyt"><div class="css-154ogbs"><img src="' + renderUserProfileImage(member.profilePic) + '"></div><p class="userName css-1aa5ap6">' + member.userName + '</p></div>' + somethingIs + '</div>';
				}
			});

			groupMembersBox.append(html);

			// Hide/Show Remove User buttons based on userType
			if (chatItemActive.attr('data-created-by') == localStorage.getItem('plainUserId')) {
				groupMembersAdd.show();
				groupMembersActionsBox.html('<button class="group__members-actions-box-item" data-option="deleteGroupChat" data-group-id="' + chatItemActive.attr('data-chat-id') + '">Exit Group ' + icons.delete + '</button><button class="group__members-actions-box-item share__group" data-option="shareGroupChat" data-group-id="' + chatItemActive.attr('data-chat-id') + '">Share Group ' + icons.share + '</button>');
			}
			else {
				groupMembersAdd.hide();
				groupMembersActionsBox.html('<button class="group__members-actions-box-item" data-option="leaveGroupChat" data-group-id="' + chatItemActive.attr('data-chat-id') + '">Leave Group ' + icons.exit + '</button><button class="group__members-actions-box-item share__group" data-option="shareGroupChat" data-group-id="' + chatItemActive.attr('data-chat-id') + '">Share Group ' + icons.share + '</button>');
				editGroupName.hide();
			}

			//Push admin to the top
			jQuery('.group__member-isAdmin').prependTo(groupMembersBox);

			//Update members count
			groupMembersDetails.html('Members: ' + groupMembersBox.find('.profile-row').length);
		}
		else if (state == 'groupChatImageChange') {
			if (data.responseCode == 200) {
				data = data.images;
				imageUrl = data.Key;

				if (element == 'groupMembers') {
					imageUrl = renderUserProfileImage(imageUrl);
					jQuery('.group__members-section .css-1rv0dd6').find('img').attr('src', imageUrl);
					jQuery('.chat__item.active .css-3i9vrz img').attr('src', imageUrl);
					jQuery('.singleChat__container .css-1f7kf0v img').attr('src', imageUrl);

					jsInit('updateGroupImage', { groupId: jQuery('.chat__item.active').attr('data-chat-id'), profilePic: data.Key });
				}
				else {
					jQuery('#createGroupChat__dp').val(imageUrl);
				}
			}
			else {
				toast(data.errorMessage);
			}

			jQuery('.css-1d3go38').removeClass('groupPhoto-uploading');
		}
		else if (state == 'renderChatGroup') {
			console.log(data);
			if (data.responseCode == 200) {
				data = data.chatArr;

				//Hide the loader
				loaderMain('createGroupChat', false);

				jQuery('.creategroup-btn').attr('data-stage', '2').attr('data-group-id', data.chatId);
				jQuery('.creategroup-btn').click();

				//setTimeout(function () {
					//Open the group chat
					// jQuery('.chat__item-' + data.chatId).click();

					//Clear the whole form
					jQuery('#createGroupChat')[0].reset();

					jsInit('postChatMessage', { chatId: data.chatId, chatType: 'group', isSentByCurrentUser: true, timeStamp: data.last_message_time, isDeleted: false, isMedia: false, isSeen: false, isStarred: false, message: "Group Created By " + manageUserProfile('read', 'name'), userId: manageUserProfile('read', 'userId'), type: "status", media: [] }, 'groupChat');
				//}, 1000);
			}
			else {
				//Hide the loader
				loaderMain('createGroupChat', false);
			}
		}
		else if (state == 'addUsersToGroup' || state == 'addUsersToGroupLater') {
			console.log(data);
			if (data.responseCode != 200) {
				toast(data.errorMessage);
			}
			else {
				if (state == 'addUsersToGroup') {
                    document.getElementById('createGroupChat__dp').value = '';
				}
                jQuery('.css-k008qs svg').click();
                // Click the first chat item 
                jsInit('getDeltaDataChats', '', 'newGroupChat');
                //jQuery('.chat__item').first().click();
                jQuery('.creategroup-btn').attr('data-stage', '1');
			}
		}
		else if (state == 'renderSingleChat') {
			if (data.responseCode == 200) {
				messages = data.messages;
				singleChatBox = jQuery('.singleChat__box');
				singleChatContainer = jQuery('.singleChat__container');
				singleChatMessageLastChild = jQuery('.singleChat__message:last-child');
				singleChatBox.html('');
				if (messages && messages.length > 0) {
					messages.forEach(message => {
						renderChatMessage(singleChatBox, message);
					});
					chatVerified1O1();
				} else {
					chatStarterKit();
				}
				setTimeout(() => {
					singleChatBox.animate({ scrollTop: singleChatBox.prop("scrollHeight") }, 300);
				}, 150);
				renderChat('renderPermissionsBox');
				cohortId = singleChatMessageLastChild.attr('data-cohortid');
				isSeen = singleChatMessageLastChild.attr('data-isseen');
				if (cohortId && cohortId != 'undefined' && cohortId !== '' && cohortId !== undefined && cohortId !== null) {
					if (isSeen == 'false') {
						jsInit('updateMessageDashboardHistory', { msgJobId: cohortId, isMessageSeen: true });
					}
				}
				if (singleChatContainer.attr('data-chat-type') == 'group') {
					searchGroupId = singleChatContainer.attr('data-chat-id');
					plainUserId = localStorage.getItem("plainUserId");
					
					// Get all values from IndexedDB groupUsers 
					
					getChatDataFromIndexedDb('groupUsers').then(groupD => {
						if (groupD) {
					
							group = groupD.find(group => group.groupId === searchGroupId);
							if (group) {
								if (String(group.adminId) === String(plainUserId)) {
									console.log("AdminId matches plainUserId. Perform necessary action here.");
									if (group.members) {
										console.log("Members whose isRequested is 0");
										membersWithRequestedZero = Object.values(group.members).filter(member => member.isRequested == '0');
										if (membersWithRequestedZero.length > 0) {
											renderFindBuddyAcceptDecline(membersWithRequestedZero);
										}
									}
								}
							}
						}
					});
				}
			}
			else if (data.responseCode == 401) {
				chatStarterKit();
			}

			//Hide the loader
			loaderMain('singleChat', false);
		}
		else if (state == 'uploadChatMedia') {
			if (data.responseCode == 200) {
				userId = data.userId;
				timestamp = data.timestamp;
				chatId = data.chatId;
				chatType = jQuery('.singleChat__container').attr('data-chat-type');
				mediaType = getMediaType(data.imageData.Key);
				console.log(data);

				mediaArr = { mediaType: mediaType, mediaUrl: data.imageData.Key }
				if (mediaType == 'document') {
					mediaArr.mediaName = data.mediaOriginal.mediaName;
					mediaArr.mediaSize = data.mediaOriginal.mediaSize;
					mediaArr.mediaExtension = data.mediaOriginal.mediaExtension;
				}

				payload = { chatId: chatId, chatType: chatType, isSentByCurrentUser: true, timeStamp: timestamp, isDeleted: false, isMedia: false, isSeen: false, isStarred: false, message: "", userId: jQuery('.singleChat__container').attr('data-chat-user'), type: "media", media: [mediaArr] }

				jQuery('.singleChat__message-' + timestamp).remove();
				renderChatMessage('.singleChat__box', payload);
				jsInit('postChatMessage', payload, 'singleChat');

				//Empty the input type file	field
				jQuery('#selectImgInput, #selectDocumentsInput').val('');
			}
			else {
				toast(data.errorMessage);
			}

			//Hide the loader
			loaderMain('singleMessage', false);
		}
		else if (state == 'exitUserFromGroup') {
			console.log(data);

			if (data.responseCode == 200) {
				userId = jQuery('.group__members-section').attr('data-remove-member');
				jQuery('.group__members-box .profile-row[data-user-id="' + userId + '"]').remove();
				
				
				//Remove the chats from the chats list
                jQuery('.chat__item.rejected').remove();
				jQuery('.singleChat__back svg').click();
			}
			else {
				toast(data.errorMessage);
			}
		}
		else if (state == 'removeUserFromGroup') {
			console.log(data);

			if (data.responseCode == 200) {
				userId = jQuery('.group__members-section').attr('data-remove-member');
				manageUserChat('removeMemberFromGroup', { userId: userId, groupId: jQuery('.chat__item.active').attr('data-chat-id') });
				jQuery('.group__members-box .profile-row[data-user-id="' + userId + '"]').remove();
				jQuery('.chat__item.active').click();
			}
			else {
				toast(data.errorMessage);
			}
		}
		else if (state == 'renderMessageOptions') {
			jQuery('.singleChat__message.highlighted').append(renderMessageOptions(data, element));
		}
		else if (state == 'renderPermissionsBox') {
			renderPermissionsBox(jQuery('.singleChat__container').attr('data-isaccepted'));
		}
		else if (state == 'acceptChatRequest') {
            console.log(data);
            if (data.responseCode == 200) {
                data = data.chatArr[0];
                if (data.chatId == jQuery('.singleChat__container').attr('data-chat-id')) {
                    //Hide the permissions box
                    jQuery('.sticky-acceptmsg-prompt').hide();
                    if (data.isRejected == false) {
                        jQuery('.singleChat__container').attr('data-isaccepted', data.isMsgReqAccepted);
                        jQuery('.chats__container .chat__item').each(function () {
                            if (jQuery(this).attr('data-chat-id') == data.chatId) {
                                jQuery(this).attr('data-isaccepted', data.isMsgReqAccepted).removeClass('rejected');
                                jQuery(this).find('.acceptReqPrompt').remove();
                                console.log(jQuery(this).find('.acceptReqPrompt'));
                            }
                        });
                    }
                    else {
                        jQuery('.singleChat__container').attr('data-isaccepted', 'false').attr('data-isrejected', 'true').addClass('rejected');
                        jQuery('.chats__container .chat__item').each(function () {
                            if (jQuery(this).attr('data-chat-id') == data.chatId) {
                                jQuery(this).attr('data-isaccepted', 'false');
                                jQuery(this).attr('data-isrejected', 'true').addClass('rejected').append('<p class="acceptReqPrompt css-1ymtwa0">Message Request Declined</p>');
                            }
                        });
                        jQuery('.sticky-footer-parent').hide();
                    }
                }
            }
            else {
                toast(data.errorMessage);
            }
        }
		else if (state == 'postChatMessage') {
			console.log(data);
			if (data.responseCode == 200) {
				jQuery('.chat_starter-Kit').remove();;
			}
		}
	}

	function chatStarterKit() {
		messagesArr = [];
		return messagesArr;
		chatType = jQuery('.singleChat__container').attr('data-chat-type');
		userId = jQuery('.singleChat__container').attr('data-chat-user');

		if (chatType == 'personal') {
			messagesArr.push('Hi Buddy, your travel profile is very impressive, I am hoping to get travel  advice from you, can we chat?');
			messagesArr.push('Hi Buddy, I am new in town and looking for a buddy to travel with, can you help?');
			messagesArr.push("Hello Buddy! I'm excited about expanding my network. Let's follow each other & learn more about each other!");
		}

		if (messagesArr.length > 0) {
			jQuery('.singleChat__box').append('<div class="chat_starter-Kit"><span>How would you like to introduce yourself?</span><ul></ul></div>');
			messagesArr.forEach(function (message) {
				jQuery('.chat_starter-Kit ul').append('<li data-message="' + message + '">' + message + '</li>');
			});
		}
	}

	function renderMessageOptions(type, othersMessage) {
		renderItem = '';
		style = '';

		if (type !== '') {
			star = '<div class="chat-press-unit-box" data-item="star"><p class="chat-press-unit-heading css-9l3uo3">Star</p><img height="22" src="/view/assets/img/star-icon.png" alt="star-icon"></div>';
			reply = '<div class="chat-press-unit-box" data-item="reply"><p class="chat-press-unit-heading css-9l3uo3">Reply</p><img src="/view/assets/img/reply-icon.png" alt=""></div>';
			copy = '<div class="chat-press-unit-box" data-item="copy"><p class="chat-press-unit-heading css-9l3uo3">Copy</p><img src="/view/assets/img/copy-icon.png" alt=""></div>';
			forward = '<div class="chat-press-unit-box" data-item="forward"><p class="chat-press-unit-heading css-9l3uo3">Forward</p><img src="/view/assets/img/forward-icon.png" alt=""></div>';
			report = '<div class="chat-press-unit-box" data-item="report"><p class="chat-press-unit-heading css-9l3uo3">Report</p><img src="/view/assets/img/report-icon.png" alt=""></div>';
			deleteButton = '<div class="chat-press-unit-box" data-item="delete"><p class="chat-press-unit-heading css-9l3uo3">Delete</p><img src="/view/assets/img/delete-icon.png" alt=""></div>';

			//For now we are disabling the reply and forward option
			reply = '';
			forward = '';

			if (othersMessage) {
				deleteButton = '';
				style = 'style="height: 165px;"';
			}

			renderItem = '<div class="css-o8ybtd" ' + style + '><div class="css-o8ybtd-overlay"></div><div class="css-o8ybtd-box">' + star + reply + copy + forward + report + deleteButton + '</div></div>';
		}

		return renderItem;
	}

	function renderChatUtillityBar() {
		profileButton = '<div class="plus-bar-icon-div chatUtillity__item" data-item="profile"><img height="32" src="/view/assets/img/chat/profile-icon.png" alt="emoji" /><p class="plus-bar-icon-label css-9l3uo3">Profile</p></div>';
		contactButton = '<div class="plus-bar-icon-div chatUtillity__item" data-item="contact"><img height="32" src="/view/assets/img/chat/user-icon.png" alt="emoji"><p class="plus-bar-icon-label css-9l3uo3">Contact</p></div><div class="line-plus-icon-menu"></div>';
		locationButton = '<div class="plus-bar-icon-div chatUtillity__item" data-item="location"><img height="32" src="/view/assets/img/chat/location-icon.png" alt="emoji"><p class="plus-bar-icon-label css-9l3uo3">Location</p></div>';
		documentButton = '<div class="plus-bar-icon-div chatUtillity__item" data-item="document"><img height="32" src="/view/assets/img/chat/document-icon.png" alt="emoji"><p class="plus-bar-icon-label css-9l3uo3">Document</p></div>';
		cameraButton = '<div class="plus-bar-icon-div chatUtillity__item" data-item="camera"><img height="32" src="/view/assets/img/chat/camera-icon.png" alt="emoji"><p class="plus-bar-icon-label css-9l3uo3">Camera</p></div>';
		galleryButton = '<div class="plus-bar-icon-div chatUtillity__item" data-item="gallery"><img height="32" src="/view/assets/img/chat/gallery-icon.png" alt="emoji"><p class="plus-bar-icon-label css-9l3uo3">Gallery</p></div>';
		videoButton = '<div class="plus-bar-icon-div chatUtillity__item" data-item="video"><img height="32" src="/view/assets/img/chat/video.png" alt="emoji"><p class="plus-bar-icon-label css-9l3uo3">Video</p></div>';

		//For now we are disabling the contact, location and profile option
		contactButton = '';
		locationButton = '';
		profileButton = '';
		documentButton = '';

		renderItem = '<div class="plus-bar-box"><div class="plus-bar-overlay"></div><div class="plus-bar-content">' + profileButton + contactButton + locationButton + documentButton + cameraButton + videoButton + galleryButton + '</div></div>';

		return renderItem;
	}

	function renderPermissionsBox(permission) {
		renderItem = '';

		if (permission == 'false' && jQuery('.singleChat__container').attr('data-isrejected') !== 'true' && jQuery('.singleChat__container').find('.singleChat__box:has(.myMessage)').length <= 0 && jQuery('.singleChat__container').attr('data-chat-type') == 'personal' && localStorage.getItem('plainUserId') != '9191') {
			userName = jQuery('.singleChat__container p.userName').text();

			jQuery('.singleChat__container .css-btd4on').append('<div class="sticky-acceptmsg-prompt"><p class="accept-msg-heading css-9l3uo3">Accept message request from ' + userName + '</p><p class="accept-msg-desc css-9l3uo3">If you accept, they will be able to see when you have read messages.</p><div class="row"><button class="decline-btn" data-stage="1" tabindex="0" type="button">Decline <span class="css-w0pj6f"></span></button><button class="accept-btn" tabindex="0" type="button">Accept <span class="css-w0pj6f"></span></button></div></div>');
		}
		else if (jQuery('.singleChat__container').find('.singleChat__box:has(.myMessage)').length > 0) {
			jQuery('.singleChat__container').attr('data-isaccepted', 'true');
		}

		return renderItem;
	}
}

function renderChatMessage(where, message, bypass) {
  
	getChatDataFromIndexedDb('groupUsers').then(groupData => {
		// Convert the fetched array into an indexed object by groupId
		groupDataIndexed = groupData.reduce((acc, group) => {
			acc[group.groupId] = group;
			return acc;
		}, {});
   
		timeStamp = message.timeStamp.toString().length === 13 ? message.timeStamp / 1000 : message.timeStamp;
		date = new Date(Number(timeStamp) * 1000);
		date = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
 
 
		type = message.type;
 
 
		singleChatContainer = jQuery('.singleChat__container');
		singleChatBox = jQuery('.singleChat__box');
		singleChatMessageLastChild = jQuery('.singleChat__message:last-child');
 
 
		if (bypass || (message.chatId == singleChatContainer.attr('data-chat-id'))) {
			messageText = renderMessageText(message);
			starredMessage = (message.isStarred) ? '<span class="text-msg-starred">' + icons.star + '</span>' : '';
			whosMessage = (message.isSentByCurrentUser && !message.isReadOnly) ? ' myMessage' : ' otherMessage';
			whosMessage = (message.type == 'status') ? ' statusMessage' : whosMessage;
			messageClass = ' singleChat__message-' + message.timeStamp;
			messageMedia = renderMessageMedia(message);
			messagePost = renderMessagePost(message);
			messageProfile = renderMessageProfile(message);
			messageExperience = renderMessageExperience(message);
			mediaMessageClass = (message.type == 'media' && !message.isDeleted) ? ' mediaMessage' : '';
			loaderClass = (bypass && message.type == 'media') ? ' loader' : '';
			messageId = (message.messageId) ? message.messageId : '';
			chatType = singleChatContainer.attr('data-chat-type');
		   
			if ('isReadOnly' in message) {
				singleChatContainer.attr('data-isReadOnly', message.isReadOnly);
				singleChatContainer.attr('data-cohortid', message.cohortId);
			}
 
 
			if (chatType == 'group') {
			   
				// Manage User Chat shud be removed from the entire project
				currentUserId = message.senderId;
			   
				senderInfo = groupDataIndexed[chatId].members[currentUserId];
				nameTag = (senderInfo.userName && whosMessage !== ' myMessage') ? '<div class="chat__message-sender">' + senderInfo.userName + '</div>' : '';
				dummyImage = getDummyImageUrl();
				if (!senderInfo.profilePic) {
					senderInfo.profilePic = dummyImage;
				}
			   
				   
				imagePath = getProfileImage((senderInfo && !senderInfo.profilePic.includes('http')) ? imageBaseUrl + '/filters:format(webp)/fit-in/80x80/' + senderInfo.profilePic : senderInfo.profilePic, senderInfo.userName, '', '', false);
				imageDiv = (senderInfo && senderInfo.profilePic && whosMessage !== ' myMessage') ? '<div class="chat__message-sender-image">'+ imagePath +'</div>' : '';
				isGroupClass = ' groupMessage';
			}
			else {
				nameTag = '';
				imageDiv = '';
				isGroupClass = '';
			}
 
 
			if (messageText != '' || message.type == 'media' || message.type == 'post' || message.type == 'profile' || message.type == 'experience') {
				jQuery(where).append('<div class="css-ysny5s singleChat__message' + isGroupClass + mediaMessageClass + messageClass + whosMessage + loaderClass + '" data-isMedia="' + message.isMedia + '" data-isSeen="' + message.isSeen + '" data-isReadOnly="' + message.isReadOnly + '" data-cohortId="' + message.cohortId + '" data-message-id="' + messageId + '" data-isStarred="' + message.isStarred + '" data-isDeleted="' + message.isDeleted + '" data-timestamp="' + message.timeStamp + '" data-type="' + message.type + '" data-senderId="' + message.senderId + '" data-toId="' + message.toId + '"><div class="css-17bd27a"><div class="text-msg-box css-1ht9t4r">' + nameTag + '<span>' + messageProfile + messageExperience + messagePost + messageMedia + messageText + '</span><div class="text-msg-timing-parent"><p class="text-msg-timing css-9l3uo3" style="text-align:right">' + starredMessage + date + '</p></div></div></div>' + imageDiv + '</div>');
			}
 
 
			if (message.type == 'media' && message.media[0].mediaType == 'video') {
				jQuery('.singleChat__message-' + message.timeStamp + ' video').on('loadeddata', function () {
					jQuery(this).attr('controls', false);
				});
			}
 
 
			singleChatBox.scrollTop(singleChatBox[0].scrollHeight + 200);
			loaderMain('singleMessage', true);
 
 
		}
 
 
		function renderMessageProfile(message) {
			renderItem = '';
 
 
			if ((message.type == 'profile' || message.type == 'shareProfile') && !message.isDeleted) {
				profile = message;
 
 
				if (profile) {
					renderItem = '<div class="chat-message-post chat__message-profile" data-profile="' + profile.profileUserId + '"><div class="chat__message-profile__head"><div class="chat__message-profile-cover"><img src="' + renderUserProfileImage(profile.profileCover) + '" alt=""></div><div class="chat__message-profile-picture"><img src="' + renderUserProfileImage(profile.profileImage) + '" alt=""></div></div><div class="chat__message-profile-body"><div class="chat__message-profile-name">' + profile.profileName + '</div><div class="chat__message-profile-location">' + icons.location + profile.profileLocation + '</div><div class="chat__message-profile-follow">' + numberWithK(profile.followers) + ' Followers | ' + numberWithK(profile.following) + ' Following</div></div><div class="chat-message-post-ctas"><div class="chat-message-post-cta-item chat-message-profile-cta-view">View Profile' + icons.arrow_right + '</div></div></div>';
				}
			}
 
 
			return renderItem;
		}
 
 
		function renderMessageExperience(message) {
 
 
			renderItem = '';
			if ((message.type == 'service' || message.type == 'experience') && !message.isDeleted) {
				if (message.post.postType == 'experience') {
					title = 'Experience';
					postMessageClasses = 'chat-message-find_buddy chat-message-experience';
				}
				else {
					title = 'Service';
					postMessageClasses = 'chat-message-find_buddy chat-message-service';
				}
				if (message.post.price == 0) {
					priceText = 'Request Price';
					priceDiv = '<span></span>' + priceText + '';
				}
				else {
					priceText = message.post.price;
					priceDiv = '<span>₹</span>' + priceText + '<span class>/day</span>';
				}
				postImage = (message.post.postImage) ? message.post.postImage : message.post.postAuthorImage;
 
 
				renderItem = '<div class="chat-message-post ' + postMessageClasses + '" data-post-id="' + message.post.postId + '"><div class="experience_share_box-inner"><div class="info_box-photoInfo"><img src="' + postImage + '"><div class="expereince-info_box"><div class="exp_logo-name">' + icons.share_exp_icon + '<h3>' + title + '</h3></div><div class="exp-name"><h3>' + message.post.postAuthor + '</h3></div><div class="exp-location">' + icons.location + '<h5>' + message.post.postLocation + '</h5></div><div class="exp-price">' + priceDiv + '</div></div></div><div class="bottom_exp-info"><h5>What can you expect here?</h5><p>' + message.post.postContent + '</p></div><div class="bottom_exp-button"><p>Book Now</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12.8819 18.1879L19.0691 12.0008M19.0691 12.0008L12.8819 5.81357M19.0691 12.0008H4.92698" stroke="#111111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div></div>';
			}
			return renderItem;
		}
 
 
		function renderMessagePost(message) {
			let renderItem = '';
 
 
			if (message.type == 'post' && !message.isDeleted) {
				post = message.post;
				postContent = renderPostMessageContent(post, post.postType);
				postIcon = renderPostMessageIcon(post.postType);
				postAuthor = renderPostMessageAuthor(post, post.postType);
				postMessageCTAs = renderPostMessageCTAs(post.postType);
				postMessageClasses = renderPostMessageClasses(post.postType);
 
 
				renderItem = `<div class="chat-message-post ${postMessageClasses}" data-post-id="${post.postId}">${postContent}${postAuthor}${postMessageCTAs}</div>`;
			}
 
 
			return renderItem;
 
 
			function renderPostMessageClasses(type) {
				let renderItem = '';
 
 
				if (type == 'share' || type == 'find_buddy' || type == 'profile' || type == 'shareProfile') {
					renderItem = `chat-message-${post.postType}`;
				}
				else if (type == 'meetup') {
					renderItem = 'chat-message-find_buddy chat-message-meetup';
				}
				else if (type == 'ask') {
					renderItem = 'chat-message-find_buddy chat-message-ask';
				}
 
 
				return renderItem;
			}
 
 
			function renderPostMessageContent(post, type) {
				let renderItem = '';
				postImage = renderUserProfileImage(post.postImage);
 
 
				if (type == 'share' || type == 'profile' || type == 'shareProfile') {
					renderItem = `<div class="chat-message-share-box"><img src="${postImage}" alt=""></div>`;
				}
				else if (type == 'find_buddy' || type == 'ask') {
					renderItem = `<div class="chat-message-find__buddy-box"><p>${post.postContent}</p></div>`;
				}
				else if (type == 'meetup') {
					renderItem = `<div class="chat-message-find__buddy-box"><div class="chat-message-meetup-box"><div class="chat-message-meetup-date">${icons.experienceDate} ${post.postTimestamp}</div><div class="chat-message-meetup-location">${icons.location} ${post.postLocation}</div></div><p>${post.postContent}</p></div>`;
				}
 
 
				return renderItem;
			}
 
 
			function renderPostMessageCTAs(type) {
				renderItem = '';
 
 
				if (type == 'share' || type == 'profile' || type == 'shareProfile') {
					if (type == 'share') {
						title = 'View Post';
					}
					else {
						title = 'View Profile';
					}
					renderItem = '<div class="chat-message-post-ctas"><div class="chat-message-post-cta-item chat-message-post-cta-view">' + title + ' ' + icons.arrow_right + '</div></div>';
				}
				else if (type == 'find_buddy') {
					renderItem = '<div class="chat-message-post-ctas"><div class="chat-message-post-cta-item chat-message-post-cta-join">Interested</div><div class="chat-message-post-cta-item chat-message-post-cta-view">View Post ' + icons.arrow_right + '</div></div>';
				}
				else if (type == 'meetup') {
					renderItem = '<div class="chat-message-post-ctas"><div class="chat-message-post-cta-item chat-message-post-cta-join">Show Interest ' + icons.thumbs + '</div><div class="chat-message-post-cta-item chat-message-post-cta-view">View Post ' + icons.arrow_right + '</div></div>';
				}
				else if (type == 'ask') {
					renderItem = '<div class="chat-message-post-ctas"><div class="chat-message-post-cta-item chat-message-post-cta-view">View Post ' + icons.arrow_right + '</div></div>';
				}
 
 
				return renderItem;
			}
 
 
			function renderPostMessageAuthor(post, type) {
				renderItem = '';
 
 
				if (type == 'share' || type == 'profile' || type == 'shareProfile') {
					renderItem = '<div class="chat-message-author" data-author="' + post.postAuthorId + '"><div class="chat-message-author-left"><div class="chat-message-author-img"><img src="' + renderUserProfileImage(post.postAuthorImage) + '" alt=""></div><div class="chat-message-author-about"><div class="chat-message-author-name">' + post.postAuthor + '</div><div class="chat-message-author-location">' + post.postLocation + '</div><div class="chat-message-author-time">' + post.postTimestamp + '</div></div></div><div class="chat-message-author-right">' + postIcon + '</div></div>';
				}
				else if (type == 'find_buddy') {
					renderItem = '<div class="chat-message-author" data-author="' + post.postAuthorId + '"><div class="chat-message-author-left"><div class="chat-message-author-img"><img src="' + renderUserProfileImage(post.postAuthorImage) + '" alt=""></div><div class="chat-message-author-about"><div class="chat-message-author-name">' + post.postAuthor + '</div><div class="chat-message-author-location"><span class="chotu">is travelling to </span>' + post.postLocation + '</div></div></div><div class="chat-message-author-right">' + postIcon + '</div></div>';
				}
				else if (type == 'meetup') {
					renderItem = '<div class="chat-message-author" data-author="' + post.postAuthorId + '"><div class="chat-message-author-left"><div class="chat-message-author-img"><img src="' + renderUserProfileImage(post.postAuthorImage) + '" alt=""></div><div class="chat-message-author-about"><div class="chat-message-author-name">' + post.postAuthor + '</div><div class="chat-message-author-location">is organising a meetup</div></div></div><div class="chat-message-author-right">' + postIcon + '</div></div>';
				}
				else if (type == 'ask') {
					renderItem = '<div class="chat-message-author" data-author="' + post.postAuthorId + '"><div class="chat-message-author-left"><div class="chat-message-author-img"><img src="' + renderUserProfileImage(post.postAuthorImage) + '" alt=""></div><div class="chat-message-author-about"><div class="chat-message-author-name">' + post.postAuthor + '</div><div class="chat-message-author-location">is asking something</div></div></div><div class="chat-message-author-right">' + postIcon + '</div></div>';
				}
 
 
				return renderItem;
			}
 
 
			function renderPostMessageIcon(type) {
				renderItem = '';
 
 
				if (type == 'share') {
					renderItem = '<img src="/view/assets/img/chat-message-share.png" alt="">'
				}
				else if (type == 'find_buddy') {
					renderItem = icons.chat_find_buddy
				}
 
 
				return renderItem;
			}
		}
 
 
		function renderMessageMedia(message) {
			renderItem = '';
 
 
			if (message.type == 'media' && !message.isDeleted) {
				if (message.media[0].mediaType == 'image') {
					imageUrl = (!message.media[0].mediaUrl.includes('https')) ? imageBaseUrl + '/filters:format(webp)/fit-in/320x400/' + message.media[0].mediaUrl : message.media[0].mediaUrl;
 
 
					originalImageUrl = (!message.media[0].mediaUrl.includes('https')) ? imageBaseUrl + '/' + message.media[0].mediaUrl : message.media[0].mediaUrl;
 
 
					renderItem = '<div class="chat_message-media chat_message-media__image" data-original=' + originalImageUrl + '><img src="' + imageUrl + '" alt="Image"></div>';
				}
				else if (message.media[0].mediaType == 'video') {
					renderItem = '<div class="chat_message-media chat_message-media__video"><video autobuffer src="' + renderPostMedia(message.media[0].mediaUrl, 'video') + '" controls></video><div class="chat_message-media__video-overlay">' + icons.play__icon + '</div></div>';
				}
				else if (message.media[0].mediaType == 'document') {
					console.log(message);
					documentIcons = iconsForExtension(message.media[0].mediaExtension);
					documentUrl = (!message.media[0].mediaUrl.includes('https')) ? videoBaseUrl + '/' + message.media[0].mediaUrl : message.media[0].mediaUrl;
 
 
					renderItem = '<div class="chat_message-media chat_message-media__document"><a href="' + documentUrl + '" target="_blank" rel="noopener noreferrer"><div class="chat__document-box"><div class="chat__document-box-left">' + documentIcons + '</div><div class="chat__document-box-right"><p class="chat__document-box-title">' + message.media[0].mediaName + '</p><p class="chat__document-box-subtitle">' + message.media[0].mediaExtension.toUpperCase() + ' Document</p></div></div></a></div>';
				}
			}
 
 
			return renderItem;
 
 
			function iconsForExtension(extension) {
				response = icons.file;
 
 
				if (extension !== undefined) {
					if (extension.toLowerCase() == 'pdf') {
						response = icons.pdf;
					}
					else if (extension.toLowerCase() == 'docx') {
						response = icons.docx;
					}
					else if (extension.toLowerCase() == 'xls' || extension.toLowerCase() == 'xlsx') {
						response = icons.csv;
					}
					else if (extension.toLowerCase() == 'ppt' || extension.toLowerCase() == 'pptx') {
						response = icons.ppt;
					}
					else if (extension.toLowerCase() == 'doc') {
						response = icons.doc;
					}
					else {
						response = icons.file;
					}
				}
 
 
				return response;
			}
		}
 
 
		function renderMessageText(message) {
			renderItem = '';
 
 
			if (message.message || message.type !== 'text') {
				if (message.isDeleted) {
					renderItem = '<span class="text-msg-deleted">This message was deleted</span>';
				}
 
 
				//Check if the message has a link, if it a gif then render the gif && if the link is not https://bit.ly/2NLcvCu.
				else if (message.message.indexOf('http') !== -1 && message.message.indexOf('bit.ly') == -1) {
					//Check if the link is a gif
					if (message.message.indexOf('.gif') !== -1) {
						renderItem = '<div class="chat_message-media chat_message-media__image"><img src="' + message.message + '" alt="gif"></div>';
					}
					//Check if it is a youtube link
					else if (message.message.indexOf('youtube') !== -1 || message.message.indexOf('youtu.be') !== -1) {
						//Format the youtube link into an embed link
						if (message.message.indexOf('youtube') !== -1) {
							message.message = message.message.replace('watch?v=', 'embed/');
						}
						else {
							message.message = message.message.replace('youtu.be', 'youtube.com/embed');
						}
 
 
						//The rest of the message text needs to be rendered as a text.
 
 
						renderItem = '<div class="chat_message-media chat_message-media__youtube"><iframe src="' + message.message + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
					}
					else {
						messageText = message.message;
 
 
						// Use a regular expression to match URLs in the text
						urlRegex = /(https?:\/\/[^\s]+)/g;
 
 
						// Use a regular expression to match text enclosed in * *
						boldRegex = /\*(.*?)\*/g;
 
 
						// Replace URLs in the text with anchor tags
						renderItem = messageText.replace(urlRegex, function(url) {
							return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
						});
						finalMessage = renderItem;
 
 
						// Replace * * enclosed text with <strong> tags
						renderItem = finalMessage.replace(boldRegex, function(p1) {
							return '<strong>' + p1 + '</strong>';
						});
						console.log(renderItem);
					}
				}
				else {
					messageText = message.message;
					// Use a regular expression to match URLs in the text
					urlRegex = /(https?:\/\/[^\s]+)/g;
 
 
					// Use a regular expression to match text enclosed in * *
					boldRegex = /\*(.*?)\*/g;
 
 
					// Replace URLs in the text with anchor tags
					renderItem = messageText.replace(urlRegex, function(url) {
						return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
					});
					finalMessage = messageText;
 
 
					// Replace * * enclosed text with <strong> tags
					renderItem = finalMessage.replace(boldRegex, function(match, p1) {
						return '<strong class = "bold__message">' + p1 + '</strong>';
					});
				}
			}
 
 
			return renderItem;
		}
	});
}
 

function renderChatSend(state, data, element) {
	if (state == 'init') {
		if (!guestMaster('noLogin')) {
			if (jQuery('#app .chat__send-container').length == 0) {
				jQuery('#app').append('<div class="chat__send-container hidden"></div>');
			}
            
            userOs = detectOperatingSystem();
            //sharePost = '';
            /* if (userOs != '1' && userOs != '0') {*/
			sharePost = '<div class="feed__send-share__option share__btn-hidden" data-what="share"><div class="feed__send-share__option-icon">' + icons.share + '</div><span>Share</span></div>';
			// }
			//<div class="feed__send-share__option copy-icon-first" data-what="copy-link"><div class="feed__send-share__option-icon">' + icons.link + '</div><span>Copy Link</span></div>

			jQuery('.chat__send-container').html('<div class="feed__send-page"><div class="feed__send-top"><div class="feed__send-tabs"><ul><li data-tab="buddies" class="active">Buddies</li><li data-tab="groups">Groups</li></ul></div><div class="feed__send-buddies-tab"><div class="feed__send-search"><input type="text" name="feed__send" id="feed__send" placeholder="Search"><span>' + icons.searchBar + '</span></div><div class="feed__send-profiles"></div></div><div class="feed__send-groups-tab"></div><div class="feed__send-search-box"></div></div><div class="feed__send-bottom"><div class="feed__send-btn"><button>Send</button></div><div class="feed__send-share__options">' + sharePost + '<div class="feed__send-share__option" data-what="whatsApp"><div class="feed__send-share__option-icon">' + icons.whatsApp + '</div><span>WhatsApp</span></div><div class="feed__send-share__option" data-what="facebook"><div class="feed__send-share__option-icon">' + icons.facebook + '</div><span>Facebook</span></div><div class="feed__send-share__option" data-what="twitter"><div class="feed__send-share__option-icon">' + icons.twitter + '</div><span>Twitter</span></div></div></div></div>');

			jsInit('fetchFollowers', { userId: manageUserProfile('read', 'userId'), pageNumber: 0, type: 0 }, 'chatSend');
		}
	}
	else if (state == 'invoke') {
		console.log(data);
		drawer('open');
		jsInit('fetchUsersGroups');

		htmlToAppend = jQuery('.chat__send-container').html();
		jQuery('#main__drawer .drawerHeader span').text('Send To..');
		jQuery('#main__drawer .drawerBody').html(htmlToAppend);

		if (data.postId) {
			jQuery('#main__drawer .drawerBody .feed__send-page').attr('data-id', data.postId).attr('data-type', data.postType);
			jQuery('#main__drawer .drawerBody .feed__send-page').attr('data-image', data.image);
		}

		scrollManager('Start', 'Followers Send Chat');
		jQuery('.feed__send-btn').hide();
	}
	else if (state == 'renderFollowers') {
		console.log(data);
		if (data.responseCode == 200) {
			pageNumber = data.object.pageNumber;
			totalPages = data.object.totalPages;
			data = data.object.list;

			if (element == 'searchChatSend') {
				where = '#main__drawer .feed__send-search-box';
                jQuery('.feed__send-groups-tab').css({ height: '0px', margin: '0', padding: '0' });
				jQuery(where).html('');
			}
			else {
                jQuery('.feed__send-groups-tab').css({ height: 'calc(94vh - 185px)', margin: '25px 0 0', padding: '0 16px 40px' });
				where = '#main__drawer .feed__send-profiles';
				//Add the pageNumber to where
				jQuery('.feed__send-profiles').attr('data-page-number', pageNumber).attr('data-total-pages', totalPages);
			}

			data.forEach((follower) => {
				activeClass = (jQuery('.feed__send-profile[data-user-id-string="' + follower.userIdString + '"]').hasClass('active')) ? ' active' : '';
				profilePic = (follower.imageUrl) ? renderUserProfileImage(follower.imageUrl) : '/view/assets/img/user.png';

				toRender = '<div class="feed__send-profile' + activeClass + '" data-chat-type="personal" data-user-id-string="' + follower.userIdString + '" data-user-id="' + follower.userId + '" data-username="' + follower.name + '" data-profile-image="' + follower.imageUrl + '"><div class="feed__send-profile-left"><div class="feed__send-profile-left__image"><img src="' + profilePic + '" alt="' + follower.name + '"></div><div class="feed__send-profile-left__name">' + follower.name + '</div></div><div class="feed__send-profile-right"><span class="feed__send-selector"><span class="feed__send-epicenter"></span></span></div></div>';

				if (element !== 'searchChatSend') {
					jQuery('.chat__send-container .feed__send-profiles').append(toRender);
				}

				if (jQuery('#main__drawer .feed__send-page').length > 0) {
                    jQuery(where).empty();
					jQuery(where).append(toRender);
				}
			});

		}
		else {
			toast(data.errorMessage);
		}
	}
	else if (state == 'renderGroups') {
		if (data.responseCode == 200) {
			data = data.groups;

			if (data.length > 0) {
				console.log(data);

				data.forEach((group) => {
					if (group.isRejected == false) {
						if (jQuery('#main__drawer .feed__send-groups-tab .feed__send-profile[data-user-id="' + group.chatId + '"]').length == 0) {
							activeClass = (jQuery('.feed__send-profile[data-user-id-string="' + group.chatId + '"]').hasClass('active')) ? ' active' : '';
							profilePic = (group.groupProfileURL) ? renderUserProfileImage(group.groupProfileURL) : '/view/assets/img/user.png';

							toRender = '<div class="feed__send-profile' + activeClass + '"  data-chat-type="group" data-user-id-string="' + group.chatId + '" data-user-id="' + group.chatId + '" data-username="' + group.groupName + '" data-profile-image="' + group.groupProfileURL + '"><div class="feed__send-profile-left"><div class="feed__send-profile-left__image"><img src="' + profilePic + '" alt="' + group.groupName + '"></div><div class="feed__send-profile-left__name">' + group.groupName + '</div></div><div class="feed__send-profile-right"><span class="feed__send-selector"><span class="feed__send-epicenter"></span></span></div></div>';

							if (element !== 'searchChatSend') {
								jQuery('.chat__send-container .feed__send-groups-tab').append(toRender);
							}

							if (jQuery('#main__drawer .feed__send-page').length > 0) {
								jQuery('#main__drawer .feed__send-groups-tab').append(toRender);
							}
						}
					}
				});
			}

			setTimeout(() => {
				jQuery('#main__drawer .feed__send-tabs ul li[data-tab="buddies"]').click();
			}, 150);
		}
		else {
			toast(data.errorMessage);
		}

	}
}

function manageChatMedia(thisELement) {
	var files = thisELement.files;

	if (files.length > 0) {
		var uploadData = new FormData();

		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			uploadData.append('uploaded_files', file, file.name);
		}

		timestamp = Number(new Date().getTime() / 1000).toFixed(0);

		//Also append the user id to the form data
		uploadData.append('data', JSON.stringify({ userId: manageUserProfile('read', 'userId'), chatId: jQuery('.singleChat__container').attr('data-chat-id'), timeStamp: timestamp }));

		// // This is the Console Log Function to log images
		// for (var key of uploadData.entries()) {~
		// 	console.log(key[0] + ', ' + key[1]);
		// }

		mediaType = getMediaType(files[0].name);
		fileExtension = getFileExtension(files[0].name);
		fileName = getFileName(files[0].name);

		//Add the blob object to the chat in the meantime
		chatObj = { "isSentByCurrentUser": true, "timeStamp": timestamp, "isDeleted": false, "isMedia": false, "isSeen": false, "isStarred": false, "message": "", "userId": jQuery(this).parents('.singleChat__container').attr('data-chat-user'), "type": "media", "media": [{ "mediaName": fileName, "mediaExtension": fileExtension, "mediaType": mediaType, "mediaUrl": (window.URL ? URL : webkitURL).createObjectURL(files[0]) }] }
		renderChatMessage('.singleChat__box', chatObj, true);

		jsUpload('uploadChatMedia', uploadData);
	}

	function getFileExtension(fileName) {
		return fileName.split('.').pop();
	}

	function getFileName(fileName) {
		return fileName.split('.').shift();
	}
}

/*function testSharePost() {
	currentTimestamp = Number(new Date().getTime() / 1000).toFixed(0);
	toTest = 'ask';
	chatType = 'personal';
	chatId = '1746890_1463016';

	sharePayload = {
		chatType: jQuery('.singleChat__container').attr('data-chat-type'),
		chatId: jQuery('.singleChat__container').attr('data-chat-id'),
		isSentByCurrentUser: true,
		timeStamp: currentTimestamp,
		message: '',
		userId: jQuery('.singleChat__container').attr('data-chat-user'),
		type: "post",
		post: {
			postId: '855204',
			postImage: '/uploads/posts/836258-1673253384242.jpg',
			postAuthor: 'Akshya',
			postType: 'share',
			postAuthorId: '1',
			postAuthorImage: '/uploads/display_pictures/836258-1628819600356.jpg',
			postTimestamp: '9 Jan, 2023',
			postLocation: 'Kerala'
		}
	}

	findPayload = {
		chatType: chatType,
		chatId: chatId,
		isSentByCurrentUser: true,
		timeStamp: currentTimestamp,
		message: '',
		userId: jQuery('.singleChat__container').attr('data-chat-user'),
		type: "post",
		post: {
			postId: '792063',
			postContent: 'Looking for a bro to come riding with me.',
			postAuthor: 'Juzer Rangwala',
			postType: 'find_buddy',
			postAuthorId: "d4b6022753e81512ab23493238fa83d0e9538ac8ee6904d5f546054b045e1299",
			postAuthorImage: '/uploads/display_picture/e368e3a3a8b05704cf12daac3803a7f338fc5cb1167f0c4f2062bc4203ddce78_1692191132773.jpg',
			postTimestamp: '2022-09-25',
			postLocation: 'Mātherān India'
		}
	}

	meetupPayload = {
		chatType: chatType,
		chatId: chatId,
		isSentByCurrentUser: true,
		timeStamp: currentTimestamp,
		message: '',
		userId: jQuery('.singleChat__container').attr('data-chat-user'),
		type: "post",
		post: {
			postId: '924934',
			postContent: 'looking for a buddy for Varanasi.  #meetup',
			postAuthor: 'Kumari Pinki',
			postType: 'meetup',
			postAuthorId: "a5be3161fad3e1fad208400d0b3b4262d834a8e8facfa279262ef332b6bc5b6f",
			postAuthorImage: '/uploads/display_pictures/1550314-1674195056133.jpg',
			postTimestamp: '8th Sept, 2023',
			postLocation: 'Varanasi'
		}
	}

	askPayload = {
		chatType: chatType,
		chatId: chatId,
		isSentByCurrentUser: true,
		timeStamp: currentTimestamp,
		message: '',
		userId: jQuery('.singleChat__container').attr('data-chat-user'),
		type: "post",
		post: {
			postId: '854506',
			postContent: "Looking for a place to eat good lal maas in jaipur. Can anybody suggest.",
			postAuthor: 'Juzer Rangwala',
			postType: 'ask',
			postAuthorId: "27384a647e27a9abeb0a604e82beac1d8aa4e11e46043972b0ac0e9fb0e41b17",
			postAuthorImage: '/uploads/display_picture/e368e3a3a8b05704cf12daac3803a7f338fc5cb1167f0c4f2062bc4203ddce78_1692191132773.jpg'
		}
	}

	if (toTest == 'share') {
		payload = sharePayload;
	}
	else if (toTest == 'find_buddy') {
		payload = findPayload;
	}
	else if (toTest == 'meetup') {
		payload = meetupPayload;
	}
	else if (toTest == 'ask') {
		payload = askPayload;
	}

	jsInit('postChatMessage', payload);

}*/

function renderLocations(state, data, from) {
	if (state == 'init') {
		jQuery('#main__drawer .drawerHeader span').text('Select Location');
		jQuery('#main__drawer .drawerBody').html('<div class="location__search" data-from="' + from + '"><input type="text" name="location__search" id="location__search" placeholder="Search Location"><span>' + icons.search + '</span></div><div class="location__list"><div class="suggested_places">Suggested Locations<div class="conatiner__suggested" data-location="Dubai"> ' + icons.location + ' Dubai </div><div class="conatiner__suggested" data-location="Goa"> ' + icons.location + ' Goa </div><div class="conatiner__suggested" data-location="Bali"> ' + icons.location + ' Bali </div><div class="conatiner__suggested" data-location="Baku"> ' + icons.location + ' Baku </div><div class="conatiner__suggested" data-location="Sri Lanka"> ' + icons.location + ' Sri Lanka </div><div class="conatiner__suggested" data-location="Vietnam"> ' + icons.location + ' Vietnam </div><div class="conatiner__suggested" data-location="Thailand"> ' + icons.location + ' Thailand </div><div class="conatiner__suggested" data-location="Singapore"> ' + icons.location + ' Singapore </div><div class="conatiner__suggested" data-location="Jammu and Kashmir"> ' + icons.location + ' Jammu and Kashmir </div><div class="conatiner__suggested" data-location="Andaman and Nicobar Islands,"> ' + icons.location + ' Andaman and Nicobar Islands </div></div></div>');

		enteredLocation = jQuery(from).val();
		if (enteredLocation != '') {
			jQuery('#location__search').val(enteredLocation);
		}

		drawer('open');
		jQuery('#location__search').focus();

		//Scroll to top of the drawer
		jQuery('#main__drawer').scrollTop(0);
	}
	else if (state == 'renderSearchResults') {
		jQuery('#main__drawer .drawerBody .location__list').html('');
		renderSearchResults(icons, data, 'locations', '#main__drawer .drawerBody .location__list');
	}
}

function renderAddPost(state, data, extra) {

	if (state == 'init') {
		shareTab = renderShareTab(icons);
		findTab = renderFindTab(icons);
		askTab = renderAskTab(icons);
		feedLogin = renderFeedLogin();

		jQuery('#main').append(
			'<div id="main__addPost-box"><div class="addPost__page"><div class="addPost__header"><div class="addPost__header-left">Find Buddies</div><div class="addPost__header-right"><div class="addPost__post">Find</div></div></div><div class="addPost__tabs hidden"><div class="addPost__tab-item hidden" data-id="share">' + icons.addPostShare + ' Share</div><div class="addPost__tab-item active  hidden" data-id="find">' + icons.addPostFind + ' Find</div><div class="addPost__tab-item hidden" data-id="ask">' + icons.addPostAsk + ' Ask</div></div>' + shareTab + findTab + askTab + feedLogin + '</div></div>'
		);

		initializeAutocomplete("share__location", "share__location_lat", "share__location_lng"); // For share location
		restrictDateInput();
		//filePondUpload();
		renderPlace();
		findDatesRestrictions();
		// loadLottieAnimation('flightsDiscount__strip-findBuddy', '/view/assets/img/coupon-discount-anim.json');

		function renderPlace() {
			// Adding in Find Buddy
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
			initializeAutocomplete("share__location-find", "share__location_lat-find", "share__location_lng-find", function(placeNCity, lat, lng, city, state, country) {
                // Your logic for find buddy case
                // Call API to get Similar Trips
                fetchPosts(
                    {
                        feedsType: 'FIND BUDDY VIEW RELATED',
                        location: placeNCity.split(',')[0],
                        pageNumber: 0,
                        postId: 0,
                        totalItems: 0,
                        userId: manageUserProfile('read', 'userId'),
                        locationLat: lat,
                        locationLng: lng
                    },
                    '.popup__master--findBuddySimilar .popup__body', 'findBuddyRelated'
                );
            });
		}
	}
	else if (state == 'renderFindInstructions') {
		if (extra == 'findBuddy') {
			jQuery('.popup__master').addClass('popup__master--addFindBuddyInstructions');
			jQuery('.popup__head-title').text('Instructions for Find Buddy');

			jQuery('.popup__body').html("<div class='instructions__popup'><p>Hey Buddy, want to find buddy faster? Make sure to give these details!</p><ol><li>About Me: (tell about what do you do professionally, your hobbies, your love for travel)</li><li>When are you available: (give a time frame when you want to catchup, dates, time)</li><li>Activities you want to do: (DO you want to sit in coffee shop & Talk or go on trek or share a trip cost or experience a cuisine)</li><li>How will they reach you: be very clear how do you want the buddies to contact you!</li><li>Post at least 7 days before the date</li></ol><h5>Example of a good Find Buddy Post:</h5><p>Hi Buddie, my name is Gaurav, I work in a IT company in Bangalore! I am an avid collector of postcards and fridge magnets from wherever I travel and love to explore new places. Beaches are my favourite and cafes with good interiors attract me like nothing else.</p><p>I am looking for buddies on the weekend from 7pm onwards, I want to expand my social circle.</p><p>I have found this great cafe where I usually hang out, I would like to catch up there!</p><p>Please show interest if you want to catchup, do DM me your phone number so that I can reach out to connect!</p><p>Looking forward to catch up with lots of buddies!</p></div>"
			);
		}
		else if (extra == 'findMeetups') {
			jQuery('.popup__master').addClass('popup__master--addFindMeetupInstructions');
			jQuery('.popup__head-title').text('Instructions for Find Meetups');

			jQuery('.popup__body').html('<div class="instructions__popup"><h5>Step 1</h5><p><b>Post your Meetup:</b></p><ul><li>Post your Meetup 7 to 15 days in advance to get more response</li><li>Give all details including location, time, cost & inclusions</li><li>On Actuals are the best to attract more buddies</li></ul><h5>Step 2</h5><p>Reply to Buddies</p><h5>Step 3</h5><p>Post your successful Meet up pics on Travel Buddy to get more participants for your future meetup</p><p>Create your OWN CITY Centric Travelers Community!</p></div>'
			);
		}

		managePopups('show', '');
		// jQuery('.popup__master').fadeIn(200);
	}
	else if (state == 'response') {
		console.log(data);
		checkProcessing = false;
		if ( extra != 'editFindBuddy') {
			jQuery('#main__tabs ul li.tab__item[data-tab="trending"]').trigger('click');
		}
 
		if (data.responseCode !== 200) {
			toast(data.errorMessage);
		}
		else {
			mediaList = data.object.mediaList;
			//Check if the mediaList has any video and cancelling the loop if it has
			checkProcessing = mediaList.some(media => media.mediaType == 'video');
		}
        
		if (checkProcessing) {
			console.log('Media Id', data.object.postId);
			// Call the isProcessing function to check the processing Status
			jsInit('isProcessing', { postId: data.object.postId }, true)
		}
		else {
			if (data.request.isEditPost && data.request.postId != '0' && data.request.postId != undefined && data.request.postId != '') {
                jsInit('fetchPost', { postId: data.request.postId }, 'showUpdatedPost');                
            }
            else {
				postLoader('hide');
				refreshFeed();
				toast('Your Post has been uploaded.');
				clearAndGoBack();
				var meetupsTab = jQuery('.tab__item[data-tab="find"]');
				meetupsTab[0].scrollIntoView();
			}
		}
	}
	else if (state == 'mediaPopup') {
		jQuery('.popup__master').addClass('popup__master-mediaPopup');
		jQuery('.popup__head-title').text('Upload');
		jQuery('.popup__body').html('<div class="addPostMedia__box"><div class="addPostMedia__box-item" data-type="camera">' + icons.addPostCamera + ' Camera</div><div class="addPostMedia__box-item" data-type="video">' + icons.addPostVideo + ' Video</div><div class="addPostMedia__box-item" data-type="gallery">' + icons.addPostGallery + ' Gallery</div></div>');
		managePopups('show', '');
	}
	else if (state == 'meetup') {
		jQuery('#footer ul li[data-item="feed"]').trigger('click');
		jQuery('.tab__item[data-tab="meetups"] a').click();

		manageUserProfile('clean');
		refreshFeed();

		//Clearing the form
		jQuery('#addPost__share, #addPost__find-meetups, #addPost__find-buddy, #addPost__ask, #addPost__find-influencers').each(function() { this.reset(); });

		jQuery('#share__media, #share__uploading').val('');
		setTimeout(function () {
			loaderMain('master', false);
		}, 1000);

	}
	else if (state == 'buddy' || state == 'ask') {
		if (extra == 'findBuddyAi') {
            toast('We have notified our AI to find you a buddy. You will be notified once we find a right match for you.');
            return;
        }
		jQuery('#footer ul li[data-item="feed"]').trigger('click');
		manageUserProfile('clean');
		refreshFeed();

		jQuery('#share__media, #share__uploading').val('');
        postLoader('hide');
		if (state == 'buddy') {
			jQuery('.editImage, #main__addPost-box').remove();
			
            jQuery('#share__media, #share__uploading').val('');
            jQuery('.addPost__post').html('Post');
            jQuery('.heading-similar__trips').css('display', 'none');
			setTimeout(function () {
				redirect('view_related-findBuddies', { title: 'Similar Plans', id: data.object.postId, location: data.request.location, lat: data.request.lat, lng: data.request.lng});
                // managePopups('show','findBuddy');
                // renderFeed([response.object.list[0]], '.popup__master--findBuddySimilar .popup__body');
				// .popup__master--findBuddySimilar .popup__body
				renderCheapestFlight({'destination': data.request.location.split(',')[0] }, `[data-id="${data.object.postId}"]`);
			}, 2000);
		}
		else {
			console.log(data);
			setTimeout(function () {
				redirect('ask_view-related', { title: 'Similar Plans', location: data.request.location });
			}, 2000);
		}
		setTimeout(function () {
			loaderMain('master', false);
		}, 1000);

		var meetupsTab = jQuery('.tab__item[data-tab="find"]');
		meetupsTab[0].scrollIntoView();

		//Clearing the form
		jQuery('#addPost__share, #addPost__find-meetups, #addPost__find-buddy, #addPost__ask, #addPost__find-influencers').each(function() { this.reset(); });

		toast('Your Post has been uploaded.');

	}
	else if (state == 'isProcessing') {
		if (data.responseCode == 200 && data.video_processed == true) {
			postLoader('hide');
			refreshFeed();
			toast('Your Post has been uploaded.');
		}
		else if (data.responseCode == 200 && data.video_processed == false) {
			if (extra) {
				toast('Post Uploaded. You will be notified once the video is processed.', 3000);
			}
			jsInit('isProcessing', { postId: data.postId }, false)
		}
	}
	function renderShareTab(icons) {
		return '';
		socialSection = renderSocialSection(icons);
		privacySection = renderPrivacySection(icons);

		renderItem =
			'<div class="addPost__share addPost__item"><form id="addPost__share"><div class="form__section form__section-beige relative"><input type="file" name="share__upload" multiple="multiple" class="my-pond" id="share__upload"><div class="form__row form__upload"><div class="form__column"><div class="form__upload-left">Upload Photos/Videos<span>Narrate a visual story of your travel experience!</span></div><div class="form__upload-right"><div class="upload__overlay-mobile"></div><div class="form__upload-btn">' + icons.plus + '</div></div></div></div><span class="size__limit">( Image size limit = 10 Mb / Video size limit = 200 Mb )</span></div><div class="form__section"><div class="form__row"><div class="form__column"><label for="share__location">Describe your travel experience..</label><div class="hanging__name"><input type="text" name="share__location" placeholder="Type to add a location" id="share__location"><input type="text" name="share__location_lat" placeholder="Type to add a location" id="share__location_lat"><input type="text" name="share__location_lng" placeholder="Type to add a location" id="share__location_lng"><span>Location</span></div></div></div><div class="form__row"><div class="form__column"><div class="hanging__name"><textarea class="autosize addPost__textarea" name="share__description" id="share__description" placeholder="Share stories about your experience with buddies.." cols="30" rows="5" maxlength="2500" resize="none"></textarea><span>Description</span></div></div></div></div>' + privacySection + socialSection + renderFormEnd('post') + '<input type="file" onchange="manageAddPost(this)" name="share__upload_select" multiple="multiple" class="share__upload_select" id="share__upload_select" style="display: none;"></form></div>';

		return renderItem;
	}

	function renderFindTab(icons) {
		socialSection = renderSocialSection(icons);
		prefferedBuddiesSection = renderPrefferedBuddies(icons);
		findBuddyForm = renderFindBuddyForm(socialSection, prefferedBuddiesSection);
		findMeetupsForm = renderFindMeetupForm(socialSection, prefferedBuddiesSection);
		findInfluencersForm = renderFindInfluencersForm(prefferedBuddiesSection);
		findTypeTabs = renderFindTypeTabs(findBuddyForm, findMeetupsForm, findInfluencersForm);
		renderItem = '<div class="addPost__find addPost__item active">' + findTypeTabs + '</div>';

		return renderItem;

		function renderFindTypeTabs(findBuddyForm, findMeetupsForm, findInfluencersForm) {
			renderItem = '<div class="addPost__find-tabs"><ul><li class="hidden" data-tab="buddy">Buddies</li><li class="hidden" data-tab="experiences">Trips</li><li class="hidden" data-tab="influencers">Influencers</li></ul></div><div class="addPost__find-buddy addPost__find-item active">' + findBuddyForm + '</div><div class="addPost__find-experiences addPost__find-item">' + findMeetupsForm + '</div><div class="addPost__find-influencers addPost__find-item">' + findInfluencersForm + '</div>';
			
			//console.log('findForm', findBuddyForm);

			return renderItem;
		}

		function renderFindBuddyForm(socialSection, prefferedBuddiesSection) {
			findFirstFields = renderFindFirstFields('Buddy', prefferedBuddiesSection);
			isVerified = manageUserProfile('read', 'isVerified');
			renderItem = '<form id="addPost__find-buddy">' + findFirstFields  + socialSection + renderFormEnd('find') + '<div class="hidden"><input type="hidden" class="hidden" name="share__uploading" id="share__uploading" value="ready"><input type="hidden" class="hidden" name="share__media" id="share__media" value=""></div></form>';

			return renderItem;
		}

		function renderFindMeetupForm() {
			findExperienceFields = renderFindExperienceFields('Experiences');
			renderItem = '<form id="addPost__find-experiences">' + findExperienceFields + '</form>';
			return renderItem;
		}

		function renderFindInfluencersForm(prefferedBuddiesSection) {
			renderItem = '<form id="addPost__find-influencers"><div class="form__section"><div class="form__row"><div class="form__column"><label for="findInfluencer__location">Connect with local influencers to get the juiciest travel destination tit bits</label><input type="text" name="findInfluencer__location" placeholder="Type to add a location" id="findInfluencer__location"></div></div></div>' + prefferedBuddiesSection + renderFormEnd('find') + '</form>';

			return renderItem;
		}


	}

	function renderAskTab(icons) {
		return '';
		let priceChallengeImages = [
			'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Feed%20Card%20Images%2Fprice-prom.webp?alt=media&token=f2a85d67-3542-4491-afce-29e264dc9d4c',
			'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Feed%20Card%20Images%2Fprem-banner.webp?alt=media&token=60b8841d-f839-4a68-9f89-c44cb6af98ea',
			'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Feed%20Card%20Images%2Fnew_banner-growth.png?alt=media&token=da3639e1-2ca9-4a0c-8b30-c2d040e70064',
		];
		
		let randomIndex = Math.floor(Math.random() * priceChallengeImages.length);
		let randomImage = priceChallengeImages[randomIndex];

		let flightCont = '<div class="flightsDiscount__header-container-add-post flights"><img src="' + randomImage + '" alt="Flights & Services"></div>';
		renderItem =
			'<div class="addPost__ask addPost__item"><form id="addPost__ask"><div class="form__section"><div class="form__row"><div class="form__column"><label for="ask__location">Ask a local</label><div class="hanging__name"><input type="text" name="ask__location" placeholder="Type to add a location" id="ask__location"><input type="text" name="ask__location_lat"  id="ask__location_lat"><input type="text" name="ask__location_lng" id="ask__location_lng"><span>Location</span></div></div></div><div class="form__row"><div class="form__column"><div class="hanging__name"><textarea class="autosize addPost__textarea" name="ask__description" id="ask__description" placeholder="What do you want to ask a local?" cols="30" rows="5" maxlength="1800" resize="none"></textarea><span class="character_count" data-count="0">0/1800 Characters</span><span>Description</span></div></div></div></div>' +
			flightCont + renderFormEnd('ask') +
			'</form></div>';

		return renderItem;
	}

	function socialToggle(social) {
		checked = '';

		if (social == 'facebook') {
			checked = 'checked';
		}

		renderItem = '<label class="switch"><input type="checkbox" ' + checked + '><span class="slider round"></span></label>';

		return renderItem;
	}

	function renderSocialSection(icons) {
		renderItem =
			'<div class="form__section"><div class="form__row form__social"><div class="form__column"><label class="form__social-head">Post to other social media accounts</label><div class="form__social-items"><div class="form__social-item"><div class="form__social-item-left">' + icons.addPostFacebook + ' Facebook</div><div class="form__social-item-right"><div class="form__social-item-user">Aisha Chawla<label class="switch"><input type="checkbox" checked=""><span class="slider round"></span></label></div><div class="form__social-item-toggle"><div class="form__social-item-toggle__btn"></div></div></div></div><div class="form__social-item"><div class="form__social-item-left">' + icons.addPostTwitter + ' Twitter</div><div class="form__social-item-right"><div class="form__social-item-user"><label class="switch"><input type="checkbox"><span class="slider round"></span></label></div><div class="form__social-item-toggle"><div class="form__social-item-toggle__btn"></div></div></div></div><div class="form__social-item"><div class="form__social-item-left">' + icons.addPostInsta + ' Instagram</div><div class="form__social-item-right"><div class="form__social-item-user"><label class="switch"><input type="checkbox"><span class="slider round"></span></label></div><div class="form__social-item-toggle"><div class="form__social-item-toggle__btn"></div></div></div></div></div></div></div></div>';

		//Don't render it for now
		renderItem = '';

		return renderItem;
	}

	function renderPrefferedBuddies(icons) {
		renderItem = '<div class="form__section form__section-lime"><div class="form__row"><div class="form__column"><label for="findBuddy__preferred">Preferred Buddies</label><div class="form__checkbox checkbox__gender"><div class="checkbox-item checked"><label for="findBuddy__preferred-any">' + icons.anyGender + ' Any</label><input type="radio" id="findBuddy__preferred-any" name="findBuddy__preferred" value="any" checked></div><div class="checkbox-item"><label for="findBuddy__preferred-male">' + icons.male + ' Male</label><input type="radio" id="findBuddy__preferred-male" name="findBuddy__preferred" value="male"></div><div class="checkbox-item"><label for="findBuddy__preferred-female">' + icons.female + ' Female</label><input type="radio" id="findBuddy__preferred-female" name="findBuddy__preferred" value="female"></div><div class="checkbox-item"><label for="findBuddy__preferred-couple">' + icons.couple_icon + ' Couple</label><input type="radio" id="findBuddy__preferred-couple" name="findBuddy__preferred" value="neutral" ></div></div></div></div></div>';
		
		return renderItem;
	}

	function renderPrivacySection() {
		//renderItem = '<div class="form__section form__section-lime"><div class="form__row form__privacy"><div class="form__column"><div class="form__column-flex"><div class="form__column-left"><label for="share__privacy">Privacy</label><span>Share with</span></div><div class="form__column-right"><select name="share__privacy" id="share__privacy"><option value="0" selected>Everyone</option><option value="1">Everyone who follows me</option></select></div></div></div></div></div>';
		let priceChallengeImages = [
			'/view/assets/img/member_banner-one.webp',
			'/view/assets/img/member_banner-two.webp',
			'/view/assets/img/member_banner-three.webp'
		];
		
		let randomIndex = Math.floor(Math.random() * priceChallengeImages.length);
		let randomImage = priceChallengeImages[randomIndex];

		return `<div class="flightsDiscount__header-container-add-post flights">
					<img src=${randomImage} alt="Flights & Services">
				</div>`;

		// return renderItem;
	}

	function renderFindFirstFields(type, prefferedBuddiesSection) {
		titleItem = type;

		if (type == 'Buddy') {
			titleItem = 'Trip';
		}
		
		// Render the Check box based on the user is verified or not
		isVerified = manageUserProfile('read', 'isVerified'); 
		let priceChallengeImages = [
			'/view/assets/img/member_banner-one.webp',
			'/view/assets/img/member_banner-two.webp',
			'/view/assets/img/member_banner-three.webp'
		];
		
		let randomIndex = Math.floor(Math.random() * priceChallengeImages.length);
		let randomImage = priceChallengeImages[randomIndex];

		renderItem =
			`
			  <div class="heading-similar__trips">
				<div class="similar__trips">
				  <img class="view__similar-icon" src="/view/assets/img/view_similar.png"> Similar Trips
				</div>
			  </div>
			  <div class="trip__location">
				<input type="text" name="share__location_findBuddy" placeholder="Type to add a location" id="share__location-find" class="pac-target-input" autocomplete="off">
				<input type="text" name="share__location_lat" placeholder="Type to add a location" id="share__location_lat-find">
				<input type="text" name="share__location_lng" placeholder="Type to add a location" id="share__location_lng-find">
				<span>Trip Location</span>
			  </div>
			  <div class="trip__date-type"></div>
			  <div class="trip__dates">
				<div class="form__row">
				  <div class="form__column">
					<div class="hanging__name">
					  <input class="find__startDate" type="date" name="startDate" placeholder="Select Date" id="findStartDate">
					  <span>Trip Start Date</span>
					</div>
				  </div>
				</div>
				<div class="form__row">
				  <div class="form__column">
					<div class="hanging__name">
					  <select id="dropdownDuration">
						<option value="1">1 Day</option>
						<option value="2" selected>2 Days</option>
						<option value="3">3 Days</option>
						<option value="4">4 Days</option>
						<option value="5">5 Days</option>
						<option value="6">6 Days</option>
						<option value="7">7 Days</option>
						<option value="8">8 Days</option>
						<option value="9">9 Days</option>
						<option value="10">10 Days</option>
					  </select>
					  <span>Trip Duration</span>
					</div>
				  </div>
				</div>
			  </div>
			  	<!-- Upload Area -->
				<div id="uploadAreaFind" class="uploader animate-fade">
					<div class="uploader__area">
						<div class="uploader__icon">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
							<circle cx="8.5" cy="8.5" r="1.5"></circle>
							<polyline points="21 15 16 10 5 21"></polyline>
							</svg>
						</div>
						<div class="uploader__text">
							<h3 class="uploader__heading">Share your best moments</h3>
							<p class="uploader__description">To find your perfect Travel Buddy</p>
						</div>
						<button id="chooseMedia" class="btn btn--gradient">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
							<polyline points="17 8 12 3 7 8"></polyline>
							<line x1="12" y1="3" x2="12" y2="15"></line>
							</svg>
							Select Media
						</button>
					</div>
				</div>
				${prefferedBuddiesSection}
			  <div class="date__type">
				<div class="trip__description">Date Type</div>
				<div class="cat_date">
				  <div class="flexible_dates selection" data-type="" data-value="flexible">
					<input type="radio" name="dateType" id="flexibleDate" class="invisible-checkbox-find" value="flexible" checked>
					<span class="icon-flexibleDate">${icons.experienceDate}</span>Flexible
				  </div>
				  <div class="flexible_dates">
					<input type="radio" name="dateType" id="fixedDate" class="invisible-checkbox-find" value="fixed">
					${icons.fixed_dates}Fixed
				  </div>
				</div>
			  </div>
			  <div class="traveler__type">
				<div class="trip__description">Traveler Type</div>
				<div class="cat__types">
				  <div class="flexible_dates" data-type="" data-value="flexible">
					<input type="radio" name="travelerType" id="male" class="invisible-checkbox-find" value="solo">
					${icons.solo_icon}Solo
				  </div>
				  <div class="flexible_dates selection" data-type="" data-value="flexible">
					<input type="radio" name="travelerType" id="friends" class="invisible-checkbox-find" value="friends" checked>
					${icons.friends_icon}Friends
				  </div>
				  <div class="flexible_dates" data-type="" data-value="flexible">
					<input type="radio" name="travelerType" id="family" class="invisible-checkbox-find" value="family">
					${icons.family_icon}Family
				  </div>
				  <div class="flexible_dates" data-type="" data-value="flexible">
					<input type="radio" name="travelerType" id="couple" class="invisible-checkbox-find" value="couple">
					${icons.couple_icon}Couple
				  </div>
				  <div class="flexible_dates" data-type="" data-value="flexible">
					<input type="radio" name="travelerType" id="group" class="invisible-checkbox-find" value="group">
					${icons.group_icon}Group
				  </div>
				</div>
			  </div>
			  <div class="budget__type">
				<div class="trip__description">Budget Type</div>
				<div class="cat_budget">
				  <div class="flexible_dates selection" data-type="" data-value="flexible">
					<input type="radio" name="budgetType" id="backpacking" class="invisible-checkbox-find" value="backpacking" checked>
					${icons.backpack_icon}Backpacking
				  </div>
				  <div class="flexible_dates" data-type="" data-value="flexible">
					<input type="radio" name="budgetType" id="premium" class="invisible-checkbox-find" value="premium">
					${icons.premium_icon}Premium
				  </div>
				</div>
			  </div>
			  <div class="form__row description-find">
				<div class="form__column">
				  <div class="hanging__name">
					<textarea class="autosize addPost__textarea" name="findBuddy__description" id="findBuddy__description" placeholder="Tell us your requirements to find like minded Travel Buddies.." cols="30" rows="5" maxlength="1800" resize="none"></textarea>
					<span class="instructions">What should I write?</span>
					<span class="character_count" data-count="0">0/1800 Characters</span>
					<span>Trip Description</span>
				  </div>
				</div>
			  </div>
			  <div class="flightsDiscount__header-container-add-post flights">
					<img src=${randomImage} alt="Flights & Services">
				</div>
			`;
			
        
		

		return renderItem;
	}

	function renderFindExperienceFields(type) {
		titleItem = type;

		if (type == 'Buddy') {
			titleItem = 'Trip';
		}
		
		function renderCheckBox(type, label, toggleClass) {
			renderCheckBoxFind = '<div class="checkBoxFind exp '+ type +'"><input type="checkbox" id="findBuddyGroup'+ type +'" data-toggle='+ toggleClass +' name="findBuddyGroup"><label for="myCheckbox">'+ label +'</label></div>';
			return renderCheckBoxFind;
		}

		renderItem =
			'<div class="form__section"><div class="form__row"><div class="form__column"><div class="hanging__name"><input type="text" name="find' + type + '__location" placeholder="Type to add a location" id="find' + type + '__location"><input type="text" name="find' + type + '__location_lat" id="find' + type + '__location_lat"><input type="text" name="find' + type + '__location_lng" id="find' + type + '__location_lng"><span>' + titleItem + ' Location</span></div></div></div><div class="date-selection"><div class="form__row"><div class="form__column"><div class="hanging__name"><input class="experience-date-select" type="date" name="startDate" placeholder="Select Date" id="experienceStartDate"><span>Start Date</span></div></div></div><div class="form__row"><div class="form__column"><div class="hanging__name"><input class="experience-date-select" type="date" name="endDate" placeholder="Select Date" id="experienceEndDate"><span>End Date</span></div></div></div></div>'+ renderCheckBox('Date', "Any Dates", ".date-selection") +'<div class="form__row category-experience"><div class="form__column"><div class="hanging__name category-experience-list"><input type="text" name="category" readonly="readOnly" placeholder="Select Category" id="experienceCategory"><span>' + titleItem + ' Category</span><i class="fa-solid fa-caret-down" style="margin-left:93%;position:absolute;color:#fff"></i><div class="category-dropdown"><ul class="experinece_category_selectList"><li>Bagpacking</li><li>Adventure Travel</li><li>Cultural Tourism</li><li>Family</li><li>Mountaineering</li><li>Beach</li><li>Kayaking</li><li>Religious Tourism</li><li>City Tour</li><li>Trekking</li><li>Historical Tourism</li><li>Biking Tours</li><li>Heritage Walks</li><li>Waterfalls</li><li>Meet Ups</li><li>Home Stays</li><li>Offroading</li><li>Jungle Safari</li><li>Arts and Crafts</li><li>Pub Crawling</li><li>Water Sports</li><li>Shopping</li><li>Events and Exhibitions</li><li>Diving</li><li>Sustainable Living</li><li>Health and Fitness</li><li>Winter Sports</li><li>Caving</li></ul></div></div></div></div>'+ renderCheckBox('Categories', "All categories",".category-experience") +'<div class="price-selection"><div class="form__row"><div class="form__column"><div class="hanging__name experience-pricing"><i class="fa-solid fa-indian-rupee-sign"></i><input type="number" name="minPrice" placeholder="500" id="experienceFrom"><span>' + titleItem + ' From</span></div></div></div><div class="form__row"><div class="form__column"><div class="hanging__name experience-pricing"><i class="fa-solid fa-indian-rupee-sign"></i><input type="number" name="maxPrice" placeholder="5000" id="experienceTo"><span>' + titleItem + ' To</span></div></div></div></div>'+ renderCheckBox('Price', "All Prices", ".price-selection" ) +'<div class="form__row"><div class="form__column"><div class="experience-submit-btn"><button>Find</button></div></div></div></div>';

		return renderItem;
	}

	function renderFormEnd(type) {
		renderItem = '<div class="form__section form__submit"><div class="form__row"><div class="form__column text-right"><button class="addPost__post_discard">Discard</button><button class="addPost__post">' + type + '</button></div></div></div>';

		//Disabling it for now
		// renderItem = '<div class="form__section"><div class="form__row form__err"></div></div>';

		return renderItem;
	}
}

function renderInfluencers(state, data, element) {
	if (state == 'init') {
		jQuery('#secondary .secondary__tab .drawerBody').html('<div class="influencer__page"><div class="influencer__search"><input type="text" name="influencer__search" id="influencer__search" placeholder="Search Location"><span>' + icons.searchBar + '</span></div><div class="influencer__body"></div><div class="influencer__search-box"></div></div>');

		if (data) {
			jsInit('fetchInfluencers', { location: data.location, gender: data.gender, pageNumber: 0 });
		}
		else {
			payload = (localStorage.getItem('userLat')) ? { "lat": localStorage.getItem('userLat'), "lng": localStorage.getItem('userLng') } : { "lat": "28.5355", "lng": "77.39" };
			jsInit('fetchAllInfluencers', payload)
		}
	}
	else if (state == 'render') {
		console.log(data);
		if (data.responseCode !== 200) {
			toast(data.responseMessage);
			noInfluencersFound();
		}
		else {
			where = '.influencer__body';

			if (element == 'influencer_search') {
				where = '.influencer__search-box';
				jQuery(where).html('');

				jQuery('.influencer__body').hide();
				jQuery('.influencer__search-box').show();
			}
            else if (element == '.daywise-itinerary.infAnchor') {
                where = '.daywise-itinerary.infAnchor';
            }

			if (data.object.length > 0) {
				data.object.forEach((influencer) => {
					jQuery(where).append(renderInfluencer(influencer));
				});
			}
			else {
				noInfluencersFound(where);
			}

			loaderMain('secondary', false);
		}
	}

	function renderInfluencer(influencer) {
		renderItem = '<div class="influencer__item" data-user="' + influencer.userId + '"><div class="influencer__item-left"><div class="influencer__item-image"><img src="' + renderUserProfileImage(influencer.imageUrl) + '" alt=""></div><div class="influencer__item-name" data-name="' + influencer.name + '">' + influencer.name + '<span class="influencer__item-location">' + influencer.city + '</span></div></div><div class="influencer__item-right"><div class="influencer__item-connect">Connect</div></div></div>';

		return renderItem;
	}

	function noInfluencersFound(where) {
		jQuery(where).html('<div class="no-posts"><div class="no-posts__icon">' + icons.happySmiley + '</div><div class="no-posts__text">No Influencers Found</div></div>');

		return renderItem;
	}
}

// function renderGalleryServices(medias) {
//     renderItem = '<div class="experience__gallery-full"><div class="swiper-wrapper">';

//     if (medias.listingMedia) {
//         //Render the upper gallery
//         medias.forEach(media => {
//             renderItem += '<div class="swiper-slide"><img src="' + renderUserProfileImage(media.userProfileImage) + '" alt=""></div>';
//         });
//         renderItem += '</div>';
//         renderItem += '<div class="swiper-pagination swiper-pagination-bullets swiper-pagination-horizontal"><span class="swiper-pagination-bullet swiper-pagination-bullet-active" aria-current="true"></span><span class="swiper-pagination-bullet"></span></div>';
//         renderItem += '</div>';

//         //Render the thumbnail gallery
//         renderItem += '<div class="experience__gallery-thumbs"><div class="swiper-wrapper">';
//         medias.forEach(media => {
//             renderItem += '<div class="swiper-slide"><img src="' + renderUserProfileImage(media.mediaPath) + '" alt=""></div>';
//         });
//         renderItem += '</div></div>';
//     }

//     return renderItem;
// }

function isElementInViewport(elem) {
	var $elem = $(elem);
	var viewportTop = $(window).scrollTop();
	var viewportBottom = viewportTop + $(window).height();
	var elemTop = $elem.offset().top;
	var elemBottom = elemTop + $elem.height();
	return elemBottom > viewportTop && elemTop < viewportBottom;
}

//Experiences
function renderExperience(state, data, type) {
    originalType = type;
	if (state == 'init') {
		if (type == 'experience' && data && data.object) {
			data = data.object[0];
			hostedText = 'Hosted By';
		}
		else if (type == 'service' || type == 'manageService') {
			data = data.object;
			console.log(data);
			hostedText = 'Offered By';
            type = 'service';
		}

		if (data) {
			console.log(data);
	
			hostName = renderHostName(type, data);
			gallery = renderGallery(data, type);
			category = renderCategoryServices(data, type);
			content = renderContent(data, type);
			itenerary = renderItinerary(data, type);
			hostInstructions = renderHostInstructions(data, type);
			pricingInfo = renderPricingInfo(data, type);
			policies = renderPolicies(data, type);
			ratings = renderRatings(data, type);
			userDisplayPicture = renderUserDisplayPicture(data, type);
			userAbout = renderUserAbout(data, type);
			title = renderTitle(data, type);
			listingLocation = renderListingLocation(data, type);
			pricing = renderPricing(data, type, pricingInfo);
			attributes = renderAttributes(data, type);
			map = renderMap(data, type);
			id = type == 'experience' ? data.id : data.listingId;
			userId = type == 'experience' ? data.host_id : data.listedBy;
			categoryType = type == 'experience' ? data.category : '';
			isInfluencer = getRoleType(type, data) == 7;
			imagePath = getProfileImage(renderUserProfileImage(userDisplayPicture), '', '', '', isInfluencer);

			jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="single__experience-page" data-id="' + id + '" data-category="' + categoryType + '" data-type="' + data.type + '"><div class="experience__gallery">' + gallery + '</div><div class="experience__head"><div class="experience__head-left"><div class="experience__head-title"><h1>' + title + '</h1></div><div class="experience__head-category">' + category + '</div><div class="experience__head-location"><div class="experience__head-location-left">' + icons.location + '</div><div class="experience__head-location-right">' + listingLocation + '<span></span></div></div></div><div class="experience__head-right"><div class="experience__head-host" data-user=' + userId + '><span>' + hostedText + '</span>'+ imagePath +'<span class="hostedBy">' + hostName + '</span></div></div></div>' + ratings + pricing + '<div class="experience__content">' + content.replaceAll('<p>&nbsp;</p>', '') + '<div class="experience__itenary">' + itenerary + '</div></div>' + attributes + map + hostInstructions + userAbout + policies + '<div class="experience__booking"></div></div>'
			);

			galleryNav();
			swiper('experienceGalleryFull', '.experience__gallery-full');
			localStorage.setItem('calendarSlots', JSON.stringify(data.calendarSlots));
			renderBottomBooking(data, originalType);
			newWindowAllLinks();
			loaderMain('secondary', false);
			localStorage.setItem('selectedExperience', JSON.stringify(data));
			renderLinksSocial(data);
            
            if (originalType == 'manageService') {
                jQuery('.experience__booking').css('bottom', '65px');
            }

			else if (type == 'service') {
                jQuery('.experience__booking').css('bottom', '0');
			}
			else {
				leadFormShown = false;
				function checkButtonVisibility() {
					if (isElementInViewport('.experience__host-head')) {
						leadFormShown = true;
						renderPermissionBox('init','leadForm', jQuery('.experience__head-title').text(), jQuery('.experience__gallery .experience__gallery-full .swiper-slide-active img').attr('src'));
					}
				}
				jQuery('.single__experience-page').on('scroll', function() {
					if (!leadFormShown)
						checkButtonVisibility();
				});
				/*LOADING ENQUIRY FORM IN INDIVIDUAL EXPERIENCE*/
                /*setTimeout(() => {
                    if (!guestMaster()) {
						renderPermissionBox('init','leadForm', jQuery('.experience__head-location-right').text());
                    }
                }, 3000);*/
                
                jQuery('.experience__booking').css('bottom', '0');
            }
		}
		else {
			console.log('No Experience Found');
			console.log(data);
			render404('Experience Not Found');
		}
	}
	else if (state == 'expressInterest') {
		//Check response code
		// Track events with additional attributes
		console.log(data);
		renderBottomBooking('clickExpressInterest', 'service');
	}
	else if (state == 'policies') {
	}
	else if (state == 'experienceBooking') {
		managePopups('show', 'experienceBooking');
		jQuery('.popup__master').addClass('popup__master--experience__booking');
		jQuery('#app .popup__master .popup__head-title').html('Select your slot');

		months = renderMonths();
		selExperience = localStorage.getItem('selectedExperience');
		selExp = JSON.parse(selExperience);
		minPax = selExp.min_pax;

		jQuery('#app .popup__master .popup__body').append('<div class="booking__box"><form id="booking__box"><div class="booking__box-item booking__box-date form__row"><div class="form__column"><label for="booking__month">Month</label><select name="booking__month" id="booking__month">' + months + '</select></div><div class="form__column"><label for="booking__date">Date</label><select name="booking__date" id="booking__date"></select></div></div><div class="booking__box-item booking__box-slots"><div class="booking__slots-selected">Thursday, 7 - 8AM<span class="booking__slots-left"></span></div><div class="booking__slots"><ul></ul></div></div><div class="booking__box-item booking__box-tickets"><div class="booking__box-tickets__title">How many people are going?</div><div class="form__plusMinus"><div class="number"><span class="minus">-</span><input type="number" min="' + minPax + '" value="' + minPax + '" id="bookingSummary__tickets" name="bookingSummary__tickets" disabled><span class="plus">+</span></div></div></div><div class="booking__box-button">Book Now</div></form></div>');

		renderDate();
		renderSlots();
		formPlusMinus();
		jsInit('getAvailableTickets', { calendarSlotId: jQuery('.booking__slots ul li.active').attr('data-id') }, '#bookingSummary__tickets');
		// jQuery('#booking__month').niceSelect();
		// jQuery('#booking__date').niceSelect();
	}
	else if (state == 'bookingMonthChange') {
		renderDate();
	}
	else if (state == 'bookingDateChange') {
		renderSlots();
	}
	else if (state == 'renderBookingValues') {
		jQuery('.experience__booking').html('');
		jQuery('.experience__booking').html(renderBottomBooking(data, 'experience', true));
	}
	else if (state == 'setNoOfPax') {
		slots = localStorage.getItem('calendarSlots');
		slots = JSON.parse(slots);
		selCalSlot = slots.filter(obj => {
			return obj.id == data
		})[0];
		selExperience = localStorage.getItem('selectedExperience');
		selExp = JSON.parse(selExperience);
		minPax = selCalSlot.batch_size == selCalSlot.ticketsLeft ? selExp.min_pax : 1;
		jQuery('.form__plusMinus #bookingSummary__tickets').attr({ 'min': minPax, 'value': minPax });
	}

	function getRoleType(type, data){
		roleType = '';

		if (type == 'experience'){
			roleType = data.hostDetails.roleType;
		}
		else if (type == 'service'){
			roleType = data.userRoleType;
		}

		return roleType;
	}

	function renderHostName(type, data) {
		renderItem = '';

		if (type == 'experience') {
			renderItem = data.hostDetails.userName;
		}
		else if (type == 'service') {
			renderItem = data.userName;
		}

		return renderItem;
	}
	function renderListingLocation(data, type) {
		renderItem = '';

		if (type == 'experience') {
			renderItem = data.location;
		}
		else if (type == 'service') {
			renderItem = data.listingCity;
		}

		return renderItem;
	}

	function renderTitle(data, type) {
		renderItem = '';

		if (type == 'experience') {
			renderItem = data.title;
		}
		else if (type == 'service') {
			renderItem = data.listingName;
		}

		return renderItem;
	}

	function renderUserDisplayPicture(data, type) {
		renderItem = '';

		if (type == 'experience') {
			renderItem = data.hostDetails.userDisplayPicture;
		}
		else if (type == 'service') {
			renderItem = data.userProfileImage;
		}

		return renderItem;
	}

	function renderPricing(data, type, pricing_info) {
		renderItem = '';

		if (type == 'experience') {
			renderItem = '<div class="experience__pricing">Experience Value :<span class="experience__price" data-price="' + data.pricing + '">₹' + numberWithCommas(data.pricing) + '</span><span class="experience__price-gst">(plus GST)</span>' + pricing_info + '</div>';
		}
		else if (type == 'service') {
			pricing = data.costAmount == 0 ? 'Request Pricing' : '₹' + numberWithCommas(data.costAmount);
			costDuration = data.costAmount == 0 ? '' : '<span class="cost__duration">/' + data.costDuration + '</span>';

			renderItem = '<div class="experience__pricing">Service Value : <span class="experience__price request__price" data-price="' + data.costAmount + '">' + pricing + '</span>' + costDuration + '<span class="experience__price-gst request__price">(plus GST)</span>' + pricing_info + '</div><div class="social-icons-box"><ul><li class="facebook__social">' + icons.facebook + '<a href="http://www.facebook.com/' + data.socialFacebook + '" target="_blank">' + data.socialFacebook + '</a></li><li class="instagram__social">' + icons.instagram + '<a href="https://www.instagram.com/' + data.socialInstagram + '" target="_blank">' + data.socialInstagram + '</a></li><li class="twitter__social">' + icons.twitter + '<a href="http://www.twitter.com/' + data.socialTwitter + '" target="_blank">' + data.socialTwitter + '</a></li><li class="website__social">' + icons.website + '<a href="https://' + data.socialWeb + '" target="_blank">' + data.socialWeb + '</a></li></ul></div>';
		}

		//</div><div class="social__links"><div class="social__facebook"><div class="social__icon">' + icons.facebook + '</div>' + data.socialFacebook + '</div><div class="social__instagram"><div class="social__icon">' + icons.instagram + '</div>' + data.socialInstagram + '</div><div class="social__twitter"><div class="social__icon">' + icons.twitter + '</div>' + data.socialTwitter + '</div><div class="social__website"><div class="social__icon">' + icons.website + '</div>' + data.socialWeb + '</div>

		return renderItem;
	}

	function renderLinksSocial(data, type) {
		if (data.socialFacebook == 'Not Available') {
			jQuery('.facebook__social').remove();
		}
		if (data.socialInstagram == 'Not Available') {
			jQuery('.instagram__social').remove();
		}
		if (data.socialTwitter == 'Not Available') {
			jQuery('.twitter__social').remove();
		}
		if (data.socialWeb == 'Not Available') {
			jQuery('.website__social').remove();
		}
	}

	function renderUserAbout(data, type) {
		renderItem = '';

		if (type == 'experience') {
			renderItem = '<div class="experience__host-about"><div class="experience__host-about__title">About <span>' + hostName + '</span></div><div class="experience__host-about__content">' + data.hostDetails.about + '</div><div class="experience__host-stats"><div class="experience__host-stats__left"><div class="profile__follows"><div class="experience__host-followers">' + data.hostDetails.followers + '<span>Followers</span></div><div class="experience__host-followings">' + data.hostDetails.followings + '<span>Following</span></div></div></div><div class="experience__host-stats__right"><div class="profile__ratings-icon">' + generateRatingStars(data.hostDetails.totalRatings) + '</div><div class="profile__rating">Rating: ' + data.hostDetails.totalRatings + ' | Ratings: ' + data.hostDetails.totalReviews + '</div></div></div><div class="experience__host-offered" data-user="' + data.host_id + '"><div class="experience__host-offered-left">Services Offered: 3</div><div  class="experience__host-offered-right">View Full Profile ' + icons.openOut + '</div></div></div></div>';
		}

		return renderItem;
	}

	function renderAttributes(data, type) {
		renderItem = '';

		if (type == 'service') {
			if (data.listingAttribute.length > 0) {
				renderItem = '<div class="service__attributes-box"><div class="service__attributes-head">Service Details</div><div class="service__attributes">';

				data.listingAttribute.forEach((attribute) => {
					renderItem += '<div class="service__attribute" data-attribute-id="' + attribute.attributeId + '">' + icons.tick + ' ' + attribute.attributeName + '</div>';
				});

				renderItem += '</div></div>';
			}
		}

		return renderItem;
	}

	function renderMap(data, type) {
		renderItem = '';

		if (type == 'service') {
			renderItem = '<div class="services__map-box"><div class="services__map-head">How to reach?<span>' + icons.location + ' ' + data.listingAddress + '</span></div><div class="services__map-map"><iframe src="https://maps.google.com/maps?q=' + data.listingLat + ',' + data.listingLong + '&hl=es;z=11&amp;output=embed"></iframe></div></div>';
		}

		return renderItem;
	}

	function renderSlots() {
		if (slots && date) {
			console.log('Slots and date found');
			console.log(slots);
			slots = localStorage.getItem('calendarSlots');
			slots = JSON.parse(slots);
			date = jQuery('#booking__date').val();

			jQuery('.booking__slots ul').html('');

			//Show the slots based on the date
			slots.forEach((slot) => {
				if (slot.slot_date == date && slot.status == 'open') {
					start_time = slot.start_time;
					end_time = slot.end_time;

					start_time = start_time.replaceAll('Z', '');
					end_time = end_time.replaceAll('Z', '');

					start_time = new Date(start_time);
					end_time = new Date(end_time);

					//Log the start and end time
					console.log(start_time);

					day = start_time.toLocaleString('default', { weekday: 'long' });
					start_time = start_time.toLocaleString('default', { hour: 'numeric', minute: 'numeric', hour12: true });
					end_time = end_time.toLocaleString('default', { hour: 'numeric', minute: 'numeric', hour12: true });

					jQuery('.booking__slots ul').append('<li data-slot="' + slot.start_time + '" data-day="' + day + '" data-id="' + slot.id + '">' + start_time + ' - ' + end_time + '</li>');
				}
			});
		}

		jQuery('.booking__slots ul li:first-child').click();
	}

	function renderMonths() {
		renderItem = '';
		slots = localStorage.getItem('calendarSlots');
		slots = JSON.parse(slots);

		if (slots) {
			slots.forEach((slot) => {
				//Loop through the slots and get the months and add them to the select
				date = new Date(slot.slot_date);
				month = date.toLocaleString('default', { month: 'long' });

				//Check if the month is already added to the select
				if (!renderItem.includes(month)) {
					renderItem += '<option value="' + month + '">' + month + '</option>';
				}
			});
		}

		return renderItem;
	}

	function renderDate() {
		renderItem = '';
		slots = localStorage.getItem('calendarSlots');
		slots = JSON.parse(slots);
		month = jQuery('#booking__month').val();

		//Empty the select
		jQuery('#booking__date').html('');

		if (slots) {
			//Loop through the slots, match the month and add the dates to the select
			slots.forEach((slot) => {
				date = new Date(slot.slot_date);
				slot_month = date.toLocaleString('default', { month: 'long' });

				//Get the day of the week
				day = date.toLocaleString('default', { weekday: 'long' });

				//Get the date in 18th, July format
				date = date.getDate() + ' ' + month;

				if (slot_month == month) {
					jQuery('#booking__date').append('<option value="' + slot.slot_date + '">' + day + ' - ' + date + '</option>');
				}
			});
		}

		return renderItem;
	}

	function renderGallery(data, type) {
		renderItem = '<div class="experience__gallery-full"><div class="swiper-wrapper">';

		if (type == 'experience') {
			medias = data.media;
		}
		else if (type == 'service') {
			medias = data.listingMedia;
		}

		if (medias) {
			//Render the upper gallery
			if (medias.length > 0) {
				medias.forEach((media) => {
					if (type == 'experience') {
						url = media.media_url;
						thumbsUrl = media.media_thumbnail;
					}
					else if (type == 'service') {
						if (media.mediaType != 'url') {
							url = media.mediaPath;
							thumbsUrl = media.thumbNailUrl;
						}
						else {
							url = '/view/assets/img/profile_blank_bg.png';
							thumbsUrl = '/view/assets/img/profile_blank_bg.png';
						}
					}
					// renderItem based on mediaType for images & videos
					if (media.mediaType == 'image' || media.media_type == 'image') {
						renderItem += '<div class="swiper-slide"><img src="' + renderUserProfileImage(url) + '" alt=""></div>';
					}
					else if (media.mediaType == 'video' || media.media_type == 'video') {
						muted = 'muted';
						playPauseButton = 'fa-volume-mute';
						//Video Element along with a overlay to play the video and a mute button and a play pause button
						renderItem += '<div class="swiper-slide video-slide" data-type="video"><video poster = "'+ renderUserProfileImage(thumbsUrl) +'" preload="auto" autobuffer class="feed__body-video"     id="video-" playsinline loop ' + muted + '><source src="' + renderPostMedia(url, 'video') + '" type="video/mp4"></video><div class="feed__body-video-overlay"></div><div class="feed__body-video-overlay-play"><i class="fas fa-play"></i></div><div class="feed__body-video-overlay-mute services"><i class="fas ' + playPauseButton + '"></i></div></div>';
					}
					else {
						renderItem += '<div class="swiper-slide"><img src="/view/assets/img/profile_blank_bg.png" alt=""></div>';
					}
				});
			}
			else {
				renderItem += '<div class="swiper-slide"><img src="/view/assets/img/profile_blank_bg.png" alt=""></div>';
			}

			renderItem += '</div>';
			renderItem += '<div class="swiper-pagination swiper-pagination-bullets swiper-pagination-horizontal"><span class="swiper-pagination-bullet swiper-pagination-bullet-active" aria-current="true"></span><span class="swiper-pagination-bullet"></span></div>';
			renderItem += '</div>';

			//Rneder the thumbnail gallery
			renderItem += '<div class="experience__gallery-thumbs"><div class="swiper-wrapper">';

			medias.forEach((media) => {
				if (type == 'experience') {
					url = renderUserProfileImage(media.media_thumbnail);
				}
				else if (type == 'service') {
					if (media.mediaType != 'url') {
						url = renderUserProfileImage(media.thumbNailUrl);
					}
					else {
						url = '/view/assets/img/profile_blank_bg.png';
					}
				}

				renderItem += '<div class="swiper-slide"><img src="' + url + '" alt=""></div>';
			});

			renderItem += '</div></div>';
		}

		return renderItem;
	}

	function galleryNav() {
		url = window.location.href.split('#');
		url = url[0];

		jQuery('.experience__gallery').append('<div class="experience__gallery-buttons"><div class="experience__gallery-left"><div class="experience__back experience__gallery-button">' + icons.back + '</div></div><div class="experience__gallery-right"><div class="experience__send experience__gallery-button">' + icons.share + '</div><div class="experience__bookmark experience__gallery-button">' + icons.bookmark + '</div></div><div class="experience__share"><ul id="share_links"><li class="social_links"><a href="https://www.facebook.com/sharer.php?u=' + url + '" target="_blank"><i class="fa-brands fa-facebook"></i></a></li><li class="social_links"><a href="whatsapp://send?text=' + url + '" target="_blank"><i class="fa-brands fa-whatsapp"></i></a></li><li class="social_links"><a href="https://twitter.com/intent/tweet?url=' + url + '" target="_blank"><i class="fa-brands fa-twitter"></i></a></li><li class="social_links"><a class="copy-url" data-target="' + url + '"><i class="fa-solid fa-link"></i></a></li></ul></div></div>');

		setTimeout(function () {
			experienceId = jQuery('.single__experience-page').attr('data-id');
			imageUrl = jQuery(this).parents('#app').find('#secondary .secondary__tab .drawerBody .single__experience-page .experience__gallery .experience__gallery-full .swiper-wrapper .swiper-slide img').attr('src');

			//@pranavtbd you need to fix this.
			// servicesDeepLink = createDeepLink('experiences', experienceId);
			// createDynamicLink('createLink', { 'longDynamicLink': servicesDeepLink });
		}, 2000);
	}

	function renderCategory(data) {
		renderItem = '';

		if (data.categories) {
			renderItem = icons.trekking + ' ' + data.categories;
		}

		return renderItem;
	}

	function renderCategoryServices(data, type) {
		renderItem = '';

		if (type == 'experience') {
			if (data.serviceType) {
				renderItem = icons.trekking + ' ' + data.categories;
			}
		}
		else if (type == 'service') {
			if (data.serviceType) {
				renderItem = icons.trekking + ' ' + data.serviceType;
			}
		}

		return renderItem;
	}

	function renderContent(data, type) {
		renderItem = '';

		if (type == 'experience') {
			content = data.content;
		}
		else if (type == 'service') {
			content = data.listingDescription;
		}

		if (content) {
			//If it the text is not in html format then convert it to html
			if (content.indexOf('<') == -1) {
				content == content.replace('<p>&nbsp;</p>', '');
				content = '<p>' + content + '</p>';
			}

			renderItem = content;
		}

		return renderItem;
	}

	function newWindowAllLinks() {
		jQuery('.experience__content a').attr('target', '_blank');
	}

	function renderItinerary(data) {
		renderItem = '';

		try {
			if (data.itinerary) {
				if (data.itinerary[0].content[0].day !== undefined) {
					data.itinerary[0].content.forEach((itinerary) => {
						renderItem += '<div class="experience__itenary-item"><div class="experience__itenary-item__left">' + itinerary.day + '</div><div class="experience__itenary-item__right">' + itinerary.itinerary_content.replaceAll('<p>&nbsp;</p>', '') + '</div></div>';
					});
				}
			}
		} catch (error) { }

		return renderItem;
	}

	function renderHostInstructions(data, type) {
		renderItem = '';

		if (data.host_instructions && type == 'experience') {
			//If it the text is not in html format then convert it to html
			if (data.host_instructions == 'No Instructions') {
				data.host_instructions = '';
				className = 'experience__host-instructions--no-instructions';
			}
			else {
				if (data.host_instructions.indexOf('<') == -1) {
					data.host_instructions = '<p>' + data.host_instructions + '</p>';
					data.host_instructions = '<div class="experience__host-instructions">' + data.host_instructions + '</div>';
				}
				className = '';
			}
			isInfluencer = data.hostDetails.roleType == 7;
			imagePath = getProfileImage(renderUserProfileImage(data.hostDetails.userDisplayPicture), '', '', '', isInfluencer);
			renderItem = '<div class="experience__host ' + className + '"><div class="experience__host-head"><div class="experience__host-head__left">'+ imagePath +'</div><div class="experience__host-head__right"><div class="experience__host-head-name"><span>' + data.hostDetails.userName + '</span> Says...</div><div class="experience__host-head-sub">Your Host’s Instructions</div></div></div>' + data.host_instructions;
		}

		return renderItem;
	}

	function renderPricingInfo(data, type) {
		renderItem = '';

		if (data.pricing_info && type == 'experience') {
			renderItem = '<div class="experience__pricing-info">Check out more info here: <a href="' + data.pricing_info + '" target="_blank">' + data.pricing_info + '</a></div>';
		}

		return renderItem;
	}

	function renderPolicies(data, type) {
		renderItem = '';

		if (type == 'experience' || type == 'service') {
			cancellationPolicy = type == 'experience' ? '<div class="experience__policy" data-redirect="cancellation"><div class="experience__policy-left">' + icons.experience__cancellation + '</div><div class="experience__policy-right">Cancellation<span>Policy</span></div></div>' : '';

			renderItem = '<div class="experience__policies">' + cancellationPolicy + '<div class="experience__policy" data-redirect="faqs"><div class="experience__policy-left">' + icons.experience__faqs + '</div><div class="experience__policy-right">More Info<span>FAQs</span></div></div><div class="experience__policy" data-redirect="terms"><div class="experience__policy-left">' + icons.experience__legal + '</div><div class="experience__policy-right">Terms<span>Legal</span></div></div></div>';
		}

		return renderItem;
	}

	function renderBottomBooking(data, type, bypass) {
		if (type == 'experience') {
			bookingValues = renderBookingValues(data, bypass);
			bookedSlots = renderBookedSlots(data);
			selectWording = renderSelectWording(jQuery('.experience__head-location-right').text());
			slotsLeftBadge = renderSlotLeftBadge(data, 'singleExperience');
			if (jQuery('.single__experience-page') && jQuery('.single__experience-page').attr('data-type') == 'package'){
				jQuery('.experience__booking').append(slotsLeftBadge + bookingValues + '<div class="experience__booking-box"><div class="experience__booking-slot" style="width: 100%!important"><div id="lottie__enquireExp"></div><div class="experience__booking-selectSlot">' + selectWording + '</div></div</div><div class="whatsapp-us"><a href="https://wa.me/918076922474" target="_blank">' + icons.whatsApp + '</a></div>');
			}else{
				jQuery('.experience__booking').append(slotsLeftBadge + bookingValues + '<div class="experience__booking-box"><div class="experience__booking-slot"><div id="lottie__enquireExp"></div><div class="experience__booking-selectSlot">' + selectWording + '</div></div><div class="experience__booking-cta">' + icons.bookmark + ' Book Now!</div></div><div class="whatsapp-us"><a href="https://wa.me/918076922474" target="_blank">' + icons.whatsApp + '</a></div>');
			}
			loadLottieAnimation('lottie__enquireExp', '/view/assets/img/support_animation.json');
        }
		else if (type == 'service') {
			if (data.isExpressedInterest) {
				buttonText = 'Chat Now';
			}
			else if (data == 'clickExpressInterest') {
				jQuery('.services__booking-box.experience__booking-box').remove();
				jQuery('.services__booking-cta').remove();
				buttonText = 'Chat Now';
			}
			else {
				buttonText = 'Express Interest!';
			}

			jQuery('.experience__booking').append('<div class="services__booking-box experience__booking-box"><div class="services__booking-cta">' + icons.bookmark + ' ' + buttonText + '</div></div>');
		}
        else if (type == 'manageService') {
            jQuery('.experience__booking').append(`<div class="services__booking-box experience__booking-box"><button class="services__publish-btn" style="width: 48%; height: 40px; font-size: 14px; font-weight: 500;">Publish</button><button class="services__decline-btn" style="width: 48%; height: 40px; font-size: 14px; font-weight: 500;">Decline</button><button class="services__enable-btn" style="width: 48%; height: 40px; font-size: 14px; font-weight: 500;">Enable</button><button class="services__disable-btn" style="width: 48%; height: 40px; font-size: 14px; font-weight: 500;">Disable</button><button class="services__deleted-btn" style="width: 96%; height: 40px; font-size: 14px; font-weight: 500;">Delete</button></div>`);
        }

		function renderSelectWording(locationName) {
			renderItem = 'Enquire Now for ' + locationName + ' Trips!';
			return renderItem;
		}

		function renderBookedSlots(data) {
			renderItem = '';
			booking = localStorage.getItem('bookingDetails');
			booking = JSON.parse(booking);
			slots = JSON.parse(localStorage.getItem('calendarSlots'));
			slot = '';

			console.log('booking - 2');

			slots.forEach((caledarSlot) => {
				if (booking !== null) {
					if (caledarSlot.id == booking.bookingSlot) {
						slot = caledarSlot;
					}
				}
			});

			if (slot == '' || slot == null) {
				slot = slots[0];
			}
			console.log('Smooth Operators', slots, booking);
			slots.forEach(caledarSlot => {
				if (booking !== null && caledarSlot.id == booking.bookingSlot) {
					slot = caledarSlot;
				}
			});

			if (slot == '' || slot == null) {
				slot = slots[0];
			}

			if (slots.length > 0) {
				start_time = new Date(slot.start_time.replaceAll('Z', ''));
				end_time = new Date(slot.end_time.replaceAll('Z', ''));

				//Date in the 11th, July format
				date = getOrdinalNum(start_time.getDate(),true) + ', ' + start_time.toLocaleString('default', { month: 'short' });
				day = start_time.toLocaleString('default', { weekday: 'long' });
				start_time = start_time.toLocaleString('default', { hour: 'numeric', minute: 'numeric' });
				end_time = end_time.toLocaleString('default', { hour: 'numeric', minute: 'numeric', hour12: true });

				renderItem = '<span class="experience__booking-date">' + date + '</span> | <span class="experience__booking-time">' + start_time + ' - ' + end_time + '</span>';
			}


			return renderItem;
		}

		function renderBookingValues(data, bypass) {
			renderItem = '';
			booking = localStorage.getItem('bookingDetails');

			if (booking) {
				booking = JSON.parse(booking);

				if (booking.experienceId == data.id || bypass) {
					price = data.pricing ? data.pricing : data.price;
					console.log(price);

					renderItem = '<div class="experience__booking-tickets"><h5>Continue Your Booking</h5><div class="experience__booking-tickets__box"><div>' + booking.tickets + 'x Persons</div><div class="experience__booking-tickets__pricing"><span class="experience__booking-tickets__pricing-total">₹' + numberWithCommas(Number(booking.tickets) * Number(price)) + '</span><span class="experience__booking-tickets__pricing-tax">(Plus GST)</span></div></div></div>';

					jQuery('.single__experience-page').addClass('booking__active');
				}
			}

			return renderItem;
		}
	}

	function renderRatings(data, type) {
		renderItem = '';

		if (type == 'experience') {
			rating = data.rating;
			avgRatings = data.hostDetails.avgRatings;
			totalReviews = data.hostDetails.totalReviews;
			rateText = 'Rate Experience';
		}
		else if (type == 'service') {
			rating = data.reviewCount;
			avgRatings = data.userRating;
			totalReviews = data.reviewCount;
			rateText = 'Rate Service';
		}

		reviews = renderReviews(data);
		no__ratings = !rating ? 'no__ratings' : '';
		experienceRating = rating ? '5.00' : '<span>Host Rating</span>';

		renderItem = '<div class="experience__rating"><div class="profile__ratings ' + no__ratings + '"><div class="profile__ratings-icon">' + generateRatingStars(avgRatings) + '</div><div class="profile__rating">Rating: ' + Number(avgRatings).toFixed(2) + reviews + experienceRating + '</div><div class="profile__rating-open">' + rateText + '' + icons.openOut + '</div></div></div>';

		return renderItem;

		function renderReviews(totalReviews) {
			renderItem = '';

			if (totalReviews > 0) {
				renderItem = ' | Reviews: ' + totalReviews;
			}

			return renderItem;
		}
	}
}

function renderAllServices(state, data, where) {
	if (state == 'init') {
		if (jQuery('.experiences__head-search__box').length === 0) {
			jQuery('.marketplace__localServices-search').append('<div class="experiences__head-search__box services__head-search__box"><div class="experiences__search-box"><form id="services__search"><input type="text" placeholder="Search services like Car Rental, Guides..."><button class="">' + icons.searchBar + '</button></form>');
		}
		renderAllServices('render', data);
	}

	else if (state == 'render') {
		data = data.object.listing;
        if (!where) {
            where = '.marketplace__localServices-box';
        }

		if (data) {
			data.forEach((service) => {
				if (service.listingPostedByRating == 0) {
					rate = '5.00';
				}
				else {
					rate = service.listingPostedByRating;
				}
				listingCostAmount = (service.listingCostAmount > 0) ? service.currency + numberWithCommas(service.listingCostAmount)+ '</span><span style="color:#ffffff;font-size:8px;font-family:Open Sauce Sans;font-weight:600;letter-spacing:.1px;word-wrap:break-word">/' + service.costDuration + '</span>' : 'Request Pricing';

				postMedia = (service.listingMedia) ? renderPostMedia(service.listingMedia, 'image') : "/view/assets/img/profile_blank_bg.png";
                
                if (where == '#inreview' || where == '#published' || where == '#draft' || where == '#deleted') {
                    divName = 'adminManageServices';
                }        
                else {
                    divName = 'services__item';
                }
				serviceCard = '<div class="main__container_services '+ divName +'" data-service-id="' + service.listingId + '"><div class="second__container_services"><div class="service_container_info_box"><div style="width:136px;height:12px;left:0;top:24px;position:absolute"><div style="width:12px;height:12px;left:0;top:0;position:absolute"><img class="service__icon" src= "' + renderPostMedia(service.serviceIconUrl, 'image') + '" ></div><div class="service__type" >' + service.serviceType + '</div></div><div class="service__name" >' + service.listingName + '</div><div class="service__provider-name" style="">' + service.listingPostedBy + '</div><div class="service__cost"><span class="service_cost_info"> '+ listingCostAmount +'</div></div><div style="width:364px;height:148px;left:0;top:0;position:absolute"><div class="chat__with-icon" ><div class="chat__text" >Chat Now!</div><div class="chat_icon" style="width:30px;height:30px;left:80px;top:0;position:absolute;justify-content:center;align-items:center;display:inline-flex"><span id="chat">' + icons.chat_icon + '</span></div></div><div style="width:364px;height:148px;left:0;top:0;position:absolute"><img class="service__image" src= "' + postMedia + '"  ><div style="width:364px;height:40px;left:0;top:-1px;position:absolute;background:linear-gradient(180deg,#111 0,rgba(17,17,17,0) 100%);border-radius:10px"></div></div><div class="service__location">' + service.listingCity + '</div><div style="width:34px;height:16px;left:8px;top:8px;position:absolute"><div class="service__provider-rating">' + rate + '</div><div style="width:16px;height:16px;left:0;top:0;position:absolute;justify-content:center;align-items:center;display:inline-flex"><div class="hidden_id" style="width:16px;height:16px;position:relative;flex-direction:column;justify-content:flex-start;align-items:flex-start;display:flex"><span>' + service.listingId + '</span><div style="width:13.33px;height:13.33px;background:#ff000000">' + icons.service__rating + '</div></div></div></div></div></div></div>';

				jQuery(where).append(serviceCard);
			});
            
            if (where == '#inreview' || where == '#published' || where == '#draft' || where == '#deleted') {
                jQuery(where).append('<div class="sentinel__servicesAdmin '+ where.slice(1) + '"></div>');
                
                sentinel = document.querySelector('.'+where.slice(1));
                let observer;

                options = {
                    root: document.querySelector('#manageListingsPage'), // use the search__body as the viewport
                    rootMargin: '0px',
                    threshold: 0.1 // trigger when sentinel is fully visible
                };

                observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Sentinel is visible, log the event
                            console.log('Sentinel is at the end of the scroll');
                            if (jQuery('#manageListingsPage ' + where + ' .adminManageServices').length > 9 ) {
                            
                                pageNumber = 1 + Number(jQuery('#manageListingsPage').attr('data-page'));
                                
                                listingStatus = where.slice(1);
                                
                                jsInit('adminGetAllListings', { pageNumber: pageNumber, status: listingStatus }, listingStatus);
                                
                                
                                jQuery('#manageListingsPage').attr('data-page', pageNumber);
                                
                                observer.unobserve(entry.target); // Stop observing the current sentinel
                                
                                // remove the current sentinel
                                entry.target.remove();
                            }
                        }
                    });
                }, options);

                observer.observe(sentinel); // Start observing the sentinel
                
            }

			setTimeout(function () {
				loaderMain('feed', false);
			}, 100);
		}
	}
}

experienceDashboardData = {};
currentPage = 1;
lastPage = 1;
pageSize = 20;

function renderAllExperiences(state, data, where) {
	if (state == 'init') {
		if (jQuery('#main__experiences-box').length == 0) {
			jQuery('#app #main').append('<div id="main__experiences-box"></div>');

			experiencesBody = renderExperiencesBody();

			jQuery('#main__experiences-box').html('<div class="experiences__page"><div class="experiences__header"><div class="experiences__background hidden"><img src="/view/assets/img/experiences__bg.webp" alt="Flights & Services"><div class="experiences__background-overlay"></div></div></div><div class="experiences__secondary"><div class="experiences__body">' + experiencesBody + '</div><div class="experiences__search"></div></div><div class="experiences__secondary"></div></div>');
				
			jQuery('.experiences__header').append(`
				${getFlightsSearchView('experiences')}
			`);
			
			//jQuery('.experiences__body-tabs').remove();				
			jQuery('.experiences__header').css({
				'height': '525px',
				'margin': 'unset',
			})
			
			jQuery('.experiences__secondary').css({
				'display': 'flex',
				'flex-direction': 'column',
				'margin-top': '1%'
			});
			
			jQuery('body .experiences__body-tabs').css({
				'margin': 'unset',
			});
			
			minMaxDate('.date__text-dep');
			//minMaxDate('.date__text-returning');
			setDefaultSourceDestination();


			if (window.innerWidth < 300) {
				jQuery('.experiences__header ').css('height', '230px');
				jQuery('.experiences__header-box').css('top', '0px');
				jQuery('.experiences__search-categories').css('margin', '10px 0px 0px 0px');
				jQuery('.filter_experience_category').remove();
				jQuery('.slider-wrapper.price_range_wrapper').css('width', window.innerWidth+'px');
				
			}
			if(window.innerWidth < 400){
				jQuery('.filter_experience_category').remove();	
			}
			rangeInput = document.querySelectorAll(".range-input input"),
			priceInput = document.querySelectorAll(".price-input input"),
			range = document.querySelector(".slider-filter .progress");
			priceGap = 1000;
			priceInput.forEach((input) => {
				input.addEventListener("input", (e) => {
				minPrice = parseInt(priceInput[0].value),
					maxPrice = parseInt(priceInput[1].value);
					if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
						if (e.target.className === "input-min") {
							rangeInput[0].value = minPrice;
							range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
						} 
						else {
							rangeInput[1].value = maxPrice;
							range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
						}
					}
				});
			});
			rangeInput.forEach((input) => {
			input.addEventListener("input", (e) => {
				minVal = parseInt(rangeInput[0].value),
					maxVal = parseInt(rangeInput[1].value);
					if (maxVal - minVal < priceGap) {
						if (e.target.className === "range-min") {
							rangeInput[0].value = maxVal - priceGap;
						} 
						else {
							rangeInput[1].value = minVal + priceGap;
						}
					} 
					else {
						priceInput[0].value = minVal;
						priceInput[1].value = maxVal;
						range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
						range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
					}
				});
			});
			//loaderMain('allExperiences', true);

			setTimeout(() => {
				if (localStorage.getItem('userLong') > 0 && localStorage.getItem('userLat') > 0) {
					latitude = localStorage.getItem('userLat');
					longitude = localStorage.getItem('userLong');
				}
				else {
					latitude = 22.9734;
					longitude = 78.6569;
				}

				//jsInit('getExperienceDashboard', { latitude: latitude, longitude: longitude });
			}, 350);
		}

		jQuery('#main__experiences-box').addClass('active');
		if (jQuery('#flightsDiscount__strip').find('svg').length <= 0) {
			loadLottieAnimation('flightsDiscount__strip', '/view/assets/img/coupon-discount-anim.json');
		}
		startAutoSlide(getFlightsCarouselImages().length);
	}
	else if (state == 'render') {
		console.log(data);
		if (Object.keys(experienceDashboardData).length == 0) {
			experienceDashboardData = data;
			if (data.object && data.object.dailyExperiences){
				lastPage = Math.ceil(data.object.dailyExperiences.length / pageSize);
			}
		}
		jQuery('#main__search-box .search__body .search__results-box').html('');
		loaderMain('global', false);
        
        if (where == '#main__premium-box .chat-unlimited.group-trips .premium-group-trips-wrapper') {
            experiences = data;
            packages = false;
        }

		else if (data.object.dailyExperiences && data.object.dailyExperiences.length > 0) {
			experiences = data.object.dailyExperiences;
			packages = data.object.packages;
		}
		else {
			experiences = data.object;
			packages = false;
		}
		

		if (experiences) {
			if (!where) {
				where = '.experiences__body-experiences';
			}

			if (where == '#main__experiences-box .experiences__search') {
				//Empty the search results
				jQuery(where).html('');
				redirect('experienceCategory', data);
				renderExperiences(experiences, where);
			}
			else if (where == '#secondary .secondary__tab:last-child .drawerBody') {
				renderExperiences(experiences, where);
			}
			else if (where == "#main__search-box .search__results-box") {
				renderExperiences(experiences, where);
			}
		}
		else {
			render404('All Experiences');
		}

		if (/*packages &&*/ experiences) {
			
			console.log('Sorted Experiences:', experiences);
			/*experiences.forEach(experience => {
				if (experience.viewType) {
					/*if (experience.viewType == 22 && experience.cardType == "group_trips") {
						packages.unshift(experience);
					}
					else {
						packages.push(experience);
					}
				}
				else {
					packages.unshift(experience);
				}
			});*/
			
			//packages = experiences;
			// Sort packages by id in descending order
			experiences.sort((a, b) => b.id - a.id);
			
			console.log(experiences);
			
			// Exclude those values from packages where packages.forEach(package => package.viewType node exists
			
			// packages = packages.filter(package => !package.viewType);
			console.log(experiences);
			
			// Remove where calendarSlots is empty or undefined
			experiences = experiences.filter(package => package.calendarSlots && package.calendarSlots.length > 0);
			//console.log('CSlots',packages);
		
			renderGroupTripsHome(experiences, 'default');
			//renderExperiences(packages, '.experiences__body-trips');
		}
	}
	else if (state == 'profile') {
		renderExperienceCard(data, where);
	} 
	else if (state == 'renderNextPage') {
		currentPage = currentPage + 1;
		if (!where) {
			where = '.experiences__body-experiences';
		}
		//renderExperiences(experienceDashboardData.object.dailyExperiences, where, currentPage);
		//renderExperiences(experienceDashboardData.object.packages, '.experiences__body-trips', currentPage);
		renderExperiences(packages, '.experiences__body-trips', currentPage);
	}

	function renderExperiences(experiences, where, currentPage) {
		if (!currentPage) {
			scrollManager('Start', 'Experiences');
			currentPage = 0;
		}
		else {
			currentPage = currentPage - 1;
		}
		
		experiences.forEach((experience, idx) => {
			if ((idx < currentPage * pageSize) || (idx >= (currentPage * pageSize) + pageSize)){
				
			}
			else {
				viewType = experience.viewType;
	
				if (!where) {
					where = '#main__experiences-box .experiences__body';
				}
	
				if (!viewType) {
					renderExperienceCard(experience, where);
				}
				else if (viewType == 21) {
					renderNearbyExperiences(experience.list, where);
				}
				else if (viewType == 22) {
					renderTopRatedExperiences(experience.cardDescription, experience.list, where);
				}
				else if (viewType == 24) {
					renderBecomeExperienceProviderCard(where);
				}
				else if (viewType == 23) {
					renderExperienceCategories(experience.list, where);
				}	
			}
			
		});

		//loaderMain('allExperiences', false);
		jQuery(where).show();
	}

	
	function renderExperiencesBody() {
		// Example usage
		let images = getFlightsCarouselImages();
		// let priceChallengeImages = [
		// 	'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Feed%20Card%20Images%2Fprice-prom.webp?alt=media&token=f2a85d67-3542-4491-afce-29e264dc9d4c',
		// 	'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Feed%20Card%20Images%2Fprem-banner.webp?alt=media&token=60b8841d-f839-4a68-9f89-c44cb6af98ea',
		// 	'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Feed%20Card%20Images%2Fnew_banner-growth.png?alt=media&token=da3639e1-2ca9-4a0c-8b30-c2d040e70064',
		// 	'/view/assets/img/price_challenge-one.webp',
		// 	'/view/assets/img/price_challenge-two.webp',
		// 	'/view/assets/img/price_challenge-three.webp'
		// ];
		
		// let randomIndex = Math.floor(Math.random() * priceChallengeImages.length);
		// let randomImage = priceChallengeImages[randomIndex];
		renderItem = `
			<div class="experiences__body-tabs hide">
				<div class="experiences__body-tab" data-tab="experiences">
					${icons.dayExperiences} Group Trips
				</div>
				<div class="experiences__body-tab active" data-tab="trips">
					${icons.travelBuddy__trips} Personalized Tours
				</div>
			</div>
			<div class="experiences__body-body">
				<div class="flightsDiscount__header-container">
				</div>
				${createPremiumCarousel(images).outerHTML}
				
			</div>
		`;

		return renderItem;
	}

	function renderExperienceCard(data, where) {
		if (data.hostDetails !== undefined) {
			featuredImage = renderFeaturedImage(data.media, data.name, data.location);
			userName = renderHostName(data);
			manufacturedUrl = renderManufacturedUrl(data);
			avgRatings = renderAvgRatings(data.hostDetails.avgRatings);
			slotLeftBadge = renderSlotLeftBadge(data);

			jQuery(where).append('<div class="experience__item" data-id="' + data.id + '" data-url="' + manufacturedUrl + '"><div class="experience__item-image">' + slotLeftBadge + featuredImage + '<span class="experience__item-location">' + data.location + '</span></div><div class="experience__item-content"><div class="experience__item-title"><h3>' + data.title + '</h3><div class="experience__item-bookmark">' + icons.bookmark + '</div></div><div class="experience__item-category">' + data.category + '</div><div class="experience__item-hostRating"><div class="experience__item-host">By <span>' + userName + '</span></div><div class="experience__item-rating">' + icons.star + ' ' + avgRatings + '<span>Host Rating</span></div></div><div class="experience__item-price"><span>₹</span>' + numberWithCommas(data.pricing) + slashedPrice(data.pricing, '₹', 50) + '</div ></div ></div > ');
		}
	}

	function renderNearbyExperiences(data) {
		if (guestMaster('noLogin')) {
			(!isAndroid() && !isIOS()) ? installApp = '<div class="feed__login-cta feed__login-install">Install our App</div>' : installApp = '';
			renderItem = '<div class="feed__login-sticky experience_login_sticky"><div class="feed__login-left"><h3>Join the 4 Million Strong Travel Community.</h3><p>Find Like Minded Travellers.</p></div><div class="feed__login-right">' + installApp + '<div class="feed__login-cta feed__login-login">Login</div></div></div>';

			jQuery('#main__experiences-box .experiences__body').prepend(renderItem);
            
            
		}
	}

}

function renderTopRatedExperiences(title, data, where) {
		scrollRightButton = '';
    	scrollLeftButton = '';
    if (!isAndroid() && !isIOS() && !isPwa() && !isMobile()) {
        scrollRightButton = '<button id="scrollRight" class="scroll-arrow right"><i class="fa-solid fa-arrow-left"></i></button>';
        scrollLeftButton = '<button id="scrollLeft" class="scroll-arrow left"><i class="fa-solid fa-arrow-right"></i></button>';
    }

	seeAll = '';
	if(title == 'Trending Group Trips' ){
		seeAll = 'allTrendingGroupTrips';
	}
	if(title == 'Trending Adventure Trips'){
		seeAll = 'allTrendingAdventureTrips';
	}
	if(title == 'Trending Spiritual Trips'){
		seeAll = 'allTrendingSpiritualTrips';
	}
	if(title == 'Trending All Time Fav Trips'){
		seeAll = 'allTimeFavTrips';
	}
    
    //id="'+ seeAll +'"
    // <div class="topRated-head-right">See All</div>


    jQuery(where).append('<div class="experience__card experience__topRated"><div class="experience__topRated-head"><div class="topRated-head-left">' + icons.lightning + title + '</div></div><div class="experience__topRated-body"> ' + scrollRightButton + '<div class="swiper-wrapper withArrows"></div>' + scrollLeftButton + '</div></div>');

    data.forEach((experience) => {
        featuredImage = renderFeaturedImage(experience.media, experience.name, experience.location);
        userName = renderHostName(experience);
        manufacturedUrl = renderManufacturedUrl(experience);
        avgRatings = renderAvgRatings(experience.hostDetails.avgRatings);
        slotsLeftBadge = renderSlotLeftBadge(experience, 'topRatedExperiences');
		emiValue = calculateEMI(experience.pricing,16,12);
		emiValueTag = '<span> EMI ₹' + emiValue + '/month</span>';

        jQuery('.experience__card.experience__topRated:last-child .experience__topRated-body .swiper-wrapper').append('<div class="experience__topRated-item swiper-slide" data-id="' + experience.id + '" data-url="' + manufacturedUrl + '"><div class="experience__topRated-badge">' + emiValueTag +  ' </div><div class="experience__topRated-imageBox">' + featuredImage + '<div class="experience__topRated-title">' + experience.title + '</div>' + slotsLeftBadge + '<div class="experience__topRated-bookmark">' + icons.bookmark + '</div></div><div class="experience__topRated-contentBox"><div class="experience__topRated-category">' + experience.category + '</div><div class="experience__topRated-hostRating"><div class="experience__topRated-host">' + userName + '</span></div><div class="experience__topRated-rating">' + icons.star + avgRatings + '</div></div><div class="experience__topRated-pricing"><div class="experience__topRated-price"><span>₹</span>' + numberWithCommas(experience.pricing) + slashedPrice(experience.pricing, '₹', 50) + '</div></div></div></div>');

    });

    //swiper('topRatedExperiences', '.experience__topRated-body');
}

function renderHostName(experience) {
    renderItem = '';
    try {
        if (experience.hostDetails.userName) {
            renderItem = experience.hostDetails.userName;
        }
    }
    catch (error) {
        console.log(experience);
        console.log(error);
    }

    return renderItem;
}

function renderAvgRatings(ratings) {
    renderItem = '5.00';

    if (ratings) {
        renderItem = Number(ratings).toFixed(2);
    }

    return renderItem;
}

function renderBecomeExperienceProviderCard(where) {
    jQuery(where).append('<div class="experience__item-becomeExperienceProvider"><img src="/view/assets/img/Feed_Banner.png" alt=""></div>');
}

function renderExperienceCategories(data, where) {
    userName = (guestMaster('noLogin')) ? '' : ', ' + manageUserProfile('read', 'name')

    jQuery(where).append('<div class="experience__card experience__categories"><div class="experience__categories-head">What are you looking for' + userName + '?</div><div class="experience__categories-content"><div class="swiper-wrapper"></div></div></div>');
    color = ['yellow', 'light-green', 'light-red', 'light-yellow', 'light-aqua', 'blue'];

    data.forEach((category) => {
        //Pick up a random color
        randomColor = color[Math.floor(Math.random() * color.length)];

        jQuery('.experience__categories-content .swiper-wrapper').append('<div class="experience__category-item swiper-slide ' + randomColor + '" data-id="' + category.categoryId + '"><div class="experience__category-image"><img draggable="false" src="' + renderUserProfileImage(category.imageUrl) + '" alt=""></div><div class="experience__category-title">' + category.category + '</div></div>');
    });

    swiper('experienceCategories', '.experience__categories-content');
}

function fetchCheapestFlights(destination, where){
	var fromLat = localStorage.getItem('userLat'), fromLong = localStorage.getItem('userLong');
	var origin = undefined;
	if (fromLat == 0){
		if (manageUserProfile('read','userLat') != 0){
			fromLat = manageUserProfile('read','userLat');
			fromLong = manageUserProfile('read','userLong');
		}else{
			origin = manageUserProfile('read','city');
		}
	}
	lastElementId = where;
	jsInit('getLowestFare', {origin:origin, fromLat: fromLat, fromLong: fromLong,  destination: destination }, lastElementId);
}

function renderCheapestFlight(data, where) {
	if (!data.destination) {
		console.log('No Destination');
		return;
	}
	var destination = data.destination;
	//Check if there is flight details available
	//Check if the source and destination are same, then don't show the flight details
	//check if there are no flights available between source and destination
	var currentDate = new Date();
	if (cheapestFlights.toLocation && cheapestFlights.toLocation[destination]) {
		lastFetchedDate = new Date(cheapestFlights.toLocation[destination].lastFetchedDate);
		// Check if the day has changed
		if (currentDate.getDate() !== lastFetchedDate.getDate() ||
			currentDate.getMonth() !== lastFetchedDate.getMonth() ||
			currentDate.getFullYear() !== lastFetchedDate.getFullYear()) {
			fetchCheapestFlights(destination);
		}
		else {
			renderCheapestFlightCard(cheapestFlights.toLocation[destination], where);
		}
	}
	else {
		fetchCheapestFlights(destination, where);
	}
}

function renderCheapestFlightCard(flightDetails, where){
	console.log('Cheap flights', flightDetails);
	
	let sourceCity = flightDetails.lowestFareDetails.departureCity ? flightDetails.lowestFareDetails.departureCity : 'Delhi';
	let destinationCity = flightDetails.lowestFareDetails.arrivalCity ? flightDetails.lowestFareDetails.arrivalCity : 'Mumbai';
	let cheapeastPrice = flightDetails.lowestFareDetails.lowestFare ? flightDetails.lowestFareDetails.lowestFare : 2300;
	
    let cardHTML = `
        <div class="cheap__flights-card">
            <div class="cheap__flights-card-overlay">
                <div class="cheap__flights-card-header">
                    <span class="cheap__flights-badge blink">Embark on new adventures! Book your budget-friendly flight today!</span>
                </div>
                <div class="cheap__flights-card-body">
                    <div class="cheap__flights-card-destination">
						<h2 class="cheap__flights-card-title">${sourceCity}</h2>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                        </svg>
                        <span class="cheap__flights-destination-name">${destinationCity}</span>
                    </div>
                    <div class="cheap__flights-card-price">
                        <p class="cheap__flights-price">₹ ${cheapeastPrice}</p>
                    </div>
                </div>
                <button class="cheap__flights-book-button" >Book Now</button>
            </div>
        </div>
    `;
	
	let cheapFlightHtml = jQuery(cardHTML);
	
	cheapFlightHtml.data('cheapFlightDetails', JSON.stringify(flightDetails));

    // Assuming you have a container to append this card to
    jQuery(where).append(cheapFlightHtml);
	
}

function renderFeaturedImage(image, name, location) {
    if (image !== undefined && image[0]) {
        return '<img draggable="false" loading="lazy" src="' + renderPostMedia(image[0].media_url, 'image') + '" alt="' + name + ' in ' + location + '">';
    }
    else {
        return '<img draggable="false" src="/view/assets/img/experiences__bg.webp" alt="' + name + ' in ' + location + '">';
    }
}

function renderManufacturedUrl(experience) {
	renderItem = '';

	if (experience.title) {
		renderItem = (experience.title.replace(/ /g, '-') + '-' + experience.id + '/').toLocaleLowerCase();
		renderItem = renderItem.replace('//', '/');
		renderItem = renderItem.replace(/[^a-zA-Z0-9-]/g, '');
		if (renderItem.substr(-1) != '/') {
			renderItem += '/';
		}
	}

	return renderItem;
}

function renderSlotLeftBadge(data, from) {
	renderItem = '';
	show = false;

	try {
		data = data.calendarSlots[0];
		if (data) {
			if (Number(data.batch_size) * 0.5 >= Number(data.ticketsLeft)) {
				show = true;
				color = 'yellow';
			}
			else if (Number(data.batch_size) * 0.3 >= Number(data.ticketsLeft)) {
				show = true;
				color = 'red';
			}

			if (show && (Number(data.ticketsLeft) < 5)) {
				if (from == 'topRatedExperiences') {
					renderItem = '<div class="experience__topRated-badge experience__topRated-badge__' + color + '">Only ' + Number(data.ticketsLeft) + ' slots left!</div>';
				}
				else if (from == 'singleExperience') {
					renderItem = '<div class="experience__booking-badge experience__booking-badge__' + color + '">Only ' + Number(data.ticketsLeft) + ' Slots left!</div>'
				}
				else {
					renderItem = '<div class="experience__item-badge experience__item-badge__' + color + '">Only ' + Number(data.ticketsLeft) + ' slots left!</div>';
				}
			}
		}
	} catch (error) { }

	return renderItem;
}

function renderBookingSummary(state, data) {
	if (state == 'init') {
		userInfo = renderUserInfo();
		bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
		ticketsBox = renderTicketsBox(bookingDetails);
		loginButton = (guestMaster('noLogin')) ? '<div class="bookingSummary__login">- OR - <span>Login</span></div>' : '';
		rzpWid = '<div id="razorpay-affordability-widget" style="background: rgb(253, 231, 35);margin: 1% 5%;padding: 8% 0px 0px 8%;border-radius: 10px;height: 100px;display: none;"></div>';

		jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="bookingSummary__page-container"><div class="bookingSummary__page"><div class="bookingSummary__head">' + icons.back + '<h3>Booking Summary</h3></div><div class="bookingSummary-booking__box"><div class="bookingSummary-booking__box-head">' + icons.ticket + ' You’re booking this experience</div><div class="bookingSummary-booking__box-table"><div class="bookingSummary-booking__item" data-experience-id="' + data.id + '"><div class="bookingSummary-booking__item-left"><div class="bookingSummary-booking__item-title">' + data.title + '</div><div class="bookingSummary-booking__item-sub">Hosted by ' + data.hostDetails.userName + '</div></div><div class="bookingSummary-booking__item-right"><div class="bookingSummary-booking__item-price">₹' + bookingDetails.price + ' <span class="bookingSummary-booking__item-price__subText">/person</span></div><div class="bookingSummary-booking__item-tax">excl. of GST</div></div></div></div><div class="bookingSummary-booking__box-tickets">' + ticketsBox + '</div></div><div class="bookingSummary__coupons"><div class="bookingSummary__coupons-head">Enjoy discount with a coupon!</div><div class="bookingSummary__coupons-body"><form id="bookingSummary__couponForm"><div class="form__row"><div class="form__column"><input type="text" id="bookingSummary__coupon" name="bookingSummary__coupon" placeholder="Enter the Coupon Code you have"><button class="btn btn--primary">Apply</button></div></div></form></div><div class="bookingSummary__coupons-viewAll">View All Coupons</div></div><div class="bookingSummary__premiumCard"><a><img src="/view/assets/img/travel_buddy_super-creative-slim.png" draggable="false"></a></div><div class="bookingSummary__userDetails" style="display: none;"><div class="bookingSummary__userDetails-head"><div class="bS-title">' + icons.person + ' Your Details</div>' + loginButton + '</div><div class="bookingSummary__userDetails-body">' + userInfo + '</div></div>' + rzpWid + '</div><div class="bookingSummary__details"><div class="bookingSummary__details-head">Your Payment Summary</div><div class="bookingSummary__details-body"></div></div><div class="bookingSummary__cta"><button class="btn btn--primary btn--block g-recaptcha" data-sitekey="6LfoX5glAAAAAGTL-DkquTJVBWWMXoxU6qTHwUkM">Proceed to Pay</button><p class="terms">By choosing to proceed to pay, you are accepting the Travel Buddys <a class="bookingSummary__policies" data-redirect="terms">Terms & Conditions</a> and <a class="bookingSummary__policies" data-redirect="cancellation">Cancellation & Refunds Policy</a></p></div></div></div>');

		loaderMain('secondary', false);
		renderBookingSummaryDetails();
		// (guestMaster('noLogin')) ? jsInit('fetchCountries', '', 'bookingSummary') : '';
		jsInit('getAvailableTickets', { "calendarSlotId": JSON.parse(localStorage.getItem('bookingDetails')).bookingSlot }, '#bookingSummary__tickets');
		formPlusMinus();
	}
	else if (state == 'updateTotals') {
		renderBookingSummaryDetails();
	}
	else if (state == 'renderCountries') {
		renderCountries(data);
	}
	else if (state == 'renderOTPBox') {
		renderOTPBox(data);
	}
	else if (state == 'renderOTPBox-login') {
		renderOTPBox(data, 'login');
	}
	else if (state == 'reloadUserDetails') {
		jQuery('.bookingSummary__userDetails-body').html(renderUserInfo());
	}

	function renderTicketsBox(bookingDetails) {
		renderItem = '';

		if (bookingDetails) {
			slots = JSON.parse(localStorage.getItem('calendarSlots'));

			slots.forEach((caledarSlot) => {
				if (caledarSlot.id == bookingDetails.bookingSlot) {
					slot = caledarSlot;
				}
			});

			console.log(bookingDetails);

			if (slot) {
				start_time = new Date(slot.start_time);
				end_time = new Date(slot.end_time);

				//Date in the 11th, July format
				date = getOrdinalNum(start_time.getDate(),true) + ', ' + start_time.toLocaleString('default', { month: 'short' });
				day = start_time.toLocaleString('default', { weekday: 'long' });
				start_time = start_time.toLocaleString('default', {
					hour: 'numeric',
					minute: 'numeric',
				});
				end_time = end_time.toLocaleString('default', {
					hour: 'numeric',
					minute: 'numeric',
					hour12: true,
				});

				renderItem = '<form id="bookingSummary__form"><div class="form__row"><div class="bookingSummary-booking__box-tickets__item form__column"><label>Date</label><div class="bookingSummary_date">' + day + ' ' + date + ' from ' + start_time + ' - ' + end_time + '</div></div><div class="bookingSummary-booking__box-tickets__item form__column"><label for="bookingSummary__tickets">Tickets</label><div class="form__plusMinus"><div class="number"><span class="minus">-</span><input type="number" value="' + bookingDetails.tickets + '" id="bookingSummary__tickets" min="1" name="bookingSummary__tickets"><span class="plus">+</span></div></div></div></div></form>';
			}
		}

		return renderItem;
	}

	function renderBookingSummaryDetails() {
		renderItem = '';
		bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));

		if (bookingDetails) {
			discountLine = renderDiscountLine(bookingDetails.price * bookingDetails.tickets);
			discount = Number(discountLine.discount).toFixed(2);
			price = bookingDetails.price * bookingDetails.tickets;
			tax = (price - discount) * 0.05;
			final_price = price - discount + tax;
			//manageRazorPayWidget(final_price);

			//Empty the booking summary details
			jQuery('.bookingSummary__details-body').html('');

			jQuery('.bookingSummary__details-body').append('<div class="bookingSummary__details-item"><div class="bookingSummary__details-title">Subtotal</div><div class="bookingSummary__details-value">₹' + Number(price).toFixed(2) + '</div></div>' + discountLine.html + '<div class="bookingSummary__details-item"><div class="bookingSummary__details-title">Tax (5% GST)</div><div class="bookingSummary__details-value">₹' + Number(tax).toFixed(2) + '</div></div><div class="bookingSummary__details-item bookingSummary__details-final" data-final-price="' + Number(final_price) + '"><div class="bookingSummary__details-title">Total</div><div class="bookingSummary__details-value">₹' + numberWithCommas(Number(final_price).toFixed(2)) + '</div></div>');

		}

		function renderDiscountLine(price) {
			renderItem = {
				html: '<div class="bookingSummary__details-item bookingSummary__details-item-discount" data-discount="0"><div class="bookingSummary__details-title bookingSummary__details-item-discount">Less: Discount Travel Buddy Premium</div><div class="bookingSummary__details-value">₹0</div></div>',
				discount: 0,
			};

			bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));

			if (bookingDetails.coupon) {
				renderItem.discount = bookingDetails.couponDiscount;
				renderItem.html = '<div class="bookingSummary__details-item bookingSummary__details-item-discount" data-discount="' + bookingDetails.couponDiscount + '"><div class="bookingSummary__details-title">Less: Coupon Discount <span>' + bookingDetails.couponCode + '</span></div><div class="bookingSummary__details-value">₹' + Number(bookingDetails.couponDiscount).toFixed(2) + '</div></div>';
			} else {
				if (manageUserProfile('read', 'isVerified')) {
					discount = price * 0.1;
					if (discount > 5000) discount = 5000;

					//             if (bookingDetails.coupon) {
					//                 renderItem.discount = bookingDetails.couponDiscount;
					//                 renderItem.html = '<div class="bookingSummary__details-item bookingSummary__details-item-discount" data-discount="' + bookingDetails.couponDiscount + '"><div class="bookingSummary__details-title">Less: Coupon Discount <span>' + bookingDetails.couponCode + '</span></div><div class="bookingSummary__details-value">₹' + Number(bookingDetails.couponDiscount).toFixed(2) + '</div></div>';
					//             }
					//             else {
					//                 if (manageUserProfile('read', 'isVerified')) {
					//                     discount = price * 0.1;
					//                     if (discount > 150) discount = 150;

					renderItem.html = '<div class="bookingSummary__details-item bookingSummary__details-item-discount" data-discount="' + discount + '"><div class="bookingSummary__details-title">Less: Discount <span>Travel Buddy Premium (10% Off Upto ₹150)</span></div><div class="bookingSummary__details-value">₹' + Number(discount).toFixed(2) + '</div></div>';
					renderItem.discount = Number(discount).toFixed(2);
				}
			}

			return renderItem;
		}

		return renderItem;
	}

	function renderUserInfo() {
		userName = guestMaster('noLogin') ? '<input type="text" name="bookingSummary__name" id="bookingSummary__name">' : '<div class="bookingSummary__userDetails-value">' + manageUserProfile('read', 'name') + '</div>';
		userCity = guestMaster('noLogin') ? '<input type="text" name="bookingSummary__city" id="bookingSummary__city">' : '<div class="bookingSummary__userDetails-value">' + manageUserProfile('read', 'location') + '</div>';
		userMobile = guestMaster('noLogin') ? '<select name="bookingSummary__country" id="bookingSummary__country"><option>+91</option></select><input type="number" name="bookingSummary__mobile" id="bookingSummary__mobile">' : '<div class="bookingSummary__userDetails-value"><span>' + manageUserProfile('read', 'dialCode') + '</span> ' + manageUserProfile('read', 'phoneNumber') + '</div>';
		userEmail = guestMaster('noLogin') ? '<input type="text" name="bookingSummary__email" id="bookingSummary__email">' : '<div class="bookingSummary__userDetails-value">' + manageUserProfile('read', 'email') + '</div>';

		formClass = guestMaster('noLogin') ? 'active' : '';

		renderItem = '<form id="bookingSummary__signUp" data-state="uniqueCheck" class="' + formClass + '"><div class="bookingSummary__userDetails-item"><div class="bookingSummary__userDetails-title">Full Name</div>' +
			userName + '</div><div class="bookingSummary__userDetails-item"><div class="bookingSummary__userDetails-title">Your City</div>' + userCity + '</div><div class="bookingSummary__userDetails-item"><div class="bookingSummary__userDetails-title">Mobile</div><div class="bookingSummary__phoneBox">' + userMobile + '</div></div><div class="bookingSummary__userDetails-item"><div class="bookingSummary__userDetails-title">Email</div>' + userEmail + '</div></form>';

		return renderItem;
	}

	function renderOTPBox(data, state) {
		if (state == 'login') {

		}

		otpId = data.object.otpId;

		if (jQuery('#bookingSummary__signUp .bookingSummary__userDetails-section').length == 0) {
			jQuery(this).remove();
		}

		jQuery('#bookingSummary__signUp').append('<div class="bookingSummary__userDetails-section"><div class="bookingSummary__userDetails-otp"><div class="bookingSummary__userDetails-otp__title">Enter OTP</div><div class="bookingSummary__userDetails-otp__description"><div class="bookingSummary__userDetails-otp__description-content">We have sent an OTP to your mobile number</div><div class="bookingSummary__userDetails-otp__resend">Resend OTP <span class="bookingSummary__userDetails-otp__resend_in" data-time="0"></span></div></div><div class="bookingSummary__userDetails-otp__input"><input type="number" name="bookingSummary__otp" data-otp-id="' + otpId + '" id="bookingSummary__otp" max="999999"><button id="bookingSummary__otp-submit">Apply</button></div></div></div>').attr('data-state', 'otpValidation');

	}

	function renderCountries(data) {
		console.log(data);
		if (data) {
			jQuery('#bookingSummary__country').html('');

			data = data.object;
			data.forEach((country) => {
				jQuery('#bookingSummary__country').append('<option value="' + country.code + '">' + country.code + '</option>');
			});

			setCountryCode('#bookingSummary__country');
		}
	}
}

function manageAvailableTickets(state, data, where) {
	if (state == 'render') {
		console.log(data);
		if (data.responseCode !== 200) {
			toast(data.responseMessage);
		}
		else {
			toast(data.errorMessage);
		}
	}
	else {
		maxTickets = data.object.ticketsAvailable;
		if (maxTickets) {
			jQuery(where).attr('max', maxTickets);
			//If the input value is greater than the max tickets available, set it to max tickets

			if (jQuery(where).val() > maxTickets) {
				jQuery(where).val(maxTickets);
			}
		}
	}
}

function renderExperienceThankYou(state, data) {
	if (state == 'init') {
		experience = JSON.parse(localStorage.getItem('selectedExperience'));

		jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="experience__thankYou" data-booking-id="' + data + '"><div class="experience__thankYou-head"><img src="/view/assets/img/experience__thankYou.png" alt=""><div class="experience__thankYou-user"><img src="' + renderUserProfileImage(manageUserProfile('read', 'profilePic')) + '" alt=""> Your host thanks you!</div></div><div class="experience__thankYou-booking__box"><div class="experience__thankYou-booking__box-head"><div class="experience__thankYou-booking__box-left">' + icons.ticket + ' Your Ticket</div><div class="experienc__thankYou-booking__box-right">Share ' + icons.send + '</div></div><div class="experience__thankYou-booking__box-content"><div class="experience__thankYou-booking__box-title">' + experience.title + '</div><div class="experienc__thankYou-booking__box-location">' + icons.location + experience.location + '</div><div class="experienc__thankYou-booking__box-host">Hosted By <span>' + experience.hostDetails.userName + '</span></div></div></div><div class="experience__thankYou-booking__button">Check Booking Details ' + icons.arrow_right + '</div><div class="experience__thankYou-back">' + icons.arrow_left + ' Go back to experience page</div></div>');

		setTimeout(function () {
			loaderMain('secondary', false);
		}, 1000);
	}
}

function renderOrderDetails(data, what) {
	if (what == 'All') {
		console.log(data);
		jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="allOrders__page"></div>');

		if (data.list.length > 0) {
			data.list.forEach((order) => {
				payNow = renderPayNow(order);
				dateFormated = formatDate2(order.slotDate);

				jQuery('.allOrders__page').append('<div class="allOrders__item" data-id="' +
					order.id + '"><div class="allOrders__item-head"><div class="allOrders__item-head__left"><h4>' +
					order.expTitle + '</h4><div class="allOrders__item-host">Hosted By <span>' + order.hostName + '</span></div><div class="allOrders__item-price">Experience Value:<span>₹' + order.amount + '/-</span></div></div><div class="allOrders__item-head__right"><div class="allOrders__item-status">' + order.bookingStatus + '</div></div></div><div class="allOrders__item-slots"><div class="allOrders__item-slot allOrders__item__tickets"><span class="allOrders__item-slot__head">Tickets</span><span class="allOrders__item-slot__content">' + order.noOfTickets + '</span></div><div class="allOrders__item-slot allOrders__item__ticket"><span class="allOrders__item-slot__head">Date</span><span class="allOrders__item-slot__content">' + dateFormated + '</span></div><div class="allOrders__item-slot allOrders__item__ticket"><span class="allOrders__item-slot__head">Time Slot</span><span class="allOrders__item-slot__content">7 - 8AM</span></div></div><div class="allOrders__item-details">View Details ' + icons.openOut + '</div>' + payNow + '</div>'
				);
			});
		}
		else {
			jQuery('.allOrders__page').append('<div class="allOrders__noOrders"><div class="allOrders__noOrders-text">You have no orders yet.</div><div class="allOrders__noOrders-button">Book Experiences Now</div></div>');
		}

		function renderPayNow(order) {
			renderItem = '';

			if (order.bookingStatus == 'Pending Payment') {
				renderItem = '<div class="allOrders__item-payNow">Pay Now ' + icons.openOut + '</div>';
			}

			return renderItem;
		}
	}
	else if (what == 'Single') {
		if (data) {
			console.log(data);
			data = data.list[0];

			meetingInstructions = renderMeetingInstructions(data.meetingInstructions);
			bottomCTAs = renderBottomCTAs(data.bookingId);
			contactHost = renderContactHost(data.hostName, data.hostPhoneNumber);
			manufacturedUrl = renderManufacturedUrl({ id: data.experienceId, title: data.expTitle });

			jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="order__details-page" data-experience-title="' + data.expTitle + '" data-experience-url="' + manufacturedUrl + '" data-host-id="' + data.hostId + '" data-experience-id="' + data.experienceId + '"><div class="order__details-head"><span class="back">' + icons.back + '</span> Order Details</div><div class="order__details-ticket"><div class="experience__thankYou-booking__box"><div class="experience__thankYou-booking__box-head"><div class="experience__thankYou-booking__box-left">' + icons.ticket + ' Your Ticket</div><div class="experienc__thankYou-booking__box-right">Share ' + icons.send + '</div></div><div class="experience__thankYou-booking__box-content"><div class="order__details-content__upper"><div class="experience__thankYou-booking__box-title">' + data.expTitle + '</div><div class="experienc__thankYou-booking__box-location">' + icons.location + data.location + ' </div><div class="experienc__thankYou-booking__box-host">Hosted By<span> ' + ' ' + data.hostName + '</span></div><div class="order__details-price">Experience Value:<span class="order__details-price__amount">₹ ' + data.amount + '</span><span class="order__details-price__tax">(plus GST)</span></div></div><div class="order__details-status"><hr><span>Awaiting Confirmation</span></div><div class="order__details-details"><div class="order__details-details-left"><div class="order__details-details__item">Tickets<span> ' + data.noOfTickets + '</span></div><div class="order__details-details__item">Date<span> ' + data.slotDate + ' </span></div><div class="order__details-details__item">Time Slot<span> ' + data.startTime + ' </span></div></div><div class="order__details-details-right order__details-cancel__order">Cancel Booking</div></div></div></div></div><div class="experience__host"><div class="experience__host-head"><div class="experience__host-head__left"><img src="' + renderUserProfileImage(data.userDisplayPicture) + '" alt=""></div><div class="experience__host-head__right"><div class="experience__host-head-name"><span>' + data.hostName + '</span>Says...</div><div class="experience__host-head-sub">Your Host’s Instructions</div></div></div><div class="experience__host-instructions"><p>' + data.hostInstructions + '</p></div></div>' + contactHost + meetingInstructions + bottomCTAs + '</div>');
		}
		else {
			render404('orderDetails');
		}
	}

	setTimeout(function () {
		loaderMain('secondary', false);
	}, 150);

	function renderMeetingInstructions(instructions) {
		renderItem = '';

		if (instructions) {
			renderItem = '<div class="order__details-meetings_instructions"><div class="order__details-meetings_head">Meeting Instructions <span class="order__details-host">View Experience Details ' + icons.openOut + '</span></div><div class="order__details-meetings_content">' + instructions + '</div></div>';
		}

		return renderItem;
	}

	function renderBottomCTAs(data) {
		//uncomment below when the invoice is ready
		//renderItem = '<div class="order__details-bottomCTAs"><div class="order__details-invoice" data-invoice-id="' + data + '">' + icons.invoice + ' View Invoice</div><div class="order__details-support"><a href="mailto:community@beatravelbuddy.com">' + icons.contact + 'Queries? Email Us</a></div></div>';
		renderItem = '<div class="order__details-bottomCTAs"><div class="order__details-support"><a href="mailto:community@beatravelbuddy.com">' + icons.contact + 'Queries? Email Us</a></div></div>';

		return renderItem;
	}

	function renderContactHost(hostId, hostPhoneNumber) {
		callPhoneTag = '<a style="flex: 1;color: black;" href="tel:' + hostPhoneNumber + '">';
		renderItem = '<div class="order__details-contact__host" data-host="' + hostId + '"><div class="order__details-contact__host-chat">' + icons.chat + ' Chat with Host</div>' + callPhoneTag + '<div class="order__details-contact__host-call">' + icons.contact + ' Call Host</div> </a></div>';
		return renderItem;
	}
}

function renderCoupons(state, data) {
	if (state == 'init') {
		jsInit('getCoupons',{noOfTickets: jQuery('#bookingSummary__tickets').val()});
		drawer('open', true);
		jQuery('#main__drawer .drawerHeader span').html('Or, Apply a Coupon');
		jQuery('#main__drawer .drawerBody').append('<div class="couponDrawer"></div>');
	}
	else if (state == 'render') {
		console.log(data);
		data = data.list;

		if (data.length > 0) {
			data.forEach((coupon) => {
				description = renderCouponDescription(coupon.description, coupon.couponcode, coupon);
				couponTitle = renderCouponTitle(coupon.discountvalue, coupon.isdiscountinperc);
				computedDiscount = getComputedDiscount(coupon.discountvalue, coupon.isdiscountinperc, coupon.maxdiscount);

				jQuery('.couponDrawer').append('<div class="coupon__item" data-coupon-discount="' + computedDiscount + '" data-coupon-code="' + coupon.couponcode + '" data-coupon-id="' + coupon.couponid + '"><div class="coupon__type"><span>Offer</span></div><div class="coupon__box"><div class="coupon__box-head"><div class="coupon__box-head__left"><div class="coupon__title">' + couponTitle + '</div><div class="coupon__subTitle">Save ₹' + computedDiscount + ' on this booking!</div></div><div class="coupon__box-head__right"><div class="coupon__apply">Apply</div></div></div><div class="coupon__box-description">' + description + '</div></div></div>');
			});
		}

		function renderCouponDescription(description, couponCode, coupon) {
			renderItem = 'Use code ' + couponCode + ' & get ' + coupon.discountvalue + '% off on bookings. Upto ₹' + coupon.maxdiscount + '. For the first 100 users only.';

			if (description && description != 'Welcome offer') {
				renderItem = description;
			}

			return renderItem;
		}

		function renderCouponTitle(discountValue, isPercentage) {
			renderItem = '';

			if (isPercentage) {
				renderItem = discountValue + '% Off';
			}
			else {
				renderItem = '₹' + discountValue + ' Off';
			}

			return renderItem;
		}
	}
}

function renderFindBuddyAcceptDecline(data) {
	drawer('open', true);
	jQuery('#main__drawer .drawerHeader span').html('Buddies who want to join this Group.');
	jQuery('.drawer').css('overflow', 'unset'); // --> Needed this but then the drawer from other places will be affected. Need to find a way to make this work by fixing the drawer css.
	jQuery('#main__drawer .drawerBody').append('<div class="accept_decline_drawer" style="overflow: scroll;max-height: 420px;">');
	console.log(data);
	membersWithRequestedZero = data;
	membersWithRequestedZero.forEach(member => {
		memberInfoHTML = '<div class="member-container">';
		memberInfoHTML += '<div class="member-container_left-part" data-user-id= "'+ member.uid +'" >'; // Wrapper for left part

		if (member.profilePic) {
			memberInfoHTML += '<img src="' + renderUserProfileImage(member.profilePic) + '" alt="Profile Picture" class="profile-pic" onerror="this.onerror=null; this.src=getDummyImageUrl();">';
		}
		if (member.userName) {
			memberInfoHTML += '<span class="member-username">' + member.userName + '</span>';
		}

		memberInfoHTML += '</div>'; // Close left-part div

		memberInfoHTML += '<div class="action-buttons" data-user-id="'+ member.uid + '">' +
			'<button class="action-button accept-button">Accept</button>' +
			'<button class="action-button decline-button">Decline</button>' +
			'</div>';
		memberInfoHTML += '</div>'; // Close member-container div

		$memberElement = jQuery(memberInfoHTML);
		jQuery('.accept_decline_drawer').append($memberElement);
	});
}

function getComputedDiscount(discountValue, isPercentage, maxDiscount) {
	bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
	bookingAmount = bookingDetails.price * bookingDetails.tickets;

	if (isPercentage) {
		discount = (discountValue / 100) * bookingAmount;
		if (discount > maxDiscount) {
			discount = maxDiscount;
		}
	}
	else {
		discount = discountValue;
	}

	discount = Math.round(discount);
	return discount;
}

function renderSpDashboard(state, data) {
	if (state == 'init') {
		jQuery('#main').append('<div id="main__spDashboard-box"><div class="main_item"><div class="spDashbaord__page"></div></div><div class="secondary_item"></div></div>');
		if (manageUserProfile('read', 'userType') == 1) {
			jsInit('spDashboard', '', 'spDashboardFirstLoad');
		}
	}
	else if (state == 'refresh') {
		jQuery('.spDashbaord__page').remove();
		jQuery('#main #main__spDashboard-box .main_item').append('<div class="spDashbaord__page"></div>');
		jsInit('spDashboard');
		loaderMain('main', false);
	}
	else if (state == 'render' || state == 'renderFirstSp') {
		console.log(data);
		data = data.object;

		userListings = renderUserListings(data.marketList.listing);
		visitingUsers = renderVisitingUsers(data.findQueries, 'find');
		queries = renderVisitingUsers(data.askQueries, 'queries');
		nearbyUsers = renderNearbyUsers(data.nearByUsers.users);
		insights = renderInsights(data);

		jQuery('#main__spDashboard-box .spDashbaord__page').html('<div class="spDashboard__masthead"><h3>Welcome!<span>' + manageUserProfile('read', 'name') + '</span></h3>' + insights + '</div><div class="spDashboard__tod"><div class="spDashboard__tod-left"><img src="/view/assets/img/light-bulb.png" alt=""></div><div class="spDashboard__tod-right"><div class="spDashboard__tod-subtext">Tip of the Day</div><div class="spDashboard__tod-text">' + data.tipOfTheDay + '</div></div></div><div class="spDashboard__listings"><div class="spDashboard__listings-title">Service Listings</div><div class="spDashboard__listings-box"><div class="swiper-wrapper">' + userListings + '<div class="spDashboard__listings-item spDashboard__listings-item-add swiper-slide"><span class="addListing__icon">' + icons.plus + '</span><span>List your <br> <b>Service</b> </span></div></div></div></div><div class="spDashboard__visiting"><div class="spDashboard__visiting-title"><div class="spDashboard__visiting-title-left">Travellers Visiting <span>' + manageUserProfile('read', 'location') + '</span></div><div class="spDashboard__visiting-title-right"><span class="pointer" data-location="' + manageUserProfile('read', 'location') + '">See All</span></div></div><div class="spDashboard__visiting-box"><div class="swiper-wrapper">' + visitingUsers + '</div></div></div><div class="spDashboard__visiting spDashboard__queries"><div class="spDashboard__visiting-title"><div class="spDashboard__visiting-title-left">Queries for <span>' + manageUserProfile('read', 'location') + '</span></div><div class="spDashboard__queries-title-right"><span class="pointer" data-location="' + manageUserProfile('read', 'location') + '">See All</span></div></div><div class="spDashboard__visiting-box"><div class="swiper-wrapper">' + queries + '</div></div></div><div class="spDashboard__nearby"><div class="spDashboard__nearby-title">Nearby Travellers ' + manageUserProfile('read', 'location') + '</div><div class="spDashboard__nearby-box"><div class="swiper-wrapper">' + nearbyUsers + '</div></div>');

		swiper('spDashboard__listings-box', '.spDashboard__listings-box');
		swiper('spDashboard__visiting-box', '.spDashboard__visiting-box');
		swiper('spDashboard__nearby-box', '.spDashboard__nearby-box');

		loaderMain('main', false);

		if (state == 'renderFirstSp') {
			if (manageUserProfile('read', 'userType') == 1) {
				if (isIOS() || isAndroid() && jQuery('#main__spDashboard-box').hasClass('active') == 'false') {
					setTimeout(() => {
						jQuery('.head__spDashboard').click();
					}, 150);
				}
			}
		}
	}

	function renderInsights(data) {
		renderItem = '<div class="spDashboard__masthead-insights"><p>Check Your Business Insights</p><div class="spDashboard__masthead-insights__box"><div class="spDashboard__masthead-insights__item spDashboard__masthead-insights__views"><span class="spDashboard__masthead-insights__item-number">' + data.noOfViews + '</span><span class="spDashboard__masthead-insights__item-text">Views</span></div><div class="spDashboard__masthead-insights__item spDashboard__masthead-insights__leads"><span class="spDashboard__masthead-insights__item-number">' + data.leadsCount + '</span><span class="spDashboard__masthead-insights__item-text">Leads</span></div><div class="spDashboard__masthead-insights__item spDashboard__masthead-insights__messages"><span class="spDashboard__masthead-insights__item-number">' + data.totalUnreadMessages + '</span><span class="spDashboard__masthead-insights__item-text">New Messages</span></div></div></div>';

		return renderItem;
	}

	function renderNearbyUsers(data) {
		renderItem = '';

		if (data) {
			data.forEach(user => {
				if (user.imageUrl) {
					renderItem += '<div class="spDashboard__nearby-item swiper-slide" data-user="' + user.userId + '"><img src="' + renderUserProfileImage(user.imageUrl) + '" alt=""><span>' + user.name + '</span></div>';
				}
			});
		}

		return renderItem;
	}

	function renderVisitingUsers(data, type) {
		renderItem = '';

		if (data) {
			data.forEach(post => {
				renderItem += '<div class="spDashboard__visiting-item swiper-slide" data-post-id="' + post.postId + '" data-user="' + post.userId + '"><div class="spDashboard__visiting-innertitle"><div class="spDashboard__visiting-image"><img src="' + renderUserProfileImage(post.imageUrl) + '" alt=""></div><div class="spDashboard__visiting-content"><span class="spDashboard__visiting-name">' + post.name + '</span><span class="spDashboard__visiting-destination">Travelling to: ' + formatDate2(post.postDateTime) + '</span></div></div><div class="row"><div class="spDashboard__visiting-description">' + post.postDescription + '</div><div class="spDashboard__visiting-cta">Send Message</div></div></div>';
			});
		}

		return renderItem;
	}

	function renderUserListings(data) {
		renderItem = '';

		if (data.length > 0) {
			data.forEach(listing => {
				console.log(listing);
				pricing = (!listing.isPriceDefined) ? renderPricing(listing.listingCostAmount, listing.costDuration, listing.currency) : 'Contact For Pricing';
				renderEditButton = (listing.listingStatus == 'draft' || listing.listingStatus.includes('publish')) ? '<div class="spDashboard__listing-item__cta spDashboard__listing-item__cta-edit">Edit</div>' : '';

				renderItem += '<div class="spDashboard__listings-item spDashboard__listings-item-listing swiper-slide" data-listing-id="' + listing.listingId + '"><div class="spDashboard__listiting-item__image"><img src="' + renderUserProfileImage(listing.listingMedia) + '" alt=""><div class="spDashboard__listings-status">' + listing.listingStatus + '</div></div><div class="spDashboard__listing-item__content"><div class="spDashboard__listing-item__ratings">' + generateRatingStars(listing.listingPostedByRating) + ' ' + listing.listingPostedByRating + ' (' + listing.listingPostedByReviewCount + ' reviews)</div><div class="spDashboard__listings-item__name">' + listing.listingName + '</div><div class="spDashboard__listing-item__pricing">' + pricing + '</div><div class="spDashboard__listing-item__host"><div class="spDashboard__listing-item__host-left"><img src="' + renderUserProfileImage(listing.listingPostedByPic) + '" alt=""></div><div class="spDashboard__listing-item__host-right">Hosted By <span>' + listing.listingPostedBy + '</span></div></div><div class="spDashboard__listing-item__ctas">' + renderEditButton + '<div class="spDashboard__listing-item__cta spDashboard__listing-item__cta-delete">Delete</div><div class="spDashboard__listing-item__cta spDashboard__listing-item__cta-preview">Preview</div></div></div></div>';
			});

			function renderPricing(pricing, costDuration, currency) {
				pricingItem = '';

				if (pricing) {
					pricingItem = currency + ' ' + numberWithCommas(Number(pricing)) + ' /' + costDuration;
				}

				return pricingItem;
			}
		}

		return renderItem;
	}
}

function renderNearByUsersInMap(response) {
	var locations = [];
	// Array of locations (latitude, longitude)
	for (var i = 0; i < response.object.length; i++) {
		//locations.push({lat: response.object[i].currentLocation.locationLat, lng: response.object[i].currentLocation.locationLng});
		locations.push({ lat: response.object[i].locationLat, lng: response.object[i].locationLong });
	}

	var bounds = new google.maps.LatLngBounds();
	var map = new google.maps.Map(document.getElementById('map'));

	// Extend bounds to include all locations
	for (var i = 0; i < locations.length; i++) {
		bounds.extend(new google.maps.LatLng(locations[i].lat, locations[i].lng));
	}

	// Fit map to bounds
	map.fitBounds(bounds);

	// Add markers for each location
	for (var i = 0; i < locations.length; i++) {
		new google.maps.Marker({
			position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
			map: map
		});
	}
}

function renderAddListing(state, data, element) {
	if (state == 'init') {

		listingId = 0;
		if (data && data.listingId) {
			listingId = data.listingId;
		}


		jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="addListings__page"><form id="addListings__form"  listing-id=' + listingId + '><div class="addListing__page addListing__home"></div><div class="addListing__page addListing__page-1"></div><div class="addListing__page addListing__page-2"></div><div class="addListing__page addListing__page-3"></div><div class="addListing__page addListing__page-4"></div><div class="addListing__page addListing__page-5"></div><div class="addListing__page addListing__page-6"></div><div class="addListing__page addListing__page-7"></div><div class="addListing__page addListing__thankYou"></div></form></div>');

		renderAddListing__home();
		renderAddListing__page1();
		renderAddListing__page2();
		renderAddListing__page3();
		renderAddListing__page5();
		renderAddListing__page6();
		renderAddListing__thankYou();

		if (data) {
			assignValuesForEdit();
		}

		setTimeout(() => {
			loaderMain('secondary', false)
		}, 100);
	}
	else if (state == 'renderFacillities') {
		if (data.responseCode !== 200) {
			render404();
		}
		else {
			renderAddListing__page4(data.object.attributes);
		}
	}
	else if (state == 'renderPricing') {
		if (data.responseCode !== 200) {
			render404();
		}
		else {
			renderAddListing__page7(data.object.costDuration);
		}
	}
	else if (state == 'uploadedListingImages') {
		console.log(data);

		if (data.responseCode !== 200) {
			toast.error(data.errorMessage);
		}
		else {
			data.failedUploads.forEach(
				function (name, idx) {
					jQuery('.form__image-container__small').each(function () {
						if (jQuery(this).find('img').length > 0 && (jQuery(this).find('input').getValue() == name)) {
							jQuery(this).find('img').addClass('error');
							return false;
						}
					});
				}
			);

			data.successfulUploads.forEach((img) => {
				imgContainer = jQuery('.form__image-container__small input[value="' + element + '"]');
				element = element + 1;

				imgContainer.parent().find('img').attr('src', renderUserProfileImage(img.Key));
				imgContainer.parent().find('img').removeClass('error');
				imgContainer.attr('value', img.Key);
			})
		}
	}
	else if (state == 'savedListing') {
		jQuery('.addListing__page').hide('slide', { direction: 'left' }, 300);
		jQuery('.addListing__thankYou').show('slide', { direction: 'right' }, 300);

		renderSpDashboard('refresh');
	}
	else if (state == 'updateListingStatus') {
		toast('Succesful.');
	}

	function assignValuesForEdit() {
		console.log(data);
		localStorage.setItem('editListing', JSON.stringify(data));

		jQuery('input[name="addListing-title"]').val(data.listingName);
		jQuery('input[name="addListing-address1"]').val(data.listingAddress);
		jQuery('input[name="addListing-address-2"]').val(data.listingAddress2);
		jQuery('input[name="addListing-address-area"]').val(data.listingAddressLocality);
		jQuery('input[name="addListing-address-city"]').val(data.listingCity);
		jQuery('input[name="addListing-address-state"]').val(data.listingState);
		jQuery('input[name="addListing-address-country"]').val(data.listingCountry);
		jQuery('input[name="addListing-address-pincode"]').val(data.listingZipcode);
		jQuery('textarea[name="addListing-about"]').html(data.listingDescription);
		//Room attributes
		data.listingAttribute.forEach(function (atr) {
			//
			//Based on atr.attributeId, select the controls of addListing-section-1 and addListing-section-3.
		})
		jQuery('input[name="addListing-social-youtube"]').val(data.socialYoutube);
		jQuery('input[name="addListing-social-website"]').val(data.socialWeb);
		jQuery('input[name="addListing-social-linkedin"]').val(data.socialTwitter);
		jQuery('input[name="addListing-social-facebook"]').val(data.socialFacebook);
		jQuery('input[name="addListing-social-instagram"]').val(data.socialInstagram);
		jQuery('input[name="addListing-price"]').val(data.costAmount);
		//Based on data.isPriceDefined (true/false) we need to set addLisitngs-pricingAvailable
		//Check if the below thing works
		//per day or per hour something like this
		jQuery('input[name="addListing-priceType"]').val(data.costDurationId);
		//Images has to be set
		/*{
			"mktListingMediaId": "26",
			"mediaPath": "uploads/posts/29292-1653315787692.jpg",
			"mediaType": "image"
		},
		*/
		jQuery('.addListing__form-service[data-service-id="' + data.listingTypeId + '"]').trigger('click');
		x = 0;
		data.listingMedia.forEach(function (mediaObj) {
			//mediaObj
			jQuery('.form__image-container__small').each(function () {
				//Check if the div is empty
				if (jQuery(this).find('img').length == 0) {
					jQuery(this).append('<img src="' + renderUserProfileImage('/filters:format(webp)/fit-in/250x160/' + mediaObj.mediaPath) + '">');
					jQuery(this).append('<span class="form__image-container__small-remove">x</span>');
					jQuery(this).append('<input type="hidden" data-media-id="' + mediaObj.mktListingMediaId + '" name="listingImage-' + x + '" value="' + mediaObj.mediaPath + '">');
					x++;
					return false;
				}
			});
		})
		jQuery('input[name="addListing-address-lat"]').val(data.listingLat);
		jQuery('input[name="addListing-address-long"]').val(data.listingLong);
	}

	function renderAddListing__home() {
		jQuery('.addListing__home').append('<div class="addListings__header"><span class="addListings__exit">' + icons.back + '</span> Manage Listings</div><div class="addListings__body"><div class="addListings__home-image"><img src="/view/assets/img/addListings-home.png" alt=""></div><div class="addListings__home-content"><span>Need tips to get started?</span><p>Check out our FAQs ' + icons.questions + '</p></div></div><div class="addListings__footer" data-position="0">Create Service Listing' + icons.back + '</div>');
	}

	function renderAddListing__page1() {
		jQuery('.addListing__page-1').html('<div class="addListings__header"><span class="addListings__back">' + icons.back + '</span><span class="addListing__header-title">Add New Listing</span><span class="addListing__steps" data-step="1">Step 1 / 7 ' + icons.carretDown + '</span></div><div class="addListings__body"><div class="form__row form__serviceType"><div class="form__column"><label for="addListing-serviceType">Select the Service you are providing</label><div class="addListing__form-services"><div class="addListing__form-service active" data-service-id="1"><img src="/view/assets/img/addListing-hotel.png" alt="B&B/ Hotel/ Homestay - Travel Buddy"><span>B&B/ Hotel/ Homestay</span><input type="radio" checked name="addListing-serviceType" value="1"></div><div class="addListing__form-service" data-service-id="2"><img src="/view/assets/img/addListing-transport.png" alt="Transport - Travel Buddy"><span>Transport</span><input type="radio" name="addListing-serviceType" value="2"></div><div class="addListing__form-service" data-service-id="4"><img src="/view/assets/img/addListing-hostel.png" alt="Hostel - Travel Buddy"><span>Hostel</span><input type="radio" name="addListing-serviceType" value="4"></div><div class="addListing__form-service" data-service-id="3"><img src="/view/assets/img/addListing-tour-guide.png" alt="Tour Guide - Travel Buddy"><span>Trek/ Tour/ Guide</span><input type="radio" name="addListing-serviceType" value="3"></div><div class="addListing__form-service" data-service-id="5"><img src="/view/assets/img/addListing-travel-agent.png" alt="Travel Agent - Travel Buddy"><span>Travel Agent</span><input type="radio" name="addListing-serviceType" value="5"></div></div></div></div><div class="addListing__steps-info"><h4>It’s Super Simple to list your Services!</h4><ul><li><b>Step 1 - 4:</b>Select your Service & describe it in detail</li><li><b>Step 5:</b>Add Photos that are unique to your service</li><li><b>Step 6:</b>Add the social links of your business</li><li><b>Step 7:</b>Set your price and Publish your Listing!</li></ul></div></div><div class="addListings__footer" data-position="1">Tell us about your Service, <b>Next</b>' + icons.back + '</div>');
	}

	function renderAddListing__page2() {
		jQuery('.addListing__page-2').html('<div class="addListings__header"><span class="addListings__back">' + icons.back + '</span><span class="addListing__header-title">Add New Listing</span><span class="addListing__steps" data-step="2">Step 2 / 7 ' + icons.carretDown + '</span></div><div class="addListings__body"><div class="form__row"><div class="form__column"><label for="addListing-title">Name your Business<span class="character__count">0/50</span></label><input type="text" name="addListing-title" id="addListing-title" placeholder="Type the name of your Business" maxlength="50"><div class="addListing__form-tip">' + icons.tip + '<span>If you have an established business, use the same name.<br>If you’re starting new, keep the name <b>short & relatable</b>.</span></div></div></div><div class="form__row"><div class="form__column"><label for="addListing-about">Give us a brief Intro of your Service<span class="character__count">0/1000</span></label><textarea name="addListing-about" placeholder="Type out a brief intro of what you do..." id="addListing-about" cols="30" rows="8" maxlength="1000"></textarea></div></div></div><div class="addListings__footer" data-position="2">Add your Location, <b>Next</b>' + icons.back + '</div>');
	}

	function renderAddListing__page3() {
		jQuery('.addListing__page-3').html('<div class="addListings__header"><span class="addListings__back">' + icons.back + '</span><span class="addListing__header-title">Add New Listing</span><span class="addListing__steps" data-step="3">Step 3 / 7 ' + icons.carretDown + '</span></div><div class="addListings__body"><div class="form__row"><div class="form__column"><label for="addListing-address1">Where do you provide business?</label><div class="form__search-box"><input type="text" placeholder="Search your area or locality" id="addListing-address1" name="addListing-address1" autocomplete="new-password"><span>' + icons.searchBar + '</span></div></div></div><hr><div class="form__row"><div class="form__column"><label for="addListing-address-2" class="sub-label">Continue filling up your address</label><div class="form__cluster"><input type="text" name="addListing-address-2" id="addListing-address-2" placeholder="Building & Street Name."> <input type="text" name="addListing-address-area" placeholder="Area/ Locality" id="addListing-address-area"> <input type="text" name="addListing-address-landmark" placeholder="Landmark (optional)" hidden="true" id="addListing-address-landmark"> <input type="text" name="addListing-address-city" placeholder="City" id="addListing-address-city"> <input type="text" name="addListing-address-pincode" placeholder="PIN Code" id="addListing-address-pincode"> <input type="text" name="addListing-address-state" placeholder="State" id="addListing-address-state"> <input type="text" name="addListing-address-country" placeholder="Country" id="addListing-address-country"><input type="hidden" name="addListing-address-lat" id="addListing-address-lat"  value=""/><input type="hidden" name="addListing-address-long" id="addListing-address-long" value=""/></div></div></div></div><div class="addListings__footer" data-position="3">Share more specific details, <b>Next</b>' + icons.back + '</div>');

		renderPlaces();

		function renderPlaces() {
			initializeAutocomplete("addListing-address1");
		}
	}

	function renderAddListing__page4(data) {
		console.log(data);
		editListingData = JSON.parse(localStorage.getItem('editListing'));
		jQuery('.addListing__page-4').html('<div class="addListings__header"><span class="addListings__back">' + icons.back + '</span><span class="addListing__header-title">Add New Listing</span><span class="addListing__steps" data-step="4">Step 4 / 7 ' + icons.carretDown + '</span></div><div class="addListings__body"></div><div class="addListings__footer" data-position="4">Share more specific details, <b>Next</b>' + icons.back + '</div>');

		data.forEach(section => {
			if (section.sectionId == 2) {
				jQuery('.addListing__page-4 .addListings__body').append('<div class="form__row"><div class="form__column"><div class="form__pricing-addLater"><span>' + icons.parking + ' Does your place have parking?</span><div class="form__pricing-addLater__toggle"><label class="switch"><input type="checkbox" name="addListing-section-' + section.sectionId + '"><span class="slider round"></span></label></div></div></div></div>');
			}
			else {
				jQuery('.addListing__page-4 .addListings__body').append('<div class="form__row"><div class="form__column"><label for="addListing-section-' + section.sectionId + '">Select the ' + section.section + '</label><div class="form__checkbox-box form__checkbox-box-' + section.sectionId + '"></div></div></div>');

				section.attribute.forEach(attribute => {
					jQuery('.addListing__page-4 .form__checkbox-box-' + section.sectionId).append('<div class="form__checkbox-item"><span>' + attribute.attributeName + '</span><input type="checkbox" value="' + attribute.attributeId + '" class="hidden" name="addListing-section-' + section.sectionId + '"></div>');
				});

				if (!editListingData) {
					//Click the first option inside each
					jQuery('.addListing__page-4 .form__checkbox-box-' + section.sectionId + ' .form__checkbox-item:first-child').click();
				}
			}
		});

		if (editListingData) {
			console.log(editListingData);
			editListingData.listingAttribute.forEach(attribute => {
				asd = jQuery('.addListing__page-4 input[value="' + attribute.attributeId + '"]').parents('.form__checkbox-item');
				if (!asd.hasClass('active')) {
					asd.click();
				}
			});
		}
	}

	function renderAddListing__page5() {
		coverPhotoDiv = '<h5>Set Cover Photo</h5><div class="form__image-container__larger"></div>';
		coverPhotoDiv = '';

		jQuery('.addListing__page-5').html('<div class="addListings__header"><span class="addListings__back">' + icons.back + '</span><span class="addListing__header-title">Add New Listing</span><span class="addListing__steps" data-step="5">Step 5 / 7 ' + icons.carretDown + '</span></div><div class="addListings__body"><div class="form__row form__upload-box"><div class="form__column"><label>Upload Photos / Videos</label><span class="sub-label">Show off the uniqueness of your business</span><div class="form__upload-box__buttons"><div class="form__upload-box__button form__upload-box__button-gallery">' + icons.gallery + '<span>Upload from Gallery</span></div><div class="form__upload-box__button form__upload-box__button-camera">' + icons.camera + '<span>Take Picture Now</span></div><input type="file" class="hidden" id="addListing-media" name="addListing-media" multiple="multiple"></div></div></div><div class="form__row form__image-containter"><div class="row">' + coverPhotoDiv + '</div><div class="row"><h6 data-count="0">0/12 photos uploaded</h6><div class="row flex"><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div><div class="form__image-container__small"></div></div></div></div><div class="form__row"><div class="form__column"><div class="addListing__form-tip">' + icons.tip + '<span>You can upload <b>up to 12 photos + videos</b> - show us your best shot.<br>Videos can be a max. of <b>2 mins</b> - this can be your stage to explain!</span></div></div></div></div><div class="addListings__footer" data-position="5">Set your Price, <b>Next</b>' + icons.back + '</div>');
	}

	function renderAddListing__page6() {
		jQuery('.addListing__page-6').html('<div class="addListings__header"><span class="addListings__exit">' + icons.back + '</span><span class="addListing__header-title">Add New Listing</span><span class="addListing__steps" data-step="6">Step 6 / 7 ' + icons.carretDown + '</span></div><div class="addListings__body"><div class="form__row"><div class="form__column"><label for="addListing-social">Social & Website Links</label><div class="form__cluster"><div class="form__cluster-row"><input type="text" name="addListing-social-website" placeholder="Website" id="addListing-social-website"> ' + icons.website + '</div><div class="form__cluster-row"><input type="text" name="addListing-social-youtube" placeholder="YouTube" id="addListing-social-youtube"> ' + icons.youtube + '</div><div class="form__cluster-row"><input type="text" name="addListing-social-linkedin" placeholder="LinkedIn" id="addListing-social-linkedin"> ' + icons.linkedIn + '</div><div class="form__cluster-row"><input type="text" name="addListing-social-facebook" placeholder="Facebook" id="addListing-social-facebook"> ' + icons.facebook + '</div><div class="form__cluster-row"><input type="text" name="addListing-social-instagram" placeholder="Instagram" id="addListing-social-instagram"> ' + icons.instagram + '</div></div></div></div></div><div class="addListings__footer" data-position="6">Set your Price, <b>Next</b>' + icons.back + '</div>');
	}

	function renderAddListing__page7(data) {
		costDurations = renderCostDurations(data);

		jQuery('.addListing__page-7').html('<div class="addListings__header"><span class="addListings__back">' + icons.back + '</span><span class="addListing__header-title">Add New Listing</span><span class="addListing__steps" data-step="7">Step 7 / 7 ' + icons.carretDown + '</span></div><div class="addListings__body"><div class="form__row"><div class="form__column"><label for="addListing-price">Set your Price</label><div class="form__pricing-box"><input type="number" placeholder="Type your price here..." id="addListing-price" name="addListing-price"><div class="form__pricing-box__currency">₹</div></div><div class="form__pricing-sub__box"><p>Don’t worry, you can change the price even later</p><select name="addListing-priceType" id="addListing-priceType">' + costDurations + '</select></div></div></div><div class="form__row"><div class="form__column"><div class="form__pricing-addLater"><span>Want to add your Price later?</span><div class="form__pricing-addLater__toggle"><label class="switch"><input type="checkbox" name="addLisitngs-pricingAvailable"><span class="slider round"></span></label></div></div></div></div><div class="form__row form__contactHelp"><div class="form__column"><div class="form__contactHelp-sub">Not sure how to set your price?</div><div class="form__contactHelp-title">Contact our Expert Team ' + icons.call_center + '</div></div></div></div><div class="addListings__footer draft" data-position="draft"><b>Save as Draft</b></div><div class="addListings__footer publish" data-position="publish"><b>Publish Listing</b></div></div>');

		editListingData = JSON.parse(localStorage.getItem('editListing'));
		if (editListingData) {
			if (editListingData.isPriceDefined) {
				jQuery('.form__pricing-addLater__toggle label').trigger('click');
			}

			jQuery('input[name="addListing-price"]').val(editListingData.costAmount);
			jQuery('select[name="addListing-priceType"]').val(editListingData.costDurationId);
		}

		function renderCostDurations(data) {
			costDurations = '';

			data.forEach(costDuration => {
				costDurations += '<option value="' + costDuration.costDurationId + '">' + costDuration.costDuration + '</option>';
			});

			return costDurations;
		}
	}

	function renderAddListing__thankYou() {
		jQuery('.addListing__thankYou').html('<div class="addListings__header"><span class="addListings__exit">' + icons.back + '</span><span class="addListing__header-title">Manage Listings</span></div><div class="addListings__body"><div class="addListings__home-image"><img src="/view/assets/img/addListing-thankYou.png" alt=""></div><div class="addListings__thankYou-review"><img src="/view/assets/img/addListing-review.png" alt=""></div><div class="addListings__thankYou-back">' + icons.back + ' Return to the Dashboard</div></div><div class="addListings__footer"></div>');
	}
}

function renderLFB(state, data) {
	if (state == 'render') {
		console.log(data);
		data = data.object;

		if (data.length > 0) {
			jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="lfb__page"></div>');

			data.forEach(lfb => {
				if (lfb.postCount > 1) {
					jQuery('.lfb__page').append('<div class="lfb__item" data-location="' + lfb.location + '"><div class="lfb__item-left">' + icons.location + '</div><div class="lfb__item-right"><div class="lfb__item-location">' + lfb.location + '</div><div class="lfb__item-line">' + lfb.postCount + ' people looking for buddy</div></div></div>');
				}
			});

			setTimeout(() => {
				loaderMain('secondary', false);
			}, 200);
		}
		else {
			render404();
		}
	}
}

function renderLeads(state, data, from) {
	if (state == 'render') {
		console.log(data);
		data = data.object.leads;
		console.log(data);

		if (jQuery('.leads__page').length == 0) {
			jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="leads__page"></div>');

			//Add two tabs inside the leads page
			jQuery('.leads__page').append('<div class="leads__tab"><div class="leads__tab-item leads__tab-new active">New Leads</div><div class="leads__tab-item leads__tab-contacted">Contacted Leads</div></div>');

			//Add the tab bodies
			jQuery('.leads__page').append('<div class="leads__tab-body"><div class="leads__tab-body-item leads__tab-body-new active"></div><div class="leads__tab-body-item leads__tab-body-contacted"></div></div>');
		}

		setTimeout(() => {
			loaderMain('secondary', false);
		}, 200);

		if (from == 'New Leads') {
			where = '.leads__tab-body-new';
		}
		else {
			where = '.leads__tab-body-contacted';
		}

		jQuery(where).html('');

		if (data.length > 0) {
			data.forEach(lead => {
				followers = (lead.userFollowersCount) ? lead.userFollowersCount : 0;
				jQuery(where).append('<div class="lead__item" data-id="' + lead.listingInterestID + '"><div class="lead__item-left"><img src="' + renderUserProfileImage(lead.userDisplayPicture) + '" alt=""></div><div class="lead__item-content"><div class="lead__item-top"><div class="lead__item-top-left"><div class="lead__item-name">' + lead.userFullName + '</div><div class="lead__item-titbits"><span class="lead__item-followers">' + icons.person + numberWithK(followers) + ' Followers</span>|<span class="lead__item-posts">' + icons.starFill + lead.userRating + ' Rating</span></div></div><div class="lead__item-top-right"><div class="lead__item-connect">Connect</div></div></div><div class="lead__item-bottom"><div class="lead__item-bottom-header">For:</div><div class="lead__item-listing">Interested in ' + lead.listingName + '</div><div class="lead__item-date">Contacted ' + lead.days + ' days ago</div></div></div></div>')
			});
		}
		else {
			//In the case of no leads add a message to the active tab body
			jQuery('.leads__tab-body--active').append('<div class="leads__noLeads">No leads found</div>');
		}
	}
	else if (state == 'connect') {
		if (data.responseCode !== 200) {
			toast(data.errorMessage);
		}
		else {
			jsInit('contactedLeads', { "option": 0 }, 'New Leads');
			jsInit('contactedLeads', { "option": 1 }, 'Contacted Leads');

			toast('Lead contacted successfully');
		}
	}
}

/*function renderWelcomeScreens() {
	url = window.location.href;

	//If url is
	if (url.includes('experiences')) {
		jQuery('#main').append('<div class="welcome_screens"><div class="swiper-wrapper"><div class="swiper-slide"><div class="welcome__screen welcome__screen-type__1"><div class="welcome__screen-background"><img src="' + nodeUrlCheck('/view/assets/img/mini_splash_screen-1.jpg') + '" alt=""></div><div class="welcome__screen-bubble">Find Local Influencers<span class="highlight">& Experiences</span></div></div></div><div class="swiper-slide"><div class="welcome__screen welcome__screen-type__1"><div class="welcome__screen-background"><img src="' + nodeUrlCheck('/view/assets/img/mini_splash_screen-2.jpg') + '" alt=""></div><div class="welcome__screen-bubble"><span class="green">Share</span> Your Travel <span class="green">Stories</span><div class="welcome__screen-subText">- Follow, Chat, Connect & Travel</div></div></div></div><div class="swiper-slide"><div class="welcome__screen welcome__screen-type__1"><div class="welcome__screen-background"><img src="' + nodeUrlCheck('/view/assets/img/mini_splash_screen-3.jpg') + '" alt=""></div><div class="welcome__screen-bubble">Plan Your Next Trip With The<span class="highlight">Community</span></div></div></div><div class="swiper-slide"><div class="welcome__screen welcome__screen-type__2"><div class="welcome__screen-background"></div><div class="welcome__screen-title">Welcome!</div><div class="welcome__screen-icon">' + icons.binoculars + '</div><div class="welcome__screen-bubble welcome__screen-bubble__white">Why not use our app as our guest?<div class="welcome__screen-subText">And signup later</div></div></div></div></div><div class="swiper-button-next"></div><div class="swiper-pagination"></div></div>');

		swiper('welcome_screens', '.welcome_screens');
	}
}*/

function renderFeedback(state, data) {
	if (state == 'init') {
		jQuery('#secondary .secondary__tab:last-child .drawerBody').append(
			'<div class="feedback__page"><div class="feedback__title"><label for="feedback__text">Give your feedback</label></div><div class="feedback__form-box"><form id="feedback__form"><div class="form__row"><div class="form__column"><textarea name="feedback__text" id="feedback__text" rows="6" placeholder="Let us know where we can improve.."></textarea></div></div><div class="form__row form__submit"><div class="form__column"><button>Submit</button></div></div></form></div></div>'
		);

		setTimeout(() => {
			loaderMain('secondary', false);
		}, 200);
	}
	else if (state == 'onSubmit') {
		if (data.responseCode != 200) {
			//SlideDown and fadeOut in 5 seconds
			toast(data.errorMessage);
			jQuery('#feedback__text').addClass('err');
		}
		else {
			//Reset the form
			jQuery('#feedback__text').val('');
			toast('Thank You for Submitting your valuable feedback. We take it under consideration soon.');
		}
	}
}

function renderRecommendedFollowers(state, data) {
	if (state == 'init') {
		if (jQuery('.recommendedFollowers__page').length == 0) {
			jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="recommendedFollowers__page"><div class="recommendedFollowers__list"></div></div>');
			loaderMain('secondary', true);
			setTimeout(() => {
				if (localStorage.getItem('userLong') > 0 && localStorage.getItem('userLat') > 0) {
					latitude = localStorage.getItem('userLat');
					longitude = localStorage.getItem('userLong');
				}
				else {
					latitude = 22.9734;
					longitude = 78.6569;
				}

				jsInit('getFeedCards', { feedsType: 7, isVerified: 1, locationLat: latitude, locationLong: longitude, feedCardInfo: { card_type: "users_you_may_follow", card_position: 1 }, location: manageUserProfile('read', 'location') }, 'recommendedFollowers');
			}, 750);
		}
	}
	else if (state == 'render') {
		console.log(data);
		if (data.responseCode == 200) {
			data = data.object.users_you_may_follow.users;

			data.forEach(user => {
				if (user.isFollowing == false) {
					isInfluencer = user.roleType == 7;
					imagePath = getProfileImage(renderUserProfileImage(user.imageUrl), '', '', '', isInfluencer);
					jQuery('.recommendedFollowers__list').append('<div class="desktopSideBar-followers-item" data-user="' + user.userId + '"><div class="desktopSideBar-followers-item__left"><div class="desktopSideBar-followers-item__left__left">'+ imagePath +'</div><div class="desktopSideBar-followers-item__left__right"><div class="desktopSideBar-followers-user">' + user.name + '</div><div class="desktopSideBar-followers-location">' + user.city + '</div></div></div><div class="desktopSideBar-followers-item__right"><a class="follow-user" data-following="false">Follow</a></div></div></div>');
				}
			});
		}
		else {
			render404();
		}

		setTimeout(() => {
			loaderMain('secondary', false);
		}, 100);
	}
}

function renderBlockerUsers(state, data) {
	if (state == 'init') {
		jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="blocked__users"><div class="blocked__list"></div></div>');

		jsInit('blockedUsers', '');
	}
	else if (state == 'render') {
		if (data.responseCode != 200) {
			//SlideDown and fadeOut in 5 seconds
			toast(data.errorMessage);
		}
		else {
			if (data.object.length > 0) {
				data.object.forEach((element) => {
					jQuery('.blocked__list').append('<div class="blocked__list-item" data-user="' + element.userId + '"><div class="blocked__list-item__left"><div class="blocked__list-item-img"><img src="' + renderUserProfileImage(element.imageUrl) + '"></div><div class="blocked__list-item-name">' + element.name + '</div></div><div class="blocked__list-item__right"><div class="blocked__list-item-unblock">Unblock</div></div></div>');
				});
			}
			else {
				renderNoBlockedUsers();
			}

			loaderMain('secondary', false);
		}
	}
	else if (state == 'unblockUser') {
		if (data.responseCode != 200) {
			toast(data.errorMessage);
		}
		else {
			toast('User Unblocked');
			jQuery('.blocked__list-item[data-user="' + data.request.userId + '"]').remove();
			if (jQuery('.blocked__list-item').length == 0) {
				renderNoBlockedUsers();
			}
		}
	}
	else if (state == 'blockUser') {
		console.log(data);
		if (data.responseCode != 200) {
			toast(data.errorMessage);
		}
		else {
			jQuery('.popup__mask').click();
			toast('We have blocked this user for you. You will no longer see any posts from this user.');
		}
	}

	function renderNoBlockedUsers() {
		jQuery('.blocked__list').append('<div class="no-posts"><div class="no-posts__icon">' + icons.happySmiley + '</div><div class="no-posts__text">No Blocked Users</div></div>');
	}
}

function renderReportBox(state, id, where) {
	if (state == 'init') {
		managePopups('show', '');
		jQuery('#app .popup__master')
			.find('.popup__body')
			.append('<div class="report__box" data-type="' + where + '" data-id="' + id + '"><div class="report__box__options"></div><div class="report__box-ctas"><div class="report__box-cancel">Cancel</div><div class="report__box-complete">Report</div></div>');

		if (where == 'profile') {
			title = 'What is wrong with this User?';
			options = ["I don't like this user", 'Over Messaging', 'Nudity or Pornography', 'Violence or Harm', 'Inappropriate Content', 'Inappropriate Behaviour', 'Fake Profile'];
			jQuery('.popup__master').addClass('report__box__profile');
		}
		else if (where == 'chat') {
			title = 'What is wrong with this User?';
			options = ["I don't like this user", 'Over Messaging', 'Nudity or Pornography', 'Violence or Harm', 'Inappropriate Content', 'Inappropriate Behaviour', 'Fake Profile'];
			jQuery('.popup__master').addClass('report__box__profile');
			jQuery('.report__box-complete').text('Report & Block');
		}
        else if (where == 'givePremium') {
            title = 'Select the Duration for Premium Membership';
            options = ['1 Month', '3 Months', '1 Year'];
            jQuery('.popup__master').addClass('report__box__profile');
            jQuery('.report__box-complete').text('Confirm');
        }
		else {
			title = 'What is wrong with this Post?';
			options = ['Non Travel Related', 'Offensive Post', 'Nudity or Pornography', 'Violence or Harm', 'Scam related posts', 'Other'];
		}

		jQuery('#app .popup__master .popup__head-title').html(title);
		options.forEach((element) => {
			jQuery('.report__box__options').append('<div class="report__box__option">' + element + '</div>');
		});
	}
	else if (state == 'response') {
		if (id.responseCode != 200) {
			toast(id.errorMessage);
		}
		else {
			jQuery('.popup__mask').click();
			if (where == 'post') {
				toast('Thank you for reporting this post. Our team will take action soon.');
			}
			else if (where == 'profile') {
				toast('Thank you for reporting this user. Our team will take action soon.');
			}
		}

		loaderMain('global', false);
	}
}

function messagePopups(state, what, force) {

	if (state == 'init') {
		if (what == 'announcement') {
			if (localStorage.getItem('announcement') == undefined || localStorage.getItem('announcement') == null || force) {
				if (force) {
					renderMessagePopup(what);
				} else {
					setTimeout(() => {
						renderMessagePopup(what);
					}, 10000);
				}
			}

			localStorage.setItem('announcement', true);
		}
	}

	function renderMessagePopup(what) {
		managePopups('show');

		announcement = renderAnnouncement(what);
		logo = renderLogo(what);
		content = renderContent(what);
		storelogos = renderStoreLogos(what);
		ctas = renderCTAs(what);

		jQuery('#app .popup__master').addClass('message_popup').find('.popup__body').append('<div class="message__popup-page"><div class="message__popup-head"><div class="swiper-wrapper"><div class="swiper-slide"><img src="/view/assets/img/announcement-1.jpg"></div></div>' + announcement + '</div><div class="message__popup-body">' + logo + content + storelogos + ctas + '</div></div>');
	}

	function renderAnnouncement(what) {
		renderItem = '';

		if (what == 'announcement') {
			renderItem = '<div class="message__popup-head__text">' + icons.alert + ' Announcement</div>';
		}

		return renderItem;
	}

	function renderLogo(what) {
		renderItem = '';

		if (what == 'latest' || what == 'whats new' || what == 'emergency') {
			renderItem = '<div class="message__popup-body__logo"><img src="/view/assets/img/logo.png" alt="Travel Buddy - Logo"></div>';
		}

		return renderItem;
	}

	function renderContent(what) {
		renderItem = '';

		if (what == 'announcement') {
			renderItem = '<div class="message__popup-body__content"><h3>Our website just launched and is in Beta.</h3><p>Would appreciate your feedback. For our production app please download the below iOS & android.</p></div>';
		}

		return renderItem;
	}

	function renderStoreLogos(what) {
		renderItem = '';

		if (what == 'announcement') {
			renderItem = '<div class="message__popup-body__apps"><ul><li><a href="https://play.google.com/store/apps/details?id=com.beatravelbuddy.travelbuddy&hl=en_IN&gl=US&pli=1" target="_blank"><img src="/view/assets/img/playstore.png" alt="Travel Buddy - Play Store"></a></li><li><a href="https://apps.apple.com/us/app/travel-buddy-a-social-network/id1336926442" target="_blank"><img src="/view/assets/img/appstore.png" alt="Travel Buddy - App Store"></a></li></ul></div>';
		}

		return renderItem;
	}

	function renderCTAs(what) {
		renderItem = '';

		if (what == 'announcement') {
			renderItem = '<div class="message__popup-cta" redirect="feedback">Share your feedback ' + icons.right + '</div>';
		}

		return renderItem;
	}
}

function renderPermissionPopups(state, what) {
	openPopup = false;
	isUserLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
	var callLocationPopup = localStorage.getItem('callLocationPopup');
	var callNotificationPopup = localStorage.getItem('callNotificationPopup');

	if (state == 'init') {
		//If the popup is already open delay the popup by 5 seconds
		if (jQuery('#main__drawer .permission__drawer').length > 0 || jQuery('.message__popup-page').length > 0 || jQuery('.welcome_screens').length > 0) {
			setTimeout(() => {
				renderPermissionPopups(state, what);
			}, 5000);

			return false;
		}


		if ((what == 'location' && !callLocationPopup) || (what == 'location' && isIOS())) {
			// && !navigator.geolocation
			if (isAndroid()) {
				openPopup = true;
			}
			else if (isIOS()) {
				openPopup = true;
			}
			else {
				openPopup = false;
			}
		}
		else if (what == 'notifications' && !callNotificationPopup) {
			if (isAndroid() || isIOS()) {
				openPopup = true;
			}
		}

		if (openPopup) {
			renderPermissionsPopup(what);
			drawer('open', 'mini');
		}
	}

	function renderPermissionsPopup(what) {
		headImage = renderHeadImage(what);
		icon = renderIcon(what, icons);
		body = renderBody(what);
		allowButton = renderAllowButton(what);

		jQuery('#main__drawer .drawerBody').append('<div class="permission__drawer"><div class="permission__drawer-head">' + headImage + icon + '</div>' + body + '<div class="permission__drawer-ctas">' + allowButton + '<div class="permission__drawer-cta permission__drawer-cta--cancel">Don’t Allow</div></div></div>');
	}

	function renderHeadImage(what) {
		renderItem = '';

		if (what == 'location') {
			renderItem = '<img draggable="false" src="/view/assets/img/location-popup-background.png" alt="">';
		}
		else if (what == 'notifications') {
			renderItem = '<img draggable="false" src="/view/assets/img/location-popup-background.png" alt="">';
		}

		return renderItem;
	}

	function renderIcon(what, icons) {
		renderItem = '';

		if (what == 'location') {
			renderItem = icons.location_permissions;
		}
		else if (what == 'notifications') {
			renderItem = icons.notification_permissions;
		}

		return renderItem;
	}

	function renderBody(what) {
		renderItem = '';

		if (what == 'location') {
			renderItem = '<div class="permission__drawer-body"><h4>Enable Location</h4><p>We are asking for your location to serve you better content!</p></div>';
		}
		else if (what == 'notifications') {
			renderItem = '<div class="permission__drawer-body"><h4>Enable Notifications</h4><p>Notifications will include alerts, sound and icon badge to help you stay up to date with what’s happening on the app</p></div>';
		}

		return renderItem;
	}

	function renderAllowButton(what) {
		renderItem = '';

		if (what == 'location') {
			renderItem = '<div class="permission__drawer-cta permission__drawer-cta--allow" data-what="locations">Allow access to location</div>';
		}
		else if (what == 'notifications') {
			renderItem = '<div class="permission__drawer-cta permission__drawer-cta--allow" data-what="notifications">Allow Notifications</div>';
		}

		return renderItem;
	}
}

function renderSettings(state, data) {
	console.log('Reached here!!');

	if (state == 'init') {
		lightMode = (localStorage.getItem('lightMode') == 'false') ? 'checked' : 'checked';

		// We will add these buttons later once their functionality is ready
		/* <div class="notifications_box settings_box"><div class="settings_options"><h4 class="settings_labels">Notifications</h4><div class="tool_tip_settings">' + icons.info_tip + '<div class="drop_down_info_box drop_down_boxPos1"><p class="drop_down_info_content">Disable this to stop getting external notifications on follow.For example on follow , like and ohter activities the app</p></div></div></div><label class="switch"><input type="checkbox"><span class="slider round"></span></label></div><div class="message_notifications_box settings_box"><div class="settings_options"><h4 class="settings_labels">Message Notifications</h4><div class="tool_tip_settings">' + icons.info_tip + '<div class="drop_down_info_box drop_down_boxPos2"><p class="drop_down_info_content">Disable this to stop getting external notifications on messages sent by other users.</p></div></div></div><label class="switch"><input type="checkbox"><span class="slider round"></span></label></div> */

		jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="settings__page"><div class="main_settings_container"><div class="day-night_toggle_box settings_box"><div class="settings_options"><h4 class="settings_labels">Night/Day toggle</h4></div><div class="day-night_switch_box"><input type="checkbox" class="day_night_switch" id="light-dark-switch" ' + lightMode + '><label for="light-dark-switch" class="day_night_switch-label"><i class="fas fa-moon"></i><i class="fas fa-sun"></i><span class="day_night_checkbox-ball"></span></label></div></div><div class="change_passwords_box settings_box"><h4 id="change_password_label" class="settings_labels">Change Passwords</h4></div><div class="deactivate_account settings_box"><div class="label_deactive_acc"><h4 id="deactivate_account_label" class="settings_labels">Deactivate Account</h4>' + icons.back + '</div><div class="deactivate_acc_warning"><p>This action will lead to permanent deletion of your account and your shared content Immediately.</p></div></div></div>');
	}
	else if (state == 'change_password') {
		jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="change_pass_container"><form id="change_pass_form"><div class="change_pass_box"><label for="old_pass" class="pass_label">Old Password</label><input type="password" class="change_password_input" id="old_pass" name="old_pass" placeholder="**********"><span class="show_change-pass">' + icons.passwordShow + '</span></div><div class="change_pass_box"><label for="new_pass" class="pass_label">New Password</label><input type="password" class="change_password_input" id="new_pass" name="new_pass" placeholder="**********"><span class="show_change-pass">' + icons.passwordShow + '</span></div><div class="change_pass_box"><label for="confirm_pass" class="pass_label">Confirm Password</label><input type="password" class="change_password_input" id="confirm_pass" name="confirm_pass" placeholder="**********"><span class="show_change-pass">' + icons.passwordShow + '</span></div><button type="submit" id="confirm_pass_btn" class="confirm_pass_button">Click Here to Change Password</button></form></div>');
	}

	else if (state == 'manageUpdatePass') {
		console.log(data);
		if (data.responseCode !== 200) {
			toast(data.errorMessage);
		}
		else {
			toast("Your Password has been Updated.");
			destroyAllSecondaryTabs();
		}
	}

	else if (state == 'deactivate_account') {
		jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="main_deactivate_box"><div class="deactivate_reason"><h4 class="reason_deactivate">Why do you want to deactivate your account with us ?</h4></div><form class="deactivate_form_box"><div class="deactivate_options_box"><label class="deactivate_reasons_input">App Not Working<input type="radio" checked="checked" name="radio"><span class="checkmark_deactivate_input"></span></label><label class="deactivate_reasons_input">This App is not what I am looking for<input type="radio" name="radio"><span class="checkmark_deactivate_input"></span></label><label class="deactivate_reasons_input">Design is not good<input type="radio" name="radio"><span class="checkmark_deactivate_input"></span></label><label class="deactivate_reasons_input">Poor Content<input type="radio" name="radio"><span class="checkmark_deactivate_input"></span></label><label class="deactivate_reasons_input">Any other Reasons<input type="radio" name="radio"><span class="checkmark_deactivate_input"></span><textarea id="any-other-reasons_box" placeholder="Please tell us, what went wrong.." name="any-other-reasons" rows="4"></textarea></label></div><button type="submit" class="confirm_pass_button" id="deactivate_btn" value="deactivate_account">Click Here to Deactivate your account</button></form></div>');
	}
	else if (state == 'manageDeactivation') {
		console.log(data);
		if (data.responseCode !== 200) {
			toast(data.errorMessage);
			loaderMain('global', false);
		}
		else {
			toast("Your account has been successfully deactivated. Sorry to see you go!");
			setTimeout(() => {
				loaderMain('global', false);
				jsInit('logout', { "deviceUniqueId": "" });
				if (isAndroid()) {
					Android.googleRevokeAccess();
				}
			}, 3000);
		}
	}

	setTimeout(() => {
		loaderMain('secondary', false);
	}, 100);
}

function render404(state) {
	if (state == 'force') {
		console.log('404');
		jQuery('#secondary').append('<div class="secondary__tab"><div class="drawerHeader"><div class="drawerHeader__title">404</div></div><div class="drawerBody"></div></div>');

		jQuery('#secondary .secondary__tab:last-child').show();
	}

	jQuery('#secondary .secondary__tab:last-child .drawerHeader').addClass('no-bg');
	jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="page__404"><div class="page__404-background"><img draggable="false" src="' + nodeUrlCheck('/view/assets/img/404.png') + '" alt="Travel Buddy - 404 Page"></div></div>');

	loaderMain('secondary', false);
}

function renderPermissionBox(state, where, data, imgUrl) {
	if (state == 'init') {
		managePopups('show', '');
		jQuery('#app .popup__master')
			.find('.popup__body')
			.append('<div class="permissions__box" data-type="' + where + '"><div class="report__box-text"></div><div class="permissions__box-ctas"><div class="permissions__box-cancel">No</div><div class="permissions__box-complete">Yes</div></div>');

		if (where == 'blockUser') {
			jQuery('#app .popup__master .popup__head-title').html('Are you sure you want to block this user?');
			jQuery('.report__box-text').html('You will no longer see any posts from this user.');
			jQuery('.popup__master').addClass('permissions');
		}

		else if (where == 'onboardingBack') {
			jQuery('#app .popup__master .popup__head-title').html('Account already exists');
			jQuery('.report__box-text').html('There is in an account that is registered to this number. Would you like to go back and login?');
			jQuery('.popup__master').addClass('permissions');
		}

		else if (where == 'Block User Chat') {
			jQuery('#app .popup__master .popup__head-title').html('Are you sure?');
			jQuery('.report__box-text').html('You will no longer be able to chat with this user.');
			jQuery('.popup__master').addClass('permissions');
		}

		else if (where == 'Delete Post') {
			jQuery('#app .popup__master .popup__head-title').html('Are you sure you?');
			jQuery('.report__box-text').html('Once you delete the post, you will not be able to recover it.');
			jQuery('.popup__master').addClass('permissions');
		}

		else if (where == 'addListing-delete') {
			jQuery('#app .popup__master .popup__head-title').html('Are you sure?');
			jQuery('.popup__master').addClass('permissions');
			jQuery('.report__box-text').html('Once you delete the listing, you will not be able to recover it.');
		}

		else if (where == 'cancel-onBoarding') {
			jQuery('#app .popup__master .popup__head-title').html('Cancel onboarding');
			jQuery('.popup__master').addClass('permissions');
			jQuery('.report__box-text').html('Do you really want to abandon registration? (We will delete your details from our platform upon your confirmation).');
		}

		else if (where == 'deleteGroupChat' || where == 'leaveGroupChat' || where == 'removeGroupMember') {
			jQuery('#app .popup__master .popup__head-title').html('Are you sure?');
			jQuery('.popup__master').addClass('permissions');

			if (where == 'deleteGroupChat') {
				jQuery('.report__box-text').html('Once you delete the group, all the messages will be deleted and you or any group member will not be able to recover them.');
			}
			else if (where == 'leaveGroupChat') {
				jQuery('.report__box-text').html('Once you leave the group, you will not recieve any new messages from the group.');
			}
			else if (where == 'removeGroupMember') {
				jQuery('.report__box-text').html('Once you remove the member, the member will not recieve any new messages from the group. You may add the member back anytime.');
			}
		}
		else if (where == 'addUsersToGroup') {
			jQuery('#app .popup__master .popup__head-title').html(data.createdBy + ' has invited you to join ' + data.groupName + '.' + '');
			jQuery('.popup__master').addClass('permissions');
			jQuery('.report__box-text').html('Once you join the Group, you will be able to see and send messages in the group.');

			jQuery('.permissions__box-ctas .permissions__box-complete').text('Join Group');
			jQuery('.permissions__box-ctas .permissions__box-cancel').text('Decline');

			jQuery('#app .popup__master .popup__body').append('<div class="addUsersToGroup__data" data-groupId="' + data.groupId + '" data-userId="' + localStorage.getItem('plainUserId') + '" data-createdBy="' + data.createdBy + '" data-groupLastMessage="" data-senderId="' + data.senderId + '" data-groupName="' + data.groupName + '" data-groupProfileUrl="' + data.groupProfileUrl + '" data-lastMessageSenderName="" data-isDeleted="false" data-chatType="group"></div>');
		}
		else if (where == 'underMaintainance') {
			jQuery('.report__box-text').html('<div class="page__404"><div class="page__404-background underMaintainance"><img draggable="false" src="' + '/view/assets/img/under_maintainence.png' + '" alt="Travel Buddy - 404 Page"></div></div>');

			// Remove padding from report__box-text
			jQuery('.report__box-text').css('padding', '0');

			jQuery('.permissions__box-ctas').remove();
			jQuery('.popup__head').remove();

		}
		else if (where == 'discardPost') {
			jQuery('#app .popup__master .popup__head-title').html('Discard Post?');
			jQuery('.popup__master').addClass('permissions');
			jQuery('.report__box-text').html('Once you discard the post, you will not be able to recover it.');

			jQuery('.permissions__box-ctas .permissions__box-complete').text('Discard');
			jQuery('.permissions__box-ctas .permissions__box-cancel').text('Cancel');
		}
		else if (where == 'leadForm') {
			minDate = new Date().toISOString().split('T')[0];
			searchedLocation = data ? data + ' ' : '';
			filteredLocations = [...groupTripLocations]; // Initially empty
		
			function createOptions(destinations) {
				return destinations.map((destination) => {
					title = destination.charAt(0).toUpperCase() + destination.slice(1).replace(/-/g, ' ');
					return `<option value="${destination}">${title}</option>`;
				}).join('');
			}
		
			function generateFormHTML(isMobile) {
				locationText = '';
				optionsHTML = createOptions(filteredLocations);
		
				if (searchedLocation) {
					locationText = "Book Your " + searchedLocation.split(',')[0] + " Trip with Travel Buddy. #NeverFeelAlone";
					optionsHTML = createOptions([searchedLocation.split(',')[0], ...groupTripLocations]);  
				} else {
					locationText = "Book Your Trip With Travel Buddy. #NeverFeelAlone";
				}

				hiddenProperty = '';
				tripTypeAndFlightBookedHtml = '<div class="name_number_form"><div class="name_input" ><div class="destination_input"><div class="enquiry_detailed_form"><label for="enquiry_trip_type" >Trip Type ?</label><select name="tripType" id="enquiry_type"><optgroup label="Select Trip Type"><option value="group">Group/Solo/Friends</option><option value="family">Family/Couple</option></optgroup></select></div></div></div><div class="number_input"><div class="enquiry_detailed_form"><label for="enquiry_trip_type">Flights Booked ?</label><select name="flightBooked" id="booked_type"><optgroup label="Flight Booked"><option value="Yes">Yes</option><option value="No">No</option><option value="Na">NA</option></optgroup></select></div></div></div>';
				if(imgUrl){
					imageUrl = imgUrl;
					if (jQuery('.single__experience-page') && jQuery('.single__experience-page').attr('data-type') == 'package'){
						tripTypeAndFlightBookedHtml = '<div class="name_number_form"><div class="number_input"><div class="enquiry_detailed_form"><label for="enquiry_trip_type">Flights Booked ?</label><select name="flightBooked" id="booked_type"><optgroup label="Flight Booked"><option value="Yes">Yes</option><option value="No">No</option><option value="Na">NA</option></optgroup></select></div></div><div class="name_input"><div class="enquiry_detailed_form" style="width: 150px;"><label for="enquiry_name">No Of Pax</label><input type="number" id="enquiry_pax" name="no_of_pax" min="1" max="100" wfd-id="id21"></div></div></div>';
					}else{
						hiddenProperty = ' hidden="until-found" ';
						tripTypeAndFlightBookedHtml = '<div class="name_number_form" hidden="until-found"><div class="name_input" ><div class="destination_input"><div class="enquiry_detailed_form"><label for="enquiry_trip_type" >Trip Type ?</label><select name="tripType" id="enquiry_type"><optgroup label="Select Trip Type"><option value="group">Group/Solo/Friends</option><option value="family">Family/Couple</option></optgroup></select></div></div></div><div class="number_input"><div class="enquiry_detailed_form"><label for="enquiry_trip_type">Flights Booked ?</label><select name="flightBooked" id="booked_type"><optgroup label="Flight Booked"><option value="Yes">Yes</option><option value="No">No</option><option value="Na">NA</option></optgroup></select></div></div></div>';
					}
				}
				else{
					imageUrl = '/view/assets/img/enquiry_background.png';
				}
		
				let destinationHtml = '';
				let useCustomDestination = true;
				if (useCustomDestination) {
					destinationHtml = '<input type="text" id="enquiry_custom_dest" name="custom_destination" placeholder="Goa, Manali, Leh-Ladakh">';
				}
				else {
					destinationHtml = '<select name="destination" id="enquiry_dest"><optgroup label="Select Destination">'+ optionsHTML +'</optgroup></select>';
				}
				
				formHTML = '<div class="report__box-text enquiry__form__container"><div class="enquiry__form__container" id="myForm"><div class="enquiry_form_right"><div class="enquiry__form__input"><div class="form__right_header"><div class="enquiry__form_cancel" id="enquiryCancel"><img src="https://png.pngtree.com/png-vector/20190603/ourmid/pngtree-icon-close-button-png-image_1357822.jpg"></div><div class="travel__buddy__logo"><img src="'+ imageUrl +'" alt="logo"></div><div class="header-head_line"><h4>'+ locationText +'</h4></div></div><div class="enquiry__form__details"><div class="name_number_form" ><div class="name_input"><div class="enquiry_detailed_form"><label for="enquiry_name">Name</label><input type="text" id="enquiry_name" name="name"></div></div><div class="number_input"><div class="enquiry_detailed_form"><label for="enquiry_number">Phone Number</label><input type="tel" id="enquiry_number" name="name"></div></div></div><div class="mail_input"><div class="enquiry_detailed_form"><label for="enquiry_email">Email</label><input type="email" id="enquiry_email" name="name"></div></div>'+ tripTypeAndFlightBookedHtml + '<div class="destination_input"><div class="enquiry_detailed_form"><label for="enquiry_dest">Destinations you would like to Explore ?</label> ' + destinationHtml + '</div></div><div class="name_number_form" ' + hiddenProperty  +'><div class="name_input"><div class="enquiry_detailed_form"><label for="enquiry_dot">Travel Month</label><input type="text" id="enquiry_dot" name="dot"></div></div><div class="name_input"><div class="enquiry_detailed_form"><label for="enquiry_name">Budget per person</label><input type="number" id="enquiry_budget" name="budget"></div></div></div><div class="name_number_form"><div class="enquiry_detailed_form" style="width: 100%;"><label for="enquiry_name">No Of Pax</label><input type="number" id="enquiry_pax" name="no_of_pax" min="1" max="100" wfd-id="id21"></div></div><div class="submit-btn"><button id="enquiryCancel" type="button">Cancel</button><button id="enquirySubmit" type="button">Submit</button></div><div class="call__us"><h3>Call Us at<span>8076922474</span>, 10am to 7pm - Mon to Sat</h3></div></div><div class="enquiry-form-footer"><span>Trusted by 4 Million + Travelers |</span><h3>Pay in easy EMIs</h3></div></div></div></div></div>';

				return formHTML;
			}
		
			if (window.innerWidth !== undefined) {
				console.log('Width is', window.innerWidth);
				if (isAndroid() || isIOS() || isPwa() || window.innerWidth < 768) {
					jQuery('.report__box-text').remove();
					jQuery('.permissions__box').append(generateFormHTML(true));
					jQuery('.popup__container').css({'height': '700px','display': 'flex','flex-direction': 'column','max-width': 'none','width': '460px','background': 'transparent' });
					jQuery('.report__box-text.enquiry__form__container').css({'width': window.innerWidth + 'px','margin-right': '42px' });
				}
				else {
					jQuery('.report__box-text').remove();
					jQuery('.permissions__box').append(generateFormHTML(false));
					jQuery('.popup__container').css({'height': '700px','background': 'transparent' });
					// jQuery('.travel__buddy__logo img').css('height', '170px');
					jQuery('.enquiry__form__container').css({'background': 'transparent','max-width': 'none','width': 'none','margin-left': '150px'});
					//jQuery('.enquiry_form_left, .enquiry_form_right').css('height', '100%');
				}
				if (window.innerWidth < 400) {
					fontSize = window.innerWidth > 300 ? '10px' : '6px';
					marginRight = window.innerWidth < 350 ? '155px' : '105px';
					reportBoxText = jQuery('.report__box-text.enquiry__form__container');
					enquiryDetailedForm = jQuery('.enquiry_detailed_form');
					enquiryFormContainer = jQuery('.enquiry__form__container');
					jQuery('.header-head_line h4').css('font-size', '16px');
					jQuery('.enquiry-form-footer span').css('font-size', fontSize);
					reportBoxText.css('margin-right', marginRight);
					// jQuery('.travel__buddy__logo img').css('height', '170px');
					if (window.innerWidth <= 360) {
						reportBoxText.css({'right':'none','padding':'0 20px','width':window.innerWidth+'px'});
						enquiryFormContainer.css({'right':'none','padding':'0 20px'});
					}
					if (window.innerWidth < 300) {
						enquiryDetailedForm.find('label, input').css('font-size', '10px');
						enquiryDetailedForm.find('input').css({'padding': '0px', 'height': '30px' });
						jQuery('.submit-btn button').css('height', '35px');
					}
				}
			}
			jQuery('.permissions__box-ctas, .popup__head').css('display', 'none');
			jQuery('.popup__head-close svg path').css('fill', '#fff');
			jQuery('#enquiry_custom_dest').val(searchedLocation.split(',')[0]);
		
			
			// Add event listener for trip type dropdown
			jQuery(document).on('change', '#enquiry_type', function() {
				selectedTripType = jQuery(this).val();
				if (selectedTripType === 'group') {
					filteredLocations = groupTripLocations;
				} else if (selectedTripType === 'family') {
					filteredLocations = familyTripLocations;
				} else {
					filteredLocations = groupTripLocations.concat(familyTripLocations.filter(item => !groupTripLocations.includes(item)));
				}
				optionsHTML = createOptions(filteredLocations);
				jQuery('#enquiry_dest').html(`<optgroup label="Select Destination">${optionsHTML}</optgroup>`);
				jQuery('#enquiry_dest').prop('disabled', false); // Enable the destination dropdown
			});
		
			// Add event listener for destination dropdown
			jQuery(document).on('click', '#enquiry_dest', function(event) {
				selectedTripType = jQuery('#enquiry_type').val();
				if (!jQuery('#enquiry_type').length){
					event.preventDefault(); // Prevent the default action of the select
					return '';
				}
				if (!selectedTripType) {
					toast("Please select trip type.");
					event.preventDefault(); // Prevent the default action of the select
				}
			});
		}

		else if (where == 'premiumForm') {
			imgSrc = data == 'experiences' ? '/view/assets/img/tb_buy_1_get_1_exp.png' : '/view/assets/img/tb-buy-one-get-one.jpg';
			premiumDiv = `<div class="premium__form__container" id="myForm"><a class="premium-cross-btn" href="" id="closeFormPremium"><img src="https://png.pngtree.com/png-vector/20190603/ourmid/pngtree-icon-close-button-png-image_1357822.jpg"></a><div class="premium_form_left"><img src="${imgSrc}" alt="image"></div></div>`;

			jQuery('.report__box-text').html(premiumDiv).css('padding', '0');
			jQuery('.permissions__box-ctas').remove();
			jQuery('.popup__head').hide();
		}


		else if (where == 'adminForm') {
			adminSinginDiv = `<div class="signup-container"><h2>Admin Signup</h2><form><label for="username">Username</label><input type="text" id="username" name="username" placeholder="Username" type="text" required><label for="phone">Phone Number</label><div class="phone-input-group"><select id="dialcode" name="dialcode" required><option value="+91">+91</option><option value="+1">+1</option><option value="+44">+44</option><option value="+81">+81</option><option value="+61">+61</option></select><input type="number" id="phone" name="phone" placeholder="Phone Number" type="number" required></div><label for="email">Email</label><input type="email" id="email" name="email" placeholder="Email" type="email" required><label for="password">Password</label><input type="password" id="password" name="password" placeholder="Password" type="password" required><label for="gender">Gender</label><select id="gender" name="gender" required><option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select><label for="usertype">User Type</label><select id="usertype" name="usertype" required><option value="">Select User Type</option><option value="admin">Admin</option><option value="user">User</option></select><div class="button-group"><button type="button" class="cancel-button">Cancel</button><button type="submit" class="submit-button">Submit</button></div></form></div>`;

			jQuery('.report__box-text').html(adminSinginDiv);
			jQuery('.report__box-text').html(adminSinginDiv).css('padding','0');
			jQuery('.permissions__box-ctas').remove();
			jQuery('.popup__head').hide();
			
		}
	}
}

function renderContactUsForm() {
	jQuery('#secondary .secondary__tab:last-child .drawerHeader .drawerTitle').html('<span class="highlight">Contact Us</span>');
	jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="contactUs__page"><div class="contactUs__content"><div class="contacUs__masthead"><div class="contactUs__masthead-item"><div class="contactUs__masthead-item__title">Business Address</div><div class="contactUs__masthead-item__content">SupremeWork,<br> Second floor, Eros City Square Mall,<br> Sector 49, Gurugram,<br> Haryana 122018</div></div><div class="contactUs__masthead-item"><div class="contactUs__masthead-item__title">Contact Us Via Email</div><div class="contactUs__masthead-item__content"><a href="mailto:info@beatravelbuddy.com" target="_blank">info@beatravelbuddy.com</a></div></div><div class="contactUs__masthead-item"><div class="contactUs__masthead-item__title">Connect with us on Social</div><div class="contactUs__masthead-item__content"><ul><li><a href="https://www.facebook.com/Beatravelbuddy" target="_blank">' + icons.facebook + '</a></li><li><a href="https://www.instagram.com/beatravelbuddy/" target="_blank">' + icons.instagram + '</a></li><li><a href="https://www.linkedin.com/company/beatravelbuddy/" target="_blank">' + icons.linkedIn + '</a></li></ul></div></div></div><div class="contactUs__form"><div class="contactUs__form-head">Contact us via:</div><form id="contactUs__form"><div class="form__row"><div class="form__column"><label for="contactUs__name">Name</label><input type="text" id="contactUs__name" placeholder="Mark Downey" name="contactUs__name"></div></div><div class="form__row"><div class="form__column"><label for="contactUs__email">Email address</label><input type="text" id="contactUs__email" placeholder="mark.downey@gmail.com" name="contactUs__email"></div></div><div class="form__row"><div class="form__column"><label for="contactUs__phone">Phone Number</label><input type="text" placeholder="+91 9899999999" id="contactUs__phone" name="contactUs__phone"></div></div><div class="form__row"><div class="form__column"><label for="contactUs__description">What would you like to tell us?</label><textarea name="contactUs__description" id="contactUs__description" cols="30" rows="5" placeholder="How can we help?"></textarea></div></div><div class="form__row form__err"></div><div class="form__row form__submit"><div class="form__column"><button>Submit</button></div></div></form></div></div></div>');

	setTimeout(function () {
		loaderMain('secondary', false);
	}, 150);
}

function renderFAQs() {
	var userProfile = getLocalStorage('userProfile');
	try {
		JSON.parse(userProfile);
		console.log('userProfile is not encrypted');
		userType = JSON.parse(getLocalStorage('userProfile'));
	} 
	catch (error) {
		console.log('userProfile is encrypted');
		var bytes  = CryptoJS.AES.decrypt(getLocalStorage('userProfile'), 'TravelBuddy');
		var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
		//console.log('Decrypted data:', decryptedData);
		
		try {
			userType = JSON.parse(decryptedData);
		} 
		catch (error) {
			console.error('Error parsing JSON:', error);
		}
	}
	if (isDesktop()) {
		if (userType.userType == 0) {
			window.open('/faq-vt.html', '_blank');
		}
		else {
			window.open('/faq-vtp.html', '_blank');
		}
	}
	else {
		cleanDrawer();
		jQuery('#main__drawer .drawerHeader span').text('FAQs');
		jQuery('#main__drawer .drawerHeader').addClass('blackHeader');

		if (userType.userType == 0) {
			jQuery('#main__drawer .drawerBody').append('<iframe frameborder="0" allowfullscreen src="/faq-vt.html" frameborder="0"></iframe>');
		}
		else {
			jQuery('#main__drawer .drawerBody').append('<iframe frameborder="0" allowfullscreen src="/faq-vtp.html" frameborder="0"></iframe>');
		}

		drawer('open');
	}
}

function renderTerms() {
	if (isDesktop()) {
		window.open('/terms-and-conditions', '_blank');
	}
	else {
		cleanDrawer();
		jQuery('#main__drawer .drawerHeader span').text('Terms & Conditions');
		jQuery('#main__drawer .drawerHeader').addClass('blackHeader');
		jQuery('#main__drawer .drawerBody').append('<iframe frameborder="0" allowfullscreen src="/terms-and-conditions" frameborder="0"></iframe>');
		drawer('open');
	}
}

function renderCancellation() {
	if (isDesktop()) {
		window.open('/cancellation-policy', '_blank');
	}
	else {
		cleanDrawer();
		jQuery('#main__drawer .drawerHeader span').text('Cancellation & Refund Policy');
		jQuery('#main__drawer .drawerHeader').addClass('blackHeader');
		jQuery('#main__drawer .drawerBody').append('<iframe sandbox frameborder="0" allowfullscreen src="/cancellation-policy" frameborder="0"></iframe>');
		drawer('open');
	}
}

function renderExperienceFAQs() {
	if (isDesktop()) {
		window.open('/experience-faq', '_blank');
	}
	else {
		cleanDrawer();
		jQuery('#main__drawer .drawerHeader span').text('FAQs');
		jQuery('#main__drawer .drawerHeader').addClass('blackHeader');
		jQuery('#main__drawer .drawerBody').append('<iframe sandbox frameborder="0" allowfullscreen src="/experience-faq" frameborder="0"></iframe>');
		drawer('open');
	}
}

function renderPrivacy() {
	if (isDesktop()) {
		window.open('/privacy-policy', '_blank');
	}
	else {
		cleanDrawer();
		jQuery('#main__drawer .drawerHeader span').text('Privacy Policy');
		jQuery('#main__drawer .drawerHeader').addClass('blackHeader');
		jQuery('#main__drawer .drawerBody').append('<iframe frameborder="0" allowfullscreen src="/privacy-policy" frameborder="0"></iframe>');
		drawer('open');
	}
}

function deletePost(state, data, element) {
	if (state == 'response') {
		if (data.responseCode != 200) {
			toast(data.errorMessage);
		}
		else {
			toast('Your post has been successfully deleted.');
			jQuery(element).remove();
			manageUserProfile('clean');

			//Close the single post view if the post is deleted from there
			jQuery('#secondary .secondary__tab:last-child .drawerHeader .drawer__back').click();
			refreshFeed();
		}
	}
}

function swiper(state, swiperClass, where) {
	if (state == 'feed') {
		var swiper = new Swiper(swiperClass, {
			direction: 'horizontal',
			pagination: {
				el: '.swiper-pagination',
			},
			autoHeight: true,
			lazy: true,
			on: {
				slideChange: function () {
					checkForVideo(this, swiper);
				},
			},
		});
	}
	else if (state == 'profile') {
		// if (!guestMaster()) {
		var coverPhotos = new Swiper(swiperClass, {
			direction: 'horizontal',
			pagination: {
				el: '.swiper-pagination',
				type: 'fraction',
			},
		});
		// }
	}
	else if (state == 'shots') {
		var shots = new Swiper(swiperClass, {
			direction: 'vertical',
			mousewheel: true,
			on: {
				slideChange: function () {
					//manageShots('swiper', this, shots);
				},
			},
		});
	}
	/*else if (state == 'welcome_screens') {
		var welcome_screens = new Swiper(swiperClass, {
			direction: 'horizontal',
			pagination: {
				el: '.swiper-pagination',
			},
			navigation: {
				nextEl: '.swiper-button-next',
			},
			on: {
				reachEnd: function () {
					manageWelcomeScreens('reachEnd', this);
				},
				slidePrevTransitionEnd: function () {
					manageWelcomeScreens('slideChange', this);
				},
			},
		});
	}*/
	else if (state == 'topRatedExperiences') {
        
        if (where == 'feeds') {
            new Swiper(swiperClass, {
                direction: 'horizontal',
                pagination: 0,
                navigation: 0,
                slidesPerView: 1.6,
                spaceBetween: 20,
                freeMode: true,
                breakpoints: {
                    1024: {
                        slidesPerView: 1.6
                    }
                }
            });
        }
        else {
            new Swiper(swiperClass, {
                direction: 'horizontal',
                pagination: 0,
                navigation: 0,
                slidesPerView: 1.6,
                spaceBetween: 20,
                freeMode: true,
                breakpoints: {
                    1024: {
                        slidesPerView: 3.6
                    }
                }
            });
        }
	}
	else if (state == 'experienceGalleryFull') {
		var experienceGalleryThumb = new Swiper('.experience__gallery-thumbs', {
			spaceBetween: 5,
			slidesPerView: 5,
			freeMode: true,
			watchSlidesProgress: true,
			breakpoints: {
				1024: {
					slidesPerView: 7
				}
			}
		});

		new Swiper(swiperClass, {
			spaceBetween: 0,
			thumbs: {
				swiper: experienceGalleryThumb,
			},
			pagination: {
				el: '.swiper-pagination',
				type: 'fraction'
			}
		});
	}
	else if (state == 'spDashboard__listings-box') {
		new Swiper(swiperClass, {
			direction: 'horizontal',
			pagination: 0,
			navigation: 0,
			slidesPerView: 1.66,
			spaceBetween: 20,
			breakpoints: {
				768: {
					slidesPerView: 3.25
				}
			}
		});
	}
	else if (state == 'spDashboard__visiting-box') {
		new Swiper(swiperClass, {
			direction: 'horizontal',
			pagination: 0,
			navigation: 0,
			slidesPerView: 1.33,
			spaceBetween: 20,
			breakpoints: {
				768: {
					slidesPerView: 3.25
				}
			}
		});
	}
	else if (state == 'spDashboard__nearby-box') {
		new Swiper(swiperClass, {
			direction: 'horizontal',
			pagination: 0,
			navigation: 0,
			slidesPerView: 4.25,
			spaceBetween: 15,
			breakpoints: {
				768: {
					slidesPerView: 10
				}
			}
		});
	}
	else if (state == 'experienceGalleryFull') {
		var experienceGalleryThumb = new Swiper('.experience__gallery-thumbs', {
			spaceBetween: 5,
			slidesPerView: 5,
			freeMode: true,
			watchSlidesProgress: true,
		});

		new Swiper(swiperClass, {
			spaceBetween: 0,
			thumbs: {
				swiper: experienceGalleryThumb,
			},
			pagination: {
				el: '.swiper-pagination',
				type: 'fraction',
			},
		});
	}
	else if (state == 'experienceCategories') {
		new Swiper(swiperClass, {
			direction: 'horizontal',
			pagination: 0,
			navigation: 0,
			slidesPerView: 4.33,
			spaceBetween: 8,
			freeMode: true,
			breakpoints: {
				1024: {
					slidesPerView: 7.25
				}
			}
		});
	}
	else if (state == 'topCards') {
		new Swiper(swiperClass, {
			direction: 'horizontal',
			pagination: {
				el: ".swiper-pagination",
				dynamicBullets: true,
			},
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			navigation: 0,
			slidesPerView: 1,
			spaceBetween: 0,
			loop: true
		});
	}
	else if (state == 'premium_cards_container') {
		new Swiper(swiperClass, {
			direction: 'horizontal',
			pagination: {
				el: ".swiper-pagination",
				dynamicBullets: true,
			},
			autoplay: {
				delay: 4000,
				disableOnInteraction: false,
			},
			navigation: 0,
			slidesPerView: 1,
			spaceBetween: 0,
			loop: true
		});
	}
	else if (state == 'influencer_container') {
		new Swiper(swiperClass, {
			slidesPerView: 2,
			navigation: 0,
			spaceBetween: 10,
			loop: false,
			freeMode: true
		});
	}
	else if (state == 'shots_container' || state == 'trend_location_swiper' || state == 'recommend_followers') {
		new Swiper(swiperClass, {
			slidesPerView: 1.5,
			navigation: 0,
			spaceBetween: 10,
			loop: false,
			freeMode: true
		});
	}
	else if (state == 'searchBuddies') {
		new Swiper(swiperClass, {
			slidesPerView: 7.2,
			navigation: 0,
			spaceBetween: 15,
			loop: false,
			freeMode: true
		});
	}
	else if (state == 'searchLocations') {
		new Swiper(swiperClass, {
			slidesPerView: 3.8,
			navigation: 0,
			spaceBetween: 15,
			loop: false,
			freeMode: true
		});
	}
}

function checkForVideo(element, swiper) {
	var video = jQuery(element.slides[swiper.activeIndex]).find('.feed__body-video-overlay');

	if (video.length > 0) {
		video.click();
	} else {
		videoManager('pauseAll');
	}
}

//All the settings for the video player
function videoManager(state) {
	if (state == 'init') {
		//Video Item Overlay Click Play/Pause
		jQuery(document).on('click', '.feed__body-video-overlay, .feed__body-video-overlay-play', function () {
			var video = jQuery(this).parent().find('video')[0];
			if (video.paused) {
				video.play();

				//Pause all other videos
				jQuery('video').each(function () {
					if (this != video) {
						this.pause();

						//Change the icon
						jQuery('.feed__body-video-overlay-play').find('i').removeClass('fa-pause');
						jQuery('.feed__body-video-overlay-play').find('i').addClass('fa-play');
					}
				});

				//Change the icon
				jQuery(this).parent().find('.feed__body-video-overlay-play').find('i').removeClass('fa-play');
				jQuery(this).parent().find('.feed__body-video-overlay-play').find('i').addClass('fa-pause');
			} else {
				video.pause();

				//Change the icon
				jQuery('.feed__body-video-overlay-play').find('i').removeClass('fa-pause');
				jQuery('.feed__body-video-overlay-play').find('i').addClass('fa-play');
			}
		});

		//Video Item Overlay Click Mute/Unmute
		jQuery(document).on('click', '.feed__body-video-overlay-mute', function () {
			var video = jQuery(this).parent().parent().find('video')[0];
			if (video.muted) {
				// video.muted = false;

				//Make all other videos unmuted
				jQuery('video').each(function () {
					this.muted = false;
				});

				//Save the state of the video in the local storage
				localStorage.setItem('videoMuted', false);

				//Change the icon for each video
				jQuery('.feed__body-video-overlay-mute').find('i').removeClass('fa-volume-mute');
				jQuery('.feed__body-video-overlay-mute').find('i').addClass('fa-volume-up');
			} else {
				// video.muted = true;

				//Make all other videos unmuted
				jQuery('video').each(function () {
					this.muted = true;
				});

				//Save the state of the video in the local storage
				localStorage.setItem('videoMuted', true);

				//Change the icon for each video
				jQuery('.feed__body-video-overlay-mute').find('i').removeClass('fa-volume-up');
				jQuery('.feed__body-video-overlay-mute').find('i').addClass('fa-volume-mute');
			}
		});
	}
	else if (state == 'pauseAll') {
		//Pause all other videos
		jQuery('video').each(function () {
			video = this;
			this.pause();

			//Change the icon
			jQuery('.feed__body-video-overlay-play').find('i').removeClass('fa-pause');
			jQuery('.feed__body-video-overlay-play').find('i').addClass('fa-play');
		});
	}
}

function managePopups(state, from, data) {
	if (state == 'init') {
		jQuery('#app').append('<div class="popup__master"><div class="popup__container"><div class="popup__head"><div class="popup__head-title"></div><div class="popup__head-close">' + icons.close_non_filled + '</div></div><div class="popup__body"></div></div><div class="popup__mask"></div></div>');
	}
	else if (state == 'show') {
        jQuery('.popup__container').css({'display':'flex', 'flex-direction':'column'});
		if (from == 'profileCompleteness') {
			jQuery('.popup__master').addClass('popup__master--profileCompleteness');
			jQuery('.popup__head-title').text('Profile Completeness');
			jQuery('.popup__body').html("<div class='completeness__popup'><p>Hello Travel Buddy, completing your profile to a 100% is a proof point of you being an avid traveller and a wonderful human being.</p><p><b>Here's how we score you on your profile completeness:</b></p><ul><li><b>15%:</b> For creating a profile on Travel Buddy</li><li><b>5%:</b> For your valid phone number</li><li><b>20%:</b> Put a Profile Picture</li><li><b>10%:</b> Put a cover pic - you can put up to 10 photos.</li><li><b>10%:</b> For Adding Activities</li><li><b>10%:</b> Share a travel post on feed.</li><li><b>10%:</b> Commenting on the feed (on someone else's post)</li><li><b>20%:</b> Followed by more than 10 people and has a rating of at least 4 Stars.</li></ul><div class='completeness__popup-ctas'><div class='completeness__popup-cancel'>Cancel</div><div class='completeness__popup-complete'>Complete Now</div></div></div>"
			);
		}
		else if (from == 'profileViews') {
			jQuery('.popup__master').addClass('popup__master--profileViews');
			jQuery('.popup__head-title').text('Profile Views');
		}
		else if (from == 'deleteCover') {
			jQuery('.popup__master').addClass('popup__master--deleteCover');
			jQuery('.popup__head-title').text('Delete Cover Photo?');
			jQuery('.popup__body').html("<div class='completeness__popup'>Do you really want to permanently delete this cover photo ?<div class='completeness__popup-ctas'><div class='completeness__popup-cancel'>Cancel</div><div class='completeness__popup-complete' id='deleteCover'>Delete</div></div></div>");
		}
		else if (from == 'reportUser') {
			jQuery('.popup__head-title').text('Select a reason to report');
			jQuery('.popup__body').html('<div class="report__options"><ul id="myList"><li class="report__option-one">I dont like this user</li><li class="report__option-two">Over messaging</li><liclass="report__option-three">Nudity/Pornography</li><liclass="report__option-four">Violence or Harm</li><liclass="report__option-five">Inappropriate behaviour</li><liclass="report__option-six">Inappropriate content</li><liclass="report__option-seven">Fake profile</li></ul></div>');
		}
		else if (from == 'newGroupChatDisabled') {
			jQuery('.popup__head-title').text('New Group Chat Disabled');
			jQuery('.popup__body').html('<div class="report__options"><p>You have been blocked from creating new group chats. Please contact us at <a href="mailto:support@beatravelbuddy.com">');
		}
        else if (from == 'findBuddy') {
            jQuery('.popup__master').addClass('popup__master--findBuddySimilar');
			jQuery('.popup__head-title').text('Similar Trips');
        }
        else if (from == 'flightTravellerClass') {
            jQuery('.popup__master').addClass('popup__master--flightTravellerClass');
			jQuery('.popup__head-title').text('Select Traveller & Cabin Class');
            
            jQuery('.popup__body').html(`
                <div class="flight__traveller__class__container">
                    <div class="flight__traveller__class__body">
                        <div class="flight__traveller__class__body__traveller">
                            <div class="flight__traveller__class__body__traveller__title">Add Number of Travellers</div>
                            <div class="flight__traveller__class__body__traveller__options">
                                <div class="flight__traveller__class__body__traveller__option">
                                    Adult <span class="description">(12 years & above)</span>
                                    <div class="counter">
                                        <button class="decrement adultType">-</button>
                                        <span class="count">1</span>
                                        <button class="increment adultType">+</button>
                                    </div>
                                </div>
                                <div class="flight__traveller__class__body__traveller__option">
                                    Children <span class="description">(2 - 12Yrs)</span>
                                    <div class="counter">
                                        <button class="decrement child">-</button>
                                        <span class="count">0</span>
                                        <button class="increment child">+</button>
                                    </div>
                                </div>
                                <div class="flight__traveller__class__body__traveller__option">
                                    Infant <span class="description">(Under 2 yrs)</span>
                                    <div class="counter">
                                        <button class="decrement infant">-</button>
                                        <span class="count">0</span>
                                        <button class="increment infant">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flight__traveller__class__body__class">
                            <div class="flight__traveller__class__body__class__title">Choose Cabin Class</div>
                            <div class="flight_options_box">
                                <div class="flight_option selected" id="economy">
                                    <label for="economy_class">
                                        <input type="radio" name="cabin_class" id="economy_class" onclick="changeCabinClass(this)" value="2" checked class="sr-only">Economy
                                    </label>
                                </div>
                                <div class="flight_option" id="premium_economy">
                                    <label for="premium_economy_class">
                                        <input type="radio" name="cabin_class" id="premium_economy_class" onclick="changeCabinClass(this)" value="3" class="sr-only">Premium Economy
                                    </label>
                                </div>
                                <div class="flight_option" id="business">
                                    <label for="business_class">
                                        <input type="radio" name="cabin_class" id="business_class" onclick="changeCabinClass(this)" value="4" class="sr-only">Business
                                    </label>
                                </div>
                                <div class="flight_option" id="premium_business">
                                    <label for="premium_business_class">
                                        <input type="radio" name="cabin_class" id="premium_business_class" onclick="changeCabinClass(this)" value="5" class="sr-only">Premium Business
                                    </label>
                                </div>
                                <div class="flight_option" id="first">
                                    <label for="first_class">
                                        <input type="radio" name="cabin_class" id="first_class" onclick="changeCabinClass(this)" value="6" class="sr-only">First Class
                                    </label>
                                </div>
                                <div class="flight_option" id="def_class">
                                    <label for="all_class">
                                        <input type="radio" name="cabin_class" id="all_class" onclick="changeCabinClass(this)" value="1" class="sr-only">All Class
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            
            jQuery('.adultType').parent().find('.count').text(jQuery('#travelDetails-adults').val());
            jQuery('.child').parent().find('.count').text(jQuery('#travelDetails-children').val());
            jQuery('.infant').parent().find('.count').text(jQuery('#travelDetails-infants').val());
            
            // Adding Submit & Cancel button
            jQuery('.popup__container').append('<div class="report__box-ctas"><div class="report__box-cancel">Cancel</div><div class="flight__box-apply" id="flight__pax_class">Apply</div></div>');
            
            // Adding Submit & Cancel button
            jQuery('.popup__container').append('<div class="report__box-ctas"><div class="report__box-cancel">Cancel</div><div class="flight__box-apply" id="flight__pax_class">Apply</div></div>');
            
            // SR-Only commonly used in web development to hide elements visually from the page but still make them accessible to screen readers
        }
		else if (from == 'flightsErrorMessage') {
            jQuery('.popup__master').addClass('popup__master--deleteCover');
            jQuery('.popup__head-title').text('Error while booking the flight');
			jQuery('.popup__body').html("<div class='completeness__popup'>" + data + "<div class='completeness__popup-ctas'></div><div class='support__message-flights'>If you face any issues, feel free to contact us on WhatsApp at <a href='https://wa.me/8076922474'>+91-8076922474</a> or send us an email at <a href='mailto:support@beatravelbuddy.com'>support@beatravelbuddy.com</a></div></div>");
			jQuery('.popup__container').css({'min-height':'350px'});
		}
		else if (from == 'flightsCalendarFare') {
			jQuery('.popup__head').remove();
			jQuery('.popup__master').addClass('popup__master--flightsCalendarFare');
			jQuery('.popup__body').html(`
				<div id="custom_calendar_price__container"></div>
			`);
		}
		jQuery('.popup__master').addClass('active').hide().slideDown(300);

		window.history.pushState({ html: '', pageTitle: '' }, '', '#popup');
	}
	else if (state == 'hide') {
		jQuery('.delItem').removeClass('delItem');
        if (jQuery('.popup__master').css('display') !== 'none') {
		    jQuery('.popup__master').show().slideUp(300);
        }
		setTimeout(() => {
			jQuery('.popup__body').html('');
			jQuery('.popup__head-title').text('');
            jQuery('.popup__master').removeClass('report__box__profile popup__master--profileCompleteness popup__master--profileViews popup__master--addFindBuddyInstructions popup__master--addFindMeetupInstructions popup__master--experience__booking popup__master--deleteCover permissions active popup__master-mediaPopup popup__master--findBuddySimilar ');
		}, 500); 
	}
}


function manageSecondary(state, from, locationName) {
	timeout = 300;

	function whereToAddSecondary() {
		if (jQuery('#main--asd').hasClass('active')) {
			response = '#main--asd #secondary .secondary__tab:last-child'
		}
		else {
			response = "#secondary .secondary__tab:last-child"
		}

		return response;
	}

	if (state == 'show') {
		addClass = '';
		if (jQuery('#secondary .secondary__tab:last-child').hasClass('onboardingBody') || jQuery('#secondary .secondary__tab:last-child').hasClass('onboardingBody2')) {
			addClass = 'onboardingBody2';
		}

		jQuery('#secondary').append('<div class="secondary__tab ' + addClass + '"></div>');
		jQuery(whereToAddSecondary()).append('<div class="drawerHeader"><a class="drawer__back">' + icons.back + '</a><div class="drawerTitle">Top posts from <span class="highlight">India</span></span></div>');
		jQuery('#secondary .secondary__tab:last-child').append('<div class="drawerBody"></div>');
	}

	if (from == 'location' || from == 'hashtag' || from == 'bucketList' || from == 'find_posts') {
		if (state == 'show') {
			jQuery(titleClass()).html('Top Posts from <span class="highlight">' + locationName.location + '</span>');
			if (from == 'bucketList' || from == 'find_posts') {
				jQuery(titleClass()).html('<span class="highlight">' + locationName.location + '</span>');
			}

			feedLogin = renderFeedLogin();

			jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="feed__box similar__plans" data-page="0" data-location="' + locationName.location + '" data-lat="'+ locationName.postLat +'" data-lng="'+ locationName.postLong +'"></div>' + feedLogin);
			jQuery('#secondary .secondary__tab:last-child .drawerBody .feed__box').show();
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			openSecondary();
		}
		else if (state == 'hide') {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
				jQuery('#secondary .secondary__tab:last-child').remove();
				setTimeout(() => {
					jQuery('.ui-effects-wrapper').remove();
				}, timeout);
			}, timeout);
		}
	}

	//Added for experience
	if (from == 'findExperience') {
		if (state == 'show') {
			jQuery(titleClass()).html('Filtered Experiences <span class="highlight">');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('filetered-experience-body');
			openSecondary();
		}
	}
	else if (from == 'trendingGroupTrips') {
        if (state == 'show') {
            jQuery(titleClass()).html('Trending Group Trips <span class="highlight">');
			jQuery('#secondary .secondary__tab .drawerHeader .drawer__back').addClass('trendingGroupTrips');
            jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
            jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('groupTrips-experience-body');
            openSecondary();
        }
    }


	else if (from == 'Single Post') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">POST</span>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="feed__box" data-page="0"></div>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody .feed__box').show();
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			openSecondary();
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
				jQuery('#secondary .secondary__tab:last-child').remove();
				setTimeout(() => {
					jQuery('.ui-effects-wrapper').remove();
				}, timeout);
			}, timeout);
		}
	}
	else if (from == 'Profile' || from == 'Ratings') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight"></span>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="feed__box" data-page="0"></div>');
			if (from == 'Ratings') {
				jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="ratings__page"></div>');
			}
			else if (from == 'Profile') {
				jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="profile__page"></div>');
				jQuery('#secondary .secondary__tab:last-child').addClass('profile__tab');
			}
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			openSecondary();
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
				jQuery('#secondary .secondary__tab:last-child').remove();
				setTimeout(() => {
					jQuery('.ui-effects-wrapper').remove();
				}, timeout);
			}, timeout);
		}
	}
	else if (from == 'notification') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">NOTIFICATIONS</span>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="feed__box" data-page="0"></div>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div id="notifications"><div class="notifs__week"><h3>This Week</h3><div class="notifs__recent-box"></div></div><div class="notifs__month"><h3>This Month</h3><div class="notifs__older-box"></div></div><div class="notifs__older"><h3>Earlier</h3><div class="notifs__older-box"></div></div></div>');
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			openSecondary();
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
				jQuery('#secondary .secondary__tab:last-child').remove();
				setTimeout(() => {
					jQuery('.ui-effects-wrapper').remove();
				}, timeout);
			}, timeout);
		}
	}
	else if (from == 'onboarding') {
		if (state == 'show') {
			jQuery('#secondary .secondary__tab:last-child .drawerHeader').remove();
			jQuery('#secondary .secondary__tab:last-child').addClass('onboardingBody');
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').show('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
			}, timeout);
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
				jQuery('#secondary .secondary__tab:last-child').remove();
				setTimeout(() => {
					jQuery('.ui-effects-wrapper').remove();
				}, timeout);
			}, timeout);
		}
	}
	else if (from == 'otp') {
		if (state == 'show') {
			// jQuery('#secondary .secondary__tab:last-child .drawerHeader');
			jQuery(titleClass()).html('');
			jQuery('#secondary .secondary__tab:last-child').addClass('otpBody');
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').show('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
			}, timeout);
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
				jQuery('#secondary .secondary__tab:last-child').remove();
				setTimeout(() => {
					jQuery('.ui-effects-wrapper').remove();
				}, timeout);
			}, timeout);
		}
	}
	else if (from == 'feedback') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Feedback</span>');
			openSecondary();
		}
	}
	else if (from == 'blocked-users' || from == 'contact-us') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Blocked Users</span>');
			openSecondary();
		}
	}
	else if (from == 'influencers') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Influencers</span>');
			openSecondary();
		}
	}
	else if (from == 'singleExperience' || from == 'bookingSummary' || from == 'getAllExperiences' || from == 'experienceThankYou' || from == 'orderDetails' || from == 'singleService') {
		if (state == 'show') {
			jQuery(titleClass()).html('');
			jQuery('#secondary .secondary__tab:last-child').addClass('onboardingBody');
			openSecondary();
		}
	}
	else if (from == 'profileInterests') {
		jQuery(titleClass()).html('<span class="highlight">' + manageUserProfile('read', 'name') + '</span>');
		openSecondary();
	}
	else if (from == 'settings') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Settings</span>');
			openSecondary();
		}
	}
	else if (from == 'change_password') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Change Password</span>');
			openSecondary();
		}
	}
	else if (from == 'deactivate_account') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Deactivate Account</span>');
			openSecondary();
		}
	}
	else if (from == 'experienceOrders') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">My Orders</span>');
			jQuery('#secondary .secondary__tab:last-child').addClass('onboardingBody').addClass('ordersBody');
			openSecondary();
		}
	}
	else if (from == 'trending_interests') {
		jQuery(titleClass()).html('<span class="highlight">' + locationName + '</span>');
		openSecondary();
	}
	else if (from == 'addListing') {
		jQuery('#secondary .secondary__tab:last-child .drawerHeader').remove();
		jQuery('#secondary .secondary__tab:last-child').addClass('addListingBody');
		openSecondary();
	}
	else if (from == 'lfb' || from == 'contacted-leads') {
		if (from == 'lfb') {
			jQuery(titleClass()).html('<span class="highlight">Looking for Buddy</span>');
		}
		else {
			jQuery(titleClass()).html('<span class="highlight">Contacted Leads</span>');
		}
		openSecondary();
	}
	else if (from == 'recommendedFollowers') {
		jQuery(titleClass()).html('<span class="highlight">People you may like to follow</span>');
		openSecondary();
	}
	else if (from == 'filter') {
		jQuery(titleClass()).html('<span class="highlight">Filter</span>');
		openSecondary();
	}
	else if (from == 'filterFeed') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Filtered Feed</span>');
			feedLogin = renderFeedLogin();

			jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="feed__box" data-page="0" data-location="' + locationName + '"></div>' + feedLogin);
			jQuery('#secondary .secondary__tab:last-child .drawerBody .feed__box').show();
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			openSecondary();
		}
		else if (state == 'hide') {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
				jQuery('#secondary .secondary__tab:last-child').remove();
				setTimeout(() => {
					jQuery('.ui-effects-wrapper').remove();
				}, timeout);
			}, timeout);
		}
	}
	else if (from == 'editProfile') {
		if (state == 'show') {
			console.log('Edit Profile');

			jQuery('#secondary .secondary__tab:last-child .drawerHeader').remove();
			jQuery('#secondary .secondary__tab:last-child').addClass('editProfileBody');
			openSecondary();
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide(
				'slide',
				{ direction: 'right' },
				timeout
			);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
				jQuery('#secondary .secondary__tab:last-child').remove();
				setTimeout(() => {
					jQuery('.ui-effects-wrapper').remove();
				}, timeout);
			}, timeout);
		}
	}
	else if (from == 'nearBy') {
		jQuery(titleClass()).html('<div id="map" style = "height: 500px;width: 350px;"></div>');
		var mapOptions = {
			center: { lat: 12.9716, lng: 77.5946 }, // Set your desired coordinates
			zoom: 12 // Adjust the zoom level as needed
		};
		var map = new google.maps.Map(document.getElementById('map'), mapOptions);
		openSecondary();
	}
	else if (from == 'message-dashboard') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Message Dashboard</span>');
			openSecondary();
		}
	}
	else if (from == 'message-dashboardAnalytics') {
		if (state == 'show') {

			jQuery(titleClass()).html('<span class="highlight">Message Dashboard Analytics</span>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="analytics__page"><div class="analytics__title"><table id="myTable"><thead><tr class="table__title"><th>Id</th><th>Cohorts</th><th>Timestamp</th><th>Users</th><th>Sent</th><th>Seen</th><th>Status</th><th>Message</th></tr></thead><tbody id="tableBody"></tbody></table></div></div>');

			openSecondary();
			
		}
	}
	else if (from == 'onboardingVideo') {
		if (state == 'show') {
			
			playPauseButton = 'fa-volume-up';
			jQuery('#secondary .secondary__tab:last-child .drawerBody').html('<div class="onboarding__video"><video class="video__onboarding" autobuffer width="100%" height="auto"  class="feed__body-video" playsinline loop poster="/view/assets/img/onboarding__bg.jpg" ><source src="/view/assets/img/Travel_Buddy_Blurb_Video.mp4" type="video/mp4"></video><div class="feed__body-video-overlay"></div><div class="feed__body-video-overlay-play"><i class="fas fa-play"></i></div><div class="feed__body-video-overlay-mute"><i class="fas ' + playPauseButton + '" style="color: white;"></i></div></div><button class="onboardingVideo">Proceed</button>'); 
			
			
			jQuery('#secondary .secondary__tab:last-child .drawerHeader').remove();
			jQuery('#secondary .secondary__tab .drawerBody').css('top', '0px');
			jQuery('#secondary .secondary__tab .drawerBody').css('height', 'auto');
			jQuery('.onboarding__video').css('position', 'relative');
			jQuery('.onboarding__video').css('height', window.innerHeight - 70);
			jQuery('.video__onboarding').css('height', window.innerHeight);	
			jQuery('.video__onboarding').css('object-fit', 'cover');	
			
			openSecondary();
			jQuery('.feed__loading').remove();
			window.history.pushState({ html: '', pageTitle: '' }, '', window.location.origin);
			
		}
	}
    
    else if (from == 'itinerary' || from == 'userItinerary') {
		if (state == 'show') {
            
            jQuery('#secondary .secondary__tab').addClass('ai_itinerary');
			jQuery('.secondary__tab .drawerHeader').remove();
            
            jQuery('.secondary__tab .drawerBody').css ({
                'height': '100%',
                'top': '0px',
				'padding': '0px',
				'display':'unset'
            });
            
            if (from == 'userItinerary') {
				response = locationName.response;
				itiUserId = response.itinerary.user_id;
                itiUserName = response.itinerary.userInfo.userName;
                itiUserDp = renderUserProfileImage(response.itinerary.userInfo.userDisplayPicture);
                headerLocation = response.itinerary.destination;
                travelerType = response.itinerary.pax_type.charAt(0).toUpperCase() + response.itinerary.pax_type.slice(1);
                budgetType = response.itinerary.budget_type.charAt(0).toUpperCase() + response.itinerary.budget_type.slice(1);

                travelMonth = getMonthName(response.itinerary.month);
            }
            else {
				itiUserId = manageUserProfile('read','userId');
                itiUserName = manageUserProfile('read','name');
                itiUserDp = renderUserProfileImage(manageUserProfile('read','profilePic'));
                headerLocation = locationName.location;
                travelerType = jQuery('#traveller__type').val();
                travelMonth = jQuery('#travel__month').val();
                budgetType = jQuery('#budget__type').val().split(' ')[0];
                
            }
            
            title = '<div class="ai__location-header" data-location= "' + headerLocation + '" style="font-size:20px;width:100%;text-align:start;color:white;display:flex;align-content:center;align-items:center;gap:7px;font-weight:600;justify-content:center;"><h1 style="color:yellow;width:fit-content;font-size:25px;font-style:normal;">AI Travel Plan -</h1>'+ headerLocation + '</div><ul class="ai__selections-title" style="list-style-type: none; display: flex; flex-direction: row; align-items: center; align-content: space-around; flex-wrap: wrap; margin-top: 4px;">'
            + '<li class="ai__selected__traveller" style="background-image: url(/view/assets/img/traveller_type_light.svg);">' + travelerType.charAt(0).toUpperCase() + travelerType.slice(1) + '</li>'
            + '<li class="ai__selected__month" style="background-image: url(/view/assets/img/month_light.svg);">' + travelMonth.charAt(0).toUpperCase() + travelMonth.slice(1) + '</li>'
            + '<li class="ai__selected__budget" style="background-image: url(/view/assets/img/budget_light.svg);">' + budgetType.charAt(0).toUpperCase() + budgetType.slice(1) + '</li>'
            + '</ul>';
			
            backIcon = '<div class="experience__back experience__gallery-button ' + from + '" id="ai__results-back">' + icons.back + '</div>';
            
			userOs = detectOperatingSystem();
            shareAiTrip = '';
            if (userOs != '1' && userOs != '0') {
                shareAiTrip = '<div class="itinerary__send experience__gallery-button" id="aIShare">' + icons.share + '</div>';
            }

			jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="experience__gallery-buttons"><div class="experience__gallery-left">' + backIcon + '</div><div class="saved-trips-overlay"><img class="header__myTrips" src="/view/assets/img/roadTrip_light.svg">My Trips</div><div class="experience__gallery-right"><div class="itinerary__send experience__gallery-button" id="aIFind">' + icons.find__buddy_icon + '</div>' + shareAiTrip + '</div></div><div class="itinerary-result"><div class="header__imageAI"><img src="" onerror="this.onerror=null; this.src=\'/view/assets/img/mini_experiences-bg.png\';"><div class="ai__header__title">' + title + '</div></div><div class="profile_icon_ai_page" data-itiuserid='+ itiUserId +'><div class="curated-by">Planned by</div><div class = "itiUserContainer"><img src="' + itiUserDp + '"onerror="this.onerror=null; this.src=\'/view/assets/img/mini_experiences-bg.png\';"><span><h4>' + itiUserName + '</h4></span></div></div></div>');

			if (from == 'userItinerary') {
                history.pushState({}, '', ('/ai-travel-plan/' + response.itinerary.destination.replace(/\s+/g, '-') + '-' + response.itinerary.pax_type + '-' + response.itinerary.budget_type + '-' + monthName + '/' + response.itinerary.encryptedId).replace(/[\s,]+/g, '-'));
                renderAiItinerary(JSON.parse(response.itinerary.itinerary),'getUserItinerary' );
            }
			openSecondary();
		}
	}
    
    else if (from == 'ai_itinerary') {
        if (state == 'show') {
            jQuery('.secondary__tab .drawerHeader').remove();
            
            // Change the Url to /ai-plan-trip
            window.history.pushState({ html: '', pageTitle: '' }, '', '/ai-plan-trip');
            locationName = locationName == undefined ? '' : locationName;
            
            jQuery('.secondary__tab .drawerBody').css ({
                'height': '100%',
                'top': '0px',
            });
            
			jQuery(titleClass()).html('<span class="highlight">Plan a Trip for ' + locationName.split(',')[0] + '</span>');
            
            jQuery('#secondary .secondary__tab').addClass('ai_itinerary');
            
            countDown =  '<div id="countdown">00:00:00</div>' ;
            
            // This function generates the HTML for a single checkbox.
            function generateCheckboxHTML(type, value, imgSrc, label) {
                return `
                    <div class="${type}" data-type="location" data-value="${value}">
                        <input type="checkbox" class="invisible-checkbox-Ai" value="${value}">
                        <img src="/view/assets/img/${imgSrc}">
                        ${label}
                    </div>
                `;
            }

            // This function generates the HTML for all checkboxes.
            function generateAllCheckboxesHTML() {
                
                return checkboxesData.map(data => generateCheckboxHTML(data.type, data.value, data.imgSrc, data.label)).join('');
            }

            // Use the function to generate the HTML.
            checkboxesHTML = generateAllCheckboxesHTML();
			
			liveLocationInfo = JSON.parse(localStorage.getItem('liveLocationInfo'));
			currencyCode = liveLocationInfo ? liveLocationInfo.currency_code ? liveLocationInfo.currency_code : 'INR' : 'INR';	
			
			if (currencyCode == 'INR') {
				currencyCode = '₹';
			}
			
			jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="experience__gallery-buttons"><div class="experience__gallery-left"><div class="experience__back experience__gallery-button" id="ai__back">' + icons.back + '</div></div></div><div id="ai_itinerary"><div class="search-location"><div class="ai__search_container"><div class="ai__title locationTitle">Plan your Trip with AI</div><div class="ai-location-search" data-lat ="" data-lng = "" data-city ="" data-state ="" data-country =""><input type="text" id="ai__search" placeholder="Search for Cities, States, Countries"></div></div><div class="ai__trending"><div class="ai__title">Select Travel Type</div><div class="search__sug-body aiTravelType"> ' + checkboxesHTML + '</div></div><div class="search-location travelMonth"><div class="ai__title">Month of Travel</div><div class="duration__container"><select name="duration" id="travel__month"><option value="">Select Month</option><option value="January">January</option><option value="February">February</option><option value="March">March</option><option value="April">April</option><option value="May">May</option><option value="June">June</option><option value="July">July</option><option value="August">August</option><option value="September">September</option><option value="October">October</option><option value="November">November</option><option value="December">December</option></select></div></div><div class="search-location travelMonth"><div class="ai__title">Travellers Type</div><div class="duration__container"><select name="duration" id="traveller__type"><option value="">Add Travellers</option><option value="solo">Solo</option><option value="couple">Couple</option><option value="friends">Friends</option><option value="family">Family</option><option value="group">Group</option></select></div></div><div class="search-location travelMonth"><div class="ai__title">Budget Type</div><div class="duration__container"><select name="duration" id="budget__type"><option value="">Add Budget</option><option value="Budget-Friendly">Budget Friendly</option><option value="Medium-Budget">Medium Budget</option><option value="High-Budget">High Budget</option><option value="AI Decision">Let AI Decide</option></select></div></div><div class="ai__premium"><h1> Break the clock ! </h1><div id="lottiePremiumAi"></div><div class="ai__price-left" data-package="tb_ai_mini" data-price="24"><div class="ai__premium-title">AI Mini</div><div class="ai__premium-duration"><img class="ai_premium-icon" src="/view/assets/img/duration__ai.svg">12 Hours</div><div class="ai__premium-perks"><img class="ai_premium-icon" src="/view/assets/img/number__ai.svg">2 Itineraries</div><div class="ai__premium-price"><img class="ai_premium-icon" src="/view/assets/img/cost__ai.svg">' + currencyCode + ' 9/-</div></div><div class="ai__price-right" data-package="tb_ai_super" data-price="69"><div class="ai__premium-title">AI Super</div><div class="ai__premium-duration"><img class="ai_premium-icon" src="/view/assets/img/duration__ai.svg">24 Hours</div><div class="ai__premium-perks"><img class="ai_premium-icon" src="/view/assets/img/number__ai.svg">10 Itineraries</div><div class="ai__premium-price"><img class="ai_premium-icon" src="/view/assets/img/cost__ai.svg">' + currencyCode + ' 39/-</div></div></div><div class="get-itinerary"><button class="generateIti">Plan my Trip</button>' + countDown + '</div><div class="ai__premium_box"><div class="ai__premium-planName"></div><div class="ai__premium-timeLeft"></div><div class="ai__premium-itineraryLeft"></div></div></div>');
			

			checkedCount = 0;
			// Assuming checkboxesData is the array containing your checkbox data
            checkboxesData.forEach(data => {
                jQuery(`.${data.type}`).click(function() {
                    currentDiv = jQuery(this);
                    // Find the checkbox within the clicked element
                    checkbox = $(this).find('input[type="checkbox"].invisible-checkbox-Ai');
                    checkedCount = $('input[type="checkbox"].invisible-checkbox-Ai:checked').length;

                    checkbox.prop('checked', function(i, value) {
                        if (checkedCount < 4 || value) {
                            currentDiv.toggleClass('active');
                            // Get the image sibling of the checkbox
                            img = $(this).siblings('img');
                            // Get the source attribute of the image
                            src = img.attr('src');
                            // If the checkbox is currently not checked (value is false)
                            if (!value) {
                                // Replace '_light' in the image source with nothing, effectively removing it
                                img.attr('src', src.replace('_light', ''));
                            } else {
                                // If the checkbox is currently checked (value is true)
                                // Replace '.svg' in the image source with '_light.svg'
                                img.attr('src', src.replace('.svg', '_light.svg'));
                            }
                            // Return the opposite of the current checkbox value, effectively toggling the checkbox
                            return !value;
                        }
                        else {
                            toast('You can select a max of 4 travel types.');
                            return value;
                        }
                    });
                });
            });
            
			
			if (locationName != '' && locationName != 'Post') {
				jQuery('#ai__search').val(locationName)
			}
			
			initializeAutocomplete(); // For AI search case
			
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			
			openSecondary();
            jQuery('.secondary__tab.ai_itinerary').find('.drawerBody').css({'width': '100%'});
            
            // Show / Start / Hide / Stop Timer & Cool-Down
            jsInit('getUsersAiPackage', {});
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
			setTimeout(() => {
				jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
				jQuery('#secondary .secondary__tab:last-child').remove();
				setTimeout(() => {
					jQuery('.ui-effects-wrapper').remove();
				}, timeout);
			}, timeout);
		}
    
    }
    
    else if (from == 'showAllAiTrips') {
        if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">AI Buddy Trips</span>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('allAiTrips');
            jQuery('#secondary .secondary__tab:last-child .drawerBody .allAiTrips').show();
            openSecondary();
        }
        else {
            jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
            jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
			
        }
    }
	else if (from == 'flights') {
        if (state == 'show') {
            jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('flights__search');
			jQuery('#secondary .secondary__tab:last-child .drawerHeader').remove();
            openSecondary();
        }
        else {
            jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
            jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
        }
    }
    else if (from == 'flightsBooking') {
        if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Traveller Details</span>');
            jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('flights__booking');
			
			// Add class to drawerBack 
			jQuery('#secondary .secondary__tab .drawerHeader .drawer__back').addClass('flightsBookingBack');
			
			openSecondary();
			
        }
        else {
            jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
            jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
        }
    }
    else if (from == 'flightsFilter') {
        if (state == 'show') {
            jQuery(titleClass()).html('<span class="highlight">Filter Flights</span>');
            jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
            jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('flights__filter');
            openSecondary();
        }
        else {
            jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
            jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
        }
    }
    
    else if (from == 'viewFlights') {
        if (state == 'show') {
            jQuery(titleClass()).html('<span class="highlight">Flight Details</span>');
            jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
            jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('flights__view');
			jQuery('#secondary .secondary__tab .drawerHeader .drawer__back').addClass('flightsViewBack');
            openSecondary();
        }
        else {
            jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
            jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
        }
    }
    
    else if (from == 'travellerDetails') {
        if (state == 'show') {
            jQuery(titleClass()).html('<span class="highlight">Traveller Details</span>');
            jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
            jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('traveller__details');
            openSecondary();
        }
        else {
            jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
            jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
        }
	}
	else if (from == 'cancelPolicy') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Cancellation Policy</span>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('cancel__policy');

			jQuery('#secondary .secondary__tab:last-child .drawerBody').append(locationName);

			openSecondary();
		} else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
		}
	}
	else if (from == 'flightSSR') {
        if (state == 'show') {
            jQuery(titleClass()).html('<span class="highlight">Ancillary Services</span>');
            jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('flights__SSRPage');
			
			// Add class to drawerBack 
			jQuery('#secondary .secondary__tab:last-child .drawerHeader .drawer__back').addClass('flightsSSRBack');
		
            openSecondary();
        }
        else {
            jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
            jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
        }
	}
	else if (from == 'mealSelection') {
        if (state == 'show') {
            jQuery(titleClass()).html('<span class="highlight">Meal Selection</span>');
            jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('flights__MealPage');
			
			// Add class to drawerBack 
			jQuery('#secondary .secondary__tab:last-child .drawerHeader .drawer__back').addClass('flightsMealBack');
		
            openSecondary();
        }
        else {
            jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
            jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
        }
	}
	else if (from == 'bookedFlightTickets') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Booked Tickets</span>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('booked__tickets');
			openSecondary();
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
		}
	}
	else if (from == 'hotelSearchResults') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Discover Your Perfect Stay</span>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('hotelSearchResults');
			openSecondary();
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
		}
	}
	else if (from == 'hotelDetails') {
		if (state == 'show') {
			jQuery(titleClass()).html('<span class="highlight">Discover Your Perfect Stay</span>');
			jQuery('#secondary .secondary__tab:last-child .drawerBody').show();
			jQuery('#secondary .secondary__tab:last-child .drawerBody').addClass('hotelDetails');
			openSecondary();
			jQuery('.hotelDetails').parents().find('.drawerHeader').remove();
		}
		else {
			jQuery('#secondary .secondary__tab:last-child').addClass('hidding');
			jQuery('#secondary .secondary__tab:last-child').hide('slide', { direction: 'right' }, timeout);
		}
	}
	
             
    

	function titleClass() {
		return '#secondary .secondary__tab:last-child .drawerTitle';
	}

	function openSecondary() {
		videoManager('pauseAll');
		jQuery('#secondary .secondary__tab:last-child').show('slide', { direction: 'right' }, timeout);
		setTimeout(() => {
			jQuery('#secondary .secondary__tab:last-child').removeClass('hidding');
		}, timeout);
	}
	
	// if (state != 'show') {
	// 	jQuery('.ui-effects-wrapper').remove();
	// }

}

function toast(message, duration) {
	if (message) {
		if (message == 'init') {
			//Create the toast element at the bottom of the page with jQuery
			var toast = jQuery('<div class="toast hidden">' + message + '</div>');
			jQuery('#app').append(toast);
		}
		else {
			if (!duration) {
				duration = 5000;
			}

			//Clear the current queue for the toast
			jQuery('.toast').stop(true, true);

			//Fade in the toast
			jQuery('.toast').html(message);
			jQuery('.toast').fadeIn(400).delay(duration).fadeOut(400);
		}
	}
}

function postLoader(state, from) {
	if (state == 'show') {
		
		if (from == 'findExperiences') {
			newDiv = '<div class="feed__loader findExp"><span>No matching experiences found but you can checkout these Nearby Experiences</span></div>';
			firstChild = jQuery('.filetered-experience-body');

			firstChild.prepend(newDiv);
		}
		else {
			// Adding the loader as the second child of the div with id app
			newDiv = '<div class="feed__loader"><span>Your Post is uploading, meanwhile you can use the App. ' + icons.post_loader + '</span></div>';
			firstChild = jQuery('#app').children().first();

			firstChild.after(newDiv);
			
		}
		
	}
	else if (state == 'hide') {
		jQuery('.feed__loader').remove();
	}
}

function renderLastActiveStatus(state, data, from) {
	console.log('renderLastActiveStatus', state, data);

	if (data.responseCode == 200) {
		if (state == 'render') {
			data = data.object;

			if (data.userStatus == '2' || data.userStatus == null) {
				setTimeout(() => {
					if (isAndroid()) {
						Android.googleRevokeAccess();
					}
					jsInit('logout', { "deviceUniqueId": "" });
				}, 5000);
			}

		}
	}
	else {
		toast(data.errorMessage);
	}
}

function renderAppUnderMaintainance() {
	// We will show a new Creative if the App is under maintainence but for now we will show 404 page.
	renderPermissionBox('init', 'underMaintainance');

	// Call function every 1 minute & Stop if the App is out of Maintainance
	var myInterval = setInterval(function () {
		fetch(baseUrl + '/app.json')
			.then(response => response.json())
			.then(data => {
				// `data` is the parsed JSON data from the file
				console.log(data);
				if (data.app_under_maintenance) {
					console.log('App is under maintainence');
				}
				else {
					// When you want to stop the interval
					console.log('App is not under maintainence');
					clearInterval(myInterval);
					window.history.pushState({ html: '', pageTitle: '' }, '', '/flights');
					reloadWindowWithIosCheck();
				}
			})
			.catch(error => {
				console.error('Error:', error);
			});
	}, 1 * 60 * 1000); // 1 denotes 1 minute
}

function renderMessagesDashboard(state, cohortResponse, data) {	
	if (state == 'init' && manageUserProfile('read', 'role') == 'admin') {
		// Render a input for file chooser and text upload
		jQuery("#secondary .secondary__tab:last-child .drawerBody").append(
			'<div class="messageDashboard"><input type="file" name="share__upload" class="input_dashboard" id="share__upload" onchange="manageMessageDashboardMedia(this)"accept=".jpeg, .jpg, .png, .gif, .svg, video/*"><textarea class="message_dashboard_text" name="share__message" id="share__message" placeholder="Any text Here" maxlength="5000" resize="none"></textarea><select name="share__cohort" id="message-cohorts"><option value="">Select the Cohort</option></select><select name="share__cohort_profile" id="message_profile"><option value="">Select the User</option></select><button id="send_message_dashboard">Send Message</button></div>'
		);

		// Assuming you have a select element with id 'message-cohorts'
		selectElement = document.getElementById('message-cohorts');
		selectElementProfile = document.getElementById('message_profile');

		// Here we will map the Ids of the cohorts to the names of the cohorts
		cohorts = cohortResponse.object;

		userProfile = [
			{
				userName: 'Travel Buddy', userId: '1796631', userDisplayPicture: 'uploads/display_picture/e7d0c3d3f924d723c34e47266996c8731a45adcd653cb65bd08eed2c54a0208d_1706851151162.png'
			}
		];
	
		// Cohort Selection
		selectElement.innerHTML = '<option value="">Select the Cohort</option>' + 
		cohorts.map(cohort => `<option class = "cohortId" value="${cohort.msgType}">${cohort.msgDisplayName}</option>`).join('');

		// Profile Selection
		selectElementProfile.innerHTML = '<option value="">Select the User</option>' + userProfile.map(user => `<option value="${user.userId}" data-img="${user.userDisplayPicture}" data-name="${user.userName}">${user.userName}</option>`).join('');


		setTimeout(() => {
			jQuery("#secondary .secondary__tab .drawerBody").find(".feed__loading").hide();
		}, 1000);
	} 
	else if (state == "saveMediaInLocal") {
		// Make the payload of Media Items here in local storage
		localStorage.setItem("messageDashboardMedia", data.imageData.Key);
	} 
	else if (state == "send") {
		// Get Text from share__message textarea
		message = jQuery("#share__message").val();
		console.log(message);

		if (localStorage.getItem('messageDashboardMedia') != null) {
			// Get the path of image from local storage
			media = localStorage.getItem("messageDashboardMedia");
			console.log(media);
			mediaType = getMediaType(media);
			type = "media";
			isMedia = true;
		} 
		else {
			type = "text";
			mediaType = "text";
			isMedia = false;
		}
		selCohortId = jQuery('#message-cohorts').find(':selected').val();
		selUserProfile = jQuery('#message_profile').find(':selected');
		if (selUserProfile.val() !== '') {
			userProfileData = { 
				userId: selUserProfile.val(), 
				userName: selUserProfile.attr('data-name') , 
				userDisplayPicture: selUserProfile.attr('data-img') 
			};
		}
		else {
			userProfileData = { 
				userId: '1796631', 
				userName: 'Travel Buddy', 
				userDisplayPicture: 'uploads/display_picture/e7d0c3d3f924d723c34e47266996c8731a45adcd653cb65bd08eed2c54a0208d_1706851151162.png'
			};
		}

		console.log(userProfileData);

		mediaArr = { mediaType: mediaType, mediaUrl: localStorage.getItem('messageDashboardMedia') };
		
		payload = { chatType: 'personal', isSentByCurrentUser: false, timeStamp: '', isDeleted: false, isReadOnly: true, isMedia: isMedia, isSeen: false, isStarred: false, message: message,  type: type, media: [mediaArr], senderId: userProfileData.userId, toId: '', chatId: '', cohortId: selCohortId };
		
		
		// Send message request
		if (selCohortId != '') {
			sizeInKb = JSON.stringify(payload).length / 1024;
			sizeInMb = sizeInKb / 1024;
			// Check if the payload is greater than 1 Mb
			if (sizeInMb < 1) {
				toast('Sending Message. Please check the Message Dashboard Analytics for the status of the message.',  3000);
				
				jsInit('initiateMessage', {'cohortId': selCohortId, 'messagePayload': payload, profilePic: userProfileData.userDisplayPicture, name: userProfileData.userName, 'simpleUserId': userProfileData.userId });

				// Clear the file input
				destroyAllSecondaryTabs();

				// Empty localStorage.getItem('messageDashboardMedia')
				localStorage.removeItem('messageDashboardMedia');
				
			}
			else {	
				toast('Message size is greater than 1 Mb. Please shorten the message and try again.', 'error', 2000);
			}
		}
		else {
			toast('Please select a cohort to send the message', 'error', 2000);
		}
		
	}
	else if (state == 'messageDashboardAnalytics') {
		if (cohortResponse !== 'refresh') {
			manageSecondary('show','message-dashboardAnalytics');
		}
		else if (cohortResponse == 'refresh') {
			// Clear the table
			table.clear(); 
			
		}
		response = data.list;
		console.log(response);
		addItems();

		function addItems() {
			// Add rows to the table
			jQuery.each(response, function(index, item) {
				if (item.jobStatus == 'inprogress') {
					item.jobStatus = ((item.noOfUsersRecieved / item.sizeOfCohort ) * 100).toFixed(2);
					item.jobStatus = 'Sent to ' + item.jobStatus + ' %';
				}
				jQuery('#tableBody').append(
					jQuery('<tr>').append(
						jQuery('<td>').text(item.msgJobId),
						jQuery('<td>').text(item.cohortTitle),
						jQuery('<td>').text(item.triggeredOn),
						jQuery('<td>').text(item.sizeOfCohort),
						jQuery('<td>').text(item.noOfUsersRecieved),
						jQuery('<td>').text(item.noOfUsersSeen),
						jQuery('<td>').text(item.jobStatus),
						jQuery('<td>').text(item.message)
					)
				);
			});
		}

		jQuery(document).ready(function() {
			if ($.fn.dataTable.isDataTable('#myTable')) {
				jQuery('#myTable').DataTable().destroy();
				addItems();
			}
			table = $('#myTable').DataTable({
				dom: 'Blfrtip',
				lengthMenu: [
					[10, 25, 50, -1],
					['10 rows', '25 rows', '50 rows', 'Show all']
				],
				buttons: [
					{
						text: 'Refresh',
						action: function ( e, dt, node, config ) {
							//reloadWindowWithIosCheck();
							jsInit('getMessageHistory',{}, 'refresh');

						}
					}
				],
				order: [[0, 'desc']]
			}).draw();

			// Adding the CSS to the DataTable programmatically as it was not working from the CSS file since the default css of dataTables were overriding it.

			jQuery('.dt-buttons').css('cursor', 'pointer');

			jQuery('button.dt-button').css({
				'border-radius': '10px',
				'margin-left': '5px',
				'font-size': '14px',
				'background': 'yellow'
			});

			jQuery('button.dt-button span').css({
				'font-size': '16px',
				'font-family': 'Open Sauce Sans'
			});
		});
	}
}

function manageMessageDashboardMedia(thisELement) {
	var files = thisELement.files;

	if (files.length > 0) {
		var uploadData = new FormData();

		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			uploadData.append('uploaded_files', file, file.name);
		}

		timestamp = Math.floor(Date.now() / 1000);
		userId = manageUserProfile('read', 'userId');
		chatId = userId + '_' + userId; // This is only for Dummy purposes.

		// Also append the user id to the form data
		uploadData.append('data', JSON.stringify({ userId: userId, chatId: chatId, timeStamp: timestamp }));
		// The chatId sent above is only for Dummy purposes.

		// // This is the Console Log Function to log images
		// for (var key of uploadData.entries()) {~
		// 	console.log(key[0] + ', ' + key[1]);
		// }

		mediaType = getMediaType(files[0].name);
		fileExtension = getFileExtension(files[0].name);
		fileName = getFileName(files[0].name);

		jsUpload('uploadMessageDashboardMedia', uploadData);
	}

	function getFileExtension(fileName) {
		return fileName.split('.').pop();
	}

	function getFileName(fileName) {
		return fileName.split('.').shift();
	}
}

/*function renderGroupChatFind(state, data) {
	if (state == 'createGroupButton') {
		//if (window.location.href.includes('dev.beatravelbuddy.com') || window.location.href.includes('localhost') || isIOS() || isAndroid() || isPwa()) {
            
            if (data.responseCode == '200') {
                jsInit('getDeltaDataChats', '', 'findBuddy' );
            }
        //}
	}
}*/

/*function renderHomePage(state, data) {
	if (state == 'init') {
        if (jQuery('#main__homepage-box').length == 0) {
			destroyAllSecondaryTabs();
            jQuery('#app #main').append('<div id="main__homepage-box"></div>');
			
            jQuery('#main__homepage-box').html('<div class="homepage__page"><div class="new-home-wrapper"><div class="home__search_container"><div class="search__box home-search"><input type="text" id="dynamic-placeholder" placeholder="Search Buddies, Experiences or Destinations"><button>' + icons.searchBar + '</button></div></div><div class="banner-image-wrapper"><div class="new-banner-image"><img src="/view/assets/img/findBuddy.svg"><div class="new__background-overlay"></div></div><div class="new-banner-text"><h3>Find Buddies for Your Next Trip</h3><p>Cut your budget by travelling with a buddy!</p></div><button class="new-home-btn">Find Buddies Today<i class="fa-solid fa-arrow-right"></i></button></div><div class="things-cards-wrapper"><h3 class="new-home-head">Things you can do on Travel Buddy</h3><p class="new-home-subhead">#NeverFeelAlone</p><div class="cards-wrapper"><div class="things-cards showExperiences"><div class="things-cards-container"><div class="things-card-front background-explore"><div class="card-inner"><p>Explore Experiences</p><span>Explore Now</span></div></div><div class="things-card-back"><div class="card-inner card-inner-back"><p>Your one stop shop to book trips & experiences from India and beyond!</p></div></div></div></div><div class="things-cards aiBuddy"><div class="things-cards-container"><div class="things-card-front background-aiBuddy"><div class="card-inner"><p>Plan with AI Buddy</p><span>Create Now</span></div></div><div class="things-card-back"><div class="card-inner card-inner-back"><p>Craft your personalized and exclusive itineraries with AI Buddy in seconds.</p></div></div></div></div><div class="things-cards findInfluencers"><div class="things-cards-container"><div class="things-card-front background-find"><div class="card-inner"><p>Find Influencers</p><span>Find Now</span></div></div><div class="things-card-back"><div class="card-inner card-inner-back"><p>Ask Local Influencers about your destination and get Real time information.</p></div></div></div></div><div class="things-cards" id="shareStories"><div class="things-cards-container"><div class="things-card-front background-share"><div class="card-inner"><p>Share Travel Stories</p><span>Share Today</span></div></div><div class="things-card-back"><div class="card-inner card-inner-back"><p>Share your travel tales and become Travel Influencer!</p></div></div></div></div></div></div><div class="findTravelBuddy__wrapper"><div class="findTravelBuddy"><div class="top_head_find"><h3>Find Travel Buddy</h3><div class="premium-icon">'+ icons.premium2 +'</div></div><div class="top_head_find"><h3>3X faster.</h3><div class="tb-pro"><p>Go TB Pro</p><div class="tb-pro-icon">'+ icons.goTbPro +'</div></div></div></div><div class="findTravelBuddy"><div class="top_head_find"><h3>Chat Unlimited With</h3><div class="premium-icon">'+ icons.premium2 +'</div></div><div class="top_head_find"><h3>3.5 M+ Travellers.</h3><div class="tb-pro"><p>Go TB Pro</p><div class="tb-pro-icon">'+ icons.goTbPro +'</div></div></div></div><div class="findTravelBuddy"><div class="top_head_find"><h3>Create Groups</h3><div class="premium-icon">'+ icons.premium2 +'</div></div><div class="top_head_find"><h3>Make Your Own Plan.</h3><div class="tb-pro"><p>Go TB Pro</p><div class="tb-pro-icon">'+ icons.goTbPro +'</div></div></div></div></div><h3 class="things-loved"><span class="heart">'+ icons.heart_homePage +'</span>What<span class="heart">YOU’D LOVE</span>here!</h3><div class="loved-things-wrapper shop-now-cards"><div class="loved-things-card card-yellow-light"><div class="loved-things"><div class="loved-things-image"><img src="/view/assets/img/trendingGroups.svg"></div><div class="loved-things-text"><div class="things-text-desc"><h3 class="loved-text-desc">Join Trending</h3><h3 class="loved-text-desc">Group Trips</h3></div><button class="join-text-btn">Join Now<span>'+ icons.newHomeArrow +'</span></button></div></div><div class="loved-card-icon">'+ icons.buddyIcon +'</div></div><div class="loved-things-card shop-now-card"><a src="https://mytravelstore.beatravelbuddy.com/"><div class="loved-things"><div class="loved-things-image"><img src="/view/assets/img/travelstore.png"></div><div class="loved-things-text"><div class="things-text-desc"><h3 class="loved-text-desc">Shop Now on</h3><h3 class="loved-text-desc">Travel Buddy Store</h3></div><button class="join-text-btn">Shop Now<span>'+ icons.newHomeArrow +'</span></button></div></div></a><div class="loved-card-icon">'+ icons.buddyIcon +'</div></div><div class="loved-things-card card-blue-light"><div class="loved-things"><div class="loved-things-image"><img src="/view/assets/img/partners.png"></div><div class="loved-things-text"><div class="things-text-desc"><h3 class="loved-text-desc">Partners of</h3><h3 class="loved-text-desc">Travel Buddy</h3></div><button class="join-text-btn partners-btn">Find Out More<span>'+ icons.newHomeArrow +'</span></button></div></div><div class="loved-card-icon">'+ icons.partnersIcon +'</div></div><div class="loved-things-card card-grey-light"><div class="loved-things"><div class="loved-things-image"><img src="/view/assets/img/query.png"></div><div class="loved-things-text query-things-desc"><div class="things-text-desc"><h3 class="loved-text-desc">Enquire Now</h3><p class="loved-text-description">Want to book your trip</p><p class="loved-text-description">with Travel Buddy?</p><p class="loved-text-description">Share details today!</p></div><button class="join-text-btn query-btn">Explore Now<span>'+ icons.newHomeArrow +'</span></button></div></div><div class="loved-card-icon">'+ icons.queryIcon +'</div></div></div><div class="home-page-footer"><div class="home-footer-top"><h3>Explore</h3><h3>the world !</h3></div><div class="footer-home-subhead"><p>Designed with '+ icons.heart_homePage+' in Bharat</p><p>to enhance your travel experience.</p><p class="footer-hastag">#NeverFeelAlone</p></div></div></div></div>');
            
            
            cards = document.querySelectorAll(".things-cards-container");

            function flipCard(index) {
				if (cards && cards[index]) {
					cards[index].classList.toggle("flip");
				}
            }

            function startFlipping() {
                index = 0;
				intervalId = setInterval(() => {
					flipCard(index);
					setTimeout(() => {
						flipCard(index);
						index = (index + 1) % cards.length;
						if (index === 0) {
							index = 0;
						}
					}, 4000);
				}, 5000);

				setTimeout(() => {
					clearInterval(intervalId);
				}, 300000); // 5 minutes in milliseconds
            }
            startFlipping();
                  
        }

		// Hide Hamburger Icon
		jQuery('.header__hamburger,.head__filter, .head__chat, .head__search, .head__addPost').hide();
    }
}*/

// This function is called when a user tries to add a post
async function manageAddPost(thisElement) {
	
	filesArray = [];
	// Find the FilePond instance on the page
    activeTab = jQuery('.addPost__tabs .addPost__tab-item.active').attr('data-id');
    if (activeTab == 'share') {
        //var pond = FilePond.find(document.querySelector('#share__upload'));
    }
    else {
        //var pond = FilePond.find(document.querySelector('#share__upload-find'));
    }
	
	// Get the files selected by the user
	var files = thisElement.files;

	// Loop through each file
	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		if (file.type != '' && !fileValidation(file)) {
			return;
		}

		
		if (file.type == '' && (file.size > 20000000)){
			toast('Image size is too big, max size is 20MB.');
			return;
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
			let jpegFile = await convertHeicToJpeg(file);
			// Add the converted file to the FilePond instance
			pond.addFile(jpegFile);
			loaderMain('global__loading', false);
		} 
		else {
			// If the file is not a HEIC or HEIF image, add it to the FilePond instance as is
			pond.addFile(file);
		}
		
	}
	
}

// This function converts a HEIC or HEIF image to a JPEG image
async function convertHeicToJpeg(file) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();

		reader.onload = function(event) {
			// Create a Blob from the file data
			let blob = new Blob([event.target.result]);

			// Convert the Blob to a JPEG image
			heic2any({
				blob: blob,
				toType: "image/jpeg",
				quality: 1
			})
			.then(function(jpegBlob) {
				// Create a File from the JPEG Blob
				let jpegFile = new File([jpegBlob], file.name, {
					type: 'image/jpeg',
				});

				// Resolve the Promise with the JPEG File
				resolve(jpegFile);
			})
			.catch(function(error) {
				// If there was an error converting the image, log it to the console and reject the Promise
				console.error('Error converting HEIC to JPEG:', error);
				reject(error);
			});
		};

		// Read the file as an ArrayBuffer
		reader.readAsArrayBuffer(file);
	});
}

function findDatesRestrictions() {
    startDateFind = $('#findStartDate');
    // endDateFind = $('#findEndDate');

    // Set the initial min and max values for the start date
    today = new Date();
    oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    startDateFind.attr('min', today.toISOString().split('T')[0]);
    startDateFind.attr('max', oneYearFromNow.toISOString().split('T')[0]);

    // Update the min and max values for the end date when the start date changes
    startDateFind.on('change', function() {
        let startDate = new Date($(this).val());
        let tenDaysLater = new Date(startDate);
        tenDaysLater.setDate(startDate.getDate() + 10);
        // endDateFind.attr('min', startDate.toISOString().split('T')[0]);
        // endDateFind.attr('max', tenDaysLater.toISOString().split('T')[0]);
    });
}

function clearAndGoBack() {
    jQuery('#footer ul li[data-item="feed"]').trigger('click');
    ['share', 'find-experiences', 'find-buddy', 'ask', 'find-influencers'].forEach(id => jQuery(`#addPost__${id}`)[0].reset());
    jQuery('.editImage').remove();
    jQuery('#share__media, #share__uploading').val('');
    jQuery('.addPost__post').html('Post');			
}

function removeStrongTags(description) {
    userSaysRegex = new RegExp(`<strong>${manageUserProfile('read', 'name')}</strong> says: [^\\n]*`, 'g');
    userSays = description.match(userSaysRegex);

    cleanedUserSays = '';

    // Only perform the replacement if there is a match
    if (userSays) {
    cleanedUserSays = userSays[0].replace(new RegExp(`<strong>${manageUserProfile('read', 'name')}</strong> says: `), '');
    }

    return cleanedUserSays;
}

// Create a new IndexedDB Database
function createDatabase(data) {
	return new Promise((resolve, reject) => {
		var request = indexedDB.open('chatData');
		request.onupgradeneeded = function(event) {
			var db = event.target.result;

			if (!db.objectStoreNames.contains('userChats')) {
				db.createObjectStore('userChats', { keyPath: 'chatId' });
			}

			if (!db.objectStoreNames.contains('chatsData')) {
				db.createObjectStore('chatsData', { keyPath: 'chatId' });
			}
            
            if (!db.objectStoreNames.contains('groupUsers')) {
				db.createObjectStore('chatsData', { keyPath: 'groupId' });
			}
		};

		request.onsuccess = function (event) {
			
			var db = event.target.result;
			/*if (!db.objectStoreNames.contains('userChats')) {
				db.createObjectStore('userChats', { keyPath: 'chatId' });
			}

			if (!db.objectStoreNames.contains('chatsData')) {
				db.createObjectStore('chatsData', { keyPath: 'chatId' });
			}
            
            if (!db.objectStoreNames.contains('groupUsers')) {
				db.createObjectStore('chatsData', { keyPath: 'groupId' });
			}*/
			try {
				var transaction = db.transaction(['userChats'], 'readwrite');
				var objectStore = transaction.objectStore('userChats');
			}
			catch (error) {
				console.error('Error opening database:', error);
				reject(error);
				loaderMain('global__loading', false);
			}
			if (Array.isArray(data)) {
				var promises = data.map(function(item) {
					return new Promise((resolve, reject) => {
						if (item.chatId) {
							var request = objectStore.put(item);
							request.onsuccess = function(event) {
								resolve();
							};
							request.onerror = function(event) {
								console.error('Error adding data item:', event.target.error);
								reject(event.target.error);
								loaderMain('global__loading', false);
							};
						} else {
							console.log('Data item does not have a chatId property');
							resolve();
						}
					});
				});

				Promise.all(promises)
					.then(() => resolve())
					.catch((error) => reject(error));
			} else {
				console.log('Data is not an array');
				resolve();
			}
		};

		request.onerror = function(event) {
			console.error('Error opening database:', event.target.error);
			reject(event.target.error);
			loaderMain('global__loading', false);
		};
	});
}

// Create a new IndexedDB Database for chatId data
function createDbForChatId(data, from) {
	return new Promise((resolve, reject) => {
		var request = indexedDB.open('chatData');
		request.onupgradeneeded = function(event) { 
			var db = event.target.result;

			if (!db.objectStoreNames.contains('userChats')) {
				db.createObjectStore('userChats', { keyPath: 'chatId' });
			}
			// Check if the object store already exists before trying to create it
			if (!db.objectStoreNames.contains('chatsData')) {
				db.createObjectStore('chatsData', { keyPath: 'chatId' });
			}

			if (!db.objectStoreNames.contains('groupUsers')) {
                db.createObjectStore('groupUsers', { keyPath: 'groupId' });
            }
		};

		request.onsuccess = function(event) {
			var db = event.target.result;
			// Check if the object store exists before trying to access it
			if (!db.objectStoreNames.contains('chatsData')) {
				console.error('Object store "chatsData" does not exist');
				loaderMain('global', false);
				return;
			}
			var transaction = db.transaction(['chatsData'], 'readwrite');
			var objectStore = transaction.objectStore('chatsData');

			if (Array.isArray(data)) {
				item = data[0];
				for (let key in item) {
					if (from != 'child_added') {
						let innerItem = item[key];
						if (innerItem && innerItem.chatId && innerItem.timeStamp && !isNaN(innerItem.timeStamp)) {
							if (typeof innerItem.timeStamp === 'string') {
								innerItem.timeStamp = Number(innerItem.timeStamp);
							}
							var request = objectStore.put(innerItem);
							request.onsuccess = function(event) {};
						} else {
							console.log('Data item does not have a chatId or chatType property');
						}
					}
					else {
						if (item && item.chatId && item.timeStamp && !isNaN(item.timeStamp)) {
							if (typeof item.timeStamp === 'string') {
								item.timeStamp = Number(item.timeStamp);
							}
							var request = objectStore.put(item);
							request.onsuccess = function(event) {};
						} else {
							console.log('Data item does not have a chatId or chatType property');
						}
					}
				}
				resolve();
			} else {
				console.log('Data is not an array');
				reject();
			}
		};
	});
}

// Create a new IndexedDB Database for chatId data
function createDbForGroupUsers(data) {
	return new Promise((resolve, reject) => {
		var request = indexedDB.open('chatData', 2);
		request.onupgradeneeded = function(event) { 
			var db = event.target.result;

			if (!db.objectStoreNames.contains('userChats')) {
				db.createObjectStore('userChats', { keyPath: 'chatId' });
			}
			// Check if the object store already exists before trying to create it
			if (!db.objectStoreNames.contains('chatsData')) {
				db.createObjectStore('chatsData', { keyPath: 'chatId' });
			}
            
            if (!db.objectStoreNames.contains('groupUsers')) {
				db.createObjectStore('groupUsers', { keyPath: 'groupId' });
			}
		};

		request.onsuccess = function(event) {
			var db = event.target.result;
			// Check if the object store exists before trying to access it
			if (!db.objectStoreNames.contains('groupUsers')) {
				console.error('Object store "groupUsers" does not exist');
				return;
			}
			var transaction = db.transaction(['groupUsers'], 'readwrite');
			var objectStore = transaction.objectStore('groupUsers');

			if (Array.isArray(data)) {
                var request = objectStore.put(data[0]);
                request.onsuccess = function(event) {};

                    
				resolve();
            }
			 else {
				console.log('Data is not an array');
				reject();
			}
		};
	});
}

function getChatDataFromIndexedDb(from) {
	return new Promise((resolve, reject) => {
		openRequest = indexedDB.open('chatData');
		openRequest.onsuccess = function(event) {
			iDB = event.target.result;
			transaction = iDB.transaction(['groupUsers'], 'readonly');
			store = transaction.objectStore('groupUsers');
			getRequest = store.getAll();
			getRequest.onsuccess = function(event) {
				data = event.target.result;
				resolve(data);
			};
			getRequest.onerror = function(event) {
				console.error('Error fetching data:', event.target.error);
				reject(event.target.error);
				loaderMain('global__loading', false);
			};
		};
		openRequest.onerror = function(event) {
			console.error('Error opening database:', event.target.error);
			reject(event.target.error);
			loaderMain('global__loading', false);
		};
	});
	
}
// Fetch sorted data
function fetchSortedData() {
    return new Promise(function(resolve, reject) {
        var request = indexedDB.open('chatData');
		
		request.onupgradeneeded = function(event) {
			var db = event.target.result;
			if (!db.objectStoreNames.contains('userChats')) {
				db.createObjectStore('userChats', { keyPath: 'chatId' });
			}
		};
        request.onsuccess = function(event) {
            var db = event.target.result;
            var transaction = db.transaction(['userChats'], 'readonly');
            var objectStore = transaction.objectStore('userChats');
            var getDataRequest = objectStore.getAll();

            getDataRequest.onsuccess = function(event) {
                var data = event.target.result;
                data.sort(function(a, b) {
                    return a.last_message_time - b.last_message_time;
                });
                resolve(data.reverse());
            };

            getDataRequest.onerror = function(event) {
                console.error('Error retrieving data:', event.target.error);
				reject(event.target.error);
				loaderMain('global__loading', false);
            };
        };

        request.onerror = function(event) {
            console.error('Error opening database:', event.target.error);
			reject(event.target.error);
			loaderMain('global__loading', false);
        };
    });
}

// Check and update data
function checkAndUpdateData(data) {
	return new Promise((resolve, reject) => {
		var openRequest = indexedDB.open('chatData', 2);
		
		openRequest.onupgradeneeded = function(event) {
            var db = event.target.result;

            if (!db.objectStoreNames.contains('userChats')) {
                db.createObjectStore('userChats', { keyPath: 'chatId' });
            }

            if (!db.objectStoreNames.contains('chatsData')) {
                db.createObjectStore('chatsData', { keyPath: 'chatId' });
            }
            
            if (!db.objectStoreNames.contains('groupUsers')) {
                db.createObjectStore('groupUsers', { keyPath: 'groupId' });
            }
        };

		openRequest.onsuccess = function(event) {
			var db = event.target.result;
			var transaction = db.transaction(['userChats'], 'readwrite');
			var objectStore = transaction.objectStore('userChats');

			var promises = data.map(function(item) {
				return new Promise((resolve, reject) => {
					if (item && item.chatId) {
						var getRequest = objectStore.get(item.chatId);
					}
					else {
						resolve();
					}

					getRequest.onsuccess = function(event) {
						var dbItem = event.target.result;

						if (!dbItem || JSON.stringify(dbItem) !== JSON.stringify(item)) {
							var putRequest = objectStore.put(item);
							//appendDeltaChatDataFromIndexedDb('prepend', item);
							putRequest.onerror = function(event) {
								console.error('Error storing data:', event.target.error);
								reject(event.target.error);
								loaderMain('global__loading', false);
							};
							resolve();
						} 
						else {
							resolve();
						}
					};

					getRequest.onerror = function(event) {
						console.error('Error retrieving data:', event.target.error);
						reject(event.target.error);
						loaderMain('global__loading', false);
					};
				});
			});

			Promise.all(promises)
				.then(() => {
					resolve();
				})
				.catch((error) => {
					console.error('Error with Promise.all:', error);
					reject(error);
				});
		};

		openRequest.onerror = function(event) {
			console.error('Error opening database:', event.target.error);
			reject(event.target.error);
			loaderMain('global__loading', false);
		};
	});
}


function fetchSortedChatData() {
    return new Promise(function(resolve, reject) {
        var request = indexedDB.open('chatData');
        request.onsuccess = function(event) {
            var db = event.target.result;
            var transaction = db.transaction(['chatsData'], 'readonly');
            var objectStore = transaction.objectStore('chatsData');
            var getDataRequest = objectStore.getAll();

            getDataRequest.onsuccess = function(event) {
                var data = event.target.result;
                data.sort(function(a, b) {
                    return Number(a.timeStamp) - Number(b.timeStamp);
                });
                resolve(data.reverse());
            };

            getDataRequest.onerror = function(event) {
                console.error('Error retrieving data:', event.target.error);
				reject(event.target.error);
				loaderMain('global__loading', false);
            };
        };

        request.onerror = function(event) {
            console.error('Error opening database:', event.target.error);
			reject(event.target.error);
			loaderMain('global__loading', false);
        };
    });
}

// Main function
function sendChatDataToIndexedDb(state, data, from) {
    if (state == 'init') {
        createDatabase(data).then(function() {
            sendChatDataToIndexedDb('fetch', '', '');
            //jsInit('getDeltaDataChats', '', '');
        }).catch(function(error) {
            console.error('Error:', error);
        });
    } 
    else if (state == 'fetch') {
        fetchSortedData().then(function(data) { 
            sortedUserInfo = [];
            sortedUserInfo = data; // Here we will store the sorted user info data
            fetchSortedChatData().then((data) => {
                sortedChat = []; // Here we will store the sorted chat data
                renderChatArray = []; // Here we will store the sorted chat data that will be sent for rendering the Chat List
                sortedChat = data;
                for (i = 0 ; i < sortedChat.length; i++) {
                    for (j = 0; j < sortedUserInfo.length; j++) {
                        if (sortedChat[i].chatId == sortedUserInfo[j].chatId) {
                            renderChatArray.push(sortedUserInfo[j]);
                        }
                    }
                }
                localStorage.setItem('chat__open', 'true');
                renderChat('renderChatUsers', renderChatArray, 'chat__open');
                
                if (from == 'newGroupChat') {
                    jQuery('.chat__item').first().click();
                }
            });
            
            if (from == 'findBuddy') {
                toast('You have requested to join the group. Please wait for the admin to accept your request.');
            }            
        }).catch(function(error) { 
            console.error('Error:', error); 
        });
    } 
    else if (state == 'check') {
        checkAndUpdateData(data).then(function() {
            subscribeToChat(data, 'sendChatToIndexed').then(function() {
                if (from == 'findBuddy') {
                    sendChatDataToIndexedDb('fetch', '', 'findBuddy');
                }
                else if (from == 'newGroupChat') {
                    sendChatDataToIndexedDb('fetch', '', 'newGroupChat');
                }
                else {
                    sendChatDataToIndexedDb('fetch', '', '');
                }
            }).catch(function(error) {
                console.error('Error:', error);
            });
        }).catch(function(error) {
            console.error('Error:', error);
        });
    }
    else if (state == 'saveAllChats') {
        saveChatsToIndexedDb(data);
    }    
}

function shouldSkipChat(chat) {
	if (chat.chatId && chat.chatId.isRemoved == 1) {
		return true;
	}

	if (chat.chatType == 'group' && chat.isRejected == 1) {
		return true;
	}

	if (jQuery(`.chat__item-${chat.chatId}`).length != 0) {
		return true;
	}

	return false;
}

function appendDeltaChatDataFromIndexedDb(state, data) {
	chatContainer = jQuery('#main__chat-box .chats__container');
	html = '';
	chat = data;
	
	try {
        
        if (chat.last_message == '' || chat.last_message == undefined) {
            return;
        }
		if (shouldSkipChat(chat)) {
			return;
		}
		
		function getChatDetails(chat) {
			let chatType, userName, imagePath, profilePic, messageAccepted, chatRejected, chatRejectedMsg, chatIdClass, encryptedIdElem, createdBy, lastMessage;
		
			chatType = chat.chatType;
			date = formatDateForChat(chat.last_message_time);
			messageAccepted = (chat.isMsgReqAccepted == 0 && chat.isRejected == 0) ? '<p class="acceptReqPrompt css-1ymtwa0">Message Request : Tap to view &amp; then you can accept / decline</p>' : '';
			chatRejected = (chat.isRejected == 1) ? ' rejected' : '';
			chatRejectedMsg = (chat.isRejected == 1) ? (chat.chatType == 'personal') ? '<p class="acceptReqPrompt css-1ymtwa0">Message Request Declined</p>' : '<p class="acceptReqPrompt css-1ymtwa0">You have left the group</p>' : '';
			chatIdClass = (chat.chatId) ? ` chat__item-${chat.chatId}` : '';
			encryptedIdElem = '';
		
			if (chatType == 'group') {
				userName = chat.groupName;
				if (chat && chat.groupProfileURL != undefined ) {
					imagePath = getProfileImage(renderUserProfileImage(chat.groupProfileURL), '', '', '', false);
					profilePic = (chat.groupProfileURL) ? imagePath : '<img src="' + API_URL + '/view/assets/img/chat__person.png">';
				}
				chat.isMsgReqAccepted = true;
				createdBy = chat.createdById;
				lastMessage = chat.last_message
			}
			else {
				userName = (!chat.userInfo) ? 'Deactivated Account' : (chat.userInfo.displayName || chat.userInfo.DisplayName);
				userName = (userName == "System Account") ? 'Travel Buddy' : userName;
				if (chat && chat.userInfo && (chat.userInfo.profilePic != undefined || chat.userInfo.PhotoURL != undefined)) {
					imagePath = getProfileImage(renderUserProfileImage(chat.userInfo.profilePic ? chat.userInfo.profilePic : chat.userInfo.PhotoURL), userName, '', '', false);
					profilePic = (chat.userInfo && chat.userInfo.profilePic && chat.userInfo.profilePic) ? imagePath : '<img src="' + API_URL + '/view/assets/img/chat__person.png">';
				}
				messageAccepted = '';
				chatRejectedMsg = '';
				createdBy = '';
				encryptedIdElem = ` encrypted-user-id="${chat.encryptedId}"`;
				lastMessage = chat.last_message;
			}
		
			if (profilePic != undefined) {
				return { chatType, userName, imagePath, profilePic, messageAccepted, chatRejected, chatRejectedMsg, chatIdClass, lastMessage, encryptedIdElem, createdBy };
			}
			else {
				return { chatType, userName, imagePath, profilePic: '<img src="' + API_URL + '/view/assets/img/chat__person.png">', messageAccepted, chatRejected, chatRejectedMsg, chatIdClass, encryptedIdElem, lastMessage, createdBy };
			}
		}

        
		let  { chatType, userName, imagePath, profilePic, messageAccepted, chatRejected, chatRejectedMsg, chatIdClass, encryptedIdElem, createdBy, lastMessage } = getChatDetails(chat);

		if (lastMessage != undefined) {
			textContent = lastMessage.replace(/<\/?[^>]+(>|$)/g, "\n");
		}
		else {
			textContent = '';
		}
        
        finalHtml = `<div class="chat__item${chatIdClass}${chatRejected}" data-rejected="${chat.isRejected}" data-isReadOnly="${chat.isReadOnly}" data-cohortid="${chat.cohortId}" data-chat-userName="${userName}" data-created-by="${createdBy}" data-chat-type="${chatType}" data-chat-id="${chat.chatId}" data-chat-user="${chat.to_uid}" ${encryptedIdElem} data-isaccepted="${chat.isMsgReqAccepted}" data-timestamp= "${chat.last_message_time}"><div class="css-c8gsda"><div class="css-f6loyt"><div class="css-3i9vrz">${profilePic}</div><div class="userName"><p class="userName css-rq7oal">${userName}</p><p class="css-26blw5">${textContent}</p>${chatRejectedMsg}${messageAccepted}</div></div><div class="css-s2uf1z"><div class="timeStamp" style="margin-top:-19px;color:var(--grey-2,#707070)}">${date}</div><div class="css-1h2atly"></div></div></div></div>`;
        
        if (chatType == 'group') {
            groupChatsHtml =  finalHtml + groupChatsHtml;
        }
        else {
            personalChatsHtml =  finalHtml + personalChatsHtml; 
        }
        
        allChatsHtml = finalHtml + allChatsHtml;
        
		html += finalHtml;
	}
	catch (error) {
		console.log(chat);
		console.log(error);
	}
	
	// Here we have to update the Chat & Group data along with Div to the global HTML variables of Personal Chat & Group Chat
	// Also, resolve the message Previews as well as the New Message Tag
	
	state == 'prepend' ? chatContainer.prepend(html) : chatContainer.append(html);
}

// Updates the groupMembers info ( only uid and addedOn of the Old Groups ) 
function updateMemberInfo(groupId, memberId, updatedInfo) {
	console.log(memberId, updatedInfo);
	openRequest = indexedDB.open('chatData');
	
	openRequest.onsuccess = function(event) {
		iDB = event.target.result;
	
		// Open a transaction on the store
		// Check if the object store exists before trying to access it
		if (!iDB.objectStoreNames.contains('groupUsers')) {
			console.error('Object store "groupUsers" does not exist');
			return;
		}
		transaction = iDB.transaction(['groupUsers'], "readwrite");
		store = transaction.objectStore('groupUsers');
	
		// Get the object by memberId (assuming memberId is the key or indexed)
		getRequest = store.get(groupId);
	
		getRequest.onerror = function(event) {
			console.error("Error fetching member:", event.target.error);
			loaderMain('global__loading', false);
		};
	
		// Wrap the onsuccess handler in a function that takes memberId as a parameter
        getRequest.onsuccess = (function(memberId) {
            return function(event) {
                member = event.target.result;

                if (member.members && member.members[memberId] && updatedInfo) {
                    // Use the memberId from the closure
                    member.members[memberId] = updatedInfo; // Assuming member.members is an object with memberId as key
                } else {
                    console.error("The member object does not have a members object or updatedInfo does not have memberId");
                    return;
                }

                putRequest = store.put(member);
                putRequest.onerror = function(event) {
					console.error("Error updating member:", event.target.error);
					loaderMain('global__loading', false);
                };

                putRequest.onsuccess = function(event) {
                    console.log("Member updated successfully");
                };
            };
        })(memberId); // Immediately invoke this function with memberId as argument
	
		transaction.oncomplete = function() {
			iDB.close();
		};
	};
	
}

// Updates the profilePic and userName of the group members in the groupUsers object store
function updateGroupMemberInfo(groupId, response) {
    return new Promise((resolve, reject) => {

        let openRequest = indexedDB.open('chatData');

        openRequest.onerror = function(event) {
			reject('IndexedDB open request error:', event.target.error);
			loaderMain('global__loading', false);
        };

        openRequest.onsuccess = function(event) {
            let groupChatDb = event.target.result;
            let transaction = groupChatDb.transaction(['groupUsers'], 'readwrite');
            let store = transaction.objectStore('groupUsers');
            let request = store.get(groupId);

            request.onerror = function(event) {
				reject('Error fetching group data:', event.target.error);
				loaderMain('global__loading', false);
            };

            request.onsuccess = function() {
                let data = request.result;
                if (data && data.members) {
                    response.groupMembers.forEach(member => {
                        if (data.members.hasOwnProperty(member.uid)) {
                            data.members[member.uid].userName = member.userInfo.displayName;
                            data.members[member.uid].profilePic = member.userInfo.profilePic;
                        } else {
                            data.members[member.uid] = {
                                uid: member.uid,
                                userName: member.userInfo.displayName,
                                profilePic: member.userInfo.profilePic
                            };
                        }
                    });
                    let updateRequest = store.put(data);
                    updateRequest.onsuccess = function() {
                        resolve('Group member info updated successfully.');
                    };
                    updateRequest.onerror = function(event) {
						reject('Error updating group member info:', event.target.error);
						loaderMain('global__loading', false);
                    };
                } else {
                    reject('No data found for groupId:', groupId);
                }
            };
        };
    });
}

function clearIndexedDb() {
	var request = indexedDB.open('chatData');

	request.onsuccess = function(event) {
		var db = event.target.result;

		for (var i = 0; i < db.objectStoreNames.length; i++) {
			var objectStoreName = db.objectStoreNames[i];
			var transaction = db.transaction(objectStoreName, 'readwrite');
			var objectStore = transaction.objectStore(objectStoreName);
			var clearRequest = objectStore.clear();

			clearRequest.onsuccess = function(event) {
				console.log('Object store cleared:', objectStoreName);
			};

			clearRequest.onerror = function(event) {
				console.error('Error clearing object store:', event.target.errorCode);
				loaderMain('global__loading', false);
			};
		}

		db.close();
		    // Delete the database
		var deleteRequest = indexedDB.deleteDatabase('chatData');

		deleteRequest.onsuccess = function(event) {
			console.log('Database deleted successfully');
		};
	
		deleteRequest.onerror = function(event) {
			console.error('Error deleting database:', event.target.errorCode);
			loaderMain('global__loading', false);
		};
	
		deleteRequest.onblocked = function(event) {
			console.warn('Database deletion blocked');
		};
	};

	request.onerror = function(event) {
		console.error('Error opening database:', event.target.errorCode);
		loaderMain('global__loading', false);
	};
}

function dontShowDeleteChat() {
}

function showHidePremiumAi(data) {	
    // Last Generated variable declaration should be of 1 type
    // User lastGeneratedTime for boolean
    
	if (guestMaster()) {
		jQuery('#countdown').hide();
        jQuery('.ai__premium').css('display', 'none');
		return;
	}
	now = new Date();
	itinerariesRemainingForPremium = 0;
    lastGenerated = 0;
    count = 0;
    allotedItineraries = 0;
    
	
	isInMins = data.aiPackages == null || data.aiPackages.length == 0;
	
	// Checking for Ai Premium
	
	isAiPremium = data.aiPackages != null ; //|| data.aiPackages.length != 0
	
	if (isAiPremium) {
		if ( new Date(data.aiPackages.package_end_time) > Date.now() && data.aiPackages.no_of_itineraries > 0) {
			itinerariesRemainingForPremium = data.aiPackages.no_of_itineraries;
            localStorage.setItem('packageOwnedId',  data.aiPackages.id);
            jQuery('.ai__premium-itineraryLeft').text("Itineraries Remaining:- " + itinerariesRemainingForPremium);
            jQuery('.ai__premium-timeLeft').text("Premium Expires In:- " + Math.floor((new Date(data.aiPackages.package_end_time) - Date.now()) / (1000 * 60 * 60)) + " hours");
            jQuery('.ai__premium-planName').text("Plan Name:- " + data.aiPackages.package);
            jQuery('.ai__premium_box').show();
		}
		else {
			localStorage.removeItem('packageOwnedId');
			itinerariesRemainingForPremium = 0;
			lastGenerated = data.lastAiCreatedAt.timeFromLastAiCreated ? data.lastAiCreatedAt.timeFromLastAiCreated : 0;
			isInMins = true;
		}
		count = data.totalItineraries;
	}
	
	// Checking for Normal Premium
	
	isPremium = data.verifiedDetails != null && data.verifiedDetails.length != 0 && data.verifiedDetails.length != undefined;
	
	if (isPremium == true) {
		// Check whether user can create the itinerary or not.
		
		// Get the package name 
		packageName = data.verifiedDetails[0].subscription_type;
		packageLimits = { '_mini': 2, '_pro': 6, '_super': 40, '_month': 6, '_year': 40, '_week': 2 };
        
        // Check if packageName includes any of the keys in packageLimits
        if (Object.keys(packageLimits).some(key => packageName.includes(key))) {
            // Find the corresponding key in packageLimits for the packageName
            limitKey = Object.keys(packageLimits).find(key => packageName.includes(key));
            allotedItineraries = packageLimits[limitKey];
            console.log(packageLimits[limitKey]);
        } 
        else {
            // Handle the case where packageName does not include any of the keys in packageLimits
            // This could be setting itinerariesRemainingForPremium to 0, throwing an error, etc.
            allotedItineraries = 2;
        }

		subscriptionEndTime = new Date(data.verifiedDetails[0].subscription_end_time);
		itinerariesCreated = Number(data.verifiedDetails[0].itineraries_created);

		itinerariesRemainingForPremium = subscriptionEndTime > Date.now() 
			? allotedItineraries - itinerariesCreated 
			: 0;
        // Get Itineraries left
		
		if (itinerariesRemainingForPremium <= 0) {
			// If Itineraries are left then show the countdown then hide timer else calculatae the count a/c to the totalItineraries
			lastGenerated = data.lastAiCreatedAt.timeFromLastAiCreated; 
			count = data.totalItineraries;
		}    
        else {
            jQuery('.ai__premium-itineraryLeft').text("Itineraries Remaining:- " + itinerariesRemainingForPremium);
            timeLeftInHours = Math.floor((subscriptionEndTime - Date.now()) / (1000 * 60 * 60));

            if (timeLeftInHours > 24) {
                timeLeftInDays = Math.floor(timeLeftInHours / 24);
                jQuery('.ai__premium-timeLeft').text("Premium Expires In:- " + timeLeftInDays + " days");
            } else {
                jQuery('.ai__premium-timeLeft').text("Premium Expires In:- " + timeLeftInHours + " hours");
            }
            jQuery('.ai__premium-planName').text("Plan Name:- " + packageName);
            jQuery('.ai__premium_box').show();
        }
		
	}
	
	// Check for Free User 
	if (!isAiPremium && !isPremium) {
		// User is a free User 
		// Get the count of Itineraries Craeated till now
		count = data.totalItineraries;
		lastGenerated = data.lastAiCreatedAt.timeFromLastAiCreated;
	}
	
    // Check if an itinerary has been generated before
    if (itinerariesRemainingForPremium <= 0 ) {
        // Calculate the difference in minutes between the current time and the last generation time
        
        if (isInMins || lastGenerated == 0) { // || lastGenerated == 0 Can be Ignored
            diff = lastGenerated;
        }
        else {
            diff = Math.floor((now - lastGenerated) / 60000); // This also can be removed as we are using the minutes from the last generated time 
        }
        if (diff < 0 ) { // This also can be removed as the diff will never be less than 0
            return;
        }

        // Determine the required cooldown period based on the number of itineraries generated so far
        
        if (count == 1) cooldown = 5; // If only one itinerary has been generated, the cooldown is 5 minutes
        
        else if (count >= 2 && count <= 4) cooldown = 5 + (count - 1) * 2; // If between 2 and 4 itineraries have been generated, the cooldown increases by 2 minutes for each additional itinerary
        
        else if (count >= 5 && count <= 9) cooldown = 11 + (count - 4) * 5; // If between 5 and 9 itineraries have been generated, the cooldown increases by 5 minutes for each additional itinerary
        
        else if (count >= 10) cooldown = 1440; // If 10 or more itineraries have been generated, the cooldown is 24 hours
        
        else cooldown = 0; // If no itineraries have been generated, there is no cooldown

        // If the difference between the current time and the last generation time is less than the cooldown period, alert the user and return without generating a new itinerary
        countdownElement = document.getElementById('countdown');
		aiBuddyChange = document.getElementById('ai_buddy_label');
        if (diff < cooldown) {
            remainingTime = (cooldown - diff) * 60; // Convert remaining time to seconds
            // Start a countdown
            countdownInterval = setInterval(() => {
				remainingTime--;

				hours = Math.floor(remainingTime / 3600);
				minutes = Math.floor((remainingTime % 3600) / 60);
				seconds = remainingTime % 60;

				countdownTimeString = hours > 0 ? `${hours} hours ${minutes} minutes ${seconds} seconds` : minutes > 0 ? `${minutes} minutes ${seconds} seconds` : `${seconds} seconds`;

				aiTimeString = hours > 0 ? `${hours} : ${minutes} : ${seconds} ` : minutes > 0 ? `${minutes} : ${seconds} ` : `${seconds} `;
							
                countdownElement.innerHTML = `You can plan a new Trip after ${countdownTimeString} or you can opt to buy premium for generating unlimited travel plans.While the timer is running you can seamlessly <a class="browse-app" href="" target="_blank">Browse the App</a>.`;

				aiBuddyChange.innerHTML = `${aiTimeString}`;
				
                jQuery('.search-location.travelMonth, .ai__search_container, .ai__trending').css('display', 'none');
                jQuery('.ai__premium').css('display', 'flex');
				
                if (jQuery('#lottiePremiumAi').length == 0 || jQuery('#lottiePremiumAi:empty').length > 0) {
                    loadLottieAnimation('lottiePremiumAi', '/view/assets/img/breakClock.json');
                }

                if (remainingTime <= 0) {
                    clearIntervalAndHidePremium();
                }
				
            }, 1000); // Update every second
            // Add class in .generateIti button
            jQuery('.generateIti').addClass('disabled').hide();
            jQuery('.ai__premium').css('display', 'flex');
            jQuery('#countdown').css('display', 'block');
        }
        else {
            jQuery('#countdown').hide();
            jQuery('.ai__premium').css('display', 'none');
        }
    }
    else {
        jQuery('#countdown').hide();
        jQuery('.ai__premium').css('display', 'none');
    }
}

function clearIntervalPremiumAi() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
}

function clearIntervalAndHidePremium() {
    clearIntervalPremiumAi();
    jQuery('#countdown').hide();
    // Add class in .generateIti button
    jQuery('.generateIti').removeClass('disabled').show();
    jQuery('.search-location.travelMonth').css('display', 'flex');
    jQuery('.ai__search_container, .ai__trending').css('display', 'block');
    jQuery('.ai__premium').css('display', 'none');
	jQuery('#ai_buddy_label').html('AI Buddy');
}

function renderAiItinerary ( response, state, extraData ) {
    clearInterval(intervalFadeText);
    console.log('renderAiItinerary', response, state, extraData);
    now = Date.now();
    jQuery('.itinerary-result').attr('data-lat', response[0].placeImage.lat).attr('data-lng', response[0].placeImage.lng);
    if (state == 'verified') {
        jQuery('.header__imageAI img').attr('src', response[0].placeImage.imageUrl);
    }
    else if (state == 'imageFromLocal') {
        jQuery('.header__imageAI img').attr('src', response[0].placeImage); // This will change--> the way of accessing the image
    }
    else {
        jQuery('.header__imageAI img').attr('src', response[0].placeImage.imageUrl);
    }
    response.forEach((dayData, index) => {
        dayNumber = index + 1;
        openClass =  'open' ; // dayNumber == 1 ? : ''
        firstDay = dayNumber == 1 ? 'firstDay' : '';
        experienceAnchor = dayNumber == 2 ? 'expAnchor' : dayNumber == 3 ? 'infAnchor' : '';
        weatherInfo = dayData.morning.weatherInfo ? dayData.morning.weatherInfo.charAt(0).toUpperCase() + dayData.morning.weatherInfo.slice(1) : '';
        timeToExploreAllInHours = dayData.timeToExploreAllInHoursWithUnits ? dayData.timeToExploreAllInHoursWithUnits.charAt(0).toUpperCase() + dayData.timeToExploreAllInHoursWithUnits.slice(1) : '';
        imageClass = 'itinerary-image-container ' + firstDay;
        itineraryItems = '';
        ['morning', 'afternoon', 'evening', 'night'].forEach(slot => {
            if (dayData[slot]) {
                itineraryItems += `<li style="background-image: url('${getIconUrl(dayData[slot].placeType)}');"><h4>${dayData[slot].place}</h4><p class="${openClass}">${dayData[slot].description}</p></li>`;
            }
        });
        try {
            if (itineraryItems ) {
                jQuery('#secondary .secondary__tab:last-child .drawerBody .itinerary-result').append(`<div class="daywise-itinerary ${experienceAnchor}"><div class="ai__cards-container"><div class="day-sequence"><div class="itinerary-image"><div class="${imageClass}"><img src="${dayData.placeImage.imageUrl ? dayData.placeImage.imageUrl : dayData.placeImage}" alt="image" onerror="aiImageErrorHandler(this);"><div class="day-number"><span>🏖️ Day ${dayNumber}</span></div></div></div><div class="itinerary-desc"><ul>${itineraryItems}</ul></div></div><div class="ai__footer-buttons"><div class="maps-button">${icons.temp_light}${weatherInfo}</div><div class="maps-button">${icons.time_light}${timeToExploreAllInHours}</div><div class="maps-button" onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(dayData.morning.place)}&waypoints=${encodeURIComponent(dayData.evening.place)}%7C${encodeURIComponent(dayData.night.place)}&destination=${encodeURIComponent(dayData.night.place)}', '_blank')">${icons.mapsIcon} Open Maps</div></div></div></div>`);
            }
        }
        catch{
            console.log('Error in rendering the Itinerary');
        }
    });
    jQuery('#secondary .secondary__tab:last-child .drawerBody .itinerary-result').append('<div class="footer__ai"><div class="enquire__now"><div id="lottie__request"></div>Request TravelBuddy to Plan my Trip</div><div class="find__buddies"><div id="lottie__find"></div>Invite the community to Join Your Trip</div></div>');
    jQuery('.daywise-itinerary.expAnchor').prepend('<div class="enquire__now betweenCards"><div id="lottie__requestCards"></div>Request TravelBuddy to Plan my Trip</div>');
    loadLottieAnimation('lottie__request', '/view/assets/img/support_animation.json');
    loadLottieAnimation('lottie__requestCards', '/view/assets/img/support_animation.json');
    loadLottieAnimation('lottie__find', '/view/assets/img/globe_animation.json');
    try {
        // After generating the itinerary, update 'lastGenerated' and 'totalGeneratedCount' in localStorage
        locationSelector = state != 'getUserItinerary' ? '#ai__search' : '.ai__location-header';
        locationValue = state != 'getUserItinerary' ? jQuery(locationSelector).val().split(',')[0] : jQuery(locationSelector).attr('data-location');
        jsInit('getExperiences', { filter: { location: locationValue } }, 'aiPage');
        fetchPosts(
            {
                feedsType: 'LOCATION',
                pageNumber: 0,
                location: locationValue,
                userId: manageUserProfile('read', 'userId'),
                locationLat: response[0].placeImage.lat,
                locationLng: response[0].placeImage.lng
            },
            '.daywise-itinerary.infAnchor',
            'findBuddiesAi'
        );
    } catch (error) {
        console.log('Error in storing User Itinerary', error);
    }
    function getIconUrl(placeType) {
        if (placeType != null) placeType = placeType.toLowerCase();
        iconUrl = '/view/assets/img/trekking_light.svg'; // default icon
        checkboxesData.forEach(item => {
            if (item.value.toLowerCase().includes(placeType) || item.type.includes(placeType)) {
                iconUrl = `/view/assets/img/${item.imgSrc}`;
            }
        });
        return iconUrl;
    }
    setTimeout(() => {
        jQuery('.global__loading').remove();
    },1000);
    jQuery('.itinerary-image-container.firstDay').remove();
}

// Start the Lottie Animation
function loadLottieAnimation(elementId, animationPath) {
    lottie.loadAnimation({
        container: document.getElementById(elementId),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animationPath
    });   
}

function getMonthName(monthNumber) {
    monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthName = monthNames[monthNumber - 1];
    return monthName;
}

function renderAllAiTrips(data, where) {
    if (where == 'allAiTrips') {
        envUrl = new URL(window.location.href);
        envBaseUrl = envUrl.protocol + "//" + envUrl.host + "/";
        

        data.userItineraries.forEach((itinerary, index) => {
            
            itineraryInfo = JSON.parse(itinerary.itinerary);
            
            jQuery('#secondary .secondary__tab:last-child .drawerBody').attr('data-page', '0');
            
            jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="allAI__trips"  data-id=" ' + itinerary.id + ' "><div class="allAI__trips_image"><img src="' + itineraryInfo[0].placeImage.imageUrl + '"></div><div class="allAI__trips_location">' + itinerary.destination + '</div><a href=" ' + envBaseUrl + 'ai-travel-plan-location-paxType-budgetType-month/' + itinerary.id + '" style="display: none;"></a></div>');
        });
        
        // Update the Url of the Window
        window.history.pushState({ page: 'allAiTrips' }, 'All AI Trips', '/allAiTrips');
    }
    
    jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="aiTrips__sentinel"></div>');    
    aiTrips__sentinel = document.querySelector('.aiTrips__sentinel');
        let observer;

        options = {
            root: document.querySelector('.secondary__tab'), // use the search__body as the viewport
            rootMargin: '0px',
            threshold: 0.1 // trigger when aiTrips__sentinel is fully visible
        };

        observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // aiTrips__sentinel is visible, log the event
                    console.log('aiTrips__sentinel is at the end of the scroll');
                    if (jQuery('.drawerBody .allAI__trips').length > 9 ) {
                    
                        pageNumber = 1 + Number(jQuery('.drawerBody').attr('data-page'));
                        
                        jsInit('getUserItineraries', { pageNumber: pageNumber });
                        
                        
                        jQuery('.drawerBody').attr('data-page', pageNumber);
                        
                        observer.unobserve(entry.target); // Stop observing the current aiTrips__sentinel
                        
                        // remove the current aiTrips__sentinel
                        entry.target.remove();
                    }
                }
            });
        }, options);

        observer.observe(aiTrips__sentinel); // Start observing the sentinel
    
    loaderMain('secondary', false);
    
    
}

function checkForDiscountBanner() {
    discountBanner = '';
    if (hostellerCouponCode != '') {
        discountBanner = `<div class="discount-banner" discount-code="${hostellerCouponCode}"><span class="discount-highlight blink">Get 15% Instant Discount</span><br> Use Coupon code:- <span class="coupon-code blink">${hostellerCouponCode}</span><div class="click-to-copy" style="position: absolute;right: 5px;bottom: 0px;font-size: 8px;/* margin-top: 9px; */">Click to Copy</div></div>`;
    }
    return discountBanner;
}


function renderAllHostellers(data, where, isSentinelCard) {
	if (isSentinelCard) {
        jQuery(where).append('<div class="feeds__sentinel__card"></div>');
	}
	return;
    discountBox = checkForDiscountBanner();

	jQuery(where).append('<div class="thirdParty__apis"><div class="titleHosteller">' + icons.lightning + 'Top Hostels Near You</div>' + discountBanner + '<div class="allHosteller"></div></div>');

	if (localStorage.getItem('getAllHostellers') == undefined || localStorage.getItem('getAllHostellers') == null || Date.now() - localStorage.getItem('getAllHostellers') > 86400000 ) {
		jsInit('getAllHostellers', {});
	}
	else {
		// get the data as array from indexed db
		getHostellersFromIndexedDb('allHostels', 'allHostelerData').then(function(data) {
			if (data) {
				renderHostellers('getAllHostellers', data);
			}
			else {
				jsInit('getAllHostellers', {});
			}
		});
	}
    
    if (isSentinelCard) {
        jQuery(where).append('<div class="feeds__sentinel__card"></div>');
    }
}

function renderNewHostellers(data, where, isSentinelCard) {
	if (isSentinelCard) {
        jQuery(where).append('<div class="feeds__sentinel__card"></div>');
	}
	return;
    discountBox = checkForDiscountBanner();
	jQuery(where).append('<div class="thirdParty__apis"><div class="titleHosteller">' + icons.lightning + 'IN THE SPOTLIGHT</div>' + discountBox + '<div class="newHosteller"></div></div>');

	if (localStorage.getItem('getNewHostellers') == undefined || localStorage.getItem('getNewHostellers') == null || Date.now() - localStorage.getItem('getNewHostellers') > 86400000 ) {
		jsInit('getNewHostellers', {});
	}
	else {
		// get the data as array from indexed db
		getHostellersFromIndexedDb('newHostels', 'newHostelerData').then(function(data) {
			if (data) {
				renderHostellers('getNewHostellers', data, true);
			}
			else {
				jsInit('getNewHostellers', {});
			}
			
		});
	}

}

function renderNearbyHostellers(data, where, isSentinelCard) {
	if (isSentinelCard) {
        jQuery(where).append('<div class="feeds__sentinel__card"></div>');
	}
	return;
    discountBox = checkForDiscountBanner();
	jQuery(where).append('<div class="thirdParty__apis"><div class="titleHosteller">' + icons.lightning + 'Nearby Hostels</div>' + discountBox +'<div class="nearbyHosteller"></div></div>');
    
    // get the data as array from indexed db
    getHostellersFromIndexedDb('allHostels', 'allHostelerData').then(function(data) {
		if (data) {
        	renderHostellers('getHostellersFromLocation', data);
		}
	});    
    if (isSentinelCard) {
        jQuery(where).append('<div class="feeds__sentinel__card"></div>');
    }
}

function renderHostellers(where, data, fromIndexedDb) {
    
    // Simplify conditional structure by mapping conditions to actions
    actionMap = {
        'getAllHostellers': { dataKey: 'data', parentDiv: '.allHosteller' },
        'getNewHostellers': { dataKey: 'hostels', parentDiv: '.newHosteller' },
    };

    if (where != 'getHostellersFromLocation') {
        // Extract the dataKey and parentDiv based on the 'where' condition to dynamically access data and update the UI
        ({ dataKey, parentDiv } = actionMap[where]);
        
        // If the New hostels data is coming from API then it's accessed with 'hostels' key 
        hostellerData = getNeareastLocations(dataKey === 'data' ? data : fromIndexedDb ? data : data.hostels, 'getHostellers');
    }
    else {
        hostellerData = getNeareastLocations(data, 'getHostellersFromLocation');
        parentDiv = '.nearbyHosteller';
    }
    
    hostellerData.forEach((hosteller, index) => {
        amenitiesArray = hosteller.amenities.slice(0,6);
        amenitiesHtml = amenitiesArray.map(amenity => {
            iconUrl = amenitiesIconsMapping[amenity]; // Use the mapping to get the icon URL
            if (iconUrl) {
                // If an icon URL exists, create an <img> tag
                return `<span class="amenity"><img src="${iconUrl}" alt="${amenity}" class="amenity-icon"></span>`;
            } else {
                // If no icon URL is found, just display the amenity name
                return ``;
            }
        }).join('');
        

        jQuery('.thirdParty__apis ' + parentDiv).append('<a href="'+hosteller.url+'" target="_blank" class="hosteller__card_link"><div class="hosteller__card swiper-slide"><div class="image-placeholder"></div><div class="hosteller__card_image"><img src="'+hosteller.imagePortraitCard +'"'+(index>1?' loading="lazy"':'')+' onload="imageLoaded(this)"><div class="hosteller__card_info"><span class="location_icon">' + icons.location + '</span><span class="hosteller__card_location">'+hosteller.city+'</span><span class="hosteller__card_rating">'+hosteller.rating+' ⭐</span></div><div class="hosteller__card_name">'+hosteller.name+'</div></div><div class="hosteller__card_amenities">'+amenitiesHtml+'</div><div class="hosteller__card_price">Starting @ <span class="hostellerPrice">'+ hosteller.basePrice + '</span> <span style="font-size: 13px;">/night</span></div></div></a>');
    });
}

function getNeareastLocations(data, from) {
    // Retrieve user's latitude and longitude from storage
    
    if (from != 'getHostellersFromLocation') {
        userLocation = getLatLongfromStorage();
        userLatitude = userLocation.latitude;
        userLongitude = userLocation.longitude;
    }
    else {
        userLatitude = jQuery('.feed__box.similar__plans').attr('data-lat');
        userLongitude = jQuery('.feed__box.similar__plans').attr('data-lng');
    }

    // Function to calculate distance between two points using the Haversine formula
    function calculateHaversineDistance(startLat, startLong, endLat, endLong) {
        earthRadiusKm = 6371; // Radius of the earth in km
        deltaLatitude = degreesToRadians(endLat - startLat);
        deltaLongitude = degreesToRadians(endLong - startLong);
        a = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
        Math.cos(degreesToRadians(startLat)) * Math.cos(degreesToRadians(endLat)) *
        Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2);
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = earthRadiusKm * c; // Distance in km
        return distance;
    }

    // Helper function to convert degrees to radians
    function degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Calculate and add distance from user to each location object
    data.forEach(locationObj => {
        locationObj.distanceFromUser = calculateHaversineDistance(userLatitude, userLongitude, locationObj.latitude, locationObj.longitude);
    });

    // Sort locations by their distance from the user
    data.sort((locationA, locationB) => locationA.distanceFromUser - locationB.distanceFromUser);

    // Select the top 15 nearest locations
    nearestLocations = data.slice(0, 15);

    return nearestLocations;
}

function imageLoaded(imgElement) {
  // Remove the shimmer effect placeholder
    placeholder = imgElement.previousElementSibling;
    
    if (placeholder && (placeholder.classList.contains('image-placeholder') || placeholder.classList.contains('image-placeholder-feeds'))) {
        placeholder.style.display = 'none';
    }
}


function renderManageListings(state, data, where) {
    
    if (state == 'init') {

		jQuery('#main').append('<div id="manageListingsPage" data-page="0"></div>');
        
        jQuery('#manageListingsPage').append(`
        <div class="tabs">
            <button class="tab" data-index="0">In Review</button>
            <button class="tab" data-index="1">Published</button>
            <button class="tab" data-index="2">Draft</button>
            <button class="tab" data-index="3">Deleted</button>
            <button class="tab" data-index="4">Decline</button>
            
        </div>
        `);
        
        // Loop through the tabNames array to append separate scrollable containers for each page
        tabNames.forEach((name, index) => {
            jQuery('#manageListingsPage').append(`<div class="content" id="content${name}" style="display: none; overflow-y: auto;"><div class="page" id="${name}"></div>
            </div>`);
        });
        
    }
    
    jQuery("#manageListingsPage").addClass("active");
    
} 

function removeActiveClassFromMain() {
    // Remove the 'active' class from all immediate child divs of the #main element
    // The > selector is used to select only immediate child divs
    jQuery('#main > div').removeClass('active');
}

function renderEmojis() {
    emojis = [
        "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆",
        "😉", "😊", "😋", "😎", "😍", "😘", "🥰", "😗",
        "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐",
        "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐",
        "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜",
        "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑",
        "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢",
        "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰",
        "😱", "🥵", "🥶", "😳", "🤪", "😵", "🤕", "🤢",
        "🤮", "🤧", "😷", "🤒", "🤠", "👽", "👾", "🤖",
        "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀",
        "😿", "😾", "👋", "🤚", "🖐", "✋", "🖖", "👌",
        "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉",
        "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊",
        "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
        "💅", "🤳", "💪", "🦾", "🦵", "🦿", "🦶", "👣",
        "👂", "🦻", "👃", "🧠", "🦷", "🦴", "👀", "👁",
        "👅", "👄", "💋", "🩸"
    ];

    emojisDiv = '<div id="emojiPicker">';
    emojis.forEach(emoji => {
        emojisDiv += `<div class="select__emoji">${emoji}</div>`;
    });
    emojisDiv += '</div>';

    return emojisDiv;
}

function getDayOfTravel(time) {
    // Convert time to 24-hour format using Date object
    let [hours, minutesPeriod] = time.split(':');
    let minutes = minutesPeriod.substring(0, 2);
    let period = minutesPeriod.substring(3);

    // Convert to 24-hour format
    if (period === 'PM' && hours !== '12') {
        hours = parseInt(hours) + 12;
    } else if (period === 'AM' && hours === '12') {
        hours = 0;
    }
    
    hours = parseInt(hours);

    // Determine the time period based on the hour
    if (hours >= 6 && hours < 12) {
        return 'morning';
    } else if (hours >= 12 && hours < 18) {
        return 'afternoon';
    } else if (hours >= 18 && hours < 24) {
        return 'evening';
    } else {
        return 'night';
    }
}

function calculateFinalPrice(fareData, fareBreakDown) {	
	var publishedFare = 0;
	
	var getAdultIndex = fareBreakDown.findIndex(fare => fare.PassengerType === 1);
	if (getAdultIndex !== -1) {
		var perAdultBaseFare = ( fareBreakDown[getAdultIndex].BaseFare + fareBreakDown[getAdultIndex].Tax) / fareBreakDown[getAdultIndex].PassengerCount;
		
		//var perAdultBaseFare = fareBreakDown[getAdultIndex].BaseFare / fareBreakDown[getAdultIndex].PassengerCount;
		
		publishedFare += perAdultBaseFare;
	}
	
	return Math.ceil(publishedFare);
}

function renderFlights(data, extraData, where) {
	/*if (extraData.searchFrom != 'head') {
		manageSecondary('show', 'flights');
	}*/
	
	jQuery('.global__loading').remove();
	
	traceId = data.Response.TraceId;

	jQuery('.flights__search').attr('data-trace-id', traceId);
	
	jQuery('.flights__search').attr('source-city-airport-name', jQuery('#sourceInput').parent().attr('city-name') + ' - ' + jQuery('#sourceInput').parent().attr('airport-name'));
	
	jQuery('.flights__search').attr('destination-city-airport-name', jQuery('#destinationInput').parent().attr('city-name') + ' - ' + jQuery('#destinationInput').parent().attr('airport-name'));
	
	totalPax = extraData.totalPax;

	cabinClass = extraData.cabinClass;

	if (extraData.sourceCountry != 'India' || extraData.destinationCountry != 'India') {
		jQuery('.flights__search').attr('international-flight', 'true');
	}
	// This will be true only for International Flights Round Trip flights
	if (data.Response.Results[0][0].Segments.length > 1) {
		jQuery('.flights__search').attr('international-round-trip', 'true');
	}


	if (extraData.searchFrom == 'head') {
		jQuery('.flights__search .flights__search__results-container').remove();
	} else {
		// Usage
		appendFlightHead(icons, extraData, totalPax, cabinClass);
		appendFlightsFilter(data, icons);
		appendFlightOptions();
	}

	jQuery('.flights__search').append(`<div class="flights__search__results-container"></div>`);
	
	let searchDate = data.Response.Results[0][0].Segments[0][0].Origin.DepTime.split('T')[0];
	
	jQuery('#flight__head-date').val(searchDate);

	minMaxDate('#flight__head-date');

	// Check if data for both onward and return journeys is present
	// In case of International flights, the data will be present in the data.Response[0].Segments[0] for OB journey and data.Response[0].Segments[1] for IB journey

	// This has to be added after Sample Verification -> || data.Response.Results[0].Segments.length > 1

	if (data.Response.Results.length > 1) {
		// Create tabs for Onward and Return flights
		tabsHtml = `<div class="flight__tabs">
            <div class="flight__tab onward" data-tab="0">Onward Journey</div>
            <div class="flight__tab return" data-tab="1">Return Journey</div>
        </div>`;
		jQuery('.flights__search .drawerHeader').after(tabsHtml);

		// Add click event listener to tabs
		jQuery('.flight__tab').on('click', function () {
			clearFlightsFilter();
			tabIndex = jQuery(this).data('tab');
			// For International Flights the Data is inside data.Response.Results[0].Segments[0] for Onward and data.Response.Results[0].Segments[1] for Return
			if (data.Response.Results[0].Segments && data.Response.Results[0].Segments.length > 1) {
				//
				if (tabIndex == 0) {
					displayFlights(data.Response.Results[0], 0);
				} else {
					displayFlights(data.Response.Results[0], 1);
				}
			} else {
				if (tabIndex == 0) {
					jQuery('.flights__search').removeAttr('data-return');
				}
				let title = `${icons.location}${tabIndex == 0 ? extraData.source : extraData.destination} - ${tabIndex == 0 ? extraData.destination : extraData.source}`;
				jQuery('.flight__title').html(title);
				displayFlights(data.Response.Results[tabIndex], tabIndex);
			}
			jQuery('.flight__tab').removeClass('active');
			jQuery(this).addClass('active');
		});
	}

	// Initially display Onward journey flights
	displayFlights(data.Response.Results[0], 0);
	jQuery('.flight__tab[data-tab="0"]').addClass('active');

	function displayFlights(flightsData, tabIndex, from) {
		// Clear existing flights
		jQuery('.flights__search .flight__card').each(function () {
			var $this = jQuery(this);
			$this.addClass('slide-left');
			setTimeout(function () {
				$this.remove();
			}, 700); // Match the duration of the CSS transition
		});
		bookNowClass = '';
		bookNowButton = 'Book Now';
		sourceTZ = jQuery('#sourceInput').parents('.airport__search-container').attr('timezone');
		destinationTZ = jQuery('#destinationInput').parents('.airport__search-container').attr('timezone');
				

		if (jQuery('.flight__tabs').length > 0) {
			bookNowButton = 'Select Flight';
			bookNowClass = 'select__flight';
		}
		
		console.log('Flights Data for rendering', flightsData);
		
		let searchFlightsData = flightsData;
		
		let groupedFlights = searchFlightsData.reduce((acc, flight) => {
			//let flightNumber = flight.Segments[0][0].Airline.FlightNumber; // Extract the FlightNumber
			let flightDetails = flight.Segments[0].map(segment => {
				// This uses optional chaining (?.) to safely access the
				let flightNumber = segment?.Airline?.FlightNumber || '';
				let originCode = segment?.Origin?.Airport?.AirportCode || '';
				let depTime = segment?.Origin?.DepTime || '';
				let destinationCode = segment?.Destination?.Airport?.AirportCode || '';
				let arrTime = segment?.Destination?.ArrTime || '';
				return `${flightNumber}-${originCode}-${depTime}-${destinationCode}-${arrTime}`;
			}).join(';'); // Extract the flight details and join them
			
			console.log('Flight Details', flightDetails);
			
			let baseFare = flight.Fare.BaseFare; // Extract the BaseFare
		
			if (!acc[flightDetails]) {
				acc[flightDetails] = [flight]; // Initialize with the current flight
			} else {
				// Insert into the group while ensuring the flight with the lowest BaseFare is at index 0
				let existingLowestFare = acc[flightDetails][0].Fare.BaseFare;
				if (baseFare < existingLowestFare) {
					acc[flightDetails].unshift(flight); // Place the current flight at index 0
				} else {
					acc[flightDetails].push(flight); // Add the flight to the end
				}
			}
		
			return acc;
		}, {});
		
		// Output the result
		console.log(groupedFlights);
		
		jQuery('.flights-count').text('Showing ' + Object.keys(groupedFlights).length  + ' Flights');

		Object.keys(groupedFlights).forEach(airlineNumber => {
			let flight = groupedFlights[airlineNumber][0]; // Get the 0th index flight
		//flightsData.forEach((flight, index) => {
			// Initialize variables for flight details
			let departure,
				arrival,
				departureCity,
				arrivalCity,
				airline,
				flightNumber,
				flightPrice,
				resultIndex,
				segmentsHtml = '';
			// Check if there are outbound and inbound flights
			// flight.Segments[0].length === 2 -> When the Flights have a Lay-over
			// flight.Segments[0][0].length === 2 or flight.Segments[0][1].length === 2 -> When the Flights have a Lay-over when we book Round Trip

			if (
				(flight.Segments.length === 2 || flight.Segments[0].length >= 2) &&
				jQuery('.flights__search').attr('international-round-trip') != 'true'
			) {
				// && jQuery('.flights__search').attr('international-round-trip') != 'true'
				// Handle outbound flight
				
				// Handle Round Trip domestic flights
				
				outbound = flight.Segments[0][0];
				inbound =
					flight.Segments[0].length >= 2
						? flight.Segments[0][flight.Segments[0].length - 1]
						: flight.Segments[1][0];

				// Total Fare
				flightPrice = calculateFinalPrice(flight.Fare, flight.FareBreakdown);// + ' (Base fare: ' + Math.round(flight.FareBreakdown[0].BaseFare) + ')';

				// Format departure and arrival times for both flights
				departureOutbound = formatDateAndTime(outbound.Origin.DepTime);
				arrivalOutbound = formatDateAndTime(outbound.Destination.ArrTime);
				departureInbound = formatDateAndTime(inbound.Origin.DepTime);
				arrivalInbound = formatDateAndTime(inbound.Destination.ArrTime);

				// Calculate time differences
				depDateOutbound = new Date(outbound.Origin.DepTime);
				arrDateOutbound = new Date(outbound.Destination.ArrTime);
				diffMsOutbound = arrDateOutbound - depDateOutbound;
				diffHoursOutbound = Math.floor(diffMsOutbound / (1000 * 60 * 60));
				diffMinutesOutbound = Math.floor((diffMsOutbound % (1000 * 60 * 60)) / (1000 * 60));
				//timeDifferenceOutbound = `${diffHoursOutbound} h ${diffMinutesOutbound} m`;
				timeDiffAccrTimeZone = getTimeDifferenceAccrossTimeZones(outbound.Origin.DepTime, outbound.Destination.ArrTime, sourceTZ, destinationTZ);
				timeDifferenceOutbound = timeDiffAccrTimeZone.hours + " h " + timeDiffAccrTimeZone.minutes + " m";

				depDateInbound = new Date(inbound.Origin.DepTime);
				arrDateInbound = new Date(inbound.Destination.ArrTime);
				diffMsInbound = arrDateInbound - depDateInbound;
				diffHoursInbound = Math.floor(diffMsInbound / (1000 * 60 * 60));
				diffMinutesInbound = Math.floor((diffMsInbound % (1000 * 60 * 60)) / (1000 * 60));
				//timeDifferenceInbound = `${diffHoursInbound} h ${diffMinutesInbound} m`;
				timeDiffAccrTimeZone = getTimeDifferenceAccrossTimeZones(inbound.Origin.DepTime, inbound.Destination.ArrTime, destinationTZ, sourceTZ);
				timeDifferenceInbound = timeDiffAccrTimeZone.hours + " h " + timeDiffAccrTimeZone.minutes + " m";

				// Calculate the layover times for each segment
				layoverTimes = [];
				totalLayoverTimeMs = 0;
				for (i = 0; i < flight.Segments[0].length - 1; i++) {
					// Starting from A we land at B
					// Arrival date at B and Departure date from B gives us the layover time

					arrivalDate = new Date(flight.Segments[0][i].Destination.ArrTime);
					departureDate = new Date(flight.Segments[0][i + 1].Origin.DepTime);
					layoverTimeMs = departureDate - arrivalDate;
					totalLayoverTimeMs += layoverTimeMs;
					// layoverHours = Math.floor(layoverTimeMs / (1000 * 60 * 60));
					// layoverMinutes = Math.floor((layoverTimeMs % (1000 * 60 * 60)) / (1000 * 60));
					//layoverTimes.push(`${layoverHours} h ${layoverMinutes} m`);
				}

				// Calculate the total layover time
				totalLayoverHours = Math.floor(totalLayoverTimeMs / (1000 * 60 * 60));
				totalLayoverMinutes = Math.floor((totalLayoverTimeMs % (1000 * 60 * 60)) / (1000 * 60));

				if (flight.Segments[0].length > 2) {
					totalLayoverTime = `${totalLayoverHours} h ${totalLayoverMinutes} m layover at multiple stops`;
				} else {
					totalLayoverTime = `${totalLayoverHours} h ${totalLayoverMinutes} m stop at ${flight.Segments[0][0].Destination.Airport.CityName}`;
				}

				// Calculate the total elapsed time from departure of outbound flight to arrival of inbound flight
				totalElapsedTimeMs = arrDateInbound - depDateOutbound;
				totalElapsedHours = Math.floor(totalElapsedTimeMs / (1000 * 60 * 60));
				totalElapsedMinutes = Math.floor((totalElapsedTimeMs % (1000 * 60 * 60)) / (1000 * 60));
				totalElapsedTime = `${totalElapsedHours} h ${totalElapsedMinutes} m`;

				// Construct segments HTML for both Outbound and Inbound
				flightIconOutbound = `/view/assets/img/AirlineLogo/${outbound.Airline.AirlineCode}.gif`;
				flightIconInbound = `/view/assets/img/AirlineLogo/${inbound.Airline.AirlineCode}.gif`;

				dayOfDepTravel = getDayOfTravel(departureOutbound);
				dayOfArrTravel = getDayOfTravel(arrivalInbound);
				segmentsHtml = `
                <div class="flight__details__container">
                    <div class="flight__details__icon">
                        <img src="${flightIconOutbound}" alt="Flight Image" class="flight__image">
                        <div class="flight__details__name">${outbound.Airline.AirlineName}</div>
                        <div class="flight__details__name aircode" airline-code='${outbound.Airline.AirlineCode}'>${outbound.Airline.AirlineCode} ${outbound.Airline.FlightNumber}</div>
                    </div>
                    <div class="flight__details__info">
                        <div class="flight__source_containier">
                            <div class="flight__details__dep-time" day_of_travel="${dayOfDepTravel}">${departureOutbound}</div>
                            <div class="flight__details__source">${outbound.Origin.Airport.CityName}</div>
                        </div>
                        <div class="flight__time_containier">
                            <div class="flight__details__time duration">${totalElapsedTime}</div>
                            <div class="underline"></div>
                            <div class="flight__details__time layover">${totalLayoverTime}</div>
                        </div>
                        <div class="flight__destination_containier">
                            <div class="flight__details__arr-time"  day_of_travel="${dayOfArrTravel}">${arrivalInbound}</div>
                            <div class="flight__details__destination">${inbound.Destination.Airport.CityName}</div>
                        </div>
                    </div>
                    <div class="flight__card__body">
                        <div class="flight__card__body__right">
                            <div class="flight__card__body__right__price" flight-price="${flightPrice}">₹ ${flightPrice}</div>
                            <div class="flight__card__body__right__pax">per adult</div>
                        </div>
                    </div>
                </div>
                `;
			} else if (
				jQuery('.flights__search').attr('international-round-trip') == 'true' &&
				flight.Segments.length === 2
			) {
				// Handle outbound flight
				// Handle Round Trip Intl flights
				outboundSegments = flight.Segments[0];
				inboundSegments = flight.Segments[1];

				outboundOrigin = outboundSegments[0];
				outboundDestination = outboundSegments[outboundSegments.length - 1];
				inboundOrigin = inboundSegments[0];
				inboundDestination = inboundSegments[inboundSegments.length - 1];

				// Total Fare
				flightPrice = calculateFinalPrice(flight.Fare, flight.FareBreakdown);//  + ' (Base fare: ' + Math.round(flight.FareBreakdown[0].BaseFare) + ')';

				// Format departure and arrival times for both flights
				departureOutbound = formatDateAndTime(outboundOrigin.Origin.DepTime);
				arrivalOutbound = formatDateAndTime(outboundDestination.Destination.ArrTime);
				departureInbound = formatDateAndTime(inboundOrigin.Origin.DepTime);
				arrivalInbound = formatDateAndTime(inboundDestination.Destination.ArrTime);

				// Calculate time differences for outbound flight
				depDateOutbound = new Date(outboundOrigin.Origin.DepTime);
				arrDateOutbound = new Date(outboundDestination.Destination.ArrTime);
				diffMsOutbound = arrDateOutbound - depDateOutbound;
				diffHoursOutbound = Math.floor(diffMsOutbound / (1000 * 60 * 60));
				diffMinutesOutbound = Math.floor((diffMsOutbound % (1000 * 60 * 60)) / (1000 * 60));
				//timeDifferenceOutbound = `${diffHoursOutbound} h ${diffMinutesOutbound} m`;
				timeDiffAccrTimeZone = getTimeDifferenceAccrossTimeZones(outboundOrigin.Origin.DepTime, outboundOrigin.Destination.ArrTime, sourceTZ, destinationTZ);
				timeDifferenceOutbound = timeDiffAccrTimeZone.hours + " h " + timeDiffAccrTimeZone.minutes + " m";

				// Calculate time differences for inbound flight
				depDateInbound = new Date(inboundOrigin.Origin.DepTime);
				arrDateInbound = new Date(inboundDestination.Destination.ArrTime);
				diffMsInbound = arrDateInbound - depDateInbound;
				diffHoursInbound = Math.floor(diffMsInbound / (1000 * 60 * 60));
				diffMinutesInbound = Math.floor((diffMsInbound % (1000 * 60 * 60)) / (1000 * 60));
				//timeDifferenceInbound = `${diffHoursInbound} h ${diffMinutesInbound} m`;
				timeDiffAccrTimeZone = getTimeDifferenceAccrossTimeZones(inboundOrigin.Origin.DepTime, inboundOrigin.Destination.ArrTime, destinationTZ, sourceTZ);
				timeDifferenceInbound = timeDiffAccrTimeZone.hours + " h " + timeDiffAccrTimeZone.minutes + " m";


				// Calculate the layover times and cities for outbound segments
				totalLayoverTimeMsOutbound = 0;
				outboundAirlineIcons = new Set();
				outboundLayoverCities = new Set();
				outboundAirlineIcons.add(outboundOrigin.Airline.AirlineCode);
				for (i = 0; i < outboundSegments.length - 1; i++) {
					arrivalDate = new Date(outboundSegments[i].Destination.ArrTime);
					departureDate = new Date(outboundSegments[i + 1].Origin.DepTime);
					layoverTimeMs = departureDate - arrivalDate;
					totalLayoverTimeMsOutbound += layoverTimeMs;
					outboundAirlineIcons.add(outboundSegments[i + 1].Airline.AirlineCode);
					outboundLayoverCities.add(outboundSegments[i].Destination.Airport.CityName);
				}

				// Calculate the layover times and cities for inbound segments
				totalLayoverTimeMsInbound = 0;
				inboundAirlineIcons = new Set();
				inboundLayoverCities = new Set();
				inboundAirlineIcons.add(inboundOrigin.Airline.AirlineCode);
				for (i = 0; i < inboundSegments.length - 1; i++) {
					arrivalDate = new Date(inboundSegments[i].Destination.ArrTime);
					departureDate = new Date(inboundSegments[i + 1].Origin.DepTime);
					layoverTimeMs = departureDate - arrivalDate;
					totalLayoverTimeMsInbound += layoverTimeMs;
					inboundAirlineIcons.add(inboundSegments[i + 1].Airline.AirlineCode);
					inboundLayoverCities.add(inboundSegments[i].Destination.Airport.CityName);
				}

				// Calculate the total layover time for outbound flight
				totalLayoverHoursOutbound = Math.floor(totalLayoverTimeMsOutbound / (1000 * 60 * 60));
				totalLayoverMinutesOutbound = Math.floor((totalLayoverTimeMsOutbound % (1000 * 60 * 60)) / (1000 * 60));
				totalLayoverTimeOutbound =
					totalLayoverTimeMsOutbound === 0
						? 'Direct'
						: `${totalLayoverHoursOutbound} h ${totalLayoverMinutesOutbound} m layover at ${
								outboundLayoverCities.size > 1
									? 'multiple stops'
									: Array.from(outboundLayoverCities).join(', ')
						  }`;

				// Calculate the total layover time for inbound flight
				totalLayoverHoursInbound = Math.floor(totalLayoverTimeMsInbound / (1000 * 60 * 60));
				totalLayoverMinutesInbound = Math.floor((totalLayoverTimeMsInbound % (1000 * 60 * 60)) / (1000 * 60));
				totalLayoverTimeInbound =
					totalLayoverTimeMsInbound === 0
						? 'Direct'
						: `${totalLayoverHoursInbound} h ${totalLayoverMinutesInbound} m layover at ${
								inboundLayoverCities.size > 1
									? 'multiple stops'
									: Array.from(inboundLayoverCities).join(', ')
						  }`;

				// Calculate the total elapsed time from departure of outbound flight to arrival of inbound flight
				totalElapsedTimeMs = arrDateInbound - depDateOutbound;
				totalElapsedHours = Math.floor(totalElapsedTimeMs / (1000 * 60 * 60));
				totalElapsedMinutes = Math.floor((totalElapsedTimeMs % (1000 * 60 * 60)) / (1000 * 60));
				totalElapsedTime = `${totalElapsedHours} h ${totalElapsedMinutes} m`;

				dayOfDepTravel = getDayOfTravel(departureOutbound);
				dayOfArrTravel = getDayOfTravel(arrivalOutbound);
				dayOfIbDepTravel = getDayOfTravel(departureInbound);
				dayOfIbArrTravel = getDayOfTravel(arrivalInbound);

				// Construct segments HTML for both Outbound and Inbound
				outboundAirlineIconsHtml = Array.from(outboundAirlineIcons)
					.map((code) => {
						airlineName = outboundSegments.find((segment) => segment.Airline.AirlineCode === code).Airline
							.AirlineName;
						
						airlineCode = outboundSegments.find((segment) => segment.Airline.AirlineCode === code).Airline
							.AirlineCode;
						
						airlineFlightNumber = outboundSegments.find((segment) => segment.Airline.AirlineCode === code).Airline
							.FlightNumber;	
						return `
                        <div class="flight__details__icon">
                            <img src="/view/assets/img/AirlineLogo/${code}.gif" alt="${airlineName} Image" class="flight__image" title="${airlineName}">
                            <div class="flight__details__name">${airlineName}</div>
							<div class="flight__details__name aircode" airline-code='${airlineCode}'>${airlineCode} ${airlineFlightNumber}</div>
                            
                        </div>`;
					})
					.join('');

				inboundAirlineIconsHtml = Array.from(inboundAirlineIcons)
					.map((code) => {
						airlineName = inboundSegments.find((segment) => segment.Airline.AirlineCode === code).Airline
							.AirlineName;
							airlineCode = inboundSegments.find((segment) => segment.Airline.AirlineCode === code).Airline
							.AirlineCode;
						
						airlineFlightNumber = inboundSegments.find((segment) => segment.Airline.AirlineCode === code).Airline
							.FlightNumber;	
						return `
                        <div class="flight__details__icon">
                            <img src="/view/assets/img/AirlineLogo/${code}.gif" alt="${airlineName} Image" class="flight__image" title="${airlineName}">
                            <div class="flight__details__name">${airlineName}</div>
							<div class="flight__details__name aircode" airline-code='${airlineCode}'>${airlineCode} ${airlineFlightNumber}</div>
                        </div>`;
					})
					.join('');

				segmentsHtml = `
                <div class="flight__details__container">
                        ${outboundAirlineIconsHtml}
                    <div class="flight__details__info">
                        <div class="flight__source_containier">
                            <div class="flight__details__dep-time" day_of_travel="${dayOfDepTravel}">${departureOutbound}</div>
                            <div class="flight__details__source">${outboundOrigin.Origin.Airport.CityName}</div>
                        </div>
                        <div class="flight__time_containier">
                            <div class="flight__details__time duration">${timeDifferenceOutbound}</div>
                            <div class="underline"></div>
                            <div class="flight__details__time layover">${totalLayoverTimeOutbound}</div>
                        </div>
                        <div class="flight__destination_containier">
                            <div class="flight__details__arr-time" day_of_travel="${dayOfArrTravel}">${arrivalOutbound}</div>
                            <div class="flight__details__destination">${outboundDestination.Destination.Airport.CityName}</div>
                        </div>
                    </div>
                </div>
                <div class="flight__details__container">
                        ${inboundAirlineIconsHtml}
                    <div class="flight__details__info">
                        <div class="flight__source_containier">
                            <div class="flight__details__dep-time" day_of_travel="${dayOfIbDepTravel}" >${departureInbound}</div>
                            <div class="flight__details__source">${inboundOrigin.Origin.Airport.CityName}</div>
                        </div>
                        <div class="flight__time_containier">
                            <div class="flight__details__time duration">${timeDifferenceInbound}</div>
                            <div class="underline"></div>
                            <div class="flight__details__time layover">${totalLayoverTimeInbound}</div>
                        </div>
                        <div class="flight__destination_containier">
                            <div class="flight__details__arr-time" day_of_travel="${dayOfIbArrTravel}">${arrivalInbound}</div>
                            <div class="flight__details__destination">${inboundDestination.Destination.Airport.CityName}</div>
                        </div>
                    </div>
                </div>
                <div class="flight__card__body">
                    <div class="flight__card__body__right">
                        <div class="flight__card__body__right__price" flight-price="${flightPrice}">₹ ${flightPrice}</div>
                        <div class="flight__card__body__right__pax">per adult</div>
                    </div>
                </div>
                `;
			}
				// One Way Flight Domestic & International & Round Trip International
			else {
				
				// One Way Flights
				
				flightPrice = calculateFinalPrice(flight.Fare, flight.FareBreakdown);//  + ' (Base fare: ' + Math.round(flight.FareBreakdown[0].BaseFare) + ')'; //Math.round(flight.FareBreakdown[0].BaseFare);
				// Handle single segment flight
				segment = flight.Segments[0][0];
				departure = formatDateAndTime(segment.Origin.DepTime);
				arrival = formatDateAndTime(segment.Destination.ArrTime);
				departureCity = segment.Origin.Airport.CityName;
				arrivalCity = segment.Destination.Airport.CityName;
				airline = segment.Airline.AirlineName;
				flightNumber = segment.Airline.FlightNumber;

				depTime = segment.Origin.DepTime;
				arrTime = segment.Destination.ArrTime;

				// Parse the time strings into Date objects
				depDate = new Date(depTime);
				arrDate = new Date(arrTime);

				// Calculate the difference in milliseconds
				diffMs = arrDate - depDate;

				// Convert the difference into hours and minutes
				diffHours = Math.floor(diffMs / (1000 * 60 * 60));
				diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

				// Output the formatted time difference
				timeDiffAccrTimeZone = getTimeDifferenceAccrossTimeZones(segment.Origin.DepTime, segment.Destination.ArrTime, sourceTZ, destinationTZ);
				timeDifference = timeDiffAccrTimeZone.hours + " h " + timeDiffAccrTimeZone.minutes + " m";
				//timeDifference = `${diffHours} h ${diffMinutes} m`;
				//console.log(timeDifference);

				// Construct segment HTML for single flight
				flightIcon = `/view/assets/img/AirlineLogo/${flight.AirlineCode}.gif`;

				dayOfDepTravel = getDayOfTravel(departure);
				dayOfArrTravel = getDayOfTravel(arrival);

				segmentsHtml = `
                <div class="flight__details__container">
                    <div class="flight__details__icon">
                        <img src="${flightIcon}" alt="Flight Image" class="flight__image">
                        <div class="flight__details__name">${segment.Airline.AirlineName}</div>
						<div class="flight__details__name aircode" airline-code='${segment.Airline.AirlineCode}'>${segment.Airline.AirlineCode} ${segment.Airline.FlightNumber}</div>
                    </div>
                    <div class="flight__details__info">
                        <div class="flight__source_containier">
                            <div class="flight__details__dep-time" day_of_travel="${dayOfDepTravel}">${departure}</div>
                            <div class="flight__details__source">${departureCity}</div>
                        </div>
                        <div class="flight__time_containier">
                            <div class="flight__details__time duration">${timeDifference}</div>
                            <div class="underline"></div>
                            <div class="flight__details__time layover">Direct</div>
                        </div>
                        <div class="flight__destination_containier">
                            <div class="flight__details__arr-time" day_of_travel="${dayOfArrTravel}">${arrival}</div>
                            <div class="flight__details__destination">${arrivalCity}</div>
                        </div>
                    </div>
                    <div class="flight__card__body"><div class="flight__card__body__right"><div class="flight__card__body__right__price" flight-price="${flightPrice}">₹ ${flightPrice}</div><div class="flight__card__body__right__pax">per adult</div></div></div>
                </div>`; // add before the closing div
			}

			// Common details for both single and double segment flights

			resultIndex = flight.ResultIndex;

			// Append flight card with conditional segments
			// Add the click on the entire card
			// Create the flight card element
			$flightCard =
				jQuery(`<div class="flight__card ${bookNowClass}" data-lcc="${flight.IsLCC}" data-result-index="${flight.ResultIndex}" flight-code="${flight.AirlineCode}">
                <div class="flight__card__header">${segmentsHtml}</div>
            </div>`);

			// Store the data using .data() method
			$flightCard.data('data-flight-all', JSON.stringify(flight));
			$flightCard.data('flight-fare-types', JSON.stringify(groupedFlights[airlineNumber]));
			
			//Cabin class (1 for All, 2 for Economy, 3 for PremiumEconomy, 4 for Business, 5 for PremiumBusiness, 6 for First)
			
			// To retrieve use this --> JSON.parse(jQuery('.flight__card').data('flight-fare-types'));

			// Append the element to the container with a slide effect
			jQuery('.flights__search .flights__search__results-container').append($flightCard);
		});
	}

	jQuery('.flights__search').attr('data-return', 'false');

	enableDropDownFlights();
	
	if (jQuery('.flight__tabs .flight__tab.onward').length > 0 || jQuery('.flights__search').attr('international-round-trip') == 'true') {
		jQuery('.flight__head .flight__head-right').remove();
	}
	
	// Displaying the Direct + Cheapest Flight by Default
	jQuery('#direct__lowest-fare-flight').click();
	
}

function renderFlightBookings(data, convCharges, where) {
	//jQuery('.flight__details__container.fare-types').prop('disabled', false);
	jQuery('.flight__card').prop('disabled', false);
	manageSecondary('show', 'flightsBooking');

	// Select and convert the values of each input field
	adultCount = Number(jQuery('#travelDetails-adults').val());
	childCount = Number(jQuery('#travelDetails-children').val());
	infantCount = Number(jQuery('#travelDetails-infants').val());

	function createPassengerInputs(count, type, isDobMandatory) {
		let inputs = '';
		for (let i = 0; i < count; i++) {
			let titleOptions = '';

			type = type.toLowerCase();

			if (type == 'infant' || type == 'child') {
				titleOptions = '<option value="Mstr">Master</option><option value="Ms">Miss</option>';
			} else {
				titleOptions =
					'<option value="Mr">Mr</option><option value="Mstr">Master</option><option value="Ms">Miss</option><option value="Mrs">Mrs</option>';
			}
			
			dobDiv = '';
			
			if (isDobMandatory) {
				
				// Get the travel date from the flight search form
				let travelDateStr = jQuery('#flight__head-date').val();
				// Fallback to current date if travel date is not available
				let travelDate = travelDateStr ? new Date(travelDateStr) : new Date();
				
				// Function to format date to YYYY-MM-DD
				function formatDate(date) {
					let year = date.getFullYear();
					let month = String(date.getMonth() + 1).padStart(2, '0');
					let day = String(date.getDate()).padStart(2, '0');
					return `${year}-${month}-${day}`;
				}
				
				// Calculate date ranges based on type (using travel date as reference)
				let minDate, maxDate;
				
				if (type == 'adult') {
					maxDate = new Date(travelDate.getFullYear() - 12, travelDate.getMonth(), travelDate.getDate());
					minDate = new Date(1900, 0, 1); // Assuming no one is older than 123 years
				}
				else if (type == 'child') {
					maxDate = new Date(travelDate.getFullYear() - 2, travelDate.getMonth(), travelDate.getDate());
					minDate = new Date(travelDate.getFullYear() - 11, travelDate.getMonth(), travelDate.getDate());
				}
				else if (type == 'infant') {
					maxDate = travelDate;
					// Infants must be under 2 years old, so born after (travelDate - 2 years)
					let twoYearsAgo = new Date(travelDate.getFullYear() - 2, travelDate.getMonth(), travelDate.getDate());
					twoYearsAgo.setDate(twoYearsAgo.getDate() + 1); // Add 1 day to ensure under 2 years
					minDate = twoYearsAgo;
				}
				
				// Create the date input with dynamic min and max attributes
				dobDiv = `<div class="date__selection">
				<div class="date__input">
				<label for="dob${i}">Date of Birth</label>
				<input type="date" class="dob__flights" id="${type}dob${i}" name="dob${i}" data-type="date" required
				min="${formatDate(minDate)}" max="${formatDate(maxDate)}">
				</div></div>`;
			}
				

			inputs += `
            <div class="passenger__info">
                <div class="pax__type-title">${type.toUpperCase()} ${i + 1}</div>
                <div class="input__container">
                    <div class="traveller-info__form">
                        <div class="traveller-info__gender-btns" id="${type}${i}">
                            <button type="button" class="gender-btn selected" data-gender="male" pax-type='${type}' onclick="setGender('${type}Gender${i}', 'male', this)">MALE</button>
                            <button type="button" class="gender-btn" pax-type='${type}' data-gender="female" onclick="setGender('${type}Gender${i}', 'female', this)">FEMALE</button>
                        </div>
                        <input type="hidden" id="${type}Gender${i}" name="${type}Gender${i}">
                        
                        <label for="${type}FirstName${i}">First & Middle Name</label>
                        <input type="text" id="${type}FirstName${i}" name="${type}FirstName${i}" placeholder="First & Middle Name" data-type="firstname" required>
                        
                        <label for="${type}LastName${i}">Last Name</label>
                        <input type="text" id="${type}LastName${i}" name="${type}LastName${i}" placeholder="Last Name" data-type="lastname" required>
						${dobDiv}
                        
                    </div>
                </div>
            </div>`;

			bookFlightFareDet = JSON.parse(
				jQuery('.flight-booking-details__view-details-button').data('data-flight-all')
			);

			bookFlightFareDet = bookFlightFareDet.allFlightData;

			if (jQuery('.flights__search').attr('international-flight') == 'true') {
				
				if (bookFlightFareDet.IsPassportRequiredAtBook == true && bookFlightFareDet.IsPassportFullDetailRequiredAtBook == true) {
					// If Full Passport Details are required at the time of booking
					inputs += `
                    <div class="passport__info">
                        <div class="passport__input">
                            <label for="${type}passportNumber${i}">Passport Number</label>
                            <input type="text" id="${type}passportNumber${i}" name="${type}passportNumber${i}" required>
                        </div>
                        <div class="passport__expiry">
                            <label for="${type}passportExpiry${i}">Passport Expiry Date</label>
                            <input type="date" id="${type}passportExpiry${i}" name="${type}passportExpiry${i}" required>
                        </div>
                        <div class="passport__issue-date">
                            <label for="${type}passportIssueDate${i}">Passport Issue Date</label>
                            <input type="date" id="${type}passportIssueDate${i}" name="${type}passportIssueDate${i}" required>
                        </div>
                        <div class="passport__issue-country">
                            <label for="${type}passportIssueCountryCode${i}">Passport Issue Country Code</label>
                        	<select id="${type}passportIssueCountryCode${i}" name="${type}passportIssueCountryCode${i}" required>
								<option value="IN">India</option>
							</select>
                        </div>
                    </div>`;
				}
				
				else if (bookFlightFareDet.IsPassportRequiredAtBook == true || bookFlightFareDet.AirlineCode  == 'AI' || bookFlightFareDet.AirlineCode  == 'SG') {
					// If Passport is required at the time of booking
					inputs += `
                    <div class="passport__info">
                        <div class="passport__input">
                            <label for="${type}passportNumber${i}">Passport Number</label>
                            <input type="text" id="${type}passportNumber${i}" name="${type}passportNumber${i}" required>
                        </div>
                        <div class="passport__expiry">
                            <label for="${type}passportExpiry${i}">Passport Expiry Date</label>
                            <input type="date" id="${type}passportExpiry${i}" name="${type}passportExpiry${i}" required>
                        </div>
                        <div class="passport__issue-date">
                            <label for="${type}passportIssueDate${i}">Passport Issue Date</label>
                            <input type="date" id="${type}passportIssueDate${i}" name="${type}passportIssueDate${i}" required>
                        </div>
                        <div class="passport__issue-country">
                            <label for="${type}passportIssueCountryCode${i}">Passport Issue Country Code</label>
                        	<select id="${type}passportIssueCountryCode${i}" name="${type}passportIssueCountryCode${i}" required>
								<option value="IN">India</option>
							</select>
                        </div>
                    </div>`;
				}
			}

			if (bookFlightFareDet.IsPanRequiredAtBook == true) {
				// If PAN is required at the time of booking
			}

			inputs += `</div></div>`;
		}
		return inputs;
	}

	// Appending the Header Section
	// Append the flight booking details element to the DOM
	
	let checkInBaggage = checkAndRenderBaggageForOb();

	$flightBookingDetails = jQuery(`
		<div class="flight-booking-details">
			<div class="flight-booking-details__header">
				<div class="flight-booking-details__header--title">
					<span class="flight__trip-to">Trip to</span>
					<h1>${data.arrCity}</h1>
				</div>
			</div>
			<div class="flight-booking-details__flight-info">
				<div class="flight-booking-details__flight-info-container">
					<img src="/view/assets/img/AirlineLogo/${data.airlineCode}.gif" alt="Airline Logo" class="flight-booking-details__flight-info--logo">
					<div>
						<p class="flight-booking-details__flight-info--route">${data.depCity} - ${data.arrCity}</p>
						<p class="flight-booking-details__flight-info--details">${formatDateForFlights(jQuery('#flight__head-date').length > 0 ? jQuery('#flight__head-date').val() : jQuery('#depDate').val())} | ${data.depTime} - ${data.arrTime} | ${data.duration}</p>
						<p class="flight-booking-details__flight-info--class">${jQuery('.pax__class-label').text()} | ${data.airlineNumber}</p>
					</div>
				</div>
				<div class="flight-booking-details__section">
					<div class="flight-booking-details__section--content">
						<div class="flight-booking-details__section--item">
							<div class="flight-booking-details__section--icon">${icons.handbag}</div>
							<div class="cabin__baggage">
								<p>Cabin bag</p>
								<p>${checkInBaggage.cabinBaggage}</p>
							</div>
						</div>
						<div class="flight-booking-details__section--item">
							<div class="flight-booking-details__section--icon">${icons.luggage}</div>
							<div class="cabin__baggage">
								<p>Check-in bag</p>
								<p>${checkInBaggage.checkInBaggage}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<button class="flight-booking-details__view-details-button">
				VIEW FLIGHT & FARE DETAILS
			</button>
			<div class="flight-booking-details__section cancellation">
				Cancellation Policy
				<div class="flight-booking-details__section--arrow">${icons.arrow_right}</div>
			</div>
			<div class="flight-booking-details__section insurance">
				<div class="flight-booking-details__section--header">
					<h2>Unsure of your travel plans?</h2>
					<div class="flight-booking-details__section--notification"></div>
				</div>
				<p class="flight-booking-details__section--subtitle">Select a service to add flexibility to your trip</p>
				<div class="flight-booking-details__section--price">
					<p>₹ 10,797 <span>i</span></p>
					<p>FOR 3 TRAVELLERS</p>
				</div>
				<button class="flight-booking-details__continue-button">CONTINUE</button>
			</div>
		</div>
	`);

	// Append the element to the container
	jQuery('.flights__booking').append($flightBookingDetails);
	
	if (guestMaster()) {
		jQuery('.flight-booking-details').css({
			position: 'relative'
		}).append(`
			<div class="background-overlay"></div>
		`);

		jQuery('.background-overlay').css({
			'background-image': 'url(/view/assets/img/cheap_flights.jpg)',
		});
		
	}
	else {
		jsInit('getPlacePhotos', { locationArray: [data.arrCity] }, 'flightsBooking');
	}

	// Prepend new content just before the flight-booking-details__view-details-button
	if (data.isReturn == true) {
		console.log('Return Flight', data.allFlightData);
		
		fareRulePayload = {
			TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
			ResultIndexOb: jQuery('.flights__search').attr('data-ob-result-index'), // This will change
			ResultIndexIb: jQuery('.flights__search').attr('data-ib-result-index'), // This will change
			isReturn: true
		};
		
		jsInit('tboFareRule', fareRulePayload, 'fareRuleRt' );

		obFlightData = data.allFlightData.flightDataForOb;
		ibFlightData = data.allFlightData.flightDataForIb;

		jQuery('.flight__trip-to').text('Round Trip to');


		jQuery('.flight-booking-details__view-details-button').before(`
			<div class="flight-booking-details__flight-info">
			<div class ="flight-booking-details__flight-info-container">
                <img src="/view/assets/img/AirlineLogo/${
					data.airlineCodeIb
				}.gif" alt="Airline Logo" class="flight-booking-details__flight-info--logo">
                <div>
                    <p class="flight-booking-details__flight-info--route">${data.arrCity} - ${data.depCity}</p>
                    <p class="flight-booking-details__flight-info--details">${formatDateForFlights(
						jQuery('#returnDate').val()
					)} | ${data.depTimeIb} - ${data.arrTimeIb} | ${data.durationIb}</p>
                    <p class="flight-booking-details__flight-info--class">${jQuery('.pax__class-label').text()} | ${data.airlineNumberIb}</p>
                </div>
				</div>
				<div class="flight-booking-details__section">
                <div class="flight-booking-details__section--content">
                    <div class="flight-booking-details__section--item">
                        <div class="flight-booking-details__section--icon"> ${icons.handbag} </div>
                        <div class="cabin__baggage">
                            <p>Cabin bag</p>
                            <p>${selFlightData.allFlightData.flightDataForIb.Segments[0][0].CabinBaggage}</p>
                        </div>
                    </div>
                    <div class="flight-booking-details__section--item">
                        <div class="flight-booking-details__section--icon"> ${icons.luggage} </div>
                        <div class="cabin__baggage">
                            <p>Check-in bag</p>
                            <p>${selFlightData.allFlightData.flightDataForIb.Segments[0][0].Baggage}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`);
	}
	else {
		fareRulePayload = {
			TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
			ResultIndex: jQuery('.flights__search').attr('data-result-index') // This will change
		};
		jsInit('tboFareRule', fareRulePayload, 'fareRuleOw');
	}

	// Store the data using .data() method
	$flightBookingDetails
		.find('.flight-booking-details__view-details-button')
		.data('data-flight-all', JSON.stringify(data));

	bookFlightFareDetails = data;

	let isDobMandatory = false;
	if ((jQuery('.flights__search').attr('international-flight') == 'true' || jQuery('.flights__search').attr('data-ob-is-lcc') == 'false') || jQuery('.flights__search').attr('data-ib-is-lcc') == 'false' || jQuery('.flights__search').attr('data-lcc') == 'false') {
		isDobMandatory = true;
	}
	
	// Append the form with dynamically generated passenger input fields
	jQuery('.flights__booking').append(`
		<form id="bookingForm" class="booking__form" data-lcc="false">
			<h2 class="pax__details-title">Traveller Details</h2>
			${createPassengerInputs(adultCount, 'Adult', isDobMandatory)}
			${createPassengerInputs(childCount, 'Child', true)}
			${createPassengerInputs(infantCount, 'Infant', true)}
			
			<!-- Flight Coupons -->
			<div class="flight__coupons-container">
				<div class="flight__coupons-header">
					<div class="flight__coupons-icon">
						<img src="/view/assets/img/promo-code.png" alt="Offer Icon">
					</div>
					<div class="flight__coupons-title">
						<h2>Offers & Promo Codes</h2>
						<p>To help you save more</p>
					</div>
					<div class="flight__coupons-arrow">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
							<path d="M0 0h24v24H0V0z" fill="none"/>
							<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
						</svg>
					</div>
				</div>
				<div class="flight__coupons-input">
					<input type="text" placeholder="Enter promo code here" id="promoCodeInput">
					<div class="flights__apply-coupon" id="applyCouponButton">APPLY</div>
				</div>
				<div class="flight__coupons-view">VIEW COUPONS</div>
			</div>
			<!-- Flight Total Bill -->
			<div class="bill-details__container">
				<div class="bill-details__heading">Bill details</div>
				<div class="bill-details__item">
					<div class="bill-details__item-left">
						<span class="flight__total_fare-title">Base Fare</span> 
					</div>
					<div class="bill-details__item-right">
						<span class="flights__bill-details">₹1697</span>
					</div>
				</div>
				<div class="bill-details__item">
					<div class="bill-details__item-left">
						<span class="flight__total_fare-title taxes">Airline Taxes and Surcharges</span>
					</div>
					<div class="bill-details__item-right">
						<span class="bill-details__taxes-surcharges">₹800</span>
					</div>
				</div>
				<div class="bill-details__item hide conv__charges">
					<div class="bill-details__item-left">
						<span class="flight__total_fare-title">Convenience Fee</span>
					</div>
					<div class="bill-details__item-right">
						<span class="bill-details__handling-charges" conv-charges='${convCharges}'>₹${convCharges}</span>
					</div>
				</div>
				<div class="bill-details__item promo_code hide">
					<div class="bill-details__item-left">
						<span class="flight__total_fare-title">Offer Discount</span>
					</div>
					<div class="bill-details__item-right">
						<span class="bill-details__savings-amount coupon"> - ₹250</span>
					</div>
				</div>
				<div class="bill-details__grand-total">
					<span>Grand total</span>
					<span class="bill-details__saved-tag hide">Saved ₹849</span>
					<span class="flights__final-amount">₹853</span>
				</div>
			</div>  
			<!-- Flight Contact Details -->
			<div class="contact__details">
				<div class="booking__sent-to">Booking Details will be sent to</div>
				<label for="email">Email</label>
				<input type="email" id="ticketing__email" name="email" required>
				<div class="editHanging__name flight__phone-container">
					<select name="editProfile__countryCode" id="flights__countryCode">
						<option value="+91"></option>
					</select>
					<span class="flights__phone-title">Phone</span>
					<input type="tel" id="ticketing__phone" name="phone" required>
				</div>
				<label for="address">Address</label>
				<input type="text" id="ticketing__address" name="address" required>
			</div>
			<!-- GST Details -->
			<div class="gst__checkbox">
				<label for="gstCheckbox">
					<input type="checkbox" id="gstCheckbox" name="gstCheckbox">
					I have GST Details (optional)
				</label>
			</div>
			<div id="gstContainer" style="display: none;">
				<!-- GST input fields will be appended here -->
			</div>
			<div id="markup-popup" style="display: none;">
				<div class="popup-overlay"></div>
				<div class="popup-box">
					<div class="popup-close" id="markup-close">&times;</div>
					<h3>Add Markup</h3>
					<input type="number" id="markup-amount" placeholder="Rs 0 - Rs 50000" min="0" max="50000" />
					<div id="markup-done">Done</div>
				</div>
			</div>
		</form>
	`);
	jQuery("#markup-close").on("click", function () {
		jQuery("#markup-popup").hide();
	});
	jQuery("#markup-done").on("click", function () {
		console.log("Done", jQuery('#markup-amount').val());
		jQuery("#markup-popup").hide();
		var curTax = jQuery('.bill-details__taxes-surcharges').text();
		var curTotal = jQuery('.flights__final-amount').text();
		curTotal = curTotal.replace('₹', '');
		curTotal = parseInt(curTotal);
		curTotal = curTotal + parseInt(jQuery('#markup-amount').val());
		// Remove the ₹ from the current price and convert it to a number
		curTax = curTax.replace('₹', '');
		curTax = parseInt(curTax);
		// Add the markup amount to the current price
		if (parseInt(jQuery('#markup-amount').val()) > 0) {
			curTax = curTax + parseInt(jQuery('#markup-amount').val());
		}
		else {
			return;
		}
		// Update the bill details
		jQuery('.bill-details__taxes-surcharges').text('₹' + curTax);
		jQuery('.flights__final-amount, .price').text('₹' + curTotal);
	});
	
	if (manageUserProfile("read", "userType") == "28") {
		jQuery("#markup-popup").show();
		jQuery('.flight__total_fare-title.taxes').text('Other Charges');
	}
	
	bookFlightFareDet = JSON.parse(jQuery('.flight-booking-details__view-details-button').data('data-flight-all'));
	
	if ((bookFlightFareDet.isReturn === true && 
		(bookFlightFareDet.allFlightData.flightDataForOb.IsGSTMandatory ||
		bookFlightFareDet.allFlightData.flightDataForIb.IsGSTMandatory)) || bookFlightFareDet.allFlightData.IsGSTMandatory) {
		// Keep the Checkbox as checked and can't be unchecked
		jQuery('#gstCheckbox').prop('checked', true).prop('disabled', true);
		showGstInputsPreFilled();
		jQuery('.gst__checkbox').text('GST Details (mandatory)');
	}
	
	
	
	// Function to add footer element to show price and continue button
	function appendFlightsFooter() {
		jQuery('#app').append(`
			<div class="flights__footer" id="flights__footer" conv-charges='${convCharges}'>
				<div class="flights__footer-content">
					<div class="flights__footer-price">
						<div class="price">Price</div>
						<div class="pax">1 adult</div>
					</div>
					<div class="flights__footer-continue ssr" current-stage = "paxDetails">Select Seats</div>
					<div class="flights__footer-continue skipSSR" current-stage = "reviewPaxDetails">Continue</div>
				</div>
			</div>`);
		jQuery('.flights__footer-continue.ssr').hide();
	}

	if (jQuery('#app').find('.flights__footer').length > 0) {
		jQuery('#flights__footer').remove();
	}
	
	appendFlightsFooter();
	
	if (!guestMaster()) {
		let couponCode = 'IND500';
		// Applying the Default TBNEW Coupon automatically
		if (manageUserProfile('read', 'isVerified') == true) {
			if (manageUserProfile('read', 'couponApplicable') != '' && manageUserProfile('read', 'couponApplicable') != null && manageUserProfile('read', 'couponApplicable') != undefined) {
				couponCode = manageUserProfile('read', 'couponApplicable');
			}
			else {
				couponCode = 'TBMINI';
			}
		}
		else if (manageUserProfile('read', 'userType') == '27') {
			couponCode = 'TBGRASSBERRY';
		}
		// else if (manageUserProfile('read', 'userType') == '28') {
		// 	couponCode = 'TBAGENT';
		// }
		jsInit('validateCoupon', {
			'couponCode': couponCode,
			'couponFor': 'flight',
			'noOfTickets': 1,
			'cartValue': jQuery('.bill-details__handling-charges').attr('conv-charges')
		}, 'preAppliedCoupon');
		// First we are calculating the Total Fare
	}
	convCharges = 0;
	showTotalFlightFare('', convCharges);
	
	// Call API to get the Country Codes for Dial Code
	jsInit('fetchCountries', '', 'flights-dial-code');
	
	let countriesInfo = filteredCountries = allAirports.map(country => ({
        country_code: country.country_code,
        country_name: country.country_name
    }));
    // Iterate over each select element inside passport__issue-country containers
    jQuery('.passport__issue-country select').each(function() {
        let selectElement = jQuery(this);
        // Clear existing options
        selectElement.empty();
        // Append new options
        countriesInfo.forEach((country) => {
            selectElement.append(`
                <option value="${country.country_code}">
                    ${country.country_name} (${country.country_code})
                </option>
            `);
        });
    });
	
	// Set the validations for Passport Expiry & Issue Date
	
	var dataFlight = JSON.parse(jQuery('.flight-booking-details__view-details-button').data('data-flight-all')).allFlightData;
	
	callMoengageEventsForFlights('selectedFlight', dataFlight);
	
	
	// Determine the minimum date based on the return status
	var minDate;
	
	// Checking if Domestic or Intl Roundtrip
	
	if (jQuery('.flights__search').attr('international-round-trip') == 'true') {
		minDate = dataFlight.Segments[dataFlight.Segments.length - 1][dataFlight.Segments[dataFlight.Segments.length - 1].length - 1].Destination.ArrTime.slice(0, 10);
		
		// Call the function to set the min attribute
		setMinDateForPassportInputs(minDate);
		
	} else if (jQuery('.flights__search').attr('international-international') == 'true') {
		minDate = dataFlight.Segments[0][dataFlight.Segments[0].length - 1].Destination.ArrTime.slice(0, 10);
		// Call the function to set the min attribute
		setMinDateForPassportInputs(minDate);
	}
	

	// Rendering the Width of the Footer as per the App width so that it stays perfect for all Screen sizes
	appDiv = document.getElementById('app');
	flightsFooter = document.getElementById('flights__footer');
  
	if (appDiv && flightsFooter) {
		flightsFooter.style.width = `${(appDiv.offsetWidth)}px`;
	}

	// After the User Enters the required details and clicks on the Book Flight Button then we have to Show the SSR for Meals, Baggage, etc.
}

function renderFlightSSR(data, state, where) {
	console.log(data);
	manageSecondary('show', 'flightSSR');
	//jQuery('.flights__booking').empty();
	nonDirectFlight = 'false';
	seatsLayout = '';
	if (
		data.return == 'true' ||
		(tboSSR.Response.SeatDynamic && (tboSSR.Response.SeatDynamic.length > 1 || tboSSR.Response.SeatDynamic[0].SegmentSeat.length > 1 )) // tboSSR.Response.SeatDynamic[0].SegmentSeat &&
		//tboSSR.Response.SeatDynamic[0].SegmentSeat.length > 1
	) {
		tabButton = '';
		generateTabButton = (segmentSeats, offset = 0, variableName) => {
			// This generated SSR for every Flight Segment ( 2 Flights in case of Non-Direct Journey but due to TBO limitations we are showing SSR for only 1 Flight)

			segmentSeats.forEach((segment, i) => {
				
				
			    segment.SegmentSeat.forEach((seats, i) => {
					let { Origin, Destination } = seats.RowSeats[0].Seats[0];
					
					variableName == 'tboSSROb'
					? `Flight ${Origin} - ${Destination}`
					: variableName == 'tboSSRIb'
					? `Flight ${Destination} - ${Origin}`
					: `Flight ${Origin} - ${Destination}`;
					
					let seatsData = JSON.stringify(seats);
					
					tabButton += `<div class="flights__ssr tabs" data-index="${i}" data-call-from="${variableName}" data-seats='${seatsData}'>Flight ${Origin} - ${Destination}</div>`;
				});
			});

		};

		if (data.return == 'true') {
			noData = 0;
			if (tboSSROb.Response.Error.ErrorCode == '0') {
				generateTabButton(tboSSROb.Response.SeatDynamic, 0, 'tboSSROb');
			} else {
				noData++;
			}
			if (tboSSRIb.Response.Error.ErrorCode == '0') {
				generateTabButton(tboSSRIb.Response.SeatDynamic, 0, 'tboSSRIb');
			} else {
				noData++;
			}
			if (noData == 2) {
				// Ask the User to Make the Payment, then Call Book & Ticket Api
				removeFlightsSSRPage();
				jQuery('.flights__footer-continue.skipSSR').click();
			}
		} else {
			if (tboSSR.Response.Error.ErrorCode == '0') {
				generateTabButton(tboSSR.Response.SeatDynamic, 'tboSSR');
			}
			else {
				// Ask the User to Make the Payment, then Call Book & Ticket Api

				removeFlightsSSRPage();
				jQuery('.flights__footer-continue.skipSSR').click();

			}
		}
		jQuery('.flights__SSRPage').append(`<div class="flights__ssr-container tabs">${tabButton}</div>`);
		jQuery('.flights__ssr-container.tabs').children().first().addClass('active');
	}
	// For LCC Flights & Non LCC Domestic the Seat will be inside SeatDynamic[], MealDynamic[],
	// For Non-LCC International Flights the Seat will be inside SeatPreference, Meal --> This also varies even if the Flight is LCC or Non-LCC. Epic
	if (data.return == 'true') {
		if (state == 'ob' && tboSSROb.Response.Error.ErrorCode == '0') {
			seatsLayout = generateSeatMap(tboSSROb.Response.SeatDynamic);
			ssrFor = 'ob';
		} else if (
			state == 'ob' &&
			tboSSRIb.Response.Error.ErrorCode == '0' &&
			(jQuery('.flights__booking').attr('ssr-complete-ib') == undefined ||
				jQuery('.flights__booking').attr('ssr-complete-ib') == 'false')
		) {
			seatsLayout = generateSeatMap(tboSSRIb.Response.SeatDynamic, 0);
			ssrFor = 'ib';
		} else if (state == 'ib' && tboSSRIb.Response.Error.ErrorCode == '0') {
			seatsLayout = generateSeatMap(tboSSRIb.Response.SeatDynamic, 0);
			ssrFor = 'ib';
		} else if (
			state == 'ib' &&
			tboSSROb.Response.Error.ErrorCode == '0' &&
			(jQuery('.flights__booking').attr('ssr-complete-ob') == undefined ||
				jQuery('.flights__booking').attr('ssr-complete-ob') == 'false')
		) {
			seatsLayout = generateSeatMap(tboSSROb.Response.SeatDynamic, 0);
			ssrFor = 'ob';
		} else {
			// Go to the Payments Page since there is no Seat Selection.
			// We can check for Meal Options, Baggage Options, etc., but skipping for now.
			ssrFor = 'ow';
			return;
		}
	} else {
		if (tboSSR.Response.Error.ErrorCode == '0') {
			seatsLayout = generateSeatMap(
				tboSSR.Response.SeatDynamic ? tboSSR.Response.SeatDynamic : tboSSR.Response.SeatPreference,
				0
			);
		}
		else {
			removeFlightsSSRPage();
			jQuery('.flights__footer-continue.skipSSR').click();
		}
		ssrFor = 'ow';
	}
	renderItem = '<div class="airplane"><div class="seats">' + seatsLayout + '</div>';
	tabsHtml = `<div class="flight__tabs ssr"><div class="flight__tab ssr-selection active" data-tab="0">Seats</div></div>`;
	// <div class="flight__tab ssr-selection" data-tab="1">Meals</div><div class="flight__tab ssr-selection" data-tab="2">Baggage</div>
	jQuery('.drawerBody.flights__SSRPage').append(tabsHtml);
	jQuery('.flights__SSRPage').append(`<div class="seat-legend">
        <div class="seat-label free-seat">Free</div>
        <div class="seat-label mid-range-seat">₹ 0-372</div>
        <div class="seat-label high-range-seat">₹ 373-1782</div>
        <div class="seat-label selected-seat">Selected</div>
		<div class="seat-label booked-seat">Booked</div>
    </div>`);
	jQuery('.flights__SSRPage').append(renderItem);
	//jQuery('.flights__SSRPage').append('<div class="book__from-ssr">Proceed</div>');
	// Add the status of the Seat Selection for Ob, Ib, Oneway
	jQuery('.flights__booking').attr('data-ssr', ssrFor);
	if (jQuery('.flights__booking').attr('ssr-complete-ob') == undefined && ssrFor != 'ow') {
		jQuery('.flights__booking').attr('ssr-complete-ob', 'false');
	}
	if (jQuery('.flights__booking').attr('ssr-complete-ib') == undefined && ssrFor != 'ow') {
		jQuery('.flights__booking').attr('ssr-complete-ib', 'false');
	}
	if (jQuery('.flights__booking').attr('ssr-complete-ow') == undefined && ssrFor == 'ow') {
		jQuery('.flights__booking').attr('ssr-complete-ow', 'false');
	}
	jQuery('.global__loading').remove();
}

function renderFlightTicketing(data, state, where) {
	//manageSecondary('show', 'flightTicketing');
	jQuery('.flights__booking').empty();

	if (Array.isArray(data)) {
		// Here we have to add a check so that we can map the indexes correctly when only Ib or Ob is supposed to be Booked while the other is already Ticketed
		data.forEach((flight, index) => {
			if (flight.Response.Error.ErrorCode != '0') {
				var errorMsg = flight.Response.Error.ErrorMessage + ' ' + (flight.Response.Error.RefundMessage ? flight.Response.Error.RefundMessage : '');
				managePopups('show', 'flightsErrorMessage', errorMsg);
				return;
			}
			flightData = flight.Response.Response;
			if (state == 'onlyObBooked') {
				passIndex = 0;
			} else if (state == 'onlyIbBooked') {
				passIndex = 1;
			} else {
				passIndex = index;
			}
			jQuery('.flights__booking').append(appendFlightTicketing(flightData, passIndex));
		});
		// flight__ticketing

		// Call Ticket for Ob then Ib

		// Both Ob and Ib are Booked
		if (state == 'obIbBooked') {
			pnr = jQuery('.flight__ticketing[data-flight-type="outbound"]').attr('data-pnr');
			bookingId = jQuery('.flight__ticketing[data-flight-type="outbound"]').attr('data-booking-id');
			dob = jQuery('.flight__ticketing[data-flight-type="outbound"]').attr('data-dob');

			ticketPayload = {
				PNR: pnr,
				BookingId: Number(bookingId),
				DateOfBirth: dob
			};

			jsInit('flightTicketing', ticketPayload, 'callTicketForIb');
		}
		else {
			// Ob is Ticketed Directly
			if (state == 'onlyIbBooked') {
				pnr = jQuery('.flight__ticketing[data-flight-type="inbound"]').attr('data-pnr');
				bookingId = jQuery('.flight__ticketing[data-flight-type="inbound"]').attr('data-booking-id');
				dob = jQuery('.flight__ticketing[data-flight-type="inbound"]').attr('data-dob');

				ticketPayload = {
					PNR: pnr,
					BookingId: Number(bookingId),
					DateOfBirth: dob,
					"isInBound": true
				};

				jsInit('flightTicketing', ticketPayload, 'obDirectlyTicketed');
			}
			// Ib is Ticketed Directly
			else {
				pnr = jQuery('.flight__ticketing[data-flight-type="outbound"]').attr('data-pnr');
				bookingId = jQuery('.flight__ticketing[data-flight-type="outbound"]').attr('data-booking-id');
				dob = jQuery('.flight__ticketing[data-flight-type="outbound"]').attr('data-dob');

				ticketPayload = {
					PNR: pnr,
					BookingId: Number(bookingId),
					DateOfBirth: dob
				};

				jsInit('flightTicketing', ticketPayload, 'ibDirectlyTicketed');
			}
		}
	} else {
		if (data.Response.Error.ErrorCode != '0') {
			var errorMsg = data.Response.Error.ErrorMessage + ' ' + (data.Response.Error.RefundMessage ? data.Response.Error.RefundMessage : '');
			managePopups('show', 'flightsErrorMessage', errorMsg);
			return;
		}
		data = data.Response.Response;

		jQuery('.flights__booking').append(appendFlightTicketing(data, 2));

		pnr = jQuery('.flight__ticketing').attr('data-pnr');
		bookingId = jQuery('.flight__ticketing').attr('data-booking-id');
		dob = jQuery('.flight__ticketing').attr('data-dob');

		ticketPayload = {
			PNR: pnr,
			BookingId: Number(bookingId),
			DateOfBirth: dob
		};

		// Responsible for both OneWay and International Flights

		jsInit('flightTicketing', ticketPayload, 'ow-international');
	}

	function appendFlightTicketing(data, index) {
		renderItem = '';

		flightType = index == 0 ? 'outbound' : index == 2 ? 'oneway' : 'inbound';

		renderItem =
			'<div class="flight__ticketing" data-pnr="' +
			data.PNR +
			'" data-booking-id="' +
			data.BookingId +
			'" data-dob="' +
			data.FlightItinerary.Passenger[0].DateOfBirth +
			'" data-flight-type="' +
			flightType +
			'">Book Now</div>';

		return renderItem;
	}
}

function renderFlightBooked(data, state, where) {
    jQuery('.flights__booking').empty();
    let pnrOb, pnrIb, bookingIdOb, bookingIdIb, dobOb, dobIb, firstName, lastName;
    if (Array.isArray(data)) {
        data.forEach((flight, index) => {
            if (flight.Response.Error.ErrorCode != '0') {
				var errorMsg = flight.Response.Error.ErrorMessage + ' ' + (flight.Response.Error.RefundMessage ? flight.Response.Error.RefundMessage : '');
                managePopups('show', 'flightsErrorMessage', errorMsg);
                return;
            }
            flightData = flight.Response.Response;
            firstName = flightData.FlightItinerary.Passenger[0].FirstName;
            lastName = flightData.FlightItinerary.Passenger[0].LastName;
            if (flightData.FlightItinerary.TripIndicator == 1) {
                pnrOb = flightData.PNR;
                bookingIdOb = flightData.BookingId;
            }
            else {
                pnrIb = flightData.PNR;
                bookingIdIb = flightData.BookingId;
            }
            jQuery('.flights__booking').append(appendFlightBooked(flightData, index));
        });
        let ticketOb = { PNR: pnrOb, BookingId: bookingIdOb, FirstName: firstName, LastName: lastName };
        let ticketIb = { PNR: pnrIb, BookingId: bookingIdIb, FirstName: firstName, LastName: lastName };
        ticketPayload = {
            Ob: ticketOb,
            Ib: ticketIb,
            isReturn: true,
        };
        console.log('ticketPayload-Round', ticketPayload);
    }
    else {
        if (data.Response.Error.ErrorCode != '0') {
			var errorMsg = data.Response.Error.ErrorMessage + ' ' + (data.Response.Error.RefundMessage ? data.Response.Error.RefundMessage : '');
            managePopups('show', 'flightsErrorMessage', errorMsg);
            return;
        }
		data = data.Response.Response;
		firstName = data.FlightItinerary.Passenger[0].FirstName;
        lastName = data.FlightItinerary.Passenger[0].LastName;
        jQuery('.flights__booking').append(
            '<div class="flight__booked" data-pnr="' +
                data.PNR +
                '" data-booking-id="' +
                data.BookingId +
                '">Get Ticket Details</div>'
        );
        ticketPayload = {
            PNR: data.PNR, BookingId: data.BookingId, FirstName: firstName, LastName: lastName
        };
        console.log('ticketPayload-Ow', ticketPayload);
    }
    jQuery('.hold__horses').text('Confirming your ticket.');
    jsInit('getBookingDetails', ticketPayload);
    function appendFlightBooked(data, index) {
        renderItem = '';
        console.log('data.FlightItinerary.TripIndicator', data.FlightItinerary.TripIndicator);
        if (!data.FlightItinerary){
            renderItem =
                '<div class="flight__booked" >Something went wrong' + data.Error.ErrorMessage + '</div>';
            return renderItem;
        }else{
            let flightType = data.FlightItinerary.TripIndicator == 1 ? '1' : '2';
            renderItem =
                '<div class="flight__booked" data-pnr="' +
                data.PNR +
                '" data-booking-id="' +
                data.BookingId +
                '" data-first-name="' +
                data.FlightItinerary.Passenger[0].FirstName +
                '" data-last-name="' +
                data.FlightItinerary.Passenger[0].LastName +
                '" data-flight-type="' + flightType + '" >Get Ticket Details</div>';
            return renderItem;
        }
    }
}

function renderFlightBookingDetails(data, state, where) {
	//manageSecondary('show', 'flightTicketing');
	//jQuery('.flights__booking').empty();
	if (data.Response.Error.ErrorCode != '0') {
		toast(data.Response.Error.ErrorMessage);
		return;
	}
	flightItinerary = data.Response.FlightItinerary;
	passengerDetails = flightItinerary.Passenger;
	pnr = flightItinerary.PNR;
	origin = flightItinerary.Origin;
	destination = flightItinerary.Destination;
	invoiceAmount = flightItinerary.Invoice[0].InvoiceAmount;
	segmentsData = flightItinerary.Segments;

	originTime = formatDateAndTime(segmentsData[0].Origin.DepTime);
	destinationTime = formatDateAndTime(segmentsData[segmentsData.length - 1].Destination.ArrTime);

	jQuery('.flights__booking').append(`
        <div class="flight__booking-details" data-pnr="${pnr}" data-booking-id="${data.BookingId}">
            <p><strong>PNR:</strong> ${pnr}</p>
            <p><strong>Origin:</strong> ${origin}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Invoice Amount:</strong> ${invoiceAmount}</p>
            <p><strong>Origin Time:</strong> ${originTime}</p>
            <p><strong>Destination Time:</strong> ${destinationTime}</p>
        </div>
    `);
	//jQuery('.flights__booking').append('<div class="flight__booking-details" data-pnr="'+ data.PNR +'" data-booking-id="'+ data.BookingId +'">Book Now</div>')
}

function generateDayOptions() {
	options = '';
	for (day = 1; day <= 31; day++) {
		options += `<option value="${day}">${day}</option>`;
	}
	return options;
}

function generateMonthOptions() {
	months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	options = '';
	months.forEach((month, index) => {
		options += `<option value="${index + 1}">${month}</option>`;
	});
	return options;
}

function generateYearOptions() {
	options = '';
	currentYear = new Date().getFullYear();
	for (year = currentYear; year >= 1900; year--) {
		options += `<option value="${year}">${year}</option>`;
	}
	return options;
}

function generateSeatMap(seatsData, index, isGlobal = false) {
	// For global seat map generation: generateSeatMap(seatsData, index, true);
	// When we are calling this function from the click of the SSR Tab, we have to remove the existing airplane and book__from-ssr and use the above function call.

	try {
		if (isGlobal) {
			jQuery('.flights__SSRPage .airplane').remove();
			jQuery('.seat-legend').remove();
			jQuery('.flight__tabs.ssr').remove();
			
		}

		htmlSeats = '';
		segmentIndex = index || 0;
		
		// Function to categorize seats based on price
		function categorizeSeat(price) {
			if (price === 0) {
				return 'free-seat';
			} else if (price > 0 && price <= 400) {
				return 'mid-range-seat';
			} else if (price >= 401) {
				return 'high-range-seat';
			}
			return '';
		}
		
		// Function to get grid column dynamically based on seat letter
		function getGridColumn(seatLetter) {
			let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			let position = alphabet.indexOf(seatLetter) + 1;
			return position <= 3 ? position : position + 1; // Skip column 4 for aisle
		}

		// We are starting from 1 since the 0th index has the seatType as Not Selected
		for (rowNo = 1; rowNo <= seatsData[0].SegmentSeat[segmentIndex].RowSeats.length - 1; rowNo++) {
			htmlSeats += '<div class="row__ssr">';
			seatInfo = {
				Description: seatsData[0].SegmentSeat[segmentIndex].RowSeats[rowNo].Seats[0].Description,
				SeatType: seatsData[0].SegmentSeat[segmentIndex].RowSeats[rowNo].Seats[0].SeatType,
				Currency: seatsData[0].SegmentSeat[segmentIndex].RowSeats[rowNo].Seats[0].Currency,
				Price: seatsData[0].SegmentSeat[segmentIndex].RowSeats[rowNo].Seats[0].Price,
				AvailablityType: seatsData[0].SegmentSeat[segmentIndex].RowSeats[rowNo].Seats[0].AvailablityType
			};

			rowSeats = seatsData[0].SegmentSeat[segmentIndex].RowSeats[rowNo].Seats.filter((seat) => seat.SeatNo);

			for (seatInfo of rowSeats) {
				seatLetter = seatInfo.SeatNo;
				//seatToGridColumn = { A: 1, B: 2, C: 3, D: 5, E: 6, F: 7 };
				gridColumn = getGridColumn(seatLetter);

				if (seatLetter === 'D') {
					htmlSeats += '<div class="aisle" style="grid-column: 4;"></div>';
				}

				isBooked = seatInfo.AvailablityType != '0' && seatInfo.AvailablityType != '1';
				bookedClass = isBooked ? 'booked' : '';
				
				// Determine additional classes for color coding
				let seatClass = bookedClass + ' ' + categorizeSeat(seatInfo.Price);

				htmlSeats += `<div class="seat  ${seatClass}"
                data-avail="${seatInfo.AvailablityType}" 
                data-seat-info='${JSON.stringify(seatInfo)}'>
                ${seatInfo.RowNo}${seatInfo.SeatNo}
                </div>`;
			}

			htmlSeats += '</div>'; // Close row
		}

		if (isGlobal) {
			renderItem = '<div class="airplane"><div class="seats">' + htmlSeats + '</div>';
			
			tabsHtml = `<div class="flight__tabs ssr"><div class="flight__tab ssr-selection active" data-tab="0">Seats</div></div>`;
			
			//<div class="flight__tab ssr-selection" data-tab="1">Meals</div><div class="flight__tab ssr-selection" data-tab="2">Baggage</div>
			
			jQuery('.drawerBody.flights__SSRPage').append(tabsHtml);
			
			jQuery('.flights__SSRPage').append(`<div class="seat-legend">
				<div class="seat-label free-seat">Free</div>
				<div class="seat-label mid-range-seat">₹ 0-372</div>
				<div class="seat-label high-range-seat">₹ 373-1782</div>
				<div class="seat-label selected-seat">Selected</div>
				<div class="seat-label booked-seat">Booked</div>
			</div>`);
			
			jQuery('.flights__SSRPage').append(renderItem);
			
			//jQuery('.flights__SSRPage').append('<div class="book__from-ssr">Book Now</div>');
		}

		return htmlSeats;
	} catch (error) {
		console.log('Error in generateSeatMap:', error);
		return '';
	}
}

function callBookOrTicketApi(from, data) {
	fbEvent('flightsBookings', data);
    fareBreakUpDetails = data.notes.extraInfo;
    fareBreakUpDetails.paymentId = data.id;
    fareBreakUpDetails.orderId = data.order_id;

	showFlightsLoaders('book');


    if (bookFlightPayload.return == 'true') {
        makeSSR('ob');
        makeSSR('ib');

        obBookPayload = {
            TraceId: bookFlightPayload.TraceId,
            ResultIndex: bookFlightPayload.ResultIndex[0].resultIndexOb,
            Passengers: bookFlightPayload.Passengers.ob
        };

        ibBookPayload = {
            TraceId: bookFlightPayload.TraceId,
            ResultIndex: bookFlightPayload.ResultIndex[1].resultIndexIb,
            Passengers: bookFlightPayload.Passengers.ib
        };

        if (bookFlightPayload.isLCC[0].isLCCOb && bookFlightPayload.isLCC[1].isLCCIb) {
            console.log('Ob, Ib Book Payload: LCC', obBookPayload, ibBookPayload);
            obBookPayload.fareBreakUp = fareBreakUpDetails;

            jsInit('flightTicketing', obBookPayload, 'callTicketForLCCIb');

        } else if (bookFlightPayload.isLCC[0].isLCCOb) {

            obBookPayload.fareBreakUp = fareBreakUpDetails;
            jsInit('flightTicketing', obBookPayload, 'callOnlyIbBook');

        } else if (bookFlightPayload.isLCC[1].isLCCIb) {
            console.log('Non-LCC Ob & LCC Ib API Call', obBookPayload);
            obBookPayload.fareBreakUp = fareBreakUpDetails;
            jsInit('bookFlight', obBookPayload, 'onlyObBooked');
        } else {
            console.log('Ob IB Non LCC Book API Call-', obBookPayload);

            obBookPayload.fareBreakUp = fareBreakUpDetails;
            jsInit('bookFlight', obBookPayload, 'callIbBook');

		}
		let moengagePayload = {
			obBookPayload,
			ibBookPayload
		};
		callMoengageEventsForFlights('TBD_FLIGHTS_ROUND_TRIP', moengagePayload);
        console.log('Ob, Ib Payload:', obBookPayload, ibBookPayload);
	}
	else {
        makeSSR('ow');

        owBookPayload = {
            TraceId: bookFlightPayload.TraceId,
            ResultIndex: bookFlightPayload.ResultIndex[0].resultIndexOw,
            Passengers: bookFlightPayload.Passengers.ow
		};
		owBookPayload.fareBreakUp = fareBreakUpDetails;
		if (bookFlightPayload.isLCC == true) {
			jsInit('flightTicketing', owBookPayload, 'callTicket');
			
		} else {
			
			jsInit('bookFlight', owBookPayload, 'callTicket');
			
		}
		//callMoengageEventsForFlights('TBD_FLIGHTS_ONE_WAY_BOOK', owBookPayload);
    }
}

function makeSSR(type) {
    let flightSSR = type === 'ob' ? tboSSROb : (type === 'ib' ? tboSSRIb : tboSSR);
    let passengers = bookFlightPayload.Passengers[type];
	let seatSelected = type === 'ob' ? seatSelectedOb : (type === 'ib' ? seatSelectedIb : seatSelectedOw);
	let mealSelected = type === 'ob' ? mealSelectedOb : (type === 'ib' ? mealSelectedIb : mealSelectedOw);

    if (flightSSR.Response.Error.ErrorCode != 0) {
        return;
    }

    function addNoBaggageNodeToPassengers(baggageResponse, passengers) {
        let noBaggageNode = baggageResponse.Response.Baggage[0].find(option => option.Code === "NoBaggage");
        console.log(noBaggageNode);

        passengers.forEach((seat, indexPassengers) => {
            if (indexPassengers === passengers.length) {
                return;
            }

            if (!passengers[indexPassengers].Baggage) {
                passengers[indexPassengers].Baggage = [];
            }

            passengers[indexPassengers].Baggage.push(noBaggageNode);
        });
    }

    let airlineCode = type === 'ib' ? selFlightData.airlineCodeIb : selFlightData.airlineCode;

    if (airlineCode == 'I5' || (isInternationalFlight() && bookFlightPayload.isLCC == 'true')) {
		addNoBaggageNodeToPassengers(flightSSR, passengers);
	}
	
	let checkInternal = jQuery('.flights__search').attr('international-flight') === 'true';

    passengers.forEach((seat, indexPassengers) => {
        if (indexPassengers === passengers.length) {
            return;
        }

        if (!bookFlightPayload.Passengers[type][indexPassengers].SeatDynamic) {
            passengers[indexPassengers].SeatDynamic = [];
		}
		
		if (seatSelected && seatSelected.length != 0) {

			passengers[indexPassengers].SeatDynamic.push(seatSelected[indexPassengers]);
			/*seatSelected.forEach((seatSelected) => {
				passengers[indexPassengers].SeatDynamic.push(seatSelected);
			});*/
		}
		
		// Meal Selection Addition
		// If International Flight then use Meal else use MealDynamic
		if (checkInternal) {
			if (mealSelected && mealSelected.length != 0) {
				// Making default node if its not there
				passengers[indexPassengers].Meal = bookFlightPayload.Passengers[type][indexPassengers].Meal || [];
				// Adding the selected Meal to the Passenger
				passengers[indexPassengers].Meal.push(mealSelected[indexPassengers]);
			}
		}
		else {
			
			if (mealSelected && mealSelected.length != 0) {
				// Making default node if its not there
				passengers[indexPassengers].MealDynamic = bookFlightPayload.Passengers[type][indexPassengers].MealDynamic || [];
				// Adding the selected Meal to the Passenger
				passengers[indexPassengers].MealDynamic.push(mealSelected[indexPassengers]);
			}
		}
		
		
    });
}

function renderFlightsFilter(flightsSearchResults) {
	manageSecondary('show', 'flightsFilter');

	var distAirlineCodes = [];
    let distinctAirlines = flightsSearchResults.reduce((acc, curr) => {
    curr.Segments[0].forEach(segment => {
        if (!acc.some(airline => airline.AirlineCode === segment.Airline.AirlineCode)) {
            if (distAirlineCodes.indexOf(segment.Airline.AirlineCode) == -1){
                distAirlineCodes.push(segment.Airline.AirlineCode);
                acc.push({ airlinecode: segment.Airline.AirlineCode, airlinename: segment.Airline.AirlineName });
            }
        }
    });
    return acc;
    }, []);

	function renderAirlineOptions(airlines) {
		let finalOptions = ''; // Clear existing content
		airlines.forEach(airline => {
			let airlineOption = `
				<div class="flights-filter__airline-option">
					<img src="/view/assets/img/AirlineLogo/${airline.airlinecode}.gif" alt="${airline.airlinename}">
					<span>${airline.airlinename}</span>
					<input type="checkbox" val="${airline.airlinecode}">
				</div>
			`;
			finalOptions += airlineOption;
		});
		return finalOptions;
	}

	jQuery('.flights__filter').append(`
        <div class="flights-filter__container">
            <div class="flights-filter__section">
                <div class="flights-filter__section-title">Stops</div>
                <div class="flights-filter__button-group">
                    <div class="flights-filter__button" stop="0">Non-stop<br>only</div>
                    <div class="flights-filter__button" stop="1">1 Stop</div>
                    <div class="flights-filter__button" stop="2">2+ stops</div>
                </div>
            </div>
            <div class="flights-filter__section hidden">
                <div class="flights-filter__toggle-option">
                    <p class="flights-filter__option-label">Show refundable only</p>
                    <label class="flights-filter__switch">
                        <input type="checkbox">
                        <span class="flights-filter__slider flights-filter__round"></span>
                    </label>
                </div>
            </div>
            <div class="flights-filter__section">
                <div class="flights-filter__button-group">
                    <div class="flights-filter__selection-button active" journey-type="dep">
                        <span>Departure</span>
                        ${icons.takeOff}
                    </div>
                    <div class="flights-filter__selection-button" journey-type="arr">
                        <span>Arrival</span>
                        ${icons.landing}
                    </div>
                </div>
            </div>
            <div class="flights-filter__section">
                <p class="flights-filter__airport-info">From ${jQuery('.drawerBody.flights__search').attr('source-city-airport-name')}</p>
                <div class="flights-filter__time-slots">
                    <div class="flights-filter__time-slot" time="morning">
                        <div class="morning__svg">${icons.morning_icon}</div>
                        <span>6 AM - 12 PM</span>
                    </div>
                    <div class="flights-filter__time-slot" time="afternoon">
                        <div class="afternoon__svg">${icons.afternoon_icon}</div>
                        <span>12PM - 6PM</span>
                    </div>
                    <div class="flights-filter__time-slot" time="evening">
                        <div class="evening__svg">${icons.evening_icon}</div>
                        <span>6 PM - 12AM</span>
                    </div>
                    <div class="flights-filter__time-slot" time="night">
                        <div class="night__svg">${icons.night_icon}</div>
                        <span>12 AM - 6 AM</span>
                    </div>
                </div>
            </div>
            <div class="flights-filter__section hidden">
                <div class="flights-filter__toggle-option">
                    <p class="flights-filter__option-label">Hide multi airline <i class="fas fa-suitcase"></i></p>
                    <label class="flights-filter__switch">
                        <input type="checkbox">
                        <span class="flights-filter__slider flights-filter__round"></span>
                    </label>
                </div>
                <p class="flights-filter__option-description">Flights where baggage needs to be rechecked-in at the layover.</p>
            </div>
            <div class="flights-filter__section">
                <h3 class="flights-filter__section-title">Airlines</h3>
                <div class="flights-filter__airline-options">
				${renderAirlineOptions(distinctAirlines)}
                </div>
            </div>
            <div class="flights-filter__section bottom-nav">
                <div class="flights-filter__button-group">
                    <div class="flights-filter__action-button flights-filter__reset">Reset</div>
                    <div class="flights-filter__action-button flights-filter__primary">Filter Flights</div>
                </div>
            </div>
        </div>
    `);
	
	// Existing Filters Pyload is stored in flightsFilterPayload
	
	if (jQuery('.flights-filter').attr('data-filter-applied') == 'true') {
		
		applyFilters(flightsFilterPayload);
		function applyFilters(filters) {
			// Parse the filters JSON object
			let { stops, journeyType, times, airlines } = filters;
		
			// Apply stop filters
			stops.forEach(stop => {
				jQuery(`.flights-filter__button[stop="${stop}"]`).addClass('active');
			});
			
			jQuery(`.flights-filter__selection-button[journey-type="${journeyType}"]`).addClass('active');
			
			// Apply time filters
			times.forEach(time => {
				jQuery(`.flights-filter__time-slot[time="${time}"]`).addClass('active');
			});
			
			// Apply airline filters
			airlines.forEach(airline => {
				jQuery(`.flights-filter__airline-option input[val="${airline}"]`).prop('checked', true);
			});
			
		}
	}
	
	// Handle clicks for .flights-filter__button
	jQuery('.flights-filter__button, .flights-filter__time-slot').on('click', function() {
		// Toggle active class for .flights-filter__button
		if (jQuery(this).hasClass('active')) {
			jQuery(this).removeClass('active');
		}
		else {
			
			jQuery(this).addClass('active');
		}
	});
	
	jQuery('.flights-filter__selection-button').on('click', function () {
		jQuery('.flights-filter__selection-button').removeClass('active');
		jQuery(this).addClass('active');
		
		if (jQuery(this).attr('journey-type') === 'dep') {
			var sourceCityAirportName = jQuery('.drawerBody.flights__search').attr('source-city-airport-name');
			jQuery('.flights-filter__airport-info').text('From ' + sourceCityAirportName);
		}
		
		else {
			var destinationCityAirportName = jQuery('.drawerBody.flights__search').attr('destination-city-airport-name');
			jQuery('.flights-filter__airport-info').text('At ' + destinationCityAirportName);
		}
		
	});
	
}

function renderViewFlight(data, from, bookedTicketData) {
	manageSecondary('show', 'viewFlights');
	jQuery('.flights__footer-continue').hide();
	//data.allFlightData.Segments
	jQuery('.flights__view').append(`
        <div class="flight-details__container">
            <div class="flight-details__header">
                <div class="flight-details__city-pair">
                    <span>${data.depCity}</span> <span class="flight-details__arrow">&rarr;</span> <span>${data.arrCity}</span>
                </div>
                <div class="flight-details__info">
                    ${data.duration} | Economy
                </div>
            </div>
            <div class="flight-details__body-container"></div>
        </div>
    `);

	// Function to generate flight details HTML
	function generateFlightDetailsHTML(flight, index, passedBookedTicketData) {
		
		let pnrDiv = '';
		if (passedBookedTicketData) {
			pnrDiv = `<div class="flight__details_header-logo pnr__flight">
			<span class="flight__pnr">PNR - ${passedBookedTicketData.FlightItinerary.PNR}</span></div>`;
		}
		
		return `
            <div class="flight-details__body">
                <div class="flight__details_header-logo">
                    <img src="/view/assets/img/AirlineLogo/${
						flight.Airline.AirlineCode
					}.gif" alt="${flight.Airline.AirlineCode} Logo">
                    <span>${flight.Airline.AirlineName} | ${flight.Airline.AirlineCode} ${flight.Airline.FlightNumber}</span>
                </div>
				${pnrDiv}
                <div class="flight-details__timings">
                    <div class="flight-details__departure">
                        <div class="flight-details__time">${formatDateAndTime(flight.Origin.DepTime)}</div>
                        <div class="flight-details__date">${formatDateForFlights(flight.Origin.DepTime)}</div>
                        <div class="flight-details__location">${flight.Origin.Airport.CityName}</div>
                        <div class="flight-details__airport">${flight.Origin.Airport.AirportName}</div>
                        <div class="flight-details__terminal">Terminal ${flight.Origin.Airport.Terminal}</div>
                        <div class="flight-details__checkin-baggage">Check In</div>
                        <div class="flight-details__checkin-kgs">15kgs</div>
                        <div class="flight-details__cabin-baggage">Cabin</div>
                        <div class="flight-details__cabin-kgs">7 kgs</div>
                    </div>
                    <div class="flight-details__duration">
                        <i class="fas fa-clock"></i>
                        <div>${convertMinutesToHours(flight.Duration)}</div>
                    </div>
                    <div class="flight-details__arrival">
                        <div class="flight-details__time">${formatDateAndTime(flight.Destination.ArrTime)}</div>
                        <div class="flight-details__date">${formatDateForFlights(flight.Destination.ArrTime)}</div>
                        <div class="flight-details__location">${flight.Destination.Airport.CityName}</div>
                        <div class="flight-details__airport">${flight.Destination.Airport.AirportName}</div>
                        <div class="flight-details__terminal">Terminal ${flight.Destination.Airport.Terminal}</div>
                    </div>
                </div>
                <div class="flight-details__services hidden">
                    <h2>Select Services</h2>
                    <div class="flight-details__service-option">
                        <input type="radio" id="saver-${index}" name="service">
                        <label for="saver-${index}">
                            <h3>Saver</h3>
                            <p>Fare offered by airline.</p>
                            <ul>
                                <li><i class="fas fa-suitcase"></i> Cabin bag <span>7 Kgs</span></li>
                                <li><i class="fas fa-suitcase-rolling"></i> Check-in <span>15 Kgs</span></li>
                                <li><i class="fas fa-rupee-sign"></i> Cancellation <span>Cancellation fee starting ₹ 2,999</span></li>
                            </ul>
                            <span class="flight-details__show-more">Show more <i class="fas fa-chevron-down"></i></span>
                        </label>
                        <span class="flight-details__price">₹ 3,599</span>
                    </div>
                    <div class="flight-details__discount">
                        <i class="fas fa-percent"></i> Get FLAT Rs. 1166 OFF using code MMTSUPER | FLAT 15% OFF on Kotak cards using code MMTKOTAKCC
                    </div>
                </div>
                <div class="flight-details__footer hidden">
                    <div class="flight-details__lock-price">
                        <i class="fas fa-lock"></i> Not sure? Lock this price!
                    </div>
                    <button class="flight-details__continue">CONTINUE</button>
                </div>
            </div>
        `;
	}

	// Function to calculate and display layover time
	function displayLayoverTime(flight, nextFlight) {
		let layoverStart = new Date(flight.Destination.ArrTime);
		let layoverEnd = new Date(nextFlight.Origin.DepTime);
		let layoverDuration = (layoverEnd - layoverStart) / (1000 * 60); // Convert milliseconds to minutes
		let layoverHours = Math.floor(layoverDuration / 60);
		let layoverMinutes = layoverDuration % 60;
		return `
            <div class="flight-details__layover">
                <div class="layover__city">Layover in ${flight.Destination.Airport.CityName} for ${layoverHours} h ${layoverMinutes} m</div>
            </div>
        `;
	}

	// Function to view flight details
	function viewFlightDetails(data, header, ticketData) {
		jQuery('.flight-details__body-container').append(`<div class="flight__type-header">${header}</div>`);
		data.forEach((flight, index) => {
			jQuery('.flight-details__body-container').append(generateFlightDetailsHTML(flight, index, ticketData ? ticketData : null));
			// Calculate and display layover time if there is a next flight
			if (index < data.length - 1) {
				let nextFlight = data[index + 1];
				jQuery('.flight-details__body-container').append(displayLayoverTime(flight, nextFlight));
			}
		});
	}

	// Main logic to handle different flight types
	if (data.isReturn == true) {
		console.log('Return Flight Data:', data.allFlightData);

		
		// For Domestic Round Trip Flights
		viewFlightDetails(data.allFlightData.flightDataForOb.Segments[0], 'Outbound Flight', bookedTicketData ? bookedTicketData.object.ob.Response : null);

		jQuery('.flight-details__body-container').append(`
        <div class="flight-details__header">
                <div class="flight-details__city-pair">
                    <span>${data.arrCity}</span> <span class="flight-details__arrow">&rarr;</span> <span>${data.depCity}</span>
                </div>
                <div class="flight-details__info">
                    ${data.duration} | Economy
                </div>
            </div>
        `);

		viewFlightDetails(data.allFlightData.flightDataForIb.Segments[0], 'Inbound Flight', bookedTicketData ? bookedTicketData.object.ib.Response : null);
	} 
	else {
		// For International Round Trip Flights
		if (data.allFlightData.Segments.length > 1) {
			viewFlightDetails(data.allFlightData.Segments[0], 'Outbound Flight', bookedTicketData ? bookedTicketData.object.ob.Response : null);

			jQuery('.flight-details__body-container').append(`
                <div class="flight-details__header">
                        <div class="flight-details__city-pair">
                            <span>${data.arrCity}</span> <span class="flight-details__arrow">&rarr;</span> <span>${data.depCity}</span>
                        </div>
                        <div class="flight-details__info">
                            ${data.duration} | Economy
                        </div>
                    </div>
                `);

			viewFlightDetails(data.allFlightData.Segments[1], 'Inbound Flight',  bookedTicketData ? bookedTicketData.object.ib.Response : null);
		}
		else {
			//bookedTicketData = bookedTicketData.object.Response;
			// For One Way Flights
			viewFlightDetails(data.allFlightData.Segments[0], 'Flight Details',  bookedTicketData ? bookedTicketData.object.Response : null);
        }
	}

	if (from == 'getBookingDetails') {
		
		jQuery('.flight__details_header-logo.pnr__flight').css('display', 'flex');
		jQuery('.flights__footer-continue').hide();
	}
}

function renderTravellerDetails() {
	manageSecondary('show', 'travellerDetails');

	jQuery('.traveller__details').append(`
        <form class="traveller-info__container">
            <div class="traveller-info__scan">
                <img src="scan-icon.svg" alt="Scan">
                <div>
                    <p>Scan to auto-fill this form!</p>
                    <p>Fetch details from your passport</p>
                </div>
                <button type="button" class="traveller-info__scan-btn">SCAN</button>
            </div>
    
            <div class="traveller-info__form">
                <div class="traveller-info__gender-btns">
                    <button type="button" class="gender-btn" data-gender="male">MALE</button>
                    <button type="button" class="gender-btn" data-gender="female">FEMALE</button>
                </div>
                <input type="hidden" id="traveller-info__gender" name="gender">
    
                <input type="text" id="traveller-info__first-name" name="firstName" placeholder="First & Middle Name">
                <input type="text" id="traveller-info__last-name" name="lastName" placeholder="Last Name">
    
                <p class="traveller-info__contact-header">Contact Information</p>
                <p>Add your contact information so that you can also directly receive booking details & other alerts.</p>
    
                <input type="email" id="traveller-info__email" name="email" placeholder="Email(Optional)">
    
                <div class="traveller-info__mobile">
                    <select name="countryCode">
                        <option value="+91">+91</option>
                    </select>
                    <input type="tel" name="mobile" placeholder="Mobile No(Optional)">
                </div>
    
                <div class="traveller-info__wheelchair">
                    <input type="checkbox" id="traveller-info__wheelchair-checkbox" name="wheelchair">
                    <label for="traveller-info__wheelchair-checkbox">I require wheelchair (Optional)</label>
                </div>
    
                <button type="submit" class="traveller-info__confirm-btn">CONFIRM</button>
            </div>
        </form>
    `);

	jQuery(document).on('click', '.gender-btn', function () {
		gender = jQuery(this).data('gender');
		jQuery('#traveller-info__gender').val(gender);
		jQuery('.gender-btn').removeClass('selected');
		jQuery(this).addClass('selected');
	});

	jQuery(document).on('submit', '.traveller-info__container', function (event) {
		event.preventDefault(); // Prevent the default form submission

		formData = {
			gender: jQuery('#traveller-info__gender').val(),
			firstName: jQuery('#traveller-info__first-name').val(),
			lastName: jQuery('#traveller-info__last-name').val(),
			email: jQuery('#traveller-info__email').val(),
			countryCode: jQuery('select[name="countryCode"]').val(),
			mobile: jQuery('input[name="mobile"]').val(),
			wheelchair: jQuery('#traveller-info__wheelchair-checkbox').is(':checked')
		};

		console.log(formData); // Output the form data to the console

		// Add your logic here to handle the form data, such as sending it to a server
	});
}

function renderFlightCouponCodesList(data) {
	drawer('open', false);
	jQuery('#main__drawer .drawerHeader').remove();
	jQuery('#main__drawer .drawerBody').append('<div class="flights__coupon"></div>');
	
	let flightsCouponData = data.list;
	
	jQuery('.flights__coupon').empty().append(`
        <div class="flight__coupon-container">
            <div class="flight__coupon-header">
                <img src="/view/assets/img/promo-code.png" alt="Gift Icon">
                <div class="flight__coupon-title">Apply Promo Code</div>
                <button class="flight__coupon-close">✕</button>
            </div>
            <div class="flight__coupon-list">
            </div>
        </div>
				`);
	
	flightsCouponData.forEach((coupon) => {
		jQuery('.flight__coupon-list').append(`
			<label class="flight__coupon-item">
				<input type="radio" name="flightsCoupon">
				<div class="flight__coupon-details" coupon-id=${coupon.couponid} discount-value=${coupon.discountvalue} coupon-code=${coupon.couponcode}>
					<div class="flight__coupon-code">${coupon.couponcode}</div>
					<div class="flight__coupon-description">
						${coupon.description}
						
					</div>
				</div>	
				<span class="flight__coupon-icon">💳</span>
			</label>
		`);
		
		
		
	});
	
	//<a href="#" class="flight__coupon-tnc">T&Cs apply</a>
}


function getExperiencesSearchView() {
	return `<div class="experiences__header-box hidden">
	
								<div class="experiences__header-subtitle">
									<h2>Community Powered Marketplace For Travelers</h2>
								</div>
								<div class="experiences__header-title">
									<h1>Travel Buddy Experiences</h1>
								</div>
								<div class="experiences__header-search">
									<div class="experiences__header-search-box">
										<form id="experiences__search">
											<input type="text" placeholder="Search for Local Experiences">
											<div class="experiences__header-search-btn">
												${icons.searchBar}
											</div>
										</form>
									</div>
									<div class="experiences__search-categories">
										<span class="filter_experience_category">
											${icons.experience_filter} Filter By:
										</span>
										<ul>
											<li class="filter__date__experiences">
												<span id="datePickerIcon" name="datetimes">
													${icons.experienceDate} Date
												</span>
												<input type="text" id="datePickerInput" style="display: none;"/>
											</li>
											<li id="price-filter">
												${icons.experiencePricing} Price Range
											</li>
											<div class="slider-wrapper price_range_wrapper" style="display: none;">
												<div class="options__menu-mask"></div>
												<div class="price-range">
													<header>
														<h2>Price Range</h2>
														<p>Use slider or enter min and max price</p>
													</header>
													<div class="price-input">
														<div class="field">
															<span>Min</span>
															<input type="number" class="input-min" value="99">
														</div>
														<div class="separator">-</div>
														<div class="field">
															<span>Max</span>
															<input type="number" class="input-max" value="5000">
														</div>
													</div>
													<div class="slider-filter">
														<div class="progress"></div>
													</div>
													<div class="range-input">
														<input type="range" class="range-min" min="0" max="200000" value="99" step="500">
														<input type="range" class="range-max" min="0" max="200000" value="10000" step="500">
													</div>
													<div class="apply-btn">
														<button id="cancel-filter-applied">Cancel</button>
														<button id="applyPriceFilterBtn">Apply</button>
														<div id="appliedPriceRange"></div>
													</div>
												</div>
											</div>
											<li class="select_category">
												${icons.experienceCategory} Category
											</li>
											<div class="filter-list-container-wrapper" style="display: none;">
												<div class="filter-list-container">
													<div class="options__menu-mask"></div>
													<div class="filter-list-masked">
														<div class="cancel-categories">
															<h2>Select Category</h2>
															<div id="cancel-filter-categories">
																${icons.close}
															</div>
														</div>
														<ul class="filter__select__list">
															<li>Backpacking</li>
															<li>Adventure Travel</li>
															<li>Cultural Tourism</li>
															<li>Family</li>
															<li>Mountaineering</li>
															<li>Beach</li>
															<li>Kayaking</li>
															<li>Religious Tourism</li>
															<li>City Tours</li>
															<li>Trekking</li>
															<li>Historical Tourism</li>
															<li>Biking Tours</li>
															<li>Heritage Walks</li>
															<li>Waterfalls</li>
															<li>Meet Ups</li>
															<li>Homestay</li>
															<li>Offroading</li>
															<li>Jungle Safaris</li>
															<li>Arts and Crafts</li>
															<li>Pub Crawling</li>
															<li>Water Sports</li>
															<li>Shopping</li>
															<li>Events and Exhibitions</li>
															<li>Diving</li>
															<li>Sustainable Living</li>
															<li>Health and Fitness</li>
															<li>Winter Sports</li>
															<li>Caving</li>
														</ul>
													</div>
												</div>
											</div>
										</ul>
									</div>
								</div>
							</div>`;
}

function getFlightsSearchView(from) {
	let toggleMenu = '';
	
	var groupTripsHtml = '';
	var getTestersEmail = returnTestersEmail();
	//if (getTestersEmail.includes(manageUserProfile('read', 'email'))) {
	//groupTripsHtml = `<label><input type="radio" name="searchToggle" value="4">Group Trips</label>`;
	groupTripsHtml = `<label><input type="radio" name="searchToggle" value="5">Plan Trip</label>`;
	//}
    if (from == 'experiences') {
        toggleMenu = `<div class="booking-option experiencesToggle">
                            <label class="checked"><input type="radio" name="searchToggle" value="1">Flights</label>
							<label class=""><input type="radio" name="searchToggle" value="2">Hotels</label>
							${groupTripsHtml}
                            <label><input type="radio" name="searchToggle" value="3">Packages</label>
                        </div>`;
    }
    return `<div class="flights__header-box">
                        ${toggleMenu}
                        <div class="flights__header-subtitle">Book your flights and turn your dreams into real-life adventures.</div>
                        <form id="flightSearchForm">
                            <div class="flights__booking-container">
                                <div class="booking-option flightsSearch">
                                    <label><input type="radio" name="flightType" value="1" id="one__way-flight" checked>One Way</label>
                                    <label><input type="radio" name="flightType" value="2">Round Trip</label>
                                    <label class="hidden"><input type="radio" name="flightType" value="3">Multi-City</label>
                                </div>
                                <div class="from__to-box source-dest">
                                    <div class="location__selection source-dest">
                                        <div class="icon__box">${icons.takeOff}</div>
                                        <div class="airport__search-container">
                                            <label class="location__label" for="sourceInput">From</label>
                                            <input type="text" placeholder="New Delhi" id="sourceInput" class="flights__input" autocomplete="off">
                                            <div id="sourceDropdown" class="dropdown__airports-list"></div>
                                        </div>
                                    </div>
                                    <div class="reverse__from-to">${icons.reverseIcon}</div>
                                    <div class="location__selection source-dest">
                                        <div class="icon__box">${icons.landing}</div>
                                        <div class="airport__search-container">
                                            <label class="location__label" for="destinationInput">To</label>
                                            <input type="text" placeholder="Mumbai" id="destinationInput" class="flights__input" autocomplete="off">
                                            <div id="destinationDropdown" class="dropdown__airports-list"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="from__to-box">
                                    <div class="location__selection departDate" id="departDate">
                                        <div class="icon__box">${icons.experienceDate}</div>
                                        <div class="text__box">
                                            <label class="location__label" for="depDate">Departure Date</label>
                                            <input type="text" placeholder="1/12/2024" id="depDate" class="flights__input">
											<div class="date__text-dep">Depart Date</div>
                                        </div>
                                    </div>
                                    <div class="location__selection returningDate" id= "returningDate">
                                        <div class="icon__box">${icons.experienceDate}</div>
                                        <div class="text__box">
                                            <label class="location__label" for="returnDate">Returning Date</label>
                                            <input type="text" placeholder="5/12/2024" id="returnDate" class="flights__input">
											<div class="date__text-return adjust__font-size">Tap to add a return date for bigger discounts</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="booking-select-button">
                                    ${icons.person}
                                    <span class="pax__class-label">1 Traveller | Economy</span>
                                    <input type="hidden" id="travelDetails-adults" value="1">
                                    <input type="hidden" id="travelDetails-children" value="0">
                                    <input type="hidden" id="travelDetails-infants" value="0">
                                    <input type="hidden" id="travelDetails-cabin" value="2">
                                </div>
                                <div class="search__flight">Search Flights</div>
                            </div>
                        </form>
                </div>`;
}

function getHostelsView() {
	//return;
	return `<div class="hostels__header-box">
				<div class="hotels__header-subtitle">Book your Hotels at the cheapest rates.</div>
				<form id="hotelsSearchForm">
					<div class="hotels__booking-container">
						<div class="from__to-box source-dest">
							<div class="location__selection source-dest">
								<div class="icon__box">${icons.takeOff}</div>
								<div class="hotel__search-container">
									<label class="location__label" for="hotelSourceInput">City, Property name or Location</label>
									<input type="text" placeholder="New Delhi" id="hotelSourceInput" class="flights__input" autocomplete="off">
									<div id="cityDropdown" class="dropdown__airports-list"></div>
								</div>
							</div>
						</div>
						<div class="from__to-box">
							<div class="location__selection" id="checkInDate">
								<div class="icon__box">${icons.experienceDate}</div>
								<div class="text__box">
									<label class="location__label" for="depDate">Check-In</label>
									<input type="text" placeholder="1/12/2024" id="check-in" class="flights__input">
									<div class="check__in-text">Check In</div>
								</div>
							</div>
							<div class="location__selection check__out-date" id="checkOutDate">
								<div class="icon__box">${icons.experienceDate}</div>
								<div class="text__box">
									<label class="location__label" for="returnDate">Check-Out</label>
									<input type="text" placeholder="5/12/2024" id="check-out" class="flights__input">
									<div class="check__out-text">Tap to add a return date for bigger discounts</div>
								</div>
							</div>
						</div>
						<div class="hotel__booking-select-button">
							${icons.person}
							<span class="pax__class-label">1 Room | 2 Adults</span>
							<input type="hidden" id="hotel-travelDetails-adults" value="1">
							<input type="hidden" id="hotel-travelDetails-children" value="0">
						</div>
						<div class="search__hotels">Search Hotels</div>
					</div>
				</form>
			</div>`;

}

function checkAndRenderBaggageForOb() {
	if (jQuery('.flights__search').attr('data-return') == 'true') {
		
		return {
			checkInBaggage: selFlightData.allFlightData.flightDataForOb.Segments[0][0].Baggage,
			cabinBaggage: selFlightData.allFlightData.flightDataForOb.Segments[0][0].CabinBaggage
		}
		
	}
	else {
		return {
			checkInBaggage: selFlightData.allFlightData.Segments[0][0].Baggage,
			cabinBaggage: selFlightData.allFlightData.Segments[0][0].CabinBaggage
		}
	}

}

function appendFlightHead(icons, extraData, totalPax, cabinClass) {
	jQuery('.flights__search').append(`
		<div class="drawerHeader"><a class="drawer__back">${icons.back}</a><div class="drawerTitle"><span class="highlight">Flights Search Results</span></div></div>
		<div class="flight__head">
			<div class="flight__head-left">
				<div class="flight__title">
					${icons.location}${extraData.source} - ${extraData.destination}
				</div>
				<div class="flight__pax-title">
					${icons.anyGender}${totalPax} | ${cabinClass}
				</div>
			</div>
			<div class="flight__head-right">
				<div class="flight__date-change">
					<div class="location__selection search-date-change">
						<div class="flight__text__box">
							${icons.experienceDate}
							<input type="date" placeholder="5/12/2024" id="flight__head-date" class="flights__input" min="2024-08-12" value="">
						</div>
					</div>
				</div>
			</div>
		</div>
	`);
}

function appendFlightsFilter(data, icons) {
	jQuery('.flights__search').append(`
		<div class="flights-filter-container">
			<div class="flights-filter">
				<div class="flights__filter-container">
					${icons.filter}
				</div>
				<div class="filterBy-container">
					<span class="flights__filter-sort-text">Filter</span>
					<span class="flights-count">Showing ${data.Response.Results[0].length} Flights</span>
				</div>
			</div>
			<div class="flights-sort">
				<span class="flights__filter-sort-text">Sort By</span>
				<div class="flights-select-sort-by">
					<div class="flights-select-header">
						<span>Choose an option</span>
						<div class="flights-arrow"></div>
					</div>
					<div class="flights__dropdown-menu">
						<div class="dropdown-item" id="direct__lowest-fare-flight">Suggested for You</div>
						<div class="dropdown-item" id="low__high-price-flight">Price: Low to High</div>
						<div class="dropdown-item" id="high__low-price-flight">Price: High to Low</div>
						<div class="dropdown-item" id="mor__night-dep-flight">Source: Morning to Night</div>
						<div class="dropdown-item" id="night__mor-dep-flight">Source: Night to Morning</div>
						<div class="dropdown-item" id="mor__night-arr-flight">Arrival: Morning to Night</div>
						<div class="dropdown-item" id="night__mor-arr-flight">Arrival: Night to Morning</div>
						<div class="dropdown-item" id="short__long-flight">Duration: Short to Long</div>
						<div class="dropdown-item" id="long__short-flight">Duration: Long to Short</div>
					</div>
				</div>
			</div>
		</div>
	`);
}

function appendFlightOptions() {
	jQuery('.flights__search').append(`
		<div class="flight-options__container">
			<div class="flight-options__card active" option-type="flightsPrefer">
				<div class="flight-options__icon">★</div>
				<div class="flight-options__info">
					<div class="flight-options__title">YOU MAY PREFER</div>
				</div>
			</div>
			<div class="flight-options__card" option-type="flightsCheapest">
				<div class="flight-options__icon">₹</div>
				<div class="flight-options__info">
					<div class="flight-options__title">CHEAPEST FIRST</div>
				</div>
			</div>
			<div class="flight-options__card" option-type="flightsNonStop">
				<div class="flight-options__icon">⚡</div>
				<div class="flight-options__info">
					<div class="flight-options__title">FASTEST FIRST</div>
				</div>
			</div>
		</div>
		
	`);
	
	// jQuery('.flights__search').append(`<div class="flightsDiscount__header-container">
	// 				<img src="/view/assets/img/price_challenge-two.webp" alt="Flights & Services">
	// 			</div>`);
	
	// Removing &b adding the carousel 
	//jQuery('.premium-carousel').remove();
	if (jQuery('.desktopSideBar').find('.premium-carousel').length <= 0) {
		let image = getFlightsCarouselImages();
		jQuery('.desktopSideBar').append(createPremiumCarousel(image));
		startAutoSlide(image.length);
	}
	
	//loadLottieAnimation('flightsDiscount__header', '/view/assets/img/coupon-discount-anim.json');
}

function appendGSTInput() {
    return `
        <div class="gst__info">
            <div class="gst__input">
                <label for="gstNumber">GST Number</label>
                <input type="text" id="gstNumber" name="gstNumber">
            </div>
            <div class="gst__company-name">
                <label for="gstCompanyName">Company Name</label>
                <input type="text" id="gstCompanyName" name="gstCompanyName">
            </div>
            <div class="gst__contact-number">
                <label for="gstContactNumber">Contact Number</label>
                <input type="text" id="gstContactNumber" name="gstContactNumber">
            </div>
            <div class="gst__email">
                <label for="gstEmail">Email</label>
                <input type="email" id="gstEmail" name="gstEmail">
            </div>
            <div class="gst__company-address">
                <label for="gstAddress">Company Address</label>
                <input type="text" id="gstAddress" name="gstAddress">
            </div>
        </div>`;
}

function renderBookedFlightTicketsHistory(data) {
    console.log(data);
    manageSecondary('show', 'bookedFlightTickets');
    data.object.forEach((ticket) => {
		if (!ticket.booking_info) return;
		let paymentId = ticket.payment_id;
		let tboFlightBookingId = ticket.id;
		let { booking_info: ticketData } = ticket; // Extract the booking_info property from the ticket object and assign it to a new variable named ticketData
		let airlineSourceOb = mapAirlineSource(ticketData.outboundFlight.flights[0].airlineName);
		let airlineSourceIb = ticketData.inboundFlight ? mapAirlineSource(ticketData.inboundFlight.flights[0].airlineName) : 
			'';
		ticketData.paymentId = paymentId;
		ticketData.tboFlightBookingId = tboFlightBookingId;
		ticketData.airlineSourceOb = airlineSourceOb;
		ticketData.airlineSourceIb = airlineSourceIb;
		ticketData.BookingIdOb = ticketData.outboundFlight.bookingReference;
		ticketData.BookingIdIb = ticketData.inboundFlight ? ticketData.inboundFlight.bookingReference : '';
		let outboundFlight = ticketData.outboundFlight.flights[0];
		if (!outboundFlight.airlineCode){
			return;
		}
		ticketData.cancellationInfo = ticket.cancellationInfo ? ticket.cancellationInfo : [];
        let inboundFlight = ticketData.inboundFlight ? ticketData.inboundFlight.flights[0] : null;
        let outboundFlightIcon = `/view/assets/img/AirlineLogo/${outboundFlight.airlineCode}.gif`;
        let inboundFlightIcon = inboundFlight ? `/view/assets/img/AirlineLogo/${inboundFlight.airlineCode}.gif` : outboundFlightIcon;
        let passenger = outboundFlight.passengers[0];
        let passengerName = `${passenger.firstname} ${passenger.lastname}`;
        let totalPassengers = outboundFlight.passengers.length;
        let baggageInfo = `${totalPassengers} x 32kg`;
		let totalPrice = `₹ ${ticketData.charges.totalFare}`;
		let ticketStatus = ticket.status;

        let createLegHTML = (flight, date) => {
            let flightIcon = `/view/assets/img/AirlineLogo/${flight.airlineCode}.gif`;
            return `
                <div class="flight-booking__leg">
                    <div class="flight-booking__leg-details">
                        <div class="flight-icon-airport__container">
                            <img class="flight-booking__dot" src="${flightIcon}" alt="Flight Icon">
                            <div class = "flight-expanded__container">
                                <div class="flight-booking__leg-title">${flight.airlineName} ${flight.flightNumber}</div>
                                <div class="flight-booking__leg-airports">${flight.departure} <span>→</span> ${flight.destination}</div>
                                <div class="flight-booking__leg-times">${formatDateAndTime(flight.departureTime)} <span> → </span> ${formatDateAndTime(flight.arrivalTime)}</div>
                            </div>
                        </div>
                        <div class="flight-booking__leg-date">${date}</div>
                    </div>      
                </div>`;
        };

        let outboundHTML = createLegHTML(outboundFlight, outboundFlight.departureTime.slice(0, 10));
        let inboundHTML = inboundFlight ? createLegHTML(inboundFlight, inboundFlight.departureTime.slice(0, 10)) : '';

        let tripType = inboundFlight ? 'Round Trip' : 'One-way';
        let tripRoute =`${outboundFlight.departure} to ${outboundFlight.destination}`;
        let tripDates = `${formatDateWithSuffix(outboundFlight.departureTime.slice(0, 10))}`;
        if (inboundFlight) {
            tripDates += ` - ${formatDateWithSuffix(inboundFlight.departureTime.slice(0, 10))}`;
        }
        let flightCount = ticketData.outboundFlight.flights.length + (ticketData.inboundFlight ? ticketData.inboundFlight.flights.length : 0);

        // Determine the status based on the flight dates
        let currentDate = new Date();
        let outboundDate = new Date(outboundFlight.departureTime);
        let inboundDate = inboundFlight ? new Date(inboundFlight.departureTime) : null;
        let statusText = 'Completed';
        let emailDiv = ``, cancelDiv = ``;

        if (inboundFlight) {
            // Round-trip: Check inbound flight date
            if (inboundDate > currentDate) {
                statusText = ( ticketStatus == 'success' || ticket.cancellationInfo.length != 2 ) ? 'Upcoming': ticketStatus;
				emailDiv = `<div class="email__icon" data-pnr="${ticket.pnr}"> ${icons.email_icon} </div>`;
				if (ticket.cancellationInfo.length != 2) {
						cancelDiv = `<div class="flight-booking__cancel" source="${outboundFlight.departure}" destination = "${outboundFlight.destination}">
						<div> 
							<div class="flight-booking__cancel-icon">
								<span>Cancel Ticket</span>
							</div>
						</div>
					</div>`;
				}
            }
        } else {
            // One-way: Check outbound flight date
            if (outboundDate > currentDate) {
                statusText = ticketStatus == 'success' ? 'Upcoming': ticketStatus;
				emailDiv = `<div class="email__icon" data-pnr="${ticket.pnr}"> ${icons.email_icon} </div>`;
				if (ticketStatus == 'success') {
					cancelDiv = `<div class="flight-booking__cancel">
                        <div> 
                            <div class="flight-booking__cancel-icon">
                                <span>Cancel Ticket</span>
                            </div>
                        </div>
                    </div>`;
				}
            }
        }

        let outboundElementId = `outbound-${ticketData.outboundFlight.bookingReference}`;
        let inboundElementId = ticketData.inboundFlight ? `inbound-${ticketData.inboundFlight.bookingReference}` : null;

        let ticketHTML = `
            <div class="flight-booking__card" id="${outboundElementId}">
                <div class="flight-booking__header">
                    <div>
                        <div class="flight-booking__title">${tripType} - ${tripRoute}</div>
                        <div class="flight-booking__dates">${tripDates}</div>
                        <div class="flight-booking__flight-info">
                           <img class="flight-booking__dot" src="${outboundFlightIcon}" alt="Flight Icon"><div class="ob__pnr"> PNR - ${ticketData.outboundFlight.pnrNumber}</div>
                           ${inboundFlight ? `<img class="flight-booking__dot" src="${inboundFlightIcon}" alt="Flight Icon"><div class="ob__pnr"> PNR - ${ticketData.inboundFlight.pnrNumber}</div>` : ''}
                        </div>
                    </div>
                    <div class="status__icons-container">
                        <div class="flight-booking__status">${statusText}</div>
                        <div class="send__flight__details-container"> 
                            ${emailDiv}
                        </div>
                    </div>
                </div>
                <div class="flight-booking__details">
                    ${outboundHTML}
                    ${inboundHTML}
                    <div class="flight-booking__summary">
                        <div> 
                            <div class="flight-booking__summary-item">
                                <span>👥</span> <span>Passengers:</span> <span>${totalPassengers}</span>
                            </div>
                            <div class="flight-booking__summary-item">
                                <span>💳</span> <span>Total Price:</span> <span>${totalPrice}</span>
                            </div>
                        </div>
                    </div>
                    ${cancelDiv}
                </div>
                <div class="flight-booking__toggle">
                    <span class="flight-booking__toggle-icon">${icons.down_arrow}</span> 
                </div>
            </div>`;

        jQuery('.booked__tickets').append(ticketHTML);

        // Store ticket data in the DOM element as a data attribute
        jQuery(`#${outboundElementId}`).data('ticketData', ticketData);
        // if (inboundElementId) {
        //     jQuery(`#${inboundElementId}`).data('ticketData', ticketData.inboundFlight);
        // }
    });
    jQuery('.global__loading').remove();
}

function flightsCalendarPicker(forJourneryType) {
    jQuery('#app').append(`<div id="custom_calendar_price__container" sel-date-type = "${forJourneryType}"></div>`);
    let $calendarContainer = $('#custom_calendar_price__container');

    // Create Calendar HTML Structure 
    $calendarContainer.html(`    
        <div class="custom_calendar_price__container">
            <div class="custom_calendar_price__header">
                <div class="custom_calendar_price__nav">
                    <button id="prevMonth">←</button>
                    <select id="monthSelector"></select>
                    <button id="nextMonth">→</button>
                </div>
            </div>
            <div class="custom_calendar_price__body">
                <div class="custom_calendar_price__weekdays">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>
                <div id="calendarDays" class="custom_calendar_price__days"></div>
            </div>
            <div class="custom_calendar_price__ctas">
                <div class="custom_calendar_price__cta" id="removeCalendarFares">Cancel</div>
            </div>
        </div>
    `);

    let $monthSelector = $('#monthSelector');
    let $prevMonthButton = $('#prevMonth');
    let $nextMonthButton = $('#nextMonth');
    let currentDate = new Date();

    // Populate month selector with the next 12 months
    for (let i = 0; i < 12; i++) {
        let optionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        let $option = $('<option></option>');
        $option.val(optionDate.toISOString());
        $option.text(optionDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
        $monthSelector.append($option);
    }

    function getPreferredDepartureTime(selectedDate, isLastDay) {
        let year = selectedDate.getFullYear();
        let month = selectedDate.getMonth() + 1; // Months are 0-based
        let day = isLastDay ? new Date(year, month, 0).getDate() : '01';
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;
    }
    
    function getOriginDestination() {
        let isDepDate = jQuery('#custom_calendar_price__container').attr('sel-date-type') === 'depDate';
        let origin = isDepDate ? $('#sourceInput').parents('.airport__search-container').attr('airport-code').trim() : $('#destinationInput').parents('.airport__search-container').attr('airport-code').trim();
        let destination = isDepDate ? $('#destinationInput').parents('.airport__search-container').attr('airport-code').trim() : $('#sourceInput').parents('.airport__search-container').attr('airport-code').trim();
        return { origin, destination };
    }
    
    function handleCalendarChange(isLastDay) {
        //loaderMain('global', true, 'flightsCalendarFares');
        let selectedDate = new Date(jQuery('#monthSelector').val());
        let preferredDepartureTime = getPreferredDepartureTime(selectedDate, isLastDay);
        let { origin, destination } = getOriginDestination();
    
        callFlightCalendarFare({
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
        });
    }

    function updateButtonVisibility() {
        let selectedIndex = $monthSelector.prop('selectedIndex');
        let lastIndex = $monthSelector.children('option').length - 1;
    
        $prevMonthButton.toggle(selectedIndex > 0);
        $nextMonthButton.toggle(selectedIndex < lastIndex);
    }

    // Event listener for previous month button
    $prevMonthButton.on('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
		$monthSelector.val(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString());
		renderCalendar();
        handleCalendarChange(true);
        updateButtonVisibility();
    });
    
    // Event listener for next month button
    $nextMonthButton.on('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
		$monthSelector.val(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString());
		renderCalendar();
        handleCalendarChange(false);
		updateButtonVisibility();
		
    });
    
    // Event listener for month selector change
    $monthSelector.on('change', () => {
		currentDate = new Date($monthSelector.val());
		renderCalendar();
        handleCalendarChange(true);
        updateButtonVisibility();
    });

    // Set initial value for month selector and render calendar
    $monthSelector.val(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString());
    renderCalendar(); // Initial render without fares

    // Swipe functionality
    let startX;
    let endX;

    $calendarContainer.on('touchstart', (e) => {
        startX = e.originalEvent.touches[0].clientX;
    });

    $calendarContainer.on('touchmove', (e) => {
        endX = e.originalEvent.touches[0].clientX;
    });

    $calendarContainer.on('touchend', () => {
        if (startX && endX) {
            let diffX = startX - endX;
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    // Swipe left to go to the next month
                    $nextMonthButton.click();
                } else {
                    // Swipe right to go to the previous month
                    $prevMonthButton.click();
                }
            }
        }
        startX = null;
        endX = null;
    });
}

// Api calls this function to render the Fares
function flightsCalendarFares(calendarFares) {
    renderCalendar(calendarFares); // Call renderCalendar with fare data
}

// Function to render the calendar with & without Fares for the selected month
function renderCalendar(calendarFares) {
    let $calendarDays = $('#calendarDays');
    let $monthSelector = $('#monthSelector');
    
    let selectedDate = null;
    let selectedOption = new Date($monthSelector.val());
    let year = selectedOption.getFullYear();
    let month = selectedOption.getMonth(); // Use 0-based month indexing

    let firstDay = (new Date(year, month)).getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    $calendarDays.html('');

    // Get the current date for comparison
    let currentDate = new Date();
	currentDate.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00 UTC
	
	// Adding "Category" inside calendarFares for Color Coding
	// Calculate the average fare
	var categorizedFares = [];
	if (calendarFares) {
		let calendarFaresWithCat = calendarFares.SearchResults;
		let totalFare = calendarFaresWithCat.reduce((sum, fare) => sum + fare.Fare, 0);
		let averageFare = totalFare / calendarFaresWithCat.length;

		// Categorize fares and assign color codes
		categorizedFares = calendarFaresWithCat.map(fare => {
			let category;

			if (fare.IsLowestFareOfMonth) {
				category = 'Lowest';
				color = 'green';
			}
			else if (fare.Fare < averageFare) {
				category = 'Average';
			}
			else {
				category = 'Expensive';
			}

			return {
				...fare,
				category
			};
		});

		console.log(categorizedFares);
	}

    // Loop to add empty cells before the 1st of the month 
    for (let i = 0; i < firstDay; i++) {
        let $emptyDayElement = $('<div></div>');
        $calendarDays.append($emptyDayElement);
    }

    // Loop to add day cells with flight fares
    for (let day = 1; day <= daysInMonth; day++) {
        let $dayElement = $('<div></div>');
        $dayElement.addClass('custom_calendar_price__day');
        $dayElement.text(day);
        
        // Create the date string in the desired format
        let date = new Date(Date.UTC(year, month, day)); // Use Date.UTC to avoid timezone issues
        date.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00 UTC
        
        // Format the date to 'YYYY-MM-DDTHH:MM:SS'
        let formattedDate = date.getUTCFullYear() + '-' +
            String(date.getUTCMonth() + 1).padStart(2, '0') + '-' +
            String(date.getUTCDate()).padStart(2, '0') ;
        
        // Set the formatted date as an attribute
        $dayElement.attr('data-date', formattedDate);
        
        // Disable past dates
        if (date < currentDate) {
            $dayElement.addClass('disabled');
        }

        // Find the fare for the current day (only if calendarFares is provided)
        if (calendarFares) {
            let fare = categorizedFares.find(f => {
				let fareDate = new Date(f.DepartureDate);
                return fareDate.getDate() === day && fareDate.getMonth() === month && fareDate.getFullYear() === year;
            });
            if (fare) {
                let $priceElement = $('<div></div>');
                $priceElement.text(`₹${Math.floor(fare.Fare)}`); 
                $priceElement.css({
                    fontSize: '0.75rem',
                    color: '#64748b',
                    marginTop: '0.25rem'
				});
				
				let bgColor, color;
				
				if (fare.IsLowestFareOfMonth) {
					bgColor = '#c6f6d5';
					color = '#22543d';
				}
				else if (fare.category == 'Average') {
					bgColor = '#f7fafc';
					color = '#64748b';
				}
				else {
					bgColor = '#fed7d7';
					color = '#742a2a';
				}
				$dayElement.css({
					backgroundColor: bgColor,
					color: color,
				});
                $dayElement.append($priceElement);
            }
        }

        // Highlight the selected date
        if (selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year) {
            $dayElement.css({
                backgroundColor: '#fde723',
                color: '#1e1e2d'
            });
        }

        $calendarDays.append($dayElement);
    }
}

// Function to render the Pax Review Sheet
function renderBottomSheet(travellers, from) {
	let travellerHTML = '', review__content = '', cancelTicketHTML = '';
	let title, deltaAmount, backButtonId, backButton = '';
	let ticketIds;
	if (from == 'appInstall' && jQuery('.traveller-details-review__container').length > 0) {
		return;
	}
	jQuery('.traveller-details-review__container').remove();
	if (from == 'pax-review') {
		title = `Review Details`;
		passengers = travellers.passengers;
		travellerHTML = passengers.map((traveller, index) => {
			let { firstName, lastName, gender, dob, passportNo, paxType } = traveller;
			
			let dobDiv = '';
			let passportDiv = '';
		
			if (dob && dob != '') {
				dobDiv = `
					<div>
						<span class="traveller-details-review__details-label">D.O.B:</span>
						<span class="traveller-details-review__details-value">${dob}</span>
					</div>`;
			}
			if (passportNo && passportNo != '') {
				passportDiv = `
					<div>
						<span class="traveller-details-review__details-label">Passport Number:</span>
						<span class="traveller-details-review__details-value">${passportNo}</span>
					</div>`;
			}
			return `
				<li class="traveller-details-review__list-item">
					<h3>${index + 1}. ${paxType}</h3>
					<div>
						<span class="traveller-details-review__details-label">Given Name:</span>
						<span class="traveller-details-review__details-value">${firstName}</span>
					</div>
					<div>
						<span class="traveller-details-review__details-label">Surname:</span>
						<span class="traveller-details-review__details-value">${lastName}</span>
					</div>
					<div>
						<span class="traveller-details-review__details-label">Gender:</span>
						<span class="traveller-details-review__details-value">${gender}</span>
					</div>
					${dobDiv}
					${passportDiv}
				</li>`;
		}).join('');
		
		let ticketingEmail = travellers.ticketingEmail;
		let ticketingPhone = travellers.ticketingPhone;
		let flightsPhoneCountryCode = travellers.flightsPhoneCountryCode;
		let ticketingAddress = travellers.ticketingAddress;
		
		let contactDetailsContainer = '';
		let ticketingEmailDiv = '';
		let ticketingPhoneDiv = '';
		let flightsCountryCodeDiv = '';
		let ticketingAddressDiv = '';
		
		if (ticketingEmail && ticketingEmail != '') {
			ticketingEmailDiv = `
				<div>
					<span class="traveller-details-review__details-label">Email:</span>
					<span class="traveller-details-review__details-value">${ticketingEmail}</span>
				</div>`;
		}
		if (ticketingPhone && ticketingPhone != '' && flightsPhoneCountryCode && flightsPhoneCountryCode != '') {
			ticketingPhoneDiv = `
				<div>
					<span class="traveller-details-review__details-label">Phone:</span>
					<span class="traveller-details-review__details-value">${flightsPhoneCountryCode} ${ticketingPhone}</span>
				</div>`;
		}
		if (ticketingAddress && ticketingAddress != '') {
			ticketingAddressDiv = `
				<div>
					<span class="traveller-details-review__details-label">Address:</span>
					<span class="traveller-details-review__details-value">${ticketingAddress}</span>
				</div>`;
		}
		
		contactDetailsContainer = `<div class="contact__details-container">${ticketingEmailDiv}${ticketingPhoneDiv}${flightsCountryCodeDiv}${ticketingAddressDiv}</div>`;
		
		
		review__content = `<p>Please ensure that the spelling of your name and other details match with your Government Id Card, as these cannot be changed later. Errors might lead to cancellation penalties.</p>
                <ul class="traveller-details-review__list">
                    ${travellerHTML}
                </ul>${contactDetailsContainer}`;
		backButtonId = `close-btn`;
	}
	else if (from == 'seat-pay-selection') {
		title = `Choose an option to Proceed`;
		travellerHTML = `<div class="page__picker-container">
							<div class="page__picker-left">
								<div id="payInstant"></div>
								<div id="payInstant-text">Pay Instantly</div>
							</div>
							<div class="page__picker-right">
								<div id="selectSeats"></div>
								<div id="selectSeats-text">Select Seats</div>
							</div>
						 </div>`;
		review__content = `${travellerHTML}`;
		backButtonId = `close-btn-hide-edit`;
	}
	else if (from === 'price-decreased' || from === 'price-increased') {
		title = from === 'price-decreased' ? 'Price Decreased 🥳' : 'Price Increased Alert 😔';
		deltaAmount = Math.ceil(travellers.amount / 100);
		let message = from === 'price-decreased'
			? `Great news! You've saved ₹${deltaAmount} on your booking. Enjoy your extra savings!`
			: `Heads up! The price has increased by ₹${deltaAmount} since your last visit. Book soon to avoid further changes!`;
	
		travellerHTML = `
			<div class="price-change__container">
				<div id="${from}"></div>
				${message}
				<div class="bill-details__container priceChange">
					<div class="bill-details__grand-total" data-total="${travellers.payData.notes.extraInfo.totalFare}">
						<span>Grand total</span>
						<span class="flights__final-amount" data-final-amount="${travellers.payData.notes.extraInfo.totalFare}">₹ ${travellers.payData.notes.extraInfo.totalFare}</span>
					</div>
				</div>
			</div>`;
		
		review__content = travellerHTML;
		backButtonId = 'close-btn-price';
	}
	else if (from === 'ssr-not-found') {
		title = 'Seat Selection is not available';
		travellerHTML = `<div class="page__picker-container">
							<div class="page__picker-left">
								<div id="payInstant"></div>
								<div id="payInstant-text">Pay Instantly</div>
							</div></div>`;
		review__content = `${travellerHTML}`;
		backButtonId = `close-btn-hide-edit`;
		
		
	}
	else if (from === 'login') {
		title = 'Login';
		travellerHTML = `<div class="page__picker-container">
							<div class="page__picker-left">
								<div id="login"></div>
								<div id="login-text">Login Successful 🥳</div>
							</div></div>`;
		review__content = `${travellerHTML}`;
		backButtonId = `close-btn-hide-edit`;
	}
	else if (from === 'premium__init') {
		title = 'Login';
		
		travellerHTML = `<div class="page__picker-container">
							<div class = "no__conv-pop">
							<img src="https://prodmedia.beatravelbuddy.com/uploads/display_picture/flight-coupon.webp" alt="Travel Booking" style="width: 100%; height: auto;">
							</div>
						</div>`;
		review__content = `${travellerHTML}`;
		backButton = `<div class = "close-button"> x </div>`;
	}
	else if (from === 'before-login') {
		title = 'Login';
		
		travellerHTML = `<div class="page__picker-container">
							<div class = "before-login-pop">
							<img src="https://prodmedia.beatravelbuddy.com/uploads/display_picture/before-login-three.webp" alt="Travel Booking" style="width: 100%; height: auto;">
							</div>
						</div>`;
		review__content = `${travellerHTML}`;
		backButton = `<div class = "close-button"> x </div>`;
	}
	else if (from === 'appInstall') {
		title = 'Login';
		
		travellerHTML = `<div class="page__picker-container">
							<div class = "app__install-pop">
							<img src="https://beatravelbuddy.com/view/assets/img/app-install.webp" alt="Travel Booking" style="width: 100%; height: auto;">
							</div>
						</div>`;
		review__content = `${travellerHTML}`;
		backButton = `<div class = "close-button"> x </div>`;
	}
	else if (from === 'loginNew') {
		title = 'Login';
		
		var iosLogin = '';
		
		if (isIOS()) {
			//Add Apple Login Button
			iosLogin = `<div class="social__btn" data-type="apple">${icons.appleIcon}</div>`;
			// iosLogin = `<div class="login__social__button login__social__button--apple login__apple-ios"><i class="fa fa-apple"></i> Sign in with Apple</div>`;
			
		}
		var maxWidth = '400px';
		if (!isMobile()) {
			maxWidth = '550px';
		}
		
		travellerHTML = `<div class="login">
							<header class="login__header">
									<h1 class="login__title hidden">Login here</h1>
									<h2 class="login__subtitle hidden">Welcome back<br>you've been missed!</h2>
									<img src="/view/assets/img/login-banner.webp" alt="Login Background" class="login__bg" style="max-width: ${maxWidth};     margin-top: 8px;">
							</header>
							<div class="login__box">
								<form class="form">
									<div class="form__group">
										<div class="phone__dial-container">
										<div class="custom-select-container">
											<div class="custom-select">
												<input name="dial-code"type="text" id="countryCodeInput" placeholder="+91 India" autocomplete="off" value="+91">
												<div class="custom-select-dropdown" id="countryCodeDropdown">
													<!-- Country codes will be populated here -->
												</div>
											</div>
										</div>
										<input type="text" class="form__input phone" placeholder="Type Phone Number or Email">
										</div>
										<div class="password-container">
											<input type="password" class="form__password" placeholder="Password">
											<div class="pass__toggle" class="toggle-password">${icons.passwordShow}</div>
										</div>
									</div>
									
									<div class="forgot__password">Forgot your password ?</div>
									

									<button type="submit" class="btn btn-primary">Login</button>
									
								</form>

								<button class="btn btn-link">
									<span style="color: grey;">Don't have an account ? </span>
									<strong>Sign up</strong>
								</button>
								

								<div class="social">
									<p class="social__text">Or continue with</p>
									<div class="social__buttons">
										<div class="social__btn" data-type="google">
										${icons.googleIcon}
										</div>
										<div class="social__btn" data-type="facebook">
										${icons.fbIcon}
										</div>
										${iosLogin}
										
										
									</div>
								</div>
							</div>
						</div>`;
		review__content = `${travellerHTML}`;
		backButton = `<div class = "close-button loginNew"> x </div>`;
		
	}
		
	else if (from === 'cancelTicket') {
		title = 'Cancel Ticket';
		if (travellers.inboundFlight) {
			
			ticketIds = travellers.outboundFlight.flights[0].passengers.map(ticket => ticket.ticketId );
			console.log(ticketIds);
			// Round Trip Ticket
			cancelTicketHTML = `<div class="cancel__ticket__container">
									<div class="cancel__ticket__ob" data-bookingid="${travellers.outboundFlight.bookingReference}" flight-book-id="${travellers.tboFlightBookingId}" pay-id="${travellers.paymentId}" air-source="${travellers.airlineSourceOb}">
										<div id="cancelTicketOb"></div>
										<div id="cancelTicketOb-text">View Refund Amount for ${travellers.source} - ${travellers.destination} Ticket</div>
									</div>
									<div class="cancel__ticket__ib" data-bookingid="${travellers.inboundFlight.bookingReference}" flight-book-id="${travellers.tboFlightBookingId}" pay-id="${travellers.paymentId}" air-source="${travellers.airlineSourceIb}" ticket-ids = "${ticketIds}">
										<div id="cancelTicketIb"></div>
										<div id="cancelTicketIb-text">View Refund Amount for ${travellers.destination} - ${travellers.source} Ticket</div>
									</div>
								</div>`;
		}
		else {
			// One Way Ticket
			ticketIds = travellers.outboundFlight.flights[0].passengers.map(ticket => ticket.ticketId );
			console.log(ticketIds);
			cancelTicketHTML = `<div class="cancel__ticket__container">
									<div class="cancel__ticket__ob" data-bookingid="${travellers.outboundFlight.bookingReference}" flight-book-id="${travellers.tboFlightBookingId}" pay-id="${travellers.paymentId}" air-source="${travellers.airlineSourceOb}" ticket-ids = "${ticketIds}">
										<div id="cancelTicketOb"></div>
										<div id="cancelTicketOb-text">Cancel Ticket</div>
									</div>
								</div>`;
			
		}
		review__content = `${cancelTicketHTML}`;
		backButtonId = `close-btn-hide-edit`;
	}
	else if (from === 'cancellationCharges') {
		title = 'Cancellation Charges';
		let cancellationCharges = travellers.object.Response;
		let cancellationChargesHTML = '';
		
		console.log(cancellationCharges);
		
		// Create a simple design to show CancellationCharge of Rs 1234 and RefundAmount of Rs 213
		
		cancellationChargesHTML = `
			<div class="cancellation__charges__container">
				<div class="cancellation__charges__details">
					<div class="cancellation__charge">
						<span>Cancellation Charge:</span>
						<span>₹ ${cancellationCharges.CancellationCharge}</span>
					</div>
					<div class="refund__amount">
						<span>Refund Amount:</span>
						<span>₹ ${cancellationCharges.RefundAmount}</span>
					</div>
				</div>
			</div>
			<div class="cancellation__charges__cta">
				<div id="cancelTicket" cancel-payload='${JSON.stringify(cancellationCharges.cancelPayload)}'>Cancel Ticket</div>
				<div id="stopCancelTicket">Don't Cancel</div>
			</div>
		`;
		
		review__content = `${cancellationChargesHTML}`;
		backButtonId = `close-btn-hide-edit`;
		
	}
	else if (from === 'hotelBooking') {
		title = 'Selects Rooms & Guests';
		// Create a premium Layout where user can seamlessly select the number of adults and children and number of rooms
		let hotelBookingHTML = `
			<div class="hotel-booking-container">
				<div class="hotel-booking-details">
					<div class="hotel-booking-room">
						<span class="hotel-booking-label">Rooms:</span>
						<select class="hotel-booking-select" id="roomCount">
							${[...Array(6).keys()].map(i => `<option value="${i + 1}">${i + 1}</option>`).join('')}
						</select>
					</div>
					<div class="hotel-booking-adults">
						<span class="hotel-booking-label">Adults:</span>
						<select class="hotel-booking-select" id="adultCount">
							${[...Array(8).keys()].map(i => `<option value="${i + 1}">${i + 1}</option>`).join('')}
						</select>
					</div>
					<div class="hotel-booking-children">
						<span class="hotel-booking-label">Children:</span>
						<select class="hotel-booking-select" id="childCount">
							${[...Array(5).keys()].map(i => `<option value="${i}">${i}</option>`).join('')}
						</select>
					</div>
				</div>
				<div class="hotel-booking-cta">
					<div id="bookHotel">APPLY</div>
				</div>
			</div>
		`;
		
		review__content = `${hotelBookingHTML}`;
		backButtonId = `close-btn-hide-edit`;
	}
	else if (from == 'onboardingOne') {
		
		var authType = manageUserProfile('read', 'email') ? manageUserProfile('read', 'email') : manageUserProfile('read', 'phoneNumber');
		var profilePic = manageUserProfile('read', 'profilePic') ? renderUserProfileImage(manageUserProfile('read', 'profilePic')) : 'https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_pictures/dummy.png';
		var coverPhoto = manageUserProfile('read', 'coverPhotos');
		coverPhoto = coverPhoto.length > 0 ? imageBaseUrl + coverPhoto[0] : '/view/assets/img/experiences__bg.webp';
		
		
		
		travellerHTML = `
			<div class="onboarding__page-container">
				<h1 class="onboarding__page-title">Upload Your Best Shots & Stand Out from the Crowd!</h1>
				<input class="hidden" type="file" id="file-input-cover" accept="image/*">
				<input class="hidden" type="file" id="file-input-dp" accept="image/*">
				<div class="onboarding__page-background-image">
					<img src="${coverPhoto}" alt="Cover Image">
					<button class="onboarding__page-edit-button">
						${icons.newEdit}
					</button>
				</div>

				<div class="onboarding__page-profile-card">
					<div class="onboarding__page-profile-header">
						<div class="onboarding__page-avatar-container">
							<div class="onboarding__page-avatar"><img src="${profilePic}" onerror="this.onerror=null; this.src = getDummyImageUrl();" alt="Pranav"></div>
							<button class="onboarding__page-avatar-edit">
								${icons.newEdit}
							</button>
						</div>
						<div class="onboarding__page-profile-info">
							<h2>${manageUserProfile('read', 'name')}</h2>
							<p class="onboarding__page-phone-number">${authType} <span class="onboarding__page-verified-badge">
									<img src="/view/assets/img/verified.webp" alt="Verified">
								</span></p>
						</div>
					</div>

					<div class="onboarding__page-gender-options">
						<button class="onboarding__page-gender-option active" data-gender="male">
							<div class="onboarding__page-gender-icon">
								<img src="/view/assets/img/male.webp" alt="Male">
							</div>
							<span class="onboarding__page-gender-label">Male</span>
						</button>
						<button class="onboarding__page-gender-option" data-gender="female">
							<div class="onboarding__page-gender-icon"> 
								<img src="/view/assets/img/female.webp" alt="FeMale">
							</div>
							<span class="onboarding__page-gender-label">Female</span>
						</button>
						<button class="onboarding__page-gender-option" data-gender="non-binary">
							<div style="display: flex; gap: 4px;">
								<div class="onboarding__page-gender-icon">
									<img src="/view/assets/img/nonbinary.webp" alt="Male">
								</div>
							</div>
							<span class="onboarding__page-gender-label">Bigender</span>
						</button>
					</div>
					<button class="onboarding__page-done-button">Done</button>
				</div>
			</div>
    			`;
		review__content = `${travellerHTML}`;
		backButton = `<div class = "close-button onbOne"> x </div>`;
	}
	else if (from == 'onboardingTwo') {
	}
	else if (from == 'onboardingThree') {
	}
	else if (from == 'onboardingFour') {
	}
	
    jQuery('#main').append(`
        <div class="traveller-details-review__container" id="traveller-details-review">
            <div class="traveller-details-review__header">
                <h2 class="traveller-details-review__title">${title}</h2>
                <button class="traveller-details-review__close-btn" id="${backButtonId}">&times;</button>
            </div>
            <div class="traveller-details-review__content">
			${review__content}
            </div>
			${backButton}
        </div>
    `);
	
	if (from == 'premium__init' || from == 'appInstall') {
		jQuery('#traveller-details-review .traveller-details-review__header').hide();
		
		var mxHeight = from == 'premium__init' ? '500px' : '350px';
		jQuery('.traveller-details-review__content').css({ 'padding': '0', 'max-height': mxHeight });
		if (isMobile() && (!isAndroid() && !isIOS())) {
			jQuery('.traveller-details-review__container')
				.css('bottom', '15%');
		}
		else {
			jQuery('.traveller-details-review__container')
				.css('bottom', '7.2%');
			
		}
		jQuery('body').prepend(`<div class="traveller-details-review__overlay"></div>`);
	}
	else if (from == 'hotelBooking') {
		jQuery('.traveller-details-review__container').css({ 'bottom': '0', 'height': '57vh', 'background-color': '#fff' });
		jQuery('.traveller-details-review__content').css({ 'padding': '0' });
	}
	else if (from == 'loginNew' || from == 'onboardingOne' || from == 'before-login') {
		var heightLogin = (isAndroid() || isIOS() || isDesktop()) ? '100vh' : '85vh';
		jQuery('.traveller-details-review__header').remove();
		jQuery('.traveller-details-review__content').css({ 'padding': '0', 'max-height': heightLogin, 'border-radius': '0' });
		jQuery('.traveller-details-review__container').css({ 'bottom': '0' })
		jQuery('body').prepend(`<div class="traveller-details-review__overlay overlay-login"></div>`);
	}
	// Rendering the Width of the Footer as per the App width so that it stays perfect for all Screen sizes
	appDiv = document.getElementById('app');
	flightsFooter = document.getElementById('traveller-details-review');
  
	if (appDiv && flightsFooter) {
		flightsFooter.style.width = `${(appDiv.offsetWidth)}px`;
	}

    jQuery('#' + backButtonId).on('click', function() {
		showHidePaxReviewSheet('hide');
		if (backButtonId.includes('hide-edit')) {
			jQuery('.flights__footer-continue.skipSSR').show();
		}
		if (!backButtonId.includes('price')) {
			updateFooterContinue('reviewPaxDetails', '', '', 'Continue');
			jQuery('.flights__footer-continue.ssr').hide();
		}
		
    });

    showHidePaxReviewSheet('show');
}

function renderFlightsFinalPage() {
	jQuery('.pax__details-title, .passenger__info, .contact__details, .gst__checkbox, #gstContainer').addClass('hide');
	
	jQuery('.flightsBookingBack').parent('.drawerHeader').find('.highlight').text('Book Flight');


	let seatPrice = 0; 
	let mealPrice = 0;
	// These are 3 global variables to Hold diff Seats type --> seatSelectedOb, seatSelectedIb, seatSelectedOw;
	if (seatSelectedOw && seatSelectedOw.length > 0) {
		
		seatSelectedOw.forEach((seat) => {
			seatPrice += seat.Price;
		});
		
	}
	else if ((seatSelectedOb && seatSelectedOb.length > 0) || seatSelectedIb && seatSelectedIb.length > 0) {
		
		if (seatSelectedOb && seatSelectedOb.length > 0) {
			seatSelectedOb.forEach((seat) => {
				seatPrice += seat.Price;
			});
		}
		if (seatSelectedIb && seatSelectedIb.length > 0) {
			seatSelectedIb.forEach((seat) => {
				seatPrice += seat.Price;
			});
		}
		
	}
	
	if (seatPrice > 0) {
		jQuery('.total__seat-price'	).remove();
		jQuery('.bill-details__taxes-surcharges').parent().parent().after(`<div 	class="bill-details__item total__seat-price">
			<div class="bill-details__item-left">
				<span class="flight__total_fare-title">Total Seat Price</span>
			</div>
			<div class="bill-details__item-right">
				<span class="bill-details__seat-price" seat-price="${seatPrice}">₹ ${seatPrice}</span>
			</div>
		</div>`);
	}
	
	// These are 3 global variables to Hold diff Seats type --> mealSelectedOw, mealSelectedIb, mealSelectedOb;
	if (mealSelectedOw && mealSelectedOw.length > 0) {
		
		mealSelectedOw.forEach((meal) => {
			mealPrice += meal.Price;
		});
		
	}
	else if ((mealSelectedOb && mealSelectedOb.length > 0) || mealSelectedIb && mealSelectedIb.length > 0) {
		
		if (mealSelectedOb && mealSelectedOb.length > 0) {
			mealSelectedOb.forEach((meal) => {
				mealPrice += meal.Price;
			});
		}
		if (mealSelectedIb && mealSelectedIb.length > 0) {
			mealSelectedIb.forEach((meal) => {
				mealPrice += meal.Price;
			});
		}
		
	}
	
	if (mealPrice > 0) {
		//jQuery('.total__seat-price'	).remove();
		jQuery('.bill-details__taxes-surcharges').parent().parent().after(`<div class="bill-details__item total__meal-price">
			<div class="bill-details__item-left">
				<span class="flight__total_fare-title">Total Meal Price</span>
			</div>
			<div class="bill-details__item-right">
				<span class="bill-details__meal-price" meal-price="${mealPrice}">₹ ${mealPrice}</span>
			</div>
		</div>`);
	}
	
	let finalAmount = Number(jQuery('.flights__final-amount').attr('data-final-amount')) + Number(jQuery('.bill-details__handling-charges').attr('conv-charges')) + seatPrice + mealPrice;
	
	jQuery('.flights__final-amount').text(`₹ ${finalAmount}`);
	jQuery('.flights__final-amount').attr('data-final-amount', finalAmount);
	
	jQuery('.flights__apply-coupon').addClass('addedConv');
	
	setTimeout(() => {
		jQuery('.global__loading').remove();
	}, 1000);
	
}

function renderFlightsPayment(paymentData) {
	let finalAmount = Number(jQuery('.flights__footer-price').attr('total-price')) * 100;
	
	
	if (paymentData && paymentData.amount) {
		if (paymentData.amount !== finalAmount) {
			if (paymentData.amount < finalAmount ) {
				// Handle case where paymentData.amount is less than finalAmount
				let amount = finalAmount - paymentData.amount;
				//renderBottomSheet({'amount': amount, 'payData': paymentData}, 'price-decreased');
				//loadLottieAnimation('price-decreased', '/view/assets/img/balloon_anim.json');
				//updateFooterContinue('payment', '', '', 'Pay');
			}
			else {
				// Handle case where paymentData.amount is greater than finalAmount
				let amount = paymentData.amount - finalAmount;
				//renderBottomSheet({'amount': amount, 'payData': paymentData }, 'price-increased');
				//updateFooterContinue('payment', '', '', 'Pay');
			}
			
			jQuery('.flights__footer-continue.skipSSR').data('paymentData', JSON.stringify(paymentData));
			
			jQuery('.flights__bill-details').text(`₹ ${paymentData.notes.extraInfo.basePrice}`);
			
			jQuery('.bill-details__taxes-surcharges').text(`₹ ${paymentData.notes.extraInfo.tax}`);
			
			jQuery('.bill-details__handling-charges').text(`₹ ${paymentData.notes.extraInfo.convenienceCharges}`);
			
			jQuery('.bill-details__savings-amount coupon, .bill-details__saved-tag').text(` ₹ ${paymentData.notes.extraInfo.couponDiscount}`);
			
			jQuery('.flights__final-amount').text(`₹ ${paymentData.notes.extraInfo.totalFare}`);
			
		}
		//else {
			// Handle case where paymentData.amount is equal to finalAmount
		managePayments('openRazorpayWindow', paymentData);
		//}
		jQuery('.flights__footer-continue.ssr').hide();
		//jQuery('.flights__footer-content').css('justify-content', 'flex-end');
	}
	
}

function getTotalPaxCoutExclInfants() {
	let adultCount = parseInt(jQuery('#travelDetails-adults').val(), 10) || 0;
	let childCount = parseInt(jQuery('#travelDetails-children').val(), 10) || 0;
	return adultCount + childCount;
}

function renderMealOptions(mealData) {
    let totalPax = getTotalPaxCoutExclInfants();
    let mealOptions = mealData;

    let mealOptionsContainer = $('<div>', { id: 'website__flight-meal-options' });

    // Create the selection counter
    let selectionCounter = $('<div>', {
        class: 'selection-counter',
        text: 'Selected Meals: 0 / 0'
    });
    mealOptionsContainer.append(selectionCounter);

    let grid = $('<div>', {
        class: 'website__flight-meal-grid'
    });
    mealOptionsContainer.append(grid);

    let selectedMeals = [];

    // Update the selection counter with the total number of passengers
    selectionCounter.text(`Selected Meals: 0 / ${totalPax}`);

    mealOptions.forEach(meal => {
        let card = $('<div>', {
            class: 'website__flight-meal-card'
        });

        let name = $('<h3>', {
            class: 'website__flight-meal-name',
            text: meal.AirlineDescription ? meal.AirlineDescription : meal.Description
        });
        card.append(name);

        let code = $('<p>', {
            class: 'website__flight-meal-code',
            text: meal.Code
        });
        card.append(code);

        let priceSelectDiv = $('<div>', {
            class: 'website__flight-meal-price-select'
        });

        let price = $('<span>', {
            class: 'website__flight-meal-price',
            text: meal.Price ?  `INR ${meal.Price}`: ''
        });
        priceSelectDiv.append(price);

        let selectButton = $('<button>', {
            class: 'website__flight-meal-select-button',
            text: 'Select'
        });

        let counterDiv = $('<div>', {
            class: 'meal-counter',
            html: `
                <button class="counter-btn minus">-</button>
                <span class="counter-value">0</span>
                <button class="counter-btn plus">+</button>
            `,
            style: 'display: none;' // Initially hidden
        });

        // Add Event Listener to each button (Important!)
        selectButton.on('click', () => {
            if (selectedMeals.length < totalPax) {
                selectedMeals.push(meal);
                addMealToSelected(meal);
                selectButton.hide(); // Hide the select button
                counterDiv.show(); // Show the counter
                counterDiv.find('.counter-value').text(1); // Set counter to 1
				updateSelectionCounter();
				jQuery('.flights__footer-continue.skipSSR').text('Continue');
            } else {
                toast('You have selected the maximum number of meals allowed.');
            }
        });

        counterDiv.find('.plus').on('click', () => {
            let counterValue = parseInt(counterDiv.find('.counter-value').text(), 10);
            if (selectedMeals.length < totalPax) {
                counterValue++;
                selectedMeals.push(meal);
                addMealToSelected(meal);
                counterDiv.find('.counter-value').text(counterValue);
                updateSelectionCounter();
            } else {
                toast('You have selected the maximum number of meals allowed.');
            }
        });

        counterDiv.find('.minus').on('click', () => {
            let counterValue = parseInt(counterDiv.find('.counter-value').text(), 10);
            if (counterValue > 1) {
                counterValue--;
                selectedMeals.splice(selectedMeals.indexOf(meal), 1);
                removeMealFromSelected(meal);
                counterDiv.find('.counter-value').text(counterValue);
                updateSelectionCounter();
            } else if (counterValue === 1) {
                counterValue--;
                selectedMeals.splice(selectedMeals.indexOf(meal), 1);
                removeMealFromSelected(meal);
                counterDiv.find('.counter-value').text(counterValue);
                counterDiv.hide(); // Hide the counter
                selectButton.show(); // Show the select button
                updateSelectionCounter();
            }
		});

        priceSelectDiv.append(selectButton);
        priceSelectDiv.append(counterDiv);
        card.append(priceSelectDiv);

        grid.append(card);
    });

    function updateSelectionCounter() {
        selectionCounter.text(`Selected Meals: ${selectedMeals.length} / ${totalPax}`);
    }

    function addMealToSelected(meal) {
        if (jQuery('.flights__search').attr('data-return') == 'true') {
            if (jQuery('.flights__ssr.meal-tabs.active').attr('data-call-from') == 'tboSSROb') {
                mealSelectedOb.push(meal);
            } else {
                mealSelectedIb.push(meal);
            }
        } else {
            mealSelectedOw.push(meal);
		}
		updateTotalBaseFare(false, meal);
    }

    function removeMealFromSelected(meal) {
        if (jQuery('.flights__search').attr('data-return') == 'true') {
            if (jQuery('.flights__ssr.meal-tabs.active').attr('data-call-from') == 'tboSSROb') {
                mealSelectedOb.splice(mealSelectedOb.indexOf(meal), 1);
            } else {
                mealSelectedIb.splice(mealSelectedIb.indexOf(meal), 1);
            }
        } else {
            mealSelectedOw.splice(mealSelectedOw.indexOf(meal), 1);
		}
		updateTotalBaseFare(true, meal);
	}
	
	let updateTotalBaseFare = (isCheckedInitial, mealInfo) => {
		let totalBaseFare = isCheckedInitial
			? Number(jQuery('.flights__footer-price').attr('total-price')) - Number(mealInfo.Price)
			: Number(jQuery('.flights__footer-price').attr('total-price')) + Number(mealInfo.Price);
		jQuery('.flights__footer-price').attr('total-price', totalBaseFare);
		jQuery('.flights__footer-price').attr('meal-price', mealInfo.Price);
		jQuery('.flights__footer-price').attr('base_fare', totalBaseFare);
		jQuery('.flights__footer-price .price').text(`₹ ${totalBaseFare}`);
		jQuery('.bill-details__grand-total').attr('data-total', totalBaseFare);
	};

    return mealOptionsContainer;
}

function renderHotelsSearchResults(hotelsData) {
	manageSecondary('show', 'hotelSearchResults');
	let hotelDetails = hotelsData.object.HotelDetails;
	let hotelResult = hotelsData.object.HotelResult;
	
	hotelDetails.forEach((hotel, index) => {
		jQuery('.hotelSearchResults').append(`
			<div class="hotel-card" id="hotel__index${index}">
				<div class="hotel-card__image-container">
					<img src= ${ ( hotel.Images && hotel.Images.length > 0 ) ? hotel.Images[0] : '/view/assets/img/experiences__bg.webp'} alt=${hotel.HotelName} class="hotel-card__image">
					<div class="hotel-card__favorite-button">
						${icons.heart}
					</div>
				<div class="hotel-card__image-carousel-indicator">
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
				</div>
				<div class="hotel-card__content">
					<h3 class="hotel-card__title">${hotel.HotelName}</h3>
					<p class="hotel-card__details">5 nights • 20-25 Dec</p>
					<div class="hotel-card__price-container">
						<span class="hotel-card__price">₹${hotelResult[index].Rooms[0].TotalFare}</span>
						<span class="hotel-card__price-details">total before taxes</span>
					</div>
				</div>
			</div>
		`);
		
		jQuery('#hotel__index' + index)
			.data('hotelDetails', JSON.stringify(hotel))
			.data('hotelResult', JSON.stringify(hotelResult[index]));
	});
	
}

function renderHotelDetails(hotelDetails, hotelResult) {
	manageSecondary('show', 'hotelDetails');
	jQuery('.hotelDetails').append(`
	  <div class="hotel-details">
		<div class="hotel-details__image-container">
		  <img src="${( hotelDetails.Images && hotelDetails.Images.length > 0 ) ? hotelDetails.Images[0] : '/view/assets/img/experiences__bg.webp'}" alt="Seaside Luxury in Fort Tiracol" class="hotel-details__image">
		  <div class="hotel-details__image-overlay">
			<button class="hotel-details__back-button">
			  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left">
				<polyline points="15 18 9 12 15 6"></polyline>
			  </svg>
			</button>
			<div class="hotel-details__top-right-buttons">
			  <button class="hotel-details__share-button">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-upload">
				  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
				  <polyline points="15 17 21 17 21 13"></polyline>
				  <path d="M10 8l4-4 4 4"></path>
				</svg>
			  </button>
			  <button class="hotel-details__favorite-button">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart">
				  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
				</svg>
			  </button>
			</div>
			<div class="hotel-details__image-counter">1/${hotelDetails.Images.length}</div>
		  </div>
		</div>
		<div class="hotel-details__content">
		  <h2 class="hotel-details__title">${hotelDetails.HotelName}</h2>
		  <p class="hotel-details__subtitle">${hotelDetails.Address}</p>
		  <p class="hotel-details__details">${hotelResult.Rooms[0].Name[0]}</p>
		  <div class="hotel-details__rating">
			<span class="hotel-details__star">★</span> 5.0
			<a href="#" class="hotel-details__reviews">30 reviews</a>
		  </div>
		  <div class="hotel-details__booking-info">
			<div class="hotel-details__booking-icon">
			  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-20c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.25 12.17c-.69.56-1.51.94-2.42 1.13l-.4-.1V19h-2v-1.83l-.4.1c-.91-.18-1.73-.57-2.42-1.13-.31-.27-.54-.61-.69-.98-.15-.37-.21-.78-.21-1.2 0-.72.24-1.35.7-1.85.46-.5.69-.5.69-.5s.47-.55 1.08-.91c.61-.36.61-.36.61-.36L17 10.3V6h1v4.3l1.35.35c.62.15 1.13.48 1.5.98s.68 1.02.68 1.77c0 .44-.06.85-.17 1.21z"></path>
			  </svg>
			</div>
			<div class="hotel-details__booking-text">
			  <p class="hotel-details__booking-title"></p>
			  <p class="hotel-details__booking-subtitle">The host will stop accepting bookings for your dates soon.</p>
			</div>
		  </div>
		  <div class="hotel-details__amenity">
			<svg class="hotel-details__parking-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			  <path d="M12.22 8.57c-.31-.51-.15-1.17.29-1.59.44-.42 1.1-.57 1.69-.43.59.14 1.07.54 1.31 1.09.24.55.2 1.18-.14 1.67-.34.49-.92.75-1.54.75H8.71c-.45 0-.85-.19-1.15-.52-.3-.33-.47-.79-.47-1.3 0-.51.17-.97.5-1.33.33-.36.82-.54 1.39-.54h.57c.28 0 .54.08.76.23.22.15.39.37.48.64.1.27.06.59-.12.86l-.22.32c-.44.67-.25 1.52.4 2.03.64.51 1.53.69 2.31.52.36-.08.7-.23 1.01-.43.31-.2.58-.46.8-.76.22-.3.39-.66.49-1.04.1-.38.05-.8-.18-1.16zM6.91 14.09C6.5 13.42 6.5 12.57 7.16 12c.66-.57 1.52-.94 2.5-.94 1 0 1.84.38 2.5.94.66.57.66 1.43 0 2l-2.5.95c-.95.36-1.82.36-2.77 0-.47-.19-.89-.52-1.23-.94zM17.35 16.08l-1.1-2.04c-.2-.38-.52-.68-.9-.86-.37-.19-.8-.28-1.27-.28H9.66c-.66 0-1.25.2-1.7.6-.45.4-.72.95-.82 1.55H5.2c-.26 0-.5.12-.68.34-.18.22-.28.5-.28.8 0 .29.09.56.28.8.18.24.46.43.8.55 1.05.36 2.26.17 3.15-.57.88-.74 1.32-1.82 1.32-2.96 0-.67-.21-1.28-.62-1.78-.41-.5-.99-.82-1.64-.95-.65-.13-1.35-.09-1.97.13l-.22.08c-.61.21-1.14.55-1.56 1.01-.43.47-.7.62-1.12.62h-.5c-.47 0-.89-.19-1.24-.57C7 14.66 6.68 13.8.68 13.01c0-.32.11-.61.32-.86.22-.25.5-.44.82-.55l1.1-2.03c.2-.37.52-.67.9-.85.38-.18.79-.27 1.25-.27h4.95c.53 0 1 .11 1.42.33.42.22.76.52.99.89l.98 1.81c.1.18.17.38.21.59.05.21.05.43 0 .64-.05.2-.16.38-.29.54zm-6.65 1.18c-.45.4-.74 1-.85 1.73-.1.74-.03 1.51.25 2.22.27.71.78 1.25 1.44 1.6.66.35 1.42.53 2.2.53 1.12 0 2.1-.39 2.8-.95l.46-.37c.35-.28.63-.61.82-.99.2-.38.32-.8.32-1.25 0-.86-.36-1.61-1.04-2.14-.68-.52-1.58-.83-2.56-.89l-.29-.01z"></path>
			</svg>
			<span class="hotel-details__amenity-text">${hotelDetails.HotelFacilities[0]}</span>
		  </div>
		  <div class="hotel-details__bottom-section">
			<div class="hotel-details__price">
			  <span class="hotel-details__price-amount">${hotelResult.Rooms[0].TotalFare}</span>
			  <p class="hotel-details__price-details">Total before taxes</p>
			  <p class="hotel-details__dates">9-14 Dec</p>
			</div>
			<button class="hotel-details__reserve-button">Reserve</button>
		  </div>
		</div>
	  </div>
	`);
}

function renderNewHomePage() {
	
	appHeader = jQuery('#header').prop('outerHTML');
	jQuery('#header').remove();
	removeActiveClassFromMain();
	jQuery('#main').append(`
		<div class="homepage">
			<header class="homepage__header">
				<h1 class="homepage__title">TRAVEL BUDDY</h1>
				<p class="homepage__subtitle">What's Your Travel Plan Today?</p>
			</header>
			<div class="homepage__container">
				<section class="homepage__hero">
				</section>
				<div class="search__box-homePage"><input type="text" placeholder="Search Buddies, Trips or Destinations" id="searchPageInputHome"><button class="search__button-homePage">${icons.searchBar}</button></div>
				<div class="homepage__grid">
					<div class="homepage__card" data-card-type="find">
						<div class="text-container">
							<h3 class="homepage__card-title">
								Find <span class="homepage__card-title-highlight">Buddies</span>
							</h3>
							<p class="homepage__card-description">Meet travelers with <strong>shared interests</strong> around the globe</p>
							<div class="homepage__badge">Find your <strong>perfect match</strong></div>
						</div>
						<div class="homepage__card-image">
							<img src="/view/assets/img/member-lp.webp" alt="Travel buddies illustration">
						</div>
					</div>
					<div class="homepage__card" data-card-type="chat">
						<div class="text-container">
							<h3 class="homepage__card-title">
								<span class="homepage__card-title-highlight">Hook </span> Up
							</h3>
							<p class="homepage__card-description">Let the convo begin.  <strong>Your vibe matters</strong></p>
							<div class="homepage__badge">Chat <strong>with like minded buddies</strong></div>
						</div>
						<div class="homepage__card-image">
							<img src="/view/assets/img/buddy-lp.webp" alt="Membership illustration">
						</div>
					</div>
					<div class="homepage__card" data-card-type="flights">
						<div class="text-container">
							<h3 class="homepage__card-title">
								<span class="homepage__card-title-highlight">Flight</span> Booking
							</h3>
							<p class="homepage__card-description">Book flights tickets <strong>at the lowest price</strong></p>
							<div class="homepage__badge"><strong>Take the Price Challenge Now</strong></div>
						</div>
						<div class="homepage__card-image">
							<img src="/view/assets/img/flight-lp.webp" alt="Flight booking illustration">
						</div>
					</div>
					
				</div>
				<div class="hero__container homePage">
					<div class="hero__content">
					<div class="hero__title-primary">
						Never
					</div>
					<div class="hero__title-secondary">
						<div class="hero__title-secondary--left">
						Feel
						</div>
						<div class="hero__title-secondary--right">
						Alone
						</div>
					</div>
					<div class="hero__footer">
						Crafted with ${icons.like_icon_new} in India
					</div>
					</div>
				</div>
			</div>
		</div>
	`);//loadLottieAnimation('ai-lp', '/view/assets/img/aiBuddy-lp.json');
	jQuery('.homepage').addClass('active');
	
	// <div class="homepage__card" data-card-type="ai">
	// 					<div class="text-container">
	// 						<h3 class="homepage__card-title">
	// 							<span class="homepage__card-title-highlight">AI</span> Planner
	// 						</h3>
	// 						<p class="homepage__card-description">Explore limitless possibilities<strong> with AI Buddy </strong></p>
	// 						<div class="homepage__badge">Trips, <strong>tailored for you.</strong></div>
	// 					</div>
	// 					<div class="homepage__card-image">
	// 						<div id="ai-lp"></div>
	// 						<img class="homepage__hero-image" src="/view/assets/img/ai-lp.webp" alt="Travel Buddy Hero Image">
	// 					</div>
	// 				</div>
	
	// get the width of .homepage__card
	let cardWidth = jQuery('.homepage__card').width();
	jQuery('.homepage__card-image img').css({
		'width': `${cardWidth}px`,
		'aspect-ratio': '1/1'
	});
	
	
	// Removing &b adding the carousel 
	jQuery('.premium-carousel').remove();
	let image = getFlightsCarouselImages('landingPage');
	jQuery('.homepage__hero').after(createPremiumCarousel(image, 'landingPage'));
	//startAutoSlide(image.length);
	
}

// URL Async requesting function
function httpGetAsync(theUrl, callback) {
    // Create the request object
    var xmlHttp = new XMLHttpRequest();

    // Set the state change callback to capture when the response comes in
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
        }
    };

    // Open as a GET call, pass in the URL and set async = true
    xmlHttp.open("GET", theUrl, true);

    // Call send with no params as they were passed in on the URL string
    xmlHttp.send(null);
}

// Callback for the top 8 GIFs of search
function tenorCallback_search(responsetext) {
	jQuery('body').append(`<div class="tenor-gif-container">
		<img id="preview_gif" class="tenor-gif" src="" />
		<img id="share_gif" class="tenor-gif" src="" />
	</div>`);
    // Parse the JSON response
    var response_objects = JSON.parse(responsetext);

    var top_10_gifs = response_objects["results"];

    // Load the GIFs -- for our example we will load the first GIFs preview size (nanogif) and share size (gif)
    document.getElementById("preview_gif").src = top_10_gifs[0]["media_formats"]["nanogif"]["url"];
    document.getElementById("share_gif").src = top_10_gifs[0]["media_formats"]["gif"]["url"];
}

// Function to call the trending and category endpoints
function grab_data() {
    // Set the apikey and limit
    var apikey = "AIzaSyBTUmwdSpcG6lSqraIG_Il_fYFI5FtHslM"; // Replace with your actual API key
    var clientkey = "my_test_app";
    var lmt = 8;

    // Test search term
    var search_term = "bored";

    // Using default locale of en_US
    var search_url = "https://tenor.googleapis.com/v2/search?q=" + search_term + "&key=" +
        apikey + "&client_key=" + clientkey + "&limit=" + lmt;

    httpGetAsync(search_url, tenorCallback_search);
}

// // Start the flow
// grab_data();




function renderGroupTripsHome(data, type) {
	var tripsData, headerTabs, whatsAppFAB, enquiryFormFAB, footerActionButton;
	var hideSection = '';
    if (type == 'default') {
        tripsData = data;
		headerTabs = ``;
		// whatsAppFAB = `<div class="floating-button btn-whatsapp-float" id="floating-whatsapp-btn" data-tooltip="Contact on WhatsApp">
        //             ${icons.whatsapp_icon}
		//         </div>`;
		whatsAppFAB = ``;	
		/*enquiryFormFAB = `<div class="floating-button btn-enquiry" id="floating-enquiry-btn" data-tooltip="Make an Enquiry">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                </div>`;
		footerActionButton = `
							<button class="btn-enquiry" id="modal-enquiry-btn">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
								</svg>
                                Enquire Now
                            </button>`;*/
							enquiryFormFAB = ``;
							footerActionButton = `<button class="btn-whatsapp" id="modal-whatsapp-btn">
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
														<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
													</svg>
													Enquire on WhatsApp
												</button>
												`;
    }
    else {
		hideSection = 'hidden';
		tripsData = data.object;
		whatsAppFAB = `<div class="floating-button btn-whatsapp-float" id="floating-whatsapp-btn" data-tooltip="Contact on WhatsApp">
                    ${icons.whatsapp_icon}
                </div>`;
		enquiryFormFAB = ``;
		footerActionButton = `<button class="btn-whatsapp" id="modal-whatsapp-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                Enquire on WhatsApp
                            </button>
							`;
        headerTabs = `<div class="booking-option experiencesToggle">
                <label><input type="radio" name="searchToggle" value="1" >Flights</label>
                <label  class="checked"><input type="radio" name="searchToggle" value="4" checked>Group Trips</label>
                <label class="hidden"><input type="radio" name="searchToggle" value="2">Hotels</label>
                <label><input type="radio" name="searchToggle" value="3" id="experiencesTab">Packages</label>
            </div>`;
    }

	var className = type == 'default' ? 'experiences__container-new' : 'container';
		
    var groupHtml = `<main class="${className}">
            ${headerTabs}
            <!-- Home Carousel -->
            <div class="home-carousel">
                <div class="carousel-container" id="home-carousel-container">
                    <!-- Will be populated dynamically -->
                </div>
                <div class="carousel-arrows">
                    <div class="carousel-arrow carousel-prev" id="home-carousel-prev">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </div>
                    <div class="carousel-arrow carousel-next" id="home-carousel-next">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </div>
                <div class="carousel-controls" id="home-carousel-controls">
                    <!-- Will be populated dynamically -->
                </div>
            </div>
            
            <!-- Filters Section -->
            <div class="filters ${hideSection}">
                <div class="filter-row">
                    <div class="filter-group">
                        <label for="category">Category</label>
                        <select id="category">
                            <option value="">All Categories</option>
                            <!-- Categories will be populated dynamically -->
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="location">Location</label>
                        <select id="location">
                            <option value="">All Locations</option>
                            <!-- Locations will be populated dynamically -->
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="price">Max Price</label>
                        <input type="number" id="price" placeholder="Any price">
                    </div>
                </div>
                <div class="filter-actions">
                    <button class="btn-outline" id="reset-filters">Reset Filters</button>
                    <button class="btn-primary" id="apply-filters">Apply Filters</button>
                </div>
            </div>

            <!-- Loading Indicator -->
            <div id="loading" class="loading">
                <div class="loading-spinner"></div>
            </div>

            <!-- Content Containers -->
            <div id="trips-container" class="trips-grid active"></div>
            <div id="experiences-container" class="trips-grid"></div>

            <!-- Pagination - Will be populated dynamically -->
            <div id="pagination" class="pagination"></div>
            
            <!-- Enquiry Form -->
            <div class="enquiry-form-container">
                <div class="enquiry-form-header">
                    <h2>Plan Your Dream Trip</h2>
                    <p>Fill out the form below and our travel experts will get back to you with a customized itinerary.</p>
                </div>
                <div class="enquiry-form">
                    <div id="success-message" class="success-message">
                        Thank you for your enquiry! Our team will contact you shortly.
                    </div>
                    <form id="trip-enquiry-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="enquiry_name">Full Name*</label>
                                <input type="text" id="enquiry_name" name="enquiry_name" required>
                                <div class="form-error" id="enquiry_name_error"></div>
                            </div>
                            <div class="form-group">
                                <label for="enquiry_email">Email Address*</label>
                                <input type="email" id="enquiry_email" name="enquiry_email" required>
                                <div class="form-error" id="enquiry_email_error"></div>
                            </div>
                            <div class="form-group">
                                <label for="enquiry_number">Phone Number*</label>
                                <input type="tel" id="enquiry_number" name="enquiry_number" required>
                                <div class="form-error" id="enquiry_number_error"></div>
                            </div>
                            <div class="form-group">
                                <label for="enquiry_destination">Destination*</label>
                                <select id="enquiry_destination" name="enquiry_destination" required>
                                    <option value="">Select Destination</option>
                                    <!-- Will be populated dynamically -->
                                </select>
                                <div class="form-error" id="enquiry_destination_error"></div>
                            </div>
                            <div class="form-group">
                                <label for="enquiry_dot">Travel Date*</label>
                                <input type="date" id="enquiry_dot" name="enquiry_dot" required>
                                <div class="form-error" id="enquiry_dot_error"></div>
                            </div>
                            <div class="form-group">
                                <label for="enquiry_pax">Number of Travelers*</label>
                                <input type="number" id="enquiry_pax" name="enquiry_pax" min="1" required>
                                <div class="form-error" id="enquiry_pax_error"></div>
                            </div>
                            <div class="form-group">
                                <label for="enquiry_budget">Budget Per Person*</label>
                                <input type="number" id="enquiry_budget" name="enquiry_budget" placeholder="Budget in your currency" required>
                                <div class="form-error" id="enquiry_budget_error"></div>
                            </div>
                            <div class="form-group">
                                <label for="enquiry_special_requests">Special Requests</label>
                                <input type="text" id="enquiry_special_requests" name="enquiry_special_requests" placeholder="Any special requirements or preferences">
                            </div>
                            <div class="form-submit">
                                <button type="submit" class="btn-submit">Submit Enquiry</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Trip Details Modal -->
            <div id="trip-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-close" id="modal-close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                    <div class="modal-fixed-header">
                        <div class="modal-header">
                            <div class="modal-header-carousel">
                                <div class="modal-carousel-container" id="modal-carousel-container">
                                    <!-- Will be populated dynamically -->
                                </div>
                                <div class="modal-carousel-arrows">
                                    <div class="modal-carousel-arrow modal-carousel-prev" id="modal-carousel-prev">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                    </div>
                                    <div class="modal-carousel-arrow modal-carousel-next" id="modal-carousel-next">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                <div class="modal-carousel-controls" id="modal-carousel-controls">
                                    <!-- Will be populated dynamically -->
                                </div>
                            </div>
                            <div class="modal-header-content">
                                <div class="modal-title" id="modal-title"></div>
                                <div class="modal-location" id="modal-location">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    <span id="modal-location-text"></span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Photo Gallery -->
                        <div class="modal-gallery">
                            <div class="gallery-container" id="modal-gallery-container">
                                <!-- Gallery images will be populated here -->
                            </div>
                        </div>
                    </div>
                    <div class="modal-scrollable-content">
                        <div class="modal-body">
                            <div class="modal-section">
                                <div class="modal-section-title">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                    About This Trip
                                </div>
                                <div class="trip-description" id="modal-description"></div>
                            </div>

                            <!-- <div class="modal-section">
                                <div class="modal-section-title">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 11 12 14 22 4"></polyline>
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                    </svg>
                                    Inclusions
                                </div>
                                <div id="modal-inclusions"></div>
                            </div>

                            <div class="modal-section">
                                <div class="modal-section-title">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                    Exclusions
                                </div>
                                <div id="modal-exclusions"></div>
                            </div> -->

                            <div class="modal-section">
                                <div class="modal-section-title">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    Itinerary
                                </div>
                                <div class="itinerary-list" id="modal-itinerary"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="modal-price" id="modal-price"></div>
                        <div class="modal-actions">
                            ${footerActionButton}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Popup Enquiry Form -->
            <div id="enquiry-popup" class="enquiry-popup">
                <div class="enquiry-popup-content">
                    <div class="enquiry-popup-close" id="enquiry-popup-close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                    <div class="enquiry-form-header">
                        <h2>Quick Enquiry</h2>
                        <p>Fill out this form and we'll get back to you as soon as possible.</p>
                    </div>
                    <div class="enquiry-form">
                        <div id="popup-success-message" class="success-message">
                            Thank you for your enquiry! Our team will contact you shortly.
                        </div>
                        <form id="popup-enquiry-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="popup_enquiry_name">Full Name*</label>
                                    <input type="text" id="popup_enquiry_name" name="popup_enquiry_name" required>
                                    <div class="form-error" id="popup_enquiry_name_error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="popup_enquiry_email">Email Address*</label>
                                    <input type="email" id="popup_enquiry_email" name="popup_enquiry_email" required>
                                    <div class="form-error" id="popup_enquiry_email_error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="popup_enquiry_number">Phone Number*</label>
                                    <input type="tel" id="popup_enquiry_number" name="popup_enquiry_number" required>
                                    <div class="form-error" id="popup_enquiry_number_error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="popup_enquiry_destination">Destination*</label>
                                    <select id="popup_enquiry_destination" name="popup_enquiry_destination" required>
                                        <option value="">Select Destination</option>
                                        <!-- Will be populated dynamically -->
                                    </select>
                                    <div class="form-error" id="popup_enquiry_destination_error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="popup_enquiry_dot">Travel Date*</label>
                                    <input type="date" id="popup_enquiry_dot" name="popup_enquiry_dot" required>
                                    <div class="form-error" id="popup_enquiry_dot_error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="popup_enquiry_pax">Number of Travelers*</label>
                                    <input type="number" id="popup_enquiry_pax" name="popup_enquiry_pax" min="1" required>
                                    <div class="form-error" id="popup_enquiry_pax_error"></div>
                                </div>
                                <div class="form-submit">
                                    <button type="submit" class="btn-submit">Submit Enquiry</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Floating Action Buttons -->
            <div class="floating-buttons">
                ${enquiryFormFAB}
                ${whatsAppFAB}
            </div>
    </main>`;
		
	if (type == 'default') {
		jQuery('.experiences__body-body').append(groupHtml);
	}
	else {
		jQuery("#main__experiences-box").append(groupHtml);
	}

    // Store the trips data
    let filteredTrips = [];
    let experiencesData = [];
    var itemsPerPage = 9;
    let currentPage = 1;
    let selectedTripId = null;
    let currentView = 'trips'; // Default view is trips

    // Carousel variables
    let homeCarouselInterval = null;
    let modalCarouselInterval = null;
    let homeCurrentSlide = 0;
    let modalCurrentSlide = 0;
    let homeUserInteracted = false;
    let modalUserInteracted = false;
    let homeTotalSlides = 0;
    let modalTotalSlides = 0;

    // DOM elements
    var tripsContainer = document.getElementById("trips-container");
    var experiencesContainer = document.getElementById("experiences-container");
    var paginationContainer = document.getElementById("pagination");
    var loadingElement = document.getElementById("loading");
    var categorySelect = document.getElementById("category");
    var locationSelect = document.getElementById("location");
    var priceInput = document.getElementById("price");
    var applyFiltersBtn = document.getElementById("apply-filters");
    var resetFiltersBtn = document.getElementById("reset-filters");

    // Update the modal HTML structure to include a scrollable wrapper
    var modal = document.getElementById("trip-modal");
    var modalContent = modal.querySelector(".modal-content");

    // Wrap the body, gallery, and footer in a scrollable container
    var modalBody = document.querySelector(".modal-body");
    var modalGallery = document.querySelector(".modal-gallery");
    var modalFooter = document.querySelector(".modal-footer");

    var modalClose = document.getElementById("modal-close");
	var modalWhatsappBtn = document.getElementById("modal-whatsapp-btn");
	var modalEnquiryBtn = document.getElementById("modal-enquiry-btn");
    var modalGalleryContainer = document.getElementById("modal-gallery-container");
    var enquiryForm = document.getElementById("trip-enquiry-form");
    var enquiryDestination = document.getElementById("enquiry_destination");
    var successMessage = document.getElementById("success-message");

    // Popup elements
    var enquiryPopup = document.getElementById("enquiry-popup");
    var enquiryPopupClose = document.getElementById("enquiry-popup-close");
    var popupEnquiryForm = document.getElementById("popup-enquiry-form");
    var popupEnquiryDestination = document.getElementById("popup_enquiry_destination");
    var popupSuccessMessage = document.getElementById("popup-success-message");
    var floatingEnquiryBtn = document.getElementById("floating-enquiry-btn");
    var floatingWhatsappBtn = document.getElementById("floating-whatsapp-btn");

    // Carousel elements
    var homeCarouselContainer = document.getElementById("home-carousel-container");
    var homeCarouselControls = document.getElementById("home-carousel-controls");
    var homeCarouselPrev = document.getElementById("home-carousel-prev");
    var homeCarouselNext = document.getElementById("home-carousel-next");
    var modalCarouselContainer = document.getElementById("modal-carousel-container");
    var modalCarouselControls = document.getElementById("modal-carousel-controls");
    var modalCarouselPrev = document.getElementById("modal-carousel-prev");
    var modalCarouselNext = document.getElementById("modal-carousel-next");

    // Initialize the application
    fetchTripsData(tripsData, type);

    // Add tab switching functionality
    if (type !== 'default') {
        var experiencesTab = document.getElementById('experiencesTab');
        if (experiencesTab) {
            experiencesTab.addEventListener('click', function() {
                switchView('experiences');
                // Fetch experiences data if not already loaded
                if (experiencesData.length === 0) {
                    fetchExperiencesData();
                }
            });

            // Add click handler for Group Trips tab
            var groupTripsTab = document.querySelector('input[value="4"]');
            if (groupTripsTab) {
                groupTripsTab.parentElement.addEventListener('click', function() {
                    switchView('trips');
                });
            }
        }
    }

    // Function to switch between trips and experiences views
    function switchView(view) {
        currentView = view;
        currentPage = 1;

        if (view === 'trips') {
            tripsContainer.classList.add('active');
            experiencesContainer.classList.remove('active');
            document.querySelector('label[value="4"]')?.classList.add('checked');
            document.querySelector('label[value="3"]')?.classList.remove('checked');
            renderTrips();
        } else {
            tripsContainer.classList.remove('active');
            experiencesContainer.classList.add('active');
            document.querySelector('label[value="4"]')?.classList.remove('checked');
            document.querySelector('label[value="3"]')?.classList.add('checked');
            renderExperiences();
        }
    }

    // Function to fetch experiences data
    function fetchExperiencesData() {
        loadingElement.style.display = "flex";
        
        // Simulate API call - in a real app, you would fetch from an API
        setTimeout(() => {
            // For demo purposes, we'll use the trips data as experiences data
            // In a real app, you would fetch the actual experiences data
            experiencesData = tripsData.map(trip => ({
                ...trip,
                isExperience: true
            }));
            
            loadingElement.style.display = "none";
            renderExperiences();
        }, 500);
    }

    // Event listeners
    applyFiltersBtn.addEventListener("click", applyFilters);
    resetFiltersBtn.addEventListener("click", resetFilters);
	modalClose.addEventListener("click", closeModal);
	
	if (modalWhatsappBtn) {
		modalWhatsappBtn.addEventListener("click", () => {
			sendWhatsAppEnquiry(selectedTripId);
		});
	}
	
	if (modalEnquiryBtn) {
		modalEnquiryBtn.addEventListener("click", openEnquiryPopup);
	}

    // Add scroll event listener for header effects
    window.addEventListener("scroll", () => {
        var header = document.querySelector("header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // Carousel event listeners
    homeCarouselPrev.addEventListener("click", () => {
        homeUserInteracted = true;
        moveHomeCarousel(-1);
    });

    homeCarouselNext.addEventListener("click", () => {
        homeUserInteracted = true;
        moveHomeCarousel(1);
    });

    modalCarouselPrev.addEventListener("click", () => {
        modalUserInteracted = true;
        moveModalCarousel(-1);
    });

    modalCarouselNext.addEventListener("click", () => {
        modalUserInteracted = true;
        moveModalCarousel(1);
    });

    // Popup event listeners
    enquiryPopupClose.addEventListener("click", closeEnquiryPopup);

	if (floatingEnquiryBtn) {
		floatingEnquiryBtn.addEventListener("click", openEnquiryPopup);
	}

	if (floatingWhatsappBtn) {
		floatingWhatsappBtn.addEventListener("click", () => {
			if (selectedTripId) {
				sendWhatsAppEnquiry(selectedTripId);
			} else {
				var selectedTab = jQuery('.experiencesToggle label.checked input').val();
				var text = selectedTab == 1 ? 'booking flights' : selectedTab == 4 ? 'booking Group Trips' : selectedTab == 3 ? 'booking Packages' : 'booking Hotels';
				sendWhatsAppEnquiryGlobal(text, '', '');
			}
		});
	}

    // Enquiry form submission
    enquiryForm.addEventListener("submit", function (e) {
        e.preventDefault();
        submitEnquiryForm(this, successMessage);
    });

    // Popup enquiry form submission
    popupEnquiryForm.addEventListener("submit", function (e) {
        e.preventDefault();
        submitEnquiryForm(this, popupSuccessMessage, true);
    });

    // Open enquiry popup
    function openEnquiryPopup() {
        enquiryPopup.style.display = "flex";

        // Trigger reflow for animation
        void enquiryPopup.offsetWidth;

        // Add show class for animation
        enquiryPopup.classList.add("show");

        // Set the destination in the popup form if a trip is selected
        if (selectedTripId) {
            var trip = currentView === 'trips' ? 
                tripsData.find((t) => t.id === selectedTripId) : 
                experiencesData.find((t) => t.id === selectedTripId);
                
            if (trip && trip.location) {
                var destinationOptions = Array.from(popupEnquiryDestination.options);
                var matchingOption = destinationOptions.find(
                    (option) => option.value === trip.location
                );
                if (matchingOption) {
                    popupEnquiryDestination.value = trip.location;
                }
            }
        }
    }

    // Close enquiry popup
    function closeEnquiryPopup() {
        // Remove show class for animation
        enquiryPopup.classList.remove("show");

        // Wait for animation to complete before hiding
        setTimeout(() => {
            enquiryPopup.style.display = "none";
        }, 300);
    }

    // Fetch trips data from the API
    function fetchTripsData(tripsData, type) {
        try {
            // Show loading spinner
            loadingElement.style.display = "flex";

            // Process the data
            processTripsData(tripsData, type);

            // Initialize home carousel
            initHomeCarousel(tripsData);
        } catch (error) {
            console.error("Error fetching trips data:", error);
            loadingElement.innerHTML = `
                <div class="no-results">
                    <h3>Error loading trips</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    // Initialize home carousel
    function initHomeCarousel(tripsData) {
        // Get featured trips (first 5 or all if less than 5)
        var featuredTrips = tripsData.slice(0, Math.min(5, tripsData.length));
        homeTotalSlides = featuredTrips.length;

        // Clear existing content
        homeCarouselContainer.innerHTML = "";
		homeCarouselControls.innerHTML = "";
		

        // Create slides
        featuredTrips.reverse().forEach((trip, index) => {
            // Get the first media item or use a placeholder
            var mediaUrl =
                trip.media && trip.media.length > 0
                    ? trip.media[0].media_url
                    : "/placeholder.svg";

            // Create slide
            var slide = document.createElement("div");
            slide.className = "carousel-slide";
            slide.innerHTML = `
                <img src="${renderUserProfileImage(mediaUrl)}" alt="${trip.title}">
                <div class="carousel-content">
                    <h2 class="carousel-title">${trip.title}</h2>
                    <p class="carousel-description">${trip.location} - ${
                trip.currency
            } ${trip.pricing.toLocaleString()} + 5% GST per person</p>
                    <button class="btn-primary view-trip-btn hidden" data-id="${
                        trip.id
                    }">View Details</button>
                </div>
            `;

            // Add click event to view trip button
            slide.querySelector(".carousel-content").addEventListener("click", () => {
				openTripDetails(trip);
				var currentUrl = window.location.href;
				var urlParts = '/packages/';
				if (currentUrl.includes("/group-trips") || currentUrl.includes("/groupTrips")) {
					urlParts = '/group-trips/';
				}
				window.history.pushState({ page: "group-trips" }, "group trips", urlParts + trip.title.replaceAll(' ', '-') + '-' + trip.id);
            });
            
            slide.addEventListener("click", () => {
				openTripDetails(trip);
				var currentUrl = window.location.href;
				var urlParts = '/packages/';
				if (currentUrl.includes("/group-trips") || currentUrl.includes("/groupTrips")) {
					urlParts = '/group-trips/';
				}
				window.history.pushState({ page: "group-trips" }, "group trips", urlParts + trip.title.replaceAll(' ', '-') + '-' + trip.id);
			});

            // Add slide to container
            homeCarouselContainer.appendChild(slide);

            // Create dot control
            var dot = document.createElement("div");
            dot.className = "carousel-dot";
            if (index === 0) dot.classList.add("active");
            dot.addEventListener("click", () => {
                homeUserInteracted = true;
                goToHomeSlide(index);
            });
            homeCarouselControls.appendChild(dot);
        });

        // Start auto-advance
        startHomeCarousel();
    }

    // Start home carousel auto-advance
    function startHomeCarousel() {
        // Clear any existing interval
        if (homeCarouselInterval) {
            clearInterval(homeCarouselInterval);
        }

        // Set new interval
        homeCarouselInterval = setInterval(() => {
            if (!homeUserInteracted) {
                moveHomeCarousel(1);
            }
        }, 5000); // Auto-advance every 5 seconds
    }

    // Move home carousel
    function moveHomeCarousel(direction) {
        homeCurrentSlide =
            (homeCurrentSlide + direction + homeTotalSlides) % homeTotalSlides;
        goToHomeSlide(homeCurrentSlide);

        // Reset auto-advance after 5 seconds of user inactivity
        setTimeout(() => {
            homeUserInteracted = false;
        }, 5000);
    }

    // Go to specific home slide
    function goToHomeSlide(slideIndex) {
        homeCurrentSlide = slideIndex;
        homeCarouselContainer.style.transform = `translateX(-${slideIndex * 100}%)`;

        // Update active dot
        var dots = homeCarouselControls.querySelectorAll(".carousel-dot");
        dots.forEach((dot, index) => {
            if (index === slideIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    // Initialize modal carousel
    function initModalCarousel(trip) {
        if (!trip.media || trip.media.length === 0) {
            // If no media, add placeholder
            modalCarouselContainer.innerHTML = `
                <div class="modal-carousel-slide">
                    <img src="/placeholder.svg" alt="${trip.title}">
                </div>
            `;
            modalCarouselControls.innerHTML = "";
            modalTotalSlides = 1;
            return;
        }

        modalTotalSlides = trip.media.length;
        modalCurrentSlide = 0;

        // Clear existing content
        modalCarouselContainer.innerHTML = "";
        modalCarouselControls.innerHTML = "";

        // Create slides
        trip.media.forEach((mediaItem, index) => {
            // Create slide
            var slide = document.createElement("div");
            slide.className = "modal-carousel-slide";
            slide.innerHTML = `<img src="${renderUserProfileImage(mediaItem.media_url)}" alt="${
                trip.title
            } - Image ${index + 1}">`;

            // Add slide to container
            modalCarouselContainer.appendChild(slide);

            // Create dot control
            var dot = document.createElement("div");
            dot.className = "modal-carousel-dot";
            if (index === 0) dot.classList.add("active");
            dot.addEventListener("click", () => {
                modalUserInteracted = true;
                goToModalSlide(index);
            });
            modalCarouselControls.appendChild(dot);
        });

        // Start auto-advance
        startModalCarousel();
    }

    // Start modal carousel auto-advance
    function startModalCarousel() {
        // Clear any existing interval
        if (modalCarouselInterval) {
            clearInterval(modalCarouselInterval);
        }

        // Set new interval
        modalCarouselInterval = setInterval(() => {
            if (!modalUserInteracted) {
                moveModalCarousel(1);
            }
        }, 3000); // Auto-advance every 3 seconds
    }

    // Move modal carousel
    function moveModalCarousel(direction) {
        modalCurrentSlide =
            (modalCurrentSlide + direction + modalTotalSlides) % modalTotalSlides;
        goToModalSlide(modalCurrentSlide);

        // Reset auto-advance after 5 seconds of user inactivity
        setTimeout(() => {
            modalUserInteracted = false;
        }, 5000);
    }

    // Go to specific modal slide
    function goToModalSlide(slideIndex) {
        modalCurrentSlide = slideIndex;
        modalCarouselContainer.style.transform = `translateX(-${
            slideIndex * 100
        }%)`;

        // Update active dot
        var dots = modalCarouselControls.querySelectorAll(".modal-carousel-dot");
        dots.forEach((dot, index) => {
            if (index === slideIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });

        // Update gallery active state
        document.querySelectorAll(".gallery-image").forEach((image, index) => {
            if (index === slideIndex) {
                image.classList.add("active");
            } else {
                image.classList.remove("active");
            }
        });
    }

    // Process the trips data to extract categories and locations
    function processTripsData(tripsData, type) {
        
        if (type == 'default') {
            // Remove 0th index from tripsData
            tripsData.shift();
        }
        
        // Extract unique categories
        var categories = [...new Set(tripsData.map((trip) => trip.category))];

        // Clear existing options except the default one
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }

        // Add category options
        categories.forEach((category) => {
            var option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Extract unique locations
        var locations = [...new Set(tripsData.map((trip) => trip.location))];

        // Clear existing options except the default one
        while (locationSelect.options.length > 1) {
            locationSelect.remove(1);
        }

		// Sort the locations alphabetically
		locations.sort();
        // Add location options
        locations.forEach((location) => {
            var option = document.createElement("option");
            option.value = location;
            option.textContent = location;
            locationSelect.appendChild(option);
        });

        // Populate destination dropdown for enquiry form
        while (enquiryDestination.options.length > 1) {
            enquiryDestination.remove(1);
        }

        locations.forEach((location) => {
            var option = document.createElement("option");
            option.value = location;
            option.textContent = location;
            enquiryDestination.appendChild(option);
        });

        // Populate destination dropdown for popup enquiry form
        while (popupEnquiryDestination.options.length > 1) {
            popupEnquiryDestination.remove(1);
        }

        locations.forEach((location) => {
            var option = document.createElement("option");
            option.value = location;
            option.textContent = location;
            popupEnquiryDestination.appendChild(option);
        });

        // Set initial filtered trips
        filteredTrips = [...tripsData];

        // Hide loading and render trips
        loadingElement.style.display = "none";
        renderTrips();
    }

    // Apply filters to the trips data
    function applyFilters() {
        var category = categorySelect.value;
        var location = locationSelect.value;
        var maxPrice = priceInput.value
            ? Number.parseInt(priceInput.value)
            : Number.POSITIVE_INFINITY;

        if (currentView === 'trips') {
            filteredTrips = tripsData.filter((trip) => {
                var categoryMatch = !category || trip.category === category;
                var locationMatch = !location || trip.location === location;
                var priceMatch = !maxPrice || trip.pricing <= maxPrice;

                return categoryMatch && locationMatch && priceMatch;
            });
            currentPage = 1;
            renderTrips();
        } else {
            // Filter experiences
            filteredExperiences = experiencesData.filter((exp) => {
                var categoryMatch = !category || exp.category === category;
                var locationMatch = !location || exp.location === location;
                var priceMatch = !maxPrice || exp.pricing <= maxPrice;

                return categoryMatch && locationMatch && priceMatch;
            });
            currentPage = 1;
            renderExperiences();
        }
    }

    // Reset all filters
    function resetFilters() {
        categorySelect.value = "";
        locationSelect.value = "";
        priceInput.value = "";

        if (currentView === 'trips') {
            filteredTrips = [...tripsData];
            currentPage = 1;
            renderTrips();
        } else {
            filteredExperiences = [...experiencesData];
            currentPage = 1;
            renderExperiences();
        }
    }

    // Render trips to the container
    function renderTrips() {
        tripsContainer.innerHTML = "";

        if (filteredTrips.length === 0) {
            tripsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No trips found</h3>
                    <p>Try adjusting your filters to find more trips.</p>
                </div>
            `;
            paginationContainer.innerHTML = "";
            return;
        }

        // Calculate pagination
        var startIndex = (currentPage - 1) * itemsPerPage;
		var endIndex = Math.min(startIndex + itemsPerPage, filteredTrips.length);
		endIndex = endIndex + 1;
        var currentTrips = filteredTrips.slice(startIndex, endIndex);

        // Render each trip
        currentTrips.forEach((trip) => {
            var tripCard = document.createElement("div");
            tripCard.className = "trip-card";
            tripCard.dataset.id = trip.id;

            // Get the first media item or use a placeholder
            var mediaUrl =
                trip.media && trip.media.length > 0
                    ? trip.media[0].media_url
                    : "/placeholder.svg";

            // Strip HTML tags and limit description length
            var description = trip.content
                ? trip.content.replace(/<[^>]*>?/gm, "").substring(0, 100) + "..."
                : "No description available";

            tripCard.innerHTML = `
                <div class="trip-image">
                    <img src="${renderUserProfileImage(mediaUrl)}" alt="${trip.title}">
                    <div class="trip-category hidden">${trip.category}</div>
                </div>
                <div class="trip-content">
                    <h3 class="trip-title">${trip.title}</h3>
                    <div class="trip-location">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${trip.location}
                    </div>
                    <p>${description}</p>
                    <div class="trip-details">
                        <div class="trip-price">
                            ${trip.currency} ${trip.pricing.toLocaleString()}<br>
                            <span>per person</span>
                        </div>
                        <div class="trip-action">View Details</div>
                    </div>
                </div>
            `;

            tripCard.addEventListener("click", () => {
				openTripDetails(trip);
				var currentUrl = window.location.href;
				var urlParts = '/packages/';
				if (currentUrl.includes("/group-trips") || currentUrl.includes("/groupTrips")) {
					urlParts = '/group-trips/';
				}
				window.history.pushState({ page: "group-trips" }, "group trips", urlParts + trip.title.replaceAll(' ', '-') + '-' + trip.id);
            });

            tripsContainer.appendChild(tripCard);
        });

        // Render pagination
        renderPagination(filteredTrips.length);

        // Add animation to trip cards on scroll
        observeCards();
    }

    // Render experiences to the container
    function renderExperiences() {
        experiencesContainer.innerHTML = "";

        if (experiencesData.length === 0) {
            experiencesContainer.innerHTML = `
                <div class="no-results">
                    <h3>Loading experiences...</h3>
                </div>
            `;
            paginationContainer.innerHTML = "";
            return;
        }

        if (filteredExperiences && filteredExperiences.length === 0) {
            experiencesContainer.innerHTML = `
                <div class="no-results">
                    <h3>No experiences found</h3>
                    <p>Try adjusting your filters to find more experiences.</p>
                </div>
            `;
            paginationContainer.innerHTML = "";
            return;
        }

        // Use filtered experiences if available, otherwise use all experiences
        var dataToRender = filteredExperiences || experiencesData;

        // Calculate pagination
        var startIndex = (currentPage - 1) * itemsPerPage;
        var endIndex = Math.min(startIndex + itemsPerPage, dataToRender.length);
        var currentExperiences = dataToRender.slice(startIndex, endIndex);

        // Render each experience
        currentExperiences.forEach((experience) => {
            var experienceCard = document.createElement("div");
            experienceCard.className = "trip-card experience-card";
            experienceCard.dataset.id = experience.id;

            // Get the first media item or use a placeholder
            var mediaUrl =
                experience.media && experience.media.length > 0
                    ? experience.media[0].media_url
                    : "/placeholder.svg";

            // Strip HTML tags and limit description length
            var description = experience.content
                ? experience.content.replace(/<[^>]*>?/gm, "").substring(0, 100) + "..."
                : "No description available";

            experienceCard.innerHTML = `
                <div class="trip-image">
                    <img src="${renderUserProfileImage(mediaUrl)}" alt="${experience.title}">
                    <div class="trip-category hidden">${experience.category}</div>
                </div>
                <div class="trip-content">
                    <h3 class="trip-title">${experience.title}</h3>
                    <div class="trip-location">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${experience.location}
                    </div>
                    <p>${description}</p>
                    <div class="trip-details">
                        <div class="trip-price">
                            ${experience.currency} ${experience.pricing.toLocaleString()}<br>
                            <span>per person</span>
                        </div>
                        <div class="trip-action">View Details</div>
                    </div>
                </div>
            `;

            experienceCard.addEventListener("click", () => {
                openTripDetails(experience, true);
            });

            experiencesContainer.appendChild(experienceCard);
        });

        // Render pagination
        renderPagination(dataToRender.length);

        // Add animation to experience cards on scroll
        observeCards();
    }

    // Observe cards for scroll animation
    function observeCards() {
        if ("IntersectionObserver" in window) {
            var observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.style.opacity = "1";
                            entry.target.style.transform = "translateY(0)";
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            var selector = currentView === 'trips' ? ".trip-card" : ".experience-card";
            document.querySelectorAll(selector).forEach((card, index) => {
                card.style.opacity = "0";
                card.style.transform = "translateY(30px)";
                card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                card.style.transitionDelay = `${index * 0.05}s`;
                observer.observe(card);
            });
        }
    }

    // Render pagination controls
    function renderPagination(totalItems) {
        paginationContainer.innerHTML = "";

        var totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) {
            return;
        }

        // Previous button
        var prevButton = document.createElement("button");
        prevButton.innerHTML = "&laquo;";
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                if (currentView === 'trips') {
                    renderTrips();
                } else {
                    renderExperiences();
                }
            }
        });
        paginationContainer.appendChild(prevButton);

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            var pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.className = i === currentPage ? "active" : "";
            pageButton.addEventListener("click", () => {
                currentPage = i;
                if (currentView === 'trips') {
                    renderTrips();
                } else {
                    renderExperiences();
                }
            });
            paginationContainer.appendChild(pageButton);
        }

        // Next button
        var nextButton = document.createElement("button");
        nextButton.innerHTML = "&raquo;";
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                if (currentView === 'trips') {
                    renderTrips();
                } else {
                    renderExperiences();
                }
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    // Open trip details modal with smooth animation
    function openTripDetails(trip, isExperience = false) {
        // Store the selected trip ID for WhatsApp enquiry
        selectedTripId = trip.id;
        modalUserInteracted = false;

        // Set modal content
        var modalTitle = document.getElementById("modal-title");
        var modalLocationText = document.getElementById("modal-location-text");
        var modalDescription = document.getElementById("modal-description");
        var modalPrice = document.getElementById("modal-price");
        // var modalInclusions = document.getElementById("modal-inclusions");
        // var modalExclusions = document.getElementById("modal-exclusions");
        var modalItinerary = document.getElementById("modal-itinerary");

        // Set title and location
        modalTitle.textContent = trip.title;
        modalLocationText.textContent = trip.location;

        // Set description
        modalDescription.innerHTML = trip.content || "No description available";

        // Set price
        modalPrice.innerHTML = `${
            trip.currency
        } ${trip.pricing.toLocaleString()} + 5% GST <span>per person</span>`;

        // Extract inclusions and exclusions from content
        // extractSections(trip.content, modalInclusions, modalExclusions);

        // Render itinerary if available
        renderItinerary(trip, modalItinerary);

        // Initialize modal carousel
        initModalCarousel(trip);

        // Render photo gallery
        renderGallery(trip);

        // Show modal with animation
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevent scrolling

        // Trigger reflow for animation
        void modal.offsetWidth;

        // Add show class for animation
        modal.classList.add("show");

        // Set the destination in the enquiry form if it's available
        if (trip.location) {
            var destinationOptions = Array.from(enquiryDestination.options);
            var matchingOption = destinationOptions.find(
                (option) => option.value === trip.location
            );
            if (matchingOption) {
                enquiryDestination.value = trip.location;
            }

            var popupDestinationOptions = Array.from(
                popupEnquiryDestination.options
            );
            var popupMatchingOption = popupDestinationOptions.find(
                (option) => option.value === trip.location
            );
            if (popupMatchingOption) {
                popupEnquiryDestination.value = trip.location;
            }
        }
    }

    // Render photo gallery
    function renderGallery(trip) {
        modalGalleryContainer.innerHTML = "";

        if (trip.media && trip.media.length > 0) {
            trip.media.forEach((mediaItem, index) => {
                var img = document.createElement("img");
                img.src = renderUserProfileImage(mediaItem.media_url);
                img.alt = `${trip.title} - Image ${index + 1}`;
                img.className = "gallery-image";
                if (index === 0) img.classList.add("active");

                img.addEventListener("click", () => {
                    modalUserInteracted = true;
                    goToModalSlide(index);
                });

                modalGalleryContainer.appendChild(img);
            });
        } else {
            modalGalleryContainer.innerHTML = "<p>No additional images available</p>";
        }
    }

    // Extract inclusions and exclusions sections from content
    // function extractSections(content, inclusionsElement, exclusionsElement) {
    //     if (!content) {
    //         inclusionsElement.innerHTML = "<p>No inclusions specified</p>";
    //         exclusionsElement.innerHTML = "<p>No exclusions specified</p>";
    //         return;
    //     }

    //     var contentHTML = document.createElement("div");
    //     contentHTML.innerHTML = content;

    //     // Find inclusions
    //     var inclusionsSection = Array.from(
    //         contentHTML.querySelectorAll("p")
    //     ).find((p) => p.textContent.includes("Inclusions:"));

    //     if (inclusionsSection) {
    //         var inclusionsList = inclusionsSection.nextElementSibling;
    //         if (inclusionsList && inclusionsList.tagName === "UL") {
    //             inclusionsElement.innerHTML = inclusionsList.outerHTML;
    //         } else {
    //             inclusionsElement.innerHTML = "<p>No inclusions specified</p>";
    //         }
    //     } else {
    //         inclusionsElement.innerHTML = "<p>No inclusions specified</p>";
    //     }

    //     // Find exclusions
    //     var exclusionsSection = Array.from(
    //         contentHTML.querySelectorAll("p")
    //     ).find((p) => p.textContent.includes("Exclusions:"));

    //     if (exclusionsSection) {
    //         var exclusionsList = exclusionsSection.nextElementSibling;
    //         if (exclusionsList && exclusionsList.tagName === "UL") {
    //             exclusionsElement.innerHTML = exclusionsList.outerHTML;
    //         } else {
    //             exclusionsElement.innerHTML = "<p>No exclusions specified</p>";
    //         }
    //     } else {
    //         exclusionsElement.innerHTML = "<p>No exclusions specified</p>";
    //     }
    // }

    // Render itinerary in the modal with collapsible dropdowns
    function renderItinerary(trip, itineraryContainer) {
        itineraryContainer.innerHTML = "";

        if (
            trip.itinerary &&
            trip.itinerary.length > 0 &&
            trip.itinerary[0].content
        ) {
            trip.itinerary[0].content.forEach((day, index) => {
                var dayElement = document.createElement("div");
                dayElement.className = "itinerary-day";
                if (index === 0) dayElement.classList.add("active"); // Open first day by default

                // Create day header (clickable)
                var dayHeader = document.createElement("div");
                dayHeader.className = "day-header";
                dayHeader.innerHTML = `
                    <div class="day-title">${day.day}</div>
                    <div class="day-toggle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                `;

                // Create day content (collapsible)
                var dayContent = document.createElement("div");
                dayContent.className = "day-content";
                dayContent.innerHTML = day.itinerary_content;

                // Add image if available from trip media
                if (trip.media && trip.media.length > index + 1) {
                    var imageContainer = document.createElement("div");
                    imageContainer.className = "day-image-container";

                    var img = document.createElement("img");
                    img.src = renderUserProfileImage(trip.media[index + 1].media_url);
                    img.alt = `${day.day} - ${trip.title}`;
                    img.className = "day-image";

                    imageContainer.appendChild(img);
                    dayContent.appendChild(imageContainer);
                }

                // Add click event to toggle content
                dayHeader.addEventListener("click", () => {
                    dayElement.classList.toggle("active");
                });

                // Append elements to day container
                dayElement.appendChild(dayHeader);
                dayElement.appendChild(dayContent);

                // Append day to itinerary container
                itineraryContainer.appendChild(dayElement);
            });
        } else {
            itineraryContainer.innerHTML = "<p>No itinerary available</p>";
        }
    }

    // Close trip details modal with smooth animation
    function closeModal() {
        // Stop modal carousel
        if (modalCarouselInterval) {
            clearInterval(modalCarouselInterval);
            modalCarouselInterval = null;
        }

        // Remove show class for animation
        modal.classList.remove("show");

        // Wait for animation to complete before hiding
        setTimeout(() => {
            modal.style.display = "none";
            document.body.style.overflow = "auto"; // Enable scrolling
		}, 500);
		var currentUrl = window.location.href;
		var urlParts = '/experiences';
		if (currentUrl.includes("/group-trips") || currentUrl.includes("/groupTrips")) {
			urlParts = '/groupTrips';
		}
		window.history.pushState({ page: "group-trips" }, "group trips", urlParts);
    }

	function sendWhatsAppEnquiry(tripId) {
		// Find the trip details
		var trip = currentView === 'trips' ? 
			tripsData.find((t) => t.id === tripId) : 
			experiencesData.find((t) => t.id === tripId);
			
		if (!trip) return;
	
		// Get host phone number with country code
		var phoneNumber = '8448154356';
		var countryCode = "+91"; // Default to India if not specified
	
		// Prepare message text
		var message = `Hello! I'm interested in the "${trip.title}" trip. Could you please provide more information?`;
		
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
		var tags = [`interested_in_trip${trip.title}`,  "general", 'enquired_trip_via_tech', `trip_${trip.id}`, trip.category || "general"];
		
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
				last_interested_trip: trip.title,
				interest_timestamp: new Date().toISOString()
			},
			tags: tags  // Make sure this is an array of strings
		};
		
		console.log("Sending user payload with tags:", JSON.stringify(userPayload));
		
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
				
				// 3. Open WhatsApp after tracking
				openWhatsApp();
			},
			error: function(xhr, status, error) {
				console.error("Error tracking user in Interakt:", error);
				console.log("Status code:", xhr.status);
				console.log("Response:", xhr.responseText);
				
				// Still open WhatsApp even if tracking fails
				openWhatsApp();
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
					"Trip ID": trip.id, // Id of the Package / Group Trip
					"Trip Title": trip.title,
					"Trip Category": trip.category || "general",
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
	
	// // Function to test tag updates directly
	// function testTagUpdate() {
	// 	var apiKey = "cDRoNms0ZXBIRjl1SENPQzlHMVVnallzdTBSeWdtYnlNZEgtUE5ETkdOVTo=";
	// 	var userPhone = '9625251633';
		
	// 	// Create a simple payload with just tags
	// 	var tagUpdatePayload = {
	// 		phoneNumber: userPhone,
	// 		countryCode: "+91",
	// 		tags: ["interested_in_trip", "test_tag", "potential_customer"]
	// 	};
		
	// 	console.log("Testing tag update with payload:", JSON.stringify(tagUpdatePayload));
		
	// 	// Make the API call to update tags
	// 	$.ajax({
	// 		url: "https://api.interakt.ai/v1/public/track/users/",
	// 		type: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 			"Authorization": "Basic " + apiKey
	// 		},
	// 		data: JSON.stringify(tagUpdatePayload),
	// 		success: function(response) {
	// 			console.log("Tags updated successfully", response);
	// 		},
	// 		error: function(xhr, status, error) {
	// 			console.error("Error updating tags:", error);
	// 			console.log("Status code:", xhr.status);
	// 			console.log("Response:", xhr.responseText);
	// 		}
	// 	});
	// }

    // Submit enquiry form
    function submitEnquiryForm(form, successMessageElement, isPopup = false) {
        // Reset error messages
        form.querySelectorAll(".form-error").forEach((error) => {
            error.style.display = "none";
            error.textContent = "";
        });

        try {
            // Helper function to get input value and validate
            function getInputValueAndValidate(id, errorMessage) {
                var input = document.getElementById(id);
                var value = input.value.trim();

                if (!value) {
                    var errorElement = document.getElementById(`${id}_error`);
                    if (errorElement) {
                        errorElement.textContent = errorMessage;
                        errorElement.style.display = "block";
                    }
                    throw new Error(errorMessage);
                }

                return value;
            }

            // Build payload
            var payload = {
                name: getInputValueAndValidate(
                    isPopup ? "popup_enquiry_name" : "enquiry_name",
                    "Please enter your Name"
                ),
                email: getInputValueAndValidate(
                    isPopup ? "popup_enquiry_email" : "enquiry_email",
                    "Please enter your Email"
                ),
                phoneNumber: getInputValueAndValidate(
                    isPopup ? "popup_enquiry_number" : "enquiry_number",
                    "Please enter your Phone Number"
                ),
                destination: getInputValueAndValidate(
                    isPopup ? "popup_enquiry_destination" : "enquiry_destination",
                    "Please enter your Destination"
                ),
                travelDate: getInputValueAndValidate(
                    isPopup ? "popup_enquiry_dot" : "enquiry_dot",
                    "Please enter date of travel"
                ),
                budgetPerPerson: isPopup
                    ? "0"
                    : getInputValueAndValidate(
                            "enquiry_budget",
                            "Please enter your Budget."
                      ),
                numberOfPax: getInputValueAndValidate(
                    isPopup ? "popup_enquiry_pax" : "enquiry_pax",
                    "Please enter number of passengers"
                ),
            };

            // Call API with the Payload
            console.log("Enquiry Payload:", payload);
            jsInit("sendEnquiryDetails", payload);

            // Show success message
            successMessageElement.style.display = "block";

            // Reset form
            form.reset();

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessageElement.style.display = "none";

                // Close popup if it's the popup form
                if (isPopup) {
                    closeEnquiryPopup();
                }
            }, 5000);
        } catch (error) {
            console.error("Form validation error:", error.message);
            // Error is already displayed in the form
        }
    }

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }

        if (event.target === enquiryPopup) {
            closeEnquiryPopup();
        }
    });

    // Clean up carousels when page is unloaded
    window.addEventListener("beforeunload", () => {
        if (homeCarouselInterval) {
            clearInterval(homeCarouselInterval);
        }
        if (modalCarouselInterval) {
            clearInterval(modalCarouselInterval);
        }
	});
    
	loaderMain('global__loading', false);
	
	if ((isMobile() && !isAndroid() && !isIOS()) || isPwa()) {
		modalFooter.style.bottom = "60px";
	}
	else {
		modalFooter.style.bottom = "0px";
	}
	
}

function renderSinglePackageModal(packageData, options = {}) {
    // Default options
    var defaultOptions = {
        showBackdrop: true,
        autoOpen: true,
        onClose: null,
        whatsappNumber: '8448154356',
        countryCode: '+91'
    };
    
    var config = { ...defaultOptions, ...options };
    
    // Create modal HTML structure
    var modalHTML = `
        <div id="single-package-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-close" id="single-modal-close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
                <div class="modal-fixed-header">
                    <div class="modal-header">
                        <div class="modal-header-carousel">
                            <div class="modal-carousel-container" id="single-modal-carousel-container">
                                <!-- Will be populated dynamically -->
                            </div>
                            <div class="modal-carousel-arrows">
                                <div class="modal-carousel-arrow modal-carousel-prev" id="single-modal-carousel-prev">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </div>
                                <div class="modal-carousel-arrow modal-carousel-next" id="single-modal-carousel-next">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <div class="modal-carousel-controls" id="single-modal-carousel-controls">
                                <!-- Will be populated dynamically -->
                            </div>
                        </div>
                        <div class="modal-header-content">
                            <div class="modal-title" id="single-modal-title"></div>
                            <div class="modal-location" id="single-modal-location">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span id="single-modal-location-text"></span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Photo Gallery -->
                    <div class="modal-gallery">
                        <div class="gallery-container" id="single-modal-gallery-container">
                            <!-- Gallery images will be populated here -->
                        </div>
                    </div>
                </div>
                <div class="modal-scrollable-content">
                    <div class="modal-body">
                        <div class="modal-section">
                            <div class="modal-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                About This ${packageData.type === 'package' ? 'Package' : 'Trip'}
                            </div>
                            <div class="trip-description" id="single-modal-description"></div>
                        </div>

                        <!-- <div class="modal-section">
                            <div class="modal-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 11 12 14 22 4"></polyline>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                </svg>
                                Inclusions
                            </div>
                            <div id="single-modal-inclusions"></div>
                        </div>

                        <div class="modal-section">
                            <div class="modal-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Exclusions
                            </div>
                            <div id="single-modal-exclusions"></div>
                        </div> -->

                        <div class="modal-section">
                            <div class="modal-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Itinerary
                            </div>
                            <div class="itinerary-list" id="single-modal-itinerary"></div>
                        </div>
                        
                        <!-- Host Details Section -->
                        <div class="modal-section">
                            <div class="modal-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Host Details
                            </div>
                            <div id="single-modal-host-details"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="modal-price" id="single-modal-price"></div>
                    <div class="modal-actions">
                        <button class="btn-whatsapp" id="single-modal-whatsapp-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Enquire on WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if present
    var existingModal = document.getElementById('single-package-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get modal elements
    var modal = document.getElementById('single-package-modal');
    var modalClose = document.getElementById('single-modal-close');
    var modalCarouselContainer = document.getElementById('single-modal-carousel-container');
    var modalCarouselControls = document.getElementById('single-modal-carousel-controls');
    var modalCarouselPrev = document.getElementById('single-modal-carousel-prev');
    var modalCarouselNext = document.getElementById('single-modal-carousel-next');
    var modalGalleryContainer = document.getElementById('single-modal-gallery-container');
	var modalWhatsappBtn = document.getElementById('single-modal-whatsapp-btn');
	var modalFooter = document.querySelector(".modal-footer");

    // Carousel variables
    let modalCarouselInterval = null;
    let modalCurrentSlide = 0;
    let modalUserInteracted = false;
    let modalTotalSlides = 0;

    // Populate modal content
    populateModalContent();

    // Initialize carousel
    initModalCarousel();

    // Setup event listeners
    setupEventListeners();

    // Show modal if autoOpen is true
    if (config.autoOpen) {
        openModal();
	}
	
	if ((isMobile() && !isAndroid() && !isIOS()) || isPwa()) {
		modalFooter.style.bottom = "60px";
	}
	else {
		modalFooter.style.bottom = "0px";
	}

    // Return public API
    return {
        open: openModal,
        close: closeModal,
        updateContent: populateModalContent
    };

    function populateModalContent() {
        // Set title and location
        document.getElementById('single-modal-title').textContent = packageData.title;
        document.getElementById('single-modal-location-text').textContent = packageData.location;

        // Set description
        document.getElementById('single-modal-description').innerHTML = packageData.content || "No description available";

        // Set price
        document.getElementById('single-modal-price').innerHTML = `${packageData.currency} ${packageData.pricing.toLocaleString()} <span>+ 5% GST per person</span>`;

        // Extract inclusions and exclusions from content
        // extractSections(packageData.content);

        // Render itinerary
        renderItinerary();

        // Render host details
        renderHostDetails();

        // Render photo gallery
        renderGallery();
    }

    // function extractSections(content) {
    //     var inclusionsElement = document.getElementById('single-modal-inclusions');
    //     var exclusionsElement = document.getElementById('single-modal-exclusions');

    //     if (!content) {
    //         inclusionsElement.innerHTML = "<p>No inclusions specified</p>";
    //         exclusionsElement.innerHTML = "<p>No exclusions specified</p>";
    //         return;
    //     }

    //     var contentHTML = document.createElement("div");
    //     contentHTML.innerHTML = content;

    //     // Find inclusions
    //     var inclusionsSection = Array.from(contentHTML.querySelectorAll("p")).find((p) => 
    //         p.textContent.includes("Inclusions:")
    //     );

    //     if (inclusionsSection) {
    //         var inclusionsList = inclusionsSection.nextElementSibling;
    //         if (inclusionsList && inclusionsList.tagName === "UL") {
    //             inclusionsElement.innerHTML = inclusionsList.outerHTML;
    //         } else {
    //             inclusionsElement.innerHTML = "<p>No inclusions specified</p>";
    //         }
    //     } else {
    //         inclusionsElement.innerHTML = "<p>No inclusions specified</p>";
    //     }

    //     // Find exclusions
    //     var exclusionsSection = Array.from(contentHTML.querySelectorAll("p")).find((p) => 
    //         p.textContent.includes("Exclusions:")
    //     );

    //     if (exclusionsSection) {
    //         var exclusionsList = exclusionsSection.nextElementSibling;
    //         if (exclusionsList && exclusionsList.tagName === "UL") {
    //             exclusionsElement.innerHTML = exclusionsList.outerHTML;
    //         } else {
    //             exclusionsElement.innerHTML = "<p>No exclusions specified</p>";
    //         }
    //     } else {
    //         exclusionsElement.innerHTML = "<p>No exclusions specified</p>";
    //     }
    // }

    function renderItinerary() {
        var itineraryContainer = document.getElementById('single-modal-itinerary');
        itineraryContainer.innerHTML = "";

        if (packageData.itinerary && packageData.itinerary.length > 0 && packageData.itinerary[0].content) {
            packageData.itinerary[0].content.forEach((day, index) => {
                var dayElement = document.createElement("div");
                dayElement.className = "itinerary-day";
                if (index === 0) dayElement.classList.add("active");

                var dayHeader = document.createElement("div");
                dayHeader.className = "day-header";
                dayHeader.innerHTML = `
                    <div class="day-title">${day.day}</div>
                    <div class="day-toggle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                `;

                var dayContent = document.createElement("div");
                dayContent.className = "day-content";
                dayContent.innerHTML = day.itinerary_content;

                // Add click event to toggle content
                dayHeader.addEventListener("click", () => {
                    dayElement.classList.toggle("active");
                });

                dayElement.appendChild(dayHeader);
                dayElement.appendChild(dayContent);
                itineraryContainer.appendChild(dayElement);
            });
        } else {
            itineraryContainer.innerHTML = "<p>No itinerary available</p>";
        }
    }

    function renderHostDetails() {
        var hostDetailsContainer = document.getElementById('single-modal-host-details');
        
        if (packageData.hostDetails || packageData.hostname) {
            var hostName = packageData.hostDetails?.userName || packageData.hostname || 'Unknown Host';
            var avgRating = packageData.hostDetails?.avgRatings || packageData.avg_rating || 0;
            var contactNumber = packageData.contact_number || '';
            
            hostDetailsContainer.innerHTML = `
                <div class="host-info">
                    <div class="host-name">
                        <strong>Host:</strong> ${hostName}
                    </div>
                    ${avgRating > 0 ? `
                        <div class="host-rating">
                            <strong>Rating:</strong> ${avgRating.toFixed(1)} ⭐
                        </div>
                    ` : ''}
                    ${contactNumber ? `
                        <div class="host-contact">
                            <strong>Contact:</strong> ${contactNumber}
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            hostDetailsContainer.innerHTML = "<p>No host details available</p>";
        }
    }

    function renderGallery() {
        modalGalleryContainer.innerHTML = "";

        if (packageData.media && packageData.media.length > 0) {
            packageData.media.forEach((mediaItem, index) => {
                var img = document.createElement("img");
                img.src = renderUserProfileImage ? renderUserProfileImage(mediaItem.media_url) : mediaItem.media_url;
                img.alt = `${packageData.title} - Image ${index + 1}`;
                img.className = "gallery-image";
                if (index === 0) img.classList.add("active");

                img.addEventListener("click", () => {
                    modalUserInteracted = true;
                    goToModalSlide(index);
                });

                modalGalleryContainer.appendChild(img);
            });
        } else {
            modalGalleryContainer.innerHTML = "<p>No additional images available</p>";
        }
    }

    function initModalCarousel() {
        if (!packageData.media || packageData.media.length === 0) {
            modalCarouselContainer.innerHTML = `
                <div class="modal-carousel-slide">
                    <img src="/placeholder.svg" alt="${packageData.title}">
                </div>
            `;
            modalCarouselControls.innerHTML = "";
            modalTotalSlides = 1;
            return;
        }

        modalTotalSlides = packageData.media.length;
        modalCurrentSlide = 0;

        modalCarouselContainer.innerHTML = "";
        modalCarouselControls.innerHTML = "";

        packageData.media.forEach((mediaItem, index) => {
            var slide = document.createElement("div");
            slide.className = "modal-carousel-slide";
            slide.innerHTML = `<img src="${renderUserProfileImage ? renderUserProfileImage(mediaItem.media_url) : mediaItem.media_url}" alt="${packageData.title} - Image ${index + 1}">`;
            modalCarouselContainer.appendChild(slide);

            var dot = document.createElement("div");
            dot.className = "modal-carousel-dot";
            if (index === 0) dot.classList.add("active");
            dot.addEventListener("click", () => {
                modalUserInteracted = true;
                goToModalSlide(index);
            });
            modalCarouselControls.appendChild(dot);
        });

        startModalCarousel();
    }

    function startModalCarousel() {
        if (modalCarouselInterval) {
            clearInterval(modalCarouselInterval);
        }

        modalCarouselInterval = setInterval(() => {
            if (!modalUserInteracted && modalTotalSlides > 1) {
                moveModalCarousel(1);
            }
        }, 3000);
    }

    function moveModalCarousel(direction) {
        modalCurrentSlide = (modalCurrentSlide + direction + modalTotalSlides) % modalTotalSlides;
        goToModalSlide(modalCurrentSlide);

        setTimeout(() => {
            modalUserInteracted = false;
        }, 5000);
    }

    function goToModalSlide(slideIndex) {
        modalCurrentSlide = slideIndex;
        modalCarouselContainer.style.transform = `translateX(-${slideIndex * 100}%)`;

        var dots = modalCarouselControls.querySelectorAll(".modal-carousel-dot");
        dots.forEach((dot, index) => {
            if (index === slideIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });

        document.querySelectorAll(".gallery-image").forEach((image, index) => {
            if (index === slideIndex) {
                image.classList.add("active");
            } else {
                image.classList.remove("active");
            }
        });
    }

    function setupEventListeners() {
        modalClose.addEventListener("click", closeModal);

        modalCarouselPrev.addEventListener("click", () => {
            modalUserInteracted = true;
            moveModalCarousel(-1);
        });

        modalCarouselNext.addEventListener("click", () => {
            modalUserInteracted = true;
            moveModalCarousel(1);
        });

		modalWhatsappBtn.addEventListener("click", function() {
			sendWhatsAppEnquiryGlobal(packageData.title, packageData.id, packageData.category);
		});

        // Close modal when clicking outside
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && modal.style.display === "block") {
                closeModal();
            }
        });
    }

    function openModal() {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
        
        void modal.offsetWidth;
        modal.classList.add("show");
    }

    function closeModal() {
        if (modalCarouselInterval) {
            clearInterval(modalCarouselInterval);
            modalCarouselInterval = null;
        }

        modal.classList.remove("show");

        setTimeout(() => {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
            
            if (config.onClose && typeof config.onClose === 'function') {
                config.onClose();
            }
		}, 500);
		var currentUrl = window.location.href;
		var urlParts = '/experiences';
		if (currentUrl.includes("/group-trips") || currentUrl.includes("/groupTrips")) {
			urlParts = '/groupTrips';
		}
		else if (jQuery('#footer li.active').attr('data-item') == 'feed') {			
			urlParts = '/community';
		}
		window.history.pushState({ page: "group-trips" }, "group trips", urlParts);
	}
	
	

}



function testFeed() {
	var designHtml = `<div class="app-container">
					<header class="header">
					<h1>Video Feed</h1>
					</header>
					
					<div class="feed" id="feed">
					<!-- Feed items will be dynamically generated -->
					</div>
					
					<footer class="footer">
						<button class="footer-btn">🏠</button>
						<button class="footer-btn">🔍</button>
						<button class="footer-btn">➕</button>
						<button class="footer-btn">❤️</button>
						<button class="footer-btn">👤</button>
					</footer>
  				</div>`;


	jQuery('body').append(designHtml);

	// Sample video data
	var videos = [
		{
			id: 1,
			username: "traveler",
			avatar: "/placeholder.svg?height=32&width=32&query=person",
			videoUrl:
				"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
			caption:
				"Enjoying the beautiful sunset at the beach! #sunset #beach #vacation",
		},
		{
			id: 2,
			username: "foodlover",
			avatar: "/placeholder.svg?height=32&width=32&query=chef",
			videoUrl:
				"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
			caption: "Making my favorite pasta recipe today! #food #cooking #pasta",
		},
		{
			id: 3,
			username: "fitness_guru",
			avatar: "/placeholder.svg?height=32&width=32&query=athlete",
			videoUrl:
				"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
			caption:
				"Morning workout routine to start the day right! #fitness #workout #motivation",
		},
		{
			id: 4,
			username: "tech_enthusiast",
			avatar: "/placeholder.svg?height=32&width=32&query=programmer",
			videoUrl:
				"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
			caption:
				"Checking out the latest gadgets at the tech expo! #technology #gadgets #innovation",
		},
		{
			id: 5,
			username: "nature_lover",
			avatar: "/placeholder.svg?height=32&width=32&query=hiker",
			videoUrl:
				"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
			caption:
				"Hiking through the beautiful forest today! #nature #hiking #outdoors",
		},
	];

	// Create feed items
	var feedContainer = jQuery('#feed');

	// Track which videos are currently visible
	var visibleVideos = new Set();

	// Track which videos have been prefetched
	var prefetchedVideos = new Set();

	// Create feed items
	videos.forEach((video) => {
		var feedItem = document.createElement("div");
		feedItem.className = "feed-item";
		feedItem.innerHTML = `
        <div class="feed-header">
          <div class="avatar">
            <img src="${video.avatar}" alt="${video.username}'s avatar">
          </div>
          <div class="username">${video.username}</div>
        </div>
        <div class="video-container" data-video-id="${video.id}">
          <video class="video-player" 
                 preload="metadata" 
                 playsinline 
                 muted 
                 loop
                 poster="/placeholder.svg?height=600&width=600&query=video thumbnail">
            <source src="${video.videoUrl}" type="video/mp4">
          </video>
          <div class="loading-indicator"></div>
          <div class="play-icon">▶</div>
          <div class="video-controls">
            <button class="play-pause-btn">⏸️</button>
            <div class="progress-container">
              <div class="buffer-bar"></div>
              <div class="progress-bar"></div>
            </div>
            <button class="volume-btn">🔇</button>
          </div>
        </div>
        <div class="feed-actions">
          <button class="action-btn">❤️</button>
          <button class="action-btn">💬</button>
          <button class="action-btn">📤</button>
        </div>
        <div class="feed-caption">
          <span class="caption-username">${video.username}</span> ${video.caption}
        </div>
      `;
		feedContainer.append(feedItem);

		// Get video elements
		var videoContainer = feedItem.querySelector(".video-container");
		var videoElement = feedItem.querySelector(".video-player");
		var playPauseBtn = feedItem.querySelector(".play-pause-btn");
		var volumeBtn = feedItem.querySelector(".volume-btn");
		var progressBar = feedItem.querySelector(".progress-bar");
		var bufferBar = feedItem.querySelector(".buffer-bar");
		var progressContainer = feedItem.querySelector(".progress-container");
		var loadingIndicator = feedItem.querySelector(".loading-indicator");

		// Set up video event listeners
		videoElement.addEventListener("loadstart", () => {
			loadingIndicator.style.display = "block";
		});

		videoElement.addEventListener("canplay", () => {
			loadingIndicator.style.display = "none";
		});

		videoElement.addEventListener("waiting", () => {
			loadingIndicator.style.display = "block";
		});

		videoElement.addEventListener("playing", () => {
			loadingIndicator.style.display = "none";
			videoContainer.classList.remove("paused");
		});

		videoElement.addEventListener("pause", () => {
			videoContainer.classList.add("paused");
		});

		// Update progress bar
		videoElement.addEventListener("timeupdate", () => {
			var progress = (videoElement.currentTime / videoElement.duration) * 100;
			progressBar.style.width = `${progress}%`;
		});

		// Update buffer bar
		videoElement.addEventListener("progress", () => {
			if (videoElement.buffered.length > 0) {
				var bufferedEnd = videoElement.buffered.end(
					videoElement.buffered.length - 1
				);
				var duration = videoElement.duration;
				var bufferedPercent = (bufferedEnd / duration) * 100;
				bufferBar.style.width = `${bufferedPercent}%`;
			}
		});

		// Play/pause button
		playPauseBtn.addEventListener("click", () => {
			if (videoElement.paused) {
				videoElement.play();
				playPauseBtn.textContent = "⏸️";
			} else {
				videoElement.pause();
				playPauseBtn.textContent = "▶️";
			}
		});

		// Volume button
		volumeBtn.addEventListener("click", () => {
			videoElement.muted = !videoElement.muted;
			volumeBtn.textContent = videoElement.muted ? "🔇" : "🔊";
		});

		// Click on progress bar to seek
		progressContainer.addEventListener("click", (e) => {
			var rect = progressContainer.getBoundingClientRect();
			var pos = (e.clientX - rect.left) / rect.width;
			videoElement.currentTime = pos * videoElement.duration;
		});

		// Click on video to play/pause
		videoContainer.addEventListener("click", (e) => {
			// Ignore clicks on controls
			if (e.target.closest(".video-controls")) return;

			if (videoElement.paused) {
				videoElement.play();
				playPauseBtn.textContent = "⏸️";
			} else {
				videoElement.pause();
				playPauseBtn.textContent = "▶️";
			}
		});
	});

	// Set up Intersection Observer to detect when videos are in viewport
	var videoObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				var videoContainer = entry.target;
				var videoId = videoContainer.dataset.videoId;
				var videoElement = videoContainer.querySelector(".video-player");

				if (entry.isIntersecting) {
					// Video is visible
					visibleVideos.add(videoId);

					// Play the video if it's more than 50% visible
					if (entry.intersectionRatio > 0.5) {
						videoElement.play().catch((error) => {
							console.error("Auto-play was prevented:", error);
						});
					}

					// Prefetch the next video if it hasn't been prefetched yet
					var nextVideoId = parseInt(videoId) + 1;
					if (!prefetchedVideos.has(nextVideoId.toString())) {
						prefetchNextVideo(nextVideoId);
					}
				} else {
					// Video is not visible
					visibleVideos.delete(videoId);

					// Pause the video
					if (!videoElement.paused) {
						videoElement.pause();
					}
				}
			});
		},
		{
			threshold: [0, 0.25, 0.5, 0.75, 1],
		}
	);

	// Observe all video containers
	document.querySelectorAll(".video-container").forEach((container) => {
		videoObserver.observe(container);
	});

	// Function to prefetch the next video
	function prefetchNextVideo(videoId) {
		var nextVideo = videos.find((v) => v.id === videoId);
		if (!nextVideo) return;

		prefetchedVideos.add(videoId.toString());

		var link = document.createElement("link");
		link.rel = "prefetch";
		link.href = nextVideo.videoUrl;
		link.as = "video";
		document.head.appendChild(link);

		console.log(`Prefetched video ${videoId}`);
	}

	// Handle scroll events to optimize performance
	let scrollTimeout;
	window.addEventListener("scroll", () => {
		// Clear the timeout if it exists
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}

		// Set a timeout to run after scrolling stops
		scrollTimeout = setTimeout(() => {
			// Check which videos are currently in viewport
			var visibleVideoElements = Array.from(visibleVideos).map((id) =>
				document.querySelector(
					`.video-container[data-video-id="${id}"] .video-player`
				)
			);

			// Play the most visible video
			if (visibleVideoElements.length > 0) {
				// Find the video with the highest intersection ratio
				var entries = Array.from(document.querySelectorAll(".video-container"))
					.filter((container) => visibleVideos.has(container.dataset.videoId))
					.map((container) => {
						var rect = container.getBoundingClientRect();
						var windowHeight = window.innerHeight;
						var visibleHeight =
							Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
						var visibleRatio = visibleHeight / container.offsetHeight;
						return {
							container,
							visibleRatio,
						};
					})
					.sort((a, b) => b.visibleRatio - a.visibleRatio);

				if (entries.length > 0) {
					var mostVisibleContainer = entries[0].container;
					var videoElement =
						mostVisibleContainer.querySelector(".video-player");

					// Play this video and pause others
					visibleVideoElements.forEach((video) => {
						if (video !== videoElement && !video.paused) {
							video.pause();
						}
					});

					if (videoElement.paused) {
						videoElement.play().catch((error) => {
							console.error("Auto-play was prevented:", error);
						});
					}
				}
			}
		}, 200);
	});
}

function renderCouponsPopUpForPremium() {
    // Remove any existing popup
    const existing = document.getElementById('coupon-premium-popup');
    if (existing) existing.remove();

    // Popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'coupon-premium-popup';
    overlay.className = 'coupon-premium-popup-overlay';
    overlay.innerHTML = `
      <div class="coupon-premium-popup-box">
        <button class="coupon-premium-popup-close hidden" aria-label="Close">&times;</button>
        <div class="coupon-premium-coupon-card">
          <div class="coupon-premium-ticket">
            <div class="coupon-premium-ticket-left">
              <div class="coupon-premium-discount">50 % OFF</div>
            </div>
            <div class="coupon-premium-ticket-main">
              <div class="coupon-premium-title-row">
                <div>
                  <div class="coupon-premium-title">TRY NEW</div>
                  <div class="coupon-premium-save">Save Rs 1000</div>
                </div>
                <button class="coupon-premium-apply">APPLY</button>
              </div>
              <div class="coupon-premium-dotted"></div>
              <div class="coupon-premium-desc">Use code <b>TRYNEW</b> & get save upto 1000.</div>
              <div class="coupon-premium-more">+ MORE</div>
            </div>
          </div>
          <div class="coupon-premium-terms">
            <div class="coupon-premium-terms-title">Terms & conditions apply</div>
            <ul>
              <li>Offer valid till 26.7.24</li>
              <li>Coupon code can be<br>Applied only once in 2 hr.</li>
              <li>Other T&Cs may apply.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close logic
    overlay.querySelector('.coupon-premium-popup-close').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// Ad Management Utilities
window.AdManager = {
    // Track ad performance
    adStats: {
        totalAds: 0,
        loadedAds: 0,
        failedAds: 0,
        blockedAds: 0
    },
    
    // Track ad timestamps for frequency control
    adTimestamps: [],
    
    // Configuration for more aggressive ad display
    config: {
        aggressiveMode: true, // Enable more frequent ads
        maxAdsPerMinute: 6,   // Allow up to 6 ads per minute
        minIntervalBetweenAds: 5000 // 5 seconds minimum between ads
    },

    // Initialize ad manager
    init() {
        this.detectAdBlocker();
        this.setupAdFrequencyControl();
    },

    // Detect ad blocker
    detectAdBlocker() {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.position = 'absolute';
        testAd.style.left = '-10000px';
        testAd.style.top = '-1000px';
        testAd.style.width = '1px';
        testAd.style.height = '1px';
        
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                window.adBlockDetected = true;
                this.adStats.blockedAds++;
                console.log('Ad blocker detected');
            }
            document.body.removeChild(testAd);
        }, 100);
    },

    // Setup ad frequency control
    setupAdFrequencyControl() {
        // Limit ads to one per 10 seconds (reduced from 30 seconds for more frequent ads)
        this.lastAdTime = 0;
        this.minAdInterval = 10000; // 10 seconds
    },

    // Check if we can show an ad
    canShowAd() {
        if (window.adBlockDetected || window.adsDisabled) {
            return false;
        }
        
        const now = Date.now();
        
        // Use aggressive mode settings if enabled
        if (this.config.aggressiveMode) {
            const timeSinceLastAd = now - this.lastAdTime;
            if (timeSinceLastAd < this.config.minIntervalBetweenAds) {
                return false;
            }
            
            // Check ads per minute limit
            const adsInLastMinute = this.getAdsInLastMinute();
            if (adsInLastMinute >= this.config.maxAdsPerMinute) {
                return false;
            }
        } else {
            // Original logic
            if (now - this.lastAdTime < this.minAdInterval) {
                return false;
            }
        }
        
        return true;
    },

    // Record ad event
    recordAdEvent(type) {
        this.adStats.totalAds++;
        
        switch(type) {
            case 'loaded':
                this.adStats.loadedAds++;
                this.lastAdTime = Date.now();
                // Track timestamp for frequency control
                this.adTimestamps.push(Date.now());
                break;
            case 'failed':
                this.adStats.failedAds++;
                break;
            case 'blocked':
                this.adStats.blockedAds++;
                break;
        }
        
        // Clean up old timestamps (older than 1 minute)
        this.cleanupOldTimestamps();
        
        // Log stats every 10 ads
        if (this.adStats.totalAds % 10 === 0) {
            console.log('Ad Stats:', this.adStats);
        }
    },
    
    // Get number of ads shown in the last minute
    getAdsInLastMinute() {
        const oneMinuteAgo = Date.now() - 60000;
        return this.adTimestamps.filter(timestamp => timestamp > oneMinuteAgo).length;
    },
    
    // Clean up old timestamps
    cleanupOldTimestamps() {
        const oneMinuteAgo = Date.now() - 60000;
        this.adTimestamps = this.adTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    },

    // Get ad performance metrics
    getStats() {
        return {
            ...this.adStats,
            successRate: this.adStats.totalAds > 0 ? 
                (this.adStats.loadedAds / this.adStats.totalAds * 100).toFixed(2) + '%' : '0%',
            adsInLastMinute: this.getAdsInLastMinute(),
            aggressiveMode: this.config.aggressiveMode
        };
    },
    
    // Enable aggressive ad mode
    enableAggressiveMode() {
        this.config.aggressiveMode = true;
        console.log('Aggressive ad mode enabled');
    },
    
    // Disable aggressive ad mode
    disableAggressiveMode() {
        this.config.aggressiveMode = false;
        console.log('Aggressive ad mode disabled');
    },
    
    // Set custom ad frequency limits
    setAdFrequencyLimits(maxAdsPerMinute, minIntervalSeconds) {
        this.config.maxAdsPerMinute = maxAdsPerMinute;
        this.config.minIntervalBetweenAds = minIntervalSeconds * 1000;
        console.log(`Ad frequency set to ${maxAdsPerMinute} ads per minute with ${minIntervalSeconds}s minimum interval`);
    }
};

// Initialize ad manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AdManager.init();
    });
} else {
    window.AdManager.init();
}

