io.of("/admin").use((socket, next) => {
    const { name, pass } = socket.handshake.query;
    if(!name || !pass)
        return next(new Error("pass"));
    if(name !== process.env.rootDb || pass !== process.env.rootPassDb)
        return next(new Error("pass"));
    socket.mrm = true;
    log("user login to admin panel");
    next();
});

io.of("/admin").on("connection", socket => {
    if(!socket.mrm) return;

    socket.on("exe", async (name, type, finder={}, arg={}) => {
        if(typeof finder == "object"){}
        else if(typeof finder == "string"){
            try{
                finder = new Function('obj', 'return (obj) => ' + finder);
                if(typeof finder == "function") finder = finder();
                else return socket.emit("err", "a");
            }catch{
                finder = {};
            }
        }
        if(!finder) finder = {};

        let db = global.db[name];
        if(!db) return;
        let data;
        switch(type){
            case "add":
                data = await db.add(arg);
            break;

            case "find":
                data = await db.find(finder);
                data = data.map(a => a.o);
            break;

            case "findOne":
                data = await db.findOne(finder);
                if(data) data = data.o;
                else data = false;
            break;

            case "update":
                data = await db.update(finder, arg);
            break;

            case "updateOne":
                data = await db.updateOne(finder, arg);
            break;

            case "remove":
            case "delete":
                data = await db.remove(finder);
            break;

            case "removeOne":
            case "deleteOne":
                data = await db.removeOne(finder);
            break;
        }
        if(data) socket.emit("get", data);
    });
});