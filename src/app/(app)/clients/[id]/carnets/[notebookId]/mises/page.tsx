import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiEnvelope, MonthlyContribution, Notebook } from "@/lib/types";
import { ContributionAmountForm } from "./contribution-amount-form";
import { changeContributionAmountAction } from "./actions";

export const metadata = {
  title: "Mises — Tontine",
};

export default async function ContributionAmountsPage(
  props: PageProps<"/clients/[id]/carnets/[notebookId]/mises">,
) {
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

  const { data: history } = await apiFetch<ApiEnvelope<MonthlyContribution[]>>(
    `/monthly-contributions/notebook/${notebookId}`,
  );
  const canChange = hasPermission(user, "create_client");
  const boundChange = changeContributionAmountAction.bind(null, notebookId, id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mises — Carnet {notebook.notebook_number}</h1>
        <p className="text-sm text-muted-foreground">Mise actuelle : {notebook.contribution_amount}</p>
        {notebook.pending_contribution_amount && (
          <p className="text-sm text-muted-foreground">
            Nouvelle mise programmée : <span className="font-medium">{notebook.pending_contribution_amount}</span> —
            s&apos;appliquera au démarrage du prochain mois.
          </p>
        )}
      </div>

      {canChange ? (
        <ContributionAmountForm onSubmit={boundChange} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas la permission de changer la mise de ce client.
        </p>
      )}

      <div>
        <h2 className="mb-3 text-lg font-medium tracking-tight">Historique ({history.length})</h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                <TableHead>Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                    Aucune mise enregistrée pour ce carnet.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.month}</TableCell>
                    <TableCell>{entry.amount}</TableCell>
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
