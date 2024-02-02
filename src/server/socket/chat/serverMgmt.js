const permSys = require("../../../permisionSystem");
const genId = require("../../../db/gen");
const valid = require("../../../validData");

module.exports = (socket) => {
    socket.on("editServer", async (server, data) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        if(!valid.str(server, 0, 30)) return socket.emit("error", "valid data");
        if(!valid.obj(data)) return socket.emit("error", "valid data");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "set")) return socket.emit("error", "permission");
            
            if(!data) return socket.emit("error", "params");
            let actualSet = await global.db.data.findOne("serverSettings", { id: server });

            if(!actualSet) return socket.emit("error", "server valid");
            let settingsDef = require("../../../chatAppLogicData/serverSettings");
            
            let settings = { ...settingsDef, ...actualSet.o.settings, ...data };

            await global.db.data.updateOne("serverSettings", { id: server }, { settings });
        }catch(e){
            socket.emit("error", "error");
        }
    });

    socket.on("server_chnl", async (server, category) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        
        if(!valid.str(server, 0, 30)) return socket.emit("error", "valid data");
        if(!valid.arrayContainsOnlyType("object")) return socket.emit("error", "valid data");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "chnlMgmt")) return socket.emit("error", "permission");
            let oldsCategory = (await global.db.data.findOne("serverSettings", { id: server })).o.cat;
            await global.db.data.updateOne("serverSettings", { id: server }, { cat: category });

            function getChannels(categories){
                let chnls = [];
                for(let cat of categories)
                    for(let chnl of cat.channels) chnls.push(chnl.id)

                return chnls;
            }

            let oldC = getChannels(oldsCategory);
            let newC = getChannels(category);
            let rozC = oldC.filter(str => !newC.includes(str));
            for(let chnl of rozC){
                await global.db.mess.remove(server, { chnl });
            }
        }catch(e){
            socket.emit("error", "error");
        }
    });

    socket.on("getServerSettings", async (server) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        if(!valid.str(server, 0, 30)) return socket.emit("error", "valid data");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "set")) return socket.emit("error", "permission");

            let roles = await perm.getRoles();
            let datas = (await global.db.data.findOne("serverSettings", { id: server })).o;
            let data = {
                name: datas.settings.name,
                channels: datas.cat
            }

            socket.emit("getServerSettings", data, roles);
        }catch(e){
            console.error(e)
            socket.emit("error", "error2");
        }  
    });

    socket.on("server_addRole", async (server) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        if(!valid.str(server, 0, 30)) return socket.emit("error", "valid data");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "roleMgmt")) return socket.emit("error", "permission");

            const roles = await perm.getRoles();
            const lastRole = roles[roles.length-1].roleId;
            let roleId = genId();
            await global.db.permission.add(server, {
                roleId,
                perm: [],
                name: "Nowa rola",
                parent: lastRole,
            })
        }catch(e){
            console.error(e)
            socket.emit("error", "error2");
        } 
    });

    socket.on("server_rmRole", async (server, roleId) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        if(!valid.str(server, 0, 30)) return socket.emit("error", "valid data");
        if(!valid.str(roleId, 0, 30)) return socket.emit("error", "valid data");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "roleMgmt")) return socket.emit("error", "permission");

            const roles = await perm.getRoles();
            let roleI = roles.findIndex(r => r.roleId == roleId);
            
            if(roleI == -1){
                return socket.emit("error", "noe exe");
            }
            if(roleI.perm == "all") return;
            
            if(roleI != roles.length-1){
                await global.db.permission.updateOne(server, { roleId: roles[roleI+1].roleId }, { parent: roles[roleI].parent });
            }
            await global.db.permission.removeOne(server, { roleId });            
        }catch(e){
            console.error(e)
            socket.emit("error", "error2");
        } 
    });

    socket.on("server_chRole", async (server, roleId, name, perms) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        if(!valid.str(server, 0, 30)) return socket.emit("error", "valid data");
        if(!valid.str(roleId, 0, 30)) return socket.emit("error", "valid data");
        if(!valid.str(name, 0, 30)) return socket.emit("error", "valid data");
        if(!valid.arrayString(perms, 0, 30)) return socket.emit("error", "valid data");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "roleMgmt")) return socket.emit("error", "permission");

            await global.db.permission.updateOne(server, { roleId }, {
                name,
                perm: perms
            });            
        }catch(e){
            console.error(e)
            socket.emit("error", "error2");
        } 
    });

    socket.on("server_roleHier", async (server, roles) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");
        if(!valid.str(server, 0, 30)) return socket.emit("error", "valid data");
        if(!valid.arrayString(roles, 0, 30)) return socket.emit("error", "valid data");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "roleMgmt")) return socket.emit("error", "permission");

            for(let role of roles){
                await global.db.permission.updateOne(server, { roleId: role.roleId }, { parent: role.parent });
            }       
        }catch(e){
            console.error(e)
            socket.emit("error", "error2");
        } 
    });

}