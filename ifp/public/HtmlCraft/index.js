const appElement = document.querySelector("#app");

const Examples = [
`div.ar
    h2
     | Klasyczny tytuł
    p
     | Prosty paragraf z tekstem.
    img src='/favicon.ico' alt='Przykładowy obraz' style='width: 100px;'`,
`ul.lista.ar
    li#pierwszy
        | Pierwszy element {{a.a}}
    li.klasa
     | Drugi element
        ul
            li
             | Zagnieżdżony element 1
            li
             | Zagnieżdżony element 2`,
`div.ar.kontener aria-label="test"
    section.sekcja
        h1
         | Nagłówek sekcji
        p
         | Opis w sekcji... ok
    footer.stopka
     | Strona przygotowana przez XYZ`,
`div.container.ar
    h1
     | {{pageTitle}}
    p
     | {{pageContent}}
    div {{a}}
    ul
        li
         | {{b[0]}}
        li
         | {{b[1]}}
`
];

Examples.forEach(Example => {
    const variables = {
        pageTitle: "Witaj, świecie!",
        pageContent: "To jest przykładowa strona używająca HtmlCraft.",
        a: { a: 22 },
        b: ["1", "2"]
    };
    const html = HtmlCraft(Example, variables);

    const div = document.createElement("div");
    div.innerHTML = html;
    appElement.appendChild(div);
});


let domConv = htmlToHtmlCraftString(appElement.querySelector("div.ar"));
lo(domConv)
lo(Examples[0])
lo(domConv == Examples[0])