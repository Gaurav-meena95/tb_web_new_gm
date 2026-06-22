/**
 * Chat Interface Functions
 *
 * This file contains functions for creating and managing chat interface overlays
 * including dialog boxes and tabbed interfaces.
 *
 * Using BEM naming convention for CSS classes:
 * - Block: Main component (e.g., overlay, dialog, tabs)
 * - Element: Parts of blocks (e.g., overlay__header, dialog__content)
 * - Modifier: Variations (e.g., dialog--warning, tabs__trigger--active)
 */





/**
 * Creates and appends a chat request dialog to the document body
 */
function appendChatRequestDialog(orgDataChat, orgDataMembers) {
	// Create the dialog overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	overlay.id = "chatRequestDialog";

	var userName, userAvatar, userId;
	userName = orgDataMembers.chatName;
	userAvatar = orgDataMembers.chatImage;
	userId = orgDataMembers.selectedChatData
		? orgDataMembers.selectedChatData.userInfo.from_uid
		: null;

	if (userId == null) {
		return;
	}

	// Create the dialog content
	overlay.innerHTML = `
	  <div class="dialog dialog--request">
		<div class="dialog__header">
		  <h2 class="dialog__title">
			<svg class="dialog__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
			  <line x1="12" y1="9" x2="12" y2="13"></line>
			  <line x1="12" y1="17" x2="12.01" y2="17"></line>
			</svg>
			Chat Request
		  </h2>
		  <button class="dialog__close" data-action="close">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <line x1="18" y1="6" x2="6" y2="18"></line>
			  <line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		  </button>
		</div>
		<div class="dialog__body">
		  <div class="dialog__user">
			<div class="dialog__avatar">
			  <img src="${returnImagePath(
					userAvatar
				)}" alt="User Avatar" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
			</div>
			<div class="dialog__user-name">${userName}</div>
		  </div>
		  <p class="dialog__message">${userName} wants to chat with you</p>
		</div>
		<div class="dialog__footer">
		  <button class="dialog__button dialog__button--secondary" data-action="decline">Decline</button>
		  <button class="dialog__button dialog__button--primary" data-action="accept">Accept</button>
		</div>
	  </div>
	`;

	// Append to body
	document.body.appendChild(overlay);

	// Add event listeners
	setupDialogEventListeners(overlay);

	// Show the dialog with animation
	setTimeout(() => overlay.classList.add("overlay--active"), 10);
}

function appendGroupUsersDialog(orgDataChat, orgDataMembers) {
	// Create the dialog overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	overlay.id = "groupUsersDialog";

	var groupName = orgDataChat.element.chatName;
	var groupMembers = orgDataMembers.groupMembers;

	var users = groupMembers.filter((user) => {
		return user.isRequested == 0;
	});

	if (users.length == 0) {
		console.log("No users to show");
		return;
	}
	console.log(users);

	// Create the dialog content
	overlay.innerHTML = `
	  <div class="dialog dialog--request">
		<div class="dialog__header">
		  <h2 class="dialog__title">
			Group Join Requests
		  </h2>
		  <button class="dialog__close" data-action="close">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <line x1="18" y1="6" x2="6" y2="18"></line>
			  <line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		  </button>
		</div>
		<div class="dialog__body">
		  <p class="dialog__message">The following users want to join <strong>${groupName}</strong></p>
		  
		  <div class="dialog__users-list">
			${users
				.map(
					(user) => `
			  <div class="dialog__user-item" data-user-id="${user.uid}">
				<div class="dialog__user">
				  <div class="dialog__avatar">
					<img src="${returnImagePath(
						user.userInfo.profilePic
							? user.userInfo.profilePic
							: user.userInfo.PhotoURL
					)}" alt="${
						user.userInfo.displayName
					}'s Avatar" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
				  </div>
				  <div class="dialog__user-name">${
						user.userInfo.displayName
							? user.userInfo.displayName
							: user.userInfo.DisplayName
					}</div>
				</div>
				<div class="dialog__user-actions">
				  <button class="dialog__user-button dialog__user-button--accept" data-action="accept-user" data-user-id="${
						user.uid
					}">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					  <polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				  </button>
				  <button class="dialog__user-button dialog__user-button--reject" data-action="reject-user" data-user-id="${
						user.uid
					}">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
					  <circle cx="8.5" cy="7" r="4"></circle>
					  <line x1="18" y1="8" x2="23" y2="13"></line>
					  <line x1="23" y1="8" x2="18" y2="13"></line>
					</svg>
				  </button>
				</div>
			  </div>
			`
				)
				.join("")}
		  </div>
		</div>
		<div class="dialog__footer hidden">
		  <button class="dialog__button dialog__button--secondary" data-action="reject-all">Reject All</button>
		  <button class="dialog__button dialog__button--primary" data-action="accept-all">Accept All</button>
		</div>
	  </div>
	`;

	// Append to body
	document.body.appendChild(overlay);

	// Add event listeners
	setupGroupDialogEventListeners(overlay);

	// Show the dialog with animation
	setTimeout(() => overlay.classList.add("overlay--active"), 10);
}

function setupGroupDialogEventListeners(overlay) {
	// Close button
	overlay
		.querySelector('[data-action="close"]')
		.addEventListener("click", () => {
			closeDialog(overlay);
		});

	// Accept all button
	overlay
		.querySelector('[data-action="accept-all"]')
		.addEventListener("click", () => {
			// Implement your accept all logic here
			console.log("Accept all users");
			closeDialog(overlay);
		});

	// Reject all button
	overlay
		.querySelector('[data-action="reject-all"]')
		.addEventListener("click", () => {
			// Implement your reject all logic here
			console.log("Reject all users");
			closeDialog(overlay);
		});

	// Individual accept buttons
	overlay.querySelectorAll('[data-action="accept-user"]').forEach((button) => {
		button.addEventListener("click", () => {
			var userId = button.getAttribute("data-user-id");
			// Implement your accept user logic here
			console.log("Accept user:", userId);
			var dataMembers = jQuery(".chat__header").data("dataMembers");

			var actionType = "accepted";
			var groupId = dataMembers.chatId;
			var userName = getProfileData();
			userName = userName.name;

			console.log(
				`${
					actionType.charAt(0).toUpperCase() + actionType.slice(1)
				} Button Clicked`,
				groupId,
				userId
			);
			updateIsRequested(groupId, userId, actionType, userName);

			// Optionally remove the user from the list
			var userItem = overlay.querySelector(
				`.dialog__user-item[data-user-id="${userId}"]`
			);
			if (userItem) userItem.remove();

			// If no users left, close the dialog
			if (overlay.querySelectorAll(".dialog__user-item").length === 0) {
				closeDialog(overlay);
			}
		});
	});

	// Individual reject buttons
	overlay.querySelectorAll('[data-action="reject-user"]').forEach((button) => {
		button.addEventListener("click", () => {
			var userId = button.getAttribute("data-user-id");
			// Implement your reject user logic here
			console.log("Reject user:", userId);

			var dataMembers = jQuery(".chat__header").data("dataMembers");

			var actionType = "declined";
			var groupId = dataMembers.chatId;
			var userId = jQuery(this).attr("data-user-id");
			var userName = getProfileData();
			userName = userName.name;

			console.log(
				`${
					actionType.charAt(0).toUpperCase() + actionType.slice(1)
				} Button Clicked`,
				groupId,
				userId
			);
			updateIsRequested(groupId, userId, actionType, userName);

			// Optionally remove the user from the list
			var userItem = overlay.querySelector(
				`.dialog__user-item[data-user-id="${userId}"]`
			);
			if (userItem) userItem.remove();

			// If no users left, close the dialog
			if (overlay.querySelectorAll(".dialog__user-item").length === 0) {
				closeDialog(overlay);
			}
		});
	});
}

