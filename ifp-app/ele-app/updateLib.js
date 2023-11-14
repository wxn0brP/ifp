const fs = require('fs');
const axios = require('axios');
const tar = require('tar');
const path = require('path');


const installModule = async (moduleName) => {
    const moduleURL = `https://registry.npmjs.org/${moduleName}/-/${moduleName}-latest.tgz`;
    const destinationPath = path.join(__dirname, 'node_modules', moduleName);

    try {
        const response = await axios({
            url: moduleURL,
            method: 'get',
            responseType: 'stream',
        });

        const tarStream = tar.extract({ cwd: destinationPath });

        response.data.pipe(tarStream);

        return new Promise((resolve, reject) => {
            tarStream.on('finish', () => {
                installDependencies(destinationPath);
                console.log(`Moduł ${moduleName} został pomyślnie zainstalowany w ${destinationPath}`);
                resolve();
            });

            tarStream.on('error', (err) => {
                console.error(`Błąd podczas rozpakowywania pliku tar: ${err.message}`);
                reject(err);
            });
        });
    } catch (error) {
        console.error(`Błąd pobierania modułu ${moduleName}: ${error.message}`);
        throw error;
    }
};

const uninstallModule = (moduleName) => {
    const modulePath = path.join(__dirname, 'node_modules', moduleName);

    if (fs.existsSync(modulePath)) {
        fs.rmdirSync(modulePath, { recursive: true });
        console.log(`Moduł ${moduleName} został pomyślnie odinstalowany.`);
    } else {
        console.error(`Moduł ${moduleName} nie istnieje.`);
    }
};

const updateModule = async (moduleName) => {
    uninstallModule(moduleName);
    await installModule(moduleName);
};

function installDependencies(modulePath) {
    const packageJsonPath = path.join(modulePath, 'package', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);

        if (packageJson.dependencies) {
            const dependencies = Object.keys(packageJson.dependencies);
            dependencies.forEach((dep) => {
                installModule(dep);
            });
        }
    }
}

module.exports = {
    installModule,
    uninstallModule,
    updateModule,
};
