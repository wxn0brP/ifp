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
    let assets = document.querySelector("#assets");
    paths.forEach(path => {
        const src = document.createElement("script");
        src.src = "app/"+path+".js";
        assets.appendChild(src);
    });
    loadJs();
}

async function loadJs(){
    const srcs = [
        "js/settingsLib.js",
        "js/settings.js",
        "js/vars.js",
        "js/params.js",
        "js/ws.js",
        "js/format.js",
        "js/apis.js",
        "js/cont-menu.js",
        "js/func.js",
        "js/uiFunc.js",
        "js/audioFunc.js",
        "js/callsApi.js",
        "/js/generateResCss.js",
        "js/anty.js",
        "js/warning.js",
        "js/egg.js",
        "js/encrypt.js",
        "js/run.js",
        "js/snakes.js",
        "js/cases.js",
    ];
    let assets = document.querySelector("#assets");
    async function load(p){
        return await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = p;
            const loadEvt = () => {
                resolve();
                script.removeEventListener("load", loadEvt);
            }
            script.addEventListener("load", loadEvt);
            assets.appendChild(script);
        })
    }
    for(let i=0; i<srcs.length; i++){
        await load(srcs[i]);
    }
}

loadPart();
document.querySelectorAll(".delete").forEach(e => {
    let time = parseInt(e.getAttribute("time"));
    setTimeout(()=>e.remove(), time);
});