import { AlertTriangleIcon, ClockIcon, DatabaseIcon, UploadCloudIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiEnvelope, SyncStatus } from "@/lib/types";
import { DashboardStatCard } from "../dashboard/dashboard-stat-card";
import { SyncConflictsTable } from "./sync-conflicts-table";

export const metadata = {
  title: "Synchronisation — Tontine",
};

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString("fr-FR") : "jamais";
}

/**
 * Vue locale uniquement (MOBILE.md §8, Phase 4) — cette page lit sync_outbox/
 * local_instance de l'instance qui répond réellement à la requête. Sur une
 * instance cloud, `deployment_mode` vaut toujours "cloud" (sync_outbox y reste
 * vide par construction) : on l'affiche comme un état vide explicite plutôt
 * que comme des compteurs à zéro qui auraient l'air d'une erreur.
 */
export default async function SynchronisationPage() {
  const user = await requirePermission("view_agency_reports");
  const { data: status } = await apiFetch<ApiEnvelope<SyncStatus>>("/agency/sync-status");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Synchronisation</h1>
        <p className="text-sm text-muted-foreground">État de la file d&apos;attente locale et des conflits.</p>
      </div>

      {status.deployment_mode !== "local" ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Cette page concerne un serveur local d&apos;agence</CardTitle>
            <CardDescription>
              Vous consultez une instance cloud — elle n&apos;a pas de file de synchronisation locale. Ouvrez cette
              page depuis le serveur local de l&apos;agence pour voir ses conflits et son état de synchro.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardStatCard
              label="En attente"
              value={status.outbox_counts.pending}
              description="À pousser vers le cloud"
              icon={ClockIcon}
            />
            <DashboardStatCard
              label="Conflits"
              value={status.outbox_counts.failed}
              description="Nécessitent une action"
              icon={AlertTriangleIcon}
            />
            <DashboardStatCard
              label="Appliqués"
              value={status.outbox_counts.applied}
              description="Confirmés côté cloud"
              icon={UploadCloudIcon}
            />
            <DashboardStatCard
              label="Ignorés"
              value={status.outbox_counts.discarded}
              description="Abandonnés définitivement"
              icon={DatabaseIcon}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dernière synchronisation</CardTitle>
              <CardDescription>
                Poussée vers le cloud : {formatDate(status.local_instance?.last_push_at ?? null)} · Données de
                référence : {formatDate(status.local_instance?.last_reference_pull_at ?? null)}
              </CardDescription>
            </CardHeader>
          </Card>

          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Conflits</h2>
            <SyncConflictsTable
              conflicts={status.conflicts}
              canManage={hasPermission(user, "manage_users")}
            />
          </div>
        </>
      )}
    </div>
  );
}
