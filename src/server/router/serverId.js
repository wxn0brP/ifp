module.exports = async (req, res) => {
    const { s } = req.query;
    if(!s) return res.json({
        err: true, msg: "s is required"
    });

    var toId = await global.db.serverSettings.findOne({ id: s });
    if(!toId) return res.json({
        err: true, msg: "server is not found"
    });
    res.json({
        err: false, msg: toId.o.settings.name
    });
};