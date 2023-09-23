global.lo = function(...data){
    var line = new Error().stack.split('\n')[2].trim();
    var path = line.slice(line.indexOf("(")).replace(process.env.basePath ,"");

    console.log("\x1b[36m"+path+":\x1b[0m", ...data);
    if(process.env.lo == "true") global.log.m(path, ...data)
}

global.delay = ms => new Promise(res => setTimeout(res, ms));

global.vars = {
    month: 2592000000
}

global.debug = require("./server/debug");