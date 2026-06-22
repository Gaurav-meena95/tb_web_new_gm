try {
	googleAnalytics = firebase.analytics();
} catch (error) {
	console.log(error);
}

function manageNotificationToken(state, data) {
	token = null;

	if (state == 'init') {
		if (localStorage.getItem('notificationToken') == null) {
			getStartToken();
		}
		else {
			token = manageNotificationToken('get');
		}
	}
	else if (state == 'set') {
		localStorage.setItem('notificationToken', data);
		token = manageNotificationToken('get');

	}
	else if (state == 'get') {
		token = localStorage.getItem('notificationToken');
	}
	else if (state == 'vendorUUID') {
		token = localStorage.getItem('vendorUUID');
	}

	return token;
}



//This code recieve message from server /your app and print message to console if same tab is opened as of project in browser
/*if (messaging && messaging.onMessage){
	messaging.onMessage(function (payload) {
		console.log("on Message", payload);
		const notificationTitle = payload.notification.title;
		const notificationOptions = {
			body: payload.notification.body,
			icon: 'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/web-view%2Ffavicon.png?alt=media&token=ebbc66db-499e-417c-ac48-b1bd25e031bf',
			data: {
				url: payload.data.onClick
			}, //the url which we gonna use later
		};
	
		return self.registration.showNotification(notificationTitle, notificationOptions);
	});
}*/



function getStartToken() {
    if (!isIOS() && !isAndroid()) {
		try {
			let op = detectOperatingSystem();
			if (op != '5') {
				RequestPermission();
			}
            // messaging.getToken().then((currentToken) => {
            //     if (currentToken) {
            //         manageNotificationToken('set', currentToken);
            //     }
            //     else {
            //         // Show permission request.
            //         RequestPermission();
            //         // setTokenSentToServer(false);
            //     }
            // }).catch((err) => {
            //     console.log('An error occurred while retrieving token. ', err);
            //     // setTokenSentToServer(false);
            // });
        } catch (error) {
        }
    }
}

function RequestPermission() {
	// Assuming 'messaging' is already initialized Firebase Messaging service instance
	Notification.requestPermission().then((permission) => {
	if (permission === 'granted') {
		console.log('Notification permission granted.');

		// Get the token
		messaging.getToken({vapidKey: 'BAD0YHf3bocPGXl-3jVH2FGbVmK8nYjbJm2_sgJ-P0Coxxw5uqtPmOpAMTiICNz4xcsOpp6oEYn4kWXiMb1ja7o'}).then((currentToken) => {
		if (currentToken) {
			console.log('FCM Token:', currentToken);
			localStorage.setItem('notificationToken', currentToken);
			// Proceed with sending the token to your server, etc.
		} else {
			console.log('No Instance ID token available. Request permission to generate one.');
		}
		}).catch((err) => {
		console.log('An error occurred while retrieving token. ', err);
		});
	} else {
		console.log('Unable to get permission to notify.');
	}
	}).catch((err) => {
	console.log('Unable to get permission to notify.', err);
	});
}

// Create a Recaptcha verifier instance globally
// Calls submitPhoneNumberAuth() when the captcha is verified
// window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
// 	"recaptcha-container",
// 	{
// 		size: "invisible",
// 		callback: function (response) {
// 			console.log("Recaptcha response:", response)
// 		}
// 	}
// );

