const socket = io({
    query: {
        token: sessionStorage.getItem("token"),
        name: localUser.fr,
        rToken: localStorage.getItem("rToken")
    },
    transports: ['websocket'],
    autoConnect: false
});

function setUpSocket(){
    socket.connect();
    socket.emit("test");
}

socket.on("connect", () => {
    debugMsg("conn")
    socket.emit("getChats");
    socket.emit("invites");
    socket.emit("friends");
});

// socket.on("config", (data) => {
//     privKey = data;
// });

socket.on("connect_error", (err) => {
    var errMsg = err.message;
    if(err.data == "AuthenticationError"){
        sessionStorage.removeItem("token");
        const rToken = localStorage.getItem("rToken");
        if(!rToken){
            location.href = `/login?err=No_Login!${next}`;
        }else if(!reNewToken(rToken)){
            location.href = `/login?err=Not_Auth!${next}`;
        }
        socket.connect();
    }else if(err.type == "TransportError"){
        uiMsg("Błąd serwera! Przepraszamy! :(", 1);
        debugMsg(errMsg);
    }else{
        debugMsg(err.type + " ::: " + errMsg)
        uiMsg("Nieznany błąd: "+errMsg, 1);
    }
});

socket.on("mess", (data) => {
    if(!data.silent){
        if(data.to != "@" && document.hidden){
            var kto = data.to.startsWith("$") ? changeIdToName(data.from) : "(S) "+changeIdToServer(data.to);
            sendNotif({ title: "Nowa wiadomość", body: kto + ": " + data.msg });
        }
    }

    if(toChat == "main") return;
    if(data.to != "@"){ //sender is author
        if(data.to != toChat) return;
    }
    addMess(data);
});

socket.on("error", (data) => {
    uiMsg(data, 1);
    debugMsg(data);
});

socket.on("getMessage", (data) => {
    try{
        data.forEach((mess) => {
            try{
                addMess({
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
        setTimeout(socrollToBottom, 30);
    }catch(e){
        lo(e);
        var div = document.createElement("div");
        div.innerHTML = `<span style="color: red;">Nie udało się wczytać wiadomości! :(</span>`;
        msgDiv.add(div);
    }
});

socket.on("friends", (g) => {
    var friendsList = document.querySelector("#friendsList");
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
    var serverList = document.querySelector("#serverList");
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

        if(utils.ss()){
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
    document.querySelector("#invites").html("")
    invites.forEach((invite) => addInviteToUi(invite));
});

socket.on("invite", () => {
    uiMsg("Otrzymano zaprosznie");
});

// socket.on("getUserStatus", (data) => {
//     __("#f-"+data.id).html(data.data ? "✅" : "❌");
// });

socket.on("editMess", (id, msg) => {
    const messageDiv = document.getElementById(id + "_mess");
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
    if(server == toChat && from != localUser.id){
        var ele = document.createElement("span");
        ele.innerHTML = " " + changeIdToName(from) + " pisze... ";
        document.querySelector("#pisze").add(ele);
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
    if(toChat == "main") return;
    var data = {
        from: localUser.fr, to: toChat, channel: "main",
        msg: link
    }
    socket.emit("mess", data)
});

socket.on("newVCId", (id, my=false) => {
    if(!peerVars.callOk) return;
    let peer = makeConnect(id);
    if(!my) return;
    setTimeout(() => {
        callTor(id, peer);
    }, 3000);
});

socket.on("VCUsers", (users, type) => {
    users = users.map(user => {
        return `<li>${changeIdToName(user)}</li>`;
    });
    document.querySelector("#callUsers").innerHTML = "Osoby: "+users.join("");
    switch(type){
        case "join":
            sounds.join.play();
        break;
        case "leave":
            sounds.leave.play();
        break;
    }
    debugMsg("VCUsers type: "+type);
});

socket.on("VCUserLeave", (user) => {
    document.querySelector("#callMedia-user-"+user+"-video")?.remove();
    document.querySelector("#callMedia-user-"+user+"-range")?.remove();
})

socket.on("callTo", async (id, room) => {
    if(room == peerVars.id) return;
    let str = changeIdToName(id) + " dzwoni do ciebie. Dołączyć?";
    let c = confirm(str);
    if(!c) return;
    callEnd();
    let to = await getChatIdFriends("$"+id);
    joinVC(to+"-main");
    document.querySelector("#callMedia").css("");
});

socket.io.on("reconnect", () => {
    if(!peerVars.callOk) return;
    if(!peerVars.id) return;
    socket.emit("joinVC-reconn", peerVars.id);
})