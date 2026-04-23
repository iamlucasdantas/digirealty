import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { LeadForm } from "@/components/lead-form";
import { buildMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Get free quotes from top aesthetics providers",
  description:
    "Tell us what you're looking for and we'll match you with up to 3 vetted local providers. Free. No spam. Takes less than a minute.",
  path: "/get-quotes",
  noIndex: false,
});

interface Props {
  searchParams: { service?: string; city?: string; business?: string };
}

export default async function GetQuotesPage({ searchParams }: Props) {
  const serviceSlug = searchParams.service ?? "general-aesthetics";
  const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });
  if (!service && searchParams.service) notFound();

  return (
    <div className="container py-16 md:py-20 grid md:grid-cols-5 gap-10 lg:gap-14">
      <div className="md:col-span-3">
        <p className="eyebrow">Free · Vetted providers · 45 seconds</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-balance">
          {service ? (
            <>
              <span className="italic-accent">{service.name}</span> quotes from vetted local providers.
            </>
          ) : (
            <>
              <span className="italic-accent">Quotes</span> from vetted local providers.
            </>
          )}
        </h1>
        <p className="mt-5 text-lg text-ink-muted leading-relaxed">
          We match you with up to three local, licensed providers who reach out with
          personalized pricing. You choose who to respond to — no obligation, no spam.
        </p>

        <ul className="mt-10 space-y-3 text-sm">
          <Bullet>Licensed and insurance-verified providers only</Bullet>
          <Bullet>Real local pricing — not one generic estimate</Bullet>
          <Bullet>Your contact info is never sold</Bullet>
        </ul>
      </div>

      <div className="md:col-span-2">
        <Suspense fallback={<div className="h-64 rounded-3xl bg-sand" />}>
          <LeadForm
            serviceSlug={serviceSlug}
            serviceName={service?.name}
            citySlug={searchParams.city}
            businessSlug={searchParams.business}
          />
        </Suspense>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-block h-5 w-5 shrink-0 rounded-full bg-clay-100 text-clay-700 text-center text-xs font-bold leading-5">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}
