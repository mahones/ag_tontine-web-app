import { requireAgent } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ApiEnvelope, Client } from "@/lib/types";
import { AgentClientsTable } from "./agent-clients-table";

export const metadata = {
  title: "Mes clients — Tontine",
};

/**
 * Previews the /mobile/clients/agent/{agent} route on the web console.
 */
export default async function AgentClientsPage() {
  const user = await requireAgent();

  const { data: clients } = await apiFetch<ApiEnvelope<Client[]>>(`/mobile/clients/agent/${user.id}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes clients</h1>
        <p className="text-sm text-muted-foreground">Clients issus de vos prospects convertis.</p>
      </div>

      <AgentClientsTable clients={clients} />
    </div>
  );
}
