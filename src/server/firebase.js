var admin = require("firebase-admin");

try{
    var serviceAccount = require("../../data/firebase.json");
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}catch{}

global.firebaseAdmin = admin;