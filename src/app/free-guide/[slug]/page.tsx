import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { MedicallyReviewed } from "@/components/medically-reviewed";
import { CheckCircle2 } from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const m = await prisma.leadMagnet.findUnique({ where: { slug: params.slug } });
  if (!m) return buildMetadata({ title: "Not found", description: "", noIndex: true });
  return buildMetadata({
    title: m.title,
    description: m.subtitle ?? m.description.slice(0, 155),
    path: `/free-guide/${m.slug}`,
    image: m.coverImage ?? undefined,
  });
}

export default async function LeadMagnetPage({ params }: { params: { slug: string } }) {
  const magnet = await prisma.leadMagnet.findUnique({
    where: { slug: params.slug },
    include: { reviewedBy: true },
  });
  if (!magnet || !magnet.published) notFound();

  return (
    <div className="container py-14 md:py-20 grid md:grid-cols-5 gap-10">
      <div className="md:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Free download · {magnet.pageCount ? `${magnet.pageCount} pages` : "PDF"}
        </p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">{magnet.title}</h1>
        {magnet.subtitle && (
          <p className="mt-3 text-xl text-ink-muted">{magnet.subtitle}</p>
        )}

        {magnet.reviewedBy && (
          <MedicallyReviewed
            author={{ slug: "morgan-ellis", name: "Morgan Ellis", title: "Editor-in-Chief" }}
            reviewer={{
              slug: magnet.reviewedBy.slug,
              name: magnet.reviewedBy.name,
              credentialSuffix: magnet.reviewedBy.credentialSuffix,
              title: magnet.reviewedBy.title,
              photoUrl: magnet.reviewedBy.photoUrl,
              isPlaceholder: magnet.reviewedBy.isPlaceholder,
            }}
            reviewedAt={magnet.updatedAt}
          />
        )}

        <div className="prose-al mt-8 max-w-none">
          {magnet.description.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-slate-50 border border-ink/10 p-6">
          <p className="text-sm font-semibold">What&apos;s inside</p>
          <ul className="mt-3 space-y-2 text-sm">
            {defaultChecklist.map((c) => (
              <li key={c} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-600 shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="sticky top-24">
          <NewsletterSignup
            variant="card"
            source="LEAD_MAGNET"
            sourceDetail={magnet.slug}
            title="Send me the guide"
            subtitle={`Enter your email and we'll send you "${magnet.title}" plus our weekly newsletter. Unsubscribe anytime.`}
            ctaLabel="Send guide"
          />
        </div>
      </div>
    </div>
  );
}

const defaultChecklist = [
  "Questions that reveal whether a provider has the reps behind them",
  "How to spot — and price — a consult that's actually useful",
  "Red flags that should stop you from booking",
  "A printable checklist you can bring with you",
  "Expert-reviewed by a licensed clinician",
];
