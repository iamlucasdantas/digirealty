import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Verifying claim",
  description: "",
  path: "/claim/verify",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function VerifyClaimPage({
  params,
}: {
  params: { token: string };
}) {
  const claim = await prisma.businessClaim.findUnique({
    where: { verifyToken: params.token },
    include: { business: true },
  });

  if (!claim) {
    return <Result ok={false} title="This link is invalid or has already been used." />;
  }

  if (claim.status === "VERIFIED") {
    return (
      <Result
        ok
        title="Already verified."
        body={`${claim.business.name} has already been claimed.`}
        ctaLabel="Go to dashboard"
        ctaHref="/admin"
      />
    );
  }

  if (claim.verifyExpiresAt < new Date()) {
    await prisma.businessClaim.update({
      where: { id: claim.id },
      data: { status: "EXPIRED" },
    });
    return (
      <Result
        ok={false}
        title="This link has expired."
        body={`Submit a new claim request at /claim/${claim.business.slug}.`}
      />
    );
  }

  // Create or link a BUSINESS_OWNER user for this email.
  const user = await prisma.user.upsert({
    where: { email: claim.claimantEmail },
    update: { role: "BUSINESS_OWNER" },
    create: {
      email: claim.claimantEmail,
      role: "BUSINESS_OWNER",
      name: claim.claimantName,
    },
  });

  await prisma.$transaction([
    prisma.business.update({
      where: { id: claim.businessId },
      data: {
        claimedById: user.id,
        unclaimed: false,
        tier: claim.business.tier === "FREE" ? "VERIFIED" : claim.business.tier,
      },
    }),
    prisma.businessClaim.update({
      where: { id: claim.id },
      data: { status: "VERIFIED", verifiedAt: new Date() },
    }),
  ]);

  // Could redirect to a magic-login page here; for now show confirmation.
  return (
    <Result
      ok
      title={`${claim.business.name} is yours.`}
      body="The listing is verified and the Verified badge is live. Sign in to manage leads, hours, and services."
      ctaLabel="Sign in"
      ctaHref="/login"
    />
  );
}

function Result({
  ok,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  ok: boolean;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="container py-24 max-w-xl text-center">
      {ok ? (
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
      ) : (
        <XCircle className="mx-auto h-14 w-14 text-rose-600" />
      )}
      <h1 className="mt-6 font-display text-3xl font-semibold">{title}</h1>
      {body && <p className="mt-3 text-ink-muted">{body}</p>}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-8 inline-flex rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
