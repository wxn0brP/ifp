setTimeout(() => {
    var loadingScreen = document.getElementById("loadingScreen");
    if(!loadingScreen) return;
    loadingScreen.remove();
}, 3100);

setTimeout(() => {
    var ele = document.querySelectorAll("[loadUrl]");
    [...ele].forEach(e => {
        var link = e.getAttribute("loadUrl");
        var data = __.httpReq(link);
        e.innerHTML = data;
    })
}, 1000);

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
    var emocjis = JSON.parse(__.httpReq("/emocji/menu.json"));
    var root = __("#emocjiMenu");

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
        root.add(cat);
    }
})();

movableDiv(document.getElementById("callMedia"));

__("#resMsgX").on("click", () => {
    resMsgId = null;
    __("#resMsgX").style("display: none");
});

document.addEventListener("resize", () => __.mobile());
inpSendDiv.on("input", () => {
    [
        function(){
            if(isType) return;
            if(inpSendDiv.cont() == "") return;
            isType = true;
            socket.emit("type", to);
            setTimeout(() => {
                isType = false;
            }, 5000);
        },
        function(){
            inpSendDiv.value(changeEmo(inpSendDiv.value()));
        },
        sendBtnStyle
    ].forEach(e=>e());
});

__("#app").on("contextmenu", (e) => {
    e.preventDefault();
    return false;
});

document.addEventListener('keydown', (e) => {
    if(inpSendDiv.get() == document.activeElement) return;
    if(e.ctrlKey) return;
    if(e.altKey) return;

    var edit = document.querySelector(".editMess");
    if(edit) return;

    var inp = inpSendDiv.g();
    inp.focus();
    var tLen = inp.value.length;
    if(tLen > 0){
        inp.setSelectionRange(tLen, tLen);
    }
});

msgDiv.on("scroll", () => {
    if(msgDiv.g().scrollTop == 0){
        loadMoreMess();
    }
});