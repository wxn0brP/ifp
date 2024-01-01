function loadRcss(link){
    let rcss = cw.get(link);
    rcssC(rcss, globalMixins);
}

var globalMixins = [
    {
        name: "pr",
        data: [
            "border-radius: var(--pr);",
            "padding: var(--pr);",
        ]
    }
];

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
});