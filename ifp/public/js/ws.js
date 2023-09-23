const socket = io({
    query: {
        token: sessionStorage.getItem("token"),
        name: fr,
        rToken: localStorage.getItem("rToken")
    },
    transports: ['websocket'],
    autoConnect: false
});

var apisLoad = vw(false, () => {
    socket.connect();
    socket.emit("test");
});

socket.on("connect", () => {
    socket.emit("getChats");
    socket.emit("invites");
    socket.emit("friends");
});

socket.on("config", (data) => {
    privKey = data;
});

socket.on("connect_error", (err) => {
    var errMsg = err;
    try{
        err = JSON.parse((err+"").replace("Error: ", ""));
        if(err.type == "token"){
            sessionStorage.removeItem("token");
            reNewToken();
            socket.connect();
            return;
        }
        errMsg = err.type.replaceAll(" ", "_")
    }catch{}
    location.href = "/login?err=true&error="+errMsg;
});

socket.on("mess", (data) => {
    if(!data.silent){
        if(data.to != "@" && document.hidden){
            var kto = data.to.startsWith("$") ? changeIdToName(data.from) : "(S) "+changeIdToServer(data.to);
            sendNotif({ title: "Nowa wiadomość", body: kto + ": " + data.msg });
        }
    }

    if(to == "main") return;
    if(data.to != "@"){ //sender is author
        if(data.to != to) return;
    }
    dodajMess(data);
});

socket.on("error", (data) => {
    uiMsg(data, 1);
    setTimeout(clearErrMess, 10 * 1000);
});

socket.on("getMessage", (data) => {
    try{
        data.forEach((mess) => {
            try{
                dodajMess({
                    from: mess.from,
                    msg: mess.msg,
                    _id: mess._id,
                    e: mess.edit ? true : false,
                }, false, true);
            }catch(e){
                lo(e);
                lo(mess);
                var div = document.createElement("div");
                div.innerHTML = `<span style="color: red;">Nie udało się wczytać tej wiadomości!</span>`;
                msgDiv.add(div);
            }
        });
        socrollToBottom();
    }catch(e){
        lo(e);
        var div = document.createElement("div");
        div.innerHTML = `<span style="color: red;">Nie udało się wczytać wiadomości! :(</span>`;
        msgDiv.add(div);
    }
});

socket.on("friends", (g) => {
    var friendsList = __("#friendsList");
    friendsList.html("");
    g.forEach(f => {
        var btn = document.createElement("button");
        btn.innerHTML = changeIdToName(f);
        btn.addEventListener("click", () => {
            changeTo("$"+f, false);
            btn.classList.add("a-active");
        });
        var span = document.createElement("span");
        span.id = "f-"+f;
        btn.appendChild(span);
        friendsList.add(btn);
        friendsList.add(document.createElement("br"));
        socket.emit("getUserStatus", f);
    });
    setInterval(() => {
        g.forEach(f => socket.emit("getUserStatus", f));
    }, 10 * 1000);
});

socket.on("exitChat", () => {
    socket.emit("getChats");
})

socket.on("getChats", (g) => {
    var serverList = __("#serverList");
    serverList.html("");
    g.forEach(f => {
        var btn = document.createElement("button");
        var name = changeIdToServer(f);
        if(name.length > 4) name = name.substring(0, 4);
        btn.innerHTML = name;
        btn.id = "chat_"+f;

        btn.addEventListener("click", () => {
            changeTo(f);
            btn.classList.add("a-active");
        });

        if(__.mobile.m){
            btn.addEventListener("dblclick", (e) => contMenu.server(f, e));
        }else{
            btn.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                contMenu.server(f, e);
                return false;
            });
        }
        serverList.add(btn);
        serverList.add(document.createElement("br"));
    })
});

socket.on("inviteAccept", function(inviteId){
    socket.emit("friends");
    sendNotif({ title: "Zaproszenie", body: "Zaproszeno zaakceptowane od "+changeIdToName(inviteId)+"!" });
});

socket.on("inviteDelice", function(inviteId){
    socket.emit("friends");
    sendNotif({ title: "Zaproszenie", body: "Zaproszeno odrzucone od "+changeIdToName(inviteId)+"!" });
});

socket.on("deleteFriends", () => {
    socket.emit("friends");
});

socket.on("invite", function(invite){
    addInviteToUi(invite);
});

socket.on("invites", (invites) => {
    if(!invites) return;
    alert("masz "+invites.length+" zaproszeń");
    __("#invites").html("")
    invites.forEach((invite) => addInviteToUi(invite));
});

socket.on("invite", () => {
    uiMsg("Wysłano zaprosznie");
});

socket.on("getUserStatus", (data) => {
    __("#f-"+data.id).html(data.data ? "✅" : "❌");
});

socket.on("editMess", (id, msg) => {
    const messageDiv = document.getElementById(id + "_");
    if(!messageDiv) return;
    messageDiv.setAttribute("_plain", msg);
    messageDiv.innerHTML = formatText(msg);
    messageDiv.innerHTML += edit_txt;
});

socket.on("delMess", (id) => {
    const messageDiv = document.querySelector(`div[_id="${id}"]`);
    if(!messageDiv) return;
    messageDiv.remove();   
});

socket.on("type", (server, from) => {
    if(server == to && from != fr_id){
        var ele = document.createElement("span");
        ele.innerHTML = " " + changeIdToName(from) + " pisze... ";
        __("#pisze").add(ele);
        setTimeout(() => {
            ele.remove();
        }, 5000)
    }
});

socket.on("getInivteFromId", id => {
    var txt = location.protocol + "//" + location.host + "/ic?id=" + id;
    navigator.clipboard.writeText(txt);
});

socket.on("fileRes", res => {
    if(res.err) return alert("error file send");
    var link = location.origin + "/" + res.msg;
    if(to == "main") return;
    var data = {
        from: fr, to, channel: "main",
        msg: link
    }
    socket.emit("mess", data)
});

socket.on("callRes", (res) => {
    if(!res) return alert("Osoba nie odbiera");
    __("#callMedia").style("");
    callInit();
    uiMsg("Osoba odebrała");
});

socket.on("callTo", (id) => {
    endCallID = id;
    var p = confirm(changeIdToName(id) + " dzwoni do cb? Czy odebrać?");
    socket.emit("callRes", id, p);
    if(!p) return;
    callInit();
    setTimeout(() => {
        __("#callMedia").style("");
    }, 1000);
    setTimeout(() => {
        callApi.call(id);
    }, 3000); //wait to 2 os init
});

