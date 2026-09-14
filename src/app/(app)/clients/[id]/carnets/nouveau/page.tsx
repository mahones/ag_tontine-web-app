import { requirePermission } from "@/lib/auth";
import { NotebookCreateForm } from "../notebook-create-form";
import { createNotebookAction } from "../actions";

export const metadata = {
  title: "Nouveau carnet — Tontine",
};

export default async function NewNotebookPage(props: PageProps<"/clients/[id]/carnets/nouveau">) {
  await requirePermission("create_notebook");
  const { id } = await props.params;

  const boundCreate = createNotebookAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau carnet</h1>
        <p className="text-sm text-muted-foreground">
          Un client possède normalement déjà un carnet créé automatiquement — ceci en ajoute
          un second.
        </p>
      </div>

      <NotebookCreateForm onSubmit={boundCreate} />
    </div>
  );
}
