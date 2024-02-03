const genId = require("../db/gen");
const sortRolesByHierarchy = require("./sortRolesByHierarchy")

/**
 * Represents a permission system for managing roles and permissions.
 * @class
 */
class permisionSystem{
    /**
     * Create a new permission system instance.
     * @constructor
     * @param {string} id - The unique identifier for the permission system.
     */
    constructor(id){
        this.id = id;
        this.db = global.db.permission;
    }

    /**
     * Add an object to the database.
     * @param {Object} obj - The object to be added to the database.
     * @returns {Promise} A Promise that resolves when the object is added to the database.
     */
    async _addToDb(obj){
        await this.db.add(this.id, obj);
    }

    /**
     * Get an object from the database.
     * @param {Object} obj - The object used to query the database.
     * @returns {Promise} A Promise that resolves with the retrieved object or throws an error if not found.
     */
    async _getFromDb(obj){
        const res = await this.db.findOne(this.id, obj);
        if(!res) throw new Error("db obj is not exsists");
        return res.o;
    }

    /**
     * Update an object in the database.
     * @param {Object} obj1 - The query object to find the object to update.
     * @param {Object} obj2 - The object with updated data.
     * @returns {Promise} A Promise that resolves when the object is updated in the database.
     */
    async _updateDb(obj1, obj2){
        await this.db.updateOne(this.id, obj1, obj2);
    }

    /**
     * Remove an object from the database.
     * @param {Object} obj - The object to be removed from the database.
     * @returns {Promise} A Promise that resolves when the object is removed from the database.
     */
    async _removeFromDb(obj){
        await this.db.removeOne(this.id, obj);
    }

    /**
     * Get roles from the database and sort them by hierarchy.
     * @returns {Promise} A Promise that resolves with an array of sorted role objects or an empty array if not found.
     */
    async getRoles(){
        let roles = await this.db.find(this.id, (r) => r.roleId);
        if(roles.length == 0) throw new Error("db obj is not exsists");
        roles = roles.map(role => role.o);
        roles = sortRolesByHierarchy(roles);
        if(!roles) return [];
        return roles;
    }

    /**
     * Get roles associated with a user.
     * @param {string} user - The user identifier.
     * @returns {Promise} A Promise that resolves with an array of user roles or an empty array if not found.
     */
    async getUserRoles(user){
        // let roles = await this._getFromDb({ userId: user });
        // roles = sortRolesByHierarchy(roles.roles);
        // return roles;
    }

    /* permission */

    /**
     * Check if a set of roles has a specific permission.
     * @param {Array} roles - An array of role identifiers.
     * @param {string} perm - The permission to check for.
     * @returns {Promise} A Promise that resolves to true if any role has the permission, or false if none do.
     */
    async hasPermison(roles, perm){
        const rolesDb = await this.getRoles();
        for(let i=0; i<roles.length; i++){
            let role = rolesDb.find(r => r.roleId == roles[i]);
            if(!role) continue;
            if(role.perm == "all") return true;
            if(role.perm.includes(perm)) return true;
        }
        return false;
    }

    /**
     * Check if a user has a specific permission.
     * @param {string} user - The user identifier.
     * @param {string} perm - The permission to check for.
     * @returns {Promise} A Promise that resolves to true if the user has the permission, or false if not.
     */
    async userPermison(user, perm){
        user = await this._getFromDb({ userId: user });
        if(!user) return false;
        return await this.hasPermison(user.roles, perm);
    }

    /* role menager */

    /**
     * Create a new role with a given name, permissions, and parent.
     * @param {string} name - The name of the role.
     * @param {string} perm - The permissions associated with the role.
     * @param {string} parent - The parent role identifier.
     * @returns {Promise} A Promise that resolves with the newly created role's identifier.
     */
    async createRole(name, perm, parent){
        const id = genId();
        const role = {
            name,
            roleId: id,
            perm,
            parent
        }
        await this._addToDb(role);
        return id;
    }

    /**
     * Remove a role by its identifier and update parent relationships.
     * @param {string} roleId - The role identifier to remove.
     * @returns {Promise} A Promise that resolves when the role is removed.
     */
    async removeRole(roleId){
        const roles = await this.getRoles();
        
        const roleIndex = roles.findIndex(r => r.roleId == roleId);
        if(roleIndex == -1) throw new Error("db obj is not exsists");
        if(roleIndex + 1 < roles.length){
            const parentRole = roles[roleIndex].parent;
            const nextRole = roles[roleIndex + 1];
            await this._updateDb({ roleId: nextRole.roleId }, { parent: parentRole });
        }
        await this._removeFromDb({ roleId: roleId });
    }

    /**
     * Check if one role is higher in hierarchy than another.
     * @param {string} role1 - The first role identifier.
     * @param {string} role2 - The second role identifier.
     * @returns {Promise} A Promise that resolves to true if role1 is higher in hierarchy than role2, or false otherwise.
     */
    async roleIsBigger(role1, role2){
        const roles = await this.getRoles();
        role1 = roles.findIndex(r => r.roleId == role1);
        role2 = roles.findIndex(r => r.roleId == role2);
        return role1 < role2; //true if role1 is important
    }

    /**
     * Check if a user has the permission to edit a role.
     * @param {string} user - The user identifier.
     * @param {string} role - The role identifier to edit.
     * @returns {Promise} A Promise that resolves to true if the user has permission to edit the role, or false if not.
     */
    async userHasEditRole(user, role){ // TODO userHasEditRole
        return false;
        const bigger = (await this.getUserRoles(user))[0];
        return await this.roleIsBigger(bigger, this._getFromDb({ roleId: role }));
    }
}

module.exports = permisionSystem;