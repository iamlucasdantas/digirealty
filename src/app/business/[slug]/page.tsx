import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Star, Phone, Globe, MapPin, BadgeCheck, Clock } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { JsonLd } from "@/components/json-ld";
import { AdSlot } from "@/components/ad-slot";
import { ClaimBanner } from "@/components/claim-banner";
import { buildMetadata, breadcrumbsJsonLd, localBusinessJsonLd } from "@/lib/seo";
import { formatPriceRange } from "@/lib/utils";
import { getBusinessBySlug } from "@/lib/repos/businesses";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const b = await getBusinessBySlug(params.slug);
  if (!b) return buildMetadata({ title: "Not found", description: "", noIndex: true });
  return buildMetadata({
    title: `${b.name} — ${b.city.name}, ${b.city.state}`,
    description:
      b.descShort ??
      `View services, reviews, and pricing for ${b.name} in ${b.city.name}, ${b.city.state}. Request a free consultation.`,
    path: `/business/${b.slug}`,
    image: b.heroImageUrl ?? undefined,
  });
}

export default async function BusinessProfilePage({ params }: { params: { slug: string } }) {
  const b = await getBusinessBySlug(params.slug);
  if (!b) notFound();

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: b.city.name, url: `/${b.city.slug}` },
    { name: b.name, url: `/business/${b.slug}` },
  ];

  return (
    <>
      {b.unclaimed && <ClaimBanner businessSlug={b.slug} />}
      <JsonLd
        data={[
          breadcrumbsJsonLd(breadcrumbs),
          localBusinessJsonLd({
            name: b.name,
            slug: b.slug,
            address1: b.address1,
            city: b.city.name,
            state: b.city.state,
            zip: b.zip,
            phone: b.phone,
            website: b.website,
            latitude: b.latitude,
            longitude: b.longitude,
            ratingAvg: b.ratingAvg,
            ratingCount: b.ratingCount,
            ratingSource: b.ratingSource,
            ratingSyncedAt: b.ratingSyncedAt,
            descShort: b.descShort,
            imageUrl: b.heroImageUrl,
          }),
        ]}
      />

      {/* Header */}
      <section className="border-b border-ink/5 bg-gradient-to-br from-brand-50/50 to-white">
        <div className="container py-10 md:py-14 grid md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            <p className="text-xs text-ink-muted">
              <Link href={`/${b.city.slug}`} className="hover:underline">
                {b.city.name}, {b.city.state}
              </Link>
            </p>
            <h1 className="mt-1 font-display text-4xl md:text-5xl font-semibold">{b.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
              {b.ratingCount > 0 && b.ratingSource && b.ratingSyncedAt && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
                  <b className="text-ink">{(b.ratingAvg ?? 0).toFixed(1)}</b>
                  <span>
                    · {b.ratingCount} reviews · {b.ratingSource} · synced{" "}
                    {b.ratingSyncedAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </span>
              )}
              {b.claimedById && !b.unclaimed && (
                <span className="flex items-center gap-1 text-emerald-700">
                  <BadgeCheck className="h-4 w-4" /> Verified listing
                </span>
              )}
              {(b.tier === "FEATURED" || b.tier === "PREMIUM") && (
                <Link
                  href="/editorial-policy#how-we-rank"
                  className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-amber-900 text-xs font-semibold hover:bg-amber-200"
                  title="This is a sponsored listing. Learn how we rank providers."
                >
                  {b.tier === "PREMIUM" ? "Premium partner · Sponsored" : "Featured partner · Sponsored"}
                </Link>
              )}
            </div>
            {b.descShort && <p className="mt-5 text-lg text-ink/85 max-w-2xl">{b.descShort}</p>}

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {b.phone && <InfoPill icon={<Phone className="h-4 w-4" />} label={b.phone} href={`tel:${b.phone}`} />}
              {b.website && (
                <InfoPill
                  icon={<Globe className="h-4 w-4" />}
                  label="Website"
                  href={b.website}
                  external
                />
              )}
              {(b.address1 || b.zip) && (
                <InfoPill
                  icon={<MapPin className="h-4 w-4" />}
                  label={`${b.address1 ? `${b.address1}, ` : ""}${b.city.name} ${b.zip ?? ""}`.trim()}
                />
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <LeadForm
              serviceSlug={b.services[0]?.service.slug ?? "general-aesthetics"}
              serviceName={b.services[0]?.service.name}
              citySlug={b.city.slug}
              businessSlug={b.slug}
            />
          </div>
        </div>
      </section>

      {/* Services + About */}
      <section className="container py-14 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-10">
          {b.descLong && (
            <div>
              <h2 className="font-display text-3xl font-semibold">About {b.name}</h2>
              <div
                className="prose-al mt-4 max-w-none"
                dangerouslySetInnerHTML={{ __html: b.descLong }}
              />
            </div>
          )}
          <div>
            <h2 className="font-display text-3xl font-semibold">Services & pricing</h2>
            <ul className="mt-6 divide-y divide-ink/5 rounded-2xl border border-ink/10 bg-white">
              {b.services.map(({ service, priceLow, priceHigh }) => (
                <li key={service.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">
                      <Link href={`/services/${service.slug}`} className="hover:underline">
                        {service.name}
                      </Link>
                    </p>
                    <p className="text-xs text-ink-muted">{service.category.name}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{formatPriceRange(priceLow ?? service.avgPriceLow, priceHigh ?? service.avgPriceHigh)}</p>
                    <Link
                      href={`/get-quotes?business=${b.slug}&service=${service.slug}`}
                      className="text-brand-700 hover:underline text-xs"
                    >
                      Get quote →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {b.reviews.length > 0 && (
            <div>
              <h2 className="font-display text-3xl font-semibold">Reviews</h2>
              <ul className="mt-6 space-y-4">
                {b.reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-ink/10 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </span>
                      <b>{r.authorName}</b>
                      {r.verified && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
                    </div>
                    {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                    <p className="mt-1 text-ink/85">{r.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <aside className="space-y-5">
          <div className="rounded-2xl border border-ink/10 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4" /> Hours
            </p>
            <dl className="mt-3 text-sm space-y-1">
              {Object.entries((b.hours as Record<string, string>) ?? {}).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <dt className="capitalize text-ink-muted">{day}</dt>
                  <dd>{hours}</dd>
                </div>
              ))}
              {!b.hours && <p className="text-ink-muted">Call for hours</p>}
            </dl>
          </div>
          <AdSlot placement="BUSINESS_RELATED" cityId={b.cityId} />
        </aside>
      </section>
    </>
  );
}

function InfoPill({
  icon,
  label,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  external?: boolean;
}) {
  const className = "flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 hover:border-ink/30";
  if (href) {
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
        className={className}
      >
        <span className="text-brand-600">{icon}</span>
        <span className="truncate">{label}</span>
      </a>
    );
  }
  return (
    <div className={className}>
      <span className="text-brand-600">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
