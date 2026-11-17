/**
 * Full Goat (`demo-store`) demo seed:
 *   wipe store → catalog (app1) → coupons / orders (~6 months) / CRM / wishlist
 *
 * Safety: assertSafeDemoDb() — Neon main blocked; needs SEED_TARGET=development
 * (or ALLOW_DESTRUCTIVE_DB=1 on non-prod).
 *
 * Usage:
 *   SEED_TARGET=development npm run db:seed:demo-goat
 *
 * Note: Admin módulo Tráfico (web analytics) uses Vercel API — not seeded in DB.
 */
import "dotenv/config";
import { assertSafeDemoDb } from "./assert-safe-demo-db";
import { GOAT_DEMO_STORE_SLUG } from "./demo-goat-lib";
import { enrichGoatDemo } from "./seed-demo-goat-enrich";
import {
  disconnectPrisma,
  prisma,
  seedApp1Store,
  summarizeApp1Seed,
} from "./seed-store-lib";

assertSafeDemoDb();

async function main() {
  console.log(`\n=== Goat demo seed (${GOAT_DEMO_STORE_SLUG}) ===`);

  const { store, admin, config, productCount } = await seedApp1Store({
    wipeFirst: true,
  });
  const catalogSummary = summarizeApp1Seed();

  console.log("Catalog:");
  console.log(`  Store: ${store.name} (${store.slug})`);
  console.log(`  Admin: ${admin.email} / ${config.adminPassword}`);
  console.log(`  Products: ${productCount}`);
  console.log(`  Promo 2x1: ${catalogSummary.promo2x1Count}`);
  console.log(
    `  Out of stock demo: ${catalogSummary.outOfStockProducts.length} products`,
  );

  const enrich = await enrichGoatDemo(prisma, store.id);

  console.log("\nDemo enrich:");
  console.log(`  Orders: ${enrich.orderSummary}`);
  console.log(`  Coupons: ${enrich.coupons}`);
  console.log(
    `  CRM: ${enrich.crmCustomers} customers, ${enrich.crmSegments} segments`,
  );
  console.log(`  Wishlist items: ${enrich.wishlistItems}`);
  console.log(
    "\nNote: /admin/modulos/trafico uses Vercel Web Analytics API — not seeded.",
  );
  console.log("Goat demo seed done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(disconnectPrisma);
