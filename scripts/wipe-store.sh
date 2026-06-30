#!/usr/bin/env bash
# Borra todos los datos de UNA tienda (no toca la otra).
set -euo pipefail
cd "$(dirname "$0")/.."

PROFILE="${1:-}"

usage() {
  cat <<'EOF'
Uso: npm run db:wipe:apparel | npm run db:wipe:vape
     ./scripts/wipe-store.sh <apparel|vape>

Elimina pedidos, productos y la fila Store de la tienda indicada.
El owner se borra solo si no tiene otras tiendas.

  apparel  → demo-store (Goat)
  vape     → vape-demo (Cloud)
EOF
}

case "$PROFILE" in
  apparel|vape) ;;
  *)
    usage
    exit 1
    ;;
esac

echo "→ Limpiando tienda ${PROFILE}"
npx tsx prisma/wipe-store.ts "$PROFILE"
npm run cache:revalidate
