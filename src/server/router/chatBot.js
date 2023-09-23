var que = require("../../chat-bot/cb");

module.exports = async (req, res) => {
    var { q } = req.query;
    if(!q) return res.json({ err: true });
    var pyt = q.replaceAll("+", " ");
    var odp = que(pyt);
    res.json({
        err: false,
        data: odp
    });
}