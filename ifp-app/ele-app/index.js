const update = require("./update");
const path = require("path")
const os = require("os")

const ifp_path = ".ifp-ele-app"

async function main(){
    await update(ifp_path);
    let pth = path.join(os.homedir(), ifp_path);
    let module = pth;
    require(module);
}
main();