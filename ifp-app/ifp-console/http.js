const axios = require('axios');

let serversId = {}, friendsId = {};

async function loginUser(login, pass){
    try{
        const response = await axios.post(global.baseUrl+'/login', { login, pass, temp: true }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const res = response.data;
        if(res.err) return res || { err: true, msg: "nwm"};

        return res || { err: true, msg: "nwm"};
    }catch(error){
        console.error('err:', error);
    }
}

async function getInServer(url){
    let data = (await axios.get(url)).data;
    if(data.err){
        log("Error getInServer: url: "+url+"  ::  "+data);
        return null;
    }
    return data.msg;
}

module.exports = {
    loginUser,
    async changeIdToName(id){
        if(friendsId[id]) return friendsId[id];
        var data = await getInServer(global.baseUrl+"/userId?user="+id);
        friendsId[id] = data;
        return data;
    },
    async changeIdToServer(id){
        if(serversId[id]) return serversId[id];
        var data = await getInServer(global.baseUrl+"/serverId?s="+id);
        
        serversId[id] = data;
        return data;
    }
}