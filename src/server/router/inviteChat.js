var messInter = require("../chat");

module.exports = async (req, res) => {
    const { name, token, id } = req.body;
    if(!name || !token || !id) return res.json({ err: true, msg: "name & token & id is required" });

    var hashBase = global.tokens.veryTemp(token);
    if(!hashBase) return res.json({err: true, msg: "token"});
    if(hashBase.user.name != name) return res.json({err: true, msg: "token."});
    
    var inv = await global.db.ic.findOne({ id });
    if(!inv) return res.json({ err: true, msg: "invite not exsists" });
    inv = inv.o;

    var usr = await global.db.user.findOne({ name });
    var usrChat = usr.o.chats;
    if(usrChat.includes(inv.chat)) return res.json({ err: true, msg: "user is exsists in chat" });

    var re = await messInter.addUser(inv.chat, usr.o._id);
    res.json(re);
}