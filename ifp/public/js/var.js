var inpSendDiv = __("#inpSend");
var errDiv = __("#err");
var msgDiv = __("#msg");
var sendDiv = __("#send");
var main = __.httpReq("main.html");

var fr = localStorage.getItem("from") || null;
var fr_id = localStorage.getItem("user_id");
var to;
window.parent.postMessage({
    type: "setTitle",
    msg: "ifp | "+fr
}, '*');
__("#title").html("ifp | "+fr);
var friendsId = {};
var serversId = {};

var actMess = 0;
const messCount = 50;
var socrollBlock = false;
var reader = null;
var isType = false;
var endCallID;
var resMsgId;

var emocjiMap = JSON.parse(__.httpReq("/emocji/emocji.json"));
var emocjiMapR = JSON.parse(__.httpReq("/emocji/emocjiR.json"));
var confetti = new Confetti("confetti");
confetti.setFade(true);
confetti.destroyTarget(false);
confetti.setCount(250);
confetti.setSize(1);
confetti.setPower(20);
confetti.maxsiu = false;


var inputChat = {};

var privKey;

var sounds = {
    notifVaw: new Audio("notif.wav"),
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