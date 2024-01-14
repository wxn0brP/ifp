const valid = require("../../validData");

const gameConf = {
    x: 40,
    y: 40
}

const games = [];

function generateFood(){
    return {
        x: Math.floor(Math.random() * gameConf.x),
        y: Math.floor(Math.random() * gameConf.y),
    };
}

function updateGame(){
    for(let gg=0; gg<games.length; gg++){
        let players = games[gg].players;
        for(const playerId in players){
            const player = players[playerId];
            let dx = 0;
            let dy = 0;
            switch(player.direction){
                case "up":
                    dy = -1;
                    break;
                case "down":
                    dy = 1;
                    break;
                case "left":
                    dx = -1;
                    break;
                case "right":
                    dx = 1;
                    break;
                case "end":
                    endGame(player, playerId);
                    return;
                
            }

            const head = { x: player.snake[0].x + dx, y: player.snake[0].y + dy };
            games[gg].players[playerId].snake.unshift(head);

            if(player.snake[0].x === games[gg].food.x && player.snake[0].y === games[gg].food.y) {
                games[gg].food = generateFood();
            }else{
                games[gg].players[playerId].snake.pop();
            }

            let x = player.snake[0].x;
            let y = player.snake[0].y;
            if(x > gameConf.x) games[gg].players[playerId].snake[0].x = 0;
            if(x < 0) games[gg].players[playerId].snake[0].x = gameConf.x;
            if(y > gameConf.y) games[gg].players[playerId].snake[0].y = 0;
            if(y < 0) games[gg].players[playerId].snake[0].y = gameConf.y;
            
            
            if(snakeDamgage(player.snake)){
                endGame(player, playerId);
            }
            
        }
        sendSockRoom(games[gg].name, "update", games[gg]);
    }
}

function endGame(player, playerId){
    let length = player.snake.length / 7;
    length = Math.floor(length);
    global.getSocket(playerId, "snake").forEach(s => s.emit("end", length));
    (async () => {
        let ok = await global.db.userGold.updateOne({ id: playerId }, obj => {
            obj.gold += length;
            return obj;
        });
        if(!ok) await global.db.userGold.add({ id: playerId, gold: length, items: [], daily: "0"});
    })();
}

function snakeDamgage(snake){
    let head = snake[0];
    for(let i=1; i<snake.length; i++) 
        if(snake[i].x === head.x && snake[i].y === head.y) return true;
    return false; 
}

setInterval(updateGame, 100);

function getSockInRoom(room){
    var map = io.of("/snake").sockets;
    var all = [...map].map(([key, value]) => {
        value.ids = key;
        return value;
    });

    var res = all.filter(element => {
        return element.snakeRoom == room;
    });
    return res;
}

function sendSockRoom(room, chanel, ...more){
    var sockse = getSockInRoom(room);
    sockse.forEach(socket => {
        socket.volatile.emit(chanel, ...more);
    });
}

function getSesion(){
    function gen(){
        let a = {
            players: {},
            food: generateFood(),
            name: Math.floor(Math.random() * Math.pow(gameConf.y, 5))
        }
        games.push(a);
        return a;
    }
    if(games.length == 0) return gen();
    for(let i=0; i<games.length; i++)
        if(Object.keys(games[i].players).length < 5) return games[i];
    
    return gen();
}

io.of("/snake").use((socket, next) => {
    var { rToken, name, token } = socket.handshake.query;
    if(!token || !name || !rToken){
        return next(new Error(`valid`));
    }
    var hashBase = global.tokens.veryTemp(token);
    if(!hashBase){
        return next(new Error(`token`));
    }
    if(hashBase.user.name != name){
        return next(new Error(`token.`));
    }
    socket.user = hashBase.user;
    socket.rToken = rToken;

    next();
})

io.of("/snake").on("connection", socket => {
    const playerId = socket.user._id;
    var sesion = getSesion();
    socket.snakeRoom = sesion.name;

    if(global.getSocket(socket.user._id, "snake").length == 1){
        sesion.players[playerId] = {
            direction: 'right',
            snake: [{ x:0, y:0 }],
        }
    }
    socket.emit('inits', gameConf);
    socket.on('direction', (direction) => {
        if(!valid.str(direction, 0, 30)) return socket.emit("error", "valid data");

        let game = games.find(obj => obj.name == socket.snakeRoom);
        game.players[playerId].direction = direction;
    });

    socket.on('disconnect', () => {
        if(global.getSocket(socket.user._id, "snake").length > 0) return;
        var game = games.find(obj => obj.name == socket.snakeRoom);
        delete game.players[socket.user._id];
        if(Object.keys(game.players).length == 0){
            let gameI = games.findIndex(g => game.name == g.name);
            games.splice(gameI, 1);
        }
    });
});