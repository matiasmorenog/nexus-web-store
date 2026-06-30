#!/usr/bin/env bash
# Lista archivos cambiados en el deploy de Vercel (stdout, uno por línea).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -n "${VERCEL_GIT_COMMIT_SHA:-}" && -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ]]; then
  git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" 2>/dev/null || true
elif git rev-parse HEAD^ >/dev/null 2>&1; then
  git diff --name-only HEAD^ HEAD
else
  # Primer deploy o sin parent: forzar build.
  echo "__vercel_force_build__"
fi
