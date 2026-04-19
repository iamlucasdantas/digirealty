import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { EditorialPage } from "@/components/editorial-page";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with The Aesthetics Atlas editorial, partnerships, or press team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <EditorialPage
      eyebrow="Contact"
      title="Get in touch"
      lede="Pick the right inbox below — we read everything and reply within two business days."
    >
      <div className="not-prose mt-6 grid gap-4 md:grid-cols-2">
        <Card
          label="Editorial & corrections"
          email={`corrections@${hostOf(siteConfig.url)}`}
          hint="Factual errors, outdated pricing, broken links."
        />
        <Card
          label="Providers & partnerships"
          email={`partners@${hostOf(siteConfig.url)}`}
          hint="List, claim, or upgrade your practice. Bulk market questions welcome."
        />
        <Card
          label="Press"
          email={`press@${hostOf(siteConfig.url)}`}
          hint="Interview requests, data and trend inquiries, speaker bookings."
        />
        <Card
          label="General"
          email={siteConfig.support.email}
          hint="Anything else."
        />
      </div>

      <h2>Mailing address</h2>
      <p>
        The Aesthetics Atlas
        <br />
        Davenport, Iowa
        <br />
        United States
      </p>

      <h2>Please don&apos;t send us</h2>
      <ul>
        <li>Photos of skin conditions for medical opinion — we&apos;re not your doctor.</li>
        <li>
          Requests to remove factual reviews or editorial mentions. See our{" "}
          <a href="/editorial-policy">editorial policy</a>.
        </li>
        <li>Generic link-building outreach. It goes straight to the archive.</li>
      </ul>
    </EditorialPage>
  );
}

function Card({ label, email, hint }: { label: string; email: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{label}</p>
      <a href={`mailto:${email}`} className="mt-1 block font-semibold hover:underline">
        {email}
      </a>
      <p className="mt-1 text-sm text-ink-muted">{hint}</p>
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "theaestheticsatlas.com";
  }
}
