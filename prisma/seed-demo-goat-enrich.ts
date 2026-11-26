/**
 * Post-catalog enrich for Goat demo: coupons, orders (~6 months), CRM, wishlist.
 * Called by seed-demo-goat after seedApp1Store.
 */
import {
  CouponType,
  PrismaClient,
  UserRole,
  type CheckoutPaymentMethod,
  type OrderStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEMO_COUPON_DEFS,
  DEMO_CUSTOMERS,
  DEMO_ORDER_EMAIL_DOMAIN,
  buildDemoOrderPlans,
  summarizeDemoPlans,
  type DemoOrderItem,
  type DemoOrderPlan,
} from "./demo-orders-data";
import {
  GOAT_DEMO_STORE_SLUG,
  GOAT_DEMO_WISHLIST_USERS,
} from "./demo-goat-lib";
import {
  SEED_CUSTOMER_EMAIL,
  SEED_CUSTOMER_NAME,
  SEED_CUSTOMER_PASSWORD,
} from "./seed-env";
import { ensureSeedCustomerUser } from "./seed-store-lib";

/** Costo demo para pedidos seed con envío a domicilio. */
const DEMO_SEED_SHIPPING_COST = 4500;

type VariantKey = string;

function variantKey(productSlug: string, size: string, color: string): VariantKey {
  return `${productSlug}|${size}|${color}`;
}

async function loadVariantMap(prisma: PrismaClient, storeId: string) {
  const products = await prisma.product.findMany({
    where: { storeId },
    select: {
      id: true,
      slug: true,
      variants: {
        select: { id: true, size: true, color: true, price: true },
      },
    },
  });

  const map = new Map<VariantKey, { id: string; price: number }>();
  const productIds: string[] = [];

  for (const product of products) {
    productIds.push(product.id);
    for (const variant of product.variants) {
      map.set(variantKey(product.slug, variant.size, variant.color), {
        id: variant.id,
        price: Number(variant.price),
      });
    }
  }

  return { map, productIds };
}

function resolveItems(
  items: DemoOrderItem[],
  variantMap: Map<VariantKey, { id: string; price: number }>,
) {
  return items.map((item) => {
    const key = variantKey(item.productSlug, item.size, item.color);
    const variant = variantMap.get(key);

    if (!variant) {
      throw new Error(
        `Variante no encontrada: ${item.productSlug} (${item.size}, ${item.color})`,
      );
    }

    return {
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice: variant.price,
    };
  });
}

function couponDiscountFor(
  plan: DemoOrderPlan,
  subtotal: number,
  def: (typeof DEMO_COUPON_DEFS)[number] | undefined,
): number {
  if (!def) return 0;
  if (subtotal < def.minOrderAmount) return 0;
  let discount =
    def.type === "PERCENTAGE"
      ? Math.round((subtotal * def.value) / 100)
      : def.value;
  if (def.maxDiscount != null) {
    discount = Math.min(discount, def.maxDiscount);
  }
  return Math.min(discount, subtotal);
}

async function seedCoupons(prisma: PrismaClient, storeId: string, now: Date) {
  const startsAt = new Date(now);
  startsAt.setMonth(startsAt.getMonth() - 6);
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 3);

  const coupons: Array<{ id: string; code: string; index: number }> = [];

  for (let i = 0; i < DEMO_COUPON_DEFS.length; i++) {
    const def = DEMO_COUPON_DEFS[i]!;
    const created = await prisma.coupon.create({
      data: {
        storeId,
        code: def.code,
        type:
          def.type === "PERCENTAGE"
            ? CouponType.PERCENTAGE
            : CouponType.FIXED_AMOUNT,
        value: def.value,
        minOrderAmount: def.minOrderAmount,
        maxDiscount: def.maxDiscount,
        usageLimit: def.usageLimit,
        usedCount: 0,
        startsAt,
        expiresAt,
        active: true,
        createdAt: startsAt,
      },
    });
    coupons.push({ id: created.id, code: created.code, index: i });
  }

  return coupons;
}

