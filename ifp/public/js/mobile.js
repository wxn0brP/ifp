var swipeArea = document.getElementById("app");
var hammer = new Hammer(swipeArea);
hammer.on('swipe', function(event) {
    var style = __("#menu").style();
    if(event.direction === Hammer.DIRECTION_LEFT){
        if(style.left == "0px") mobileMenuToogler();
    }else if(event.direction === Hammer.DIRECTION_RIGHT){
        if(style.left == "-100%") mobileMenuToogler();
    }
});

function mobHTML(){
    __.mobile();
    var actionMob = "none", actionPc = "block";
    if(__.mobile.mob || __.mobile.tab){
        actionMob = "block";
        actionPc = "none";
        __("#menu").style().left = "-100%";
    }
    var all = document.querySelectorAll("mob");
    all.forEach((item) => {
        item.style.display = actionMob;
    });
    all = document.querySelectorAll("pc");
    all.forEach((item) => {
        item.style.display = actionPc;
    });
}
window.addEventListener("resize", mobHTML);
mobHTML();