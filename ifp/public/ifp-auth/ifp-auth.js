function getToken(){
    return new Promise((resolve) => {
        window.addEventListener('ifp-auth', function(event){
            resolve(event.detail);
        });
    });
}

async function initFrame(path="./"){
    var ifp_frame = document.getElementById("ifp-auth");
    ifp_frame.src = path;
    ifp_frame.style.width = "500px";
    ifp_frame.style.height = "400px";

    lo(await getToken());
}