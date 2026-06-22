"use strict";

// reference required files
const api_helper = require('./api-helper');
const jwtObj = require('./auth/commands/jwtValidation');
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
const apiHelper = require('./api-helper');
const sendNotification = require('./notification');
const { json } = require('body-parser');
const utils = require("./utils");
const seqConfig = require("./config/sequelize_config");
const { QueryTypes } = require('sequelize');
const writeSeqInstance = seqConfig.write_sequelize;
const env = process.env.NODE_ENV || 'prod';

var dbUrl = env === 'prod' ? "https://tbd-prod-174317-b933e.asia-southeast1.firebasedatabase.app/" : "https://tbd-prd-rel-30sep.asia-southeast1.firebasedatabase.app/";
//console.log('DB URL:', dbUrl);

// initialize firebase app
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: dbUrl,
	storageBucket: "gs://travelbuddy-174317.appspot.com", // Replace with your storage bucket

	//databaseURL: "https://tbd-prd-rel-30sep.asia-southeast1.firebasedatabase.app/"
});
const db = admin.database();

/************************************************/
// Sample Data to Test
// userId = 494036;
// data = {
//     displayName: "Vijay",
//     email: "vijay@gmail.com",
//     profilePic: "https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/200x200/uploads/display_pictures/494036-1690454428714.jpg",
//     role: "user",
//     uid: userId,
//     isOnline: true,
//     lastActive: timestamp,
//     creationDate: timestamp,
// };
// setUserNode(data, null);
/************************************************/

// Scenarios Handled
// 1. Create a new user node
// 2. Update an existing user node if exists or only keys provided in the payload

async function setUserNode(data, token) {
	let response = {
		status: 'failure',
		responseCode: 400,
		errorMessage: 'Invalid request'
	};
	try {
		if (!data || !token) {
			throw new Error("Invalid input data or token.");
		}
		// Authenticate the user and retrieve userId using the token
		const userId = await fetchUserIdFromToken(token);
		if (!userId || userId == -1) {
			// throw new Error("Authentication Failed.");
			//console.error('Authentication Failed', error);
			response = {
				status: 'failure',
				responseCode: 401,
				errorMessage: 'Unauthorised User'
			};
		}

		const timestamp = Math.floor(Date.now() / 1000);
		const key = userId;
		const selfRef = db.ref(`users/${key}`);
		let recUpdated = false;
		const existingSnapshot = await selfRef.once("value", function (snapshots) {
			snapshots.forEach(function (userSnapshot) {
				recUpdated = true;
				selfRef.update({
					displayName: data.displayName,
					email: data.email,
					profilePic: data.profilePic,
					role: data.role,
					uid: key,
					isOnline: true,
					lastActive: timestamp,
					creationDate: timestamp,
				})
			})
		});

		if (!recUpdated) {
			await selfRef.set({
				displayName: data.displayName,
				email: data.email,
				profilePic: data.profilePic,
				role: data.role,
				uid: key,
				isOnline: true,
				lastActive: timestamp,
				creationDate: timestamp,
			});
		}

		response = {
			status: 'success',
			responseCode: 200,
			errorMessage: existingSnapshot ? 'User Node Updated Successfully' : 'User Node Created Successfully',
			plainUserId: userId
		};
	} catch (error) {
		//console.error('An error occurred:', error);
		response = {
			status: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error'
		};
	}
	return response;
}

async function getUserNode(userId, key) {
	try {
		if (userId == undefined) {
			throw new Error("userId is missing.");
		}

		const userRef = db.ref(`users/${userId}`);
		const snapshot = await userRef.once("value");
		const userData = snapshot.val();
		let response;

		if (userData) {
			if (key) {
				if (userData[key]) {
					response = {
						state: 'success',
						responseCode: 200,
						errorMessage: '',
						userData: {
							[key]: userData[key]
						}
					};
				}
				else {
					response = {
						state: 'failure',
						responseCode: 404,
						errorMessage: 'Key not found in user data.',
						userData: {}
					};
				}
			}
			else {
				response = {
					state: 'success',
					responseCode: 200,
					errorMessage: '',
					userData: userData
				};
			}

			return response;
		}
		else {
			return {
				state: 'failure',
				responseCode: 404,
				errorMessage: 'User data not found.',
				userData: {}
			};
		}
	}
	catch (error) {
		//console.error("Error fetching user data:", error);
		return {
			state: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error',
			userData: {}
		};
	}
}

const fetchChatsInBatches = async (batchSize) => {
    let allChats = [];
    let lastKey = null;
    let shouldFetch = true;

    while (shouldFetch) {
        let query = db.ref("chats").orderByKey().limitToFirst(batchSize);

        if (lastKey) {
            query = query.startAt(lastKey);
        }

        const snapshot = await query.once("value");
        const data = snapshot.val();

        if (data) {
            const dataArray = Object.values(data);
            allChats = allChats.concat(dataArray);

            // Update lastKey to the last key in the current batch
            lastKey = Object.keys(data).pop();

            // If we retrieved less than the batchSize, we're done
            if (dataArray.length < batchSize) {
                shouldFetch = false;
            }
        } else {
            shouldFetch = false;
        }
    }

    return allChats;
};

async function getChatCount() {
    fetchChatsInBatches(100).then((allChats) => {
        const totalCount = allChats.length;
        ////console.log(`Total Chats Count: ${totalCount}`);
        // Process or display allChats as needed
    });
}
  


async function getGroupCount() {
	try {
		//const groupRef = db.ref(`groupUsers`);
		//const snapshot = await groupRef.once("value");
		//const groupData = snapshot.val();
		db.ref('groupUsers').once('value').then(snapshot => {
			const data = snapshot.val();
			const dataArray = Object.values(data);
		  	// Get count
			const count = dataArray.length;
		  
			//console.log(`Total Groups Count: ${count}`);
		});
		
	} catch (error) {
		//console.error("Error fetching group data:", error);
		return {
			state: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error',
			groupData: {}
		};
	}
}

async function getGroupNode(groupId, key) {
	try {
		if (!groupId) {
			throw new Error("groupId is missing.");
		}

		const groupRef = db.ref(`groupUsers/${groupId}`);
		const snapshot = await groupRef.once("value");
		const groupData = snapshot.val();
		let response;
		if (groupData) {
			if (key) {
				if (groupData[key]) {
					response = {
						state: 'success',
						responseCode: 200,
						errorMessage: '',
						groupData: {
							[key]: groupData[key]
						}
					};
				} else {
					response = {
						state: 'failure',
						responseCode: 404,
						errorMessage: 'Key not found in group data.',
						groupData: {}
					};
				}
			} else {
				response = {
					state: 'success',
					responseCode: 200,
					errorMessage: '',
					groupData: groupData
				};
			}

			return response;
		} else {
			return {
				state: 'failure',
				responseCode: 404,
				errorMessage: 'group data not found.',
				groupData: {}
			};
		}
	} catch (error) {
		//console.error("Error fetching group data:", error);
		return {
			state: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error',
			groupData: {}
		};
	}
}

