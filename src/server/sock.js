const socket_io = require("socket.io");
global.io = socket_io(global.server, {
    cors: {
        origin: ["localhost:1478", "ifp.projektares.tk", "admin.socket.io"],
    }
});

require("./otherSock");
require("./radio");
require("./socket/bot");

const valid = require("../validData");
const genId = require("../db/gen");

const botTest = require("./socket/bot");
const messInter = require("./chat");
const vInne = [
    require("./socket/inne"),
    require("./socket/invite"),
    require("./socket/file"),
    require("./socket/vc"),
    require("./socket/serverMgmt"),
    require("./socket/cases"),
];

const { user: usrDB } = global.db;

io.of("/").use((socket, next) => {
    function authError(str){
        const authError = new Error(str);
        authError.data = 'AuthenticationError';
        next(authError);
    }
    if(process.env.normal == "pt"){
        var ne = false;
        var cookie = socket.handshake.headers.cookie;
        if(cookie){
            cookie = cookieParse(cookie);
            if(cookie.session){
                var session = global.sessions[cookie.session];
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
    var { token } = socket.handshake.query;
    var isBotFlag = socket.handshake.query["bot"];
    if(isBotFlag+"" == "true"){
        socket.isUser = false;
    }else{
        socket.isUser = true;//botTest.connect(socket.handshake.headers) >= 70;
    }

    if(socket.isUser){
        var { rToken, name } = socket.handshake.query;
        if(!token || !name || !rToken){
            return authError(`valid`);
        }
        var hashBase = global.tokens.veryTemp(token);
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
        var tokenD = botTest.tokenVery(token);
        if(!tokenD) return authError(`token`);
        socket.user = tokenD.o;
    }

    next();
});

io.of("/").on("connection", (socket) => {
    async function statusStart(){
        let update = await global.db.userStatus.findOne({ id: socket.user._id });
        if(update) return;
        await global.db.userStatus.add({ id: socket.user._id, s: "", t: "a" });
        sendToSocket(socket.user._id, "getMyStatus", "", "a");
    }
    statusStart();

    socket.on("disconnect", () => {
        
    });

    socket.on("testMsg", (data) => {
        lo(data)
    })

    vInne.forEach(v => v(socket));

    socket.on("mess", async (req) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            var { to, msg, chnl } = req;
            if(!to || !msg || !chnl) return socket.emit("error", "to & msg & chnl is required");
            var enc = req.enc || "plain";
            
            var friendChat = to.startsWith("$");
            if(friendChat){
                var p1 = socket.user._id;
                var p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }

            var chat = await global.db.chat.meta.findOne({ id: to });
            if(!chat) return socket.emit("error", "chat is not exists - getMess");
            chat = chat.o;

            var message = msg.trim();
            if(msg.length > 500) return socket.emit("error", "msg jest za długie");
            
            var data = {
                fr: socket.user._id,
                msg: message,
                chnl,
                enc,
            }
            if(req.res) data.res = req.res;

            var _id = await global.db.chat.mess.add(to, data);

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
                to: "@"
            });
            chat.users.forEach(u => {
                if(u == socket.user._id) return;
                sendToSocket(u, "mess", data);
            })
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getMessage", async (to, chnl, start, finish, opt) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");

            var friendChat = to.startsWith("$")
            if(friendChat){
                var p1 = socket.user._id;
                var p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }

            var chat = await global.db.chat.meta.findOne({ id: to });
            if(!chat) return socket.emit("error", "chat is not exists - getMess");
            chat = chat.o;

            if(!friendChat){
                var user = await usrDB.findOne({ _id: socket.user._id });
                if(!user.o.chats.includes(to)) return socket.emit("error", "you not is this chat");
            }

            const responeAll = await global.db.chat.mess.find(to, { chnl });

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

            // --- temp ---
            categories = [
                {
                    name: "main",
                    id: "t",
                    channels: [
                        { name: "main", id: "main", type: "text" },
                        { name: "main", id: "mainV", type: "voice" },
                    ]
                }
            ]

            socket.emit("setUpServer", categories);
        }catch(e){
            lo(e);
        }
    });

    socket.on("friends", async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            var user = await usrDB.findOne({ _id: socket.user._id });
            var friends = user.o.friends;
            socket.emit("friends", friends);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getChats", async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth:");
            var chat = await usrDB.findOne({ _id: socket.user._id });
            chat = chat.o.chats;
            socket.emit("getChats", chat);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("logout", async () => {
        try{
            global.db.token.removeOne({ token: socket.rToken });
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("editMess", async (to, _id, msg) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");

            var friendChat = to.startsWith("$")
            if(friendChat){
                var p1 = socket.user._id;
                var p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }

            var mess = await global.db.chat.mess.findOne(to, { _id });
            if(!mess) return socket.emit("error", "msg is not exists");
            if(mess.o.fr != socket.user._id) return socket.emit("error", "not");

            const time = genId(0);
            await global.db.chat.mess.updateOne(to, { _id }, { msg, edit: true, lastEdit: time });
            sendToChatUsers(to, "editMess", _id, msg, time);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("delMess", async (to, _id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");

            var friendChat = to.startsWith("$")
            if(friendChat){
                var p1 = socket.user._id;
                var p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }

            var mess = await global.db.chat.mess.findOne(to, { _id });
            if(!mess) return socket.emit("error", "msg is not exists");
            if(mess.o.fr != socket.user._id) return socket.emit("error", "not");

            await global.db.chat.mess.removeOne(to, { _id });
            sendToChatUsers(to, "delMess", _id);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("inviteChat", async (id) => {
        if(!socket.user) return socket.emit("error", "not auth");
        var inv = await global.db.ic.findOne({ id });
        if(!inv) return socket.emit("error", "invite not exsists");
        inv = inv.o;
        
        var usr = await usrDB.findOne({ _id: socket.user._id });
        var usrChat = usr.o.chats;
        if(usrChat.includes(inv.chat)) return socket.emit("error", "user is exsists in chat");
        
        var res = await messInter.addUser(inv.chat, socket.user._id);
        socket.emit("inviteChat", res);
    });

    socket.on("createChat", async (name) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            var res = await messInter.createChat(name, socket.user._id);
            await messInter.addUser(res, socket.user._id);
            socket.emit("createChat", res);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("exitChat", async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            var res = await messInter.exitChat(id, socket.user._id);
            socket.emit("exitChat", res);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getInivteFromId", async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            var ic = await global.db.ic.findOne({ chat: id });
            socket.emit("getInivteFromId", ic.o.id);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("botPod", () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            socket.isUser = false;
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getChatIdFriends", (to) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(to.startsWith("$")){
                var p1 = socket.user._id;
                var p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }
            socket.emit("getChatIdFriends", to);
            }catch(e){
                lo("error: ", e)
            }
    });

    socket.on("getProfile", async id => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");

            let user = await usrDB.findOne({ _id: id });
            if(!user) return socket.emit("error", "user is not exsists");
            user = user.o;

            let statusD = await statusOpt(id);

            let data = {
                name: user.name,
                opis: user.opis,
                time: user._id.split("-")[0],
                status: statusD.s,
                statusType: statusD.t,
            };

            socket.emit("getProfile", data);
            }catch(e){
                lo("error: ", e)
            }
    });

    socket.on("setProfile", async data => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");

            let obj = {};
            if(data.opis) obj.opis = data.opis;

            await usrDB.updateOne({ _id: socket.user._id }, obj);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("setStatus", async (data, type) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");

            if(typeof data !== "string") return socket.emit("error", "not text!");
            if(typeof type !== "string") return socket.emit("error", "not text!");

            if(data.length > 100) data = data.slice(0, 100);
            if(type.length > 20) type = type.slice(0, 20);

            let update = await global.db.userStatus.updateOne({ id: socket.user._id }, { s: data, t: type });
            if(!update){
                await global.db.userStatus.add({ id: socket.user._id, s: data, t: type });
            }
            sendToSocket(socket.user._id, "getMyStatus", data, type);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getMyStatus", async () => {
        if(!socket.user) return socket.emit("error", "not auth");
        let statusD = await statusOpt(socket.user._id);

        socket.emit("getMyStatus", statusD.s, statusD.t);
    });

    socket.on("getFirendsActivity", async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");

            let user = await usrDB.findOne({ _id: socket.user._id });
            let friends = user.o.friends;
            for(let i=0; i<friends.length; i++){
                let id = friends[i];
                let statusD = await statusOpt(id);
                friends[i] =  { id, s: statusD.s, t: statusD.t };
            }
            friends = friends.filter(f => f.t != "i");
            socket.emit("getFirendsActivity", friends);
        }catch(e){
            lo("error: ", e)
        }
    });
});

