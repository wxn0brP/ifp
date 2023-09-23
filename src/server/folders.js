const fs = require("fs");

function folders(path, req, res, next){
    var path = path+req.url;
    if(path.indexOf("?") > -1){
        path = path.substring(0, path.indexOf("?"));
    }
    var mextV =
        !path.endsWith("/") ||
        !fs.existsSync(path) ||
        !fs.lstatSync(path) ||
        fs.existsSync(path+"index.html");
    if(mextV) return next();

    try{
        var files = fs.readdirSync(path);
        files.unshift("..");
        files = files.map(file => {
            return "<div><a href=\""+file+"\">"+file+"</a></div>";
        }).join("");
        var html = fs.readFileSync("./ifp/files.html")+"";
        res.send(html.replace("$1", files));
    }catch{
        next();
    }
}

module.exports = (path) => {
    if(path.endsWith("/")) path = path.slice(0, -1);
    return (...arg) => {
        return folders(path, ...arg);
    }
}