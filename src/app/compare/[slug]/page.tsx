import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { LeadForm } from "@/components/lead-form";
import { JsonLd } from "@/components/json-ld";
import {
  buildMetadata,
  articleJsonLd,
  faqJsonLd,
  breadcrumbsJsonLd,
} from "@/lib/seo";
import { incrementPageView } from "@/lib/repos/seo-pages";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const c = await prisma.comparison.findUnique({
    where: { slug: params.slug },
    include: { serviceA: true, serviceB: true, page: true },
  });
  if (!c) return buildMetadata({ title: "Not found", description: "", noIndex: true });
  return buildMetadata({
    title: c.page?.metaTitle ?? `${c.serviceA.name} vs ${c.serviceB.name}`,
    description: c.page?.metaDesc ?? `Compare ${c.serviceA.name} and ${c.serviceB.name}: cost, downtime, results, and how to choose.`,
    path: `/compare/${c.slug}`,
    type: "article",
    publishedTime: c.createdAt.toISOString(),
    modifiedTime: c.updatedAt.toISOString(),
  });
}

type CompareRow = { attribute: string; a: string; b: string };

export default async function ComparisonPage({ params }: { params: { slug: string } }) {
  const c = await prisma.comparison.findUnique({
    where: { slug: params.slug },
    include: { serviceA: true, serviceB: true, page: true },
  });
  if (!c) notFound();
  if (c.page) incrementPageView(c.page.id);

  const pros = (c.pros as { a: string[]; b: string[] } | null) ?? { a: [], b: [] };
  const cons = (c.cons as { a: string[]; b: string[] } | null) ?? { a: [], b: [] };
  const table = (c.table as CompareRow[] | null) ?? [];
  const faq =
    (c.page?.faq as Array<{ q: string; a: string }> | null) ?? [];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: c.title, url: `/compare/${c.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbsJsonLd(breadcrumbs),
          faqJsonLd(faq),
          articleJsonLd({
            title: c.title,
            description: c.page?.metaDesc ?? "",
            slug: `compare/${c.slug}`,
            publishedTime: c.createdAt.toISOString(),
            modifiedTime: c.updatedAt.toISOString(),
          }),
        ]}
      />

      <section className="border-b border-ink/5 bg-gradient-to-br from-brand-50/50 to-white">
        <div className="container py-14 grid md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Comparison</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">{c.title}</h1>
            {c.summary && <p className="mt-4 text-lg text-ink-muted">{c.summary}</p>}
          </div>
          <div className="md:col-span-2">
            <LeadForm serviceSlug={c.serviceA.slug} serviceName={c.serviceA.name} />
          </div>
        </div>
      </section>

      {/* Quick compare table */}
      {table.length > 0 && (
        <section className="container py-12">
          <h2 className="font-display text-3xl font-semibold">At a glance</h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-ink/10">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3">Attribute</th>
                  <th className="text-left px-4 py-3">{c.serviceA.name}</th>
                  <th className="text-left px-4 py-3">{c.serviceB.name}</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr key={i} className="border-t border-ink/5">
                    <td className="px-4 py-3 font-semibold">{row.attribute}</td>
                    <td className="px-4 py-3">{row.a}</td>
                    <td className="px-4 py-3">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pros & cons */}
      <section className="container py-12 grid md:grid-cols-2 gap-6">
        <ProsCons title={c.serviceA.name} pros={pros.a} cons={cons.a} />
        <ProsCons title={c.serviceB.name} pros={pros.b} cons={cons.b} />
      </section>

      {/* Body */}
      {c.page?.body && (
        <section className="container py-8 max-w-3xl prose-al">
          <div dangerouslySetInnerHTML={{ __html: c.page.body }} />
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="container py-14 max-w-3xl">
          <h2 className="font-display text-3xl font-semibold">FAQ</h2>
          <div className="mt-6 divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
            {faq.map((f, i) => (
              <details key={i} className="p-5">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-ink/80">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-3xl bg-ink p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-display text-2xl md:text-3xl">Still undecided? Compare real local pricing.</p>
          <Link
            href={`/get-quotes?service=${c.serviceA.slug}`}
            className="rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-400"
          >
            Get free quotes
          </Link>
        </div>
      </section>
    </>
  );
}

function ProsCons({
  title,
  pros,
  cons,
}: {
  title: string;
  pros: string[];
  cons: string[];
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6">
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <div className="mt-4 grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-emerald-700">Pros</p>
          <ul className="mt-2 space-y-1 text-sm list-disc pl-5">
            {pros.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-rose-700">Cons</p>
          <ul className="mt-2 space-y-1 text-sm list-disc pl-5">
            {cons.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
