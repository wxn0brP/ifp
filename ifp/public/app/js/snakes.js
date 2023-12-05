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
        setTimeout(end, 200);
    }
    
    const canvas = document.querySelector('#snakesPopUp canvas');
    const ctx = canvas.getContext('2d');

    let blockSize = 20;

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
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
        }
        if(direction) socketSnakes.emit('direction', direction);
    });
}