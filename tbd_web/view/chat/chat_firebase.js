function subscribeToChat(data, state) {
	
	// Return a promise from the main function to allow chaining
	return new Promise((resolve, reject) => {
		try {
			
			if (state === "chats") {
				// Create an array of promises for each chat
				const promises = data.map((chat) => {
					
					return new Promise((chatResolve, chatReject) => {
						
	
						if (chat.chatId && chat.chatId.isRemoved === 1) {
							chatResolve(); // Skip removed chats
							return;
						}

						const chatMessages = firebase
							.database()
							.ref("chats/" + chat.chatId + "/messages/");

						// Detach any existing listeners to prevent multiple firings
						chatMessages.off("child_added");
						chatMessages.off("child_changed");
						chatMessages.off("child_removed");

						let chatItem, unreadCount; // Holds the chat item element

						// Set up child_added listener
						chatMessages.on(
							"child_added",
							function (snapshot) {
								try {
									const messages = snapshot.val();
									//console.log("Child Added", messages);
									chatItem = findChatItemById(messages.chatId);
									if (!chatItem) {
										return;
									}
									chatItem
										.find(".chats__message")
										.html(formatMessage(messages.message));

									if (messages.isDeleted === true) {
										chatItem
											.find(".chats__message")
											.html(
												'<span class="text-msg-deleted">This message was deleted</span>'
											);
									}
									else if (
										messages.isSeen === false &&
										!isCurrentUserMessage(messages)
									) {
										unreadCount =
											Number(chatItem.find(".message__unread").text().trim()) +
											1;
										chatItem
											.find(".message__unread")
											.html(unreadCount)
											.removeClass("hidden");
										
										// Updating the text inside the Chat Drill Down page if its open
										var singleChatPage = jQuery('#singleChat');
										if (singleChatPage.hasClass('active') &&
										!isCurrentUserMessage(messages) && jQuery('.chat__header').data('chatId') == messages.chatId) {
											addNewChatMessageOther(messages);
										}
										
									}
									
									if (chatItem) {
										// For Group 
										if (messages.chatType === "group") {
										
										}
									}
									
								} catch (error) {
									//console.error("Error in child_added listener:", error);
								}
							},
							(error) => {
								////console.error("Firebase child_added error:", error);
								// Don't reject here to keep the app running
							}
						);

						// Set up child_changed listener
						chatMessages.on(
							"child_changed",
							function (snapshot) {
								try {
									const messages = snapshot.val();
									//console.log("Child Changed", messages);
									
									
									// chatItem = findChatItemById(messages.chatId);
									// // Shift the message card to the top
									// chatItem.prependTo(".chats__list");
									
								} catch (error) {
									//console.error("Error in child_changed listener:", error);
								}
							},
							(error) => {
								//console.error("Firebase child_changed error:", error);
							}
						);

						// Set up child_removed listener
						chatMessages.on(
							"child_removed",
							function (snapshot) {
								try {
									const messages = snapshot.val();
									//console.log("Child Removed", messages);
								} catch (error) {
									//console.error("Error in child_removed listener:", error);
								}
							},
							(error) => {
								//console.error("Firebase child_removed error:", error);
							}
						);

						// Resolve this chat's promise after listeners are set up
						chatResolve();
					});
				});

				// Wait for all chat promises to resolve
				Promise.all(promises)
					.then(() => resolve())
					.catch((error) => reject(error));
			}
			else if (state === "userChats") {
				const userChats = firebase.database().ref("userChats/" + data.userId);
				localStorage.setItem("plainUserId", data.userId);

				// Detach existing listeners
				userChats.off("child_added");
				userChats.off("child_changed");

				// Check if userChats has children
				userChats
					.once("value")
					.then((snapshot) => {
						if (snapshot.hasChildren()) {
							//console.log("The userChats reference has children.");
						} else {
							console.log(
								"The userChats reference does not have any children."
							);
						}

						// Set up child_added listener
						userChats.on(
							"child_added",
							function (snapshot) {
								try {
									const messages = snapshot.val();

									//console.log("Child Added", messages);
									if (messages.isRejected === true) {
										return;
									}
									
									if (localStorage.getItem('plainUserId') == messages.last_message_sender_id) {
										console.log("User ID matches, skipping...");
										return;
									}
									if (messages.chatId == null) {
										console.log("Chat ID is null", messages);
										return;
									}
									var chatItem = findChatItemById(messages.chatId);
									if (!chatItem) {
										
										if (messages.chatType === "group") {
											chatName = messages.groupName;
											profilePic = messages.groupProfileUrl;
											// If chatItem is not found, create a new one
											jQuery("#main .chats__list").prepend(createChatCard(messages.chatType, profilePic, chatName, formatDateForChat(messages.last_message_time), 'Group created by ' + messages.createdByName));
											
										}
										else {
											var lastMessage = messages.last_message;
											if (lastMessage == '') {
												lastMessage = '📷 Media'
											}
											if (messages.userInfo == null) {
												console.log("User display name is null", messages);
												return;
											}
											chatName = messages.userInfo.displayName;
											profilePic = messages.userInfo.profilePic;
											// If chatItem is not found, create a new one
											jQuery("#main .chats__list").prepend(createChatCard(messages.chatType, profilePic, chatName, formatDateForChat(messages.last_message_time), lastMessage));
											
											
										}
										addChatData(messages, 'topChild');
										
										
										jQuery(".chats__item:first-child").data("chatId", messages.chatId)
										chatItem = findChatItemById(messages.chatId);
										var unreadCount =
											Number(chatItem.find(".message__unread").text().trim()) + 1;
		
										chatItem
												.find(".message__unread")
												.html(unreadCount)
												.removeClass("hidden");
									}
									
									
									// Shift the message card to the top
									// chatItem.prependTo(".chats__list");

									// If this is a group chat, fetch group members
									if (messages.chatType === "group") {
										const groupMembers = firebase
											.database()
											.ref("groupUsers/" + messages.chatId);
										groupMembers
											.once("value")
											.then((snapshot) => {
												const allData = snapshot.val();
												console.log("Group Members", allData);
												if (allData !== null) {
													//allData.groupId = messages.chatId;
													//createDbForGroupUsers([allData]);
												}
											})
											.catch((error) =>
												console.error("Error fetching group members:", error)
											);
									}

									// Process messages if chat is open
									/*if (localStorage.getItem("chat__open")) {
										createDatabase([messages])
											.then(() =>
												subscribeToChat([messages], "sendChatToIndexed")
											)
											.then(() => subscribeToChat([messages], "chats"))
											.catch((error) =>
												console.error("Error in chat processing chain:", error)
											);
									}*/
								} catch (error) {
									console.error("Error in userChats child_added:", error);
								}
							},
							(error) => {
								console.error("Firebase userChats child_added error:", error);
							}
						);

						// Set up child_changed listener
						userChats.on(
							"child_changed",
							function (snapshot) {
								try {
									const messages = snapshot.val();
									console.log("Child Changed", messages);
									if (messages.last_message.trim() === "") {
										console.log("Empty message, skipping...");
										return;
									}
									
									var chatItem = findChatItemById(messages.chatId);
									if (!chatItem) {
										if (messages.chatType === "group") {
											if (localStorage.getItem('plainUserId') == messages.last_message_sender_id) {
												console.log("User ID matches, skipping...");
												return;
											}
											chatName = messages.groupName;
										}
										else {
											if (localStorage.getItem('plainUserId') == messages.userInfo.from_uid) {
												console.log("User ID matches, skipping...");
												return;
											}
											chatName = messages.userInfo.displayName;
										}
										var lastMessage = messages.last_message;
										if (lastMessage == '') {
											lastMessage = '📷 Media'
										}
										// If chatItem is not found, create a new one
										jQuery("#main .chats__list").prepend(createChatCard(messages.chatType, messages.userInfo.profilePic, chatName, formatDateForChat(messages.last_message_time), lastMessage));
										
										jQuery(".chats__item:first-child").data("chatId", messages.chatId)
										chatItem = findChatItemById(messages.chatId);
										var unreadCount =
											Number(chatItem.find(".message__unread").text().trim()) + 1;
		
										chatItem
												.find(".message__unread")
												.html(unreadCount)
												.removeClass("hidden");
									}
									else {
										// Shift the message card to the top
										chatItem.prependTo(".chats__list");
										
										chatItem = findChatItemById(messages.chatId);
										if (messages.isSeen === false && !isCurrentUserMessage(messages)) {
											var unreadCount =
												Number(chatItem.find(".message__unread").text().trim()) + 1;
		
								
											
											chatItem
												.find(".message__unread")
												.html(unreadCount)
												.removeClass("hidden");
										}
										
									}
									
								} catch (error) {
									console.error("Error in userChats child_changed:", error);
								}
							},
							(error) => {
								console.error("Firebase userChats child_changed error:", error);
							}
						);

						resolve();
					})
					.catch((error) => {
						console.error("Error checking userChats:", error);
						reject(error);
					});
			} else if (state === "groupChats") {
				function processChats(data) {
					let promises = [];

					data.forEach((chat) => {
						if (chat.chatId && chat.chatId.isRemoved === 1) {
							return;
						}

						if (chat.chatType === "group") {
							let groupMembers = firebase
								.database()
								.ref("groupUsers/" + chat.chatId)
								.limitToLast(100);

							// Detach existing listeners
							let groupMembersInfo = firebase
								.database()
								.ref("groupUsers/" + chat.chatId + "/members")
								.limitToLast(100);
							groupMembersInfo.off("child_changed");

							// Create a promise for the 'once' operation
							let oncePromise = new Promise((resolve, reject) => {
								groupMembers
									.once("value")
									.then((snapshot) => {
										var allData = snapshot.val();
										console.log("Group Members", allData);
										// if (allData) {
										// 	allData.groupId = chat.chatId;
										// 	createDbForGroupUsers([allData]);
										// }
										resolve();
									})
									.catch((error) => {
										console.error("Error fetching group members:", error);
										reject(error);
									});
							});

							promises.push(oncePromise);

							// Set up child_changed listener
							groupMembersInfo.on(
								"child_changed",
								function (snapshot) {
									try {
										console.log("child_changed", snapshot.val());
										var changedUserData = snapshot.val();
										console.log("Changed User Data", changedUserData);

										// updateMemberInfo(
										// 	chat.chatId,
										// 	changedUserData.uid,
										// 	changedUserData
										// );
									} catch (error) {
										console.error(
											"Error in groupMembersInfo child_changed:",
											error
										);
									}
								},
								(error) => {
									console.error(
										"Firebase groupMembersInfo child_changed error:",
										error
									);
								}
							);
						}
					});

					// Return a promise that resolves when all 'once' operations are done
					return Promise.all(promises);
				}

				// Process chats and resolve/reject the main promise
				processChats(data)
					.then(() => {
						console.log("All chats processed");
						resolve();
					})
					.catch((error) => {
						console.error("Error processing chats:", error);
						reject(error);
					});
			} else {
			/*else if (state === "sendChatToIndexed") {
				let promises = [];

				if (Array.isArray(data)) {
					promises = data.map((chat) => {
						return new Promise((resolve, reject) => {
							let chatMessages = firebase
								.database()
								.ref("chats/" + chat.chatId + "/messages/")
								.limitToLast(1);

							chatMessages
								.once("value")
								.then((snapshot) => {
									let messages = snapshot.val();
									if (messages) {
										let messageArr = [];
										// Convert object to array if needed
										if (
											typeof messages === "object" &&
											!Array.isArray(messages)
										) {
											Object.keys(messages).forEach((key) => {
												messageArr.push(messages[key]);
											});
										} else {
											messageArr.push(messages);
										}
										return createDbForChatId(messageArr);
									}
								})
								.then(() => resolve())
								.catch((error) => {
									console.error(
										"Error fetching or processing messages:",
										error
									);
									reject(error);
								});
						});
					});
				} else {
					console.error("Data is not an array");
					resolve(); // Resolve anyway to prevent blocking
				}

				Promise.all(promises)
					.then(() => resolve())
					.catch((error) => {
						console.error("Error in sendChatToIndexed:", error);
						reject(error);
					});
			}*/
				// Unknown state, resolve immediately
				resolve();
			}
		} catch (error) {
			console.error("Error in subscribeToChat:", error);
			reject(error);
		}
	});
}

