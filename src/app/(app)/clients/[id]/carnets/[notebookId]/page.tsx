import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import type { ApiEnvelope, Notebook } from "@/lib/types";
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

  const boundUpdate = updateNotebookStatusAction.bind(null, notebook.id, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Carnet {notebook.notebook_number}</h1>
        <p className="text-sm text-muted-foreground">
          Année {notebook.year} · Cotisation {notebook.contribution_amount} · Statut actuel :{" "}
          {NOTEBOOK_STATUS_LABELS[notebook.status]}
        </p>
      </div>

      {hasPermission(user, "create_notebook") ? (
        <NotebookStatusForm defaultValues={{ status: notebook.status }} onSubmit={boundUpdate} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas la permission de modifier le statut de ce carnet.
        </p>
      )}
    </div>
  );
}
