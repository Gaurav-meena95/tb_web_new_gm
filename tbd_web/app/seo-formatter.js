const getExps = require('./experiences/queries/get_experiences');
const appConstants = require("./constants");
const { title } = require('process');
const dbConnectFile = require('./db-connect');

const LOCATION_IMAGE_MAP = {
	'goa': 'uploads/search_images/goa.jpg',
	'mumbai': 'uploads/search_images/mumbai.jpg',
	'bali': 'uploads/search_images/bali.jpg',
	'bengaluru': 'uploads/search_images/banglore.jpg',
	'new delhi': 'uploads/search_images/NewDelhi.jpg',
	'manali': 'uploads/search_images/manali.jpg',
	'thailand': 'uploads/search_images/Thailand.jpg',
	'delhi': 'uploads/search_images/Delhi.jpg',
	'pune': 'uploads/search_images/Pune.jpg',
	'leh': 'uploads/search_images/Leh.jpg',
	'bangkok': 'uploads/search_images/Bangkok.jpg',
	'india': 'uploads/search_images/India.jpg',
	'rishikesh': 'uploads/search_images/Rishikesh.jpg',
	'dubai': 'uploads/search_images/Dubai.jpg',
	'himachal pradesh': 'uploads/search_images/HimachalPradesh.jpg',
	'jaipur': 'uploads/search_images/Jaipur.jpg',
	'hyderabad': 'uploads/search_images/Hyderabad.jpg',
	'kasol': 'uploads/search_images/Kasol.jpg',
	'kolkata': 'uploads/search_images/Kolkata.jpg',
	'singapore': 'uploads/search_images/Singapore.jpg',
	'paris': 'uploads/search_images/Paris.jpg',
	'philippines': 'uploads/search_images/Philippines.jpg',
	'chennai': 'uploads/search_images/Chennai.jpg',
	'kerala': 'uploads/search_images/Kerala.jpg',
	'indonesia': 'uploads/search_images/Indonesia.jpg',
	'amsterdam': 'uploads/search_images/Amsterdam.jpg',
	'jammu and kashmir': 'uploads/search_images/Jammu.jpg',
	'kuala lumpur': 'uploads/search_images/KualaLumpur.jpg',
	'spiti valley': 'uploads/search_images/Spiti.jpg',
	'phuket': 'uploads/search_images/Phuket.jpg',
	'puducherry': 'uploads/search_images/Puducherry.jpeg',
	'jakarta': 'uploads/search_images/Jakarta.jpg',
	'munnar': 'uploads/search_images/Munnar.jpg',
	'shimla': 'uploads/search_images/Shimla.jpg',
	'istanbul': 'uploads/search_images/Istanbul.jpg',
	'udaipur': 'uploads/search_images/Udaipur.jpg',
	'chandigarh': 'uploads/search_images/Chandigarh.jpg',
	'sri lanka': 'uploads/search_images/SriLanka.jpg',
	'ahmedabad': 'uploads/search_images/Ahmedabad.jpg',
	'malaysia': 'uploads/search_images/Malaysia.jpg',
	'ladakh vacation': 'uploads/search_images/LadakhVacation.jpg',
	'dharamshala': 'uploads/search_images/Dharamshala.jpg',
	'uttarakhand': 'uploads/search_images/Uttarakhand.jpg',
	'london': 'uploads/search_images/London.jpg',
	'nepal': 'uploads/search_images/Nepal.jpg',
	'barcelona': 'uploads/search_images/Barcelona.jpg',
	'new york': 'uploads/search_images/NewYork.jpg',
	'visakhapatnam': 'uploads/search_images/Visakhapatnam.jpg',
	'hampi': 'uploads/search_images/Hampi.jpg',
	'nainital': 'uploads/search_images/Nainital.jpg',
};

const DEFAULT_LOCATION_IMAGE = 'uploads/search_images/Delhi.jpg';

function buildLocationPreviewImage(relativePath) {
	const normalizedPath = String(relativePath || '').trim();
	return `${appConstants.imageBaseUrl}/filters:format(webp)/fit-in/1200x630/${normalizedPath}`;
}

