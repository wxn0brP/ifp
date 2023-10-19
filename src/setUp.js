const fs = require("fs");
const data = "data/";

function dir(path){
    if(!fs.existsSync(path)) fs.mkdirSync(path);
}
function file(path, value="", prefix="data/"){
    if(!fs.existsSync(prefix+path)) fs.writeFileSync(prefix+path, value);
}

dir(data);
file("banedIP.json", "[]");
file("song.json", "[]");