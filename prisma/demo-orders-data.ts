/** Marcador en email para identificar y borrar pedidos de demo. */
export const DEMO_ORDER_EMAIL_DOMAIN = "@demo.nexus-store.local";

export const DEMO_CUSTOMERS = [
  {
    name: "Lucía Fernández",
    email: "lucia.fernandez@demo.nexus-store.local",
    phone: "+54 11 4521-8834",
    city: "Palermo, CABA",
    address: "Av. Santa Fe 3200",
    zip: "1425",
  },
  {
    name: "Martín Gómez",
    email: "martin.gomez@demo.nexus-store.local",
    phone: "+54 11 4789-2210",
    city: "Belgrano, CABA",
    address: "Monroe 2450",
    zip: "1428",
  },
  {
    name: "Valentina Ruiz",
    email: "valentina.ruiz@demo.nexus-store.local",
    phone: "+54 351 555-0192",
    city: "Córdoba Capital",
    address: "Bv. San Juan 1250",
    zip: "5000",
  },
  {
    name: "Santiago Morales",
    email: "santiago.morales@demo.nexus-store.local",
    phone: "+54 11 5566-4412",
    city: "Villa Crespo, CABA",
    address: "Corrientes 5400",
    zip: "1414",
  },
  {
    name: "Camila Acosta",
    email: "camila.acosta@demo.nexus-store.local",
    phone: "+54 221 455-8821",
    city: "La Plata",
    address: "Calle 12 entre 50 y 51",
    zip: "1900",
  },
  {
    name: "Diego Herrera",
    email: "diego.herrera@demo.nexus-store.local",
    phone: "+54 11 4890-3310",
    city: "Caballito, CABA",
    address: "Rivadavia 6100",
    zip: "1406",
  },
  {
    name: "Florencia Pérez",
    email: "florencia.perez@demo.nexus-store.local",
    phone: "+54 341 555-7720",
    city: "Rosario",
    address: "San Martín 1200",
    zip: "2000",
  },
  {
    name: "Nicolás Vega",
    email: "nicolas.vega@demo.nexus-store.local",
    phone: "+54 11 4021-9981",
    city: "San Isidro",
    address: "Av. del Libertador 15800",
    zip: "1642",
  },
] as const;

export type DemoOrderItem = {
  productSlug: string;
  size: string;
  color: string;
  quantity: number;
};

export type DemoOrderPlan = {
  createdAt: Date;
  customerIndex: number;
  status: "PAID" | "SHIPPED";
  pickup?: boolean;
  items: DemoOrderItem[];
};

