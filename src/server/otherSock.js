io.of("/qr_code").on("connection", (socket) => {
    socket.on("set", (id) => {
        socket._ik = id;
    });

    socket.on("send", (data, to) => {
        var map = io.of("/qr_code").sockets;
        var all = [...map].map(([key, value]) => {
            value.ids = key;
            return value;
        });

        var res = all.filter(element => {
            return element._ik == to;
        });
        res.forEach(socket => {
            socket.emit("get", data);
        });
    })
});

const gen = require("./../db/gen");
const vcFree = require("./socket/vc");
io.of("/vcFree").on("connection", socket => {
    let id = gen();
    socket.user = {
        _id: id,
        name: "user"+id,
    }
    vcFree(socket);
    socket.emit("con", socket.user.name, socket.user._id);
});

require("./socket/snakes");
require("./socket/admin");