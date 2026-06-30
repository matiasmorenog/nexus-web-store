import {
  disconnectPrisma,
  seedAllStores,
  summarizeApparelSeed,
} from "./seed-store-lib";
import { DEFAULT_STORE_SLUG, VAPE_STORE_SLUG } from "./seed-env";

async function main() {
  const { apparel, vape } = await seedAllStores();
  const summary = summarizeApparelSeed();

  console.log("Seed completado (ambas tiendas):");
  console.log(`  Apparel: ${apparel.store.name} (${DEFAULT_STORE_SLUG})`);
  console.log(`    Admin: ${apparel.admin.email} / ${apparel.config.adminPassword}`);
  console.log(`    Productos: ${apparel.productCount}`);
  console.log(`  Vape: ${vape.store.name} (${VAPE_STORE_SLUG})`);
  console.log(`    Admin: ${vape.admin.email} / ${vape.config.adminPassword}`);
  console.log(`    Productos: ${vape.productCount}`);
  console.log(`  Promo 2x1 (apparel): ${summary.promo2x1Count} productos`);
  console.log(
    `  Sin stock demo (apparel): ${summary.outOfStockProducts.length} productos, ${summary.outOfStockVariants} variantes`,
  );
  console.log("  Categorías apparel:", summary.byCategory);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(disconnectPrisma);
