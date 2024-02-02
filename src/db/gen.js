const usedIdsMap = new Map();

function genId(parts, fill=1){
    parts = changeInputToPartsArray(parts, fill);
    const time = getTime();
    const id = getUniqueRandom(time, parts);
    return id;
}

function getUniqueRandom(time, partsA, s=0){
    let parts = partsA.map(l => getRandom(l));
    let id = [time, ...parts].join("-");
    if(usedIdsMap.has(id)){
        s++;
        if(s < 25) return getUniqueRandom(time, partsA, s);
        partsA = addOneToPods(partsA);
        time = getTime();
        return getUniqueRandom(time, partsA);
    }
    usedIdsMap.set(id, Date.now() + 2000);

    usedIdsMap.forEach((value, key) => {
        if(value < Date.now()) usedIdsMap.delete(key);
    });

    return id;
}

function getRandom(unix){
    return (Math.floor(Math.random() * Math.pow(36, unix))).toString(36);
}

function getTime(){
    return Math.floor(new Date().getTime() / 1000).toString(36);
}

function addOneToPods(array){
    const sum = array.reduce((acc, current) => acc + current, 0);
    const num = sum + 1;
    const len = array.length;

    const result = [];
    const quotient = Math.floor(num / len);
    const remainder = num % len;
  
    for(let i=0; i<len; i++){
        if(i < remainder) result.push(quotient + 1);
        else result.push(quotient);
    }
  
    return result;
}

function changeInputToPartsArray(parts, fill=1){
    if(Array.isArray(parts)) return parts;
    if(typeof parts == "number") return Array(parts).fill(fill);
    return [1, 1];
}

module.exports = genId;