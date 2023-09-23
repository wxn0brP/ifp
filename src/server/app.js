const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const folders = require('./folders');
const fs = require('fs');

module.exports = (app) => {
    app.use(require("./banedIP"));

    //parser
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    global.sessions = {};
    app.use((req, res, next) => {
        const sessionId = req.cookies.session;
        var session = global.sessions[sessionId];
        if(!session){
            var id = crypto.randomBytes(64).toString('hex');
            res.cookie("session", id, { sameSite: 'strict' });
            session = global.sessions[id] = {};
        }
        req.session = session;
        next();
    });

    app.use("/", express.static("./ifp/static"));
    app.use("/", express.static("./media"));

    app.post("/pt/loged", (req, res) => {
        var end = () => res.send("OK"+(req.session.loged ? "." : ","));
        var pass = req.body.pass;
        if(!pass) return end();
        if(pass == process.env.normalPass){
            req.session.loged = true;
        }
        end();
    });

    app.get("/pt/test", (req, res) => {
        res.json(!!req.session.loged);
    });

    app.use((req, res, next) => {
        if(process.env.normal == "pt"){
            if(req.session.loged){
                next();
                return;
            }else{
                res.send(fs.readFileSync("./ifp/public/przerwa-techniczna.html", "utf8"));
                return;
            }
        }else next();
    })

    //dir
    require("./router")(app);
    app.use("/", express.static("./ifp/public"));
    app.use("/uploads", express.static("./uploads"));
    if(process.env.status == "dev"){
        app.use("/lib", express.static(process.env.wwli+"js"));
        app.use("/lib", express.static(process.env.wwli+"css"));
        app.use("/lib", express.static(process.env.wwli+"dist"));
    }
    require("../auth/auth-api.js")(app);

    require("./map")(app, "ifp/static/sitemap.xml");

    app.get("*", folders("./ifp/public"));
    app.get("*", folders("./media"));
}