const valid = require("../../validData");
const genId = require("../../db/gen");

const botTest = require("./bot");
const messInter = require("../chat");
const vInne = [
    require("./chat/cases"),
    require("./chat/file"),
    require("./chat/invite"),
    require("./chat/others"),
    require("./chat/serverMgmt"),
    require("./chat/vc"),
];

io.of("/").use((socket, next) => {
    function authError(str){
        const authError = new Error(str);
        authError.data = 'AuthenticationError';
        next(authError);
    }
    if(process.env.normal == "pt"){
        let ne = false;
        let cookie = socket.handshake.headers.cookie;
        if(cookie){
            cookie = cookieParse(cookie);
            if(cookie.session){
                let session = global.sessions[cookie.session];
                if(session?.loged){
                    ne = true;
                }
            }
        }
        if(!ne){
            authError(`pt`);
            return;
        }
    }
    let { token } = socket.handshake.query;
    let isBotFlag = socket.handshake.query["bot"];
    if(isBotFlag+"" == "true"){
        socket.isUser = false;
    }else{
        socket.isUser = true;//botTest.connect(socket.handshake.headers) >= 70;
    }

    if(socket.isUser){
        let { rToken, name } = socket.handshake.query;
        if(!token || !name || !rToken){
            return authError(`valid`);
        }
        let hashBase = global.tokens.veryTemp(token);
        if(!hashBase){
            return authError(`token`);
        }
        if(hashBase.user.name != name){
            return authError(`token.`);
        }
        // lo(hashBase.name + " logged");
        socket.user = hashBase.user;
        socket.rToken = rToken;
    }else{
        let tokenD = botTest.tokenVery(token);
        if(!tokenD) return authError(`token`);
        socket.user = tokenD.o;
    }

    next();
});