// function closeDialog(overlay) {
// 	overlay.classList.remove("overlay--active");
// 	// Remove the dialog after animation completes
// 	setTimeout(() => {
// 	  document.body.removeChild(overlay);
// 	}, 300);
// }

/**
 * Creates and appends a clear chat confirmation dialog to the document body
 */
function appendClearChatDialog() {
	// Create the dialog overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	overlay.id = "clearChatDialog";

	// Create the dialog content
	overlay.innerHTML = `
	  <div class="dialog dialog--warning">
		<div class="dialog__header">
		  <h2 class="dialog__title">
			<svg class="dialog__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <polyline points="3 6 5 6 21 6"></polyline>
			  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
			  <line x1="10" y1="11" x2="10" y2="17"></line>
			  <line x1="14" y1="11" x2="14" y2="17"></line>
			</svg>
			Clear Chat
		  </h2>
		  <button class="dialog__close" data-action="close">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <line x1="18" y1="6" x2="6" y2="18"></line>
			  <line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		  </button>
		</div>
		<div class="dialog__body">
		  <p class="dialog__message">Are you sure you want to clear all messages in this chat? This action cannot be undone.</p>
		</div>
		<div class="dialog__footer">
		  <button class="dialog__button dialog__button--secondary" data-action="cancel">Cancel</button>
		  <button class="dialog__button dialog__button--danger" data-action="clear">Clear</button>
		</div>
	  </div>
	`;

	// Append to body
	document.body.appendChild(overlay);

	// Add event listeners
	setupDialogEventListeners(overlay);

	// Show the dialog with animation
	setTimeout(() => overlay.classList.add("overlay--active"), 10);
}

/**
 * Creates and appends a Leave Group chat confirmation dialog to the document body
 */
function appendLeaveChatDialog() {
	// Create the dialog overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	overlay.id = "leaveGroupChatDialog";

	// Create the dialog content
	overlay.innerHTML = `
	  <div class="dialog dialog--warning">
		<div class="dialog__header">
		  <h2 class="dialog__title">
			<svg class="dialog__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <polyline points="3 6 5 6 21 6"></polyline>
			  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
			  <line x1="10" y1="11" x2="10" y2="17"></line>
			  <line x1="14" y1="11" x2="14" y2="17"></line>
			</svg>
			Exit Group Chat
		  </h2>
		  <button class="dialog__close" data-action="close">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <line x1="18" y1="6" x2="6" y2="18"></line>
			  <line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		  </button>
		</div>
		<div class="dialog__body">
		  <p class="dialog__message">Are you sure you want to exit this Group chat? This action cannot be undone.</p>
		</div>
		<div class="dialog__footer">
		  <button class="dialog__button dialog__button--secondary" data-action="cancel">Cancel</button>
		  <button class="dialog__button dialog__button--danger" data-action="leaveGroup">Exit Group</button>
		</div>
	  </div>
	`;

	// Append to body
	document.body.appendChild(overlay);

	// Add event listeners
	setupDialogEventListeners(overlay);

	// Show the dialog with animation
	setTimeout(() => overlay.classList.add("overlay--active"), 10);
}

/**
 * Creates and appends a block user confirmation dialog to the document body
 */
function appendBlockUserDialog() {
	// Create the dialog overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	overlay.id = "blockUserDialog";

	var dmData = jQuery(".contact-info").data("dmData");
	var userName = dmData.dataMembers.chatName;
	var userAvatar = dmData.dataMembers.chatImage;

	// Create the dialog content
	overlay.innerHTML = `
	  <div class="dialog dialog--danger">
		<div class="dialog__header">
		  <h2 class="dialog__title">
			<svg class="dialog__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
			  <circle cx="8.5" cy="7" r="4"></circle>
			  <line x1="18" y1="8" x2="23" y2="13"></line>
			  <line x1="23" y1="8" x2="18" y2="13"></line>
			</svg>
			Block User
		  </h2>
		  <button class="dialog__close" data-action="close">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <line x1="18" y1="6" x2="6" y2="18"></line>
			  <line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		  </button>
		</div>
		<div class="dialog__body">
		  <div class="dialog__user">
			<div class="dialog__avatar">
			  <img src="${returnImagePath(
					userAvatar
				)}" alt="User Avatar" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
			</div>
			<div class="dialog__user-name">${userName}</div>
		  </div>
		  <p class="dialog__message">If you block this user, they won't be able to send you messages or see your status.</p>
		</div>
		<div class="dialog__footer">
		  <button class="dialog__button dialog__button--secondary" data-action="cancel">Cancel</button>
		  <button class="dialog__button dialog__button--danger" data-action="block">Block</button>
		</div>
	  </div>
	`;

	// Append to body
	document.body.appendChild(overlay);

	// Add event listeners
	setupDialogEventListeners(overlay);

	// Show the dialog with animation
	setTimeout(() => overlay.classList.add("overlay--active"), 10);
}

/**
 * Creates and appends a report user dialog to the document body
 */
