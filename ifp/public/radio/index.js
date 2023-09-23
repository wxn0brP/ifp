var socket = io("/radio");

let ws;
let audio;
let progress = 0;
let vol = 0.2;
let song;

function deleteAudio(){
    if(audio){
        audio.pause();
        audio.src = "";
        audio.currentTime = 0;
        audio = null;
    }
}
deleteAudio();

setInterval(() => {
    try{
        progress = audio.currentTime / audio.duration;
        document.getElementById("progress").value = progress * 100;
    }catch(e){}
}, 5);

setInterval(() => {
    try{
        audio.volume = vol;
    }catch(e){}
}, 10);

socket.on("Song-Data", (mp3) => {
    deleteAudio();
    audio = new Audio();
    audio.setAttribute("crossorigin", "anonymous");
    audio.src = `data:audio/${song.split(".")[song.split(".").length - 1]};base64,${mp3}`;
    audio.volume = 0;
    audio.play();
    audio.addEventListener("ended", () => {
        deleteAudio();
    });
});

socket.on("New-Song", (s) => {
    song = s;
    socket.emit("Fetch-Song");
});

socket.on("Song-Position", (data) => {
    function r(){
        audio.currentTime = (Date.now() - parseInt(data)) / 1000;
    }
    
    let i = setInterval(() => {
        try{
            r();
            clearInterval(i);
        }catch(e){}
    }, 20);
});

socket.on("Metadata", (metadata) => {
    const json = JSON.parse(metadata);
    document.getElementById("current-song").innerHTML = json.title;
});

socket.on("Users-Online", (users) => {
    document.getElementById("connected").innerText = users;
});

var stBt = __("#start");
stBt.style("cursor: pointer;");
function start(){
    socket.emit("Start");
    stBt.g().disabled = true;
    stBt.style("cursor: not-allowed;");
}