function encryptAES(message, key){
    return CryptoJS.AES.encrypt(message, key).toString();
}
  
function decryptAES(message, key){
    return CryptoJS.AES.decrypt(message, key).toString(CryptoJS.enc.Utf8);
}




function defineProp(obj, name, call){
    Object.defineProperty(obj, name, {
        value: call,
        writable: false,
        configurable: false,
    });
}

defineProp(window, "encryptV", {});

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
    return decryptAES(msg, key);
});
defineProp(encryptV.v1, "enc", (msg, key) => {
    return encryptAES(msg, key);
});

