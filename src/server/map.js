var sitemap = require('express-sitemap')({
    url: "ifp.projektares.tk",
    http: "https"
});

module.exports = (app, file) => {
    sitemap.generate(app);
    sitemap.XMLtoFile(file);
}