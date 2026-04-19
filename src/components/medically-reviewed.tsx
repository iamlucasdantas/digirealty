import Link from "next/link";
import Image from "next/image";
import { Shield, ShieldCheck, Stethoscope, AlertCircle } from "lucide-react";

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
  isPlaceholder?: boolean;
}

interface Props {
  author: AuthorSummary;
  reviewer?: ReviewerSummary | null;
  reviewedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  readingMinutes?: number | null;
}

/**
 * E-E-A-T trust strip for YMYL content.
 *
 * Principle (spec §C.2): "Nenhuma persona médica placeholder pode aparecer
 * em produção." So — if the reviewer is a placeholder (no real clinician
 * contracted yet), we suppress the reviewer attribution and surface an
 * honest "Pending clinical review" state. Same for placeholder authors:
 * we fall back to organization byline ("The Atlas editorial team").
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

  const hasRealAuthor = !author.isPlaceholder;
  const hasRealReviewer = reviewer && !reviewer.isPlaceholder;

  // If both are placeholders, we still have to be transparent about the
  // editorial state of this piece. Don't pretend.
  if (!hasRealAuthor && !hasRealReviewer) {
    return <PendingReviewBlock />;
  }

  return (
    <aside className="my-6 rounded-2xl border border-ink/10 bg-slate-50/60 p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {hasRealAuthor ? (
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
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" aria-hidden />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Written by
              </p>
              <p className="font-semibold">The Atlas editorial team</p>
            </div>
          </div>
        )}

        {hasRealReviewer && reviewer ? (
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
        ) : (
          <div className="flex items-center gap-3 text-ink-muted">
            <div className="h-10 w-10 rounded-full bg-amber-100 grid place-items-center" aria-hidden>
              <Stethoscope className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                Clinical review pending
              </p>
              <p className="text-sm">
                We&apos;re recruiting a licensed reviewer —{" "}
                <Link href="/medical-review-board" className="underline hover:text-ink">
                  learn more
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        <dl className="ml-auto text-xs text-ink-muted space-y-0.5">
          {reviewed && hasRealReviewer && (
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
    </aside>
  );
}

/** Compact byline for non-YMYL pages. Suppresses placeholder authors. */
export function ByLine({
  author,
  updatedAt,
}: {
  author: AuthorSummary;
  updatedAt?: Date | string | null;
}) {
  const updated = toDate(updatedAt);
  if (author.isPlaceholder) {
    return (
      <p className="mt-3 text-sm text-ink-muted">
        By The Atlas editorial team
        {updated && <span> · updated {fmt(updated)}</span>}
      </p>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-3 text-sm text-ink-muted">
      <Avatar src={author.photoUrl} alt={author.name} size={32} />
      <span>
        By{" "}
        <Link href={`/team/${author.slug}`} className="font-semibold text-ink hover:underline">
          {author.name}
        </Link>
        {updated && <span> · updated {fmt(updated)}</span>}
      </span>
    </div>
  );
}

/**
 * Transparent notice when we don't yet have a named, real author OR a named,
 * real reviewer for this piece. We'd rather show this than fake trust.
 */
export function PendingReviewBlock() {
  return (
    <aside className="my-6 flex flex-wrap items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5">
      <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" aria-hidden />
      <div className="text-sm">
        <p className="font-semibold text-amber-900">
          Editorial draft — clinical review pending
        </p>
        <p className="mt-1 text-amber-900/85">
          We&apos;re actively recruiting a licensed clinician to review this article
          before it becomes part of our permanent library. We&apos;re showing this draft
          so you can read it — but we&apos;ll note clearly on the page once it has been
          clinically reviewed and dated.{" "}
          <Link href="/medical-review-board" className="underline hover:text-amber-950">
            How we review
          </Link>
          .
        </p>
      </div>
    </aside>
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
