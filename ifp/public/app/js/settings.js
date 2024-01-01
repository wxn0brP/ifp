var ifpSettings = {
    konto: {}
};

(function(){
    var appSettings = localStorage.getItem("settings");
    if(!appSettings) return;

    appSettings = JSON5.parse(appSettings);
    updateObject(ifpSettings, appSettings);
})();

var settings_action = {
    accountSave(meuiData){
        let meuiDataG = meuiData.get();
        let data = {
            opis: meuiDataG.opis
        }
        lo(data)
    }
}

function settingsApp(){
    let html = cw.get("settings/app.html");
    document.querySelector("#settingsDiv").fadeIn();
    var e = document.querySelector("#settingsDivC");
    e.innerHTML = html;

    let meuiData = meuiInit(e, ifpSettings);

    e.querySelectorAll("[cclick]").forEach(ele => {
        let action = ele.getAttribute("cclick");
        if(!settings_action[action]) return;
        ele.addEventListener("click", () => {
            settings_action[action](meuiData);
        });
    })
}

function closeSettings(){
    var e = document.querySelector("#settingsDiv");
    e.fadeOut();
}