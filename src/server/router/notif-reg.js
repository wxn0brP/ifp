module.exports = async (req, res) => {
    const { token, id, user } = req.body;
    if(!token || !id || !user) return res.json({ err: true, msg: "token & id & user is required" });

    let userI = await global.db.data.findOne("user", { _id: id, name: user });
    if(!userI) return res.json({ err: true, msg: "not auth" });

    const dbToken = await global.db.data.updateOne("fireBaseUser", { token }, { token, id });
    if(!dbToken) await global.db.data.add("fireBaseUser", { token, id });
    
    res.json({ err: false, msg: "ok" });
}