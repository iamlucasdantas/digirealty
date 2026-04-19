"use client";

import { useState } from "react";

interface Props {
  businessSlug: string;
  businessName: string;
}

export function ClaimForm({ businessSlug, businessName }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("owner");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErr(null);
    const res = await fetch(`/api/claim/${businessSlug}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, role, phone, notes }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Something went wrong.");
      setState("error");
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <p className="font-semibold">Verification email sent.</p>
        <p className="mt-1 text-sm">
          We just emailed <strong>{email}</strong>. Click the link in that message to finish
          claiming <strong>{businessName}</strong>. The link expires in 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm space-y-4"
    >
      <div>
        <p className="font-display text-2xl font-semibold">Verify you&apos;re the owner</p>
        <p className="mt-1 text-sm text-ink-muted">
          We&apos;ll email a secure link to confirm.
        </p>
      </div>
      <label className="block">
        <span className="text-sm font-semibold">Your name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
          autoComplete="name"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Your work email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
          autoComplete="email"
        />
        <span className="mt-1 block text-[11px] text-ink-muted">
          A business-domain email verifies faster.
        </span>
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Your role</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
        >
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="marketing">Marketing</option>
          <option value="medical_director">Medical director</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Phone (optional)</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
          autoComplete="tel"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Anything we should know? (optional)</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
        />
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-50"
      >
        {state === "loading" ? "Sending…" : "Send verification email"}
      </button>
    </form>
  );
}
