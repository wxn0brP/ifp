var ifpSettings = {
    main: {
        "głośność powiadomień": 70,
        "typ powiadomienia": "Dźwięk",
        "radio": false
    },
    konto: {

    }
}

var settingsRun = {
    main: () => {
        
    },
    konto: () => {},
}

if(localStorage.getItem("settings")){
    var set = localStorage.getItem("settings");
    updateObject(ifpSettings, JSON5.parse(set));
}

var ifpSettingsCreator = {}

function settingsChange(name, fade=false){
    if(!ifpSettingsCreator[name]){
        var json = cw.get("settings/"+name+".json5");
        ifpSettingsCreator[name] = JSON5.parse(json);
    }
    var e = document.querySelector("#settingsDiv");
    e.css("");
    if(fade) e.fadeIn();
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