window.appVerifier = undefined;
function firebaseOTP(state, data) {
	if (state == 'sendSMS') {
		console.log(data);
		submitPhoneNumberAuth(data);
		// This function runs when the 'sign-in-button' is clicked
		// Takes the value from the 'phoneNumber' input and sends SMS to that phone number
		function submitPhoneNumberAuth(data) {
			var container = document.getElementById("recaptcha-container");
			if ((container.childNodes.length === 0) || (window.appVerifier === undefined)) {
				window.appVerifier = new firebase.auth.RecaptchaVerifier(
					"recaptcha-container",
					{
						size: "invisible",
						callback: function (response) {
							console.log(response)
						}
					}
				);
			}
			country_code = manageCountryCode(data.dialCode);
			firebase
				.auth()
				.signInWithPhoneNumber(country_code + data.phoneNumber, window.appVerifier)
				.then(function (confirmationResult) {
					window.confirmationResult = confirmationResult;
					if (data.state !== 'resend') {
						redirect('otp', data);
					}
				})
				.catch(function (error) {
					console.log(error);
					toast('There was an error sending an OTP to this number. Please try a different number or again in sometime.', 6500);
				});
		}
	}
	else if (state == 'verifyOTP') {
		console.log(data);
		submitPhoneNumberAuthCode(data.otp);
		source = data.where;
		if (data.where == 'signUp') {
			dialCode = data.dialCode;
			phoneNumber = data.phoneNumber;
			userName = data.fullName;
			email = data.email;
			password = data.password;
			otpId = data.otpId;
			deviceType = data.deviceType;
		}



		// This function runs when the 'confirm-code' button is clicked
		// Takes the value from the 'code' input and submits the code to verify the phone number
		// Return a user object if the authentication was successful, and auth is complete
		function submitPhoneNumberAuthCode(data) {
			code = Number(data);
			console.log(code);
			confirmationResult
				.confirm(code)
				.then(function (result) {
					/*if (source == 'experience') {
						jQuery('.secondary__tab.otpBody .drawer__back').trigger('click');
					}*/
					if (source == 'signUp') {
						localStorage.setItem('updatedPhoneNumber', phoneNumber);
						localStorage.setItem('updatedCountryCode', dialCode);
						jsInit('signUpOTP', {
							name: userName,
							email: email,
							countryCode: dialCode,
							phone: phoneNumber,
							enteredOTP: code,
							otpId: otpId,
							password: password,
							gender: '0',
							referralCode: '',
							deviceId: '',
							deviceType: deviceType,
							vendorUUID: '',
							deviceUniqueId: '',
							appVersion: appVersion,
						});
					}
					
					
					
					else {
						jsInit('updatePhoneNumber', { phoneNumber: jQuery('#onboarding__phone').val(), dialCode: manageCountryCode(jQuery('#onboarding__countryCode').val()), otp: otp }, 'onboarding');
					}
				})
				.catch(function (error) {
					console.log(error);
					renderOnboarding('updatePhoneNumber', { responseCode: 400, errorMessage: 'OTP is incorrect.' });
				});
		}
	}
	else if (state == 'editProfile_sendSMS') {
		console.log(data);
		submitPhoneNumberAuth(data);
		// This function runs when the 'sign-in-button' is clicked
		// Takes the value from the 'phoneNumber' input and sends SMS to that phone number
		function submitPhoneNumberAuth(data) {
			var appVerifier = window.recaptchaVerifier;
			country_code = manageCountryCode(data.dialCode);
			firebase
				.auth()
				.signInWithPhoneNumber(country_code + data.phoneNumber, appVerifier)
				.then(function (confirmationResult) {
					window.confirmationResult = confirmationResult;
					if (data.state !== 'resend') {
						//redirect('otp', data);
						jQuery('#edit__otp').show();
						jQuery('.edit__row-phone').after('<input type="number" name="editProfile__otp" placeholder="123456" id="edit__otp">');
						jQuery('#editProfile .editVerifyPhone').addClass('verifyOtp').removeClass('verify');
						toast('OTP Sent');
					}
				})
				.catch(function (error) {
					console.log(error);
				});
		}
	}
	else if (state == 'editProfile_verifyOTP') {
		submitPhoneNumberAuthCode(data.otp);
		console.log(data);

		// This function runs when the 'confirm-code' button is clicked
		// Takes the value from the 'code' input and submits the code to verify the phone number
		// Return a user object if the authentication was successful, and auth is complete
		function submitPhoneNumberAuthCode(data) {
			code = Number(data);
			console.log(code);
			confirmationResult
				.confirm(code)
				.then(function (result) {
					jsInit('updatePhoneNumber', { phoneNumber: jQuery('#edit__phone').val(), dialCode: manageCountryCode(jQuery('#editProfile__countryCode').val()), otp: jQuery('#edit__otp').val() }, 'editProfile');
				})
				.catch(function (error) {
					renderOnboarding('updatePhoneNumber', { responseCode: 400, errorMessage: 'OTP is incorrect.' });
				});
		}
	}
}

