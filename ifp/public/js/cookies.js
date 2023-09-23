if(localStorage.getItem("cookie-accepted") != "true"){
    // __('#cookie-message').style('display: block;');
}

function acceptCookie(){
    __('#cookie-message').style('display: none;');
    localStorage.setItem("cookie-accepted", "true");
}