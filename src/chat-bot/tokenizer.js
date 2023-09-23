function tokenize(input){
    return input.toLowerCase().split(' ');
}

function findMostSimilarInput(input, array){
    const inputTokens = tokenize(input);
    let maxSimilarity = 0;
    let mostSimilarInput = null;
    for(let i=0; i<array.length; i++){
        const arrayTokens = tokenize(array[i].i);
        const similarity = calculateSimilarity(inputTokens, arrayTokens);
        if(similarity > maxSimilarity){
            maxSimilarity = similarity;
            mostSimilarInput = array[i];
        }
    }
    return mostSimilarInput;
}

function calculateSimilarity(tokensA, tokensB){
    const intersection = tokensA.filter(token => tokensB.includes(token));
    const union = [...new Set([...tokensA, ...tokensB])];
    return intersection.length / union.length;
}

var trainData = [];

const exp = (data) => {
    return findMostSimilarInput(data, trainData);
}

exp.train = (data) => {
    trainData = data;
}

module.exports = exp;