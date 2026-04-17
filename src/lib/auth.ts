import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const ALG = "HS256";
const COOKIE = "al_session";
const ONE_WEEK = 60 * 60 * 24 * 7;

function secretKey(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET missing or too short");
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "BUSINESS_OWNER" | "VISITOR";
  [key: string]: unknown;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK,
  });
}

export async function clearSessionCookie(): Promise<void> {
  cookies().delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireRole(
  role: SessionPayload["role"] | SessionPayload["role"][],
): Promise<SessionPayload> {
  const s = await getSession();
  const allowed = Array.isArray(role) ? role : [role];
  if (!s || !allowed.includes(s.role)) throw new Error("Unauthorized");
  return s;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
