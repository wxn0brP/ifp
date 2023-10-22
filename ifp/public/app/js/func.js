function uiMessage(data, bg="green", time=6000){
    // errDiv.html(data);
    if(utils.ss()){
        alert(data);
        // setTimeout(clearErrMess, time);
        return;
    }

    const div = document.createElement("div");
    div.innerHTML = data;
    div.style.backgroundColor = bg;
    document.querySelector("#errMesses").add(div);
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
        // clearErrMess();
    }, time);
}

function uiMsg(data, type=0){
    let color = "";
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
    const speed = 1/3; //1s = 3 words
    const time = data.split(" ").length * speed + 6;
    uiMessage(data, color, time * 1000);
}

function debugMsg(data, i=false){
    if(!config.debug) return;
    if(i) uiMsg(data.toString(), 2);
    lo(data)
}

function movableDiv(movableDiv, area=movableDiv){
    let margin = 3;
    let isDragging = false;
    let offsetX, offsetY;

    function disableSelect(element){
        element.style.userSelect = "none";
        for(const child of element.children){
            disableSelect(child);
        }
    }
    disableSelect(area);

    area.addEventListener("mousedown", (e) => {
        isDragging = true;

        offsetX = e.clientX - movableDiv.getBoundingClientRect().left;
        offsetY = e.clientY - movableDiv.getBoundingClientRect().top;

        area.style.cursor = "grabbing";
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
        area.style.cursor = "grab";
    });
}

function changeTo(f){
    inputChat[toChat] = msgInput.value;
    toChat = f;
    msgInput.v("");
    [...document.querySelectorAll(".a-active")].forEach(e => {
        e.classList.remove("a-active")
    });
    if(f == "main"){
        msgDiv.html("nic");
        sendDiv.css({ display: "none" });
        document.getElementById("goMain").clA("a-active");
    }else{
        //TODO dodać kanały
        msgDiv.html("");
        sendDiv.css({ display: "block" });
        socket.emit("getMessage", toChat, 0, messCount, false);
        actMess = messCount;
        focusInp();
        if(inputChat[toChat]){
            inpSendDiv.value(inputChat[toChat]);
            inpSendDiv.g().dispatchEvent(new Event("input"));
        }
        document.getElementById("goMain").clR("a-active");
        // __("#callToBtn").style().cursor = "pointer";
        if(!toChat.startsWith("$")){
            //setUpServer()
        }
    }
    handleWifElements();
}

function socrollToBottom(){
    if(socrollBlock) return;
    socrollBlock = true;
    setTimeout(() => {
        msgDiv.scrollTop = msgDiv.scrollHeight;
    }, 50);
}

function readText(obj){
    var text = "";
    if(obj.text) text = obj.text;
    if(obj.id){
        let id = document.getElementById('messMenu').getAttribute('w_id');
        let d = document.querySelector(`div[_id="${id}"]`);
        if(!d) return;
        text = d.children[0].innerHTML.replace("<b>","").replace("</b>","") + " powiedział ";
        text += d.children[1].getAttribute("_plain");
    }
    if(!text) return;
    sounds.lektorSpeak(text);
}

function changeIdToName(id){
    if(friendsId[id]) return friendsId[id];
    var data = getInServer("/userId?user="+id);
    friendsId[id] = data;
    return data;
}

function changeIdToServer(id){
    if(serversId[id]) return serversId[id];
    var data = getInServer("/serverId?s="+id);
    serversId[id] = data;
    return data;
}

function genId(){
    var unix = Math.floor(new Date().getTime() / 1000).toString(16);
    var unixPod = Math.pow(10, unix.length);
    var random1 = (Math.floor(Math.random() * unixPod)).toString(16);
    var random2 = (Math.floor(Math.random() * unixPod)).toString(16);
    return unix + "-" + random1 + "-" + random2;
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

function imgSelector(){
    return new Promise(r => {
        let imgSelector = document.querySelector("#imgSelector");
        imgSelector.fadeIn();

        let imgs = document.querySelectorAll("#imgSelector svg");
        function handelClick(){
            r(this.getAttribute("_name"));
            imgSelector.fadeOut();
            imgs.forEach(img => img.removeEventListener("click", handelClick));
        }
        imgs.forEach(img => {
            img.addEventListener("click", handelClick);
        });
    });
}

function handleWifElements(){
    document.querySelectorAll('[w_if]').forEach(ele => {
        try{
            const wifAttribute = ele.getAttribute('w_if');
            const result = eval(wifAttribute);
            ele.style.display = result ? "" : "none";
        }catch(error){
            debugMsg(error);
        }
    });
}

function formatDateFormUnux(unixTimestamp){
    const date = new Date(unixTimestamp * 1000);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const formattedDate = `${day}.${month}.${year} ${hours}:${(minutes < 10 ? '0' : '')}${minutes}`;
    return formattedDate;
}

function loadFilesWithUrl(){
    let ele = document.querySelectorAll("[loadUrl]");
    [...ele].forEach(e => {
        const link = e.getAttribute("loadUrl");
        const data = cw.get(link);
        e.innerHTML = data;
        e.removeAttribute("loadUrl");
    })
}









function testMgmt(d){
    socket.emit("editServer", {
        server: "test",
        ...d
    })
}




