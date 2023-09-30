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
        return window.innerWidth < 1000;
    }
}