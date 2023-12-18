const peerVars = {
    pod: "infinite-fusion-project-IFP-",
    stream: null,
    callOk: false,
    micE: true,
    cameraE: true,
    id: "",
    peers: []
}

function makePeerConnect(a, b){
    const peer = new Peer(peerVars.pod+a+"2"+b, {
        secure: true,
        port: 443,
        restartIce: true,
    });
    return peer;
}

function addVideoStream(stream, user, r, video=document.createElement('video'), other=true){
    let setVolume = modifyAudioStream(stream, other ? undefined : 0);
    video.classList.add("__"+r);
    video.controls = true;
    video.style.maxWidth = "300px";

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    video.id = "callMedia-user-"+user+"-video";
    document.querySelector("#callContener").appendChild(video);

    debugMsg(user + " :: "+other);
    if(other){
        let range = document.createElement("input");
        range.type = "range";
        range.min = "0";
        range.max = "3";
        range.step = "0.1";
        range.value = "1";
        range.addEventListener("change", () => {
            let v = parseFloat(range.value);
            setVolume(v);
        });
        range.id = "callMedia-user-"+user+"-range";
        document.querySelector("#callContenerM").appendChild(range);
    }
    // lo("2 os dołączyła");
}

async function joinVC(id){
    debugMsg("Join to "+id);
    socket.emit("joinVC", id);
    peerVars.id = id;
    peerVars.callOk = true;
    let stream;
    try{
        // stream = await getStream({ audio: true, video: true });
        stream = await getDevice();
    }catch(e){
        alert(e);
    }
    
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var audioStream = audioCtx.createMediaStreamSource(stream);

    const analyserNode = audioCtx.createAnalyser();
    audioStream.connect(analyserNode);

    var gainNode = audioCtx.createGain();
    audioStream.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const pcmData = new Float32Array(analyserNode.fftSize);
    const meter = document.querySelector("#callMeter");
    setInterval(() => {
        analyserNode.getFloatTimeDomainData(pcmData);
        let sumSquares = 0.0;
        for(const amplitude of pcmData){
            sumSquares += amplitude * amplitude;
        }
        let vol = Math.sqrt(sumSquares / pcmData.length);
        vol = cw.round(vol, 2);
        meter.value = vol * 10;
        //gainNode.gain.value = vol >= 0.01 ? 1 : 0;
    }, 50);
    
    peerVars.stream = stream;
    let v = document.createElement('video');
    v.muted = true;
    addVideoStream(stream, localUser.id, "joinVC", v, false);
    togleMic();
    toggleCam();
}

function makeConnect(to){
    let peer = makePeerConnect(localUser.id, to);
    peer.IFP_id = to;
    peerVars.peers.push(peer);
    peer.on('open', (id) => {
        console.log("my id:", id);
    });
    
    peer.on('call', call => {
        let vid = false;
        call.answer(peerVars.stream);
        call.on('stream', userVideoStream => {
            if(vid) return;
            vid = true;
            debugMsg("add stream, peer on call");
            addVideoStream(userVideoStream, to, "makeConnect");
        });
        // call.on("close", () => callApi.endF(true))
    });

    peer.on("close", () => {
        lo("close in per")
        // setTimeout(() => {
        //     if(socket.connected) peer.reconnect();
        // }, 1000);
    })
    return peer;
}

function callTor(to, peer){
    let ids = peerVars.pod + to + "2" + localUser.id;
    let call = peer.call(ids, peerVars.stream);
    let vid = false;
    call.on('stream', userVideoStream => {
        if(vid) return;
        vid = true;
        debugMsg("add stream, mt")
        addVideoStream(userVideoStream, to, "callTor")
    });
    call.on("iceConnectionStateChange", () => {
        if(call.iceConnectionState === 'failed' || call.iceConnectionState === 'disconnected'){
            console.log('Wystąpiły problemy z połączeniem. Restartuję ICE...');
            call.restartIce();
        
            // Możesz również zamknąć istniejące połączenie i ponownie nawiązać połączenie, jeśli to konieczne
            // call.close(); // Zamknij istniejące połączenie
            // Następnie ponownie nawiąż połączenie z peer.call('inny_peer_id', yourStream);
          }
    })
    // call.on("close", () => callApi.endF(false));
}

