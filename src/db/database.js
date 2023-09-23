const dbActionC = require("./action");
const executorC = require("./executor");
const shemaC = require("./shema");

class DataBase{
    constructor(file, shema={}){
        this.file = file;
        this.dbAction = new dbActionC(file);
        this.executor = new executorC(file);
        this.shema = new shemaC(shema);
    }

    //add
    async add(arg, valid=true){
        if(valid && !this.shema.valid(arg)){
            return false;
        }
        return await this.executor.addOp(this.dbAction.add.bind(this.dbAction), arg);
    }

    //find
    async find(arg){
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), arg);
    }

    async findOne(arg){
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), arg);
    }

    async get(arg){
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), arg);
    }

    async getOne(arg){
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), arg);
    }

    //up date
    async update(obj, arg){
        return await this.executor.addOp(this.dbAction.update.bind(this.dbAction), obj, arg);
    }

    async updateOne(obj, arg){
        return await this.executor.addOp(this.dbAction.updateOne.bind(this.dbAction), obj, arg);
    }

    //del
    async remove(obj){
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), obj);
    }

    async removeOne(obj){
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), obj);
    }

    async delete(obj){
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), obj);
    }

    async deleteOne(obj){
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), obj);
    }
}

module.exports = DataBase;