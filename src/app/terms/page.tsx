import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = buildMetadata({
  title: "Terms of use",
  description: "Terms of use for The Aesthetics Atlas website and quote-matching service.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <EditorialPage
      eyebrow="Legal"
      title="Terms of use"
      lede="By using this site you agree to these terms. The short version: nothing here is medical advice, we match you with providers but don't guarantee their work, and we reserve the right to remove accounts that abuse the platform."
      lastUpdated="April 2026"
    >
      <h2>Not medical advice</h2>
      <p>
        The Aesthetics Atlas publishes educational content and matches consumers with
        licensed providers. Nothing on this site — including articles, pricing ranges,
        candidate descriptions, or FAQ answers — is medical advice. Decisions about your
        body belong in a consultation with a licensed clinician who has evaluated you in
        person.
      </p>

      <h2>Quote matching</h2>
      <p>
        When you submit a quote request, we share it with up to three providers we believe
        match your needs. Those providers are independent businesses. We do not guarantee
        their pricing, availability, outcomes, or conduct. Your agreement for any treatment
        is with the provider, not with us.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Submit false information or automated quote requests.</li>
        <li>Scrape, copy, or redistribute our content without written permission.</li>
        <li>Attempt to disrupt or compromise the site&apos;s security.</li>
        <li>Impersonate a provider or claim a listing you don&apos;t own.</li>
      </ul>

      <h2>Provider terms</h2>
      <p>
        Providers listing on the directory agree to additional terms at signup, including
        license verification, lead response SLAs, review integrity rules, and billing
        terms. These are presented at the time of signup and are incorporated by reference.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Site content, logos, and trademarks are owned by The Aesthetics Atlas except where
        credited. Personal, non-commercial use is permitted. Reproducing articles in whole or
        substantial part requires written permission.
      </p>

      <h2>Disclaimers & limitation of liability</h2>
      <p>
        The site is provided &ldquo;as is.&rdquo; To the maximum extent permitted by law, we
        disclaim all warranties, express or implied. We are not liable for indirect,
        incidental, or consequential damages arising from your use of the site or
        interactions with providers.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. Material changes will be announced on the homepage for
        at least 30 days.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:legal@theaestheticsatlas.com">legal@theaestheticsatlas.com</a>
      </p>
    </EditorialPage>
  );
}
