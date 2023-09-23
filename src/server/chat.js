var mess = new (require("../db/db-adv"))("data/mess-db");
var meta = new (require("../db/database"))("data/mess-meta.db");
var more = require("../db/more");
const crc = require('crc');

async function createChat(name, creater, id=false){
    if(!id) id = more.getId();
    mess.checkFile(id);
    await meta.add({
        id,
        users: [],
        name,
        admin: [creater]
    });
    await global.db.ic.add({ id: more.getId(), chat: id, time: -1, count: -5 });
    return id;
}

async function addUser(id, user, addChat=true){
    var chat = await meta.findOne({ id });
    if(!chat) return { err: true, msg: "chat is not found" };
    var userI = await global.db.user.findOne({ _id: user });
    if(!userI) return { err: true, msg: "user is not found" };

    chat = chat.o;
    
    var users = chat.users || [];
    if(users.includes(user)) return { err: true, msg: "users is existsts" };
    
    users.push(user);
    await meta.updateOne({ id }, { users });
    if(addChat){
        userI = userI.o.chats || [];
        userI.push(id);
        await global.db.user.updateOne({ _id: user }, { chats: userI });
    }
    
    return { err: false, msg: "ok" };
}

async function exitChat(id, user){
    var chat = await meta.findOne({ id });
    if(!chat) return { err: true, msg: "chat is not found" };
    var userI = await global.db.user.findOne({ _id: user });
    if(!userI) return { err: true, msg: "user is not found" };

    chat = chat.o.users;
    userI = userI.o.chats;
    if(!userI.includes(id)) return { err: true, msg: "user not is chat" };

    chat = removeArrayItem(user, chat);
    userI = removeArrayItem(id, userI);

    await meta.updateOne({ id }, { users: chat });
    await global.db.user.updateOne({ _id: user }, { chats: userI });
}

function combinateId(id1, id2){
    var p1 = id1.split("-")[0];
    var p2 = id2.split("-")[0];
    var rev = false;

    if(crc.crc32(p1) < crc.crc32(p2)){
        rev = true;
        var t = p2;
        p2 = p1;
        p1 = t;
    }
    var pp;
    if(!rev){
        pp = id1.split("-")[1].slice(0, 3) + id2.split("-")[1].slice(0, 3);
    }else{
        pp = id2.split("-")[1].slice(0, 3) + id1.split("-")[1].slice(0, 3);
    }
    var p3 = crc.crc24(pp);
    return [p1, p2, p3].join("-");
}

function removeArrayItem(item, array){
    var index = array.indexOf(item);
    if(index !== -1) array.splice(index, 1);
    return array;
}

var obj = {
    createChat,
    addUser,
    exitChat,
    combinateId,
    mess,
    meta
}

module.exports = obj;
global.db.chat = obj;

// check files
async function start(){
    (await meta.find({})).forEach(chat => {
        mess.checkFile(chat.o.id);
    });
}
start();