import {
  readAdminLocaleFromDocument,
  type AdminLocale,
} from "@/lib/admin-locale";
import type { VariantLabels } from "@/lib/store-verticals/types";
import { getAdminVariantLabels } from "@/lib/variant-labels";

type Labels = Pick<VariantLabels, "primary" | "secondary">;

function buildCopy(locale: AdminLocale, { primary, secondary }: Labels) {
  const p = primary.toLowerCase();
  const s = secondary.toLowerCase();

  if (locale === "it") {
    return {
      nameRequired: "Scrivi il nome del prodotto.",
      descriptionRequired: "Scrivi una descrizione del prodotto.",
      categoryRequired: "Scegli una categoria.",
      categoryInvalid:
        "Questa categoria non esiste più. Ricarica la pagina e scegline un'altra.",
      priceInvalid:
        "Il prezzo deve essere un numero uguale o maggiore di 0 (es. 12.50).",
      stockInvalid:
        "Lo stock deve essere un numero intero uguale o maggiore di 0.",
      productNotFound:
        "Questo prodotto non esiste più (forse è stato eliminato). Ricarica la pagina.",
      variantNotFound: "Questa variante non esiste più. Ricarica la pagina.",
      sizeToggleUnavailable: `Questo negozio non permette di disattivare il campo «${secondary}».`,
      sizeToggleMultiple: `Non puoi disattivare «${secondary}» finché ci sono valori diversi. Lascia un solo valore nelle varianti e riprova.`,
      primaryRequired: `Compila il campo «${primary}».`,
      primaryImageRequired: `Carica una foto prima di salvare (${p}).`,
      primaryDuplicate: `Esiste già un'opzione di ${p} con questo nome in questo prodotto.`,
      primaryNotFound: `Questa opzione di ${p} non esiste più. Ricarica la pagina.`,
      primaryHasVariants: `Non si può eliminare: questa opzione di ${p} ha più varianti. Elimina prima le varianti nella tabella sotto.`,
      primaryHasOrders: `Non si può eliminare: questa opzione di ${p} ha già degli ordini. Puoi mettere lo stock a 0.`,
      variantDuplicate: `Esiste già una variante con questa combinazione di ${p} e ${s}. Modifica la riga esistente invece di crearne un'altra.`,
      variantMissingImage: `Questa opzione di ${p} non ha una foto. Caricala prima nella sezione sopra.`,
      variantHasOrders:
        "Non si può eliminare: questa variante ha già degli ordini. Puoi mettere lo stock a 0.",
      lastVariant:
        "Il prodotto deve avere almeno una variante. Aggiungine un'altra prima di eliminare questa.",
      duplicate:
        "Esiste già un elemento con questi dati. Controlla che non sia ripetuto.",
      dbUnavailable:
        "Impossibile collegarsi al database. Aspetta un minuto e riprova.",
      network:
        "Nessuna connessione con il server. Controlla internet e riprova.",
      unexpected:
        "Qualcosa è andato storto durante il salvataggio. Riprova tra poco; se succede ancora, manda uno screenshot.",
      waitForUpload: "Aspetta che finisca il caricamento della foto…",
    };
  }

  return {
    nameRequired: "Escribí el nombre del producto.",
    descriptionRequired: "Escribí una descripción del producto.",
    categoryRequired: "Elegí una categoría.",
    categoryInvalid:
      "Esa categoría ya no existe. Recargá la página y elegí otra.",
    priceInvalid:
      "El precio tiene que ser un número igual o mayor a 0 (ej: 12.50).",
    stockInvalid:
      "El stock tiene que ser un número entero igual o mayor a 0.",
    productNotFound:
      "Este producto ya no existe (puede que lo hayan borrado). Recargá la página.",
    variantNotFound: "Esta variante ya no existe. Recargá la página.",
    sizeToggleUnavailable: `Esta tienda no permite desactivar el campo «${secondary}».`,
    sizeToggleMultiple: `No se puede desactivar «${secondary}» mientras haya valores distintos. Dejá uno solo en las variantes y probá de nuevo.`,
    primaryRequired: `Completá el campo «${primary}».`,
    primaryImageRequired: `Subí una foto antes de guardar (${p}).`,
    primaryDuplicate: `Ya hay una opción de ${p} con ese nombre en este producto.`,
    primaryNotFound: `Esa opción de ${p} ya no existe. Recargá la página.`,
    primaryHasVariants: `No se puede eliminar: esa opción de ${p} tiene varias variantes. Eliminá primero las variantes en la tabla de abajo.`,
    primaryHasOrders: `No se puede eliminar: esa opción de ${p} ya tiene pedidos. Podés dejar su stock en 0.`,
    variantDuplicate: `Ya existe una variante con esa combinación de ${p} y ${s}. Editá la fila existente en lugar de crear otra.`,
    variantMissingImage: `Esa opción de ${p} no tiene foto. Cargala primero en la sección de arriba.`,
    variantHasOrders:
      "No se puede eliminar: esta variante ya tiene pedidos. Podés dejar su stock en 0.",
    lastVariant:
      "El producto necesita al menos una variante. Agregá otra antes de eliminar esta.",
    duplicate:
      "Ya existe un registro con esos datos. Revisá que no esté repetido.",
    dbUnavailable:
      "No se pudo conectar con la base de datos. Esperá un minuto y probá de nuevo.",
    network:
      "No hay conexión con el servidor. Revisá tu internet y probá de nuevo.",
    unexpected:
      "Algo salió mal al guardar. Probá de nuevo en un momento; si sigue pasando, mandá una captura.",
    waitForUpload: "Esperá a que termine de subir la foto…",
  };
}

export type AdminProductErrors = ReturnType<typeof buildCopy>;
export type AdminProductErrorKey = keyof AdminProductErrors;

export function getAdminProductErrors(
  locale: AdminLocale,
  labels: Labels,
): AdminProductErrors {
  return buildCopy(locale, labels);
}

/** Browser only: admin cookie locale + store variant labels. */
export function readAdminProductErrors(): AdminProductErrors {
  const locale = readAdminLocaleFromDocument();
  return getAdminProductErrors(locale, getAdminVariantLabels(locale));
}
