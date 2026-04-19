import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = buildMetadata({
  title: "How we make money",
  description:
    "Full transparency on how The Aesthetics Atlas is funded — affiliate links, provider subscriptions, and pay-per-lead — and how we keep editorial independent.",
  path: "/how-we-make-money",
});

export default function HowWeMakeMoneyPage() {
  return (
    <EditorialPage
      eyebrow="Transparency"
      title="How we make money"
      lede="Nothing on this site is free to produce. Here's exactly how we pay for editorial research, clinical review, and the engineering behind the directory — and how we keep those income streams from compromising what we publish."
      lastUpdated="April 2026"
    >
      <h2>Our revenue, in one paragraph</h2>
      <p>
        The Aesthetics Atlas earns money from (1) affiliate commissions on certain
        recommended products, (2) subscription fees from providers who want a verified or
        featured listing in our directory, and (3) pay-per-lead fees from providers who
        receive matched quote requests. We do <em>not</em> sell your email, we do not run
        programmatic display ads, and we do not take money to write or reposition an article.
      </p>

      <h2>1. Affiliate links</h2>
      <p>
        Some product links on this site are affiliate links. If you click through and buy,
        we may earn a small commission — at no extra cost to you. Affiliate partnerships
        we&apos;re currently in or evaluating: Amazon Associates, ShareASale (beauty), Impact,
        CJ Affiliate, and select direct-to-consumer skincare programs.
      </p>
      <p>
        <strong>As an Amazon Associate we earn from qualifying purchases.</strong>
      </p>
      <p>
        Commissions never influence which products we recommend. We only link to products
        we would recommend to a friend — and when we wouldn&apos;t, we say so explicitly.
      </p>

      <h2>2. Provider subscriptions</h2>
      <p>
        Aesthetics practices, med spas, and cosmetic clinics can pay a monthly subscription
        for a Verified, Featured, or Premium listing. Each tier unlocks a different set of
        benefits (verified badge, featured slot, priority lead routing). Subscribers are
        always clearly labeled on the site. See{" "}
        <Link href="/for-providers">For providers</Link> for pricing.
      </p>
      <p>
        Paying for a subscription <em>never</em> moves a provider up in editorial rankings
        like &ldquo;best Botox in Davenport.&rdquo; Those lists are ranked independently using the
        criteria in our <Link href="/editorial-policy">editorial policy</Link>.
      </p>

      <h2>3. Pay-per-lead</h2>
      <p>
        When you submit a quote request, we match you with up to three local providers who
        handle the treatment you&apos;re asking about. Providers pay us a flat fee per matched
        request (typically $15–$40). That fee is how we fund free research and editorial
        work — and it&apos;s why our quote requests are free for you.
      </p>
      <p>
        What providers receive: your first name, ZIP, the service you asked about, your
        stated timeframe and budget range, and your preferred contact method. Nothing else.
        Your full details (including address) are never sold or shared beyond matched
        providers for this specific request.
      </p>

      <h2>What we do with the money</h2>
      <ul>
        <li>Pay editors and licensed medical reviewers</li>
        <li>Commission original photography and infographics</li>
        <li>License market data and run mystery consultations</li>
        <li>Host, maintain, and improve this site</li>
      </ul>

      <h2>Guardrails</h2>
      <ul>
        <li>Editorial and sales functions report to different people.</li>
        <li>No editor or reviewer owns equity in a listed provider.</li>
        <li>No article is written or repositioned in exchange for payment.</li>
        <li>Removals of negative mentions are not for sale.</li>
        <li>All sponsored content is labeled &ldquo;Sponsored&rdquo; or &ldquo;Featured partner.&rdquo;</li>
      </ul>

      <p>
        Questions about any of this? Email{" "}
        <a href="mailto:hello@theaestheticsatlas.com">hello@theaestheticsatlas.com</a>.
      </p>
    </EditorialPage>
  );
}
