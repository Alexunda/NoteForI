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
# --no-use: ellers skifter nvm selv til versionen i .nvmrc, og mangler den, stopper set -e scriptet uden besked
. "$NVM_DIR/nvm.sh" --no-use

# nvm install kan fejle lige efter opstart (fx netværket), så det prøves igen med pauser imellem
# Kun fejlbeskeden går til stderr, for Claude Code viser kun den første linje derfra, når hooken fejler
installer_node() {
  local pause
  for pause in 2 4 8 16; do
    nvm install >/dev/null 2>&1 && return 0
    echo "nvm install fejlede (exitkode $?). Prøver igen om $pause sekunder."
    sleep "$pause"
  done
  nvm install >/dev/null 2>&1
}
if ! nvm use --silent >/dev/null 2>&1 && ! installer_node; then
  echo "Node $(cat .nvmrc) fra .nvmrc kunne ikke installeres, heller ikke efter 5 forsøg." \
    "Projektets pakker mangler derfor også. Kør scriptet igen: bash .claude/hooks/session-start.sh" >&2
  exit 1
fi
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
