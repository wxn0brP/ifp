const fs = require('fs');
const readline = require('readline');

module.exports = {
    getId: require("./gen"),

    hasFields(obj, fields){
        const keys = Object.keys(fields);
        for(let i = 0; i < keys.length; i++){
            const key = keys[i];
            if(!(key in obj) || obj[key] !== fields[key]){
                return false;
            }
        }
        return true;
    },

    updateObject(obj, newVal){
        for(let key in newVal){
            if(newVal.hasOwnProperty(key)){
                obj[key] = newVal[key];
            }
        }
        return obj;
    },

    async updateFile(file, lineNumber, obj=null){
        await fs.promises.copyFile(file, file+".tmp");
        await fs.promises.writeFile(file, "");

        const rl = readline.createInterface({
            input: fs.createReadStream(file+".tmp"),
            crlfDelay: Infinity
        });
      
        let lineCount = 0;
        for await(let line of rl){
            lineCount++;
        
            if(lineCount === lineNumber){
                if(obj) line = obj;
                else continue;
            }
        
            fs.appendFileSync(file, line+"\n");
        }
        await fs.promises.writeFile(file+".tmp", "");
    },

    async remove(file, lineNumber){
        await this.updateFile(file, lineNumber, null);
    },

    async update(file, lineNumber, new_obj){
        await this.updateFile(file, lineNumber, new_obj);
    },
}