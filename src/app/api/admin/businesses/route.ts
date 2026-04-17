import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BusinessUpsertSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "EDITOR")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const rows = await prisma.business.findMany({
    include: { city: true, _count: { select: { leads: true, reviews: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "EDITOR")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const parsed = BusinessUpsertSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, issues: parsed.error.flatten() }, { status: 422 });
  }
  const input = parsed.data;
  const city = await prisma.city.findUnique({ where: { slug: input.citySlug } });
  if (!city) return NextResponse.json({ ok: false, error: "unknown_city" }, { status: 400 });

  const services = await prisma.service.findMany({
    where: { slug: { in: input.serviceSlugs } },
    select: { id: true, slug: true },
  });

  const data = {
    name: input.name,
    slug: input.slug,
    cityId: city.id,
    phone: input.phone,
    email: input.email || null,
    website: input.website || null,
    bookingUrl: input.bookingUrl || null,
    address1: input.address1,
    zip: input.zip,
    descShort: input.descShort,
    descLong: input.descLong,
    tier: input.tier,
    status: input.status,
  } as const;

  const business = input.id
    ? await prisma.business.update({ where: { id: input.id }, data })
    : await prisma.business.create({ data });

  await prisma.businessService.deleteMany({ where: { businessId: business.id } });
  if (services.length) {
    await prisma.businessService.createMany({
      data: services.map((s) => ({ businessId: business.id, serviceId: s.id })),
    });
  }

  return NextResponse.json({ ok: true, data: business });
}
