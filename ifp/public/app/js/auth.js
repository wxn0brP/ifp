const token = sessionStorage.getItem("token");
if(!token){
    const next = window.locationNext ? `&next=${locationNext}` : "";
    const rToken = localStorage.getItem("rToken");

    if(!rToken){
        location.href = `/login?err=No_Login!${next}`;
    }else if(!reNewToken(rToken)){
        location.href = `/login?err=Not_Auth!${next}`;
    }
}

function reNewToken(rToken){
    const xhr1 = new XMLHttpRequest();
    xhr1.open("POST", "/validToken", false);
    xhr1.setRequestHeader('Content-Type', 'application/json');
    xhr1.send(JSON.stringify({ rToken }));

    if(xhr1.responseText === "false") return false;

    const from = localStorage.getItem("from");
    const user_id = localStorage.getItem("user_id");

    if(!from || !user_id) return false;

    const xhr2 = new XMLHttpRequest();
    xhr2.open("POST", "/getTempToken", false);
    xhr2.setRequestHeader('Content-Type', 'application/json');
    xhr2.send(JSON.stringify({ from, rToken, user_id }));

    if(xhr2.responseText === "false") return false;

    const renewedToken = xhr2.responseText;
    sessionStorage.setItem("token", renewedToken);
    return true;
}