function appendReportUserDialog() {
	// Create the dialog overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	overlay.id = "reportUserDialog";

	var dmData = jQuery(".contact-info").data("dmData");
	var userName = dmData.dataMembers.chatName;
	var userAvatar = dmData.dataMembers.chatImage;

	// Create the dialog content
	overlay.innerHTML = `
	  <div class="dialog dialog--report">
		<div class="dialog__header">
		  <h2 class="dialog__title">
			<svg class="dialog__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
			  <line x1="4" y1="22" x2="4" y2="15"></line>
			</svg>
			Report User
		  </h2>
		  <button class="dialog__close" data-action="close">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <line x1="18" y1="6" x2="6" y2="18"></line>
			  <line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		  </button>
		</div>
		<div class="dialog__body">
		  <div class="dialog__user">
			<div class="dialog__avatar">
			  <img src="${returnImagePath(
					userAvatar
				)}" alt="User Avatar"onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
			</div>
			<div class="dialog__user-name">${userName}</div>
		  </div>
		  <p class="dialog__message">Please select a reason for reporting this user:</p>
		  <div class="dialog__radio-group">
			<label class="dialog__radio">
			  <input type="radio" name="report-reason" value="spam">
			  <span class="dialog__radio-text">Spam</span>
			</label>
			<label class="dialog__radio">
			  <input type="radio" name="report-reason" value="inappropriate">
			  <span class="dialog__radio-text">Inappropriate content</span>
			</label>
			<label class="dialog__radio">
			  <input type="radio" name="report-reason" value="harassment">
			  <span class="dialog__radio-text">Harassment</span>
			</label>
			<label class="dialog__radio">
			  <input type="radio" name="report-reason" value="other">
			  <span class="dialog__radio-text">Other</span>
			</label>
		  </div>
		  <textarea class="dialog__textarea" placeholder="Additional details (optional)"></textarea>
		</div>
		<div class="dialog__footer">
		  <button class="dialog__button dialog__button--secondary" data-action="cancel">Cancel</button>
		  <button class="dialog__button dialog__button--danger" data-action="report">Report</button>
		</div>
	  </div>
	`;

	// Append to body
	document.body.appendChild(overlay);

	// Add event listeners
	setupDialogEventListeners(overlay);

	// Show the dialog with animation
	setTimeout(() => overlay.classList.add("overlay--active"), 10);
}

/**
 * Creates and appends a tabbed interface to the specified container
 * @param {string} containerId - The ID of the container to append the tabs to
 */
function appendTabbedInterface(containerId) {
	var dataChats = jQuery(".chat__header").data("dataChats");
	var isGroupChat = jQuery(".chat__header").hasClass("group");
	var container = document.getElementById(containerId) || document.body;

	// Create the tabs container
	var tabsContainer = document.createElement("div");
	tabsContainer.className = "tabs tabs--active";
	tabsContainer.id = "mediaTabs";

	// Render Media Tab
	var mediaTab = isGroupChat ? dataChats.response.messages : dataChats.messages;
	var mediaDiv = ``;
	mediaTab.forEach((msg) => {
		if (msg.type == "media") {
			msg.media.forEach((media) => {
				if (media.mediaType == "image") {
					mediaDiv += `<div class="media-grid__item"><img src="${returnImagePath(
						media.mediaUrl
					)}" alt="Media" class="media-grid__image"></div>`;
				} else {
					mediaDiv += `<div class="media-grid__item"><video controls class="media-grid__video"></video><source src="${returnVideoPath(
						media.mediaUrl
					)}" type="video/mp4"></video></div>`;
				}
			});
		} else if (msg.type == "gif") {
			mediaDiv += `<div class="media-grid__item"><img src="${msg.message}" alt="Media" class="media-grid__image"></div>`;
		}
	});

	// Create the tabs content
	tabsContainer.innerHTML = `
	  <div class="tabs__header">
		<button class="tabs__trigger tabs__trigger--active" data-tab="media">
		  <svg class="tabs__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
			<circle cx="8.5" cy="8.5" r="1.5"></circle>
			<polyline points="21 15 16 10 5 21"></polyline>
		  </svg>
		  Media
		</button>
		<button class="tabs__trigger hidden" data-tab="docs">
		  <svg class="tabs__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
			<polyline points="14 2 14 8 20 8"></polyline>
			<line x1="16" y1="13" x2="8" y2="13"></line>
			<line x1="16" y1="17" x2="8" y2="17"></line>
			<polyline points="10 9 9 9 8 9"></polyline>
		  </svg>
		  Docs
		</button>
		<button class="tabs__trigger hidden" data-tab="links">
		  <svg class="tabs__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
		  </svg>
		  Links
		</button>
	  </div>
	  
	  <div class="tabs__content tabs__content--active" data-tab-content="media">
		<div class="media-grid">
			${mediaDiv}
		  
		</div>
	  </div>
	  
	  <div class="tabs__content" data-tab-content="docs">
		<div class="doc-list">
		  <div class="doc-list__item">
			<svg class="doc-list__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
			  <polyline points="14 2 14 8 20 8"></polyline>
			  <line x1="16" y1="13" x2="8" y2="13"></line>
			  <line x1="16" y1="17" x2="8" y2="17"></line>
			  <polyline points="10 9 9 9 8 9"></polyline>
			</svg>
			<div class="doc-list__info">
			  <div class="doc-list__name">Travel_Itinerary.pdf</div>
			  <div class="doc-list__meta">PDF • 2.3 MB • Apr 10</div>
			</div>
		  </div>
		  <div class="doc-list__item">
			<svg class="doc-list__icon doc-list__icon--green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
			  <polyline points="14 2 14 8 20 8"></polyline>
			  <line x1="16" y1="13" x2="8" y2="13"></line>
			  <line x1="16" y1="17" x2="8" y2="17"></line>
			  <polyline points="10 9 9 9 8 9"></polyline>
			</svg>
			<div class="doc-list__info">
			  <div class="doc-list__name">Budget_Spreadsheet.xlsx</div>
			  <div class="doc-list__meta">Excel • 1.1 MB • Apr 8</div>
			</div>
		  </div>
		</div>
	  </div>
	  
	  <div class="tabs__content" data-tab-content="links">
		<div class="links-list">
		  <div class="links-list__item">
			<svg class="links-list__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
			  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
			</svg>
			<div class="links-list__info">
			  <a href="https://beatravelbuddy.com" class="links-list__link">beatravelbuddy.com</a>
			  <div class="links-list__meta">Shared on Apr 12</div>
			</div>
		  </div>
		  <div class="links-list__item">
			<svg class="links-list__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
			  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
			</svg>
			<div class="links-list__info">
			  <a href="https://maps.google.com" class="links-list__link">maps.google.com</a>
			  <div class="links-list__meta">Shared on Apr 5</div>
			</div>
		  </div>
		</div>
	  </div>
	`;

	// Append to container
	container.appendChild(tabsContainer);

	// Add event listeners
	setupTabsEventListeners(tabsContainer);
	jQuery(".contact-info, .group-chat").css("display", "none");
	navigateToChat("mediaTabs");
}

/**
 * Sets up event listeners for dialog overlays
 * @param {HTMLElement} overlay - The dialog overlay element
 */
