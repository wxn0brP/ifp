require("./global");
require("dotenv").config();
require("./log");
require("./setUp");
require('./db');

const fs = require('fs');
const app = require("express")();
let server;
if(appConfig.ssl){
    server = require('https').createServer({
        key: fs.readFileSync(appConfig.sslConfig.privateKey, 'utf8'),
        cert: fs.readFileSync(appConfig.sslConfig.certificate, 'utf8')
    }, app);
}else{
    server = require('http').createServer(app);
}

global.server = server;
global.tokens = require("./auth/token");
try{
    require("./server/sock");
}catch(e){
    lo(e);
}

require("./server/app")(app);
require("./server/firebase");
app.get("*", function(req, res){
    res.status(404).send(fs.readFileSync("./ifp/public/404.html", "utf8"));
});

lo("__________________"+(new Date()+"").split(" ").slice(1,5).join(" "));
server.listen(process.env.PORT, function(){
    if(process.env.status == "dev"){
        require("./links");
        require("./test");
    }
});