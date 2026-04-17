import Link from "next/link";
import { Star, MapPin, BadgeCheck, Sparkles } from "lucide-react";
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
        "relative rounded-2xl border p-5 transition hover:shadow-md",
        featured ? "border-brand-200 bg-brand-50/40" : "border-ink/10 bg-white",
      )}
    >
      {featured && <TierBadge tier={b.tier} />}
      <div className="flex items-start gap-3">
        {rank != null && (
          <div className="shrink-0 h-9 w-9 rounded-full bg-ink text-white font-display font-semibold grid place-items-center">
            {rank}
          </div>
        )}
        <div className="min-w-0">
          <Link href={`/business/${b.slug}`} className="font-display text-xl font-semibold hover:text-brand-700">
            {b.name}
          </Link>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {b.city.name}, {b.city.state}
          </p>
        </div>
      </div>

      {b.descShort && <p className="mt-3 text-sm text-ink/80 line-clamp-2">{b.descShort}</p>}

      <div className="mt-4 flex items-center gap-4 text-sm">
        {b.ratingCount > 0 && (
          <span className="flex items-center gap-1" aria-label="rating">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            <b className="font-semibold">{(b.ratingAvg ?? 0).toFixed(1)}</b>
            <span className="text-ink-muted">({b.ratingCount})</span>
          </span>
        )}
        {b.claimedById && (
          <span className="flex items-center gap-1 text-emerald-700 text-xs">
            <BadgeCheck className="h-4 w-4" aria-hidden /> Verified
          </span>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <Link
          href={`/get-quotes?business=${b.slug}${ctaServiceSlug ? `&service=${ctaServiceSlug}` : ""}`}
          className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Get free quote
        </Link>
        <Link
          href={`/business/${b.slug}`}
          className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink/5"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}

function TierBadge({ tier }: { tier: ListingTier }) {
  return (
    <span className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
      <Sparkles className="h-3 w-3" aria-hidden />
      {tier === "PREMIUM" ? "Premium partner" : "Featured"}
    </span>
  );
}
