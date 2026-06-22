/*
    name: managePayments
    description: generic function to handle initializing the razorpay and rendering the Razorpay window
    param:
        state: action to be performed such as "premiumInit", "openRazorpayWindow"
        data: object with the information required to perform any action
*/
function managePayments(state, data) {
    if (state == "premiumInit" || state == 'experienceInit' || state == 'premiumAiInit') {
        if (state == 'experienceInit') {
            //We are not actually using this, the price is getting validated from our backend
            bookingDetails = JSON.parse(localStorage.getItem('bookingDetails'));
            payload = {
                userId: manageUserProfile("read", "userId"),
                calendarSlotId: bookingDetails.bookingSlot,
                noOfTickets: bookingDetails.tickets,
                // selPrice: 5,
                selPrice: bookingDetails.finalAmount,
                currency: 'INR',
                source: 'experience',
                paymentFor: 'Become a Premium User'
            }
        }
        else if (state == 'premiumAiInit') {
            liveLocationInfo = JSON.parse(localStorage.getItem('liveLocationInfo'));
			currencyCode = liveLocationInfo  && liveLocationInfo.currency_code && liveLocationInfo.currency_code != '' ? liveLocationInfo.currency_code : 'INR';
			
            payload = {
                userId: manageUserProfile("read", "userId"),
                packageId: data.productId,
                //selPrice: parseFloat(data.amount).toFixed(2) * 100,
                currency: currencyCode,
                couponApplied: "",
                source: isMobile() ? 'mobileAiPremium' : 'webAiPremium',
                paymentFor: 'AI Itinerary'
            };
        }
        else {
            var liveLocationInfo = JSON.parse(localStorage.getItem('liveLocationInfo'));
			var currencyCode = liveLocationInfo  && liveLocationInfo.currency_code && liveLocationInfo.currency_code != '' ? liveLocationInfo.currency_code == 'INR' ? 'INR' : 'USD' : 'INR';
			
			var isCouponApplied = jQuery('#premmium_coupon').data('coupon');
			var couponInfo = "";
			if (isCouponApplied) {
				couponInfo = isCouponApplied.object[0].couponcode;
			}
			
            payload = {
                userId: manageUserProfile("read", "userId"),
                packageId: jQuery(".price-slider__card").attr("data-pack-id"),
                //selPrice: parseFloat(jQuery(".pricing-card.pricing-card-active").attr("data-price")) * 100,
                currency: 'INR',
                couponApplied: couponInfo,
                source: 'premium',
                paymentFor: 'Premium Booking',
                currencyCode: currencyCode
            };
		}
		console.log('payload', payload);

        jsInit("getOrderId", payload);
    }
    else if (state == "openRazorpayWindow") {
        console.log(data);
		if (isAndroid()) {
			
			var androidVersion = localStorage.getItem('androidVersion');
			console.log('Android Version: ' + androidVersion);
			if (androidVersion != undefined && (androidVersion == '9.0.6' || androidVersion == '9.0.7' || androidVersion == '9.0.8')) {
				// Intializing the Razorpay payment from Android app
				var userName = manageUserProfile('read', 'name');
				userName = userName ? userName : '';
				var userEmail = manageUserProfile('read', 'email');
				userEmail = userEmail ? userEmail : '';
				var userPhone = manageUserProfile('read', 'phoneNumber');
				userPhone = userPhone ? userPhone : '';
				var payDescription = data.notes && data.notes.source == 'premium' ? 'Payment for your Membership Club' : 'Payment for your Flight Booking';
				data.userName = userName;
				data.userEmail = userEmail;
				data.userPhone = userPhone;
				data.payDescription = payDescription;
				globalDataForAndroid = data;
				console.log(JSON.stringify(globalDataForAndroid));
				Android.startRazorPayment(JSON.stringify(data));
				localStorage.setItem('razorPayTmpData', JSON.stringify(data));
				return;
			}
        }
        

        localStorage.setItem('razorPayTmpData', JSON.stringify(data));
        onCancel = function (e, data) {
            currData = JSON.parse(localStorage.getItem('razorPayTmpData'));
            localStorage.removeItem('razorPayTmpData');

            payload = {};
            if (currData.notes.source == 'premium') {
                payload.orderType = 'premium';
                payload.selectedOption = currData.notes.packageId;
                fbEvent('premium-pay-cancelled', data);
				webAnalytics('premium_purchase_cancelled');
				if (manageUserProfile('read', 'isVerified') != true) {
					var getUserDetails = manageUserProfile('read', 'all');
					if (getUserDetails && getUserDetails.phoneNumber && getUserDetails.dialCode && getUserDetails.phoneNumber.length > 0 && getUserDetails.dialCode.length > 0) {
						// Needs Activation + New creative
						// jsInit('whatsAppNewQuickReplies', { phoneNumber: getUserDetails.phoneNumber, dialCode: getUserDetails.dialCode, templateName: 'findbuddy_3x_faster', imgUrl: 'https://firebasestorage.googleapis.com/v0/b/travelbuddy-174317.appspot.com/o/Feed%20Card%20Images%2Fself_made-ai-subs-one.jpg?alt=media&token=c5d7a8a8-c8fd-432f-94cb-3f62281197a8', userFullName: getUserDetails.name });
						
					}
					
					createAndShowPopup('https://imagedelivery.net/yrdfkc9LfLnd6N_GsZsD0w/bbbd97ca-3214-4e95-9e47-eafbc5f2d500/feedhd', 'popup-premium');
				}
            }
            else if (currData.notes.source == 'tboFlights'){
                payload.orderType = 'flights';
                payload.selectedOption = 'Booking canceled';
                
                // For Showing only the continue button in the footer so that user can restart with the booking
                //updateFooterContinue('reviewPaxDetails', '', '', 'Continue');
                jQuery('.flights__footer-continue').filter('.ssr').hide();
                fbEvent('flights-pay-cancelled', data);

            }
            else {
                payload.orderType = 'experience';
                payload.selectedOption = currData.notes.calendarSlotId;
                fbEvent('experience-pay-cancelled', data);
			}
			

            try {

                jsInit("addCancelledOrder", payload);
			}
			
			
            
            catch (error) {
                console.log(error.message);
            }

            console.log(currData.notes.source);
        }

        var options = {
            key: RAZORPAY_KEY,
            //amount: 1, //data.amount,
            currency: data.currency,
            name: data.notes.paymentFor,
            order_id: data.id, //Order ID
            description: "Auth txn for " + data.id,
            handler: function (response) {
                console.log(response);
                paymentId = response.razorpay_payment_id;
                jsInit("getPaymentDetails", paymentId);
            },
            modal: { escape: true, ondismiss: onCancel }
        };

        var rzp = new Razorpay(options);
        rzp.open();
        jQuery('.global__loading').remove();
    }
    else if (state == "onPaymentResponse") {
		console.log(data);
		console.log(JSON.stringify(data));
        

        if (data.notes.source == 'experience') {
            manageExperienceBookings('confirmBooking', data);
            
        }
        else if (data.notes.source == 'mobileAiPremium' || data.notes.source == 'webAiPremium') {
            // manageUserProfile('verifyUser', {});
            console.log(data);
            // If isMobile() is true, then isAndroid() or isIOS() will be true or deviceType will be web
            deviceType = isMobile() ? isAndroid() ? 'android': 'ios' : 'web';
            jsInit('buyAiPackage', { "package": data.notes.packageId, "orderId": data.order_id, "invoiceId": data.id, "source": deviceType });
        }
        else if (data.notes.source == 'tboFlights') {
            // manageUserProfile('verifyUser', {});
            console.log(data);
            // If isMobile() is true, then isAndroid() or isIOS() will be true or deviceType will be web
            deviceType = isMobile() ? isAndroid() ? 'android': 'ios' : 'web';
            callBookOrTicketApi('book', data);
            jQuery('#flights__footer').hide();
        }
        else {
            // To retrieve the stored UTM parameters
            let storedUTMParams = JSON.parse(localStorage.getItem('utmParams'));
            console.log(storedUTMParams);
            paymentDetails = {
                "purchaseResp": data,
                "source": "Razorpay",
                "utm_source": storedUTMParams && storedUTMParams.utm_source ? storedUTMParams.utm_source : "",
                "utm_medium": storedUTMParams && storedUTMParams.utm_medium ? storedUTMParams.utm_medium : "",
                "utm_campaign": storedUTMParams && storedUTMParams.utm_campaign ? storedUTMParams.utm_campaign : "",
                "utm_term": storedUTMParams && storedUTMParams.utm_term ? storedUTMParams.utm_term : "",
                "utm_content": storedUTMParams && storedUTMParams.utm_content ? storedUTMParams.utm_content : "",
                "utm_referrer": storedUTMParams && storedUTMParams.utm_referrer ? storedUTMParams.utm_referrer : "",
                "utm_landing_page": storedUTMParams && storedUTMParams.utm_landing_page ? storedUTMParams.utm_landing_page : "",
                "param1": storedUTMParams && storedUTMParams.param1 ? storedUTMParams.param1 : "",
                "param2": storedUTMParams && storedUTMParams.param2 ? storedUTMParams.param2 : "",
            };
            console.log(JSON.stringify(paymentDetails));

			jsInit("givePremium", paymentDetails);
			
			if (isAndroid()) {
				try {
					Android.logFacebookEventFromJS("premium_purchased_mobile", null);
					captureFIAMEvents('premium_purchased_mobile', 'Premium Purchased');
				}
				catch (error) {
					console.log(error);
				}
			}
			else {
				fbEvent('premium-purchase-web', paymentDetails);
			}
			
			var getUserDetails = manageUserProfile('read', 'all');
			
			var templateName = 'sys_premium_welcome';
			var imgUrl = 'https://interaktprodmediastorage.blob.core.windows.net/mediaprodstoragecontainer/42919b88-09d8-41b6-a2ee-b03eaeb7e285/message_template_media/WtiA2IlMidoh/Premium%20Plan.jpg?se=2030-09-19T12%3A47%3A31Z&sp=rt&sv=2019-12-12&sr=b&sig=IkQY5Mtg0LzTctn9hbHR99k/bk/58jTxDk4kE3nZr/o%3D';
			var packageId = paymentDetails.purchaseResp.notes.packageId;
			
			// Send WhatsApp message to the user
			if (getUserDetails && getUserDetails.phoneNumber && getUserDetails.dialCode && getUserDetails.phoneNumber.length > 0 && getUserDetails.dialCode.length > 0) {
				
				
				if (packageId == 'tbd_elite') {
					templateName = 'sys_luxe_welcome';
				}
				else if (packageId == 'tbd_traveler_one_month') {
					templateName = 'sys_saver_welcome';
				}
				
				jsInit('whatsAppNewQuickReplies', { phoneNumber: getUserDetails.phoneNumber, dialCode: getUserDetails.dialCode, templateName: templateName, imgUrl: imgUrl, userFullName: getUserDetails.name  });
			}
			// Send Email message to the user if the user is a premium user
			/*else if (getUserDetails && getUserDetails.userEmail && getUserDetails.userEmail != '') {
				if (packageId == 'tbd_elite') {
					templateName = 'sys_luxe_welcome';
				}
				
			}*/
        }
        
    }
    else if (state == "onVerifyUser") {
		console.log("onVerifyUser Data: " + data);
		console.log('onVerifyUser', JSON.stringify(data));
        if (data.responseCode !== 200) {
            toast(data.errorMessage)
        }
		else {
			toast(data.object.message);
			manageUserProfile('clean');
            // // renderPremium('renderSubscription', data);
            // //jQuery('#main__premium-box').addClass('active');
            jsInit('getSubscriptionInfo', {});
        }
    }
}


function premiumFromApps(data) {
    console.log(data);
    if (isIOS()) {
        payload = {};
        payload['purchaseResp'] = JSON.stringify(data);
        payload['source'] = 'Apple';
    }
    else if (isAndroid()) {
		payload = data;
		try {
			Android.logFacebookEventFromJS("premium_purchased_mobile", null);
			captureFIAMEvents('premium_purchased_mobile', 'Premium Purchased');
		}
		catch (error) {
			console.log(error);
		}
    }

    console.log(payload);
    jsInit("givePremium", payload);
    fbEvent('premium-purchase-mobile', paymentDetails);
}