export type App3SeedProduct = {
  name: string;
  category: string;
  description: string;
  featured: boolean;
  image: string;
  price: number;
  format: string;
  finish: string;
};

export const APP3_PRODUCTS: App3SeedProduct[] = [
  {
    name: "Iniziale botanica personalizzata",
    category: "portachiavi",
    description:
      "Iniziale in resina con fiori e dettagli decorativi. Colore, lettera e finitura vengono concordati prima della creazione.",
    featured: true,
    image: "/app3/lettera-b.png",
    price: 16,
    format: "Iniziale",
    finish: "Botanica",
  },
  {
    name: "Portachiavi mare",
    category: "portachiavi",
    description:
      "Iniziale artigianale ispirata al mare, realizzata in resina con conchiglie e piccoli dettagli luminosi.",
    featured: true,
    image: "/app3/lettera-m.png",
    price: 18,
    format: "Iniziale",
    finish: "Mare",
  },
  {
    name: "Ricordo nascita personalizzato",
    category: "regali-personalizzati",
    description:
      "Piccolo ricordo in resina con nome e data. Una creazione su misura per nascite, battesimi e feste.",
    featured: true,
    image: "/app3/portachiavi-piedini.png",
    price: 12,
    format: "Piccolo",
    finish: "Personalizzata",
  },
  {
    name: "Candela dolce Natale",
    category: "candele",
    description:
      "Candela decorativa colata a mano con piccoli soggetti natalizi. Ogni composizione è leggermente diversa.",
    featured: true,
    image: "/app3/candela-natale.jpg",
    price: 32,
    format: "Centrotavola",
    finish: "Natale",
  },
  {
    name: "Candele abito",
    category: "candele",
    description:
      "Coppia di candele scultoree a forma di abito. Un dettaglio elegante per la casa o per un regalo speciale.",
    featured: false,
    image: "/app3/candele-abito.png",
    price: 28,
    format: "Coppia",
    finish: "Avorio",
  },
  {
    name: "Saponi cuore",
    category: "saponi",
    description:
      "Saponi artigianali a forma di cuore, personalizzabili nel colore e nella confezione regalo.",
    featured: true,
    image: "/app3/saponi-cuore.png",
    price: 9,
    format: "Set",
    finish: "Rosa",
  },
  {
    name: "Bouquet giallo",
    category: "decorazioni",
    description:
      "Composizione floreale artigianale nei toni del giallo, preparata come piccolo dono che dura nel tempo.",
    featured: false,
    image: "/app3/bouquet-giallo.png",
    price: 36,
    format: "Bouquet",
    finish: "Giallo",
  },
  {
    name: "Ciondolo ricordo con foto",
    category: "regali-personalizzati",
    description:
      "Ciondolo personalizzato con fotografia, realizzato su richiesta per custodire una persona o un momento importante.",
    featured: true,
    image: "/app3/ciondolo-foto.png",
    price: 38,
    format: "Ciondolo",
    finish: "Oro",
  },
];
