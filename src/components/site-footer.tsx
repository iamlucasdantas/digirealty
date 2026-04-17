import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/5 bg-slate-50 mt-24">
      <div className="container py-14 grid gap-8 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-ink-muted">{siteConfig.tagline}</p>
          <p className="mt-4 text-xs text-ink-muted">
            Informational only — not medical advice. Always consult a licensed provider.
          </p>
        </div>
        <FooterCol title="Explore">
          <li><Link href="/services">Treatments</Link></li>
          <li><Link href="/cities">Cities</Link></li>
          <li><Link href="/compare">Compare treatments</Link></li>
          <li><Link href="/learn">Learn</Link></li>
        </FooterCol>
        <FooterCol title="For providers">
          <li><Link href="/for-providers">List your practice</Link></li>
          <li><Link href="/for-providers/pricing">Pricing</Link></li>
          <li><Link href="/for-providers/leads">Buy leads</Link></li>
          <li><Link href="/login">Provider sign in</Link></li>
        </FooterCol>
        <FooterCol title="Company">
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
        </FooterCol>
      </div>
      <div className="border-t border-ink/5">
        <div className="container py-5 text-xs text-ink-muted flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
          <span>Quad Cities · IA · IL — expanding nationwide.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-ink-muted [&_a:hover]:text-ink">{children}</ul>
    </div>
  );
}
