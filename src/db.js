const databaseC = require("./db/database");
const advDatabaseC = require("./db/db-adv");

global.db = {
    user: new databaseC(getPath("user"), require("./shemas/shema_user")),
    invites: new databaseC(getPath("invites")),
    token: new databaseC(getPath("token")),
    ic: new databaseC(getPath("ic")),
    bot: new databaseC(getPath("bot")),
    feed: new databaseC(getPath("feed")),
    permission: new advDatabaseC("data/perm-db"),
    serverSettings: new databaseC(getPath("server-settings")),
    userStatus: new databaseC(getPath("userStatus")),
}

function getPath(name){
    return "data/"+name+".db";
}

(async () => {
    // lo(await global.db.user.find({ok: "e"}))
})()