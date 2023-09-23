const fs = require('fs');

module.exports = (app) => {
    function build(name, ext){
        app.get("/"+name, (req, res) => {
            res.send(fs.readFileSync("./ifp/public/"+name+ext, "utf8"));
        });
    }

    var files = fs.readdirSync("./ifp/public/").filter(a => a.endsWith(".html")).map(a => a.slice(0, -5));
    files.forEach((e) => build(e, ".html"));

    app.get("/sitemap.xml", (req, res) => {
        res.header('Content-Type', 'application/xml');
        res.send(fs.readFileSync("ifp/static/sitemap.xml", "utf-8"));
    });
}