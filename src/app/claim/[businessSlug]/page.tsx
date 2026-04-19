import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { ClaimForm } from "./claim-form";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { businessSlug: string };
}): Promise<Metadata> {
  const b = await prisma.business.findUnique({
    where: { slug: params.businessSlug },
    include: { city: true },
  });
  if (!b) return buildMetadata({ title: "Not found", description: "", noIndex: true });
  return buildMetadata({
    title: `Claim ${b.name}`,
    description: `Claim the listing for ${b.name} in ${b.city.name} and start receiving matched quote requests.`,
    path: `/claim/${params.businessSlug}`,
    noIndex: true,
  });
}

export default async function ClaimPage({
  params,
}: {
  params: { businessSlug: string };
}) {
  const business = await prisma.business.findUnique({
    where: { slug: params.businessSlug },
    include: { city: true, services: { include: { service: true } } },
  });
  if (!business) notFound();

  return (
    <div className="container py-14 md:py-20 grid md:grid-cols-5 gap-10">
      <div className="md:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Claim your listing
        </p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">
          {business.name}
        </h1>
        <p className="mt-2 text-ink-muted">
          {business.city.name}, {business.city.state}
        </p>

        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="flex items-center gap-2 font-semibold text-emerald-900">
            <ShieldCheck className="h-5 w-5" /> Claiming is free — always.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900">
            <li>Edit hours, services, pricing, and photos</li>
            <li>Respond to matched quote requests</li>
            <li>Display the &ldquo;Verified&rdquo; badge on your profile</li>
            <li>Upgrade to Featured or Premium when you&apos;re ready</li>
          </ul>
        </div>

        <div className="mt-8 prose-al">
          <h2>How we verify</h2>
          <p>
            We send a verification link to the email you provide below. If that email
            isn&apos;t on the business domain, we&apos;ll also call the business phone number on
            file to confirm. Verification usually takes a few hours during business days.
          </p>
          <p>
            Need to claim as the marketing contact for a multi-location chain? Email{" "}
            <a href="mailto:partners@theaestheticsatlas.com">partners@theaestheticsatlas.com</a>{" "}
            and we&apos;ll route you to bulk onboarding.
          </p>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="sticky top-24">
          <ClaimForm businessSlug={business.slug} businessName={business.name} />
        </div>
      </div>
    </div>
  );
}
