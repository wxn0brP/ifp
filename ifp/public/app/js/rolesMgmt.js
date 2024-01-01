function sortRolesByHierarchy(roles){
    const len = roles.length;

    const rootRole = roles.find((role) => role.parent === "all");
    const indexToRemove = roles.indexOf(rootRole);
    if(indexToRemove !== -1) roles.splice(indexToRemove, 1);    
    roles.unshift(rootRole);

    for(let i=1; i<len; i++){
        let role = roles[i];
        let parrentIndex = roles.findIndex(r => r.roleId == role.parent);
        if(i == parrentIndex + 1) continue;
        roles.splice(i, 1);
        roles.splice(parrentIndex + 1, 0, role);
        i = 1;
    }
    return roles;
}

function rolesMgmt(roles, roleHierarchyContainer){
    function renderRoleHierarchy(roles){
        roleHierarchyContainer.innerHTML = '';

        roles.forEach(role => {
            const roleItem = document.createElement('li');
            roleItem.classList.add('roleItem');

            const nameSpan = document.createElement("span");
            nameSpan.innerHTML = `${role.name} (ID: ${role.roleId})`;
            nameSpan.style.cursor = "pointer";
            nameSpan.onclick = () => {
                roleMgmt(role);
            }

            const moveUpButton = document.createElement('button');
            moveUpButton.textContent = '↑';
            moveUpButton.addEventListener('click', () => moveRoleUp(role.roleId));

            const moveDownButton = document.createElement('button');
            moveDownButton.textContent = '↓';
            moveDownButton.addEventListener('click', () => moveRoleDown(role.roleId));

            roleItem.appendChild(nameSpan);
            roleItem.appendChild(moveUpButton);
            roleItem.appendChild(moveDownButton);

            roleHierarchyContainer.appendChild(roleItem);
        });
    }

    function moveRoleUp(roleId){
        roles = sortRolesByHierarchy(roles);
        const roleIndex = roles.findIndex(role => role.roleId === roleId);
        if(roleIndex <= 0) return;

        let nadPar = roles[roleIndex - 1].parent;
        let nadId  = roles[roleIndex - 1].roleId;
        let rol    = roles[roleIndex]    .roleId;

        roles[roleIndex - 1].parent = rol;
        roles[roleIndex].parent = nadPar;
        if(roleIndex < roles.length - 1)
            roles[roleIndex + 1].parent = nadId;      
        
        render();
    }

    function moveRoleDown(roleId){
        roles = sortRolesByHierarchy(roles);
        const roleIndex = roles.findIndex(role => role.roleId === roleId);
        if(roleIndex >= roles.length - 1) return;

        let rolPar = roles[roleIndex]    .parent;
        let rolId  = roles[roleIndex]    .roleId;
        let par1   = roles[roleIndex + 1].roleId;

        roles[roleIndex]    .parent = par1;
        roles[roleIndex + 1].parent = rolPar;
        if(roleIndex < roles.length - 2)
            roles[roleIndex + 2].parent = rolId;

        render();
    }


    function render(){
        roles = sortRolesByHierarchy(roles)
        renderRoleHierarchy(roles);
    }
    render();
}

function roleMgmt(role){
    let roleContainer = document.querySelector("#roleMgmt");
    roleContainer.innerHTML = "Role: "+role.name
}