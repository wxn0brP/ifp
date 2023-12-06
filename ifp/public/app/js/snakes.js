function initSnake(){
    const socketSnakes = io("/snake", {
        query: {
            token: sessionStorage.getItem("token"),
            name: localUser.fr,
            rToken: localStorage.getItem("rToken")
        },
        transports: ['websocket'],
        autoConnect: false
    });
    socketSnakes.connect();
    let popUp = document.querySelector("#snakesPopUp");
    popUp.fadeIn();
    popUp.querySelector("button").addEventListener("click", close);

    function end(){
        socketSnakes.disconnect();
        socketSnakes.destroy();
        popUp.fadeOut();
        popUp.querySelector("button").removeEventListener("click", close);
    }

    function close(){
        socketSnakes.emit("direction", "end");
    }
    
    const canvas = document.querySelector('#snakesPopUp canvas');
    const ctx = canvas.getContext('2d');

    var blockSize = 20;
    var directionLast;

    function drawEle(p){
        ctx.fillRect(p.x * blockSize, p.y * blockSize, blockSize, blockSize);
    }

    const headImage = new Image();
    headImage.src = '/favicon.png';

    socketSnakes.on('update', (data) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for(const playerId in data.players){
            const pl = data.players[playerId];
            let head;
            if(playerId == localUser.id){
                if(pl.snake.length > 0){
                    head = pl.snake[0];
                    pl.snake.shift();
                }
                ctx.fillStyle = '#4CAF50';
            }else{
                ctx.fillStyle = '#000000';
            }

            pl.snake.forEach(p => {
                drawEle(p);
            });
            if(head){
                ctx.fillStyle = '#4CFF50';
                drawEle(head);
            }
                
        }

        ctx.fillStyle = '#FF0000';
        ctx.drawImage(
            headImage,
            data.food.x * blockSize - blockSize/3,
            data.food.y * blockSize - blockSize/3,
            blockSize + blockSize/3*2,
            blockSize + blockSize/3*2
        );
    });

    socketSnakes.on("inits", data => {
        canvas.width = (data.x+1) * blockSize;
        canvas.height = (data.y+1) * blockSize;
    });

    socketSnakes.on("end", (p) => {
        end();
        uiMsg("Dzięki za grę! Otrzymujesz +"+p+" pkt.");
    });

    document.addEventListener('keydown', (event) => {
        let direction;
        switch(event.key){
            case 'ArrowUp':
                if(directionLast != "down") directionLast = direction = 'up';
            break;
            case 'ArrowDown':
                if(directionLast != "up") directionLast = direction = 'down';
            break;
            case 'ArrowLeft':
                if(directionLast != "right") directionLast = direction = 'left';
            break;
            case 'ArrowRight':
                if(directionLast != "left") directionLast = direction = 'right';
            break;
        }
        if(direction) socketSnakes.emit('direction', direction);
    });
}

function mobileSnakeBtn(key){
    const event = new KeyboardEvent('keydown', { key });
    document.dispatchEvent(event);
}