import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "For providers — pay-per-lead marketing for aesthetics practices",
  description:
    "Grow your practice with exclusive, pre-qualified leads. Flexible pricing, verified attribution, no long-term contracts.",
  path: "/for-providers",
});

const tiers = [
  {
    name: "Free",
    price: "$0",
    tagline: "Get discovered",
    features: ["Basic listing", "Appears in city & service pages", "Up to 5 pay-per-lead credits/mo"],
    cta: "Claim your listing",
    href: "/for-providers/claim",
    highlight: false,
  },
  {
    name: "Verified",
    price: "$99/mo",
    tagline: "Trusted badge",
    features: [
      "Everything in Free",
      "Verified badge + higher rank",
      "Lead pricing from $25",
      "Review management tools",
    ],
    cta: "Start Verified",
    href: "/for-providers/start?tier=verified",
    highlight: false,
  },
  {
    name: "Featured",
    price: "$299/mo",
    tagline: "Rank on top",
    features: [
      "Everything in Verified",
      "Featured badge & priority rank",
      "Ad placements on city pages",
      "First-priority lead routing",
    ],
    cta: "Become Featured",
    href: "/for-providers/start?tier=featured",
    highlight: true,
  },
  {
    name: "Premium",
    price: "Custom",
    tagline: "Dominate your market",
    features: [
      "Exclusive city category lock-in",
      "Homepage ad slot",
      "Dedicated account manager",
      "Custom lead volume guarantees",
    ],
    cta: "Talk to sales",
    href: "/contact?topic=premium",
    highlight: false,
  },
];

export default function ProvidersPage() {
  return (
    <>
      <section className="border-b border-ink/5 bg-gradient-to-br from-brand-50 to-white">
        <div className="container py-20 text-center max-w-3xl">
          <h1 className="font-display text-5xl md:text-6xl font-semibold">
            Fill your calendar with ready-to-book patients.
          </h1>
          <p className="mt-5 text-lg text-ink-muted">
            We send you pre-qualified consumers actively researching your services in your city.
            Pay per lead, not per click — with transparent attribution and no long-term contract.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/for-providers/claim"
              className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              List your practice
            </Link>
            <Link
              href="/contact?topic=providers"
              className="rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold hover:bg-ink/5"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="font-display text-3xl font-semibold text-center">Simple, performance-based pricing</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl border p-6 ${
                t.highlight ? "border-brand-500 ring-2 ring-brand-200" : "border-ink/10"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{t.tagline}</p>
              <p className="mt-1 font-display text-2xl font-semibold">{t.name}</p>
              <p className="mt-2 font-display text-4xl font-semibold">{t.price}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-600 shrink-0" /> {f}
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
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