async function seedOrders(
  prisma: PrismaClient,
  storeId: string,
  coupons: Array<{ id: string; code: string; index: number }>,
  variantMap: Map<VariantKey, { id: string; price: number }>,
  customerUserByEmail: Map<string, string>,
) {
  const plans = buildDemoOrderPlans();
  const usedCountByCouponId = new Map<string, number>();
  let created = 0;

  for (const plan of plans) {
    const customer = DEMO_CUSTOMERS[plan.customerIndex % DEMO_CUSTOMERS.length]!;
    const resolvedItems = resolveItems(plan.items, variantMap);
    const subtotal = resolvedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const coupon =
      plan.couponIndex != null
        ? coupons.find((c) => c.index === plan.couponIndex)
        : undefined;
    const couponDef =
      plan.couponIndex != null ? DEMO_COUPON_DEFS[plan.couponIndex] : undefined;
    const couponDiscount = couponDiscountFor(plan, subtotal, couponDef);

    const shippingCost = plan.pickup ? 0 : DEMO_SEED_SHIPPING_COST;
    const total = Math.max(0, subtotal + shippingCost - couponDiscount);

    const paymentMethod: CheckoutPaymentMethod =
      plan.paymentMethod ??
      (plan.pickup ? "CASH" : "MERCADO_PAGO");

    const status = plan.status as OrderStatus;
    const isPaidLike = status === "PAID" || status === "SHIPPED";

    const confirmationEmailSentAt = isPaidLike
      ? new Date(plan.createdAt.getTime() + 5 * 60_000)
      : null;
    const shippingEstimatedDelivery =
      !plan.pickup && status === "SHIPPED"
        ? new Date(plan.createdAt.getTime() + 4 * 24 * 60 * 60_000)
        : null;

    if (coupon && couponDiscount > 0 && isPaidLike) {
      usedCountByCouponId.set(
        coupon.id,
        (usedCountByCouponId.get(coupon.id) ?? 0) + 1,
      );
    }

    await prisma.order.create({
      data: {
        storeId,
        userId: customerUserByEmail.get(customer.email) ?? null,
        status,
        total,
        shippingCost,
        couponId: coupon && couponDiscount > 0 ? coupon.id : null,
        couponCode: coupon && couponDiscount > 0 ? coupon.code : null,
        couponDiscount,
        paymentMethod,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        isPickup: Boolean(plan.pickup),
        shippingAddress: plan.pickup ? "Retiro en local" : customer.address,
        shippingCity: customer.city,
        shippingZip: customer.zip,
        shippingCarrierId: plan.pickup ? null : "mercado_envios",
        shippingCarrierName: plan.pickup ? null : "Mercado Envíos",
        shippingEstimatedDelivery,
        confirmationEmailSentAt,
        createdAt: plan.createdAt,
        updatedAt: plan.createdAt,
        items: {
          create: resolvedItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });

    created += 1;
  }

  for (const [couponId, usedCount] of usedCountByCouponId) {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount },
    });
  }

  return { created, summary: summarizeDemoPlans(plans) };
}

async function seedCrm(
  prisma: PrismaClient,
  storeId: string,
  now: Date,
) {
  const segmentCreatedAt = new Date(now);
  segmentCreatedAt.setMonth(segmentCreatedAt.getMonth() - 2);

  for (let i = 0; i < DEMO_CUSTOMERS.length; i++) {
    const customer = DEMO_CUSTOMERS[i]!;
    const isVip =
      customer.email === SEED_CUSTOMER_EMAIL ||
      customer.email.startsWith("martin") ||
      customer.email.startsWith("valentina") ||
      customer.email.startsWith("lucia");
    const isWholesale = customer.email.startsWith("bruno");
    const tags = [
      "demo",
      ...(isVip ? (["vip"] as const) : []),
      ...(isWholesale ? (["mayorista"] as const) : []),
      ...(i % 3 === 0 ? (["newsletter"] as const) : []),
      ...(i % 4 === 1 ? (["box"] as const) : []),
    ];
    const notes = isVip
      ? "Cliente demo frecuente — útil para demos de CRM / VIP."
      : isWholesale
        ? "Consulta mayorista demo (box / grupo)."
        : `Contacto demo Goat · ${customer.city}.`;

    await prisma.storeCustomer.upsert({
      where: {
        storeId_email: { storeId, email: customer.email },
      },
      create: {
        storeId,
        email: customer.email,
        tags: [...tags],
        notes,
        updatedAt: now,
      },
      update: {
        tags: [...tags],
        notes,
        updatedAt: now,
      },
    });
  }

  const segments = [
    {
      name: "Inactivos 30 días",
      filters: { inactiveDays: 30, sort: "lastOrder" },
    },
    {
      name: "Top gasto",
      filters: { sort: "totalSpent" },
    },
    {
      name: "VIP demo",
      filters: { tag: "vip", sort: "orderCount" },
    },
  ] as const;

  for (const segment of segments) {
    await prisma.storeCrmSegment.upsert({
      where: {
        storeId_name: { storeId, name: segment.name },
      },
      create: {
        storeId,
        name: segment.name,
        filters: segment.filters,
        createdAt: segmentCreatedAt,
        updatedAt: segmentCreatedAt,
      },
      update: {
        filters: segment.filters,
        updatedAt: now,
      },
    });
  }

  return {
    customers: DEMO_CUSTOMERS.length,
    segments: segments.length,
  };
}

