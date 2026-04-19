import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Remove listing",
  description: "",
  path: "/unlist",
  noIndex: true,
});

export const dynamic = "force-dynamic";

/**
 * One-click opt-out for imported directory rows. The token is sent in the
 * outreach email attached to every imported business ("we added your
 * business — click here to remove it, no questions asked").
 */
export default async function UnlistPage({ params }: { params: { token: string } }) {
  const t = await prisma.unlistToken.findUnique({
    where: { token: params.token },
    include: { business: true },
  });

  if (!t) {
    return (
      <Result
        ok={false}
        title="Invalid or already-used link."
        body="If you still want your listing removed, email us at hello@theaestheticsatlas.com."
      />
    );
  }

  if (t.usedAt) {
    return (
      <Result
        ok
        title="Already removed."
        body={`${t.business.name} is no longer published on The Aesthetics Atlas.`}
      />
    );
  }

  await prisma.$transaction([
    prisma.business.update({
      where: { id: t.businessId },
      data: { status: "SUSPENDED" },
    }),
    prisma.unlistToken.update({
      where: { id: t.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return (
    <Result
      ok
      title={`${t.business.name} has been removed.`}
      body="Your listing is no longer published. If this was a mistake or you'd like to opt back in with editing rights, reply to the email we sent you — we'll help personally."
    />
  );
}

function Result({ ok, title, body }: { ok: boolean; title: string; body: string }) {
  return (
    <div className="container py-24 max-w-xl text-center">
      {ok ? (
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
      ) : (
        <XCircle className="mx-auto h-14 w-14 text-rose-600" />
      )}
      <h1 className="mt-6 font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-ink-muted">{body}</p>
      <Link
        href="/contact"
        className="mt-8 inline-flex rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold hover:bg-ink/5"
      >
        Contact us
      </Link>
    </div>
  );
}
