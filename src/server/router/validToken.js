module.exports = async (req, res) => {
    const { rToken } = req.body;
    if(!rToken) return res.send(false);
    var token = await global.db.data.findOne("token", { token: rToken });
    return res.send(token+"" != "false");
};