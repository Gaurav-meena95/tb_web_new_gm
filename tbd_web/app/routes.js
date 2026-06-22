//Description: This file contains all the routes for the application

// Import the modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
const pug = require('pug');
const crypto = require('crypto');
const { validateToken } = require('./auth/commands/jwtValidation');
const appConstants = require("./constants");
const seqConfig = require("./config/sequelize_config");
const { QueryTypes } = require('sequelize');
const readSeqInstance = seqConfig.read_sequelize;
const seoFormatter = require('./seo-formatter');
const Sentry = require("@sentry/node");
const writeDataToGoogleSheet = require('./utility/write_to_google_sheet');
const { findPhoneNumberInSheet, getSheetNames } = require('./utility/read_from_google_sheet');
const updateGoogleSheetCell = require('./utility/update_google_sheet');
const dbConnect = require('./db-connect');
//const initializeSentry = require('./sentry');
const axios = require('axios');
const whatsAppSend = require("./send-whatsapp-new");

function getBearerToken(req) {
    return req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.substring(7)
        : req.headers.authorization;
}

//Body parser
const bodyParser = require('body-parser');

// Create an express application
const app = express();

//Call the api-helper.js file
const bem = require('./bem.js');
const flightBookingPaymentIntent = require('./services/flight_booking_payment_intent');
const razorpayWebhookHandler = require('./razorpay-webhook-handler');
const razorPayHelper = require('./razorpay-helper');

// Configure CORS
const ALLOWED_ORIGINS_EXACT = [
    'https://tbd-flutter.pages.dev',
];

function isAllowedOrigin(origin) {
    if (!origin) return true; // server-to-server / same-origin requests
    // Allow all subdomains of beatravelbuddy.com (http in dev, https in prod)
    if (/^https?:\/\/([a-z0-9-]+\.)*beatravelbuddy\.com$/.test(origin)) return true;
    if (ALLOWED_ORIGINS_EXACT.includes(origin)) return true;
    // Allow localhost in non-production environments
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
    return false;
}

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin', 'X-Requested-With', 'Content-Type', 'Accept',
        'Authorization', 'X-API-Key', 'userid', 'token', 'userId', 'plainUserId',
        'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'
    ]
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//INITIALIZING SENTRY
//initializeSentry(process.env.SENTRY_DSN);

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
        // Automatically instrument Node.js libraries and frameworks
        ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});

appConstants.sentryObj = Sentry;

// RequestHandler creates a separate execution context, so that all
// transactions/spans/breadcrumbs are isolated across requests
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Maintenance mode middleware - must be after Sentry handlers and before static files
const maintenanceMiddleware = require('./middleware/maintenance');
app.use(maintenanceMiddleware);

// Razorpay webhooks (raw body required for signature verification)
app.post(
    '/webhooks/razorpay',
    bodyParser.raw({ type: 'application/json' }),
    (req, res) => {
        razorpayWebhookHandler.handle(req, res);
    },
);

// parse application/json
// app.use(bodyParser.json())

// Serve static files for bookings
app.use('/bookings', express.static(path.join(__dirname, '../view/bookings')));

// Serve static files for view assets (JS, CSS, images, etc.)
app.use('/view', express.static(path.join(__dirname, '../view')));

// Create a route for the root of the application
app.get('/', async (_req, res) => {
    /*let isAppleDevice = false;
    // Comment for showing the Home Page on Apps
	
    // Check if it has ?app=ios
    if (_req.query.app === 'ios') {
        isAppleDevice = true;
    }
    // Uncomment for showing the Home Page on Apps
    /*if (_req.query.app === 'android' || _req.query.app === 'ios') {
        res.sendFile(path.join(__dirname, '../view/homePage.html'));
        return;
    }*/
    /*seo = await seoFormatter.seoFormatter('community');
    res.render(path.join(__dirname, '../view/index.pug'), { isAppleDevice: isAppleDevice,title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/' });*/
    res.redirect('https://trips.beatravelbuddy.com/');
});

app.get('/firebase-config', (req, res) => {
    const firebaseConfig = {
        apiKey: "AIzaSyBnKtZnePCqVLbr6jOUr4_Saf3iNmsZR-s",
        authDomain: "travelbuddy-174317.firebaseapp.com",
        databaseURL: "https://tbd-prod-174317-b933e.asia-southeast1.firebasedatabase.app/",
        projectId: "travelbuddy-174317",
        storageBucket: "travelbuddy-174317.appspot.com",
        messagingSenderId: "9959459076",
        appId: "1:9959459076:web:c4417f188991113b37a851",
        measurementId: "G-PXBR867EGP"
    };
    res.json(firebaseConfig);
});

// Flutter app config for dynamic image base URL.
// shouldRefetch controls whether app should hit this endpoint again.
app.get('/api/config/flutter-base-url', (_req, res) => {
    const overrideMediaBase =
        process.env.FLUTTER_MEDIA_SHOULD_OVERRIDE_URL === 'true';
    const baseUrl = overrideMediaBase
        ? 'https://api.beatravelbuddy.com/api/media'
        : process.env.FLUTTER_IMAGE_BASE_URL ||
        'https://d1hphxyq85xv5h.cloudfront.net';
    const shouldApplyTransforms =
        process.env.FLUTTER_MEDIA_SHOULD_APPLY_TRANSFORMS !== 'false';

    res.json({
        success: true,
        data: {
            baseUrl,
            shouldRefetch:
                process.env.FLUTTER_IMAGE_BASE_URL_SHOULD_REFETCH === 'true',
            shouldApplyFilters:
                process.env.FLUTTER_IMAGE_URL_APPLY_FILTERS === 'true',
            shouldApplyTransforms,
        },
    });
});

// Lead Gen-Dom-Rajasthan
app.get('/rajasthan/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-dom-obfuscated.html'));
});

// Lead Gen-Intl-Dubai
app.get('/dubai/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-intl-obfuscated.html'));
});

// Lead Gen-Intl-thailand
app.get('/thailand/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-intl-thai-obfuscated.html'));
});

// Lead Gen-Intl-srilanka
app.get('/srilanka/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-intl-sri-obfuscated.html'));
});

// Lead Gen-Intl-bali
app.get('/bali/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-intl-bali-obfuscated.html'));
});

// Lead Gen-Dom-kerela
app.get('/kerela/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-dom-ker-obfuscated.html'));
});

// Lead Gen-Intl-Maldives
app.get('/maldives/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-intl-mald-obfuscated.html'));
});

// Lead Gen-Intl-Maldives
app.get('/kashmir/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-dom-kashmir-obfuscated.html'));
});

// Lead Gen-Intl-Baku
app.get('/baku/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-intl-baku.html'));
});

// Lead Gen-Intl-Baku
app.get('/newFeed', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/edited_new_tb.html'));
});


app.get('/homePage', async (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/homePage.html'));
});

app.get('/tb-home-figma', async (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/tb-home-figma.html'));
});


// New Home Page
app.get('/home', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('homePage');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url });
});

app.post('/write-to-sheet', async (req, res) => {
    const { googleSheetId, data, sheetName } = req.body;

    try {
        await writeDataToGoogleSheet(googleSheetId, data, `${sheetName}!A2`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error writing to Google Sheet:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Luxe Eligibility Check API
app.post('/api/luxe/check-eligibility', async (req, res) => {
    const { phoneNumber, dialCode } = req.body;

    if (!phoneNumber || !dialCode) {
        return res.status(400).json({
            success: false,
            message: 'Phone number and dial code are required'
        });
    }

    try {
        // Combine dial code and phone number
        const fullPhoneNumber = dialCode + phoneNumber;

        // Google Sheet ID: 19c32pH7iME-AgpozV4bvdzanoy_4L7I9dbA8Q02dMVg
        const googleSheetId = '19c32pH7iME-AgpozV4bvdzanoy_4L7I9dbA8Q02dMVg';
        const sheetName = 'Customers';

        // Check if phone number exists in column C
        const result = await findPhoneNumberInSheet(
            googleSheetId,
            fullPhoneNumber,
            sheetName,
            'C'
        );

        if (result && result.rowIndex) {
            // Phone number found - return success with username (client will handle Firebase OTP)
            res.json({
                success: true,
                message: 'Phone number found. OTP will be sent.',
                phoneNumber: fullPhoneNumber,
                username: result.username || null
            });
        } else {
            // Phone number not found
            res.status(404).json({
                success: false,
                message: 'Phone number not found in our records'
            });
        }
    } catch (error) {
        console.error('Error checking eligibility:', error);

        // If it's a 404 error, provide helpful message about permissions
        if (error.code === 404 || error.status === 404) {
            // Try to get sheet names to help debug
            try {
                const sheetNames = await getSheetNames(googleSheetId);
                console.log('Available sheet names:', sheetNames.map(s => s.title));
            } catch (debugError) {
                console.error('Could not retrieve sheet names:', debugError);
            }

            return res.status(404).json({
                success: false,
                message: 'Google Sheet not found or access denied. Please ensure the service account has been shared with the Google Sheet.',
                hint: 'Share the sheet with: firebase-adminsdk-26dea@travelbuddy-174317.iam.gserviceaccount.com'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Error checking eligibility'
        });
    }
});

// Luxe Enquiry Submission API
app.post('/api/luxe/submit-enquiry', async (req, res) => {
    const { formData, dataArray } = req.body;

    if (!formData || !dataArray) {
        return res.status(400).json({
            success: false,
            message: 'Form data is required'
        });
    }

    try {
        // Google Sheet ID: 19c32pH7iME-AgpozV4bvdzanoy_4L7I9dbA8Q02dMVg
        const googleSheetId = '19c32pH7iME-AgpozV4bvdzanoy_4L7I9dbA8Q02dMVg';
        const sheetName = 'Enquires';

        // Write data to Google Sheet
        await writeDataToGoogleSheet(googleSheetId, dataArray, `${sheetName}!A2`);
        console.log('Enquiry data saved to Google Sheet successfully');

        res.json({
            success: true,
            message: 'Enquiry submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting enquiry:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error submitting enquiry'
        });
    }
});

// Luxe OTP Verification API
app.post('/api/luxe/verify-otp', async (req, res) => {
    const { phoneNumber, dialCode } = req.body;

    if (!phoneNumber || !dialCode) {
        return res.status(400).json({
            success: false,
            message: 'Phone number and dial code are required'
        });
    }

    try {
        // Combine dial code and phone number
        const fullPhoneNumber = dialCode + phoneNumber;

        // Google Sheet ID: 19c32pH7iME-AgpozV4bvdzanoy_4L7I9dbA8Q02dMVg
        const googleSheetId = '19c32pH7iME-AgpozV4bvdzanoy_4L7I9dbA8Q02dMVg';
        const sheetName = 'Customers';

        // Find the row with this phone number
        const result = await findPhoneNumberInSheet(
            googleSheetId,
            fullPhoneNumber,
            sheetName,
            'C'
        );

        if (result && result.rowIndex) {
            // Update column D with "true" flag
            await updateGoogleSheetCell(
                googleSheetId,
                sheetName,
                result.rowIndex,
                'D',
                'true'
            );

            res.json({
                success: true,
                message: 'Credits added successfully',
                credits: 5000,
                username: result.username || null
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Phone number not found'
            });
        }
    } catch (error) {
        console.error('Error verifying OTP and updating sheet:', error);

        // If it's a 404 error, provide helpful message about permissions
        if (error.code === 404 || error.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Google Sheet not found or access denied. Please ensure the service account has been shared with the Google Sheet.',
                hint: 'Share the sheet with: firebase-adminsdk-26dea@travelbuddy-174317.iam.gserviceaccount.com'
            });
        }

        // If it's a 403 error, the service account doesn't have write permissions
        if (error.code === 403 || error.status === 403) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied. The service account needs Editor permissions to update the sheet.',
                hint: 'Please share the Google Sheet with Editor permissions to: firebase-adminsdk-26dea@travelbuddy-174317.iam.gserviceaccount.com'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Error updating credits'
        });
    }
});

app.get('/flights', async (_req, res) => {
    let isAppleDevice = false;
    // Check if it has ?app=ios
    if (_req.query.app === 'ios') {
        isAppleDevice = true;
    }
    seo = await seoFormatter.seoFormatter('flights');
    res.render(path.join(__dirname, '../view/index.pug'), { isAppleDevice: isAppleDevice, title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/' });
});

app.get('/flights-search', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('flights');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/flights' });
});

// app.get('/hotels', async (_req, res) => {
//     seo = await seoFormatter.seoFormatter('flights');
//     res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/flights' });
// });



app.get('/experiences', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('experiences');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/experiences' });
});

// Create a route for single experience pages
app.get('/experiences/booking-summary', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('experiences');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/experiences' });
});

