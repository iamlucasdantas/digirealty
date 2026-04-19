import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { EditorialPage } from "@/components/editorial-page";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Medical review board",
  description:
    "Every medical and wellness article on The Aesthetics Atlas is reviewed by a licensed clinician. Meet our board.",
  path: "/medical-review-board",
});

export const revalidate = 3600;

export default async function MedicalReviewBoardPage() {
  const reviewers = await prisma.medicalReviewer.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <EditorialPage
      eyebrow="Medical review"
      title="Medical review board"
      lede="Every article involving a medical procedure is reviewed by a clinician on this list before publication and re-audited at least once a year. Reviewers are paid a flat fee per article, hold no equity in the company, and have no business relationship with the providers listed on the site."
    >
      <div className="not-prose mt-8 grid gap-6 md:grid-cols-2">
        {reviewers.map((r) => (
          <section
            key={r.id}
            id={r.slug}
            className="rounded-2xl border border-ink/10 bg-white p-6"
          >
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
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Licensed in {r.licenseState}
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
                    <li
                      key={e}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs"
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {r.isPlaceholder && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Placeholder persona — will be replaced by a practicing clinician before
                public launch.
              </p>
            )}
          </section>
        ))}
      </div>

      <h2 className="mt-14">How our medical review process works</h2>
      <ol>
        <li>
          <strong>First draft.</strong> An editor researches and drafts the piece using primary
          sources (FDA labels, AAD/ASDS guidelines, peer-reviewed literature) and local
          price aggregation.
        </li>
        <li>
          <strong>Clinical review.</strong> A reviewer from the board above reads the draft and
          flags anything medically inaccurate, overgeneralized, or missing appropriate
          risk/candidate language.
        </li>
        <li>
          <strong>Revision.</strong> The editor revises. If the reviewer and editor can&apos;t
          agree, the piece doesn&apos;t publish.
        </li>
        <li>
          <strong>Attribution.</strong> The reviewer&apos;s name, credentials, and review date
          appear at the top of the article. Their license is verified with the relevant state
          board and re-verified annually.
        </li>
        <li>
          <strong>Re-review.</strong> Every medical article is re-reviewed within 12 months or
          immediately upon a material FDA action or change in standard of care.
        </li>
      </ol>

      <h2>Recruiting reviewers</h2>
      <p>
        If you&apos;re a licensed RN, NP, PA-C, or physician with at least three years of
        aesthetics practice and would like to join the board, email{" "}
        <a href="mailto:review@theaestheticsatlas.com">review@theaestheticsatlas.com</a>.
        We pay $150–$250 per article reviewed.
      </p>
    </EditorialPage>
  );
}
