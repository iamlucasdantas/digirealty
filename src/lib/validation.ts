import { z } from "zod";

export const LeadSchema = z.object({
  firstName: z.string().min(1, "First name required").max(60),
  lastName: z.string().max(60).optional(),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^[+()\-\s\d]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP")
    .optional()
    .or(z.literal("")),
  serviceSlug: z.string().min(1),
  citySlug: z.string().optional(),
  businessSlug: z.string().optional(),
  budget: z.enum(["<500", "500-1500", "1500-5000", "5000+", "unsure"]).optional(),
  timeframe: z.enum(["immediate", "1-3m", "3-6m", "researching"]).optional(),
  message: z.string().max(2000).optional(),
  qualification: z.record(z.any()).optional(),
  landingPath: z.string().max(512).optional(),
  referrer: z.string().max(512).optional(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      content: z.string().optional(),
      term: z.string().optional(),
    })
    .optional(),
  sessionId: z.string().max(64).optional(),
  // Honeypot — bots fill this, humans don't see it. Handler inspects & silently drops.
  website: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;

export const BusinessUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  citySlug: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  bookingUrl: z.string().url().optional().or(z.literal("")),
  address1: z.string().optional(),
  zip: z.string().optional(),
  descShort: z.string().max(240).optional(),
  descLong: z.string().max(5000).optional(),
  serviceSlugs: z.array(z.string()).default([]),
  tier: z.enum(["FREE", "VERIFIED", "FEATURED", "PREMIUM"]).default("FREE"),
  status: z.enum(["DRAFT", "PUBLISHED", "SUSPENDED"]).default("PUBLISHED"),
});
export type BusinessUpsertInput = z.infer<typeof BusinessUpsertSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof LoginSchema>;
