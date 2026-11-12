import type { AdminLocale } from "@/lib/admin-locale";

export type MercadoPagoGuideStep = {
  title: string;
  body: string;
  link?: { label: string; href: string };
};

const MP_PANEL = "https://www.mercadopago.com.ar/developers/panel";
const MP_CREDS = `${MP_PANEL}/app`;

const mercadoPagoAdminCopy = {
  es: {
    title: "Mercado Pago",
    description:
      "Conectá tu cuenta para cobrar con tarjetas, débito y otros medios en el checkout.",
    accessTokenLabel: "Access Token",
    accessTokenPlaceholderNew: "TEST-... o APP_USR-...",
    accessTokenPlaceholderKeep: "Dejá vacío para mantener el token actual",
    currentToken: "Token actual:",
    webhookUrlLabel: "URL del webhook (copiala en Mercado Pago)",
    copy: "Copiar",
    copied: "Copiado",
    secretsHint: "Solo se guarda en el servidor, cifrado.",
    clearToken: "Quitar token guardado en admin",
    save: "Guardar pagos",
    saving: "Guardando...",
    saved: "Configuración de pagos guardada.",
    errorFallback: "No se pudo guardar la configuración.",
    readOnly: "Solo lectura.",
    sourceAdmin: "Configurado en admin",
    sourceEnv: "Configurado en servidor (variable de entorno)",
    guideToggle: "Guía de configuración de Mercado Pago",
    guideIntro:
      "Empezá con credenciales de prueba (TEST-) y pasá a producción (APP_USR-) cuando el checkout funcione. Test y producción usan tokens distintos.",
    guideSteps: [
      {
        title: "Creá o abrí tu aplicación",
        body: "Entrá al panel de desarrolladores de Mercado Pago y abrí (o creá) la aplicación de la tienda.",
        link: { label: "Panel de desarrolladores", href: MP_PANEL },
      },
      {
        title: "Copiá el Access Token",
        body: "Tu integración → Credenciales de prueba o de producción. Copiá el Access Token (TEST-… o APP_USR-…) y pegalo arriba.",
        link: { label: "Credenciales", href: MP_CREDS },
      },
      {
        title: "Configurá el webhook",
        body: "En la misma aplicación, Webhooks / Notificaciones. Pegá la URL del webhook de esta tarjeta y suscribí pagos (payment / topic payment).",
        link: { label: "Panel de la app", href: MP_CREDS },
      },
      {
        title: "Guardá y probá un cobro",
        body: "Guardá el token acá, hacé un pedido de prueba en el storefront y pagá con una tarjeta de prueba de Mercado Pago. El pedido debe pasar a Pagado.",
        link: {
          label: "Tarjetas de prueba",
          href: "https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards",
        },
      },
      {
        title: "Pasá a producción",
        body: "Repetí el paso 2 con credenciales de producción (APP_USR-…), actualizá el webhook si hace falta y guardá el nuevo token acá.",
      },
    ] satisfies MercadoPagoGuideStep[],
  },
  it: {
    title: "Mercado Pago",
    description:
      "Collega il tuo account per accettare carte, debito e altri metodi nel checkout.",
    accessTokenLabel: "Access Token",
    accessTokenPlaceholderNew: "TEST-... o APP_USR-...",
    accessTokenPlaceholderKeep: "Lascia vuoto per mantenere il token attuale",
    currentToken: "Token attuale:",
    webhookUrlLabel: "URL del webhook (copiala in Mercado Pago)",
    copy: "Copia",
    copied: "Copiato",
    secretsHint: "Viene salvato solo sul server, cifrato.",
    clearToken: "Rimuovi il token salvato in admin",
    save: "Salva pagamenti",
    saving: "Salvataggio...",
    saved: "Configurazione pagamenti salvata.",
    errorFallback: "Impossibile salvare la configurazione.",
    readOnly: "Solo lettura.",
    sourceAdmin: "Configurato in admin",
    sourceEnv: "Configurato sul server (variabile d'ambiente)",
    guideToggle: "Guida alla configurazione di Mercado Pago",
    guideIntro:
      "Inizia con le credenziali di test (TEST-) e passa alla produzione (APP_USR-) quando il checkout funziona. Test e produzione usano token diversi.",
    guideSteps: [
      {
        title: "Crea o apri la tua applicazione",
        body: "Entra nel pannello sviluppatori di Mercado Pago e apri (o crea) l'applicazione del negozio.",
        link: { label: "Pannello sviluppatori", href: MP_PANEL },
      },
      {
        title: "Copia l'Access Token",
        body: "La tua integrazione → Credenziali di test o di produzione. Copia l'Access Token (TEST-… o APP_USR-…) e incollalo sopra.",
        link: { label: "Credenziali", href: MP_CREDS },
      },
      {
        title: "Configura il webhook",
        body: "Nella stessa applicazione, Webhooks / Notifiche. Incolla l'URL del webhook di questa scheda e iscriviti ai pagamenti (payment / topic payment).",
        link: { label: "Pannello dell'app", href: MP_CREDS },
      },
      {
        title: "Salva e prova un pagamento",
        body: "Salva il token qui, fai un ordine di prova nello storefront e paga con una carta di test di Mercado Pago. L'ordine deve risultare Pagato.",
        link: {
          label: "Carte di test",
          href: "https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards",
        },
      },
      {
        title: "Passa alla produzione",
        body: "Ripeti il passo 2 con le credenziali di produzione (APP_USR-…), aggiorna il webhook se serve e salva qui il nuovo token.",
      },
    ] satisfies MercadoPagoGuideStep[],
  },
};

export type MercadoPagoAdminCopy = (typeof mercadoPagoAdminCopy)[AdminLocale];

export function getMercadoPagoAdminCopy(
  locale: AdminLocale = "es",
): MercadoPagoAdminCopy {
  return mercadoPagoAdminCopy[locale];
}
