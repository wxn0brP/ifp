function addFriends(){
    var inp = prompt("Podaj nazwę swojego przyjaciela: ").trim();
    if(inp == "" || !inp){
        return uiMsg("musisz podać user", 1);
    }
    if(inp == fr){
        return uiMsg("nie możesz wysłać zaproszenia do siebie", 1);
    }
    var res = JSON.parse(__.httpReq("userName?user="+inp));
    if(res.err){
        return uiMsg(res.msg, 1);
    }
    var id = res.msg;
    if(changeIdToName(id) == fr){
        return uiMsg("nie możesz wysłać zaproszenia do siebie", 1);
    }
    socket.emit("invite", id);
    clearErrMess();
}

function deleteFriends(){
    if(!confirm("Ta operacja spowoduje usunięcie **"+changeIdToName(to)+"** z listy przyjaciół!!!")) return;
    if(!confirm("Napewno?")) return;
    if(!confirm("Napewno? (double click)")) return;
    socket.emit("deleteFriends", to);
    changeTo("main");
    setTimeout(() => socket.emit("getStatus"), 1000);
}

function exitChat(){
    if(!confirm("Ta operacja spowoduje opuszczenie czatu!")) return;
    if(!confirm("Napewno?")) return;
    var id = __("#serverMenu").atrib("w_id");
    socket.emit("exitChat", id);
    changeTo("main");
    setTimeout(() => socket.emit("getChats"), 1000);
}

function logout(){
    if(!confirm("Napewno?")) return;
    socket.emit("logout");
    localStorage.removeItem("from");
    localStorage.removeItem("user_id");
    sessionStorage.removeItem("token");
    localStorage.removeItem("rToken");
    localStorage.removeItem("session");
    location.href = "/login";
}

function focusInp(){
    if(__.mobile.mob || __.mobile.tab) return;
    setTimeout(() => {
        inpSendDiv.g().focus();
    }, 100);
}

function uiMessage(data, bg="green", time=6000){
    errDiv.html(data);
    __.mobile();
    if(__.mobile.mob || __.mobile.tab){
        alert(data);
        setTimeout(clearErrMess, time);
        return;
    }

    var div = document.createElement("div");
    div.innerHTML = data;
    div.style.backgroundColor = bg;
    __("#errMesses").add(div);
    var def = "-"+(div.clientHeight+10)+"px";
    div.style.top = def;

    setTimeout(() => {
        div.style.top = "10px";
    }, 111);

    setTimeout(() => {
        div.style.top = def;
    }, time - 2100);
   
    setTimeout(() => {
        div.remove();
        clearErrMess();
    }, time);
}

function uiMsg(data, type=0){
    var color = "";
    switch(type){
        case 0:
            color = "green";
        break;
        case 1:
            color = "#FF2200";
        break;
        case 2:
            color = "#FF7F00";
        break;
    }
    var speed = 1/3; 
    var time = data.split(" ").length * speed + 6;
    uiMessage(data, color, time * 1000);
}

function clearErrMess(){
    errDiv.html("");
}

function linkClick(e){
    e.preventDefault();
    var link = e.target.href;
    __("#alertLinkSpan").html(link);
    var e = __("#alertLink");
    e.style("");
    animateFade(e.get(), 0);
}

function hideLink(){
    var e = __("#alertLink");
    animateFade(e.get(), 1, 300);
    setTimeout(() => e.style().display = "none", 700);
}

__("#alertLink_ok").on("click", () => {
    hideLink();
    window.open(__("#alertLinkSpan").html(), "_blank");
});

function addInviteToUi(invite){
    const inviteDiv = document.createElement("div");
    
    const fromLabel = document.createElement("label");
    fromLabel.textContent = `From: ${changeIdToName(invite.from)}`;
    inviteDiv.appendChild(fromLabel);
    
    const acceptBtn = document.createElement("button");
    acceptBtn.textContent = "Accept";
    acceptBtn.addEventListener("click", () => {
        socket.emit("inviteAccept", invite._id);
        __("#invites").g().removeChild(inviteDiv);
        setTimeout(() => {
            socket.emit("friends");
        }, 2000);
    });
    inviteDiv.appendChild(acceptBtn);
    
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
        socket.emit("inviteDelice", invite._id);
        __("#invites").g().removeChild(inviteDiv)
    });
    inviteDiv.appendChild(delBtn);
    
    __("#invites").add(inviteDiv);
}

