function htmlToHtmlCraftString(element){
    function walk(node) {
        let obj = { q: '', ch: [] };
        if (!node.tagName) {
            return null; // Ignorujemy węzły, które nie są tagami
        }
    
        let selector = node.tagName.toLowerCase();
        if (node.id) {
            selector += "#" + node.id;
        }
        if (node.className) {
            selector += "." + node.className.split(/\s+/).join('.');
        }
    
        // Nowa logika do ekstrakcji atrybutów
        const attrs = [];
        for (let attr of node.attributes) {
            // Pomijamy id i class, ponieważ są już obsłużone
            if (attr.name !== 'id' && attr.name !== 'class') {
                attrs.push(`${attr.name}='${attr.value}'`);
            }
        }
    
        // Jeśli są jakieś atrybuty, dodajemy je do selektora
        if (attrs.length > 0) {
            selector += ` ${attrs.join(' ')}`;
        }
    
        obj.q = selector;
    
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                obj.ch.push({ q: '| ' + child.textContent.trim(), ch: [] });
            } else {
                let childObj = walk(child);
                if (childObj) {
                    obj.ch.push(childObj);
                }
            }
        });
    
        return obj;
    }
    

    function objToPugString(obj, level = 0) {
        let str = '';
        let indent = '    '.repeat(level);

        if(obj.q.startsWith('|')){
            str += `${indent.slice(3)}${obj.q}\n`;
        }else{
            str += `${indent}${obj.q}\n`;
            obj.ch.forEach(child => {
                str += objToPugString(child, level + 1);
            });
        }

        return str;
    }

    const obj = walk(element);
    return objToPugString(obj).trim();
}