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

    socket.on("get", async (name, arg={}) => {
        if(typeof arg == "object"){}
        else if(typeof arg == "string"){
            try{
                arg = new Function('obj', 'return (obj) => ' + arg);
                if(typeof arg == "function") arg = arg();
                else return socket.emit("err", "a");
            }catch{
                arg = {};
            }
        }

        let db = getDb(name);
        if(!db) return;
        let data = await db.find(arg);
        data = data.map(a => a.o);
        socket.emit("get", data);
    });
    socket.on("edit", async (name, undos) => {
        let db = getDb(name);
        if(!db) return;
        for(let i=0; i<undos.length; i++){
            await db.update({ _id: undos[i]._id }, { ...undos[i] });
        }
    })
});

function getDb(name){
    let data = global.db[name];
    if(!data) return;
    return data;
}