const msgInput = document.querySelector("#inpSend");
const msgDiv = document.querySelector("#msg");
const sendDiv = document.querySelector("#send");

function sendMess(){
    if(toChat == localUser.id) return uiMsg("nie możesz wysłać wiadomości do siebie", 1);
    if(toChat == "main") return uiMsg("main", 1);

    let msg = msgInput.value.trim();
    if(!msg) return;

    let silent = false;
    if(msg.startsWith("/silent ")){
        silent = true;
        msg = msg.replace("/silent ");
    }

    if(msg.length > 90) return uiMsg("msg jest za długie", 1);

    let data = {
        from: localUser.id,
        to: toChat,
        msg,
        channel: "main",
        res: resMsgId ? resMsgId : "",
        silent
    }

    socket.emit("mess", data);
    msgInput.value = "";
    focusInp();
    sendBtnStyle();
}

function loadMoreMess(){
    let tmp = actMess;
    actMess += messCount;
    if(toChat != "main") socket.emit("getMessage", toChat, tmp, actMess, true);
}

function addMess(msg, socroll=true, up=false){
    var from = changeIdToName(msg.from);
    var div = document.createElement("div");
    if(utils.ss()){ //if mobile
        div.addEventListener("dblclick", (e) => contMenu.mess(from == localUser.fr, msg._id, e));
    }else{
        div.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            contMenu.mess(from == localUser.fr, msg._id, e);
            return false;
        });
    }
    div.classList.add("mess");
    div.setAttribute("_id", msg._id);

    let content = msg.msg;
    if(msg.res){
        setTimeout(() => responeMess(div, msg.res), 1000);
    }
    content = formatText(content);
    if(msg.e) content += edit_txt;
    div.innerHTML = 
        `<div><b>${from}</b></div>`+
        `<div id="${msg._id}_mess" _plain="${msg.msg}">${content}</div>`;
    
    up ? msgDiv.addUp(div) : msgDiv.add(div);

    if(socroll && msgDiv.scrollTop >= msgDiv.scrollHeight - msgDiv.clientHeight - 20){
        div.scrollIntoView({behavior: "smooth"});
    }
}

function sendBtnStyle(){
    var len = msgInput.value.trim().length;
    var prop = "";
    if(len == 0) prop = "grey";
    else if(len <= 90) prop = "green";
    else if(len > 90) prop = "red";
    document.querySelector("#sendBtn-img").style.setProperty("--fil", prop);
    document.querySelector("#send-menu button").disabled = len == 0;
}

msgInput.on("input", () => {
    [
        function(){
            if(isType) return;
            if(msgInput.value == "") return;
            isType = true;
            socket.emit("type", toChat);
            setTimeout(() => {
                isType = false;
            }, 5000);
        },
        function(){
            msgInput.value = changeEmo(msgInput.value);
        },
        sendBtnStyle
    ].forEach(e=>e());
});

msgInput.on("keypress", (e) => {
    if(e.key === "Enter" && !e.shiftKey){
        e.preventDefault();
        sendMess();
    }
});

function linkClick(e){
    e.preventDefault();
    var link = e.target.href;
    document.querySelector("#alertLinkSpan").html(link);
    var e = document.querySelector("#alertLink");
    e.css("");
    e.fadeIn();
}

function hideLink(){
    document.querySelector("#alertLink").fadeOut();
}

document.querySelector("#alertLink_ok").on("click", () => {
    hideLink();
    window.open(document.querySelector("#alertLinkSpan").html(), "_blank");
});

function reloadMsg(time){
    function f(){
        msgDiv.html("");
        socket.emit("getMessage", to, 0, messCount, false);
    }
    time ? setTimeout(f, time*1000) : f();
}

function emocjiMenu(){
    var e = document.querySelector("#emocjiMenu");
    e.css("");
    e.fadeIn();

    var del = () => {
        e.fadeOut();
        setTimeout(() => e.style.display = "none", 700);
        document.removeEventListener("click", del);
    }
    setTimeout(() => {
        document.addEventListener("click", del);
    }, 1000);
}

function focusInp(){
    if(utils.ss()) return;
    setTimeout(() => {
        msgInput.focus();
    }, 100);
}

msgInput.on("scroll", () => {
    if(msgInput.scrollTop == 0){
        loadMoreMess();
    }
});

document.addEventListener('keydown', (e) => {
    if(msgInput == document.activeElement) return;
    if(e.ctrlKey) return;
    if(e.altKey) return;

    var edit = document.querySelector(".editMess");
    if(edit) return;

    msgInput.focus();
    var tLen = msgInput.value.length;
    if(tLen > 0){
        msgInput.setSelectionRange(tLen, tLen);
    }
});