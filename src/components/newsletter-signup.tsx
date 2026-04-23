"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "hero" | "inline" | "footer" | "card";

interface Props {
  variant?: Variant;
  source?: "NEWSLETTER" | "LEAD_MAGNET";
  sourceDetail?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onSuccess?: (email: string) => void;
  className?: string;
}

/**
 * "The Weekly Glow" signup. Submits to /api/subscribers which writes to our
 * Subscriber table and (if configured) syncs to Beehiiv/ConvertKit.
 */
export function NewsletterSignup({
  variant = "inline",
  source = "NEWSLETTER",
  sourceDetail,
  title = "The Weekly Glow",
  subtitle = "One email a week. Real prices, expert-reviewed guides, zero pressure.",
  ctaLabel = "Subscribe",
  onSuccess,
  className,
}: Props) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const res = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        firstName: firstName || undefined,
        source,
        sourceDetail,
        landingPath: typeof window !== "undefined" ? window.location.pathname : undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again.");
      setState("error");
      return;
    }
    setState("success");
    onSuccess?.(email);
  }

  if (state === "success") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900",
          className,
        )}
      >
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-5 w-5" /> You&apos;re in.
        </p>
        <p className="mt-1 text-sm">
          Check your inbox for a confirmation email (it may take a minute).
        </p>
      </div>
    );
  }

  const container =
    variant === "hero"
      ? "rounded-3xl border border-clay-100 bg-bone p-6 shadow-soft"
      : variant === "card"
      ? "rounded-3xl border border-clay-200 bg-gradient-to-br from-blush-50 to-cream p-6 shadow-soft"
      : variant === "footer"
      ? ""
      : "rounded-3xl border border-clay-100 bg-bone p-5";

  return (
    <div className={cn(container, className)}>
      {(variant === "hero" || variant === "card" || variant === "inline") && (
        <>
          <p className="flex items-center gap-2 eyebrow">
            <Mail className="h-3.5 w-3.5" aria-hidden /> Newsletter
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-ink text-balance">
            {title}
          </h3>
          <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
        </>
      )}

      <form onSubmit={submit} className="mt-5 space-y-3">
        {variant !== "footer" && (
          <input
            type="text"
            placeholder="First name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl border border-clay-200 bg-cream px-3 py-2 text-sm placeholder:text-ink-faint focus:border-clay-500 focus:ring-2 focus:ring-clay-100 focus:outline-none"
            autoComplete="given-name"
          />
        )}
        <div className="flex gap-2">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-xl border border-clay-200 bg-cream px-3 py-2 text-sm placeholder:text-ink-faint focus:border-clay-500 focus:ring-2 focus:ring-clay-100 focus:outline-none"
            autoComplete="email"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="rounded-xl bg-clay-500 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-clay-600 disabled:opacity-50"
          >
            {state === "loading" ? "…" : ctaLabel}
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <p className="text-[11px] text-ink-muted">
          We never sell your email. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
