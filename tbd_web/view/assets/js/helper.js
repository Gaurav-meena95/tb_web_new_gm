//This file is mean't to handle all the backend ajax calls
function fetchPosts(data, tab, element) {
	
	console.log(data);
	jQuery.ajax({
		url: API_URL + '/js-init',
		type: 'POST',
		data: {
			reason: 'getAllPosts',
			data: data,
			token: tokenMaster('get')
		},
		success: function (response) {
			if (element == 'shots' || element == 'singleShot') {
				renderShots('fetchResults', response, element);
			}
			else if (element == 'interests') {
				renderInterests('render', response);
			}
            else if (element == 'findBuddyRelated') {
                console.log(response);
                if (response.object.list.length > 0) {
                    jQuery('.heading-similar__trips').css('display', 'flex');
                    jQuery('.heading-similar__trips').show();
                    jQuery('.similar__trips').attr('data-tab', tab);

                    // Add a click event handler to the elements with class 'similar__trips'
                    jQuery('.similar__trips').click((function(response) {
                        // This is an Immediately Invoked Function Expression (IIFE)
                        // It creates a closure that captures the 'response' variable
                        return function() {
                            // This function will be executed when the click event is triggered
                            // It has access to the 'response' variable through the closure
                            console.log(response);
                            jQuery('.popup__mask').click();
                            //manageShots('close');
		                    payload = { location: response.body.location, postLat:  response.body.locationLat, postLong:  response.body.locationLng};
                            manageSecondary('show', 'find_posts', payload);
                            renderFeed(response, '#secondary .secondary__tab:last-child .drawerBody .feed__box');
                               
                        };
                    })(response)); // The 'response' variable is passed to the IIFE
                    
                }
            }
            else if (tab == 'showFindBuddy') {
                // managePopups('show','findBuddy');
                // renderFeed([response.object.list[0]], '.popup__master--findBuddySimilar .popup__body');
                // // Attach the response to jQuery('.popup__master--findBuddySimilar .popup__body')
                // // This way, the response will be accessible to the click event handler
                // jQuery('.popup__master--findBuddySimilar .popup__body').data('response', response);
            }
			else if(element == 'findBuddiesAi') {
                if ( response.object && response.object.list && response.object.list.length > 0 && response.object.list[0].localUsers) {
                    renderLocals(response.object.list[0], '.daywise-itinerary.infAnchor', '',response.body.location);
                }
            }
			else {
				renderFeed(response, tab);
			}
		},
		error: function (error) {
			console.log(error);
		}
	});
}



function fetchComments(data, source, postId) {
	// Get the posts
	jQuery.ajax({
		url: API_URL + '/js-init',
		type: 'POST',
		data: {
			reason: 'getComments',
			data: data,
			token: tokenMaster('get')
		},
		success: function (response) {
			renderComments('render', response, source, postId);
		},
		error: function (error) {
			console.log(error);
		}
	});
}

function fetchUserProfile(state, userId) {
	data = {}
	if (userId) {
		data = {
			"userId": userId
		}
	}

	// Get the posts
	jQuery.ajax({
		url: API_URL + '/js-init',
		type: 'POST',
		async: false,
		data: {
			reason: 'fetchUserProfile',
			data: data,
			token: tokenMaster('get')
		},
		success: function (response) {
			if (state == "init") {
				manageUserProfile("update", response.object);
			}
		},
		error: function (error) {
			console.log(error);
		}
	});
}

function bookmarkPost(postId, isBookmarked) {
	// Get the posts
	jQuery.ajax({
		url: API_URL + '/js-init',
		type: 'POST',
		data: {
			reason: 'bookmarkPost',
			data: { postId: postId, isBookmarked: isBookmarked },
			token: tokenMaster('get')
		},
		success: function (response) {
			console.log(response);
		},
		error: function (error) {
			console.log(error);
		}
	});
}


function createDynamicLink(state, data, text) {
	console.log('createDynamicLink called with:', { state, data, text });
	
	// Check if Branch.io is disabled or not configured
	if (window.BRANCH_CONFIG && window.BRANCH_CONFIG.disabled) {
		console.log('Branch.io disabled, using fallback');
		var fallbackLink = data.longDynamicLink || data;
		handleLinkAction(state, fallbackLink, text);
		return;
	}
	
	// Use Branch.io Web SDK to create dynamic links
	if (typeof branch !== 'undefined') {
		// Extract the long dynamic link from the data
		var longDynamicLink = data.longDynamicLink || data;
		console.log('Long dynamic link:', longDynamicLink);
		
		// Parse the deep link to extract parameters
		var linkParams = parseDeepLink(longDynamicLink);
		console.log('Parsed link params:', linkParams);
		
		// Create Branch link matching Android app structure exactly
		var linkData = {
			feature: 'sharing',
			channel: 'web', // Changed from 'android_app' to 'web' for web implementation
			data: {
				// Core Branch.io parameters
				$canonical_identifier: 'content-' + Date.now(), // Match Android timestamp format
				$canonical_url: linkParams.canonicalUrl || longDynamicLink,
				$og_title: linkParams.title || 'Travel Buddy',
				$og_description: text || linkParams.description || 'Check out this travel content',
				$og_image_url: linkParams.image || '',
				$og_url: linkParams.canonicalUrl || longDynamicLink,
				$og_type: 'website',
				$og_site_name: 'Travel Buddy',
				$twitter_card: 'summary_large_image',
				$twitter_title: linkParams.title || 'Travel Buddy',
				$twitter_description: text || linkParams.description || 'Check out this travel content',
				$twitter_image: linkParams.image || '',
				// Control parameters that match Android implementation exactly
				$deeplink_path: linkParams.canonicalUrl || longDynamicLink,
				$ios_deeplink_path: linkParams.canonicalUrl || longDynamicLink,
				$android_deeplink_path: linkParams.canonicalUrl || longDynamicLink,
				$fallback_url: linkParams.canonicalUrl || longDynamicLink,
				// Additional parameters from Android
				$desktop_url: linkParams.canonicalUrl || longDynamicLink,
				$ios_url: linkParams.canonicalUrl || longDynamicLink,
				$android_url: linkParams.canonicalUrl || longDynamicLink
			}
		};

		// Use configured domain (test or live)
		if (window.BRANCH_CONFIG && window.BRANCH_CONFIG.linkDomain) {
			// Replace the domain in the long dynamic link
			var originalDomain = 'link.beatravelbuddy.com';
			var newDomain = window.BRANCH_CONFIG.linkDomain;
			
			// Replace domain for mobile URLs
			linkData.data.$ios_url = longDynamicLink.replace(originalDomain, newDomain);
			linkData.data.$android_url = longDynamicLink.replace(originalDomain, newDomain);
			// Keep desktop URL as original deep link to avoid 404
			linkData.data.$fallback_url = longDynamicLink.replace(originalDomain, newDomain);
			
			console.log('Using domain:', newDomain, 'for', window.BRANCH_CONFIG.debug ? 'debug' : 'live', 'mode');
		}

		console.log('Creating Branch link with data:', linkData);

		branch.link(linkData, function(err, link) {
			if (err) {
				console.error('Branch link creation failed:', err);
				// Fallback to original link if Branch fails
				handleLinkAction(state, longDynamicLink, text);
				return;
			}

			console.log('Branch link created successfully:', link);
			handleLinkAction(state, link, text);
		});
	} else {
		console.warn('Branch.io SDK not loaded, using fallback');
		// Fallback to original link if Branch SDK is not available
		var fallbackLink = data.longDynamicLink || data;
		handleLinkAction(state, fallbackLink, text);
	}
}

function parseDeepLink(url) {
	var params = {};
	try {
		// Extract parameters from the deep link URL
		var urlObj = new URL(url);
		var searchParams = urlObj.searchParams;
		
		// Get the link parameter which contains the actual deep link
		var linkParam = searchParams.get('link');
		if (linkParam) {
			var linkUrl = new URL(decodeURIComponent(linkParam));
			var pathParts = linkUrl.pathname.split('/');
			
			// Extract type and ID from detect.php?t=typeid-id format
			var detectParam = linkUrl.searchParams.get('t');
			if (detectParam) {
				var parts = detectParam.split('-');
				if (parts.length >= 2) {
					params.type = parts[0].replace('id', '');
					params.id = parts.slice(1).join('-');
				}
			}
			
			// Set canonical URL to the actual deep link URL
			params.canonicalUrl = linkUrl.toString();
		}
		
		// Extract other parameters
		params.image = searchParams.get('si') || '';
		params.title = searchParams.get('st') || 'Travel Buddy';
		params.description = searchParams.get('sd') || '';
		
	} catch (e) {
		console.error('Error parsing deep link:', e);
	}
	
	return params;
}

function handleLinkAction(state, link, text) {
	if (state == 'whatsApp') {
		if (isAndroid()) {
			window.open('whatsapp://send/?text=' + text + ' ' + link);
		}
		else {
			window.open('https://wa.me/?text=' + text + ' ' + link);
		}
	}
	else if (state == 'facebook') {
		window.open('https://www.facebook.com/sharer.php?u=' + link);
	}
	else if (state == 'twitter') {
		window.open('https://twitter.com/intent/tweet?url=' + text + ' ' + link);
	}
	else if (state == 'copy') {
		toast('Link copied to clipboard');
		copyToClipboard(link);
		jQuery('.drawer-kapat').click();
	}
}


