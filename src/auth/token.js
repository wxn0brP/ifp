const Whirlpool = require('whirlpool-hash');
const crc = require('crc');

var mod = {
    getRandom(){
        var char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var random = "";
        for(let i=0; i<64; i++){
            random += char[Math.floor(Math.random() * char.length)];
        }
        return random;
    },

    getInUser(user){
        return crc.crc24(user.name + "%" + user._id);
    },

    getTime(timeMin){
        var unixTime = Math.floor(new Date().getTime() / 1000);
        return unixTime + timeMin * 60;
    },

    Whirlpool(hashSrc){
        return Whirlpool.encoders.toHex(new Whirlpool.Whirlpool().getHash(hashSrc));
    }
};

var token = {
    async rem(token){
        await global.db.token.removeOne({ token });
    },
    active: [],

    getRToken(usr){
        var hashSrc = mod.getInUser(usr) + "%%" + mod.getRandom() + ":" + mod.getTime(0);
        var hashBase = mod.Whirlpool(hashSrc);

        global.db.token.add({
            token: hashBase,
            data: {
                t: mod.getTime(43200),
                user: {
                    name: usr.name,
                    _id: usr._id,
                }
            }
        })

        return hashBase;
    },

    async veryR(token){
        var hashBase = await global.db.token.findOne({ token });
        if(!hashBase) return false;

        var time = Math.floor(new Date().getTime() / 1000);
        if(hashBase.o.data.t < time){
            await this.rem(token);
            return false;
        }
        return true;
    },


    async getTempToken(usr, hash){
        var hashBase = await global.db.token.findOne({ token: hash });
        if(!hashBase) return false;
        hashBase = hashBase.o.data;

        var time = Math.floor(new Date().getTime() / 1000);
        if(hashBase.t < time){
            await this.rem(hash);
            return false;
        }
        var tmpToken = mod.Whirlpool("user: "+usr._id);
        this.active.push({
            token: tmpToken,
            data: {
                t: mod.getTime(60),
                user: {
                    name: usr.name,
                    _id: usr._id,
                }
            }
        });
        return tmpToken;
    },

    veryTemp(token){
        var hashBase = this.active.find(obj => obj.token === token);
        if(!hashBase) return false;

        var time = Math.floor(new Date().getTime() / 1000);
        if(hashBase.t < time){
            this.active = this.active.filter(obj => obj.token !== token);
            return false;
        }
        return hashBase.data;
    },

    async start(){
        var all = await global.db.token.find({});
        var time = Math.floor(new Date().getTime() / 1000);
        all.forEach(async ele => {
            if(ele.o.data.t < time){
                await this.rem(ele.o.token);
                return false;
            }
        });
    },
};

token.start();
module.exports = token;