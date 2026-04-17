import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { siteConfig } from "./config";

/**
 * Claude-powered content engine. Generates SEO pages, business descriptions,
 * and comparison tables. Uses prompt caching so repeated bulk generation jobs
 * are cheap — the cached system prompt is >1024 tokens.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_BRAND_BRIEF = `You write for ${siteConfig.name}, a directory and lead-gen site for the aesthetics, wellness, and cosmetic services industry. Audience: consumers aged 25–55 researching treatments (Botox, fillers, laser, CoolSculpting, microneedling, PRP, IV therapy, weight loss programs, cosmetic dentistry).

Voice:
- Expert but approachable. Think "trusted best-friend who happens to be a nurse injector."
- Empathetic about hesitation, honest about risk, never hypey.
- Avoid medical claims, disease treatment language, and "miracle" wording.
- Use "may", "can help", "some studies suggest" when discussing outcomes.
- Never guarantee results. Always recommend consulting a licensed provider.

Style:
- Skimmable: short paragraphs, H2/H3 headings, bullets for procedures/pricing.
- Convert with clarity: every page should help the reader decide "is this for me and what should I do next".
- Include a natural CTA near the top and at the end: "Compare local providers" or "Get a free consultation".

SEO:
- Target long-tail, location-specific, intent-rich keywords.
- Use the exact primary keyword in H1, first 100 words, and meta description.
- Semantic variants in H2/H3. No keyword stuffing.
- Output MDX: headings, paragraphs, bullet lists, and a <Faq /> block when asked.

Output rules:
- Return ONLY the requested format (MDX, JSON, etc.) — no preamble or commentary.`;

interface ServiceCityPageInput {
  service: { name: string; slug: string; shortDesc?: string | null };
  city: { name: string; state: string };
}

export interface GeneratedPage {
  metaTitle: string;
  metaDesc: string;
  h1: string;
  intro: string;
  bodyMdx: string;
  faq: Array<{ q: string; a: string }>;
}

export async function generateServiceCityPage(input: ServiceCityPageInput): Promise<GeneratedPage> {
  const c = getClient();
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_BRAND_BRIEF,
    messages: [
      {
        role: "user",
        content: `Write a local SEO landing page for "${input.service.name} in ${input.city.name}, ${input.city.state}".

Return strict JSON with keys: metaTitle (<=60 chars), metaDesc (<=155 chars), h1, intro (2 short paragraphs), bodyMdx (600-900 words MDX with H2/H3 and bullets — include sections: "What is ${input.service.name}?", "What to expect", "How much does it cost in ${input.city.name}?", "How to choose a provider", "Why choose a ${siteConfig.name} provider"), faq (array of 5 {q,a}).

Local context to weave in naturally: neighborhoods, climate/seasonality if relevant, local price context. End bodyMdx with a one-line CTA to "Compare top-rated providers in ${input.city.name}".

Do NOT invent specific clinics or doctors. Do NOT claim medical outcomes.`,
      },
    ],
  });
  const text = firstText(res);
  return JSON.parse(text) as GeneratedPage;
}

interface ComparisonInput {
  a: { name: string; shortDesc?: string | null };
  b: { name: string; shortDesc?: string | null };
}

export interface GeneratedComparison {
  metaTitle: string;
  metaDesc: string;
  h1: string;
  summary: string;
  pros: { a: string[]; b: string[] };
  cons: { a: string[]; b: string[] };
  table: Array<{ attribute: string; a: string; b: string }>;
  bodyMdx: string;
  faq: Array<{ q: string; a: string }>;
}

export async function generateComparison(input: ComparisonInput): Promise<GeneratedComparison> {
  const c = getClient();
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: SYSTEM_BRAND_BRIEF,
    messages: [
      {
        role: "user",
        content: `Create a comparison article: "${input.a.name} vs ${input.b.name}".

Return strict JSON with: metaTitle, metaDesc, h1, summary (2 short paragraphs), pros {a:[5], b:[5]}, cons {a:[4], b:[4]}, table (8 rows of {attribute, a, b} covering: what it treats, procedure time, downtime, onset, duration, avg cost, best candidate, maintenance), bodyMdx (700-1000 words with H2 sections "How they work", "Best candidate for each", "Cost & maintenance", "Can you combine them?", "How to decide"), faq (5 {q,a}).

Do NOT recommend either as universally better — recommend consulting a licensed provider for individual assessment.`,
      },
    ],
  });
  return JSON.parse(firstText(res)) as GeneratedComparison;
}

export async function generateBusinessDescription(name: string, services: string[], city: string): Promise<string> {
  const c = getClient();
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM_BRAND_BRIEF,
    messages: [
      {
        role: "user",
        content: `Write a neutral 80-120 word description for "${name}", a ${services.join(", ") || "aesthetics"} provider in ${city}. Include 2-3 service specialties and a closing line encouraging readers to request a consultation. No hype, no medical claims, no specific doctors. Plain text only.`,
      },
    ],
  });
  return firstText(res).trim();
}

export async function suggestInternalLinks(
  pageTitle: string,
  candidates: Array<{ title: string; href: string }>,
): Promise<Array<{ title: string; href: string; anchor: string }>> {
  const c = getClient();
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: SYSTEM_BRAND_BRIEF,
    messages: [
      {
        role: "user",
        content: `Given the page "${pageTitle}" and candidate internal links ${JSON.stringify(
          candidates,
        )}, return JSON array of up to 6 items with {title, href, anchor} — anchor is a natural phrase to link with. Prefer topically adjacent pages.`,
      },
    ],
  });
  try {
    return JSON.parse(firstText(res));
  } catch {
    return [];
  }
}

function firstText(res: Anthropic.Messages.Message): string {
  const block = res.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text block returned by Claude");
  return block.text;
}
