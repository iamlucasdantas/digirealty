import "server-only";

/**
 * Thin ESP adapter. Beehiiv is the primary target — ConvertKit works too.
 * If no API key is set, we still persist to our Subscriber table so we don't
 * lose signups while the ESP is being set up.
 */
export interface SyncResult {
  externalId?: string;
  skipped?: boolean;
  error?: string;
}

export async function syncSubscriberToEsp(input: {
  email: string;
  firstName?: string;
  tags?: string[];
  utmSource?: string;
}): Promise<SyncResult> {
  const beehiiv = process.env.BEEHIIV_API_KEY;
  const beehiivPub = process.env.BEEHIIV_PUBLICATION_ID;

  if (beehiiv && beehiivPub) {
    try {
      const res = await fetch(
        `https://api.beehiiv.com/v2/publications/${beehiivPub}/subscriptions`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${beehiiv}`,
          },
          body: JSON.stringify({
            email: input.email,
            reactivate_existing: false,
            send_welcome_email: true,
            utm_source: input.utmSource ?? "theaestheticsatlas",
            custom_fields: input.firstName
              ? [{ name: "First Name", value: input.firstName }]
              : undefined,
          }),
        },
      );
      if (!res.ok) {
        return { error: `beehiiv:${res.status}` };
      }
      const data = (await res.json()) as { data?: { id?: string } };
      return { externalId: data.data?.id };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "unknown" };
    }
  }

  // ConvertKit fallback
  const ck = process.env.CONVERTKIT_API_KEY;
  const ckForm = process.env.CONVERTKIT_FORM_ID;
  if (ck && ckForm) {
    try {
      const res = await fetch(`https://api.convertkit.com/v3/forms/${ckForm}/subscribe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          api_key: ck,
          email: input.email,
          first_name: input.firstName,
          tags: input.tags,
        }),
      });
      if (!res.ok) return { error: `convertkit:${res.status}` };
      const data = (await res.json()) as { subscription?: { subscriber?: { id?: number } } };
      return { externalId: String(data.subscription?.subscriber?.id ?? "") };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "unknown" };
    }
  }

  return { skipped: true };
}
