#!/usr/bin/env bash
# Vercel → proyecto vape → Settings → Git → Ignored Build Step
# Exit 0 = omitir build | Exit 1 = ejecutar build
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CHANGED=$(bash "$ROOT/scripts/vercel-changed-files.sh" | sed '/^$/d')

if [[ -z "$CHANGED" ]]; then
  echo "vercel-should-build-vape: build (sin diff)"
  exit 1
fi

if [[ "$CHANGED" == "__vercel_force_build__" ]]; then
  echo "vercel-should-build-vape: build (primer deploy)"
  exit 1
fi

docs_only=true
apparel_only=true

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if ! echo "$file" | grep -qE '^(DEPLOY\.md|README\.md|\.env\.example|\.github/|docs/|AGENTS\.md|CLAUDE\.md)'; then
    docs_only=false
  fi
  if ! echo "$file" | grep -qE '^(src/lib/store-verticals/apparel/|src/components/storefront/home/apparel-home|prisma/seed-data-apparel\.ts|prisma/seed-apparel\.ts|prisma/seed-demo-orders\.ts|prisma/demo-orders-data\.ts|scripts/seed-apparel\.sh)'; then
    apparel_only=false
  fi
done <<< "$CHANGED"

if [[ "$docs_only" == true ]]; then
  echo "vercel-should-build-vape: skip (solo docs)"
  exit 0
fi

if [[ "$apparel_only" == true ]]; then
  echo "vercel-should-build-vape: skip (solo cambios apparel)"
  exit 0
fi

echo "vercel-should-build-vape: build"
exit 1
