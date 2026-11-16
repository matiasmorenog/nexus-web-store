/**
 * Light Goat demo refresh: shift DateTime fields so the newest order day = today (AR).
 * Does NOT wipe or recreate rows — only updates dates on existing demo-store data.
 *
 * Safety: assertSafeDemoDb() — Neon main blocked; needs SEED_TARGET=development
 * (or ALLOW_DESTRUCTIVE_DB=1 on non-prod).
 *
 * Usage:
 *   SEED_TARGET=development npm run db:refresh:demo-goat
 *
 * Prerequisite: npm run db:seed:demo-goat at least once.
 */
import "dotenv/config";
import { assertSafeDemoDb } from "./assert-safe-demo-db";
import {
  GOAT_DEMO_STORE_SLUG,
  argentinaYmd,
  computeDemoDateDeltaMs,
} from "./demo-goat-lib";
import { disconnectPrisma, prisma } from "./seed-store-lib";

assertSafeDemoDb();

async function main() {
  const store = await prisma.store.findUnique({
    where: { slug: GOAT_DEMO_STORE_SLUG },
    select: { id: true, slug: true, name: true },
  });

  if (!store) {
    throw new Error(
      `Tienda ${GOAT_DEMO_STORE_SLUG} no encontrada. Corré SEED_TARGET=development npm run db:seed:demo-goat primero.`,
    );
  }

  const agg = await prisma.order.aggregate({
    where: { storeId: store.id },
    _max: { createdAt: true },
    _count: { _all: true },
  });

  if (!agg._max.createdAt || agg._count._all === 0) {
    throw new Error(
      `No hay pedidos en ${GOAT_DEMO_STORE_SLUG}. Corré SEED_TARGET=development npm run db:seed:demo-goat primero.`,
    );
  }

  const deltaMs = computeDemoDateDeltaMs(agg._max.createdAt);

  console.log(`\n=== Goat demo refresh (${store.slug}) ===`);
  console.log(`  Orders: ${agg._count._all}`);
  console.log(`  Max createdAt: ${agg._max.createdAt.toISOString()}`);
  console.log(`  Today AR: ${argentinaYmd()}`);
  console.log(`  Delta ms: ${deltaMs}`);

  if (deltaMs === 0) {
    console.log("Fechas ya alineadas a hoy — nada que actualizar.");
    return;
  }

  const storeId = store.id;
  // Bind delta as ms; PG: null + interval stays null.
  const orderResult = await prisma.$executeRaw`
    UPDATE "Order"
    SET
      "createdAt" = "createdAt" + (${deltaMs}::double precision * interval '1 millisecond'),
      "updatedAt" = "updatedAt" + (${deltaMs}::double precision * interval '1 millisecond'),
      "invoicedAt" = "invoicedAt" + (${deltaMs}::double precision * interval '1 millisecond'),
      "confirmationEmailSentAt" = "confirmationEmailSentAt" + (${deltaMs}::double precision * interval '1 millisecond'),
      "shippingEstimatedDelivery" = "shippingEstimatedDelivery" + (${deltaMs}::double precision * interval '1 millisecond'),
      "meEstimatedDelivery" = "meEstimatedDelivery" + (${deltaMs}::double precision * interval '1 millisecond')
    WHERE "storeId" = ${storeId}
  `;

  const couponResult = await prisma.$executeRaw`
    UPDATE "Coupon"
    SET
      "createdAt" = "createdAt" + (${deltaMs}::double precision * interval '1 millisecond'),
      "updatedAt" = "updatedAt" + (${deltaMs}::double precision * interval '1 millisecond'),
      "startsAt" = "startsAt" + (${deltaMs}::double precision * interval '1 millisecond'),
      "expiresAt" = "expiresAt" + (${deltaMs}::double precision * interval '1 millisecond')
    WHERE "storeId" = ${storeId}
  `;

  const wishlistResult = await prisma.$executeRaw`
    UPDATE "WishlistItem"
    SET "createdAt" = "createdAt" + (${deltaMs}::double precision * interval '1 millisecond')
    WHERE "storeId" = ${storeId}
  `;

  const segmentResult = await prisma.$executeRaw`
    UPDATE "StoreCrmSegment"
    SET
      "createdAt" = "createdAt" + (${deltaMs}::double precision * interval '1 millisecond'),
      "updatedAt" = "updatedAt" + (${deltaMs}::double precision * interval '1 millisecond')
    WHERE "storeId" = ${storeId}
  `;

  const customerResult = await prisma.$executeRaw`
    UPDATE "StoreCustomer"
    SET "updatedAt" = "updatedAt" + (${deltaMs}::double precision * interval '1 millisecond')
    WHERE "storeId" = ${storeId}
  `;

  const newMax = await prisma.order.aggregate({
    where: { storeId },
    _max: { createdAt: true },
  });

  console.log("Updated rows:");
  console.log(`  Order: ${orderResult}`);
  console.log(`  Coupon: ${couponResult}`);
  console.log(`  WishlistItem: ${wishlistResult}`);
  console.log(`  StoreCrmSegment: ${segmentResult}`);
  console.log(`  StoreCustomer: ${customerResult}`);
  console.log(
    `  New max order createdAt: ${newMax._max.createdAt?.toISOString() ?? "n/a"}`,
  );
  console.log("Goat demo refresh done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(disconnectPrisma);
