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
    <section className="rounded-3xl border border-clay-200 bg-gradient-to-br from-blush-50 via-cream to-sand p-6 shadow-soft">
      <p className="flex items-center gap-2 eyebrow">
        <MapPin className="h-3.5 w-3.5" aria-hidden /> Not live in this market yet
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-ink text-balance">
        We don&apos;t have <span className="italic-accent">vetted</span>{" "}
        {serviceName} providers in {cityName} yet.
      </h2>
      <p className="mt-3 text-sm text-ink-muted leading-relaxed">
        We won&apos;t send your request to a provider we haven&apos;t checked. Leave your
        email and we&apos;ll notify you the moment a licensed {serviceName} provider in{" "}
        {cityName}, {cityState} passes our onboarding.
      </p>

      <div className="mt-6">
        <NewsletterSignup
          variant="inline"
          source="NEWSLETTER"
          sourceDetail={`waitlist:${serviceSlug}:${citySlug}`}
          title="Notify me"
          subtitle="No newsletter spam — one email when your provider is live."
          ctaLabel="Join waitlist"
        />
      </div>

      <p className="mt-4 text-xs text-ink-muted">
        Meanwhile, read our{" "}
        <Link
          href="/learn"
          className="text-clay-600 underline decoration-clay-300 underline-offset-2 hover:text-clay-700"
        >
          expert-reviewed guides
        </Link>{" "}
        or browse{" "}
        <Link
          href="/cities"
          className="text-clay-600 underline decoration-clay-300 underline-offset-2 hover:text-clay-700"
        >
          live cities
        </Link>
        .
      </p>
    </section>
  );
}
