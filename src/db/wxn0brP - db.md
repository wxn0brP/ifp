<h1 style="font-size: 37px">wxn0brP - db.js</h1>

<h1 style="color:green">database.js</h1>

Plik eksportuje klasę DataBase
konstruktor klasy:
 - file - nazwa pliku
 - shema - obiekt shema.js (nie obowiązkowe)

<br />
Funkcje:

 - add
 - find, get
 - findOne, getOne
 - update
 - updateOne
 - remove, delete
 - removeOne, deleteOne

<br />

<hr>
<h2 style="color:red">add</h2>

async add(object, valid=true)

Jeżeli valid jest wyłączony (false) funkcja nie sprawdza dodawanego obiektu pod koątem walidacji

Retrun: false jeżeli walidacja nie przeszła lub systąpił błąd, obiekt (w postaci Promise) jeżeli poprawnie dodano do db


<hr>
<h2 style="color:red">find, get</h2>

async find, get(obejct lub function(obj => true/false))

Jeżeli dany obiekt z db, kwalifikuje się do podanych parametrów jest zwracany, funkcja ma możliwość ustawienia własej funckji sortującej przyjmuje ona obect, i musi zwracać true lub false

Retrun: tablica (Promise)


<hr>
<h2 style="color:red">findOne, getOne</h2>

async findOne, getOne(obejct lub function(obj => true/false))

Jeżeli dany obiekt z db, kwalifikuje się do podanych parametrów jest zwracany, funkcja ma możliwość ustawienia własej funckji sortującej przyjmuje ona obect, i musi zwracać true lub false

Retrun: obiekt (Promise)


<hr>
<h2 style="color:red">update</h2>

async update(object/function, object)

Funkcja szuka za pomocą find obiekty, a następnie dodaje/zmienia pola z obiektu (2 arg)

Retrun: true/false - czy udało się zaaktualiować obiekty


<hr>
<h2 style="color:red">updateOne</h2>

async updateOne(object/function, object)

Funkcja szuka za pomocą findOne obiekt, a następnie dodaje/zmienia pola z obiektu (2 arg)

Retrun: true/false - czy udało się zaaktualiować obiekt


<hr>
<h2 style="color:red">remove, delete</h2>

async remove,delete(obj/function)

Funkcja szuka za pomocą find obiekty, a następnie usuwa je

Retrun: true/false - czy udało się zaaktualiować obiekt


<hr>
<h2 style="color:red">removeOne, deleteOne</h2>

async removeOne,deleteOne(obj/function)

Funkcja szuka za pomocą findOne obiekt, a następnie usuwa go

Retrun: true/false - czy udało się zaaktualiować obiekt

<br />

<h1 style="color:green">shema.js</h1>

Plik eksportuje klasę ShemaC
konstruktor klasy:
 - shema - object

przykładowy okiekt shema:
```
{
    name: {
        type: "string",
        required: true,
    },
    email: {
        type: "string",
        required: true,
        pattern: /^\S+@\S+\.\S+$/,
    },
    password: {
        type: "string",
        required: true,
    },
    friends: {
        type: "object",
        required: false,
        default: [],
    },
    keys: {
        type: "object",
        required: true,
    }
}
```

<br />
Funkcje:

 - valid

<br />

<hr>
<h2 style="color:red">valid</h2>

async valid(object, log=false)

Funkcja sprawdza czy podany obiekt zgadza się z podanym shematem
Jeżeli log jest włączony wszystkie błędy są konsolowane (console.log)

Retrun: false - nie udana walidacja, object - udana walidacja

<br />

<h1 style="color:green">db-adv.js</h1>

Plik eksportuje klasę dbC
konstruktor klasy:
 - path - ścieżka do folderu


<br />
Funkcje:

 - checkFile(name)
 - add(name, object)
 - find, get(name, object)
 - findOne, getOne(name, object)
 - update(name, object, object)
 - updateOne(name, object, object)
 - remove, delete(name, object)
 - removeOne, deleteOne(name, object)

<br />

<hr>
<h2 style="color:red">checkFile</h2>

checkFile(name)

Tworzy nowy dokument


<hr>
<h2 style="color:red">Reszta funckiji</h2>

Jest taka sama jak w database.js
name - nazwa dokumentu

| funkcja    |   database     |      db-adv          |
| ---------- | -------------- | -------------------- |
| add        | object         | name, object         |
| find       | object         | name, object         |
| update     | object, object | name, object, object |
| remove     | object         | name, object         |



<br /><br /><br />

<h1 style="color:green">Przykład kodu</h1>

```js

const dbC = require("./db/database.js");

(async () => {
    var db = new dbC("./baza.db");
    console.log(await db.add({ test: "ok"}));
    console.log(await db.findOne({ test: "ok"}));
    console.log(await db.findOne(
        (obj) => obj.age > 18
    ));
    console.log(await db.update({ test: "ok"}, { test2: "nie" }));
    console.log(await db.remove(
        (obj) => obj.name == "Jon" || obj.age < 35
    ));

})()

```