function updateChatInsideDrillDownPage(message) {
	
}

/*function renderChatPreview(message, from) {
	return new Promise((resolve, reject) => {
		try {
			jQuery(".chat__item").each(function () {
				const $this = jQuery(this);
				const chatId = $this.data("chat-id");
				let messageToUse = message;

				// Find the corresponding message in sortedChat array if needed
				if (localStorage.getItem("chat__open") && from !== "deleted") {
					messageToUse = sortedChat.find(function (chat) {
						return chat.chatId === chatId;
					});
				}

				const $messagePreview = $this.find(".css-26blw5");
				const $newMessages = $this.find(".css-1h2atly");
				let messagePreview = "";

				if (
					messageToUse &&
					messageToUse.chatId !== undefined &&
					$this.data("chat-id") === messageToUse.chatId
				) {
					// Determine message preview based on message type
					switch (messageToUse.type) {
						case "media":
							if (messageToUse.media && messageToUse.media.length > 0) {
								switch (messageToUse.media[0].mediaType) {
									case "image":
										messagePreview = '<i class="fa fa-camera"></i> Photo';
										break;
									case "video":
										messagePreview = '<i class="fa fa-video"></i> Video';
										break;
									case "document":
										messagePreview = '<i class="fa fa-file"></i> Document';
										break;
								}
							}
							break;
						case "post":
							if (messageToUse.post) {
								switch (messageToUse.post.postType) {
									case "share":
										messagePreview = '<i class="fa fa-share"></i> Post';
										break;
									case "find_buddy":
										messagePreview =
											'<i class="fa fa-search"></i> Find Buddy Post';
										break;
									case "meetup":
										messagePreview =
											'<i class="fa fa-map-marker"></i> Meetup Plan';
										break;
									case "ask":
										messagePreview = '<i class="fa fa-question"></i> Ask Post';
										break;
								}
							}
							break;
						case "experience":
							if (messageToUse.post) {
								messagePreview =
									'<i class="fa fa-user"></i> ' +
									(messageToUse.post.postType === "service"
										? "Service"
										: "Experience");
							}
							break;
						case "profile":
							messagePreview = '<i class="fa fa-user"></i> Profile';
							break;
						case "status":
						default:
							messagePreview = messageToUse.message;
							break;
					}

					if (messageToUse.isDeleted === true) {
						messagePreview = '<i class="fa fa-trash"></i> Message Deleted';
					}

					$messagePreview.html(messagePreview);

					// Handle new message indicator
					if (
						messageToUse.isSeen === false &&
						!messageToUse.isDeleted &&
						jQuery(".singleChat__message-" + messageToUse.timeStamp).length ===
							0 &&
						!isCurrentUserMessage(messageToUse)
					) {
						let newMessages = parseInt(
							$newMessages.attr("new-messages") || "0",
							10
						);
						newMessages++;
						$newMessages
							.attr("new-messages", newMessages)
							.html(
								'<div class="badgeIcon chat-icon MuiBox-root css-o4fspg">New</div>'
							);
					}

					// Update timestamp
					const timeStamp = formatDateForChat(messageToUse.timeStamp);
					$this.find(".timeStamp").html(timeStamp);
					$this.attr("data-timestamp", messageToUse.timeStamp);
				}
			});

			resolve();
		} catch (error) {
			console.error("Error in renderChatPreview:", error);
			reject(error);
		}
	});
}*/

function isCurrentUserMessage(message) {
	try {
		const currentUserId = localStorage.getItem("plainUserId");
		return Number(currentUserId) === Number(message.senderId);
	} catch (error) {
		console.error("Error in isCurrentUserMessage:", error);
		return false;
	}
}

// Example of how to use the refactored code
/*function exampleUsage() {
	// Example data
	const chatData = [{ chatId: "chat123", chatType: "direct" }];

	// Chain promises for sequential operations
	subscribeToChat(chatData, "chats")
		.then(() => {
			console.log("Chat subscription complete");
			return subscribeToChat({ userId: "user123" }, "userChats");
		})
		.then(() => {
			console.log("User chats subscription complete");
			return subscribeToChat(chatData, "groupChats");
		})
		.then(() => {
			console.log("Group chats subscription complete");
			return subscribeToChat(chatData, "sendChatToIndexed");
		})
		.then(() => {
			console.log("All subscriptions complete");
		})
		.catch((error) => {
			console.error("Error in subscription chain:", error);
		});
}*/

// Log that the code is ready
//console.log('Firebase chat subscription code refactored with Promises');
