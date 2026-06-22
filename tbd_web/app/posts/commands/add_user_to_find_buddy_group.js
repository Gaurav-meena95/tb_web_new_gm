"use strict";

const seqConfig = require("../../config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const writeSeqInstance = seqConfig.write_sequelize;
const appConstants = require("../../constants");
const utils = require("../../utils");
const firebaseObj = require('../../firebase-chat-connection');

const addUserToFindBuddyGroup = async (payload, token) => {
    try {

        if (!payload.postId){
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Bad request"
            };
        }

        let postInfoQry = "select group_id, location, TO_CHAR(travel_time, 'DD_MM_YYYY') travel_on, post_by_user_id, location_lat, location_long from posts where feed_type = 1 and post_id = $1";
        let postInfo = await readSeqInstance.query(
            postInfoQry,
            { bind: [payload.postId], type: QueryTypes.SELECT }
		);

        let groupId = '';
        if (postInfo.length > 0) {
			//console.log('Post info', postInfo[0]);
            // Normalize groupId to string, handle null, undefined, or non-string values
            const rawGroupId = postInfo[0].group_id;
            groupId = (rawGroupId != null && rawGroupId !== undefined) ? String(rawGroupId).trim() : '';
        }
        else {
            return {
                status: "error",
                responseCode: 400,
                errorMessage: "Not a find buddy post"
            };
        }
        
		let userInfo = await utils.getUserInfo(appConstants.LOGGED_IN_USER_ID);
		// console.log('User info', userInfo);
		// console.log("Post info", postInfo[0]);
        
        // userId is userInfo.userId
        
        /*if (!userInfo.isVerified && (groupId == '' || groupId == null)){
            return {
                status: "warning",
                responseCode: 403,
                errorMessage: "Non-verified user can not create a group"
            };
        }*/
        
		let postedBy = postInfo[0].post_by_user_id;
		let postLat = postInfo[0].location_lat;
		let postLong = postInfo[0].location_long;
		let location = postInfo[0].location;
		
		let postLocData = {
			postLat: postLat,
			postLong: postLong,
			location: location
		}

        let groupMembers = [];
        groupMembers.push(appConstants.LOGGED_IN_USER_ID);
        let groupTitle = ''; // Declare groupTitle outside the if/else block
        let adminName = ''; // Declare adminName outside the if/else block
        let groupPhoto = ''; // Declare groupPhoto outside the if/else block
        
		let groupPhotoQry = "select pm.post_media_url  from post_media pm where pm.post_id =$1";
		let getGroupPhoto = await readSeqInstance.query(
			groupPhotoQry,
			{ bind: [payload.postId], type: QueryTypes.SELECT }
		);
		if (getGroupPhoto.length > 0) {
			groupPhoto = getGroupPhoto[0].post_media_url;
		}
		else {
			groupPhoto = '';
		}
		
		// Check if groupId is empty, null, undefined, or just whitespace
		// groupId is already normalized to string and trimmed above
		if (!groupId || groupId === '') {
            groupMembers.push(postedBy);
			groupMembers.push(userInfo.userId);
			
            
            function formatDate(dateString) {
                let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
                // Split the date string
                let parts = dateString.split(" ");
                let day = parseInt(parts[0], 10); // Day
                let month = parseInt(parts[1], 10); // Month
                let year = parts[2]; // Year

                // Get month abbreviation
                let monthAbbr = months[month - 1];

                return `${day} ${monthAbbr} ${year}`;
            }
            
            let travelDate = formatDate(utils.removeSpecialCharacters(postInfo[0].travel_on));
            // Make like this-->  Buddies for Goa 26 Jul 2024
            
            // Dont add the List of users who had liked this post to the group
            /*let postLikeInfoQry = "select post_like_by_user_id from post_likes where post_id = $1";
            let postLikeInfo = await readSeqInstance.query(
                postLikeInfoQry,
                { bind: [payload.postId], type: QueryTypes.SELECT }
            );
            for (let j=0;j<postLikeInfo.length;j++){
                groupMembers.push(postLikeInfo[j].post_like_by_user_id);
            }*/
           
            var postLocation = utils.removeSpecialCharacters(postInfo[0].location.split(',')[0]);    
           
           
            groupMembers = groupMembers.filter((x, i, a) => a.indexOf(x) === i);
            groupTitle = 'Buddies in ' + postLocation + ' for - ' + travelDate; 
            
            // Get admin info for new group (name and photo)
            try {
                const adminInfo = await utils.getUserInfo(postedBy);
                adminName = adminInfo.userName || adminInfo.name || 'Admin';
            } catch (error) {
                console.log('Error fetching admin info:', error);
                adminName = 'Admin'; // Fallback to 'Admin' if fetch fails
                groupPhoto = ''; // Empty photo if fetch fails
            }
            
            //get users who had liked this post as part of grpmembers
            //get unique grpMembers
            // In line below, we have to pass the userId of the creator of the post, not the current user --> postedBy
            
			//console.log('postedBy', postedBy);
            try {
                const returnedGroupId = await firebaseObj.createDynamicChatGroup(postedBy, groupTitle, groupMembers, true, undefined, token, userInfo, postLocation, postLocData, groupPhoto);
                // Normalize the returned groupId
                if (returnedGroupId && String(returnedGroupId).trim() !== '') {
                    groupId = String(returnedGroupId).trim();
                } else {
                    console.error('Error: createDynamicChatGroup returned empty or invalid groupId:', returnedGroupId);
                    throw new Error('Failed to create group: invalid groupId returned');
                }
            } catch (error) {
                console.error('Error creating dynamic chat group:', error);
                throw error; // Re-throw to be caught by outer try-catch
            }
            
            // After group creation, try to get the actual group photo from Firebase
            // (in case it was set to a location photo or other image)
            try {
                const groupResponse = await firebaseObj.getGroupNode(groupId, null);
                if (groupResponse && groupResponse.groupData) {
                    if (groupResponse.groupData.groupProfileURL) {
                        groupPhoto = groupResponse.groupData.groupProfileURL;
                    }
                }
            } catch (error) {
                console.log('Error fetching group photo after creation:', error);
                // Keep the admin profile pic we already set
            }
            
            //update grpid in posts table
            const updatedRec = await writeSeqInstance.query(
                "update posts set group_id = $1 where post_id = $2",
                { bind: [groupId, payload.postId], type: QueryTypes.UPDATE}
            );
                
		} else {
			// When group already exists, verify groupId is valid
            // groupId is already normalized to string and trimmed above
            if (!groupId || groupId === '') {
                // If groupId is empty, this shouldn't happen if the condition above worked correctly
                // But handle it gracefully by returning an error
                console.log('Error: groupId is empty in database but we reached else block. This indicates a data inconsistency.');
                return {
                    status: "error",
                    responseCode: 500,
                    errorMessage: "Group ID is missing from database. Please contact support."
                };
            }
            
            // When group already exists, fetch the group title, admin name, and photo from Firebase
            try {
                const groupResponse = await firebaseObj.getGroupNode(groupId, null);
                if (groupResponse && groupResponse.groupData) {
                    // Get group title
                    if (groupResponse.groupData.groupName) {
                        groupTitle = groupResponse.groupData.groupName;
                    }
                    
                    // Get admin name
                    if (groupResponse.groupData.createdByName) {
                        adminName = groupResponse.groupData.createdByName;
                    } else if (groupResponse.groupData.createdById) {
                        // If createdByName is not available, fetch it from user info
                        try {
                            const adminInfo = await utils.getUserInfo(groupResponse.groupData.createdById);
                            adminName = adminInfo.userName || adminInfo.name || 'Admin';
                        } catch (error) {
                            console.log('Error fetching admin info:', error);
                            adminName = 'Admin';
                        }
                    } else {
                        adminName = 'Admin'; // Fallback
                    }
                    
                    // Get group photo
                    if (groupResponse.groupData.groupProfileURL) {
                        groupPhoto = groupResponse.groupData.groupProfileURL;
                    }
                }
            } catch (error) {
                console.log('Error fetching group data:', error);
                // If fetching fails, we'll return empty values
                adminName = 'Admin'; // Fallback
                groupPhoto = ''; // Empty photo if fetch fails
            }
            
            // Capture the return value to ensure groupId is properly set
            try {
                const returnedGroupId = await firebaseObj.createDynamicChatGroup(-1, '', groupMembers, false, groupId, token, userInfo, undefined, postLocData, groupPhoto);
                // Ensure we use the returned groupId (should be the same, but good to be safe)
                if (returnedGroupId && String(returnedGroupId).trim() !== '') {
                    groupId = String(returnedGroupId).trim();
                } else {
                    // If returnedGroupId is empty but we have groupId from database, keep using it
                    // This can happen if user is already in the group
                    console.log('Warning: createDynamicChatGroup returned empty groupId, using existing groupId:', groupId);
                }
            } catch (error) {
                console.error('Error adding user to existing group:', error);
                // If there's an error but we have a valid groupId, continue with it
                // This handles cases where the user might already be in the group
                if (!groupId || groupId === '') {
                    throw error; // Re-throw if we don't have a valid groupId
                }
                console.log('Continuing with existing groupId despite error:', groupId);
            }
        }
        
        // Validate that groupId is not empty before returning
        // groupId is already normalized to string and trimmed
        if (!groupId || groupId === '') {
            console.log('Error: groupId is empty after processing');
            return {
                status: "error",
                responseCode: 500,
                errorMessage: "Failed to create or retrieve group ID. Please try again."
            };
        }
                
		return {
			status: "success", 
			"responseCode": 200, 
			"object": {
				"groupId": groupId,
				"groupTitle": groupTitle,
				"adminName": adminName,  // Include admin name in response
				"groupPhoto": groupPhoto  // Include group photo in response
			}
		};
    }
    catch (error) {
        console.log(error);
        appConstants.sentryObj.captureException(error);
        return { status: "error", "responseCode": 400, message: error.message };
    }
};

module.exports = addUserToFindBuddyGroup;