function jsUpload(state, data, element) {
	data.append('token', manageToken(state));
	data.append('reason', state);
	var headerValues;
	if (state == 'uploadPost') {
		headerValues = {
			userId: manageUserProfile('read', 'userId'),
			token: tokenMaster('get')
		};
	}

	jQuery.ajax({
		url: API_URL + '/upload',
		type: 'POST',
		data: data,
		processData: false,
		contentType: false,
		headers: headerValues,
		success: function (data) {
			if (state == 'uploadDP') {
				if (element == 'newOnboarding') {
				}
				else {
					renderOnboarding('theEnd', data, 'onboarding');
				}
			}
			else if (state == 'uploadChatMedia') {
				renderChat('uploadChatMedia', data);
			}
			else if (state == 'coverUpload') {
				if (element == 'newOnboarding') {
					
				}
				else {
					renderProfile('editProfileCover', data);
				}
				fbEvent('coverUpload');
			}
			else if (state == 'groupChatImage') {
				renderChat('groupChatImageChange', data, element);
			}
			else if (state == 'uploadListingImages') {
				renderAddListing('uploadedListingImages', data, element);
			}
			else if (state == 'uploadMessageDashboardMedia') {
				renderMessagesDashboard('saveMediaInLocal','', data);
			}
			else if (state == 'uploadPost') {
				
				if (element.caption) {
					jQuery('#findBuddy__description').text(element.caption);
				}
				jQuery('#uploadAreaFind').html(element.imagePreviewCont);
				jQuery('#cropButton, #textOverlaysContainer, #thumbnailsContainer, #emojiOverlaysContainer, #drawingCanvas')
					.remove();
				// Hide Media Upload Page and show #app element
				jQuery("#app").css("display", "flex");
				jQuery(".media-upload__container").css("display", "none");
				addImage(data);
			}
			else {
				console.log(data);
				if (data.errorMessage.includes('Invalid')) {
					toast(data.errorMessage);
				}
			}
		},
		error: function (jqXHR, status, error) {
			console.log('Upload Failed. Error: ' + error);
		},
		xhr: function () {
			var xhr = new XMLHttpRequest();

			xhr.upload.addEventListener('progress', function (event) {
				if (event.lengthComputable) {
					var uploadPercentage = event.loaded / event.total;
					console.log(uploadPercentage);
					jQuery('.progress').text(parseInt(uploadPercentage * 100) + '%');
				}

			}, false);

			return xhr;
		}
	});

	function manageToken(state) {
		token = tokenMaster('get');

		if (state == 'resetPass') {
			token = localStorage.getItem('tempToken');
		}

		return token;
	}
}

