var json5 = require("json5");

module.exports = {
    /**
     * Parse JSON5 data.
     * @function
     * @param {string} data - The JSON5 data to parse.
     * @returns {Object} The parsed JavaScript object.
     */
    parse: (data) => {
        if(!data.startsWith("{")) data = "{"+data+"}";
        return json5.parse(data);
    },
    /**
     * Stringify data into JSON5 format.
     * @function
     * @param {Object} data - The JavaScript object to stringify.
     * @returns {string} The JSON5 formatted string.
     */
    stringify: (data) => {
        data = json5.stringify(data);
        if(data.startsWith("{")){
            data = data.slice(1, -1);
        }
        return data;
    },
};
