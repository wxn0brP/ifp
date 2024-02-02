module.exports = {
    hasFields(obj, fields){
        const keys = Object.keys(fields);
        for(let i = 0; i < keys.length; i++){
            const key = keys[i];
            if(!(key in obj) || obj[key] !== fields[key]){
                return false;
            }
        }
        return true;
    },

    updateObject(obj, newVal){
        for(let key in newVal){
            if(newVal.hasOwnProperty(key)){
                obj[key] = newVal[key];
            }
        }
        return obj;
    },
}