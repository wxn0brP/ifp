var toChat = "main";
var toChatChannel = "main";

const localUser = {
    fr: localStorage.getItem("from") || null,
    id: localStorage.getItem("user_id"),
}

const config = {
    debug: localStorage.getItem("config.debug") == "true"
}

const messCount = 50;
var actMess = 0;
var isType = false;
var notSound = false;

const serversId = {};
const friendsId = {};
const inputChat = {};

var socrollBlock = false;

var resMsgId;

var emocjiMap = JSON.parse(cw.get("/emocji/emocji.json"));
var emocjiMapR = JSON.parse(cw.get("/emocji/emocjiR.json"));
const edit_txt = '&nbsp;&nbsp;<span style="font-size: 0.5rem; cursor: default;" title="$$">(edytowane)</span>';

const sounds = {
    notifVaw: new Audio("/notif.wav"),
    join: new Audio("/join.mp3"),
    leave: new Audio("/leave.mp3"),
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
sounds.init();

const confetti = new Confetti("confetti");
confetti.setFade(true);
confetti.destroyTarget(false);
confetti.setCount(250);
confetti.setSize(1);
confetti.setPower(20);
confetti.maxsiu = false;

var socketUrl = "/";