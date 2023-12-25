function locationNext(){
    var urlParam = new URLSearchParams(location.search);
    urlParam = urlParam.get("next");
    var next = "/app";
    if(urlParam){
        next = window.location.protocol + "//" + window.location.host;
        if(!urlParam.startsWith("/")) urlParam = "/" + urlParam;
        next += urlParam;
    }
    location.href = next;
}

function loginW(){
    var urlParam = new URLSearchParams(location.search);
    if(urlParam.get("err")) return;
    if(
        localStorage.getItem("rToken") &&
        localStorage.getItem("from") &&
        localStorage.getItem("user_id")
    ){
        locationNext();
    }
}
loginW();
var code = null;
var socket = io("/qr_code");
socket.connect();
socket.on("connect", () => {
    var id = createCode();
    code = createCode();
    var url = location.protocol + '//' + location.host + "/lk?k=" + id + "_" + code;
    qrcodeC(url);
    socket.emit("set", id);
});

socket.on("get", (data) => {
    getPass(data);
});

var loginDiv = document.querySelector("#login");
var passDiv = document.querySelector("#pass");
var errDiv = document.querySelector("#err");

document.querySelector(".signin").on("submit", (e) => {
    e.preventDefault();
    var login = loginDiv.value;
    if(!login){
        errDiv.html("Login nie może być pusty");
        return;
    }
    var pass = passDiv.value;
    if(!pass){
        errDiv.html("Hasło nie może być puste");
        return;
    }
    login = login.trim();
    pass = pass.trim();

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/login", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ login, pass }));
    var res = xhr.responseText;
    try{
        res = JSON.parse(res);
        if(res.err){
            errDiv.html(res.msg);
            return;
        }
        localStorage.setItem("from", res.from);
        localStorage.setItem("user_id", res.user_id);
        localStorage.setItem("rToken", res.rToken);
        sessionStorage.setItem("token", res.token);
        locationNext();
    }catch(e){
        alert("err: "+res);
    }
});

function qrcodeC(url){
    var qrD = document.querySelector("#qrcode-qr");
    qrD.innerHTML = "";
    var qrcode = new QRCode(qrD, {
        width: 364,
        height: 364,
        correctLevel : QRCode.CorrectLevel.H
    });
    qrcode.makeCode(url);
    document.querySelector("#qrcode-qr canvas").classList = "s m_12 l_12 u_12"
    document.querySelector("#qrcode-qr img").classList = "s m_12 l_12 u_12"
}

function createCode(){
    var id = "";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(let i=0; i<15; i++) id += characters.charAt(Math.floor(Math.random() * characters.length));
    return id;
}

function xorEncrypt(message, key){
    var encryptedMessage = '';
    for(var i = 0; i < message.length; i++){
        var charCode = message.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encryptedMessage += String.fromCharCode(charCode);
    }
    return encryptedMessage;
}

function getPass(data){
    try{
        var decode = xorEncrypt(data, code);
        var json = JSON.parse(decode);
        localStorage.setItem("rToken", json.rToken);
        localStorage.setItem("from", json.from);
        localStorage.setItem("user_id", json.user_id);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/getTempToken", false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            from: json.from,
            rToken: json.rToken,
            user_id: json.user_id
        }));
        var token = xhr.responseText;
        sessionStorage.setItem("token", token);
        location.href = "/app";
    }catch{
        socket.disconnect();
        setTimeout(() => {
            socket.connect();
        }, 100);
        alert("error");
    }
}

function changeCodeStatus(opn){
    document.querySelector("#qrcode-div").style.display = opn ? "block" : "none";
    document.querySelector("#loginC").style.display = !opn ? "block" : "none";
}