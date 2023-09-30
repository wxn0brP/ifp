function defineProp(obj, name, call){
    Object.defineProperty(obj, name, {
        value: call,
        writable: false,
        configurable: false,
    });
}

defineProp(window, "encryptV", {});
defineProp(encryptV, "def", "plain"); //actual deflaut is plain text

defineProp(encryptV, "dec", (...p) => { //deflaut decrypt
    let e = window.encryptV;
    return e[e.def].dec(...p);
});
defineProp(encryptV, "enc", (...p) => { //deflaut encrypt
    let e = window.encryptV;
    return e[e.def].enc(...p);
});

defineProp(encryptV, "parse", (message) => {
    try{
        var obj = JSON.parse(message);
        var v = obj.v;
        if(encryptV)
        var msg = obj.msg;
        return { v, msg };
    }catch{
        return { v: 0, msg: message };
    }
});

defineProp(encryptV, "v1", {});
defineProp(encryptV.v1, "dec", (msg, key) => {
    return CryptoJS.AES.decrypt(msg, key).toString(CryptoJS.enc.Utf8);
});
defineProp(encryptV.v1, "enc", (msg, key) => {
    return CryptoJS.AES.encrypt(msg, key).toString();
});

defineProp(encryptV, "plain", {});
defineProp(encryptV.plain, "dec", msg => msg);
defineProp(encryptV.plain, "enc", msg => msg);
