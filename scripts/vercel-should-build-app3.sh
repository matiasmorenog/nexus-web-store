#!/usr/bin/env bash
# Vercel → proyecto manoviva-store → Settings → Git → Ignored Build Step
# Exit 0 = omitir build | Exit 1 = ejecutar build
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CHANGED=$(bash "$ROOT/scripts/vercel-changed-files.sh" | sed '/^$/d')

if [[ -z "$CHANGED" ]]; then
  echo "vercel-should-build-app3: build (sin diff)"
  exit 1
fi

if [[ "$CHANGED" == "__vercel_force_build__" ]]; then
  echo "vercel-should-build-app3: build (primer deploy)"
  exit 1
fi

docs_only=true
other_only=true

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if ! echo "$file" | grep -qE '^(DEPLOY\.md|README\.md|\.env\.example|\.github/|docs/|AGENTS\.md|CLAUDE\.md)'; then
    docs_only=false
  fi
  if ! echo "$file" | grep -qE '^(src/lib/store-verticals/app1/|src/themes/app1/|prisma/seed-data-app1\.ts|prisma/seed-app1\.ts|prisma/seed-demo-orders\.ts|prisma/demo-orders-data\.ts|scripts/seed-app1\.sh|scripts/vercel-should-build-app1\.sh|src/lib/store-verticals/app2/|src/themes/app2/|prisma/seed-data-app2\.ts|prisma/seed-app2\.ts|scripts/seed-app2\.sh|scripts/vercel-should-build-app2\.sh)'; then
    other_only=false
  fi
done <<< "$CHANGED"

if [[ "$docs_only" == true ]]; then
  echo "vercel-should-build-app3: skip (solo docs)"
  exit 0
fi

if [[ "$other_only" == true ]]; then
  echo "vercel-should-build-app3: skip (solo cambios app1/app2)"
  exit 0
fi

echo "vercel-should-build-app3: build"
exit 1
