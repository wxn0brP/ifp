const loginA = require("./router/login");
const registerA = require("./router/register");
const register_kodA = require("./router/register-kod");
const userIdA = require("./router/userId");
const serverIdA = require("./router/serverId");
const userNameA = require("./router/userName");
const validTokenA = require("./router/validToken");
const getTempTokenA = require("./router/getTempToken");
const getQrCodeA = require("./router/getQrCode");
const chatBotA = require("./router/chatBot");
const resetA = require("./router/reset");
const resetKodA = require("./router/reset-kod");
const inviteChatA = require("./router/inviteChat");
const inviteChatGetA = require("./router/inviteChatGet");
const feedA = require("./router/feed");
const genIdA = require("./router/genId");

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
        app.get("/chatBot", chatBotA);
        app.post("/reset", resetA);
        app.post("/reset-kod", resetKodA);
        app.post("/ic", inviteChatA);
        app.get("/ic/get", inviteChatGetA);
        app.post("/feed", feedA);
        app.get("/genId", genIdA);
        app.get("/checkForNewMessages", (req, res) => {
            lo("aa")
            res.json([]);
        })
        // app.post("/github-webhook", (req, res) => {
        //     const eventType = req.headers['x-github-event'];
        //     lo(eventType, req.body);
        //     res.sendStatus(200);
        // })
    }
}