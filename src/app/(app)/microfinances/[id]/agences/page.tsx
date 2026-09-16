import { notFound } from "next/navigation";
import { requireDeveloper } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { daysUntil, pickCurrentLicence } from "@/lib/licence";
import { Badge } from "@/components/ui/badge";
import type { ApiEnvelope, Agency, DashboardStats, Licence, Microfinance } from "@/lib/types";
import { LICENCE_STATUS_LABELS } from "@/app/(app)/licences/schema";
import { DashboardStatsGrid } from "@/app/(app)/dashboard/dashboard-stats-grid";
import { MicrofinanceAgencesTable } from "./microfinance-agences-table";

export const metadata = {
  title: "Agences de la microfinance — Tontine",
};

export default async function MicrofinanceAgencesPage(props: PageProps<"/microfinances/[id]/agences">) {
  await requireDeveloper();
  const { id } = await props.params;

  let microfinance: Microfinance;
  try {
    const response = await apiFetch<ApiEnvelope<Microfinance>>(`/microfinances/${id}`);
    microfinance = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // Dev-only /agencies and /licences return every record platform-wide (no agency- or
  // microfinance-scoped list route exists) — filtered client-side here (both are small,
  // bounded datasets). /microfinances/{id}/stats is the same financial/operational snapshot
  // as the main dashboard's, scoped to this microfinance alone.
  const [{ data: allAgencies }, { data: allLicences }, { data: stats }] = await Promise.all([
    apiFetch<ApiEnvelope<Agency[]>>("/agencies"),
    apiFetch<ApiEnvelope<Licence[]>>("/licences"),
    apiFetch<ApiEnvelope<DashboardStats>>(`/microfinances/${id}/stats`),
  ]);

  const agencies = allAgencies.filter((agency) => agency.microfinance?.id === id);
  const licences = allLicences.filter((licence) => licence.microfinance_id === id);
  const currentLicence = pickCurrentLicence(licences);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{microfinance.name}</h1>
          <p className="font-mono text-sm text-muted-foreground">{microfinance.code}</p>
        </div>
        <LicenceStatusCard licence={currentLicence} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsGrid stats={stats} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium tracking-tight">
          Agences ({agencies.length})
        </h2>
        <MicrofinanceAgencesTable microfinanceId={id} agencies={agencies} />
      </div>
    </div>
  );
}

function LicenceStatusCard({ licence }: { licence: Licence | null }) {
  if (!licence) {
    return <Badge variant="secondary">Aucune licence enregistrée</Badge>;
  }

  const remaining = daysUntil(licence.end_date);
  const expired = remaining < 0 || licence.status !== "active";

  return (
    <div className="text-right">
      <Badge variant={expired ? "destructive" : remaining <= 30 ? "secondary" : "default"}>
        {LICENCE_STATUS_LABELS[licence.status]}
      </Badge>
      <p className="mt-1 text-sm text-muted-foreground">
        {licence.status === "active"
          ? remaining >= 0
            ? `Expire dans ${remaining} jour${remaining === 1 ? "" : "s"} (${licence.end_date})`
            : `Expirée depuis ${Math.abs(remaining)} jour${Math.abs(remaining) === 1 ? "" : "s"} (${licence.end_date})`
          : `Fin de période : ${licence.end_date}`}
      </p>
    </div>
  );
}
