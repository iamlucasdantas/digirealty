import Link from "next/link";

interface Props {
  eyebrow?: string;
  title: string;
  lede: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

/** Shared layout for institutional & policy pages. */
export function EditorialPage({ eyebrow, title, lede, lastUpdated, children }: Props) {
  return (
    <article className="container py-16 md:py-20 max-w-3xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-ink text-balance">
        {title}
      </h1>
      <p className="mt-5 text-lg text-ink-muted leading-relaxed">{lede}</p>
      {lastUpdated && (
        <p className="mt-4 text-xs text-ink-muted">Last updated {lastUpdated}</p>
      )}
      <div className="prose-al mt-12 max-w-none">{children}</div>

      <hr className="my-14 border-clay-100" />
      <p className="text-sm text-ink-muted">
        Questions or feedback?{" "}
        <Link
          href="/contact"
          className="text-clay-600 underline decoration-clay-300 underline-offset-2 hover:text-clay-700 hover:decoration-clay-500"
        >
          Get in touch
        </Link>
        .
      </p>
    </article>
  );
}
