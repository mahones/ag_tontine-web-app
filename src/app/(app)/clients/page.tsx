import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { isDeveloper } from "@/lib/roles";
import { buttonVariants } from "@/components/ui/button";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { Client, PaginatedEnvelope } from "@/lib/types";
import { ClientsTable } from "./clients-table";

export const metadata = {
  title: "Clients — Tontine",
};

/**
 * Développeur has no agency of their own (agency_id is null), so this
 * agency-scoped page doesn't apply to them — they reach a microfinance's
 * clients by drilling into its agencies instead (see /microfinances).
 */
export default async function ClientsPage(props: PageProps<"/clients">) {
  const user = await requirePermission("view_clients");
  if (isDeveloper(user)) redirect("/microfinances");

  const searchParams = await props.searchParams;

  // /agency/clients is gated by create_notebook, which Caissier lacks; /clients/agency/{agency}
  // is the same clientsByAgency() action (it ignores the {agency} param, using the caller's
  // own agency_id either way) but correctly gated by view_clients, matching this page's guard.
  const { data: clients, meta } = await apiFetch<PaginatedEnvelope<Client>>(
    `/clients/agency/${user.agency_id}${buildListQuery(searchParams)}`,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">Clients de votre agence.</p>
        </div>
        {hasPermission(user, "create_client") && (
          <Link href="/clients/nouveau" className={buttonVariants()}>
            <PlusIcon />
            Nouveau client
          </Link>
        )}
      </div>

      <ClientsTable clients={clients} meta={meta} initialSearch={currentSearchValue(searchParams)} />
    </div>
  );
}
