const fs = require("fs");

function dir(path){
    if(!fs.existsSync(path)) fs.mkdirSync(path);
}
function file(path, value="", prefix="config/"){
    if(!fs.existsSync(prefix+path)) fs.writeFileSync(prefix+path, value);
}

dir("data");
dir("config");
file("banedIP.json", "[]");
file("song.json", "[]");
file("mailConfig.json", "{}");