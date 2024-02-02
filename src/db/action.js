const fs = require("fs");
const gen = require("./gen");
const format = require("./format");
const fileM = require("./file");
const CacheManager = require("./cacheManager");

const maxFileSize = 1024//2 * 1024 * 1024; //2 MB

class dbActionC{
    constructor(folder, cacheThreshold, ttl){
        this.folder = folder;
        this.cacheManager = new CacheManager(cacheThreshold, ttl);
        
        if(!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    }

    getDBs(){
        return fs.readdirSync(this.folder);
    }

    checkFile(dir){
        let path = this.folder + "/" + dir;
        if(!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    }

    async add(name, arg){
        this.checkFile(name);
        let file = this.folder + "/" + name + "/" + getLastFile(this.folder + "/" + name);

        arg._id = gen();
        let data = await format.stringify(arg);
        fs.appendFileSync(file, data+"\n");
        return arg;
    }

    async find(name, arg){
        let cacheKey;
        if(typeof arg === 'function'){
            cacheKey = `find-${name}-fn-${arg.toString()}`;
        }else{
            cacheKey = `find-${name}-${JSON.stringify(arg)}`;
        }
        let cachedData = this.cacheManager.getFromCache(cacheKey);

        if(cachedData){
            return cachedData;
        }

        this.checkFile(name);
        let files = fs.readdirSync(this.folder + "/" + name).filter(file => !/\.tmp$/.test(file));
        files.reverse();
        let datas = [];

        for(let f of files){
            let data = await fileM.find(this.folder + "/" + name + "/" + f, arg);
            datas = datas.concat(data);
        }
        this.cacheManager.addToCacheIfNeeded(cacheKey, datas);
        return datas;
    }

    async findOne(name, arg){
        let cacheKey;
        if(typeof arg === 'function'){
            cacheKey = `find-${name}-fn-${arg.toString()}`;
        }else{
            cacheKey = `find-${name}-${JSON.stringify(arg)}`;
        }

        let cachedData = this.cacheManager.getFromCache(cacheKey);

        if(cachedData){
            return cachedData;
        }
        this.checkFile(name);
        let files = fs.readdirSync(this.folder + "/" + name).filter(file => !/\.tmp$/.test(file));
        files.reverse();

        for(let f of files){
            let data = await fileM.findOne(this.folder + "/" + name + "/" + f, arg);
            if(data){
                this.cacheManager.addToCacheIfNeeded(cacheKey, data);
                return data;
            }
        }
        return null;
    }

    async update(name, arg, obj){
        this.checkFile(name);
        return await fileM.update(this.folder, name, arg, obj);
    }

    async updateOne(name, arg, obj){
        this.checkFile(name);
        return await fileM.updateOne(this.folder, name, arg, obj);
    }

    async remove(name, arg){
        this.checkFile(name);
        return await fileM.remove(this.folder, name, arg);
    }

    async removeOne(name, arg){
        this.checkFile(name);
        return await fileM.removeOne(this.folder, name, arg);
    }
}

function getLastFile(path){
    if(!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    let files = fs.readdirSync(path).filter(file => !/\.tmp$/.test(file));

    if(files.length == 0){
        fs.writeFileSync(path+"/1.db", "");
        return "1.db";
    }
    files = files.sort();
    const last = files[files.length-1];
    const info = path + "/" + last;
    if(fs.statSync(info).size > maxFileSize){
        const temName = last.replace(".db", "");
        const int = parseInt(temName) + 1;
        fs.writeFileSync(path + "/" + int + ".db", "");
        return int+".db";
    }else{
        return last;
    }
}

module.exports = dbActionC;