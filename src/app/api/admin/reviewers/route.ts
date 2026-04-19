import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const Body = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "lowercase, digits, dashes only"),
  name: z.string().min(2),
  credentialSuffix: z.string().min(2),
  title: z.string().min(2),
  bio: z.string().min(20),
  licenseState: z.string().max(2).optional().or(z.literal("")),
  licenseVerifyUrl: z.string().url().optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
  expertise: z.array(z.string()).default([]),
  affiliations: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "EDITOR")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "invalid_input" },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const data = {
    slug: input.slug,
    name: input.name,
    credentialSuffix: input.credentialSuffix,
    title: input.title,
    bio: input.bio,
    licenseState: input.licenseState || null,
    licenseVerifyUrl: input.licenseVerifyUrl || null,
    photoUrl: input.photoUrl || null,
    yearsExperience: input.yearsExperience ?? null,
    expertise: input.expertise,
    affiliations: input.affiliations,
    verifiedAt: input.licenseVerifyUrl ? new Date() : null,
    isPlaceholder: false,
  };

  const row = await prisma.medicalReviewer.upsert({
    where: { slug: input.slug },
    create: data,
    update: data,
  });
  return NextResponse.json({ ok: true, id: row.id });
}