// added new argument chatType to create group chat or personal which need to pass from client
async function createUserChat(data, token) {
    	let response = {
		status: 'failure',
		responseCode: 400,
		errorMessage: 'Invalid request'
	};

	if (!data || !token) {
		throw new Error("Invalid input data or token.");
	}
	// Authenticate the user and retrieve userId using the token
	let currrentUserId = await fetchUserIdFromToken(token);
	if (!currrentUserId || currrentUserId == -1) {
		// throw new Error("Authentication Failed.");
		// //console.error('Authentication Failed', error);
		response = {
			status: 'failure',
			responseCode: 401,
			errorMessage: 'Unauthorised User'
		};
	}

	//IF THE GROUP IS GETTING CREATED PROGRAMMATICALLY, USERID WILL BE PASSED FROM THE PROGRAM
    // This will change
    var adminProfilePicture = '';
	if (data.isGroupCreatedProgrammatically){
		currrentUserId = data.createdById; // Admin Id is stored in createdById 
	}

	const chatType = data.chatType;  // personal | group
	data.isRejected = false;
	data.isDeleted = false;
	data.last_message = "";
	data.isMsgReqAccepted = false;
	data.isBlocked = false;
    data.createdById = currrentUserId;
	data.accountDeactivatedByUser = false;
	var postLat = data.postLat;
	var postLong = data.postLong;
	var postLocation = data.postLocation;
	if (data.isReadOnly && (data.isReadOnly == 'true' || data.isReadOnly == true)){
		data.isReadOnly = true;
	}
	else {
		data.isReadOnly = false;
	}

	try {
		const timestamp = Math.floor(Date.now() / 1000);

		if (chatType == 'personal' || chatType == 'Personal') {
			let chatterUserId = api_helper.decrypt(data.other.userId);
			const key = Number(currrentUserId) > Number(chatterUserId)
				? `${currrentUserId}_${chatterUserId}`
				: `${chatterUserId}_${currrentUserId}`;

			const selfRef = db.ref(`userChats/${currrentUserId}/${key}`);
			const otherRef = db.ref(`userChats/${chatterUserId}/${key}`);

			const commonChatPayload = {
				chatType: chatType,
				date: timestamp,
				isRejected: data.isRejected,
				isDeleted: data.isDeleted,
				last_message: data.last_message,
				last_message_time: timestamp,
				chatId: key,
				isBlocked: data.isBlocked,
				accountDeactivatedByUser: data.accountDeactivatedByUser,
				isReadOnly: data.isReadOnly
			};

			const chatPayloadforself = {
				...commonChatPayload,
				to_uid: chatterUserId,
				isMsgReqAccepted: true,
				userInfo: {
					from_uid: chatterUserId,
					displayName: data.other.userName,
					profilePic: data.other.profileImage,
				}
			};
			const chatPayloadforUser = {
				...commonChatPayload,
				to_uid: currrentUserId,
				isMsgReqAccepted: data.isNewUser ? true : false,
				userInfo: {
					from_uid: currrentUserId,
					displayName: data.self.userName,
					profilePic: data.self.profileImage,
				}
			};

			await Promise.all([
				selfRef.set(chatPayloadforself),
				otherRef.set(chatPayloadforUser)
			]);

			const chatDetails = await fetchChatUserChat({ chatId: key, userId: currrentUserId }, token);
			const chatMessages = await fetchChatMessages({ chatId: key }, token);


			if (data.isNewUser) {
                let welcomeText = "*Hello, Welcome to Travel Buddy* .\n\nWe truly appreciate your presence to make Travel Buddy a passionate community.\n\nDo check out videos from our users on our YT channel - https://bit.ly/2NLcvCu\n\nAlso pls note that we try our best to keep spammers at bay.\n\nHere are couple of features which you can use to keep them away:\n\n- Report Profile\n- Rate/Review Profile\n- Block Chat\n- Block Users";
                //textContent = welcomeText.replace(/<\/?[^>]+(>|$)/g, "\n");
                postChatMessage({ chatId: key, chatType: 'personal', isSentByCurrentUser: true, timeStamp: timestamp, isDeleted: false, isMedia: false, isSeen: false, isStarred: false, message: welcomeText, userId: currrentUserId, type: "status", media: [], type: 'text' }, apiHelper.decrypt(data.other.userId), false);
            }

			response = {
				status: 'success',
				responseCode: 200,
				errorMessage: 'Chat created successfully',
				chatId: key,
				messages: chatMessages.messages,
				chatDetails: chatDetails.chatData
			};
		}
		else if (chatType === 'group' || chatType === 'Group') {
			// Make and entry in usersChats and groupUsers collection
			const { v4: uuidv4 } = require('uuid');
			const guid = uuidv4().replace(/-/g, '').toLowerCase();
            
            // For Find Buddy Group, we wont be updating the groupId in the currentUserId users collection as this will happen when the Admin clicks "Accept" button, we will only update it in admin's collection
			const selfRef = db.ref(`userChats/${currrentUserId}/${guid}`);
			// data.groupProfileURL = "https://group.png"
            //console.log('GroupDatas', data);
            //console.log('GroupData', data.groupProfileUrl); 
			const groupProfileURL = (data.groupProfileUrl) ? data.groupProfileUrl : '';

			// Use data.createdById if available (for programmatically created groups like Find Buddy),
			// otherwise use currrentUserId (for manually created groups)
			const adminId = data.createdById || currrentUserId;
			const isCurrentUserAdmin = (adminId == currrentUserId);

			const groupPayload = {
				createdById: adminId,
				createdByName: data.createdBy,
				chatId: guid,
				groupName: data.groupName,
				groupProfileURL: groupProfileURL,
				last_message: data.groupLastMessage,
				last_message_time: timestamp,
				last_message_sender_id: data.senderId,
				last_message_sender_name: data.lastMessageSenderName,
				isDeleted: data.isDeleted,
				isRejected: false,
				chatType: chatType,
				isAdmin: isCurrentUserAdmin
			};

			await selfRef.set(groupPayload);
			const groupUsersRef = db.ref(`groupUsers/${guid}/members/${currrentUserId}`);
			// If if (data.isGroupCreatedProgrammatically) then we will update postLat, postLong and postLocation in groupUsers collection
			const groupUsersPayload = {
				uid: currrentUserId,
				postLat: data.isGroupCreatedProgrammatically ? postLat : 0,
				postLong: data.isGroupCreatedProgrammatically ? postLong  : 0,
				postLocation: data.isGroupCreatedProgrammatically ? postLocation  : 'NA',
			};
			await groupUsersRef.set(groupUsersPayload);
			// saving message for group
			const groupRef = db.ref(`groupUsers/${guid}/`);
			const groupMemberPayload = {
				createdById: adminId,
				createdByName: data.createdBy,
				adminId: adminId,
				groupName: data.groupName,
				groupProfileURL: groupProfileURL,
				isReadOnly: data.isReadOnly,
				postLat: data.isGroupCreatedProgrammatically ? postLat : 0,
				postLong: data.isGroupCreatedProgrammatically ? postLong : 0,
				postLocation: data.isGroupCreatedProgrammatically ? postLocation : 'NA',
			};
			await groupRef.set(groupMemberPayload);
			//Add current user to group
			addUsersToGroup({ groupId: guid, newMemberIds: [currrentUserId], data: data }, token);
			response = {
				status: 'success',
				responseCode: 200,
				errorMessage: 'Group Created Successfully',
				chatArr: groupPayload
			};
		}
	} catch (error) {
		//console.error('An error occurred:', error);
		response = {
			status: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error'
		};
	}
	return response;
}

async function addUsersToGroup(data, token, findBuddyUserInfo) {
	try {
		if (!data || !token) {
			throw new Error("Invalid input data or token.");
		}
		const groupId = data.groupId;
		const newMemberIds = data.newMemberIds;
		let toSendData = data.data;
		let memberId;
		let timestamp = (data.timestamp) ? data.timestamp : Math.floor(Date.now() / 1000);
		// either pass this value from fromtend or set it to false here
		toSendData.isAdmin = false;
		toSendData.userRemovedByAdmin = false;
		toSendData.isRejected = false;
        toSendData.senderUserId = toSendData.createdById;
		const senderUserId = await fetchUserIdFromToken(token);
		if (!senderUserId || senderUserId == -1) {
			//console.error('Authentication Failed', senderUserId);
			let response = {
				status: 'failure',
				responseCode: 401,
				errorMessage: 'Unauthorised User'
			};
		}

		// For Find Buddy groups, always use the admin (createdById) as senderId
		// Don't overwrite with the joining user's ID from token
		// Structure: data = { groupId, newMemberIds, data: { createdById: adminId, ... } }
		// Since toSendData = data.data, we can use toSendData.createdById directly
		if (toSendData.isFindBuddyGroup) {
			toSendData.senderId = toSendData.createdById || toSendData.senderId || senderUserId;
		} else if (toSendData.senderId == "" || !toSendData.senderId) {
			toSendData.senderId = senderUserId;
		}

		if (!groupId || !Array.isArray(newMemberIds) || newMemberIds.length === 0) {
			throw new Error("Invalid input: groupId and a non - empty array of newMemberIds are required.");
		}
		const groupPayload = {};
		//console.log('New Members List', newMemberIds);
		for (memberId of newMemberIds) {
            var originalMemberId = memberId;
			if (memberId.length > 10) {
				memberId = api_helper.decrypt(memberId);
			}
            
            groupPayload[memberId] = toSendData.isFindBuddyGroup  ? 
            {
                // This is responsible for creating the Find Buddy Group
                uid: memberId,
                requestedOn: timestamp,
                isRequested: '0', // 0: requested, 1: accepted, 2: declined
                
            } :
            {
                // This is responsible for creating the normal group
                uid: memberId,
                addedOn: timestamp,
            };  
            
            //console.log('addNodeToUserChats 1', toSendData);
			addNodeToUserChats(memberId, groupId, toSendData);

			const userInfoResponse = await getUserNode(memberId, null);
			const userName = userInfoResponse.userData.displayName;

			timestamp++;
            let infoTextGroup = userName;
            if (toSendData.isFindBuddyGroup) {
                infoTextGroup = findBuddyUserInfo.userName;
                infoTextGroup += ' has requested to join the group';
            } 
            else {
                infoTextGroup += ' has joined the group';
            }
                
            // Add a parameter to make changes in checkAndFireNotification function
			if (data.data.createdById != originalMemberId){
				let chatterId = toSendData.senderId;
				if (toSendData.isFindBuddyGroup){
					chatterId = originalMemberId;
				};
				postChatMessage({ chatId: groupId, chatType: 'group', isSentByCurrentUser: true, timeStamp: timestamp, isDeleted: false, isMedia: false, isSeen: false, isStarred: false, message: infoTextGroup, userId: toSendData.senderId, type: "status", media: [], isFindBuddyGroup: toSendData.isFindBuddyGroup}, chatterId, false);
			}
		}

		const selfRef = db.ref(`groupUsers/${groupId}/members`);
		await selfRef.update(groupPayload);
		const response = {
			status: 'success',
			responseCode: 200,
			errorMessage: 'Members added successfully'
		};
		return response;
	}
	catch (error) {
		//console.error('An error occurred:', error);
		const response = {
			status: 'failure',
			responseCode: error.responseCode || 500,
			errorMessage: error.message || 'Internal server error'
		};
		return response;
	}
}

