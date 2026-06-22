// Api Call for starting a new chat

// Making the parameters for the API call

function startChat(otherUserId, otherUserName, otherProfileImage, selfUserName, selfProfileImage) {
	// Check if the user is already in the chat
	/*if (isUserInChat(userId)) {
		alert('You are already in a chat with this user.');
		return;
	}
	
	
	

	// Check if the user is blocked
	if (isUserBlocked(userId)) {
		alert('You cannot chat with this user as they are blocked.');
		return;
	}

	// Check if the user is online
	// if (!isUserOnline(userId)) {
	// 	alert('This user is currently offline.');
	// 	return;
	// }

	// Check if the chat limit has been reached
	if (hasChatLimitReached()) {
		alert('You have reached your chat limit. Please upgrade your plan to start a new chat.');
		return;
	}*/

	//Initiate the chat
	jsInit('initiateChat', { chatType: 'personal', other: { userId: otherUserId, userName: otherUserName, profileImage: otherProfileImage }, self: { userName: selfUserName, profileImage: selfProfileImage } });
	
}

// Start Group Chat

/* Step 1 --> Group Gets created with the createdBy as the user, groupName as the group name, groupProfileUrl as the group image, chatType as the chat type
Step 2 --> User gets added to the Group
Step 3 --> Group gets opened */

function startGroupChat(createdBy, groupName, groupProfileUrl, groupMembers, groupMembersInfo) {
	console.log('Starting group chat:', createdBy, groupName, groupProfileUrl, groupMembers, groupMembersInfo);
	// Check if the user is already in the chat
	/*if (isUserInChat(userId)) {
		alert('You are already in a chat with this user.');
		return;
	}

	
	
	
	// Check if the user is blocked
	if (isUserBlocked(userId)) {
		alert('You cannot chat with this user as they are blocked.');
		return;
	}

	// Check if the user is online
	if (!isUserOnline(userId)) {
		alert('This user is currently offline.');
		return;
	}

	// Check if the chat limit has been reached
	if (hasChatLimitReached()) {
		alert('You have reached your chat limit. Please upgrade your plan to start a new chat.');
		return;
	}*/

	
	jsInit('initiateChat', { createdBy: createdBy, groupName: groupName, groupProfileUrl: groupProfileUrl, groupLastMessage: "", senderId: "", lastMessageSenderName: "", isDeleted: false, chatType: "group" }, { type: 'groupChat' , newMemberIds: groupMembers, groupMembersInfo: groupMembersInfo, createdById: localStorage.getItem('plainUserId'), createdBy: createdBy, groupName: groupName, groupProfileUrl: groupProfileUrl, senderId: localStorage.getItem('plainUserId'), chatType: "group" });
}


// Adding Users to the Created Group

function addUsersToGroup(groupId, newMemberIds, groupMembersInfo, createdById, createdBy, groupName, groupProfileUrl, senderId) {

	console.log('Adding users to group:', groupId, newMemberIds, groupMembersInfo, createdById, createdBy, groupName, groupProfileUrl, senderId);
	
	//groupMembersData = { isfindBuddyGroup: false, groupId: groupId, newMemberIds: groupMembers, groupMembersInfo: groupMembersInfo, data: { createdById: localStorage.getItem('plainUserId'), createdBy: manageUserProfile('read', 'name'), groupName: groupName, groupProfileUrl: groupProfileUrl, groupLastMessage: "", senderId: localStorage.getItem('plainUserId'), lastMessageSenderName: "", isDeleted: false, chatType: "group" } };
	
	groupMembersData = { isfindBuddyGroup: false, groupId: groupId, newMemberIds: newMemberIds, groupMembersInfo: groupMembersInfo, data: { createdById: createdById, createdBy: createdBy, groupName: groupName, groupProfileUrl: groupProfileUrl, groupLastMessage: "", senderId: senderId, lastMessageSenderName: "", isDeleted: false, chatType: "group" } };
	console.log(groupMembersData);

	jsInit('addUsersToGroup', groupMembersData, 'addUsersToGroup');
	
}

// Check if the user is already in the chat
function isUserInChat(userId) {
	// Check if the user is already in the chat
	// This is a placeholder function. Replace with actual implementation.
	return false;
}
// Check if the user is blocked
function isUserBlocked(userId) {
	// Check if the user is blocked
	// This is a placeholder function. Replace with actual implementation.
	return false;
}
// Check if the user is online
function isUserOnline(userId) {
	// Check if the user is online
	// This is a placeholder function. Replace with actual implementation.
	return true;
}
// Check if the chat limit has been reached
function hasChatLimitReached() {
	// Check if the chat limit has been reached
	// This is a placeholder function. Replace with actual implementation.
	return false;
}
// Check if the user is already in the chat
function isUserInChat(userId) {
	// Check if the user is already in the chat
	// This is a placeholder function. Replace with actual implementation.
	return false;
}
// Check if the user is blocked
function isUserBlocked(userId) {
	// Check if the user is blocked
	// This is a placeholder function. Replace with actual implementation.
	return false;
}
// Check if the user is online
function isUserOnline(userId) {
	// Check if the user is online
	// This is a placeholder function. Replace with actual implementation.
	return true;
}

// Function to render the followers list

function renderFollowersList(followersList, actionType) {
	console.log('Followers List:', followersList);
	if (actionType.action == 'addMembers') {
		var alreadyAddedMembers = jQuery(".chat__header").data("dataMembers");
		alreadyAddedMembers = alreadyAddedMembers.groupMembers;
		appendAddUsersToGroupDialog('', followersList);
		return;
	}
	
	
    // Here we will render the followers list having both the followers and the followings
    var listHtml = '';

    followersList.forEach(function (follower) {
        listHtml += `
            <!-- Users -->
            <div class="conversation">
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

    // Append the list to the container
    jQuery('.conversation-list').append(listHtml);

    // Add event listener for checkboxes
	jQuery('.user-checkbox').on('change', function () {
		var isChecked = jQuery(this).is(':checked');
		var userId = jQuery(this).data('user-id');

		if (isChecked) {
			console.log(`User selected: ${userId}`);
		} else {
			console.log(`User deselected: ${userId}`);
		}
		
		// Check if any checkbox is checked
		var anyChecked = jQuery('.user-checkbox:checked').length > 0;
		if (anyChecked && jQuery('#next-users-selected').length === 0) {
			// Add button to the DOM as Next Button in bottom right corner
			jQuery('.new-chat').append(`
				<button class="group__next-button" id="next-users-selected">${icons.rightArrow}</button>
				`);
		}
		
		else if (!anyChecked) {
			// Remove the button if no checkbox is checked
			jQuery('.chats__new-chat').remove();
		}
	});
}

