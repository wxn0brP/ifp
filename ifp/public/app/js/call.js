const callApi = {
    mic: ()=>{},
    end: ()=>{},
    call: ()=>{},
    endF: ()=>{},
    peers: [],
    micE: false
};

/*
const $01f0d223090cb1f8$var$DEFAULT_CONFIG = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        },
        {
            urls: [
                "turn:eu-0.turn.peerjs.com:3478",
                "turn:us-0.turn.peerjs.com:3478"
            ],
            username: "peerjs",
            credential: "peerjsp"
        }
    ],
    sdpSemantics: "unified-plan"
};
 */

function callInit(){
    callFunc(fr_id);
}

function callTo(){
    if(!toChat.startsWith("$")) return alert("Musisz wejść w czat z daną osobą!");
    socket.emit("callTo", toChat.replace("$",""));
    endCallID = toChat.replace("$","");
    var callBtn = document.getElementById("callToBtn");
    callBtn.disabled = true;
    setTimeout(() => {
        callBtn.disabled = false;
    }, 15_000);
    uiMsg("Dzwonienie...");
}

function togleMic(){
    callApi.micE = !callApi.micE;
    callApi.mic(callApi.micE);
    __("#togleMic").html("Mic = w" + (callApi.micE ? "ł" : "ył"));
}

function callEnd(){
    callApi.end();
    __("#callMedia").style("display: none;");
}

callApi.endF = (e) => {
    uiMsg("2 osoba rozłączyła się", 2);
    callEnd();
}

function callFunc(idM){
    let pod = "infinite-fusion-project-IFP-";
    const peer = new Peer(pod+idM, {
        secure: true,
        port: 443
    });
    callApi.peers.forEach(e => e.destroy());
    callApi.peers.push(peer);

    let vidDiv = document.getElementById("callContener");
    vidDiv.innerHTML = "";
    let my_stream;
    let my_call;
    let myVideo = document.createElement('video');
    myVideo.muted = true;

    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(stream => {
        peer.on('call', call => {
            addVideoStream(stream, myVideo);
            let vid = false;
            call.answer(stream);
            call.on('stream', userVideoStream => {
                if(vid) return;
                vid = true;
                addVideoStream(userVideoStream)
            });
            call.on("close", () => callApi.endF(true))
            my_call = call;
        });
        my_stream = stream;
        mic(false);
    });

    function connectToNewUser(userId){
        let call = peer.call(pod+userId, my_stream);
        let vid = false;
        call.on('stream', userVideoStream => {
            if(vid) return;
            vid = true;
            addVideoStream(userVideoStream)
        });
        call.on("close", () => callApi.endF(false));
        my_call = call;
    }

    function addVideoStream(stream, video=document.createElement('video')){
        video.srcObject = stream 
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        vidDiv.appendChild(video);
        uiMsg("2 os dołączyła");
    }

    function mic(en){
        const audioTracks = my_stream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = en;
        });
    }

    function end(){
        if(!my_call) return;
        my_call.close();
        my_stream.getTracks().forEach(t=>t.stop());
        peer.destroy(true);
    }

    callApi.call = connectToNewUser;
    callApi.mic = mic;
    callApi.end = end;
}