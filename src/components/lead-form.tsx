"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  serviceSlug: string;
  serviceName?: string;
  citySlug?: string;
  businessSlug?: string;
  compact?: boolean;
}

type Step = 1 | 2 | 3 | 4;

interface FormState {
  timeframe: string;
  budget: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  message: string;
  // honeypot
  website: string;
}

const initial: FormState = {
  timeframe: "",
  budget: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  zip: "",
  message: "",
  website: "",
};

export function LeadForm({ serviceSlug, serviceName, citySlug, businessSlug, compact }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceSlug,
          citySlug,
          businessSlug,
          landingPath: typeof window !== "undefined" ? window.location.pathname : undefined,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
          utm: {
            source: search.get("utm_source") ?? undefined,
            medium: search.get("utm_medium") ?? undefined,
            campaign: search.get("utm_campaign") ?? undefined,
            content: search.get("utm_content") ?? undefined,
            term: search.get("utm_term") ?? undefined,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "submit_failed");
      }
      router.push(`/thanks?service=${serviceSlug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const title = serviceName ? `Get free ${serviceName} quotes` : "Get free quotes";

  return (
    <div className={compact ? "" : "rounded-3xl border border-ink/10 bg-white p-6 shadow-sm"}>
      {!compact && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Step {step} of 4</p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{title}</h3>
          <p className="text-sm text-ink-muted">Free · Takes 45 seconds · No spam</p>
        </>
      )}

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 4) setStep((s) => (s + 1) as Step);
          else submit();
        }}
      >
        {step === 1 && (
          <Field label="When are you looking to get started?">
            <RadioGroup
              name="timeframe"
              value={form.timeframe}
              onChange={(v) => update("timeframe", v)}
              options={[
                { value: "immediate", label: "Immediately" },
                { value: "1-3m", label: "Within 1–3 months" },
                { value: "3-6m", label: "3–6 months" },
                { value: "researching", label: "Just researching" },
              ]}
            />
          </Field>
        )}

        {step === 2 && (
          <Field label="Typical budget for this treatment?">
            <RadioGroup
              name="budget"
              value={form.budget}
              onChange={(v) => update("budget", v)}
              options={[
                { value: "<500", label: "Under $500" },
                { value: "500-1500", label: "$500–$1,500" },
                { value: "1500-5000", label: "$1,500–$5,000" },
                { value: "5000+", label: "$5,000+" },
                { value: "unsure", label: "Not sure yet" },
              ]}
            />
          </Field>
        )}

        {step === 3 && (
          <>
            <Field label="Your name">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="First" value={form.firstName} onChange={(v) => update("firstName", v)} required />
                <Input placeholder="Last" value={form.lastName} onChange={(v) => update("lastName", v)} />
              </div>
            </Field>
            <Field label="ZIP">
              <Input placeholder="52722" value={form.zip} onChange={(v) => update("zip", v)} />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <Field label="Email">
              <Input type="email" placeholder="you@example.com" value={form.email} onChange={(v) => update("email", v)} required />
            </Field>
            <Field label="Phone (optional — faster quotes)">
              <Input type="tel" placeholder="(555) 555-5555" value={form.phone} onChange={(v) => update("phone", v)} />
            </Field>
            <Field label="Anything else we should share with providers? (optional)">
              <textarea
                className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                rows={3}
                maxLength={2000}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
              />
            </Field>

            {/* Honeypot */}
            <label className="hidden" aria-hidden>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
              />
            </label>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              className="text-sm font-semibold text-ink-muted hover:text-ink"
            >
              ← Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={submitting || (step === 1 && !form.timeframe) || (step === 3 && !form.firstName)}
            className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-50"
          >
            {step < 4 ? "Continue" : submitting ? "Sending…" : "Get my free quotes"}
          </button>
        </div>
        <p className="pt-1 text-[11px] text-ink-muted">
          By submitting, you agree to our privacy policy. We share your request with up to 3
          matching providers.
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
    />
  );
}

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium ${
            value === o.value
              ? "border-brand-500 bg-brand-50 text-brand-800"
              : "border-ink/15 hover:border-ink/30"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}
