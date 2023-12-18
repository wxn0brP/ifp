function readText(obj){
    uiMsg("Funkcja chwilowa niedostępna");
    // var text = "";
    // if(obj.text) text = obj.text;
    // if(obj.id){
    //     let id = document.getElementById('messMenu').getAttribute('w_id');
    //     let d = document.querySelector(`div[_id="${id}"]`);
    //     if(!d) return;
    //     text = d.children[0].innerHTML.replace("<b>","").replace("</b>","") + " powiedział ";
    //     text += d.children[1].getAttribute("_plain");
    // }
    // if(!text) return;
    // sounds.lektorSpeak(text);
}

function genId(){
    var unix = Math.floor(new Date().getTime() / 1000).toString(16);
    var unixPod = Math.pow(10, unix.length);
    var random1 = (Math.floor(Math.random() * unixPod)).toString(16);
    var random2 = (Math.floor(Math.random() * unixPod)).toString(16);
    return unix + "-" + random1 + "-" + random2;
}

function notifSound(){
    sounds.notifVaw.play();
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




