function loadHtml(doc=document){
    const parser = new DOMParser();
    const scriptsArray = [];
    doc.querySelectorAll("[loadHtml]").forEach(ele => {
        const text = cw.get(ele.getAttribute("loadHtml"));
        const html = parser.parseFromString(text, "text/html");
        const scripts = html.querySelectorAll("script");
        scripts.forEach(src => {
            scriptsArray.push(src);
            src.remove();
        });
        const elements = Array.from(html.body.children);
        elements.forEach(e => {
            ele.insertAdjacentElement("afterend", e);
        });
        ele.remove();
    });
    scriptsArray.forEach(script => {
        let text = (script.src) ? cw.get(script.src) : script.innerHTML;
        const src = doc.createElement("script");
        src.innerHTML = text;
        doc.body.appendChild(src);
    });
}

loadHtml();