function setupDialogEventListeners(overlay) {
	// Close button
	var closeButtons = overlay.querySelectorAll('[data-action="close"]');
	closeButtons.forEach((button) => {
		button.addEventListener("click", () => {
			closeDialog(overlay);
		});
	});

	// Cancel buttons
	var cancelButtons = overlay.querySelectorAll('[data-action="cancel"]');
	cancelButtons.forEach((button) => {
		button.addEventListener("click", () => {
			closeDialog(overlay);
		});
	});

	// Action buttons
	var actionButtons = overlay.querySelectorAll(
		'[data-action]:not([data-action="close"]):not([data-action="cancel"])'
	);
	actionButtons.forEach((button) => {
		button.addEventListener("click", (e) => {
			var action = button.getAttribute("data-action");
			console.log(`Action triggered: ${action}`);
			// Here you would handle the specific action
			var type;
			// For example: if(action === 'accept') { acceptChatRequest(); }
			if (
				action === "accept" ||
				action === "decline" /*|| action === 'block'*/
			) {
				type = action === "accept" ? "accepted" : "rejected";
				var dataMembers = jQuery(".chat__header").data("dataMembers");
				var chatId = dataMembers.chatId;
				var otherUserId = dataMembers.selectedChatData.userInfo.from_uid;
				jsInit(
					"acceptChatRequest",
					{ chatId: chatId, userId: otherUserId, optionType: type },
					{
						action: action,
						chatId: chatId,
						userId: otherUserId,
						optionType: type,
					}
				);
			} else if (action === "block") {
				var dmData = jQuery(".contact-info").data("dmData");

				var chatId = dmData.dataMembers.chatId;
				var userId = dmData.dataMembers.userId;

				jsInit("acceptChatRequest", {
					chatId: chatId,
					userId: userId,
					optionType: "rejected",
				});
			} else if (action === "leaveGroup") {
				var dataMembers = jQuery(".chat__header").data("dataMembers");
				var chatId = dataMembers.chatId;
				timeStamp = Math.floor(Date.now() / 1000);
				payload = {
					groupId: chatId,
					memberIdsToRemove: [localStorage.getItem("plainUserId")],
					timeStamp: timeStamp,
				};

				console.log(payload);
				jsInit("exitUserFromGroup", payload);
			}

			closeDialog(overlay);
		});
	});

	// Close on backdrop click
	overlay.addEventListener("click", (e) => {
		if (e.target === overlay) {
			closeDialog(overlay);
		}
	});

	// Close on ESC key
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			closeDialog(overlay);
		}
	});
}

/**
 * Sets up event listeners for the tabbed interface
 * @param {HTMLElement} toggleButton - The button that toggles the tabs visibility
 * @param {HTMLElement} tabsContainer - The tabs container element
 */
function setupTabsEventListeners(tabsContainer) {
	// Tab switching
	var tabTriggers = tabsContainer.querySelectorAll(".tabs__trigger");
	tabTriggers.forEach((trigger) => {
		trigger.addEventListener("click", () => {
			// Update active trigger
			tabTriggers.forEach((t) => t.classList.remove("tabs__trigger--active"));
			trigger.classList.add("tabs__trigger--active");

			// Update active content
			var tabId = trigger.getAttribute("data-tab");
			var tabContents = tabsContainer.querySelectorAll(".tabs__content");
			tabContents.forEach((content) => {
				content.classList.remove("tabs__content--active");
				if (content.getAttribute("data-tab-content") === tabId) {
					content.classList.add("tabs__content--active");
				}
			});
		});
	});
}

/**
 * Closes a dialog overlay with animation
 * @param {HTMLElement} overlay - The dialog overlay element to close
 */
function closeDialog(overlay) {
	overlay.classList.remove("overlay--active");

	// Remove from DOM after animation completes
	setTimeout(() => {
		if (overlay && overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
	}, 300); // Match this with the CSS transition duration
}

function showStarredMessages() {
	// Create the overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	overlay.id = "starredMessagesOverlay";
	var dataChats = jQuery(".chat__header").data("dataChats");
	var starredMessagesHtml = ``;

	dataChats = jQuery(".chat__header").data("isGroup")
		? dataChats.response
		: dataChats;
	dataChats.messages.forEach((chat) => {
		if (chat.isStarred) {
			console.log(chat);
			var date = new Date(Number(chat.timeStamp) * 1000);
			var date = date.toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
			});
			var mediaContent = ``;
			if (chat.type === "media") {
				if (chat.media[0].mediaType === "image") {
					mediaContent = `<div class="starred-message__media"><img src="${returnImagePath(
						chat.media[0].mediaUrl
					)}" alt="Image" class="chat__message-image" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'"></div>`;
				} else {
					mediaContent = `<div class="starred-message__media"><video controls class="chat__message-video">
						  <source src="${returnVideoPath(chat.media[0].mediaUrl)}" type="video/mp4">
						  Your browser does not support the video tag.
					  </video></div>`;
				}
			} else if (chat.type === "gif") {
				mediaContent = `<div class="starred-message__media"><img src="${chat.message}" alt="GIF" class="chat__message-image" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'"></div>`;
			}

			starredMessagesHtml += `<!-- Example starred messages -->
			<div class="starred-message">
			  <div class="starred-message__header">
				<div class="starred-message__user hidden">
				  <div class="starred-message__avatar">
					<img src="https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png" alt="User Avatar">
				  </div>
				  <div class="starred-message__name">Pranav Jha</div>
				</div>
				<div class="starred-message__time">${date}</div>
			  </div>
			  <div class="starred-message__body">
				${mediaContent}
				<p class="starred-message__text">${formatMessage(chat.message)}</p>
			  </div>
			  <div class="starred-message__actions">
				<button class="starred-message__action starred-message__action--unstar hidden" title="Unstar message">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
				  </svg>
				</button>
				<button class="starred-message__action starred-message__action--goto hidden" title="Go to message">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="7" y1="17" x2="17" y2="7"></line>
					<polyline points="7 7 17 7 17 17"></polyline>
				  </svg>
				</button>
			  </div>
			</div>`;
		}
	});

	// Create the starred messages panel
	overlay.innerHTML = `
	  <div class="starred-panel">
		<div class="starred-panel__header">
		  <h2 class="starred-panel__title">
			<svg class="starred-panel__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
			</svg>
			Starred Messages
		  </h2>
		  <button class="starred-panel__close" data-action="close">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <line x1="18" y1="6" x2="6" y2="18"></line>
			  <line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		  </button>
		</div>
		
		<div class="starred-panel__content">
		  <div class="starred-messages">
			${starredMessagesHtml}
		</div>
	  </div>
	`;

	// Append to body
	document.body.appendChild(overlay);

	// Add event listeners
	setupStarredMessagesEventListeners(overlay);

	// Show the overlay with animation
	setTimeout(() => overlay.classList.add("overlay--active"), 10);
}

