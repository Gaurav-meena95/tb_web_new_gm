jQuery(document).ready(() => {
	console.log(icons);

	console.log("chat.js");

	// Declare global variables
	window.jQuery = window.jQuery || jQuery;
	window.jsInit =
		window.jsInit || (typeof jsInit !== "undefined" ? jsInit : () => {});
	window.chatObj = window.chatObj || {};
	window.imageBaseUrl = window.imageBaseUrl || "";
	window.videoBaseUrl = window.videoBaseUrl || "";
	
	window.day = window.day || "";

	if (localStorage.getItem("isGuestUser")) {
		if (window.location.href.includes("localhost")) {
			window.open("http://localhost:3000/login", "_self");
		} else if (window.location.href.includes("dev.")) {
			window.open("https://dev.beatravelbuddy.com/login", "_self");
		} else {
			window.open("https://beatravelbuddy.com/login", "_self");
		}
	} else {
		
		// Setting the User Info in the users Node in Firebase Realtime Database
		
		showLoader();
		var userProfile = getProfileData();
		
		jsInit('setUserNode', { displayName: userProfile.name, email: userProfile.email, profilePic: userProfile.imageUrl, role: 'user', uid: userProfile.userId, isOnline: true });
		
		
		
		// Chats Drill Down
		jQuery(document).on("click", ".chats__item", function () {
			var clickedButton = jQuery(this).addClass("active");
			var clickedChatId = clickedButton.data("chatId");
			
			var clickedChatData = clickedButton.data("selectedChatData");
			var userId = clickedButton.hasClass("personal")
				? clickedButton.data("userId")
				: "";
			console.log("Clicked user id: ", userId);
			console.log("Clicked chat id: ", clickedChatId);
			var selfUserId = localStorage.getItem("plainUserId");
			var chatType = clickedButton.hasClass("group") ? "group" : "personal";
			var chatName = clickedButton.find(".chats__name").text();

			jsInit(
				"fetchChatMessages",
				{ chatId: clickedChatId, userId: selfUserId, chatType: chatType },
				{
					chatId: clickedChatId,
					chatType: chatType,
					chatImage: jQuery(this).find("img").attr("src"),
					chatName: chatName,
					userId: userId,
					selectedChatData: clickedChatData,
				}
			);

			// Remove the unread count
			clickedButton.find(".message__unread").addClass("hidden").text("0");
			
		});

		// Chat Back from Vercel

		function handleBackAction(isManualBack = true) {
			jQuery("#main").css("display", "block");
			jQuery(".travel-container, .media-upload__container").remove();

			// Left to right animation
			jQuery("#singleChat").addClass("slide-out");

			setTimeout(() => {
				jQuery("#singleChat").removeClass("active slide-out");
				jQuery(".chat").remove();
			}, 500);

			// Only update browser history if this was a manual back action
			if (isManualBack) {
				history.back();
			}
		}

		// Add this to your document ready function
		// Listen for browser back button
		// Handle initial state on page load
		// if (window.history.state && !isIOS()) {
		// 	handlePopState(window.history.state);
		// }
	
		// Listen for popstate events
		window.addEventListener("popstate", (event) => {
			console.log(event);
			handlePopState(event.state);
		});
		function handlePopState(state) {
			if (
				(jQuery("#singleChat").hasClass("active") &&
					jQuery(".contact-info").length == 0 &&
					jQuery(".group-chat").length == 0) ||
				jQuery(".travel-container").length > 0
			) {
				// This is a browser-initiated back action
				handleBackAction(false);
			} else {
				var chatId = state && state.chatId ? state.chatId : "";
	
				if (chatId != "profile") {
					jQuery("#singleChat").css("display", "block");
					jQuery(".contact-info, .group-chat").remove();
				} else {
					jQuery("#mediaTabs").remove();
					jQuery(".contact-info, .group-chat").css("display", "block");
				}
	
				if (jQuery("#main").is(":visible")) {
					console.log("#main is visible");
	
					if (window.location.href.includes("localhost")) {
						window.open("http://localhost:3000/community", "_self");
					} else if (window.location.href.includes("dev.")) {
						window.open("https://dev.beatravelbuddy.com/community", "_self");
					} else {
						window.open("https://beatravelbuddy.com/community", "_self");
					}
				}
			}
		}

		// Update your existing click handler for back button
		jQuery(document).on(
			"click",
			".chat__header-back, .new-chat__close-button",
			() => {
				jQuery('.new-chat').remove();
				handleBackAction(true);
			}
		);
		
		// Adding Back from the Home page of Chats
		jQuery(document).on("click", ".new-chat__close-button-home", function () {
			if (window.location.href.includes("localhost")) {
				window.open("http://localhost:3000/community", "_self");
			} else if (window.location.href.includes("dev.")) {
				window.open("https://dev.beatravelbuddy.com/community", "_self");
			} else {
				window.open("https://beatravelbuddy.com/community", "_self");
			}
		});

		// Open profile from header
		jQuery(document).on(
			"click",
			".chat__header-avatar , .chat__header-info",
			() => {
				navigateToChat("profile");
				var userId = jQuery(".chat__header").data("userId");
				var chatType = jQuery(".chat__header").hasClass("group");
				chatType = chatType ? "group" : "personal";
				console.log("Chat Type:", chatType);

				
				var chatHeaderElem = jQuery(".chat__header");
				var dataChats = chatHeaderElem.data("dataChats");
				var dataMembers = chatHeaderElem.data("dataMembers");
				var renderType = chatHeaderElem.data("type");
				console.log("Render Type: ", renderType);

				switch (chatType) {
					case "group":
						renderGroupChatDrillDown({
							dataChats: dataChats,
							dataMembers: dataMembers,
						});
						break;
					case "personal":
						if (renderType == 'ai') {
							return;
						}
						dmChatDrillDown({ dataChats: dataChats, dataMembers: dataMembers, renderType: renderType });
						break;
					default:
						break;
				}
				/*if (userId) {
				  jsInit('openProfileFromChat', { userId: userId });
			  }*/
			}
		);

		// Redirect to user profile from group chat
		// jQuery(document).on("click", ".group-chat__member.users", function (event) {
			
		// 	return;
		// 	var userId = jQuery(this).attr("data-user-id");
		// 	console.log("Clicked user id: ", userId);
		// 	if (userId) {
		// 		jsInit("openProfileFromChat", { userId: userId });
		// 	}
		// });

		// Event handler for new chat & AI
		jQuery(document).on("click", ".chats__new-chat", function () {
			var isAIChat = jQuery(this).hasClass("ai");
			var chatName = isAIChat ? "Rhea" : "New Chat";

			
			switch (true) {
				case isAIChat:
					openChat(
						"",
						{
							chatName: chatName,
							chatImage: "https://beatravelbuddy.com/view/assets/img/Ai-rhea.webp",
						},
						false,
						"ai"
					);
					break;
				default:
					startNewChat();
					break;
			}
		});

		// Toggle All, Unread & Groups Button
		jQuery(document).on("click", ".chats__nav-item", function () {
			jQuery(".chats__nav-item").removeClass("chats__nav-item--active");
			jQuery(this).addClass("chats__nav-item--active");
			var chatType = jQuery(this).text().toLowerCase();
			console.log("Chat Type: ", chatType);
			switch (chatType) {
				case "all":
					jQuery(".chats__item").show();
					break;
				case "dms":
					jQuery(".chats__item").hide();
					jQuery(".chats__item.personal").show();
					break;
				case "groups":
					jQuery(".chats__item").hide();
					jQuery(".chats__item.group:not(.requested)").show();
					//jQuery(".chats__item.group").show();
					break;
				case 'requested':
					jQuery(".chats__item").hide();
					jQuery(".chats__item.requested").show();
					console.log("Show the Request Groups");
					break;
				default:
					jQuery(".chats__item").show();
					break;
			}
			// Scroll to top smooth
			jQuery(".chats__list").animate({ scrollTop: 0 }, 0);
		});

		// Send Message
		jQuery(document).on("click", ".chat__input-send", function (e) {
			e.preventDefault();
			var formData = jQuery(".chat__input");
			var message = formData[0].value;
			var blockedwords = ['whatsapp', 'whatsapp', 'whats app', 'whats-app', 'whats-app.com', 'whatsapp.com', 'wa.me', 'instagram', 'telegram', 'telegram.me', 't.me', 't.me/', 'insta', 'instagr.am', 'insta.com', 'instagram.com', 'instagram.me', 'insta.me', 'insta.me/', 'instagram.me/', 'text me', 'text me', 'call me', 'call.me', 'call.me/', 'call.me/', 'text.me', 'text.me/', 'text.me/', 'ping', 'ping me', 'ping.me', 'ping.me/', 'ping.me/', 'call', 'call me', 'call.me', 'call.me/', 'call.me/'];
			if (message.trim() === "" || message.length === 0) {
				return;
			}
			if (blockedwords.some(word => message.toLowerCase().includes(word))) {
				showToast("Message restricted as per our policy. Please rephrase your message.");
				return;
			}
			
			var clickedButton = jQuery(this);
			
			var chatType = clickedButton.hasClass("group")
				? "group"
				: clickedButton.hasClass("personal")
					? "personal"
					: "ai";
			var chatId = clickedButton.data("chatId");
			var timeStamp = new Date().getTime();
			
			var chatObj = {
				chatType: chatType,
				chatId: chatId,
				senderId: localStorage.getItem("plainUserId"),
				isSentByCurrentUser: true,
				timeStamp: (Number(timeStamp) / 1000).toFixed(0),
				message: message,
				userId:
					chatType == "personal" ? jQuery(".chat__header").data("userId") : "",
				type: "text",
			};
			console.log(chatObj);
			// UserId is of the Recipient
			var isVerified = getProfileData().isVerified;
			if (chatType === "ai") {
				if (isVerified == true) {
					if (!checkAiEnable()) {
						showToast('You have reached the maximum limit of AI Itineraries. Please wait for 24 hours to generate a new itinerary.');
						return;
					}
					// Update the timestamp when generation starts
					localStorage.setItem('lastTimeAiMade', new Date().toISOString());
					// Remove prefilled messages when sending a message
					jQuery(".ai-prefilled-messages").fadeOut(300, function() {
						jQuery(this).remove();
					});
					renderChatMessages(chatObj, true);
					var thinkingHtml = `<div class="chat__message  chat__message--received thinking-indicator">
					<span>Rhea is thinking</span>
					<div class="thinking-dots">
						<div class="dot"></div>
						<div class="dot"></div>
						<div class="dot"></div>
						</div>
						
					</div>`;
					jQuery(".chat__messages").append(thinkingHtml);
					jsInit("chatAi", message);
					fbEvent('ChatAI', 'Rhea');
					if (!googleAnalytics) {
						return;
					}
					else if (typeof googleAnalytics == 'undefined') {
						return;
					}
					else {
						googleAnalytics.logEvent('ChatAI');
					}
				}
				else {
					showToast('Go Premium to Chat with Rhea.');
				}
				
			} else {
				jsInit("postChatMessage", chatObj);
				renderChatMessages(chatObj, true);
			}

			formData[0].value = "";
		});

		// Toggle active Class Emoji
		jQuery(document).on("click", ".emoji", () => {
			jQuery("#emojiPicker-chat, .chat__input-area").toggleClass("active");
			jQuery("#filePicker-chat").removeClass("active");
		});

		// Handle prefilled AI message clicks
		jQuery(document).on("click", ".ai-prefilled-card", function(e) {
			e.preventDefault();
			var isVerified = getProfileData().isVerified;
			if (isVerified == true) {
				const message = jQuery(this).data("message");
				handlePrefilledMessageClick(message);
			}
			else {
				showToast('Go Premium to Generate AI Itinerary.');
			}
		});


		// Handle AI response image clicks
		jQuery(document).on("click", ".chat__message-ai-image", function(e) {
			e.preventDefault();
			const imageSrc = jQuery(this).attr("src");
			openImageModal(imageSrc);
		});

		// Handle slider image clicks
		jQuery(document).on("click", ".slider-image", function(e) {
			e.preventDefault();
			const imageSrc = jQuery(this).attr("src");
			openImageModal(imageSrc);
		});

		// Handle slider dot clicks
		jQuery(document).on("click", ".slider-dot", function(e) {
			e.preventDefault();
			const sliderId = jQuery(this).closest('.ai-image-slider').attr('id');
			const slideIndex = parseInt(jQuery(this).data('slide'));
			slideToImage(sliderId, slideIndex);
		});

		// Clicking anywhere outside the emoji picker will close it
		jQuery(document).on("click", (e) => {
			if (
				!jQuery(e.target).closest(".emoji").length &&
				!jQuery(e.target).hasClass("select__emoji-chat") &&
				!jQuery(e.target).hasClass("gif_choose") &&
				!jQuery(e.target).hasClass("emoji_choose") &&
				!jQuery(e.target).hasClass("sticker_choose") &&
				!jQuery(e.target).closest("#gif-search-input").length
				
			) {
				jQuery("#emojiPicker-chat, .chat__input-area").removeClass("active");
				if (!jQuery(e.target).closest('.chat__input-action.plusIcon').length)
				{
					jQuery("#filePicker-chat").removeClass("active");
					
				}
			}
		});

		// Adding emoji to the input field
		jQuery(document).on("click", ".select__emoji-chat", function () {
			var emoji = jQuery(this).text();
			jQuery(".chat__input").val(jQuery(".chat__input").val() + emoji);
		});

		// Clicks on Emoji Tabs
		jQuery(document).on("click", ".emoji_choose", function () {
			console.log("Emoji clicked");
			jQuery(".emoji__type-chooser .active").removeClass("active");
			jQuery(this).addClass("active");
			jQuery("#gif__container").hide();
			jQuery("#emoji__container").show();
		});

		// Clicks on Gif Tabs
		jQuery(document).on("click", ".gif_choose", function () {
			console.log("Gif clicked");
			jQuery(".emoji__type-chooser .active").removeClass("active");
			jQuery(this).addClass("active");
			jQuery("#emoji__container").hide();
			jQuery("#gif__container").show();

			// Initialize GIF container if it's empty
			if (jQuery("#gif__container").children().length === 0) {
				initializeGifContainer();
			}
		});

		// Search GIFs when typing in the search box
		jQuery(document).on("input", "#gif-search-input", function () {
			var query = jQuery(this).val().trim();
			if (query) {
				searchGifs(query);
			} else {
				loadTrendingGifs();
			}
		});

		// Handle GIF selection
		jQuery(document).on("click", ".tenor-gif", function () {
			var gifUrl = jQuery(this).data("original-url");
			var previewUrl = jQuery(this).attr("src");

			console.log("Selected GIF URL: ", gifUrl);
			console.log("Selected GIF Preview URL: ", previewUrl);
			// Send GIF message
			sendGifMessage(gifUrl, previewUrl);

			// Close emoji picker
			jQuery("#emojiPicker-chat, .chat__input-area").removeClass("active");
		});
		
		// Handling the Attachment Icon & Camera Icon
		jQuery(document).on("click", ".cameraIcon, .plusIcon", function () {
			
			jQuery('#filePicker-chat').toggleClass('active')
			
			// Open camera
			if (jQuery('.media-upload__container').length > 0) {
				jQuery('.media-upload__container').remove();
			}
			console.log("Camera icon clicked");
			//renderMediaUploadPage('chatMedia');
			// Implement camera functionality here
			
		});
		
		jQuery(document).on("click", ".select__camera-chat, .select__photo-chat, .select__video-chat", function () {
			var clickedButton = jQuery(this);
			var fileType = 'image/*'
			if (clickedButton.hasClass('select__video-chat')) {
				fileType = 'video/*'
				
			}
			renderMediaUploadPage('chatMedia', fileType);
		});
		
		jQuery(document).on("click", ".plusIcon", function () {
			console.log("Attachment icon clicked");
			// Open attachment options
		});

		// Handle Accept / Decline for Group Members via Admin
		jQuery(document).on(
			"click",
			".action-button.accept-button, .action-button.decline-button",
			function () {
				actionType = jQuery(this).hasClass("accept-button")
					? "accepted"
					: "declined";
				groupId = jQuery(".singleChat__container").attr("data-chat-id");
				userId = jQuery(this).closest("[data-user-id]").attr("data-user-id");
				userName = manageUserProfile("read", "name");

				console.log(
					`${actionType.charAt(0).toUpperCase() + actionType.slice(1)
					} Button Clicked`,
					groupId,
					userId
				);
				jsInit("updateIsRequested", {
					groupId: groupId,
					userId: userId,
					optionType: actionType,
					userName: userName,
				});
				// Remove the Div from the UI
				jQuery(this).closest(".member-container").remove();

				// Display toast based on the action type
				toastMessage =
					actionType == "accepted" ? "Request Accepted" : "Request Declined";
				toast(toastMessage);
				drawerBox = document.getElementsByClassName("accept_decline_drawer")[0]; // Get the first element
				if (drawerBox) {
					hasMemberContainer =
						drawerBox.getElementsByClassName("member-container").length > 0;
					console.log(hasMemberContainer);
					if (!hasMemberContainer) {
						drawer("close");
					}
				}
			}
		);

		// Back Button for Group Chat Drill Down & DM Chat Drill Down
		jQuery(document).on("click", ".contact-info__back-button", function () {
			//if (type == 'profile') {
			jQuery("#singleChat").css("display", "block");
			jQuery(".contact-info, .group-chat").remove();
			//	return;
			//}
		});
		
		// Open respective Chat pages from New Chat Page
		jQuery(document).on("click", ".new-chat__option", function () {
			var clickedButton = jQuery(this);
			var clickedChatPage = clickedButton.attr("data-chat-page");
			switch (clickedChatPage) {
				case 'newGroup':
					// Open New Group Chat
					jQuery('.checkbox').removeClass('hidden');
					jQuery('.new-chat__options, .travel-section-title.buddies, .travel-section.container').hide();
					jQuery('.new-chat__title').text('Create New Group');
					break;
				case 'newDM':
					// Open New DM Chat
					break;
				case 'newAI':
					// Open New AI Chat
					openChat(
						"",
						{
							chatName: chatName,
							chatImage: "https://beatravelbuddy.com/view/assets/img/Ai-rhea.webp",
						},
						false,
						"ai"
					);
					break;
			}
		});
		
		// Get the selected Users List
		jQuery(document).on("click", "#next-users-selected", function () {
			var groupMembers = [];
			var groupMembersInfo = {};
			jQuery(".user-checkbox:checked").each(function () {
				var clickedButton = jQuery(this);
				var userId = clickedButton.data("user-id");
				var userName = clickedButton.data("user-name");
				var userImage = clickedButton.data("user-image");
				
				groupMembers.push(userId);
				groupMembersInfo[userId] = {
					userName: userName,
					userImage: userImage,
				};
			
			});
			console.log("Selected Users: ", groupMembers);
			console.log("Selected Users Info: ", groupMembersInfo);
			
			//Hide the List and other items
			jQuery('.conversation-list, .travel-section, .new-chat__search-input').hide();
			
			//Add the Button for the next Page, i.e groupName, Image page
			jQuery('.new-chat').append(`
				<button class="group__next-button" id="next-group-creation">${icons.rightArrow}</button>
				`);
			
			jQuery('#next-group-creation').data('groupMembers', groupMembers).data('groupMembersInfo', groupMembersInfo);
			
			// Remove the Next Users Selected Button
			jQuery(this).remove();
			
			// Create the Group Name and Image Page
			jQuery(".new-chat").append(`
				<div class="group-info">
					<img class="group-photo" src="" alt="Group Photo" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
					</img>
					<input type="file" id="group-photo-input" class="hidden" accept="image/*">
					<div class="group-name-container">
						<input type="text" class="group-name-input" placeholder="Group name (optional)">
						<button class="emoji-button hidden">
							<i class="far fa-smile"></i>
						</button>
					</div>
				</div>`);
			
			
			// Prepare the HTML for the Group Members List
			var membersListHtml = '';
			
			groupMembers.forEach(function (userId) {
				var userInfo = groupMembersInfo[userId];
				membersListHtml += `
					<div class="members-container" data-user-id="${userId}">
						<div class="member-photo">
							<img src="${returnImagePath(userInfo.userImage)}" alt="${userInfo.userName}" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
						</div>
						<div class="member-name">
							<span>${userInfo.userName}</span>
						</div>
					</div>`;
			});
			
			// Add the Members List Div
			jQuery('.new-chat').append(`
				<div class="members-section">
					<h2 class="members-count">Members: ${groupMembers.length}</h2>
					${membersListHtml}
				</div>`);
			
			// Proceed to create a new group with the selected users
		});
		
		// Clicking on User Card in New Chat
		jQuery(document).on("click", ".conversation", function () {
			var clickedButton = jQuery(this);
			var checkbox = clickedButton.find('.user-checkbox');
		
			// Check if the checkbox is hidden
			if (checkbox.closest('.checkbox').hasClass('hidden')) {
				// Start DM with User
				var userId = checkbox.data('user-id');
				var userName = checkbox.data('user-name');
				var userImage = checkbox.data('user-image');
		
				console.log(`Starting DM with User: ${userName} (ID: ${userId}) (Image: ${userImage})`);
				
				//Initiate the chat
				var userProfile = getProfileData();
				
				jsInit('initiateChat', { chatType: 'personal', other: { userId: userId, userName: userName, profileImage: userImage }, self: { userName: userProfile.name, profileImage: userProfile.imageUrl } }, { type: "new-dm" });
				
			} else {
				// Toggle the checkbox state
				checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
			}
		});
		
		
		//Onboarding Location input search
		timeout = null;
		// Searching the Users from Follwers & Followings List
		jQuery(document).on("input", ".new-chat__search-input", function () {
			var searchTerm = jQuery(this).find('.new-chat__search-field').val().toLowerCase();
			jQuery('.new-chat__search-cross').removeClass('hidden');
			jQuery(".conversation").each(function () {
				var userName = jQuery(this).find(".name").text().toLowerCase();
				if (userName.includes(searchTerm)) {
					jQuery(this).show();
				} else {
					jQuery(this).hide();
				}
				clearTimeout(timeout);

				timeout = setTimeout(() => {
					value = searchTerm;
					// Here limit is the pageNumber , i.e limit = pageNumber
					jsInit('searchBuddy', { searchPattern: value, limit: 0 });
				}, 500); // 500ms delay before the search function is called
			});
		});
		
		
		// Clicking Cross will reset the search results
		jQuery(document).on("click", ".new-chat__search-cross", function () {
			jQuery(".new-chat__search-field").val("");
			jQuery(".conversation").show();
			jQuery(".global-search-result").remove();
			jQuery(this).addClass('hidden');
		});
		
		// Start the Group Creation Process
		jQuery(document).on("click", "#next-group-creation", function () {
			var groupMembers = jQuery(this).data('groupMembers');
			var groupMembersInfo = jQuery(this).data('groupMembersInfo');
			var groupName = jQuery('.group-name-input').val();
			var groupImageMeta = jQuery('.group-photo').data('groupImageData') || '';
			var groupProfileUrl;
			if (groupImageMeta !== '') {
				groupProfileUrl = groupImageMeta.images.Key || '';
			}
			
			var createdBy = getProfileData().name;
			
			if (groupName.length > 0) {
				groupName = groupName;
			}
			else {
				groupName = "Group";
			}
			
			// Start the Group Creation Process
			startGroupChat(createdBy, groupName, groupProfileUrl, groupMembers, groupMembersInfo);
			
		});
		
		// Uploading group image
		jQuery(document).on("click", ".group-photo", function () {
			// open a url in a new tab
			if (false) {
			
				if (window.location.href.includes("localhost")) {
					window.open("http://localhost:3000/image-upload/groupDp", "_blank");
				} else if (window.location.href.includes("dev.")) {
					window.open("https://dev.beatravelbuddy.com/image-upload/groupDp", "_blank");
				} else {
					window.open("https://beatravelbuddy.com/image-upload/groupDp", "_blank");
				}
			}
			else {
				// Render the image upload functionality for Apps
				renderMediaUploadPage('groupDp');
			}
		});
		
		// Click on Customised Pacakge Button inside Group Chats
		jQuery(document).on("click", ".trip-card, .travel-package-card", function () {
			// Get host phone number with country code
			var phoneNumber = '8448154356';
			
			var countryCode = "+91"; // Default to India if not specified
			
			var tripName = jQuery(this).hasClass('travel-package-card') ? jQuery(this).find('.travel-package-title').text().trim() : jQuery(this).find('.trip-details .trip-name').text().trim();
	
			// Prepare message text
			var message = encodeURIComponent(
				`Hello! I'm interested in the "${tripName}". Could you please provide more information?`
			);
	
			// For now, use the direct WhatsApp link
			// var whatsappUrl = `https://wa.me/${countryCode.replace(
			// 	"+",
			// 	""
			// )}${phoneNumber}?text=${message}`;
			//window.open(whatsappUrl, "_blank");
			
			sendWhatsAppEnquiry(tripName, message);
			
			function sendWhatsAppEnquiry(tripName, message) {
			
				// Get host phone number with country code
				var phoneNumber = '8448154356';
				var countryCode = "+91"; // Default to India if not specified
			
				// Prepare message text
				
				// Encoded message for WhatsApp URL
				var encodedMessage = message;
			
				// User information
				var userId,userName , userEmail, userPhone;
				var getProfile = getProfileData();
				userId = getProfile.userId;
				userName = getProfile.name;
				userEmail = getProfile.email;
				userPhone = getProfile.phoneNumber;
				
				
				// Create tags based on the trip - make sure these are strings without spaces
				// Important: Interakt requires tags to be an array of strings
				var tags = ['enquired_trip_via_tech', tripName];
				
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
						last_interested_trip: tripName,
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
			
		});
		
		// Disabling Context Menu
		jQuery(document).on("contextmenu", ".chat__message, .chats__item", function (e) {
			e.preventDefault(); // Disable the context menu
			console.log("Context menu disabled for chat message.");
		});
		// Adding Reactions to the messages  on long press
		let touchTimer;
		
		jQuery(document).on("touchstart", ".chat__message, .chats__item", function (e) {
			var clickedButton = jQuery(this);
			var dataMessage = clickedButton.data('messageData');
			console.log("Clicked message data: ", dataMessage);
			touchTimer = setTimeout(() => {
				
				clickedButton.find('.chat__reaction-box, .chat__reaction-box-backdrop').addClass('active');
				clickedButton.addClass('selected');
				jQuery('.chat__header-avatar, .chat__header-info').css('display', 'none');
				jQuery('.chat__header-actions').removeClass('hidden');
				console.log("Clicked message data Inside Timer: ", dataMessage);
		
				// Open a custom context menu or perform an action
			}, 500); // Set the delay to 500ms
		});
		
		jQuery(document).on("touchend touchcancel", ".chat__message, .chats__item", function (e) {
			clearTimeout(touchTimer); // Cancel the timer if the touch ends before 500ms
		});
		
		jQuery(document).on("click", ".chat__message, .chat__message-video", function (e) {
			e.stopPropagation(); // Prevent the click event from bubbling up
			e.preventDefault(); // Prevent the default action
			clearTimeout(touchTimer); // Prevent the long press logic if the click event is fired
			var clickedButton = jQuery(this);
			var dataMessage = clickedButton.data("messageData");
		
			// Click logic
			console.log("Click logic executed: ", dataMessage);
			// Call your desired function here
			
			if (dataMessage.type == 'media') {
				if (dataMessage.media[0].mediaType == 'video') {
					showMediaPopup(returnVideoPath(dataMessage.media[0].mediaUrl), dataMessage.media[0].mediaType);
				}
				else {
					showMediaPopup(returnImagePath(dataMessage.media[0].mediaUrl), dataMessage.media[0].mediaType);
				}
			}
			
		});
		
		//Link Clicks - only for links inside chat__message-text, not chats__message
		jQuery(document).on("click", ".chat__message-text .links__chat", function (e) {
			// Ensure the clicked element is not inside chats__message
			if (jQuery(this).closest('.chats__message').length === 0) {
				var getLink = jQuery(this).text();
				console.log("Clicked link: ", getLink);
				window.open(getLink, "_blank");
			}
		});
		
		
		// Removing the reaction box on click
		jQuery(document).on("click", ".chat__reaction-box-backdrop", function (e) {
			e.stopPropagation(); // Prevent event bubbling
			var clickedButton = jQuery(this);
			clickedButton.removeClass('active');
			clickedButton.siblings('.chat__reaction-box').removeClass('active');
			clickedButton.parent().removeClass('selected');
			
			
			jQuery('.chat__header-avatar, .chat__header-info').css('display', 'block');
			jQuery('.chat__header-actions').addClass('hidden');
			
		});
		
		// Adding reaction to the message
		jQuery(document).on("click", ".chat__reaction-item", function (e) {
			e.preventDefault();
			var clickedButton = jQuery(this);
			var parentChatContainer = clickedButton.parent().parent();			;
			var messageData = parentChatContainer.data('messageData');
			console.log("Clicked message data Reaction: ", messageData);
			var reactionPayload = { optionType: 'reaction', timeStamp: messageData.timeStamp, chatId: messageData.chatId, reaction: clickedButton.text() };
			console.log("Clicked reaction data: ", reactionPayload);
			
			parentChatContainer.find('.chat__reaction-box, .chat__reaction-box-backdrop').removeClass('active');
			parentChatContainer.find('.chat__reaction-bubble').addClass('active').text(clickedButton.text());
			
			jsInit('updateChatFlags', reactionPayload);
		});
		
		// Opening chat with Trending Buddies cards
		jQuery(document).on('click', '.travel-influencer-card', function (e) {
			// Get the Normal User Id of the Influencer
			var userProfile = getProfileData();
			var timestamp = Math.floor(Date.now() / 1000);
			if (userProfile && userProfile.isVerified != true) {
				var profileCount = localStorage.getItem('profileViews');
				var profileSeenTime = Number(localStorage.getItem('lastProfileSeenTime')); // Convert to number
			
				if (profileCount) {
					var profileCountNumber = Number(profileCount);
					if (profileCountNumber < 3) {
						profileCountNumber++;
						localStorage.setItem('profileViews', profileCountNumber);
					}
					else {
						var currentTimestamp = Math.floor(Date.now() / 1000);
					
						// Check if profileSeenTime is valid
						if (!profileSeenTime) {
							profileSeenTime = currentTimestamp;
							localStorage.setItem('lastProfileSeenTime', profileSeenTime);
						}
					
						var timeDiff = (currentTimestamp - profileSeenTime) / (60 * 60);
						if (timeDiff <= 24) {
							showToast('Subscribe Now to Unlock more Profiles');
							return;
						}
						else {
							localStorage.setItem('lastProfileSeenTime', timestamp);
							localStorage.setItem('profileViews', 1);
						}
					}
				}
				else {
					localStorage.setItem('lastProfileSeenTime', timestamp);
					localStorage.setItem('profileViews', 1);
					//redirect('profile', jQuery(this).parents('.feed_item').attr('data-user'));
				}
			}
			
			var clickedButton = jQuery(this);
			
			// Start DM with User
			var userId = clickedButton.attr('data-user-id');
			var userName = clickedButton.attr('data-name');
			var userImage = clickedButton.attr('data-image-url');
	
			console.log(`Starting DM with User: ${userName} (ID: ${userId}) (Image: ${userImage})`);
			
			//Initiate the chat
			var userProfile = getProfileData();
			
			jsInit('initiateChat', { chatType: 'personal', other: { userId: userId, userName: userName, profileImage: userImage }, self: { userName: userProfile.name, profileImage: userProfile.imageUrl } }, { type: "new-dm" });
			
		});
		
		// Adding several click actions like Media Tabs, Clear chat, Report chat, Delete chat etc -->

		jQuery(document).on("click", ".contact-info__list-item, .group-chat__menu-item, .group-chat__member, .group-chat__footer-item", function (event) {
			var clickedButton = jQuery(this);
			var actionType = clickedButton.attr("data-action");
			console.log("Clicked on action: ", actionType);
			
			switch (actionType) {
				case "media":
					// Open Media Tab
					if (Number(clickedButton.find('.contact-info__list-item-count').text()) > 0 || Number(clickedButton.find('.group-chat__menu-count').text()) > 0) {
						appendTabbedInterface();
					}
					break;
				case "clear":
					// Clear Chat
					appendClearChatDialog();
					break;
				case "reportGroup":
				case "report":	
					// Report Chat
					appendReportUserDialog();
					break;
				case "deleteChat":
					// Delete Chat
					break;
				case "muteChat":
					// Mute Chat
					break;
				case "unmuteChat":
					// Unmute Chat
					break;
				case "block":
					// Block User
					appendBlockUserDialog();
					break;
				case "unblockUser":
					// Unblock User
					break;
				case 'starred':
					showStarredMessages();
					break;
				case 'leave':
					appendLeaveChatDialog();
					break;
				case 'addMembers':
					// Call API To fetch list of Buddies
					// Get Followers
					var userProfile = getProfileData();
					var userId = userProfile.userId;
					jsInit('fetchFollowers', { userId: userId, pageNumber: '0', type: 0 }, { userId: userId, type: 'combined', action: 'addMembers' });;
					//appendAddUsersToGroupDialog('',)
					break;
				case 'openDialogUsers':
					var userData = {
						userId: clickedButton.attr("data-user-id"),
						name: clickedButton.attr("data-name"),
						imageUrl: clickedButton.attr("data-profile-pic"),
					};
			  
			  		// Show the user actions popup
					showUserActionsPopup(userData, event);
					break;
				default:
					console.log("No action defined for this type.");
			}
		});
		
		// Copy, Star, Delete, Forward Buttons
		jQuery(document).on("click", ".copy__but, .delete__but, .forward__but, .star__but", function () {
			var clickedButton = jQuery(this);
			var actionType = clickedButton.attr("data-action");
			var chatMsgSelected = jQuery('.chat__message.selected');
			var dataMessage = chatMsgSelected.data('messageData');
			console.log("Clicked on action: ", actionType);
			console.log("Clicked message data: ", dataMessage);
			var obj = { optionType: 'starred', timeStamp: dataMessage.timeStamp, chatId: dataMessage.chatId };
			
			switch (actionType) {
				case "copy":
					// Copy Message
					var messageText = dataMessage.message;
					console.log("Message Text: ", messageText);
					// Copy to clipboard
					navigator.clipboard.writeText(messageText).then(() => {
						console.log("Message copied to clipboard: ", messageText);
						showToast('Message copied to clipboard');
					}).catch(err => {
						console.error("Failed to copy: ", err);
					});
					
					break;
				case "star":
					// Star Message
					console.log("Clicked Star data: ", obj);
					
					jsInit('updateChatFlags', obj);
					break;
				case "delete":
					// Delete Message
					console.log("Clicked delete data: ", obj);
					obj.optionType = 'deleted';
					jsInit('updateChatFlags', obj);
					chatMsgSelected.html(
						'<span class="text-msg-deleted">This message was deleted</span>'
					)
					break;
				case "forward":
					// Forward Message
					break;
				default:
					console.log("No action defined for this type.");
			}
			jQuery('.chat__reaction-box-backdrop').click();
		});
		
		// Adding Click to take users to premium page from the premium__chat-holder
		jQuery(document).on('click', '.premium__chat-holder', function () {
			if (isAndroid()) {
				window.open('https://link.beatravelbuddy.com/ogmG', "_self");
			}
			window.open('https://beatravelbuddy.com/premium', "_self");
		})
		
		// Enlarging the Profile Photo
		jQuery(document).on('click', '.header__container img', function () {
			var clickedImageSrc = jQuery(this).attr('src');
			showMediaPopup(clickedImageSrc, 'image');
		
		});
		jQuery(document).on('click', '.name__redirect-container', function () {
			var userId = jQuery(".chat__header").data("userId");
			if (userId) {
				jsInit('openProfileFromChat', { userId: userId });
			}
		});
		
		// Edit Group name
		jQuery(document).on('click', '.group-chat__edit-btn', function () {
			var currentGroupName = jQuery('.group-chat__title').text().trim();
			editGroupInfo(currentGroupName);
		});
		
	}
});

function createChatsInterface(chatData) {
	//navigateToChat('homePageChat')
	var chatsHTML = `
		  <div class="chats__container">
			  <div class="chats__header">
			  <div class="chats__header-content">
				  <h1 class="chats__title">Chats</h1>
				  <button class="new-chat__close-button-home">
					  ${icons.crossIcon}
				  </button>
			  </div>
				  
  
				  <div class="chats__nav">
					  <button class="chats__nav-item all chats__nav-item--active">All</button>
					  <button class="chats__nav-item unread">DMs</button>
					  <button class="chats__nav-item groups">Groups</button>
					  <button class="chats__nav-item reqGroups">Requested</button>
				  </div>
  
				  <div class="chats__archived">
					  <div class="chats__archived-icon">
						  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							  <rect width="20" height="5" x="2" y="4" rx="2"/>
							  <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/>
							  <path d="M10 13h4"/>
						  </svg>
					  </div>
					  <span class="chats__archived-text">Archived</span>
				  </div>
			  </div>
  
			  <div class="chats__list">
			  </div>
  
			  <button class="chats__new-chat">
				  ${icons.newChatIcon}
			  </button>
			  
		  </div>
	  `;
	//<button class="chats__new-chat ai">
	//</button>

	var mainContainer = document.getElementById("main");
	if (mainContainer) {
		mainContainer.innerHTML = chatsHTML;

		if (!chatData) {
			return;
		}
		chatData.chatArr.forEach((chat, index) => {
			if (chat.isRejected === true) {
				// Dont show the chat
				return;
			}
			
			if (index == 2) {
				var userProfile = getProfileData();
				if (userProfile && userProfile.isVerified != true) {
				jQuery("#main .chats__list").append(`
					<div class="promotional-banner" onclick="window.open('https://beatravelbuddy.com/premium', '_self')">
						<div class="promo-image">
							<img src="https://prodmedia.beatravelbuddy.com/uploads/app-banners/elite-one.webp" alt="Promotional Banner" style="height: fit-content;width: 100%;max-height: 220px;    border-radius: 1.5rem;    box-shadow: 4px 4px 6px 0px rgba(0, 0, 0, 0.15);">
						</div>
					</div>
				`);
				}
				
			}
			var chatName =
				chat.chatType === "group" ? chat.groupName : (chat.userInfo && chat.userInfo.displayName) ? chat.userInfo.displayName : (chat.userInfo && chat.userInfo.DisplayName) ? chat.userInfo.DisplayName : '';
			
			var displayPicture =
				chat.chatType === "group"
					? chat.groupProfileURL
					: (chat.userInfo && chat.userInfo.profilePic) ? chat.userInfo.profilePic : '';

			if (displayPicture && !displayPicture.startsWith("https")) {
				if (!displayPicture.startsWith('/')) {
					displayPicture = imageBaseUrl + '/' + displayPicture;
				}
				else {
					displayPicture = imageBaseUrl + displayPicture;
				}

			} else if (!displayPicture) {
				displayPicture = imageBaseUrl + "/uploads/display_pictures/dummy.png";
			}
			var messageTime = chat.last_message_time;
			messageTime = formatDateForChat(messageTime);

			var lastMessage = chat.last_message;
			if (lastMessage == '') {
				lastMessage = '📷 Media'
			}
			jQuery("#main .chats__list").append(createChatCard(chat.chatType, displayPicture, chatName, messageTime, lastMessage, chat.isRequested));
			addChatData(chat);
			
			// jQuery(".chats__item:last-child")
			// 	.data("chatId", chat.chatId)
			// 	.data("selectedChatData", chat);
			// if (chat.chatType === "personal") {
			// 	jQuery(".chats__item:last-child").data(
			// 		"userId",
			// 		chat.userInfo.from_uid
			// 	);
			// }
		});

		//Set up Listeners for All Chat ID's so that the modification can be updated
		var userProfile = getProfileData();
		jsInit(
			"havala",
			{ userId: userProfile.userId },
			{ type: "chat", chats: chatData.chatArr }
		);
	} else {
		console.error("Main container not found");
	}
}

function formatDateForChat(date, type) {
	//Convert timestamp to date in the format of 12:00 AM if the day is today or else the format should be 12/05/23
	date = new Date(Number(date) * 1000);

	//Check if the date is today
	if (date.toDateString() == new Date().toDateString()) {
		date = date.toLocaleString("en-US", {
			hour: "numeric",
			minute: "numeric",
			hour12: true,
		});
	}
	//Check if the date is yesterday
	else if (
		date.toDateString() ==
		new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
	) {
		date = "Yesterday";
	}
	//Check if the date is within the last 7 days
	else if (date > new Date(new Date().setDate(new Date().getDate() - 7))) {
		date = date.toLocaleString("en-US", { weekday: "short" });
	} else {
		// adding a leading zero to the day and month and then slicing the last two digits
		window.day = ("0" + date.getDate()).slice(-2);
		var month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-based in JavaScript
		var yearLastTwoDigits = ("" + date.getFullYear()).slice(-2);

		date = `${day}/${month}/${yearLastTwoDigits}`;
	}
	return date;
}

function openChat(dataChats, dataMembers, isGroup, type) {
	var chatId = isGroup ? dataChats.element.chatId : dataMembers.chatId;
	navigateToChat(chatId);
	console.log("Open chat- DataChats", dataChats);
	console.log("Open chat- DataMembers", dataMembers);
	console.log("Open chat- isGroup", isGroup);
	console.log("Open chat- type", type);

	/* For Group Chats --> DataChats has two nodes --> response & element --> response has the messages and element has the group details --> DataMembers has the group members along with their details 
	For Personal Chats --> DataChats has only one node --> response which has the messages --> DataMembers has the data of the other person */

	// Keeping a copy of original Data

	var orgDataChat = dataChats;
	var orgDataMembers = dataMembers;
	
	var isMsgReqAccepted = false;

	var container = document.getElementById("singleChat");
	var dp,
		name,
		userId,
		chatType,
		chatId,
		chatHeader,
		imageLinks,
		packageSection;

	if (isGroup) {
		dp = dataChats.element.chatImage;
		name = dataChats.element.chatName;
		dataChats = dataChats.response.messages;
		chatType = "group";
		imageLinks = [];
		packageSection = `<!-- Trips Section -->
				  <div class="trip-section">
					  <div class="trip-header">
						  <h1 class="trip-title">Trips for Thailand</h1>
						  <button class="customize-btn hidden">
						  Customize Trip
						  <span class="settings-icon"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.2917 12.3229C10.0697 12.3229 9.8855 12.1388 9.8855 11.9167V5.95834C9.8855 5.73625 10.0697 5.55209 10.2917 5.55209C10.5138 5.55209 10.698 5.73625 10.698 5.95834V11.9167C10.698 12.1388 10.5138 12.3229 10.2917 12.3229Z" fill="#292D32"/><path d="M10.2917 4.19792C10.0697 4.19792 9.8855 4.01375 9.8855 3.79167V1.08334C9.8855 0.861253 10.0697 0.677086 10.2917 0.677086C10.5138 0.677086 10.698 0.861253 10.698 1.08334V3.79167C10.698 4.01375 10.5138 4.19792 10.2917 4.19792Z" fill="#292D32"/><path d="M6.5 12.3229C6.27792 12.3229 6.09375 12.1388 6.09375 11.9167V9.20834C6.09375 8.98625 6.27792 8.80209 6.5 8.80209C6.72208 8.80209 6.90625 8.98625 6.90625 9.20834V11.9167C6.90625 12.1388 6.72208 12.3229 6.5 12.3229Z" fill="#292D32"/><path d="M6.5 7.44792C6.27792 7.44792 6.09375 7.26375 6.09375 7.04167V1.08334C6.09375 0.861253 6.27792 0.677086 6.5 0.677086C6.72208 0.677086 6.90625 0.861253 6.90625 1.08334V7.04167C6.90625 7.26375 6.72208 7.44792 6.5 7.44792Z" fill="#292D32"/><path d="M2.70825 12.3229C2.48617 12.3229 2.302 12.1388 2.302 11.9167V5.95834C2.302 5.73625 2.48617 5.55209 2.70825 5.55209C2.93034 5.55209 3.1145 5.73625 3.1145 5.95834V11.9167C3.1145 12.1388 2.93034 12.3229 2.70825 12.3229Z" fill="#292D32"/><path d="M2.70825 4.19792C2.48617 4.19792 2.302 4.01375 2.302 3.79167V1.08334C2.302 0.861253 2.48617 0.677086 2.70825 0.677086C2.93034 0.677086 3.1145 0.861253 3.1145 1.08334V3.79167C3.1145 4.01375 2.93034 4.19792 2.70825 4.19792Z" fill="#292D32"/><path d="M3.79167 6.36459H1.625C1.40292 6.36459 1.21875 6.18042 1.21875 5.95834C1.21875 5.73625 1.40292 5.55209 1.625 5.55209H3.79167C4.01375 5.55209 4.19792 5.73625 4.19792 5.95834C4.19792 6.18042 4.01375 6.36459 3.79167 6.36459Z" fill="#292D32"/><path d="M11.3749 6.36459H9.20825C8.98617 6.36459 8.802 6.18042 8.802 5.95834C8.802 5.73625 8.98617 5.55209 9.20825 5.55209H11.3749C11.597 5.55209 11.7812 5.73625 11.7812 5.95834C11.7812 6.18042 11.597 6.36459 11.3749 6.36459Z" fill="#292D32"/><path d="M7.58341 7.44791H5.41675C5.19466 7.44791 5.0105 7.26375 5.0105 7.04166C5.0105 6.81958 5.19466 6.63541 5.41675 6.63541H7.58341C7.8055 6.63541 7.98966 6.81958 7.98966 7.04166C7.98966 7.26375 7.8055 7.44791 7.58341 7.44791Z" fill="#292D32"/></svg></span>
						  </button>
					  </div>
  
					  <!-- Trip Cards - Horizontal Scroll -->
					  <div class="trip-cards">
						  <!-- Trip Card 1 -->
						  <div class="trip-card">
						  <div class="trip-image">
							  <img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Thailand" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
						  </div>
						  <div class="trip-details">
							  <div class="trip-location">
							  <span>⦿ Thailand</span>
							  </div>
							  <h3 class="trip-name">Explore Thailand in 7 days: Top Highlights</h3>
							  <p class="trip-price">₹55,000</p>
							  <div class="trip-footer">
							  <p class="trip-emi">EMI Starting from <span>₹2250</span>/ Month</p>
							  <span class="share-icon">↗</span>
							  </div>
						  </div>
						  </div>
  
						  <!-- Trip Card 2 -->
						  <div class="trip-card">
						  <div class="trip-image">
							  <img src="/view/assets/img/leadGen/Thailand/Coral_Island.jpg" alt="Thailand">
						  </div>
						  <div class="trip-details">
							  <div class="trip-location">
							  <span>⦿ Thailand</span>
							  </div>
							  <h3 class="trip-name">Explore Thailand in 7 days: Top Highlights</h3>
							  <p class="trip-price">₹55,000</p>
							  <div class="trip-footer">
							  <p class="trip-emi">EMI Starting from <span>₹2250</span>/ Month</p>
							  <span class="share-icon">↗</span>
							  </div>
						  </div>
						  </div>
  
						  <!-- Trip Card 3 (partially visible) -->
						  <div class="trip-card">
						  <div class="trip-image">
							  <img src="/view/assets/img/leadGen/Thailand/Chiang_Mai.jpg" alt="Thailand">
						  </div>
						  <div class="trip-details">
							  <div class="trip-location">
							  <span>⦿ Thailand</span>
							  </div>
							  <h3 class="trip-name">Explore Thailand in 7 days: Top Highlights</h3>
							  <p class="trip-price">₹55,000</p>
							  <div class="trip-footer">
							  <p class="trip-emi">EMI Starting from <span>₹2250</span>/ Month</p>
							  <span class="share-icon">↗</span>
							  </div>
						  </div>
						  </div>
						  <!-- Trip Card 4 -->
						  <div class="trip-card">
						  <div class="trip-image">
							  <img src="/view/assets/img/leadGen/Thailand/Chatuchak_Market.webp" alt="Thailand">
						  </div>
						  <div class="trip-details">
							  <div class="trip-location">
							  <span>⦿ Thailand</span>
							  </div>
							  <h3 class="trip-name">Explore Thailand in 7 days: Top Highlights</h3>
							  <p class="trip-price">₹55,000</p>
							  <div class="trip-footer">
							  <p class="trip-emi">EMI Starting from <span>₹2250</span>/ Month</p>
							  <span class="share-icon">↗</span>
							  </div>
						  </div>
						  </div>
					  </div>
				  </div>`;
		dataMembers.groupMembers.forEach((member) => {
			if (
				member &&
				member.isRequested == "0" &&
				member.userInfo &&
				member.userInfo.profilePic &&
				imageLinks.length < 5
			) {
				var image = member.userInfo.profilePic;
				if (!image.startsWith("https")) {
					image = imageBaseUrl + member.userInfo.profilePic;
				}
				imageLinks.push(image);
			}
		});
		console.log("Image links: ", imageLinks);
		/*chatHeader = `<div class="group-header">
				  <div class="profile-images-container">
				  <!-- Main/center profile image -->
				  <div class="profile-image main-profile">
					  <img src="${imageLinks[0]}" alt="Profile" />
					  <div class="status-indicator"></div>
				  </div>
				  <!-- Surrounding profile images -->
				  <div class="profile-image top-left">
					  <img src="${imageLinks[1]}" alt="Profile" />
				  </div>
				  <div class="profile-image top-right">
					  <img src="${imageLinks[2]}" alt="Profile" />
				  </div>
				  <div class="profile-image bottom-left">
					  <img src="${imageLinks[3]}" alt="Profile" />
				  </div>
				  <div class="profile-image bottom-right">
					  <img src="${imageLinks[4]}" alt="Profile" />
				  </div>
				  </div>
				  <h1 class="group-name">Thailand Explorers</h1>
				  </div>`;*/
	}
	else {
		
		if (type == 'new-dm') {
			dp = dataChats.userInfo.profilePic;
			name = dataChats.userInfo.displayName;
			userId = dataChats.userInfo.from_uid;
			chatType = type != "ai" ? "personal" : "ai";
			packageSection = "";
			orgDataMembers = dataChats;
			
		}
		else {
			dp = type == 'dm-init' ? dataMembers.userInfo.profilePic : dataMembers.chatImage;
			name = type == 'dm-init' ? dataMembers.userInfo.displayName : dataMembers.chatName;
			dataChats = dataChats.messages;
			userId = type == 'dm-init' ? dataMembers.userInfo.from_uid : dataMembers.userId;
			chatType = type != "ai" ? "personal" : "ai";
			packageSection = "";
			//chatHeader = ``;
			if (type != 'ai') {
				isMsgReqAccepted = type == 'dm-init' ? dataMembers.isMsgReqAccepted :  (dataMembers.selectedChatData && dataMembers.selectedChatData.isMsgReqAccepted)? dataMembers.selectedChatData.isMsgReqAccepted : isMsgReqAccepted;
			}
		}
		
		
		
	}

	var headerStatus = chatType != 'ai' ? 'tap here for contact info' : 'Your personal AI travel assistant';
	chatId = dataMembers.chatId;

	var chatHTML = `
		  <div class="chat">
			  <header class="chat__header ${chatType}">
				  <span class="chat__header-back"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 24L10.5 16L18.5 8" stroke="#0A0A0A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
				  <div class="chat__header-avatar">
					  <img src="${returnImagePath(dp)}" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'"> 
				  </div>
				  <div class="chat__header-info">
					  <div class="chat__header-name">${name}</div>
					  <div class="chat__header-status">${headerStatus}</div>
				  </div>
				  <div class="chat__header-actions hidden"> <div class="copy__but" data-action="copy">${icons.copyIcon}</div> <div class="delete__but" data-action="delete">${icons.deleteIcon} </div><div class="forward__but hidden" data-action="forward"> ${icons.forwardIcon}</div><div class="star__but" data-action="star"> ${icons.starIcon}</div> 
				  </div>
			  </header>
  
			  <div class="chat__messages">
				  
			  </div>
  
			  <div class="chat__input-area">
			  	<div class="premium__chat-holder">
					<img src="/view/assets/img/chat_go_premium.webp" alt="Premium Chat" class="premium__chat-image">
				</div>
				  <div class="chat__input-container">
					  <button class="chat__input-action emoji">
						  <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.3751 21.8021H8.62508C3.42133 21.8021 1.198 19.5788 1.198 14.375V8.62502C1.198 3.42127 3.42133 1.19794 8.62508 1.19794H14.3751C19.5788 1.19794 21.8022 3.42127 21.8022 8.62502V14.375C21.8022 19.5788 19.5788 21.8021 14.3751 21.8021ZM8.62508 2.63544C4.20716 2.63544 2.6355 4.2071 2.6355 8.62502V14.375C2.6355 18.7929 4.20716 20.3646 8.62508 20.3646H14.3751C18.793 20.3646 20.3647 18.7929 20.3647 14.375V8.62502C20.3647 4.2071 18.793 2.63544 14.3751 2.63544H8.62508Z" fill="#292D32"/><path d="M14.8542 10.0625C13.6659 10.0625 12.698 9.09458 12.698 7.90625C12.698 6.71792 13.6659 5.75 14.8542 5.75C16.0426 5.75 17.0105 6.71792 17.0105 7.90625C17.0105 9.09458 16.0426 10.0625 14.8542 10.0625ZM14.8542 7.1875C14.4613 7.1875 14.1355 7.51333 14.1355 7.90625C14.1355 8.29917 14.4613 8.625 14.8542 8.625C15.2472 8.625 15.573 8.29917 15.573 7.90625C15.573 7.51333 15.2472 7.1875 14.8542 7.1875Z" fill="#292D32"/><path d="M8.14575 10.0625C6.95742 10.0625 5.9895 9.09458 5.9895 7.90625C5.9895 6.71792 6.95742 5.75 8.14575 5.75C9.33409 5.75 10.302 6.71792 10.302 7.90625C10.302 9.09458 9.33409 10.0625 8.14575 10.0625ZM8.14575 7.1875C7.75284 7.1875 7.427 7.51333 7.427 7.90625C7.427 8.29917 7.75284 8.625 8.14575 8.625C8.53867 8.625 8.8645 8.29917 8.8645 7.90625C8.8645 7.51333 8.53867 7.1875 8.14575 7.1875Z" fill="#292D32"/><path d="M11.5 18.6396C8.72083 18.6396 6.46875 16.3779 6.46875 13.6083C6.46875 12.7363 7.17792 12.0271 8.05 12.0271H14.95C15.8221 12.0271 16.5312 12.7363 16.5312 13.6083C16.5312 16.3779 14.2792 18.6396 11.5 18.6396ZM8.05 13.4646C7.97333 13.4646 7.90625 13.5317 7.90625 13.6083C7.90625 15.5921 9.51625 17.2021 11.5 17.2021C13.4837 17.2021 15.0938 15.5921 15.0938 13.6083C15.0938 13.5317 15.0267 13.4646 14.95 13.4646H8.05Z" fill="#292D32"/></svg>
					  </button>
					  <div class="chat__input-field">
						  <textarea class="chat__input" placeholder="Message" rows="1"></textarea>
						  <button class="chat__input-action plusIcon"><svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.9 7.49998C16.9 7.00292 16.497 6.59998 16 6.59998C15.5029 6.59998 15.1 7.00292 15.1 7.49998V15.6H6.99998C6.50292 15.6 6.09998 16.0029 6.09998 16.5C6.09998 16.997 6.50292 17.4 6.99998 17.4H15.1V25.5C15.1 25.997 15.5029 26.4 16 26.4C16.497 26.4 16.9 25.997 16.9 25.5V17.4H25C25.497 17.4 25.9 16.997 25.9 16.5C25.9 16.0029 25.497 15.6 25 15.6H16.9V7.49998Z" fill="#0A0A0A"/></svg></button>
						  <button class="chat__input-action cameraIcon hidden"><svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.1529 7C13.4899 7 12.8541 7.26337 12.3853 7.73216L11.6813 8.43622C11.5125 8.60495 11.2837 8.69975 11.0451 8.69975H10.0494C7.26068 8.69975 5 10.9604 5 13.7491V20.973C5 23.7617 7.26067 26.0224 10.0494 26.0224H21.9476C24.7363 26.0224 26.997 23.7617 26.997 20.973V13.7491C26.997 10.9604 24.7363 8.69975 21.9476 8.69975H20.9519C20.7133 8.69975 20.4844 8.60495 20.3157 8.43622L19.6116 7.73216C19.1428 7.26337 18.507 7 17.844 7H14.1529ZM13.5167 8.86353C13.6854 8.69479 13.9143 8.6 14.1529 8.6H17.844C18.0827 8.6 18.3115 8.69479 18.4803 8.86353L19.1843 9.56759C19.6531 10.0364 20.2889 10.2997 20.9519 10.2997H21.9476C23.8526 10.2997 25.397 11.8441 25.397 13.7491V20.973C25.397 22.8781 23.8526 24.4224 21.9476 24.4224H10.0494C8.14433 24.4224 6.6 22.8781 6.6 20.973V13.7491C6.6 11.8441 8.14433 10.2997 10.0494 10.2997H11.0451C11.708 10.2997 12.3438 10.0364 12.8126 9.56759L13.5167 8.86353ZM12.549 17.1486C12.549 15.2435 14.0933 13.6992 15.9983 13.6992C17.9034 13.6992 19.4477 15.2435 19.4477 17.1486C19.4477 19.0536 17.9034 20.5979 15.9983 20.5979C14.0933 20.5979 12.549 19.0536 12.549 17.1486ZM15.9983 12.0992C13.2097 12.0992 10.949 14.3599 10.949 17.1486C10.949 19.9372 13.2097 22.1979 15.9983 22.1979C18.787 22.1979 21.0477 19.9372 21.0477 17.1486C21.0477 14.3599 18.787 12.0992 15.9983 12.0992Z" fill="#0A0A0A"/></svg></button>
					  </div>
					  <button class="chat__input-send ${chatType}">
						  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" fill="#292D32"/><path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" fill="#292D32"/></svg>
					  </button>
				  </div>
			  </div>
			  ${renderEmojis()}
		  </div>
	  `;

	container.innerHTML = chatHTML;
	jQuery(".chat__input-send").data("chatId", chatId);
	//console.log("Chat HTML: isGroup", isGroup, chatHTML);
	console.log("Chats Data: isGroup", isGroup, orgDataChat);
	console.log("Data Members: isGroup", isGroup, orgDataMembers);

	jQuery(".chat__header")
		.data("dataChats", orgDataChat)
		.data("dataMembers", orgDataMembers)
		.data("type", type)
		.data("userId", userId)
		.data("chatId", chatId)
		.data("isGroup", isGroup)
		;

	var whosMessage;
	var combinedData, userName, userDp;

	if (Array.isArray(dataChats) && dataChats.every(item => typeof item === 'object' && item !== null)) {
		if (isGroup) {	
			combinedData = mapMessageSenders(orgDataMembers.groupMembers, orgDataChat.response.messages);
			console.log("Combined Data: ", combinedData);
		}
		dataChats.forEach((chat) => {
			if (chat.message.trim() == "" && chat.media && chat.media.length == 0) {
				// Skip empty messages
				return;
			}
			whosMessage =
				chat.isSentByCurrentUser &&
				isCurrentUserMessage(chat) &&
				!chat.isReadOnly
					? " chat__message--sent"
					: " chat__message--received";
			whosMessage = chat.type == "status" ? " statusMessage" : whosMessage;

			let messageContent = "";
			if (chat.type === "media") {
				if (chat.media[0].mediaType === "image") {
					messageContent = `<img src="${returnImagePath(
						chat.media[0].mediaUrl
					)}" alt="Image" class="chat__message-image" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'"><p class="chat__message-text">${formatMessage(
						chat.message
					)}</p>`;
				}
				else {
					messageContent = `<video controls class="chat__message-video">
						  <source src="${returnVideoPath(chat.media[0].mediaUrl)}" type="video/mp4">
						  Your browser does not support the video tag.
					  </video><p class="chat__message-text">${formatMessage(chat.message)}</p>`;
				}
			} else if (chat.type === "gif") {
				messageContent = `<img src="${chat.message}" alt="GIF" class="chat__message-image" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">`;
			} else if (chat.type === "ai" && chat.images && chat.images.length > 0) {
				// Handle AI responses with distributed images and slider
				if (chat.contentWithImages && chat.contentWithImages.length > 0) {
					// Use distributed content with images
					const contentHTML = chat.contentWithImages.map(item => {
						if (item.type === 'text') {
							return `<p class="chat__message-text">${formatMessage(item.content)}</p>`;
						} else if (item.type === 'images') {
							return createImageSlider(item.images);
						}
						return '';
					}).join('');
					
					messageContent = `<div class="chat__message-ai-content">${contentHTML}</div>`;
				} else {
					// Fallback to old format with images at top
					const imagesHTML = chat.images.map(img => 
						`<img src="${img}" alt="AI Response Image" class="chat__message-ai-image" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">`
					).join('');
					
					messageContent = `
						<div class="chat__message-ai-content">
							<div class="chat__message-ai-images">
								${imagesHTML}
							</div>
							<p class="chat__message-text">${formatMessage(chat.message)}</p>
						</div>
					`;
				}
			} else {
				if (chat.isDeleted == true) {
					messageContent = `<span class="text-msg-deleted">This message was deleted</span>`;
				}
				else {
					messageContent = `<p class="chat__message-text">${formatMessage(
						chat.message
					)}</p>`;
					
				}
			}

			date = new Date(Number(chat.timeStamp) * 1000);
			date = date.toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
			});
			
			
			var chatBubbleReaction = chat.reaction ? `<div class="chat__reaction-bubble active"> ${chat.reaction} </div>` : `<div class="chat__reaction-bubble"></div>`;

			var messageMeta = `
				  ${chatBubbleReaction}
				  <div class="chat__message-meta">
					  <span class="chat__message-time">${date}</span>
					  ${
							chat.isSentByCurrentUser
								? `
						  <svg class="chat__message-status" viewBox="0 0 24 24" fill="none">
							  <path d="M2 12L7 17L17 7M7 12L12 17L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						  </svg>`
								: ""
						}
				  </div>`;
			
			var whosMessageReaction =
				  chat.isSentByCurrentUser &&
				  isCurrentUserMessage(chat) &&
				  !chat.isReadOnly
					  ? " chat__reaction-box--sent"
					  : " chat__reaction-box--received";

			// jQuery(".chat__messages").append(`
			// 	  <div class="chat__message ${whosMessage}">
			// 		  ${messageContent}
			// 		  ${messageMeta}
			// 		  <!-- Reaction Box for Received Message (shown when active) -->
			// 		<div class="chat__reaction-box-backdrop"></div>
			// 		<div class="chat__reaction-box ${whosMessageReaction}">
			// 			${returnEmojisForReaction()}
			// 		</div>
			// 	  </div>
			// 	  `);
			
			
			if (isGroup && !chat.isSentByCurrentUser &&
				!isCurrentUserMessage(chat)) {
				//userName = combinedData[chat.senderId].displayName;
				userName = combinedData.filter((item) => item.userId === chat.senderId);
				userName = userName[0].displayName;
				userDp = combinedData.filter((item) => item.userId === chat.senderId);
				userDp = userDp[0].profilePic;

				//userDp = combinedData[chat.senderId].profilePic;
				

				
			}
			
			createMessagesCard(whosMessage, messageContent, messageMeta, whosMessageReaction, isGroup, chat, userName, userDp);
			
			// Attaching the data to the message element
			jQuery(".chat__message:last").data("messageData", chat);
		});
	}

	// Add the 'active' class to trigger the transition
	openSecondPage();

	
	jQuery(".chat__header").after(packageSection);

	if (type == "ai") {
		jQuery(".chat__input-action").hide();
		jQuery(".chat__input-field").css("padding", "8px");
		// Show prefilled AI messages
		showAIPrefilledMessages();
	}
	else {
		scrollChatIntoView();
		checkPremiumChat();
	}
	
	if (!isMsgReqAccepted) {
		if (!isGroup) {
			appendChatRequestDialog(orgDataChat, orgDataMembers);
		}
		else if (orgDataChat.element.selectedChatData.createdById == localStorage.getItem('plainUserId')) {
			appendGroupUsersDialog(orgDataChat, orgDataMembers);
		}
	}
	
	// Auto Play videos for Mobile devices for 1 seconds so that the thumbnail is shown --> Need to find some other way to do this
	
	autplayVideoForOneSec('.chat__message-video');
	
	if (isMobile() && !isAndroid() && !isIOS()) {
		jQuery('.chat').css('height', 'calc(100vh - 80px)');
	}
	
	
	
	
}

