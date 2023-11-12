// const fs = require('fs');
// const path = require('path');
// const crypto = require('crypto');

// function calculateSha256(directoryPath){
//     const files = fs.readdirSync(directoryPath);
//     files.sort();

//     const hash = crypto.createHash('sha256');

//     files.forEach((file) => {
//         const filePath = path.join(directoryPath, file);
//         const stats = fs.statSync(filePath);

//         if(stats.isDirectory()){
//             hash.update(file);
//             hash.update(calculateSha256(filePath));
//         }else{
//             const content = fs.readFileSync(filePath);
//             hash.update(content);
//         }
//     });

//     return hash.digest('hex');
// }

// function getNodeModulesSha256(nodeModulesPath){
//     return calculateSha256(nodeModulesPath);
// }

// const nodeModulesPath = path.join(__dirname, 'node_modules');
// const result = getNodeModulesSha256(nodeModulesPath);
// console.log(result);