/**
 * Sets up event listeners for the starred messages overlay
 * @param {HTMLElement} overlay - The starred messages overlay element
 */
function setupStarredMessagesEventListeners(overlay) {
	// Close button
	var closeButton = overlay.querySelector(".starred-panel__close");
	closeButton.addEventListener("click", () => {
		closeOverlay(overlay);
	});

	// Unstar buttons
	var unstarButtons = overlay.querySelectorAll(
		".starred-message__action--unstar"
	);
	unstarButtons.forEach((button) => {
		button.addEventListener("click", (e) => {
			e.stopPropagation();
			var messageElement = button.closest(".starred-message");

			// Add a fade-out animation
			messageElement.classList.add("starred-message--removing");

			// Remove the message after animation completes
			setTimeout(() => {
				messageElement.remove();

				// Check if there are any starred messages left
				var remainingMessages = overlay.querySelectorAll(".starred-message");
				if (remainingMessages.length === 0) {
					var emptyState = overlay.querySelector(".starred-messages__empty");
					emptyState.classList.remove("hidden");
				}
			}, 300);
		});
	});

	// Go to message buttons
	var gotoButtons = overlay.querySelectorAll(".starred-message__action--goto");
	gotoButtons.forEach((button) => {
		button.addEventListener("click", (e) => {
			e.stopPropagation();
			// Here you would implement the logic to navigate to the original message
			console.log("Navigate to original message");
			closeOverlay(overlay);
		});
	});

	// Close on backdrop click
	overlay.addEventListener("click", (e) => {
		if (e.target === overlay) {
			closeOverlay(overlay);
		}
	});

	// Close on ESC key
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			closeOverlay(overlay);
		}
	});
}

/**
 * Closes any overlay with animation
 * @param {HTMLElement} overlay - The overlay element to close
 */
function closeOverlay(overlay) {
	overlay.classList.remove("overlay--active");

	// Remove from DOM after animation completes
	setTimeout(() => {
		if (overlay && overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
	}, 300); // Match this with the CSS transition duration
}

function updateIsRequested(groupId, userId, actionType, userName) {
	jsInit("updateIsRequested", {
		groupId: groupId,
		userId: userId,
		optionType: actionType,
		userName: userName,
	});

	showToast("User " + actionType + " successfully");
}

/**
 * Creates and appends a dialog to select users to add to a group
 * @param {Object} orgDataChat - Chat data object
 * @param {Array} usersList - List of users that can be added to the group
 */
function appendAddUsersToGroupDialog(orgDataChat, usersList) {
	// Create the dialog overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	overlay.id = "addUsersToGroupDialog";

	var groupName = orgDataChat.element ? orgDataChat.element.chatName : "Group";
	var selectedUsers = [];

	// Filter users if needed (e.g., only show users who aren't already in the group)
	var availableUsers = usersList.filter((user) => {
		// You can add filtering logic here if needed
		return user.userId && user.name;
	});

	if (availableUsers.length === 0) {
		console.log("No users available to add");
		return;
	}

	// Create the dialog content
	overlay.innerHTML = `
	<div class="dialog dialog--users">
	<div class="dialog__header">
		<h2 class="dialog__title">
		<svg class="dialog__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
			<circle cx="9" cy="7" r="4"></circle>
			<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
			<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
		</svg>
		Add Users to Group
		</h2>
		<button class="dialog__close" data-action="close">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		</svg>
		</button>
	</div>
	<div class="dialog__body">
		<p class="dialog__message">Select users to add to <strong>${groupName}</strong></p>
		
		<div class="dialog__search">
		<input type="text" class="dialog__search-input" placeholder="Search users..." />
		<svg class="dialog__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="11" cy="11" r="8"></circle>
			<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
		</svg>
		</div>
		
		<div class="dialog__users-list">
		${availableUsers
			.map(
				(user) => `
			<div class="dialog__user-item" data-user-id="${user.userId}" data-username="${
					user.name
				}" data-user-dp="${user.imageUrl}">
			<div class="dialog__user">
				<div class="dialog__avatar">
				<img src="${returnImagePath(user.imageUrl)}" alt="${
					user.name
				}'s Avatar" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
				</div>
				<div class="dialog__user-info">
				<div class="dialog__user-name">${user.name}</div>
				<div class="dialog__user-meta">
					${user.isVerified ? '<span class="dialog__user-verified">✓</span>' : ""}
					${
						user.followerCount > 0
							? `<span class="dialog__user-followers">${user.followerCount} followers</span>`
							: ""
					}
				</div>
				</div>
			</div>
			<div class="dialog__user-select">
				<div class="dialog__checkbox">
				<input type="checkbox" id="user-${
					user.userId
				}" class="dialog__checkbox-input" />
				<label for="user-${user.userId}" class="dialog__checkbox-label"></label>
				</div>
			</div>
			</div>
		`
			)
			.join("")}
		</div>
		
		<div class="dialog__selected-count">
		<span class="dialog__count">0</span> users selected
		</div>
	</div>
	<div class="dialog__footer">
		<button class="dialog__button dialog__button--secondary" data-action="cancel">Cancel</button>
		<button class="dialog__button dialog__button--primary" data-action="add-users" disabled>Add to Group</button>
	</div>
	</div>
`;

	// Append to body
	document.body.appendChild(overlay);

	// Add event listeners
	setupAddUsersDialogEventListeners(overlay, availableUsers);

	// Show the dialog with animation
	setTimeout(() => overlay.classList.add("overlay--active"), 10);
}

/**
 * Sets up event listeners for the add users dialog
 * @param {HTMLElement} overlay - The dialog overlay element
 * @param {Array} availableUsers - List of available users
 */
