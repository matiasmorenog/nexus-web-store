import type { AdminLocale } from "@/lib/admin-locale";
import type { AdminSetupGuideStep } from "@/components/admin/admin-setup-guide";

const META_EVENTS_MANAGER = "https://www.facebook.com/events_manager";
const META_PIXEL_HELP =
  "https://www.facebook.com/business/help/952192354843755";

const marketingAdminCopy = {
  es: {
    metaPixel: {
      guideToggle: "Guía: cómo obtener el Pixel ID",
      guideIntro:
        "El Pixel ID es un número de 15–16 dígitos de Meta (Facebook). Con él la tienda registra PageView y Purchase al confirmar un pedido.",
      guideSteps: [
        {
          title: "Entrá a Meta Events Manager",
          body: "Con la cuenta de Facebook / Meta Business de la tienda, abrí Events Manager. Si no tenés Business Manager, crealo o pedile acceso al dueño de la página.",
          link: { label: "Events Manager", href: META_EVENTS_MANAGER },
        },
        {
          title: "Creá o elegí un Pixel / dataset",
          body: "En Fuentes de datos → Agregar / Ver detalles. Si no hay pixel, creá uno (nombre de la tienda). Si ya existe, abrilo.",
          link: { label: "Ayuda: crear un pixel", href: META_PIXEL_HELP },
        },
        {
          title: "Copiá el ID del pixel",
          body: "Arriba en la ficha del pixel aparece «ID del conjunto de datos» o «Pixel ID»: solo números (ej. 123456789012345). Copialo y pegalo en el campo Pixel ID de esta card.",
        },
        {
          title: "Activá y guardá",
          body: "Encendé «Activar Meta Pixel», pegá el ID, guardá marketing. En unos segundos la tienda carga el script en el storefront.",
        },
        {
          title: "Cómo probar que funciona",
          body: "1) Abrí la tienda en Chrome. 2) Extensión «Meta Pixel Helper» (opcional) o Events Manager → Test events. 3) Navegá el catálogo (PageView) y completá un pedido de prueba hasta éxito (Purchase). Los eventos deben aparecer en Events Manager (pueden tardar unos minutos).",
        },
      ] satisfies AdminSetupGuideStep[],
    },
  },
  it: {
    metaPixel: {
      guideToggle: "Guida: come ottenere il Pixel ID",
      guideIntro:
        "Il Pixel ID è un numero di 15–16 cifre di Meta (Facebook). Con esso il negozio registra PageView e Purchase alla conferma ordine.",
      guideSteps: [
        {
          title: "Apri Meta Events Manager",
          body: "Con l’account Facebook / Meta Business del negozio apri Events Manager. Se non hai Business Manager, crealo o chiedi accesso al titolare della Pagina.",
          link: { label: "Events Manager", href: META_EVENTS_MANAGER },
        },
        {
          title: "Crea o seleziona un Pixel / dataset",
          body: "In Origini dati → Aggiungi / Dettagli. Se non c’è un pixel, creane uno (nome del negozio). Se esiste già, aprilo.",
          link: { label: "Guida: creare un pixel", href: META_PIXEL_HELP },
        },
        {
          title: "Copia l’ID del pixel",
          body: "In alto vedi «ID set di dati» o «Pixel ID»: solo numeri (es. 123456789012345). Incollalo nel campo Pixel ID di questa card.",
        },
        {
          title: "Attiva e salva",
          body: "Attiva «Attiva Meta Pixel», incolla l’ID, salva marketing. In pochi secondi lo storefront carica lo script.",
        },
        {
          title: "Come verificare",
          body: "1) Apri il negozio in Chrome. 2) Estensione «Meta Pixel Helper» (opzionale) o Events Manager → Test events. 3) Naviga il catalogo (PageView) e completa un ordine di prova (Purchase). Gli eventi compaiono in Events Manager (possono richiedere alcuni minuti).",
        },
      ] satisfies AdminSetupGuideStep[],
    },
  },
} as const;

export function getMarketingAdminCopy(locale: AdminLocale) {
  return marketingAdminCopy[locale] ?? marketingAdminCopy.es;
}
