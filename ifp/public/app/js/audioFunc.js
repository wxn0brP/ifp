function modifyAudioStream(stream, start=1){
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    var gainNode = audioCtx.createGain();
    gainNode.gain.value = start;
    var audioStream = audioCtx.createMediaStreamSource(stream);
    audioStream.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    return (i) => {
        gainNode.gain.value = i;
    };
}