const peerVars = {
    pod: "infinite-fusion-project-IFP-",
    stream: null,
    callOk: false,
    micE: true,
    id: "",
    peers: []
}

function makePeerConnect(a, b){
    const peer = new Peer(peerVars.pod+a+"2"+b, {
        secure: true,
        port: 443
    });
    return peer;
}

function connectToNewUser(userId){
    let call = peer.call(pod+userId, my_stream);
    if(!call){
        uiMsg("Nie udało się połączyć!", 1);
        return
    }
    let vid = false;
    call.on('stream', userVideoStream => {
        if(vid) return;
        vid = true;
        addVideoStream(userVideoStream, userId);
    });
    // call.on("close", () => callApi.endF(false));
}

function addVideoStream(stream, user, video=document.createElement('video'), other=true){
    // let setVolume = modifyAudioStream(stream);

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    video.id = "callMedia-user-"+user+"-video";
    document.querySelector("#callContener").appendChild(video);

    // if(other){
    //     let range = document.createElement("input");
    //     range.type = "range";
    //     range.min = "0";
    //     range.max = "3";
    //     range.step = "0.1";
    //     range.value = "1";
    //     range.addEventListener("change", () => {
    //         let v = parseFloat(range.value);
    //         setVolume(v);
    //     });
    //     range.id = "callMedia-user-"+user+"-range";
    //     document.querySelector("#callContenerM").appendChild(range);
    // }else{
    //     setVolume(0);
    // }
    // lo("2 os dołączyła");
}

function joinVC(id){
    debugMsg("Join to "+id);
    socket.emit("joinVC", id);
    peerVars.id = id;
    peerVars.callOk = true;
    navigator.mediaDevices.getUserMedia({
        audio: true,
    })/*.then(stream => {
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
        return stream;
    })*/.then(stream => {
        peerVars.stream = stream;
        let v = document.createElement('video');
        v.muted = true;
        addVideoStream(stream, localUser.id, v, false);
        togleMic(false);
        // setTimeout(() => {
        //     togleMic(false);
        // }, 1000);
    });
}

function makeConnect(to){
    let peer = makePeerConnect(localUser.id, to);
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
            addVideoStream(userVideoStream, to);
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
        addVideoStream(userVideoStream, to)
    });
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

async function calls(){
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

function togleMic(){
    peerVars.micE = !peerVars.micE;
    const audioTracks = peerVars.stream.getAudioTracks();
    audioTracks.forEach(track => {
        track.enabled = peerVars.micE;
    });
    document.querySelector("#togleMic").html("Mic = w" + (peerVars.micE ? "ł" : "ył"));
}

function callEnd(){
    socket.emit("leaveVC", peerVars.id);
    peerVars.callOk = false;
    peerVars.id = "";
    document.querySelector("#callMedia").css("display: none;");
    peerVars.peers.forEach(p => p.destroy());
    peerVars.peers = [];
    if(peerVars.stream) peerVars.stream.getTracks().forEach(t => t.stop());
    document.querySelector("#callContenerM").innerHTML = "";
}