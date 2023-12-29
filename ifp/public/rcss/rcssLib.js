(function () {
    // Create or get the existing rcssIf element
    var rcssIf = document.querySelector("#rcss-if");
    if(rcssIf == null){
        rcssIf = document.createElement("div");
        rcssIf.id = "rcss-if";
        rcssIf.style.display = "none";
        document.body.appendChild(rcssIf);
    }

    // Function to convert RCCSS code to CSS
    function convertRcssToCss(input){
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

        const obj = {};
        const blocks = [];
        let path = "";
        let copyBlock = false;
        let copyContent = "";

        let lines = input.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if(line == "") return;

            if(line.startsWith('/* - */')){
                copyBlock = true;
                copyContent = "";
                return;
            }else if(line.startsWith('/* -- */')){
                copyBlock = false;
                if(copyContent.trim() !== "") 
                    blocks.push(renc(copyContent));
                return;
            }
            if(copyBlock){
                copyContent += line + "\n";
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

        let output = "";
        for(var key in obj){
            let tmp = key.replaceAll(" :", ":").trim() + "{";
            tmp += obj[key].join("");
            tmp += "}";
            output += tmp;
        }
        output += blocks.join("");
        return output.trim();
    }

    // Function to remove white characters
    function renc(txt){
        return txt.replaceAll("\n", "").replace(/\s+/g, ' ').trim();
    }

    // Function to interpret RCCIF code
    function interpreteRccIf(txt, interval = 10){
        // Helper function to splice RCCIF code
        function spliceRccIf(rcssCode){
            const regex = /\/\*\s*\$if\s*([^$]+)\s*\*\/([\s\S]*?)\/\*\s*\$else\s*\*\/([\s\S]*?)\/\*\s*\$end\s*\*\//g;
            const ifBlocks = [];
            let match;
            while((match = regex.exec(rcssCode)) !== null){
                const condition = match[1].trim();
                const ifBody = match[2].trim();
                const elseBody = match[3].trim();
                ifBlocks.push({
                    if: condition,
                    to: renc(ifBody),
                    else: renc(elseBody)
                });
            }
            return ifBlocks;
        }

        let arrayReg = spliceRccIf(txt);
        if(arrayReg.length == 0) return;
        arrayReg = arrayReg.map(reg => {
            const styleC = document.createElement("style");
            rcssIf.appendChild(styleC);
            let ifs = reg.if.split(";");
            return {
                if: ifs[1],
                html: styleC,
                to: reg.to,
                else: reg.else,
                element: document.querySelector(ifs[0])
            }
        });

        function fn(){
            arrayReg.forEach(reg => {
                try{
                    const e = reg.element;
                    const s = e.style;
                    const conditionResult = eval(reg.if);
                    reg.html.innerHTML = conditionResult ? reg.to : reg.else;
                }catch(error){
                    console.error("Error evaluating condition:", error);
                }
            });
        }
        fn();
        setInterval(fn, interval);
    }

    // Function to remove RCCIF code
    function removeRccIf(rcssCode) {
        const regex = /\/\*\s*\$if\s*[^$]*\s*\*\/[\s\S]*?\/\*\s*\$else\s*\*\/[\s\S]*?\/\*\s*\$end\s*\*\//gs;
        return rcssCode.replace(regex, '');
    }

    // Main convert function
    const convert = (txt, interval = 10) => {
        if(txt == "" || txt == null || txt == undefined) return;
        interpreteRccIf(txt, interval);
        txt = removeRccIf(txt);
        let css = convertRcssToCss(txt);
        let style = document.createElement("style");
        style.innerHTML = css;
        rcssIf.appendChild(style);
    }

    // Expose convertRcssToCss function as a property of convert
    convert.rcss = convertRcssToCss;

    // Expose convert function globally
    window.rcss = convert;
})();
