//This file is mean't to handle all the backend ajax calls
function fetchPosts(data, tab, element) {
	console.log(data);
	jQuery.ajax({
		url: API_URL + "/js-init",
		type: "POST",
		data: {
			reason: "getAllPosts",
			
			data: data,
			token: tokenMaster("get"),
		},
		success: function (response) {
			if (element == "shots" || element == "singleShot") {
				renderShots("fetchResults", response, element);
			} else if (element == "findBuddiesAi") {
				if (
					response.object &&
					response.object.list &&
					response.object.list.length > 0 &&
					response.object.list[0].localUsers
				) {
					renderLocals(
						response.object.list[0],
						".daywise-itinerary.infAnchor",
						"",
						response.body.location
					);
				}
			} else {
				renderFeed(response, tab);
			}
		},
		error: function (error) {
			console.log(error);
		},
	});
}

function fetchComments(data, source, postId) {
	// Get the posts
	jQuery.ajax({
		url: API_URL + "/js-init",
		type: "POST",
		data: {
			reason: "getComments",
			data: data,
			token: tokenMaster("get"),
		},
		success: function (response) {
			renderComments("render", response, source, postId);
		},
		error: function (error) {
			console.log(error);
		},
	});
}

function fetchUserProfile(state, userId) {
	data = {};
	if (userId) {
		data = {
			userId: userId,
		};
	}

	// Get the posts
	jQuery.ajax({
		url: API_URL + "/js-init",
		type: "POST",
		async: false,
		data: {
			reason: "fetchUserProfile",
			data: data,
			token: tokenMaster("get"),
		},
		success: function (response) {
			if (state == "init") {
				manageUserProfile("update", response.object);
			}
		},
		error: function (error) {
			console.log(error);
		},
	});
}

function bookmarkPost(postId, isBookmarked) {
	// Get the posts
	jQuery.ajax({
		url: API_URL + "/js-init",
		type: "POST",
		data: {
			reason: "bookmarkPost",
			data: { postId: postId, isBookmarked: isBookmarked },
			token: tokenMaster("get"),
		},
		success: function (response) {
			console.log(response);
		},
		error: function (error) {
			console.log(error);
		},
	});
}

function createDynamicLink(state, data, text) {
	jQuery.ajax({
		
		url: "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyDEyi7tDJdu8Bv5T8p70UK_6Cp5y9PZPPU",
		type: "POST",
		data: JSON.stringify(data),
		processData: false,
		contentType: false,
		success: function (data) {
			console.log(data);
			if (state == "whatsApp") {
				if (isAndroid()) {
					window.open("whatsapp://send/?text=" + text + " " + data.shortLink);
				} else {
					window.open("https://wa.me/?text=" + text + " " + data.shortLink);
				}
			} else if (state == "facebook") {
				window.open("https://www.facebook.com/sharer.php?u=" + data.shortLink);
			} else if (state == "twitter") {
				window.open(
					"https://twitter.com/intent/tweet?url=" + text + " " + data.shortLink
				);
			} else if (state == "copy") {
				toast("Link copied to clipboard");
				copyToClipboard(data.shortLink);
			}
		},
		error: function (error) {
			console.log(error);
		},
	});
}

function jsUpload(state, data, element) {
	data.append("token", manageToken(state));
	data.append("reason", state);

	jQuery.ajax({
		url: API_URL + "/upload",
		type: "POST",
		data: data,
		processData: false,
		contentType: false,
		success: function (data) {
			if (state == "uploadDP") {
				if (element == "newOnboarding") {
				} else {
					renderOnboarding("theEnd", data, "onboarding");
				}
			}
			else if (state == "uploadChatMedia") {
				console.log("Chat media upload response:", data);
				var timestamp = Number(new Date().getTime() / 1000).toFixed(0);
				addNewChatMessageSelf(jQuery(".chat__header").data('chatId'), 'personal', timestamp, element.caption, "media", data)
				jQuery('.media-upload__container').remove();
				jQuery('#main, #singleChat').css('display', 'block');
			}
			else if (state == "coverUpload") {
				if (element == "newOnboarding") {
				} else {
					renderProfile("editProfileCover", data);
				}
				fbEvent("coverUpload");
			}
			else if (state == "groupChatImage") {
				console.log("Group chat image upload response:", data);
				handleDataFromNewTab(data);
				
				jQuery('.media-upload__container').remove();
				jQuery('#main, #singleChat').css('display', 'block');
				//renderChat("groupChatImageChange", data, element);
			} else if (state == "uploadListingImages") {
				renderAddListing("uploadedListingImages", data, element);
			} else if (state == "uploadMessageDashboardMedia") {
				renderMessagesDashboard("saveMediaInLocal", "", data);
			} else {
				console.log(data);
				if (data.errorMessage.includes("Invalid")) {
					toast(data.errorMessage);
				}
			}
		},
		error: function (jqXHR, status, error) {
			console.log("Upload Failed. Error: " + error);
		},
		xhr: function () {
			var xhr = new XMLHttpRequest();

			xhr.upload.addEventListener(
				"progress",
				function (event) {
					if (event.lengthComputable) {
						var uploadPercentage = event.loaded / event.total;
						console.log(uploadPercentage);
						jQuery(".progress").text(parseInt(uploadPercentage * 100) + "%");
					}
				},
				false
			);

			return xhr;
		},
	});

	// function manageToken(state) {
	// 	token = tokenMaster("get");

	// 	if (state == "resetPass") {
	// 		token = localStorage.getItem("tempToken");
	// 	}

	// 	return token;
	// }
}