function manageSocialLogin(state) {
	if (state == 'init') {
		try {
			deviceType = 'web';
			if (isAndroid()) {
				deviceType = 'android';
			}
			else if (isIOS()) {
				deviceType = 'ios';
			}
			firebase.auth().onAuthStateChanged(function() {
				if (jQuery('.login__outer-view').attr('data-populated') == 'true') {
					if (!firebaseui.auth.AuthUI.getInstance()) {
						fireBaseAuthUI = new firebaseui.auth.AuthUI(firebase.auth())
					}
					const fireBaseAuthUIConfig = {
						callbacks: {
							signInSuccessWithAuthResult(authResult, redirectUrl) {
								if (authResult.credential.signInMethod == 'google.com') {
									console.log(authResult.additionalUserInfo.profile.picture);
									jsInit('loginGoogle', { name: authResult.additionalUserInfo.profile.name, email: authResult.user.multiFactor.user.email, deviceId: manageNotificationToken('get'), deviceType: deviceType, googleId: authResult.additionalUserInfo.profile.id, redirectedFromGuest: false, googleToken: authResult.credential.idToken, vendorUUID: 'CFA13505-3414-4824-B6C5-D154C15D0249', deviceUniqueId: '', appVersion: appVersion, imageUrl: authResult.additionalUserInfo.profile.picture }, 'onboarding');
								}

								else if (authResult.credential.signInMethod == 'facebook.com') {
									jsInit('loginFacebook', { name: authResult.additionalUserInfo.profile.name, email: authResult.additionalUserInfo.profile.email, deviceId: manageNotificationToken('get'), deviceType: deviceType, deviceUniqueId: "", imageUrl: authResult.additionalUserInfo.profile.picture.data.url, facebookId: authResult.additionalUserInfo.profile.id, facebookToken: authResult.credential.accessToken, vendorUUID: 'CFA13505-3414-4824-B6C5-D154C15D0249' })
								}
								console.log(authResult);
								console.log(redirectUrl);

								return false
							},
							uiShown() {
								// document.getElementById("loader").style.display = "none"
							},
						},
						signInFlow: "popup",
						signInOptions: [
							firebase.auth.FacebookAuthProvider.PROVIDER_ID,
							firebase.auth.GoogleAuthProvider.PROVIDER_ID
							// firebase.auth.AppleAuthProvider.PROVIDER_ID
						]
					}
				}
			});

			if (isIOS() || isAndroid()) {
				if (isAndroid) {
					source = 'android';
				}
				else if (isIOS) {
					source = 'ios';

				}

				jQuery('.login__social').empty();

				//Add Google Login Button
				jQuery('.login__social').append('<div class="login__social__button login__social__button--google login__google-' + source + '"><i class="fa fa-google"></i> Sign in with Google</div>');

				//Add Facebook Login Button
				jQuery('.login__social').append('<div class="login__social__button login__social__button--facebook login__facebook-' + source + '"><i class="fa fa-facebook"></i> Sign in with Facebook</div>');

				if (isIOS()) {
					//Add Apple Login Button
					jQuery('.login__social').append('<div class="login__social__button login__social__button--apple login__apple-ios"><i class="fa fa-apple"></i> Sign in with Apple</div>');
				}
			}
			else {
				if (jQuery('.login__outer-view').attr('data-populated') !== 'true') {
					fireBaseAuthUI = new firebaseui.auth.AuthUI(firebase.auth())
					const fireBaseAuthUIConfig = {
						callbacks: {
							signInSuccessWithAuthResult(authResult, redirectUrl) {
								if (authResult.credential.signInMethod == 'google.com') {
									console.log('Google', authResult);

									if (authResult.additionalUserInfo.isNewUser) {
										email = authResult.user.multiFactor.user.email;
									}
									else {
										email = authResult.additionalUserInfo.profile.email;
									}

									payload = { name: authResult.additionalUserInfo.profile.name, email: email, deviceId: manageNotificationToken('get'), deviceType: deviceType, googleId: authResult.additionalUserInfo.profile.id, redirectedFromGuest: false, googleToken: authResult.credential.idToken, vendorUUID: 'CFA13505-3414-4824-B6C5-D154C15D0249', deviceUniqueId: '', appVersion: appVersion, imageUrl: authResult.additionalUserInfo.profile.picture }
									console.log(payload);
									jsInit('loginGoogle', payload, 'onboarding');
								}
								else if (authResult.credential.signInMethod == 'facebook.com') {
									payload = { name: authResult.additionalUserInfo.profile.name, email: authResult.additionalUserInfo.profile.email, deviceId: manageNotificationToken('get'), deviceType: deviceType, deviceUniqueId: "", imageUrl: authResult.additionalUserInfo.profile.picture.data.url, facebookId: authResult.additionalUserInfo.profile.id, facebookToken: authResult.credential.accessToken, vendorUUID: 'CFA13505-3414-4824-B6C5-D154C15D0249' }

									jsInit('loginFacebook', payload);
								}
								console.log(authResult);
								console.log(redirectUrl);

								return false
							},
							uiShown() {
								// document.getElementById("loader").style.display = "none"
							},
						},
						signInFlow: "popup",
						signInOptions: [
							firebase.auth.FacebookAuthProvider.PROVIDER_ID,
							firebase.auth.GoogleAuthProvider.PROVIDER_ID
							// firebase.auth.AppleAuthProvider.PROVIDER_ID
						],
					}

					showLogin();

					function showLogin() {
						if (jQuery('.login__outer-view').length > 0) {
							setTimeout(function () {
								fireBaseAuthUI.start(".login__outer-view", fireBaseAuthUIConfig)
								jQuery('.login__outer-view').attr('data-populated', 'true');
							}, 150);
						}
						else {
							setTimeout(function () {
								showLogin();
							}, 2000);
						}
					}
				}
			}
		} catch (error) { console.log(error) }
	}
}