function checkPremiumChat() {
	// Add the Restriction for Free Users for Chatting
	var userProfile = getProfileData();
	// Get the class name of the last message in the chat__messages
	var lastMessageClass = jQuery(".chat__messages").children().last().find('.chat__message').attr("class");
	if (lastMessageClass) {
		console.log("Last message class: ", lastMessageClass);
		if (userProfile && userProfile.isVerified != true && lastMessageClass.includes('chat__message--sent')) {
			jQuery('.chat__input-container').css('display', 'none');
			jQuery('.premium__chat-holder').css('display', 'block');
			console.log("User is not verified and last message is sent");
		}
	}
}

function openSecondPage() {
	var container = document.getElementById("singleChat");
	// Add the 'active' class to trigger the transition
	jQuery("#singleChat").css("display", "block");
	setTimeout(() => {
		container.classList.add("active");
	}, 0);
	setTimeout(() => {
		jQuery("#main").css("display", "none");
	},500);
}

function returnImagePath(data) {
	if (data && !data.startsWith("https")) {
		data = imageBaseUrl + "/" + data;
	} else if (!data) {
		data = imageBaseUrl + "uploads/display_pictures/dummy.png";
	}
	return data;
}

function returnVideoPath(data) {
	if (data && !data.startsWith("https")) {
		data = videoBaseUrl + "/" + data;
	}
	return data;
}

