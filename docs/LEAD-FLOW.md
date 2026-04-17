# Lead flow

How a consumer's quote request turns into a paid conversion.

## 1. Capture

**Entry points:**
- `GET /get-quotes?service=botox&city=davenport-ia` (header CTA)
- Inline `<LeadForm />` on every service+city page and business profile.
- Outbound ads → same form with `utm_*` parameters preserved.

**Form:** 4 steps, ~45s. Progressive disclosure — we ask easy questions first
(timeframe, budget) and only reveal contact fields after momentum.

**Defenses:**
- Zod validation (`src/lib/validation.ts`).
- Hidden honeypot `website` field — bots fill it, we drop silently.
- In-memory rate limit: 5 submissions / minute / IP. Swap for Upstash Redis
  in multi-region.

## 2. Persistence

`POST /api/leads`:
1. Validate + rate-limit + honeypot.
2. Resolve `serviceSlug` → `serviceId`, optional `businessSlug` → `businessId`.
3. Insert `Lead` with full attribution payload:
   - `landingPath`, `referrer`, `utm_*`, `sessionId`, `ipHash`, `userAgent`.
4. Insert `LeadEvent("created")`.
5. Fire-and-forget `routeLead(leadId)` — user sees the "thanks" page
   instantly without blocking on email delivery.

## 3. Matching

`findMatches` in `src/lib/lead-routing.ts`:

```
candidates = Business
  .where status=PUBLISHED
  .where services has serviceId

score = TIER_WEIGHT[tier]          // 100 / 60 / 25 / 5
      + ratingAvg × (ratingCount > 0 ? 4 : 0)
      + (claimedById ? 10 : 0)

matches = top 3 by score
```

Future refinement: soft-geo rank by ZIP distance, freshness penalty for
providers who have declined ≥5 leads in 30 days, and a bandit layer that
experiments with lower-ranked providers when the leader is saturated.

## 4. Routing (exclusive mode)

Inside a single DB transaction:

- `Lead.status = ROUTED`, `businessId = matches[0]`, `priceCents = priceForTier(tier)`.
- Create N `LeadAssignment` rows, one per matched business (`status="offered"`).
- `LeadEvent("routed", { matches })`.

Then, outside the transaction, email every matched provider via Resend.
Emails link to a magic-login URL → `/admin/leads` or a future provider portal
where they can accept or reject.

## 5. Acceptance

`POST /api/leads/{id}/respond` with `{ businessId, action: "accept" | "reject" }`:

- Update the assignment's `status` and `respondedAt`.
- If accepted:
  - `Lead.status = ACCEPTED`, `Lead.businessId = winner`.
  - Expire all other offered assignments (`status = "expired"`).
  - Create `LeadEvent("accepted")`.
  - [Future] Stripe usage record: `price = Lead.priceCents`.

## 6. Admin & ops

- `/admin/leads` — 100 newest leads, status pill, CSV export link.
- `LeadEvent` powers a timeline for each lead: created → routed → accept/reject.
- Unmatched leads (`route_no_match`) are surfaced in the admin inbox for
  manual routing or a "Sorry, we're expanding to your area" re-engagement
  email.

## 7. Billing (planned)

- Monthly invoice aggregating `ACCEPTED` leads per business.
- Stripe Invoicing for Premium/Featured (subscription).
- Stripe Usage Records for per-lead billing.
- `Lead.paidOut = true` once reconciled.

## 8. Attribution

Cookie `al_sid` (set in `src/middleware.ts`) is a year-long persistent UUID.
Combined with `utm_*` captured on submit, we can attribute:

- First-touch (cookie creation time)
- Last-touch (utm on submit)
- Landing path + referrer

Exported to your warehouse (BigQuery / Snowflake / Postgres `leads` table) for
paid-channel ROI reporting.
