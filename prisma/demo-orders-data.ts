import {
  SEED_CUSTOMER_EMAIL,
  SEED_CUSTOMER_NAME,
} from "./seed-env";

/** Marcador en email para identificar y borrar pedidos de demo. */
export const DEMO_ORDER_EMAIL_DOMAIN = "@demo.nexus-store.local";

export const DEMO_CUSTOMERS = [
  {
    name: SEED_CUSTOMER_NAME,
    email: SEED_CUSTOMER_EMAIL,
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
  {
    name: "Lucía Fernández",
    email: "lucia.fernandez@demo.nexus-store.local",
    phone: "+54 11 5234-6671",
    city: "Núñez, CABA",
    address: "Cabildo 3800",
    zip: "1429",
  },
  {
    name: "Tomás Ríos",
    email: "tomas.rios@demo.nexus-store.local",
    phone: "+54 261 444-0198",
    city: "Mendoza",
    address: "San Martín 950",
    zip: "5500",
  },
  {
    name: "Agustina López",
    email: "agustina.lopez@demo.nexus-store.local",
    phone: "+54 11 4877-2201",
    city: "Recoleta, CABA",
    address: "Junín 1200",
    zip: "1113",
  },
  {
    name: "Bruno Castillo",
    email: "bruno.castillo@demo.nexus-store.local",
    phone: "+54 341 422-8810",
    city: "Rosario",
    address: "Pellegrini 2100",
    zip: "2000",
  },
] as const;

export type DemoOrderItem = {
  productSlug: string;
  size: string;
  color: string;
  quantity: number;
};

export type DemoOrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

export type DemoPaymentMethod =
  | "MERCADO_PAGO"
  | "TRANSFER"
  | "CASH"
  | "CARD";

export type DemoOrderPlan = {
  createdAt: Date;
  customerIndex: number;
  status: DemoOrderStatus;
  pickup?: boolean;
  /** Index into DEMO_COUPON_DEFS; omit = no coupon. */
  couponIndex?: number;
  paymentMethod?: DemoPaymentMethod;
  items: DemoOrderItem[];
};

/** Coupon definitions for Goat demo enrich (codes unique per store). */
export const DEMO_COUPON_DEFS = [
  {
    code: "WELCOME10",
    type: "PERCENTAGE" as const,
    value: 10,
    minOrderAmount: 0,
    maxDiscount: 15000,
    usageLimit: 200,
  },
  {
    code: "GOAT2K",
    type: "FIXED_AMOUNT" as const,
    value: 2000,
    minOrderAmount: 15000,
    maxDiscount: null,
    usageLimit: 100,
  },
  {
    code: "SPORT15",
    type: "PERCENTAGE" as const,
    value: 15,
    minOrderAmount: 20000,
    maxDiscount: 25000,
    usageLimit: 80,
  },
  {
    code: "ENVIO5K",
    type: "FIXED_AMOUNT" as const,
    value: 5000,
    minOrderAmount: 10000,
    maxDiscount: null,
    usageLimit: 150,
  },
  {
    code: "VIP20",
    type: "PERCENTAGE" as const,
    value: 20,
    minOrderAmount: 30000,
    maxDiscount: 40000,
    usageLimit: 40,
  },
] as const;

/**
 * Explicit calendar-month hero units for dashboard Top productos bars.
 * Must stay distinct (~12 / 8 / 5 / 3 / 1). Current-month cycling skips these slugs
 * so totals stay exact (PAID/SHIPPED only).
 */
export const CURRENT_MONTH_HERO_RANKING = [
  {
    productSlug: "remera-dry-fit-wod",
    size: "M",
    color: "Negro",
    quantity: 12,
    status: "PAID" as const,
    paymentMethod: "MERCADO_PAGO" as const,
  },
  {
    productSlug: "legging-alta-compresion",
    size: "S",
    color: "Negro",
    quantity: 8,
    status: "SHIPPED" as const,
    paymentMethod: "CARD" as const,
  },
  {
    productSlug: "top-deportivo-sin-mangas",
    size: "S",
    color: "Negro",
    quantity: 5,
    status: "PAID" as const,
    paymentMethod: "TRANSFER" as const,
  },
  {
    productSlug: "short-training-5",
    size: "M",
    color: "Negro",
    quantity: 3,
    status: "SHIPPED" as const,
    paymentMethod: "MERCADO_PAGO" as const,
  },
  {
    productSlug: "cinturon-de-levantamiento",
    size: "M",
    color: "Negro",
    quantity: 1,
    status: "PAID" as const,
    paymentMethod: "CARD" as const,
  },
] as const;

const HERO_PRODUCT_SLUGS = new Set<string>(
  CURRENT_MONTH_HERO_RANKING.map((hero) => hero.productSlug),
);

const ORDER_TEMPLATES: Array<{
  status: DemoOrderStatus;
  pickup?: boolean;
  couponIndex?: number;
  paymentMethod?: DemoPaymentMethod;
  items: DemoOrderItem[];
}> = [
  // Non-hero SKUs dominate cycling so hero ranking stays exact in current month.
  {
    status: "PAID",
    items: [{ productSlug: "musculosa-training-fit", size: "S", color: "Negro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "remera-embrace-the-suck", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [{ productSlug: "bolso-gym-duffle", size: "L", color: "Gris", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "calza-pocket-7-8", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    pickup: true,
    couponIndex: 0,
    paymentMethod: "TRANSFER",
    items: [{ productSlug: "munequeras-wod", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PENDING",
    paymentMethod: "MERCADO_PAGO",
    items: [{ productSlug: "hoodie-oversize-post-wod", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "CANCELLED",
    paymentMethod: "MERCADO_PAGO",
    items: [{ productSlug: "hoodie-oversize-post-wod", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    couponIndex: 1,
    paymentMethod: "CARD",
    items: [
      { productSlug: "musculosa-training-fit", size: "M", color: "Rosa", quantity: 1 },
      { productSlug: "munequeras-wod", size: "L", color: "Negro", quantity: 1 },
    ],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "legging-seamless-cintura-alta", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    couponIndex: 2,
    paymentMethod: "MERCADO_PAGO",
    items: [{ productSlug: "hoodie-oversize-post-wod", size: "L", color: "Negro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    couponIndex: 3,
    items: [{ productSlug: "short-bike-4", size: "S", color: "Negro", quantity: 1 }],
  },
  {
    status: "PAID",
    couponIndex: 4,
    paymentMethod: "TRANSFER",
    items: [
      { productSlug: "calza-pocket-7-8", size: "S", color: "Azul marino", quantity: 1 },
      { productSlug: "short-bike-4", size: "M", color: "Rosa", quantity: 1 },
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
    items: [{ productSlug: "remera-embrace-the-suck", size: "M", color: "Blanco", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "musculosa-training-fit", size: "S", color: "Rosa", quantity: 1 }],
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
    items: [{ productSlug: "rodilleras-5-mm", size: "M", color: "Negro", quantity: 1 }],
  },
  {
    status: "SHIPPED",
    items: [{ productSlug: "bolso-gym-duffle", size: "L", color: "Gris", quantity: 1 }],
  },
  {
    status: "PAID",
    items: [
      { productSlug: "legging-seamless-cintura-alta", size: "M", color: "Coral", quantity: 1 },
      { productSlug: "top-halter-performance", size: "S", color: "Negro", quantity: 1 },
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
      { productSlug: "rodilleras-5-mm", size: "M", color: "Rojo", quantity: 1 },
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

function planFromTemplate(
  template: (typeof ORDER_TEMPLATES)[number],
  createdAt: Date,
  customerIndex: number,
): DemoOrderPlan {
  return {
    createdAt,
    customerIndex,
    status: template.status,
    pickup: template.pickup,
    couponIndex: template.couponIndex,
    paymentMethod: template.paymentMethod,
    items: template.items,
  };
}

/** Pedidos por día en el mes corriente: pocas al inicio, pico cerca de hoy + dip finde. */
function ordersForCurrentMonthDay(
  day: number,
  lastDay: number,
  year: number,
  month: number,
): number {
  if (day === lastDay) return 6;

  const weekday = new Date(year, month, day).getDay(); // 0=Sun
  const progress = day / lastDay;

  // Slightly thinner than before so cycling SKUs stay below hero staircase.
  let base: number;
  if (progress <= 0.12) base = 0;
  else if (progress <= 0.28) base = 1;
  else if (progress <= 0.45) base = 2;
  else if (progress <= 0.62) base = 2;
  else if (progress <= 0.78) base = 3;
  else if (progress <= 0.9) base = 4;
  else base = 5;

  if (base === 0) return 0;
  // Soft weekend dip so activity chart is not a flat ramp.
  if (weekday === 0) return Math.max(1, base - 2);
  if (weekday === 6) return Math.max(1, base - 1);
  return base;
}

function templateTouchesHero(
  template: (typeof ORDER_TEMPLATES)[number],
): boolean {
  return template.items.some((item) => HERO_PRODUCT_SLUGS.has(item.productSlug));
}

/**
 * Non-hero PAID/SHIPPED units in current month must stay at 0 so Top productos
 * is exactly the hero staircase (12/8/5/3/1). Chart volume comes from hero
 * line-items split across days + six-month history.
 */
const MAX_NON_HERO_MONTH_UNITS = 0;

function templateFitsNonHeroCap(
  template: (typeof ORDER_TEMPLATES)[number],
  unitTally: Map<string, number>,
): boolean {
  if (templateTouchesHero(template)) return false;
  if (template.status !== "PAID" && template.status !== "SHIPPED") return true;
  for (const item of template.items) {
    const next = (unitTally.get(item.productSlug) ?? 0) + item.quantity;
    if (next > MAX_NON_HERO_MONTH_UNITS) return false;
  }
  return true;
}

function applyTemplateUnits(
  template: (typeof ORDER_TEMPLATES)[number],
  unitTally: Map<string, number>,
) {
  if (template.status !== "PAID" && template.status !== "SHIPPED") return;
  for (const item of template.items) {
    unitTally.set(
      item.productSlug,
      (unitTally.get(item.productSlug) ?? 0) + item.quantity,
    );
  }
}

function nextCappedNonHeroTemplate(
  sequence: number,
  unitTally: Map<string, number>,
): (typeof ORDER_TEMPLATES)[number] {
  for (let offset = 0; offset < ORDER_TEMPLATES.length * 2; offset++) {
    const template = ORDER_TEMPLATES[(sequence + offset) % ORDER_TEMPLATES.length]!;
    if (templateFitsNonHeroCap(template, unitTally)) return template;
  }
  // Fallback: PENDING/CANCELLED only — never inflate paid units.
  const fallback = ORDER_TEMPLATES.find(
    (t) => t.status === "PENDING" || t.status === "CANCELLED",
  );
  return fallback ?? ORDER_TEMPLATES[sequence % ORDER_TEMPLATES.length]!;
}

function buildAscendingCurrentMonth(today: Date, sequenceStart: number): DemoOrderPlan[] {
  const todayDay = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();
  const plans: DemoOrderPlan[] = [];
  let sequence = sequenceStart;
  const unitTally = new Map<string, number>();

  for (let day = 1; day <= todayDay; day++) {
    const ordersToday = ordersForCurrentMonthDay(day, todayDay, year, month);

    for (let slot = 0; slot < ordersToday; slot++) {
      const template = nextCappedNonHeroTemplate(sequence, unitTally);
      applyTemplateUnits(template, unitTally);
      plans.push(
        planFromTemplate(
          template,
          withBusinessHour(new Date(year, month, day), slot),
          (day + slot + sequence) % DEMO_CUSTOMERS.length,
        ),
      );
      sequence += 1;
    }
  }

  return plans;
}

/**
 * Split each hero into qty-1 PAID/SHIPPED orders across the month.
 * Totals stay exact (12/8/5/3/1). Day picks round-robin with late-month bias
 * so the activity chart has varied (not flat) bars.
 */
function buildHeroRankingPlans(today: Date): DemoOrderPlan[] {
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDay = today.getDate();
  const plans: DemoOrderPlan[] = [];
  let slot = 0;
  const totalHeroUnits = CURRENT_MONTH_HERO_RANKING.reduce(
    (sum, hero) => sum + hero.quantity,
    0,
  );

  for (let heroIndex = 0; heroIndex < CURRENT_MONTH_HERO_RANKING.length; heroIndex++) {
    const hero = CURRENT_MONTH_HERO_RANKING[heroIndex]!;
    for (let unit = 0; unit < hero.quantity; unit++) {
      // Ascending density: early units → earlier days, later → today.
      const globalIndex = slot;
      const t = (globalIndex + 1) / totalHeroUnits;
      const skewed = Math.pow(t, 0.55);
      const useDay = Math.max(1, Math.min(todayDay, Math.ceil(skewed * todayDay)));

      plans.push({
        createdAt: withBusinessHour(new Date(year, month, useDay), unit + heroIndex),
        customerIndex: (heroIndex + unit) % DEMO_CUSTOMERS.length,
        status: hero.status,
        paymentMethod: hero.paymentMethod,
        couponIndex: heroIndex === 0 && unit === 0 ? 0 : undefined,
        items: [
          {
            productSlug: hero.productSlug,
            size: hero.size,
            color: hero.color,
            quantity: 1,
          },
        ],
      });
      slot += 1;
    }
  }

  return plans;
}

/**
 * ~6 months of history before current month (≈180 days total with current month).
 * Sparse early months, denser as we approach the current month.
 */
function buildSixMonthHistory(today: Date, sequenceStart: number): DemoOrderPlan[] {
  const monthStart = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
  const windowStart = startOfDay(new Date(today));
  windowStart.setDate(today.getDate() - 179);

  const plans: DemoOrderPlan[] = [];
  let sequence = sequenceStart;
  const cursor = new Date(windowStart);
  let dayIndex = 0;

  while (cursor < monthStart) {
    const daysFromStart = dayIndex;
    const progress = daysFromStart / 179;

    // Interval: every 3–4 days early, daily/near-daily approaching current month.
    let interval: number;
    if (progress < 0.3) interval = 3;
    else if (progress < 0.6) interval = 2;
    else interval = 1;

    if (dayIndex % interval === 0) {
      const slots = progress > 0.7 ? 2 : 1;
      for (let slot = 0; slot < slots; slot++) {
        const template = ORDER_TEMPLATES[sequence % ORDER_TEMPLATES.length]!;
        plans.push(
          planFromTemplate(
            template,
            withBusinessHour(new Date(cursor), sequence + slot),
            (dayIndex + sequence + slot) % DEMO_CUSTOMERS.length,
          ),
        );
        sequence += 1;
      }
    }

    cursor.setDate(cursor.getDate() + 1);
    dayIndex += 1;
  }

  return plans;
}

export function buildDemoOrderPlans(now = new Date()): DemoOrderPlan[] {
  const today = startOfDay(now);
  const history = buildSixMonthHistory(today, 0);
  const currentMonth = buildAscendingCurrentMonth(today, history.length);
  const heroes = buildHeroRankingPlans(today);
  return [...history, ...currentMonth, ...heroes];
}

export function summarizeDemoPlans(plans: DemoOrderPlan[], now = new Date()): string {
  const today = startOfDay(now);
  const month = today.getMonth();
  const year = today.getFullYear();

  const currentMonthCount = plans.filter((plan) => {
    const d = plan.createdAt;
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  const byStatus = plans.reduce<Record<string, number>>((acc, plan) => {
    acc[plan.status] = (acc[plan.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusSummary = Object.entries(byStatus)
    .map(([status, count]) => `${status}=${count}`)
    .join(", ");

  return `${plans.length} pedidos (${currentMonthCount} mes corriente; ${statusSummary})`;
}