async function addNodeToUserChats(userId, groupId, data) {
	try {
		if (!userId || !groupId || !data) {
			throw new Error("Invalid input: userId, groupId, and data are required.");
		}
        
        //console.log('addNodeToUserChats 2', data);

		const groupProfileURL = (data.groupProfileUrl) ? data.groupProfileUrl : null;
		const groupLastMessage = (data.groupLastMessage) ? data.groupLastMessage : null;
		const lastMessageSenderName = (data.lastMessageSenderName) ? data.lastMessageSenderName : null;
		const senderId = (data.senderUserId) ? data.senderUserId : null;
		const groupName = (data.groupName) ? data.groupName : null;
		const createdBy = (data.createdBy) ? data.createdBy : null;
		const isDeleted = (data.isDeleted) ? data.isDeleted : false;
		const isAdmin = (data.isAdmin) ? data.isAdmin : false;
		const isRejected = (data.isRejected) ? data.isRejected : false;
		const userRemovedByAdmin = (data.userRemovedByAdmin) ? data.userRemovedByAdmin : false;
		const chatType = "group";
		const timestamp = (data.timestamp) ? data.timestamp : Math.floor(Date.now() / 1000);

		// For Find Buddy groups, always use createdById (admin) instead of senderId
		// This ensures the post creator remains the admin, not the joining user
		const createdById = (data.isFindBuddyGroup && data.createdById) ? data.createdById : senderId;

		let groupPayload = {
			createdById: createdById, // Use admin ID for Find Buddy groups, senderId for others
			createdByName: createdBy,
			chatId: groupId,
			groupName: groupName,
			groupProfileURL: groupProfileURL,
			last_message: groupLastMessage,
			last_message_time: timestamp,
			last_message_sender_id: senderId,
			last_message_sender_name: lastMessageSenderName,
			isDeleted: isDeleted || false,
			isRejected: isRejected || false,
			userRemovedByAdmin: userRemovedByAdmin || false,
			chatType: chatType,
			isAdmin: isAdmin || false,
		};
        
        if (data.isFindBuddyGroup) {
            groupPayload.isAccepted = false;
            groupPayload.isRequested = '0'; // 0: requested, 1: accepted, 2: declined
        }

		const selfRef = db.ref(`userChats/${userId}/${groupId}`);
		await selfRef.set(groupPayload);
		return {
			status: 'success',
			responseCode: 200,
			errorMessage: 'Chat group node added successfully'
		};
	}
	catch (error) {
		//console.error('An error occurred:', error);
		return {
			status: 'failure',
			responseCode: error.responseCode || 500,
			errorMessage: error.message || 'Internal server error'
		};
	}
}

async function isGroupAdmin(userId, groupId) {
	const groupDetails = db.ref(`groupUsers/${groupId}`);
	const groupVal = await groupDetails.once("value");
	const groupInfo = groupVal.val();
	let isAdmin = false;

	if (groupInfo['adminId'] == userId) {
		isAdmin = true;
	}

	return isAdmin;
}

async function removeUserFromGroup(data, token) {
	let response = {
		status: 'failure',
		responseCode: 400,
		errorMessage: 'Invalid request'
	};

	if (!data || !token) {
		throw new Error("Invalid input data or token.");
	}
	// Authenticate the user and retrieve userId using the token
	const userId = await fetchUserIdFromToken(token);
	if (!userId || userId == -1) {
		// throw new Error("Authentication Failed.");
		//console.error('Authentication Failed', error);
		response = {
			status: 'failure',
			responseCode: 401,
			errorMessage: 'Unauthorised User'
		};
	}

	//Only Admin user should be able to remove a user.
	if (!isGroupAdmin(userId, data.groupId)) {
		//console.error('Only Admin can remove a user', error);
		response = {
			status: 'failure',
			responseCode: 400,
			errorMessage: 'Only Admin can remove a user'
		};
	}


	const groupId = data.groupId;
	const memberIdToRemove = data.memberIdsToRemove[0];
	const timeStamp = Number(data.timeStamp);

	try {
		const selfRef = db.ref(`groupUsers/${groupId}/members/${memberIdToRemove}`);
		const selfExitSnapshot = await selfRef.once("value", function (snapshots) {
			snapshots.forEach(function (snapshot) {
				selfRef.update({
					isRemoved: true,
					removedOn: timeStamp,
					uid: memberIdToRemove,
				});
			});
		});

		const userInfoResponse = await getUserNode(memberIdToRemove, null);
		const userName = userInfoResponse.userData.displayName;
		postChatMessage({ chatId: groupId, chatType: 'group', isSentByCurrentUser: true, timeStamp: timeStamp, isDeleted: false, isMedia: false, isSeen: false, isStarred: false, message: userName + " has left the group", userId: memberIdToRemove, type: "status", media: [] }, token, false);

		response = {
			status: 'success',
			responseCode: 200,
			errorMessage: 'Member Exited successfully'
		};
	}
	catch (error) {
		//console.error('An error occurred:', error);
		response = {
			status: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error'
		};
	}

	return response;
}



// var data = {
//     memberIdsToRemove: [494036],
//     groupId: "352a8368a8924c0c93a4905a081414d4",
// };

// // exitUserFromGroup(data, "15f72285757adb13ed7c9870b5bfc337fb366e399b5a0d1846947e3d52d24912ffd42467603cd23e4c9934c625b5598d8e462b52dc62a064c78ea6236c7d4562a7185fa1f44693d4fd2cbee031ac09c659347732a469bbc316a2e9f05a581b012aec21d7b46e35afe9342077e4392ac9f156bb17b79eaab0d3a3ea2a7a7668316f96d07e40d25916234bcec21af074689cfbd4fe32e07cc32b6d770dcb1d6ad45e392d9caf12feb99efd2e44ed3137b1e1d195023383deb52ca09769bea429ee09c99b4c6e7cd509a4cbb4bd5187b2c387bde727bee5f5e5e2cb0433f1e96d75a650aa5161e945165231181065b0be2147efa88cbbeba51668884af979d1f85a6e58a2b61e30520ae66ff14938b4236f617405d46e6dc140ae77fbfedd2f5612724b6d5968622e58963626f1dd42ab903cd120d719fbf400a0f98c94cabdbaf3dc4c2127bf9126e4926901a8bf9a4180e67dde7c265e3d3b5e4835d6d85bf5b8b586ad53f25f7012a378a4f19c17c19344c1b7ef55c4f446ba1266bd1ab6526766869740fc5248f90aa71767e9b2d414c781649d41020d2cb4547afe77f4a7b20ddcc923cbb847085cd9c5bcf5e33f46577cee6402fa4f07a407113ca184122373eab540cb1ed5cf4c8c9868079d32cfd89ee843f782f628dd3f7933a1cb288367b3483d8381d780ebf90e42a1f0d2cba8eed0d5ac28fd966540a06ebefffd2a");


async function exitUserFromGroup(data, token) {
	//console.log(data.groupId);

	if (!data || !token) {
		throw new Error("Invalid input data or token.");
	}
	// Authenticate the user and retrieve userId using the token
	const userId = await fetchUserIdFromToken(token);
	if (!userId || userId == -1) {
		// throw new Error("Authentication Failed.");
		//console.error('Authentication Failed', error);
		response = {
			status: 'failure',
			responseCode: 401,
			errorMessage: 'Unauthorised User'
		};
	}

	const groupId = data.groupId;
	const userIdToRemove = data.memberIdsToRemove[0];
	const timeStamp = Number(data.timeStamp);
	const isAdmin = isGroupAdmin(userId, groupId)

	let response = {
		status: 'failure',
		responseCode: 400,
		errorMessage: 'Invalid request'
	};

	//IF ADMIN IS EXITING FROM THE GROUP, MAKE THE FIRST USER AS ADMIN.

	try {
		const selfRef = db.ref(`groupUsers/${groupId}/members/${userIdToRemove}`);
		const selfExitSnapshot = await selfRef.once("value", function (snapshots) {
			snapshots.forEach(function (snapshot) {
				selfRef.update({
					isExited: true,
					exitedOn: timeStamp,
					uid: userIdToRemove,
				});
			});
		});

		//Also change the isRejected param from userChats/uid/chatId to true
		const userChatRef = db.ref(`userChats/${userIdToRemove}/${groupId}`);
		const userChatSnapshot = await userChatRef.once("value", function (snapshots) {
			snapshots.forEach(function (snapshot) {
				userChatRef.update({
					isRejected: true
				});
			});
		});

		const userInfoResponse = await getUserNode(userIdToRemove, null);
		const userName = userInfoResponse.userData.displayName;
		postChatMessage({ chatId: groupId, chatType: 'group', isSentByCurrentUser: true, timeStamp: timeStamp, isDeleted: false, isMedia: false, isSeen: false, isStarred: false, message: userName + " has left the group", userId: userIdToRemove, type: "status", media: [] }, token, false);

		//if isAdmin to true, we have to make the first added user as admin.
		if (isAdmin) {

			const groupResponse = await getGroupNode(groupId, null);
			let membersList = Object.keys(groupResponse.groupData.members).filter(memb => {
				return !groupResponse.groupData.members[memb].isExited && !groupResponse.groupData.members[memb].isRemoved;
			});

			if (membersList.length > 0) {
				const selfRef = db.ref(`groupUsers/${groupId}`);
				const userInfoResponse = await getUserNode(membersList[0], null);
				const userName = userInfoResponse.userData.displayName;
				await selfRef.once("value", function (snapshots) {
					snapshots.forEach(function (snapshot) {
						selfRef.update({
							adminId: membersList[0],
							createdById: membersList[0],
							createdByName: userName
						});
					});
				});

				membersList.forEach(async function(uid){
					const selfRef = db.ref(`/userChats/${uid}/${groupId}`);
					await selfRef.once("value", function (snapshots) {
						snapshots.forEach(function (snapshot) {
							selfRef.update({
								createdById: membersList[0],
								createdByName: userName
							});
						});
					});
				})
			}
		}


		response = {
			status: 'success',
			responseCode: 200,
			errorMessage: 'Members removed successfully'
		};
	}
	catch (error) {
		//console.error('An error occurred:', error);
		response = {
			status: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error'
		};
	}
	return response;
}


