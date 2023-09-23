var zlib = require("zlib");

function parse(jsonString, cp=true){
    if(!cp) jsonString = removeAddons(jsonString);
    const objectRegex = /^(\{|\[)[\s\S]*?(\}|\])$/;

    if(!objectRegex.test(jsonString)){
        jsonString = `{${jsonString}}`;
    }

    jsonString = jsonString.replace(/(?<!\\)".*?(?<!\\)"|(\b\w+\b)(?=\s*:)/g, (match, key) => key ? `"${key}"` : match);

    return JSON.parse(jsonString);
}

function removeAddons(jsonString){
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
    jsonString = jsonString.replace(/,(\s*[\]}])/g, '$1');
    jsonString = jsonString.replace(/`[^`]*`/g, match => match.replace(/\\`/g, '`').replace(/\n/g, ' ').replace(/`/g, '"'));
    jsonString = jsonString.replace(/\'[^\']*\'/g, match => match.replace(/'/g, '"'));
    jsonString = jsonString.replace(/\.(\d+)/g, '0.$1');

    return jsonString.trim();
}

function str(obj, prettyPrint=false){
    var jsonString = JSON.stringify(obj, null, prettyPrint ? 2:0);
    jsonString = jsonString.replace(/"([^"]+)":/g, (_, key) => `${key}:`);
    return jsonString.replace(/^\{([\s\S]*)\}$/g, '$1');
}

function compress(jsonString, max=2048){
    if(jsonString.length <= max) return jsonString;
    var data = zlib.deflateSync(Buffer.from(jsonString, 'utf-8')).toString('base64');
    return `cp:true,data:"${data}"`;
}

function decompress(cd){
    if(!cd.cp || !cd.data) return cd;
    return zlib.inflateSync(Buffer.from(cd.data, "base64")).toString("utf-8");
}

module.exports = {
    parse, str,
    removeAddons,
    compress, decompress
}