const fs = require("fs");
const actionC = require("./action");
const more = require("./more");
const format = require("./format");

class dbActionC{
    constructor(path){
        this.path = path;
    }

    delay = ms => new Promise(res => setTimeout(res, ms));

    async add(file, arg){
        arg._id = more.getId();
        var json = await format.stringify(arg);
        fs.appendFileSync(this.path + file, json+"\n");
        return arg;
    }

    async findOne(file, arg){
        var path = this.path + file + "/";
        var files = fs.readdirSync(path).filter(file => !/\.tmp$/.test(file));
        files.reverse();
        var action = new actionC("", false);
        for(var i=0; i<files.length; i++){
            action.file = path + files[i];
            var odp = await action.findOne(arg);
            if(!odp) return null;
            odp.f = files[i];
            return odp;
        }
        return null;
    }

    async find(file, arg){
        var path = this.path + file + "/";
        var files = fs.readdirSync(path).filter(file => !/\.tmp$/.test(file));
        files.reverse();
        var res = [];
        var action = new actionC("", false);
        for(var i=0; i<files.length; i++){
            action.file = path + files[i];
            var odp = await action.find(arg);
            for(let j=0; j<odp.length; j++){
                odp[j].f = files[i];
            }
            res = res.concat(odp);
        }
        return res;
    }


    async _update(path, res, arg){
        var index = res.l;
        var new_obj = more.updateObject(res.o, arg);
        var json = await format.stringify(new_obj);
        await more.update(path, index, json);
    }

    // FIXME coś się odjebało z usuwaniem starej wiad
    async updateOne(name, obj, arg){
        var res = await this.findOne(name, obj);
        if(!res) return false;
        var path = this.path + name + "/" + res.f;
        await this._update(path, res, arg);
        return true;
    }

    async update(name, obj, arg){
        var res = await this.find(name, obj);
        if(res.length == 0) return false;
        var path = this.path + name + "/";
        for(let i=0; i<res.length; i++){
            await this._update(path + res[i].f, res[i], arg);
        }
        return true;
    }

    async _remove(path, res){
        await more.remove(path, res.l);
    }

    async removeOne(name, obj){
        var res = await this.findOne(name, obj);
        if(!res) return false;
        var path = this.path + name + "/" + res.f;
        this._remove(path, res);
        return true;
    }

    async remove(name, obj){
        var res = await this.find(name, obj);
        if(res.length == 0) return false;
        var path = this.path + name + "/";
        for(let i=0; i<res.length; i++){
            var resT = await this.findOne(name, obj);
            await this._remove(path + resT.f, resT);
        }
        return true;
    }
}

module.exports = dbActionC;