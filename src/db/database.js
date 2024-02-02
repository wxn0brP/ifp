const dbActionC = require("./action");
const executorC = require("./executor");

class DataBase{
    constructor(folder, cacheThreshold=3, ttl=300_000){
        this.dbAction = new dbActionC(folder, cacheThreshold, ttl);
        this.executor = new executorC();
    }

    getDBs(){
        return this.dbAction.getDBs();
    }

    checkFile(dir){
        this.dbAction.checkFile(dir);
    }

    //add
    async add(name, arg){
        return await this.executor.addOp(this.dbAction.add.bind(this.dbAction), name, arg);
    }

    //find
    async find(name, arg){
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), name, arg);
    }

    async findOne(name, arg){
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), name, arg);
    }

    async get(name, arg){
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), name, arg);
    }

    async getOne(name, arg){
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), name, arg);
    }

    //up date
    async update(name, obj, arg){
        return await this.executor.addOp(this.dbAction.update.bind(this.dbAction), name, obj, arg);
    }

    async updateOne(name, obj, arg){
        return await this.executor.addOp(this.dbAction.updateOne.bind(this.dbAction), name, obj, arg);
    }

    //del
    async remove(name, obj){
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), name, obj);
    }

    async removeOne(name, obj){
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), name, obj);
    }

    async delete(name, obj){
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), name, obj);
    }

    async deleteOne(name, obj){
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), name, obj);
    }
}

module.exports = DataBase;