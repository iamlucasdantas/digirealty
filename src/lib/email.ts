import "server-only";
import type { Lead, Business } from "@prisma/client";
import { siteConfig } from "./config";

/**
 * Thin Resend wrapper. Falls back to console logging in dev / when the
 * RESEND_API_KEY isn't set so the app never crashes on local development.
 */
export async function sendLeadEmail(to: string, lead: Lead, business: Business): Promise<void> {
  const subject = `New lead for ${business.name}: ${lead.firstName} wants a quote`;
  const html = renderLeadEmail(lead, business);

  const key = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFY_FROM ?? `leads@${new URL(siteConfig.url).host}`;
  if (!key) {
    console.info("[email:dev] to=%s subject=%s", to, subject);
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  await resend.emails.send({ from, to, subject, html });
}

function renderLeadEmail(lead: Lead, business: Business): string {
  return /* html */ `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
      <h2 style="margin:0 0 8px">New qualified lead for ${escape(business.name)}</h2>
      <p style="margin:0 0 16px;color:#555">From ${siteConfig.name}</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td><b>Name</b></td><td>${escape(lead.firstName)} ${escape(lead.lastName ?? "")}</td></tr>
        <tr><td><b>Email</b></td><td>${escape(lead.email)}</td></tr>
        <tr><td><b>Phone</b></td><td>${escape(lead.phone ?? "—")}</td></tr>
        <tr><td><b>ZIP</b></td><td>${escape(lead.zip ?? "—")}</td></tr>
        <tr><td><b>Timeframe</b></td><td>${escape(lead.timeframe ?? "—")}</td></tr>
        <tr><td><b>Budget (cents)</b></td><td>${lead.budgetCents ?? "—"}</td></tr>
      </table>
      <p style="margin-top:16px">${escape(lead.message ?? "")}</p>
      <p style="margin-top:24px;color:#777;font-size:12px">Reply within 15 minutes to beat competing providers.</p>
    </div>
  `;
}

function escape(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
