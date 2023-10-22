function sortRolesByHierarchy(roles){
    const len = roles.length;

    const rootRole = roles.find((role) => role.parrent === "all");
    const indexToRemove = roles.indexOf(rootRole);
    if(indexToRemove !== -1) roles.splice(indexToRemove, 1);    
    roles.unshift(rootRole);

    for(let i=1; i<len; i++){
        let role = roles[i];
        let parrentIndex = roles.findIndex(r => r.roleId == role.parrent);
        if(i == parrentIndex + 1) continue;
        roles.splice(i, 1);
        roles.splice(parrentIndex + 1, 0, role);
        i = 1;
    }
    return roles;
}

module.exports = sortRolesByHierarchy;