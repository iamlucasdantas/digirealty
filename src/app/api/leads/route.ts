import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeadSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { routeLead } from "@/lib/lead-routing";
import { hashIp } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.ip ?? null;
  const rl = rateLimit(`lead:${ip ?? "anon"}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // Honeypot — silently drop bots.
  if (input.website && input.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const service = await prisma.service.findUnique({ where: { slug: input.serviceSlug } });
  if (!service) {
    return NextResponse.json({ ok: false, error: "unknown_service" }, { status: 400 });
  }
  const business = input.businessSlug
    ? await prisma.business.findUnique({ where: { slug: input.businessSlug } })
    : null;

  const budgetCents = budgetToCents(input.budget);

  const lead = await prisma.lead.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName || null,
      email: input.email,
      phone: input.phone || null,
      zip: input.zip || null,
      serviceId: service.id,
      businessId: business?.id,
      budgetCents,
      timeframe: input.timeframe,
      message: input.message,
      qualification: input.qualification ?? {},
      landingPath: input.landingPath,
      referrer: input.referrer,
      utmSource: input.utm?.source,
      utmMedium: input.utm?.medium,
      utmCampaign: input.utm?.campaign,
      utmContent: input.utm?.content,
      utmTerm: input.utm?.term,
      sessionId: input.sessionId,
      ipHash: await hashIp(ip),
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  await prisma.leadEvent.create({ data: { leadId: lead.id, type: "created" } });

  // Route async-ish — we don't want the UX blocked if email is slow.
  routeLead(lead.id).catch((err) => {
    console.error("[lead:route] failed", { leadId: lead.id, err });
  });

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}

function budgetToCents(budget?: string): number | undefined {
  switch (budget) {
    case "<500":
      return 25_000;
    case "500-1500":
      return 100_000;
    case "1500-5000":
      return 325_000;
    case "5000+":
      return 500_000;
    default:
      return undefined;
  }
}
