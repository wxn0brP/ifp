module.exports = async (req, res) => {
    const { user } = req.query;
    if(!user) return res.json({
        err: true, msg: "user is required"
    });

    var toId = await global.db.data.findOne("user", { _id: user });
    if(!toId) return res.json({
        err: true, msg: "user is not found"
    });
    res.json({
        err: false, msg: toId.o.name
    });
};