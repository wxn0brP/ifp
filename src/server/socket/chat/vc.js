const valid = require("../../../validData");
const rooms = {};

module.exports = (socket) => {
    function sendUserCount(to, type){
        if(!rooms[to]) return;
        let users = rooms[to].map(s => s.user._id);
        rooms[to].forEach(s => {
            s.emit("VCUsers", users, type);
        });
    }

    socket.on("joinVC", id => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");
        
        if(!rooms[id]) rooms[id] = [];

        let room = rooms[id];
        room.forEach(s => {
            s.emit("newVCId", socket.user._id, false);
            socket.emit("newVCId", s.user._id, true);
        });
        socket.vcId = id;
        room.push(socket);
        sendUserCount(id, "join");
    });

    socket.on("disconnect", () => {
        if(!socket.vcId) return;
        let id = socket.vcId;
        if(!rooms[id]) return; //socket.emit("error", "room not exsists");
        rooms[id] = rooms[id].filter(s => s.id != socket.id);
        sendUserCount(id, "leave");
        rooms[id].forEach(s => s.emit("VCUserLeave", socket.user._id));
    });

    socket.on("leaveVC", id => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");

        if(!rooms[id]) return;// socket.emit("error", "room not exsists");
        rooms[id] = rooms[id].filter(s => s.id != socket.id);
        sendUserCount(id, "leave");
        rooms[id].forEach(s => s.emit("VCUserLeave", socket.user._id));
    });

    socket.on("callTo", (to, room) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");
        if(!valid.str(room, 0, 30)) return socket.emit("error", "valid data");

        sendToSocket(to, "callTo", socket.user._id, room);
    });

    socket.on("joinVC-reconn", (id) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");

        if(!rooms[id]) rooms[id] = [];
        let s = rooms[id].filter(s => s.id == socket.id);
        if(s.length > 0) return;
        rooms[id].push(socket);
    });
}