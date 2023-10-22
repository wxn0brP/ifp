const permSys = require("../../permisionSystem");
const serverSet = global.db.serverSettings;

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
            lo(e);
        }
    });
}