const SchemaC = require("./db/shema");

module.exports = {
    /**
     * Check if a value is a string within a specified length range.
     *
     * @function
     * @param {string} str - The string to validate.
     * @param {number} [min=0] - Minimum length of the string.
     * @param {number} [max=Infinity] - Maximum length of the string.
     * @returns {boolean} True if the string is within the specified length range, false otherwise.
     */
    str(str, min=0, max=Infinity){
        return typeof str == "string" && str.length >= min && str.length <= max;
    },

    /**
     * Check if a value is a number.
     *
     * @function
     * @param {number} data - The number to validate.
     * @returns {boolean} True if the value is a number, false otherwise.
     */
    num(data){
        return typeof data == "number";
    },
  
    /**
     * Check if an array contains only values of a specified type.
     *
     * @function
     * @param {Array} arr - The array to validate.
     * @param {string} type - The expected type of the array values.
     * @returns {boolean} True if the array contains only values of the specified type, false otherwise.
     */
    arrayContainsOnlyType(arr, type){
        if(!Array.isArray(arr)) return false;
        for(const value of arr){
            if(typeof value !== type) return false;
        }
        return true;
    },

    /**
     * Check if an array contains only strings within a specified length range.
     *
     * @function
     * @param {Array} arr - The array of strings to validate.
     * @param {number} [min=0] - Minimum length of each string in the array.
     * @param {number} [max=Infinity] - Maximum length of each string in the array.
     * @returns {boolean} True if the array contains only valid strings, false otherwise.
     */
    arrayString(arr, min=0, max=Infinity){
        if(!Array.isArray(arr)) return false;
        for(const value of arr){
            if(!this.str(value, min, max)) return false;
        }
        return true;
    },

    /**
     * Validate an object against a provided schema or check if it's a plain object.
     *
     * @function
     * @param {Object} data - The object to validate.
     * @param {Object} [schema] - A schema to validate the object against (optional).
     * @returns {boolean} True if the object is valid against the schema (if provided) or a plain object, false otherwise.
     */
    obj(data, schema){
        if(!schema) return typeof data == "object" && !Array.isArray(data);
        const validator = new SchemaC(schema);
        return validator.validate(data, false);
    }
}