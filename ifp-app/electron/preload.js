const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    send: (m) => ipcRenderer.send('electronAPI', m)
});

ipcRenderer.on('electronFront', (event, message) => {
    var ele = document.getElementById("switch");
    ele.innerHTML = message;
    ele.click();
});