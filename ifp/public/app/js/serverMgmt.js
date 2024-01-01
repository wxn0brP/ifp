function displayServerMgmt(){
    socket.emit("getServerSettings", toChat);
}

var ifpSettingsServer = {
    server: {
        name: ""
    },
    roles: {
        roles: []
    }
};

var settings_actionS = {
    server(){
        socket.emit("editServer", { server: toChat, set: ifpSettingsServer["server"] })
    },
};

function getServerSettings(data, roles){
    ifpSettingsServer.server = data;
    ifpSettingsServer.roles.roles = roles;
    settingsServer();
}

function settingsServer(){
    let html = cw.get("settings/server.html");
    document.querySelector("#settingsDiv").fadeIn();
    var e = document.querySelector("#settingsDivC");
    e.innerHTML = html;

    let meuiData = meuiInit(e, ifpSettings);

    e.querySelectorAll("[cclick]").forEach(ele => {
        let action = ele.getAttribute("cclick");
        if(!settings_actionS[action]) return;
        ele.addEventListener("click", () => {
            settings_actionS[action](meuiData);
        });
    });


    rolesMgmt(ifpSettingsServer.roles.roles, document.querySelector("#rolesMgmt"));
}