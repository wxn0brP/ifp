var ifpSettings = {
    main: {
        "głośność powiadomień": 70,
        "typ powiadomienia": "Dźwięk",
        "radio": false
    },
}

var settingsRun = {
    main: () => {
        
    }
}

if(localStorage.getItem("settings")){
    var set = localStorage.getItem("settings");
    updateObject(ifpSettings, JSON5.parse(set));
}

var ifpSettingsCreator = {}

var settingsC = document.getElementById("settingsDivC");

function settingsChange(name){
    if(!ifpSettingsCreator[name]){
        var json = __.httpReq("/js/settings/"+name+".json5");
        ifpSettingsCreator[name] = JSON5.parse(json);
    }
    var e = __("#settingsDiv").style("");
    animateFade(e.get(), 0);
    settingsInit(settingsC, ifpSettingsCreator[name], ifpSettings[name], () => {
        closeSettings();
        localStorage.setItem("settings", JSON5.stringify(ifpSettings));
        settingsRun[name]();
    });
}

function closeSettings(){
    var e = __("#settingsDiv");
    animateFade(e.get(), 1);
    setTimeout(() => e.style("display: none"), 7000);
}