sendNotif = (data) => {
    if(notSound) return;
    notifSound();
    window.ReactNativeWebView.postMessage(JSON.stringify({
        type: "sendNotif",
        msg: data
    }));
}

zezwolNaNotif = () => {}//window.parent.postMessage({ type: "zezwolNaNotif"});