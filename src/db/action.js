const fs = require("fs");
const more = require("./more");
const readline = require("readline");
const format = require("./format");

class dbActionC{
    constructor(file, normal=true){
        this.file = file;

        if(normal){
            if(!fs.existsSync(file)){
                fs.writeFileSync(file, "");
            }
            try{
                fs.writeFileSync(file+".tmp", "");
            }catch(e){
                console.log(e);
            }
        }
    }

    async add(arg){
        arg._id = more.getId();
        var json = await format.stringify(arg);
        fs.appendFileSync(this.file, json+"\n");
        return arg;
    }

    async find(arg){
        var file = this.file;
        return await new Promise(async (resolve) => {
            const read_stream = fs.createReadStream(file, { highWaterMark: 1024 * 1024 });
            const rl = readline.createInterface({
                input: read_stream,
                crlfDelay: Infinity
            });
            var resF = [];
            var lineNumber = 0;
            for await(const line of rl){
                lineNumber++;
                if(line == "" || !line) continue;

                var res = await this.procesLine(lineNumber, arg, line);
                if(res) resF.push(res); 
            };
            resolve(resF);
        })
    }

    async findOne(arg){
        var file = this.file;
        return await new Promise(async (resolve) => {
            const read_stream = fs.createReadStream(file, { highWaterMark: 1024 * 1024 });
            const rl = readline.createInterface({
                input: read_stream,
                crlfDelay: Infinity
            });
            var lineNumber = 0;
            for await(const line of rl){
                lineNumber++;
                if(line == "" || !line) continue;

                var res = await this.procesLine(lineNumber, arg, line);
                if(res){
                    resolve(res);
                    rl.close();
                }
            };
            resolve(false);
        });
    }

    async procesLine(lineNumber, arg, line){
        var ob = await format.parse(line);
        if(typeof arg === 'function'){
            if(arg(ob)){
                return {l: lineNumber, o: ob};
            }
        }else{
            if(more.hasFields(ob, arg)){
                return {l: lineNumber, o: ob};
            }
        }
        return null;
    }

    async _update(res, arg){
        var index = res.l;
        var new_obj = more.updateObject(res.o, arg);
        var json = await format.stringify(new_obj);
        await more.update(this.file, index, json);
    }

    async updateOne(obj, arg){
        var res = await this.findOne(obj);
        if(!res) return false;
        await this._update(res, arg);
        return true;
    }
    
    async update(obj, arg){
        var res = await this.find(obj);
        if(res.length == 0) return false;
        for(let i=0; i<res.length; i++){
            await this._update(res[i], arg);
        };
        return true;
    }

    async _remove(res){
        await more.remove(this.file, res.l);
    }

    async removeOne(obj){
        var res = await this.findOne(obj);
        if(!res) return false;
        this._remove(res);
        return true;
    }

    async remove(obj){
        var res = await this.find(obj);
        if(res.length == 0) return false;
        for(let i=0; i<res.length; i++){
            await this._remove(await this.findOne(obj));
        }
        return true;
    }
}

module.exports = dbActionC;