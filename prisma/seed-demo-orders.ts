import { PrismaClient } from "@prisma/client";
import {
  DEMO_CUSTOMERS,
  DEMO_ORDER_EMAIL_DOMAIN,
  buildDemoOrderPlans,
  summarizeDemoPlans,
  type DemoOrderItem,
} from "./demo-orders-data";
import { seedDefaults } from "./seed-env";

const prisma = new PrismaClient();
const STORE_SLUG = seedDefaults.storeSlug;

type VariantKey = string;

function variantKey(productSlug: string, size: string, color: string): VariantKey {
  return `${productSlug}|${size}|${color}`;
}

async function loadVariantMap(storeId: string) {
  const products = await prisma.product.findMany({
    where: { storeId },
    select: {
      slug: true,
      variants: {
        select: { id: true, size: true, color: true, price: true },
      },
    },
  });

  const map = new Map<VariantKey, { id: string; price: number }>();

  for (const product of products) {
    for (const variant of product.variants) {
      map.set(variantKey(product.slug, variant.size, variant.color), {
        id: variant.id,
        price: Number(variant.price),
      });
    }
  }

  return map;
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

async function main() {
  const store = await prisma.store.findUnique({
    where: { slug: STORE_SLUG },
  });

  if (!store) {
    throw new Error(`Tienda no encontrada: ${STORE_SLUG}. Corré npm run db:seed primero.`);
  }

  const deletedDemo = await prisma.order.deleteMany({
    where: {
      storeId: store.id,
      customerEmail: { endsWith: DEMO_ORDER_EMAIL_DOMAIN },
    },
  });

  const deletedOther = await prisma.order.deleteMany({
    where: { storeId: store.id },
  });

  const variantMap = await loadVariantMap(store.id);
  const plans = buildDemoOrderPlans();
  const shippingFlatRate = Number(store.shippingFlatRate);

  let created = 0;

  for (const plan of plans) {
    const customer = DEMO_CUSTOMERS[plan.customerIndex % DEMO_CUSTOMERS.length];
    const resolvedItems = resolveItems(plan.items, variantMap);
    const subtotal = resolvedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const shippingCost = plan.pickup ? 0 : shippingFlatRate;
    const total = subtotal + shippingCost;

    await prisma.order.create({
      data: {
        storeId: store.id,
        status: plan.status,
        total,
        shippingCost,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        isPickup: Boolean(plan.pickup),
        shippingAddress: plan.pickup ? "Retiro en local" : customer.address,
        shippingCity: customer.city,
        shippingZip: customer.zip,
        createdAt: plan.createdAt,
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

  console.log("Demo orders seed completed:");
  console.log(`  Store: ${store.slug}`);
  console.log(`  Deleted demo orders: ${deletedDemo.count}`);
  console.log(`  Deleted other orders: ${deletedOther.count}`);
  console.log(`  Created: ${created} (${summarizeDemoPlans(plans)})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
