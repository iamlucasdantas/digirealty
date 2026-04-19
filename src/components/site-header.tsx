import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Sparkles } from "lucide-react";

const nav = [
  { href: "/learn", label: "Guides" },
  { href: "/compare", label: "Compare" },
  { href: "/services", label: "Treatments" },
  { href: "/cities", label: "Cities" },
  { href: "/for-providers", label: "For providers" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-ink/5 bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <Sparkles className="h-5 w-5 text-brand-600" aria-hidden />
          <span>{siteConfig.shortName}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-ink/80 hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/get-quotes"
          className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
        >
          Get free quotes
        </Link>
      </div>
    </header>
  );
}