// Create a route for single experience pages
app.get('/experiences/:experienceId', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('experienceId', _req.params.experienceId);
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/experiences/' + _req.params.experienceId });
});

// Create a route for single Group Trip pages
app.get('/group-trips/:groupTripsId', async (_req, res) => {

    var length = _req.params.groupTripsId.split('-').length;
    var groupTripsId = _req.params.groupTripsId.split('-')[length - 1];

    seo = await seoFormatter.seoFormatter('groupTripsId', groupTripsId);
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/experiences/' + _req.params.groupTripsId });
});

// Create a route for single Group Trip pages
app.get('/packages/:groupTripsId', async (_req, res) => {

    var length = _req.params.groupTripsId.split('-').length;
    var groupTripsId = _req.params.groupTripsId.split('-')[length - 1];

    seo = await seoFormatter.seoFormatter('groupTripsId', groupTripsId);
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/experiences/' + _req.params.groupTripsId });
});

// Route for Categories
app.get('/experiences/category/:experienceCategory', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('experienceCategory', _req.params.experienceCategory);
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/experiences/category' + _req.params.experienceCategory });
});

// Create a route for single experience pages
app.get('/contact-us', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('contact', _req.params.experienceId);
    res.render(path.join(__dirname, '../view/index.pug'), { title: 'Travel Buddy - Travel Social Commerce', description: 'Never feel alone when you travel. Join travel buddy today to find travel meetups around you, travel partners, travel services & local experiences.', appVersion: appConstants.APPVERSION, pageUrl: seo.url });
});

// Create a route for Dashboard page
app.get('/dashboard', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('dashboard');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/' });
});

// Cancelation policy
app.get('/cancellation-policy/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/cancellation-policy.html'));
});

// Refund policy
app.get('/refund-policy/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/refund-policy.html'));
});

// Cancelation policy
app.get('/experience-faq/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/experience-faq.html'));
});

// About Us
app.get('/about-us/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/about-us.html'));
});

// Lead Gen-Dom-Rajasthan
app.get('/rajasthan/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-dom-obfuscated.html'));
});

// Lead Gen-Intl-Dubai
app.get('/dubai/tour-packages', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/leadgen-intl-obfuscated.html'));
});



app.post('/write-to-sheet', async (req, res) => {
    const { googleSheetId, data, sheetName } = req.body;

    try {
        await writeDataToGoogleSheet(googleSheetId, data, `${sheetName}!A2`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error writing to Google Sheet:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a route for Premium page
app.get('/premium', async (req, res) => {

    let isAppleDevice = false;
    // Check if it has ?app=ios
    if (req.query.app === 'ios') {
        isAppleDevice = true;
    }
    seo = await seoFormatter.seoFormatter('premium');
    res.render(path.join(__dirname, '../view/index.pug'), { isAppleDevice: isAppleDevice, title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/' });
});

// Create a route for Tb-Mini Premium page
app.get('/premium-luxe', async (req, res) => {
    seo = await seoFormatter.seoFormatter('premium-mini');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/premium' });
});

// Create a route for Tb-Pro Premium page
app.get('/premium-pro', async (req, res) => {
    seo = await seoFormatter.seoFormatter('premium');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/premium' });
});



// Create a route for Tb-Super Premium page
app.get('/premium-super', async (req, res) => {
    seo = await seoFormatter.seoFormatter('premium');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/premium' });
});

// Create a route for Community page
app.get('/community', async (req, res) => {

    let isAppleDevice = false;
    // Check if it has ?app=ios
    if (req.query.app === 'ios') {
        isAppleDevice = true;
    }
    seo = await seoFormatter.seoFormatter('community');
    res.render(path.join(__dirname, '../view/index.pug'), { isAppleDevice: isAppleDevice, title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/' });
});

// Create a route for Search page
app.get('/search', async (req, res) => {
    seo = await seoFormatter.seoFormatter('search');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/search' });
});

// Location feed route for SEO previews used by shared deep links
app.get('/location-feed/:location', async (req, res) => {
    const rawLocation = req.params.location || '';
    seo = await seoFormatter.seoFormatter('location-feed', rawLocation);
    res.render(
        path.join(__dirname, '../view/index.pug'),
        {
            title: seo.title,
            keywords: seo.keywords,
            appVersion: appConstants.APPVERSION,
            description: seo.description,
            metaImage: seo.image,
            pageUrl: seo.url,
            canonical: seo.url,
        },
    );
});

// Filtered feed route for deep links - generic SEO metadata
app.get('/filtered-feed', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('findbuddy');
    res.render(
        path.join(__dirname, '../view/index.pug'),
        {
            title: seo.title,
            keywords: seo.keywords,
            appVersion: appConstants.APPVERSION,
            description: seo.description,
            metaImage: seo.image,
            pageUrl: 'https://beatravelbuddy.com/filtered-feed',
            canonical: 'https://beatravelbuddy.com/filtered-feed',
        },
    );
});


// Flights & Hotels
app.get('/listings', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('listings');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/listings' });
});

// Add Find Post
app.get('/add-find-post', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('add-find-post');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url });
});
// Add Share Post
app.get('/add-share-post', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('add-share-post');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url });
});
// Add Ask Post
app.get('/add-ask-post', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('add-ask-post');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url });
});

//404 page
app.get('/404', async (_req, res) => {
    //Render the 404 page
    seo = await seoFormatter.seoFormatter('404');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url });
});

app.get('/firebase-test', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/firebase-test.html'));
});

app.get('/.well-known/assetlinks.json', (_req, res) => {
    res.sendFile(path.join(__dirname, '../.well-known/assetlinks.json'));
});

app.get('/.well-known/apple-app-site-association', (_req, res) => {
    res.type('application/json');
    res.sendFile(
        path.join(__dirname, '../.well-known/apple-app-site-association'),
    );
});

// privacy policy
app.get('/privacy-policy', (_req, res) => {
    res.sendFile(path.join(__dirname, '../privacy-policy.html'));
});

//terms-and-conditions.html
app.get('/terms-and-conditions', (_req, res) => {
    res.sendFile(path.join(__dirname, '../terms-and-conditions.html'));
});

//faq-vtp.html
app.get('/faq-vtp', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/faq-vtp.html'));
});

app.get('/faq-vt', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/faq-vt.html'));
});

app.post('/live-location-details', async (req, res) => {
    res.send(await bem.fetchLiveLocationDetails(req));
});

//Create a master js-init route to accept all frontend requests and repurpose them to the appropriate functions for processing
app.post('/js-init', bodyParser.json(), (req, res) => {
    // Validate the request body
    // If invalid, return 400 - Bad request
    if (!req.body) {
        return res.status(400).send('Request body is missing');
    }

    if (req.headers.authorization) {
        authInfo = req.headers.authorization.split(" ");
        try {
            appConstants.LOGGED_IN_USER_ID = validateToken(req.headers);
            if (!req.body.data) {
                req.body.data = {};
            }
            req.body.data.plainUserId = appConstants.LOGGED_IN_USER_ID;
        }
        catch (error) {
            console.log(error);
        }
    }


    //Async fetch the posts
    async function jsInit(data) {
        //Call the fetchPosts function
        response = await bem.jsInit(data);
        return response;
    }

    //Call the fetchPosts function
    jsInit(req.body).then((response) => {
        res.send(response);
    });

});


app.post('/upload', bodyParser.json(), (req, res) => {
    console.log('req.body');
    try {
        var headers = req.headers;

        //Async fetch the posts
        async function jsUpload(fields, files, headers) {
            //Call the fetchPosts function
            response = await bem.jsUpload(fields, files, headers);
            console.log(response);
            return response;
        }

        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (!files) {
                return res.status(400).send('Request files are missing');
            }

            jsUpload(fields, files, headers).then((response) => {
                res.send(response);
            });
        });
    } catch (error) {
        console.log(error);
    }
});

app.get('/selfie-verification', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/selfie-verification.html'));
});

//Luxe Landing Page
// app.get('/luxe', (_req, res) => {
//     res.sendFile(path.join(__dirname, '../view/luxe-landing.html'));
// });

//Luxe Landing Page - 2
app.get('/luxe', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/luxe-burgundy.html'));
});

// Maintenance Page - Test Route
app.get('/maintenance-test', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/maintenance.html'));
});


app.post('/selfie-verification', (req, res) => {
    console.log('Selfie verification endpoint hit');
    try {
        var headers = req.headers;
        async function jsSelfieVerification(fields, files, headers) {
            console.log('jsSelfieVerification called with fields:', fields);
            // Set the reason for selfie verification
            fields.reason = 'selfieVerification';
            console.log('Reason set to:', fields.reason);
            const response = await bem.jsUpload(fields, files, headers);
            return response;
        }
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (!files) {
                return res.status(400).send('Request files are missing');
            }
            jsSelfieVerification(fields, files, headers).then((response) => {
                res.send(response);
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
});

// For Login Page
app.get('/login', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('login');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: 'Never feel alone when you travel. Join travel buddy today to find travel meetups around you, travel partners, travel services & local experiences.', metaImage: seo.image, pageUrl: seo.url });
});

// For the Merged File
app.get('/view/assets/js/merged', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/merged.js'));
});

// app.json
app.get('/app.json', (_req, res) => {
    res.sendFile(path.join(__dirname, '../app.json'));
});

//Chat.js
app.get('/view/assets/js/chat.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/chat.js'));
});


//ServiceWorker.js
app.get('/serviceworker.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../serviceworker.js'));
});

//Manifest
app.get('/manifest.json', (_req, res) => {
    res.sendFile(path.join(__dirname, '../manifest.json'));
});

// app.json
app.get('/ads.txt', (_req, res) => {
    res.sendFile(path.join(__dirname, '../ads.txt'));
});

// app-ads.txt
app.get('/app-ads.txt', (_req, res) => {
    res.sendFile(path.join(__dirname, '../app-ads.txt'));
});

//Create routes for all assets files
app.get('/view/assets/css/style.css', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/css/style.css'));
});

/*app.get('/view/assets/css/filters.css', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/css/filters.css'));
});*/

app.get('/view/assets/css/chat.css', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/css/chat.css'));
});

app.get('/view/assets/plugins/pintura-video/pinturavideo.css', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/plugins/pintura-video/pinturavideo.css'));
});

app.get('/view/assets/css/filepond', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/css/filepond.css'));
});

app.get('/node_modules/@pqina/pintura/pintura', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/@pqina/pintura/pintura.css'));
});

app.get('/node_modules/@pqina/pintura/pintura', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/@pqina/pintura-video/pinturavideo.css'));
});

//Create global routes for all js files inside the node_modules firebase folder
app.get('/firebase/firebase-app-compat.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/firebase/firebase-app-compat.js'));
});

app.get('/firebase/firebase-analytics-compat.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/firebase/firebase-analytics-compat.js'));
});

app.get('/firebase/firebase-auth-compat.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/firebase/firebase-auth-compat.js'));
});

app.get('/view/assets/js/main', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/main.js'));
});

