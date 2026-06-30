import { disconnectPrisma, seedVapeStore } from "./seed-store-lib";

async function main() {
  const { store, admin, config, productCount } = await seedVapeStore();

  console.log("Seed vape completado:");
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