function getProfileData() {
	var bytes = CryptoJS.AES.decrypt(
		localStorage.getItem("userProfile"),
		"TravelBuddy"
	);
	var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
	var profile = JSON.parse(decryptedData);
	console.log("Decrypted data: ", profile);
	return profile;
}

function startNewChat() {
	navigateToChat("newChat");
	var newChatHTML = `
		  <!-- Main container -->
		  <div class="new-chat">
			  <!-- Header -->
			  <div class="new-chat__header">
				  <h1 class="new-chat__title">New chat</h1>
				  <button class="new-chat__close-button">
					  ${icons.crossIcon}
				  </button>
			  </div>
			  
			  <!-- Search Bar -->
			  <div class="new-chat__search">
				  <div class="new-chat__search-input">
					  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_633_209)"><path d="M12.5322 19.0332C13.9297 19.0332 15.2393 18.6113 16.3291 17.8906L20.1787 21.749C20.4336 21.9951 20.7588 22.1182 21.1104 22.1182C21.8398 22.1182 22.376 21.5469 22.376 20.8262C22.376 20.4922 22.2617 20.167 22.0156 19.9209L18.1924 16.0801C18.9834 14.9551 19.4492 13.5928 19.4492 12.1162C19.4492 8.31055 16.3379 5.19922 12.5322 5.19922C8.73535 5.19922 5.61523 8.31055 5.61523 12.1162C5.61523 15.9219 8.72656 19.0332 12.5322 19.0332ZM12.5322 17.1875C9.74609 17.1875 7.46094 14.9023 7.46094 12.1162C7.46094 9.33008 9.74609 7.04492 12.5322 7.04492C15.3184 7.04492 17.6035 9.33008 17.6035 12.1162C17.6035 14.9023 15.3184 17.1875 12.5322 17.1875Z" fill="#3C3C43" fill-opacity="0.6"/></g><defs><clipPath id="clip0_633_209"><rect width="28" height="28" fill="white"/></clipPath></defs></svg>
					  <input type="text" placeholder="Search" class="new-chat__search-field" id="new-chat-search">
				  	<div class="new-chat__search-cross hidden">${icons.crossIcon}</div>
				  </div>
			  </div>
			  
			  <!-- Options -->
			  <div class="new-chat__options">
				  <!-- New group -->
				  <div class="new-chat__option"  data-chat-page="newGroup">
					  <div class="new-chat__option-icon">
						  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.16006 10.87C9.06006 10.86 8.94006 10.86 8.83006 10.87C6.45006 10.79 4.56006 8.84 4.56006 6.44C4.56006 3.99 6.54006 2 9.00006 2C11.4501 2 13.4401 3.99 13.4401 6.44C13.4301 8.84 11.5401 10.79 9.16006 10.87Z" stroke="url(#paint0_linear_589_1714)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.41 4C18.35 4 19.91 5.57 19.91 7.5C19.91 9.39 18.41 10.93 16.54 11C16.46 10.99 16.37 10.99 16.28 11" stroke="url(#paint1_linear_589_1714)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.15997 14.56C1.73997 16.18 1.73997 18.82 4.15997 20.43C6.90997 22.27 11.42 22.27 14.17 20.43C16.59 18.81 16.59 16.17 14.17 14.56C11.43 12.73 6.91997 12.73 4.15997 14.56Z" stroke="url(#paint2_linear_589_1714)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.3401 20C19.0601 19.85 19.7401 19.56 20.3001 19.13C21.8601 17.96 21.8601 16.03 20.3001 14.86C19.7501 14.44 19.0801 14.16 18.3701 14" stroke="url(#paint3_linear_589_1714)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="paint0_linear_589_1714" x1="9.00006" y1="2" x2="9.00006" y2="10.87" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#0A0A0A"/></linearGradient><linearGradient id="paint1_linear_589_1714" x1="18.095" y1="4" x2="18.095" y2="11" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#0A0A0A"/></linearGradient><linearGradient id="paint2_linear_589_1714" x1="9.16497" y1="13.1875" x2="9.16497" y2="21.81" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#0A0A0A"/></linearGradient><linearGradient id="paint3_linear_589_1714" x1="19.9051" y1="14" x2="19.9051" y2="20" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#0A0A0A"/></linearGradient></defs></svg>
					  </div>
					  <span class="new-chat__option-label">New group</span>
				  </div>
				  
				  <!-- New contact -->
				  <div class="new-chat__option hidden" data-chat-page="newDM">
					  <div class="new-chat__option-icon">
						  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="url(#paint0_linear_589_1731)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.40991 22C3.40991 18.13 7.25991 15 11.9999 15C12.9599 15 13.8899 15.13 14.7599 15.37" stroke="url(#paint1_linear_589_1731)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 18C22 18.32 21.96 18.63 21.88 18.93C21.79 19.33 21.63 19.72 21.42 20.06C20.73 21.22 19.46 22 18 22C16.97 22 16.04 21.61 15.34 20.97C15.04 20.71 14.78 20.4 14.58 20.06C14.21 19.46 14 18.75 14 18C14 16.92 14.43 15.93 15.13 15.21C15.86 14.46 16.88 14 18 14C19.18 14 20.25 14.51 20.97 15.33C21.61 16.04 22 16.98 22 18Z" stroke="url(#paint2_linear_589_1731)" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.49 17.98H16.51" stroke="url(#paint3_linear_589_1731)" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 16.52V19.51" stroke="url(#paint4_linear_589_1731)" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="paint0_linear_589_1731" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#292D32"/></linearGradient><linearGradient id="paint1_linear_589_1731" x1="9.08492" y1="15" x2="9.08492" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#292D32"/></linearGradient><linearGradient id="paint2_linear_589_1731" x1="18" y1="14" x2="18" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#292D32"/></linearGradient><linearGradient id="paint3_linear_589_1731" x1="18" y1="17.98" x2="18" y2="18.98" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#292D32"/></linearGradient><linearGradient id="paint4_linear_589_1731" x1="18.5" y1="16.52" x2="18.5" y2="19.51" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#292D32"/></linearGradient></defs></svg>
					  </div>
					  <span class="new-chat__option-label">New contact</span>
				  </div>
				  
				  
				  <!-- Chat with AIs -->
				  <div class="new-chat__option" data-chat-page="newAI">
					  <div class="new-chat__option-icon">
						  <div class="new-chat__ai-icon">
							  <div class="new-chat__ai-icon-row">
								  <div class="new-chat__ai-icon-box"></div>
								  <div class="new-chat__ai-icon-box"></div>
							  </div>
							  <div class="new-chat__ai-icon-row">
								  <div class="new-chat__ai-icon-box"></div>
								  <div class="new-chat__ai-icon-box new-chat__ai-icon-box--plus">
									  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 8.27V4.23C22 2.64 21.36 2 19.77 2H15.73C14.14 2 13.5 2.64 13.5 4.23V8.27C13.5 9.86 14.14 10.5 15.73 10.5H19.77C21.36 10.5 22 9.86 22 8.27Z" stroke="url(#paint0_linear_589_1779)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 8.52V3.98C10.5 2.57 9.86 2 8.27 2H4.23C2.64 2 2 2.57 2 3.98V8.51C2 9.93 2.64 10.49 4.23 10.49H8.27C9.86 10.5 10.5 9.93 10.5 8.52Z" stroke="url(#paint1_linear_589_1779)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 19.77V15.73C10.5 14.14 9.86 13.5 8.27 13.5H4.23C2.64 13.5 2 14.14 2 15.73V19.77C2 21.36 2.64 22 4.23 22H8.27C9.86 22 10.5 21.36 10.5 19.77Z" stroke="url(#paint2_linear_589_1779)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 17.5H20.5" stroke="url(#paint3_linear_589_1779)" stroke-width="1.5" stroke-linecap="round"/><path d="M17.5 20.5V14.5" stroke="url(#paint4_linear_589_1779)" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="paint0_linear_589_1779" x1="17.75" y1="2" x2="17.75" y2="10.5" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#292D32"/></linearGradient><linearGradient id="paint1_linear_589_1779" x1="6.25" y1="2" x2="6.25" y2="10.4901" gradientUnits="userSpaceOnUse"><stop stop-color="#B2B2B2"/><stop offset="1" stop-color="#292D32"/></linearGradient></defs></svg>
								  </div>
							  </div>
						  </div>
					  </div>
					  <span class="new-chat__option-label">Chat with AI</span>
				  </div>
			  </div>
			  
			  <!-- Frequently Contacted Section -->
			  <div class="new-chat__section hidden">
					<h2 class="new-chat__section-title">Frequently contacted</h2>
					<div class="new-chat__contacts">
						<!-- Contact items will be inserted here -->
					</div>
			  </div>
			  <!-- Followers List -->
			  <div class="conversation-list">
			  	<h2 class="travel-section-title buddies">Your Buddies</h2>
			  </div>
			  <!-- Trending Buddies -->
				<div class="travel-section">
				<h2 class="travel-section-title">Trending Buddies</h2>
				<div class="travel-influencers-scroll">
					<!-- Influencer 1 -->
					<div class="travel-influencer-card">
					<div class="travel-influencer-image">
						<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Michelle Sauniere" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
					</div>
					<div class="travel-influencer-name">Michelle Sauniere</div>
					<div class="travel-influencer-followers">1M</div>
					</div>
					
					<!-- Influencer 2 -->
					<div class="travel-influencer-card">
					<div class="travel-influencer-image">
						<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Angela Lahm">
					</div>
					<div class="travel-influencer-name">Angela Lahm</div>
					<div class="travel-influencer-followers">50K</div>
					<div class="travel-followers-label">followers</div>
					</div>
					
					<!-- Influencer 3 -->
					<div class="travel-influencer-card">
					<div class="travel-influencer-image">
						<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Trevor McHall">
					</div>
					<div class="travel-influencer-name">Trevor McHall</div>
					<div class="travel-influencer-followers">48K</div>
					<div class="travel-followers-label">followers</div>
					</div>
				</div>
				</div>
				
				<!-- Best-Selling Group Trips -->
				<div class="travel-section container">
				<h2 class="travel-section-title">Best-Selling Group Trips</h2>
				
				<!-- Package 1 -->
				<div class="travel-package-card">
					<div class="travel-package-image">
					<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Thailand beach">
					</div>
					<div class="travel-package-info">
					<div class="travel-location">
						<i class="fas fa-map-marker-alt"></i>
						<span class="travel-location-name">Thailand</span>
					</div>
					<div class="travel-package-title">Explore Thailand in 7 days: 7 Days Package</div>
					<div class="travel-package-price">
						<span class="travel-price">₹5,000</span>
						<span class="travel-emi">EMI from ₹250/ Month</span>
					</div>
					</div>
				</div>
				
				<!-- Package 2 -->
				<div class="travel-package-card">
					<div class="travel-package-image">
					<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Thailand beach">
					</div>
					<div class="travel-package-info">
					<div class="travel-location">
						<i class="fas fa-map-marker-alt"></i>
						<span class="travel-location-name">Thailand</span>
					</div>
					<div class="travel-package-title">Explore Thailand in 7 days: 7 Days Package</div>
					<div class="travel-package-price">
						<span class="travel-price">₹5,000</span>
						<span class="travel-emi">EMI from ₹250/ Month</span>
					</div>
					</div>
				</div>
				</div>
				
		  </div>
	  `;

	// Assuming you have a container to append this HTML to
	var container = document.getElementById("singleChat");
	//container.addClass('new-chat');
	if (container) {
		container.innerHTML = newChatHTML;
	} else {
		console.error("New chat container not found");
	}
	// Get Followers
	var userProfile = getProfileData();
	var userId = userProfile.userId;
	jsInit('fetchFollowers', { userId: userId, pageNumber: '0', type: 0 }, { userId: userId, type: 'combined' }) ;


	// Get Group Trips
	jsInit("getExperiences", {
		filter: {
			trending: {
				type: "group_trips",
			},
		},
	});
	
	let payload = localStorage.getItem("userLat")
		? {
				lat: localStorage.getItem("userLat"),
				lng: localStorage.getItem("userLng"),
				nearby: true,
		  }
		: { lat: "28.5355", lng: "77.39", nearby: true };
	// Get Influencers
	jsInit("fetchAllInfluencers", payload);
	openSecondPage();
}

