const { readFileSync } = require('fs');
const mm = require("music-metadata");

async function Init(){
    await st();
    io.of("/radio").on("connection", (s) => onConnection(s));
}
var getSocket = () => io.of("/radio").sockets;

function random(min, max){
    return Math.round(Math.random() * (max-min) + min);
}

let songList = require("../../data/song.json");
let current_song;
let timeout;
let songIndex = random(0, songList.length-1);
let song_started_time;

async function newSong(){
    try{
        let song = songList[songIndex];
        let songPath = "music/"+song+".mp3";
        let buff_temp = readFileSync(songPath);
        let m_tmp = await mm.parseBuffer(buff_temp);
        let song_data = readFileSync(songPath);
        
        const cs = {
            name: song,
            length: (m_tmp.format.duration || 0) * 1000,
            data: song_data,
            metadata: {
                title: song,
            }
        };
        current_song = cs;
        return cs;
    }catch{
        songIndex++;
        if(songIndex >= songList.length){
            songIndex = 0;
        }
        return await newSong();
    }
}

async function to(){
    songIndex++;
    if(songIndex >= songList.length){
        songIndex = 0;
    }
    const d = await st();
    song_started_time = Date.now();
    
    getSocket().forEach((client) => {
        client.emit("New-Song", d.name);
    });
}

async function st(){
    const d = await newSong();
    song_started_time = Date.now();
    
    timeout = setTimeout(async () => {
        await to();
    }, d.length);
    
    return d;
}

function onConnection(socket){
    socket.on("disconnect", () => sendUsersInfo());
    sendUsersInfo();
    
    socket.on("Start", () => {
        socket.emit("New-Song", current_song?.name);
    });
    
    socket.on("Fetch-Song", () => {
        socket.emit("Song-Data", current_song.data.toString("base64"));
        socket.emit("Song-Position", song_started_time);
        socket.emit("Metadata", JSON.stringify(current_song?.metadata));
        socket.emit("Users-Online", getSocket().size);
    });
}

function sendUsersInfo(){
    getSocket().forEach((client) => {
        client.emit("Users-Online", getSocket().size);
    });
}

Init();