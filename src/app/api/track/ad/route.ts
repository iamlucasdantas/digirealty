import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  placementId: z.string(),
  event: z.enum(["impression", "click"]),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });
  const { placementId, event } = parsed.data;
  await prisma.adPlacement.update({
    where: { id: placementId },
    data: event === "click" ? { clicks: { increment: 1 } } : { impressions: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}
