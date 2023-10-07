class PermissionSystem{
    constructor(dbId){
        this.db = global.db.permission;
        this.id = dbId;
        // this.roles = new Map();
        // this.users = new Map();
    }

    async addRole(roleName, permissions, parentRole = null){
        if(this.roles.has(roleName)){
            console.error(`Rola ${roleName} już istnieje.`);
            return;
        }

        if(parentRole){
            if(await this.db.findOne(this.id, { _id: parentRole })){
                console.error(`Rola nadrzędna ${parentRole} nie istnieje.`);
                return;
            }
        }

        await this.db.add(this.id, { roleName, permissions, parentRole });
    }

    async addUser(user, roles){
        await this.db.updateOne(this.id, { _id: user}, { roles });
    }

    async hasPermission(user, permission){
        const userRoles = (await this.db.findOne(this.id, { _id: user }))?.o;

        if(!userRoles){
            return false;
        }

        for(const role of userRoles){
            if(await this.checkPermissionInRole(role, permission)){
                return true;
            }
        }

        return false;
    }

    async removeRole(roleName){
        await this.db.deleteOne(this.id, { roleName });

        const users = (await this.db.find(this.id, {})).o;
        for(let user in users){
            if(!user.userName) continue;
            let roles = user.roles.filter(role => role !== roleName);
            await this.db.updateOne(this.id, { _id: user._id }, { roles });
        }
    }

    async addUserToRole(user, roleName){
        const userRoles = (await this.db.findOne(this.id, { _id: user }))?.o;

        if(!userRoles){
            console.error(`Użytkownik ${user} nie istnieje.`);
            return;
        }

        if(!await this.canEditRole(user, roleName)){
            console.error(`Użytkownik ${user} nie ma uprawnień do edytowania roli ${roleName}.`);
            return;
        }

        userRoles.roles.push(roleName);
        await this.db.updateOne(this.id, { _id: userRoles._id }, { roles: userRoles.roles });
    }

    async removeUserFromRole(user, roleName){
        const userRoles = (await this.db.findOne(this.id, { _id: user }))?.o;

        if(!userRoles){
            console.error(`Użytkownik ${user} nie istnieje.`);
            return;
        }

        if(!this.canEditRole(user, roleName)){
            console.error(`Użytkownik ${user} nie ma uprawnień do edytowania roli ${roleName}.`);
            return;
        }

        const updatedRoles = userRoles.roles.filter(role => role !== roleName);
        await this.db.updateOne(this.id, { _id: userRoles._id }, { roles: updatedRoles });
    }

    async canEditRole(user, roleNameToEdit){
        const userRoles = (await this.db.findOne(this.id, { _id: user }))?.o;

        if(!userRoles){
            return false;
        }

        // Znajdź rolę użytkownika o najwyższym poziomie hierarchii
        const highestUserRole = await userRoles.roles.reduce(async (highestRole, currentRole) => {
            if(!highestRole || await this.compareRoles(currentRole, highestRole) > 0){
                return currentRole;
            }
            return highestRole;
        }, null);

        const roleToEdit = this.db.findOne(this.id, { _id: roleNameToEdit })?.o;

        if(!roleToEdit){
            return false;
        }

        if(
            !highestUserRole ||
            await this.compareRoles(highestUserRole, roleNameToEdit) < 0 ||
            roleNameToEdit === highestUserRole
        ){
            return false;
        }

        return true;
    }

    async compareRoles(roleA, roleB){
        if(roleA === roleB){
            return 0;
        }

        const parentA = await this.db.findOne(this.id, { _id: roleA })?.o?.parentRole;
        if(parentA === roleB){
            return 1;
        }

        const parentB = await this.db.findOne(this.id, { _id: roleB })?.o?.parentRole;
        if(parentB === roleA){
            return -1;
        }

        return 0;
    }


    // TODO skończyć role i przetestować
    checkPermissionInRole(roleName, permission){
        const role = this.roles.get(roleName);

        if (!role) {
            return false; // Rola nie istnieje
        }

        // Sprawdzamy, czy rola ma dane uprawnienie
        if (role.permissions.includes(permission)) {
            return true; // Rola ma uprawnienie
        }

        // Jeśli rola ma rolę nadrzędną, sprawdzamy uprawnienia w tej roli nadrzędnej
        if (role.parentRole) {
            return this.checkPermissionInRole(role.parentRole, permission);
        }

        return false; // Rola nie ma uprawnienia
    }
}

// Przykład użycia:
// const permissionSystem = new PermissionSystem();

// permissionSystem.addRole("admin", ["create", "read", "update", "delete"]);
// permissionSystem.addRole("manager", ["read", "update"]);
// permissionSystem.addRole("user", ["read"]);
// permissionSystem.addRole("guest", []);

// permissionSystem.addUser("john", ["user"]);
// permissionSystem.addUser("managerUser", ["manager", "user"]);
// permissionSystem.addUser("adminUser", ["admin", "manager", "user"]);

// console.log(permissionSystem.hasPermission("john", "read")); // true
// console.log(permissionSystem.hasPermission("managerUser", "update")); // true
// console.log(permissionSystem.hasPermission("adminUser", "delete")); // true

// console.log(permissionSystem.canEditRole("john", "user")); // false
// console.log(permissionSystem.canEditRole("managerUser", "manager")); // true
// console.log(permissionSystem.canEditRole("managerUser", "admin")); // false

// permissionSystem.addUserToRole("adminUser", "manager"); // adminUser dodaje rolę "manager"
// console.log(permissionSystem.users.get("adminUser")); // ["admin", "manager", "user"]

// permissionSystem.removeUserFromRole("adminUser", "user"); // adminUser usuwa rolę "user"
// console.log(permissionSystem.users.get("adminUser")); // ["admin", "manager"]

// permissionSystem.removeUserFromRole("adminUser", "admin"); // adminUser nie może usunąć roli "admin"
