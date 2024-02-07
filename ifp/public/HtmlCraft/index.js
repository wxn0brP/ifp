const appElement = document.querySelector("#app");

const Examples = [
`div.ar
    h2
     | Klasyczny tytuł
    p
     | Prosty paragraf z tekstem.
    img(src='/favicon.ico' alt='Przykładowy obraz' style="width: 100px;")`,
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
`div.ar.kontener(aria-label="test")
    section.sekcja
        h1
         | Nagłówek sekcji
        p
         | Opis w sekcji... ok (atrub="ok")
    footer.stopka
     | Strona przygotowana przez XYZ`
];

Examples.forEach(Example => {
    const html = HtmlCraft(Example, { a: { a: 22 }, b: ["1", "2"] });

    const div = document.createElement("div");
    div.innerHTML = html;
    appElement.appendChild(div);
});

const pugString = `
div.container.ar
  h1 {{pageTitle}}
  p {{pageContent}}
  div {{a}}
  ul
    li {{b[0]}}
    li
     | {{b[1]}}
`;

const variables = {
  pageTitle: "Witaj, świecie!",
  pageContent: "To jest przykładowa strona używająca HtmlCraft.",
  a: { a: 22 },
  b: ["1", "2"]
};

const html = window.HtmlCraft(pugString, variables);
console.log(html);
const div = document.createElement("div");
div.innerHTML = html;
appElement.appendChild(div);
