const crypto = require('crypto');

module.exports = async (req, res) => {
    var login = req.body.login;
    var pass = req.body.pass;
    var usr = await global.db.user.findOne({ name: login });
    if(!usr) usr = await global.db.user.findOne({ email: login });
    if(!usr) return res.json({err: true, msg: "Nie prawidłowy login lub hasło"});

    var hashPass = usr.o.password;
    if(!comparePassword(pass, hashPass)){
        return res.json({err: true, msg: "Nie prawidłowy login lub hasł.o"});
    }

    req.session.user = usr;
    var rToken = global.tokens.getRToken(usr.o, (req.body.temp ? 0.1 : undefined));
    var tmpToken = await global.tokens.getTempToken(usr.o, rToken);

    res.json({
        err: false,
        msg: "welcome back",
        from: usr.o.name,
        user_id: usr.o._id,
        rToken,
        token: tmpToken
    });
};

function generateHash(password){
    return crypto.createHash('sha256').update(password).digest("hex");
}

function comparePassword(password, hash){
    var passHash = generateHash(password);
    return passHash == hash;
}