# AestheticsLeads — lead generation platform

A high-performance, SEO-first lead generation machine for the aesthetics, wellness, and
cosmetic services industry. Launching in Quad Cities (IA/IL); architected from day one
to scale nationally.

**Stack:** Next.js 14 (App Router) · TypeScript · PostgreSQL · Prisma · Tailwind · Claude API
(content engine) · Resend (email) · Stripe (billing) · Vercel or any Node host.

---

## 🚀 Quick start

```bash
# 1. Install
pnpm install          # or: npm install / yarn

# 2. Configure
cp .env.example .env
# edit DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, RESEND_API_KEY

# 3. Database
pnpm db:push          # or: pnpm db:migrate
pnpm db:seed          # creates admin, cities, services, demo businesses

# 4. Run
pnpm dev              # http://localhost:3000
```

Admin: `http://localhost:3000/login` (credentials from `.env`).

---

## 🧭 What's inside

| Module                | Where                                              |
| --------------------- | -------------------------------------------------- |
| Marketing site        | `src/app/` — home, `/get-quotes`, service + city   |
| Programmatic SEO      | `src/app/[serviceCity]/page.tsx` (+ sitemap)       |
| Business directory    | `src/app/business/[slug]/page.tsx`                 |
| Comparison articles   | `src/app/compare/[slug]/page.tsx`                  |
| Lead capture API      | `src/app/api/leads/route.ts`                       |
| Lead routing engine   | `src/lib/lead-routing.ts`                          |
| AI content generator  | `src/lib/ai.ts` + `scripts/generate-content.ts`    |
| Monetization (ads)    | `src/components/ad-slot.tsx`, `/go/ad/[id]`        |
| Monetization (aff.)   | `src/app/api/affiliate/[slug]/route.ts`            |
| Admin dashboard       | `src/app/admin/**`                                 |
| DB schema             | `prisma/schema.prisma`                             |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system design.

---

## 🔑 Key design choices

1. **Programmatic pages at `/{service}-in-{city}`** — one polymorphic handler matches
   `botox-in-davenport-ia`, `best-dermal-fillers-in-bettendorf-ia`,
   `coolsculpting-near-me`, and plain `davenport-ia` (city hub). Sitemap emits the full
   service × city cross-product.
2. **Lead routing is the business.** See `src/lib/lead-routing.ts`. Tier-weighted
   scoring decides who gets offered the lead; exclusive-mode + transaction guarantees
   we only sell the lead once.
3. **AI-assisted, human-editable.** `SeoPage` stores AI-generated content alongside
   `aiGenerated` + `aiModel` flags. Editors can override via the admin UI.
4. **Privacy-first logging.** We hash IPs with a site-wide salt before persisting.
5. **No hot caches on request path.** Pages use `revalidate` ISR so Core Web Vitals stay
   green even on large catalogs.

---

## 🛠 Commands

| Command                      | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `pnpm dev`                   | Start Next dev server                    |
| `pnpm build`                 | Production build (runs `prisma generate`) |
| `pnpm db:migrate`            | Apply migrations locally                 |
| `pnpm db:seed`               | Seed categories, services, demo data     |
| `pnpm db:studio`             | Prisma Studio                            |
| `pnpm ai:generate-content`   | Batch-generate SEO pages via Claude      |
| `pnpm sitemap:refresh`       | Ping Google/Bing with the sitemap        |

---

## 📈 Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md).
