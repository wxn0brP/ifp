function userProfile(profile){
    socket.emit("getProfile", profile);
    const profileDiv = document.querySelector("#userProfile");
    profileDiv.fadeIn();

    function close(){
        profileDiv.fadeOut();
        document.body.removeEventListener("click", close);
    }
    setTimeout(() => {
        document.body.addEventListener("click", close);
    }, 1000);
}

document.querySelector("#userProfile").addEventListener("click", (e) => e.stopPropagation());