function changeTo(f){
    inputChat[toChat] = msgInput.value;
    toChat = f;
    msgInput.v("");
    [...document.querySelectorAll(".a-active")].forEach(e => {
        e.classList.remove("a-active")
    });
    if(f == "main"){
        socket.emit("getFirendsActivity");
        sendDiv.css({ display: "none" });
        document.getElementById("goMain").clA("a-active");
    }else{
        msgDiv.html("");
        sendDiv.css({ display: "block" });
        toChatChannel = "main"; //tmp
        getMessages();
        actMess = messCount;
        focusInp();
        if(inputChat[toChat]){
            inpSendDiv.value(inputChat[toChat]);
            inpSendDiv.g().dispatchEvent(new Event("input"));
        }
        document.querySelector("#goMain").clR("a-active");
        
        /* in socket */
        if(!toChat.startsWith("$")){
            document.querySelector("#serverChannels").innerHTML = "";
            socket.emit("setUpServer", toChat);
        }
        /* in socket */



    }
    handleWifElements();
}

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
    const line = new Error().stack.split('\n')[2].trim();
    const path = line.slice(line.indexOf("@")+1);
    const shortPath = path.replace(location.origin+"/", "");
    lo(shortPath || path, data)
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

function socrollToBottom(){
    if(socrollBlock) return;
    socrollBlock = true;
    setTimeout(() => {
        msgDiv.scrollTop = msgDiv.scrollHeight;
    }, 50);
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

function setUpServer(categories){
    document.querySelector("#serverName").innerHTML = changeIdToServer(toChat);
    const div = document.querySelector("#serverChannels");

    function buildChannel(name, id, type, root){
        const btn = document.createElement("button");
        btn.onclick = () => {
            if(type == "text"){
                msgDiv.html("");
                toChatChannel = id;
                getMessages();
            }else if(type == "voice"){
                serverCall(id);
            }
        };
        btn.clA("channel_"+type);

        btn.innerHTML = name;
        root.appendChild(btn);
    }

    function buildCategory(name, channels, root){
        const detail = document.createElement("details");
        detail.open = true;

        const summary = document.createElement("summary");
        summary.innerHTML = name;
        detail.appendChild(summary);

        channels.forEach(channel => {
            buildChannel(channel.name, channel.id, channel.type, detail);
        });
        root.appendChild(detail);
    }

    categories.forEach(category => {
        buildCategory(category.name, category.channels, div)
    })
}

function getMessages(opt=false){
    socket.emit("getMessage", toChat, toChatChannel, 0, messCount, opt);
}

function menuClickEvent(div, call){
    if(!utils.ss()){
        div.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            call(e);
            return false;
        });
        return;
    }
    //if mobile
    let time;
    div.addEventListener("dblclick", call);
    div.addEventListener("mousedown", () => time = new Date());
    div.addEventListener("touchstart", () => time = new Date());
    div.addEventListener("touchend", end);
    div.addEventListener("mouseup", end);
    function end(e){
        time = new Date() - time;
        if(time > 1000) setTimeout(() => call(e), 100);
    }
}

function setUserStatus(div, type, color="#333"){
    div.classList.remove('user-active-icon', 'user-inactive-icon', 'user-sleeping-icon', 'user-dnd-icon');

    switch(type){
        case 'a':
            div.classList.add('user-active-icon');
        break;
        case 'i':
            div.classList.add('user-inactive-icon');
        break;
        case 's':
            div.classList.add('user-sleeping-icon');
            div.style.setProperty("--bg", color)
        break;
        case 'd':
            div.classList.add('user-dnd-icon');
        break;
        default:
            div.classList.add('user-inactive-icon');
        break;
    }
}

function updateCountdown(){
    let currentTime = Math.floor(new Date().getTime() / 1000);
    let timeDifference = timeToDailyCase - currentTime;

    if(timeDifference > 0){
        let hours = Math.floor(timeDifference / 3600);
        let minutes = Math.floor((timeDifference % 3600) / 60);
        let seconds = timeDifference % 60;

        dailyBtn.innerHTML = `Pozostało: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }else{
        dailyBtn.innerHTML = "Open";
    }
}
setInterval(() => {updateCountdown()}, 1000);