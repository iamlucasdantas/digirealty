import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { ByLine } from "@/components/medically-reviewed";

export const metadata: Metadata = buildMetadata({
  title: "Treatment guides",
  description:
    "Expert-written, clinically reviewed guides to aesthetics, wellness, and cosmetic treatments — Botox, fillers, laser, body contouring, and more.",
  path: "/learn",
});

export const revalidate = 3600;

export default async function LearnIndex() {
  const [pillars, recent] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true, isPillar: true },
      include: { author: true, medicalReviewer: true },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
    prisma.blogPost.findMany({
      where: { published: true, isPillar: false },
      include: { author: true, medicalReviewer: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <>
      <section className="border-b border-ink/5 bg-gradient-to-br from-brand-50/40 to-white">
        <div className="container py-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            The Atlas — Guides
          </p>
          <h1 className="mt-2 font-display text-5xl font-semibold">Treatment guides</h1>
          <p className="mt-4 text-lg text-ink-muted">
            Long-form, deeply researched, and reviewed by licensed clinicians. Start here if
            you&apos;re researching a specific treatment — we cover what it does, what it
            costs in your city, and how to choose a provider worth the money.
          </p>
        </div>
      </section>

      {pillars.length > 0 && (
        <section className="container py-12">
          <h2 className="font-display text-3xl font-semibold">Pillar guides</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {pillars.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-ink/10 bg-white p-6 hover:border-brand-200"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Pillar guide
                </p>
                <Link href={`/learn/${p.slug}`}>
                  <h3 className="mt-1 font-display text-2xl font-semibold hover:text-brand-700">
                    {p.title}
                  </h3>
                </Link>
                {p.excerpt && <p className="mt-2 text-ink/85">{p.excerpt}</p>}
                {p.author && <ByLine author={p.author} updatedAt={p.updatedAt} />}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="container py-12">
        <h2 className="font-display text-3xl font-semibold">
          {pillars.length > 0 ? "Recent articles" : "All guides"}
        </h2>
        {recent.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-ink/15 p-10 text-center text-ink-muted">
            New guides land here weekly. In the meantime, browse{" "}
            <Link href="/compare" className="text-brand-700 hover:underline">
              treatment comparisons
            </Link>{" "}
            or{" "}
            <Link href="/services" className="text-brand-700 hover:underline">
              all treatments
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
            {recent.map((p) => (
              <li key={p.id} className="p-5">
                <Link href={`/learn/${p.slug}`} className="font-semibold hover:text-brand-700">
                  {p.title}
                </Link>
                {p.excerpt && <p className="mt-1 text-sm text-ink-muted">{p.excerpt}</p>}
                <p className="mt-1 text-xs text-ink-muted">
                  {p.author && !p.author.isPlaceholder
                    ? `By ${p.author.name}`
                    : "By The Atlas editorial team"}
                  {p.medicalReviewer && !p.medicalReviewer.isPlaceholder
                    ? ` · Reviewed by ${p.medicalReviewer.name}, ${p.medicalReviewer.credentialSuffix}`
                    : " · Clinical review pending"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
