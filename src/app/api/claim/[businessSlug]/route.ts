import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  role: z.enum(["owner", "manager", "marketing", "medical_director", "other"]),
  phone: z.string().max(30).optional(),
  notes: z.string().max(2000).optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(
  req: NextRequest,
  ctx: { params: { businessSlug: string } },
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  if (!rateLimit(`claim:${ip}`, 5, 60_000).ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 422 });
  }
  const input = parsed.data;
  if (input.website) return NextResponse.json({ ok: true }, { status: 202 });

  const business = await prisma.business.findUnique({
    where: { slug: ctx.params.businessSlug },
  });
  if (!business) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (business.claimedById) {
    return NextResponse.json(
      { ok: false, error: "already_claimed" },
      { status: 409 },
    );
  }

  const token = randomBytes(32).toString("hex");
  const verifyExpiresAt = new Date(Date.now() + 48 * 3600 * 1000);

  const claim = await prisma.businessClaim.create({
    data: {
      businessId: business.id,
      claimantName: input.name,
      claimantEmail: input.email,
      claimantRole: input.role,
      claimantPhone: input.phone,
      notes: input.notes,
      verifyToken: token,
      verifyExpiresAt,
    },
  });

  // Send verification email. Uses the same Resend wrapper as leads —
  // falls back to console in dev.
  const verifyUrl = `${siteConfig.url}/claim/verify/${token}`;
  try {
    const { Resend } = await import("resend");
    const key = process.env.RESEND_API_KEY;
    if (key) {
      const resend = new Resend(key);
      await resend.emails.send({
        from: process.env.LEAD_NOTIFY_FROM ?? `hello@${new URL(siteConfig.url).host}`,
        to: input.email,
        subject: `Confirm your claim of ${business.name}`,
        html: `<p>Hi ${escapeHtml(input.name)},</p>
<p>You just requested to claim the ${siteConfig.shortName} listing for <strong>${escapeHtml(business.name)}</strong>. Click the link below within the next 48 hours to verify:</p>
<p><a href="${verifyUrl}" style="background:#c026d3;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">Confirm claim</a></p>
<p style="color:#555;font-size:12px">If this wasn't you, ignore this email.</p>`,
      });
    } else {
      console.info("[claim:dev] verify url = %s", verifyUrl);
    }
  } catch (err) {
    console.error("[claim:email]", err);
  }

  return NextResponse.json({ ok: true, claimId: claim.id });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
