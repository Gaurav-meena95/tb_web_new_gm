function drawerActions() {
	
	drawer({
		duration: '300',
		animation: 'ease-in-out',
		distance: 6,
		width: '420px',
	});
	if (jQuery('#main__drawer .drawerBody').length == 0) {
		jQuery('#main__drawer').append('<div class="drawerBody"></div>');
	}

	jQuery(document).on('click', '.drawer-kapat', function (a_obj) {
		a_obj.preventDefault();
		cleanDrawer();
		if (window.location.href.includes('login')) {
			window.history.pushState('', '', '/flights');
			reloadWindowWithIosCheck();
		}
	});
}

function feedActions() {
	
	// Go Premium
	
	jQuery(document).on('click', '.go__ads-free', function () {
		redirect('premium');
	});
	
	jQuery(document).on('click', '.go__ads-free.premiumPage', function () {
		// Scroll down to price-slider class into view
		jQuery('.price-slider').get(0).scrollIntoView({ behavior: 'smooth' });
	});
	
	jQuery(document).on('click', '.singlePostBack', function () {
		if (jQuery('#footer ul li').hasClass('active')) {
			window.history.pushState('', '', '/community');
		}
		else {
			var target = isAndroid() || isIOS() || isMobile() || isPwa() ? '#footer ul li[data-item="homePage"]' : '.desktopMenu-socialApp';
			jQuery(target).click();
		}
		destroyAllSecondaryTabs();
		
	});
	
	//Like Button Click
	jQuery(document).on('click', '.feed__actions-like', function () {
		if (!guestMaster()) {
			manageLikes('Btn', jQuery(this).parents('.feed_item').attr('data-id'), this);
		} else {
			redirect('login');
		}
	});

	//Images Double Click
	jQuery(document).on('dblclick', '.feed__body-images, .dblImage', function () {
		if (!guestMaster()) {
			var isFindPost = jQuery(this).parent().parent();
			var postId = jQuery(this).parents('.feed_item').attr('data-id');
			if (isFindPost.hasClass('feed_item-find_buddy')) {
				var elem = isFindPost.find('.feed__body-interested');
				
				manageLikes('Interested', postId, elem);
			}
			else {
				element = jQuery(this).next('.feed__body-actions');
				element = jQuery(element).closest('.feed__body-actions').find('.feed__actions-like');
				manageLikes('Double Click', postId, element);
			}
		}
	});

	//Find Buddy Interested
	jQuery(document).on('click', '.feed__body-interested', function () {
		if (!guestMaster()) {
			postId = jQuery(this).parents('.feed_item').attr('data-id');
			// Dont call the function if the class is createGroup
			if (!jQuery(this).hasClass('createGroup')) {
				console.log('interested');
				// manageLikes('Btn', jQuery(this).parents('.feed_item').attr('data-id'), this);
				manageLikes('Interested', postId, jQuery(this));
			}
		}
		else {
			redirect('login');
		}
	});

	//Like Open
	jQuery(document).on('click', '.feed__actions-liked_users, .feed__body-interests', function () {
		element = 'Likes';
		if (jQuery(this).hasClass('feed__body-interests')) {
			element = 'Interested';
		}

		renderLikes(
			'init',
			{
				postId: jQuery(this).parents('.feed_item').attr('data-id'),
				pageNumber: 0,
			},
			element
		);
	});

	//Comments Open
	jQuery(document).on('click', '.feed-comment', function () {
		loaderMain('global', true);
		renderComments('init', {
			postId: jQuery(this).parents('.feed_item').attr('data-id'),
			commentFetchType: 1,
			mediaId: 0,
			commentId: 0,
		});
	});

	//Comments Post
	jQuery(document).on('click', '.feed__comment button', function () {
		if (!guestMaster()) {
			buttontext = jQuery(this).text();
			console.log(buttontext);
			comment = jQuery(this).prev('textarea').val();

			if (comment !== '') {
				if (buttontext.includes('Post')) {
					if (jQuery(this).parents('.feed__comment').hasClass('reply')) {

						jsInit('replyComment', { 'reply': comment, 'commentByUserId': 0, 'commentId': jQuery(this).parents('.feed__comment').attr('comment-id'), 'postId': jQuery(this).parents('.feed__comment').attr('post-id') });
					}
					else {
						postId = jQuery(this).parents('.feed_item').attr('data-id');
						if (!postId) {
							postId = jQuery(this).parents('.drawerBody').find('.comments__box').attr('data-postid');
							console.log(postId)
						}

						if (!postId) {
							toast('Something went wrong. Please try again later.');
						}
						else {
							feedItem = jQuery('.feed_item[data-id="' + postId + '"]');
							shotItem = jQuery('#main__shots-box .shots__item[data-post="' + postId + '"]');
							jsInit('postComment', {
								postByUserId: manageUserProfile('read', 'userId'),
								postId: postId,
								comment: comment,
							});
							jQuery(this).prev('textarea').val('');

							setTimeout(() => {
								if (jQuery(this).parents('.feed_item').find('.feed__body-comments').length > 0) {
									jQuery(this).parents('.feed_item').find('.feed-comment').click();
								}
								else {
									//Add the comment to the feed
									jQuery(this).parents('.feed_item').find('.feed__body').append('<div class="feed__body-comments"><p>View all <span>1</span> comment</p></div>');
									jQuery(this).parents('.feed_item').find('.feed-comment').click();
								}
							}, 150);

							//If the comments box is open close and reopen the comments box
							if (jQuery(this).parents('.drawerBody').find('.comments__box').length > 0) {
								console.log('Comments Box Open');
								jQuery(this).parents('#main__drawer').find('.drawerHeader svg').click();
								feedItem.find('.feed-comment').click();
								jQuery('#main__shots-box .shots__item[data-post="' + postId + '"]').find('.shots__comment svg').click();
							}

							//Update the comment count
							commentCount = feedItem.find('.feed__body-comments p');
							jQuery(commentCount).html(parseInt(jQuery(commentCount).html()) + 1);
						}
					}
				}
				else {
					jsInit('editComment',
						{
							comment: jQuery(this).prev('textarea').val(),
							commentByUserId: jQuery(this).parents('.drawerBody').find('.feed__comment').attr('comment-by-user-id'),
							commentId: jQuery(this).parents('.drawerBody').find('.feed__comment').attr('comment-id'),
							commentTime: "2023-07-26 11:26:12",
							postId: jQuery(this).parents('.drawerBody').find('.comments__box').attr('data-postid'),
						});
					var commentId = jQuery(this).parents('.drawerBody').find('.feed__comment').attr('comment-id');
					jQuery('.comment__item[data-comment-id="' + commentId + '"] .comment__item-content').text(comment);
					jQuery(this).prev('textarea').val('');
					jQuery(this).parents('.drawerBody').find('.feed__comment button').text('Post');
				}
			}
		} else {
			redirect('login');
		}
	});

	//Comment Like
	jQuery(document).on('click', '.comment__item-like', function () {
		if (!guestMaster()) {
			commentId = jQuery(this).parents('.comment__item').attr('data-comment-id');
			liked = jQuery(this).attr('data-isLiked');
			likes_item = jQuery(this).find('.comment__item-like-count');
			likes = jQuery(likes_item).attr('data-likes');
			postId = jQuery(this).parents('.comments__box').attr('data-postid');
			commentByUserId = jQuery(this).parents('.comment__item').attr('data-user');

			if (liked == 'false') {
				jQuery(this).children('svg').replaceWith(icons.heart_active);
				jQuery(this).attr('data-isLiked', 'true');
				jQuery(likes_item).attr('data-likes', parseInt(likes) + 1);
				jQuery(likes_item).html(parseInt(likes) + 1);
				liked = true;
			}
			else if (liked == 'true') {
				jQuery(this).children('svg').replaceWith(icons.heart);
				jQuery(this).attr('data-isLiked', 'false');
				jQuery(likes_item).attr('data-likes', parseInt(likes) - 1);
				jQuery(likes_item).html(parseInt(likes) - 1);
				liked = false;
			}
			//Check if the clicked item parent is comment__item-replies
			if (jQuery(this).parents('.comment__item-replies').length > 0) {
				replyId = jQuery(this).parents('.comments__box').find('.comment__item').attr('data-comment-id');
				commentByUserId = jQuery(this).parents('.replies__box').attr('data-user');
				payload = {
					commentByUserId: commentByUserId, // Id of the user who has replied,
					postId: postId,
					actionType: 'reply',
					replyId: replyId, //Needed for like
					isLiked: liked,
					commentId: 0,
				};
			}
			else {
				commentId = jQuery(this).parents('.comments__box').find('.comment__item').attr('data-comment-id');
				payload = {
					commentByUserId: commentByUserId, // Id of the user who has Commented,
					postId: postId,
					actionType: 'comment',
					commentId: commentId, //Needed for like
					isLiked: liked,
					replyId: 0,
				};

			}
			jsInit('likeCommentOrReply', payload);
		}
	});

	//Comment Reply
	jQuery(document).on('click', '.comment__item-reply', function () {

		//reply: description
		//commentByUserId: data-user
		//"commentId": 770502 data-comment-id
		//postId": 890723, data-postid
		//mediaId ( to be checked )

		commentId = jQuery(this).parents('.comment__item').attr('data-comment-id');
		userName = jQuery(this).parents('.comment__item').find('.comment__item-name').text();
		postId = jQuery(this).parents('.comments__box').attr('data-postid');
		userId = jQuery(this).parents('.comment__item').attr('data-user');

		console.log('Comment Reply - ' + userName);

		jQuery('.feed__comment').addClass('reply');
		jQuery('.feed__comment').attr('comment-id', commentId);
		jQuery('.feed__comment').attr('post-id', postId);
		jQuery('.feed__comment').attr('user-id', userId);

		//Add userID to the reply textarea content
		jQuery(this)
			.parents('.drawerBody')
			.find('.feed__comment textarea')
			.val('@' + userName + ' ');
		jQuery(this).parents('.drawerBody').find('.feed__comment textarea').focus();
	});

	//Get Comment Replies
	jQuery(document).on('click', '.comment__item-replies-toggle', function () {
		commentId = jQuery(this).parents('.comment__item').attr('data-comment-id');
		postId = jQuery(this).parents('.comments__box').attr('data-postId');
		repliesMasterBox = jQuery(this).parents('.comment__item-replies');

		//In case Replies have already been fetched - just toggle them. This is to prevent multiple requests.
		if (jQuery(repliesMasterBox).attr('data-expanded') == 'true') {
			jQuery(repliesMasterBox).children('.replies__box').slideToggle();
			jQuery(repliesMasterBox).attr('data-expanded', 'false');

			replies = jQuery(repliesMasterBox).attr('data-replies');
			replies = renderReplies(Number(replies));
			jQuery(repliesMasterBox).children('span.comment__item-replies-toggle').replaceWith(replies);
		}
		else if (jQuery(repliesMasterBox).attr('data-expanded') == 'false') {
			jQuery(repliesMasterBox).children('.replies__box').slideToggle();
			jQuery(repliesMasterBox).attr('data-expanded', 'true');
			jQuery(repliesMasterBox).children('span.comment__item-replies-toggle').html('Hide Replies');
		}
		else if (jQuery(repliesMasterBox).attr('data-expanded') == undefined) {
			jsInit(
				'getCommentReplies',
				{
					postId: postId,
					commentId: commentId,
					replyFetchType: '1',
					replyId: '3',
				},
				repliesMasterBox
			);
		}
	});

	//Profile Open from comment
    jQuery(document).on('click', '.comment__item-name, .comment__item-image img', function () {
        profileUserId = jQuery(this).parents('.comment__item').attr('data-user');
        if (profileUserId.length > 15){
            redirect('profile', profileUserId);
        }
        else{
            jsInit('openProfileFromChat', { userId: profileUserId });
        }
    });

	//Profile Open from feed
	jQuery(document).on('click', '.feed___head-name, .feed__head-img a', function () {
		if (!guestMaster()) {
			var date = new Date();
			var formattedDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
			console.log(formattedDate);
			var currentTime = new Date($.now());
			console.log(currentTime.toLocaleTimeString());
			console.log(jQuery(this).parents('.feed_item').attr('data-user'));
			
			var timestamp = Math.floor(Date.now() / 1000);

			if (manageUserProfile('read', 'isVerified') == true) {
				redirect('profile', jQuery(this).parents('.feed_item').attr('data-user'));
				localStorage.removeItem('profileViews');
				localStorage.removeItem('lastProfileSeenTime'); // Also remove timestamp
			}
			else {
				var profileCount = localStorage.getItem('profileViews');
				var profileSeenTime = Number(localStorage.getItem('lastProfileSeenTime')); // Convert to number
				
				if (profileCount) {
					var profileCountNumber = Number(profileCount);
					if (profileCountNumber < 3) {
						profileCountNumber++;
						localStorage.setItem('profileViews', profileCountNumber);
						redirect('profile', jQuery(this).parents('.feed_item').attr('data-user'));
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
							toast('Subscribe Now to Unlock more Profiles');
							redirect('premium');
						}
						else {
							localStorage.setItem('lastProfileSeenTime', timestamp);
							localStorage.setItem('profileViews', 1);
							redirect('profile', jQuery(this).parents('.feed_item').attr('data-user'));
						}
					}
				}
				else {
					localStorage.setItem('lastProfileSeenTime', timestamp);
					localStorage.setItem('profileViews', 1);
					redirect('profile', jQuery(this).parents('.feed_item').attr('data-user'));
				}
			}

		}
		else {
			redirect('login');
		}
	});

	//Textarea on enter click the post button & disbale the enter key
	jQuery(document).on('keypress', '.feed__comment textarea', function (e) {
		if (e.which == 13) {
			jQuery(this).next('button').click();
			return false;
		}
	});

	//Textarea on control + enter add a new line
	jQuery(document).on('keydown', '.feed__comment textarea', function (e) {
		if (e.which == 13 && e.ctrlKey) {
			jQuery(this).val(jQuery(this).val() + '\n');
		}
	});

	//Bookmark Button Click
	jQuery(document).on('click', '.feed__actions-bookmark', function () {
		if (!guestMaster()) {
			bookmarkPost(jQuery(this).parents('.feed_item').attr('data-id'), jQuery(this).attr('data-bookmarked'));
			if (jQuery(this).attr('data-bookmarked') == 'bookmarked') {
				jQuery(this).attr('data-bookmarked', '');
				jQuery(this).html(icons.bookmark).removeClass('active');
			}
			else {
				jQuery(this).attr('data-bookmarked', 'bookmarked');
				jQuery(this).html(icons.bookmark_active).addClass('active');
			}
		} else {
			redirect('login');
		}
	});

	//When a video comes into view play it
	jQuery(document).on('livequery', '.feed__body-video-overlay:visible', function (event, isInView) {
		jQuery(this).click();
		console.log('Video Playing');
		// if (isInView == true) {
		// }
		// else {
		//     jQuery(this).click();
		//     console.log('Video Paused');
		// }
	});

	//Location Click
	jQuery(document).on('click', '.feed___head-name-location, .feed__body-trip_location span', function (e) {
		e.preventDefault();
		locationName = jQuery(this).html();
        
        payload = { location: locationName, feedsType: 'LOCATION', postLat: jQuery(this).parents('.feed_item').attr('data-lat'), postLong: jQuery(this).parents('.feed_item').attr('data-lng')};
        
		redirect('location', payload);
	});

	//Hashtag Click
	jQuery(document).on('click', 'a.hashtag-item', function (e) {
		e.preventDefault();
		hashtag = jQuery(this).html();
		redirect('hashtag', hashtag);
	});

	//Mention Click
	jQuery(document).on('click', 'a.mention-item', function (e) {
		e.preventDefault();
		mention = jQuery(this).html();
		redirect('profile', mention);
	});

	//Follow
	jQuery(document).on('click', '.likes_item-follow', function () {
		if (!guestMaster()) {
			jQuery(this).addClass('disabled-link').html(icons.loader);
			payload = { button: this, uniqueUserId: jQuery(this).parents('.likes__item').attr('data-uniqueid') };
			jsInit('followUser', { userId: jQuery(this).parents('.likes__item').attr('data-user') }, payload);
		}
	});

	//Open User Profile from Likes Item
	jQuery(document).on('click', '.likes__item-identity', function () {
		redirect('profile', jQuery(this).parents('.likes__item').attr('data-user'));
		drawer('close');
	});

	//Close Secondary
	jQuery(document).on('click', '.drawer__back, .profile__head-left-back', function () {
		// if (localStorage.getItem('homePageClicked') == 'true' && !(jQuery('#secondary').find('.secondary__tab').length >= 2)) {
		// 	jQuery('#main__homepage-box').show();
		// }
		manageSecondary('hide', 'location', '');
		// redirect('back');
		loaderMain('master', false);
		
		// if (jQuery(this).hasClass('profile__head-left-back') && !jQuery('#main__feed-box').hasClass('active')) {
		// 	jQuery('#footer ul li[data-item="feed"]').click();
		// 	jQuery('#footer ul li[data-item="feed"]').addClass('active');
			
		// }
		
	});
	
	jQuery(document).on('click', '.trendingGroupTrips', function (e) {
		e.preventDefault();
		console.log('Trending Group Trips');
		if (isMobile()) {
			jQuery('.header__logo').click();
		}
		else {
			jQuery('#footer ul li[data-item="feed"]').click();
		}
	});
	

	//Read More
	jQuery(document).on('click', '.feed__body-readmore, .feed__body-description', function () {
		postId = jQuery(this).parents('.feed_item').attr('data-id');
		redirect('post', postId);
	});

	//Locals Card Click
	jQuery(document).on('click', '.feed_type-locals ul li', function () {
		redirect('profile', jQuery(this).attr('data-user'));
	});

	//View Related Find Posts
    jQuery(document).on('click', '.feed__body-related', function (e) {
        if (jQuery(this).hasClass('chatNow')) {
            if (!guestMaster()) {
                if (true) {
                    console.log('Chat Button Clicked');
                    userId = jQuery(this).parents('.feed_item').attr('data-user');
                    data = {
                        userId: userId,
                        userDp: jQuery(this).parents('.feed_item').find('.feed__head-img img').attr('src'),
                        userName: jQuery(this).parents('.feed_item').find('span.feed___head-name').text()
                    }
                    if (jQuery('#main__chat-box').length == 0) {
                        renderChat('init');
                        loaderMain('global', true);
                    }
                    redirect('chat', data);
                    removeActiveClassFromMain();
                    jQuery('#main__chat-box').addClass('active');
                }
                else {
                    toast('Please download the TravelBuddy App to Chat with Travelers around the Globe.');
                    return;
                }
            } else {
                redirect('login');
            }
        }
		else {
			
			if (guestMaster()) {
				redirect('login');
				return;
			}
			redirect('view_related', { title: 'Similar Plans', id: jQuery(this).parents('.feed_item').attr('data-id'), location: jQuery(this).parents('.feed_item').attr('data-location'), postLat: jQuery(this).parents('.feed_item').attr('data-lat'), postLong: jQuery(this).parents('.feed_item').attr('data-lng')});
		}
		
    });


	//Open Premium from Ads
	/*jQuery(document).on('click', '.support__travelBuddy', function (e) {
		destroyAllSecondaryTabs();
		redirect('premium');
	});*/

	jQuery(document).on('click', '.premium_ad', function (e) {
		destroyAllSecondaryTabs();
		redirect('premium');
	});

	//Open Small Menu
	jQuery(document).on('click', '.shots__more', function () {
		//jQuery(this).find('.options__menu').toggle();
		console.log('Open Menu');
	});

	// Follow from Feeds
	jQuery(document).on('click', '.feed__head-follow', function () {
		if (!guestMaster()) {
			console.log('Follow from Feeds');
			userId = jQuery(this).parents('.feed_item').attr('data-user');
			payload = { from: 'feed', uniqueUserId: jQuery(this).parents('.feed_item').attr('data-uniqueid') };
			jsInit('followUser', { userId: userId }, payload);
		}
		else {
			redirect('login');
		}
	});
	
	jQuery(document).on('click', '.createGroup', function () {
		if (!guestMaster()) {
			// Call the Api to create Group for Find Buddy
            thisDiv = jQuery(this);
			thisDiv.hide();
            // Convert groupData array to an object indexed by groupId for easier access
            
			// Fetch group data from IndexedDB
			var getTestersEmail = returnTestersEmail();
			if (/*getTestersEmail.includes(manageUserProfile('read', 'email'))*/ true) {
				jsInit('addUserToFindGroup', { postId: thisDiv.parents('.feed_item').attr('data-id') });
				return;
			}
		}
		else {
            redirect('login');
		}
	});
			
}

function cardActions() {
	// Listen for click events on multiple elements
	jQuery(document).on('click', '.exp_card, .carousel-slide, .top_card-slide, .premium_cards_slider, .support__travelBuddy, .influencer_title_box u, .inf_profile_box , h5#traveller-card_name, .traveller_pfp, .shots_redirect, .shots-slide, .trending_location_indvcard, #see_all_redirect, .profile-icon-left, .listing-card-image, .listing-desc, #see_all_listing', function (e) {
		// Prevent the default action of the click event
		e.preventDefault();
		// Get the clicked element
		target = jQuery(this);
		// Check if the clicked element is an experience card
		if (target.is('.exp_card')) {
			// Get the URL of the experience
			expUrl = target.attr('data-redirect');
			// If the URL is an external link, open it in a new tab
			if (expUrl.includes('/flights')) {
				destroyAllSecondaryTabs();
				jQuery('.menu__feed.openExperiences svg').click();
			}
			else if (expUrl.includes('/ai-plan-trip')) {
				manageSecondary('show', 'ai_itinerary');
        		jQuery('.desktopMenu-aiBuddy').addClass('active');
			} else if (expUrl.includes('http'))
				window.open(expUrl);
			else if (expUrl == 'premium') {
				destroyAllSecondaryTabs();
				redirect('premium');
				
			}
			else if (expUrl == 'experiences') {
				destroyAllSecondaryTabs();
				jQuery('.menu__feed.openExperiences svg').click();
				jQuery('.experiencesToggle input[type="radio"][value="3"]').click();
				
			}
			
			// Otherwise, redirect to the experience page
			else redirect('singleExperience', { id: expUrl.split('-').pop().replaceAll('/', ''), url: expUrl });
		}
		else if (target.is('.carousel-slide')) {
            redirectTo = target.attr('data-redirect');
            switch (redirectTo) {
                case 'flights':
                    destroyAllSecondaryTabs();
                    jQuery('.menu__feed.openExperiences svg, .desktopMenu-experiencesApp').click();
                    break;
                case 'add-share-post':
                    // Open Share
                    jQuery('#footer ul li[data-item="addPost"]').click();
                    jQuery('.addPost__tab-item[data-id="share"]').click();
                    break;
                case 'add-find-post':
                    // Open Find
                    jQuery('#footer ul li[data-item="addPost"]').click();
                    jQuery('.addPost__tab-item[data-id="find"]').click();
                    break;
                case 'experiences':
                    destroyAllSecondaryTabs();
                    jQuery('.menu__feed.openExperiences svg, .desktopMenu-experiencesApp').click();
					jQuery('.experiencesToggle input[type="radio"][value="3"]').click();
					break;
				case 'premium':
					destroyAllSecondaryTabs();
					jQuery('.desktopMenu-premium').click();
					jQuery('#footer ul li').removeClass('active').filter('[data-item="premium"]').addClass('active');
					break;
            }
        } 
		// Check if the clicked element is a top card slide
		else if (target.is('.top_card-slide')) {
			// Get the redirect target
			where = target.attr('data-redirect');
			if (where != undefined){
				// If the target is not flights-hotels or experiences, open it in a new tab
				if (where !== 'flights-hotels' && where !== 'experiences'){
					 window.open(where);
				}	
				// Otherwise, simulate a click on the corresponding header item
				else jQuery(where == 'flights-hotels' ? '.head__skyScanner' : '.head__experiences').click();
			}
		} 
		// Check if the clicked element is a premium card slider
		else if (target.is('.premium_cards_slider , .support__travelBuddy')){
			destroyAllSecondaryTabs();
			redirect('premium');
		}
		// Check if the clicked element is a profile box or traveller card
		else if (target.is('.inf_profile_box , h5#traveller-card_name, .traveller_pfp')) redirect('profile', target.attr('data-user-id'));
		// Check if the clicked element is a shots redirect
		else if (target.is('.shots_redirect')) jQuery('#tb__reels').click();
		// Check if the clicked element is a shots slide
		else if (target.is('.shots-slide')) fetchPosts({ feedsType: 'SINGLE SHOT', postId: target.attr('data-id') }, '', 'singleShot');
		// Check if the clicked element is a trending location card
		else if (target.is('.trending_location_indvcard')) {
			// Get the interest ID and name
			id = target.attr('data-interest-id'), interest = target.attr('data-interest');
			// Get the user's location
			latitude = localStorage.getItem('userLat') || 0, longitude = localStorage.getItem('userLong') || 0;
			// Redirect to the trending interests page
			redirect('trending_interests', { title: interest + ' - Trending Interests', payload: { interest: interest, id: id, latitude: latitude, longitude: longitude, feedsType: 'TRENDING INTERESTS' } });
		} 
		// Check if the clicked element is the see all redirect
		else if (target.is('#see_all_redirect')) redirect('allInfluencers');
		// Check if the clicked element is a profile icon
		else if (target.is('.profile-icon-left')) redirect('profile', target.parents('.listing--card').attr('data-userId'));
		// Check if the clicked element is a listing card image or description
		else if (target.is('.listing-card-image, .listing-desc')) redirect('singleService', target.is('.listing-card-image') ? target.attr('data-listingId') : target.parents('.listing--card').find('.listing-card-image').attr('data-listingId'));
		// Check if the clicked element is the see all listing
		else if (target.is('#see_all_listing')) {
			// Destroy all secondary tabs
			destroyAllSecondaryTabs();
			// Simulate a click on the flights and hotels menu item
			jQuery('.desktopMenu-fligtsHotels.desktopMenu-item').click();
		}
	});
}

function feedLoginActions() {
	//Open Login on click of the login button
	jQuery(document).on('click', '.feed__login-login', function () {
		redirect('login');
	});

	//Open the app store on click of the install our app button
	jQuery(document).on('click', '.feed__login-install', function () {
		redirect('app');
	});
}

function manageLikes(source, postId, element) {
	console.log(source);

	liked = jQuery(element).attr('data-liked');

	if (source == 'Interested') {
        if (liked == 'true') {
            liked = false;
            payload = {
                userId: manageUserProfile('read', 'userId'),
                postId: postId
            };
        }
        else {
            liked = true;
            payload = {
                userId: manageUserProfile('read', 'userId'),
                postId: postId,
                isLiked: liked,
            };
        }
        console.log(payload);
        jsInit('lfbCheck', payload, element);
    }
	else if (source == 'Shots') {
		console.log(jQuery(element).attr('data-liked'));
		if (jQuery(element).attr('data-liked').includes('false') || jQuery(element).attr('data-liked') == '') {
			console.log('Liked Shots');
			likes_item = jQuery(element).parents('.shots__item').find('li.shots__like span');
			likes = jQuery(likes_item).html();
			jQuery(element).html(icons.heart_active);
			likes = parseInt(likes) + 1;
			jQuery(element).append('<span class="count" data-count="' + likes + '">' + likes + '</span>');
			liked = true;
			console.log(jQuery('div.shots__item').attr('data-user'));
			
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_TRAVEL_SHOTS_EVENT', JSON.stringify({
			// 		"postId": parseInt(jQuery('div.shots__item').attr('data-post')), // string value
			// 		"postUserId": jQuery('div.shots__item').attr('data-user'), // numeric value
			// 		"interactionType": 'like', // numeric value
			// 	}));
			// }
		}
		else {
			console.log('Un-Like Shots');
			likes_item = jQuery(element).parents('.shots__item').find('li.shots__like span');
			likes = jQuery(likes_item).html();
			jQuery(element).html(icons.heart);
			likes = parseInt(likes) - 1;
			jQuery(element).append('<span class="count" data-count="' + likes + '">' + likes + '</span>');
			liked = false;
		}

		jsInit(
			'likeShot',
			{
				userId: manageUserProfile('read', 'userId'),
				postId: postId,
				isLiked: Boolean(liked),
			},
			element);

	}
	else if (source == 'likedShot') {
		jQuery(element).attr('data-liked', postId.request.isLiked);
	}
	else {
		likes_item = jQuery(element).parents('.feed_item').find('.feed__actions-likes');
		likes = jQuery(likes_item).attr('data-likes');

		if (liked == '' && (source == 'Double Click' || source == 'Btn')) {
			jQuery(element).html(icons.heart_active);
			jQuery(element).attr('data-liked', 'liked');
			likes = parseInt(likes) + 1;
			liked = true;
			if (jQuery(element).parents('#main__feed').find('.feed__body .truncate').text().length > 100) {
				desc = jQuery(element).parents('#main__feed').find('.feed__body .truncate').text().substring(0, 99);
			}
			else {
				desc = jQuery(element).parents('#main__feed').find('.feed__body .truncate').text();
			}
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_FEED_POST_LIKE_EVENT', JSON.stringify({
			// 		'isLiked': true,
			// 		'postUserId': jQuery(element).parents('#main__feed').find('.feed_item').attr('data-user'),
			// 		'postId': jQuery(element).parents('#main__feed').find('.feed_item').attr('data-id'),
			// 		'description': desc,
			// 		'postType': jQuery(element).parents('#main__feed').find('.feed_item').attr('data-post-type'),
			// 	}));
			// }
		}
		else if (liked == 'liked' && source !== 'Double Click') {
			jQuery(element).html(icons.heart);
			jQuery(element).attr('data-liked', '');
			likes = parseInt(likes) - 1;
			liked = '';
		}

		//Send the unlike to the server - API is the same
		jQuery(likes_item)
			.attr('data-likes', likes)
			.html('+' + likes);
	}

	if (source == 'Double Click' || source == 'Btn' && liked !== '') {
		console.log('api');
		console.log(liked);
		jsInit(
			'likePost',
			{
				userId: manageUserProfile('read', 'userId'),
				postId: postId,
				isLiked: Boolean(liked),
			},
			element
		);
	}

	if (source == 'likedPost') {
		console.log(postId);
		console.log(postId.responseCode);
		//console.log(liked);

		if (postId.responseCode == '200') {
            console.log('postId.responseCode');
            if (jQuery(element).hasClass('interested')) {
                jQuery(element).html(icons.heart);
                jQuery(element).removeClass('interested');
                jQuery(element).attr('data-liked', false);
                // Decrease the counter by 1 only if its greater than 0
                feedItem = jQuery(element).parents('.feed_item');
                interestsSpan = feedItem.find('.feed__body-interests span');
                interests = feedItem.find('.feed__body-interests');
                if (interestsSpan.html() > 1) {
                    interestsSpan.html(parseInt(interestsSpan.html()) - 1);
                }
                else if (interestsSpan.html() == 1) {
                    interestsSpan.html(parseInt(interestsSpan.html()) - 1);
                    interests.hide();
                }
            }
            else {
                jQuery(element).html(icons.heart_active);
                jQuery(element).addClass('interested');
                jQuery(element).attr('data-liked', true);
                jQuery(element).parents('.feed_item').find('.feed__body-interests').show();
                jQuery(element).parents('.feed_item').find('.feed__body-interests span').html(parseInt(jQuery(element).parents('.feed_item').find('.feed__body-interests span').html()) + 1);
				
            }
        }
		/*else if (postId.responseCode == '202') {
			jQuery(element).html(icons.heart);
			jQuery(element).removeClass('interested');
			toast('You Need to Purchase premium');
			redirect('premium');

			loaderMain('secondary', false);
			destroyAllSecondaryTabs();
		}*/
		else if (postId.responseCode == 403) {
			// Update the counter ( either increment or decrement)
			console.log(postId.responseCode);

		}

	}
	if (source == 'likedShot') {
		jQuery(element).attr('data-liked', postId.request.isLiked);
	}
}

function tabActions() {
	//Tab Item Click
	jQuery(document).on('click', '.tab__item', function () {
        
        jQuery('body').prepend('<div class="global__loading" ><div class="feed__loading" id="lottie__loading" style="width: 100%; height: 250px;"></div><div class="hold__horses"></div></div>');

        lottie.loadAnimation({
            container: document.getElementById('lottie__loading'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/view/assets/img/loader_lightMode.json'
        });
        // get the active tab
        activeTab = jQuery('.tab__item.active').attr('data-tab');
		if (activeTab) {
			switch (activeTab) {
				case 'meetups':
					tabHtmlContents.meetupsTabHtml = jQuery(('#'+ activeTab)).html();
					break;
				case 'find':   
					tabHtmlContents.findTabHtml = jQuery('#'+ activeTab).html();
					break;
				case 'local':
					tabHtmlContents.localTabHtml = jQuery('#'+ activeTab).html();
					break;
				case 'influencers':
					tabHtmlContents.influencersTabHtml = jQuery('#'+ activeTab).html();
					break;
				case 'trending':
					tabHtmlContents.trendingTabHtml = jQuery('#'+ activeTab).html();
					break;
				case 'following':
					tabHtmlContents.followingTabHtml = jQuery('#'+ activeTab).html();
					break;
			}
		}
                        
        
        jQuery('#meetups, #local, #influencers, #trending, #following').empty();
		loaded =  jQuery(this).attr('data-loaded'); //false ;
		tab = jQuery(this);

		if (loaded == 'true') {
			manageTabs(tab, activeTab);
            communityPagination();
            loaderMain('global', false);
		}
		else {
			//Remove the active class from all the tabs & add it to the selected one
			manageTabs(tab, activeTab);

			if (jQuery(this).attr('data-tab') !== 'services') {
				//Fetch the posts for the selected tab
				userLatLong = getLatLongfromStorage();
				fetchPosts({ feedsType: jQuery(this).attr('data-id'), locationLat: userLatLong['latitude'], locationLong: userLatLong['longitude'], pageNumber: jQuery(this).attr('data-page') }, jQuery(this).attr('data-tab'));
			}
			else {
				redirect('getAllServices');
			}

			//Add the loading animation svg to the feed
			//loaderMain('feed', true);
		}
		//Pause all the videos
		videoManager('pauseAll');
	});

	function manageTabs(tab, activeTab) {
        jQuery('.tab__item').removeClass('active').filter(tab).addClass('active').attr('data-loaded', 'true');
        tabName = jQuery(tab).attr('data-tab');
        jQuery('#' + activeTab).empty();
        jQuery('#' + tabName).html(tabHtmlContents[tabName + 'TabHtml']);
        feedLogin = renderFeedLogin();
        jQuery('#' + tabName).append('<div id="main__feed-first">' + feedLogin + '</div>');
        if (!['meetups', 'find'].includes(tabName)) {
            window.history.pushState({html: jQuery('.feed__box.tab__' + tabName).html()}, '', '#' + tabName);
        }
    }
}

function searchActions() {
	jQuery(document).on('click', '.search__sug-item', function () {
		if (!guestMaster()) {
			dataType = jQuery(this).attr('data-type');
			value = jQuery(this).attr('data-value');
			if (dataType == 'location') {
				payload = { location: value, feedsType: 'LOCATION', postLat: jQuery(this).attr('data-lat'), postLong: jQuery(this).attr('data-lng') };
				redirect(dataType, payload);
			}
			else {
				redirect(dataType, value);
			}
		}
		else {
			redirect('login');
		}
    });

	//Switch Search Tabs
	jQuery(document).on('click', '.search__headers ul li', function (e) {
		jQuery('.search__headers ul li').removeClass('active');
		jQuery(this).addClass('active');
		searchTrigger(jQuery('.search__box input').val());
        jQuery('.search__body').attr('data-page', 0);
	});

	//Close Search
	jQuery(document).on('click', '.search__close', function () {
		jQuery('.search__box input').val('');
		hideResults(fetchIcons());
	});

	//Limit the search box to only logged in users
	// jQuery(document).on('click', '.search__box input', function () {
	// 	guestMaster();
	// });

	jQuery(document).on('keyup', '.search__box input', function () {
        clearTimeout(timeout);

		timeout = setTimeout(() => {
			value = jQuery(this).val();
			searchTrigger(value);
		}, 500); // 500ms delay before the search function is called
	});

	jQuery(document).on('click', '.search__item .search__item-left', function () {
		if (!guestMaster()) {
			searchType = jQuery(this).parents('.search__item').attr('data-type');
			value = jQuery(this).parents('.search__item').attr('data-value');
			eventName = 'TBD_SEARCH_EVENT';
			eventPayload = {
				'searchType': searchType,
				'searchLocationName': jQuery(this).parents('.search__item').find('.search__item-title').text(),
			};
			if (searchType != 'searchBuddy' && searchType != 'searchFindBuddy' && searchType != 'searchBuddyFollowers') {
				payload = { location: value, feedsType: 'LOCATION', postLat: jQuery(this).parents('.search__item').attr('data-lat'), postLong: jQuery(this).parents('.search__item').attr('data-lng') };
				redirect(searchType, payload);
			}
			else {
				redirect(searchType, value);
			}
		}
		else {
			redirect('login');
		}
	});

	jQuery(document).on('click', '.search__item-follow', function () {
		if (!guestMaster()) {
			jQuery(this).addClass('disabled-link').html(icons.loader);
			payload = { button: this, uniqueUserId: jQuery(this).parents('.search__item').attr('data-uniqueid') };
			jsInit('followUser', { userId: jQuery(this).parents('.search__item').attr('data-value') }, payload);
		}
		else {
			redirect('login');
		}
	});

	jQuery(document).on('click', '.search__sug-item__recent-remove', function (e) {
		e.stopPropagation();
		jQuery(this).parents('.search__sug-item__recent .search__sug-body .search__sug-item').remove();
	});

	jQuery(document).on('click', '#main__search-box .search__filter', function () {
		redirect('filter');
	});
}
function searchTrigger(value) {
	if (value.length > 2) {
		jQuery('.search__box input').val(value);
		jQuery('.search__results-box').show();
		jQuery('.search__suggestions-box').hide();
		jQuery('.search__box input').parents('#main__search-box').addClass('results');
		jQuery('.search__box button').addClass('search__close').html(icons.close);

		activeTab = jQuery('.search__headers ul li.active').attr('data-id');
		searchParams = { searchPattern: value, limit: 10 };
		if (activeTab == 'locations') {
			jsInit('searchLocation', searchParams, activeTab);
		} 
		else if (activeTab == 'buddies') {
            // Here limit is the pageNumber , i.e limit = pageNumber
			jsInit('searchBuddy', { searchPattern: value, limit: 0 });
            jQuery('.search__body').attr('data-page', 0);
		} 
		else if (activeTab == 'hashtags') {
			jsInit('searchHashtag', { ...searchParams, pageNumber: 0 });
		} 
		else if (activeTab == 'find') {
			jsInit('searchFindBuddy', searchParams, activeTab);
		} 
		else if (activeTab == 'experiences') {
			jsInit('getExperiences', { filter: { location: value } }, 'searchPageExperiences');
		}
	} 
	else {
		hideResults(icons);
	}
}

function hideResults(icons) {
	jQuery('.search__results-box').hide();
	jQuery('.search__suggestions-box').show();
	jQuery('#main__search-box').removeClass('results');
	jQuery('.search__box button').removeClass('search__close').html(icons.searchBar);
}

function profileActions() {
	//Share Post Open
	jQuery(document).on('click', '.profile__tab-share ul li', function () {
		// Check if this has class no__show
		if (jQuery(this).hasClass('no__show')) {
			toast('Please switch to iOS or MacOS for better experience.');
			return;
		}
		redirect('post', jQuery(this).attr('data-item'));
	});

	//Render Followers
	jQuery(document).on('click', '.profile__followers, .profile__followings', function () {
		tab = jQuery(this).attr('data-tab');

		if (tab == 'followers') {
			type = '0';
		}
		else if (tab == 'following') {
			type = '1';
		}

		toPass = {
			element: jQuery(this),
			tab: tab,
		};

		if (jQuery('.followers__items').children().length > 0) {
			renderFollowersView('open', '', toPass);
		}
		else {
			renderFollowersView('init', '', toPass);
			/*jsInit(
				'fetchFollowers',
				{
					userId: jQuery('#main .profile__page').attr('data-user'),//jQuery(this).parents('.profile__page').attr('data-user'),
					pageNumber: 0,
					type: type,
				},
				tab
			);*/
		}
	});

	//Search Followers
	jQuery(document).on('keyup', '.followers__search input', function () {
		tab = jQuery(this).parents('.followers__tab-item').attr('data-tab');

		if (tab == 'followers') {
			type = '0';
		}
		else if (tab == 'following') {
			type = '1';
		}

		if (jQuery(this).val().length > 2) {
			jsInit(
				'fetchFollowers',
				{
					userId: manageUserProfile('read', 'userId'),
					pageNumber: 0,
					type: type,
					userName: jQuery(this).val(),
				},
				'search'
			);
		}
		else {
			jsInit(
				'fetchFollowers',
				{
					userId: manageUserProfile('read', 'userId'),
					pageNumber: 0,
					type: type,
				},
				'search'
			);
		}
	});

	//Followers Pagination
	jQuery(document).on('click', '.followers__load-more', function () {
		tab = jQuery(this).parents('.followers__tab-item').attr('data-tab');
		if (Number(jQuery(this).attr('data-pageNumber')) < Number(jQuery(this).attr('data-totalPages'))) {
			if (tab == 'followers') {
				type = '0';
			}
			else if (tab == 'following') {
				type = '1';
			}

			//Remove the load more button & then fetch and render the next page. Replace the button with a loader
			userIdStr = jQuery('#secondary .profile__page').attr('data-user');
			if (!userIdStr) {
				userIdStr = jQuery('#main .profile__page').attr('data-user');
			}
			jQuery(this).remove();
			loaderMain('followers', true);
			jsInit(
				'fetchFollowers',
				{
					userId: userIdStr,
					pageNumber: jQuery(this).attr('data-pageNumber'),
					type: type,
				},
				tab
			);
		}
	});

	//Follower Tab Click
	jQuery(document).on('click', '.followers__tab_head ul li', function () {
		tab = jQuery(this).attr('data-tab');
		jQuery(this).addClass('active');
		jQuery(this).siblings().removeClass('active');
		jQuery('.followers__tab-item').hide();
		jQuery('.followers__tab-' + tab).show();

		//Load the followers data in the tab if not loaded
		if (tab == 'followers') {
			type = '0';
		}
		else if (tab == 'following') {
			type = '1';
		}
		userIdStr = jQuery('#secondary .profile__page').attr('data-user');
		if (!userIdStr) {
			userIdStr = jQuery('#main .profile__page').attr('data-user');
		}
		if (!jQuery('.followers__tab-' + tab + ' .followers__items').children().length > 0) {
			jsInit('fetchFollowers',
				{
					userId: userIdStr,
					pageNumber: 0,
					type: type,
				},
				tab
			);
		}
	});

	//Ratings Click
	jQuery(document).on('click', '.profile__ratings, .no__ratings', function () {
		if (jQuery(this).hasClass('no__ratings')) {
			redirect('rateNow__box', jQuery(this));
		}
		else {
			redirect('ratings', jQuery(this));
		}
	});

	//Rating User Redirect
	jQuery(document).on('click', '.rating__title-name, .rating__title-img img', function () {
		redirect('profile', jQuery(this).parents('.ratings__item').attr('data-user'));
	});

	//Open the Rate Now Box
	jQuery(document).on('click', '.rate__now', function () {
		console.log('rate now');
		renderRatingsView('render rateNow');
	});

	//Close the Rate Now Box
	jQuery(document).on('click', '.popup__bg', function () {
		jQuery(this).parents('.rateNow__popup').fadeOut(200);
	});

	//Close the box via the close button
	jQuery(document).on('click', 'form#rateNow .form_row.form_submit button[type="cancel"]', function (e) {
		e.preventDefault();
		jQuery(this).parents('.rateNow__popup').fadeOut(200);
	});

	//Rate Now Submit
	jQuery(document).on('click', 'form#rateNow .form_row.form_submit button[type="submit"]', function (e) {
		e.preventDefault();
		if (!guestMaster()) {
			console.log('rate now submit');

			//Get the form data
			formData = jQuery(this).parents('form').serializeArray();

			if (window.location.href.includes('experiences')) {
				data = {
					experience_id: jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page').attr('data-userid'),
					rating: formData[0]['value'],
					review: formData[1]['value'],
				};
				console.log('Experience', formData, data);

				jsInit('addExperienceRating', data);

			}
			else {
				data = {
					userId: jQuery('#secondary .secondary__tab:last-child .drawerBody .ratings__page').attr('data-userid'),
					rating: formData[0]['value'],
					review: formData[1]['value'],
				};
				console.log('Profile', formData, data);
				jsInit('rateUser', data);

			}
		}
	});

	//Count the rateNow text area characters
	jQuery(document).on('keyup', 'form#rateNow textarea', function () {
		val = jQuery(this).val();
		jQuery(this)
			.next('.character_count')
			.html(val.length + '/500 Characters')
			.attr('data-count', val.length);
	});

	//About Read More
	jQuery(document).on('click', '.readMore', function () {
		readMore(jQuery(this));
	});

	//Profile Completeness Popup
	jQuery(document).on('click', '.profile__completeness-cta', function () {
		if (!guestMaster()) {
			managePopups('show', 'profileCompleteness');
		}
	});

	//Profile Views Popup
	jQuery(document).on('click', '.profile__views', function () {
		if (!guestMaster()) {
			loaderMain('profileViews', true);
			managePopups('show', 'profileViews');
			jsInit('fetchProfileViews', { pageNumber: 0 });
		}
	});

	//Go Premium Click
	jQuery(document).on('click', '.profileViews__cta', function () {
		redirect('premium');
	});

	//Share, Find, Ask Tab Clicks
	jQuery(document).on('click', '.profile__posts-tab__head ul li', function () {
		tab = jQuery(this).attr('data-tab');

		jQuery('.profile__posts-tab-item').each(function () {
			jQuery(this).removeClass('active');
		});
		jQuery('.profile__posts-tab__head ul li').each(function () {
			jQuery(this).removeClass('active');
		});

		jQuery(this).addClass('active');
		jQuery('.profile__posts-tab-item.profile__tab-' + tab).addClass('active');
	});

	jQuery('.profile__page').each(function () {
		jQuery(this).scroll(function () {
			if (jQuery(this).scrollTop() > 50) {
				jQuery(this).find('.profile__head').addClass('fixed');
			} else {
				jQuery(this).find('.profile__head').removeClass('fixed');
			}
		});
	});

	jQuery(document).on('click', '.profile__find-card, .profile__ask-card, .profile__find-grid-item', function () {
		redirect('post', jQuery(this).attr('data-postId'));
	});

	//Profile Location Click
	jQuery(document).on('click', '.profile__location', function () {
		redirect('location', jQuery(this).html());
	});

	//Bucket List Click
	jQuery(document).on('click', '.profile__head-bucketList', function () {
		redirect('bucketList', 'bucketList');
	});

	//Edit Profile  Click
	jQuery(document).on('click', '.profile__head-edit', function () {
		console.log('Edit');
		redirect('editProfile');
		jsInit('fetchCountries', '', 'editProfile');
	});

	//Profile View Search
	jQuery(document).on('keyup', '#profileViews__search', function () {
		if (jQuery(this).val().length > 2) {
			jsInit('fetchProfileViews', {
				pageNumber: 0,
				userName: jQuery(this).val(),
			});
		} else {
			jsInit('fetchProfileViews', { pageNumber: 0 });
		}
	});

	//Profile Picture Popup
	jQuery(document).on('click', '.profile__photo img, .chat_message-media img', function () {
		if (jQuery(this).hasClass('.profile__photo')) {
			jQuery(this).find('.profile__modal').fadeIn(200);
		}
		else {
			jQuery(this).parents('.profile__title-first').find('.profile__modal').fadeIn(200);
		}
	});

	//Close the Profile Picture Popup
	jQuery(document).on('click', '.profile__modal-mask', function () {
		jQuery(this).parents('.profile__modal').fadeOut(200);
	});

	//Profile Login Button Click
	jQuery(document).on('click', '.profile__login', function () {
		redirect('login', 'login');
	});

	//Open Profile Interests
	jQuery(document).on('click', '.profile__intererssts, .profile__trips, .profile__social', function () {
		console.log('profile interests');
		if (jQuery(this).hasClass('profile__intererssts')) {
			what = 'interests';
		}
		else if (jQuery(this).hasClass('profile__trips')) {
			what = 'trips';
		}
		else if (jQuery(this).hasClass('profile__social')) {
			what = 'social';
		}

		selfProfile = jQuery(this).parents('.profile__page').attr('data-selfProfile');
		redirect('profileInterests', { what: what, selfProfile: selfProfile });
	});

	//Tab switch between Interests, Trips and Social
	jQuery(document).on('click', '.profileInterests__tab', function () {
		tab = jQuery(this).attr('data-tab');
		jQuery('.profileInterests__tab').each(function () {
			jQuery(this).removeClass('active');
		});

		jQuery(this).addClass('active');

		jQuery('.profileInterests__tab-item').removeClass('active');
		jQuery('.profileInterests__tab-item__' + tab).addClass('active');
	});

	jQuery(document).on('click', '.profile__cover .swiper-slide', function () {
		console.log('profile__cover');
		img = jQuery(this).find('img').attr('src');
		jQuery(this).parents('.profile__page').find('.profileCover__zoomIn-img').html('<img src="' + img + '" />');
		jQuery(this).parents('.profile__page').find('.profileCover__zoomIn').fadeIn();
	});

	//Close Image Popup
	jQuery(document).on('click', '.profileCover__zoomIn-overlay', function () {
		jQuery(this).parents('.profile__page').find('.profileCover__zoomIn').fadeOut();
		jQuery(this).parents('.profile__page').find('.profileCover__zoomIn-img').empty();
	});

	function readMore(where) {
		state = jQuery(where).attr('data-state');

		if (state == 'true') {
			jQuery(where).prev('pre').removeClass('truncate');
			jQuery(where).attr('data-state', 'false');
			jQuery(where).text('Read Less');
		}
		else {
			jQuery(where).prev('pre').addClass('truncate');
			jQuery(where).attr('data-state', 'true');
			jQuery(where).text('Read More');
		}
	}

	// Follow Buttton Top right corner
	jQuery(document).on('click', '.profile__follow', function () {
		if (!guestMaster()) {
			payload = { button: this, uniqueUserId: jQuery(this).parents('.profile__page').attr('data-uniqueid') };
			jsInit('follow', { "pageNumber": 0, "requestType": 0, "totalItems": 0, "type": 0, "userId": jQuery('#secondary .profile__page').attr('data-user') }, payload);
		} else {
			redirect('login');
		}
	});

	jQuery(document).on('click', '.profile__head-chat', function () {
		// createDeepLink('profile', jQuery(this).parents('.profile__page').attr('data-user'), jQuery(this).parents('.profile__page').attr('data-profileImage'));
		if (window.location.href.includes('beatravelbuddy.com') || window.location.href.includes('localhost') || isIOS() || isAndroid()) {
			if (!guestMaster('noLogin')) {
				postId = jQuery(this).parents('.profile__page').attr('data-user');
				postType = 'profile';
				renderChatSend('invoke', { postId: postId, postType: postType, image: jQuery(this).parents('.profile__page').attr('data-profileimage') });
			}
		}
	});

	//Copy User ID Button (Admin only)
	jQuery(document).on('click', '.admin__copy-userid-btn', function() {
		var userId = jQuery(this).attr('data-userid');
		if (userId) {
			window.focus();
			navigator.clipboard.writeText(userId);
			toast('User ID Copied');
		}
	});
}

function profileScrollCheck() {
	jQuery('.secondary__tab').each(function () {
		jQuery(this).scroll(function () {
			if (jQuery(this).scrollTop() > 50) {
				jQuery(this).find('.profile__head').addClass('fixed');
			}
			else {
				jQuery(this).find('.profile__head').removeClass('fixed');
			}
		});
	});
}

/*function shotsActions() {
	//Open Shots
	jQuery(document).on('click', '#tb__reels, .desktopMenu-shots', function (e) {

		//androidCodesForUpdated(); // MoEngage For Android
		//setUserDataWeb(); // Moengage for Web
		// We have shifted from Shots to Find Buddy at 16th Feb,2024. To get a backup refer GitHub.
		jQuery('#footer ul li[data-item="addPost"]').click();

	});

	//Close Shots for Desktop and remove the body class shots__open to show the sidebar
	jQuery(document).on('click', '.desktopMenu-item, .shots__back', function () {
		if (!jQuery(this).hasClass('desktopMenu-shots')) {
			jQuery('body').removeClass('shots__open');
			//manageShots('close');
		}
	});

	//Close Shots
	jQuery(document).on('click', '#main__shots-box .shots__back svg', function () {
		//manageShots('close');
	});

	//Open AddPost
	jQuery(document).on('click', '.shots__addPost svg', function () {
		if (!guestMaster()) {
			jQuery('#main__shots-box .shots__back svg').click();
			jQuery('#footer ul li[data-item="addPost"]').click();
			jQuery('.addPost__tabs .addPost__tab-item:first-child').click();
		}
	});

	//Play/Pause Shots based overlay click
	jQuery(document).on('click', '.shots__video-overlay', function () {
		//manageShots('muteUnmute', jQuery(this).parents('.shots__item').find('.shots__video-overlay'));
	});

	//Mute/Unmute Shots
	jQuery(document).on('click', '.shots_volume', function () {
		//manageShots('muteUnmute', jQuery(this).parents('.shots__item').find('.shots__video-overlay'));
	});

	//Press and hold to pause the video - Mobile
	jQuery(document).on('touchstart', '.shots__video-overlay', function () {
		//manageShots('playPause', jQuery(this));
	});

	jQuery(document).on('touchend', '.shots__video-overlay', function () {
		//manageShots('playPause', jQuery(this));
	});

	//Open user profile on click of the user image
	jQuery(document).on('click', '.shots__user-img, .shots__user-name-text', function () {
		redirect('profile', jQuery(this).parents('.shots__item').attr('data-user'));
	});

	//Open the location on click of the location text
	jQuery(document).on('click', '.shots__user-name-location', function () {
		redirect('location', jQuery(this).html());
	});

	//Open the comments drawer on click of the comments icon
	jQuery(document).on('click', '.shots__comment svg', function () {
		renderComments('init', {
			postId: jQuery(this).parents('.shots__item').attr('data-post'),
			commentFetchType: 1,
			mediaId: 0,
			commentId: 0,
		});
	});

	//Like/Unlike the post - Like Button Click
	jQuery(document).on('click', '.shots__like', function () {
		if (!guestMaster()) {
			console.log('Like Button');
			manageLikes('Shots', jQuery(this).parents('.shots__item').attr('data-post'), jQuery(this));
		}
	});

	//Like/Unlike the post - Double Tap
	jQuery(document).on('dblclick', '.shots__video-overlay', function () {
		if (!guestMaster()) {
			manageLikes('Shots', jQuery(this).parents('.shots__item').attr('data-post'), jQuery(this).parents('.shots__item').find('.shots__like'));
		}
	});

	//Open the description on click of the description text
	jQuery(document).on('click', '.shots__user-description', function () {
		jQuery(this).toggleClass('truncate');
	});

	//Follow Button
	jQuery(document).on('click', '.shots__user-right', function () {
		payload = { button: this, uniqueUserId: jQuery(this).parents('.shots__item.swiper-slide.swiper-slide-active').attr('data-uniqueid') };
		if (jQuery(this).find('.shots__follow-text').text().length == 6) {


			jsInit('followUser', { userId: jQuery('.shots__item.swiper-slide.swiper-slide-active').data('user') }, payload);

			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_FOLLOW_SOMEONE', JSON.stringify({
			// 		"followerId": jQuery(this).parents('div.shots__item').attr('data-user'),
			// 		"followerName": jQuery(this).parents('.shots__bottom .shots__user').find('.shots__user-name-text').text(),
			// 		"followButtonLocation": 'Travel Shots',
			// 	}));
			// }
		}
		else {
			jsInit('followUser', { userId: jQuery('.shots__item.swiper-slide.swiper-slide-active').data('user') }, payload);
		}
	});

	// Send Shots to Chats
	jQuery(document).on('click', '.shots__share', function () {
		userId = jQuery(this).parents('.shots__item').attr('data-user');

		console.log(userId);
		console.log(jQuery(this).parents('.shots__item').find('.shots__user-name-text').text());
		console.log(jQuery('.shots__user-img img').attr('src'));

		var data = {
			userId: userId,
			userDp: jQuery('.shots__user-img img').attr('src'),
			userName: jQuery(this).parents('.shots__item').find('.shots__user-name-text').text()
		}

		redirect('chat', data);
	});

	// Shots Bookmark Button Click
	jQuery(document).on('click', '.shots__bookmark', function () {
		if (!guestMaster()) {
			console.log(jQuery(this).parents('#main__shots-box').find('.swiper-slide-active').attr('data-post'));
			bookmarkPost(jQuery(this).parents('#main__shots-box').find('.swiper-slide-active').attr('data-post'), jQuery(this).attr('data-bookmarked'));
			if (jQuery(this).attr('data-bookmarked') == 'bookmarked') {
				jQuery(this).attr('data-bookmarked', '');
				jQuery(this).html(icons.bookmark).removeClass('active');
			}
			else {
				jQuery(this).attr('data-bookmarked', 'bookmarked');
				jQuery(this).html(icons.bookmark_active).addClass('active');
				
				// if (isAndroid()) {
				// 	Android.moEngageData('TBD_TRAVEL_SHOTS_EVENT', JSON.stringify({
				// 		"postId": parseInt(jQuery('.single__experience-page').attr('data-id')),
				// 		"postUserId": parseInt(jQuery('div.shots__item').attr('data-post')),
				// 		"interactionType": 'Bookmark',
				// 	}));
				// }
			}
		}
	});

	//Open Small Menu
	jQuery(document).on('click', '.shots__more', function () {
		//jQuery(this).find('.options__menu').toggle();
		console.log('Open Menu');
	});

}

function //manageShots(action, where, extra) {
	if (action == 'playPause') {
		if (jQuery(where).parents('.shots__video').hasClass('playing')) {
			jQuery(where).parents('.shots__video').removeClass('playing');
			jQuery(where).parents('.shots__video').find('video')[0].pause();
		}
		else {
			jQuery(where).parents('.shots__video').addClass('playing');
			jQuery(where).parents('.shots__video').find('video')[0].play();
		}
	}
	else if (action == 'pause') {
		if (jQuery(where).parents('.shots__video').hasClass('playing')) {
			jQuery(where).parents('.shots__video').removeClass('playing');
			jQuery(where).parents('.shots__video').find('video')[0].pause();
		}
	}
	else if (action == 'play') {
		if (!jQuery(where).parents('.shots__video').hasClass('playing')) {
			jQuery(where).parents('.shots__video').addClass('playing');
			jQuery(where).parents('.shots__video').find('video')[0].play();
		}
	}
	else if (action == 'muteUnmute') {
		if (jQuery(where).parents('.shots__video').hasClass('playing')) {
			if (jQuery(where).parents('.shots__video').hasClass('muted')) {
				//Unmute every video
				jQuery('.shots__video').each(function () {
					jQuery(this).find('video')[0].muted = false;
					jQuery(this).removeClass('muted');
				});
				jQuery('.shots_volume').each(function () {
					jQuery(this).attr('data-state', 'unmute')
				});
			}
			else {
				//Mute every video
				jQuery('.shots__video').each(function () {
					jQuery(this).find('video')[0].muted = true;
					jQuery(this).addClass('muted');
				});
				jQuery('.shots_volume').each(function () {
					jQuery(this).attr('data-state', 'mute')
				});
			}
		}
		else {
			jQuery(where).parents('.shots__video').addClass('playing muted');
			//manageShots('muteUnmute', where);
		}


		// jQuery(where).parents('.shots__video').find('.shots__video-overlay').addClass('playing');
		// setTimeout(() => {
		//     jQuery(where).parents('.shots__video').find('.shots__video-overlay').removeClass('playing');
		// }, 1000);
	}
	else if (action == 'swiper') {
		currentShot = jQuery('.shots__video').eq(where.activeIndex);
		jQuery('.shots__video').each(function () {
			jQuery(this).find('video')[0].pause();
			jQuery(this).removeClass('playing');

			//Reset the video to the start
			jQuery(this).find('video')[0].currentTime = 0;

		});

		jQuery('.shots__video').eq(where.activeIndex).addClass('playing');
		if (currentShot.find('video').length) {
			currentShot.find('video')[0].play();
		}

		//Previous Shot
		if (where.activeIndex > 0) {
			prevShot = jQuery('.shots__video').eq(where.activeIndex - 1);

			if (prevShot.hasClass('muted')) {
				currentShot.find('video')[0].muted = true;
				currentShot.addClass('muted');
				currentShot.find('.shots_volume').each(function () {
					jQuery(this).attr('data-state', 'mute')
				});
			}
			else {
				currentShot.find('video')[0].muted = false;
				currentShot.removeClass('muted');
				currentShot.find('.shots_volume').each(function () {
					jQuery(this).attr('data-state', 'unmute')
				});
			}
		}

		renderShots('pagination', where, extra);
	}
	else if (action == 'clean') {
		jQuery('#main__shots-box .swiper-wrapper').html('');
	}
	else if (action == 'close') {
		jQuery('#main__shots-box').hide('slide', { direction: 'right' }, 300);
		jQuery('#main__shots-box').removeClass('active');
		//manageShots('clean');
	}

	function togglePlayButton() {

	}
}

async function loginActions() {
	//Switch from login to signup
	jQuery(document).on('click', '.login__switch-SignUp', function () {
		jQuery('.login__form-box').hide();
		jQuery('.signUp__form-box').show('slide', { direction: 'right' }, 300);
	});

	//Switch from signup to login
	jQuery(document).on('click', '.login__switch-Login', function () {
		jQuery('.signUp__form-box').hide();
		jQuery('.reset__view').hide();
		jQuery('.login__view').show();
		jQuery('.login__form-box').show('slide', { direction: 'left' }, 300);
	});

	//Switch from login to forgot password
	jQuery(document).on('click', '.login__forgotPassword', function () {
		jQuery('.login__view').hide();
		jQuery('.reset__view').show('slide', { direction: 'right' }, 300);
		jQuery('#resetPass__form').attr('data-state', 'forgot');
	});

	//Show / Hide the password
	jQuery(document).on('click', '.show-hide-password , .show_change-pass', function () {
		if (jQuery(this).hasClass('show')) {
			jQuery(this).removeClass('show');
			jQuery(this).parents('.form__row , .change_pass_box').find('input').attr('type', 'password');
			jQuery(this).find('svg').replaceWith(icons.passwordShow);
		}
		else {
			jQuery(this).addClass('show');
			jQuery(this).parents('.form__row , .change_pass_box').find('input').attr('type', 'text');
			jQuery(this).find('svg').replaceWith(icons.passwordHide);
		}
	});

	//Login form submit
	jQuery(document).on('submit', '#login__form', function (e) {
		e.preventDefault();

		grecaptcha.ready(function () {
			grecaptcha.execute('6LfoX5glAAAAAGTL-DkquTJVBWWMXoxU6qTHwUkM', { action: 'submit' }).then(function (token) {
				var email = jQuery('#login__email').val().toLowerCase();
				var password = jQuery('#login__password').val();

				if (email == '' || password == '') {
					jQuery('#login__email').addClass('error');
					jQuery('#login__password').addClass('error');
				}
				else {
					jQuery('#login__form').removeClass('error');
					jQuery('#login__password').removeClass('error');

					loaderMain('formSubmit', true);
					if (isAndroid() || isIOS()) {
						payload = { email: email, password: password, gToken: token, deviceId: manageNotificationToken('get'), deviceUniqueId: manageNotificationToken('vendorUUID') };
					}
					else {
						payload = { email: email, password: password, gToken: token, deviceId: manageNotificationToken('get') };
					}
					jsInit('login', payload);
				}
			});
		});
	});

	//Remove the error class on focus
	jQuery(document).on('keyup', '.login__form-box input.error', function () {
		jQuery(this).removeClass('error');
	});

	//Signup form submit - This one only checks if the fields are empty and unique ID. The rest is done after the OTP is verified.
	jQuery(document).on('submit', '#signUp__form', function (e) {
		e.preventDefault();

		grecaptcha.ready(function () {
			grecaptcha.execute('6LfoX5glAAAAAGTL-DkquTJVBWWMXoxU6qTHwUkM', { action: 'submit' }).then(function (token) {

				var name = jQuery('#signUp__name').val();
				var email = jQuery('#signUp__email').val().toLowerCase();
				var password = jQuery('#signUp__password').val();
				var phone = jQuery('#signUp__phone').val();
				var countryCode = jQuery('#signUp__countryCode').val();

				if (name == '' || email == '' || password == '' || phone == '' || countryCode == '') {
					if (name == '') {
						jQuery('#signUp__name').addClass('error');
					}
					if (email == '') {
						jQuery('#signUp__email').addClass('error');
					}
					if (password == '') {
						jQuery('#signUp__password').addClass('error');
					}
					if (phone == '') {
						jQuery('#signUp__phone').addClass('error');
					}
					if (countryCode == '') {
						jQuery('#signUp__countryCode').addClass('error');
					}

					toast('Please fill in all the fields to continue');
				}
				else {
					if (jQuery('#password-strength #passStrength').val() < 3) {
						jQuery('#signUp__form').addClass('error');
						jQuery('#signUp__password').addClass('error');
						// jQuery('.password__guide').slideToggle();
						toast('Please use a stronger password');
					}
					else {
						// jQuery('.password__guide').slideToggle();

						jQuery('#signUp__form').removeClass('error');
						jQuery('#signUp__password').removeClass('error');

						loaderMain('formSubmit', true);
						jsInit('uniqueCheck', { name: name, email: email, phoneNumber: phone, countryCode: countryCode, password: password, gender: 0, gToken: token, deviceId: manageNotificationToken('get') });
					}
				}
			});
		});

	});

	//CountryCode overlay on click open the select box
	jQuery(document).on('click', '.countryCodeOverlay', function () {
		console.log(jQuery('.countryCodeOverlay').parents('.form__phone').find('#signUp__countryCode').val());
		jQuery(this).parents('.form__phone').find('#signUp__countryCode').trigger('open');
	});

	//FAQ
	jQuery(document).on('click', '.signUp__form-box .form__row.form__terms p a', function () {
		if (jQuery(this).attr('value') == 'terms') {
			renderTerms();
		}
		else if (jQuery(this).attr('value') == 'privacy') {
			renderPrivacy();
		}
	});

	//Remove the error class on focus
	jQuery(document).on('keyup', '.login__view input.error, .otp__view input.error, .reset__view input.error', function () {
		jQuery(this).removeClass('error');
	});

	//Signup form show OTP verify form
	jQuery(document).on('click', '#signUp__form .verifyPhone', function (e) {
		e.preventDefault();

		//Check if the phone number is entered
		if (jQuery('#signUp__phone').val() !== '') {
			jQuery('.login__view').hide();
			jQuery('.otp__view').attr('data-state', 'signup');
			jQuery('.otp__view').show('slide', { direction: 'right' }, 300);
		}
	});

	//Reset Form submit - Includes both states forgot password and reset password
	jQuery(document).on('submit', '#resetPass__form', function (e) {
		e.preventDefault();
		state = jQuery(this).attr('data-state');
		email = jQuery('#resetPass__email').val().toLowerCase();

		if (email == '') {
			jQuery('#resetPass__email').addClass('error');
			toast('Please enter your email address or phone number to continue');
		}
		else {
			if (state == 'forgot') {
				jQuery('#reset__form').removeClass('error');
				loaderMain('primary', true);
				jsInit('forgotPass', { email: email });
			}
			else if (state == 'reset') {
				var password = jQuery('#resetPass__password').val();
				var confirmPassword = jQuery('#resetPass__confirmPassword').val();

				if (password == '' || confirmPassword == '') {
					jQuery('#resetPass__password').addClass('error');
					jQuery('#resetPass__confirmPassword').addClass('error');

					toast('Please enter your new password and confirm it');
				}
				else if (password != confirmPassword) {
					jQuery('#resetPass__password').addClass('error');
					jQuery('#resetPass__confirmPassword').addClass('error');

					toast('Passwords do not match');
				}
				else {
					jQuery('#resetPass__form').removeClass('error');
					jQuery('#resetPass__confirmPassword').removeClass('error');

					loaderMain('formSubmit', true);
					jsInit('resetPass', { email: email, password: password });
				}
			}
		}
	});

	//Edit Forgot Pass Email
	jQuery(document).on('click', '.otp__email-edit', function () {
		jQuery('.otp__view').hide();
		jQuery('.reset__view').show('slide', { direction: 'right' }, 300);
	});

	//Trigger the iOS google login function
	jQuery(document).on('click', '.login__social__button--google', function () {
		if (isAndroid()) {
			Android.loginGoogle();
		}
		else if (isIOS()) {
			window.webkit.messageHandlers.login.postMessage({ loginType: 'google' });
		}
	});

	//Trigger the iOS facebook login function
	jQuery(document).on('click', '.login__social__button--facebook', function () {
		if (isAndroid()) {
			Android.loginFacebook();
		}
		else if (isIOS()) {
			window.webkit.messageHandlers.login.postMessage({ loginType: 'facebook' });
		}
	});

	//Trigger the iOS apple login function
	jQuery(document).on('click', '.login__apple-ios', function () {
		window.webkit.messageHandlers.login.postMessage({ loginType: 'apple' });
	});
}

async function onboardingActions() {


	jQuery(document).on('click', '.cancel_onboarding', function (ctrl) {
		// ctrl.preventDefault();
		// renderPermissionBox('init', 'cancel-onBoarding');
		jQuery('.onboardingBody').remove();
		// Open Flights Page
		// Check if any main div is active
		if (!jQuery('#footer ul li').hasClass('active')) {
			jQuery('#footer ul li[data-item="profile"]').removeClass('active');
			jQuery('.desktopMenu-experiencesApp').click();
			jQuery('.experiencesToggle input[type="radio"][value="1"]').click();
			window.history.pushState({ page: "flights" }, "flights", "/flights");
			jQuery('.experiences__body-tab[data-tab="trips"]').click();
		}
		if (!isMobile()) {
			jQuery('#desktopContainer').css('display', 'block');
		}
	});

	//View More Button opens the interests list by adding the open class
	jQuery(document).on('click', '.form__checkbox-view__more', function () {
		jQuery(this).parents('.form__row').find('.checkbox__interests').toggleClass('open');
	});

	//On click of the interest checkbox, add the selected class to the parent
	jQuery(document).on('click', '.checkbox__interests .checkbox-item, .checkbox__interests .checkbox-item label', function (e) {
		e.preventDefault();

		//Limit to 5
		if (jQuery('.checkbox__interests .checkbox-item.checked').length >= 5 && !jQuery(this).hasClass('checked')) {
			toast('You can only select up to 5 interests.');
			return;
		}
		else {
			jQuery(this).toggleClass('checked');
			jQuery(this).parents('.checkbox-item').toggleClass('checked'); //This has to be done for the label on click

			//Trigger the checkbox
			jQuery(this).parents('.checkbox-item').find('input').trigger('click');
		}
	});

	//On click of the services checkbox, add the selected class to the parent
	jQuery(document).on('click', '.checkbox__services .checkbox-item, .checkbox__services .checkbox-item label', function (e) {
		e.preventDefault();

		//Limit to 3
		if (jQuery('.checkbox__services .checkbox-item.checked').length >= 3 && !jQuery(this).hasClass('checked')) {
			toast('You can select up to 3 services');
			return;
		}
		else {
			jQuery(this).toggleClass('checked');
			jQuery(this).parents('.checkbox-item').toggleClass('checked'); //This has to be done for the label on click

			//Trigger the checkbox
			jQuery(this).parents('.checkbox-item').find('input').trigger('click');
		}
	});

	//This is a radio button, so on click of the item, remove the selected class from all the other items
	jQuery(document).on('click', '.form__checkbox.checkbox__type .checkbox-item, .form__checkbox.checkbox__gender .checkbox-item', function () {
		if (!jQuery(this).hasClass('checked')) {
			jQuery(this).parents('.form__checkbox').find('.checkbox-item').each(function () {
				if (jQuery(this).hasClass('checked')) {
					jQuery(this).removeClass('checked');
				}
			});
			jQuery(this).addClass('checked');

			jQuery(this).parents('.form__checkbox').find('.checkbox-item').each(function () {
				jQuery(this).find('input').removeAttr('checked');
			});

			jQuery(this).find('input').attr('checked', true);

			if (jQuery(this).parent().hasClass('checkbox__type')) {
				if (jQuery(this).find('input').val() == 1) {
					jQuery('.form__row-services').slideDown();
				}
				else {
					jQuery('.form__row-services').slideUp();
				}
			}
		}
	});

	//Show the location drawer
	jQuery(document).on('click', '#onboarding__location', function () {
		jQuery(this).removeClass('error');
		renderOnboarding('location-init', '#onboarding__location');
	});

	//Remove the error class on focus
	jQuery(document).on('keyup', '.onboarding__form-box input.error', function () {
		jQuery(this).removeClass('error');
	});

	//Verify Phone Number
	jQuery(document).on('click', '#onboarding__form .verifyPhone.verify', function (e) {
		e.preventDefault();

		if (!jQuery('.verifyPhone').hasClass('verified')) {
			//Check if the phone number is entered
			if (jQuery('#onboarding__phone').val() !== '') {
				if (jQuery('#onboarding__form .verifyPhone svg').length == 0) {
					loaderMain('otp', true);
				}

				//Check if the country code is indian or international
				if (jQuery('#onboarding__countryCode').val() == '+91') {
					jsInit('profileSendOTP', {
						phoneNumber: jQuery('#onboarding__phone').val(),
						dialCode: jQuery('#onboarding__countryCode').val(),
					});
				}
				else {
					jsInit('isPhoneNumberUnique', {
						phoneNumber: jQuery('#onboarding__phone').val(),
						dialCode: jQuery('#onboarding__countryCode').val()
					})
				}
			}
			else {
				jQuery('#onboarding__phone').addClass('error');
				toast('Please enter your phone number to continue');
			}
		}
	});

	//Onboarding Form Submit
	jQuery(document).on('submit', '#onboarding__form', function (e) {
		console.log('Onboarding Form Submit');
		e.preventDefault();
		manageDisabledPieces(true);

		//Check if the phone number is verified
		if (!jQuery('.verifyPhone').hasClass('verified')) {
			jQuery('#onboarding__phone').addClass('error');
			toast('Please verify your phone number');
			return;
		}

		//Check if the name is entered'
		if (jQuery('#onboarding__name').val() == '') {
			jQuery('#onboarding__name').addClass('error');
			toast('Please enter your name');
			return;
		}

		//Check if the email is entered
		/*if (jQuery('#onboarding__email').val() == '') {
			jQuery('#onboarding__email').addClass('error');
			toast('Please enter your email');
			return;
		}*/

		//Check if the type is selected
		/*if (jQuery('.form__checkbox.checkbox__type .checkbox-item.checked').length == 0) {
			jQuery('.form__checkbox.checkbox__type .checkbox-item').addClass('error');
			toast('Please select your type');
			return;
		}

		//If Type is selected as travel provider then make sure that the services are selected
		if (jQuery('.form__checkbox.checkbox__type .checkbox-item.checked').find('input').val() == 1) {
			if (jQuery('.checkbox__services .checkbox-item.checked').length == 0) {
				jQuery('.checkbox__services .checkbox-item').addClass('error');
				toast('Please select the services you provide');
				return;
			}
		}

		//Check if the location is selected
		if (jQuery('#onboarding__location').val() == '') {
			jQuery('#onboarding__location').addClass('error');
			toast('Please select your location');
			return;
		}

		//Form Data into key value pairs
		formPiece = jQuery('#onboarding__form');
		formData = getFormData(formPiece);
		formData = manageInterestsServices(formData);

		loaderMain('global', true);
		console.log(formData);
		jsInit('updateOnboarding', { formData: formData });
		uploadDP(); //Profile Image Upload
		manageDisabledPieces(false);

		function manageDisabledPieces(state) {
			if (state) {
				jQuery('#onboarding__form input').each(function () {
					//Check if the input is not disabled
					if (jQuery(this).is(':disabled')) {
						jQuery(this).attr('data-disabled', true);
						jQuery(this).attr('disabled', false);
					}
				});
			}
			else {
				jQuery('#onboarding__form input').each(function () {
					//Check if the input is not disabled
					if (jQuery(this).attr('data-disabled')) {
						jQuery(this).attr('disabled', true);
						jQuery(this).removeAttr('data-disabled');
					}
				});
			}
		}
	});

	function uploadDP() {
		var files = jQuery('#onboarding__dp').get(0).files;
		console.log(files);

		if (files.length > 0) {
			var uploadData = new FormData();

			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				uploadData.append('uploaded_files', file, file.name);
			}

			//Also append the user id to the form data
			uploadData.append('data', manageUserProfile('read', 'userId'));

			//This is the Console Log Function to log images
			// for (var key of uploadData.entries()) {
			//     console.log(key[0] + ', ' + key[1]);
			// }

			jsUpload('uploadDP', uploadData);
		}
		else {
			localStorage.setItem('onboarding__complete', true);
		}
	}

	function manageInterestsServices(data) {
		interests = [];
		jQuery('.checkbox__interests .checkbox-item.checked').each(function () {
			interests.push({
				interest: jQuery(this).find('input').val(),
				selected: true,
			});
		});
		data.onboarding__interests = interests;

		services = [];
		jQuery('.checkbox__services .checkbox-item.checked').each(function () {
			services.push({ service: jQuery(this).find('input').val() });
		});
		data.onboarding__services = services;

		return data;
	}

	function getFormData($form) {
		var unindexed_array = $form.serializeArray();
		var indexed_array = {};

		jQuery.map(unindexed_array, function (n, i) {
			indexed_array[n['name']] = n['value'];
		});

		return indexed_array;
	}
}

function servicesAction() {
	jQuery(document).on('click', '.services__item', function (event) {
		var service_id = jQuery(this).attr('data-service-id');
		//console.log(service_id);

		redirect('singleService', service_id);
	});

	//Close the services search results
	jQuery(document).on('click', '.hide-services-results', function (event) {
		event.preventDefault();
		console.log('services hide search results');
		jQuery('#services__search input').val('');
		jQuery('.main__container_services').show();
		jQuery('.services__search').html('');
		jQuery('#services__search button').html(icons.searchBar).removeClass('hide-services-results');
	});

	//Open the services location drawer
	jQuery(document).on('click', '#services__search input', function () {
		renderLocations('init', '', '#services__search input');
	});

	//Prevent the form from submitting
	jQuery(document).on('sumbit', '#services__search', function (event) {
		event.preventDefault();
	});

	jQuery(document).on('click', '.services__booking-cta', function () {
		console.log(jQuery('.services__booking-cta').text().trim());

		if (jQuery('.services__booking-cta').text().trim() == 'Express Interest!') {
			console.log(parseInt(jQuery('.single__experience-page').attr('data-id')));
			jsInit('expressInterest', { listingId: parseInt(jQuery('.single__experience-page').attr('data-id')), });
			toast('Interest Expressed');
		}
		else {
			if (!guestMaster()) {
				userId = jQuery('.experience__head-host').attr('data-user');

				var data = {
					userId: userId,
					userDp: jQuery('.experience__head-host img').attr('src'),
					userName: jQuery('.hostedBy').text()
				}
				jQuery('.experience__back').click();
				redirect('chat', data);

			}
		}

	});
}*/

function locationsActions() {
	//On click of the location item close drawer and add item value to #onboarding__location. Also add the location lat and lng to the hidden fields
	jQuery(document).on('click', '.location__list .locations__item', function () {
		value = jQuery(this).attr('data-value');
		jQuery(jQuery('.location__search').attr('data-from')).val(value);
		//Also add the lat and lng to the hidden fields
		parentForm = jQuery(jQuery('.location__search').attr('data-from')).parents('form');
		formID = parentForm.attr('id');
		console.log(formID);
		console.log(parentForm);

		if (formID == 'onboarding__form') {
			//Check if empty before adding
			if (jQuery('#onboarding__latitude').val() == '') {
				jQuery('#onboarding__latitude').val(jQuery(this).attr('data-lat'));
			}
			if (jQuery('#onboarding__longitude').val() == '') {
				jQuery('#onboarding__longitude').val(jQuery(this).attr('data-lng'));
			}
		}
		else if (formID.includes('addPost__find-buddy')) {
			jQuery('#' + formID).find('#findBuddy__location_lat').val(jQuery(this).attr('data-lat'));
			jQuery('#' + formID).find('#findBuddy__location_lng').val(jQuery(this).attr('data-lng'));
			jQuery('#' + formID).find('#findBuddy__location').val(jQuery(this).attr('data-value'));
		}
		else if (formID.includes('addPost__find-meetups')) {
			jQuery('#' + formID).find('#findMeetups__location_lat').val(jQuery(this).attr('data-lat'));
			jQuery('#' + formID).find('#findMeetups__location_lng').val(jQuery(this).attr('data-lng'));
			jQuery('#' + formID).find('#findMeetups__location').val(jQuery(this).attr('data-value'));
		}
		else if (formID.includes('addPost__ask')) {
			jQuery('#' + formID).find('#ask__location_lat').val(jQuery(this).attr('data-lat'));
			jQuery('#' + formID).find('#ask__location_lng').val(jQuery(this).attr('data-lng'));
			jQuery('#' + formID).find('#ask__location').val(jQuery(this).attr('data-value'));
		}
		else {
			triggerLocationSearch(formID);
		}

		drawer('close');
	});

	//Onboarding Location input search
	timeout = null;

	jQuery(document).on('keyup', '.location__search input', function () {
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			value = jQuery(this).val();
			searchTrigger(value);
		}, 500); // 500ms delay before the search function is called
	});

	jQuery(document).on('click', '.location__search span.search__close', function () {
		jQuery('.location__search input').val('');
		hideResults(icons);
	});

	function searchTrigger(value) {
		if (value.length > 2) {

			jQuery('#main__drawer .drawerBody .location__search span').addClass('search__close').html(icons.close);

			//Fetch the search results
			jsInit('locationSearch', { searchPattern: value, limit: 10 });
		} else {
			hideResults(icons);
		}
	}

	function hideResults(icons) {
		jQuery('#main__drawer .drawerBody .location__search span').removeClass('search__close').html(icons.search);
		jQuery('#main__drawer .drawerBody .location__list').html('');
		setTimeout(() => {
			jQuery('.location__list').append(suggestedContainer);
		}, 500);
	}
}

/*function otpActions() {

	//Resend OTP
	jQuery(document).on('click', '.otp__resend', function (e) {
		e.preventDefault();
		if (!jQuery(this).hasClass('disabled') && jQuery('.otp__resend_in').attr('data-time') == 0) {
			source = jQuery('.otp__view').attr('data-source');

			if (source == 'onboarding' || source == 'signup') {
				if (jQuery('.otp__view').attr('data-service') && jQuery('.otp__view').attr('data-service') == 'firebase') {
					jQuery(this).addClass('disabled');
					if (source == 'onboarding') {
						firebaseOTP('sendSMS', { phoneNumber: jQuery('#onboarding__phone').val(), dialCode: jQuery('#onboarding__countryCode').val(), state: 'resend' });
					}
					else {
						firebaseOTP('sendSMS', { phoneNumber: jQuery('.otp__view').attr('phoneNumber'), dialCode: jQuery('.otp__view').attr('dialCode'), state: 'resend' });

					}
				}
				else {
					jQuery(this).addClass('disabled');
					jsInit('profileSendOTP', { phoneNumber: jQuery('#onboarding__phone').val(), dialCode: jQuery('#onboarding__countryCode').val() }, 'resend');
				}

				resendOTPInterval();
			}
		}
	});

	//Resend OTP - Booking Summary
	jQuery(document).on('click', '.bookingSummary__userDetails-otp__resend', function (e) {
		e.preventDefault();

		if (!jQuery(this).hasClass('disabled') && jQuery('.bookingSummary__userDetails-otp__resend_in').attr('data-time') == 0) {
			jQuery(this).addClass('disabled');
			jsInit('profileSendOTP', { phoneNumber: jQuery('#bookingSummary__mobile').val(), dialCode: jQuery('#bookingSummary__country').val() }, 'resend');

			resendOTPInterval('bookingSummary');
		}
	});


	//Verify OTP
	// jQuery(document).on('keyup', '.otp-field__large input', function (e) {
	// 	//e.preventDefault();
	// 	val = jQuery(this).val();

	// 	if (val.length == 6) {
	// 		jQuery(this).parents('.otp__view').find('.form__submit .btn').click();
	// 	}
	// });

	// jQuery(document).on('paste', '.otp-field__large input', function (e) {
	// 	//e.preventDefault();
	// 	val = jQuery(this).val();
	// 	if (val.length == 6) {
	// 		jQuery(this).parents('.otp__view').find('.form__submit .btn').click();
	// 	}
	// });

	//Verify OTP
	// jQuery(document).on('paste', '.otp-field__large input', function (e) {
	// 	e.preventDefault();
	// 	val = jQuery(this).val();
	// 	if (val.length == 6) {
	// 		jQuery(this).parents('.otp__view').find('.form__submit .btn').click();
	// 	}
	// });

	//Verify OTP
	jQuery(document).on('click', '.otp__view .form__submit button', function (e) {
		e.preventDefault();
		val = jQuery('.otp-field__large input').val();

		if (val.length == 6) {
			loaderMain('formSubmit', true);
			manageOTP('Submit');
		}
		else {
			toast('Please enter a valid OTP');
		}
	});
}*/

function popupActions() {
	
	// Redirect to the Premium Page
	jQuery(document).on('click', '.popup__content', function () {
		if (jQuery(this).hasClass('popup-premium')) {
			// Copy the coupon code to the clipboard
			navigator.clipboard.writeText('BUDDY100');
			toast('Coupon code copied to clipboard');
			jQuery('#premmium_coupon').val('BUDDY100');
			jQuery('.apply__coupon-btn').click();
			fbEvent('inAppWebPopup')
			webAnalytics('inAppWebPopup');
		}
		else if (jQuery(this).hasClass('login')) {
			redirect('login');
		}
		else if (jQuery(this).hasClass('flight-search-back')) {
			navigator.clipboard.writeText('IND500');
			toast('Coupon code copied to clipboard');
		}
		else {
			redirect('premium');
		}
		jQuery('.popup').remove();
	});
	
	
	//Popup close
	jQuery(document).on('click', '.popup__head-close, .popup__mask, .completeness__popup-ctas', function () {
		if (jQuery(this).parents('.popup__master.active').find('.permissions__box').attr('data-type') == 'underMaintainance') {
		}
		else {
            jQuery('.permissions__box-ctas, .popup__head').css('display', 'flex');
			jQuery('.popup__container').removeClass('enquiry__container__overlap');
			jQuery('.popup__head-close svg path').css('fill', '#000');
			jQuery('.popup__container').css({'height':'','display':'none','flex-direction':'','max-width':'','width':'','background':''});
			managePopups('hide');
			// just keep / in url
            //history.pushState(null, null, '/');
		}
	});

	jQuery(document).on('click', '.completeness__popup-complete', function () {
		if (jQuery('#secondary .secondary__tab.editProfileBody').length == 0) {
			jQuery('.profile__head-edit').click();
		}
	});

	jQuery(document).on('click', '#deleteCover', function () {
		console.log('Delete');
		console.log('deleteCover');
		console.log(jQuery('#editProfile').find('.swiper-slide-active img').attr('src'));
		var src = jQuery('#editProfile').find('.swiper-slide-active img').attr('src');
		var result = '';
		if (src.includes('https')) {
			result = src;
		}
		else {
			var searchString = '/filters';
			var startIndex = src.indexOf(searchString);
			result = src.slice(startIndex);
		}
		console.log(result);
		jsInit('deleteCover', { "coverPhotoUrl": result });
		jQuery('#editProfile').find('.swiper-slide-active').remove();
		manageUserProfile('clean');
	});
}

function feedbackActions() {
	jQuery(document).on('submit', '#feedback__form', function (a_obj) {
		a_obj.preventDefault();
		if (jQuery('#feedback__text').val().length > 50) {
			jQuery(this).find('#feedback__text').removeClass('err');
			jsInit('feedback', { 'feedback': jQuery('#feedback__text').val() });
		}
		else {
			jQuery(this).find('#feedback__text').addClass('err');
			toast('Please provide a more detailed feedback. A minimum of 50 characters will help us understand better');
		}
	});

	jQuery(document).on('keyup', '#feedback__text', function () {
		jQuery(this).removeClass('err');
	});
}

function blockedUsersActions() {
	//Open User Profile on click of the user image or name
	jQuery(document).on('click', '.blocked__list-item-img, .blocked__list-item-name', function () {
		redirect('profile', jQuery(this).parents('.blocked__list-item').attr('data-user'));
	});

	//Unblock user
	jQuery(document).on('click', '.blocked__list-item-unblock', function () {
		jsInit('unblockUser', {
			userId: jQuery(this).parents('.blocked__list-item').attr('data-user'),
			type: 2,
		});
	});
}

function optionsMenuActions() {

	//Open Small Menu
	jQuery(document).on('click', '.feed__head-menu, .profile__menu', function () {
		jQuery(this).find('.options__menu').toggle();
	});

	//Close Small Menu
	jQuery(document).on('click', '.options__menu-mask', function () {
        jQuery(this).parents('.options__menu').css('display', 'none !important');
        jQuery(this).parents('.price_range_wrapper').hide();
        jQuery(this).parents('.filter-list-container-wrapper').hide();
    });

	//Menu Item Click for the Main Page
	jQuery(document).on('click', '#main .options__menu ul li', function () {
		type = jQuery(this).attr('data-type');
		where = jQuery(this).parents('.options__menu').attr('data-type');

		if (type == 'report') {
			closeMenu(this);
			if (where == 'post') {
				renderReportBox('init', jQuery(this).parents('.feed_item').attr('data-id'), where);
			}
			else {
				renderReportBox('init', jQuery(this).parents('.profile__page').attr('data-user'), where);
			}
		}
		else if (type == 'block') {
			renderPermissionBox('init', 'blockUser');
		}
		else if (type == 'share') {
			if (window.location.href.includes('beatravelbuddy.com') || window.location.href.includes('localhost') || isIOS() || isAndroid()) {
				if (!guestMaster('noLogin')) {
					postId = jQuery(this).parents('.feed_item').attr('data-id');
					postType = jQuery(this).parents('.feed_item').attr('data-post-type');
					renderChatSend('invoke', { postId: postId, postType: postType });
				}
			}
		}
		else if (type == 'follow') {
			userId = jQuery(this).parents('.feed_item').attr('data-user');
			jsInit('followUser', { userId: userId }, 'feed_item');
			jQuery(this).find('span').html(icons.loader);

			state = jQuery(this).text();

			setTimeout(() => {
				if (state == 'Follow') {
					jQuery(this).text('Un-Follow');
					jQuery(this).find('span').html(icons.following);
					toast('You are now following ' + jQuery(this).parents('.feed_item').find('span.feed___head-name').text());
				}
				else {
					jQuery(this).text('Follow');
					jQuery(this).find('span').html(icons.follow);
					toast('You have un-followed ' + jQuery(this).parents('.feed_item').find('span.feed___head-name').text());
				}
			}, 1000);
		}
		else if (type == 'delete') {
			renderPermissionBox('init', 'Delete Post');
			localStorage.setItem('deletePost', jQuery(this).parents('.feed_item').attr('data-id'));
		}
		else if (type == 'edit') {
			feedType = jQuery(this).parents('.feed__head').find('.feed__head-name span').text().split('.')[1];
			if (feedType.includes('Story')) {

				postItem = jQuery(this).parents('.feed_item');
				payload = { media: [], description: jQuery(postItem).find('.feed__body-description pre').html(), location: jQuery(postItem).find('.feed___head-name-location').html(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng') }

				jQuery(postItem).find('.feed__body-images .swiper-slide').each(function () {
					type = jQuery(this).attr('data-type');
					if (type == 'video') {
						console.log('video');
						type = 'video';
						dataToAdd = {
							urlImageThumbnail: jQuery(this).find(type).attr('poster'),
							mediaUrl: jQuery(this).find('source').attr('src'),
							mediaHeight: jQuery(this).find(type).attr('height'),
							mediaWidth: jQuery(this).find(type).attr('width'),
							mediaType: jQuery(this).attr('data-type'),
							mediaId: jQuery(this).attr('media-id')
						}
					}
					else {
						console.log('image');
						type = 'img';
						dataToAdd = {
							mediaUrl: jQuery(this).find(type).attr('src'),
							mediaHeight: jQuery(this).find(type).attr('data-height'),
							mediaWidth: jQuery(this).find(type).attr('data-width'),
							mediaType: jQuery(this).find(type).attr('data-type')
						}
					}
					payload.media.push(dataToAdd);
				});

				console.log(payload);

				manageEditPosts('story', payload);

			}
			else if (feedType.includes('meetups')) {
				console.log('meetups');
				postItem = jQuery(this).parents('.feed_item');

				payload = { description: jQuery(postItem).find('.feed__body-description pre').html(), location: jQuery(postItem).find('.feed__body-trip_location span').text(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), date: jQuery(postItem).find('.feed__body-trip_date span').text(), genderType: jQuery(postItem).find('.feed__head-name .genderType').text(), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng') }

				console.log(payload);

				manageEditPosts('meetups', payload);
			}
			else if (feedType.includes('buddy')) {
				console.log(feedType);
				postItem = jQuery(this).parents('.feed_item');
                if (jQuery(postItem).find('.feed__body-description pre').html().startsWith('<strong>')) {
                    description = removeStrongTags(jQuery(postItem).find('.feed__body-description pre').html());
                }
                else {
                    description = jQuery(postItem).find('.feed__body-description pre').html();
                }
				payload = { description: description, location: jQuery(postItem).find('.feed__body-trip_location span').text(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), date: jQuery(postItem).find('.findBud-location.hidden .feed__body-trip_date.old span').text(), genderType: jQuery(postItem).find('.feed__head-name .genderType').text(), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng'), media: [] }

				console.log(payload);
				
				if (jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('src')) {
                    payload.media.push({
                        mediaUrl: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('src'),
                        mediaHeight: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('data-height'),
                        mediaWidth: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('data-width'),
                        mediaType: 'img',
                        mediaId: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('media-id')
                    });
                }

				manageEditPosts('find', payload);
			}

			else if (feedType.includes('Ask')) {
				console.log(feedType);
				console.log(feedType);
				postItem = jQuery(this).parents('.feed_item');
				payload = { description: jQuery(postItem).find('.feed__body-description pre').html(), location: jQuery(postItem).find('.feed___head-name-location').html(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng') }

				console.log(payload);

				manageEditPosts('ask', payload);
			}

		}
		else if (type == 'chat') {
			if (guestMaster()){
				redirect('login');				
			}else{
				userId = jQuery(this).parents('.feed_item').attr('data-user');
				var data = {
					userId: userId,
					userDp: jQuery(this).parents('.feed_item').find('.feed__head-img img').attr('src'),
					userName: jQuery(this).parents('.feed_item').find('span.feed___head-name').text()
				}
				//redirect('chat', data);
				// removeActiveClassFromMain();
				// jQuery('#main__chat-box').addClass('active');
				queryString = Object.keys(data)
							.map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
							.join('&');
				console.log("Query String: ", queryString);
				openNewChat('dmChatRedirect=' + queryString);
			}
		}
        else if (type == 'blockUserByAdmin') {
            jsInit('blockUserByAdmin', { userId: jQuery(this).parents('.feed_item').attr('data-user') });
        }
        else if (type == 'pinUnpinPost') {
            optionType = jQuery(this).attr('data-ispinned') === 'true' ? 2 : 1;
            jsInit('pinUnpinPost', { postId: jQuery(this).parents('.feed_item').attr('data-id'), option: optionType  });
        }
        else if (type == 'makeRemoveInfluencer') {
            infType = jQuery(this).attr('data-isinfluencer') === 'true' ? 2 : 1;
            jsInit('makeRemoveInfluencer', { userId: jQuery(this).parents('.feed_item').attr('data-user'), type: infType });
        }

		function closeMenu(something) {
			jQuery(something).parents('.options__menu').find('.options__menu-mask').click();
		}
	});

	// Menu click for posts rendered after the Profile is opened
	jQuery(document).on('click', '#secondary .feed__box .options__menu ul li', function () {
		type = jQuery(this).attr('data-type');
		where = jQuery(this).parents('.options__menu').attr('data-type');

		console.log(type);

		if (type == 'report') {
			closeMenu(this);
			if (where == 'post') {
				renderReportBox('init', jQuery(this).parents('.feed_item').attr('data-id'), where);
			} else {
				renderReportBox('init', jQuery(this).parents('.profile__page').attr('data-user'), where);
			}
		}
		else if (type == 'block') {
			renderPermissionBox('init', 'blockUser');
		}
			else if (type == 'chat') {
			if (guestMaster()){
				redirect('login');				
			}else{
				userId = jQuery(this).parents('.feed_item').attr('data-user');
				//Check if the post first image is a video or not
				if (jQuery(this).parents('.feed_item').find('.feed__body-images .swiper-wrapper .swiper-slide:first-child video').length > 0) {
					imageUrl = jQuery(this).parents('.feed_item').find('.feed__body-images .swiper-wrapper .swiper-slide:first-child video').attr('poster');
				}
				else {
					imageUrl = jQuery(this).parents('.feed_item').find('.feed__body-images .swiper-wrapper .swiper-slide:first-child img').attr('src');
				}
				var data = {
					userId: userId,
					userDp: imageUrl,
					userName: jQuery(this).parents('.feed_item').find('span.feed___head-name').text()
				}
				console.log(data);
				queryString = Object.keys(data)
							.map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
							.join('&');
				console.log("Query String: ", queryString);
				openNewChat('dmChatRedirect=' + queryString);
			}
		}
		else if (type == 'share') {
			console.log('User wants to share this post. Lol :P');
			postId = jQuery(this).parents('.feed_item').attr('data-id');

			//Check if the post first image is a video or not
			if (jQuery(this).parents('.feed_item').find('.feed__body-images .swiper-wrapper .swiper-slide:first-child video').length > 0) {
				imageUrl = jQuery(this).parents('.feed_item').find('.feed__body-images .swiper-wrapper .swiper-slide:first-child video').attr('poster');
			}
			else {
				imageUrl = jQuery(this).parents('.feed_item').find('.feed__body-images .swiper-wrapper .swiper-slide:first-child img').attr('src');
			}

			createDeepLink(jQuery(this).parents('.feed_item').attr('data-post-type'), postId, imageUrl);
		}
		else if (type == 'follow') {
			userId = jQuery(this).parents('.feed_item').attr('data-user');
			jsInit('followUser', { userId: userId }, 'feed_item');
			jQuery(this).find('span').html(icons.loader);

			state = jQuery(this).text();

			setTimeout(() => {
				if (state == 'Follow') {
					jQuery(this).text('Un-Follow');
					jQuery(this).find('span').html(icons.following);
					toast('You are now following ' + jQuery(this).parents('.feed_item').find('span.feed___head-name').text());
				}
				else {
					jQuery(this).text('Follow');
					jQuery(this).find('span').html(icons.follow);
					toast('You have un-followed ' + jQuery(this).parents('.feed_item').find('span.feed___head-name').text());
				}
			}, 1000);
		}
		else if (type == 'delete') {
			renderPermissionBox('init', 'Delete Post');
			localStorage.setItem('deletePost', jQuery(this).parents('.feed_item').attr('data-id'));
		}
        else if (type == 'blockUserByAdmin') {
            console.log('Block User By Admin');
            jsInit('blockUserByAdmin', { userId: jQuery(this).parents('.feed_item').attr('data-user') });
        }
        else if (type == 'pinUnpinPost') {
            console.log('pinUnpinPost', jQuery(this).attr('data-tab'));
            
            optionType = jQuery(this).attr('data-ispinned') === 'true' ? 2 : 1;
            
            jsInit('pinUnpinPost', { postId: jQuery(this).parents('.feed_item').attr('data-id'), option: optionType  });
            //jQuery(this).attr('data-ispinned') === 'true' , , value: jQuery(this).attr('data-tab')
        }
        else if (type == 'makeRemoveInfluencer') {
            console.log('makeRemoveInfluencer');
            jsInit('makeRemoveInfluencer', { userId: jQuery(this).parents('.feed_item').attr('data-user'), type: 4 });
        }
		else if (type == 'edit') {
			feedType = jQuery(this).parents('.feed__head').find('.feed__head-name span').text().split('.')[1];
			if (feedType.includes('Story')) {

				postItem = jQuery(this).parents('.feed_item');
				payload = { media: [], description: jQuery(postItem).find('.feed__body-description pre').html(), location: jQuery(postItem).find('.feed___head-name-location').html(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng') }

				jQuery(postItem).find('.feed__body-images .swiper-slide').each(function () {
					type = jQuery(this).attr('data-type');
					if (type == 'video') {
						console.log('video');
						type = 'video';
						dataToAdd = {
							urlImageThumbnail: jQuery(this).find(type).attr('poster'),
							mediaUrl: jQuery(this).find('source').attr('src'),
							mediaHeight: jQuery(this).find(type).attr('height'),
							mediaWidth: jQuery(this).find(type).attr('width'),
							mediaType: jQuery(this).attr('data-type'),
							mediaId: jQuery(this).attr('media-id')
						}

					}
					else {
						console.log('image');
						type = 'img';
						dataToAdd = {
							mediaUrl: jQuery(this).find(type).attr('src'),
							mediaHeight: jQuery(this).find(type).attr('data-height'),
							mediaWidth: jQuery(this).find(type).attr('data-width'),
							mediaType: jQuery(this).find(type).attr('data-type')
						}
					}
					payload.media.push(dataToAdd);
				});

				console.log(payload);

				manageEditPosts('story', payload);

			}
			else if (feedType.includes('meetups')) {
				console.log('meetups');
				postItem = jQuery(this).parents('.feed_item');
				canEdit = isEditable(jQuery(postItem).find('.feed__body-trip_date span').text());
				if (!canEdit) {
					return;
				}

				payload = { description: jQuery(postItem).find('.feed__body-description pre').html(), location: jQuery(postItem).find('.feed__body-trip_location span').text(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), date: jQuery(postItem).find('.feed__body-trip_date span').text(), genderType: jQuery(postItem).find('.feed__head-name .genderType').text(), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng') }

				console.log(payload);

				manageEditPosts('meetups', payload);
			}
			else if (feedType.includes('buddy')) {
				console.log(feedType);
				postItem = jQuery(this).parents('.feed_item');
				canEdit = isEditable(jQuery(postItem).attr('data-original-time'));
				if (!canEdit) {
					return;
				}
                if (jQuery(postItem).find('.feed__body-description pre').html().startsWith('<strong>')) {
                    description = removeStrongTags(jQuery(postItem).find('.feed__body-description pre').html());
                }
                else {
                    description = jQuery(postItem).find('.feed__body-description pre').html();
                }
				payload = { description: description, location: jQuery(postItem).find('.feed__body-trip_location span').text(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), date: jQuery(postItem).find('.findBud-location.hidden .feed__body-trip_date.old span').text(), genderType: jQuery(postItem).find('.feed__head-name .genderType').text(), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng'), media: [] };

				console.log(payload);
                
                if (jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('src')) {
                    payload.media.push({
                        mediaUrl: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('src'),
                        mediaHeight: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('data-height'),
                        mediaWidth: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('data-width'),
                        mediaType: 'img',
                        mediaId: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('media-id')
                    });
                }
                console.log(payload);

				manageEditPosts('find', payload);
			}

			else if (feedType.includes('Ask')) {
				console.log(feedType);
				console.log(feedType);
				postItem = jQuery(this).parents('.feed_item');
				payload = { description: jQuery(postItem).find('.feed__body-description pre').html(), location: jQuery(postItem).find('.feed___head-name-location').html(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng') }

				console.log(payload);

				manageEditPosts('ask', payload);
			}

		}

		function closeMenu(something) {
			jQuery(something).parents('.options__menu').find('.options__menu-mask').click();
		}

		function isEditable(data) {
			var date = new Date();
			var dd = date.getDate();
			var mm = date.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
			var yyyy = date.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm
			}
			var today = yyyy + '-' + mm + '-' + dd;
			// var meetupDate =
			var meetupDate = data;
			if (today > meetupDate) {
				toast('You cannot edit a post that has already passed the current date.');
				return false;
			}
            else {
                return true;
            }
		}
	});

	//Menu Item Click for the Secondary Page ---> Share Profile
	jQuery(document).on('click', '#secondary .profile__tab .options__menu ul li', function () {
		type = jQuery(this).attr('data-type');
		where = jQuery(this).parents('.options__menu').attr('data-type');

		if (type == 'report') {
			closeMenu(this);
			if (where == 'post') {
				renderReportBox('init', jQuery(this).parents('.feed_item').attr('data-id'), where);
			} else {
				renderReportBox('init', jQuery(this).parents('.profile__page').attr('data-user'), where);
			}
		}
		else if (type == 'block') {
			renderPermissionBox('init', 'blockUser');
		}
		else if (type == 'share') {

			console.log(jQuery(this).parents('#secondary').find('.profile__page').attr('data-user'));
			console.log(jQuery(this).parents('.drawerBody').find('.profile__page .profile__title .profile__title-first .profile__photo img').attr('src'));

			profileId = jQuery(this).parents('#secondary').find('.profile__page').attr('data-user');
			imageUrl = jQuery(this).parents('.drawerBody').find('.profile__page .profile__title .profile__title-first .profile__photo img').attr('src');


			if (window.location.href.includes('beatravelbuddy.com') || window.location.href.includes('localhost') || isIOS() || isAndroid()) {
				if (!guestMaster('noLogin')) {
					postId = jQuery(this).parents('#secondary').find('.profile__page').attr('data-user');
					postType = 'shareProfile';
					renderChatSend('invoke', { postId: postId, postType: postType });
				}
			}

		}
		else if (type == 'follow') {
			if (!guestMaster()) {
				userId = jQuery(this).parents('.feed_item').attr('data-user');
				jsInit('followUser', { userId: userId }, 'feed_item');
				jQuery(this).find('span').html(icons.loader);

				state = jQuery(this).text();

				setTimeout(() => {
					if (state == 'Follow') {
						jQuery(this).text('Un-Follow');
						jQuery(this).find('span').html(icons.following);
						toast('You are now following ' + jQuery(this).parents('.feed_item').find('span.feed___head-name').text());
					}
					else {
						jQuery(this).text('Follow');
						jQuery(this).find('span').html(icons.follow);
						toast('You have un-followed ' + jQuery(this).parents('.feed_item').find('span.feed___head-name').text());
					}
				}, 1000);
			} else {
				redirect('login');
			}
		}
		else if (type == 'delete') {
			renderPermissionBox('init', 'Delete Post');
			localStorage.setItem('deletePost', jQuery(this).parents('.feed_item').attr('data-id'));
		}
        else if (type == 'blockUserByAdmin') {
            console.log('Block User By Admin');
            jsInit('blockUserByAdmin', { userId: jQuery(this).parents('#secondary .profile__tab .profile__page').attr('data-user') });
        }
        else if (type == 'pinUnpinPost') {
            console.log('pinUnpinPost', jQuery(this).attr('data-tab'));
            
            optionType = jQuery(this).attr('data-ispinned') === 'true' ? 2 : 1;
            
            jsInit('pinUnpinPost', { postId: jQuery(this).parents('.feed_item').attr('data-id'), option: optionType  });
        }
        else if (type == 'makeRemoveInfluencer') {
            console.log('makeRemoveInfluencer');
            jsInit('makeRemoveInfluencer', { userId: jQuery(this).parents('#secondary .profile__tab .profile__page').attr('data-user'), type: '1' });
        }
        else if (type == 'givePremium') {
			renderReportBox('init', jQuery(this).parents('.profile__page').attr('data-user'), 'givePremium');
        }
		else if (type == 'edit') {
			feedType = jQuery(this).parents('.feed__head').find('.feed__head-name span').text().split('.')[1];
			if (feedType.includes('Story')) {

				postItem = jQuery(this).parents('.feed_item');
				payload = { media: [], description: jQuery(postItem).find('.feed__body-description pre').html(), location: jQuery(postItem).find('.feed___head-name-location').html(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng') }

				jQuery(postItem).find('.feed__body-images .swiper-slide').each(function () {
					type = jQuery(this).attr('data-type');
					if (type == 'video') {
						console.log('video');
						type = 'video';
						dataToAdd = {
							urlImageThumbnail: jQuery(this).find(type).attr('poster'),
							mediaUrl: jQuery(this).find('source').attr('src'),
							mediaHeight: jQuery(this).find(type).attr('height'),
							mediaWidth: jQuery(this).find(type).attr('width'),
							mediaType: jQuery(this).attr('data-type'),
							mediaId: jQuery(this).attr('media-id')
						}

					}
					else {
						console.log('image');
						type = 'img';
						dataToAdd = {
							mediaUrl: jQuery(this).find(type).attr('src'),
							mediaHeight: jQuery(this).find(type).attr('data-height'),
							mediaWidth: jQuery(this).find(type).attr('data-width'),
							mediaType: jQuery(this).find(type).attr('data-type')
						}
					}
					payload.media.push(dataToAdd);
				});

				console.log(payload);

				manageEditPosts('story', payload);

			}
			else if (feedType.includes('meetups')) {
				console.log('meetups');
				postItem = jQuery(this).parents('.feed_item');

				payload = { description: jQuery(postItem).find('.feed__body-description pre').html(), location: jQuery(postItem).find('.feed__body-trip_location span').text(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), date: jQuery(postItem).find('.feed__body-trip_date span').text(), genderType: jQuery(postItem).find('.feed__head-name .genderType').text(), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng') }

				console.log(payload);

				manageEditPosts('meetups', payload);
			}
			else if (feedType.includes('buddy')) {
				console.log(feedType);
				postItem = jQuery(this).parents('.feed_item');
                if (jQuery(postItem).find('.feed__body-description pre').html().startsWith('<strong>')) {
                    description = removeStrongTags(jQuery(postItem).find('.feed__body-description pre').html());
                }
                else {
                    description = jQuery(postItem).find('.feed__body-description pre').html();
                }
				payload = { description: description, location: jQuery(postItem).find('.feed__body-trip_location span').text(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), date: jQuery(postItem).find('.findBud-location.hidden .feed__body-trip_date.old span').text(), genderType: jQuery(postItem).find('.feed__head-name .genderType').text(), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng'), media: [] }

				console.log(payload);

				if (jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('src')) {
                    payload.media.push({
                        mediaUrl: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('src'),
                        mediaHeight: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('data-height'),
                        mediaWidth: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('data-width'),
                        mediaType: 'img',
                        mediaId: jQuery(postItem).find('.feed__body-images .swiper-slide img').attr('media-id')
                    });
                }

				manageEditPosts('find', payload);
			}

			else if (feedType.includes('Ask')) {
				console.log(feedType);
				console.log(feedType);
				postItem = jQuery(this).parents('.feed_item');
				payload = { description: jQuery(postItem).find('.feed__body-description pre').html(), location: jQuery(postItem).find('.feed___head-name-location').html(), id: jQuery(postItem).attr('data-id'), userId: jQuery(postItem).attr('data-user'), lat: jQuery(postItem).attr('data-lat'), lng: jQuery(postItem).attr('data-lng') }

				console.log(payload);

				manageEditPosts('ask', payload);
			}

		}

		function closeMenu(something) {
			jQuery(something).parents('.options__menu').find('.options__menu-mask').click();
		}
	});



}

function manageEditPosts(state, data) {
	console.log('Manage Edit Posts');
	console.log(data);
	jQuery('.addPost__post_discard').show();

	if (state == 'story') {
		if (data) {
			console.log(data);
			jQuery('.drawer__back').click();

			jQuery('#footer ul li[data-item="addPost"]').click();
            jQuery('.addPost__tab-item[data-id="share"]').click();
			jQuery('.addPost__post').html('Update');


			commaSeparatedString = ''; var startIndex = '';
			//Add the Post data to the addPost form
			jQuery.each(data.media, function (index, item) {
				// Do something with each item here
				if (data.media[index].mediaType.includes('image')) {
					startIndex = item.mediaUrl.indexOf("/uploads");
					commaSeparatedString += item.mediaUrl.substring(startIndex) + '|';
				}
				else {
					startIndex = item.mediaUrl.indexOf("uploads");
					commaSeparatedString += item.mediaUrl.substring(startIndex) + '|';
					console.log(commaSeparatedString);
				}
			});

			commaSeparatedString = commaSeparatedString.slice(0, -1);
			console.log(commaSeparatedString);

			jQuery('#share__media').val(commaSeparatedString);
			jQuery('#share__location').val(data.location);

			if (data.lat && data.lng) {
				jQuery('#share__location_lat').val(data.lat).attr('value', data.lat);
				jQuery('#share__location_lng').val(data.lng).attr('value', data.lng);
			}

			jQuery('#share__description').val(cleanUpDescription(data.description));
			jQuery('#share__description').trigger('keyup');
			jQuery('#share__location_lat').val(data.lat);
			jQuery('#share__location_lng').val(data.lng);

			//Add the images to the addPost form
			if (jQuery('.form__section:first-child .editImage').length > 0) {
				jQuery('.form__section:first-child .editImage').remove();
			}

			jQuery('.form__section:first-child').append('<div class="editImage"></div>');
			jQuery(data.media).each(function () {
				if (this.mediaType == 'image') {
					jQuery('.editImage').append('<div class="addPost__images-item" data-type="image" data-id=' + data.id + ' media-id=' + this.mediaId + '><img src="' + this.mediaUrl + '" alt=""><span class="addPost__removeImage" id="removeShareMedia">x</span></div>');
				}
				else {
					console.log(this.urlImageThumbnail);
					jQuery('.editImage').append('<div class="addPost__images-item" media-path=' + this.mediaUrl + ' data-type="video" data-id=' + data.id + ' media-id=' + this.mediaId + '><img src="' + this.urlImageThumbnail + '" alt=""><div class="addPost__icon-container">' + icons.play__icon + '</div><span class="addPost__removeImage" id="removeShareMedia">X</span></div>');
				}

			});
			jQuery('.editImage').find('.addPost__images-item:first-child').addClass('first-child');
		}
		else {

		}
	}
	else if (state == 'find') {
		if (data) {
			inputtedDated = data.date;
			date = new Date(inputtedDated.replace(/(\d+)(st|nd|rd|th)/, "$1"));
			formattedDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
			console.log(formattedDate);
			console.log(data.location);
			jQuery('.drawer__back').click();

			//Open Find
			jQuery('#footer ul li[data-item="addPost"]').click();
            jQuery('.addPost__tab-item[data-id="find"]').click();
			// Select the gender
			if (data.genderType.includes('female')) {
				jQuery('.form__checkbox.checkbox__gender .checkbox-item label[for="findBuddy__preferred-female"]').click();
			}
			else if (data.genderType.includes('male')) {
				jQuery('.form__checkbox.checkbox__gender .checkbox-item label[for="findBuddy__preferred-male"]').click();
			}
			else if (data.genderType.includes('nonBinary')) {
				jQuery('.form__checkbox.checkbox__gender .checkbox-item label[for="findBuddy__preferred-nonBinary"]').click();
			}
			else {
				jQuery('.form__checkbox.checkbox__gender .checkbox-item label[for="findBuddy__preferred-any"]').click();
			}
			jQuery('.addPost__post').html('Update');

			jQuery('#share__location-find').val(data.location);
			jQuery('#findStartDate').val(formattedDate);
			jQuery('#findBuddy__description').val(cleanUpDescription(data.description));
			jQuery('#findBuddy__description').trigger('keyup');
			jQuery('#share__location_lat-find').val(data.lat);
			jQuery('#share__location_lng-find').val(data.lng);
            
            //Add the images to the addPost form
			if (jQuery('#addPost__find-buddy .editImage').length > 0) {
				jQuery('#addPost__find-buddy .editImage').remove();
			}

			if (data.media.length > 0) {
				jQuery('#addPost__find-buddy .form__section.form__section-beige.relative.findBuddy').after('<div class="editImage"><div class="addPost__images-item" data-type="image" data-id=' + data.id + ' media-id=' + data.media[0].mediaId + '><img src=" ' + data.media[0].mediaUrl + '" alt=""><span class="addPost__removeImage findPost" id="removeFindMedia">x</span></div></div>');
			}

			jQuery('#addPost__find-buddy').append('<div class="editFind" data-id=' + data.id + '></div>');

		}
	}
	else {
		if (data) {
			jQuery('.drawer__back').click();
			//Open Ask
			jQuery('#footer ul li[data-item="addPost"]').click();
			jQuery('.addPost__tab-item[data-id="ask"]').click();

			jQuery('.addPost__post').html('Update');

			jQuery('#ask__location').val(data.location);
			jQuery('#ask__description').val(cleanUpDescription(data.description));
			jQuery('#ask__description').trigger('keyup');
			jQuery('#ask__location_lat').val(data.lat);
			jQuery('#ask__location_lng').val(data.lng);


			jQuery('#addPost__ask').append('<div class="editAsk" data-id=' + data.id + '></div>');
			console.log(data);
		}
	}

}

//Clean up the description
function cleanUpDescription(description) {
    renderItem = '';

    if (description) {
        //Remove all the html
        renderItem = description.replace(/<[^>]*>/g, '');
    }

    return renderItem;
}

function permissionsActions() {
	jQuery(document).on('click', '.permissions__box-complete', function () {
		type = jQuery(this).parents('.permissions__box').attr('data-type');

		if (type == 'blockUser') {
			console.log('Blocking user');
			jsInit('blockUser', {
				userId: jQuery('#secondary .secondary__tab:last-child .drawerBody .profile__page').attr('data-user'),
				type: 1,
			});
		}
		else if (type == 'onboardingBack') {
			tokenMaster('logout');
			reloadWindowWithIosCheck();
		}
		else if (type == 'Block User Chat') {
			chatId = jQuery('.singleChat__container').attr('data-chat-id');
			userId = jQuery('.singleChat__container').attr('data-chat-user');
			jsInit('acceptChatRequest', { chatId: chatId, userId: userId, optionType: 'rejected' });

			//Close the permission box
			jQuery('.popup__mask').click();
		}
		else if (type == 'cancel-onBoarding') {
			loaderMain('global', true);
			data = {
				'email': jQuery('#onboarding__email').val().toLowerCase(),
				'name': jQuery('#onboarding__name').val(),
			}
			// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
			// 	Moengage.track_event('TBD_CANCEL_FROM_ONBOARDING', data);
			// }
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_CANCEL_FROM_ONBOARDING', JSON.stringify(data));
			// }
			jsInit('deactivateAccount', { "clean": true });
			//Close the permission box
			jQuery('.popup__mask').click();


		}
		else if (type == 'Delete Post') {
			console.log('Deleting Post');
			postId = localStorage.getItem('deletePost');
			jsInit('deletePost', { postId: postId }, jQuery(this).parents('.feed_item[data-post-id="' + postId + '"]'));

			//Remove the deletePost from the local storage
			localStorage.removeItem('deletePost');

			//Close the permission box
			jQuery('.popup__mask').click();
		}
		else if (type == 'leaveGroupChat' || type == 'deleteGroupChat' || type == 'removeGroupMember') {
			chatId = jQuery('.singleChat__container').attr('data-chat-id');
			userId = jQuery('.singleChat__container').attr('data-chat-user');

			//Make API Call here
			if (type == 'leaveGroupChat' || type == 'deleteGroupChat') {
				jQuery('.group__members-section').attr('data-remove-member', userId);
				timestamp = Math.floor(Date.now() / 1000);
				payload = { groupId: chatId, memberIdsToRemove: [localStorage.getItem('plainUserId')], timeStamp: timestamp };

				console.log(payload);
				jsInit('exitUserFromGroup', payload);
			}
			else if (type == 'removeGroupMember') {
				userId = jQuery('.group__members-section').attr('data-remove-member');
				timestamp = Math.floor(Date.now() / 1000);
				jsInit('removeUserFromGroup', { groupId: chatId, memberIdsToRemove: [userId], timeStamp: timestamp });
			}

			//Hide the Popup and the Group Members Screen
			jQuery('.popup__mask').click();
			jQuery('.group__members-section').find('.css-k008qs').click();
		}
		else if (type == 'addListing-delete') {
			//Get the parent control
			parentCtl = jQuery('.delItem').parents('.spDashboard__listings-item');
			id = parentCtl.attr('data-listing-id');
			jQuery('.delItem').removeClass('delItem');
			jsInit('updateListingStatus', { 'listingId': id, 'listingStatus': 'deleted' });
			parentCtl.remove();
			jQuery('.popup__mask').click();

		}
		else if (type == 'addUsersToGroup') {
			//Hide the Popup
			jQuery('.popup__mask').click();
			loaderMain('global', true);
			groupId = jQuery('.addUsersToGroup__data').attr('data-groupid');
			groupCreatedBy = jQuery('.addUsersToGroup__data').attr('data-createdby');
			groupLastMessage = jQuery('.addUsersToGroup__data').attr('data-grouplastmessage');
			senderId = jQuery('.addUsersToGroup__data').attr('data-senderid');
			groupName = jQuery('.addUsersToGroup__data').attr('data-groupname');
			groupProfileUrl = jQuery('.addUsersToGroup__data').attr('data-groupprofileurl');

			groupMembers = [];
			groupMembers.push(manageUserProfile('read', 'userId'));
			groupMembersData = { groupId: groupId, newMemberIds: groupMembers, data: { createdBy: groupCreatedBy, groupLastMessage: "", senderId: senderId, groupName: groupName, groupProfileUrl: groupProfileUrl, lastMessageSenderName: "", isDeleted: false, chatType: "group" } };
			console.log(groupMembersData);
			jsInit('addUsersToGroup', groupMembersData, 'addUsersToGroupLater');
			toast('You have joined the group.');

			// Open the chat
			setTimeout(() => {
				// Make the url /chat
				window.history.pushState("", "", '/newChat');
				loaderMain('global', false);
				reloadWindowWithIosCheck();
			}, 1000);

		}
		else if (type == 'discardPost') {
			console.log('Discard');
			//Clearing the form
			function resetForms(formIds) {
				formIds.forEach(id => jQuery(`#${id}`)[0].reset());
			}
            
            //jQuery('#footer ul li[data-item="addPost"]').click();

			function updatePostText() {
				activeTabId = jQuery('.addPost__tab-item.active').data('id');
				text = activeTabId === 'share' ? 'Post' : activeTabId;
				jQuery('.addPost__post').text(text);
			}

			resetForms(['addPost__share', 'addPost__find-experiences', 'addPost__find-buddy', 'addPost__ask', 'addPost__find-influencers']);
			jQuery('#share__media, #share__uploading').val('');
			jQuery('.editImage').remove();
			updatePostText();
			// pondShareTab = FilePond.find(document.querySelector('#share__upload'));
			// pondShareTab.removeFiles();
			
			window.location.reload();
            
            // pondFindTab = FilePond.find(document.querySelector('#share__upload-find'));
			// pondShareTab.removeFiles();
			jQuery('.popup__mask').click();
		}
	});

	//Close the report box on cancel click
	jQuery(document).on('click', '.permissions__box-cancel', function () {
		jQuery('.delItem').removeClass('delItem');
		jQuery('.popup__mask').click();
	});
}

function addPostActions() {
	
	// Clicking on select Media button
	jQuery(document).on('click', '#chooseMedia', function (e) {
		e.preventDefault();
		
		if (jQuery('.media-upload__container').length > 0) {
			jQuery('.media-upload__container').remove();
		}
		renderMediaUploadNew('findPost');
	});
	
	jQuery(document).on('click', '.form__checkbox.checkbox__type .checkbox-item, .form__checkbox.checkbox__gender .checkbox-item', function () {
		var clickButtonLatest = jQuery(this).find('input').val();
		if (clickButtonLatest.toLowerCase() == 'female') {
			if (manageUserProfile('read', 'isVerified') != true) {
				toast('Upgrade to Premium to unlock this Gender Type')
				return;
			}
		}
		if (!jQuery(this).hasClass('checked')) {
			jQuery(this).parents('.form__checkbox').find('.checkbox-item').each(function () {
				if (jQuery(this).hasClass('checked')) {
					jQuery(this).removeClass('checked');
				}
			});
			jQuery(this).addClass('checked');

			jQuery(this).parents('.form__checkbox').find('.checkbox-item').each(function () {
				jQuery(this).find('input').removeAttr('checked');
			});

			jQuery(this).find('input').attr('checked', true);

			if (jQuery(this).parent().hasClass('checkbox__type')) {
				if (jQuery(this).find('input').val() == 1) {
					jQuery('.form__row-services').slideDown();
				}
				else {
					jQuery('.form__row-services').slideUp();
				}
			}
		}
	});
	
	userLatLong = getLatLongfromStorage();	
	//Switch between the share, ask and find tabs
	jQuery(document).on('click', '.addPost__tab-item', function () {
		// Clear out the Location, description, date & remove the editImage Div when selecting other Tabs
		//Clearing the form
		['share', 'find-buddy', 'find-experiences', 'ask', 'find-influencers'].forEach(id => {
			jQuery(`#addPost__${id}`)[0].reset();
		});

		jQuery('#share__media, #share__uploading').val('');

		jQuery('.editImage').remove();

		tab = jQuery(this).attr('data-id');

		if (!jQuery(this).hasClass('active')) {
			jQuery('.addPost__tab-item').removeClass('active');
			jQuery(this).addClass('active');

			jQuery('.addPost__item').removeClass('active');
			jQuery('.addPost__' + tab).addClass('active');
		}

		jQuery('.addPost__post').html(tab);
		if (tab == 'share') {
			jQuery('.addPost__post').html('post');
			window.history.pushState("", "", '/add-share-post');
		}
		else if (tab == 'find') {
            window.history.pushState("", "", '/add-find-post');
        }
        else if (tab == 'ask') {
            window.history.pushState("", "", '/add-ask-post');
        }
	});

	//Switch between the find buddy, meetup and influencer tabs
	jQuery(document).on('click', '.addPost__find-tabs ul li', function () {
        ['find-buddy', 'find-experiences', 'find-influencers'].forEach(id => jQuery(`#addPost__${id}`)[0].reset());
        tab = jQuery(this).attr('data-tab');
        console.log(tab);
        if (tab == 'influencers' || tab == 'experiences' || tab == 'buddy') {
            jQuery('.addPost__post').text('Find');
        }
        if (!jQuery(this).hasClass('active')) {
            jQuery('.addPost__find-tabs ul li').removeClass('active');
            jQuery(this).addClass('active');
            jQuery('.addPost__find-item').removeClass('active');
            jQuery('.addPost__find-' + tab).addClass('active');
        }
    });

	//Open the location selector
	jQuery(document).on('click', '#findInfluencer__location, #filter_search, #findBuddy__location, #findExperiences__location, #ask__location', function () {
		renderLocations('init', '', '#' + jQuery(this).attr('id'));
	});
	
	//Submit Post
	jQuery(document).on('click', '.addPost__header-right, button.addPost__post', function (a_obj) {
		if (!guestMaster()) {
			a_obj.preventDefault();
			console.log('Top');
			type = jQuery('.addPost__tab-item.active').attr('data-id');
			jQuery('.addPost__item .form__row').removeClass('err');
			console.log(type);


			if (type == 'find') {
				type = jQuery('.addPost__find-tabs ul li.active').attr('data-tab');
			}
			type = 'buddy';

			if (type == 'share') {
				//pond = FilePond.find(document.querySelector('#share__upload'));
				formData = getFormData(jQuery('#addPost__share'));
				isUpdate = jQuery('.addPost__post').text().includes('Update');
				formData = validateForm('share-post', formData, isUpdate ? 'updateSharePost' : 'addSharePost');

				if (formData.validator.response) {
                    // To upload the media on clicking the post button
                    pond.processFiles().then(files => {
                        // Files have been processed
                        jQuery('#addPost__share').submit();
                    });
                    jQuery('#footer ul li[data-item="feed"]').trigger('click');
                    postLoader('show');
                    toast('Post sent for upload !');
                }
                else {
                    throwFormError(formData.validator);
                }
			}
			else if (type == 'influencers') {
				jQuery('#addPost__find-influencers').submit();
			}
			else if (type == 'experiences') {
				jQuery('.experience-submit-btn button').click();
			}
			else if (type == 'buddy') {
				jQuery('#addPost__find-buddy').submit();
			}
			else if (type == 'ask') {
				jQuery('#addPost__ask').submit();
			}
		}
	});

	//Clearing add post screen.
	jQuery(document).on('click', '.addPost__post_discard', function (e) {
		e.preventDefault();
		renderPermissionBox('init', 'discardPost');
	});

	//Submit Share Post
	jQuery(document).on('submit', '#addPost__share', function (a_obj) {
		a_obj.preventDefault();
		if (!guestMaster()) {
			formData = getFormData(jQuery(this));
			isUpdate = jQuery('.addPost__post').text().includes('Update');
			formData = validateForm('share-post', formData, isUpdate ? 'updateSharePost' : 'addSharePost');

			if (formData.validator.response) {
				mediaList = manageMedia(formData.request.share__media.split('|'), isUpdate ? 'update' : '');
				request = {
					'description': formData.request.share__description,
					"id": 0,
					'isEditPost': isUpdate,
					'location': formData.request.share__location,
					'mediaList': mediaList,
					'isPrivate': formData.request.share__privacy,
					'taggedUsers': [],
					'lat': formData.request.share__location_lat,
					'lng': formData.request.share__location_lng,
					'postId': isUpdate ? jQuery('#addPost__share .addPost__images-item').attr('data-id') : 0,
					'gender': 'any',
					'type': 0,
					'userType': 0,
					'hasMedia': mediaList.length > 0 ? 1 : 0
				};
				//
				clearAndGoBack();
				jsInit(isUpdate ? 'updatePost' : 'addPost', request, 'share');
			} else {
				throwFormError(formData.validator);
			}
		}

		function manageMedia(mediaList, from) {
			return mediaList.map(element => {
				ext = element.split('.').pop().toLowerCase();
				mediaType = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm', 'quicktime', 'h.264', 'h.265', '3gp', 'mpeg-4'].includes(ext) ? 'video' : 'image';
				thumbnailUrl = ( from == 'update' && mediaType == 'video' && element.startsWith('http')) ? element.replace(".mp4", ".jpg") : '';
				return {
					description: '',
					id: '',
					mediaId: '0',
					mediaType: mediaType,
					imageHeight: 0,
					imageWidth: 0,
					mediaUrl: element,
					localUrl: element,
					thumbnailUrl: thumbnailUrl,
					title: '',
				};
			});
		}

		setTimeout(function () {
			//jQuery('.filepond--action-revert-item-processing').click();
		}, 1000);
	});

	//Submit Influencer Post
	jQuery(document).on('submit', '#addPost__find-influencers', function (a_obj) {
		a_obj.preventDefault();

		if (!guestMaster()) {
			//Pull the data from the form
			formData = getFormData(jQuery(this));
			formData = validateForm('influencer-post', formData);

			if (formData.validator.response) {

				redirect('influencers', {
					location: formData.request.findInfluencer__location,
					gender: formData.request.findBuddy__preferred,
				});
			} else {
				//Throw form errors
				console.log(formData);
				throwFormError(formData.validator);
			}
		}
	});


	//Submit Find Buddy Post
	jQuery(document).on('submit', '#addPost__find-buddy', function (a_obj) {
		a_obj.preventDefault();

		if (!guestMaster()) {
			//Pull the data from the form
			formData = getFormData(jQuery(this));
			formData = validateForm('findBuddy-post', formData);
            mediaListFind = [];
			if (formData.validator.response) {            
				mediaUrl = formData.request.share__media || jQuery('#addPost__find-buddy .editImage .addPost__images-item img').attr('src');

				if (mediaUrl) {
				mediaListFind=[{description:'',id:'',mediaId:'0',mediaType:'image',imageHeight:0,imageWidth:0,mediaUrl:mediaUrl,localUrl:'',thumbnailUrl:'',title:''}];
				uploadFindPost(formData, mediaListFind);
				}
				else {
					toast('Please add a photo before uploading.');
					return;
					loaderMain('global', true);
					jsInit('getPlacePhotos', { locationArray: [formData.request.share__location_findBuddy] }, formData);
					
					// If user in non verified, then send Interakt Campaign
					if (manageUserProfile('read', 'isVerified') != true) {
						//setTimeout(() => {
						// createAndShowPopup('https://beatravelbuddy.com/view/assets/img/find_bud-popup.webp', true);
						// }, 15000);
						/*var getUserDetails = manageUserProfile('read', 'all');
						if (getUserDetails && getUserDetails.phoneNumber && getUserDetails.dialCode && getUserDetails.phoneNumber.length > 0 && getUserDetails.dialCode.length > 0) {
							jsInit('whatsAppNewQuickReplies', { phoneNumber: getUserDetails.phoneNumber, dialCode: getUserDetails.dialCode, templateName: 'findbuddy_3x_faster', imgUrl: 'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Feed%20Card%20Images%2Fself_made-ai-two.jpg?alt=media&token=afe0304a-6416-4d37-8fa1-d57f86cca5e4', userFullName: getUserDetails.name });
						}*/
					}
				}
			}else{
				toast(formData.validator.message);
			}
		}
	});

	//Submit Ask Post
	jQuery(document).on('submit', '#addPost__ask', function (a_obj) {
		a_obj.preventDefault();

		if (!guestMaster()) {
			//Pull the data from the form
			formData = getFormData(jQuery(this));
			formData = validateForm('ask-post', formData);

			if (jQuery('.addPost__post').text().includes('Update')) {
				if (formData.validator.response) {
					jsInit(
						'updatePost',
						{
							description: formData.request.ask__description,
							location: formData.request.ask__location,
							type: 2,
							lat: formData.request.ask__location_lat,
							lng: formData.request.ask__location_lng,
							postId: jQuery('#addPost__ask .editAsk').data('id'),

						},
						'ask'
					);
				}
			}

			else if (formData.validator.response) {
				
				// if (isAndroid()) {
				// 	Android.moEngageData('TBD_ASK_POST_STATUS_EVENT', JSON.stringify({
				// 		'userid': manageUserProfile('read', 'userId'), // string value
				// 		'isSuccess': true, // numeric value
				// 		'postDescription': formData.request.ask__description,
				// 		'location': formData.request.ask__location,
				// 		'hasAttachment': false,
				// 	}));
				// }
				jsInit(
					'addPost',
					{
						description: formData.request.ask__description,
						location: formData.request.ask__location,
						type: 2,
					},
					'ask'
				);
			} else {
				console.log(formData);
				throwFormError(formData.validator);
			}
		}
	});

	//Character Counter
	jQuery(document).on('keyup', '.addPost__item textarea', function () { });

	//Check for @mentions
	jQuery(document).on('keyup', '.addPost__item textarea', function () {
		var text = jQuery(this).val();
		var matches = text.match(/@[a-z0-9_]+/gi);
		if (matches) {
			jQuery.each(matches, function (index, value) {
				console.log(value);
			});
		}

		//Character Counter
		jQuery(this)
			.parents('form')
			.find('.character_count')
			.html(jQuery(this).val().length + '/1800')
			.attr('data-count', jQuery(this).val().length);
	});

	//Find Buddy & Meetup Instructions
	jQuery(document).on('click', '#addPost__find-buddy .instructions', function () {
		renderAddPost('renderFindInstructions', '', 'findBuddy');
	});

	jQuery(document).on('click', '#addPost__find-meetups .instructions', function () {
		renderAddPost('renderFindInstructions', '', 'findMeetups');
	});

	//On focus of the inputs remove the error class
	jQuery(document).on('focus', '.addPost__page input', function () {
		jQuery(this).removeClass('err');
	});

	//Profile Picture Upload
	jQuery(document).on('click', '#addPost__share .form__upload-left, .form__upload-btn', function () {
		if (isMobile()) {
			if (!guestMaster()) {
				renderAddPost('mediaPopup');
			}
		} else {
			jQuery('#share__upload').find('input[name="share__upload"]').attr('accept', 'image/png, image/jpeg, image/jpg, video/mp4, video/webm, video/mov');
			jQuery('.filepond--label-action').click();
		}
		// jQuery(this).parents('.form__upload-right').find('input[type="file"]').click();
	});

	//Mobile Overlay click open the media popup
	jQuery(document).on('click', '.upload__overlay-mobile', function () {
		if (!guestMaster()) {
			if (isMobile()) {
				renderAddPost('mediaPopup');
			}
			else {
				jQuery('#share__upload_select').attr('accept', 'image/png, image/jpeg, image/jpg, image/heic, image/heif, video/mp4, video/webm, video/mov, video/H.264, video/H.265, video/MPEG-4, video/quicktime');
				jQuery('#share__upload_select').click();
			}
		}
		else {
			redirect('login');
		}
	});

	//On click of input type file open the Camera, Video or Gallery inputs
	jQuery(document).on('click', '.addPostMedia__box-item', function () {
		if (!guestMaster()) {
			type = jQuery(this).attr('data-type');
			jQuery('.popup__mask').click(); //Close the popup

			uploadField = jQuery('#share__upload');

			if (type == 'camera') {
				console.log('camera');
				jQuery(uploadField).find('input[name="share__upload"]').attr('capture', 'camera').attr('accept', 'image/*');
				jQuery('.filepond--label-action').click();
			}
			else if (type == 'video') {
				console.log('video');
				jQuery(uploadField).find('input[name="share__upload"]').attr('capture', 'camcorder').attr('accept', 'video/*');
				jQuery('.filepond--label-action').click();
			}
			else if (type == 'gallery') {
                if (jQuery('.addPost__tab-item.active').attr('data-id') == 'find') {
                    jQuery('#share__upload_select').removeAttr('multiple');
                    jQuery('#share__upload_select').attr('accept', 'image/png, image/jpeg, image/jpg, image/heic, image/heif');
                }
                else {
				    jQuery('#share__upload_select').attr('accept', 'image/png, image/jpeg, image/jpg, image/heic, image/heif, video/mp4, video/webm, video/mov, video/H.264, video/H.265, video/MPEG-4, video/quicktime');
                }
				jQuery('#share__upload_select').click();
			}
		}
	});

	function getFormData($form) {
		var unindexed_array = $form.serializeArray();
		var indexed_array = {};

		jQuery.map(unindexed_array, function (n, i) {
			indexed_array[n['name']] = n['value'];
		});

		return indexed_array;
	}
	
	// Find Experiences
	jQuery(document).on("click", ".experinece_category_selectList li", function () {
		liValue = jQuery(this).text();
		jQuery('input[name="category"]').val(liValue);  
		jQuery(".category-dropdown").removeClass('active');
	});
	
	jQuery(document).on('click', '.experience-submit-btn button', function (e) {
		e.preventDefault();
		
		selectedCategory = jQuery('#experienceCategory').val();
		minPrice = jQuery("#experienceFrom").val() || 0;
		maxPrice = jQuery("#experienceTo").val() || 999999;
		selectedLocation = jQuery("#findExperiences__location").val();
		startDate = jQuery("#experienceStartDate").val();
		endDate = jQuery("#experienceEndDate").val();

		if (!selectedLocation && !selectedCategory && !startDate && !endDate && minPrice == 0 && maxPrice == 999999) {
			toast('Please select at least one choice to find experiences.');
			return;
		}
		
		loaderMain('global', true);

		
		filter = {
			location: selectedLocation,
			...(startDate && endDate && { dateRange: { start: startDate, end: endDate } }),
			priceRange: { minValue: minPrice, maxValue: maxPrice },
			...(selectedCategory && { category: selectedCategory }),
		};

		jsInit("getExperiences", { filter }, "findExperiences");
	});
	
	jQuery(document).on("click", ".category-experience-list input[type='text']", function (event) {
		jQuery(this).siblings('.category-dropdown').toggleClass('active');
	});
	
	jQuery(document).click(function (event) {
		if (!jQuery(event.target).closest('.category-experience-list').length) {
			jQuery('.category-dropdown').removeClass('active');
		}
	});
	
	jQuery(document).on('click', '[data-toggle]', function () {
		var target = jQuery(this).data('toggle');
		if (jQuery(this).is(':checked')) {
			jQuery(target).hide();
			jQuery(target).find('input').val(''); // Clear the value of the input box
		} else {
			jQuery(target).show();
		}
	});

	jQuery(document).on('click', '.findBuddies__image', function () {
		jQuery('#main__addPost-box').removeClass('active');
        redirect('premium');
    });
    
    jQuery(document).on('click', '.cat__types .flexible_dates, .cat_budget .flexible_dates, .cat_date .flexible_dates', function () {
        // Find the radio button inside this parent element
        radioButton = jQuery(this).find('.invisible-checkbox-find');

        // Check the radio button
        radioButton.prop('checked', true);

        // Uncheck all other radio buttons within the parent div
        jQuery(this).siblings().find('.invisible-checkbox-find').prop('checked', false);

        // Toggle a class on the parent element
        jQuery(this).toggleClass('selection');

        // Remove the 'selection' class from all other .flexible_dates divs inside the parent div
        jQuery(this).siblings().removeClass('selection');
    });
    
    jQuery(document).on('click', '#findBuddySimilar', function () {
        //manageShots('close');
        jQuery('.popup__mask').click();
        data = jQuery('.popup__master--findBuddySimilar .popup__body').data('response');
        console.log(data);
        
        payload = { location: data.body.location, postLat:  data.body.locationLat, postLong:  data.body.locationLng};
        
        manageSecondary('show', 'find_posts', payload);
        renderFeed(data, '#secondary .secondary__tab:last-child .drawerBody .feed__box');
	});
	
	jQuery(document).on('click', '.flightsDiscount__header-container.findBuddy', function () {
		jQuery('.desktopMenu-experiencesApp.desktopMenu-item').click();
		jQuery('#footer ul li[data-item="addPost"]').removeClass('active');
		jQuery('.experiences__page').animate({scrollTop: 0}, 300);
	});
    
    
}

function chatActions() {
    
    jQuery(document).on('click', '.refresh_chat', function () {
		if (!localStorage.getItem('chat__open')) {
			localStorage.setItem('chat__open', 'true');
		}
        jQuery(this).hide();
        toast('Refreshing Chats');
		jsInit('getDeltaDataChats', '', 'refreshChat'  );
		
	});
    
	//Open Single Chat
	jQuery(document).on('click', '.chat__item', function () {

        getChatDataFromIndexedDb('groupUsers').then(groupData => {
            //androidCodesForUpdated(); // MoEngage For Android
            //setUserDataWeb(); // Moengage for Web

            //Get the chat id
            chatId = jQuery(this).attr('data-chat-id');
            userId = jQuery(this).attr('data-chat-user');
            userName = jQuery(this).attr('data-chat-userName');
            isAccepted = jQuery(this).attr('data-isaccepted');
            isRejected = jQuery(this).attr('data-rejected');
            chatType = jQuery(this).attr('data-chat-type');
            groupAdminId = '';
            if (chatType == 'group') {
                groupAdminId = jQuery(this).attr('data-created-by');
            }

            dbChatId = Number(jQuery(this).attr('data-dbChatId'));
            
            stopClickFlow = false; // Flag to indicate when to stop the click flow
            if (groupData.length > 0) {
                console.log('Group Data');
                for (element of groupData) {
                    if (element.groupId == chatId) {
                        if (element.members) {
                            // Convert element.members to array
                            element.members = Object.values(element.members);
                            element.members.forEach(member => {
                                if (member.isRequested == '0' && member.uid == manageUserProfile('read', 'plainUserId')) {
                                    toast('Please wait for the Admin to accept your request');
                                    stopClickFlow = true; // Set the flag to stop the click flow
                                    return;
                                
                                }
                            });
                            if (stopClickFlow) break; // Check the flag and break the for loop if true
                        }
                    }
                }
            }
            
            if (stopClickFlow) {
                return;
                // Code to stop the click flow
            }
            singleChatMessageLastChild = jQuery(this).attr('data-timestamp');
            timeData = singleChatMessageLastChild.toString().length === 13 ? (singleChatMessageLastChild / 1000) : singleChatMessageLastChild;
            
            // setTimeout(() => {
            if (Number(singleChatMessageLastChild) != NaN) {
                jsInit('updateChatFlags', { chatId: chatId, optionType: 'seen', timeStamp: timeData });
            }

            try {
                payload = { chatId: chatId, userId: userId, userName: userName, isAccepted: isAccepted, isRejected: isRejected, chatType: chatType, openedBy: manageUserProfile('read', 'plainUserId') };
                // if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
                //     Moengage.track_event('TBD_CHAT_ITEM_OPENED', payload);
                // }
                // if (isAndroid()) {
                //     Android.moEngageData('TBD_CHAT_ITEM_OPENED', JSON.stringify(payload));
                // }
            } catch (err) {
                console.log(err);
            }
            
            
            singleChatContainer = jQuery('.singleChat__container');
            singleChatContainer.attr('data-chat-id', chatId);
            singleChatContainer.attr('data-chat-user', userId);
            singleChatContainer.attr('data-isaccepted', isAccepted);
            singleChatContainer.attr('data-isReadOnly', jQuery(this).attr('data-isreadonly'));
            singleChatContainer.attr('data-cohortid', jQuery(this).attr('data-cohortid'));

            openSingleChat(userId, userName, chatId, jQuery(this).find('.css-3i9vrz img').attr('src'), isAccepted, isRejected, chatType, groupAdminId);
            loaderMain('singleChat', true);
            jsInit('fetchChatMessages', { chatId: chatId, userId: userId, chatType: chatType }, {chatId: chatId, chatType: chatType });
            jQuery(this).find('.css-1h2atly').html('').attr('data-new-messages', '0');

            //Desktop
            jQuery('.chat__item').removeClass('active');
            jQuery(this).addClass('active');

            if (jQuery(this).attr('data-isreadonly') == 'true') {
                jQuery('.input-box').hide();
                jQuery('.send-msg-btn').hide();
                jQuery('.singleChat__more-options').hide();
            }
            else {
                jQuery('.input-box').show();
                jQuery('.send-msg-btn').show();
                jQuery('.singleChat__more-options').show();
            }
        });

	});

	//Open User Chat
	jQuery(document).on('click', '.profile__chat, .create__chat-single__users .profile-row', function () {
		if (!guestMaster()) {
			if (jQuery(this).hasClass('profile__chat')) {
					destroyAllSecondaryTabs();
			}
			console.log('Opening Chat');
			source = jQuery(this).attr('data-source');

			if (source == 'start_a_new_chat') {
				if (jQuery(this).hasClass('profile-row')) {
					profileRow = jQuery(this);
				}
				else {
					profileRow = jQuery(this).parents('.profile-row');
				}

				userId = jQuery(profileRow).attr('data-user-id');
				userName = jQuery(profileRow).attr('data-userName');
				profileImage = jQuery(profileRow).attr('data-profileimage');
			}
			else {
				userId = jQuery(this).parents('.profile__page').attr('data-user');
				userName = jQuery(this).parents('.profile__page').attr('data-userName');
				profileImage = jQuery(this).parents('.profile__page').attr('data-profileimage');
			}

			//Create a user Node
			//manageUserChat('initializeNode');

			//Initiate the chat
			jsInit('initiateChat', { chatType: 'personal', other: { userId: userId, userName: userName, profileImage: profileImage }, self: { userName: manageUserProfile('read', 'name'), profileImage: manageUserProfile('read', 'profilePic') } });
			
			var data = {
				userId: userId,
				userName: userName,
				profileImage: profileImage
			}
			queryString = Object.keys(data)
							.map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
							.join('&');
			console.log("Query String: ", queryString);
			openNewChat('dmChatRedirect=' + queryString);

			//Open the chat page
			//jQuery('.desktopMenu-chat').click();
			//openSingleChat(userId, userName, '', profileImage, 'true', '', 'personal');

			//Close the search
			jQuery('.search-buddy-input').val('');

			if (jQuery(this).hasClass('profile__chat')) {
				destroyAllSecondaryTabs();
			}

			removeActiveClassFromMain();
			jQuery('#main__chat-box').addClass('active');

		}
		else {
			renderBottomSheet('', 'loginNew');
		}
	});

	//Back Button
	jQuery(document).on('click', '.singleChat__back svg, .singleChat__back .css-1f7kf0v', function () {
		jQuery('.singleChat__container').hide('slide', { direction: 'right' }, 300);

		if (jQuery(this).parents('.singleChat__container').length > 0) {
			jQuery('.chats__container').removeClass('open');
			showHideFooterMenu('show');
			jQuery('.chat__item').removeClass('active');
		}

		window.history.pushState('', '', '/newChat');
	});

	//Single Chat Name redirect to Profile
	jQuery(document).on('click', '.singleChat__name', function () {
		chatType = jQuery(this).parents('.singleChat__container').attr('data-chat-type');
		plainUserId = jQuery(this).parents('.singleChat__container').attr('data-chat-user');

		if (chatType == 'personal' && plainUserId !== undefined) {
            if (plainUserId.length < 15) {
			    jsInit('openProfileFromChat', { userId: plainUserId });
                loaderMain('global', true);
            }
            else {
                redirect('profile', plainUserId);
            }
			
		}
	});

	//Long Press on Chat Item
	jQuery(document).on('press', '.singleChat__message', function (e) {
		jQuery(this).addClass('highlighted');
		othersMessage = (jQuery(this).hasClass('otherMessage')) ? true : false;
		renderChat('renderMessageOptions', jQuery(this).attr('data-type'), othersMessage);
	});

	//On Click of Message Option
	jQuery(document).on('click', '.chat-press-unit-box', function () {
		jQuery(this).parents('.singleChat__message').removeClass('highlighted');

		item = jQuery(this).attr('data-item');
		parent = jQuery(this).parents('.singleChat__message');

		if (item == 'delete') {
			console.log('Delete Message');

			obj = { optionType: 'deleted', timeStamp: jQuery(parent).attr('data-timestamp'), chatId: jQuery('.singleChat__container').attr('data-chat-id') };
			jsInit('updateChatFlags', obj);

			//Delete Message
			jQuery(this).parents('.singleChat__message').find('.text-msg-box span').html('<span class="text-msg-deleted">This message was deleted</span>');
			jQuery(this).parents('.singleChat__message').attr('data-deleted', 'true');
		}
		else if (item == 'copy') {
			console.log('Copy Message');

			//Copy Message
			text = jQuery(this).parents('.singleChat__message').find('.text-msg-box span').text();
			copyToClipboard(text);

			toast('Message copied to clipboard');
		}
		else if (item == 'star') {
			console.log('Star Message');

			obj = { optionType: 'starred', timeStamp: jQuery(parent).attr('data-timestamp'), chatId: jQuery('.singleChat__container').attr('data-chat-id') };
			jsInit('updateChatFlags', obj);

			//Star Message
			jQuery(this).parents('.singleChat__message').attr('data-starred', 'true');
			jQuery(this).parents('.singleChat__message').find('.text-msg-timing-parent p span.text-msg-starred').remove();
			jQuery(this).parents('.singleChat__message').find('.text-msg-timing-parent p').prepend('<span class="text-msg-starred">' + icons.star + '</span>');
		}

		jQuery('.css-o8ybtd').remove();
	});

	//Close the message options on click of overlay
	jQuery(document).on('click', '.css-o8ybtd-overlay', function () {
		jQuery(this).parents('.singleChat__message').removeClass('highlighted');
		jQuery(this).parents('.css-o8ybtd').remove();
	});

	//Open Utillity Bar
	jQuery(document).on('click', '.open__utillityBar', function () {
		// jQuery('.plus-bar-content').css('display', 'flex');
		//if (manageUserProfile('read', 'isVerified')) {
		if (true) {
			jQuery('.plus-bar-box').show();
		}
		else {
			redirect('premium');
			toast('Please upgrade to a premium membership with Travel Buddy to unlock this feature.');
		}
	});

	//Close Utillity Bar w/ Overlay
	jQuery(document).on('click', '.plus-bar-overlay', function () {
		jQuery('.plus-bar-box').hide();
        jQuery('.emojis__container').hide();
        jQuery('#emojiPicker').removeClass('active');
	});

	//On Click of Utillity Bar Option
	jQuery(document).on('click', '.chatUtillity__item', function () {
		item = jQuery(this).attr('data-item');

		if (item == 'gallery') {
			//Change the input type to gallery
			jQuery('#selectImgInput').removeAttr('capture', '').removeAttr('accept', '');
			jQuery('#selectImgInput').click();
		}
		else if (item == 'camera') {
			//Change the input type to camera. Accept both image and video
			jQuery('#selectImgInput').attr('capture', 'camera').attr('accept', 'image/*');
			jQuery('#selectImgInput').click();
		}
		else if (item == 'document') {
			jQuery('#selectDocumentsInput').click();
		}
		else if (item == 'video') {
			console.log('camera');
			jQuery('#selectImgInput').attr('capture', 'video').attr('accept', 'video/*');
			jQuery('#selectImgInput').click();
		}

		// jQuery(this).parents('.plus-bar-content').css('display', 'none');
		jQuery('.plus-bar-box').hide();
	});

	//Send Message
	jQuery(document).on('submit', '#chatMessage-form', function (a_obj) {
		a_obj.preventDefault();
		formData = jQuery(this).serializeArray();
		console.log(formData);
		if (formData[0].value != '' || formData[0].value != null || formData[0].value != undefined) {
			timeStamp = new Date().getTime();
			chatObj = { chatType: jQuery(this).parents('.singleChat__container').attr('data-chat-type'), chatId: jQuery(this).parents('.singleChat__container').attr('data-chat-id'), senderId: localStorage.getItem('plainUserId'), isSentByCurrentUser: true, timeStamp: (Number(timeStamp) / 1000).toFixed(0), message: formData[0].value, userId: jQuery(this).parents('.singleChat__container').attr('data-chat-user'), type: "text" };
			console.log(chatObj);
			payload = {
				'receiverID': jQuery(this).parents('.singleChat__container').attr('data-chat-user'),
				'receiverName': jQuery(this).parents('.singleChat__container').find('.appBar .userName').text(),
				'senderID': manageUserProfile('read', 'userId'), //
				'senderName': manageUserProfile('read', 'name'),
				'senderRating': manageUserProfile('read', 'rating'),
				'messageDescription': formData[0].value,
				'messageTime': new Date($.now()).toLocaleTimeString(),
			}
			// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
			// 	Moengage.track_event('TBD_MSG_SEND', { payload });
			// }
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_MSG_SEND', JSON.stringify({ payload }));
			// }
			//Send the message to the server
			jsInit('postChatMessage', chatObj);
			//Clear the input
			jQuery(this).find('#chat-postMessage').val('');
			//Scroll to bottom
			jQuery('.singleChat__box').animate({ scrollTop: jQuery('.singleChat__messages').prop('scrollHeight') }, 300);
			//Add the message to the chat
			renderChatMessage('.singleChat__box', chatObj, true);
		}
	});

	//Send Message Button
	jQuery(document).on('click', '.send-msg-btn', function () {
		if (manageUserProfile('read', 'isVerified') == '' || manageUserProfile('read', 'isVerified') == '0' || manageUserProfile('read', 'isVerified') == 'false' || !manageUserProfile('read', 'isVerified')) {
			jQuery('.singleChat__container').find('.css-1n2mv2k').append('<div class="chat__rejected-msg"><div class="chat__premium-image-holder"><img src="/view/assets/img/chat_go_premium.webp" alt="Description"></div></div>');
		}
		jQuery('#chatMessage-form').submit();
		fbEvent('send_message');
	});

	//Image Popup
	jQuery(document).on('click', '.chat_message-media', function () {
		console.log('Image Clicked');
		img = jQuery(this).attr('data-original');
		video = jQuery(this).find('video').attr('src');

		if (img) {
			jQuery('.singleChat__zoomIn-img').html('<img src="' + img + '" />');
			jQuery('.singleChat__zoomIn').fadeIn();
		}

		if (video) {
			jQuery('.singleChat__zoomIn-img').html('<video controls mute autoplay loop playsinline><source src="' + video + '" type="video/mp4"></video>');
			jQuery('.singleChat__zoomIn').fadeIn();
		}
	});

	//Close Image Popup
	jQuery(document).on('click', '.singleChat__zoomIn-overlay', function () {
		jQuery('.singleChat__zoomIn').fadeOut();
		jQuery('.singleChat__zoomIn-img').empty();
	});

	//Accept Chat Request or Decline Chat Request
	jQuery(document).on('click', '.singleChat__container button.accept-btn, .singleChat__container button.decline-btn', function () {
		chatId = jQuery(this).parents('.singleChat__container').attr('data-chat-id');
		userId = jQuery(this).parents('.singleChat__container').attr('data-chat-user');

		if (jQuery(this).hasClass('accept-btn')) {
			type = 'accepted';
		}
		else {
			type = 'rejected';
		}

		jsInit('acceptChatRequest', { chatId: chatId, userId: userId, optionType: type });
	});

	//Group Chat - Add Users
	jQuery(document).on('click', '.create__chat-group__users .profile-row, .create__chat-group__users-search .profile-row', function () {
		console.log('User Clicked');

		if (jQuery(this).hasClass('active')) {
			jQuery(this).removeClass('active');

			//Uncheck the checkbox
			jQuery(this).find('input[type="checkbox"]').prop('checked', false);

			//Remove user from the selected Users list
			jQuery('.createGroupChat__selectedUser[data-user-id-string="' + jQuery(this).attr('data-user-id-string') + '"]').remove();

			//Also remove the user from the stepTwo list
			jQuery('.createGroup-SelectedUsers .profile-row[data-user-id-string="' + jQuery(this).attr('data-user-id-string') + '"]').remove();

			//Update the selected users count
			count = Number(jQuery('.createGroupChat__selectedUser').length);
		}
		else {
			if (jQuery('.createGroupChat__selectedUser').length < 100) {
				// Need to revisit this logic as this results in selecting multiple users with different name
				jQuery('.profile-row[data-user-id-string="' + jQuery(this).attr('data-user-id-string') + '"]').each(function () {
					jQuery(this).addClass('active');
				});

				//Check the checkbox
				jQuery(this).find('input[type="checkbox"]').prop('checked', true);

				if (jQuery('.createGroupChat__selectedUser[data-user-id-string="' + jQuery(this).attr('data-user-id-string') + '"]').length == 0) {
					//Add user to the selected Users list
					jQuery('.css-1ljafgy').append('<div class="createGroupChat__selectedUser" data-user-id-string="' + jQuery(this).attr('data-user-id-string') + '" data-user-id="' + jQuery(this).attr('data-user-id') + '"><div class="css-mqhbsm"><img alt="' + jQuery(this).find('.userName').html() + '" src="' + jQuery(this).find('.css-154ogbs img').attr('src') + '" class="css-1hy9t21"></div><p class="selectects-avatar-name css-9l3uo3">' + jQuery(this).find('.userName').html() + '</p></div>');

					//Also add the user to the stepTwo list
					jQuery('.createGroup-SelectedUsers').append('<div class="profile-row css-114g8ka" data-user-id-string="' + jQuery(this).attr('data-user-id-string') + '" data-user-id="' + jQuery(this).attr('data-user-id') + '" data-username="' + jQuery(this).attr('data-username') + '" data-user-dp="' + jQuery(this).attr('data-profileimage') + '"><div class="css-f6loyt"><div class="css-154ogbs"><img src="' + jQuery(this).find('.css-154ogbs img').attr('src') + '"></div><div class=""><p class="userName css-1aa5ap6">' + jQuery(this).find('.userName').html() + '</p></div></div></div>');

					//Also check the main list to see if the user is already selected
					jQuery('.create__chat-group__users .profile-row[data-user-id-string="' + jQuery(this).attr('data-user-id') + '"]').addClass('active');

					//Update the selected users count
					count = Number(jQuery('.createGroupChat__selectedUser').length);
				}
			}
		}

		jQuery('.createGroup__members').attr('data-count', count).html(count + '/100 Selected');
		jQuery('.createGroupChat-stepTwo .select-buddies-text').attr('data-count', count).html('Buddies Added : ' + count + '/100');
	});


	//Group Chat - Add Users - Search
	jQuery(document).on('keyup', '.createGroupChat-stepOne .search-buddy-input, .startNewChat__container .search-buddy-input', function (event) {
		event.preventDefault();
        
        clearTimeout(timeout);

		timeout = setTimeout(() => {
			search = jQuery(this).val();

            if (search.length > 2) {
                jsInit('fetchFollowers', { userId: manageUserProfile('read', 'userId'), pageNumber: 0, type: 0, userName: search }, 'searchGroupChat');

                //Hide the users list & show the search div
                jQuery('.createGroupChat-stepOne .create__chat-group__users').hide();
                jQuery('.create__chat-single__users').hide();
                jQuery('.createGroupChat-stepOne .create__chat-group__users-search').show();
                jQuery('.create__chat-single__users-search').show();

                //Change the search icon to close icon
                jQuery('.createGroupChat-stepOne .search-buddy-icon').html(icons.close);
            }
            else {
                //Show the users list & hide the search div
                jQuery('.createGroupChat-stepOne .create__chat-group__users').show();
                jQuery('.create__chat-single__users').show();
                jQuery('.createGroupChat-stepOne .create__chat-group__users-search').hide();
                jQuery('.create__chat-single__users-search').hide();

                //Change the close icon to search icon
                jQuery('.createGroupChat-stepOne .search-buddy-icon').html(icons.searchBar);
            }
		}, 500);
		
	});

	//Next Button Create Group Chat
	jQuery(document).on('click', '.createGroupChat-stepOne .sticky-next-btn button', function (e) {
		e.preventDefault();

		if (jQuery('.createGroupChat__container').attr('data-step') == 'addGroupMembers') {
			console.log('Add Group Members');
			groupId = jQuery('.singleChat__container').attr('data-chat-id');
			groupName = jQuery('.singleChat__container .userName').text();
			groupProfileUrl = jQuery('.singleChat__container').find('.css-1f7kf0v img').attr('src');
            adminId = jQuery('.singleChat__container').attr('data-admin-id');
            adminUserName = jQuery('.css-1ljafgy > .createGroupChat__selectedUser:first-child .selectects-avatar-name').text();
            console.log(adminUserName);
            
            groupMembers = [];
            groupMembersInfo = {};

            jQuery('.createGroup-SelectedUsers .profile-row').each(function () {
                groupMembers.push(jQuery(this).attr('data-user-id'));
                groupMembersInfo[jQuery(this).attr('data-user-id')] = { userName: jQuery(this).attr('data-username'), profilePic: jQuery(this).attr('data-user-dp') };
            });
            
            console.log(groupMembersInfo);

            groupMembersData = { isfindBuddyGroup: false, groupId: groupId, newMemberIds: groupMembers, groupMembersInfo: groupMembersInfo, data: { createdById: adminId, createdBy: adminUserName, groupName: groupName, groupProfileUrl: groupProfileUrl, groupLastMessage: "", senderId: localStorage.getItem('plainUserId'), lastMessageSenderName: "", isDeleted: false, chatType: "group" } };
            console.log(groupMembersData);

            jsInit('addUsersToGroup', groupMembersData, 'addUsersToGroupLater');
			
		}
		else {
			if (Number(jQuery('.createGroup__members').attr('data-count')) > 2) {
				//Step 1 Slide Out Left & Step 2 Slide In Left
				jQuery('.createGroupChat-stepOne').hide('slide', { direction: 'left' }, 300);
				jQuery('.createGroupChat-stepTwo').show('slide', { direction: 'right' }, 300);

				window.history.pushState('', '', '/chat/start-new-chat/group-chat/step-two');
			}
			else {
				toast('Please add at least 3 users<br> to create a group chat');
			}
		}
	});

	//Open Start a new chat
	jQuery(document).on('click', '.css-w017iw', function () {
		jQuery('.startNewChat__container').show('slide', { direction: 'right' }, 300);
		jQuery('.singleChat__container').hide('slide', { direction: 'right' }, 300);
		jQuery('.chats__container').addClass('open');
		showHideFooterMenu('hide');

		//Fetch the followers
		jsInit('fetchFollowers', { userId: manageUserProfile('read', 'userId'), pageNumber: 0, type: 0 }, 'groupChat');

		jQuery('.startNewChat__container .create__chat-group__users').html('');

		//Remove the /chat/'chat-id' from the history
		window.history.pushState('', '', '/chat/start-new-chat');
        
        jQuery('#all, #personal, #groups').removeClass('clicked__tab');
        jQuery('#all').addClass('clicked__tab');
	});

	//Close Start a new chat
	jQuery(document).on('click', '.startNewChat__container .css-k008qs span', function () {
		jQuery('.startNewChat__container').hide('slide', { direction: 'right' }, 300);
		jQuery('.chats__container').removeClass('open');
		showHideFooterMenu('show');

		window.history.pushState('', '', '/newChat');
		console.log(window.history);
	});

	//Open Create Group Chat
	jQuery(document).on('click', '.startNewChat__container .css-w017iw', function () {
		// if (!manageUserProfile('read', 'isVerified')) {
		// 	redirect('premium');
		// 	toast('Please upgrade to a premium membership with Travel Buddy to unlock this feature.');
		// 	return false;
		// }

		jQuery('.createGroupChat__container').show('slide', { direction: 'right' }, 300).removeAttr('data-step');
		jQuery('.singleChat__container').hide('slide', { direction: 'right' }, 300);
		jQuery('.chats__container').addClass('open');
		showHideFooterMenu('hide');

		jQuery('.createGroupChat__selectedUser.noHarm').each(function () {
			jQuery(this).remove();
		});

		window.history.pushState('', '', '/chat/start-new-chat/group-chat');
	});

	//Create Group Chat, Step One - Back Button
	jQuery(document).on('click', '.createGroupChat-stepOne .css-k008qs svg', function (e) {
		e.preventDefault();
		jQuery('.createGroupChat__container').hide('slide', { direction: 'right' }, 300);

		//Check if singleChat__container is open
		if (jQuery('.singleChat__container').css('display') !== 'block') {
			jQuery('.chats__container').removeClass('open');
			showHideFooterMenu('show');
		}

		window.history.pushState('', '', '/chat/start-new-chat');
	});

	//Create Group Chat, Step Two - Back Button
	jQuery(document).on('click', '.createGroupChat-stepTwo .css-k008qs svg', function (e) {
		e.preventDefault();

		jQuery('.createGroupChat-stepTwo').hide('slide', { direction: 'right' }, 300);
		jQuery('.createGroupChat-stepOne').show('slide', { direction: 'left' }, 300);

		window.history.pushState('', '', '/chat/start-new-chat/group-chat/');
	});

	//Create Group Chat, Step Two - Create Group Chat
	jQuery(document).on('click', '.creategroup-btn', function (e) {
		e.preventDefault();

		if (jQuery('.createGroup-SelectedUsers:has(div)').length > 0) {
			if (jQuery('.add-grp-name-input').val() !== '') {
				if (jQuery('.groupPhoto-uploading').length == 0) {
					stage = jQuery(this).attr('data-stage');
					console.log(stage);

					if (stage == '1') {
						console.log('Create Group Chat');

						//Loader
						loaderMain('createGroupChat', true);

						groupName = jQuery('.add-grp-name-input').val();
						groupName = groupName.trim();
						// Check if group name is less than 32 characters
						if (groupName.length > 32) {
							toast('Group name should be less than 32 characters');
							return;
						}
						groupProfileUrl = jQuery('#createGroupChat__dp').attr('value');

						jsInit('initiateChat', { createdBy: manageUserProfile('read', 'name'), groupName: groupName, groupProfileUrl: groupProfileUrl, groupLastMessage: "", senderId: "", lastMessageSenderName: "", isDeleted: false, chatType: "group" }, 'groupChat');
					}
					else if (stage == '2') {
						groupId = jQuery(this).attr('data-group-id');
						groupMembers = [];
                        groupMembersInfo = {};

						jQuery('.createGroup-SelectedUsers .profile-row').each(function () {
							groupMembers.push(jQuery(this).attr('data-user-id'));
                            groupMembersInfo[jQuery(this).attr('data-user-id')] = { userName: jQuery(this).attr('data-username'), profilePic: jQuery(this).attr('data-user-dp') };
						});
						
						console.log(groupMembersInfo);
						console.log(groupMembers);

						groupMembersData = { isfindBuddyGroup: false, groupId: groupId, newMemberIds: groupMembers, groupMembersInfo: groupMembersInfo, data: { createdById: localStorage.getItem('plainUserId'), createdBy: manageUserProfile('read', 'name'), groupName: groupName, groupProfileUrl: groupProfileUrl, groupLastMessage: "", senderId: localStorage.getItem('plainUserId'), lastMessageSenderName: "", isDeleted: false, chatType: "group" } };
						console.log(groupMembersData);

						jsInit('addUsersToGroup', groupMembersData, 'addUsersToGroup');
						cleanStartAGroupChat();
					}
				}
				else {
					toast('Please wait while the image is uploading');
				}
			}
			else {
				toast('Please enter a group name');
			}
		}
		else {
			toast('No Users selected to create a group chat');
		}
	});

	//Select Group Display Picture
	jQuery(document).on('click', '.css-1d3go38', function () {
		jQuery('#create-grp-profile').click();
	});

	//On Change of Group Display Picture
	jQuery(document).on('change', '#create-grp-profile', function () {
		if (jQuery(this).val() !== '') {
			jQuery('.css-1d3go38').html('<img src="' + URL.createObjectURL(jQuery(this)[0].files[0]) + '" />');
			jQuery('.css-1d3go38').addClass('groupPhoto-uploading');
		}

		uploadData = new FormData();
		uploadData.append('uploaded_files', jQuery(this)[0].files[0]);

		//Upload the image
		jsUpload('groupChatImage', uploadData);
	});


	//Single Chat More Options
	jQuery(document).on('click', '.singleChat__more-options span', function () {
		jQuery('.singleChat__options-box').fadeIn();
	});

	//Single Chat More Options - Close
	jQuery(document).on('click', '.singleChat__options-overlay', function () {
		jQuery('.singleChat__options-box').fadeOut();
	});

	//Single Chat More Options - Click on option
	jQuery(document).on('click', '.singleChat__options-box .singleChat__options ul li', function () {
		option = jQuery(this).attr('data-option');
		chatId = jQuery('.singleChat__container').attr('data-chat-id');
		userId = jQuery('.singleChat__container').attr('data-chat-user');
		chatType = jQuery('.singleChat__container').attr('data-chat-type');

		if (option == 'block') {
			if (chatType !== 'group') {
				renderPermissionBox('init', 'Block User Chat');
			}
		}
		else if (option == 'unblock') {
			if (chatType !== 'group') {
				jsInit('acceptChatRequest', { chatId: chatId, userId: userId, optionType: 'accepted' });
			}
		}
		else if (option == 'report') {
			renderReportBox('init', jQuery(this).parents('.singleChat__container').attr('data-chat-user'), 'chat');
		}
		else if (option == 'leavegroup') {
			renderPermissionBox('init', 'leaveGroupChat');
		}

		jQuery('.singleChat__options-box').fadeOut();
	});

	//Open Group Chat Members
	jQuery(document).on('click', '.singleChat__container[data-chat-type="group"] .css-1q69km9, .singleChat__container[data-chat-type="group"] .css-h1trg1', function () {
		jQuery('.group__members-section').show('slide', { direction: 'right' }, 300);
		window.history.pushState('', '', window.location.pathname + "/groupInfo");

		groupName = jQuery('.singleChat__container').find('.userName').text();
		groupImage = jQuery('.singleChat__container').find('.css-1f7kf0v img').attr('src');

		//Add the group name & image
		jQuery('.group__members-section .css-1rv0dd6 img').attr('src', groupImage);
		jQuery('.group__members-name span.groupName__span').text(groupName);
		jQuery('.group__members-name input').attr('value', groupName);

		//Fetch all the group members
        groupId = jQuery('.singleChat__container').attr('data-chat-id');
		//membersList = manageUserChat('read', { userId: userId, chatId: chatId }, 'All');
        
        // Convert groupData array to an object indexed by groupId for easier access
            
        // Fetch group data from IndexedDB
        getChatDataFromIndexedDb('groupUsers').then(groupData => {
            // Convert the fetched array into an indexed object by groupId
            groupDataIndexed = groupData.reduce((acc, group) => {
                acc[group.groupId] = group;
                return acc;
            }, {});
            
            // Map the members data to Array of objects
            renderChat('renderGroupChatMembers', groupDataIndexed[groupId].members);

        });

	});

	//Group Chat Members - Back Button
	jQuery(document).on('click', '.group__members-section .css-k008qs', function () {
		jQuery('.group__members-section').hide('slide', { direction: 'right' }, 300);
		window.history.pushState('', '', window.location.pathname.replace('/groupInfo', ''));
	});

	//Open Profile from Group Chat Members
	jQuery(document).on('click', '.group__members-box .profile-row .css-f6loyt', function () {
		userId = jQuery(this).parents('.profile-row').attr('data-user-id-string');
		window.history.pushState('', '', '/');
		redirect('profile', userId);
	});

	//Group Member Options
	jQuery(document).on('click', '.group__members-actions-box-item', function () {
		option = jQuery(this).attr('data-option');

		if (option == 'deleteGroupChat') {
			renderPermissionBox('init', 'deleteGroupChat');
		}
		else if (option == 'leaveGroupChat') {
			renderPermissionBox('init', 'leaveGroupChat');
		}
		else if (option == 'shareGroupChat') {
			console.log('Share Group Chat');
			url = new URL(window.location.href);
			pathParts = url.pathname.split('/');
			groupId = pathParts[2]; // This will be 'Group Id'

			// check the child div of group__members-box and check which div has class isAdmin and get the attr data-username
			jQuery('.group__members-box .profile-row').each(function () {
				if (jQuery(this).hasClass('group__member-isAdmin')) {
					// get the username of the admin
					adminName = jQuery(this).attr('data-username');
				}
			});

			// get the group image
			imageUrl = jQuery('.group__members-section .css-1rv0dd6').find('img').attr('src');

			startIndex = imageUrl.indexOf('uploads');
			newImageUrl = imageUrl.substring(startIndex);

			if (adminName !== undefined && groupId !== undefined && jQuery('.chat__item.active').attr('data-created-by') !== undefined) {
				link = 'link=' + 'https://beatravelbuddy.com/detect.php?t=groupid-' + groupId + '-' + encodeURIComponent(jQuery('.groupName__span').text()) + '-' + encodeURIComponent(adminName) + '-' + newImageUrl + '-' + encodeURIComponent(jQuery('.chat__item.active').attr('data-created-by'));
			}
			else {
				toast('There was an error while sharing the group chat. Please try again later.');
				return;
			}

			console.log(link);

			linkText = 'Join my group ' + jQuery('.groupName__span').text() + ' on TravelBuddy and be a part of some amazing plans and experiences. ';

			shareLinkText = "https://link.beatravelbuddy.com/?" + link +
				"&apn=" + "com.beatravelbuddy.travelbuddy" +
				"&st=" + "TravelBuddy" +
				"&sd=" + linkText +
				"&si=" + encodeURIComponent(imageUrl);

			if (isAndroid() || isIOS()) {
				createDeepLink('group', link, imageUrl, false, false, linkText);
			}
			else {
				createDynamicLink('copy', { 'longDynamicLink': shareLinkText }, linkText);
			}
		}
	});

	//Trigger the group display picture input
	jQuery(document).on('click', '.group__members-edit__profile', function () {
		jQuery('#groupMembers-Profile').click();
	});

	//Remove Group Member
	jQuery(document).on('click', '.group__members-box .profile-row .group__members-remove__user', function () {
		jQuery('.group__members-section').attr('data-remove-member', jQuery(this).parents('.profile-row').attr('data-user-id'));
		renderPermissionBox('init', 'removeGroupMember');
	});

	//On change of the group display picture
	jQuery(document).on('change', '#groupMembers-Profile', function () {
		//Change the image for the singleChat__container, group__members-section and the chat__item
		imageUrl = URL.createObjectURL(event.target.files[0]);
		jQuery('.group__members-section .css-1rv0dd6').find('img').attr('src', imageUrl);
		jQuery('.chat__item.active .css-3i9vrz img').attr('src', imageUrl);
		jQuery('.singleChat__container .css-1f7kf0v img').attr('src', imageUrl);

		//Make the API call to update the group display picture
		uploadData = new FormData();
		uploadData.append('uploaded_files', jQuery(this)[0].files[0]);

		//Upload the image
		jsUpload('groupChatImage', uploadData, 'groupMembers');
	});

	//Open Single Post from Chat
	jQuery(document).on('click', '.chat-message-share-box, .chat-message-share .chat-message-post-ctas, .chat-message-find__buddy-box, .chat-message-find_buddy .chat-message-post-ctas', function () {
		postId = jQuery(this).parents('.chat-message-post').attr('data-post-id');
		redirect('post', postId);
	});

	//Open Single Profile from post message - chat
	// @juzer09 this cannot be done because ID is unencrypted
	jQuery(document).on('click', '.chat-message-author', function () {
		authorId = jQuery(this).attr('data-author');
		redirect('profile', authorId);
	});

	// Click on Experiences shared in Chat
	jQuery(document).on('click', '.chat-message-experience', function () {
		postId = jQuery(this).attr('data-post-id');
		redirect('singleExperience', { id: postId, title: '', url: '' });

	});

	// Click on Services shared in Chat
	jQuery(document).on('click', '.chat-message-service', function () {
		postId = jQuery(this).attr('data-post-id');
		redirect('singleService', postId);

	});

	// Click on Profile shared in Chat
	jQuery(document).on('click', '.chat__message-profile', function () {
		postId = jQuery(this).attr('data-profile');
		redirect('profile', postId);
	});

	//Change the group name
	jQuery(document).on('click', '.group__members-name span.edit__groupName', function () {
		console.log('Edit Group Name');
		jQuery(this).parents('.group__members-name').find('span.groupName__span').hide();
		jQuery(this).parents('.group__members-name').find('input').show();
		jQuery(this).parents('.group__members-name').find('input').attr('type', 'text');
		jQuery(this).parents('.group__members-name').find('input').focus();

		jQuery(this).attr('class', 'save__groupName').html(icons.tick);
	});

	//Save the group name
	jQuery(document).on('click', '.group__members-name span.save__groupName', function () {
		jQuery(this).parents('.group__members-name').find('form#groupName').submit();
	});

	//Save the group name - Submit
	jQuery(document).on('submit', 'form#groupName', function (e) {
		e.preventDefault();
		groupName = jQuery(this).parents('.group__members-name').find('input').val();
		groupId = jQuery('.singleChat__container').attr('data-chat-id');

		if (groupName !== '') {
			jsInit('updateGroupLabel', { groupId: groupId, groupName: groupName });

			//Update the group name in the UI
			jQuery(this).parents('.group__members-name').find('span.groupName__span').show();
			jQuery(this).parents('.group__members-name').find('input').hide();
			jQuery(this).parents('.group__members-name').find('input').attr('type', 'hidden');

			jQuery(this).parents('.group__members-name').find('span.save__groupName').attr('class', 'edit__groupName').html(icons.edit);
		}
		else {
			toast('Please enter a group name');
		}
	});

	jQuery(document).on('click', '.influencer__item-right', function () {
		// if (!manageUserProfile('read', 'isVerified')) {
		// 	redirect('premium');
		// 	toast('Please upgrade to a premium membership with Travel Buddy to unlock this feature.');

		// 	destroyAllSecondaryTabs();

		// 	setTimeout(function () {
		// 		loaderMain('secondary', false);
		// 	}, 100);

		// 	return false;
		// }

		console.log('Connect');
		//Create a user Node
		manageUserChat('initializeNode');

		userId = jQuery(this).parents('.influencer__item').attr('data-user');
		userName = jQuery(this).parents('.influencer__item').find('.influencer__item-name').attr('data-name');
		profileImage = jQuery(this).parents('.influencer__item').find('.influencer__item-image img').attr('src');
		//Initiate the chat
		jsInit('initiateChat', { chatType: 'personal', other: { userId: userId, userName: userName, profileImage: profileImage }, self: { userName: manageUserProfile('read', 'name'), profileImage: manageUserProfile('read', 'profilePic') } });

		//Back click
		jQuery('#secondary .drawer__back').click();

		//Open the chat page
		jQuery('.desktopMenu-chat').click();
		openSingleChat(userId, userName, '', profileImage, true, '', 'personal');
	});

	//Open the premium page
	jQuery(document).on('click', '.chat__premium-image-holder', function () {
		redirect('premium');
	});


	//Open add group members from group chat members page
	jQuery(document).on('click', '.groupMembers-add', function () {
		groupId = jQuery('.singleChat__container').attr('data-chat-id');

		jQuery('.group__members-section').hide('slide', { direction: 'right' }, 300);
		jQuery('.createGroupChat__container').attr('data-step', 'addGroupMembers').show('slide', { direction: 'right' }, 300);

		//Remove any selected users
		jQuery('.create__chat-group__users .profile-row.active').each(function () {
			jQuery(this).click();
		});

		jQuery('.createGroupChat__selectedUser.noHarm').each(function () {
			jQuery(this).remove();
		});
        
        getChatDataFromIndexedDb('groupUsers').then(groupData => {
            // Convert the fetched array into an indexed object by groupId
            groupDataIndexed = groupData.reduce((acc, group) => {
                acc[group.groupId] = group;
                return acc;
            }, {});
            
            //groupMembers = manageUserChat('read', { userId: '', chatId: groupId }, 'All');
            groupMembers = groupDataIndexed[groupId].members;
            groupMembers = Object.keys(groupMembers).map(memberId => {
                return {
                    uid: memberId,
                    ...groupMembers[memberId]
                };
            });
            
            // Convert the groupMembers to Array of objects
            
            console.log(groupMembers);

            groupMembers.forEach(function (member) {
                if (!member.isRemoved) {
                    if (jQuery('.css-1ljafgy .createGroupChat__selectedUser').first().find('.selectects-avatar-name').text() !== member.userName) {
                        if (jQuery('.createGroupChat__selectedUser[data-user-id-string="' + member.uid + '"]').length == 0) {
                            jQuery('.css-1ljafgy').append('<div class="createGroupChat__selectedUser noHarm" data-user-id-string="' + member.uid + '" data-user-id="' + member.uid + '"><div class="css-mqhbsm"><img alt="' + member.userName + '" src="' + renderUserProfileImage(member.profilePic) + '" class="css-1hy9t21"></div><p class="selectects-avatar-name css-9l3uo3">' + member.userName + '</p></div>');
                        }
                    }
                }
            });
        });
	});
	
	jQuery(document).on('click', '.chat__message-sender-image', function () {
		plainUserId = jQuery(this).parents('.singleChat__message').attr('data-senderid');
		jsInit('openProfileFromChat', { userId: plainUserId });
		loaderMain('global', true);
	});
  
    jQuery(document).on('click', '.member-container_left-part', function () {
        console.log('Member Clicked');
        jsInit('openProfileFromChat', { userId: jQuery(this).attr('data-user-id') });
    });
    
    jQuery(document).on('click', '.action-button.accept-button, .action-button.decline-button', function () {
        actionType = jQuery(this).hasClass('accept-button') ? 'accepted' : 'declined';
        groupId = jQuery('.singleChat__container').attr('data-chat-id');
        userId = jQuery(this).closest('[data-user-id]').attr('data-user-id');
        userName = manageUserProfile('read', 'name');
        
        console.log(`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Button Clicked`, groupId, userId);
        jsInit('updateIsRequested', { groupId: groupId, userId: userId, optionType: actionType, userName: userName });
        // Remove the Div from the UI
        jQuery(this).closest('.member-container').remove();
        
        // Display toast based on the action type
        toastMessage = actionType == 'accepted' ? 'Request Accepted' : 'Request Declined';
        toast(toastMessage);
        drawerBox = document.getElementsByClassName('accept_decline_drawer')[0]; // Get the first element
        if (drawerBox) {
            hasMemberContainer = drawerBox.getElementsByClassName('member-container').length > 0;
            console.log(hasMemberContainer);
            if (!hasMemberContainer) {
                drawer('close');
            }
        }
    });
    
    jQuery(document).on('click', '#groups, #all, #personal', function () {
        type = this.id; // 'groups', 'all', or 'personal'
        htmlMap = {
            groups: groupChatsHtml,
            all: allChatsHtml,
            personal: personalChatsHtml
        };
        jQuery('.chats__container').html(htmlMap[type]);
        jQuery('#all, #groups, #personal').removeClass('clicked__tab');
        jQuery(this).addClass('clicked__tab');
    });
    
    jQuery(document).on('click', '#toggleEmojiPicker', function () {
        jQuery('.emojis__container').show();
        jQuery('#emojiPicker').toggleClass('active');
    });
    
    jQuery(document).on('click', '.select__emoji', function () {
        emoji = jQuery(this).text();
        jQuery('#chat-postMessage').val(jQuery('#chat-postMessage').val() + emoji);
    });
        
}

function cleanStartAGroupChat() {
	jQuery('.createGroupChat__container .profile-row').each(function () {
		jQuery(this).removeClass('active');
	});

	jQuery('.createGroupChat__selectedUser').each(function () {
		if (jQuery(this).find('.selectects-avatar-name').text() != manageUserProfile('read', 'name')) {
			jQuery(this).remove();
		}
	});

	jQuery('.createGroup-SelectedUsers .profile-row').each(function () {
		jQuery(this).remove();
	});

	jQuery('.createGroup__members').attr('data-count', '1').html('1/100 Selected');
	jQuery('.search-buddy-input, .add-grp-name-input').val('');
	jQuery('.createGroupChat-stepTwo .css-1d3go38').html(icons.person);
	jQuery('.createGroupChat-stepTwo .css-k008qs svg').click();

	//Trigger keyup in the input box so that it clears the search results
	jQuery('.createGroupChat-stepOne .search-buddy-input').trigger('keyup');
}


function openSingleChat(userId, userName, chatId, profileImage, isAccepted, isRejected, chatType, groupAdminId) {
	jQuery('.singleChat__box').empty();
	jQuery('.singleChat__container').show('slide', { direction: 'right' }, 300);

	jQuery('.sticky-acceptmsg-prompt').remove();
	jQuery('.singleChat__container').find('.css-1n2mv2k .chat__rejected-msg').remove();
	jQuery('.singleChat__container').attr('data-pagenumber', 1);
	jQuery('.singleChat__container').attr('data-totalpages', 2);

	if (userName) {
		jQuery('.singleChat__container').find('.userName').text(userName);
	}

	if (chatId) {
		jQuery('.singleChat__container').attr('data-chat-id', chatId);
	}

	if (userId) {
		jQuery('.singleChat__container').attr('data-chat-user', userId);
	}

	if (isAccepted == 'true') {
		jQuery('.singleChat__container').attr('data-isaccepted', 'true');
	}
	else {
		jQuery('.singleChat__container').attr('data-isaccepted', 'false');
	}

	if (isRejected == 'true') {
		jQuery('.singleChat__container').attr('data-isrejected', 'true').addClass('rejected');

		if (chatType == 'group') {
			jQuery('.singleChat__container').find('.css-1n2mv2k').append('<div class="chat__rejected-msg">You are no longer a part of this group.</div>');
		}
		else {
			jQuery('.singleChat__container').find('.css-1n2mv2k').append('<div class="chat__rejected-msg">This chat request has been rejected</div>');
		}
	}
	else {
		jQuery('.singleChat__container').attr('data-isrejected', 'false').removeClass('rejected');
	}

	if (profileImage) {
		// below line has to be corrected to show influencer tag
		imagePath = getProfileImage(renderUserProfileImage(profileImage), '', '', '', false);
		jQuery('.singleChat__container').find('.css-1f7kf0v').html(imagePath);
	}

	verifiedState = (manageUserProfile('read', 'isVerified')) ? 'verified' : 'not-verified';
	jQuery('.singleChat__container').attr('data-isVerified', verifiedState);

	if (chatType) {
		jQuery('.singleChat__container').attr('data-chat-type', chatType);

		if (chatType == 'group') {
			//Fetch all the group members & create a comma separated string of names
			jQuery('.singleChat__more-options ul li[data-option="block"]').text('Leave Group').attr('data-option', 'leavegroup');
			membersNames = '';
			membersList = manageUserChat('read', { userId: userId, chatId: chatId }, 'All');
            jQuery('.singleChat__container').attr('data-admin-id', groupAdminId );

			if (membersList) {
				membersList.members.forEach(function (member) {
					if (!member.isExited && !member.isRemoved && member.userInfo != undefined && member.userInfo.uid != manageUserProfile('read', 'userId')) {
						membersNames += member.userInfo.displayName + ', ';
					}
				});
			}
		}
		else {
			jQuery('.singleChat__more-options ul li[data-option="leavegroup"]').text('Block User').attr('data-option', 'block');
			membersNames = '<svg class="css-c1v7xd" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="FiberManualRecordIcon"><circle cx="12" cy="12" r="8"></circle></svg><p class="active-inactive css-9l3uo3">Not active</p>';
		}

		if (jQuery('.chat__item[data-chat-id="' + chatId + '"]').attr('encrypted-user-id') !== undefined) {
			jQuery('.singleChat__container').attr('encrypted-user-id', jQuery('.chat__item[data-chat-id="' + chatId + '"]').attr('encrypted-user-id'));
		}

		//If last character is a comma, remove it
		membersNames = (membersNames.slice(-2) == ', ') ? membersNames.slice(0, -2) : membersNames;
		jQuery('.singleChat__container').find('.css-h1trg1').html(membersNames);
	}

	//Desktop
	jQuery('.chats__container').addClass('open');
	showHideFooterMenu('hide');
	jQuery('.startNewChat__container').hide('slide', { direction: 'right' }, 300);
	jQuery('.createGroupChat__container').hide('slide', { direction: 'right' }, 300);
	jQuery('.group__members-section').hide('slide', { direction: 'right' }, 300);

	jQuery('.sticky-footer-parent').show();

	scrollManager('Start', 'Chat');

	// //Change the url to /singleChat
	window.history.pushState({ html: '', pageTitle: 'Single Chat' }, '', '/chat/' + chatId);
}

function chatVerified1O1() {
	chatType = jQuery('.singleChat__container').attr('data-chat-type');
	isVerified = jQuery('.singleChat__container').attr('data-isverified');
	isReadOnly = jQuery('.singleChat__container').attr('data-isreadonly');

	if ((chatType == 'personal' || chatType == 'group') && isVerified == 'not-verified' && isReadOnly != 'true') {
	//if ((chatType == 'personal' || chatType == 'group' ) && isReadOnly != 'true') {
		//Hide the chat box and replace with a message
		setTimeout(function () {
			if (jQuery('.singleChat__container .singleChat__message').last().hasClass('myMessage')) {
				jQuery('.singleChat__container').find('.css-1n2mv2k').append('<div class="chat__rejected-msg"><div class="chat__premium-image-holder"><img src="/view/assets/img/chat_go_premium.webp" alt="Description"></div></div>');
			}
			else {
				jQuery('.chat__rejected-msg').remove();
			}
		}, 100);
	}
}

function chatSendActions() {
	//Send Message to Chat
	jQuery(document).on('click', '.feed__actions-share, .feed__share', function () {
		if (window.location.href.includes('beatravelbuddy.com') || window.location.href.includes('localhost') || isIOS() || isAndroid()) {
			if (!guestMaster('noLogin')) {
				postId = jQuery(this).parents('.feed_item').attr('data-id');
				postType = jQuery(this).parents('.feed_item').attr('data-post-type');
				renderChatSend('invoke', { postId: postId, postType: postType });
				fbEvent('share_feed', { postId: postId, postType: postType });
			} else {
				redirect('login');
			}
		}
	});

	//Click on follower
	jQuery(document).on('click', '.feed__send-profile', function () {
		userIdString = jQuery(this).attr('data-user-id-string');
		activeTab = jQuery('.feed__send-tabs ul li.active').attr('data-tab');

		if (jQuery(this).hasClass('active')) {
			jQuery(this).removeClass('active');
			jQuery('#main__drawer .feed__send-profiles .feed__send-profile[data-user-id-string="' + userIdString + '"]').removeClass('active');
		}
		else {
			jQuery(this).addClass('active');

			if (activeTab == 'buddies') {
				jQuery('#main__drawer .feed__send-profiles .feed__send-profile[data-user-id-string="' + userIdString + '"]').addClass('active');
			}
			else {
				jQuery('#main__drawer .feed__send-groups-tab .feed__send-profile[data-user-id-string="' + userIdString + '"]').addClass('active');
			}
		}

		if (jQuery('#main__drawer .feed__send-profiles .feed__send-profile.active').length > 0 || jQuery('#main__drawer .feed__send-groups-tab .feed__send-profile.active').length > 0) {
			jQuery('.feed__send-btn').show();
			totalLength = Number(jQuery('#main__drawer .feed__send-profiles .feed__send-profile.active').length) + Number(jQuery('#main__drawer .feed__send-groups-tab .feed__send-profile.active').length);

			if (totalLength > 1) {
				jQuery('.feed__send-btn button').html('Send Seperately..');
			}
			else {
				jQuery('.feed__send-btn button').html('Send');
			}
		}
		else {
			jQuery('.feed__send-btn').hide();
		}
	});

	//Click on Share Options
	jQuery(document).on('click', '.feed__send-share__option', function () {
		what = jQuery(this).attr('data-what');
		console.log(what);

		postId = jQuery(this).parents('.feed__send-page').attr('data-id');
		postType = jQuery(this).parents('.feed__send-page').attr('data-type');

		if (postType == 'service' || postType == 'experience') {
			imageUrl = jQuery('#secondary .secondary__tab .drawerBody .single__experience-page .experience__gallery .experience__gallery-full .swiper-wrapper .swiper-slide:first-child img').attr('src');
		}
		else if (postType == 'profile') {
			imageUrl = jQuery('#main__profile-box .profile__page .profile__photo img').attr('src');
		}
		else if (postType == 'shareProfile') {
			imageUrl = jQuery('#secondary .secondary__tab:last-child .profile__page .profile__photo img').attr('src');
		}
		else {
			feedItem = jQuery('.feed_item[data-id="' + postId + '"]');

			//Check if the post first image is a video or not
			if (feedItem.find('.feed__body-images .swiper-wrapper .swiper-slide:first-child video').length > 0) {
				imageUrl = feedItem.find('.feed__body-images .swiper-wrapper .swiper-slide:first-child video').attr('poster');
			}
			else {
				imageUrl = feedItem.find('.feed__body-images .swiper-wrapper .swiper-slide:first-child img').attr('src');
			}
		}

		if (jQuery('#main__drawer').find('.drawerBody .feed__send-page').attr('data-image')) {
			imageUrl = jQuery(this).parents('.feed__send-page').attr('data-image');
			console.log(imageUrl);
		}


		linkText = createDeepLink(postType, postId, imageUrl, '', true);

		if (what == 'share' || what == 'copy-link') {
			fbEvent('share_post_link', { postId: postId, postType: postType });
			if (isAndroid() || isIOS()) {
				copy = (what == 'copy-link' ? createDynamicLink('copy', { 'longDynamicLink': linkText.link }, linkText.text) : createDeepLink(postType, postId, imageUrl, false, false, linkText.text));

			}
			else {
				createDynamicLink('copy', { 'longDynamicLink': linkText.link }, linkText.text);
			}
		}
		else if (what == 'whatsApp') {
			fbEvent('share_post_whatsapp', { postId: postId, postType: postType });
			createDynamicLink('whatsApp', { 'longDynamicLink': linkText.link }, linkText.text);
		}
		else if (what == 'facebook') {
			fbEvent('share_post_facebook', { postId: postId, postType: postType });
			createDynamicLink('facebook', { 'longDynamicLink': linkText.link }, linkText.text);
		}
		else if (what == 'twitter') {
			fbEvent('share_post_twitter', { postId: postId, postType: postType });
			createDynamicLink('twitter', { 'longDynamicLink': linkText.link }, linkText.text);
		}
	});

	//Search for followers
	jQuery(document).on('keyup', '.feed__send-search input', function () {
        clearTimeout(timeout);

            timeout = setTimeout(() => {
            val = jQuery(this).val();

            if (val.length > 2) {
                jQuery(this).parents('.feed__send-search').find('svg').replaceWith(icons.close);
                jQuery(this).parents('.feed__send-search').find('span').addClass('close');
                jQuery('.feed__send-profiles').hide();
                jQuery('.feed__send-search-box').show();
                jsInit('fetchFollowers', { userId: manageUserProfile('read', 'userId'), pageNumber: 0, type: 0, userName: val }, 'searchChatSend');
            }
            else {
                jQuery(this).parents('.feed__send-search').find('svg').replaceWith(icons.searchBar);
                jQuery(this).parents('.feed__send-search').find('span').removeClass('close');

                jQuery('.feed__send-profiles').show();
                jQuery('.feed__send-search-box').hide();
            }
        }, 500);
	});

	//Close Search
	jQuery(document).on('click', '.feed__send-search span.close', function () {
		jQuery(this).parents('.feed__send-search').find('input').val('');
		jQuery(this).parents('.feed__send-search').find('svg').replaceWith(icons.searchBar);
		jQuery(this).parents('.feed__send-search').find('span').removeClass('close');

		jQuery('.feed__send-profiles').show();
		jQuery('.feed__send-search-box').hide();

	});

	//Swith between buddy or group tabs
	jQuery(document).on('click', '.feed__send-tabs ul li', function () {
		tab = jQuery(this).attr('data-tab');
		jQuery('.feed__send-tabs ul li').removeClass('active');
		jQuery(this).addClass('active');

		if (tab == 'buddies') {
			jQuery('.feed__send-groups-tab').hide();
			jQuery('.feed__send-buddies-tab').show();
		}
		else {
			jQuery('.feed__send-buddies-tab').hide();
			jQuery('.feed__send-groups-tab').show();
		}
	});

	//Send Button
	jQuery(document).on('click', '.feed__send-btn button', function (a_obj) {
		a_obj.preventDefault();

		jQuery('#main__drawer .feed__send-page .feed__send-profile.active').each(function () {
			item = jQuery(this);
			sendItem(item);
		});
	});

	function sendItem(item) {
		currentTimestamp = Number(new Date().getTime() / 1000).toFixed(0);
		userId = jQuery(item).attr('data-user-id');
		chatType = jQuery(item).attr('data-chat-type');
		postId = jQuery(item).parents('.feed__send-page').attr('data-id');
		postType = jQuery(item).parents('.feed__send-page').attr('data-type');
		profileStuff = '';

		if (postType == 'service' || postType == 'experience') {
			postImage = jQuery(item).parents('#app').find('#secondary .secondary__tab .drawerBody .single__experience-page .experience__gallery .experience__gallery-full .swiper-wrapper  .swiper-slide img').attr('src');
			postAuthor = jQuery('.single__experience-page').find('.experience__head-title h1').text();
			postAuthorId = jQuery('.single__experience-page').attr('data-id');
			postAuthorImage = jQuery('.single__experience-page').find('.experience__head-host').find('img').attr('src');
			postLocation = jQuery('.single__experience-page').find('.experience__head .experience__head-location-right').text();
			postContent = jQuery('.single__experience-page').find('.experience__content p').text();
			type = 'experience';
			price = jQuery('.single__experience-page').find('.experience__price').attr('data-price');

		}
		else if (postType == 'profile' || postType == 'shareProfile') {
			if (postType == 'profile') {
				toFind = '#main__profile-box .main_item';
			}
			else {
				toFind = '#secondary .secondary__tab:last-child .drawerBody';
			}

			profileStuff = {
				profileCover: jQuery(toFind).find('.profile__page .swiper-slide-active img').attr('src'),
				profileName: jQuery(toFind).find('.profile__page').attr('data-username'),
				profileUserId: jQuery(toFind).find('.profile__page').attr('data-user'),
				profileImage: jQuery(toFind).find('.profile__page').attr('data-profileimage'),
				profileLocation: jQuery(toFind).find('.profile__page .profile__location').text(),
				followers: jQuery(toFind).find('.profile__page .profile__followers').attr('data-count'),
				following: jQuery(toFind).find('.profile__page .profile__followings').attr('data-count')
			}

			type = postType;
		}
		else {
			postType = (postType == 'story') ? 'share' : postType;
			postImage = jQuery('.feed_item[data-id="' + postId + '"]').find('.feed__body-images .swiper-wrapper .swiper-slide:first-child img').attr('data-original');
			postAuthor = jQuery('.feed_item[data-id="' + postId + '"]').find('.feed___head-name').text();
			postAuthorId = jQuery('.feed_item[data-id="' + postId + '"]').attr('data-user');
			postAuthorImage = jQuery('.feed_item[data-id="' + postId + '"]').find('.feed__head-img img').attr('data-original');
			postTimestamp = jQuery('.feed_item[data-id="' + postId + '"]').attr('data-time');
			postLocation = jQuery('.feed_item[data-id="' + postId + '"]').find('.feed___head-name-location').text();
			postContent = jQuery('.feed_item[data-id="' + postId + '"]').find('.feed__body-description pre').text();
			type = 'post';

			if (jQuery('.feed__body-images .swiper-wrapper .swiper-slide:first-child').attr('data-type') == 'video') {
				postImage = jQuery('.feed_item[data-id="' + postId + '"]').find('.feed__body-images .swiper-wrapper .swiper-slide:first-child video').attr('poster');
			}
		}

		payload = {
			chatType: chatType,
			chatId: '',
			isSentByCurrentUser: true,
			timeStamp: currentTimestamp,
			message: '',
			userId: userId,
			type: type,
		}

		if (chatType == 'group') {
			payload['chatId'] = userId;
			payload['userId'] = manageUserProfile('read', 'userId');
		}

		if (postType == 'share' || postType == 'find_buddy' || postType == 'meetup' || postType == 'ask') {
			payload['post'] = {
				postId: postId,
				postImage: postImage,
				postAuthor: postAuthor,
				postAuthorId: postAuthorId,
				postAuthorImage: postAuthorImage,
				postTimestamp: postTimestamp,
				postLocation: postLocation
			}

			if (postType == 'share') {
				payload['post']['postType'] = 'share';
			}
			else if (postType == 'find_buddy') {
				payload['post']['postType'] = 'find_buddy';
				payload['post']['postContent'] = postContent;
			}
			else if (postType == 'meetup') {
				payload['post']['postType'] = 'meetup';
				payload['post']['postContent'] = postContent;
			}
			else if (postType == 'ask') {
				payload['post']['postType'] = 'ask';
				payload['post']['postContent'] = postContent;
			}
		}
		else if (postType == 'service' || postType == 'experience') {
			payload['post'] = {
				postId: postId,
				postImage: postImage,
				postAuthor: postAuthor,
				postAuthorId: postAuthorId,
				postAuthorImage: postAuthorImage,
				postLocation: postLocation,
				postContent: postContent,
				price: price,
				postType: postType
			}
			console.log(payload);
		}
		else if (postType == 'profile' || postType == 'shareProfile') {
			delete payload['post'];
			payload['type'] = 'profile';
			payload['profile'] = profileStuff;
		}

		console.log(payload);
		jsInit('postChatMessage', payload, 'sendChat');

		//Close the drawer
		drawer('close');
		jQuery('.feed__send-btn').hide();
		jQuery('.feed__send-search-box').hide();
		jQuery('.feed__send-profiles').show();

		if (postType == 'experience') {
			toast('Experience shared successfully');
		}
		else if (postType == 'service') {
			toast('Service shared successfully');
		}
		else if (postType == 'profile' || postType == 'shareProfile') {
			toast('Profile shared successfully');
		}
		else {
			toast('Post shared successfully');
		}
	}
}


function influencerActions() {
	//Redirect to profile of influencer
	jQuery(document).on('click', '.influencer__item-image, .influencer__item-name', function () {
		redirect('profile', jQuery(this).parents('.influencer__item').attr('data-user'));
	});

	//Trigger Location Search on Click
	jQuery(document).on('click', '.influencer__search input', function () {
		// renderLocations('init', '', '#influencer__search');
	});

	//Search for influencers
	jQuery(document).on('keyup', '.influencer__search input', function () {
		search = jQuery(this).val();

		if (search.length > 2) {
			jsInit('fetchInfluencers', { location: search, gender: '', pageNumber: 0 }, 'influencer_search');
		}
		else {
			jQuery('.influencer__search-box').hide();
			jQuery('.influencer__body').show();
		}
	});
}


function filterActions() {
	//Radio Buttons
	jQuery(document).on('click', '#search_filter_submit-button', function () {
		jQuery(this).find('input[type="radio"]').prop('checked', true);
		jQuery(this).addClass('active');
	});

	//On click of reset filter
	jQuery(document).on('click', '#search-filter_reset-button', function () {
		localStorage.removeItem('filter');
		jQuery('.gender_options_box, .user_types_filter_options , .filter_options_box').removeClass('active');
		jQuery('.gender_options_box:first-child, .user_types_filter_options:first-child, .filter_options_box:first-child').addClass('active');
	});

	jQuery(document).on('click', '.gender_options_box, .filter_age_from_box, .recent_search_options li, .user_types_filter_options, .filter_options_box, .individual_int_opt', function () {
		addActive = true;

		if (jQuery(this).hasClass('gender_options_box')) {
			jQuery('.gender_options_box').removeClass('active');
		}
		else if (jQuery(this).hasClass('filter_age_from_box')) {
			jQuery('.filter_age_from_box').removeClass('active');
		}
		else if (jQuery(this).hasClass('user_types_filter_options')) {
			jQuery('.user_types_filter_options').removeClass('active');
		}
		else if (jQuery(this).hasClass('recent_search_options li')) {
			jQuery('.recent_search_options li').removeClass('active');
		}
		else if (jQuery(this).hasClass('individual_int_opt')) {
			jQuery('.individual_int_opt').removeClass('active');
		}
		else if (jQuery(this).hasClass('filter_options_box')) {
			$('input:checkbox').change(function () {
				if ($(this).is(':checked'))
					$(this).parent().addClass('active');
				else
					$(this).parent().removeClass('active')
			});
		}

		if (addActive) {
			jQuery(this).addClass('active');
		}
	});

	jQuery(document).on('click', '.gender_options_box, .filter_age_from_box, .recent_search_options li , .user_types_filter_options, .filter_options_box, .individual_int_opt', function () {
		addActive = true;

		if (jQuery(this).hasClass('gender_options_box')) {
			jQuery('.gender_options_box').removeClass('active');
		}
		else if (jQuery(this).hasClass('filter_age_from_box')) {
			jQuery('.filter_age_from_box').removeClass('active');
		}
		else if (jQuery(this).hasClass('user_types_filter_options')) {
			jQuery('.user_types_filter_options').removeClass('active');
		}
		else if (jQuery(this).hasClass('recent_search_options li')) {
			jQuery('.recent_search_options li').removeClass('active');
		}
		else if (jQuery(this).hasClass('individual_int_opt')) {
			jQuery('.individual_int_opt').removeClass('active');
		}
		else if (jQuery(this).hasClass('filter_options_box')) {
			$('input:checkbox').change(function () {
				if ($(this).is(':checked'))
					$(this).parent().addClass('active');
				else
					$(this).parent().removeClass('active')
			});
		}

		if (addActive) {
			jQuery(this).addClass('active');
		}
	});


	//Form Submit for Filter
	jQuery(document).on('submit', '#search-filter_form', function (e) {
		e.preventDefault();

		//Get the form data
		data = jQuery(this).serializeArray();
		formData = validateForm('filters-form', data);

		if (formData.validator.response) {
			//add filter object from the form data
			filterObj = {
				"gender": -1,
				"interests": [],
				"maxAge": 60,
				"minAge": 13,
				"postTypeAsk": 0,
				"postTypeLookingForBuddy": 0,
				"postTypeStory": 0,
				"userType": -1
			}
			userFiltered = false;
			data.forEach(form_item => {
				if (form_item.name == 'ageFromNumber' && form_item.value != '') {
					filterObj.minAge = parseInt(form_item.value);
					userFiltered = true;
				}
				if (form_item.name == 'ageTillNumber' && form_item.value != '') {
					filterObj.maxAge = parseInt(form_item.value);
					userFiltered = true;
				}
				if (form_item.name == 'userType_options' && form_item.value != 2) {
					filterObj.userType = form_item.value;
					userFiltered = true;
				}
				if (form_item.name == 'options-Gender') {
					filterObj.gender = parseInt(form_item.value);
					userFiltered = true;
				}
				if (form_item.name == 'filterStories') {
					filterObj.postTypeStory = 1;
					userFiltered = true;
				}
				if (form_item.name == 'filterBuddies') {
					filterObj.postTypeLookingForBuddy = 1;
					userFiltered = true;
				}
				if (form_item.name == 'filterAsk') {
					filterObj.postTypeAsk = 1;
					userFiltered = true;
				}
				if (form_item.name == 'filter_search' && form_item.value != '') {
					filterObj.selectedLocation = {};
					filterObj.selectedLocation.name = form_item.value;
					userFiltered = true;
				}
			});

			resetFreeFeatures();
			if (manageUserProfile('read', 'isVerified')) {
			//if (true) {
				localStorage.setItem('filtersApplied', 99);
			}
			else {
				if (localStorage.getItem('filtersApplied') > 90) {
					localStorage.setItem('filtersApplied', 1);
				}

				localStorage.setItem('filtersApplied', localStorage.getItem('filtersApplied') - 1);
			}

			if (localStorage.getItem('filtersApplied') >= 0) {
				localStorage.setItem('filter', JSON.stringify(filterObj));
				redirect('filterFeed', filterObj)
			}
			else {
				//once the filtersApplied is expired show login screen, show premium screen.
				localStorage.removeItem('filter');
				toast('Become verified to access unlimited filters');

				setTimeout(function () {
					destroyAllSecondaryTabs();
					redirect('premium');
				}, 1000);
			}

		}
		else {
			//throwFormError(jQuery(this), formData.validator.message, formData.validator.where);
			throwFormError(formData.validator);
		}
	});

	//Remove a selected location on click of the close icon
	jQuery(document).on('click', '.recent_search_options ul li span', function () {
		jQuery(this).parents('.recent_search_options ul li').remove();
	});

	//Location Search
	jQuery(document).on('click', '#filter_search', function () {
		renderLocations('init', '', '#filter_search');
	});

}

function throwFormError(validatorObj) {
	//Use this as a toast error message
	toast(validatorObj.message);

	if (validatorObj.where) {
		//Check if the first character is a # and add it if it's not
		if (validatorObj.where.charAt(0) !== '#') {
			validatorObj.where = '#' + validatorObj.where;
		}

		jQuery(validatorObj.where).addClass('err');
		jQuery(validatorObj.where)[0].scrollIntoView();
	}
}

function manageOTP(what, state) {
	if (what == 'Submit') {
		source = jQuery('.otp__view').attr('data-source');
		otp = [];
		// jQuery('.otp-field input').each(function () {
		//     otp.push(jQuery(this).val());
		// });

		// otp = otp.join('');

		otp = jQuery('.otp-field input').val();
		console.log(otp);

		if (source == 'onboarding') {
			if (jQuery('.otp__view').attr('data-service') && jQuery('.otp__view').attr('data-service') == 'firebase') {
				console.log('verifyOTP');
				firebaseOTP('verifyOTP', { otp: otp, where: 'experience' });
			}
			else {
				console.log('updatePhoneNumber');
				jsInit(
					'updatePhoneNumber',
					{
						phoneNumber: jQuery('#onboarding__phone').val(),
						dialCode: jQuery('#onboarding__countryCode').val(),
						otp: otp,
					},
					'onboarding'
				);
			}
		}
		else if (source == 'signup') {
			if (jQuery('.otp__view').attr('data-service') == 'firebase') {
				fullName = jQuery('.otp__view').attr('data-name');
				email = jQuery('.otp__view').attr('data-user-email').toLowerCase();
				password = jQuery('.otp__view').attr('data-password');
				phone = jQuery('.otp__view').attr('phonenumber');
				countryCode = jQuery('.otp__view').attr('dialcode');
				otpId = '';
			}
			else {
				fullName = jQuery('#signUp__name').val();
				email = jQuery('#signUp__email').val().toLowerCase();
				password = jQuery('#signUp__password').val();
				phone = jQuery('#signUp__phone').val();
				countryCode = jQuery('#signUp__countryCode').val();
				otpId = jQuery('.otp__view').attr('data-otpId');
			}

			deviceType = 'web';
			if (isAndroid()) {
				deviceType = 'android';
			}
			else if (isIOS()) {
				deviceType = 'ios';
			}

			if (countryCode == '+91') {
				createUserAccount();
			}
			else {
				firebaseOTP('verifyOTP', { otp: otp, where: 'signUp', phoneNumber: phone, dialCode: countryCode, email: email, password: password, fullName: fullName, deviceType: deviceType, otpId: otpId });

			}
			function createUserAccount() {
				jsInit('signUpOTP', {
					name: fullName,
					email: email,
					countryCode: countryCode,
					phone: phone,
					enteredOTP: otp,
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
		}
		else {
			email = jQuery('.otp__view').attr('data-email');
			source = jQuery('.otp__view').attr('data-source');

			jsInit('matchOtpForgot', { email: email, enteredOTP: otp }, source);
		}
		loaderMain('formSubmit', false);
	}
	
}

function redirect(type, value) {

	if (guestMaster() && type == 'otp' && (isAndroid() || isIOS())) {
		jQuery('.drawer').css('height', '100%');
		drawer('close');
	}
	// else if (guestMaster() && disableGuestLoginForDevices && (isAndroid() || isIOS())) {

	// }
	else {
		drawer('close');
	}

	managePopups('hide');

	if (type == 'home') {
		//If it is home, then reload the page
		reloadWindowWithIosCheck();
		redirect('profile', manageUserProfile('read', userId));
	}
	else if (type == 'location' || type == 'searchLocation') {
		// Pass a value to Google Tag Manager
		dataLayer.push({ location: value.location });

		//manageShots('close');
		manageSecondary('show', 'location', value);
		fetchPosts(
			{
				feedsType: 'LOCATION',
				pageNumber: 0,
				location: value.location,
				userId: manageUserProfile('read', 'userId'),
				locationLat: userLatLong['latitude'],
				locationLng: userLatLong['longitude']
			},
			'#secondary .secondary__tab:last-child .drawerBody .feed__box'
		);
		scrollManager('Start', 'LOCATION');
	}
	else if (type == 'hashtag' || type == 'searchHashtag') {
		//manageShots('close');
		manageSecondary('show', 'location', value);
		fetchPosts(
			{
				feedsType: 'HASHTAG',
				pageNumber: 0,
				location: value.location,
				userId: manageUserProfile('read', 'userId'),
				locationLat: userLatLong['latitude'],
				locationLng: userLatLong['longitude']
			},
			'#secondary .secondary__tab:last-child .drawerBody .feed__box'
		);
		scrollManager('Start', 'HASHTAG');
	}
	else if (type == 'searchFindBuddy') {
		//manageShots('close');
		locationName = { location: value };
        manageSecondary('show', 'location', locationName);
		fetchPosts(
			{
				feedsType: 'SEARCH FIND BUDDY',
				pageNumber: 0,
				location: value,
				userId: manageUserProfile('read', 'userId'),
				locationLat: userLatLong['latitude'],
				locationLng: userLatLong['longitude']
			},
			'#secondary .secondary__tab:last-child .drawerBody .feed__box'
		);
	}
	else if (type == 'find_posts' || type == 'view_related' || type == 'ask_view-related') {
		console.log(type);
		//manageShots('close');
		manageSecondary('show', 'find_posts', value);
		console.log(value);
		if (type == 'find_posts') {
			fetchPosts(
				{
					feedsType: 'FIND BUDDY VIEW RELATED',
					location: (value.location) ? value.location : '',
					pageNumber: 0,
					postId: value.id,
					totalItems: 0,
					userId: manageUserProfile('read', 'userId'),
					locationLat: userLatLong['latitude'],
					locationLng: userLatLong['longitude']
				},
				'#secondary .secondary__tab:last-child .drawerBody .feed__box'
			);

		}
		else if (type == 'view_related') {
			fetchPosts(
				{
					feedsType: 'FIND BUDDY VIEW RELATED',
					location: value.location,
					pageNumber: 0,
					postId: value.id,
					totalItems: 0,
					userId: manageUserProfile('read', 'userId'),
					locationLat: userLatLong['latitude'],
					locationLng: userLatLong['longitude']
				},
				'#secondary .secondary__tab:last-child .drawerBody .feed__box'
			);
		}
		else if (type == 'ask_view-related') {
			fetchPosts(
				{
					feedsType: 'SEARCH ASK BUDDY',
					pageNumber: 0,
					location: value.location,
					userId: manageUserProfile('read', 'userId'),
					locationLat: userLatLong['latitude'],
					locationLng: userLatLong['longitude']
				},
				'#secondary .secondary__tab:last-child .drawerBody .feed__box'
			);
		}

		scrollManager('Start', 'LOCATION');
	}
    else if (type == 'view_related-findBuddies') {
        fetchPosts(
            {
                feedsType: 'FIND BUDDY VIEW RELATED',
                location: value.location,
                pageNumber: 0,
                postId: value.id,
                totalItems: 0,
                userId: manageUserProfile('read', 'userId'),
                locationLat: value.locationLat,
                locationLng: value.locationLng
            },
            'showFindBuddy'
        );
    }
	else if (type == 'bucketList') {
		//manageShots('close');
		manageSecondary('show', 'bucketList', { "location": value });
		fetchPosts(
			{
				feedsType: 'BUCKETLIST',
				pageNumber: 0,
				totalItems: 0,
				userId: manageUserProfile('read', 'userId'),
				locationLat: userLatLong['latitude'],
				locationLng: userLatLong['longitude']
			},
			'#secondary .secondary__tab:last-child .drawerBody .feed__box'
		);
	}
	else if (type == 'post' || type == 'comment' || type == 'like' || type == 'askEnquiry') {
		manageSecondary('show', 'Single Post', 'Post');
		jsInit('fetchPost', { postId: value }, '#secondary .secondary__tab:last-child .drawerBody .feed__box');
	}
	else if (type == 'searchBuddy' || type == 'profile' || type == 'user' || type == 'follow' || type == 'searchBuddyFollowers' || type == 'searchPagination') {
		jsInit('fetchProfile', { userId: value }, '#secondary .secondary__tab:last-child .drawerBody');
	}
	else if (type == 'ratings' || type == 'rateNow__box') {
		console.log(jQuery(value).parent().attr('class'));
		if (jQuery(value).parent().attr('class').includes('profile__page')) {
			userId = jQuery(value).parents('.profile__page').attr('data-user');
			data = {
				userName: jQuery(value).parents('.profile__page').find('.profile__name').html(),
				overallRating: jQuery(value).find('.profile__rating').attr('data-rating'),
				count: jQuery(value).find('.profile__rating').attr('data-count'),
				userId: userId,
			};
			manageSecondary('show', 'Ratings', 'Ratings');
			jsInit('fetchRatings', { userId: userId });
			renderRatingsView('init', data);
		}
		else {
			userId = jQuery(value).parents('.single__experience-page').attr('data-id');
			data = {
				userName: jQuery(value).parents('.single__experience-page').find('.experience__head-title h1').text(),
				overallRating: jQuery(value).parents('.single__experience-page').find('.profile__rating').attr('data-rating'),
				//count: jQuery(value).find('.profile__rating').attr('data-count'),
				userId: jQuery(value).parents('.single__experience-page').attr('data-id'),
			};
			manageSecondary('show', 'Ratings', 'Ratings');
			jsInit('getExperienceRatings', { 'experienceId': userId });
			renderRatingsView('init', data);
		}
		if (type == 'rateNow__box') {
			setTimeout(function () {
				jQuery('.rate__now').click();
			}, 400);
		}

	}
	else if (type == 'onboarding') {
		if (Number(manageUserProfile('read', 'completeness')) <= profileCompletenessCheck) {
			// manageSecondary('show', 'onboarding', 'onboarding');
			// renderOnboarding('init');
			
			renderBottomSheet('', 'onboardingOne');

			//Check screen width
			if (Number(window.innerWidth) > 768) {
				jQuery('#desktopContainer').attr("style", "display: none !important");
			}
		}
	}
	else if (type == 'otp') {
		manageSecondary('show', 'otp', 'otp');

		setTimeout(function () {
			loaderMain('otp', false);
			loaderMain('feed', false);
			loaderMain('secondary', false);
		}, 150);

		if (value.phoneNumber) {
			//This one is for the international numbers
			renderOTPForm('div#secondary .secondary__tab:last-child .drawerBody', manageCountryCode(value.dialCode) + value.phoneNumber);
			jQuery('.otp__view').attr('data-service', 'firebase');
			if (value.state !== 'signUp') {
				jQuery('.otp__view').attr('data-email', manageCountryCode(value.dialCode) + value.phoneNumber).attr('data-source', 'onboarding');
			}
			else {
				jQuery('.otp__view').attr('data-email', manageCountryCode(value.dialCode) + value.phoneNumber).attr('data-source', 'signup').attr('dialCode', value.dialCode).attr('phoneNumber', value.phoneNumber).attr('data-name', value.payload.name).attr('data-user-email', value.payload.email).attr('data-password', value.payload.password).attr('data-gToken', value.payload.gToken).attr('data-otpId', value.payload.otpId);
			}
		}
		else {
			renderOTPForm('div#secondary .secondary__tab:last-child .drawerBody', value);
			jQuery('.otp__view').attr('data-email', value).attr('data-source', 'onboarding');
		}
	}
	else if (type == 'premium') {
		jQuery('body').prepend('<div class="global__loading" ><div class="feed__loading" id="lottie__loading" style="width: 100%; height: 250px;"></div><div class="hold__horses"></div></div>');

        lottie.loadAnimation({
            container: document.getElementById('lottie__loading'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/view/assets/img/loader_lightMode.json'
        });
		// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
		// 	Moengage.track_event('TBD_BECOME_VERIFIED_EVENT', { 'isVerfied': manageUserProfile('read', 'isVerified') });
		// }
		// if (isAndroid()) {
		// 	Android.moEngageData('TBD_BECOME_VERIFIED_EVENT', JSON.stringify({
		// 		'isVerfied': manageUserProfile('read', 'isVerified')
		// 	}));
		// }
        removeActiveClassFromMain();
        jQuery("#main__premium-box, #footer ul li").removeClass("active");
	    jQuery("#main__premium-box, #footer ul li[data-item='premium']").addClass("active");
		window.history.pushState({ "html": jQuery('#main__premium-box').html(), "pageTitle": 'Premium' }, "", '/premium');
		renderPremium('init', '', value);
		fbEvent('premium');
		webAnalytics('premium_open');
		destroyAllSecondaryTabs();
		jQuery('#header').css('display', 'none');

	}
	else if (type == 'login') {
		if (guestMaster()) {
			// Commenting the Old for Now
			
			// renderLogin('init');
			// drawer('open');
			// New Code
			renderBottomSheet('', 'loginNew');
		}
		else {
			window.history.pushState({ html: jQuery('#secondary .secondary__tab:last-child').html(), pageTitle: 'Login' }, '', '/flights');
			reloadWindowWithIosCheck();
		}
	}
	else if (type == 'feedback') {
		manageSecondary('show', 'feedback', 'feedback');
		renderFeedback('init');
	}
	else if (type == 'blocked-users') {
		manageSecondary('show', 'blocked-users', 'blocked-users');
		renderBlockerUsers('init');
	}
	else if (type == 'influencers') {
		manageSecondary('show', 'influencers', 'influencers');
		renderInfluencers('init', value);
	}
	else if (type == 'allInfluencers') {
		manageSecondary('show', 'influencers', 'influencers');
		renderInfluencers('init');
	}
	else if (type == 'getAllExperiences') {
		window.history.pushState({ html: jQuery('#secondary .secondary__tab:last-child').html(), pageTitle: value }, '', '/flights');
		renderAllExperiences('init');
		jQuery('.head__filter').hide();
	}
	else if (type == 'singleExperience') {
		manageSecondary('show', 'singleExperience', 'singleExperience');
		if (value.url) {
			window.history.pushState(
				{
					html: jQuery('#secondary .secondary__tab:last-child').html(),
					pageTitle: value.title,
				},
				'',
				'/experiences/' + value.url
			);
		}
		jsInit('getExperiences', { filter: { experienceId: value.id } });
	}
	else if (type == 'bookingSummary') {
		manageSecondary('show', 'bookingSummary', 'bookingSummary');
		renderBookingSummary('init', JSON.parse(localStorage.getItem('selectedExperience')));
	}
	else if (type == 'experienceThankYou') {
		manageSecondary('show', 'experienceThankYou', 'experienceThankYou');
		renderExperienceThankYou('init', value);
	}
	else if (type == 'experience-orders') {
		jsInit('getOrderDetails', { userId: manageUserProfile('read', 'userId') }, 'All');
		manageSecondary('show', 'experienceOrders', 'experienceOrders');
	}
	else if (type == 'orderDetails') {
		bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
		data = {
			userId: manageUserProfile('read', 'userId'),
			bookingId: bookingDetails['bookingId'] ? bookingDetails['bookingId'] : value,
		};
		manageSecondary('show', 'orderDetails', 'orderDetails');
		jsInit('getOrderDetails', data, 'Single');
	}
	else if (type == 'singleService') {
		manageSecondary('show', 'singleService', 'singleService');
		jsInit('getServices', { listingId: value });
	}
	else if (type == 'getAllServices') {
		userLatLong = getLatLongfromStorage();
		jsInit('fetchServices', {
			latitude: userLatLong['latitude'],
			longitude: userLatLong['longitude'],
			pageNumber: '0',
		});

		scrollManager('Start', 'Marketplace');
	}
	else if (type == 'expressInterest') {
		console.log(value);
		jsInit('expressInterest', value);
	}
	else if (type == 'contact-us') {
		manageSecondary('show', 'contact-us', 'contact-us');
		renderContactUsForm();
	}
	else if (type == 'flights-hotels' || type == 'flights' || type == 'hotels') {
		
		jQuery('.desktopMenu-fligtsHotels').click();
        jQuery('.desktopMenu-flights').click();
        jQuery('.single__marketplace-tab[data-tab="flights"]').click();

		// if (jQuery('#main__flightHotels-box').length == 0 ) {
		// 	renderFlightsHotels('init');
		// }
        removeActiveClassFromMain();
	    jQuery("#main__flightHotels-box").addClass("active");
        window.history.pushState({ html: jQuery("#main__feed-box").html()
            , pageTitle: "Flights" },"","/flights");
    }
	else if (type == 'app') {
		getOs = detectOperatingSystem();
        if (getOs === 0 || getOs === 1) {
            url = 'https://apps.apple.com/us/app/beatravelbuddy/id1336926442';
        }
        else {
            url = 'https://play.google.com/store/apps/details?id=com.beatravelbuddy.travelbuddy';
        }
        window.open(url, '_blank');
	}
	else if (type == 'addListing') {
		manageSecondary('show', 'addListing', 'addListing');
		renderAddListing('init');
	}
	else if (type == 'editListing') {
		manageSecondary('show', 'addListing', 'editListing');
		jsInit('getServices', value, 'editListing');
	}
	else if (type == '404') {
		// Check if the App is under Maintainence by Calling Last_Active Api. If yes, then show maintainence dialog box otherwise render 404 page. ( changeLastActiveStatus() ) https://beatravelbuddy.com/app.json
		fetch(baseUrl + '/app.json')
			.then(response => response.json())
			.then(data => {
				// `data` is the parsed JSON data from the file
				console.log(data);
				if (data.app_under_maintenance) {
					console.log('App is under maintainence');
					setTimeout(() => {
						renderAppUnderMaintainance();
					}, 500);
				}
				else {
					render404('force');
				}
			})
			.catch(error => {
				console.error('Error:', error);
				render404('force');
			});
	}
	else if (type == 'back') {
		//Remove the last secondary tab
		backHandler();
	}
	else if (type == 'lfb') {
		jsInit('lfb');
		manageSecondary('show', 'lfb', 'lfb');
        window.history.pushState({ html: jQuery('#secondary .secondary__tab:last-child').html(), pageTitle: 'Find travel buddies for the entire globe on TravelBuddy.' }, '', '/findbuddy');
	}
	else if (type == 'contacted-leads') {
		jsInit('contactedLeads', { "option": 0 }, 'New Leads');
		jsInit('contactedLeads', { "option": 1 }, 'Contacted Leads');
		manageSecondary('show', 'contacted-leads', 'contacted-leads');
	}
	else if (type == "settings") {
		manageSecondary('show', 'settings', 'Settings');
		renderSettings('init');
	}
	else if (type == 'change_password') {
		manageSecondary('show', 'change_password', 'Change Password');
		renderSettings('change_password');
	}
	else if (type == 'deactivate_account') {
		manageSecondary('show', 'deactivate_account', 'Deactivate Account');
		renderSettings('deactivate_account');
	}
	else if (type == 'trending_interests') {
		manageSecondary('show', 'trending_interests', value.title);
		renderInterests('init', value.payload);
	}
	else if (type == 'addListing') {
		manageSecondary('show', 'addListing', 'Add Listing');
		renderAddListing('init');
	}
	else if (type == 'filter') {
		manageSecondary('show', 'filter', 'Filter');
		renderFilter('init', value);
	}
	else if (type == 'filterFeed') {
		//manageShots('close');
		manageSecondary('show', 'filterFeed', value);
		fetchPosts({ feedsType: 7, pageNumber: 0, filter: value,locationLat: userLatLong['latitude'], locationLng: userLatLong['longitude'], userId: manageUserProfile('read', 'userId') }, '#secondary .secondary__tab:last-child .drawerBody .feed__box');
		scrollManager('Start', 'FILTERFEED');
	}
	else if (type == 'recommendedFollowers') {
		manageSecondary('show', 'recommendedFollowers', 'Recommended Followers');
		renderRecommendedFollowers('init');
	}
	else if (type == 'profileInterests') {
		manageSecondary('show', 'profileInterests', 'Interests');
		if (value.selfProfile == 'true') {
			renderProfileInterests('init', value.what);
		}
		else {
			renderProfileInterests('load', value.what);
		}
	}
	else if (type == 'editProfile') {
		//manageShots('close');
		manageSecondary('show', 'editProfile', 'editProfile');
		renderProfile('editProfile');
	}
	else if (type == 'chat') {
	
		//Create a user Node
		jsInit('initiateChat', { chatType: 'personal', other: { userId: value.userId, userName: value.userName, profileImage: value.userDp }, self: { userName: manageUserProfile('read', 'name'), profileImage: manageUserProfile('read', 'profilePic') } });
		
		// var currentUrl = window.location.href;
		// if (currentUrl.includes('localhost')) {
		// 	window.open('http://localhost:3000/newChat', '_self');
		// }
		// else if (currentUrl.includes('dev.beatravelbuddy.com')) {
		// 	window.open('https://dev.beatravelbuddy.com/newChat', '_self');
		// }
		// else {
		// 	window.open('https://beatravelbuddy.com/newChat', '_self');
		// }
		openNewChat('');

		// manageUserChat('initializeNode');
		// //Open the chat page
		// jQuery('.desktopMenu-chat').click();
		// openSingleChat(value.userId, value.userName, '', value.userDp, true, '', 'personal');
		// removeActiveClassFromMain();
		// jQuery('#main__chat-box').addClass('active');
	}
	else if (type == '1 day' || type == '2 days') {
		destroyAllSecondaryTabs();
		redirect('premium');
	}
	else if (type == 'rate') {
		destroyAllSecondaryTabs();
		redirect('profile', manageUserProfile('read', 'userId'));
		setTimeout(function () {
			jQuery('.profile__rating').click();
		}, 500);
	}
	else if (type == 'experienceCategory') {
		// Check if data & filteredDate & dailyExperiences are not null or undefined
		if (value.filteredData.dailyExperiences && value.filteredData.dailyExperiences.length > 0 && value.filteredData.dailyExperiences[0].category !== undefined) {
			// Set Text of Category Button
			var newCategoryName = value.filteredData.dailyExperiences[0].category;
			jQuery('.experiences__head-category__item').contents().filter(function () {
				return this.nodeType === 3;  // Node.TEXT_NODE
			}).replaceWith(newCategoryName);

			var categoryName = newCategoryName.replace(/ /g, '-');
			window.history.pushState('', '', '/experiences/category/' + categoryName);

		}
	}
	else if (type == 'nearBy') {
		userLatLong = getLatLongfromStorage();
		userLatLong['latitude'] = 28.7041;
		userLatLong['longitude'] = 77.1025;

		jsInit('nearByUsers', {
			locationLat: userLatLong['latitude'],
			locationLng: userLatLong['longitude']
		});
		manageSecondary('show', 'nearBy');
	}
	else if (type == 'message-dashboard') {
		jsInit('getCohorts');
		manageSecondary('show', 'message-dashboard', 'message-dashboard');
	}
	else if (type == 'onboardingVideo') {
		manageSecondary('show', 'onboardingVideo', 'onboardingVideo');
	}
    else if (type == 'showAllAiTrips') {
        // Open the secondary Page
        manageSecondary('show', 'showAllAiTrips', 'showAllAiTrips');
        jsInit('getUserItineraries', { pageNumber: 0 });
    }
    else if (type == 'manageListings') {
        removeActiveClassFromMain();
        jQuery("#manageListingsPage").addClass("active");
        if (jQuery('#manageListingsPage').length == 0 ) {
			renderManageListings('init');
		}
        jQuery('.tabs .tab[data-index="0"]').click();
    }
    else if (type == 'manageSingleListing') {
        manageSecondary('show', 'singleService', 'singleService');
        jsInit('getServices', { listingId: value }, 'manageSingleListing');
        
    }

	//Every time a new tab is opened add it to the window history
	if (type != 'back' && type != 'premium' && type != 'flightHotels' && type != 'flights' && type != 'listings' && type != 'getAllServices' && type != 'lfb' && type != 'singleExperience' && type != 'experienceCategory' && type != 'profile' && type != 'post' ) {
		if (window.location.href.includes('/flights') !== true) {
			window.history.pushState({ html: jQuery('#secondary .secondary__tab:last-child').html(), pageTitle: value }, '', '#' + value);
		}
	}

	loaderMain('secondary', true);

	function backHandler() {
		console.log('Back Handler');
		
		if (jQuery('#traveller-details-review').length > 0 ) {
			jQuery('.close-button').click();
		}
		
		
		
		//First Check if a secondary tab is already open
		if (window.location.href.includes('/listings')) {
			console.log('Flights and Hotels - Back');
			window.history.pushState(
				{
					html: jQuery('#secondary .secondary__tab:last-child').html(),
					pageTitle: value,
				},
				'',
				'/flights'
			);
		}
	
		if (jQuery('.profileCover__zoomIn').length > 0 && jQuery('.profileCover__zoomIn').css('display') !== 'none') {
			jQuery('.profileCover__zoomIn-overlay').click();
		}
		else if (jQuery('.traveller-details-review__container').length > 0 && jQuery('.traveller-details-review__container').css('display') !== 'none') {
			jQuery('.traveller-details-review__close-btn').click();
		}
		else if (jQuery('.profile__modal').css('display') !== 'none' && jQuery('.profile__modal').length > 0) {
			jQuery('.profile__modal-mask').click();
		}
		else if (jQuery('.popup__master').hasClass('active') && !isIOS()) {
			jQuery('.popupMaster .popup__head-close').click();
			jQuery('.popup__container').css({'height':'','display':'none','flex-direction':'','max-width':'','width':'','background':''});
		}
		else if (jQuery('#main__drawer').hasClass('active') && !isIOS()) {
			jQuery('#main__drawer .drawer-kapat').click();
		}
		else if (jQuery('#secondary .secondary__tab').length > 0) {
			jQuery('#secondary .secondary__tab:last-child .drawerHeader .drawer__back').click();
            jQuery('#ai__back, #ai__results-back').click();
			jQuery('#floating-enquiry-btn').show();

		}
		else if (jQuery('#main__chat-box').hasClass('active') && (jQuery('.singleChat__container').css('display') == 'block' || jQuery('.startNewChat__container').css('display') == 'block' || jQuery('.createGroupChat__container').css('display') == 'block') || jQuery('.singleChat__zoomIn').css('display') == 'block' || jQuery('.group__members-section').css('display') == 'block') {
			if (jQuery('.singleChat__zoomIn').css('display') == 'block') {
				jQuery('.singleChat__zoomIn .singleChat__zoomIn-overlay').click();
			}
			else if (jQuery('.group__members-section').css('display') == 'block') {
				jQuery('.group__members-section .css-k008qs').click();
			}
			else if (jQuery('.createGroupChat__container').css('display') == 'block') {
				if (jQuery('.createGroupChat__container .createGroupChat-stepOne').css('display') == 'block') {
					jQuery('.createGroupChat__container .createGroupChat-stepOne .css-k008qs svg').click();
				}
				else if (jQuery('.createGroupChat__container .createGroupChat-stepTwo').css('display') == 'block') {
					jQuery('.createGroupChat__container .createGroupChat-stepTwo .css-k008qs svg').click();
				}
			}
			else if (jQuery('.startNewChat__container').css('display') == 'block') {
				jQuery('.startNewChat__container').find('.css-k008qs span').click();
			}
			else if (jQuery('.singleChat__container').css('display') == 'block') {
				jQuery('.singleChat__container .singleChat__back svg').click();
			}
		}
		else {
			if (jQuery('#main__shots-box.active').length > 0) {
				//manageShots('close');
				clearHistory();
			}
			else if (jQuery('#footer ul li.active').attr('data-item') == 'feed' && jQuery('#main__tabs ul li.active').attr('data-tab') !== 'trending' && !isIOS()) {
				jQuery('#main__tabs ul li[data-tab="trending"]').click();
				//clearHistory();
			}
			else if (jQuery('#footer ul li.active').attr('data-item') !== 'experiences') {
				jQuery('.menu__feed.openExperiences svg').click();
				jQuery('.head__filter').hide();
				clearHistory();
			}

		}

		function clearHistory() {
			// window.history.replace('/');
			console.log('Clearing History');
			window.history.pushState({ html: '', pageTitle: '' }, '', '/flights');
			jQuery('#floating-enquiry-btn').show();
            // jQuery('#footer').find('#premium__purchase').remove();
            // jQuery('#footer').css('height', '70px');
		}
	}
}


function headerActions() {
	/*jQuery(document).on('click', '.header__logo', function () {
		if (isAndroid() || isIOS() || isMobile()) {
            jQuery('#footer').find('#premium__purchase').remove();
            jQuery('#footer').css('height', '70px');
            removeActiveClassFromMain();
			jQuery('#app').addClass('noShots no__shots');
			jQuery('#main__homepage-box').show();
			renderHomePage('init');
			window.history.pushState({ page: "homePage" }, "homePage", "/homePage");
			localStorage.setItem('homePageClicked', true);
		}
		else {
			// Open Default Page for Desktop
			lastRenderedPage = localStorage.getItem('lastRenderedPage');
			page = (lastRenderedPage && lastRenderedPage !== 'experience') ? 'experience' : 'community';
			initRender(page);
		}
	});*/
	
	// jQuery(document).on('click', '.header__logo', function () {
	// 	if (isAndroid() || isIOS() || isMobile() || isPwa()) {
	// 		renderNewHomePage();
	// 	}
	// });
	
	jQuery(document).on('click', '.head__notifications, .desktopMenu-notifications', function () {
		if (jQuery('body').hasClass('lightMode')) {
		jQuery('#app, #main__feed-box.main_item').attr('style', 'height: 100% !important;');
			jQuery('#app, #main__feed-box.main_item').css({
				'height': '100% !important',
				'background-color': '#fff'
			});
		}
		else {
			jQuery('#app, #main__feed-box.main_item').attr('style', 'height: 100% !important;');
			
		}
		destroyAllSecondaryTabs();
		if (!guestMaster()) {
			//androidCodesForUpdated(); // MoEngage For Android
			//setUserDataWeb(); // Moengage for Web
			manageSecondary('show', 'notification', 'Post');
			loaderMain('secondary', true);
			renderNotifications('init');
			jQuery('#main__homepage-box').hide();
		}
		else {
			redirect('login');
		}
	});

	jQuery(document).on('click', '.desktopMenu-socialApp', function () {
		destroyAllSecondaryTabs();
		jQuery('.desktopMenu-item').removeClass('active');
        removeActiveClassFromMain();
		jQuery('#main__feed-box').addClass('active');
		jQuery('body').removeClass('fullDesktop');

		jQuery('.desktopMenu-apps .desktopMenu-item').removeClass('active');
		jQuery(this).addClass('active');

		renderNewMenu('social');
	});

	// Handling the Opening of Experiences Page
	jQuery(document).on('click', '.head__experiences, .openExperiences, .desktopMenu-experiencesApp', function () {
		jQuery('#premiumContainer').removeClass('active');
		if (jQuery('#main__experiences-box').is(':visible')) {
			// The element is visible
			console.log('The main__experience-box is visible.');
		} else {
			// The element is not visible
			console.log('The main__experience-box is not visible.');
			fbEvent('flights');
			webAnalytics('flights_open');
		}
		
		jQuery('#app, #main__feed-box.main_item').attr('style', 'height: 100% !important;');
		destroyAllSecondaryTabs();
		jQuery('.desktopMenu-item').removeClass('active');
		redirect('getAllExperiences');
		jQuery('#main__feed-box').removeClass('active');
		jQuery('#main__flightHotels-box').removeClass('active');
		jQuery('body').addClass('fullDesktop');
		//redirect('addListing');
		jQuery('#main__feed-box, #main__search-box, #main__premium-box, #main__addPost-box, #main__profile-box, #main__flightHotels-box, #main__spDashboard-box, #main__chat-box').removeClass('active');

		jQuery('.desktopMenu-apps .desktopMenu-item').removeClass('active');
		jQuery(this).addClass('active');
		jQuery('div#footer ul li[data-item="experiences"]').addClass('active');

		renderNewMenu('experiences');
		//jQuery('.desktopMenu-dayExperience').click();
		
		// Removing &b adding the carousel 
		jQuery('.premium-carousel').remove();
		let image = getFlightsCarouselImages();
		jQuery('.flightsDiscount__header-container').after(createPremiumCarousel(image));
		startAutoSlide(image.length);
		jQuery('.experiences__background img').hide();
	});

	jQuery(document).on('click', '.head__skyScanner, .desktopMenu-fligtsHotels', function () {
		jQuery('.desktopMenu-item').removeClass('active');
        removeActiveClassFromMain();
		jQuery('#footer ul li').removeClass('active');
		jQuery('#app').addClass('no__shots');
		jQuery('body').addClass('fullDesktop');
		if (jQuery("#main__flightHotels-box").length == 0) {
			renderFlightsHotels("init");
		}
		window.history.pushState({ html: jQuery('#main__shots-box').html(), pageTitle: 'Flight & Hotels' }, '', '/listings');

		if (jQuery(this).hasClass('desktopMenu-fligtsHotels')) {
			jQuery('.desktopMenu-apps .desktopMenu-item').removeClass('active');
			jQuery(this).addClass('active');

			renderNewMenu('flights-hotels');
		}
	});
	
	jQuery(document).on('click', '.head__filter', function () {
		jQuery('#app, #main__feed-box.main_item').attr('style', 'height: 100% !important;');
		if (guestMaster()) {
			redirect('login');
		}
		else {
			redirect('filter');
		}
	});
}

function menuActions() {
	//Close the menu on click of mask
	jQuery(document).on('click', '.hamburger__menu-mask', function () {
		hideMenu();
	});

	//Open the menu on click of hamburger
	jQuery(document).on('click', '.header__hamburger, .profile__page[data-selfprofile="true"] .profile__head .profile__head-left, .profile__page[data-selfprofile="true"] .profile__head-left img, .desktopMenu-more', function () {
		showMenu();
		//androidCodesForUpdated(); // MoEngage For Android
		//setUserDataWeb(); // Moengage for Web
	});

	//Menu Item Click
	jQuery(document).on('click', '.hamburger__menu-body ul li, .desktopMenu-item, .desktopMenu-tertirary ul li', function () {
		where = jQuery(this).attr('data-redirect');
		if (where !== 'more') {
			hideMenu();
		}

		if (where == 'logout') {
			if (isAndroid()) {
				Android.googleRevokeAccess();
				jsInit('logout', { "deviceUniqueId": "" });

			}
			else {
				jsInit('logout', { "deviceUniqueId": "" });
			}
		}
		else if (where == 'terms') {
			renderTerms();
		}
		else if (where == 'privacy') {
			renderPrivacy();
		}
		else if (where == 'feedback') {
			redirect('feedback');
		}
		else if (where == 'blocked-users') {
			if (!guestMaster()) {
				redirect('blocked-users');
			}
		}
		else if (where == 'bucket-list') {
			if (!guestMaster()) {
				redirect('bucketList', 'bucketList');
			}
		}
		else if (where == 'premium') {
			//if (!guestMaster()) {
				redirect('premium');
			//}
		}
		else if (where == 'announcements') {
			messagePopups('init', 'announcement', true);
		}
		else if (where == 'about-us') {
			//Redirect to about us page in a new tab
			window.open('/about-us/', '_blank');
		}
		else if (where == 'contact-us') {
			redirect('contact-us');
		}
		else if (where == 'experience-orders') {
			redirect('experience-orders');
		}
		else if (where == 'contacted-leads') {
			redirect('contacted-leads');
		}
		else if (where == 'login') {
			redirect('login');
		}
		else if (where == 'settings') {
			redirect('settings');
		}
		else if (where == 'share') {
			imageUrl = 'https://d1hphxyq85xv5h.cloudfront.net/filters:format(webp)/fit-in/1000x1000/uploads/posts/9191_1680756679696.jpg';
			//https://play.google.com/store/apps/details?id=com.beatravelbuddy.travelbuddy
			whatToShare = "https://bit.ly/2MtKkSH"
			"&apn=" + "com.beatravelbuddy.travelbuddy" +
				"&ibn=" + "com.beatravelbuddy.travelbuddy" +
				"&st=" + "TravelBuddy" +
				"&sd=" + "Find or Follow Travelers" +
				"&si=" + imageUrl;

			if (isIOS()) {
				whatToShare = "https://bit.ly/2MtKkSH";
			}
			

			invokeNativeShare(imageUrl, whatToShare);
		}
		else if (where == 'dashboard') {
			jQuery('.head__spDashboard').click();
		}
		else if (where == 'message-dashboard') {
			redirect('message-dashboard');
		}
		else if (where == 'message-analytics') {
			jsInit('getMessageHistory',{ }, 'render');
		}
		else if (where == 'lead-form') {
			jQuery('.hamburger__menu-mask').click();
			renderPermissionBox('init', 'leadForm');
		}
		else if (where == 'admin-form') {
			jQuery('.hamburger__menu-mask').click();
			renderPermissionBox('init', 'adminForm');
		}
		else if(where == "flightHotels") {
			redirect('flights-hotels');
		}
		else if(where == "premium") {
			redirect('premium', 'premium');	
		}
        else if (where == 'ai-plan-trip') {
            redirect('showAllAiTrips');
		}
		else if (where == 'open-ai') {
			manageSecondary('show', 'ai_itinerary');
			fbEvent('AI_LP');
        }
        else if (where == 'manage-listings') {
            redirect('manageListings');
		}
		else if (where == 'booked-flights') {
			// Calling the API to show all the Booked Flight Details
			jsInit('getUsersFlightBookings', {});
			showFlightsLoaders('bookHistory');
		}
		  
	});

	function hideMenu() {
		//Close the menu. Animate slideout to the left
		jQuery('.hamburger__menu-body').hide('slide', { direction: 'left' }, 300);
		jQuery('.hamburger__menu-mask').hide();
		jQuery('.hamburger__menu').hide(800);
	}

	function showMenu() {
		//Show the menu. Animate slidein from the left
		jQuery('.hamburger__menu-body').show('slide', { direction: 'left' }, 300);
		jQuery('.hamburger__menu-mask').show();
		jQuery('.hamburger__menu').show();
	}

	
	function closeOpenDropdowns() {
		jQuery(".sub-menu").hide();
		jQuery(".sub-menu-settings").hide();
	}
	
	jQuery(document).on("click", "#mySpace", function () {
		if(jQuery(".sub-menu").is(":visible")) {
			jQuery(".sub-menu").hide();
		} else {
			closeOpenDropdowns();
			jQuery(".sub-menu").show();
		}
	});
	jQuery(document).on("click", "#settings-subMenu", function () {
		if(jQuery(".sub-menu-settings").is(":visible")) {
			jQuery(".sub-menu-settings").hide();
		} else {
			closeOpenDropdowns();
			jQuery(".sub-menu-settings").show();
		}
	});

}

function footerActions() {
	// Event listener for click on '.menu__feed.community'
	jQuery(document).on('click', '.menu__feed.community', function () {
		jQuery('.head__filter').show();
	});

	// Event listener for click on various elements
	jQuery(document).on('click', '#footer ul li, .desktopMenu-footerMenu .desktopMenu-item, .desktopMenu-profile, .desktopMenu-chat, .head__search, .head__chat', function () {
		
		
		jQuery('#app, #main__feed-box.main_item').attr('style', 'height: 100% !important;');
		
		if (jQuery('#header').length <= 0) {
			jQuery('#app').prepend(appHeader);
			jQuery('.homepage').remove();
		}
		
		let $this = jQuery(this);
		let item = $this.attr('data-item');
		// Early return if no data-item attribute
		if (!item) return;
		// Handle guest users trying to access restricted areas
		var restrictedList = ['profile', 'addPost', 'chat'];
		if (isAndroid() || isIOS() || isPwa()) {
			restrictedList = ['profile', 'addPost', 'chat', 'feed'];
		}
		
		if (guestMaster() && restrictedList.includes(item)) {
			return redirect('login');
		}
        // Prevent default behavior for already active items except for scrolling
		if ($this.hasClass('active')) {
			if (item === 'feed') {
				jQuery('.tab__item.active').length && jQuery('#' + jQuery('.tab__item.active').attr('data-tab')).animate({ scrollTop: 0 }, 300);
			}
			else if (item === 'experiences') {
				jQuery('.experiences__page').animate({ scrollTop: 0 }, 300);
			}
			else if (item === 'premium') {
				return;
			}
		}
		else {
			item === 'feed' && fbEvent('community', 'Open Community Tab');
			webAnalytics('community_open');
			//fbEvent('communityMainPage', guestMaster() ? 'guest' : manageUserProfile('read', 'name'));
		}
		handleNavigation(item, $this);
		//jQuery('#main__homepage-box').hide();
	});  
	
	function handleNavigation(item, $this) {
		destroyAllSecondaryTabs();
		//localStorage.removeItem('homePageClicked');
	
		// Prepare tracking payload
		let payload = {
			'userId': manageUserProfile('read', 'userId'),
			'viewerId': manageUserProfile('read', 'userId'),
			'Profile Complete': manageUserProfile('read', 'completeness'),
			'Profile Rating & Reviews': manageUserProfile('read', 'rating'),
			'Profile': manageUserProfile('read', 'all'),
			'isVerified': manageUserProfile('read', 'isVerified')
		};
	
		// Update user data and UI elements
		//androidCodesForUpdated(); 
		//setUserDataWeb();
		changeLastActiveStatus();
		jQuery('.head__chat, .head__search').show();
	
		// Define actions for different navigation items
		let actions = {
			'search': renderSearch,
			'premium': renderPremium,
			'profile': manageUserProfile,
			'addPost': renderAddPost,
			'chat': renderChat
		};
	
		// Handle profile cleanup
		if (item === 'profile') {
			
			manageUserProfile('clean');
			webAnalytics('profile_open');
			captureFIAMEvents('profile_open', 'Profile Opened');
			var windowUrl = window.location.href;
			if (!isAndroid() && !isIOS() && jQuery(window).width() <= 1280 && !windowUrl.includes('localhost') && !windowUrl.includes('dev.')) {
				//setTimeout(() => {
					renderBottomSheet('', 'appInstall');
				//}, 1000);
			}
		}
		else if (item == 'search') {
			webAnalytics('search_open');
		}
		else {
			jQuery('#premiumContainer').removeClass('active');
		}
		// Prevent adding a post while another is uploading 
		if (jQuery('.feed__loader').is(':visible') && item === 'addPost') {
			return toast('Please wait while we upload your post.'); 
		}
		
		// Show Onboarding Pages
		/*if (item === 'addPost' && profile.completeness < 35 ) {
			if (jQuery('.traveller-details-review__content').length <= 0) {
				renderBottomSheet('', 'onboardingOne');
			}
		}*/
	
		// Initialize the relevant section if not already present
		if (actions[item] && jQuery(`#main__${item}-box`).length === 0) {
			if (item === 'chat') { // Assuming this condition controls chat loading
				actions[item]('init');
				jQuery('body').prepend('<div class="global__loading" id="lottie__loading"><div class="feed__loading"></div></div>');
				jQuery('#app .global__loading .feed__loading').append('<div class="hold__horses">Loading Chats...</div>');
				jQuery('.feed__loading .hold__horses').css('margin', '208px auto 0');
				lottie.loadAnimation({
					container: document.getElementById('lottie__loading'),
					renderer: 'svg',
					loop: true,
					autoplay: true,
					path: '/view/assets/img/chatOpen.json'
				});
			} else if (actions[item]) {
				actions[item]('init');
			}
		}
	
		// Handle experiences toggle
		if (item === 'experiences') {
			jQuery('.premium-carousel').remove();
			jQuery('.experiencesToggle input[type="radio"][value="1"]').click();
			if (jQuery('.premium-carousel').length > 0) {
				jQuery('.premium-carousel').remove();
			}
			let image = getFlightsCarouselImages();
			jQuery('.flightsDiscount__header-container').after(createPremiumCarousel(image));
			startAutoSlide(image.length);
			jQuery('.experiences__background img').hide();
			jsInit('getAirportInfo', {});
		}
		
		
		
		if (item == 'feed') {
			// Check if specific IDs do not have child divs
			let idsToCheck = ['meetups', 'find', 'trending', 'local', 'influencers', 'following'];
			let noChildDivs = true;

			idsToCheck.forEach(id => {
				let element = jQuery(`#${id}`);
				if (element.find('div').length > 0) {
					noChildDivs = false;
					console.log(`Child divs found for: ${id}`);
				}
			});

			if (noChildDivs) {
				jQuery('#main__tabs ul li.tab__item').first().trigger('click');	
			}
			
			var windowUrl = window.location.href;
			if (!isAndroid() && !isIOS() && jQuery(window).width() <= 1280 && !windowUrl.includes('localhost') && !windowUrl.includes('dev.')) {
				//setTimeout(() => {
					renderBottomSheet('', 'appInstall');
				//}, 1000);
			}
			
			
		}
	
		// Update header styles
		let commonHeaderClasses = ['feed', 'search', 'premium', 'addPost', 'profile', 'experience', 'flightHotels', 'chat', 'experiences'];
		!$this.hasClass('desktopMenu-item') && (commonHeaderClasses.forEach(cls => jQuery('.header__menu').removeClass(`header__menu-${cls}`)), jQuery('.header__menu').addClass(`header__menu-${item}`));
	
		// Update main content area and footer active states
		if (item !== 'experiences') {
			removeActiveClassFromMain();
			jQuery(`#main__${item}-box`).addClass('active');
			jQuery('#footer ul li, .desktopMenu-footerMenu .desktopMenu-item').removeClass('active');
			$this.addClass('active');
		}
		else {
            jQuery('#footer ul > li').not('[data-item="experiences"]').removeClass('active');
        }
			
		// Tracking and push state logic
		let trackEvent = (eventName, payload) => {
			// if ((window.location.href.includes('localhost')) || (window.location.href.includes('dev.'))) return;
			// isAndroid() ? Android.moEngageData(eventName, JSON.stringify(payload)) : Moengage.track_event(eventName, payload);
		};
	
		let pushState = (htmlId, pageTitle, url) => {
			let htmlContent = !htmlId.startsWith('/') ? jQuery(htmlId).html() : ''; 
			window.history.pushState({"html": htmlContent, "pageTitle": pageTitle}, "", htmlId); 
		};
	
		var getTestersEmail = returnTestersEmail();
		var newChatPushState = ['/newChat', '', 'Chat'];
		var chatState; 
		if (/*getTestersEmail.includes(manageUserProfile('read', 'email'))*/ true) {
			chatState = newChatPushState;
		}
		else {
			chatState = ['/chat', '#main__chat-box', 'Chat'];
		}
			
		let items = {
			experiences: { trackEvent: 'TBD_FLIGHTS_PAGE', pushState: ['/flights', '#main__experience-box', 'Flights'] },
			flightHotels: { trackEvent: 'TBD_FLIGHT_HOTELS_PAGE', pushState: ['/listings', '#main__feed-box', 'Feed'] },
			feed: { trackEvent: 'TBD_FEEDS_PAGE', pushState: ['/community', '#main__feed-box', 'Feed'] },
			search: { trackEvent: 'TBD_SEARCH_PAGE', pushState: ['/search', '#main__search-box', 'Search'] },
			premium: { trackEvent: 'TBD_BECOME_VERIFIED_EVENT', pushState: ['/premium', '#main__premium-box', 'Premium'] },
			addPost: { trackEvent: 'TBD_ADD_POST_EVENT', pushState: ['/add-find-post', '#main__addPost-box', 'Add Post'] },
			profile: { trackEvent: 'TBD_PROFILE_EVENT', pushState: ['#profile', '#main__profile-box', 'Profile'] },
			//chat: { trackEvent: 'TBD_CHAT_EVENT', pushState: ['/chat', '#main__chat-box', 'Chat'] },
			chat: { trackEvent: 'TBD_CHAT_EVENT', pushState: chatState },
			experience: { trackEvent: 'TBD_EXPERIENCES_PAGE', pushState: ['/experience', '#main__experience-box', 'Experience'] },
			homePage: { trackEvent: 'TBD_HOME_PAGE', pushState: ['/home', '#homepage.active', 'Home Page'] }
		};
	
		items[item] && (trackEvent(items[item].trackEvent, payload), pushState(...items[item].pushState));
	
		// Update UI based on the selected item
		if (item !== 'feed') {
			item === 'addPost' && jQuery('.addPost__post_discard').show();
			jQuery('#app').toggleClass('no__shots', item !== 'feed'); 
			jQuery('.head__search').show();
		}
		else {
			jQuery('#app').removeClass('no__shots');
			//jQuery('.head__addPost.head__long').show();
			localStorage.getItem('showWalkthroughHomePage') && !localStorage.getItem('showWalkthrough') && showWalkthrough('community');
			
		}
		jQuery('body').toggleClass('fullDesktop', !['profile', 'feed', 'addPost', 'search', 'premium', 'shots'].includes(item));
		
		if (item == 'premium') {
			jQuery('#header').css('display', 'none');
			jQuery('body').prepend('<div class="global__loading" ><div class="feed__loading" id="lottie__loading" style="width: 100%; height: 250px;"></div><div class="hold__horses"></div></div>');

			lottie.loadAnimation({
				container: document.getElementById('lottie__loading'),
				renderer: 'svg',
				loop: true,
				autoplay: true,
				path: '/view/assets/img/loader_lightMode.json'
			});
			fbEvent('premium', 'Enquiry Form Closed');
			var windowUrl = window.location.href;
			/*if (!isAndroid() && !isIOS() && jQuery(window).width() <= 1280 && !windowUrl.includes('localhost') && !windowUrl.includes('dev.')) {
					renderBottomSheet('', 'appInstall');
			}*/
		}
		else {
			jQuery('#header').css('display', 'flex');
		}
		if (item == 'homePage') {
			if (isAndroid() || isIOS() || isMobile() || isPwa()) {
				renderNewHomePage();
				var windowUrl = window.location.href;
				if (!isAndroid() && !isIOS() && jQuery(window).width() <= 1280 && !windowUrl.includes('localhost') && !windowUrl.includes('dev.')) {
					//setTimeout(() => {
						renderBottomSheet('', 'appInstall');
					//}, 1000);
				}
			}
		}
	}

}

function desktopActions() {
	//Open the Followers Profile on Click
	jQuery(document).on('click', '.desktopSideBar-followers-item__left__left, .desktopSideBar-followers-item__left__right', function () {
		userId = jQuery(this).parents('.desktopSideBar-followers-item').attr('data-user');
		redirect('profile', userId);
	});

	//Open the list of all people suggested to follow on click
	jQuery(document).on('click', '.desktopSideBar-followers-footer a', function (a_obj) {
		if (jQuery('.recommendedFollowers__page').length == 0) {
			a_obj.preventDefault();
			redirect('recommendedFollowers');
		}
	});

	//Travel Buddy Trips Menu
	jQuery(document).on('click', '.desktopMenu-trips', function () {
		jQuery('.desktopMenu-dayExperience').click();
		jQuery('.desktopMenu-dayExperience').removeClass('active');

		jQuery('.experiences__body-tab[data-tab="trips"]').click();
		jQuery(this).addClass('active');
	});

	//My Booking Menu
	jQuery(document).on('click', '.desktopMenu-myBookings', function () {
		if (guestMaster()) {
			redirect('login');
			return;
		}
		//redirect('experience-orders');
		jsInit('getUsersFlightBookings', {});
		showFlightsLoaders('bookHistory');
	});

	//Flights
	jQuery(document).on('click', '.desktopMenu-flights', function () {
		destroyAllSecondaryTabs();
		jQuery('.desktopMenu-services').removeClass('active');
		jQuery('.desktopMenu-hotels').removeClass('active');

		jQuery('.single__marketplace-tab[data-tab="flights"]').click();
		jQuery(this).addClass('active');
	});

	//Hotels
	jQuery(document).on('click', '.desktopMenu-hotels', function () {
		jQuery('.desktopMenu-services').removeClass('active');
		jQuery('.desktopMenu-flights').removeClass('active');

		jQuery('.single__marketplace-tab[data-tab="hotels"]').click();
		jQuery(this).addClass('active');
	});

	//Follow on the community
	jQuery(document).on('click', '.desktopSideBar-followers-item__right', function () {

		if(guestMaster('noLogin')){
			redirect ('login');
		}
		else{
			jsInit('followUser', { userId: jQuery(this).parents('.desktopSideBar-followers-item').attr('data-user') }, payload);
        	followButton = jQuery(this).remove();
        	toast('Followed');
		}     
    });
	
	jQuery(document).on('click', '.desktopMenu-services', function () {
        destroyAllSecondaryTabs();
        jQuery('.desktopMenu-flights, .marketplace__tab-item, .desktopMenu-hotels').removeClass('active');
        jQuery(this).addClass('active');
        jQuery('.marketplace__localServices').addClass('active');
	});
	
	jQuery(document).on('click', '.desktopSideBar-section.desktopSideBar-experiences', function () {
		jQuery('.desktopMenu-experiencesApp.desktopMenu-item').click();
		jQuery('.experiences__page').animate({scrollTop: 0}, 300);
	});
}

function notificationActions() {
	//Redirecting on Notification Click
	jQuery(document).on('click', '.notif__item', function () {
		if (!guestMaster()) {
			type = jQuery(this).attr('data-type');
			value = jQuery(this).attr('data-value');

			redirect(type, value);
		}
	});

	//LFB Click
	jQuery(document).on('click', '.lfb__item', function () {
		lfblocation = jQuery(this).attr('data-location');
		redirect('find_posts', { title: "Looking For Buddy", location: lfblocation, id: 0 });
	});
	
	jQuery(document).on('click', '.desktopMenu-section', function () {
		jQuery('#flights__footer').remove();
	});
}

function premiumActions() {
	//Selecting the package
	jQuery(document).on('click', '#premium-mini, #premium-pro, #premium-super', function () {
		jQuery('.premium-description-wrapper').empty();
		let premiumDescription = '';
        jQuery('.pricing-card').each(function () {
            jQuery(this).removeClass('pricing-card-active');
        });
        
        jQuery(this).addClass('pricing-card-active');
        
        if (jQuery(this).is('#premium-mini')) {
			premiumDescription = getPremiumDescription('mini');
		}
		else if (jQuery(this).is('#premium-pro')) {
			premiumDescription = getPremiumDescription('pro');
		}
        else {
			premiumDescription = getPremiumDescription('super');
		}
		premiumDescription.forEach(description => {
			jQuery('.premium-description-wrapper').append(generateDescriptionWrapper(icons.conciergeIcon, description.title, description.description, 'no__conv'));
		});
		
		selectedPackage = jQuery('.pricing-card.pricing-card-active');

		price = Number(jQuery(selectedPackage).attr('data-price')).toFixed(2);

		jQuery('.premium__button__price').html('Rs. ' + price);
		jQuery('.premium__button').attr('id', jQuery(selectedPackage).attr('data-packageid'));
		
		/*function updateTitleDescription(convTitle, convDescription, groupTitle, groupDescription) {
			let noConvElement = jQuery('.description-wrapper.no__conv .premium-description');
			let groupDiscountElement = jQuery('.description-wrapper.group__discounts .premium-description');
			noConvElement.find('h3').text(convTitle);
			noConvElement.find('p').text(convDescription);
			
			groupDiscountElement.find('h3').text(groupTitle);
			groupDiscountElement.find('p').text(groupDescription);
			
		}*/
		
		window.history.pushState({ html: jQuery('#main__premium-box').html(), pageTitle: 'Premium' }, 'Premium', `/${jQuery(this).attr('id')}`);
		
		

	});
    
    jQuery(document).on('click', '.create-listing-premium', function () {
        if (manageUserProfile('read', 'isVerified')) {
			redirect('addListing');
		}
		else if (jQuery('.spDashboard__listings-box .spDashboard__listings-item').length >= 2 && !manageUserProfile('read', 'isVerified')) {
			redirect('premium');
			toast('You need to be a premium member to add another listing');
		}
		else {
			redirect('addListing');
		}
    });

	//FAQ
	jQuery(document).on('click', '.faq-info-box', function () {
		renderFAQs();
	});

	//Terms
	jQuery(document).on('click', '.premium__terms span', function () {
		renderTerms();
	});

	//Open Premium from the desktop menu & sidebar
	jQuery(document).on('click', '.desktopMenu-premium', function () {
		destroyAllSecondaryTabs();
		redirect('premium');
		jQuery('.desktopMenu-premium').addClass('active');
	});
	
	jQuery(document).on('click', '.desktopSideBar-premium-btn', function () {
		redirect('login');
	});
	jQuery(document).on('click', '.desktopSideBar-install', function () {
		window.open('https://beatravelbuddy.com/detect', '_blank');
	});

	jQuery(document).on("click", "#premium__purchase", function (e) {
		if (!guestMaster()) {
			if (isIOS() && useAppBilling) {
				productIdentifier = jQuery('.premium__package.active .premium__packages-item').attr('data-packageid');

				if (productIdentifier == 'tbd__sp__pro' || productIdentifier == 'tbd__pro') {
					productIdentifier = 'com.beatravelbuddy.travelbuddy.tbpro';
				}
				else if (productIdentifier == 'tbd__sp__super' || productIdentifier == 'tbd__super') {
					productIdentifier = 'com.beatravelbuddy.travelbuddy.tbsuper';
				}
				else if (productIdentifier == 'tbd__sp__mini' || productIdentifier == 'tbd__mini') {
					productIdentifier = 'com.beatravelbuddy.travelbuddy.tbmini';
				}
				else if (productIdentifier == 'tbd_traveler_one_week_plus1') {
					productIdentifier = 'com.beatravelbuddy.travelbuddy.weekly';
				}

				billingInfo = {
					productIdentifier: productIdentifier
				}

				window.webkit.messageHandlers.invokeBillingClient.postMessage(billingInfo);
			}
			else if (isAndroid() && useAppBilling) {
				Android.initiateGoogleBilling(jQuery('.premium__package.active .premium__packages-item').attr('data-packageid'), 'IAP');
			}
			else {
				managePayments("premiumInit", {});
			}
		}
        else {
            redirect('login');
        }
	});

}

/*function welcomeScreenActions() {
	jQuery(document).on('click', '.welcome__getStarted', function () {
		manageWelcomeScreens('clean');
		messagePopups('init', 'announcement');
	});
}*/

function reportActions() {
	//Select the report option
	jQuery(document).on('click', '.report__box__option', function () {
		jQuery('.report__box__option').removeClass('active');
		jQuery(this).addClass('active');
	});

	//Close the report box on cancel click
	jQuery(document).on('click', '.report__box-cancel', function () {
		jQuery('.popup__mask').click();
	});

	//Submit the report
	jQuery(document).on('click', '.report__box-complete', function () {
		if (jQuery('.report__box__option.active').length > 0) {
			reason = jQuery('.report__box__option.active').html();
			id = jQuery(this).parents('.report__box').attr('data-id');
			type = jQuery(this).parents('.report__box').attr('data-type');

			if (type == 'post') {
				jsInit('reportPost', { postId: id, reason: reason }, type);
			}
			else if (type == 'profile') {
				jsInit('reportUser', { userId: id, reason: reason }, type);
			}
			else if (type == 'chat') {
				// jsInit('reportUser', { userId: id, reason: reason }, type);
				// jsInit('blockUser', { userId: id, type: 1 });
				toast('Thank you for reporting this user. Our team will take action soon.');
				jQuery('.popup__mask').click();
				loaderMain('global', false);
			}
            else if (type == 'givePremium') {
                console.log('Give Premium', reason.split(' ')[0], id, type);
                jsInit('givePremiumByAdmin', { userId: id, subscriptionValue: reason.split(' ')[0] });
                jQuery('.popup__mask').click();
            }

			loaderMain('global', true);
		}
		else {
			toast('Please select a reason to report');
		}
	});
}

function experiencesActions() {

	// Suggested Location Click
	jQuery(document).on('click', '.conatiner__suggested', function () {
		jQuery('#location__search').val(jQuery(this).text()).trigger('keyup');
		suggestedContainer = jQuery('.suggested_places').html();
		jQuery('.suggested_places').remove();
	});
	
	jQuery(document).on('click', '.premium-carousel-item.experiences', function () {
		console.log('Clicked on Experience', jQuery(this).find('img').attr('src'));
		var clickedExperience = jQuery(this).find('img').attr('src');
		if (clickedExperience.includes('adv')) {
			console.log('Clicked on Adventure');
			jQuery('.experiencesToggle input[type="radio"][value="3"]').click();
			jsInit('getExperiences', { "filter": { "categoryId": '2' } }, 'searchExperiences');
		}
		else if (clickedExperience.includes('intl')) {
			return;
		}
		else {
			console.log('Clicked on Religious');
			jQuery('.experiencesToggle input[type="radio"][value="3"]').click();
			jsInit('getExperiences', { "filter": { "categoryId": '10' } }, 'searchExperiences');
		}
		loaderMain('global', true);
		jQuery('.experiences__body').hide();
		jQuery('#experiences__search .experiences__header-search-btn').html(icons.close).addClass('hide-experience-results');
		jQuery('.experiences__search-categories').addClass('category-selected').append('<div class="experiences__head-categories__box"><div class="experiences__head-category__item">' + jQuery(this).find('.experience__category-title').html() + '<span class="close">' + icons.close + '</span></div></div>');
		jQuery('.experiences__search').addClass('active');
		
		// Removing &b adding the carousel 
		jQuery('.premium-carousel').remove();
	});
	
	
	jQuery(document).on('click', '.order__details-contact__host-chat', function () {
		userId = jQuery(this).parents('.order__details-page').attr('data-host-id');

		var data = {
			userId: userId,
			userName: jQuery(this).parents('.order__details-page').find('.experience__host-head-name').text(),
			userDp: jQuery('.order__details-page').find('.experience__host-head__left img').attr('src')
		}

		destroyAllSecondaryTabs();
		redirect('chat', data);

	});
	//Open single experience
	jQuery(document).on('click', '.experience__item, .experience__topRated-item, .desktopSideBar-experiences-item', function () {
		data = {
			id: jQuery(this).attr('data-id'),
			url: jQuery(this).attr('data-url')
		}
		payload = {
			'data': data,
			'experienceName': data.url,
			'isGuestUser': guestMaster(),
		}
		// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
		// 	Moengage.track_event('TBD_EXPERIENCES_TOP_RATED_OPENED', payload);
		// }
		// if (isAndroid()) {
		// 	Android.moEngageData('TBD_EXPERIENCES_TOP_RATED_OPENED', JSON.stringify(payload));
		// }

		//androidCodesForUpdated(); // MoEngage For Android
		//setUserDataWeb(); // Moengage for Web
		jsInit('getExperiences', { filter: { experienceId: data.id } }, 'newSingleDataRender');

		//redirect('singleExperience', data);
	});

	//Open Bookings
	jQuery(document).on('click', '.head__experienceOrders', function () {
		if (!guestMaster()) {
			redirect('experience-orders');
		}
	});

	//Terms
	jQuery(document).on('click', '.experience__policy', function () {
		where = jQuery(this).attr('data-redirect');

		if (where == 'terms') {
			renderTerms();
		}
		else if (where == 'cancellation') {
			renderCancellation();
		}
		else if (where == 'faqs') {
			renderExperienceFAQs();
		}
	});

	//Single Experience - Back
	jQuery(document).on('click', '.experience__back', function () {
		//Update the URL to be /experiences
		window.history.pushState({ "html": jQuery('#main__experiences-box').html(), "pageTitle": 'Experiences' }, "", '/flights');
		jQuery(this).parents('.secondary__tab').find('.drawer__back').click();
	});

	//Experience CTA - This sets up a temporary order and redirects to booking summary
	jQuery(document).on('click', '.experience__booking-cta', function () {
		renderExperience('experienceBooking');
		payload = {
			'userId': manageUserProfile('read', 'userId'),
			'experienceId': jQuery('.single__experience-page.booking__active').attr('data-id'),
			'experienceName': jQuery('.single__experience-page.booking__active').find('.experience__head-title').text(),
			'experienceLocation': jQuery('.single__experience-page.booking__active').find('.experience__head-location-right').text(),
			'hostedBy': jQuery('.hostedBy').text(),
		}
		// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
		// 	Moengage.track_event('TBD_EXPERIENCES_SLOT_CHANGE', { payload });
		// }
		// if (isAndroid()) {
		// 	Android.moEngageData('TBD_EXPERIENCES_SLOT_CHANGE', JSON.stringify({ payload }));
		// }
	});

	//Booking Summary - Back
	jQuery(document).on('click', '.bookingSummary__head', function () {
		jQuery(this).parents('.secondary__tab').find('.drawer__back').trigger('click');
	});

	//Booking Summary - CTA
	jQuery(document).on('click', '.bookingSummary__cta button', function (a_obj) {
		a_obj.preventDefault();
		console.log('Booking Summary CTA Clicked');
		formData = jQuery('#bookingSummary__signUp').serializeArray();
		formData = validateForm('bookingSummary__signUp', formData);
		console.log(formData);
		if (guestMaster('noLogin')) {
			//redirecting login screen
			redirect('login');
		}
		else {
			bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
			bookingDetails['finalAmount'] = jQuery('.bookingSummary__details-final').attr('data-final-price');
			localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

			console.log('Booking Init');
			payload = {
				'bookingDetails': bookingDetails,
				'userId': manageUserProfile('read', 'userId'),
				'userEmail': manageUserProfile('read', 'email'),
				'userName': manageUserProfile('read', 'name'),

			}
			// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
			// 	Moengage.track_event('TBD_EXPERIENCES_PROCEED_TO_PAY', { payload });
			// }
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_EXPERIENCES_PROCEED_TO_PAY', JSON.stringify({ payload }));
			// }
			loaderMain('bookingSummary__cta', true);
			manageExperienceBookings('init');

		}
		/*if (formData.validator.response == true) {
			if (jQuery('#bookingSummary__signUp').attr('data-state') == 'uniqueCheck') {
				bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
				bookingDetails['finalAmount'] = jQuery('.bookingSummary__details-final').attr('data-final-price');
				localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

				console.log('Booking Init');
				loaderMain('bookingSummary__cta', true);
				manageExperienceBookings('init');
			}
			else {
				jQuery('#bookingSummary__otp-submit').click();
			}
		}
		else {
			console.log('#' + formData.validator.where);
			jQuery('#' + formData.validator.where).parents('.bookingSummary__userDetails-item').addClass('error');
			toast(formData.validator.message);
		}*/
	});

	//Booking Summary Sign Up
	jQuery(document).on('submit', '#bookingSummary__signUp', function (a_obj) {
		a_obj.preventDefault();

		state = jQuery(this).attr('data-state');
		if (state == 'uniqueCheck') {
			jQuery('.bookingSummary__cta button').click();
		}
		else if (state == 'otpValidation') {
			jQuery('#bookingSummary__otp-submit').click();
		}
	});

	//This was important to maintain a flow. If the user presses enter on the phone number field, it should trigger the next step
	jQuery(document).on('keyup', '#bookingSummary__signUp input', function (a_obj) {
		if (a_obj.keyCode == 13) {
			console.log('Enter Pressed');
			jQuery('.bookingSummary__cta button').click();
		}
	});

	//Booking Summary Phone
	jQuery(document).on('keyup', '#bookingSummary__mobile', function () {
		jQuery('#bookingSummary__signUp').attr('data-state', 'uniqueCheck');
		jQuery('.bookingSummary__userDetails-section').remove();
	});

	//Booking Summary - OTP Click
	jQuery(document).on('click', '#bookingSummary__otp-submit', function (a_obj) {
		a_obj.preventDefault();

		formData = jQuery('#bookingSummary__signUp').serializeArray();
		formData = validateForm('bookingSummary__signUp', formData);

		if (formData.validator.response == true) {
			loaderMain('bookingSummary__cta', true);
			manageExperienceBookings('otpValidation');
		}
		else {
			jQuery('#' + formData.validator.where).parents('.bookingSummary__userDetails-item').addClass('error');
			toast(formData.validator.message);
		}
	});

	//Remove Error
	jQuery(document).on('click', '.bookingSummary__userDetails-item.error input', function () {
		jQuery(this).parents('.bookingSummary__userDetails-item').removeClass('error');
	});

	//Booking Summary Policies
	jQuery(document).on('click', '.bookingSummary__policies', function () {
		where = jQuery(this).attr('data-redirect');

		if (where == 'terms') {
			renderTerms();
		}
		else if (where == 'cancellation') {
			renderCancellation();
		}
	});

	//Thank You Page - Back
	jQuery(document).on('click', '.experience__thankYou-back', function () {
		jQuery(this).parents('.secondary__tab').find('.drawer__back').trigger('click');
	});

	//Open the booking box
	jQuery(document).on('click', '.experience__booking-slot', function () {
		renderPermissionBox('init','leadForm', jQuery('.experience__head-title').text(), jQuery('.experience__gallery .experience__gallery-full .swiper-slide-active img').attr('src'));
	});

	//Choose Slot
	jQuery(document).on('click', '.booking__slots ul li', function () {
		jQuery('.booking__slots ul li').removeClass('active');
		jQuery(this).addClass('active');
		jQuery('.booking__slots-selected').html(jQuery(this).attr('data-day') + ', ' + jQuery(this).html());
		renderExperience('setNoOfPax', jQuery(this).attr('data-id'));
	});

	//Month Change
	jQuery(document).on('change', '#booking__month', function () {
		renderExperience('bookingMonthChange');
	});

	//Date Change
	jQuery(document).on('change', '#booking__date', function () {
		renderExperience('bookingDateChange');
	});

	//Booking Details
	jQuery(document).on('click', '.booking__box-button', function () {
		if (!guestMaster()) {
			data = { tickets: jQuery('#bookingSummary__tickets').val(), experienceId: jQuery('.single__experience-page').attr('data-id'), bookingSlot: jQuery('.booking__slots ul li.active').attr('data-id'), slot_time: jQuery('.booking__slots ul li.active').attr('data-slot'), price: jQuery('.experience__price').attr('data-price') };
			localStorage.setItem('bookingDetails', JSON.stringify(data));

			renderExperience('renderBookingValues', data);
			redirect('bookingSummary', localStorage.getItem('selectedExperience'));
			fbEvent('bookingSummary', { value: jQuery('.experience__price').attr('data-price') });

			// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
			// 	Moengage.track_event('TBD_EXPERIENCES_BOOK_NOW', { data });
			// }
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_EXPERIENCES_BOOK_NOW', JSON.stringify({ data }));
			// }
		} else {
			redirect('login');
		}
		/*window.history.pushState({ "html": jQuery('#main__bookingSummary-box').html(), "pageTitle": 'Booking Summary' }, "", '/experiences/booking-summary');
		// }*/
	});

	//Open Host Profile
	jQuery(document).on('click', '.experience__host-offered, .experience__head-host', function () {
		redirect('profile', jQuery(this).attr('data-user'));
	});

	//Experiences Search
	jQuery(document).on('click', '#experiences__search input', function () {
		renderLocations('init', jQuery(this).val(), '#experiences__search input');
	});

	//Redirect to the order details page
	jQuery(document).on('click', '.experience__thankYou-booking__button', function () {
		redirect('orderDetails');
	});

	// Redirect to Premium Page from Book Summary Page
	jQuery(document).on('click', '.bookingSummary__premiumCard', function () {
		link = pageUrl(window.location.href) + '/premium'; //https for beatravelbuddy.com
		window.open(link);
	});

	//On change of the tickets update price
	jQuery(document).on('change', '#bookingSummary__tickets', function () {
		val = jQuery(this).val();
		bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
		bookingDetails['tickets'] = val;
		localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
		renderBookingSummary('updateTotals');
	});

	//Disable the coupon form
	jQuery(document).on('submit', '#bookingSummary__couponForm', function (a_obj) {
		a_obj.preventDefault();
		couponCode = jQuery('#bookingSummary__couponForm input').val();
        noOfTickets = jQuery('#bookingSummary__tickets').val();
        //Clear the form and show a toast saying invalid coupon
        if (couponCode == '' || couponCode == null || couponCode == undefined) {
            toast('Please enter a coupon code to apply');
        }
        else {
            jsInit('validateCoupon', { 'couponCode': couponCode, 'noOfTickets': noOfTickets });
        }
	});

	//Close the experience search results
	jQuery(document).on('click', '.hide-experience-results, .experiences__head-category__item', function () {
		jQuery('.experiences__head-categories__box').remove();
		jQuery('.experiences__body').show();
		jQuery('.experiences__search').html('');
		jQuery('#experiences__search .experiences__header-search-btn').html(icons.searchBar).removeClass('hide-experience-results');
		jQuery('.experiences__search-categories').removeClass('category-selected');
		jQuery('#experiences__search input').val('');
		jQuery('.experiences__search').css('display', 'none !important');
		window.history.pushState('', '', '/experiences');
		jQuery('.premium-carousel').remove();
		let image = getFlightsCarouselImages('experiences');
		jQuery('.experience__card.experience__topRated').after(createPremiumCarousel(image, 'experiences'));
		startAutoSlide(image.length);
	});

	//Restrict Experiences Form Submit
	jQuery(document).on('submit', '#experiences__search', function (a_obj) {
		a_obj.preventDefault();
	});

	//Increment the tickets
	/*jQuery(document).on('click', '.booking__box-tickets .plus, .bookingSummary-booking__box-tickets__item .plus', function () {
		jQuery('#bookingSummary__tickets').get(0).value++;
		jQuery('#bookingSummary__tickets').trigger('change');
	});*/

	//Open share options
	jQuery(document).on('click', '.experience__send', function () {
		if (window.location.href.includes('experiences')) {
			//jQuery('.experience__share').slideToggle();
			if (window.location.href.includes('beatravelbuddy.com') || window.location.href.includes('localhost') || isIOS() || isAndroid()) {
				if (!guestMaster('noLogin')) {
					postId = jQuery('.single__experience-page').attr('data-id');
					postType = 'experience';
					renderChatSend('invoke', { postId: postId, postType: postType });
				}
			}
		}
		else {
			console.log(jQuery('.single__experience-page').attr('data-id'));
			console.log(jQuery(this).parents('#app').find('#secondary .secondary__tab .drawerBody .single__experience-page .experience__gallery .experience__gallery-full .swiper-wrapper  .swiper-slide img').attr('src'));
			if (window.location.href.includes('beatravelbuddy.com') || window.location.href.includes('localhost') || isIOS() || isAndroid()) {
				if (!guestMaster('noLogin')) {
					postId = jQuery('.single__experience-page').attr('data-id');
					postType = 'service';
					renderChatSend('invoke', { postId: postId, postType: postType });
				}
			}
			payload = {
				'listingId': jQuery('.single__experience-page').attr('data-id'),
				'userProfileId': manageUserProfile('read', 'userId'),
				'userName': manageUserProfile('read', 'name'), //
				'userMobile': manageUserProfile('read', 'phoneNumber'),
				'userEmail': manageUserProfile('read', 'email'),
				'imageUrl': jQuery(this).parents('#app').find('#secondary .secondary__tab .drawerBody .single__experience-page .experience__gallery .experience__gallery-full .swiper-wrapper  .swiper-slide img').attr('src'),
				'serviceType': jQuery(this).parents('#secondary').find('.experience__head-category').text(),
				'serviceDescription': jQuery(this).parents('#secondary').find('.experience__content p').text(),
				'servicePrice': jQuery(this).parents('#secondary').find('.experience__pricing .experience__price').text(),
				'priceType': jQuery(this).parents('#secondary').find('.experience__pricing .cost__duration').text(),
				'serviceListingName': jQuery(this).parents('#secondary').find('.experience__head-title h1').text(),
				'serviceListingMobile': "formattedDate",
				'serviceListingEmail': "formattedDate"
			};
			// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
			// 	Moengage.track_event('TBD_SHARE_LISTING', payload);
			// }
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_SHARE_LISTING', JSON.stringify(payload));
			// }
		}
	});

	//Close share options
	jQuery(document).on('click', '.experience__share ul li', function () {
		jQuery('.experience__share').slideUp();
	});

	//Copy the link to clipboard, close the share options & show a toast
	jQuery(document).on('click', '.copy-url', function () {
		copyToClipboard(jQuery(this).attr('data-target'));
	});

	//Category Select
	jQuery(document).on('click', '.experience__category-item', function () {
		jQuery('.experiencesToggle input[type="radio"][value="3"]').click();
		jsInit('getExperiences', { "filter": { "categoryId": jQuery(this).attr('data-id') } }, 'searchExperiences');
		loaderMain('global', true);
		let payload = {
			'categoryId': jQuery(this).attr('data-id'),
			'categoryName': jQuery(this).find('.experience__category-title').html(),
			'isGuestUser': guestMaster()
		}

		// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
		// 	Moengage.track_event('TBD_EXPERIENCE_CATEGORY_OPENED', payload);
		// }
		// if (isAndroid()) {
		// 	Android.moEngageData('TBD_EXPERIENCE_CATEGORY_OPENED', JSON.stringify(payload));
		// }

		jQuery('.experiences__body').hide();
		jQuery('#experiences__search .experiences__header-search-btn').html(icons.close).addClass('hide-experience-results');
		jQuery('.experiences__search-categories').addClass('category-selected').append('<div class="experiences__head-categories__box"><div class="experiences__head-category__item">' + jQuery(this).find('.experience__category-title').html() + '<span class="close">' + icons.close + '</span></div></div>');
		jQuery('.experiences__search').addClass('active');
		
		// Removing &b adding the carousel 
		jQuery('.premium-carousel').remove();
	});

	jQuery(document).on('click', '.experiences__head-category__item', function () {
		jQuery('.experiences__search').removeClass('active');
		let image = getFlightsCarouselImages('experiences');
		jQuery('.experience__card.experience__topRated').after(createPremiumCarousel(image, 'experiences'));
		startAutoSlide(image.length);
	});

	//Book Experiences Button from the Orders Page
	jQuery(document).on('click', '.allOrders__noOrders-button', function () {
		jQuery(this).parents('.secondary__tab').find('.drawer__back').click();
		jQuery('.openExperiences').click();
	});

	//Single Order Click
	jQuery(document).on('click', '.allOrders__item', function () {
		redirect('orderDetails', jQuery(this).attr('data-id'));
	});

	//Open Coupon Code Drawer
    jQuery(document).on('click', '.bookingSummary__coupons-viewAll', function (a_obj) {
		a_obj.preventDefault();
		renderCoupons('init');
	});

	//Coupon select
	jQuery(document).on('click', '.coupon__item', function () {
		couponCode = jQuery(this).attr('data-coupon-code');
        noOfTickets = jQuery('#bookingSummary__tickets').val();
        //Clear the form and show a toast saying invalid coupon
        if (couponCode == '' || couponCode == null || couponCode == undefined) {
            toast('Please enter a coupon code to apply');
        }
        else {
            jsInit('validateCoupon', { 'couponCode': couponCode, 'noOfTickets': noOfTickets });
        }
		drawer('close');
	});

	//Booking Summary Login
	jQuery(document).on('click', '.bookingSummary__login', function () {
		redirect('login');
	});

	//Open the form
	jQuery(document).on('click', '.experience__item-becomeExperienceProvider', function () {
		//window.open('https://forms.gle/fGYPCF9cvJVdZvVQ8');
		jQuery('div#footer ul li[data-item="feed"] svg').click();
	});

	//Single Orders Page - Back
	jQuery(document).on('click', '.order__details-head span.back', function () {
		jQuery(this).parents('.secondary__tab').find('.drawer__back').click();
	});

	//Open Single Experience Page from the Orders Page
	jQuery(document).on('click', '.order__details-host', function () {
		data = {
			id: jQuery(this).parents('.order__details-page').attr('data-experience-id'),
			url: jQuery(this).parents('.order__details-page').attr('data-experience-url'),
			title: jQuery(this).parents('.order__details-page').attr('data-experience-title')
		}
		redirect('singleExperience', data);
	});

	//Tab Switch between day experiences & trips
	jQuery(document).on('click', '.experiences__body-tab', function () {
		tab = jQuery(this).attr('data-tab');

		jQuery('.experiences__body-tab').removeClass('active');
		jQuery(this).addClass('active');

		jQuery('.experiences__body-item').removeClass('active');
		jQuery('.experiences__body-' + tab).addClass('active');
	});

	//Chat Starter Kit
	jQuery(document).on('click', '.chat_starter-Kit ul li', function () {
		message = jQuery(this).attr('data-message');
		jQuery('.type-msg').val(message);
		jQuery('.send-msg-btn').click();
		jQuery('.chat_starter-Kit').hide()
		console.log('work');
	});

	jQuery(document).on('click' , '.see_all_experiences' , function () {
		destroyAllSecondaryTabs();
		jQuery('.menu__feed.openExperiences svg').click();
	});
	
	jQuery(document).on('change', 'input[name="searchToggle"]', function () {
		
		var getTestersEmail = returnTestersEmail();
		
		
		var selectedValue = jQuery(this).val();
		jQuery('.booking-option.experiencesToggle label').removeClass('checked');
		//jQuery('.experiences__body-tabs').toggleClass('hide');
		jQuery('.experiences__body-tab[data-tab="trips"]').click();
		jQuery('.premium-carousel').remove(); // Remove the premium carousel
		
		
		jQuery('.experiences__page').show();
		jQuery('.container').remove();
		// Add the 'checked' class to the label corresponding to the selected value
		jQuery(`input[name="searchToggle"][value="${selectedValue}"]`).parent('label').addClass('checked');
		
		if (localStorage.getItem('userLong') > 0 && localStorage.getItem('userLat') > 0) {
			latitude = localStorage.getItem('userLat');
			longitude = localStorage.getItem('userLong');
		}
		else {
			latitude = 22.9734;
			longitude = 78.6569;
		}
		
		let images;
		switch (selectedValue) {
			case '1':
				// Action for Flights
				if (jQuery('.experiences__container-new').length == 0) {
					jsInit('getExperienceDashboard', { latitude: latitude, longitude: longitude });
				}
				console.log('Flights selected');
				window.history.pushState({ "html": jQuery('#main__flights-box').html(), "pageTitle": 'Flights' }, "", '/flights');
				
				changeTitleDescription('Travel Buddy-Flights', 'Book your flights with us and enjoy exclusive discounts!');
				
				jQuery('.experiences__header-box, .hostels__header-box').remove();
				jQuery('.experiences__background img').hide();
				
				jQuery('.flights__header-subtitle').show();
				jQuery('#flightSearchForm').show();
				jQuery('.experiences__header').css({
					'height': '525px',
					'margin': 'unset',
				});
				jQuery('.flightsDiscount__header-container').show();
				images = getFlightsCarouselImages();
				jQuery('.flightsDiscount__header-container').after(createPremiumCarousel(images));
				startAutoSlide(images.length);

				// Add your code here for Flights
				break;
			case '2':
				// Action for Hotels
				//return;
				var currentUrl = window.location.href;
				if (currentUrl.includes('localhost')) {
					window.open('http://localhost:3000/hotels', '_self');
				}
				else if (currentUrl.includes('dev.beatravelbuddy.com')) {
					window.open('https://dev.beatravelbuddy.com/hotels', '_self');
				}
				else {
					window.open('https://beatravelbuddy.com/hotels', '_self');
				}
				break;
				
				/*console.log('Hotels selected');
				window.history.pushState({ "html": jQuery('#main__flights-box').html(), "pageTitle": 'Hotels' }, "", '/hotels');
				
				jQuery('#flightSearchForm').hide(); // Hide the flight search form
				jQuery('.experiences__header-box').remove(); // Remove the experiences search box
				jQuery('.experiences__header').css({
					'height': '400px',
					'margin': 'unset',
				}); // Adjust the height of the header
				jQuery('.flights__header-subtitle').hide(); // Hide the flights subtitle
				jQuery('.experiences__header').append(getHostelsView()); // Append the hotels search box
				
				// Append the auto slide carousel
				images = getFlightsCarouselImages('hotels');
				jQuery('.flightsDiscount__header-container').after(createPremiumCarousel(images));
				startAutoSlide(images.length);
				
				minMaxDate('.check__in-text');
				minMaxDate('.check__out-text');
				
				jsInit('getCityCodesForHotels', { countryCode: 'IN' }, '#');
					
				break;*/
			case '3':
				// Action for Experiences
				window.location.href = 'https://trips.beatravelbuddy.com/';
				changeTitleDescription('TravelBuddy — Holiday Packages, International Tours, Experiences & Group Trips');
				return;
				if (jQuery('.experiences__container-new').length == 0) {
					jsInit('getExperienceDashboard', { latitude: latitude, longitude: longitude });
				}
				// else {
				// 	if (typeof newExpContainer !== "undefined" && newExpContainer !== null && jQuery('.experiences__container-new').length == 0) {
				// 		jQuery('.experiences__body-body').append(newExpContainer);
				// 	}
				// }
				console.log('Experiences selected');
				window.history.pushState({ "html": jQuery('#main__experiences-box').html(), "pageTitle": 'Experiences' }, "", '/experiences');
				
				changeTitleDescription('Travel Buddy-Packages', 'Explore our curated experiences and make unforgettable memories!');
				
				jQuery('#flightSearchForm').hide();
				jQuery('.hostels__header-box').remove();
				jQuery('.experiences__header').append(getExperiencesSearchView());
				jQuery('.flights__header-subtitle').hide();
				jQuery('.experiences__header').css({
					'height': '47px',
					'margin': 'unset',
				});
				//jQuery('.experiences__background img').show();
				
				images = getFlightsCarouselImages('experiences');
				jQuery('.experience__card.experience__topRated').after(createPremiumCarousel(images, 'experiences'));
				startAutoSlide(images.length);
				jQuery('.flightsDiscount__header-container').hide();
				// Add your code here for Experiences
				break;
			case '4':
				if (jQuery('.experiences__container-new').length > 0) {
					newExpContainer = jQuery('.experiences__container-new').html();
					jQuery('.experiences__container-new').remove();
				}
				window.history.pushState({ page: "groupTrips" }, "groupTrips", "/groupTrips");
				
				changeTitleDescription('Travel Buddy-Group Trips', 'Explore our group trips and make new friends along the way!');
				
				jQuery('body').prepend('<div class="global__loading" ><div class="feed__loading" id="lottie__loading" style="width: 100%; height: 250px;"></div><div class="hold__horses"></div></div>');

				lottie.loadAnimation({
					container: document.getElementById('lottie__loading'),
					renderer: 'svg',
					loop: true,
					autoplay: true,
					path: '/view/assets/img/loader_lightMode.json'
				});
				//if (getTestersEmail.includes(manageUserProfile('read', 'email'))) {
				// jQuery('.booking-option.experiencesToggle label:not(.checked)').css('color', 'white');
				
				jsInit('getExperiences', {
						"filter": {
							"trending": {
								"type": "group_trips"
							}
						}
					}, "trendingGroupTripsHome");
					jQuery('.experiences__page').hide();
				//}
				break;
			case '5':
				// Action for Plan Trip
				// Load /plan-your-trip url
				window.location.href = '/plan-your-trip';
				changeTitleDescription('Travel Buddy-Plan Trip', 'Plan your trip with Travel Buddy. We will help you plan your trip to your dream destination!');
				break;
			
		default:
			console.log('Unknown option selected');
		}
	});
	


}


//Marketplace Actions
function marketplaceActions() {
	//Switch Tabs between local services, hotel bookings & flight bookings
	jQuery(document).on('click', '.single__marketplace-tab', function () {
		tab = jQuery(this).attr('data-tab');

		jQuery('.single__marketplace-tab').removeClass('active');
		jQuery(this).addClass('active');

		jQuery('.marketplace__tab-item').removeClass('active');
		jQuery('.marketplace__' + tab).addClass('active');

		if (tab == 'localServices') {
			if (jQuery('.services__item').length == '') {
				redirect('getAllServices');
			}
        }
	});
    
    jQuery(document).on('click', '.experience__itenary-item', function () {
        jQuery(this).toggleClass('compact');
    });
}

//SP Dashboard Actions
function spDashboardActions() {
	//Open Dashboard
	jQuery(document).on('click', '.head__spDashboard, .desktopMenu-dashboard', function () {
		jQuery('#main__feed-box').removeClass('active');
		jQuery('#main__homepage-box').hide();
		// jQuery('#footer ul li').removeClass('active');
		jQuery('#app').addClass('no__shots');

		if (jQuery('#main__spDashboard-box').hasClass('active')) {
			jQuery('#main__spDashboard-box').removeClass('active');
			jQuery(this).removeClass('active');
			jQuery('#main__flightHotels-box').addClass('active');
		}
		else {
			jQuery(this).addClass('active');
			jQuery('#main__spDashboard-box').addClass('active');
			jQuery('#main__flightHotels-box').removeClass('active');
		}

		//Add /Dashboard to the URL
		window.history.pushState({ "html": jQuery('#main__spDashboard-box').html(), "pageTitle": 'Dashboard' }, "", '/dashboard');
	});

	//Open Contacted Leads
	jQuery(document).on('click', '.spDashboard__masthead-insights__leads', function () {
		redirect('contacted-leads');
	});

	//Profile Views for now, we will swap it with service views.
	jQuery(document).on('click', '.spDashboard__masthead-insights__views', function () {
		if (!guestMaster()) {
			loaderMain('profileViews', true);
			managePopups('show', 'profileViews');
			jsInit('fetchProfileViews', { 'pageNumber': 0 });
		}
	});

	//Load User Profile on Click of Tavellers visiting location & Queries for locaiton
	jQuery(document).on('click', '.spDashboard__visiting-innertitle', function () {
		redirect('profile', jQuery(this).parents('.spDashboard__visiting-item').attr('data-user'));
	});

	//Load User Profile on Click of Nearby Travellers
	jQuery(document).on('click', '.spDashboard__nearby-item', function () {
		redirect('profile', jQuery(this).attr('data-user'));
	});

	//All Queries
	jQuery(document).on('click', '.spDashboard__queries-title-right', function () {
		// redirect('queries');
		redirect('ask_view-related', { title: 'Similar Plans', location: jQuery('.spDashboard__queries-title-right span').attr('data-location') });
	});

	//All Find Posts
	jQuery(document).on('click', '.spDashboard__visiting-title-right span', function () {
        currentLatLong = getLatLongfromStorage();
        redirect('view_related', { title: 'Similar Plans', id: jQuery('.spDashboard__visiting-box .swiper-wrapper .spDashboard__visiting-item:first-child').attr('data-post-id'), location: jQuery(this).attr('data-location'), postLat: currentLatLong['latitude'], postLong: currentLatLong['longitude']});
    });

	//Add New Listing
	jQuery(document).on('click', '.spDashboard__listings-item-add', function () {
		if (manageUserProfile('read', 'isVerified')) {
			redirect('addListing');
		}
		else if (jQuery('.spDashboard__listings-box .spDashboard__listings-item').length >= 2 && !manageUserProfile('read', 'isVerified')) {
			redirect('premium');
			toast('You need to be a premium member to add another listing');
		}
		else {
			redirect('addListing');
		}
	});

	//Edit Listing
	jQuery(document).on('click', '.spDashboard__listing-item__cta-edit', function () {
		redirect('editListing', { listingId: jQuery(this).parents('.spDashboard__listings-item').attr('data-listing-id') });
	});

	//Delete Listing
	jQuery(document).on('click', '.spDashboard__listing-item__cta-delete', function () {
		jQuery(this).addClass('delItem');
		renderPermissionBox('init', 'addListing-delete');
	});

	//Tab Switch for Contacted & New Leads
	jQuery(document).on('click', '.leads__tab-item', function () {
		if (jQuery(this).hasClass('.leads__tab-new')) {
			jQuery('.leads__tab-item, .leads__tab-body-item').removeClass('active');
			jQuery(this).addClass('active');
			jQuery('.leads__tab-body-new').addClass('active');
		}
		else {
			jQuery('.leads__tab-item, .leads__tab-body-item').removeClass('active');
			jQuery(this).addClass('active');
			jQuery('.leads__tab-body-item').eq(jQuery(this).index()).addClass('active');
		}
	});

	//Connect with lead
	jQuery(document).on('click', '.lead__item-connect', function () {
		listingInterestId = jQuery(this).parents('.lead__item').attr('data-id');

		if (listingInterestId) {
			jsInit('connectLead', { "listingInterestId": listingInterestId });
		}
	});

	//Delete Lising
	jQuery(document).on('click', '.spDashboard__listing-item__cta-delete', function () {
		console.log('Delete Listing');
		renderPermissionBox('init', 'addListing-delete');
	});

	//Send Message to Travelers & Queries
	jQuery(document).on('click', '.spDashboard__visiting-cta', function () {
		console.log('Open Chat');
		console.log(jQuery(this).parents('.spDashboard__visiting-item').attr('data-user'));
		console.log(jQuery(this).parents('.spDashboard__visiting-item').find('.spDashboard__visiting-image img').attr('src'));
		console.log(jQuery(this).parents('.spDashboard__visiting-item').find('.spDashboard__visiting-name').text());
		var data = {
			userId: jQuery(this).parents('.spDashboard__visiting-item').attr('data-user'),
			userDp: jQuery(this).parents('.spDashboard__visiting-item').find('.spDashboard__visiting-image img').attr('src'),
			userName: jQuery(this).parents('.spDashboard__visiting-item').find('.spDashboard__visiting-name').text()
		};
		redirect('chat', data);
	});

	// Open Chat from spDashboard__masthead-insights__messages button
	jQuery(document).on('click', '.spDashboard__masthead-insights__messages', function () {
		console.log('Open Chat');
		jQuery('.head__chat').click();
	});
}

function addListingActions() {
	//Exit the Add Listing Page
	jQuery(document).on('click', '.addListings__exit', function () {
		jQuery('.secondary__tab:last-child').hide('slide', { direction: 'right' }, 300);
		setTimeout(function () {
			jQuery('.secondary__tab:last-child').remove();
			jQuery('.ui-effects-wrapper').remove();
		}, 300);
	});

	//Back
	jQuery(document).on('click', '.addListings__back', function () {
		jQuery(this).parents('.addListing__page').hide('slide', { direction: 'left' }, 300);
		step = Number(jQuery(this).parents('.addListing__page').find('.addListing__steps').attr('data-step')) - 1;

		if (step == 0) {
			jQuery('.addListing__home').show('slide', { direction: 'left' }, 300);
		}
		else {
			jQuery('.addListing__page-' + step).show('slide', { direction: 'left' }, 300);
		}
	});

	function saveListing(formData, listingId, type) {
		newListingObj = {};
		newListingObj.listingId = listingId;
		newListingObj.listingTypeId = formData.filter(x => x.name == "addListing-serviceType")[0].value;
		newListingObj.listingName = formData.filter(x => x.name == "addListing-title")[0].value;
		//name of the element for address has to be correctd in render js
		newListingObj.listingAddress = formData.filter(x => x.name == "addListing-address1")[0].value;
		newListingObj.listingAddress2 = formData.filter(x => x.name == "addListing-address-2")[0].value;
		newListingObj.listingAddressLocality = formData.filter(x => x.name == "addListing-address-area")[0].value;
		newListingObj.listingCity = formData.filter(x => x.name == "addListing-address-city")[0].value;
		newListingObj.listingState = formData.filter(x => x.name == "addListing-address-state")[0].value;
		newListingObj.listingCountry = formData.filter(x => x.name == "addListing-address-country")[0].value;
		newListingObj.listingZipCode = formData.filter(x => x.name == "addListing-address-pincode")[0].value;

		//Room attributes
		roomAttrs = [];
		attrSet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

		attrSet.forEach(ele => {
			formData.filter(x => x.name == "addListing-section-" + ele).forEach(
				function (item, idx) {
					roomAttrs.push({ 'attributeId': item.value });
				}
			);
		});

		//other params
		// formData.filter(x => x.name == "addListing-section-3").forEach(
		//     function (item, idx) {
		//         roomAttrs.push({ 'attributeId': item.value });
		//     }
		// );
		newListingObj.listingAttribute = roomAttrs;
		newListingObj.listingDescription = formData.filter(x => x.name == "addListing-about")[0].value;

		//below non mandatory
		newListingObj.youtubeLink = (formData.filter(x => x.name == "addListing-social-youtube")[0].value == 'Not Available') ? '' : formData.filter(x => x.name == "addListing-social-youtube")[0].value;
		newListingObj.websiteLink = (formData.filter(x => x.name == "addListing-social-website")[0].value == 'Not Available') ? '' : formData.filter(x => x.name == "addListing-social-website")[0].value;
		newListingObj.twitterLink = (formData.filter(x => x.name == "addListing-social-linkedin")[0].value == 'Not Available') ? '' : formData.filter(x => x.name == "addListing-social-linkedin")[0].value;
		newListingObj.facebookLink = (formData.filter(x => x.name == "addListing-social-facebook")[0].value) ? '' : formData.filter(x => x.name == "addListing-social-facebook")[0].value;
		newListingObj.instagramLink = (formData.filter(x => x.name == "addListing-social-instagram")[0].value) ? '' : formData.filter(x => x.name == "addListing-social-instagram")[0].value;

		newListingObj.costAmount = formData.filter(x => x.name == "addListing-price")[0].value;
		pricingAvailable = formData.filter(x => x.name == "addLisitngs-pricingAvailable");
		newListingObj.isPriceDefined = 0;
		if (pricingAvailable.length > 0) {
			newListingObj.isPriceDefined = pricingAvailable[0].value;
		}
		if (newListingObj.isPriceDefined == 'on') {
			newListingObj.isPriceDefined = 1;
		}
		//per day or per hour something like this
		newListingObj.costDurationId = formData.filter(x => x.name == "addListing-priceType")[0].value;

		//below is an arrya with mediaPath, mediaType [non mandatory],
		newListingObj.listingMedia = [];
		for (var i = 0; i < 18; i++) {
			uploadedImgs = formData.filter(x => x.name == "listingImage-" + i);
			if (uploadedImgs.length) {
				mediaId = jQuery('input[name="listingImage-' + i + '"]').attr('data-media-id');
				if (mediaId == undefined) {
					mediaId = 0;
				}

				newListingObj.listingMedia.push({ mediaPath: uploadedImgs[0].value, mediaId: mediaId });
			}
			else {
				break;
			}
		}
		if (type == 'draft') {
			newListingObj.listingStatus = 'draft';
		}
		else {
			newListingObj.listingStatus = 'inreview';
		}
		newListingObj.currency = 'INR';

		newListingObj.listingLat = formData.filter(x => x.name == "addListing-address-lat")[0].value;
		newListingObj.listingLong = formData.filter(x => x.name == "addListing-address-long")[0].value;

		console.log(newListingObj);
		jsInit('saveListing', newListingObj, undefined);
	}

	//Add Listing next step
	jQuery(document).on('click', '.addListings__footer', function () {
		formData = {};
		position = jQuery(this).attr('data-position');
		listingId = jQuery('#addListings__form').attr('listing-id')
		formData = jQuery('#addListings__form').serializeArray();
		new_position = Number(position) + 1;
		continueAction = false;

		if (new_position < 9 || jQuery(this).attr('data-position') == 'draft' || jQuery(this).attr('data-position') == 'publish') {
			if (position == 1) {
				serviceId = jQuery('.addListing__form-service.active').attr('data-service-id');
				jsInit('serviceAttributes', { serviceId: serviceId });
				jsInit('costDurations', { serviceId: serviceId });
				continueAction = true;
			}
			else if (position == 5) {
				console.log('Position 5');
				var hasChildDiv = jQuery('.form__image-container__small:has(input)').length > 0;
				console.log(hasChildDiv);
				if (!hasChildDiv) {
					toast('Please upload at least one image/video');
					return;
				}
			}
			else if (position == 2 || position == 3 || position == 4 || position == 'draft' || position == 'publish') {
				formData = validateForm('addListings__form-page' + position, formData);

				//|| position == 7
				if (formData.validator.response == true) {
					continueAction = true;
				}
			}

			if (continueAction && position == 'draft') {
				console.log('Draft');
				saveListing(formData.request, listingId, 'draft');
			}
			else if (continueAction && position == 'publish') {
				console.log('Publish');
				saveListing(formData.request, listingId, 'publish');
			}
			else if (continueAction || position == 0 || position == 5 || position == 6) {
				jQuery(this).parents('.addListing__page').hide('slide', { direction: 'left' }, 300);
				jQuery('.addListing__page-' + new_position).show('slide', { direction: 'right' }, 300);
			}
			else {
				if (position == 2 || position == 3 || position == 4 || position == 7) {
					console.log('#' + formData.validator.where);
					jQuery('#' + formData.validator.where).parents('.form__row').addClass('error');
					toast(formData.validator.message);
				}
			}
		}
	});

	//Select Listing Type
	jQuery(document).on('click', '.addListing__form-service', function () {
		jQuery('.addListing__form-service').removeClass('active');
		jQuery(this).addClass('active');

		jQuery('.addListing__form-service').each(function () {
			jQuery(this).find('input').prop('checked', false);
		});

		jQuery(this).find('input').prop('checked', true);
	});

	//Return to Dashboard from Add Listing
	jQuery(document).on('click', '.addListings__thankYou-back', function () {
		jQuery('.addListings__exit').trigger('click');
	});

	//Checkbox click
	jQuery(document).on('click', '.form__checkbox-item', function () {
		if (jQuery(this).hasClass('active')) {
			jQuery(this).removeClass('active');
			jQuery(this).find('input').prop('checked', false);
		}
		else {
			jQuery(this).addClass('active');
			jQuery(this).find('input').prop('checked', true);
		}
	});

	//Character Count
	jQuery(document).on('keyup', '#addListing-title, #addListing-about, #addListing-special', function () {
		//Count the rateNow text area characters
		val = jQuery(this).val();
		maxChar = jQuery(this).attr('maxlength');
		jQuery(this).parents('.form__row').find('.character__count').html(val.length + '/' + maxChar).attr('data-count', val.length);
	});

	//Clear the error on input focus
	jQuery(document).on('focus', '.form__row input, .form__row textarea', function () {
		jQuery(this).parents('.form__row').removeClass('error');
	});

	//Upload Image
	jQuery(document).on('click', '.form__upload-box__button', function () {
		if (jQuery(this).hasClass('form__upload-box__button-gallery')) {
			jQuery('#addListing-media').removeAttr('capture').attr('accept', 'image/*');
		}

		else if (jQuery(this).hasClass('form__upload-box__button-camera')) {
			jQuery('#addListing-media').attr('capture', 'camera').attr('accept', 'image/*');
		}

		jQuery('#addListing-media').trigger('click');
	});

	//Upload Image
	jQuery(document).on('change', '#addListing-media', function () {
		console.log('Upload Image');
		files = jQuery(this).prop('files');

		pendingSlots = 13 - jQuery('.form__image-container__small img').length;
		var counter = 0;
		var fileIdx;

		if (files.length > 0 && files.length < pendingSlots) {
			var uploadData = new FormData();
			var promises = []; // Array to hold all promises

			for (i = 0; i < files.length; i++) {
				if (files[i].type.match('image.*')) {
					let promise = new Promise((resolve) => {
						reader = new FileReader();
						reader.onload = function (a_img) {
							fileName = this.fileName;

							for (let y = 0; y < 11; y++) {
								if (jQuery('input[name="listingImage-' + y + '"').length == 0) {
									counter++;
									fileIdx = y;
									console.log(fileIdx);
									break;
								}
							}

							//Check if the container has any images
							jQuery('.form__image-container__small').each(function () {
								if (jQuery(this).find('img').length == 0) {
									jQuery(this).append('<img src="' + a_img.target.result + '" /><span class="form__image-container__small-remove">x</span>');
									jQuery(this).append('<input type="hidden" name="listingImage-' + fileIdx + '" value="' + fileIdx + '" />');
									return false;
								}
							});
							resolve();
						}
						reader.fileName = files[i].name;
						reader.fileIdx = i;
						reader.readAsDataURL(files[i]);
					});
					promises.push(promise);
					var file = files[i];
					uploadData.append('uploadListingImages' + i, file, file.name);
				}
			}

			//Also append the user id to the form data
			uploadData.append('data', manageUserProfile('read', 'userId'));
			// Wait for all promises to resolve before running jsUpload
			Promise.all(promises).then(() => {
				counter = counter - 1;
				if (fileIdx - counter > 0) {
					jsUpload('uploadListingImages', uploadData, (fileIdx - counter));
				}
				else {
					jsUpload('uploadListingImages', uploadData, 0);
				}
			});

		}
		else {
			toast('Please select at least 1 image and maximum 12 images');
		}
	});

	//Remove Image
	jQuery(document).on('click', '.form__image-container__small-remove', function () {
		//Move the container to the end of the list
		jQuery(this).parents('.form__image-container__small').appendTo('.row.flex');
		jQuery(this).parents('.form__image-container__small').html('');
	});

	//Support
	jQuery(document).on('click', '.form__contactHelp-title', function () {
		//Redirect to mail
		window.open('mailto:support@beatravelbuddy.com');
	});

	//Open Listing Preview
	jQuery(document).on('click', '.spDashboard__listing-item__cta-preview', function () {
		redirect('singleService', jQuery(this).parents('.spDashboard__listings-item').attr('data-listing-id'));
	});
}

function settingsActions() {
	jQuery(document).on('click', '#change_password_label', function () {
		redirect('change_password');
	});

	jQuery(document).on('click', '.deactivate_account', function () {
		redirect('deactivate_account');
	});

	//Change Password
	jQuery(document).on('submit', '#change_pass_form', function (e) {
		e.preventDefault();
		formData = jQuery(this).serializeArray();
		formData = validateForm('change_password', formData);

		if (formData.validator.response) {
			//toast('Valid');
			jsInit('changePassword' , { 'oldPassword' : jQuery('#old_pass').val() , 'newPassword' : jQuery('#new_pass').val() });
		}
		else {
			console.log(formData);
			toast(formData.validator.message);
		}

	})

	//Deactivate Account
	jQuery(document).on('submit', '.deactivate_form_box', function (e) {
		e.preventDefault();
		formData = jQuery(this).serializeArray();
		reason = formData[0]['value'];

		if (reason) {
			jsInit('deactivateAccount', { "deactivateReason": reason });
		}
		else {
			toast('There was an error deactivating your account.');
		}
	});

	//Switch Light Dark Mode
	jQuery(document).on('click', '.day-night_toggle_box.settings_box', function () {
		//Get the state, if it is checked then it is dark mode otherwise check it
		isLightMode = jQuery('#light-dark-switch').is(':checked');
		jQuery('#light-dark-switch').prop('checked', !isLightMode);
		localStorage.setItem('lightMode', isLightMode);
		jQuery('body').toggleClass('lightMode', isLightMode);
		jQuery('.skyscanner__hotel_box-dark, .skyscanner__flight_box-dark').toggle(isLightMode);
		jQuery('.skyscanner__hotel_box-light, .skyscanner__flight_box-light').toggle(!isLightMode);
	});

}
function triggerLocationSearch(from) {
	if (from == 'experiences__search') {
		val = jQuery('#experiences__search input').val();
		if (val.length > 2) {
			jsInit('getExperiences', { filter: { location: val, filterText: val.includes(',') ? val.split(',')[0] : val } }, 'searchExperiences');
		}

		jQuery('.experiences__body').hide();
		jQuery('.experiences__search').css('display', 'none !important');
		jQuery('#experiences__search .experiences__header-search-btn').html(icons.close).addClass('hide-experience-results');
	}
	else if (from == 'editProfile') {
		val = jQuery('.editHanging__name input').val();
		if (val.length > 2) {
			jsInit('editProfile', { latitude: 0.0, location: val, longitude: 0.0, pageNumber: '0', }, 'pagination');
		}
	}
	else if (from == 'services__search') {
		val = jQuery('.experiences__search-box input').val();
		if (val.length > 2) {
			console.log('search location services');
			Number(jQuery(tab).attr('data-page', '0'));

			jsInit('fetchServices', { latitude: 0.0, location: val, longitude: 0.0, pageNumber: '0', }, 'pagination');
		}
		jQuery('.main__container_services').hide();
		jQuery('#services__search button').html(icons.close).addClass('hide-services-results');
	}
	else if (from == 'influencers__search') {
		val = jQuery('#influencer__search').val();
		if (val.length > 2) {
			jsInit('fetchInfluencers', { location: val, gender: 0, pageNumber: 0 }, 'search');
		}
	}
}

function contactActions() {
	jQuery(document).on('submit', '#contactUs__form', function (a_obj) {
		a_obj.preventDefault();
		jQuery('#contactUs__form .form__err').html('');

		//Get the form data
		data = [(userName = jQuery('#contactUs__name').val()), (email = jQuery('#contactUs__email').val()), (message = jQuery('#contactUs__description').val()), (phone = jQuery('#contactUs__phone').val())];

		validate = validateForm('contact-us', data);
		if (validate.validator.response) {
			jQuery('#contactUs__form')[0].reset();
		} else {
			jQuery('#contactUs__form .form__err').html('<p>Please fill in all the fields</p>');
		}
	});
}

function messagePopupsActions() {
	jQuery(document).on('click', '.message__popup-cta', function () {
		where = jQuery(this).attr('redirect');
		managePopups('hide');

		if (where == 'feedback') {
			redirect('feedback');
		}
	});
}

function permissionsPopupsActions() {
	jQuery(document).on('click', '.permission__drawer-cta--allow', function () {
		if (isAndroid()) {
			what = jQuery(this).attr('data-what');

			if (what == 'locations') {
				localStorage.setItem('callLocationPopup', false);
				Android.locationPermission();
			}
			else if (what == 'notifications') {
				localStorage.setItem('callNotificationPopup', false);
				Android.notificationPermission();
			}

			drawer('close');
		}
		else if (isIOS()) {
			what = jQuery(this).attr('data-what');

			if (what == 'locations') {
				localStorage.setItem('callLocationPopup', false);
				window.webkit.messageHandlers.requestPermission.postMessage({ permissionType: "location" });
				console.log('requesting location permission');
			}
			else if (what == 'notifications') {
				localStorage.setItem('callNotificationPopup', false);
				window.webkit.messageHandlers.requestPermission.postMessage({ permissionType: "notification" });
			}

			drawer('close');
		}
		else {
			getLocation('show', 'onboarding');
			drawer('close');
		}
	});

	jQuery(document).on('click', '.permission__drawer-cta--cancel', function () {
		drawer('close');
	});
}

function manageExperienceBookings(state, data) {
	bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));

	if (state == 'init') {
		if (guestMaster('noLogin')) {
			grecaptcha.ready(function () {
				grecaptcha.execute('6LfoX5glAAAAAGTL-DkquTJVBWWMXoxU6qTHwUkM', { action: 'submit' }).then(function (token) {
					userName = jQuery('#bookingSummary__name').val();
					email = jQuery('#bookingSummary__email').val().toLowerCase();
					phone = jQuery('#bookingSummary__mobile').val();
					countryCode = jQuery('#bookingSummary__country').val();
					token = manageNotificationToken('get');
					password = Math.random().toString(36).slice(-8);

					localStorage.setItem('userCity', jQuery('#bookingSummary__city').val());

					console.log('Manage Experience Bookings Init');
					data = { name: userName, email: email, phoneNumber: phone, countryCode: countryCode, password: password, gender: 0, gToken: token, deviceId: manageNotificationToken('get') };
					console.log(data);
					jsInit('uniqueCheck', data, 'bookingSummary');
				});
			});
		}
		else {
			manageExperienceBookings('startPriceValidation');
		}
	}
	else if (state == 'uniqueCheck') {
		console.log(data);
		if (data.responseCode !== 200) {
			if (data.responseCode == 452) {
				toast(data.errorMessage);

				// firebaseOTP('sendSMS', { phoneNumber: jQuery('#bookingSummary__mobile').val(), dialCode: jQuery('#bookingSummary__country').val(), type: 'login' });
				setTimeout(function () {
					redirect('login');
				}, 2000);
				renderBookingSummary('renderOTPBox-login', data);
			}
		}
		else {
			renderBookingSummary('renderOTPBox', data);
		}

		setTimeout(function () {
			loaderMain('bookingSummary__cta', false);
		}, 200);
	}
	else if (state == 'otpValidation') {
		grecaptcha.ready(function () {
			grecaptcha.execute('6LfoX5glAAAAAGTL-DkquTJVBWWMXoxU6qTHwUkM', { action: 'submit' }).then(function (token) {
				userName = jQuery('#bookingSummary__name').val();
				email = jQuery('#bookingSummary__email').val().toLowerCase();
				phone = jQuery('#bookingSummary__mobile').val();
				countryCode = jQuery('#bookingSummary__country').val();
				otp = jQuery('#bookingSummary__otp').val();
				token = manageNotificationToken('get');
				password = Math.random().toString(36).slice(-8);
				otpId = jQuery('#bookingSummary__otp').attr('data-otp-id');

				console.log('Manage Experience Bookings Init');
				data = { "name": userName, "email": email, "countryCode": countryCode, "phone": phone, "enteredOTP": otp, "otpId": otpId, "password": password, "gender": "0", "referralCode": "", "deviceId": "", "deviceType": "web", "vendorUUID": "", "deviceUniqueId": "", "appVersion": appVersion };
				console.log(data);
				jsInit('signUpOTP', data, 'bookingSummary');
			});
		});
	}
	else if (state == 'signUpOTP') {
		console.log(data);
		if (data.responseCode != 200) {
			//Reset OTP Box
			jQuery('.bookingSummary__otp').val('');
			toast(data.errorMessage);
		}
		else {
			guestMaster('clean');
			tokenMaster('set', data.object.token);
			loaderMain('global', false);
			updateUserLocation('init', '', localStorage.getItem('userCity')); //This will also update the user profile
			localStorage.removeItem('userCity');
			jQuery('.bookingSummary__login').remove();

			setTimeout(function () {
				renderBookingSummary('reloadUserDetails');
				manageExperienceBookings('startPriceValidation');
			}, 3500);
		}

		setTimeout(function () {
			loaderMain('bookingSummary__cta', false);
		}, 200);
	}
	else if (state == 'startPriceValidation') {
		data = {
			userId: manageUserProfile("read", "userId"),
			calendarSlotId: bookingDetails['bookingSlot'],
			noOfTickets: bookingDetails['tickets'],
			premiumDiscount: (manageUserProfile('read', 'isVerified')) ? 'yes' : 'no',
			couponDiscount: 0,
			couponCode: (bookingDetails['couponCode']) ? bookingDetails['couponCode'] : '',
			amount: bookingDetails['price'],
			finalAmount: bookingDetails['finalAmount']
		}

		console.log(data);
		console.log('Manage Experience Bookings Init');
		jsInit('priceValidation', data);
	}
	else if (state == 'priceValidation') {
		if (data.responseCode !== 200) {
			toast(data.errorMessage);
			setTimeout(function () {
				loaderMain('bookingSummary__cta', false);
			}, 200);
		}
		else {
			console.log(data);
			// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
			// 	Moengage.track_event('TBD_EXPERIENCE_PRICE_VALID_PASSED', data);
			// }
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_EXPERIENCE_PRICE_VALID_PASSED', JSON.stringify(data));
			// }
			localStorage.setItem('orderDetailsTemp', JSON.stringify(data.data));
			data = {
				userId: manageUserProfile("read", "userId"),
				calendarSlotId: bookingDetails['bookingSlot'],
				noOfTickets: bookingDetails['tickets'],
				amount: bookingDetails['price']
			}

			jsInit('blockTickets', data);
		}
	}
	else if (state == 'blockTickets') {
		console.log(data);
		if (data.responseCode !== 200) {
			loaderMain('bookingSummary__cta', false);
			toast(data.errorMessage);
		}
		else {
			orderDetails = JSON.parse(localStorage.getItem('orderDetailsTemp'));
			orderDetails['bookingId'] = data.object.id;

			bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
			bookingDetails['bookingId'] = data.object.id;
			localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

			orderDetails.notes.calendarSlotId = data.object.calendar_slot_id;

			loaderMain('bookingSummary__cta', false);
			// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
			// 	Moengage.track_event('TBD_EXPERIENCE_BLOCK_TICKETS_BOOKING_DETAILS', bookingDetails);
			// 	Moengage.track_event('TBD_EXPERIENCE_BLOCK_TICKETS_ORDER_DETAILS', orderDetails);
			// }
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_EXPERIENCE_BLOCK_TICKETS_BOOKING_DETAILS', JSON.stringify(bookingDetails));
			// 	Android.moEngageData('TBD_EXPERIENCE_BLOCK_TICKETS_ORDER_DETAILS', JSON.stringify(orderDetails));
			// }
			managePayments('openRazorpayWindow', orderDetails);
			localStorage.removeItem('orderDetailsTemp');
		}
	}
	else if (state == 'confirmBooking') {
		console.log(data);
		data = {
			invoiceId: data.order_id,
			userId: manageUserProfile('read', 'userId'),
			bookingId: bookingDetails['bookingId'],
			amount: bookingDetails['finalAmount'],
			couponCode: 'WELCOME20'
		}

		console.log(data);
		// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
		// 	Moengage.track_event('TBD_EXPERIENCE_CONFIRM_BOOKING', data);
		// }
		// if (isAndroid()) {
		// 	Android.moEngageData('TBD_EXPERIENCE_CONFIRM_BOOKING', JSON.stringify(data));
		// }
		jsInit('confirmBooking', data);
	}
	else if (state == 'finale') {
		console.log(data);
		if (data.responseCode !== 200) {
			toast(data.responseMessage);
		}
		else {
			fbEvent('bookingSuccess', { value: bookingDetails['finalAmount'], currency: 'INR' });
			// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
			// 	Moengage.track_event('TBD_EXPERIENCE_BOOKING_SUCESS', bookingDetails);
			// }
			// if (isAndroid()) {
			// 	Android.moEngageData('TBD_EXPERIENCE_BOOKING_SUCESS', JSON.stringify(bookingDetails));
			// }
			toast('Between you and the host, a group chat has been established.');
			redirect('experienceThankYou', bookingDetails['bookingId']);
		}
	}

}

function updateUserLocation(state, data, location, gender, userType, latitude, longitude) {
	if (!location) {
		location = getCity();
	}

	if (!gender) {
		gender = 0;
	}

	if (!userType) {
		userType = 0;
	}

	if (!latitude) {
		latitude = getLatLongfromIp()['latitude'];
	}

	if (!longitude) {
		longitude = getLatLongfromIp()['longitude'];
	}

	if (state == 'init') {
		genderLocationData = {
			"gender": gender,
			"location": location,
			"latitude": latitude,
			"longitude": longitude,
			"service": "",
			"userType": userType,
		}

		jsInit('update_gender_and_location', genderLocationData);
	}
	else if (state == 'processResponse') {
		if (data.responseCode !== 200) {
			toast(data.errorMessage);
		}
		else {
			manageUserProfile('clean');
		}
	}
}

/*function manageWelcomeScreens(state, data) {
	response = '';

	if (state == 'init') {
		if (!manageWelcomeScreens('get') || manageWelcomeScreens('get') == false) {
			//Current url
			url = window.location.href;

			if (!url.includes('/experience')) {
				renderWelcomeScreens();
			}

			localStorage.setItem('welcomeScreens', false);
		}
	} 
	else if (state == 'set') {
		localStorage.setItem('welcomeScreens', true);
	} 
	else if (state == 'get') {
		response = localStorage.getItem('welcomeScreens');
	} 
	else if (state == 'clean') {
		manageWelcomeScreens('set');
		jQuery('.welcome_screens').remove();
	} 
	else if (state == 'reachEnd') {
		//Append the Get Started Button
		jQuery('.welcome_screens').append('<div class="welcome__getStarted">Get Started</div>');
		jQuery('.swiper-pagination').addClass('lastSlide');
	} 
	else if (state == 'slideChange') {
		jQuery('.swiper-pagination').removeClass('lastSlide');
		jQuery('.welcome__getStarted').remove();
	}

	return response;
}*/

function loaderMain(where, state, extra) {
	if (where == 'feed') {
		if (state == true) {
			//jQuery('#main__feed').append('<div class="feed__loading">' + icons.loader + '</div>');
            jQuery('#main__feed').append('<div class="feeds__image-placeholder"></div>');
            
		}
		else if (state == false) {
			jQuery('#main__feed .feeds__image-placeholder').remove();
		}
	}
	else if (where == 'secondary') {
		if (state == true) {
			jQuery('#secondary .secondary__tab:last-child .drawerBody').append('<div class="feed__loading">' + icons.loader + '</div>');
		}
		else if (state == false) {
			jQuery('#secondary .secondary__tab:last-child .feed__loading').remove();
		}
	}
	else if (where == 'global' || where == 'global__loading') {
		if (state == true) {
			if (!jQuery('body .global__loading').length) {
    			jQuery('body').prepend('<div class="global__loading"><div class="feed__loading">' + icons.loader + '</div></div>');
			}
			if (where == 'global__loading') {
				jQuery('body .global__loading .feed__loading').append('<div class="hold__horses">Please wait while we process your media.</div>');
			}
		}
		else if (state == false) {
			jQuery('.global__loading').remove();
		}
	}
	else if (where == 'master') {
		if (state == false) {
			jQuery('.feed__loading').remove();
		}
	}
	else if (where == 'formSubmit') {
		if (state == true) {
			jQuery('.form__row.form__submit button').each(function () {
				jQuery(this).attr('disabled', 'disabled');
				jQuery(this).append(icons.loader);
			});
		}
		else if (state == false) {
			jQuery('.form__row.form__submit button').each(function () {
				jQuery(this).removeAttr('disabled');
				jQuery(this).find('svg').remove();
			});
		}
	}
	else if (where == 'bookingSummary__cta') {
		if (state == true) {
			jQuery('.bookingSummary__cta button').append(icons.loader).attr('disabled', 'disabled');
			jQuery('#bookingSummary__otp-submit').append(icons.loader).attr('disabled', 'disabled');
		}
		else if (state == false) {
			jQuery('.bookingSummary__cta button svg').remove();
			jQuery('.bookingSummary__cta button').removeAttr('disabled');
			jQuery('#bookingSummary__otp-submit svg').remove();
			jQuery('#bookingSummary__otp-submit').removeAttr('disabled');
		}
	}
	else if (where == 'otp') {
		if (state == true) {
			jQuery('.verifyPhone').append(icons.loader);
		}
		else {
			jQuery('.verifyPhone svg').remove();
		}
	}
	else if (where == 'allExperiences') {
		if (state == true) {
			jQuery('.experiences__body').append('<div class="feed__loading">' + icons.loader + '</div>');
		}
		else {
			jQuery('.experiences__body .feed__loading').remove();
		}
	}
	else if (where == 'sidebarExperiences') {
		if (state == true) {
			jQuery('.desktopSideBar-experiences-box').append('<div class="feed__loading">' + icons.loader + '</div>');
		}
		else {
			jQuery('.desktopSideBar-experiences-box .feed__loading').remove();
		}
	}
	else if (where == 'sidebarExperiences') {
		if (state == true) {
			jQuery('.desktopSideBar-followers-box').append('<div class="feed__loading">' + icons.loader + '</div>');
		}
		else {
			jQuery('.desktopSideBar-followers-box .feed__loading').remove();
		}
	}
	else if (where == 'singleChat') {
		if (state == true) {
			jQuery('.singleChat__container .css-btd4on').append('<div class="chat__loading">Loading Messages ' + icons.loader + '</div>');
		}
		else {
			jQuery('.singleChat__container .chat__loading').remove();
		}
	}
	else if (where == 'singleMessage') {
		if (state == true) {
			jQuery('.singleChat__message.loader:last-child .chat_message-media').append('<div class="singleMessage__loading">' + icons.loader + '</div>');
		}
		else {
			jQuery('.singleChat__message.loader:last-child .chat_message-media .singleMessage__loading').remove();
		}
	}
	else if (where == 'createGroupChat') {
		if (state == true) {
			jQuery('.creategroup-btn').find('svg').replaceWith(icons.loader);
			jQuery('.creategroup-btn').attr('disabled', 'disabled');
		}
		else {
			jQuery('.creategroup-btn').removeAttr('disabled').find('svg').replaceWith(icons.tick);
		}
	}
	else if (where == 'firebase') {
		if (state == true) {
			if (jQuery('#app .global__loading .feed__loading .hold__horses').length == 0) {
				jQuery('#app .global__loading .feed__loading').append('<div class="hold__horses">Loading...</div>');
			}
		}
		else {
			jQuery('.global__loading').remove();
		}
	}
    else if (where == 'chatNewAnim') {
		jQuery('body').prepend('<div class="global__loading" id="lottie__loading"><div class="feed__loading"></div></div>');
		jQuery('#app .global__loading .feed__loading').append('<div class="hold__horses">Loading Chats...</div>');
		jQuery('.feed__loading .hold__horses').css('margin', '208px auto 0');
		lottie.loadAnimation({
			container: document.getElementById('lottie__loading'),
			renderer: 'svg',
			loop: true,
			autoplay: true,
			path: '/view/assets/img/chatOpen.json'
		});
	}
	// Set state to false after 7 seconds
	if (state == true && extra != 'flightsCalendarFares') {
        setTimeout(function() {
            loaderMain(where, false);
        }, 7000);
    }
}

/*
 * Copyright 2021, Ali Dinçer
 * Dual licensed under the MIT or GPL Version 3 or any later version licenses.
 * https://dincerali.com
 */

function drawer(options, mini) {
	var thisi = jQuery('#main__drawer');
	if (!thisi.hasClass('drawer')) {
		// jQuery('#app').addClass('drawer-out')
		thisi.addClass('drawer').addClass('no-act').prepend('<div class="drawerHeader"><svg class="drawer-kapat" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>');

		thisi.find('.drawer-kapat').click(function () {
			thisi.addClass('no-act');

			if (jQuery('#dark-back')[0]) jQuery('#dark-back').hide();
			jQuery('#main__drawer').removeClass('mini');
			jQuery('.drawerHeader').removeClass('blackHeader');
			// jQuery("body").css("overflow", "inherit");
		});

		jQuery(document).on('click', '#dark-back', function () {
			jQuery(this).hide();
			thisi.addClass('no-act');
			cleanDrawer();
			// jQuery("body").css("overflow", "inherit");
		});

		if (typeof options === 'object' || !options) {
			// obje olarak geliyorsa jQuery().drawer({deneme:"deneme"}); veya boşsa
			// Default ayar
			var settings = jQuery.extend(
				{
					duration: '300',
					animation: 'ease',
					background: true,
					radiusLeft: '18px',
					radiusRight: '18px',
					distance: 20,
					headerText: '',
					width: '100%',
					contentScroll: false,
				},
				options
			);
			thisi
				.attr('distance', settings.distance)
				.find('.drawerHeader')
				.prepend('<span>' + settings.headerText + '</span>');

			setTimeout(() => {
				thisi.css('transition', 'transform ' + settings.duration + 'ms ' + settings.animation + '');
				thisi.css('border-radius', '' + settings.radiusLeft + ' ' + settings.radiusRight + ' 0px 0px');
				thisi.css('width', '' + settings.width + '');
				const hgt = 100 - settings.distance - 10 + 3;
				if (settings.contentScroll) {
					thisi.find('.drawer-content').css('height', '' + hgt + 'vh');
					thisi.find('.drawer-content').css('overflow-y', 'scroll');
				}
			}, 100);

			if (settings.background == true) {
				if (!jQuery('#dark-back')[0]) jQuery('#app').append("<div id='dark-back'></div>");

				thisi.attr('bg', 1);
			}
		}
	}
	if (typeof options !== 'object') {
		// obje değil de düz yazı geliyorsa jQuery().drawer("open");
		if (options === 'open') {
			jQuery('#app').addClass('drawer-out');
			jQuery('.drawer').addClass('no-act');
			if (mini) {
				jQuery('#main__drawer').addClass('mini');
			}

			if (thisi.attr('bg') == 1) jQuery('#dark-back').show();

			thisi.removeClass('no-act').css('transform', 'translate(-50%, 0)');

			// jQuery("body").css("overflow", "hidden");
			jQuery('#main__drawer').addClass('active');
			//window.history.pushState({ html: '', pageTitle: '' }, '', '#drawer');
		}

		if (options === 'close') {
			cleanDrawer();
			if (thisi.attr('bg') == 1) jQuery('#dark-back').hide();

			thisi.addClass('no-act');
			setTimeout(() => {
				jQuery('#main__drawer').removeClass('active');
			}, 200);

			//Take elements inside .login__social to .login__outer-view
			// jQuery("body").css("overflow", "inherit");
		}
	}
}

function cleanDrawer() {
	jQuery('.login__social').children().appendTo('.login__outer-view');
	jQuery('#main__drawer .drawerBody').empty();
	jQuery('#main__drawer .drawerHeader span').text('');
	jQuery('#main__drawer .drawerBody').removeClass('followers__body');
	jQuery('#main__drawer').removeClass('loginDrawer');
	jQuery('#main__drawer').removeClass('mini');
	jQuery('#app').removeClass('drawer-out');
    jQuery('.drawer').css('overflow', 'scroll');
}

function guestMaster(state) {
	guestUser = false;

	if (state == 'set') {
		localStorage.setItem('isGuestUser', true);
	}
	else if (state == 'clean') {
		localStorage.removeItem('isGuestUser');
	}
	else {
		if (localStorage.getItem('isGuestUser')) {
			guestUser = true;

			if (!jQuery('#app').hasClass('guestUser')) {
				jQuery('#app').addClass('guestUser');
			}
		}
	}

	return guestUser;
}

function mobileFullScreen(state) {
	elem = document.documentElement;

	if (state == 'init') {
	} else if (state == 'open') {
		openFullscreen(elem);
	} else if (state == 'close') {
		closeFullscreen(elem);
	}

	function openFullscreen(elem) {
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.webkitRequestFullscreen) {
			/* Safari */
			elem.webkitRequestFullscreen();
		} else if (elem.msRequestFullscreen) {
			/* IE11 */
			elem.msRequestFullscreen();
		}
	}

	function closeFullscreen() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			/* Safari */
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) {
			/* IE11 */
			document.msExitFullscreen();
		}
	}
}

jQuery(window).on('navigate', function (event, data) {
	var direction = data.state.direction;
	if (direction == 'back') {
		alert('Back Button Pressed');
	}
	if (direction == 'forward') {
		// do something else
	}
});

function fbEvent(event, data) {
	if (window.location.href.includes('localhost') || window.location.href.includes('dev.')) {
		return;
	}
    let trackEvent = '';
    let params = {};

	switch (event) {
		case 'share_feed':
			trackEvent = 'Share Feed';
			params = {
				content_name: 'Share Feed',
				content_category: 'Share Feed',
			};
			break;
		case 'share_post_link':
			trackEvent = 'Share Post Link';
			params = {
				content_name: 'Share Post Link',
				content_category: 'Share Post Link',
			};
			break;
		case 'share_post_whatsapp':
			trackEvent = 'Share Post WhatsApp';
			params = {
				content_name: 'Share Post WhatsApp',
				content_category: 'Share Post WhatsApp',
			};
			break;
		case 'share_post_facebook':
			trackEvent = 'Share Post Facebook';
			params = {
				content_name: 'Share Post Facebook',
				content_category: 'Share Post Facebook',
			};
			break;
		case 'share_post_twitter':
			trackEvent = 'Share Post Twitter';
			params = {
				content_name: 'Share Post Twitter',
				content_category: 'Share Post Twitter',
			};
			break;
		case 'viewCouponBtn':
			trackEvent = 'View Coupon Button';
			params = {
				content_name: 'View Coupon Button',
				content_category: 'View Coupon Button',
			};
			break;
		case 'inAppWebPopup':
			trackEvent = 'In App Web Popup';
			params = {
				content_name: 'In App Web Popup',
				content_category: 'In App Web Popup',
			};
			break;
		case 'app_install':
			trackEvent = 'App Install';
			params = {
				content_name: 'App Install',
				content_category: 'App Install',
			};
			break;
		case 'coverUpload':
			trackEvent = 'Cover Photo Upload';
			params = {
				content_name: 'Cover Photo Upload',
				content_category: 'Profile',
			};
			break;
		case 'send_message':
			trackEvent = 'Send Message';
			params = {
				content_name: 'Send Message',
				content_category: 'Chat',
			};
			break;
		case 'login':
			trackEvent = 'Login';
			params = {
				content_name: 'Login',
				content_category: 'Login',
			};
			break;
		case 'findBuddy':
			trackEvent = 'Find Buddy';
			params = {
				content_name: 'Find Buddy',
				content_category: 'Find Buddy',
			};
			break;
		case 'spinWheel':
			trackEvent = 'Spin Wheel';
			params = {
				content_name: 'Spin Wheel',
				content_category: 'Spin Wheel',
			};
			break;
        case 'bookingSummary':
            trackEvent = 'Experience Initiate Checkout';
            params = {
                value: data.value,
                currency: 'INR',
            };
            break;
        case 'bookingSuccess':
            trackEvent = 'Experience Purchased';
            params = {
                value: data.value,
                currency: 'INR',
            };
            break;
        case 'community':
            trackEvent = 'Community Page';
            params = {
                content_name: 'Community Main Page',
                content_category: 'Community',
                value: data
            };
            break;
        case 'flights':
            trackEvent = 'Flights Page';
            params = {
                content_name: 'Flights Main Page',
                content_category: 'Flights',
            };
            break;
        case 'experiences':
            trackEvent = 'Experiences Page';
            params = {
                content_name: 'Experiences Main Page',
                content_category: 'Experiences',
            };
            break;
        case 'feed':
            trackEvent = 'Community Page';
            params = {
                content_name: 'Community Main Page Opened via Button',
                content_category: 'Community',
            };
            break;
        case 'enquiryForm':
            trackEvent = 'Enquiry Form Closed';
            params = {
                content_name: 'Enquiry Form Closed',
                content_category: 'Enquiry Form',
            };
			break;
		case 'premium-super':
			trackEvent = 'Super Pack Premium Opened';
			params = {
				content_name: 'Super Pack Premium Opened',
				content_category: 'Premium Page',
			};
			break;
		case 'premium-pro':
			trackEvent = 'Pro Pack Premium Opened';
			params = {
				content_name: 'Pro Pack Premium Opened',
				content_category: 'Premium Page',
			};
			break;
		case 'premium-luxe':
			trackEvent = 'LUXE Pack Premium Opened';
			params = {
				content_name: 'LUXE Pack Premium Opened',
				content_category: 'Premium Page',
			};
			break;
		case 'premium-purchase-web':
			trackEvent = 'Premium Pack Purchased from Web';
			params = {
				content_name: 'Premium Pack Purchased',
				content_category: 'Premium Page',
			};
			break;
		case 'premium-purchase-mobile':
			trackEvent = 'Premium Pack Purchased from Mobile';
			params = {
				content_name: 'Premium Pack Purchased',
				content_category: 'Premium Page',
			};
			break;
		case 'flightsSearch':
			trackEvent = 'Flights Search';
			params = {
				content_name: 'Flights Search',
				content_category: 'Flights',
			};
			break;
		case 'flightsSelected':
			trackEvent = 'Flights Selected';
			params = {
				content_name: 'Flights Selected',
				content_category: 'Flights',
			};
			break;
		case 'flightsBookings':
			trackEvent = 'Flights Bookings';
			params = {
				content_name: 'Flights Bookings',
				content_category: 'Flights',
			};
			break;
		case 'premium-pay-cancelled':
			trackEvent = 'Premium Payment Cancelled';
			params = {
				content_name: 'Premium Payment Cancelled',
				content_category: 'Premium Page',
			};
			break;
		case 'flights-pay-cancelled':
			trackEvent = 'Flights Payment Cancelled';
			params = {
				content_name: 'Flights Payment Cancelled',
				content_category: 'Flights',
			};
			break;
		case 'experience-pay-cancelled':
			trackEvent = 'Experience Payment Cancelled';
			params = {
				content_name: 'Experience Payment Cancelled',
				content_category: 'Experiences',
			};
			break;
		case 'search':
			trackEvent = 'Search';
			params = {
				content_name: 'Search',
				content_category: 'Search',
			};
			break;
		case 'premium':
			trackEvent = 'Premium Page via Button';
			params = {
				content_name: 'Premium Page Opened',
				content_category: 'Premium',
			};
			break;
		case 'Flights_LP':
			trackEvent = 'Flights Landing Page';
			params = {
				content_name: 'Flights Landing Page',
				content_category: 'Flights',
			};
			break;
		case 'Flights_LP-hero':
			trackEvent = 'Flights Landing Page Hero';
			params = {
				content_name: 'Flights Landing Page Hero',
				content_category: 'Flights',
			};
			break;
		case 'Com_LP':
			trackEvent = 'Community Landing Page';
			params = {
				content_name: 'Community Landing Page',
				content_category: 'Community',
			};
			break;
		case 'Com_LP-cross':
			trackEvent = 'Community Landing Page Cross';
			params = {
				content_name: 'Community Landing Page Cross',
				content_category: 'Community',
			};
			break;
		case 'Premium_LP':
			trackEvent = 'Premium Landing Page';
			params = {
				content_name: 'Premium Landing Page',
				content_category: 'Premium',
			};
			break;
		case 'AI_LP':
			trackEvent = 'AI Landing Page';
			params = {
				content_name: 'AI Landing Page',
				content_category: 'AI',
			};
			break;
        default:
            console.warn(`Unhandled event type: ${event}`);
            return; // Exit the function if the event type is unhandled
    }

    // Call fbq with the prepared parameters
    fbq('trackCustom', trackEvent, params);
}

function editProfileActions() {
	
	//On click of the interest checkbox, add the selected class to the parent
	jQuery(document).on('click', '.checkbox__interests .checkbox-item, .checkbox__interests .checkbox-item label', function (e) {
		e.preventDefault();

		//Limit to 5
		if (jQuery('.checkbox__interests .checkbox-item.checked').length >= 5 && !jQuery(this).hasClass('checked')) {
			toast('You can only select up to 5 interests.');
			return;
		}
		else {
			jQuery(this).toggleClass('checked');
			jQuery(this).parents('.checkbox-item').toggleClass('checked'); //This has to be done for the label on click

			//Trigger the checkbox
			jQuery(this).parents('.checkbox-item').find('input').trigger('click');
		}
	});

	jQuery(document).on('keyup', '#editProfile #edit__phone', function (e) {
		val = jQuery(this).val();
		if (val !== manageUserProfile('read', 'phoneNumber')) {
			jQuery('#editProfile .editVerifyPhone').text('Verify').removeClass('verified').addClass('verify');

		}
		else {
			jQuery('#editProfile .editVerifyPhone').text('Verified').removeClass('verify').addClass('verified');
			jQuery('#edit__otp').hide();
		}

	});

	jQuery(document).on('keyup change', '#editProfile #editProfile__countryCode', function (e) {
		val = jQuery(this).val();
		if (val !== manageUserProfile('read', 'dialCode')) {
			jQuery('#editProfile .editVerifyPhone').text('Verify').removeClass('verified').addClass('verify');

		}
		else {
			jQuery('#editProfile .editVerifyPhone').text('Verified').removeClass('verify').addClass('verified');
			jQuery('#edit__otp').hide();
		}

	});

	//Sending Otp on Phone Number
	jQuery(document).on('click', '#editProfile .editVerifyPhone.verify', function (e) {
		e.preventDefault();
		console.log(jQuery('#edit__phone').val());

		if (!jQuery(this).hasClass('verified')) {
			//Check if the phone number is entered
			if (jQuery('#edit__phone').val() !== '') {

				//Check if the country code is indian or international
				if (jQuery('#editProfile__countryCode').val() == '+91') {
					jsInit('checkUserLogin', { phoneNumber: jQuery('#edit__phone').val() }, {
						phoneNumber: jQuery('#edit__phone').val(),
						dialCode: '+91',
						editProfile: true,
					});

					/*jsInit('profileSendOTP', {
						phoneNumber: jQuery('#edit__phone').val(),
						dialCode: jQuery('#editProfile__countryCode').val()
					}, 'editProfileOtp');*/
				}
				else {
					firebaseOTP('editProfile_sendSMS', {
						phoneNumber: jQuery('#edit__phone').val(),
						dialCode: jQuery('#editProfile__countryCode').val(),
					});
				}
			}

			else {
				jQuery('#edit__phone').addClass('error');
				toast('Please enter your phone number to continue');
			}
		}
	});

	//Update Phone Number
	jQuery(document).on('click', '#editProfile .editVerifyPhone.verifyOtp', function (e) {
		e.preventDefault();
		console.log(jQuery('#edit__phone').val());

		if (!jQuery(this).hasClass('verified')) {
			//Check if the phone number is entered
			if (jQuery('#edit__phone').val() !== '') {

				//Check if the country code is indian or international
				if (jQuery('#editProfile__countryCode').val() == '+91') {

					/*jsInit('updatePhoneNumber', {
						phoneNumber: jQuery('#edit__phone').val(),
						dialCode: jQuery('#editProfile__countryCode').val(),
						otp: jQuery('#edit__otp').val()
					}, 'editProfile');*/
					
					var twoFactMobile = '+91' + jQuery('#edit__phone').val();
					console.log('Two Factor Mobile: ', twoFactMobile);
					jsInit('verifyOTPDomestic', {
						mobileNumber: twoFactMobile,
						otpEnteredByUser: jQuery('#edit__otp').val()
					}, { phoneNumber: jQuery('#edit__phone').val(),
						dialCode: jQuery('#editProfile__countryCode').val(),otp: jQuery('#edit__otp').val(), editProfileOtp: true });
					
				}
				else {
					firebaseOTP('editProfile_verifyOTP', { otp: jQuery('#edit__otp').val() });
				}
			}

			else {
				jQuery('#edit__phone').addClass('error');
				toast('Please enter your phone number to continue');
			}
		}
	});

	jQuery(document).on('click', '#secondary .profile__head-submit', function (e) {
		e.preventDefault();

		//Check if the name is entered'
		if (jQuery('#edit__name').val() == '') {
			toast('Please enter your name');
			return;
		}

		//Check if the location is entered'
		if (jQuery('#edit__location').val() == '') {
			toast('Please enter your Location');
			return;
		}

		//Check if the email is entered'
		/*if (jQuery('#edit__email').val() == '') {
			toast('Please enter your Email');
			return;
		}*/

		//Check if the dob is entered'
		if (jQuery('#edit__dob').val() == '') {
			// toast('Please enter your Dob');
			// return;
		}

		if (jQuery('.service_provider').hasClass('user__type-selected')) {
			console.log('Service');

			if (jQuery('.editProfile-service__type .checkbox-item.service_type-selected').length < 1) {
				toast('At-least one Service should be selected');
				return;
			}
		}

		//Get form data via serialize function
		var formDataa = jQuery('#editProfile').serializeArray();

		formData = getFormData();
        isUniqueValue = (array, value) => {
            return !array.some(item => item.interest == value);
        };
		manageInterestsServices(formData);

		function manageInterestsServices(data) {
			interests = [];
			jQuery('#editProfile .checkbox__interests .checkbox-item.checked').each(function () {
                newInterest = jQuery(this).find('input').val();
                if (isUniqueValue(interests, newInterest)) {
                    interests.push({
                        interest: newInterest,
                        selected: true,
                    });
                }
			});
			data.userInterests = interests;

			services = [];
			jQuery('.editProfile-service__type .service_type-selected').each(function () {
                newService = jQuery(this).find('input').val();
                if (isUniqueValue(services, newService)) {
				    services.push({ service: newService });
                }
			});
			data.services = services;

			expertiseId = [];
			jQuery('.local_expertise_box .service_type-selected').each(function () {
                newExpertiseId = jQuery(this).find('input').val();
                if (isUniqueValue(expertiseId, newExpertiseId)) {
				    expertiseId.push({ expertiseId: newExpertiseId });
                }
			});
			data.expertise = expertiseId;

			socialList = [];
			socialList.push({
				socialLink: jQuery('.profileInterests__tab-item__social').find('input[name="Blog/Website"]').val(),
				socialType: "Website"
			});
			socialList.push({
				socialLink: jQuery('.profileInterests__tab-item__social').find('input[name="Facebook"]').val(),
				socialType: jQuery('.profileInterests__tab-item__social').find('input[name="Facebook"]').attr('id')
			});
			socialList.push({
				socialLink: jQuery('.profileInterests__tab-item__social').find('input[name="Instagram"]').val(),
				socialType: jQuery('.profileInterests__tab-item__social').find('input[name="Instagram"]').attr('id')
			});
			socialList.push({
				socialLink: jQuery('.profileInterests__tab-item__social').find('input[name="twitter"]').val(),
				socialType: jQuery('.profileInterests__tab-item__social').find('input[name="twitter"]').attr('id')
			});
			data.socialList = socialList;

			//Adding all the Places
			places = [];
			jQuery('#editProfile  .profileInterests__trips').each(function () {
				places.push({ place: jQuery(this).find('input[name="place"]').val(), latitude: jQuery(this).find('input[name="latitude"]').val(), longitude: jQuery(this).find('input[name="longitude"]').val() });
			});
			data.places = places;

			//return data;
		}

		function getFormData() {
			var unindexed_array = jQuery('#editProfile').serializeArray();
			var indexed_array = {};

			jQuery.map(unindexed_array, function (n, i) {
				indexed_array[n['name']] = n['value'];
			});


			return indexed_array;
		}

		loaderMain('global', true);

		//Update About Info
		jsInit('updateAbout', { "about": formData['edit__about'], "activeStatus": 0, "blockedByUser": false, "bookmarksCount": 0, "city": formData['editProfile__location'], "completeness": 0, "country": "", "dateOfBirth": formData['editProfile__dob'], "distance": 0.0, "enquiriesCount": 0, "enquiriesWithNoReply": 0, "followerCount": 0, "followingCount": 0, "gender": formData['onboarding__gender'], "id": 0, "isActive": false, "isAsked": false, "isUserBlocked": false, "isEmailPublic": false, "isFollowing": false, "isFollowingBack": false, "isGuestUser": false, "isLoginRequest": false, "isMessagingEnable": false, "isNotificationEnable": false, "isPhonePublic": false, "isRateReviewAllowed": false, "isSocialLogin": false, "isVerified": false, "latitude": 0.0, "location": formData['editProfile__location'], "longitude": 0.0, "name": formData['editProfile__name'], "otpId": 0, "pageNumber": 0, "placesCount": 0, "postsCount": 0, "rateUserRequired": false, "rated": 0, "rating": 0.0, "ratingCount": 0, "ratingId": 0, "redirectOutside": false, "redirectedFromGuest": false, "reviewCount": 0, "serviceCityLat": 0.0, "serviceCityLng": 0.0, "state": "", "totalItems": 0, "type": 0, "userId": manageUserProfile('read', 'userId'), "userType": formData['userType'], "viewCount": 0, "visitingCityLat": 0.0, "visitingCityLng": 0.0, "youHaveBlocked": false });

		// Update travel_info
		jsInit('updateProfile', { "about": formData['edit__about'], "activeStatus": 0, "blockedByUser": false, "bookmarksCount": 0, "city": formData['editProfile__location'], "completeness": 0, "country": "", "dateOfBirth": formData['editProfile__dob'], "distance": 0.0, "enquiriesCount": 0, "enquiriesWithNoReply": 0, "followerCount": 0, "followingCount": 0, "gender": formData['onboarding__gender'], "id": 0, "isActive": false, "isAsked": false, "isUserBlocked": false, "isEmailPublic": false, "isFollowing": false, "isFollowingBack": false, "isGuestUser": false, "isLoginRequest": false, "isMessagingEnable": false, "isNotificationEnable": false, "isPhonePublic": false, "isRateReviewAllowed": false, "isSocialLogin": false, "isVerified": false, "latitude": 0.0, "location": formData['editProfile__location'], "longitude": 0.0, "name": formData['editProfile__name'], "otpId": 0, "pageNumber": 0, "placesCount": 0, "postsCount": 0, "rateUserRequired": false, "rated": 0, "rating": 0.0, "ratingCount": 0, "ratingId": 0, "redirectOutside": false, "redirectedFromGuest": false, "reviewCount": 0, "serviceCityLat": 0.0, "serviceCityLng": 0.0, "state": "", "totalItems": 0, "type": 0, "userId": manageUserProfile('read', 'userId'), "userType": formData['userType'], "viewCount": 0, "visitingCityLat": 0.0, "visitingCityLng": 0.0, "youHaveBlocked": false, "services": services, "userInterests": interests, "isOldUser" : true, "userExpertise": expertiseId, "places": places });

		// Update the Social Links
		jsInit('updateSocialLink', { "socialList": socialList });

		setTimeout(function () {
			manageUserProfile('clean');
			jQuery('#editProfile__head-back').click();
			toast('Profile Updated');
			loaderMain('global', false);
			renderMenu();
		}, 1500);

		// Clear out the variable used for uploading multiple Cover Photos
		userProfileData = '';

	});

	jQuery(document).on('click', '.editProfile__title #edit__location', function () {
		renderOnboarding('edit-location', '#editProfile');
	});

	jQuery(document).on('click', '.form__checkbox-view__more', function () {
		console.log('More');
		jQuery(this).parents('.profileInterests__tabBody').find('.profileInterests__tab-item .profileInterests__tab-item-body .editInterest__checkbox.checkbox__interests').toggleClass('open');

		text = jQuery(this).text();

		if (text == 'View More') {
			jQuery(this).text('View Less');
		}
		else {
			jQuery(this).text('View More');
		}
	});

	jQuery(document).on('click', '#secondary .profile__head-delete-cover', function () {
		managePopups('show', 'deleteCover', this);
	});

	// Show options when Service Provider is selected
	jQuery(document).on('click', '#secondary .service_provider', function () {
		jQuery(this).prop('checked', true);
		jQuery('#secondary #isTraveller-option').prop('checked', false);
		jQuery('#secondary').find('.editProfile-service__type').css('display', 'flex').show();
		jQuery('#secondary').find('.please__select').show();
		jQuery('#secondary .service_provider').addClass('user__type-selected');
		jQuery('#secondary .travel').removeClass('user__type-selected');

	});

	// Hide options when Service Provider is selected
	jQuery(document).on('click', '#secondary .travel', function () {
		jQuery(this).prop('checked', true);
		jQuery('#secondary #isTravelProvider-option').prop('checked', false);
		jQuery('#secondary').find('.editProfile-service__type').hide();
		jQuery('#secondary').find('.please__select').hide();
		jQuery('#secondary .travel').addClass('user__type-selected');
		jQuery('#secondary .service_provider').removeClass('user__type-selected');

	});

	//This is a radio button, so on click of the item, remove the selected class from all the other items
	jQuery(document).on('click', '.editGender__checkbox.checkbox__gender .checkbox-item', function () {
		jQuery(this).parents('.editGender__checkbox').find('.checkbox-item').removeClass('checked');
		jQuery(this).addClass('checked');
	});

	// Back icon in Edit Profile
	jQuery(document).on('click', '#editProfile__head-back', function () {
		destroyAllSecondaryTabs();
		userProfileData = '';
	});

	jQuery('#editProfile').on('click', '#editPlaces', function () {
		console.log("Search Edit Profile");

	});

	jQuery(document).on('click', '.remove__place', function () {
		console.log(jQuery(this).parent('.profileInterests__trips').remove());
	});

	jQuery(document).on('click', '#edit__email', function () {
		toast('You cannot change your Email address');

	});
    
    jQuery(document).on('click', '#removeFindMedia', function () {
        console.log('Remove Image');
        jQuery(this).parents('.addPost__images-item').remove();
    });

	// Remove Images/Videos from Edit Post Page
	jQuery(document).on('click', '#removeShareMedia', function (e) {
		console.log(jQuery(this).parents('.editImage').children('.addPost__images-item').length);
		if (jQuery(this).parents('.editImage').children('.addPost__images-item').length == 1) {
			toast('Cannot remove the last post.');
			return;
		}
		else {
			console.log('Delete');

			var list = jQuery('#share__media').val();
			if (jQuery(this).parents('.addPost__images-item').attr('data-type') == 'video') {
				imgSrc = jQuery(this).parents('.addPost__images-item').attr('media-path');
				startIndex = imgSrc.indexOf("uploads");
				if (startIndex == -1) {
                    extractedSrc = imgSrc;
                }
                else {
                    extractedSrc = imgSrc.slice(startIndex);
                }
			}
			else {
				imgSrc = jQuery(this).parents('.addPost__images-item').find('img').attr('src');
				startIndex = imgSrc.indexOf("/uploads");
				extractedSrc = imgSrc.slice(startIndex);
			}

			if (jQuery(this).parents('.addPost__images-item').hasClass('first-child')) {
				console.log('First Child');
				if (list.includes(extractedSrc + '|')) {
					list = list.replace(extractedSrc + '|', '');
				}
			}
			else {
				console.log('Not First Child');
				if (list.includes('|' + extractedSrc)) {
					list = list.replace('|' + extractedSrc, '');
				}
			}
			jQuery('#share__media').val(list)
			jQuery(this).parents('.addPost__images-item').remove();


		}
	});
}

function editCommentAction() {
	jQuery(document).on('click', '.options__menu-box li[data-type ="editComment"]', function () {
		jQuery(".feed__comment").attr("comment-id", jQuery(this).parents('.comment__item').attr('data-comment-id'));
		jQuery(".feed__comment").attr("comment-by-user-id", jQuery(this).parents('.comment__item').attr('data-user'));

		commentText = jQuery(this).parents('.comment__item').find('.comment__item-content').text();

		jQuery(this).parents('.drawerBody').find('.feed__comment textarea').val(commentText);
		jQuery(this).parents('.drawerBody').find('.feed__comment textarea').focus();

		jQuery(this).parents('.drawerBody').find(".feed__comment button").text("Update");


		jQuery(this).parents('.drawerBody').find('.feed__comment textarea').on('change', function () {
			// Your event handling logic here
			updatedCommentText = jQuery(this).parents('.drawerBody').find('.feed__comment textarea').val();
			if (updatedCommentText == '') {
				jQuery(this).parents('.drawerBody').find(".feed__comment button").text("Post");
				// jQuery(".feed__comment").attr("data-type", jQuery(this).parents('.comment__item').removeAttr('data-comment-id'));
			}
		});
	});

	jQuery(document).on('click', '.options__menu-box li[data-type ="deleteComment"]', function () {
		console.log('delete');
		commentText = jQuery(this).parents('.comment__item').find('.comment__item-content').text();
		jQuery(".feed__comment").attr("comment-id", jQuery(this).parents('.comment__item').attr('data-comment-id'));
		jQuery(".feed__comment").attr("comment-by-user-id", jQuery(this).parents('.comment__item').attr('data-user'));

		postId = jQuery(this).parents('.drawerBody').find('.comments__box').attr('data-postid');
		feedItem = jQuery('.feed_item[data-id="' + postId + '"');

		jsInit('deleteComment', {
			"comment": commentText,
			"commentByUserId": jQuery(this).parents('.drawerBody').find('.feed__comment').attr('comment-by-user-id'),
			"commentId": jQuery(this).parents('.drawerBody').find('.feed__comment').attr('comment-id'),
			"commentTime": "2023-07-26 11:26:12",
			"postId": postId,
		});
		jQuery(this).parents('.comment__item').remove();

		commentCount = parseInt(feedItem.find('.feed__body-comments p').text()) - 1;
		if (commentCount == 0) {
			feedItem.find('.feed__body-comments').remove();
		}
		else {
			feedItem.find('.feed__body-comments p').text(parseInt(feedItem.find('.feed__body-comments p').text()) - 1);
		}

	});
}

function errorPageActions() {
	jQuery(document).on('click', '.page__404-background', function () {
		if (!jQuery(this).hasClass('underMaintainance')) {
			window.history.pushState({ html: '', pageTitle: '' }, '', '/flights');
			reloadWindowWithIosCheck();
		}
	});
}

function messageDashboardActions() {
	// Send Button
	jQuery(document).on('click', '#send_message_dashboard', function () {
		// Add Validation check then call Jsinit

		if (localStorage.getItem('messageDashboardCohort') && localStorage.getItem('messageDashboardCohort') !== 'null') {
			// Check if the message is empty
			if (jQuery('#share__message').val().trim() == '' && localStorage.getItem('messageDashboardMedia') == null) {
				toast('Please enter a message or upload a Media.');
				return;
			}
			else {	
				toast('Sending Messages');
				renderMessagesDashboard('send');
				localStorage.removeItem('messageDashboardCohort');
			}
		}
		else {
			toast('Please select a Cohort.');
			return;	
		}
	});

	// Cohort Selection
	jQuery(document).on('change', '#message-cohorts', function () {
		// Remove 'active' class from all options
		jQuery('.cohortId').removeClass('active');
	  
		// Add 'active' class to selected option
		jQuery('option:selected', this).addClass('active');
		// Store in local Storage
		localStorage.setItem('messageDashboardCohort', jQuery('option:selected', this).val());
	});

}

function leadFormActions() {
	
	function getInputValueAndValidate(id, errorMessage) {

		if (!jQuery(`#${id}`).length){
			return '';
		}

		if (jQuery(`#${id}`).closest("[hidden]").length > 0){
			return '';
		}

		value = jQuery(`#${id}`).val();
		if (value === '' || value === null || value === undefined) {
            toast(errorMessage);
            throw new Error(errorMessage);
        }
		if (id === 'enquiry_dest' && jQuery('#enquiry_type').val() && jQuery('#booked_type').val() !== '') {
            value = value + ' (' + jQuery('#enquiry_type').val() + ')'+ ' ( Flight Booked: ' + jQuery('#booked_type').val() + ')';
        }
		// if (id ==  'enquiry_name' && jQuery('#enquiry_referred').val() != ''){
		// 	value = value + ' (Referred By: ' + jQuery('#enquiry_referred').val() + ')'; 
		// }
		return value;
	}
	
	jQuery(document).on('click', '#enquirySubmit', function () {
		try {
			payload = {
				"name": getInputValueAndValidate('enquiry_name', 'Please enter your Name'),
				"email": getInputValueAndValidate('enquiry_email', 'Please enter your Email'),
				"phoneNumber": getInputValueAndValidate('enquiry_number', 'Please enter your Phone Number'),
				"destination": getInputValueAndValidate(getDestinationSelector(), 'Please enter your Destination'),
				"travelDate": getInputValueAndValidate('enquiry_dot', 'Please enter date of travel'),
				//"numberOfDays": getInputValueAndValidate('enquiry_dor', 'Please enter number of days'),
				"budgetPerPerson": getInputValueAndValidate('enquiry_budget', 'Please enter your Budget.'),
				"numberOfPax": getInputValueAndValidate('enquiry_pax', 'Please enter number of passengers'),
			};
			// Call API with the Payload
			//jsInit('sendEnquiryDetails', payload);
			
			//Open Whatsapp
			var textMessage = `booking a trip to ${payload.destination}. My Details are --> Name: ${payload.name}\nEmail: ${payload.email}\nPhone Number: ${payload.phoneNumber}\nDestination: ${payload.destination}\nTravel Date: ${payload.travelDate}\nBudget Per Person: ${payload.budgetPerPerson}\nNumber of Pax: ${payload.numberOfPax}`;
			sendWhatsAppEnquiryGlobal(textMessage, '', 'enquiryFormLeads');
			
			
			//toast('Thank you for your interest. We will get back to you soon.');
			enquiryLocationsShown.push(jQuery('#'+getDestinationSelector()).val().toLowerCase());
	
			// Clear the form after submission
			jQuery('#enquiry_name, #enquiry_number, #enquiry_email, #enquiry_dest').val('');
			jQuery('.popup__head-close').click();
			jQuery('.popup__container').removeClass('enquiry__container__overlap');
			jQuery('.popup__head-close svg path').css('fill', '#000');

		} 
		catch (error) {
			console.error(error.message);
		}
	});
	
	jQuery(document).on('click', '#enquiryCancel, #enquiryCancelTop', function () {
		jQuery('.popup__mask').click();
		fbEvent('enquiryForm', 'Enquiry Form Closed');
	});
}

function filterCommunityActions() {
	jQuery(document).on("click", "#price-filter", function () {
		jQuery(".price_range_wrapper").show();
		if (jQuery(".filter-list-container-wrapper")){
			jQuery(".filter-list-container-wrapper").hide();
		}
		if (jQuery("#datePickerInput") && jQuery("#datePickerInput")
		.data("daterangepicker")) {
			jQuery("#datePickerInput").data("daterangepicker").hide();
		}
	});

  
	jQuery(document).on("click", ".price_range_wrapper .apply-btn #applyPriceFilterBtn", function () {
		minPrice = parseInt(jQuery(".price_range_wrapper .input-min").val());
		maxPrice = parseInt(jQuery(".price_range_wrapper .input-max").val());
	
		placeholderText = "Min - " + minPrice + " | Max - " + maxPrice;
		jQuery("#experiences__search input").val(placeholderText);
		jQuery("#experiences__search .experiences__header-search-btn").html(icons.close)
		.addClass("hide-experience-results");
		jQuery(".price_range_wrapper").hide();
		jsInit( "getExperiences", { filter: { priceRange: { minValue: minPrice, maxValue: maxPrice, }, }, }, "searchExperiences" );
	
		loaderMain("global", true);
	
		jQuery(".experiences__body").hide();
		jQuery("#experiences__search .experiences__header-search-btn").html(icons.close).addClass("hide-experience-results");
		jQuery(".experiences__search-categories").addClass("category-selected");
		jQuery(".experiences__search").addClass("active");
  
	});
  
	jQuery(document).on("click", ".select_category", function () {
		jQuery(".filter-list-container-wrapper").show();
		if (jQuery("#datePickerInput") && jQuery("#datePickerInput")
		.data("daterangepicker")) {
			jQuery("#datePickerInput").data("daterangepicker").hide();
		}
		if (jQuery(".price_range_wrapper")) {
			jQuery(".price_range_wrapper").hide();
		}
	});
  
	jQuery(document).on("click", ".filter__select__list li", function () {
		console.log(jQuery(this).html());
		var liValue = jQuery(this).html();
		jQuery("#experiences__search input").val(liValue);

		jQuery("#experiences__search .experiences__header-search-btn").html(icons.close).addClass("hide-experience-results");
		
		jQuery(".filter-list-container-wrapper").hide();
	
		jsInit( "getExperiences", { filter: { category: jQuery(this).text() } },	"searchExperiences" );
	
		loaderMain("global", true);
	
		jQuery(".experiences__body").hide();
		jQuery("#experiences__search .experiences__header-search-btn").html(icons.close).addClass("hide-experience-results");

		jQuery(".experiences__search-categories").addClass("category-selected").append('<div class="experiences__head-categories__box"><div class="experiences__head-category__item">' + jQuery(this).text() + '<span class="close">' + icons.close + "</span></div></div>" );
		jQuery(".experiences__search").addClass("active");
		// Removing &b adding the carousel 
		jQuery('.premium-carousel').remove();
	});

	jQuery(document).on("click", "#cancel-filter-applied", function () {
        jQuery(".price_range_wrapper").hide();
    });

	jQuery(document).on("click", "#cancel-filter-categories", function () {
		jQuery(".filter-list-container-wrapper").hide();
	});
  
	jQuery(document).on("click",".filter__date__experiences", function (event) {
		event.preventDefault();
		//initializeDateRangePicker();
		jQuery("#datePickerInput").data("daterangepicker").show();
		if (jQuery(".price_range_wrapper").length){
			jQuery(".price_range_wrapper").hide();
		}
		if (jQuery(".filter-list-container-wrapper").length){
			jQuery(".filter-list-container-wrapper").hide();
		}
		
	});
	
  
}
function initializeDateRangePicker() {
    jQuery("#datePickerInput").daterangepicker({},function (start, end, label) {
        startValue = start.format("D/MM/YY");
        endValue = end.format("D/MM/YY");
        
        placeholderText = "Date Range: " + startValue + " - " + endValue;
        
        jQuery("#experiences__search input").val(placeholderText);
        jQuery("#experiences__search .experiences__header-search-btn").html(icons.close).addClass("hide-experience-results");

        jsInit("getExperiences", { filter: { dateRange: { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD"), }, }, }, "searchExperiences" );
        jQuery(".experiences__body").hide();
        loaderMain("global", true);
        jQuery(".experiences__search-categories").addClass("category-selected");
        jQuery(".experiences__search").addClass("active");
    });
}

function onboardingVideoActions() {
	jQuery(document).on('click', '.onboardingVideo', function () {
		localStorage.setItem('onboardingVideo', true);
		destroyAllSecondaryTabs();
		jQuery('.desktopMenu-experiencesApp').click();
		jQuery('.experiencesToggle input[type="radio"][value="1"]').click();
		//showLoginForApps();
	});
}

function homePageActions() {
	jQuery(document).on("click", ".premium_form_left, .aiBuddy, .card-yellow-light .loved-things, .loved-things-card.shop-now-card, .findTravelBuddy, .createGroups, .findInfluencers, .banner-image-wrapper, #shareStories, .card-blue-light, .home__search_container, .card-grey-light, .showExperiences", function (event) {
		event.preventDefault();
		clickedElement = jQuery(this);
		if (clickedElement.attr('class') != 'loved-things-card card-grey-light') {
			jQuery('#main__homepage-box').hide();
		}

		switch (clickedElement.attr('class')) {
			
			case 'closeFormPremium':
				clickedElement.find('.popup__head-close').click();
				clickedElement.find(".popup__container").hide();
				clickedElement.find('.popup__head').show();
				break;
			case 'premium_form_left':
			case 'findTravelBuddy':
				jQuery('.header__hamburger').show();
				redirect('premium');
				break;
			case 'things-cards createGroups':
                if (guestMaster()) {
                    redirect('login');
                    jQuery('#main__homepage-box').show();
                    return;
                }
				jQuery('.head__chat').click();
				break;
			case 'things-cards findInfluencers':
				jQuery('#footer ul li[data-item="addPost"]').click();
				jQuery('.addPost__find-tabs ul li[data-tab="influencers"]').click();
				break;
			case 'banner-image-wrapper':
                if (guestMaster()) {
                    redirect('login');
                    jQuery('#main__homepage-box').show();
                    return;
                }
				jQuery('#footer ul li[data-item="addPost"]').click();
                break;
			case 'things-cards':
				jQuery('#footer ul li[data-item="feed"]').click();	
				break;
			case 'loved-things-card card-blue-light':
				// Show Hamburger Icon
				jQuery('.header__hamburger').show();
				redirect('flights-hotels');	
				break;
			case 'home__search_container':
				// Dont open the keyboard 
				jQuery('.home__search_container input').attr('readonly', 'readonly');
				jQuery('#footer ul li[data-item="addPost"]').click();
				jQuery('.head__search').click();
			break;
			case 'loved-things-card card-grey-light':
                if (guestMaster()) {
                    redirect('login');
                    jQuery('#main__homepage-box').show();
                    return;
                }
				renderPermissionBox('init', 'leadForm');
				break;
			case 'things-cards showExperiences':
				jQuery('#footer ul li[data-item="experiences"] svg').click();
				break;
			case 'loved-things':
				jsInit('getExperiences', {"filter":{
					"trending":{
						"type": "group_trips"
					}
				}}, "trendingGroupTrips");
				jQuery('#main__homepage-box').hide();
				manageSecondary('show', 'trendingGroupTrips');
				window.history.pushState({ page: "groupTrips" }, "groupTrips", "/groupTrips");
				loaderMain('secondary', true);
				break;
			case 'loved-things-card shop-now-card':
				window.open('https://mytravelstore.beatravelbuddy.com/', '_blank');
				jQuery('#main__homepage-box').show();
				break;
            case 'things-cards aiBuddy':
                if (guestMaster()) {
                    redirect('login');
                    jQuery('#main__homepage-box').show();
                    return;
                }
                manageSecondary('show', 'ai_itinerary');
                break;   
			default:
				console.log('No action defined for this element');
		}
	});
	
	jQuery(document).on('click', '.home__search_container input', function () {
		// Dont open the keyboard 
		jQuery('.home__search_container input').attr('readonly', 'readonly');
		jQuery('div#footer ul li[data-item="feed"] svg').click();
		jQuery('.head__search').click();
	});
	
	jQuery(document).on('click', '#closeFormPremium', function(event) {
		event.preventDefault();
		jQuery('.popup__mask').click();
	});
	
	
}

function itineraryActions() {

	function getEventData(){
		return {
			'userId': manageUserProfile('read', 'userId'),
			'userName': manageUserProfile('read', 'name'),
			'userEmail': manageUserProfile('read', 'email'),
			'userPhone': manageUserProfile('read', 'phoneNumber'),
			'userType': manageUserProfile('read', 'userType'),
			'userLocation': manageUserProfile('read', 'location'),
		};
	}
	
    jQuery(document).on('click', '.head__addPost, .desktopMenu-aiBuddy', function () {
        
        manageSecondary('show', 'ai_itinerary');
        jQuery('.desktopMenu-aiBuddy').addClass('active');
		eventData = getEventData();
		// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
        //     Moengage.track_event('TBD_AI_BUDDY_OPENED', eventData);
        // }
        // if (isAndroid()) {
        //     Android.moEngageData('TBD_AI_BUDDY_OPENED', JSON.stringify(eventData));
        // }
	});
    
    
	jQuery(document).on('click', '.generateIti', function () {
        if (guestMaster()) {
            redirect('login');
            loaderMain('secondary', false);
            return;
		}
		if (manageUserProfile('read', 'isVerified') == true) {
			if (!checkAiEnable()) {
				toast('You have reached the maximum limit of AI Itineraries. Please wait for 24 hours to generate a new itinerary.');
				return;
			}
			// Update the timestamp when generation starts
			localStorage.setItem('lastTimeAiMade', new Date().toISOString());
			console.log('Generate Iti');
			// Generate the itinerary...

			// Define the fields to be validated
			fields = [
				{ selector: '#ai__search', message: 'Please select a location' },
				{ selector: '.invisible-checkbox-Ai:checked', message: 'Please select a travel type' },
				{ selector: '#travel__month', message: 'Please select a month' },
				{ selector: '#traveller__type', message: 'Please select a traveller type' },
				{ selector: '#budget__type', message: 'Please select a budget type' }
			];

			// Validate each field
			for (field of fields) {
				value = field.attr ? jQuery(field.selector).attr(field.attr) : jQuery(field.selector).val();
				if (!value || value == '') {
					toast(field.message);
					return;
				}
			}
        
			// Show loading animation
			showLoadingAnimation();

			// Get form values
			locationCity = jQuery('#ai__search').val();
			month = jQuery('#travel__month').val();
			budgetType = jQuery('#budget__type').val();
			passengers = jQuery('#traveller__type').val();

			// Get selected travel types
			travelType = '';
			jQuery('.ai__trending .invisible-checkbox-Ai:checked').each(function () {
				travelType += jQuery(this).val() + ', ';
			});
			valuesString = checkboxesData.map(item => item.value).join(',');
       
			// Convert month names to numbers
			monthNames = { "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12 };
        
			monthNumber = monthNames[month];

			// Map category names to IDs
			categoryIds = { 'Backpacking': 1, 'Adventures': 2, 'Cultural': 3, 'roadTrip': 4, 'famousCusines': 5, 'family': 6, 'Mountaineering': 7, 'Beaches': 8, 'Kayaking / Boating': 9, 'Religious': 10, 'City Tours': 11, 'Trekking': 12, 'Historical': 13, 'Biking': 14, 'Heritage': 15, 'Waterfalls': 16, 'Meet Ups': 17, 'Homestay': 18, 'Offroading': 19, 'wildLife': 20, 'Art and Crafts': 21, 'NightLife': 22, 'Water Sports': 23, 'Shopping': 24, 'Events and Exhibitions': 25, 'Diving': 26, 'Sustainable Living': 27, 'Health and Fitness,': 28, 'Winter Sports': 29, 'Caving': 30, 'Luxurious': 31, 'Romantic': 32, 'Volcanoes': 33, 'StarGazing': 34, 'themeParks': 35, 'hidden-gems': 36, 'weekend-gateways': 37, 'must visit places': 38, };
        
			catId = [];
			jQuery('.invisible-checkbox-Ai:checked').each(function () {
				value = categoryIds[jQuery(this).val()];
				catId.push(value ? value : '41');
			});

			// Map budget names to values
			budgetNames = { "Budget-Friendly": 'budget_friendly', "Medium-Budget": "medium_budget", "High-Budget": "high_budget", "AI Decision": "ai_decision" };
			budgetSelcted = budgetNames[budgetType];
			packageOwnedId = '';
			// Update the counter for the Package Id
			if (localStorage.getItem('packageOwnedId') != null || localStorage.getItem('packageOwnedId') != undefined) {
				packageOwnedId = localStorage.getItem('packageOwnedId');
			}

			// Start the AI model after a delay
			setTimeout(function () {
				state = jQuery('.ai-location-search').attr('data-state') || 'N.A';
				country = jQuery('.ai-location-search').attr('data-country') || 'N.A';
            
				data = { state: state, country: country, aiModel: '', location: locationCity.split(',')[0], month: monthNumber, budget: budgetSelcted, travelType: travelType, categories: catId, passengers: passengers, valueString: valuesString, packageOwnedId: packageOwnedId };
            
				jsInit('googleAi', data, locationCity.split(',')[0]);
			}, 1500);

			eventData = getEventData();
			// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
			//     Moengage.track_event('TBD_AI_GENERATE', eventData);
			// }
			// if (isAndroid()) {
			//     Android.moEngageData('TBD_AI_GENERATE', JSON.stringify(eventData));
			// }
		}
		else {
			toast('Go Premium to Generate AI Itinerary.');
			redirect('premium');
		}
    });
    
	jQuery(document).on('click', '.day-sequence', function () {
		jQuery(this).find('p').toggleClass('open');
	});
    
    jQuery(document).on('click', '#ai__back', function () {
        //clearIntervalPremiumAi();
        destroyAllSecondaryTabs();
        jQuery('div#footer ul li[data-item="feed"] svg').click();
        jQuery('.desktopMenu-feed').click();
        window.history.pushState({ page: "home" }, "", "/community");
    });
    
    jQuery(document).on('click', '#ai__results-back', function () {
        clearIntervalPremiumAi();
        destroyAllSecondaryTabs();
        if (!jQuery(this).hasClass('userItinerary')) {
            manageSecondary('show', 'ai_itinerary');
        	jQuery('.desktopMenu-aiBuddy').addClass('active');
        }
        
        
    });
    
    jQuery(document).on('click', '#aIShare', function () {
        linkText = createDeepLink('aiIti', window.location.href.split('/').pop(), jQuery('.header__imageAI img').attr('src'), '', true, 'I have planned my trip to ' + jQuery('.ai__location-header').attr('data-location') + ' with the help of AI Buddy. Check out the itinerary here: ');
        console.log(linkText);
        if (isAndroid() || isIOS()) {
            createDeepLink('aiIti', window.location.href.split('/').pop(), jQuery('.header__imageAI img').attr('src'), false, false, linkText.text);
        }
        else {
            createDynamicLink('copy', { 'longDynamicLink': linkText.link }, linkText.text);
        }

		eventData = getEventData();
		// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
        //     Moengage.track_event('TBD_AI_SHARE', eventData);
        // }
        // if (isAndroid()) {
        //     Android.moEngageData('TBD_AI_SHARE', JSON.stringify(eventData));
        // }
    });
    
    
    jQuery(document).on('click', '.enquire__now', function () {
		destinationAndUrl = jQuery('.ai__location-header').attr('data-location') + ' - ' + window.location.href;
		sendWhatsAppEnquiryGlobal(destinationAndUrl, '', 'Ai Buddy');
        /*payload = {
            "name": manageUserProfile('read', 'name'),
            "email": manageUserProfile('read', 'email'),
            "destination": destinationAndUrl,
            "travelDate": jQuery('.ai__selected__month').text(),
            "numberOfDays": 5,
            "budgetPerPerson": jQuery('.ai__selected__budget').text(),
            "numberOfPax": jQuery('.ai__selected__traveller').text(),
			"phoneNumber": manageUserProfile('read', 'dialCode') + manageUserProfile('read', 'phoneNumber')
        };
        // Call API with the Payload
        jsInit('sendEnquiryDetails', payload);
        toast('Planning your trip is our top priority. A dedicated team member will reach out to you shortly to assist you. Thank you for choosing us for your travel needs.');*/
        jQuery('.enquire__now.betweenCards').remove();

		//eventData = getEventData();
		// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
        //     Moengage.track_event('TBD_AI_ENQUIRE_NOW', eventData);
        // }
        // if (isAndroid()) {
        //     Android.moEngageData('TBD_AI_ENQUIRE_NOW', JSON.stringify(eventData));
        // }
    });
    
    jQuery(document).on('click', '.find__buddies, #aIFind', function () {

		jQuery('.find__buddies, #aIFind').remove();
		jQuery('.enquire__now').css('width', '97%');
        
        mediaListFind = [];
        
        function createMediaObject(index, src) {
            return {
                description: '',
                id: '',
                mediaId: index.toString(),
                mediaType: 'image',
                imageHeight: 0,
                imageWidth: 0,
                mediaUrl: src,
                localUrl: '',
                thumbnailUrl: '',
                title: ''
            };
        }

        mediaListFind.push(createMediaObject(0, jQuery('.header__imageAI img').attr('src')));

        jQuery('.itinerary-image-container img').each(function(index) {
        mediaListFind.push(createMediaObject(index + 1, jQuery(this).attr('src')));
        });
        
        monthName = jQuery('.ai__selected__month').text(); // Get the month name
        currentYear = new Date().getFullYear(); // Get the current year
        date = new Date(monthName + " 1, " + currentYear); // Create a new Date object for the current year

        // If the date has already passed, use the next year
        if (date < new Date()) {
            date.setFullYear(currentYear + 1);
        }
        
        formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-01'; // Format the date
        console.log(formattedDate);
        
        payload = { dateOfTravel: formattedDate, description: '', location: jQuery('.ai__location-header').attr('data-location'),travelWithGender: 'any',lat: jQuery('.itinerary-result').attr('data-lat'),lng: jQuery('.itinerary-result').attr('data-lng'),type:1,userType:0, tripDuration: '4',dateType: 'flexible',travelerType: passengers = jQuery('.ai__selected__traveller').text().toLowerCase(), budget: jQuery('.ai__selected__budget').text() == 'High_budget' ? 'premium' : 'backpacking', bookFromTbd: '0',mediaList:mediaListFind };
        
        jsInit('addPost',payload,'findBuddyAi');
		eventData = getEventData();
		// if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
        //     Moengage.track_event('TBD_AI_FIND_BUDDY_POST', eventData);
        // }
        // if (isAndroid()) {
        //     Android.moEngageData('TBD_AI_FIND_BUDDY_POST', JSON.stringify(eventData));
        // }
    });
    
    jQuery(document).on('click', '.ai__price-right, .ai__price-left', function () {
        // Change name ai_price_right
        if (!guestMaster()) {
			eventData = getEventData();
            paymentData = { productId: 'tbd_ai_mini', amount: '9' };
            if (jQuery(this).hasClass('ai__price-right')) {
                paymentData = { productId: 'tbd_ai_super', amount: '39' };
                // if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
                //     Moengage.track_event('TBD_AI_PREMIUM_STARTED_SUPER', eventData);
                // }
                // if (isAndroid()) {
                //     Android.moEngageData('TBD_AI_PREMIUM_STARTED_SUPER', JSON.stringify(eventData));
                // }
            }
            else {
                // if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
                //     Moengage.track_event('TBD_AI_PREMIUM_STARTED_MINI', eventData);
                // }
                // if (isAndroid()) {
                //     Android.moEngageData('TBD_AI_PREMIUM_STARTED_MINI', JSON.stringify(eventData));
                // }
            }
            managePayments("premiumAiInit", paymentData);
        }
    });
    
    jQuery(document).on('click', '.saved-trips-overlay', function () {
        redirect('showAllAiTrips');
    });
    
    jQuery(document).on('click', '.allAI__trips_image', function () {
        jsInit('getItinerary', { 'itineraryId': jQuery(this).parents('.allAI__trips').attr('data-id') });
    });

	jQuery(document).on('click', '.browse-app', function(event) {
        event.preventDefault();
        jQuery('div#footer ul li[data-item="feed"] svg').click();
    });

	jQuery(document).on('click', '.profile_icon_ai_page', function(){
        itiUserId = jQuery(this).attr('data-itiuserid');
        if (itiUserId.length < 0) {
            jsInit('openProfileFromChat', { userId : itiUserId});
        }
        else {
            redirect('profile', itiUserId);
        }
    });
    
    function showLoadingAnimation() {
        jQuery('body').prepend('<div class="global__loading" ><div class="feed__loading" id="lottie__loading"><div class="hold__horses">Planning your Trip !</div></div></div>');
        jQuery('.global__loading').css('background', 'url(/view/assets/img/login-bg.jpg) no-repeat center center fixed');
        lottie.loadAnimation({
            container: document.getElementById('lottie__loading'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/view/assets/img/aiOpeningPage.json'
        });

        messages = [ "Planning your Trip !", "Curating the best trip especially for you", 
            "Finding the best spots for you", "Calculating optimal routes", 
            "Checking the weather for your trip", "Almost there...", "Just a moment..." ];
        index = 0;

        intervalFadeText = setInterval(function() {
            jQuery('.hold__horses').fadeOut(function() {
                jQuery(this).text(messages[index]).fadeIn();
            });
            index++;
            if (index === messages.length) {
                clearInterval(intervalFadeText);
                setInterval(function() {
                    jQuery('.hold__horses').animate({opacity: 0}, 700, function() {
                        jQuery(this).animate({opacity: 1}, 1500);
                    });
                }, 2500);
            }
        }, 3500);
    }
    
}

function hostellerActions() {
     // Attach click event listener to all elements with class 'hosteller__card_link'
    jQuery(document).on('click', '.hosteller__card_link', function(event) {
        // Get the href attribute of the clicked element
        hostelLink = jQuery(this).attr('href');
        // if (!(window.location.href.includes('localhost')) && !(window.location.href.includes('dev.')) && !isAndroid()) {
        //     Moengage.track_event('TBD_HOSTELLER_CARD_CLICKED' , { 'hostelLink': hostelLink });
        // }
        // if (isAndroid()) {
        //     Android.moEngageData('TBD_HOSTELLER_CARD_CLICKED', JSON.stringify({ 'hostelLink': hostelLink }));
        // }
    });
    
    jQuery(document).on('click', '.discount-banner', function(event) {
        // Copy the referral code to the clipboard
        referralCode = jQuery(this).attr('discount-code');
        copyToClipboard(referralCode);
        toast('Referral code copied to clipboard');
    });
    
}

function manageListingsActions() {
    // Assuming tabNames is defined as before
    tabNames = ['inreview', 'published', 'draft', 'deleted'];

    // Add click event listeners to the tabs
    jQuery(document).on('click', '.tab', function() {
        tabIndex = jQuery(this).data('index');
        tabName = tabNames[tabIndex];
       // Remove all child elements of the Div named page along with their data and event handlers for memory efficiency
        jQuery('.page').children().remove();
        switchTab(tabIndex, tabName, jQuery(this));
    
    });
    
    jQuery(document).on('click', '.adminManageServices', function() {
        service_id = jQuery(this).attr('data-service-id');
		redirect('manageSingleListing', service_id);
    });
    
    jQuery(document).on('click', '.services__publish-btn, .services__decline-btn, .services__enable-btn, .services__disable-btn, .services__deleted-btn', function() {
        serviceId = jQuery(this).parents('.single__experience-page').attr('data-id');
        buttonClassToStatus = {
            'services__publish-btn': 'published',
            'services__decline-btn': 'declined',
            'services__enable-btn': 'enabled',
            'services__disable-btn': 'disabled',
            'services__deleted-btn': 'deleted'
        };
        listingStatus = '';
        // Iterate over each class name in the buttonClassToStatus object
        Object.keys(buttonClassToStatus).forEach(className => {
            if (jQuery(this).hasClass(className)) {
                listingStatus = buttonClassToStatus[className];
                console.log('Button class:', listingStatus, serviceId);
            }
        });
        jsInit('adminUpdateListingStatus', { 'listingId': serviceId, 'listingStatus': listingStatus });
    });
}

function arrowSlidingActions(){
    jQuery(document).on('click', '#scrollLeft', function() {
        console.log('btn-clicked');
        swiperWrapper = jQuery(this).prev('.swiper-wrapper');
        currentScrollPosition = swiperWrapper.scrollLeft();
        console.log('Current Scroll Position:', currentScrollPosition);
        swiperWrapper.animate({ scrollLeft: currentScrollPosition + 500 }, 1000); // 1000ms for smooth scroll
        console.log('New Scroll Position:', swiperWrapper.scrollLeft());
    });
    jQuery(document).on('click', '#scrollRight', function() {
        console.log('btn-clicked');
        swiperWrapper = jQuery(this).next('.swiper-wrapper');
        currentScrollPosition = swiperWrapper.scrollLeft();
        swiperWrapper.animate({ scrollLeft: currentScrollPosition - 500 }, 1000); // 1000ms for smooth scroll
        console.log('Current Scroll Position:', currentScrollPosition);
    });
}


function tboFlightsActions() {
	// Reverse the Source & Destination
	jQuery(document).on('click', '.reverse__from-to', function () {
		// Swap input values
		let from = jQuery('#sourceInput').val(),
			to = jQuery('#destinationInput').val();
		jQuery('#sourceInput').val(to);
		jQuery('#destinationInput').val(from);
	
		// Swap attributes
		let fromContainer = jQuery('#sourceInput').closest('.airport__search-container'),
			toContainer = jQuery('#destinationInput').closest('.airport__search-container');
	
		['airport-code', 'airport-name', 'city-name', 'country-name', 'latitude', 'longitude', 'timezone', 'city-code', 'country-code'].forEach(attr => {
			let temp = fromContainer.attr(attr);
			fromContainer.attr(attr, toContainer.attr(attr));
			toContainer.attr(attr, temp);
		});
	});

	jQuery(document).on('click', '.flight_option', function () {
		changeCabinClass(this);
	});

	// Rendering the Airport List Dropdown

	jQuery(document).on('keyup', '#sourceInput, #destinationInput', function () {

		clearTimeout(timeout);

		timeout = setTimeout(() => {
			value = jQuery(this).val().trim().toLowerCase();
			// Fetch the airport list
			if (value.length > 2) {
				jsInit('getAirportInfo', { filterBy: value }, jQuery(this).attr('id'));
			}
			
		}, 500); // 500ms delay before the search function is called
	});

	$(document).on('click', '#flight__pax_class', function () {
		// Fetching the number of adults, children, and infants
		adultsCount = $(
			'.flight__traveller__class__body__traveller__option:nth-child(1) .count'
		).text();
		childrenCount = $(
			'.flight__traveller__class__body__traveller__option:nth-child(2) .count'
		).text();
		infantsCount = $(
			'.flight__traveller__class__body__traveller__option:nth-child(3) .count'
		).text();

		// Fetching the selected cabin class
		selectedCabinClass =
			$('input[name="cabin_class"]:checked').val() || 'None';

		// Displaying the fetched details
		console.log(
			`Adults: ${adultsCount}, Children: ${childrenCount}, Infants: ${infantsCount}, Cabin Class: ${selectedCabinClass}`
		);

		// Populating the values in the form
		['adults', 'children', 'infants'].forEach((field) =>
			jQuery(`#travelDetails-${field}`).val(window[`${field}Count`])
		);
		jQuery('#travelDetails-cabin').val(selectedCabinClass);

		jQuery('.pax__class-label').text(
			getTotalPaxCount() +
				' Travellers | ' +
				$(
					'label[for="' +
						$('input[name="cabin_class"]:checked').attr('id') +
						'"]'
				)
					.text()
					.trim()
		);

		jQuery('.popup__mask').click();
	});

	jQuery(document).on('change', '#depDate', function () {
		// Set the min of #returnDate to the value of #depDate
		jQuery('#returnDate').attr('min', jQuery(this).val());
	});
	
	jQuery(document).on('click', '#one__way-flight, .returning__cross_sign', function (event) {
		event.stopPropagation(); // Stop the event from propagating to the main container
		$('#returnDate').val('');
		$('#depDate').attr('max', '');
		
		if (event.target.id === 'one__way-flight') {
			$('.returning__cross_sign').remove();
		} else {
			$('.booking-option.flightsSearch label:nth-child(1) input').click();
			$(event.target).remove();
		}
		jQuery('.date__text-return').addClass('adjust__font-size').text('Tap to add a return date for bigger discounts');
	});

	// Open Travellers & Cabin Class Pop-Up
	$(document).on('click', '.booking-select-button', function () {
		managePopups('show', 'flightTravellerClass');
	});

	// Find all increment and decrement buttons
	$(document).on('click', '.increment', function () {
		countSpan = $(this).prev('.count');
		count = parseInt(countSpan.text(), 10);
		totalPax = getTotalPaxCount();
		if (totalPax < 9) {
			countSpan.text(count + 1);
		} else {
			toast('Maximum 9 passengers allowed');
		}
	});

	// Function to get the total count of adultType, child, and infant
	function getTotalPaxCount() {
		adultCount =
			parseInt($('.decrement.adultType').next('.count').text(), 10) || 0;
		childCount =
			parseInt($('.decrement.child').next('.count').text(), 10) || 0;
		infantCount =
			parseInt($('.decrement.infant').next('.count').text(), 10) || 0;
		return adultCount + childCount + infantCount;
	}

	jQuery(document).on('click', '.decrement', function () {
		countSpan = $(this).next('.count');
		count = parseInt(countSpan.text(), 10);
		
		if ((jQuery(this).hasClass('adultType') && count > 1) || 
			((jQuery(this).hasClass('child') || jQuery(this).hasClass('infant')) && count >= 1)) {
			countSpan.text(count - 1);
		}
	});

	// Search Flights Button
	$(document).on('click', '.search__flight', function () {
		// Usage
		if (!validateForm('tboFlightsSearch', '', '')) return;
		
		searchFlights('searchFlights');
		jQuery('#floating-enquiry-btn').hide();
		history.pushState(null, '', window.location.href + '-search');
	});
	
	// Ticketing API after booking
	$(document).on('click', '.flight__ticketing', function () {
		pnr = jQuery(this).attr('data-pnr');
		bookingId = jQuery(this).attr('data-booking-id');
		dob = jQuery(this).attr('data-dob');

		ticketPayload = {
			PNR: pnr,
			BookingId: Number(bookingId),
			DateOfBirth: dob
		};

		jsInit('flightTicketing', ticketPayload);
	});

	// Selecting the Seat
	/*$(document).on('click', '.seat', function (e) {
		console.log(
			'Seat Selection',
			JSON.parse(jQuery(this).attr('data-seat-info'))
		);

		seatDataOfFlight = jQuery('.flights__ssr.tabs.active').attr('data-call-from');
		
		// Here also check for the total number of passengers
		// If the total number of passengers is 1 then only allow the user to select the seat or if the seat is already selected then allow the user to change the seat
		avail = jQuery(this).attr('data-avail');
		adultCount = parseInt($('#travelDetails-adults').val(), 10) || 0;
		childCount = parseInt($('#travelDetails-children').val(), 10) || 0;

		// Infants Seat Selection is not allowed

		totalPax = adultCount + childCount;
		checkedSeatsCount = jQuery('.seat.seat__checked').length;

		ssrFlightIndex = 0;
		
		let seatInfo = JSON.parse(jQuery(this).attr('data-seat-info'));
		
		function updateSeatInformation(array, index, seatInfo, isChecked) {
			if (isChecked) {
				array[index] = seatInfo;
			} else {
				
				array.splice(index, 1); // Remove the seat information
			}
		}

		if (jQuery('.flights__ssr.tabs.active').length > 0) {
			ssrFlightIndex = parseInt(jQuery('.flights__ssr.tabs.active').attr('data-index'), 10);
		}

		if (jQuery(this).hasClass('booked')) {
			toast('Seat is already booked. Please select another seat!');
			return;
		} else {
			// This checks if the seat is available or not
			if ((avail === '0' || avail === '1') && (totalPax > checkedSeatsCount)) {
				// Getting the initial state of the seat
				let isCheckedIntial = jQuery(this).hasClass('seat__checked');
				jQuery(this).toggleClass('seat__checked');
				
				function ensureArrayLength(array, index, defaultValue) {
					while (array.length <= index) {
						array.push(defaultValue);
					}
				}
				let isChecked = jQuery(this).hasClass('seat__checked');
				
				// If the flight is one way then update the seat information for the one way flight
				if (jQuery('.flights__search').attr('data-return') == 'false') {
					
					// One Way Flight
					ensureArrayLength(seatSelectedOw, ssrFlightIndex, tboSSR.Response.SeatDynamic[0].SegmentSeat[0].RowSeats[0].Seats[0]);
					updateSeatInformation(seatSelectedOw, ssrFlightIndex, seatInfo, isChecked);
				}
				// If the flight is return then update the seat information for the return flight
				else if (jQuery('.flights__search').attr('data-return') == 'true') {
					switch (seatDataOfFlight) {
						case 'tboSSROb':
							ensureArrayLength(seatSelectedOb, ssrFlightIndex, tboSSROb.Response.SeatDynamic[0].SegmentSeat[0].RowSeats[0].Seats[0]);
							updateSeatInformation(seatSelectedOb, ssrFlightIndex, seatInfo, isChecked);
							break;
						case 'tboSSRIb':
							ensureArrayLength(seatSelectedIb, ssrFlightIndex, tboSSRIb.Response.SeatDynamic[0].SegmentSeat[0].RowSeats[0].Seats[0]);
							updateSeatInformation(seatSelectedIb, ssrFlightIndex, seatInfo, isChecked);
							break;
					}
				}	
				// Update the total base fare. If the seat is checked then add the price of the seat to the total base fare otherwise subtract the price of the seat from the total base fare
				
				totalBaseFare = isCheckedIntial ? Number(jQuery('.flights__footer-price').attr('total-price')) - Number(seatInfo.Price) : Number(jQuery('.flights__footer-price').attr('total-price')) + Number(seatInfo.Price);
				jQuery('.flights__footer-price').attr('total-price', totalBaseFare);
				
				jQuery('.flights__footer-price').attr('seat-price', seatInfo.Price);
				jQuery('.flights__footer-price').attr('base_fare', totalBaseFare);
				jQuery('.flights__footer-price .price').text(`₹ ${totalBaseFare}`);	
				
				ssrArrayIndex++;
			}
			// If the total number of passengers is equal to the number of checked seats then do not allow the user to select more seats
			else if (totalPax == checkedSeatsCount && jQuery(this).hasClass('seat__checked')) {
				jQuery(this).toggleClass('seat__checked');
				
				updateSeatInformation(seatSelectedOw, ssrFlightIndex, jQuery(this).attr('data-seat-info'), false);
				
				jQuery('.flights__footer-price').attr('seat-price', seatInfo.Price);
				
				totalBaseFare = Number(jQuery('.flights__footer-price').attr('total-price')) - Number(seatInfo.Price);
				
				jQuery('.flights__footer-price').attr('total-price', totalBaseFare);
				
				jQuery('.flights__footer-price').attr('base_fare', totalBaseFare);
				jQuery('.flights__footer-price .price').text(`₹ ${totalBaseFare}`);
				
				ssrArrayIndex--;
			
				
			}
			else if (avail != '0' && avail != '1') {
				toast('Seat is not available. Please select another seat!');
			}
            else {
                toast('Maximum Seats selected.');
                // Take the user to Meal Selection Page
            }
		}
	});*/
	$(document).on('click', '.seat', function (e) {
		console.log('Seat Selection', JSON.parse(jQuery(this).attr('data-seat-info')));
	
		let seatDataOfFlight = jQuery('.flights__ssr.tabs.active').attr('data-call-from');
		let avail = jQuery(this).attr('data-avail');
		let adultCount = parseInt($('#travelDetails-adults').val(), 10) || 0;
		let childCount = parseInt($('#travelDetails-children').val(), 10) || 0;
		let totalPax = adultCount + childCount;
		let checkedSeatsCount = jQuery('.seat.seat__checked').length;
		let seatInfo = JSON.parse(jQuery(this).attr('data-seat-info'));
		let ssrFlightIndex = jQuery('.flights__ssr.tabs.active').length > 0 ? parseInt(jQuery('.flights__ssr.tabs.active').attr('data-index'), 10) : 0;
	
		if (jQuery(this).hasClass('booked')) {
			toast('Seat is already booked. Please select another seat!');
			return;
		}
	
		let updateSeatInformation = (array, seatInfo, isChecked) => {
			let index = array.findIndex(seat => seat.Code === seatInfo.Code);
			if (isChecked) {
				if (index === -1) array.push(seatInfo);
				else array[index] = seatInfo;
			} else {
				if (index !== -1) array.splice(index, 1);
			}
		};
	
		let updateTotalBaseFare = (isCheckedInitial, seatInfo) => {
			let totalBaseFare = isCheckedInitial
				? Number(jQuery('.flights__footer-price').attr('total-price')) - Number(seatInfo.Price)
				: Number(jQuery('.flights__footer-price').attr('total-price')) + Number(seatInfo.Price);
			jQuery('.flights__footer-price').attr('total-price', totalBaseFare);
			jQuery('.flights__footer-price').attr('seat-price', seatInfo.Price);
			jQuery('.flights__footer-price').attr('base_fare', totalBaseFare);
			jQuery('.flights__footer-price .price').text(`₹ ${totalBaseFare}`);
			jQuery('.bill-details__grand-total').attr('data-total', totalBaseFare);
		};
	
		if ((avail === '0' || avail === '1') && (totalPax > checkedSeatsCount)) {
			let isCheckedInitial = jQuery(this).hasClass('seat__checked');
			jQuery(this).toggleClass('seat__checked');
			let isChecked = jQuery(this).hasClass('seat__checked');
	
			if (jQuery('.flights__search').attr('data-return') == 'false') {
				updateSeatInformation(seatSelectedOw, seatInfo, isChecked);
				jQuery('.flights__footer-continue.skipSSR').text('Continue');
			} else if (jQuery('.flights__search').attr('data-return') == 'true') {
				jQuery('.flights__footer-continue.skipSSR').text('Continue');
				switch (seatDataOfFlight) {
					case 'tboSSROb':
						updateSeatInformation(seatSelectedOb, seatInfo, isChecked);
						break;
					case 'tboSSRIb':
						updateSeatInformation(seatSelectedIb, seatInfo, isChecked);
						break;
				}
			}
	
			updateTotalBaseFare(isCheckedInitial, seatInfo);
		} else if (totalPax == checkedSeatsCount && jQuery(this).hasClass('seat__checked')) {
			jQuery(this).toggleClass('seat__checked');
			switch (seatDataOfFlight) {
				case 'tboSSROb':
					updateSeatInformation(seatSelectedOb, seatInfo, false);
					break;
				case 'tboSSRIb':
					updateSeatInformation(seatSelectedIb, seatInfo, false);
					break;
				default:
					updateSeatInformation(seatSelectedOw, seatInfo, false);
					break;
			}
			updateTotalBaseFare(true, seatInfo);
		} else if (avail != '0' && avail != '1') {
			toast('Seat is not available. Please select another seat!');
		} else {
			toast('Maximum Seats selected.');
			// Take the user to Meal Selection Page
		}
	});


	jQuery(document).on('click', '.flights__ssr.tabs', function () {
		
		console.log('SSR Tab Clicked', JSON.parse(jQuery(this).attr('data-seats')));
		dataOf = jQuery(this).attr('data-call-from');
		index = jQuery(this).attr('data-index');
		flightsBooking = jQuery('.flights__booking');
		
		
		jQuery('.flights__ssr.tabs').removeClass('active');
		jQuery(this).addClass('active');

		if (dataOf == 'tboSSROb') {
			generateSeatMap(tboSSROb.Response.SeatDynamic, index, true);
		} else if (dataOf == 'tboSSRIb') {
			generateSeatMap(tboSSRIb.Response.SeatDynamic, index, true);
		} else {
			generateSeatMap(tboSSR.Response.SeatDynamic, index, true);
		}
	});

	// Select Button on the Search Results Page
	jQuery(document).on('click', '.flight__card', function () {
		// Disabling View Fare Types Button
		/*let flightSessionExpired = checkFlightsSessionStatus();
		if (flightSessionExpired) {
			return;
		}
		jQuery('.flight__card').removeClass('active');
		jQuery(this).toggleClass('active');
		let flightFareTypes = JSON.parse(jQuery(this).data('flight-fare-types'));
		console.log('Flight Selected', flightFareTypes);
		
		if (jQuery(this).find('.flight__card__header .flight__fares').length == 0) {
			appendFlightFaresOptions(jQuery(this).find('.flight__card__header'), flightFareTypes);
		}*/
		
		let flightSessionExpired = checkFlightsSessionStatus();
		if (flightSessionExpired) {
			return;
		}
		
		jQuery(this).prop('disabled', true);

		// flight__card select__flight  flight__card__body__right__book
		if (jQuery(this).hasClass('select__flight') && jQuery('.flight__tab.onward').hasClass('active')) {
			if (jQuery('.flights__search').attr('data-return') == 'true') {
				console.log('Flight for Return is already selected.');
				// tboFareRule for both the flights
				fareRulePayload = {
					TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
					ResultIndex: jQuery(this).attr('data-result-index') // This will change
				};
				
				selFlightData.airlineCode = jQuery(this).attr('flight-code');
				selFlightData.airlineNumber = jQuery(this).find('.flight__details__name.aircode').text();
				selFlightData.depTime = jQuery(this).find('.flight__details__dep-time')
				.text();
				selFlightData.arrTime = jQuery(this).find('.flight__details__arr-time')
				.text();
				selFlightData.duration = jQuery(this).find('.flight__details__time.duration')
				.text();
				selFlightData.price = jQuery(this).find('.flight__card__body__right__price')
				.attr('flight-price');
				selFlightData.currency = jQuery(this).find('.flight__details__currency')
				.text();
				selFlightData.stop = 'Direct';
				
				selFlightData.allFlightData.flightDataForOb = JSON.parse(
					jQuery(this).data('data-flight-all')
				);
				getConvenienceChargesFlights();
				fbEvent('flightsSelected', selFlightData);
				webAnalytics('flightsSelected', selFlightData);
			}
			
			else {
				console.log('Select Flight for Return');
				
				selFlightData = { airlineCode: jQuery(this).attr('flight-code'), depTime: jQuery(this).find('.flight__details__dep-time').text(), airlineNumber: jQuery(this).find('.flight__details__name.aircode').text(), arrTime: jQuery(this).find('.flight__details__arr-time').text(), depCity: jQuery(this).find('.flight__details__source').text(), arrCity: jQuery(this).find('.flight__details__destination').text(), duration: jQuery(this).find('.flight__details__time.duration').text(), price: jQuery(this).find('.flight__card__body__right__price').attr('flight-price'), currency: jQuery(this).find('.flight__details__currency').text(), stop: 'Direct', allFlightData: { flightDataForOb: JSON.parse(jQuery(this).data('data-flight-all')) }, isReturn: true };
				
				jQuery('.flight__tab.return').click();
				jQuery('.flights__search').attr('data-return', 'true');
			}
			jQuery('.flights__search').attr(
				'data-ob-result-index',
				jQuery(this).attr('data-result-index')
			);
			jQuery('.flights__search').attr(
				'data-ob-is-lcc',
				jQuery(this).attr('data-lcc')
			);
		}
		else if (jQuery(this).hasClass('select__flight') && jQuery('.flight__tab.return').hasClass('active')) {
			if (jQuery('.flights__search').attr('data-return') == 'true') {
				jQuery('.flights__search').attr(
					'data-ib-result-index',
					jQuery(this).attr('data-result-index')
				);
				// tboFareRule for both the flights
				fareRulePayload = {
					TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
					ResultIndex: jQuery(this).attr('data-result-index') // This will change
				};
				selFlightData.allFlightData.flightDataForIb = JSON.parse(
					jQuery(this).data('data-flight-all')
				);

				selFlightData.airlineCodeIb = jQuery(this).attr('flight-code');
				selFlightData.airlineNumberIb = jQuery(this).find('.flight__details__name.aircode').text();
				selFlightData.depTimeIb = jQuery(this).find('.flight__details__dep-time')
				.text();
				selFlightData.arrTimeIb = jQuery(this).find('.flight__details__arr-time')
				.text();
				selFlightData.durationIb = jQuery(this).find('.flight__details__time.duration')
				.text();
				selFlightData.priceIb = jQuery(this).find('.flight__card__body__right__price')
				.attr('flight-price');
				selFlightData.currencyIb = jQuery(this).find('.flight__details__currency')
				.text();
				selFlightData.stopIb = 'Direct';
				
				getConvenienceChargesFlights();
				fbEvent('flightsSelected', selFlightData);
			}
			else {
				console.log('Select Flight for Onward');
				
				selFlightData = { airlineCodeIb: jQuery(this).attr('flight-code'), depTimeIb: jQuery(this).find('.flight__details__dep-time').text(), airlineNumberIb: jQuery(this).find('.flight__details__name.aircode').text(), arrTimeIb: jQuery(this).find('.flight__details__arr-time').text(), depCity: jQuery(this).find('.flight__details__source').text(), arrCity: jQuery(this).find('.flight__details__destination').text(), durationIb: jQuery(this).find('.flight__details__time.duration').text(), priceIb: jQuery(this).find('.flight__card__body__right__price').attr('flight-price'), currencyIb: jQuery(this).find('.flight__details__currency').text(), stopIb: 'Direct', allFlightData: { flightDataForIb: JSON.parse(jQuery(this).data('data-flight-all')) }, isReturn: true };
				
				jQuery('.flights__search').attr('data-return', 'true');
				jQuery('.flight__tab.onward').click();
			}
			jQuery('.flights__search').attr(
				'data-ib-result-index',
				jQuery(this).attr('data-result-index')
			);
			jQuery('.flights__search').attr(
				'data-ib-is-lcc',
				jQuery(this).attr('data-lcc')
			);
		}
		
		
		
		else {
			// if (jQuery('.flights__search').attr('international-round-trip') == 'true') {
			// }
			// else {
			// For One way to International Round trip Flights
			fareRulePayload = {
				TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
				ResultIndex: jQuery(this).attr('data-result-index') // This will change
			};
			selectedFlightForBookingOw = fareRulePayload;
			jQuery('.flights__search').attr(
				'data-result-index',
				jQuery(this).attr('data-result-index')
			);
			jQuery('.flights__search').attr(
				'data-lcc',
				jQuery(this).attr('data-lcc')
			);
			selFlightData = { airlineCode: jQuery(this).attr('flight-code'), depTime: jQuery(this).find('.flight__details__dep-time').text(), airlineNumber: jQuery(this).find('.flight__details__name.aircode').text(), arrTime: jQuery(this).find('.flight__details__arr-time').text(), depCity: jQuery(this).find('.flight__details__source').text(), arrCity: jQuery(this).find('.flight__details__destination').text(), duration: jQuery(this).find('.flight__details__time.duration').text(), price: jQuery(this).find('.flight__card__body__right__price').attr('flight-price'), currency: jQuery(this).find('.flight__details__currency').text(), stop: 'Direct', allFlightData: JSON.parse(jQuery(this).data('data-flight-all')), isReturn: false, flightFareTypes: JSON.parse(jQuery('.flight__card').data('flight-fare-types')) };
			
			getConvenienceChargesFlights();
			fbEvent('flightsSelected', selFlightData);
		}
	});
	
	// Book Now Button on the Search Results Page
	jQuery(document).on('click', '.flight__details__container.fare-types', function (e) {
		e.stopPropagation();
		// Check if the session has expired
		let flightSessionExpired = checkFlightsSessionStatus();
		if (flightSessionExpired) {
			return;
		}
		
		jQuery(this).prop('disabled', true);
		
		fareRulePayload = {
			TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
			ResultIndex: jQuery(this).attr('data-result-index') // This will change
		};
		
		let selectorType = jQuery(this).parents('.flight__card');
		
		// flight__card select__flight  flight__card__body__right__book
		if (selectorType.hasClass('select__flight') && jQuery('.flight__tab.onward').hasClass('active')) {
			if (jQuery('.flights__search').attr('data-return') == 'true') {
				console.log('Flight for Return is already selected.');
				// tboFareRule for both the flights
				fareRulePayload = {
					TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
					ResultIndex: jQuery(this).attr('data-result-index') // This will change
				};
				
				selFlightData.airlineCode = selectorType.attr('flight-code');
				selFlightData.airlineNumber = selectorType.find('.flight__details__name.aircode').text();
				selFlightData.depTime = selectorType.find('.flight__details__dep-time')
				.text();
				selFlightData.arrTime = selectorType.find('.flight__details__arr-time')
				.text();
				selFlightData.duration = selectorType.find('.flight__details__time.duration')
				.text();
				selFlightData.price = selectorType.find('.flight__card__body__right__price')
				.attr('flight-price');
				selFlightData.currency = selectorType.find('.flight__details__currency')
				.text();
				selFlightData.stop = 'Direct';
				
				selFlightData.allFlightData.flightDataForOb = JSON.parse(
					selectorType.data('data-flight-all')
				);
				getConvenienceChargesFlights();
				fbEvent('flightsSelected', selFlightData);
			}
			
			else {
				console.log('Select Flight for Return');
				
				selFlightData = { airlineCode: selectorType.attr('flight-code'), depTime: selectorType.find('.flight__details__dep-time').text(), airlineNumber: selectorType.find('.flight__details__name.aircode').text(), arrTime: selectorType.find('.flight__details__arr-time').text(), depCity: selectorType.find('.flight__details__source').text(), arrCity: selectorType.find('.flight__details__destination').text(), duration: selectorType.find('.flight__details__time.duration').text(), price: selectorType.find('.flight__card__body__right__price').attr('flight-price'), currency: selectorType.find('.flight__details__currency').text(), stop: 'Direct', allFlightData: { flightDataForOb: JSON.parse(selectorType.data('data-flight-all')) }, isReturn: true };
				
				jQuery('.flight__tab.return').click();
				jQuery('.flights__search').attr('data-return', 'true');
			}
			jQuery('.flights__search').attr(
				'data-ob-result-index',
				jQuery(this).attr('data-result-index')
			);
			jQuery('.flights__search').attr(
				'data-ob-is-lcc',
				jQuery(this).attr('data-lcc')
			);
		}
		else if (selectorType.hasClass('select__flight') && jQuery('.flight__tab.return').hasClass('active')) {
			if (jQuery('.flights__search').attr('data-return') == 'true') {
				jQuery('.flights__search').attr(
					'data-ib-result-index',
					jQuery(this).attr('data-result-index')
				);
				// tboFareRule for both the flights
				fareRulePayload = {
					TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
					ResultIndex: jQuery(this).attr('data-result-index') // This will change
				};
				selFlightData.allFlightData.flightDataForIb = JSON.parse(
					selectorType.data('data-flight-all')
				);

				selFlightData.airlineCodeIb = selectorType.attr('flight-code');
				selFlightData.airlineNumberIb = selectorType.find('.flight__details__name.aircode').text();
				selFlightData.depTimeIb = selectorType.find('.flight__details__dep-time')
				.text();
				selFlightData.arrTimeIb = selectorType.find('.flight__details__arr-time')
				.text();
				selFlightData.durationIb = selectorType.find('.flight__details__time.duration')
				.text();
				selFlightData.priceIb = selectorType.find('.flight__card__body__right__price')
				.attr('flight-price');
				selFlightData.currencyIb = selectorType.find('.flight__details__currency')
				.text();
				selFlightData.stopIb = 'Direct';
				
				getConvenienceChargesFlights();
				fbEvent('flightsSelected', selFlightData);
			}
			else {
				console.log('Select Flight for Onward');
				
				selFlightData = { airlineCodeIb: selectorType.attr('flight-code'), depTimeIb: selectorType.find('.flight__details__dep-time').text(), airlineNumberIb: selectorType.find('.flight__details__name.aircode').text(), arrTimeIb: selectorType.find('.flight__details__arr-time').text(), depCity: selectorType.find('.flight__details__source').text(), arrCity: selectorType.find('.flight__details__destination').text(), durationIb: selectorType.find('.flight__details__time.duration').text(), priceIb: selectorType.find('.flight__card__body__right__price').attr('flight-price'), currencyIb: selectorType.find('.flight__details__currency').text(), stopIb: 'Direct', allFlightData: { flightDataForIb: JSON.parse(selectorType.data('data-flight-all')) }, isReturn: true };
				
				jQuery('.flights__search').attr('data-return', 'true');
				jQuery('.flight__tab.onward').click();
			}
			jQuery('.flights__search').attr(
				'data-ib-result-index',
				jQuery(this).attr('data-result-index')
			);
			jQuery('.flights__search').attr(
				'data-ib-is-lcc',
				jQuery(this).attr('data-lcc')
			);
		}
		
		
		
		else {
			// if (jQuery('.flights__search').attr('international-round-trip') == 'true') {
			// }
			// else {
			// For One way to International Round trip Flights
			fareRulePayload = {
				TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
				ResultIndex: jQuery(this).attr('data-result-index') // This will change
			};
			selectedFlightForBookingOw = fareRulePayload;
			jQuery('.flights__search').attr(
				'data-result-index',
				jQuery(this).attr('data-result-index')
			);
			jQuery('.flights__search').attr(
				'data-lcc',
				jQuery(this).attr('data-lcc')
			);
			selFlightData = { airlineCode: selectorType.attr('flight-code'), depTime: selectorType.find('.flight__details__dep-time').text(), airlineNumber: selectorType.find('.flight__details__name.aircode').text(), arrTime: selectorType.find('.flight__details__arr-time').text(), depCity: selectorType.find('.flight__details__source').text(), arrCity: selectorType.find('.flight__details__destination').text(), duration: selectorType.find('.flight__details__time.duration').text(), price: selectorType.find('.flight__card__body__right__price').attr('flight-price'), currency: selectorType.find('.flight__details__currency').text(), stop: 'Direct', allFlightData: JSON.parse(selectorType.data('data-flight-all')), isReturn: false, flightFareTypes: JSON.parse(jQuery('.flight__card').data('flight-fare-types')) };
			
			getConvenienceChargesFlights();
			fbEvent('flightsSelected', selFlightData);
		}
		
		
		/*selectedFlightForBookingOw = fareRulePayload;
		jQuery('.flights__search').attr(
			'data-result-index',
			jQuery(this).attr('data-result-index')
		);
		jQuery('.flights__search').attr(
			'data-lcc',
			jQuery(this).attr('data-lcc')
		);
		
		let selectorType = jQuery(this).parents('.flight__card');
	
		
		selFlightData = {
			airlineCode: jQuery(this).attr('flight-code'),
			depTime: selectorType.find('.flight__details__dep-time').text(),
			airlineNumber: selectorType.find('.flight__details__name.aircode').text(),
			arrTime: selectorType.find('.flight__details__arr-time').text(),
			depCity: selectorType.find('.flight__details__source').text(),
			arrCity: selectorType.find('.flight__details__destination').text(),
			duration: selectorType.find('.flight__details__time.duration').text(),
			price: selectorType.find('.flight__card__body__right__price').attr('flight-price'),
			currency: selectorType.find('.flight__details__currency').text(),
			stop: 'Direct',
			allFlightData: JSON.parse(selectorType.data('data-flight-all')),
			isReturn: false,
			flightFareTypes: JSON.parse(selectorType.data('flight-fare-types'))
		};
		
		getConvenienceChargesFlights();*/
		
		
	});
	
	// Calling Fare Rule --> Fare Quote --> SSR --> Payment --> Booking --> Ticketing
	jQuery(document).on('click', '.flights__footer-continue, .flights__footer-continue.skipSSR', function (e) {
		e.preventDefault();
	
		let $this = jQuery(this);
		let $footerContinue = jQuery('.flights__footer-continue');
		let $footerPrice = jQuery('.flights__footer-price');
		let $flightsSearch = jQuery('.flights__search');
	
		if (checkFlightsSessionStatus()) return;
		if (!validateForm('tboPaxDetails', '', '').validator.response) return;
	
		if ($this.hasClass('skipSSR')) $this.attr('skipSSR', 'true');
	
		let currentStage = $this.attr('current-stage');
	
		let updatePrice = () => {
			if ($footerPrice.attr('seat-price')) {
				let totalBaseFare = Number($footerPrice.attr('total-price')) - Number($footerPrice.attr('seat-price'));
				$footerPrice.attr('total-price', totalBaseFare);
				$footerPrice.find('.price').text(`₹ ${totalBaseFare}`);
				$footerPrice.attr('seat-price', '0');
			}
		};
	
		let callFareQuote = (flight, action) => {
			callFlightsFareQuote(flight, action);
		};
	
		let actions = {
			reviewPaxDetails: () => {
				if (jQuery('#flights__countryCode').val() == '+91' && jQuery('#ticketing__phone').val().length == 10 && !jQuery('#ticketing__phone').val().startsWith('0')) {
					updateFooterContinue('pagePicker', 'editPaxDetails', 'Edit', 'Confirm');
					getTravellerReviewDetails();
				}
				else if (jQuery('#ticketing__phone').val().startsWith('0')) {
					toast('Please remove 0 from the beginning of the phone number');
					return;
				}
				else if (!jQuery('#flights__countryCode').val() == '+91') {
					updateFooterContinue('pagePicker', 'editPaxDetails', 'Edit', 'Confirm');
					getTravellerReviewDetails();
				}
				// Add a check to see if the user has entered a valid email address
				else if (!isValidEmail(jQuery('#ticketing__email').val())) {
					toast('Please enter a valid email address');
					return;
				}
			},
			pagePicker: () => {
				/*updateFooterContinue('selectSeat', 'showFinalAmount', 'Pay Instantly', 'Select Seats');
				$footerContinue.hide();
				renderBottomSheet('', 'seat-pay-selection');
				loadLottieAnimation('payInstant', '/view/assets/img/pay_instantly_anim.json');
				loadLottieAnimation('selectSeats', '/view/assets/img/seat_selection_anim.json');*/
				if (guestMaster()) {
					// redirect('login');
					// return;
					
					jsInit('checkUniqueUser', { phoneNumber: jQuery('#ticketing__phone').val(), email: jQuery('#ticketing__email').val(), dialCode: jQuery('#flights__countryCode').val(), userFullName: jQuery('#adultFirstName0').val() + ' ' + jQuery('#adultLastName0').val(), gender: jQuery('#adult0 .gender-btn.selected').data('gender'), appVersion: getAppVersion() });
					return;
				}
				//return;
				//updateFooterContinue('showFinalAmount', 'editPaxDetails', 'Back', 'Continue');
				showFlightsLoaders('ssr');
				//
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
					jQuery('.bill-details__grand-total').attr('data-total', Number(jQuery('.bill-details__grand-total').attr('data-total')) + getConvFees);
				}
			},
			editPaxDetails: () => {
				showPaxDetailsPage();
				$footerPrice.removeClass('hide');
				updateFooterContinue('reviewPaxDetails', '', '', 'Continue');
				$footerContinue.filter('.ssr').hide();
				showHidePaxReviewSheet('hide');
				jQuery('.flights__SSRPage').parent().remove();
				updatePrice();
			},
			paxDetailsPage: () => {
				showPaxDetailsPage();
				$footerPrice.removeClass('hide');
				updateFooterContinue('reviewPaxDetails', '', '', 'Continue');
				$footerContinue.filter('.ssr').hide();
				showHidePaxReviewSheet('hide');
				//reduceFlightsFinalAmount();
			},
			selectSeat: () => {
				updateFooterContinue('showFinalAmount', 'paxDetailsPage', 'Back', 'Skip');
				showFlightsLoaders('ssr');
				showHidePaxReviewSheet('hide');
				$footerContinue.filter('.ssr').hide();
				jQuery('#bookingForm').submit();
				if (!$flightsSearch.attr('data-international') || $flightsSearch.attr('data-international') == 'false') {
					if (isInternationalFlight()) return;
					callFareQuote(selectedFlightForBooking, 'getFinalAmountOwSSR');
					callMoengageEventsForFlights('TBD_FLIGHTS_PROCEED_TO_SEAT_SELECTION', bookFlightPayload);
				}
				else {
					callFareQuote(selectedFlightForBooking, 'getFinalAmountOw');
					callMoengageEventsForFlights('TBD_FLIGHTS_PROCEED_PAY_WITHOUT_SEAT', selectedFlightForBooking);
				}
			},
			showFinalAmount: () => {
				let adultCount = Number(jQuery('#travelDetails-adults').val());
    			let childCount = Number(jQuery('#travelDetails-children').val());
				if (jQuery('.drawerBody.flights__search').attr('data-return') == 'true') {
					// Count the number of div elements with class 'flights__ssr tabs' and attribute 'data-call-from' set to 'tboSSRIb'
					
					// We have to multiply the no. of tabs in Ob & Ib with the total no. of passengers to get the total number of selectable seats
					let seatTabCountOb = jQuery('div.flights__ssr.tabs[data-call-from="tboSSROb"]').length ? jQuery('div.flights__ssr.tabs[data-call-from="tboSSROb"]').length : 1;
					let seatTabCountIb = jQuery('div.flights__ssr.tabs[data-call-from="tboSSRIb"]').length ? jQuery('div.flights__ssr.tabs[data-call-from="tboSSRIb"]').length : 1;
					let totalSelectableSeatsOb = seatTabCountOb * (adultCount + childCount);
					let totalSelectableSeatsIb = seatTabCountIb * (adultCount + childCount);

					if (bookFlightPayload.isSeatMandatoryOb && seatSelectedOb && seatSelectedOb.length != totalSelectableSeatsOb) {
						toast('Seat selection is mandatory for all passengers for Outbound flight.');
						return;
					}
					if (bookFlightPayload.isSeatMandatoryIb && seatSelectedIb && seatSelectedIb.length != totalSelectableSeatsIb) {
						toast('Seat selection is mandatory for all passengers for Return flight.');
						return;
					}
				} else {
					// We have to multiply the no. of tabs in Ow with the total no. of passengers to get the total number of selectable seats
					
					let seatTabCountOw = jQuery('div.flights__ssr.tabs[data-call-from="tboSSR"]').length ? jQuery('div.flights__ssr.tabs[data-call-from="tboSSR"]').length : 1;
					let totalSelectableSeatsOw = seatTabCountOw * (adultCount + childCount);
				
					
					if (bookFlightPayload.isSeatMandatoryOw && seatSelectedOw && seatSelectedOw.length != totalSelectableSeatsOw) {
						toast('Seat selection is mandatory for all passengers for this flight.');
						return;
					}
				}
				// Open Meal Selection Page
				// call function
				manageSecondary('show', 'mealSelection');
				// If its a domestic round trip, then access tboSSROb and tboSSRIb
				if (jQuery('.flights__search').attr('data-return') == 'true') {
					// Make the Tabs for different flights Meal Selection
					$('.drawerBody.flights__MealPage').append(renderMealTabs());
					function renderMealTabs() {
						let mealTabs = '';
					
						let generateMealTab = (mealDynamic, variableName) => {
							let diffStructSSR = false;
							//mealOrigin, mealDestination;
							mealDynamic.forEach((segment, i) => {
								if (segment[0] && segment[0].Origin && segment[0].Destination) {
									// Your existing code using Origin and Destination
									({ Origin, Destination } = segment[0]);
									
								}
								else {
									if (variableName == 'tboSSROb') {
										mealOrigin = jQuery('#sourceInput').parent().attr('airport-code');
										mealDestination = jQuery('#destinationInput').parent().attr('airport-code');
									}
									else {
										mealOrigin = jQuery('#destinationInput').parent().attr('airport-code');
										mealDestination = jQuery('#sourceInput').parent().attr('airport-code');
									}
								}
								if (segment[0] && segment[0].Origin && segment[0].Destination) {
									let flightInfo = `Flight ${Origin} - ${Destination}`;
									let mealData = JSON.stringify(segment);
									mealTabs += `<div class="flights__ssr meal-tabs" data-index="${i}" data-call-from="${variableName}" data-meal='${mealData}'>${flightInfo}</div>`;
								}
								else {
									diffStructSSR = true;
								}
							});
							if (diffStructSSR) {
								let flightInfo = `Flight ${mealOrigin} - ${mealDestination}`;
								let mealData = JSON.stringify(mealDynamic);
								mealTabs += `<div class="flights__ssr meal-tabs" data-index="0" data-call-from="${variableName}" data-meal='${mealData}'>${flightInfo}</div>`;
							}
						};
						
					
						if (tboSSROb.Response.ResponseStatus == 1 && ((tboSSROb.Response.MealDynamic && tboSSROb.Response.MealDynamic[0].length > 0) || (tboSSROb.Response.Meal && tboSSROb.Response.Meal.length > 0))) {
							generateMealTab(tboSSROb.Response.MealDynamic ? tboSSROb.Response.MealDynamic : tboSSROb.Response.Meal, 'tboSSROb');
						}
						if (tboSSRIb.Response.ResponseStatus == 1 && ((tboSSRIb.Response.MealDynamic && tboSSRIb.Response.MealDynamic[0].length > 0) || (tboSSRIb.Response.Meal && tboSSRIb.Response.Meal.length > 0))) {
							generateMealTab(tboSSRIb.Response.MealDynamic ? tboSSRIb.Response.MealDynamic : tboSSRIb.Response.Meal, 'tboSSRIb');
						}
					
						return `<div class="flights__meal_tabs-container">${mealTabs}</div>`;
					}
					$('.flights__ssr.meal-tabs').first().click();
				}
				else {
					// Filter out the node with the specific properties
					let filteredMealOptions = tboSSR.Response.MealDynamic ? tboSSR.Response.MealDynamic[0].filter(meal => meal.Code !== 'NoMeal') : tboSSR.Response.Meal.filter(meal => meal.Code !== 'NoMeal');
					$('.drawerBody.flights__MealPage').append(renderMealOptions(filteredMealOptions));
				}
				updateFooterContinue('showFinalAmountWithMeal', 'paxDetailsPage', 'Back', 'Skip');
				
				
			},
			showFinalAmountWithMeal: () => {
				
				// checking if meal selection is mandatory
				let adultCount = Number(jQuery('#travelDetails-adults').val());
    			let childCount = Number(jQuery('#travelDetails-children').val());
				if (jQuery('.drawerBody.flights__search').attr('data-return') == 'true') {
					
					// We have to multiply the no. of tabs in Ob & Ib with the total no. of passengers to get the total number of selectable seats
					let mealTabCountOb = jQuery('div.flights__ssr.meal-tabs[data-call-from="tboSSROb"]').length ? jQuery('div.flights__ssr.meal-tabs[data-call-from="tboSSROb"]').length : 1;
					let mealTabCountIb = jQuery('div.flights__ssr.meal-tabs[data-call-from="tboSSRIb"]').length ? jQuery('div.flights__ssr.meal-tabs[data-call-from="tboSSRIb"]').length : 1;
					let totalSelectableMealsOb = mealTabCountOb * (adultCount + childCount);
					let totalSelectableMealsIb = mealTabCountIb * (adultCount + childCount);
					
					
					
					if (bookFlightPayload.isMealMandatoryob && mealSelectedOb && mealSelectedOb.length != totalSelectableMealsOb) {
						toast('Seat selection is mandatory for all passengers for Outbound flight.');
						return;
					}
					if (bookFlightPayload.isMealMandatoryIb && mealSelectedIb && mealSelectedIb.length != totalSelectableMealsIb) {
						toast('Seat selection is mandatory for all passengers for Return flight.');
						return;
					}
				} else {
					// We have to multiply the no. of tabs in Ow with the total no. of passengers to get the total number of selectable seats
					let mealTabCountOw = jQuery('div.flights__ssr.meal-tabs[data-call-from="tboSSR"]').length ? jQuery('div.flights__ssr.meal-tabs[data-call-from="tboSSR"]').length : 1;
					let totalSelectableMealsOw = mealTabCountOw * (adultCount + childCount);
					
					if (bookFlightPayload.isMealMandatoryOw && mealSelectedOw && mealSelectedOw.length != totalSelectableMealsOw) {
						toast('Meal selection is mandatory for all passengers for this flight.');
						return;
					}
				}
				
				
				
				$footerContinue.filter('.ssr').show();
				showFlightsLoaders('calculatePrice');
				removeFlightsSSRPage();
				removeFlightsMealPage();
				$footerPrice.addClass('hide');
				showHidePaxReviewSheet('hide');
				updateFooterContinue('paxDetails', 'paxDetailsPage', 'Back', 'Pay Now');
				setTimeout(renderFlightsFinalPage, 2000);
				jQuery('.bill-details__item.conv__charges').removeClass('hide');
			},
			paxDetails: () => {
				if (guestMaster()) {
					redirect('login');
					return;
				}
				showFlightsLoaders('fareRule');
				jQuery('#bookingForm').submit();
				callFlightApis();
			},
			payment: () => {
				showHidePaxReviewSheet('hide');
				managePayments('openRazorpayWindow', JSON.parse(jQuery('.flights__footer-continue.skipSSR').data('paymentData')));
			}
		};
	
		if (actions[currentStage]) actions[currentStage]();
	});
	
	// Enter User Details and show SSRs
	jQuery(document).on('submit', '#bookingForm', function (e) {
		e.preventDefault();
		
		let skipSSR = jQuery('.flights__footer-continue.skipSSR').attr('skipSSR') ? jQuery('.flights__footer-continue.skipSSR').attr('skipSSR') : 'true';

		// Select and convert the values of each input field
		adultCount = Number(jQuery('#travelDetails-adults').val());
		childCount = Number(jQuery('#travelDetails-children').val());
		infantCount = Number(jQuery('#travelDetails-infants').val());

		adultPassengers = [];
		childPassengers = [];
		infantPassengers = [];

		liveLocationInfo = localStorage.getItem('liveLocationInfo');
		liveLocationInfo = liveLocationInfo
			? JSON.parse(liveLocationInfo)
			: { city: 'N.A', country: 'N.A' };

		getPassengerDetails = (paxType,title,genderCurrentPassenger, genderType, i, isInternational ) => {
			passportNo = '';
			passportExpiry = '';
			passportIssueDate = '';
			passportIssueCountryCode = '';
			
			if (isInternational == true && (jQuery(`#${paxType}passportExpiry${i}`).val())) {
				passportNo = jQuery(`#${paxType}passportNumber${i}`).val();
				passportExpiry =
					jQuery(`#${paxType}passportExpiry${i}`).val() + 'T00:00:00';
				passportIssueDate = jQuery(`#${paxType}passportIssueDate${i}`).val() + 'T00:00:00';
				passportIssueCountryCode = jQuery(`#${paxType}passportIssueCountryCode${i}`).val();
			}
			
			dobDate = jQuery(`#${paxType}dob${i}`).val();
			if (dobDate && dobDate != '') {
				dobDate = dobDate + 'T00:00:00';
			}
			else {
				dobDate = '';
			}

			console.log(genderCurrentPassenger);

			return {
				
				Title: title,FirstName:jQuery(`#${paxType}FirstName${i}`).val(),LastName:jQuery(`#${paxType}LastName${i}`).val(),

				PaxType: paxType === 'adult' ? 1 : paxType === 'child' ? 2 : 3, // 1 for Adult, 2 for Child, 3 for Infant

				DateOfBirth: dobDate,

				Gender: genderType,
				
				AddressLine1: jQuery('#ticketing__address').val(),
				AddressLine2: '',
				City: liveLocationInfo.city ? liveLocationInfo.city : 'Delhi',
				CountryCode: liveLocationInfo.country_code
					? liveLocationInfo.country_code
					: 'IN',
				CountryName: 'India',
				CellCountryCode: jQuery('#flights__countryCode').val(),
				ContactNo: jQuery('#ticketing__phone').val(),
				Nationality: liveLocationInfo.country_code
					? liveLocationInfo.country_code
					: 'IN',
				Email: jQuery('#ticketing__email').val(),

				IsLeadPax: i === 0 && paxType === 'adult',

				// Need to add the following fields for each passenger incase of International Flights
				PassportNo: passportNo,
				PassportExpiry: passportExpiry,
				PassportIssueDate: passportIssueDate,
				PassportIssueCountryCode: passportIssueCountryCode,
				FFAirlineCode: null,
				FFNumber: '',
				GSTCompanyAddress: jQuery('#gstAddress').val() || '',
				GSTCompanyContactNumber: jQuery('#gstContactNumber').val() || '',
				GSTCompanyName: jQuery('#gstCompanyName').val() || '',
				GSTNumber: jQuery('#gstNumber').val() || '',
				GSTCompanyEmail: jQuery('#gstEmail').val() || ''
			};
		};

		processPassengers = (count, type, passengersArray, isInternational) => {
			for (let i = 0; i < count; i++) {
				titleElement = document.getElementById(`${type}Title${i}`);
				//title = titleElement.options[titleElement.selectedIndex].value;
				//title = 'Mr';

				// genderType = (type == 'infant' || type == 'child') ?
				// (titleElement.selectedIndex < 1 ? 1 : 2) : (titleElement.selectedIndex <= 1 ? 1 : 2);

				genderCurrentPassenger = document.getElementById(`${type}${i}`);
				// Find the button with the `selected` class within this element
				var selectedButton = genderCurrentPassenger.querySelector('.gender-btn.selected');

				// Get the `data-gender` attribute of the selected button
				var selectedGender = selectedButton ? selectedButton.getAttribute('data-gender') : null;
				
				var paxType = selectedButton.getAttribute('pax-type') === 'adult' ? 1 : type === 'child' ? 2 : 3;
				
				// Prepare the title based on the gender and passenger type
				var title;
				if (selectedGender === 'male') {
					title = (paxType === 1 || paxType === 2) ? 'Mr' : 'Mstr';
				}
				else if (selectedGender === 'female') {
					title = 'Mrs';
				}

				console.log(selectedGender); // Output the selected gender
				console.log(title); // Output the title

				console.log(selectedGender); // Output the selected gender

				genderType = selectedGender == 'male' ? 1 : 2;

				passengersArray.push(
					getPassengerDetails(
						type,
						title,
						genderCurrentPassenger,
						genderType,
						i,
						isInternational
					)
				);
			}
		};
		isInternational =
			jQuery('.flights__search').attr('international-flight') == 'true';

		processPassengers(
			adultCount,
			'adult',
			adultPassengers,
			isInternational
		);
		if (childCount > 0)
			processPassengers(
				childCount,
				'child',
				childPassengers,
				isInternational
			);
		if (infantCount > 0)
			processPassengers(
				infantCount,
				'infant',
				infantPassengers,
				isInternational
			);

		if (jQuery('.flights__search').attr('data-return') == 'true') {
			let adultBookOb = adultPassengers;
			let adultBookIb = adultPassengers;
			
			let childBookOb = childPassengers.length > 0 ? childPassengers : [];
			let childBookIb = childPassengers.length > 0 ? childPassengers : [];
		
			let infantBookOb = infantPassengers.length > 0 ? infantPassengers : [];
			let infantBookIb = infantPassengers.length > 0 ? infantPassengers : [];
			
			let resultIndexOb = jQuery('.flights__search').attr('data-ob-result-index');
			let resultIndexIb = jQuery('.flights__search').attr('data-ib-result-index');
			
			let isLCCOb = jQuery('.flights__search').attr('data-ob-is-lcc') == 'true';
			let isLCCIb = jQuery('.flights__search').attr('data-ib-is-lcc') == 'true';

			bookFlightPayload = {
				TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
				ResultIndex: [
					{ resultIndexOb: resultIndexOb },
					{ resultIndexIb: resultIndexIb }
				], // This will change
				Passengers: {
					ob: [...adultBookOb, ...childBookOb, ...infantBookOb],
					ib: [...adultBookIb, ...childBookIb, ...infantBookIb]
				},
				return: 'true',
				isLCC: [{ isLCCOb: isLCCOb }, { isLCCIb: isLCCIb }]
			};
			
			
			let selectedFlightForBookingOb = {
				TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
				ResultIndex: jQuery('.flights__search').attr('data-ob-result-index'), // This will change
				seatSelected: seatSelectedOb,
				mealSelected: mealSelectedOb,
			}
			
			let selectedFlightForBookingIb = {
				
				TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
				ResultIndex: jQuery('.flights__search').attr('data-ib-result-index'), // This will change
				seatSelected: seatSelectedIb,
				mealSelected: mealSelectedIb,
			}

			selectedFlightForBookingRound = {
				passengers: { ob: bookFlightPayload.Passengers.ob, ib: bookFlightPayload.Passengers.ib },
				selectedFlightForBookingOb: selectedFlightForBookingOb,
				selectedFlightForBookingIb: selectedFlightForBookingIb,
				isBeforeBooking: true,
				isReturn: true,
				couponCode: jQuery('.flight__coupons-input input').val()
			};
			
			/*if (skipSSR == 'true' || jQuery('.flights__search').attr('data-international') == 'true') {
				callMoengageEventsForFlights('TBD_FLIGHTS_PROCEED_PAY_WITHOUT_SEAT', selectedFlightForBookingRound);
				callFlightsFareQuote(selectedFlightForBookingRound, 'getFinalAmountRound');
				return;
			}*/
		}
		else {
			let resultIndexOw = jQuery('.flights__search').attr('data-result-index');
			let isLCC = jQuery('.flights__search').attr('data-lcc') == 'true';

			let adultBookOw = adultPassengers;

			let childBookOw =
				childPassengers.length > 0
					? childPassengers
					: [];

			let infantBookOw =
				infantPassengers.length > 0
					? infantPassengers
					: [];

			bookFlightPayload = {
				TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
				ResultIndex: [{ resultIndexOw: resultIndexOw }], // This will change
				Passengers: {
					ow: [...adultBookOw, ...childBookOw, ...infantBookOw]
				},
				return: 'false',
				isLCC: isLCC
			};
			
			let selectedFlightForBookingOw = {
				TraceId: jQuery('.flights__search').attr('data-trace-id'), // Common for all flights
				ResultIndex: jQuery('.flights__search').attr('data-result-index'), // This will change
				seatSelected: seatSelectedOw,
				mealSelected: mealSelectedOw,
			}

			selectedFlightForBooking = {
				passengers: bookFlightPayload.Passengers.ow,
				selectedFlightForBookingOw: selectedFlightForBookingOw,
				isBeforeBooking: true,
				isReturn: false,
				couponCode: jQuery('.flight__coupons-input input').val()
			};

			/*if (skipSSR == 'true' || jQuery('.flights__search').attr('data-international') == 'true') {
				callMoengageEventsForFlights('TBD_FLIGHTS_PROCEED_PAY_WITHOUT_SEAT', selectedFlightForBooking);
				callFlightsFareQuote(selectedFlightForBooking, 'getFinalAmountOw');
				return;
			}*/
		}
		// Update the current stage so that now the user can proceed to the next stage and call razorpay and book apis
		//jQuery('.flights__footer-continue').attr('current-stage', 'payment');
		
	});

	jQuery(document).on('change', '#flight__head-date', function () {
		depDate =  jQuery('#flight__head-date').val() + 'T00:00:00';
		searchFlightPayload.PreferredDepartureTime = depDate;
        searchFlightPayload.PreferredArrivalTime = depDate;
		searchFlights('dateChange');
	});

	jQuery(document).on('click', '.flights-filter', function () {
		flightsSearchResponse = flightsSearchResults.Response.Results;
		
		if (jQuery('.flight__tabs').length > 0) {
			let selectedTab = Number(jQuery('.flight__tabs .flight__tab.active').attr('data-tab'));
			renderFlightsFilter(flightsSearchResponse[selectedTab]);
		}
		else {
			renderFlightsFilter(flightsSearchResponse[0]);
		}
	});

	jQuery(document).on(
		'click',
		'.flight-booking-details__view-details-button',
		function () {
			bookFlightFareDetails = JSON.parse(
				jQuery(this).data('data-flight-all')
			);
			if (jQuery('.flights__search').attr('data-return') == 'true') {
				renderViewFlight(bookFlightFareDetails, 'round');
			} else {
				renderViewFlight(bookFlightFareDetails, 'ow-intl');
			}
		}
	);

	/*jQuery(document).on('click', '.flight-details__price-summary', function () {
		alert('Handle back click');
	});*/

	jQuery(document).on(
		'click',
		'.flight-booking-details__section.cancellation',
		function () {
			// Open Cancel Policy
			cancellationData = jQuery(this).data('cancellation-data');
			console.log(cancellationData);

			manageSecondary('show', 'cancelPolicy', cancellationData);
		}
	);

	jQuery(document).on('click', '.flight__coupons-view, .flight__coupons-header', function (e) {
		// Open Coupons
		e.preventDefault();
		jsInit('getCoupons', { couponFor: 'flight' }, 'renderFlightCouponCodesList');
		
	});

	jQuery(document).on('click', '.flight__coupon-close', function (e) {
		// Close Coupons
		e.preventDefault();
		drawer('close');
	});
	
	// Change Seat, Meal, Baggage
	jQuery(document).on('click', '.flight__tab.ssr-selection', function () {
		
		jQuery('.flight__tab.ssr-selection').removeClass('active');
		jQuery(this).toggleClass('active');
		
		clickedValue = jQuery(this).attr('data-tab');
		switch (clickedValue) {
			case '0':
				console.log('Seat Selection');
				break;
			case '1':
				console.log('Meal Selection');
				break;
			case '2':
				console.log('Baggage Selection');
				break;
		}
		
		
		
	});
	
	// Filter Elements Clicks

	jQuery(document).on('click', '.flights-filter__primary', function () {
		// Get all checked input tags and their values
        let checkedAirlines = [];
        jQuery('.flights-filter__airline-options input[type="checkbox"]:checked').each(function() {
            checkedAirlines.push(jQuery(this).attr('val'));
        });

        // Get all active stops
        let activeStops = [];
        jQuery('.flights-filter__button.active').each(function() {
            activeStops.push(jQuery(this).attr('stop'));
        });

		let isDepartureFilter = jQuery('.flights-filter__selection-button.active').attr('journey-type') == 'dep' ? true: false;

        // Get all active times
        let activeTimes = [];
        jQuery('.flights-filter__time-slot.active').each(function() {
            activeTimes.push(jQuery(this).attr('time'));
        });

        // Create the payload
        flightsFilterPayload = {
			stops: activeStops,
			journeyType: jQuery('.flights-filter__selection-button.active').attr('journey-type'),
            times: activeTimes,
            airlines: checkedAirlines
        };
		console.log('Flights Filter Payload', flightsFilterPayload);
		
		// Select all flight cards
		
		jQuery('.flight__card').each(function () {
			jQuery(this).show();
		});
		
		jQuery('.flight__card').each(function () {
			var layoverText = jQuery(this).find('.flight__details__time.layover').text().trim();
			var airlineCode = jQuery(this).find('.aircode').attr('airline-code');
			var card = jQuery(this); // Store reference to the current flight card
			var dayOfTravel = isDepartureFilter ? jQuery(this).find('.flight__details__dep-time').attr('day_of_travel') : jQuery(this).find('.flight__details__arr-time').attr('day_of_travel');
		
			// Check stops
			var hideCard = activeStops.length > 0 && !activeStops.some(function (stop) {
				switch (stop) {
					case '0':
						return layoverText === 'Direct';
					case '1':
						return !layoverText.includes('multiple') && layoverText !== 'Direct';
					case '2':
						return layoverText.includes('multiple');
					default:
						return false;
				}
			});
		
			// Check airlines
			if (!hideCard && checkedAirlines.length > 0) {
				hideCard = !checkedAirlines.includes(airlineCode);
			}
		
			// Check times
			if (!hideCard && activeTimes.length > 0) {
				hideCard = !activeTimes.includes(dayOfTravel);
			}
		
			// Hide or show the card based on the conditions
			card.toggle(!hideCard);
		});
			
		jQuery(this).parents('.secondary__tab').find('.drawer__back svg').click();
		
		jQuery('.flights-filter').attr('data-filter-applied', 'true');
		
		jQuery('.flights-count').text('Showing ' + jQuery('.flight__card:visible').length + ' Flights');
	});
	
	jQuery(document).on('click', '.flights-filter__reset', function () {
		console.log('Reset Filter Clicked');
		
		// Empty the flightsFilterPayload
		flightsFilterPayload = {};
		console.log('Flights Filter Payload', flightsFilterPayload);
		
		// Remove all active classes
        jQuery('.flights-filter__button').removeClass('active');
        jQuery('.flights-filter__selection-button').removeClass('active');
        jQuery('.flights-filter__time-slot').removeClass('active');
        
        // Uncheck all checkboxes
		jQuery('.flights-filter__airline-options input[type="checkbox"]').prop('checked', false);
		
		jQuery('.flight__card').each(function () {
			jQuery(this).show();
		});
		
		jQuery(this).parents('.secondary__tab').find('.drawer__back svg').click();
		jQuery('.flights-filter').attr('data-filter-applied', 'false');
		jQuery('.flights-count').text('Showing ' + jQuery('.flight__card').length + ' Flights');
		
	});
	
	
	// Handle back Buttons for Flights page
	
	// 1 ) Flights Booking page back
	jQuery(document).on('click', '.flightsBookingBack', function (e) {
		console.log('flightsBookingBack');
		webAnalytics('flightsBookingBack');
		
		/*if (!guestMaster()) {
			var getUserDetails = manageUserProfile('read', 'all');
			if (getUserDetails && getUserDetails.phoneNumber && getUserDetails.dialCode && getUserDetails.phoneNumber.length > 0 && getUserDetails.dialCode.length > 0) {
				jsInit('whatsAppNewQuickReplies', { phoneNumber: getUserDetails.phoneNumber, dialCode: getUserDetails.dialCode, templateName: 'flight_search', imgUrl: 'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Interakt%2FInterakt_Flight.png?alt=media&token=8b0c18c9-f8ca-417b-aa93-cd4920a000bd', userFullName: getUserDetails.name });
				
			}
		}*/
		
		jQuery('#flights__footer').remove();
		
		if (jQuery('.flights__search').attr('data-return') == 'true') {
			jQuery('.flight__tab.onward').click();
			jQuery('.flights__search').removeAttr('data-ob-result-index')
				.removeAttr('data-ob-is-lcc')
				.removeAttr('data-ib-result-index')
				.removeAttr('data-ib-is-lcc')
				.removeAttr('data-ib-result-index')
				.removeAttr('data-ib-is-lcc')
				.removeAttr('data-return');
		}
		showHidePaxReviewSheet('hide');		
		// Reset Variables
		resetValuesAfterFlightBooking();
		
		// Show PopUp
		if (manageUserProfile('read', 'isVerified') != true) {
			//renderBottomSheet('', 'premium__init');
			createAndShowPopup('https://prodmedia.beatravelbuddy.com/uploads/display_picture/flight-coupon.webp', 'flight-search-back');
		}
		jQuery(this).removeClass('flightsBookingBack');
	});
	
	// Flights Coupon Apply
    jQuery(document).on('click', '.flights__apply-coupon', function (e) {
		e.preventDefault();
		if (guestMaster()) {
			toast('Please login to apply coupon code');
			redirect('login');
			return;
		}
		let couponCode = jQuery('.flight__coupons-input input').val().trim();
		
		if (!isAndroid && !isIOS && couponCode === 'APPFLY') {
			toast('This coupon is only valid on the App. Please download the app to avail the offer.');
			return;
		}
		
		if (couponCode === '') {
			toast('Please enter a valid coupon code');
			return;
		}
		if (jQuery(this).hasClass('applied')) {
			jQuery('.flight__coupons-input input').val('');
			jQuery('.bill-details__item.promo_code').hide();
			jQuery('.bill-details__saved-tag').hide();
			jQuery('.bill-details__item.promo_code .flight__total_fare-title').text('Offer Discount');
			
			if (jQuery(this).hasClass('addedConv')) {
				// This removes the Coupon code and the discount from the total amount only when we the Convience fees are Added
				let finalAmount = Number(jQuery('.flights__footer-price').attr('base_fare'));
	
				jQuery('.flights__final-amount').text(`₹ ${finalAmount}`);
				jQuery('.flights__final-amount').attr('data-final-amount', finalAmount);
				jQuery('.flights__apply-coupon').removeClass('addedConv');
			}
			else {
				// This removes the Coupon code and the discount from the total amount only when we the Convience fees are not added
				let grandTotal = jQuery('.bill-details__grand-total').attr('data-total');
				
				jQuery('.flights__final-amount')
					.text(`₹${grandTotal}`)
					.attr('data-final-amount', grandTotal);
				
				jQuery('.flights__footer-price')
					.attr('total-price', grandTotal)
					.find('.price')
					.text(`₹${grandTotal}`);
			}
			jQuery('.flights__apply-coupon').removeClass('applied').text('APPLY');
			return;
		}
		
		jsInit('validateCoupon', {
			'couponCode': couponCode,
			'couponFor': 'flight',
			'noOfTickets': 1,
			'cartValue': jQuery('.bill-details__handling-charges').attr('conv-charges')
		}, 'couponValidationFlights');
    });

	jQuery(document).on('click', '.flightsViewBack', function () {
        jQuery('.flights__footer-continue.skipSSR').show();
    });

    // Flights Coupon Selection
    // Attach the function to the radio button change event
    jQuery(document).on('change', 'input[name="flightsCoupon"]', function () {
        updateCouponCode();
	});
	
	jQuery(document).on('click', '#sourceInput, #destinationInput', function () {
		jQuery(this).val('');
	});
	
	jQuery(document).on('click', '.flight-options__card', function () {
		
		let clickedCard = jQuery(this);
		let getOptionType = clickedCard.attr('option-type');
		jQuery('.flight-options__card').removeClass('active');
		clickedCard.addClass('active');
		
		jQuery('.flights__search__results-container').animate({ scrollTop: 0 }, 1500);
		
		switch (getOptionType) {
			case 'flightsCheapest':
				console.log('Cheapest Flights');
				jQuery('#low__high-price-flight').click();
				break;
			case 'flightsNonStop':
				console.log('Non Stop Flights');
				jQuery('#short__long-flight').click();
				break;
			case 'flightsPrefer':
				console.log('Prefer Flights');
				jQuery('#direct__lowest-fare-flight').click();
				break;
		}
	});
	
	// Flight Booking Details
	jQuery(document).on('click', '.booked__tickets__ticket', function () {
		let ticketData = jQuery(this).data('ticketData');
		console.log(ticketData);
		//renderViewFlight(ticketData, 'getBookingDetails', ticketData);
	});
	
	// Expand collapse flight details
	jQuery(document).on('click', '.flight-booking__card', function () {
		let card = jQuery(this);
		let toggle = card.find('.flight-booking__toggle');
		let details = card.find('.flight-booking__details');
		
		card.toggleClass('expanded');
		toggle.toggleClass('expanded');
		
	
		// Toggle details visibility with animation
		if (card.hasClass('expanded')) {
			details.css('display', 'block');
			setTimeout(() => {
				details.css({
					'max-height': details.prop('scrollHeight') + 'px',
					'padding': '8px' // Adjust padding as needed
				});
			}, 10); // Small delay to ensure the display change is applied
		} else {
			details.css({
				'max-height': '0',
				'padding': '0 8px' // Adjust padding as needed
			});
			setTimeout(() => {
				details.css('display', 'none');
			}, 500); // Match the duration of the CSS transition
		}
	});
	
	jQuery(document).on('click', '.email__icon', function () {
		let clickedIcon = jQuery(this);
		
		jsInit('sendFlightDetails', { pnr: clickedIcon.attr('data-pnr') });
		clickedIcon.hide();
		
	});
	
	jQuery(document).on('change', '#gstCheckbox', function () {
        if (this.checked) {
			showGstInputsPreFilled();
			jQuery('.gst__checkbox').addClass('checked');
			
		}
		else {
            // Hide the GST input fields
            jQuery('#gstContainer').slideUp(function() {
                jQuery(this).empty();
			});
			jQuery('.gst__checkbox').removeClass('checked');
        }
	});
	
	jQuery(document).on('input', '#promoCodeInput', function () {
		let applyCouponButton = jQuery('#applyCouponButton');
		applyCouponButton.removeClass('applied');
		applyCouponButton.text('APPLY');
	});
	
	jQuery(document).on('click', '.custom_calendar_price__ctas', function () {
		jQuery('#custom_calendar_price__container').remove();
	});
	
	// Close the calendar on click outside
	jQuery(document).on('click', '#custom_calendar_price__container', function (event) {
		let calendar = jQuery('.custom_calendar_price__container');
        if (!calendar.is(event.target) && calendar.has(event.target).length === 0) {
            jQuery('#custom_calendar_price__container').remove();
        }
	});
	
	// Close the Bottom sheet on clicking outside
	/*jQuery(document).on('click', function (event) {
		let travellerDetailsReview = jQuery('.traveller-details-review__container'); 
		if (!travellerDetailsReview.is(event.target) && travellerDetailsReview.has(event.target).length === 0 && travellerDetailsReview.length > 0) {
			showHidePaxReviewSheet('hide');
		}
	});*/
	
	// Cross Sign for Premium Popup
	
	jQuery(document).on('click', '.close-button', function () {
		showHidePaxReviewSheet('hide');
		var currentUrl = window.location.href;
		if (jQuery(this).hasClass('loginNew') && !currentUrl.includes('flights')) {
			
			if (isAndroid() || isIOS() || isPwa()) {
				removeActiveClassFromMain();
				jQuery('#footer ul li').removeClass('active');
				jQuery('#footer ul li:nth-child(1)').click();
				window.history.pushState({ page: "flights" }, "flights", "/home");
				
			}
			// else {
			// 	jQuery('.desktopMenu-experiencesApp').click();
			// 	jQuery('.experiencesToggle input[type="radio"][value="1"]').click();
			// 	window.history.pushState({ page: "flights" }, "flights", "/flights");
			// 	jQuery('.experiences__body-tab[data-tab="trips"]').click();
			// }
		}
		if (!isMobile()) {
			jQuery('#desktopContainer').css('display', 'block');
		}
	});
	
	jQuery(document).on('click', '.custom_calendar_price__day', function () {
		let $this = jQuery(this);
		let $calendarContainer = jQuery('#custom_calendar_price__container');
		let $depDate = jQuery('#depDate');
		let $returnDate = jQuery('#returnDate');
		let $dateTextDep = jQuery('.date__text-dep');
		let $dateTextReturn = jQuery('.date__text-return');
	
		jQuery('.custom_calendar_price__day').removeClass('selected');
		$this.toggleClass('selected');
	
		let selectedDate = $this.attr('data-date');
		let depDateVal = $depDate.val();
		let returnDateVal = $returnDate.val();
	
		// Parse dates
		let selectedDateObj = new Date(selectedDate);
		let depDateObj = new Date(depDateVal);
		let returnDateObj = new Date(returnDateVal);
	
		// Check if selectedDate is less than depDate
		if ($calendarContainer.attr('sel-date-type') !== 'depDate' && selectedDateObj < depDateObj) {
			toast('Returning date cannot be earlier than departure date.');
			$this.removeClass('selected');
			return;
		}
	
		// Check if depDate is greater than returnDate
		if ($calendarContainer.attr('sel-date-type') === 'depDate' && returnDateVal && selectedDateObj > returnDateObj) {
			toast('Departure date cannot be later than returning date.');
			$this.removeClass('selected');
			return;
		}
	
		if ($calendarContainer.attr('sel-date-type') === 'depDate') {
			$dateTextDep.text(formatDateWithSuffix(selectedDate));
			$depDate.val(selectedDate.split('T')[0]); // Update depDate value without time
		} else {
			jQuery('.booking-option.flightsSearch label:nth-child(2) input').click();
			$dateTextReturn.text(formatDateWithSuffix(selectedDate));
			$returnDate.val(selectedDate.split('T')[0]); // Update returnDate value without time
			jQuery('.returning__cross_sign').remove();
			$('.location__selection.returningDate').append(
				'<div class="returning__cross_sign">X</div>'
			);
			jQuery('.date__text-return').removeClass('adjust__font-size');
		}
		
		if ($calendarContainer.attr('sel-date-type') === '#check-in' || $calendarContainer.attr('sel-date-type') === '#check-out') {
			$dateTextDep = jQuery('.check__in-text');
			$depDate = jQuery('#check-in');
			$dateTextReturn = jQuery('.check__out-text');
			$returnDate = jQuery('#check-out');
			
			// Check if Check out is less than Check in
			if ($depDate.val() && $returnDate.val()) {
				let checkInDate = new Date($depDate.val());
				let checkOutDate = new Date($returnDate.val());
				if (checkOutDate < checkInDate) {
					toast('Check-out date cannot be earlier than Check-in date.');
					$this.removeClass('selected');
					return;
				}
			}
			// Check if check in is greater than check out
			if ($depDate.val() && $returnDate.val()) {
				let checkInDate = new Date($depDate.val());
				let checkOutDate = new Date($returnDate.val());
				if (checkOutDate < checkInDate) {
					toast('Check-out date cannot be earlier than Check-in date.');
					$this.removeClass('selected');
					return;
				}
			}
			
			if ($calendarContainer.attr('sel-date-type') === '#check-out') {
				
				$dateTextReturn.text(formatDateWithSuffix(selectedDate));
				
				$returnDate.val(selectedDate.split('T')[0]); // Update returnDate value without time
				
			}
			else {
				
				$dateTextDep.text(formatDateWithSuffix(selectedDate));
				
				$depDate.val(selectedDate.split('T')[0]); // Update depDate value without time
			}
		}
		
		setTimeout(() => {
			$calendarContainer.remove();
		}, 200);
	});
	/*jQuery(document).on('click', '.custom_calendar_price__day', function () {
		let $this = jQuery(this);
		let $calendarContainer = jQuery('#custom_calendar_price__container');
		let $depDate = jQuery('#depDate');
		let $returnDate = jQuery('#returnDate');
		let $dateTextDep = jQuery('.date__text-dep');
		let $dateTextReturn = jQuery('.date__text-return');
	
		jQuery('.custom_calendar_price__day').removeClass('selected');
		$this.toggleClass('selected');
	
		let selectedDate = $this.attr('data-date');
		let depDateVal = $depDate.val();
		let returnDateVal = $returnDate.val();
	
		let selectedDateObj = new Date(selectedDate);
		let depDateObj = new Date(depDateVal);
		let returnDateObj = new Date(returnDateVal);
	
		function showToastAndDeselect(message) {
			toast(message);
			$this.removeClass('selected');
		}
	
		function updateDateTextAndValue($dateText, $dateInput, date) {
			$dateText.text(formatDateWithSuffix(date));
			$dateInput.val(date.split('T')[0]);
		}
	
		if ($calendarContainer.attr('sel-date-type') !== 'depDate' && selectedDateObj < depDateObj) {
			showToastAndDeselect('Returning date cannot be earlier than departure date.');
			return;
		}
	
		if ($calendarContainer.attr('sel-date-type') === 'depDate' && returnDateVal && selectedDateObj > returnDateObj) {
			showToastAndDeselect('Departure date cannot be later than returning date.');
			return;
		}
	
		if ($calendarContainer.attr('sel-date-type') === 'depDate') {
			updateDateTextAndValue($dateTextDep, $depDate, selectedDate);
		}
		else {
			jQuery('.booking-option.flightsSearch label:nth-child(2) input').click();
			updateDateTextAndValue($dateTextReturn, $returnDate, selectedDate);
			jQuery('.returning__cross_sign').remove();
			jQuery('.location__selection.returningDate').append('<div class="returning__cross_sign">X</div>');
			jQuery('.date__text-return').removeClass('adjust__font-size');
		}
	
		if ($calendarContainer.attr('sel-date-type') === '#check-in' || $calendarContainer.attr('sel-date-type') === '#check-out') {
			$dateTextDep = jQuery('.check__in-text');
			$depDate = jQuery('#check-in');
			$dateTextReturn = jQuery('.check__out-text');
			$returnDate = jQuery('#check-out');
	
			let checkInDate = new Date($depDate.val());
			let checkOutDate = new Date($returnDate.val());
	
			if ($depDate.val() && $returnDate.val() && checkOutDate < checkInDate) {
				showToastAndDeselect('Check-out date cannot be earlier than Check-in date.');
				return;
			}
	
			if ($calendarContainer.attr('sel-date-type') === '#check-out') {
				updateDateTextAndValue($dateTextReturn, $returnDate, selectedDate);
			} else {
				updateDateTextAndValue($dateTextDep, $depDate, selectedDate);
			}
		}
	
		setTimeout(() => {
			$calendarContainer.remove();
		}, 200);
	});*/
	
	// Prevent click event propagation from label to parent div
	jQuery(document).on('click', '.location__label', function (event) {
		event.stopPropagation();
	});
	
	jQuery(document).on('click', '#departDate, #returningDate', function () {
		
		// Example usage
		let selectorType = jQuery(this).hasClass('departDate') ? 'depDate' : 'returningDate';
		flightsCalendarPicker(selectorType);
		callFlightCalendarFare('init', selectorType);
	});

	// This is handling the back button click on the SSR page
	jQuery(document).on('click', '.flightsSSRBack', function () {
		updateFooterContinue('reviewPaxDetails', '', '', 'Continue');
		jQuery('.flights__footer-continue.ssr').hide();
	});
	
	// Pay Instantly
	jQuery(document).on('click', '.page__picker-left', function () {
		
		// Showing Conv Fees in seperate page
		
		/*jQuery('.flights__footer-continue.ssr').show();
		showFlightsLoaders('calculatePrice');
		removeFlightsSSRPage();
		jQuery('.flights__footer-price').addClass('hide');
		showHidePaxReviewSheet('hide');
		updateFooterContinue('paxDetails', 'paxDetailsPage', 'Back', 'Pay Now');
		setTimeout(() => {
			renderFlightsFinalPage();
		}, 2000);
		jQuery('.flights__footer-continue').show();*/
		
		// Directly Open Razorpay
		if (guestMaster()) {
			redirect('login');
			return;
		}
		jQuery('.flights__footer-continue.skipSSR').show();
		showFlightsLoaders('fareRule');
		jQuery('#bookingForm').submit();
		callFlightApis();
	});
	
	// Select Seats
	jQuery(document).on('click', '.page__picker-right', function () {
		if (guestMaster()) {
            redirect('login');
            return;
		}
		//updateFooterContinue('showFinalAmount', 'editPaxDetails', 'Back', 'Continue');
		showFlightsLoaders('ssr');
		//
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
	});
	
	jQuery(document).on('click', '.page__picker-container .no__conv-pop', function () {
		showHidePaxReviewSheet('hide');
		navigator.clipboard.writeText('IND500');	
		toast('Coupon code copied. Apply & Save 500 INR on your next flight booking.');
	});
	
	jQuery(document).on('click', '.before-login-pop', function () {
		showHidePaxReviewSheet('hide');
		redirect('login');
	});
	
	
	jQuery(document).on('click', '.page__picker-container .app__install-pop', function () {
		webAnalytics('app_install');
		fbEvent('app_install');
		window.open('https://beatravelbuddy.com/detect', '_blank');
	});
	
	// Cheapeast Flight Card
	jQuery(document).on('click', '.cheap__flights-card', function (e) {
		e.preventDefault();
		
		let cheapFlightDetails = JSON.parse(jQuery(this).data('cheapFlightDetails'));
		
		let sourceCode = cheapFlightDetails.lowestFareDetails.departureAirport ? cheapFlightDetails.lowestFareDetails.departureAirport : 'DEL';
		let destinationCode = cheapFlightDetails.lowestFareDetails.arrivalAirport ? cheapFlightDetails.lowestFareDetails.arrivalAirport : 'BOM';
		
		// Get the current date
		let currentDate = new Date();

		// Add 15 days to the current date
		let futureDate = new Date(currentDate);
		futureDate.setDate(currentDate.getDate() + 15);

		// Convert the future date to ISO format
		let isoFutureDate = futureDate.toISOString().split('T')[0] + 'T00:00:00';
		
		let segments = [
			{
				Origin: sourceCode ,
				Destination: destinationCode,
				FlightCabinClass: '2',
				PreferredDepartureTime: isoFutureDate,
				PreferredArrivalTime: isoFutureDate
			}
		];
		let cheapestFlightsPayload = {
			AdultCount: 1,
			ChildCount: 0,
			InfantCount: 0,
			DirectFlight: false,
			OneStopFlight: false,
			isInternational: (cheapFlightDetails.lowestFareDetails
				.departureCountry != 'India' || cheapFlightDetails.lowestFareDetails.destinationCountry != 'India'),
			JourneyType: '1',
			Segments: segments,
			ResultFareType: 2
		};
		
		// Click Action 
		callMoengageEventsForFlights('searchFlight', cheapestFlightsPayload);
		manageSecondary('show', 'flights');
		showFlightsLoaders('search');
		jsInit('tboSearchFlights', cheapestFlightsPayload, {
			source: sourceCode,
			destination: destinationCode,
			depDate: isoFutureDate,
			returnDate: '',
			cabinClass: 'Economy',
			totalPax: '1 Travellers',
			sourceCountry: cheapFlightDetails.lowestFareDetails
			.departureCountry ? cheapFlightDetails.lowestFareDetails
			.departureCountry : 'India',
			destinationCountry: cheapFlightDetails.lowestFareDetails
			.destinationCountry ? cheapFlightDetails.lowestFareDetails
			.destinationCountry : 'India',
			searchFrom: ''
		});
	});
	
	jQuery(document).on('click', '.traveller-details-review__overlay', function () {
		if (jQuery('.close-button').length > 0 && jQuery('.close-button').hasClass('loginNew')) {
			jQuery('.close-button').click();
			return;
		}
		showHidePaxReviewSheet('hide');
	});
	
	
	jQuery(document).on('click', '.flightsDiscount__header-container.membership', function () {
		destroyAllSecondaryTabs();
		redirect('premium');
	});
	
	jQuery(document).on('click', '.flightsDiscount__header-container-add-post', function () {
		destroyAllSecondaryTabs();
		// Open the Premium Tab
		jQuery('.menu__feed.premium_lightModeIcon').click();
		//jQuery('.menu__feed.openExperiences svg, .desktopMenu-experiencesApp').click();
	});
	
	// Cancel Ticket
	jQuery(document).on('click', '.flight-booking__cancel', function () {
		let card = jQuery(this).parents('.flight-booking__card');
		console.log(card.data('ticketData'));
		let ticketData = card.data('ticketData');
		ticketData.source = jQuery(this).attr('source');
		ticketData.destination = jQuery(this).attr('destination');
		renderBottomSheet(ticketData, 'cancelTicket');
	});
	
	jQuery(document).on('click', '.cancel__ticket__ob, .cancel__ticket__ib', function () {
		let clickedButton = jQuery(this);
		let bookingId = Number(clickedButton.attr('data-bookingid'));
		showFlightsLoaders('getCancellationCharges');
		jsInit('getCancellationCharges', { RequestType: '1', BookingId: bookingId }, { ticketIds: clickedButton.attr('ticket-ids'), bookingId: bookingId, paymentId: clickedButton.attr('pay-id'), tboFlightBookingId: clickedButton.attr('flight-book-id'), airlineSource: clickedButton.attr('air-source') });
	});
	
	jQuery(document).on('click', '#cancelTicket', function () {
		let cancellationCharges = JSON.parse($('#cancelTicket').attr('cancel-payload'));
		console.log(cancellationCharges);
		jsInit('sendChangeRequest',
		{
			'BookingId': cancellationCharges.bookingId,
			'RequestType': '1',
			'CancellationType': '0',
			'paymentId': cancellationCharges.paymentId,
			'tboFlightBookingId': cancellationCharges.tboFlightBookingId,
			'airlineSource': cancellationCharges.airlineSource,
			'Remarks': 'Testing Cancel Api Flights - from Local'
		});
		showFlightsLoaders('cancelTicket');
	});
	
	jQuery(document).on('click', '#stopCancelTicket', function () {
		showHidePaxReviewSheet('hide');
	});
	
	jQuery(document).on('click', '#close-btn-price', function () {
		// For Showing only the continue button in the footer so that user can restart with the booking
		updateFooterContinue('payment', 'reviewPaxDetails', 'Edit', 'Pay');
	});
	
	jQuery(document).on('click', '.drawerBody.flights__search .drawerHeader .drawer__back svg', function () {
		history.pushState(null, '', '/flights');
		jQuery('#floating-enquiry-btn').show();
	});
	
	jQuery(document).on('click', '.show-more-fare-inclusions', function (e) {
		e.preventDefault();
		e.stopPropagation(); // Prevent the click event from bubbling up to the parent element
		
		// Find the closest parent with the class 'flight__fare_inclusions-list' and toggle the hidden fare inclusions within it
		let fareInclusionsList = jQuery(this).closest('.flight__fare_inclusions-list');
		fareInclusionsList.find('.fare__incl-item.show').toggleClass('hide');
		
		// Toggle the text while keeping the icon intact
		let currentText = jQuery(this).text().trim();
		let newText = currentText === 'Show More' ? 'Show Less' : 'Show More';
		jQuery(this).html(newText);
	});
	
	// Tab Selection for Meal Selection
	jQuery(document).on('click', '.flights__ssr.meal-tabs', function () {
		jQuery('.meal-tabs').removeClass('active');
		jQuery(this).addClass('active');
		
		let mealData = JSON.parse(jQuery(this).attr('data-meal'));
		jQuery('#website__flight-meal-options').remove();
		let filteredMealOptions = mealData.filter(meal => meal.Code !== 'NoMeal');
		$('.drawerBody.flights__MealPage').append(renderMealOptions(filteredMealOptions));
	});
	
	jQuery(document).on('click', '.premium-carousel-item', function () {
		if (!jQuery(this).hasClass('landingPage') && !jQuery(this).hasClass('experiences')) {
			destroyAllSecondaryTabs();
			redirect('premium');
		}
	});
	
}



function tboHotelsActions() {
	jQuery(document).on('keyup', '#hotelSourceInput', function () {

		clearTimeout(timeout);

		timeout = setTimeout(() => {
			value = jQuery(this).val().trim().toLowerCase();
			// Fetch the airport list
			if (value.length > 2) {
				if (allCityCodes.length === 0) {
					
					jsInit('getAirportInfo', { filterBy: value }, jQuery(this).attr('id'));
				}
				else {
					let filteredCities = allCityCodes.filter(city => city.Name.toLowerCase().includes(value));
					hotelCityPicker(filteredCities, 'hotelSourceInput');
				}
			}
			
		}, 500); // 500ms delay before the search function is called
	});
	
	// Check in Check out Date
	jQuery(document).on('click', '#checkInDate, #checkOutDate', function () {
		// Example usage
		let selectorType = jQuery(this).is('#checkInDate') ? '#check-in' : '#check-out';
		flightsCalendarPicker(selectorType);
	});
	
	jQuery(document).on('click', '.hotel__booking-select-button', function () {
		renderBottomSheet('', 'hotelBooking');
	});
	
	// Search Hotels
	jQuery(document).on('click', '.search__hotels', function () {
		// Wait until jQuery('.search__hotels').data('hotelCodes') is available
		function waitForHotelCodes(callback, interval = 100, timeout = 5000) {
			let startTime = Date.now();
		
			function checkAvailability() {
				let hotelCodes = jQuery('.search__hotels').data('hotelCodes');
				if (hotelCodes) {
					callback(hotelCodes);
				} else if (Date.now() - startTime < timeout) {
					setTimeout(checkAvailability, interval);
				} else {
					console.error('Timeout: hotelCodes data not available');
				}
			}
		
			checkAvailability();
		}
		
		// Usage
		waitForHotelCodes(function(hotelCodes) {
			// Process hotelCodes here
			/*let availHotelCodes = hotelCodes.map(hotel => hotel.HotelCode).join(',');
			console.log('Available Hotel Codes:', availHotelCodes);*/
		
			let payload = {
				city: jQuery('#hotelSourceInput').val(),
				country: 'IN',
				isInternational: 0, 
				noOfDays: 2,
				saveHistory: true
			};
			let checkInDate = jQuery('#check-in').val();
			let checkOutDate = jQuery('#check-out').val();
			// Search for hotels with only the first 10 hotel codes
			let firstTenHotelCodes = jQuery('.search__hotels').data('hotelCodes')
				.slice(0, 50)
				.filter(hotel => hotel.HotelCode !== null)
				.map(hotel => hotel.HotelCode)
				.join(',');
			
			console.log(firstTenHotelCodes); // Output: "1011662,1011663,1011664,1011665,1011670,1011671,1011672,1011673,1014715,1014919"

			let payloadObj = {
				"CheckIn": checkInDate, // "2024-12-20",
				"CheckOut": checkOutDate, //"2024-12-22",
				"HotelCodes": firstTenHotelCodes,
				"GuestNationality": "IN",
				"PaxRooms": [
					{
						"Adults": 2,
						"Children": 0,
						"ChildrenAges": null
					}
			
				],
				//"ResponseTime": 23.0,
				"IsDetailedResponse": true,
				"Filters": {
					"Refundable": false,
					"NoOfRooms": 1,
					"MealType": 0,
					"OrderBy": 0,
					"StarRating": 0,
					"HotelName": null
				},
			};
			payload.payloadObj = payloadObj;
		
			jsInit('searchHotelAvailability', payload, 'renderHotelDetails');
		});
	});
	
	// Select a Hotel from the Search Results
	jQuery(document).on('click', '.hotel-card', function () {
		console.log('Hotel Card Clicked');
		let hotelDetails = JSON.parse(jQuery(this).data('hotelDetails'));
		let hotelResult = JSON.parse(jQuery(this).data('hotelResult'));
		
		console.log(hotelDetails);
		console.log(hotelResult);
		renderHotelDetails(hotelDetails, hotelResult);
	});
	
	
}

function newPremiumActions() {
	
	//Show coupon popup
	jQuery(document).on('click', '#viewCouponBtn', function () {
		createAndShowPopup('https://imagedelivery.net/yrdfkc9LfLnd6N_GsZsD0w/bbbd97ca-3214-4e95-9e47-eafbc5f2d500/feedhd', 'popup-premium');
		fbEvent('viewCouponBtn');
		webAnalytics('viewCouponBtn');
	});
	
	// Premium Benefits View All
	jQuery(document).on('click', '.view__all-premium', function () {
		let benefits = jQuery('.premium__benefits.benefit-7, .premium__benefits.benefit-8, .premium__benefits.benefit-9, .premium__benefits.benefit-10, .premium__benefits.benefit-11, .premium__benefits.benefit-12, .premium__benefits.benefit-13, .premium__benefits.benefit-14');
		let isVisible = benefits.is(':visible');
		benefits.css('display', isVisible ? 'none' : 'flex');
		jQuery(this).css('bottom', isVisible ? '-5.5%' : '-2.5%').text(isVisible ? 'View All' : 'View Less');
		
		let container = jQuery('.premium__benefits-sub-container');
		// Scroll to the container
        container.get(0).scrollIntoView({ behavior: 'smooth', block: 'end' });
		
	});
	
	// FAQs View All
	jQuery(document).on('click', '.view__all-premium-faqs', function () {
		let benefits = jQuery('.premium__benefits.faq-5, .premium__benefits.faq-6, .premium__benefits.faq-7, .premium__benefits.faq-8, .premium__benefits.faq-9');
		
		let isVisible = benefits.is(':visible');
		benefits.css('display', isVisible ? 'none' : 'flex');
		jQuery(this).css('bottom', isVisible ? '-13%' : '-6%').text(isVisible ? 'View All' : 'View Less');
		
		let container = jQuery('.premium__benefits-container.faq__container');
		
		// container.css({ 'margin-top': !isVisible ? '26%' : '15%' });
		
		// Scroll to the container
		container.get(0).scrollIntoView({ behavior: 'smooth', block: 'end' });
	});
	
	// Tab Change
	// jQuery(document).on('click', '.section__button, .premium__coupons', function () {
	// 	//alert('Coming Soon');
	// 	renderCouponsPopUpForPremium();
	// });
	
	// Apply Coupon Premium 
	jQuery(document).on('click', '.apply__coupon-btn', function () {
		let couponCode = jQuery('#premmium_coupon').val().trim();
		console.log(couponCode);
		if (couponCode.length > 0) {
			jsInit('validateCoupon', { couponCode: couponCode, couponFor: 'experience', noOfTickets: 1 }, 'renderCouponsPopUpForPremium');
		}
	});
	
	jQuery(document).on('input', '#premmium_coupon', function () {
		let applyCouponButton = jQuery('.apply__text');
		applyCouponButton.text('Apply');
		let liveLocationInfo = JSON.parse(localStorage.getItem('liveLocationInfo'));
		let currencyCode = liveLocationInfo  && liveLocationInfo.currency_code && liveLocationInfo.currency_code != '' ? liveLocationInfo.currency_code == 'INR' ? 'INR' : 'USD' : 'INR';
		var dataTab = jQuery('.premium__tab--active').attr('data-tab');
		if (dataTab === '2') {
			jQuery('.price-slider__amount').text(currencyCode == 'INR' ? '83/' : '2.5/');
		}
		else if (dataTab === '4') {
			jQuery('.price-slider__amount').text(currencyCode == 'INR' ? '250/' : '7.2/');
		}
		
	});
	
	// Tab Change 
	jQuery(document).on('click', '.premium__tab', function () {
		let tab = jQuery(this);
		jQuery('.premium__tab').removeClass('premium__tab--active');
		tab.addClass('premium__tab--active');
		let tabId = tab.attr('data-tab');
		let liveLocationInfo = JSON.parse(localStorage.getItem('liveLocationInfo'));
		let currencyCode = liveLocationInfo  && liveLocationInfo.currency_code && liveLocationInfo.currency_code != '' ? liveLocationInfo.currency_code == 'INR' ? 'INR' : 'USD' : 'INR';
		let config = {
			'1': {
				packId: 'tbd_traveler_one_week_plus1',
				subtitle: 'MINI',
				title: 'For the GenZ & GenA Traveller',
				amount: 'Free',
				period: '',
				showSavings: false,
				currencyCode: false,
				showTotal: false,
				showStrikethrough: false,
				strikethroughPrice: ''
			},
			'2': {
				packId: 'tbd_traveler_one_year',
				subtitle: 'PREMIUM',
				title: 'For the Evolved Traveler In You',
				amount: currencyCode == 'INR' ? '83/' : '2.5/', // 167 INR or 2.5 USD
				period: 'month',
				showSavings: true,
				currencyCode: true,
				showCoupon: true,
				showTotal: true,
				showStrikethrough: true,
				strikethroughPrice: currencyCode == 'INR' ? 'Billed ₹1999/- per year' : 'Billed $60/- per year',
				showViewAll: false
			},
			'3': {
				packId: 'tbd_traveler_one_month',
				subtitle: 'SAVER',
				title: 'For the Price Conscious Traveller',
				amount: currencyCode == 'INR' ? '499/' : '7.5/', // 499 INR or 7.5 USD
				period: 'month',
				showSavings: false,
				currencyCode: true,
				showCoupon: false,
				showTotal: false,
				showStrikethrough: true,
				strikethroughPrice: currencyCode == 'INR' ? '₹999/- per month' : '$12/- per month',
				showViewAll: false
			},
			'4': {
				packId: 'tbd_elite',
				subtitle: 'LUXE',
				title: 'For the ELITE Travelers',
				amount: currencyCode == 'INR' ? '250/' : '7.2/', // 2999 INR or 7.2 USD
				period: 'month',
				showSavings: false,
				currencyCode: true,
				showCoupon: true,
				showTotal: true,
				showStrikethrough: true,
				strikethroughPrice: currencyCode == 'INR' ? 'Billed ₹5999/- per year' : 'Billed $100/- per year',
				showViewAll: true
			}
			
		};
	
		// Updating the Text and Icons
		if (tabId === '3') {
			premiumDescription = getPremiumDescription('pro');
		}
		else if (tabId === '4') {
			premiumDescription = getPremiumDescription('luxe');
		}
        else {
			premiumDescription = getPremiumDescription('super');
		}
		jQuery('.premium__benefits-sub-container').empty();
		
		premiumDescription.forEach((benefit, index) => {
			jQuery('.premium__benefits-sub-container').append(`
				<div class="premium__benefits benefit-${index + 1}">
					<div class="premium__benefits-text">
						<div class="premium__title">${benefit.title}</div>
						<div class="premium__sub-title">${benefit.description}</div>
					</div>
					<div class="premium__benefits-image">
						<img src="${benefit.imgSrc}">
					</div>
				</div>
			`);
		});
		
		jQuery('.premium__benefits-sub-container').append(`<div class="view__all-premium">View All</div>`);
		
		
		let selectedConfig = config[tabId];
		jQuery('.price-slider__card').attr('data-pack-id', selectedConfig.packId);
		jQuery('.price-slider__subtitle').text(selectedConfig.subtitle);
		jQuery('.premium__benefits-title').text(selectedConfig.title);
		jQuery('.price-slider__amount').text(selectedConfig.amount);
		jQuery('.price-slider__period').text(selectedConfig.period);
		if (selectedConfig.showSavings) {
			jQuery('.price-slider__savings, .price-slider__tag').show();
		} else {
			jQuery('.price-slider__savings, .price-slider__tag').hide();
		}
		if (selectedConfig.currencyCode) {
			jQuery('.price-slider__currency').show();
			jQuery('.price-slider__cta').css('visibility', 'visible');
		}
		else {
			jQuery('.price-slider__currency').hide();
			jQuery('.price-slider__cta').css('visibility', 'hidden');
		}
		if (selectedConfig.showCoupon) {
			jQuery('.premium__coupons').show();
		}
		else {
			jQuery('.premium__coupons').hide();
		}
		
		if (selectedConfig.showTotal) {
			jQuery('.price-slider__savings.total__price').show();
		}
		else {
			jQuery('.price-slider__savings.total__price').hide();
		}
		
		if (selectedConfig.showStrikethrough) {
			jQuery('.price-slider__strikethrough-price').show();
			jQuery('.price-slider__strikethrough-price').text(selectedConfig.strikethroughPrice);
		}
		else {
			jQuery('.price-slider__strikethrough-price').hide();
		}
		
		jQuery('.apply__text').text('Apply');
		jQuery('#premmium_coupon').data('coupon', null);
		jQuery('#premmium_coupon').val('');
		// jQuery('.price-slider__savings.total__price').text('Billed ₹999/- per year');
		
		if (tabId === '4') {
			jQuery('.price-slider__savings.total__price').text('Billed ₹2999/- per year');
		}
		else {
			jQuery('.price-slider__savings.total__price').text('Billed ₹999/- per year');
		}
		
		if (selectedConfig.showViewAll) {
			jQuery('.view__all-premium').show();
		}
		else {
			jQuery('.view__all-premium').hide();
		}
		
	});
	
	// Find Trip Partners
	jQuery(document).on('click', '.find__trip-partner-card', function () {
		var timestamp = Math.floor(Date.now() / 1000);

		if (manageUserProfile('read', 'isVerified') == true) {
			redirect('profile', jQuery(this).attr('data-user'));
			localStorage.removeItem('profileViews');
			localStorage.removeItem('lastProfileSeenTime'); // Also remove timestamp
		}
		else {
			var profileCount = localStorage.getItem('profileViews');
			var profileSeenTime = Number(localStorage.getItem('lastProfileSeenTime')); // Convert to number
			
			if (profileCount) {
				var profileCountNumber = Number(profileCount);
				if (profileCountNumber < 3) {
					profileCountNumber++;
					localStorage.setItem('profileViews', profileCountNumber);
					redirect('profile', jQuery(this).attr('data-user'));
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
						toast('Subscribe Now to Unlock more Profiles');
						redirect('premium');
					}
					else {
						localStorage.setItem('lastProfileSeenTime', timestamp);
						localStorage.setItem('profileViews', 1);
						redirect('profile', jQuery(this).attr('data-user'));
					}
				}
			}
			else {
				localStorage.setItem('lastProfileSeenTime', timestamp);
				localStorage.setItem('profileViews', 1);
				redirect('profile', jQuery(this).attr('data-user'));
			}
		}
		
	});
	
	// Opening RazorpPay for Premium Payment
	jQuery(document).on('click', '.price-slider__card', function () {
		if (guestMaster()) {
			redirect('login');
			return;	
		}
		else {
			if (jQuery('.premium__tab--active').attr('data-tab') == '1') {
				return;
			}
			managePayments("premiumInit", {});
		}
	});
}

function landingPageActions() {
	jQuery(document).on('click', '.search__box-homePage', function () {
		if (jQuery(`#main__search-box`).length <= 0) {
			renderSearch('init');
		}
		removeActiveClassFromMain();
		jQuery(`#main__search-box`).addClass('active');
		jQuery('#footer ul li, .desktopMenu-footerMenu .desktopMenu-item').removeClass('active');
		jQuery('#searchPageInput').focus();
	});
	
	jQuery(document).on('click', '.homepage__card', function () {
		
		// Remove 'big' class from all cards
		jQuery('.homepage__card').removeClass('big');
		
		let card = jQuery(this);
		// Add 'big' class to the clicked card
		card.addClass('big');
		let cardType = card.attr('data-card-type');
		setTimeout(() => {
		switch (cardType) {
			case 'flights':
				jQuery('#footer ul li[data-item="experiences"] svg').click();
				fbEvent('Flights_LP');
				break;
			case 'find':
				jQuery('#footer ul li[data-item="addPost"]').click();
				jQuery('.addPost__tab-item[data-id="find"]').click();
				fbEvent('Com_LP');
				break;
			case 'premium':
				jQuery('#footer ul li[data-item="premium"]').click();
				fbEvent('Premium_LP');
				break;
			case 'ai':
				manageSecondary('show', 'ai_itinerary');
				fbEvent('AI_LP');
				break;
			case 'addPost':
				jQuery('#footer ul li[data-item="addPost"]').click();
				jQuery('.addPost__tab-item[data-id="share"]').click();
				break;
			case 'chat':
				if (guestMaster()) {
					renderBottomSheet('', 'loginNew');
					return;
				}
				renderChat('init');
				break;
				
			}
			card.removeClass('big');
		}, 500);
	});
	
	jQuery(document).on('click', '.homepage__hero', function () {
		jQuery('#footer ul li[data-item="experiences"] svg').click();
		fbEvent('Flights_LP-hero');
	});
	
	jQuery(document).on('click', '#close_lp', function () {
		jQuery('#footer ul li[data-item="feed"]').click();
		if (guestMaster()) {
			renderBottomSheet('', 'loginNew');
		}
		fbEvent('Com_LP-cross');
	});
	
	jQuery(document).on('click', '.premium-carousel-item.landingPage', function () {
		let clickedImgSrc = jQuery(this).find('img').attr('src');
		if (clickedImgSrc.includes('find')) {
			jQuery('#footer ul li[data-item="feed"]').click();
			fbEvent('Com_LP');
		}
		else if (clickedImgSrc.includes('flights')) {
			jQuery('#footer ul li[data-item="experiences"] svg').click();
			fbEvent('Flights_LP-hero');
		}
		else if (clickedImgSrc.includes('member')) {
			redirect('premium');
			fbEvent('Premium_LP');
		}
		// else if (clickedImgSrc.startsWith('https')) {
		// 	window.open('https://beatravelbuddy.zetexa.com/', '_blank');
		// }
		else {
			webAnalytics('app_install');
			fbEvent('app_install');
			window.open('https://beatravelbuddy.com/detect', '_blank');
		}
	});
		
		
}

function newLoginPageAction() {
	jQuery(document).on('focus', '#countryCodeInput', function () {
		jsInit('fetchCountries', '', 'newLogin');
	});
	
	jQuery(document).on('input', '#countryCodeInput', function () {
		function filterDropdown() {
			let filter = countryCodeInput.value.toLowerCase();
			let divs = countryCodeDropdown.getElementsByTagName('div');
			for (let i = 0; i < divs.length; i++) {
				let text = divs[i].textContent.toLowerCase();
				if (text.includes(filter)) {
					divs[i].style.display = '';
				} else {
					divs[i].style.display = 'none';
				}
			}
		}
		filterDropdown();
		countryCodeDropdown.style.display = 'block';
	});
	
	/*jQuery(document).on('click', '.btn.btn-primary-email', function (e) {
		e.preventDefault();
		let $btn = jQuery('.btn.btn-primary-email');
		let $input = jQuery('.form__input');
		let $selectContainer = jQuery('.custom-select-container');
		let $countryCodeInput = jQuery('#countryCodeInput');
		
		if ($btn.hasClass('btn-primary-phone')) {
			$selectContainer.show();
			$input.css('width', '68%')
				  .attr('placeholder', 'Phone Number')
				  .attr('type', 'tel')
				  .focus();
			$btn.text('Login via Email').removeClass('btn-primary-phone');
			$countryCodeInput.attr('required', true);
			
		}
		else {
			$selectContainer.hide();
			$input.css('width', '100%')
				  .attr('placeholder', 'Type your Email here')
				  .attr('type', 'email')
				  .focus();
			$btn.text('Login via Phone').addClass('btn-primary-phone');
			$countryCodeInput.removeAttr('required');
		}
	});*/
	jQuery(document).on('click', '.social__btn', function () {
		// Get the Data type of button
		let type = jQuery(this).attr('data-type');
		
		switch (type) {
			case 'google':
				if (isAndroid()) {
					Android.loginGoogle();
					return;
				}
				else if (isIOS()) {
					window.webkit.messageHandlers.login.postMessage({ loginType: 'google' });
					return;
				}
				handleSignIn(new firebase.auth.GoogleAuthProvider(), 'loginGoogle');
				break;
			case 'facebook':
				if (isAndroid()) {
					Android.loginFacebook();
					return;
				}
				else if (isIOS()) {
					window.webkit.messageHandlers.login.postMessage({ loginType: 'facebook' });
					return;
				}
				handleSignIn(new firebase.auth.FacebookAuthProvider(), 'loginFacebook');
				break;
			case 'apple':
				// Apple Sign In
				window.webkit.messageHandlers.login.postMessage({ loginType: 'apple' });
				break;
		}
	});
	
	//Main Button For Login / Forgot Password / Sign up
	jQuery(document).on('submit', '.form', function (e) {
		e.preventDefault();
	
		var deviceType = isAndroid() ? '0' : isIOS() ? '1' : '2';
		let email = jQuery('.form__input.phone').val();
		let password = jQuery('.form__password').val();
		var deviceUniqueId = '';
		
		if (isAndroid() || isIOS()) {
			deviceUniqueId = manageNotificationToken('vendorUUID');
		}
		
		if (email === '' || email === null || email === undefined) {
			toast('Please enter your email or phone number');
			return;
		}
	
		function validateEmail(email) {
			let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return re.test(String(email).toLowerCase());
		}
	
		// Email Validation
		if (email.includes('@')) {
			if (!validateEmail(email)) {
				toast('Invalid Email Address');
				return;
			}
			if (jQuery('.btn.btn-primary').hasClass('reset__password')) {
				toast('Please use phone number to reset your password');
				//jsInit('forgotPass', { email: email }, 'newLogin');
				return;
			}
			if (jQuery('.btn.btn-primary').hasClass('forgot__pass-otp')) {
				toast('Please wait while we verify the OTP');
				jsInit('matchOtpForgot', { email: email, enteredOTP: jQuery('.form__input.otp').val().trim() }, 'newLogin');
				return;
			}
			if (jQuery('.btn.btn-primary').hasClass('new__password')) {
				toast('Please wait while we reset your password');
				jsInit('resetPass', { email: email, password: jQuery('.form__input.new__password').val().trim() }, { newLogin: 'newLogin', email: email, password: jQuery('.form__input.new__password').val().trim() });
				return;
			}
		}
		// Phone Number Validation
		else {
			if (jQuery('.btn.btn-primary').hasClass('reset__password')) {
				toast('Please wait while we send an OTP on your phone number');
				jsInit('checkUserLogin', { phoneNumber: email, forgotPassword: true }, {
					phoneNumber: email,
					dialCode: '+91',
				});
				//jsInit('forgotPass', { email: email }, 'newLogin');
				return;
			}
			if (!parseInt(email)) {
				toast('Invalid Phone Number');
				return;
			}
			if (jQuery('.btn.btn-primary').hasClass('sign__up')) {
				let dialCode = jQuery('#countryCodeInput').val().split(' ')[0].trim() || '+91';
				if (dialCode === '+91' && email.length !== 10) {
					toast('Please enter a valid 10 digit phone number');
					return;
				}
				if (password === '' || password === null || password === undefined) {
					toast('Please enter your password');
					return;
				}
				var userFullName = jQuery('.form__input.name').val().trim();
				if (userFullName === '' || userFullName === null || userFullName === undefined) {
					toast('Please enter your name');
					return;
				}
				toast('Please wait while we check if you are already registered user');
				
				jsInit('checkUserLogin', { phoneNumber: email }, {
					name: userFullName,
					phoneNumber: email,
					dialCode: dialCode,
					password: password,
					deviceType: deviceType,
					appVersion: appVersion
				});
				return;
			}
			if (jQuery('.btn.btn-primary').hasClass('otp')) {
				let dialCode = jQuery('#countryCodeInput').val().split(' ')[0].trim() || '+91';
				if (dialCode == '+91') {
					console.log('Mobile Number: ', email);
					var twoFactMobile = '+91' + jQuery('.form__input.phone').val();
					console.log('Two Factor Mobile: ', twoFactMobile);
					jsInit('verifyOTPDomestic', {
						mobileNumber: twoFactMobile,
						otpEnteredByUser: jQuery('.form__input.otp').val()
					});
					return;
				}
				else {
					submitPhoneNumberAuthCodes(jQuery('.form__input.otp').val());
				}
				let code = jQuery('.form__input.otp').val();
				if (code.length == 6) {
					submitPhoneNumberAuthCodes(code);
				} else {
					toast('Invalid OTP');
				}
				function submitPhoneNumberAuthCodes(data) {
					code = Number(data);
					confirmationResult.confirm(code)
						.then(function (result) {
							
						
							toast('Phone Number Verified');
							jsInit('insertUser', { phoneNumber: email, dialCode: jQuery('.form__input.otp').attr('data-dial'), userName: jQuery('.form__input.name').val().trim(), password: jQuery('.form__password').val().trim(), deviceType: deviceType, deviceUniqueId: deviceUniqueId, deviceId: manageNotificationToken('get') });
						})
						.catch(function (error) {
							toast('Invalid OTP');
							console.log(error);
						});
				}
				return;
			}
			if (jQuery('.btn.btn-primary').hasClass('forgot__pass-otp')) {
				// toast('Please wait while we send an OTP on your phone number');
				// jsInit('matchOtpForgot', { email: email, enteredOTP: jQuery('.form__input.otp').val().trim() }, 'newLogin');
				let code = jQuery('.form__input.otp').val();
				if (code.length == 6) {
					submitPhoneNumberAuthCodes(code);
				} else {
					toast('Invalid OTP');
				}
				function submitPhoneNumberAuthCodes(data) {
					code = Number(data);
					confirmationResult.confirm(code)
						.then(function (result) {
							
							toast('OTP verified successfully. Please enter your new password.');
							jQuery('.form__input.otp').val('').attr('placeholder', 'Enter New Password').attr('type', 'text').addClass('new__password').removeClass('otp');
							
							jQuery('.btn.btn-primary').addClass('new__password').removeClass('sign__up forgot__pass-otp').removeClass('reset__password').text('Confirm and Login');
							//localStorage.setItem('tempToken', response.object.token);
							// jsInit('insertUser', { phoneNumber: email, dialCode: jQuery('.form__input.otp').attr('data-dial'), userName: jQuery('.form__input.name').val().trim(), password: jQuery('.form__password').val().trim(), deviceType: deviceType, deviceUniqueId: deviceUniqueId, deviceId: manageNotificationToken('get') });
						})
						.catch(function (error) {
							toast('Invalid OTP');
							console.log(error);
						});
				}
				return;
			}
			if (jQuery('.btn.btn-primary').hasClass('new__password')) {
				toast('Please wait while we reset your password');
				jsInit('resetPass', { email: email, password: jQuery('.form__input.new__password').val().trim() }, { newLogin: 'newLogin', email: email, password: jQuery('.form__input.new__password').val().trim() });
				return;
			}
		}
	
		if (password === '' || password === null || password === undefined) {
			toast('Please enter your password');
			return;
		}
		var payload = {
			email: email,
			password: password,
			gToken: token,
			deviceId: manageNotificationToken('get')
		};
	
		if (isAndroid() || isIOS()) {
			payload.deviceUniqueId = manageNotificationToken('vendorUUID');
		}
	
		jsInit('login', payload);
	});
	
	jQuery(document).on('click', '.traveller-details-review__content', function () {
		jQuery('#countryCodeDropdown').css('display', 'none');
	});
	
	// Forgot Password
	jQuery(document).on('click', '.forgot__password', function () {
		
		let button = jQuery(this);
		let isBackToLogin = button.hasClass('back__login');
		
		jQuery('.password-container').toggle(isBackToLogin);
		jQuery('.form__input.phone').attr('placeholder', 'Type your Phone Number');
		jQuery('.btn.btn-primary')
			.text(isBackToLogin ? 'Login' : 'Reset Password')
			.toggleClass('reset__password', !isBackToLogin);
		
		button
			.text(isBackToLogin ? 'Forgot your password?' : 'Back to Login')
			.toggleClass('back__login', !isBackToLogin);
		jQuery('.form__input.otp').remove();
	});
	
	// Signup Button
	jQuery(document).on('click', '.btn.btn-link', function (e) {
		e.preventDefault();
		
		let button = jQuery(this);
		jQuery('.form__input.otp').remove();
		
		if (button.hasClass('login__link')) {
			jQuery('.login__title').text('Login here');
			jQuery('.login__subtitle').html('Welcome back<br>you\'ve been missed!');
			jQuery('.form__input.name').remove();
			jQuery('.forgot__password').show().text('Forgot your password ?').removeClass('back__login');
			jQuery('.btn.btn-primary').text('Login').removeClass('sign__up');
			jQuery('.custom-select-container').css('display', 'none');
			jQuery('.form__input.phone').css('width', '100%');
			jQuery('.form__input.phone').attr('placeholder', 'Type your Phone Number or Email');
			button.html(`<span style="color: grey;">Don't have an account ? </span><strong>  Sign Up</strong>`).removeClass('login__link');
		}
		else {
			jQuery('.login__title').text('Sign Up');
			jQuery('.login__subtitle').html('Create an account<br>to get started');
			jQuery('.form__group').prepend(`<input type="text" class="form__input name" placeholder="Enter your name">`);
		
			
			jQuery('.forgot__password').hide();
			jQuery('.btn.btn-primary').text('Sign Up').addClass('sign__up');
			jQuery('.custom-select-container').css('display', 'block');
			jQuery('.form__input.phone').css('width', '68%');
			jQuery('.form__input.phone').attr('placeholder', 'Type your Phone Number');
			button.html(`<span style="color: grey;">Already have an account ? </span><strong>  Login</strong>`).addClass('login__link');
		}
		jQuery('.password-container').show();
	});
	
	// Check if the user is Signup and if its a phone number show the dial code also if the user deletes and enters email then hide the dial code
	/*jQuery(document).on('input', '.form__input.phone', function () {
		let isSignup = jQuery('.btn.btn-primary').hasClass('sign__up');
		if (!isSignup) {
			return;
		}
	
		let value = jQuery(this).val();
		let isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	
		if (value.length > 0) {
			if (isEmail) {
				jQuery('.custom-select-container').css('display', 'none');
				jQuery('.form__input.phone').css('width', '100%');
			} else if (parseInt(value) && value.length > 6) {
				jQuery('.custom-select-container').css('display', 'block');
				jQuery('.form__input.phone').css('width', '68%');
			} else {
				jQuery('.custom-select-container').css('display', 'none');
				jQuery('.form__input.phone').css('width', '100%');
			}
		} else {
			jQuery('.custom-select-container').css('display', 'none');
			jQuery('.form__input.phone').css('width', '100%');
		}
	});*/
	
	// Show hide pass
	jQuery(document).on('click', '.pass__toggle', function () {
		var clickedButton = jQuery(this);
		if (clickedButton.hasClass('show__pass')) {
			clickedButton.removeClass('show__pass').addClass('hide__pass');
			jQuery('.form__password').attr('type', 'text');
			clickedButton.html(icons.passwordHide)
		}
		else {
			clickedButton.removeClass('hide__pass').addClass('show__pass');
			jQuery('.form__password').attr('type', 'password');
			clickedButton.html(icons.passwordShow)
		}
	});
			
}

function newOnboardingActions() {
	
	// Cover Photo Picker
	jQuery(document).on('click', '.onboarding__page-edit-button', function (e) {
		e.preventDefault();
		createPhotoPicker('cover');
	});
	
	// Profile Photo Picker
	jQuery(document).on('click', '.onboarding__page-avatar-edit', function (e) {
		e.preventDefault();
		createPhotoPicker('dp');
	});
	// Photo Picker
	var cropper;
	
	// Store the selected files
	let selectedCoverFile = null;
	let selectedProfileFile = null;
	jQuery(document).on('change', '#file-input-cover, #file-input-dp', function (event) {
		var image;
		if (jQuery(this).attr('id') === 'file-input-cover') {
			image = jQuery('.onboarding__page-background-image img');
		}
		else {
			image = jQuery('.onboarding__page-avatar img');
		}
		var files = event.target.files;
		console.log(files, files[0], files[0].name);
		if (files && files.length > 0) {
			var file = files[0];
			var reader = new FileReader();
			reader.onload = function (e) {
				image.attr('src', e.target.result);
				/*if (cropper) {
					cropper.destroy();
				}
				cropper = new Cropper(image[0], {
					aspectRatio: NaN, // Free aspect ratio
					viewMode: 3, // Ensure the minimum canvas size fills the container
					autoCropArea: 1, // Start with the maximum possible crop area
				});*/
			};
			reader.readAsDataURL(file);
			
			//Also append the user id to the form data
			// uploadData.append('data', manageUserProfile('read', 'userId'));
			
			if (jQuery(this).attr('id') === 'file-input-cover') {
				//jsUpload('coverUpload', uploadData, 'newOnboarding');
				selectedCoverFile = file;
			}
			else {
				//jsUpload('uploadDP', uploadData, 'newOnboarding');
				selectedProfileFile = file;
			}
		}
	});
	
	/*jQuery(document).on('click', '#zoom-in', function() {
		if (cropper) {
			cropper.zoom(0.1);
		}
	});
	
	jQuery(document).on('click', '#zoom-out', function() {
		if (cropper) {
			cropper.zoom(-0.1);
		}
	});
	
	jQuery(document).on('click', '#crop', function() {
		if (cropper) {
			const croppedImage = jQuery('#cropped-image');
			const canvas = cropper.getCroppedCanvas();
			croppedImage.attr('src', canvas.toDataURL());
		}
	});*/
	
	// Gender Selection
	jQuery(document).on('click', '.onboarding__page-gender-option', function () {
		jQuery('.onboarding__page-gender-option').removeClass('active');
		jQuery(this).addClass('active');
	});

	
	
	// Submit & Upload Data to Profile
	jQuery(document).on('click', '.onboarding__page-done-button', function (e) {
		e.preventDefault();
		// Get the Cover Photo and Profile Photo
		let coverPhoto = jQuery('.onboarding__page-background-image img').attr('src');
		let profilePhoto = jQuery('.onboarding__page-avatar img').attr('src');
		
		// Get the Gender 
		let gender = jQuery('.onboarding__page-gender-option.active').attr('data-gender');
		gender = gender === 'male' ? 0 : gender === 'female' ? 1 : 2;
		
		console.log(coverPhoto, profilePhoto, gender);
		
		var uploadCover = new FormData();
		var uploadDp = new FormData();
		

		// Upload the data
		if (selectedCoverFile) {
			uploadCover.append('uploaded_files', selectedCoverFile, selectedCoverFile.name);
		
			uploadCover.append('data', manageUserProfile('read', 'userId'));
            jsUpload('coverUpload', uploadCover, 'newOnboarding');
        }
		if (selectedProfileFile) {
			uploadDp.append('uploaded_files', selectedProfileFile, selectedProfileFile.name);
		
			uploadDp.append('data', manageUserProfile('read', 'userId'));
            jsUpload('uploadDP', uploadDp, 'newOnboarding');
		}
		
		jsInit('updateAbout', { 'name': jQuery('.onboarding__page-profile-info h2').text(), 'gender': gender }, 'newOnboarding');
		
	});
	
	jQuery(document).on('click', '.onbOne', function () {
		// Check each li of #footer ul and check if any has active class
		// Check if any li has active class
		var hasActive = jQuery('#footer ul li').hasClass('active');

		if (hasActive) {
			console.log('Click');
		} else {
			jQuery('#footer ul li[data-item="feed"]').click();
		}
	});
	
	
	
}
		
		

jQuery(document).ready(function () {

	feedActions();
	tabActions();
	searchActions();
	profileActions();
	headerActions();
	footerActions();
	notificationActions();
	premiumActions();
	//shotsActions();
	//loginActions();
	//onboardingActions();
	locationsActions();
	//otpActions();
	popupActions();
	menuActions();
	//welcomeScreenActions();
	feedbackActions();
	blockedUsersActions();
	reportActions();
	optionsMenuActions();
	permissionsActions();
	addPostActions();
	influencerActions();
	messagePopupsActions();
	permissionsPopupsActions();
	experiencesActions();
	contactActions();
	feedLoginActions();
	cardActions();
	spDashboardActions();
	addListingActions();
	settingsActions();
	//servicesAction();
	filterActions();
	desktopActions();
	chatActions();
	editProfileActions();
	editCommentAction();
	marketplaceActions();
	chatSendActions();
	errorPageActions();
	messageDashboardActions();
	leadFormActions();
	filterCommunityActions();
  	//initializeDateRangePicker();
	onboardingVideoActions();
	homePageActions();
    itineraryActions();
    hostellerActions();
    manageListingsActions();
	arrowSlidingActions();
	tboFlightsActions();
	tboHotelsActions();
	newPremiumActions();
	landingPageActions();
	newLoginPageAction();
	newOnboardingActions();
});