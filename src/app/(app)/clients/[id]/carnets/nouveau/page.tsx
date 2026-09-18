import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { ApiEnvelope, Client } from "@/lib/types";
import { formatPersonName } from "@/lib/format-name";
import { NotebookCreateForm } from "../notebook-create-form";
import { createNotebookAction } from "../actions";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ClientBadge } from "@/components/client-badge";

export const metadata = {
  title: "Nouveau carnet — Tontine",
};

export default async function NewNotebookPage(props: PageProps<"/clients/[id]/carnets/nouveau">) {
  await requirePermission("create_notebook");
  const { id } = await props.params;

  let client: Client;
  try {
    const response = await apiFetch<ApiEnvelope<Client>>(`/clients/${id}`);
    client = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const boundCreate = createNotebookAction.bind(null, id);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Clients", href: "/clients" },
          { label: formatPersonName(client.first_name, client.last_name), href: `/clients/${id}` },
          { label: "Nouveau carnet" },
        ]}
      />
      <ClientBadge clientId={id} firstName={client.first_name} lastName={client.last_name} />
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
