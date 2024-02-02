const fs = require('fs');
const readline = require('readline');
const format = require("./format");
const more = require("./more");

function pathRepair(path){
    return path.replaceAll("//", "/").replaceAll(".db.db", ".db");
}

function createRL(file){
    const read_stream = fs.createReadStream(file, { highWaterMark: 10 * 1024 * 1024 }); //10MB
    const rl = readline.createInterface({
        input: read_stream,
        crlfDelay: Infinity
    });
    return rl;
}

async function findProcesLine(arg, line){
    var ob = await format.parse(line);
    let res = false;

    if(typeof arg === 'function'){
        if(arg(ob)) res = true;
    }else if(typeof arg === "object"){
        if(more.hasFields(ob, arg)) res = true;
    }

    return res ? { o: ob } : null;
}

async function updateWorker(file, search, updater, one=false){
    file = pathRepair(file);
    if(!fs.existsSync(file)){
        await fs.promises.writeFile(file, "");
        return false;
    }
    await fs.promises.copyFile(file, file+".tmp");
    await fs.promises.writeFile(file, "");

    const rl = createRL(file+".tmp");
  
    let updated = false;
    let lineCount = 0;
    for await(let line of rl){
        lineCount++;
        
        if(one && updated){
            fs.appendFileSync(file, line+"\n");
            continue;
        }

        let data = await format.parse(line);
        let ob = false;

        if(typeof search === "function"){
            ob = search(data) || false;
        }else if(typeof search === "object" && !Array.isArray(search)){
            ob = more.hasFields(data, search);
        }

        if(ob){
            let updateObj;
            if(typeof updater === "function"){
                updateObj = updater(data);
            }else if(typeof updater === "object" && !Array.isArray(updater)){
                updateObj = more.updateObject(data, updater);
            }
            line = await format.stringify(updateObj);
            updated = true;
        }
        
        fs.appendFileSync(file, line+"\n");
    }
    await fs.promises.writeFile(file+".tmp", "");
    return updated;
}

async function update(folder, name, arg, obj, one){
    let files = fs.readdirSync(folder + "/" + name).filter(file => !/\.tmp$/.test(file));
    files.reverse();
    for(const file of files){
        let updated = await updateWorker(folder + "/" + name + "/" + file, arg, obj, one);
        if(updated) break;
    }
    return true;
}

async function removeWorker(file, search, one=false){
    file = pathRepair(file);
    if(!fs.existsSync(file)){
        await fs.promises.writeFile(file, "");
        return false;
    }
    await fs.promises.copyFile(file, file+".tmp");
    await fs.promises.writeFile(file, "");

    const rl = createRL(file+".tmp");
  
    let removed = false;
    let lineCount = 0;
    for await(let line of rl){
        lineCount++;
        
        if(one && removed){
            fs.appendFileSync(file, line+"\n");
            continue;
        }

        let data = await format.parse(line);

        if(typeof search === "function"){
            if(search(data)){
                removed = true;
                continue;
            }
        }else{
            if(more.hasFields(data, search)){
                removed = true;
                continue;
            }
        }
        
        fs.appendFileSync(file, line+"\n");
    }
    await fs.promises.writeFile(file+".tmp", "");
    return removed;
}

async function remove(folder, name, arg, one){
    let files = fs.readdirSync(folder + "/" + name).filter(file => !/\.tmp$/.test(file));
    files.reverse();
    for(const file of files){
        let removed = await removeWorker(folder + "/" + name + "/" + file, arg, obj, one);
        if(removed) break;
    }
    return true;
}

module.exports = {
    async find(file, arg){
        file = pathRepair(file);
        return await new Promise(async (resolve) => {
            if(!fs.existsSync(file)){
                await fs.promises.writeFile(file, "");
                resolve(false);
                return;
            }
            const rl = createRL(file);
            var resF = [];
            for await(const line of rl){
                if(line == "" || !line) continue;

                var res = await findProcesLine(arg, line);
                if(res) resF.push(res); 
            };
            resolve(resF);
        })
    },

    async findOne(file, arg){
        file = pathRepair(file);
        return await new Promise(async (resolve) => {
            if(!fs.existsSync(file)){
                await fs.promises.writeFile(file, "");
                resolve([]);
                return;
            }
            const rl = createRL(file);
            for await(const line of rl){
                if(line == "" || !line) continue;

                var res = await findProcesLine(arg, line);
                if(res){
                    resolve(res);
                    rl.close();
                }
            };
            resolve([]);
        });
    },

    async update(folder, name, arg, obj){
        return await update(folder, name, arg, obj, false);
    },

    async updateOne(folder, name, arg, obj){
        return await update(folder, name, arg, obj, true);
    },

    async remove(folder, name, arg){
        return await remove(folder, name, arg, false);
    },

    async removeOne(folder, name, arg){
        return await remove(folder, name, arg, true);
    },
}