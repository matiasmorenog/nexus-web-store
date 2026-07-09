import {
  disconnectPrisma,
  seedAllStores,
  summarizeApp1Seed,
} from "./seed-store-lib";
import { DEFAULT_STORE_SLUG, APP2_STORE_SLUG } from "./seed-env";

async function main() {
  const { app1, app2 } = await seedAllStores();
  const summary = summarizeApp1Seed();

  console.log("Seed completado (ambas tiendas):");
  console.log(`  App1: ${app1.store.name} (${DEFAULT_STORE_SLUG})`);
  console.log(`    Admin: ${app1.admin.email} / ${app1.config.adminPassword}`);
  console.log(`    Productos: ${app1.productCount}`);
  console.log(`  App2: ${app2.store.name} (${APP2_STORE_SLUG})`);
  console.log(`    Admin: ${app2.admin.email} / ${app2.config.adminPassword}`);
  console.log(`    Productos: ${app2.productCount}`);
  console.log(`  Promo 2x1 (app1): ${summary.promo2x1Count} productos`);
  console.log(
    `  Sin stock demo (app1): ${summary.outOfStockProducts.length} productos, ${summary.outOfStockVariants} variantes`,
  );
  console.log("  Categorías app1:", summary.byCategory);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(disconnectPrisma);
