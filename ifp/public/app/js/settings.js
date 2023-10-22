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

function settingsChange(name){
    if(!ifpSettingsCreator[name]){
        var json = cw.get("settings/"+name+".json5");
        ifpSettingsCreator[name] = JSON5.parse(json);
    }
    var e = document.querySelector("#settingsDiv");
    e.css("");
    e.fadeIn();
    settingsInit(document.getElementById("settingsDivC"), ifpSettingsCreator[name], ifpSettings[name], () => {
        closeSettings();
        localStorage.setItem("settings", JSON5.stringify(ifpSettings));
        settingsRun[name]();
    });
}

function closeSettings(){
    var e = document.querySelector("#settingsDiv");
    e.fadeOut();
}