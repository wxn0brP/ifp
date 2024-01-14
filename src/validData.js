const SchemaC = require("./db/shema");

module.exports = {
    str(str, min=0, max=Infinity){
        return typeof str == "string" && str.length >= min && str.length <= max;
    },
    num(data){
        return typeof data == "number";
    },
  
    arrayContainsOnlyType(arr, type){
        if(!Array.isArray(arr)) return false;
        for(const value of arr){
            if(typeof value !== type) return false;
        }
        return true;
    },

    arrayString(arr, min=0, max=Infinity){
        if(!Array.isArray(arr)) return false;
        for(const value of arr){
            if(!this.str(value, min, max)) return false;
        }
        return true;
    },

    obj(data, schema){
        if(!schema) return typeof data == "object" && !Array.isArray(data);
        const validator = new SchemaC(schema);
        return validator.validate(data, false);
    }
}