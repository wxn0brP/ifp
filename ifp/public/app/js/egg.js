function emulateConfettiClick(x=window.innerWidth / 2, y=window.innerHeight / 2){
    var clickEvent = new MouseEvent("click", {
        view: window, bubbles: true, cancelable: true,
        clientX: x, clientY: y,
    });
    document.getElementById("confetti").dispatchEvent(clickEvent);
}

(function(){
    const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    var konamiIndex = 0;
    var block = false;
    document.addEventListener("keydown", checkKonamiCode);
    function checkKonamiCode(event){
        if(block) return;
        if(event.key === konamiCode[konamiIndex]){
            konamiIndex++;
            if(konamiIndex === konamiCode.length){
                block = true;
                startKonami();
                konamiIndex = 0;
            }
        }else{
            konamiIndex = 0;
        }
    }

    function startKonami(){
        fetch('https://cataas.com/cat/says/Cat! Cat! And More Cat!').then(r => r.blob())
        .then(data => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(data);

            let cats = document.querySelector("#cats");
            cats.innerHTML = "";
            cats.appendChild(img);
            
            cats.fadeIn();
            setTimeout(() => {
                cats.fadeOut();
                setTimeout(() => cats.innerHTML = "", 500);
                
            }, 5000);
        }).catch(()=>{});
        setTimeout(() => block = false, 4000);
    }
})();

(function(){
    var click = 0;
    var block = false;
    var active = false;
    document.querySelector("#emocjiMenuM").on("click", () => {
        if(click == 3 && !block){
            document.body.css(active ? "" : "filter: grayscale(100%);");
            block = true;
            active = !active;
            setTimeout(() => block = false, 5_000);
        }else{
            click++;
            setTimeout(() => {
                click = 0;
            }, 1000);
        }
    })
})();

document.querySelector("#goMain").on("dblclick", () => {
    if(confetti.maxsiu) return;
    confetti.maxsiu = true;
    setTimeout(() => {
        confetti.maxsiu = false;
    }, 600);
    confetti.setCount(cw.rand(500, 1000));
    confetti.setSize(cw.rand(1, 2));
    confetti.setPower(cw.rand(15, 30));
    emulateConfettiClick(cw.rand(0, window.innerWidth), cw.rand(0, window.innerHeight));
});

(function(){
    // orginal code: https://codepen.io/MinzCode/pen/dyOgadW
    let canvas, ctx, w, h, particles = [];

    function init(){
        canvas = document.querySelector("#particles");
        ctx = canvas.getContext("2d");
        resizeReset();
        animationLoop();
    }

    function resizeReset(){
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function mousemove(e){
        if(e.buttons != 2) return; // 2 = PPM
        particles.push(new Particle(e.x, e.y));
    }

    function animationLoop(){
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';

        drawScene();
        arrayCleanup();
        requestAnimationFrame(animationLoop);
    }

    function arrayCleanup(){
        let dump = [];
        particles.map((particle) => {
            if(particle.radius > 0)
                dump.push(particle);
        });
        particles = dump;
    }

    function drawScene() {
        particles.map((particle) => {
            particle.update();
            particle.draw();
        })
    }

    class Particle{
        constructor(x, y){
            this.x = x;
            this.y = y;
            this.radius = 3;
            this.size = 0;
            this.rotate = 0;
            this.alpha = 0.5;
        }
        setPoint(){
            let r, x, y;
            this.point = [];
            for(let a = 0; a < 360; a += 36){
                let d = ((a / 36) % 2 === 0) ? this.size : this.size / 2;
                r = (Math.PI / 180) * (a + this.rotate);
                x = this.x + d * Math.sin(r);
                y = this.y + d * Math.cos(r);
                this.point.push({x: x, y: y, r: this.radius});
            }
        }
        draw(){
            if(this.radius <= 0) return;
            this.point.map((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(5, 100%, 50%, ${this.alpha})`;
                ctx.fill();
                ctx.closePath();
            });

            ctx.beginPath();
            for(let i = 0; i < this.point.length; i++){
                if(i === 0)
                    ctx.moveTo(this.point[i].x, this.point[i].y);
                else 
                    ctx.lineTo(this.point[i].x, this.point[i].y);
            }
            ctx.closePath();
            ctx.strokeStyle = `hsla(5, 100%, 50%, ${this.alpha})`;
            ctx.stroke();
        }
        update(){
            this.setPoint();
            this.radius -= .04;
            this.size += .7;
            this.rotate -= 2;
            this.alpha = (this.radius * 0.5 < 0.5) ? this.radius * 0.5 : 0.5;
        }
    }

    window.addEventListener("resize", resizeReset);
    window.addEventListener("mousemove", mousemove);
    setTimeout(init, 100);
})();