app.get('/view/assets/js/render', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/render.js'));
});

app.get('/view/assets/js/helper', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/helper.js'));
});

app.get('/view/assets/js/const', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/const.js'));
});

app.get('/view/assets/js/actions', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/actions.js'));
});

app.get('/view/assets/js/bem', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/bem.js'));
});

app.get('/view/assets/js/firebase', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/firebase.js'));
});

app.get('/firebase-messaging-sw.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../firebase-messaging-sw.js'));
});

app.get('/view/assets/js/validator', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/validator.js'));
});

app.get('/view/assets/js/transaction', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/transaction.js'));
});

app.get('/view/assets/js/google-tags', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/google-tags.js'));
});

app.get('/view/assets/js/jquery-p2r', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/jquery-p2r.js'));
});

app.get('/node_modules/filepond/dist/filepond.min.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/filepond/dist/filepond.min.js'));
});

app.get('/node_modules/jquery-filepond/filepond.jquery.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/jquery-filepond/filepond.jquery.js'));
});

app.get('/node_modules/filepond-plugin-file-poster/dist/filepond-plugin-file-poster.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/filepond-plugin-file-poster/dist/filepond-plugin-file-poster.js'));
});

app.get('/node_modules/@pqina/pintura/pintura-iife.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/@pqina/pintura/pintura-iife.js'));
});

app.get('/node_modules/@pqina/jquery-pintura/dist/useEditorWithJQuery-iife.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/@pqina/jquery-pintura/dist/useEditorWithJQuery-iife.js'));
});

app.get('/node_modules/@pqina/filepond-plugin-image-editor/dist/FilePondPluginImageEditor.iife.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/@pqina/filepond-plugin-image-editor/dist/FilePondPluginImageEditor.iife.js'));
});

app.get('/node_modules/filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.min.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.min.js'));
});

app.get('/view/assets/js/livequery.jquery.min', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/livequery.jquery.min.js'));
});

app.get('/view/assets/js/svg-icons', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/assets/js/svg-icons.js'));
});

app.get('/view/manifest', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/manifest.json'));
});

//Create routes for the font files
app.get('/view/assets/fonts/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../' + req.originalUrl));
});

//Create routes for all items in the images folder
app.get('/view/assets/img/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../' + req.originalUrl));
});

//Create routes for all items in the audio folder
app.get('/view/assets/audio/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../' + req.originalUrl));
});

//Create routes for all items in the plugins folder
app.get('/view/assets/plugins/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../' + req.originalUrl));
});


//Section to create new routes
//Create a for /location route and anything after it
app.get('/location/*', async (req, res) => {
    seo = await seoFormatter.seoFormatter('location');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url });
});

//Create a for /chat route and anything after it

app.get('/chat', async (req, res) => {
    seo = await seoFormatter.seoFormatter('chat');
    res.render(path.join(__dirname, '../view/index.pug'), { title: 'Travel Buddy - Travel Social Commerce', description: 'Never feel alone when you travel. Join travel buddy today to find travel meetups around you, travel partners, travel services & local experiences.', appVersion: appConstants.APPVERSION, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/' });
});

app.get('/chat/*', async (req, res) => {
    seo = await seoFormatter.seoFormatter('chat');
    res.render(path.join(__dirname, '../view/index.pug'), { title: 'Travel Buddy - Travel Social Commerce', description: 'Never feel alone when you travel. Join travel buddy today to find travel meetups around you, travel partners, travel services & local experiences.', appVersion: appConstants.APPVERSION, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/' });
});


app.get('/view/assets/aboutUs/*', (_req, res) => {
    const requestedFile = _req.params[0];
    res.sendFile(path.join(__dirname, `../view/assets/aboutUs/${requestedFile}`));
});

app.get('/view/assets/aboutUs/css/*', (_req, res) => {
    const requestedFile = _req.params[0];
    res.sendFile(path.join(__dirname, `../view/assets/aboutUs/css/${requestedFile}`));
});

app.get('/view/assets/aboutUs/js/*', (_req, res) => {
    const requestedFile = _req.params[0];
    res.sendFile(path.join(__dirname, `../view/assets/aboutUs/js/${requestedFile}`));
});

app.get('/view/assets/aboutUs/Images/*', (_req, res) => {
    const requestedFile = _req.params[0];
    res.sendFile(path.join(__dirname, `../view/assets/aboutUs/Images/${requestedFile}`));
});

app.get('/view/assets/aboutUs/js/javascript-lib/*', (_req, res) => {
    const requestedFile = _req.params[0];
    res.sendFile(path.join(__dirname, `../view/assets/aboutUs/js/javascript-lib/${requestedFile}`));
});

app.get('/node_modules/intro.js/intro.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/intro.js/intro.js'));
});

app.get('/node_modules/intro.js/introjs.css', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/intro.js/introjs.css'));
});

app.get('/node_modules/heic2any/dist/heic2any.min.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../node_modules/heic2any/dist/heic2any.min.js'));
});

app.get('/homePage', async (req, res) => {
    seo = await seoFormatter.seoFormatter('homePage');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/homePage' });
});

app.get('/groupTrips', async (req, res) => {
    seo = await seoFormatter.seoFormatter('groupTrips');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/groupTrips' });
});

app.get('/check-deals-hotels-flights-packages', async (_req, res) => {
    seo = await seoFormatter.seoFormatter('check-deals-hotels-flights-packages');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/check-deals-hotels-flights-packages' });
});

app.get('/ai-plan-trip', async (req, res) => {

    let isAppleDevice = false;
    // Check if it has ?app=ios
    if (req.query.app === 'ios') {
        isAppleDevice = true;
    }
    seo = await seoFormatter.seoFormatter('ai-plan-trip');
    res.render(path.join(__dirname, '../view/index.pug'), { isAppleDevice: isAppleDevice, title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/' });
});

app.get('/ai-travel-plan/:location/:paxType/:budgetType/:month/:itineraryId', async (req, res) => {
    seo = await seoFormatter.seoFormatter('itineraryId', req.params.itineraryId, { 'location': req.params.location, 'paxType': req.params.paxType, 'budgetType': req.params.budgetType, 'month': req.params.month });
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: 'https://beatravelbuddy.com/ai-travel-plan/' + req.params.location + '/' + req.params.paxType + '/' + req.params.budgetType + '/' + req.params.month + '/' + req.params.itineraryId });
});

app.get('/ai-travel-plan/:combinedParams/:itineraryId', async (req, res) => {
    // Extract the combined parameters and itineraryId from the request
    let { combinedParams, itineraryId } = req.params;
    // Split the combinedParams into individual parameters
    let [location, paxType, budgetType, month] = combinedParams.split('-');

    // Use the extracted parameters with the seoFormatter
    let seo = await seoFormatter.seoFormatter('itineraryId', itineraryId, { location, paxType, budgetType, month });

    // Construct the canonical URL using the new format
    let canonicalUrl = `https://beatravelbuddy.com/ai-travel-plan/${combinedParams}/${itineraryId}`;

    // Render the response with the updated canonical URL
    res.render(path.join(__dirname, '../view/index.pug'), {
        title: seo.title,
        keywords: seo.keywords,
        appVersion: appConstants.APPVERSION,
        description: seo.description,
        metaImage: seo.image,
        pageUrl: seo.url,
        canonical: canonicalUrl
    });
});

app.get('/allAiTrips', async (req, res) => {
    seo = await seoFormatter.seoFormatter('allAiTrips');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url });
});

app.get('/findbuddy', async (req, res) => {
    seo = await seoFormatter.seoFormatter('findbuddy');
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url });
});


app.get('/robots.txt', async (_req, res) => {
    res.sendFile(path.join(__dirname, '../robots.txt'));
});

app.get('/sitemap.xml', async (_req, res) => {
    res.sendFile(path.join(__dirname, '../sitemap.xml'));
});

function detectOperatingSystem(req) {
    userAgent = req.headers['user-agent'].toLowerCase();
    return userAgent.includes("chrome") && !userAgent.includes("chromium") ? userAgent.includes("macintosh") || userAgent.includes("mac OS X") || userAgent.includes("iphone") || userAgent.includes("ipad") ? 1 : userAgent.includes("windows") ? 2 : userAgent.includes("linux") ? 3 : 4 : 0;
}
app.get('/detect', (req, res) => {
    getOs = detectOperatingSystem(req);
    if (getOs === 0 || getOs === 1) {
        redirectUrl = 'https://apps.apple.com/us/app/beatravelbuddy/id1336926442';
    }
    else {
        redirectUrl = 'https://play.google.com/store/apps/details?id=com.beatravelbuddy.travelbuddy';
    }
    console.log(userAgent, redirectUrl);
    res.redirect(redirectUrl);
});

// Branch.io deep link handler - handles /detect.php with deep link parameters
app.get('/detect.php', async (req, res) => {
    // Check if this is a Branch.io deep link (has 't' parameter)
    if (req.query.t) {
        console.log('Branch.io deep link detected:', req.query.t);

        // For desktop users, render the main page and let JavaScript handle the routing
        let isAppleDevice = false;
        if (req.query.app === 'ios') {
            isAppleDevice = true;
        }

        // Get SEO data for the deep link
        let seo;
        try {
            seo = await seoFormatter.seoFormatter('community');
        } catch (error) {
            console.error('Error getting SEO data:', error);
            seo = {
                title: 'Travel Buddy - Travel Social Commerce',
                description: 'Never feel alone when you travel. Join travel buddy today to find travel meetups around you, travel partners, travel services & local experiences.',
                keywords: 'travel, social, community, meetups, travel partners',
                image: 'https://beatravelbuddy.com/view/assets/img/og-image.jpg',
                url: 'https://beatravelbuddy.com/'
            };
        }

        // Render the main page with deep link parameters
        res.render(path.join(__dirname, '../view/index.pug'), {
            isAppleDevice: isAppleDevice,
            title: seo.title,
            keywords: seo.keywords,
            appVersion: appConstants.APPVERSION,
            description: seo.description,
            metaImage: seo.image,
            pageUrl: seo.url,
            canonical: 'https://beatravelbuddy.com/',
            deepLinkParams: req.query // Pass deep link parameters to the frontend
        });
    } else {
        // No deep link parameters, use the original detect logic
        getOs = detectOperatingSystem(req);
        if (getOs === 0 || getOs === 1) {
            redirectUrl = 'https://apps.apple.com/us/app/beatravelbuddy/id1336926442';
        }
        else {
            redirectUrl = 'https://play.google.com/store/apps/details?id=com.beatravelbuddy.travelbuddy';
        }
        console.log(userAgent, redirectUrl);
        res.redirect(redirectUrl);
    }
});

app.get('/post/:postId', async (req, res) => {
    let isAppleDevice = false;
    // Check if it has ?app=ios
    if (req.query.app === 'ios') {
        isAppleDevice = true;
    }
    seo = await seoFormatter.seoFormatter('post', req.params.postId);
    res.render(path.join(__dirname, '../view/index.pug'), { title: seo.title, isAppleDevice: isAppleDevice, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url });
});

app.get('/newChat*', async (req, res) => {
    if (req.query.AI === 'AI=true') {
        seo = await seoFormatter.seoFormatter('AI');
    } else {
        seo = await seoFormatter.seoFormatter('newChat');
    }
    res.sendFile(path.join(__dirname, '../view/chat/chat.html'));
});

app.get('/view/chat/chat.js', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/chat/chat.js'));
});

app.get('/view/chat/chat.css', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/chat/chat.css'));
});

app.get('/view/chat/*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/chat/' + _req.params[0]));
});

