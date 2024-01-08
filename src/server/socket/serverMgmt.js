const permSys = require("../../permisionSystem");
const serverSet = global.db.serverSettings;
const genId = require("../../db/gen");

module.exports = (socket) => {
    socket.on("editServer", async (server, data) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "set")) return socket.emit("error", "permission");
            
            if(!data) return socket.emit("error", "params");
            let actualSet = await serverSet.findOne({ id: server });

            if(!actualSet) return socket.emit("error", "server valid");
            let settingsDef = require("../../chatAppLogicData/serverSettings");
            
            let settings = { ...settingsDef, ...actualSet.o.settings, ...data };

            await serverSet.updateOne({ id: server }, { settings });
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

    socket.on("getServerSettings", async (server) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "set")) return socket.emit("error", "permission");

            let roles = await perm.getRoles();
            let datas = (await global.db.serverSettings.findOne({ id: server })).o.settings;
            let data = {
                name: datas.name
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

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "roleMgmt")) return socket.emit("error", "permission");

            const roles = await perm.getRoles();
            let roleI = roles.findIndex(r => r.roleId == roleId);
            
            lo(roles.length, roleI)
            if(roleI == -1){
                return socket.emit("error", "noe exe");
            }
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

        try{
            const perm = new permSys(server);
            if(!await perm.userPermison(socket.user._id, "roleMgmt")) return socket.emit("error", "permission");

            if(!Array.isArray(perms)) return;

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