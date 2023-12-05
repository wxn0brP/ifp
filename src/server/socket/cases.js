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

        let price = box.p;
        let hajsy = user.gold;

        if(hajsy < price){
            return socket.emit("error", "brak gold");
        }

        let item = losujItem(box.drop);
        await global.db.userGold.updateOne({ id: socket.user._id }, obj => {
            obj.items.push(/*{ name: */item /*}*/);
            obj.gold -= price;
            return obj;
        });
        socket.emit("box_open", box.drop, item);
    });
}