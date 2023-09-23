const dbActionC = require("./action-adv");
const executorC = require("./executor");
const fs = require("fs");
class dbC{
    constructor(path){
        if(!path.lastIndexOf("/") != -1) path += "/";
        this.path = path;
        this.dbAction = new dbActionC(path);
        this.executor = new executorC();

        if(!fs.existsSync(path)) fs.mkdirSync(path);
    }

    checkFile(name){
        var path = this.path + name;
        if(!fs.existsSync(path)) fs.mkdirSync(path);
    }

    //add
    async add(name, arg){
        this.checkFile(name);
        var file = name+"/"+utli.getLastFile(this.path + name);
        return await this.executor.addOp(this.dbAction.add.bind(this.dbAction), file, arg);
    }

    //find
    async find(name, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), name, arg);
    }

    async findOne(name, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), name, arg);
    }

    async get(name, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), name, arg);
    }

    async getOne(name, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), name, arg);
    }

    //up date
    async updateOne(name, obj, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.updateOne.bind(this.dbAction), name, obj, arg);
    }

    async update(name, obj, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.update.bind(this.dbAction), name, obj, arg);
    }

    //del
    async removeOne(name, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), name, arg);
    }

    async remove(name, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), name, arg);
    }

    async deleteOne(name, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), name, arg);
    }

    async delete(name, arg){
        this.checkFile(name);
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), name, arg);
    }
}

var utli = {
    maxFileSize: 2 * 1024 * 1024, //2 kB

    getLastFile: function(path){
        var files = fs.readdirSync(path).filter(file => !/\.tmp$/.test(file));
        if(files.length == 0){
            fs.writeFileSync(path+"/1.db", "");
            return "1.db";
        }
        files = files.sort();
        var last = files[files.length-1];
        var info = path + "/" + last;
        if(fs.statSync(info).size > this.maxFileSize){
            var temName = last.replace(".db", "");
            var int = parseInt(temName) + 1;
            fs.writeFileSync(path + "/" + int + ".db", "");
            return int+".db";
        }

        return last;
    }
}


module.exports = dbC;