// Hotels Page — shared helper for all /hotels* routes
function fromSlug(slug) {
    return slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function serveHotelsPage(req, res, opts = {}) {
    const filePath = path.join(__dirname, '../view/hotels/hotels.html');
    let html = fs.readFileSync(filePath, 'utf8');
    html = html.replace(/%%APP_VERSION%%/g, appConstants.APPVERSION);

    const cityName = opts.city ? fromSlug(opts.city) : '';
    const hotelName = opts.hotel ? fromSlug(opts.hotel) : '';
    const hotelCode = opts.hotelCode || '';
    const view = opts.view || 'search';

    let seoTitle, seoDesc, ogUrl;
    const base = 'https://beatravelbuddy.com';

    if (view === 'rooms' && hotelName && cityName) {
        seoTitle = `Rooms at ${hotelName} – Hotels in ${cityName} | Travel Buddy`;
        seoDesc = `Select your room at ${hotelName}, ${cityName}. Compare room types, prices, and amenities. Book securely with Travel Buddy.`;
        ogUrl = `${base}/hotels/${opts.city}/${opts.hotel}-${hotelCode}/rooms`;
    } else if (view === 'detail' && hotelName && cityName) {
        seoTitle = `${hotelName} – Hotels in ${cityName} | Travel Buddy`;
        seoDesc = `Book ${hotelName} in ${cityName}. View photos, amenities, guest reviews, and room prices. Instant confirmation with Travel Buddy.`;
        ogUrl = `${base}/hotels/${opts.city}/${opts.hotel}-${hotelCode}`;
    } else if (view === 'results' && cityName) {
        seoTitle = `Hotels in ${cityName} – Compare & Book | Travel Buddy`;
        seoDesc = `Find the best hotels in ${cityName}. Compare prices, read reviews, and book online with instant confirmation on Travel Buddy.`;
        ogUrl = `${base}/hotels/${opts.city}`;
    } else {
        seoTitle = 'Book Hotels Online – Best Deals | Travel Buddy';
        seoDesc = 'Save upto 60% on hotels across India with Travel Buddy. Compare prices, choose rooms, manage guests, and confirm bookings instantly. Find the best hotel deals with flexible dates and transparent pricing.';
        ogUrl = `${base}/hotels`;
    }

    html = html.replace(/%%SEO_TITLE%%/g, seoTitle);
    html = html.replace(/%%META_DESCRIPTION%%/g, seoDesc);
    html = html.replace(/%%OG_TITLE%%/g, seoTitle);
    html = html.replace(/%%OG_DESCRIPTION%%/g, seoDesc);
    html = html.replace(/%%OG_URL%%/g, ogUrl);

    const stateObj = {
        citySlug: opts.city || null,
        hotelSlug: opts.hotel || null,
        hotelCode: hotelCode || null,
        view: view,
        query: {
            checkin: req.query.checkin || null,
            checkout: req.query.checkout || null,
            adults: req.query.adults || null,
            children: req.query.children || null,
            rooms: req.query.rooms || null,
        },
    };
    const stateScript = `<script>window.__HOTEL_URL_STATE=${JSON.stringify(stateObj)};</script>`;
    html = html.replace('</head>', stateScript + '\n</head>');

    res.type('html').send(html);
}

app.get('/hotels/:citySlug/:hotelSlug/rooms', (req, res) => {
    const parts = req.params.hotelSlug.split('-');
    const hotelCode = parts.pop();
    const hotelSlugClean = parts.join('-');
    serveHotelsPage(req, res, {
        city: req.params.citySlug,
        hotel: hotelSlugClean,
        hotelCode,
        view: 'rooms',
    });
});

app.get('/hotels/:citySlug/:hotelSlug', (req, res) => {
    const parts = req.params.hotelSlug.split('-');
    const hotelCode = parts.pop();
    const hotelSlugClean = parts.join('-');
    serveHotelsPage(req, res, {
        city: req.params.citySlug,
        hotel: hotelSlugClean,
        hotelCode,
        view: 'detail',
    });
});

app.get('/hotels/:citySlug', (req, res) => {
    serveHotelsPage(req, res, {
        city: req.params.citySlug,
        view: 'results',
    });
});

app.get('/hotels', (req, res) => {
    serveHotelsPage(req, res, { view: 'search' });
});

app.get('/view/hotels/*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/hotels/' + _req.params[0]));
});

// Bookings Module
app.get('/view/bookings/*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/bookings/' + _req.params[0]));
});

app.get('/flightsNew', async (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/bookings/flights/flights-search/html/flights_search.html'));
});

// Fare Estimator – standalone page (inject app version for cache-busting)
app.get('/fare-estimator', async (_req, res) => {
    var filePath = path.join(
        __dirname,
        '../view/fare-estimator/fare_estimator.html',
    );
    fs.readFile(filePath, 'utf8', function (err, html) {
        if (err) {
            return res.status(500).send('Error loading page');
        }
        var versioned = html.replace(
            /__APP_VERSION__/g,
            appConstants.APPVERSION,
        );
        res.type('html').send(versioned);
    });
});




// Create a route for Premium page
app.get('/profile/*', async (req, res) => {

    let isAppleDevice = false;
    // Check if it has ?app=ios
    if (req.query.app === 'ios') {
        isAppleDevice = true;
    }
    // Get the user id from the route https://beatravelbuddy.com/profile/1f748cca80d65379f249891e8b2fa8c921df9f7e29382d37fd5d925f791db3ab
    let userId = req.params[0];
    console.log(userId);
    seo = await seoFormatter.seoFormatter('profile', userId);
    const profileUrl = `https://beatravelbuddy.com/profile/${userId}`;
    seo.url = profileUrl;
    res.render(path.join(__dirname, '../view/index.pug'), { isAppleDevice: isAppleDevice, title: seo.title, keywords: seo.keywords, appVersion: appConstants.APPVERSION, description: seo.description, metaImage: seo.image, pageUrl: seo.url, canonical: profileUrl });
});

// Add Tenor API proxy routes
app.get("/api/tenor/trending", async (req, res) => {
    try {
        const apiKey = req.query.key || "AIzaSyCfvFVCPpDrN-B883qn4DXyqCmnAhnCdOE"
        const clientKey = req.query.client_key || "my_test_app"
        const limit = req.query.limit || 12
        const pos = req.query.pos || 0

        const response = await axios.get("https://tenor.googleapis.com/v2/featured", {
            params: {
                key: apiKey,
                client_key: clientKey,
                limit: limit,
                pos: pos,
            },
        })

        console.log(response.data);
        res.json(response.data)
    } catch (error) {
        console.error("Error fetching trending GIFs:", error)
        res.status(500).json({ error: "Failed to fetch trending GIFs" })
    }
})

app.get("/api/tenor/search", async (req, res) => {
    try {
        const apiKey = req.query.key || "AIzaSyBTUmwdSpcG6lSqraIG_Il_fYFI5FtHslM"
        const clientKey = req.query.client_key || "my_test_app"
        const limit = req.query.limit || 12
        const pos = req.query.pos || 0
        const q = req.query.q || ""

        const response = await axios.get("https://tenor.googleapis.com/v2/search", {
            params: {
                key: apiKey,
                client_key: clientKey,
                q: q,
                limit: limit,
                pos: pos,
                media_filter: 'gif,mediumgif,tinygif,nanomp4'
            },
        })

        console.log(response.data);
        res.json(response.data)
    }
    catch (error) {
        console.error("Error searching GIFs:", error)
        res.status(500).json({ error: "Failed to search GIFs" })
    }
});

// Add Tenor API proxy routes for stickers
app.get("/api/tenor/stickers", async (req, res) => {
    try {
        const apiKey = req.query.key || "AIzaSyCfvFVCPpDrN-B883qn4DXyqCmnAhnCdOE"
        const clientKey = req.query.client_key || "my_test_app"
        const limit = req.query.limit || 12
        const pos = req.query.pos || 0

        const response = await axios.get("https://tenor.googleapis.com/v2/featured", {
            params: {
                key: apiKey,
                client_key: clientKey,
                limit: limit,
                pos: pos,
                media_filter: "sticker",
            },
        })

        // Validate response data structure
        if (!response.data || !response.data.results) {
            return res.status(500).json({
                error: "Invalid response from Tenor API",
                results: [],
            })
        }

        res.json(response.data)
    }
    catch (error) {
        console.error("Error fetching trending stickers:", error)
        res.status(500).json({
            error: "Failed to fetch trending stickers",
            message: error.message,
            results: [],
        })
    }
})

app.get("/api/tenor/search-stickers", async (req, res) => {
    try {
        const apiKey = req.query.key || "AIzaSyCfvFVCPpDrN-B883qn4DXyqCmnAhnCdOE"
        const clientKey = req.query.client_key || "my_test_app"
        const limit = req.query.limit || 12
        const pos = req.query.pos || 0
        const q = req.query.q || ""

        if (!q) {
            return res.status(400).json({
                error: "Search query is required",
                results: [],
            })
        }

        const response = await axios.get("https://tenor.googleapis.com/v2/search", {
            params: {
                key: apiKey,
                client_key: clientKey,
                q: q,
                limit: limit,
                pos: pos,
                media_filter: "sticker",
            },
        })

        // Validate response data structure
        if (!response.data || !response.data.results) {
            return res.status(500).json({
                error: "Invalid response from Tenor API",
                results: [],
            })
        }

        res.json(response.data)
    } catch (error) {
        console.error("Error searching stickers:", error)
        res.status(500).json({
            error: "Failed to search stickers",
            message: error.message,
            results: [],
        })
    }
});

// Create a route for sending Itinerary as PDF via whatsapp

app.get('/send-itinerary-pdf', async (req, res) => {
    try {
        // Extract required parameters from the request (e.g., query or body)
        const phoneNo = req.query.phoneNo || "9625251633"; // Default phone number
        const countryCode = req.query.countryCode || "+91"; // Default country code
        const templateName = req.query.templateName || "leads_itinerary_sender"; // Default template name
        const documentUrl = req.query.documentUrl || ""; // Default document URL
        const fileName = req.query.fileName || "Bali Itinerary"; // Default file name
        const bodyValues = req.query.bodyValues ? JSON.parse(req.query.bodyValues) : ["John Doe"]; // Default body values

        // Call the send_document_template function
        const response = await whatsAppSend.send_document_template(
            phoneNo,
            countryCode,
            templateName,
            documentUrl,
            fileName,
            bodyValues
        );

        // Send the response back to the client
        res.send(response);
    } catch (error) {
        console.error("Error sending itinerary PDF:", error);
        res.status(500).send({ error: "Failed to send itinerary PDF", details: error.message });
    }
});

// Image upload route
app.get('/image-upload/*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/image_upload.html'));
});

// Video upload route
app.get('/video-upload/*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../view/video_upload.html'));
});

// Loader.io Page
app.get('/loaderio-c3ed384200e70f1df601817ff27f6a2c.txt', async (_req, res) => {
    res.sendFile(path.join(__dirname, '../loaderio-c3ed384200e70f1df601817ff27f6a2c.txt'));
});

// Email Sender Routes
// const emailTemplatesConfig = require('./email-templates-config');

// // Get email templates configuration
// app.get('/api/email-templates', async (req, res) => {
//     try {
//         res.json(emailTemplatesConfig);
//     } catch (error) {
//         console.error('Error fetching email templates:', error);
//         res.status(500).json({ error: 'Failed to fetch email templates' });
//     }
// });

// // Send email with template and attachment
// app.post('/api/send-email', async (req, res) => {
//     try {
//         const form = new formidable.IncomingForm();
//         form.maxFileSize = 10 * 1024 * 1024; // 10MB limit

//         form.parse(req, async (err, fields, files) => {
//             if (err) {
//                 console.error('Error parsing form:', err);
//                 return res.status(400).json({ error: 'Invalid form data' });
//             }

//             try {
//                 const { emailType, recipientEmail, subject, templateData } = fields;

//                 if (!emailType || !recipientEmail || !subject || !templateData) {
//                     return res.status(400).json({ error: 'Missing required fields' });
//                 }

