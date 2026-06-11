export type InfoSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

export type InfoPageContent = {
  kind: "info";
  title: string;
  description: string;
  sections: InfoSection[];
};

export type ContactPageContent = {
  kind: "contact";
  title: string;
  description: string;
};

export type PageContent = InfoPageContent | ContactPageContent;

export const INFO_PAGE_SLUGS = [
  "terminos",
  "privacidad",
  "cambios-y-devoluciones",
  "envios",
  "guia-de-talles",
  "faq",
  "contacto",
] as const;

export type InfoPageSlug = (typeof INFO_PAGE_SLUGS)[number];

export function isInfoPageSlug(slug: string): slug is InfoPageSlug {
  return (INFO_PAGE_SLUGS as readonly string[]).includes(slug);
}

export const INFO_PAGES: Record<InfoPageSlug, PageContent> = {
  terminos: {
    kind: "info",
    title: "Términos y condiciones",
    description:
      "Condiciones de uso de la tienda online de Alaska Indumentaria.",
    sections: [
      {
        type: "paragraph",
        text: "Al realizar una compra en Alaska Indumentaria aceptás estos términos y condiciones. Te recomendamos leerlos antes de finalizar tu pedido.",
      },
      { type: "heading", text: "Compras y precios" },
      {
        type: "list",
        items: [
          "Los precios están expresados en pesos argentinos (ARS) e incluyen IVA cuando corresponda.",
          "Las promociones y descuentos aplican solo durante el período indicado en el sitio.",
          "Nos reservamos el derecho de corregir errores de precio o descripción antes de confirmar el pedido.",
        ],
      },
      { type: "heading", text: "Pagos" },
      {
        type: "paragraph",
        text: "Los pagos se procesan de forma segura a través de Mercado Pago. La confirmación del pedido queda sujeta a la acreditación del pago.",
      },
      { type: "heading", text: "Envíos y entregas" },
      {
        type: "paragraph",
        text: "Los plazos de entrega son estimados y pueden variar según la zona y el operador logístico. Consultá nuestra página de envíos para más detalle.",
      },
      { type: "heading", text: "Propiedad intelectual" },
      {
        type: "paragraph",
        text: "Todo el contenido del sitio (textos, imágenes, marcas y diseño) es propiedad de Alaska Indumentaria o de sus licenciantes. Queda prohibida su reproducción sin autorización.",
      },
      { type: "heading", text: "Modificaciones" },
      {
        type: "paragraph",
        text: "Podemos actualizar estos términos en cualquier momento. La versión vigente será la publicada en esta página.",
      },
    ],
  },
  privacidad: {
    kind: "info",
    title: "Política de privacidad",
    description:
      "Cómo recopilamos, usamos y protegemos tus datos personales.",
    sections: [
      {
        type: "paragraph",
        text: "En Alaska Indumentaria respetamos tu privacidad. Esta política describe qué datos recopilamos cuando usás nuestra tienda online y con qué fin.",
      },
      { type: "heading", text: "Datos que recopilamos" },
      {
        type: "list",
        items: [
          "Nombre, email y teléfono al realizar una compra o contactarnos.",
          "Dirección de envío cuando elegís envío a domicilio.",
          "Datos de navegación básicos (cookies técnicas necesarias para el funcionamiento del sitio y el carrito).",
        ],
      },
      { type: "heading", text: "Uso de la información" },
      {
        type: "list",
        items: [
          "Procesar y entregar tus pedidos.",
          "Enviarte confirmaciones y novedades relacionadas con tu compra.",
          "Responder consultas y brindar soporte.",
          "Cumplir obligaciones legales y fiscales.",
        ],
      },
      { type: "heading", text: "Compartir datos con terceros" },
      {
        type: "paragraph",
        text: "Compartimos datos solo con proveedores necesarios para operar la tienda (por ejemplo, Mercado Pago para pagos y servicios de email transaccional). No vendemos tu información personal.",
      },
      { type: "heading", text: "Tus derechos" },
      {
        type: "paragraph",
        text: "Podés solicitar acceso, rectificación o eliminación de tus datos escribiéndonos a través de la página de contacto. Responderemos en un plazo razonable.",
      },
      { type: "heading", text: "Seguridad" },
      {
        type: "paragraph",
        text: "Implementamos medidas técnicas y organizativas para proteger tu información. Ningún sistema es 100% infalible; te pedimos que uses contraseñas seguras si en el futuro habilitamos cuentas de cliente.",
      },
    ],
  },
  "cambios-y-devoluciones": {
    kind: "info",
    title: "Cambios y devoluciones",
    description:
      "Política de cambios, devoluciones y arrepentimiento de compra.",
    sections: [
      {
        type: "paragraph",
        text: "Queremos que estés conforme con tu compra. Si el producto no te queda o llegó con un defecto, estas son las condiciones para cambios y devoluciones.",
      },
      { type: "heading", text: "Plazo" },
      {
        type: "paragraph",
        text: "Tenés 10 días corridos desde que recibís el producto para solicitar un cambio o devolución, de acuerdo con la Ley de Defensa del Consumidor (derecho de arrepentimiento en compras a distancia).",
      },
      { type: "heading", text: "Condiciones del producto" },
      {
        type: "list",
        items: [
          "Debe estar sin uso, con etiquetas originales y en su empaque.",
          "Ropa interior, medias y productos personalizados no admiten devolución por higiene.",
          "Si el producto llegó defectuoso o incorrecto, los gastos de devolución los asumimos nosotros.",
        ],
      },
      { type: "heading", text: "Cómo iniciar un cambio o devolución" },
      {
        type: "list",
        items: [
          "Escribinos por la página de contacto indicando número de pedido y motivo.",
          "Te enviaremos las instrucciones para el envío o retiro en local.",
          "Una vez recibido y verificado el producto, procesamos el cambio o el reembolso.",
        ],
      },
      { type: "heading", text: "Reembolsos" },
      {
        type: "paragraph",
        text: "Los reembolsos se realizan por el mismo medio de pago utilizado en la compra. El plazo de acreditación depende de tu banco o de Mercado Pago.",
      },
    ],
  },
  envios: {
    kind: "info",
    title: "Envíos y entregas",
    description:
      "Opciones de envío, costos y plazos de entrega a todo el país.",
    sections: [
      {
        type: "paragraph",
        text: "Realizamos envíos a todo el territorio argentino. También podés retirar tu pedido en nuestro local si la opción está disponible en el checkout.",
      },
      { type: "heading", text: "Envío a domicilio" },
      {
        type: "list",
        items: [
          "El costo de envío se calcula al finalizar la compra según la tarifa configurada para tu pedido.",
          "Una vez acreditado el pago, preparamos tu pedido en 1 a 3 días hábiles.",
          "El tiempo de tránsito depende del correo o transportista y tu ubicación (habitualmente 3 a 7 días hábiles adicionales).",
        ],
      },
      { type: "heading", text: "Retiro en local" },
      {
        type: "paragraph",
        text: "Si elegís retiro en local, te avisaremos por email cuando tu pedido esté listo. Presentá tu número de pedido y documento al retirar.",
      },
      { type: "heading", text: "Seguimiento" },
      {
        type: "paragraph",
        text: "Cuando despachemos tu pedido, te enviaremos el código de seguimiento por email (cuando el operador lo provea).",
      },
      { type: "heading", text: "Zonas de difícil acceso" },
      {
        type: "paragraph",
        text: "Algunas localidades pueden tener plazos extendidos o costos adicionales. Si hay alguna diferencia, te contactaremos antes de despachar.",
      },
    ],
  },
  "guia-de-talles": {
    kind: "info",
    title: "Guía de talles",
    description:
      "Referencias para elegir el talle correcto en tops, leggings y shorts.",
    sections: [
      {
        type: "paragraph",
        text: "Nuestras prendas están pensadas para entrenamiento y CrossFit. Si estás entre dos talles y preferís compresión firme, elegí el talle menor; si preferís mayor comodidad, el talle mayor.",
      },
      { type: "heading", text: "Tops y remeras (hombre / unisex)" },
      {
        type: "list",
        items: [
          "XS: pecho 86–91 cm",
          "S: pecho 91–97 cm",
          "M: pecho 97–102 cm",
          "L: pecho 102–107 cm",
          "XL: pecho 107–112 cm",
        ],
      },
      { type: "heading", text: "Tops deportivos (mujer)" },
      {
        type: "list",
        items: [
          "XS: contorno bajo busto 68–72 cm",
          "S: 72–76 cm",
          "M: 76–81 cm",
          "L: 81–86 cm",
          "XL: 86–91 cm",
        ],
      },
      { type: "heading", text: "Leggings y calzas" },
      {
        type: "list",
        items: [
          "XS: cadera 82–87 cm · largo 92 cm",
          "S: cadera 87–92 cm · largo 94 cm",
          "M: cadera 92–97 cm · largo 96 cm",
          "L: cadera 97–102 cm · largo 98 cm",
          "XL: cadera 102–107 cm · largo 100 cm",
        ],
      },
      { type: "heading", text: "Shorts" },
      {
        type: "paragraph",
        text: "Los shorts siguen la misma escala de cintura que los leggings. El largo es de 5\" (12,5 cm) en talle M; varía levemente según el talle.",
      },
      { type: "heading", text: "¿Dudas?" },
      {
        type: "paragraph",
        text: "Si tenés dudas sobre qué talle elegir, escribinos por la página de contacto con tus medidas y el producto que te interesa.",
      },
    ],
  },
  faq: {
    kind: "info",
    title: "Preguntas frecuentes",
    description: "Respuestas rápidas a las consultas más comunes.",
    sections: [
      { type: "heading", text: "¿Cómo compro?" },
      {
        type: "paragraph",
        text: "Elegí los productos, agregalos al carrito y seguí los pasos del checkout. Podés pagar con Mercado Pago (tarjetas, débito y más medios según disponibilidad).",
      },
      { type: "heading", text: "¿Cuándo me confirman el pedido?" },
      {
        type: "paragraph",
        text: "Recibirás un email de confirmación cuando el pago sea acreditado. Si elegiste retiro en local, te avisaremos cuando esté listo para retirar.",
      },
      { type: "heading", text: "¿Puedo cambiar o devolver un producto?" },
      {
        type: "paragraph",
        text: "Sí, dentro de los 10 días corridos desde la recepción y cumpliendo las condiciones de la página de cambios y devoluciones.",
      },
      { type: "heading", text: "¿Hacen envíos al interior?" },
      {
        type: "paragraph",
        text: "Sí, enviamos a todo el país. Los plazos varían según la zona.",
      },
      { type: "heading", text: "¿Los productos tienen garantía?" },
      {
        type: "paragraph",
        text: "Los defectos de fabricación están cubiertos. Contactanos con fotos del producto y tu número de pedido para gestionar el caso.",
      },
      { type: "heading", text: "¿Cómo los contacto?" },
      {
        type: "paragraph",
        text: "Usá nuestra página de contacto o escribinos al email publicado allí. Respondemos de lunes a viernes en horario comercial.",
      },
    ],
  },
  contacto: {
    kind: "contact",
    title: "Contacto",
    description:
      "Escribinos para consultas sobre productos, pedidos, cambios o devoluciones.",
  },
};

export function getContactEmail() {
  return (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
    process.env.STORE_NOTIFICATION_EMAIL ??
    "contacto@alaskaindumentaria.com"
  );
}
