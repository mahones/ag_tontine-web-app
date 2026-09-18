import Link from "next/link";
import { UserRoundIcon } from "lucide-react";
import { formatPersonName } from "@/lib/format-name";

/**
 * Small "Client : X" banner linking back to the client's own page — shown right after the
 * breadcrumb on every page nested under a client (carnet, cotisations, prêts, retraits,
 * mises...), so whose client this all belongs to stays visible no matter how deep the
 * current page is.
 */
export function ClientBadge({
  clientId,
  firstName,
  lastName,
}: {
  clientId: string;
  firstName: string;
  lastName: string;
}) {
  return (
    <Link
      href={`/clients/${clientId}`}
      className="flex w-fit items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <UserRoundIcon className="size-4" />
      Client : <span className="font-medium text-foreground">{formatPersonName(firstName, lastName)}</span>
    </Link>
  );
}
