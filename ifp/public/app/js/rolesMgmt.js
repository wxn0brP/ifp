function sortRolesByHierarchy(rolesArray){
    const sortedRoles = [];
    const seenRoleIds = {};
    const seenParents = {};

    for(const role of rolesArray){
        if(seenRoleIds[role.roleId] || seenParents[role.parent]) return false;
        seenRoleIds[role.roleId] = true;
        seenParents[role.parent] = true;
    }

    const topLevelRole = rolesArray.find(role => role.parent === "all");

    function traverseAndSort(role){
        sortedRoles.push(role);
        const childRole = rolesArray.find(child => child.parent === role.roleId);

        if(childRole) traverseAndSort(childRole);
    }

    if(topLevelRole) traverseAndSort(topLevelRole);
    else return false;

    return sortedRoles;
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
        let save = document.createElement("button");
        save.innerHTML = "Save"
        save.onclick = () => {
            let tmp = roles.map((role) => {
                return {
                    roleId: role.roleId,
                    parent: role.parent,
                };
            });
            socket.emit("server_roleHier", toChat, tmp);
        }
        roleHierarchyContainer.appendChild(document.createElement("br"));
        roleHierarchyContainer.appendChild(save);
    }
    render();
}

function roleMgmt(role){
    let roleContainer = document.querySelector("#roleMgmt");
    if(role.perm == "all"){
        roleContainer.innerHTML = "role jest adminem, nie można edytować";
        return;
    }

    function br(){
        roleContainer.appendChild(document.createElement("br"));
    }

    function buildCheckBox(name, text, checked){
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = checked;
        checkbox.setAttribute("m-m", name);
        let span = document.createElement("span");
        span.innerHTML = (text || name) + " ";
        roleContainer.appendChild(span);
        roleContainer.appendChild(checkbox);
        br();
    }

    const perms = {
        name: role.name,
        msgDel: false,
        chnlMgmt: false,
        set: false,
        roleMgmt: false,
    }

    const permName = {
        msgDel: "administracja wiadomościami",
        chnlMgmt: "zarządzanie kanałami",
        set: "zarządzanie ustawieniami serwera",
        roleMgmt: "zarządzanie rolami (wszystkimi)",
    }
    
    for(let perm of role.perm){
        perms[perm] = true;
    }
    roleContainer.innerHTML = "Role: "+role.name;
    br();
    roleContainer.innerHTML += `Name: <input m-m="name" />`
    br();br();

    for(let perm in perms)
        if(typeof perms[perm] == "boolean") buildCheckBox(perm, permName[perm], perms[perm]);
    

    br();br();
    let meuiData = meuiInit(roleContainer, perms);
    let btnSave = document.createElement("button");
    btnSave.innerHTML = "Save";
    btnSave.onclick = () => {
        let data = meuiData.get();
        let name = data.name;
        let perms = [];
        for(let perm in data)
            if(typeof data[perm] == "boolean" && data[perm]) perms.push(perm);

        socket.emit("server_chRole", toChat, role.roleId, name, perms);
        setTimeout(() => displayServerMgmt(false), 100);
        setTimeout(() => {
            document.querySelector("#details_role").open = true;
        }, 250);
    }
    roleContainer.appendChild(btnSave);

    br();br();
    let btnDel = document.createElement("button");
    btnDel.innerHTML = "Usuń role";
    btnDel.onclick = () => {
        if(!confirm("Czy na pewno chcesz usunąć tą rolę?")) return;
        socket.emit("server_rmRole", toChat, role.roleId);
        setTimeout(() => displayServerMgmt(false), 100);
        setTimeout(() => {
            document.querySelector("#details_role").open = true;
        }, 250);
    }
    roleContainer.appendChild(btnDel);
}