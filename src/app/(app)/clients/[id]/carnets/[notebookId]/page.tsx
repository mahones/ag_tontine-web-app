import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiEnvelope, Notebook, NotebookState } from "@/lib/types";
import { NOTEBOOK_STATUS_LABELS } from "../schema";
import { NotebookStatusForm } from "../notebook-status-form";
import { updateNotebookStatusAction } from "../actions";

export const metadata = {
  title: "Détail carnet — Tontine",
};

export default async function NotebookDetailPage(props: PageProps<"/clients/[id]/carnets/[notebookId]">) {
  const user = await requirePermission("view_clients");
  const { id, notebookId } = await props.params;

  let notebook: Notebook;
  try {
    const response = await apiFetch<ApiEnvelope<Notebook>>(`/notebooks/${notebookId}`);
    notebook = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const { data: state } = await apiFetch<ApiEnvelope<NotebookState>>(`/notebooks/${notebookId}/state`);
  const boundUpdate = updateNotebookStatusAction.bind(null, notebook.id, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Carnet {notebook.notebook_number}</h1>
        <p className="text-sm text-muted-foreground">
          Année {notebook.year} · Cotisation {notebook.contribution_amount} · Statut actuel :{" "}
          {NOTEBOOK_STATUS_LABELS[notebook.status]}
        </p>
        <p className="text-sm text-muted-foreground">Agence : {state.agency_name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Montant total cotisé</CardDescription>
            <CardTitle className="text-3xl">{state.total_amount_collected}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cases cochées</CardDescription>
            <CardTitle className="text-3xl">{state.total_boxes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cases agence</CardDescription>
            <CardTitle className="text-3xl">{state.agency_boxes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Mois écoulés</CardDescription>
            <CardTitle className="text-3xl">{state.months_count}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Mois restants</CardDescription>
            <CardTitle className="text-3xl">{state.months_remaining}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {hasPermission(user, "create_notebook") ? (
        <NotebookStatusForm defaultValues={{ status: notebook.status }} onSubmit={boundUpdate} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas la permission de modifier le statut de ce carnet.
        </p>
      )}

      <div className="flex gap-2">
        <Link
          href={`/clients/${id}/carnets/${notebook.id}/cotisations`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voir les cotisations
        </Link>
        <Link
          href={`/clients/${id}/carnets/${notebook.id}/prets`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voir les prêts
        </Link>
        <Link
          href={`/clients/${id}/carnets/${notebook.id}/retraits`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voir les retraits
        </Link>
        <Link
          href={`/clients/${id}/carnets/${notebook.id}/mises`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voir les mises
        </Link>
      </div>
    </div>
  );
}