function readText(obj){
    var text = "";
    if(obj.text) text = obj.text;
    if(obj.id){
        let id = document.getElementById('messMenu').getAttribute('w_id');
        let d = document.querySelector(`div[_id="${id}"]`);
        if(!d) return;
        text = d.children[0].innerHTML + " powiedział ";
        text += d.children[1].getAttribute("_plain");
    }
    if(!text) return;
    if(!reader){
        reader = new SpeechSynthesisUtterance();
        reader.lang = "pl-PL";
    }
    reader.text = text;
    speechSynthesis.speak(reader);
}

function emulateConfettiClick(x=window.innerWidth / 2, y=window.innerHeight / 2){
    var clickEvent = new MouseEvent("click", {
        view: window, bubbles: true, cancelable: true,
        clientX: x, clientY: y,
    });
    document.getElementById("confetti").dispatchEvent(clickEvent);
}

function kodLog(){
    var id = localStorage.getItem("user_id");
    alert("Kod logowania: "+id[0]+id[id.length-1]+"");
}

function socrollToBottom(){
    if(socrollBlock) return;
    socrollBlock = true;
    setTimeout(() => {
        var tmp = msgDiv.g();
        tmp.scrollTop = tmp.scrollHeight;
    }, 50);
}

function copyMess(){
    let id = document.getElementById('messMenu').getAttribute('w_id');
    const messageDiv = document.getElementById(id + "_");
    const messageContent = messageDiv.getAttribute("_plain");
    navigator.clipboard.writeText(messageContent);
}

function changeIdToName(id){
    if(friendsId[id]) return friendsId[id];
    var data = getInServer("userId?user="+id);
    friendsId[id] = data;
    return data;
}

function changeIdToServer(id){
    if(serversId[id]) return serversId[id];
    var data = getInServer("serverId?s="+id);
    serversId[id] = data;
    return data;
}

function getInServer(url){
    var dataS = __.httpReq(url);
    var data = JSON.parse(dataS);
    if(data.err){
        alert("Error getInServer: url: "+url+"  ::  "+dataS);
        return null;
    }
    return data.msg;
}

function emocjiMenu(){
    var e = __("#emocjiMenu");
    e.style("");
    animateFade(e.get(), 0);

    var del = () => {
        animateFade(e.get(), 1, 300);
        setTimeout(() => e.style().display = "none", 700);
        document.removeEventListener("click", del);
    }
    setTimeout(() => {
        document.addEventListener("click", del);
    }, 1000);
}

function movableDiv(movableDiv, margin=3){
    let isDragging = false;
    let offsetX, offsetY;

    function disableSelect(element){
        element.style.userSelect = "none";
        for(const child of element.children){
            disableSelect(child);
        }
    }
    disableSelect(movableDiv);

    movableDiv.addEventListener("mousedown", (e) => {
        isDragging = true;

        offsetX = e.clientX - movableDiv.getBoundingClientRect().left;
        offsetY = e.clientY - movableDiv.getBoundingClientRect().top;

        movableDiv.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if(!isDragging) return;

        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        const maxX = window.innerWidth - movableDiv.offsetWidth - margin;
        const maxY = window.innerHeight - movableDiv.offsetHeight - margin;

        const constrainedX = Math.min(maxX, Math.max(0, x) + margin);
        const constrainedY = Math.min(maxY, Math.max(0, y) + margin);

        movableDiv.style.left = constrainedX + "px";
        movableDiv.style.top = constrainedY + "px";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        movableDiv.style.cursor = "grab";
    });
}

function sendBtnStyle(){
    var len = inpSendDiv.value().trim().length;
    var prop = "";
    if(len == 0) prop = "grey";
    else if(len <= 90) prop = "green";
    else if(len > 90) prop = "red";
    __("#sendBtn-img").style().setProperty("--fil", prop);
    document.querySelector("#send-menu button").disabled = len == 0;
}

function serverInit(){
    __("#serverName").html(changeIdToServer(to));
}

function sendFile(){
    var input = document.createElement("input");
    input.type = "file";
    input.click();

    input.addEventListener("change", function(event) {
        var file = event.target.files[0];
        if(file.size > 8 * 1024 * 1024){
            alert('File size exceeds 8MB limit.');
            return;
        }
        if(file.name > 40){
            alert('File name exceeds 40 char limit.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileData = {
                name: file.name,
                size: file.size,
                data: event.target.result
            };
            socket.emit('file', { fileData });
        };

        reader.readAsArrayBuffer(file);
    });
}

