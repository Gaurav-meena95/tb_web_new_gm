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




firebase.initializeApp(firebaseConfig);

const db = firebase.database();

const username = prompt("Please Tell Us Your Name");

function sendMessage(e) {
    e.preventDefault();

    // get values to be submitted
    const timestamp = Date.now();
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;

    // clear the input box
    messageInput.value = "";

    //auto scroll to bottom
    document
        .getElementById("messages")
        .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

    // create db collection and send in the data
    db.ref("messages/" + timestamp).set({
        username,
        message,
    });
}

const fetchChat = db.ref("messages/");

fetchChat.on("child_added", function (snapshot) {
    const messages = snapshot.val();
    const message = `<li class=${username === messages.username ? "sent" : "receive"
        }><span>${messages.username}: </span>${messages.message}</li>`;
    // append the message on the page
    document.getElementById("messages").innerHTML += message;
});