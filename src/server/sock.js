const socket_io = require("socket.io");
global.io = socket_io(global.server, {
    cors: {
        origin: ["localhost:1478", "ifp.projektares.tk", "admin.socket.io"],
    }
});

require("./otherSock");
require("./radio");
require("./socket/bot");

var botTest = require("./socket/bot");
var messInter = require("./chat");
var vInne = [
    require("./socket/inne"),
    require("./socket/invite"),
    require("./socket/file"),
    require("./socket/vc"),
    require("./socket//serverMgmt"),
];
const genId = require("../db/gen");

const { user: usrDB, mess: messDB } = global.db;

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
        socket.isUser = botTest.connect(socket.handshake.headers) >= 70;
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
    socket.on("disconnect", () => {
        
    });

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
            if(msg.length > 90) return socket.emit("error", "msg jest za długie");
            
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
    
    socket.on("getUserStatus", async (id) => {    
        if(!socket.user) return socket.emit("error", "not auth");    
        if(!socket.isUser) return socket.emit("error", "bot");
        var user = await usrDB.findOne({_id: id});
        if(!user) return socket.emit("error", "user is not exsists");
        var sock = getSocket(id);
        socket.emit("getUserStatus", { id, data: sock.length > 0 });
    });

    socket.on("getInivteFromId", async (id) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        var ic = await global.db.ic.findOne({ chat: id });
        socket.emit("getInivteFromId", ic.o.id);
    });

    socket.on("botPod", () => {
        if(!socket.user) return socket.emit("error", "not auth");
        socket.isUser = false;
    });

    socket.on("getChatIdFriends", (to) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(to.startsWith("$")){
            var p1 = socket.user._id;
            var p2 = to.replace("$", "");
            to = messInter.combinateId(p1, p2);
        }
        socket.emit("getChatIdFriends", to);
    });

    socket.on("getProfile", async id => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        let user = await usrDB.findOne({ _id: id });
        if(!user) return socket.emit("error", "user is not exsists");
        user = user.o;

        let status = await global.db.userStatus.findOne({ id });
        if(!status) status = "brak";
        else status = status.o.s;

        let data = {
            name: user.name,
            opis: user.opis,
            time: user._id.split("-")[0],
            status,
        };

        socket.emit("getProfile", data);
    });

    socket.on("setProfile", async data => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        let obj = {};
        if(data.opis) obj.opis = data.opis;

        await usrDB.updateOne({ _id: socket.user._id }, obj);
    });

    socket.on("setStatus", async data => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        if(typeof data !== "string") return socket.emit("error", "not text!");

        if(data.length > 100){
            data = data.slice(0, 100);
        }

        let update = await global.db.userStatus.updateOne({ id: socket.user._id }, { s: data });
        if(!update){
            await global.db.userStatus.add({ id: socket.user._id, s: data });
        }
        socket.emit("getMyStatus", data);
    });

    socket.on("getMyStatus", async () => {
        if(!socket.user) return socket.emit("error", "not auth");
        let status = await global.db.userStatus.findOne({ id: socket.user._id });
        if(!status) status = "brak";
        else status = status.o.s;

        socket.emit("getMyStatus", status);
    });
});

global.getSocket = (to) => {
    var map = io.of("/").sockets;
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