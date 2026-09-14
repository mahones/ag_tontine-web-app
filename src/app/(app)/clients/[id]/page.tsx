import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiEnvelope, Client, Notebook } from "@/lib/types";
import { ClientEditForm } from "../client-edit-form";
import { updateClientAction } from "../actions";

export const metadata = {
  title: "Détail client — Tontine",
};

const NOTEBOOK_STATUS_LABELS: Record<Notebook["status"], string> = {
  active: "Actif",
  completed: "Terminé",
  cancelled: "Annulé",
  closed: "Clôturé",
};

export default async function ClientDetailPage(props: PageProps<"/clients/[id]">) {
  const user = await requirePermission("view_clients");
  const { id } = await props.params;

  let client: Client;
  try {
    const response = await apiFetch<ApiEnvelope<Client>>(`/clients/${id}`);
    client = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const { data: notebooks } = await apiFetch<ApiEnvelope<Notebook[]>>(`/notebooks/client/${id}`);
  const boundUpdate = updateClientAction.bind(null, client.id);
  const canCreateNotebook = hasPermission(user, "create_notebook");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {client.first_name} {client.last_name}
        </h1>
        <p className="text-sm text-muted-foreground">{client.phone}</p>
      </div>

      <ClientEditForm
        defaultValues={{
          first_name: client.first_name,
          last_name: client.last_name,
          phone: client.phone,
          address: client.address,
        }}
        onSubmit={boundUpdate}
      />

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight">Carnets ({notebooks.length})</h2>
          {canCreateNotebook && (
            <Link href={`/clients/${client.id}/carnets/nouveau`} className={buttonVariants({ size: "sm" })}>
              <PlusIcon />
              Nouveau carnet
            </Link>
          )}
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Cotisation</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notebooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Aucun carnet pour ce client.
                  </TableCell>
                </TableRow>
              ) : (
                notebooks.map((notebook) => (
                  <TableRow key={notebook.id}>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/clients/${client.id}/carnets/${notebook.id}`} className="hover:underline">
                        {notebook.notebook_number}
                      </Link>
                    </TableCell>
                    <TableCell>{notebook.year}</TableCell>
                    <TableCell>{notebook.contribution_amount}</TableCell>
                    <TableCell>
                      <Badge variant={notebook.status === "active" ? "default" : "secondary"}>
                        {NOTEBOOK_STATUS_LABELS[notebook.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
