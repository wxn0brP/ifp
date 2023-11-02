const SchemaC = require("./db/shema");

module.exports = {
    isNumber: (value) => typeof value === 'number' && !isNaN(value),
    isString: (value) => typeof value === 'string',
    isObject: (value) => typeof value === 'object' && !Array.isArray(value),
    isArray: (value) => Array.isArray(value),
    arrayLength: (arr, length) => Array.isArray(arr) && arr.length === length,
    isBoolean: (value) => typeof value === 'boolean',
    isFunction: (value) => typeof value === 'function',
    isDate: (value) => value instanceof Date,
    isNull: (value) => value === null,
    isUndefined: (value) => value === undefined,
    isInteger: (value) => Number.isInteger(value),
    isFloat: (value) => Number(value) === value && value % 1 !== 0,
  
    arrayContainsOnlyType(arr, type){
        if(!Array.isArray(arr)) return false;
        for(const value of arr){
            if(typeof value !== type) return false;
        }
        return true;
    },

    validateObj(data, schema){
        const validator = new SchemaC(schema);
        return validator.validate(data, false);
    }
}