"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { Menu, X } from "lucide-react";

const nav = [
  { href: "/learn", label: "Guides" },
  { href: "/compare", label: "Compare" },
  { href: "/services", label: "Treatments" },
  { href: "/cities", label: "Cities" },
  { href: "/for-providers", label: "For providers" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-clay-100/60 bg-cream/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-baseline gap-1 shrink-0 font-display text-lg md:text-xl"
        >
          <span className="font-semibold tracking-tight text-ink">Atlas</span>
          <span className="italic-accent text-[0.92em]">aesthetics</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`transition-colors ${
                pathname?.startsWith(n.href) && n.href !== "/"
                  ? "text-ink"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/get-quotes"
            className="hidden md:inline-flex items-center rounded-full bg-clay-500 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-clay-600"
          >
            Get free quotes
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-clay-200 bg-bone hover:bg-sand"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 md:hidden"
        >
          <div
            className="absolute inset-0 bg-cocoa-900/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-cream shadow-card flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-clay-100">
              <span className="font-display text-lg">
                <span className="font-semibold text-ink">Atlas</span>{" "}
                <span className="italic-accent">aesthetics</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-ink hover:bg-sand"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-clay-100 p-5 space-y-3">
              <Link
                href="/get-quotes"
                className="flex w-full items-center justify-center rounded-full bg-clay-500 px-4 py-3 text-sm font-semibold text-white hover:bg-clay-600"
              >
                Get free quotes
              </Link>
              <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted">
                <Link href="/about" className="hover:text-ink">About</Link>
                <Link href="/editorial-policy" className="hover:text-ink">Editorial policy</Link>
                <Link href="/medical-review-board" className="hover:text-ink">Medical board</Link>
                <Link href="/contact" className="hover:text-ink">Contact</Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
