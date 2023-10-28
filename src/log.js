const fs = require("fs");
const date = (new Date()+"").split(" ").slice(1,4).join("_");
const pathLog = "./logs/"+date+".txt";

if(!fs.existsSync("./logs")) fs.mkdirSync("./logs");
if(!fs.existsSync(pathLog)) fs.writeFileSync(pathLog, "");
else fs.appendFileSync(pathLog, "\n");

function logF(path, ...datas){
    const data = datas.join(" :: ");
    const now = new Date();
    const dataToLog = `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}] ${path}: ${data}\n`;
    fs.appendFileSync(pathLog, dataToLog);
}

global.log = function(...datas){
    const line = new Error().stack.split('\n')[2].trim();
    const path = line.slice(line.indexOf("(")).replace(process.env.basePath, "");
    logF(path, ...datas);
}

global.log.m = logF;