global.getSocket = (to, room="") => {
    var map = io.of("/"+room).sockets;
    var all = [...map].map(([key, value]) => {
        value.ids = key;
        return value;
    });

    var res = all.filter(element => {
        return element.user._id == to;
    });
    return res;
}

global.sendToSocket = (id, chanel, ...more) => {
    getSocket(id).forEach(socket => {
        socket.emit(chanel, ...more);
    });
}

global.sendToChatUsers = async (to, chanel, ...more) => {
    var chat = await global.db.chat.meta.findOne({ id: to });
    chat = chat.o.users;
    chat.forEach(c => {
        sendToSocket(c, chanel, ...more)
    })
}

function cookieParse(cookie){
    var res = {};
    cookie = cookie.split(";");
    cookie.forEach(c => {
        var exlaus = c.indexOf("=");
        if(exlaus == -1) return;
        var name = c.substring(0, exlaus);
        var value = c.substring(exlaus+1)
        res[name] = value;
    });
    return res;
}

async function statusOpt(id){
    let statusDb = await global.db.userStatus.findOne({ id });
    if(!statusDb) return { s: "", t: "i" };

    let activy = getSocket(id).length > 0;
    if(!activy) return { s: "", t: "i" };
    let type = statusDb.o.t;
    if(type == "i") return { s: "", t: "i" };
    
    return { s: statusDb.o.s, t:  type };
}