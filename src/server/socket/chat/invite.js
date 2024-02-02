const valid = require("../../../validData");
const chat = require("../../chat");

module.exports = (socket) => {
    socket.on("invites", async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            const invites = await global.db.data.find("invites", { to: socket.user._id });

            if(invites.length > 0){
                const filteredResults = invites.map((result) => result.o);
                socket.emit("invites", filteredResults);
            }else{
                socket.emit("invites", false);
            }
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("invite", async (to) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");

            if(to == socket.user._id) return socket.emit("error", "nie możesz wysłać zapro do siebie");

            var toId = await global.db.data.findOne("user", { _id: to });
            if(!toId) return socket.emit("error", "user is not exists - invite");

            var user = await global.db.data.findOne("user", { _id: socket.user._id });
            if(user.o.friends.includes(to)){
                return socket.emit("error", "przyjaciel");
            }
            var inviteTest = await global.db.data.findOne("invites", { from: socket.user._id, to: to });
            if(inviteTest) return socket.emit("error", "zapro już jest");
            inviteTest = await global.db.data.findOne("invites", { from: to, to: socket.user._id });
            if(inviteTest) return socket.emit("error", "zapro już jest");

            var newInvite = {
                from: socket.user._id,
                to: toId.o._id,
            }
            var inv = await global.db.data.add("invites", newInvite);

            sendToSocket(to, "invite", inv);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("inviteAccept", async (inviteId) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(!valid.str(inviteId, 0, 30)) return socket.emit("error", "valid data");
            
            var invite = await global.db.data.findOne("invites", {_id: inviteId});
            if(!invite) return socket.emit("error", "Invite not found");
            invite = invite.o;
            
            var fromId = (await global.db.data.findOne("user", {_id: invite.from})).o.friends;
            var toId = (await global.db.data.findOne("user", {_id: invite.to})).o.friends;

            fromId.push(invite.to);
            toId.push(invite.from);
            
            await global.db.data.updateOne("user", { _id: socket.user._id }, { friends: toId });
            await global.db.data.updateOne("user", { _id: invite.from }, { friends: fromId });

            await global.db.data.removeOne("invites", {_id: inviteId});
            
            var p1 = invite.to;
            var p2 = invite.from;
            var cid = chat.combinateId(p1, p2);
            await global.db.mess.checkFile(cid);

            sendToSocket(invite.from, "inviteAccept", invite.to);
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("inviteDelice", async (friendId) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(!valid.str(friendId, 0, 30)) return socket.emit("error", "valid data");
        
            var invite = await global.db.data.findOne("invites", { _id: friendId });
            if(!invite) return socket.emit("error", "invite not found");
            invite = invite.o;
            await global.db.data.removeOne("invites", { _id: friendId });

            sendToSocket(invite.from, "inviteDelice", invite.to);
        }catch(e){
            lo("error: ", e)
        }
    });
    
    socket.on("deleteFriends", async (friendId) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(!valid.str(friendId, 0, 30)) return socket.emit("error", "valid data");
        
            const user = await global.db.data.findOne("user", { _id: socket.user._id });
            const friends = user.o.friends;
            const friendIndex = friends.indexOf(friendId);

            if(friendIndex !== -1){
                friends.splice(friendIndex, 1);
                await global.db.data.updateOne("user", { _id: socket.user._id }, { friends });
            }else{
                return socket.emit("error", "Friend not found");
            }
        
            const friend = await global.db.data.findOne("user", { _id: friendId });
            const friendFriends = friend.o.friends;
            const userIndex = friendFriends.indexOf(socket.user._id);
            if(userIndex !== -1){
                friendFriends.splice(userIndex, 1);
                await global.db.data.updateOne("user", { _id: friendId }, { friends: friendFriends });
            }

            sendToSocket(socket.user._id, "deleteFriends");
            sendToSocket(friendId, "deleteFriends");
        }catch(e){
            lo("error: ", e)
        }
    });

    socket.on("getInivteFromId", async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.isUser) return socket.emit("error", "bot");
            if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");

            var ic = await global.db.data.findOne("id", { chat: id });
            socket.emit("getInivteFromId", ic.o.id);
        }catch(e){
            lo("error: ", e)
        }
    });

}