import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { buildListQuery, currentSearchValue } from "@/lib/list-query";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiEnvelope, Agency, Client, DashboardStats, ManagedUser, Notebook, PaginatedEnvelope } from "@/lib/types";
import { DashboardStatsGrid } from "@/app/(app)/dashboard/dashboard-stats-grid";
import { AgencyPersonnelTable } from "./agency-personnel-table";
import { ClientsTable } from "@/app/(app)/clients/clients-table";

export const metadata = {
  title: "Détail de l'agence — Tontine",
};

const NOTEBOOK_STATUS_LABELS: Record<Notebook["status"], string> = {
  active: "Actif",
  completed: "Terminé",
  cancelled: "Annulé",
  closed: "Clôturé",
};

const STAFF_PARAMS = { page: "staff_page", search: "staff_search" };
const CLIENTS_PARAMS = { page: "clients_page", search: "clients_search" };

export default async function AgencyDetailPage(
  props: PageProps<"/microfinances/[id]/agences/[agencyId]">,
) {
  await requireDeveloper();
  const { id, agencyId } = await props.params;
  const searchParams = await props.searchParams;

  // /agencies/{id}, /notebooks and /users/clients are all fetched agency-scoped now: the
  // single agency by ID, notebooks via ?agency_id=, and staff/clients paginated via
  // ?agency_id=&page=&per_page= — this is also the only place a Développeur reaches an
  // agency's staff/clients, there being no direct, cross-microfinance "Utilisateurs" list in
  // their own nav.
  let agency: Agency;
  try {
    const response = await apiFetch<ApiEnvelope<Agency>>(`/agencies/${agencyId}`);
    agency = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  if (agency.microfinance?.id !== id) notFound();

  const [{ data: notebooks }, staffResponse, clientsResponse, { data: stats }] = await Promise.all([
    apiFetch<ApiEnvelope<Notebook[]>>(`/notebooks?agency_id=${agencyId}`),
    apiFetch<PaginatedEnvelope<ManagedUser>>(
      `/users?agency_id=${agencyId}&${buildListQuery(searchParams, 15, STAFF_PARAMS).slice(1)}`,
    ),
    apiFetch<PaginatedEnvelope<Client>>(
      `/clients?agency_id=${agencyId}&${buildListQuery(searchParams, 15, CLIENTS_PARAMS).slice(1)}`,
    ),
    apiFetch<ApiEnvelope<DashboardStats>>(`/agencies/${agencyId}/stats`),
  ]);

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsGrid stats={stats} />
        <Card>
          <CardHeader>
            <CardDescription>Personnel</CardDescription>
            <CardTitle className="text-3xl">{staffResponse.meta.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Personnes inscrites</CardDescription>
            <CardTitle className="text-3xl">{clientsResponse.meta.total}</CardTitle>
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

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight">Personnel ({staffResponse.meta.total})</h2>
          <Link href="/utilisateurs/nouveau" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <PlusIcon />
            Nouvel utilisateur
          </Link>
        </div>
        <AgencyPersonnelTable
          staff={staffResponse.data}
          meta={staffResponse.meta}
          initialSearch={currentSearchValue(searchParams, STAFF_PARAMS.search)}
          paramNames={STAFF_PARAMS}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium tracking-tight">Clients ({clientsResponse.meta.total})</h2>
        <ClientsTable
          clients={clientsResponse.data}
          meta={clientsResponse.meta}
          initialSearch={currentSearchValue(searchParams, CLIENTS_PARAMS.search)}
          paramNames={CLIENTS_PARAMS}
        />
      </div>
    </div>
  );
}
