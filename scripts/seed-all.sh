#!/usr/bin/env bash
# Seed ambas tiendas (apparel + vape). Cada una se limpia y recrea por separado.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ Seed ambas tiendas"
npx tsx prisma/seed.ts
npm run cache:revalidate
