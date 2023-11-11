const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

async function fetchData(url){
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(JSON.parse(data));
            });

            res.on('error', (error) => {
                reject(error);
            });
        });
    });
}

async function downloadFile(url, localPath){
    const file = fs.createWriteStream(localPath);

    return new Promise((resolve, reject) => {
        http.get(url, (response) => {
            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve();
            });

            file.on('error', (error) => {
                fs.unlink(localPath, () => reject(error));
            });
        });
    });
}

async function updateFiles(pth=".ifp-ele-app"){
    let pathApp = path.join(os.homedir(), pth);
    if(!fs.existsSync(pathApp)) fs.mkdirSync(pathApp);
    const serverUrl = 'http://localhost:1478/ele-app';
    const filesJson = await fetchData(`${serverUrl}/files.json`);
  
    async function updateFilesRecursively(prefDir, directory, files){
        for(let i=0; i<files.length; i++){
            let file = files[i];
            const filePath = path.join(prefDir, directory, file.name);
    
            if(file.type === 'file'){
                if(!fs.existsSync(filePath) || calculateSha256(filePath) !== file.sha256){
                    let p = (directory ? directory+"/" : "") + file.name;
                    let url = serverUrl+"/"+p;
                    await downloadFile(url, filePath);
                }
            }else if(file.type === 'dir'){
                let p = (directory ? directory+"/" : "") + file.name;
                if(!fs.existsSync(filePath)) fs.mkdirSync(filePath);
                await updateFilesRecursively(prefDir, p, file.files);
            }
        };
    }
  
    await updateFilesRecursively(pathApp, "", filesJson);
}

function calculateSha256(filePath){
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

module.exports = updateFiles;