import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const ad = await prisma.adPlacement.findUnique({ where: { id: ctx.params.id } });
  if (!ad) return NextResponse.redirect(new URL("/", req.url));
  await prisma.adPlacement
    .update({ where: { id: ad.id }, data: { clicks: { increment: 1 } } })
    .catch(() => undefined);
  return NextResponse.redirect(ad.ctaUrl, { status: 302 });
}
