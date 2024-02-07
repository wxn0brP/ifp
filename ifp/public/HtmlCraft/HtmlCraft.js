window.HtmlCraft = (function(){
    function stringToObj(pugString){
        let lines = pugString.split('\n');
        let previousIndentLevel = 0;
        let out = { ch: [] };
    
        lines.forEach(line => {
            if(!line.trim()) return;

            let countTab = countTabsInLine(line);
            let obj = getDeepReference(out, countTab);
            obj.ch.push({
                q: line.trim(),
                ch: [],
                ct: countTab
            });

            previousIndentLevel = countTab;
        });
    
        return out.ch;
    }

    function parseObjToHTML(objArray, variables={}){
        let html = '';
        const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];

        for(let obj of objArray){
            let line = replaceVariables(obj.q, variables);
            let ods = "\n"+"    ".repeat(obj.ct)

            if(line.startsWith("| ")){
                html += line.slice(2);
                continue;
            }

            let { tag, attrs } = decomposeString(line);
            attrs = attrs ? " " + attrs.trim() : "";

            if(selfClosingTags.includes(tag)){
                html += ods+`<${tag}${attrs} />`;
            }else{
                html += ods+`<${tag}${attrs}>`;

                if(obj.ch && obj.ch.length > 0){
                    html += parseObjToHTML(obj.ch, variables);
                }

                html += ods+`</${tag}>`;
            }
        }

        return html;
    }

    function decomposeString(s){
        let result = {
            tag: '',
            attrs: '',
        }
    
        const splitIndex = s.search(/\s|$/);

        if(splitIndex < s.length){
            const rest = s.slice(splitIndex).trim();
            result.attrs = rest;
        }

        let { id, classes, tagName } = processIdAndClass(s.slice(0, splitIndex));
        if(id) result.attrs += ` id="${id}"`;
        if(classes.length > 0) result.attrs += ` class="${classes.join(' ')}"`;
        result.tag = tagName;
    
        return result;
    }
    
    function processIdAndClass(tag) {
        const pattern = /([.#])([\w-]+)/g; // Użyj globalnego flagi, aby przesuwać indeks wyszukiwania
        let match;
        let id = "";
        let classes = [];
        
        // Zmienne pomocnicze do przechowywania części tagu
        let tagWithoutIdAndClass = tag;
        
        while ((match = pattern.exec(tag))) {
            if (match[1] === '#') {
                id = match[2];
                // Usuń ID ze zmiennej tagWithoutIdAndClass
                tagWithoutIdAndClass = tagWithoutIdAndClass.replace(match[0], '');
            } else if (match[1] === '.') {
                classes.push(match[2]);
                // Usuń klasę ze zmiennej tagWithoutIdAndClass
                tagWithoutIdAndClass = tagWithoutIdAndClass.replace(match[0], '');
            }
        }
    
        // Tag name jest tym, co zostaje po usunięciu ID i klas
        let tagName = tagWithoutIdAndClass.trim();
        
        return { tagName, id, classes };
    }

    function countTabsInLine(line, tabWidth = 4){
        return Math.ceil(line.search(/\S|$/) / tabWidth);
    }

    function getDeepReference(obj, jumps){
        if(jumps <= 0 || !obj.ch || obj.ch.length === 0){
            return obj;
        }

        const lastChildIndex = obj.ch.length - 1;
        return getDeepReference(obj.ch[lastChildIndex], jumps - 1);
    }

    function replaceVariables(line, variables){
        return line.replace(/\{\{(.*?)\}\}/g, (match, expr) => {
            try{
                with(variables){
                    const result = eval(expr);
                    if(typeof result === 'object' && result !== null){
                        return JSON.stringify(result);
                    }else{
                        return String(result);
                    }
                }
            }catch(e){
                console.error('Błąd podczas oceny wyrażenia: ', expr, e);
                return line;
            }
        });
    }
    
    return (s, variables) => {
        const obj = stringToObj(s);
        return parseObjToHTML(obj, variables);
    }
})();