const ORDER_TEMPLATES: Array<{
  status: "PAID" | "SHIPPED";
  pickup?: boolean;
  items: DemoOrderItem[];
}> = [
  {
    status: "PAID",
    items: [{ productSlug: "remera-dry-fit-wod", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "legging-alta-compresion", size: "S", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "top-deportivo-sin-mangas", size: "S", color: "Negro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "short-training-5", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    pickup: true,
    items: [{ productSlug: "munequeras-wod", size: "M", color: "Negro", quantity: 2 }],
  },
  {
    status: "PAID",
    items: [
      { productSlug: "remera-dry-fit-wod", size: "L", color: "Gris", quantity: 1 },
      { productSlug: "munequeras-wod", size: "L", color: "Negro", quantity: 1 },
    ],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "legging-seamless-cintura-alta", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "hoodie-oversize-post-wod", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "cinturon-de-levantamiento", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [
      { productSlug: "top-deportivo-sin-mangas", size: "M", color: "Rosa", quantity: 1 },
      { productSlug: "short-training-5", size: "S", color: "Azul", quantity: 1 },
    ],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "remera-manga-larga-tech", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "short-hombre-training-pro", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "remera-embrace-the-suck", size: "M", color: "Negro", quantity: 2 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "musculosa-training-fit", size: "S", color: "Negro", quantity: 2 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "remera-crop-training", size: "S", color: "Rosa", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "remera-box-fit-hombre", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "musculosa-ribbed-fit", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "musculosa-unisex-wod", size: "M", color: "Gris", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "musculosa-crossfit-pro", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "musculosa-essential-hombre", size: "L", color: "Blanco", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "top-longline-support", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "top-cruzado-yoga-fit", size: "S", color: "Rosa", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "top-halter-performance", size: "M", color: "Coral", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "top-basico-algodon", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "calza-capri-training", size: "S", color: "Negro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "calza-pocket-7-8", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "calza-unisex-compression", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "short-bike-4", size: "S", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "short-woven-unisex", size: "M", color: "Gris", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "short-liner-running", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "buzo-half-zip-performance", size: "M", color: "Gris oscuro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "buzo-crop-mujer", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "buzo-full-zip-tech", size: "L", color: "Azul", quantity: 1 }],
  },
  {
    status: "PAID",
    pickup: true,
    items: [{ productSlug: "buzo-french-terry", size: "S", color: "Crema", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "rodilleras-neoprene", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "coderas-proteccion", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "bolso-gym-duffle", size: "L", color: "Gris", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [
      { productSlug: "legging-alta-compresion", size: "M", color: "Borgoña", quantity: 1 },
      { productSlug: "top-deportivo-sin-mangas", size: "S", color: "Verde", quantity: 1 },
    ],
  },
  {
    status: "SHIPPED",
    items: [
      { productSlug: "calza-pocket-7-8", size: "S", color: "Azul marino", quantity: 1 },
      { productSlug: "short-bike-4", size: "M", color: "Rosa", quantity: 1 },
    ],
  },
  {
    status: "PAID",
    pickup: true,
    items: [
      { productSlug: "bolso-gym-duffle", size: "M", color: "Negro", quantity: 1 },
      { productSlug: "coderas-proteccion", size: "S", color: "Rojo", quantity: 1 },
    ],
  },
];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function withBusinessHour(day: Date, slotInDay: number): Date {
  const result = new Date(day);
  const hour = 9 + Math.min(slotInDay % 12, 11);
  const minute = 8 + ((slotInDay * 13) % 52);
  result.setHours(hour, minute, 0, 0);
  return result;
}

/** Pedidos por día: pocas al inicio del mes, pico de 10 el último día. */
function ordersForDay(day: number, lastDay: number): number {
  if (day === lastDay) return 10;

  const progress = day / lastDay;

  if (progress <= 0.12) return 0;
  if (progress <= 0.28) return 1;
  if (progress <= 0.42) return 2;
  if (progress <= 0.55) return 3;
  if (progress <= 0.67) return 4;
  if (progress <= 0.78) return 5;
  if (progress <= 0.88) return 7;
  return 8;
}

function buildAscendingCurrentMonth(today: Date, sequenceStart: number): DemoOrderPlan[] {
  const todayDay = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();
  const plans: DemoOrderPlan[] = [];
  let sequence = sequenceStart;

  for (let day = 1; day <= todayDay; day++) {
    const ordersToday = ordersForDay(day, todayDay);

    for (let slot = 0; slot < ordersToday; slot++) {
      const template = ORDER_TEMPLATES[sequence % ORDER_TEMPLATES.length];
      plans.push({
        createdAt: withBusinessHour(new Date(year, month, day), slot),
        customerIndex: (day + slot + sequence) % DEMO_CUSTOMERS.length,
        status: template.status,
        pickup: template.pickup,
        items: template.items,
      });
      sequence += 1;
    }
  }

  return plans;
}

/** Días del mes anterior dentro de la ventana de 30 días: muy pocas ventas. */
function buildTrailingWindowPlans(today: Date, sequenceStart: number): DemoOrderPlan[] {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const windowStart = new Date(today);
  windowStart.setDate(today.getDate() - 29);

  if (windowStart >= monthStart) return [];

  const plans: DemoOrderPlan[] = [];
  let sequence = sequenceStart;
  const cursor = new Date(windowStart);
  let dayIndex = 0;

  const totalDays = Math.ceil(
    (monthStart.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  while (cursor < monthStart) {
    const progress = dayIndex / Math.max(totalDays - 1, 1);
    const interval = progress < 0.55 ? 6 : 4;

    if (dayIndex % interval === 0) {
      const template = ORDER_TEMPLATES[sequence % ORDER_TEMPLATES.length];
      plans.push({
        createdAt: withBusinessHour(new Date(cursor), sequence),
        customerIndex: (dayIndex + sequence) % DEMO_CUSTOMERS.length,
        status: template.status,
        pickup: template.pickup,
        items: template.items,
      });
      sequence += 1;
    }

    cursor.setDate(cursor.getDate() + 1);
    dayIndex += 1;
  }

  return plans;
}

function buildPreviousMonthsHistory(today: Date, sequenceStart: number): DemoOrderPlan[] {
  const plans: DemoOrderPlan[] = [];
  let sequence = sequenceStart;

  const history = [
    { monthOffset: -1, day: 8, customerIndex: 1 },
    { monthOffset: -1, day: 19, customerIndex: 4 },
    { monthOffset: -2, day: 12, customerIndex: 2 },
    { monthOffset: -3, day: 6, customerIndex: 5 },
    { monthOffset: -4, day: 21, customerIndex: 3 },
    { monthOffset: -5, day: 14, customerIndex: 6 },
    { monthOffset: -6, day: 9, customerIndex: 0 },
  ];

  for (const entry of history) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() + entry.monthOffset,
      entry.day,
    );
    const template = ORDER_TEMPLATES[sequence % ORDER_TEMPLATES.length];

    plans.push({
      createdAt: withBusinessHour(date, sequence),
      customerIndex: entry.customerIndex,
      status: template.status,
      pickup: template.pickup,
      items: template.items,
    });
    sequence += 1;
  }

  return plans;
}

export function buildDemoOrderPlans(now = new Date()): DemoOrderPlan[] {
  const today = startOfDay(now);

  const trailing = buildTrailingWindowPlans(today, 0);
  const currentMonth = buildAscendingCurrentMonth(today, trailing.length);
  const history = buildPreviousMonthsHistory(today, trailing.length + currentMonth.length);

  return [...trailing, ...currentMonth, ...history];
}

export function summarizeDemoPlans(plans: DemoOrderPlan[], now = new Date()): string {
  const today = startOfDay(now);
  const month = today.getMonth();
  const year = today.getFullYear();

  const currentMonthCount = plans.filter((plan) => {
    const d = plan.createdAt;
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return `${plans.length} pedidos (${currentMonthCount} en el mes corriente, curva ascendente)`;
}
