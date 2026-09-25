import {
  resolveApp3StoreOwnerPassword,
} from "./seed-env";
import { disconnectPrisma, seedApp3Store } from "./seed-store-lib";

async function main() {
  const { store, admin, productCount } = await seedApp3Store();
  const { fromEnv } = resolveApp3StoreOwnerPassword();

  console.log("Seed app3 completato:");
  console.log(`  Store: ${store.name} (${store.slug})`);
  console.log(`  Admin: ${admin.email}`);
  console.log(
    fromEnv
      ? "  Password: set from APP3_STORE_OWNER_PASSWORD / MANOVIVA_OWNER_PASSWORD (not logged)"
      : "  Password: demo fallback (SEED_ADMIN_PASSWORD) — set APP3_STORE_OWNER_PASSWORD for real owner",
  );
  console.log(`  Prodotti: ${productCount}`);
  console.log("  Pagamenti, consegne e ritiro: disattivati");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(disconnectPrisma);