function setupAddUsersDialogEventListeners(overlay, availableUsers) {
	// Close button
	overlay
		.querySelector('[data-action="close"]')
		.addEventListener("click", () => {
			closeDialog(overlay);
		});

	// Cancel button
	overlay
		.querySelector('[data-action="cancel"]')
		.addEventListener("click", () => {
			closeDialog(overlay);
		});

	// Add users button
	var addButton = overlay.querySelector('[data-action="add-users"]');
	addButton.addEventListener("click", () => {
		var selectedUserIds = [];
		var selectedUserInfo = {};
		overlay
			.querySelectorAll(".dialog__checkbox-input:checked")
			.forEach((checkbox) => {
				var userItem = checkbox.closest(".dialog__user-item");
				if (userItem) {
					selectedUserIds.push(userItem.getAttribute("data-user-id"));
					selectedUserInfo[userItem.getAttribute("data-user-id")] = {
						userName: userItem.getAttribute("data-username"),
						profilePic: userItem.getAttribute("data-user-dp"),
					};
				}
			});

		if (selectedUserIds.length > 0) {
			// Here you would implement your logic to add users to the group
			console.log("Adding users to group:", selectedUserIds);

			// Example: Call your API or function to add users
			addUsersToGroupPopups(selectedUserIds, selectedUserInfo);
		}

		closeDialog(overlay);
	});

	// User item click for selection
	overlay.querySelectorAll(".dialog__user-item").forEach((userItem) => {
		userItem.addEventListener("click", (e) => {
			// Don't toggle if clicking on the checkbox itself (it will handle its own state)
			if (!e.target.classList.contains("dialog__checkbox-input")) {
				var checkbox = userItem.querySelector(".dialog__checkbox-input");
				checkbox.checked = !checkbox.checked;
				updateSelectedCount(overlay);
			}
		});
	});

	// Checkbox change event
	overlay.querySelectorAll(".dialog__checkbox-input").forEach((checkbox) => {
		checkbox.addEventListener("change", () => {
			updateSelectedCount(overlay);
		});
	});

	// Search functionality
	var searchInput = overlay.querySelector(".dialog__search-input");
	searchInput.addEventListener("input", () => {
		var searchTerm = searchInput.value.toLowerCase();

		overlay.querySelectorAll(".dialog__user-item").forEach((userItem) => {
			var userName = userItem
				.querySelector(".dialog__user-name")
				.textContent.toLowerCase();
			if (userName.includes(searchTerm)) {
				userItem.style.display = "";
			} else {
				userItem.style.display = "none";
			}
		});
	});

	// Initial count update
	updateSelectedCount(overlay);
}

/**
 * Updates the selected users count and enables/disables the add button
 * @param {HTMLElement} overlay - The dialog overlay element
 */
function updateSelectedCount(overlay) {
	var selectedCheckboxes = overlay.querySelectorAll(
		".dialog__checkbox-input:checked"
	);
	var countElement = overlay.querySelector(".dialog__count");
	var addButton = overlay.querySelector('[data-action="add-users"]');

	var count = selectedCheckboxes.length;
	countElement.textContent = count;

	if (count > 0) {
		addButton.removeAttribute("disabled");
	} else {
		addButton.setAttribute("disabled", "disabled");
	}
}

/**
 * Adds selected users to the group
 * @param {Array} userIds - Array of user IDs to add to the group
 */
function addUsersToGroupPopups(newMemberIds, groupMembersInfo) {
	// Get current group data
	var dataMembers = jQuery(".chat__header").data("dataMembers");
	var dataChats = jQuery(".chat__header").data("dataChats");
	var groupId = dataMembers.chatId;
	var profileData = getProfileData();

	// Prepare data for API call
	var timeStamp = Math.floor(Date.now() / 1000);
	var payload = {
		isfindBuddyGroup: false,
		groupId: groupId,
		newMemberIds: newMemberIds,
		timeStamp: timeStamp,
		groupMembersInfo: groupMembersInfo,
		data: {
			createdById: localStorage.getItem("plainUserId"),
			createdBy: profileData.name,
			groupName: dataChats.element.chatName,
			groupProfileUrl: dataChats.element.chatImage,
			groupLastMessage: "",
			senderId: localStorage.getItem("plainUserId"),
			lastMessageSenderName: "",
			isDeleted: false,
			chatType: "group",
		},
	};

	console.log("Adding users to group with payload:", payload);
	jsInit("addUsersToGroup", payload, "addUsersToGroup");
}

// Remove etc

/**
 * Creates and appends a user actions popup to the document body
 * @param {Object} userData - Data of the user on which actions will be performed
 * @param {Event} event - The click event that triggered the popup
 */
function showUserActionsPopup(userData, event) {
	// Prevent default behavior if it's an event
	if (event) {
		event.preventDefault();
		event.stopPropagation();
	}

	// Check if there's already an open popup
	var existingPopup = document.getElementById("userActionsPopup");
	if (existingPopup) {
		document.body.removeChild(existingPopup);
	}

	// Get click position
	var posX = event ? event.clientX : window.innerWidth / 2;
	var posY = event ? event.clientY : window.innerHeight / 2;

	// Create the popup element
	var popup = document.createElement("div");
	popup.className = "user-actions-popup";
	popup.id = "userActionsPopup";

	// Create the popup content
	popup.innerHTML = `
	  <div class="user-actions-menu">
		<div class="user-actions-header">
		  <div class="user-actions-avatar">
			<img src="${returnImagePath(userData.imageUrl)}" alt="${
		userData.name
	}'s Avatar" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">
		  </div>
		  <div class="user-actions-name" data-user-id="${userData.userId}">${
		userData.name
	}</div>
		</div>
		<div class="user-actions-options">
		  <button class="user-action-item" data-action="view-user">
			<svg class="user-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
			  <circle cx="12" cy="12" r="3"></circle>
			</svg>
			<span class="user-action-text">View user</span>
		  </button>
		  <button class="user-action-item" data-action="remove-from-group">
			<svg class="user-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
			  <circle cx="8.5" cy="7" r="4"></circle>
			  <line x1="18" y1="8" x2="23" y2="13"></line>
			  <line x1="23" y1="8" x2="18" y2="13"></line>
			</svg>
			<span class="user-action-text">Remove from group</span>
		  </button>
		  <button class="user-action-item hidden" data-action="start-group-chat">
			<svg class="user-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
			  <circle cx="9" cy="7" r="4"></circle>
			  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
			  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
			</svg>
			<span class="user-action-text">Message ${userData.name}</span>
		  </button>
		</div>
	  </div>
	`;

	// Position the popup near the click position
	popup.style.left = `${posX}px`;
	popup.style.top = `${posY}px`;

	// Adjust position if it goes off-screen
	setTimeout(() => {
		var rect = popup.getBoundingClientRect();
		if (rect.right > window.innerWidth) {
			popup.style.left = `${window.innerWidth - rect.width - 10}px`;
		}
		if (rect.bottom > window.innerHeight) {
			popup.style.top = `${window.innerHeight - rect.height - 10}px`;
		}
	}, 0);

	// Append to body
	document.body.appendChild(popup);

	// Add event listeners
	setupUserActionsPopupEventListeners(popup, userData);

	// Close when clicking outside
	document.addEventListener("click", closeUserActionsPopupOnClickOutside);
}

/**
 * Sets up event listeners for the user actions popup
 * @param {HTMLElement} popup - The popup element
 * @param {Object} userData - Data of the user on which actions will be performed
 */
