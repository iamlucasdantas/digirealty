import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [pages, comparisons, blog] = await Promise.all([
    prisma.seoPage.findMany({ orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.comparison.findMany({ include: { page: true }, take: 50 }),
    prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 50 }),
  ]);

  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Content</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Programmatic SEO pages, comparison articles, and blog posts. Use the generator to batch-create
        new location pages.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">SEO pages ({pages.length})</h2>
        <ul className="mt-3 divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
          {pages.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <Link href={`/${p.slug}`} className="font-mono text-xs hover:underline">
                  /{p.slug}
                </Link>
                <p className="text-ink-muted text-xs">
                  {p.type} · {p.pageViews.toLocaleString()} views · {p.leadCount} leads
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${p.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100"}`}>
                {p.published ? "live" : "draft"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Comparisons ({comparisons.length})</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {comparisons.map((c) => (
            <li key={c.id}>
              <Link href={`/compare/${c.slug}`} className="text-sm hover:underline">
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Blog ({blog.length})</h2>
        <ul className="mt-3 divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
          {blog.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{p.title}</span>
              <span className="text-xs text-ink-muted">
                {p.published ? "published" : "draft"} · {p.tags.join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
