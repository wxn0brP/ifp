function loadRcss(link){
    let rcss = cw.get(link);
    rcssC(rcss);
}

[
    "anim",
    "contex",
    "inne",
    "menu",
    "mess",
    "pop",
    "screen",
    "send",
    "settings",
    "userProfile",
    "userStatus",
    "star",
].forEach(css => {
    loadRcss("/css/"+css+".css");
})