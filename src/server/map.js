const sitemap = require('express-sitemap')({
    url: "ifp.ct8.pl",
    http: "https"
});

module.exports = (app, file) => {
    sitemap.generate(app);
    sitemap.XMLtoFile(file);
}