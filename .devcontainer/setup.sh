#!/usr/bin/env bash
# One-time codespace setup. Idempotent — safe to re-run.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " AestheticsLeads · Codespace bootstrap"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. pnpm via corepack (bundled with Node 20)
echo "▶ Enabling pnpm…"
corepack enable
corepack prepare pnpm@10.33.0 --activate

# 2. .env file — generate from .env.example if missing
if [ ! -f .env ]; then
  echo "▶ Creating .env…"
  cp .env.example .env
  SECRET="$(openssl rand -hex 32)"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=\"${SECRET}\"|" .env
  sed -i 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aestheticsleads?schema=public"|' .env
  sed -i 's|^DIRECT_URL=.*|DIRECT_URL="postgresql://postgres:postgres@localhost:5432/aestheticsleads?schema=public"|' .env
  sed -i 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL="http://localhost:3000"|' .env
  sed -i 's|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD="admin123"|' .env
else
  echo "✓ .env already present — skipping"
fi

# 3. Wait for Postgres (up to ~30s)
echo "▶ Waiting for Postgres…"
for i in $(seq 1 30); do
  if (echo > /dev/tcp/localhost/5432) 2>/dev/null; then
    echo "✓ Postgres is up"
    break
  fi
  sleep 1
done

# 4. Install deps
echo "▶ Installing dependencies…"
pnpm install --frozen-lockfile=false

# 5. Push schema and seed
echo "▶ Applying Prisma schema…"
pnpm prisma generate
pnpm prisma db push --skip-generate --accept-data-loss

echo "▶ Seeding demo data…"
pnpm db:seed

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✅ Ready!"
echo ""
echo " Next steps:"
echo "   1. Run:     pnpm dev"
echo "   2. Open the forwarded port 3000 (VS Code popup, or Ports tab)"
echo "   3. Admin:   http://localhost:3000/login"
echo "               email:    admin@aestheticsleads.com"
echo "               password: admin123"
echo ""
echo " Try these URLs once it's running:"
echo "   /                               home"
echo "   /botox-in-davenport-ia          programmatic SEO page"
echo "   /best-botox-in-davenport-ia     'best' variant"
echo "   /davenport-ia                   city hub"
echo "   /business/river-bend-aesthetics business profile"
echo "   /compare/botox-vs-fillers       comparison article"
echo "   /get-quotes                     lead form"
echo "   /admin                          dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
