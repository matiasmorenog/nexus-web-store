#!/usr/bin/env bash
# Levanta app1 (:3000) y app2 (:3001) en paralelo. Ctrl+C detiene ambas.
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
echo "  app1  http://localhost:3000  (demo-store)"
echo "  app2     http://localhost:3001  (vape-demo)"
echo "  Ctrl+C para detener ambas"
echo ""

npx prisma generate

export SKIP_PRISMA_GENERATE=1
bash "$ROOT/scripts/dev-store.sh" app1 &
bash "$ROOT/scripts/dev-store.sh" app2 &

wait
