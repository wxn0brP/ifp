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

    if(msg.length > 500) return uiMsg("msg jest za długie", 1);

    let data = {
        fr: localUser.id,
        to: toChat,
        msg: encryptV.enc(msg),
        chnl: toChatChannel,
        res: resMsgId ? resMsgId : "",
        silent
    }
    resMsgId = null;
    document.querySelector("#responeMsgCloseMenu").css("display: none");

    socket.emit("mess", data);
    msgInput.value = "";
    focusInp();
    sendBtnStyle();
}

function loadMoreMess(){
    let tmp = actMess;
    actMess += messCount;
    if(toChat != "main") socket.emit("getMessage", toChat, toChatChannel, tmp, actMess, true);
}

function addMess(msg, socroll=true, up=false){
    var from = changeIdToName(msg.fr);
    var div = document.createElement("div");
    menuClickEvent(div, (e) => contMenu.mess(from == localUser.fr, msg._id, e));
    div.classList.add("mess");
    div.setAttribute("_id", msg._id);

    let content = msg.msg;
    if(msg.res){
        setTimeout(() => responeMess(div, msg.res), 100);
    }
    content = formatText(content);
    if(msg.e) content += edit_txt.replace("$$", formatDateFormUnux(parseInt(msg.e, 36)));

    let userName = document.createElement("div");
    userName.className = "mess_meta";

    let b = document.createElement("b");
    b.innerHTML = from;
    b.addEventListener("click", () => userProfile(msg.fr));
    b.style.cursor = "pointer";

    let time = parseInt(msg._id.split("-")[0], 36);
    const timeNormalize = formatDateFormUnux(time);
    let timeSpan = document.createElement("span");
    timeSpan.setAttribute("time", time);
    timeSpan.style.paddingLeft = "10px";
    timeSpan.style.fontSize = "0.9em";
    timeSpan.innerHTML = timeNormalize;

    userName.appendChild(b);
    userName.appendChild(timeSpan);

    let divMsg = document.createElement("div");
    divMsg.id = msg._id + "_mess";
    divMsg.className = "mess_msg";
    divMsg.setAttribute("_plain", msg.msg);
    divMsg.innerHTML = content;

    div.appendChild(userName);
    div.appendChild(divMsg);
    div.title = timeNormalize;
    
    up ? msgDiv.addUp(div) : msgDiv.add(div);
    hideBeforeMsgAuthor();

    const errMargin = 70; // (px)
    const isScrollAtBottom = msgDiv.scrollTop + msgDiv.clientHeight + div.clientHeight + errMargin >= msgDiv.scrollHeight;
    if(socroll && isScrollAtBottom){
        div.scrollIntoView({behavior: "smooth"});
    }
}

function sendBtnStyle(){
    var data = (msgInput.value || "").trim();
    if(data.startsWith("/silent ")) data = data.replace("/silent ", "");
    var len = data.length;
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
    window.open(document.querySelector("#alertLinkSpan").innerHTML, "_blank");
});

function reloadMsg(time){
    function f(){
        msgDiv.html("");
        getMessages();
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

msgDiv.on("scroll", () => {
    if(msgDiv.scrollTop == 0){
        msgDiv.scrollTop = 1;
        loadMoreMess();
    }
});

document.addEventListener('keydown', (e) => {
    if(msgInput == document.activeElement) return;
    if(document.activeElement.tagName.toLowerCase() === 'input') return;
    if(e.ctrlKey) return;
    if(e.altKey) return;

    msgInput.focus();
    var tLen = msgInput.value.length;
    if(tLen > 0){
        msgInput.setSelectionRange(tLen, tLen);
    }
});

msgInput.addEventListener("paste", function(e){
    var items = (e.clipboardData || e.originalEvent.clipboardData).items;

    for(let i=0; i<items.length; i++){
        if(items[i].type.indexOf("image") === -1) continue;
        e.preventDefault();
        let file = items[i].getAsFile();
        sendFile(file)
        lo(file)
    }
});

function hideBeforeMsgAuthor(){
    const msgs = document.querySelectorAll("#msg .mess");
    if(msgs.length <= 1) return;
    for(let i=0; i<msgs.length; i++){
        if(i-1 < 0) continue;
        const beforeAuthor = msgs[i-1].querySelector("b").innerHTML;
        const msgAuthor = msgs[i].querySelector("b").innerHTML;
        let isEqlaus = beforeAuthor == msgAuthor;

        const timeB = msgs[i-1].querySelector("[time]").getAttribute("time");
        const time = msgs[i].querySelector("[time]").getAttribute("time");
        const timeDifference = time - timeB;
        const minute = 70; // +/-

        if(timeDifference >= minute * 5) isEqlaus = false;

        msgs[i].querySelector(".mess_meta").css("display", isEqlaus ? "none" : "");
        msgs[i-1].css("margin-bottom", isEqlaus ? "0" : "12px");
    }
}

setInterval(hideBeforeMsgAuthor, 2_000);