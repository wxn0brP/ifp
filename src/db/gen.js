module.exports = (parts=2) => {
    var unix = Math.floor(new Date().getTime() / 1000).toString(16);
    var unixPod = Math.pow(10, unix.length);
    let str = unix;
    for(let i=0; i<parts; i++) str += "-" + (Math.floor(Math.random() * unixPod)).toString(16);
    return str;
}