io.of("/").on("connection", (socket) => {
    async function statusStart(){
        let update = await global.db.data.findOne("userStatus", { id: socket.user._id });
        if(update) return;
        await global.db.data.add("userStatus", { id: socket.user._id, s: "", t: "a" });
        sendToSocket(socket.user._id, "getMyStatus", "", "a");
    }
    statusStart();

    socket.on("disconnect", () => {
        
    });

    socket.on("mess", async (req) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            let { to, msg, chnl } = req;
            if(!to || !msg || !chnl) return socket.emit("error", "to & msg & chnl is required");
            let enc = req.enc || "plain";

            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");
            if(!valid.str(chnl, 0, 30)) return socket.emit("error", "valid data");
            if(!valid.str(enc, 0, 30)) return socket.emit("error", "valid data");
            if(!valid.str(msg, 0, 500)) return socket.emit("error", "valid data");
            
            let friendChat = to.startsWith("$");
            if(friendChat){
                let p1 = socket.user._id;
                let p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }

            if(!messInter.chatExsists(to)) return socket.emit("error", "chat is not exists - getMess");

            let message = msg.trim();
            if(msg.length > 500) return socket.emit("error", "msg jest za długie");
            
            let data = {
                fr: socket.user._id,
                msg: message,
                chnl,
                enc,
            }
            if(req.res) data.res = req.res;

            let _id = await global.db.mess.add(to, data);

            if(!friendChat) data.to = to;
            else data.to = "$"+socket.user._id;
            
            data._id = _id._id;
            if(req.silent) data.silent = silent;
            sendToSocket(socket.user._id, "mess", {
                fr: socket.user._id,
                msg: data.msg,
                chnl,
                _id: _id._id,
                enc,
                to: "@",
                res: data.res || undefined
            });

            if(!friendChat){
                let chat = await global.db.permission.find(to, r => r.roleId);
                chat.forEach(u => {
                    u = u.o.userId;
                    if(u == socket.user._id) return;
                    sendToSocket(u, "mess", data);
                    sendNewMsgToFireBase(socket.user._id, u, data);
                })
            }else{
                let toSend = req.to.replace("$","");
                sendToSocket(toSend, "mess", data);
                sendNewMsgToFireBase(socket.user._id, toSend, data);
            }
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getMessage", async (to, chnl, start, finish, opt) => {
        try{
            // BUG reverse ma jakieś problemy egzystencjalnie i nie zawsze działą
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");

            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");
            if(!valid.str(chnl, 0, 30)) return socket.emit("error", "valid data");
            if(!valid.num(start)) return socket.emit("error", "valid data");
            if(!valid.num(finish)) return socket.emit("error", "valid data");

            let friendChat = to.startsWith("$")
            if(friendChat){
                let p1 = socket.user._id;
                let p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }

            if(!messInter.chatExsists(to)) return socket.emit("error", "chat is not exists - getMess");

            if(!friendChat){
                let user = await global.db.data.findOne("user", { _id: socket.user._id });
                if(!user.o.chats.includes(to)) return socket.emit("error", "you not is this chat");
            }

            const responeAll = await global.db.mess.find(to, { chnl });

            const selectedMessages = responeAll.reverse().slice(start, finish);

            const respone = selectedMessages.map((val) => {
                return val.o;
            });

            socket.emit("getMessage", respone, opt);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("setUpServer", async id => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");
            
            let categories;

            let serverSettings = await global.db.data.findOne("serverSettings", { id });
            if(!serverSettings) return;

            categories = serverSettings.o.cat;

            let perms = await global.db.permission.find(id, {});
            perms = perms.map(r => r.o);

            let roles = perms.filter((obj) => !!obj.roleId);
            roles = roles.map(r => {
                return {
                    roleId: r.roleId,
                    color: r.c || "",
                    parent: r.parent
                }
            })

            let users = perms.filter((obj) => !!obj.userId);
            users = users.map(u => {
                return {
                    id: u.userId,
                    roles: u.roles
                }
            });

            socket.emit("setUpServer", categories, roles, users);
        }catch(e){
            lo(e);
        }
    });

    socket.on("friends", async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            let user = await global.db.data.findOne("user", { _id: socket.user._id });
            let friends = user.o.friends;
            socket.emit("friends", friends);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getChats", async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth:");
            let chat = await global.db.data.findOne("user", { _id: socket.user._id });
            chat = chat.o.chats;
            socket.emit("getChats", chat || []);
        }catch(e){
            lo("error: ", e)
        }
    });

    // TODO zmienić auth bo jest do ****
    // socket.on("logout", async () => {
    //     try{
    //         global.db.data.removeOne("token", { token: socket.rToken });
    //     }catch(e){
    //         lo("error: ", e)
    //     }
    // });

    socket.on("editMess", async (to, _id, msg) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");
            if(!valid.str(_id, 0, 30)) return socket.emit("error", "valid data");
            if(!valid.str(msg, 0, 500)) return socket.emit("error", "valid data");

            let friendChat = to.startsWith("$")
            if(friendChat){
                let p1 = socket.user._id;
                let p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }

            let mess = await global.db.mess.findOne(to, { _id });
            if(!mess) return socket.emit("error", "msg is not exists");
            if(mess.o.fr != socket.user._id) return socket.emit("error", "not");

            const time = genId(0);
            await global.db.mess.updateOne(to, { _id }, { msg, edit: true, lastEdit: time });
            sendToChatUsers(to, "editMess", _id, msg, time);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("delMess", async (to, _id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");
            if(!valid.str(_id, 0, 30)) return socket.emit("error", "valid data");

            let friendChat = to.startsWith("$")
            if(friendChat){
                let p1 = socket.user._id;
                let p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }

            let mess = await global.db.mess.findOne(to, { _id });
            if(!mess) return socket.emit("error", "msg is not exists");
            if(mess.o.fr != socket.user._id) return socket.emit("error", "not");

            await global.db.mess.removeOne(to, { _id });
            sendToChatUsers(to, "delMess", _id);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("inviteChat", async (id) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");

        let inv = await global.db.data.findOne("ic", { id });
        if(!inv) return socket.emit("error", "invite not exsists");
        inv = inv.o;
        
        let usr = await global.db.data.findOne("user", { _id: socket.user._id });
        let usrChat = usr.o.chats;
        if(usrChat.includes(inv.chat)) return socket.emit("error", "user is exsists in chat");
        
        let res = await messInter.addUser(inv.chat, socket.user._id);
        socket.emit("inviteChat", res.msg);
    });

    socket.on("createChat", async (name) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(!valid.str(name, 0, 30)) return socket.emit("error", "valid data");

            let res = await messInter.createChat(name, socket.user._id);
            socket.emit("createChat", res);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("exitChat", async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");

            let res = await messInter.exitChat(id, socket.user._id);
            socket.emit("exitChat", res);
        }catch(e){
            lo("error: ", e)
        }
    });

    vInne.forEach(v => v(socket));
});

function cookieParse(cookie){
    let res = {};
    cookie = cookie.split(";");
    cookie.forEach(c => {
        let exlaus = c.indexOf("=");
        if(exlaus == -1) return;
        let name = c.substring(0, exlaus);
        let value = c.substring(exlaus+1)
        res[name] = value;
    });
    return res;
}

async function sendNewMsgToFireBase(from, id, data){
    const socket = getSocket(id);
    if(socket.length > 0) return;

    let tokens = await global.db.data.find("fireBaseUser", { id });
    if(tokens.length == 0) return;
    tokens = tokens.map(t => t.o.token);

    
    let title = "Nowa Wiadomość od ";
    if(data.to.startsWith("$")){
        const user = (await global.db.data.findOne("user", { _id: from })).o;
        title += user.name;
    }else{
        const server = (await global.db.data.findOne("serverSettings", { id })).o.settings;
        title += "(S) " + server.name;
    }
    let body = "";
    if(data.enc == "plain"){
        body = data.msg;
    }
    
    try{
        tokens.forEach(async token => {
            try{
                await global.firebaseAdmin.messaging().send({
                    notification: { title, body },
                    token,
                });
            }catch{}
        })
    }catch{}
}