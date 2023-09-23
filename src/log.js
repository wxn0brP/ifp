const fs = require("fs");
const date = (new Date()+"").split(" ").slice(1,4).join("_");
const pathLog = "./logs/"+date+".txt";

if(!fs.existsSync("./logs")) fs.mkdirSync("./logs");
if(!fs.existsSync(pathLog)) fs.writeFileSync(pathLog, "");
else fs.appendFileSync(pathLog, "\n");

global.log = function(...datas){
    var line = new Error().stack.split('\n')[2].trim();
    var path = line.slice(line.indexOf("(")).replace(process.env.basePath ,"");
    var data = datas.join(" :: ");
    const now = new Date();
    var dataToLog = `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}] ${path}: ${data}\n`;
    fs.appendFileSync(pathLog, dataToLog);
}

global.log.m = function(path, ...datas){
    var data = datas.join(" :: ");
    const now = new Date();
    var dataToLog = `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}] ${path}: ${data}\n`;
    fs.appendFileSync(pathLog, dataToLog);
}