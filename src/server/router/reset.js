module.exports = async (req, res) => {
    var email = req.body.email;
    if(!email) return res.json({ err: true, msg: "Email jest wymagany" });

    var usr = await global.db.data.findOne("user", { email });
    if(!usr) return res.json({ err: true, msg: "Ten adres email nie jest powiązany z żadnym użytkownikiem!" });

    var kod = Math.floor(100000 + Math.random() * 900000);
    req.session.tmp_user = { email, kod };
    require("../mail")("kod", email, "Kod potwierdzający zmainę hasła | ifp", kod);
    
    res.json({
        err: false,
        msg: "ok"
    });
};