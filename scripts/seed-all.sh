#!/usr/bin/env bash
# Seed ambas tiendas (app1 + app2). Cada una se limpia y recrea por separado.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ Seed ambas tiendas"
npx tsx prisma/seed.ts
CACHE_REVALIDATE_URL="${CACHE_REVALIDATE_URL:-http://localhost:3000}" npm run cache:revalidate
CACHE_REVALIDATE_URL=http://localhost:3001 npm run cache:revalidate
