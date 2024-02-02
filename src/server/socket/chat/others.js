const valid = require("../../../validData");
const messInter = require("../../chat");

module.exports = (socket) => {
    socket.on("type", async (to) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");

            var friendChat = to.startsWith("$")
            if(friendChat){
                var p1 = socket.user._id;
                var p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }
            var toServer = !friendChat ? to : "$"+socket.user._id;

            global.sendToChatUsers(to, "type", toServer, socket.user._id);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getStatus", async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            var friends = (await global.db.data.findOne("user", { _id: socket.user._id })).o.friends;
            var res = [...io.of("/").sockets]
                .map(([key, e]) => friends.includes(e.user._id) ? e.user._id : false)
                .filter(e => e);
            socket.emit("getStatus", res);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("botPod", () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            socket.isUser = false;
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getChatIdFriends", (to) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");
            if(to.startsWith("$")){
                var p1 = socket.user._id;
                var p2 = to.replace("$", "");
                to = messInter.combinateId(p1, p2);
            }
            socket.emit("getChatIdFriends", to);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getProfile", async id => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");

            let user = await global.db.data.findOne("user", { _id: id });
            if(!user) return socket.emit("error", "user is not exsists");
            user = user.o;

            let statusD = await statusOpt(id);

            let data = {
                name: user.name,
                opis: user.opis,
                time: user._id.split("-")[0],
                status: statusD.s,
                statusType: statusD.t,
            };

            socket.emit("getProfile", data);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("setProfile", async data => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(valid.str(data.opis, 0, 100)) return socket.emit("error", "valid data");

            let obj = {};
            if(data.opis) obj.opis = data.opis;

            await global.db.data.updateOne("user", { _id: socket.user._id }, obj);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("setStatus", async (data, type) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(!valid.str(data, 0, 30)) return socket.emit("error", "valid data");
            if(!valid.str(type, 0, 3)) return socket.emit("error", "valid data");

            if(data.length > 100) data = data.slice(0, 100);
            if(type.length > 20) type = type.slice(0, 20);

            let update = await global.db.data.updateOne("userStatus", { id: socket.user._id }, { s: data, t: type });
            if(!update){
                await global.db.data.add("userStatus", { id: socket.user._id, s: data, t: type });
            }
            sendToSocket(socket.user._id, "getMyStatus", data, type);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getMyStatus", async () => {
        if(!socket.user) return socket.emit("error", "not auth");
        let statusD = await statusOpt(socket.user._id);

        socket.emit("getMyStatus", statusD.s, statusD.t);
    });

    socket.on("getFirendsActivity", async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");

            let user = await global.db.data.findOne("user", { _id: socket.user._id });
            let friends = user.o.friends;
            for(let i=0; i<friends.length; i++){
                let id = friends[i];
                let statusD = await statusOpt(id);
                friends[i] =  { id, s: statusD.s, t: statusD.t };
            }
            friends = friends.filter(f => f.t != "i");
            socket.emit("getFirendsActivity", friends);
        }catch(e){
            lo("error: ", e)
        }
    });

}

async function statusOpt(id){
    let statusDb = await global.db.data.findOne("userStatus", { id });
    if(!statusDb) return { s: "", t: "i" };

    let activy = getSocket(id).length > 0;
    if(!activy) return { s: "", t: "i" };
    let type = statusDb.o.t;
    if(type == "i") return { s: "", t: "i" };
    
    return { s: statusDb.o.s, t:  type };
}