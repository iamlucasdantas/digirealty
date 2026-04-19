import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { EditorialPage } from "@/components/editorial-page";
import { ShieldCheck, ExternalLink } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Medical review board",
  description:
    "Every article involving a medical procedure is reviewed by a licensed clinician before publication. Meet the reviewers and read our process.",
  path: "/medical-review-board",
});

export const revalidate = 3600;

export default async function MedicalReviewBoardPage() {
  const reviewers = await prisma.medicalReviewer.findMany({
    orderBy: { createdAt: "asc" },
  });

  const active = reviewers.filter((r) => !r.isPlaceholder);
  const placeholder = reviewers.filter((r) => r.isPlaceholder);

  return (
    <EditorialPage
      eyebrow="Medical review"
      title="Medical review board"
      lede="Every article involving a medical procedure is reviewed by a licensed clinician before publication and re-audited at least once a year. Reviewers are paid a flat fee per article, hold no equity in the company, and have no business relationship with the providers listed on the site."
    >
      {active.length > 0 ? (
        <>
          <h2>Active reviewers</h2>
          <div className="not-prose mt-4 grid gap-6 md:grid-cols-2">
            {active.map((r) => (
              <ReviewerCard key={r.id} r={r} />
            ))}
          </div>
        </>
      ) : (
        <div className="not-prose mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="flex items-center gap-2 font-semibold text-amber-900">
            <ShieldCheck className="h-5 w-5" /> Actively recruiting our founding reviewer
          </p>
          <p className="mt-2 text-sm text-amber-900/90">
            We&apos;re in the process of contracting a practicing clinician (RN, NP, PA-C
            or physician) as our first medical reviewer. Until that reviewer is signed
            and verified, every medical article on the site is published with a{" "}
            <strong>&ldquo;Clinical review pending&rdquo;</strong> banner and is not counted
            as medically reviewed in our JSON-LD.
          </p>
          <p className="mt-3 text-sm text-amber-900/90">
            If you&apos;re a licensed clinician with at least three years of aesthetics
            practice and want to help us build this, email{" "}
            <a
              href="mailto:review@theaestheticsatlas.com"
              className="underline hover:text-amber-950"
            >
              review@theaestheticsatlas.com
            </a>
            . We pay $150–$250 per article reviewed.
          </p>
        </div>
      )}

      <h2>How our medical review process works</h2>
      <ol>
        <li>
          <strong>First draft.</strong> An editor researches and drafts the piece using
          primary sources (FDA labels, AAD/ASDS guidelines, peer-reviewed literature)
          and local price aggregation.
        </li>
        <li>
          <strong>Clinical review.</strong> A reviewer from the board above reads the
          draft and flags anything medically inaccurate, overgeneralized, or missing
          appropriate risk/candidate language.
        </li>
        <li>
          <strong>Revision.</strong> The editor revises. If the reviewer and editor
          can&apos;t agree, the piece doesn&apos;t publish.
        </li>
        <li>
          <strong>Attribution.</strong> The reviewer&apos;s name, credentials, and review
          date appear at the top of the article. Their license is verified with the
          relevant state board and re-verified annually.
        </li>
        <li>
          <strong>Re-review.</strong> Every medical article is re-reviewed within 12
          months or immediately upon a material FDA action or change in standard of
          care.
        </li>
      </ol>

      {placeholder.length > 0 && (
        <>
          <h2>Placeholder personas (not in production)</h2>
          <p>
            For transparency, these personas exist in our dev environment as
            scaffolding while we recruit real reviewers. They never appear on
            published articles or in structured data.
          </p>
          <ul>
            {placeholder.map((r) => (
              <li key={r.id}>
                {r.name}, {r.credentialSuffix} — <em>placeholder, not active</em>
              </li>
            ))}
          </ul>
        </>
      )}
    </EditorialPage>
  );
}

function ReviewerCard({
  r,
}: {
  r: {
    id: string;
    slug: string;
    name: string;
    credentialSuffix: string;
    title: string;
    photoUrl: string | null;
    licenseState: string | null;
    licenseVerifyUrl: string | null;
    verifiedAt: Date | null;
    bio: string;
    expertise: string[];
  };
}) {
  return (
    <section id={r.slug} className="rounded-2xl border border-ink/10 bg-white p-6">
      <div className="flex items-start gap-4">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-semibold"
          aria-hidden
        >
          {r.name
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </div>
        <div>
          <p className="font-display text-xl font-semibold">
            {r.name}, {r.credentialSuffix}
          </p>
          <p className="text-sm text-ink-muted">{r.title}</p>
          {r.licenseState && (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-emerald-700">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Licensed in {r.licenseState}
              </span>
              {r.verifiedAt && (
                <span className="text-ink-muted">
                  · verified {r.verifiedAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
              {r.licenseVerifyUrl && (
                <a
                  href={r.licenseVerifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline hover:text-emerald-900"
                >
                  verify <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </p>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm text-ink/85">{r.bio}</p>
      {r.expertise.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Reviews
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {r.expertise.map((e) => (
              <li key={e} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
