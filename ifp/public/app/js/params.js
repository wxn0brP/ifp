function urlParams(){
    let params = new URLSearchParams(location.search);
    if(params.get("calls")){
        let b = document.createElement("button");
        b.innerHTML = "join";
        b.addEventListener("click", () => {
            joinVC("tak");
        })
        document.querySelector("#friends-main").appendChild(b);
    }

}



urlParams();