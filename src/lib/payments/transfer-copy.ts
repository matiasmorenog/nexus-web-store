import type { AdminLocale } from "@/lib/admin-locale";
import { getActiveStoreSlug } from "@/lib/store-env";
import { isApp3StoreSlug } from "@/lib/store-slug-client";
import { APP3_STORE_SLUG } from "@/lib/store-slugs";

/** AR = CBU/alias; IT = IBAN/bonifico (Manoviva). */
export type BankingRegion = "ar" | "it";

export function getBankingRegion(slug?: string): BankingRegion {
  const resolved =
    slug ??
    (typeof window === "undefined"
      ? getActiveStoreSlug()
      : undefined);
  if (resolved) {
    return resolved === APP3_STORE_SLUG ? "it" : "ar";
  }
  return isApp3StoreSlug() ? "it" : "ar";
}

export function usesItalianBanking(slug?: string): boolean {
  return getBankingRegion(slug) === "it";
}

const AR_INSTRUCTIONS_PLACEHOLDER = `Titular: Mi Tienda SA
Banco: ...
CBU: ...
Alias: mi.tienda.mp`;

const IT_INSTRUCTIONS_PLACEHOLDER = `Intestatario: Manoviva
Banca: ...
IBAN: IT60X0542811101000000123456
BIC/SWIFT: ...`;

export type TransferAdminCopy = {
  title: string;
  description: (discountLabel: string) => string;
  enableLabel: string;
  instructionsLabel: string;
  instructionsPlaceholder: string;
  instructionsHint: string;
  savedMessage: string;
  saveLabel: string;
  savingLabel: string;
  errorFallback: string;
};

const transferAdminCopy: Record<
  BankingRegion,
  Record<AdminLocale, TransferAdminCopy>
> = {
  ar: {
    es: {
      title: "Transferencia bancaria",
      description: (discountLabel) =>
        `Ofrecé pago por transferencia con ${discountLabel} de descuento automático en productos.`,
      enableLabel: "Activar transferencia en checkout",
      instructionsLabel: "Datos para transferir",
      instructionsPlaceholder: AR_INSTRUCTIONS_PLACEHOLDER,
      instructionsHint:
        "El cliente ve estas instrucciones al confirmar el pedido. Requeridas para habilitar el método en checkout.",
      savedMessage: "Configuración de transferencia guardada.",
      saveLabel: "Guardar transferencia",
      savingLabel: "Guardando...",
      errorFallback: "No se pudo guardar la configuración.",
    },
    it: {
      title: "Bonifico bancario",
      description: (discountLabel) =>
        `Offri il pagamento con bonifico e ${discountLabel} di sconto automatico sui prodotti.`,
      enableLabel: "Attiva bonifico in checkout",
      instructionsLabel: "Dati per il bonifico",
      instructionsPlaceholder: AR_INSTRUCTIONS_PLACEHOLDER,
      instructionsHint:
        "Il cliente vede queste istruzioni dopo l'ordine. Obbligatorie per abilitare il metodo in checkout.",
      savedMessage: "Configurazione bonifico salvata.",
      saveLabel: "Salva bonifico",
      savingLabel: "Salvataggio...",
      errorFallback: "Non è stato possibile salvare la configurazione.",
    },
  },
  it: {
    es: {
      title: "Bonifico bancario",
      description: (discountLabel) =>
        `Ofrecé pago por bonifico con ${discountLabel} de descuento automático en productos.`,
      enableLabel: "Activar bonifico en checkout",
      instructionsLabel: "Datos bancarios (IBAN)",
      instructionsPlaceholder: IT_INSTRUCTIONS_PLACEHOLDER,
      instructionsHint:
        "El cliente ve estas instrucciones al confirmar el pedido. Usá IBAN (y BIC/SWIFT si aplica), no CBU ni alias argentinos. Requeridas para habilitar el método en checkout.",
      savedMessage: "Configuración de bonifico guardada.",
      saveLabel: "Guardar bonifico",
      savingLabel: "Guardando...",
      errorFallback: "No se pudo guardar la configuración.",
    },
    it: {
      title: "Bonifico bancario",
      description: (discountLabel) =>
        `Offri il pagamento con bonifico e ${discountLabel} di sconto automatico sui prodotti.`,
      enableLabel: "Attiva bonifico in checkout",
      instructionsLabel: "Dati bancari (IBAN)",
      instructionsPlaceholder: IT_INSTRUCTIONS_PLACEHOLDER,
      instructionsHint:
        "Il cliente vede queste istruzioni dopo l'ordine. Usa IBAN (e BIC/SWIFT se serve), non CBU né alias argentini. Obbligatorie per abilitare il metodo in checkout.",
      savedMessage: "Configurazione bonifico salvata.",
      saveLabel: "Salva bonifico",
      savingLabel: "Salvataggio...",
      errorFallback: "Non è stato possibile salvare la configurazione.",
    },
  },
};

export function getTransferAdminCopy(
  region: BankingRegion = getBankingRegion(),
  locale: AdminLocale = "es",
): TransferAdminCopy {
  return transferAdminCopy[region][locale];
}

export type TransferStorefrontPaymentCopy = {
  methodTitle: string;
  methodDetail: (discountPercent: number) => string;
  confirmButton: string;
  cartDiscountLabel: string;
  providerName: string;
  statusPending: string;
  statusPaid: string;
  statusCancelled: string;
  detailWithDiscount: string;
  detailWaitingProof: string;
  detailDiscountProducts: (discountLabel: string) => string;
};

export function getTransferStorefrontPaymentCopy(
  region: BankingRegion = getBankingRegion(),
): TransferStorefrontPaymentCopy {
  if (region === "it") {
    return {
      methodTitle: "Bonifico bancario",
      methodDetail: (discountPercent) =>
        `${discountPercent}% di sconto sui prodotti. Paghi con bonifico bancario (IBAN).`,
      confirmButton: "Conferma ordine con bonifico",
      cartDiscountLabel: "Bonifico (10% off)",
      providerName: "Bonifico",
      statusPending: "In attesa di bonifico",
      statusPaid: "Accreditato",
      statusCancelled: "Annullato",
      detailWithDiscount: "Include sconto per bonifico",
      detailWaitingProof: "In attesa della ricevuta",
      detailDiscountProducts: (discountLabel) =>
        `${discountLabel} di sconto sui prodotti`,
    };
  }

  return {
    methodTitle: "Transferencia",
    methodDetail: (discountPercent) =>
      `${discountPercent}% off en productos. Pagás por transferencia bancaria.`,
    confirmButton: "Confirmar pedido por transferencia",
    cartDiscountLabel: "Transferencia (10% off)",
    providerName: "Transferencia",
    statusPending: "Pendiente de transferencia",
    statusPaid: "Acreditado",
    statusCancelled: "Cancelado",
    detailWithDiscount: "Incluye descuento por transferencia",
    detailWaitingProof: "Esperando comprobante",
    detailDiscountProducts: (discountLabel) =>
      `${discountLabel} de descuento en productos`,
  };
}
