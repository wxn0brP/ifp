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

function changeTo(f){
    inputChat[toChat] = msgInput.value;
    toChat = f;
    msgInput.v("");
    [...document.querySelectorAll(".a-active")].forEach(e => {
        e.classList.remove("a-active")
    });
    if(f == "main"){
        // msgDiv.html(main);
        msgDiv.html("nic");
        sendDiv.css({ display: "none" });
        // sendDiv.style("display: none;");
        // document.getElementById("goMain").classList.add("a-active");
        // document.getElementById("friends-main").style.display = "";
        // document.getElementById("friends-server").style.display = "none";
        // __("#callToBtn").style().cursor = "not-allowed";
    }else{
        //TODO dodać kanały
        msgDiv.html("");
        sendDiv.css({ display: "block" });
        socket.emit("getMessage", toChat, 0, messCount, false);
        actMess = messCount;
        focusInp();
        // if(menuL){
        //     document.getElementById("friends-main").style.display = "none";
        //     document.getElementById("friends-server").style.display = "";
        //     serverInit();
        // }
        if(inputChat[toChat]){
            inpSendDiv.value(inputChat[toChat]);
            inpSendDiv.g().dispatchEvent(new Event("input"));
        }
        // __("#callToBtn").style().cursor = "pointer";
    }
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
    if(!reader){
        reader = new SpeechSynthesisUtterance();
        reader.lang = "pl-PL";
    }
    reader.text = text;
    speechSynthesis.speak(reader);
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