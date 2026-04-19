import Link from "next/link";
import { prisma } from "@/lib/db";
import { ShieldCheck, ExternalLink, AlertCircle } from "lucide-react";
import { ReviewerForm } from "./reviewer-form";

export const dynamic = "force-dynamic";

export default async function AdminReviewersPage() {
  const reviewers = await prisma.medicalReviewer.findMany({
    orderBy: [{ isPlaceholder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Medical reviewers</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Only reviewers with <strong>no placeholder flag</strong> and a{" "}
            <strong>license verification link</strong> appear publicly on the site
            or in JSON-LD.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Board ({reviewers.length})
          </h2>
          {reviewers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink/15 p-6 text-ink-muted text-sm">
              No reviewers yet. Add one using the form →
            </p>
          ) : (
            <ul className="space-y-3">
              {reviewers.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-ink/10 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold">
                        {r.name}, {r.credentialSuffix}
                      </p>
                      <p className="text-xs text-ink-muted">{r.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        {r.isPlaceholder ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-0.5">
                            <AlertCircle className="h-3 w-3" /> Placeholder — not
                            publicly visible
                          </span>
                        ) : r.licenseVerifyUrl ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 px-2 py-0.5">
                            <ShieldCheck className="h-3 w-3" /> Verified · publicly
                            listed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-900 px-2 py-0.5">
                            <AlertCircle className="h-3 w-3" /> No verify URL — not
                            publicly listed
                          </span>
                        )}
                        {r.licenseState && (
                          <span className="text-ink-muted">Licensed in {r.licenseState}</span>
                        )}
                        {r.licenseVerifyUrl && (
                          <a
                            href={r.licenseVerifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-brand-700 underline"
                          >
                            verify <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/medical-review-board#${r.slug}`}
                      className="text-xs text-brand-700 hover:underline"
                    >
                      view →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside>
          <ReviewerForm />
        </aside>
      </div>
    </>
  );
}
