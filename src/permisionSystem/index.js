const genId = require("../db/gen");
const sortRolesByHierarchy = require("./sortRolesByHierarchy")

class permisionSystem{
    constructor(id){
        this.id = id;
        this.db = global.db.permission;
    }

    async _addToDb(obj){
        await this.db.add(this.id, obj);
    }

    async _getFromDb(obj){
        const res = await this.db.findOne(this.id, obj);
        if(!res) throw new Error("db obj is not exsists");
        return res.o;
    }

    async _updateDb(obj1, obj2){
        await this.db.updateOne(this.id, obj1, obj2);
    }

    async _removeFromDb(obj){
        await this.db.removeOne(this.id, obj);
    }

    async getRoles(){
        let roles = await this.db.find(this.id, (r) => r.roleId);
        if(roles.length == 0) throw new Error("db obj is not exsists");
        roles = roles.map(role => role.o);
        roles = sortRolesByHierarchy(roles);
        if(!roles) return [];
        return roles;
    }

    async getUserRoles(user){
        // let roles = await this._getFromDb({ userId: user });
        // roles = sortRolesByHierarchy(roles.roles);
        // return roles;
    }

    /* permission */

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

    async userPermison(user, perm){
        user = await this._getFromDb({ userId: user });
        if(!user) return false;
        return await this.hasPermison(user.roles, perm);
    }

    /* role menager */

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

    async roleIsBigger(role1, role2){
        const roles = await this.getRoles();
        role1 = roles.findIndex(r => r.roleId == role1);
        role2 = roles.findIndex(r => r.roleId == role2);
        return role1 < role2; //true if role1 is important
    }

    async userHasEditRole(user, role){ // TODO userHasEditRole
        return false;
        const bigger = (await this.getUserRoles(user))[0];
        return await this.roleIsBigger(bigger, this._getFromDb({ roleId: role }));
    }
}

module.exports = permisionSystem;