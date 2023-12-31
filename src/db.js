const databaseC = require("./db/database");
const advDatabaseC = require("./db/db-adv");

global.db = {
    user: new databaseC(getPath("user"), require("./shemas/shema_user")),
    invites: new databaseC(getPath("invites")),
    token: new databaseC(getPath("token")),
    mess: new advDatabaseC("data/mess-db"),
    ic: new databaseC(getPath("ic")),
    bot: new databaseC(getPath("bot")),
    feed: new databaseC(getPath("feed")),
    permission: new advDatabaseC("data/perm-db"),
    serverSettings: new databaseC(getPath("server-settings")),
    userStatus: new databaseC(getPath("userStatus")),
    userGold: new databaseC(getPath("userGold")),
    cases: new databaseC(getPath("cases")),
    items: new databaseC(getPath("items")),
    fireBaseUser: new databaseC(getPath("fireBaseUser")),
}

function getPath(name){
    return "data/"+name+".db";
}

(async () => {
    // lo(await global.db.user.find({ok: "e"}))
})()