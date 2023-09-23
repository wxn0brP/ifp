function changeIdToName(id){
    if(friendsId[id]) return friendsId[id];
    var data = getInServer("/userId?user="+id);
    friendsId[id] = data;
    return data;
}

function changeIdToServer(id){
    if(serversId[id]) return serversId[id];
    var data = getInServer("/serverId?s="+id);
    serversId[id] = data;
    return data;
}

function getInServer(url){
    var dataS = cw.get(url);
    var data = JSON.parse(dataS);
    if(data.err){
        alert("Error getInServer: url: "+url+"  ::  "+dataS);
        return null;
    }
    return data.msg;
}