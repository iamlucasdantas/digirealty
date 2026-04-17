#!/usr/bin/env bash
# Runs every time the Codespace starts (including after suspend/resume).
# Just waits for Postgres — schema + seed are set during postCreate.
set -euo pipefail

for i in $(seq 1 30); do
  if (echo > /dev/tcp/localhost/5432) 2>/dev/null; then
    exit 0
  fi
  sleep 1
done

echo "⚠ Postgres did not become ready in 30s — check: docker compose logs db"
