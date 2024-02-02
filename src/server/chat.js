const mess = global.db.mess;
const getId = require("../db/gen");
const crc = require('crc');
const fs = require('fs');

async function createChat(name, creater){
    const id = getId();
    mess.checkFile(id);

    const settings = {
        ...require("../chatAppLogicData/serverSettings"),
        name
    };
    await global.db.data.add("serverSettings", { // server settings
        id, settings, cat: [
            { name: "main",  id: getId(),
                channels: [ { name: "main", id: getId(), type: "text" }, { name: "main", id: getId(), type: "voice" }]
            }
        ]
    });

    let adminRole = getId();
    await global.db.permission.add(id, { // add admin role
        name: "admin", roleId: adminRole, perm: "all", parent: "all"
    });

    await global.db.permission.add(id, {
        userId: creater,
        roles: [adminRole]
    });

    await global.db.data.updateOne("user", { _id: creater }, (usr) => {
        usr.chats.push(id);
        return usr;
    });

    await global.db.data.add("ic", { id: getId(), chat: id, time: -1, count: -5 }); //add base inv

    return id;
}

async function addUser(id, user){
    if(!chatExsists(id)) return { err: true, msg: "chat is not found" };
    var userI = await global.db.data.findOne("user", { _id: user });
    if(!userI) return { err: true, msg: "user is not found" };

    let userInChat = await global.db.permission.findOne(id, { userId: user });
    if(userInChat) return { err: true, msg: "users is existsts" };
    
    await global.db.permission.add(id, {
        userId: user,
        roles: []
    });

    await global.db.data.updateOne("user", { _id: user }, (usr) => {
        usr.chats.push(id);
        return usr;
    });
    
    return { err: false, msg: "ok" };
}

async function exitChat(id, user){
    if(!chatExsists(id)) return { err: true, msg: "chat is not found" };
    var userI = await global.db.data.findOne("user", { _id: user });
    if(!userI) return { err: true, msg: "user is not found" };

    let userInChat = await global.db.permission.findOne(id, { userId: user });
    if(!userInChat) return { err: true, msg: "users is not existsts" };

    await global.db.permission.removeOne(id, { userId: user });

    await global.db.data.updateOne("user", { _id: user }, (usr) => {
        usr.chats = removeArrayItem(id, usr.chats);
        return usr;
    });

    return { err: false, msg: "ok" };
}

function combinateId(id1, id2){
    var p1 = id1.split("-")[0];
    var p2 = id2.split("-")[0];
    var rev = false;
    var mix = (a, b) => a.split("-")[1].slice(0, 3) + b.split("-")[1].slice(0, 3);

    if(crc.crc32(p1) < crc.crc32(p2)){
        rev = true;
        var t = p2;
        p2 = p1;
        p1 = t;
    }
    var pp = (rev ? mix(id2, id1) : mix(id1, id2));
    var p3 = crc.crc24(pp);
    return [p1, p2, p3].join("-");
}

function chatExsists(id){
    return fs.existsSync("data/mess-db/"+id);
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
    chatExsists,
}

module.exports = obj;

(async () => {
    let servers = global.db.permission.getDBs();
    servers.forEach(server => {
        global.db.mess.checkFile(server);
    })
})()