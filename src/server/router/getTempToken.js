module.exports = async (req, res) => {
    const { from, user_id, rToken } = req.body;
    if(!from || !user_id || !rToken) return res.send(false);

    var rTokenId = await global.db.data.findOne("token", { token: rToken });
    if(!rTokenId) return res.send(false);

    var tmpToken = await global.tokens.getTempToken({ name: from, _id: user_id }, rToken);
    res.send(tmpToken);
};