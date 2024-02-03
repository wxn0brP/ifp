const dbActionC = require("./action");
const executorC = require("./executor");

/**
 * Represents a database management class for performing CRUD operations.
 * @class
 */
class DataBase{
    /**
     * Create a new database instance.
     * @constructor
     * @param {string} folder - The folder path where the database files are stored.
     * @param {number} [cacheThreshold=3] - The cache threshold for database entries (default: 3).
     * @param {number} [ttl=300000] - The time-to-live (TTL) for cached entries in milliseconds (default: 300,000 milliseconds or 5 minutes).
     */
    constructor(folder, cacheThreshold=3, ttl=300_000){
        this.dbAction = new dbActionC(folder, cacheThreshold, ttl);
        this.executor = new executorC();
    }

    /**
     * Get the names of all available databases.
     *
     * @function
     * @returns {string[]} An array of database names.
     */
    getDBs(){
        return this.dbAction.getDBs();
    }

    /**
     * Check if a file exists within the database folder.
     *
     * @function
     * @param {string} dir - The file or directory path to check.
     */
    checkFile(dir){
        this.dbAction.checkFile(dir);
    }

    /**
     * Add data to a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} arg - The data to add.
     * @returns {Promise} A Promise that resolves when the data is added.
     */
    async add(name, arg){
        return await this.executor.addOp(this.dbAction.add.bind(this.dbAction), name, arg);
    }

    /**
     * Find data in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} arg - The query object.
     * @returns {Promise} A Promise that resolves with the matching data.
     */
    async find(name, arg){
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), name, arg);
    }

    /**
     * Find one data entry in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} arg - The query object.
     * @returns {Promise} A Promise that resolves with the first matching data entry.
     */
    async findOne(name, arg){
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), name, arg);
    }

    /**
     * Find data in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} arg - The query object.
     * @returns {Promise} A Promise that resolves with the matching data.
     */
    async get(name, arg){
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), name, arg);
    }

    /**
     * Find one data entry in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} arg - The query object.
     * @returns {Promise} A Promise that resolves with the first matching data entry.
     */
    async getOne(name, arg){
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), name, arg);
    }

    /**
     * Update data in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} obj - The update object.
     * @param {Object} arg - The query object.
     * @returns {Promise} A Promise that resolves when the data is updated.
     */
    async update(name, obj, arg){
        return await this.executor.addOp(this.dbAction.update.bind(this.dbAction), name, obj, arg);
    }

    /**
     * Update one data entry in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} obj - The update object.
     * @param {Object} arg - The query object.
     * @returns {Promise} A Promise that resolves when the data entry is updated.
     */
    async updateOne(name, obj, arg){
        return await this.executor.addOp(this.dbAction.updateOne.bind(this.dbAction), name, obj, arg);
    }

    /**
     * Remove data from a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} obj - The query object.
     * @returns {Promise} A Promise that resolves when the data is removed.
     */
    async remove(name, obj){
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), name, obj);
    }

    /**
     * Remove one data entry from a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} obj - The query object.
     * @returns {Promise} A Promise that resolves when the data entry is removed.
     */
    async removeOne(name, obj){
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), name, obj);
    }

    /**
     * Remove data from a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} obj - The query object.
     * @returns {Promise} A Promise that resolves when the data is deleted.
     */
    async delete(name, obj){
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), name, obj);
    }

    /**
     * Remove one data entry from a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} obj - The query object.
     * @returns {Promise} A Promise that resolves when the data entry is deleted.
     */
    async deleteOne(name, obj){
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), name, obj);
    }
}

module.exports = DataBase;