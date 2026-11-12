import type { AdminLocale } from "@/lib/admin-locale";
import type { AdminSetupGuideStep } from "@/components/admin/admin-setup-guide";

const ML_PANEL = "https://www.mercadolibre.com.ar/developers/panel";
const ML_CREDS = `${ML_PANEL}/app`;
const ML_SHIPPING_DOCS =
  "https://developers.mercadolibre.com.ar/es_ar/mercado-envios";
const MICORREO_FAQS =
  "https://www.correoargentino.com.ar/MiCorreo/public/faqs";
const MICORREO_API_PDF =
  "https://www.correoargentino.com.ar/MiCorreo/public/img/pag/apiMiCorreo.pdf";
const ANDREANI_DEV = "https://developers-sandbox.andreani.com/";
const ANDREANI_PYMES =
  "https://pymes.andreani.com/integraciones/";

type CarrierGuideCopy = {
  guideToggle: string;
  guideIntro: string;
  guideSteps: AdminSetupGuideStep[];
};

const shippingAdminCopy = {
  es: {
    save: "Guardar envíos",
    saving: "Guardando...",
    saved: "Configuración de envíos guardada. Los cambios aplican en el checkout al instante.",
    errorFallback: "No se pudo guardar la configuración.",
    readOnly: "Solo lectura.",
    globalTitle: "Cotización en checkout",
    globalDescription:
      "CP de origen y peso default. Cada operador se activa en su propia card.",
    carriersEnabled: "Activar cotización por CP en checkout",
    originZipLabel: "CP de origen (depósito)",
    originZipHint: "Desde dónde despachás. Requerido para cotizar.",
    weightLabel: "Peso default por ítem (g)",
    weightHint: "Usado para estimar el paquete en cotizaciones.",
    enableInCheckout: "Ofrecer en checkout",
    enableInCheckoutHint:
      "Si está activo y hay credenciales, el comprador puede elegir este operador al cotizar.",
    missingConfigBadge: "Falta configurar",
    pickupTitle: "Retiro en local",
    pickupDescription: "Retiro en local siempre es gratis. La dirección se muestra en el checkout.",
    allowPickup: "Permitir retiro en local",
    pickupAddressLabel: "Dirección del local",
    pickupCityLabel: "Ciudad",
    pickupZipLabel: "Código postal",
    pickupNotesLabel: "Horario / indicaciones (opcional)",
    pickupNotesHint: "Ej. Lun–Vie 10 a 18 hs. Entre en el local por la puerta de atrás.",
    pickupAddressRequired: "Completá dirección, ciudad y CP si activás el retiro.",

    mercadoEnvios: {
      title: "Mercado Envíos",
      description:
        "Cotizá y gestioná envíos con la API de Mercado Libre. El token de Cobros (Mercado Pago) suele alcanzar.",
      accessTokenLabel: "Access Token",
      accessTokenPlaceholderNew: "TEST-... o APP_USR-...",
      accessTokenPlaceholderKeep: "Dejá vacío para mantener el token actual",
      clearToken: "Quitar token guardado en admin",
      mlaItemLabel: "Item MLA de referencia (opcional)",
      mlaItemHint:
        "Publicación MLA con Mercado Envíos activo. Mejora la cotización real.",
      sourceAdmin: "Token Mercado Envíos en admin",
      sourceMp: "Usando token de Mercado Pago (Cobros)",
      sourceEnv: "Configurado en servidor (variable de entorno)",
      sourceNone: "Sin token — no cotiza hasta configurarlo",
      guideToggle: "Guía de configuración de Mercado Envíos",
      guideIntro:
        "Necesitás un Access Token de Mercado Libre / Mercado Pago. Empezá siempre con credenciales de prueba (TEST-) y pasá a producción (APP_USR-) recién cuando cotice bien.",
      guideSteps: [
        {
          title: "Creá o abrí tu aplicación",
          body: "Entrá al panel de desarrolladores de Mercado Libre y abrí (o creá) la aplicación vinculada a la tienda.",
          link: { label: "Panel de desarrolladores", href: ML_PANEL },
        },
        {
          title: "Usá el token de prueba (TEST-)",
          body: "En Credenciales de prueba, copiá el Access Token que empieza con TEST- y pegalo arriba (o dejá vacío si Cobros ya tiene un TEST-). No uses APP_USR- hasta terminar las pruebas.",
          link: { label: "Credenciales", href: ML_CREDS },
        },
        {
          title: "CP de origen e ítem MLA (opcional)",
          body: "Completá el CP del depósito arriba en «Cotización en checkout». Si tenés una publicación MLA de prueba con Mercado Envíos, pegá el ID (MLA…) para mejorar la cotización.",
          link: { label: "Docs Mercado Envíos", href: ML_SHIPPING_DOCS },
        },
        {
          title: "Cómo probar cotización",
          body: "1) Activá «Ofrecer en checkout» en esta card y guardá. 2) Abrí el storefront → carrito → checkout. 3) Elegí envío a domicilio e ingresá un CP real (ej. 1425). 4) Debe aparecer Mercado Envíos con costo y plazo. Si falla, revisá token TEST-, CP origen y que el módulo Envíos esté activo.",
        },
        {
          title: "Cómo probar despacho",
          body: "Completá un pedido de prueba pagado. En Admin → Pedidos abrí el pedido y usá «Generar envío». ML no siempre permite crear guía desde carrito externo: si falla, el mensaje en el pedido te lo dice; la cotización igual es válida. En producción repetí con APP_USR-.",
        },
      ] satisfies AdminSetupGuideStep[],
    } satisfies CarrierGuideCopy & Record<string, unknown>,

    correo: {
      title: "Correo Argentino (MiCorreo)",
      description:
        "Cotización e importación de envíos con la API MiCorreo. Credenciales las da Correo Argentino a tu comercio.",
      userLabel: "Usuario MiCorreo (API)",
      passwordLabel: "Contraseña API",
      passwordPlaceholderKeep: "Dejá vacío para mantener la contraseña actual",
      customerIdLabel: "Customer ID",
      customerIdHint: "Identificador de cliente MiCorreo (ej. 0000550137).",
      sandboxLabel: "Usar ambiente de prueba (QA)",
      clearCredentials: "Quitar credenciales de Correo",
      notConfigured: "Sin credenciales — no cotiza hasta configurarlas",
      configured: "Credenciales guardadas",
      guideToggle: "Guía de configuración de Correo Argentino",
      guideIntro:
        "API MiCorreo (PAQ.AR). Pedí a Correo un par de credenciales: QA (prueba) y producción. Empezá siempre con QA + el switch «Usar ambiente de prueba (QA)» encendido.",
      guideSteps: [
        {
          title: "Pedí credenciales QA y producción",
          body: "Contactá a un ejecutivo de Correo / MiCorreo y pedí usuario, contraseña y customerId para QA y para producción (son distintos). La integración no tiene costo de alta; pagás por envío real.",
          link: { label: "Preguntas frecuentes MiCorreo", href: MICORREO_FAQS },
        },
        {
          title: "Qué hace el switch QA",
          body: "Encendido → la app llama a apitest.correoargentino.com.ar (sin envíos reales ni cobros). Apagado → api.correoargentino.com.ar (producción). Nunca mezcles: credenciales QA solo con el switch ON.",
          link: { label: "Manual API MiCorreo (PDF)", href: MICORREO_API_PDF },
        },
        {
          title: "Cargá las credenciales de QA",
          body: "Pegá usuario, contraseña y Customer ID de QA. Dejá «Usar ambiente de prueba (QA)» activo. Activá «Ofrecer en checkout» y guardá. Completá también el CP de origen en la card de cotización.",
        },
        {
          title: "Cómo probar cotización (QA)",
          body: "1) Storefront → checkout → envío a domicilio. 2) Ingresá un CP válido (ej. 1425 o el que te indique Correo para pruebas). 3) Debe listarse Correo Argentino con precio. Si no aparece: revisá switch QA, customerId y que el módulo Envíos esté activo.",
        },
        {
          title: "Cómo probar alta de envío (QA)",
          body: "Hacé un pedido de prueba pagado eligiendo Correo. En Admin → Pedidos → «Generar envío». En QA se crea una orden de prueba en MiCorreo (sin despacho real) y queda tracking en el pedido. Si falla, el error se muestra en pantalla.",
        },
        {
          title: "Pasá a producción",
          body: "Cuando QA ande: reemplazá usuario/contraseña/customerId por los de producción, apagá el switch QA, guardá y repetí una compra real chica para validar.",
        },
      ] satisfies AdminSetupGuideStep[],
    } satisfies CarrierGuideCopy & Record<string, unknown>,

    andreani: {
      title: "Andreani",
      description:
        "Cotización, alta de envío y etiqueta con la API Andreani. Credenciales (Client ID / Secret) y número de contrato las da Andreani.",
      clientIdLabel: "Client ID",
      clientSecretLabel: "Client Secret",
      clientSecretPlaceholderKeep: "Dejá vacío para mantener el secret actual",
      contratoLabel: "Número de contrato",
      contratoHint: "Contrato Andreani asociado a tu cuenta (obligatorio para cotizar).",
      sandboxLabel: "Usar sandbox (apisqa.andreani.com)",
      clearCredentials: "Quitar credenciales de Andreani",
      notConfigured: "Sin credenciales — no cotiza hasta configurarlas",
      configured: "Credenciales guardadas",
      guideToggle: "Guía de configuración de Andreani",
      guideIntro:
        "Necesitás Client ID, Client Secret y número de contrato. Empezá en sandbox (apisqa) con el switch sandbox encendido; recién después pasá a producción.",
      guideSteps: [
        {
          title: "Obtené credenciales sandbox y producción",
          body: "PyME: portal de integraciones. Corporativos: canal comercial. Pedí Client ID / Secret (y contrato) de sandbox y de producción — no son intercambiables.",
          link: { label: "Integraciones PyME", href: ANDREANI_PYMES },
        },
        {
          title: "Qué hace el switch sandbox",
          body: "Encendido → apisqa.andreani.com (pruebas, sin costo real). Apagado → apis.andreani.com (producción). Credenciales sandbox solo con el switch ON.",
          link: { label: "Andreani Developers", href: ANDREANI_DEV },
        },
        {
          title: "Cargá sandbox acá",
          body: "Pegá Client ID, Secret y contrato de sandbox. Dejá «Usar sandbox» activo. Activá «Ofrecer en checkout», completá CP de origen y guardá.",
        },
        {
          title: "Cómo probar cotización (sandbox)",
          body: "1) Checkout → envío a domicilio → CP válido. 2) Debe aparecer Andreani con tarifa y plazo. Si falla auth o contrato, el checkout no muestra el operador (revisá logs / credenciales).",
        },
        {
          title: "Cómo probar envío y etiqueta (sandbox)",
          body: "Pedido de prueba pagado con Andreani → Admin → Pedidos → «Generar envío». En sandbox se crea la orden de prueba y, si la API lo permite, el link/PDF de etiqueta. No genera despacho real.",
        },
        {
          title: "Pasá a producción",
          body: "Reemplazá por Client ID / Secret / contrato de producción, apagá el sandbox, guardá y validá con una compra real chica.",
        },
      ] satisfies AdminSetupGuideStep[],
    } satisfies CarrierGuideCopy & Record<string, unknown>,
  },
  it: {
    save: "Salva spedizioni",
    saving: "Salvataggio...",
    saved: "Configurazione spedizioni salvata. Le modifiche valgono subito nel checkout.",
    errorFallback: "Impossibile salvare la configurazione.",
    readOnly: "Solo lettura.",
    globalTitle: "Preventivo in checkout",
    globalDescription:
      "CAP di origine e peso default. Ogni operatore si attiva nella propria card.",
    carriersEnabled: "Attiva preventivo per CAP in checkout",
    originZipLabel: "CAP di origine (magazzino)",
    originZipHint: "Da dove spedisci. Obbligatorio per preventivare.",
    weightLabel: "Peso default per articolo (g)",
    weightHint: "Usato per stimare il pacco nei preventivi.",
    enableInCheckout: "Offri in checkout",
    enableInCheckoutHint:
      "Se attivo e con credenziali, l’acquirente può scegliere questo operatore nel preventivo.",
    missingConfigBadge: "Da configurare",
    pickupTitle: "Ritiro in sede",
    pickupDescription:
      "Il ritiro in sede è sempre gratuito. L’indirizzo compare nel checkout.",
    allowPickup: "Consenti ritiro in sede",
    pickupAddressLabel: "Indirizzo del negozio",
    pickupCityLabel: "Città",
    pickupZipLabel: "CAP",
    pickupNotesLabel: "Orari / indicazioni (opzionale)",
    pickupNotesHint: "Es. Lun–Ven 10–18. Entrata dal retro.",
    pickupAddressRequired:
      "Compila indirizzo, città e CAP se attivi il ritiro.",

    mercadoEnvios: {
      title: "Mercado Envíos",
      description:
        "Preventivi e spedizioni con l’API di Mercado Libre. Il token di Cobros (Mercado Pago) di solito basta.",
      accessTokenLabel: "Access Token",
      accessTokenPlaceholderNew: "TEST-... o APP_USR-...",
      accessTokenPlaceholderKeep: "Lascia vuoto per mantenere il token attuale",
      clearToken: "Rimuovi il token salvato in admin",
      mlaItemLabel: "Item MLA di riferimento (opzionale)",
      mlaItemHint:
        "Pubblicazione MLA con Mercado Envíos attivo. Migliora il preventivo reale.",
      sourceAdmin: "Token Mercado Envíos in admin",
      sourceMp: "Usando token di Mercado Pago (Cobros)",
      sourceEnv: "Configurato sul server (variabile d’ambiente)",
      sourceNone: "Senza token — non preventiva finché non lo configuri",
      guideToggle: "Guida alla configurazione di Mercado Envíos",
      guideIntro:
        "Serve un Access Token ML/MP. Inizia sempre con TEST- e passa ad APP_USR- solo quando il preventivo funziona.",
      guideSteps: [
        {
          title: "Crea o apri l’applicazione",
          body: "Pannello sviluppatori Mercado Libre: apri (o crea) l’app del negozio.",
          link: { label: "Pannello sviluppatori", href: ML_PANEL },
        },
        {
          title: "Usa il token di test (TEST-)",
          body: "Credenziali di prova: Access Token TEST-. Non usare APP_USR- finché non hai finito i test. Se Cobros ha già un TEST-, puoi lasciare vuoto.",
          link: { label: "Credenziali", href: ML_CREDS },
        },
        {
          title: "CAP di origine e item MLA (opzionale)",
          body: "Compila il CAP magazzino in «Preventivo in checkout». Opzionale: ID MLA di prova con Mercado Envíos.",
          link: { label: "Docs Mercado Envíos", href: ML_SHIPPING_DOCS },
        },
        {
          title: "Come testare il preventivo",
          body: "1) Attiva «Offri in checkout» e salva. 2) Storefront → checkout → spedizione. 3) Inserisci un CAP valido (es. 1425). 4) Deve comparire Mercado Envíos con costo e tempi.",
        },
        {
          title: "Come testare la spedizione",
          body: "Ordine di prova pagato → Admin → Ordini → «Genera spedizione». ML può non creare la guida da carrello esterno: l’errore compare sull’ordine. Poi ripeti in produzione con APP_USR-.",
        },
      ] satisfies AdminSetupGuideStep[],
    },

    correo: {
      title: "Correo Argentino (MiCorreo)",
      description:
        "Preventivo e importazione spedizioni con l’API MiCorreo. Le credenziali le fornisce Correo Argentino.",
      userLabel: "Utente MiCorreo (API)",
      passwordLabel: "Password API",
      passwordPlaceholderKeep: "Lascia vuoto per mantenere la password attuale",
      customerIdLabel: "Customer ID",
      customerIdHint: "Identificativo cliente MiCorreo (es. 0000550137).",
      sandboxLabel: "Usa ambiente di test (QA)",
      clearCredentials: "Rimuovi credenziali Correo",
      notConfigured: "Senza credenziali — non preventiva finché non le configuri",
      configured: "Credenziali salvate",
      guideToggle: "Guida alla configurazione di Correo Argentino",
      guideIntro:
        "API MiCorreo. Chiedi a Correo credenziali QA e produzione. Inizia con QA e lo switch «ambiente di test» acceso.",
      guideSteps: [
        {
          title: "Richiedi credenziali QA e produzione",
          body: "Contatta Correo / MiCorreo: utente, password e customerId per QA e per produzione (sono diversi).",
          link: { label: "FAQ MiCorreo", href: MICORREO_FAQS },
        },
        {
          title: "A cosa serve lo switch QA",
          body: "ON → apitest.correoargentino.com.ar (niente spedizioni reali). OFF → api.correoargentino.com.ar. Non mischiare: credenziali QA solo con switch ON.",
          link: { label: "Manuale API MiCorreo (PDF)", href: MICORREO_API_PDF },
        },
        {
          title: "Carica le credenziali QA",
          body: "Incolla utente/password/customerId QA, lascia QA attivo, attiva «Offri in checkout», CAP di origine e salva.",
        },
        {
          title: "Come testare il preventivo (QA)",
          body: "Checkout → spedizione → CAP valido. Deve comparire Correo con prezzo. Se no: controlla switch QA, customerId e modulo Envíos.",
        },
        {
          title: "Come testare la creazione spedizione (QA)",
          body: "Ordine pagato con Correo → «Genera spedizione». In QA crea un ordine di prova in MiCorreo (senza despacho reale) e salva il tracking.",
        },
        {
          title: "Passa a produzione",
          body: "Sostituisci con credenziali produzione, spegni QA, salva e valida con un ordine reale piccolo.",
        },
      ] satisfies AdminSetupGuideStep[],
    },

    andreani: {
      title: "Andreani",
      description:
        "Preventivo, creazione spedizione ed etichetta con l’API Andreani. Servono Client ID / Secret e numero di contratto.",
      clientIdLabel: "Client ID",
      clientSecretLabel: "Client Secret",
      clientSecretPlaceholderKeep: "Lascia vuoto per mantenere il secret attuale",
      contratoLabel: "Numero di contratto",
      contratoHint: "Contratto Andreani (obbligatorio per preventivare).",
      sandboxLabel: "Usa sandbox (apisqa.andreani.com)",
      clearCredentials: "Rimuovi credenziali Andreani",
      notConfigured: "Senza credenziali — non preventiva finché non le configuri",
      configured: "Credenziali salvate",
      guideToggle: "Guida alla configurazione di Andreani",
      guideIntro:
        "Client ID, Secret e contratto. Inizia in sandbox (apisqa) con lo switch acceso; poi produzione.",
      guideSteps: [
        {
          title: "Ottieni credenziali sandbox e produzione",
          body: "PyME: portale integrazioni. Corporativi: commerciale. Chiedi ID/Secret/contratto di sandbox e di produzione.",
          link: { label: "Integrazioni PyME", href: ANDREANI_PYMES },
        },
        {
          title: "A cosa serve lo switch sandbox",
          body: "ON → apisqa.andreani.com (test). OFF → apis.andreani.com. Credenziali sandbox solo con switch ON.",
          link: { label: "Andreani Developers", href: ANDREANI_DEV },
        },
        {
          title: "Carica il sandbox qui",
          body: "Incolla ID/Secret/contratto sandbox, lascia sandbox attivo, attiva «Offri in checkout», CAP origine e salva.",
        },
        {
          title: "Come testare il preventivo (sandbox)",
          body: "Checkout → spedizione → CAP valido. Deve comparire Andreani con tariffa e tempi.",
        },
        {
          title: "Come testare spedizione ed etichetta (sandbox)",
          body: "Ordine pagato → «Genera spedizione». In sandbox crea l’ordine di prova e, se disponibile, il link/PDF etichetta. Nessun despacho reale.",
        },
        {
          title: "Passa a produzione",
          body: "Credenziali produzione, spegni sandbox, salva e valida con un ordine reale piccolo.",
        },
      ] satisfies AdminSetupGuideStep[],
    },
  },
} as const;

export function getShippingAdminCopy(locale: AdminLocale) {
  return shippingAdminCopy[locale] ?? shippingAdminCopy.es;
}
