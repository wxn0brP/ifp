var toChat = "main";

const localUser = {
    fr: localStorage.getItem("from") || null,
    id: localStorage.getItem("user_id"),
}

const messCount = 50;
var actMess = 0;

const serversId = {};
const friendsId = {};
const inputChat = {};

var socrollBlock = false;

var resMsgId;

var emocjiMap = JSON.parse(cw.get("/emocji/emocji.json"));
var emocjiMapR = JSON.parse(cw.get("/emocji/emocjiR.json"));
const edit_txt = '&nbsp;&nbsp;<span style="font-size: 0.5rem;">(edytowane)</span>';

const sounds = {
    notifVaw: new Audio("/notif.wav"),
    lektor: new SpeechSynthesisUtterance(),

    init(){
        this.notifVaw.volume = ifpSettings.main["głośność powiadomień"] / 100;
        this.lektor.lang = "pl-PL";
    },

    lektorSpeak(data){
        this.lektor.text = data;
        speechSynthesis.speak(this.lektor);
    }
}
var reader = null;
sounds.init();