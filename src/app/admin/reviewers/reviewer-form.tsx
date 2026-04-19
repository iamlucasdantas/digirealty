"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewerForm() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    (body as Record<string, unknown>).expertise = String(body.expertise ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    (body as Record<string, unknown>).affiliations = String(body.affiliations ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/reviewers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Failed to save");
      setState("err");
      return;
    }
    setState("ok");
    router.refresh();
    (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-ink/10 bg-white p-5 space-y-3 text-sm"
    >
      <p className="font-display text-lg font-semibold">Add a reviewer</p>
      <p className="text-xs text-ink-muted">
        Public visibility requires <strong>no placeholder flag</strong> AND a{" "}
        <strong>license verification URL</strong> (state board link).
      </p>

      <Field label="Full name" name="name" required />
      <Field label="Slug" name="slug" required placeholder="jane-doe-np" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Credential (RN, PA-C…)" name="credentialSuffix" required />
        <Field label="License state (IL)" name="licenseState" />
      </div>
      <Field label="Title" name="title" required placeholder="Dermatology Nurse Practitioner" />
      <Field
        label="License verification URL"
        name="licenseVerifyUrl"
        type="url"
        placeholder="https://idfpr.illinois.gov/licenselookup..."
        hint="If empty, this reviewer stays hidden from public pages."
      />
      <Field
        label="Photo URL"
        name="photoUrl"
        type="url"
        placeholder="https://..."
      />
      <Field label="Years experience" name="yearsExperience" type="number" />
      <Field
        label="Expertise (comma-separated)"
        name="expertise"
        placeholder="Injectables, Laser & IPL"
      />
      <Field
        label="Affiliations (comma-separated)"
        name="affiliations"
        placeholder="AADA, SDPA"
      />
      <label className="block">
        <span className="font-semibold">Bio</span>
        <textarea
          name="bio"
          required
          rows={4}
          className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
        />
      </label>

      {err && <p className="text-rose-600 text-xs">{err}</p>}
      {state === "ok" && <p className="text-emerald-700 text-xs">Saved.</p>}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-full bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {state === "loading" ? "Saving…" : "Save reviewer"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
      />
      {hint && <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}