function jsInit(state, data, element) {
	// Get the posts
	jQuery.ajax({
		url: API_URL + "/js-init",
		type: "POST",
		data: {
			reason: state,
			data: data,
			token: manageToken(state),
		},
		headers: {
			authorization:
				manageToken(state) != "" ? "Bearer " + manageToken(state) : undefined,
		},
		success: function (response) {
			//LOGGING OUT USER IN THE CASE OF TOKEN FAILURE.
			if (
				state != "logout" &&
				response &&
				((response.data &&
					response.data.responseCode == 401 &&
					response.data.errorMessage &&
					response.data.errorMessage.includes(
						"Authorization has been denied"
					)) ||
					response.responseCode == 401)
			) {
				//logout the user.
				if (isAndroid()) {
					Android.googleRevokeAccess();
				}
				jsInit("logout", { deviceUniqueId: "" });
				return;
			}

			if (response.refresh_token) {
				console.log(response.refresh_token);
				tokenMaster("set", response.refresh_token);
			}
			// if (element !== 'changeLastActiveStatus') {
			// 	changeLastActiveStatus();
			// }

			if (state == "getCommentReplies") {
				renderComments("render", response, element);
			} else if (state == "changeLastActiveStatus") {
				renderLastActiveStatus("render", response);
			} else if (state == "getTabs") {
				renderTabs(response.object.config[0], element);
			} else if (state == "refreshToken") {
				tokenMaster("set", response.refresh_token);
				reloadWindowWithIosCheck();
			} else if (state == "fetchPost") {
				if (element == "showUpdatedPost") {
					console.log(response);
					postLoader("hide");
					refreshFeed();
					renderEditPost(response, element);
				} else {
					renderPost(response, element);
				}
			} else if (state == "fetchLikes") {
				renderLikes("render", response, element);
			} else if (state == "followUser") {
				if (element.from == "feed") {
					renderFollowIconFeeds(response, element);
				} else if (element !== "feed_item") {
					renderFollowButton(response, element);
				}
			} else if (state == "fetchNotifications") {
				renderNotifications("store", response);
			} else if (
				state == "fetchSearchLocations" ||
				state == "fetchSearchBuddies" ||
				state == "fetchTrendingSearches" ||
				state == "fetchRecentSearches"
			) {
				renderSearch("render", response, state);
			} else if (state == "fetchCoupons") {
				renderPremium("coupons", response);
			} else if (
				state == "searchLocation" ||
				state == "searchBuddy" ||
				state == "searchHashtag" ||
				state == "searchFindBuddy"
			) {
				if (
					element == "searchPagination" ||
					element == "searchLocationPagination" ||
					element == "searchHashtagsPagination" ||
					element == "searchFindPagination"
				) {
					console.log(response);
					renderSearchResults(
						icons,
						response,
						element,
						jQuery(".search__results-box")
					);
				} else {
					// Here we will be adding the search results for the new chat search
					// Here we will render the followers list having both the followers and the followings
					var listHtml = '';
					var userList = response.object.users.reverse();
					console.log(userList);

					userList.forEach(function (follower) {
						listHtml += `
							<!-- Users -->
							<div class="conversation global-search-result">
								<div class="avatar">
									<img src="${returnImagePath(follower.imageUrl)}" alt="${follower.name}" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
								</div>
								<div class="content">
									<div class="name">${follower.name}</div>
								</div>
								<div class="checkbox hidden">
									<input type="checkbox" id="checkbox-${follower.userId}" class="user-checkbox" data-user-id="${follower.userId}" data-user-name="${follower.name}" data-user-image="${follower.imageUrl}" >
									<label for="checkbox-${follower.userId}" class="custom-checkbox">
										<svg class="selected-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="20 6 9 17 4 12"></polyline>
										</svg>
									</label>
								</div>
							</div>
						`;
					});
					jQuery('.conversation-list').append(listHtml);
					//renderSearch("render", response, state);
				}
			} else if (state == "locationSearch") {
				renderLocations("renderSearchResults", response, element);
			} else if (state == "fetchProfile") {
				if (response.responseCode == "200") {
					manageSecondary("show", "Profile", "Profile");
					renderProfile("render", response, element);
				} else {
					if (response.errorMessage) {
						toast(response.errorMessage);
					} else {
						toast("User has deactivated their account.");
					}
				}
			} else if (state == "fetchFollowers") {
				console.log(response);
				if (element.type == "combined") {
					// Fetch Following Now
					jsInit(
						"fetchFollowers",
						{ userId: element.userId, pageNumber: "0", type: 1 },
						{ followersResp: response, type: "renderFollowers", element: element }
					);
				} else if (element.type == "renderFollowers") {
					//renderFollowersView(element.followersResp, response, );
					var combinedUsers = [
						...response.object.list,
						...element.followersResp.object.list,
					];

					var finalSetOfUsers = combinedUsers.filter(
						(user, index, self) =>
							index === self.findIndex((u) => u.userId === user.userId)
					);
					console.log(finalSetOfUsers);
					renderFollowersList(finalSetOfUsers, element.element);
				}

				/*if (element == "groupChat" || element == "searchGroupChat") {
					renderChat("renderGroupChatFollowers", response, element);
				} else if (element == "chatSend" || element == "searchChatSend") {
					renderChatSend("renderFollowers", response, element);
				} else {
					renderFollowersView("render", response, element);
				}*/
			} else if (state == "fetchRatings") {
				renderRatingsView("render", response);
			} else if (state == "rateUser") {
				renderRatingsView("rateUser", response);
			} else if (state == "getExperienceRatings") {
				console.log(response);
				renderRatingsView("rateExperience", response);
			} else if (state == "fetchShots") {
				if (element == "buddy") {
					console.log(response);
					//renderAddPost('buddyFlow', response, element);
				} else if (element == "ask") {
					console.log(response);
				} else {
					renderShots("fetchResults", response);
				}
			} else if (state == "fetchComments") {
				renderComments("render", response, element);
			} else if (state == "fetchCountries") {
				switch (element) {
					case "signUp":
						console.log(response);
						renderLogin("renderCountries", response);
						break;
					case "onboarding":
						renderOnboarding("renderCountries", response);
						break;
					case "bookingSummary":
						renderBookingSummary("renderCountries", response);
						break;
					case "editProfile":
						renderProfile("cc", response);
						break;
					case "flights-dial-code":
						renderCountries(response.object, "#flights__countryCode");
						break;
					case "newLogin":
						console.log(response);
						let countryCodes = response.object;
						let countryCodeInput = document.getElementById("countryCodeInput");
						let countryCodeDropdown = document.getElementById(
							"countryCodeDropdown"
						);
						countryCodeDropdown.innerHTML = "";
						countryCodes.forEach((country) => {
							let div = document.createElement("div");
							div.textContent = `${country.country} (${country.code})`;
							div.dataset.code = country.code;
							div.dataset.country = country.country;
							div.addEventListener("click", function () {
								countryCodeInput.value =
									this.dataset.code + " " + this.dataset.country;
								countryCodeDropdown.style.display = "none";
							});
							countryCodeDropdown.appendChild(div);
						});
						countryCodeDropdown.style.display = "block";
						jQuery('#countryCodeDropdown div[data-code="+91"]').click();
						break;
				}
			} else if (state == "fetchInterests") {
				if (element == "onboarding") {
					renderOnboarding("renderInterests", response);
				}
			} else if (state == "fetchServices" || state == "searchServices") {
				if (element == "pagination" || element == "search") {
					renderAllServices("render", response);
				} else if (element == "premiumPage") {
					console.log(response);
					renderAllServices(
						"render",
						response,
						".chat-unlimited.group-trips .premium-group-trips-wrapper"
					);
				} else {
					renderAllServices("init", response);
				}
			} else if (state == "getServices") {
				if (element == "editListing") {
					currentListing = response.object;
					renderAddListing("init", currentListing);
				} else if (element == "manageSingleListing") {
					renderExperience("init", response, "manageService");
				} else {
					renderExperience("init", response, "service");
				}
				loaderMain("secondary", false);
			} else if (
				state == "login" ||
				state == "loginGoogle" ||
				state == "loginFacebook" ||
				state == "loginApple" ||
				state == "loginApple"
			) {
				if (element == "guest") {
					console.log(response);
					guestMaster("set");
					tokenMaster("set", response.object.token);
					Init();
				} else {
					renderLogin("manageLogin", response, state);
				}
			} else if (state == "logout") {
				tokenMaster("logout", response);
			} else if (state == "forgotPass") {
				if (element == "newLogin") {
					if (response.responseCode == "200") {
						toast("OTP sent successfully.");
						jQuery(".form__group").append(`
						<input type="number" name="otp" placeholder="Enter OTP" class="form__input otp"
						data-dial="${element.dialCode}" required>
					`);
						jQuery(".btn.btn-primary")
							.addClass("forgot__pass-otp")
							.removeClass("sign__up")
							.removeClass("reset__password")
							.text("Verify OTP");
					} else {
						toast(response.errorMessage);
					}
				} else {
					renderLogin("manageForgotPass", response);
				}
			} else if (state == "matchOtpForgot") {
				if (element == "newLogin") {
					// Old
					//renderLogin('manageMatchOtpForgot', response);
					if (response.responseCode == "200") {
						toast("OTP verified successfully. Please enter your new password.");
						jQuery(".form__input.otp")
							.val("")
							.attr("placeholder", "Enter New Password")
							.attr("type", "text")
							.addClass("new__password")
							.removeClass("otp");

						jQuery(".btn.btn-primary")
							.addClass("new__password")
							.removeClass("sign__up forgot__pass-otp")
							.removeClass("reset__password")
							.text("Confirm and Login");
						localStorage.setItem("tempToken", response.object.token);
					} else {
						toast(response.errorMessage);
					}
				} else {
					renderLogin("manageMatchOtpForgot", response);
				}
			} else if (state == "resetPass") {
				if (element.newLogin && response.responseCode == "200") {
					var payload;
					if (isAndroid() || isIOS()) {
						payload = {
							email: element.email,
							password: element.password,
							gToken: token,
							deviceId: manageNotificationToken("get"),
							deviceUniqueId: manageNotificationToken("vendorUUID"),
						};
					} else {
						payload = {
							email: element.email,
							password: element.password,
							gToken: token,
							deviceId: manageNotificationToken("get"),
						};
					}
					toast("Password reset successfully. Logging you in.");
					jsInit("login", payload);
				} else if (element.newLogin && response.responseCode != "200") {
					toast(response.errorMessage);
				} else {
					renderLogin("manageResetPass", response);
				}
			} else if (state == "uniqueCheck") {
				if (element == "bookingSummary") {
					manageExperienceBookings("uniqueCheck", response);
				} else {
					renderLogin("manageUniqueCheck", response);
				}
			} else if (state == "profileSendOTP") {
				if (element == "editProfileOtp") {
					renderProfile("editProfileOtp", response);
				} else if (element !== "resend") {
					renderOnboarding("sendOTP", response);
				}
			} else if (state == "isPhoneNumberUnique") {
				renderProfile("isPhoneNumberUnique", response);
			} else if (state == "updatePhoneNumber") {
				if (element == "onboarding") {
					renderOnboarding("updatePhoneNumber", response);
				} else if (element == "editProfile") {
					renderProfile("editProfileNumberVerified", response);
				}
				// else if (element == 'signUp') {
				//     renderOnboarding('updatePhoneNumber', response);
				// }
			} else if (state == "signUpOTP") {
				if (element == "bookingSummary") {
					manageExperienceBookings("signUpOTP", response);
				} else {
					renderOnboarding("theEnd", response);
				}
			} else if (state == "fetchServicesList") {
				if (element == "onboarding") {
					renderOnboarding("renderServicesList", response);
				}
			} else if (state == "fetchProfileViews") {
				renderProfile("renderProfileViews", response);
			} else if (state == "feedback") {
				renderFeedback("onSubmit", response);
			} else if (state == "blockedUsers") {
				renderBlockerUsers("render", response);
			}
			else if (state == "blockUser") {
				console.log(response);
				if (element.type == 'userAndChat') {
					console.log("User and Chat");
					jsInit('acceptChatRequest', { chatId: element.chatId, userId: element.userId, optionType: 'rejected' });
				}
				//renderBlockerUsers("blockUser", response);
			}
			else if (state == "unblockUser") {
				renderBlockerUsers("unblockUser", response);
			} else if (state == "reportPost" || state == "reportUser") {
				console.log(response);
				renderReportBox("response", response, element);
			} else if (state == "fetchAllInfluencers") {
				console.log(response);

				var infHtml = ``;
				response.object.reverse().forEach((influencer) => {
					if (influencer.name.trim() != "" && influencer.imageUrl.trim() != "" && influencer.city.trim() != "") {
						infHtml += `
						<div class="travel-influencer-card" data-user-id="${influencer.userId}" data-image-url="${influencer.imageUrl}" data-name ="${influencer.name}" data-city="${influencer.city}">
							<div class="travel-influencer-image">
								<img src="${returnImagePath(influencer.imageUrl)}" alt="Michelle Sauniere" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
							</div>
							<div class="travel-influencer-name">${influencer.name}</div>
							<div class="travel-influencer-followers">${influencer.city}</div>
						</div>`;
					}
				});
				jQuery(".travel-influencers-scroll").html(infHtml);
			} else if (state == "addPost") {
				if (element == "findMeetups") {
					renderAddPost("meetup", response, element);
				} else if (element == "findBuddy" || element == "findBuddyAi") {
					renderAddPost("buddy", response, element);
					fbEvent("findBuddy");
				} else if (element == "ask") {
					renderAddPost("ask", response, element);
				} else {
					renderAddPost("response", response, element);
				}
			} else if (state == "updatePost") {
				renderAddPost("response", response, element);
			} else if (state == "deletePost") {
				deletePost("response", response, element);
			} else if (state == "getOrderId") {
				managePayments("openRazorpayWindow", response);
			} else if (state == "getPaymentDetails") {
				managePayments("onPaymentResponse", response);
			} else if (state == "givePremium") {
				managePayments("onVerifyUser", response);
			} else if (state == "updateOnboarding") {
				console.log(response);
				renderOnboarding("theEnd", response, state);
			} else if (state == "getPremiumPricingList") {
				renderPremium("renderMain", response, element ? element : undefined);
			} else if (state == "getSubscriptionInfo") {
				renderPremium("renderSubscription", response);
			} else if (state == "addExpRating") {
				renderExperienceRating("renderExpRating", response);
			} else if (state == "getExperiences") {
				console.log(response);
				if (element == 'groupChatExperiences') {
					jQuery('.trip-title').text('Trips for ' + response.filteredData.dailyExperiences[0].location.split(',')[0]);
					console.log('Experiences to be rendered inside Group Chat', response);
					var expInsideGrup = ``;
					response.filteredData.dailyExperiences.forEach((experience) => {
						expInsideGrup += `<div class="trip-card" data-exp-id="${experience.id}">
						  <div class="trip-image">
							  <img src="${returnImagePath(experience.media[0].media_url)}" alt="${experience.title}" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
						  </div>
						  <div class="trip-details">
							  <div class="trip-location">
							  <span>⦿ ${experience.location}</span>
							  </div>
							  <h3 class="trip-name">${experience.title}</h3>
							  <p class="trip-price">₹ ${experience.pricing}</p>
							  <div class="trip-footer">
							  <p class="trip-emi">EMI Starting from <span>₹2250</span>/ Month</p>
							  <span class="share-icon">↗</span>
							  </div>
						  </div>
						  </div>`;
					});
					jQuery('.trip-cards').html(expInsideGrup);
					jQuery('.trip-section').css('display', 'block');
					
					return;
				}
				var gtHtml = `<h2 class="travel-section-title">Best-Selling Group Trips</h2>`;
				response.object.forEach((experience) => {
					gtHtml += `
						<div class="travel-package-card">
						<div class="travel-package-image">
						<img src="${returnImagePath(experience.media[0].media_url)}" alt="${
						experience.location
					}" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
						</div>
						<div class="travel-package-info">
						<div class="travel-location">
						${icons.location}
						<span class="travel-location-name">${experience.location}</span>
						</div>
						<div class="travel-package-title">${experience.title}</div>
						<div class="travel-package-price">
						<span class="travel-price">₹ ${experience.pricing} /-</span>
						<span class="travel-emi hidden">EMI from ₹250/ Month</span>
						</div>
						</div>
						</div>`;
				});
				jQuery(".travel-section.container").html(gtHtml);
			} else if (state == "expressInterest") {
				console.log(response);
				renderExperience("expressInterest", response, "service");
			} else if (state == "getExperienceDashboard") {
				if (element == "desktopSidebar") {
					renderDesktopSidebar("experiences", response);
				} else {
					if (!isAndroid() && !isIOS() && !isMobile()) {
						renderDesktopSidebar("experiences", response);
					}
					renderAllExperiences("render", response);
				}
			} else if (state == "priceValidation") {
				manageExperienceBookings("priceValidation", response);
			} else if (state == "blockTickets") {
				manageExperienceBookings("blockTickets", response);
			} else if (state == "confirmBooking") {
				manageExperienceBookings("finale", response);
			} else if (state == "getAvailableTickets") {
				console.log(data);
				manageAvailableTickets("render", response, element);
			} else if (state == "getOrderDetails") {
				renderOrderDetails(response, element);
			} else if (state == "getCoupons") {
				if (element == "renderFlightCouponCodesList") {
					renderFlightCouponCodesList(response);
				} else {
					renderCoupons("render", response);
				}
			} else if (state == "validateCoupon") {
				if (response.responseCode == "200") {
					if (
						element == "couponValidationFlights" ||
						element == "preAppliedCoupon"
					) {
						console.log(response);
						//Close the Drawer & Show Animation
						jQuery(".flight__coupon-close").click();
						showFlightsLoaders("couponApplied");
						setTimeout(function () {
							jQuery(".global__loading").remove();
						}, 2500);

						// After the coupon is applied, we are updating the fare breakdown

						let coupon = response.object[0];
						let $grandTotal = jQuery(".bill-details__grand-total");
						let newTotal =
							Number($grandTotal.attr("data-total")) - coupon.couponValue;

						jQuery(
							".bill-details__item.promo_code, .bill-details__saved-tag"
						).removeClass("hide");

						jQuery(".flight__coupons-input input").val(coupon.couponcode);
						jQuery(
							".bill-details__item.promo_code .flight__total_fare-title"
						).text("Offer Discount ( " + coupon.couponcode + " )");
						jQuery(".bill-details__saved-tag")
							.attr("data-coupon-val", coupon.couponValue)
							.text(`Saved ₹${coupon.couponValue}`);

						jQuery(".flights__footer-price").attr("total-price", newTotal);
						jQuery(".bill-details__item.promo_code").show();
						jQuery(".bill-details__saved-tag").show();
						jQuery(".flights__apply-coupon").addClass("applied").text("REMOVE");
						jQuery(".bill-details__savings-amount.coupon").attr(
							"data-coupon-val",
							coupon.couponValue
						);

						jQuery(".flights__final-amount").attr(
							"data-final-amount",
							newTotal
						);
						jQuery(".flights__final-amount").text(`₹${newTotal}`);
						jQuery(".bill-details__savings-amount.coupon").text(
							`- ₹${coupon.couponValue}`
						);
						jQuery(".flights__footer-price .price").text(
							jQuery(".flights__final-amount").text()
						);
					} else {
						data = response.object[0];
						discountedPrice = getComputedDiscount(
							data.discountvalue,
							data.isdiscountinperc,
							data.maxdiscount
						);
						//Add the coupon to the booking details
						bookingDetails = JSON.parse(localStorage.getItem("bookingDetails"));
						bookingDetails["coupon"] = data.couponid;
						bookingDetails["couponCode"] = data.couponcode;
						bookingDetails["couponDiscount"] = discountedPrice;
						localStorage.setItem(
							"bookingDetails",
							JSON.stringify(bookingDetails)
						);
						toast("Your coupon has been successfully applied on your booking");
						renderBookingSummary("updateTotals");
					}
				} else {
					if (element != "preAppliedCoupon") {
						toast("You have entered an invalid coupon code");
						jQuery("#bookingSummary__couponForm input").val("");
						jQuery(".flight__coupons-input input").val("");
					}
				}
			} else if (state == "fetchServices") {
				renderAllServices("render", response);
			} else if (state == "update_gender_and_location") {
				updateUserLocation("processResponse", response);
			} else if (state == "lfb") {
				renderLFB("render", response);
			} else if (state == "contactedLeads") {
				renderLeads("render", response, element);
			} else if (state == "connectLead") {
				renderLeads("connect", response);
			} else if (state == "spDashboard") {
				if (element == "spDashboardFirstLoad") {
					console.log("First Load");
					renderSpDashboard("renderFirstSp", response);
				} else {
					renderSpDashboard("render", response);
				}
			} else if (state == "serviceAttributes") {
				renderAddListing("renderFacillities", response);
			} else if (state == "costDurations") {
				renderAddListing("renderPricing", response);
			} else if (state == "updateListingStatus") {
				renderAddListing("updateListingStatus", response);
			} else if (state == "changePassword") {
				renderSettings("manageUpdatePass", response);
			} else if (state == "deactivateAccount") {
				renderSettings("manageDeactivation", response);
			} else if (state == "fetchChatUsers") {
				console.log(response);
				if (response.chatArr.length < 1 || response.chatArr == undefined) {
					hideLoader();
					createChatsInterface();
					addHomePageForNewUsers();
					var urlParams = new URLSearchParams(window.location.search);
					var aiChatRedirect = urlParams.get('AI');
					console.log("AI Chat Redirect: ", aiChatRedirect);
					if (aiChatRedirect && aiChatRedirect != '') {
						console.log("AI Chat Redirect: ", aiChatRedirect);
						// Click the chats__new-chat ai button
						setTimeout(() => {
							
							openChat(
								"",
								{
									chatName: "Rhea",
									chatImage: "https://beatravelbuddy.com/view/assets/img/Ai-rhea.webp",
								},
								false,
								"ai"
							);
						}, 500);
						
					}
					return;
					
				}
				else if (response.chatArr.length < 20 && response.chatArr.length > 0) {
					createChatsInterface(response);
					addHomePageForNewUsers();
					return;
				}
				createChatsInterface(response);
			} else if (state == "fetchChatSingleUser") {
				renderChat("renderSingleChatUser", response);
			}
			else if (state == "fetchChatMessages") {
				console.log(response, element);
				if (element.chatType == "group") {
					jsInit(
						"fetchGroupMembers",
						{ groupId: element.chatId, fetchAll: true },
						{ response: response, element: element }
					);
				}
				else {
					openChat(response, element, false);
					if (response.messages) {
						jsInit("updateChatFlags", {
							chatId: element.chatId,
							optionType: "seen",
							timeStamp:
								response.messages[response.messages.length - 1].timeStamp,
						});
					}
					//renderChat('renderSingleChat', response);
				}
			} else if (state == "postChatMessage") {
				//renderChat('postChatMessage', response);
			} else if (state == "initiateChat") {
				console.log(response);
				switch (element.type) {
					case "message_dashboard":
						console.log(response);
						break;
					case "groupChat":
						console.log(response);
						console.log(element);
						addUsersToGroup(
							response.chatArr.chatId,
							element.newMemberIds,
							element.groupMembersInfo,
							element.createdById,
							element.createdBy,
							element.groupName,
							element.groupProfileUrl,
							element.senderId
						);
						//renderChat("renderChatGroup", response);
						break;
					// Single Chat
					case "new-dm":
						console.log(response);
						console.log(element);

						if (response.messages == undefined || response.messages.length < 1) {
							openChat(response.chatDetails, element, false, 'new-dm');
						}
						else {
							openChat(response, response.chatDetails, false, 'dm-init');
						}
						break;
					default:
				
						openChat(response, element, false);
						break;
				}
			}
			else if (state == "acceptChatRequest") {
				console.log(response);
				if (response.responseCode == 200) {
					var updateValue = jQuery('.chat__header').data('dataMembers');
					updateValue.selectedChatData.isMsgReqAccepted = response.chatArr[0].isMsgReqAccepted;
					updateValue.selectedChatData.isRejected = response.chatArr[0].isRejected;
					jQuery('.chat__header').data('dataMembers', updateValue);
					
					//Get the double encrypted UserId and then proceed
					//if (element.action == 'block') {
						
						
						// jsInit('blockUser', {
						// 	userId: element.userId,
						// 	type: 1,
						// });
					//}
				}
				//renderChat("acceptChatRequest", response);
			}
			else if (state == "getFeedCards") {
				if (element == "desktopSidebar") {
					renderDesktopSidebar("followers", response);
				} else if (element == "recommendedFollowers") {
					renderRecommendedFollowers("render", response);
				}
			} else if (state == "fetchGroupMembers") {
				console.log(response, element);
				var groupMembers = response.groupMembers;
				var openGroupChat = true;
				groupMembers.forEach((member) => {
					if ((member.uid != null && member.uid == localStorage.getItem("plainUserId")) || (member.Uid != null && member.Uid == localStorage.getItem("plainUserId")) ) {
						if (member.isRequested == '0') {
							openGroupChat = false;
							showToast("Please wait for the Admin to Accept your Request");
							return;
							
						}
					}
					
				});
				
				if (!openGroupChat) {
					return;
				}
				
				openChat(element, response, true);
				var locationCity = response.postLocData.postLocation.split(",")[0];
				console.log(locationCity);
				jsInit("updateChatFlags", {
					chatId: element.element.chatId,
					optionType: "seen",
					timeStamp:
					element.response.messages[element.response.messages.length - 1].timeStamp,
				});
				if (locationCity == "" || locationCity == undefined || locationCity == null || locationCity == "NA") {
					locationCity = jQuery('.chat__header-name').text();
					locationCity = locationCity.split(' ')[2];
				}
				jsInit('getExperiences', { filter: { location: locationCity } }, 'groupChatExperiences');
				// updateGroupMemberInfo(response.chatId, response).then(() => renderChat('renderSingleChat', element));
			}
			else if (state == "addUsersToGroup") {
				console.log(response);

				// REFRESH THE URL
				window.location.reload();
				/*if (element == "addUsersToGroupLater") {
					renderChat("addUsersToGroupLater", response, element);
				} else {
					renderChat("addUsersToGroup", response);
				}*/
			} else if (state == "removeUserFromGroup") {
				console.log(response);
				// REFRESH THE URL
				window.location.reload();
				//renderChat("removeUserFromGroup", response);
			} else if (state == "exitUserFromGroup") {
				console.log(response);
				// REFRESH THE URL
				window.location.reload();
				//renderChat("exitUserFromGroup", response);
			} else if (
				state == "setUserPresence" ||
				state == "setUserNode" ||
				state == "updateChatFlags"
			) {
				if (state == "setUserNode") {
					// Call this function when you want to append the chats interface
					jsInit("fetchChatUsers", "");
				}
			} else if (state == "havala") {
				console.log(response);
				console.log(element);
				if (element == "redirectedFromDM") {
					var chatItem = jQuery(".chats__item.personal").filter(function () {
						if (jQuery(this).data("userId") == response.userId) {
							jQuery(this).click();
							console.log('Found');
						}
					});
					hideLoader();
				}
				if (element.type == "chat") {
					subscribeToChat(response, "userChats")
						.then(() => {
							console.log("Chat subscription complete");
							return subscribeToChat(element.chats, "chats");
						})
						.then(() => {
							console.log("User chat subscription complete");
							// Subscribe to Group Chat
							return subscribeToChat(element.chats, "groupChats");
						})
						.then(() => {
							console.log("Group chat subscription complete");
						})
						.catch((error) => {
							console.error("Error during subscription:", error);
						});
					// Parse URL parameters
					var urlParams = new URLSearchParams(window.location.search);
					var userData = {
						userId: urlParams.get('userId'),
						userName: urlParams.get('userName'),
						userEmail: urlParams.get('userEmail'),
						userType: urlParams.get('userType'),
						isVerified: urlParams.get('isVerified'),
						location: urlParams.get('location'),
						profilePic: urlParams.get('profilePic')
					}; 
					
					// Redirected From Find Group
					var findGroup = urlParams.get('findGroup');
					console.log("Find Group: ", findGroup);
					if (findGroup && findGroup != '') {
						showToast('You have requested to join the group. Please wait for the admin to approve your request.');
						console.log("Find Group: ", findGroup);
					}

					// Redirected From DM Chat
					var dmChatRedirect = urlParams.get('dmChatRedirect');
					console.log("DM Chat Redirect: ", dmChatRedirect);
					if (dmChatRedirect && dmChatRedirect != '') {
						console.log("DM Chat Redirect: ", dmChatRedirect);
						//Extract userId from the query string
						var userId = dmChatRedirect.split('=')[1];
						jsInit('havala', { userId: userId }, 'redirectedFromDM');
						
					}
					
					// Redirected From AI
					var aiChatRedirect = urlParams.get('AI');
					console.log("AI Chat Redirect: ", aiChatRedirect);
					if (aiChatRedirect && aiChatRedirect != '') {
						console.log("AI Chat Redirect: ", aiChatRedirect);
						// Click the chats__new-chat ai button
						setTimeout(() => {
							openChat(
								"",
								{
									chatName: "Rhea",
									chatImage: "https://beatravelbuddy.com/view/assets/img/Ai-rhea.webp",
								},
								false,
								"ai"
							);
						}, 500);
						
					}
					
					
					//Redirected From Notification
					var notification = urlParams.get('notification');
					console.log("Notification: ", notification);
					if (notification && notification != '') {
						console.log("Notification: ", notification);
						// Click the first chat item
						jQuery('.chats__item').first().click();
					}
					
					console.log("User Data: ", userData);
					
					// Empty the query params
					window.history.replaceState({}, '', window.location.pathname);
					
					hideLoader();


					//subscribeToChat(response, "userChats");
					//subscribeToChat(element.chats, "chats");
				}
			}
			else if (state == 'updateIsRequested') {
				console.log(response);
			}
			
			else if (state == "follow") {
				console.log("Helper");
				console.log(response);
				renderProfile("follow", response, element);
			} else if (state == "updateProfile") {
				console.log("Update");
				console.log(response);
				// manageLikes('likedPost', response, element); // Some how its only working here as of now & not in likePost
			} else if (state == "updateAbout") {
				console.log("About");
				console.log(response);
				if (element == "newOnboarding") {
					jQuery('#footer ul li[data-item="feed"]').click();
					toast("Your profile has been updated successfully.");
					showHidePaxReviewSheet("hide");
				}
			} else if (state == "deleteCover") {
				console.log("deleteCover");
				console.log(response);
				renderProfile("deleteCover", response);
			} else if (state == "editComment") {
				console.log(response);
			} else if (state == "lfbCheck") {
				console.log(response);
				manageLikes("likedPost", response, element);
			} else if (state == "addUserToFindGroup") {
				if (response.responseCode == 200) {
					renderGroupChatFind("createGroupButton", response);
				} else {
					toast(response.errorMessage);
				}
			} else if (state == "likeShot") {
				console.log(response);
				manageLikes("likedShot", response, element);
			} else if (state == "likePost") {
				console.log(response);
			} else if (state == "updateSocialLink") {
				console.log(response);
			} else if (state == "saveListing") {
				renderAddListing("savedListing", response);
			} else if (state == "replyComment") {
				console.log(response);
				renderComments("replyComment", response);
			} else if (state == "likeCommentOrReply") {
				console.log(response);
			} else if (state == "fetchUsersGroups") {
				renderChatSend("renderGroups", response);
			} else if (state == "nearByUsers") {
				renderNearByUsersInMap(response);
			} else if (state == "isProcessing") {
				console.log(response);
				renderAddPost("isProcessing", response, element);
			} else if (state == "checkRefer") {
				renderOnboarding("checkRefer", response);
			} else if (state == "messageDashboard") {
				console.log(response);
			} else if (state == "getCohorts") {
				renderMessagesDashboard("init", response);
			} else if (state == "initiateMessage") {
				console.log("initiateMessage", response);
			} else if (state == "getMessageHistory") {
				if (element == "render") {
					renderMessagesDashboard("messageDashboardAnalytics", "", response);
				} else if (element == "refresh") {
					renderMessagesDashboard(
						"messageDashboardAnalytics",
						"refresh",
						response
					);
				} else {
					renderMessagesDashboard(
						"getNumberOfSeenUsersAndUpdate",
						element,
						response
					);
				}
			} else if (state == "sendEnquiryDetails") {
				console.log(response);
			} else if (state == "updateMessageDashboardHistory") {
				console.log("M.D Analytics", response);
			} else if (state == "openProfileFromChat") {
				console.log(response);
				// window.open(`https://beatravelbuddy.com/${pageName}?app=${deviceType}`, '_self');
				// window.open(response, '_blank');
				openSpecificPage("profile/" + response, "_self");
				//jsInit('fetchProfile', { userId: response }, '#secondary .secondary__tab:last-child .drawerBody');
			} else if (
				state == "givePremiumByAdmin" ||
				state == "makeRemoveInfluencer" ||
				state == "pinUnpinPost" ||
				state == "blockUserByAdmin"
			) {
				loaderMain("global", false);
				toast("Successful");
				refreshFeed();
			} else if (state == "googleAi") {
				console.log("Google AI Response", response);
				if (response.responseCode == "200") {
					manageSecondary("show", "itinerary", {
						data: response.object.data,
						location: element,
					});
					renderAiItinerary(
						response.object.data,
						"",
						response.object.locationIds
					);
					monthName = getMonthName(response.object.month);
					// Replace spaces with hyphens
					urlLink = (
						"ai-travel-plan/" +
						response.object.location.replace(/\s+/g, "-") +
						"-" +
						response.object.passengers +
						"-" +
						response.object.budget +
						"-" +
						monthName +
						"/" +
						response.object.itineraryId
					).replace(/[\s,]+/g, "-");
					window.history.pushState({}, "", urlLink);
				} else {
					toast(response.errorMessage);
					jQuery(".global__loading").remove();
				}
			} else if (state == "getItinerary") {
				// Loads the itinerary from the Url
				console.log(response);
				manageSecondary("show", "userItinerary", { response: response }); // , 'extra': element
			} else if (state == "getUsersAiPackage") {
				console.log(response);
				//showHidePremiumAi(response.object);
			} else if (state == "buyAiPackage") {
				if (response.responseCode == "200") {
					console.log(response);
					localStorage.setItem(
						"packageOwnedId",
						response.object.packageOwnedId
					);
					toast(
						"Welcome to the elite club. Enjoy planning your trips with AI Buddy."
					);
					clearIntervalAndHidePremium();
				}
			} else if (state == "getUserItineraries") {
				console.log(response);
				renderAllAiTrips(response, "allAiTrips");
			} else if (state == "getDeltaDataChats") {
				sendChatDataToIndexedDb("check", response, element);
				if (element == "refreshChat") {
					toast("Chats Refreshed");
					jQuery(".refresh_chat").show();
				}
			} else if (
				state == "getAllHostellers" ||
				state == "getNewHostellers" ||
				state == "getHostellersFromLocation"
			) {
				renderHostellers(state, response.object.data, element);

				if (state != "getHostellersFromLocation") {
					finalData =
						state == "getAllHostellers"
							? response.object.data
							: response.object.data.hostels;
					allHostellerDataArr.push(...finalData);
					saveHostellersData(finalData, state).then(function () {
						// Set the timestamp in local storage
						localStorage.setItem(state, Date.now());
					});
				}
			} else if (state == "adminGetAllListings") {
				response.responseCode == 200
					? renderAllServices("render", response, "#" + element)
					: toast("Error fetching listings");
			} else if (state == "adminUpdateListingStatus") {
				toast(
					response.responseCode == 200
						? "Listing status updated successfully"
						: "Error updating listing status"
				);
			} else if (state == "getPlacePhotos") {
				if (element != "flightsBooking") {
					mediaListFind = [
						{
							description: "",
							id: "",
							mediaId: "0",
							mediaType: "image",
							imageHeight: 0,
							imageWidth: 0,
							mediaUrl: response[0].imageUrl,
							localUrl: "",
							thumbnailUrl: "",
							title: "",
						},
					];
					uploadFindPost(element, mediaListFind);
				} else {
					jQuery(".flight-booking-details").css({
						position: "relative",
					}).append(`
						<div class="background-overlay"></div>
					`);

					jQuery(".background-overlay").css({
						"background-image": "url(" + response[0].imageUrl + ")",
					});
				}
			} else if (state == "tboSearchFlights") {
				console.log("TBO Search ", data, response);
				if (element.searchFrom != "searchFlightsOnboarding") {
					loaderMain("global", false);
				}
				console.log(response.object);

				if (response.object.Response.Error.ErrorCode == 0) {
					// After Login just hit the search API again
					if (element.searchFrom == "login") {
						return;
					} else if (element.searchFrom == "searchFlightsOnboarding") {
						// Below codes will fire once the search api is completed

						jQuery("#bookingForm").submit();
						if (
							jQuery(".flights__search").attr("data-international") ==
								undefined ||
							jQuery(".flights__search").attr("data-international") == "false"
						) {
							if (isInternationalFlight()) {
								callFlightsFareQuote(
									selectedFlightForBooking,
									"getFinalAmountOw"
								);
								return;
							} else {
								if (jQuery(".flights__search").attr("data-return") == "true") {
									callFlightsFareQuote(
										selectedFlightForBookingRound,
										"getFinalAmountRoundSSR"
									);
								} else {
									callFlightsFareQuote(
										selectedFlightForBooking,
										"getFinalAmountOwSSR"
									);
								}
							}

							callMoengageEventsForFlights(
								"TBD_FLIGHTS_PROCEED_TO_SEAT_SELECTION",
								bookFlightPayload
							);
						} else {
							callFlightApis();
						}
						jQuery(".flights__footer-continue").show();

						// Adding and showing the Convience fees in the Footer Section
						if (
							!jQuery(".flights__footer-price .pax")
								.text()
								.includes("convienience fees")
						) {
							let getConvFees = Number(
								jQuery("#flights__footer").attr("conv-charges")
							);
							let getTotalPrice = Number(
								jQuery(".flights__footer-price").attr("total-price")
							);
							let finalPrice = getConvFees + getTotalPrice;
							jQuery(".flights__footer-price").attr("total-price", finalPrice);
							//jQuery('.flights__footer-price .price').text('₹' + finalPrice);

							// Not showing Convience fees for Super and Pro Users
							if (
								(jQuery("#promoCodeInput").val() == "TBSUPER" ||
									jQuery("#promoCodeInput").val() == "TBPRO") &&
								jQuery("#applyCouponButton").hasClass("applied")
							) {
								let surcharges =
									Number(
										jQuery(".bill-details__taxes-surcharges")
											.text()
											.split("₹")[1]
									) + Number(getConvFees);
								jQuery(".bill-details__taxes-surcharges").text(
									"₹" + surcharges
								);
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
							if (
								!this.isActive ||
								Date.now() - this.startTime > this.expiryTime
							) {
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
				} else {
					jQuery(".flights__search").parent().remove();
					toast(response.object.Response.Error.ErrorMessage);
				}
			}
			// Main logic for handling API responses based on state
			else if (state === "tboFareRule") {
				console.log("tboFareRule ", data, response);
				//handleFareRule(response, element);

				if (element == "fareRuleOw") {
					console.log(response.object);
					fareRuleOw = response.object;

					jQuery(
						".flight-booking-details__section.cancellation, .flight-booking-details__section--arrow"
					).data(
						"cancellation-data",
						fareRuleOw.Response.FareRules[0].FareRuleDetail
					);
					jQuery(".flight-booking-details__section.cancellation").css({
						display: "flex",
						justifyContent: "space-between",
						flexDirection: "unset",
					});
				} else if (element == "fareRuleRt") {
					console.log(response.object);
					fareRuleOb = response.object.ob;
					fareRuleIb = response.object.ib;
				}
			} else if (state === "tboFareQuote") {
				handleFareQuote(response, element);
			} else if (state === "getSSR") {
				handleSSR(response, element);
			} else if (state == "bookFlight") {
				console.log(response.object);
				if (response.object.Response.Error.ErrorCode == "0") {
					if (element == "callIbBook") {
						tboBookFlightOb = response.object;
						ibBookPayload.fareBreakUp = fareBreakUpDetails;
						ibBookPayload.isInBound = true;
						jsInit("bookFlight", ibBookPayload, "obIbBooked");
					} else if (element == "obIbBooked") {
						tboBookFlightIb = response.object;

						// Make an Array to store tboBookFlightOb and tboBookFlightIb
						flightTicketArray = [tboBookFlightOb, tboBookFlightIb];

						renderFlightTicketing(flightTicketArray, element);
					} else if (element == "onlyIbBooked") {
						tboBookFlightIb = response.object;
						flightTicketArray = [tboBookFlightIb];
						renderFlightTicketing(flightTicketArray, element);
					} else if (element == "onlyObBooked") {
						tboBookFlightOb = response.object;
						ibBookPayload.fareBreakUp = fareBreakUpDetails;
						ibBookPayload.isInBound = true;
						jsInit("flightTicketing", ibBookPayload, "callOnlyIbTicket");
					} else {
						tboBookFlightOw = response.object;
						renderFlightTicketing(response.object, element);
					}
				} else {
					var errorMsg =
						response.object.Response.Error.ErrorMessage +
						" " +
						(response.object.Response.Error.RefundMessage
							? response.object.Response.Error.RefundMessage
							: "");
					managePopups("show", "flightsErrorMessage", errorMsg);
					destroyAllSecondaryTabs();
					jQuery(".global__loading").remove();
				}
			} else if (state == "flightTicketing") {
				console.log(response);
				if (response.object.Response.Error.ErrorCode == "0") {
					if (element == "callTicketForIb" || element == "callTicketForLCCIb") {
						tboTicketFlightOb = response.object;

						if (element == "callTicketForLCCIb") {
							// In this case we are calling the ticketing for the inbound flight directly without Booking.

							ibBookPayload.fareBreakUp = fareBreakUpDetails;
							ibBookPayload.isInBound = true;
							jsInit("flightTicketing", ibBookPayload, "obIbTicketed");
						} else {
							// In this case we are calling the ticketing for the inbound flight after Booking.
							pnr = jQuery(
								'.flight__ticketing[data-flight-type="inbound"]'
							).attr("data-pnr");
							bookingId = jQuery(
								'.flight__ticketing[data-flight-type="inbound"]'
							).attr("data-booking-id");
							dob = jQuery(
								'.flight__ticketing[data-flight-type="inbound"]'
							).attr("data-dob");

							ticketPayload = {
								PNR: pnr,
								BookingId: Number(bookingId),
								DateOfBirth: dob,
								isInBound: true,
							};

							ticketPayload.fareBreakUp = fareBreakUpDetails;
							jsInit("flightTicketing", ticketPayload, "obIbTicketed");
						}
					} else if (
						element == "obIbTicketed" ||
						element == "obDirectlyTicketed" ||
						element == "ibDirectlyTicketed"
					) {
						if (element == "obIbTicketed" || element == "obDirectlyTicketed") {
							tboTicketFlightIb = response.object;
						} else {
							tboTicketFlightOb = response.object;
						}

						flightTicketArray = [tboTicketFlightOb, tboTicketFlightIb];
						renderFlightBooked(flightTicketArray, element);
					} else if (element == "callOnlyIbBook") {
						tboTicketFlightOb = response.object;

						ibBookPayload.fareBreakUp = fareBreakUpDetails;
						ibBookPayload.isInBound = true;
						jsInit("bookFlight", ibBookPayload, "onlyIbBooked");
					} else if (element == "callOnlyIbTicket") {
						tboTicketFlightIb = response.object;
						flightTicketArray = [tboBookFlightOb];
						renderFlightTicketing(flightTicketArray, "onlyObBooked");
					} else {
						tboFlightOw = response.object;
						renderFlightBooked(tboFlightOw, element);
					}
				} else {
					var errorMsg =
						response.object.Response.Error.ErrorMessage +
						" " +
						(response.object.Response.Error.RefundMessage
							? response.object.Response.Error.RefundMessage
							: "");
					managePopups("show", "flightsErrorMessage", errorMsg);
					destroyAllSecondaryTabs();
					jQuery(".global__loading").remove();
				}
			} else if (state == "getBookingDetails") {
				console.log("getBookingDetails", response);
				showHidePaxReviewSheet("hide");
				destroyAllSecondaryTabs();
				renderViewFlight(bookFlightFareDetails, "getBookingDetails", response);
				jQuery(".global__loading").remove();
				checkSessionStatus.expire();
				// Reset the values after booking
				resetValuesAfterFlightBooking();
				//Below function is to render the booking details in the view which
				//renderFlightBookingDetails(response.object, element);
			} else if (state == "getAirportInfo") {
				if (element && element != "flightsPassport") {
					console.log(response.list);
					if (response.list.length > 0) {
						airportPicker(response.list, element);
					}
				} else if (!element) {
					allAirports = response.list;
				} else {
					let countriesInfo = (filteredCountries = allAirports.map(
						(country) => ({
							country_code: country.country_code,
							country_name: country.country_name,
						})
					));

					// Iterate over each select element inside passport__issue-country containers
					jQuery(".passport__issue-country select").each(function () {
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
			} else if (state == "getConvenienceCharges") {
				renderFlightBookings(selFlightData, response.convCharges);
			} else if (state == "getUsersFlightBookings") {
				console.log(response);
				renderBookedFlightTicketsHistory(response);
			} else if (state == "getLowestFare") {
				lowestFareDetails = {};
				console.log(response);
				if (response.responseCode == 200) {
					lowestFareDetails = response.lowestFareDetails;
				}
				cheapestFlights.toLocation[data.destination] = {
					lastFetchedDate: new Date(),
					lowestFareDetails: lowestFareDetails,
				};
				renderCheapestFlightCard(
					cheapestFlights.toLocation[data.destination],
					element
				);
			} else if (state == "sendFlightDetails") {
				if (response.responseCode == 200) {
					toast("Flight details sent to your email.");
				} else {
					jQuery(".email__icon").show();
				}
			} else if (state == "getCalendarFares") {
				console.log(response);
				if (response.object.Response.Error.ErrorCode == 0) {
					flightsCalendarFares(response.object.Response);
				} else {
					renderCalendar();
				}
				if (!jQuery(".global__loading").hasClass("flights")) {
					loaderMain("global", false);
				}
			} else if (state == "getCancellationCharges") {
				if (response.object.Response.ResponseStatus == 1) {
					console.log(response, element);
					showHidePaxReviewSheet("hide");
					response.object.Response.cancelPayload = element;
					renderBottomSheet(response, "cancellationCharges");
				} else {
					toast(response.object.Response.Error.ErrorMessage);
				}
				loaderMain("global", false);
			} else if (state == "sendChangeRequest") {
				loaderMain("global", false);
				showHidePaxReviewSheet("hide");
				if (response.object.Response.ResponseStatus == 1) {
					toast("Cancellation Initiated successfully");
				} else {
					toast(response.errorMessage);
				}
			} else if (state == "getCityCodesForHotels") {
				console.log(response);
				allCityCodes = response.object.CityList;
				//hotelCityPicker(response.CityList, element);
			} else if (state == "getHotelCodes") {
				console.log(response);
				if (response.object.Status.Code == 200) {
					jQuery(".search__hotels").data("hotelCodes", response.object.Hotels);
				}
			} else if (state == "searchHotelAvailability") {
				console.log(response);
				renderHotelsSearchResults(response);
			} else if (state == "checkUniqueUser") {
				//return;
				// If the user is unique then we will add the user to the list of unique users
				if (response.responseCode == 200) {
					console.log(response);
					// Setting the Values for the User
					let token = response.jwt;
					tokenMaster("set", token);
					manageUserProfile("clean");
					guestMaster("clean");
					//  Before submitting we have to call & wait for the SearchAPI first then proceed normally

					searchFlights("searchFlightsOnboarding");
					// Show Loader
					showFlightsLoaders("ssr");
				} else if (response.responseCode == 202) {
					// Show Login Popup
					renderBottomSheet("", "loginNew");
				}
			} else if (state == "checkUserLogin") {
				if (response.responseCode == 200) {
					console.log(response);
					// Send OTP to the Number via FB
					//if (response.phoneNumber) {
					firebaseOTP("sendSMS", {
						phoneNumber: element.phoneNumber,
						dialCode: element.dialCode,
					});
					jQuery(".form__group").append(`
						<input type="number" name="otp" placeholder="Enter OTP" class="form__input otp"
						data-dial="${element.dialCode}" required>
					`);
					jQuery(".btn.btn-primary")
						.addClass("otp")
						.removeClass("sign__up")
						.text("Verify OTP");
					toast("OTP Sent to your number");
					// }
					// else {
					// 	// Send OTP on Email

					// }
				} else if (response.responseCode == 202) {
					// User Already Exists with this credentials
					// Go Back to Login page & pre-fill the number and ask the user to login
					toast(
						"User already exists with these credentials. Please login to continue"
					);
					jQuery(".login__link").click();
				} else {
					// Error
					toast(response.errorMessage);
				}
			} else if (state == "insertUser") {
				tokenMaster("set", response.token);
				guestMaster("clean");
				loaderMain("global", false);
				manageUserProfile("clean");
				setTimeout(() => {
					redirect("home");
				}, 500);
			} else if (state == "chatAi") {
				console.log(response);
				renderChatMessages(response, false);
			} else {
				console.log(data);
				console.log(state);
				console.log(response);
			}
		},
		error: function (error) {
			console.log(error);
		},
	});

}

function manageToken(state) {
	//token = tokenMaster('get');
	token = localStorage.getItem("token");

	if (state == "resetPass") {
		token = localStorage.getItem("tempToken");
	} else if (
		state == "login" ||
		state == "loginGoogle" ||
		state == "loginFacebook"
	) {
		token = "";
	}

	return token;
}

function getProfileImage(imgUrl, alt, editDp, profileModal, isInfluencer) {
	verifiedImagePath = "";
	if (isInfluencer) {
		influencerTagImg =
			imageBaseUrl + "/uploads/display_pictures/influencer_tag.png";
		verifiedImagePath =
			'<img class="overlap__influencerTag" src="' +
			influencerTagImg +
			'" onerror="this.onerror=null; this.src = getDummyImageUrl();"  alt="' +
			alt +
			'">';
	}
	return (
		'<img src="' +
		imgUrl +
		'" onerror="this.onerror=null; this.src = getDummyImageUrl();"  alt="' +
		alt +
		'">' +
		editDp +
		profileModal +
		verifiedImagePath +
		""
	);
}

function openSpecificPage(pageName, where) {
	if (!where) {
		where = "_self";
	}
	var deviceType = isAndroid()
		? "android"
		: isIOS()
		? "ios"
		: isPwa()
		? "pwa"
		: "web";

	window.open(`${getDomain()}${pageName}?app=${deviceType}`, where);
}
function openSpecificPageWithoutDevice(pageName, where) {
	if (!where) {
		where = "_self";
	}

	window.open(`${getDomain()}${pageName}`, where);
}

function isIOS() {
	if (localStorage.getItem("isIOS") == "true") {
		// alert('isIOS');
		return true;
	} else {
		return false;
	}
}

//Function to check if device is Android
function isAndroid() {
	if (localStorage.getItem("isAndroid") == "true") {
		return true;
	} else {
		return false;
	}
}

function isPwa() {
	if (localStorage.getItem("isPWA") == "true") {
		return true;
	} else {
		return false;
	}
}

function getDomain() {
	var domain = window.location.href;
	var returnedDomain;
	if (domain.includes("localhost")) {
		returnedDomain = `http://localhost:3000/`;
	} else if (domain.includes("dev.")) {
		returnedDomain = `https://dev.beatravelbuddy.com/`;
	} else {
		returnedDomain = `https://beatravelbuddy.com/`;
	}
	return returnedDomain.trim();
}
