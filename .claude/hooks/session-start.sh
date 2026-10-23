#!/bin/bash
# Gør en Claude Code-session i skyen klar: Node fra .nvmrc og projektets pakker.
# Lokalt (fx på en Mac) gør scriptet ingenting.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# nvm bruger variabler, der ikke er sat, så -u slås fra imens
export NVM_DIR="${NVM_DIR:-/opt/nvm}"
set +u
. "$NVM_DIR/nvm.sh"
nvm use --silent >/dev/null 2>&1 || nvm install >/dev/null
NODE_BIN="$(dirname "$(nvm which current)")"
set -u

# Resten af sessionen bruger samme Node-version
export PATH="$NODE_BIN:$PATH"
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$NODE_BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

if [ -f package.json ]; then
  npm install --no-audit --no-fund --loglevel=error
fi

echo "Node $(node --version) og projektets pakker er klar."
