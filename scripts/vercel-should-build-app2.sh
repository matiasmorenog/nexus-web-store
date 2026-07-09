#!/usr/bin/env bash
# Vercel → proyecto app2 → Settings → Git → Ignored Build Step
# Exit 0 = omitir build | Exit 1 = ejecutar build
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CHANGED=$(bash "$ROOT/scripts/vercel-changed-files.sh" | sed '/^$/d')

if [[ -z "$CHANGED" ]]; then
  echo "vercel-should-build-app2: build (sin diff)"
  exit 1
fi

if [[ "$CHANGED" == "__vercel_force_build__" ]]; then
  echo "vercel-should-build-app2: build (primer deploy)"
  exit 1
fi

docs_only=true
app1_only=true

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if ! echo "$file" | grep -qE '^(DEPLOY\.md|README\.md|\.env\.example|\.github/|docs/|AGENTS\.md|CLAUDE\.md)'; then
    docs_only=false
  fi
  if ! echo "$file" | grep -qE '^(src/lib/store-verticals/app1/|src/themes/app1/|prisma/seed-data-app1\.ts|prisma/seed-app1\.ts|prisma/seed-demo-orders\.ts|prisma/demo-orders-data\.ts|scripts/seed-app1\.sh)'; then
    app1_only=false
  fi
done <<< "$CHANGED"

if [[ "$docs_only" == true ]]; then
  echo "vercel-should-build-app2: skip (solo docs)"
  exit 0
fi

if [[ "$app1_only" == true ]]; then
  echo "vercel-should-build-app2: skip (solo cambios app1)"
  exit 0
fi

echo "vercel-should-build-app2: build"
exit 1