async function fetchChatUserChats(data, token) {
    try {
        const userId = await fetchUserIdFromToken(token);
        var ref = db.ref(`userChats/${userId}`);

        let snapshot = await ref.once("value");
		if (!snapshot) {
			return {
				state: 'failure',
				responseCode: 402,
				errorMessage: 'No chats found'
			};
		}
		return new Promise(async (resolve, reject) => {
			if (snapshot.exists()) {
				let chatArr = [];
				let promises = [];
				let exitedOrRemovedList = [];

				snapshot.forEach(function(data) {
					const chat = data.val();
					chat.chatId = data.key;

					if (chat.chatType === 'group' && (chat.isRemoved || chat.isExited)) {
						return;
					} else {
						if (chat.chatType === 'group') {
							promises.push(getGroupNode(chat.chatId, null).then(groupResponse => {
								chat.groupProfileURL = groupResponse.groupData.groupProfileURL;
								if (userId && groupResponse.groupData.members && groupResponse.groupData.members[userId] && (groupResponse.groupData.members[userId].isExited || groupResponse.groupData.members[userId].isRemoved)) {
									exitedOrRemovedList.push(chatArr.length); // the current length of the chatArr array (which is the index where this chat will be pushed) is added to the exitedOrRemovedList.
								}
								
							}));
						}
						chatArr.push(chat);
					}
				});
				await Promise.all(promises);

				exitedOrRemovedList.reverse().forEach(item => chatArr.splice(item, 1));

				let sortedChats = chatArr.sort((a, b) => {
					// Handle cases where last_message_time might be undefined or null
					const timeA = a.last_message_time || 0;
					const timeB = b.last_message_time || 0;
					
					// Convert to numbers if they're strings
					const numTimeA = typeof timeA === 'string' ? parseInt(timeA) : timeA;
					const numTimeB = typeof timeB === 'string' ? parseInt(timeB) : timeB;
					
					// Sort in descending order (most recent first)
					return numTimeB - numTimeA;
				});

				resolve({
					state: 'success',
					responseCode: 200,
					errorMessage: '',
					chatArr: sortedChats
				});
			} else {
				// reject({
				// 	state: 'failure',
				// 	responseCode: 404,
				// 	errorMessage: 'No chats found'
				// });
				resolve({
					state: 'success',
					responseCode: 200,
					errorMessage: '',
					chatArr: []
				});
			}
		});
	}
	catch (error) {
        //console.log('An error occurred:', error);
        return {
            state: 'failure',
            responseCode: 500,
            errorMessage: 'Internal server error'
        };
    }
}



// Fetch single user chat
async function fetchChatUserChat(data, token) {
	if (!data || !token) {
		throw new Error("Invalid input data or token.");
	}
	// Authenticate the user and retrieve userId using the token
	const userId = await fetchUserIdFromToken(token);
	let threadId;
	let chatterUserId;
	let chatData;
	let response;

	if (!userId || userId == -1) {
		// throw new Error("Authentication Failed.");
		//console.error('Authentication Failed', error);
		response = {
			status: 'failure',
			responseCode: 401,
			errorMessage: 'Unauthorised User'
		};
	}

	if (!data.chatId || !userId) {
		response = {
			state: 'failure',
			responseCode: 400,
			errorMessage: 'Invalid request'
		}

		if (!data.chatId && data.userId) {
			if (data.userId.length > 10) {
				chatterUserId = api_helper.decrypt(data.userId);
			}
			else {
				chatterUserId = data.userId;
			}

			if (Number(chatterUserId) > Number(userId)) {
				threadId = `${chatterUserId}_${userId}`;
			}
			else {
				threadId = `${userId}_${chatterUserId}`;
			}
		}
	}
	else {
		if (data.chatId.length > 20) {
			threadId = apiHelper.decrypt(data.chatId);
		}
		else {
			threadId = data.chatId;
		}
	}

	if (threadId) {
		const userRef = db.ref(`/userChats/${userId}/${threadId}`);

		await userRef.once("value")
			.then((snapshot) => {
				chatData = snapshot.val();
				if (chatData) {
					chatData.chatId = threadId;
					chatData.to_uid = apiHelper.encrypt(chatData.to_uid);
					chatData.userInfo.from_uid = apiHelper.encrypt(chatData.userInfo.from_uid);

					response = {
						state: 'success',
						responseCode: 200,
						errorMessage: '',
						chatData: chatData
					}
				}
				else {
					response = {
						state: 'failure',
						responseCode: 404,
						errorMessage: 'Chat not found'
					}
				}
			})
			.catch((error) => {
				//console.error("Error fetching user data:", error);
			});
	}
	return response;
}


async function fetchChatMessages(data, token) {
	let threadId;

	if (!data || !token) {
		throw new Error("Invalid input data or token.");
	}
	// Authenticate the user and retrieve userId using the token
	const userId = await fetchUserIdFromToken(token);
	if (!userId || userId == -1) {
		// throw new Error("Authentication Failed.");
		//console.error('Authentication Failed', error);
		response = {
			status: 'failure',
			responseCode: 401,
			errorMessage: 'Unauthorised User'
		};
	}

	let page = (data.page) ? data.page : 1;
	let messagesPerPage = 100;

	try {
		let response = {};
		if (!data.chatId || !userId) {
			if (data.userId.length > 10) {
				chatterUserId = api_helper.decrypt(data.userId);
			}
			else {
				chatterUserId = data.userId;
			}

			if (Number(chatterUserId) > Number(userId)) {
				threadId = `${chatterUserId}_${userId}`;
			}
			else {
				threadId = `${userId}_${chatterUserId}`;
			}
		}
		else {
			if (data.chatId.length > 20 && data.chatType !== 'group') {
				threadId = apiHelper.decrypt(data.chatId);
			}
			else {
				threadId = data.chatId;
			}
		}

		if (data.chatType == 'group') {
			threadId = data.chatId;
		}

		if (threadId) {
			const userRef = db.ref(`/chats/${threadId}`);
			const snapshot = await userRef.child("messages")
				.orderByKey()
				//.limitToLast(page * messagesPerPage)
				.once("value");

			const chatData = snapshot.val();
			if (chatData) {
				let chatArr = [];

				Object.keys(chatData)
					// .reverse()
					.forEach(key => {
						let message = chatData[key];
						message.chatId = key;
						let decryptedId = message.senderId;
						chatArr.push(message);


						//Check if the message is sent by the current user
						if (decryptedId && decryptedId.length > 20) {
							decryptedId = apiHelper.decrypt(decryptedId);
						}

						if (decryptedId == userId) {
							chatArr[chatArr.length - 1].isSentByCurrentUser = true;
						}
						else {
							chatArr[chatArr.length - 1].isSentByCurrentUser = false;
						}

						//Encrypt the chat id, sender id and to id
						chatArr[chatArr.length - 1].chatId = threadId;
					});

				response = {
					state: 'success',
					responseCode: 200,
					errorMessage: '',
					messages: chatArr
				};
			} else {
				response = {
					state: 'failure',
					responseCode: 404,
					errorMessage: 'Chat Messages not found'
				};
			}
		}
		return response;
	} catch (error) {
		//console.error("Error fetching chat messages:", error);
		return {
			state: 'failure',
			responseCode: 500,
			errorMessage: 'Internal Server Error'
		};
	}
}

// TEST DATA
// var data = {
//     "chatId": "0b5e073ee6b54d548248c87c3ebc7206",
//     "chatType": "group",
//     "optionType": "deleted"
// };
// deleteUserChatNode(data, null);

async function deleteUserChatNode(data, token) {
	try {

		if (!data || !token) {
			throw new Error("Invalid input data or token.");
		}
		// Authenticate the user and retrieve userId using the token
		const currrentUserId = await fetchUserIdFromToken(token);
		if (!currrentUserId || currrentUserId == -1) {
			// throw new Error("Authentication Failed.");
			//console.error('Authentication Failed', error);
			response = {
				status: 'failure',
				responseCode: 401,
				errorMessage: 'Unauthorised User'
			};
		}

		const optionType = data.optionType;
		const userRef = db.ref(`userChats/${currrentUserId}/${data.chatId}`);
		const snapshot = await userRef.once("value");
		const userFetchedData = snapshot.val();

		const selfExitSnapshot = await userRef.once("value", function (snapshots) {
			if (optionType == 'deleted') {
				snapshots.forEach(function (snapshot) {
					snapshot.ref.update({
						isDeleted: true
					});
				});
			}
		});
		const response = {
			status: 'success',
			responseCode: 200,
			errorMessage: '',
		};
		return response;

	} catch (error) {
		//console.error("Error updating user group data:", error);
		const response = {
			status: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error',
			chatArr: []
		};
		return response;
	}
}

async function updateUserChats(data, token) {
	if (!data || !token) {
		throw new Error("Invalid input data or token.");
	}

	// Authenticate the user and retrieve userId using the token
	const userId = await fetchUserIdFromToken(token);
	if (!userId || userId == -1) {
		// throw new Error("Authentication Failed.");
		//console.error('Authentication Failed', error);
		response = {
			status: 'failure',
			responseCode: 401,
			errorMessage: 'Unauthorised User'
		};
	}

	const chatId = data.chatId;
	const optionType = data.optionType;
	let chatData = [];

	try {
		const userRef = db.ref(`/userChats/${userId}/${chatId}`);
		const snapshot = await userRef.once("value", function (snapshots) {
			snapshots.forEach(function (userSnapshot) {
				if (optionType === 'accepted') {
					userRef.update({ isMsgReqAccepted: true, isRejected: false });
				}
				if (optionType === 'rejected') {
					userRef.update({ isRejected: true });
				}

				if (optionType === 'blocked') {
					userRef.update({ isBlocked: true });
				}

				if (optionType === 'unblocked') {
					userRef.update({ isBlocked: false });
				}

				if (optionType === 'deactivated') {
					userRef.update({ accountDeactivatedByUser: true });
				}

			})
		});
		chatData.push({
            chatId: chatId,
            isMsgReqAccepted: optionType === 'accepted',
            isRejected: optionType !== 'accepted'
        });
		return {
			state: 'success',
			responseCode: 200,
			errorMessage: '',
			chatArr: chatData
		};
	}
	catch (error) {
		//console.error("Error updating user chat:", error);

		return {
			state: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error',
			chatArr: []
		};
	}
}

