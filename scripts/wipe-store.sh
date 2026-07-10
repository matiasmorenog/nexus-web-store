#!/usr/bin/env bash
# Borra todos los datos de UNA tienda (no toca la otra).
set -euo pipefail
cd "$(dirname "$0")/.."

PROFILE="${1:-}"

usage() {
  cat <<'EOF'
Uso: npm run db:wipe:app1 | npm run db:wipe:app2
     ./scripts/wipe-store.sh <app1|app2>

Elimina pedidos, productos y la fila Store de la tienda indicada.
El owner se borra solo si no tiene otras tiendas.

  app1  → demo-store (Goat)
  app2     → vape-demo (Cloud)
EOF
}

case "$PROFILE" in
  app1|app2) ;;
  *)
    usage
    exit 1
    ;;
esac

echo "→ Limpiando tienda ${PROFILE}"
npx tsx prisma/wipe-store.ts "$PROFILE"
npm run cache:revalidate
