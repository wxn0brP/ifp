const axios = require('axios');

async function getLatestVersion(){
    try{
        const response = await axios.get('https://api.github.com/repos/wxn0brP/ifp-console/releases/latest', {
            headers: {
                'User-Agent': 'Axios HTTP Client',
            },
        });

        return response.data;
    }catch(error){
        console.error('Błąd podczas pobierania informacji o releasie Node.js:', error.message);
        throw new Error(error.message)
    }
}

function compareVersion(version1, version2){
    const verA = version1.split('.').map(segment => parseInt(segment) || 0);
    const verB = version2.split('.').map(segment => parseInt(segment) || 0);

    for(let i = 0; i < Math.max(verA.length, verB.length); i++){
        const a = verA[i] || 0;
        const b = verB[i] || 0;

        if(a < b) return true;
        else if (a > b) return false;
    }

    return false;
}

module.exports = async () => {
    let lastedRele = await getLatestVersion();
    let lasted = lastedRele.tag_name.replace("v","");
    let currnet = '0.0.1';

    if(compareVersion(lasted, currnet)){
        console.log("Dostępna aktualizacja: https://github.com/wxn0brP/ifp-console/releases/latest")
    }
}