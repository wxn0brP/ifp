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

io.of("/debb").on("connection", (socket) => {
    // var auth = false;
    // socket.on("auth", (l, p) => {
    //     if(l == process.env.DebLogin && p == process.env.DebPass) auth = true;
    //     else socket.disconnect();
    // });

    // socket.on("msg", async (data) => {
    //     if(!auth) return socket.emit("msg", "ok");
    //     var res;
    //     try{
    //         res = await eval(data);
    //     }catch(e){
    //         res = e;
    //     }
    //     socket.emit("msg", res);
    // });
});

var teMain = null;
io.of("/te").on("connection", socket => {
    socket.on("cmd", d => {
        teMain.emit("cmds", d);
    });
    socket.on("log", (p) => {
        if(p != "yolo") return;
        teMain = socket;
    })
    socket.on("cdS", (d) => {
        if(!teMain) return;
        socket.broadcast.emit("cd", d);
    })
    socket.on("cmdS", (d) => {
        if(!teMain) return;
        socket.broadcast.emit("cmd", d);
    })
});