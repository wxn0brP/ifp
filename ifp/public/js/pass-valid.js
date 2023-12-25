var meter = document.querySelector("#strength-meter");
var pass1Div = document.querySelector("#pass1");
var pass2Div = document.querySelector("#pass2");

pass1Div.on("input", checkPasswordStrength);

function checkPasswordStrength(){
    var password = pass1Div.value;
    var pass = passTest(password);

    updateRequirement("length-req", pass.lengthReq);
    updateRequirement("lowercase-req", pass.lowercaseReq);
    updateRequirement("uppercase-req", pass.uppercaseReq);
    updateRequirement("number-req", pass.numberReq);
    updateRequirement("special-req", pass.specialReq);

    meter.value = getStrength(pass);
}

function getStrength(pass){
    var { lengthReq, lowercaseReq, uppercaseReq, numberReq, specialReq } = pass;
    var strength = [lengthReq, lowercaseReq, uppercaseReq, numberReq, specialReq].filter(Boolean).length;
    return strength;
}

function updateRequirement(requirementId, isFulfilled){
    var requirementElement = document.querySelector("#"+requirementId);
    requirementElement.classList.remove("v");
    requirementElement.classList.remove("x");
    requirementElement.classList.add(isFulfilled ? "v" : "x");
}

function passTest(password){
    return {
        lengthReq: password.length >= 8,
        lowercaseReq: /[a-z]/.test(password),
        uppercaseReq: /[A-Z]/.test(password),
        numberReq: /[0-9]/.test(password),
        specialReq: /[^a-zA-Z0-9]/.test(password),
    }
}

checkPasswordStrength();

function passVis(n){
    let ele = document.querySelector("#pass"+n);
    ele.type = ele.type == "text" ? "password" : "text";
}