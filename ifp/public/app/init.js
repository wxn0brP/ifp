(() => {
    const htmlParser = new DOMParser();

    function loadComponent(path, parentEle){
        const text = HtmlCraft(cw.get(path));
        const html = htmlParser.parseFromString(text, "text/html");
        const elements = Array.from(html.body.children);
        for(let e of elements){
            parentEle.insertAdjacentElement("afterend", e);
            loadComponents(e);
        }
    }

    function loadComponents(ele){
        ele.querySelectorAll("[loadPart]").forEach(loadPart => {
            loadComponent("app/"+loadPart.getAttribute("loadPart")+".html", loadPart);
            loadPart.remove();
        });
    }

    async function loadJs(){
        const srcs = [
            "app/leftMenu.js",
            "app/menu.js",
            "app/mess.js",
            "app/popup.js",

            "/meui/meui.js",
            "/js/generateResCss.js",
            "genId",
            "vars",
            "params",
            "ws",
            "format",
            "apis",
            "cont-menu",
            "func",
            "uiFunc",
            "audioFunc",
            "callsApi",
            "settings",
            "serverMgmt",
            "channelMgmt",
            "anty",
            "warning",
            "egg",
            "encrypt",
            "run",
            "snakes",
            "theme",
            "cases",
            "rolesMgmt",
        ];
        let assets = document.querySelector("#assets");
        async function loadScript(p){
            return await new Promise((resolve) => {
                const script = document.createElement("script");
                if(!p.startsWith("js/") && !p.endsWith(".js"))
                    p = "js/" + p + ".js";
                
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
            await loadScript(srcs[i]);
        }
    }

    loadComponents(document.querySelector("#app"));
    loadJs();
    document.querySelectorAll(".delete").forEach(e => {
        let time = parseInt(e.getAttribute("time"));
        setTimeout(()=>e.remove(), time);
    });
})();