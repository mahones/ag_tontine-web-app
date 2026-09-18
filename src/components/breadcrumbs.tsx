import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  /** Omitted (or on the last item) renders as plain text — the current page. */
  href?: string;
};

/**
 * Per-page navigation trail (e.g. Clients > Jean Dupont > Carnet 042 > Cotisations).
 * Rendered by each page (not the persistent app header, which is a Server Component
 * with no access to entity names fetched deeper in the tree) but the negative margins
 * below bleed it out of <main>'s own padding so it sits flush against the header —
 * full width, directly under the topbar on every page. Must be the first thing a page
 * (or its layout, see clients/[id]/layout.tsx) renders for that to hold.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="-mx-4 -mt-4 mb-6 flex flex-wrap items-center gap-1.5 bg-background px-4 py-3 text-sm md:-mx-6 md:-mt-6 md:px-6"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-medium text-secondary" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
