const { loginUser, changeIdToName, changeIdToServer } = require("./http");
const io = require("socket.io-client");
const { getListAsync, getUserInputAsync, getBoolAsync } = require("./console");
const readline = require('readline');
require("./enc");

global.baseUrl = "https://ifp.projektares.tk";
if(process.argv.length > 2){
    let p = process.argv[2];
    if(p == "-dev") global.baseUrl = "http://localhost:1478";
    else global.baseUrl = p;
}
global.lo = console.log;
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
    messCount: 0,
    messCountL: 30,
    resMsgId: "",
}
let localUser = {};
var socket = null;
var rlChat = null;
var refreshTmp = [];

async function selectWithChat(list, text){
    let data = await getListAsync(list, text);
    if(!data) return "";
    let who = data.d;
    who = extractTextInParentheses(who);
    return who;
}

function refresh(call){
    if(mode != "chat") return;
    const cursorPos = rlChat.getCursorPos();
    const userInput = rlChat.line;

    rlChat.pause();
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    lo(clear)
    lo(refreshTmp.join("\n"));
    if(call) call();

    rlChat.resume();
    process.stdout.write("> "+userInput);
    readline.cursorTo(process.stdout, cursorPos.cols);
}

async function chatMode(){
    rlChat = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        function prCmd(input){
            if(input == "::quit"){
                mode = "command";
                resolve();
                rlChat.close();
                return true;    
            }else if(input == "::load"){
                chatVar.messCount += chatVar.messCountL;
                socket.emit("getMessage", chatVar.toChat, chatVar.toChatChannel, 0, chatVar.messCount, true);
                return true;
            }
            return false;
        }
        rlChat.prompt();
        rlChat.on('line', (input) => {
            if(prCmd(input)) return;
            userInput = input;
            socket.emit('testMsg', userInput);

            if(chatVar.toChat == localUser.id) return refresh(() => console.error("nie możesz wysłać wiadomości do siebie"));
            if(chatVar.toChat == "main") return refresh(() => console.error("nie możesz wysłać wiadomości do nikogo, najpier kogoś wybierz"));
            let msg = userInput.trim();
            if(!msg) return;

            let silent = false;
            if(msg.startsWith("/silent ")){
                silent = true;
                msg = msg.replace("/silent ");
            }

            if(msg.length > 500) return refresh(() => console.error("msg jest za długie"));

            let data = {
                fr: localUser.id,
                to: chatVar.toChat,
                msg: encryptV.enc(msg),
                chnl: chatVar.toChatChannel,
                res: chatVar.resMsgId ? resMsgId : "",
                silent
            }

            socket.emit("mess", data);
            rlChat.prompt();
        });
    });
}

async function commandMode(){
    let chat = chatVar.toChat;
    if(chat == "main"){
        chatVar.toChatChannel = "main";
    }
    else if(chat.startsWith("$")){
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
        let input = await getUserInputAsync("> ");
        input = input.split("-");
        let channel = categories[input[0]]?.channels[input[1]];
        if(!channel) return;
        chatVar.toChatChannel = channel.id;
    }else if(input == ":m"){
        mode = "chat";
        chatVar.messCount = chatVar.messCountL;
        socket.emit("getMessage", chatVar.toChat, chatVar.toChatChannel, 0, chatVar.messCount, false);
        refreshTmp = [];
    }else if(input == ":e"){
        if(await getBoolAsync("napewno?")) mode = "exit";
    }
    lo(clear);
}

async function login(){
    let log = await getUserInputAsync("login: ");
    let pass = await getUserInputAsync("pass: ");
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
    while(mode != "exit"){
        lo(clear);
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

    socket.on("mess", async (data) => {
        let txt = bText(await changeIdToName(data.fr)) + ": " + data.msg;
        refreshTmp.push(txt);
        refresh();
    });

    socket.on("getMessage", async (array, opt) => {
        async function mp(data){
            return bText(await changeIdToName(data.fr)) + ": " + data.msg;
        }
        if(opt){
            for(let i=0; i<array.length; i++) refreshTmp.unshift(await mp(array[i]));
        }else{
            array.reverse();
            for(let i=0; i<array.length; i++) refreshTmp.push(await mp(array[i]));
        }
        refresh();
    });

    socket.on("connect", () => {
        socket.emit("friends");
        socket.emit("getChats");
    });

    socket.on("connect_error", err => {
        lo(err)
    });
    socket.connect();
}

function bText(text){
    return `\x1b[1m${text}\x1b[0m`;
}

login();