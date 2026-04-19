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
    <article className="container py-14 max-w-3xl">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p>
      )}
      <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">{title}</h1>
      <p className="mt-4 text-lg text-ink-muted">{lede}</p>
      {lastUpdated && (
        <p className="mt-4 text-xs text-ink-muted">Last updated {lastUpdated}</p>
      )}
      <div className="prose-al mt-10 max-w-none">{children}</div>

      <hr className="my-12 border-ink/5" />
      <p className="text-sm text-ink-muted">
        Questions or feedback?{" "}
        <Link href="/contact" className="text-brand-700 hover:underline">
          Get in touch
        </Link>
        .
      </p>
    </article>
  );
}
