function renderChatMessages(chatMsg, myMessage) {
	console.log("Chat messages: ", chatMsg);
	if (myMessage) {
		whosMessage = " chat__message--sent";
	} else {
		whosMessage = " chat__message--received";
	}
	whosMessage = chatMsg.type == "status" ? " statusMessage" : whosMessage;
	
	

	let messageContent = "";
	if (chatMsg.type === "media") {
		if (chatMsg.media[0].mediaType === "image") {
			messageContent = `<img src="${returnImagePath(
				chatMsg.media[0].mediaUrl
			)}" alt="Image" class="chat__message-image" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'"><p class="chat__message-text">${formatMessage(
				chatMsg.message
			)}</p>`;
		}
		else {
			messageContent = `<video controls class="chat__message-video">
				  <source src="${returnVideoPath(chatMsg.media[0].mediaUrl)}" type="video/mp4">
			  </video><p class="chat__message-text">${formatMessage(chatMsg.message)}</p>`;
		}
	} else if (chatMsg.type === "gif") {
		messageContent = `<img src="${chatMsg.message}" alt="GIF" class="chat__message-image" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">`;
	} else if (chatMsg.type === "ai" && chatMsg.images && chatMsg.images.length > 0) {
		// Handle AI responses with distributed images and slider
		if (chatMsg.contentWithImages && chatMsg.contentWithImages.length > 0) {
			
			// Use distributed content with images
			const contentHTML = chatMsg.contentWithImages.map(item => {
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
			const imagesHTML = chatMsg.images.map(img => 
				`<img src="${img}" alt="AI Response Image" class="chat__message-ai-image" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'">`
			).join('');
			
			messageContent = `
				<div class="chat__message-ai-content">
					<div class="chat__message-ai-images">
						${imagesHTML}
					</div>
					<p class="chat__message-text">${formatMessage(chatMsg.message)}</p>
				</div>
			`;
		}
	} else {
		messageContent = `<p class="chat__message-text">${formatMessage(
			chatMsg.message
		)}</p>`;
	}

	date = new Date(Number(chatMsg.timeStamp) * 1000);
	date = date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});
	var messageMeta = `
		<div class="chat__reaction-bubble"></div>
		<div class="chat__message-meta">
			<span class="chat__message-time">${date}</span>
			${
				myMessage
					? `
				<svg class="chat__message-status" viewBox="0 0 24 24" fill="none">
					<path d="M2 12L7 17L17 7M7 12L12 17L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>`
					: ""
			}
		</div>`;
	
	var whoseReaction = (whosMessage == ' chat__message--sent') ? 'chat__reaction-box--sent' : 'chat__reaction-box--received';
	
	jQuery(".thinking-indicator").remove();
	// jQuery(".chat__messages").append(`
	//   <div class="chat__message ${whosMessage}">
	// 	  ${messageContent}
	// 	  ${messageMeta}
	// 	  <!-- Reaction Box for Received Message (shown when active) -->
	// 		<div class="chat__reaction-box-backdrop"></div>
	// 		<div class="chat__reaction-box ${whoseReaction}"><button class="chat__reaction-item">👍</button>
	// 			${returnEmojisForReaction()}
	// 		</div>
	//   </div>
	
	//   `);
	var isGroupChat = jQuery('.chat__header').hasClass('group');
	createMessagesCard(whosMessage, messageContent, messageMeta, whoseReaction, isGroupChat);
	jQuery(".chat__message:last").data("messageData", chatMsg);

	// Scroll to the bottom of the chat smoothly
	if (chatMsg.type != 'ai') {
		scrollChatIntoView();
	}
	
	if (!myMessage) {
		jQuery('.premium__chat-holder').css('display', 'none');
		jQuery('.chat__input-container').css('display', 'flex');
	}
	else {
		if (!jQuery('.chat__header').hasClass('ai')) {
			checkPremiumChat();
		}
	}
		
	
}

function scrollChatIntoView() {
	var chatMessagesContainer = jQuery(".chat__messages")[0];
	setTimeout(() => {
		chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight + 200;
	}, 300);
}

