const loginA = require("./router/login");
const registerA = require("./router/register");
const register_kodA = require("./router/register-kod");
const userIdA = require("./router/userId");
const serverIdA = require("./router/serverId");
const userNameA = require("./router/userName");
const validTokenA = require("./router/validToken");
const getTempTokenA = require("./router/getTempToken");
const getQrCodeA = require("./router/getQrCode");
const resetA = require("./router/reset");
const resetKodA = require("./router/reset-kod");
const inviteChatA = require("./router/inviteChat");
const inviteChatGetA = require("./router/inviteChatGet");
const genIdA = require("./router/genId");
const notifRegA = require("./router/notif-reg");

module.exports = (app) => {
    require("./router/fs")(app);
    var pr = process.env.normal;
    if(pr == "n"){
        app.post("/login", loginA);
        app.post("/register", registerA);
        app.post("/register-kod", register_kodA);
        app.get("/userId", userIdA);
        app.get("/serverId", serverIdA);
        app.get("/userName", userNameA);
        app.post("/validToken", validTokenA);
        app.post("/getTempToken", getTempTokenA);
        app.get("/getQrCode", getQrCodeA);
        app.post("/reset", resetA);
        app.post("/reset-kod", resetKodA);
        app.post("/ic", inviteChatA);
        app.get("/ic/get", inviteChatGetA);
        app.get("/genId", genIdA);
        app.post("/notif-reg", notifRegA);
    }
}