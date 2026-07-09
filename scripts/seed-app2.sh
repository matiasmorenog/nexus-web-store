#!/usr/bin/env bash
# Seed solo tienda app2 (vape-demo). Limpia esa tienda y la recrea.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ Seed app2 (vape-demo)"
npx tsx prisma/seed-app2.ts
CACHE_REVALIDATE_URL="${CACHE_REVALIDATE_URL:-http://localhost:3001}" npm run cache:revalidate
