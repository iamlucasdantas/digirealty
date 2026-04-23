import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "You're all set — quotes are on the way",
  description: "Thanks for your request. Vetted providers will reach out shortly.",
  path: "/thanks",
  noIndex: true,
});

export default function ThanksPage() {
  return (
    <div className="container py-24 text-center max-w-2xl">
      <div className="mx-auto h-14 w-14 rounded-full bg-clay-100 text-clay-700 text-2xl font-bold grid place-items-center">
        ✓
      </div>
      <p className="mt-6 eyebrow">Request received</p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-balance">
        Your quotes are on <span className="italic-accent">the way</span>.
      </h1>
      <p className="mt-5 text-ink-muted leading-relaxed">
        We&apos;re matching you with vetted providers in your area. Expect an email
        within one business day. Check your inbox — we just sent a summary of what
        you told us.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/learn"
          className="rounded-full bg-clay-500 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-clay-600"
        >
          Read the guides
        </Link>
        <Link
          href="/services"
          className="rounded-full border border-ink/15 bg-cream px-5 py-3 text-sm font-semibold hover:bg-sand"
        >
          Browse treatments
        </Link>
      </div>
    </div>
  );
}
