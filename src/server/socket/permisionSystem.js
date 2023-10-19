class permisionSystem{
    constructor(id){
        this.id = id;
        this.db = global.db.permission;
    }

    async addToDb(obj){
        await this.db.add(this.id, obj);
    }

    async getToDb(obj){
        return (await this.db.findOne(this.id, obj))?.o;
    }

    async updateToDb(obj1, obj2){
        await this.db.updateOne(this.id, obj1, obj2);
    }


    async hasPermison(roles, perm){
        for(let i=0; i<roles.length; i++){
            let role = (await this.getToDb({ roleId: roles[i] }))?.o;
            if(!role) continue;
            if(role.perm.includes(perm)) return true;
        }
        return false;
    }

    async userPermison(user, perm){
        user = (await this.getToDb({ userId: user }))?.o;
        if(!user) return false;
        return await this.hasPermison(user.roles, perm);
    }

}