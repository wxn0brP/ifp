const fs = require('fs');
const os = require("os");
const qrcode = require('qrcode-terminal');

const ssl = appConfig.ssl ? "s" : "";
var port = process.env.PORT;
var psy = getPhysicalIpAddress();
var ipLink = psy.map(ip => {
    return `http${ssl}://`+ip+":"+port+"/app"
})

lo(`http${ssl}://localhost:`+port+"/app");
lo(ipLink.join(" "));
generateQR();

function getPhysicalIpAddress(){
    const interfaces = os.networkInterfaces();
    var all = [];
    for(const interfaceName in interfaces){
        const networkInterface = interfaces[interfaceName];
    
        for(const iface of networkInterface){
            if((iface.family === 'IPv4') && (!iface.internal) && (iface.mac !== '00:00:00:00:00:00')){
                all.push(iface.address);
            }
        }
    }
    return all;
}

async function generateQR(){
    async function pr(link){
        return await new Promise(resolve => {
            qrcode.generate(link, { small: true }, function(qrCode){
                resolve(qrCode);
            });
        });
    }
    var qrCode = [];
    for(let i=0; i<ipLink.length; i++){
        var link = ipLink[i];
        var qr = await pr(link)
        qrCode.push(link + "\n" + qr);
    }
    qrCode = qrCode.join("\n\n\n\n\n");

    fs.writeFileSync("qrCode.txt", qrCode);
}