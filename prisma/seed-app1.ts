import {
  disconnectPrisma,
  seedApp1Store,
  summarizeApp1Seed,
} from "./seed-store-lib";

async function main() {
  const { store, admin, config, productCount } = await seedApp1Store();
  const summary = summarizeApp1Seed();

  console.log("Seed app1 completado:");
  console.log(`  Store: ${store.name} (${store.slug})`);
  console.log(`  Admin: ${admin.email} / ${config.adminPassword}`);
  console.log(`  Productos: ${productCount}`);
  console.log(`  Promo 2x1: ${summary.promo2x1Count} productos`);
  console.log(
    `  Sin stock demo: ${summary.outOfStockProducts.length} productos, ${summary.outOfStockVariants} variantes`,
  );
  console.log("  Por categoría:", summary.byCategory);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(disconnectPrisma);