//                 // Parse template data
//                 let parsedTemplateData;
//                 try {
//                     parsedTemplateData = JSON.parse(templateData);
//                 } catch (parseError) {
//                     return res.status(400).json({ error: 'Invalid template data format' });
//                 }

//                 // Get template info
//                 const templateInfo = emailTemplatesConfig.emailTemplates[emailType];
//                 if (!templateInfo) {
//                     return res.status(400).json({ error: 'Invalid email type' });
//                 }

//                 // Prepare email data
//                 const emailData = {
//                     toEmailAddr: recipientEmail,
//                     tmpltData: parsedTemplateData,
//                     emailType: emailType,
//                     subject: subject
//                 };

//                 // Handle PDF attachment if present
//                 if (files.attachment && files.attachment[0]) {
//                     const file = files.attachment[0];

//                     // Validate file type
//                     if (file.mimetype !== 'application/pdf') {
//                         return res.status(400).json({ error: 'Only PDF files are allowed' });
//                     }

//                     // Read file content and convert to base64 for SendGrid
//                     const fs = require('fs');
//                     const fileContent = fs.readFileSync(file.filepath);
//                     const base64Content = fileContent.toString('base64');

//                     emailData.attachment = [{
//                         content: base64Content,
//                         filename: file.originalFilename || 'attachment.pdf',
//                         type: 'application/pdf',
//                         disposition: 'attachment'
//                     }];

//                     // Clean up temporary file
//                     fs.unlinkSync(file.filepath);
//                 }

//                 // Import and use the email sending function
//                 const { sendEmailWithTemplate } = require('./send-email');

//                 // Send the email
//                 await sendEmailWithTemplate(
//                     emailData.toEmailAddr,
//                     emailData.tmpltData,
//                     emailData.emailType,
//                     null, // bccEmail
//                     emailData.attachment
//                 );

//                 res.json({ 
//                     success: true, 
//                     message: 'Email sent successfully',
//                     emailType: emailType,
//                     recipient: recipientEmail
//                 });

//             } catch (emailError) {
//                 console.error('Error sending email:', emailError);
//                 res.status(500).json({ 
//                     error: 'Failed to send email', 
//                     details: emailError.message 
//                 });
//             }
//         });

//     } catch (error) {
//         console.error('Error in send-email route:', error);
//         res.status(500).json({ 
//             error: 'Internal server error', 
//             details: error.message 
//         });
//     }
// });

// // Email sender page route
// app.get('/email-sender', async (req, res) => {
//     res.sendFile(path.join(__dirname, '../view/email-sender.html'));
// });


// TBO Flights - Dedicated REST endpoints for mobile/Flutter
// These call into bem.js jsInit with appropriate reasons to retain server egress IPs

function withPlainUserId(req, basePayload = {}) {
    try {
        const userId = validateToken(req.headers);
        if (userId && userId > 0) {
            return { ...basePayload, plainUserId: userId };
        }
    } catch (e) {
        // ignore token errors; treat as guest
    }
    return basePayload;
}

