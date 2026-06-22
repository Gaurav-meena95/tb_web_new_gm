// Import the express module
var compression = require('compression')
const express = require('express');

//Call the functions.js file
const functions = require('./app/functions.js');
//require('./app/send-otp-auth');

//Body parser
const bodyParser = require('body-parser');
const { extend } = require('joi');

// Create an express application
const app = express();
app.use(compression());
// Keep Razorpay webhook body as raw bytes for HMAC verification.
app.use(
    '/webhooks/razorpay',
    bodyParser.raw({ type: 'application/json', limit: '5mb' }),
);
app.use(bodyParser.json({ limit: '2000mb' }));
app.use(bodyParser.urlencoded({ limit: '2000mb', extended: true }));
app.use(express.urlencoded({ limit: "2000mb", extended: true, parameterLimit: 50000 }))
app.use(express.json({ limit: "2000mb", extended: true }))

// Catch JSON parsing SyntaxError and return a 400 Bad Request JSON response
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(200).send({ response: "error", responseCode: 400, errorMessage: "Bad Request" });
    }
    next(err);
});

//Get the routes
const routes = functions.routes;

//Firebase
const analytics = require('firebase/analytics', 'logEvent');

//Use the routes
app.use('/', routes);
app.use('/upload', routes);
app.use('/experiences', routes);
app.set('view engine', 'pug');


// Listen on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');

    if (process.send) {
        process.send('online');
    }
});