function jsInit(state, data, element) {
	// Get the posts
	jQuery.ajax({
		url: API_URL + '/js-init',
		type: 'POST',
		data: {
			reason: state,
			data: data,
			token: manageToken(state)
		},
		headers: {
			'authorization': (manageToken(state) != '') ? "Bearer " + manageToken(state) : undefined
		},
		success: function (response) {
			
			//LOGGING OUT USER IN THE CASE OF TOKEN FAILURE.
			if (state != 'logout' && response && (response.data && response.data.responseCode == 401 && response.data.errorMessage && response.data.errorMessage.includes('Authorization has been denied') || response.responseCode == 401 )){
                //logout the user.
                if (isAndroid()) {
                    Android.googleRevokeAccess();
                }
                jsInit('logout', { "deviceUniqueId": "" });
                return;
            }

			if (response.refresh_token) {
				console.log(response.refresh_token);
				tokenMaster('set', response.refresh_token);
			}
			if (element !== 'changeLastActiveStatus') {
				changeLastActiveStatus();
			}

			if (state == 'getCommentReplies') {
				renderComments('render', response, element);
			}
			else if (state == 'changeLastActiveStatus') {
				renderLastActiveStatus('render', response);
			}
			else if (state == 'getTabs') {
				renderTabs(response.object.config[0], element)
			}
			else if (state == 'refreshToken') {
				tokenMaster('set', response.refresh_token);
				reloadWindowWithIosCheck();
			}
			else if (state == 'fetchPost') {
				if (element == 'showUpdatedPost') {
					console.log(response);
					postLoader('hide');
					refreshFeed();
					renderEditPost(response, element);
				}
				else {
					renderPost(response, element);
				}
			}
			else if (state == 'fetchLikes') {
				renderLikes('render', response, element);
			}
			else if (state == 'followUser') {
				if (element.from == 'feed') {
					renderFollowIconFeeds(response, element);
				}
				else if (element !== 'feed_item') {
					renderFollowButton(response, element);
				}
			}
			else if (state == 'fetchNotifications') {
				renderNotifications('store', response);
			}
			else if (state == 'fetchSearchLocations' || state == 'fetchSearchBuddies' || state == 'fetchTrendingSearches' || state == 'fetchRecentSearches') {
				renderSearch('render', response, state);
			}
			else if (state == 'fetchCoupons') {
				renderPremium('coupons', response);
			}
			else if (state == 'searchLocation' || state == 'searchBuddy' || state == 'searchHashtag' || state == 'searchFindBuddy') {
				if (element == 'searchPagination' || element == 'searchLocationPagination' || element == 'searchHashtagsPagination' || element == 'searchFindPagination') {
					console.log(response);
					renderSearchResults(icons, response, element, jQuery('.search__results-box'));
				}
				else {
					renderSearch('render', response, state);
				}
			}
			else if (state == 'locationSearch') {
				renderLocations('renderSearchResults', response, element);
			}
			else if (state == 'fetchProfile') {
				if (response.responseCode == '200') {
					manageSecondary('show', 'Profile', 'Profile');
					renderProfile('render', response, element);
				}
				else {
					if (response.errorMessage) {
						toast(response.errorMessage);
					}
					else {
						toast('User has deactivated their account.');
					}
				}
			}
			else if (state == 'fetchFollowers') {
				if (element == 'groupChat' || element == 'searchGroupChat') {
					renderChat('renderGroupChatFollowers', response, element);
				}
				else if (element == 'chatSend' || element == 'searchChatSend') {
					renderChatSend('renderFollowers', response, element);
				}
				else {
					renderFollowersView('render', response, element);
				}
			}
			else if (state == 'fetchRatings') {
				renderRatingsView('render', response);
			}
			else if (state == 'rateUser') {
				renderRatingsView('rateUser', response);
			}
			else if (state == 'getExperienceRatings') {
				console.log(response);
				renderRatingsView('rateExperience', response);
			}
			else if (state == 'fetchShots') {
				if (element == 'buddy') {
					console.log(response);
					//renderAddPost('buddyFlow', response, element);
				}
				else if (element == 'ask') {
					console.log(response);
				}
				else {
					renderShots('fetchResults', response);
				}
			}
			else if (state == 'fetchComments') {
				renderComments('render', response, element);
			}
			else if (state == 'fetchCountries') {
				switch (element) {
					case 'signUp':
						console.log(response);
						renderLogin('renderCountries', response);
						break;
					case 'onboarding':
						renderOnboarding('renderCountries', response);
						break;
					case 'bookingSummary':
						renderBookingSummary('renderCountries', response);
						break;
					case 'editProfile':
						renderProfile('cc', response);
						break;
					case 'flights-dial-code':
						renderCountries(response.object, '#flights__countryCode');
						break;
					case 'newLogin':
						console.log(response);
						let countryCodes = response.object;
						let countryCodeInput = document.getElementById('countryCodeInput');
            			let countryCodeDropdown = document.getElementById('countryCodeDropdown');
						countryCodeDropdown.innerHTML = '';
						countryCodes.forEach(country => {
							let div = document.createElement('div');
							div.textContent = `${country.country} (${country.code})`;
							div.dataset.code = country.code;
							div.dataset.country = country.country;
							div.addEventListener('click', function() {
								countryCodeInput.value = this.dataset.code + ' ' + this.dataset.country;
								countryCodeDropdown.style.display = 'none';
							});
							countryCodeDropdown.appendChild(div);
						});
						countryCodeDropdown.style.display = 'block';
						jQuery('#countryCodeDropdown div[data-code="+91"]').click();
						break;
									
				}
			}
			else if (state == 'fetchInterests') {
				if (element == 'onboarding') {
					renderOnboarding('renderInterests', response);
				}
			}
			else if (state == 'fetchServices' || state == 'searchServices') {
				if (element == 'pagination' || element == 'search') {
					renderAllServices('render', response);
				}
				else if (element == 'premiumPage') {
					console.log(response);
					renderAllServices('render', response, '.chat-unlimited.group-trips .premium-group-trips-wrapper');
				}
				else {
					renderAllServices('init', response);
				}
			}
			else if (state == 'getServices') {
				if (element == 'editListing') {
					currentListing = response.object;
					renderAddListing('init', currentListing);
				}
				else if (element == 'manageSingleListing') {
					renderExperience('init', response, 'manageService');
				}
				else {
					renderExperience('init', response, 'service');
				}
				loaderMain('secondary', false);
			}
			else if (state == 'login' || state == 'loginGoogle' || state == 'loginFacebook' || state == 'loginApple' || state == 'loginApple') {
				if (element == 'guest') {
					console.log(response);
					guestMaster('set');
					tokenMaster('set', response.object.token);
					Init();
					
				}
				else {
					localStorage.setItem('inAppWebPopup', 'true');
					renderLogin('manageLogin', response, state);
				}
			}
			else if (state == 'logout') {
				tokenMaster('logout', response);
			}
			else if (state == 'forgotPass') {
				if (element == 'newLogin') {
					if (response.responseCode == '200') {
						toast('OTP sent successfully.');
						jQuery('.form__group').append(`
						<input type="number" name="otp" placeholder="Enter OTP" class="form__input otp"
						data-dial="${element.dialCode}" required>
					`);
						jQuery('.btn.btn-primary').addClass('forgot__pass-otp').removeClass('sign__up').removeClass('reset__password').text('Verify OTP');
					}
					else {
						toast(response.errorMessage);
					}
				}
				else {
					renderLogin('manageForgotPass', response);
				}
			}
			else if (state == 'matchOtpForgot') {
				if (element == 'newLogin') {
					// Old
					//renderLogin('manageMatchOtpForgot', response);
					if (response.responseCode == '200') {
						toast('OTP verified successfully. Please enter your new password.');
						jQuery('.form__input.otp').val('').attr('placeholder', 'Enter New Password').attr('type', 'text').addClass('new__password').removeClass('otp');
						
						jQuery('.btn.btn-primary').addClass('new__password').removeClass('sign__up forgot__pass-otp').removeClass('reset__password').text('Confirm and Login');
						localStorage.setItem('tempToken', response.object.token);
					}
					else {
						toast(response.errorMessage);
					}
				}
				else {
					renderLogin('manageMatchOtpForgot', response);
				}
			}
			else if (state == 'resetPass') {
				if (element.newLogin && response.responseCode == '200') {
					var payload;
					if (isAndroid() || isIOS()) {
						payload = { "email": element.email, "password": element.password, gToken: token, deviceId: manageNotificationToken('get'), deviceUniqueId: manageNotificationToken('vendorUUID') };
					}
					else {
						payload = { "email": element.email, "password": element.password, gToken: token, deviceId: manageNotificationToken('get') };
					}
					toast('Password reset successfully. Logging you in.');
					jsInit('login', payload);
				}
				else if (element.newLogin && response.responseCode != '200') {
					toast(response.errorMessage);
				}
				else {
					renderLogin('manageResetPass', response);
				}
			}
			else if (state == 'uniqueCheck') {
				if (element == 'bookingSummary') {
					manageExperienceBookings('uniqueCheck', response);
				}
				else {
					renderLogin('manageUniqueCheck', response);
				}
			}
			else if (state == 'profileSendOTP') {
				if (element == 'editProfileOtp') {
					renderProfile('editProfileOtp', response);
				}
				else if (element !== 'resend') {
					renderOnboarding('sendOTP', response);
				}
			}
			else if (state == 'isPhoneNumberUnique') {
				renderProfile('isPhoneNumberUnique', response);
			}
			else if (state == 'updatePhoneNumber') {
				if (element == 'onboarding') {
					renderOnboarding('updatePhoneNumber', response);
				}
				else if (element == 'editProfile') {
					renderProfile('editProfileNumberVerified', response);
				}
				// else if (element == 'signUp') {
				//     renderOnboarding('updatePhoneNumber', response);
				// }
			}
			else if (state == 'updatePhoneNumberNode') {
				
				renderProfile('editProfileNumberVerified', response);
				
			}
			else if (state == 'signUpOTP') {
				if (element == 'bookingSummary') {
					manageExperienceBookings('signUpOTP', response);
				}
				else {
					renderOnboarding('theEnd', response);
				}
			}
			else if (state == 'fetchServicesList') {
				if (element == 'onboarding') {
					renderOnboarding('renderServicesList', response);
				}
			}
			else if (state == 'fetchProfileViews') {
				renderProfile('renderProfileViews', response)
			}
			else if (state == 'feedback') {
				renderFeedback('onSubmit', response);
			}
			else if (state == 'blockedUsers') {
				renderBlockerUsers('render', response);
			}
			else if (state == 'blockUser') {
				renderBlockerUsers('blockUser', response);
			}
			else if (state == 'unblockUser') {
				renderBlockerUsers('unblockUser', response);
			}
			else if (state == 'reportPost' || state == 'reportUser') {
				console.log(response);
				renderReportBox('response', response, element);
			}
			else if (state == 'fetchInfluencers' || state == 'fetchAllInfluencers') {
				if (element == "premium") {
					jQuery('.find__trip-partner-container').empty()
					response.object = response.object.reverse().slice(2, 50);
					
					console.log(response);
					jQuery('#premiumContainer').addClass('active');
					loaderMain('global', false);

					response.object.forEach(locals => {
						imagePath = getProfileImage(renderUserProfileImage(locals.imageUrl), '', '', '', (locals.roleType == 7));
						
						jQuery('.find__trip-partner-container').append(`
							<div class="find__trip-partner-card" data-user="${locals.userId}" data-name="${locals.name}">
							  <div class="find__trip-partner-image">
								${imagePath}
								<div class="find__trip-partner-name">${locals.name}</div>
							  </div>
							  <div class="find__trip-partner-followers">${locals.city}</div>
							</div>
						`);
					});
						//jQuery('.local-influencers-profile ul').append('<li class="influencer-profile" data-user="' + locals.userId + '" data-name="' + locals.name + '">' + imagePath + '<span>' + locals.name + '</span></li>');
				}
				else {
					renderInfluencers('render', response, element);
				}
			}
			else if (state == 'addPost') {
				if (element == 'findMeetups') {
					renderAddPost('meetup', response, element);
				}
				else if (element == 'findBuddy' || element == 'findBuddyAi') {
					renderAddPost('buddy', response, element);
					fbEvent('findBuddy');
				}
				else if (element == 'ask') {
					renderAddPost('ask', response, element);
				}
				else {
					renderAddPost('response', response, element);
				}
			}
			else if (state == 'updatePost') {
				renderAddPost('response', response, element);
			}
			else if (state == 'deletePost') {
				deletePost('response', response, element);
			}
			else if (state == 'getOrderId') {
				managePayments('openRazorpayWindow', response);
			}
			else if (state == 'getPaymentDetails') {
				managePayments('onPaymentResponse', response);
			}
			else if (state == 'givePremium') {
				managePayments('onVerifyUser', response);
			}
			else if (state == 'updateOnboarding') {
				console.log(response);
				renderOnboarding('theEnd', response, state);
			}
			else if (state == 'getPremiumPricingList') {
				renderPremium('renderMain', response, element ? element : undefined);
			}
			else if (state == 'getSubscriptionInfo') {
				renderPremium('renderSubscription', response);
			}
			else if (state == 'addExpRating') {
				renderExperienceRating('renderExpRating', response);
			}
			else if (state == 'getExperiences') {
				if (element == 'searchExperiences') {
					renderAllExperiences('render', response, '#main__experiences-box .experiences__search');
				}
				else if (element == 'newSingleDataRender') {
					console.log(response);
					renderSinglePackageModal(response.object[0]);	
					var currentUrl = window.location.href;
					var urlParts = '/packages/';
					if (currentUrl.includes("/group-trips") || currentUrl.includes("/groupTrips")) {
						urlParts = '/group-trips/';
					}
					
					window.history.pushState({ page: "group-trips" }, "group trips", urlParts + response.object[0].title.replaceAll(' ', '-') + '-' + response.object[0].id);
				}
				
				else if (element == 'trendingGroupTripsHome') {
					// Render on Home Page
					console.log(response);
					renderGroupTripsHome(response, element);
				}
				else if (element == 'trendingGroupTrips') {
					console.log(response);
					renderAllExperiences('render', response, '#secondary .secondary__tab:last-child .drawerBody');
					loaderMain('secondary', false);
					// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
					// 	Moengage.track_event('TBD_GROUP_TRIPS_OPENED', {
					// 		'page': 'Trending Group Trips'
					// 	});
					// }
					// if (isAndroid()) {
					// 	Android.moEngageData('TBD_GROUP_TRIPS_OPENED', JSON.stringify(
					// 		{ 'page': 'Trending Group Trips' }));
					// }
				}
				else if (element == 'trendingGroupTripsPremium') {
					renderAllExperiences('render', response.object, '#main__premium-box .chat-unlimited.group-trips .premium-group-trips-wrapper');
					loaderMain('secondary', false);
				}
                
				else if (element == 'searchPageExperiences') {
					renderSearch('render', response, state);
					renderAllExperiences('render', response, '#main__search-box .search__results-box');
				}
				else if (element == 'findExperiences' || element == 'findExperiencesEmpty') {
					if (response.object.length != 0) {
						manageSecondary('show', 'findExperience');
						renderAllExperiences('render', response, '#secondary .secondary__tab:last-child .drawerBody');
						if (element == 'findExperiencesEmpty') {
							postLoader('show', 'findExperiences');
						}
					}
					else {
						filterPayload = {};
						if (data.filter.location) {
							filterPayload = {
								location: data.filter.location,
								allData: true
							}
						}
						jsInit("getExperiences", {
							filter: filterPayload
						}, "findExperiencesEmpty");
					}
				}
				else if (element == 'aiPage') {
					console.log(response);
					if (response.object.length != 0) {
						renderTopRatedExperiences('Buddies like you went on these Trips', response.object, '.daywise-itinerary.expAnchor');
						jQuery('.experience__card').css({ 'margin': '20px 0 5px', 'padding': '0 16px' });
					}
				}
				else {
					//renderExperienceGrid(response);
					renderExperience('init', response, 'experience');
				}
			}
			else if (state == 'expressInterest') {
				console.log(response);
				renderExperience('expressInterest', response, 'service');
			}
			else if (state == 'getExperienceDashboard') {
				if (element == 'desktopSidebar') {
					renderDesktopSidebar('experiences', response)
				}
				else {
					if (!isAndroid() && !isIOS() && !isMobile()) {
						renderDesktopSidebar('experiences', response)
					}
					// console.log(response);
					// renderGroupTripsHome(response, element);
					renderAllExperiences('render', response);
				}
			}
				
			else if (state == 'priceValidation') {
				manageExperienceBookings('priceValidation', response);
			}
			else if (state == 'blockTickets') {
				manageExperienceBookings('blockTickets', response);
			}
			else if (state == 'confirmBooking') {
				manageExperienceBookings('finale', response);
			}
			else if (state == 'getAvailableTickets') {
				console.log(data);
				manageAvailableTickets('render', response, element);
			}
			else if (state == 'getOrderDetails') {
				renderOrderDetails(response, element);
			}
			else if (state == 'getCoupons') {
				if (element == 'renderFlightCouponCodesList') {
					renderFlightCouponCodesList(response);
				}
				else {
					renderCoupons('render', response);
				}
			}
			else if (state == 'validateCoupon') {
				if (response.responseCode == '200') {
					
					if (element == 'couponValidationFlights' || element == 'preAppliedCoupon') {
						console.log(response);
						//Close the Drawer & Show Animation
						jQuery('.flight__coupon-close').click();
						showFlightsLoaders('couponApplied');
						setTimeout(function () {
							jQuery('.global__loading').remove();
						}, 2500);
						
						// After the coupon is applied, we are updating the fare breakdown
						
						let coupon = response.object[0];
						let $grandTotal = jQuery('.bill-details__grand-total');
						let newTotal = Number($grandTotal.attr('data-total')) - coupon.couponValue;
						
						jQuery('.bill-details__item.promo_code, .bill-details__saved-tag').removeClass('hide');
						
						jQuery('.flight__coupons-input input').val(coupon.couponcode);
						jQuery('.bill-details__item.promo_code .flight__total_fare-title').text('Offer Discount ( ' + coupon.couponcode + ' )');
						jQuery('.bill-details__saved-tag').attr('data-coupon-val', coupon.couponValue).text(`Saved ₹${coupon.couponValue}`);
						
						jQuery('.flights__footer-price').attr('total-price', newTotal);
						jQuery('.bill-details__item.promo_code').show();
						jQuery('.bill-details__saved-tag').show();
						jQuery('.flights__apply-coupon').addClass('applied').text('REMOVE');
						jQuery('.bill-details__savings-amount.coupon').attr('data-coupon-val', coupon.couponValue);
						
						jQuery('.flights__final-amount').attr('data-final-amount', newTotal);
						jQuery('.flights__final-amount').text(`₹${newTotal}`);
						jQuery('.bill-details__savings-amount.coupon').text(`- ₹${coupon.couponValue}`);
						jQuery('.flights__footer-price .price').text(jQuery('.flights__final-amount').text());
					}
					else if (element == 'renderCouponsPopUpForPremium') {
						console.log(response);
						var couponCode = response.object[0].couponcode;
						let liveLocationInfo = JSON.parse(localStorage.getItem('liveLocationInfo'));
						let currencyCode = liveLocationInfo  && liveLocationInfo.currency_code && liveLocationInfo.currency_code != '' ? liveLocationInfo.currency_code == 'INR' ? 'INR' : 'USD' : 'INR';
						var premiumActiveTab = jQuery('.premium__tab--active').attr('data-tab');
						if (couponCode == 'BUDDY100') {
							if (premiumActiveTab == '2') {
								jQuery('.price-slider__amount').text(currencyCode == 'INR' ? '74.9/' : '2.4/');
								jQuery('.price-slider__savings.total__price').text('Billed ₹899/- per year');
							}
							else if (premiumActiveTab == '4') {
								jQuery('.price-slider__amount').text(currencyCode == 'INR' ? '2899/' : '7.1/');
								jQuery('.price-slider__savings.total__price').text('Billed ₹2899/- per year');
							}
						}
						else if (couponCode == 'SPECIAL500') {
							if (premiumActiveTab == '2') {
								toast('This coupon is valid only for Luxe pack.');
								return;
							}
							else if (premiumActiveTab == '4') {
								jQuery('.price-slider__amount').text(currencyCode == 'INR' ? '208/' : '6.8/');
								jQuery('.price-slider__savings.total__price').text('Billed ₹2499/- per year');
							}
						}
						jQuery('.apply__text').text('Applied');
						jQuery('#premmium_coupon').data('coupon', response);
						//jQuery('.price-slider__amount').text('74.9/');
						showFlightsLoaders('couponApplied');
						setTimeout(function () {
							jQuery('.global__loading').remove();
						}, 1000);
						
					}
					else {
						data = response.object[0];
						discountedPrice = getComputedDiscount(data.discountvalue, data.isdiscountinperc, data.maxdiscount);
						//Add the coupon to the booking details
						bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
						bookingDetails['coupon'] = data.couponid;
						bookingDetails['couponCode'] = data.couponcode;
						bookingDetails['couponDiscount'] = discountedPrice;
						localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
						toast('Your coupon has been successfully applied on your booking');
						renderBookingSummary('updateTotals');
					}
				}
				else {
					if (element != 'preAppliedCoupon') {
						toast('You have entered an invalid coupon code');
						jQuery('#bookingSummary__couponForm input').val('');
						jQuery('.flight__coupons-input input').val('');
					}
				}
			}
			else if (state == 'fetchServices') {
				renderAllServices('render', response);
			}
			else if (state == 'update_gender_and_location') {
				updateUserLocation('processResponse', response);
			}
			else if (state == 'lfb') {
				renderLFB('render', response);
			}
			else if (state == 'contactedLeads') {
				renderLeads('render', response, element);
			}
			else if (state == 'connectLead') {
				renderLeads('connect', response);
			}
			else if (state == 'spDashboard') {
				if (element == 'spDashboardFirstLoad') {
					console.log('First Load');
					renderSpDashboard('renderFirstSp', response);
				}
				else {
					renderSpDashboard('render', response);
				}
			}
			else if (state == 'serviceAttributes') {
				renderAddListing('renderFacillities', response)
			}
			else if (state == 'costDurations') {
				renderAddListing('renderPricing', response);
			}
			else if (state == 'updateListingStatus') {
				renderAddListing('updateListingStatus', response);
			}
			else if (state == 'changePassword') {
				renderSettings('manageUpdatePass', response);
			}
			else if (state == 'deactivateAccount') {
				renderSettings('manageDeactivation', response);
			}
				
			else if (state == 'fetchChatUsers') {
				renderChat('renderChatUsers', response);
			}
			else if (state == 'fetchChatSingleUser') {
				renderChat('renderSingleChatUser', response);
			}
			else if (state == 'fetchChatMessages') {
				if (element.chatType == 'group') {
					jsInit('fetchGroupMembers', { groupId: element.chatId, fetchAll: true }, response);
				}
				else {
					renderChat('renderSingleChat', response);
				}
			}
			else if (state == 'postChatMessage') {
				//renderChat('postChatMessage', response);
			}
			else if (state == 'initiateChat') {
				if (element == 'message_dashboard') {
					console.log(response);
				}
				else if (element == 'groupChat') {
					renderChat('renderChatGroup', response);
				}
				else {
					//renderChat('renderChatSingleUser', response);
				}
			}
			else if (state == 'acceptChatRequest') {
				renderChat('acceptChatRequest', response);
			}
			else if (state == 'getFeedCards') {
				if (element == 'desktopSidebar') {
					renderDesktopSidebar('followers', response);
				}
				else if (element == 'recommendedFollowers') {
					renderRecommendedFollowers('render', response);
				}
			}
			else if (state == 'fetchGroupMembers') {
				updateGroupMemberInfo(response.chatId, response).then(() => renderChat('renderSingleChat', element));
			}
			else if (state == 'addUsersToGroup') {
				if (element == 'addUsersToGroupLater') {
					renderChat('addUsersToGroupLater', response, element);
				}
				else {
					renderChat('addUsersToGroup', response);
				}
			}
			else if (state == 'removeUserFromGroup') {
				console.log(response);
				renderChat('removeUserFromGroup', response);
			}
			else if (state == 'exitUserFromGroup') {
				console.log(response);
				renderChat('exitUserFromGroup', response);
			}
				
			else if (state == 'setUserPresence' || state == 'setUserNode' || state == 'updateChatFlags') { }
			else if (state == 'havala') {
				console.log(response);
				if (element == 'chat') {
					subscribeToChat(response, 'userChats');
				}
			}
			else if (state == 'follow') {
				console.log('Helper');
				console.log(response);
				renderProfile('follow', response, element);
			}
			else if (state == 'updateProfile') {
				console.log('Update');
				console.log(response);
				// manageLikes('likedPost', response, element); // Some how its only working here as of now & not in likePost
			}
			else if (state == 'updateAbout') {
				console.log('About');
				console.log(response);
				if (element == 'newOnboarding') {
					jQuery('#footer ul li[data-item="feed"]').click();
					toast('Your profile has been updated successfully.');
					showHidePaxReviewSheet('hide');
				}
			}
			else if (state == 'deleteCover') {
				console.log('deleteCover');
				console.log(response);
				renderProfile('deleteCover', response);
			}
			else if (state == 'editComment') {
				console.log(response);
			}
			else if (state == 'lfbCheck') {
				console.log(response);
				manageLikes('likedPost', response, element);
				
			}
			else if (state == 'addUserToFindGroup') {
				if (response.responseCode == 200) {
					// Open the chat page
					//toast('You have been added to the group');
					openNewChat('findGroup=' + response.object.groupId);
					//renderGroupChatFind('createGroupButton', response);
				}
				else {
					toast(response.errorMessage);
                
				}
			}
			else if (state == 'likeShot') {
				console.log(response);
				manageLikes('likedShot', response, element);

			}
			else if (state == 'likePost') {
				console.log(response);
			}
			else if (state == 'updateSocialLink') {
				console.log(response);
			}
			else if (state == 'saveListing') {
				renderAddListing('savedListing', response)
			}
			else if (state == 'replyComment') {
				console.log(response);
				renderComments('replyComment', response);
			}
			else if (state == 'likeCommentOrReply') {
				console.log(response);
			}
			else if (state == 'fetchUsersGroups') {
				renderChatSend('renderGroups', response);
			}
			else if (state == 'nearByUsers') {
				renderNearByUsersInMap(response);
			}
			else if (state == 'isProcessing') {
				console.log(response);
				renderAddPost('isProcessing', response, element);
			}
			else if (state == 'checkRefer') {
				renderOnboarding('checkRefer', response);
			}
			else if (state == 'messageDashboard') {
				console.log(response);
			}
			else if (state == 'getCohorts') {
				renderMessagesDashboard('init', response);
			}
			else if (state == 'initiateMessage') {
				console.log('initiateMessage', response);
			}
			else if (state == 'getMessageHistory') {
				if (element == 'render') {
					renderMessagesDashboard('messageDashboardAnalytics', '', response);
				}
				else if (element == 'refresh') {
					renderMessagesDashboard('messageDashboardAnalytics', 'refresh', response);
				}
				else {
					renderMessagesDashboard('getNumberOfSeenUsersAndUpdate', element, response);
				}
			}
			else if (state == 'sendEnquiryDetails') {
				console.log(response);
			}
			else if (state == 'updateMessageDashboardHistory') {
				console.log('M.D Analytics', response);
			}
			else if (state == 'openProfileFromChat') {
				console.log(response);
				redirect('profile', response);
				loaderMain('global', false);
			}
			else if (state == 'givePremiumByAdmin' || state == 'makeRemoveInfluencer' || state == 'pinUnpinPost' || state == 'blockUserByAdmin') {
				loaderMain('global', false);
				toast('Successful');
				refreshFeed();
			}
			else if (state == 'googleAi') {
				console.log('Google AI Response', response);
				if (response.responseCode == '200') {
					manageSecondary('show', 'itinerary', { 'data': response.object.data, 'location': element });
					renderAiItinerary(response.object.data, '', response.object.locationIds);
					monthName = getMonthName(response.object.month);
					// Replace spaces with hyphens
					urlLink = ('ai-travel-plan/' + response.object.location.replace(/\s+/g, '-') + '-' + response.object.passengers + '-' + response.object.budget + '-' + monthName + '/' + response.object.itineraryId).replace(/[\s,]+/g, '-');
					window.history.pushState({}, '', urlLink);
				}
				else {
					toast(response.errorMessage);
					jQuery('.global__loading').remove();
				}
			}
			else if (state == 'getItinerary') {
				// Loads the itinerary from the Url
				console.log(response);
				manageSecondary('show', 'userItinerary', { 'response': response }); // , 'extra': element
			}
			else if (state == 'getUsersAiPackage') {
				console.log(response);
				//showHidePremiumAi(response.object);
			}
			else if (state == 'buyAiPackage') {
				if (response.responseCode == '200') {
					console.log(response);
					localStorage.setItem('packageOwnedId', response.object.packageOwnedId);
					toast('Welcome to the elite club. Enjoy planning your trips with AI Buddy.');
					clearIntervalAndHidePremium();
				}
			}
			else if (state == 'getUserItineraries') {
				console.log(response);
				renderAllAiTrips(response, 'allAiTrips');
                
			}
			else if (state == 'getDeltaDataChats') {
				var getTestersEmail = returnTestersEmail();
				if (/*getTestersEmail.includes(manageUserProfile('read', 'email'))*/ true) {
					console.log(response);
					console.log(element);
					if (window.location.href.includes("localhost")) {
						window.open("http://localhost:3000/newChat", "_self");
					} else if (window.location.href.includes("dev.")) {
						window.open("https://dev.beatravelbuddy.com/newChat", "_self");
					} else {
						window.open("https://beatravelbuddy.com/newChat", "_self");
					}
				}
				else {
					sendChatDataToIndexedDb('check', response, element);
				}
				if (element == 'refreshChat') {
					toast('Chats Refreshed');
					jQuery('.refresh_chat').show();
				}
                
			}
			else if (state == 'getAllHostellers' || state == 'getNewHostellers' || state == 'getHostellersFromLocation') {
				renderHostellers(state, response.object.data, element);
            
				if (state != 'getHostellersFromLocation') {
					finalData = state == 'getAllHostellers' ? response.object.data : response.object.data.hostels;
					allHostellerDataArr.push(...finalData);
					saveHostellersData(finalData, state).then(function () {
						// Set the timestamp in local storage
						localStorage.setItem(state, Date.now());
					});
            
				}
			}
			else if (state == 'adminGetAllListings') {
				response.responseCode == 200 ? renderAllServices('render', response, '#' + element) : toast('Error fetching listings');
			}
			else if (state == 'adminUpdateListingStatus') {
				toast(response.responseCode == 200 ? 'Listing status updated successfully' : 'Error updating listing status');
			}
			else if (state == 'getPlacePhotos') {
				if (element != 'flightsBooking') {
					console.log('Place Photos', response);
					console.log('Place Photos', response[0].imageUrl);
					mediaListFind = [
						{
							description: '',
							id: '',
							mediaId: '0',
							mediaType: 'image',
							imageHeight: 0,
							imageWidth: 0,
							mediaUrl: response[0].imageUrl && !response[0].imageUrl.includes('undefined') ? response[0].imageUrl : 'https://beatravelbuddy.com/view/assets/img/experiences__bg.webp',
							localUrl: '',
							thumbnailUrl: '',
							title: ''
						}
					];
					uploadFindPost(element, mediaListFind);
				} else {
					jQuery('.flight-booking-details').css({
						position: 'relative'
					}).append(`
						<div class="background-overlay"></div>
					`);

					jQuery('.background-overlay').css({
						'background-image': 'url("https://beatravelbuddy.com/view/assets/img/cheap_flights.jpg")'
					});
				}
			}
			else if (state == 'tboSearchFlights') {
				console.log('TBO Search ', data, response);
				if (element.searchFrom != 'searchFlightsOnboarding') {
					loaderMain('global', false);
				}
				console.log(response.object);
				
				if (response.object.Response.Error.ErrorCode == 0) {
					// After Login just hit the search API again
					if (element.searchFrom == 'login') {
						return;
					}
					else if (element.searchFrom == 'searchFlightsOnboarding') {
						// Below codes will fire once the search api is completed
				
						jQuery('#bookingForm').submit();
						if (jQuery('.flights__search').attr('data-international') == undefined || jQuery('.flights__search').attr('data-international') == 'false') {
					
							if (isInternationalFlight()) {
								callFlightsFareQuote(selectedFlightForBooking, 'getFinalAmountOw');
								return;
							}
							else {
								if (jQuery('.flights__search').attr('data-return') == 'true') {
									callFlightsFareQuote(selectedFlightForBookingRound, 'getFinalAmountRoundSSR');
								}
								else {
									callFlightsFareQuote(selectedFlightForBooking, 'getFinalAmountOwSSR');
								}
							}
							
							callMoengageEventsForFlights('TBD_FLIGHTS_PROCEED_TO_SEAT_SELECTION', bookFlightPayload);
						}
						else {
							callFlightApis();
						}
						jQuery('.flights__footer-continue').show();
						
						// Adding and showing the Convience fees in the Footer Section
						if (!jQuery('.flights__footer-price .pax').text().includes('convienience fees')) {
							let getConvFees = Number(jQuery('#flights__footer').attr('conv-charges'));
							let getTotalPrice = Number(jQuery('.flights__footer-price').attr('total-price'));
							let finalPrice = getConvFees + getTotalPrice;
							jQuery('.flights__footer-price').attr('total-price', finalPrice);
							//jQuery('.flights__footer-price .price').text('₹' + finalPrice);
							
							// Not showing Convience fees for Super and Pro Users
							if ((jQuery('#promoCodeInput').val() == 'TBSUPER' || jQuery('#promoCodeInput').val() == 'TBPRO') && jQuery('#applyCouponButton').hasClass('applied')) {
								let surcharges = Number(jQuery('.bill-details__taxes-surcharges').text().split('₹')[1]) + Number(getConvFees);
								jQuery('.bill-details__taxes-surcharges').text('₹' + surcharges);
								
							}
							
							/*else {
								jQuery('.flights__footer-price .pax').text(jQuery('.flights__footer-price .pax').text() + ' ( Incl. ₹' + getConvFees + ' convienience fees.)');
								jQuery('.bill-details__item.conv__charges').removeClass('hide');
							}*/
							
							//jQuery('.flights__final-amount').text('₹' + finalPrice);
							//jQuery('.bill-details__grand-total').attr('data-total', Number(jQuery('.bill-details__grand-total').attr('data-total')) + getConvFees);
						}
						return;
					}
					
					// Initialize session
					class Session {
						constructor() {
							this.startTime = Date.now();
							this.isActive = true;
							this.expiryTime = 15 * 60 * 1000; // 15 minutes in milliseconds
						}

						checkExpiry() {
							if (!this.isActive || (Date.now() - this.startTime) > this.expiryTime) {
								this.isActive = false;
								return "Your session (TraceId) is expired.";
							}
							return "Session is active.";
						}

						expire() {
							this.isActive = false;
						}
					}
					checkSessionStatus = new Session();
					flightsSearchResults = response.object;
					renderFlights(flightsSearchResults, element);
				}
				else {
					jQuery('.flights__search').parent().remove();
					toast(response.object.Response.Error.ErrorMessage);
				}
			}
			// Main logic for handling API responses based on state
			else if (state === 'tboFareRule') {
				console.log('tboFareRule ', data, response);
				//handleFareRule(response, element);
				
				if (element == 'fareRuleOw') {
					console.log(response.object);
					fareRuleOw = response.object;
					
					jQuery(
						'.flight-booking-details__section.cancellation, .flight-booking-details__section--arrow'
					).data(
						'cancellation-data',
						fareRuleOw.Response.FareRules[0].FareRuleDetail
					);
					jQuery('.flight-booking-details__section.cancellation').css({
						display: 'flex',
						justifyContent: 'space-between',
						flexDirection: 'unset'
					});
					
				}
				else if (element == 'fareRuleRt') {
					console.log(response.object);
					fareRuleOb = response.object.ob;
					fareRuleIb = response.object.ib;
				}
			}
			else if (state === 'tboFareQuote') {
				handleFareQuote(response, element);
			}
			else if (state === 'getSSR') {
				handleSSR(response, element);
			}
			else if (state == 'bookFlight') {
				console.log(response.object);
				if (response.object.Response.Error.ErrorCode == '0') {
					if (element == 'callIbBook') {
						tboBookFlightOb = response.object;
						ibBookPayload.fareBreakUp = fareBreakUpDetails;
						ibBookPayload.isInBound = true;
						jsInit('bookFlight', ibBookPayload, 'obIbBooked');
						
					}
					else if (element == 'obIbBooked') {
						tboBookFlightIb = response.object;
						
						// Make an Array to store tboBookFlightOb and tboBookFlightIb
						flightTicketArray = [tboBookFlightOb, tboBookFlightIb];
						
						renderFlightTicketing(flightTicketArray, element);
					}
					else if (element == 'onlyIbBooked') {
						tboBookFlightIb = response.object;
						flightTicketArray = [tboBookFlightIb];
						renderFlightTicketing(flightTicketArray, element);
					}
					else if (element == 'onlyObBooked') {
						tboBookFlightOb = response.object;
						ibBookPayload.fareBreakUp = fareBreakUpDetails;
						ibBookPayload.isInBound = true;
						jsInit('flightTicketing', ibBookPayload, 'callOnlyIbTicket');
					}
					else {
						tboBookFlightOw = response.object;
						renderFlightTicketing(response.object, element);
					}
				} else {
					var errorMsg = response.object.Response.Error.ErrorMessage + ' ' + (response.object.Response.Error.RefundMessage ? response.object.Response.Error.RefundMessage : '');
					managePopups('show', 'flightsErrorMessage', errorMsg);
					destroyAllSecondaryTabs();
					jQuery('.global__loading').remove();
				}
			}
			else if (state == 'flightTicketing') {
				console.log(response);
				if (response.object.Response.Error.ErrorCode == '0') {
					if (element == 'callTicketForIb' || element == 'callTicketForLCCIb') {
						tboTicketFlightOb = response.object;
						
						if (element == 'callTicketForLCCIb') {
							// In this case we are calling the ticketing for the inbound flight directly without Booking.
							
							ibBookPayload.fareBreakUp = fareBreakUpDetails;
							ibBookPayload.isInBound = true;
							jsInit('flightTicketing', ibBookPayload, 'obIbTicketed');
						}
						else {
							// In this case we are calling the ticketing for the inbound flight after Booking.
							pnr = jQuery('.flight__ticketing[data-flight-type="inbound"]').attr('data-pnr');
							bookingId = jQuery('.flight__ticketing[data-flight-type="inbound"]').attr('data-booking-id');
							dob = jQuery('.flight__ticketing[data-flight-type="inbound"]').attr('data-dob');
							
							ticketPayload = {
								"PNR": pnr,
								"BookingId": Number(bookingId),
								"DateOfBirth": dob,
								"isInBound": true
							};
							
							ticketPayload.fareBreakUp = fareBreakUpDetails;
							jsInit('flightTicketing', ticketPayload, 'obIbTicketed');
						}
					}
					
					else if (element == 'obIbTicketed' || element == 'obDirectlyTicketed' || element == 'ibDirectlyTicketed') {
						if (element == 'obIbTicketed' || element == 'obDirectlyTicketed') {
							tboTicketFlightIb = response.object;
						}
						else {
							tboTicketFlightOb = response.object;
						}
							
						flightTicketArray = [tboTicketFlightOb, tboTicketFlightIb];
						renderFlightBooked(flightTicketArray, element);
					}
					else if (element == 'callOnlyIbBook') {
						tboTicketFlightOb = response.object;
						
						ibBookPayload.fareBreakUp = fareBreakUpDetails;
						ibBookPayload.isInBound = true;
						jsInit('bookFlight', ibBookPayload, 'onlyIbBooked');
					}
					else if (element == 'callOnlyIbTicket') {
						tboTicketFlightIb = response.object;
						flightTicketArray = [tboBookFlightOb];
						renderFlightTicketing(flightTicketArray, 'onlyObBooked');
					}
					else {
						tboFlightOw = response.object;
						renderFlightBooked(tboFlightOw, element);
					}
				} else {
					var errorMsg = response.object.Response.Error.ErrorMessage + ' ' + (response.object.Response.Error.RefundMessage ? response.object.Response.Error.RefundMessage : '');
					managePopups('show', 'flightsErrorMessage', errorMsg);
					destroyAllSecondaryTabs();
					jQuery('.global__loading').remove();
				}
			}
			else if (state == 'getBookingDetails') {
				console.log('getBookingDetails', response);
				showHidePaxReviewSheet('hide');
				destroyAllSecondaryTabs();
				renderViewFlight(bookFlightFareDetails, 'getBookingDetails', response);
				jQuery('.global__loading').remove();
				checkSessionStatus.expire();
				// Reset the values after booking
				resetValuesAfterFlightBooking();
				//Below function is to render the booking details in the view which
				//renderFlightBookingDetails(response.object, element);
			}
			else if (state == 'getAirportInfo') {
				if (element && (element != 'flightsPassport')) {
					console.log(response.list);
					if (response.list.length > 0) {
						airportPicker(response.list, element);
					}
				} else if (!element) {
					allAirports = response.list;
				}
				else {
					
					let countriesInfo = filteredCountries = allAirports.map(country => ({
						country_code: country.country_code,
						country_name: country.country_name
					}));
					
					// Iterate over each select element inside passport__issue-country containers
					jQuery('.passport__issue-country select').each(function () {
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
					//renderPassportIssueCountry(response.list);
				}
			}
			else if (state == 'getConvenienceCharges') {
				renderFlightBookings(selFlightData, response.convCharges);
			}
			else if (state == 'getUsersFlightBookings') {
				console.log(response);
				renderBookedFlightTicketsHistory(response);
			}
			else if (state == 'getLowestFare') {
				lowestFareDetails = {};
				console.log(response);
				if (response.responseCode == 200) {
					lowestFareDetails = response.lowestFareDetails;
				}
				cheapestFlights.toLocation[data.destination] = {
					lastFetchedDate: new Date(),
					lowestFareDetails: lowestFareDetails
				};
				renderCheapestFlightCard(cheapestFlights.toLocation[data.destination], element);
			}
			else if (state == 'sendFlightDetails') {
				if (response.responseCode == 200) {
					toast('Flight details sent to your email.');
				}
				else {
					jQuery('.email__icon').show();
				}
			}
			else if (state == 'getCalendarFares') {
				console.log(response);
				if (response.object.Response.Error.ErrorCode == 0) {
					flightsCalendarFares(response.object.Response);
				}
				else {
					renderCalendar();
				}
				if (!jQuery('.global__loading').hasClass('flights')) {
					loaderMain('global', false);
				}
			}
			else if (state == 'getCancellationCharges') {
				
				if (response.object.Response.ResponseStatus == 1) {
					console.log(response, element);
					showHidePaxReviewSheet('hide');
					response.object.Response.cancelPayload = element;
					renderBottomSheet(response, 'cancellationCharges');
				}
				else {
					toast(response.object.Response.Error.ErrorMessage);
				}
				loaderMain('global', false);
			}
			else if (state == 'sendChangeRequest') {
				loaderMain('global', false);
				showHidePaxReviewSheet('hide');
				if (response.object.Response.ResponseStatus == 1) {
					toast('Cancellation Initiated successfully');
				}
				else {
					toast(response.errorMessage);
				}
			}
			else if (state == 'getCityCodesForHotels') {
				console.log(response);
				allCityCodes = response.object.CityList;
				//hotelCityPicker(response.CityList, element);
				
				
			}
			else if (state == 'getHotelCodes') {
				console.log(response);
				if (response.object.Status.Code == 200) {
					jQuery('.search__hotels').data('hotelCodes', response.object.Hotels);
				}
			}
			else if (state == 'searchHotelAvailability') {
				console.log(response);
				renderHotelsSearchResults(response);
			}
			else if (state == 'checkUniqueUser') {
				//return;
				// If the user is unique then we will add the user to the list of unique users
				if (response.responseCode == 200) {
					console.log(response); 
					// Setting the Values for the User
					let token = response.jwt;
					tokenMaster('set', token);
					manageUserProfile('clean');
					guestMaster('clean');
					//  Before submitting we have to call & wait for the SearchAPI first then proceed normally
				
					searchFlights('searchFlightsOnboarding');
					// Show Loader
					showFlightsLoaders('ssr');
				}
				else if (response.responseCode == 202) {
					// Show Login Popup
					renderBottomSheet('', 'loginNew');
				}
				
				
				
				
			}
			else if (state == 'checkUserLogin') {
				if (response.responseCode == 200) {
					console.log(response);
					if (element == 'referralLogin') {
						// Setting the Values for the User
						let token = response.jwt;
						tokenMaster('set', token);
						manageUserProfile('clean');
						guestMaster('clean');
						
					}
					else if (element.editProfile) {
						jsInit('sendOTPDomestic', {
							phoneNumber: element.phoneNumber
						}, 'editProfileOtp');
						renderProfile('editProfileOtp');
					}
					else {
						// Send OTP to the Number via FB
						//if (response.phoneNumber) {
						if (element.dialCode == '+91') {
							jsInit('sendOTPDomestic', {
								phoneNumber: element.phoneNumber
							});
						}
						else {
							firebaseOTP('sendSMS', {
								phoneNumber: element.phoneNumber,
								dialCode: element.dialCode,
							});
						}
						jQuery('.form__group').append(`
						<input type="number" name="otp" placeholder="Enter OTP" class="form__input otp"
						data-dial="${element.dialCode}" required>
					`);
						jQuery('.btn.btn-primary').addClass('otp').removeClass('sign__up').text('Verify OTP');
						toast('OTP Sent to your number');
					}
				}
				else if (response.responseCode == 202) {
					// User Already Exists with this credentials
					// Go Back to Login page & pre-fill the number and ask the user to login
					toast('User already exists with these credentials. Please login to continue');
					jQuery('.login__link').click();
					
				}
				else if (response.responseCode == 204) {
					// Send OTP to the Number via FB 
					//if (response.phoneNumber) {
					firebaseOTP('sendSMS', {
						phoneNumber: element.phoneNumber,
						dialCode: element.dialCode,
					});
					jQuery('.form__group').append(`
							<input type="number" name="otp" placeholder="Enter OTP" class="form__input otp"
							data-dial="${element.dialCode}" required>
						`);
					jQuery('.btn.btn-primary').addClass('forgot__pass-otp').removeClass('sign__up, reset__password').text('Verify OTP');
					localStorage.setItem('tempToken', response.tempToken);
					toast('OTP Sent to your number');
				}
				else if (response.responseCode == 205) {
					toast('User not found with this phone number. Please sign up to continue');
					jQuery('.forgot__password.back__login').click();
				}
				else {
					// Error
					toast(response.errorMessage);
				}
			}
			else if (state == 'verifyOTPDomestic') {
				console.log('verifyOTPDomestic', response);
				if (response.success == true) {
					if (element.editProfileOtp) {
						jsInit('updatePhoneNumberNode', {
							phoneNumber: element.phoneNumber,
							dialCode: element.dialCode,
							otp: element.otp
						});
						return;
					}
					var deviceUniqueId = '';
		
					if (isAndroid() || isIOS()) {
						deviceUniqueId = manageNotificationToken('vendorUUID');
					}
					var deviceType = isAndroid() ? '0' : isIOS() ? '1' : '2';
					let email = jQuery('.form__input.phone').val();
					toast('Phone Number Verified');
					jsInit('insertUser', { phoneNumber: email, dialCode: jQuery('.form__input.otp').attr('data-dial'), userName: jQuery('.form__input.name').val().trim(), password: jQuery('.form__password').val().trim(), deviceType: deviceType, deviceUniqueId: deviceUniqueId, deviceId: manageNotificationToken('get') });
				}
				else {
					toast('Invalid OTP');
				}
			}
			else if (state == 'insertUser') {
				tokenMaster('set', response.token);
				guestMaster('clean');
				loaderMain('global', false);
				manageUserProfile('clean');
				setTimeout(() => { redirect('home') }, 500);
			}
			else if (state == 'whatsAppNewQuickReplies') {
				console.log('WhatsApp New Quick Replies', response);
			}
			else {
				console.log(data);
				console.log(state);
				console.log(response);
			}
		},
		error: function (error) {
			console.log(error);
		}
	});

	function manageToken(state) {
		token = tokenMaster('get');

		if (state == 'resetPass') {
			token = localStorage.getItem('tempToken');
		}
		else if (state == 'login' || state == 'loginGoogle' || state == 'loginFacebook') {
			token = "";
		}

		return token;
	}
}

function resetFreeFeatures() {
	console.log('Resetting Free Features');
	if (!localStorage.getItem('lastAccessed')) {
		localStorage.setItem('lastAccessed', new Date().toJSON().slice(0, 10));
		localStorage.setItem('filtersApplied', 1);
	}

	if (new Date().toJSON().slice(0, 10) != localStorage.getItem('lastAccessed')) {
		localStorage.setItem('lastAccessed', new Date().toJSON().slice(0, 10));
		console.log(manageUserProfile('read', 'isVerified'));
		//RESETTING NUMBER OF FILTERS WHICH CAN BE APPLIED
		//if (manageUserProfile('read', 'isVerified')) {
		if (true) {
			localStorage.setItem('filtersApplied', 99)
		}
		else {
			localStorage.setItem('filtersApplied', 1);
		}
	}
}

function getProfileImage(imgUrl, alt, editDp, profileModal, isInfluencer){
    verifiedImagePath = '';
    if (isInfluencer){
        influencerTagImg = imageBaseUrl + '/uploads/display_pictures/influencer_tag.png';
        verifiedImagePath = '<img class="overlap__influencerTag" src="' + influencerTagImg + '" onerror="this.onerror=null; this.src = getDummyImageUrl();"  alt="' + alt + '">';
    }
    return '<img src="' + imgUrl + '" onerror="this.onerror=null; this.src = getDummyImageUrl();"  alt="' + alt + '">' + editDp + profileModal + verifiedImagePath + '';
}









// Function to extract common attributes for trace and result index
function getFlightAttributes() {
    return {
      "TraceId": jQuery('.flights__search').attr('data-trace-id'),
      "ResultIndex": jQuery('.flights__search').attr('data-ib-result-index')
    };
}
  
  // Function to handle Fare Rule API calls
function handleFareRule(response, element) {
    console.log(response);
	if (response.object.Response.Error.ErrorCode == 0) {
		fareRulePayload = getFlightAttributes();

		if (element.nextCall === 'return') {
			tboFareRuleOb = response.object;
			
			selectedFlightForBookingIb = fareRulePayload;
			jsInit('tboFareRule', fareRulePayload, { 'fareRulePayload': fareRulePayload, 'nextCall': 'fareQuoteOb' });
		} 
		else if (element.nextCall === 'fareQuoteOb' || element.nextCall === 'outbound') {
			tboFareRuleIb = response.object;
			fareRulePayload.ResultIndex = jQuery('.flights__search').attr('data-ob-result-index');
			
			selectedFlightForBookingOb = fareRulePayload;
			
			jsInit('tboFareRule', fareRulePayload, { 'fareRulePayload': fareRulePayload, 'nextCall': 'fareQuoteIb' });
		} 
		else if (element.nextCall === 'fareQuoteIb') {
			tboFareRuleOb = response.object;
			selectedFlightForBookingIb = fareRulePayload;
			callFlightsFareQuote(fareRulePayload, 'fareQuoteOb');
		} 
		else {
			tboFareRuleOw = response.object;
			if (tboFareRuleOw.Response.FareRules && tboFareRuleOw.Response.FareRules.length > 0) {
				jQuery(
					'.flight-booking-details__section.cancellation, .flight-booking-details__section--arrow'
				).data(
					'cancellation-data',
					tboFareRuleOw.Response.FareRules[0].FareRuleDetail
				);
				jQuery('.flight-booking-details__section.cancellation').css({
					display: 'flex',
					justifyContent: 'space-between',
					flexDirection: 'unset'
				});
			}
			
			callFlightsFareQuote(element.fareRulePayload, element);
		}
	}
	else {
		toast('Error fetching fare rules. Please try again');
		jQuery('.global__loading').remove();
	}
}
  
  // Function to handle Fare Quote API calls
function handleFareQuote(response, element) {

	console.log(response);
	try {
		if (['getFinalAmountOw', 'getFinalAmountRound', 'getFinalAmountRoundSSR', 'getFinalAmountOwSSR'].includes(element)) {
			console.log(response);
			let isRound = element.includes('Round');
			let isSeatMandatoryOw = false, isSeatMandatoryOb = false, isSeatMandatoryIb = false, isMealMandatoryOw = false, isMealMandatoryOb = false, isMealMandatoryIb = false;
	
			// First if - else-if is checking whether we have called it just before opening the Razorpay
			if (element.includes('Round')) {
				tboFareQuoteOb = response.updatedFareQuoteResponses.fareDataOb;
				tboFareQuoteIb = response.updatedFareQuoteResponses.fareDataIb;
				getObFareBreakDown(tboFareQuoteOb);
				getIbFareBreakDown(tboFareQuoteIb);
				tboSSROb = response.updatedFareQuoteResponses.ssrOb ? response.updatedFareQuoteResponses.ssrOb : '';
				tboSSRIb = response.updatedFareQuoteResponses.ssrIb ? response.updatedFareQuoteResponses.ssrIb : '';
				
				isSeatMandatoryOb = response.updatedFareQuoteResponses.fareDataOb.Response.Results.RequiredFieldValidators ? response.updatedFareQuoteResponses.fareDataOb.Response.Results.RequiredFieldValidators.IsSeatRequired : false;
				isSeatMandatoryIb = response.updatedFareQuoteResponses.fareDataIb.Response.Results.RequiredFieldValidators ? response.updatedFareQuoteResponses.fareDataIb.Response.Results.RequiredFieldValidators.IsSeatRequired : false;
				
				isMealMandatoryOb = response.updatedFareQuoteResponses.fareDataOb.Response.Results.RequiredFieldValidators ? response.updatedFareQuoteResponses.fareDataOb.Response.Results.RequiredFieldValidators.IsMealRequired : false;
				isMealMandatoryIb = response.updatedFareQuoteResponses.fareDataIb.Response.Results.RequiredFieldValidators ? response.updatedFareQuoteResponses.fareDataIb.Response.Results.RequiredFieldValidators.IsMealRequired : false;
			}
			else {
				tboFareQuoteOw = response.updatedFareQuoteResponses.fareDataOw;
				getOwFareBreakDown(tboFareQuoteOw);
				tboSSR = response.updatedFareQuoteResponses.ssrOw ? response.updatedFareQuoteResponses.ssrOw : '';
				isSeatMandatoryOw = response.updatedFareQuoteResponses.fareDataOw.Response.Results.RequiredFieldValidators ? response.updatedFareQuoteResponses.fareDataOw.Response.Results.RequiredFieldValidators.IsSeatRequired : false;
				isMealMandatoryOw = response.updatedFareQuoteResponses.fareDataOw.Response.Results.RequiredFieldValidators ? response.updatedFareQuoteResponses.fareDataOw.Response.Results.RequiredFieldValidators.IsMealRequired : false;
			}
	
			createFinalPassengersPayload();
			
			// Add the appropriate meal mandatory flag based on isRound
			bookFlightPayload = {
				...bookFlightPayload,
				...(isRound ? { isMealMandatoryOb: isMealMandatoryOb, isMealMandatoryIb: isMealMandatoryIb, isSeatMandatoryOb: isSeatMandatoryOb, isSeatMandatoryIb: isSeatMandatoryIb } : { isMealMandatoryOw: isMealMandatoryOw, isSeatMandatoryOw: isSeatMandatoryOw })
			};
			console.log('Book Flight Payload', bookFlightPayload);
			let ssrErrorCode = isRound ? tboSSROb.Response.Error.ErrorCode : tboSSR.Response.Error.ErrorCode;
			let ssrIbErrorCode = isRound ? tboSSRIb.Response.Error.ErrorCode : 1;
	
			// Here we are showing the Showing the Seat Selection Page
			if (element.includes('SSR')) {
				if (ssrErrorCode == 0 || ssrIbErrorCode == 0) {
					renderFlightSSR(bookFlightPayload, 'ob', '');
					updateFooterContinue('showFinalAmount', 'editPaxDetails', 'Back', 'Skip');
					showHidePaxReviewSheet('hide');
					jQuery('.flights__footer-continue.ssr').hide();
				}
				// Here we are showing the Bottom sheet to the user saying that the Seat Selection is not there so proceed for payment
				else {
					jQuery('.global__loading').remove();

					jQuery('.flights__footer-continue').show();
					
					let $footerContinue = jQuery('.flights__footer-continue');
					let $footerPrice = jQuery('.flights__footer-price');
					$footerContinue.filter('.ssr').show();
					showFlightsLoaders('calculatePrice');
					removeFlightsSSRPage();
					removeFlightsMealPage();
					$footerPrice.addClass('hide');
					showHidePaxReviewSheet('hide');
					updateFooterContinue('paxDetails', 'paxDetailsPage', 'Back', 'Pay Now');
					setTimeout(renderFlightsFinalPage, 2000);
					jQuery('.bill-details__item.conv__charges').removeClass('hide');
					
					//renderBottomSheet('', 'ssr-not-found');
					//loadLottieAnimation('payInstant', '/view/assets/img/pay_instantly_anim.json');
				}
			}
			else {
				let adultCount = Number(jQuery('#travelDetails-adults').val());
				let childCount = Number(jQuery('#travelDetails-children').val());
				let totalPax = adultCount + childCount;
				if ((isSeatMandatoryOw && seatSelectedOw && seatSelectedOw.length != totalPax )  || (isSeatMandatoryOb && seatSelectedOb && seatSelectedOb.length != totalPax) || (isSeatMandatoryIb && seatSelectedIb && seatSelectedIb.length != totalPax)) {
					if (ssrErrorCode == 0 || ssrIbErrorCode == 0) {
						updateFooterContinue('showFinalAmount', 'paxDetailsPage', 'Back', 'Continue');
						showHidePaxReviewSheet('hide');
						renderFlightSSR(bookFlightPayload, 'ob', '');
						toast('Seat selection is mandatory for the selected flight. Please select your seats to proceed.');
					}
				}
				else {
					showFlightsPaymentPage(response);
				}
			}
		}
	} catch (error) {
		toast('Error fetching fare quotes. Please select another flight');
		jQuery('.global__loading').remove();
		console.log(error);
	}
}

function showFlightsPaymentPage(response) {
	renderFlightsPayment(response.object);
	jQuery('.global__loading').remove();
}

function getTimeDifferenceAccrossTimeZones(startTime, endTime, sourceTZ, destinationTZ) {

	function getTimezoneOffset(date, timeZone) {
		let formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timeZone,
			timeZoneName: 'short'
		});
		let parts = formatter.formatToParts(date);
		let offsetPart = parts.find(part => part.type === 'timeZoneName').value;
		
		// Convert timezone offset to minutes
		let offset = offsetPart.includes('GMT') ? offsetPart.replace('GMT', '') : '0';
		let offsetMins = offset.split(':')[1]?parseInt(offset.split(':')[1]):0;
		return (parseInt(offset) * 60) + offsetMins;
	}

    // Create Date objects with the start time and end time in UTC
    let sourceTime = new Date(startTime);
    let destinationTime = new Date(endTime);

    // Adjust times according to their respective time zones
    /*let adjustedSourceTime = new Date(sourceTime.getTime() + sourceOffset * 60000);
    let adjustedDestinationTime = new Date(destinationTime.getTime() + destinationOffset * 60000);*/

    // Calculate the time difference in milliseconds
    //let timeDifference = adjustedDestinationTime - adjustedSourceTime;
	let timeDifference = destinationTime - sourceTime;

	let offsetDiff = 0;
	// Get the time offset for the source and destination time zones
	if (sourceTZ != destinationTZ){
		const sourceOffset = getTimezoneOffset(sourceTime, sourceTZ);
		const destinationOffset = getTimezoneOffset(destinationTime, destinationTZ);
		offsetDiff = sourceOffset - destinationOffset;
	}

    // Convert time difference to hours and minutes
    let diffHours = Math.floor(timeDifference / (1000 * 60 * 60));
    let diffMinutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

	diffHours = diffHours + Math.floor(offsetDiff / 60);
	diffMinutes = diffMinutes + Math.floor(offsetDiff % 60);

    return {
        hours: diffHours,
        minutes: diffMinutes
    };
}
  
  // Function to handle SSR API calls
function handleSSR(response, element) {
    console.log(response, element);
    fareRulePayload = getFlightAttributes();

	if (response.object.Response.Error.ErrorCode == 0) {
		renderFlightSSR(bookFlightPayload, 'ob', '');
	}
	
	
    /*if (element.nextCall === 'callObSSR') {
		tboSSRIb = response.object;
		fareRulePayload.ResultIndex = jQuery('.flights__search').attr('data-ob-result-index');
        jsInit('getSSR', fareRulePayload, { 'fareRulePayload': '', 'nextCall': 'callOnlyObSSR' });
    } 
    else if (element.nextCall === 'callIbSSR') {
		tboSSROb = response.object;
		fareRulePayload.isInBound = true;
        jsInit('getSSR', fareRulePayload, { 'fareRulePayload': '', 'nextCall': 'callOnlyIbSSR' });
    } 
    else if (element.nextCall === 'callOnlyIbSSR') {
		tboSSRIb = response.object;
		jQuery('#bookingForm').submit();
    } 
    else if (element.nextCall === 'callOnlyObSSR') {
		tboSSROb = response.object;
		jQuery('#bookingForm').submit();
    } 
    else {
		tboSSR = response.object;
		jQuery('#bookingForm').submit();
	}*/
}

