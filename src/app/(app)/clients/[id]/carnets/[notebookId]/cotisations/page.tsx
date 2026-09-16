import Link from "next/link";
import { notFound } from "next/navigation";
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
import type { ApiEnvelope, Collection, MonthlyContribution, Notebook } from "@/lib/types";
import { CollectionCreateForm } from "./collection-create-form";
import { createCollectionAction } from "./actions";

export const metadata = {
  title: "Cotisations — Tontine",
};

export default async function CollectionsPage(
  props: PageProps<"/clients/[id]/carnets/[notebookId]/cotisations">,
) {
  const user = await requirePermission("view_clients");
  const { id, notebookId } = await props.params;
  const { month } = await props.searchParams;

  let notebook: Notebook;
  try {
    const response = await apiFetch<ApiEnvelope<Notebook>>(`/notebooks/${notebookId}`);
    notebook = response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const { data: months } = await apiFetch<ApiEnvelope<MonthlyContribution[]>>(
    `/monthly-contributions/notebook/${notebookId}`,
  );
  // A carnet holds up to 12 months x 31 boxes = 372 collections — this page paginates the
  // history one month at a time instead of listing everything at once. New collections
  // always land on the latest (current) month, never an older one already full.
  const latestMonth = months.reduce((max, entry) => Math.max(max, entry.month), 1);
  const selectedMonth = month && !Array.isArray(month) && Number(month) > 0 ? Number(month) : latestMonth;
  const isCurrentMonth = selectedMonth === latestMonth;

  const { data: collections } = await apiFetch<ApiEnvelope<Collection[]>>(
    `/collections/notebook/${notebookId}?month=${selectedMonth}`,
  );
  const canRegister = hasPermission(user, "register_contribution_agence");
  const boundCreate = createCollectionAction.bind(null, notebookId, id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cotisations — Carnet {notebook.notebook_number}</h1>
        <p className="text-sm text-muted-foreground">
          Cotisation mensuelle actuelle : {notebook.contribution_amount}
        </p>
      </div>

      {isCurrentMonth ? (
        canRegister ? (
          <CollectionCreateForm contributionAmount={Number(notebook.contribution_amount)} onSubmit={boundCreate} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Vous n&apos;avez pas la permission d&apos;enregistrer une cotisation.
          </p>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          Mois {selectedMonth} déjà clos — les nouvelles cotisations sont toujours ajoutées au
          mois en cours (mois {latestMonth}).
        </p>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight">
            Historique du mois {selectedMonth} ({collections.length})
          </h2>
          {months.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {months.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/clients/${id}/carnets/${notebookId}/cotisations?month=${entry.month}`}
                  className={buttonVariants({
                    variant: entry.month === selectedMonth ? "default" : "outline",
                    size: "sm",
                  })}
                >
                  Mois {entry.month}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Case n°</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Enregistrée par</TableHead>
                <TableHead>Effets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Aucune cotisation enregistrée pour ce mois.
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(collection.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>{collection.box_number}</TableCell>
                    <TableCell>{collection.amount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {collection.user ? `${collection.user.first_name} ${collection.user.last_name}` : "—"}
                    </TableCell>
                    <TableCell className="space-x-1">
                      {collection.agency_box && <Badge variant="secondary">Case agence</Badge>}
                      {collection.repayment_made && <Badge variant="secondary">Affectée au remboursement</Badge>}
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
