var codeDiv = document.querySelector("#code");
var errDiv = document.querySelector("#err");

function validAll(){
    var code = codeDiv.value;
    if(!code) return { err: "Code is required." };
    code = code.trim();

    var pass1 = pass1Div.value;
    if(!pass1) return { err: "Password is required." };
    pass1 = pass1.trim();

    var pass2 = pass2Div.value;
    if(!pass2) return { err: "Confirm Password is required." };
    pass2 = pass2.trim();

    if(pass1 != pass2) return { err: "Passwords do not match." };

    if(getStrength(passTest(pass1)) != 5) return { err: "Password strength is not sufficient." }; // 5 = tests length

    return {
        code,
        password: pass1,
    };
}

document.querySelector("form").on("submit", (e) => {
    e.preventDefault();

    var inputs = validAll();
    if(inputs.err)
        return errDiv.html(inputs.err);

    var { password, code } = inputs;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/reset-kod", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ password, kod: code }));
    var res = JSON.parse(xhr.responseText);
    if(res.err){
        if(res.r){
            alert(res.msg);
            location.href = "/reset";
        }
        return errDiv.html(res.msg);
    }
    location.href = "/login";
});