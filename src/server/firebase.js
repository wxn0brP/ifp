var admin = require("firebase-admin");

var serviceAccount = require("../../data/firebase.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

global.firebaseAdmin = admin;