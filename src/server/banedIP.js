var banedIP = require("../../data/ip.json");

module.exports = async (req, res, next) => {
    var ip = req.ip;
    ip = ip.replace(/^::ffff:/, '');
    if(banedIP.includes(ip)){
        return res.status(403).send('You are banned from accessing this site.');
    }
    next();
}

setTimeout(() => {
    banedIP = require("../../data/ip.json");
}, 10 * 60 * 1000); // 10min