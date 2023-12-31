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
    //FIXME invite
    inv.count--;
    if(inv.count != -6 && inv.count <= 0){
        await global.db.ic.removeOne({ id });
        return res.json({ err: true, msg: "invite count" });
    }

    var respone = {};
    let name = await global.db.serverSettings.findOne({ id: inv.chat });
    if(!name) return res.json({ err: true, msg: "server not found" });
    name = name?.o?.settings?.o;
    respone.name = name;
    respone.id = inv.chat;

    res.json({ err: false, msg: respone });
}