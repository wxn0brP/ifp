function displayServerMgmt(){
    socket.emit("getServerPerm", toChat);
    // TODO zrealizować w UI zarządznie serwerem
}

var ifpSettingsServer = {};

function getServerPerm(data){
    lo(data);
    settingsChangeSever("server_main", true);
}

function settingsChangeSever(name, fade=false){
    document.querySelector("#settingsList_user").style.display = "none";
    document.querySelector("#settingsList_server").style.display = "block";
    settingsChange_(name, fade);
    settingsInit(document.getElementById("settingsDivC"), ifpSettingsCreator[name], ifpSettingsServer[name], () => {
        closeSettings();
    });
}