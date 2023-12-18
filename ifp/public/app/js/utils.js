const utils = {
    post(url, data){
        if(!url || !data) return false;
        const xhr = new XMLHttpRequest();
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.open("POST", url, false);
        xhr.send(JSON.stringify(data));
        
        if(xhr.status == 200){
            return xhr.responseText;
        }else if(xhr.status == 404){
            return false;
        }else return null;
    },

    ss(){
        return window.innerWidth < 700;
    },

    scrollTo(targetElement, duration=500){
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        function ease(t, b, c, d){
            t /= d / 2;
            if(t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        function animation(currentTime){
            if(startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if(timeElapsed < duration) requestAnimationFrame(animation);
        }
        requestAnimationFrame(animation);
    }
}

function updateObject(obj, newVal){
    for(let key in newVal){
        if(newVal.hasOwnProperty(key)){
            obj[key] = newVal[key];
        }
    }
    return obj;
}