import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = buildMetadata({
  title: "Editorial policy",
  description:
    "How we research, write, medically review, correct, and disclose conflicts at The Aesthetics Atlas.",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <EditorialPage
      eyebrow="Policy"
      title="Editorial & medical review standards"
      lede="Aesthetics decisions affect your body, your money, and sometimes your health. We take that seriously. Here's exactly how we write, review, and correct what we publish."
      lastUpdated="April 2026"
    >
      <h2>Independence</h2>
      <p>
        Our editorial rankings, guides, and recommendations are independent of advertising
        and partner relationships. Providers can pay to be featured in sponsored slots — those
        slots are always clearly labeled <em>&ldquo;Sponsored&rdquo;</em> or <em>&ldquo;Featured partner&rdquo;</em>.
        Paid placement never influences what we publish in a guide or how we rank providers
        in organic listings.
      </p>

      <h2>Sourcing</h2>
      <p>
        We cite primary sources wherever possible — FDA labeling and approval documents,
        AAD (American Academy of Dermatology) and ASDS (American Society for Dermatologic
        Surgery) position statements, JAMA Dermatology and similar peer-reviewed
        publications, and manufacturer prescribing information. When we quote pricing or
        downtime estimates, we aggregate from multiple licensed local providers and note the
        date.
      </p>
      <p>We don&apos;t cite:</p>
      <ul>
        <li>Manufacturer marketing copy as fact</li>
        <li>Influencer testimonials as outcomes</li>
        <li>Reddit threads, unless explicitly framed as anecdote</li>
      </ul>

      <h2>Medical review</h2>
      <p>
        Every article that touches a medical procedure is reviewed by a licensed
        clinician — registered nurse (RN), nurse practitioner (NP), physician assistant
        (PA-C), or physician (MD/DO) — before publication. The reviewer&apos;s name, credentials,
        and the date of review appear at the top of the piece. See our{" "}
        <a href="/medical-review-board">medical review board</a>.
      </p>
      <p>
        Medical reviewers re-audit each article at least every 12 months or immediately if
        a new FDA action, recall, or major clinical guideline shifts the standard of care.
        Reviewers are paid a flat fee per article; they have no equity in the company and
        no relationship with the providers listed on the site.
      </p>

      <h2>How we rank providers</h2>
      <p>
        For any &ldquo;best [treatment] in [city]&rdquo; list, providers are ranked by a weighted
        combination of:
      </p>
      <ul>
        <li>Licensing and board certification verification</li>
        <li>Verified patient reviews (aggregated from multiple platforms)</li>
        <li>Years of experience with the specific treatment</li>
        <li>Whether the injector/provider — not just the medical director — is on-site</li>
        <li>Consultation experience (assessed via mystery consult when feasible)</li>
      </ul>
      <p>
        <strong>Featured and Premium partners pay a subscription fee</strong> that places them
        in clearly labeled sponsored slots. They do <em>not</em> appear higher in our
        independently ranked lists because they pay us.
      </p>

      <h2>Corrections</h2>
      <p>
        If you find a factual error, email us at{" "}
        <a href="mailto:corrections@theaestheticsatlas.com">corrections@theaestheticsatlas.com</a>.
        We publish corrections at the bottom of the affected article with a date stamp.
        We don&apos;t silently edit.
      </p>

      <h2>Affiliate relationships</h2>
      <p>
        Some links on this site are affiliate links — if you buy a recommended product, we
        may earn a small commission at no cost to you. These links are always clearly marked.
        Read our full <a href="/how-we-make-money">revenue disclosure</a>.
      </p>

      <h2>AI disclosure</h2>
      <p>
        We use AI tools to draft first versions of some content, research local pricing, and
        generate initial FAQ sets. Every AI-assisted piece is edited by a human editor and
        reviewed by a licensed clinician before publication. We don&apos;t publish raw AI output.
      </p>

      <h2>What we won&apos;t do</h2>
      <ul>
        <li>Write about specific providers in exchange for payment</li>
        <li>Remove a negative review in exchange for subscription upgrade</li>
        <li>Endorse specific treatments for conditions (we&apos;re not your doctor)</li>
        <li>Use before/after photos without explicit patient consent</li>
      </ul>
    </EditorialPage>
  );
}