function setupUserActionsPopupEventListeners(popup, userData) {
	// View user action
	popup
		.querySelector('[data-action="view-user"]')
		.addEventListener("click", (e) => {
			e.stopPropagation();
			console.log("View user profile:", userData.name);

			// Implement your logic to view user profile
			// For example, navigate to user profile page or show user details modal
			viewUserProfile(userData);

			closeUserActionsPopup();
		});

	// Remove from group action
	popup
		.querySelector('[data-action="remove-from-group"]')
		.addEventListener("click", (e) => {
			e.stopPropagation();
			console.log("Remove user from group:", userData.name);

			// Show confirmation dialog before removing
			appendConfirmationDialog({
				title: "Remove User",
				message: `Are you sure you want to remove ${userData.name} from this group?`,
				confirmText: "Remove",
				cancelText: "Cancel",
				confirmClass: "dialog__button--danger",
				onConfirm: () => {
					// Implement your logic to remove user from group
					removeUserFromGroup(userData);
				},
			});

			closeUserActionsPopup();
		});

	// Start a group chat action
	popup
		.querySelector('[data-action="start-group-chat"]')
		.addEventListener("click", (e) => {
			e.stopPropagation();
			console.log("Start a group chat with:", userData.name);

			// Implement your logic to start a group chat
			startGroupChatPopups(userData);

			closeUserActionsPopup();
		});
}

/**
 * Closes the user actions popup when clicking outside
 * @param {Event} event - The click event
 */
function closeUserActionsPopupOnClickOutside(event) {
	var popup = document.getElementById("userActionsPopup");
	if (popup && !popup.contains(event.target)) {
		closeUserActionsPopup();
		// Remove the event listener after closing
		document.removeEventListener("click", closeUserActionsPopupOnClickOutside);
	}
}

/**
 * Closes the user actions popup
 */
function closeUserActionsPopup() {
	var popup = document.getElementById("userActionsPopup");
	if (popup) {
		// Add a fade-out animation
		popup.classList.add("user-actions-popup--closing");

		// Remove from DOM after animation completes
		setTimeout(() => {
			if (popup.parentNode) {
				popup.parentNode.removeChild(popup);
			}
		}, 200);
	}
}

/**
 * View user profile
 * @param {Object} userData - User data
 */
function viewUserProfile(userData) {
	// Example implementation - you would replace this with your actual logic
	console.log("Viewing profile for:", userData.name);
	jsInit("openProfileFromChat", { userId: userData.userId });

	// Navigate to user profile or show user profile modal
	// For example:
	// window.location.href = `/profile/${userData.userId}`;
	// OR
	// showUserProfileModal(userData);

	// For this example, we'll show a simple toast notification
	//showToast(`Viewing ${userData.name}'s profile`);
}

/**
 * Remove user from group
 * @param {Object} userData - User data
 */
function removeUserFromGroup(userData) {
	// Example implementation - you would replace this with your actual logic
	console.log("Removing user from group:", userData.name);

	// Get current group data
	var dataMembers = jQuery(".chat__header").data("dataMembers");
	var groupId = dataMembers.chatId;

	// Prepare data for API call
	var timeStamp = Math.floor(Date.now() / 1000);
	var payload = {
		groupId: groupId,
		memberIdsToRemove: [userData.userId],
		timeStamp: timeStamp,
	};

	console.log("Removing user from group with payload:", payload);

	// Call your API function
	jsInit("removeUserFromGroup", payload);
}

/**
 * Start a group chat with user
 * @param {Object} userData - User data
 */
function startGroupChatPopups(userData) {
	// Example implementation - you would replace this with your actual logic
	console.log("Starting group chat with:", userData.name);

	// Here you would implement your logic to start a new group chat
	// For example, open a create group dialog with this user pre-selected

	// For this example, we'll show a simple toast notification
	showToast(`Starting a new group chat with ${userData.name}`);

	// You might want to open your group creation dialog here
	// For example:
	// openCreateGroupDialog([userData]);
}

/**
 * Shows a confirmation dialog
 * @param {Object} options - Dialog options
 */
function appendConfirmationDialog(options) {
	// Create the dialog overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	overlay.id = "confirmationDialog";

	// Create the dialog content
	overlay.innerHTML = `
	  <div class="dialog dialog--confirmation">
		<div class="dialog__header">
		  <h2 class="dialog__title">${options.title}</h2>
		  <button class="dialog__close" data-action="close">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <line x1="18" y1="6" x2="6" y2="18"></line>
			  <line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		  </button>
		</div>
		<div class="dialog__body">
		  <p class="dialog__message">${options.message}</p>
		</div>
		<div class="dialog__footer">
		  <button class="dialog__button dialog__button--secondary" data-action="cancel">${
				options.cancelText || "Cancel"
			}</button>
		  <button class="dialog__button ${
				options.confirmClass || "dialog__button--primary"
			}" data-action="confirm">${options.confirmText || "Confirm"}</button>
		</div>
	  </div>
	`;

	// Append to body
	document.body.appendChild(overlay);

	// Add event listeners
	overlay
		.querySelector('[data-action="close"]')
		.addEventListener("click", () => {
			closeDialog(overlay);
		});

	overlay
		.querySelector('[data-action="cancel"]')
		.addEventListener("click", () => {
			closeDialog(overlay);
		});

	overlay
		.querySelector('[data-action="confirm"]')
		.addEventListener("click", () => {
			if (options.onConfirm) {
				options.onConfirm();
			}
			closeDialog(overlay);
		});

	// Show the dialog with animation
	setTimeout(() => overlay.classList.add("overlay--active"), 10);
}

