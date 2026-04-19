import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/5 bg-slate-50 mt-24">
      <div className="container py-14 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="font-display text-xl font-semibold">{siteConfig.shortName}</p>
          <p className="mt-2 text-sm text-ink-muted">{siteConfig.tagline}</p>
          <p className="mt-5 flex items-center gap-2 text-xs text-emerald-800">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Expert-written · Clinically reviewed · Updated regularly
          </p>
        </div>
        <FooterCol title="Read">
          <li><Link href="/learn">Treatment guides</Link></li>
          <li><Link href="/compare">Comparisons</Link></li>
          <li><Link href="/services">All treatments</Link></li>
          <li><Link href="/cities">By city</Link></li>
        </FooterCol>
        <FooterCol title="The Atlas">
          <li><Link href="/about">About us</Link></li>
          <li><Link href="/editorial-policy">Editorial policy</Link></li>
          <li><Link href="/medical-review-board">Medical review board</Link></li>
          <li><Link href="/how-we-make-money">How we make money</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </FooterCol>
        <FooterCol title="For providers">
          <li><Link href="/for-providers">List your practice</Link></li>
          <li><Link href="/for-providers/pricing">Pricing</Link></li>
          <li><Link href="/login">Provider sign in</Link></li>
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
        </FooterCol>
      </div>

      <div className="border-t border-ink/5 bg-white">
        <div className="container py-6 space-y-3 text-[11px] text-ink-muted">
          <p>
            <strong className="text-ink/80">Not medical advice.</strong> Content on {siteConfig.shortName} is
            for informational purposes only and is not a substitute for professional medical
            advice, diagnosis, or treatment. Always consult a licensed clinician about your
            specific situation. Treatment outcomes vary.
          </p>
          <p>
            <strong className="text-ink/80">Affiliate disclosure.</strong> Some links on this site are
            affiliate links; we may earn a commission if you purchase at no cost to you.
            As an Amazon Associate we earn from qualifying purchases. See{" "}
            <Link href="/how-we-make-money" className="underline">how we make money</Link>.
          </p>
          <p>
            © {new Date().getFullYear()} {siteConfig.shortName}. All rights reserved. Quad
            Cities · IA · IL — expanding nationally.
          </p>
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