app.post('/api/tbo/flights/search', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'tboSearchFlights',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/tbo/flights/fare-rule', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'tboFareRule',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/tbo/flights/fare-quote', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'tboFareQuote',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/tbo/flights/ssr', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'getSSR',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/tbo/flights/book', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'bookFlight',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/tbo/flights/ticket', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'flightTicketing',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/tbo/flights/booking-details', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'getBookingDetails',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Flight Razorpay payment intent (register before checkout; webhook marks paid)
app.post('/api/tbo/flights/booking-payment-intent', bodyParser.json(), async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        if (!payload.orderId) {
            return res.status(400).send({
                status: 'error',
                responseCode: 400,
                message: 'orderId is required',
            });
        }
        let snapshotJson = '{}';
        if (payload.snapshot != null) {
            snapshotJson =
                typeof payload.snapshot === 'string'
                    ? payload.snapshot
                    : JSON.stringify(payload.snapshot);
        }
        await flightBookingPaymentIntent.registerIntent({
            plainUserId: payload.plainUserId,
            orderId: String(payload.orderId),
            snapshotJson,
        });
        res.status(200).send({ status: 'success', responseCode: 200 });
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post(
    '/api/tbo/flights/booking-payment-intent/status',
    bodyParser.json(),
    async (req, res) => {
        try {
            const payload = withPlainUserId(req, req.body || {});
            if (!payload.orderId) {
                return res.status(400).send({
                    status: 'error',
                    responseCode: 400,
                    message: 'orderId is required',
                });
            }
            const row = await flightBookingPaymentIntent.getIntentForUser({
                orderId: String(payload.orderId),
                plainUserId: payload.plainUserId,
            });
            if (!row) {
                return res.status(404).send({
                    status: 'error',
                    responseCode: 404,
                    message: 'intent not found',
                });
            }
            res.status(200).send({
                status: 'success',
                responseCode: 200,
                object: row,
            });
        } catch (e) {
            res.status(500).send({
                status: 'error',
                responseCode: 500,
                message: e.message,
            });
        }
    },
);

app.post(
    '/api/tbo/flights/booking-payment-intent/client-complete',
    bodyParser.json(),
    async (req, res) => {
        try {
            const payload = withPlainUserId(req, req.body || {});
            if (!payload.orderId) {
                return res.status(400).send({
                    status: 'error',
                    responseCode: 400,
                    message: 'orderId is required',
                });
            }
            await flightBookingPaymentIntent.markClientFulfilled({
                orderId: String(payload.orderId),
                plainUserId: payload.plainUserId,
            });
            res.status(200).send({ status: 'success', responseCode: 200 });
        } catch (e) {
            res.status(500).send({
                status: 'error',
                responseCode: 500,
                message: e.message,
            });
        }
    },
);

app.post('/api/tbo/flights/calendar-fares', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'getCalendarFares',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/tbo/flights/cancellation-charges', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'getCancellationCharges',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/tbo/flights/change-request', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'sendChangeRequest',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/tbo/flights/agency-balance', async (req, res) => {
    try {
        var payload = withPlainUserId(req, req.body || {});
        // Remove deviceType from the payload
        payload = removeDeviceTypeFromPayload(payload);
        const response = await bem.jsInit({
            reason: 'getAgencyBalance',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// For getting the airport info
app.post('/api/tbo/flights/airport-info', async (req, res) => {
    try {
        const payload = {};
        const response = await bem.jsInit({
            reason: 'getAirportInfo',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// For getting the users flight bookings
app.post('/api/tbo/flights/users-bookings', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'getUsersFlightBookings',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Create a centralized function to remove deviceType from the payload
function removeDeviceTypeFromPayload(payload) {
    delete payload.deviceType;
    return payload;
}

// Experiences API - For Flutter to fetch group trips and packages
// This endpoint allows Flutter to fetch experiences (group trips and packages) via HTTP API
// instead of directly connecting to PostgreSQL database
app.post('/api/experiences/get-experiences', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'getExperiences',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Coupons API - For Flutter to fetch available coupons
// This endpoint allows Flutter to fetch coupons for flights, hotels, or experiences
app.post('/api/coupon/get-coupons', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'getCoupons',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Route for Validate Coupon
app.post('/api/coupon/validate-coupon', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'validateCoupon',
            data: payload,
        });
        res.status(200).send(response);
    }
    catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Public endpoint: returns live-converted plan prices for the requested currency
app.post('/api/pricing/get-plan-prices', async (req, res) => {
    try {
        const { currencyCode } = req.body;
        const result = await razorPayHelper.getPlanPrices(currencyCode || 'INR');
        res.status(200).json({ status: 'success', ...result });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

//Routes for Razorpay
app.post('/api/razorpay/get-order-id', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'getOrderId',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

//Routes for Razorpay get payment details
app.post('/api/razorpay/get-payment-details', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'getPaymentDetails',
            data: payload.paymentId,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

//Route for adding cancelled orders
app.post('/api/cancelled-orders/add', async (req, res) => {
    try {
        updateLoggedInUserId(req.headers);
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'addCancelledOrder',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

//Route for Razorpay get payments by orderId
app.post('/api/razorpay/get-payments-by-order-id', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'getPaymentsByOrderId',
            data: payload.orderId,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message
        });
    }
});

//Routes for Razorpay give premium
app.post('/api/razorpay/give-premium', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'givePremium',
            data: payload,
            token: req.headers.authorization,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Routes for Firebase Chat Connection

// Get group count
app.post('/api/chat/get-group-count', async (req, res) => {
    try {
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'getGroupCount',
            data: {},
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Get chat count
app.post('/api/chat/get-chat-count', async (req, res) => {
    try {
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'getChatCount',
            data: {},
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Fetch chat users
app.post('/api/chat/fetch-chat-users', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchChatUsers',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Fetch single chat user
app.post('/api/chat/fetch-chat-single-user', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchChatSingleUser',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Fetch chat messages
app.post('/api/chat/fetch-chat-messages', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchChatMessages',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Post chat message
app.post('/api/chat/post-message', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'postChatMessage',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Modify chat message
app.post('/api/chat/modify-message', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'modifyChatMessage',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Initiate chat
app.post('/api/chat/initiate-chat', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'initiateChat',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Accept chat request
app.post('/api/chat/accept-chat-request', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'acceptChatRequest',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Update chat flags
app.post('/api/chat/update-chat-flags', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updateChatFlags',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Set user presence
app.post('/api/chat/set-user-presence', async (req, res) => {
    try {
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'setUserPresence',
            data: {},
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Open profile from chat
app.post('/api/chat/open-profile-from-chat', async (req, res) => {
    try {
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'openProfileFromChat',
            data: req.body,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Set user node
app.post('/api/chat/set-user-node', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'setUserNode',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Add users to group
app.post('/api/chat/add-users-to-group', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'addUsersToGroup',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Fetch group members
app.post('/api/chat/fetch-group-members', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchGroupMembers',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Exit user from group
app.post('/api/chat/exit-user-from-group', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'exitUserFromGroup',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Remove user from group
app.post('/api/chat/remove-user-from-group', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'removeUserFromGroup',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Update group image
app.post('/api/chat/update-group-image', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updateGroupImage',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Update group label
app.post('/api/chat/update-group-label', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updateGroupLabel',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Fetch users groups
app.post('/api/chat/fetch-users-groups', async (req, res) => {
    try {
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchUsersGroups',
            data: {},
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Get delta data chats
app.post('/api/chat/get-delta-data-chats', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'getDeltaDataChats',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Update is requested status
app.post('/api/chat/update-is-requested', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updateIsRequested',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Verify Firebase OTP
app.post('/api/chat/verify-firebase-otp', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'verifyFirebaseOTP',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});


// API for User Registration (using db-connect registerUser)
app.post('/api/auth/register', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'registerUser',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Google OAuth Login (using db-connect loginWithGoogle)
app.post('/api/auth/login-google', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'loginGoogle',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Facebook OAuth Login (using db-connect loginWithFacebook)
app.post('/api/auth/login-facebook', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'loginFacebook',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Apple Sign In (using db-connect loginWithApple)
app.post('/api/auth/login-apple', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'loginApple',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Login with ID / email (using db-connect loginWithId)
app.post('/api/auth/login', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'loginWithId',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Password-based Login (email or phone + MD5 password)
app.post('/api/auth/custom-login', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'customLogin',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// APIs for Registration
app.post('/api/auth/check-user-login', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'checkUserLogin',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Insert User
app.post('/api/auth/insert-user', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'insertUser',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Update Profile Name
app.post('/api/profile/update-name', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updateProfileName',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Update About Profile Info
app.post('/api/profile/update-about', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updateAbout',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Update Social Media Links
app.post('/api/profile/update-social-links', async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(200).send({ response: 'error', responseCode: 400, errorMessage: 'Bad Request' });
        }
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updateSocialLink',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Follow/Unfollow User (toggle)
app.post('/api/profile/follow', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'followUser',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Fetching Followers/Following Connections
app.post('/api/profile/connections', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'getConnections',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for blocking/unblocking a user (toggle)
app.post('/api/profile/block', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const type = payload.type !== undefined ? payload.type : (payload.action === 'unblock' ? 2 : 1);
        const reason = (type === 2 || type === '2') ? 'unblockUser' : 'blockUser';
        const response = await bem.jsInit({
            reason: reason,
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for listing blocked users
app.post('/api/profile/blocked', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'blockedUsers',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for profile views and follower counts
app.post('/api/profile/counts', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchProfileViews',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for updating user gender and location
app.post('/api/profile/update-gender-location', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'update_gender_and_location',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for updating user phone number
app.post('/api/profile/update-phone', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updatePhoneNumber',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for uploading and updating profile picture
app.post('/api/profile/update-picture', (req, res) => {
    try {
        const token = getBearerToken(req);

        const form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.status(400).send({ status: 'error', responseCode: 400, message: err.message });
            }
            if (!files || !files.uploaded_files) {
                return res.status(400).send({ status: 'error', responseCode: 400, message: 'Request files are missing' });
            }

            try {
                const payload = {
                    reason: 'uploadDP',
                    token: token,
                    data: fields
                };
                const response = await bem.jsUpload(payload, files, req.headers);
                res.status(200).send(response);
            } catch (e) {
                res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
            }
        });
    } catch (error) {
        res.status(500).send({ status: 'error', responseCode: 500, message: error.message });
    }
});

// API for uploading and updating profile cover photo
app.post('/api/profile/update-cover', (req, res) => {
    try {
        const token = getBearerToken(req);

        const form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.status(400).send({ status: 'error', responseCode: 400, message: err.message });
            }
            if (!files || !files.uploaded_files) {
                return res.status(400).send({ status: 'error', responseCode: 400, message: 'Request files are missing' });
            }

            try {
                const payload = {
                    reason: 'coverUpload',
                    token: token,
                    data: fields
                };
                const response = await bem.jsUpload(payload, files, req.headers);
                res.status(200).send(response);
            } catch (e) {
                res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
            }
        });
    } catch (error) {
        res.status(500).send({ status: 'error', responseCode: 500, message: error.message });
    }
});

// API for deleting profile cover photo
app.post('/api/profile/delete-cover', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'deleteCover',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for fetching subscription details
app.post('/api/profile/subscriptions', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'getSubscriptionInfo',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for retrieving a single post by ID
app.get('/api/posts/get', async (req, res) => {
    try {
        const payload = withPlainUserId(req, { ...req.query, ...req.body });
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchPost',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/posts/get', async (req, res) => {
    try {
        const payload = withPlainUserId(req, { ...req.query, ...req.body });
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchPost',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for retrieving full user profile details
app.get('/api/profile/get', async (req, res) => {
    try {
        const payload = withPlainUserId(req, { ...req.query, ...req.body });
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchUserProfile',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

app.post('/api/profile/get', async (req, res) => {
    try {
        const payload = withPlainUserId(req, { ...req.query, ...req.body });
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchUserProfile',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for retrieving post comments
app.post('/api/posts/comments', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchComments',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for creating a post comment
app.post('/api/posts/comment', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'postComment',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for editing a post comment
app.post('/api/posts/edit-comment', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'editComment',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for deleting a post comment
app.post('/api/posts/delete-comment', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'deleteComment',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for deleting a post
app.post('/api/posts/delete', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'deletePost',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for adding a reply to a comment
app.post('/api/posts/add-reply', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'replyComment',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for liking/unliking a comment or reply
app.post('/api/posts/like-comment', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'likeCommentOrReply',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for retrieving comment replies
app.post('/api/posts/replies', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'getCommentReplies',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for bookmarking/unbookmarking a post
app.post('/api/posts/bookmark', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'bookmarkPost',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for reporting a post
app.post('/api/posts/report', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'reportPost',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for pinning/unpinning a post
app.post('/api/posts/pin', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'pinUnpinPost',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for uploading a new post natively
app.post('/api/posts/upload', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'uploadPost',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for editing an existing post natively
app.post('/api/posts/edit', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updatePost',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for retrieving post likes (likers list)
app.post('/api/posts/likes', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchLikes',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for liking/unliking a post (toggle)
app.post('/api/posts/like', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'likePost',
            data: payload,
            token: token,
        });
        res.status(response.responseCode || 200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Forgot Password: match OTP (send phone as email field, per PHP contract)
app.post('/api/auth/match-otp-forgot', async (req, res) => {
    try {
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'matchOtpForgot',
            data: req.body || {},
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// API for Forgot Password: reset password (requires Bearer JWT + {password})
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'resetPass',
            data: req.body || {},
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Chat V2 — Supabase JWT + webhooks (Node; /api/chat-v2, not PHP /v5)
//require('./chat-v2/register_chat_v2')(app);

// API to look up primary_id by phone numbers (national numbers, no dial code). Used by My Contacts.
app.post('/api/users/find-by-phone', async (req, res) => {
    try {
        const response = await bem.jsInit({
            reason: 'getUserIdsByPhoneNumbers',
            data: req.body || {},
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({
            response: 'error',
            responseCode: 500,
            errorMessage: e.message,
        });
    }
});

// API for chatAi 
app.post('/api/chat/chat-ai', async (req, res) => {
    try {
        // Extract just the message from the request body
        // The backend's startAiChat function expects a string, not an object
        // Set appConstants.LOGGED_IN_USER_ID to the user's primary_id
        updateLoggedInUserId(req.headers);

        const message = req.body?.message || req.body || '';
        const payload = withPlainUserId(req, { message: message });

        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'chatAi',
            data: message, // Pass just the message string, not the object
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// Api for Add User to Find Buddy Group
app.post('/api/chat/add-user-to-find-buddy-group', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);

        const response = await bem.jsInit({
            reason: 'addUserToFindGroup',
            data: payload,
            token: token,
            plainUserId: updateLoggedInUserId(req.headers),
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

async function updateLoggedInUserId(headers) {
    try {
        const userId = validateToken(headers);
        if (userId && userId > 0) {
            appConstants.LOGGED_IN_USER_ID = userId;
            return userId;
        } else {
            console.error('Error: validateToken returned invalid userId:', userId);
            // Don't set LOGGED_IN_USER_ID to invalid value, keep it as -1
            appConstants.LOGGED_IN_USER_ID = -1;
        }
        return null;
    }
    catch (error) {
        console.error('Error in updateLoggedInUserId:', error);
        // Reset to default on error
        appConstants.LOGGED_IN_USER_ID = -1;
        return null;
    }
}

// Route to update user_travel_budget_type in the users table
app.post('/api/users/update-user-travel-budget-type', async (req, res) => {
    try {
        const payload = req.body || {};

        // Strip "Bearer " prefix from authorization header if present
        const token = getBearerToken(req);

        // Try to get plainUserId from payload first (if Flutter sends it)
        let plainUserId = payload.plainUserId;

        // If not in payload, try to extract from token
        if (!plainUserId) {
            plainUserId = await updateLoggedInUserId(req.headers);
        }

        // Validate that plainUserId exists (either from payload or token)
        if (!plainUserId || plainUserId <= 0) {
            return res.status(401).send({
                status: 'error',
                responseCode: 401,
                message: 'Authentication required. Invalid or missing token/userId.'
            });
        }

        // Validate travelBudgetType is provided
        if (!payload.travelBudgetType) {
            return res.status(400).send({
                status: 'error',
                responseCode: 400,
                message: 'travelBudgetType is required'
            });
        }

        const response = await bem.jsInit({
            reason: 'updateUserTravelBudgetType',
            data: {
                userId: plainUserId,
                travelBudgetType: payload.travelBudgetType
            },
            token: token,
        });

        // Send the response with appropriate status code
        const statusCode = response.responseCode || (response.status === 'success' ? 200 : 500);
        res.status(statusCode).send(response);
    } catch (e) {
        console.error('Error in update-user-travel-budget-type route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

// API to send OTP to the number to +91 dial code via 2Factor.in API

// Send OTP for domestic phone numbers
app.post('/api/otp/domestic/send', async (req, res) => {
    try {
        const payload = req.body || {};

        // Validate phone number is provided
        if (!payload.phoneNumber) {
            return res.status(400).send({
                status: 'error',
                responseCode: 400,
                message: 'phoneNumber is required'
            });
        }

        const response = await bem.jsInit({
            reason: 'sendOTPDomestic',
            data: {
                phoneNumber: payload.phoneNumber
            },
            token: req.headers.authorization,
        });

        // Send the response with appropriate status code
        const statusCode = response.responseCode || (response.success ? 200 : 500);
        res.status(statusCode).send(response);
    } catch (e) {
        console.error('Error in send OTP route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

// Verify OTP for domestic phone numbers
app.post('/api/otp/domestic/verify', async (req, res) => {
    try {
        const payload = req.body || {};

        // Validate required fields
        if (!payload.phoneNumber) {
            return res.status(400).send({
                status: 'error',
                responseCode: 400,
                message: 'phoneNumber is required'
            });
        }

        if (!payload.otp) {
            return res.status(400).send({
                status: 'error',
                responseCode: 400,
                message: 'otp is required'
            });
        }

        const response = await bem.jsInit({
            reason: 'verifyOTPDomestic',
            data: {
                mobileNumber: payload.mobileNumber || payload.phoneNumber,
                otpEnteredByUser: payload.otpEnteredByUser || payload.otp
            },
            token: req.headers.authorization,
        });

        // Send the response with appropriate status code
        const statusCode = response.responseCode || (response.success ? 200 : 500);
        res.status(statusCode).send(response);
    } catch (e) {
        console.error('Error in verify OTP route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

app.post('/api/otp/whatsapp/send', async (req, res) => {
    try {
        const payload = req.body || {};

        if (!payload.phoneNumber || !payload.dialCode) {
            return res.status(400).send({
                status: 'error',
                responseCode: 400,
                message: 'phoneNumber and dialCode are required',
            });
        }

        const response = await bem.jsInit({
            reason: 'sendOTPWhatsapp',
            data: payload,
            token: req.headers.authorization,
        });

        res.status(response.responseCode || 200).send(response);
    } catch (e) {
        console.error('Error in WhatsApp OTP send route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error',
        });
    }
});

app.post('/api/otp/whatsapp/verify', async (req, res) => {
    try {
        const payload = req.body || {};

        if (!payload.phoneNumber || !payload.dialCode || !payload.otp) {
            return res.status(400).send({
                status: 'error',
                responseCode: 400,
                message: 'phoneNumber, dialCode, otp are required',
            });
        }

        const response = await bem.jsInit({
            reason: 'verifyOTPWhatsapp',
            data: payload,
            token: req.headers.authorization,
        });

        res.status(response.responseCode || 200).send(response);
    } catch (e) {
        console.error('Error in WhatsApp OTP verify route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error',
        });
    }
});

// Route to get the matchmaking phase one
app.post('/api/matchmaking/phase-one', async (req, res) => {
    try {
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'matchmakingPhaseOne',
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        console.error('Error in matchmaking phase one route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

// Route to swipe user
app.post('/api/matchmaking/swipe-user', async (req, res) => {
    try {
        const payload = req.body || {};
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'swipeUser',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        console.error('Error in swipe user route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

// Route to get the list of users who liked the current user
app.post('/api/matchmaking/get-liked-users', async (req, res) => {
    try {
        // User isSelf as true if we want to get the list of users who liked the current user
        // User isSelf as false if we want to get the list of users who the current user has liked
        const payload = req.body || {};
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'getLikedUsers',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        console.error('Error in get liked users route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

// Route to get the list of users of Matched Buddies
app.post('/api/matchmaking/get-matched-buddies', async (req, res) => {
    try {
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'getMatchedBuddies',
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        console.error('Error in get matched buddies route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

// Route to decline a like request
app.post('/api/matchmaking/decline-like-request', async (req, res) => {
    try {
        const payload = req.body || {};
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'declineLikeRequest',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    }
    catch (e) {
        console.error('Error in decline like request route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }

});

// Route to fetch discover posts with cursor pagination
app.post('/api/matchmaking/discover-posts', async (req, res) => {
    try {
        const payload = req.body || {};
        const response = await bem.jsInit({
            reason: 'getDiscoverPostsPaginated',
            data: payload,
        });
        const statusCode =
            response.responseCode ||
            (response.response === 'success' ? 200 : 500);
        res.status(statusCode).send(response);
    }
    catch (e) {
        console.error('Error in discover posts route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error',
        });
    }
});

// Plan Your Trip Landing Page
app.get('/plan-your-trip', (_req, res) => {
    const appQueryValue = String(_req.query.app || '')
        .trim()
        .toLowerCase();
    const requestSource = String(_req.query.source || '')
        .trim()
        .toLowerCase();
    const appRequestHeader = String(
        _req.headers['x-tbd-app'] || _req.headers['x-client-platform'] || '',
    )
        .trim()
        .toLowerCase();

    const isAppRequest =
        appQueryValue === 'ios' ||
        appQueryValue === 'android' ||
        requestSource === 'app' ||
        appRequestHeader === 'ios' ||
        appRequestHeader === 'android' ||
        appRequestHeader === 'app' ||
        appRequestHeader === 'true';

    const filePath = path.join(__dirname, '../view/trips-packages.html');
    fs.readFile(filePath, 'utf8', function (err, html) {
        if (err) {
            return res.status(500).send('Error loading page');
        }

        const versionedHtml = html
            .replace(/__APP_VERSION__/g, appConstants.APPVERSION)
            .replace(/__IS_APP_REQUEST__/g, String(isAppRequest));

        res.type('html').send(versionedHtml);
    });
});

// Plan Your Trip API Google Sheet Write
// Plan Your Trip Submission API
app.post('/api/plan-your-trip/submit-enquiry', async (req, res) => {
    const { formData, dataArray } = req.body;

    if (!formData || !dataArray) {
        return res.status(400).json({
            success: false,
            message: 'Form data is required'
        });
    }

    try {
        // Google Sheet ID: 19c32pH7iME-AgpozV4bvdzanoy_4L7I9dbA8Q02dMVg
        const googleSheetId = '1kK56UWY7dIigG5YJK2fu6fx9ZvGPshfqdLL7dp0FSF4';
        const sheetName = 'PlanTrip';

        // Write data to Google Sheet
        await writeDataToGoogleSheet(googleSheetId, dataArray, `${sheetName}!A2`);
        console.log('Enquiry data saved to Google Sheet successfully');

        res.json({
            success: true,
            message: 'Enquiry submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting enquiry:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error submitting enquiry'
        });
    }
});

// Route for TBO Hotels API

/* 1) Search Hotel Availability
2) Pre Book Hotel
3) Book Hotel
4) Get Hotel Booking Details
5) Get Hotel Details
*/

// Get city codes for hotels route
app.post('/api/tbo/hotels/get-city-codes', async (req, res) => {
    try {
        const payload = req.body || {};
        const response = await bem.jsInit({
            reason: 'getCityCodesForHotels',
            data: payload,
        });
        res.status(200).send(response);
    }
    catch (e) {
        console.error('Error in get city codes route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

// Get Hotel codes for the given city code 
app.post('/api/tbo/hotels/get-hotel-codes', async (req, res) => {
    try {
        const payload = req.body || {};
        const response = await bem.jsInit({
            reason: 'getHotelCodesFromDB',
            data: payload,
        });
        res.status(200).send(response);
    }
    catch (e) {
        console.error('Error in get hotel codes route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }

});

app.post('/api/tbo/hotels/search-hotel-availability', async (req, res) => {
    try {
        // Get plainUserId from the request headers

        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'searchHotelAvailability',
            data: payload,
        });
        res.status(200).send(response);
    }
    catch (e) {
        console.error('Error in search hotel availability route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

app.post('/api/tbo/hotels/pre-book-hotel', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'preBookHotel',
            data: payload,
        });
        res.status(200).send(response);
    }
    catch (e) {
        console.error('Error in pre book hotel route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

app.post('/api/tbo/hotels/book-hotel', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'bookHotel',
            data: payload,
        });
        res.status(200).send(response);
    } catch (e) {
        console.error('Error in book hotel route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

app.post('/api/tbo/hotels/get-hotel-booking-details', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const response = await bem.jsInit({
            reason: 'getHotelBookingDetails',
            data: payload,
        });
        res.status(200).send(response);
    } catch (e) {
        console.error('Error in get hotel booking details route:', e);
        res.status(500).send({
            status: 'error',
            responseCode: 500,
            message: e.message || 'Internal server error'
        });
    }
});

// -----------------------------
// Instagram Business (review-safe)
// -----------------------------
const IG_GRAPH_VERSION = process.env.IG_GRAPH_VERSION || 'v21.0';
const IG_OAUTH_BASE = process.env.IG_OAUTH_BASE || 'https://www.instagram.com/oauth/authorize';
const IG_GRAPH_BASE = `https://graph.instagram.com/${IG_GRAPH_VERSION}`;
const IG_APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const IG_REDIRECT_URI =
    process.env.IG_REDIRECT_URI ||
    process.env.FACEBOOK_REDIRECT_URI ||
    `${IG_APP_BASE_URL}/auth/instagram/callback`;
// After OAuth, redirect opens the app via Branch (preferred) or web/universal link.
// Set IG_BRANCH_CONNECTED_URL to your Branch quick link base, e.g.
// https://beatravelbuddy.app.link/instagram-oauth — query params are appended below.
const IG_CONNECTED_REDIRECT_BASE =
    process.env.IG_BRANCH_CONNECTED_URL ||
    process.env.IG_APP_CONNECTED_URL ||
    `${IG_APP_BASE_URL}/instagram/connected`;
const IG_SCOPES = process.env.IG_SCOPES || 'instagram_business_basic';
const IG_STATE_SECRET =
    process.env.IG_STATE_SECRET ||
    process.env.INSTAGRAM_APP_SECRET ||
    process.env.FACEBOOK_APP_SECRET ||
    process.env.SECRET_KEY ||
    'travelbuddy_instagram_state_secret';

const createSignedInstagramState = (userId) => {
    const payload = Buffer.from(
        JSON.stringify({
            u: String(userId),
            t: Date.now(),
        }),
    ).toString('base64url');
    const signature = crypto
        .createHmac('sha256', IG_STATE_SECRET)
        .update(payload)
        .digest('base64url');
    return `ig.${payload}.${signature}`;
};

const parseSignedInstagramState = (state) => {
    if (typeof state !== 'string' || !state.startsWith('ig.')) {
        return null;
    }
    const parts = state.split('.');
    if (parts.length !== 3) {
        return null;
    }

    const payload = parts[1];
    const signature = parts[2];
    const expectedSignature = crypto
        .createHmac('sha256', IG_STATE_SECRET)
        .update(payload)
        .digest('base64url');
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (
        signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
        return null;
    }

    try {
        const decoded = JSON.parse(
            Buffer.from(payload, 'base64url').toString('utf8'),
        );
        if (!decoded?.u) {
            return null;
        }
        return {
            userId: String(decoded.u),
            timestamp: Number(decoded.t || 0),
        };
    } catch (_error) {
        return null;
    }
};

const parsePositiveInt = (value) => {
    const parsed = Number.parseInt(String(value || ''), 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const resolveUserIdFromRequest = (req) => {
    try {
        const tokenUserId = validateToken(req.headers);
        if (tokenUserId && tokenUserId > 0) {
            return {
                userId: String(tokenUserId),
                userIdInt: tokenUserId,
            };
        }
    } catch (_error) {
        // Ignore token parsing errors and fall back to explicit userId.
    }

    const fromQuery = req.query.userId;
    const fromHeader = req.headers['x-user-id'];
    const parsed = parsePositiveInt(fromQuery ?? fromHeader);
    if (!parsed) {
        return {
            error: 'Missing/invalid userId (positive integer in query or x-user-id header)',
        };
    }
    return {
        userId: String(parsed),
        userIdInt: parsed,
    };
};

const getInstagramSession = async (req) => {
    const resolvedUser = resolveUserIdFromRequest(req);
    if (resolvedUser.error) {
        return { error: resolvedUser.error };
    }
    const { userId, userIdInt } = resolvedUser;
    const dbToken = await dbConnect.getInstagramTokenByUserId(userIdInt);
    if (!dbToken) {
        return { error: 'Instagram is not connected for this user' };
    }

    const expiresAtMs = new Date(dbToken.expiresAt).getTime();
    return {
        userId,
        userIdInt,
        session: {
            connected: true,
            accessToken: dbToken.longLivedToken,
            tokenExpiresAt: Number.isFinite(expiresAtMs) ? expiresAtMs : null,
            igUserId: String(dbToken.instagramUserId || ''),
            lastConnectedAt: dbToken.updatedAt
                ? new Date(dbToken.updatedAt).toISOString()
                : null,
        },
    };
};

const instagramGraphGet = async (path, token) => {
    const separator = path.includes('?') ? '&' : '?';
    const url =
        `${IG_GRAPH_BASE}${path}${separator}` +
        `access_token=${encodeURIComponent(token)}`;
    const response = await axios.get(url);
    if (response.data?.error) {
        throw new Error(response.data.error.message || 'Graph API request failed');
    }
    return response.data;
};

const exchangeForLongLivedInstagramToken = async ({
    shortLivedToken,
    appSecret,
}) => {
    const response = await axios.get(
        'https://graph.instagram.com/access_token',
        {
            params: {
                grant_type: 'ig_exchange_token',
                client_secret: appSecret,
                access_token: shortLivedToken,
            },
        },
    );
    if (response.data?.error) {
        throw new Error(
            response.data.error.message || 'Failed to exchange long-lived token',
        );
    }
    return response.data || {};
};

const buildInstagramConnectedRedirectUrl = ({
    ok,
    errorCode,
    errorMessage,
}) => {
    const params = new URLSearchParams({
        ig_connected: '1',
        ok: ok ? '1' : '0',
    });
    if (errorCode) {
        params.set('errorCode', String(errorCode));
    }
    if (errorMessage) {
        params.set('error', String(errorMessage));
    }
    const base = IG_CONNECTED_REDIRECT_BASE.replace(/[?#].*$/, '');
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}${params.toString()}`;
};

app.get('/auth/instagram/login', async (req, res) => {
    try {
        const appId = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
        if (!appId) {
            return res.status(500).json({ error: 'Missing INSTAGRAM_APP_ID or FACEBOOK_APP_ID' });
        }

        let userIdInt = null;
        const queryToken = String(req.query.token || '').trim();
        if (queryToken) {
            userIdInt = validateToken({
                authorization: `Bearer ${queryToken}`,
            });
        }
        if (!userIdInt || userIdInt <= 0) {
            const tokenUserId = validateToken(req.headers);
            if (tokenUserId && tokenUserId > 0) {
                userIdInt = tokenUserId;
            }
        }
        if (!userIdInt || userIdInt <= 0) {
            const rawUserId = String(req.query.userId || '').trim();
            if (rawUserId) {
                userIdInt = await dbConnect.resolveUserPrimaryId(rawUserId);
            }
        }
        if (!userIdInt) {
            return res
                .status(400)
                .json({
                    error:
                        'Unable to resolve user. Pass double-encrypted token or valid userId.',
                });
        }
        const userId = String(userIdInt);

        const state = createSignedInstagramState(userId);

        const oauthUrl =
            `${IG_OAUTH_BASE}?client_id=${encodeURIComponent(appId)}` +
            `&redirect_uri=${encodeURIComponent(IG_REDIRECT_URI)}` +
            `&scope=${encodeURIComponent(IG_SCOPES)}` +
            `&response_type=code&state=${encodeURIComponent(state)}`;
        return res.redirect(oauthUrl);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get('/auth/instagram/callback', async (req, res) => {
    const {
        code,
        state,
        error,
        error_code: errorCode,
        error_message: errorMessage,
        error_description: errorDescription,
    } = req.query;

    const hasMetaError =
        Boolean(error) ||
        Boolean(errorCode) ||
        Boolean(errorMessage) ||
        Boolean(errorDescription);

    // Meta often omits `state` when it redirects back with an OAuth error.
    // In that case we can still show the error details to the user
    // (state is only needed to associate the callback with a specific user).
    if (!code && hasMetaError) {
        return res.redirect(
            buildInstagramConnectedRedirectUrl({
                ok: false,
                errorCode,
                errorMessage: String(
                    errorMessage || errorDescription || error || 'OAuth failed',
                ),
            }),
        );
    }

    if (!state) {
        return res.status(400).send('Missing state from Meta callback');
    }

    const parsedState = parseSignedInstagramState(state);
    const matchedUserId = parsedState?.userId;
    const matchedUserIdInt = parsePositiveInt(matchedUserId);
    if (!matchedUserIdInt) {
        return res.status(400).send('Invalid OAuth state');
    }

    if (!code || hasMetaError) {
        return res.redirect(
            buildInstagramConnectedRedirectUrl({
                ok: false,
                errorCode,
                errorMessage: String(
                    errorMessage || errorDescription || error || 'OAuth failed',
                ),
            }),
        );
    }

    try {
        const appId = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

        if (!appId || !appSecret) {
            throw new Error(
                'Missing INSTAGRAM_APP_ID or INSTAGRAM_APP_SECRET in environment',
            );
        }

        console.log('[instagram-oauth] Exchange code for token...');
        const tokenResponse = await axios.post(
            'https://api.instagram.com/oauth/access_token',
            {
                client_id: appId,
                client_secret: appSecret,
                grant_type: 'authorization_code',
                redirect_uri: IG_REDIRECT_URI,
                code: String(code),
            },
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const tokenJson = tokenResponse.data || {};
        const shortLivedToken = tokenJson.access_token;
        const shortLivedExpiresIn = Number(tokenJson.expires_in || 3600);
        if (!shortLivedToken) {
            throw new Error('Failed token exchange');
        }

        let longLivedToken = shortLivedToken;
        let longLivedExpiresIn = shortLivedExpiresIn;
        try {
            const longLivedResponse = await exchangeForLongLivedInstagramToken({
                shortLivedToken,
                appSecret,
            });
            if (longLivedResponse?.access_token) {
                longLivedToken = String(longLivedResponse.access_token);
                longLivedExpiresIn = Number(
                    longLivedResponse.expires_in || longLivedExpiresIn,
                );
            }
        } catch (exchangeError) {
            console.warn(
                '[instagram-oauth] Long-lived exchange failed, using short-lived token:',
                exchangeError?.message || exchangeError,
            );
        }

        console.log('[instagram-oauth] Token exchanged, getting user profile...');
        const userProfile = await instagramGraphGet(
            '/me?fields=user_id,username',
            longLivedToken,
        );
        console.log(
            '[instagram-oauth] /me response:',
            JSON.stringify(userProfile),
        );

        const igUserId = String(userProfile?.user_id || userProfile?.id || '');
        if (!igUserId) {
            throw new Error('Could not determine Instagram User ID.');
        }

        const tokenExpiresAtMs = Date.now() + longLivedExpiresIn * 1000;
        await dbConnect.upsertInstagramToken({
            userId: matchedUserIdInt,
            instagramUserId: igUserId,
            shortLivedToken,
            longLivedToken,
            expiresAt: new Date(tokenExpiresAtMs).toISOString(),
        });

        return res.redirect(
            buildInstagramConnectedRedirectUrl({
                ok: true,
            }),
        );
    } catch (error) {
        const metaErrorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.error_message ||
            error?.response?.data?.message ||
            error?.message ||
            'Unknown callback error';
        const metaErrorCode =
            error?.response?.data?.error?.code ||
            error?.response?.data?.error_code ||
            error?.response?.status ||
            '';
        return res.redirect(
            buildInstagramConnectedRedirectUrl({
                ok: false,
                errorCode: metaErrorCode,
                errorMessage: metaErrorMessage,
            }),
        );
    }
});

app.get('/auth/instagram/status', async (req, res) => {
    const resolved = await getInstagramSession(req);
    if (resolved.error) {
        return res.status(200).json({
            connected: false,
            needsReconnect: true,
            error: resolved.error,
        });
    }
    const { session } = resolved;
    return res.json({
        connected: Boolean(session.connected),
        igUserId: session.igUserId,
        pageId: null,
        lastConnectedAt: session.lastConnectedAt,
        error: null,
        errorCode: null,
    });
});

app.post('/auth/instagram/disconnect', async (req, res) => {
    const resolvedUser = resolveUserIdFromRequest(req);
    if (resolvedUser.error) {
        return res.status(400).json({ error: resolvedUser.error });
    }
    await dbConnect.deleteInstagramTokenByUserId(resolvedUser.userIdInt);
    return res.json({ ok: true });
});

app.get('/instagram/profile', async (req, res) => {
    const resolved = await getInstagramSession(req);
    if (resolved.error) {
        return res.status(404).json({
            needsReconnect: true,
            error: resolved.error,
        });
    }
    const { session } = resolved;

    try {
        if (!session.accessToken || !session.igUserId) {
            return res.status(401).json({
                needsReconnect: true,
                error: 'Missing token or IG user id',
            });
        }
        if (session.tokenExpiresAt && Date.now() > session.tokenExpiresAt) {
            return res.status(401).json({
                needsReconnect: true,
                error: 'Access token expired. Reconnect Instagram.',
            });
        }

        const profile = await instagramGraphGet(
            `/${session.igUserId}?fields=id,username,profile_picture_url`,
            session.accessToken,
        );
        return res.json({ data: profile });
    } catch (error) {
        const msg = String(error?.message || '').toLowerCase();
        const isTokenIssue = msg.includes('token') || msg.includes('expired');
        return res.status(isTokenIssue ? 401 : 500).json({
            needsReconnect: isTokenIssue,
            error: error.message,
        });
    }
});

app.get('/instagram/media', async (req, res) => {
    const resolved = await getInstagramSession(req);
    if (resolved.error) {
        return res.status(404).json({
            needsReconnect: true,
            error: resolved.error,
        });
    }
    const { session } = resolved;

    try {
        if (!session.accessToken || !session.igUserId) {
            return res.status(401).json({
                needsReconnect: true,
                error: 'Missing token or IG user id',
            });
        }
        if (session.tokenExpiresAt && Date.now() > session.tokenExpiresAt) {
            return res.status(401).json({
                needsReconnect: true,
                error: 'Access token expired. Reconnect Instagram.',
            });
        }

        const requestedLimit = Number.parseInt(String(req.query.limit || ''), 10);
        const limit = Number.isInteger(requestedLimit)
            ? Math.min(100, Math.max(1, requestedLimit))
            : 30;
        const afterCursor = String(req.query.after || '').trim();
        const afterQuery = afterCursor
            ? `&after=${encodeURIComponent(afterCursor)}`
            : '';

        const media = await instagramGraphGet(
            `/${session.igUserId}/media?fields=id,caption,media_type,media_product_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count&limit=${limit}${afterQuery}`,
            session.accessToken,
        );
        const nextCursor = media?.paging?.cursors?.after
            ? String(media.paging.cursors.after)
            : null;
        const hasMore = Boolean(media?.paging?.next || nextCursor);
        return res.json({
            data: media.data || [],
            cached: false,
            nextCursor,
            hasMore,
        });
    } catch (error) {
        const msg = String(error?.message || '').toLowerCase();
        const isTokenIssue = msg.includes('token') || msg.includes('expired');
        return res.status(isTokenIssue ? 401 : 500).json({
            needsReconnect: isTokenIssue,
            error: error.message,
        });
    }
});

// A simple Web UI to test without having the Flutter app
app.get('/instagram-test', (req, res) => {
    res.send(`
	<html>
	<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; text-align: center;">
		<h2>Instagram Flow Web Tester</h2>
		<p>Since the Flutter button is gone, you can test visually here.</p>
		<hr />
		<div style="margin: 20px 0;">
			<a href="/auth/instagram/login?userId=1" style="background:#0095f6; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">1. Connect Instagram</a>
		</div>
		<div style="margin: 20px 0;">
			<a href="/instagram/profile?userId=1" target="_blank" style="background:#333; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; display:inline-block;">2. View Profile Data</a>
		</div>
		<div style="margin: 20px 0;">
			<a href="/instagram/media?userId=1" target="_blank" style="background:#333; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; display:inline-block;">3. View Media (Reels & Posts)</a>
		</div>
	</body>
	</html>
	`);
});

app.get('/instagram/connected', (req, res) => {
    const ok = String(req.query.ok || '') === '1';
    const error = String(req.query.error || '');
    const errorCode = String(req.query.errorCode || '');
    return res.status(200).send(
        `<html><body style="font-family:Arial;padding:24px;">
			<h2>${ok ? 'Instagram connected' : 'Instagram connection status'}</h2>
			<p>${ok
            ? 'Connection completed. Return to the app to continue.'
            : 'Connection failed. Return to the app and try again.'
        }</p>
			${!ok && errorCode ? `<p><b>Error code:</b> ${errorCode}</p>` : ''}
			${!ok && error ? `<p><b>Error:</b> ${error}</p>` : ''}
		</body></html>`,
    );
});

// ─── API: Logout ────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Clears the session token for the authenticated user.
app.post('/api/auth/logout', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'logout',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// ─── API: Update Travel Info ─────────────────────────────────────────────────
// POST /api/profile/update-travel-info
// Updates user travel interests, services, expertise, places, and onboarding.
app.post('/api/profile/update-travel-info', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updateTravelInfo',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// ─── API: Fetch Notifications ────────────────────────────────────────────────
// POST /api/notifications/fetch
// Fetches paginated notifications for the authenticated user.
app.post('/api/notifications/fetch', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'fetchNotifications',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// ─── API: Update Subscription / Verify User ──────────────────────────────────
// POST /api/subscription/update
// Processes payment (Razorpay / Google / Apple) and grants premium access.
// REAL MONEY — treat with care.
app.post('/api/subscription/update', bodyParser.json(), async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'updateVerifyUser',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// ─── API: Change Last Active Status ──────────────────────────────────────────
// POST /api/settings/last-active
// Updates user's last-active timestamp and returns app settings / onboarding state.
app.post('/api/settings/last-active', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'changeLastActiveStatus',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// ─── API: Search Location ─────────────────────────────────────────────────────
// POST /api/search_location
// Searches locations (parity with search/search_location.php).
app.post('/api/search_location', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'searchLocationNode',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// ─── API: Search Buddy ────────────────────────────────────────────────────────
// POST /api/search_buddy
// Searches buddies/users (parity with search/search_buddy_new.php).
app.post('/api/search_buddy', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'searchBuddyNode',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// ─── API: Add Comment (v2 alias) ──────────────────────────────────────────────
// POST /api/posts/add-comment
// Add comment to a post — same as /api/posts/comment (v2 path per migration table).
app.post('/api/posts/add-comment', async (req, res) => {
    try {
        const payload = withPlainUserId(req, req.body || {});
        const token = getBearerToken(req);
        const response = await bem.jsInit({
            reason: 'postComment',
            data: payload,
            token: token,
        });
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: 'error', responseCode: 500, message: e.message });
    }
});

// All unhandled routes will be redirected to 404
app.get('*', async (_req, res) => {
    //Redirect to 404
    res.redirect('/404');
});

//Export the routes
module.exports = app;