function subscribeToChat(data, state) {
	
	if (state == 'chats') {
		data.forEach(chat => {
			if (chat.chatId && chat.chatId.isRemoved == 1) {
				return;
			}

			const chatMessages = firebase.database().ref("chats/" + chat.chatId + "/messages/").limitToLast(1);
            
            // Detach any existing listeners to prevent multiple firings
            chatMessages.off("child_added");

			chatMessages.on("child_added", function (snapshot) {
				messages = snapshot.val();
				manageMessage(messages, 'Child Added');
			});
            // Detach any existing listeners to prevent multiple firings
            chatMessages.off("child_changed");

			chatMessages.on("child_changed", function (snapshot) {
				messages = snapshot.val();
				manageMessage(messages, 'Child Changed');
			});

			chatMessages.on('child_removed', (snapshot) => {
				messages = snapshot.val();
				messageArr = [];
				messageArr.push(messages, 'Child Removed');

				messageArr.forEach(message => {
					// console.log('Removed message:', message);
				});
			});
		});
	}
	else if (state == 'userChats') {
		const userChats = firebase.database().ref("userChats/" + data.userId).limitToLast(200);
		localStorage.setItem('plainUserId', data.userId);
		
		userChats.once('value', function(snapshot) {
			if (snapshot.hasChildren()) {
				console.log("The userChats reference has children.");
				// Handle the case where there are children
			} else {
				console.log("The userChats reference does not have any children.");
				// Handle the case where there are no children
				loaderMain('global', false);
			}
		});

		userChats.on("child_added", function (snapshot) {
            
            // Check firebase-chat-connection.js file
            // There should be a single update in groupUsers node
            // Currently multiple updates should be there as per the current output
            // As a result, the groupUsers node is not updating fully and is excluding the members node Changes
            
			messages = snapshot.val();
            if (shouldAppendFromChildAdded) {
                appendDeltaChatDataFromIndexedDb('prepend', messages);
            }
            if (messages.chatType == 'group') {
                groupMembers = firebase.database().ref("groupUsers/" + messages.chatId);
                groupMembers.once("value", function(snapshot) {
                    var allData = snapshot.val();
                    if (allData !== null) { // Check if allData is not null
                        allData.groupId = messages.chatId;
                        createDbForGroupUsers([allData]);
                    }
                });
            }
            let messageArr = [messages];
            if (localStorage.getItem('chat__open')) {
				//createDatabase(messageArr);
				createDatabase(messageArr).then(() => {
					subscribeToChat(messageArr, 'sendChatToIndexed').then(() => {
						subscribeToChat(messageArr, 'chats');
					});
				});
            }
            
		}, function (error) {
			alert(error);
		});

		userChats.on("child_changed", function (snapshot) {
			messages = snapshot.val();
            
            appendDeltaChatDataFromIndexedDb('prepend', messages);

			chatItem = jQuery('.chat__item-' + messages.chatId);
			isRejectedNew = (messages.isRejected) ? '"true"' : '';

			if (messages.isMsgReqAccepted == true) {
				jQuery('.chat__item-' + messages.chatId).attr('data-isaccepted', messages.isMsgReqAccepted);
			}

			if (chatItem.attr('data-rejected') !== messages.isRejectedNew) {
				(messages.isRejected) ? chatItem.addClass('rejected') : chatItem.removeClass('rejected');
				jQuery('.chat__item-' + messages.chatId).attr('data-rejected', messages.isRejected);
			}

		}, function (error) {
			alert(error);
		});
		
	}
	else if (state == 'groupChats') {
		function processChats(data) {
            let promises = [];

            data.forEach(chat => {
                if (chat.chatId && chat.chatId.isRemoved == 1) {
                    return;
                }

                if (chat.chatType == 'group') {
                    let groupMembers = firebase.database().ref("groupUsers/" + chat.chatId).limitToLast(100);

                    // Create a promise for the 'once' operation
                    let oncePromise = new Promise((resolve, reject) => {
                        groupMembers.once("value", function(snapshot) {
                            var allData = snapshot.val();
                            allData.groupId = chat.chatId;
                            createDbForGroupUsers([allData]);
                            //groupData.push(allData);
                            resolve(); // Resolve the promise when data is processed
                        }, reject); // Reject the promise on error
                    });

                    promises.push(oncePromise);
                    let groupMembersInfo = firebase.database().ref("groupUsers/" + chat.chatId + "/members").limitToLast(100);
                    
                    groupMembersInfo.on("child_changed", function(snapshot) {
                        console.log('child_changed', snapshot.val());
                        var changedUserData = snapshot.val();
                        updateMemberInfo(chat.chatId, changedUserData.uid, changedUserData);
                    });
                    
                }
            });

            // Return a promise that resolves when all 'once' operations are done
            return Promise.all(promises);
        }

        // Example usage
        processChats(data).then(() => {
            console.log('All chats processed');
        }).catch(error => {
            console.error('Error processing chats:', error);
        });
	}
	else if (state == 'sendChatToIndexed') {
		let promises = [];
		if (Array.isArray(data)) {
			promises = data.map(chat => {
				return new Promise((resolve, reject) => {
					let chatMessages = firebase.database().ref("chats/" + chat.chatId + "/messages/").limitToLast(1);
					chatMessages.once("value", function (snapshot) {
						let messages = snapshot.val();
						let messageArr = [];
						messageArr.push(messages);
						createDbForChatId(messageArr);
						resolve();
					});
				});
			});
		} else {
			console.error('Data is not an array');
		}

		return Promise.all(promises);
	}

	function manageGroupMembers(chat, messages) {
		messageArr = [];
		//Convert object to array
		Object.keys(messages).forEach(function (key) {
			messageArr.push(messages[key]);
		});

		payload = { chatId: chat.chatId, members: messageArr };
		manageUserChat('checkMemberInGroup', payload);
	}


	function manageMessage(messages, source) {
		if (typeof messages.chatId === 'object') { 
			return;
		}
		messageArr = [];
		messageArr.push(messages);
		messageArr.forEach(message => {
			chatItem = jQuery('.chat__item-' + message.chatId);
			chatVerified1O1();

			if (source == 'Child Changed' && message.isReadOnly){
				//To prevent multiple message rendering which receives from a message dashboard
			}
			else if (chatItem.attr('data-rejected') == 'false' || chatItem.attr('data-chat-type') == 'group') {
				if (message.isDeleted == true) {
					jQuery('.singleChat__message-' + message.timeStamp).find('.text-msg-box.css-1ht9t4r span').html('<span class="text-msg-deleted">This message was deleted</span>');
				}

				if (message.chatId.includes('_')) {
					if (!isCurrentUserMessage(message)) {
						if (jQuery('.singleChat__message[data-message-id="' + message.messageId + '"]').length == 0) {
							renderChatMessage('.singleChat__box', message);
							//commenting below code as it annoys the user when the app loads
							/*if (!message.isSeen) {
								playSound('message');
							}*/
						}
					}
				}
				else {
					if (jQuery('.singleChat__message-' + message.timeStamp).length == 0) {
                        userIdPlain = localStorage.getItem('plainUserId');
                        if (userIdPlain != message.senderId) {
						    renderChatMessage('.singleChat__box', message);
						}/*if (!message.isSeen) {
							playSound('message');
						}*/
					}
				}
				message.isDeleted && renderChatPreview(message, 'deleted');
			}
			if (source == 'Child Added') { 
				// Using array destructuring to get the 0th Index data in fbSortedChat directly from the resolved value of fetchSortedChatData()
				fetchSortedChatData().then(([fbSortedChat]) => {
					// Convert message.timeStamp to a number directly in the if statement
					if (Number(fbSortedChat.timeStamp) < Number(message.timeStamp)) {
						chatDiv = document.querySelector(`.chat__item-${message.chatId}`);
						chatsContainer = document.querySelector('.chats__container');

						if (chatDiv) {
							jQuery(chatDiv).find('.css-26blw5').text(message.message);
							jQuery(chatDiv).find('.timeStamp').text(formatDateForChat(message.timeStamp));
							jQuery(chatDiv).attr('data-timestamp', message.timeStamp);
							if (!isCurrentUserMessage(message)) {
								jQuery(chatDiv).find('.css-1h2atly').html('<div class="badgeIcon chat-icon MuiBox-root css-o4fspg">New</div>');
							}
							chatsContainer.prepend(chatDiv);
							createDbForChatId([message], 'child_added');
						}
					}
				});
			}
		});
	}
}

