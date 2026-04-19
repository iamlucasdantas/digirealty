import Link from "next/link";
import Image from "next/image";
import { Shield, ShieldCheck, Stethoscope } from "lucide-react";

interface ReviewerSummary {
  slug: string;
  name: string;
  credentialSuffix: string;
  title: string;
  photoUrl?: string | null;
  isPlaceholder?: boolean;
}

interface AuthorSummary {
  slug: string;
  name: string;
  title: string;
  photoUrl?: string | null;
}

interface Props {
  author: AuthorSummary;
  reviewer?: ReviewerSummary | null;
  reviewedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  readingMinutes?: number | null;
}

/**
 * E-E-A-T trust strip for YMYL content. Shows author + medical reviewer +
 * last reviewed date at the top of every guide or comparison article.
 *
 * This is the single most important piece of visible editorial infrastructure
 * — Google's Medic update specifically looks for human review signals on
 * medical/wellness pages.
 */
export function MedicallyReviewed({
  author,
  reviewer,
  reviewedAt,
  updatedAt,
  readingMinutes,
}: Props) {
  const reviewed = toDate(reviewedAt);
  const updated = toDate(updatedAt);

  return (
    <aside className="my-6 rounded-2xl border border-ink/10 bg-slate-50/60 p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Author */}
        <Link
          href={`/team/${author.slug}`}
          className="flex items-center gap-3 group"
          itemProp="author"
          itemScope
          itemType="https://schema.org/Person"
        >
          <Avatar src={author.photoUrl} alt={author.name} />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Written by
            </p>
            <p className="font-semibold group-hover:text-brand-700" itemProp="name">
              {author.name}
            </p>
            <p className="text-xs text-ink-muted" itemProp="jobTitle">
              {author.title}
            </p>
          </div>
        </Link>

        {/* Medical reviewer */}
        {reviewer && (
          <Link
            href={`/medical-review-board#${reviewer.slug}`}
            className="flex items-center gap-3 group"
          >
            <Avatar src={reviewer.photoUrl} alt={reviewer.name} />
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                <ShieldCheck className="h-3 w-3" aria-hidden /> Medically reviewed by
              </p>
              <p className="font-semibold group-hover:text-brand-700">
                {reviewer.name}, {reviewer.credentialSuffix}
              </p>
              <p className="text-xs text-ink-muted">{reviewer.title}</p>
            </div>
          </Link>
        )}

        {/* Dates */}
        <dl className="ml-auto text-xs text-ink-muted space-y-0.5">
          {reviewed && (
            <div className="flex gap-1.5">
              <dt>Last medically reviewed</dt>
              <dd className="font-medium text-ink">{fmt(reviewed)}</dd>
            </div>
          )}
          {updated && (!reviewed || reviewed.getTime() !== updated.getTime()) && (
            <div className="flex gap-1.5">
              <dt>Last updated</dt>
              <dd className="font-medium text-ink">{fmt(updated)}</dd>
            </div>
          )}
          {readingMinutes && (
            <div className="flex gap-1.5">
              <dt>Reading time</dt>
              <dd className="font-medium text-ink">{readingMinutes} min</dd>
            </div>
          )}
        </dl>
      </div>

      {reviewer?.isPlaceholder && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          <Shield className="h-3.5 w-3.5" aria-hidden />
          Placeholder reviewer persona — will be replaced by a licensed clinician before
          public launch.
        </p>
      )}
    </aside>
  );
}

/** Compact byline for non-YMYL pages (e.g. city hubs). */
export function ByLine({ author, updatedAt }: { author: AuthorSummary; updatedAt?: Date | string | null }) {
  const updated = toDate(updatedAt);
  return (
    <div className="mt-3 flex items-center gap-3 text-sm text-ink-muted">
      <Avatar src={author.photoUrl} alt={author.name} size={32} />
      <span>
        By <Link href={`/team/${author.slug}`} className="font-semibold text-ink hover:underline">{author.name}</Link>
        {updated && <span> · updated {fmt(updated)}</span>}
      </span>
    </div>
  );
}

function Avatar({ src, alt, size = 40 }: { src?: string | null; alt: string; size?: number }) {
  if (!src) {
    return (
      <div
        className="grid place-items-center rounded-full bg-brand-100 text-brand-700 font-semibold"
        style={{ height: size, width: size, fontSize: size / 2.5 }}
        aria-hidden
      >
        {alt
          .split(" ")
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase())
          .join("")}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  );
}

function fmt(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  return typeof d === "string" ? new Date(d) : d;
}

export type { ReviewerSummary, AuthorSummary };
