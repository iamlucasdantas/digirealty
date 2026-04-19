import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = buildMetadata({
  title: "Privacy policy",
  description: "How The Aesthetics Atlas collects, uses, and shares your information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <EditorialPage
      eyebrow="Legal"
      title="Privacy policy"
      lede="The short version: we collect what's needed to match you with providers and to operate the site. We don't sell your information."
      lastUpdated="April 2026"
    >
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Quote request info.</strong> Name, email, phone (optional), ZIP, service of
          interest, timeframe, budget range, and anything else you tell us in the free-text
          field.
        </li>
        <li>
          <strong>Usage data.</strong> Pages you visit, referrer, device + browser info, and a
          session ID stored in a first-party cookie (<code>al_sid</code>).
        </li>
        <li>
          <strong>IP address — hashed.</strong> We hash your IP with a site-wide salt before
          storing it. We never persist raw IPs.
        </li>
      </ul>

      <h2>What we do with it</h2>
      <ul>
        <li>Match you with up to three local providers for your specific quote request.</li>
        <li>Operate and improve the site (analytics, anti-abuse, A/B testing).</li>
        <li>
          Send you the content you asked for (e.g. if you subscribed to our newsletter or
          downloaded a guide).
        </li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>Sell your personal information.</li>
        <li>Share your contact details beyond the providers matched to your request.</li>
        <li>Send you marketing emails you didn&apos;t opt in to.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can request a copy of the personal data we hold about you, ask us to correct it,
        or ask us to delete it. Email{" "}
        <a href="mailto:privacy@theaestheticsatlas.com">privacy@theaestheticsatlas.com</a>.
        California and EU residents have additional rights under CCPA and GDPR
        respectively — the same email will route you correctly.
      </p>

      <h2>Cookies</h2>
      <p>
        We use first-party cookies for session continuity, and third-party cookies for
        analytics (Google Analytics 4, PostHog) if you consent. You can opt out in your
        browser.
      </p>

      <h2>Children</h2>
      <p>
        This site is for adults aged 18+. We do not knowingly collect information from
        anyone under 18.
      </p>

      <h2>Changes</h2>
      <p>
        We&apos;ll update the &ldquo;last updated&rdquo; date above when we change this policy. Material
        changes will be announced on the homepage for at least 30 days.
      </p>
    </EditorialPage>
  );
}
