import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashIp } from "@/lib/utils";

/**
 * Affiliate click-out endpoint. We log the click, then 302 to the vendor URL.
 * Keeps affiliate tags on our side (swappable per-vendor) and preserves SEO —
 * outbound links go through /go/[slug] with rel="sponsored nofollow".
 */
export async function GET(req: NextRequest, ctx: { params: { slug: string } }) {
  const p = await prisma.affiliateProduct.findUnique({ where: { slug: ctx.params.slug } });
  if (!p || !p.active) return NextResponse.redirect(new URL("/", req.url));

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.ip ?? null;
  const sessionId = req.cookies.get("al_sid")?.value ?? null;

  await prisma.$transaction([
    prisma.affiliateProduct.update({ where: { id: p.id }, data: { clicks: { increment: 1 } } }),
    prisma.affiliateClick.create({
      data: {
        productId: p.id,
        sessionId,
        referrer: req.headers.get("referer") ?? undefined,
        ipHash: await hashIp(ip),
      },
    }),
  ]);

  return NextResponse.redirect(p.url, { status: 302 });
}