async function updateGroupImage(data, token) {
	if (!data || !token) {
		throw new Error("Invalid input data or token.");
	}

	// Authenticate the user and retrieve userId using the token
	const userId = await fetchUserIdFromToken(token);
	if (!userId || userId == -1) {
		// throw new Error("Authentication Failed.");
		//console.error('Authentication Failed', error);
		response = {
			status: 'failure',
			responseCode: 401,
			errorMessage: 'Unauthorised User'
		};
	}

	//Below code is not required
	//setUserNode(data, token);
	const groupId = data.groupId;
	let response = {
		status: 'failure',
		responseCode: 400,
		errorMessage: 'Invalid request'
	};

	try {
		if (!data || !token) {
			throw new Error("Invalid input data or token.");
		}
		const selfRef = db.ref(`groupUsers/${groupId}`);
		const existingSnapshot = await selfRef.once("value", function (snapshots) {
			snapshots.forEach(function (userSnapshot) {
				selfRef.update({ groupProfileURL: data.profilePic });
			});
		});

		response = {
			status: 'success',
			responseCode: 200,
			errorMessage: 'Group Image Node Created Successfully'
		};
	}
	catch (error) {
		//console.error('An error occurred:', error);
		response = {
			status: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error'
		};
	}
	return response;
}


/*
Status options
=================
deleted / undeleted
starred / unstarred
seen / unseen
*/

async function updateChatFlags(data) {
	const chatId = data.chatId;
	const timeStamp = Number(data.timeStamp);
	const optionType = data.optionType;
	try {
		if (timeStamp == undefined || isNaN(timeStamp)) {
			return {
				state: 'failure',
				responseCode: 500,
				timeStamp: data.timeStamp,
				timeStampNumber: timeStamp,
				errorMessage: 'Error while performing this operation',
				chatArr: []
			};
		}

		const userRef = db.ref(`/chats/${chatId}/messages/${timeStamp}`);
		let messagesRef = db.ref(`/chats/${chatId}/messages`);
		// Update the flags 
		switch (optionType) {
			case 'deleted':
				userRef.update({ isDeleted: true });
				break;
			case 'undeleted':
				userRef.update({ isDeleted: false });
				break;
			case 'starred':
				userRef.update({ isStarred: true });
				break;
			case 'unstarred':
				userRef.update({ isStarred: false });
				break;
			case 'seen':
				//console.log('Setting isSeen to true', chatId, timeStamp);
				try {
					
					var snapshot = await messagesRef.once("value");
			
					if (snapshot.exists()) {
						var updates = {};
			
						// Iterate through all child nodes (timestamps)
						snapshot.forEach((childSnapshot) => {
							var messageKey = childSnapshot.key; // Timestamp key
							updates[`${messageKey}/isSeen`] = true; // Set isSeen to true
						});
			
						// Perform a batch update
						await messagesRef.update(updates);
						//console.log(`All messages in chat ${chatId} marked as seen.`);
					} else {
						//console.log(`No messages found for chat ${chatId}.`);
					}
				} catch (error) {
					//console.error(`Error marking messages as seen for chat ${chatId}:`, error);
				}
				
				//userRef.update({ isSeen: true });
				break;
			case 'unseen':
				userRef.update({ isSeen: false });
				break;
			case 'reaction':
				userRef.update({ reaction: data.reaction });
			default:
				break;
		}

		return {
			state: 'success',
			responseCode: 200,
			errorMessage: '',
			chatArr: []
		};
	}
	catch (error) {
		//console.error("Error updating user chat:", error);
		return {
			state: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error',
			chatArr: []
		};
	}
}

async function postChatMessage(data, token, isModified) {
	try {
		// send chatType and chatId from client
		let chatType = data.chatType;

		const currrentUserId = (token.length > 15) ? await fetchUserIdFromToken(token) : token;
		let chatterUserId;
		let messagePayload;
		let response;

		if (isModified) {
			messagePayload = data;

			// Loop through and Convert all true/false to boolean
			for (const [key, value] of Object.entries(messagePayload)) {
				if (value === 'true') {
					messagePayload[key] = true;
				}
				else if (value === 'false') {
					messagePayload[key] = false;
				}
			}

			chatterUserId = api_helper.decrypt(data.toId);
			chatterUserId = api_helper.decrypt(chatterUserId);
		}
		else {
			//console.log('data.userId', data.userId);
			if (data.userId.length > 10) {
				chatterUserId = api_helper.decrypt(data.userId);
			}
			else {
				chatterUserId = data.userId;
			}

			//Create a unique key for the message, 16 chars
			const { v4: uuidv4 } = require('uuid');
			const guid = uuidv4().replace(/-/g, '').toLowerCase();

			messagePayload = {
				messageId: guid,
				isDeleted: false,
				isMedia: false,
				isSeen: false,
				isStarred: false,
				message: data.message,
				senderId: currrentUserId,
				timeStamp: data.timeStamp,
				toId: chatterUserId,
				type: data.type,
				media: (data.media) ? data.media : null,
				post: (data.post) ? data.post : null,
				profile: (data.profile) ? data.profile : null,
				experience: (data.experience) ? data.experience : null,
				listing: (data.listing) ? data.listing : null
			};
		}

		let myKeyValue;
		if (chatType === 'personal') {
			myKeyValue = (Number(chatterUserId) > Number(currrentUserId))
				? `${chatterUserId}_${currrentUserId}`
				: `${currrentUserId}_${chatterUserId}`;
		}
		else if (chatType === 'group') {
			myKeyValue = data.chatId;
		}

		//console.log('The User IDs', chatterUserId, currrentUserId, myKeyValue)
		//console.log('myKeyValue', myKeyValue);

		// Enforce blocked-user policy on server for personal chats.
		// Reject send when either side has blocked the chat.
		if (chatType === 'personal') {
			const [senderChatSnapshot, receiverChatSnapshot] = await Promise.all([
				db.ref(`userChats/${currrentUserId}/${myKeyValue}`).once('value'),
				db.ref(`userChats/${chatterUserId}/${myKeyValue}`).once('value')
			]);

			const senderChatData = senderChatSnapshot.val();
			const receiverChatData = receiverChatSnapshot.val();

			const senderHasBlocked = senderChatData && senderChatData.isBlocked === true;
			const receiverHasBlocked = receiverChatData && receiverChatData.isBlocked === true;

			if (senderHasBlocked || receiverHasBlocked) {
				return {
					state: 'failure',
					responseCode: 403,
					errorMessage: 'Message blocked. User has blocked you.'
				};
			}
		}

		messagePayload.chatId = myKeyValue;
		const messagesRef = db.ref(`chats/${myKeyValue}/messages/${Number(messagePayload.timeStamp)}`);
		await messagesRef.set(messagePayload);
		
		var updateData = {
			// Adding the Last message time in the Db node and + is used to convert the string to number
			"last_message_time": +data.timeStamp,
			"last_message": data.message,
		};

		var updateUserChatsCurrent = db.ref(`userChats/${currrentUserId}/${myKeyValue}`);
		var updateUserChatsChatter = db.ref(`userChats/${chatterUserId}/${myKeyValue}`);

		[updateUserChatsCurrent, updateUserChatsChatter].forEach(ref => {
			ref.update(updateData).catch((error) => {
				//console.error("Error updating last_message_time: ", error);
			});
		});
		updateUserChatsCurrent.update({"isSeen":true});

		checkAndFireNotification(currrentUserId, data, messagePayload, chatterUserId, myKeyValue);

		response = {
			state: 'success',
			responseCode: 200,
			errorMessage: 'Message sent successfully!'
		};

		return response;
	}
	catch (error) {
		//console.error('An error occurred:', error);
		response = {
			state: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error'
		};
		return response;
	}
}

//Node is /users i need to fetch the last node


