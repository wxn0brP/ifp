const permSys = require("../../permisionSystem");
const serverSet = global.db.serverSettings;
const genId = require("../../db/gen");

module.exports = (socket) => {
    socket.on("editServer", async (data) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        if(!data.server || !data.change) return socket.emit("error", "params");

        try{
            const perm = new permSys(data.server);
            if(!await perm.userPermison(socket.user._id, data.change)) return socket.emit("error", "permission");
            
            switch(data.change){
                case "set":
                    if(!data.sett) return socket.emit("error", "params");
                    let actualSet = await serverSet.findOne({ id: data.server });

                    if(!actualSet) return socket.emit("error", "server valid");
                    let settingsDef = require("../../chatAppLogicData/serverSettings");
                    
                    let settings = { ...settingsDef, ...actualSet.o.settings, ...data.sett };

                    await serverSet.updateOne({ id: data.server }, { settings });
                break;
            }

        }catch(e){
            socket.emit("error", "error");
        }
    });

    socket.on("server_addChnl", async (server, name, category, type) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "chnlMgmt")) return socket.emit("error", "permission");

            let categorys = await serverSet.findOne({ id: server });
            if(!categorys) return socket.emit("error", "params");
            categorys = categorys.o.cat;

            let cat = categorys.findIndex(o => o.id == category);
            if(cat == -1) return socket.emit("error", "params");

            let id = genId();
            categorys[cat].channels.push({
                id,
                name,
                type
            });

            await serverSet.updateOne({ id: server }, { cat: categorys });
            socket.emit("server_addChnl", id);
        }catch(e){
            socket.emit("error", "error");
        }
        
    });

    socket.on("server_addCat", async (server, name) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "chnlMgmt")) return socket.emit("error", "permission");

            let categorys = await serverSet.findOne({ id: server });
            if(!categorys) return socket.emit("error", "params");
            categorys = categorys.o.cat || [];

            let id = genId();
            categorys.push({
                id,
                name,
                channels: []
            });

            await serverSet.updateOne({ id: server }, { cat: categorys });
            socket.emit("server_addCat", id);
        }catch(e){
            lo(e)
            socket.emit("error", "error");
        }
    });

    socket.on("server_delChnl", async (server, id) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "chnlMgmt")) return socket.emit("error", "permission");

            let categorys = await serverSet.findOne({ id: server });
            if(!categorys) return socket.emit("error", "params");
            categorys = categorys.o.cat;
            
            categorys.forEach(cat => {
                cat.channels = cat.channels.filter(channel => channel.id !== id);
            });

            await serverSet.updateOne({ id: server }, { cat: categorys });
        }catch(e){
            socket.emit("error", "error");
        }  
    });

    socket.on("server_delCat", async (server, category) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "chnlMgmt")) return socket.emit("error", "permission");

            let categorys = await serverSet.findOne({ id: server });
            if(!categorys) return socket.emit("error", "params");
            categorys = categorys.o.cat;

            categorys = categorys.filter(c => c.id != category);

            await serverSet.updateOne({ id: server }, { cat: categorys });
        }catch(e){
            socket.emit("error", "error");
        }  
    });

    socket.on("getServerPerm", async (server) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "get")) return socket.emit("error", "permission");

            socket.emit("getServerPerm")
        }catch(e){
            socket.emit("error", "error");
        }  
    });


}