var loginDiv = document.querySelector("#login");
var emailDiv = document.querySelector("#email");
var errDiv = document.querySelector("#err");


function validAll(){
    var login = loginDiv.value;
    if(!login) return { err: "Login is required." };
    if(!/^[a-zA-Z0-9]+$/.test(login)) return { err: "Login can only contain letters and numbers." };

    login = login.trim();
    if(login.length < 3 || login.length > 10) return { err: "Login must be between 3 and 10 characters." };

    var email = emailDiv.value;
    if(!email) return { err: "Email is required." };
    email = email.trim();

    var pass1 = pass1Div.value;
    if(!pass1) return { err: "Password is required." };
    pass1 = pass1.trim();

    var pass2 = pass2Div.value;
    if(!pass2) return { err: "Confirm Password is required." };
    pass2 = pass2.trim();

    if(pass1 != pass2) return { err: "Passwords do not match." };

    if(getStrength(passTest(pass1)) != 5) return { err: "Password strength is not sufficient." }; // 5 = tests length

    return {
        login,
        password: pass1,
        email
    };
}

document.querySelector("form").on("submit", (e) => {
    e.preventDefault();

    var inputs = validAll();
    if(inputs.err)
        return errDiv.html(inputs.err);

    var { login, password, email } = inputs;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/register", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ name: login, password, email }));
    var res = JSON.parse(xhr.responseText);
    if(res.err)
        return errDiv.html(res.msg);
    location.href = "/register-code";
});