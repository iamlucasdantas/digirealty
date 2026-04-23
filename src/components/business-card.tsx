import Link from "next/link";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import type { Business, City, ListingTier } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  business: Business & { city: City };
  rank?: number;
  ctaServiceSlug?: string;
}

export function BusinessCard({ business: b, rank, ctaServiceSlug }: Props) {
  const featured = b.tier === "FEATURED" || b.tier === "PREMIUM";
  return (
    <article
      className={cn(
        "group relative rounded-3xl border bg-bone p-6 transition hover:shadow-card",
        featured ? "border-clay-200" : "border-clay-100",
      )}
    >
      {featured && <TierBadge tier={b.tier} />}

      <div className="flex items-start gap-3">
        {rank != null && (
          <div className="shrink-0 h-9 w-9 rounded-full bg-cocoa-700 text-ink-onDark font-display font-semibold grid place-items-center">
            {rank}
          </div>
        )}
        <div className="min-w-0">
          <Link
            href={`/business/${b.slug}`}
            className="font-display text-xl font-semibold text-ink hover:text-clay-600"
          >
            {b.name}
          </Link>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {b.city.name}, {b.city.state}
          </p>
        </div>
      </div>

      {b.descShort && (
        <p className="mt-4 text-sm text-ink/80 line-clamp-2 leading-relaxed">
          {b.descShort}
        </p>
      )}

      {/* Trust row — only renders rating when traceable */}
      {(b.ratingCount > 0 && b.ratingSource && b.ratingSyncedAt) || (b.claimedById && !b.unclaimed) ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {b.ratingCount > 0 && b.ratingSource && b.ratingSyncedAt && (
            <span
              className="flex items-center gap-1 text-ink"
              title={`Aggregated from ${b.ratingSource} · synced ${b.ratingSyncedAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
              aria-label="rating"
            >
              <Star className="h-4 w-4 fill-clay-400 text-clay-400" aria-hidden />
              <b className="font-semibold">{(b.ratingAvg ?? 0).toFixed(1)}</b>
              <span className="text-ink-muted text-xs">({b.ratingCount})</span>
            </span>
          )}
          {b.claimedById && !b.unclaimed && (
            <span className="flex items-center gap-1 text-emerald-700 text-xs">
              <BadgeCheck className="h-4 w-4" aria-hidden /> Verified
            </span>
          )}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/get-quotes?business=${b.slug}${ctaServiceSlug ? `&service=${ctaServiceSlug}` : ""}`}
          className="inline-flex items-center rounded-full bg-clay-500 px-4 py-2 text-sm font-semibold text-white hover:bg-clay-600"
        >
          Request a quote
        </Link>
        <Link
          href={`/business/${b.slug}`}
          className="inline-flex items-center rounded-full border border-ink/15 bg-cream px-4 py-2 text-sm font-semibold text-ink hover:bg-sand"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}

function TierBadge({ tier }: { tier: ListingTier }) {
  return (
    <span
      className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-clay-700 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-eyebrow text-cream shadow-soft"
      title="Sponsored — this provider pays for placement."
    >
      {tier === "PREMIUM" ? "Premium · Sponsored" : "Featured · Sponsored"}
    </span>
  );
}