/**
 * Renders the New Chat interface in the specified container
 */

function renderContacts(contacts, container, template) {
	contacts.forEach((contact) => {
		var contactElement = template.content.cloneNode(true);
		contactElement.querySelector(".new-chat__contact-name").textContent =
			contact.name;
		contactElement.querySelector(".new-chat__contact-image").src =
			contact.image;
		contactElement.querySelector(".new-chat__contact-image").alt = contact.name;
		container.appendChild(contactElement);
	});
}

// Example usage:
// var container = document.getElementById('app');
// renderNewChat(container);

function renderHomePageForNewUsers() {
	navigateToChat("newUserHomePage");
	jQuery("#main").hide();
	var design = `<!-- Travel App Container -->
				<div class="travel-container">
					<!-- Header -->
					<div class="travel-header">
						<span class="chat__header-back"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 24L10.5 16L18.5 8" stroke="#0A0A0A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
						<div class="travel-header-right">
						<button class="travel-scan-button">
							<i class="fas fa-qrcode"></i>
						</button>
						<button class="travel-add-button">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12.75H8C7.59 12.75 7.25 12.41 7.25 12C7.25 11.59 7.59 11.25 8 11.25H16C16.41 11.25 16.75 11.59 16.75 12C16.75 12.41 16.41 12.75 16 12.75Z" fill="#292D32"></path><path d="M12 16.75C11.59 16.75 11.25 16.41 11.25 16V8C11.25 7.59 11.59 7.25 12 7.25C12.41 7.25 12.75 7.59 12.75 8V16C12.75 16.41 12.41 16.75 12 16.75Z" fill="#292D32"></path><path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" fill="#292D32"></path></svg>
						</button>
						</div>
					</div>
					<!-- Main Content -->
					<div class="travel-content">
						<!-- Title -->
						<h1 class="travel-title">Explore and find someone new</h1>
						
						<!-- Search Bar -->
						<div class="travel-search-bar">
						<i class="fas fa-search"></i>
						<input type="text" placeholder="Search">
						<button>
							<i class="fas fa-microphone"></i>
						</button>
						</div>
						
						<!-- Popular Travel Groups -->
						<div class="travel-section hidden">
						<h2 class="travel-section-title">Popular Travel groups</h2>
						<div class="travel-groups-grid">
							<!-- Group 1 -->
							<div class="travel-group-card">
							<div class="travel-group-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Bali beach">
								<div class="travel-profile-circle">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Profile">
								</div>
							</div>
							<div class="travel-group-info travel-highlighted">
								<div class="travel-group-name">Bali Adventure</div>
								<div class="travel-group-location">Bali, India</div>
								<div class="travel-group-members">10k+ Members</div>
							</div>
							</div>
							
							<!-- Group 2 -->
							<div class="travel-group-card">
							<div class="travel-group-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Bali beach">
								<div class="travel-profile-circle">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Profile">
								</div>
							</div>
							<div class="travel-group-info travel-highlighted">
								<div class="travel-group-name">Bali Adventure</div>
								<div class="travel-group-location">Bali, India</div>
								<div class="travel-group-members">10k+ Members</div>
							</div>
							</div>
							
							<!-- Group 3 -->
							<div class="travel-group-card">
							<div class="travel-group-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Bali beach">
								<div class="travel-profile-circle">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Profile">
								</div>
							</div>
							<div class="travel-group-info travel-highlighted">
								<div class="travel-group-name">Bali Adventure</div>
								<div class="travel-group-location">Bali, India</div>
								<div class="travel-group-members">10k+ Members</div>
							</div>
							</div>
							
							<!-- Group 4 -->
							<div class="travel-group-card">
							<div class="travel-group-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Bali beach">
								<div class="travel-profile-circle">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Profile">
								</div>
							</div>
							<div class="travel-group-info travel-highlighted">
								<div class="travel-group-name">Bali Adventure</div>
								<div class="travel-group-location">Bali, India</div>
								<div class="travel-group-members">10k+ Members</div>
							</div>
							</div>
						</div>
						</div>
						
						<!-- Trending Buddies -->
						<div class="travel-section">
						<h2 class="travel-section-title">Trending Buddies</h2>
						<div class="travel-influencers-scroll">
							<!-- Influencer 1 -->
							<div class="travel-influencer-card">
							<div class="travel-influencer-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Michelle Sauniere">
							</div>
							<div class="travel-influencer-name">Michelle Sauniere</div>
							<div class="travel-influencer-followers">1M</div>
							<div class="travel-followers-label">followers</div>
							</div>
							
							<!-- Influencer 2 -->
							<div class="travel-influencer-card">
							<div class="travel-influencer-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Angela Lahm">
							</div>
							<div class="travel-influencer-name">Angela Lahm</div>
							<div class="travel-influencer-followers">50K</div>
							<div class="travel-followers-label">followers</div>
							</div>
							
							<!-- Influencer 3 -->
							<div class="travel-influencer-card">
							<div class="travel-influencer-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Trevor McHall">
							</div>
							<div class="travel-influencer-name">Trevor McHall</div>
							<div class="travel-influencer-followers">48K</div>
							<div class="travel-followers-label">followers</div>
							</div>
						</div>
						</div>
						
						<!-- Best-Selling Group Trips -->
						<div class="travel-section container">
						<h2 class="travel-section-title">Best-Selling Group Trips</h2>
						
						<!-- Package 1 -->
						<div class="travel-package-card">
							<div class="travel-package-image">
							<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Thailand beach">
							</div>
							<div class="travel-package-info">
							<div class="travel-location">
								${icons.location}
								<span class="travel-location-name">Thailand</span>
							</div>
							<div class="travel-package-title">Explore Thailand in 7 days: 7 Days Package</div>
							<div class="travel-package-price">
								<span class="travel-price">₹5,000</span>
								<span class="travel-emi">EMI from ₹250/ Month</span>
							</div>
							</div>
						</div>
						
						<!-- Package 2 -->
						<div class="travel-package-card">
							<div class="travel-package-image">
							<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Thailand beach">
							</div>
							<div class="travel-package-info">
							<div class="travel-location">
								${icons.location}
								<span class="travel-location-name">Thailand</span>
							</div>
							<div class="travel-package-title">Explore Thailand in 7 days: 7 Days Package</div>
							<div class="travel-package-price">
								<span class="travel-price">₹5,000</span>
								<span class="travel-emi">EMI from ₹250/ Month</span>
							</div>
							</div>
						</div>
						</div>
					</div>
				</div>`;

	// Append the design to the body
	jQuery("body").append(design);

	// Show Group Trips
	jsInit(
		"getExperiences",
		{
			filter: {
				trending: {
					type: "group_trips",
				},
			},
		},
		"newUserChat"
	);

	// Show Trending Buddies
	let payload = localStorage.getItem("userLat")
		? {
				lat: localStorage.getItem("userLat"),
				lng: localStorage.getItem("userLng"),
				nearby: true,
		  }
		: { lat: "28.5355", lng: "77.39", nearby: true };
	jsInit("fetchAllInfluencers", payload, "newUserChat");
}

