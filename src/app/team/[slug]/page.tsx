import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata, personJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const a = await prisma.author.findUnique({ where: { slug: params.slug } });
  if (!a) return buildMetadata({ title: "Not found", description: "", noIndex: true });
  return buildMetadata({
    title: `${a.name} — ${a.title}`,
    description: a.bio.slice(0, 155),
    path: `/team/${a.slug}`,
    image: a.photoUrl ?? undefined,
  });
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const author = await prisma.author.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 20,
      },
    },
  });
  // Placeholder personas do not get public pages — shipping them would be a
  // fake E-E-A-T signal.
  if (!author || author.isPlaceholder) notFound();

  return (
    <article className="container py-14 max-w-3xl">
      <JsonLd
        data={personJsonLd({
          slug: author.slug,
          name: author.name,
          title: author.title,
          photoUrl: author.photoUrl,
          bio: author.bio,
          credentials: author.credentials,
        })}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Editorial</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">{author.name}</h1>
      <p className="mt-2 text-lg text-ink-muted">{author.title}</p>

      <div className="mt-8 prose-al max-w-none">
        <p>{author.bio}</p>
        {author.credentials.length > 0 && (
          <>
            <h2>Credentials</h2>
            <ul>
              {author.credentials.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        )}
        {author.expertise.length > 0 && (
          <>
            <h2>Covers</h2>
            <p className="not-prose flex flex-wrap gap-1.5">
              {author.expertise.map((e) => (
                <span key={e} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                  {e}
                </span>
              ))}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {author.email && <Contact href={`mailto:${author.email}`} label="Email" />}
        {author.twitter && <Contact href={`https://twitter.com/${author.twitter}`} label="Twitter" />}
        {author.instagram && <Contact href={`https://instagram.com/${author.instagram}`} label="Instagram" />}
        {author.linkedin && <Contact href={author.linkedin} label="LinkedIn" />}
      </div>

      {author.posts.length > 0 && (
        <>
          <h2 className="mt-14 font-display text-3xl font-semibold">Recent articles</h2>
          <ul className="mt-6 divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
            {author.posts.map((p) => (
              <li key={p.id} className="p-5">
                <Link href={`/learn/${p.slug}`} className="font-semibold hover:text-brand-700">
                  {p.title}
                </Link>
                {p.excerpt && <p className="mt-1 text-sm text-ink-muted">{p.excerpt}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

function Contact({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer me"
      className="rounded-full border border-ink/15 px-3 py-1.5 font-semibold hover:bg-ink/5"
    >
      {label}
    </a>
  );
}
