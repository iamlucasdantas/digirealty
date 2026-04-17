import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/ads", label: "Ads" },
  { href: "/admin/revenue", label: "Revenue" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    redirect("/login?next=/admin");
  }

  return (
    <div className="container py-10 grid md:grid-cols-[220px,1fr] gap-10">
      <aside className="md:sticky md:top-24 h-fit">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Admin</p>
        <nav className="mt-3 flex md:flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink/5"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-xs text-ink-muted">Signed in as {session.email}</p>
        <form action="/api/auth/logout" method="post" className="mt-2">
          <button className="text-xs font-semibold text-ink-muted hover:text-ink">Sign out</button>
        </form>
      </aside>
      <section>{children}</section>
    </div>
  );
}
