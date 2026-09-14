import { notFound } from "next/navigation";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiEnvelope, Agency, Client, Notebook } from "@/lib/types";

export const metadata = {
  title: "Détail de l'agence — Tontine",
};

const NOTEBOOK_STATUS_LABELS: Record<Notebook["status"], string> = {
  active: "Actif",
  completed: "Terminé",
  cancelled: "Annulé",
  closed: "Clôturé",
};

export default async function AgencyDetailPage(
  props: PageProps<"/microfinances/[id]/agences/[agencyId]">,
) {
  await requireDeveloper();
  const { id, agencyId } = await props.params;

  // Dev-only /agencies, /clients and /notebooks return every record platform-wide (no
  // agency-scoped list route or stats endpoint exists) — filtered/aggregated client-side.
  const [{ data: allAgencies }, { data: allClients }, { data: allNotebooks }] = await Promise.all([
    apiFetch<ApiEnvelope<Agency[]>>("/agencies"),
    apiFetch<ApiEnvelope<Client[]>>("/clients"),
    apiFetch<ApiEnvelope<Notebook[]>>("/notebooks"),
  ]);

  const agency = allAgencies.find((candidate) => candidate.id === agencyId && candidate.microfinance?.id === id);
  if (!agency) notFound();

  const clients = allClients.filter((client) => client.agency_id === agencyId);
  const notebooks = allNotebooks.filter((notebook) => notebook.agency_id === agencyId);
  const activeNotebooks = notebooks.filter((notebook) => notebook.status === "active");

  const notebooksByStatus = notebooks.reduce<Record<string, number>>((acc, notebook) => {
    acc[notebook.status] = (acc[notebook.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{agency.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">{agency.code_agency}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {agency.address} · {agency.phone}
          {agency.currency && ` · ${agency.currency.code}`}
        </p>
        {agency.is_headquarters && (
          <Badge variant="default" className="mt-2">
            Siège
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Personnes inscrites</CardDescription>
            <CardTitle className="text-3xl">{clients.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Comptes actifs</CardDescription>
            <CardTitle className="text-3xl">{activeNotebooks.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {notebooks.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-medium tracking-tight">
            Carnets par statut ({notebooks.length} au total)
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(notebooksByStatus).map(([status, count]) => (
              <Badge key={status} variant={status === "active" ? "default" : "secondary"}>
                {NOTEBOOK_STATUS_LABELS[status as Notebook["status"]] ?? status} : {count}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
