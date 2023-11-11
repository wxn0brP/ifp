global.lo = function(...data){
    let line = new Error().stack.split('\n')[2].trim();
    let path = line.slice(line.indexOf("(")).replace(process.env.basePath ,"");

    if(path.length < 2) path = line; // if path is 2 (callback):

    console.log("\x1b[36m"+path+":\x1b[0m", ...data);
    if(process.env.lo == "true") global.log.m(path, ...data)
}

global.delay = ms => new Promise(res => setTimeout(res, ms));

global.vars = {
    month: 2592000000
}

global.appConfig = require("../config.js");

global.debug = require("./server/debug");