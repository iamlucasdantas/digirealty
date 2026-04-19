import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { EditorialPage } from "@/components/editorial-page";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = buildMetadata({
  title: "About us",
  description:
    "The Aesthetics Atlas is an independent editorial + directory for aesthetics, wellness, and cosmetic care. We publish expert-reviewed guides and match readers with vetted local providers.",
  path: "/about",
});

export const revalidate = 3600;

export default async function AboutPage() {
  const [authors, reviewers] = await Promise.all([
    prisma.author.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.medicalReviewer.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <EditorialPage
      eyebrow="About"
      title={`Why ${siteConfig.shortName} exists`}
      lede="The beauty industry sells mystery. We sell clarity — honest guides to every treatment, real local pricing, and a curated shortlist of providers worth your time and money."
    >
      <h2>Our mission</h2>
      <p>
        Every year, millions of women walk into consultations unsure what they should pay,
        what will actually work for their face or body, and whether the person holding the
        needle has the hours behind them. We started The Aesthetics Atlas because that
        asymmetry felt absurd — and fixable.
      </p>
      <p>
        We publish deeply researched treatment guides, reviewed by licensed clinicians,
        alongside a tightly curated directory of aesthetics, wellness, and cosmetic providers.
        When you request a quote, we only match you with practices we&apos;ve vetted. That&apos;s it.
        No upsells, no aggressive retargeting, no selling your email to a spa chain.
      </p>

      <h2>What we do — and don&apos;t — do</h2>
      <ul>
        <li>
          <strong>We write expert-reviewed guides.</strong> Every article on a medical treatment
          is reviewed by a licensed RN, PA-C, NP, or physician before publication and
          re-reviewed at least annually.
        </li>
        <li>
          <strong>We verify every provider in our directory.</strong> No pay-to-play ranking —
          providers can pay to be featured, and we label that clearly, but our editorial
          rankings are independent.
        </li>
        <li>
          <strong>We don&apos;t perform or recommend specific procedures.</strong> Nothing here is
          medical advice. Decisions about your body belong in the room with a licensed
          clinician who has evaluated you in person.
        </li>
        <li>
          <strong>We don&apos;t sell your contact info.</strong> When you request quotes, we share
          what you tell us with up to three matching providers. Never a broader mailing list.
        </li>
      </ul>

      <h2>The team</h2>
      <p>
        We&apos;re a small editorial team based across the Midwest, with a growing network of
        medical reviewers around the country. Meet us:
      </p>

      <div className="not-prose mt-6 grid gap-4 md:grid-cols-2">
        {authors.map((a) => (
          <Link
            key={a.id}
            href={`/team/${a.slug}`}
            className="rounded-2xl border border-ink/10 bg-white p-5 hover:border-brand-200"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Editorial</p>
            <p className="mt-1 font-display text-xl font-semibold">{a.name}</p>
            <p className="text-sm text-ink-muted">{a.title}</p>
            <p className="mt-3 text-sm line-clamp-3">{a.bio}</p>
          </Link>
        ))}
        {reviewers.map((r) => (
          <Link
            key={r.id}
            href={`/medical-review-board#${r.slug}`}
            className="rounded-2xl border border-ink/10 bg-white p-5 hover:border-brand-200"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Medical review
            </p>
            <p className="mt-1 font-display text-xl font-semibold">
              {r.name}, {r.credentialSuffix}
            </p>
            <p className="text-sm text-ink-muted">{r.title}</p>
            <p className="mt-3 text-sm line-clamp-3">{r.bio}</p>
          </Link>
        ))}
      </div>

      <h2>How to reach us</h2>
      <p>
        Email <a href={`mailto:${siteConfig.support.email}`}>{siteConfig.support.email}</a> or
        use the <Link href="/contact">contact form</Link>. Press inquiries welcome.
      </p>
    </EditorialPage>
  );
}
