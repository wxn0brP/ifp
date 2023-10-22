var json5 = require("json5");

module.exports = {
    parse: (data) => {
        if(!data.startsWith("{")) data = "{"+data+"}";
        return json5.parse(data)
    },
    stringify: (data) => {
        data = json5.stringify(data);
        if(data.startsWith("{")){
            data = data.slice(1, -1);
        }
        return data;
    },
}