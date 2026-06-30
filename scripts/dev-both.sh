#!/usr/bin/env bash
# Levanta apparel (:3000) y vape (:3001) en paralelo. Ctrl+C detiene ambas.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cleanup() {
  echo ""
  echo "Deteniendo ambas tiendas..."
  local pids
  pids=$(jobs -p 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    kill $pids 2>/dev/null || true
    wait $pids 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "→ Levantando ambas tiendas"
echo "  apparel  http://localhost:3000  (demo-store)"
echo "  vape     http://localhost:3001  (vape-demo)"
echo "  Ctrl+C para detener ambas"
echo ""

npx prisma generate

export SKIP_PRISMA_GENERATE=1
bash "$ROOT/scripts/dev-store.sh" apparel &
bash "$ROOT/scripts/dev-store.sh" vape &

wait
