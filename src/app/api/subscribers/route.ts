import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashIp } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { syncSubscriberToEsp } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email(),
  firstName: z.string().max(60).optional(),
  source: z.enum(["NEWSLETTER", "LEAD_MAGNET", "LEAD_FORM", "CLAIM_FLOW"]).default("NEWSLETTER"),
  sourceDetail: z.string().max(120).optional(),
  landingPath: z.string().max(512).optional(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    })
    .optional(),
  // Honeypot
  website: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.ip ?? null;
  const rl = rateLimit(`sub:${ip ?? "anon"}`, 8, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 422 });
  }
  const input = parsed.data;

  // Silent-drop bots.
  if (input.website && input.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const tags = ["site"];
  if (input.source === "LEAD_MAGNET" && input.sourceDetail) {
    tags.push(`lm:${input.sourceDetail}`);
  }

  // Upsert — re-subscribing is idempotent; we keep the earliest createdAt.
  const existing = await prisma.subscriber.findUnique({ where: { email: input.email } });
  const data = {
    email: input.email,
    firstName: input.firstName,
    source: input.source,
    sourceDetail: input.sourceDetail,
    landingPath: input.landingPath,
    utmSource: input.utm?.source,
    utmMedium: input.utm?.medium,
    utmCampaign: input.utm?.campaign,
    ipHash: await hashIp(ip),
    tags: { set: Array.from(new Set([...(existing?.tags ?? []), ...tags])) },
  };

  const row = existing
    ? await prisma.subscriber.update({
        where: { email: input.email },
        data: { ...data, unsubscribedAt: null },
      })
    : await prisma.subscriber.create({ data });

  // Best-effort ESP sync — don't block the user.
  syncSubscriberToEsp({
    email: row.email,
    firstName: row.firstName ?? undefined,
    tags,
    utmSource: row.utmSource ?? undefined,
  })
    .then(async (r) => {
      if (r.externalId) {
        await prisma.subscriber
          .update({ where: { id: row.id }, data: { externalId: r.externalId } })
          .catch(() => undefined);
      }
    })
    .catch(() => undefined);

  return NextResponse.json({ ok: true, id: row.id });
}
