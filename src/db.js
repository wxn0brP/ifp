const databaseC = require("./db/database");

global.db = {
    data: new databaseC("data/data"),
    mess: new databaseC("data/mess-db"),
    permission: new databaseC("data/perm-db"),
}