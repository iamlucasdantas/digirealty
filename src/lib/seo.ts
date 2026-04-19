import type { Metadata } from "next";
import { siteConfig } from "./config";
import { absoluteUrl } from "./utils";

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata(input: SeoInput): Metadata {
  const url = absoluteUrl(input.path ?? "/");
  const title = `${input.title} | ${siteConfig.name}`;
  const image = input.image ?? absoluteUrl("/og-default.png");

  return {
    title,
    description: input.description,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description: input.description,
      url,
      siteName: siteConfig.name,
      type: input.type ?? "website",
      images: [{ url: image, width: 1200, height: 630 }],
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: [image],
      site: siteConfig.twitterHandle,
    },
  };
}

// ─── JSON-LD builders ─────────────────────────────────────────

export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/logo.png"),
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteConfig.url,
    name: siteConfig.name,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Fake-looking phone prefixes we refuse to emit in structured data.
 * The 555-01xx range is reserved for fiction — publishing it in schema
 * would send Google a clear "this is a fake listing" signal.
 */
const PHONE_FICTION = /(?:^|\D)(?:\(?555\)?[-.\s]?0\d{2}|555[-.\s]?01\d{2})(?!\d)/;

export function localBusinessJsonLd(b: {
  name: string;
  slug: string;
  address1?: string | null;
  city: string;
  state: string;
  zip?: string | null;
  phone?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ratingAvg?: number | null;
  ratingCount?: number;
  ratingSource?: string | null;
  ratingSyncedAt?: Date | string | null;
  descShort?: string | null;
  imageUrl?: string | null;
}) {
  const safePhone = b.phone && !PHONE_FICTION.test(b.phone) ? b.phone : undefined;

  // Only emit AggregateRating with a traceable source. Otherwise we'd be
  // surfacing a rating as fact without lastro.
  const hasVerifiedRating =
    b.ratingAvg != null &&
    (b.ratingCount ?? 0) > 0 &&
    !!b.ratingSource &&
    !!b.ratingSyncedAt;

  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": absoluteUrl(`/business/${b.slug}`),
    name: b.name,
    description: b.descShort ?? undefined,
    url: absoluteUrl(`/business/${b.slug}`),
    telephone: safePhone,
    image: b.imageUrl ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address1 ?? undefined,
      addressLocality: b.city,
      addressRegion: b.state,
      postalCode: b.zip ?? undefined,
      addressCountry: "US",
    },
    geo:
      b.latitude && b.longitude
        ? { "@type": "GeoCoordinates", latitude: b.latitude, longitude: b.longitude }
        : undefined,
    aggregateRating: hasVerifiedRating
      ? {
          "@type": "AggregateRating",
          ratingValue: (b.ratingAvg as number).toFixed(1),
          reviewCount: b.ratingCount,
        }
      : undefined,
  };
}

export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function breadcrumbsJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

interface AuthorInput {
  name: string;
  slug: string;
  title?: string;
  photoUrl?: string | null;
  url?: string;
  isPlaceholder?: boolean;
}

interface ReviewerInput {
  name: string;
  slug: string;
  credentialSuffix: string;
  title?: string;
  photoUrl?: string | null;
  licenseState?: string | null;
  isPlaceholder?: boolean;
}

export function personJsonLd(p: AuthorInput & { bio?: string; credentials?: string[] }) {
  if (p.isPlaceholder) {
    // Don't publish Person schema for placeholder personas — that's exactly
    // the kind of fake E-E-A-T signal Google penalizes.
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl(`/team/${p.slug}`),
    name: p.name,
    url: absoluteUrl(`/team/${p.slug}`),
    image: p.photoUrl ?? undefined,
    jobTitle: p.title,
    description: p.bio,
    hasCredential: p.credentials?.map((c) => ({ "@type": "EducationalOccupationalCredential", name: c })),
  };
}

export function articleJsonLd(a: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  reviewedTime?: string;
  author?: AuthorInput;
  reviewer?: ReviewerInput;
  isMedical?: boolean;
}) {
  const type = a.isMedical ? "MedicalWebPage" : "Article";

  // Placeholder personas never enter schema — the organization is the
  // author of record, and we do not claim clinical review.
  const realAuthor = a.author && !a.author.isPlaceholder ? a.author : undefined;
  const realReviewer = a.reviewer && !a.reviewer.isPlaceholder ? a.reviewer : undefined;

  const authorNode = realAuthor
    ? {
        "@type": "Person",
        "@id": absoluteUrl(`/team/${realAuthor.slug}`),
        name: realAuthor.name,
        url: absoluteUrl(`/team/${realAuthor.slug}`),
        jobTitle: realAuthor.title,
        image: realAuthor.photoUrl ?? undefined,
      }
    : { "@type": "Organization", "@id": absoluteUrl("/"), name: siteConfig.name };

  const reviewerNode = realReviewer
    ? {
        "@type": "Person",
        "@id": absoluteUrl(`/medical-review-board#${realReviewer.slug}`),
        name: `${realReviewer.name}, ${realReviewer.credentialSuffix}`,
        jobTitle: realReviewer.title,
        image: realReviewer.photoUrl ?? undefined,
        hasOccupation: {
          "@type": "Occupation",
          name: realReviewer.title ?? realReviewer.credentialSuffix,
          occupationLocation: realReviewer.licenseState
            ? { "@type": "AdministrativeArea", name: realReviewer.licenseState }
            : undefined,
        },
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": type,
    headline: a.title,
    description: a.description,
    image: a.image ?? absoluteUrl("/og-default.png"),
    datePublished: a.publishedTime,
    dateModified: a.modifiedTime ?? a.publishedTime,
    ...(reviewerNode
      ? {
          reviewedBy: reviewerNode,
          lastReviewed: a.reviewedTime ?? a.modifiedTime,
        }
      : {}),
    author: authorNode,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    mainEntityOfPage: absoluteUrl(`/${a.slug}`),
    isAccessibleForFree: true,
  };
}
