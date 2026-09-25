#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ Seed app3 (manoviva-italia)"
npx tsx prisma/seed-app3.ts
CACHE_REVALIDATE_URL="${CACHE_REVALIDATE_URL:-http://localhost:3002}" npm run cache:revalidate
