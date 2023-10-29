function popUpSetUp(div){
    div.fadeIn();

    function close(){
        div.fadeOut();
        document.body.removeEventListener("click", close);
    }
    setTimeout(() => {
        document.body.addEventListener("click", close);
    }, 500);

    div.addEventListener("click", (e) => e.stopPropagation());
}

function userProfile(profile){
    socket.emit("getProfile", profile);
    const profileDiv = document.querySelector("#userProfile");
    popUpSetUp(profileDiv);
}

function showStatusPopUp(){
    const statusPopUp = document.querySelector("#statusPopUp");
    popUpSetUp(statusPopUp);
}

function setStatus(){
    let data = document.querySelector('#statusPopUp_status').value;
    let type = document.querySelector('#statusPopUp_typ').value;
    socket.emit('setStatus', data, type)
}