module.exports = async (req, res) => {
    if(!req.session.tmp_user) return res.json({ err: true, msg: "Brak danych auth" });
    var tmp = req.session.tmp_user;
    if(tmp.pr <= 0) return res.json({ err: true, msg: "brak" });

    var kod = req.body.kod;
    if(!kod) return res.json({ err: true, msg: "Kod jest wymagany" });

    if(kod != tmp.kod){
        req.session.tmp_user.pr = req.session.tmp_user.pr - 1;
        res.json({ err: true, msg: 
            "Kod jest nie poprawny, pozostało <b>"+(req.session.tmp_user.pr+1)+"</b> prób. "
        });
        return;
    }
    var usr = await global.db.data.add("user", {
        name: tmp.name, email: tmp.email, password: tmp.password, friends: [], chats: []
    });

    req.session.user = usr;
    var token = global.tokens.getTempToken(usr, 60);
    res.json({
        err: false,
        msg: "welcome back",
        token,
        from: usr.name
    });
};