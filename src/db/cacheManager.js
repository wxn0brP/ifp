class CacheManager {
    constructor(cacheThreshold, ttl){
        this.queryCounterCache = {};
        this.dataCache = {};
        this.cacheThreshold = cacheThreshold;
        this.ttl = ttl;
    }

    _incrementQueryCounter(key){
        if(!this.queryCounterCache[key]){
            this.queryCounterCache[key] = 1;
        }else{
            this.queryCounterCache[key]++;
        }
        return this.queryCounterCache[key];
    }

    _setCache(key, data){
        this.dataCache[key] = { data, expires: Date.now() + this.ttl };
    }

    getFromCache(key){
        const item = this.dataCache[key];
        if(item && Date.now() < item.expires){
            return item.data;
        }
        delete this.dataCache[key];
        return null;
    }

    addToCacheIfNeeded(key, data){
        const queryCount = this._incrementQueryCounter(key);
        if(queryCount > this.cacheThreshold){
            this._setCache(key, data);
        }
    }

    invalidateCache(keyPattern){
        Object.keys(this.dataCache).forEach(key => {
            if(key.startsWith(keyPattern)){
                delete this.dataCache[key];
            }
        });
    }
}

module.exports = CacheManager;
