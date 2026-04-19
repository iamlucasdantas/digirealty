import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const metadata: Metadata = buildMetadata({
  title: "Join the waitlist",
  description:
    "Tell us where you'd like The Aesthetics Atlas to launch next. We'll email you the moment we have verified providers in your city.",
  path: "/waitlist",
});

export const revalidate = 300;

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: { city?: string };
}) {
  const city = searchParams.city
    ? await prisma.city.findUnique({ where: { slug: searchParams.city } })
    : null;

  return (
    <div className="container py-14 md:py-20 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        Waitlist
      </p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">
        {city
          ? `We&rsquo;re not live in ${city.name} yet.`
          : "Where should we go next?"}
      </h1>
      <p className="mt-4 text-lg text-ink-muted">
        {city
          ? `We're still vetting providers in ${city.name}, ${city.state}. Leave your email and we'll tell you the moment we're live — no newsletter spam.`
          : "Leave your ZIP and we'll tell you when your market is live."}
      </p>

      <div className="mt-10 text-left">
        <NewsletterSignup
          source="NEWSLETTER"
          sourceDetail={city ? `waitlist:${city.slug}` : "waitlist"}
          title="Notify me"
          subtitle="One email, when your city goes live. Unsubscribe anytime."
          ctaLabel="Join waitlist"
        />
      </div>
    </div>
  );
}
