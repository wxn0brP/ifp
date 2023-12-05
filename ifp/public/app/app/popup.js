function popUpSetUp(div, end=()=>{}){
    div.fadeIn();

    function close(){
        div.fadeOut();
        document.body.removeEventListener("click", close);
        end();
    }
    setTimeout(() => {
        document.body.addEventListener("click", close);
    }, 500);

    div.addEventListener("click", (e) => e.stopPropagation());
    return close;
}

function userProfile(profile){
    socket.emit("getProfile", profile);
    const profileDiv = document.querySelector("#userProfile");
    popUpSetUp(profileDiv);
    document.querySelector("#userProfile_ifp_id").innerHTML = profile;
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