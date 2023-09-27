var lo = console.log;
const delay = ms => new Promise(res => setTimeout(res, ms));

const cw = {};

cw.proto = {
    html(v){
        if(this.innerHTML != undefined){
            this.innerHTML = v;
            return this;
        }else{
            return this.innerHTML;
        }
    },

    v(v){
        if(this.value != undefined){
            this.value = v;
            return this;
        }else{
            return this.value;
        }
    },

    on(event, fn){
        this.addEventListener(event, fn);
    },

    css(style, val=null){
        var ele = this;
        if(typeof style == "string"){
            if(val){
                ele.style[style] = val;
            }else{
                ele.style = style;
            }
        }else if(typeof style == "object"){
            Object.assign(ele.style, style);
        }
    },

    atrib(att, arg=null){
        if(arg){
            this.setAttribute(att, arg);
        }else{
            return this.getAttribute(att);
        }
        return this;
    },
    
    clA(arg){
        this.classList.add(arg);
        return this;
    },
    
    clR(arg){
        this.classList.remove(arg);
        return this;
    },
    
    clT(className){
        this.classList.toggle(className);
        return this;
    },
    
    animateFade(ele, from, time=200){
        var style = ele.style;
        var steps = 50;
        var timeToStep = time / steps;
        var d = (from == 0 ? 1 : -1)/steps;
        var index = 0;
        style.opacity = from;

        var interval = setInterval(() => {
            if(index >= steps){
                clearInterval(interval);
                return;
            }
            style.opacity = parseFloat(style.opacity) + d;
            index++;
        }, timeToStep);
        return this;
    },

    fadeIn(){
        this.css("display", "block");
        this.animateFade(this, 0);
        return this;
    },

    fadeOut(){
        this.animateFade(this, 1, 300);
        setTimeout(() => this.css("display", "none"), 700);
        return this;
    },

    fade: true,
    fadeToogle(){
        if(this.fade){
            this.fadeOut();
            this.fade = false;
        }else{
            this.fadeIn();
            this.fade = true;
        }
        return this;
    },

    add(child){
        this.appendChild(child);
        return this;
    },

    addUp(child){
        this.insertBefore(child, this.firstChild);
        return this;
    },
};

cw.init = function(){
    Object.assign(HTMLElement.prototype, this.proto);
}
cw.init();


cw.grid = function(doc=document.body){
    function getSize(className, size){
        const match = className.match(new RegExp(`${size}_(\\d+)`));
        return match ? parseInt(match[0].replace(size+"_","")) : 12;
    }
    function add(ele, start, size){
        for(let i=start; i<prefixes.length; i++){
            ele.classList.add(prefixes[i] + "_" + size);
        }
    }
    const prefixes = "smlu";
    const elementy = doc.querySelectorAll(".s, [class^='s_']");
    elementy.forEach(ele => {
        const cm = ele.className;
        let foundPrefix = 0;
        for(let i=0; i<prefixes.length; i++){
            if(!cm.includes(prefixes[i] + "_")) continue;
            foundPrefix = i;
        }
        const size = getSize(cm, prefixes[foundPrefix])
        add(ele, foundPrefix, size);
    });
}

cw.rand = function(min, max){
	return Math.round(Math.random() * (max-min) + min);
}

cw.round = function(a, b){
	var factor = $$.math.pow(10, b);
	return Math.round(a*factor)/factor;
}

cw.get = function(url){
    if(!url) return false;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    
    if(xhr.status == 200){
        return xhr.responseText;
    }else if(xhr.status == 404){
        return false;
    }else return null;
}