var sendNotif = () => {}
var zezwolNaNotif = () => {}


function loadApis(){
    var dev = {
        isElectron: navigator.userAgent.toLowerCase().includes('electron'),
        isInIframe: window.self !== window.top,
        // isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
    
    var script = document.createElement("script");
    var path = "";
    if(dev.isElectron) path = "ele";
    else if(dev.isInIframe) path = "if";
    else path = "web";

    script.src = "/devices/"+path+".js";
    script.onload = function(){
        apisLoad.v = true;
    }
    document.head.appendChild(script);
}
loadApis();