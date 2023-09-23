const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
var tokenizer = require("./tokenizer");
tokenizer.train(trainClassifier("./c-data/"));

var errMsg = [
    "Przepraszam, nie mam odpowiedzi na to pytanie.",
    "Przepraszam, nie rozumiem.",
    "Nie wiem co jest odpowiedzią na pytanie.",
    "?"
]

function getErr(){ return errMsg[Math.floor(Math.random() * errMsg.length)] };

function trainClassifier(directory){
    var dialogues = [];
    const files = fs.readdirSync(directory);
    for(const file of files){
        if(path.extname(file).toLowerCase() === '.yaml'){
            const filePath = path.join(directory, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = YAML.parse(fileContent);
            dialogues.push(...data.d);
        }
    }
    return dialogues;
}

function respondToQuestion(question){
    question = question.toLowerCase();
    if(question.endsWith("?")) question.slice(0, -1);

    var res = tokenizer(question)
    if(res == null) return getErr();
    return res.o;
}

module.exports = respondToQuestion;