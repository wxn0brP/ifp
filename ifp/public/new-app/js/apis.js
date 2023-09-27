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

var sendNotif = () => {}
var zezwolNaNotif = () => {}

function loadApis(){
    const dev = {
        isElectron: navigator.userAgent.toLowerCase().includes('electron'),
        isInIframe: window.self !== window.top,
        // isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
    
    const script = document.createElement("script");
    var path = "";
    if(dev.isElectron) path = "ele";
    else if(dev.isInIframe) path = "if";
    else path = "web";

    script.src = "/devices/"+path+".js";
    script.onload = function(){
        debugMsg("load api: "+path);
        setUpSocket();
    }
    document.body.appendChild(script);
}