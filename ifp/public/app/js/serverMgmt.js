function displayServerMgmt(){
    socket.emit("getServerSettings", toChat);
}

var ifpSettingsServer = {
    server: {
        name: ""
    }
};

var serverRun = {
    server: () => {
        socket.emit("editServer", { server: toChat, set: ifpSettingsServer["server"] })
    }
};

function getServerSettings(data, roles){
    ifpSettingsServer.server = data;
    lo(data);
    lo(roles);
    settingsChangeSever("server", true);
}

function settingsChangeSever(name, fade=false){
    document.querySelector("#settingsList_user").style.display = "none";
    document.querySelector("#settingsList_server").style.display = "block";
    settingsChange_(name, fade);
    settingsInit(document.getElementById("settingsDivC"), ifpSettingsCreator[name], ifpSettingsServer[name], () => {
        closeSettings();
        serverRun[name]();
    });
}