module.exports = async (req, res) => {
    const { rToken } = req.body;
    if(!rToken) return res.send(false);
    var token = await global.db.token.findOne({ token: rToken });
    return res.send(token+"" != "false");
};