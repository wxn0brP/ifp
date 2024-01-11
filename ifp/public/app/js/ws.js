const socket = io(socketUrl, {
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
    socket.emit("getMyStatus");
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
            location.href = `/login?err=No_Login!${window.next||""}`;
        }else if(!reNewToken(rToken)){
            location.href = `/login?err=Not_Auth!${window.next||""}`;
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
        if(data.to != "@" /*&& document.hidden*/){
            var kto = data.to.startsWith("$") ? changeIdToName(data.fr) : "(S) "+changeIdToServer(data.to);
            sendNotif({ title: "Nowa wiadomość", body: kto + ": " + data.msg });
        }
    }

    if(toChat == "main") return;
    if(data.to != "@"){ //sender is author
        if(data.to != toChat) return;
    }
    if(toChatChannel != data.chnl) return;
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
                    fr: mess.fr,
                    msg: mess.msg,
                    _id: mess._id,
                    e: mess.edit ? mess.lastEdit : false,
                    res: mess.res
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
        btn.id = "f-"+f;
        menuClickEvent(btn, (e) => contMenu.friendBtn(f, e));

        friendsList.add(btn);
        friendsList.add(document.createElement("br"));
    });
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

        menuClickEvent(btn, (e) => contMenu.server(f, e));
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
    document.querySelector("#invites").html("")
    invites.forEach((invite) => addInviteToUi(invite));
});

socket.on("invite", () => {
    uiMsg("Otrzymano zaprosznie");
});

socket.on("editMess", (id, msg, time) => {
    const messageDiv = document.getElementById(id + "_mess");
    if(!messageDiv) return;
    messageDiv.setAttribute("_plain", msg);
    messageDiv.innerHTML = formatText(msg);
    messageDiv.innerHTML += edit_txt.replace("$$", formatDateFormUnux(parseInt(time, 36)));
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
        from: localUser.fr,
        to: toChat,
        chnl: toChatChannel,
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
});

socket.on("setUpServer", (categories, roles, users) => {
    serverData.roles = roles;
    serverData.users = users;
    setUpServer(categories);
});

socket.on("getProfile", data => {
    document.querySelector("#userProfile_name_content").innerHTML = data.name;
    document.querySelector("#userProfile_status").innerHTML = data.status;
    document.querySelector("#userProfile_opis").innerHTML = data.opis || "brak";
    document.querySelector("#userProfile_ifp_date").innerHTML = formatDateFormUnux(parseInt(data.time, 36));
    setUserStatus(document.querySelector("#userProfile_status_type"), data.statusType, "var(--menu)");
});

socket.on("getMyStatus", (data, type) => {
    document.querySelector("#accountPanel_status").innerHTML = data || "brak";
    setUserStatus(document.querySelector("#accountPanel_status_type"), type, "var(--userProfile)");
    document.querySelector("#statusPopUp_status").value = data;
    document.querySelector("#statusPopUp_typ").value = type;
    
    if(type == "d") notSound = true;
    else notSound = false;
});

socket.on("getFirendsActivity", friends => {
    if(friends.length == 0){
        msgDiv.html("Nikt nie jest aktywny.");
        return;
    }
    msgDiv.html("");
    friends.forEach(f => {
        let div = document.createElement("div");
        div.clA("firednsActivityPanel");
        div.innerHTML = `<img src="/favicon.ico">`;
        div.style.cursor = "pointer";
        div.addEventListener("click", () => {
            changeTo("$"+f.id);
            document.querySelector("#f-"+f.id).clA("a-active");
        });

        let statusT = document.createElement("div");
        setUserStatus(statusT, f.t, "var(--panel)");
        statusT.clA("firednsActivityPanel_typ");
        div.appendChild(statusT);

        let name = document.createElement("div");
        name.innerHTML = changeIdToName(f.id);
        name.style.fontWeight = "700";
        name.style.marginLeft = "10px";
        name.style.marginRight = "10px";
        div.appendChild(name);

        if(f.s){
            let status = document.createElement("div");
            status.innerHTML = `<div style="font-weight: 700;">Status:</div>`+f.s;
            status.style.marginLeft = "10px";
            div.appendChild(status);
        }

        msgDiv.appendChild(div);
    });
});

socket.on("box_open", (items, item) => {
    casesOpen(items, item);
});

socket.on("items_get", (items, gold) => {
    let pop = document.querySelector("#itemsPopUp");
    pop.innerHTML = "";

    let goldD = document.createElement("div");
    goldD.innerHTML = "GOLD: " + gold;
    pop.appendChild(goldD);

    items.forEach(item => {
        let img = document.createElement("img");
        img.src = location.origin + "/cases/" + item + ".png";
        img.title = item;
        pop.appendChild(img);
    });

    popUpSetUp(pop);
});

socket.on("box_hub", (boxs, gold, daily) => {
    let pop = document.querySelector("#casesHubPopUp");
    popUpSetUp(pop);
    let cases = pop.querySelector("#casesHubPopUpCases");
    cases.innerHTML = "";

    pop.querySelector("#casesHubPopUpGold").innerHTML = "Gold: "+gold;

    boxs.forEach(box => {
        let div = document.createElement("div");
        div.clA("spaceDiv");

        let span = document.createElement("span");
        span.innerHTML = box.name;
        span.setAttribute("onclick", `socket.emit('box_get_drop', '${box.id}')`);
        div.appendChild(span);

        let btn = document.createElement("button");
        btn.setAttribute("onclick", `socket.emit('box_open', '${box.id}');clsPopUp();`);
        btn.innerHTML = "Open, Cena: "+box.p;
        div.appendChild(btn);

        cases.appendChild(div);
    });

    timeToDailyCase = parseInt(daily, 36) + 86400;
    updateCountdown();
});

socket.on("box_get_drop", (drop) => {
    let txt = "Drop: \n"+drop.map(drop => {
        return "- " + drop.name + " - " + drop.per + "%"
    }).join("\n");
    alert(txt);
});

socket.on("getServerSettings", (data, roles) => {
    getServerSettings(data, roles);
})