async function getChatIdFriends(t){
    return new Promise(resolve => {
        socket.once("getChatIdFriends", (id) => {
            resolve(id)
        });
        socket.emit("getChatIdFriends", t);
    });
}

async function callToFunc(){
    if(toChat == "main") return uiMsg("err");
    callEnd();
    var callBtn = document.getElementById("callToBtn");
    callBtn.disabled = true;
    setTimeout(() => {
        callBtn.disabled = false;
    }, 5_000);
    uiMsg("Dołącznie...");

    let to = await getChatIdFriends(toChat);
    joinVC(to+"-main");
    if(toChat.startsWith("$")){
        socket.emit("callTo", toChat.replace("$",""), to+"-main");
    }

    document.querySelector("#callMedia").css("");
}

function serverCall(to){
    joinVC(to+"-main");
    document.querySelector("#callMedia").css("");
}

function togleMic(){
    peerVars.micE = !peerVars.micE;
    const audioTracks = peerVars.stream.getAudioTracks();
    audioTracks.forEach(track => {
        track.enabled = peerVars.micE;
    });
    document.querySelector("#togleMic").html("Mic = w" + (peerVars.micE ? "ł" : "ył"));
}

function toggleCam(){
    peerVars.cameraE = !peerVars.cameraE;
    const videoTracks = peerVars.stream.getVideoTracks();

    videoTracks.forEach(track => {
        track.enabled = peerVars.cameraE;
    });

    document.querySelector("#toggleCamera").html("Camera = w" + (peerVars.cameraE ? "ł" : "ył"));
}


function callEnd(){
    socket.emit("leaveVC", peerVars.id);
    peerVars.callOk = false;
    peerVars.id = "";
    document.querySelector("#callMedia").css("display: none;");
    peerVars.peers.forEach(p => p.destroy());
    peerVars.peers = [];
    if(peerVars.stream){
        peerVars.stream.getTracks().forEach(t => t.stop());
        peerVars.stream = undefined;
    }
    document.querySelector("#callContener").innerHTML = "";
    document.querySelector("#callContenerM").innerHTML = "";
}

async function getStream(obj){
    if(navigator.mediaDevices?.getUserMedia) return await navigator.mediaDevices.getUserMedia(obj);
    else if(navigator.webkitGetUserMedia) return await navigator.webkitGetUserMedia(obj);
    else if(navigator.mozGetUserMedia) return await nnavigator.mozGetUserMedia(obj);
    else return new MediaStream();
}

async function getDevice(re=false){
    return new Promise(async (res) => {
        await getStream({ audio: true, video: true });
        let devices = await navigator.mediaDevices.enumerateDevices();
        let audio = devices.filter(device => device.kind === 'audioinput');
        let video = devices.filter(device => device.kind === 'videoinput');
        let deivceSelect_audio = document.querySelector("#deivceSelect_audio");
        let deivceSelect_video = document.querySelector("#deivceSelect_video");
        let closePop = document.querySelector("#deivceSelect");
        closePop.fadeIn();

        function createOption(device){
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.text = device.label;
            return option;
        }
        deivceSelect_audio.innerHTML = "";
        deivceSelect_video.innerHTML = "";

        audio.forEach(device => {
            let opt = createOption(device);
            deivceSelect_audio.appendChild(opt);
        });
        video.forEach(device => {
            let opt = createOption(device);
            deivceSelect_video.appendChild(opt);
        });

        document.querySelector("#deivceSelect_ok").on("click", async () => {
            var audioSource = deivceSelect_audio.value;
            var videoSource = deivceSelect_video.value;
            if(!audioSource || !videoSource) return;

            const constraints = {
                audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
                video: {deviceId: videoSource ? {exact: videoSource} : undefined}
            };
            
            var newStream = await getStream(constraints);
            
            if(peerVars.stream){
                peerVars.stream.getAudioTracks().forEach(track => peerVars.stream.removeTrack(track));
                peerVars.stream.getVideoTracks().forEach(track => peerVars.stream.removeTrack(track));
                newStream.getTracks().forEach(track => peerVars.stream.addTrack(track));
            }
            res(newStream);
            closePop.fadeOut();

            if(re){
                peerVars.peers.forEach(peerS => {
                    let id = peerS.IFP_id;
                    peerS.destroy();
                    let peer = makeConnect(id);
                    callTor(id, peer);
                })
            }
        });
    })
}

