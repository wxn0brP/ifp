// const crypto = require("crypto");

module.exports = (app) => {
    return; // wait to update auth & login system
    // var ifp = "/ifp-auth/";

    // app.post(ifp+"login", async (req, res) => {
    //     var login = req.body.login;
    //     var pass = req.body.pass;

    //     if(!login || !pass) return res.json({ err: true, msg: "login & password is required" });

    //     var user = await global.db.data.findOne("user", { name: login });
    //     if(!user) return res.json({ err: true, msg: "user not found" });

    //     if(!comparePassword(pass, user.o.password)){
    //         return res.json({err: true, msg: "Nie prawidłowy login lub hasło"});
    //     }

    //     var rToken = global.tokens.getRToken(user.o, (req.body.temp ? 0.1 : undefined));
    //     var token = await global.tokens.getTempToken(user.o, rToken);
    //     res.json({
    //         err: false,
    //         msg: "logged",
    //         rToken,
    //         token
    //     });
    // });

    // app.get(ifp+"auth", async (req, res) => {
    //     res.json(await auth(req.query.name, req.query.token));
    // });

    // app.post(ifp+"auth", async (req, res) => {
    //     res.json(await auth(req.body.name, req.body.token));
    // });

    // app.post(ifp+"validToken", async (req, res) => {
    //     const { rToken } = req.body;
    //     if(!rToken) return res.send(false);
    //     var token = await global.db.data.findOne("token", { token: rToken });
    //     return res.send(!!token);
    // });

    // app.post(ifp+"getTempToken", async (req, res) => {
    //     const { from, user_id, rToken } = req.body;
    //     if(!from || !user_id || !rToken) return res.json({
    //         err: true,
    //         msg: "from & user_id & rToken is required"
    //     });

    //     var rTokenId = await global.db.data.findOne("token", { token: rToken });
    //     if(!rTokenId) return res.json({
    //         err: true,
    //         msg: "rToken is die"
    //     });

    //     var token = await global.tokens.getTempToken({ name: from, _id: user_id }, rToken);

    //     res.json({
    //         err: false,
    //         msg: "logged",
    //         token
    //     });
    // });

    // async function auth(name, token){
    //     if(!name || !token) return { err: true, msg: "name & login is required" };

    //     var hashBase = await global.tokens.veryTemp(token);
    //     if(!hashBase) return { err: true, msg: "not auth" };

    //     if(hashBase.user.name != name) return { err: true, msg: "not auth" };

    //     return { err: false, msg: "auth" };
    // }
}

// function comparePassword(p1, p2){
//     var p1h = crypto.createHash('sha256').update(p1).digest("hex");
//     return p1h == p2;
// }