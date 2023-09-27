(async function(){
    var robot = _anty.robotsDetecort();
    if(robot) location.href = "/";

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
                var s = inpSendDiv.g();
                s.value += e;
                inpSendDiv.g().dispatchEvent(new Event("input"));
            });
            cat.appendChild(ele);
        });
        cat.appendChild(document.createElement("hr"));
        root.appendChild(cat);
    }
})();