async function checkAndFireNotification(currrentUserId, data, messagePayload, chatterUserId, myKeyValue) {

	// Notification sending should ideally be done outside of this function
	//id is just a dummy property which was needed for front end.
	let message = '';
	let messageImage = '';
	let groupName = '';
	let messageTitle = '';
	let notificationType = '';
	let groupId = '';

	const userChatSnapshot = await db.ref(`/userChats/${chatterUserId}/${myKeyValue}`).once("value");
	const chatData = userChatSnapshot.val();

	let recieversList = [];
	if (data.chatType === 'group') {
		const groupMembers = await db.ref(`groupUsers/${myKeyValue}`).once("value");
		groupName = groupMembers.val().groupName;
		if (data.isFindBuddyGroup){
			recieversList.push(groupMembers.val().adminId);	
		}else{
			const memberData = groupMembers.val().members;
			if (memberData) {
				recieversList = Object.keys(memberData).filter(key => {
					if (!memberData[key].isExited && !memberData[key].isRemoved)
						return key;
				}).map(key => {
					return key;
				});
			}
		}
	}
	else {
		recieversList.push(chatterUserId);
	}

	//console.log('chatData', chatData, messagePayload,);
	//console.log('data', data);
	if (chatData || data.chatType === 'group') {
		if (chatData && chatData.chatType == 'personal' && chatData.isRejected == true) {
			return;
		}

		if (messagePayload.type == 'media') {
			if (messagePayload.media && messagePayload.media.length && messagePayload.media[0].mediaType == 'image') {
				message = 'has sent you a photo';
				messageImage = 'https://d1hphxyq85xv5h.cloudfront.net/fit-in/200x200/' + messagePayload.media[0].mediaUrl;
			}
			if (messagePayload.media && messagePayload.media.length && messagePayload.media[0].mediaType == 'video') {
				message = 'has sent you a video';
			}
			if (messagePayload.media && messagePayload.media.length && messagePayload.media[0].mediaType == 'document') {
				message = 'has sent you a file';
			}
		}
		else if (messagePayload.type == 'post') {
			if (messagePayload.post) {
				if (messagePayload.post.postType == 'share' || messagePayload.post.postType == 'story') {
					message = 'has shared a post';
					if (messagePayload.post.postImage) {
						messageImage = messagePayload.post.postImageUrl;
					}
				}
				else if (messagePayload.post.postType == 'meetup') {
					message = 'has shared a meetup plan';
				}
				else if (messagePayload.post.postType == 'find_buddy') {
					message = 'has shared an find buddy plan';
				}
				else if (messagePayload.post.postType == 'ask') {
					message = 'has shared a question';
				}
				else {
					message = messagePayload.message;
				}
			}
		}
		else if (messagePayload.type == 'profile') {
			message = 'has shared a buddys profile';
		}
		else if (messagePayload.type == 'experience') {
			message = 'has shared an experience';
		}
		else if (messagePayload.type == 'listing' || messagePayload.type == 'service') {
			message = 'has shared a listing';
		}
		else {
			message = messagePayload.message;
		}

		const userInfo = await utils.getUserInfo(currrentUserId);
		messageTitle = (data.chatType === 'group') ? groupName : userInfo.userName;
		notificationType = (data.chatType === 'group') ? 'group_chat' : 'chat';
		groupId = (data.chatType === 'group') ? myKeyValue : '';
		recieversList = recieversList.filter(function (value, index, arr) {
			return value != currrentUserId;
		});

		recieversList.forEach(async function (userid) {
			// const notificationPayload = {
			// 	id: "1",
			// 	title: messageTitle ? messageTitle : '',
			// 	type: notificationType + '',
			// 	body: message + '',
			// 	imageUrl: messageImage ? messageImage + '' : '',
			// 	groupId: groupId + '',
			// };
			
			const notificationPayload = {
				id: "{ \"id\": \"1\", \"title\": \"" + (messageTitle ? messageTitle : '') + "\", \"type\": \"" + notificationType + "\", \"body\": \"" + message + "\", \"imageUrl\": \"" + (messageImage ? messageImage : '') + "\", \"groupId\": \"" + groupId + "\" }",
				title: messageTitle ? messageTitle : '',
				type: notificationType + '',
				body: message + '',
				imageUrl: messageImage ? messageImage + '' : '',
				groupId: groupId + '',
			};
			//console.log('Send Notification 1', notificationPayload);

			Object.keys(userInfo).forEach(function (prop) {
				notificationPayload[prop] = userInfo[prop].toString();
			});
			//console.log('Send Notification', notificationPayload);
			sendNotification(userid, notificationPayload);
		})
	}
}

// fetchGroupMembers("3489ae401aaf46a5b09bd20cdae722fb", null);
async function fetchGroupMembers(data, token) {
	let response = '';
	if (!data || !token) {
		throw new Error("Invalid input data or token.");
	}

	// Authenticate the user and retrieve userId using the token
	const userId = await fetchUserIdFromToken(token);
	if (!userId || userId == -1) {
		// throw new Error("Authentication Failed.");
		//console.error('Authentication Failed', error);
		response = {
			status: 'failure',
			responseCode: 401,
			errorMessage: 'Unauthorised User'
		};
	}

	if (!data.groupId) {
		response = {
			state: 'failure',
			responseCode: 400,
			errorMessage: 'Invalid request'
		};
	}
	else {
		const groupId = data.groupId;

		try {
			if (!userId) {
				throw new Error("User not found");
			}

			let groupMembersSnapshot = db.ref(`/groupUsers/${groupId}/members`);
			// Creating another to get the entire values
			let groupUsersSnapshot = db.ref(`/groupUsers/${groupId}`);
			groupUsersSnapshot = await groupUsersSnapshot.once("value");
			//console.log('groupUsersSnapshot', groupUsersSnapshot.val());
			groupMembersSnapshot = await groupMembersSnapshot.once("value");
			var postLat = groupUsersSnapshot.val().postLat ? groupUsersSnapshot.val().postLat : 0;
			var postLong = groupUsersSnapshot.val().postLong ? groupUsersSnapshot.val().postLong : 0;
			var postLocation = groupUsersSnapshot.val().postLocation ? groupUsersSnapshot.val().postLocation : '';
			var postLocData = {
				postLat: postLat,
				postLong: postLong,
				postLocation: postLocation
			}
			const memberData = groupMembersSnapshot.val();

			if (!memberData) {
				return {
					state: 'failure',
					responseCode: 404,
					errorMessage: 'Data not found.',
					chatArr: []
				};
			}

			let groupMembersArr;
			if (data.fetchAll) {
				groupMembersArr = Object.keys(memberData).map(key => {
					// //console.log('key', key);
					// //console.log('memberData[key]', memberData[key]);
					if (typeof memberData[key] === 'object') {
						memberData[key].uId = key;
						return memberData[key];
					}
				});
			}
			else {
				groupMembersArr = Object.keys(memberData).map(key => {
					if ((!memberData[key].isRemoved && !memberData[key].isExited)) {
						memberData[key].uId = key;
						return memberData[key];
					}
					else {
						return undefined;
					}
				});
			}
			const responsePromises = groupMembersArr.map(async member => {
				if (member !== undefined) {
					const userInfoResponse = await getUserNode(member.uId, null);
					////console.log('userInfoResponse', userInfoResponse);

					//Encrypt the user id and add it as encryptedUid
					member.encryptedUid = apiHelper.encrypt(member.uId);

					if (userInfoResponse.responseCode !== 200) {
						////console.error("Error fetching user information:", userInfoResponse);
						//						throw new Error("Failed to fetch user information.");
					}
					else {
						member.userInfo = userInfoResponse.userData;
					}

					return member;
				}
			});

			let groupMembersWithUserInfo = await Promise.all(responsePromises);
			groupMembersWithUserInfo = groupMembersWithUserInfo.filter(member => member !== undefined);

			response = {
				state: 'success',
				responseCode: 200,
				errorMessage: '',
				groupMembers: groupMembersWithUserInfo,
				chatId: data.groupId,
				postLocData: postLocData // This will give lat, lng, location
			};
		}
		catch (error) {
			//console.error("Error fetching group members:", error);
			response = {
				state: 'failure',
				responseCode: error.responseCode || 500,
				errorMessage: error.message || 'Internal server error'
			};
		}
	}

	return response;
}


async function setUserPresence(token) {
	try {
		const userId = await fetchUserIdFromToken(token);
		const timestamp = Math.floor(Date.now() / 1000);
		const userRef = db.ref(`presense/${userId}`);
		const statusPayload = {
			isOnline: true,
			lastActive: timestamp
		};

		await userRef.set(statusPayload);

		const response = {
			status: 'success',
			responseCode: 200,
			errorMessage: 'User Status Updated Successfully',
		};

		return response;
	}
	catch (error) {
		//console.error('An error occurred:', error);
		response = {
			status: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error'
		};
		return response;
	}
}

async function getUserPresence(token) {
	let response = {
		state: 'failure',
		responseCode: 400,
		errorMessage: 'Invalid request'
	};

	try {
		userId = await fetchUserIdFromToken(token);
		const userRef = db.ref(`presence/${userId}`);
		const snapshot = await userRef.once("value");
		const userData = snapshot.val();

		if (userData) {
			const userArr = Object.keys(userData).map(key => {
				const userObj = userData[key];
				return {
					isOnline: userObj.isOnline,
					date: userObj.lastActive,
				};
			});

			return {
				state: 'success',
				responseCode: 200,
				errorMessage: '',
				userArr: userArr
			};

		} else {
			return {
				state: 'failure',
				responseCode: 404,
				errorMessage: 'No status available for the user.',
				userArr: []
			};
		}
	} catch (error) {
		//console.error("Error fetching user data:", error);
		return {
			state: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error',
			userArr: []
		};
	}
}

//  fetchUserIdFromToken -  Extract user id from token
async function fetchUserIdFromToken(token) {
	let decryptedJwtToken = api_helper.decrypt(token);
	decryptedJwtToken = api_helper.decrypt(decryptedJwtToken);

	return jwtObj.isTokenValid(decryptedJwtToken);
}


async function updateGroupLabel(data, token) {
	if (!data || !token) {
		throw new Error("Invalid input data or token.");
	}
	// Authenticate the user and retrieve userId using the token
	const userId = await fetchUserIdFromToken(token);
	if (!userId || userId == -1) {
		// throw new Error("Authentication Failed.");
		//console.error('Authentication Failed', error);
		response = {
			status: 'failure',
			responseCode: 401,
			errorMessage: 'Unauthorised User'
		};
	}
	const groupId = data.groupId;
	if (!isGroupAdmin(userId, groupId)) {
		response = {
			status: 'failure',
			responseCode: 400,
			errorMessage: 'Only Admin can rename the group'
		};
	}
	let response = {
		status: 'failure',
		responseCode: 400,
		errorMessage: 'Invalid request'
	};
	try {
		if (!data || !token) {
			throw new Error("Invalid input data or token.");
		}
		const selfRef = db.ref(`groupUsers/${groupId}`);
		const existingSnapshot = await selfRef.once("value", function (snapshots) {
			snapshots.forEach(function (userSnapshot) {
				selfRef.update({ groupName: data.groupName });
			});
		});
		const groupResponse = await getGroupNode(groupId, null);
		let membersList = Object.keys(groupResponse.groupData.members).filter(memb => {
			return !groupResponse.groupData.members[memb].isExited && !groupResponse.groupData.members[memb].isRemoved;
		});
		membersList.forEach(async memberId => {
			const userChatRef = db.ref(`userChats/${memberId}/${groupId}`);
			const userChatSnapshot = await userChatRef.once("value", function (snapshots) {
				snapshots.forEach(function (snapshot) {
					userChatRef.update({
						groupName: data.groupName
					});
				});
			});
		});

		const timeStamp = Math.floor(Date.now() / 1000);
		postChatMessage({ chatId: groupId, chatType: 'group', isSentByCurrentUser: true, timeStamp: timeStamp, isDeleted: false, isMedia: false, isSeen: false, isStarred: false, message: "Group name has been changed", userId: userId, type: "status", media: [] }, token, false);

		response = {
			status: 'success',
			responseCode: 200,
			errorMessage: 'Group Label Renamed Successfully'
		};
	}
	catch (error) {
		//console.error('An error occurred:', error);
		response = {
			status: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error'
		};
	}
	return response;
}

