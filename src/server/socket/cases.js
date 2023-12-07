function losujItem(tablica){
    const sumaSzans = tablica.reduce((suma, { per }) => suma + per, 0);
    if(sumaSzans !== 100){
        console.error('Błąd: Suma szans musi wynosić 100%. Akt: '+sumaSzans+"%");
        return null;
    }

    let losowaLiczba = Math.random() * 100;

    for(let i=0; i<tablica.length; i++){
        const { name, per } = tablica[i];
        if(losowaLiczba < per) return name;
        losowaLiczba -= per;
    }

    console.error('Błąd: Nieoczekiwany błąd w algorytmie losującym.');
    return null;
}

module.exports = (socket) => {
    socket.on("box_open", async (id) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        let user = await global.db.userGold.findOne({ id: socket.user._id });
        if(!user) return socket.emit("error", "not $");
        user = user.o;

        var box = await global.db.cases.findOne({ _id: id });
        if(!box) return socket.emit("error", "case not found");
        box = box.o;
        var price = box.p;

        if(id == "daily"){
            let timeLast = parseInt(user.daily, 36);
            let time = Math.floor(new Date().getTime() / 1000);
            let day = global.vars.day / 1000;

            if(time - timeLast < day){
                return socket.emit("error", "time");
            }
        }else{
            let hajsy = user.gold;
    
            if(hajsy < price){
                return socket.emit("error", "brak gold");
            }
        }


        let item = losujItem(box.drop);
        await global.db.userGold.updateOne({ id: socket.user._id }, obj => {
            obj.items.push(/*{ name: */item /*}*/);
            if(id == "daily") obj.daily = Math.floor(new Date().getTime() / 1000).toString(36);
            else obj.gold -= price;
            return obj;
        });
        socket.emit("box_open", box.drop, item);
    });

    socket.on("items_get", async () => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        let user = await global.db.userGold.findOne({ id: socket.user._id });
        if(!user) return socket.emit("error", "not $");
        user = user.o;

        socket.emit("items_get", user.items, user.gold);
    });

    socket.on("box_hub", async () => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        let user = await global.db.userGold.findOne({ id: socket.user._id });
        if(!user) return socket.emit("error", "not $");
        user = user.o;

        let boxs = await global.db.cases.find({});
        boxs = boxs.map(box => {
            let b = box.o;
            return {
                id: b._id,
                p: b.p,
                name: b.name
            };
        }).filter(box => box.id != "daily");

        socket.emit("box_hub", boxs, user.gold, user.daily);
    });

    socket.on("box_get_drop", async (id) => {
        if(!socket.user) return socket.emit("error", "not auth");
        if(!socket.isUser) return socket.emit("error", "bot");

        var box = await global.db.cases.findOne({ _id: id });
        if(!box) return socket.emit("error", "case not found");

        socket.emit("box_get_drop", box.o.drop);
    });
}