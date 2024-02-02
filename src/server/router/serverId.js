module.exports = async (req, res) => {
    const { s } = req.query;
    if(!s) return res.json({
        err: true, msg: "s is required"
    });

    const toId = await global.db.data.findOne("serverSettings", { id: s });
    if(!toId) return res.json({
        err: true, msg: "server is not found"
    });
    const settings = toId.o.settings;
    res.json({
        err: false, msg: settings.name
    });
};