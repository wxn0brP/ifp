const readline = require('readline');

function getUserInputAsync(question){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function getListAsync(options, question){
    let optionsF = options.map((ele, i) => `[${i+1}] ${ele}`);
    optionsF.push("[0] Cancel");
    console.log(optionsF.join("\n"));
    const textInput = await getUserInputAsync(question+" ");
    let int = 0;
    try{
        int = parseInt(textInput);
    }catch{
        int = 0;
    }
    if(int <= 0) return null;
    if(int > options.length+1) return null;
    return {i: int, d: options[int-1]};
}

async function getBoolAsync(question){
    const textInput = await getUserInputAsync(question + " [t/n] ");
    return textInput == "t";
}

module.exports = {
    getBoolAsync,
    getListAsync,
    getUserInputAsync
}