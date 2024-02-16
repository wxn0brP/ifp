/**
 * Db file operations
 * @module db/file
 */

const fs = require('fs');
const readline = require('readline');
const format = require("./format");
const more = require("./more");

/**
 * Repairs a file path by replacing double slashes
 * @private
 * @param {string} path - The file path to repair.
 * @returns {string} The repaired file path.
 */
function pathRepair(path){
    return path.replaceAll("//", "/");
}

/**
 * Creates a Readline interface for reading large files with a specified high water mark.
 * @private
 * @param {string} file - The file path to create a Readline interface for.
 * @returns {readline.Interface} The Readline interface.
 */
function createRL(file){
    const read_stream = fs.createReadStream(file, { highWaterMark: 10 * 1024 * 1024 }); //10MB
    const rl = readline.createInterface({
        input: read_stream,
        crlfDelay: Infinity
    });
    return rl;
}

/**
 * Processes a line of text from a file and checks if it matches the search criteria.
 * @private
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {string} line - The line of text from the file.
 * @returns {Promise<Object|null>} A Promise that resolves to the matching object or null.
 */
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

/**
 * Updates a file based on search criteria and an updater function or object.
 * @private
 * @param {string} file - The file path to update.
 * @param {function|Object} search - The search criteria. It can be a function or an object.
 * @param {function|Object} updater - The updater function or object.
 * @param {boolean} [one=false] - Indicates whether to update only one matching entry (default: false).
 * @returns {Promise<boolean>} A Promise that resolves to `true` if the file was updated, or `false` otherwise.
 */
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

/**
 * Asynchronously updates entries in a file based on search criteria and an updater function or object.
 * @function
 * @param {string} folder - The folder containing the file.
 * @param {string} name - The name of the file to update.
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {function|Object} obj - The updater function or object.
 * @param {boolean} one - Indicates whether to update only one matching entry (default: false).
 * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were updated, or `false` otherwise.
 */
async function update(folder, name, arg, obj, one){
    let files = fs.readdirSync(folder + "/" + name).filter(file => !/\.tmp$/.test(file));
    files.reverse();
    for(const file of files){
        let updated = await updateWorker(folder + "/" + name + "/" + file, arg, obj, one);
        if(updated) break;
    }
    return true;
}

/**
 * Removes entries from a file based on search criteria.
 * @private
 * @param {string} file - The file path to remove entries from.
 * @param {function|Object} search - The search criteria. It can be a function or an object.
 * @param {boolean} [one=false] - Indicates whether to remove only one matching entry (default: false).
 * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were removed, or `false` otherwise.
 */
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

/**
 * Asynchronously removes entries from a file based on search criteria.
 * @function
 * @param {string} folder - The folder containing the file.
 * @param {string} name - The name of the file to remove entries from.
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {boolean} one - Indicates whether to remove only one matching entry (default: false).
 * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were removed, or `false` otherwise.
 */
async function remove(folder, name, arg, one){
    let files = fs.readdirSync(folder + "/" + name).filter(file => !/\.tmp$/.test(file));
    files.reverse();
    for(const file of files){
        let removed = await removeWorker(folder + "/" + name + "/" + file, arg, one);
        if(removed) break;
    }
    return true;
}

module.exports = {
    /**
     * Asynchronously finds entries in a file based on search criteria.
     * @function
     * @param {string} file - The file path to search in.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @returns {Promise<Object[]>} A Promise that resolves to an array of matching objects.
     */
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

    /**
     * Asynchronously finds one entry in a file based on search criteria.
     * @function
     * @param {string} file - The file path to search in.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @returns {Promise<Object>} A Promise that resolves to the first matching object found or an empty array.
     */
    async findOne(file, arg){
        file = pathRepair(file);
        return await new Promise(async (resolve) => {
            if(!fs.existsSync(file)){
                await fs.promises.writeFile(file, "");
                resolve(false);
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
            resolve(false);
        });
    },

    /**
     * Asynchronously updates entries in a file based on search criteria and an updater function or object.
     * @function
     * @param {string} folder - The folder containing the file.
     * @param {string} name - The name of the file to update.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {function|Object} obj - The updater function or object.
     * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were updated, or `false` otherwise.
     */
    async update(folder, name, arg, obj){
        return await update(folder, name, arg, obj, false);
    },

    /**
     * Asynchronously updates one entry in a file based on search criteria and an updater function or object.
     * @function
     * @param {string} folder - The folder containing the file.
     * @param {string} name - The name of the file to update.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {function|Object} obj - The updater function or object.
     * @returns {Promise<boolean>} A Promise that resolves to `true` if one entry was updated, or `false` otherwise.
     */
    async updateOne(folder, name, arg, obj){
        return await update(folder, name, arg, obj, true);
    },

    /**
     * Asynchronously removes entries from a file based on search criteria.
     * @function
     * @param {string} folder - The folder containing the file.
     * @param {string} name - The name of the file to remove entries from.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were removed, or `false` otherwise.
     */
    async remove(folder, name, arg){
        return await remove(folder, name, arg, false);
    },

    /**
     * Asynchronously removes one entry from a file based on search criteria.
     * @function
     * @param {string} folder - The folder containing the file.
     * @param {string} name - The name of the file to remove an entry from.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @returns {Promise<boolean>} A Promise that resolves to `true` if one entry was removed, or `false` otherwise.
     */
    async removeOne(folder, name, arg){
        return await remove(folder, name, arg, true);
    },
}