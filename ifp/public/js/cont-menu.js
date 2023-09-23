var contMenu = {
    mess: (menu, id, e) => {
        window.getSelection().removeAllRanges();
        var style = menu ? "" : "none";
        document.querySelectorAll(".messMenuA").forEach(e => e.style.display=style);

        var messMenu = document.getElementById("messMenu");
        messMenu.setAttribute("w_id", id);
        messMenu.style.display = "block";

        menuMax(e, messMenu);

        function click(){
            document.removeEventListener("click", click);
            messMenu.style.display = "none";
        }

        document.addEventListener("click", click);
    },

    server: (id, e) => {
        window.getSelection().removeAllRanges();

        var serverMenu = document.getElementById("serverMenu");
        serverMenu.setAttribute("w_id", id);
        serverMenu.style.display = "";

        menuMax(e, serverMenu);

        function click(){
            document.removeEventListener("click", click);
            serverMenu.style.display = "none";
        }

        document.addEventListener("click", click);
    }
}

function menuMax(e, doc){
    var x = e.clientX;
    var y = e.clientY;
    var w = doc.clientWidth;
    var h = doc.clientHeight;

    doc.style.left = (x+10)+"px";
    doc.style.top = (y+10)+"px";
    doc.style.right = "auto";
    doc.style.bottom = "auto";

    if(x < 0) doc.style.left = "10px";
    if(y < 0) doc.style.top = "10px";

    var width = window.innerWidth;
    var height = window.innerHeight;
    if(x + w > width){
        doc.style.left = "auto";
        doc.style.right = "10px";
    }
    if(y + h > height){
        doc.style.top = "auto";
        doc.style.bottom = "10px";
    }
}