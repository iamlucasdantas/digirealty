import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import {
  buildMetadata,
  breadcrumbsJsonLd,
  articleJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { MedicallyReviewed } from "@/components/medically-reviewed";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const p = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!p || !p.published) {
    return buildMetadata({ title: "Not found", description: "", noIndex: true });
  }
  return buildMetadata({
    title: p.title,
    description: p.excerpt ?? p.title,
    path: `/learn/${p.slug}`,
    image: p.coverImage ?? undefined,
    type: "article",
    publishedTime: p.publishedAt?.toISOString(),
    modifiedTime: p.updatedAt.toISOString(),
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: { author: true, medicalReviewer: true },
  });
  if (!post || !post.published) notFound();

  const related = await prisma.blogPost.findMany({
    where: {
      published: true,
      NOT: { id: post.id },
      tags: { hasSome: post.tags },
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  const hasRealReviewer = post.medicalReviewer && !post.medicalReviewer.isPlaceholder;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbsJsonLd([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/learn" },
            { name: post.title, url: `/learn/${post.slug}` },
          ]),
          articleJsonLd({
            title: post.title,
            description: post.excerpt ?? "",
            slug: `learn/${post.slug}`,
            image: post.coverImage ?? undefined,
            publishedTime: post.publishedAt?.toISOString(),
            modifiedTime: post.updatedAt.toISOString(),
            reviewedTime: post.reviewedAt?.toISOString(),
            isMedical: true,
            author: post.author
              ? {
                  slug: post.author.slug,
                  name: post.author.name,
                  title: post.author.title,
                  photoUrl: post.author.photoUrl,
                  isPlaceholder: post.author.isPlaceholder,
                }
              : undefined,
            reviewer: post.medicalReviewer
              ? {
                  slug: post.medicalReviewer.slug,
                  name: post.medicalReviewer.name,
                  credentialSuffix: post.medicalReviewer.credentialSuffix,
                  title: post.medicalReviewer.title,
                  photoUrl: post.medicalReviewer.photoUrl,
                  licenseState: post.medicalReviewer.licenseState,
                  isPlaceholder: post.medicalReviewer.isPlaceholder,
                }
              : undefined,
          }),
        ]}
      />

      <article className="container py-10 md:py-14 max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-xs text-ink-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/learn" className="hover:text-ink">
            Guides
          </Link>
        </nav>

        {post.isPillar && (
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-600">
            Pillar guide
          </p>
        )}
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-ink-muted">{post.excerpt}</p>
        )}

        <MedicallyReviewed
          author={
            post.author
              ? {
                  slug: post.author.slug,
                  name: post.author.name,
                  title: post.author.title,
                  photoUrl: post.author.photoUrl,
                  isPlaceholder: post.author.isPlaceholder,
                }
              : {
                  slug: "the-atlas",
                  name: "The Atlas editorial team",
                  title: "Editorial",
                  isPlaceholder: true,
                }
          }
          reviewer={
            post.medicalReviewer
              ? {
                  slug: post.medicalReviewer.slug,
                  name: post.medicalReviewer.name,
                  credentialSuffix: post.medicalReviewer.credentialSuffix,
                  title: post.medicalReviewer.title,
                  photoUrl: post.medicalReviewer.photoUrl,
                  isPlaceholder: post.medicalReviewer.isPlaceholder,
                }
              : null
          }
          reviewedAt={post.reviewedAt}
          updatedAt={post.updatedAt}
          readingMinutes={post.readingMinutes}
        />

        {/* Article body */}
        <div
          className="prose-al mt-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Transparency footer inside the article */}
        <section className="mt-12 rounded-2xl border border-ink/10 bg-slate-50 p-5 text-sm text-ink-muted">
          <p className="font-semibold text-ink">Why you can trust this article</p>
          <ul className="mt-2 space-y-1">
            <li>
              Written by our editorial team and, when marked above, reviewed by a
              licensed clinician.
            </li>
            <li>
              We cite primary sources (FDA labeling, AAD/ASDS guidelines,
              peer-reviewed literature).
            </li>
            <li>
              We don&apos;t accept payment in exchange for coverage. See our{" "}
              <Link href="/editorial-policy" className="underline hover:text-ink">
                editorial policy
              </Link>
              .
            </li>
            <li>
              Something look wrong?{" "}
              <Link href="/contact" className="underline hover:text-ink">
                Tell us
              </Link>
              .
            </li>
          </ul>
        </section>

        {!hasRealReviewer && (
          <p className="mt-4 text-xs text-ink-muted">
            Clinical review pending — see{" "}
            <Link href="/medical-review-board" className="underline">
              how we review
            </Link>
            .
          </p>
        )}
      </article>

      {related.length > 0 && (
        <section className="container py-12 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold">Related reads</h2>
          <ul className="mt-5 divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
            {related.map((r) => (
              <li key={r.id} className="p-5">
                <Link
                  href={`/learn/${r.slug}`}
                  className="font-semibold hover:text-brand-700"
                >
                  {r.title}
                </Link>
                {r.excerpt && (
                  <p className="mt-1 text-sm text-ink-muted line-clamp-2">
                    {r.excerpt}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container pb-16 max-w-3xl">
        <NewsletterSignup variant="card" />
      </section>
    </>
  );
}
