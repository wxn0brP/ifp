const menuBuilder = {}
menuBuilder.menuBuild = function(div){
    div.classList.add("topnav");

    var innerHTML = div.innerHTML.trim();
    var items = innerHTML.split('\n');

    items.forEach(item => {
        var matches = item.match(/\[(.+)\]\s+(.+)/);
        if(matches){
            div.innerHTML = div.innerHTML.replace(matches[0], "");
            var link = document.createElement("a");
            link.href = matches[1];
            link.innerHTML = matches[2];
            div.appendChild(link);
        }
    });
    
    var toogler = document.createElement("a");
    toogler.href = "javascript:void(0);";
    toogler.classList.add("icon");
    toogler.innerHTML = "&#9776;";
    toogler.addEventListener("click", () => {
        document.querySelector("#"+div.id).clT("responsive");
    });
    div.appendChild(toogler);
}

menuBuilder.menuBuildUrl = function(url="/menu.html", id="navs"){
    var ele = document.getElementById(id);
    var menu = cw.get(url);
    ele.innerHTML = menu;
    menuBuilder.menuBuild(ele);
}
