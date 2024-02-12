const io = require('socket.io-client');
const lo = console.log;

const socket = io('http://localhost:1478', {
    query: {
        token: "22",
        bot: "true"
    }
});

socket.on('mess', (data) => {
    lo('Otrzymano wiadomość:', data);
    if(data.enc != "plain") return;
    if(data.msg == "ping"){
        let msg = {
            to: "s88yj7-b-9",
            msg: "pong",
            chnl: "s88yj7-v-l"
        }
        socket.emit("mess", msg);
    }
});

socket.on('connect', () => {
    lo('Połączono z serwerem.');
});

socket.on('connect_error', (error) => {
    console.error('Błąd połączenia:', error.toString());
});
