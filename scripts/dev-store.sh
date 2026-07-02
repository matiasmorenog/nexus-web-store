#!/usr/bin/env bash
# Levanta next dev con el perfil de tienda indicado (slug + URL).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROFILE="${1:-}"

usage() {
  cat <<'EOF'
Uso: npm run dev:apparel | npm run dev:vape
     ./scripts/dev-store.sh <apparel|vape>

Perfiles:
  apparel   slug demo-store   puerto 3000   catálogo ropa (Goat)
  vape      slug vape-demo    puerto 3001   catálogo vape (VAPORX)

Requiere .env con DATABASE_URL (y el resto de vars compartidas).
Este script sobrescribe DEFAULT_STORE_SLUG y URLs por perfil.
EOF
}

case "$PROFILE" in
  apparel)
    export DEFAULT_STORE_SLUG=demo-store
    export NEXT_PUBLIC_DEFAULT_STORE_SLUG=demo-store
    export NEXT_DIST_DIR=".next-apparel"
    PORT=3000
    LABEL="Goat (apparel)"
    ;;
  vape)
    export DEFAULT_STORE_SLUG=vape-demo
    export NEXT_PUBLIC_DEFAULT_STORE_SLUG=vape-demo
    export NEXT_DIST_DIR=".next-vape"
    PORT=3001
    LABEL="VAPORX (vape)"
    ;;
  *)
    usage
    exit 1
    ;;
esac

export AUTH_URL="http://localhost:${PORT}"
export NEXT_PUBLIC_APP_URL="http://localhost:${PORT}"

echo "→ ${LABEL}"
echo "  slug: ${DEFAULT_STORE_SLUG}"
echo "  URL:  http://localhost:${PORT}"
echo "  dist: ${NEXT_DIST_DIR}"
echo ""

if [[ "${SKIP_PRISMA_GENERATE:-}" != "1" ]]; then
  npx prisma generate
fi
exec npx next dev -p "${PORT}"
