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
        alert("koniami")
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