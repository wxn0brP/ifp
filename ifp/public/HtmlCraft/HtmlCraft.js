window.HtmlCraft = (function(){
    function stringToObj(pugString){
        let lines = pugString.split('\n');
        let previousIndentLevel = 0;
        let out = { ch: [] };
    
        lines.forEach(line => {
            if(!line) return;

            let countTab = countTabsInLine(line);
            let obj = getDeepReference(out, countTab);
            obj.ch.push({
                q: line.trim(),
                ch: []
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

            if(line.startsWith("| ")){
                html += line.slice(2);
                continue;
            }

            let { tag, attrs, content } = decomposeString(line);
            attrs = attrs ? " " + attrs.trim() : "";

            if(selfClosingTags.includes(tag)){
                html += `<${tag}${attrs} />`;
            }else{
                html += `<${tag}${attrs}> ${content}`;

                if(obj.ch && obj.ch.length > 0){
                    html += parseObjToHTML(obj.ch, variables);
                }

                html += `</${tag}>`;
            }
        }

        return html;
    }

    function decomposeString(s){
        let result = {
            tag: '',
            attrs: '',
            content: ''
        };

        s = s.replace(/#([\w-]+)/, (_, id) => {
            result.attrs += `id="${id}" `;
            return '';
        });

        let classes = processClass(s);
        s = classes.s;
        result.attrs += classes.c;

        s = s.replace(/(\(.+?\))/g, (_, attrs) => {
            const attrsWithoutParentheses = attrs.slice(1, -1);
            result.attrs += attrsWithoutParentheses.split(',').map(attr => attr.trim().replace(/'/g, '"')).join(' ') + ' ';
            return '';
        });

        s.replace(/([\w-]+)\s*(.*)/, (_, tag, rest) => {
            result.tag = tag;
            result.content = rest.trim();
        });

        result.attrs = result.attrs.trim().replace(/\s+/g, ' ');

        return result;
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

    function processClass(s){
        let endIndex = s.indexOf('(');
        if(endIndex == -1){
            endIndex = s.indexOf(' ');
            if(endIndex == -1){
                endIndex = s.length;
            }
        }
        const sc = s.substring(0, endIndex);
        if(!sc){
            return { s, c: "" };
        }

        const regex = /\.([\w-]+)/g;
        let match;
        let classNames = [];

        while((match = regex.exec(sc)) !== null) {
            classNames.push(match[1]);
        }

        let attrs = '';
        if(classNames.length > 0){
            const classList = classNames.filter(Boolean).join(' ');
            attrs = `class="${classList}" `;
            s = s.replace(regex, '');
        }

        return { s, c: attrs };
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