function renderChatPreview(message, from) {
	jQuery('.chat__item').each(function () {
		$this = jQuery(this);
		var chatId = $this.data('chat-id'); // Fetch chatId from data-chat-id attribute
		// Find the corresponding message in sortedChat array
		if (localStorage.getItem('chat__open') && from != 'deleted') {
			message = sortedChat.find(function(chat) {
				return chat.chatId === chatId;
			});
		}
		$messagePreview = $this.find('.css-26blw5');
		$newMessages = $this.find('.css-1h2atly');
		messagePreview = '';

		if (message && message.chatId != undefined && $this.data('chat-id') == message.chatId) {
			switch (message.type) {
				case 'media':
					switch (message.media[0].mediaType) {
						case 'image':
							messagePreview = '<i class="fa fa-camera"></i> Photo';
							break;
						case 'video':
							messagePreview = '<i class="fa fa-video"></i> Video';
							break;
						case 'document':
							messagePreview = '<i class="fa fa-file"></i> Document';
							break;
					}
					break;
				case 'post':
					switch (message.post.postType) {
						case 'share':
							messagePreview = '<i class="fa fa-share"></i> Post';
							break;
						case 'find_buddy':
							messagePreview = '<i class="fa fa-search"></i> Find Buddy Post';
							break;
						case 'meetup':
							messagePreview = '<i class="fa fa-map-marker"></i> Meetup Plan';
							break;
						case 'ask':
							messagePreview = '<i class="fa fa-question"></i> Ask Post';
							break;
					}
					break;
				case 'experience':
					messagePreview = '<i class="fa fa-user"></i> ' + (message.post.postType == 'service' ? 'Service' : 'Experience');
					break;
				case 'profile':
					messagePreview = '<i class="fa fa-user"></i> Profile';
					break;
				case 'status':
				default:
					messagePreview = message.message;
					break;
			}

			if (message.isDeleted == true) {
				messagePreview = '<i class="fa fa-trash"></i> Message Deleted';
			}

			$messagePreview.html(messagePreview);

			if (message.isSeen == false && !message.isDeleted && jQuery('.singleChat__message-' + message.timeStamp).length == 0 && !isCurrentUserMessage(message)) {
				newMessages = $newMessages.attr('new-messages') || 0;
				newMessages++;
				$newMessages.attr('new-messages', newMessages).html('<div class="badgeIcon chat-icon MuiBox-root css-o4fspg">New</div>');
				// ' + newMessages + '
			}

			//Timestamp
			timeStamp = formatDateForChat(message.timeStamp);
			$this.find('.timeStamp').html(timeStamp);
			$this.attr('data-timestamp', message.timeStamp);

		}
	});

	loaderMain('global', false);
}

