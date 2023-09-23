__("#goMain").on("dblclick", () => {
    if(confetti.maxsiu) return;
    confetti.maxsiu = true;
    setTimeout(() => {
        confetti.maxsiu = false;
    }, 600);
    confetti.setCount(__.math.rand(500, 1000));
    confetti.setSize(__.math.rand(1, 2));
    confetti.setPower(__.math.rand(15, 30));
    emulateConfettiClick(__.math.rand(0, window.innerWidth), __.math.rand(0, window.innerHeight));
});

(function(){
    var click = 0;
    var block = false;
    var active = false;
    __("#emocjiMenuM").on("click", () => {
        if(click == 3 && !block){
            __("body").style(active ? "" : "filter: grayscale(100%);");
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

(function(){
    const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    var konamiIndex = 0;
    var block = false;
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
        var ducks = [];
        for(var i=0; i<10; i++){
            var div = document.createElement("div");
            div.innerHTML = `
            <svg id="ifp-duck" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <use xlink:href="img/duck.svg#ifp-duck" />
            </svg>
            `;
            div.style.position = "absolute";
            div.style.zIndex = "500";
            div.style.transform = "translate(-50%, -50%)";
            div.style.transition = "0.5s";
            div.style.cursor = "pointer";
            __("#app").add(div);
            ducks.push(div);
        }

        ducks = [...ducks].map(duck => {
            var x = __.math.rand(0, 1);
            if(x == 0) dx = -1;
            var y = __.math.rand(0, 1);
            if(y == 0) y = -1;
            duck.style.left = __.math.rand(10, 90) + "%";
            duck.style.top = __.math.rand(10, 90) + "%";
            return { x, y, duck };
        });

        function moveDuck(){
            ducks.forEach(duck => {
                var l = duck.duck.style.left.replace("%","");
                var t = duck.duck.style.top.replace("%","");
                l = parseInt(l);
                t = parseInt(t);
                l += duck.x;
                t += duck.y;
                if(l <= 10){
                    duck.x = 1;
                }else if(l >= 90){
                    duck.x = -1;
                }
                if(t <= 10){
                    duck.y = 1;
                }else if(t >= 90){
                    duck.y = -1;
                }
            
                duck.duck.style.transform = "scaleX("+duck.x*-1+")";
            
                duck.duck.style.left = l + "%";
                duck.duck.style.top = t + "%";
            });
            if(ducks.length > 0) setTimeout(moveDuck, 20);
        }
        setTimeout(() => {
            ducks.forEach(d => {
                var duck = d.duck;
                var x = parseInt(duck.style.left.replace("%",""));
                var y = parseInt(duck.style.top.replace("%",""));
                emulateConfettiClick(x*window.innerWidth/100, y*window.innerHeight/100);
                duck.remove();
            });
            ducks = [];
            block = false;
        }, 6_000);
        moveDuck();
    }

    document.addEventListener("keydown", checkKonamiCode);
})();