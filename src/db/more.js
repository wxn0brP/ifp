/**
 * Module for performing operations on objects.
 * @module db/objectUtils
 */

module.exports = {
    /**
     * Checks if an object has specified fields with matching values.
     * @function
     * @param {Object} obj - The object to check.
     * @param {Object} fields - An object containing field-value pairs to check for.
     * @returns {boolean} `true` if the object has all specified fields with matching values, `false` otherwise.
     */
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

    /**
     * Updates an object with new values.
     * @function
     * @param {Object} obj - The object to update.
     * @param {Object} newVal - An object containing new values to update in the target object.
     * @returns {Object} The updated object.
     */
    updateObject(obj, newVal){
        for(let key in newVal){
            if(newVal.hasOwnProperty(key)){
                obj[key] = newVal[key];
            }
        }
        return obj;
    },
}