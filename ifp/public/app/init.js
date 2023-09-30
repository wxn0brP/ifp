function loadPart(){
    const parser = new DOMParser();
    const paths = [];
    document.body.querySelectorAll("[loadPart]").forEach(ele => {
        paths.push(ele.getAttribute("loadPart"));
        const text = cw.get("app/"+ele.getAttribute("loadPart")+".html");
        const html = parser.parseFromString(text, "text/html");
        const elements = Array.from(html.body.children);
        elements.forEach(e => {
            ele.insertAdjacentElement("afterend", e);
        });
        ele.remove();
    });
    paths.forEach(path => {
        const src = document.createElement("script");
        src.src = "app/"+path+".js";
        document.body.appendChild(src);
    });
    loadJs();
}

async function loadJs(){
    const srcs = [
        "js/settingsLib.js",
        "js/settings.js",
        "js/vars.js",
        "js/ws.js",
        "js/format.js",
        "js/apis.js",
        "js/cont-menu.js",
        "js/func.js",
        "js/call.js",
        "js/generateResCss.js",
        "js/anty.js",
        "js/warning.js",
        "js/egg.js",
        "js/encrypt.js",
        "js/run.js"
    ];
    async function load(p){
        return await new Promise((r) => {
            const src = document.createElement("script");
            src.src = p;
            src.addEventListener("load", () => {
                r();
            });
            document.body.appendChild(src);
        })
    }
    for(let i=0; i<srcs.length; i++){
        await load(srcs[i]);
    }
}

loadPart();