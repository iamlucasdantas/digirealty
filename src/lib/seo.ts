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
  descShort?: string | null;
  imageUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": absoluteUrl(`/business/${b.slug}`),
    name: b.name,
    description: b.descShort ?? undefined,
    url: absoluteUrl(`/business/${b.slug}`),
    telephone: b.phone ?? undefined,
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
    aggregateRating:
      b.ratingAvg && b.ratingCount
        ? {
            "@type": "AggregateRating",
            ratingValue: b.ratingAvg.toFixed(1),
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
}

interface ReviewerInput {
  name: string;
  slug: string;
  credentialSuffix: string;
  title?: string;
  photoUrl?: string | null;
  licenseState?: string | null;
}

export function personJsonLd(p: AuthorInput & { bio?: string; credentials?: string[] }) {
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
  const authorNode = a.author
    ? {
        "@type": "Person",
        "@id": absoluteUrl(`/team/${a.author.slug}`),
        name: a.author.name,
        url: absoluteUrl(`/team/${a.author.slug}`),
        jobTitle: a.author.title,
        image: a.author.photoUrl ?? undefined,
      }
    : { "@type": "Organization", name: siteConfig.name };

  const reviewerNode = a.reviewer
    ? {
        "@type": "Person",
        "@id": absoluteUrl(`/medical-review-board#${a.reviewer.slug}`),
        name: `${a.reviewer.name}, ${a.reviewer.credentialSuffix}`,
        jobTitle: a.reviewer.title,
        image: a.reviewer.photoUrl ?? undefined,
        hasOccupation: {
          "@type": "Occupation",
          name: a.reviewer.title ?? a.reviewer.credentialSuffix,
          occupationLocation: a.reviewer.licenseState
            ? { "@type": "AdministrativeArea", name: a.reviewer.licenseState }
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
