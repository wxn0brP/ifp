const socket_io = require("socket.io");
global.io = socket_io(global.server, {
    cors: {
        origin: ["localhost:1478", "ifp.ct8.pl"],
    }
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
    var chat = await global.db.permission.find(to, (r) => r.userId);
    chat.forEach(c => {
        c = c.o.userId;
        sendToSocket(c, chanel, ...more)
    })
}

require("./socket/chat");
require("./otherSock");
require("./socket/bot");
require("./socket/chat");