function isCurrentUserMessage(message) {
	response = false;
	currentUserId = localStorage.getItem('plainUserId');
	if (Number(currentUserId) == Number(message.senderId)) {
		response = true;
	}

	return response;
}

function handleSignIn(provider, loginType) {
	var deviceType = 'web';
	if (isAndroid()) {
		deviceType = 'android';
	}
	else if (isIOS()) {
		deviceType = 'ios';
	}
	firebase.auth().signInWithPopup(provider)
		.then((result) => {
			const authResult = result;
			const user = result.user;
			console.log('User signed in: ', user);
			var loginPayload = {
				name: authResult.additionalUserInfo.profile.name,
				email: authResult.user.email,
				deviceId: manageNotificationToken('get'),
				deviceType: deviceType,
				googleId: authResult.additionalUserInfo.profile.id,
				redirectedFromGuest: false,
				googleToken: authResult.credential.idToken,
				vendorUUID: 'CFA13505-3414-4824-B6C5-D154C15D0249',
				deviceUniqueId: '',
				appVersion: appVersion,
				imageUrl: authResult.additionalUserInfo.profile.picture
			};
			if (loginType == 'loginFacebook') {
				loginPayload = { name: authResult.additionalUserInfo.profile.name, email: authResult.additionalUserInfo.profile.email, deviceId: manageNotificationToken('get'), deviceType: deviceType, deviceUniqueId: "", imageUrl: authResult.additionalUserInfo.profile.picture.data.url, facebookId: authResult.additionalUserInfo.profile.id, facebookToken: authResult.credential.accessToken, vendorUUID: 'CFA13505-3414-4824-B6C5-D154C15D0249' }
			}

			// Call jsInit with the appropriate parameters
			jsInit(loginType, loginPayload, 'onboarding');
		})
		.catch((error) => {
			console.error('Error during sign in: ', error);
		});
}


