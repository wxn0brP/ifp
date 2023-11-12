const crypto = require('crypto');
const axios = require('axios');
const tar = require('tar');
const fs = require('fs');
const lo = console.log;


async function calculateSha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(content).digest('hex');
}

async function getPkgInfo(name, version){
    const packageInfoUrl = `https://registry.npmjs.org/${name}/${version.replace("^","")}`;
    const response = await axios.get(packageInfoUrl);
    return response.data;
}

async function downloadPackage(packageName, version, destination){
    try{
        const packageInfo = await getPkgInfo(packageName, version);
        const tarballUrl = packageInfo.dist.tarball;
        const tarballResponse = await axios.get(tarballUrl, { responseType: 'arraybuffer' });
        const tarballBuffer = Buffer.from(tarballResponse.data, 'binary');

        fs.writeFileSync(destination, tarballBuffer);

        console.log(`Pobrano paczkę ${packageName}@${version} do ${destination}`);
    }catch(error){
        console.error(`Błąd podczas pobierania paczki ${packageName}@${version}:`, error.message);
    }
}

async function importModuleFromTgz(dir, file){
    try{
        if(!fs.existsSync(dir)) fs.mkdirSync(dir);
        tar.x({ file, C: dir, sync: true });
    }catch(error){
        console.error(`Błąd podczas rozpakowywania pliku ${dir}: ${error.message}`);
    }
    const modPath = dir+"/package/";
    const package = require(modPath+"package.json");
    const main = modPath + (package.main || "index.js");
    return require(main);
}

async function requirePkgs(){
    const packageJsonPath = './package.json';
    const packageJson = require(packageJsonPath);

    const dependencies = packageJson.dependencies || {};
    const pkgs = {};

    for(const [packageName, version] of Object.entries(dependencies)){
        const packageDir = `./nn/${packageName}`;
        const packageArchive = `${packageDir}.tgz`;

        if(!fs.existsSync(packageArchive)) await downloadPackage(packageName, version, packageArchive);

        const localSha256 = await calculateSha256(packageArchive);
        const packageInfo = await getPkgInfo(packageName, version);
        const registrySha256 = packageInfo.dist.shasum;

        if(localSha256 !== registrySha256){
            console.log(`Aktualizacja paczki ${packageName}@${version}`);
            await downloadPackage(packageName, version, packageArchive);
        }else{
            console.log(`Paczka ${packageName}@${version} jest aktualna`);
        }
        pkgs[packageName] = await importModuleFromTgz(packageDir, packageArchive);
    }
    return pkgs;
}

module.exports = requirePkgs;