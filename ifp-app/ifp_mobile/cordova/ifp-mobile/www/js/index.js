document.addEventListener('deviceready', function(){
    try{
        start();
    }catch(e){
        msg(e);
    }
});

var localUser;
var socket;
var baseUrl = "https://ifp.ct8.pl";

function start(){
    cordova.plugins.notification.local.requestPermission(function (granted) {
        msg(granted)
    });
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.on('activate', function(){
        setTimeout(() => {
            notif() 
        }, 500)
    });

    document.addEventListener('pause', function(){
        cordova.plugins.backgroundMode.enterBackground();
    });
    
    document.addEventListener('resume', function(){
        cordova.plugins.backgroundMode.moveToForeground();
    });

    login();
};

function notif(txt){
    cordova.plugins.notification.local.schedule({
        title: 'IFP',
        text: txt || 'Thats pretty easy...',
        foreground: true
    });
}

function msg(e){
    let ele = document.createElement("div");
    ele.style.color = "red";
    ele.style.backgroundColor = "wheat";
    ele.style.padding = "10px";
    ele.style.borderRadius = "10px";
    ele.style.marginBottom = "5px";
    ele.innerHTML = e;
    document.body.appendChild(ele);
}

async function login(){
    let log = prompt("login: ");
    let pass = prompt("pass: ");
    let res = await loginUser(log.trim(), pass.trim());
    if(!res || res.err){
        await login();
        return;
    }
    localUser = {
        fr: res.from,
        user_id: res.user_id,
        rToken: res.rToken,
        token: res.token
    }
    msg(JSON.stringify(localUser));

    socket = io.connect(baseUrl, {
        query: {
            token: localUser.token,
            name: localUser.fr,
            rToken: localUser.rToken,
        },
        transports: ['websocket'],
    });
    socket.on("mess", (data) => {
        notif(data.msg);
        msg(data.msg)
    });
    socket.on("connect", () => {
        msg("conn")
    });

    socket.on("connect_error", err => {
        msg(err)
    });
    socket.connect();
}

async function loginUser(login, pass){
    let res = await sendHttpRequest(baseUrl+"/login", { login, pass, temp: true });
    return res.data || { err: true, msg: "nwm" };
}

function sendHttpRequest(url, data){
    return new Promise(function(resolve, reject) {
        cordova.plugin.http.post(url, data, {}, function(response) {
            resolve(response);
        }, function(error) {
            msg(error)
            console.error('Błąd:', error);
            reject(error);
        });
    });
}
