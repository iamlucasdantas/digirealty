import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function formatCurrency(cents?: number | null): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatPriceRange(low?: number | null, high?: number | null): string {
  if (low == null && high == null) return "Call for pricing";
  if (low != null && high != null) return `${formatCurrency(low)} – ${formatCurrency(high)}`;
  return formatCurrency(low ?? high);
}

export function absoluteUrl(path = "/"): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aestheticsleads.com";
  if (path.startsWith("http")) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Stable, privacy-preserving hash for IPs (no PII stored raw). */
export async function hashIp(ip: string | null | undefined): Promise<string | null> {
  if (!ip) return null;
  const data = new TextEncoder().encode(ip + (process.env.JWT_SECRET ?? ""));
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
