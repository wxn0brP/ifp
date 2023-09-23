const { user: usrDB, mess: messDB } = global.db;
var messInter = require("../chat");

module.exports = (socket) => {
    socket.on("type", async (to) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
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
            var friends = (await usrDB.findOne({ _id: socket.user._id })).o.friends;
            var res = [...io.of("/").sockets]
                .map(([key, e]) => friends.includes(e.user._id) ? e.user._id : false)
                .filter(e => e);
            socket.emit("getStatus", res);
        }catch(e){
            lo("error: ", e)
        }
    });

}