function displayServerMgmt(fade=true){
    socket.emit("getServerSettings", toChat);
    serverFadeIn = fade;
}

var serverFadeIn = true;

var ifpSettingsServer = {
    server: {
        name: "",
        channels: []
    },
    roles: {
        roles: []
    },
};

var settings_actionS = {
    server(meuiData){
        let data = meuiData.get();
        socket.emit("editServer", toChat, data);
    },
    channel(){
        let data = channelMgmt.categories;
        socket.emit("server_chnl", toChat, data);
    },
    addRole(){
        socket.emit('server_addRole', toChat);
        setTimeout(() => displayServerMgmt(false), 100);
    }
};

function getServerSettings(data, roles){
    ifpSettingsServer.server = data;
    ifpSettingsServer.roles.roles = roles;
    settingsServer();
}

function settingsServer(){
    let html = cw.get("settings/server.html");
    if(serverFadeIn) document.querySelector("#settingsDiv").fadeIn();
    var e = document.querySelector("#settingsDivC");
    e.innerHTML = html;

    let meuiData = meuiInit(e, ifpSettingsServer.server);

    e.querySelectorAll("[cclick]").forEach(ele => {
        let action = ele.getAttribute("cclick");
        if(!settings_actionS[action]) return;
        ele.addEventListener("click", () => {
            settings_actionS[action](meuiData);
        });
    });


    rolesMgmt(ifpSettingsServer.roles.roles, document.querySelector("#rolesMgmt"));
    channelMgmt.categories = ifpSettingsServer.server.channels;
    channelMgmt.renderCategories();
}