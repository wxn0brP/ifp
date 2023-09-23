/**
 * @author: wxn0brP
 * @license: MIT
 * @version: 0.1;
*/

var lo = console.log;

class ___{
    constructor(data){
        if(typeof data === 'string'){
            this.res = qrs(data);
        }else if(typeof data === 'object'){
            this.res = data;
        }else{
            this.res = null;
        }
        if(!this.res) alert("wwlp: res is null: " + data);

        function qrs(d){
            if(
                data == "" ||
                data == null ||
                data.length <= 1
            ) return null;
            
            if(d.startsWith("#")){
                return document.getElementById(d.substring(1));
            }else if(d.startsWith(".")){
                return document.querySelector(d.substring(1));
            }else if(d.startsWith("$")){
                return [...document.querySelectorAll(d.substring(1))];
            }else if(d.startsWith("@")){
                return document.getElementsByTagName(d.substring(1));
            }else if(d == "body"){
                return document.body;
            }else{
                return null;
            }
        }
    }

    get(){
        return this.res;
    }
    g(){
        return this.res;
    }


    /* html */

    html(data=null){
        if(data==null) return this.res.innerHTML;
        this.res.innerHTML = data;
        return this;
    }

    htmlP(data){
        this.res.innerHTML += data;
    }

    valueP(data){
        this.res.value += data;
    }

    value(data=null){
        if(data==null) return this.res.value;
        this.res.value = data;
        return this;
    }

    cont(){
        if(this.res.innerHTML != "") return this.res.innerHTML;
        if(this.res.value != "") return this.res.value;
        return "";
    }

    htmlA(data, br=false){
        this.res.innerHTML += data + (br ? "<br />" : "");
        return this;
    }

    add(child){
        this.res.appendChild(child);
        return this;
    }

    addUp(child){
        this.res.insertBefore(child, this.res.firstChild);
        return this;
    }
    

    /* css */

    style(data=null){
        if(data==null) return this.res.style;
        this.res.style = data;
        return this;
    }

    css(att, arg){
        this.res.setAttribute(att, arg);
        return this;
    }
    
    cssAC(arg){
        this.res.classList.add(arg);
        return this;
    }
    
    cssRC(arg){
        this.res.classList.remove(arg);
        return this;
    }
    
    cssTC(className){
        this.res.classList.toggle(className);
        return this;
    }

    on(event, func){
        this.res.addEventListener(event, func);
    }
}

var __ = function(d){
    return new ___(d);
}

__.rand = __.random = function(min, max){
	return Math.round(Math.random() * (max-min) + min);
}

__.round = function(a, b){
	var factor = Math.pow(10, b);
	return Math.round(a*factor)/factor;
}


/* mobile */

__.mobile = function(){
    let x = window.innerWidth;
    __.mobile.mob = (x <= 500);
    __.mobile.tab = (x > 500 && x < 850);
    return __;
};

__.mobile.mob = false;
__.mobile.tab = false;
__.mobile.s = __.mobile.mob || __.mobile.tab;


/* http get */

__.httpReq = function(url){
    if(url == "") throw new Error("url not defined");

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    
    if(xhr.status == 200){
        return xhr.responseText;
    }else if(xhr.status == 404){
        return false;
    }else return null;
}

/* url param */

__.updateURLParameter = function(url, param, paramVal){
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if(additionalURL){
        tempArray = additionalURL.split("&");
        for(let i=0; i<tempArray.length; i++){
            if(tempArray[i].split('=')[0] != param){
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }
    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}

__.urlParam = function(name, val){
    window.history.replaceState('', '', __.updateURLParameter(window.location.href, name, val));
}