function addHomePageForNewUsers() {
	var newChatHTML = `<!-- Main Content -->
					<div class="travel-content">
						<!-- Title -->
						<h1 class="travel-title hidden">Explore and find someone new</h1>
						
						<!-- Search Bar -->
						<div class="travel-search-bar hidden">
						<i class="fas fa-search"></i>
						<input type="text" placeholder="Search" class="new-chat__search-field" id="new-chat-search">
						<button>
							<i class="fas fa-microphone"></i>
						</button>
						</div>
						
						<!-- Trending Buddies -->
						<div class="travel-section">
						<h2 class="travel-section-title">Trending Buddies</h2>
						<div class="travel-influencers-scroll">
							<!-- Influencer 1 -->
							<div class="travel-influencer-card">
							<div class="travel-influencer-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Michelle Sauniere">
							</div>
							<div class="travel-influencer-name">Michelle Sauniere</div>
							<div class="travel-influencer-followers">1M</div>
							<div class="travel-followers-label">followers</div>
							</div>
							
							<!-- Influencer 2 -->
							<div class="travel-influencer-card">
							<div class="travel-influencer-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Angela Lahm">
							</div>
							<div class="travel-influencer-name">Angela Lahm</div>
							<div class="travel-influencer-followers">50K</div>
							<div class="travel-followers-label">followers</div>
							</div>
							
							<!-- Influencer 3 -->
							<div class="travel-influencer-card">
							<div class="travel-influencer-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Trevor McHall">
							</div>
							<div class="travel-influencer-name">Trevor McHall</div>
							<div class="travel-influencer-followers">48K</div>
							<div class="travel-followers-label">followers</div>
							</div>
						</div>
						</div>
						
						<!-- Best-Selling Group Trips -->
						<div class="travel-section container">
						<h2 class="travel-section-title">Best-Selling Group Trips</h2>
						
						<!-- Package 1 -->
						<div class="travel-package-card">
							<div class="travel-package-image">
							<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Thailand beach">
							</div>
							<div class="travel-package-info">
							<div class="travel-location">
								${icons.location}
								<span class="travel-location-name">Thailand</span>
							</div>
							<div class="travel-package-title">Explore Thailand in 7 days: 7 Days Package</div>
							<div class="travel-package-price">
								<span class="travel-price">₹5,000</span>
								<span class="travel-emi">EMI from ₹250/ Month</span>
							</div>
							</div>
						</div>
						
						<!-- Package 2 -->
						<div class="travel-package-card">
							<div class="travel-package-image">
							<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Thailand beach">
							</div>
							<div class="travel-package-info">
							<div class="travel-location">
								${icons.location}
								<span class="travel-location-name">Thailand</span>
							</div>
							<div class="travel-package-title">Explore Thailand in 7 days: 7 Days Package</div>
							<div class="travel-package-price">
								<span class="travel-price">₹5,000</span>
								<span class="travel-emi">EMI from ₹250/ Month</span>
							</div>
							</div>
						</div>
						</div>
						
						<!-- Popular Travel Groups -->
						<div class="travel-section hidden">
						<h2 class="travel-section-title">Popular Travel groups</h2>
						<div class="travel-groups-grid">
							<!-- Group 1 -->
							<div class="travel-group-card">
							<div class="travel-group-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Bali beach">
								<div class="travel-profile-circle">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Profile">
								</div>
							</div>
							<div class="travel-group-info travel-highlighted">
								<div class="travel-group-name">Bali Adventure</div>
								<div class="travel-group-location">Bali, India</div>
								<div class="travel-group-members">10k+ Members</div>
							</div>
							</div>
							
							<!-- Group 2 -->
							<div class="travel-group-card">
							<div class="travel-group-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Bali beach">
								<div class="travel-profile-circle">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Profile">
								</div>
							</div>
							<div class="travel-group-info travel-highlighted">
								<div class="travel-group-name">Bali Adventure</div>
								<div class="travel-group-location">Bali, India</div>
								<div class="travel-group-members">10k+ Members</div>
							</div>
							</div>
							
							<!-- Group 3 -->
							<div class="travel-group-card">
							<div class="travel-group-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Bali beach">
								<div class="travel-profile-circle">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Profile">
								</div>
							</div>
							<div class="travel-group-info travel-highlighted">
								<div class="travel-group-name">Bali Adventure</div>
								<div class="travel-group-location">Bali, India</div>
								<div class="travel-group-members">10k+ Members</div>
							</div>
							</div>
							
							<!-- Group 4 -->
							<div class="travel-group-card">
							<div class="travel-group-image">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Bali beach">
								<div class="travel-profile-circle">
								<img src="/view/assets/img/leadGen/Thailand/Koh_Samui.jpg" alt="Profile">
								</div>
							</div>
							<div class="travel-group-info travel-highlighted">
								<div class="travel-group-name">Bali Adventure</div>
								<div class="travel-group-location">Bali, India</div>
								<div class="travel-group-members">10k+ Members</div>
							</div>
							</div>
						</div>
						</div>
						
					</div>`;
	jQuery('.chats__list').append(newChatHTML);
	
	let payload = localStorage.getItem("userLat")
		? {
				lat: localStorage.getItem("userLat"),
				lng: localStorage.getItem("userLng"),
				nearby: true,
		  }
		: { lat: "28.5355", lng: "77.39", nearby: true };
	// Get Influencers
	jsInit("fetchAllInfluencers", payload);
	
	// Get Group Trips
	jsInit("getExperiences", {
		filter: {
			trending: {
				type: "group_trips",
			},
		},
	});
}

