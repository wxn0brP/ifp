module.exports = async (req, res) => {
    var name = req.query.user;
    if(!name) return res.json({ err: true, msg: "user is required" });

    var user = await global.db.data.findOne("user", { name });
    if(!user) return res.json({ err: true, msg: "user not found" });
    res.json({ err: false, msg: user.o._id });
}