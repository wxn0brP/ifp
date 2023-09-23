var mess = __("#mess");
var inpSend = __("#inpSend");

function getData(que){
    que = que.replaceAll(" ", "+");
    var res = __.httpReq("/chatBot?q="+que);
    res = JSON.parse(res);
    if(res.err) return null;
    return res.data;
}

function getRespone(){
    var dataS = inpSend.value();
    inpSend.value("");
    var data = getData(dataS);
    if(data == null) return;

    var div = document.createElement("div");

    var divUser = document.createElement("div");
    divUser.innerHTML = "User: "+dataS;
    div.appendChild(divUser);

    var divBot = document.createElement("div");
    divBot.innerHTML = "Bot: "+changeText(data.replaceAll("$", "#"));
    div.appendChild(divBot);

    var br1 = document.createElement("br");
    var br2 = document.createElement("br");
    div.appendChild(br1);
    div.appendChild(document.createElement("hr"));
    div.appendChild(br2);
    
    mess.add(div);
	div.scrollIntoView({behavior: "smooth"});
}

inpSend.on("keypress", (e) => {
    if(e.key === "Enter"){
        e.preventDefault();
        getRespone();
    }
});

function focus(){
    __.mobile();
    if(__.mobile.tab || __.mobile.tel) return;
    inpSend.res.focus();
}