async function ensureDemoWishlistUsers(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash(SEED_CUSTOMER_PASSWORD, 12);
  const byEmail = new Map<string, string>();

  const primary = await ensureSeedCustomerUser();
  byEmail.set(SEED_CUSTOMER_EMAIL, primary.id);

  for (const user of GOAT_DEMO_WISHLIST_USERS) {
    const row = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        name: user.name,
        role: UserRole.CUSTOMER,
      },
      create: {
        email: user.email,
        passwordHash,
        name: user.name,
        role: UserRole.CUSTOMER,
      },
    });
    byEmail.set(user.email, row.id);
  }

  // Map remaining DEMO_CUSTOMERS emails without accounts (orders only).
  for (const customer of DEMO_CUSTOMERS) {
    if (!byEmail.has(customer.email) && customer.email === SEED_CUSTOMER_EMAIL) {
      byEmail.set(customer.email, primary.id);
    }
  }

  return byEmail;
}

async function seedWishlist(
  prisma: PrismaClient,
  storeId: string,
  productIds: string[],
  userByEmail: Map<string, string>,
  now: Date,
) {
  if (productIds.length === 0) return 0;

  const userIds = [
    userByEmail.get(SEED_CUSTOMER_EMAIL),
    ...GOAT_DEMO_WISHLIST_USERS.map((u) => userByEmail.get(u.email)),
  ].filter((id): id is string => Boolean(id));

  let created = 0;
  let sequence = 0;

  for (const userId of userIds) {
    const count = 3 + (sequence % 3);
    for (let i = 0; i < count; i++) {
      const productId = productIds[(sequence + i * 5) % productIds.length]!;
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - (7 + sequence * 3 + i * 2));

      try {
        await prisma.wishlistItem.create({
          data: {
            storeId,
            userId,
            productId,
            createdAt,
          },
        });
        created += 1;
      } catch {
        // unique constraint — skip duplicates
      }
    }
    sequence += 1;
  }

  return created;
}

export type GoatEnrichSummary = {
  storeSlug: string;
  orders: number;
  orderSummary: string;
  coupons: number;
  crmCustomers: number;
  crmSegments: number;
  wishlistItems: number;
};

export async function enrichGoatDemo(
  prisma: PrismaClient,
  storeId: string,
  now = new Date(),
): Promise<GoatEnrichSummary> {
  // Clear transactional demo overlays if re-running enrich without full wipe
  // (full seed already wiped the store; this keeps orders-only re-runs safe).
  await prisma.orderItem.deleteMany({ where: { order: { storeId } } });
  await prisma.order.deleteMany({ where: { storeId } });
  await prisma.wishlistItem.deleteMany({ where: { storeId } });
  await prisma.coupon.deleteMany({ where: { storeId } });
  await prisma.storeCrmSegment.deleteMany({ where: { storeId } });
  await prisma.storeCustomer.deleteMany({ where: { storeId } });

  const { map: variantMap, productIds } = await loadVariantMap(prisma, storeId);
  const userByEmail = await ensureDemoWishlistUsers(prisma);
  const coupons = await seedCoupons(prisma, storeId, now);
  const { created, summary } = await seedOrders(
    prisma,
    storeId,
    coupons,
    variantMap,
    userByEmail,
  );
  const crm = await seedCrm(prisma, storeId, now);
  const wishlistItems = await seedWishlist(
    prisma,
    storeId,
    productIds,
    userByEmail,
    now,
  );

  return {
    storeSlug: GOAT_DEMO_STORE_SLUG,
    orders: created,
    orderSummary: summary,
    coupons: coupons.length,
    crmCustomers: crm.customers,
    crmSegments: crm.segments,
    wishlistItems,
  };
}

export { DEMO_ORDER_EMAIL_DOMAIN, SEED_CUSTOMER_NAME };
