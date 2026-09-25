#!/usr/bin/env bash
# Vercel → proyecto manoviva-store → Settings → Git → Ignored Build Step
# Exit 0 = omitir build | Exit 1 = ejecutar build
#
# Policy: build only Production / branch `main` (release deploys ×3).
# Skip ALL Preview deployments (PRs, development, feature branches).
#
# To restore path-based selective previews: restore prior logic from git history
# (docs-only / other-app skips), keep Ignored Build Step as this script path.
set -euo pipefail

if [[ "${VERCEL_ENV:-}" == "production" || "${VERCEL_GIT_COMMIT_REF:-}" == "main" ]]; then
  echo "vercel-should-build-app3: build (production/main)"
  exit 1
fi

echo "vercel-should-build-app3: skip (preview/non-main)"
exit 0
