const { loginUser, changeIdToName, changeIdToServer } = require("./http");
const io = require("socket.io-client");
const fs = require("fs");
const { getListAsync, getUserInputAsync, getBoolAsync } = require("./console");

global.baseUrl = "http://localhost:1478";
global.lo = console.log;
global.log = (...d) => fs.appendFileSync("log.txt", JSON.stringify(d));
global.delay = ms => new Promise(res => setTimeout(res, ms));
const clear = '\x1Bc';
const extractTextInParentheses = text => (text.match(/\((.*?)\)/) || [])[1] || null;

var mode = "command";
const chatVar = {
    toChat: "main",
    toChatChannel: "main",
    priv: [],
    servers: [],
    chnls: [],
}
let localUser = {};
var socket = null;

async function selectWithChat(list, text){
    let data = await getListAsync(list, text);
    if(!data) return "";
    let who = data.d;
    who = extractTextInParentheses(who);
    return who;
}

async function chatMode(){
    let input = await getUserInputAsync("> ");
    if(input == "::quit"){
        mode = "command";
    }
}

async function commandMode(){
    let chat = chatVar.toChat;
    if(chat.startsWith("$")){
        chat = await changeIdToName(chat.replace("$",""));
        chatVar.toChatChannel = "main";
    }else{
        chat = await changeIdToServer(chat) || "main";
        chatVar.toChatChannel = "main";
    }

    const inputN = 
`aktualnie wybrano ${bText(chat)} na kanale ${bText(chatVar.toChatChannel)}
u  - wyberz czat prywatny
s  - wybierz serwer
c  - wybierz czat na serwerze
:m - przejście w tryb chat
:e - exit

> `;
    let input = await getUserInputAsync(inputN);
    if(input == "u"){
        let s = await selectWithChat(chatVar.priv, "Kto:");
        if(s){
            chatVar.toChat = s;
            chatVar.toChatChannel = "main";
        }
    }else if(input == "s"){
        let s = await selectWithChat(chatVar.servers, "Gdzie:");
        if(s){
            chatVar.toChat = s;
            chatVar.toChatChannel = "main";
            socket.emit("setUpServer", s);
        }
    }else if(input == "c" && !chatVar.toChat.startsWith("$")){
        let categories = chatVar.chnls;
        lo(clear);
        for(let i=0; i<categories.length; i++){
            let categ = categories[i];
            lo(categ.name);
            for(let j=0; j<categ.channels.length; j++){
                let chnl = categ.channels[j];
                if(chnl.type != "text") continue;
                lo(`- [${i+"-"+j}] ${chnl.name} (${chnl.id})`);
            }
        }
        let inp = await getUserInputAsync("> ");
        inp = inp.split("-");
        let channel = categories[inp[0]]?.channels[inp[1]];
        if(!channel) return;
        chatVar.toChatChannel = channel.id;
    }else if(input == ":m"){
        mode = "chat"
    }else if(input == ":e"){
        if(await getBoolAsync("napewno?")) mode = "exit";
    }
    lo(clear);
}

async function login(){
    let log = "Filip";  //await getUserInputAsync("login: ");
    let pass = "Cezaro3$"// await getUserInputAsync("pass: ");
    let res = await loginUser(log.trim(), pass.trim());
    if(!res || res.err){
        lo(clear);
        await login();
        return;
    }
    localUser = {
        fr: res.from,
        user_id: res.user_id,
        rToken: res.rToken,
        token: res.token
    }
    setUpSocket();
    mainLoop();
}

async function mainLoop(){
    // return;
    while(mode != "exit"){
        if(mode == "command") await commandMode();
        else if(mode == "chat") await chatMode();
    }
    socket.disconnect();
    lo(clear);
    process.exit();
}

function setUpSocket(){
    socket = io.connect(global.baseUrl, {
        query: {
            token: localUser.token,
            name: localUser.fr,
            rToken: localUser.rToken,
        },
        transports: ['websocket'],
    });

    socket.on("friends", async g => {
        chatVar.priv = [];
        for(let i=0; i<g.length; i++){
            let r = await changeIdToName(g[i]) + " ($" + g[i] + ")";
            chatVar.priv.push(r);
        }
    });

    socket.on("getChats", async g => {
        chatVar.servers = [];
        for(let i=0; i<g.length; i++){
            let r = await changeIdToServer(g[i]) + " (" + g[i] + ")";
            chatVar.servers.push(r);
        }
    });

    socket.on("setUpServer", async chanels => {
        chatVar.chnls = chanels;
    });

    socket.on("connect", () => {
        socket.emit("friends");
        socket.emit("getChats");
    });

    socket.on("connect_error", err => {
        lo(err)
    })
    socket.connect();
}

function bText(text){
    return `\x1b[1m${text}\x1b[0m`;
}

login();