function editGroupInfo(currentGroupName) {
	// Function to Change the Name, Image of Group chats
	/**
	 * Creates and appends a group name input dialog to the document body
	 * @param {Object} currentGroupData - Current group data containing name and other info
	 */
	function appendGroupNameInputDialog(currentGroupData = {}) {
		// Create the dialog overlay
		var overlay = document.createElement("div");
		overlay.className = "overlay";
		overlay.id = "groupNameInputDialog";

		var currentGroupName = currentGroupData.chatName || "";
		var currentEmojis = currentGroupData.emojis || ["👑", "❤️", "🎮"];

		// Popular emojis for quick selection
		var popularEmojis = [
			"😀",
			"😂",
			"😍",
			"🥰",
			"😎",
			"👍",
			"👋",
			"🙏",
			"🎉",
			"🎂",
			"🎁",
			"🏆",
			"⚽",
			"🎮",
			"🎯",
			"🍕",
			"🍔",
			"🍦",
			"🍷",
			"☕",
		];

		// Create the dialog content
		overlay.innerHTML = `
    <div class="mobile-dialog">
      
      <!-- Header -->
      <div class="dialog__header">
        <h2 class="dialog__title">Enter group name</h2>
      </div>

      <!-- Input area -->
      <div class="group-name-input">
        <div class="input-container">
          <input 
            type="text" 
            id="groupNameField" 
            class="group-name-field" 
            value="${currentGroupName}" 
            placeholder="Type group name"
            maxlength="100"
          />
          <span class="char-counter" id="charCounter">79</span>
        </div>

        <!-- Emoji picker (hidden by default) -->
        <div class="emoji-picker" id="emojiPicker">
          <div class="emoji-grid">
            ${popularEmojis
							.map(
								(emoji) => `
              <button class="emoji-option" data-emoji="${emoji}">${emoji}</button>
            `
							)
							.join("")}
          </div>
        </div>
      </div>

      <!-- Spacer -->
      <div class="dialog__spacer"></div>

      <!-- Bottom buttons -->
      <div class="dialog__footer">
        <button class="dialog__button dialog__button--cancel" data-action="cancel">Cancel</button>
        <button class="dialog__button dialog__button--ok" data-action="save">OK</button>
      </div>
    </div>
  `;

		// Append to body
		document.body.appendChild(overlay);

		// Add event listeners
		setupGroupNameDialogEventListeners(overlay);

		// Show the dialog with animation
		setTimeout(() => overlay.classList.add("overlay--active"), 10);

		return overlay;
	}

	/**
	 * Sets up event listeners for the group name dialog
	 * @param {HTMLElement} overlay - The dialog overlay element
	 */
	function setupGroupNameDialogEventListeners(overlay) {
		var groupNameInput = overlay.querySelector("#groupNameField");
		var charCounter = overlay.querySelector("#charCounter");
		var emojiToggle = overlay.querySelector("#emojiToggle");
		var emojiPicker = overlay.querySelector("#emojiPicker");
		var emojiOptions = overlay.querySelectorAll(".emoji-option");
		var maxLength = parseInt(groupNameInput.getAttribute("maxlength")) || 100;

		// Update character counter
		function updateCharCounter() {
			var remaining = maxLength - groupNameInput.value.length;
			charCounter.textContent = remaining;
		}

		// Input event for character counting
		groupNameInput.addEventListener("input", updateCharCounter);

		

		// Emoji selection
		emojiOptions.forEach(function (button) {
			button.addEventListener("click", function () {
				var emoji = this.getAttribute("data-emoji");
				var cursorPos = groupNameInput.selectionStart;
				var textBefore = groupNameInput.value.substring(0, cursorPos);
				var textAfter = groupNameInput.value.substring(cursorPos);

				groupNameInput.value = textBefore + emoji + textAfter;
				groupNameInput.focus();
				groupNameInput.selectionStart = cursorPos + emoji.length;
				groupNameInput.selectionEnd = cursorPos + emoji.length;

				updateCharCounter();
				emojiPicker.classList.remove("emoji-picker--visible");
			});
		});

		// Cancel button
		var cancelButton = overlay.querySelector('[data-action="cancel"]');
		cancelButton.addEventListener("click", function () {
			closeDialog(overlay);
		});

		// Save button
		var saveButton = overlay.querySelector('[data-action="save"]');
    	saveButton.addEventListener("click", function () {
			var newGroupName = groupNameInput.value.trim();

			console.log("User submitted group name:", groupNameInput.value);
			console.log("Trimmed group name:", newGroupName);

			var info = jQuery(".chat__header").data("dataMembers");
			var groupId = info.chatId;
			console.log("Group ID:", groupId);

			if (newGroupName) {
				var titleEl = document.querySelector(".group-chat__title");
				if (titleEl) titleEl.textContent = newGroupName;

				var headerName = document.querySelector(".chat__header-name");
				if (headerName) headerName.textContent = newGroupName;

				
				var chatListName = document.querySelector(".chats__item.active .chats__name");
				if (chatListName) chatListName.textContent = newGroupName;

				//  API call
				jsInit("updateGroupLabel", {
					groupId: groupId,
					groupName: newGroupName,
				});
			}

			closeDialog(overlay);
    	});


		// Close on backdrop click
		overlay.addEventListener("click", function (e) {
			if (e.target === overlay) {
				closeDialog(overlay);
			}
		});

		// Close on ESC key
		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") {
				closeDialog(overlay);
			}
		});

		// Initial character count
		updateCharCounter();
	}

	/**
	 * Closes a dialog overlay with animation
	 * @param {HTMLElement} overlay - The dialog overlay element to close
	 */
	function closeDialog(overlay) {
		overlay.classList.remove("overlay--active");

		// Remove from DOM after animation completes
		setTimeout(() => {
			if (overlay && overlay.parentNode) {
				overlay.parentNode.removeChild(overlay);
			}
		}, 300); // Match this with the CSS transition duration
	}

	// Add CSS to the page
	function addStyles() {
		var styleElement = document.createElement("style");
		styleElement.textContent = `
    /* Overlay styles */
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .overlay--active {
      opacity: 1;
    }

    /* Mobile dialog styles */
    .mobile-dialog {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: white;
      color: #333;
    }

    /* Dialog header */
    .dialog__header {
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .dialog__title {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
    }

    /* Group name input */
    .group-name-input {
      padding: 16px;
      position: relative;
    }

    .input-container {
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px 12px;
    }

    .group-name-field {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      padding: 4px 8px;
      outline: none;
    }

    .char-counter {
      color: #777;
      font-size: 14px;
      margin: 0 8px;
    }

    #emojiToggle {
      background: none;
      border: none;
      color: #777;
      cursor: pointer;
      padding: 4px;
		display: flex;
		align-items: center;
		position: unset;
    }

    /* Emoji picker */
    .emoji-picker {
      position: absolute;
      top: 100%;
      left: 16px;
      right: 16px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 8px;
      margin-top: 8px;
      z-index: 10;
      display: none;
    }

    .emoji-picker--visible {
      display: block;
    }

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }

    .emoji-option {
      font-size: 20px;
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;
    }

    .emoji-option:hover {
      background-color: #f0f0f0;
    }

    /* Spacer */
    .dialog__spacer {
      flex: 1;
    }

    /* Dialog footer */
    .dialog__footer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-top: 1px solid #eee;
    }

    .dialog__button {
      padding: 16px;
      text-align: center;
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
    }

    .dialog__button--cancel {
      color: #777;
      border-right: 1px solid #eee;
    }

    .dialog__button--ok {
      color: #2196F3;
    }
  `;

		document.head.appendChild(styleElement);
	}

	// Example usage
	function showGroupNameDialog() {
		addStyles();
		appendGroupNameInputDialog({
			chatName: currentGroupName,
			emojis: ["👑", "❤️", "🎮"],
		});
	}
	showGroupNameDialog();
}
// // Run the example;
//editGroupInfo();

// console.log("Group name input dialog created successfully!");
