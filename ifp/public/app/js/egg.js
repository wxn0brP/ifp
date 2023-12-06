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