function normalizeLocationName(rawLocation) {
	return decodeURIComponent(String(rawLocation || ''))
		.replace(/[-_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

async function seoFormatter(what, data, requestDetails) {
	//Default response
	response = {
		title: 'Travel Buddy - Book / Plan Trips, Packages & Experiences', description: 'Plan, Find, Book & Travel across the Globe. Visit exotic locations and experience diverse cultures. Enjoy the best cuisines the world has to offer. Make memories that will last a lifetime. #NeverFeelAlone', appVersion: appConstants.APPVERSION, pageUrl: 'https://beatravelbuddy.com/', keywords: 'weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages',
        image: 'https://beatravelbuddy.com/view/assets/img/experiences_preview.jpeg',
	}

	if (['experiences', 'experienceId', 'experienceCategory', 'groupTripsId'].includes(what)) {
		// Default response object
		response = {
			title: 'Book Travel Packages, Flights & Hotels with Easy EMI & Discounts',
			description: 'Discover unique Travel Experiences! Travel Buddy offers adventure tours, group trips, treks & customized travel packages worldwide.',
			image: '/view/assets/img/experience_meta_image.jpeg',
			keywords: 'unique travel experiences, global travel, adventure tours, cultural trips, travel destinations, Be A Travel Buddy, travel packages, holiday experiences, explore the world, travel inspiration, customized trips, experiential travel, group travel, travel adventures, travel with buddies'
		}

		if (['experienceId', 'experienceCategory', 'groupTripsId'].includes(what)) {
			id = data.split('-').pop(); // Get the last element from the split data

			// Fetch experience based on the type
			// So, if what equals 'experienceId', the filter object will look like this: { filter: { experienceId: id } }. If what does not equal 'experienceId', the filter object will look like this: { filter: { category: data.replaceAll('-', ' ') } }. This filter object is then used to fetch experiences.
			console.log('id:', id);
			console.log('what:', what);
			experience = await getExps({
				filter: {
					[
						(what == 'experienceId' || what == 'groupTripsId') ? 'experienceId' : 'category'
					]
						: what == 'experienceId' ? id
							: data.replaceAll('-', ' ')
				}
			});
			

			if (experience.object.length > 0) {
				experience = experience.object[0];

				// Clean up and format experience data
				experience.content = experience.content.replace(/<[^>]*>?/gm, '').substring(0, 160);
				experience.titleUrl = (experience.title.replace(/ /g, '-') + '-' + experience.id + '/').toLocaleLowerCase().replace('//', '/').replace(/[^a-zA-Z0-9-]/g, '');

				// Check if the media url is a relative URL (does not start with 'http')
				image_url = experience.media[0].media_thumbnail.indexOf('http') == -1 ?
					appConstants.imageBaseUrl + experience.media[0].media_thumbnail :
					experience.media[0].media_thumbnail;

				// Update response based on the type
				response = (what == 'experienceId' || what == 'groupTripsId') ?
					{
						title: experience.title,
						description: experience.content,
						image: image_url,
						url: what == 'experienceId' ? 'https://www.beatravelbuddy.com/experiences/' + experience.titleUrl : 'https://www.beatravelbuddy.com/group-trips/' + experience.titleUrl,
					} :
					{
						...response,
						image: appConstants.imageBaseUrl + '/uploads/category_icons/' + data + '.png'
					};
			}
			console.log('Experience:', experience);
			console.log('Response:', response);
		}
	}
	else if (what == 'listings') {
		response = {
			title: 'Book Cheap Flights & Hotels Online | Travel Buddy',
			description: 'Book cheap flights & hotels online with Travel Buddy. Get the best deals on domestic & international flights, hotels & holiday packages at the lowest prices.',
			image: '/view/assets/img/hotels_background.jpeg',
			url: 'https://travelbuddy.com/listings/',
			keywords: 'weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages'
		}
	}
	else if (what == 'premium' || what == 'premium-mini') {
		let imgUrl = what == 'premium' ? 'https://beatravelbuddy.com/view/assets/img/prem-preview.webp' : 'https://beatravelbuddy.com/view/assets/img/prem-mini.webp';
		response = {
			title: 'Unlock Travel Without Limits-Go Premium Today! Unlock Free Flight Perks & Travel Smarter',
			description: 'Buy Our Premium Subscription and Get Zero Convenience Fee on Flights, Access To Like Minded Travelers, Itineraries, Discounts on Travel Buddy Products and much more.',
			url: 'https://beatravelbuddy.com/premium/',
			image: 'https://prodmedia.beatravelbuddy.com/uploads/app-banners/elite-one.webp',
			keywords: 'travel subscription India, flight deals India, travel buddy premium, zero convenience fee flights, travel community India, verified travel buddies, affordable travel membership, travel perks India, best travel plans, join travel buddy, discount travel booking, travel deals subscription, premium travel services, smart travel membership, solo travel community, Indian travel platform, save on flights India, budget travel app, travel buddy plans, travel deals subscription, travel deals India, travel deals online, travel deals app, travel deals website, travel deals platform, travel deals app, travel deals website, travel deals platform, travel deals app, travel deals website, travel deals platform'
		}
	}
	else if (what == 'dashboard') {
		response = {
			title: 'Travel Buddy - Travel Social Commerce',
			description: 'Never feel alone when you travel. Join travel buddy today to find travel meetups around you, travel partners, travel services & local experiences.',
			url: 'https://travelbuddy.com/dashboard/'
		}
	}
	else if (what == 'community') {
		response = {
			title: 'India’s fastest growing Travelers Community', description: 'Find travel buddies, connect & meet like-minded travelers. Start your adventure today by joining the global travel community. #NeverFeelAlone',
			image: 'https://beatravelbuddy.com/view/assets/img/link-preview.webp',
			url: 'https://beatravelbuddy.com/',
			keywords: 'travel community, find travel buddies, travel partners, connect with travelers, share travel experiences, Be A Travel Buddy, travel networking, global travel community, meet travelers, travel forums, travel discussions, travel groups, travel social network, explore together'
		}
	}
	else if (what == 'search') {
		response = {
			title: 'Find Your Next Adventure: Travel Experiences & Destinations',
			description: 'Search your perfect vacation! Our travel deals finder helps you explore destinations, plan activities & book the best deals. Start your adventure with Travel Buddy!',
			url: 'https://travelbuddy.com/search/',
			keywords: 'travel deals, vacation destinations, travel activities, trip planning, travel search tool, travel deals finder, best travel deals, adventure planning, travel resources, travel guide'
		}
	}
	else if (what == 'location-feed') {
		const locationName = normalizeLocationName(data);
		const lookupKey = locationName.toLowerCase();
		const relativeImagePath =
			LOCATION_IMAGE_MAP[lookupKey] || DEFAULT_LOCATION_IMAGE;

		response = {
			title: `Explore ${locationName || 'Travel Destinations'} on Travel Buddy`,
			description: `Check out top posts and travelers in ${locationName || 'this destination'} on Travel Buddy.`,
			url: `https://beatravelbuddy.com/location-feed/${encodeURIComponent(locationName || 'destination')}`,
			image: buildLocationPreviewImage(relativeImagePath),
			keywords: `${locationName}, travel buddies, destination guide, local posts, travel community, Travel Buddy`,
		}
	}
	else if (what == 'add-post') {
		response = {
			title: 'Share Your Travel Experience with Travel Buddies ',
			description: 'Share your travel experience with travel buddies and get featured on our social travel commerce platform. Share your travel stories, photos, videos & more. ',
			url: 'https://travelbuddy.com/add-post',
			image: '/view/assets/img/findBuddy.svg',
			keywords: 'weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages'
		}
	}
	else if (what == 'login') {
		response = {
			title: 'Travel Buddy - Travel Social Commerce', description: 'Never feel alone when you travel. Join travel buddy today to find travel meetups around you, travel partners, travel services & local experiences.',
			appVersion: appConstants.APPVERSION,
			pageUrl: 'https://beatravelbuddy.com/contact-us/'
		}
	}
	else if (what == 'homePage') {
		response = {
			title: 'Plan, Find, Book & Travel across the Globe', description: 'Plan, Find, Book & Travel across the Globe. Visit exotic locations and experience diverse cultures. Enjoy the best cuisines the world has to offer. Make memories that will last a lifetime. #NeverFeelAlone',
			keywords: 'weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages',
			appVersion: appConstants.APPVERSION,
			pageUrl: 'https://beatravelbuddy.com/homePage/',
			image: '/view/assets/img/findBuddy.svg'
		}
	}
	else if (what == 'groupTrips') {
		response = {
			title: 'Book Group Trips from Travel Buddy.',
			description: 'Join our group trips for shared experiences, laughter, and amazing memories together!',
			appVersion: appConstants.APPVERSION,
			pageUrl: 'https://beatravelbuddy.com/check-deals-hotels-flights-packages',
			image: 'https://beatravelbuddy.com/view/assets/img/experiences_preview.jpeg',
			keywords: 'group trips, group travel, friends travel, family trips, group adventures, shared travel experiences, group tours, group vacations, travel with friends, family group travel,Group travel community,Travel group tours,Group travel booking'
		}
	}
	else if (what == 'check-deals-hotels-flights-packages') {
		response = {
			title: 'Plan & Book Hotels, flights, Best Deals, Packages & Trips within your budget.',
			description: 'Plan & Book Hotels, flights, Best Deals, Packages & Trips within your budget. Get the best deals on domestic & international flights, hotels & holiday packages at the lowest prices.',
			appVersion: appConstants.APPVERSION,
			pageUrl: 'https://beatravelbuddy.com/check-deals-hotels-flights-packages',
			image: 'https://beatravelbuddy.com/view/assets/img/hotels_background.jpeg',
			keywords: 'weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages'
		}
	}
	else if (what == 'ai-plan-trip' || what == 'allAiTrips') {
		response = {
			title: 'Travel Buddy AI: Build Your Perfect Vacation Itinerary.',
			description: 'Travel Buddy AI is your smart, AI-powered trip planner for personalized, customizable vacations. Effortless itinerary builder, tailored recommendations. Be a Travel Buddy!',
			appVersion: appConstants.APPVERSION,
			pageUrl: 'https://beatravelbuddy.com/ai-plan-trip',
			image: 'https://beatravelbuddy.com/view/assets/img/ai-lp.webp',
			keywords: 'AI trip planner, AI travel planning, personalized travel, custom travel itinerary, vacation planning, AI travel assistant, plan a trip, travel recommendations, AI-powered travel, trip customization, travel planning tool, Be A Travel Buddy, smart trip planner, itinerary builder'
		}
	}
	else if (what == 'itineraryId') {
		response = {
			title: 'AI Travel Plan to ' + requestDetails.location + ' with ' + requestDetails.paxType + ' in ' + requestDetails.budgetType + '  | Travel Buddy brings you the best travel trips & packages at the best prices.',
			description: 'AI Travel Plan to ' + requestDetails.location + ' with ' + requestDetails.paxType + ' in ' + requestDetails.budgetType + ' | Travel Buddy brings you the best travel experiences at the best prices. Get the best deals on domestic & international flights, hotels & holiday packages at the lowest prices.',
			appVersion: appConstants.APPVERSION,
			pageUrl: 'https://beatravelbuddy.com/ai-plan-trip/location/itineraryId/',
			image: 'https://beatravelbuddy.com/view/assets/img/findBuddy.svg',
			keywords: `${requestDetails.location}, ${requestDetails.paxType}, ${requestDetails.budgetType}, weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages`
		}
	}
    
	else if (what == 'findbuddy') {
		response = {
			title: 'Find travel buddies for the entire globe on TravelBuddy.', description: 'Plan, Find, Book & Travel across the Globe. Visit exotic locations and experience diverse cultures. Enjoy the best cuisines the world has to offer. Make memories that will last a lifetime. #NeverFeelAlone',
			keywords: 'travelbuddy, weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages',
			appVersion: appConstants.APPVERSION,
			pageUrl: 'https://beatravelbuddy.com/findbuddy/',
			image: 'https://beatravelbuddy.com/view/assets/img/findBuddy.svg'
		}
	}
	else if (what == 'add-find-post') {
		response = {
			title: 'Find Travel Buddies from across the glober on TravelBuddy.',
			description: 'Find your travel buddies and get featured on our social travel commerce platform. Share your travel stories, photos, videos & more. ',
			pageUrl: 'https://beatravelbuddy.com/add-find-post',
			image: '/view/assets/img/findBuddy.svg',
			keywords: 'weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages'
		}
	}
	else if (what == 'add-share-post') {
		response = {
			title: 'Share Your Travel Experience with Travel Buddies ',
			description: 'Share your travel experience with travel buddies and get featured on our social travel commerce platform. Share your travel stories, photos, videos & more. ',
			pageUrl: 'https://beatravelbuddy.com/add-share-post',
			image: '/view/assets/img/findBuddy.svg',
			keywords: 'weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages'
		}
	}
	else if (what == 'add-ask-post') {
		response = {
			title: 'Ask Travel Questions & Get Instant answers from Travel Buddies ',
			description: 'Ask travel questions and get instant answers from travel buddies. Share your travel stories, photos, videos & more. ',
			pageUrl: 'https://beatravelbuddy.com/add-ask-post',
			image: '/view/assets/img/findBuddy.svg',
			keywords: 'weekend, trips, travel quotes, travel bag, weekend trips from delhi, weekend trips from bangalore, cheap international trips from india, honeymoon packages, vietnam tour packages, bali packages'
		}
	}
	else if (what == 'flights') {
		response = {
			title: 'An Exclusive Community & Members Club For The Global Traveler',
			description: 'Discover the Best Travel Community & Membership Zone. Join the exclusive travel community for finding like minded buddies, getting unbeatable deals and sharing unforgettable experiences. Start your adventure today!',
			image: 'https://beatravelbuddy.com/view/assets/img/preview__flights.jpg',
			url: 'https://beatravelbuddy.com/flights/',
			keywords: 'flight, flights, flight booking, airfare, air tickets, cheap air tickets, flight tickets, flight ticket booking, lowest airfares, air flight booking, cheap flight ticket, cheap flights, air travel, travel buddy, travelbuddy, travelbuddy.com, domestic flight, best flights, flights near me, flights booking online, domestic flight booking, cheap domestic flights, book domestic flights, cheap flights near me, best cheap flights, online flight booking, flight deals, discount flights, cheap flight offers, flights today, last-minute flights, affordable flight booking, find cheap flights, domestic flight deals, compare flight prices, flight booking discounts, cheap one-way flights, best flight booking site, round-trip flights deals, cheap flights to Goa, domestic flights to New Delhi, book flights from New Delhi, domestic flights from New Delhi, last-minute flights to Mumbai, cheap flights from Mumbai, cheapest flights Mumbai to Goa, compare websites, find best flight deals Delhi to Bangalore, no hidden fees, last minute flight deals Chennai to Hyderabad under 3000, flight booking websites comparison for family trips, flexible flight tickets Delhi to Goa, easy cancellation, cheapest flights Bangalore to Kochi round trip, best flight booking site for senior citizen discounts, find lowest airfare Kolkata to Mumbai one way, student flight deals Chennai to Delhi, book connecting flights Delhi to Goa cheapest option, best flight booking site for international travel from India, top rated flight search websites for domestic flights India, alternative flight booking platforms no convenience fee, best flight booking app for price drop alerts India, flight search engine with price calendar India, compare flight prices across multiple airlines India, find cheap flights without creating account, flight booking site with best customer reviews India, reliable flight booking platform for last minute travel, best website to book cheap flights and hotels together, weekend getaways from Mumbai flight and hotel deals, budget backpacking trips India flights and hostels, solo traveler flight packages within India, best time to book flights for cheap deals India, how to find cheapest days to fly to [Destination], travel insurance for domestic flights India, flights to [Destination] with free baggage allowance, eco-friendly airlines operating domestic flights India, private jet charter flights within India, helicopter rides tourist attractions India, domestic flight deals from Delhi cheapest options, Bangalore to Goa flights lowest fares guaranteed, Hyderabad to Mumbai flights compare and save, cheap flights from Chennai to anywhere in India, Kolkata to Port Blair flights best time to book, international flight offers from Delhi under 50000, one way flights from Mumbai to Dubai under 10000, flights to Goa from major cities in India, cheap flights from Ahmedabad to popular destinations, find flights near me departing today, flight price tracker app offline mode India, best travel apps for finding red eye flights, book flights on mobile and get cashback offers, last minute flight deals app notifications only, compare flight prices on mobile data saver mode, cheap flights app with price prediction feature, flight booking app with secure payment gateway, best mobile app to manage flight bookings offline, find cheap flights on the go best travel apps, flight booking app with free cancellation options, best flight booking app for senior citizen discounts, find lowest airfare on mobile app one way, student flight deals on mobile app, book connecting flights on mobile app cheapest option, best flight booking app for international travel from India, top rated flight search app for domestic flights India, alternative flight booking app no convenience fee, best flight booking app for price drop alerts India, flight search engine app with price calendar India, compare flight prices across multiple airlines India, find cheap flights without creating account on mobile app, flight booking app with best customer reviews India, reliable flight booking app for last minute travel, best mobile app to book cheap flights and hotels together, weekend getaways from Mumbai flight and hotel deals on mobile app, budget backpacking trips India flights and hostels on mobile app, solo traveler flight packages within India on mobile app, best time to book flights for cheap deals India on mobile app, how to find cheapest days to fly to [Destination] on mobile app, travel insurance for domestic flights India on mobile app, flights to [Destination] with free baggage allowance on mobile app, eco-friendly airlines operating domestic flights India on mobile app, private jet charter flights within India on mobile app, helicopter rides tourist attractions India on mobile app, domestic flight deals from Delhi cheapest options on mobile app, Bangalore to Goa flights lowest fares guaranteed on mobile app, Hyderabad to Mumbai flights compare and save on mobile app, cheap flights from Chennai to anywhere in India on mobile app, Kolkata to Port Blair flights best time to book on mobile app, international flight offers from Delhi under 50000 on mobile app, one way flights from Mumbai to Dubai under 10000 on mobile app, flights to Goa from major cities in India on mobile app, cheap flights from Ahmedabad to popular destinations on mobile app, find flights near me departing today on mobile app, flight price tracker app offline mode India on mobile app, best travel apps for finding red eye flights on mobile app, book flights on mobile and get cashback offers on mobile app, last minute flight deals app notifications only on mobile app, compare flight prices on mobile data saver mode on mobile app, cheap flights app with price prediction feature on mobile app, flight booking app with secure payment gateway on mobile app, best mobile app to manage flight bookings offline on mobile app, find cheap flights on the go best travel apps on mobile app, flight booking app with free cancellation options on mobile app'
		}
	}
	else if (what == 'AI') {
		response = {
			title: 'Travel Buddy AI: Build Your Perfect Vacation Itinerary.',
			description: 'Travel Buddy AI is your smart, AI-powered trip planner for personalized, customizable vacations. Effortless itinerary builder, tailored recommendations. Be a Travel Buddy!',
			appVersion: appConstants.APPVERSION,
			pageUrl: 'https://beatravelbuddy.app.link/ai',
			keywords: 'AI trip planner, AI travel planning, personalized travel, custom travel itinerary, vacation planning, AI travel assistant, plan a trip, travel recommendations, AI-powered travel, trip customization, travel planning tool, Be A Travel Buddy, smart trip planner, itinerary builder',
			image: 'https://beatravelbuddy.com/view/assets/img/Ai-rhea.webp',
			url: 'https://beatravelbuddy.app.link/ai',
			keywords: 'AI trip planner, AI travel planning, personalized travel, custom travel itinerary, vacation planning, AI travel assistant, plan a trip, travel recommendations, AI-powered travel, trip customization, travel planning tool, Be A Travel Buddy, smart trip planner, itinerary builder'
		}
	}
	else if (what == 'post') {
		var postId = data;
		var postData = await dbConnectFile
			.getPostImageAndCaption(postId);
		if (postData) {
			if (postData.image) {
				response.image = postData.image;
			} else {
				response.image =
					'https://beatravelbuddy.com'
					+ '/view/assets/img/findBuddy.svg';
			}
			var seoDescription = postData.caption
				|| postData.description
				|| '';
			if (seoDescription.length > 160) {
				seoDescription =
					seoDescription.substring(0, 160)
					+ '...';
			}
			if (seoDescription) {
				response.description = seoDescription;
			}
			response.title = seoDescription
				? seoDescription.substring(0, 70)
				: 'Post on Travel Buddy';
			response.url =
				'https://beatravelbuddy.com/post/'
				+ postId;
		} else {
			response.image =
				'https://beatravelbuddy.com'
				+ '/view/assets/img/findBuddy.svg';
		}
	}
	else if (what == 'profile') {
		var userId = data;
		console.log('userId', userId);
		response.url = 'https://beatravelbuddy.com/profile/' + userId;
		var userProfileImg = await dbConnectFile.getUserProfileImg(userId);
		if (userProfileImg) {
			if (userProfileImg.includes('http')) {
				response.image = userProfileImg;
			}
			else {
				response.image = appConstants.imageBaseUrl + '/' + userProfileImg;
			}
			console.log('userProfileImgSEO', response.image);
		}
		else {
			response.image = 'https://beatravelbuddy.com/view/assets/img/findBuddy.svg';
		}
	}


	return response;
}


//Export the functions
module.exports = {
	seoFormatter: seoFormatter
}