function responeMsgE(){
    resMsgId = __("#messMenu").atrib("w_id");
    __("#resMsgX").style("");
}

function reloadMsg(time){
    function f(){
        msgDiv.html("");
        socket.emit("getMessage", to, 0, messCount, false);
    }
    time ? setTimeout(f, time*1000) : f();
}

function editMess(){
    let id = document.getElementById('messMenu').getAttribute('w_id');
    const messageDiv = document.getElementById(id + "_");
    const messageContent = messageDiv.getAttribute("_plain");
    messageDiv.innerHTML = `<input type="text" class="editMess" id="editMessageInput${id}" value="${messageContent}">`;
    messageDiv.insertAdjacentHTML('beforeend', `<button class="editMessB" id="confirmButton${id}">Zatwierdź</button>`);
    const editMessageInput = document.getElementById(`editMessageInput${id}`);
    const confirmButton = document.getElementById(`confirmButton${id}`);
    confirmButton.addEventListener("click", () => handleEditEnd(id, messageContent));
    editMessageInput.addEventListener("keydown", (event) => {
        if(event.key !== "Enter") return;
        event.preventDefault();
        handleEditEnd(id, messageContent);
    });
    editMessageInput.focus();
    editMessageInput.setSelectionRange(editMessageInput.value.length, editMessageInput.value.length);
}

function handleEditEnd(id, messageContent){
    const editedMessage = document.getElementById(`editMessageInput${id}`).value;
    const messageDiv = document.getElementById(id + "_");
    if(editedMessage != messageContent){
        messageDiv.innerHTML = messageContent;
        socket.emit("editMess", to, id, editedMessage);
    }else{
        messageDiv.innerHTML = formatText(messageContent);
    }
    focusInp();
}

function delMess(){
    if(!confirm("Napewno chcesz usunąć wiadomość? Tej operacji nie można cofnąć")) return;
    let id = document.getElementById('messMenu').getAttribute('w_id');
    socket.emit("delMess", to, id);
}

function copyIdServer(){
    let id = document.getElementById("serverMenu").getAttribute("w_id");
    navigator.clipboard.writeText(id);
}

function copyInvite(){
    let id = document.getElementById("serverMenu").getAttribute("w_id");
    socket.emit("getInivteFromId", id);
}

function createChat(){
    var name = (prompt("Jak ma nazywać się serwer?") || "").trim();
    if(!name || name == "") return uiMsg("Podaj nazwę", 2);
    socket.emit("createChat", name);
    setTimeout(() => socket.emit("getChats"), 1000);
    __('#alertServerAction').style('display: none;')
}

function inivteAchat(id=null){
    if(!id){
        var idP = "000000-000000-000000";
        var txt = "Podaj id zaprosznia:\n"+
        "Przykładowa formaty to:\n"+
        `- ${idP}\n`+
        `- ${location.host}/ic?id=${idP}\n`+
        `- ${location.protocol}//${location.host}/ic?id=${idP}`;
        id = (prompt(txt) || "").trim();
    }
    if(!id || id == "") return uiMsg("Podaj id", 2);

    var match = id.match(/(\w+-\w+-\w+)/);
    if(!match){
        __('#alertServerAction').style('display: none;')
        uiMsg("Podaj poprawne zaproszenie", 2);
    }
    id = match[1];

    lo(id)
    socket.emit("inviteChat", id);
    setTimeout(() => socket.emit("getChats"), 500);
    __('#alertServerAction').style('display: none;')
}

function notifSound(){
    switch(ifpSettings.main["typ powiadomienia"]){
        case "Dźwięk":
            sounds.notifVaw.play();
        break;
        case "Lektor":
            sounds.lektorSpeak("Masz nową wiadomość");
        break;
    }
}

function animateFade(ele, from, time=200){
    var style = ele.style;
    var steps = 50;
    var timeToStep = time / steps;
    var d = (from == 0 ? 1 : -1)/steps;
    var index = 0;
    style.opacity = from;

    var interval = setInterval(() => {
        if(index >= steps){
            clearInterval(interval);
            return;
        }
        style.opacity = parseFloat(style.opacity) + d;
        index++;
    }, timeToStep);
}