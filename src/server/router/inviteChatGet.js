var messInter = require("../chat");

module.exports = async (req, res) => {
    var { id } = req.query;
    if(!id) return res.json({ err: true, msg: "id is required" });

    var inv = await global.db.ic.findOne({ id });
    if(!inv) return res.json({ err: true, msg: "invite not exsists" });
    inv = inv.o;

    if(inv.time != -1 && inv.time < Date.now()){
        await global.db.ic.removeOne({ id });
        return res.json({ err: true, msg: "invite timeout" });
    }
    inv.count--;
    if(inv.count != -6 && inv.count <= 0){
        await global.db.ic.removeOne({ id });
        return res.json({ err: true, msg: "invite count" });
    }

    var respone = {}
    respone.name = (await global.db.chat.meta.findOne({ id: inv.chat }))?.o?.name;
    respone.id = inv.chat;

    res.json({ err: false, msg: respone });
}