// Function to send sign-in link to email
function sendSignInLinkToEmail(email) {
	
	var actionCodeSettings = {
        url: 'http://localhost:3000/',
        handleCodeInApp: true,
    };

	// Get the Url of the current page
	var url = window.location.href;
	if (url.includes('localhost')) {
		actionCodeSettings.url = 'http://localhost:3000/';
	}
	else if (url.includes('dev.')) {
		actionCodeSettings.url = 'https://dev.beatravelbuddy.com/';
	}
	else {
		actionCodeSettings.url = 'https://www.beatravelbuddy.com/';
		
	}
	

	if (isAndroid() || isIOS()) {
		actionCodeSettings = {
			// Use a Firebase Dynamic Link as the URL
			url: 'https://link.beatravelbuddy.com', // Replace with your dynamic link
			handleCodeInApp: true,
			iOS: {
				bundleId: 'com.beatravelbuddy.travelbuddy.com'
			},
			android: {
				packageName: 'com.beatravelbuddy.travelbuddy.com',
				installApp: true,
				minimumVersion: '12'
			},
			dynamicLinkDomain: 'link.beatravelbuddy.com'
		};
	}
	//actionCodeSettings.url = 'https://link.beatravelbuddy.com/';
    firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
        .then(() => {
            window.localStorage.setItem('emailForSignIn', email);
			console.log('Sign-in email sent.');
			alert('Sign-in email sent.');
        })
        .catch((error) => {
			console.error('Error sending sign-in email:', error);
			alert('Error sending sign-in email:', error);
        });
}

// Function to handle sign-in with email link
function handleSignInWithEmailLink() {
	//alert('Handling sign-in with email link', window.location.href);
	toast(window.location.href);
	if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
		//alert('Sign-in with email link');
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }

        firebase.auth().signInWithEmailLink(email, window.location.href)
            .then((result) => {
                window.localStorage.removeItem('emailForSignIn');
				console.log('User signed in:', result.user);
				console.log('Result:', result);
				alert('Successfully signed in with email link');
            })
            .catch((error) => {
				console.error('Error signing in with email link:', error);
				alert('Error signing in with email link:', error);
            });
    }
}

// Example usage: Send sign-in link to email
// document.getElementById('sendSignInLinkBtn').addEventListener('click', function() {
//     const email = document.getElementById('emailInput').value;
//     sendSignInLinkToEmail(email);
// });

// // Example usage: Handle sign-in with email link
// document.addEventListener('DOMContentLoaded', function() {
//     handleSignInWithEmailLink();
// });