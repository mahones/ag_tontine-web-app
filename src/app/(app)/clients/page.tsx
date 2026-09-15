import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { buttonVariants } from "@/components/ui/button";
import type { ApiEnvelope, Client } from "@/lib/types";
import { ClientsTable } from "./clients-table";

export const metadata = {
  title: "Clients — Tontine",
};

export default async function ClientsPage() {
  const user = await requirePermission("view_clients");

  // /agency/clients is gated by create_notebook, which Caissier lacks; /clients/agency/{agency}
  // is the same clientsByAgency() action (it ignores the {agency} param, using the caller's
  // own agency_id either way) but correctly gated by view_clients, matching this page's guard.
  const { data: clients } = await apiFetch<ApiEnvelope<Client[]>>(`/clients/agency/${user.agency_id}`);

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

      <ClientsTable clients={clients} />
    </div>
  );
}
