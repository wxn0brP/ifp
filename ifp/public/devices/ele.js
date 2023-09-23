sendNotif = (data) => {
    notifSound();
    window.parent.postMessage({
        type: "sendNotif",
        msg: data
    }, '*');
}

zezwolNaNotif = () => window.parent.postMessage({ type: "zezwolNaNotif"}, '*');