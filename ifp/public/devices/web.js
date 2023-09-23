var webStart = {
    hid: false
}
document.addEventListener("blur", () => webStart.hid = true);
document.addEventListener("focus", () => webStart.hid = false);

sendNotif = (data) => {
    notifSound();
    if(!webStart.hid) return;
    if(Notification.permission === "granted"){
        var notyf = new Notification(data.title, {
            body: data.body,
            icon: "/favicon.ico",
        });
        notyf.onclick = () => {
            window.focus();
        };
    }
}

zezwolNaNotif = () => {
    if(Notification.permission === "granted"){}
    else if(Notification.permission !== "denied"){
        Notification.requestPermission();
    }
}