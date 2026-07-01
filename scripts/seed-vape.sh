#!/usr/bin/env bash
# Seed solo tienda vape (vape-demo). Limpia esa tienda y la recrea.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ Seed vape (vape-demo)"
npx tsx prisma/seed-vape.ts
CACHE_REVALIDATE_URL="${CACHE_REVALIDATE_URL:-http://localhost:3001}" npm run cache:revalidate
