#!/usr/bin/env bash
# Vercel → proyecto apparel → Settings → Git → Ignored Build Step
# Exit 0 = omitir build | Exit 1 = ejecutar build
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CHANGED=$(bash "$ROOT/scripts/vercel-changed-files.sh" | sed '/^$/d')

if [[ -z "$CHANGED" ]]; then
  echo "vercel-should-build-apparel: build (sin diff)"
  exit 1
fi

if [[ "$CHANGED" == "__vercel_force_build__" ]]; then
  echo "vercel-should-build-apparel: build (primer deploy)"
  exit 1
fi

docs_only=true
vape_only=true

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if ! echo "$file" | grep -qE '^(DEPLOY\.md|README\.md|\.env\.example|\.github/|docs/|AGENTS\.md|CLAUDE\.md)'; then
    docs_only=false
  fi
  if ! echo "$file" | grep -qE '^(src/lib/store-verticals/vape/|src/themes/vape/|prisma/seed-data-vape\.ts|prisma/seed-vape\.ts|scripts/seed-vape\.sh)'; then
    vape_only=false
  fi
done <<< "$CHANGED"

if [[ "$docs_only" == true ]]; then
  echo "vercel-should-build-apparel: skip (solo docs)"
  exit 0
fi

if [[ "$vape_only" == true ]]; then
  echo "vercel-should-build-apparel: skip (solo cambios vape)"
  exit 0
fi

echo "vercel-should-build-apparel: build"
exit 1
