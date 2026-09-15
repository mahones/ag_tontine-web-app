import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRoundIcon } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { ApiEnvelope, Client } from "@/lib/types";
import { formatPersonName } from "@/lib/format-name";

/**
 * Wraps the client's own page and every nested route under it (carnets, cotisations, prêts,
 * retraits, mises...) with a persistent banner naming whose client this all belongs to — so
 * it stays visible no matter how deep the current page is nested.
 */
export default async function ClientLayout({
  children,
  params,
}: LayoutProps<"/clients/[id]">) {
  await requirePermission("view_clients");
  const { id } = await params;

  let client: Client;
  try {
    const response = await apiFetch<ApiEnvelope<Client>>(`/clients/${id}`);
    client = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/clients/${id}`}
        className="flex w-fit items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <UserRoundIcon className="size-4" />
        Client : <span className="font-medium text-foreground">{formatPersonName(client.first_name, client.last_name)}</span>
      </Link>

      {children}
    </div>
  );
}
