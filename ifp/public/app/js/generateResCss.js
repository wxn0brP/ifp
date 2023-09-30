function generateCSS(){
    var styleSheet = document.createElement('style');
    document.body.appendChild(styleSheet);
    var cssText = '';
    const pr = [
        12, 6, 4, 3, "12 * 5", 2, "12 * 7", "12 * 8", "12 * 9", "12 * 10","12 * 11"
    ]
    const rules = [
        { query: `(max-width: 500px)`, s: "s" },
        { query: `(min-width: 500px) and (max-width: 850px)`, s: "m" },
        { query: `(min-width: 850px) and (max-width: 1500px)`, s: "l" },
        { query: `(min-width: 1500px)`, s: "u" }
    ];

    for(var br in rules){
        var r = rules[br];
        cssText += `@media only screen and ${r.query}{`;
        for(let i=0; i<pr.length; i++){
            cssText += `.${r.s}_${i+1}{width: calc(100% / ${pr[i]});} `;
        }
        cssText += `.${r.s}_12{width: 100%;} .${r.s}{width: 100%;} }`;
    }

    styleSheet.textContent = cssText;
}

generateCSS();