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

function getRoleColor(from){
    if(!serverData.roles || serverData.roles.length == 0) return "";
    let rolesA = sortRolesByHierarchy(serverData.roles);
    let user = serverData.users.find(user => user.id == from);
    let uppestRole = rolesA.find(r => user.roles.includes(r.id));
    let color = uppestRole.color;
    return color || "";
}