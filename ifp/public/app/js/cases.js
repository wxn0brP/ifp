function casesOpen(pos, res){
    const popUp = document.querySelector("#casesPopUp");
    popUp.fadeIn();

    const canvas = document.querySelector("#casesPopUp canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 200;

    display(pos, res);
    
    function display(possibilities, result){
        const resultIndex = 45;
        const availableItems = generateItems(possibilities, resultIndex);
        const itemImg = {};
        loadImg();

        function generateItems(possibilities, resultIndex){
            const items = [];
            const totalProbability = possibilities.reduce((sum, option) => sum + option.per, 0);

            for(let i=1; i<=50; i++){
                const randomValue = Math.random() * totalProbability;
                let cumulativeProbability = 0;

                for(const option of possibilities){
                    cumulativeProbability += option.per;

                    if(randomValue <= cumulativeProbability){
                        items.push(option.name);
                        break;
                    }
                }
            }

            items[resultIndex] = result;
            return items;
        }

        function loadImg(){
            for(let i=0; i<possibilities.length; i++){
                const img = new Image();
                img.src = location.origin + "/cases/" + possibilities[i].name + ".png";
                itemImg[possibilities[i].name] = img;
            }
        }

        function drawItems(x){
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for(let i=0; i<availableItems.length; i++){
                const itemX = x + i * 200;
                const item = availableItems[i];
                const img = itemImg[item];
                ctx.fillStyle = i % 2 == 0 ? "#f0f0f0" : "#e0e0e0";
                ctx.fillRect(itemX, 0, 200, 200);
                ctx.drawImage(img, itemX+25, 25, 150, 150);
            }

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            const middleX = canvas.width / 2;
            ctx.moveTo(middleX, 0);
            ctx.lineTo(middleX, canvas.height);
            ctx.stroke();
        }

        function rand(min, max){
            if(min > max) [min, max] = [max, min];
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function animate(){
            let x = 0;
            let speed = 41.2; // 2 - 6
            speed += rand(0, 4) / 10;
            
            let acceleration = 0.1;

            function update(){
                drawItems(x);
                x -= speed;

                if(speed > 0.1){
                    speed -= acceleration;
                    requestAnimationFrame(update);
                }else{
                    speed = 0;
                    setTimeout(() => {
                        popUp.fadeOut();
                    }, 4444);
                }

            }

            update();
        }

        animate();
    }
}