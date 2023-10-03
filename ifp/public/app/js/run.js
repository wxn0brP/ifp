changeTo("main");
loadApis();
cw.grid();

setTimeout(() => {
    let ele = document.querySelectorAll("[loadUrl]");
    [...ele].forEach(e => {
        const link = e.getAttribute("loadUrl");
        const data = cw.get(link);
        e.innerHTML = data;
    })
}, 1000);

movableDiv(document.getElementById("callMedia"), document.getElementById("callMediaMov"));

document.querySelector("#resMsgX").on("click", () => {
    resMsgId = null;
    document.querySelector("#resMsgX").style("display: none");
});

document.querySelector("#app").on("contextmenu", (e) => {
    e.preventDefault();
    return false;
});

(async function(){
    var robot = _anty.robotsDetector();
    if(robot) location.href = "/";

    await delay(10_000);
    var add = await _anty.addBlockerDetector();
    if(!add) return;
    setTimeout(() => {
        uiMsg(
            "Widzę, że korzystasz z AdBlock'a. "+
            "Może warto go chwilowo wyłączyć? "+
            "Pss. U nas nie ma irytujących reklam :)"
        );
    }, 1000);
})();

(function(){
    var emocjis = JSON.parse(cw.get("/emocji/menu.json"));
    var root = document.querySelector("#emocjiMenu");

    for(var key in emocjis){
        var emo = emocjis[key];
        var cat = document.createElement("span");

        Array.from(emo).forEach(e => {
            if(!e || e == "" || e == null) return;
            var ele = document.createElement("a");
            ele.innerHTML = e;
            ele.addEventListener("click", () => {
                msgInput.value += e;
                msgInput.dispatchEvent(new Event("input"));
            });
            cat.appendChild(ele);
        });
        cat.appendChild(document.createElement("hr"));
        root.add(cat);
    }
})();

document.getElementById("title").innerHTML = "IFP | "+localUser.fr;
window.parent.postMessage({
    type: "setTitle",
    msg: "IFP | "+localUser.fr
}, '*');