function renderGroupChatDrillDown(groupData) {
	console.log("Group Data: ", groupData);

	var groupName = groupData.dataChats.element.chatName;
	var groupImage = groupData.dataChats.element.chatImage;
	var groupId = groupData.dataChats.element.chatId;

	var groupMembers = groupData.dataMembers.groupMembers;
	var groupMembersCount = 0;

	var groupMessages = groupData.dataChats.response.messages;

	// Get the Count of Media , Docs or Links
	var mediaCount = groupMessages.filter(
		(message) =>
			message.type === "media" ||
			message.type === "doc" ||
			message.type === "link" ||
			message.type === "location" ||
			message.type === "audio" ||
			message.type === "video" ||
			message.type === "gif" ||
			message.type === "sticker" ||
			message.type === "file" ||
			message.type === "image"
	).length;
	console.log("Media Count", mediaCount);

	// Get the Starred Messages Count
	var starredCount = groupMessages.filter(
		(message) => message.isStarred
	).length;
	console.log("Starred Count", starredCount);

	var adminId = groupData.dataChats.element.selectedChatData.createdById;

	var groupMembersList = ``;
	var addMembersDesign = ``;
	
	if (localStorage.getItem("plainUserId") == adminId) {
		addMembersDesign = `<div class="group-chat__member addMembers" data-action="addMembers">
					<div class="group-chat__member-left">
						<div class="group-chat__member-avatar group-chat__member-avatar--add">
							${icons.newChatIcon}
						</div>
						<span>Add Members</span>
					</div>
				</div>`;
	}

	// Separate the admin from the rest of the members
	groupMembers.forEach((member) => {
		// Dont add removed users
		
		if (member.isRemoved) {
			return;
		}
		groupMembersCount++;
		if (member.userInfo == null || member.userInfo.uid == null && member.userInfo.Uid == null) {
			console.log("Member userInfo is null", member);
			return;
		}
		
		if (member.userInfo.uid == adminId || member.userInfo.Uid == adminId) {
			// Admin card
			groupMembersList =
				`<div class="group-chat__member users" data-user-id="${member.userInfo.uid ? member.userInfo.uid : member.userInfo.Uid}"
					data-profile-pic="${member.userInfo.profilePic ? member.userInfo.profilePic : member.userInfo.PhotoURL}" data-name="${
						member.userInfo.displayName ? member.userInfo.displayName : member.userInfo.DisplayName
					}" data-action="openDialogUsers">
					<div class="group-chat__member-left">
						<img class="group-chat__member-avatar group-chat__member-avatar--color1" src="${returnImagePath(
							member.userInfo.profilePic
						)}" alt="User Avatar" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
						<span>${member.userInfo.displayName}</span>
					</div>
					<div class="group-chat__member-right">
						<span class="group-chat__member-status">Admin</span>
						${icons.rightArrow}
					</div>
				</div>` + groupMembersList; // Prepend admin Card
		}
		else {
			// Member card
			groupMembersList += `<div class="group-chat__member users" data-user-id="${
				member.userInfo.uid ? member.userInfo.uid : member.userInfo.Uid
			}" data-profile-pic="${member.userInfo.profilePic ? member.userInfo.profilePic : member.userInfo.PhotoURL}" data-name="${
				member.userInfo.displayName ? member.userInfo.displayName : member.userInfo.DisplayName
			}" data-action="openDialogUsers">
					<div class="group-chat__member-left">
						<img class="group-chat__member-avatar group-chat__member-avatar--color1" src="${returnImagePath(
							member.userInfo.profilePic ? member.userInfo.profilePic : member.userInfo.PhotoURL
						)}" alt="User Avatar" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
						<span>${member.userInfo.displayName ? member.userInfo.displayName : member.userInfo.DisplayName }</span>
					</div>
					<div class="group-chat__member-right">
						<span class="group-chat__member-status">Member</span>
						${icons.rightArrow}
					</div>
				</div>`;
		}
	});

	function renderAvatarGroup(members) {
		// Limit to a maximum of 5 avatars
		var maxAvatars = 10;
		var avatars = members.slice(0, maxAvatars).map((member, index) => {
			var imagePath = returnImagePath(member.userInfo.profilePic);
			return `
				<img class="group-chat__avatar group-chat__avatar--position-${index + 1}" 
					 src="${imagePath}" 
					 onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'" 
					 alt="User Avatar">
			`;
		});

		return `
			<div class="group-chat__avatar-group">
				${avatars.join("")}
			</div>
		`;
	}

	var avatarGroupHtml = renderAvatarGroup(groupMembers);

	var groupDrill = `<div class="group-chat">
		<!-- Header -->
		<div class="group-chat__top-bar">
			<button class="contact-info__back-button">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M15 18l-6-6 6-6"/>
				</svg>
			</button>
			<span class="group-chat__edit-btn">Edit</span>
		</div>
		
		<!-- Group Info -->
		<div class="group-chat__info" style="background-image: url(${returnImagePath(
			groupImage
		)})">
			${avatarGroupHtml}
			<h1 class="group-chat__title">${groupName}</h1>
			<p class="group-chat__subtitle">${groupMembersCount} Members</p>
		</div>
		
		<!-- Action Buttons -->
		<div class="group-chat__actions hidden">
			<div class="group-chat__action">
				<div class="group-chat__action-icon">
					<i class="fas fa-phone"></i>
				</div>
				<span class="group-chat__action-label">Audio</span>
			</div>
			<div class="group-chat__action">
				<div class="group-chat__action-icon">
					<i class="fas fa-video"></i>
				</div>
				<span class="group-chat__action-label">Video</span>
			</div>
			<div class="group-chat__action">
				<div class="group-chat__action-icon">
					<i class="fas fa-search"></i>
				</div>
				<span class="group-chat__action-label">Search</span>
			</div>
		</div>
		
		<!-- Status Message -->
		<div class="group-chat__status hidden">
			<p class="group-chat__status-text">My name is the Lord when I lay my vengeance upon thee ✨</p>
			<p class="group-chat__status-date">18 Mar 1993</p>
		</div>
		
		<!-- Menu Options -->
		<div class="group-chat__menu">
			<div class="group-chat__menu-item" data-action="media">
				<div class="group-chat__menu-left">
					<i class="fas fa-image group-chat__menu-icon"></i>
					<span>Media and Docs</span>
				</div>
				<div class="group-chat__menu-right">
					<span class="group-chat__menu-count">${mediaCount}</span>
					${icons.rightArrow}
				</div>
			</div>
			
			<div class="group-chat__menu-item" data-action="starred">
				<div class="group-chat__menu-left">
					<i class="fas fa-star group-chat__menu-icon"></i>
					<span>Starred Messages</span>
				</div>
				<div class="group-chat__menu-right">
					<span class="group-chat__menu-count">${starredCount}</span>
					${icons.rightArrow}
				</div>
			</div>
			
			<div class="group-chat__menu-item hidden" data-action="wallpaper">
				<div class="group-chat__menu-left">
					<i class="fas fa-palette group-chat__menu-icon"></i>
					<span>Wallpaper</span>
				</div>
				<div class="group-chat__menu-right">
					${icons.rightArrow}
				</div>
			</div>
			
			<div class="group-chat__menu-item hidden">
				<div class="group-chat__menu-left">
					<i class="fas fa-user group-chat__menu-icon"></i>
					<span>Contact Details</span>
				</div>
				<div class="group-chat__menu-right">
					<i class="fas fa-chevron-right"></i>
				</div>
			</div>
			
			<div class="group-chat__menu-item hidden">
				<div class="group-chat__menu-left">
					<i class="fas fa-users group-chat__menu-icon"></i>
					<div>
						<div>Add group to a community</div>
						<div class="group-chat__menu-description">Bring members together in topic based groups</div>
					</div>
				</div>
				<div class="group-chat__menu-right">
					${icons.rightArrow}
				</div>
			</div>
		</div>
		
		<!-- Members Section -->
		<div class="group-chat__members">
			<div class="group-chat__members-header">
				<h2>${groupMembersCount} Members</h2>
			</div>
			<div class="group-chat__members-list">
				<!-- Add Members Button -->
				${addMembersDesign}
				
				<!-- Invite Link -->
				<div class="group-chat__member hidden" data-action="inviteLink">
					<div class="group-chat__member-left">
						<div class="group-chat__member-avatar group-chat__member-avatar--invite">
							${icons.inviteIcon}
						</div>
						<span>Invite to group via link</span>
					</div>
				</div>
				
				<!-- Member List -->
				${groupMembersList}
			</div>
		</div>
		
		<!-- Footer Options -->
		<div class="group-chat__footer">
			<div class="group-chat__footer-card">
				<div class="group-chat__footer-item  hidden" data-action="share">Share Contact</div>
				<div class="group-chat__footer-item hidden" data-action="export">Export Chat</div>
				<div class="group-chat__footer-item  hidden group-chat__footer-item--danger" data-action="clear">Clear Chat</div>
			</div>
			
			<div class="group-chat__footer-card">
				<div class="group-chat__footer-item group-chat__footer-item--danger" data-action="leave">Leave Group</div>
				<div class="group-chat__footer-item group-chat__footer-item--danger hidden" data-action="reportGroup">Report Group</div>
			</div>
		</div>
	</div>`;

	jQuery("#main").hide();
	// Append the design to the body
	jQuery("#singleChat").css("display", "none").after(groupDrill);
}

