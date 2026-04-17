import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  businessId: z.string(),
  action: z.enum(["accept", "reject"]),
  notes: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const session = await getSession();
  if (!session || (session.role !== "BUSINESS_OWNER" && session.role !== "ADMIN")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });
  const { businessId, action, notes } = parsed.data;

  const assignment = await prisma.leadAssignment.findFirst({
    where: { leadId: ctx.params.id, businessId, status: "offered" },
  });
  if (!assignment) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const status = action === "accept" ? "accepted" : "rejected";
  await prisma.$transaction(async (tx) => {
    await tx.leadAssignment.update({
      where: { id: assignment.id },
      data: { status, respondedAt: new Date(), notes },
    });
    if (action === "accept") {
      await tx.lead.update({
        where: { id: ctx.params.id },
        data: { status: "ACCEPTED", businessId },
      });
      // Expire all other offered assignments (exclusive mode).
      await tx.leadAssignment.updateMany({
        where: { leadId: ctx.params.id, status: "offered", NOT: { id: assignment.id } },
        data: { status: "expired", respondedAt: new Date() },
      });
    }
    await tx.leadEvent.create({
      data: { leadId: ctx.params.id, type: action, payload: { businessId } },
    });
  });

  return NextResponse.json({ ok: true });
}
