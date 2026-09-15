import { requireAgent } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import type { Client, PaginatedEnvelope } from "@/lib/types";
import { AgentClientsTable } from "./agent-clients-table";

export const metadata = {
  title: "Mes clients — Tontine",
};

/**
 * Previews the /mobile/clients/agent/{agent} route on the web console.
 */
export default async function AgentClientsPage(props: PageProps<"/agent/clients">) {
  const user = await requireAgent();

  const searchParams = await props.searchParams;
  const { data: clients, meta } = await apiFetch<PaginatedEnvelope<Client>>(
    `/mobile/clients/agent/${user.id}${buildListQuery(searchParams)}`,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes clients</h1>
        <p className="text-sm text-muted-foreground">Clients issus de vos prospects convertis.</p>
      </div>

      <AgentClientsTable clients={clients} meta={meta} initialSearch={currentSearchValue(searchParams)} />
    </div>
  );
}
