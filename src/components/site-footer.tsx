import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { ShieldCheck, Mail, MapPin, Clock } from "lucide-react";

/**
 * Dark cocoa footer with a Contact block, followed by a sub-row of
 * link columns and the obligatory disclaimers. Structure intentionally
 * borrows the "dark contact block over the sitemap" rhythm from the
 * reference atelier site while keeping our directory-wide navigation
 * intact.
 */
export function SiteFooter() {
  return (
    <footer className="mt-24">
      {/* Contact block — dark, editorial, single column on mobile. */}
      <section className="bg-cocoa-700 text-ink-onDark">
        <div className="container py-16 md:py-20 grid md:grid-cols-2 gap-10 md:gap-14">
          <div>
            <p className="eyebrow text-clay-300">Get in touch</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Start your <span className="italic-accent">ritual</span>.
            </h2>
            <p className="mt-4 max-w-md text-ink-onDark/80 leading-relaxed">
              Tell us a little about what you&apos;re researching and we&apos;ll match
              you with up to three vetted local providers — free, no pressure,
              usually within one business day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/get-quotes"
                className="inline-flex items-center rounded-full bg-clay-500 px-5 py-3 text-sm font-semibold text-white hover:bg-clay-400"
              >
                Get free quotes
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center rounded-full border border-ink-onDark/20 px-5 py-3 text-sm font-semibold text-ink-onDark hover:bg-cocoa-600"
              >
                Start with a guide
              </Link>
            </div>
          </div>

          <ul className="grid gap-4 text-sm text-ink-onDark/80 content-start">
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-1 text-clay-300" aria-hidden />
              <div>
                <p className="font-semibold text-ink-onDark">Based in the Quad Cities</p>
                <p>Davenport · Bettendorf · Rock Island · Moline</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-1 text-clay-300" aria-hidden />
              <div>
                <p className="font-semibold text-ink-onDark">
                  <a href={`mailto:${siteConfig.support.email}`} className="hover:underline">
                    {siteConfig.support.email}
                  </a>
                </p>
                <p>Editorial, partnerships, press — we read everything.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-1 text-clay-300" aria-hidden />
              <div>
                <p className="font-semibold text-ink-onDark">Response time</p>
                <p>Typically one business day.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 mt-1 text-clay-300" aria-hidden />
              <div>
                <p className="font-semibold text-ink-onDark">Expert-reviewed</p>
                <p>Every medical article is reviewed by a licensed clinician.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Sitemap + legal */}
      <section className="bg-bone border-t border-clay-100">
        <div className="container py-12 grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <p className="font-display text-xl">
              <span className="font-semibold text-ink">Atlas</span>{" "}
              <span className="italic-accent">aesthetics</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">{siteConfig.tagline}</p>
          </div>
          <FooterCol title="Read">
            <li><Link href="/learn">Treatment guides</Link></li>
            <li><Link href="/compare">Comparisons</Link></li>
            <li><Link href="/services">All treatments</Link></li>
            <li><Link href="/cities">Cities</Link></li>
          </FooterCol>
          <FooterCol title="The Atlas">
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/editorial-policy">Editorial policy</Link></li>
            <li><Link href="/medical-review-board">Medical review board</Link></li>
            <li><Link href="/how-we-make-money">How we make money</Link></li>
            <li><Link href="/corrections">Corrections</Link></li>
          </FooterCol>
          <FooterCol title="For providers">
            <li><Link href="/for-providers">List your practice</Link></li>
            <li><Link href="/for-providers/pricing">Pricing</Link></li>
            <li><Link href="/login">Provider sign in</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </FooterCol>
        </div>

        <div className="border-t border-clay-100">
          <div className="container py-6 space-y-2.5 text-[11px] text-ink-muted">
            <p>
              <strong className="text-ink/80">Not medical advice.</strong> Content on this
              site is for informational purposes only and is not a substitute for professional
              medical advice, diagnosis, or treatment. Always consult a licensed clinician
              about your specific situation. Treatment outcomes vary.
            </p>
            <p>
              <strong className="text-ink/80">Affiliate disclosure.</strong> Some links are
              affiliate links; we may earn a commission if you purchase at no cost to you.
              As an Amazon Associate we earn from qualifying purchases. See{" "}
              <Link href="/how-we-make-money" className="underline hover:text-ink">
                how we make money
              </Link>
              .
            </p>
            <p>
              © {new Date().getFullYear()} The Aesthetics Atlas. All rights reserved.
              Currently active in the Quad Cities (Iowa · Illinois).
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow text-ink-muted">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm text-ink/75 [&_a]:hover:text-ink [&_a]:transition-colors">
        {children}
      </ul>
    </div>
  );
}
