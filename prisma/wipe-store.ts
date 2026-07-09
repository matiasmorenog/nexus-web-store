import {
  disconnectPrisma,
  resolveStoreProfile,
  wipeStore,
  type StoreProfile,
} from "./seed-store-lib";
import { DEFAULT_STORE_SLUG, APP2_STORE_SLUG } from "./seed-env";

function usage() {
  console.error(`Uso: npm run db:wipe:app1 | npm run db:wipe:app2
     tsx prisma/wipe-store.ts <app1|app2>

Elimina solo la tienda indicada (pedidos, productos, owner huérfano).
No toca la otra tienda en la misma base.

  app1  → slug ${DEFAULT_STORE_SLUG}
  app2     → slug ${APP2_STORE_SLUG}`);
}

async function main() {
  const arg = process.argv[2];
  const profile = arg ? resolveStoreProfile(arg) : null;

  if (!profile) {
    usage();
    process.exit(1);
  }

  await wipeStore(profile as StoreProfile);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(disconnectPrisma);
