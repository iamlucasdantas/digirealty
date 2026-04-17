import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LoginSchema } from "@/lib/validation";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  const rl = rateLimit(`login:${ip}`, 8, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = LoginSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.passwordHash) return NextResponse.json({ ok: false }, { status: 401 });

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

  const token = await signSession({ sub: user.id, email: user.email, role: user.role });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, role: user.role });
}
