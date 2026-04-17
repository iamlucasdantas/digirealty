export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "AestheticsLeads",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aestheticsleads.com",
  defaultMarket: process.env.NEXT_PUBLIC_DEFAULT_MARKET ?? "quad-cities",
  tagline: "Find trusted aesthetics, wellness & cosmetic pros near you.",
  description:
    "Compare top med spas, cosmetic clinics, and wellness providers. Get free quotes from vetted local experts in minutes.",
  twitterHandle: "@aestheticsleads",
  leadPriceDefaultCents: Number(process.env.LEAD_PRICE_DEFAULT_CENTS ?? 2500),
  support: {
    email: "hello@aestheticsleads.com",
    phone: "(563) 555-0110",
  },
} as const;

export type SiteConfig = typeof siteConfig;
