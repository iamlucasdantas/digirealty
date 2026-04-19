import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = buildMetadata({
  title: "Corrections",
  description:
    "When we get something wrong on The Aesthetics Atlas, we fix it publicly with a dated note at the bottom of the affected article. Here's every correction we've published.",
  path: "/corrections",
});

export default function CorrectionsPage() {
  return (
    <EditorialPage
      eyebrow="Corrections"
      title="Corrections log"
      lede="When we publish something wrong, we don't quietly edit it. We add a dated correction note at the bottom of the affected piece, and we log it here so you can see every one."
    >
      <p>
        Found a factual error or out-of-date pricing? Email{" "}
        <a href="mailto:corrections@theaestheticsatlas.com">
          corrections@theaestheticsatlas.com
        </a>{" "}
        with the article URL and what should be changed. We reply within two business
        days.
      </p>

      <h2>Published corrections</h2>
      <p>
        <em>No corrections yet — we&apos;ve only just started publishing.</em>
      </p>

      <h2>How we handle different kinds of errors</h2>
      <ul>
        <li>
          <strong>Typos &amp; formatting.</strong> Fixed silently, no note required.
        </li>
        <li>
          <strong>Numerical / pricing error.</strong> Fixed inline; footer correction
          note with old and new value, date, and who caught it.
        </li>
        <li>
          <strong>Medical inaccuracy.</strong> Pulled from public view, re-reviewed
          by a clinician, republished with a clearly labelled &ldquo;Corrected on
          [date]&rdquo; banner at the top and a footer note.
        </li>
        <li>
          <strong>Provider complaint.</strong> Investigated against primary evidence.
          If we were wrong, we correct as above. If we were right, we respond to the
          provider but don&apos;t change the article.
        </li>
      </ul>
    </EditorialPage>
  );
}
