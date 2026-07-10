#!/usr/bin/env bash
# Seed solo tienda app1 (demo-store). Limpia esa tienda y la recrea.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ Seed app1 (demo-store)"
npx tsx prisma/seed-app1.ts
npm run cache:revalidate