function dmChatDrillDown(dmData) {
	console.log("DmData", dmData);

	var userDp = ( dmData.renderType == 'new-dm' || dmData.renderType == 'dm-init' ) ? dmData.dataMembers.userInfo.profilePic  : dmData.dataMembers.chatImage;
	var userName = ( dmData.renderType == 'new-dm' || dmData.renderType == 'dm-init' )  ? dmData.dataMembers.userInfo.displayName  : dmData.dataMembers.chatName;
	var userId = ( dmData.renderType == 'new-dm' || dmData.renderType == 'dm-init' )  ? dmData.dataMembers.userInfo.from_uid  : dmData.dataMembers.userId;
	var mediaCount = 0;
	var starredCount = 0;
	// Fetch the Cover Image and Bio of the user

	// Check if even 1 message is there
	if (dmData.dataChats.messages && dmData.dataChats.messages.length != 0) {
		// Get the Count of Media , Docs or Links
		mediaCount = dmData.dataChats.messages.filter(
			(message) =>
				message.type === "media" ||
				message.type === "doc" ||
				message.type === "link" ||
				message.type === "location" ||
				message.type === "audio" ||
				message.type === "video" ||
				message.type === "gif" ||
				message.type === "sticker" ||
				message.type === "file" ||
				message.type === "image"
		).length;
		console.log("Media Count", mediaCount);

		// Get the Starred Messages Count
		starredCount = dmData.dataChats.messages.filter(
			(message) => message.isStarred
		).length;
		console.log("Starred Count", starredCount);
		
	}
	

	var dmDesign = `<div class="contact-info">
		<!-- Header -->
		<header class="contact-info__header">
			<button class="contact-info__back-button">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M15 18l-6-6 6-6"/>
				</svg>
			</button>
			<h1 class="contact-info__title">Contact Info</h1>
			<button class="contact-info__edit-button invisible">Edit</button>
		</header>

		<!-- Profile Section -->
		<div class="contact-info__profile">
			<div class="header__container">
				<img src="${returnImagePath(userDp)}" alt="Profile picture" class="contact-info__profile-pic" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
				<div class="name__redirect-container"> 
					<h2 class="contact-info__profile-name">${userName}</h2>
					<div class="redirect-dm">↗</div>
				</div>
				<p class="contact-info__profile-phone hidden">+1 323 555 6666</p>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="contact-info__actions hidden">
			<div class="contact-info__action-item">
				<button class="contact-info__action-button">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
					</svg>
				</button>
				<span class="contact-info__action-label">Audio</span>
			</div>
			<div class="contact-info__action-item">
				<button class="contact-info__action-button">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polygon points="23 7 16 12 23 17 23 7"/>
						<rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
					</svg>
				</button>
				<span class="contact-info__action-label">Video</span>
			</div>
			<div class="contact-info__action-item">
				<button class="contact-info__action-button">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"/>
						<line x1="21" y1="21" x2="16.65" y2="16.65"/>
					</svg>
				</button>
				<span class="contact-info__action-label">Search</span>
			</div>
		</div>

		<!-- Status -->
		<div class="contact-info__status-box hidden">
			<p class="contact-info__status-text">My name is the Lord when I lay my vengeance upon thee 👀</p>
			<p class="contact-info__status-date">18 Mar 1993</p>
		</div>

		<!-- List Items -->
		<div class="contact-info__list-container">
			<div class="contact-info__list-item yellow_grad" data-action="media">
				<div class="contact-info__list-item-left">
					<svg class="contact-info__list-item-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
						<circle cx="8.5" cy="8.5" r="1.5"/>
						<polyline points="21 15 16 10 5 21"/>
					</svg>
					<span class="contact-info__list-item-text">Media and Docs</span>
				</div>
				<div class="contact-info__list-item-right">
					<span class="contact-info__list-item-count">${mediaCount}</span>
					<svg class="contact-info__chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#767779" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="9 18 15 12 9 6"/>
					</svg>
				</div>
			</div>
			<div class="contact-info__list-item yellow_grad" data-action="starred">
				<div class="contact-info__list-item-left">
					<svg class="contact-info__list-item-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
					</svg>
					<span class="contact-info__list-item-text">Starred Messages</span>
				</div>
				<div class="contact-info__list-item-right">
					<span class="contact-info__list-item-count">${starredCount}</span>
					<svg class="contact-info__chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#767779" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="9 18 15 12 9 6"/>
					</svg>
				</div>
			</div>
		</div>

		<div class="contact-info__list-container hidden">
			<div class="contact-info__list-item yellow_grad" data-action="wallpaper">
				<div class="contact-info__list-item-left">
					<svg class="contact-info__list-item-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="13.5" cy="6.5" r="2.5"/>
						<circle cx="19" cy="17" r="2"/>
						<circle cx="6" cy="12" r="2.5"/>
						<circle cx="10" cy="19" r="2"/>
					</svg>
					<span class="contact-info__list-item-text">Wallpaper</span>
				</div>
				<svg class="contact-info__chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#767779" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 18 15 12 9 6"/>
				</svg>
			</div>
			<div class="contact-info__list-item hidden">
				<div class="contact-info__list-item-left">
					<svg class="contact-info__list-item-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
						<circle cx="12" cy="7" r="4"/>
					</svg>
					<span class="contact-info__list-item-text">Contact Details</span>
				</div>
				<svg class="contact-info__chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#767779" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 18 15 12 9 6"/>
				</svg>
			</div>
		</div>

		<!-- Groups -->
		<div class="contact-info__section-title hidden">
			<p>No Groups in Common</p>
		</div>

		<div class="contact-info__list-container">
			<div class="contact-info__list-item hidden" data-action="createGroup">
				<div class="contact-info__list-item-left">
					<svg class="contact-info__list-item-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="12" y1="5" x2="12" y2="19"/>
						<line x1="5" y1="12" x2="19" y2="12"/>
					</svg>
					<span class="contact-info__list-item-text">Create Group with ${userName}</span>
				</div>
			</div>
			<div class="contact-info__list-item hidden">
				<div class="contact-info__list-item-left">
					<div class="contact-info__group-avatar">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#767779" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
							<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
						</svg>
					</div>
					<div class="contact-info__group-info">
						<p class="contact-info__group-name">THEY from LA <span class="contact-info__edit-icon">✏️</span></p>
						<p class="contact-info__group-members">Bob, Eddy, Jules, Paul, Scott, Sergio, Tony, You</p>
					</div>
				</div>
				<svg class="contact-info__chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#767779" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 18 15 12 9 6"/>
				</svg>
			</div>
		</div>

		<!-- Bottom Actions -->
		<div class="contact-info__bottom-actions">
			<div class="contact-info__list-container">
				<div class="contact-info__list-item hidden" data-action="share">
					<div class="contact-info__list-item-left">
						<svg class="contact-info__list-item-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="18" cy="5" r="3"/>
							<circle cx="6" cy="12" r="3"/>
							<circle cx="18" cy="19" r="3"/>
							<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
							<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
						</svg>
						<span class="contact-info__list-item-text">Share Contact</span>
					</div>
				</div>
				<div class="contact-info__list-item hidden">
					<div class="contact-info__list-item-left">
						<svg class="contact-info__list-item-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
							<polyline points="7 10 12 15 17 10"/>
							<line x1="12" y1="15" x2="12" y2="3"/>
						</svg>
						<span class="contact-info__list-item-text">Export Chat</span>
					</div>
				</div>
				<div class="contact-info__list-item hidden" data-action="clear">
					<div class="contact-info__list-item-left contact-info__list-item-left--danger">
						<svg class="contact-info__list-item-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e90039" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"/>
							<line x1="15" y1="9" x2="9" y2="15"/>
							<line x1="9" y1="9" x2="15" y2="15"/>
						</svg>
						<span class="contact-info__list-item-text">Clear Chat</span>
					</div>
				</div>
			</div>

			<div class="contact-info__list-container">
				<div class="contact-info__list-item contact-info__list-item--danger" data-action="block">
					<span class="contact-info__list-item-text">Block ${userName}</span>
				</div>
				<div class="contact-info__list-item contact-info__list-item--danger hidden" data-action="report">
					<span class="contact-info__list-item-text">Report ${userName}</span>
				</div>
			</div>
		</div>
	</div>`;

	jQuery("#main").hide();
	// Append the design to the body
	jQuery("#singleChat").css("display", "none").after(dmDesign);
	jQuery('.contact-info').data('dmData', dmData);
}

