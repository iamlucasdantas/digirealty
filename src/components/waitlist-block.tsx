import Link from "next/link";
import { NewsletterSignup } from "./newsletter-signup";
import { MapPin } from "lucide-react";

interface Props {
  serviceName: string;
  cityName: string;
  cityState: string;
  citySlug: string;
  serviceSlug: string;
}

/**
 * Spec P0.6: "não capturar lead que não pode ser servido". When we have no
 * verified providers for this (service × city), we do not render the lead
 * quiz. Instead we render an honest waitlist block — same email field, but
 * the user's explicit consent is for notification, not distribution.
 */
export function WaitlistBlock({
  serviceName,
  cityName,
  cityState,
  citySlug,
  serviceSlug,
}: Props) {
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
        <MapPin className="h-3.5 w-3.5" aria-hidden /> Not live in this market yet
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-amber-950">
        We don&apos;t have verified {serviceName} providers in {cityName} yet.
      </h2>
      <p className="mt-2 text-sm text-amber-900">
        We won&apos;t send your quote request to a provider we haven&apos;t vetted. Join the
        waitlist and we&apos;ll email you the moment a licensed {serviceName} provider in{" "}
        {cityName}, {cityState} has passed our onboarding — usually within a few
        weeks of signup volume hitting the threshold for a new market.
      </p>

      <div className="mt-5">
        <NewsletterSignup
          variant="inline"
          source="NEWSLETTER"
          sourceDetail={`waitlist:${serviceSlug}:${citySlug}`}
          title="Notify me"
          subtitle="No newsletter spam — one email when your provider is live."
          ctaLabel="Join waitlist"
        />
      </div>

      <p className="mt-4 text-xs text-amber-900/85">
        Meanwhile, read our{" "}
        <Link href="/learn" className="underline hover:text-amber-950">
          expert-reviewed guides
        </Link>{" "}
        or browse{" "}
        <Link href="/cities" className="underline hover:text-amber-950">
          live cities
        </Link>
        .
      </p>
    </section>
  );
}
