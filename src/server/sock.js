const socket_io = require("socket.io");
global.io = socket_io(global.server, {
    cors: {
        origin: ["localhost:1478", "ifp.projektares.tk"],
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
];

const { user: usrDB, mess: messDB } = global.db;

io.of("/").use((socket, next) => {
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
            next(new Error(`{"type":"pt"}`));
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
            next(new Error(`{"type":"valid"}`));
            return;
        }
        var hashBase = global.tokens.veryTemp(token);
        if(!hashBase){
            next(new Error(`{"type": "token"}`));
            return;
        }
        if(hashBase.user.name != name){
            next(new Error(`{"type": "token."}`));
            return;
        }
        // lo(hashBase.name + " logged");
        socket.user = hashBase.user;
        socket.rToken = rToken;
    }else{
        var tokenD = botTest.tokenVery(token);
        if(!tokenD) return next(new Error(`{"type": "token"}`));
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
            var { to, msg, channel } = req;
            
            var friendChat = to.startsWith("$");
            if(friendChat){
                var p1 = socket.user._id;
                var p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }

            var chat = await global.db.chat.meta.findOne({ id: to });
            if(!chat) return socket.emit("error", "chat is not exists - getMess");
            chat = chat.o;

            var silent = false;
            var resMsg = false;
            var message = msg.trim();
            if(msg.startsWith("/silent ")){
                silent = true;
                message = message.replace("/silent ", "");
            }

            if(/^\/res (\w+-\w+-\w+)/.test(message)){
                resMsg = true;
            }

            if(msg.length > 90 + (resMsg ? 0 : 40)) return socket.emit("error", "msg jest za długie");
            
            var data = {
                from: socket.user._id,
                msg: message,
                channel
            }

            var _id = await global.db.chat.mess.add(to, data);

            if(!friendChat) data.to = to;
            else data.to = "$"+socket.user._id;
            
            data._id = _id._id;
            if(silent) data.silent = silent;
            sendToSocket(socket.user._id, "mess", {
                from: socket.user._id,
                msg: data.msg,
                channel, _id: _id._id,
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

    socket.on("getMessage", async (to, start, finish, opt) => {
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

            var responeAll = await global.db.chat.mess.find(to, {});

            var selectedMessages = responeAll.reverse().slice(start, finish);

            var respone = selectedMessages.map((val) => {
                return val.o;
            });

            socket.emit("getMessage", respone, opt);
        }catch(e){
            lo("error: ", e)
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
            if(mess.o.from != socket.user._id) return socket.emit("error", "not");

            await global.db.chat.mess.updateOne(to, { _id }, { msg, edit: true });
            sendToChatUsers(to, "editMess", _id, msg);
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
            if(mess.o.from != socket.user._id) return socket.emit("error", "not");

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

        // BUG czasem exit nie działa
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

    socket.on("callTo", id => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(global.getSocket(id).length == 0) return socket.emit("callRes", false);
        sendToSocket(id, "callTo", socket.user._id);
    });

    socket.on("callRes", (id, p) => {
        if(!socket.user) return socket.emit("error", "not auth");
        sendToSocket(id, "callRes", p);
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