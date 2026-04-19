export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "TheAestheticsAtlas",
  shortName: "The Aesthetics Atlas",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://theaestheticsatlas.com",
  defaultMarket: process.env.NEXT_PUBLIC_DEFAULT_MARKET ?? "quad-cities",
  tagline: "The honest guide to aesthetics.",
  description:
    "Expert-reviewed treatment guides, real local pricing, and free quotes from vetted aesthetics providers. Start in the Quad Cities.",
  twitterHandle: "@aestheticsatlas",
  leadPriceDefaultCents: Number(process.env.LEAD_PRICE_DEFAULT_CENTS ?? 2500),
  support: {
    email: "hello@theaestheticsatlas.com",
    phone: "(563) 555-0110",
  },
} as const;

export type SiteConfig = typeof siteConfig;
