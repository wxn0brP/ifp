async function popUpSetUp(div, end=()=>{}){
    if(popUpCloceFn){
        popUpCloceFn();
        await delay(1000);
    }
    div.fadeIn();

    function close(){
        div.fadeOut();
        document.body.removeEventListener("click", close);
        end();
        setTimeout(() => {
            popUpCloceFn = null;
        }, 500);
    }
    setTimeout(() => {
        document.body.addEventListener("click", close);
    }, 500);

    div.addEventListener("click", (e) => e.stopPropagation());
    popUpCloceFn = close;
    return close;
}

var popUpCloceFn;
function clsPopUp(){
    if(popUpCloceFn) popUpCloceFn();
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

var dailyBtn = document.querySelector("#casesHubDaily");

document.querySelector("#casesHubDaily").on("click", () => {
    socket.emit('box_open', 'daily');
    clsPopUp();
})