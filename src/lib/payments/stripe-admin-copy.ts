import type { AdminLocale } from "@/lib/admin-locale";

export type StripeGuideStep = {
  title: string;
  body: string;
  link?: { label: string; href: string };
};

const DASHBOARD = "https://dashboard.stripe.com";

export const STRIPE_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
] as const;

const stripeAdminCopy = {
  es: {
    title: "Tarjeta / Apple Pay / Google Pay / PayPal (Stripe)",
    description:
      "Cobrá con tarjeta y billeteras en el checkout seguro de Stripe. Los medios visibles se activan desde el Dashboard de Stripe.",
    enableLabel: "Activar pago con tarjeta (Stripe)",
    statusActive: "Activo en checkout",
    statusInactive: "Inactivo",
    secretKeyLabel: "Secret key",
    secretKeyPlaceholderNew: "sk_test_... o sk_live_...",
    secretKeyPlaceholderKeep: "Dejá vacío para mantener la key actual",
    currentKey: "Key actual:",
    webhookSecretLabel: "Signing secret del webhook",
    webhookSecretPlaceholderNew: "whsec_...",
    webhookSecretPlaceholderKeep: "Dejá vacío para mantener el secret actual",
    webhookSecretSaved: "Signing secret guardado.",
    webhookUrlLabel: "URL del webhook (copiala en Stripe)",
    copy: "Copiar",
    copied: "Copiado",
    secretsHint: "Se guardan solo en el servidor, cifradas.",
    clearKeys: "Quitar keys guardadas y desactivar Stripe",
    save: "Guardar Stripe",
    saving: "Guardando...",
    saved: "Configuración de Stripe guardada.",
    errorFallback: "No se pudo guardar la configuración de Stripe.",
    missingKeys: "Para activar Stripe cargá la Secret key y el signing secret del webhook.",
    guideToggle: "Guía de configuración de Stripe",
    guideIntro:
      "Hacé todo primero en modo Test (toggle «Test mode» arriba a la derecha del Dashboard) y pasá a Live cuando la prueba funcione. Las keys y el webhook de Test y Live son distintos.",
    guideSteps: [
      {
        title: "Creá y verificá la cuenta",
        body: "Registrate en Stripe y completá la activación: datos del negocio (en Italia: partita IVA o persona física), documento y cuenta bancaria (IBAN) para recibir los pagos.",
        link: { label: "Crear cuenta", href: `${DASHBOARD}/register` },
      },
      {
        title: "Copiá la Secret key",
        body: "Developers → API keys. Usá sk_test_... para probar y sk_live_... para cobros reales. Pegala arriba en «Secret key».",
        link: { label: "API keys", href: `${DASHBOARD}/apikeys` },
      },
      {
        title: "Creá el webhook",
        body: `Developers → Webhooks → Add endpoint. Pegá la URL del webhook de esta tarjeta y seleccioná los eventos: ${STRIPE_WEBHOOK_EVENTS.join(", ")}.`,
        link: { label: "Webhooks", href: `${DASHBOARD}/webhooks` },
      },
      {
        title: "Copiá el signing secret",
        body: "En el endpoint creado, «Signing secret» → Reveal. Copiá el valor whsec_... y pegalo arriba.",
      },
      {
        title: "Activá los medios de pago",
        body: "Settings → Payment methods: activá tarjetas, Apple Pay, Google Pay, PayPal y los que quieras. El checkout los muestra solo si están activos ahí.",
        link: { label: "Payment methods", href: `${DASHBOARD}/settings/payment_methods` },
      },
      {
        title: "Apple Pay: verificá el dominio",
        body: "En Settings → Payment method domains agregá el dominio de la tienda. Con Checkout hospedado por Stripe suele funcionar sin pasos extra, pero conviene registrarlo.",
        link: { label: "Payment method domains", href: `${DASHBOARD}/settings/payment_method_domains` },
      },
      {
        title: "Probá una compra",
        body: "Activá el switch, guardá y hacé un pedido con la tarjeta de prueba 4242 4242 4242 4242, fecha futura y cualquier CVC. El pedido debe pasar a Pagado.",
        link: { label: "Tarjetas de prueba", href: "https://docs.stripe.com/testing" },
      },
      {
        title: "Pasá a Live",
        body: "Repetí los pasos 2 a 4 en modo Live (sk_live_ y un webhook nuevo con su propio whsec_) y guardá las nuevas keys acá.",
      },
    ] satisfies StripeGuideStep[],
  },
  it: {
    title: "Carta / Apple Pay / Google Pay / PayPal (Stripe)",
    description:
      "Incassa con carta e wallet nel checkout sicuro di Stripe. I metodi visibili si attivano dalla Dashboard di Stripe.",
    enableLabel: "Attiva pagamento con carta (Stripe)",
    statusActive: "Attivo nel checkout",
    statusInactive: "Non attivo",
    secretKeyLabel: "Secret key",
    secretKeyPlaceholderNew: "sk_test_... o sk_live_...",
    secretKeyPlaceholderKeep: "Lascia vuoto per mantenere la key attuale",
    currentKey: "Key attuale:",
    webhookSecretLabel: "Signing secret del webhook",
    webhookSecretPlaceholderNew: "whsec_...",
    webhookSecretPlaceholderKeep: "Lascia vuoto per mantenere il secret attuale",
    webhookSecretSaved: "Signing secret salvato.",
    webhookUrlLabel: "URL del webhook (copiala in Stripe)",
    copy: "Copia",
    copied: "Copiato",
    secretsHint: "Vengono salvate solo sul server, cifrate.",
    clearKeys: "Rimuovi le key salvate e disattiva Stripe",
    save: "Salva Stripe",
    saving: "Salvataggio...",
    saved: "Configurazione Stripe salvata.",
    errorFallback: "Impossibile salvare la configurazione Stripe.",
    missingKeys: "Per attivare Stripe inserisci la Secret key e il signing secret del webhook.",
    guideToggle: "Guida alla configurazione di Stripe",
    guideIntro:
      "Fai tutto prima in modalità Test (interruttore «Test mode» in alto a destra nella Dashboard) e passa a Live quando il test funziona. Key e webhook di Test e Live sono diversi.",
    guideSteps: [
      {
        title: "Crea e verifica l'account",
        body: "Registrati su Stripe e completa l'attivazione: dati dell'attività (partita IVA o persona fisica), documento e conto bancario italiano (IBAN) per ricevere i pagamenti.",
        link: { label: "Crea account", href: `${DASHBOARD}/register` },
      },
      {
        title: "Copia la Secret key",
        body: "Developers → API keys. Usa sk_test_... per i test e sk_live_... per gli incassi reali. Incollala sopra in «Secret key».",
        link: { label: "API keys", href: `${DASHBOARD}/apikeys` },
      },
      {
        title: "Crea il webhook",
        body: `Developers → Webhooks → Add endpoint. Incolla l'URL del webhook di questa scheda e seleziona gli eventi: ${STRIPE_WEBHOOK_EVENTS.join(", ")}.`,
        link: { label: "Webhooks", href: `${DASHBOARD}/webhooks` },
      },
      {
        title: "Copia il signing secret",
        body: "Nell'endpoint creato, «Signing secret» → Reveal. Copia il valore whsec_... e incollalo sopra.",
      },
      {
        title: "Attiva i metodi di pagamento",
        body: "Settings → Payment methods: attiva carte, Apple Pay, Google Pay, PayPal e gli altri che vuoi. Il checkout li mostra solo se sono attivi lì.",
        link: { label: "Payment methods", href: `${DASHBOARD}/settings/payment_methods` },
      },
      {
        title: "Apple Pay: verifica il dominio",
        body: "In Settings → Payment method domains aggiungi il dominio del negozio. Con il Checkout ospitato da Stripe di solito funziona senza passaggi extra, ma è meglio registrarlo.",
        link: { label: "Payment method domains", href: `${DASHBOARD}/settings/payment_method_domains` },
      },
      {
        title: "Fai un acquisto di prova",
        body: "Attiva l'interruttore, salva e fai un ordine con la carta di test 4242 4242 4242 4242, data futura e qualsiasi CVC. L'ordine deve risultare Pagato.",
        link: { label: "Carte di test", href: "https://docs.stripe.com/testing" },
      },
      {
        title: "Passa a Live",
        body: "Ripeti i passaggi 2–4 in modalità Live (sk_live_ e un nuovo webhook con il suo whsec_) e salva qui le nuove key.",
      },
    ] satisfies StripeGuideStep[],
  },
};

export type StripeAdminCopy = (typeof stripeAdminCopy)[AdminLocale];

export function getStripeAdminCopy(locale: AdminLocale = "es"): StripeAdminCopy {
  return stripeAdminCopy[locale];
}
