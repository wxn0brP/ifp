const crypto = require('crypto');

module.exports = async (req, res) => {
    if(!req.session.tmp_user) return res.json({ err: true, msg: "Brak danych auth" });
    var tmp = req.session.tmp_user;
    if(!tmp) return res.redirect("/reset");
    var kod = req.body.kod;
    if(!kod) return res.json({ err: true, msg: "Kod jest wymagany" });
    var password = req.body.password;
    if(!password) return res.json({ err: true, msg: "Hasło jest wymagany" });

    if(kod != tmp.kod){
        req.session.tmp_user = null;
        res.json({ err: true, r: true, msg: 
            "Kod jest nie poprawny"
        });
        return;
    }

    if(
        !password.match(/[a-z]/g) ||
        !password.match(/[A-Z]/g) ||
        !password.match(/[0-9]/g) ||
        !password.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/) ||
        password.length < 8 ||
        password.length > 300
    ) return res.json({err: true, msg: "Hasło nie spełnia waymagań!"});

    var hashPass = generateHash(password);
    var t = await global.db.data.updateOne("user", { email: tmp.email }, { password: hashPass });
    if(!t) return res.json({ err: true,  msg: "Błąd serwera." })
    res.json({
        err: false,
        msg: "welcome back"
    });
}

function generateHash(password){
    return crypto.createHash('sha256').update(password).digest("hex");
}