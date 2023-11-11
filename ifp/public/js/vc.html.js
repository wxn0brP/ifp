const socket = io("/vcFree");
const sounds = {
    notifVaw: new Audio("/notif.wav"),
    join: new Audio("/join.mp3"),
}

const localUser = {
    fr: "user",
    id: ""
}

function debugMsg(a){
    lo(a);
}

socket.on("con", (name, id) => {
    localUser.fr = name;
    localUser.id = id;

    const room = prompt("Do jakiego pokoju chcesz dołączyć?");
    joinVC(room);
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
    lo(users)
    users = users.map(user => {
        return `<li>${user}</li>`;
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
});