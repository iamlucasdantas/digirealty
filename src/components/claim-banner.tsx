import Link from "next/link";
import { BadgeCheck } from "lucide-react";

interface Props {
  businessSlug: string;
}

/**
 * Shown at the top of an unclaimed business profile. Invites the real owner
 * to claim the listing — one of the main ways we convert imported directory
 * rows into active customers.
 */
export function ClaimBanner({ businessSlug }: Props) {
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="container py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="flex items-center gap-2 text-amber-900">
          <BadgeCheck className="h-4 w-4" aria-hidden />
          <span>
            <strong>Are you the owner?</strong> This listing is unclaimed. Claim it free to
            edit hours, services, and photos — and respond to matched quote requests.
          </span>
        </p>
        <Link
          href={`/claim/${businessSlug}`}
          className="shrink-0 rounded-full bg-amber-600 px-4 py-1.5 font-semibold text-white hover:bg-amber-700"
        >
          Claim this listing
        </Link>
      </div>
    </div>
  );
}