async function fetchUsersGroups(token) {
	try {
		const userId = await fetchUserIdFromToken(token);
		if (!userId || userId == -1) {
			return {
				status: 'failure',
				responseCode: 401,
				errorMessage: 'Unauthorised User'
			};
		}
		const userChatSnapshot = await db.ref(`/userChats/${userId}`).once("value");
		const chatData = userChatSnapshot.val();
		if (!chatData) {
			return {
				state: 'failure',
				responseCode: 402,
				errorMessage: 'No chats found'
			};
		}
		const chatArr = [];
		Object.keys(chatData).map(key => {
			const chat = chatData[key];
			chat.chatId = key;
			if (chatData[key].chatType === 'group' && (chatData[key].isRemoved || chatData[key].isExited)) {
			} else {
				if (chatData[key].chatType == 'group') {
					chatArr.push(chatData[key]);
				}
			}
		});
		if (chatArr.length === 0) {
			return {
				state: 'success',
				responseCode: 200,
				errorMessage: 'No groups found'
			};
		}
		let exitedOrRemovedList = Array();
		for (let i = 0; i < chatArr.length; i++) {
			const groupResponse = await getGroupNode(chatArr[i].chatId, null);
			chatArr[i].groupProfileURL = groupResponse.groupData.groupProfileURL ? groupResponse.groupData.groupProfileURL : "";
			//console.log(chatArr[i]);
			if (groupResponse.groupData.members && groupResponse.groupData.members[userId] && (groupResponse.groupData.members[userId].isExited || groupResponse.groupData.members[userId].isRemoved)) {
				exitedOrRemovedList.push(i);
			}
		}
        // This can lead to incorrect indices due to the array's changing size
		/*exitedOrRemovedList.forEach((item, idx) => { if (idx > 0) { chatArr.splice(item - 1, 1) } else chatArr.splice(item, 1) });*/
        var finalChatArr = chatArr.filter((_, index) => !exitedOrRemovedList.includes(index));
		return {
			state: 'success',
			responseCode: 200,
			errorMessage: '',
			groups: finalChatArr
		};
	}
	catch (error) {
		//console.log('An error occurred:', error);
		return {
			state: 'failure',
			responseCode: 500,
			errorMessage: 'Internal server error'
		};
	}
}

async function addUserToUserNode(data, checkAndAdd){
	let addUser = true;
	if (checkAndAdd){
		let userRef = db.ref('users/' + data.userId);
        // Check if the userId exists in the database
        userRef.once('value', async snapshot => {
            if (!snapshot.exists()) {
				addUser = true;
				data = await utils.getUserInfo(currrentUserId);
            }
            else {
                addUser = false;
            }
        });
	}
	if (addUser){
		const timestamp = Math.floor(Date.now() / 1000);
		const key = data.userId;
		const userNodeRef = db.ref(`users/${key}`);
		await userNodeRef.set({
			displayName: data.userName,
			email: data.userEmail,
			profilePic: data.userProfilePic,
			role: 'user',
			uid: key,
			isOnline: true,
			lastActive: timestamp,
			creationDate: timestamp,
		});
	}
}

async function checkIfUsersArePresent(data){
	let cohortInfo = data.cohort;
	cohortInfo.forEach(userInfo => {
        // Reference to the userId in the database
        let userRef = db.ref('users/' + userInfo.userId);
        // Check if the userId exists in the database
        userRef.once('value', async snapshot => {
            if (!snapshot.exists()) {
				await addUserToUserNode(userInfo);
                //console.log('User does not exist in the database');
            }
            else {
                //console.log('User exists in the database');
            }
        });
    });
}


