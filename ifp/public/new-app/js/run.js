setUpSocket();
changeTo("main");

setTimeout(() => {
    var ele = document.querySelectorAll("[loadUrl]");
    [...ele].forEach(e => {
        var link = e.getAttribute("loadUrl");
        var data = cw.get(link);
        e.innerHTML = data;
    })
}, 1000);