// Handle browser history for web navigation
function navigateToChat(chatId) {
	// Push a new state when navigating to a chat
	history.pushState({ chatId: chatId }, "", window.location.pathname);
}

// Handles the Card of the Main page
function createChatCard(chatType, displayPicture, chatName, messageTime, last_message, isRequested) {
	var isRequested = isRequested == 0 ? "requested" : "";
	return `
		<div class="chats__item ${chatType} ${isRequested}">
			<img src="${returnImagePath(displayPicture)}" alt="" class="chats__avatar" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'" />
			<div class="chats__content">
				<div class="chats__content-header">
					<h3 class="chats__name">${chatName}</h3>
					<span class="chats__time">${messageTime}</span>
				</div>
				<div class="chat__content-message">
					<p class="chats__message">${formatMessage(last_message)}</p>
					<div class="message__unread hidden">0</div>
				</div>
			</div>
		</div>
	`;
}

function addChatData(chat, childPlace) {
	var selector = ".chats__item:last-child";
	if (childPlace) {
		selector = ".chats__item:first-child";
	}
	
	jQuery(selector)
				.data("chatId", chat.chatId)
				.data("selectedChatData", chat);
			if (chat.chatType === "personal" && chat.userInfo && chat.userInfo.from_uid) {
				jQuery(selector).data(
					"userId",
					chat.userInfo.from_uid
				);
			}
			else {
				//console.log("Chat userInfo is null", chat);
			}
}

// Add this JavaScript to show a toast message
function showToast(message) {
	const toastContainer = document.getElementById('toast-container');
	const toast = document.createElement('div');
	toast.className = 'toast';
	toast.textContent = message;
	toastContainer.appendChild(toast);

	// Show the toast
	setTimeout(() => {
		toast.classList.add('show');
	}, 100);

	// Hide the toast after 3 seconds
	setTimeout(() => {
		toast.classList.remove('show');
		setTimeout(() => {
			toastContainer.removeChild(toast);
		}, 500);
	}, 3000);
}

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

function isMobile() {
	if (jQuery(window).width() <= 768) {
		return true;
	}
	else {
		return false;
	}
}

function autplayVideoForOneSec(selector) {
	if (isAndroid() || isIOS()) {
		var videos = document.querySelectorAll(selector);
		videos.forEach((video) => {
			
			video.muted = true; // Mute the video
			video.play()
				.then(() => {
					// Pause the video after 1 second
					setTimeout(() => {
						video.pause();
					}, 100); // 100ms = 0.1 second
				})
				.catch((error) => {
					console.error("Error playing video:", error);
				});
		});
	}
	
}

function showLoader(loaderUrl = '/view/assets/img/chatOpen.json') {
	// Show the loading container
	const loadingContainer = document.querySelector('.global__loading');
	if (loadingContainer) {
		loadingContainer.style.display = 'block';
	}
	
	// Load the Lottie animation with the provided URL
	if (typeof lottie !== 'undefined') {
		const lottieContainer = document.getElementById('lottie__loading');
		if (lottieContainer) {
			// Store the animation instance for later cleanup
			lottieContainer._lottie = lottie.loadAnimation({
				container: lottieContainer,
				renderer: 'svg',
				loop: true,
				autoplay: true,
				path: loaderUrl
			});
		}
	}
}

function hideLoader() {
	// Hide the loading container
	const loadingContainer = document.querySelector('.global__loading');
	if (loadingContainer) {
		loadingContainer.style.display = 'none';
	}
	
	// Stop and destroy the Lottie animation to reduce load
	const lottieContainer = document.getElementById('lottie__loading');
	if (lottieContainer && lottieContainer._lottie) {
		lottieContainer._lottie.stop();
		lottieContainer._lottie.destroy();
		lottieContainer._lottie = null;
	}
}

function fbEvent(event, data) {
	// if (window.location.href.includes('localhost') || window.location.href.includes('dev.')) {
	// 	return;
	// }
    let trackEvent = '';
    let params = {};

	switch (event) {
		
		case 'ChatAI':
			trackEvent = 'Talk to AI';
			params = {
				content_name: 'Talk to AI',
				content_category: 'Chat',
			};
			break;
        default:
            console.warn(`Unhandled event type: ${event}`);
            return; // Exit the function if the event type is unhandled
    }

    // Call fbq with the prepared parameters
    fbq('trackCustom', trackEvent, params);
}

// Function to show prefilled AI messages
function showAIPrefilledMessages() {
	const prefilledMessages = [
		{
			icon: "✈️",
			title: "Plan a Trip",
			message: "Help me plan a 4-day trip to Thailand with a budget of ₹25,000"
		},
		{
			icon: "🏨",
			title: "Find Hotels",
			message: "Suggest the best hotels in Bangkok for a romantic getaway"
		},
		{
			icon: "🍽️",
			title: "Food Recommendations",
			message: "What are the top 3 must-try local dishes in Mumbai?"
		},
		{
			icon: "🎯",
			title: "Travel Tips",
			message: "Give me travel tips for first-time visitors to Japan"
		},
		{
			icon: "💰",
			title: "Budget Planning",
			message: "How can I travel to Europe on a budget of ₹1,00,000?"
		},
		{
			icon: "🌍",
			title: "Destination Guide",
			message: "Tell me about the top 3 best places to visit in Kerala"
		}
	];

	const prefilledHTML = `
		<div class="ai-prefilled-messages">
			<div class="ai-prefilled-header">
				<h3>What would you like to know?</h3>
				<p>Choose a topic or ask me anything about travel</p>
			</div>
			<div class="ai-prefilled-grid">
				${prefilledMessages.map(msg => `
					<div class="ai-prefilled-card" data-message="${msg.message}">
						<div class="ai-prefilled-icon">${msg.icon}</div>
						<div class="ai-prefilled-content">
							<h4>${msg.title}</h4>
							<p>${msg.message}</p>
						</div>
						<div class="ai-prefilled-arrow">→</div>
					</div>
				`).join('')}
			</div>
		</div>
	`;

	jQuery(".chat__messages").html(prefilledHTML);
}

// Function to handle prefilled message clicks
function handlePrefilledMessageClick(message) {
	// Clear prefilled messages
	jQuery(".ai-prefilled-messages").remove();
	
	// Set the message in input field
	jQuery(".chat__input").val(message);
	
	// Trigger the send button click
	jQuery(".chat__input-send").click();
}

// Function to open image modal
function openImageModal(imageSrc) {
	// Create modal HTML
	const modalHTML = `
		<div class="image-modal-overlay">
			<div class="image-modal">
				<div class="image-modal-header">
					<button class="image-modal-close">&times;</button>
				</div>
				<div class="image-modal-content">
					<img src="${imageSrc}" alt="AI Response Image" class="image-modal-img">
				</div>
			</div>
		</div>
	`;
	
	// Add modal to body
	jQuery("body").append(modalHTML);
	
	// Add close handlers
	jQuery(".image-modal-close, .image-modal-overlay").on("click", function(e) {
		if (e.target === this) {
			jQuery(".image-modal-overlay").remove();
		}
	});
	
	// Close on escape key
	jQuery(document).on("keydown.imageModal", function(e) {
		if (e.key === "Escape") {
			jQuery(".image-modal-overlay").remove();
			jQuery(document).off("keydown.imageModal");
		}
	});
}

// Function to create image slider
function createImageSlider(images) {
	if (!images || images.length === 0) return '';
	
	const sliderId = 'slider_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
	
	const imagesHTML = images.map((img, index) => 
		`<div class="slider-image-item ${index === 0 ? 'active' : ''}">
			<img src="${img}" alt="AI Response Image" class="slider-image" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
		</div>`
	).join('');
	
	const dotsHTML = images.map((_, index) => 
		`<span class="slider-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>`
	).join('');
	
	return `
		<div class="ai-image-slider" id="${sliderId}">
			<div class="slider-container">
				<div class="slider-track">
					${imagesHTML}
				</div>
				<button class="slider-nav slider-prev" onclick="slideImage('${sliderId}', -1)">‹</button>
				<button class="slider-nav slider-next" onclick="slideImage('${sliderId}', 1)">›</button>
			</div>
			<div class="slider-dots">
				${dotsHTML}
			</div>
		</div>
	`;
}

// Global function for slider navigation
function slideImage(sliderId, direction) {
	const slider = document.getElementById(sliderId);
	if (!slider) return;
	
	const track = slider.querySelector('.slider-track');
	const items = slider.querySelectorAll('.slider-image-item');
	const dots = slider.querySelectorAll('.slider-dot');
	
	let currentIndex = 0;
	items.forEach((item, index) => {
		if (item.classList.contains('active')) {
			currentIndex = index;
		}
	});
	
	let newIndex = currentIndex + direction;
	if (newIndex < 0) newIndex = items.length - 1;
	if (newIndex >= items.length) newIndex = 0;
	
	slideToImage(sliderId, newIndex);
}

// Function to slide to specific image
function slideToImage(sliderId, index) {
	const slider = document.getElementById(sliderId);
	if (!slider) return;
	
	const items = slider.querySelectorAll('.slider-image-item');
	const dots = slider.querySelectorAll('.slider-dot');
	
	// Remove active class from all items and dots
	items.forEach(item => item.classList.remove('active'));
	dots.forEach(dot => dot.classList.remove('active'));
	
	// Add active class to current item and dot
	if (items[index]) items[index].classList.add('active');
	if (dots[index]) dots[index].classList.add('active');
}