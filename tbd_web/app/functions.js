//Description: This file calls all the files & functions in the app folder

const bem = require('./bem.js');
const api_helper = require('./api-helper.js');
const db_connect = require('./db-connect.js');
const routes = require('./routes.js');
const auth = require('./auth.js');
const seqConfig = require('./config/sequelize_config');
const seoFormatter = require('./seo-formatter.js');
const firebaseChat = require('./firebase-chat-connection.js');


// Export the functions
module.exports = {
    bem: bem,
    api_helper: api_helper,
    db_connect: db_connect,
    routes: routes,
    auth: auth,
    seqConfig: seqConfig,
    seoFormatter: seoFormatter,
    firebaseChat: firebaseChat
}
