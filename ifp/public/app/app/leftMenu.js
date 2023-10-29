function kodLog(){
    var id = localStorage.getItem("user_id");
    alert("Kod logowania: "+id[0]+id[id.length-1]+"");
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
    document.querySelector('#alertServerAction').css('display: none;')
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
        document.querySelector('#alertServerAction').css('display: none;')
        uiMsg("Podaj poprawne zaproszenie", 2);
    }
    id = match[1];

    socket.emit("inviteChat", id);
    setTimeout(() => socket.emit("getChats"), 500);
    document.querySelector('#alertServerAction').css('display: none;')
}

function addInviteToUi(invite){
    const inviteDiv = document.createElement("div");
    
    const fromLabel = document.createElement("label");
    fromLabel.textContent = `From: ${changeIdToName(invite.from)}`;
    inviteDiv.appendChild(fromLabel);
    
    const acceptBtn = document.createElement("button");
    acceptBtn.textContent = "Accept";
    acceptBtn.addEventListener("click", () => {
        socket.emit("inviteAccept", invite._id);
        document.querySelector("#invites").removeChild(inviteDiv);
        setTimeout(() => {
            socket.emit("friends");
        }, 2000);
    });
    inviteDiv.appendChild(acceptBtn);
    
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
        socket.emit("inviteDelice", invite._id);
        document.querySelector("#invites").removeChild(inviteDiv)
    });
    inviteDiv.appendChild(delBtn);
    
    document.querySelector("#invites").appendChild(inviteDiv);
}

function addFriends(){
    var inp = prompt("Podaj nazwę swojego przyjaciela: ");
    if(!inp) return uiMsg("musisz podać user", 1);
    
    inp = inp.trim();
    if(inp == "") return uiMsg("musisz podać user", 1);
    
    if(inp == localUser.fr){
        return uiMsg("nie możesz wysłać zaproszenia do siebie", 1);
    }

    var res = JSON.parse(cw.get("/userName?user="+inp));
    if(res.err){
        return uiMsg(res.msg, 1);
    }
    var id = res.msg;
    if(changeIdToName(id) == localUser.id){
        return uiMsg("nie możesz wysłać zaproszenia do siebie", 1);
    }

    socket.emit("invite", id);
}

function deleteFriends(){
    if(!confirm("Ta operacja spowoduje usunięcie **"+changeIdToName(to)+"** z listy przyjaciół!!!")) return;
    if(!confirm("Napewno?")) return;
    if(!confirm("Napewno? (double click)")) return;
    socket.emit("deleteFriends", to);
    changeTo("main");
    setTimeout(() => socket.emit("getStatus"), 1000);
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

function mobileMenuToogler(){
    var style = document.querySelector("#menu").style;
    style.left = style.left == "-100%" ? "0px" : "-100%";
}

setTimeout(() => {
    if(utils.ss()) mobileMenuToogler();
}, 200);

function importMess(){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json5';
      
    input.addEventListener('change', function(){
        const selectedFile = input.files[0];
        if (!selectedFile) return;
        const reader = new FileReader();
        reader.onload = function(event){
            const fileContent = event.target.result;
            try{
                const jsonData = JSON5.parse(fileContent);
                toChat = "$import";
                msgDiv.innerHTML = "";
                jsonData.forEach(obj => {
                    const msg = document.createElement("div");
                    msg.classList.add("mess");
                    msg.innerHTML = 
                        `<div><b>${obj.fr}</b></div>`+
                        `<div>${formatText(obj.txt)}</div>`;
                    msgDiv.appendChild(msg);
                });
            }catch{
                uiMsg("Wybrany plik jest uszkodzony lub jest w innym formacie.", 1);
                return;
            }
        };
        reader.readAsText(selectedFile);
    });
    input.click();
}

function exportMess(){
    let chcek = confirm("Tak");
    if(!chcek) return;
    const exp = [];
    document.querySelectorAll(".mess").forEach(ele => {
        exp.push({
            fr: ele.querySelector("div>b").innerHTML,
            txt: ele.querySelector("[_plain]").getAttribute("_plain")
        });
    });
    const json = JSON5.stringify(exp);
    const downloadLink = document.createElement("a");
    downloadLink.href = "data:text/plain;charset=utf-8," + encodeURIComponent(json);
    downloadLink.download = "IFP-"+localUser.fr+"-"+changeIdToName(toChat.replace("$",""))+".json5";
    downloadLink.click();
}

function displayServerMgmt(){
    socket.emit("getServerPerm", toChat);
    // TODO zrealizować w UI zarządznie serwerem
}