global.modulePath = __dirname;
global.modeles = {};
const dep = require("./package.json").dependencies || {};
for(let d in dep) global.modeles[d] = require(d);

require("./updateLib")