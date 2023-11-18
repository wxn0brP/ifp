const {
    app,
    BrowserWindow,
    globalShortcut,
    dialog,
    Notification,
    ipcMain,
    Tray,
    Menu,
} = require('electron');
const { autoUpdater } = require('electron-updater');

const activeWin = require('active-win');
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
    mainWin = new BrowserWindow({
        width: 1300,
        height: 700,
        minWidth: 900,
        minHeight: 400,
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

app.on('ready', () => {
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'wxn0brP',
        repo: 'ifp',
        token: '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',
    });
    
    autoUpdater.on('error', (error) => {
        dialog.showErrorBox('Błąd aktualizacji', error == null ? 'Unknown' : (error.stack || error).toString());
    });
    autoUpdater.on('update-not-available', createWindow)
    autoUpdater.checkForUpdatesAndNotify();
});

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