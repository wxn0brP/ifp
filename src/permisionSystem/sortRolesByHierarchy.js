function sortRolesByHierarchy(roles){
    const len = roles.length;

    const rootRole = roles.find((role) => role.parent === "all");
    const indexToRemove = roles.indexOf(rootRole);
    if(indexToRemove !== -1) roles.splice(indexToRemove, 1);    
    roles.unshift(rootRole);

    for(let i=1; i<len; i++){
        let role = roles[i];
        let parentIndex = roles.findIndex(r => r.roleId == role.parent);
        if(i == parentIndex + 1) continue;
        roles.splice(i, 1);
        roles.splice(parentIndex + 1, 0, role);
        i = 1;
    }
    return roles;
}

module.exports = sortRolesByHierarchy;