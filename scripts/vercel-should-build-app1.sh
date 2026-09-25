#!/usr/bin/env bash
# Vercel → proyecto goat-indumentaria → Settings → Git → Ignored Build Step
# Exit 0 = omitir build | Exit 1 = ejecutar build
#
# PAUSED until further notice — always skip builds (Goat / app1).
# To unpause: restore the selective logic from git history, then set
# Ignored Build Step back to: bash scripts/vercel-should-build-app1.sh
# (or remove the hardcoded `exit 0` on the Vercel project if still set).
set -euo pipefail

echo "vercel-should-build-app1: skip (PAUSED until further notice)"
exit 0
