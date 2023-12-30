function meuiInit(app, def={}){
    const inputs = app.querySelectorAll("[m-m]");
    let data = {};

    inputs.forEach(input => {
        const defaultKey = input.getAttribute('m-m');
        const defaultValue = def[defaultKey];
        const tagName = input.tagName.toLowerCase();

        if(tagName === "select"){
            if(defaultValue){
                input.value = defaultValue;
            }else{
                const firstOption = input.querySelector('option');
                const value = firstOption.value;
                input.value = value ? value : "";
            }

            input.addEventListener('change', function(){
                data[defaultKey] = input.value;
            });
        }else if(tagName === "input"){
            input.value = defaultValue ? defaultValue : getDeflaut(input.type);

            input.addEventListener('input', function(){
                let value = null;
                switch(input.type){
                    case "text":
                    case "password":
                    case "number":
                        value = input.value;
                    break;
                    case "checkbox":
                        value = input.checked;
                    break;
                }
                if(value) data[defaultKey] = value;
            });
        }

        Object.defineProperty(data, defaultKey, {
            get: function(){
                if(tagName === "select"){
                    return input.value
                }else if(tagName === "input"){
                    switch(input.type){
                        case "text":
                        case "password":
                        case "number":
                            return input.value;
                        case "checkbox":
                            return input.checked;
                    }
                }
            },
            set: function(newValue){
                if(tagName === "select"){
                    input.value = newValue;
                }else if(tagName === "input"){
                    switch(input.type){
                        case "text":
                        case "password":
                        case "number":
                            input.value = newValue;
                        break;
                        case "checkbox":
                            input.checked = newValue;
                        break;
                    }
                }
            }
        });
    });
    def = undefined;

    function getDeflaut(type){
        switch(type){
            case "text":
            case "password":
            case "number":
                return "";
            case "checkbox":
                return false;
        }
    }
    data.get = () => {
        let result = {};
        let keys = Object.getOwnPropertyNames(data);
        keys.forEach(key => {
            if(typeof data[key] == "function") return;
            result[key] = data[key];
        });
        return result;
    }

    return data;
}