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
      <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 text-2xl font-bold grid place-items-center">
        ✓
      </div>
      <h1 className="mt-6 font-display text-4xl font-semibold">Thanks! Your quotes are on the way.</h1>
      <p className="mt-4 text-ink-muted">
        We're matching you with vetted providers in your area. Expect a call or email within ~15
        minutes during business hours. Check your inbox — we just sent a summary.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/services"
          className="rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold hover:bg-ink/5"
        >
          Browse more treatments
        </Link>
        <Link
          href="/learn"
          className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Read provider guides
        </Link>
      </div>
    </div>
  );
}
