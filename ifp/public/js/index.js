changeTo("main");

function mobileMenuToogler(){
    var style = __("#menu").style();
    style.left = style.left == "-100%" ? "0px" : "-100%";
}

inpSendDiv.on("keypress", (e) => {
    if(e.key === "Enter"){
        e.preventDefault();
        sendMess();
    }
});

function sendMess(){
    if(to == fr) return uiMsg("nie możesz wysłać wiadomości do siebie", 1);
    if(to == "main") return uiMsg("main", 1);
    var msg = inpSendDiv.value().trim();
    if(!msg) return;
    msg = changeEmo(msg);
    if(msg.length > 90) return uiMsg("msg jest za długie", 1);
    if(resMsgId){
        msg = "/res "+resMsgId+" "+msg;
        resMsgId = null;
        __("#resMsgX").style("display: none");
        if(msg.length > 130) return uiMsg("msg jest za długie", 1);
    }
    var data = {
        from: fr,
        to,
        msg,
        channel: "main"
    }
    socket.emit("mess", data)
    errDiv.html("");
    inpSendDiv.value("");
    focusInp();
    clearErrMess();
    sendBtnStyle();
}

function loadMoreMess(){
    var tmp = actMess;
    actMess += messCount;
    if(to != "main") socket.emit("getMessage", to, tmp, actMess, true);
}

function dodajMess(msg, socroll=true, up=false){
    var from = changeIdToName(msg.from);
    var div = document.createElement("div");
    if(__.mobile.m){ //if mobile
        div.addEventListener("dblclick", (e) => contMenu.mess(from == fr, msg._id, e));
    }else{
        div.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            contMenu.mess(from == fr, msg._id, e);
            return false;
        });
    }
    div.classList.add("mess");
    div.setAttribute("_id", msg._id);

    var content = msg.msg;
    var match = content.match(/^\/res (\w+-\w+-\w+)/);
    if(match){
        content = content.replace(match[0], "");
        setTimeout(() => responeMess(div, match[1]), 1000);
    }
    content = formatText(content);

    if(msg.e) content += '&nbsp;&nbsp;<span style="font-size: 0.5rem;">(edytowane)</span>';
    var sp = "&nbsp;&nbsp;&nbsp;&nbsp;";
    div.innerHTML = 
        `<b>${from}</b>${sp}`+
        `<span id="${msg._id}_" _plain="${msg.msg}">${content}</span>`
    ;
    up ? msgDiv.addUp(div) : msgDiv.add(div);

    var tmp = msgDiv.g();
    if(socroll && tmp.scrollTop >= tmp.scrollHeight - tmp.clientHeight - 20){
        div.scrollIntoView({behavior: "smooth"});
    }
}

function changeTo(f, menuL=true){
    inputChat[to] = inpSendDiv.value();
    to = f;
    inpSendDiv.value("");
    msgDiv.html("");
    socrollBlock = false;
    [...document.querySelectorAll(".a-active")].forEach(e => {
        e.classList.remove("a-active")
    });
    if(to == "main"){
        msgDiv.html(main);
        sendDiv.style("display: none;");
        document.getElementById("goMain").classList.add("a-active");
        document.getElementById("friends-main").style.display = "";
        document.getElementById("friends-server").style.display = "none";
        __("#callToBtn").style().cursor = "not-allowed";
    }else{
        //TODO dodać kanały
        socket.emit("getMessage", to, 0, messCount, false);
        actMess = messCount;
        sendDiv.style("");
        focusInp();
        if(menuL){
            document.getElementById("friends-main").style.display = "none";
            document.getElementById("friends-server").style.display = "";
            serverInit();
        }
        if(inputChat[to]){
            inpSendDiv.value(inputChat[to]);
            inpSendDiv.g().dispatchEvent(new Event("input"));
        }
        __("#callToBtn").style().cursor = "pointer";
    }
}