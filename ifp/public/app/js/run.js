changeTo("main");
loadApis();
cw.grid();

setTimeout(loadFilesWithUrl, 1000);

movableDiv(document.getElementById("callMedia"), document.getElementById("callMediaMov"));

document.querySelector("#responeMsgCloseMenu").on("click", () => {
    resMsgId = null;
    document.querySelector("#responeMsgCloseMenu").style("display: none");
});

document.querySelector("#app").on("contextmenu", (e) => {
    e.preventDefault();
    return false;
});

(async function(){
    var robot = _anty.robotsDetector();
    if(robot) location.href = "/";

    if(utils.ss()) return;

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

setInterval(handleWifElements, 500);

(function(){
    const hammer = new Hammer(document.querySelector("#app"));
    hammer.on('swipe', function(event){
        var style = document.querySelector("#menu").style;
        if(event.direction === Hammer.DIRECTION_LEFT){
            if(style.left == "0px") mobileMenuToogler();
        }else if(event.direction === Hammer.DIRECTION_RIGHT){
            if(style.left == "-100%") mobileMenuToogler();
        }
    });
})();