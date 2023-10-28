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
    konto: () => {
        socket.emit("setProfile", ifpSettings.konto);
    },
}

if(localStorage.getItem("settings")){
    var set = localStorage.getItem("settings");
    updateObject(ifpSettings, JSON5.parse(set));
}

var ifpSettingsCreator = {}

function settingsChange(name, fade=false){
    if(!ifpSettingsCreator[name]){
        var json = cw.get("settings/"+name+".md");
        ifpSettingsCreator[name] = settingsChangeTranslate(json);
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

function settingsChangeTranslate(md){
    var list = [];
    var lines = md.split("\n");

    var category = {};
    for(let i=0; i<lines.length; i++){
        var line = lines[i].trim();
        if(line.startsWith("/- ")){
            category.name = line.replace("/- ","");
            category.cat = [];
        }else if(line.startsWith("/+ ")){
            let tmp = "{"+line.replace("/+ ","")+"}";
            category.cat.push(JSON5.parse(tmp));
        }else if(line.startsWith("// ")){
            let tmp = line.replace("// ","");
            category.cat.push(tmp);
        }else if(line == "//-"){
            list.push(category);
            category = {};
        }
    }
    return list;
}