function modifyAudioStream(stream){
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    var gainNode = audioCtx.createGain();
    gainNode.gain.value = 1;
    var audioStream = audioCtx.createMediaStreamSource(stream);
    audioStream.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    return (i) => {
        gainNode.gain.value = i;
    };
}