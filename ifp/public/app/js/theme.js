function changeTheme(id){
    var json = cw.get("themes/"+id+".json5");
    var obj = JSON5.parse(json);
    for(var key in obj){
        if(obj.hasOwnProperty(key)){
            document.documentElement.style.setProperty("--" + key, obj[key]);
        }
    }
}