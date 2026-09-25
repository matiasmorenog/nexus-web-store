import { disconnectPrisma, seedApp3Store } from "./seed-store-lib";

async function main() {
  const { store, admin, config, productCount } = await seedApp3Store();

  console.log("Seed app3 completato:");
  console.log(`  Store: ${store.name} (${store.slug})`);
  console.log(`  Admin: ${admin.email} / ${config.adminPassword}`);
  console.log(`  Prodotti: ${productCount}`);
  console.log("  Pagamenti, consegne e ritiro: disattivati");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(disconnectPrisma);
