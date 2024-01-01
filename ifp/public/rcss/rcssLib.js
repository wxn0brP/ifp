(function(){
    // Create or get the existing rcssIf element
    var rcssIf = document.querySelector("#rcss-if");
    if(rcssIf == null){
        rcssIf = document.createElement("div");
        rcssIf.id = "rcss-if";
        rcssIf.style.display = "none";
        document.body.appendChild(rcssIf);
    }

    // Function to convert RCCSS code to CSS
    function convertRcssToCss(input, mixinsGlobal=[]){
        // Helper function to remove the last word from a string
        function removeLastWord(inputString){
            const words = inputString.split(' ');
            if(words.length > 1){
                const lastWord = words.pop();
                if(lastWord.endsWith(':'))
                    return inputString;
                else
                    return words.join(' ');
            }else
                return '';
        }

        // Helper function to set an object property
        function setObj(obj, path, key){
            if(obj[path])
                obj[path].push(key);
            else
                obj[path] = [key];
        }

        function parseMixins(input){
            const regex = /#mixin\s+(\w+)\s*{([^}]*)}/g;
            const mixins = [];
        
            let match;
            while((match = regex.exec(input)) !== null){
                const name = match[1];
                const data = match[2].split('\n').map(item => item.trim()).filter(Boolean);
                mixins.push({ name, data });
                lo(data)
            }
        
            return mixins;
        }
        
        function removeMixins(input){
            const regex = /#mixin\s+\w+\s*{[^}]*}/g;
            return input.replace(regex, '');
        }
        
        function processMixins(input, mixins){
            const regex = /\/\*\s*@incm\s+([^;]+)\s*;\s*\*\//;
            let newLines = "";
            let lines = input.split("\n")
            for(let line of lines){
                line = line.trim();
                if(line == "") continue;
                const match = line.match(regex);
        
                if(match){
                    const name = match[1];
                    let mixin = mixins.find(i => i.name == name);
                    newLines += mixin.data.join("\n") + "\n";
                }else{
                    newLines += line + "\n";
                }
            };
        
            return newLines;
        }

        let mixins = parseMixins(input);
        mixins = mixins.concat(mixinsGlobal);
        input = removeMixins(input);
        input = processMixins(input, mixins);

        let output = "";
        const obj = {};
        let path = "";
        let rcssBlock = false;

        let lines = input.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if(line == "") return;

            if(line.startsWith('/* - */')){
                rcssBlock = true;
                return;
            }else if(line.startsWith('/* -- */')){
                rcssBlock = false;
                return;
            }
            if(!rcssBlock){
                output += line;
                return;
            }

            if(line.endsWith('{'))
                path += " " + line.substring(0, line.length - 1).trim();
            else if(line.startsWith("}")) 
                path = removeLastWord(path);
            else{
                if(!line.endsWith(";")) line += " ";
                setObj(obj, path, line)
            }
        });

        for(var key in obj){
            let tmp = key.replaceAll(" :", ":").trim() + "{";
            tmp += obj[key].join("");
            tmp += "}";
            output += tmp;
        }
        return output.trim();
    }

    // Main convert function
    const convert = (txt, mixinsGlobal=[]) => {
        if(txt == "" || txt == null || txt == undefined) return;
        const css = convertRcssToCss(txt, mixinsGlobal);
        const style = document.createElement("style");
        style.innerHTML = css;
        rcssIf.appendChild(style);
    }
    window.rcssC = convert;
})();