async function sendMessageToUsers(data) {
    let { simpleUserId, messagePayload, profilePic, name } = data;
    let cohortInfo = data.cohort;
    let timeStamps = Math.floor(Date.now() / 1000);
    let chunkSize = 450, delay = 1000, maxRetries = 3;
    let isMedia = messagePayload.isMedia == 'true';
    let messageSent = 0, messageFailed = 0;
    let messageSentTo = [], messageFailedTo = [];
	let message = messagePayload.message;

	//console.log(name, profilePic, simpleUserId, messagePayload, cohortInfo);
	
    // Function to create a chat object
    function createChatObject(chatId) {
        return {"isBlocked": false, "accountDeactivatedByUser": false, "chatId": chatId, "chatType": "personal","date": timeStamps, "isDeleted": false, "isReadOnly": true, "cohortId": data.messageJobId, "isMsgReqAccepted": true, "isRejected": false,"last_message": "", "last_message_time": timeStamps, "to_uid": simpleUserId,"userInfo": { "displayName": name, "from_uid": simpleUserId, "profilePic": profilePic }
        };
    }

    // Loop over the userIds array in chunks
    for (let i = 0; i < cohortInfo.length; i += chunkSize) {
        let chunk = cohortInfo.slice(i, i + chunkSize);
        let updates = {}, userChats = {}, payload = {};
		
        // Loop over each user ID in the chunk
        for (let userInfo of chunk) {

			// Reference to the userId in the database
			let userRef = db.ref(`users/${userInfo.userId}`);
			
			// Check if the userId exists in the database
			userRef.once('value', async snapshot => {
				if (!snapshot.exists()) {
					await addUserToUserNode(userInfo);
					//console.log('User does not exist in the database');
				}
				else {
					//console.log('User exists in the database');
				}
			});

			let userId = userInfo.userId 
			let chatId = '';
			if (Number(simpleUserId) < Number(userId)) {
				chatId = userId + '_' + simpleUserId;
			}
			else {
			 	chatId = simpleUserId + '_' + userId;
			}
            
			let message = { ...messagePayload, toId: userId, chatId, isDeleted: false, isReadOnly: true, isSeen: false, isStarred: false, isMedia, cohortId: data.messageJobId, timeStamp: timeStamps };
            
			payload[chatId] = { "messages": { [timeStamps]: message } };
            
			userChats[`${userId}/${chatId}`] = createChatObject(chatId);

            updates[`${chatId}/messages/${timeStamps}`] = message;
        }

        // Send the messages to the users in the chunk with retries in case of failure
        for (let retries = 0; retries < maxRetries; retries++) {
            try {
                await db.ref(`chats`).update(updates);
                await db.ref(`userChats`).update(userChats);
                messageSent += chunk.length;
                messageSentTo.push(chunk);
				//console.log('Message Sent', messageSent);
				// Will Test this Notification part
				/*for (let userInfo of chunk) {
					let messageTitle = userInfo.userName;
					const notificationPayload = {
						id: "1",
						title: messageTitle ? messageTitle : '',
						type: 'chat',
						body: message + '',
					};
					//console.log('Send Notification', notificationPayload);
		
					Object.keys(userInfo).forEach(function (prop) {
						notificationPayload[prop] = userInfo[prop].toString();
					});
					//console.log('Send Notification', notificationPayload);
					await sendNotification(userInfo, notificationPayload);
				}*/

                break;
            }
            catch (error) {
				//console.log('error', error.message);
                if (retries === maxRetries - 1 || error.code !== "NETWORK_ERROR") {
                    messageFailed += chunk.length;
                    messageFailedTo.push(chunk);
                    break;
                }
            }
        }
		const updatedRec = await writeSeqInstance.query(
			"update msg_dashboard_job_history set no_of_users_received = no_of_users_received + $1, job_status = 'inprogress' where msg_job_id = $2",
			{ bind: [chunk.length, data.messageJobId], type: QueryTypes.UPDATE}
		);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

	const updatedRec = await writeSeqInstance.query(
		"update msg_dashboard_job_history set job_status = 'completed' where msg_job_id = $1",
		{ bind: [data.messageJobId], type: QueryTypes.UPDATE}
	);

    // Make Payload for message sent and failed
    return {
        "messageSent": messageSent,
        "messageFailed": messageFailed,
        "messageSentToIds": messageSentTo,
        "messageFailedToIds": messageFailedTo
    };
}

async function checkDeltaDataUserChats(userId, token) {
	var sortedData = await fetchChatUserChats('', token);
	return sortedData.chatArr;
}

const createDynamicChatGroup = async (adminId, grpTitle, grpMembers, isNewGrp, grpId, token, userInfo, postLocation, postLocData, groupPhoto) => {
    let groupMembers = [];
    var groupId = '';
    let createdByName = '';
	let grpIcon = '';
	let groupLat = postLocData.postLat;
	let groupLong = postLocData.postLong;
	let groupLocation = postLocData.location;
    
	//console.log(' Create Dynamic Chat Group --> adminId', adminId);
    const adminInfo = await utils.getUserInfo(adminId);
    //console.log('adminInfo', adminInfo);
    

    if (isNewGrp){
        // We wont add the Admin to the group members list as his data is already in the groupInfo
        //groupMembers.push(adminId);
        grpMembers.forEach(function(userId){
            if (userId != adminId){
                groupMembers.push(userId);
            }
        })
        
        createdByName = adminInfo.userName;
        try {
            // Attempt to get the place ID and process the response
            const response = await utils.getPlaceId({ locationArray: [postLocation] });
            //console.log('PhotoUrl Response:', response);
            
            // Prepare group data using the response
            let groupData = {
                isGroupCreatedProgrammatically: true, 
                createdById: adminId,
                createdBy: createdByName, 
                groupName: grpTitle, 
                groupProfileUrl:  groupPhoto || /*response[0].imageUrl || */'', // Simplified ternary operation
                groupLastMessage: "", 
                senderId: "", 
                lastMessageSenderName: "", 
                isDeleted: false, 
                chatType: "group",
				userProfilePic: adminInfo.userProfilePic || '', // Simplified ternary operation
				postLong: groupLong,
				postLat: groupLat,
				postLocation: groupLocation,
            };
            
            //console.log('groupData', groupData);
        
            // Create user chat and update groupId with the new chat ID
			let newGrp = await createUserChat(groupData, token);
			//console.log('newGrp- 2183', newGrp);
            if (newGrp && newGrp.chatArr && newGrp.chatArr.chatId) {
                groupId = newGrp.chatArr.chatId;
            } else {
                console.error('Error: createUserChat did not return a valid chatId. Response:', newGrp);
                throw new Error('Failed to create group chat: invalid response from createUserChat');
            }
        } catch (error) {
            // Handle any errors that occur during the process
            console.error('Error creating group chat:', error);
            // Re-throw the error so it can be handled upstream
            throw error;
        }       
    }
    else {
        if (grpMembers.length == 0){
            //return if there are no group members, but still return the groupId
            return grpId || '';
        }
		const groupResponse = await getGroupNode(grpId, null);
        if (!groupResponse || !groupResponse.groupData) {
            console.error('Error: Failed to fetch group data for groupId:', grpId);
            // Return the groupId anyway so the caller can handle it
            return grpId || '';
        }
        grpMembers.forEach(function(userId){
            const grpMemberData = groupResponse.groupData.members || {};
            if (userId != adminId && (Object.keys(grpMemberData).indexOf(userId) == -1)){
                groupMembers.push(userId);
            }
        })
		if (groupMembers.length == 0){
			//return if there are no members to be added or the user is already part of the group.
			// Still return the groupId so the caller knows which group it is
            return grpId || '';
		} 
        adminId = groupResponse.groupData.adminId;
        grpTitle = groupResponse.groupData.groupName;
        createdByName = groupResponse.groupData.createdByName;
        grpIcon = groupResponse.groupData.groupProfileURL;
        groupId = grpId;
    }
    let groupMembersData = { 
        groupId: groupId,
         
        newMemberIds: groupMembers, 
        data: { 
            createdById: adminId,
            isFindBuddyGroup: true,
            createdBy: createdByName, 
            groupName: grpTitle, 
            groupProfileUrl: groupPhoto || grpIcon, 
            groupLastMessage: "", 
            senderId: adminId, 
            lastMessageSenderName: "", 
            isDeleted: false, 
            chatType: "group",
			senderId: adminId,
			postLong: groupLong,
			postLat: groupLat,
			postLocation: groupLocation,
			
        } 
    };
    //console.log('groupMembersData', groupMembersData);
    addUsersToGroup(groupMembersData, token, userInfo);
    return groupId;
}

const updateUserStatusFindGroup = async (data) => {
    //console.log('data', data);
    var userMembersNode = db.ref('groupUsers/' + data.groupId + '/members/' + data.userId);
    
    if (data.optionType == 'accepted') {
        userMembersNode.update({ isRequested: '1'});
        checkAndFireNotification(data.userId, data, 'accepted');
        var receiversList = [];
        receiversList.push(data.userId);

		receiversList.forEach(async function (userid) {
			const notificationPayload = {
				id: "1",
				title: 'Group Chat Request Accepted.',
				type: 'group',
				body: data.userName +' has accepted your request to join their group. Chat Now.',
				imageUrl: '' ,
				groupId: data.groupId,
			};
			//console.log('Send Notification', notificationPayload);

			// Object.keys(userInfo).forEach(function (prop) {
			// 	notificationPayload[prop] = userInfo[prop].toString();
			// });
			//console.log('Send Notification For Accept', notificationPayload);
			sendNotification(data.userId, notificationPayload);
		})
    }
    else {
        userMembersNode.update({ isRequested: '2'}); 
    }
    return { responseCode: '200', message: 'User status updated successfully', object: data };
    
};

async function getDmCount(batchSize = 100) {
	let count = 0;
	let grCount = 0;
    let lastKey = null;
    let shouldFetch = true;

    while (shouldFetch) {
        // Fetch a batch of chats
        let query = db.ref('chats').orderByKey().limitToFirst(batchSize);

        if (lastKey) {
            query = query.startAt(lastKey);
        }

        const snapshot = await query.once('value');
        const chatData = snapshot.val();

        if (chatData) {
            const chatKeys = Object.keys(chatData);

            // Process each chat in the batch
            await Promise.all(
                chatKeys.map(async (key) => {
					if (key.includes('_')) {
						//console.log('Count', count);
						count++;
                        /*const chatMessage = await db.ref(`chats/${key}/messages`)
						.limitToLast(1).once('value');
                        const chatMessageData = chatMessage.val();

                        if (chatMessageData) {
                            // Process messages in the chat
                            await Promise.all(
								Object.keys(chatMessageData).map(async (messageKey) => {
									const timestamp = messageKey; // Example timestamp
									const currentTimestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
									const thirtyDaysInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds

									// Check if the timestamp is within the last 30 days
									if (currentTimestamp - timestamp <= thirtyDaysInSeconds) {
										//console.log("The timestamp is within the last 30 days.");
										count++;
									} else {
										////console.log("The timestamp is older than 30 days.");
									}
                                    ////console.log('messageKey', messageKey);
                                    // Uncomment and customize the condition below as needed
                                    // if (chatMessageData[messageKey].isDeleted == false && chatMessageData[messageKey].isMedia == false) {
                                    //     count++;
                                    // }
                                })
                            );
                        }*/

                        
					}
					else {
						//console.log('GR Count', count);
						grCount++;
					}
                })
            );

            // Update the last key for the next batch
            lastKey = chatKeys[chatKeys.length - 1];

            // If the batch size is smaller than the requested size, we've reached the end
            if (chatKeys.length < batchSize) {
                shouldFetch = false;
            }
        } else {
            shouldFetch = false;
        }
    }

    return { count: count, grCount: grCount };
}

// getDmCount().then(count => {
// 	//console.log('Total DMs:', count);

// });


// Path to the nodes we want to delete
/*const basePath = '/userChats/9191';
const nodesToDelete = 22075;
const batchSize = 100; // Process in smaller batches to avoid timeout issues

let deletedCount = 0;
let isDeleting = false;
let shouldStop = false;

// Function to log messages (can be connected to UI)
function logMessage(message) {
	//console.log(message);
// You can also update a UI element here if needed
}

// Delete nodes in batches
async function deleteNodes() {
try {
	logMessage(`Starting deletion of first ${nodesToDelete} nodes from ${basePath}`);
	
	deletedCount = 0;
	isDeleting = true;
	shouldStop = false;
	
	while (deletedCount < nodesToDelete && !shouldStop) {
	try {
		// Get a batch of nodes
		const currentBatchSize = Math.min(batchSize, nodesToDelete - deletedCount);
		const nodesRef = db.ref(basePath);
		const snapshot = await nodesRef.orderByKey().limitToFirst(currentBatchSize).once('value');
		
		if (!snapshot.exists()) {
		logMessage('No more nodes to delete');
		break;
		}
		
		//console.log('snapshot', snapshot.val());
		//return;
		
		// Delete each node in the batch
		const deletePromises = [];
		
		snapshot.forEach((childSnapshot) => {
			//console.log('childSnapshot', childSnapshot.val());
			const nodeKey = childSnapshot.key;
			const nodeRef = db.ref(`${basePath}/${nodeKey}`);
			deletePromises.push(nodeRef.remove());
		});
		
		await Promise.all(deletePromises);
		
		const batchDeletedCount = deletePromises.length;
		deletedCount += batchDeletedCount;
		
		logMessage(`Deleted batch of ${batchDeletedCount} nodes. Total deleted: ${deletedCount}`);
		
		// If we deleted fewer nodes than requested in this batch, we're done
		if (batchDeletedCount < currentBatchSize) {
		break;
		}
		
		// Small delay to prevent overwhelming the database
		await new Promise(resolve => setTimeout(resolve, 500));
	} catch (error) {
		logMessage(`Error deleting batch: ${error.message}`);
		// Continue with next batch despite errors
	}
	}
	
	if (shouldStop) {
	logMessage('Deletion stopped by user');
	} else {
	logMessage(`Deletion complete. Total nodes deleted: ${deletedCount}`);
	}
} catch (error) {
	logMessage(`Error during deletion process: ${error.message}`);
} finally {
	isDeleting = false;
}
}

// Start the deletion process
function startDeletion() {
if (!isDeleting) {
	deleteNodes();
}
}

// Stop the deletion process
function stopDeletion() {
if (isDeleting) {
	shouldStop = true;
	logMessage('Stopping deletion process...');
}
}*/


//startDeletion(); // Start the deletion process



//Export the functions
module.exports = {
	setUserNode,   // create a user node
	getUserNode,   // fetch a user node
	getGroupNode,  // fetch group node
	fetchChatMessages, // fetch chat messages for logged in user based on token
	createUserChat, // create a new chat thread
	postChatMessage, // post a message to a chat / group thread
	fetchChatUserChats,
	fetchChatUserChat,
	addUsersToGroup,
	removeUserFromGroup,
	exitUserFromGroup,
	updateUserChats,
	updateChatFlags,
	updateGroupImage,
	updateGroupLabel,
	getUserPresence,
	setUserPresence,
	fetchGroupMembers,
	fetchUsersGroups,
	sendMessageToUsers,
	createDynamicChatGroup,
	checkDeltaDataUserChats,
	getGroupCount,
	getChatCount,
    updateUserStatusFindGroup // Updates the isRequested status in groupUsers/groupId/members
}