function getOneInRegex(text, regex){
    var r = text.matchAll(regex);
    r = [...r].map(m => m[0]);
    r = [...new Set(r)];
    return r;
}

function updateObject(obj, newVal){
    for(let key in newVal){
        if(newVal.hasOwnProperty(key)){
            obj[key] = newVal[key];
        }
    }
    return obj;
}