var ducks = document.querySelectorAll(".duck");
var strzelba = document.getElementById("strzelba");
var scoreD = document.getElementById("score");
var score = 0;

var params = new URLSearchParams(location.search);
if(params.get("l")){
    var l = params.get("l");
    try{
        l = parseInt(l);
        document.documentElement.style.setProperty("--t", l+"px");
    }catch{}
}

ducks = [...ducks].map(duck => {
    var [x, y] = randD();
    duck.style.left = cw.rand(20, 80) + "%";
    duck.style.top = cw.rand(20, 80) + "%";
    return { x, y, duck };
})

ducks.forEach(duck => {
    duck.duck.addEventListener("click", (event) => {
        score++;
        updateScore();
        duck.duck.style.top = cw.rand(20, 80) + "%";
        duck.duck.style.left = cw.rand(20, 80) + "%";
        var [x, y] = randD();
        duck.x = x;
        duck.y = y;
        emulateDuckClick(event.clientX, event.clientY);
    });
})

document.addEventListener("mousemove", (e) => {
    strzelba.style.top = e.clientY + "px";
    strzelba.style.left = e.clientX + "px";
});

function updateScore(){
    scoreD.innerHTML = `Score: ${score}`;
}

document.getElementById("game-container").addEventListener("click", (event) => {
    const clickedDuck = event.target.closest(".duck");
    if(!clickedDuck){
        score = Math.max(0, score - 1);
        updateScore();
    }
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
    })
    
    setTimeout(moveDuck, 100);
}

function randD(){
    var dx = cw.rand(0, 1);
    if(dx == 0) dx = -1;
    var dy = cw.rand(0, 1);
    if(dy == 0) dy = -1;
    return [dx, dy];
}

setInterval(randD, 5000);
moveDuck();
