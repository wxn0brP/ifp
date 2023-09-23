module.exports = () => {
    var unix = Math.floor(new Date().getTime() / 1000).toString(16);
    var unixPod = Math.pow(10, unix.length);
    var random1 = (Math.floor(Math.random() * unixPod)).toString(16);
    var random2 = (Math.floor(Math.random() * unixPod)).toString(16);
    return unix + "-" + random1 + "-" + random2;
}