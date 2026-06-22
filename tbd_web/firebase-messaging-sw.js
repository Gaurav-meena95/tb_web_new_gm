if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../firebase-messaging-sw.js')
        .then(function (registration) {
            console.log('Registration successful, scope is:', registration.scope);
        }).catch(function (err) {
            console.log('Service worker registration failed, error:', err);
        });
}

//Import firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-messaging.js');

/*
const firebaseConfig = {
    apiKey: "AIzaSyDEyi7tDJdu8Bv5T8p70UK_6Cp5y9PZPPU",
    authDomain: "travelbuddy-174317.firebaseapp.com",
    databaseURL: "https://travelbuddy-174317.firebaseio.com",
    projectId: "travelbuddy-174317",
    storageBucket: "travelbuddy-174317.appspot.com",
    messagingSenderId: "9959459076",
    appId: "1:9959459076:web:9aaea4618e26b62637a851",
    measurementId: "G-K2LQ971XLJ"
};
*/

const firebaseConfig = {
  apiKey: "AIzaSyBnKtZnePCqVLbr6jOUr4_Saf3iNmsZR-s",
  authDomain: "travelbuddy-174317.firebaseapp.com",
  databaseURL: "https://travelbuddy-174317.firebaseio.com",
  projectId: "travelbuddy-174317",
  storageBucket: "travelbuddy-174317.appspot.com",
  messagingSenderId: "9959459076",
  appId: "1:9959459076:web:c4417f188991113b37a851",
  measurementId: "G-PXBR867EGP"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// messaging.usePublicVapidKey('AAAAAlGhSQQ:APA91bFW2G0BOuJvMmsGLLXzwA61OicdRLAa5Tr_iGfRUH-H2O8_Yj-Jn9h_6Vnd1-1bvMlBtqgQF_Si9LfimHjoWeA_fXj2e1z6bAxGbWSyQe6oErUPCej1R_TwJsV1ROFKtLnI13pg');
messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.message,
        icon: 'https://beatravelbuddy.com/view/assets/img/app_logo_new.webp',
        data: { url: payload.data.onClick }, //the url which we gonna use later
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});
//Code for adding event on click of notification
self.addEventListener('notificationclick', function (event) {
    let url = event.notification.data.url;
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If so, just focus it.
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // ...
});
