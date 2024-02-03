/**
 * Token management module for generating, verifying, and handling temporary and regular tokens.
 * @module token
 */

const Whirlpool = require('whirlpool-hash');
const crc = require('crc');

var mod = {
    /**
     * Generate a random alphanumeric string of a specified length.
     *
     * @function
     * @returns {string} A random alphanumeric string.
     */
    getRandom(){
        var char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var random = "";
        for(let i=0; i<64; i++){
            random += char[Math.floor(Math.random() * char.length)];
        }
        return random;
    },

    /**
     * Calculate a CRC-24 hash based on a user object's name and ID.
     *
     * @function
     * @param {Object} user - The user object containing 'name' and '_id' properties.
     * @returns {number} The CRC-24 hash value.
     */
    getInUser(user){
        return crc.crc24(user.name + "%" + user._id);
    },

    /**
     * Get the Unix timestamp for the current time plus a specified number of minutes.
     *
     * @function
     * @param {number} timeMin - The number of minutes to add to the current time.
     * @returns {number} The Unix timestamp for the future time.
     */
    getTime(timeMin){
        var unixTime = Math.floor(new Date().getTime() / 1000);
        return unixTime + timeMin * 60;
    },

    /**
     * Calculate the Whirlpool hash for a given source string.
     *
     * @function
     * @param {string} hashSrc - The source string for hash calculation.
     * @returns {string} The Whirlpool hash encoded as a hexadecimal string.
     */
    Whirlpool(hashSrc){
        return Whirlpool.encoders.toHex(new Whirlpool.Whirlpool().getHash(hashSrc));
    }
};

var token = {
    /**
     * Remove a token from the database.
     *
     * @async
     * @function
     * @param {string} token - The token to remove.
     * @returns {Promise} A Promise that resolves when the token is successfully removed.
     */
    async rem(token){
        await global.db.data.removeOne("token", { token });
    },
    active: [],

    /**
     * Generate a regular token for a user with an optional expiration time.
     *
     * @function
     * @param {Object} usr - The user object containing 'name' and '_id' properties.
     * @param {number} [time=43200] - The expiration time for the token in minutes (default: 43200 minutes or 30 days).
     * @returns {string} The generated token.
     */
    getRToken(usr, time=43200){
        var hashSrc = mod.getInUser(usr) + "%%" + mod.getRandom() + ":" + mod.getTime(0);
        var hashBase = mod.Whirlpool(hashSrc);

        global.db.data.add("token", {
            token: hashBase,
            data: {
                t: mod.getTime(time),
                user: {
                    name: usr.name,
                    _id: usr._id,
                }
            }
        })

        return hashBase;
    },

    /**
     * Verify the validity of a regular token.
     *
     * @async
     * @function
     * @param {string} token - The token to verify.
     * @returns {Promise<boolean>} A Promise that resolves to true if the token is valid, or false if not.
     */
    async veryR(token){
        var hashBase = await global.db.data.findOne("token", { token });
        if(!hashBase) return false;

        var time = Math.floor(new Date().getTime() / 1000);
        if(hashBase.o.data.t < time){
            await this.rem(token);
            return false;
        }
        return true;
    },

    /**
     * Generate a temporary token for a user based on a provided hash.
     *
     * @async
     * @function
     * @param {Object} usr - The user object containing 'name' and '_id' properties.
     * @param {string} hash - The hash used to generate the temporary token.
     * @returns {Promise<string|false>} The generated temporary token or false if invalid.
     */
    async getTempToken(usr, hash){
        var hashBase = await global.db.data.findOne("token", { token: hash });
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

    /**
     * Verify the validity of a temporary token.
     *
     * @function
     * @param {string} token - The temporary token to verify.
     * @returns {Object|false} The user data associated with the token if valid, or false if not.
     */
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

    /**
     * Initialize the token management system by cleaning up expired tokens.
     *
     * @async
     * @function
     */
    async start(){
        const all = await global.db.data.find("token", {});
        const time = Math.floor(new Date().getTime() / 1000);
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