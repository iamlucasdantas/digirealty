import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Check, X } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Pricing for providers",
  description:
    "Transparent, performance-based pricing for aesthetics providers on The Aesthetics Atlas. Listing is free; Verified, Featured, and Premium unlock more.",
  path: "/for-providers/pricing",
});

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "always",
    tagline: "Get listed",
    features: [
      ["Appear in city and treatment pages", true],
      ["Edit hours, photos, services", true],
      ["Verified badge", false],
      ["Priority ranking", false],
      ["Sponsored placements", false],
      ["Pay-per-lead access", "partial"],
    ] as const,
    cta: "Claim a listing",
    href: "/for-providers",
  },
  {
    name: "Verified",
    price: "$99",
    cadence: "per month",
    tagline: "Earn trust",
    features: [
      ["Everything in Free", true],
      ["Verified badge on every surface", true],
      ["License + insurance confirmed in public profile", true],
      ["Response-time SLA on quote requests", true],
      ["Priority ranking", false],
      ["Sponsored placements", false],
    ] as const,
    cta: "Start Verified",
    href: "/for-providers?tier=verified",
  },
  {
    name: "Featured",
    price: "$299",
    cadence: "per month",
    tagline: "Rank above peers",
    features: [
      ["Everything in Verified", true],
      ["Featured partner slot on city + service pages", true],
      ["Labelled 'Sponsored' (editorial rankings stay independent)", true],
      ["First-priority lead routing", true],
      ["Ad placements on city sidebars", true],
    ] as const,
    cta: "Become Featured",
    href: "/for-providers?tier=featured",
    highlight: true,
  },
  {
    name: "Premium",
    price: "Custom",
    cadence: "annual contract",
    tagline: "Lock your market",
    features: [
      ["Everything in Featured", true],
      ["Category exclusivity per city (one Premium per category)", true],
      ["Homepage hero slot rotation", true],
      ["Dedicated account manager", true],
      ["Custom lead-volume commitments", true],
    ] as const,
    cta: "Talk to sales",
    href: "/contact?topic=premium",
  },
];

/**
 * Spec §P1.3 requires that sponsored positioning never masquerade as
 * editorial ranking. This page is explicit about that on every tier row.
 */
export default function ProvidersPricing() {
  return (
    <div className="container py-14 max-w-5xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        For providers
      </p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">
        Transparent pricing
      </h1>
      <p className="mt-4 text-lg text-ink-muted max-w-2xl">
        Pay for distribution, never for editorial position. Editorial rankings on
        &ldquo;best X in Y&rdquo; lists are independent of subscription tier and always
        reflect our public{" "}
        <Link href="/editorial-policy#how-we-rank" className="text-brand-700 hover:underline">
          ranking criteria
        </Link>
        .
      </p>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t) => (
          <section
            key={t.name}
            className={`rounded-2xl border p-6 ${
              t.highlight ? "border-brand-500 ring-2 ring-brand-100" : "border-ink/10"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {t.tagline}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">{t.name}</p>
            <p className="mt-2 font-display text-4xl font-semibold">{t.price}</p>
            <p className="text-xs text-ink-muted">{t.cadence}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {t.features.map(([label, status]) => (
                <li key={label as string} className="flex gap-2">
                  {status === true && (
                    <Check className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                  {status === false && (
                    <X className="mt-0.5 h-4 w-4 text-ink/30 shrink-0" />
                  )}
                  {status === "partial" && (
                    <span className="mt-0.5 h-4 w-4 shrink-0 text-[10px] font-bold leading-4 text-center text-amber-700">
                      ~
                    </span>
                  )}
                  <span className={status === false ? "text-ink/40 line-through" : ""}>
                    {label as string}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={t.href}
              className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold ${
                t.highlight
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "border border-ink/15 hover:bg-ink/5"
              }`}
            >
              {t.cta}
            </Link>
          </section>
        ))}
      </div>

      <section className="mt-16 rounded-2xl border border-ink/10 bg-slate-50 p-6">
        <h2 className="font-display text-xl font-semibold">Pay-per-lead pricing</h2>
        <p className="mt-2 text-sm text-ink-muted">
          When you&apos;re matched with a consumer quote request, you pay a flat fee
          per matched lead. Rates depend on treatment category and your
          subscription tier. Leads that don&apos;t match the filters you set on
          signup are never billed.
        </p>
        <ul className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { cat: "Injectables", range: "$25–$40" },
            { cat: "Body contouring", range: "$40–$75" },
            { cat: "Laser & skin", range: "$20–$35" },
            { cat: "Wellness / IV", range: "$15–$25" },
          ].map((p) => (
            <li key={p.cat} className="rounded-xl bg-white p-3 border border-ink/5">
              <p className="text-xs text-ink-muted">{p.cat}</p>
              <p className="mt-1 font-semibold">{p.range}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 prose-al max-w-3xl">
        <h2>Guardrails you can rely on</h2>
        <ul>
          <li>
            <strong>No editorial ranking is for sale.</strong> Featured/Premium tiers
            get sponsored slots; editorial &ldquo;best X&rdquo; lists follow{" "}
            <Link href="/editorial-policy#how-we-rank">published criteria</Link>.
          </li>
          <li>
            <strong>Cancel any time.</strong> Month-to-month subscriptions have no
            lock-in. Premium contracts are annual with a pro-rated refund clause.
          </li>
          <li>
            <strong>Review integrity.</strong> We do not remove truthful negative
            reviews in exchange for upgrades — ever.
          </li>
        </ul>
      </section>
    </div>
  );
}
