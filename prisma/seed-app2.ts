import { disconnectPrisma, seedApp2Store } from "./seed-store-lib";

async function main() {
  const { store, admin, config, productCount } = await seedApp2Store();

  console.log("Seed app2 completado:");
  console.log(`  Store: ${store.name} (${store.slug})`);
  console.log(`  Admin: ${admin.email} / ${config.adminPassword}`);
  console.log(`  Productos: ${productCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(disconnectPrisma);
