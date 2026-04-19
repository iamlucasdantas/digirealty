#!/usr/bin/env bash
# Runs every time the Codespace starts (including after suspend/resume).
# Waits for Postgres, and self-heals if node_modules is missing.
set -euo pipefail

cd "$(dirname "$0")/.."

# 1. Wait for Postgres
for i in $(seq 1 30); do
  if (echo > /dev/tcp/localhost/5432) 2>/dev/null; then
    break
  fi
  sleep 1
done
if ! (echo > /dev/tcp/localhost/5432) 2>/dev/null; then
  echo "⚠ Postgres did not become ready in 30s — check: docker compose logs db"
fi

# 2. Self-heal: ensure pnpm + node_modules exist. Setup sometimes races the
#    volume mount on first boot, or the container is rebuilt without
#    re-running postCreate — either way, make sure the user can run `pnpm dev`.
if ! command -v pnpm >/dev/null 2>&1; then
  echo "▶ pnpm not found — enabling via corepack…"
  corepack enable
  corepack prepare pnpm@10.33.0 --activate
fi

if [ ! -d node_modules ] || [ ! -x node_modules/.bin/next ]; then
  echo "▶ node_modules missing — running pnpm install…"
  pnpm install --no-frozen-lockfile
fi

# Ensure @prisma/client got generated (pnpm sometimes blocks postinstall).
if [ ! -d node_modules/.prisma/client ]; then
  echo "▶ Generating Prisma client…"
  pnpm prisma generate
fi

# 3. Ensure the DB has the schema + seed. Idempotent: `db push` only applies
#    diffs, and the seed uses upserts.
if [ -f .env ]; then
  if ! pnpm prisma db push --skip-generate --accept-data-loss >/dev/null 2>&1; then
    echo "⚠ prisma db push failed — inspect manually with: pnpm prisma db push"
  fi
fi

