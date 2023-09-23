const {
    app,
    BrowserWindow,
    globalShortcut,
    dialog,
    Notification,
    ipcMain,
    Tray,
    Menu
} = require('electron');
const child_process = require("child_process");
const activeWin = require('active-win');
const axios = require("axios");
const os = require("os");
const fs = require("fs");
const lo = console.log;

const version = app.getVersion();
var linkPod = "https://ifp.projektares.tk/";
var dev = process.argv.length > 2 && process.argv[2] == "-dev";
if(dev){
    linkPod = process.argv[3] || "http://localhost:1478/"
}
var link = linkPod+"ele-app/";

var mainWin = null;
var conf = {};
const osType = process.platform;

async function createWindow(){
    await updateApp();
    mainWin = new BrowserWindow({
        width: 1300,
        height: 700,
        autoHideMenuBar: true,
        webPreferences: {
            preload: __dirname + '/preload.js'
        },
    });
    mainWin.setIcon(__dirname+"/favicon.png");
    mainWin.webContents.on('did-finish-load', () => {
        mainWin.webContents.executeJavaScript(`crateIframe("${linkPod}", "${version}")`);
    });

    if(osType == "win32"){
        conf.exitAppB = false;
        mainWin.on('close', (event) => {
            if(conf.exitAppB) return;
            event.preventDefault();
            mainWin.hide();
        });
        var tray = new Tray("favicon.png");
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Otwórz', click: () => changeState() },
            { type: 'separator' },
            { label: 'Zamknij', click: () => quitApp() }
        ]);
        tray.on('click', () => changeState());
        tray.on('right-click', () => {
            tray.popUpContextMenu(contextMenu);
        });
    }

    mainWin.loadURL(link+"index.html");
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit();
    }
});
  
app.on('activate', () => {
    if(mainWin === null){
        createWindow();
    }
});

if(!dev){
    app.on('browser-window-focus', function () {
        globalShortcut.register("CommandOrControl+R", () => {});
        globalShortcut.register("F5", () => {});
    });

    app.on('browser-window-blur', function () {
        globalShortcut.unregister('CommandOrControl+R');
        globalShortcut.unregister('F5');
    });
}

async function updateApp(){
    var system = osType;
    var ext = "";
    switch(system){
        case "win32": ext = "exe"; break;
        case "darwin": ext = "dmg"; break;
        case "linux": ext = "deb"; break;
    }
    try{
        var tok = `"`+os.tmpdir() + "/ifp Setup"+version+"."+ext+`"`;
        if(fs.existsSync(tok)){
            fs.unlinkSync(tok);
        }
    }catch{}
    var versionServerS = await getFileSync(link+"ver.json");
    var versionServer = versionServerS[system];
    if(!versionServer){
        dialog.showMessageBox({
            type: 'warning',
            buttons: ['OK'],
            defaultId: 0,
            message: 'IFP nie wspiera aktualnego systemu :(',
            detail: 'Aktualizacja jest NIE MOŻLIWA!',
        });
        return;
    }
    var bool = parseVersion(versionServer, version);
    if(!bool) return;
    var tmpLink = link + "rele/install.exe";
    var nameApp = `install.${ext}`;
    var file = "\"" + os.tmpdir() + "\\" + nameApp + "\"";
    dialog.showMessageBox({
        type: 'info',
        buttons: [],
        message: `Aplikacja aktualizuje się :)`,
        detail: `Towja wersja: ${version} Aktualna wesja: ${versionServer}; Plik aktualizacji: ${file}`,
    });
    await downloadFileSync(tmpLink, file);
    dialog.showMessageBox({
        type: 'info',
        buttons: [],
        message: `Zakończono pobieranie`
    });
    await new Promise(r => {
        setTimeout(r, 7000);
    });

    try{
        child_process.execSync(file);
        app.exit();
    }catch{
        dialog.showMessageBox({
            type: 'info',
            buttons: ["OK"],
            message: 'Aktualizacja nie powiodła się :(',
        });
    }
}


async function getFileSync(url){
    return (await axios.get(url)).data;
}

async function downloadFileSync(url, name){
    var command = "exit";
    if(osType == "win32"){
        command = "start cmd /c curl "+url+" -o "+name;
    }else if(osType == "linux"){
        command = "curl "+url+" -o "+name;
    }
    child_process.execSync(command);
}

function parseVersion(serverVer, clientVer){
    var a = serverVer.split(".");
    var b = clientVer.split(".");
    if(a.length > b.length){
        let tmp = a.length-b.length;
        for(let i=0; i<tmp; i++){
            b.push("0");
        }
    }else
    if(a.length < b.length){
        let tmp = b.length-a.length;
        for(let i=0; i<tmp; i++){
            a.push("0");
        }
    }
    for(let i=0; i<a.length; i++){
        if(parseInt(a[i]) > parseInt(b[i])){
            return true;
        }
    }
    return false;
}

function createNotif(title, body){
    var a = new Notification({
        title,
        body,
        icon: "favicon.png"
    });
    a.on("click", () => {
        if(mainWin.isMinimized()){
            mainWin.restore();
        }
        mainWin.focus();
    });
    a.show();
}

ipcMain.on('electronAPI', async (event, data) => {
    if(data.type == "test"){
        lo(data.msg)
    }
    if(data.type == "sendNotif"){
        if(mainWin.isFocused()) return;
        createNotif(data.msg.title, data.msg.body)
    }
});

function sendToFront(m){
    m = JSON.stringify(m);
    mainWin.webContents.send("electronFront", m);
}

function changeState(){
    if(mainWin.isFocused()){
        mainWin.hide();
    }else{
        mainWin.show();
        mainWin.focus();
    }
}

function quitApp(){
    dialog.showMessageBox(mainWin, {
        type: 'question',
        buttons: ['Zamknij', 'Anuluj'],
        defaultId: 0,
        title: 'Potwierdzenie',
        message: 'Czy na pewno chcesz zamknąć aplikację?'
    })
    .then((result) => {
        if(result.response === 0){
            conf.exitAppB = true;
            mainWin = null;
            app.quit();
        }
    });
}

async function checkActiveWindow(){
    var title = await (activeWin())?.title;
    if(!title) return;
    lo(title);
}

// (async () => {
//     setInterval(checkActiveWindow, 1000)
// })()