const crypto = require('crypto');

module.exports = async (req, res) => {
    const { name, password, email } = req.body;
    if(!name || !password || !email) return res.json({err: true, msg: "name & pass & emial required"});

    var usr = await global.db.data.findOne("user", { name });
    if(usr) return res.json({err: true, msg: "Istnieje już użytkownik o takim name!"});

    var usr = await global.db.data.findOne("user", { email });
    if(usr) return res.json({err: true, msg: "Istnieje już użytkownik o takim e-mail!"});

    if(!/^[a-zA-Z0-9]+$/.test(name) || name.length < 3 || name.length > 10){
        return res.json({err: true, msg: "Login nie spełnia waymagań!"});
    }

    if(
        !password.match(/[a-z]/g) ||
        !password.match(/[A-Z]/g) ||
        !password.match(/[0-9]/g) ||
        !password.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/) ||
        password.length < 8 ||
        password.length > 300
    ) return res.json({err: true, msg: "Hasło nie spełnia waymagań!"});

    var kod = Math.floor(100000 + Math.random() * 900000);
    var hashPass = generateHash(password);
    req.session.tmp_user = { name, password: hashPass, email, kod, pr: 3 };

    require("../mail")("kod", email, "Kod potwierdzający e-mail | ifp", kod);

    res.json({ err: false, msg: "ok" });
};

function generateHash(password){
    return crypto.createHash('sha256').update(password).digest("hex");
}