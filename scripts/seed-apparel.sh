#!/usr/bin/env bash
# Seed solo tienda apparel (demo-store). Limpia esa tienda y la recrea.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ Seed apparel (demo-store)"
npx tsx prisma/seed-apparel.ts
npm run cache:revalidate