function formatMessage(message) {
    // Replace newlines with <br> tags
    if (message && message.length > 0) {
        //Check if the message ends with "https://"
        if (message.endsWith(".jpg") || message.endsWith(".png") || message.endsWith(".gif")) {
            return (message = `📷 Media`);
        }

        // Replace URLs with clickable links
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        message = message.replace(urlRegex, (url) => {
            return `<a class="links__chat" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });

        // Replace newlines with <br>
        message = message.replace(/\n/g, "<br>");

        // Replace **text** with <strong>text</strong>
        message = message.replace(/\*(.*?)\*/g, "<strong>$1</strong>");

        return message;
    } else {
        return "";
    }
}

// Helper function to check if a message is from the current user
function isCurrentUserMessage(message) {
	return message.senderId === localStorage.getItem("plainUserId");
}

function manageChatMedia() {
	var files = thisELement.files;

	if (files.length > 0) {
		var uploadData = new FormData();

		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			uploadData.append("uploaded_files", file, file.name);
		}

		timestamp = Number(new Date().getTime() / 1000).toFixed(0);

		//Also append the user id to the form data
		uploadData.append(
			"data",
			JSON.stringify({
				userId: manageUserProfile("read", "userId"),
				chatId: jQuery(".singleChat__container").attr("data-chat-id"),
				timeStamp: timestamp,
			})
		);

		// // This is the Console Log Function to log images
		// for (var key of uploadData.entries()) {~
		// 	console.log(key[0] + ', ' + key[1]);
		// }

		mediaType = getMediaType(files[0].name);
		fileExtension = getFileExtension(files[0].name);
		fileName = getFileName(files[0].name);

		//Add the blob object to the chat in the meantime
		chatObj = {
			isSentByCurrentUser: true,
			timeStamp: timestamp,
			isDeleted: false,
			isMedia: false,
			isSeen: false,
			isStarred: false,
			message: "",
			userId: jQuery(this)
				.parents(".singleChat__container")
				.attr("data-chat-user"),
			type: "media",
			media: [
				{
					mediaName: fileName,
					mediaExtension: fileExtension,
					mediaType: mediaType,
					mediaUrl: (window.URL ? URL : webkitURL).createObjectURL(files[0]),
				},
			],
		};
		renderChatMessage(".singleChat__box", chatObj, true);

		jsUpload("uploadChatMedia", uploadData);
	}

	function getFileExtension(fileName) {
		return fileName.split(".").pop();
	}

	function getFileName(fileName) {
		return fileName.split(".").shift();
	}
}

function findChatItemById(chatId) {
	var chatItem = jQuery(".chats__item").filter(function () {
		return jQuery(this).data("chatId") === chatId;
	});

	if (chatItem.length > 0) {
		//console.log("Found chat item:", chatItem);
		// Perform any additional actions with the found chat item
		return chatItem;
	} else {
		console.log("Chat item with chatId", chatId, "not found.");
	}
}

function addNewChatMessageSelf(chatId, chatType, timeStamp, message, type, data) {
	var plainUserId = localStorage.getItem("plainUserId");
	var chatType = jQuery(".chat__header").hasClass("group") ? "group" : "personal";
	var chatObj =   {
						chatId: chatId,
						chatType: chatType,
						chatId: jQuery(".chat__header").data('chatId'),
						senderId: plainUserId,
						isSentByCurrentUser: true,
						timeStamp: timeStamp,
						message: message,
						userId:
							chatType == "personal" ? jQuery(".chat__header").data("userId") : plainUserId,
						type: type,
	};
	if (type == 'media') {
		chatObj.media = [ {
			mediaUrl: data.imageData.Key,
			mediaType : getMediaType(data.mediaOriginal.mediaName) }];
	}
	renderChatMessages(chatObj, true);
	console.log("Chat Object: ", chatObj);
	jsInit("postChatMessage", chatObj);
}

function getMediaType(media) {
	mediaType = '';

	if (media) {
		//Check if the media is an image, video, document based on the extension
		if (media.includes('.jpg') || media.includes('.jpeg') || media.includes('.png') || media.includes('.webp')) {
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

function addNewChatMessageOther(message) {
	var dataMembers = jQuery(".chat__header")
	.data("dataMembers");
	var chatObj = {
		chatId: message.chatId,
		chatType: dataMembers.chatType,
		senderId: message.senderId,
		isSentByCurrentUser: message.isSentByCurrentUser,
		timeStamp: message.timeStamp,
		message: message.message,
		userId:
		dataMembers.chatType == "personal" ? jQuery(".chat__header").data("userId") : "",
		type: message.type,
	};
	if (message.type == 'media') {
		chatObj.media = message.media;
	}
	renderChatMessages(chatObj, message.isSentByCurrentUser);
}

function createMessagesCard(whosMessage, messageContent, messageMeta, whosMessageReaction, isGroup, chat, userName, userDp) {
	var isRecieved = (whosMessage == ' chat__message--received') ? true : false;
	var groupMemberDp = '';
	var groupMemberName = '';
	
	
	
	if (isGroup && isRecieved && userName && userDp) {
		console.log('User Name: ', userName);
		console.log('User DP: 	', userDp);
		
		
		groupMemberDp = `<div class="chat__header-avatar message__avatar">
					  <img src="${returnImagePath(userDp)}" onerror="this.src='https://d1hphxyq85xv5h.cloudfront.net/uploads/display_pictures/dummy.png'"> 
				  </div>`;
		if (messageContent.includes('img') || messageContent.includes('video')) {
		}
		else {
			groupMemberName = `<p class="chat__message-text name" style="
								font-size: 11px;
								width: 100%;
    							left: -1%;
								">${userName.length > 15 ? userName.substring(0, 15) + '...' : userName}
							</p>`;
		}
		console.log('Group Member Name: ', chat);
			
		
	}
	console.log('Group Member Name: ', messageContent);
	jQuery(".chat__messages").append(`
		<div class="chat__message-container">
		${groupMemberDp}
		<div class="chat__message ${whosMessage}">
			${groupMemberName}
			${messageContent}
			${messageMeta}
			<!-- Reaction Box for Received Message (shown when active) -->
		  <div class="chat__reaction-box-backdrop"></div>
		  <div class="chat__reaction-box ${whosMessageReaction}">
			  ${returnEmojisForReaction()}
		  </div>
		</div>
		</div>
		`);
}

function mapMessageSenders(users, messages) {
	return messages.map(message => {
		var sender = users.find(user => user.uid == message.senderId);
		return {
			userId: message.senderId,
			chatId: message.chatId,
			message: message.message,
			isSentByCurrentUser: message.isSentByCurrentUser,
			profilePic: sender?.userInfo?.profilePic || sender?.userInfo?.PhotoURL || '',
			displayName: sender?.userInfo?.displayName || sender?.userInfo?.DisplayName || 'Unknown User',
			timeStamp: new Date(parseInt(message.timeStamp) * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
		};
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